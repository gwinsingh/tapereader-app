const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, sum, mean, R, f } = L;

console.log("=== HEADLINE SANITY ===");
console.log(st(live, "live"));
console.log(st(practice, "practice"));
console.log("live sessions", L.days(live).length, "practice sessions", L.days(practice).length);
console.log("live dates", L.days(live)[0], "->", L.days(live).slice(-1)[0]);

console.log("\n=== FIELD COVERAGE (live) ===");
const fields = ["pnlR","risk","posMFE","maxR","mae","firstEntry","initStop","initRisk","maxRisk",
  "nEntries","nExits","stopRaises","capturePct","gap","rvol","float","adr","atr","m30","orSize",
  "orATR","pcl","d20","d50","vwap","pdc","pdh","pdl","conv","energy","tension","sleepH","sleepSc","ready"];
for (const k of fields) {
  const nOk = live.filter(t => !isNaN(t[k])).length;
  console.log(k.padEnd(12), nOk + "/" + live.length, " practice:", practice.filter(t=>!isNaN(t[k])).length + "/" + practice.length);
}
const sfields = ["setup","proc","right","origin","cat","l2","urge","stoppedOut","riskSource","tags","notes","dT","hT","mT","spy","bias","emo"];
for (const k of sfields) {
  const nOk = live.filter(t => t[k] !== "").length;
  console.log(k.padEnd(12), nOk + "/" + live.length, " practice:", practice.filter(t=>t[k]!=="").length + "/" + practice.length);
}

console.log("\n=== SYMBOLS live ===");
const bs = {}; live.forEach(t => (bs[t.sym] ||= []).push(t));
Object.entries(bs).sort((a,b)=>b[1].length-a[1].length).forEach(([s,a])=>console.log(st(a,s)));

console.log("\n=== SYMBOLS practice (top 20) ===");
const bp = {}; practice.forEach(t => (bp[t.sym] ||= []).push(t));
Object.entries(bp).sort((a,b)=>b[1].length-a[1].length).slice(0,20).forEach(([s,a])=>console.log(st(a,s)));

console.log("\n=== DAILY R (live) ===");
L.dayR(live).forEach(d => {
  const dt = new Date(d.date + "T12:00:00Z");
  console.log(d.date, ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getUTCDay()], "n=" + String(d.n).padStart(2), "R=" + f(d.r,2).padStart(7), "$=" + f(d.pnl,2).padStart(9));
});
let cum = 0; console.log("\ncum equity curve:");
L.dayR(live).forEach(d => { cum += d.r; console.log(d.date, f(cum,2).padStart(7)); });

console.log("\n=== riskSource / stoppedOut ===");
const cnt = (T,k) => { const c={}; T.forEach(t=>c[t[k]||"(blank)"]=(c[t[k]||"(blank)"]||0)+1); return c; };
console.log("live riskSource", cnt(live,"riskSource"));
console.log("live stoppedOut", cnt(live,"stoppedOut"));
console.log("practice riskSource", cnt(practice,"riskSource"));
console.log("live side", cnt(live,"side"), "practice side", cnt(practice,"side"));
