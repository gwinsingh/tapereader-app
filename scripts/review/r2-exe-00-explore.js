const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const {live, practice, f, sum, mean, med, R, st, bootCI, permP} = L;

console.log("=== HEADERS ===");
console.log(live[0].hdr.join(" | "));
console.log("\n=== LIVE baseline ===");
console.log(st(live, "all live"));
console.log(st(practice, "all practice"));

const fld = ["posMFE","capturePct","mae","initStop","initRisk","maxRisk","nEntries","nExits","stopRaises","risk","pnlR","maxR","peak","trough"];
console.log("\n=== FIELD COVERAGE (live n=%d) ===", live.length);
for (const k of fld) {
  const v = live.map(t=>t[k]).filter(x=>!isNaN(x));
  console.log(k.padEnd(12), "n=", String(v.length).padStart(3), " min=", f(Math.min(...v)), " med=", f(med(v)), " max=", f(Math.max(...v)));
}
console.log("\n=== STRING FIELDS live ===");
for (const k of ["stoppedOut","riskSource","riskBasis"]) {
  const c={}; live.forEach(t=>c[t[k]||"(blank)"]=(c[t[k]||"(blank)"]||0)+1);
  console.log(k.padEnd(12), JSON.stringify(c));
}
console.log("\n=== PRACTICE coverage ===");
for (const k of fld) {
  const v = practice.map(t=>t[k]).filter(x=>!isNaN(x));
  console.log(k.padEnd(12), "n=", String(v.length).padStart(3), " med=", f(med(v)));
}
console.log("\n=== sample ladders (live, first 6 multi-entry) ===");
live.filter(t=>t.nEntries>1).slice(0,6).forEach(t=>{
  console.log(`\n${t.date} ${t.sym} nE=${t.nEntries} nX=${t.nExits} R=${f(t.risk)} pnlR=${f(t.pnlR)} posMFE=${f(t.posMFE)} cap%=${f(t.capturePct)} stopRaises=${t.stopRaises} stoppedOut=${t.stoppedOut}`);
  console.log("  EL:", t.entryLadder);
  console.log("  XL:", t.exitLadder);
  console.log("  SL:", t.stopLadder);
});
console.log("\n=== sample single-entry ===");
live.filter(t=>t.nEntries===1).slice(0,3).forEach(t=>{
  console.log(`\n${t.date} ${t.sym} nE=${t.nEntries} nX=${t.nExits} R=${f(t.risk)} pnlR=${f(t.pnlR)} posMFE=${f(t.posMFE)} cap%=${f(t.capturePct)}`);
  console.log("  EL:", t.entryLadder); console.log("  XL:", t.exitLadder); console.log("  SL:", t.stopLadder);
});
