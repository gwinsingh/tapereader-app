# TRACK: PSYCHOLOGY, DISCIPLINE, TIMING & JOURNAL QUALITY
**Book:** `live` (71 trades, 19 sessions, 2026-07-30 → 2026-08-28, +23.1R).
`practice` (248 trades, 54 sessions) used for out-of-sample replication only.
All analysis in R. Day-level fields are tested with **day-clustered** inference — the effective
n for anything logged once per session is **19, not 71**.

---

## 0. DATA-INTEGRITY FLAG — read this before any MFE/MAE finding in any track

```
[T3-HYPOTHESIS]  `Max R Before Stop` and `MAE (R)` are systematically broken on scaled-in trades,
                 and those are exactly the month's profitable trades.
  numbers:    9 live trades have maxR = 0.00 while realizing +1.7R to +8.2R, with MAE of -1.0R to -4.5R.
              maxR=0 rate by # Partials:  2 partials -> 3% (n=34) | 3 -> 28% (n=18) | 4+ -> 61% (n=18).
              Not driven by stop distance (rho(partials, stop%) = -0.08).
              7 of the 9 are pre-9:35 entries; 5 of them are among the month's 8 largest winners.
              Trades with 4+ partials carry sumR = +22.6R of the month's +23.1R.
  mechanism:  The enrichment walks 1-min bars from entry using `Avg Entry` and the formula stop
              (Avg Entry - R/Shares, with Shares = FULL final size). On a trade he scales into as
              it runs, the walk starts at the first-entry bar, whose price sits well below the
              blended Avg Entry. The tiny computed stop (median 0.66% of price, 0.12x daily ATR)
              is breached on bar one, the order-aware walker halts, and maxR is recorded as 0
              while MAE records a fictitious -3R to -4.5R excursion.
  confounds:  Artifact #3 says `# Partials` is a duration proxy; that is true but is not the driver
              here — this is an arithmetic bug in the enrichment, reproducible from the stored
              Avg Entry / Shares / Stop columns alone.
  verdict:    Every MFE-based conclusion this month (H4, H5, the Capture Tracker, the Execution
              Skill funnel, "capture %" by any split) is understated on precisely his best trades.
              Fix the enrichment to walk from the FIRST fill and to use the per-leg stop before
              anyone acts on an MFE number. I have flagged every place below where I relied on MFE.
```

---

## 1. PRE-MARKET PSYCH CHECK-IN (energy / tension / urge / sleep hrs / sleep score / readiness)

Coverage: 16 of 19 sessions for energy / tension / urge / sleep score / readiness (59/71 trades);
17 of 19 for sleep hours. Missing sessions: 8/04, 8/24, 8/28. Verified constant within each
session (0 sessions with >1 distinct value), so these are genuinely one pre-open observation
per day, replicated onto trades — **causally prior, which is what makes them worth testing at all.**

**Effective n is 16 sessions. Not 59 trades.** Everything below is reported that way.

```
[UNDERPOWERED]  No pre-market psych field predicts that session's R.
  numbers:    day-level Spearman vs session R (n=16-17 sessions):
                energy   rho= 0.03  permP=0.92
                tension  rho=-0.15  permP=0.58
                sleepH   rho= 0.14  permP=0.59
                sleepSc  rho= 0.21  permP=0.44
                ready    rho= 0.36  permP=0.17
                urge=Yes 11 sessions meanDayR=+2.08 | urge=No 5 sessions meanDayR=+0.56, permP=0.55
              composite z(energy) - z(tension) + z(ready): rho=0.41, permP=0.127, n=15 sessions.
  mechanism:  plausible (fatigue -> impaired inhibition) but not demonstrated here.
  confounds:  artifact #7 (day-level field -> n=19 not 71).
  verdict:    Null across the board. Keep logging — 16 sessions is nowhere near enough — but do
              not currently gate anything on these numbers.
```

```
[UNDERPOWERED]  The apparent "readiness edge" is an artifact of ignoring day-clustering.
  numbers:    Naive TRADE-level split at median readiness 80.5:
                ready >= 80.5  n=29  win%=38  expR=+0.82  95% CI [+0.04, +1.72]  sumR=+23.7
                ready <  80.5  n=29  win%=14  expR=+0.17  95% CI [-0.48, +0.97]  sumR= +4.8
              That CI clears zero — but readiness is one value per day. Re-run correctly:
                hi = 9 sessions, lo = 7 sessions.
                day-clustered bootstrap CI on hi expR = [+0.01, +1.79]  (barely clears)
                day-level permutation on mean session R:      p = 0.387
                day-permuted trade-level expR:                p = 0.310
              Robustness: hi expR ex-top-trade = +0.55, lo = -0.05; hi median trade R = -0.30,
              lo = -0.40 (the medians are nearly identical — it is a tail story).
              The 8 trades of >= +3R sit on sessions with readiness 76,76,80,83,84,85,86,87 —
              i.e. spread across both halves of the split.
  mechanism:  none established.
  confounds:  artifact #7 explicitly. Ruled the finding out by re-testing with day clustering.
  verdict:    REJECT. 9 sessions vs 7 sessions is not a finding, and once the label is permuted
              at the day level the effect evaporates (p ~ 0.31-0.39).
