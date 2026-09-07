# R2 — EXECUTION AND CAPTURE

Track: execution & capture, rebuilt on `Position MFE (R)`, the real stop ladder, and `# Entries`/`# Exits`.
All previous-round capture, stop and hold-time findings are treated as void and re-derived from scratch.
Live n=70 usable of 71 (one row has no ladder). Practice n=224–232 depending on field.

---

## 0. MEASUREMENT AUDIT — read this before any capture number

I reverse-engineered `Peak Position Value ($)` before using it, and it is not what the name implies.

```
peak$ = finalShares x (session high AFTER first entry  -  average entry)
```
Verified: 49/54 live and 144/157 practice first-trade-of-symbol-day rows match
`shares x (daily H - avg entry)` to within 2%. The misses are all later-in-day entries, where the
post-entry high is below the daily high — consistent with the same formula.

Three consequences, all severe:

1. **It ignores the exit.** 2026-08-04 SOXL was held 1.5 minutes and closed at −1.00R; its `posMFE`
   is 5.48R, entirely from price action hours after he was flat. 2026-08-07 SPY: held 1.9 min,
   −0.90R realised, `posMFE` 7.71R, stop-aware MFE 0.80R.
2. **It ignores the stop.** Sixteen live trades were stopped out; they still carry a median `posMFE`
   of 2.76R earned after the stop-out.
3. **It values everything at final size**, which is artifact #12 as documented.

`posMFE` *does* mathematically bound realised R — 0 violations in 70 live rows, versus 5 violations
for `Max R Before Stop` — so it is a valid ceiling. It is just an extremely loose one.

I therefore built a **stop-aware, full-size MFE**: `finalShares x (Farthest Price - avgEntry) / initialRisk`.
`Farthest Price` is the price at the stop-truncated maximum, so this keeps `posMFE`'s correct size
treatment while removing the fiction that he was still in a trade the stop had already ended.
It bounds realised R on 69/70 live rows (one miss: 2026-08-04 PLTR, where size grew after the peak).
**Every capture number below is reported under both benchmarks.** Where I say "offered", I mean
stop-aware.

---

## 1. WHAT THE MARKET OFFERED

```
[T3-HYPOTHESIS]  Opportunity is bimodal: ~40% of live entries never went anywhere at all,
                 and the month's entire profit sits in a dozen trades.
  numbers:    live n=70. posMFE <1R: n=18, expR=-0.67, 95% CI=[-0.82,-0.52], sumR=-12.1, win%=0
              posMFE 1-2R: n=9*, expR=-0.50, sumR=-4.5, win%=0
              posMFE 2-4R: n=13*, expR=-0.77, sumR=-10.0, win%=0
              posMFE 4-8R: n=18, expR=+0.89, 95% CI=[0.07,1.81], sumR=+16.0, win%=50
              posMFE >=8R: n=12*, expR=+2.50, 95% CI=[0.79,4.32], sumR=+30.0, win%=58
              Stop-aware: 30/70 (43%) never offered 1R; 25/70 (36%) offered >=2.5R.
              Concentration: top 3 trades = +21.3R = 110% of the +19.4R month.
              Top 3 days = +24.0R; the other 16 sessions sum to -4.6R.
              Practice is the same shape: top 2 of 224 trades = 154% of its +14.5R.
  mechanism:  Long-only ORB. A break either extends or it does not; there is no middle. The
              posMFE 1-4R band is 22 trades with a 0% win rate, which is the signature of entries
              that ticked up briefly and rolled over.
  confounds:  Artifact #1 (R-normalisation) — buckets are in R and R varies with stop distance, so
              wide-stop trades are pushed left. Checked: median initial risk is $15.19 with an
              interquartile spread of roughly $13-$18, so bucket assignment is not being driven by
              stop width. Artifact #12 — posMFE inflates with size, so the >=8R bucket is enriched
              in pyramids (10 of 12 are multi-entry); the stop-aware version shifts the boundary
              but not the shape.
  verdict:    The month is not a distribution of outcomes; it is three trades plus noise, and one
              month at n=70 cannot distinguish that from luck. Live vs practice opportunity is
              near-identical in shape (median posMFE 2.92 live vs 3.88 practice), so the live
              month did not offer him a better tape — it offered him a slightly worse one.
```

---

## 2. CAPTURE, DONE PROPERLY — your preliminary numbers reproduce exactly, and they are misleading

