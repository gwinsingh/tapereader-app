# SELECTION TRACK — what he chose to trade
Monthly review, live book `U16632046-GURI`, 71 trades / 19 sessions, 2026-07-30 → 2026-08-28.
Discovery set: `practice` (248 trades, 54 sessions). All analysis in R.

Scripts: `sel-00-explore.js`, `sel-01-class.js`, `sel-02-extension.js`, `sel-03-chars.js`,
`sel-04-checks.js`, `sel-05-robust.js`.

---

## 0. DATA-QUALITY FLAG (read this before trusting any MFE-based control)

```
[T3-HYPOTHESIS]  `Max R Before Stop` is wrong on 10 of 71 live rows — it is BELOW the realised R.
  numbers:    live: 17/71 rows have maxR = 0.00; 9 of those are winners totalling +34.5R.
              10 rows have pnlR > maxR, which is arithmetically impossible; they sum to +36.3R —
              more than the whole month's +23.1R. Practice: 7/248 rows, +14.5R.
              4 of the month's 5 largest winners (MRNA 8.2R, QQQ 6.3R, NVDA 5.1R, SPY 3.9R) have maxR = 0.
  mechanism:  the enrichment walk aborts (stop deemed hit) before recording the favourable excursion —
              most likely a same-bar stop/adverse-check bug on large-move trades.
  confounds:  n/a — this is a data bug, not a pattern.
  verdict:    every MFE-in-R control in this review is computed on the 60/71 arithmetically-consistent
              rows only; fix the enrichment before next month or MFE-based analysis stays unusable.
```

---

## 1. INSTRUMENT CLASS

Live mix (share of trades / sumR): index ETF 34% / +15.6R · other stock 45% / +1.6R ·
mega-cap single 15% / +7.1R · leveraged-vol ETF 4% / −1.2R · sector ETF 1% / 0.0R.

```
[UNDERPOWERED]  H2 — mega-cap single names underperform: cannot be tested on live.
  numbers:    live mega n=11 (below the n>=15 floor), win%=36, expR=+0.65, 95% CI [−0.41,+1.85], sumR=+7.1
              live non-mega n=60, expR=+0.27 [−0.21,+0.82], sumR=+16.0, p=0.598
              practice reference: n=37, expR=−0.05, sumR=−1.9
  mechanism:  H2's original story (mega-caps are efficient, ORBs fail) is plausible but untested here.
  confounds:  n=11 across 4 tickers (AMZN×3, GOOGL×3, NVDA×3, MSFT, META) — 3 sessions dominate.
  verdict:    n=11 cannot decide anything; the direction is the opposite of the hypothesis, so H2 is
              certainly not established, but it is not refuted either — carry it forward unchanged.
```

```
[T2-CONFIRM]  H3 — index ETFs (SPY/QQQ) produce ~zero: NOT rejected.
  numbers:    live index ETF n=24, win%=25, expR=+0.65, 95% CI [−0.22,+1.70], sumR=+15.6 — CI includes zero
              SPY n=12* expR=+0.39 [−0.59,+1.55]; QQQ n=12* expR=+0.91 [−0.49,+2.58]
              live non-index n=47, expR=+0.16 [−0.30,+0.72], p=0.363
              practice: n=100, expR=+0.01 [−0.23,+0.27], sumR=+1.2
              CONCENTRATION: 3 trades (QQQ 8/06 +6.3R, QQQ 8/13 +6.0R, SPY 8/13 +5.1R) = +17.4R.
              The other 21 index-ETF trades sum to −1.8R.
  mechanism:  SPY/QQQ opening ranges are tight relative to ATR and heavily arbitraged; most breaks
              revert, occasional trend days pay for everything. That is exactly a ~zero mean with a fat tail.
  confounds:  artifact #1 not applicable (no MFE used). Checked outlier dependence explicitly — the
              bucket's entire result is 3 trades on 2 sessions.
  verdict:    the mean CI straddles zero in both books and 21 of 24 live index trades net −1.8R —
              H3 survives; index ETFs remain a zero-expectancy, high-variance bucket, and 68% of the
              month's headline profit rests on three of them.
```

