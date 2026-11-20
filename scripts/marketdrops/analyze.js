// Market-drops study: part 1 of the analysis → .data/core.json
//   node scripts/marketdrops/analyze.js        (run breadth.js first)
// What it computes, all from daily data and all descriptive (no strategy is tested here):
//   1. the catalogue of S&P 500 and Nasdaq drops of 5%+ / 10%+ and every rally inside them, with what was visible in the first days of each rally
//   2. what surrounded each final low (volume, VIX, breadth, credit, follow-through day, moving-average reclaims, retests)
//   3. base rates: once a drop is 10% deep, how much deeper and longer did drops go
//   4. the look-alike test: do past paths that resemble the current one say anything about what came next
const L = require("./lib.js"), D = require("./drops.js");
const { bi, sma, ema, median, quantile, mean, pct } = L;

const NAMES = { "1950": "Korean War scare", "1953": "1953 recession", "1955": "Eisenhower heart attack", "1956": "1957 recession", "1959": "1960 slowdown", "1961": "Kennedy slide", "1966": "1966 credit crunch", "1967": "1968 gold and dollar scare", "1968": "1969–70 bear", "1971": "1971 Nixon shock",
  "1973": "1973–74 bear", "1975": "1975 pause", "1976": "1977 grind", "1978": "October 1978 massacre", "1979": "Volcker's Saturday", "1980": "1980 credit controls", "1980b": "1981–82 Volcker bear", "1983": "1984 correction", "1987": "1987 crash", "1989": "Friday the 13th mini-crash", "1990": "1990 Gulf War recession",
  "1997": "Asian crisis", "1998": "Russia and LTCM", "1999": "1999 rate scare", "2000": "Dot-com bust", "2007": "Financial crisis", "2010": "Flash crash and Greece", "2011": "US downgrade and euro crisis", "2015": "China devaluation and oil", "2018a": "Volmageddon", "2018b": "Q4 2018", "2020": "COVID crash",
  "2022": "2022 hiking-cycle bear", "2023": "Autumn 2023 yield spike", "2025": "April 2025 tariff crash", "2026": "Autumn 2026 (open)" };

function prep(sym, from) {
  const B = L.bars(sym).filter(b => b.d >= from), c = B.map(b => b.c), v = B.map(b => b.v);
  return { sym, B, c, v, e20: ema(c, 20), e9: ema(c, 9), s50: sma(c, 50), s200: sma(c, 200), v50: sma(v, 50) };
}
// ---- side series on their own calendars ----
const VIX = L.cboe("VIX"), VXO = L.fred("VXOCLS");
const vixAt = iso => { if (iso >= "1990-01-02") { const i = bi(VIX, iso); return i < 0 ? null : VIX[i]; } const i = L.idxAtOrBefore(VXO, iso); return i < 0 || L.daysBetween(VXO[i][0], iso) > 5 ? null : { d: VXO[i][0], c: VXO[i][1], h: VXO[i][1], l: VXO[i][1], o: VXO[i][1] }; };
function vixWindow(from, to) { const out = []; if (to >= "1990-01-02") { for (let i = Math.max(0, bi(VIX, from)); i < VIX.length && VIX[i].d <= to; i++) if (VIX[i].d >= from) out.push({ d: VIX[i].d, c: VIX[i].c, h: VIX[i].h }); } else for (const r of VXO) if (r[0] >= from && r[0] <= to) out.push({ d: r[0], c: r[1], h: r[1] }); return out; }
const BR = L.J("breadth.json"), brI = iso => { const i = L.idxAtOrBefore(BR.d.map(d => [d]), iso); return i; };
const brIdx = new Map(BR.d.map((d, i) => [d, i]));
// industry breadth (Ken French 49 industries, daily, from 1926): no survivorship problem, coarser than stocks
const IND = (() => { const t = L.french49(), rows = t.rows.filter(r => r[0] >= "1946-01-01"), n = t.head.length, lv = [], d = rows.map(r => r[0]);
  const level = Array.from({ length: n }, () => new Float64Array(rows.length)); const cur = new Array(n).fill(100);
  rows.forEach((r, i) => { for (let k = 0; k < n; k++) { const x = r[k + 1]; if (isFinite(x)) cur[k] *= 1 + x / 100; level[k][i] = cur[k]; } });
  const a50 = new Float64Array(rows.length), a200 = new Float64Array(rows.length), lo63 = new Float64Array(rows.length), up = new Float64Array(rows.length);
  for (let k = 0; k < n; k++) { const s5 = sma(Array.from(level[k]), 50), s2 = sma(Array.from(level[k]), 200), mn = L.rollMin(Array.from(level[k]), 63);
    for (let i = 0; i < rows.length; i++) { if (level[k][i] > s5[i]) a50[i]++; if (level[k][i] > s2[i]) a200[i]++; if (level[k][i] <= mn[i]) lo63[i]++; if (rows[i][k + 1] > 0) up[i]++; } }
  const idx = new Map(d.map((x, i) => [x, i]));
  return { d, idx, head: t.head, a50: Array.from(a50, x => x / n * 100), a200: Array.from(a200, x => x / n * 100), lo63: Array.from(lo63, x => x / n * 100), up: Array.from(up, x => x / n * 100), last: d[d.length - 1] }; })();
