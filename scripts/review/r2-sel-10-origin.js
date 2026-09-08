const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, R, permP, bootCI, days, byDay } = L;

// Origin is the one selection variable that is genuinely PRE-MARKET (from the Daily Plan).
console.log("=== ORIGIN (planned pre-market vs found intraday) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const b={}; T.forEach(t=>(b[t.origin||"(blank)"] ||= []).push(t));
  console.log("-- "+bn); Object.entries(b).sort((x,y)=>y[1].length-x[1].length).forEach(([k,a])=>console.log(st(a,k)));
  const w=T.filter(t=>t.origin==="Watchlist"), i=T.filter(t=>t.origin==="Intraday discovery");
  if(w.length>2&&i.length>2) console.log("   permP Watchlist vs Intraday =",f(permP(R(w),R(i)),4));
}
// exclude SPY/QQQ which are ALWAYS Watchlist by rule (artifact: definitional)
console.log("\nex SPY/QQQ (they are auto-Watchlist by rule):");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const X=T.filter(t=>t.sym!=="SPY"&&t.sym!=="QQQ");
  const w=X.filter(t=>t.origin==="Watchlist"), i=X.filter(t=>t.origin==="Intraday discovery");
  console.log("-- "+bn); console.log(st(w,"Watchlist ex SPY/QQQ")); console.log(st(i,"Intraday ex SPY/QQQ"));
  if(w.length>2&&i.length>2) console.log("   permP =",f(permP(R(w),R(i)),4));
}

// Conviction (pre-market, from the plan)
console.log("\n=== CONVICTION (pre-market) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const b={}; T.filter(t=>!isNaN(t.conv)).forEach(t=>(b[t.conv] ||= []).push(t));
  console.log("-- "+bn); Object.keys(b).sort().forEach(k=>console.log(st(b[k],"conv="+k)));
  const lo=T.filter(t=>t.conv<=1), hi=T.filter(t=>t.conv>=2);
  if(lo.length>2&&hi.length>2)console.log("   permP conv1 vs conv2-3 =",f(permP(R(lo),R(hi)),4));
}

// Catalyst present (his stated rule: needs a genuine reason)
console.log("\n=== CATALYST logged vs blank (his stated rule) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  console.log("-- "+bn); const y=T.filter(t=>t.cat!==""), n=T.filter(t=>t.cat==="");
  console.log(st(y,"catalyst logged")); console.log(st(n,"catalyst blank"));
  console.log("   permP =",f(permP(R(y),R(n)),4), "  (NOTE: blank is missing-not-at-random, artifact #10)");
}

// concentration robustness on the month
console.log("\n=== MONTH ROBUSTNESS ===");
console.log(st(live,"all live"));
["MRNA","QQQ","SPY","NVDA"].forEach(s=>console.log(st(live.filter(t=>t.sym!==s),"ex "+s)));
console.log(st(live.filter(t=>!["MRNA","NVDA"].includes(t.sym)),"ex MRNA+NVDA"));
const srt=[...live].filter(t=>!isNaN(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR);
[1,2,3,5].forEach(k=>console.log(st(srt.slice(k),"drop top "+k+" trades")));
// session-level bootstrap (respects day clustering)
const d=byDay(live), dd=days(live).map(k=>sum(R(d[k])));
const ms=[]; for(let i=0;i<5000;i++){let s=0;for(let j=0;j<dd.length;j++)s+=dd[(Math.random()*dd.length)|0];ms.push(s);}
ms.sort((a,b)=>a-b);
console.log("\nSESSION-clustered bootstrap of month total R (19 sessions): 95% CI = ["+
  f(ms[125],1)+", "+f(ms[4875],1)+"]  median="+f(ms[2500],1));
const msP=[]; const dp=byDay(practice), ddp=days(practice).map(k=>sum(R(dp[k])));
for(let i=0;i<5000;i++){let s=0;for(let j=0;j<ddp.length;j++)s+=ddp[(Math.random()*ddp.length)|0];msP.push(s/ddp.length);}
msP.sort((a,b)=>a-b);
const msL=[]; for(let i=0;i<5000;i++){let s=0;for(let j=0;j<dd.length;j++)s+=dd[(Math.random()*dd.length)|0];msL.push(s/dd.length);}
msL.sort((a,b)=>a-b);
console.log("mean R per SESSION: live "+f(mean(dd))+" [" +f(msL[125])+","+f(msL[4875])+"]  | practice "+
  f(mean(ddp))+" ["+f(msP[125])+","+f(msP[4875])+"]");
console.log("permP session-level live vs practice =", f(permP(dd,ddp),4));
