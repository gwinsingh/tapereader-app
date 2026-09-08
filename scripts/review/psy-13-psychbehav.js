const L=require("./lib.js"); const {f,st,R,sum,mean,med,permP,byDay,days}=L;
const D=byDay(L.live),DK=days(L.live); const T935=9*3600+35*60;
const core=[t=>!!t.setup,t=>!!t.proc,t=>!!t.right,t=>!!t.notes,t=>!isNaN(t.conv),t=>!!t.cat,t=>!!t.l2];
const rows=DK.map(k=>{const a=D[k];const pick=fl=>{const v=a.map(t=>t[fl]).filter(x=>!isNaN(x));return v.length?v[0]:NaN;};
  const lab=a.filter(t=>t.proc);
  return {k,a,n:a.length,r:sum(R(a)),
    energy:pick("energy"),tension:pick("tension"),sleepH:pick("sleepH"),sleepSc:pick("sleepSc"),ready:pick("ready"),
    urge:(a.map(t=>t.urge).filter(x=>x)[0]||""),
    disc: lab.length? lab.filter(t=>t.proc==="Yes").length/lab.length : NaN,
    viol: lab.filter(t=>t.proc==="No").length,
    fill: mean(a.map(t=>mean(core.map(fn=>fn(t)?1:0)))),
    pre: a.filter(t=>t.t<T935).length/a.length,
    medMFE: med(a.map(t=>t.maxR)), medDur: med(a.map(t=>t.dur))};});
function rank(v){const s=v.map((x,i)=>[x,i]).sort((p,q)=>p[0]-q[0]);const r=new Array(v.length);
  let i=0;while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const a=(i+j)/2+1;
  for(let k=i;k<=j;k++)r[s[k][1]]=a;i=j+1;}return r;}
function pear(x,y){const n=x.length,mx=mean(x),my=mean(y);let a=0,b=0,c=0;
  for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c);}
const sp=(x,y)=>pear(rank(x),rank(y));
function pp(x,y,it=20000){const o=Math.abs(sp(x,y));let c=0;for(let i=0;i<it;i++){const p=[...y];
  for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  if(Math.abs(sp(x,p))>=o)c++;}return c/it;}
console.log("=== psych (causally prior) vs BEHAVIOUR that day ===");
console.log("psych      vs nTrades      vs disc%       vs journalFill  vs pre935share  vs medMFE      vs dayR");
["energy","tension","sleepH","sleepSc","ready"].forEach(fl=>{
  const g=t=>rows.filter(r=>!isNaN(r[fl])&&!isNaN(r[t]));
  const line=t=>{const s=g(t);return `${f(sp(s.map(r=>r[fl]),s.map(r=>r[t]))).padStart(5)}(p=${f(pp(s.map(r=>r[fl]),s.map(r=>r[t])),2)},n=${s.length})`;};
  console.log(`${fl.padEnd(9)} ${line("n")} ${line("disc")} ${line("fill")} ${line("pre")} ${line("medMFE")} ${line("r")}`);
});
const uY=rows.filter(r=>r.urge==="Yes"),uN=rows.filter(r=>r.urge==="No");
console.log(`urge=Yes(n=${uY.length}): trades=${f(mean(uY.map(r=>r.n)))} disc=${f(mean(uY.filter(r=>!isNaN(r.disc)).map(r=>r.disc))*100,0)}% fill=${f(mean(uY.map(r=>r.fill))*100,0)}% pre935=${f(mean(uY.map(r=>r.pre))*100,0)}% dayR=${f(mean(uY.map(r=>r.r)))}`);
console.log(`urge=No (n=${uN.length}): trades=${f(mean(uN.map(r=>r.n)))} disc=${f(mean(uN.filter(r=>!isNaN(r.disc)).map(r=>r.disc))*100,0)}% fill=${f(mean(uN.map(r=>r.fill))*100,0)}% pre935=${f(mean(uN.map(r=>r.pre))*100,0)}% dayR=${f(mean(uN.map(r=>r.r)))}`);

console.log("\n=== composite psych score (z(energy) - z(tension) + z(ready)) ===");
const has=rows.filter(r=>!isNaN(r.energy)&&!isNaN(r.tension)&&!isNaN(r.ready));
const z=(a)=>{const m=mean(a),s=Math.sqrt(mean(a.map(x=>(x-m)**2)));return a.map(x=>(x-m)/s);};
const ze=z(has.map(r=>r.energy)),zt=z(has.map(r=>r.tension)),zr=z(has.map(r=>r.ready));
has.forEach((r,i)=>r.comp=ze[i]-zt[i]+zr[i]);
has.sort((a,b)=>b.comp-a.comp).forEach(r=>console.log(`  ${r.k} comp=${f(r.comp)} dayR=${f(r.r,1)} n=${r.n}`));
console.log(`rho(comp, dayR)=${f(sp(has.map(r=>r.comp),has.map(r=>r.r)))} permP=${f(pp(has.map(r=>r.comp),has.map(r=>r.r)),3)} n=${has.length}`);
const hi=has.filter(r=>r.comp>0),lo=has.filter(r=>r.comp<=0);
console.log(`  comp>0: sessions=${hi.length} sumR=${f(sum(hi.map(r=>r.r)),1)} trades=${sum(hi.map(r=>r.n))} tradeExpR=${f(sum(hi.map(r=>r.r))/sum(hi.map(r=>r.n)))}`);
console.log(`  comp<=0: sessions=${lo.length} sumR=${f(sum(lo.map(r=>r.r)),1)} trades=${sum(lo.map(r=>r.n))} tradeExpR=${f(sum(lo.map(r=>r.r))/sum(lo.map(r=>r.n)))}`);