const BAA = L.fred("BAA10Y"), DGS2 = L.fred("DGS2"), DGS10 = L.fred("DGS10"), DFF = L.fred("DFF");
const TGT = (() => { const a = L.fred("DFEDTAR"), u = L.fred("DFEDTARU"), l = L.fred("DFEDTARL"); const mid = u.map((r, i) => [r[0], (r[1] + (l[i] ? l[i][1] : r[1] - 0.25)) / 2]); return a.concat(mid); })();
function fedStance(iso) {                                    // change in the policy rate over the prior ~6 months and the direction of the last move
  if (iso >= "1983-04-01") { const now = L.valueAt(TGT, iso), ago = L.valueAt(TGT, L.addDays(iso, -183)); let last = 0; const i = L.idxAtOrBefore(TGT, iso); for (let k = i; k > 0; k--) if (TGT[k][1] !== TGT[k - 1][1]) { last = Math.sign(TGT[k][1] - TGT[k - 1][1]); break; }
    return { rate: now, chg6m: Math.round((now - ago) * 100) / 100, last, stance: now - ago >= 0.25 ? "hiking" : now - ago <= -0.25 ? "cutting" : last > 0 ? "hold after hikes" : "hold after cuts" }; }
  const avg = d0 => { const i = L.idxAtOrBefore(DFF, d0); let s = 0, n = 0; for (let k = Math.max(0, i - 29); k <= i; k++) { s += DFF[k][1]; n++; } return n ? s / n : NaN; }; const now = avg(iso), ago = avg(L.addDays(iso, -183));
  if (!isFinite(now) || !isFinite(ago)) return { rate: null, chg6m: null, stance: "n/a" };
  return { rate: Math.round(now * 100) / 100, chg6m: Math.round((now - ago) * 100) / 100, last: Math.sign(now - ago), stance: now - ago >= 0.5 ? "hiking" : now - ago <= -0.5 ? "cutting" : "hold" };
}

// ---- follow-through day (IBD style): day 4 or later of an attempted rally, index up >= thr % on higher volume than the day before, low not undercut ----
function followThrough(P, lowI, thr = 1.25, maxDay = 15) { const { c, v } = P; for (let k = 4; k <= maxDay && lowI + k < c.length; k++) { const i = lowI + k; let cutBefore = false; for (let j = lowI + 1; j <= i; j++) if (c[j] < c[lowI]) { cutBefore = true; break; } if (cutBefore) return null;
    if ((c[i] / c[i - 1] - 1) * 100 >= thr && v[i] > v[i - 1]) return k; } return null; }