```
[T3-HYPOTHESIS]  The mix drifted toward his weakest bucket during the live month.
  numbers:    "other stock" share: practice 31% (expR=−0.12, sumR=−9.3) -> live 45% (expR=+0.05, sumR=+1.6).
              Within live: first half 28% other / index 41%; second half 59% other / index 28%.
              Leveraged ETFs fell 11% -> 4% (practice sumR +1.7, live −1.2).
  mechanism:  he moved from ETFs to single names as he scaled risk size mid-month; single names outside
              the mega-caps are the only bucket that is negative-to-flat in BOTH books.
  confounds:  artifact #7 does not apply (trade-level). Not a P&L claim — a mix claim.
  verdict:    a real, measurable drift in what he selects, into the one bucket with no positive evidence
              behind it; watch it, do not act on it yet.
```

---

## 2. SYMBOL CONCENTRATION AND RE-TRADING

Live: 28 symbols over 71 trades. top1=17%, top3=41%, top5=51%. HHI=0.080 → **12.5 effective symbols**
(practice: 39 symbols, HHI=0.104, 9.6 effective). He is *less* concentrated live than in practice.

```
[T2-REJECT]  Re-trading the same symbol within a day neither helps nor hurts.
  numbers:    LIVE      attempt 1  n=55 expR=+0.42 [−0.14,+1.03] sumR=+22.6
                        attempt 2  n=15 expR=+0.05 [−0.59,+0.82] sumR= +0.7
                        attempt 3+ n=1* ; attempt 2+ n=16 expR=+0.03 [−0.54,+0.79]; p(1 vs 2+)=0.522
              PRACTICE  attempt 1  n=167 expR=−0.03; attempt 2 n=57 expR=+0.01; attempt 3+ n=24 expR=−0.09
                        attempt 2+ n=81 expR=−0.02; p=0.937
              Re-entry after a losing first attempt: live n=14* expR=+0.11; practice n=66 expR=+0.01.
  mechanism:  none needed — the null is the result. Re-entry is not revenge-shaped in this data.
  confounds:  the tempting alternative framing ("multi-attempt symbol-days lost −5.6R live / −18.1R practice
              vs single-attempt +28.7R / +11.8R") is POST-HOC SELECTION: whether a symbol-day becomes
              multi-attempt is partly decided by the first trade's outcome, so that split is not usable.
              Also brushes artifact #10 — a re-entry cap is a trade-count cap and contradicts his max-loss rule.
  verdict:    he is not over-trading a few names and second attempts are not the leak — do not put a
              re-entry rule in front of him.
```

---

## 3. PRE-TRADE CHARACTERISTICS KNOWABLE AT ENTRY

21 variables tested: %Gap, %ATR-of-gap, RVOL, log Float, log Avg$Vol, ADR, ADR%, ATR, ATR%, OR Size $,
OR %ATR, OR÷ADR, OR÷30mATR, Prior Close Loc, Dist 20 SMA, Dist 50 SMA, %VWAP, distance to PDH/PDC/PDL
in ATR units, Breakout Vol Ratio.

**Protocol:** median split on `practice` first (21 tests), carry anything at p<0.10 to `live` at the
*practice-derived* cut. Then, separately and transparently, the same 21 splits run in-sample on `live`.

```
[T2-REJECT]  No pre-trade characteristic separates good trades from bad.
  numbers:    PRACTICE discovery, 21 tests, exactly 2 at p<0.10 (chance expectation ~2.1):
                Prior Close Loc  lo n=126 expR=−0.23 / hi n=122 expR=+0.19, p=0.009
                Dist-to-PDL(ATR) lo n=123 expR=−0.19 / hi n=122 expR=+0.14, p=0.040
              LIVE out-of-sample confirmation at the practice cut — BOTH FAIL:
                Prior Close Loc <=62.2  n=43 expR=+0.47 [−0.15,+1.20] / >62.2 n=28 expR=+0.12 [−0.40,+0.76]
                                        p=0.510  — and the sign REVERSES vs practice
                Dist-to-PDL     <=0.86  n=29 expR=+0.17 [−0.48,+0.96] / >0.86 n=42 expR=+0.44 [−0.15,+1.11]
                                        p=0.591
              LIVE in-sample, all 21 splits: every 95% CI on both sides of every split crosses zero;
              smallest p = 0.090 (ADR%), next 0.188 — i.e. one hit at p<0.10 from 21 tests. Chance.
  mechanism:  none — and that is informative. His entries are already screened by a human on a chart;
              the numeric residual after that screen carries no extra information.
  confounds:  artifact #1 not engaged (outcome is realised R, not MFE). Multiple testing handled by
              pre-declaring the practice->live protocol rather than mining live. Negative control below.
  verdict:    the strongest, best-powered result in this track — there is no screening variable hiding
              in the enrichment columns; do not build an entry filter out of them.
```

