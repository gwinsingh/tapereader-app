// Market-drops study: one pass over the stock files.
//   node scripts/marketdrops/breadth.js   → .data/breadth.json (daily breadth of the stock universe since 1999)
//                                          → .data/stockstats.json (how each stock behaved through each drop and after each low)
// Memory-light on purpose (6 GB laptop): one stock is in memory at a time.
// LIMIT: the universe is today's S&P 500 and Nasdaq-100 members plus a hand list of past leaders that still trade.
// Companies that died or were bought are missing, so old readings are flattering. Recent episodes (2018 on) are little affected.
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const L = require("./lib.js"), D = require("./drops.js");

const SPX = L.bars("^GSPC").filter(b => b.d >= "1998-01-02"), T = SPX.length, cal = new Map(SPX.map((b, i) => [b.d, i])), spc = SPX.map(b => b.c);
const ALL = L.bars("^GSPC").filter(b => b.d >= "1949-01-01");
const off = ALL.length - T;                                 // index shift between the long S&P array and the calendar used here
// episodes: every S&P drop of 10% or more whose peak is 1999 or later, on the calendar used here
const EP = D.episodes(ALL, 10).filter(e => e.peak >= "1999-01-01").map(e => {
  const R = D.rallies(ALL, e, 5), failed = R.filter(r => r.failed && r.lowI < e.lowI), prev = failed.length ? failed[failed.length - 1] : null;
  const yr = e.peak.slice(0, 4);
  return { id: yr, peak: e.peak, low: e.low, end: e.end, open: e.open, depth: e.depth, peakI: e.peakI - off, lowI: e.lowI - off, endI: e.endI < 0 ? T - 1 : e.endI - off, prevLowI: prev ? prev.lowI - off : -1, prevLow: prev ? prev.low : null };
});
{ const seen = {}; for (const e of EP) { seen[e.id] = (seen[e.id] || 0) + 1; } const cnt = {}; for (const e of EP) if (seen[e.id] > 1) { cnt[e.id] = (cnt[e.id] || 0) + 1; e.id = e.id + "ab"[cnt[e.id] - 1]; } }

