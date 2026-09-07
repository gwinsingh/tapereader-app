const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, sum, mean, R, f, permP, bootCI } = L;

// ---- instrument classification ----
const INDEX_ETF = new Set(["SPY","QQQ","IWM","DIA","XLE","XLF","XLK","IGV","SMH","XBI","ARKK"]);
const LEV_ETF   = new Set(["SOXL","SQQQ","TQQQ","SOXS","SPXL","TNA","LABU","FNGU","UVXY","NUGT"]);
const MEGA      = new Set(["AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","BRK.B","JPM","LLY","V","UNH","XOM","WMT","MA","JNJ","PG","ORCL","HD","COST","NFLX","AMD","CRM","INTC","CSCO","ADBE","PEP","KO","BAC","QCOM","TXN","INTU","NOW","MU","AMAT"]);
const cls = t => LEV_ETF.has(t.sym) ? "levETF" : INDEX_ETF.has(t.sym) ? "indexETF" : MEGA.has(t.sym) ? "megacap" : "other";

for (const [name, T] of [["LIVE", live], ["PRACTICE", practice]]) {
  console.log("\n=== INSTRUMENT CLASS — " + name + " ===");
  const b = {}; T.forEach(t => (b[cls(t)] ||= []).push(t));
  for (const k of ["indexETF","levETF","megacap","other"]) if (b[k]) console.log(st(b[k], k));
  // ETF (any) vs single name
  const etf = T.filter(t => cls(t)==="indexETF"||cls(t)==="levETF");
  const sn  = T.filter(t => cls(t)==="megacap"||cls(t)==="other");
  console.log(st(etf,"ETF (idx+lev)")); console.log(st(sn,"single names"));
  console.log("  permP ETF vs single:", f(permP(R(etf), R(sn)),4));
  // H2 mega vs non-mega
  const mg = T.filter(t=>cls(t)==="megacap"), nm = T.filter(t=>cls(t)!=="megacap");
  console.log("  H2 permP mega vs rest:", f(permP(R(mg), R(nm)),4));
  // H3 index ETF ~ zero: CI of index ETF
  if (b.indexETF) { const ci = bootCI(R(b.indexETF));
    console.log("  H3 indexETF expR CI = [" + f(ci[0]) + "," + f(ci[1]) + "] sumR=" + f(sum(R(b.indexETF)),1)); }
}

// ---- SPY/QQQ concentration in live ----
console.log("\n=== CONCENTRATION (live) ===");
const sq = live.filter(t=>t.sym==="SPY"||t.sym==="QQQ");
console.log(st(sq, "SPY+QQQ"));
console.log(st(live.filter(t=>t.sym!=="SPY"&&t.sym!=="QQQ"), "everything else"));
console.log("  permP:", f(permP(R(sq), R(live.filter(t=>t.sym!=="SPY"&&t.sym!=="QQQ"))),4));
const nSym = new Set(live.map(t=>t.sym)).size;
console.log("distinct symbols live:", nSym, "of", live.length, "trades; HHI=",
  f(sum(Object.values(live.reduce((a,t)=>{a[t.sym]=(a[t.sym]||0)+1;return a;},{})).map(c=>(c/live.length)**2)),3));
console.log("practice distinct:", new Set(practice.map(t=>t.sym)).size, "of", practice.length);

// leave-one-symbol-out on live total
console.log("\n=== LEAVE-ONE-SYMBOL-OUT (live sumR, total=" + f(sum(R(live)),1) + ") ===");
const syms = [...new Set(live.map(t=>t.sym))];
syms.map(s => ({s, r: sum(R(live.filter(t=>t.sym!==s))), n: live.filter(t=>t.sym===s).length}))
  .sort((a,b)=>a.r-b.r).slice(0,8).forEach(x=>console.log("  w/o "+x.s.padEnd(6)+" n="+String(x.n).padStart(2)+"  sumR="+f(x.r,1).padStart(6)));

