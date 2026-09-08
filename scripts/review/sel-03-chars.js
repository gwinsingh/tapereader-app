/* SELECTION — Section 3 (pre-trade characteristics), 5 (catalyst/origin), 6 (MTF) */
const L = require("./lib.js");
function enrich(T){T.forEach(t=>{
  t.adrPct = t.adr / t.ent * 100;          // ADR as % of price
  t.atrPct = t.atr / t.ent * 100;
  t.orADR  = t.orSize / t.adr;             // OR size in ADR units
  t.or30   = t.orSize / t.m30;
  t.logFloat = Math.log10(t.float);
  t.logAdv   = Math.log10(t.advol);
  t.pdhD   = (t.ent - t.pdh) / t.atr;      // above prior-day high, ATR units
  t.pdcD   = (t.ent - t.pdc) / t.atr;
  t.pdlD   = (t.ent - t.pdl) / t.atr;
  t.abovePDH = t.ent > t.pdh ? 1 : 0;
  t.stopD  = Math.abs(t.ent - t.stop);
  t.mfeOK  = !isNaN(t.maxR)&&!isNaN(t.pnlR)&&t.maxR>=t.pnlR-0.05;
});}
enrich(L.live); enrich(L.practice);

const VARS = ["gap","gapATR","rvol","logFloat","logAdv","adrPct","atrPct","atr","adr","orSize",
              "orATR","orADR","or30","pcl","d20","d50","vwap","pdhD","pdcD","pdlD","bvr"];

let TESTS = 0;
console.log("=== 3.1 DISCOVERY on PRACTICE (median splits, n=248) ===");
const survivors = [];
VARS.forEach(f => {
  const v = L.practice.filter(t=>isFinite(t[f]));
  if (v.length < 40) { console.log(`  ${f}: n=${v.length} skipped`); return; }
  const m = L.med(v.map(t=>t[f]));
  const lo = v.filter(t=>t[f]<=m), hi = v.filter(t=>t[f]>m);
  const p = L.permP(L.R(lo), L.R(hi)); TESTS++;
  const d = L.mean(L.R(hi)) - L.mean(L.R(lo));
  const flag = p < 0.10 ? "  <== survives p<0.10" : "";
  console.log(`  ${f.padEnd(9)} med=${L.f(m,3).padStart(8)}  lo n=${lo.length} expR=${L.f(L.mean(L.R(lo))).padStart(6)}  hi n=${hi.length} expR=${L.f(L.mean(L.R(hi))).padStart(6)}  diff=${L.f(d).padStart(6)}  p=${L.f(p,3)}${flag}`);
  if (p < 0.10) survivors.push({f, m, dir: d > 0 ? "hi" : "lo"});
});

console.log("\n=== 3.2 CONFIRM survivors on LIVE (out-of-sample, practice-derived cut) ===");
if (!survivors.length) console.log("  none survived p<0.10 on practice.");
survivors.forEach(s => {
  const v = L.live.filter(t=>isFinite(t[s.f]));
  const lo = v.filter(t=>t[s.f]<=s.m), hi = v.filter(t=>t[s.f]>s.m);
  const p = L.permP(L.R(lo), L.R(hi)); TESTS++;
  console.log(`  ${s.f} (practice cut ${L.f(s.m,3)}, practice favoured "${s.dir}")`);
  console.log("    " + L.st(lo, "<= cut"));
  console.log("    " + L.st(hi, ">  cut"));
  console.log("    p=" + L.f(p,3));
});

console.log("\n=== 3.3 SAME median splits run on LIVE directly (in-sample; multiple-testing exposed) ===");
VARS.forEach(f => {
  const v = L.live.filter(t=>isFinite(t[f]));
  if (v.length < 30) { console.log(`  ${f.padEnd(9)} n=${v.length} UNDERPOWERED-skip`); return; }
  const m = L.med(v.map(t=>t[f]));
  const lo = v.filter(t=>t[f]<=m), hi = v.filter(t=>t[f]>m);
  const p = L.permP(L.R(lo), L.R(hi)); TESTS++;
  const ciL = L.bootCI(L.R(lo)), ciH = L.bootCI(L.R(hi));
  console.log(`  ${f.padEnd(9)} med=${L.f(m,3).padStart(9)}  lo n=${lo.length} expR=${L.f(L.mean(L.R(lo))).padStart(6)} [${L.f(ciL[0])},${L.f(ciL[1])}]  hi n=${hi.length} expR=${L.f(L.mean(L.R(hi))).padStart(6)} [${L.f(ciH[0])},${L.f(ciH[1])}]  p=${L.f(p,3)}${p<0.05?"  <== p<0.05":""}`);
});

