const L = require("./lib.js");
const f=L.f, sum=L.sum, mean=L.mean, med=L.med, R=L.R;
const mfe = t => { const a=isNaN(t.maxR)?-99:t.maxR, b=isNaN(t.pnlR)?-99:t.pnlR;
  return (isNaN(t.maxR)&&isNaN(t.pnlR))?NaN:Math.max(a,b,0); };
const hdr = s => console.log("\n"+"=".repeat(78)+"\n"+s+"\n"+"=".repeat(78));

hdr("PRE-REGISTERED HYPOTHESES ON LIVE ONLY");
const W = L.live.filter(t=>!isNaN(t.pnlR));

function H(name, T, fa, fb, la, lb) {
  const a=T.filter(fa), b=T.filter(fb);
  console.log(`\n${name}`);
  console.log(" ", L.st(a, la)); console.log(" ", L.st(b, lb));
  console.log(`  permP=${f(L.permP(R(a),R(b)),4)}  min cell n=${Math.min(a.length,b.length)} ${Math.min(a.length,b.length)<15?"<-- UNDERPOWERED":""}`);
  return [a,b];
}

H("H4  held >=5min vs <5min", W, t=>t.dur>=5, t=>t.dur<5, ">=5min", "<5min");
H("H5  >=3 partials vs <=2", W, t=>t.part>=3, t=>t.part<=2, ">=3 partials", "<=2 partials");
H("H7  RightTheory?=Yes vs No", W, t=>t.right==="Yes", t=>t.right==="No", "RightTheory=Yes", "RightTheory=No");
console.log("  RightTheory blank n=", L.live.filter(t=>t.right!=="Yes"&&t.right!=="No").length,
  "sumR=", f(sum(R(L.live.filter(t=>t.right!=="Yes"&&t.right!=="No"))),1), "(artifact #9 missing-not-at-random)");

// H7 opportunity control: is RightTheory just relabelling MFE?
console.log("\n H7 opportunity control (MFE-stratified):");
for (const [b,fn] of [["MFE<0.5",t=>mfe(t)<0.5],["MFE 0.5-2",t=>mfe(t)>=0.5&&mfe(t)<2],["MFE>=2",t=>mfe(t)>=2]]) {
  const a=W.filter(fn); const y=a.filter(t=>t.right==="Yes"), n=a.filter(t=>t.right==="No");
  console.log(`  ${b.padEnd(10)} Yes n=${String(y.length).padStart(2)} expR=${f(mean(R(y))).padStart(6)} | No n=${String(n.length).padStart(2)} expR=${f(mean(R(n))).padStart(6)} | permP=${f(L.permP(R(y),R(n)),3)}`);
}
console.log("  meanMFE  Yes:", f(mean(W.filter(t=>t.right==="Yes").map(mfe))), " No:", f(mean(W.filter(t=>t.right==="No").map(mfe))));
console.log("  medDur   Yes:", f(med(W.filter(t=>t.right==="Yes").map(t=>t.dur)),1), " No:", f(med(W.filter(t=>t.right==="No").map(t=>t.dur)),1));

// ---- H5 practice-side sanity for the MFE>=2 stratum
hdr("H5 SUPPORT: the only stratum where partials mattered in practice was MFE>=2");
const P=L.practice.filter(t=>!isNaN(t.pnlR)&&mfe(t)>=2);
console.log(" PRACTICE MFE>=2:", L.st(P.filter(t=>t.part<=2),"<=2"), "\n                ", L.st(P.filter(t=>t.part>=3),">=3"));
const Lv=W.filter(t=>mfe(t)>=2);
console.log(" LIVE     MFE>=2:", L.st(Lv.filter(t=>t.part<=2),"<=2"), "\n                ", L.st(Lv.filter(t=>t.part>=3),">=3"));

// ---- MAE endogeneity: MAE is only observable over the holding window
hdr("MAE ENDOGENEITY CHECK — deep MAE requires having held");
for (const [lab,T] of [["LIVE",L.live],["PRACTICE",L.practice]]) {
  const A=T.filter(t=>!isNaN(t.mae)&&!isNaN(t.dur));
  console.log(` ${lab}: corr(|MAE|, dur) via medians ->`);
  [["<2m",t=>t.dur<2],["2-5m",t=>t.dur>=2&&t.dur<5],["5-15m",t=>t.dur>=5&&t.dur<15],["15m+",t=>t.dur>=15]]
    .forEach(([b,fn])=>{const a=A.filter(fn); if(a.length)console.log(`   ${b.padEnd(6)} n=${String(a.length).padStart(3)} medMAE=${f(med(a.map(t=>t.mae)))} share MAE<=-1: ${f(a.filter(t=>t.mae<=-1).length/a.length*100,0)}%`);});
  const deep=A.filter(t=>t.mae<=-2);
  console.log(`   MAE<=-2: n=${deep.length} medDur=${f(med(deep.map(t=>t.dur)),1)} medMFE=${f(med(deep.map(mfe)))} syms=${[...new Set(deep.map(t=>t.sym))].join(",")}`);
  console.log(`   dates   : ${[...new Set(deep.map(t=>t.date))].join(", ")}`);
}

// ---- the 9 censored trades in detail
hdr("CENSORED maxR=0 WINNERS (live) — the enrichment's stop-gate zeroes these");
L.live.filter(t=>t.maxR===0&&t.pnlR>0.05).forEach(t=>
  console.log(`  ${t.date} ${t.sym.padEnd(6)} pnlR=${f(t.pnlR).padStart(5)} mae=${f(t.mae).padStart(5)} dur=${f(t.dur,1).padStart(6)} part=${t.part} risk=$${t.risk}`));

// ---- test count helper: enumerate the splits examined
hdr("SANITY: day-level concentration of the +23.1R");
L.dayR(L.live).forEach(d=>console.log(`  ${d.date} n=${String(d.n).padStart(2)} sumR=${f(d.r,1).padStart(6)}`));
