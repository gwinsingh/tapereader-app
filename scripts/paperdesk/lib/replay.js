// Replay engine: walks ONE session's bars against the locked orders (all tracks) and open positions. Pure code.
//
// Honest-fill rules (brief §1.3):
//  - an entry fills only if price crossed the level; an open beyond the level fills at the OPEN (worse), and an
//    open more than maxChasePct through the level is skipped (no chase);
//  - a stop gapped through fills at the open, not the stop;
//  - same bar touches stop and target -> the STOP is assumed first; a fill and its stop in the same bar -> stopped;
//  - daily-bar mode only (no 1-min bars): a bar that touches BOTH the entry level and the pre-entry invalidation is
//    resolved by the open — the extreme nearer the open printed first (red-team #7); otherwise entered then stopped;
//  - slippage scales with liquidity (+ extra on gap fills); size <= maxPctOfAdv of average daily volume;
//  - portfolio limits are checked at FILL time in CLOCK order across all symbols: every minute, exits/stops/trims
//    first, then entries in plan-rank order (red-team #1);
//  - decisions from a daily close (trail breaks, no-progress, pillars) act at the NEXT session's open;
//    time stops and the earnings rule act at the close (they are known in advance -> MOC).
//
// sess = { date, symbols: Map(sym -> { bars:[{m,o,h,l,c,v}], mode:"1m"|"daily", close:{c, ma:{}, rs, rsLo10, sectorOk}, adv, reportTonight }) }
// state = { positions:[...], closed:[...] }  (mutated; returns events)
const fin = x => typeof x === "number" && isFinite(x);
const r4 = x => +(+x).toFixed(4);

function slipBps(cfg, adv, gap) {
  const s = cfg.slippage; let b = s.baseBps;
  if (adv < s.smallAdvDollar) b += s.smallExtraBps;
  if (adv < s.tinyAdvDollar) b += s.tinyExtraBps;
  if (gap) b += s.gapExtraBps;
  return b / 1e4;
}
const adverse = (px, side, bps) => side === "buy" ? px * (1 + bps) : px * (1 - bps);
const sideOf = (dir, opening) => (dir === "long") === opening ? "buy" : "sell";

function openRiskR(p, R) { const sgn = p.dir === "long" ? 1 : -1; return Math.max(0, sgn * (p.avgCost - p.stop) * p.shares) / R; }

function limitsOk(o, state, cfg, systems, riskR) {
  const P = cfg.portfolio, open = state.positions.filter(p => p.track === o.track && p.shares > 0);
  const tot = open.reduce((a, p) => a + openRiskR(p, cfg.R), 0);
  if (o.kind !== "add" && open.length >= P.maxPositions) return "max positions";
  if (tot + riskR > P.maxTotalOpenR + 1e-9) return `total open risk ${tot.toFixed(2)}R + ${riskR.toFixed(2)}R > ${P.maxTotalOpenR}R`;
  const sys = systems.get(o.system) || {}, sysCap = (sys.sizing && sys.sizing.riskBudgetR) || P.perSystemOpenR;
  const so = open.filter(p => p.system === o.system);
  if (o.kind !== "add" && so.length >= (sys.maxPositions || P.perSystemMaxPositions)) return "system position cap";
  const sr = so.reduce((a, p) => a + openRiskR(p, cfg.R), 0);
  if (sr + riskR > sysCap + 1e-9) return `system risk ${sr.toFixed(2)}R + ${riskR.toFixed(2)}R > ${sysCap}R`;
  if (o.cluster) { const cr = open.filter(p => p.cluster === o.cluster).reduce((a, p) => a + openRiskR(p, cfg.R), 0); if (cr + riskR > P.maxClusterR + 1e-9) return `cluster ${o.cluster} ${cr.toFixed(2)}R + ${riskR.toFixed(2)}R > ${P.maxClusterR}R`; }
  const symR = open.filter(p => p.sym === o.sym).reduce((a, p) => a + openRiskR(p, cfg.R), 0), symCap = P.maxSymbolR ?? 1.5;
  if (symR + riskR > symCap + 1e-9) return `same symbol ${o.sym} ${symR.toFixed(2)}R + ${riskR.toFixed(2)}R > ${symCap}R`;
  return null;
}

