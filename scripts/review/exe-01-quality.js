const L = require("./lib.js");
const f = L.f;

// 1. pnlR rounding check
const bad = L.live.filter(t => !isNaN(t.pnlR) && !isNaN(t.risk) && Math.abs(t.pnlR - t.pnl/t.risk) > 0.06);
console.log("pnlR mismatch >0.06 (live):", bad.length);
const badP = L.practice.filter(t => !isNaN(t.pnlR) && !isNaN(t.risk) && Math.abs(t.pnlR - t.pnl/t.risk) > 0.06);
console.log("pnlR mismatch >0.06 (practice):", badP.length);

// 2. maxR censoring: is maxR==0 iff mae<=-1 ?
for (const [T, lab] of [[L.live,"LIVE"],[L.practice,"PRAC"]]) {
  const w = T.filter(t => !isNaN(t.maxR) && !isNaN(t.mae));
  console.log(`\n${lab}: n=${w.length}`);
  console.log("  maxR==0:", w.filter(t=>t.maxR===0).length,
    "| mae<=-1:", w.filter(t=>t.mae<=-1).length,
    "| maxR==0 & mae<=-1:", w.filter(t=>t.maxR===0 && t.mae<=-1).length,
    "| maxR==0 & mae>-1:", w.filter(t=>t.maxR===0 && t.mae>-1).length,
    "| maxR>0 & mae<=-1:", w.filter(t=>t.maxR>0 && t.mae<=-1).length);
  const cens = w.filter(t=>t.maxR===0 && t.pnlR>0.05);
  console.log("  CENSORED (maxR=0 but winner):", cens.length, "sumR=", f(L.sum(cens.map(t=>t.pnlR)),1));
}

// 3. Alternative offered measure from daily High
// stop distance in price
const sd = t => Math.abs(t.ent - t.stop);
const hR = t => (!isNaN(t.H) && !isNaN(t.ent) && !isNaN(t.stop) && sd(t)>0) ? (t.H - t.ent)/sd(t) : NaN;
for (const [T, lab] of [[L.live,"LIVE"],[L.practice,"PRAC"]]) {
  const w = T.filter(t=>!isNaN(hR(t)) && !isNaN(t.maxR));
  console.log(`\n${lab} dayHighR vs maxR: n=${w.length}`);
  const under = w.filter(t=>hR(t) < t.maxR - 0.15);
  console.log("  dayHighR < maxR (impossible-ish):", under.length, under.slice(0,5).map(t=>[t.date,t.sym,f(hR(t)),f(t.maxR)]));
  const cens = w.filter(t=>t.maxR===0 && t.pnlR>0.05);
  console.log("  censored trades dayHighR:", cens.map(t=>[t.date,t.sym,"pnlR="+f(t.pnlR),"dayHighR="+f(hR(t))]));
}

// 4. Stop distance check: is stop always ~1R away?
const w = L.live.filter(t=>!isNaN(t.stop)&&!isNaN(t.ent)&&!isNaN(t.risk)&&!isNaN(t.sh));
console.log("\nlive stop rows:", w.length, "implied R$ = sd*sh vs risk:",
  w.slice(0,6).map(t=>[t.sym, f(sd(t)*t.sh), t.risk]));

// 5. Partials semantics: part=2 means 1 entry + 1 exit? check vs dur
console.log("\nlive part vs dur median:");
[0,2,3,4,5,6,8].forEach(p=>{const a=L.live.filter(t=>t.part===p); if(a.length) console.log(" part="+p, "n="+a.length, "medDur="+f(L.med(a.map(t=>t.dur)),1), "medMaxR="+f(L.med(a.map(t=>t.maxR))));});

// 6. Date -> risk unit mapping (the natural experiment)
const byDate = {};
L.live.forEach(t => { (byDate[t.date] ||= new Set()).add(t.risk); });
console.log("\nlive date -> risk units:");
Object.keys(byDate).sort().forEach(d => console.log(" ", d, [...byDate[d]].join(",")));
