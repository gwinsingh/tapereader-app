const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, sd, R, permP, bootCI, byDay, days } = L;
const IDX=new Set(["SPY","QQQ","IWM","DIA","XLE","XLF","XLK","IGV","SMH"]),LEV=new Set(["SOXL","SQQQ","TQQQ","SOXS","SPXL","TNA","FNGU"]),
 MEGA=new Set(["AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","AMD","CRM","INTC","CSCO","ADBE","ORCL","NFLX","QCOM","TXN","INTU","NOW","MU","AMAT","COST","WMT","JPM","V","MA"]);
const cls=t=>LEV.has(t.sym)?"levETF":IDX.has(t.sym)?"indexETF":MEGA.has(t.sym)?"megacap":"other";

// ---- ARTIFACT #1 GUARD: is posMFE-in-R differing by class just a stop-width effect? ----
const sdADR=t=>(isNaN(t.firstEntry)||isNaN(t.initStop)||isNaN(t.adr)||!t.adr)?NaN:(t.firstEntry-t.initStop)/t.adr;
console.log("=== stop width by class (artifact #1 guard) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>t.nEntries===1&&!isNaN(sdADR(t))); const b={};
  w.forEach(t=>(b[cls(t)] ||= []).push(t));
  console.log("-- "+bn);
  Object.entries(b).sort().forEach(([k,a])=>console.log("   "+k.padEnd(9)+" n="+String(a.length).padStart(3)+
    " median stopDist/ADR="+f(med(a.map(sdADR)),3)+" median stopDist%="+f(med(a.map(t=>(t.firstEntry-t.initStop)/t.firstEntry*100)),3)));
}
// price-normalised offer: peak excursion in ADR units, independent of stop width
const offerADR=t=>{ if(isNaN(t.posMFE)||isNaN(sdADR(t))) return NaN; return t.posMFE*sdADR(t); }; // (peak/risk)*(risk/ADR)
console.log("\n=== OFFER in ADR units (stop-width free) — single-entry trades only ===");
let TESTS=0;
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>t.nEntries===1&&!isNaN(offerADR(t))); const b={};
  w.forEach(t=>(b[cls(t)] ||= []).push(t));
  console.log("-- "+bn+" n="+w.length);
  Object.entries(b).sort().forEach(([k,a])=>console.log("   "+k.padEnd(9)+" n="+String(a.length).padStart(3)+
    " median offer/ADR="+f(med(a.map(offerADR)),3)+" mean="+f(mean(a.map(offerADR)),3)));
  const etf=w.filter(t=>cls(t)==="indexETF"||cls(t)==="levETF"), sn=w.filter(t=>cls(t)!=="indexETF"&&cls(t)!=="levETF");
  console.log("   ETF vs single-name permP (offer/ADR) = "+f(permP(etf.map(offerADR),sn.map(offerADR)),4)+
    "   ("+etf.length+" vs "+sn.length+")"); TESTS++;
  const oth=w.filter(t=>cls(t)==="other"), rest=w.filter(t=>cls(t)!=="other");
  console.log("   'other' vs rest permP (offer/ADR)    = "+f(permP(oth.map(offerADR),rest.map(offerADR)),4)+
    "   ("+oth.length+" vs "+rest.length+")"); TESTS++;
}
// posMFE>=1R rate by ETF/single name, single-entry
console.log("\n=== %of trades whose position ever reached +1R (single-entry only) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const w=T.filter(t=>t.nEntries===1&&!isNaN(t.posMFE));
  const etf=w.filter(t=>cls(t)==="indexETF"||cls(t)==="levETF"), sn=w.filter(t=>cls(t)!=="indexETF"&&cls(t)!=="levETF");
  const rate=a=>a.filter(t=>t.posMFE>=1).length/a.length*100;
  console.log("  "+bn+" ETF n="+etf.length+" "+f(rate(etf),0)+"%  | single-name n="+sn.length+" "+f(rate(sn),0)+"%"+
    "  permP(posMFE)="+f(permP(etf.map(t=>t.posMFE),sn.map(t=>t.posMFE)),4)); TESTS++;
}

// ---- capture before/after the 08-21 peak ----
console.log("\n=== CAPTURE before/after the 08-21 peak ===");
const PEAK="2026-08-21";
for (const [lbl,g] of [["through 08-21",live.filter(t=>t.date<=PEAK)],["after 08-21",live.filter(t=>t.date>PEAK)]]) {
  const w=g.filter(t=>!isNaN(t.posMFE)&&!isNaN(t.pnlR)&&t.posMFE>0);
  console.log("  "+lbl.padEnd(15)+" n="+w.length+
    "  median realisedR/posMFE="+f(med(w.map(t=>t.pnlR/t.posMFE)),3)+
    "  median Capture%="+f(med(g.map(t=>t.capturePct).filter(x=>!isNaN(x))),3)+
    "  trades reaching +1R: "+f(w.filter(t=>t.posMFE>=1).length/w.length*100,0)+"%"+
    "  of those, closed green: "+f(w.filter(t=>t.posMFE>=1&&t.pnl>0).length/Math.max(1,w.filter(t=>t.posMFE>=1).length)*100,0)+"%");
}
{ const a=live.filter(t=>t.date<=PEAK&&!isNaN(t.dur)), b=live.filter(t=>t.date>PEAK&&!isNaN(t.dur));
  console.log("  duration permP="+f(permP(a.map(t=>t.dur),b.map(t=>t.dur)),4)+
    "  median dur before="+f(med(a.map(t=>t.dur)))+" after="+f(med(b.map(t=>t.dur))));
  const aw=a.filter(t=>t.posMFE>=1), bw=b.filter(t=>t.posMFE>=1);
  console.log("  among trades that reached +1R: green before="+aw.filter(t=>t.pnl>0).length+"/"+aw.length+
    "  after="+bw.filter(t=>t.pnl>0).length+"/"+bw.length); TESTS+=2; }

// last 4 sessions in detail
console.log("\n=== last 4 sessions, trade by trade ===");
live.filter(t=>t.date>PEAK).forEach(t=>console.log("  "+t.date+" "+t.entry.padStart(8)+" "+t.sym.padEnd(6)+
  " R="+f(t.pnlR).padStart(6)+" posMFE="+f(t.posMFE).padStart(6)+" dur="+f(t.dur).padStart(6)+
  " ent="+String(t.nEntries)+" proc="+(t.proc||"-").padEnd(5)+" notes="+(t.notes?"y":"n")));

// ---- H2/H3 with the corrected class list, plus concentration test ----
console.log("\n=== H2 / H3 final ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const b={}; T.forEach(t=>(b[cls(t)] ||= []).push(t));
  console.log("-- "+bn); ["indexETF","levETF","megacap","other"].forEach(k=>b[k]&&console.log(st(b[k],k)));
  const mg=T.filter(t=>cls(t)==="megacap");
  console.log("   H2 mega expR CI: ["+f(bootCI(R(mg))[0])+","+f(bootCI(R(mg))[1])+"]  permP vs rest="+f(permP(R(mg),R(T.filter(t=>cls(t)!=="megacap"))),4));
  const ix=T.filter(t=>cls(t)==="indexETF");
  console.log("   H3 index expR CI: ["+f(bootCI(R(ix))[0])+","+f(bootCI(R(ix))[1])+"] sumR="+f(sum(R(ix)),1));
  TESTS+=2;
}
console.log("\nMORE TESTS:",TESTS);
