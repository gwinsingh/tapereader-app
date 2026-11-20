// Market-drops study: the catalogue of drops and of the rallies inside them.
//
// DROP (episode): the index closes at least `minDepth` % below its highest close of the last 252 sessions.
//   peak   = that 52-week closing high
//   low    = the lowest close before the index makes a new 52-week closing high
//   end    = the first new 52-week closing high after the low ("recovered" in the sense that the market is trending up again)
//   An episode still running at the end of the data has open = true.
// SWING: inside an episode, closes are cut into legs by a zigzag: a leg ends when the close moves `rev` % the other way.
//   A RALLY is an up-leg; its start is a swing low. It FAILED when a later close in the same episode went under that swing low;
//   the rally that starts at the episode low is THE TURN (it held).
const L = require("./lib.js");

/** episodes on a bar array. returns [{peakI, lowI, endI, peak, low, end, depth, daysToLow, daysToEnd, open}] (indices into B) */
function episodes(B, minDepth = 10, look = 252) {
  const c = B.map(b => b.c), out = []; let i = look;
  const hi = L.rollMax(c, look);
  while (i < c.length) {
    if (c[i] <= hi[i] * (1 - minDepth / 100)) {
      // peak = the day of the 52-week high in force
      let peakI = i; for (let j = i; j >= Math.max(0, i - look + 1); j--) if (c[j] === hi[i]) { peakI = j; break; }
      // walk forward to the first NEW 52-week closing high (a close that is the max of the last `look` closes) after the low
      let lowI = i, endI = -1;
      for (let j = i + 1; j < c.length; j++) { if (c[j] < c[lowI]) lowI = j; if (c[j] >= hi[j] && j - lowI >= 1 && c[j] > c[lowI] * 1.0001 && hi[j] === c[j]) { endI = j; break; } }
      // the low must be the minimum between peak and end
      const stop = endI < 0 ? c.length - 1 : endI; lowI = peakI; for (let j = peakI; j <= stop; j++) if (c[j] < c[lowI]) lowI = j;
      out.push({ peakI, lowI, endI, peak: B[peakI].d, low: B[lowI].d, end: endI < 0 ? null : B[endI].d, depth: (c[lowI] / c[peakI] - 1) * 100, daysToLow: lowI - peakI, daysToEnd: endI < 0 ? null : endI - peakI, open: endI < 0 });
      if (endI < 0) break; i = endI + 1;
    } else i++;
  }
  return out;
}
/** zigzag swings on closes between i0 and i1 (inclusive), starting from a high at i0. returns [{i, type:'H'|'L'}] */
function swings(c, i0, i1, rev = 5) {
  const out = [{ i: i0, type: "H" }]; let dir = -1, ext = i0;          // dir -1: looking for a low
  for (let i = i0 + 1; i <= i1; i++) {
    if (dir < 0) { if (c[i] < c[ext]) ext = i; else if (c[i] >= c[ext] * (1 + rev / 100)) { out.push({ i: ext, type: "L" }); dir = 1; ext = i; } }
    else { if (c[i] > c[ext]) ext = i; else if (c[i] <= c[ext] * (1 - rev / 100)) { out.push({ i: ext, type: "H" }); dir = -1; ext = i; } }
  }
  out.push({ i: ext, type: dir < 0 ? "L" : "H", last: true });
  return out;
}
/** rallies inside one episode: every swing low and what followed. */
function rallies(B, ep, rev = 5) {
  const c = B.map(b => b.c), i1 = ep.endI < 0 ? c.length - 1 : ep.endI, S = swings(c, ep.peakI, i1, rev), out = [];
  for (let k = 0; k < S.length; k++) { if (S[k].type !== "L") continue; const lo = S[k].i, nextH = S[k + 1];
    if (!nextH && !S[k].last) continue;
    const topI = nextH ? nextH.i : lo; let cutI = -1; for (let j = lo + 1; j <= i1; j++) if (c[j] < c[lo]) { cutI = j; break; }
    const isLow = lo === ep.lowI;
    out.push({ lowI: lo, low: B[lo].d, topI, top: B[topI].d, gain: (c[topI] / c[lo] - 1) * 100, days: topI - lo, cutI, cut: cutI < 0 ? null : B[cutI].d, daysToCut: cutI < 0 ? null : cutI - lo,
      failed: cutI >= 0, turn: isLow, pending: !!S[k].last && ep.open, depthAtLow: (c[lo] / c[ep.peakI] - 1) * 100, dayOfEpisode: lo - ep.peakI, seq: out.length + 1 });
  }
  return out;
}
module.exports = { episodes, swings, rallies };

if (require.main === module) {
  for (const sym of ["^GSPC", "^IXIC"]) {
    const B = L.bars(sym).filter(b => b.d >= (sym === "^GSPC" ? "1949-01-01" : "1971-01-01")), E = episodes(B, 10);
    console.log(`\n${sym}: ${E.length} drops of 10% or more since ${B[252].d}`);
    for (const e of E) { const R = rallies(B, e, 5); console.log(`${e.peak} → ${e.low}  ${L.pct(e.depth).padStart(7)}  ${String(e.daysToLow).padStart(4)}d to low  ${e.end ? String(e.daysToEnd).padStart(5) + "d to new 52w high " + e.end : "  OPEN"}  rallies≥5%: ${R.length} (failed ${R.filter(r => r.failed).length})`); }
  }
}
