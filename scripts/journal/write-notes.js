// Writes a day's spoken-journal notes (_journal\<date>.notes.json) into the trade journal sheet.
//
//   node scripts/journal/write-notes.js <notes.json>            dry run: shows every cell it would write
//   node scripts/journal/write-notes.js <notes.json> --write    writes, then reads the cells back
//
// notes.json: { "date": "2026-10-02", "account": "TRPCT1646",
//               "trades": [{ "symbol": "HOOD", "entryTime": "09:31:20", "fields": { "Notes": "...", ... } }] }
//
// Columns are found BY NAME (case/punctuation-insensitive, so "Pre-trade notes" finds "Pre-Trade Notes");
// the sheet has unmanaged columns, so positions are never assumed. A field whose column doesn't exist
// is reported and skipped. Rules per cell:
//   - free text (Notes, Pre-Trade Notes, ...): blank -> set; else append "existing | new" (skipped if already there)
//   - Tags: merged as a comma list
//   - anything else (Setup, Process Followed?, Right Theory, ...): blank -> set; a different existing
//     value is a conflict and is left alone (reported).
const fs = require("fs");
require("./http.js"); // fetch on Node 16
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("../review/env.js");

const APPEND_FIELDS = new Set(["notes", "pretradenotes"]);
const key = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function normDate(v) {
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  return s;
}
function normTime(v) {
  const m = String(v).trim().match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)?$/i);
  if (!m) return String(v).trim();
  let h = +m[1];
  if (m[4]) h = (h % 12) + (/pm/i.test(m[4]) ? 12 : 0);
  return `${h}:${+m[2]}:${+m[3]}`;
}
function colLetter(i) {
  let s = "";
  for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}

async function api(token, path, opts = {}) {
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j));
  return j;
}

async function main() {
  const [file, flag] = process.argv.slice(2);
  if (!file) throw new Error("usage: write-notes.js <notes.json> [--write]");
  const write = flag === "--write";
  const notes = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  if (!fs.existsSync(ENV_PATH)) throw new Error(`${ENV_PATH} missing - copy web/.env.local from the Mac repo`);
  const env = parseEnvLocal(ENV_PATH);
  const token = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const id = env.GOOGLE_SPREADSHEET_ID;

  // Same rule as findTabByAccountPrefix in web/lib/trade-journal/google-sheets.ts; never an OLD- tab.
  const meta = await api(token, `${id}?fields=sheets.properties.title`);
  const tab = meta.sheets.map((s) => s.properties.title)
    .find((t) => !t.startsWith("OLD-") && (t === notes.account || t.startsWith(`${notes.account}-`)));
  if (!tab) throw new Error(`no tab for account ${notes.account}`);

  const range = encodeURIComponent(`'${tab}'`);
  const rows = (await api(token, `${id}/values/${range}?valueRenderOption=FORMATTED_VALUE`)).values || [];
  const header = rows[0] || [];
  const col = {};
  header.forEach((h, i) => { if (h && col[key(h)] === undefined) col[key(h)] = i; });
  for (const need of ["Date", "Symbol", "Entry Time"])
    if (col[key(need)] === undefined) throw new Error(`header "${need}" not found in ${tab}`);

  const updates = [], report = [];
  for (const t of notes.trades) {
    const matches = [];
    rows.forEach((r, i) => {
      if (i === 0) return;
      if (normDate(r[col.date] || "") === normDate(notes.date) &&
          String(r[col.symbol] || "").trim().toUpperCase() === t.symbol.toUpperCase() &&
          normTime(r[col.entrytime] || "") === normTime(t.entryTime)) matches.push(i);
    });
    const label = `${t.entryTime} ${t.symbol}`;
    if (matches.length !== 1) { report.push(`${label}: ${matches.length} matching rows - SKIPPED`); continue; }
    const ri = matches[0], row = rows[ri];
    for (const [field, value] of Object.entries(t.fields)) {
      if (value === "" || value == null) continue;
      const ci = col[key(field)];
      if (ci === undefined) { report.push(`${label}: no column "${field}" - skipped`); continue; }
      const cur = String(row[ci] || "").trim();
      let next;
      if (!cur) next = value;
      else if (key(field) === "tags") {
        const have = cur.split(",").map((s) => s.trim()).filter(Boolean);
        const add = value.split(",").map((s) => s.trim()).filter((s) => s && !have.includes(s));
        next = add.length ? [...have, ...add].join(", ") : null;
      } else if (APPEND_FIELDS.has(key(field))) next = cur.includes(value) ? null : `${cur} | ${value}`;
      else if (cur === value) next = null;
      else { report.push(`${label}: ${field} already "${cur}" (wanted "${value}") - left alone`); continue; }
      if (next === null) continue;
      const a1 = `'${tab}'!${colLetter(ci)}${ri + 1}`;
      updates.push({ range: a1, values: [[next]] });
      report.push(`${label}: ${field} @ ${colLetter(ci)}${ri + 1} = ${next}`);
    }
  }
  console.log(`tab ${tab}\n` + report.join("\n"));
  // A trade with no matching row (not imported yet) must not let the day count as written.
  if (report.some((l) => l.endsWith("SKIPPED"))) process.exitCode = 1;
  if (!write) { console.log(`\ndry run: ${updates.length} cells. Re-run with --write.`); return; }
  if (!updates.length) return;
  await api(token, `${id}/values:batchUpdate`, {
    method: "POST", body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: updates }),
  });
  const back = await api(token, `${id}/values:batchGet?` +
    updates.map((u) => `ranges=${encodeURIComponent(u.range)}`).join("&"));
  const bad = back.valueRanges.filter((v, i) => String(v.values?.[0]?.[0] ?? "") !== String(updates[i].values[0][0]));
  if (bad.length) process.exitCode = 1;
  console.log(bad.length ? `\nREAD-BACK MISMATCH on ${bad.map((b) => b.range).join(", ")}` : `\n${updates.length} cells written, read back OK`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
