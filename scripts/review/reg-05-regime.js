/* REGIME TRACK 5 — MARKET REGIME + the MFE-failure mechanism. */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, byDay, days, dayR } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("5A. MECHANISM OF THE MFE FAILURE — is it #Partials?");
function pm(T,lbl){
  P(`${lbl}:`);
  [[0,1],[2,3],[4,99]].forEach(([a,b])=>{
    const s=T.filter(t=>ok(t.part)&&t.part>=a&&t.part<=b);
    if(!s.length) return;
    const z=s.filter(t=>ok(t.maxR)&&t.maxR===0).length;
    P(`   partials ${a}-${b===99?"+":b}: n=${String(s.length).padStart(3)}  MFE==0 rate = ${f(z/s.length*100,1).padStart(5)}%  meanRealR=${f(mean(R(s)),2)}`);
  });
}
pm(practice,"practice"); pm(live,"live    ");
P(`live  mean #Partials = ${f(mean(live.map(t=>t.part).filter(ok)),2)}  med=${f(med(live.map(t=>t.part).filter(ok)),1)}`);
P(`prac  mean #Partials = ${f(mean(practice.map(t=>t.part).filter(ok)),2)}  med=${f(med(practice.map(t=>t.part).filter(ok)),1)}`);
P(`permP #Partials = ${f(permP(live.map(t=>t.part).filter(ok),practice.map(t=>t.part).filter(ok)),4)}`);

line("5B. DAY-LEVEL MARKET REGIME (effective n = 19 vs 54 SESSIONS, artifact #7)");
function dayvals(T,key){ const d=byDay(T);
  return days(T).map(k=>{const v=d[k].map(t=>t[key]).filter(ok); return v.length?mean(v):NaN;}).filter(ok); }
function cmp(key,lbl,dec=3){
  const a=dayvals(live,key), b=dayvals(practice,key);
  const ca=bootCI(a), cb=bootCI(b);
  P(`${lbl.padEnd(16)} live  n=${String(a.length).padStart(2)} mean=${f(mean(a),dec).padStart(9)} [${f(ca[0],dec)},${f(ca[1],dec)}] med=${f(med(a),dec).padStart(9)} min=${f(Math.min(...a),dec)} max=${f(Math.max(...a),dec)}`);
  P(`${"".padEnd(16)} prac  n=${String(b.length).padStart(2)} mean=${f(mean(b),dec).padStart(9)} [${f(cb[0],dec)},${f(cb[1],dec)}] med=${f(med(b),dec).padStart(9)} min=${f(Math.min(...b),dec)} max=${f(Math.max(...b),dec)}   permP=${f(permP(a,b),4)}`);
}
cmp("vix","VIX",2); cmp("adr","ADR",3); cmp("atr","ATR",3); cmp("m30","30mATR",3);
cmp("rvol","RVOL",3); cmp("gap","%Gap",3); cmp("gapATR","%ATR",3);
cmp("orSize","OR Size $",3); cmp("orATR","OR %ATR",3); cmp("bvr","BVR",3);
cmp("advol","Avg $ Vol",0); cmp("d20","Dist20SMA",3); cmp("d50","Dist50SMA",3);

line("5C. SPY DIRECTION MIX (day level)");
function spyMix(T,lbl){
  const d=byDay(T), c={};
  days(T).forEach(k=>{const v=d[k][0].spy||"(blank)"; c[v]=(c[v]||0)+1;});
  P(`${lbl}: ${Object.entries(c).map(([k,v])=>`${k}=${v}`).join("  ")}  (${days(T).length} sessions)`);
}
spyMix(practice,"practice"); spyMix(live,"live    ");
["Up","Down","Flat"].forEach(dir=>{
  const a=live.filter(t=>t.spy===dir), b=practice.filter(t=>t.spy===dir);
  if(a.length||b.length) P(`   SPY ${dir.padEnd(5)}: live ${L.st(a,"").trim()}  ||  prac ${L.st(b,"").trim()}`);
});

line("5D. THE VIX BAND TEST — practice restricted to the live VIX range (14.25-17.09)");
const LOV=14.25, HIV=17.09;
const pIn = practice.filter(t=>ok(t.vix)&&t.vix>=LOV&&t.vix<=HIV);
const pOut= practice.filter(t=>ok(t.vix)&&(t.vix<LOV||t.vix>HIV));
P(L.st(pIn ,"practice IN live VIX band"));
P(L.st(pOut,"practice OUT of band     "));
P(L.st(live ,"live (all, in band)      "));
P(`   sessions: pIn=${days(pIn).length} pOut=${days(pOut).length}`);
P(`   permP live vs practice-IN-BAND = ${f(permP(R(live),R(pIn)),4)}`);
P(`   ==> the regime-matched practice baseline is ${f(mean(R(pIn)),3)}R/trade; live is ${f(mean(R(live)),3)}R/trade`);
P(`   ==> regime-matched expectation for 71 trades = ${f(mean(R(pIn))*71,1)}R ; actual live = ${f(sum(R(live)),1)}R`);
P(`   ==> so 'regime match' explains ${f(mean(R(pIn))*71,1)}R of the ${f(sum(R(live))-mean(R(practice))*71,1)}R gap vs the full-practice baseline`);
// the pre-registered H1 threshold
const p17 = practice.filter(t=>ok(t.vix)&&t.vix<17.2), p17h = practice.filter(t=>ok(t.vix)&&t.vix>=17.2);
P(L.st(p17 ,"practice VIX<17.2 (H1 lo)"));
P(L.st(p17h,"practice VIX>=17.2 (H1 hi)"));
P(`   permP = ${f(permP(R(p17),R(p17h)),4)}`);

