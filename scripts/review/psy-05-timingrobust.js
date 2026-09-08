const L=require("./lib.js"); const {f,st,R,sum,mean,med,bootCI,permP,byDay,days}=L;
const T935=9*3600+35*60;
const hhmm=s=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
console.log("=== LIVE entry-time distribution (sorted) ===");
console.log(L.live.map(t=>t.entry).sort().join(" "));
console.log("\ncount t<9:35:00 =", L.live.filter(t=>t.t<T935).length, "/71 =", f(L.live.filter(t=>t.t<T935).length/71*100,1)+"%");
console.log("count t<9:35:00 practice =", L.practice.filter(t=>t.t<T935).length, "/248 =", f(L.practice.filter(t=>t.t<T935).length/248*100,1)+"%");
console.log("combined =", f((L.live.filter(t=>t.t<T935).length+L.practice.filter(t=>t.t<T935).length)/319*100,1)+"%");

const pre=L.live.filter(t=>t.t<T935), post=L.live.filter(t=>t.t>=T935);
const preR=R(pre).sort((a,b)=>b-a), postR=R(post).sort((a,b)=>b-a);
console.log("\npre top5 R:", preR.slice(0,5).map(x=>f(x)).join(","), " | post top5 R:", postR.slice(0,5).map(x=>f(x)).join(","));
console.log("pre expR ex-top1="+f(mean(preR.slice(1)))+" ex-top2="+f(mean(preR.slice(2)))+" ex-top3="+f(mean(preR.slice(3)))+" median="+f(med(preR)));
console.log("post expR ex-top1="+f(mean(postR.slice(1)))+" median="+f(med(postR)));
console.log("pre win%="+f(pre.filter(t=>t.pnl>0).length/pre.length*100,0)+" post win%="+f(post.filter(t=>t.pnl>0).length/post.length*100,0));
// win-rate permutation
function permWin(a,b,iters=20000){const A=a.map(t=>t.pnl>0?1:0),B=b.map(t=>t.pnl>0?1:0);
  const obs=Math.abs(mean(A)-mean(B));const pool=[...A,...B];let c=0;
  for(let i=0;i<iters;i++){const p=[...pool];for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
    if(Math.abs(mean(p.slice(0,A.length))-mean(p.slice(A.length)))>=obs)c++;}return c/iters;}
console.log("win-rate permP (pre vs post) = "+f(permWin(pre,post),4));
console.log("MFE>=1R: pre="+f(pre.filter(t=>t.maxR>=1).length/pre.length*100,0)+"% post="+f(post.filter(t=>t.maxR>=1).length/post.length*100,0)+"%");
console.log("MFE>=2R: pre="+f(pre.filter(t=>t.maxR>=2).length/pre.length*100,0)+"% post="+f(post.filter(t=>t.maxR>=2).length/post.length*100,0)+"%");
console.log("MFE=0 (never green): pre="+f(pre.filter(t=>t.maxR===0).length/pre.length*100,0)+"% post="+f(post.filter(t=>t.maxR===0).length/post.length*100,0)+"%");
console.log("stopped out (pnlR<=-0.85): pre="+f(pre.filter(t=>t.pnlR<=-0.85).length/pre.length*100,0)+"% post="+f(post.filter(t=>t.pnlR<=-0.85).length/post.length*100,0)+"%");

// leave-one-session-out on the pre-935 sumR advantage
console.log("\n=== leave-one-session-out: pre-9:35 sumR (live) ===");
const D=byDay(L.live),DK=days(L.live);
const base=sum(R(pre));
const loo=DK.map(k=>{const p=L.live.filter(t=>t.t<T935&&t.date!==k);return{k,sumR:sum(R(p)),exp:mean(R(p))};}).sort((a,b)=>a.sumR-b.sumR);
loo.slice(0,5).forEach(x=>console.log(`  drop ${x.k}: preSumR=${f(x.sumR,1)} preExpR=${f(x.exp)}`));
console.log("  full preSumR="+f(base,1)+" preExpR="+f(mean(R(pre))));
// how concentrated: top-3 sessions
const bySess=DK.map(k=>({k,r:sum(R(L.live.filter(t=>t.t<T935&&t.date===k)))})).sort((a,b)=>b.r-a.r);
console.log("  pre-935 R by session (top5):", bySess.slice(0,5).map(x=>`${x.k}:${f(x.r,1)}`).join("  "));
console.log("  sessions with positive pre-935 R:", bySess.filter(x=>x.r>0).length, "of", DK.length);

// combined live+practice pre vs post (larger n)
console.log("\n=== COMBINED live+practice pre vs post ===");
const all=[...L.live,...L.practice];
console.log(st(all.filter(t=>t.t<T935),"ALL pre-9:35"));
console.log(st(all.filter(t=>t.t>=T935),"ALL 9:35+"));
console.log("permP="+f(permP(R(all.filter(t=>t.t<T935)),R(all.filter(t=>t.t>=T935))),3));