function lodStop(o, fill, lod) {
  const s = o.stop, sgn = o.dir === "long" ? 1 : -1; const lim = [];
  if (s.maxPct) lim.push(fill * s.maxPct / 100);
  if (s.maxAtr && fin(s.atr)) lim.push(s.maxAtr * s.atr);
  if (s.maxAdrFrac && fin(s.adrPct)) lim.push(fill * s.maxAdrFrac * s.adrPct / 100);
  const maxDist = lim.length ? Math.min(...lim) : Infinity;
  const raw = lod - sgn * 0.01;
  return sgn > 0 ? Math.max(raw, fill - maxDist) : Math.min(raw, fill + maxDist);
}

function openPosition(o, fill, stop, at, state, cfg, systems, ev, flags) {
  stop = r4(stop);
  const sgn = o.dir === "long" ? 1 : -1, rps = sgn * (fill - stop);
  if (!(rps > 0)) { ev.push({ type: "skip", order: o.id, reason: "stop not beyond the fill" }); return null; }
  let shares = Math.floor(cfg.R * o.sizeR / rps);
  const maxSh = o.liquidity && o.liquidity.maxShares; let capped = false;
  if (maxSh && shares > maxSh) { shares = maxSh; capped = true; }
  if (shares < 1) { ev.push({ type: "skip", order: o.id, reason: "size < 1 share" }); return null; }
  if (o.kind === "add") {
    const p = state.positions.find(x => x.id === o.addTo && x.shares > 0); if (!p) { ev.push({ type: "skip", order: o.id, reason: "position to add to is closed" }); return null; }
    const lim = limitsOk(o, state, cfg, systems, rps * shares / cfg.R); if (lim) { ev.push({ type: "skip", order: o.id, reason: "cap at fill: " + lim }); return null; }
    p.avgCost = (p.avgCost * p.shares + fill * shares) / (p.shares + shares); p.shares += shares; p.adds = (p.adds || 0) + 1;
    p.riskDollars += rps * shares; p.stop = sgn > 0 ? Math.max(p.stop, stop) : Math.min(p.stop, stop);
    p.fills.push({ date: at.date, m: at.m, side: sideOf(o.dir, true), kind: "add", shares, px: r4(fill) });
    ev.push({ type: "add", pos: p.id, shares, px: r4(fill) }); return p;
  }
  const lim = limitsOk(o, state, cfg, systems, rps * shares / cfg.R);
  if (lim) { ev.push({ type: "skip", order: o.id, reason: "cap at fill: " + lim }); return null; }
  const p = { id: o.id, orderId: o.id, track: o.track, system: o.system, source: o.source, setup: o.setup, setupVersion: o.setupVersion, sym: o.sym, dir: o.dir, grade: o.grade, sizeR: o.sizeR,
    scenario: o.scenario, regime: o.regimeLabel || null, cluster: o.cluster, entryDate: at.date, entryMin: at.m, entry: r4(fill), avgCost: fill, initStop: stop, stop, rps, initShares: shares, shares, riskDollars: rps * shares,
    realized: 0, trims: [], adds: 0, sessionsHeld: 0, bestCloseR: -Infinity, pendingExit: null, scheme: o.exits.def, qqqUpAtEntry: !!o.qqqUpAtEntry, earnings: o.earnings,
    fills: [{ date: at.date, m: at.m, side: sideOf(o.dir, true), kind: "entry", shares, px: r4(fill) }], flags: [...flags, ...(capped ? ["liquidity-capped"] : [])], approx: !!o.approx, record: o.record || "forward" };
  state.positions.push(p); ev.push({ type: "entry", pos: p.id, sym: p.sym, shares, px: r4(fill), stop });
  return p;
}

function exitShares(p, n, px, at, kind, reason, state, ev) {
  n = Math.min(n, p.shares); if (n <= 0) return;
  const sgn = p.dir === "long" ? 1 : -1;
  p.realized += sgn * (px - p.avgCost) * n; p.shares -= n;
  p.fills.push({ date: at.date, m: at.m, side: sideOf(p.dir, false), kind, shares: n, px: r4(px), reason });
  ev.push({ type: kind, pos: p.id, shares: n, px: r4(px), reason });
  if (p.shares === 0) closePos(p, at, reason, state);
}
function closePos(p, at, reason, state) {
  p.exitDate = at.date; p.exitReason = reason; p.status = "closed";
  const out = p.fills.filter(f => f.side === sideOf(p.dir, false)), outSh = out.reduce((a, f) => a + f.shares, 0);
  p.exitAvg = outSh ? r4(out.reduce((a, f) => a + f.px * f.shares, 0) / outSh) : null;
  p.pnl = +p.realized.toFixed(2);
  p.r = +(p.realized / p.riskDollars).toFixed(3);                  // multiple of the total risk taken (starter + adds)
  p.rInitial = +(p.realized / (p.rps * p.initShares)).toFixed(3);  // multiple of the starter's risk
  state.positions = state.positions.filter(x => x !== p); state.closed.push(p);
}

