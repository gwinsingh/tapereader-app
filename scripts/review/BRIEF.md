# ANALYST BRIEF — monthly trading review

## Subject
Gurwinder, discretionary US-equity day trader, PCT Bootcamp. ~4 months of logged data.
Playbook: **Opening Range Breakout only** (5-min OR, 9:30–9:35 ET). Long-biased.

## Data — READ THIS, THE SHEETS CHANGED

Run `node scripts/review/fetch.js` first (it snapshots into `.data/`). Point it at the **WIP**
tabs — `WIP-U16632046-GURI` (live) and `WIP-TRPCT1541-GURI` (practice). The un-prefixed tabs are
the OLD uncorrected data; do not use them.

```js
const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
L.live      // 71 trades, 19 sessions, 2026-07-30 → 2026-08-28. LIVE MONEY. THE MONTH UNDER REVIEW.
L.practice  // 248 trades, 54 sessions, 2026-05-06 → 2026-07-30. Practice/sim. HISTORY.
```

### What changed since the last analysis round
The DAS logs contain the whole bracket lifecycle, not just fills, so the trader's real stop ladder
has been recovered and every risk-derived number recomputed. New columns on both WIP tabs:

| column | meaning |
|---|---|
| `Entry Ladder` / `Exit Ladder` | `HH:MM:SS@price×shares \| ...` — the actual fills, clustered into logical orders |
| `Stop Ladder` | every protective-stop placement and move, timestamped |
| `# Entries` / `# Exits` | logical orders (NOT the old `# Partials`, which counted both sides) |
| `First Entry`, `Initial Stop`, `Initial Risk ($)` | the real committed risk, measured not typed |
| `Max Risk At Stake ($)` | peak exposure during the BUILD phase (before the first exit) |
| `Stop Raises`, `Stopped Out?` | trailing behaviour |
| `Peak/Trough Position Value ($)` | excursion valued against the share ladder actually held |
| **`Position MFE (R)`** | peak ÷ initial risk — **the correct MFE. Use this, not `Max R Before Stop`.** |
| `Capture %` | realised P&L ÷ peak position value |
| `Risk Source` | `auto (ladder)` or `manual` |

`R (Risk)` is now the MEASURED initial risk, so `P&L (R)` changed on 70 of 71 live rows.
**Live month is +19.4R, not the +23.1R quoted in the previous round.** 2026-08-13 SPY and QQQ were
deliberate full-size entries mis-logged as half — the trader confirmed this; SPY fell 5.10R → 2.64R
and QQQ 6.00R → 3.14R.
Helpers: `L.st(arr,label)` → n / win% / expR + bootstrap 95% CI / sumR / $ (marks `*` if n<15);
`L.bootCI(arrOfR)`, `L.permP(a,b)` permutation p-value, `L.byDay`, `L.days`, `L.dayR`, `L.R`,
`L.sum/mean/med/sd/f`. **Read lib.js first** — every field is listed there.
Write scripts into `scripts/review/` and run with `node`.

## THE HEADLINE CONSTRAINT
Live: sumR **+19.4R on measured risk** (was +23.1R on typed risk), **bootstrap 95% CI on mean R
includes zero — recompute it, do not reuse the old figure.**
Win rate **fell** 27% → 23%. The month's profit rests on a few large winners.
**One month at n=71 cannot establish an edge.** Your job is not to explain why the month was good.
Your job is to find what is *reliably* true and to label honestly what is not.

## FACTS ALREADY ESTABLISHED — do not re-derive, do build on
- **VIX in the live month spans 14.25–17.09 only.** Practice spanned 15.03–22.22. The entire live month
  sat below the 17.2 threshold that separated good from bad in practice. H1 therefore has ZERO
  out-of-sample exposure and cannot be tested — but this is itself a major regime finding.
- **All 71 live trades are Long.** No short-side data at all.
- **Risk unit varied within the live month**: $14 ×32, $18 ×30, $28 ×6, $24 ×1, $38 ×1, blank ×1.
  He scaled up mid-month. Any $ comparison is corrupted by this; work in R.
- Enrichment is ~99% complete on live (MFE/MAE/market data). `Emotional State` and `Market Bias` are
  0% (superseded by Energy/Tension/Urge at 83%). Conviction 48%, Catalyst 49%, MTF reads 44–49%.

## HIS ACTUAL RULES (stated by him — do not invent others, do not score him against rules he never adopted)
- ORB only. Setups must look good on **daily and hourly**, not just 1m/5m.
- Avoid extended entries — not chasing the 3rd/5th-minute candle, no visually extended setups.
- Requires a genuine reason for the move (catalyst), not just a technical break.
- **Risk control is a MAX-LOSS rule, NOT a max-trade-count rule** — he has had good days after early losses.
- No mega-cap exclusion — if it is in play, it is tradeable.
- **No volume-confirmation rule, deliberately**: in ORB volume arrives *after* the break and he often
  enters in anticipation; waiting for volume is too late.
- Partials are NOT the norm — he mostly exits all-out, occasionally scales to hold a runner.

