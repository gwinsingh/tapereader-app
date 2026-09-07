const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, sd, R, permP, bootCI, byDay, days } = L;
const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
function permCorr(a,b,iters=20000){const obs=Math.abs(corr(a,b));let c=0;
  for(let i=0;i<iters;i++){const p=[...b];for(let j=p.length-1;j>0;j--){const q=(Math.random()*(j+1))|0;[p[j],p[q]]=[p[q],p[j]];}
    if(Math.abs(corr(a,p))>=obs)c++;} return c/iters;}

// ---------- REST COMPOSITE: one pre-specified test instead of 25 ----------
console.log("=== REST COMPOSITE (mean z of sleepH, sleepSc, ready) — ONE test each ===");
const d=byDay(live);
let S=days(live).map(k=>{const g=d[k];const fst=v=>{const x=g.map(t=>t[v]).find(y=>!isNaN(y));return x===undefined?NaN:x;};
  return {date:k,n:g.length,r:sum(R(g)),g,sleepH:fst("sleepH"),sleepSc:fst("sleepSc"),ready:fst("ready"),
    energy:fst("energy"),tension:fst("tension"),
    procYes:g.filter(t=>t.proc==="Yes").length,procNo:g.filter(t=>t.proc==="No").length,
    procBlank:g.filter(t=>t.proc==="").length,notes:g.filter(t=>t.notes!=="").length};});
const z=(arr,k)=>{const v=arr.filter(s=>!isNaN(s[k])).map(s=>s[k]);const m=mean(v),s2=sd(v);
  return s=>isNaN(s[k])?NaN:(s[k]-m)/s2;};
const zs=["sleepH","sleepSc","ready"].map(k=>z(S,k));
S.forEach(s=>{const v=zs.map(fn=>fn(s)).filter(x=>!isNaN(x)); s.rest=v.length?mean(v):NaN;});
const W=S.filter(s=>!isNaN(s.rest));
console.log("sessions with rest composite:", W.length, "of", S.length);
[["day R", s=>s.r],["trades/day", s=>s.n],["proc-Yes rate", s=>(s.procYes+s.procNo)?s.procYes/(s.procYes+s.procNo):NaN],
 ["note rate", s=>s.notes/s.n]].forEach(([lbl,g])=>{
  const w=W.filter(s=>!isNaN(g(s)));
  console.log("  rest vs "+lbl.padEnd(14)+" r="+f(corr(w.map(s=>s.rest),w.map(g)),3).padStart(7)+
    " p="+f(permCorr(w.map(s=>s.rest),w.map(g)),4)+" n="+w.length);
});
console.log("  (4 tests. sign consistency: better rest -> ? )");

// ---------- SELECTION vs EXECUTION: posMFE ----------
console.log("\n=== WHAT THE MARKET OFFERED (posMFE) — selection quality separated from exit ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>!isNaN(t.posMFE));
  console.log("-- "+bn+" n="+w.length+" median posMFE="+f(med(w.map(t=>t.posMFE)))+" mean="+f(mean(w.map(t=>t.posMFE))));
  [0.5,1,1.5,2,2.5,3].forEach(k=>console.log("   posMFE >= "+k+"R: "+f(w.filter(t=>t.posMFE>=k).length/w.length*100,0)+"%"));
}
console.log("\nartifact #12 check: does posMFE grow with entries?");
[1,2,3].forEach(k=>{const g=live.filter(t=>t.nEntries===k||(k===3&&t.nEntries>=3));
  if(g.length)console.log("  #Entries="+(k===3?"3+":k)+" n="+g.length+" median posMFE="+f(med(g.map(t=>t.posMFE)))+" median R="+f(med(R(g))));});
// Selection quality by instrument class on posMFE (offer, not outcome)
const IDX=new Set(["SPY","QQQ","IWM","DIA","XLE","XLF","XLK","IGV","SMH"]),LEV=new Set(["SOXL","SQQQ","TQQQ","SOXS","SPXL","TNA","FNGU"]),
 MEGA=new Set(["AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","AMD","CRM","INTC","CSCO","ADBE","ORCL","NFLX","QCOM","TXN","INTU","NOW","MU","AMAT","COST","WMT","JPM","V","MA"]);
const cls=t=>LEV.has(t.sym)?"levETF":IDX.has(t.sym)?"indexETF":MEGA.has(t.sym)?"megacap":"other";
console.log("\nposMFE (single-entry trades only, so artifact #12 cannot bite):");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>!isNaN(t.posMFE)&&t.nEntries===1); const b={};
  w.forEach(t=>(b[cls(t)] ||= []).push(t));
  console.log("-- "+bn+" (n="+w.length+")");
  Object.entries(b).sort().forEach(([k,a])=>console.log("   "+k.padEnd(9)+" n="+String(a.length).padStart(3)+
    " medianPosMFE="+f(med(a.map(t=>t.posMFE)))+" meanR="+f(mean(R(a)))+" %offering>=1R="+f(a.filter(t=>t.posMFE>=1).length/a.length*100,0)));
}

