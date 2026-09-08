const L=require("./lib.js"); const {f,st,R,sum,mean,med,permP,byDay,days,bootCI}=L;
const D=byDay(L.live),DK=days(L.live);
console.log("=== equity curve by session (live) ===");
let c=0; DK.forEach(k=>{const r=sum(R(D[k]));c+=r;console.log(`  ${k} n=${String(D[k].length).padStart(2)} dayR=${f(r,1).padStart(6)} cum=${f(c,1).padStart(6)}`);});
const DD=["2026-08-24","2026-08-25","2026-08-26","2026-08-28"];
const PRE=DK.filter(k=>!DD.includes(k));
const dd=L.live.filter(t=>DD.includes(t.date)), pre=L.live.filter(t=>!DD.includes(t.date));
console.log("\n=== DRAWDOWN STRETCH (8/24-8/28, 4 sessions, 17 trades) vs REST (15 sessions, 54 trades) ===");
console.log(st(dd,"drawdown 4 sessions"));
console.log(st(pre,"first 15 sessions"));
console.log("permP="+f(permP(R(dd),R(pre)),3));
const T935=9*3600+35*60;
function prof(a,name){
  const n=a.length;
  const num=(fn)=>{const v=a.map(fn).filter(x=>!isNaN(x));return v.length?mean(v):NaN;};
  console.log(`\n-- ${name} (n=${n}) --`);
  console.log(`  trades/session      ${f(n/(name.includes("drawdown")?4:15))}`);
  console.log(`  pre-9:35 share      ${f(a.filter(t=>t.t<T935).length/n*100,0)}%`);
  console.log(`  median entry time   ${a.map(t=>t.entry).sort()[Math.floor(n/2)]}`);
  console.log(`  win%                ${f(a.filter(t=>t.pnl>0).length/n*100,0)}%`);
  console.log(`  expR                ${f(mean(R(a)))}  sumR=${f(sum(R(a)),1)}`);
  console.log(`  mean MFE            ${f(num(t=>t.maxR))}   median ${f(med(a.map(t=>t.maxR)))}`);
  console.log(`  mean MAE            ${f(num(t=>t.mae))}`);
  console.log(`  MFE>=1R share       ${f(a.filter(t=>t.maxR>=1).length/n*100,0)}%   MFE>=2R ${f(a.filter(t=>t.maxR>=2).length/n*100,0)}%`);
  console.log(`  mean duration       ${f(num(t=>t.dur))} min`);
  console.log(`  mean risk $         ${f(num(t=>t.risk))}`);
  console.log(`  journal: setup ${f(a.filter(t=>t.setup).length/n*100,0)}% proc ${f(a.filter(t=>t.proc).length/n*100,0)}% right ${f(a.filter(t=>t.right).length/n*100,0)}% notes ${f(a.filter(t=>t.notes).length/n*100,0)}% conv ${f(a.filter(t=>!isNaN(t.conv)).length/n*100,0)}% cat ${f(a.filter(t=>t.cat).length/n*100,0)}%`);
  console.log(`  psych logged        energy ${f(a.filter(t=>!isNaN(t.energy)).length/n*100,0)}%  sleepH ${f(a.filter(t=>!isNaN(t.sleepH)).length/n*100,0)}%`);
  console.log(`  origin Watchlist    ${f(a.filter(t=>t.origin==="Watchlist").length/n*100,0)}%   Intraday disc ${f(a.filter(t=>t.origin==="Intraday discovery").length/n*100,0)}%`);
  console.log(`  index/ETF share     ${f(a.filter(t=>["SPY","QQQ","SOXL","SQQQ","XLE"].includes(t.sym)).length/n*100,0)}%`);
  console.log(`  mean VIX            ${f(num(t=>t.vix))}   mean RVOL ${f(med(a.map(t=>t.rvol)))} (median)`);
  console.log(`  mean %Gap           ${f(med(a.map(t=>t.gap)))} (median)  median orATR ${f(med(a.map(t=>t.orATR)))}`);
  console.log(`  proc=No rate        ${f(a.filter(t=>t.proc==="No").length/Math.max(1,a.filter(t=>t.proc).length)*100,0)}% of labelled`);
  console.log(`  best trade R        ${f(Math.max(...R(a)))}   worst ${f(Math.min(...R(a)))}`);
}
prof(dd,"drawdown 8/24-8/28"); prof(pre,"first 15 sessions");

console.log("\n=== the peak stretch 8/13-8/21 for contrast ===");
const peak=L.live.filter(t=>t.date>="2026-08-13"&&t.date<="2026-08-21");
console.log(st(peak,"8/13-8/21 (6 sessions)"));
console.log("\n=== session-level table across all behavioural dims ===");
console.log("date        n  dayR  pre935%  MFEmed  MAEmed  dur   fill%  disc%  conv  cat  psy");
const core=[t=>!!t.setup,t=>!!t.proc,t=>!!t.right,t=>!!t.notes,t=>!isNaN(t.conv),t=>!!t.cat,t=>!!t.l2,t=>!isNaN(t.energy)];
DK.forEach(k=>{const a=D[k];const lab=a.filter(t=>t.proc);
 console.log(`${k} ${String(a.length).padStart(2)} ${f(sum(R(a)),1).padStart(5)}  ${f(a.filter(t=>t.t<T935).length/a.length*100,0).padStart(5)}%  ${f(med(a.map(t=>t.maxR))).padStart(5)}  ${f(med(a.map(t=>t.mae))).padStart(6)}  ${f(med(a.map(t=>t.dur)),1).padStart(5)} ${f(mean(a.map(t=>mean(core.map(fn=>fn(t)?1:0))))*100,0).padStart(5)}% ${(lab.length?f(lab.filter(t=>t.proc==="Yes").length/lab.length*100,0)+"%":"  --").padStart(6)} ${f(a.filter(t=>!isNaN(t.conv)).length/a.length*100,0).padStart(4)}%${f(a.filter(t=>t.cat).length/a.length*100,0).padStart(4)}%${f(a.filter(t=>!isNaN(t.energy)).length/a.length*100,0).padStart(4)}%`);});

// did the market change?
console.log("\n=== market regime in the drawdown ===");
const dayVix=DK.map(k=>({k,vix:D[k].map(t=>t.vix).filter(x=>!isNaN(x))[0],spy:D[k][0].spy}));
dayVix.forEach(x=>console.log(`  ${x.k} VIX=${f(x.vix)} SPYdir=${x.spy}`));
console.log(`  mean VIX first15=${f(mean(dayVix.filter(x=>!DD.includes(x.k)).map(x=>x.vix)))} drawdown4=${f(mean(dayVix.filter(x=>DD.includes(x.k)).map(x=>x.vix)))}`);
console.log(`  SPY Up sessions: first15=${dayVix.filter(x=>!DD.includes(x.k)&&x.spy==="Up").length}/15  drawdown=${dayVix.filter(x=>DD.includes(x.k)&&x.spy==="Up").length}/4`);
