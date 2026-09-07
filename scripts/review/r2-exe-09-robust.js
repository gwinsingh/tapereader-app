const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const E=T=>{const A=enrichAll(T).filter(t=>t.ok&&!isNaN(t.pnlR)&&!isNaN(t.initRisk));
  A.forEach(t=>{ t.saMFE_R=(!isNaN(t.far))?t.totSh*(t.far-t.avgEnt)/t.initRisk:NaN;
    t.rLastMult=t.pnl/t.rDollarLast; t.tgtPx=t.lastEntP+2.5*t.rPerShLast; t.offeredSA=t.far>=t.tgtPx; }); return A;};
const live=E(L.live), prac=E(L.practice);

console.log("=== A. did target capture actually IMPROVE practice -> live? ===");
const lo=live.filter(t=>t.offeredSA&&isFinite(t.rLastMult)), po=prac.filter(t=>t.offeredSA&&isFinite(t.rLastMult));
const capL=lo.map(t=>Math.min(t.rLastMult,2.5)/2.5), capP=po.map(t=>Math.min(t.rLastMult,2.5)/2.5);
console.log(` live n=${lo.length} mean cap=${f(100*mean(capL),0)}% CI=[${bootCI(capL).map(x=>f(100*x,0)).join(",")}]  |  practice n=${po.length} mean cap=${f(100*mean(capP),0)}% CI=[${bootCI(capP).map(x=>f(100*x,0)).join(",")}]  p=${f(permP(capL,capP),3)}`);

console.log("\n=== B. H4 at a lower opportunity threshold (more power) ===");
[1,1.5,2].forEach(th=>{ const m=live.filter(t=>t.saMFE_R>=th), a=m.filter(t=>t.dur>=5), b=m.filter(t=>t.dur<5);
  console.log(` offered>=${th}R: >=5min n=${a.length} expR=${f(mean(R(a)))} [${bootCI(R(a)).map(x=>f(x)).join(",")}] | <5min n=${b.length} expR=${f(mean(R(b)))} [${bootCI(R(b)).map(x=>f(x)).join(",")}]  p=${f(permP(R(a),R(b)),3)}`);});

console.log("\n=== C. SET-AND-FORGET BRACKET counterfactual on the REAL ladder (stop-aware MFE, full size) ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.saMFE_R));
  console.log(` ${nm} n=${w.length}  ACTUAL sumR=${f(sum(R(w)),1)} expR=${f(mean(R(w)))}`);
  [1.5,2,2.5,3,4].forEach(tg=>{ const sim=w.map(t=>t.saMFE_R>=tg?tg:-1);
    console.log(`   bracket -1R/+${tg}R: sumR=${f(sum(sim),1).padStart(7)} expR=${f(mean(sim)).padStart(6)} CI=[${bootCI(sim).map(x=>f(x)).join(",")}] hits=${w.filter(t=>t.saMFE_R>=tg).length}  delta vs actual=${f(sum(R(w))-sum(sim),1)}R  p=${f(permP(R(w),sim),3)}`);});
});

console.log("\n=== D. nEntries (pyramiding) — selection-confounded (artifact #11), opportunity-matched ===");
[["LIVE",live]].forEach(([nm,T])=>{
  const a=T.filter(t=>t.nEntries>1), b=T.filter(t=>t.nEntries===1);
  console.log(" "+st(a,"multi-entry")); console.log(" "+st(b,"single-entry")); console.log(" p=",f(permP(R(a),R(b)),4));
  console.log(`  medSaMFE multi=${f(med(a.map(t=>t.saMFE_R).filter(x=>!isNaN(x))))} single=${f(med(b.map(t=>t.saMFE_R).filter(x=>!isNaN(x))))}  medDur ${f(med(a.map(t=>t.dur)),1)}m vs ${f(med(b.map(t=>t.dur)),1)}m`);
  const g=T.filter(t=>t.saMFE_R>=2.5);
  console.log(" "+st(g.filter(t=>t.nEntries>1),"  multi | offered>=2.5R")); console.log(" "+st(g.filter(t=>t.nEntries===1),"  single| offered>=2.5R"));
  console.log(" p=",f(permP(R(g.filter(t=>t.nEntries>1)),R(g.filter(t=>t.nEntries===1))),4));
});

console.log("\n=== E. robustness: drop the top winner / top day, do the headline splits survive? ===");
const noTop=[...live].sort((a,b)=>b.pnlR-a.pnlR).slice(1);
console.log(" live ex-largest-winner: "+st(noTop,""));
const a2=noTop.filter(t=>t.dur>=5), b2=noTop.filter(t=>t.dur<5);
console.log(" H4 ex-largest: "+st(a2,">=5min")); console.log("               "+st(b2,"<5min")," p=",f(permP(R(a2),R(b2)),4));
const noD=live.filter(t=>t.date!=="2026-08-03"&&t.date!=="2026-08-19"&&t.date!=="2026-08-21");
console.log(" live ex-top-3-days: "+st(noD,""));

console.log("\n=== F. exit timing: where in the session does he exit winners vs losers ===");
const win=live.filter(t=>t.pnlR>0), los=live.filter(t=>t.pnlR<=0);
console.log(` winners n=${win.length} med dur=${f(med(win.map(t=>t.dur)),1)}m  med exit=${new Date(med(win.map(t=>t.tExit))*1000).toISOString().slice(11,19)}`);
console.log(` losers  n=${los.length} med dur=${f(med(los.map(t=>t.dur)),1)}m  med exit=${new Date(med(los.map(t=>t.tExit))*1000).toISOString().slice(11,19)}`);
console.log(` winners stopped out: ${win.filter(t=>t.stoppedOut==="Y").length}/${win.length}  losers stopped out: ${los.filter(t=>t.stoppedOut==="Y").length}/${los.length}`);
console.log(" => the stop ladder never determines a winner's exit; every winning exit is discretionary.");