```

```
[T3-HYPOTHESIS]  Poor sleep predicts BEHAVIOUR on the day far better than it predicts R:
                 worse-rested -> more trades, lower process-adherence, less journaling.
  numbers:    day-level Spearman (n=15-17 sessions):
                ready   vs journal-fill%     rho=+0.60  p=0.02
                sleepSc vs discipline%       rho=+0.60  p=0.02
                ready   vs discipline%       rho=+0.52  p=0.05
                sleepSc vs journal-fill%     rho=+0.51  p=0.05
                ready   vs trades taken      rho=-0.48  p=0.06
                sleepH  vs trades taken      rho=-0.47  p=0.06
                energy  vs discipline%       rho=-0.41  p=0.13  (self-reported energy runs the
                                                                 OPPOSITE way to the wearable)
              None of these fields predicts pre-9:35 share (all |rho| < 0.05) or median MFE.
  mechanism:  Strong and standard: sleep debt degrades response inhibition and effortful
              record-keeping before it degrades pattern recognition. Consistent in sign across
              three separate outcomes and two separate sleep measures.
  confounds:  These are NOT independent tests — r(sleepH, sleepSc)=0.76, r(ready, sleepSc)=0.87,
              r(ready, sleepH)=0.69. They are one construct measured three ways, so this is
              roughly 2 effective findings, not 6. Out of ~31 correlations in this family at
              n=15-17, four at p<=0.05 is only mildly more than the ~1.5 chance expects. Journal
              fill on recent sessions is also confounded by backlog (see section 6).
  verdict:    The most promising thing in the psych data, but it is a HYPOTHESIS for next month,
              not an action. Pre-register it: does a low readiness score predict >4 trades and
              a process violation? Needs ~40 more sessions.
```

---

## 2. SEQUENCING / TILT

```
[T2-REJECT]  He does not tilt after a loss. There is no revenge-trading signature in the data.
  numbers:    LIVE           after a WIN   n=11*  expR=+0.99 [-0.24,+2.40]  sumR=+10.9
                             after a LOSS  n=41   expR=+0.30 [-0.30,+1.03]  sumR=+12.4   permP=0.372
                             first of day  n=19   expR=-0.01 [-0.57,+0.63]  sumR= -0.2
              PRACTICE       after a WIN   n=48   expR=-0.24 [-0.46,+0.01]  sumR=-11.7
                             after a LOSS  n=146  expR=-0.01 [-0.21,+0.19]  sumR= -1.2   permP=0.218
                             (i.e. practice runs the OPPOSITE way — worse after a win)
              Prior losses in the session, COMBINED live+practice:
                             3+ prior losses  n=78   expR=+0.06 [-0.18,+0.34]
                             <3 prior losses  n=241  expR=+0.05 [-0.14,+0.25]   permP=0.965
              Running day R:  day currently DOWN n=36 expR=+0.31 | UP n=16 expR=+0.76, permP=0.522
              Risk size after a loss $18.05 vs after a win $16.36 vs first trade $16.56 — a ~10%
              size drift up after losses, nowhere near a doubling.
  mechanism:  none needed — this is a null.
  confounds:  Checked artifact #4 (concurrency): 26 of 71 live entries are opened while a prior
              position is still live, so "gap since previous EXIT" is negative for most trades
              and is unusable. I re-cut it on entry-to-entry clock gap instead.
  verdict:    His own self-diagnosis ("Got to be careful with trades after 2-3 losses", 8/07 note)
              is NOT supported by 319 trades across both books. The number of prior losses is
              irrelevant. What matters is the cumulative R hole — see section 4.
```

```
[UNDERPOWERED]  The 5th-and-later trade of a session went 0-for-7.
  numbers:    trade #1 n=19 expR=-0.01 | #2 n=18 expR=+0.81 | #3 n=16 expR=+0.07
              #4 n=11* expR=+1.10 | #5+ n=7* win%=0 expR=-0.64 [-0.84,-0.44] sumR=-4.5
              Consecutive losses immediately before: 0 -> expR +0.34 (n=31), 1 -> +0.44 (n=17),
              2 -> +0.49 (n=12*), 3+ -> -0.05 (n=11*). Does NOT replicate on practice
              (3+ consec losses there: n=32, expR +0.07).
  mechanism:  plausible fatigue/forcing, but see section 4 — the cleaner framing is cumulative R.
  confounds:  n=7 and n=11 are both under the n>=15 floor.
  verdict:    Do not act on it as a trade-count rule. It reappears in a better form in section 4.
