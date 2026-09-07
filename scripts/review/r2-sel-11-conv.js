const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, R, permP, bootCI, days, byDay } = L;
const all=[...practice.map(t=>({...t,book:"prac"})),...live.map(t=>({...t,book:"live"}))];
console.log("=== CONVICTION=1 pooled ===");
const c1=all.filter(t=>t.conv===1), c23=all.filter(t=>t.conv>=2);
console.log(st(c1,"conv=1 (both books)")); console.log(st(c23,"conv>=2 (both books)"));
console.log("permP =",f(permP(R(c1),R(c23)),4));
console.log("conv=1 win count:", c1.filter(t=>t.pnl>0).length+"/"+c1.length,
  " posMFE>=1R:", c1.filter(t=>t.posMFE>=1).length+"/"+c1.filter(t=>!isNaN(t.posMFE)).length,
  " vs conv>=2:", c23.filter(t=>t.posMFE>=1).length+"/"+c23.filter(t=>!isNaN(t.posMFE)).length);
console.log("permP on posMFE (did the market offer less?) =",
  f(permP(c1.map(t=>t.posMFE).filter(x=>!isNaN(x)),c23.map(t=>t.posMFE).filter(x=>!isNaN(x))),4));
console.log("\nconv coverage over time (live):");
days(live).forEach(k=>{const g=byDay(live)[k];console.log("  "+k+" "+g.filter(t=>!isNaN(t.conv)).length+"/"+g.length);});
console.log("\nlive conv=1 trades:");
live.filter(t=>t.conv===1).forEach(t=>console.log("  "+t.date+" "+t.sym.padEnd(6)+" R="+f(t.pnlR)+" posMFE="+f(t.posMFE)+" origin="+t.origin));
console.log("\n=== also: is conv confounded with instrument? ===");
const IDX=new Set(["SPY","QQQ","IWM","XLE","IGV","SMH"]);
["prac","live"].forEach(b=>{const T=all.filter(t=>t.book===b);
  console.log(b+" conv=1 share SPY/QQQ:", f(T.filter(t=>t.conv===1&&IDX.has(t.sym)).length/Math.max(1,T.filter(t=>t.conv===1).length)*100,0)+"%",
    " conv>=2:", f(T.filter(t=>t.conv>=2&&IDX.has(t.sym)).length/Math.max(1,T.filter(t=>t.conv>=2).length)*100,0)+"%");});
