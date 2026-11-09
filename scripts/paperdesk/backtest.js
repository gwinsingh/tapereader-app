// One-time RULES-ONLY historical backtest on cached daily bars — labeled "backtest" everywhere, never mixed into
// the forward record or into sizing. Same library, planner and replay engine as the forward desk, with:
//   - daily bars only (intraday triggers use their dailyApprox, tagged approx; same-bar ambiguity -> stop),
//   - earnings dates from the Nasdaq calendar cache (fetched where missing), as known on each day.
//   node --max-old-space-size=6000 scripts/paperdesk/backtest.js [--from=YYYY-MM-DD] [--no-fetch]
const path = require("path"), fs = require("fs");
const U = require("./lib/util.js"), P0 = require("./lib/panel.js"), M = require("./lib/market.js"), L = require("./lib/library.js"), PL = require("./lib/planner.js");
const SE = require("./lib/session.js"), { replaySession } = require("./lib/replay.js"), E = require("./lib/earnings.js"), EDGE = require("./lib/edge.js");
const args = Object.fromEntries(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const cfg = U.CONFIG(), lib = L.load();
const OUT = path.join(U.DATA, "backtest"); fs.mkdirSync(OUT, { recursive: true });

const P = P0.loadPanel({ minEverDollarVol: 10e6, keep: M.KEEP_FUNDS, log: U.log });
const from = args.from || cfg.history.backtestFrom;
let k0 = P.dates.findIndex(d => d >= from); if (k0 < 0) throw new Error("no data from " + from);
k0 = Math.max(k0, 260);                                     // 52-week high + 200-day need ~260 sessions of history
U.log(`backtest ${P.dates[k0]} -> ${P.dates[P.D - 1]} (${P.D - 1 - k0} plan days), ${lib.setups.size} setups`);
const st = { positions: [], closed: [] }, perDay = [];
const fetch = !args["no-fetch"];
const t0 = Date.now();
for (let k = k0; k < P.D - 1; k++) {
  const D = P.dates[k + 1];
  // orders for D from data through k (never later)
  const C = PL.candidates({ P, i: k, D, lib, cfg, earnOpts: { fetch }, mode: "backtest" });
  const nextRepFor = sym => { for (const d of [D, P.dates[k + 2]].filter(Boolean)) { const m = E.byDate(d, { fetch }); if (m.has(sym)) return { date: d, time: m.get(sym) }; } return null; };
  const book = st.positions.filter(p => p.shares > 0);
  const R = PL.rulesOrders({ C, D, lib, cfg, track: "rules", book, sizeMult: () => 1, mode: "backtest", nextRepFor });
  R.orders.push(...PL.addOrders({ C, D, lib, cfg, track: "rules", book }));
  for (const o of R.orders) o.record = "backtest";
  const bySym = new Map(); R.orders.forEach((o, r) => { o.rank = r; if (!bySym.has(o.sym)) bySym.set(o.sym, []); bySym.get(o.sym).push(o); });
  const syms = new Set([...bySym.keys(), ...book.map(p => p.sym)]);
  const sess = SE.buildSession(P, k + 1, syms, null, { fetch });
  const ev = replaySession(sess, bySym, st, cfg, lib.systems);
  perDay.push({ D, regime: C.reg.label, orders: R.orders.length, entries: ev.filter(e => e.type === "entry").length });
  if ((k - k0) % 20 === 0) U.log(`${D} ${C.reg.label} orders ${R.orders.length} open ${st.positions.length} closed ${st.closed.length} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
const trades = st.closed.map(t => ({ ...t, record: "backtest", pnlR: +(t.pnl / cfg.R).toFixed(3) }));
const open = st.positions.map(p => ({ id: p.id, sym: p.sym, setup: p.setup, entryDate: p.entryDate, lastCloseR: p.lastCloseR }));
// equity chart (account R by system) into the vault assets
let chart = null;
try {
  const { equityChart, PAL } = require("../backtest/lib/svg.js");
  const VAULT = process.env.VAULT || require("../vault-path");
  const bySys = {}; for (const t of [...trades].sort((a, b) => a.exitDate < b.exitDate ? -1 : 1)) (bySys[t.system] = bySys[t.system] || []).push(t.pnlR);
  const svg = equityChart({ series: Object.entries(bySys).map(([name, values], i) => ({ name, values, color: PAL[i % PAL.length] })), title: "BACKTEST — rules-only, daily bars (not the forward record)", sub: `${P.dates[k0 + 1]} → ${P.dates[P.D - 1]} · cumulative account R per system, in exit order` });
  chart = "paperdesk backtest equity.svg";
  const f = path.join(VAULT, "_assets", "paperdesk", "charts", chart); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, svg);
} catch (e) { U.log("chart failed: " + e.message); }
const res = { label: "BACKTEST — rules-only, daily bars, not the forward record", generated: new Date().toISOString(), from: P.dates[k0 + 1], to: P.dates[P.D - 1], trades, stillOpen: open, perDay, chart,
  notes: ["Daily bars only; intraday (ORH) triggers use dailyApprox and are tagged approx.", "Entry and stop inside the same daily bar = entered and stopped.", "Slippage and the 1%-of-ADV cap as forward.", "Universe as of each day (survivorship-free grouped bars)."] };
U.writeJ(path.join(OUT, "trades.json"), res);
const B = EDGE.board(trades, cfg);
U.writeJ(path.join(OUT, "board.json"), B);
console.log("\nBACKTEST by system:"); for (const b of B.bySystem) console.log(`  ${b.system.padEnd(14)} n=${String(b.n).padStart(4)} win ${(b.winRate * 100).toFixed(0)}% avgR ${b.avgR} PF ${b.profitFactor} sumR ${b.sumR}`);
console.log("BACKTEST by setup:"); for (const b of B.bySetup) console.log(`  ${b.setup.padEnd(24)} n=${String(b.n).padStart(4)} win ${(b.winRate * 100).toFixed(0)}% avgR ${b.avgR} PF ${b.profitFactor} sumR ${b.sumR}`);