```
[T2-REJECT]  "He captures 5% of peak and left 76.6R on the table" is arithmetically correct and
             analytically wrong. Against a benchmark he could actually have reached, it is ~40%
             and ~37R.
  numbers:    YOUR FIGURES, REPRODUCED EXACTLY on live n=70:
                capture of peak (sum realised R / sum posMFE) = 19.4/319.1 = 6.1%; in dollars 5.4%
                reached 2.5R (posMFE test) = 38/70 (54%)
                target capture at 2.5R      = 19.5%
                R left on the table         = 76.5R
              THE SAME QUANTITIES, STOP-AWARE (benchmark truncated when his stop was hit):
                reached 2.5R = 25/70 (36%)   target capture = 40%   R left = 37.4R
                reached 2.0R = 29/70 (41%)   target capture = 31%   R left = 40.0R
                reached 3.0R = 24/70 (34%)   target capture = 43%   R left = 41.1R
              THE FULL BENCHMARK LADDER, live, sum-of-benchmark / capture:
                posMFE (day-long, full size, ignores stop AND exit)   319.1R ->  6.1%
                stop-aware full-size MFE                              246.9R ->  7.9%
                first-lot stop-aware (old Max R Before Stop)          131.5R -> 14.8%
                provable in-window LOWER bound (his own stop+exit fills) 22.8R -> 85.2%
              His own 2.5R target (section 6, the only benchmark he was actually aiming at):
                offered 16/70, median capture of that target = 60%, leak = 21.1 R_last.
  mechanism:  The 5% figure divides by a number that includes (a) price action after he was flat,
              (b) price action after his stop was hit, (c) size he only briefly held. None of the
              three was capturable. The 85% figure divides by a number containing only excursion
              he provably saw. Neither end is the answer; the honest statement is that his capture
              is bounded in [6%, 85%] and the best-constructed estimate is ~40% of a reachable
              2.5R target, ~60% of his own target.
  confounds:  Artifact #5 checked — I did not use `Max R Before Stop` for any pyramid; the stop-aware
              benchmark uses final size exactly as posMFE does. Artifact #12 checked — both
              benchmarks share the same size treatment, so the comparison between them isolates
              the stop/exit-window effect, not size. Artifact #13 checked — section 6 redoes it
              against his actual target definition.
  verdict:    Do not tell him he captures 5%. Tell him that on the roughly one trade in three where
              the tape genuinely paid 2.5R, he banked about 40% of it — a real leak, roughly half
              the size the headline implies, and one that is measurable rather than fictional.
```

```
[T3-HYPOTHESIS]  Practice-to-live improvement in capture is directionally real but not significant.
  numbers:    capture of his own 2.5R target, among trades the tape offered it:
              live  n=16*, mean 47%, 95% CI=[22%,72%]
              practice n=75, mean 31%, 95% CI=[18%,43%]   p=0.268
              Aggregate capture also rose: posMFE-based 1.4% -> 6.1%, stop-aware 2.4% -> 7.9%.
  mechanism:  Plausible — more stop raises per trade and longer median winner holds live.
  confounds:  Different tape (VIX 14.25-17.09 live vs 15.03-22.22 practice, established fact).
              n=16 live is below the n>=15 line only barely and the CI is 50 points wide.
  verdict:    Suggestive, underpowered, and confounded with regime. Carry to next month; do not
              bank it as evidence of skill acquisition.
```

---

## 3. MAE AND STOPS

```
[T3-HYPOTHESIS]  He never once trailed a stop to breakeven — not in 70 live trades, not in 226
                 practice trades, not even on the 25 trades that reached 2.5R.
  numbers:    live: stop high-water reached >= entry on 0/70. Median high-water = -0.98R below entry.
              38/70 trades had at least one stop raise (median 1, max 7), and the raises still
              never crossed the entry price.
              Among the 25 trades that reached >=2.5R stop-aware: 0/25 ever had a breakeven stop;
              median high-water -0.12R. He gets to within a tenth of an R and stops.
              Practice: 0/226; median high-water -0.81R; 0/75 among the >=2.5R group.
              Winners stopped out: 0/15. Losers stopped out: 16/55.
  mechanism:  Directly readable from the `Stop Ladder`. The consequence is structural: every open
              position carries full initial risk until he manually closes it, and the stop ladder
              is behaviourally inert on winners — it never determines a winning exit. 100% of his
              profitable exits are discretionary decisions taken under live P&L pressure.
  confounds:  Not a statistical claim, so no sampling confound. Checked the stop ladder against the
              exit ladder to exclude the broker's flatten-time stop reset (I drop any stop
              placement at or after the last exit fill). Checked against both avg entry and first
              entry — same answer.
  verdict:    The single most mechanically actionable fact in this track, and it is a fact rather
              than a statistic. It does not by itself say he *should* trail to breakeven (that has
              its own cost, see below) — it says his stop system currently does exactly one job,
              limiting the initial loss, and does none of the work of protecting a gain.
```

