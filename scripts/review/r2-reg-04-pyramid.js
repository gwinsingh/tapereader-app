// TRACK 4 — THE PYRAMID. Did his add behaviour change between books?
// Starter-only counterfactual isolates the MECHANISM he says is his edge.
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, bootCI, permP, byDay, dayR } = L;

const parseLad = s => (s||"").split("|").map(p=>p.trim()).filter(Boolean).map(p=>{
  const m = p.match(/(\d+):(\d+):(\d+)@([\d.]+)x([\d.]+)/);
  return m ? { t:+m[1]*3600+ +m[2]*60+ +m[3], px:+m[4], sh:+m[5] } : null;
}).filter(Boolean);

function enrich(T){ return T.map(t=>{
  const E = parseLad(t.entryLadder), X = parseLad(t.exitLadder);
  const totSh = sum(E.map(e=>e.sh));
  const avgEx = X.length ? sum(X.map(x=>x.px*x.sh))/sum(X.map(x=>x.sh)) : t.ex;
  const sign = t.side==="Short" ? -1 : 1;
  const first = E[0];
  // starter-only counterfactual: first lot, same average exit price
  const starterPnl  = first ? (avgEx - first.px)*first.sh*sign : NaN;
  const starterPnl1 = (first && X.length) ? (X[0].px - first.px)*first.sh*sign : NaN; // exit at FIRST exit
  const starterR  = t.initRisk>0 ? starterPnl/t.initRisk : NaN;
  const starterR1 = t.initRisk>0 ? starterPnl1/t.initRisk : NaN;
  const addPnl = t.pnl - starterPnl;
  // add characteristics
  const addSh = totSh - (first?first.sh:0);
  const sizeMult = first && first.sh ? totSh/first.sh : NaN;
  // R-progress at the moment of each add, measured on initial risk
  const addAtR = E.slice(1).map(e => t.initRisk>0 && first ? (e.px-first.px)*first.sh*sign/t.initRisk : NaN);
  const firstAddAtR = addAtR.length?addAtR[0]:NaN;
  const addLagSec = E.length>1 && first ? E[1].t - first.t : NaN;
  return {...t, E, X, totSh, avgEx, first, starterPnl, starterR, starterR1, addPnl, addSh, sizeMult, addAtR, firstAddAtR, addLagSec,
    riskRatio: t.initRisk>0 ? t.maxRisk/t.initRisk : NaN };
});}
const LV = enrich(live.filter(t=>t.entryLadder)), PR = enrich(practice.filter(t=>t.entryLadder));
console.log(`parsed ladders: live ${LV.length}/${live.length}  prac ${PR.length}/${practice.length}`);

console.log("\n=== 4.1 ADD RATE & LADDER SHAPE ===");
for (const [nm,T] of [["live",LV],["prac",PR]]) {
  const multi = T.filter(t=>t.nEntries>=2);
  const c={}; T.forEach(t=>c[t.nEntries]=(c[t.nEntries]||0)+1);
  console.log(`${nm}: n=${T.length}  add rate = ${multi.length}/${T.length} = ${f(multi.length/T.length*100,0)}%   #Entries dist: ${Object.entries(c).sort((a,b)=>a[0]-b[0]).map(([k,v])=>k+":"+v).join(" ")}`);
  const sm = multi.map(t=>t.sizeMult).filter(x=>!isNaN(x));
  console.log(`     among adders: sizeMult med=${f(med(sm))} mean=${f(mean(sm))} max=${f(Math.max(...sm))}  | median #entries=${f(med(multi.map(t=>t.nEntries)),1)}`);
  const lag = multi.map(t=>t.addLagSec).filter(x=>!isNaN(x));
  console.log(`     first-add lag: med=${f(med(lag),0)}s mean=${f(mean(lag),0)}s`);
  const aar = multi.map(t=>t.firstAddAtR).filter(x=>!isNaN(x));
  console.log(`     first add taken at R (initial risk) med=${f(med(aar))} mean=${f(mean(aar))}  | adds while UNDERWATER: ${aar.filter(x=>x<0).length}/${aar.length} = ${f(aar.filter(x=>x<0).length/aar.length*100,0)}%`);
  const allAdds = T.flatMap(t=>t.addAtR).filter(x=>!isNaN(x));
  console.log(`     ALL adds (n=${allAdds.length}) at R: med=${f(med(allAdds))}  underwater: ${f(allAdds.filter(x=>x<0).length/allAdds.length*100,0)}%  >=+0.5R: ${f(allAdds.filter(x=>x>=0.5).length/allAdds.length*100,0)}%`);
}
console.log("perm p add rate =", f(permP(LV.map(t=>t.nEntries>=2?1:0), PR.map(t=>t.nEntries>=2?1:0),20000),4));
console.log("perm p sizeMult (adders only) =", f(permP(LV.filter(t=>t.nEntries>=2).map(t=>t.sizeMult).filter(x=>!isNaN(x)), PR.filter(t=>t.nEntries>=2).map(t=>t.sizeMult).filter(x=>!isNaN(x)),20000),4));
console.log("perm p first-add-at-R =", f(permP(LV.filter(t=>t.nEntries>=2).map(t=>t.firstAddAtR).filter(x=>!isNaN(x)), PR.filter(t=>t.nEntries>=2).map(t=>t.firstAddAtR).filter(x=>!isNaN(x)),20000),4));