function firstAbove(c, ma, lowI, cap = 400) { for (let k = 1; k <= cap && lowI + k < c.length; k++) if (isFinite(ma[lowI + k]) && c[lowI + k] > ma[lowI + k]) return k; return null; }

function rallyFeatures(P, ep, r, prev) {
  const { B, c, v, e20, s50, s200, v50 } = P, i = r.lowI, g = k => (i + k < c.length ? (c[i + k] / c[i] - 1) * 100 : null), d = B[i].d;
  const f = { d1: g(1), g3: g(3), g5: g(5), g10: g(10), g20: g(20), volLow: v50[i] ? v[i] / v50[i] : null, volD1: i + 1 < c.length && v50[i] ? v[i + 1] / v50[i] : null, gap1: i + 1 < c.length ? (B[i + 1].o / c[i] - 1) * 100 : null,
    dist200: isFinite(s200[i]) ? (c[i] / s200[i] - 1) * 100 : null, dist50: isFinite(s50[i]) ? (c[i] / s50[i] - 1) * 100 : null, slope200: isFinite(s200[i - 20]) ? (s200[i] / s200[i - 20] - 1) * 100 : null,
    down5: (c[i] / c[i - 5] - 1) * 100, down10: (c[i] / c[i - 10] - 1) * 100, lowDayRet: (c[i] / c[i - 1] - 1) * 100, closeLoc: B[i].h > B[i].l ? (c[i] - B[i].l) / (B[i].h - B[i].l) : null };
  // up days in the first five sessions, biggest single up day in the first ten
  let ups = 0, big = 0; for (let k = 1; k <= 5 && i + k < c.length; k++) if (c[i + k] > c[i + k - 1]) ups++; for (let k = 1; k <= 10 && i + k < c.length; k++) big = Math.max(big, (c[i + k] / c[i + k - 1] - 1) * 100); f.ups5 = ups; f.bigUp10 = big;
  f.ftd = followThrough(P, i); f.ftdStrict = followThrough(P, i, 1.7);
  const cutK = r.cutI >= 0 ? r.cutI - i : Infinity; const a20 = firstAbove(c, e20, i), a50 = firstAbove(c, s50, i), a200 = firstAbove(c, s200, i);
  f.r20 = a20; f.r50 = a50; f.r200 = a200; f.r20ok = a20 != null && a20 < cutK; f.r50ok = a50 != null && a50 < cutK; f.r200ok = a200 != null && a200 < cutK;
  f.r50gain = a50 != null ? (c[i + a50] / c[i] - 1) * 100 : null; f.r200gain = a200 != null ? (c[i + a200] / c[i] - 1) * 100 : null; f.r20gain = a20 != null ? (c[i + a20] / c[i] - 1) * 100 : null;
  // VIX: peak (highest close) in the 10 sessions to the low, and three days later
  const vw = vixWindow(L.addDays(d, -15), d), vAfter = vixWindow(L.addDays(d, 1), L.addDays(d, 6)); if (vw.length) { f.vixLow = vw[vw.length - 1].c; f.vixPeak = Math.max(...vw.slice(-10).map(x => x.c)); f.vix3 = vAfter.length ? vAfter[Math.min(2, vAfter.length - 1)].c : null; }
  // breadth at the low
  const b = brIdx.get(d); if (b != null && BR.a200[b] != null) { f.a50 = BR.a50[b]; f.a200 = BR.a200[b]; let nl = 0; for (let k = Math.max(0, b - 5); k <= b; k++) nl = Math.max(nl, BR.nl[k] || 0); f.nl = nl;
    let dn90 = 0, up90 = 0, th = 0, h20 = 0, a50max = 0; for (let k = Math.max(0, b - 10); k <= b; k++) if (BR.upv[k] != null && BR.upv[k] <= 10) dn90++; for (let k = b + 1; k <= Math.min(BR.d.length - 1, b + 10); k++) { if (BR.upv[k] >= 90) up90++; }
    for (let k = b + 1; k <= Math.min(BR.d.length - 1, b + 20); k++) { h20 = Math.max(h20, BR.h20[k] || 0); if (k >= b + 10) { let s = 0; for (let j = k - 9; j <= k; j++) s += BR.adv[j] || 0; th = Math.max(th, s / 10); } }
    for (let k = b + 1; k <= Math.min(BR.d.length - 1, b + 40); k++) a50max = Math.max(a50max, BR.a50[k] || 0);
    f.dn90 = dn90; f.up90 = up90; f.adv10 = th; f.h20 = h20; f.a50max40 = a50max; }
  const q = IND.idx.get(d); if (q != null) { f.ia50 = IND.a50[q]; f.ia200 = IND.a200[q]; let m = 0; for (let k = Math.max(0, q - 5); k <= q; k++) m = Math.max(m, IND.lo63[k]); f.ilo = m; let u = 0; for (let k = q + 1; k <= Math.min(IND.d.length - 1, q + 10); k++) u += IND.up[k]; f.iup10 = u / 10; }
  const bx = L.idxAtOrBefore(BAA, d); if (bx >= 0 && L.daysBetween(BAA[bx][0], d) < 6) { f.baa = BAA[bx][1]; let mx = 0; for (let k = Math.max(0, bx - 60); k <= bx; k++) mx = Math.max(mx, BAA[k][1]); f.baaOffPeak = BAA[bx][1] - mx; }
  // divergences against the previous swing low of the same episode (only meaningful when price made a lower low)
  if (prev) { f.lowerLow = c[i] < c[prev.lowI]; if (prev.f.vixPeak != null && f.vixPeak != null) f.vixLower = f.vixPeak < prev.f.vixPeak; if (prev.f.nl != null && f.nl != null) f.nlFewer = f.nl < prev.f.nl; if (prev.f.ilo != null && f.ilo != null) f.iloFewer = f.ilo < prev.f.ilo; if (prev.f.a200 != null && f.a200 != null) f.a200Higher = f.a200 > prev.f.a200; }
  for (const k in f) if (typeof f[k] === "number") f[k] = Math.round(f[k] * 100) / 100;
  return f;
}

