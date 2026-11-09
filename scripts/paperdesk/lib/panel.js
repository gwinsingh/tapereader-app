// Date x ticker panel from the grouped-daily caches (RS cache read-only + our own), plus per-symbol indicators.
// Split safety follows scripts/rs/lib/panel.js: a cached day fetched BEFORE a later split is divided by the ratio.
// Indicators at index i use bars 0..i only (no look-ahead); a plan for session D uses index of D-1.
const fs = require("fs"), path = require("path");
const G = require("./grouped.js");
const { classify } = require("../../rs/lib/panel.js");
const RS_REF = path.join(__dirname, "..", "..", "rs", ".data", "ref");
const nan = n => { const a = new Float32Array(n); a.fill(NaN); return a; };

let REF = null;
function ref() { if (REF === null) { try { REF = JSON.parse(fs.readFileSync(path.join(RS_REF, "tickers.json"), "utf8")); } catch (e) { REF = { tickers: {} }; } } return REF; }

function loadPanel({ from = "0000", to = "9999", lastN = null, minEverDollarVol = 5e6, keep = null, log = () => {} } = {}) {
  let dates = G.cachedSessions(from, to);
  if (lastN) dates = dates.slice(-lastN);
  const days = [];
  for (const d of dates) { const rec = G.readDay(d); if (rec && !rec.holiday && rec.rows) days.push({ d, rows: rec.rows, fetched: rec.fetched || 0 }); }
  const D = days.length, ds = days.map(x => x.d), R = ref();
  const T = new Map(), kind = new Map();
  days.forEach((day, i) => {
    for (const r of day.rows) {
      const s = r[0];
      let k = kind.get(s); if (k === undefined) { k = classify(s, R); kind.set(s, k); }
      if (!k || (k === "fund" && keep && !keep.has(s))) continue;
      let t = T.get(s);
      if (!t) { t = { sym: s, kind: k, o: nan(D), h: nan(D), l: nan(D), c: nan(D), v: nan(D), maxDv: 0 }; T.set(s, t); }
      t.o[i] = r[1]; t.h[i] = r[2]; t.l[i] = r[3]; t.c[i] = r[4]; t.v[i] = r[5];
      const dv = r[4] * r[5]; if (dv > t.maxDv) t.maxDv = dv;
    }
  });
  for (const [s, t] of T) if (t.maxDv < minEverDollarVol && !(keep && keep.has(s))) T.delete(s);
  let nAdj = 0;
  try {
    const sp = JSON.parse(fs.readFileSync(path.join(RS_REF, "splits.json"), "utf8")).splits || [];
    for (const x of sp) {
      const t = T.get(x.ticker); if (!t || !x.split_from || !x.split_to || x.execution_date > ds[D - 1]) continue;
      const ratio = x.split_to / x.split_from, execMs = Date.parse(x.execution_date + "T04:00:00Z");
      days.forEach((day, i) => { if (day.d < x.execution_date && day.fetched && day.fetched < execMs && isFinite(t.c[i])) { for (const f of ["o", "h", "l", "c"]) t[f][i] /= ratio; t.v[i] *= ratio; nAdj++; } });
    }
  } catch (e) { /* no split file: fine */ }
  log(`panel: ${D} sessions ${ds[0]} -> ${ds[D - 1]}, ${T.size} tickers, ${nAdj} split-adjusted cells`);
  return { dates: ds, D, T, idx: new Map(ds.map((d, i) => [d, i])), name: s => (R.tickers[s] && R.tickers[s].name) || "" };
}