```
[T3-HYPOTHESIS]  Low-ADR% (low-volatility) names carried the month — but the result does not survive.
  numbers:    LIVE ADR%<=2.96% n=36 expR=+0.74 [−0.02,+1.57] sumR=+26.5 | >2.96% n=35 expR=−0.10
              [−0.52,+0.40] sumR=−3.4, p=0.091 (1 hit from 21 in-sample tests)
              Robustness: remove the low bucket's single largest winner -> expR=+0.52, sumR=+18.3;
              remove its three largest -> expR=+0.18 [−0.35,+0.77], sumR=+6.0.
              Same cut on PRACTICE: lo n=129 expR=+0.01 / hi n=116 expR=−0.07, p=0.623. No replication.
              Session view: the low bucket's +26.5R is 4 sessions (8/03 +8.9, 8/13 +11.1, 8/19 +8.2, 8/06 +5.9).
  mechanism:  plausible — ADR% is nearly a restatement of instrument class (100% of index ETFs and 73% of
              mega-caps fall below the cut; only 6% of "other stock" does), so this is the class result
              re-expressed, and the class result is itself 3 trades.
  confounds:  CONFOUNDED with instrument class by construction (checked and reported). Effective n is
              ~4 sessions, not 36 trades. Fails out-of-sample on practice at the same cut.
  verdict:    almost certainly the same three big index-ETF winners wearing a different label — register
              it, do not trade it.
```

```
[NEGATIVE CONTROL — not a finding]  What a real signal would have looked like.
  numbers:    a deliberately look-ahead variable (entry price vs the trade date's eventual daily HIGH,
              in ADR units) splits both books hard: practice p=0.000 (+0.27 vs −0.32), live p=0.039
              (+0.82 vs −0.19).
  verdict:    the pipeline detects genuine separation when it exists. Nothing knowable at entry came
              within an order of magnitude of that. The 21-variable null is a real null, not a dead test.
```

---

## 4. THE EXTENSION METRIC  *(highest-value item in this track)*

### 4.1 Construction
For a long ORB the breakout level is the opening-range high `orH`. Define

```
extAbs = ent − orH                (dollars beyond the breakout level; negative = entered inside the OR)
extOR  = extAbs / orSize          (in OR-size units — "how many opening ranges past the trigger")
extATR = extAbs / atr             (in daily-ATR units — cross-symbol comparable)
ext30  = extAbs / m30             (in 30mATR units — opening-volatility comparable)
posOR  = (ent − orL)/orSize       (0 = OR low, 1 = OR high, >1 = above the range)
```
Supporting, and knowable at entry for **all** trades: `openExt30 = (ent − O)/m30`, `%VWAP`,
distance to PDH/PDC/PDL in ATR units.

**Critical scope limit.** 35 of 71 live entries occur *before* 9:35, i.e. while the opening range is
still forming. For those, `orH` is defined partly by his own entry bar, so `extOR <= 0` is close to
mechanically guaranteed (live pre-9:35 max extOR = +0.15). Compliance can only be honestly measured
on the 36 post-9:35 trades. Both views are reported.

### 4.2 Is he following his own rule?

