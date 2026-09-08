const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const live = enrichAll(L.live).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));
const prac = enrichAll(L.practice).filter(t=>t.ok&&!isNaN(t.posMFE)&&!isNaN(t.pnlR));
console.log("usable: live",live.length,"practice",prac.length);

const B=[[0,1],[1,2],[2,4],[4,8],[8,1e9]];
const lbl=["posMFE <1R","1-2R","2-4R","4-8R",">=8R"];
function buckets(T,nm){
  console.log(`\n=== ${nm}: what the (day-long, full-size) position was theoretically worth ===`);
  B.forEach(([lo,hi],i)=>{ const g=T.filter(t=>t.posMFE>=lo&&t.posMFE<hi);
    if(!g.length) return console.log(lbl[i].padEnd(12),"n=0");
    console.log(st(g,lbl[i])+`  medPosMFE=${f(med(g.map(t=>t.posMFE)))}  medCap%=${f(100*med(g.map(t=>t.pnlR/t.posMFE)),0)}`);});
  const rs=R(T).sort((a,b)=>b-a);
  console.log(`  total sumR=${f(sum(rs),1)}  top1=${f(rs[0],1)}  top3=${f(sum(rs.slice(0,3)),1)} (${f(100*sum(rs.slice(0,3))/sum(rs),0)}%)  top5=${f(sum(rs.slice(0,5)),1)} (${f(100*sum(rs.slice(0,5))/sum(rs),0)}%)`);
  console.log(`  n needed for 100% of profit: ${(()=>{let s=0,k=0;for(const r of rs){if(s>=sum(rs))break;s+=r;k++;}return k;})()} of ${rs.length}`);
  console.log(`  posMFE distribution: p25=${f(med(T.map(t=>t.posMFE).sort((a,b)=>a-b).slice(0,Math.ceil(T.length/2))))} med=${f(med(T.map(t=>t.posMFE)))} p75=${f(med(T.map(t=>t.posMFE).sort((a,b)=>a-b).slice(Math.floor(T.length/2))))}`);
}
buckets(live,"LIVE"); buckets(prac,"PRACTICE");

console.log("\n=== concentration of the live month ===");
const d=L.dayR(L.live).sort((a,b)=>b.r-a.r);
console.log("best 3 days:", d.slice(0,3).map(x=>`${x.date} ${f(x.r,1)}R`).join("  "));
console.log("worst 3 days:", d.slice(-3).map(x=>`${x.date} ${f(x.r,1)}R`).join("  "));
console.log("sum all days:",f(sum(d.map(x=>x.r)),1),"  sum ex-top3:",f(sum(d.slice(3).map(x=>x.r)),1));
console.log("\n=== live top 6 trades by R ===");
[...live].sort((a,b)=>b.pnlR-a.pnlR).slice(0,6).forEach(t=>
  console.log(`  ${t.date} ${t.sym.padEnd(5)} pnlR=${f(t.pnlR).padStart(5)} posMFE=${f(t.posMFE).padStart(6)} nE=${t.nEntries} nX=${t.nExits} dur=${f(t.dur,1)}m`));
