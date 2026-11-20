// Market-drops study: part 3 → .data/gauges.json
//   node scripts/marketdrops/analyze3.js       (after breadth.js and analyze.js)
// Tests the breadth gauges many discretionary traders track by hand, on this study's universe of about 660 large stocks, 1999 → now:
//   share of stocks above their 10-day EMA, 20-day EMA and 50-day SMA · share up 4%+ or down 4%+ on the day · share up / down 25%+ in a quarter.
// Three questions, all descriptive: (1) what did washout readings mean, (2) what did thrusts after a washout mean,
// (3) did the gauges look different at lows that held and at lows that broke.
const L = require("./lib.js"), C = L.J("core.json"), BR = L.J("breadth.json");
const { median, quantile, mean } = L, r1 = x => (x == null || !isFinite(x) ? null : Math.round(x * 10) / 10), r2 = x => (x == null || !isFinite(x) ? null : Math.round(x * 100) / 100);
const SPX = L.bars("^GSPC").filter(b => b.d >= BR.d[0]), c = SPX.map(b => b.c), T = c.length, i0 = BR.d.findIndex(d => d >= "1999-03-01");
if (SPX[0].d !== BR.d[0] || SPX.length !== BR.d.length) throw new Error("breadth calendar and S&P calendar differ");
const G = { e10: BR.e10, e20: BR.e20, a50: BR.a50, up4: BR.up4, dn4: BR.dn4, q25u: BR.q25u, q25d: BR.q25d };
const pctl = (k, p) => quantile(G[k].slice(i0).filter(x => x != null), p);
// where each session sits: inside a drop before its low ("fall"), within 10 sessions of a final low ("low"), or elsewhere
const E = C.spx.filter(e => e.peak >= "1999-01-01"), idx = new Map(BR.d.map((d, i) => [d, i]));
const lows = E.filter(e => !e.open).map(e => idx.get(e.low)), zone = new Array(T).fill("out");
for (const e of E) { const a = idx.get(e.peak), z = e.open ? T - 1 : idx.get(e.low); for (let i = a + 1; i <= z; i++) zone[i] = "fall"; }
for (const l of lows) for (let i = Math.max(0, l - 10); i <= Math.min(T - 1, l + 10); i++) zone[i] = "low";
const nearestLow = i => { let b = null; for (const l of lows) if (b == null || Math.abs(l - i) < Math.abs(b - i)) b = l; return b == null ? null : b - i; };   // + = the low is still ahead
const fwd = (i, n) => (i + n < T ? (c[i + n] / c[i] - 1) * 100 : null);
const adverse = (i, n) => { let m = 0; for (let k = 1; k <= n && i + k < T; k++) m = Math.min(m, c[i + k] / c[i] - 1); return m * 100; };
const heldLow = (i, look = 20, ahead = 120) => { let lo = Infinity; for (let k = Math.max(0, i - look); k <= i; k++) lo = Math.min(lo, c[k]); for (let k = 1; k <= ahead && i + k < T; k++) if (c[i + k] < lo) return false; return i + 20 < T ? true : null; };
function summarize(ev) {
  const f = n => ev.map(x => x["f" + n]).filter(x => x != null), s = n => ({ med: r1(median(f(n))), mean: r1(mean(f(n))), up: f(n).length ? Math.round(f(n).filter(x => x > 0).length / f(n).length * 100) : null, n: f(n).length });
  const z = k => ev.filter(x => x.zone === k).length, hl = ev.filter(x => x.held != null);
  return { n: ev.length, f5: s(5), f20: s(20), f60: s(60), f120: s(120), f250: s(250), adv60med: r1(median(ev.map(x => x.adv60))), adv60worst: r1(Math.min(...ev.map(x => x.adv60))), adv60q25: r1(quantile(ev.map(x => x.adv60), 0.25)),
    atLow: z("low"), inFall: z("fall"), outside: z("out"), held: hl.filter(x => x.held).length, heldOf: hl.length };
}
const mk = i => ({ d: BR.d[i], i, f5: r1(fwd(i, 5)), f20: r1(fwd(i, 20)), f60: r1(fwd(i, 60)), f120: r1(fwd(i, 120)), f250: r1(fwd(i, 250)), adv60: r1(adverse(i, 60)), zone: zone[i], toLow: nearestLow(i), held: heldLow(i) });
/** first day a condition is true after `gap` sessions without it */
function firstDays(cond, gap = 10) { const out = []; let last = -999; for (let i = i0; i < T; i++) if (cond(i)) { if (i - last > gap) out.push(i); last = i; } return out; }

