const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const E=T=>{const A=enrichAll(T).filter(t=>t.ok&&!isNaN(t.pnlR)&&!isNaN(t.initRisk));
  A.forEach(t=>{ t.saMFE_R=(!isNaN(t.far))?t.totSh*(t.far-t.avgEnt)/t.initRisk:NaN;
    t.stopHW = isNaN(t.maxStopInTrade)?NaN:(t.maxStopInTrade-t.avgEnt)/((t.avgEnt-t.initStop)||1e-9); // stop high-water in R vs entry
  }); return A;};
const live=E(L.live), prac=E(L.practice);

console.log("=== 1. DOES HE EVER TRAIL TO BREAKEVEN? (stop high-water vs avg entry, in R) ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.stopHW));
  console.log(` ${nm} n=${w.length}: stop reached >= entry(0R): ${w.filter(t=>t.stopHW>=0).length}   >= -0.25R: ${w.filter(t=>t.stopHW>=-0.25).length}   >= -0.5R: ${w.filter(t=>t.stopHW>=-0.5).length}`);
  console.log(`      median stop high-water = ${f(med(w.map(t=>t.stopHW)))}R below entry;  p90=${f([...w.map(t=>t.stopHW)].sort((a,b)=>a-b)[Math.floor(0.9*w.length)])}R`);
  console.log(`      median # stop raises=${f(med(w.map(t=>t.stopRaises)),0)}  trades with >=1 raise: ${w.filter(t=>t.stopRaises>=1).length}/${w.length}`);
  // among trades that DID reach >=2.5R stop-aware
  const g=w.filter(t=>t.saMFE_R>=2.5);
  console.log(`      among the ${g.length} trades that reached >=2.5R: stop ever >= entry: ${g.filter(t=>t.stopHW>=0).length};  median stop HW=${f(med(g.map(t=>t.stopHW)))}R`);
});

console.log("\n=== 2. DOES HE HONOUR HIS OWN STOP? (mae is over the ACTUAL holding window) ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.mae));
  const breach=w.filter(t=>t.mae<=-1.05);
  console.log(` ${nm} n=${w.length}: price traded BEYOND the initial stop while still holding: ${breach.length} (${f(100*breach.length/w.length,0)}%)`);
  console.log(`    of those breaches, realised R: mean=${f(mean(R(breach)))}  median=${f(med(R(breach)))}  worse than -1R: ${breach.filter(t=>t.pnlR<-1.05).length}`);
  console.log(`    ${st(breach,"    breached")}`);
  console.log(`    ${st(w.filter(t=>t.mae>-1.05),"    never breached")}`);
  console.log(`    'Stopped Out?'=Y count=${T.filter(t=>t.stoppedOut==="Y").length}  vs mae-breach count=${breach.length}`);
  console.log(`    all-loss realised R distribution: min=${f(Math.min(...R(w)))}  #worse than -1.2R: ${w.filter(t=>t.pnlR<-1.2).length}`);
});

console.log("\n=== 3. STOP-LEVEL COUNTERFACTUALS on the REAL ladder (live) ===");
console.log("    valid only for stops TIGHTER than his actual (a wider stop's path is unknowable)");
const w=live.filter(t=>!isNaN(t.mae));
console.log(`    ACTUAL                       n=${w.length}  sumR=${f(sum(R(w)),1)}  expR=${f(mean(R(w)))} CI=[${bootCI(R(w)).map(x=>f(x)).join(",")}]  win%=${f(100*w.filter(t=>t.pnl>0).length/w.length,0)}`);
[0.4,0.5,0.6,0.75,0.9,1.0].forEach(x=>{
  const sim=w.map(t=> t.mae<=-x ? -x : t.pnlR );
  console.log(`    mechanical stop at -${f(x,2)}R      n=${w.length}  sumR=${f(sum(sim),1).padStart(6)}  expR=${f(mean(sim))} CI=[${bootCI(sim).map(v=>f(v)).join(",")}]  triggered=${w.filter(t=>t.mae<=-x).length}  p vs actual=${f(permP(R(w),sim),3)}`);
});
console.log("\n    same on PRACTICE (out-of-sample check):");
const wp=prac.filter(t=>!isNaN(t.mae));
console.log(`    ACTUAL                       n=${wp.length}  sumR=${f(sum(R(wp)),1)}  expR=${f(mean(R(wp)))}`);
[0.4,0.5,0.6,0.75,0.9,1.0].forEach(x=>{
  const sim=wp.map(t=> t.mae<=-x ? -x : t.pnlR );
  console.log(`    mechanical stop at -${f(x,2)}R      sumR=${f(sum(sim),1).padStart(6)}  expR=${f(mean(sim))} CI=[${bootCI(sim).map(v=>f(v)).join(",")}]  triggered=${wp.filter(t=>t.mae<=-x).length}`);
});

console.log("\n=== 4. DISCRETIONARY LOSS-CUTTING vs A MECHANICAL -1R STOP ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const l=T.filter(t=>t.pnlR<0&&!isNaN(t.mae));
  console.log(` ${nm} losers n=${l.length}: mean realised=${f(mean(R(l)))}R  vs full-stop -1R would be ${f(mean(l.map(t=>t.mae<=-1?-1:t.pnlR)))}R`);
  console.log(`    losers cut BEFORE -1R (realised > -0.9R): ${l.filter(t=>t.pnlR>-0.9).length}/${l.length}; mean of those=${f(mean(R(l.filter(t=>t.pnlR>-0.9))))}R`);
  // did the early-cut losers then recover? use stop-aware MFE
  const early=l.filter(t=>t.pnlR>-0.9&&!isNaN(t.saMFE_R));
  console.log(`    of those early cuts, stop-aware MFE later reached >=1R on ${early.filter(t=>t.saMFE_R>=1).length}/${early.length}, >=2.5R on ${early.filter(t=>t.saMFE_R>=2.5).length}`);
});

console.log("\n=== 5. WHAT DOES A STOP RAISE DO? (selection-confounded — control on stop-aware MFE) ===");
[["LIVE",live]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.stopRaises));
  [[0,0],[1,1],[2,2],[3,99]].forEach(([lo,hi])=>{ const g=w.filter(t=>t.stopRaises>=lo&&t.stopRaises<=hi);
    console.log(`  ${st(g,`raises ${lo}${hi>lo?"+":""}`)}  medSaMFE=${f(med(g.map(t=>t.saMFE_R).filter(x=>!isNaN(x))))} medDur=${f(med(g.map(t=>t.dur)),1)}m`);});
  console.log("  --- within the OPPORTUNITY-MATCHED subset (stop-aware MFE >= 2.5R) ---");
  const g=w.filter(t=>t.saMFE_R>=2.5);
  const a=g.filter(t=>t.stopRaises>=2), b=g.filter(t=>t.stopRaises<2);
  console.log(`  ${st(a,"   raises>=2 | offered>=2.5R")}`);
  console.log(`  ${st(b,"   raises<2  | offered>=2.5R")}`);
  console.log(`   p=${f(permP(R(a),R(b)),3)}`);
});