```
[T3-HYPOTHESIS]  Yes. He is not a chaser — on the OR definition, compliance is high.
  numbers:    LIVE all 71: extOR p10=−0.35 p25=−0.25 med=−0.06 p75=+0.15 p90=+0.34 max=+1.28
                           extATR med=−0.03, p90=+0.12 (i.e. ~1/8 of a daily ATR past the trigger)
                           68% of entries at or BELOW the OR high; only 5/71 (7%) more than 0.5 OR beyond.
              LIVE post-9:35 (n=36, the clean test): med extOR=+0.14, p90=+0.77, max=+1.28
                           39% at/below OR high, 19% within 0.25 OR, 28% at 0.25–0.5 OR,
                           8% at 0.5–1.0 OR, 6% beyond 1.0 OR.
                           In ATR terms med=+0.03, p90=+0.19 — small in every case.
              PRACTICE post-9:35 (n=146): med extOR=+0.12, p90=+0.77 — identical behaviour, so this is
                           a stable trait, not a one-month artefact.
  mechanism:  he enters at or into the trigger, and half his trades are anticipation entries placed
              before the range even completes — the structural opposite of chasing.
  confounds:  the 68% headline is inflated by the pre-9:35 subset where non-extension is definitional;
              that is why the post-9:35 figure is quoted alongside. Artifact #8 does not apply (entry
              price and OR are both knowable/fixed, not exit-defined).
  verdict:    first-ever measurement of this rule: 14% of his genuine post-OR entries are more than half
              an opening range extended, and essentially none are extended in volatility terms. He is
              complying — which means the discipline he spends on this rule is buying him very little.
```

### 4.3 Does extension predict outcome?

```
[T2-REJECT]  Extension does not predict outcome, on any operationalisation, in either book.
  numbers:    LIVE median splits (n=71): extOR p=0.644 · extATR p=0.264 · ext30 p=0.204 · posOR p=0.641
                     %VWAP p=0.968 · openExt30 p=0.125
              LIVE post-9:35 (n=36): extOR p=0.199 · extATR p=0.215 · openExt30 p=0.589
              PRACTICE (n=247, well powered): extOR p=0.419 · extATR p=0.975 · ext30 p=0.803
                     posOR p=0.415 · openExt30 p=0.375 · %VWAP p=0.625
              Band table, LIVE, all trades:
                     ext<=0        n=48 win%=25 expR=+0.30 [−0.19,+0.84] sumR=+13.9
                     0–0.25 OR     n= 8* expR=+0.82   0.25–0.5 OR n=10* expR=−0.13
                     0.5–1.0 OR    n= 3* expR=−0.70   >1.0 OR     n= 2* expR=+3.00
              PRACTICE bands (all n>=19 except the top): −0.01 / −0.08 / −0.01 / −0.01 — flat to four decimals.
              Where a direction exists at all (live extATR/ext30, p=0.20–0.26) the MORE extended half did
              BETTER (+0.61 vs +0.05), i.e. opposite to the rule's premise.
  mechanism:  none — pattern absent. The plausible story ("chasing buys the top of the impulse") simply
              does not show up.
  confounds:  ARTIFACT #1 EXPLICITLY TESTED AND RULED OUT — see 4.4.
              Artifact #2/#3 not engaged (no duration or partials variable used).
  verdict:    a well-powered null on 247 practice trades and a consistent null on 71 live trades:
              how far past the opening-range trigger he enters has no measurable bearing on the result.
```

### 4.4 Artifact #1 control — does a more extended entry mechanically widen the stop?

```
[CONTROL RESULT]  No. The R-normalisation artifact is NOT operating on the extension metric.
  numbers:    corr(extOR, stopDistance/ATR) = −0.004 (live, n=70) and −0.020 (practice, n=244)
              corr(extATR, stopDistance/ATR) = −0.101 (live) and −0.115 (practice)
              corr(extOR, stopDistance/ORsize) = +0.195 (live) / +0.067 (practice) — the only positive,
              and it is mild and OR-scaled on both axes.
              Mean stop width by extension band is FLAT: live 0.173 / 0.134 / 0.170 ATR for
              ext<=0 / 0–0.5 / >0.5; practice 0.141 / 0.134 / 0.109 ATR.
              Re-tested with two stop-distance-free outcome measures on the 60 arithmetically-consistent
              live rows — MFE in ATR units (maxR x stopDist / atr) and realised move in ATR units:
                     ext<=0    n=39 MFE_ATR=0.15 RET_ATR=−0.087 win%=10%
                     ext 0–0.5 n=17 MFE_ATR=0.24 RET_ATR=+0.009 win%=12%
                     ext>0.5   n= 4* MFE_ATR=0.13 RET_ATR=−0.083 win%=0%
                     practice: 0.24/0.23/0.10 MFE_ATR, −0.021/−0.027/+0.010 RET_ATR — no monotone pattern.
              Win rate — which has no R in it at all — is flat across bands in both books.
  verdict:    he sizes his stop off structure, not off how far he chased; the null in 4.3 is a real null,
              not MFE deflation.
```

