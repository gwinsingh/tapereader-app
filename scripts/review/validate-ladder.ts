import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const L = require("./lib.js");
import { parseFullLog, buildLadders, fmtFills, normTime } from "../../web/lib/trade-journal/order-ladder.ts";

const ACCT = "U16632046";
const f = (x: number | null, d = 2) => (x == null || isNaN(x) ? "--" : x.toFixed(d));

async function drive(tok: string, name: string): Promise<string | null> {
  const H = { Authorization: `Bearer ${tok}` };
  const q = encodeURIComponent(`'13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH' in parents and name='${name}' and trashed=false`);
  const r: any = await (await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: H })).json();
  if (!r.files?.length) return null;
  const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${r.files[0].id}?alt=media`, { headers: H });
  return await resp.text();
}

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  for (const date of ["2026-08-19", "2026-08-05"]) {
    const csv = await drive(tok, `${date}-trade-log.csv`);
    if (!csv) { console.log(`${date}: NO LOG`); continue; }
    const ladders = buildLadders(parseFullLog(csv), ACCT);
    const sheet = L.live.filter((t: any) => t.date === date);
    console.log(`\n########## ${date} — ${ladders.length} ladders vs ${sheet.length} sheet rows`);
    for (const lad of ladders) {
      const m = sheet.find((s: any) => s.sym === lad.symbol && normTime(s.entry) === normTime(lad.entryTime));
      const ok = m ? (Math.abs(m.ent - lad.avgEntry) < 0.02 && m.sh === lad.totalShares) : false;
      console.log(`\n  ${lad.symbol} ${lad.entryTime} ${lad.side}  ${ok ? "✓ MATCHES SHEET" : m ? "✗ MISMATCH" : "· no sheet row"}`);
      if (m) console.log(`     sheet: ${m.sh} sh @ ${f(m.ent)}   R=$${f(m.risk,0)}  pnlR=${f(m.pnlR)}  sheetStop=${f(m.stop)}`);
      console.log(`     built: ${lad.totalShares} sh @ ${f(lad.avgEntry)}   entries=${lad.entries.length} exits=${lad.exits.length}`);
      console.log(`     firstStop=${f(lad.firstStop)} initialStop=${f(lad.initialStop)}  initialRisk=$${f(lad.initialRisk)}  maxRiskAtStake(build)=$${f(lad.maxRiskAtStake)}  stopRaises=${lad.stopRaises}  stoppedOut=${lad.everStoppedOut}`);
      console.log(`     entryLadder: ${fmtFills(lad.entries)}`);
      if (lad.riskCurve.length) console.log(`     riskCurve:   ${lad.riskCurve.map(r => `${r.time} stop ${r.stop} → $${f(r.risk)} (${r.shares}sh)`).join("  |  ")}`);
      if (m && lad.initialRisk) console.log(`     >>> sheet R=$${f(m.risk,0)} vs TRUE initial risk $${f(lad.initialRisk)};  sheet riskPerShare=${f(m.risk/m.sh,3)} vs TRUE ${f(lad.initialRisk/lad.entries[0].shares,3)}`);
    }
  }
})();
