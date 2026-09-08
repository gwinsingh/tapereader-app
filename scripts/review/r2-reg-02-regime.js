// TRACK 2 — REGIME. What was different about the tape, and how much of the 12R gap does it explain?
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, days, byDay, dayR, bootCI, permP } = L;

const dayVals = (T, fld) => { // day-level values (artifact #8: VIX/SPY are day-level)
  const d = byDay(T), out = [];
  for (const k of Object.keys(d).sort()) { const v = d[k].map(t=>t[fld]).filter(x=>!isNaN(x)); if (v.length) out.push({date:k, v:v[0], all:v}); }
  return out;
};
const q = (a,p) => { const s=[...a].filter(x=>!isNaN(x)).sort((x,y)=>x-y); return s[Math.min(s.length-1,Math.floor(p*s.length))]; };

console.log("=== 2.1 DAY-LEVEL REGIME VARIABLES (n = sessions, artifact #8) ===");
for (const fld of ["vix"]) {
  const lv = dayVals(live,fld).map(d=>d.v), pv = dayVals(practice,fld).map(d=>d.v);
  console.log(`${fld}: live n=${lv.length} mean=${f(mean(lv))} med=${f(med(lv))} min=${f(Math.min(...lv))} max=${f(Math.max(...lv))} sd=${f(sd(lv))}`);
  console.log(`${fld}: prac n=${pv.length} mean=${f(mean(pv))} med=${f(med(pv))} min=${f(Math.min(...pv))} max=${f(Math.max(...pv))} sd=${f(sd(pv))}`);
  console.log(`  perm p (day-level) = ${f(permP(lv,pv,50000),4)}`);
  console.log(`  practice sessions below live max VIX (17.09): ${pv.filter(x=>x<=17.09).length}/${pv.length}`);
  console.log(`  practice sessions inside live range [14.25,17.09]: ${pv.filter(x=>x>=14.25&&x<=17.09).length}/${pv.length}`);
}

console.log("\n=== 2.2 SPY DIRECTION (day-level) ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const d = byDay(T), c={};
  for (const k of Object.keys(d)) { const s = d[k][0].spy||"(blank)"; c[s]=(c[s]||0)+1; }
  const tot = Object.values(c).reduce((a,b)=>a+b,0);
  console.log(nm, Object.entries(c).map(([k,v])=>`${k}:${v}(${f(v/tot*100,0)}%)`).join("  "));
}

console.log("\n=== 2.3 TRADE-LEVEL TAPE CHARACTER (per-trade; some are day+symbol level) ===");
const flds = [["adr","ADR $"],["atr","ATR $"],["m30","30mATR $"],["rvol","RVOL"],["gap","%Gap"],["gapATR","%ATR(gap)"],["orSize","OR Size $"],["orATR","OR %ATR"],["bvr","BVR"],["advol","Avg $ Vol"],["float","Float"]];
console.log("field".padEnd(12), "live n/med/mean".padEnd(34), "prac n/med/mean".padEnd(34), "perm p");
for (const [fl,lab] of flds) {
  const a = live.map(t=>t[fl]).filter(x=>!isNaN(x)), b = practice.map(t=>t[fl]).filter(x=>!isNaN(x));
  console.log(lab.padEnd(12),
    `${String(a.length).padStart(3)} ${f(med(a),3).padStart(12)} ${f(mean(a),3).padStart(12)}`.padEnd(34),
    `${String(b.length).padStart(3)} ${f(med(b),3).padStart(12)} ${f(mean(b),3).padStart(12)}`.padEnd(34),
    f(permP(a,b,20000),4));
}

console.log("\n=== 2.4 NORMALISED VOLATILITY: the move-size available per unit risk ===");
// ADR / price is the honest cross-instrument volatility measure
for (const [nm,T] of [["live",T=>0],["x",0]]) break;
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const v = T.map(t=>t.adr/t.ent*100).filter(x=>!isNaN(x)&&isFinite(x));
  const m = T.map(t=>t.m30/t.ent*100).filter(x=>!isNaN(x)&&isFinite(x));
  console.log(`${nm}: ADR%price med=${f(med(v))} mean=${f(mean(v))} | 30mATR%price med=${f(med(m))} mean=${f(mean(m))}`);
}
console.log("perm p ADR%price =", f(permP(live.map(t=>t.adr/t.ent*100).filter(x=>!isNaN(x)&&isFinite(x)), practice.map(t=>t.adr/t.ent*100).filter(x=>!isNaN(x)&&isFinite(x)),20000),4));

console.log("\n=== 2.5 THE KEY TEST: what did PRACTICE earn on its OWN low-VIX subset? ===");
// Live VIX range 14.25 - 17.09. Match practice on the same window.
const LMIN=14.25, LMAX=17.09;
const pLow  = practice.filter(t=>!isNaN(t.vix) && t.vix>=LMIN && t.vix<=LMAX);
const pLow2 = practice.filter(t=>!isNaN(t.vix) && t.vix<17.2);          // pre-registered H1 threshold
const pHigh = practice.filter(t=>!isNaN(t.vix) && t.vix>=17.2);
console.log(st(live,           "live (VIX 14.25-17.09)"));
console.log(st(pLow,           "prac VIX in live range"));
console.log(st(pLow2,          "prac VIX < 17.2 (H1)"));
console.log(st(pHigh,          "prac VIX >= 17.2"));
const nSess = T => new Set(T.map(t=>t.date)).size;
console.log(`sessions: live=${nSess(live)} pracInRange=${nSess(pLow)} pracLow=${nSess(pLow2)} pracHigh=${nSess(pHigh)}`);
console.log("perm p live vs prac-in-range (per trade) =", f(permP(R(live),R(pLow),50000),4));
console.log("perm p live vs prac VIX<17.2  (per trade) =", f(permP(R(live),R(pLow2),50000),4));
// day level
const dl = dayR(live).map(d=>d.r);
const dpLow = dayR(pLow).map(d=>d.r), dpHigh = dayR(pHigh).map(d=>d.r);
console.log(`day-level R/session: live=${f(mean(dl))} pracInRange=${f(mean(dpLow))} pracHigh=${f(mean(dpHigh))}`);
console.log("perm p day-level live vs prac-in-range =", f(permP(dl,dpLow,50000),4));