### 4.5 Construct validity — my metric is not measuring what HE means by "extended"

```
[T3-HYPOTHESIS]  His "extended entry" tag refers to the 60-minute/daily chart, not the opening range.
  numbers:    4 practice trades are self-tagged extended; 3 of the 4 are ALSO tagged "60m-extended".
                2026-05-12 QUBT  extOR=−0.16  (pre-9:35)      2026-05-13 NBIS  extOR=−0.17 (pre-9:35)
                2026-05-14 SPY   extOR=+0.52  (post-9:35)     2026-06-02 CRWV  extOR=−0.01 (pre-9:35)
              Mean extOR of self-tagged-extended trades = +0.05 vs untagged median −0.06. Barely different;
              three of the four are NEGATIVE on the OR measure.
  mechanism:  he judges extension against higher-timeframe structure (60m range, prior-day levels,
              distance from moving averages), not against the 5-minute opening range.
  confounds:  n=4 — this is a construct-validity observation, not a performance test.
  verdict:    the OR-based metric is a valid measure of *chasing the breakout* but it is NOT his rule;
              so the higher-timeframe operationalisations were tested too — all null (next block).
```

```
[T2-REJECT]  Higher-timeframe "extension" is also null.
  numbers:    Distance above PDH in ADR units:  live p=0.845 · practice p=0.428
              Distance above the day's open in ADR units: live p=0.310 · practice p=0.516
              Dist 20 SMA: live p=0.682 · practice p=0.416 | Dist 50 SMA: live p=0.646 · practice p=0.719
              %VWAP at entry: live p=0.971 · practice p=0.625 | Prior Close Loc: live p=0.235,
              practice p=0.009 but FAILED and reversed on live (p=0.510).
              Descriptive: his %VWAP at entry is >= 0 on 71/71 live trades (min −0.03%, median +1.05%) —
              he essentially never buys below VWAP. There is no below-VWAP comparison group to test.
  mechanism:  none found.
  confounds:  same protocol and artifact checks as section 3.
  verdict:    on every extension definition the data can support — opening range, prior-day high, the
              open, the 20/50 SMA, VWAP — extension does not separate his winners from his losers.
```

### 4.6 The confound that dwarfs extension (cross-track — belongs to H8/timing)

```
[T3-HYPOTHESIS]  Whether he enters before or after 9:35 mechanically determines extension, and it is a
                 far larger effect than extension itself — but it does not replicate.
  numbers:    LIVE pre-9:35   n=35 win%=34 expR=+0.79 [+0.03,+1.65] sumR=+27.0
              LIVE post-9:35  n=36 win%=11 expR=−0.11 [−0.52,+0.43] sumR= −3.9   p=0.066
              Removing the single biggest pre-9:35 winner: expR=+0.57 [−0.07,+1.30], sumR=+18.8 — CI
              now crosses zero.
              PRACTICE pre-9:35 n=101 expR=−0.03 sumR=−3.1 | post-9:35 n=147 expR=−0.02 sumR=−3.2, p=0.955.
  mechanism:  anticipation entries get a tighter stop against the forming range and a better fill; but
              the practice book, five times larger, shows nothing at all.
  confounds:  artifact #8 not engaged. Zero out-of-sample support. In-sample on live only. This is H8's
              territory (pre-registered as "9:30–9:35 underperforms") and the live data points the other
              way — the timing track owns the verdict.
  verdict:    flagged here because it is the reason the OR-extension metric splits the book roughly in
              half; any future extension analysis must condition on entry time.
```

---

## 5. CATALYST AND ORIGIN