// ---- indicators (Float64, NaN-aware: a missing bar carries the previous value forward for MAs) ----
function ema(src, n) {
  const out = new Float64Array(src.length).fill(NaN), k = 2 / (n + 1); let e = NaN, cnt = 0, seed = 0;
  for (let i = 0; i < src.length; i++) {
    const x = src[i]; if (!isFinite(x)) { out[i] = e; continue; }
    if (cnt < n) { seed += x; cnt++; if (cnt === n) e = seed / n; out[i] = cnt === n ? e : NaN; continue; }
    e = x * k + e * (1 - k); out[i] = e;
  }
  return out;
}
function sma(src, n) {
  const out = new Float64Array(src.length).fill(NaN), q = []; let s = 0;
  for (let i = 0; i < src.length; i++) { const x = src[i]; if (isFinite(x)) { q.push(x); s += x; if (q.length > n) s -= q.shift(); } out[i] = q.length === n ? s / n : NaN; }
  return out;
}
// rolling max/min over the last n INDEX positions (monotonic deque, O(N)); NaN entries are skipped
function rollExt(src, n, isMax) {
  const out = new Float64Array(src.length).fill(NaN), dq = []; let h = 0;
  for (let i = 0; i < src.length; i++) {
    const x = src[i];
    if (isFinite(x)) { while (dq.length > h && (isMax ? src[dq[dq.length - 1]] <= x : src[dq[dq.length - 1]] >= x)) dq.pop(); dq.push(i); }
    while (dq.length > h && dq[h] <= i - n) h++;
    out[i] = dq.length > h ? src[dq[h]] : NaN;
  }
  return out;
}
const rollMax = (s, n) => rollExt(s, n, true), rollMin = (s, n) => rollExt(s, n, false);

// All indicators for one ticker. bench = QQQ ticker object (same panel) for RS.
function indicators(t, bench) {
  const D = t.c.length, c = t.c, h = t.h, l = t.l, v = t.v;
  const tr = new Float64Array(D).fill(NaN), rng = new Float64Array(D).fill(NaN), dv = new Float64Array(D).fill(NaN);
  let pc = NaN;
  for (let i = 0; i < D; i++) {
    if (!isFinite(c[i])) continue;
    tr[i] = isFinite(pc) ? Math.max(h[i] - l[i], Math.abs(h[i] - pc), Math.abs(l[i] - pc)) : h[i] - l[i];
    rng[i] = (h[i] - l[i]) / c[i] * 100; dv[i] = c[i] * v[i]; pc = c[i];
  }
  const I = {
    ema9: ema(c, 9), ema10: ema(c, 10), ema20: ema(c, 20), ema21: ema(c, 21), ema45: ema(c, 45), ema50: ema(c, 50), ema150: ema(c, 150),
    sma50: sma(c, 50), sma150: sma(c, 150), sma200: sma(c, 200),
    atr14: sma(tr, 14), adr20: sma(rng, 20), adv20: sma(dv, 20), vol50: sma(v, 50),
    hi252: rollMax(h, 252), hi20: rollMax(h, 20), lo20: rollMin(l, 20), hi10: rollMax(h, 10), lo10: rollMin(l, 10),
  };
  if (bench) {
    const rs = new Float64Array(D).fill(NaN);
    for (let i = 0; i < D; i++) if (isFinite(c[i]) && isFinite(bench.c[i])) rs[i] = c[i] / bench.c[i];
    I.rs = rs; I.rsLo10 = rollMin(rs, 10); I.rsHi50 = rollMax(rs, 50);
  }
  // 20-session MEDIAN dollar volume (one pump day can't lift a thin name into the universe; red-team #16)
  const med = new Float64Array(D).fill(NaN), win = [];
  for (let i = 0; i < D; i++) { if (isFinite(dv[i])) { win.push(dv[i]); if (win.length > 20) win.shift(); } if (win.length === 20) { const s = [...win].sort((a, b) => a - b); med[i] = (s[9] + s[10]) / 2; } }
  I.medDv20 = med;
  I.liqDv20 = I.adv20.map((x, i) => Math.min(x, med[i]));
  // returns over 21/63/126 sessions (for RS rank)
  const ret = n => { const o = new Float64Array(D).fill(NaN); for (let i = n; i < D; i++) if (isFinite(c[i]) && isFinite(c[i - n])) o[i] = c[i] / c[i - n] - 1; return o; };
  I.ret21 = ret(21); I.ret63 = ret(63); I.ret126 = ret(126);
  return I;
}
// index of the last bar with a close at or before i
function lastIdx(t, i) { for (let j = i; j >= 0; j--) if (isFinite(t.c[j])) return j; return -1; }

module.exports = { loadPanel, indicators, ema, sma, rollMax, rollMin, lastIdx, ref };
