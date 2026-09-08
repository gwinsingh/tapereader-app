const L=require("./lib.js"); const {f,st,R,sum,mean,med,permP,byDay,days,bootCI}=L;
const D=byDay(L.live),DK=days(L.live);
console.log("===== DISCIPLINE: Process Followed? (live) =====");
console.log(st(L.live.filter(t=>t.proc==="Yes"),"proc=Yes"));
console.log(st(L.live.filter(t=>t.proc==="No"),"proc=No"));
console.log(st(L.live.filter(t=>!t.proc),"proc=blank"));
console.log("permP(Yes,No)="+f(permP(R(L.live.filter(t=>t.proc==="Yes")),R(L.live.filter(t=>t.proc==="No"))),3));
console.log("labelled rate = "+f(L.live.filter(t=>t.proc).length/71*100,0)+"%  discipline% = "+
  f(L.live.filter(t=>t.proc==="Yes").length/L.live.filter(t=>t.proc).length*100,0)+"%");
console.log("\n-- practice --");
console.log(st(L.practice.filter(t=>t.proc==="Yes"),"P proc=Yes"));
console.log(st(L.practice.filter(t=>t.proc==="No"),"P proc=No"));
console.log("P discipline% = "+f(L.practice.filter(t=>t.proc==="Yes").length/L.practice.filter(t=>t.proc).length*100,0)+"%");
console.log("permP="+f(permP(R(L.practice.filter(t=>t.proc==="Yes")),R(L.practice.filter(t=>t.proc==="No"))),3));

console.log("\n-- discipline TREND by session (live) --");
DK.forEach(k=>{const a=D[k];const lab=a.filter(t=>t.proc);const y=a.filter(t=>t.proc==="Yes");
  console.log(`${k} n=${a.length} labelled=${lab.length} disc=${lab.length?f(y.length/lab.length*100,0)+"%":"--"} dayR=${f(sum(R(a)),1)}`);});
// week trend
console.log("\n-- by half-month --");
const h1=L.live.filter(t=>t.date<"2026-08-13"), h2=L.live.filter(t=>t.date>="2026-08-13");
[["1st half (7/30-8/11)",h1],["2nd half (8/13-8/28)",h2]].forEach(([n,a])=>{
  const lab=a.filter(t=>t.proc);
  console.log(`${n}: trades=${a.length} labelled=${lab.length}/${a.length} disc=${f(lab.filter(t=>t.proc==="Yes").length/lab.length*100,0)}% sumR=${f(sum(R(a)),1)} expR=${f(mean(R(a)))}`);});

console.log("\n-- what violations cost --");
const no=L.live.filter(t=>t.proc==="No");
no.forEach(t=>console.log(`  ${t.date} ${t.sym.padEnd(5)} ${t.entry} R=${f(t.pnlR)} MFE=${f(t.maxR)} MAE=${f(t.mae)} setup=${t.setup} right=${t.right} notes="${t.notes.slice(0,90)}"`));
console.log(`  proc=No sumR=${f(sum(R(no)),1)}  as share of month: ${f(sum(R(no))/23.1*100,0)}%`);
console.log(`  proc=No: pre-9:35 share=${f(no.filter(t=>t.t<9*3600+35*60).length/no.length*100,0)}%  vs proc=Yes ${f(L.live.filter(t=>t.proc==="Yes"&&t.t<9*3600+35*60).length/49*100,0)}%`);

console.log("\n===== RightTheory? (H7, live) =====");
console.log(st(L.live.filter(t=>t.right==="Yes"),"right=Yes"));
console.log(st(L.live.filter(t=>t.right==="No"),"right=No"));
console.log("permP="+f(permP(R(L.live.filter(t=>t.right==="Yes")),R(L.live.filter(t=>t.right==="No"))),4));