```
[T2-REJECT]  Logging a catalyst does not identify better trades.
  numbers:    LIVE      any catalyst n=35 expR=+0.53 [−0.13,+1.31] sumR=+18.6
                        no catalyst  n=36 expR=+0.13 [−0.41,+0.79] sumR= +4.5   p=0.414
                        Earnings/News n=15 expR=+0.87 [−0.37,+2.41] sumR=+13.1 — CI crosses zero
                        Day 2 n=10* · Gap Only n=6* · Sector Momentum n=3* · Key Daily Level n=1*
              PRACTICE  any catalyst n=61 expR=+0.00 / none n=187 expR=−0.03, p=0.859
                        Earnings/News n=13* expR=+0.10 — the live Earnings/News result does NOT replicate
                        Key Daily Level n=18 expR=−0.28 sumR=−5.0 (worst practice catalyst; live n=1)
  mechanism:  a genuine catalyst should widen the day's distribution, and Earnings/News is the only
              category pointing that way — but on 15 trades with a CI three times its own width.
  confounds:  ARTIFACT #9 IS DECISIVE HERE. Catalyst is 49% filled and the blanks are not random —
              journal abandonment clusters on bad days (8/26, 8/28), so "catalyst logged vs not" is
              partly "day he was still journalling vs not". The comparison cannot be cleaned.
  verdict:    no usable signal, and the one suggestive cell (Earnings/News) fails to replicate on the
              larger book; treat catalyst as a descriptive field until coverage is complete.
```

```
[T2-REJECT]  Origin (Watchlist vs Intraday discovery) has no effect.
  numbers:    LIVE      Watchlist n=44 expR=+0.38 [−0.23,+1.09] sumR=+16.5
                        Intraday  n=26 expR=+0.25 [−0.30,+0.88] sumR= +6.6   p=0.814
              PRACTICE  Watchlist n=88 expR=−0.10 [−0.40,+0.24] sumR=−9.2
                        Intraday  n=35 expR=+0.06 [−0.31,+0.47] sumR=+2.0   p=0.585
              The sign FLIPS between books. Both CIs cross zero in both books.
  mechanism:  pre-market preparation should help, and the live direction is the "right" one — but the
              practice book says the opposite with more data.
  confounds:  Origin is auto-derived from the Daily Plan, so it is not outcome-contaminated (unlike
              artifact #6 fields). Practice Origin is only 50% filled (plan feature shipped mid-book).
  verdict:    null with sign instability — preparing a name in advance is not, by itself, worth anything
              measurable in this data.
```

---

## 6. MTF ALIGNMENT (Daily/1H/5m trend + conviction, L2 Bias)

```
[UNDERPOWERED]  MTF alignment cannot be evaluated — and the little signal there is points both ways.
  numbers:    Coverage: 31/71 live rows and 46/248 practice rows carry all three trend reads.
              LIVE      all 3 Bullish n=18 expR=+0.18 [−0.70,+1.39] / not n=13* expR=−0.10, p=0.747
                        Daily+1H both Bullish n=20 expR=+0.10 [−0.69,+1.17] / not n=11* expR=+0.01, p=0.908
                        MTF conviction sum > median: n=3* — unusable
                        L2 Bullish n=12* expR=+0.75 / L2 Neutral n=18 expR=−0.18 / blank n=41 expR=+0.43
              PRACTICE  all 3 Bullish n=19 expR=+0.07 / not n=27 expR=−0.16, p=0.669
                        Daily+1H both Bullish n=27 expR=−0.25 / not n=19 expR=+0.20, p=0.377
                        — SIGN FLIPS versus live on his own stated rule.
  mechanism:  the stated rule (daily and hourly must look good) is standard and plausible; the data
              cannot speak to it.
  confounds:  coverage is 44–49% and, like Catalyst, is missing-not-at-random (artifact #9). Every
              sub-cell is at or below the n>=15 floor; the two books disagree in sign.
  verdict:    plainly underpowered — 31 usable live rows split into cells of 11–20 with CIs ~2R wide.
              Not testable this month and not testable next month either unless coverage reaches ~100%.
```

```
[T3-HYPOTHESIS]  Conviction = 1 is the only pre-market-knowable variable that replicates across books.
  numbers:    LIVE      conv=1  n= 8* win%= 0 expR=−0.74 [−0.92,−0.54] sumR= −5.9
                        conv>=2 n=26  win%=31 expR=+0.62 [−0.15,+1.53] sumR=+16.2   p=0.100
              PRACTICE  conv=1  n=16  win%= 6 expR=−0.54 [−0.81,−0.21] sumR= −8.6
                        conv>=2 n=96  win%=30 expR=+0.16 [−0.13,+0.48] sumR=+15.1   p=0.067
              POOLED    conv=1  n=24  win%= 4 expR=−0.60 [−0.79,−0.37] sumR=−14.5
                        conv>=2 n=122 win%=30 expR=+0.26 [−0.04,+0.57] sumR=+31.3   p=0.017
              1 winner in 24 conviction-1 trades across both books.
  mechanism:  strong and simple — Conviction is auto-filled from the Morning Plan, i.e. recorded
              PRE-MARKET, before any outcome exists. A trader's own low-confidence flag on a setup he
              took anyway is the most informative thing in the dataset. Not retrospective, so artifact #6
              does NOT apply.
  confounds:  live cell is n=8, below the n>=15 floor — this is NOT a live finding on its own. It is a
              practice finding (n=16, CI excludes zero) that reproduces in direction, win rate and
              magnitude on live. Coverage is only 48% live / 45% practice, and missingness is not random
              (artifact #9) — the untagged 37 live trades may hide either result.
  verdict:    the single most promising selection lead in this track, and the only one worth carrying to
              next month — but it needs full Conviction coverage before it can be acted on.
```

