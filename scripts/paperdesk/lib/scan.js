// Setup scanners: pure code over daily bars at signal index i (the last completed session before the plan date).
// scanSetup(setup, ctx) -> [candidate]. A candidate carries the price levels its entry/stop rules refer to,
// facts for the thesis, a score for ranking, grade (A+ / B) and scenario tags. No judgment here.
const M = require("./market.js");
const fin = x => typeof x === "number" && isFinite(x);
const f2 = x => (+x).toFixed(2);

function gateOpen(system, setup, reg) {
  const g = (system.regimeGate || {})[setup.direction] || "any";
  if (setup.scan.type === "parabolic_index") return { open: true, reason: "washout setup ignores the trend gate" };
  const q = reg.qqq || {};
  switch (g) {
    case "any": return { open: true, reason: "no market gate" };
    case "not_downtrend": return reg.trend === "downtrend" ? { open: false, reason: "QQQ downtrend (close < 50-day, 9 < 21 EMA)" } : { open: true, reason: `QQQ ${reg.trend}` };
    case "ml_index":
      if (q.ema9 < q.ema21) return { open: false, reason: "ML: no longs while QQQ 9 EMA < 21 EMA" };
      if (q.close < q.ema21 && q.ema21Slope < 0) return { open: false, reason: "ML: QQQ bouncing into a declining 21 EMA" };
      return { open: true, reason: "ML: QQQ 9 > 21 EMA" };
    case "jlaw_threshold": return reg.label === "risk-on" ? { open: true, reason: "JLaw: healthy market, normal bar" } : { open: true, aPlusOnly: true, reason: `JLaw: ${reg.label} market raises the bar (A+ only)` };
    case "weekly_below_9": return { open: true, reason: "short gate checked per stock (weekly below 9 EMA)" };
    default: return { open: true, reason: g };
  }
}

function base(ctx, sym, setup) {
  const { P, i, cfg, system } = ctx, t = P.T.get(sym), I = M.ind(P, sym);
  if (!t || !I || !fin(t.c[i]) || !fin(I.atr14[i])) return null;
  const p = setup.scan.params || {}, u = system.universe || {};
  const minAdr = Math.max(p.minAdrPct || 0, u.minAdrPct || 0), minAdv = Math.max(p.minAdv20Dollar || 0, u.minAdv20Dollar || 0);
  if (I.adr20[i] < minAdr || I.liqDv20[i] < minAdv) return null;
  return { t, I, p, c: t.c[i], h: t.h[i], l: t.l[i], o: t.o[i], atr: I.atr14[i], rs: ctx.rs.get(sym) };
}
function trendTemplate(I, c, i) { return c > I.sma50[i] && I.sma50[i] > I.sma150[i] && I.sma150[i] > I.sma200[i] && I.sma200[i] > I.sma200[i - 20]; }
function grade(ctx, b, extra = true) {
  const sec = M.sectorOk(ctx.P, ctx.i, b.sym);
  return (b.rs >= 90 && sec !== false && extra && ctx.reg.label === "risk-on") ? "A+" : "B";
}
function rsNear(I, i, pct) { return !pct || (fin(I.rs[i]) && fin(I.rsHi50[i]) && I.rs[i] >= I.rsHi50[i] * (1 - pct / 100)); }

