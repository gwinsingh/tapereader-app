/**
 * Re-enrich the WIP sheet using the TRUE first entry + real initial stop recovered
 * from the order ladder, instead of blended Avg Entry with R/totalShares.
 *   node --experimental-strip-types scripts/review/re-enrich.ts [SYMBOL] [--write]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const env = parseEnvLocal(ENV_PATH);
for (const k of ["POLYGON_API_KEY"]) if (env[k]) process.env[k] = env[k];
import { enrichSymbol } from "../../web/lib/trade-journal/market-data.ts";

const TAB = "WIP-U16632046-GURI";
const WRITE = process.argv.includes("--write");
const ONLY = process.argv.slice(2).find((a) => !a.startsWith("--"));
const NEW_COLS = ["MFE (R)"];
const num = (s: any) => { if (s == null || s === "") return NaN;
  const t = String(s).replace(/[$,%\s]/g, ""); return (t === "" || t === "N/A") ? NaN : parseFloat(t); };
const colA1 = (n: number) => { let s = ""; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

(async () => {
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const SS = env.GOOGLE_SPREADSHEET_ID;
  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!A1:CZ200`, { headers: H })).json();
  let hdr: string[] = got.values[0].slice();
  const body: string[][] = got.values.slice(1).filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim());
  const I: Record<string, number> = {}; hdr.forEach((h, i) => I[h] = i);

  type T = { date: string; entryTime: string; exitTime: string; side: "Long" | "Short";
             avgEntry: number; index: number; riskPerShare?: number;
             entryRef?: { price: number; riskPerShare: number } };
  const bySym = new Map<string, T[]>();
  let skipped = 0;
  body.forEach((r, i) => {
    const sym = (r[1] || "").trim();
    const ladder = (r[I["Entry Ladder"]] || "").trim();
    const firstEntry = num(r[I["First Entry"]]);
    const initRisk = num(r[I["Initial Risk ($)"]]);
    const m = ladder.match(/x(\d+)/);          // shares on the first entry
    const shares = m ? parseInt(m[1], 10) : NaN;
    if (!sym || isNaN(firstEntry) || isNaN(initRisk) || isNaN(shares) || shares <= 0) { skipped++; return; }
    if (ONLY && sym !== ONLY) return;
    if (!bySym.has(sym)) bySym.set(sym, []);
    bySym.get(sym)!.push({
      date: r[0], entryTime: r[2], exitTime: r[3],
      side: (r[5] as "Long" | "Short"), avgEntry: num(r[7]), index: i,
      riskPerShare: initRisk / shares,
      entryRef: { price: firstEntry, riskPerShare: initRisk / shares },
    });
  });
  console.log(`${bySym.size} symbols, ${[...bySym.values()].reduce((a, b) => a + b.length, 0)} trades (skipped ${skipped} without a ladder)`);

  const out: { i: number; maxR: number | null; mfe: number | null; mae: number | null; far: number | null }[] = [];
  for (const [sym, trades] of bySym) {
    try {
      const res = await enrichSymbol(sym, trades);
      for (const e of res.enrichments) {
        out.push({ i: e.tradeIndex, maxR: e.data.maxRBeforeStop, mfe: e.data.mfeR, mae: e.data.maeR, far: e.data.farthestPrice });
      }
      console.log(`  ${sym.padEnd(6)} ${trades.length} trades ok`);
    } catch (err: any) { console.log(`  ${sym.padEnd(6)} FAILED: ${err.message}`); }
  }

  // sanity: realised R must never exceed MFE
  let bad = 0;
  for (const o of out) {
    const r = body[o.i]; const pr = num(r[I["P&L (R)"]]);
    if (!isNaN(pr) && o.mfe != null && pr > o.mfe + 0.05) { bad++;
      console.log(`  !! ${r[0]} ${r[1]} realised ${pr}R > MFE ${o.mfe}R`); }
  }
  console.log(`\nrows where realised R > MFE: ${bad} (was 10 before the fix)`);
  const zero = out.filter((o) => o.maxR === 0).length;
  console.log(`rows with Max R Before Stop = 0: ${zero} (was 17)`);

  if (!WRITE) { console.log("\n(dry run — pass --write to apply)"); return; }
  const missing = NEW_COLS.filter((c) => !hdr.includes(c));
  if (missing.length) {
    const start = hdr.length;
    const smeta: any = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}?fields=sheets.properties`, { headers: H })).json();
    const props = smeta.sheets.map((x: any) => x.properties).find((x: any) => x.title === TAB);
    const need = start + missing.length - props.gridProperties.columnCount;
    if (need > 0) await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}:batchUpdate`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ appendDimension: { sheetId: props.sheetId, dimension: "COLUMNS", length: need } }] }) });
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(TAB)}!${colA1(start)}1?valueInputOption=RAW`,
      { method: "PUT", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ values: [missing] }) });
    hdr = [...hdr, ...missing]; hdr.forEach((h, i) => I[h] = i);
    console.log(`appended ${missing.join(", ")} at ${colA1(start)}`);
  }
  const data: any[] = [];
  for (const o of out) {
    const row = o.i + 2;
    const put = (h: string, v: any) => { if (v != null) data.push({ range: `${TAB}!${colA1(I[h])}${row}`, values: [[v]] }); };
    put("Max R Before Stop", o.maxR); put("MFE (R)", o.mfe); put("MAE (R)", o.mae); put("Farthest Price", o.far);
  }
  for (let i = 0; i < data.length; i += 400) {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}/values:batchUpdate`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "RAW", data: data.slice(i, i + 400) }) });
    const j: any = await res.json();
    console.log(`  wrote ${Math.min(400, data.length - i)} cells${j.error ? " ERROR " + JSON.stringify(j.error) : ""}`);
  }
  console.log(`DONE — ${out.length} rows re-enriched on ${TAB}`);
})();