---

## TESTS EXAMINED: 96

21 practice median splits + 2 practice->live confirmations + 21 live in-sample median splits +
15 extension splits + 10 extension/stop correlations + 10 timing-and-robustness splits +
4 catalyst/origin comparisons + 6 MTF comparisons + 3 conviction comparisons + 4 class/attempt tests.

At n=71 with 96 tests, roughly 5 results should reach p<0.05 by chance alone. **Exactly zero did on
live for any variable knowable at entry** (smallest live p among the 21 pre-trade characteristics = 0.090;
smallest among all extension operationalisations = 0.199). The only p<0.05 in the entire track is the
pooled Conviction=1 comparison (p=0.017), which is cross-book and pre-market-recorded, and the
deliberately look-ahead negative control (p=0.000), which is not a finding.

---

## TOP 3 THINGS THE TRADER SHOULD KNOW

**1. You are following your anti-extension rule, and it is not the thing that is costing or making you
money.** First measurement ever: median entry is 0.06 opening-ranges *below* the trigger; 68% of live
entries are at or inside the OR high; only 7% are more than half an OR extended, and in ATR terms the
90th percentile is 0.12 ATR past the trigger. On the honest subset — the 36 entries placed after 9:35,
where the range actually existed — 14% are more than half an OR extended. And extension predicts nothing:
six operationalisations on 71 live trades (p=0.20–0.97) and six on 247 practice trades (p=0.38–0.98), all
null, with the stop-width artifact explicitly ruled out (correlation between extension and stop-in-ATR
= −0.004). Two caveats you should hear: your own "extended" tags mean *60-minute* extended, not
opening-range extended — and those higher-timeframe versions are null too. Stop paying attention tax to
this rule; it is already habit and it is not the variable.

**2. Nothing you can see at entry sorts your trades.** 21 pre-trade characteristics — gap, RVOL, float,
dollar volume, ATR, ADR, OR size, OR-vs-ATR, distance to PDH/PDC/PDL, distance to the 20 and 50 SMA,
prior close location, %VWAP — screened on 248 practice trades and confirmed out-of-sample on live. Two
practice hits at p<0.10, exactly the number chance predicts from 21 tests, and both died on live (one
reversed sign). A known look-ahead variable splits the same data at p=0.000, so the test is not blind.
Meanwhile +23.1R came from 5 trades and +30.7R from the top 5 with the remaining 66 at −7.6R; 68% of the
month sits in 3 index-ETF trades on 2 sessions. The month is a tail, not a filter. Do not build an entry
screen out of the enrichment columns — the edge, if there is one, is in management, not selection.

**3. Fill in Conviction on every trade — it is the only selection variable with a pulse.** Across both
books, 24 trades you yourself marked Conviction=1 pre-market produced **1 winner and −14.5R**
(expR −0.60, 95% CI [−0.79, −0.37]); the 122 marked 2 or 3 produced +31.3R (p=0.017). It is recorded
before the open, so it is not hindsight, and it is the one variable that reproduces on live in direction,
win rate and magnitude. It is also only 48% filled, and the blanks cluster on your worst days. Get it to
100% coverage next month and this becomes a decision rule — skip your own 1s, or take them at a fraction
of size. Right now it is the best lead in the selection track and it is 8 live trades from being
actionable. (Related and separate: your mix drifted from 31% to 45% non-mega single names, the only
bucket that is flat-to-negative in both books, and MTF alignment is simply untestable at 44% coverage —
fill it or drop it.)
