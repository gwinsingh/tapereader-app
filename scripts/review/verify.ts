/** End-to-end integrity check on a WIP tab. node --experimental-strip-types scripts/review/verify.ts [--tab=NAME] */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const arg = (k: string, d: string) => { const h = process.argv.find((a) => a.startsWith(`--${k}=`)); return h ? h.slice(k.length + 3) : d; };
const TAB = arg("tab", "WIP-U16632046-GURI");
const num = (s: any) => { if (s == null || s === "") return NaN; const t = String(s).replace(/[$,%\s]/g, ""); return (t === "" || t === "N/A") ? NaN : parseFloat(t); };
const lad = (s: string) => (s || "").split("|").map((p) => p.trim()).filter(Boolean)
  .map((p) => { const m = p.match(/^(\d+):(\d+):(\d+)@([\d.]+)x(\d+)$/); return m ? { price: +m[4], sh: +m[5] } : null; }).filter(Boolean) as {price:number;sh:number}[];

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const got: any = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SPREADSHEET_ID}/values/${encodeURIComponent(TAB)}!A1:DZ600`, { headers: H })).json();
  const hdr: string[] = got.values[0]; const I: Record<string, number> = {}; hdr.forEach((h, i) => I[h] = i);
  const rows = got.values.slice(1).filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim());
  const fails: string[] = [];
  const warn: string[] = [];
  let laddered = 0;

  for (const x of rows as string[][]) {
    const id = `${x[0]} ${x[1]}`;
    const e = lad(x[I["Entry Ladder"]]);
    if (!e.length) continue;
    laddered++;
    const shares = num(x[I["Shares"]]), avgEntry = num(x[I["Avg Entry"]]);
    const tot = e.reduce((a, b) => a + b.sh, 0);
    const wavg = e.reduce((a, b) => a + b.sh * b.price, 0) / tot;
    if (tot !== shares) fails.push(`${id}: ladder ${tot}sh vs sheet ${shares}sh`);
    if (Math.abs(wavg - avgEntry) > 0.02) fails.push(`${id}: ladder avg ${wavg.toFixed(3)} vs sheet ${avgEntry}`);

    const ir = num(x[I["Initial Risk ($)"]]), pnl = num(x[I["P&L"]]), pnlR = num(x[I["P&L (R)"]]);
    const logged = num(x[I["R (Risk)"]]);
    if (!isNaN(ir) && !isNaN(logged) && Math.abs(ir - logged) > 0.02) fails.push(`${id}: R (Risk) $${logged} != Initial Risk $${ir}`);
    // The sheet returns P&L (R) as a FORMATTED value rounded to one decimal, so anything
    // within half a display step of the exact ratio is agreement, not drift.
    if (!isNaN(pnlR) && !isNaN(pnl) && !isNaN(logged) && logged > 0 && Math.abs(pnlR - pnl / logged) > 0.055)
      fails.push(`${id}: P&L (R) ${pnlR} != P&L/R ${(pnl / logged).toFixed(2)}`);

    const peak = num(x[I["Peak Position Value ($)"]]);
    if (!isNaN(peak) && !isNaN(pnl) && pnl > peak + 0.02) fails.push(`${id}: realised $${pnl} > peak position value $${peak}`);
    const pm = !isNaN(peak) && !isNaN(ir) && ir > 0 ? peak / ir : NaN;
    if (!isNaN(pm) && !isNaN(pnlR) && pnlR > pm + 0.05) fails.push(`${id}: realised ${pnlR}R > Position MFE ${pm.toFixed(2)}R`);

    if (!isNaN(ir) && ir < 3) warn.push(`${id}: initial risk only $${ir}`);
    const stop = num(x[I["Initial Stop"]]);
    if (!isNaN(stop) && !isNaN(avgEntry)) {
      const side = (x[I["Side"]] || "").trim();
      if (side === "Long" && stop >= e[0].price) warn.push(`${id}: long stop ${stop} >= first entry ${e[0].price}`);
      if (side === "Short" && stop <= e[0].price) warn.push(`${id}: short stop ${stop} <= first entry ${e[0].price}`);
    }
  }
  console.log(`### ${TAB}: ${rows.length} rows, ${laddered} laddered`);
  console.log(`FAILURES: ${fails.length}`); fails.slice(0, 20).forEach((f) => console.log("  ✗ " + f));
  console.log(`WARNINGS: ${warn.length}`); warn.slice(0, 12).forEach((w) => console.log("  ! " + w));
  const missing = ["Entry Ladder", "Stop Ladder", "Initial Risk ($)", "Position MFE (R)", "Peak Position Value ($)", "Risk Basis", "Risk Source"].filter((c) => I[c] == null);
  console.log(`missing columns: ${missing.length ? missing.join(", ") : "none"}`);
})();
