/* REGIME TRACK 1 — variance / small sample.
   Is +23.1R distinguishable from a lucky 19-session block of the practice distribution? */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, dayR, byDay, days } = L;

const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));

line("0. SANITY — headline numbers");
P(L.st(practice, "practice"));
P(L.st(live, "live"));
const lR = R(live), pR = R(practice);
P(`live  n=${live.length} sessions=${days(live).length} sumR=${f(sum(lR),2)} meanR=${f(mean(lR),3)} sdR=${f(sd(lR),3)}`);
P(`prac  n=${practice.length} sessions=${days(practice).length} sumR=${f(sum(pR),2)} meanR=${f(mean(pR),3)} sdR=${f(sd(pR),3)}`);
P(`live  R-coverage ${lR.length}/${live.length}   prac R-coverage ${pR.length}/${practice.length}`);
P(`live dates ${days(live)[0]} -> ${days(live).slice(-1)[0]}`);
P(`prac dates ${days(practice)[0]} -> ${days(practice).slice(-1)[0]}`);
// overlap check: 7/30 appears in both?
const ov = days(live).filter(d => days(practice).includes(d));
P(`overlapping dates: ${ov.join(", ") || "none"}`);

line("1A. HOW CONCENTRATED IS +23.1R? (drop top winners)");
const srt = [...lR].sort((a,b)=>b-a);
P(`top 10 R values: ${srt.slice(0,10).map(x=>f(x,2)).join(", ")}`);
P(`bottom 10      : ${srt.slice(-10).map(x=>f(x,2)).join(", ")}`);
const tot = sum(lR);
[0,1,2,3,5,8,10].forEach(k => {
  const rest = srt.slice(k);
  P(`drop top ${String(k).padStart(2)}: sumR=${f(sum(rest),2).padStart(7)}  meanR=${f(mean(rest),3).padStart(7)}  (removed ${f(tot-sum(rest),2)}R)`);
});
// what share of gross profit do top N winners hold
const wins = srt.filter(x=>x>0), losses = srt.filter(x=>x<=0);
P(`gross win R=${f(sum(wins),2)} (${wins.length} trades)  gross loss R=${f(sum(losses),2)} (${losses.length})`);
[1,2,3,5].forEach(k=>P(`  top ${k} winners = ${f(sum(srt.slice(0,k)),2)}R = ${f(sum(srt.slice(0,k))/sum(wins)*100,0)}% of gross profit`));

line("1B. SESSION-LEVEL R DISTRIBUTION (n=19)");
const ld = dayR(live), pd = dayR(practice);
ld.forEach(d => P(`  ${d.date}  n=${String(d.n).padStart(2)}  R=${f(d.r,2).padStart(7)}  $=${f(d.pnl,2).padStart(9)}`));
const ldR = ld.map(d=>d.r), pdR = pd.map(d=>d.r);
P(`live sessions: mean=${f(mean(ldR),3)} med=${f(med(ldR),3)} sd=${f(sd(ldR),3)} min=${f(Math.min(...ldR),2)} max=${f(Math.max(...ldR),2)}`);
P(`  positive sessions ${ldR.filter(x=>x>0).length}/${ldR.length}`);
P(`prac sessions: mean=${f(mean(pdR),3)} med=${f(med(pdR),3)} sd=${f(sd(pdR),3)} min=${f(Math.min(...pdR),2)} max=${f(Math.max(...pdR),2)}`);
P(`  positive sessions ${pdR.filter(x=>x>0).length}/${pdR.length}`);
const sd_srt=[...ldR].sort((a,b)=>b-a);
P(`live session R sorted: ${sd_srt.map(x=>f(x,1)).join(", ")}`);
[1,2,3].forEach(k=>P(`  drop top ${k} sessions: sumR=${f(sum(sd_srt.slice(k)),2)}`));

line("1C. BOOTSTRAP THE MONTH TOTAL");
// trade-level bootstrap of the sum over 71 draws
function bootSum(arr, n, iters=20000){
  const out=[]; for(let i=0;i<iters;i++){let s=0;for(let j=0;j<n;j++)s+=arr[(Math.random()*arr.length)|0];out.push(s);}
  out.sort((a,b)=>a-b); return out;
}
const bs = bootSum(lR, lR.length);
P(`trade-boot sumR 95% CI = [${f(bs[Math.floor(0.025*bs.length)],1)}, ${f(bs[Math.floor(0.975*bs.length)],1)}]  P(sum<=0)=${f(bs.filter(x=>x<=0).length/bs.length,3)}`);
// session-level (block) bootstrap — respects intra-day correlation
const bsd = bootSum(ldR, ldR.length);
P(`session-boot sumR 95% CI = [${f(bsd[Math.floor(0.025*bsd.length)],1)}, ${f(bsd[Math.floor(0.975*bsd.length)],1)}]  P(sum<=0)=${f(bsd.filter(x=>x<=0).length/bsd.length,3)}`);
const ciMean = bootCI(lR);
P(`live trade meanR 95% CI = [${f(ciMean[0],3)}, ${f(ciMean[1],3)}]`);
const ciMeanD = bootCI(ldR);
P(`live session meanR 95% CI = [${f(ciMeanD[0],3)}, ${f(ciMeanD[1],3)}]  (n=19 sessions)`);

