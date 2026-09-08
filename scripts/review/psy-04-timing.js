const L = require("./lib.js");
const {f,st,R,sum,mean,med,bootCI,permP,byDay,days} = L;
const T935=9*3600+35*60, T945=9*3600+45*60, T1000=10*3600, T1030=10*3600+30*60;
const BK=[["pre-9:35",0,T935],["9:35-9:45",T935,T945],["9:45-10:00",T945,T1000],
          ["10:00-10:30",T1000,T1030],["10:30+",T1030,1e9]];
function timing(TT,name){
  console.log(`\n===== ${name} entry-time buckets =====`);
  BK.forEach(([lab,lo,hi])=>{ const a=TT.filter(t=>t.t>=lo&&t.t<hi); if(a.length) console.log(st(a,lab)); });
  const pre=TT.filter(t=>t.t<T935), post=TT.filter(t=>t.t>=T935);
  console.log(st(pre,"PRE-9:35 (all)")); console.log(st(post,"9:35+ (all)"));
  console.log(`  share pre-9:35 = ${f(pre.length/TT.length*100,1)}%   permP=${f(permP(R(pre),R(post)),3)}`);
  // even finer inside the OR
  console.log("  --- inside the OR, finer ---");
  [["9:30-9:31",0,9*3600+31*60],["9:31-9:33",9*3600+31*60,9*3600+33*60],["9:33-9:35",9*3600+33*60,T935]]
    .forEach(([lab,lo,hi])=>{const a=TT.filter(t=>t.t>=lo&&t.t<hi); if(a.length)console.log("  "+st(a,lab));});
  // MFE/MAE by bucket (entry quality, not exit)
  console.log("  --- MFE / MAE / win% by bucket ---");
  BK.forEach(([lab,lo,hi])=>{const a=TT.filter(t=>t.t>=lo&&t.t<hi); if(!a.length)return;
    console.log(`  ${lab.padEnd(12)} n=${String(a.length).padStart(3)} medMFE=${f(med(a.map(t=>t.maxR)))} meanMFE=${f(mean(a.map(t=>t.maxR).filter(x=>!isNaN(x))))} medMAE=${f(med(a.map(t=>t.mae)))} MFE>=2R=${f(a.filter(t=>t.maxR>=2).length/a.length*100,0)}% medDur=${f(med(a.map(t=>t.dur)))}`);});
}
timing(L.live,"LIVE"); timing(L.practice,"PRACTICE");

console.log("\n===== pre-9:35 by session (live) =====");
const D=byDay(L.live),DK=days(L.live);
DK.forEach(k=>{const a=D[k];const p=a.filter(t=>t.t<T935);
  console.log(`${k} n=${a.length} pre935=${p.length} (${f(p.length/a.length*100,0)}%) dayR=${f(sum(R(a)),1)} preR=${f(sum(R(p)),1)} postR=${f(sum(R(a.filter(t=>t.t>=T935))),1)}`);});

// day-clustered permutation for pre vs post
function dayPermSplit(TT, pred, iters=20000){
  const d=byDay(TT), ks=days(TT);
  const perDay = ks.map(k=>({A:R(d[k].filter(pred)), B:R(d[k].filter(t=>!pred(t)))}));
  const mt=g=>{let sa=0,na=0,sb=0,nb=0;g.forEach(x=>{sa+=sum(x.A);na+=x.A.length;sb+=sum(x.B);nb+=x.B.length;});
    return (na&&nb)?(sa/na-sb/nb):NaN;};
  const obs=Math.abs(mt(perDay)); let c=0;
  for(let i=0;i<iters;i++){ const g=perDay.map(x=>{ // shuffle labels within day
      const all=[...x.A,...x.B]; for(let j=all.length-1;j>0;j--){const kk=(Math.random()*(j+1))|0;[all[j],all[kk]]=[all[kk],all[j]];}
      return {A:all.slice(0,x.A.length),B:all.slice(x.A.length)};});
    if(Math.abs(mt(g))>=obs)c++;}
  return c/iters;
}
console.log("\nLIVE pre-9:35 vs 9:35+ WITHIN-DAY permutation p = "+f(dayPermSplit(L.live,t=>t.t<T935),3));
console.log("PRACTICE within-day permutation p = "+f(dayPermSplit(L.practice,t=>t.t<T935),3));

console.log("\n===== DAY OF WEEK =====");
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function dow(TT,name){
  console.log(`-- ${name} --`);
  const g={}; TT.forEach(t=>{const d=new Date(t.date+"T12:00:00Z").getUTCDay(); (g[d]||=[]).push(t);});
  [1,2,3,4,5].forEach(d=>{ if(g[d]) { const sess=new Set(g[d].map(t=>t.date)).size;
    console.log(st(g[d],`${DOW[d]} (${sess} sess)`)); }});
  const fri=g[5]||[], nonfri=[1,2,3,4].flatMap(d=>g[d]||[]);
  console.log(`  Fri vs rest permP=${f(permP(R(fri),R(nonfri)),3)}  FriSumR=${f(sum(R(fri)),1)}`);
}
dow(L.live,"LIVE"); dow(L.practice,"PRACTICE");
