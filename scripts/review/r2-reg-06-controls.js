// FINAL CONTROLS: artifact #1 (R-normalisation), overlap of findings with the top-3 trades.
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, bootCI, permP, byDay, dayR } = L;

console.log("=== 6.1 ARTIFACT #1 CHECK: did his STOP DISTANCE change between books? ===");
// posMFE is normalised by stop distance. A wider stop mechanically shrinks it.
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const sd1 = T.filter(t=>t.firstEntry>0&&t.initStop>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.firstEntry*100);
  const sdADR = T.filter(t=>t.firstEntry>0&&t.initStop>0&&t.adr>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.adr);
  const sd30 = T.filter(t=>t.firstEntry>0&&t.initStop>0&&t.m30>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.m30);
  console.log(`${nm}: stop dist %price med=${f(med(sd1))} mean=${f(mean(sd1))} | /ADR med=${f(med(sdADR))} | /30mATR med=${f(med(sd30))} (n=${sd1.length})`);
}
const a1=live.filter(t=>t.firstEntry>0&&t.initStop>0&&t.adr>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.adr);
const b1=practice.filter(t=>t.firstEntry>0&&t.initStop>0&&t.adr>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.adr);
console.log("perm p stopDist/ADR =", f(permP(a1,b1,20000),4));
const a2=live.filter(t=>t.firstEntry>0&&t.initStop>0&&t.m30>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.m30);
const b2=practice.filter(t=>t.firstEntry>0&&t.initStop>0&&t.m30>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.m30);
console.log("perm p stopDist/30mATR =", f(permP(a2,b2,20000),4));
const a3=live.filter(t=>t.firstEntry>0&&t.initStop>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.firstEntry*100);
const b3=practice.filter(t=>t.firstEntry>0&&t.initStop>0).map(t=>Math.abs(t.firstEntry-t.initStop)/t.firstEntry*100);
console.log("perm p stopDist %price =", f(permP(a3,b3,20000),4));

console.log("\n=== 6.2 SIZE-FREE ENTRY QUALITY: excursion in ATR units, not R units ===");
// (peakPrice - entry)/30mATR, single-entry only, immune to both stop-width and size effects.
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const se = T.filter(t=>t.nEntries===1 && !isNaN(t.posMFE) && t.initRisk>0 && t.firstEntry>0 && t.initStop>0 && t.m30>0);
  const v = se.map(t=>t.posMFE * Math.abs(t.firstEntry-t.initStop) / t.m30);   // = (peak-entry)/30mATR
  const vA = se.filter(t=>t.adr>0).map(t=>t.posMFE * Math.abs(t.firstEntry-t.initStop) / t.adr);
  console.log(`${nm}: single-entry excursion /30mATR n=${v.length} med=${f(med(v))} mean=${f(mean(v))} | /ADR med=${f(med(vA))}`);
}
const g = T => T.filter(t=>t.nEntries===1&&!isNaN(t.posMFE)&&t.firstEntry>0&&t.initStop>0&&t.m30>0).map(t=>t.posMFE*Math.abs(t.firstEntry-t.initStop)/t.m30);
console.log("perm p (size-free, stop-free entry quality) =", f(permP(g(live),g(practice),20000),4));

console.log("\n=== 6.3 DO MY FINDINGS SURVIVE REMOVING THE TOP 3 TRADES? ===");
const top3 = new Set(["2026-08-19|MRNA","2026-08-06|QQQ","2026-08-05|NVDA"]);
const key = t => t.date+"|"+t.sym;
const liveX = live.filter(t=>!(top3.has(key(t)) && t.pnlR>4));
console.log(st(liveX, "live minus top-3"));
console.log(st(practice, "practice (all)"));
console.log("perm p =", f(permP(R(liveX), R(practice),50000),4));
console.log("\n9:30-9:35 effect without top-3:");
const bkt = t => t.t < 9.5*3600+300;
console.log("  "+st(liveX.filter(bkt), "live 9:30-9:35 minus top3"));
console.log("  "+st(liveX.filter(t=>!isNaN(t.t)&&!bkt(t)), "live later"));
console.log("  perm p =", f(permP(R(liveX.filter(bkt)), R(liveX.filter(t=>!isNaN(t.t)&&!bkt(t))),20000),4));
console.log("\nmulti-entry effect without top-3:");
console.log("  "+st(liveX.filter(t=>t.nEntries>=2), "live multi minus top3"));
console.log("  "+st(liveX.filter(t=>t.nEntries===1), "live single"));
console.log("\nwhat times were the top-5?");
live.filter(t=>t.pnlR>=4.3).forEach(t=>console.log(`  ${t.date} ${t.sym} entry=${t.entry} nEnt=${t.nEntries} R=${t.pnlR}`));

console.log("\n=== 6.4 PRE-REGISTERED HYPOTHESES touching this track ===");
const MEGA = ["AAPL","MSFT","GOOGL","GOOG","AMZN","NVDA","META","TSLA","AVGO","JPM","LLY","BRK.B"];
console.log("H2 mega-cap single names:");
console.log("  "+st(live.filter(t=>MEGA.includes(t.sym)), "live mega"));
console.log("  "+st(live.filter(t=>!MEGA.includes(t.sym)&&!["SPY","QQQ"].includes(t.sym)), "live other names"));
console.log("  perm p =", f(permP(R(live.filter(t=>MEGA.includes(t.sym))), R(live.filter(t=>!MEGA.includes(t.sym)&&!["SPY","QQQ"].includes(t.sym))),20000),4));
console.log("H3 index ETFs ~zero:");
console.log("  "+st(live.filter(t=>["SPY","QQQ"].includes(t.sym)), "live SPY/QQQ"));
console.log("H10 Friday:");
const dow = d => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(d+"T12:00:00Z").getUTCDay()];
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const c={}; T.forEach(t=>{const k=dow(t.date); (c[k]||=[]).push(t);});
  console.log(" "+nm); ["Mon","Tue","Wed","Thu","Fri"].forEach(d=>{ if(c[d]) console.log("   "+st(c[d],d)); });
}

console.log("\n=== 6.5 SESSION-LEVEL SUMMARY FOR THE VERDICT ===");
const ld=dayR(live), pd=dayR(practice);
console.log(`live: ${ld.filter(d=>d.r>0).length}/${ld.length} green sessions (${f(ld.filter(d=>d.r>0).length/ld.length*100,0)}%)  median session R=${f(med(ld.map(d=>d.r)))}`);
console.log(`prac: ${pd.filter(d=>d.r>0).length}/${pd.length} green sessions (${f(pd.filter(d=>d.r>0).length/pd.length*100,0)}%)  median session R=${f(med(pd.map(d=>d.r)))}`);
console.log("perm p green-session rate =", f(permP(ld.map(d=>d.r>0?1:0), pd.map(d=>d.r>0?1:0),20000),4));
console.log("perm p median/mean session R =", f(permP(ld.map(d=>d.r), pd.map(d=>d.r),20000),4));
console.log(`\nTrades/session: live ${f(70/19,1)}  prac ${f(248/54,1)}`);
