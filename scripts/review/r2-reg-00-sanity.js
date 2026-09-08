const L = require("./lib.js");
const { live, practice, R, sum, mean, f, st, days } = L;

console.log("=== BASELINE SANITY ===");
console.log(st(live, "live"));
console.log(st(practice, "practice"));
console.log("live sessions:", days(live).length, days(live)[0], "->", days(live).slice(-1)[0]);
console.log("prac sessions:", days(practice).length, days(practice)[0], "->", days(practice).slice(-1)[0]);
console.log("live pnlR NaN:", live.filter(t=>isNaN(t.pnlR)).length);
console.log("prac pnlR NaN:", practice.filter(t=>isNaN(t.pnlR)).length);

console.log("\n=== HEADERS present ===");
console.log(live[0].hdr.join(" | "));

console.log("\n=== field coverage (live / practice) ===");
const fields = ["posMFE","maxR","nEntries","nExits","initRisk","maxRisk","entryLadder","stopRaises","stoppedOut","capturePct","vix","adr","atr","m30","rvol","gap","orSize","spy","riskSource","peak","trough"];
for (const fl of fields) {
  const cov = T => T.filter(t => { const v = t[fl]; return typeof v === "number" ? !isNaN(v) : v !== ""; }).length;
  console.log(fl.padEnd(14), "live", String(cov(live)).padStart(3)+"/"+live.length, " prac", String(cov(practice)).padStart(3)+"/"+practice.length);
}

console.log("\n=== risk source ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const c = {}; T.forEach(t => c[t.riskSource||"(blank)"]=(c[t.riskSource||"(blank)"]||0)+1);
  console.log(nm, JSON.stringify(c));
}

console.log("\n=== side ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const c = {}; T.forEach(t => c[t.side||"(blank)"]=(c[t.side||"(blank)"]||0)+1);
  console.log(nm, JSON.stringify(c));
}
