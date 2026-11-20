// Market-drops study, pages: atlas (every drop since 1950) and lookalike (do look-alike charts mean anything).
const L = require("./lib.js"), G = require("./sitegen.js"), K = require("./kit.js");
const { pct, num, tbl, P, PB, tiles, take, warn, ul, link } = G, { median, quantile, nice, niceM } = L;

module.exports = function (site, C, M) {
  const E = C.spx, cur = E[E.length - 1], done = E.filter(e => !e.open), SPX = K.SPX;
  const label = e => (e.name ? `${e.name}` : niceM(e.peak));
  const KEY = { "2018b": K.CAT[0], "2000": K.CAT[7], "2007": K.CAT[6], "2022": K.CAT[1], "2025": K.CAT[2], "2020": K.CAT[3] };

  // =============================================================== ATLAS
  {
    const p = site.page("atlas");
    p.lede = `Every fall of 10% or more in the S&P 500 since 1950, measured the same way, so that the present one can be placed among them. There have been ${E.length}, including the one now running.`;
    p.sec("definition", "What counts as a drop here", "One rule for all 76 years, so that no episode is picked by hindsight.");
    p.h(ul([`A <b>drop</b> begins when the index closes at least 10% below its highest close of the past 252 sessions (about one year). The <b>peak</b> is that high.`,
      `The <b>low</b> is the lowest close before the index makes a new 52-week closing high. The drop is counted as <b>over</b> on the day of that new high.`,
      `Inside a drop, a <b>rally</b> is a rise of 5% or more from a closing low. A rally <b>failed</b> if a later close went under the low it started from. The rally that starts at the final low is called <b>the turn</b>.`,
      `Closing prices only. The S&amp;P 500 is used because it has clean daily history to 1950; the Nasdaq Composite (from 1971) is listed further down.`]));
    p.h(tiles([[String(E.length), "drops of 10% or more since 1950 (one about every two years)"], [pct(median(done.map(e => e.depth))), "median depth, peak to low"], [String(median(done.map(e => e.daysToLow))), "median sessions from peak to low (about " + Math.round(median(done.map(e => e.daysToLow)) / 21) + " months)"],
      [String(median(done.map(e => e.daysToEnd))), "median sessions from peak to a new 52-week high"], [`${done.filter(e => e.depth <= -20).length} of ${done.length}`, "went on to 20% or more"], [pct(cur.depth), `the present drop so far, ${cur.daysToLow} sessions after the ${nice(cur.peak)} high`, "neg"]]));

    // long chart with every drop shaded
    const wk = K.weeklyCloses(SPX, "1950-01-01");
    p.fig({ type: "lines", xt: "date", log: true, h: 380, title: "S&P 500 since 1950 with every drop shaded", series: [{ t: "S&P 500, weekly close (log scale)", d: wk, c: "#111", w: 1.3, label: false }],
      bands: E.map(e => ({ x0: e.peak, x1: e.low, c: e.depth <= -20 ? "drop" : "rally" })), yf: "int" },
      { title: "Seventy-six years, thirty-six drops", cap: "S&amp;P 500, weekly closes, log scale. Shaded: peak to low of every drop of 10% or more. Red = fell 20% or more; amber = 10% to 20%.", note: "The log scale makes equal percentage moves the same height in every decade. Hover or tap for the date and level." });

    p.sec("table", "The full list", "Sorted by date. The present drop is the last row.");
    const rows = E.map(e => ({ cls: e.open ? "hl" : "", cells: [`<b>${label(e)}</b>`, nice(e.peak), e.open ? "—" : nice(e.low), PB(e.depth, 60), e.daysToLow, e.open ? "open" : e.daysToEnd, e.fed.stance, e.nFailed, e.open ? "—" : (e.sig.retest != null && e.sig.retest <= 3 ? `yes (${pct(e.sig.retest)}, day ${e.sig.retestDay})` : "no"), e.open ? "—" : P(e.sig.g250, 0)] }));
    p.h(tbl(["Drop", "Peak", "Low", { t: "Depth", num: true }, { t: "Sessions to low", num: true }, { t: "Sessions to new 52-wk high", num: true }, { t: "Fed at the peak", tip: "Change in the policy rate over the six months before the peak" }, { t: "Failed rallies", num: true, tip: "Rallies of 5%+ whose starting low was later broken" }, { t: "Low retested?", tip: "Lowest close 5 to 60 sessions after the low was within 3% of it" }, { t: "One year after the low", num: true }], rows,
      { note: "“Fed at the peak”: hiking or cutting = the policy rate moved by a quarter point or more over the previous six months (before 1983, half a point in the effective rate). “Low retested” = within 60 sessions the index closed back within 3% of its low without breaking it." }));

    p.sec("base-rates", "Once a drop is 10% deep, how much further did it go?", `The present drop crossed −10% on ${nice(C.cross10[C.cross10.length - 1].cross)}. The table shows what happened after the same moment in the ${done.length} earlier drops.`);
    const cr = C.cross10.filter(r => !r.open), n = cr.length, sh = k => `${k} of ${n} (${Math.round(k / n * 100)}%)`;
    p.h(tiles([[sh(cr.filter(r => r.more > -2).length), "ended within 2% of that first −10% close"], [sh(cr.filter(r => r.finalDepth <= -15).length), "went on to 15% or more"], [sh(cr.filter(r => r.finalDepth <= -20).length), "went on to 20% or more (a bear market by the usual label)"], [sh(cr.filter(r => r.finalDepth <= -30).length), "went on to 30% or more"],
      [pct(median(cr.map(r => r.more))), "median further fall after the first −10% close"], [String(median(cr.map(r => r.daysCrossToLow))), "median sessions from that close to the final low"]]));
    const grp = (name, f) => { const g = cr.filter(f); return [name, g.length, P(median(g.map(r => r.finalDepth))), `${g.filter(r => r.finalDepth <= -20).length} of ${g.length}`, P(median(g.map(r => r.more))), median(g.map(r => r.daysCrossToLow)), P(median(g.map(r => r.f126).filter(x => x != null))), P(median(g.map(r => r.f252).filter(x => x != null))), `${g.filter(r => r.f252 > 0).length} of ${g.length}`]; };
    p.h(tbl(["Group at the first −10% close", { t: "Drops", num: true }, { t: "Median final depth", num: true }, { t: "Reached −20%", num: true }, { t: "Median further fall", num: true }, { t: "Median sessions to low", num: true }, { t: "Next 6 months (median)", num: true }, { t: "Next 12 months (median)", num: true }, { t: "Up after 12 months", num: true }],
      [grp("All drops", () => true), grp("Fed hiking at the peak", r => r.fed === "hiking"), grp("Fed cutting or on hold", r => r.fed !== "hiking"), grp("Reached −10% within 40 sessions (fast)", r => r.daysToCross <= 40), grp("Took longer than 40 sessions (slow)", r => r.daysToCross > 40), grp("Since 1987 only", r => r.peak >= "1987")],
      { note: `The present drop is in the “Fed hiking” and “fast” rows: it took ${C.cross10[C.cross10.length - 1].daysToCross} sessions to reach −10%. “Next 6 / 12 months” are measured from the first −10% close, not from the low, so they include whatever further fall came first.` }));
    const fast = cr.filter(r => r.daysToCross <= 40), slow = cr.filter(r => r.daysToCross > 40);
    p.h(take([`A 10% fall was about a coin flip between “nearly done” and “half-way”: ${cr.filter(r => r.finalDepth > -15).length} of ${n} stopped before −15%, ${cr.filter(r => r.finalDepth <= -20).length} went to −20% or more.`,
      `Speed did not make a drop safer or more dangerous by itself: fast drops had a median final depth of ${pct(median(fast.map(r => r.finalDepth)))}, slow ones ${pct(median(slow.map(r => r.finalDepth)))}. But the fast ones were over sooner (median ${median(fast.map(r => r.daysCrossToLow))} sessions from the −10% close to the low, against ${median(slow.map(r => r.daysCrossToLow))}).`,
      `Twelve months after the first −10% close the index was higher in ${cr.filter(r => r.f252 > 0).length} of ${n} cases. The exceptions are the ones everybody remembers: ${cr.filter(r => r.f252 <= 0).map(r => r.peak.slice(0, 4)).join(", ")}.`,
      `Nothing in this table says which kind the present drop is. It gives the odds a careful observer would have assigned on the day, before looking at anything else. The other pages look at what else was visible.`]));

    p.sec("paths", "All the paths on one chart", "Each line is one drop, starting at its peak. The present one is the thick black line.");
    const pathSeries = E.map(e => { const k = KEY[e.id], n2 = Math.min(400, (e.endI < 0 ? SPX.length - 1 : e.endI) - e.peakI); const B = L.bars("^GSPC"); return { t: e.open ? "2026 (now)" : `${e.peak.slice(0, 4)} ${e.name}`, s: e.open ? "now" : e.peak.slice(0, 4), d: K.pathFromPeak(B, e.peak, e.open ? cur.daysToLow : Math.min(n2, 400)), c: e.open ? "#111" : k, w: e.open ? 3 : k ? 1.8 : 1, dim: !e.open && !k, nolegend: !e.open && !k }; });
    p.fig({ type: "lines", xt: "n", series: pathSeries, yf: "pct", xl: "sessions after the peak", xn: "session", h: 460, x1: 400, y0: -58, hl: [{ y: -10, t: "−10%" }, { y: -20, t: "−20%" }] },
      { title: "Every drop since 1950, from its peak", cap: "Grey = the other drops. Coloured = the ones this study looks at closely.", note: "Each line ends when the index made a new 52-week high (or after 400 sessions). The two that keep falling off the right edge are 2000–02 and 2007–09." });
    p.fig({ type: "lines", xt: "n", series: pathSeries.map(s => ({ ...s, d: s.d.filter(q => q[0] <= 90) })), yf: "pct", xl: "sessions after the peak", xn: "session", h: 420, x1: 90, y0: -36, hl: [{ y: -10, t: "−10%" }, { y: -20, t: "−20%" }], vl: [{ x: cur.daysToLow, t: "today", low: true }] },
      { title: "The first 90 sessions, closer", cap: "The same lines, cut at 90 sessions, to compare with where the present drop is.", note: "At this point the present path is among the steeper ones, but it is not the steepest: 1987, 2020, 1998, 1980 and 2025 were deeper after the same number of sessions." });

    p.sec("gallery", "The drops since 1987, one small chart each", "Daily candles for the short ones, weekly for the two long bears. Amber bands are rallies that failed; the green band is the rally that held.");
    p.h('<div class="grid3">');
    for (const e of E.filter(x => x.peak >= "1987")) { const long = e.daysToLow > 300; p.fig(K.epSpec(site, "^GSPC", e, { tf: long ? "W" : "D", before: long ? 120 : 40, after: long ? 120 : 30, h: 230, panels: [], ma: long ? ["w10", "w40"] : ["e20", "s50", "s200"], pitch: 0, turnLabel: false }), { title: label(e) + (e.open ? "" : ` · ${pct(e.depth, 0)}`), cap: `${niceM(e.peak)} → ${e.open ? "now" : niceM(e.low)}`, minH: 250 }); }
    p.h("</div>");

    p.sec("nasdaq", "The Nasdaq Composite's list", "The same rule on the Nasdaq Composite (history from 1971). It falls more often and further.");
    p.h(tbl(["Peak", "Low", { t: "Depth", num: true }, { t: "Sessions to low", num: true }, { t: "Sessions to new 52-wk high", num: true }, { t: "Failed rallies", num: true }], C.ndq.map(e => ({ cls: e.open ? "hl" : "", cells: [nice(e.peak), e.open ? "—" : nice(e.low), PB(e.depth, 80), e.daysToLow, e.open ? "open" : e.daysToEnd, e.nFailed] })), { cls: "small" }));
    p.frag("atlas-profiles");
    p.h(warn(`Thirty-six drops is a small sample and the big ones dominate every average. The 52-week rule is one reasonable definition among several: a different threshold or look-back would move a few dates and merge or split a few episodes. Closing prices hide intraday extremes (the 1987 and 2020 lows were deeper intraday).`));
  }

  // =============================================================== LOOK-ALIKE
  {
    const A = C.analog, p = site.page("lookalike"), N = A.N, B = L.bars("^GSPC"), c = B.map(b => b.c), last = c.length - 1;
    p.lede = `A chart of today laid over a chart of 2018 looks convincing. This page tests how much such a match has been worth: across ${A.loo.length} past declines, the paths that looked most alike said nothing about what came next.`;
    // the 2018 comparison, three alignments
    const e18 = E.find(e => e.id === "2018b"), e00 = E.find(e => e.id === "2000"), e07 = E.find(e => e.id === "2007");
    const path = (peak, n, before) => K.pathFromPeak(B, peak, n, before);
    p.sec("claim", "The claim: “this looks like 2018”", `Both charts start from an early-autumn record high in a midterm-election year with the Fed raising rates. Laid over each other from their highs, they do look alike. The first question is how alike, measured rather than judged by eye.`);
    p.fig({ type: "lines", xt: "n", yf: "pct", xl: "sessions after the peak (negative = before it)", xn: "session", h: 420, hl: [{ y: 0, t: "peak" }], vl: [{ x: cur.daysToLow, t: "today" }],
      series: [{ t: "2026 (peak 6 Oct)", s: "2026", d: path(cur.peak, cur.daysToLow, 120), c: "#111", w: 3 }, { t: "2018 (peak 20 Sep)", s: "2018", d: path(e18.peak, 150, 120), c: K.CAT[0], w: 2 }] },
      { title: "S&P 500: 2026 against 2018, both measured from their peak", cap: "Per cent from the closing high. Day 0 is the high.", note: `After ${cur.daysToLow} sessions the 2018 decline stood at ${pct(path(e18.peak, cur.daysToLow)[cur.daysToLow][1])}; the present one is at ${pct(cur.depth)}. The 2018 low (−19.8%) came on session 65, the day before Christmas.` });
    // best 2018 window by correlation with the last N sessions
    const me = []; for (let k = 0; k <= N; k++) me.push(Math.log(c[last - N + k] / c[last - N]));
    let best = null; const a18 = L.bia(B, "2018-07-01"), z18 = L.bi(B, "2019-02-28"); for (let s = a18; s + N <= z18; s++) { const w = []; for (let k = 0; k <= N; k++) w.push(Math.log(c[s + k] / c[s])); const r = L.corr(me, w); if (!best || r > best.r) best = { s, r }; }
    const rank18 = A.cand.findIndex(x => x.peak === e18.peak) + 1, x18 = A.cand[rank18 - 1];
    p.h(`<p>Measured from the peak, the first ${N} sessions of the two declines have a correlation of <b>${x18.corr.toFixed(2)}</b> (1.00 would be identical shape). That puts 2018 at rank <b>${rank18} of ${A.cand.length}</b> among all past declines of 5% or more: an ordinary match, not a close one. The eye is more generous than the arithmetic because both lines go down and both wiggle.</p>
<p>If the 2018 chart is allowed to slide in time until it fits best, the best-fitting ${N}-session stretch of 2018 runs from <b>${nice(B[best.s].d)} to ${nice(B[best.s + N].d)}</b> (correlation ${best.r.toFixed(2)}). That is how most overlay charts are made: the old chart is shifted, and often stretched, until it fits. A fit found that way is certain to look good.</p>`);
    p.fig({ type: "lines", xt: "n", yf: "pct", xl: `sessions (0 = start of the ${N}-session window)`, xn: "session", h: 380, vl: [{ x: N, t: "today / end of the matched window" }],
      series: [{ t: `2026: the last ${N} sessions`, s: "2026", d: me.map((v, k) => [k, (Math.exp(v) - 1) * 100]), c: "#111", w: 3 }, { t: `2018: best-fitting window (from ${L.niceS(B[best.s].d)}) and the next 60 sessions`, s: "2018 fit", d: Array.from({ length: N + 61 }, (_, k) => [k, (c[best.s + k] / c[best.s] - 1) * 100]), c: K.CAT[0], w: 2 }] },
      { title: "The same comparison after sliding 2018 until it fits", cap: "What an overlay chart shows: the best-fitting stretch of the old chart, and what the old chart did next.", note: "The part to the right of the dashed line is the “forecast” such a chart implies. The rest of this page tests how reliable that kind of forecast has been." });

    p.sec("neighbours", "The closest matches in 76 years, and what they did next", `Ranking every past decline by how closely its first ${N} sessions match the present one (root-mean-square distance between the two paths), the nearest are not 2018.`);
    const top = A.cand.slice(0, 8);
    p.h(tbl(["Rank", "Peak", "Episode", { t: "Shape correlation", num: true }, { t: `Depth after ${N} sessions`, num: true }, { t: "Next 20 sessions", num: true }, { t: "Next 60 sessions", num: true }, { t: "Worst point in those 60", num: true }, { t: "Final depth of that drop", num: true }],
      top.map((x, i) => [i + 1, nice(x.peak), x.name || "—", x.corr.toFixed(2), P(x.depthN), P(x.f20), P(x.f60), P(x.worst60), P(x.finalDepth)]).concat([{ cls: "sep", cells: [rank18, nice(x18.peak), "Q4 2018", x18.corr.toFixed(2), P(x18.depthN), P(x18.f20), P(x18.f60), P(x18.worst60), P(x18.finalDepth)] }]
        .concat([e00, e07].map(e => { const x = A.cand.find(q => q.peak === e.peak), r = A.cand.indexOf(x) + 1; return [r, nice(x.peak), e.name, x.corr.toFixed(2), P(x.depthN), P(x.f20), P(x.f60), P(x.worst60), P(x.finalDepth)]; }))),
      { note: `Depth after ${N} sessions is the log change, so it differs slightly from the simple percentage. The present decline is ${pct(A.me[N])} on the same measure, deeper than every one of its nearest matches: no past decline that began from a 52-week high matches both its shape and its size closely.` }));
    p.fig({ type: "lines", xt: "n", yf: "pct", xl: "sessions after the peak", xn: "session", h: 420, vl: [{ x: N, t: "today" }], series: [{ t: "2026 (now)", s: "now", d: A.me.map((v, k) => [k, v]), c: "#111", w: 3 }].concat(top.map((x, i) => ({ t: `${x.peak.slice(0, 4)}${x.name ? " " + x.name : ""}`, s: x.peak.slice(0, 4), d: x.p.map((v, k) => [k, v]).concat(x.after.slice(1).map((v, k) => [N + 1 + k, v])), ci: i, w: 1.6 }))) },
      { title: "The eight nearest matches, and where each went over the next 60 sessions", cap: "Log % from the peak. Left of the dashed line: the part that was matched. Right: what followed.", note: "The eight look-alikes fan out from −12% to +17% over the following 60 sessions. Three of them were the early weeks of 1961–62, 1973–74 and 2007–09." });

    p.sec("test", "The test: did look-alikes forecast anything?", "For each past decline, pretend it is the present: find the five other declines whose first sessions match it best, average what those five did over the next 60 sessions, and compare that “forecast” with what really happened.");
    const hit = A.signHit, tot = A.loo.length, upShare = A.loo.filter(r => r.actual > 0).length;
    p.h(tiles([[A.looCorr.toFixed(2), "correlation between the look-alike forecast and the actual next 60 sessions (0 = no information)"], [A.nnCorr.toFixed(2), "the same using only the single closest match"], [`${hit} of ${tot}`, "times the forecast had the right sign"], [`${upShare} of ${tot}`, "times the market was simply up 60 sessions later, whatever the forecast said"]]));
    p.fig({ type: "lines", xt: "n", yf: "pct", xf: "pct", xl: "what the five closest look-alikes did over the next 60 sessions (average)", xn: "forecast", h: 400, zero: true, hl: [{ y: 0 }], vl: [{ x: 0 }], series: [{ t: "one past decline", d: A.loo.map(r => [r.forecast, r.actual]).sort((a, b) => a[0] - b[0]), nol: true, pts: true, r: 3.5, c: K.CAT[0], label: false }], noEndLabels: true },
      { title: "Forecast from look-alikes (across) against what happened (up)", cap: "One dot per past decline of 5% or more. If look-alikes had forecasting value the dots would run from lower left to upper right.", note: "They form a shapeless cloud. The “right sign” count is high only because the market rose after most declines anyway; a forecast of “up” every time would have done as well." });
    p.h(`<p>A second version of the test drops the requirement that the old window starts at a peak, and simply searches all of history for the ${N}-session stretches whose shape correlates best with the last ${N} sessions. The best match in 76 years is <b>${nice(A.any[0].start)} to ${nice(A.any[0].end)}</b> (correlation ${A.any[0].corr.toFixed(2)}): the “Kennedy slide” of 1962. The table lists the top fifteen.</p>`);
    p.h(tbl(["Window", { t: "Shape correlation", num: true }, { t: `Move in the window`, num: true }, { t: "Next 20 sessions", num: true }, { t: "Next 60 sessions", num: true }, { t: "Worst point in those 60", num: true }], A.any.slice(0, 15).map(x => [`${nice(x.start)} → ${nice(x.end)}`, x.corr.toFixed(3), P(x.moveN), P(x.f20), P(x.f60), P(x.worst60)]),
      { note: `Across the ${A.anyStats.n} best non-overlapping matches: median next-60-session change ${pct(A.anyStats.medF60)}, ${A.anyStats.up60} of ${A.anyStats.n} higher, range of the middle 80% from ${pct(A.anyStats.q10)} to ${pct(A.anyStats.q90)}. For all 60-session periods since 1950 the median is ${pct(A.base.med60)} and ${A.base.up60.toFixed(0)}% were higher.` }));
    p.fig({ type: "lines", xt: "n", yf: "pct", xl: "sessions after the end of the matched window", xn: "session", h: 380, zero: true, hl: [{ y: 0 }], series: A.any.slice(0, 15).map((x, i) => ({ t: x.end.slice(0, 4), d: x.after.map((v, k) => [k, v]), c: ["2018", "2008", "2001", "2002", "1962"].includes(x.end.slice(0, 4)) ? K.CAT[i % 8] : undefined, dim: !["2008", "2001", "2002", "1962"].includes(x.end.slice(0, 4)), nolegend: true, s: x.end.slice(0, 4), w: 1.6 })), noEndLabels: false },
      { title: "What followed the fifteen best-matching windows", cap: "Per cent change from the last day of each matched window. Coloured: 1962, 2001, 2002, 2008.", note: "The matches are mostly the sharp legs of other declines. After them the market was more often higher than lower 60 sessions on (sharp falls tend to be followed by rebounds), but one of the fifteen is early October 2008, which lost another 24% first." });
    p.frag("signals-analogs");
    p.h(take([`Measured from the peak, 2018 is an ordinary match for the present chart (rank ${rank18} of ${A.cand.length}). It becomes a striking match only when it is shifted to fit.`,
      `Across ${tot} past declines, the paths that looked most alike had no forecasting value for the following 60 sessions (correlation ${A.looCorr.toFixed(2)}).`,
      `The useful part of an analog is not the line drawn to the right. It is the list of things that happened in that year: what the Fed did, what broke, what turned the market. Those are covered on ${link("y2018")}, ${link("compare")} and ${link("bears")}.`,
      `A look-alike is a scenario to prepare for, not a forecast. The same present chart also resembles the first weeks of 1962, 1973 and 2007.`], "What to take from it"));
    p.h(warn(`The test uses closing prices of one index and one window length (${N} sessions, the age of the present decline). Other lengths give the same answer in kind (correlations near zero) but the exact numbers move. The test says nothing about analogs built on fundamentals; ${link("compare")} looks at those.`));
  }
};