const acc = k => new Float32Array(T);
const A = { n20: acc(), n50: acc(), n200: acc(), n252: acc(), a20: acc(), a50: acc(), a200: acc(), nl: acc(), nh: acc(), h20: acc(), l20: acc(), adv: acc(), dec: acc(), upv: acc(), dnv: acc(), n: acc(), e10: acc(), e20: acc(), up4: acc(), dn4: acc(), q25u: acc(), q25d: acc(), n65: acc() };
const stats = {}, U = L.universe().stocks, dir = path.join(L.RAW, "stocks"), files = fs.readdirSync(dir).filter(f => f.endsWith(".csv.gz"));
let done = 0;
for (const f of files) {
  const sym = f.replace(".csv.gz", ""), txt = zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString("utf8").split("\n");
  const a = new Float64Array(T).fill(NaN), c = new Float64Array(T).fill(NaN), v = new Float64Array(T).fill(0); let first = -1, last = -1;
  for (let k = 1; k < txt.length; k++) { const p = txt[k].split(","), i = cal.get(p[0]); if (i == null) continue; const cl = +p[4]; if (!(cl > 0)) continue; c[i] = cl; a[i] = p[5] === "" ? cl : +p[5]; v[i] = +p[6] || 0; if (first < 0) first = i; last = i; }
  if (first < 0 || last - first < 60) continue;
  for (let i = first + 1; i <= last; i++) if (!isFinite(a[i])) { a[i] = a[i - 1]; c[i] = c[i - 1]; }      // rare holes: carry forward
  // rolling stats on adjusted closes
  let s20 = 0, s50 = 0, s200 = 0, x10 = 0, x20 = 0; const m200 = new Float64Array(T).fill(NaN), m50 = new Float64Array(T).fill(NaN), hi252 = new Float64Array(T).fill(NaN);
  for (let i = first; i <= last; i++) {
    const k = i - first; s20 += a[i]; s50 += a[i]; s200 += a[i]; if (k >= 20) s20 -= a[i - 20]; if (k >= 50) s50 -= a[i - 50]; if (k >= 200) s200 -= a[i - 200];
    // the gauges many traders track by hand: share above the 10- and 20-day EMA, share moving 4% in a day, share up or down 25% in a quarter
    if (k === 0) { x10 = a[i]; x20 = a[i]; } else { x10 = a[i] * (2 / 11) + x10 * (9 / 11); x20 = a[i] * (2 / 21) + x20 * (19 / 21); }
    if (k >= 19) { if (a[i] > x10) A.e10[i]++; if (a[i] > x20) A.e20[i]++; }
    if (k >= 1) { const r = a[i] / a[i - 1] - 1; if (r >= 0.04) A.up4[i]++; else if (r <= -0.04) A.dn4[i]++; }
    if (k >= 65) { A.n65[i]++; const q = a[i] / a[i - 65] - 1; if (q >= 0.25) A.q25u[i]++; else if (q <= -0.25) A.q25d[i]++; }
    if (k >= 1) { A.n[i]++; const up = a[i] > a[i - 1], dn = a[i] < a[i - 1], dv = c[i] * v[i]; if (up) { A.adv[i]++; A.upv[i] += dv; } else if (dn) { A.dec[i]++; A.dnv[i] += dv; } }
    if (k >= 19) { A.n20[i]++; if (a[i] > s20 / 20) A.a20[i]++; let mx = -Infinity, mn = Infinity; for (let j = i - 19; j <= i; j++) { if (a[j] > mx) mx = a[j]; if (a[j] < mn) mn = a[j]; } if (a[i] >= mx) A.h20[i]++; if (a[i] <= mn) A.l20[i]++; }
    if (k >= 49) { A.n50[i]++; m50[i] = s50 / 50; if (a[i] > m50[i]) A.a50[i]++; }
    if (k >= 199) { A.n200[i]++; m200[i] = s200 / 200; if (a[i] > m200[i]) A.a200[i]++; }
    if (k >= 251) { let mx = -Infinity, mn = Infinity; for (let j = i - 251; j <= i; j++) { if (a[j] > mx) mx = a[j]; if (a[j] < mn) mn = a[j]; } hi252[i] = mx; A.n252[i]++; if (a[i] >= mx) A.nh[i]++; if (a[i] <= mn) A.nl[i]++; }
  }
  // per-episode behaviour
  const st = {}; const r = (i, j) => (i >= first && j <= last && isFinite(a[i]) && isFinite(a[j]) ? Math.round((a[j] / a[i] - 1) * 1000) / 10 : null);
  for (const e of EP) {
    if (e.peakI < first + 5 || e.lowI > last) continue;
    const o = { dec: r(e.peakI, e.lowI), b126: r(e.peakI - 126, e.peakI), b252: r(e.peakI - 252, e.peakI) };
    for (const k of [5, 21, 63, 126, 252]) o["a" + k] = r(e.lowI, e.lowI + k);
    // the stock's own high before the drop and own low around it
    let hiI = e.peakI; for (let j = Math.max(first, e.peakI - 60); j <= e.lowI; j++) if (a[j] > a[hiI]) hiI = j;
    const wEnd = Math.min(last, e.lowI + 40); let loI = hiI; for (let j = hiI; j <= wEnd; j++) if (a[j] < a[loI]) loI = j;
    o.dd = Math.round((a[loI] / a[hiI] - 1) * 1000) / 10; o.lead = e.lowI - loI; o.ownLow = SPX[loI].d; o.ownHigh = SPX[hiI].d;
    o.up200 = isFinite(m200[e.lowI]) ? +(a[e.lowI] > m200[e.lowI]) : null; o.up50 = isFinite(m50[e.lowI]) ? +(a[e.lowI] > m50[e.lowI]) : null;
    o.offHigh = isFinite(hi252[e.lowI]) ? Math.round((a[e.lowI] / hi252[e.lowI] - 1) * 1000) / 10 : null;
    if (e.prevLowI >= first) o.hl = +(a[e.lowI] > a[e.prevLowI]);                                      // higher low while the index made a lower low
    let nh = null; for (let j = e.lowI + 1; j <= Math.min(last, e.lowI + 400); j++) if (isFinite(hi252[j]) && a[j] >= hi252[j]) { nh = j - e.lowI; break; }
    o.nh = nh; let dv = 0, cn = 0; for (let j = Math.max(first, e.lowI - 20); j <= e.lowI; j++) { dv += c[j] * v[j]; cn++; } o.dv = Math.round(dv / cn / 1e6); o.px = Math.round(c[e.lowI] * 100) / 100;
    st[e.id] = o;
  }
  stats[sym] = { name: (U[sym] || {}).name || sym, sector: (U[sym] || {}).sector || "", industry: (U[sym] || {}).industry || "", sp500: !!(U[sym] || {}).sp500, first: SPX[first].d, ep: st };
  if (++done % 100 === 0) console.log(`${done}/${files.length}`);
}
const pc = (x, n) => Array.from(x, (v, i) => (n[i] >= 50 ? Math.round(v / n[i] * 1000) / 10 : null));
const out = { note: "share of the stock universe (today's S&P 500 and Nasdaq-100 members plus past leaders that still trade), in %", d: SPX.map(b => b.d), n: Array.from(A.n),
  a20: pc(A.a20, A.n20), e10: pc(A.e10, A.n20), e20: pc(A.e20, A.n20), up4: pc(A.up4, A.n), dn4: pc(A.dn4, A.n), q25u: pc(A.q25u, A.n65), q25d: pc(A.q25d, A.n65), a50: pc(A.a50, A.n50), a200: pc(A.a200, A.n200), nl: pc(A.nl, A.n252), nh: pc(A.nh, A.n252), h20: pc(A.h20, A.n20), l20: pc(A.l20, A.n20),
  adv: Array.from(A.adv, (v, i) => (A.adv[i] + A.dec[i] >= 50 ? Math.round(v / (A.adv[i] + A.dec[i]) * 1000) / 10 : null)), upv: Array.from(A.upv, (v, i) => (A.upv[i] + A.dnv[i] > 0 && A.n[i] >= 50 ? Math.round(v / (A.upv[i] + A.dnv[i]) * 1000) / 10 : null)) };
L.saveJ("breadth.json", out, false); L.saveJ("stockstats.json", { episodes: EP, stocks: stats }, false);
const i = T - 1; console.log(`stocks: ${done} | episodes: ${EP.map(e => e.id).join(" ")}\nlatest ${out.d[i]}: n=${out.n[i]} above 50d ${out.a50[i]}%, above 200d ${out.a200[i]}%, new 52w lows ${out.nl[i]}%, advancing ${out.adv[i]}%, up-volume ${out.upv[i]}%`);