console.log("\n=== 5. CATALYST & ORIGIN ===");
function cat(T, name) {
  console.log(`-- ${name} catalyst --`);
  const g = {}; T.forEach(t => (g[t.cat||"(blank)"] ||= []).push(t));
  Object.entries(g).sort((a,b)=>b[1].length-a[1].length).forEach(([k,v]) => console.log("   " + L.st(v,k)));
  const filled = T.filter(t=>t.cat), blank = T.filter(t=>!t.cat);
  console.log("   " + L.st(filled,"ANY catalyst logged"));
  console.log("   " + L.st(blank, "no catalyst logged"));
  console.log("   p=" + L.f(L.permP(L.R(filled),L.R(blank)),3)); TESTS++;
  console.log(`-- ${name} origin --`);
  const o = {}; T.forEach(t => (o[t.origin||"(blank)"] ||= []).push(t));
  Object.entries(o).sort((a,b)=>b[1].length-a[1].length).forEach(([k,v]) => console.log("   " + L.st(v,k)));
  const w = T.filter(t=>t.origin==="Watchlist"), i = T.filter(t=>t.origin==="Intraday discovery");
  console.log("   p(Watchlist vs Intraday)=" + L.f(L.permP(L.R(w),L.R(i)),3)); TESTS++;
}
cat(L.live,"LIVE"); cat(L.practice,"PRACTICE");

console.log("\n=== 6. MTF ALIGNMENT ===");
function mtf(T, name) {
  console.log(`-- ${name} --`);
  const has = T.filter(t=>t.dT && t.hT && t.mT);
  console.log(`   rows with all three trend reads: ${has.length}/${T.length}`);
  const alignBull = has.filter(t=>t.dT==="Bullish"&&t.hT==="Bullish"&&t.mT==="Bullish");
  const notAll    = has.filter(t=>!(t.dT==="Bullish"&&t.hT==="Bullish"&&t.mT==="Bullish"));
  console.log("   " + L.st(alignBull,"all 3 Bullish"));
  console.log("   " + L.st(notAll,   "not all 3 Bullish"));
  console.log("   p=" + L.f(L.permP(L.R(alignBull),L.R(notAll)),3)); TESTS++;
  // daily+1H (his stated rule)
  const dh = has.filter(t=>t.dT==="Bullish"&&t.hT==="Bullish"), ndh = has.filter(t=>!(t.dT==="Bullish"&&t.hT==="Bullish"));
  console.log("   " + L.st(dh, "Daily+1H both Bullish"));
  console.log("   " + L.st(ndh,"not both"));
  console.log("   p=" + L.f(L.permP(L.R(dh),L.R(ndh)),3)); TESTS++;
  // conviction sum
  const cs = has.filter(t=>isFinite(t.dC)&&isFinite(t.hC)&&isFinite(t.mC));
  if (cs.length >= 10) {
    cs.forEach(t=>t.convSum = t.dC+t.hC+t.mC);
    const m = L.med(cs.map(t=>t.convSum));
    const lo = cs.filter(t=>t.convSum<=m), hi = cs.filter(t=>t.convSum>m);
    console.log(`   MTF conviction sum median=${m}`);
    console.log("   " + L.st(lo,"<= med")); console.log("   " + L.st(hi,">  med"));
    console.log("   p=" + L.f(L.permP(L.R(lo),L.R(hi)),3)); TESTS++;
  }
  // L2 bias
  const l2 = {}; T.forEach(t=>(l2[t.l2||"(blank)"] ||= []).push(t));
  Object.entries(l2).sort((a,b)=>b[1].length-a[1].length).forEach(([k,v])=>console.log("   L2 " + L.st(v,k)));
  // conviction (1-3)
  const cv = {}; T.filter(t=>isFinite(t.conv)).forEach(t=>(cv[t.conv] ||= []).push(t));
  Object.entries(cv).sort().forEach(([k,v])=>console.log("   Conviction=" + L.st(v,k)));
}
mtf(L.live,"LIVE"); mtf(L.practice,"PRACTICE");

console.log("\nTESTS counted in this script:", TESTS);