console.log("\n=== 2.6 REGIME ATTRIBUTION OF THE 12R GAP ===");
const expLive = mean(R(live)), expPrac = mean(R(practice)), expPracLow = mean(R(pLow));
const N = R(live).length;
console.log(`live expR              = ${f(expLive)}`);
console.log(`practice expR (all)    = ${f(expPrac)}`);
console.log(`practice expR (matched VIX) = ${f(expPracLow)}   n=${pLow.length}`);
console.log(`gap total  = (${f(expLive)} - ${f(expPrac)}) x ${N} = ${f((expLive-expPrac)*N,1)}R`);
console.log(`  regime slice = (${f(expPracLow)} - ${f(expPrac)}) x ${N} = ${f((expPracLow-expPrac)*N,1)}R`);
console.log(`  residual     = (${f(expLive)} - ${f(expPracLow)}) x ${N} = ${f((expLive-expPracLow)*N,1)}R`);
console.log("CI on residual per-trade diff (bootstrap of each arm):");
function diffCI(a,b,iters=20000){ const out=[];
  for(let i=0;i<iters;i++){ let s1=0,s2=0; for(let j=0;j<a.length;j++) s1+=a[(Math.random()*a.length)|0];
    for(let j=0;j<b.length;j++) s2+=b[(Math.random()*b.length)|0]; out.push(s1/a.length - s2/b.length); }
  out.sort((x,y)=>x-y); return [out[Math.floor(.025*iters)], out[Math.floor(.975*iters)]]; }
const dci = diffCI(R(live), R(pLow));
console.log(`  live - pracLow per-trade = ${f(expLive-expPracLow)} R  95% CI [${f(dci[0])}, ${f(dci[1])}]  -> x${N} = [${f(dci[0]*N,1)}, ${f(dci[1]*N,1)}]R`);

console.log("\n=== 2.7 VIX DECILE / BUCKET SWEEP INSIDE PRACTICE (is VIX even monotone?) ===");
const pv = practice.filter(t=>!isNaN(t.vix));
const bks = [[0,15],[15,16],[16,17],[17,18],[18,20],[20,99]];
for (const [lo,hi] of bks) {
  const s = pv.filter(t=>t.vix>=lo&&t.vix<hi);
  if (s.length) console.log(st(s, `prac VIX ${lo}-${hi}`), ` sessions=${nSess(s)}`);
}
const lv = live.filter(t=>!isNaN(t.vix));
for (const [lo,hi] of bks) {
  const s = lv.filter(t=>t.vix>=lo&&t.vix<hi);
  if (s.length) console.log(st(s, `LIVE VIX ${lo}-${hi}`), ` sessions=${nSess(s)}`);
}

console.log("\n=== 2.8 WAS THE TAPE ACTUALLY 'EASIER'? Market-offered move, independent of him ===");
// day-level: SPY/QQQ daily range as % (uses O/H/L/C on his own traded rows for index ETFs)
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const idx = T.filter(t=>["SPY","QQQ"].includes(t.sym) && !isNaN(t.H)&&!isNaN(t.Lg));
  const rows = T.filter(t=>["SPY","QQQ"].includes(t.sym) && !isNaN(t.H)&&!isNaN(t.L)&&!isNaN(t.O));
  const seen = new Set(), rng=[], upMove=[];
  for (const t of rows) { const k=t.date+t.sym; if(seen.has(k))continue; seen.add(k);
    rng.push((t.H-t.L)/t.O*100); upMove.push((t.H-t.O)/t.O*100); }
  console.log(`${nm} index-ETF day-range%: n=${rng.length} med=${f(med(rng))} mean=${f(mean(rng))} | (H-O)/O%: med=${f(med(upMove))}`);
}
// For EVERY traded row: how much did the stock offer above the open, in ADR units (the "tape gave it" measure)
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const off = T.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&!isNaN(t.adr)&&t.adr>0).map(t=>(t.H-t.O)/t.adr);
  const off30 = T.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&!isNaN(t.m30)&&t.m30>0).map(t=>(t.H-t.O)/t.m30);
  console.log(`${nm} (H-O)/ADR:   n=${off.length} med=${f(med(off))} mean=${f(mean(off))}  >=0.8ADR: ${f(off.filter(x=>x>=0.8).length/off.length*100,0)}%`);
  console.log(`${nm} (H-O)/30mATR n=${off30.length} med=${f(med(off30))} mean=${f(mean(off30))}  >=1x: ${f(off30.filter(x=>x>=1).length/off30.length*100,0)}%`);
}
const offL = live.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&!isNaN(t.adr)&&t.adr>0).map(t=>(t.H-t.O)/t.adr);
const offP = practice.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&!isNaN(t.adr)&&t.adr>0).map(t=>(t.H-t.O)/t.adr);
console.log("perm p (H-O)/ADR live vs prac =", f(permP(offL,offP,20000),4));