```
[T2-CONFIRM]  He honours his own stops, and this improved materially from practice to live.
  numbers:    live: price traded beyond the initial stop while he still held on 16/70 (23%);
              this matches `Stopped Out?`=Y exactly, 16 of 16 — no silent stop-widening.
              Of those 16 breaches, only 1 realised worse than -1R. Across all 70 live trades only
              2 losses are worse than -1.2R; the worst loss in the month is -1.60R.
              practice: 55/226 breaches (24%), of which 13 realised worse than -1R; worst loss -3.90R.
  mechanism:  Straightforward discipline, visible in the ladder rather than self-reported.
  confounds:  Artifact #7 avoided entirely — this uses the order ladder and the MAE walk, not the
              `Process Followed?` self-label. MAE is measured over the actual holding window, so
              it is the right window for this test (unlike posMFE).
  verdict:    Genuine, mechanically verified improvement. Tail risk per trade has been roughly
              halved. This is the one thing in the execution track that is unambiguously better.
```

```
[T2-REJECT]  Discretionary loss-cutting does NOT beat a mechanical stop. It is a dead heat, in
             both books, and it forfeits real recoveries.
  numbers:    live losers n=52: mean realised -0.70R vs -0.72R under a mechanical -1R stop.
              practice losers n=161: mean realised -0.75R vs -0.74R mechanical.
              He cuts early (better than -0.9R) on 28/52 live losers, mean -0.41R.
              Of those 28 early cuts, the stop-aware MFE later reached >=1R on 13 and >=2.5R on 4.
              Full stop-level counterfactuals on the real ladder, live n=70 (valid only for stops
              TIGHTER than his actual — a wider stop's price path is unknowable):
                actual        sumR=+19.4  expR=+0.28  CI=[-0.18,+0.79]
                stop -0.40R   sumR= +4.8  expR=+0.07  CI=[-0.25,+0.45]  p=0.50
                stop -0.50R   sumR= +6.5  expR=+0.09  CI=[-0.25,+0.50]  p=0.56
                stop -0.60R   sumR= +4.5  expR=+0.06  CI=[-0.28,+0.46]  p=0.51
                stop -0.75R   sumR=+14.0  expR=+0.20  CI=[-0.22,+0.70]  p=0.82
                stop -0.90R   sumR=+17.0  expR=+0.24  CI=[-0.19,+0.75]  p=0.92
                stop -1.00R   sumR=+15.4  expR=+0.22  CI=[-0.24,+0.73]  p=0.87
              PRACTICE runs the OTHER WAY: actual +13.6R, and every tightened stop beats it
              (-0.40R: +29.1R; -0.50R: +24.6R; -1.00R: +15.7R).
  mechanism:  None that survives. His early cuts save about 0.3R each on the trades he cuts, and
              give that back on the ~46% that would have recovered past 1R.
  confounds:  Artifact #1 — all counterfactuals are in R against the measured initial risk, so
              stop-width normalisation is consistent. The counterfactual is conservative and
              only tightens: it never assumes a trade survived a stop it actually hit. Every CI
              crosses zero and every p-value is >0.5, so nothing here is separable from noise.
  verdict:    The previous round's claim that his discretionary cutting beats a mechanical stop is
              rejected. Live and practice point in opposite directions, all CIs overlap heavily,
              and the two books' point estimates for actual-vs-mechanical differ by 0.02R. There
              is no stop-level edge here in either direction — leave the stop alone and stop
              optimising it.
```