line("1D. THE KEY TEST — resample practice into 19-session / 71-trade blocks");
// (a) IID trade resample: draw 71 trades from practice
function pTail(arr, n, target, iters=100000){
  let c=0, sums=[];
  for(let i=0;i<iters;i++){let s=0;for(let j=0;j<n;j++)s+=arr[(Math.random()*arr.length)|0];sums.push(s);if(s>=target)c++;}
  sums.sort((a,b)=>a-b);
  return {p:c/iters, med:sums[iters>>1], p95:sums[Math.floor(0.95*iters)], p99:sums[Math.floor(0.99*iters)]};
}
const TGT = tot;
const a = pTail(pR, 71, TGT);
P(`(a) IID trade resample of practice, 71 trades:`);
P(`    median sumR=${f(a.med,1)}  95th=${f(a.p95,1)}  99th=${f(a.p99,1)}   P(sumR >= ${f(TGT,1)}) = ${f(a.p*100,2)}%`);

// (b) session block resample — draw 19 whole practice sessions with replacement
const pSess = pd.map(d=>({r:d.r,n:d.n}));
function blockTail(sessions, k, target, iters=200000){
  let c=0; const sums=[], ns=[];
  for(let i=0;i<iters;i++){let s=0,nn=0;for(let j=0;j<k;j++){const x=sessions[(Math.random()*sessions.length)|0];s+=x.r;nn+=x.n;}sums.push(s);ns.push(nn);if(s>=target)c++;}
  sums.sort((x,y)=>x-y);
  return {p:c/iters,med:sums[iters>>1],p95:sums[Math.floor(0.95*iters)],p99:sums[Math.floor(0.99*iters)],
          lo:sums[Math.floor(0.025*iters)],hi:sums[Math.floor(0.975*iters)],meanN:mean(ns)};
}
const b = blockTail(pSess, 19, TGT);
P(`(b) SESSION-BLOCK resample of practice, 19 sessions (mean ${f(b.meanN,0)} trades):`);
P(`    median sumR=${f(b.med,1)}  95%CI=[${f(b.lo,1)},${f(b.hi,1)}]  95th=${f(b.p95,1)}  99th=${f(b.p99,1)}`);
P(`    P(19-session block from practice >= +${f(TGT,1)}R) = ${f(b.p*100,2)}%   <<<< THE KEY NUMBER`);

// (c) contiguous 19-session windows actually observed in practice
P(`(c) OBSERVED contiguous 19-session windows in practice (${pd.length} sessions -> ${pd.length-19+1} windows):`);
const wins19=[];
for(let i=0;i+19<=pd.length;i++){const w=pd.slice(i,i+19);wins19.push({s:pd[i].date,e:pd[i+18].date,r:sum(w.map(x=>x.r)),n:sum(w.map(x=>x.n))});}
wins19.sort((x,y)=>y.r-x.r);
P(`    best  : ${wins19[0].s}..${wins19[0].e}  sumR=${f(wins19[0].r,1)} (n=${wins19[0].n})`);
P(`    worst : ${wins19.slice(-1)[0].s}..${wins19.slice(-1)[0].e}  sumR=${f(wins19.slice(-1)[0].r,1)} (n=${wins19.slice(-1)[0].n})`);
P(`    median: ${f(med(wins19.map(w=>w.r)),1)}   #windows >= +${f(TGT,1)}R: ${wins19.filter(w=>w.r>=TGT).length}/${wins19.length}`);
P(`    all window sums: ${wins19.map(w=>f(w.r,0)).join(", ")}`);

// (d) permutation test practice vs live at trade level and session level
P(`(d) permutation p (trade-level meanR live vs practice) = ${f(permP(lR,pR),4)}`);
P(`    permutation p (session-level R live vs practice)   = ${f(permP(ldR,pdR),4)}`);

line("1E. WIN RATE / PAYOFF DECOMPOSITION");
function decomp(T,lbl){
  const r=R(T), w=r.filter(x=>x>0), l=r.filter(x=>x<=0);
  P(`${lbl.padEnd(10)} n=${r.length} win%=${f(w.length/r.length*100,1)} avgWin=${f(mean(w),2)} avgLoss=${f(mean(l),2)} ` +
    `payoff=${f(Math.abs(mean(w)/mean(l)),2)} medWin=${f(med(w),2)} medLoss=${f(med(l),2)} maxWin=${f(Math.max(...w),2)}`);
}
decomp(practice,"practice"); decomp(live,"live");
// win% by pnl$ (lib st uses pnl>0) vs pnlR>0 — check consistency
P(`live win% by $: ${f(live.filter(t=>t.pnl>0).length/live.length*100,1)}  by R: ${f(lR.filter(x=>x>0).length/lR.length*100,1)}`);
P(`prac win% by $: ${f(practice.filter(t=>t.pnl>0).length/practice.length*100,1)}  by R: ${f(pR.filter(x=>x>0).length/pR.length*100,1)}`);

// Is the avgWin change itself significant?
const lw=lR.filter(x=>x>0), pw=pR.filter(x=>x>0);
P(`avgWin live=${f(mean(lw),2)} (n=${lw.length}) vs practice=${f(mean(pw),2)} (n=${pw.length}) permP=${f(permP(lw,pw),4)}`);
const ll=lR.filter(x=>x<=0), pl=pR.filter(x=>x<=0);
P(`avgLoss live=${f(mean(ll),2)} (n=${ll.length}) vs practice=${f(mean(pl),2)} (n=${pl.length}) permP=${f(permP(ll,pl),4)}`);
const ciW=bootCI(lw), ciL=bootCI(ll);
P(`  live avgWin 95%CI=[${f(ciW[0],2)},${f(ciW[1],2)}]  live avgLoss 95%CI=[${f(ciL[0],2)},${f(ciL[1],2)}]`);