function manageBar(p, b, at, cfg, adv, state, ev, entryBar = false) {
  const sgn = p.dir === "long" ? 1 : -1, sell = sideOf(p.dir, false);
  if (!entryBar && sgn * (b.o - p.stop) <= 0) { exitShares(p, p.shares, adverse(b.o, sell, slipBps(cfg, adv, true)), at, "stop", "stop gapped through: filled at the open", state, ev); return; }
  const lo = sgn > 0 ? b.l : b.h;
  // checked on the entry bar too (pessimistic); a LOD stop sits below that bar's low so it can't be hit there
  if (sgn * (lo - p.stop) <= 0) { exitShares(p, p.shares, adverse(p.stop, sell, slipBps(cfg, adv, false)), at, "stop", Math.abs(p.stop - p.initStop) < 1e-6 ? "initial stop" : "raised stop", state, ev); return; }
  const sch = p.scheme || {};
  (sch.trims || []).forEach((t, k) => {
    if (!t.atR || p.trims.includes(k) || p.shares <= 0) return;
    const tgt = p.entry + sgn * t.atR * p.rps;
    const hit = sgn > 0 ? b.h >= tgt : b.l <= tgt; if (!hit) return;
    const px = sgn * (b.o - tgt) > 0 && !entryBar ? b.o : tgt;
    p.trims.push(k);
    exitShares(p, Math.max(1, Math.round(t.frac * p.initShares)), adverse(px, sell, slipBps(cfg, adv, false)), at, "trim", `+${t.atR}R trim`, state, ev);
    if (t.stopTo === "breakeven" && p.shares > 0) p.stop = sgn > 0 ? Math.max(p.stop, p.entry) : Math.min(p.stop, p.entry);
  });
}

