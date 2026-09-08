const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const {live, practice, f, sum, mean, med, R} = L;

const parseL = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m = x.match(/^(\d+:\d+:\d+)@([\d.]+)x(\d+)$/); return m?{t:m[1],p:+m[2],q:+m[3]}:null;}).filter(Boolean);
const parseS = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m = x.match(/^(\d+:\d+:\d+)@([\d.]+)$/); return m?{t:m[1],p:+m[2]}:null;}).filter(Boolean);

console.log("=== does posMFE bound realised R? (live) ===");
let viol=0;
live.filter(t=>!isNaN(t.posMFE)&&!isNaN(t.pnlR)).forEach(t=>{
  if (t.pnlR > t.posMFE + 0.02) { viol++; console.log("  VIOLATION", t.date, t.sym, "pnlR",f(t.pnlR),"posMFE",f(t.posMFE)); }
});
console.log("violations:", viol, "of", live.filter(t=>!isNaN(t.posMFE)).length);

console.log("\n=== does maxR bound realised R? (live) — the OLD metric ===");
let v2=0; live.filter(t=>!isNaN(t.maxR)&&!isNaN(t.pnlR)).forEach(t=>{ if(t.pnlR>t.maxR+0.02) v2++; });
console.log("violations:", v2, "of", live.filter(t=>!isNaN(t.maxR)).length);

console.log("\n=== peak vs shares x daily-high excursion (is peak measured to 16:00 or to exit?) ===");
console.log("date       sym   sh nE  entry    exit    H       peak$   sh*(H-firstEnt)  peak/sh  H-firstEnt  exitExc/sh");
live.slice(0,20).forEach(t=>{
  const perSh = t.peak/t.sh, hExc = t.H - t.firstEntry;
  console.log(`${t.date} ${t.sym.padEnd(5)} ${String(t.sh).padStart(3)} ${t.nEntries}  ${f(t.ent)} ${f(t.ex)} ${f(t.H)} ${f(t.peak).padStart(7)} ${f(t.sh*hExc).padStart(8)}  ${f(perSh).padStart(6)} ${f(hExc).padStart(6)}  ${f(t.ex-t.ent)}`);
});

console.log("\n=== correlation checks: is peak/sh closer to (H-entry) or to (maxExit-entry)? ===");
let nH=0,nX=0;
live.filter(t=>t.nEntries===1 && !isNaN(t.peak)).forEach(t=>{
  const perSh=t.peak/t.sh, dH=Math.abs(perSh-(t.H-t.ent)), dX=Math.abs(perSh-(t.maxR*t.risk/t.sh));
  if(dH<dX) nH++; else nX++;
});
console.log("single-entry trades: closer-to-dailyHigh", nH, " closer-to-maxR", nX);

console.log("\n=== ladder parse coverage ===");
[["live",live],["practice",practice]].forEach(([nm,T])=>{
  const ok = T.filter(t=>parseL(t.entryLadder).length>0).length;
  const okx = T.filter(t=>parseL(t.exitLadder).length>0).length;
  const oks = T.filter(t=>parseS(t.stopLadder).length>0).length;
  console.log(nm, "n=",T.length," entryLadder parsed:",ok," exitLadder:",okx," stopLadder:",oks);
  // shares reconcile
  let mism=0; T.forEach(t=>{ const e=parseL(t.entryLadder), x=parseL(t.exitLadder);
    if(e.length&&x.length){ const se=sum(e.map(a=>a.q)), sx=sum(x.map(a=>a.q)); if(se!==sx) mism++; }});
  console.log("   entry/exit share mismatch:", mism);
});