```
[UNDERPOWERED]  Stop raises look enormously predictive and the effect is almost entirely reverse
                causality.
  numbers:    live, raw: 0 raises n=32, expR=-0.54 [-0.72,-0.28]; 1 raise n=18, expR=-0.38
              [-0.84,+0.24]; 2 raises n=7*, expR=-0.00; 3+ raises n=13*, expR=+3.34 [1.97,4.82].
              But median stop-aware MFE by bucket runs 0.28 / 2.00 / 2.60 / 7.81 and median
              duration 1.4m / 7.2m / 9.0m / 19.9m.
              Opportunity-matched (only trades that reached >=2.5R): raises>=2 n=16, expR=+2.66
              [1.30,4.15]; raises<2 n=9*, expR=+0.37 [-0.66,+1.56]; p=0.052.
  mechanism:  A stop raise cannot create profit. It can only truncate a loss or force an exit.
              He raises the stop *because* price is moving in his favour, so raise count is a
              proxy for both duration (artifact #2/#4 family) and for whether the trade worked.
              And since no raise ever reaches breakeven, on winners the raises never bind at all —
              0/15 winners were stopped out — so on exactly the trades where the raw split says
              raises "help", the raises had no causal role in the outcome whatsoever.
  confounds:  Artifacts #2 and #4 apply directly; opportunity-matching on stop-aware MFE removes
              some but not all of it (within the >=2.5R group, more raises still means a longer,
              larger move). The control cell is n=9, below the n>=15 line.
  verdict:    Not a finding. The number of stop raises is a readout of how the trade went, not a
              lever. Do not tell him to raise stops more.
```

---

## 4. HOLD TIME — H4

```
[T2-CONFIRM as a split / T2-REJECT as a lever]  H4 replicates on live with a large effect, but
                 posMFE shows it is almost entirely "the entry never worked", not "he exited early".
  numbers:    live: >=5min n=37, expR=+1.05, 95% CI=[+0.29,+1.84], sumR=+38.8, win%=41
                    <5min  n=33, expR=-0.59, 95% CI=[-0.77,-0.33], sumR=-19.4, win%=3
                    p=0.0003
              Survives dropping the largest winner: >=5min +0.83 vs <5min -0.59, p=0.0002.
              practice (origin): >=5min +0.95 vs <5min -0.60. Same direction, same size.
              THE DECOMPOSITION (stop-aware MFE, the whole point of this re-run):
                <5min  n=33: median MFE 0.31R; only 9/33 (27%) ever offered 1R; 3/33 (9%) offered 2.5R
                >=5min n=37: median MFE 3.43R; 31/37 (84%) offered 1R; 22/37 (59%) offered 2.5R
              OPPORTUNITY-MATCHED, live:
                offered>=2.5R: >=5min n=22 expR=+2.03 [0.87,3.23] | <5min n=3* expR=+0.40; p=0.36
                offered>=2.0R: >=5min n=25 expR=+1.74 | <5min n=4* expR=+0.20; p=0.30
                offered>=1.0R: >=5min n=31 expR=+1.35 | <5min n=9* expR=-0.30; p=0.080
                offered<1.0R:  >=5min n=6*  expR=-0.48 | <5min n=24 expR=-0.70
  mechanism:  Duration is downstream of whether the break extended (artifact #2, exactly as
              warned). 24 of the 33 short holds were trades the tape never paid at all — there was
              no longer hold available to take. The residual "exited early" component is the
              9 short-hold trades that did offer >=1R, and at n=9 it cannot be measured.
  confounds:  Artifact #2 is the whole story here and is handled by the opportunity match.
              Artifact #9 also applies: <5 min is defined by the exit and is not knowable at entry,
              so this can never become an entry rule. Every opportunity-matched control cell is
              n<=9, so the matched comparison is underpowered in both directions.
  verdict:    H4's raw split is real and replicates, but it is an outcome classifier, not an
              instruction. "Hold longer" is not available on the trades where he holds short.
              The previous round's H4 finding is void and its replacement is: hold time tells you
              whether the break worked, and nothing you can act on at entry.
```

---

## 5. EXIT QUALITY ON THE PYRAMID — H5 (restated as scaling out vs all-out)