// One entry order against one bar. Returns nothing; mutates L / state / ev.
function entryStep(L, X, b, first, date, state, cfg, systems, ev) {
  const o = L.o, t = o.trigger, sgn = o.dir === "long" ? 1 : -1, side = sideOf(o.dir, true), daily = X.daily;
  const cancel = (why, st = "cancelled") => { L.state = st; ev.push({ type: "cancel", order: o.id, reason: why }); };
  L.lod = Math.min(L.lod, b.l); L.hod = Math.max(L.hod, b.h);
  let fill = null, gap = false;
  if (t.type === "stop_entry" || t.type === "open_gap") {
    if (t.type === "open_gap" && first) { if (b.o < t.minGapPrice) return cancel(`opened ${b.o.toFixed(2)} < gap level ${t.minGapPrice}`); L.level = b.o * (1 + t.offsetPct / 100); }
    const level = t.type === "open_gap" ? L.level : t.level;
    if (level == null) return;
    const inval = o.stop.type === "price" ? o.stop.price : null;
    if (first && t.type === "stop_entry") {
      if (sgn * (b.o - level) >= 0) {
        if (sgn * (b.o / level - 1) * 100 > t.maxChasePct) return cancel(`opened ${b.o.toFixed(2)}, > ${t.maxChasePct}% through ${level.toFixed(2)} (no chase)`);
        fill = b.o; gap = true;
      } else if (inval != null && sgn * (b.o - inval) <= 0) return cancel("opened through the invalidation level");
    }
    if (fill == null) {
      const crossed = sgn > 0 ? b.h >= level : b.l <= level;
      const invalHit = inval != null && (sgn > 0 ? b.l <= inval : b.h >= inval);
      if (!crossed) { if (!daily && invalHit) cancel("invalidated before the trigger"); return; }
      if (daily && invalHit && Math.abs(b.o - inval) < Math.abs(b.o - level)) return cancel("daily bar touched both; opened nearer the invalidation → assumed invalidated first (daily heuristic)");
      fill = level;
    }
  } else if (t.type === "orh_break") {
    if (daily) return cancel("no 1-min bars: ORH trigger can't be resolved (not counted)", "nodata");
    const orEnd = 570 + t.minutes, cut = +t.cutoff.slice(0, 2) * 60 + +t.cutoff.slice(3);
    if (b.m < 570) return;
    if (first && t.minGapPrice && b.o < t.minGapPrice) return cancel(`gap condition failed (open ${b.o.toFixed(2)} < ${t.minGapPrice})`);
    if (b.m < orEnd) { L.orh = Math.max(L.orh ?? -Infinity, b.h); L.firstVol += b.v || 0; return; }
    if (L.orh == null) return cancel("no opening-range bars");
    if (t.minFirstVol && !L.volChecked) { L.volChecked = true; if (L.firstVol < t.minFirstVol) return cancel(`first ${t.minutes} min volume ${L.firstVol} < ${t.minFirstVol}`); }
    if (b.m >= cut) return cancel(`no trigger before ${t.cutoff}`, "expired");
    const level = L.orh + 0.01;
    if (!(b.h >= level)) return;
    if (t.touchPrice && !(L.lod <= t.touchPrice)) return;            // has not reached the support zone yet: wait
    fill = Math.max(b.o, level); gap = b.o > level;
    if (t.maxAboveLodPct && (fill / L.lod - 1) * 100 > t.maxAboveLodPct) return cancel(`trigger ${fill.toFixed(2)} > ${t.maxAboveLodPct}% above the low of day (no chase)`);
  } else return cancel(`unknown trigger ${t.type}`);
  let stop;
  if (o.stop.type === "price") stop = o.stop.price;
  else if (o.stop.type === "lod") stop = lodStop(o, fill, sgn > 0 ? L.lod : L.hod);
  else if (o.stop.type === "open_minus_atr") stop = X.S.bars[0].o - sgn * o.stop.atr;
  const px = adverse(fill, side, slipBps(cfg, X.adv, gap));
  L.state = "filled";
  const p = openPosition(o, px, stop, { date, m: b.m }, state, cfg, systems, ev, (daily ? ["daily-fallback"] : []).concat(o.approx ? ["approx"] : []));
  if (p) manageBar(p, b, { date, m: b.m }, cfg, X.adv, state, ev, true);   // same bar: stop first (also re-checks a raised stop after an add)
}

function closeDecisions(p, C, at, cfg, adv, state, ev, reportTonight) {
  const sgn = p.dir === "long" ? 1 : -1, sch = p.scheme || {}, sell = sideOf(p.dir, false), px = adverse(C.c, sell, slipBps(cfg, adv, false));
  const closeR = sgn * (C.c - p.entry) / p.rps; if (closeR > p.bestCloseR) p.bestCloseR = closeR;
  p.lastClose = C.c; p.lastCloseR = +closeR.toFixed(2);
  (sch.trims || []).forEach((t, k) => { if (t.afterSessions && !p.trims.includes(k) && p.sessionsHeld >= t.afterSessions && p.shares > 0) { p.trims.push(k); exitShares(p, Math.max(1, Math.round(t.frac * p.initShares)), px, at, "trim", `${t.afterSessions}-session trim`, state, ev); if (t.stopTo === "breakeven" && p.shares > 0) p.stop = sgn > 0 ? Math.max(p.stop, p.entry) : Math.min(p.stop, p.entry); } });
  if (p.shares <= 0) return;
  if (reportTonight && sch.earnings === "exit_before") { exitShares(p, p.shares, px, at, "exit", "earnings rule: exit before the report", state, ev); return; }
  if (reportTonight && sch.earnings === "trim_half") exitShares(p, Math.floor(p.shares / 2), px, at, "trim", "earnings rule: trim half", state, ev);
  if (sch.timeStopSessions && p.sessionsHeld >= sch.timeStopSessions) { exitShares(p, p.shares, px, at, "exit", `time stop (${sch.timeStopSessions} sessions)`, state, ev); return; }
  const tr = sch.trail;
  if (tr && p.entryDate !== at.date) {                                 // trails start the session after the entry
    const ma = tr.type === "adaptive" ? (p.qqqUpAtEntry ? tr.up : tr.down) : tr.ma, v = C.ma[ma];
    if (fin(v)) {
      if ((tr.type === "close_below" || tr.type === "adaptive") && sgn > 0 && C.c < v) p.pendingExit = `daily close ${C.c.toFixed(2)} < ${ma} ${v.toFixed(2)} → out at the next open`;
      if (tr.type === "close_above" && sgn < 0 && C.c > v) p.pendingExit = `daily close ${C.c.toFixed(2)} > ${ma} ${v.toFixed(2)} → cover at the next open`;
    }
  }
  if (sch.noProgress && p.sessionsHeld >= sch.noProgress.sessions && p.bestCloseR < sch.noProgress.minCloseR && !p.pendingExit) p.pendingExit = `not working: no close ≥ +${sch.noProgress.minCloseR}R in ${sch.noProgress.sessions} sessions → out at the next open`;
  if (sch.pillars && p.entryDate !== at.date && !p.pendingExit) {
    const hits = [];
    for (const k of sch.pillars.of) {
      if (k === "close<ema20" && fin(C.ma.ema20) && C.c < C.ma.ema20) hits.push(k);
      if (k === "rs<rsLo10" && fin(C.rs) && fin(C.rsLo10) && C.rs <= C.rsLo10) hits.push(k);
      if (k === "sector<sma50" && C.sectorOk === false) hits.push(k);
    }
    if (hits.length >= sch.pillars.need) p.pendingExit = `completed: ${hits.join(" + ")} → out at the next open`;
  }
}

