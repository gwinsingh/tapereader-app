/* Monthly review analysis library.
   Maps by HEADER NAME so it survives column additions to the sheet.
     const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
   Run `node scripts/review/fetch.js` first to refresh .data/.                      */
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, ".data");

const num = s => {
  if (s == null || s === "") return NaN;
  const t = String(s).replace(/[$,%\s]/g, "");
  return (t === "" || t === "N/A" || t === "-") ? NaN : parseFloat(t);
};
const secs = e => { const m = (e || "").match(/(\d+):(\d+):(\d+)/); return m ? (+m[1]*3600 + +m[2]*60 + +m[3]) : NaN; };

function load(file) {
  const { hdr, data } = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
  const I = {}; hdr.forEach((h, i) => I[h] = i);
  const g = (r, n) => ((r[I[n]] || "") + "").trim();
  const n = (r, name) => num(r[I[name]]);
  return data.map((r, k) => ({
    row: k + 2, raw: r, hdr,
    date: g(r,"Date"), sym: g(r,"Symbol"),
    entry: g(r,"Entry Time"), exit: g(r,"Exit Time"),
    t: secs(g(r,"Entry Time")), tExit: secs(g(r,"Exit Time")),
    dur: n(r,"Duration (mins)"), side: g(r,"Side"), sh: n(r,"Shares"),
    ent: n(r,"Avg Entry"), ex: n(r,"Avg Exit"), part: n(r,"# Partials"),
    pnl: n(r,"P&L"), risk: n(r,"R (Risk)"), pnlR: n(r,"P&L (R)"),
    setup: g(r,"Setup"), proc: g(r,"Process Followed?"), right: g(r,"RightTheory?"), notes: g(r,"Notes"),
    sleepSc: n(r,"Sleep Score"), ready: n(r,"Readiness Score"), sleepH: n(r,"Sleep (hrs)"),
    emo: g(r,"Emotional State"), bias: g(r,"Market Bias"),
    conv: n(r,"Conviction (1-3)"), cat: g(r,"Catalyst"), shot: g(r,"EOD Screenshot"),
    n1m: n(r,"#1m"), n5m: n(r,"#5m"), n1h: n(r,"#1H"),
    gap: n(r,"%Gap"), gapATR: n(r,"%ATR"), rvol: n(r,"RVOL"), vwap: n(r,"%VWAP"),
    orSize: n(r,"OR Size ($)"), orATR: n(r,"OR %ATR"), orH: n(r,"OR High"), orL: n(r,"OR Low"),
    bvr: n(r,"Breakout Vol Ratio"), pcl: n(r,"Prior Close Loc"),
    d20: n(r,"Dist 20 SMA (%)"), d50: n(r,"Dist 50 SMA (%)"),
    float: n(r,"Float"), advol: n(r,"Avg $ Vol"), spy: g(r,"SPY Dir"), vix: n(r,"VIX"),
    stop: n(r,"Stop"), maxR: n(r,"Max R Before Stop"), far: n(r,"Farthest Price"), mae: n(r,"MAE (R)"),
    pdc: n(r,"PDC"), pdh: n(r,"PDH"), pdl: n(r,"PDL"),
    O: n(r,"O"), H: n(r,"H"), L: n(r,"L"), C: n(r,"C"), V: n(r,"V"),
    atr: n(r,"ATR"), adr: n(r,"ADR"), m30: n(r,"30mATR"),
    tags: g(r,"Tags"), origin: g(r,"Origin"), l2: g(r,"L2 Bias"),
    dT: g(r,"Daily Trend"), dC: n(r,"Daily Conv"), hT: g(r,"1H Trend"), hC: n(r,"1H Conv"),
    mT: g(r,"5m Trend"), mC: n(r,"5m Conv"),
    energy: n(r,"Energy (1-5)"), tension: n(r,"Tension (1-5)"), urge: g(r,"Urge to Trade Fast?"),
  }));
}

const live     = load("U16632046_GURI.json");   // 71 trades, 19 sessions, 7/30–8/28  LIVE MONEY
const practice = load("TRPCT1541_GURI.json");   // 248 trades, 54 sessions, 5/6–7/30  PRACTICE

// ---------- stats ----------
const sum  = a => a.reduce((s, x) => s + x, 0);
const mean = a => a.length ? sum(a) / a.length : NaN;
const med  = a => { const s = [...a].filter(x => !isNaN(x)).sort((x, y) => x - y);
  return s.length ? (s.length % 2 ? s[(s.length-1)/2] : (s[s.length/2-1] + s[s.length/2]) / 2) : NaN; };
const sd   = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
const f    = (x, d = 2) => (x == null || isNaN(x)) ? "--" : Number(x).toFixed(d);
const R    = a => a.map(t => t.pnlR).filter(x => !isNaN(x));
const pctf = (a, b) => b ? f(a / b * 100, 0) + "%" : "--";

/** Bootstrap 95% CI for a mean. ALWAYS report this, never a bare point estimate. */
function bootCI(arr, iters = 5000, lo = 0.025, hi = 0.975) {
  const a = arr.filter(x => !isNaN(x));
  if (a.length < 2) return [NaN, NaN];
  const ms = [];
  for (let i = 0; i < iters; i++) { let s = 0;
    for (let j = 0; j < a.length; j++) s += a[(Math.random() * a.length) | 0];
    ms.push(s / a.length); }
  ms.sort((x, y) => x - y);
  return [ms[Math.floor(lo * iters)], ms[Math.floor(hi * iters)]];
}
/** Two-sample permutation p-value for a difference in means. */
function permP(a, b, iters = 10000) {
  a = a.filter(x => !isNaN(x)); b = b.filter(x => !isNaN(x));
  if (a.length < 3 || b.length < 3) return NaN;
  const obs = Math.abs(mean(a) - mean(b)); const pool = [...a, ...b]; let c = 0;
  for (let i = 0; i < iters; i++) {
    const p = [...pool];
    for (let j = p.length - 1; j > 0; j--) { const k = (Math.random() * (j+1)) | 0; [p[j], p[k]] = [p[k], p[j]]; }
    if (Math.abs(mean(p.slice(0, a.length)) - mean(p.slice(a.length))) >= obs) c++;
  }
  return c / iters;
}
const MIN_CELL = 15;   // never report a smaller split as a finding
function st(a, label = "") {
  if (!a.length) return `${label} n=0`;
  const rs = R(a), ci = bootCI(rs);
  return `${label ? label.padEnd(30) : ""}n=${String(a.length).padStart(3)}${a.length < MIN_CELL ? "*" : " "}` +
    ` win%=${f(a.filter(t => t.pnl > 0).length / a.length * 100, 0).padStart(3)}` +
    ` expR=${f(mean(rs)).padStart(6)} [${f(ci[0]).padStart(5)},${f(ci[1]).padStart(5)}]` +
    ` sumR=${f(sum(rs), 1).padStart(6)} $=${f(sum(a.map(t => t.pnl))).padStart(8)}`;
}
function byDay(T) { const d = {}; T.forEach(t => (d[t.date] ||= []).push(t));
  Object.values(d).forEach(a => a.sort((x, y) => x.t - y.t)); return d; }
const days = T => Object.keys(byDay(T)).sort();
const dayR = T => { const d = byDay(T); return days(T).map(k => ({ date: k, r: sum(R(d[k])), n: d[k].length,
  pnl: sum(d[k].map(t => t.pnl)) })); };

module.exports = { live, practice, load, num, secs, sum, mean, med, sd, f, R, pctf,
                   bootCI, permP, st, byDay, days, dayR, MIN_CELL };
