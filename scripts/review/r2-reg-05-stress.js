// TRACK 3+5 — execution/timing, and STRESS-TEST the pyramid result against the variance null.
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, bootCI, permP, byDay, dayR } = L;
const parseLad = s => (s||"").split("|").map(p=>p.trim()).filter(Boolean).map(p=>{
  const m = p.match(/(\d+):(\d+):(\d+)@([\d.]+)x([\d.]+)/);
  return m ? { t:+m[1]*3600+ +m[2]*60+ +m[3], px:+m[4], sh:+m[5] } : null; }).filter(Boolean);
function enrich(T){ return T.map(t=>{
  const E=parseLad(t.entryLadder), X=parseLad(t.exitLadder);
  const avgEx = X.length? sum(X.map(x=>x.px*x.sh))/sum(X.map(x=>x.sh)) : t.ex;
  const sign = t.side==="Short"?-1:1, first=E[0];
  const sPnl = first ? (avgEx-first.px)*first.sh*sign : NaN;
  return {...t, E,X,first, starterR: t.initRisk>0? sPnl/t.initRisk : NaN, lift: t.initRisk>0&&first? t.pnlR - sPnl/t.initRisk : NaN,
    riskRatio: t.initRisk>0? t.maxRisk/t.initRisk : NaN};});}
const LV=enrich(live.filter(t=>t.entryLadder)), PR=enrich(practice.filter(t=>t.entryLadder));

console.log("=== 5.1 IS THE PYRAMID LIFT JUST THE SAME 3 TRADES? ===");
const adders = LV.filter(t=>t.nEntries>=2&&!isNaN(t.lift)).sort((a,b)=>b.lift-a.lift);
adders.forEach(t=>console.log(`  ${t.date} ${t.sym.padEnd(6)} nEnt=${t.nEntries} actualR=${f(t.pnlR,2).padStart(6)} starterR=${f(t.starterR,2).padStart(6)} lift=${f(t.lift,2).padStart(6)} riskRatio=${f(t.riskRatio)}`));
const lifts = adders.map(t=>t.lift);
console.log(`total lift ${f(sum(lifts),1)}R | excl top1 ${f(sum(lifts.slice(1)),1)}R | excl top2 ${f(sum(lifts.slice(2)),1)}R | excl top3 ${f(sum(lifts.slice(3)),1)}R`);
const pAdd = PR.filter(t=>t.nEntries>=2&&!isNaN(t.lift)).map(t=>t.lift).sort((a,b)=>b-a);
console.log(`prac lift ${f(sum(pAdd),1)}R | excl top1 ${f(sum(pAdd.slice(1)),1)}R | excl top2 ${f(sum(pAdd.slice(2)),1)}R | excl top3 ${f(sum(pAdd.slice(3)),1)}R  (n=${pAdd.length})`);

console.log("\n=== 5.2 NULL FOR THE PYRAMID LIFT: could practice's add behaviour produce live's lift? ===");
// draw 27 adding trades from practice's lift distribution
const obs = sum(lifts);
let c=0; const IT=50000, out=[];
for(let i=0;i<IT;i++){ let s=0; for(let j=0;j<lifts.length;j++) s+=pAdd[(Math.random()*pAdd.length)|0]; out.push(s); if(s>=obs)c++; }
out.sort((a,b)=>a-b);
console.log(`draw ${lifts.length} adding trades from practice lift dist: median=${f(out[IT/2],1)}R 95%=[${f(out[Math.floor(.025*IT)],1)}, ${f(out[Math.floor(.975*IT)],1)}]`);
console.log(`P(lift >= ${f(obs,1)}R) = ${f(c/IT*100,1)}%`);

console.log("\n=== 5.3 ENTRY TIMING ===");
const bkt = t => t.t<9.5*3600+300 ? "9:30-9:35" : t.t<9.5*3600+900 ? "9:35-9:45" : t.t<10*3600 ? "9:45-10:00" : t.t<10.5*3600 ? "10:00-10:30" : ">10:30";
const ORD=["9:30-9:35","9:35-9:45","9:45-10:00","10:00-10:30",">10:30"];
for (const [nm,T] of [["live",live],["prac",practice]]) {
  console.log(nm+":");
  for (const b of ORD) { const s=T.filter(t=>!isNaN(t.t)&&bkt(t)===b); if(s.length) console.log("  "+st(s,b)); }
  const t0 = T.map(t=>t.t).filter(x=>!isNaN(x));
  console.log(`  median entry time = ${new Date(med(t0)*1000).toISOString().substr(11,8)}  | 9:30-9:35 share = ${f(T.filter(t=>!isNaN(t.t)&&bkt(t)==="9:30-9:35").length/T.length*100,0)}%`);
}
console.log("perm p entry-second live vs prac =", f(permP(live.map(t=>t.t).filter(x=>!isNaN(x)), practice.map(t=>t.t).filter(x=>!isNaN(x)),20000),4));
console.log("H8 on live (9:30-9:35 vs later):");
console.log("  "+st(live.filter(t=>bkt(t)==="9:30-9:35"),"live 9:30-9:35"));
console.log("  "+st(live.filter(t=>!isNaN(t.t)&&bkt(t)!=="9:30-9:35"),"live later"));
console.log("  perm p =", f(permP(R(live.filter(t=>bkt(t)==="9:30-9:35")), R(live.filter(t=>!isNaN(t.t)&&bkt(t)!=="9:30-9:35")),20000),4));