function catalogue(sym, from, minDepth = 10, rev = 5) {
  const P = prep(sym, from), { B, c } = P, E = D.episodes(B, minDepth), seen = {};
  const out = E.map(e => {
    let id = e.peak.slice(0, 4); seen[id] = (seen[id] || 0) + 1; if (seen[id] > 1) id += "b";
    const R = D.rallies(B, e, rev); let prev = null;
    const rl = R.map(r => { const o = { ...r, cls: r.turn ? "turn" : r.failed ? "failed" : r.lowI > e.lowI ? "post" : "pending", f: null }; o.f = rallyFeatures(P, e, r, prev); prev = o; return o; });
    const st = fedStance(e.peak), i1 = e.endI < 0 ? c.length - 1 : e.endI;
    return { id, sym, ...e, name: "", peakPx: c[e.peakI], lowPx: c[e.lowI], fed: st, rallies: rl, nFailed: rl.filter(r => r.cls === "failed").length };
  });
  // fix ids so that the first of two in one year gets "a"
  const cnt = {}; for (const e of out) cnt[e.id.slice(0, 4)] = (cnt[e.id.slice(0, 4)] || 0) + 1; for (const e of out) if (cnt[e.id.slice(0, 4)] > 1 && e.id.length === 4) e.id += "a";
  for (const e of out) e.name = NAMES[e.id] || NAMES[e.id.replace(/a$/, "")] || "";
  return { P, eps: out };
}