line("5E. VIX BANDS INSIDE THE LIVE MONTH (is there a gradient even in 14-17?)");
const bands=[[14,15],[15,16],[16,17.2]];
bands.forEach(([a,b])=>{
  const l=live.filter(t=>ok(t.vix)&&t.vix>=a&&t.vix<b), p=practice.filter(t=>ok(t.vix)&&t.vix>=a&&t.vix<b);
  P(`   VIX ${a}-${b}: live ${L.st(l,"").trim()}`);
  P(`   ${"".padEnd(12)}  prac ${L.st(p,"").trim()}`);
});

line("5F. TIME-ORDERED: was the live month early-good / late-bad? (regime drift)");
const ld=dayR(live);
let cum=0; ld.forEach(d=>{cum+=d.r;P(`   ${d.date} R=${f(d.r,2).padStart(6)} cum=${f(cum,2).padStart(7)} n=${d.n}`);});
const h1=ld.slice(0,10), h2=ld.slice(10);
P(`   first 10 sessions sumR=${f(sum(h1.map(d=>d.r)),1)} (n=${sum(h1.map(d=>d.n))} trades)`);
P(`   last   9 sessions sumR=${f(sum(h2.map(d=>d.r)),1)} (n=${sum(h2.map(d=>d.n))} trades)`);
P(`   permP session R halves = ${f(permP(h1.map(d=>d.r),h2.map(d=>d.r)),4)}`);

line("5G. PREDICTION METRICS — does he pick stocks that MOVE? (independent of execution)");
// excursion beyond the open: long H-O, short O-L. Intra-day: >=1x 30mATR. Daily: >=0.8x ADR.
function pred(T,lbl){
  const rows=T.filter(t=>ok(t.O)&&ok(t.H)&&ok(t.L)).map(t=>{
    const shortSide=/shrt|short/i.test(t.side);
    const exc = shortSide ? (t.O-t.L) : (t.H-t.O);
    return { exc, intra: ok(t.m30)&&t.m30>0 ? exc/t.m30 : NaN, daily: ok(t.adr)&&t.adr>0 ? exc/t.adr : NaN };
  });
  const I=rows.map(r=>r.intra).filter(ok), D=rows.map(r=>r.daily).filter(ok);
  const ip=I.filter(x=>x>=1).length/I.length, dp=D.filter(x=>x>=0.8).length/D.length, dp1=D.filter(x=>x>=1).length/D.length;
  P(`${lbl}: n=${rows.length}`);
  P(`   Intra-Day Prediction (exc>=1x30mATR) = ${f(ip*100,1)}%  (n=${I.length})   mean exc/30mATR=${f(mean(I),3)} med=${f(med(I),3)}`);
  P(`   Daily Prediction    (exc>=0.8xADR)  = ${f(dp*100,1)}%  (n=${D.length})   strong(>=1.0xADR)=${f(dp1*100,1)}%   mean exc/ADR=${f(mean(D),3)} med=${f(med(D),3)}`);
  return {I,D,ip,dp};
}
const prP=pred(practice,"practice"), prL=pred(live,"live    ");
P(`   permP exc/30mATR = ${f(permP(prL.I,prP.I),4)}    permP exc/ADR = ${f(permP(prL.D,prP.D),4)}`);
// two-proportion z on the binary prediction rates
function zprop(k1,n1,k2,n2){const p1=k1/n1,p2=k2/n2,p=(k1+k2)/(n1+n2);
  const z=(p1-p2)/Math.sqrt(p*(1-p)*(1/n1+1/n2));
  const pv=2*(1-0.5*(1+erf(Math.abs(z)/Math.SQRT2)));return {z,pv};}
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911;
  const t=1/(1+p*x);const y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);return s*y;}
const zi=zprop(prL.I.filter(x=>x>=1).length,prL.I.length,prP.I.filter(x=>x>=1).length,prP.I.length);
const zd=zprop(prL.D.filter(x=>x>=0.8).length,prL.D.length,prP.D.filter(x=>x>=0.8).length,prP.D.length);
P(`   two-prop z Intra-Day: z=${f(zi.z,2)} p=${f(zi.pv,4)}    Daily: z=${f(zd.z,2)} p=${f(zd.pv,4)}`);
