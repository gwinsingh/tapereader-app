// Market regime + universe + cross-sectional RS rank + theme/cluster lookup, all from the panel at index i
// (i = the last COMPLETED session before the plan date). Pure code, no judgment.
const { indicators } = require("./panel.js");
const { THEMES, themeOf } = require("../../rs/lib/themes.js");
const THEME_OF = themeOf();
const BENCH = ["QQQ", "SPY", "IWM"];
const KEEP_FUNDS = new Set(["QQQ", "SPY", "IWM", "DIA", "TQQQ", "SQQQ", "SOXL", "SMH", "SOXX", "IGV", "XLK", "XLF", "XLE", "XLV", "XLI", "XLY", "XLP", "XLU", "XLB", "XLRE", "XLC", "XBI", "KRE", "GDX", "GLD", "SLV", "URA", "ITA", "UFO", "CIBR", "QTUM", "IBIT", "ARKK", "TAN", "XOP", "XHB", "XRT", "DRAM", "KWEB"]);
for (const k of Object.keys(THEMES)) if (THEMES[k].etf) KEEP_FUNDS.add(THEMES[k].etf);

const cache = new Map();
function ind(P, sym) {
  if (cache.has(sym)) return cache.get(sym);
  const t = P.T.get(sym); if (!t) return null;
  const I = indicators(t, P.T.get("QQQ")); cache.set(sym, I); return I;
}
function clearCache() { cache.clear(); }

function regime(P, i) {
  const out = { date: P.dates[i], tags: [] };
  for (const s of BENCH) {
    const t = P.T.get(s), I = ind(P, s); if (!t || !I) continue;
    out[s.toLowerCase()] = { close: +t.c[i].toFixed(2), ema9: +I.ema9[i].toFixed(2), ema21: +I.ema21[i].toFixed(2), sma50: +I.sma50[i].toFixed(2), sma200: +I.sma200[i].toFixed(2), atr: +I.atr14[i].toFixed(2),
      ema21Slope: +(I.ema21[i] - I.ema21[i - 5]).toFixed(2), ema50Slope: +(I.ema50[i] - I.ema50[i - 5]).toFixed(2), distEma9Pct: +((t.c[i] / I.ema9[i] - 1) * 100).toFixed(2) };
  }
  const q = out.qqq;
  if (!q) { out.label = "unknown"; return out; }
  const up = q.close > q.sma50 && q.ema9 > q.ema21, down = q.close < q.sma50 && q.ema9 < q.ema21;
  out.trend = up ? "uptrend" : down ? "downtrend" : "chop";
  out.label = up ? "risk-on" : down ? "risk-off" : "neutral";
  out.tags.push(`QQQ ${out.trend}`);
  if (up && Math.abs(q.close - q.ema21) <= q.atr) out.tags.push("index pullback to 21 EMA");
  if (q.distEma9Pct > 3) out.tags.push("index extended above 9 EMA");
  if (q.close < q.sma200) out.tags.push("QQQ below 200-day");
  if (q.distEma9Pct <= -15) out.tags.push("QQQ ≥15% below 9 EMA (parabolic washout)");
  if (out.iwm) out.tags.push(`IWM ${out.iwm.close > out.iwm.sma50 ? "above" : "below"} 50-day`);
  out.qqqUpAtEntry = up;                       // swingbook adaptive trail input
  return out;
}

// Cross-sectional RS rank (0-100) on a blend of 21/63/126-session returns, stocks in the core universe only.
function rsRanks(P, i, syms) {
  const score = [];
  for (const s of syms) { const I = ind(P, s); if (!I) continue; const a = I.ret21[i], b = I.ret63[i], c = I.ret126[i]; if (![a, b, c].every(isFinite)) continue; score.push([s, 0.4 * b + 0.2 * a + 0.4 * c]); }
  score.sort((x, y) => x[1] - y[1]);
  const out = new Map(); score.forEach(([s], k) => out.set(s, Math.round(100 * k / Math.max(1, score.length - 1))));
  return out;
}

// Core universe at index i: stock, price >= minPrice, 20-day avg $ volume >= min, enough history.
function universe(P, i, cfg) {
  const U = cfg.universe, core = [], ep = [];
  for (const [s, t] of P.T) {
    if (t.kind !== "stock") continue;
    const c = t.c[i]; if (!isFinite(c)) continue;
    const I = ind(P, s); if (!I) continue;
    const adv = I.liqDv20[i]; if (!isFinite(adv)) continue;
    if (c >= U.minPrice && adv >= U.minAdv20Dollar && isFinite(I.ema50[i])) core.push(s);
    else if (c >= U.epLane.minPrice && adv >= U.epLane.minAdv20Dollar) ep.push(s);
  }
  return { core, ep };
}

function themeFor(sym) { const x = THEME_OF[sym]; if (!x) return null; const th = THEMES[x.primary]; return { id: x.primary, name: th.name, etf: th.etf }; }
function clusterOf(sym, cfg) {
  for (const [k, list] of Object.entries(cfg.portfolio.clusters)) if (list.includes(sym)) return k;
  const th = themeFor(sym); return th ? th.id : null;
}
// Sector/theme confirmation (JLaw layer 2): theme ETF above its 50-day; null when unknown.
function sectorOk(P, i, sym) {
  const th = themeFor(sym); if (!th || !th.etf) return null;
  const t = P.T.get(th.etf), I = ind(P, th.etf); if (!t || !I || !isFinite(I.sma50[i])) return null;
  return t.c[i] > I.sma50[i];
}

module.exports = { regime, rsRanks, universe, ind, clearCache, themeFor, clusterOf, sectorOk, KEEP_FUNDS };
