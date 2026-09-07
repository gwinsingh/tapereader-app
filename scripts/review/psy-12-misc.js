const L=require("./lib.js"); const {f,st,R,sum,mean,med,permP,byDay,days}=L;
const D=byDay(L.live),DK=days(L.live);
const T935=9*3600+35*60;
console.log("=== CONCURRENCY (overlapping positions) — artifact #4 aware ===");
let ov=0; DK.forEach(k=>{const a=D[k];a.forEach((t,i)=>{t.overlap = i>0 && t.t < a[i-1].tExit; if(t.overlap)ov++;});});
console.log("overlapping entries:",ov,"/71");
console.log(st(L.live.filter(t=>t.overlap),"entered while pos open"));
console.log(st(L.live.filter(t=>!t.overlap),"entered flat"));
console.log("NOTE: confounded with time-of-day (overlap requires an earlier still-open trade).");

console.log("\n=== entry-to-entry gap since previous trade (clean clock measure) ===");
DK.forEach(k=>{const a=D[k];a.forEach((t,i)=>{t.g2 = i>0 ? (t.t-a[i-1].t)/60 : NaN;});});
[[0,2],[2,5],[5,10],[10,1e9]].forEach(([lo,hi])=>{const a=L.live.filter(t=>t.g2>=lo&&t.g2<hi);
  if(a.length)console.log(st(a,`entry-gap ${lo}-${hi===1e9?"+":hi}min`));});
const fastAfterLoss=L.live.filter(t=>t.g2<3&&t.prevLoss);
DK.forEach(k=>{const a=D[k];a.forEach((t,i)=>{t.prevLoss=i>0&&a[i-1].pnlR<0;});});
console.log(st(L.live.filter(t=>t.g2<3&&t.prevLoss),"<3min after a loss"));
console.log(st(L.live.filter(t=>t.g2>=3&&t.prevLoss),">=3min after a loss"));

console.log("\n=== CAPTURE by entry-time bucket (execution, not entry quality) ===");
const BK=[["pre-9:35",0,T935],["9:35-9:45",T935,9*3600+45*60],["9:45+",9*3600+45*60,1e9]];
BK.forEach(([lab,lo,hi])=>{const a=L.live.filter(t=>t.t>=lo&&t.t<hi&&t.maxR>=2&&!isNaN(t.pnlR));
  if(!a.length){console.log(`  ${lab}: no MFE>=2R trades`);return;}
  const cap=a.map(t=>Math.min(t.pnlR,2)/2);
  console.log(`  ${lab.padEnd(10)} MFE>=2R n=${a.length}  capture=${f(mean(cap)*100,0)}%  realized sumR=${f(sum(R(a)),1)}  MFE sumR=${f(sum(a.map(t=>t.maxR)),1)}`);});

console.log("\n=== H6 formal: <=2 trades/day vs no cap (LIVE) ===");
let capR=0,fullR=0; DK.forEach(k=>{D[k].forEach((t,i)=>{const r=isNaN(t.pnlR)?0:t.pnlR; fullR+=r; if(i<2)capR+=r;});});
console.log(`  cap2 sumR=${f(capR,1)}  no-cap sumR=${f(fullR,1)}  delta=${f(capR-fullR,1)}`);
console.log(st(L.live.filter(t=>t.idxSet===undefined&&false),"")); // noop
const first2=[],rest=[]; DK.forEach(k=>{D[k].forEach((t,i)=>{(i<2?first2:rest).push(t);});});
console.log(st(first2,"trades 1-2 of day"));
console.log(st(rest ,"trades 3+ of day"));
console.log("  permP="+f(permP(R(first2),R(rest)),3));

console.log("\n=== H10 Friday, day-clustered ===");
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const drows=DK.map(k=>({k,d:new Date(k+"T12:00:00Z").getUTCDay(),r:sum(R(D[k])),n:D[k].length}));
const fri=drows.filter(x=>x.d===5), oth=drows.filter(x=>x.d!==5);
console.log(`  Fri sessions=${fri.length} sumR=${f(sum(fri.map(x=>x.r)),1)} meanDayR=${f(mean(fri.map(x=>x.r)))} | other sessions=${oth.length} sumR=${f(sum(oth.map(x=>x.r)),1)} meanDayR=${f(mean(oth.map(x=>x.r)))}`);
fri.forEach(x=>console.log(`    ${x.k} n=${x.n} R=${f(x.r,1)}`));
function dayPerm(A,B,it=20000){const all=[...A,...B];const o=Math.abs(mean(A.map(x=>x.r))-mean(B.map(x=>x.r)));let c=0;
  for(let i=0;i<it;i++){const p=[...all];for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  if(Math.abs(mean(p.slice(0,A.length).map(x=>x.r))-mean(p.slice(A.length).map(x=>x.r)))>=o)c++;}return c/it;}
console.log("  day-level permP = "+f(dayPerm(fri,oth),3));
console.log("  Tuesday (worst live day): sessions=4 sumR="+f(sum(drows.filter(x=>x.d===2).map(x=>x.r)),1)+"  practice Tue sumR=-3.6 -> no replication");

console.log("\n=== his own claim check: 'careful with trades after 2-3 losses' (his 8/07 note) ===");
DK.forEach(k=>{const a=D[k];a.forEach((t,i)=>{let l=0;for(let j=0;j<i;j++)if(a[j].pnlR<0)l++;t.priorLosses=l;});});
[0,1,2,3].forEach(n=>{const a=n<3?L.live.filter(t=>t.priorLosses===n):L.live.filter(t=>t.priorLosses>=3);
  if(a.length)console.log(st(a,n<3?`${n} prior losses today`:"3+ prior losses today"));});
const PD=byDay(L.practice),PK=days(L.practice);
PK.forEach(k=>{const a=PD[k];a.forEach((t,i)=>{let l=0;for(let j=0;j<i;j++)if(a[j].pnlR<0)l++;t.priorLosses=l;});});
[0,1,2,3].forEach(n=>{const a=n<3?L.practice.filter(t=>t.priorLosses===n):L.practice.filter(t=>t.priorLosses>=3);
  if(a.length)console.log(st(a,n<3?`P ${n} prior losses`:"P 3+ prior losses"));});
const comb=[...L.live,...L.practice];
console.log(st(comb.filter(t=>t.priorLosses>=3),"COMBINED 3+ prior losses"));
console.log(st(comb.filter(t=>t.priorLosses<3),"COMBINED <3 prior losses"));
console.log("permP="+f(permP(R(comb.filter(t=>t.priorLosses>=3)),R(comb.filter(t=>t.priorLosses<3))),3));
