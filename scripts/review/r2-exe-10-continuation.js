const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const E=T=>{const A=enrichAll(T).filter(t=>t.ok&&!isNaN(t.pnlR)&&!isNaN(t.far));
  A.forEach(t=>t.saMFE_R=t.totSh*(t.far-t.avgEnt)/t.initRisk); return A;};
const live=E(L.live), prac=E(L.practice);
console.log("=== conditional continuation: P(reach X+0.5R | already reached X), stop-aware full-size MFE ===");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  console.log(` ${nm} n=${T.length}`);
  [1,1.5,2,2.5,3,3.5,4,5].forEach(x=>{ const at=T.filter(t=>t.saMFE_R>=x), nx=at.filter(t=>t.saMFE_R>=x+0.5);
    console.log(`   reached ${f(x,1)}R: ${String(at.length).padStart(3)}  -> also reached ${f(x+0.5,1)}R: ${String(nx.length).padStart(3)} (${at.length?f(100*nx.length/at.length,0):"--"}%)`);});
});
console.log("\n=== once he is in a trade that reaches 2.5R, what does he actually realise? ===");
const g=live.filter(t=>t.saMFE_R>=2.5);
console.log(" realised R distribution:", R(g).sort((a,b)=>a-b).map(x=>f(x,1)).join(" "));
console.log(" med=",f(med(R(g))), " these 25 trades' sumR=",f(sum(R(g)),1), " while the tape offered sum=",f(sum(g.map(t=>t.saMFE_R)),1),"R");
