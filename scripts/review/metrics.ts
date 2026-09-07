/**
 * Metrics that only became computable once the order ladder existed.
 *   node --experimental-strip-types scripts/review/metrics.ts [--tab=NAME]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");

const arg = (k: string, d: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const TAB = arg("tab", "WIP-U16632046-GURI");
const num = (s: any) => { if (s == null || s === "") return NaN;
  const t = String(s).replace(/[$,%\s]/g, ""); return (t === "" || t === "N/A") ? NaN : parseFloat(t); };
const f = (x: number, d = 2) => (x == null || isNaN(x) ? "--" : x.toFixed(d));
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const mean = (a: number[]) => (a.length ? sum(a) / a.length : NaN);
const med = (a: number[]) => { const s = [...a].filter((x) => !isNaN(x)).sort((x, y) => x - y);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };

type Lot = { minute: number; price: number; shares: number };
const parseLadder = (s: string): Lot[] =>
  (s || "").split("|").map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = p.match(/^(\d+):(\d+):(\d+)@([\d.]+)x(\d+)$/);
    return m ? { minute: +m[1] * 60 + +m[2], price: parseFloat(m[4]), shares: parseInt(m[5], 10) } : null;
  }).filter(Boolean) as Lot[];

/**
 * Interactive Brokers US-stock Tiered: $0.0035/share, $0.35 order minimum, capped at
 * 1% of trade value; plus sell-side regulatory fees. At 3-15 share orders the ORDER
 * MINIMUM dominates, not the per-share rate — which is why this matters at small size
 * and fades as size grows.
 */