// Replay one session for every track. ordersBySym: Map(sym -> [orders valid this session], in plan-rank order).
function replaySession(sess, ordersBySym, state, cfg, systems) {
  const ev = [], date = sess.date;
  const syms = [...new Set([...ordersBySym.keys(), ...state.positions.filter(p => p.shares > 0).map(p => p.sym)])].sort();
  const X = new Map(); let rank = 0;
  for (const s of syms) {
    const S = sess.symbols.get(s), orders = ordersBySym.get(s) || [];
    if (!S || !S.bars || !S.bars.length) { for (const o of orders) ev.push({ type: "cancel", order: o.id, reason: "no bars for the session (halted / no data)" }); continue; }
    for (const p of state.positions) if (p.sym === s && p.entryDate !== date && p.shares > 0) p.sessionsHeld++;
    X.set(s, { S, daily: S.mode === "daily", adv: S.adv || 1e9, ptr: 0, live: orders.map(o => ({ o, rank: o.rank ?? rank++, state: "waiting", lod: Infinity, hod: -Infinity, firstVol: 0, orh: null })) });
  }
  const minutes = [...new Set([...X.values()].flatMap(x => x.S.bars.map(b => b.m)))].sort((a, b) => a - b);
  for (const m of minutes) {
    const here = [];
    for (const [s, x] of X) { const b = x.S.bars[x.ptr]; if (b && b.m === m) { here.push([s, x, b, x.ptr === 0]); x.ptr++; } }
    // phase A: next-open exits, stops and trims (positions existing before this minute)
    for (const [s, x, b, first] of here) {
      const at = { date, m };
      if (first) for (const p of state.positions.filter(q => q.sym === s && q.pendingExit && q.shares > 0)) { const r = p.pendingExit; p.pendingExit = null; exitShares(p, p.shares, adverse(b.o, sideOf(p.dir, false), slipBps(cfg, x.adv, true)), at, "exit", r, state, ev); }
      for (const p of state.positions.filter(q => q.sym === s && q.shares > 0)) manageBar(p, b, at, cfg, x.adv, state, ev);
    }
    // phase B: entries, in plan-rank order across symbols
    const waiting = here.flatMap(([s, x, b, first]) => x.live.filter(L => L.state === "waiting").map(L => [L, x, b, first])).sort((a, b) => a[0].rank - b[0].rank);
    for (const [L, x, b, first] of waiting) entryStep(L, x, b, first, date, state, cfg, systems, ev);
  }
  for (const [s, x] of X) {
    for (const L of x.live) if (L.state === "waiting") ev.push({ type: "cancel", order: L.o.id, reason: "not triggered" });
    const C = x.S.close; if (!C || !fin(C.c)) continue;
    for (const p of state.positions.filter(q => q.sym === s && q.shares > 0)) closeDecisions(p, C, { date, m: 960 }, cfg, x.adv, state, ev, x.S.reportTonight);
  }
  return ev;
}

module.exports = { replaySession, openRiskR, slipBps };