## METHODOLOGY — MANDATORY
1. **Analyse in R, never dollars.** The risk unit changed both across and within books.
2. **Minimum cell size n≥15** to call something a finding. Smaller → label `UNDERPOWERED`, never a conclusion.
3. **Always report the bootstrap 95% CI.** If it crosses zero, say so in the verdict line.
4. **Count your tests** and report the total. At n=71, ~1 in 20 splits looks significant by chance.
5. **Tier every output**: `T2-CONFIRM` / `T2-REJECT` (tested a pre-registered hypothesis on live) or
   `T3-HYPOTHESIS` (newly discovered — NOT actionable this month, goes to the register for next month).
6. **State the mechanism.** A correlation with no plausible causal story is T3 at best.
7. Prefer **out-of-sample**: discover on `practice`, confirm on `live`. Always say which you used.

## KNOWN ARTIFACTS — every one of these has burned us already
1. **R-normalisation.** MFE/MAE/expR are in R, and R is *defined by* stop distance. A wider stop
   mechanically shrinks MFE-in-R. Never compare MFE across stop-distance buckets without saying this.
2. **Duration is partly definitional.** Winners run longer by construction. Never conclude "hold longer →
   win" from duration buckets alone; use MFE to separate entry quality from exit behaviour.
3. **`# Partials` is a duration proxy** — you cannot take 3 partials on a 2-minute trade.
4. **Concurrency is a duration proxy** — a second position is only possible if the first is still open.
5. **First-lot MFE cannot bound a pyramid.** `Max R Before Stop` measures the first lot against
   the first entry's risk. On a scaled-in trade realised R legitimately EXCEEDS it (NVDA 2026-08-05
   grew 7 → 39 shares). Any capture ratio built on it is meaningless for the 27 multi-entry live
   trades. **Always use `Position MFE (R)`**, which does bound realised R.
6. **`Breakout Vol Ratio` is NOT an entry signal.** It is the volume of the first bar after 9:35 that
   breaks the OR ÷ mean OR-bar volume: day-level, post-hoc, completed-bar, unrelated to his actual entry.
   Day-quality descriptor only. (A previous review wrongly proposed it as an entry filter.)
7. **`Process Followed?` / `RightTheory?` are retrospective self-labels** — partly outcome-contaminated.
   Descriptive, not causal.
8. **VIX / SPY Dir are day-level.** Effective n = 19 sessions, not 71 trades.
9. **"Probe" (<2 min) is defined by the exit** — not knowable at entry. Never propose "don't take probes".
10. **Missing-not-at-random.** 8/26 and 8/28 have blank Setup/Process/RightTheory and were both losers;
   8/28 was the highest-volume day (7 trades). Journal abandonment tracks bad days.
11. **A trade-count cap contradicts his stated risk rule.** To propose one you must beat his max-loss
    rule on the data, and say so explicitly.

## FINDINGS FROM THE PREVIOUS ROUND THAT ARE NOW VOID — redo them
Anything built on `Max R Before Stop`, `MAE (R)`, `# Partials` or typed `R (Risk)`:
capture / target capture / Execution Skill, the MFE decomposition, the "54% of trades never offered
1R" claim, every stop-level counterfactual, H4 (hold time), H5 (partials), and the risk-at-stake
readings. The regime conclusion (low-VIX tape, not skill) rested on realised R and market data and
is expected to survive — but re-verify it on the corrected R.

## PRE-REGISTERED HYPOTHESES (from the July review of `practice`) — test on `live` ONLY
- H1  VIX < 17.2 outperforms VIX ≥ 17.2      (practice +18.6R vs −24.9R) — **UNTESTABLE, see facts above**
- H2  Mega-cap single names underperform      (practice −8.6R / 61 trades)
- H3  Index ETFs (SPY/QQQ) produce ~zero      (practice +1.2R / 100 trades)
- H4  Held ≥5 min outperforms <5 min          (practice +66.8R vs −73.1R) — artifact #2
- H5  ≥3 partials outperforms ≤2              (practice +29.5R vs −35.8R) — artifact #3
- H6  ≤2 trades/day beats no cap              (practice +3.2R vs −6.3R)   — artifact #10
- H7  `RightTheory?=Yes` separates the book   (practice +38.2R vs −50.4R) — artifact #6
- H8  9:30–9:35 entries underperform          (practice 101 trades, −3.1R)
- H9  BVR ≥0.8 outperforms                    (practice +14.4R vs −10.9R) — artifact #5, likely dead
- H10 Friday underperforms                    (practice −9.8R) — likely noise, test anyway

## OUTPUT FORMAT — return exactly this, nothing else
For each finding:
```
[T2-CONFIRM | T2-REJECT | T3-HYPOTHESIS | UNDERPOWERED]  <one-line claim>
  numbers:    n=, expR=, 95% CI=, sumR=, p= (if two groups)
  mechanism:  why this would be true, or "none — pattern only"
  confounds:  which artifacts you checked and how you ruled them out
  verdict:    one sentence
```
End with `TESTS EXAMINED: <n>` and `TOP 3 THINGS THE TRADER SHOULD KNOW:` (ranked).
Be brutally honest. A null result is a valuable result. Do not manufacture findings.