function ibkrCost(lots: Lot[], isSell: boolean) {
  let c = 0;
  for (const l of lots) {
    const value = l.shares * l.price;
    let base = Math.max(0.35, 0.0035 * l.shares);
    base = Math.min(base, 0.01 * value);
    c += base;
    if (isSell) c += Math.min(0.000166 * l.shares, 8.3) + 0.0000278 * value;
  }
  return c;
}

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SPREADSHEET_ID}/values/${encodeURIComponent(TAB)}!A1:DZ400`,
    { headers: H })).json();
  const hdr: string[] = got.values[0]; const I: Record<string, number> = {};
  hdr.forEach((h, i) => I[h] = i);
  const T = got.values.slice(1).filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim()).map((x: string[]) => ({
    date: x[0], sym: x[1], side: x[5], sh: num(x[I["Shares"]]),
    ent: num(x[I["Avg Entry"]]), ex: num(x[I["Avg Exit"]]), pnl: num(x[I["P&L"]]),
    risk: num(x[I["Initial Risk ($)"]]), maxRisk: num(x[I["Max Risk At Stake ($)"]]),
    peak: num(x[I["Peak Position Value ($)"]]), trough: num(x[I["Trough Position Value ($)"]]),
    nEnt: num(x[I["# Entries"]]), nExit: num(x[I["# Exits"]]),
    stopped: x[I["Stopped Out?"]], raises: num(x[I["Stop Raises"]]),
    entries: parseLadder(x[I["Entry Ladder"]]), exits: parseLadder(x[I["Exit Ladder"]]),
  })).filter((t: any) => t.entries.length);

  console.log(`########## ${TAB} — ${T.length} trades with a ladder\n`);
  const R = (t: any) => t.pnl / t.risk;
  const posMFE = (t: any) => t.peak / t.risk;

  console.log("=== 1. ADD BEHAVIOUR ===");
  const withAdd = T.filter((t: any) => t.nEnt > 1);
  console.log(`  add rate: ${withAdd.length}/${T.length} = ${f(withAdd.length / T.length * 100, 0)}%`);
  const dist: Record<number, number> = {};
  T.forEach((t: any) => dist[t.nEnt] = (dist[t.nEnt] || 0) + 1);
  console.log(`  entries per trade: ${Object.entries(dist).sort().map(([k, v]) => `${k}→${v}`).join("  ")}`);
  console.log(`  no add   ${st(T.filter((t: any) => t.nEnt === 1))}`);
  console.log(`  added    ${st(withAdd)}`);
  const sizeGrowth = withAdd.map((t: any) => t.sh / t.entries[0].shares);
  console.log(`  size multiple when adding: median ${f(med(sizeGrowth))}x  max ${f(Math.max(...sizeGrowth))}x`);

  console.log("\n=== 2. ADD TIMING (how far into the move, in units of initial risk) ===");
  const timings: number[] = [];
  withAdd.forEach((t: any) => {
    const rps = t.risk / t.entries[0].shares;
    for (let i = 1; i < t.entries.length; i++) {
      const move = t.side === "Long" ? t.entries[i].price - t.entries[0].price : t.entries[0].price - t.entries[i].price;
      timings.push(move / rps);
    }
  });
  console.log(`  ${timings.length} adds | median ${f(med(timings))}R into the move | mean ${f(mean(timings))}R`);
  console.log(`  adds placed before +0.5R: ${timings.filter((x) => x < 0.5).length}  |  0.5-1R: ${timings.filter((x) => x >= 0.5 && x < 1).length}  |  1R+: ${timings.filter((x) => x >= 1).length}`);
  const early = withAdd.filter((t: any) => { const rps = t.risk / t.entries[0].shares;
    const m = t.side === "Long" ? t.entries[1].price - t.entries[0].price : t.entries[0].price - t.entries[1].price;
    return m / rps < 0.5; });
  console.log(`  first add before +0.5R  ${st(early)}`);
  console.log(`  first add at/after +0.5R${st(withAdd.filter((t: any) => !early.includes(t)))}`);

  console.log("\n=== 3. MISSED ADDS (single-entry trades the position ran on anyway) ===");
  const solo = T.filter((t: any) => t.nEnt === 1 && !isNaN(t.peak));
  [1, 2, 3].forEach((thr) => {
    const m = solo.filter((t: any) => posMFE(t) >= thr);
    console.log(`  single-entry that reached ${thr}R: ${m.length}/${solo.length}  ${st(m)}`);
  });

  console.log("\n=== 4. STARTER-ONLY COUNTERFACTUAL — does pyramiding pay? ===");
  console.log("    (same exit price, first lot only — isolates the adds)");
  let act = 0, starter = 0;
  const deltas: { d: string; s: string; delta: number }[] = [];
  withAdd.forEach((t: any) => {
    const l0 = t.entries[0];
    const so = t.side === "Long" ? (t.ex - l0.price) * l0.shares : (l0.price - t.ex) * l0.shares;
    act += t.pnl; starter += so;
    deltas.push({ d: t.date, s: t.sym, delta: t.pnl - so });
  });
  console.log(`  on the ${withAdd.length} trades where he added:`);
  console.log(`     actual        $${f(act)}   (${f(act / mean(withAdd.map((t: any) => t.risk)), 1)}R-ish)`);
  console.log(`     starter only  $${f(starter)}`);
  console.log(`     ADDS CONTRIBUTED $${f(act - starter)}`);
  deltas.sort((a, b) => b.delta - a.delta);
  console.log(`     best adds:  ${deltas.slice(0, 3).map((x) => `${x.d} ${x.s} +$${f(x.delta)}`).join("  |  ")}`);
  console.log(`     worst adds: ${deltas.slice(-3).map((x) => `${x.d} ${x.s} $${f(x.delta)}`).join("  |  ")}`);
  console.log(`     adds helped on ${deltas.filter((x) => x.delta > 0).length}/${deltas.length} trades`);

  console.log("\n=== 5. RISK DISCIPLINE ===");
  const rc = T.filter((t: any) => !isNaN(t.maxRisk) && !isNaN(t.risk));
  const creep = rc.map((t: any) => t.maxRisk / t.risk);
  console.log(`  max risk at stake / initial risk: median ${f(med(creep))}x  p90 ${f(creep.sort((a, b) => a - b)[Math.floor(creep.length * 0.9)])}x`);
  const over = rc.filter((t: any) => t.maxRisk > t.risk * 1.5);
  console.log(`  exceeded 1.5x initial risk during the build: ${over.length}/${rc.length}`);
  over.sort((a: any, b: any) => b.maxRisk / b.risk - a.maxRisk / a.risk).slice(0, 6)
    .forEach((t: any) => console.log(`     ${t.date} ${t.sym.padEnd(6)} $${f(t.risk)} → $${f(t.maxRisk)}  (${f(t.maxRisk / t.risk)}x, ${t.nEnt} entries)`));
  console.log(`  stopped out: ${T.filter((t: any) => t.stopped === "Y").length}/${T.length}  |  trades with >=1 stop raise: ${T.filter((t: any) => t.raises > 0).length}`);

  console.log("\n=== 6. CAPTURE (position-aware) ===");
  const cap = T.filter((t: any) => !isNaN(t.peak) && t.peak > 0);
  console.log(`  peak position value: median $${f(med(cap.map((t: any) => t.peak)))}  |  realised: median $${f(med(cap.map((t: any) => t.pnl)))}`);
  console.log(`  capture of peak (all): ${f(sum(cap.map((t: any) => t.pnl)) / sum(cap.map((t: any) => t.peak)) * 100, 0)}%`);
  [2, 2.5, 3].forEach((tg) => {
    const reach = cap.filter((t: any) => posMFE(t) >= tg);
    const c = mean(reach.map((t: any) => Math.min(R(t), tg))) / tg;
    console.log(`  reached ${tg}R: ${reach.length}/${cap.length}  target capture ${f(c * 100, 0)}%`);
  });
  console.log(`  R left on table vs 2.5R target: ${f(sum(cap.filter((t: any) => posMFE(t) >= 2.5).map((t: any) => 2.5 - Math.min(R(t), 2.5))), 1)}R`);

  console.log("\n=== 7. COMMISSIONS (IBKR Tiered est. — secondary, shrinks as size grows) ===");
  let comm = 0;
  T.forEach((t: any) => { comm += ibkrCost(t.entries, false) + ibkrCost(t.exits.length ? t.exits : [{ minute: 0, price: t.ex, shares: t.sh }], true); });
  const gross = sum(T.map((t: any) => t.pnl));
  const orders = sum(T.map((t: any) => t.entries.length + Math.max(1, t.exits.length)));
  console.log(`  ${orders} orders across ${T.length} trades  →  est. $${f(comm)}  ($${f(comm / T.length)}/trade)`);
  console.log(`  gross $${f(gross)}  →  net $${f(gross - comm)}   (order minimums are ${f(sum(T.map((t: any) => t.entries.length + Math.max(1, t.exits.length))) * 0.35 / comm * 100, 0)}% of the bill)`);

  function st(a: any[]) {
    if (!a.length) return " n=0";
    const rs = a.map(R).filter((x: number) => !isNaN(x));
    return ` n=${String(a.length).padStart(3)} win%=${f(a.filter((t: any) => t.pnl > 0).length / a.length * 100, 0).padStart(3)}` +
      ` expR=${f(mean(rs)).padStart(6)} sumR=${f(sum(rs), 1).padStart(6)} $=${f(sum(a.map((t: any) => t.pnl))).padStart(8)}`;
  }
})();
