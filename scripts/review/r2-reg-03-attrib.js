// TRACK 2b — refined regime attribution. VIX reweighting + offered-move proportion tests.
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, days, byDay, dayR, bootCI, permP } = L;
const nSess = T => new Set(T.map(t=>t.date)).size;

console.log("=== 3.1 LIVE's VIX DISTRIBUTION vs PRACTICE's — bucket by bucket ===");
const bk = t => t.vix<15?"<15":t.vix<16?"15-16":t.vix<17?"16-17":t.vix<18?"17-18":t.vix<20?"18-20":">=20";
const B = ["<15","15-16","16-17","17-18","18-20",">=20"];
const tab = T => { const c={}; T.filter(t=>!isNaN(t.vix)).forEach(t=>{const k=bk(t); (c[k] ||= []).push(t);}); return c; };
const cl = tab(live), cp = tab(practice);
console.log("bucket   liveN  liveW%  liveExpR   pracN  pracW%  pracExpR   pracSessions");
for (const b of B) {
  const a=cl[b]||[], p=cp[b]||[];
  console.log(b.padEnd(8),
    String(a.length).padStart(4), f(a.length/71*100,0).padStart(6)+"%", f(a.length?mean(R(a)):NaN).padStart(9),
    String(p.length).padStart(7), f(p.length/248*100,0).padStart(6)+"%", f(p.length?mean(R(p)):NaN).padStart(9),
    String(p.length?nSess(p):0).padStart(10));
}

console.log("\n=== 3.2 VIX-REWEIGHTED COUNTERFACTUAL: practice trader, live's VIX mix ===");
// weight practice's per-bucket expR by live's bucket weights. NOTE: practice has ZERO <15 exposure.
let wsum=0, wR=0, unmatched=0;
for (const b of B) {
  const a=cl[b]||[], p=cp[b]||[];
  const w = a.length/71;
  if (!p.length) { unmatched += w; continue; }
  wsum += w; wR += w*mean(R(p));
}
console.log(`live weight with NO practice analogue (VIX<15): ${f(unmatched*100,0)}%  <-- EXTRAPOLATION HOLE`);
console.log(`reweighted practice expR (over matched ${f(wsum*100,0)}% of live) = ${f(wR/wsum)}`);
console.log(`live expR = ${f(mean(R(live)))}`);
console.log(`residual per trade = ${f(mean(R(live)) - wR/wsum)}  -> x70 = ${f((mean(R(live))-wR/wsum)*70,1)}R`);
console.log("NOTE: practice VIX 15-16 (live's biggest bucket analogue) earned only +0.04R/trade.");
console.log("      The 'low VIX = good' effect in practice sits in 16-17, NOT 15-16. Non-monotone.");

console.log("\n=== 3.3 MONOTONICITY CHECK: is VIX->R actually a gradient in practice? ===");
const pv = practice.filter(t=>!isNaN(t.vix));
// Spearman-ish: rank correlation between VIX and R, day level
const pd = byDay(practice), rows=[];
for (const k of Object.keys(pd)) { const v=pd[k][0].vix; if(!isNaN(v)) rows.push({v, r:sum(R(pd[k]))/pd[k].length}); }
const rank = a => { const s=[...a].map((x,i)=>({x,i})).sort((p,q)=>p.x-q.x); const r=[]; s.forEach((o,j)=>r[o.i]=j+1); return r; };
const rv=rank(rows.map(o=>o.v)), rr=rank(rows.map(o=>o.r));
const n=rows.length, mv=mean(rv), mr=mean(rr);
const spear = sum(rv.map((x,i)=>(x-mv)*(rr[i]-mr))) / Math.sqrt(sum(rv.map(x=>(x-mv)**2))*sum(rr.map(x=>(x-mr)**2)));
console.log(`Spearman(VIX, mean R/day) in practice, n=${n} sessions: rho = ${f(spear,3)}`);
// permutation p for rho
let c=0; const IT=20000;
for(let i=0;i<IT;i++){ const p=[...rr]; for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  const s2=sum(rv.map((x,ix)=>(x-mv)*(p[ix]-mr)))/Math.sqrt(sum(rv.map(x=>(x-mv)**2))*sum(p.map(x=>(x-mr)**2)));
  if(Math.abs(s2)>=Math.abs(spear)) c++; }
console.log(`  perm p = ${f(c/IT,4)}`);

