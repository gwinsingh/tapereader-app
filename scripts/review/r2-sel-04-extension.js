const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, R, permP, bootCI } = L;

// Extension = how far price had already travelled when he entered.
// Built TWICE: off blended `ent` (avg entry, the old way) and off `firstEntry` (clean).
function EXT(px) {
  return [
    ["ext: (entry-O)/ADR",        t => (isNaN(px(t))||isNaN(t.O)||isNaN(t.adr)||!t.adr) ? NaN : (px(t)-t.O)/t.adr],
    ["ext: (entry-O)/30mATR",     t => (isNaN(px(t))||isNaN(t.O)||isNaN(t.m30)||!t.m30) ? NaN : (px(t)-t.O)/t.m30],
    ["ext: (entry-O)/O %",        t => (isNaN(px(t))||isNaN(t.O)||!t.O) ? NaN : (px(t)-t.O)/t.O*100],
    ["ext: (entry-ORH)/ORsize",   t => (isNaN(px(t))||isNaN(t.orH)||isNaN(t.orSize)||!t.orSize) ? NaN : (px(t)-t.orH)/t.orSize],
    ["ext: (entry-ORH)/ADR",      t => (isNaN(px(t))||isNaN(t.orH)||isNaN(t.adr)||!t.adr) ? NaN : (px(t)-t.orH)/t.adr],
    ["ext: pos in OR",            t => (isNaN(px(t))||isNaN(t.orH)||isNaN(t.orL)||t.orH===t.orL) ? NaN : (px(t)-t.orL)/(t.orH-t.orL)],
    ["ext: %VWAP",                t => t.vwap],
    ["ext: %ATR travelled",       t => t.gapATR],
    ["ext: (entry-PDC)/ADR",      t => (isNaN(px(t))||isNaN(t.pdc)||isNaN(t.adr)||!t.adr) ? NaN : (px(t)-t.pdc)/t.adr],
    ["ext: (entry-PDH)/ADR",      t => (isNaN(px(t))||isNaN(t.pdh)||isNaN(t.adr)||!t.adr) ? NaN : (px(t)-t.pdh)/t.adr],
    ["ext: Dist 20 SMA",          t => t.d20],
    ["ext: Dist 50 SMA",          t => t.d50],
  ];
}
function split3(T, get, label) {
  const w = T.filter(t=>!isNaN(get(t)) && !isNaN(t.pnlR));
  if (w.length < 45) return null;
  const s = [...w].sort((a,b)=>get(a)-get(b));
  const k = Math.floor(s.length/3);
  const lo = s.slice(0,k), mid = s.slice(k, s.length-k), hi = s.slice(s.length-k);
  return { label, n:w.length, lo, mid, hi, p: permP(R(lo),R(hi)),
    elo: mean(R(lo)), emid: mean(R(mid)), ehi: mean(R(hi)),
    slo: sum(R(lo)), shi: sum(R(hi)), mono: (mean(R(lo))>mean(R(mid))&&mean(R(mid))>mean(R(hi))) ? "DECR" :
      (mean(R(lo))<mean(R(mid))&&mean(R(mid))<mean(R(hi))) ? "INCR" : "-" };
}
let tests = 0;
for (const [pxName, px] of [["avgEntry", t=>t.ent], ["firstEntry", t=>t.firstEntry]]) {
  for (const [bn, T] of [["prac", practice], ["live", live]]) {
    console.log("\n=== EXTENSION TERCILES — " + bn + " on " + pxName + " (least->most extended) ===");
    console.log("measure                     n   expR_lo  expR_mid expR_hi   trend    p       sumR_lo/hi");
    for (const [name, g] of EXT(px)) {
      const r = split3(T, g, name); if (!r) continue; tests++;
      console.log(name.padEnd(26), String(r.n).padStart(3), f(r.elo).padStart(8), f(r.emid).padStart(9),
        f(r.ehi).padStart(8), r.mono.padStart(7), f(r.p,4).padStart(7),
        ("  "+f(r.slo,1)+"/"+f(r.shi,1)).padStart(14));
    }
  }
}
console.log("\nEXTENSION TESTS:", tests);

// Does firstEntry differ materially from avg entry? (i.e. is the cleaner measure a different measure?)
console.log("\n=== firstEntry vs avg entry ===");
const w = live.filter(t=>!isNaN(t.firstEntry)&&!isNaN(t.ent)&&t.ent);
console.log("live n=" + w.length + " mean |firstEntry-avgEntry|/avgEntry % = " +
  f(mean(w.map(t=>Math.abs(t.firstEntry-t.ent)/t.ent*100)),4) +
  "   identical on " + w.filter(t=>Math.abs(t.firstEntry-t.ent)<1e-9).length + "/" + w.length);
const multi = w.filter(t=>t.nEntries>1);
console.log("multi-entry trades n=" + multi.length + " mean diff% = " +
  f(mean(multi.map(t=>Math.abs(t.firstEntry-t.ent)/t.ent*100)),4));
// correlation of the two extension series
const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
["(entry-O)/ADR","(entry-ORH)/ADR","pos in OR"].forEach(nm=>{
  const gA = EXT(t=>t.ent).find(e=>e[0].includes(nm))[1], gB = EXT(t=>t.firstEntry).find(e=>e[0].includes(nm))[1];
  const ww = live.filter(t=>!isNaN(gA(t))&&!isNaN(gB(t)));
  console.log("corr(avgEntry, firstEntry) for " + nm + " = " + f(corr(ww.map(gA), ww.map(gB)),4) + " (n=" + ww.length + ")");
});

// His actual rule is "don't chase the 3rd/5th minute candle" -> minute-of-entry extension proxy
console.log("\n=== 'don't chase a later candle' (his stated rule) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const b = { "9:30-9:35":[], "9:35-9:40":[], "9:40-9:50":[], "9:50+":[] };
  T.forEach(t=>{ const m=(t.t-9*3600-30*60)/60;
    if (isNaN(m)) return;
    b[m<5?"9:30-9:35":m<10?"9:35-9:40":m<20?"9:40-9:50":"9:50+"].push(t); });
  console.log("-- " + bn); Object.entries(b).forEach(([k,a])=>a.length&&console.log(st(a,k)));
}
