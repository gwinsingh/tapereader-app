// Candidates + rules-only plan for session D from data through index i (= D's previous session).
const M = require("./market.js");
const { scanSetup } = require("./scan.js");
const { buildOrder, selectOrders, validateOrder } = require("./plan.js");
const E = require("./earnings.js");

function candidates({ P, i, D, lib, cfg, earnOpts = { fetch: true }, mode = "forward" }) {
  const reg = M.regime(P, i);
  const uni = M.universe(P, i, cfg);
  const rs = M.rsRanks(P, i, uni.core);
  const prev = P.dates[i];
  const ctx = { P, i, cfg, reg, rs, systems: lib.systems,
    reactsOn: sym => E.reactsOn(sym, D, prev, earnOpts),
    earningsOn: (sym, g, gPrev) => { const a = E.byDate(gPrev, { fetch: false }), b = E.byDate(g, { fetch: false }); if (!a.known && !b.known) return null; return a.get(sym) === "time-after-hours" || (b.has(sym) && b.get(sym) !== "time-after-hours"); } };
  const gates = {}, bySetup = {};
  for (const [id, s] of lib.setups) {
    const { gate, cands } = scanSetup(s, ctx, { core: uni.core, ep: [...uni.core, ...uni.ep] });
    gates[id] = gate; bySetup[id] = cands;
  }
  return { reg, uni: { core: uni.core.length, ep: uni.ep.length }, gates, bySetup, ctx };
}

// sizeMult(track, setupId) from edge statuses; book = open positions of the track
function rulesOrders({ C, D, lib, cfg, track, book, sizeMult, mode = "forward", nextRepFor = () => null, select = true }) {
  const all = [], vetoed = [], invalid = [];
  for (const [id, cands] of Object.entries(C.bySetup)) {
    const s = lib.setups.get(id), sys = lib.systems.get(s.system), sch = lib.exits.get(s.exit);
    const limit = s.lane === "ep" ? 8 : 6;
    for (const cand of cands.slice(0, limit * 3)) {
      const nextRep = s.lane === "ep" ? null : nextRepFor(cand.sym);
      if (nextRep && sch.earnings === "exit_before") { vetoed.push([`${id}/${cand.sym}`, `reports ${nextRep.date} — exit-before rule, no new entry`]); continue; }
      const { order, veto } = buildOrder({ cand, setup: s, system: sys, scheme: sch, D, track, sizeMult: sizeMult(track, id), cfg, nextRep, mode });
      if (!order) { vetoed.push([`${id}/${cand.sym}`, veto.join("; ")]); continue; }
      if (veto.length) { vetoed.push([order.id, veto.join("; ")]); continue; }
      const err = validateOrder(order); if (err.length) { invalid.push([order.id, err.join("; ")]); continue; }
      order.regimeLabel = C.reg.label; order.qqqUpAtEntry = !!C.reg.qqqUpAtEntry; order.record = mode === "backtest" ? "backtest" : "forward";
      all.push(order);
      if (all.filter(o => o.setup === id).length >= limit) break;
    }
  }
  // rank: A+ first, then scanner score
  all.sort((a, b) => (b.grade === "A+") - (a.grade === "A+") || b.facts.score - a.facts.score);
  if (!select) return { orders: all, skipped: [], vetoed, invalid };
  const ep = all.filter(o => o.scenario.includes("ep")), rest = all.filter(o => !o.scenario.includes("ep"));
  const sel = selectOrders(rest, book, cfg, lib.systems);
  // EP lane: conditional orders, capped at fill time; never auto-paused
  const epSel = ep.slice(0, 8);
  return { orders: [...sel.orders, ...epSel], skipped: [...sel.skipped, ...ep.slice(8).map(o => [o.id, "EP lane: max 8 conditional orders"])], vetoed, invalid };
}

// Adds: a held winner (last close ≥ +1R, no add yet) whose own system's scanner fires again on the same name.
function addOrders({ C, D, lib, cfg, track, book }) {
  const out = [];
  for (const p of book) {
    if (p.shares <= 0 || (p.adds || 0) >= 1 || !(p.lastCloseR >= 1)) continue;
    for (const [id, cands] of Object.entries(C.bySetup)) {
      const s = lib.setups.get(id); if (s.system !== p.system || s.lane === "ep") continue;
      const cand = cands.find(c => c.sym === p.sym); if (!cand) continue;
      const { order, veto } = buildOrder({ cand, setup: s, system: lib.systems.get(s.system), scheme: lib.exits.get(p.scheme.id) || p.scheme, D, track, sizeMult: 0.5, cfg });
      if (!order || veto.length) continue;
      if (order.stop.type !== "price") continue;
      order.id = `${D}-${track}-add-${p.sym}`; order.kind = "add"; order.addTo = p.id; order.thesis = `Add to winner ${p.sym} (+${p.lastCloseR}R): fresh ${s.name}. ` + order.thesis;
      if (validateOrder(order).length) continue;
      out.push(order); break;
    }
  }
  return out;
}

module.exports = { candidates, rulesOrders, addOrders };
