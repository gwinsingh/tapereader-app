/* REGIME TRACK 8 — final controls.
   (i) is the deeper live MAE real, or just a duration artifact (longer holds = more time to go against you)?
   (ii) does the regime conclusion survive using OR-size / 30mATR instead of VIX as the regime variable?
   (iii) sanity on the "clean MFE subset" — is it a valid robustness check? (No: it drops winners by construction.) */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, byDay, days, dayR } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("8A. MAE DEPTH CONTROLLED FOR DURATION (artifact #2 family)");
const buckets=[[0,2],[2,5],[5,15],[15,600]];
buckets.forEach(([a,b])=>{
  const g=T=>T.filter(t=>ok(t.dur)&&t.dur>=a&&t.dur<b&&ok(t.mae));
  const l=g(live), p=g(practice);
  P(`  dur ${a}-${b===600?"+":b}m : live n=${String(l.length).padStart(3)}${l.length<15?"*":" "} medMAE=${f(med(l.map(t=>t.mae)),3).padStart(7)} | prac n=${String(p.length).padStart(3)} medMAE=${f(med(p.map(t=>t.mae)),3).padStart(7)} | permP=${f(permP(l.map(t=>t.mae),p.map(t=>t.mae)),4)}`);
});
P("  --- same, restricted to WINNERS (the claim was winners sat through -1R) ---");
buckets.forEach(([a,b])=>{
  const g=T=>T.filter(t=>ok(t.dur)&&t.dur>=a&&t.dur<b&&ok(t.mae)&&ok(t.pnlR)&&t.pnlR>0);
  const l=g(live), p=g(practice);
  if(!l.length&&!p.length) return;
  P(`  dur ${a}-${b===600?"+":b}m : live n=${String(l.length).padStart(3)}${l.length<15?"*":" "} medMAE=${f(med(l.map(t=>t.mae)),3).padStart(7)} share<=-1R=${L.pctf(l.filter(t=>t.mae<=-1).length,l.length).padStart(5)} | prac n=${String(p.length).padStart(3)} medMAE=${f(med(p.map(t=>t.mae)),3).padStart(7)} share<=-1R=${L.pctf(p.filter(t=>t.mae<=-1).length,p.length).padStart(5)}`);
});
// MAE by partial count (is it a scaling/avg-entry artifact?)
P("  --- MAE by #Partials (avg-entry artifact check) ---");
[[2,3],[4,99]].forEach(([a,b])=>{
  const g=T=>T.filter(t=>ok(t.part)&&t.part>=a&&t.part<=b&&ok(t.mae));
  const l=g(live), p=g(practice);
  P(`  partials ${a}-${b===99?"+":b}: live n=${String(l.length).padStart(3)}${l.length<15?"*":" "} medMAE=${f(med(l.map(t=>t.mae)),3)} | prac n=${String(p.length).padStart(3)} medMAE=${f(med(p.map(t=>t.mae)),3)}`);
});
// overall: regression-free control — compare live vs practice within the SAME duration bucket, pooled
const pooled=(T)=>T.filter(t=>ok(t.mae)&&ok(t.dur));
P(`  overall permP MAE = ${f(permP(pooled(live).map(t=>t.mae),pooled(practice).map(t=>t.mae)),4)}`);