console.log("\n=== 3.4 OFFERED MOVE: proportion test (the mean test was swamped by tail variance) ===");
function propTest(a, b, thr, lab) {
  const pa = a.filter(x=>x>=thr).length, pb = b.filter(x=>x>=thr).length;
  const ra = pa/a.length, rb = pb/b.length;
  // permutation on the indicator
  const A = a.map(x=>x>=thr?1:0), Bb = b.map(x=>x>=thr?1:0);
  const p = permP(A, Bb, 20000);
  console.log(`${lab.padEnd(28)} live ${pa}/${a.length}=${f(ra*100,0)}%  prac ${pb}/${b.length}=${f(rb*100,0)}%  perm p=${f(p,4)}`);
  return p;
}
const HOadrL = live.filter(t=>!isNaN(t.H)&&!isNaN(t.O)&&t.adr>0).map(t=>(t.H-t.O)/t.adr);
const HOadrP = practice.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&t.adr>0).map(t=>(t.H-t.O)/t.adr);
const HO30L = live.filter(t=>!isNaN(t.H)&&!isNaN(t.O)&&t.m30>0).map(t=>(t.H-t.O)/t.m30);
const HO30P = practice.filter(t=>t.side==="Long"&&!isNaN(t.H)&&!isNaN(t.O)&&t.m30>0).map(t=>(t.H-t.O)/t.m30);
propTest(HOadrL, HOadrP, 0.8, "(H-O)/ADR >= 0.8 [Daily Pred]");
propTest(HOadrL, HOadrP, 1.0, "(H-O)/ADR >= 1.0 [strong]");
propTest(HO30L,  HO30P,  1.0, "(H-O)/30mATR >= 1.0 [Intra]");
console.log(`median (H-O)/ADR: live ${f(med(HOadrL))} prac ${f(med(HOadrP))}`);
// day-level version to kill duplicate-day inflation
const uniq = T => { const s=new Set(), o=[]; T.forEach(t=>{const k=t.date+"|"+t.sym; if(s.has(k))return; s.add(k);
  if(!isNaN(t.H)&&!isNaN(t.O)&&t.adr>0) o.push((t.H-t.O)/t.adr);}); return o; };
const uL=uniq(live), uP=uniq(practice.filter(t=>t.side==="Long"));
console.log(`\nunique date|symbol: live n=${uL.length} med=${f(med(uL))} >=0.8: ${f(uL.filter(x=>x>=0.8).length/uL.length*100,0)}%`);
console.log(`unique date|symbol: prac n=${uP.length} med=${f(med(uP))} >=0.8: ${f(uP.filter(x=>x>=0.8).length/uP.length*100,0)}%`);
console.log("perm p (unique, indicator>=0.8) =", f(permP(uL.map(x=>x>=0.8?1:0), uP.map(x=>x>=0.8?1:0), 20000),4));

console.log("\n=== 3.5 SELECTION vs REGIME: was the bigger offered move the TAPE or his PICKS? ===");
// Index ETFs are a pure tape read (he cannot pick a better SPY). Single names are picks.
for (const [nm,T] of [["live",live],["prac",practice.filter(t=>t.side==="Long")]]) {
  const idx = T.filter(t=>["SPY","QQQ"].includes(t.sym));
  const nam = T.filter(t=>!["SPY","QQQ"].includes(t.sym));
  const g = A => { const s=new Set(),o=[]; A.forEach(t=>{const k=t.date+"|"+t.sym; if(s.has(k))return;s.add(k);
    if(!isNaN(t.H)&&!isNaN(t.O)&&t.adr>0)o.push((t.H-t.O)/t.adr);}); return o; };
  const gi=g(idx), gn=g(nam);
  console.log(`${nm}: INDEX (H-O)/ADR n=${gi.length} med=${f(med(gi))} >=0.8:${f(gi.filter(x=>x>=.8).length/Math.max(1,gi.length)*100,0)}%  | NAMES n=${gn.length} med=${f(med(gn))} >=0.8:${f(gn.filter(x=>x>=.8).length/Math.max(1,gn.length)*100,0)}%`);
}

console.log("\n=== 3.6 INSTRUMENT MIX ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const c={}; T.forEach(t=>c[t.sym]=(c[t.sym]||0)+1);
  const tot=T.length;
  const top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10);
  console.log(nm, "uniq syms =", Object.keys(c).length, "| top:", top.map(([s,n])=>`${s}:${n}`).join(" "));
  const idxN = T.filter(t=>["SPY","QQQ"].includes(t.sym)).length;
  console.log(`   index ETF share: ${idxN}/${tot} = ${f(idxN/tot*100,0)}%`);
}
console.log();
console.log(st(live.filter(t=>["SPY","QQQ"].includes(t.sym)),      "live SPY/QQQ"));
console.log(st(live.filter(t=>!["SPY","QQQ"].includes(t.sym)),     "live names"));
console.log(st(practice.filter(t=>["SPY","QQQ"].includes(t.sym)),  "prac SPY/QQQ (H3)"));
console.log(st(practice.filter(t=>!["SPY","QQQ"].includes(t.sym)), "prac names"));