console.log("\n=== 4.2 THE STARTER-ONLY COUNTERFACTUAL (artifact #11 honest form) ===");
console.log("first lot only, exited at the SAME average exit price. Compare actual vs counterfactual.");
for (const [nm,T] of [["live",LV],["prac",PR]]) {
  const ok = T.filter(t=>!isNaN(t.starterR)&&!isNaN(t.pnlR));
  const act = ok.map(t=>t.pnlR), cf = ok.map(t=>t.starterR);
  console.log(`${nm}: n=${ok.length}`);
  console.log(`   ACTUAL      sumR=${f(sum(act),1).padStart(7)} expR=${f(mean(act)).padStart(6)} $=${f(sum(ok.map(t=>t.pnl))).padStart(8)}`);
  console.log(`   STARTER ONLY sumR=${f(sum(cf),1).padStart(6)} expR=${f(mean(cf)).padStart(6)} $=${f(sum(ok.map(t=>t.starterPnl))).padStart(8)}`);
  console.log(`   PYRAMID LIFT  ${f(sum(act)-sum(cf),1)}R   $${f(sum(ok.map(t=>t.addPnl)))}`);
  const md = ok.filter(t=>t.nEntries>=2);
  const helped = md.filter(t=>t.pnlR>t.starterR).length;
  console.log(`   among adders (n=${md.length}): lift=${f(sum(md.map(t=>t.pnlR-t.starterR)),1)}R $${f(sum(md.map(t=>t.addPnl)))}  helped on ${helped}/${md.length} = ${f(helped/md.length*100,0)}%`);
  const lifts = md.map(t=>t.pnlR-t.starterR);
  console.log(`   lift per adding trade: mean=${f(mean(lifts))}R med=${f(med(lifts))}R  CI=[${bootCI(lifts).map(x=>f(x)).join(", ")}]`);
}
// THE test: is the per-add-trade lift different between books?
const lLift = LV.filter(t=>t.nEntries>=2&&!isNaN(t.starterR)).map(t=>t.pnlR-t.starterR);
const pLift = PR.filter(t=>t.nEntries>=2&&!isNaN(t.starterR)).map(t=>t.pnlR-t.starterR);
console.log(`\nPYRAMID-LIFT COMPARISON  live n=${lLift.length} mean=${f(mean(lLift))}R  prac n=${pLift.length} mean=${f(mean(pLift))}R`);
console.log(`  perm p = ${f(permP(lLift,pLift,50000),4)}`);
console.log(`  live lift CI  [${bootCI(lLift).map(x=>f(x)).join(", ")}]`);
console.log(`  prac lift CI  [${bootCI(pLift).map(x=>f(x)).join(", ")}]`);

