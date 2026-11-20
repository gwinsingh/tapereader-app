// Market-drops study: part 2 of the analysis → .data/more.json
//   node scripts/marketdrops/analyze2.js       (run breadth.js and analyze.js first)
//   sectors and industries through each drop · the stocks that led after each low · macro backdrop at each peak ·
//   the day's shape from daily bars (overnight vs session, gaps, close location) · VIX term structure · leverage · the picture today
const L = require("./lib.js"), U = require("./universe.js");
const { bi, sma, median, quantile, mean } = L;
const core = L.J("core.json"), SS = L.J("stockstats.json");
const r1 = x => (x == null || !isFinite(x) ? null : Math.round(x * 10) / 10), r2 = x => (x == null || !isFinite(x) ? null : Math.round(x * 100) / 100);
const SPY = L.bars("^GSPC");
const EPS = core.spx.filter(e => e.peak >= "1986-01-01");

// ---------- A. sector and industry ETFs through each drop ----------
const ETFS = Object.keys(U.ETF).filter(s => !["SPY", "DIA", "TQQQ", "SQQQ", "SOXL", "SOXS", "SPXL", "UPRO", "SSO", "QLD", "TNA", "SOXX", "JNK", "IYR", "BTC-USD"].includes(s));
const GROUP = s => (/^XL/.test(s) ? "sector" : ["QQQ", "IWM", "RSP", "MDY"].includes(s) ? "broad" : ["IWF", "IWD", "IWO", "IWN", "MTUM", "QUAL", "USMV", "SPLV", "SPHB", "VLUE", "MGK"].includes(s) ? "style" : ["EEM", "EFA", "FXI", "KWEB", "EWJ", "EWZ", "EWG"].includes(s) ? "world" : ["TLT", "IEF", "SHY", "HYG", "LQD", "TIP"].includes(s) ? "bonds" : ["GLD", "SLV", "USO", "DBC", "UUP"].includes(s) ? "other" : "industry");
function etfRow(sym, e, benchSym = "SPY") {
  const B = L.bars(sym), S = L.bars(benchSym), p = bi(B, e.peak), lo = bi(B, e.low); if (p < 0 || B[p].d !== e.peak || lo < 0 || p < 30) return null;
  const ret = (i, j) => (j < B.length && i >= 0 ? (B[j].a / B[i].a - 1) * 100 : null), sp = bi(S, e.peak), sl = bi(S, e.low), sret = (i, j) => (j < S.length && i >= 0 && S[i] ? (S[j].a / S[i].a - 1) * 100 : null);
  const end = Math.min(B.length - 1, lo + 40); let ownLo = p, ownHi = p; for (let i = Math.max(0, p - 40); i <= lo; i++) if (B[i].a > B[ownHi].a) ownHi = i; for (let i = ownHi; i <= end; i++) if (B[i].a < B[ownLo].a || i === ownHi) ownLo = B[i].a <= B[ownLo].a || i === ownHi ? i : ownLo;
  // relative-strength line against the benchmark: where did it bottom inside the drop
  const sIdx = new Map(S.map((b, i) => [b.d, i])); let rsLo = null, rsMin = Infinity; for (let i = p; i <= end; i++) { const k = sIdx.get(B[i].d); if (k == null) continue; const q = B[i].a / S[k].a; if (q < rsMin) { rsMin = q; rsLo = i; } }
  const c = B.map(b => b.a), s200 = sma(c.slice(Math.max(0, lo - 199), lo + 1), Math.min(200, lo + 1)), m200 = lo >= 199 ? s200[s200.length - 1] : null;
  const o = { sym, name: U.ETF[sym], group: GROUP(sym), dec: r1(ret(p, lo)), rel: r1(ret(p, lo) - sret(sp, sl)), ownDD: r1((B[ownLo].a / B[ownHi].a - 1) * 100), ownLow: B[ownLo].d, lead: lo - ownLo, rsLow: rsLo != null ? B[rsLo].d : null, rsLead: rsLo != null ? lo - rsLo : null,
    up200: m200 ? +(c[lo] > m200) : null, b126: p >= 126 ? r1(ret(p - 126, p)) : null };
  for (const k of [21, 63, 126, 252]) { o["a" + k] = r1(ret(lo, lo + k)); o["x" + k] = lo + k < B.length && sl + k < S.length ? r1(ret(lo, lo + k) - sret(sl, sl + k)) : null; }
  return o;
}
const sectors = {};
for (const e of EPS) { if (e.peak < "1999-01-01") continue; const rows = ETFS.map(s => etfRow(s, e, "SPY")).filter(Boolean); const spy = etfRow("SPY", e, "SPY"); sectors[e.id] = { spy, rows }; }
// older drops and a survivorship-free cross-check: Ken French's 12 industry groups
const F12 = L.french12(), F12N = { NoDur: "Consumer staples and non-durables", Durbl: "Consumer durables (cars, appliances)", Manuf: "Manufacturing", Enrgy: "Energy", Chems: "Chemicals", BusEq: "Technology and business equipment", Telcm: "Telecom", Utils: "Utilities", Shops: "Retail and wholesale", Hlth: "Health care", Money: "Finance", Other: "Everything else (construction, transport, hotels, services)" };
const f12idx = new Map(F12.rows.map((r, i) => [r[0], i]));
function f12Rows(e) { const p = f12idx.get(e.peak), lo = f12idx.get(e.low); if (p == null || lo == null) return null; const n = F12.head.length, cum = (k, i, j) => { let v = 1; for (let t = i + 1; t <= j && t < F12.rows.length; t++) { const x = F12.rows[t][k + 1]; if (isFinite(x)) v *= 1 + x / 100; } return (v - 1) * 100; };
  const mk = (i, j) => mean(F12.head.map((_, k) => cum(k, i, j)));
  return F12.head.map((h, k) => { const o = { sym: h, name: F12N[h] || h, dec: r1(cum(k, p, lo)), rel: r1(cum(k, p, lo) - mk(p, lo)) }; let lv = 1, mn = 1, mnI = p; for (let t = p + 1; t <= Math.min(F12.rows.length - 1, lo + 40); t++) { lv *= 1 + (F12.rows[t][k + 1] || 0) / 100; if (lv < mn) { mn = lv; mnI = t; } } o.ownLow = F12.rows[mnI][0]; o.lead = lo - mnI;
    for (const d of [63, 126, 252]) { o["a" + d] = lo + d < F12.rows.length ? r1(cum(k, lo, lo + d)) : null; o["x" + d] = lo + d < F12.rows.length ? r1(cum(k, lo, lo + d) - mk(lo, lo + d)) : null; } return o; }); }