// ---------- 1. washouts ----------
const TH = { e10: [r1(pctl("e10", 0.05)), r1(pctl("e10", 0.01))], e20: [r1(pctl("e20", 0.05)), r1(pctl("e20", 0.01))], a50: [r1(pctl("a50", 0.05)), r1(pctl("a50", 0.01))], dn4: [r1(pctl("dn4", 0.95)), r1(pctl("dn4", 0.99))], up4: [r1(pctl("up4", 0.95)), r1(pctl("up4", 0.99))] };
const washDefs = [["e10", "Stocks above their 10-day EMA", "below", 15], ["e10", "Stocks above their 10-day EMA", "below", 5], ["e20", "Stocks above their 20-day EMA", "below", 15], ["e20", "Stocks above their 20-day EMA", "below", 5], ["a50", "Stocks above their 50-day average", "below", 20], ["a50", "Stocks above their 50-day average", "below", 10],
  ["dn4", "Stocks down 4% or more on the day", "above", 15], ["dn4", "Stocks down 4% or more on the day", "above", 35], ["q25d", "Stocks down 25% or more in a quarter", "above", 20], ["q25d", "Stocks down 25% or more in a quarter", "above", 40]];
const wash = washDefs.map(([k, name, dir, th]) => { const ev = firstDays(i => G[k][i] != null && (dir === "below" ? G[k][i] < th : G[k][i] >= th)).map(mk); return { k, name, dir, th, ...summarize(ev), ev: ev.map(x => ({ d: x.d, v: G[k][x.i], f20: x.f20, f60: x.f60, adv60: x.adv60, zone: x.zone, toLow: x.toLow })) }; });
const base = (() => { const ev = []; for (let i = i0; i < T - 5; i += 3) ev.push(mk(i)); return summarize(ev); })();
const baseFall = (() => { const ev = []; for (let i = i0; i < T - 5; i++) if (zone[i] === "fall") ev.push(mk(i)); return summarize(ev); })();

// ---------- 2. thrusts ----------
function riseEvents(k, from, to, within) { const out = []; let last = -999; for (let i = i0; i < T; i++) { if (G[k][i] == null || G[k][i] < to || (i > 0 && G[k][i - 1] >= to)) continue; let ok = false; for (let j = Math.max(i0, i - within); j < i; j++) if (G[k][j] != null && G[k][j] <= from) { ok = true; break; } if (ok && i - last > 10) { out.push(i); last = i; } } return out; }
const sum10 = k => { const o = new Array(T).fill(null); let s = 0; for (let i = 0; i < T; i++) { s += G[k][i] || 0; if (i >= 10) s -= G[k][i - 10] || 0; if (i >= 9) o[i] = s; } return o; }, u10 = sum10("up4"), d10 = sum10("dn4"), ratio10 = u10.map((u, i) => (u == null ? null : d10[i] > 0.5 ? u / d10[i] : u > 0.5 ? 9 : 1));
const ratioEv = (() => { const out = []; let last = -999; for (let i = i0 + 30; i < T; i++) { if (!(ratio10[i] >= 2) || ratio10[i - 1] >= 2) continue; let ok = false; for (let j = i - 20; j < i; j++) if (ratio10[j] != null && ratio10[j] <= 0.5) { ok = true; break; } if (ok && i - last > 10) { out.push(i); last = i; } } return out; })();
const thrustDefs = [["e10 from ≤15% to ≥80% within 10 sessions", riseEvents("e10", 15, 80, 10)], ["e10 from ≤15% to ≥70% within 10 sessions", riseEvents("e10", 15, 70, 10)], ["e20 from ≤15% to ≥70% within 15 sessions", riseEvents("e20", 15, 70, 15)], ["e20 from ≤20% to ≥60% within 15 sessions", riseEvents("e20", 20, 60, 15)],
  ["50-day: from ≤20% to ≥60% within 30 sessions", riseEvents("a50", 20, 60, 30)], ["50-day: from ≤20% to ≥80% within 40 sessions", riseEvents("a50", 20, 80, 40)],
  ["A day with 35%+ of stocks up 4%", firstDays(i => G.up4[i] >= 35)], ["A day with 15%+ of stocks up 4%", firstDays(i => G.up4[i] >= 15)], ["10-day ratio of 4% up-days to 4% down-days from ≤0.5 to ≥2 within 20 sessions", ratioEv]];
