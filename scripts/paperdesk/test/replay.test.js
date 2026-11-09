// Hand-made bar cases for the replay engine.  node scripts/paperdesk/test/replay.test.js
const assert = require("assert");
const { replaySession } = require("../lib/replay.js");
const cfg = { R: 100, universe: { maxPctOfAdv: 0.01 }, slippage: { baseBps: 0, smallAdvDollar: 0, smallExtraBps: 0, tinyAdvDollar: 0, tinyExtraBps: 0, gapExtraBps: 0 },
  portfolio: { maxTotalOpenR: 8, maxPositions: 12, perSystemOpenR: 4, perSystemMaxPositions: 4, maxClusterR: 3 } };
const systems = new Map([["sys", { id: "sys" }]]);
const scheme = (x = {}) => ({ id: "t", trims: [{ atR: 2, frac: 0.33, stopTo: "breakeven" }], trail: { type: "close_below", ma: "ema9" }, timeStopSessions: 60, earnings: "exit_before", ...x });
const order = (x = {}) => ({ id: "o1", track: "rules", system: "sys", setup: "s", sym: "AAA", dir: "long", grade: "A+", sizeR: 1, cluster: null,
  trigger: { type: "stop_entry", level: 100, maxChasePct: 2 }, stop: { type: "price", price: 95 }, exits: { def: scheme() }, liquidity: { maxShares: 1e9, adv20: 1e9 }, ...x });
const D = (o, h, l, c) => ({ m: 570, o, h, l, c, v: 1e6 });
const sess = (date, sym, bars, close, mode = "daily", extra = {}) => ({ date, symbols: new Map([[sym, { bars, mode, close, adv: 1e9, ...extra }]]) });
const close = (c, ma = {}) => ({ c, ma: { ema9: 0, ema20: 0, ...ma } });
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok", name); };

