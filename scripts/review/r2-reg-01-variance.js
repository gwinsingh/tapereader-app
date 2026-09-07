// TRACK 1 — VARIANCE FIRST. Is +19.4R distinguishable from a practice-era resample?
const L = require("./lib.js");
const { live, practice, R, sum, mean, med, sd, f, st, days, byDay, dayR, bootCI, permP } = L;

const lr = R(live), pr = R(practice);
const LSUM = sum(lr), PSUM = sum(pr);

console.log("=== 1.1 CONCENTRATION: how few trades carry the month ===");
const sorted = [...lr].sort((a,b)=>b-a);
console.log("live n(with R) =", lr.length, " sumR =", f(LSUM,1));
console.log("top 10 R:", sorted.slice(0,10).map(x=>f(x,2)).join("  "));
console.log("bot  5 R:", sorted.slice(-5).map(x=>f(x,2)).join("  "));
for (const k of [1,2,3,5,8]) {
  const rest = sorted.slice(k);
  console.log(`excl top ${k}: sumR=${f(sum(rest),1).padStart(7)}  n=${rest.length}  expR=${f(mean(rest))}`);
}
// which trades are they
const top5 = [...live].filter(t=>!isNaN(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR).slice(0,5);
console.log("\ntop-5 live trades:");
top5.forEach(t=>console.log(`  ${t.date} ${t.sym.padEnd(5)} R=${f(t.pnlR,2).padStart(6)} $=${f(t.pnl).padStart(8)} risk=$${f(t.risk)} nEnt=${t.nEntries} dur=${f(t.dur,0)}m posMFE=${f(t.posMFE,2)}`));
const topDays = {};
top5.forEach(t=>topDays[t.date]=(topDays[t.date]||0)+t.pnlR);
console.log("top-5 concentrated in days:", Object.entries(topDays).map(([d,r])=>`${d}:${f(r,1)}R`).join("  "));

// same for practice, for apples-to-apples
const psorted = [...pr].sort((a,b)=>b-a);
console.log("\npractice sumR =", f(PSUM,1), " n =", pr.length);
for (const k of [1,2,3,5,8]) console.log(`  excl top ${k}: sumR=${f(sum(psorted.slice(k)),1).padStart(7)}`);

console.log("\n=== 1.2 DAY-LEVEL CONCENTRATION ===");
const ld = dayR(live).sort((a,b)=>b.r-a.r);
ld.forEach(d=>console.log(`  ${d.date} n=${String(d.n).padStart(2)} R=${f(d.r,2).padStart(7)} $=${f(d.pnl).padStart(8)}`));
console.log("top 1 day =", f(ld[0].r,1), "R  =", f(ld[0].r/LSUM*100,0)+"% of month");
console.log("top 3 days =", f(sum(ld.slice(0,3).map(d=>d.r)),1), "R");
console.log("excl top day:", f(sum(ld.slice(1).map(d=>d.r)),1), "R over", ld.length-1, "sessions");
console.log("green days:", ld.filter(d=>d.r>0).length, "/", ld.length);

console.log("\n=== 1.3 BOOTSTRAP OF THE MONTH TOTAL ===");
function bootSum(arr, n, iters=20000) {
  const out=[];
  for (let i=0;i<iters;i++){ let s=0; for(let j=0;j<n;j++) s+=arr[(Math.random()*arr.length)|0]; out.push(s); }
  out.sort((a,b)=>a-b); return out;
}
const bl = bootSum(lr, lr.length);
console.log(`live month total, resampling its OWN trades (n=${lr.length}):`);
console.log(`  median=${f(bl[10000],1)}R  95% CI=[${f(bl[500],1)}, ${f(bl[19500],1)}]  P(total<=0)=${f(bl.filter(x=>x<=0).length/bl.length*100,1)}%`);

// session-block bootstrap of live itself (respects intraday correlation)
const lday = dayR(live);
function bootSumBlocks(dayArr, k, iters=20000) {
  const out=[];
  for(let i=0;i<iters;i++){ let s=0; for(let j=0;j<k;j++) s+=dayArr[(Math.random()*dayArr.length)|0].r; out.push(s); }
  out.sort((a,b)=>a-b); return out;
}
const blb = bootSumBlocks(lday, lday.length);
console.log(`live month total, resampling its own SESSIONS (k=${lday.length}):`);
console.log(`  median=${f(blb[10000],1)}R  95% CI=[${f(blb[500],1)}, ${f(blb[19500],1)}]  P(total<=0)=${f(blb.filter(x=>x<=0).length/blb.length*100,1)}%`);

console.log("\n=== 1.4 THE NULL: could the PRACTICE-ERA trader have produced +19.4R in 19 sessions? ===");
// (a) iid trade resample: draw 71 trades from the practice per-trade distribution
const nullTrade = bootSum(pr, lr.length, 50000);
const pA = nullTrade.filter(x=>x>=LSUM).length/nullTrade.length;
console.log(`(a) iid: draw ${lr.length} trades from practice distribution`);
console.log(`    median=${f(nullTrade[25000],1)}R  95%=[${f(nullTrade[1250],1)}, ${f(nullTrade[48750],1)}]  P(>= +19.4R) = ${f(pA*100,1)}%`);

// (b) session-block resample: draw 19 practice SESSIONS (whole days, preserving n-per-day + within-day corr)
const pday = dayR(practice);
const nullDay = bootSumBlocks(pday, lday.length, 50000);
const pB = nullDay.filter(x=>x>=LSUM).length/nullDay.length;
console.log(`(b) session-block: draw ${lday.length} whole practice sessions`);
console.log(`    median=${f(nullDay[25000],1)}R  95%=[${f(nullDay[1250],1)}, ${f(nullDay[48750],1)}]  P(>= +19.4R) = ${f(pB*100,1)}%`);

// (c) contiguous 19-session windows in practice (true sequential experience)
console.log(`(c) every contiguous 19-session window inside practice:`);
const pdays = pday;
const wins=[];
for(let i=0;i+19<=pdays.length;i++) wins.push({start:pdays[i].date, end:pdays[i+18].date, r:sum(pdays.slice(i,i+19).map(d=>d.r)), n:sum(pdays.slice(i,i+19).map(d=>d.n))});
wins.forEach(w=>console.log(`    ${w.start}->${w.end} n=${String(w.n).padStart(3)} R=${f(w.r,1).padStart(7)}`));
const pC = wins.filter(w=>w.r>=LSUM).length/wins.length;
console.log(`    windows>= +19.4R: ${wins.filter(w=>w.r>=LSUM).length}/${wins.length} = ${f(pC*100,0)}%   best=${f(Math.max(...wins.map(w=>w.r)),1)}R  worst=${f(Math.min(...wins.map(w=>w.r)),1)}R`);

console.log("\n=== 1.5 PER-TRADE DIFFERENCE TEST ===");
console.log("live expR ", f(mean(lr)), " CI", bootCI(lr).map(x=>f(x)).join(","));
console.log("prac expR ", f(mean(pr)), " CI", bootCI(pr).map(x=>f(x)).join(","));
console.log("permutation p (live vs practice per-trade R) =", f(permP(lr,pr,50000),4));
// day-level version (effective n = sessions)
const ldR = lday.map(d=>d.r), pdR = pday.map(d=>d.r);
console.log("\nday-level: live expR/day", f(mean(ldR),2), "CI", bootCI(ldR).map(x=>f(x)).join(","));
console.log("day-level: prac expR/day", f(mean(pdR),2), "CI", bootCI(pdR).map(x=>f(x)).join(","));
console.log("permutation p (day-level) =", f(permP(ldR,pdR,50000),4));

console.log("\n=== 1.6 WIN RATE & PAYOFF DECOMPOSITION ===");
for (const [nm,T] of [["live",live],["prac",practice]]) {
  const rs = R(T), w = rs.filter(x=>x>0), l = rs.filter(x=>x<=0);
  console.log(`${nm}: n=${rs.length} win%=${f(w.length/rs.length*100,0)} avgWin=${f(mean(w))}R medWin=${f(med(w))}R avgLoss=${f(mean(l))}R medLoss=${f(med(l))}R payoff=${f(mean(w)/Math.abs(mean(l)))}`);
  console.log(`      sd(R)=${f(sd(rs))}  maxWin=${f(Math.max(...rs))}R  maxLoss=${f(Math.min(...rs))}R`);
}
// Is the difference in the winners' tail or the losers' body?
const lw = lr.filter(x=>x>0), pw = pr.filter(x=>x>0), ll = lr.filter(x=>x<=0), pl = pr.filter(x=>x<=0);
console.log("perm p avgWin live vs prac =", f(permP(lw,pw,20000),4), ` (n=${lw.length} vs ${pw.length})`);
console.log("perm p avgLoss live vs prac =", f(permP(ll,pl,20000),4), ` (n=${ll.length} vs ${pl.length})`);