// ---- what surrounded each final low ----
function lowSignature(P, e) {
  const { B, c, v, v50, e20, s50, s200 } = P, i = e.lowI, d = B[i].d, turn = e.rallies.find(r => r.turn) || { f: {} }, o = { low: d };
  o.ftd = turn.f.ftd; o.r20 = turn.f.r20; o.r50 = turn.f.r50; o.r200 = turn.f.r200; o.r20gain = turn.f.r20gain; o.r50gain = turn.f.r50gain; o.r200gain = turn.f.r200gain;
  // false reclaims on the way down: closes back above the 50-day (after having been below) between peak and low
  let below = false, n50 = 0, n20 = 0, below20 = false; for (let k = e.peakI; k <= i; k++) { if (c[k] < s50[k]) below = true; else if (below && c[k] > s50[k]) { n50++; below = false; } if (c[k] < e20[k]) below20 = true; else if (below20 && c[k] > e20[k]) { n20++; below20 = false; } } o.false50 = n50; o.false20 = n20;
  // retest: the lowest close 5 to 60 sessions after the low, against the low
  let mn = Infinity, mnK = null; for (let k = 5; k <= 60 && i + k < c.length; k++) if (c[i + k] < mn) { mn = c[i + k]; mnK = k; } o.retest = isFinite(mn) ? (mn / c[i] - 1) * 100 : null; o.retestDay = mnK;
  // deepest pullback (close to close) inside the first 60 and 120 sessions after the low
  const pull = n => { let pk = c[i], dd = 0; for (let k = 1; k <= n && i + k < c.length; k++) { pk = Math.max(pk, c[i + k]); dd = Math.min(dd, c[i + k] / pk - 1); } return dd * 100; }; o.pull60 = pull(60); o.pull120 = pull(120);
  for (const k of [5, 10, 20, 40, 60, 120, 250]) o["g" + k] = i + k < c.length ? (c[i + k] / c[i] - 1) * 100 : null;
  // volume: the heaviest day in the 30 sessions around the low, relative to the 50-day average before the drop began
  const baseV = v50[e.peakI] || v50[i]; let mxV = 0, mxK = 0; for (let k = -30; k <= 10; k++) if (i + k > 0 && i + k < c.length && v[i + k] > mxV) { mxV = v[i + k]; mxK = k; } o.volPeak = baseV ? mxV / baseV : null; o.volPeakDay = mxK; o.volAtLow = baseV ? v[i] / baseV : null;
  // VIX: highest close of the episode and when, against the day of the low
  const vw = vixWindow(B[e.peakI].d, B[Math.min(c.length - 1, i + 20)].d); if (vw.length) { let m = vw[0]; for (const x of vw) if (x.c > m.c) m = x; o.vixMax = m.c; o.vixMaxDate = m.d; o.vixMaxLead = bi(B, d) - bi(B, m.d); const at = vixAt(d); o.vixAtLow = at ? at.c : null; const pk = vixAt(B[e.peakI].d); o.vixAtPeak = pk ? pk.c : null; }
  // breadth extremes
  const b = brIdx.get(d); if (b != null && BR.a200[b] != null) { const p0 = brIdx.get(B[e.peakI].d) || 0; let mA = 101, mD = null, mN = -1, mND = null; for (let k = p0; k <= Math.min(BR.d.length - 1, b + 10); k++) { if (BR.a200[k] != null && BR.a200[k] < mA) { mA = BR.a200[k]; mD = k; } if (BR.nl[k] != null && BR.nl[k] > mN) { mN = BR.nl[k]; mND = k; } }
    o.a200min = mA; o.a200minLead = b - mD; o.nlMax = mN; o.nlMaxDate = BR.d[mND]; o.nlMaxLead = b - mND; o.nlAtLow = BR.nl[b]; o.a50AtLow = BR.a50[b]; o.a200AtLow = BR.a200[b]; }
  const q = IND.idx.get(d), q0 = IND.idx.get(B[e.peakI].d); if (q != null && q0 != null) { let mN = -1, mND = null, mA = 101; for (let k = q0; k <= Math.min(IND.d.length - 1, q + 10); k++) { if (IND.lo63[k] > mN) { mN = IND.lo63[k]; mND = k; } mA = Math.min(mA, IND.a200[k]); } o.iloMax = mN; o.iloMaxLead = q - mND; o.iloAtLow = IND.lo63[q]; o.ia200min = mA; }
  // credit: Baa spread peak against the low; 2-year yield change during the drop
  const x0 = L.idxAtOrAfter(BAA, B[e.peakI].d), x1 = L.idxAtOrBefore(BAA, B[Math.min(c.length - 1, i + 60)].d); if (x0 < BAA.length && x1 > x0 && BAA[x0][0] <= B[e.peakI + 5].d) { let m = x0; for (let k = x0; k <= x1; k++) if (BAA[k][1] > BAA[m][1]) m = k; o.baaPeak = BAA[m][1]; o.baaPeakDate = BAA[m][0]; o.baaPeakLead = bi(B, d) - bi(B, BAA[m][0]); o.baaAtPeak = BAA[x0][1]; o.baaRise = BAA[m][1] - BAA[x0][1]; }
  const y0 = L.valueAt(DGS2, B[e.peakI].d), y1 = L.valueAt(DGS2, d); if (isFinite(y0) && B[e.peakI].d >= "1976-06-01") { o.y2AtPeak = y0; o.y2Chg = y1 - y0; }
  const f0 = fedStance(d); o.fedAtLow = f0.stance; // first policy-rate cut within 120 sessions either side of the low (target era)
  if (d >= "1983-06-01") { const a = L.idxAtOrAfter(TGT, B[Math.max(0, e.peakI)].d), z = L.idxAtOrBefore(TGT, B[Math.min(c.length - 1, i + 120)].d); for (let k = Math.max(1, a); k <= z; k++) if (TGT[k][1] < TGT[k - 1][1]) { o.firstCut = TGT[k][0]; o.firstCutLead = bi(B, d) - bi(B, TGT[k][0]); break; } for (let k = Math.max(1, a); k <= z; k++) if (TGT[k][1] > TGT[k - 1][1]) o.lastHike = TGT[k][0]; }
  for (const k in o) if (typeof o[k] === "number") o[k] = Math.round(o[k] * 100) / 100;
  return o;
}