```
[UNDERPOWERED]  H5 cannot be tested. He scaled out of 3 trades in the entire live month.
  numbers:    live nExits distribution: 1 -> 67 trades, 2 -> 2, 3 -> 1.
              scaled out n=3*, expR=+7.10, sumR=+21.3, win%=100
              all-out    n=67, expR=-0.03, 95% CI=[-0.36,+0.34], sumR=-1.9, p=0.0001
              practice: nExits 1 -> 221, 2 -> 2, 3 -> 3. scaled n=5*, expR=+3.46; all-out n=221, -0.02.
              The three scaled-out live trades ARE the three largest winners of the month
              (MRNA 2026-08-19 +9.0R, QQQ 2026-08-06 +6.9R, NVDA 2026-08-05 +5.4R) and together
              are 110% of the month's profit.
              Opportunity-matched (offered>=2.5R): scaled n=3* +7.10 vs all-out n=22 +1.11.
              Capture of what was offered: scaled 39%, all-out 15%.
  mechanism:  None available. He scales out only when a trade has already become the trade of the
              week; median duration of the scaled trades is 40.8 min vs 5.0 min for all-out, and
              median stop-aware MFE 10.59R vs 1.23R. This is the same selection structure as
              artifact #11 for adds, in its most extreme form.
  confounds:  Artifact #3 handled (I used `# Exits`, not the dead `# Partials`). Artifact #11
              structure applies. n=3 is far below the n>=15 line and the opportunity match does not
              help because all three sit in the top decile of opportunity.
  verdict:    H5 is untestable on live and untestable on practice. p=0.0001 on n=3 is meaningless.
              It is also worth noting the brief's stated rule is accurate: partials are genuinely
              not the norm — 96% of live trades are single-exit. If you want this question answered
              next month it requires deliberately scaling out of ordinary trades, not just the
              runners.
```

```
[T3-HYPOTHESIS]  Pyramiding shows no benefit once you control for opportunity. Artifact #11
                 is confirmed with the corrected data.
  numbers:    live raw: multi-entry n=27, expR=+1.25 [0.22,2.34], sumR=+33.7
                        single-entry n=43, expR=-0.33 [-0.60,-0.01], sumR=-14.3   p=0.0004
              but median stop-aware MFE 5.78R (multi) vs 0.50R (single), median duration 12.8m vs 1.9m.
              OPPORTUNITY-MATCHED (offered>=2.5R):
                        multi  n=21, expR=+1.80 [0.65,3.12]
                        single n=4*, expR=+2.00 [0.43,2.98]     p=0.9021
  mechanism:  He only adds after the trade has proved him right, so the raw split is definitional.
              Once both groups are conditioned on the tape having offered 2.5R, the gap vanishes
              entirely (1.80 vs 2.00, p=0.90).
  confounds:  The matched control cell is n=4, so this is a null with weak power rather than a
              demonstrated equivalence. Artifact #12 also matters: multi-entry trades are exactly
              the ones whose posMFE is size-inflated, which is why I matched on the stop-aware
              measure.
  verdict:    The adds are not what makes the good trades good. The raw +1.25R vs -0.33R split
              should not be quoted as evidence for pyramiding.
```

---

## 6. HIS OWN 2.5R TARGET — reconstructed on the LAST entry's risk

This has never been measured. Definition used: `R_last = totalShares x (last entry price - stop in
effect at the last entry)`, taken from `Entry Ladder` + `Stop Ladder` with a 5-second grace for the
broker writing the protective order after the fill. On single-entry trades this reduces exactly to
the initial risk — verified 43/43 live, 135/142 practice — so the definition is self-consistent.

```
[T3-HYPOTHESIS]  On a pyramid his own 2.5R target is a roughly 5x-initial-risk move, and he
                 essentially never reaches it: 4 of 70 live trades met his stated target.
  numbers:    live n=70. Median R_last / initial risk on the 27 multi-entry trades = 1.96x
              (practice 1.72x on 72 trades). So "2.5R" on a pyramid means ~4.9x the risk he
              originally committed.
              Target MET (realised >= 2.5 R_last):        4/70 (6%)
              Just short (2.0-2.5 R_last):                3/70
              Loss:                                      54/70 (77%)
              Median realised in R_last units:           -0.39
              Market OFFERED the target (stop-aware):    16/70 (23%)   [day-long posMFE: 28 (40%)]
              Of the 16 offered: took >=2.5 R_last on 4, undershot on 7, turned it into a LOSS on 5
              Median capture of his own target, among offered: 60%
              R_last left on the table vs his own target: 21.1
              Split by structure: single-entry met 3/43, multi-entry met 1/27
              When he does reach it he overshoots slightly — median 2.89 R_last (+0.39 past target)
              Framing sensitivity: counted against INITIAL risk he "hit 2.5R" on 10/70;
              counted against HIS OWN definition, 4/70.
  mechanism:  Mechanical and clean. Every add raises R_last, because he adds at a higher price while
              the stop trails behind, so each add moves his own goalpost further away in dollars.
              The result is that the trades he is most committed to are the ones whose target he is
              least likely to reach — 1 of 27 pyramids met it, versus 3 of 43 single entries.
  confounds:  Artifact #13 is the reason for this section, and this is the version that respects it.
              The "offered" test uses the stop-aware price path; the day-long posMFE version would
              say 28/70 and I do not believe that number for the reasons in section 0.
              Artifact #12 does not bite: R_last is measured in dollars from his own order ladder,
              not normalised by initial risk.
  verdict:    His exit rule as he states it is not a rule he is executing — 6% compliance. Either
              the target is wrong (it self-inflates every time he adds, which is the more likely
              reading) or the exits are. The 60% median capture among the trades that did offer it
              is far healthier than the 19% headline and says the leak is real but moderate.