const thrust = thrustDefs.map(([name, days]) => { const ev = days.map(mk); return { name, ...summarize(ev), ev: ev.map(x => ({ d: x.d, f20: x.f20, f60: x.f60, f250: x.f250, adv60: x.adv60, zone: x.zone, toLow: x.toLow, held: x.held })) }; });

// ---------- 3. at the lows of rallies: held against failed ----------
const RL = E.filter(e => !e.open).flatMap(e => e.rallies.filter(r => r.cls === "failed" || r.cls === "turn").map(r => ({ ep: e.id, low: r.low, cls: r.cls, i: idx.get(r.low) }))).filter(r => r.i != null && r.i > i0 + 20);
const mn = (k, a, z) => { let m = Infinity; for (let i = Math.max(0, a); i <= Math.min(T - 1, z); i++) if (G[k][i] != null && G[k][i] < m) m = G[k][i]; return isFinite(m) ? m : null; }, mx = (k, a, z, arr) => { let m = -Infinity; const S = arr || G[k]; for (let i = Math.max(0, a); i <= Math.min(T - 1, z); i++) if (S[i] != null && S[i] > m) m = S[i]; return isFinite(m) ? m : null; };
for (const r of RL) { const i = r.i; r.g = { e10lo: mn("e10", i - 3, i), e20lo: mn("e20", i - 3, i), a50lo: mn("a50", i - 3, i), dn4hi: mx("dn4", i - 10, i), q25d: mx("q25d", i - 5, i), up4hi: mx("up4", i + 1, i + 10), e10hi: mx("e10", i + 1, i + 10), e20hi: mx("e20", i + 1, i + 15), a50hi: mx("a50", i + 1, i + 30), ratioHi: r2(mx(null, i + 1, i + 20, ratio10)) }; }
const grp = cls => RL.filter(r => r.cls === cls), medG = (cls, k) => r1(median(grp(cls).map(r => r.g[k]).filter(x => x != null)));
const tests = [["e10lo", "Washout: 10-day EMA share at or below 10% at the low", r => r.g.e10lo <= 10], ["e20lo", "Washout: 20-day EMA share at or below 10% at the low", r => r.g.e20lo <= 10], ["a50lo", "Washout: 50-day share at or below 15% at the low", r => r.g.a50lo <= 15], ["dn4hi", "A day with 30%+ of stocks down 4% in the 10 sessions to the low", r => r.g.dn4hi >= 30],
  ["up4hi", "A day with 30%+ of stocks up 4% in the next 10 sessions", r => r.g.up4hi >= 30], ["e10hi", "10-day EMA share reaches 80% in the next 10 sessions", r => r.g.e10hi >= 80], ["e20hi", "20-day EMA share reaches 70% in the next 15 sessions", r => r.g.e20hi >= 70], ["a50hi", "50-day share reaches 60% in the next 30 sessions", r => r.g.a50hi >= 60], ["ratioHi", "10-day ratio of 4% up to 4% down reaches 2 in the next 20 sessions", r => r.g.ratioHi >= 2],
  ["e10hi", "Stricter: 10-day EMA share reaches 90% in the next 10 sessions", r => r.g.e10hi >= 90], ["e20hi", "Stricter: 20-day EMA share reaches 80% in the next 15 sessions", r => r.g.e20hi >= 80], ["a50hi", "Stricter: 50-day share reaches 75% in the next 30 sessions", r => r.g.a50hi >= 75], ["ratioHi", "Stricter: the 10-day ratio reaches 3 in the next 20 sessions", r => r.g.ratioHi >= 3],
  ["combo", "Washout and surge together: 50-day share ≤15% at the low, then ≥75% within 30 sessions", r => r.g.a50lo <= 15 && r.g.a50hi >= 75], ["combo", "Washout and surge together: 20-day EMA share ≤10% at the low, then ≥80% within 15 sessions", r => r.g.e20lo <= 10 && r.g.e20hi >= 80]]
  .map(([k, name, fn]) => { const F = grp("failed"), Tn = grp("turn"), f = F.filter(fn).length, t = Tn.filter(fn).length; return { k, name, failed: f, failedN: F.length, turn: t, turnN: Tn.length, precision: f + t ? Math.round(t / (f + t) * 100) : null, base: Math.round(Tn.length / (Tn.length + F.length) * 100), medFailed: medG("failed", k), medTurn: medG("turn", k) }; });

