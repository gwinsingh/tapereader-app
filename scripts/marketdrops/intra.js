// Market-drops study: the shape of the trading day from 30-minute bars (SPY, QQQ; the two years the data key reaches).
//   node scripts/marketdrops/intra.js   → .data/intra.json      (run intraday.js first)
// For each session: the overnight move (prior 16:00 close → 09:30 open) and the thirteen half-hours of the regular session.
// Then, per phase (a decline, the rebound after it, a calm stretch): where in the day the gains and losses fell.
const fs = require("fs"), path = require("path");
const L = require("./lib.js"), C = L.J("core.json");
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const nyParts = t => { const o = {}; for (const p of fmt.formatToParts(new Date(t))) o[p.type] = p.value; return { d: `${o.year}-${o.month}-${o.day}`, m: +o.hour * 60 + +o.minute }; };
function sessions(sym) {
  const f = path.join(L.DATA, "intraday", `${sym}_30m.json`); if (!fs.existsSync(f)) return null;
  const by = new Map(); for (const b of JSON.parse(fs.readFileSync(f, "utf8"))) { const { d, m } = nyParts(b.t); if (m < 570 || m >= 960) continue; if (!by.has(d)) by.set(d, []); by.get(d).push({ m, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v }); }
  const out = []; let prevClose = null;
  for (const [d, bars] of [...by.entries()].sort()) { bars.sort((a, b) => a.m - b.m); if (bars.length < 6) continue; const open = bars[0].o, close = bars[bars.length - 1].c, hi = Math.max(...bars.map(b => b.h)), lo = Math.min(...bars.map(b => b.l));
    const half = new Array(13).fill(0); for (const b of bars) half[Math.min(12, Math.floor((b.m - 570) / 30))] += Math.log(b.c / b.o) * 100;     // log % per half-hour, open to close of the bucket
    // path from the open at each half-hour close (cumulative log %)
    const pathO = []; let lastC = open; for (let k = 0; k < 13; k++) { const b = bars.find(x => Math.floor((x.m - 570) / 30) === k); if (b) lastC = b.c; pathO.push(Math.log(lastC / open) * 100); }
    out.push({ d, night: prevClose ? Math.log(open / prevClose) * 100 : null, half, pathO, day: Math.log(close / open) * 100, total: prevClose ? Math.log(close / prevClose) * 100 : null, loc: hi > lo ? (close - lo) / (hi - lo) : 0.5, rng: (hi - lo) / open * 100, hiAt: bars.find(b => b.h === hi).m, loAt: bars.find(b => b.l === lo).m, short: bars.length < 12 });
    prevClose = close; }
  return out;
}
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null), r2 = x => (x == null ? null : Math.round(x * 100) / 100);
function phaseStats(S, from, to) {
  const g = S.filter(s => s.d >= from && s.d <= to && s.night != null && !s.short); if (g.length < 5) return null;
  const sum = f => g.reduce((s, x) => s + f(x), 0), seg = (a, b) => sum(x => x.half.slice(a, b).reduce((s, v) => s + v, 0));
  const first = g.map(x => x.night + x.half[0]), lastH = g.map(x => x.half[12]), rest = g.map(x => x.half.slice(1, 12).reduce((s, v) => s + v, 0));
  const up1 = g.filter(x => x.half[0] > 0), dn1 = g.filter(x => x.half[0] < 0);
  return { from: g[0].d, to: g[g.length - 1].d, n: g.length, night: r2(sum(x => x.night)), open30: r2(seg(0, 1)), morning: r2(seg(1, 5)), midday: r2(seg(5, 9)), afternoon: r2(seg(9, 11)), lastHour: r2(seg(11, 13)), day: r2(sum(x => x.day)), total: r2(sum(x => x.total)),
    half: Array.from({ length: 13 }, (_, k) => r2(mean(g.map(x => x.half[k])))), path: Array.from({ length: 13 }, (_, k) => r2(mean(g.map(x => x.pathO[k])))), loc: r2(mean(g.map(x => x.loc))), rng: r2(mean(g.map(x => x.rng))),
    lowLate: Math.round(g.filter(x => x.loAt >= 870).length / g.length * 100), lowEarly: Math.round(g.filter(x => x.loAt < 630).length / g.length * 100), highEarly: Math.round(g.filter(x => x.hiAt < 630).length / g.length * 100), highLate: Math.round(g.filter(x => x.hiAt >= 870).length / g.length * 100),
    corrFirstLast: r2(L.corr(first, lastH)), corrFirstRest: r2(L.corr(g.map(x => x.half[0]), rest)), follow: up1.length && dn1.length ? { upN: up1.length, upRest: r2(mean(up1.map(x => x.day - x.half[0]))), upHeld: Math.round(up1.filter(x => x.day > 0).length / up1.length * 100), dnN: dn1.length, dnRest: r2(mean(dn1.map(x => x.day - x.half[0]))), dnHeld: Math.round(dn1.filter(x => x.day < 0).length / dn1.length * 100) } : null,
    gapUp: (() => { const u = g.filter(x => x.night >= 0.3); return { n: u.length, sold: u.length ? Math.round(u.filter(x => x.day < 0).length / u.length * 100) : null, dayMean: r2(mean(u.map(x => x.day))) }; })(), gapDn: (() => { const u = g.filter(x => x.night <= -0.3); return { n: u.length, bought: u.length ? Math.round(u.filter(x => x.day > 0).length / u.length * 100) : null, dayMean: r2(mean(u.map(x => x.day))) }; })() };
}
const e25 = C.spx.find(e => e.id === "2025"), cur = C.spx[C.spx.length - 1], SPX = L.bars("^GSPC"), tday = (iso, n) => SPX[Math.min(SPX.length - 1, L.bi(SPX, iso) + n)].d;
const PH = [["calm25", "Calm stretch before the 2025 drop", tday(e25.peak, -50), e25.peak], ["fall25", "The April 2025 drop (peak to low)", tday(e25.peak, 1), e25.low], ["rise25", "The rebound after it (40 sessions)", tday(e25.low, 1), tday(e25.low, 40)], ["mid", "The advance, summer 2025 to the 2026 high", tday(e25.low, 41), cur.peak], ["fall26", "The present drop (since the 6 October high)", tday(cur.peak, 1), C.asOf]];
const out = { asOf: C.asOf, phases: PH.map(p => ({ id: p[0], name: p[1], from: p[2], to: p[3] })), syms: {} };
for (const sym of ["SPY", "QQQ"]) { const S = sessions(sym); if (!S) continue; out.syms[sym] = { n: S.length, from: S[0].d, to: S[S.length - 1].d, ph: Object.fromEntries(PH.map(p => [p[0], phaseStats(S, p[2], p[3])])),
  days: S.filter(s => s.d >= tday(cur.peak, -5)).map(s => ({ d: s.d, night: r2(s.night), open30: r2(s.half[0]), mid: r2(s.half.slice(1, 11).reduce((a, v) => a + v, 0)), last: r2(s.half[11] + s.half[12]), day: r2(s.day), total: r2(s.total), loc: r2(s.loc) })) }; }
L.saveJ("intra.json", out, false);
for (const [sym, o] of Object.entries(out.syms)) { console.log(sym, o.n, "sessions", o.from, "→", o.to); for (const p of out.phases) { const s = o.ph[p.id]; if (s) console.log(" ", p.id.padEnd(7), "n", String(s.n).padStart(3), "night", s.night, "open30", s.open30, "morning", s.morning, "midday", s.midday, "aft", s.afternoon, "lastHour", s.lastHour, "| loc", s.loc, "lowLate", s.lowLate, "highEarly", s.highEarly, "| gapUp sold", s.gapUp.sold, `(${s.gapUp.n})`, "gapDn bought", s.gapDn.bought, `(${s.gapDn.n})`, "| first→rest corr", s.corrFirstRest); } }