const ind12 = {}; for (const e of core.spx.filter(x => x.peak >= "1956-01-01")) { const r = f12Rows(e); if (r) ind12[e.id] = r; }

// ---------- B. the stocks: who fell least, who led after ----------
const leaders = {};
for (const e of SS.episodes) {
  const minDv = e.peak < "2005" ? 5 : e.peak < "2015" ? 10 : 25;
  const rows = Object.entries(SS.stocks).map(([sym, s]) => ({ sym, name: s.name, sector: s.sector, sp500: s.sp500, ...(s.ep[e.id] || {}) })).filter(r => r.dec != null && r.px >= 5 && r.dv >= minDv);
  const n = rows.length, withA = k => rows.filter(r => r[k] != null);
  const quint = (key, outs) => { const s = rows.filter(r => r[key] != null).sort((a, b) => a[key] - b[key]), q = []; for (let k = 0; k < 5; k++) { const part = s.slice(Math.floor(k * s.length / 5), Math.floor((k + 1) * s.length / 5)); const o = { q: k + 1, n: part.length, lo: part[0][key], hi: part[part.length - 1][key], med: r1(median(part.map(r => r[key]))) }; for (const a of outs) o[a] = r1(median(part.map(r => r[a]).filter(x => x != null))); q.push(o); } return q; };
  const sp = (a, b) => { const s = rows.filter(r => r[a] != null && r[b] != null); return s.length > 30 ? r2(L.spearman(s.map(r => r[a]), s.map(r => r[b]))) : null; };
  const slim = r => ({ sym: r.sym, name: r.name, sector: r.sector, dec: r.dec, dd: r.dd, lead: r.lead, up200: r.up200, offHigh: r.offHigh, hl: r.hl, nh: r.nh, b252: r.b252, a21: r.a21, a63: r.a63, a126: r.a126, a252: r.a252, dv: r.dv });
  const bySector = {}; for (const r of rows) if (r.sector) (bySector[r.sector] = bySector[r.sector] || []).push(r);
  leaders[e.id] = { n, minDv, medDec: r1(median(rows.map(r => r.dec))), medDD: r1(median(rows.map(r => r.dd))), up200: r1(rows.filter(r => r.up200 === 1).length / rows.filter(r => r.up200 != null).length * 100), hl: rows.some(r => r.hl != null) ? r1(rows.filter(r => r.hl === 1).length / rows.filter(r => r.hl != null).length * 100) : null,
    fell50: r1(rows.filter(r => r.dd <= -50).length / n * 100), fell30: r1(rows.filter(r => r.dd <= -30).length / n * 100), fell20: r1(rows.filter(r => r.dd <= -20).length / n * 100), rose: r1(rows.filter(r => r.dec > 0).length / n * 100),
    lowBefore: r1(rows.filter(r => r.lead >= 10).length / n * 100), lowWith: r1(rows.filter(r => Math.abs(r.lead) <= 3).length / n * 100), lowAfter: r1(rows.filter(r => r.lead <= -5).length / n * 100),
    fellLeast: rows.slice().sort((a, b) => b.dec - a.dec).slice(0, 30).map(slim), fellMost: rows.slice().sort((a, b) => a.dec - b.dec).slice(0, 30).map(slim),
    firstHighs: withA("nh").filter(r => r.nh <= 45).sort((a, b) => a.nh - b.nh).slice(0, 40).map(slim), nhIn20: r1(withA("nh").filter(r => r.nh <= 20).length / n * 100), nhIn60: r1(withA("nh").filter(r => r.nh <= 60).length / n * 100),
    best126: withA("a126").sort((a, b) => b.a126 - a.a126).slice(0, 40).map(slim), best252: withA("a252").sort((a, b) => b.a252 - a.a252).slice(0, 40).map(slim), best21: withA("a21").sort((a, b) => b.a21 - a.a21).slice(0, 25).map(slim),
    qDec: quint("dec", ["a5", "a21", "a63", "a126", "a252"]), qB252: quint("b252", ["dec", "a21", "a126", "a252"]),
    rho: { dec_a21: sp("dec", "a21"), dec_a63: sp("dec", "a63"), dec_a126: sp("dec", "a126"), dec_a252: sp("dec", "a252"), b252_a126: sp("b252", "a126"), b252_dec: sp("b252", "dec"), off_a126: sp("offHigh", "a126") },
    early: (() => { const g = withA("a252"), a = g.filter(r => r.nh != null && r.nh <= 30), b = g.filter(r => !(r.nh != null && r.nh <= 30)); return a.length > 5 ? { n: a.length, a252: r1(median(a.map(r => r.a252))), rest: r1(median(b.map(r => r.a252))), a126: r1(median(a.map(r => r.a126))), rest126: r1(median(b.map(r => r.a126))) } : null; })(),
    sectors: Object.entries(bySector).map(([s, a]) => ({ sector: s, n: a.length, dec: r1(median(a.map(r => r.dec))), dd: r1(median(a.map(r => r.dd))), up200: r1(a.filter(r => r.up200 === 1).length / a.length * 100), a63: r1(median(a.map(r => r.a63).filter(x => x != null))), a126: r1(median(a.map(r => r.a126).filter(x => x != null))), a252: r1(median(a.map(r => r.a252).filter(x => x != null))) })).sort((a, b) => a.dec - b.dec) };
}