const SCAN = {
  ema_pullback(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, c, l, h, atr } = b, i = ctx.i;
    if (!(b.rs >= (p.minRsRank || 0))) return null;
    const st = p.stack.map(k => I[k][i]); if (!st.every(fin)) return null;
    for (let k = 1; k < st.length; k++) if (!(st[k - 1] > st[k])) return null;
    let touched = null;
    for (const k of p.touch) { const ma = I[k][i]; if (!fin(ma)) continue;
      if (l <= ma * (1 + p.touchPct / 100) && (p.closeAboveTouch ? c >= ma : c >= ma * (1 - p.touchPct / 100))) { if (p.requireRisingTouch && !(ma > I[k][i - 3])) continue; touched = { k, ma }; break; } }
    if (!touched) return null;
    const pull = (I.hi10[i] - c) / atr; if (pull < (p.minPullbackAtr || 0)) return null;
    if ((I.hi10[i] - touched.ma) / atr > (p.maxExtAtr || 99) + (p.minPullbackAtr || 0)) return null;
    if (!rsNear(I, i, p.rsNearHighPct)) return null;
    const sec = M.sectorOk(ctx.P, i, sym); if (p.requireSector && sec === false) return null;
    return { score: b.rs + pull, levels: { signal_high: h, signal_low: l, lo10: I.lo10[i], touch_ma: touched.ma, hi10: I.hi10[i] }, sector: sec,
      facts: `RS ${b.rs}, ${p.stack.join(">")}, pulled back ${pull.toFixed(1)} ATR into the ${touched.k} (${f2(touched.ma)})`, b };
  },
  high52_breakout(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, c, atr } = b, i = ctx.i;
    if (!(b.rs >= (p.minRsRank || 0)) || !fin(I.hi252[i])) return null;
    if (c < I.hi252[i] * (1 - p.withinPct / 100)) return null;
    if (p.trendTemplate && !trendTemplate(I, c, i)) return null;
    const depth = (I.hi252[i] - Math.min(...Array.from(b.t.l.slice(Math.max(0, i - 30), i + 1)).filter(fin))) / I.hi252[i] * 100;
    if (depth > (p.maxBaseDepthPct || 99)) return null;
    return { score: b.rs + 5 - (I.hi252[i] - c) / atr, levels: { hi252: I.hi252[i], lo10: I.lo10[i], signal_high: b.h, signal_low: b.l }, facts: `RS ${b.rs}, ${((I.hi252[i] / c - 1) * 100).toFixed(1)}% under its 52-week high ${f2(I.hi252[i])}, 30-day depth ${depth.toFixed(0)}%`, b };
  },
  tight_base(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, c, t } = b, i = ctx.i;
    if (!(b.rs >= (p.minRsRank || 0))) return null;
    if (p.trendTemplate && !trendTemplate(I, c, i)) return null;
    if (!rsNear(I, i, p.rsNearHighPct)) return null;
    const sec = M.sectorOk(ctx.P, i, sym); if (p.requireSector && sec === false) return null;
    for (const N of [p.baseMin, Math.round((p.baseMin + p.baseMax) / 2), p.baseMax]) {
      if (i - N < 0) continue;
      let hi = -Infinity, lo = Infinity; for (let j = i - N + 1; j <= i; j++) { if (fin(t.h[j]) && t.h[j] > hi) hi = t.h[j]; if (fin(t.l[j]) && t.l[j] < lo) lo = t.l[j]; }
      const depth = (hi - lo) / hi * 100; if (depth > p.maxDepthPct) continue;
      if (c < hi * (1 - p.withinPctOfHigh / 100)) continue;
      const tight = (I.hi10[i] - I.lo10[i]) / hi * 100; if (tight > p.contraction * depth) continue;
      let v10 = 0, n = 0; for (let j = i - 9; j <= i; j++) if (fin(t.v[j])) { v10 += t.v[j]; n++; }
      const dry = (v10 / n) / I.vol50[i]; if (dry > p.volDryUp) continue;
      if (hi === t.h[i] && c >= hi * 0.995) continue;           // already breaking out today: no base entry tomorrow
      return { score: b.rs + 10 - tight, levels: { base_high: hi, lo10: I.lo10[i], signal_high: b.h, signal_low: b.l }, sector: sec,
        facts: `RS ${b.rs}, ${N}-session base ${depth.toFixed(0)}% deep, last 10 sessions ${tight.toFixed(1)}% tight, volume ${(dry * 100).toFixed(0)}% of 50-day`, b };
    }
    return null;
  },
  post_earnings_drift(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, t } = b, i = ctx.i, P = ctx.P;
    for (let g = i - p.minAfter; g >= i - p.maxAfter && g > 1; g--) {
      if (!fin(t.o[g]) || !fin(t.c[g - 1])) continue;
      const gap = (t.o[g] / t.c[g - 1] - 1) * 100; if (gap < p.minGapPct || !(t.v[g] >= p.minVolMult * I.vol50[g - 1])) continue;
      const rep = ctx.earningsOn(sym, P.dates[g], P.dates[g - 1]); if (rep === false || rep === null) continue;   // null = unknown coverage
      let held = true, hiS = -Infinity; for (let j = g; j <= i; j++) { if (t.c[j] < t.l[g]) held = false; if (t.h[j] > hiS) hiS = t.h[j]; }
      if (!held) return null;
      const tight = Math.max(t.h[i], t.h[i - 1], t.h[i - 2]) - Math.min(t.l[i], t.l[i - 1], t.l[i - 2]);
      if (tight > p.tightAtr * b.atr) return null;
      return { score: (b.rs || 50) + gap, levels: { hi_since_gap: hiS, gap_low: t.l[g], signal_high: b.h, signal_low: b.l }, facts: `earnings gap +${gap.toFixed(1)}% on ${P.dates[g]} (${(t.v[g] / I.vol50[g - 1]).toFixed(1)}× volume), held above the gap-day low ${f2(t.l[g])}, 3-day range ${(tight / b.atr).toFixed(1)} ATR`, b };
    }
    return null;
  },
  washout(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, t, c, h, l, atr } = b, i = ctx.i;
    let mx = -Infinity; for (let j = i - p.dropSessions; j <= i; j++) if (t.c[j] > mx) mx = t.c[j];
    const drop = (c / mx - 1) * 100; if (drop > -p.minDropPct) return null;
    if (!(l <= I.ema9[i] - p.minBelowEma9Atr * atr)) return null;
    if (h - l <= 0 || (c - l) / (h - l) < p.reversalCloseLoc) return null;
    return { score: -drop, levels: { signal_high: h, signal_low: l, lo10: I.lo10[i] }, facts: `down ${(-drop).toFixed(0)}% in ${p.dropSessions} sessions, low ${((I.ema9[i] - l) / atr).toFixed(1)} ATR under the 9 EMA, closed in the top ${(100 - 100 * (c - l) / (h - l)).toFixed(0)}% of the range`, b };
  },
  ma50_first_pullback_short(ctx, sym, setup) {
    const b = base(ctx, sym, setup); if (!b) return null; const { I, p, t, c, h, l } = b, i = ctx.i;
    if (!(c < I.ema45[i])) return null;                         // weekly-below-9-EMA proxy
    if (!(c < I.ema50[i]) || !(h >= I.ema50[i] * (1 - p.nearPct / 100))) return null;
    let brk = -1;
    for (let k = i - 1; k >= i - p.breakWithin; k--) { if (t.c[k] < I.ema50[k] && t.c[k - 1] >= I.ema50[k - 1]) { brk = k; break; } }
    if (brk < 0) return null;
    let above = 0; for (let k = brk - 1; k >= brk - p.aboveSessions && k >= 0; k--) if (t.c[k] >= I.ema50[k]) above++;
    if (above < p.aboveSessions - 2) return null;
    for (let k = brk + 1; k < i; k++) if (t.c[k] > I.ema50[k]) return null;   // must be the FIRST pullback
    return { score: (100 - (b.rs || 50)), levels: { signal_low: l, signal_high: h }, facts: `first break of the 50 EMA on ${ctx.P.dates[brk]} after ${above} sessions above; bounced into it (${f2(I.ema50[i])}) and closed below`, b };
  },
  parabolic_index(ctx, sym, setup) {
    const p = setup.scan.params; if (sym !== p.symbol) return null;
    const q = ctx.reg[p.index.toLowerCase()]; if (!q || !(q.distEma9Pct <= p.maxDistEma9Pct)) return null;
    const t = ctx.P.T.get(sym); if (!t) return null; const i = ctx.i;
    return { score: 100, levels: { signal_high: t.h[i], signal_low: t.l[i] }, facts: `${p.index} ${q.distEma9Pct}% below its 9 EMA`, b: { t, I: M.ind(ctx.P, sym), c: t.c[i], atr: M.ind(ctx.P, sym).atr14[i], rs: null } };
  },
};