// ---- base rates: from the first close at or below -X %, what came next ----
function crossing(P, eps, X) {
  const { c, B } = P, rows = [];
  for (const e of eps) { const i1 = e.endI < 0 ? c.length - 1 : e.endI; let k = -1; for (let j = e.peakI; j <= e.lowI; j++) if (c[j] <= c[e.peakI] * (1 - X / 100)) { k = j; break; } if (k < 0) continue;
    const fw = n => (k + n < c.length ? (c[k + n] / c[k] - 1) * 100 : null);
    rows.push({ id: e.id, name: e.name, peak: e.peak, cross: B[k].d, daysToCross: k - e.peakI, depthAtCross: (c[k] / c[e.peakI] - 1) * 100, finalDepth: e.depth, more: (c[e.lowI] / c[k] - 1) * 100, daysCrossToLow: e.lowI - k, daysToEnd: e.endI < 0 ? null : e.endI - k, open: e.open, fed: e.fed.stance, f21: fw(21), f63: fw(63), f126: fw(126), f252: fw(252),
      below200: P.s200[k] ? c[k] < P.s200[k] : null }); }
  return rows;
}

// ---- look-alike test ----
function analogs(P, eps5, N) {
  const { c, B } = P, cur = eps5[eps5.length - 1]; if (!cur || !cur.open) return null;
  const path = (i0, n) => { const o = []; for (let k = 0; k <= n; k++) o.push(Math.log(c[i0 + k] / c[i0]) * 100); return o; };
  const dist = (a, b) => Math.sqrt(mean(a.map((x, i) => (x - b[i]) ** 2)));
  const me = path(cur.peakI, N);
  // (a) peak-anchored: the first N sessions after each earlier 52-week high that led to a drop of 5%+
  const cand = eps5.filter(e => !e.open && e.peakI + N + 60 < c.length).map(e => { const p = path(e.peakI, N), f = k => (c[e.peakI + N + k] / c[e.peakI + N] - 1) * 100; let mn = 0; for (let k = 1; k <= 60; k++) mn = Math.min(mn, f(k));
    return { id: e.id, peak: e.peak, name: e.name, depthN: p[N], rmse: dist(me, p), corr: L.corr(me, p), f20: f(20), f60: f(60), worst60: mn, finalDepth: e.depth, p, after: Array.from({ length: 61 }, (_, k) => Math.round((Math.log(c[e.peakI + N + k] / c[e.peakI]) * 100) * 100) / 100) }; });
  cand.sort((a, b) => a.rmse - b.rmse);
  // leave-one-out: for every past episode, let its 5 nearest look-alikes (by the first N sessions) "forecast" the next 60 sessions
  const loo = cand.map(x => { const nb = cand.filter(y => y.id !== x.id).map(y => ({ y, d: dist(x.p, y.p) })).sort((a, b) => a.d - b.d).slice(0, 5); return { id: x.id, actual: x.f60, forecast: mean(nb.map(z => z.y.f60)), nearest: nb[0].y.id, nearestF60: nb[0].y.f60, nearestDist: nb[0].d }; });
  const looCorr = L.corr(loo.map(r => r.forecast), loo.map(r => r.actual)), nnCorr = L.corr(loo.map(r => r.nearestF60), loo.map(r => r.actual)), signHit = loo.filter(r => Math.sign(r.forecast) === Math.sign(r.actual)).length;
  // (b) any window: the N-session stretches since 1950 whose shape correlates best with the last N sessions (no overlap between picks)
  const i0 = c.length - 1 - N, meR = path(i0, N), hits = [];
  for (let s = 260; s + N + 60 < c.length - N - 60; s++) { const p = path(s, N); const r = L.corr(meR, p); if (r > 0.7) hits.push({ s, r, rm: dist(meR, p) }); }
  hits.sort((a, b) => b.r - a.r); const picked = []; for (const h of hits) { if (picked.some(q => Math.abs(q.s - h.s) < N * 2)) continue; picked.push(h); if (picked.length >= 25) break; }
  const any = picked.map(h => { const e = h.s + N, f = k => (c[e + k] / c[e] - 1) * 100; let mn = 0; for (let k = 1; k <= 60; k++) mn = Math.min(mn, f(k)); return { start: B[h.s].d, end: B[e].d, corr: Math.round(h.r * 1000) / 1000, moveN: (c[e] / c[h.s] - 1) * 100, f20: f(20), f60: f(60), worst60: mn, after: Array.from({ length: 61 }, (_, k) => Math.round(f(k) * 100) / 100), path: path(h.s, N).map(x => Math.round(x * 100) / 100) }; });
  // unconditional 60-session change for reference
  const all60 = []; for (let s = 260; s + 60 < c.length; s += 5) all60.push((c[s + 60] / c[s] - 1) * 100);
  return { N, me: me.map(x => Math.round(x * 100) / 100), peak: cur.peak, cand: cand.map(x => ({ ...x, p: x.p.map(v => Math.round(v * 100) / 100) })), loo, looCorr, nnCorr, signHit, any, anyStats: { n: any.length, medF60: median(any.map(a => a.f60)), up60: any.filter(a => a.f60 > 0).length, q10: quantile(any.map(a => a.f60), 0.1), q90: quantile(any.map(a => a.f60), 0.9), worstMed: median(any.map(a => a.worst60)) },
    base: { med60: median(all60), up60: all60.filter(x => x > 0).length / all60.length * 100, q10: quantile(all60, 0.1), q90: quantile(all60, 0.9) } };
}

