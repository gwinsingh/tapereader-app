// Market-drops study: write ONE summary note into the Obsidian vault, pointing at the web study.
//   node scripts/marketdrops/vault.js        → <vault>/Market/Market Drops/00 Anatomy of a Drop.md
// Everything under the ✍️ marker is the trader's and survives every rewrite. After running it, make sure Obsidian is open and
// run: node scripts/vault-sync/check.js --push   (until it prints "in sync"). Never writes anywhere else in the vault.
const fs = require("fs"), path = require("path");
let VAULT; try { VAULT = process.env.VAULT || require("../vault-path"); } catch (e) { console.log("no scripts/vault-path.js here (this checkout has no vault); nothing written"); process.exit(0); }
const L = require("./lib.js"), C = L.J("core.json"), M = L.J("more.json");
const MARK = "%% ✍️ YOUR NOTES BELOW — the generator never touches anything under this line %%";
const mag = (x, d = 1) => Math.abs(x).toFixed(d) + "%";
const pct = (x, d = 1) => (x == null || !isFinite(x) ? "—" : (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d) + "%"), URL = "https://tapereader.us/studies/market-drops/";
const E = C.spx, cur = E[E.length - 1], done = E.filter(e => !e.open), cr = C.cross10.filter(r => !r.open), X = M.leaders, A = C.analog, e18 = E.find(e => e.id === "2018b");
const RL = done.flatMap(e => e.rallies), failed = RL.filter(r => r.cls === "failed"), turn = RL.filter(r => r.cls === "turn"), med = a => L.median(a.filter(x => x != null));
const sh18 = M.shape["2018b"].SPY.fall, shN = M.shape[cur.id].SPY.fall, mk = M.macro[cur.id].peak, mk18 = M.macro["2018b"].peak, lev = M.lev[M.lev.length - 1], n = M.now;
const pg = (slug, text) => `[${text}](${URL}${slug}.html)`;
const body = `# Anatomy of a Drop

**The study lives on the web: ${URL}** (23 pages with interactive charts; data to ${L.nice(C.asOf)}).
This note is only the summary and the way in. A historical study, not advice: it describes what happened and how often. Nothing in it is a rule.

> [!abstract] What it is
> How US stock-market drops unfold and end: ${E.length} drops of 10% or more in the S&P 500 since 1950, measured the same way. Built around one question: how far does autumn 2026 resemble autumn 2018, and what would it look like if it turned out more like 2000 or 2007?
> On ${L.nice(C.asOf)} the S&P 500 was ${pct(cur.depth)} below its ${L.nice(cur.peak)} high, ${cur.daysToLow} sessions in.

## Main findings

1. **A 10% fall is a fork.** Of ${cr.length} earlier drops that reached −10%, ${cr.filter(r => r.finalDepth > -15).length} ended before −15% and ${cr.filter(r => r.finalDepth <= -20).length} went to −20% or more. ${pg("atlas", "Every drop since 1950")}
2. **The look-alike chart is weak evidence.** Measured from the peak, 2018 ranks ${A.cand.findIndex(x => x.peak === e18.peak) + 1} of ${A.cand.length} as a match for the present path, and look-alike charts had no forecasting value across ${A.loo.length} past declines. ${pg("lookalike", "Look-alike charts")}
3. **On the macro numbers the 2018 comparison has a basis.** The backdrop at the October 2026 high was closest to September 2018; March 2000 ranks third. ${pg("fundamentals", "Earnings, rates and credit")}
4. **What is falling is unlike 2018.** Then the median stock fell ${mag(X["2018b"].medDec, 0)} with the index. Now the median stock is ${pct(X[cur.id].medDec, 0)}, ${Math.round(X[cur.id].rose)}% of stocks are up, and the previous leaders are down ${mag(X[cur.id].qB252[4].dec, 0)}. That shape is how 2000 began. ${pg("compare", "Now against 2018")}
5. **What ended 2018 is weaker now.** Inflation was 2% and falling, so the Fed could stop; now it is ${mk.cpi}% and rising. Valuation (Shiller P/E ${mk.cape} against ${mk18.cape}) and margin-loan growth (${pct(mk.marginYoy, 0)} against ${pct(mk18.marginYoy, 0)}) are far higher.
6. **Profits do not settle it.** Cisco, Microsoft, Intel and Oracle were highly profitable in 2000; their shares fell 65–89% and took 17–26 years to regain their highs. ${pg("ai-dotcom", "AI boom against the dot-com bubble")}
7. **A pop is not a low.** ${failed.length} failed rallies and ${turn.length} real lows looked the same in their first five sessions. A pop alone was the low about ${Math.round(turn.length / (turn.length + failed.length) * 100)}% of the time. ${pg("bounces", "Failed pops and the real turn")}
8. **Breadth and persistence separated them.** A follow-through day came after ${Math.round(failed.filter(r => r.f.ftd != null).length / failed.length * 100)}% of failed rallies too; ${Math.round(failed.filter(r => r.f.r50ok).length / failed.length * 100)}% of them got back above the 50-day average.
9. **Proof costs part of the move.** At real lows: back above the 50-day a median ${pct(med(done.map(e => e.sig.r50gain)), 0)} off the low, above the 200-day ${pct(med(done.map(e => e.sig.r200gain)), 0)} (17–39% in the V-shaped lows). ${pg("filters", "Moving averages as a filter")}
10. **December 2018 gave no second chance.** A quiet half-day low, +5% the next session, no retest, proof in stages over three weeks. ${pg("y2018-turn", "How 2018 bottomed and turned")}
11. **Washout first, proof after.** At the low of every drop of 18% or more since 1999 fewer than 21% of stocks were above their 200-day average; now ${Math.round(n.breadth.a200)}%. ${pg("bottoms", "Signs at the low")}
12. **The fall has come in regular hours, as in 2018.** 2018: overnight ${pct(sh18.overnight)}, session ${pct(sh18.session)}, ${Math.round(sh18.gapUpSold)}% of gap-ups sold. 2026 so far: overnight ${pct(shN.overnight)}, session ${pct(shN.session)}. ${pg("intraday", "The shape of the day")}
13. **Shelters lag afterwards; early relative strength leads.** ${pg("sectors", "Sectors and themes")} · ${pg("leaders", "The stocks that led")}
14. **Leverage was higher going in than in 2018.** Margin loans ${lev.pctGdp}% of GDP, ${pct(lev.yoy, 0)} on the year. ${pg("leverage", "Leverage and positioning")}

## Reading order

1. ${pg("now", "Autumn 2026: the drop so far")} · ${pg("compare", "Now against 2018")} · ${pg("atlas", "Every drop since 1950")}
2. ${pg("y2018", "2018, day by day")} · ${pg("y2018-turn", "How 2018 bottomed and turned")}
3. ${pg("bears", "2000–02 and 2007–09")} · ${pg("ai-dotcom", "AI boom against the dot-com bubble")} · ${pg("scenarios", "Correction or bear: two paths")}
4. ${pg("bounces", "Failed pops and the real turn")} · ${pg("bottoms", "Signs at the low")} · ${pg("filters", "Moving averages as a filter")} · ${pg("news", "Reaction to news")}
5. ${pg("sectors", "Sectors and themes")} · ${pg("leaders", "The stocks that led")}
6. ${pg("intraday", "The shape of the day")} · ${pg("leverage", "Leverage and positioning")} · ${pg("fundamentals", "Earnings, rates and credit")} · ${pg("lookalike", "Look-alike charts")}
7. ${pg("drills", "Train the eye (30 replay charts)")} · ${pg("glossary", "Glossary")} · ${pg("method", "Method, data and limits")} · ${pg("sources", "Research notes and sources")}

## Limits

${E.length} drops is a small sample and the big ones dominate. Every "low" is known only afterwards. The stock universe is today's index membership, so old breadth and leader tables are flattering. No strategy is tested. Everything about 2026 describes an unfinished event.

Related in the vault: [[00 Fed Cycles Home]]. Code and resume point: \`tapereader-app/scripts/marketdrops/README.md\`.
`;
const file = path.join(VAULT, "Market", "Market Drops", "00 Anatomy of a Drop.md"); fs.mkdirSync(path.dirname(file), { recursive: true });
let mine = "\n"; if (fs.existsSync(file)) { const old = fs.readFileSync(file, "utf8"), i = old.indexOf(MARK); if (i >= 0) mine = old.slice(i + MARK.length); }
const out = body.replace(/\s+$/, "") + "\n\n" + MARK + mine;
if (/undefined|NaN/.test(body)) { console.log("refusing to write: undefined/NaN in the note"); process.exit(1); }
if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === out) console.log("vault note unchanged:", file); else { fs.writeFileSync(file, out); console.log("vault note written:", file); }