console.log("\n===== JOURNAL QUALITY =====");
const JF=[["setup",t=>!!t.setup],["proc",t=>!!t.proc],["right",t=>!!t.right],["notes",t=>!!t.notes],
  ["conv",t=>!isNaN(t.conv)],["cat",t=>!!t.cat],["l2",t=>!!t.l2],["dT",t=>!!t.dT],
  ["energy",t=>!isNaN(t.energy)],["risk",t=>!isNaN(t.risk)],["origin",t=>!!t.origin]];
console.log("-- overall fill rate (live) --");
JF.forEach(([n,fn])=>console.log(`  ${n.padEnd(8)} ${f(L.live.filter(fn).length/71*100,0).padStart(3)}%  (${L.live.filter(fn).length}/71)`));
console.log("\n-- per-session fill score (mean of 8 core fields: setup, proc, right, notes, conv, cat, l2, energy) --");
const core=JF.filter(([n])=>["setup","proc","right","notes","conv","cat","l2","energy"].includes(n));
const rows=DK.map(k=>{const a=D[k];
  const score=mean(a.map(t=>mean(core.map(([,fn])=>fn(t)?1:0))));
  return {k,a,n:a.length,r:sum(R(a)),score};});
rows.forEach(r=>console.log(`  ${r.k} n=${String(r.n).padStart(2)} fill=${f(r.score*100,0).padStart(3)}%  dayR=${f(r.r,1).padStart(6)}`));
function spearman(x,y){const rank=v=>{const s=v.map((val,i)=>[val,i]).sort((p,q)=>p[0]-q[0]);const r=new Array(v.length);
  let i=0;while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const avg=(i+j)/2+1;
  for(let k2=i;k2<=j;k2++)r[s[k2][1]]=avg;i=j+1;}return r;};
  const rx=rank(x),ry=rank(y);const n=x.length,mx=mean(rx),my=mean(ry);let a=0,b=0,c=0;
  for(let i=0;i<n;i++){const dx=rx[i]-mx,dy=ry[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c);}
function permCorr(x,y,iters=20000){const obs=Math.abs(spearman(x,y));let c=0;
  for(let i=0;i<iters;i++){const p=[...y];for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  if(Math.abs(spearman(x,p))>=obs)c++;}return c/iters;}
const X=rows.map(r=>r.score), Y=rows.map(r=>r.r);
console.log(`\nSAME-session:  rho(fill, dayR)=${f(spearman(X,Y))}  permP=${f(permCorr(X,Y),3)}  n=${rows.length}`);
const X2=rows.slice(0,-1).map(r=>r.score), Y2=rows.slice(1).map(r=>r.r);
console.log(`NEXT-session:  rho(fill_t, dayR_t+1)=${f(spearman(X2,Y2))}  permP=${f(permCorr(X2,Y2),3)}  n=${X2.length}`);
const Y3=rows.slice(0,-1).map(r=>r.r), X3=rows.slice(1).map(r=>r.score);
console.log(`REVERSE:       rho(dayR_t, fill_t+1)=${f(spearman(Y3,X3))}  permP=${f(permCorr(Y3,X3),3)}  n=${X3.length}`);
console.log(`fill vs nTrades rho=${f(spearman(X,rows.map(r=>r.n)))}`);
// median split
const fm=med(X);
const hiF=rows.filter(r=>r.score>=fm), loF=rows.filter(r=>r.score<fm);
console.log(`\nfill >= median(${f(fm*100,0)}%): sessions=${hiF.length} sumR=${f(sum(hiF.map(r=>r.r)),1)} meanDayR=${f(mean(hiF.map(r=>r.r)))}`);
console.log(`fill <  median:       sessions=${loF.length} sumR=${f(sum(loF.map(r=>r.r)),1)} meanDayR=${f(mean(loF.map(r=>r.r)))}`);
// zero-journal sessions
const zero=rows.filter(r=>r.score<0.2);
console.log(`\nnear-zero-journal sessions (<20% fill): ${zero.map(r=>r.k+"("+f(r.r,1)+"R)").join(" ")}`);