function run() {
  const S = catalogue("^GSPC", "1949-01-01", 10, 5), Q = catalogue("^IXIC", "1971-02-05", 10, 5);
  for (const e of S.eps) e.sig = lowSignature(S.P, e); for (const e of Q.eps) e.sig = lowSignature(Q.P, e);
  const S5 = catalogue("^GSPC", "1949-01-01", 5, 3);
  const cur = S.eps[S.eps.length - 1], N = cur && cur.open ? S.P.c.length - 1 - cur.peakI : 30;
  const out = { asOf: S.P.B[S.P.B.length - 1].d, names: NAMES, spx: S.eps, ndq: Q.eps,
    spx5: S5.eps.map(e => ({ id: e.id, peak: e.peak, low: e.low, end: e.end, depth: e.depth, daysToLow: e.daysToLow, daysToEnd: e.daysToEnd, open: e.open, fed: e.fed.stance })),
    cross10: crossing(S.P, S.eps, 10), cross: {}, analog: analogs(S5.P, S5.eps.map(e => ({ ...e })), N), indBreadthTo: IND.last };
  for (const X of [5, 7.5, 10, 12.5, 15, 20]) { const rows = crossing(S5.P, S5.eps, X).filter(r => !r.open); out.cross[X] = { n: rows.length, medMore: median(rows.map(r => r.more)), q25More: quantile(rows.map(r => r.more), 0.25), worstMore: Math.min(...rows.map(r => r.more)), stopped2: rows.filter(r => r.more > -2).length, to15: rows.filter(r => r.finalDepth <= -15).length, to20: rows.filter(r => r.finalDepth <= -20).length, to30: rows.filter(r => r.finalDepth <= -30).length,
    medDaysToLow: median(rows.map(r => r.daysCrossToLow)), f63med: median(rows.map(r => r.f63).filter(x => x != null)), f126med: median(rows.map(r => r.f126).filter(x => x != null)), f252med: median(rows.map(r => r.f252).filter(x => x != null)), up252: rows.filter(r => r.f252 > 0).length, rows }; }
  L.saveJ("core.json", out, false);
  return out;
}
module.exports = { run, prep, NAMES, fedStance, vixWindow, vixAt, IND, catalogue };