// ---------- pos-in-OR robustness (the one extension measure that half-survived) ----------
console.log("\n=== 'entry position inside the opening range' — robustness ===");
const posOR=t=>(isNaN(t.firstEntry)||isNaN(t.orH)||isNaN(t.orL)||t.orH===t.orL)?NaN:(t.firstEntry-t.orL)/(t.orH-t.orL);
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>!isNaN(posOR(t))&&!isNaN(t.pnlR));
  const m=med(w.map(posOR));
  const lo=w.filter(t=>posOR(t)<m), hi=w.filter(t=>posOR(t)>=m);
  console.log("-- "+bn+" median pos="+f(m,3));
  console.log(st(lo,"  below median (less extended)")); console.log(st(hi,"  above median (more extended)"));
  console.log("   permP="+f(permP(R(lo),R(hi)),4));
  // and inside the OR vs beyond it
  const ins=w.filter(t=>posOR(t)<=1), out=w.filter(t=>posOR(t)>1);
  console.log(st(ins,"  entered inside/at OR")); console.log(st(out,"  entered above OR high"));
  console.log("   permP="+f(permP(R(ins),R(out)),4));
}
console.log("\nlive lowest-tercile robustness:");
{ const w=live.filter(t=>!isNaN(posOR(t))&&!isNaN(t.pnlR)).sort((a,b)=>posOR(a)-posOR(b));
  const k=Math.floor(w.length/3), lo=w.slice(0,k);
  console.log(st(lo,"  lo tercile")); console.log(st(lo.filter(t=>t.sym!=="MRNA"),"  ex-MRNA"));
  console.log("  top R inside: "+[...lo].sort((a,b)=>b.pnlR-a.pnlR).slice(0,3).map(t=>t.sym+" "+f(t.pnlR)).join(", ")); }

// ---------- END-OF-MONTH DRAWDOWN ----------
console.log("\n=== END-OF-MONTH DRAWDOWN: peak 2026-08-21, then 08-24..08-28 ===");
const PEAK="2026-08-21";
const before=live.filter(t=>t.date<=PEAK), after=live.filter(t=>t.date>PEAK);
console.log(st(before,"through 08-21")); console.log(st(after,"after 08-21"));
console.log("permP=",f(permP(R(before),R(after)),4));
const cmp=(lbl,g)=>{const b=before.filter(g),a=after.filter(g);
  console.log("  "+lbl.padEnd(26)+" before="+f(b.length/before.length*100,0)+"% after="+f(a.length/after.length*100,0)+"%");};
console.log("\nbehaviour shift (share of trades):");
cmp("entered <09:35", t=>t.t<9*3600+30*60+300);
cmp("SPY/QQQ", t=>t.sym==="SPY"||t.sym==="QQQ");
cmp("index/lev ETF", t=>cls(t)==="indexETF"||cls(t)==="levETF");
cmp("mega-cap", t=>cls(t)==="megacap");
cmp("proc blank", t=>t.proc==="");
cmp("notes written", t=>t.notes!=="");
cmp("multi-entry (scaled in)", t=>t.nEntries>1);
cmp("stopped out", t=>t.stoppedOut==="Yes");
cmp("stop raised", t=>t.stopRaises>0);
console.log("\nnumbers:");
[["trades/session", (T)=>T.length/new Set(T.map(t=>t.date)).size],
 ["mean posMFE", (T)=>mean(T.map(t=>t.posMFE).filter(x=>!isNaN(x)))],
 ["median posMFE", (T)=>med(T.map(t=>t.posMFE).filter(x=>!isNaN(x)))],
 ["mean duration (min)", (T)=>mean(T.map(t=>t.dur).filter(x=>!isNaN(x)))],
 ["mean #Entries", (T)=>mean(T.map(t=>t.nEntries).filter(x=>!isNaN(x)))],
 ["mean risk $", (T)=>mean(T.map(t=>t.risk).filter(x=>!isNaN(x)))],
 ["mean shares", (T)=>mean(T.map(t=>t.sh).filter(x=>!isNaN(x)))],
 ["win%", (T)=>T.filter(t=>t.pnl>0).length/T.length*100],
 ["mean VIX", (T)=>mean(T.map(t=>t.vix).filter(x=>!isNaN(x)))],
 ["mean RVOL", (T)=>mean(T.map(t=>t.rvol).filter(x=>!isNaN(x)))],
 ["% SPY Dir Up", (T)=>T.filter(t=>/up/i.test(t.spy)).length/T.length*100],
].forEach(([lbl,g])=>console.log("  "+lbl.padEnd(22)+" before="+f(g(before))+"  after="+f(g(after))));
console.log("\n  did the market stop offering? posMFE>=1R:",
  "before="+f(before.filter(t=>t.posMFE>=1).length/before.filter(t=>!isNaN(t.posMFE)).length*100,0)+"%",
  "after="+f(after.filter(t=>t.posMFE>=1).length/after.filter(t=>!isNaN(t.posMFE)).length*100,0)+"%");
console.log("  permP posMFE:",f(permP(before.map(t=>t.posMFE).filter(x=>!isNaN(x)),after.map(t=>t.posMFE).filter(x=>!isNaN(x))),4));
console.log("\n  SPY Dir by session (live):");
days(live).forEach(k=>console.log("    "+k+" "+(byDay(live)[k][0].spy||"-").padEnd(6)+" VIX="+f(byDay(live)[k][0].vix)+" R="+f(sum(R(byDay(live)[k])),1)));