// ---------- C. the macro backdrop at each peak and each low ----------
const F = id => L.fred(id), val = (id, iso) => L.valueAt(F(id), iso);
const TGT = (() => { const a = F("DFEDTAR"), u = F("DFEDTARU"), l = F("DFEDTARL"); return a.concat(u.map((r, i) => [r[0], (r[1] + (l[i] ? l[i][1] : r[1] - 0.25)) / 2])); })();
function yoy(id, iso, lagDays = 20) { const S = F(id), i = L.idxAtOrBefore(S, L.addDays(iso, -lagDays)); if (i < 12) return null; const d = S[i][0], want = (+d.slice(0, 4) - 1) + d.slice(4); let j = L.idxAtOrBefore(S, want); if (j < 0) return null; let base = S[j][1];
  if (S[j][0] !== want && j + 1 < S.length) { const a = S[j], b = S[j + 1], w = L.daysBetween(a[0], want) / L.daysBetween(a[0], b[0]); base = a[1] * Math.pow(b[1] / a[1], w); } return (S[i][1] / base - 1) * 100; }
const CAPE = L.multpl("CAPE"), EPSM = L.multpl("EPS");
const DOLLAR = (() => { try { const a = F("DTWEXM"), b = F("DTWEXBGS"); return { a, b }; } catch (e) { return { a: [], b: F("DTWEXBGS") }; } })();
const dollarYoy = iso => { const S = iso >= "2007-02-01" ? DOLLAR.b : DOLLAR.a; const v = L.valueAt(S, iso), p = L.valueAt(S, L.addDays(iso, -365)); return isFinite(v) && isFinite(p) ? (v / p - 1) * 100 : null; };
const MARGIN = F("BOGZ1FL663067003Q"), EQMV = F("NCBEILQ027S"), GDP = F("GDP");
const marginRatio = iso => { const m = L.valueAt(MARGIN, L.addDays(iso, -75)), g = L.valueAt(GDP, L.addDays(iso, -75)); return isFinite(m) && isFinite(g) ? m / 1000 / g * 100 : null; };       // margin loans ($ millions) as % of GDP ($ billions)
function macroAt(iso) {
  const t = L.valueAt(TGT, iso), t6 = L.valueAt(TGT, L.addDays(iso, -183)), y2 = val("DGS2", iso), y10 = val("DGS10", iso), y3m = val("DGS3MO", iso), ci = L.idxAtOrBefore(CAPE, iso), ei = L.idxAtOrBefore(EPSM, L.addDays(iso, -100));
  const cl = (() => { const S = F("ICSA"), i = L.idxAtOrBefore(S, iso); if (i < 30) return {}; const a4 = k => mean(S.slice(k - 3, k + 1).map(r => r[1])); return { claims: a4(i), claimsChg: (a4(i) / a4(i - 26) - 1) * 100 }; })();
  const un = (() => { const S = F("UNRATE"), i = L.idxAtOrBefore(S, L.addDays(iso, -35)); if (i < 12) return {}; const lo = Math.min(...S.slice(i - 11, i + 1).map(r => r[1])); return { unrate: S[i][1], unFromLow: S[i][1] - lo }; })();
  const oil = (() => { const S = F("DCOILWTICO"); const v = L.valueAt(S, iso), p = L.valueAt(S, L.addDays(iso, -365)); return { oil: isFinite(v) ? v : null, oilYoy: isFinite(v) && isFinite(p) && p > 0 ? (v / p - 1) * 100 : null }; })();
  const cpi = yoy("CPIAUCSL", iso), cpi6 = yoy("CPIAUCSL", L.addDays(iso, -183)), core = yoy("CPILFESL", iso);
  const sp = bi(SPY, iso), c = SPY.map(b => b.c), s200 = mean(c.slice(sp - 199, sp + 1));
  const eps = ei >= 12 ? (EPSM[ei][1] / EPSM[ei - 12][1] - 1) * 100 : null;
  const b = (() => { const S = F("WALCL"); const v = L.valueAt(S, iso), p = L.valueAt(S, L.addDays(iso, -365)); return isFinite(v) && isFinite(p) && iso >= "2004-01-01" ? (v / p - 1) * 100 : null; })();
  const mr = marginRatio(iso), mr1 = marginRatio(L.addDays(iso, -365)), m0 = L.valueAt(MARGIN, L.addDays(iso, -75)), m1 = L.valueAt(MARGIN, L.addDays(iso, -440));
  return { date: iso, fed: r2(t), fedChg6m: r2(t - t6), y2: r2(y2), y10: r2(y10), y2LessFed: r2(y2 - t), curve10_2: r2(y10 - y2), curve10_3m: isFinite(y3m) ? r2(y10 - y3m) : null, cpi: r1(cpi), cpiChg6m: cpi != null && cpi6 != null ? r1(cpi - cpi6) : null, core: r1(core), realFed: cpi != null ? r1(t - cpi) : null,
    unrate: un.unrate, unFromLow: r1(un.unFromLow), claims: Math.round(cl.claims / 1000), claimsChg: r1(cl.claimsChg), baa: r2(val("BAA10Y", iso)), baaChg6m: r2(val("BAA10Y", iso) - val("BAA10Y", L.addDays(iso, -183))), oil: r1(oil.oil), oilYoy: r1(oil.oilYoy), dollarYoy: r1(dollarYoy(iso)),
    cape: ci >= 0 ? r1(CAPE[ci][1]) : null, epsYoy: r1(eps), fedAssetsYoy: r1(b), spx52w: r1((c[sp] / c[sp - 252] - 1) * 100), spxVs200: r1((c[sp] / s200 - 1) * 100), marginPctGdp: r2(mr), marginYoy: isFinite(m0) && isFinite(m1) ? r1((m0 / m1 - 1) * 100) : null };
}
const macro = {}; for (const e of EPS) macro[e.id] = { peak: macroAt(e.peak), low: macroAt(e.low) };
const today = SPY[SPY.length - 1].d; macro.today = macroAt(today);
// similarity of each past PEAK to the present peak, on the features that describe the backdrop (z-scores across peaks)
const SIMKEYS = ["fedChg6m", "y2LessFed", "curve10_2", "cpi", "cpiChg6m", "unFromLow", "claimsChg", "baa", "oilYoy", "cape", "epsYoy", "spxVs200", "realFed"];
const cur = EPS[EPS.length - 1], peers = EPS.filter(e => e.id !== cur.id);
const zs = {}; for (const k of SIMKEYS) { const v = EPS.map(e => macro[e.id].peak[k]).filter(x => x != null && isFinite(x)); zs[k] = { m: mean(v), s: L.stdev(v) || 1 }; }
const macroSim = peers.map(e => { let s = 0, n = 0; const parts = {}; for (const k of SIMKEYS) { const a = macro[e.id].peak[k], b = macro[cur.id].peak[k]; if (a == null || b == null) continue; const d = (a - b) / zs[k].s; parts[k] = r2(d); s += d * d; n++; } return { id: e.id, name: e.name, dist: r2(Math.sqrt(s / n)), n, parts, depth: e.depth }; }).sort((a, b) => a.dist - b.dist);