if (require.main === module) {
  const R = run(); console.log("as of", R.asOf, "| S&P drops:", R.spx.length, "| Nasdaq drops:", R.ndq.length, "| 5% drops:", R.spx5.length, "| industry breadth to", R.indBreadthTo);
  const rl = R.spx.flatMap(e => e.rallies.map(r => ({ ...r, ep: e.id }))); const by = k => rl.filter(r => r.cls === k);
  console.log("S&P rallies of 5%+ inside drops:", rl.length, "| failed", by("failed").length, "| turn", by("turn").length, "| after the low", by("post").length, "| pending", by("pending").length);
  for (const X of Object.keys(R.cross)) { const x = R.cross[X]; console.log(`-${X}%: n=${x.n} | median further fall ${pct(x.medMore)} | to -15: ${x.to15} | to -20: ${x.to20} | to -30: ${x.to30} | median days to low ${x.medDaysToLow} | +252d median ${pct(x.f252med)} (up ${x.up252})`); }
  if (R.analog) console.log("look-alike test: N =", R.analog.N, "| leave-one-out correlation", R.analog.looCorr.toFixed(2), "| nearest-neighbour correlation", R.analog.nnCorr.toFixed(2), "| sign right", R.analog.signHit, "of", R.analog.loo.length, "| best peak-anchored:", R.analog.cand.slice(0, 6).map(x => `${x.id} (${x.rmse.toFixed(1)})`).join(", "));
}