console.log("\n=== 5.4 HOLD TIME (artifact #2 — definitional, read with MFE) ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const d=T.map(t=>t.dur).filter(x=>!isNaN(x));
  console.log(`${nm}: dur med=${f(med(d),1)}m mean=${f(mean(d),1)}m | <2min: ${f(T.filter(t=>t.dur<2).length/T.length*100,0)}% | >=5min: ${f(T.filter(t=>t.dur>=5).length/T.length*100,0)}%`);
  const w=T.filter(t=>t.pnlR>0).map(t=>t.dur).filter(x=>!isNaN(x)), l=T.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(x=>!isNaN(x));
  console.log(`     winners med=${f(med(w),1)}m  losers med=${f(med(l),1)}m`);
}
console.log("perm p duration =", f(permP(live.map(t=>t.dur).filter(x=>!isNaN(x)), practice.map(t=>t.dur).filter(x=>!isNaN(x)),20000),4));
console.log("perm p duration among LOSERS only (cuts the definitional link) =",
  f(permP(live.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(x=>!isNaN(x)), practice.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(x=>!isNaN(x)),20000),4));

console.log("\n=== 5.5 POSITION MFE + CAPTURE (artifact #5/#12) ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const m=T.map(t=>t.posMFE).filter(x=>!isNaN(x));
  const cap=T.map(t=>t.capturePct).filter(x=>!isNaN(x));
  console.log(`${nm}: posMFE n=${m.length} med=${f(med(m))} mean=${f(mean(m))} | >=1R: ${f(m.filter(x=>x>=1).length/m.length*100,0)}% | >=2.5R: ${f(m.filter(x=>x>=2.5).length/m.length*100,0)}%`);
  console.log(`     Capture%: med=${f(med(cap),1)} mean=${f(mean(cap),1)}`);
  // single-entry only (artifact #12: posMFE inflated by size growth)
  const se=T.filter(t=>t.nEntries===1).map(t=>t.posMFE).filter(x=>!isNaN(x));
  console.log(`     SINGLE-ENTRY only: n=${se.length} med posMFE=${f(med(se))} >=1R: ${f(se.filter(x=>x>=1).length/se.length*100,0)}%`);
}
const seL=live.filter(t=>t.nEntries===1).map(t=>t.posMFE).filter(x=>!isNaN(x));
const seP=practice.filter(t=>t.nEntries===1).map(t=>t.posMFE).filter(x=>!isNaN(x));
console.log("perm p single-entry posMFE (clean entry-quality read) =", f(permP(seL,seP,20000),4));
console.log("perm p P(single-entry posMFE>=1R) =", f(permP(seL.map(x=>x>=1?1:0), seP.map(x=>x>=1?1:0),20000),4));
console.log("  live SE >=1R:", seL.filter(x=>x>=1).length+"/"+seL.length, " prac SE >=1R:", seP.filter(x=>x>=1).length+"/"+seP.length);

console.log("\n=== 5.6 SINGLE-ENTRY BOOK ONLY — the cleanest like-for-like ===");
console.log(st(live.filter(t=>t.nEntries===1),      "live single-entry"));
console.log(st(practice.filter(t=>t.nEntries===1),  "prac single-entry"));
console.log("perm p =", f(permP(R(live.filter(t=>t.nEntries===1)), R(practice.filter(t=>t.nEntries===1)),50000),4));
console.log(st(live.filter(t=>t.nEntries>=2),     "live multi-entry"));
console.log(st(practice.filter(t=>t.nEntries>=2), "prac multi-entry"));
console.log("perm p =", f(permP(R(live.filter(t=>t.nEntries>=2)), R(practice.filter(t=>t.nEntries>=2)),50000),4));

console.log("\n=== 5.7 RISK-RATIO OUTLIERS in live ===");
LV.filter(t=>t.riskRatio>2).sort((a,b)=>b.riskRatio-a.riskRatio).forEach(t=>
  console.log(`  ${t.date} ${t.sym.padEnd(6)} ratio=${f(t.riskRatio)} initRisk=$${f(t.initRisk)} maxRisk=$${f(t.maxRisk)} nEnt=${t.nEntries} R=${f(t.pnlR,2)} stopRaises=${t.stopRaises}`));
console.log("  live P(>2x) by half of month:");
const half = LV.filter(t=>!isNaN(t.riskRatio));
const h1=half.filter(t=>t.date<"2026-08-13"), h2=half.filter(t=>t.date>="2026-08-13");
console.log(`   first half n=${h1.length} >2x=${h1.filter(t=>t.riskRatio>2).length}  second half n=${h2.length} >2x=${h2.filter(t=>t.riskRatio>2).length}`);

console.log("\n=== 5.8 SEQUENCE: did live improve WITHIN the month? (drift check) ===");
const ld = dayR(live);
const firstHalf = ld.slice(0,10), secondHalf = ld.slice(10);
console.log(`first 10 sessions: sumR=${f(sum(firstHalf.map(d=>d.r)),1)}  last 9: sumR=${f(sum(secondHalf.map(d=>d.r)),1)}`);
console.log(st(live.filter(t=>t.date<="2026-08-11"),"live first half"));
console.log(st(live.filter(t=>t.date>"2026-08-11"),"live second half"));
console.log("perm p =", f(permP(R(live.filter(t=>t.date<="2026-08-11")), R(live.filter(t=>t.date>"2026-08-11")),20000),4));