line("8B. AN ALTERNATIVE REGIME VARIABLE — OR %ATR (bigger opening ranges = more room)");
// live OR%ATR mean 54.9 vs practice 34.5 (day level, permP 0.0035). Use it as the matching variable.
const allOR=[...practice].map(t=>t.orATR).filter(ok).sort((a,b)=>a-b);
const lo=Math.min(...live.map(t=>t.orATR).filter(ok)), hi=Math.max(...live.map(t=>t.orATR).filter(ok));
P(`  live OR%ATR range = ${f(lo,1)} .. ${f(hi,1)}`);
const pORhi=practice.filter(t=>ok(t.orATR)&&t.orATR>=med(live.map(t=>t.orATR).filter(ok)));
const pORlo=practice.filter(t=>ok(t.orATR)&&t.orATR< med(live.map(t=>t.orATR).filter(ok)));
P(`  practice OR%ATR >= live median (${f(med(live.map(t=>t.orATR).filter(ok)),1)}): ${L.st(pORhi,"").trim()}`);
P(`  practice OR%ATR <  live median              : ${L.st(pORlo,"").trim()}`);
P(`  permP = ${f(permP(R(pORhi),R(pORlo)),4)}`);
P(`  live itself: ${L.st(live,"").trim()}`);
P(`  ==> practice's own high-OR subset earns ${f(mean(R(pORhi)),3)}R/trade -> ${f(mean(R(pORhi))*71,1)}R over 71 trades`);
P(`  permP live vs practice-high-OR = ${f(permP(R(live),R(pORhi)),4)}`);

// double match: low VIX AND high OR%ATR
const dm=practice.filter(t=>ok(t.vix)&&t.vix>=14.25&&t.vix<=17.09&&ok(t.orATR)&&t.orATR>=med(live.map(t=>t.orATR).filter(ok)));
P(`  DOUBLE-MATCHED practice (VIX in band AND OR%ATR>=live med): ${L.st(dm,"").trim()}`);
P(`  ==> ${f(mean(R(dm))*71,1)}R over 71 trades; permP vs live = ${f(permP(R(live),R(dm)),4)}`);

line("8C. WHY THE 'CLEAN MFE' SUBSET IS NOT A VALID ROBUSTNESS CHECK");
const clean=T=>T.filter(t=>ok(t.maxR)&&ok(t.pnlR)&&t.maxR>=Math.max(t.pnlR,0)-0.001);
const lc=clean(live);
P(`  live clean n=${lc.length}, sumR=${f(sum(R(lc)),1)}`);
P(`  the exclusion rule drops rows where MFE < realised R — which can ONLY drop winners.`);
P(`  dropped rows: n=${live.length-lc.length}, of which winners=${live.filter(t=>!lc.includes(t)&&ok(t.pnlR)&&t.pnlR>0).length}, sumR=${f(sum(R(live))-sum(R(lc)),1)}`);
P(`  ==> selecting on the outcome. Report as a DATA-QUALITY finding, never as a performance estimate.`);

line("8D. RE-STATE THE HEADLINE UNDER EVERY NULL");
const TGT=sum(R(live));
function blockP(T,k,target,iters=200000){const s=dayR(T);let c=0;
  for(let i=0;i<iters;i++){let x=0;for(let j=0;j<k;j++)x+=s[(Math.random()*s.length)|0].r;if(x>=target)c++;}return c/iters;}
const pIn=practice.filter(t=>ok(t.vix)&&t.vix>=14.25&&t.vix<=17.09);
const pORhi2=practice.filter(t=>ok(t.orATR)&&t.orATR>=med(live.map(t=>t.orATR).filter(ok)));
P(`  P(19-session block >= +${f(TGT,1)}R)  from ALL practice        = ${f(blockP(practice,19,TGT)*100,2)}%`);
P(`  P(19-session block >= +${f(TGT,1)}R)  from low-VIX practice    = ${f(blockP(pIn,19,TGT)*100,2)}%`);
P(`  P(19-session block >= +${f(TGT,1)}R)  from high-OR%ATR practice= ${f(blockP(pORhi2,19,TGT)*100,2)}%`);
P(`  P(19-session block >= +${f(TGT,1)}R)  from double-matched      = ${f(blockP(dm,19,TGT)*100,2)}%`);

line("8E. SESSION COUNT SANITY for the matched pools");
[["all practice",practice],["low-VIX practice",pIn],["high-OR practice",pORhi2],["double-matched",dm]].forEach(([n,T])=>
  P(`  ${n.padEnd(20)} trades=${String(T.length).padStart(3)} sessions=${String(days(T).length).padStart(2)} sumR=${f(sum(R(T)),1).padStart(7)} expR=${f(mean(R(T)),3).padStart(7)}`));