```

```
[T3-HYPOTHESIS]  A trade that reaches 2.5R keeps going ~86-96% of the time, in both books.
                 His target may be set too early.
  numbers:    live, P(reach X+0.5R | reached X), stop-aware full-size MFE:
              1.0->1.5R 85% (40->34) | 1.5->2.0R 85% | 2.0->2.5R 86% | 2.5->3.0R 96% (25->24)
              | 3.0->3.5R 88% | 3.5->4.0R 100% (21->21) | 4.0->4.5R 95% | 5.0->5.5R 100%
              practice n=232 reproduces it: 78% / 90% / 90% / 95% / 94% / 90% / 87% / 90%.
              Set-and-forget bracket counterfactual (-1R stop, fixed target, no management), live:
                actual  sumR=+19.4 expR=+0.28
                -1R/+2.0R  +17.0 [-0.10,+0.59]  delta -2.4R  p=0.911
                -1R/+2.5R  +17.5 [-0.10,+0.65]  delta -1.9R  p=0.929
                -1R/+3.0R  +26.0 [-0.03,+0.83]  delta +6.6R  p=0.787
                -1R/+4.0R  +35.0 [ 0.00,+1.07]  delta +15.6R p=0.545
              practice, same: bracket beats actual at every target >=2R (+2.5R: +36.5 vs +13.6).
  mechanism:  Plausible: an ORB that has already travelled 2.5x its stop distance is, by
              construction, in a trending expansion, and momentum autocorrelation at that point is
              well documented. But see confounds — this is measured to the close, not to a time he
              would realistically still be holding.
  confounds:  Serious, and they are why this is T3 and not actionable. The excursion is measured to
              16:00 ET, so a 4R reading may be a 15:30 print on a trade he opened at 09:35 and
              would never have held. It is stop-aware but not hold-window-aware. Artifact #12
              applies to the size treatment. Every bracket CI crosses or touches zero, no p-value
              is below 0.5, and the +3R/+4R targets are chosen after seeing the data, which is
              exactly the 1-in-20 problem the brief warns about.
  verdict:    The most interesting hypothesis in this track and the least ready to act on. It needs
              a hold-window-truncated MFE (i.e. re-walk the minute bars only while a plausible
              trailing stop would have kept him in) before anyone changes a target on it. Register
              it for next month; do not raise the target now.
```

---

## 7. H7 — RightTheory?

```
[T2-CONFIRM as a split / rejected as information]  `RightTheory?` separates the book violently,
                 and the separation is a restatement of the outcome.
  numbers:    live: Yes n=28, expR=+1.62, 95% CI=[+0.66,+2.60], sumR=+45.3, win%=54
                    No  n=31, expR=-0.66, 95% CI=[-0.79,-0.53], sumR=-20.4, win%=0
                    p<0.0001. Blank n=11, sumR=-5.5.
              practice: Yes n=115 +0.53; No n=77 -0.69; p<0.0001. Blank n=34, sumR=+5.3.
              THE TELL: median stop-aware MFE is 5.68R for Yes and 0.65R for No (practice 2.16R
              vs 0.60R). The label tracks whether the market moved, not whether the read was right.
              Within opportunity-matched (offered>=2.5R): Yes n=19 +2.57 [1.40,3.83];
              No n=3* -1.10; p=0.031 — but n=3.
              Within failed-opportunity (offered<1R): Yes n=5* -0.88; No n=18 -0.56 — i.e. among
              trades that never worked, the "Yes" label is if anything slightly WORSE.
  mechanism:  Artifact #7, demonstrated rather than assumed. A 0% win rate in the "No" bucket is
              not a property any genuine pre-trade read achieves; it is what you get when the
              label is written after seeing the P&L.
  confounds:  Artifact #10 (missing-not-at-random) also present: 11 live rows are blank and they
              sum to -5.5R, so the labelled sample is not the whole book. The opportunity-matched
              test that would separate signal from hindsight has a control cell of n=3.
  verdict:    Confirmed as a descriptive split, rejected as evidence of read quality. It cannot be
              used to filter setups because it is not available before the trade. If he wants this
              to mean something he has to write the label pre-market, in the Morning Plan, not
              in the evening.
