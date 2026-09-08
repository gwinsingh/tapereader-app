const L=require("./lib.js");const{live,practice,sum,mean,med,f,R,bootCI,permP,days,dayR}=L;
const P=s=>console.log(s);const ok=x=>!isNaN(x);
const orMed=med(live.map(t=>t.orATR).filter(ok));
const pIn=practice.filter(t=>ok(t.vix)&&t.vix>=14.25&&t.vix<=17.09);
const dm =practice.filter(t=>ok(t.vix)&&t.vix>=14.25&&t.vix<=17.09&&ok(t.orATR)&&t.orATR>=orMed);
function d(T,lbl){const r=R(T),w=r.filter(x=>x>0),l=r.filter(x=>x<=0);
 const ci=bootCI(w);
 P(`${lbl.padEnd(24)} n=${String(r.length).padStart(3)} win%=${f(w.length/r.length*100,1).padStart(5)} avgWin=${f(mean(w),2).padStart(5)} [${f(ci[0],2)},${f(ci[1],2)}] (nW=${String(w.length).padStart(3)}) avgLoss=${f(mean(l),2)} maxWin=${f(Math.max(...w),2)} expR=${f(mean(r),3)}`);return w;}
P("=== AVG WINNER SIZE ACROSS MATCHED POOLS ===");
const wAll=d(practice,"practice ALL");
const wIn =d(pIn,"practice low-VIX");
const wDm =d(dm,"practice DOUBLE-MATCHED");
const wL  =d(live,"live");
P("");
P(`permP avgWin live vs practice-ALL            = ${f(permP(wL,wAll),4)}`);
P(`permP avgWin live vs practice-lowVIX         = ${f(permP(wL,wIn),4)}`);
P(`permP avgWin live vs practice-DOUBLE-MATCHED = ${f(permP(wL,wDm),4)}`);
P("");
P("=== share of trades reaching >=3R realised ===");
[["ALL",practice],["lowVIX",pIn],["double",dm],["live",live]].forEach(([n,T])=>{
 const r=R(T);P(`  ${n.padEnd(8)} n=${String(r.length).padStart(3)} >=3R: ${r.filter(x=>x>=3).length} (${f(r.filter(x=>x>=3).length/r.length*100,1)}%)  >=2R: ${r.filter(x=>x>=2).length} (${f(r.filter(x=>x>=2).length/r.length*100,1)}%)`);});
P("");
P("=== double-matched pool: session detail ===");
P(`  sessions=${days(dm).length} trades=${dm.length} sumR=${f(sum(R(dm)),1)} expR=${f(mean(R(dm)),3)}`);
const ci=bootCI(R(dm));P(`  expR 95% CI = [${f(ci[0],3)},${f(ci[1],3)}]`);
P("");
P("=== live winners: were they in the wide-OR / low-VIX cells? ===");
const top=[...live].filter(t=>ok(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR).slice(0,6);
top.forEach(t=>P(`  ${t.date} ${t.sym.padEnd(6)} R=${f(t.pnlR,2).padStart(5)} vix=${f(t.vix,2)} OR%ATR=${f(t.orATR,1).padStart(6)} (live med ${f(orMed,1)}) rvol=${f(t.rvol,2)}`));
