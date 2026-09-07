const L = require("./lib.js");
const {f, st, R, sum, mean, med, sd, bootCI, permP, byDay, days, dayR} = L;

console.log("========== PSYCH CHECK-IN FIELD COVERAGE (LIVE) ==========");
const D = byDay(L.live), DK = days(L.live);
const fields = ["energy","tension","sleepH","sleepSc","ready"];
fields.forEach(fl => {
  const v = L.live.map(t=>t[fl]).filter(x=>!isNaN(x));
  const sess = DK.filter(k => D[k].some(t=>!isNaN(t[fl])));
  const c = {}; v.forEach(x=>c[x]=(c[x]||0)+1);
  console.log(`${fl.padEnd(9)} trades=${v.length}/71  sessions=${sess.length}/19  vals: ` +
    Object.entries(c).sort((a,b)=>a[0]-b[0]).map(([k,n])=>`${k}:${n}`).join(" "));
});
const uv={}; L.live.forEach(t=>uv[t.urge||"(blank)"]=(uv[t.urge||"(blank)"]||0)+1);
const usess = DK.filter(k=>D[k].some(t=>t.urge));
console.log(`urge      trades=${71-(uv["(blank)"]||0)}/71  sessions=${usess.length}/19  ` + JSON.stringify(uv));

console.log("\n--- per-session psych table ---");
console.log("date        n   dayR   energy tension urge  sleepH sleepSc ready");
const rows = DK.map(k=>{
  const a = D[k];
  const pick = fl => { const v=a.map(t=>t[fl]).filter(x=>!isNaN(x)); return v.length?v[0]:NaN; };
  const u = a.map(t=>t.urge).filter(x=>x)[0] || "";
  return {date:k, n:a.length, r:sum(R(a)), energy:pick("energy"), tension:pick("tension"),
          urge:u, sleepH:pick("sleepH"), sleepSc:pick("sleepSc"), ready:pick("ready"), trades:a};
});
rows.forEach(r=>console.log(`${r.date}  ${String(r.n).padStart(2)} ${f(r.r,1).padStart(6)}   ${f(r.energy,0).padStart(4)}  ${f(r.tension,0).padStart(5)}  ${r.urge.padEnd(5)} ${f(r.sleepH,1).padStart(5)}  ${f(r.sleepSc,0).padStart(5)}  ${f(r.ready,0).padStart(5)}`));

// check within-session constancy
console.log("\n--- within-session constancy check ---");
fields.concat(["urge"]).forEach(fl=>{
  let bad=0; DK.forEach(k=>{ const v=[...new Set(D[k].map(t=>t[fl]).filter(x=>x!==""&&!(typeof x==="number"&&isNaN(x))))]; if(v.length>1) bad++; });
  console.log(`  ${fl}: sessions with >1 distinct value = ${bad}`);
});

// Correlations: day-level
function pearson(x,y){const n=x.length;if(n<3)return NaN;const mx=mean(x),my=mean(y);
  let a=0,b=0,c=0;for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}
  return a/Math.sqrt(b*c);}
function spearman(x,y){const rank=v=>{const s=v.map((val,i)=>[val,i]).sort((p,q)=>p[0]-q[0]);const r=new Array(v.length);
  let i=0;while(i<s.length){let j=i;while(j+1<s.length&&s[j+1][0]===s[i][0])j++;const avg=(i+j)/2+1;
  for(let k=i;k<=j;k++)r[s[k][1]]=avg;i=j+1;}return r;};return pearson(rank(x),rank(y));}
function permCorr(x,y,iters=10000){const obs=Math.abs(spearman(x,y));let c=0;
  for(let i=0;i<iters;i++){const p=[...y];for(let j=p.length-1;j>0;j--){const k=(Math.random()*(j+1))|0;[p[j],p[k]]=[p[k],p[j]];}
  if(Math.abs(spearman(x,p))>=obs)c++;}return c/iters;}