// ---------- 4. what followed each level of each gauge ----------
function buckets(k, edges) { return edges.slice(0, -1).map((lo, q) => { const hi = edges[q + 1], ev = []; for (let i = i0; i < T - 5; i++) if (G[k][i] != null && G[k][i] >= lo && G[k][i] < hi) ev.push({ f20: fwd(i, 20), f60: fwd(i, 60), adv: adverse(i, 20) }); const f = n => ev.map(x => x["f" + n]).filter(x => x != null);
  return { lo, hi, n: ev.length, f20mean: r2(mean(f(20))), f20med: r2(median(f(20))), f20up: f(20).length ? Math.round(f(20).filter(x => x > 0).length / f(20).length * 100) : null, f20q05: r1(quantile(f(20), 0.05)), f20q95: r1(quantile(f(20), 0.95)), f60med: r1(median(f(60))), f60up: f(60).length ? Math.round(f(60).filter(x => x > 0).length / f(60).length * 100) : null, dip: r1(mean(ev.map(x => x.adv))) }; }); }
const bk = { e10: buckets("e10", [0, 10, 20, 40, 60, 80, 101]), e20: buckets("e20", [0, 10, 20, 40, 60, 80, 101]), a50: buckets("a50", [0, 10, 20, 40, 60, 80, 101]), dn4: buckets("dn4", [0, 2, 5, 15, 35, 101]), up4: buckets("up4", [0, 2, 5, 15, 35, 101]) };

// ---------- 5. each final low since 1999 ----------
const perLow = E.map(e => { const l = idx.get(e.open ? C.asOf : e.low), p = idx.get(e.peak); const argmin = (k, a, z) => { let m = a; for (let i = a; i <= z; i++) if (G[k][i] != null && G[k][i] < G[k][m]) m = i; return m; }, argmax = (k, a, z) => { let m = a; for (let i = a; i <= Math.min(T - 1, z); i++) if (G[k][i] != null && G[k][i] > G[k][m]) m = i; return m; };
  const z = Math.min(T - 1, l + 5), o = { id: e.id, name: e.name, low: e.low, open: e.open, depth: r1(e.depth) };
  for (const k of ["e10", "e20", "a50"]) { const m = argmin(k, p, z); o[k + "Min"] = G[k][m]; o[k + "Lead"] = l - m; o[k + "AtLow"] = G[k][l]; }
  const d4 = argmax("dn4", p, z); o.dn4Max = G.dn4[d4]; o.dn4Date = BR.d[d4]; o.dn4Lead = l - d4; o.dn4Days15 = 0; for (let i = p; i <= l; i++) if (G.dn4[i] >= 15) o.dn4Days15++;
  const q = argmax("q25d", p, z); o.q25dMax = G.q25d[q]; o.q25dLead = l - q;
  if (!e.open) { const u4 = argmax("up4", l + 1, l + 10); o.up4Max = G.up4[u4]; o.up4Day = u4 - l; const first = (k, th, cap) => { for (let i = l + 1; i <= Math.min(T - 1, l + cap); i++) if (G[k][i] >= th) return i - l; return null; }; o.e10to80 = first("e10", 80, 60); o.e20to70 = first("e20", 70, 60); o.a50to60 = first("a50", 60, 90); let rr = null; for (let i = l + 1; i <= Math.min(T - 1, l + 40); i++) if (ratio10[i] >= 2) { rr = i - l; break; } o.ratioTo2 = rr; o.g20 = r1(fwd(l, 20)); }
  return o; });

// ---------- 6. today ----------
const n = T - 1, rank = k => { const v = G[k].slice(i0).filter(x => x != null); return Math.round(v.filter(x => x <= G[k][n]).length / v.length * 100); };
const cur = E[E.length - 1], pI = idx.get(cur.peak), since = k => { const o = []; for (let i = pI; i <= n; i++) o.push([BR.d[i], G[k][i]]); return o; };
const today = { d: BR.d[n], v: Object.fromEntries(Object.keys(G).map(k => [k, G[k][n]])), rank: Object.fromEntries(Object.keys(G).map(k => [k, rank(k)])), ratio10: r2(ratio10[n]), dn4days15: since("dn4").filter(x => x[1] >= 15).map(x => x[0]), up4days15: since("up4").filter(x => x[1] >= 15).map(x => x[0]), e10below15since: (() => { let i = n; while (i > pI && G.e10[i] < 15) i--; return i < n ? BR.d[i + 1] : null; })(),
  washFired: wash.filter(w => w.ev.length && w.ev[w.ev.length - 1].d >= cur.peak).map(w => ({ name: w.name, dir: w.dir, th: w.th, d: w.ev.filter(x => x.d >= cur.peak).map(x => x.d) })) };