// ---------- D. the shape of the day, from daily bars (the nearest free stand-in for intraday data before 2024) ----------
function dayShape(sym, from, to) {
  const B = L.bars(sym), i0 = Math.max(21, L.bia(B, from)), i1 = bi(B, to); if (i1 - i0 < 5) return null;
  let on = 1, se = 1, n = 0, gu = 0, guSold = 0, gd = 0, gdBought = 0, cl = 0, rng = 0, big = 0, ups = 0, trendUp = 0, trendDn = 0, lowerHighs = 0, weakClose = 0, strongClose = 0, bigUp = 0, bigDn = 0, outside = 0;
  for (let i = i0; i <= i1; i++) { const b = B[i], p = B[i - 1], gap = (b.o / p.c - 1) * 100, ses = (b.c / b.o - 1) * 100, ret = (b.c / p.c - 1) * 100, range = (b.h - b.l) / p.c * 100; n++; on *= b.o / p.c; se *= b.c / b.o;
    if (gap >= 0.3) { gu++; if (b.c < b.o) guSold++; } if (gap <= -0.3) { gd++; if (b.c > b.o) gdBought++; } const loc = b.h > b.l ? (b.c - b.l) / (b.h - b.l) : 0.5; cl += loc; rng += range; if (Math.abs(ret) >= 1) big++; if (ret >= 1) bigUp++; if (ret <= -1) bigDn++; if (ret > 0) ups++;
    if (loc <= 0.25) weakClose++; if (loc >= 0.75) strongClose++; let ar = 0; for (let k = i - 20; k < i; k++) ar += (B[k].h - B[k].l) / B[k - 1 < 0 ? 0 : k - 1].c * 100; ar /= 20;
    if (Math.abs(b.c - b.o) >= 0.6 * (b.h - b.l) && range >= 1.2 * ar) { if (b.c > b.o) trendUp++; else trendDn++; } if (b.h > p.h && b.l < p.l) outside++; }
  return { sym, from: B[i0].d, to: B[i1].d, n, overnight: r1((on - 1) * 100), session: r1((se - 1) * 100), total: r1((on * se - 1) * 100), gapUps: gu, gapUpSold: gu ? r1(guSold / gu * 100) : null, gapDowns: gd, gapDownBought: gd ? r1(gdBought / gd * 100) : null, closeLoc: r2(cl / n), range: r2(rng / n), big: r1(big / n * 100), bigUp: r1(bigUp / n * 100), bigDn: r1(bigDn / n * 100), upDays: r1(ups / n * 100),
    weakClose: r1(weakClose / n * 100), strongClose: r1(strongClose / n * 100), trendUp: r1(trendUp / n * 100), trendDn: r1(trendDn / n * 100) };
}
const shape = {}; for (const e of EPS.filter(x => x.peak >= "1993-06-01")) { const lowPlus = SPY[Math.min(SPY.length - 1, bi(SPY, e.low) + 40)].d; shape[e.id] = {};
  for (const sym of ["SPY", "QQQ"]) { if (sym === "QQQ" && e.peak < "1999-06-01") continue; shape[e.id][sym] = { fall: dayShape(sym, L.addDays(e.peak, 1), e.low), rise: e.open ? null : dayShape(sym, L.addDays(e.low, 1), lowPlus), before: dayShape(sym, L.addDays(e.peak, -90), e.peak) }; } }
