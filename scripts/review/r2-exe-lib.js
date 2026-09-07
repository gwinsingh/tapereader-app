/* Shared helpers for the r2 execution track. Ladder parsing + honest MFE benchmarks. */
const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const S = t => L.secs(t);

const pFill = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m=x.match(/^(\d+:\d+:\d+)@([\d.]+)x(\d+)$/); return m?{t:S(m[1]),ts:m[1],p:+m[2],q:+m[3]}:null;}).filter(Boolean);
const pStop = s => (s||"").split("|").map(x=>x.trim()).filter(Boolean).map(x=>{
  const m=x.match(/^(\d+:\d+:\d+)@([\d.]+)$/); return m?{t:S(m[1]),ts:m[1],p:+m[2]}:null;}).filter(Boolean);

/** Enrich one trade with ladder-derived fields. Long-only book, so signs assume long. */
function enrich(t){
  const E=pFill(t.entryLadder), X=pFill(t.exitLadder), P=pStop(t.stopLadder);
  const o = {...t, E, X, P, ok:false};
  if(!E.length||!X.length) return o;
  o.ok = true;
  const totSh = E.reduce((s,a)=>s+a.q,0);
  o.totSh = totSh;
  o.tEntryFirst = E[0].t; o.tEntryLast = E[E.length-1].t;
  o.tExitFirst  = X[0].t; o.tExitLast  = X[X.length-1].t;
  o.avgEnt = E.reduce((s,a)=>s+a.p*a.q,0)/totSh;
  o.lastEntP = E[E.length-1].p;

  // stops strictly inside the holding window (exclude the flatten-time reset the broker logs at exit)
  o.inTradeStops = P.filter(s=>s.t < o.tExitLast);
  o.maxStopInTrade = o.inTradeStops.length ? Math.max(...o.inTradeStops.map(s=>s.p)) : NaN;
  // stop in effect at the moment of the last entry (latest placement at or before it; +5s grace for the
  // broker writing the protective order immediately after the fill)
  const cand = P.filter(s=>s.t <= o.tEntryLast+5);
  o.stopAtLast = cand.length ? cand[cand.length-1].p : NaN;
  o.rPerShLast = o.lastEntP - o.stopAtLast;
  /** HIS target: 2.5R where R = dollar risk of the position as built at the last entry. */
  o.rDollarLast = isNaN(o.rPerShLast) ? NaN : totSh * o.rPerShLast;

  // price path facts recoverable without bars
  o.maxPostEntryPx = t.ent + (t.peak / t.sh);      // day-long session high after entry (see audit)
  o.bestExitPx = Math.max(...X.map(a=>a.p));
  /** In-window favourable excursion LOWER bound: price provably reached his best exit fill and
      every stop he placed while holding. Valued at final size. Conservative. */
  o.inWinPxLB = Math.max(o.bestExitPx, isNaN(o.maxStopInTrade)?-Infinity:o.maxStopInTrade);
  o.mfeLB_$ = totSh * (o.inWinPxLB - o.avgEnt);
  o.mfeLB_R = o.mfeLB_$ / t.initRisk;
  return o;
}

const enrichAll = T => T.map(enrich);
module.exports = { L, pFill, pStop, enrich, enrichAll };
