const L=require("./lib.js"); const {f,sum,mean,med,R,byDay,days}=L;
const D=byDay(L.live),DK=days(L.live);
const core=[t=>!!t.setup,t=>!!t.proc,t=>!!t.right,t=>!!t.notes,t=>!isNaN(t.conv),t=>!!t.cat,t=>!!t.l2,t=>!isNaN(t.energy)];
const rows=DK.map((k,i)=>({k,i,n:D[k].length,r:sum(R(D[k])),score:mean(D[k].map(t=>mean(core.map(fn=>fn(t)?1:0))))}));
function rank(v){const s=v.map((val,i)=>[val,i]).sort((p,q)=>p[0]-q[0]);const r=new Array(v.length);
  let i=0;while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const a=(i+j)/2+1;
  for(let k=i;k<=j;k++)r[s[k][1]]=a;i=j+1;}return r;}
function pear(x,y){const n=x.length,mx=mean(x),my=mean(y);let a=0,b=0,c=0;
  for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c);}
const sp=(x,y)=>pear(rank(x),rank(y));
function permP(x,y,it=20000){const o=Math.abs(sp(x,y));let c=0;for(let i=0;i<it;i++){const p=[...y];
  for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  if(Math.abs(sp(x,p))>=o)c++;}return c/it;}
function partial(x,y,z){const rxz=sp(x,z),ryz=sp(y,z),rxy=sp(x,y);
  return (rxy-rxz*ryz)/Math.sqrt((1-rxz*rxz)*(1-ryz*ryz));}

console.log("=== is the fill->nextR link just a shared time trend? ===");
const idx=rows.map(r=>r.i), fill=rows.map(r=>r.score), dr=rows.map(r=>r.r);
console.log(`rho(sessionIndex, fill)  = ${f(sp(idx,fill))}   permP=${f(permP(idx,fill),3)}   <- journal decays over the month`);
console.log(`rho(sessionIndex, dayR)  = ${f(sp(idx,dr))}     permP=${f(permP(idx,dr),3)}     <- results decay over the month`);
console.log(`rho(fill_t, fill_t+1)    = ${f(sp(fill.slice(0,-1),fill.slice(1)))}  <- fill autocorrelation`);
const f0=fill.slice(0,-1), r1=dr.slice(1), i0=idx.slice(0,-1);
console.log(`\nNEXT-session rho(fill_t, dayR_t+1) = ${f(sp(f0,r1))}`);
console.log(`  PARTIAL controlling for session index = ${f(partial(f0,r1,i0))}`);
console.log(`SAME-session rho(fill_t, dayR_t)   = ${f(sp(fill,dr))}`);
console.log(`  PARTIAL controlling for session index = ${f(partial(fill,dr,idx))}`);
// drop the 4 drawdown sessions
const sub=rows.filter(r=>r.k<"2026-08-24");
console.log(`\nEXCLUDING the final 4 drawdown sessions (n=${sub.length}):`);
console.log(`  same-session rho=${f(sp(sub.map(r=>r.score),sub.map(r=>r.r)))} permP=${f(permP(sub.map(r=>r.score),sub.map(r=>r.r)),3)}`);
const s0=sub.slice(0,-1),s1=sub.slice(1);
console.log(`  next-session rho=${f(sp(s0.map(r=>r.score),s1.map(r=>r.r)))} permP=${f(permP(s0.map(r=>r.score),s1.map(r=>r.r)),3)}`);

// Notes-only fill (the field most under his control, and least outcome-contaminated?)
console.log("\n=== notes-fill only ===");
const nf=DK.map(k=>({k,s:mean(D[k].map(t=>t.notes?1:0)),r:sum(R(D[k]))}));
nf.forEach(x=>console.log(`  ${x.k} notesFill=${f(x.s*100,0).padStart(3)}% dayR=${f(x.r,1)}`));
console.log(`same rho=${f(sp(nf.map(x=>x.s),nf.map(x=>x.r)))} permP=${f(permP(nf.map(x=>x.s),nf.map(x=>x.r)),3)}`);
console.log(`next rho=${f(sp(nf.slice(0,-1).map(x=>x.s),nf.slice(1).map(x=>x.r)))} permP=${f(permP(nf.slice(0,-1).map(x=>x.s),nf.slice(1).map(x=>x.r)),3)}`);

// PRACTICE replication of journal-fill -> R
console.log("\n=== PRACTICE replication (fill vs dayR, 54 sessions) ===");
const PD=byDay(L.practice),PK=days(L.practice);
const pcore=[t=>!!t.setup,t=>!!t.proc,t=>!!t.right,t=>!!t.notes,t=>!isNaN(t.conv),t=>!!t.cat,t=>!!t.l2];
const prows=PK.map((k,i)=>({k,i,n:PD[k].length,r:sum(R(PD[k])),score:mean(PD[k].map(t=>mean(pcore.map(fn=>fn(t)?1:0))))}));
const pf=prows.map(r=>r.score), pr=prows.map(r=>r.r), pi=prows.map(r=>r.i);
console.log(`  same rho=${f(sp(pf,pr))} permP=${f(permP(pf,pr),3)} n=${prows.length}`);
console.log(`  next rho=${f(sp(pf.slice(0,-1),pr.slice(1)))} permP=${f(permP(pf.slice(0,-1),pr.slice(1)),3)} n=${prows.length-1}`);
console.log(`  reverse rho(dayR_t, fill_t+1)=${f(sp(pr.slice(0,-1),pf.slice(1)))} permP=${f(permP(pr.slice(0,-1),pf.slice(1)),3)}`);
console.log(`  rho(index, fill)=${f(sp(pi,pf))}  rho(index,dayR)=${f(sp(pi,pr))}`);
console.log(`  partial(fill_t, dayR_t+1 | index)=${f(partial(pf.slice(0,-1),pr.slice(1),pi.slice(0,-1)))}`);
const pmed=med(pf);
console.log(`  fill>=med: sessions=${prows.filter(r=>r.score>=pmed).length} sumR=${f(sum(prows.filter(r=>r.score>=pmed).map(r=>r.r)),1)} meanDayR=${f(mean(prows.filter(r=>r.score>=pmed).map(r=>r.r)))}`);
console.log(`  fill< med: sessions=${prows.filter(r=>r.score<pmed).length} sumR=${f(sum(prows.filter(r=>r.score<pmed).map(r=>r.r)),1)} meanDayR=${f(mean(prows.filter(r=>r.score<pmed).map(r=>r.r)))}`);