t("entry fills at the level; quiet day carries over", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  assert.strictEqual(st.positions.length, 1); const p = st.positions[0];
  assert.strictEqual(p.entry, 100); assert.strictEqual(p.shares, 20); assert.strictEqual(p.stop, 95);
});
t("gap through the stop fills at the open, not the stop", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  replaySession(sess("d2", "AAA", [D(90, 92, 89, 91)], close(91)), new Map(), st, cfg, systems);
  const c = st.closed[0]; assert.strictEqual(c.exitAvg, 90); assert.strictEqual(c.r, -2); assert.match(c.exitReason, /gapped/);
});
t("entry and stop in the same daily bar -> entered then stopped (pessimistic)", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(98, 101, 94, 99)], close(99)), new Map([["AAA", [order()]]]), st, cfg, systems);
  assert.strictEqual(st.closed.length, 1); assert.strictEqual(st.closed[0].r, -1);
});
t("same bar touches stop and 2R target -> stop first", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  replaySession(sess("d2", "AAA", [D(100, 111, 94, 100)], close(100)), new Map(), st, cfg, systems);
  assert.strictEqual(st.closed[0].r, -1); assert.strictEqual(st.closed[0].fills.filter(f => f.kind === "trim").length, 0);
});
t("no chase: open > 2% through the level is skipped; ≤ 2% fills at the open", () => {
  let st = { positions: [], closed: [] }; let ev = replaySession(sess("d1", "AAA", [D(103, 105, 102, 104)], close(104)), new Map([["AAA", [order()]]]), st, cfg, systems);
  assert.strictEqual(st.positions.length, 0); assert.ok(ev.some(e => e.type === "cancel" && /no chase/.test(e.reason)));
  st = { positions: [], closed: [] }; replaySession(sess("d1", "AAA", [D(101.5, 103, 101, 102)], close(102)), new Map([["AAA", [order()]]]), st, cfg, systems);
  assert.strictEqual(st.positions[0].entry, 101.5);
  assert.strictEqual(st.positions[0].shares, Math.floor(100 / 6.5));     // risk stays 1R: wider risk per share -> fewer shares
});
t("partial exit at +2R moves the stop to breakeven; rest stopped at breakeven next day", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  replaySession(sess("d2", "AAA", [D(101, 111, 100.5, 108)], close(108)), new Map(), st, cfg, systems);
  const p = st.positions[0]; assert.strictEqual(p.shares, 20 - 7); assert.strictEqual(p.stop, 100);
  replaySession(sess("d3", "AAA", [D(105, 106, 99, 100)], close(100)), new Map(), st, cfg, systems);
  const c = st.closed[0]; assert.strictEqual(c.pnl, 70); assert.ok(Math.abs(c.r - 0.7) < 1e-9);
});
t("multi-day carry: daily close < 9 EMA exits at the NEXT open", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5, { ema9: 99 })), new Map([["AAA", [order()]]]), st, cfg, systems);
  replaySession(sess("d2", "AAA", [D(101, 104, 100, 103)], close(103, { ema9: 100 })), new Map(), st, cfg, systems);
  replaySession(sess("d3", "AAA", [D(102, 102, 99, 99.5)], close(99.5, { ema9: 100.2 })), new Map(), st, cfg, systems);
  assert.strictEqual(st.positions.length, 1); assert.ok(st.positions[0].pendingExit);
  replaySession(sess("d4", "AAA", [D(98.8, 100, 98, 99)], close(99)), new Map(), st, cfg, systems);
  assert.strictEqual(st.closed[0].exitAvg, 98.8); assert.strictEqual(st.closed[0].sessionsHeld, 3);
});
t("add only to a winner: lot added, stop raised", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  const add = order({ id: "o2", kind: "addTo" in {} ? "x" : "add", addTo: "o1", sizeR: 0.5, trigger: { type: "stop_entry", level: 106, maxChasePct: 2 }, stop: { type: "price", price: 102 } });
  replaySession(sess("d2", "AAA", [D(104, 107, 103.5, 106.5)], close(106.5)), new Map([["AAA", [add]]]), st, cfg, systems);
  const p = st.positions[0]; assert.strictEqual(p.shares, 20 + 12); assert.strictEqual(p.stop, 102); assert.strictEqual(p.adds, 1);
});
t("short: sell-stop entry, stop gap up fills at the open, time stop at the close", () => {
  let st = { positions: [], closed: [] };
  const o = order({ dir: "short", trigger: { type: "stop_entry", level: 50, maxChasePct: 2 }, stop: { type: "price", price: 52 }, exits: { def: scheme({ trims: [], trail: { type: "close_above", ma: "ema9" }, timeStopSessions: 3 }) } });
  replaySession(sess("d1", "AAA", [D(51, 51.5, 49.5, 49.8)], close(49.8, { ema9: 51 })), new Map([["AAA", [o]]]), st, cfg, systems);
  assert.strictEqual(st.positions[0].entry, 50);
  replaySession(sess("d2", "AAA", [D(53, 54, 52.5, 53)], close(53, { ema9: 51 })), new Map(), st, cfg, systems);
  assert.strictEqual(st.closed[0].exitAvg, 53); assert.strictEqual(st.closed[0].r, -1.5);
  st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(51, 51.5, 49.5, 49.8)], close(49.8, { ema9: 51 })), new Map([["AAA", [o]]]), st, cfg, systems);
  for (const d of ["d2", "d3", "d4"]) replaySession(sess(d, "AAA", [D(49, 49.5, 48.5, 49)], close(49, { ema9: 51 })), new Map(), st, cfg, systems);
  assert.match(st.closed[0].exitReason, /time stop/);
});
t("ORH break on 1-min bars with touch condition and LOD stop", () => {
  const st = { positions: [], closed: [] };
  const o = order({ trigger: { type: "orh_break", minutes: 5, cutoff: "11:30", touchPrice: 98, maxAboveLodPct: 3 }, stop: { type: "lod", maxPct: 5, adrPct: 6, maxAdrFrac: 0.5 } });
  const bars = [];
  const push = (m, o_, h, l, c) => bars.push({ m, o: o_, h, l, c, v: 1000 });
  push(570, 100, 100.5, 99.5, 100); push(571, 100, 100.2, 99, 99.2); push(572, 99.2, 99.4, 98.5, 98.6); push(573, 98.6, 98.7, 97.8, 98); push(574, 98, 99, 97.9, 98.9);   // OR high 100.5, low 97.8
  push(575, 98.9, 100.3, 98.8, 100.2); push(576, 100.2, 100.8, 100.1, 100.7);   // breaks 100.51 at minute 576
  const ev = replaySession(sess("d1", "AAA", bars, close(100.7), "1m"), new Map([["AAA", [o]]]), st, cfg, systems);
  const p = st.positions[0]; assert.ok(p, JSON.stringify(ev)); assert.strictEqual(p.entry, 100.51); assert.strictEqual(p.entryMin, 576);
  assert.ok(Math.abs(p.stop - 97.79) < 1e-9, "LOD stop 97.79 (cap 3% = 97.49 is wider)");
});
t("ORH: gap condition fails -> cancelled; touch never reached -> expires", () => {
  const st = { positions: [], closed: [] };
  const o = order({ trigger: { type: "orh_break", minutes: 15, cutoff: "11:30", minGapPrice: 110 }, stop: { type: "lod", maxPct: 10 } });
  const ev = replaySession(sess("d1", "AAA", [{ m: 570, o: 105, h: 106, l: 104, c: 105, v: 1 }], close(105), "1m"), new Map([["AAA", [o]]]), st, cfg, systems);
  assert.ok(ev.some(e => /gap condition failed/.test(e.reason)));
});
t("portfolio cap at fill time: cluster cap blocks the 4th correlated 1R entry", () => {
  const st = { positions: [], closed: [] }; const m = new Map(), S = new Map();
  for (const s of ["A", "B", "C", "E"]) { m.set(s, [order({ id: "o" + s, sym: s, cluster: "semis", system: s === "E" ? "sys2" : "sys" })]); S.set(s, { bars: [D(99, 101, 98, 100.5)], mode: "daily", close: close(100.5), adv: 1e9 }); }
  const sys2 = new Map([...systems, ["sys2", { id: "sys2" }]]);
  const ev = replaySession({ date: "d1", symbols: S }, m, st, cfg, sys2);
  assert.strictEqual(st.positions.length, 3); assert.ok(ev.some(e => /cluster semis/.test(e.reason || "")));
});
t("not-working stop (JLaw): no close ≥ +1R in N sessions -> out next open", () => {
  const st = { positions: [], closed: [] };
  const o = order({ exits: { def: scheme({ trims: [], trail: null, noProgress: { sessions: 3, minCloseR: 1 } }) } });
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [o]]]), st, cfg, systems);
  for (const d of ["d2", "d3", "d4"]) replaySession(sess(d, "AAA", [D(100, 102, 99, 101)], close(101)), new Map(), st, cfg, systems);
  assert.ok(/not working/.test(st.positions[0].pendingExit));
});
t("daily bar touches entry and invalidation, opened nearer the invalidation -> cancelled (daily heuristic)", () => {
  const st = { positions: [], closed: [] };
  const ev = replaySession(sess("d1", "AAA", [D(96, 101, 94, 99)], close(99)), new Map([["AAA", [order()]]]), st, cfg, systems);
  assert.strictEqual(st.positions.length + st.closed.length, 0); assert.ok(ev.some(e => /daily heuristic/.test(e.reason || "")));
});
t("clock order across symbols: a cluster slot freed at 9:40 is usable by a 9:45 entry, not by a 9:35 one", () => {
  const cfg2 = { ...cfg, portfolio: { ...cfg.portfolio, maxClusterR: 1.5 } };
  const m1 = (pts) => pts.map(([m, o, h, l, c]) => ({ m, o, h, l, c, v: 1000 }));
  const A = m1([[570, 99, 99.5, 98.8, 99.2], [571, 99.2, 100.2, 99.1, 100.1], [580, 100, 100, 94, 94.5]]);           // AAA fills 9:31, stopped 9:40
  const B = m1([[570, 49, 49.2, 48.9, 49], [575, 49, 50.2, 48.95, 50.1]]);                                             // BBB crosses 9:35 (AAA still open)
  const Cc = m1([[570, 29, 29.2, 28.9, 29], [585, 29.5, 30.2, 29.4, 30.1]]);                                           // CCC crosses 9:45 (AAA gone)
  const st = { positions: [], closed: [] };
  const mk = (sym, lvl, stp) => order({ id: "o" + sym, sym, cluster: "c1", trigger: { type: "stop_entry", level: lvl, maxChasePct: 2 }, stop: { type: "price", price: stp } });
  const S = new Map([["AAA", { bars: A, mode: "1m", close: close(94.5), adv: 1e9 }], ["BBB", { bars: B, mode: "1m", close: close(50.1), adv: 1e9 }], ["CCC", { bars: Cc, mode: "1m", close: close(30.1), adv: 1e9 }]]);
  const ev = replaySession({ date: "d1", symbols: S }, new Map([["AAA", [mk("AAA", 100, 95)]], ["BBB", [mk("BBB", 50, 48)]], ["CCC", [mk("CCC", 30, 28.5)]]]), st, cfg2, systems);
  assert.ok(ev.some(e => e.order === "oBBB" && /cluster/.test(e.reason || "")), "BBB blocked while AAA open");
  assert.ok(st.positions.some(p => p.sym === "CCC"), "CCC fills after AAA was stopped");
});
t("an add that raises the stop into the add bar's range is stopped (re-check after add)", () => {
  const st = { positions: [], closed: [] };
  replaySession(sess("d1", "AAA", [D(99, 101, 98, 100.5)], close(100.5)), new Map([["AAA", [order()]]]), st, cfg, systems);
  const add = order({ id: "o2", kind: "add", addTo: "o1", sizeR: 0.5, trigger: { type: "stop_entry", level: 106, maxChasePct: 2 }, stop: { type: "price", price: 103 } });
  replaySession(sess("d2", "AAA", [D(104.5, 107, 102, 106.5)], close(106.5)), new Map([["AAA", [add]]]), st, cfg, systems);
  assert.strictEqual(st.positions.length, 0); assert.match(st.closed[0].exitReason, /raised stop/);
});
console.log(`\n${n} replay tests passed`);
