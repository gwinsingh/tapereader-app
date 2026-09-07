const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const live = enrichAll(L.live).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));
const prac = enrichAll(L.practice).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));

console.log("=== does the sheet `Stop` column now equal the measured Initial Stop? ===");
[["live",live],["prac",prac]].forEach(([n,T])=>{
  const w=T.filter(t=>!isNaN(t.stop)&&!isNaN(t.initStop));
  const m=w.filter(t=>Math.abs(t.stop-t.initStop)/Math.max(t.initStop,1e-9)<0.001).length;
  console.log(` ${n}: ${m}/${w.length} match to 0.1%`);
});

console.log("\n=== BUILD: stop-aware, full-size MFE  (Farthest Price is stop-truncated) ===");
function add(T){ T.forEach(t=>{
  t.saPeak$ = (!isNaN(t.far)&&!isNaN(t.totSh)) ? t.totSh*(t.far-t.avgEnt) : NaN;
  t.saMFE_R = t.saPeak$/t.initRisk;                       // stop-aware, full-size, still to 16:00
}); return T.filter(t=>!isNaN(t.saMFE_R)); }
const lS=add(live), pS=add(prac);

let viol = lS.filter(t=>t.pnlR>t.saMFE_R+0.05);
console.log(`live n=${lS.length}  bound violations (realised > stop-aware MFE): ${viol.length}`);
viol.slice(0,6).forEach(t=>console.log(`   ${t.date} ${t.sym} realised=${f(t.pnlR)} saMFE=${f(t.saMFE_R)} posMFE=${f(t.posMFE)} nE=${t.nEntries} (size grew after the farthest price)`));

function bench(T,nm){
  console.log(`\n--- ${nm} n=${T.length} : the capture number under four benchmarks ---`);
  const sR=sum(R(T));
  const rows=[["posMFE (day-long, full size, ignores stop & exit)","posMFE"],
              ["stop-aware full-size MFE (truncates at initial stop)","saMFE_R"],
              ["first-lot stop-aware (old Max R Before Stop)","maxR"],
              ["provable in-window LOWER bound (his own stops/fills)","mfeLB_R"]];
  rows.forEach(([lab,k])=>{ const w=T.filter(t=>!isNaN(t[k]));
    console.log(`  ${lab.padEnd(52)} sumBench=${f(sum(w.map(t=>t[k])),1).padStart(7)}  capture=${f(100*sum(R(w))/sum(w.map(t=>t[k])),1).padStart(6)}%`);});
  [2,2.5,3].forEach(tg=>{
    const a=T.filter(t=>t.posMFE>=tg), b=T.filter(t=>t.saMFE_R>=tg);
    const capA=mean(a.map(t=>Math.min(t.pnlR,tg)/tg)), capB=mean(b.map(t=>Math.min(t.pnlR,tg)/tg));
    console.log(`  target ${tg}R  reach: posMFE ${a.length} (${f(100*a.length/T.length,0)}%) cap=${f(100*capA,0)}% leak=${f(sum(a.map(t=>tg-Math.min(t.pnlR,tg))),1)}R`+
      `   |  stop-aware ${b.length} (${f(100*b.length/T.length,0)}%) cap=${f(100*capB,0)}% leak=${f(sum(b.map(t=>tg-Math.min(t.pnlR,tg))),1)}R`);
  });
}
bench(lS,"LIVE"); bench(pS,"PRACTICE");

console.log("\n=== among trades the market genuinely offered >=2.5R (stop-aware), what did he do? ===");
[["LIVE",lS],["PRACTICE",pS]].forEach(([nm,T])=>{
  const g=T.filter(t=>t.saMFE_R>=2.5);
  console.log(` ${nm}: ${st(g,"offered>=2.5R")}`);
  console.log(`    of those, exited >=2.5R: ${g.filter(t=>t.pnlR>=2.5).length}  |  exited at a LOSS: ${g.filter(t=>t.pnlR<0).length}  | median realised=${f(med(R(g)))}R`);
  const h=T.filter(t=>t.saMFE_R<2.5); console.log(` ${st(h,"    offered<2.5R")}`);
});