console.log("\n=== 4.3 IS THE WHOLE LIVE EDGE THE PYRAMID? ===");
// strip the pyramid from BOTH books and re-run the gap
const lcf = LV.filter(t=>!isNaN(t.starterR)).map(t=>t.starterR);
const pcf = PR.filter(t=>!isNaN(t.starterR)).map(t=>t.starterR);
console.log(`starter-only expR: live ${f(mean(lcf))} (n=${lcf.length}) CI[${bootCI(lcf).map(x=>f(x)).join(", ")}]`);
console.log(`starter-only expR: prac ${f(mean(pcf))} (n=${pcf.length}) CI[${bootCI(pcf).map(x=>f(x)).join(", ")}]`);
console.log(`starter-only gap = ${f((mean(lcf)-mean(pcf))*70,1)}R over 70 trades   perm p = ${f(permP(lcf,pcf,50000),4)}`);
console.log(`ACTUAL       gap = ${f((mean(R(live))-mean(R(practice)))*70,1)}R                perm p = ${f(permP(R(live),R(practice),50000),4)}`);
console.log("-> if the starter-only gap collapses, the entire live advantage IS the pyramid.");

console.log("\n=== 4.4 alt counterfactual: starter exits at FIRST exit (not avg) ===");
for (const [nm,T] of [["live",LV],["prac",PR]]) {
  const ok = T.filter(t=>!isNaN(t.starterR1));
  console.log(`${nm}: starter@firstExit sumR=${f(sum(ok.map(t=>t.starterR1)),1)} expR=${f(mean(ok.map(t=>t.starterR1)))} (n=${ok.length})`);
}

console.log("\n=== 4.5 RISK DISCIPLINE: maxRisk / initRisk ===");
for (const [nm,T] of [["live",LV],["prac",PR]]) {
  const rr = T.map(t=>t.riskRatio).filter(x=>!isNaN(x)&&isFinite(x));
  console.log(`${nm}: n=${rr.length} med=${f(med(rr))} mean=${f(mean(rr))} p75=${f([...rr].sort((a,b)=>a-b)[Math.floor(.75*rr.length)])} p90=${f([...rr].sort((a,b)=>a-b)[Math.floor(.90*rr.length)])} max=${f(Math.max(...rr))}`);
  console.log(`     <=1.0x: ${f(rr.filter(x=>x<=1.001).length/rr.length*100,0)}%  <=1.5x: ${f(rr.filter(x=>x<=1.5).length/rr.length*100,0)}%  >2x: ${f(rr.filter(x=>x>2).length/rr.length*100,0)}%  >3x: ${f(rr.filter(x=>x>3).length/rr.length*100,0)}%`);
}
const lrr = LV.map(t=>t.riskRatio).filter(x=>!isNaN(x)&&isFinite(x));
const prr = PR.map(t=>t.riskRatio).filter(x=>!isNaN(x)&&isFinite(x));
console.log("perm p riskRatio =", f(permP(lrr,prr,50000),4));
console.log("perm p P(riskRatio>2) =", f(permP(lrr.map(x=>x>2?1:0), prr.map(x=>x>2?1:0),20000),4));

console.log("\n=== 4.6 REALISED LOSS TAIL — did discipline show up in the losers? ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const l = R(T).filter(x=>x<0).sort((a,b)=>a-b);
  console.log(`${nm}: n=${l.length} worst=${f(l[0])} p5=${f(l[Math.floor(.05*l.length)])} med=${f(med(l))} | beyond -1R: ${l.filter(x=>x<-1).length} (${f(l.filter(x=>x<-1).length/l.length*100,0)}%) | beyond -1.5R: ${l.filter(x=>x<-1.5).length}`);
}
console.log("perm p P(loss < -1R | loser) =", f(permP(R(live).filter(x=>x<0).map(x=>x<-1?1:0), R(practice).filter(x=>x<0).map(x=>x<-1?1:0),20000),4));

console.log("\n=== 4.7 STOP MANAGEMENT ===");
for (const [nm,T] of [["live",LV],["prac",PR]]) {
  const sr = T.map(t=>t.stopRaises).filter(x=>!isNaN(x));
  const so = T.filter(t=>t.stoppedOut);
  const yes = so.filter(t=>/^y/i.test(t.stoppedOut)).length;
  console.log(`${nm}: stopRaises med=${f(med(sr),1)} mean=${f(mean(sr),1)} | stoppedOut Yes = ${yes}/${so.length} = ${f(yes/so.length*100,0)}%`);
}
console.log("perm p stopRaises =", f(permP(LV.map(t=>t.stopRaises).filter(x=>!isNaN(x)), PR.map(t=>t.stopRaises).filter(x=>!isNaN(x)),20000),4));