shape.all = { SPY: dayShape("SPY", "1993-06-01", today), QQQ: dayShape("QQQ", "1999-06-01", today) };
// overnight vs session, cumulative, for charts (SPY from 1993)
function nightDay(sym, from, to) { const B = L.bars(sym), i0 = L.bia(B, from), i1 = bi(B, to), out = { d: [], night: [], day: [], all: [] }; let on = 1, se = 1; for (let i = i0; i <= i1; i++) { on *= B[i].o / B[i - 1].c; se *= B[i].c / B[i].o; out.d.push(B[i].d); out.night.push(r2((on - 1) * 100)); out.day.push(r2((se - 1) * 100)); out.all.push(r2((on * se - 1) * 100)); } return out; }

// ---------- E. VIX family around each low ----------
const VIX = L.cboe("VIX"), V3 = L.bars("^VIX3M"), VV = L.bars("^VVIX"), PCE = L.putCall("equitypc"), PCT = L.putCall("totalpc");
const v3idx = new Map(V3.map((b, i) => [b.d, i]));
const tsRatio = iso => { const i = bi(VIX, iso), k = v3idx.get(iso); return i >= 0 && VIX[i].d === iso && k != null ? VIX[i].c / V3[k].c : null; };
const vixSig = {};
for (const e of EPS.filter(x => x.peak >= "1990-01-01")) { const a = L.bia(VIX, e.peak), lo = bi(VIX, e.low), z = Math.min(VIX.length - 1, lo + 60), o = {};
  let mxC = a, mxH = a; for (let i = a; i <= Math.min(VIX.length - 1, lo + 10); i++) { if (VIX[i].c > VIX[mxC].c) mxC = i; if (VIX[i].h > VIX[mxH].h) mxH = i; }
  o.atPeak = VIX[a].c; o.maxClose = VIX[mxC].c; o.maxCloseDate = VIX[mxC].d; o.maxCloseLead = lo - mxC; o.maxHigh = VIX[mxH].h; o.maxHighDate = VIX[mxH].d; o.atLow = VIX[lo].c; o.over30 = 0; o.over40 = 0; for (let i = a; i <= lo; i++) { if (VIX[i].c >= 30) o.over30++; if (VIX[i].c >= 40) o.over40++; }
  for (const k of [5, 10, 20, 40]) o["after" + k] = lo + k < VIX.length ? VIX[lo + k].c : null; let b20 = null; for (let i = lo + 1; i <= Math.min(VIX.length - 1, lo + 250); i++) if (VIX[i].c < 20) { b20 = i - lo; break; } o.daysToBelow20 = b20;
  if (e.peak >= "2006-08-01") { let inv = 0, mx = 0, mxD = null, firstInv = null, lastInv = null; for (let i = a; i <= z; i++) { const r = tsRatio(VIX[i].d); if (r == null) continue; if (r > 1) { if (i <= lo) inv++; if (firstInv == null) firstInv = i; lastInv = i; } if (r > mx && i <= lo + 10) { mx = r; mxD = i; } }
    o.tsMax = r2(mx); o.tsMaxDate = mxD != null ? VIX[mxD].d : null; o.tsMaxLead = mxD != null ? lo - mxD : null; o.tsInvDays = inv; o.tsFirstInv = firstInv != null ? VIX[firstInv].d : null; o.tsFirstInvDay = firstInv != null ? firstInv - a : null; o.tsAtLow = r2(tsRatio(e.low)); let back = null; for (let i = lo; i <= z; i++) { const r = tsRatio(VIX[i].d); if (r != null && r < 1) { back = i - lo; break; } } o.tsBackDays = back; }
  if (e.peak >= "2007-02-01") { const va = L.bia(VV, e.peak), vl = bi(VV, e.low); let m = va; for (let i = va; i <= Math.min(VV.length - 1, vl + 10); i++) if (VV[i].c > VV[m].c) m = i; o.vvixMax = r1(VV[m].c); o.vvixMaxDate = VV[m].d; o.vvixLead = vl - m; }
  for (const [nm, S] of [["pcEq", PCE], ["pcTot", PCT]]) { const p0 = L.idxAtOrAfter(S, e.peak), p1 = L.idxAtOrBefore(S, L.addDays(e.low, 14)); if (p0 < S.length && p1 > p0 + 5 && S[p0][0] <= L.addDays(e.peak, 7)) { let m = p0; const ma = sma(S.map(r => r[1]), 10); let mm = p0; for (let i = p0; i <= p1; i++) { if (S[i][1] > S[m][1]) m = i; if (ma[i] > ma[mm]) mm = i; } o[nm + "Max"] = S[m][1]; o[nm + "MaxDate"] = S[m][0]; o[nm + "10Max"] = r2(ma[mm]); o[nm + "10MaxDate"] = S[mm][0]; } }
  vixSig[e.id] = o; }

