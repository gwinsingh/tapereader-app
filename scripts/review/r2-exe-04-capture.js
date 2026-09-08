const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const live = enrichAll(L.live).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));
const prac = enrichAll(L.practice).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));

function capture(T,nm){
  console.log(`\n########## ${nm} (n=${T.length}) ##########`);
  const sR=sum(R(T)), sM=sum(T.map(t=>t.posMFE));
  console.log(`A. aggregate capture of peak  = sumRealisedR/sumPosMFE = ${f(sR,1)}/${f(sM,1)} = ${f(100*sR/sM,1)}%`);
  const dollarsRe=sum(T.map(t=>t.pnl)), dollarsPk=sum(T.map(t=>t.peak));
  console.log(`   in $:  ${f(dollarsRe)}/${f(dollarsPk)} = ${f(100*dollarsRe/dollarsPk,1)}%`);
  const cp=T.map(t=>t.capturePct).filter(x=>!isNaN(x));
  console.log(`   sheet Capture % : mean=${f(100*mean(cp),1)}%  median=${f(100*med(cp),1)}%  (mean is destroyed by -40x outliers)`);
  console.log(`   share of trades with Capture% > 0: ${f(100*cp.filter(x=>x>0).length/cp.length,0)}%`);

  [2,2.5,3].forEach(tg=>{
    const reach=T.filter(t=>t.posMFE>=tg);
    const cap = reach.map(t=>Math.min(t.pnlR,tg)/tg);
    const leak = sum(reach.map(t=>tg-Math.min(t.pnlR,tg)));
    console.log(`B. target ${tg}R vs INITIAL risk (posMFE reach test): reached ${reach.length}/${T.length} (${f(100*reach.length/T.length,0)}%)`+
      `  targetCapture=${f(100*mean(cap),1)}%  R-left=${f(leak,1)}  hitTarget=${reach.filter(t=>t.pnlR>=tg).length}`);
  });
  // fair benchmarks
  const wLB=T.filter(t=>!isNaN(t.mfeLB_R));
  console.log(`C. FAIR LOWER BOUND (in-window, provable from his own stop/exit fills), n=${wLB.length}`);
  console.log(`   sum mfeLB_R=${f(sum(wLB.map(t=>t.mfeLB_R)),1)}  sumRealised=${f(sum(R(wLB)),1)}  capture=${f(100*sum(R(wLB))/sum(wLB.map(t=>t.mfeLB_R)),1)}%`);
  console.log(`   median mfeLB_R=${f(med(wLB.map(t=>t.mfeLB_R)))}  vs median posMFE=${f(med(wLB.map(t=>t.posMFE)))}  ratio=${f(med(wLB.map(t=>t.posMFE))/Math.max(med(wLB.map(t=>t.mfeLB_R)),1e-9),1)}x`);
  // stop-aware, single-entry only (maxR is legit there: first lot == whole position)
  const se=T.filter(t=>t.nEntries===1&&!isNaN(t.maxR));
  console.log(`D. STOP-AWARE (single-entry only, maxR legit), n=${se.length}`);
  console.log(`   sum maxR=${f(sum(se.map(t=>t.maxR)),1)}  sumRealised=${f(sum(R(se)),1)}  capture=${f(100*sum(R(se))/sum(se.map(t=>t.maxR)),1)}%`);
  console.log(`   same trades vs posMFE: sum posMFE=${f(sum(se.map(t=>t.posMFE)),1)}  capture=${f(100*sum(R(se))/sum(se.map(t=>t.posMFE)),1)}%`);
  const tg=2.5, rA=se.filter(t=>t.maxR>=tg), rB=se.filter(t=>t.posMFE>=tg);
  console.log(`   2.5R reach test disagreement: stop-aware says ${rA.length}/${se.length}, posMFE says ${rB.length}/${se.length}`);
  // exclude stopped-out (posMFE definitionally unreachable past the stop-out)
  const ns=T.filter(t=>t.stoppedOut!=="Y");
  console.log(`E. excluding stopped-out trades, n=${ns.length}: capture=${f(100*sum(R(ns))/sum(ns.map(t=>t.posMFE)),1)}%`);
}
capture(live,"LIVE"); capture(prac,"PRACTICE");

console.log("\n########## HOW UNREACHABLE IS posMFE? ##########");
console.log("posMFE / provable-in-window LB, live, by decile of hold time:");
const w=live.filter(t=>isFinite(t.mfeLB_R)&&t.mfeLB_R>0.01).sort((a,b)=>a.dur-b.dur);
[[0,2],[2,5],[5,15],[15,1e9]].forEach(([lo,hi])=>{
  const g=w.filter(t=>t.dur>=lo&&t.dur<hi); if(!g.length)return;
  console.log(`  dur ${lo}-${hi===1e9?"inf":hi}min n=${String(g.length).padStart(3)}  med posMFE=${f(med(g.map(t=>t.posMFE))).padStart(6)}  med inWinLB=${f(med(g.map(t=>t.mfeLB_R))).padStart(6)}  inflation=${f(med(g.map(t=>t.posMFE))/med(g.map(t=>t.mfeLB_R)),1)}x`);
});
console.log("\nWorst offenders — posMFE credits price action long after he was flat:");
[...live].filter(t=>t.dur<3).sort((a,b)=>b.posMFE-a.posMFE).slice(0,8).forEach(t=>
  console.log(`  ${t.date} ${t.sym.padEnd(5)} dur=${f(t.dur,1).padStart(4)}m realised=${f(t.pnlR).padStart(5)}R posMFE=${f(t.posMFE).padStart(5)}R inWinLB=${f(t.mfeLB_R).padStart(5)}R stopAware(maxR)=${f(t.maxR)}`));