```

```
[T2-REJECT]  Rapid re-entry is not harmful.
  numbers:    entry-to-entry gap: 0-2min n=17 expR=+1.42 [+0.10,+2.91] sumR=+24.1
                                  2-5min n=16 expR=-0.55 [-0.82,-0.18] sumR= -8.8
                                  5-10min n=12* expR=+0.87 | 10min+ n=7* expR=-0.34
              After a loss specifically: re-entered <3min n=20 expR=+0.44 | >=3min n=20 expR=+0.19
              PRACTICE runs the other way (gap<2min n=124 expR=-0.16, 2-10min n=43 expR=+0.26).
  mechanism:  none — and the two books disagree in sign.
  confounds:  The 0-2min bucket is nearly identical to the pre-9:35 bucket (multiple entries
              inside the opening range), so this is section 3 in disguise, not a separate finding.
  verdict:    No "cool-off timer" is justified. The 2-5min bucket being the worst on live and the
              best on practice is exactly what noise looks like.
```

---

## 3. TIMING — THE HEADLINE

Exact counts (strictly before 09:35:00 ET):
**live 35/71 = 49.3%**, practice 101/248 = 40.7%, combined 136/319 = 42.6%.
(The 41% figure in the brief matches `practice`; on **live** it is nearly half.)

```
[T2-REJECT]  H8 is rejected on live, and the point estimate runs hard in the OPPOSITE direction:
             every dollar of the live month was made before the opening range finished forming.
  numbers:    LIVE   pre-9:35   n=35  win%=34  expR=+0.79  95% CI [+0.02, +1.64]  sumR=+27.0
                     9:35+      n=36  win%=11  expR=-0.11  95% CI [-0.52, +0.45]  sumR= -3.9
                     naive permP = 0.065 ; win-rate permP = 0.027
                     5-bucket:  pre-9:35 +27.0R (n=35) | 9:35-9:45 +1.2R (n=21)
                                9:45-10:00 -4.6R (n=13*) | 10:00-10:30 -0.5R (n=2*) | 10:30+ none
              PRACTICE (H8's origin) pre-9:35 n=101 expR=-0.03 sumR=-3.1 | 9:35+ n=147 expR=-0.02
                     sumR=-3.2, permP=0.954.  H8's original -3.1R was never a real effect; it was
                     a sum over 101 trades whose expR was -0.03.
  mechanism:  If real: the ORB entries he takes inside 9:30-9:35 are anticipation entries on
              gap-and-go names he has pre-planned; by 9:35 the obvious break has already been
              made and what remains is second-guessing. He says this himself ("no volume-
              confirmation rule, deliberately... waiting for volume is too late").
  confounds:  Artifact #7 (day clustering) is the one that bites. WITHIN-DAY permutation of the
              pre/post label gives p = 0.290 on live (0.959 on practice) — because the effect is
              largely BETWEEN days, not within them. The three all-pre-9:35 sessions (8/03 +8.9R,
              8/13 +10.5R pre, 8/19 +7.4R) carry it. Leave-one-session-out: drop 8/13 and pre-9:35
              sumR falls 27.0 -> 16.5; drop 8/03 too and it is ~12. Only 8 of 19 sessions have a
              positive pre-9:35 R. Combined live+practice: pre n=136 expR=+0.18 [-0.11,+0.49],
              post n=183 expR=-0.04, permP=0.196 — not significant.
  verdict:    **H8 is REJECTED — pre-9:35 did not underperform; it produced +27.0R of a +23.1R
              month.** But it is NOT established as an edge either: the naive CI barely clears
              zero, the within-day p is 0.29, and five sessions carry it. The actionable half of
              this is the negative half: **the 9:35-and-later entries lost money on live
              (n=36, -3.9R, 11% win rate) and made nothing on practice (n=147, -3.2R). Across
              both books, 183 trades taken after the opening range completed produced -3.2R.**
              That is the reliable statement. Do not turn "trade earlier" into a rule from this
              month's five good days.
```

```
[T3-HYPOTHESIS]  Later entries reach targets more often but he converts far fewer of them.
  numbers:    MFE >= 2R rate:  pre-9:35 11% | 9:35-9:45 29% | 9:45-10:00 15%
              Among trades that DID reach 2R, capture of a 2R target:
                pre-9:35   n=4   capture 65%   realized +13.1R
                9:35-9:45  n=6   capture 23%   realized  +5.3R
                9:45+      n=2   capture -30%  realized  -1.2R
  mechanism:  Later in the session he is more likely to be already down on the day and takes
              scratch/small exits (see his notes: "got chickened out", "exit was too much out of
              fear of getting back to breakeven").
  confounds:  **Section 0 applies directly** — 7 of the 9 broken-MFE trades are pre-9:35, which
              artificially depresses the pre-9:35 MFE>=2R rate and inflates the contrast. Cell
              sizes are 2-6. Artifact #1 (R-normalisation) also applies across buckets.
  verdict:    Not usable until the MFE enrichment is fixed. Re-run it next month.
```

```
[T2-REJECT]  H10 (Friday underperforms) — as suspected, noise.
  numbers:    LIVE Fri 5 sessions, n=22, expR=-0.18 [-0.61,+0.36], sumR=-4.0.
              day-level permutation on session R: p = 0.232. Fri sessions: -2.8, -3.1, -1.3, +5.6, -2.4.
              PRACTICE Fri n=45 expR=-0.22, sumR=-9.8, permP=0.263.
              Live's actual worst weekday is TUESDAY (n=16, expR=-0.48, sumR=-7.7) — which does
              NOT replicate on practice (Tue sumR=-3.6, expR=-0.08). Live's best is Thursday
              (n=17, +17.2R). Neither survives the 5-way multiple comparison.
  mechanism:  none — pattern only.
  confounds:  artifact #7; 5 weekday cells over 19 sessions guarantees a spread this wide.
  verdict:    REJECT. Directionally consistent across books but never significant, and one +5.6R
              Friday flips a third of it. Do not schedule around the calendar.
```

---

## 4. HIS RISK RULE — MAX-LOSS vs TRADE-COUNT. STRAIGHT VERDICT.

### (a) Is his claim ("good days after early losses") true?

**Partly, and the distinction matters more than the claim.**

```
[T2-CONFIRM]  Small early losses are recoverable. A -2R hole is not — across BOTH books, a session
              that ever traded down to -2R finished green exactly once in 27 attempts.
  numbers:    LIVE, down after trade 1:  13 sessions, mean rest-of-day +1.32R, sum rest-of-day
                +17.1R, 5/13 finished green. HIS CLAIM IS TRUE AT THIS DEPTH.
              LIVE, down after trade 3:  8 sessions, mean rest-of-day +0.08R, 1/8 finished green.
              COMBINED live+practice, worst intraday cumulative R vs final session R:
                ever <= -1.0R : 44 sessions,  10 green (23%),  sumFinalR  -64.1,  best +3.0
                ever <= -1.5R : 32 sessions,   5 green (16%),  sumFinalR  -65.0,  best +2.8
                ever <= -2.0R : 27 sessions,   1 green ( 4%),  sumFinalR  -69.0,  best +2.8
                ever <= -3.0R : 12 sessions,   1 green ( 8%),  sumFinalR  -35.4,  best +2.8
                never <= -2.0R: 46 sessions,  30 green (65%),  sumFinalR  +85.8
              Base rate of a green session = 42%. Observing 1 green out of 27 -> one-sided
              binomial p < 0.0001.
              The single exception is 2026-08-06 (path -1.1, -2.1, -3.1, +3.2, +2.8), rescued by
              one +6.3R QQQ trade.
              PRACTICE alone: 20 sessions ever <= -2R, 0 finished green, best final -0.2R.
  mechanism:  Arithmetic, not psychology, and that is why it is robust. After the day is at -2R
              he averages only ~1.7 more trades, and the expectancy of those trades is
              indistinguishable from zero (COMBINED n=47, expR=-0.11, 95% CI [-0.40, +0.26]).
              Even at his best observed edge (+0.33R/trade) he would need ~6 more trades to dig
              out 2R, and he does not take 6 more trades. It is not that he tilts — it is that
              he does not have enough remaining expectancy to fill the hole.
  confounds:  Checked artifact #10 explicitly (below). Checked tilt (section 2) — the post-hole
              trades are NOT worse than his baseline, they are merely average, which is the point.
              The 27-session sample spans both books and two risk-unit regimes.
  verdict:    His rule TYPE is right and his claim is right at shallow depth — but the recovery
              window closes at about -1.5R to -2R, not at -3R. He currently trades to roughly -3R
              (live worst session -3.2R; 3 of 19 sessions reached -3R or worse).
```

### (b) What daily stop level would have helped?

```
[T2-CONFIRM]  A daily stop is the right instrument, but on THIS month it is close to a wash on R;
              its value is tail control, not R saved. -1.5R is the best-supported level.
  numbers:    Delta to sumR from stopping the session once cumulative R hits the level:
                             LIVE (base +23.1R)      PRACTICE (base -6.3R)     COMBINED
                -1.0R          -2.4                    +8.6                     +6.2
                -1.5R          +1.0                    +2.3                     +3.3
                -2.0R          -1.6                    +6.8                     +5.2
                -2.5R          -5.7                    +2.7                     -3.0
                -3.0R          -5.9                    +2.3                     -3.6
                -4.0R           0.0 (never fires)      +0.2
              Live -2R fires on 7 of 19 sessions and forgoes 8 trades worth net +1.6R — but that
              +1.6R is one trade (8/06 QQQ +6.3R) against seven losers totalling -4.7R.
              Live -1.5R fires on 7 sessions, forgoes 12 trades worth -1.0R.
  mechanism:  see (a).
  confounds:  This is a post-hoc simulation on the same data that suggested it — the level that
              looks best (-1.5R live, -1.0R practice) is not stable across books. That instability
              is itself the finding: the R saved is small either way.
  verdict:    **Adopt -1.5R as a hard daily stop.** It is the only level positive in BOTH books
              (+1.0R live, +2.3R practice), it fires on 7 of 19 sessions, and it costs him the
              -2R-to-3R tail that produced 3 of his worst 4 sessions. Do not sell it to him as a
              profit improvement — sell it as removing the left tail. On this month it would have
              added roughly +1R and capped his worst day at about -1.5R instead of -3.2R.
```

### (c) Trade-count cap vs his max-loss rule — adjudication (artifact #10)

```
[T2-REJECT]  H6 (<=2 trades/day beats no cap) is decisively rejected on live.
  numbers:    LIVE  cap 1: sumR -0.2  (delta -23.3R)   cap 2: sumR +14.4  (delta -8.7R)
                    cap 3: sumR +15.5 (delta -7.6R)    cap 4: sumR +27.6  (delta +4.5R)
                    cap 5: sumR +24.3 (delta +1.2R)
              Trades 1-2 of the day: n=37 expR=+0.40 [-0.20,+1.08]  |  trades 3+: n=34 expR=+0.26
              [-0.38,+1.03], permP=0.767 — the later trades are not measurably worse per trade.
              PRACTICE (H6's origin) cap 2: +9.5R — but cap 3 there is -3.3R, i.e. the practice
              result was not monotone and therefore not a real "fewer is better" gradient.
              Alternative circuit breakers, delta to sumR:
                                          LIVE    PRACTICE   COMBINED
                cum <= -1.5R              +1.0      +2.3       +3.3
                cum <= -2.0R              -1.6      +6.8       +5.2
                cum <= -2R OR 3 consec L  +2.0      -0.9       +1.1
                3 consecutive losses      +1.0      -6.8       -5.8
                2 consecutive losses     -10.5      -4.7      -15.2
                3 losing trades (any)     +1.0      -5.6       -4.6
                max 4 trades              +4.5      +2.3       +6.8
                max 3 trades              -7.6      -3.3      -10.9
                max 2 trades              -8.7      +9.5       +0.8
  mechanism:  A count cap is a blunt proxy for the thing that actually matters (accumulated loss)
              and it fires on good days as readily as bad ones. On live, cap 2 would have removed
              8/06's +6.3R QQQ (his 4th trade) and 8/13's late trades.
  confounds:  Note the honest caveat: **"max 4 trades" is the single best-performing rule on the
              combined data (+6.8R)** and it beats every max-loss level. But on live it fires on
              only 5 of 19 sessions, its combined edge is +6.8R over 319 trades, cap 3 is -10.9R
              and cap 2 is +0.8R — a non-monotone, unstable gradient that is the signature of
              curve-fitting, not structure. A rule whose sign flips between adjacent parameter
              values is not a rule.
  verdict:    **His rule choice is right and he should keep it.** A trade-count cap has no
              mechanism, is non-monotone in the data, and at the level H6 proposed (<=2) would
              have cost him 8.7R of a 23.1R month. He should tighten the LEVEL of his max-loss
              rule from ~-3R to -1.5R, and change nothing about its type. If he wants a secondary
              guardrail, "stop at -1.5R OR after 4 trades" is defensible, but the count half of
              it is doing much less work than it appears to.
```

---

## 5. DISCIPLINE

```
[T2-CONFIRM]  Process adherence separates the book — but it is a self-label, so treat it as a
              description of his own judgement, not as a causal lever.
  numbers:    LIVE      proc=Yes  n=49  win%=31  expR=+0.69 [+0.09,+1.38]  sumR=+33.9
                        proc=No   n=10* win%= 0  expR=-0.62 [-0.83,-0.40]  sumR= -6.2  permP=0.074
                        proc=blank n=12* win%= 8  expR=-0.42 [-0.74,+0.08]  sumR= -4.6
              PRACTICE  proc=Yes  n=181 expR=+0.10 [-0.09,+0.32]  sumR=+17.4
                        proc=No   n= 67 expR=-0.35 [-0.54,-0.16]  sumR=-23.7  permP=0.011
              Discipline rate: live 83% of labelled (49/59) vs practice 73% (181/248) — improving.
              Trend within the live month: 1st half (7/30-8/11) 88% of labelled, 100% labelled;
              2nd half (8/13-8/28) 78% of labelled, only 69% labelled at all.
              The 10 live violations cost -6.2R = 27% of the month's gross.
  mechanism:  Real: three of the ten are outright execution errors he documents himself
              ("Added full size by mistake", "Incorrect hotkey maybe... size entered was
              calculated almost double", "Bad button press, entered full size by mistake").
              Those are mechanical, fixable, and cost -2.8R between them.
  confounds:  Artifact #6 — retrospective self-label, partly outcome-contaminated (a trade that
              wins is less likely to be labelled a violation). The 0% win rate on proc=No is
              itself evidence of contamination, not evidence of a clean effect. n=10 is below the
              floor on live; the practice cell (n=67, permP=0.011) is the one carrying weight.
  verdict:    Directionally CONFIRMED and replicated out-of-sample, but the mechanism worth acting
              on is narrower than "be disciplined": **3 of 10 violations were size/hotkey errors,
              not judgement errors.** That is a platform-configuration fix, not a psychology fix.
              Notably, violations skew LATE — only 20% of proc=No trades are pre-9:35, versus 59%
              of proc=Yes.
```

```
[T2-CONFIRM]  H7 confirmed statistically and simultaneously unusable.
  numbers:    right=Yes n=28 win%=54 expR=+1.66 [+0.75,+2.67] sumR=+46.6
              right=No  n=31 win%= 0 expR=-0.61 [-0.73,-0.49] sumR=-18.9   permP < 0.0001
  mechanism:  none that is actionable — "was my theory right?" is graded after the outcome.
  confounds:  Artifact #6 in its purest form. A 0% win rate in the "No" cell is definitional, not
              empirical: he labels a trade's theory wrong BECAUSE it lost.
  verdict:    Statistically overwhelming and worth exactly nothing as a filter. It cannot be
              evaluated at entry. Reporting it only so it is not mistaken for a finding.
```

---

## 6. JOURNAL QUALITY AS A LEADING INDICATOR

Live fill rates: risk 99%, origin 99%, setup 85%, proc 83%, right 83%, energy 83%,
notes 62%, catalyst 49%, daily-trend 49%, conviction 48%, L2 bias 42%.

Per-session fill score (mean of setup/proc/right/notes/conviction/catalyst/L2/energy):

```
  7/30 88%  +4.7R   8/07 78%  -3.1R   8/14 59%  -1.3R   8/21 88%  +5.6R
  7/31 91%  -2.8R   8/10 71%  +0.5R   8/18 53%  -3.0R   8/24 25%   0.0R
  8/03 88%  +8.9R   8/11 100% -1.3R   8/19 100% +7.4R   8/25 63%  -3.2R
  8/04 88%  -0.2R   8/13 85% +10.1R   8/20 54%  -0.4R   8/26 34%  -2.2R
  8/05 83%  +3.0R   8/06 78%  +2.8R                     8/28  5%  -2.4R
```

```
[T2-REJECT]  Journal fill does NOT predict the next session's R. The live correlation is an
             artifact of one end-of-month cluster and does not replicate.
  numbers:    LIVE   same-session  rho(fill_t, R_t)   = +0.43  permP=0.064  n=19
                     next-session  rho(fill_t, R_t+1) = +0.43  permP=0.074  n=18
                     reverse       rho(R_t, fill_t+1) = +0.01  permP=0.985  n=18
                     fill>=median: 10 sessions, sumR +32.3 | fill<median: 9 sessions, sumR -9.2
              The asymmetry (forward 0.43, reverse 0.01) looks like clean directionality. It is not:
                     rho(session index, fill)  = -0.62  permP=0.005   <- journal decays over month
                     rho(session index, R)     = -0.29  permP=0.223   <- results decay over month
                     partial rho(fill_t, R_t+1 | session index) = +0.36  (down from 0.43)
                     fill autocorrelation rho(fill_t, fill_t+1) = only +0.13
              EXCLUDING the final 4 drawdown sessions (n=15):
                     same-session rho = +0.34 permP=0.204
                     next-session rho = +0.21 permP=0.458   <- collapses
              PRACTICE (54 sessions, the properly powered test):
                     same-session rho = -0.03 permP=0.842
                     next-session rho = -0.22 permP=0.105   <- WRONG SIGN
                     reverse          rho = -0.16 permP=0.243
                     partial | index  = -0.17
                     fill>=median 27 sessions meanDayR -0.04 | fill<median 27 sessions -0.19
              Notes-fill alone on live: same rho=+0.28 p=0.243, next rho=+0.15 p=0.561.
  mechanism:  The proposed mechanism (disengagement precedes deterioration) is plausible, but the
              data does not support it and the out-of-sample book contradicts it.
  confounds:  Artifact #9 is the whole story. There is also a **mundane alternative I cannot rule
              out and which I think is the correct one: backlog.** The 8/28 notes literally read
              "(TBD - pending trade analysis)" and 8/24 reads "Reconstructed from screenshots
              (DAS CSV missing for 08-24)". The blank fields on the most recent sessions are most
              likely work not yet done at extraction time, not abandonment during the session.
              That single fact explains rho(index, fill) = -0.62 without any psychology at all.
  verdict:    **REJECTED, and I want to be blunt about it: this is the single most seductive
              wrong finding in the dataset.** Live shows a clean-looking forward correlation with
              a clean-looking null reverse correlation, which is exactly what a real leading
              indicator would look like — and it is produced by a recency backlog plus one bad
              four-session stretch. 54 practice sessions say the opposite. WHAT I CANNOT
              ESTABLISH: whether journal abandonment causes deterioration, whether deterioration
              causes abandonment, or whether both are downstream of a third factor. With 19
              sessions and a confounded time trend, none of the three is separable. To test it
              properly he would need to timestamp when each journal field is filled.
```

---

## 7. NOTES — HIS OWN WORDS (44/71 trades, 62%)

Four themes recur, ranked by frequency. All quotes verbatim from the live sheet.

**1. Exiting winners too early — by far the dominant theme (11 mentions of "exit", 7 of "hold").**
> "Could've held till target for another ~3Rs, got chickened out watching the pullback on volume in QQQ."  (8/03 SPY, +3.9R)

> "But exit was too much out of fear of getting back to breakeven. You have to accept the move back to breakeven if it does happen."  (8/10 SPY, +1.7R)

> "Did not have enough patience to hold till the 152 target. Raised stop too early."  (8/21 MRNA, +3.5R)

> "Good entry and exit. Exit could've held for more but no harm really. Missed to add."  (8/13, written on BOTH the +5.1R SPY and the +6.0R QQQ)

This is the only theme that appears on his *winning* trades. It is a leak on the right tail — the
part of the distribution that is carrying the entire month.

**2. Size and hotkey errors — mechanical, three occurrences, all losses.**
> "Added full size by mistake. Should've added half position this went beyond max loss per position."  (7/31 AMZN)

> "Bad button press, entered full size by mistake"  (8/18 QQQ)

**3. FOMO / trading outside the playbook — 4 explicit "FOMO", 2 "not my setup".**
> "Re-entry at the top is not my setup. FOMO Entry because I did not get a chance to add to the position."  (8/21 HOOD)

> "Greed/Emotional trade. This waas not a valid ORB in the morning so continuation of it is not a valid ORB Entry."  (8/14 GOOGL)

**4. One explicit revenge-trade, self-diagnosed:**
> "Entered and Added trying to make back lost money on the prev 3 trades. Worst of all, added full size based on my PnL instead of the price action. Got to be careful with trades after 2-3 losses."  (8/07 SPY)

Worth noting what is *good* here: he separates thesis quality from execution quality unprompted
("Good execution, incorrect theory" — 8/06, three times), and he does not catastrophise
("No beating myself over it. It's fine to be skeptical coming out of such a choppy market").
That is a healthier journal voice than the numbers suggest.

---

## 8. THE END-OF-MONTH DRAWDOWN (8/24, 8/25, 8/26, 8/28) — peak +30.9R -> +23.1R

```
[T3-HYPOTHESIS]  The final four sessions are behaviourally distinct on almost every dimension,
                 and the market was not the difference.
  numbers:    drawdown 4 sessions: n=17  win%= 6  expR=-0.49 [-0.73,-0.14]  sumR= -7.8
              first 15 sessions:   n=54  win%=28  expR=+0.57 [+0.01,+1.21]  sumR=+30.9
              permP = 0.064
                                          first 15      last 4
                trades / session             3.60         4.25
                pre-9:35 share                54%          35%
                median entry time         9:34:09      9:37:01
                win rate                      28%           6%
                median duration            10.0 min     5.5 min
                MFE >= 1R share               39%          12%
                sum MFE                     85.6R        15.5R
                mean risk per trade         $16.93       $19.00
                process violations (of labelled) 15%       40%
                setup / proc / right filled   100%       29-35%
                notes filled                   74%          24%
                conviction filled              54%          29%
                psych check-in logged          93%          53%
                Watchlist origin               65%          53%
              Market regime did NOT change: mean VIX 15.52 -> 15.23 (both inside the 14.25-17.09
              live band), SPY Dir "Up" on 2 of the last 4 sessions vs 8 of 15 before.
              Execution quality by third of the month:
                7/30-8/11  n=32  sumMFE +44.0R -> realized +12.5R   (MFE>=1R on 41%)
                8/13-8/21  n=22  sumMFE +41.6R -> realized +18.4R   (36%)
                8/24-8/28  n=17  sumMFE +15.5R -> realized  -7.8R   (12%)
  mechanism:  Coherent and plausible: after peaking he took more trades per session, entered
              later (after the OR completed, into the bucket that loses money — section 3),
              held for half as long, sized up ~12%, and stopped filling the journal. The MFE
              collapse (39% -> 12% of trades reaching 1R) says the ENTRIES themselves got worse,
              not just the exits — he was selecting materially poorer setups.
  confounds:  n=17 trades over 4 sessions — well under the floor, and 8/24 is a single
              reconstructed trade. The journal-fill collapse is very likely backlog, not
              abandonment (section 6) — do not read it as a psychological signal. **Section 0
              also applies**: this stretch has only one broken-MFE trade (8/28 CRM) versus eight
              in the first fifteen sessions, which mechanically inflates the sumMFE contrast
              in the WRONG direction — i.e. the real MFE deterioration is somewhat smaller than
              the table shows. The sizing increase is confounded with his mid-month scale-up
              from $14 to $18 risk units, which was a planned change, not tilt.
  verdict:    Something real changed after 8/21, and the most defensible single description is
              **"he stopped taking the trade he is good at"**: pre-9:35 share fell from 54% to
              35%, and the 9:35+ bucket is the bucket that loses money in both books. That is a
              behavioural drift with a mechanism, and it is the one thing from this stretch worth
              carrying into next month as a pre-registered hypothesis. Everything else about the
              stretch (journal, sizing, trade count) is either explained by backlog, by a planned
              risk-unit change, or by 17 trades of noise.
```

---

## TESTS EXAMINED: 152

Breakdown: psych check-in 45 (5 day-level correlations, 6 trade-level splits, 1 day-clustered
re-test, 1 composite, 31 psych-vs-behaviour correlations, 1 collinearity block);
sequencing/tilt 21; timing 16; risk-rule simulations 44 (11 daily-stop levels, 10 count caps,
2 combined, 10 alternative circuit breakers, 9 recovery-threshold tests, 2 post-hole expectancy);
discipline 6; journal quality 16; drawdown 4. Data-integrity diagnostics: 4 (not counted above).

At n=71 live trades and 19 live sessions, roughly 7-8 of these 152 should look significant at
p<0.05 by chance alone. I found **four** results I am willing to stand behind, and three of them
are rejections. That ratio is the honest summary of this month.

---

## TOP 3 THINGS THE TRADER SHOULD KNOW

**1. Your max-loss rule is the right instrument — now move the level to -1.5R.**
You are right that early losses are recoverable, and the data backs you: 13 live sessions where
you were red after trade 1 went on to produce +17.1R for the rest of those days. But the recovery
window closes hard at about -2R. Across 27 sessions in both books that ever traded down to -2R,
exactly **one** finished green (4%, versus a 42% base rate, p<0.0001). It is not tilt — the trades
you take after the hole are perfectly average. It is arithmetic: you get about 1.7 more trades and
your edge is nowhere near 1.2R per trade. A -1.5R daily stop is the only level that is positive in
both books (+1.0R live, +2.3R practice), fires on 7 of 19 sessions, and would have capped your
worst day at -1.5R instead of -3.2R. **And ignore the ≤2-trades-a-day idea (H6): on live it would
have cost you 8.7R of a 23.1R month.** Your rule type was never the problem.

**2. The 9:35-and-later entries are where the money leaks — but do not over-read the pre-9:35 result.**
Across both books, **183 entries taken after the opening range had completed produced -3.2R**.
On live specifically, the 36 post-9:35 entries lost 3.9R at an 11% win rate while the 35 pre-9:35
entries made +27.0R. That said, be honest with yourself about the second half of that sentence:
within-day permutation gives p=0.29, five sessions carry the entire pre-9:35 result, and practice
shows nothing at all. **The reliable half is the negative half.** Treat "the OR has completed and
I am now looking for a reason to enter" as the flag, not "enter before 9:35" as the rule.

**3. Fix two mechanical things before you touch anything psychological.**
(a) Three of your ten process violations were size or hotkey errors — "Added full size by mistake",
"Bad button press", "Incorrect hotkey maybe" — costing -2.8R. That is a platform-configuration
problem, not a discipline problem, and it is the cheapest R you will ever recover.
(b) Your `Max R Before Stop` and `MAE (R)` columns are **wrong on 61% of your 4+-partial trades**,
which are the trades carrying +22.6R of your +23.1R month — the enrichment walks from your blended
average entry with a full-size stop, so a scaled-in winner registers MFE = 0 and MAE = -4R. Until
that is fixed, every "capture %" and "left on the table" number you are looking at is understating
your best trades. Fix it, then re-read your own notes about exiting early — because that theme
("got chickened out", "did not have enough patience to hold till the 152 target", "raised stop too
early") is the one place your own writing and the numbers agree, and it sits on the right tail
that is producing all of your profit.

---

### Register for next month (pre-registered, not actionable now)
- **P1** Low pre-market readiness/sleep predicts more trades, lower process adherence and less
  journaling that day (rho +0.5 to +0.6, n=15-17 sessions, ~2 effective independent tests).
- **P2** After 8/21 the pre-9:35 share of entries fell 54% -> 35%. Track pre-9:35 share as a
  weekly behavioural drift metric and test whether a drop below ~45% precedes a losing week.
- **P3** Re-test target capture by entry-time bucket **after the MFE enrichment is fixed**.
- **P4** Timestamp when each journal field is written, so journal-abandonment can be separated
  from journal-backlog. Without that, section 6 is untestable in principle.