// EP lane: names whose report makes session D's open the first reaction. Conditional orders only.
function scanEP(ctx, setup, syms) {
  const out = [], p = setup.scan.params, i = ctx.i, P = ctx.P;
  for (const sym of syms) {
    const rep = ctx.reactsOn(sym); if (!rep) continue;
    const t = P.T.get(sym), I = M.ind(P, sym); if (!t || !I || !fin(t.c[i]) || !fin(I.atr14[i]) || !fin(I.vol50[i])) continue;
    let below = 0, n = 0; for (let k = i - p.neglectSessions + 1; k <= i; k++) if (fin(I.sma200[k])) { n++; if (t.c[k] < I.sma200[k]) below++; }
    const neglected = n > 20 && below / n >= 0.6;
    out.push({ sym, score: (neglected ? 20 : 0) + Math.log10(I.adv20[i]), levels: { prev_close: t.c[i], signal_high: t.h[i], signal_low: t.l[i] }, neglected, report: rep,
      facts: `reports ${rep.time} ${rep.date}${neglected ? "; neglected (below the 200-day most of the last 60 sessions)" : ""}`, b: { t, I, c: t.c[i], atr: I.atr14[i], rs: ctx.rs.get(sym) } });
  }
  return out;
}

function scanSetup(setup, ctx, syms) {
  const system = ctx.systems.get(setup.system), gate = gateOpen(system, setup, ctx.reg);
  const sctx = { ...ctx, system };
  if (!gate.open) return { gate, cands: [] };
  let raw;
  if (setup.scan.type === "ep_earnings") raw = scanEP(sctx, setup, syms.ep);
  else if (setup.scan.type === "parabolic_index") raw = [SCAN.parabolic_index(sctx, setup.scan.params.symbol, setup)].filter(Boolean).map(x => ({ ...x, sym: setup.scan.params.symbol }));
  else { raw = []; for (const sym of syms.core) { const r = SCAN[setup.scan.type](sctx, sym, setup); if (r) raw.push({ ...r, sym }); } }
  const cands = [];
  for (const r of raw) {
    r.b.sym = r.sym;
    // EP: B before the open (gap quality unknown); only the agent, after reading the release, may grade it A+
    let g = setup.lane === "ep" ? "B" : grade(sctx, r.b);
    if (gate.aPlusOnly && g !== "A+") continue;
    cands.push({ sym: r.sym, setup: setup.id, system: setup.system, dir: setup.direction, score: +r.score.toFixed(2), grade: g, levels: r.levels, facts: r.facts,
      close: r.b.c, atr: r.b.atr, adrPct: M.ind(ctx.P, r.sym).adr20[ctx.i], adv20: M.ind(ctx.P, r.sym).adv20[ctx.i], vol50: M.ind(ctx.P, r.sym).vol50[ctx.i], rs: r.b.rs ?? null,
      sector: M.sectorOk(ctx.P, ctx.i, r.sym), theme: (M.themeFor(r.sym) || {}).name || null, cluster: M.clusterOf(r.sym, ctx.cfg), report: r.report || null, neglected: r.neglected || false });
  }
  cands.sort((a, b) => b.score - a.score);
  return { gate, cands };
}
module.exports = { scanSetup, gateOpen };
