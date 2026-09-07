const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, R, permP, bootCI } = L;

console.log("### countConsecutive() starts AT the entry bar and uses its CLOSE.");
console.log("### The entry bar closes AFTER entry -> look-ahead. Test it.\n");

for (const [bn, T] of [["LIVE", live], ["PRACTICE", practice]]) {
  console.log("=== " + bn + " ===");
  for (const [k, name, barMin] of [["n1m","#1m",1],["n5m","#5m",5],["n1h","#1H",60]]) {
    const z = T.filter(t=>t[k]===0), nz = T.filter(t=>t[k]>=1);
    console.log(st(z, name+"=0 (entry bar closed AGAINST)"));
    console.log(st(nz, name+">=1 (entry bar closed WITH)"));
    console.log("   permP=", f(permP(R(z),R(nz)),4));
    // among >=1: the genuinely PRIOR consecutive count is k-1 (knowable at entry)
    const a = nz.filter(t=>t[k]===1), b = nz.filter(t=>t[k]>=2);
    console.log("   -> lag-1 test WITHIN entry-bar-green: prior=0 vs prior>=1");
    console.log("      " + st(a, "      prior 0"));
    console.log("      " + st(b, "      prior>=1"));
    console.log("      permP=", f(permP(R(a),R(b)),4));
    console.log("");
  }
  // within-day constancy of #1H
  const d = L.byDay(T); let same=0, tot=0;
  Object.values(d).forEach(g=>{ const first = g.filter(t=>t.t < 10*3600+30*60);
    if (first.length>1){ tot++; if (new Set(first.map(t=>t.n1h)).size===1) same++; } });
  console.log("#1H constant within the 9:30-10:30 hour on " + same + "/" + tot + " days -> day-level variable");
  // is #1H just "the first hour closed green"?  cross-tab vs day R
  const dr = L.dayR(T); const dm = {}; dr.forEach(x=>dm[x.date]=x.r);
  const g0 = Object.values(d).filter(g=>g.some(t=>t.n1h===0)), g1 = Object.values(d).filter(g=>g.every(t=>t.n1h>=1));
  console.log("days with any #1H=0: n=" + g0.length + " meanDayR=" + f(mean(g0.map(g=>dm[g[0].date]))) +
              " | days all #1H>=1: n=" + g1.length + " meanDayR=" + f(mean(g1.map(g=>dm[g[0].date]))));
  console.log("");
}

// Does #5m == "the trade was still up when its 5-min bar closed"?  compare to duration.
console.log("=== #5m vs whether the trade was already resolved ===");
[["n5m",5],["n1h",60]].forEach(([k,bm])=>{
  const w = live.filter(t=>!isNaN(t.dur));
  console.log(k, "mean dur (mins):", "bar=" + bm,
    " entrybar-against:", f(mean(w.filter(t=>t[k]===0).map(t=>t.dur))),
    " entrybar-with:", f(mean(w.filter(t=>t[k]>=1).map(t=>t.dur))));
});
console.log("\nlive median duration (mins):", f(L.med(live.map(t=>t.dur))), " => most trades close BEFORE their 5m/1H bar does");