// ---------- F. leverage (the Fed's quarterly flow of funds; monthly FINRA figures are added by hand from the research file) ----------
const lev = MARGIN.filter(r => r[0] >= "1985-01-01").map(r => { const g = L.valueAt(GDP, r[0]), q = L.valueAt(EQMV, r[0]); return { d: r[0], loans: Math.round(r[1] / 1000), pctGdp: r2(r[1] / 1000 / g * 100), pctMcap: isFinite(q) ? r2(r[1] / q * 100) : null }; });
for (let i = 4; i < lev.length; i++) lev[i].yoy = r1((lev[i].loans / lev[i - 4].loans - 1) * 100);

// ---------- G. the picture today ----------
function snap(sym) { const B = L.anyBars(sym); if (!B) return null; const c = B.map(b => b.c), n = c.length - 1, hi = Math.max(...c.slice(-252)), hiI = c.lastIndexOf(hi), m = k => mean(c.slice(-k)); const pI = bi(B, core.spx[core.spx.length - 1].peak);
  return { sym, d: B[n].d, c: r2(c[n]), day: r2((c[n] / c[n - 1] - 1) * 100), wk: r1((c[n] / c[n - 5] - 1) * 100), offHigh: r1((c[n] / hi - 1) * 100), highDate: B[hiI].d, sincePeak: r1((B[n].a / B[pI].a - 1) * 100), vs20: r1((c[n] / m(20) - 1) * 100), vs50: r1((c[n] / m(50) - 1) * 100), vs200: r1((c[n] / m(200) - 1) * 100), ytd: r1((B[n].a / B[bi(B, (+today.slice(0, 4) - 1) + "-12-31")].a - 1) * 100), y1: r1((B[n].a / B[n - 252].a - 1) * 100) }; }