```

---

TESTS EXAMINED: 122

(4 measurement-integrity checks; 12 opportunity-bucket cells; 20 capture/benchmark computations;
24 stop-level and stop-behaviour tests; 12 hold-time tests including 4 opportunity-matched; 12
scaling/pyramiding tests; 12 target-reconstruction tests; 10 bracket counterfactuals; 16
continuation-ladder cells. Across 122 comparisons at alpha=0.05 roughly 6 false positives are
expected by chance, which is why every marginal p-value above — 0.052 for stop raises, 0.031 for
opportunity-matched H7, 0.080 for opportunity-matched H4 — is reported as underpowered rather than
as a finding.)

## TOP 3 THINGS THE TRADER SHOULD KNOW

**1. Your stop never protects a profit — not once in 296 trades across both books.**
Zero of 70 live trades and zero of 226 practice trades ever had the stop trailed to breakeven, and
that includes all 25 live trades that reached 2.5R (median stop high-water: 0.12R below entry). You
do raise stops — 38 of 70 live trades, up to 7 times — but never across the entry price. The
consequence is that 100% of your winning exits are discretionary decisions made under live P&L
pressure, with a full initial loss still on the table the entire time; 0 of 15 winners were ever
stopped out, so the stop ladder does literally no work on the trades where it would matter most.
This is a fact from the order ladder, not a statistic, which is what makes it the one item here you
can act on immediately. What it does *not* say is that a breakeven stop would have made more money —
that is untested and the mechanical-stop counterfactuals in section 3 are all nulls. It says your
current system has one job and does not have the other.

**2. The "you capture 5% and left 76.6R on the table" number is right and misleading. The real leak
is about half that.** Your arithmetic reproduces exactly. But `Peak Position Value` is
finalShares × (session high after entry − avg entry), measured to the 16:00 close, ignoring both
your exit and your stop — 2026-08-04 SOXL was flat after 90 seconds at −1.00R and still shows a
5.48R "peak". Against a stop-aware benchmark you reached 2.5R on 25 of 70 trades, not 38, and
captured 40% of it, not 19%, leaving 37R rather than 76.6R. Against your own target definition
(2.5R of the last entry's risk) you captured a median 60%. The honest bracket on your capture is
[6%, 85%]; the best-constructed estimate is around 40%. There is a real trail leak. It is roughly
half the size you were told, and the specific shape of it is that on 16 of the 70 live trades the
tape offered your own target and you converted 4, undershot 7, and turned 5 into losses.

**3. Your own 2.5R target is unreachable by construction on the trades you believe in most — and
you meet it on 6% of trades.** Because you add at higher prices while the stop trails behind, every
add inflates R_last: on the 27 multi-entry live trades, R_last is a median 1.96x your initial risk,
so "2.5R" becomes a ~4.9x-initial-risk move. You met that target on 1 of 27 pyramids versus 3 of 43
single entries. Four of seventy trades overall. Either the target definition needs to change (most
likely — anchor it to initial risk or to the average cost of the built position, not to the last
add) or the exits do. Separately, three results this month are *not* what they appear: scaling out
(n=3, and those three trades are 110% of the month's profit), pyramiding (+1.25R vs −0.33R collapses
to 1.80 vs 2.00, p=0.90, once matched on what the tape offered), and hold time (H4 replicates at
p=0.0003 but 24 of 33 short holds never offered 1R — the entries failed, you did not exit early).
None of the three is a lever. And the month itself is three trades plus noise: excluding the top
three days the other 16 sessions sum to −4.6R.