// leave-one-TRADE-out: top contributors
console.log("\n=== TOP 8 / BOTTOM 5 TRADES BY R (live) ===");
[...live].filter(t=>!isNaN(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR).slice(0,8)
  .forEach(t=>console.log("  "+t.date+" "+t.sym.padEnd(6)+" R="+f(t.pnlR).padStart(6)+" posMFE="+f(t.posMFE).padStart(6)+" ent="+t.entry));
[...live].filter(t=>!isNaN(t.pnlR)).sort((a,b)=>a.pnlR-b.pnlR).slice(0,5)
  .forEach(t=>console.log("  "+t.date+" "+t.sym.padEnd(6)+" R="+f(t.pnlR).padStart(6)+" posMFE="+f(t.posMFE).padStart(6)+" ent="+t.entry));

// ---- 21-variable screen: discover on practice, confirm on live ----
const VARS = [
  ["gap","%Gap"],["gapATR","%ATR"],["rvol","RVOL"],["float","Float"],["advol","Avg $ Vol"],
  ["adr","ADR"],["atr","ATR"],["m30","30mATR"],["orSize","OR Size ($)"],["orATR","OR %ATR"],
  ["pcl","Prior Close Loc"],["d20","Dist 20 SMA"],["d50","Dist 50 SMA"],["vwap","%VWAP"],
  ["bvr","Breakout Vol Ratio"],["vix","VIX"],["n1m","#1m"],["n5m","#5m"],["n1h","#1H"],
  ["conv","Conviction"],["dC","Daily Conv"],
];
// derived: ADR%, distance to PDH/PDC/PDL as % of ADR
const derive = t => ({
  adrPct: (isNaN(t.adr)||isNaN(t.ent)||!t.ent) ? NaN : t.adr/t.ent*100,
  dPDH:  (isNaN(t.pdh)||isNaN(t.firstEntry)||isNaN(t.adr)||!t.adr) ? NaN : (t.firstEntry-t.pdh)/t.adr,
  dPDC:  (isNaN(t.pdc)||isNaN(t.firstEntry)||isNaN(t.adr)||!t.adr) ? NaN : (t.firstEntry-t.pdc)/t.adr,
  dPDL:  (isNaN(t.pdl)||isNaN(t.firstEntry)||isNaN(t.adr)||!t.adr) ? NaN : (t.firstEntry-t.pdl)/t.adr,
  orPos: (isNaN(t.orH)||isNaN(t.orL)||isNaN(t.firstEntry)||t.orH===t.orL) ? NaN : (t.firstEntry-t.orL)/(t.orH-t.orL),
  riskPct: (isNaN(t.risk)||isNaN(t.sh)||isNaN(t.firstEntry)) ? NaN : NaN,
  stopDistPct: (isNaN(t.firstEntry)||isNaN(t.initStop)||!t.firstEntry) ? NaN : (t.firstEntry-t.initStop)/t.firstEntry*100,
  stopDistADR: (isNaN(t.firstEntry)||isNaN(t.initStop)||isNaN(t.adr)||!t.adr) ? NaN : (t.firstEntry-t.initStop)/t.adr,
});
const DVARS = [["adrPct","ADR %"],["dPDH","dist PDH (ADR)"],["dPDC","dist PDC (ADR)"],["dPDL","dist PDL (ADR)"],
  ["orPos","entry pos in OR"],["stopDistPct","stop dist %"],["stopDistADR","stop dist / ADR"]];

function medSplit(T, get, label, book) {
  const w = T.filter(t=>!isNaN(get(t)));
  if (w.length < 30) return null;
  const m = L.med(w.map(get));
  const lo = w.filter(t=>get(t) <  m), hi = w.filter(t=>get(t) >= m);
  if (lo.length < 15 || hi.length < 15) return null;
  const p = permP(R(lo), R(hi));
  return { label, book, m, nlo: lo.length, nhi: hi.length,
    elo: mean(R(lo)), ehi: mean(R(hi)), slo: sum(R(lo)), shi: sum(R(hi)), p,
    dir: mean(R(hi)) > mean(R(lo)) ? "hi>lo" : "lo>hi" };
}

console.log("\n=== 28-VARIABLE MEDIAN SPLIT SCREEN ===");
console.log("var                        book      thresh    n_lo/n_hi   expR_lo  expR_hi   dir     p");
const results = [];
for (const [k, name] of VARS) {
  for (const [bn, T] of [["prac", practice],["live", live]]) {
    const r = medSplit(T, t=>t[k], name, bn); if (!r) { continue; }
    results.push(r);
    console.log(name.padEnd(22), bn.padEnd(6), f(r.m,3).padStart(9), (r.nlo+"/"+r.nhi).padStart(9),
      f(r.elo).padStart(9), f(r.ehi).padStart(9), r.dir.padStart(7), f(r.p,4).padStart(7));
  }
}
for (const [k, name] of DVARS) {
  for (const [bn, T] of [["prac", practice],["live", live]]) {
    const r = medSplit(T, t=>derive(t)[k], name, bn); if (!r) continue;
    results.push(r);
    console.log(name.padEnd(22), bn.padEnd(6), f(r.m,3).padStart(9), (r.nlo+"/"+r.nhi).padStart(9),
      f(r.elo).padStart(9), f(r.ehi).padStart(9), r.dir.padStart(7), f(r.p,4).padStart(7));
  }
}
console.log("\nTOTAL SPLIT TESTS:", results.length);
console.log("p<0.05:", results.filter(r=>r.p<0.05).length, "| p<0.10:", results.filter(r=>r.p<0.10).length,
  "| expected by chance at .05:", f(results.length*0.05,1));
console.log("\nsignificant (p<0.10):");
results.filter(r=>r.p<0.10).forEach(r=>console.log("  "+r.label.padEnd(22)+r.book+" p="+f(r.p,4)+" "+r.dir+" ("+f(r.elo)+" vs "+f(r.ehi)+")"));

// out-of-sample agreement: for each var tested in both books, does direction agree?
console.log("\n=== DIRECTION AGREEMENT prac -> live ===");
const byLbl = {}; results.forEach(r => (byLbl[r.label] ||= {})[r.book] = r);
let agree=0, tot=0;
Object.entries(byLbl).forEach(([lbl,o]) => { if (o.prac && o.live) { tot++;
  const a = o.prac.dir === o.live.dir; if (a) agree++;
  console.log("  "+lbl.padEnd(22)+" prac "+o.prac.dir+" ("+f(o.prac.p,3)+")  live "+o.live.dir+" ("+f(o.live.p,3)+")  "+(a?"AGREE":"flip")); }});
console.log("agreement:", agree+"/"+tot, "(coin flip expects "+f(tot/2,1)+")");
