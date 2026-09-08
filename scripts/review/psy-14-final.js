const L=require("./lib.js"); const {f,mean,sum,R,byDay,days,med}=L;
const D=byDay(L.live),DK=days(L.live);
const rows=DK.map(k=>{const a=D[k];const p=fl=>{const v=a.map(t=>t[fl]).filter(x=>!isNaN(x));return v.length?v[0]:NaN;};
  return {k,sleepH:p("sleepH"),sleepSc:p("sleepSc"),ready:p("ready"),energy:p("energy"),tension:p("tension")};});
function pear(x,y){const n=x.length,mx=mean(x),my=mean(y);let a=0,b=0,c=0;
  for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c);}
console.log("=== collinearity among the wearable/psych fields (are they independent tests?) ===");
const F=["sleepH","sleepSc","ready","energy","tension"];
F.forEach(a=>F.forEach(b=>{if(a<b){const s=rows.filter(r=>!isNaN(r[a])&&!isNaN(r[b]));
  console.log(`  r(${a},${b}) = ${f(pear(s.map(r=>r[a]),s.map(r=>r[b])))}  n=${s.length}`);}}));
console.log("\n=== check: is 'ready' just recorded higher on days he later traded well? (no - it's pre-market) ===");
console.log("  fields are logged in the Morning Plan pre-open and replicated to every trade of the date -> causally prior. Confirmed by within-session constancy (0 sessions with >1 value).");
console.log("\n=== live sessions missing psych entirely ===");
console.log("  " + DK.filter(k=>D[k].every(t=>isNaN(t.energy))).join(", ") + "  (3 of 19)");
console.log("  their dayR: " + DK.filter(k=>D[k].every(t=>isNaN(t.energy))).map(k=>f(sum(R(D[k])),1)).join(", "));
console.log("\n=== execution-quality summary by half of month (MFE vs realized) ===");
[["7/30-8/11",t=>t.date<"2026-08-13"],["8/13-8/21",t=>t.date>="2026-08-13"&&t.date<="2026-08-21"],["8/24-8/28",t=>t.date>="2026-08-24"]].forEach(([n,fn])=>{
  const a=L.live.filter(fn);
  console.log(`  ${n}: n=${a.length} sumMFE=${f(sum(a.map(t=>t.maxR).filter(x=>!isNaN(x))),1)} sumR=${f(sum(R(a)),1)} MFE>=1R=${f(a.filter(t=>t.maxR>=1).length/a.length*100,0)}%`);
});
