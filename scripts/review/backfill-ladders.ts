/**
 * One-time backfill: rebuild entry/exit/stop ladders from the DAS logs in Drive and
 * write them onto the WIP sheet. Dry-run unless --write is passed.
 *   node --experimental-strip-types scripts/review/backfill-ladders.ts [--write]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
import { parseFullLog, buildLadders, fmtFills, fmtBrackets, normTime,
         type TradeLadder } from "../../web/lib/trade-journal/order-ladder.ts";

const arg = (k: string, d: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const TAB = arg("tab", "WIP-U16632046-GURI");
const ACCT = arg("acct", "U16632046");
const DAS_FOLDER = "13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH";
const WRITE = process.argv.includes("--write");

const NEW_COLS = [
  "Entry Ladder", "Exit Ladder", "Stop Ladder", "# Entries", "# Exits",
  "First Entry", "Initial Stop", "Initial Risk ($)", "Max Risk At Stake ($)",
  "Stop Raises", "Stopped Out?", "Risk Basis",
];
const f = (x: number | null, d = 2) => (x == null || isNaN(x) ? "" : Number(x.toFixed(d)));

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const SS = env.GOOGLE_SPREADSHEET_ID;

  // --- sheet ---
  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!A1:EZ1000`,
    { headers: H })).json();
  const rows: string[][] = got.values || [];
  let hdr = rows[0].slice();
  const body = rows.slice(1);
  console.log(`${TAB}: ${body.length} rows, ${hdr.length} columns`);

  // --- drive index ---
  const q = encodeURIComponent(`'${DAS_FOLDER}' in parents and trashed=false`);
  const dr: any = await (await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1000`, { headers: H })).json();
  // Filenames come in two shapes: "2026-08-05-trade-log.csv" and "trade-log-july-30.csv".
  const MON: Record<string, number> = { january:1, february:2, march:3, april:4, may:5, june:6,
    july:7, august:8, september:9, october:10, november:11, december:12 };
  const dateOf = (n: string): string | null => {
    const iso = n.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const named = n.match(/([a-z]+)-(\d{2})/i);
    if (named && MON[named[1].toLowerCase()])
      return `2026-${String(MON[named[1].toLowerCase()]).padStart(2, "0")}-${named[2]}`;
    return null;
  };
  // One un-dated export; its contents identify it.
  const ALIAS: Record<string, string> = { "trade-log.csv": "2026-05-06" };
  // Several dates have more than one export (a re-pull, or a "-actual" correction).
  // Merge every file for a date and dedupe identical rows rather than picking one —
  // 2026-05-29 has two files where neither is a superset of the other.
  const byDate = new Map<string, { id: string; name: string }[]>();
  for (const file of dr.files || []) {
    const d = ALIAS[file.name] ?? dateOf(file.name);
    if (!d) continue;
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(file);
  }

  const dates = [...new Set(body.map((r) => (r[0] || "").trim()))].filter(Boolean).sort();
  const patch = new Map<number, Record<string, string | number>>();
  let matched = 0, unmatched: string[] = [], noLog: string[] = [];

  for (const date of dates) {
    const files = byDate.get(date);
    const sheetRows = body.map((r, i) => ({ r, i })).filter((x) => (x.r[0] || "").trim() === date);
    if (!files?.length) { noLog.push(`${date} (${sheetRows.length} trades)`); continue; }
    // Merge the day's exports by per-key MAX COUNT, not set-union. A naive unique-row
    // dedupe collapses legitimate repeat fills (two identical prints of the same order in
    // one second), which silently drops executions and breaks round-trip matching. Max-count
    // keeps within-file repeats while not double-counting a byte-identical re-export.
    const key = (r: any) => `${r.time}|${r.event}|${r.side}|${r.symbol}|${r.shares}|${r.price}|${r.account}`;
    const perFile: any[][] = [];
    for (const file of files) {
      const csv = await (await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: H })).text();
      perFile.push(parseFullLog(csv));
    }
    const maxCount = new Map<string, number>();
    for (const rows of perFile) {
      const c = new Map<string, number>();
      for (const r of rows) c.set(key(r), (c.get(key(r)) ?? 0) + 1);
      for (const [k, v] of c) maxCount.set(k, Math.max(maxCount.get(k) ?? 0, v));
    }
    const usedCount = new Map<string, number>();
    const parsed: any[] = [];
    for (const rows of perFile) {
      for (const r of rows) {
        const k = key(r);
        const u = usedCount.get(k) ?? 0;
        if (u < (maxCount.get(k) ?? 0)) { parsed.push(r); usedCount.set(k, u + 1); }
      }
    }
    if (files.length > 1) console.log(`     note: ${date} merged ${files.length} exports -> ${parsed.length} rows`);
    // 2026-07-30 is the handover day: the fills were executed in the OLD practice account
    // (TRPCT1541) but recorded in the live sheet. Fall back to an unfiltered read when the
    // requested account has no rows, and say so rather than silently dropping the day.
    let ladders = buildLadders(parsed, ACCT);
    if (!ladders.length) {
      const accts = [...new Set(parsed.map((r) => r.account).filter(Boolean))];
      ladders = buildLadders(parsed);
      if (ladders.length) console.log(`     note: ${date} has no ${ACCT} rows; using account(s) ${accts.join(",")}`);
    }
    const used = new Set<TradeLadder>();
    for (const { r, i } of sheetRows) {
      const sym = (r[1] || "").trim(), t = normTime(r[2] || "");
      const lad = ladders.find((l) => !used.has(l) && l.symbol === sym && normTime(l.entryTime) === t);
      if (!lad) { unmatched.push(`${date} ${sym} ${t}`); continue; }
      used.add(lad); matched++;
      patch.set(i, {
        "Entry Ladder": fmtFills(lad.entries),
        "Exit Ladder": fmtFills(lad.exits),
        "Stop Ladder": fmtBrackets(lad.stops),
        "# Entries": lad.entries.length,
        "# Exits": lad.exits.length,
        "First Entry": f(lad.entries[0]?.price ?? null),
        "Initial Stop": f(lad.initialStop),
        "Initial Risk ($)": f(lad.initialRisk),
        "Max Risk At Stake ($)": f(lad.maxRiskAtStake),
        "Stop Raises": lad.stopRaises,
        "Stopped Out?": lad.everStoppedOut ? "Y" : "N",
        "Risk Basis": lad.riskBasis,
      });
    }
    const extra = ladders.filter((l) => !used.has(l));
    console.log(`  ${date}: ${sheetRows.length} sheet / ${ladders.length} log → matched ${sheetRows.length - unmatched.filter(u=>u.startsWith(date)).length}` +
      (extra.length ? `   [${extra.length} log-only: ${extra.map(e => e.symbol).join(",")}]` : ""));
  }

  console.log(`\nMATCHED ${matched}/${body.length}`);
  if (noLog.length) console.log("NO DAS LOG:", noLog.join(" | "));
  if (unmatched.length) console.log("UNMATCHED:", unmatched.join(" | "));

  if (!WRITE) { console.log("\n(dry run — pass --write to apply)"); return; }

  // --- append headers if missing ---
  const missing = NEW_COLS.filter((c) => !hdr.includes(c));
  if (missing.length) {
    const start = hdr.length;
    // The grid is fixed-width; widen it before writing past the last column.
    const smeta: any = await (await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SS}?fields=sheets.properties`, { headers: H })).json();
    const props = smeta.sheets.map((x: any) => x.properties).find((x: any) => x.title === TAB);
    const need = start + missing.length - props.gridProperties.columnCount;
    if (need > 0) {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}:batchUpdate`, {
        method: "POST", headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{ appendDimension: {
          sheetId: props.sheetId, dimension: "COLUMNS", length: need } }] }),
      });
      const j: any = await res.json();
      console.log(`widened grid by ${need} columns${j.error ? " ERROR " + JSON.stringify(j.error) : ""}`);
    }
    hdr = [...hdr, ...missing];
    const colA1 = (n: number) => { let s = ""; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
    const hres = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!${colA1(start)}1?valueInputOption=RAW`,
      { method: "PUT", headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [missing] }) });
    const hj: any = await hres.json();
    console.log(`appended ${missing.length} headers at column ${colA1(start)}${hj.error ? " ERROR " + JSON.stringify(hj.error) : ""}`);
  }
  const idx: Record<string, number> = {}; hdr.forEach((h, i) => idx[h] = i);
  const colA1 = (n: number) => { let s = ""; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

  const data: any[] = [];
  for (const [i, vals] of patch) {
    for (const [k, v] of Object.entries(vals)) {
      data.push({ range: `${TAB}!${colA1(idx[k])}${i + 2}`, values: [[v]] });
    }
  }
  for (let i = 0; i < data.length; i += 400) {
    const chunk = data.slice(i, i + 400);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values:batchUpdate`,
      { method: "POST", headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ valueInputOption: "RAW", data: chunk }) });
    const j: any = await res.json();
    console.log(`  wrote ${chunk.length} cells${j.error ? " ERROR " + JSON.stringify(j.error) : ""}`);
  }
  console.log(`\nDONE — ${patch.size} rows updated on ${TAB}`);
})();
