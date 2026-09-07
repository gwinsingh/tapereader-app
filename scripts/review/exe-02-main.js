const L = require("./lib.js");
const f = L.f, sum = L.sum, mean = L.mean, med = L.med, R = L.R;

// ---- MFE handling -------------------------------------------------------
// `maxR` ("Max R Before Stop") is CENSORED: the enrichment stops walking bars
// the moment the stop price is touched, so a trade that dipped through the stop
// on a 1-min bar and then ran gets maxR = 0 even though he actually made money.
// A trade that REALISED x R was necessarily OFFERED at least x R, so we use
//   mfe = max(maxR, pnlR, 0)   -- a valid LOWER BOUND on what was offered.
const mfe = t => {
  const a = isNaN(t.maxR) ? NaN : t.maxR, b = isNaN(t.pnlR) ? NaN : t.pnlR;
  if (isNaN(a) && isNaN(b)) return NaN;
  return Math.max(isNaN(a) ? -99 : a, isNaN(b) ? -99 : b, 0);
};
const censored = t => t.maxR === 0 && t.pnlR > 0.05;
const has = t => !isNaN(mfe(t)) && !isNaN(t.pnlR);

const line = (lab, a) => console.log(L.st(a, lab));
const hdr = s => console.log("\n" + "=".repeat(78) + "\n" + s + "\n" + "=".repeat(78));

const books = [["LIVE", L.live], ["PRACTICE", L.practice]];

// ==== 1. MFE DECOMPOSITION ==============================================
hdr("1. MFE DECOMPOSITION  (offered vs realised)");
const BUCK = [
  ["<0.5R  ", t => mfe(t) < 0.5],
  ["0.5-1R ", t => mfe(t) >= 0.5 && mfe(t) < 1],
  ["1-2R   ", t => mfe(t) >= 1 && mfe(t) < 2],
  ["2-3R   ", t => mfe(t) >= 2 && mfe(t) < 3],
  ["3R+    ", t => mfe(t) >= 3],
];
for (const [lab, T] of books) {
  const W = T.filter(has);
  console.log(`\n--- ${lab} (n=${W.length} with MFE+R) total sumR=${f(sum(R(W)),1)} ---`);
  console.log("bucket   n    win%  meanMFE  meanReal  sumR     capture%");
  for (const [b, fn] of BUCK) {
    const a = W.filter(fn); if (!a.length) { console.log(b, "n=0"); continue; }
    const rs = R(a), ms = a.map(mfe);
    console.log(`${b} ${String(a.length).padStart(3)}${a.length<15?"*":" "} ${f(a.filter(t=>t.pnl>0).length/a.length*100,0).padStart(4)}% ` +
      `${f(mean(ms)).padStart(7)} ${f(mean(rs)).padStart(9)} ${f(sum(rs),1).padStart(7)} ` +
      `${f(sum(rs)/sum(ms)*100,0).padStart(7)}%`);
  }
  // concentration
  const s = [...W].sort((x,y)=>y.pnlR-x.pnlR), tot = sum(R(W));
  const cum = k => f(sum(s.slice(0,k).map(t=>t.pnlR)),1);
  console.log(`  concentration: top1=${cum(1)}R top3=${cum(3)}R top5=${cum(5)}R top10=${cum(10)}R  of total ${f(tot,1)}R`);
  const nPos = W.filter(t=>t.pnlR>0).length;
  console.log(`  winners=${nPos}; top5 winners = ${f(sum(s.slice(0,5).map(t=>t.pnlR))/tot*100,0)}% of sumR`);
  console.log(`  censored maxR=0-but-winner: n=${W.filter(censored).length} sumR=${f(sum(W.filter(censored).map(t=>t.pnlR)),1)}`);
}