const now = { date: today, idx: ["^GSPC", "^IXIC", "^NDX", "^RUT", "^DJI", "^SOX"].map(snap), etf: Object.keys(U.ETF).map(snap).filter(Boolean),
  vix: (() => { const n = VIX.length - 1, k = v3idx.get(VIX[n].d); return { d: VIX[n].d, c: VIX[n].c, h: VIX[n].h, prev: VIX[n - 1].c, v3: k != null ? V3[k].c : null, ratio: k != null ? r2(VIX[n].c / V3[k].c) : null, vvix: VV[VV.length - 1].c, vvixD: VV[VV.length - 1].d }; })() };
const BR = L.J("breadth.json"), bn = BR.d.length - 1; now.breadth = { d: BR.d[bn], a20: BR.a20[bn], a50: BR.a50[bn], a200: BR.a200[bn], nl: BR.nl[bn], nh: BR.nh[bn], adv: BR.adv[bn], upv: BR.upv[bn], n: BR.n[bn] };
{ const pk = BR.d.indexOf(core.spx[core.spx.length - 1].peak); now.breadthAtPeak = pk >= 0 ? { a50: BR.a50[pk], a200: BR.a200[pk], nl: BR.nl[pk], nh: BR.nh[pk] } : null; let d90 = [], u90 = []; for (let i = pk; i <= bn; i++) { if (BR.upv[i] <= 10) d90.push(BR.d[i]); if (BR.upv[i] >= 90) u90.push(BR.d[i]); } now.down90 = d90; now.up90 = u90; }

L.saveJ("more.json", { asOf: today, sectors, ind12, leaders, macro, macroSim, simKeys: SIMKEYS, shape, vixSig, lev, now }, false);
L.saveJ("nightday.json", { SPY: nightDay("SPY", "1993-02-01", today), QQQ: nightDay("QQQ", "1999-03-11", today) }, false);
module.exports = { macroAt, dayShape, etfRow };
if (require.main === module) {
  console.log("as of", today, "| sector tables:", Object.keys(sectors).join(" "), "| leader sets:", Object.keys(leaders).map(k => `${k}:${leaders[k].n}`).join(" "));
  console.log("macro look-alikes of the 2026 peak:", macroSim.slice(0, 6).map(x => `${x.id} ${x.dist}`).join(" | "));
  console.log("now:", JSON.stringify(now.idx.map(x => `${x.sym} ${x.offHigh}%`)), JSON.stringify(now.vix), JSON.stringify(now.breadth));
}
