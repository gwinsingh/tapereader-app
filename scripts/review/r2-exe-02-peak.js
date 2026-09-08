const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const {live, practice, f, sum, mean, med} = L;

// hypothesis: peak = shares * (maxPriceAfterEntry - avgEntry), maxPrice measured to 16:00
// for the FIRST trade in a symbol-day, maxPriceAfterEntry should == daily H
const key = t => t.date+"|"+t.sym;
function firstInSymDay(T){ const seen=new Set(), out=new Set();
  [...T].sort((a,b)=>a.date.localeCompare(b.date)||a.t-b.t).forEach(t=>{ if(!seen.has(key(t))){seen.add(key(t)); out.add(t);} });
  return out; }

[["LIVE",live],["PRACTICE",practice]].forEach(([nm,T])=>{
  const fs = firstInSymDay(T);
  let m=0,n=0,bad=[];
  T.filter(t=>fs.has(t)&&!isNaN(t.peak)&&!isNaN(t.H)&&t.sh>0).forEach(t=>{
    n++; const pred=t.sh*(t.H-t.ent); const rel=Math.abs(pred-t.peak)/Math.max(Math.abs(t.peak),1e-9);
    if(rel<0.02) m++; else bad.push(`${t.date} ${t.sym} pred=${f(pred)} act=${f(t.peak)} sh=${t.sh} H=${f(t.H)} ent=${f(t.ent)}`);
  });
  console.log(`${nm}: first-trade-of-symbol-day, peak == shares*(dailyH - avgEntry): ${m}/${n} match within 2%`);
  bad.slice(0,8).forEach(b=>console.log("   miss:",b));
});

console.log("\n=== IMPLICATION: peak counts price action AFTER the exit ===");
// stopped-out trades: peak should still be large if the day recovered
const so = live.filter(t=>t.stoppedOut==="Y"&&!isNaN(t.posMFE));
const nso= live.filter(t=>t.stoppedOut==="N"&&!isNaN(t.posMFE));
console.log("stopped out    n=",so.length," median posMFE=",f(med(so.map(t=>t.posMFE)))," max=",f(Math.max(...so.map(t=>t.posMFE))));
console.log("not stopped    n=",nso.length," median posMFE=",f(med(nso.map(t=>t.posMFE))));
console.log("\nshort holds (<2min) that still show big posMFE — proof the window is post-exit:");
live.filter(t=>t.dur<2&&t.posMFE>3).slice(0,12).forEach(t=>
  console.log(`  ${t.date} ${t.sym.padEnd(5)} dur=${f(t.dur,1)}min pnlR=${f(t.pnlR)} posMFE=${f(t.posMFE)} maxR=${f(t.maxR)} exitT=${t.exit}`));

console.log("\n=== derived: max price after entry, and stop-ladder high-water mark ===");
const parseS = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m=x.match(/^(\d+:\d+:\d+)@([\d.]+)$/); return m?{t:m[1],p:+m[2]}:null;}).filter(Boolean);
const parseE = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m=x.match(/^(\d+:\d+:\d+)@([\d.]+)x(\d+)$/); return m?{t:m[1],p:+m[2],q:+m[3]}:null;}).filter(Boolean);
let withRaiseAboveEntry=0;
live.forEach(t=>{ const st=parseS(t.stopLadder); if(!st.length) return;
  // exclude the final stop placement that coincides with the exit (often a reset/cancel artifact)
  const inTrade = st.filter(s=>L.secs(s.t) < t.tExit);
  const hi = Math.max(...inTrade.map(s=>s.p));
  if (hi > t.ent) withRaiseAboveEntry++;
});
console.log("live trades whose in-trade stop was raised ABOVE avg entry (locked-in profit):", withRaiseAboveEntry, "/", live.length);