console.log("\n========== DAY-LEVEL: psych vs day R ==========");
fields.forEach(fl=>{
  const pts = rows.filter(r=>!isNaN(r[fl]));
  if(pts.length<3){console.log(`${fl}: n=${pts.length} too few`);return;}
  const x=pts.map(r=>r[fl]), y=pts.map(r=>r.r);
  console.log(`${fl.padEnd(9)} sessions=${pts.length}  spearman=${f(spearman(x,y))}  pearson=${f(pearson(x,y))}  permP=${f(permCorr(x,y),3)}`);
});
// urge day-level
const uY = rows.filter(r=>r.urge==="Yes"), uN = rows.filter(r=>r.urge==="No");
console.log(`urge      Yes sessions=${uY.length} meanDayR=${f(mean(uY.map(r=>r.r)))} sumR=${f(sum(uY.map(r=>r.r)),1)} | No sessions=${uN.length} meanDayR=${f(mean(uN.map(r=>r.r)))} sumR=${f(sum(uN.map(r=>r.r)),1)}  permP=${f(permP(uY.map(r=>r.r),uN.map(r=>r.r)),3)}`);

console.log("\n========== TRADE-LEVEL: psych buckets ==========");
function bucket(pred,label){ return L.live.filter(pred); }
// energy
[["energy",[[1,3],[4,4],[5,5]]],["tension",[[1,2],[3,3],[4,5]]]].forEach(([fl,bs])=>{
  console.log(`-- ${fl} --`);
  bs.forEach(([lo,hi])=>{
    const a=L.live.filter(t=>t[fl]>=lo&&t[fl]<=hi);
    if(a.length) console.log("  "+st(a, `${fl} ${lo}${lo!==hi?"-"+hi:""}`));
  });
});
console.log("-- urge (trade level) --");
console.log("  "+st(L.live.filter(t=>t.urge==="Yes"),"urge=Yes"));
console.log("  "+st(L.live.filter(t=>t.urge==="No"),"urge=No"));
console.log("  permP="+f(permP(R(L.live.filter(t=>t.urge==="Yes")),R(L.live.filter(t=>t.urge==="No"))),3));
console.log("-- sleepH --");
[[0,6.5],[6.5,7.5],[7.5,24]].forEach(([lo,hi])=>{
  const a=L.live.filter(t=>t.sleepH>=lo&&t.sleepH<hi);
  if(a.length) console.log("  "+st(a,`sleepH ${lo}-${hi}`));
});
console.log("-- sleepSc --");
const shMed = med(L.live.map(t=>t.sleepSc).filter(x=>!isNaN(x)));
console.log("  median sleepSc="+f(shMed));
console.log("  "+st(L.live.filter(t=>t.sleepSc>=shMed),"sleepSc >= med"));
console.log("  "+st(L.live.filter(t=>t.sleepSc<shMed),"sleepSc < med"));
console.log("-- ready --");
const rdMed = med(L.live.map(t=>t.ready).filter(x=>!isNaN(x)));
console.log("  median ready="+f(rdMed));
console.log("  "+st(L.live.filter(t=>t.ready>=rdMed),"ready >= med"));
console.log("  "+st(L.live.filter(t=>t.ready<rdMed),"ready < med"));

// does psych predict TRADE COUNT / behaviour rather than R?
console.log("\n========== psych vs BEHAVIOUR (trade count, early entries) ==========");
rows.forEach(r=>{ r.pre935 = r.trades.filter(t=>t.t<9*3600+35*60).length; });
["energy","tension","sleepH","sleepSc","ready"].forEach(fl=>{
  const pts=rows.filter(r=>!isNaN(r[fl]));
  if(pts.length<5)return;
  console.log(`${fl.padEnd(9)} vs nTrades rho=${f(spearman(pts.map(r=>r[fl]),pts.map(r=>r.n)))}  vs pre935count rho=${f(spearman(pts.map(r=>r[fl]),pts.map(r=>r.pre935)))}  vs pre935share rho=${f(spearman(pts.map(r=>r[fl]),pts.map(r=>r.pre935/r.n)))}`);
});
const uYn=uY.map(r=>r.n), uNn=uN.map(r=>r.n);
console.log(`urge=Yes meanTrades=${f(mean(uYn))} pre935share=${f(mean(uY.map(r=>r.pre935/r.n)))} | urge=No meanTrades=${f(mean(uNn))} pre935share=${f(mean(uN.map(r=>r.pre935/r.n)))}`);
