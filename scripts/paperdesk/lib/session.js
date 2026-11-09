// Builds the per-symbol session context the replay engine needs (bars + close-time facts), from the panel
// and (when fetched) 1-min bars. Also the 1-min bar cache / fetch.
const fs = require("fs"), path = require("path");
const { DATA, etParts, readJ, writeJ } = require("./util.js");
const M = require("./market.js");
const E = require("./earnings.js");
const DIR = path.join(DATA, "bars1m"); fs.mkdirSync(DIR, { recursive: true });
const fin = x => typeof x === "number" && isFinite(x);

function bars1mFile(date, sym) { return path.join(DIR, `${date}_${sym}.json`); }
async function fetch1m(date, sym) {
  const f = bars1mFile(date, sym); const c = readJ(f, null); if (c) return c;
  const { aggs } = require("./polygon.js");
  const res = await aggs(sym, 1, "minute", date, date);
  const bars = [];
  for (const r of res) { const e = etParts(r.t); if (e.date !== date || e.min < 570 || e.min >= 960) continue; bars.push({ m: e.min, o: r.o, h: r.h, l: r.l, c: r.c, v: r.v }); }
  if (bars.length) writeJ(f, bars);
  return bars;
}
function cached1m(date, sym) { return readJ(bars1mFile(date, sym), null); }

function closeFacts(P, j, sym) {
  const t = P.T.get(sym), I = M.ind(P, sym); if (!t || !I || !fin(t.c[j])) return null;
  return { c: t.c[j], ma: { ema9: I.ema9[j], ema10: I.ema10[j], ema20: I.ema20[j], ema21: I.ema21[j], ema50: I.ema50[j], sma50: I.sma50[j] }, rs: I.rs ? I.rs[j] : NaN, rsLo10: I.rsLo10 ? I.rsLo10[j - 1] : NaN, sectorOk: M.sectorOk(P, j, sym) };
}
function dailyBar(P, j, sym) { const t = P.T.get(sym); if (!t || !fin(t.o[j])) return null; return { m: 570, o: t.o[j], h: t.h[j], l: t.l[j], c: t.c[j], v: t.v[j] }; }

// Does a report fall between this session's close and the next session's open?
function reportTonight(sym, date, nextDate, opts) {
  const a = E.byDate(date, opts), b = E.byDate(nextDate, opts);
  return a.get(sym) === "time-after-hours" || (b.has(sym) && b.get(sym) !== "time-after-hours");
}

// Which symbols need 1-min bars for session j? (only where the daily bar can't settle the order of events)
function needs1m(P, j, ordersBySym, positions) {
  const need = new Set();
  for (const [sym, os] of ordersBySym) {
    const d = dailyBar(P, j, sym); if (!d) continue;
    for (const o of os) {
      const t = o.trigger, sgn = o.dir === "long" ? 1 : -1;
      if (t.type === "orh_break") { if (!t.minGapPrice || d.o >= t.minGapPrice) need.add(sym); continue; }
      const lv = t.level; if (fin(lv) && (sgn > 0 ? d.h >= lv : d.l <= lv)) need.add(sym);
    }
  }
  for (const p of positions) {
    if (p.shares <= 0) continue;
    const d = dailyBar(P, j, p.sym); if (!d) continue;
    const sgn = p.dir === "long" ? 1 : -1, hitsStop = sgn > 0 ? d.l <= p.stop : d.h >= p.stop;
    const tg = (p.scheme.trims || []).filter((t, k) => t.atR && !p.trims.includes(k)).map(t => p.entry + sgn * t.atR * p.rps);
    const hitsTgt = tg.some(x => sgn > 0 ? d.h >= x : d.l <= x);
    if (hitsStop && hitsTgt) need.add(p.sym);                 // order matters only when both are touched
  }
  return need;
}

function buildSession(P, j, syms, bars1m, opts = { fetch: false }) {
  const date = P.dates[j], next = P.dates[j + 1] || require("./util.js").nextSession(date);
  const symbols = new Map();
  for (const s of syms) {
    const d = dailyBar(P, j, s); if (!d) continue;
    const m1 = bars1m && bars1m.get(s);
    const I = M.ind(P, s);
    symbols.set(s, { bars: m1 && m1.length ? m1 : [d], mode: m1 && m1.length ? "1m" : "daily", close: closeFacts(P, j, s), adv: I ? I.adv20[j - 1] : 1e9, reportTonight: reportTonight(s, date, next, opts) });
  }
  return { date, symbols };
}
module.exports = { fetch1m, cached1m, closeFacts, dailyBar, needs1m, buildSession, reportTonight };
