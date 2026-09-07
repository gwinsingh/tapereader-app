/**
 * Auto-derive `R (Risk)` from the reconstructed order ladder.
 *
 * The trader sizes every entry to a constant dollar risk by setting the stop first and
 * letting the platform compute shares. `Initial Risk ($)` = (first entry price - real
 * initial stop) x first-entry shares is therefore the risk he actually committed —
 * measured, not typed. Hand-typing it produced size-preset errors (2026-08-13 SPY and
 * QQQ were deliberate full-size entries logged as half), which this removes.
 *
 * Only `R (Risk)` is written: `P&L (R)` is a live formula (=P&L/R) and recalculates
 * itself. The `Stop` formula is repointed at the real `Initial Stop`, falling back to
 * the old derivation when no ladder exists.
 *
 *   node --experimental-strip-types scripts/review/auto-risk.ts [--write]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");

const TAB = "WIP-U16632046-GURI";
const WRITE = process.argv.includes("--write");
const num = (s: any) => { if (s == null || s === "") return NaN;
  const t = String(s).replace(/[$,%\s]/g, ""); return (t === "" || t === "N/A") ? NaN : parseFloat(t); };
const colA1 = (n: number) => { let s = ""; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const SS = env.GOOGLE_SPREADSHEET_ID;
  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!A1:DZ200`, { headers: H })).json();
  let hdr: string[] = got.values[0].slice();
  const body: string[][] = got.values.slice(1).filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim());
  const I: Record<string, number> = {}; hdr.forEach((h, i) => I[h] = i);

  let changed = 0, same = 0, manual = 0;
  const diffs: string[] = [];
  const updates: { row: number; risk: number }[] = [];
  body.forEach((r, i) => {
    const ir = num(r[I["Initial Risk ($)"]]);
    const lr = num(r[I["R (Risk)"]]);
    if (isNaN(ir)) { manual++; return; }
    updates.push({ row: i + 2, risk: ir });
    if (isNaN(lr) || Math.abs(ir - lr) >= 0.005) {
      changed++;
      const pnl = num(r[I["P&L"]]);
      if (!isNaN(lr) && Math.abs(ir - lr) / lr > 0.15)
        diffs.push(`  ${r[0]} ${(r[1] || "").padEnd(6)} R $${lr} -> $${ir.toFixed(2)}   ` +
          `${(pnl / lr).toFixed(2)}R -> ${(pnl / ir).toFixed(2)}R`);
    } else same++;
  });
  console.log(`${updates.length} rows get an auto R  (${changed} change, ${same} already match)  |  ${manual} stay manual (no ladder)`);
  console.log("\nmaterial changes (>15%):");
  diffs.forEach((d) => console.log(d));

  const oldSum = body.reduce((a, r) => { const p = num(r[I["P&L"]]), l = num(r[I["R (Risk)"]]);
    return a + (isNaN(p) || isNaN(l) ? 0 : p / l); }, 0);
  const newSum = body.reduce((a, r) => { const p = num(r[I["P&L"]]);
    const l = num(r[I["Initial Risk ($)"]]); const f = isNaN(l) ? num(r[I["R (Risk)"]]) : l;
    return a + (isNaN(p) || isNaN(f) ? 0 : p / f); }, 0);
  console.log(`\nmonth sumR:  as logged ${oldSum.toFixed(1)}R   ->   on measured risk ${newSum.toFixed(1)}R`);

  if (!WRITE) { console.log("\n(dry run — pass --write to apply)"); return; }

  // Risk Source column, so a manually-kept row is visible
  if (!hdr.includes("Risk Source")) {
    const start = hdr.length;
    const smeta: any = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}?fields=sheets.properties`, { headers: H })).json();
    const props = smeta.sheets.map((x: any) => x.properties).find((x: any) => x.title === TAB);
    const need = start + 1 - props.gridProperties.columnCount;
    if (need > 0) await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}:batchUpdate`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ appendDimension: { sheetId: props.sheetId, dimension: "COLUMNS", length: need } }] }) });
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!${colA1(start)}1?valueInputOption=RAW`,
      { method: "PUT", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ values: [["Risk Source"]] }) });
    hdr = [...hdr, "Risk Source"]; hdr.forEach((h, i) => I[h] = i);
    console.log(`appended Risk Source at ${colA1(start)}`);
  }

  const R = colA1(I["R (Risk)"]), G = colA1(I["Shares"]), Hc = colA1(I["Avg Entry"]),
        F = colA1(I["Side"]), IS = colA1(I["Initial Stop"]);
  const data: any[] = [];
  for (const u of updates) {
    data.push({ range: `${TAB}!${R}${u.row}`, values: [[u.risk]] });
    data.push({ range: `${TAB}!${colA1(I["Risk Source"])}${u.row}`, values: [["auto (ladder)"]] });
    // Stop now prefers the real initial stop, falling back to the old derivation.
    data.push({ range: `${TAB}!${colA1(I["Stop"])}${u.row}`, values: [[
      `=IF(${IS}${u.row}<>"",${IS}${u.row},IF(OR(${R}${u.row}="",${G}${u.row}=""),"",` +
      `IF(${F}${u.row}="Long",${Hc}${u.row}-${R}${u.row}/${G}${u.row},${Hc}${u.row}+${R}${u.row}/${G}${u.row})))`
    ]] });
  }
  body.forEach((r, i) => { if (isNaN(num(r[I["Initial Risk ($)"]])))
    data.push({ range: `${TAB}!${colA1(I["Risk Source"])}${i + 2}`, values: [["manual"]] }); });

  for (let i = 0; i < data.length; i += 400) {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values:batchUpdate`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: data.slice(i, i + 400) }) });
    const j: any = await res.json();
    console.log(`  wrote ${Math.min(400, data.length - i)} cells${j.error ? " ERROR " + JSON.stringify(j.error) : ""}`);
  }
  console.log(`DONE — ${updates.length} rows now carry a measured R on ${TAB}`);
})();