// ==== 2. CAPTURE ========================================================
hdr("2. CAPTURE among trades that OFFERED >= target");
console.log("capture% = mean(min(realisedR, target)) / target, over trades with mfe >= target");
for (const [lab, T] of books) {
  const W = T.filter(has);
  console.log(`\n--- ${lab} ---`);
  console.log("target   n    capture%  meanReal  sumR    leftR(vs target)  hitTargetShare");
  for (const tgt of [1, 2, 2.5, 3]) {
    const a = W.filter(t => mfe(t) >= tgt); if (!a.length) continue;
    const capt = mean(a.map(t => Math.min(t.pnlR, tgt))) / tgt;
    const left = sum(a.map(t => tgt - Math.min(t.pnlR, tgt)));
    const hit = a.filter(t => t.pnlR >= tgt).length;
    console.log(`>=${String(tgt).padEnd(4)} ${String(a.length).padStart(3)}${a.length<15?"*":" "} ${f(capt*100,0).padStart(8)}% ` +
      `${f(mean(R(a))).padStart(9)} ${f(sum(R(a)),1).padStart(7)} ${f(left,1).padStart(10)}R ` +
      `${f(hit/a.length*100,0).padStart(12)}%`);
  }
}

// ==== 3. MAE ============================================================
hdr("3. MAE  — how far offside do eventual winners go?");
for (const [lab, T] of books) {
  const W = T.filter(t => !isNaN(t.mae) && !isNaN(t.pnlR));
  const win = W.filter(t=>t.pnlR>0), los = W.filter(t=>t.pnlR<=0);
  console.log(`\n--- ${lab} (n=${W.length}) ---`);
  console.log(`  winners n=${win.length}  meanMAE=${f(mean(win.map(t=>t.mae)))}  medMAE=${f(med(win.map(t=>t.mae)))}  minMAE=${f(Math.min(...win.map(t=>t.mae)))}`);
  console.log(`  losers  n=${los.length}  meanMAE=${f(mean(los.map(t=>t.mae)))}  medMAE=${f(med(los.map(t=>t.mae)))}`);
  console.log("  MAE bucket   n   win%  expR    sumR    P(win|MAE<=x)");
  const MB = [["0 to -0.25",t=>t.mae>-0.25],["-0.25 to -0.5",t=>t.mae<=-0.25&&t.mae>-0.5],
              ["-0.5 to -1",t=>t.mae<=-0.5&&t.mae>-1],["-1 to -2",t=>t.mae<=-1&&t.mae>-2],
              ["<= -2",t=>t.mae<=-2]];
  for (const [b,fn] of MB) { const a=W.filter(fn); if(!a.length) continue;
    console.log(`  ${b.padEnd(14)} ${String(a.length).padStart(3)}${a.length<15?"*":" "} ${f(a.filter(t=>t.pnlR>0).length/a.length*100,0).padStart(4)}% ${f(mean(R(a))).padStart(6)} ${f(sum(R(a)),1).padStart(7)}`); }
  // recovery curve
  console.log("  recovery: among trades reaching MAE<=x, share that ended positive");
  for (const x of [0.25,0.5,0.75,1,1.5,2,3]) {
    const a = W.filter(t=>t.mae<=-x); if(!a.length) continue;
    console.log(`    MAE<=-${String(x).padEnd(4)} n=${String(a.length).padStart(3)}${a.length<15?"*":" "} win%=${f(a.filter(t=>t.pnlR>0).length/a.length*100,0).padStart(3)} expR=${f(mean(R(a))).padStart(6)} sumR=${f(sum(R(a)),1).padStart(7)}`);
  }
}

hdr("3b. STOP-LEVEL COUNTERFACTUALS  (trade with mae<=-X exits at -X, else unchanged)");
for (const [lab, T] of books) {
  const W = T.filter(t => !isNaN(t.mae) && !isNaN(t.pnlR));
  console.log(`\n--- ${lab} (n=${W.length}) actual sumR=${f(sum(R(W)),1)} expR=${f(mean(R(W)))} ---`);
  console.log("stop    sumR     expR    delta_sumR   nTriggered  95%CI(expR)");
  for (const X of [0.3,0.4,0.5,0.6,0.75,1.0,1.25]) {
    const sim = W.map(t => t.mae <= -X ? -X : t.pnlR);
    const ci = L.bootCI(sim);
    console.log(`-${String(X).padEnd(5)} ${f(sum(sim),1).padStart(7)} ${f(mean(sim)).padStart(7)} ${f(sum(sim)-sum(R(W)),1).padStart(11)} ` +
      `${String(W.filter(t=>t.mae<=-X).length).padStart(10)}  [${f(ci[0])},${f(ci[1])}]`);
  }
  console.log(`ACTUAL  ${f(sum(R(W)),1).padStart(7)} ${f(mean(R(W))).padStart(7)}`);
}
