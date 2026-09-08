const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const E=T=>{const A=enrichAll(T).filter(t=>t.ok&&!isNaN(t.pnlR)&&!isNaN(t.initRisk));
  A.forEach(t=>{ t.saMFE_R=(!isNaN(t.far))?t.totSh*(t.far-t.avgEnt)/t.initRisk:NaN;
    t.rLastMult = t.pnl/t.rDollarLast;                        // realised, in units of HIS last-entry R
    t.tgtPx = t.lastEntP + 2.5*t.rPerShLast;                  // his stated target price
    t.offeredSA = t.far >= t.tgtPx;                           // stop-aware reach
    t.offeredDay = t.maxPostEntryPx >= t.tgtPx;               // day-long reach
    t.hit = t.ex >= t.tgtPx;
  }); return A;};
const live=E(L.live), prac=E(L.practice);

console.log("=== reconstruction sanity: last-entry R vs initial R ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.rDollarLast)&&t.rDollarLast>0);
  const se=w.filter(t=>t.nEntries===1), me=w.filter(t=>t.nEntries>1);
  const dev = se.filter(t=>Math.abs(t.rDollarLast-t.initRisk)/t.initRisk<0.02).length;
  console.log(` ${nm} n=${w.length}: single-entry rows where R_last==initial R (must be ~all): ${dev}/${se.length}`);
  console.log(`   multi-entry n=${me.length}: median R_last=$${f(med(me.map(t=>t.rDollarLast)))} vs median initial R=$${f(med(me.map(t=>t.initRisk)))}  ratio=${f(med(me.map(t=>t.rDollarLast/t.initRisk)),2)}x`);
  console.log(`   => on a pyramid his own 2.5R target is ${f(med(me.map(t=>t.rDollarLast/t.initRisk)),2)}x LARGER in dollars than 2.5x initial risk`);
});

console.log("\n=== HIS OWN 2.5R TARGET — hit / overshoot / undershoot (live) ===");
function tgt(T,nm){
  const w=T.filter(t=>!isNaN(t.rLastMult)&&isFinite(t.rLastMult)&&t.rPerShLast>0);
  console.log(`\n ${nm} n=${w.length}`);
  const hit=w.filter(t=>t.rLastMult>=2.5), near=w.filter(t=>t.rLastMult>=2.0&&t.rLastMult<2.5);
  console.log(`   realised >= 2.5 R_last (his target MET): ${hit.length} (${f(100*hit.length/w.length,0)}%)`);
  console.log(`   realised in [2.0,2.5)  (just short):     ${near.length}`);
  console.log(`   realised < 0           (loss):           ${w.filter(t=>t.rLastMult<0).length} (${f(100*w.filter(t=>t.rLastMult<0).length/w.length,0)}%)`);
  console.log(`   median realised in R_last units = ${f(med(w.map(t=>t.rLastMult)))}   mean=${f(mean(w.map(t=>t.rLastMult)))}`);
  const offSA=w.filter(t=>t.offeredSA), offD=w.filter(t=>t.offeredDay);
  console.log(`   market OFFERED the target (stop-aware price path): ${offSA.length}/${w.length} (${f(100*offSA.length/w.length,0)}%)   [day-long: ${offD.length} (${f(100*offD.length/w.length,0)}%)]`);
  if(offSA.length){
    console.log(`   of the ${offSA.length} offered: he TOOK >=2.5R_last on ${offSA.filter(t=>t.rLastMult>=2.5).length}, undershot on ${offSA.filter(t=>t.rLastMult<2.5&&t.rLastMult>0).length}, turned it into a LOSS on ${offSA.filter(t=>t.rLastMult<0).length}`);
    console.log(`   ${st(offSA,"   offered his target")}`);
    console.log(`   median capture of his own target among offered = ${f(100*med(offSA.map(t=>Math.min(t.rLastMult,2.5)/2.5)),0)}%`);
    console.log(`   R_last left on the table vs his own target = ${f(sum(offSA.map(t=>2.5-Math.min(t.rLastMult,2.5))),1)} R_last`);
  }
  console.log(`   ${st(w.filter(t=>!t.offeredSA),"   NOT offered")}`);
  const ov=w.filter(t=>t.rLastMult>=2.5);
  if(ov.length) console.log(`   when he DOES reach the target he holds to median ${f(med(ov.map(t=>t.rLastMult)))} R_last (overshoot ${f(med(ov.map(t=>t.rLastMult))-2.5,2)})`);
  // single vs multi
  console.log(`   single-entry: target met ${w.filter(t=>t.nEntries===1&&t.rLastMult>=2.5).length}/${w.filter(t=>t.nEntries===1).length}   multi-entry: ${w.filter(t=>t.nEntries>1&&t.rLastMult>=2.5).length}/${w.filter(t=>t.nEntries>1).length}`);
}
tgt(live,"LIVE"); tgt(prac,"PRACTICE");

console.log("\n=== INITIAL-risk framing vs HIS framing — how much does the choice change the verdict? ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>isFinite(t.rLastMult)&&t.rPerShLast>0);
  console.log(` ${nm}: "hit 2.5R" counted against INITIAL risk = ${w.filter(t=>t.pnlR>=2.5).length}; against HIS last-entry risk = ${w.filter(t=>t.rLastMult>=2.5).length}`);
});

console.log("\n=== H7 within opportunity-matched (does RightTheory carry info beyond outcome?) ===");
const g=live.filter(t=>t.saMFE_R>=2.5);
console.log(st(g.filter(t=>t.right==="Yes"),"Yes | offered>=2.5R")); console.log(st(g.filter(t=>t.right==="No"),"No  | offered>=2.5R"));
console.log("p=",f(permP(R(g.filter(t=>t.right==="Yes")),R(g.filter(t=>t.right==="No"))),4));
const g2=live.filter(t=>t.saMFE_R<1);
console.log(st(g2.filter(t=>t.right==="Yes"),"Yes | offered<1R")); console.log(st(g2.filter(t=>t.right==="No"),"No  | offered<1R"));
