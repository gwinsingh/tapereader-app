const L = require("./lib.js");
const {f,st,R,sum,mean,med,bootCI,permP,byDay,days} = L;
const D=byDay(L.live), DK=days(L.live);

// Day-clustered bootstrap + day-level permutation for readiness split
function dayCI(groupsOfDays, iters=5000){ // groupsOfDays: array of arrays of R values per day
  const ms=[];
  for(let i=0;i<iters;i++){ let s=0,n=0;
    for(let j=0;j<groupsOfDays.length;j++){ const g=groupsOfDays[(Math.random()*groupsOfDays.length)|0]; s+=sum(g); n+=g.length; }
    if(n) ms.push(s/n); }
  ms.sort((a,b)=>a-b); return [ms[Math.floor(0.025*iters)], ms[Math.floor(0.975*iters)]];
}
const rows = DK.map(k=>({date:k,trades:D[k],r:sum(R(D[k])),n:D[k].length,
  ready:D[k].map(t=>t.ready).filter(x=>!isNaN(x))[0],
  sleepSc:D[k].map(t=>t.sleepSc).filter(x=>!isNaN(x))[0]}));

console.log("=== READINESS: day-clustered inference ===");
const rdMed=80.5;
const hi=rows.filter(r=>r.ready>=rdMed), lo=rows.filter(r=>r.ready<rdMed);
console.log(`hi-ready sessions=${hi.length} trades=${sum(hi.map(r=>r.n))} sumR=${f(sum(hi.map(r=>r.r)),1)} meanDayR=${f(mean(hi.map(r=>r.r)))}`);
console.log(`lo-ready sessions=${lo.length} trades=${sum(lo.map(r=>r.n))} sumR=${f(sum(lo.map(r=>r.r)),1)} meanDayR=${f(mean(lo.map(r=>r.r)))}`);
console.log("hi trade-expR day-clustered CI:", dayCI(hi.map(r=>R(r.trades))).map(x=>f(x)).join(","));
console.log("lo trade-expR day-clustered CI:", dayCI(lo.map(r=>R(r.trades))).map(x=>f(x)).join(","));
// day-level permutation of the label
function dayPerm(A,B,iters=20000){ const all=[...A,...B]; const obs=Math.abs(mean(A.map(r=>r.r))-mean(B.map(r=>r.r)));
  let c=0; for(let i=0;i<iters;i++){ const p=[...all]; for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
    if(Math.abs(mean(p.slice(0,A.length).map(r=>r.r))-mean(p.slice(A.length).map(r=>r.r)))>=obs)c++;} return c/iters; }
console.log("day-level permP (meanDayR) =", f(dayPerm(hi,lo),3));
// trade-level perm but permuting whole days
function dayPermTrade(A,B,iters=20000){ const all=[...A,...B];
  const mt=g=>{let s=0,n=0;g.forEach(r=>{s+=r.r;n+=r.n;});return s/n;};
  const obs=Math.abs(mt(A)-mt(B)); let c=0;
  for(let i=0;i<iters;i++){const p=[...all];for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
    if(Math.abs(mt(p.slice(0,A.length))-mt(p.slice(A.length)))>=obs)c++;} return c/iters;}
console.log("day-permuted trade-expR permP =", f(dayPermTrade(hi,lo),3));

// Is readiness just a proxy for the big-winner days?
console.log("\nBig winners (pnlR>=3) and their session readiness:");
L.live.filter(t=>t.pnlR>=3).forEach(t=>console.log(`  ${t.date} ${t.sym.padEnd(5)} R=${f(t.pnlR)} ready=${f(t.ready,0)} sleepSc=${f(t.sleepSc,0)} energy=${f(t.energy,0)} tension=${f(t.tension,0)} urge=${t.urge}`));
console.log("\nMedian-R (robust) by readiness split:");
console.log("  hi median trade R =", f(med(hi.flatMap(r=>R(r.trades)))), " lo median =", f(med(lo.flatMap(r=>R(r.trades)))));
console.log("  hi win% =", f(hi.flatMap(r=>r.trades).filter(t=>t.pnl>0).length/sum(hi.map(r=>r.n))*100,0),
            " lo win% =", f(lo.flatMap(r=>r.trades).filter(t=>t.pnl>0).length/sum(lo.map(r=>r.n))*100,0));
// remove the single biggest trade
const hiR=hi.flatMap(r=>R(r.trades)).sort((a,b)=>b-a), loR=lo.flatMap(r=>R(r.trades)).sort((a,b)=>b-a);
console.log("  hi expR ex-top1 =", f(mean(hiR.slice(1))), " lo expR ex-top1 =", f(mean(loR.slice(1))));
console.log("  hi top3 R:", hiR.slice(0,3).map(x=>f(x)).join(","), " lo top3 R:", loR.slice(0,3).map(x=>f(x)).join(","));