L.saveJ("gauges.json", { asOf: C.asOf, from: BR.d[i0], th: TH, wash, base, baseFall, thrust, tests, medians: Object.fromEntries(["e10lo", "e20lo", "a50lo", "dn4hi", "up4hi", "e10hi", "e20hi", "a50hi", "ratioHi"].map(k => [k, { failed: medG("failed", k), turn: medG("turn", k) }])), rallies: RL.map(r => ({ ep: r.ep, low: r.low, cls: r.cls, ...r.g })), buckets: bk, perLow, today, ratio10: { d: BR.d.slice(i0), v: ratio10.slice(i0).map(r2) } }, false);
if (require.main === module) {
  console.log("from", BR.d[i0], "| thresholds (5% / 1% tails):", JSON.stringify(TH));
  console.log("baseline all days: f20 med", base.f20.med, "up", base.f20.up + "% | f60 med", base.f60.med, "up", base.f60.up + "% | adv60 med", base.adv60med);
  console.log("\nWASHOUTS (first day):"); for (const w of wash) console.log(`${w.name} ${w.dir} ${w.th}`.padEnd(52), "n", String(w.n).padStart(3), "| f20 med", String(w.f20.med).padStart(5), "up", w.f20.up + "%", "| f60 med", String(w.f60.med).padStart(5), "up", w.f60.up + "%", "| f250 med", w.f250.med, "| adv60 med", w.adv60med, "worst", w.adv60worst, "| at low", w.atLow, "in fall", w.inFall, "outside", w.outside);
  console.log("\nTHRUSTS:"); for (const t of thrust) console.log(t.name.padEnd(74), "n", String(t.n).padStart(3), "| f20 med", String(t.f20.med).padStart(5), "| f60 med", String(t.f60.med).padStart(5), "up", t.f60.up + "%", "| f250 med", t.f250.med, "up", t.f250.up + "%", "| adv60 med", t.adv60med, "worst", t.adv60worst, "| low held", `${t.held}/${t.heldOf}`, "| zones low/fall/out", t.atLow, t.inFall, t.outside);
  console.log("\nAT RALLY LOWS (failed", grp("failed").length, "turn", grp("turn").length, "):"); for (const t of tests) console.log(t.name.padEnd(74), "failed", `${t.failed}/${t.failedN}`, "turn", `${t.turn}/${t.turnN}`, "→ share that were the turn", t.precision + "%", "(base", t.base + "%)", "| medians", t.medFailed, t.medTurn);
  console.log("\nBUCKETS f20:"); for (const k of Object.keys(bk)) console.log(k, bk[k].map(b => `[${b.lo}-${b.hi}) n${b.n} med ${b.f20med} up ${b.f20up}% q05 ${b.f20q05} dip ${b.dip}`).join(" | "));
  console.log("\nPER LOW:"); for (const o of perLow) console.log(o.id.padEnd(6), o.low, "e10min", o.e10Min, `(${o.e10Lead})`, "e20min", o.e20Min, `(${o.e20Lead})`, "a50min", o.a50Min, `(${o.a50Lead})`, "dn4max", o.dn4Max, o.dn4Date, `(${o.dn4Lead})`, "days≥15:", o.dn4Days15, "| up4max", o.up4Max, "day", o.up4Day, "| e10→80", o.e10to80, "e20→70", o.e20to70, "a50→60", o.a50to60, "ratio→2", o.ratioTo2);
  console.log("\nTODAY", JSON.stringify(today));
  console.log("\nthrust dates e10 15→80:", thrust[0].ev.map(x => `${x.d}(${x.zone},${x.f60},${x.held ? "held" : "broke"})`).join(" "));
  console.log("up4≥35 days:", thrust[6].ev.map(x => `${x.d}(${x.zone},${x.f60},${x.held ? "held" : "broke"})`).join(" "));
}
