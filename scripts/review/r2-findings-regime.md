# R2 — THE REGIME QUESTION, RE-DERIVED FROM SCRATCH

Track: regime / variance / method decomposition. All figures on MEASURED risk (WIP tabs).
Baselines reproduced exactly: live 71 trades (70 with R) / 19 sessions / **+19.4R**, expR +0.28,
95% CI [−0.17, +0.80]. Practice 248 trades / 54 sessions / **+7.3R**, expR +0.03, CI [−0.17, +0.25].
Headline gap = **12.1R** raw, **17.3R** when per-trade-normalised to 70 trades.

Scripts: `r2-reg-00-sanity.js`, `r2-reg-01-variance.js`, `r2-reg-02-regime.js`,
`r2-reg-03-attrib.js`, `r2-reg-04-pyramid.js`, `r2-reg-05-stress.js`, `r2-reg-06-controls.js`.

---

## THE ANSWER UP FRONT

The previous round's conclusion **survives — but its old reasoning was wrong and I am re-deriving it,
not restating it.** The old argument was "practice was −9.1R, live was +23.1R, the difference is the
tape." That argument is dead: practice was actually **+7.3R**, so there is no collapse to explain.

The corrected data says something different and sharper:

> **Three trades are the entire live month.** Remove MRNA 08-19 (+9.0R), QQQ 08-06 (+6.9R) and
> NVDA 08-05 (+5.4R) and the live book is **−1.9R over 68 trades** — *worse* than the practice book
> it is supposed to have improved on (+7.3R over 248). Live-minus-top-3 vs practice: **p = 0.80.**

And the practice-era trader reproduces +19.4R in a 19-session block **11–14% of the time**. That is
not a small probability. It is the single most likely explanation on the table.

**Decomposition, as far as honesty allows:**

| component | R | confidence |
|---|---|---|
| **Variance** | **≥ 12R** | high — survives every test; p=0.80 once 3 trades are removed |
| Regime (VIX/tape) | **0R to 14R — unresolvable** | low — swings entirely on matching method; the underlying VIX→R gradient is not significant (rho=−0.15, p=0.28) |
| Method (the pyramid + add discipline) | **0R to 3R** | low-moderate — direction is clean and mechanistic, magnitude is not separable from variance |

I cannot give the regime term a number. Two defensible matching methods give **+14.0R** and **+3.8R**
for it. That instability is itself the finding: the low-VIX story is far weaker than the July review
believed, because VIX is not actually a monotone driver inside practice.

**Did he get better? The honest answer is: one behaviour did, the book did not.** Add discipline
changed in a real and mechanically sensible way. Risk discipline changed for the *worse*, and that
change is one of the few statistically solid results in the file. Net P&L improvement:
indistinguishable from variance.

---

## 1. VARIANCE — TESTED FIRST, AS INSTRUCTED

```
[T2-CONFIRM]  The live month is three trades. Excluding them, live is negative and worse than practice.
  numbers:    live sumR=+19.4 (n=70). Excl top1 +10.4 / top2 +3.5 / top3 −1.9 / top5 −10.8.
              live-minus-top3: n=68, expR=−0.03, 95% CI=[−0.36,+0.34], sumR=−1.9
              practice:        n=248, expR=+0.03, 95% CI=[−0.17,+0.24], sumR=+7.3
              perm p (live-minus-top3 vs practice) = 0.7985
              Day level: top 1 session (08-03, +9.9R) = 51% of the month. Top 3 sessions = +24.0R,
              i.e. more than the whole month. 8/19 green sessions (42%) vs practice 26/54 (48%), p=0.79.
              Median session R: live −0.20, practice −0.15.
  mechanism:  A ~21% win-rate ORB book with a 5.6:1 payoff is *structurally* a right-tail business.
              Its monthly total is a sum of ~70 draws from a distribution whose mean is dominated by
              the top few percent. n=70 is nowhere near enough for the sample mean to concentrate.
  confounds:  Checked that concentration is not itself distinctive — practice is equally concentrated
              (excl top2 → −9.1R, excl top3 → −15.1R). So "3 trades carry it" is normal for this
              strategy and is NOT evidence of luck by itself. The evidence of luck is that the
              *residual* book is negative while practice's residual comparison is not.
              Artifact #8 respected: repeated at session level, same answer.
  verdict:    The month's profit is not distributed across the book; it is three trades, and without
              them the live book is flat-to-negative. CI on the month includes zero.
```

```
[T2-CONFIRM]  The practice-era trader, unchanged, produces +19.4R in 19 sessions 11-14% of the time.
  numbers:    (a) iid resample of 70 trades from the practice per-trade distribution:
                  median=+1.5R, 95%=[−23.4,+30.8], P(>= +19.4R) = 11.0%
              (b) session-block resample of 19 whole practice sessions (preserves within-day
                  correlation and trades-per-day): median=+2.0R, 95%=[−26.9,+34.2],
                  P(>= +19.4R) = 14.2%
              (c) all 36 contiguous 19-session windows inside practice: 0/36 reached +19.4R,
                  best = +15.0R, worst = −12.6R
              Bootstrap of the live month itself: median +19.0R, 95% CI [−11.9, +55.4],
              P(month <= 0) = 12.5% (13.7% at session level).
              Direct comparison: perm p (live vs practice, per trade) = 0.3006; day-level p = 0.3794.
  mechanism:  Null hypothesis — no change in skill, only a different 19-session draw.
  confounds:  Result (c) looks damning at 0/36 but those windows overlap ~95%, so it is roughly
              2-3 independent observations, not 36. I do NOT read it as p<0.03. I read it as: the
              practice era never actually strung together a run this good, which is consistent with
              +19.4R sitting in the upper decile of the null, exactly as (a) and (b) say.
              Artifact #8: (b) is the session-level version and gives the *higher* p, so the
              day-level clustering makes the null MORE plausible, not less.
  verdict:    At p ~0.11-0.14 the null is not rejected and is not close to rejected. One month at
              n=71 cannot establish an edge, and this month does not.
```

```
[T3-HYPOTHESIS]  The month is a payoff-ratio story located entirely in the winners; the losers are unchanged.
  numbers:    live: win%=21, avgWin=+3.73R, medWin=+3.10R, avgLoss=−0.66R, medLoss=−0.60R, payoff=5.62
              prac: win%=25, avgWin=+2.28R, medWin=+2.10R, avgLoss=−0.70R, medLoss=−0.70R, payoff=3.24
              perm p avgWin  = 0.0122  (n=15 winners vs n=61)  <-- n=15, at the minimum cell size
              perm p avgLoss = 0.5883  (n=55 vs n=187)
              sd(R): live 2.05, practice 1.66. Worst loss: live −1.60R, practice −3.90R.
  mechanism:  Winners got bigger while accuracy fell. Candidate cause: the pyramid (section 4).
  confounds:  p=0.0122 on 15 observations, inside a file of 87 tests where ~4 sub-0.05 results are
              expected by chance. The three top trades ARE most of avgWin — this test is largely the
              same fact as finding 1 in another costume, not independent evidence.
  verdict:    Directionally clear and mechanistically linked to the pyramid, but n=15 winners is at
              the floor and the result is not independent of the top-3 concentration. Register, do
              not act.
```

---

## 2. REGIME — AND WHY I CANNOT PUT A NUMBER ON IT

```
[T2-CONFIRM]  The live month sat in a genuinely different and much narrower VIX regime.
  numbers:    live  VIX: n=19 sessions, mean 15.46, median 15.45, range 14.25-17.09, sd 0.69
              prac  VIX: n=54 sessions, mean 17.49, median 17.18, range 15.03-22.22, sd 1.54
              perm p (day level) = 0.0000
              26/54 practice sessions fall inside the live range. 31% of live trades (VIX<15) have
              ZERO practice analogue.
              SPY Dir: live Up 53% / Flat 32% / Down 16%; practice Up 50% / Flat 11% / Down 39%.
  mechanism:  Compressed, drifting-up, low-vol tape. Fewer down days is the sharper difference
              (16% vs 39%) for a 100%-long book than the VIX level itself.
  confounds:  Artifact #8 respected throughout — n=19 sessions, not 71 trades.
  verdict:    The regime difference is real, large, and confirmed. What it is *worth* is the
              contested part, below.
```

```
[T2-REJECT]  "Low VIX explains the gap" is NOT robust — the estimate swings from 3.8R to 14.0R on method.
  numbers:    Method A — range match (practice trades with VIX in 14.25-17.09):
                 practice-in-range: n=117, expR=+0.23, CI=[−0.11,+0.60], sumR=+26.8, 26 sessions
                 live:              n=71,  expR=+0.28, CI=[−0.17,+0.80], sumR=+19.4, 19 sessions
                 perm p = 0.8706 (per trade); day-level R/session live 1.02 vs 1.03, p = 0.9944
                 -> regime slice = (0.23−0.03)x70 = +14.0R, residual = +3.4R
              Method B — bucket reweighting (weight practice's per-bucket expR by live's VIX mix):
                 reweighted practice expR = +0.08 -> regime slice = +3.8R, residual = +13.5R
                 (31% of live weight, VIX<15, has no practice analogue at all — extrapolation hole)
              Why they disagree: practice's VIX buckets are NOT monotone.
                 VIX 15-16: expR +0.04 (n=45)   <-- live's largest matched bucket (54% of live)
                 VIX 16-17: expR +0.36 (n=60)   <-- where practice's "low VIX edge" actually lives
                 VIX 17-18: expR −0.02 (n=59)
                 VIX 18-20: expR −0.17 (n=66)
              Spearman(VIX, mean R/day) inside practice, n=54 sessions: rho = −0.149, perm p = 0.2806
              Residual CI (Method A): live−practice-in-range = +0.05R/trade, 95% CI [−0.53,+0.65]
                 -> x70 = [−37.1R, +45.4R]
  mechanism:  The claimed mechanism (low vol = cleaner trends, fewer failed breakouts) is plausible,
              but the data does not show a gradient — it shows one good bucket (16-17) surrounded by
              flat ones, which is what a 54-session sample looks like when there is no real effect.
  confounds:  Artifact #8 applied (session-level Spearman, not trade-level). H1's 17.2 threshold was
              DISCOVERED on this same practice data, so the +18.6R/−24.9R split is in-sample and
              optimally chosen; the rank correlation is the out-of-sample-honest version of it and it
              is not significant.
  verdict:    The regime term is somewhere in [0R, 14R] and I refuse to pick a point estimate. The
              July review's VIX threshold is a discovered split on a non-significant gradient, and
              the previous round leaned on it harder than it can bear.
```

```
[UNTESTABLE]  H1 (VIX<17.2 outperforms) — zero out-of-sample exposure, as pre-registered.
  numbers:    All 19 live sessions sit below 17.2. Live's own internal VIX buckets are useless:
              <15 n=22 expR=+0.25; 15-16 n=38 expR=+0.25; 16-17 n=7* expR=−0.09; 17-18 n=4* expR=+1.35.
  mechanism:  n/a
  confounds:  n/a
  verdict:    Cannot be tested and will not be testable until he trades a VIX>17 tape. Carry forward.
```

```
[T3-HYPOTHESIS]  The index tape was QUIETER in live; the extra movement came from the names he chose.
  numbers:    Index-ETF (SPY/QQQ) daily range as % of open, unique date|symbol:
                 live n=19 median 0.93%  |  practice n=62 median 1.28%
              Offered upside (H−O)/ADR, unique date|symbol:
                 live  INDEX n=19 med 0.59, >=0.8ADR 21%  |  NAMES n=36 med 0.81, >=0.8ADR 50%
                 prac  INDEX n=58 med 0.47, >=0.8ADR 21%  |  NAMES n=100 med 0.68, >=0.8ADR 39%
              All traded rows, (H−O)/ADR >= 0.8: live 31/71=44% vs prac 70/232=30%, perm p = 0.0410
                                          >= 1.0: live 22/71=31% vs prac 39/232=17%, perm p = 0.0109
              But de-duplicated to unique date|symbol: live 40% vs prac 32%, perm p = 0.3186
              (H−O)/30mATR >= 1.0: live 55% vs prac 53%, perm p = 0.7908  — no difference at all
  mechanism:  If the effect were regime, the index ETFs would show it too. They show 21% in both
              books, identically. Only the single names differ. That points to selection, not tape.
  confounds:  The significant p-values (0.041, 0.011) are on trade-level data where a name traded
              3 times counts 3 times — that inflates n without adding information. The honest
              de-duplicated test gives p=0.32. And the 30mATR-normalised version shows nothing,
              which means the ADR result may just be an ADR-vs-30mATR normalisation artifact
              (artifact #1 territory).
  confounds:  Also note he traded LESS liquid names in live (Avg $ Vol median 10.5B vs 19.0B,
              p=0.0050) and names with bigger opening ranges (OR %ATR median 31.1 vs 25.3, p<0.0001).
              Both are selection changes, not tape changes.
  verdict:    Suggestive that his *picks* offered more, not that the tape gave more — which would
              partially contradict "the tape got easier". But it fails the de-duplicated test and
              vanishes under 30mATR normalisation. T3 only. Worth re-testing next month with more
              date|symbol pairs.
```

---

## 3. SELECTION AND EXECUTION

```
[T2-REJECT]  H8 REJECTED AND REVERSED — 9:30-9:35 entries were the whole live month, not a drag.
  numbers:    live 9:30-9:35: n=35, win%=34, expR=+0.69, CI=[−0.06,+1.54], sumR=+23.4
              live later:     n=36, win%=11, expR=−0.11, CI=[−0.57,+0.49], sumR=−4.0
              perm p = 0.1051
              Without the top-3 trades: early n=33 expR=+0.28 sumR=+9.0 vs later n=35 expR=−0.31
              sumR=−10.9, perm p = 0.0979 — the split SURVIVES removing the top 3.
              He also moved earlier: median entry 9:35:04 live vs 9:37:22 practice, perm p = 0.0217.
              (Practice on corrected risk: 9:30-9:35 n=101 expR=+0.07 sumR=+6.7 — the brief's
              "−3.1R" for H8 was computed on typed risk and no longer holds.)
  mechanism:  His stated rule is "don't chase the 3rd/5th-minute candle." Entering in the first five
              minutes IS his rule being followed. Later entries are, by construction, closer to the
              extended entries he says he avoids.
  confounds:  Artifact #9 does not apply (entry time is knowable at entry — unlike "probe").
              Top-3 removal checked and passed, which is the check that killed most other splits here.
              Still p~0.10 on n=35 vs 36, and this is 1 of 87 tests.
  verdict:    H8's prediction is rejected in direction as well as magnitude. The surviving pattern
              (early > late) is the most robust *behavioural* split in the live book because it is
              the only one that survives top-3 removal — but at p~0.10 it is a hypothesis for next
              month, not a finding.
```

```
[T3-HYPOTHESIS]  Entry quality did not improve; the raw signal says it got slightly worse, but stop width explains it.
  numbers:    Position MFE (R), single-entry trades only (artifact #12 controlled — no size growth):
                 live n=43 median 1.27, reached >=1R in 25/43 = 58%
                 prac n=148 median 2.55, reached >=1R in 110/148 = 74%
                 perm p = 0.0432; P(>=1R) perm p = 0.0561
              BUT his stops got wider, which mechanically shrinks MFE-in-R (artifact #1):
                 stop distance / 30mATR: live median 0.30 vs practice 0.26, perm p = 0.0038
                 stop distance / price:  live median 0.88% vs practice 0.47%, perm p = 0.0712
              Stop-free, size-free re-test — excursion measured in 30mATR units, not R units:
                 live n=43 median 0.53, prac n=145 median 0.75, perm p = 0.2259
  mechanism:  Wider stop -> smaller R-multiple for the same price move. Purely definitional.
  confounds:  This is artifact #1 caught in the act. The "entries got worse" reading is an artifact
              of stop widening; once normalised to ATR instead of R it is not significant.
  verdict:    No evidence entry quality improved, no reliable evidence it worsened. The apparent
              decline is a stop-width artifact and I am not reporting it as a finding.
```

```
[UNDERPOWERED]  H2 (mega-caps underperform) — direction reversed in live, n=11.
  numbers:    live mega-cap n=11*, expR=+0.72, CI=[−0.45,+2.04], sumR=+7.9
              live other names n=36, expR=−0.01, CI=[−0.55,+0.72], sumR=−0.2; perm p = 0.3142
  mechanism:  none — pattern only
  confounds:  n=11 is below the n>=15 floor.
  verdict:    Below minimum cell size. No conclusion. Practice said −8.6R/61 trades; live says the
              opposite on 11 trades. Carry forward untouched.
```

```
[T2-REJECT]  H3 (index ETFs produce ~zero) rejected in live — SPY/QQQ carried the month's best per-trade rate.
  numbers:    live SPY/QQQ n=24, win%=25, expR=+0.49, CI=[−0.30,+1.40], sumR=+11.7
              live names    n=47, win%=21, expR=+0.17, CI=[−0.35,+0.78], sumR=+7.7
              prac SPY/QQQ  n=100, expR=+0.06, sumR=+6.0 (H3's original basis, now on corrected risk)
              Index share of book: live 34%, practice 40%.
  mechanism:  none established — pattern only. Two of the top-5 trades are QQQ.
  confounds:  CI crosses zero. 24 trades. Almost certainly the same top-trade concentration again
              (QQQ 08-06 +6.9R and QQQ 07-30 +4.6R are 11.5 of the 11.7R).
  verdict:    H3's "~zero" is rejected as a point prediction but the live CI crosses zero too, so
              the honest statement is "no reliable difference between index and names in either book."
```

```
[UNDERPOWERED]  H10 (Friday underperforms) — replicated in sign, in both books, but never significantly.
  numbers:    live Fri n=22, expR=−0.19, CI=[−0.68,+0.40], sumR=−4.2
              prac Fri n=45, expR=−0.13, CI=[−0.56,+0.38], sumR=−5.8
              Live's real outlier is Tuesday: n=16, expR=−0.51, CI=[−0.79,−0.11], sumR=−8.2
  mechanism:  none — pattern only
  confounds:  Day-of-week is 5 tests per book; the Tuesday CI excluding zero is exactly the kind of
              result 87 tests manufactures. I am not promoting it.
  verdict:    Friday is negative in both books but neither CI excludes zero. Consistent, weak, and
              not actionable. Tuesday is noise.
```

```
[T3-HYPOTHESIS]  Hold time lengthened, but not in a way that survives the definitional confound.
  numbers:    duration: live median 5.4m / mean 8.9m; practice median 3.7m / mean 7.0m; perm p = 0.1764
              live >=5min 52% vs practice 40%
              winners median: live 22.7m vs practice 11.3m; losers median: live 2.3m vs practice 2.5m
              perm p on LOSERS ONLY (severs the definitional link) = 0.3958
  mechanism:  Holding winners longer is the same fact as the pyramid — he adds over ~4 minutes, so an
              adding trade cannot be short.
  confounds:  Artifact #2 handled by testing losers separately: p=0.40, i.e. the difference is
              entirely in the winners and therefore entirely definitional.
              Artifact #3 (# Partials) avoided — not used anywhere in this file.
  verdict:    No independent hold-time signal. H4 remains untestable in any honest form.
```

---

## 4. THE PYRAMID — THE SHARPEST TEST AVAILABLE

```
[T2-CONFIRM]  Strip the pyramid from both books and the entire live advantage disappears.
  numbers:    Starter-only counterfactual (first lot only, exited at the same average exit price):
                 live  ACTUAL +19.4R (expR +0.28)  ->  STARTER-ONLY +7.7R (expR +0.11)
                 prac  ACTUAL +13.6R (expR +0.06)  ->  STARTER-ONLY +6.8R (expR +0.03)
                 (practice actual is +13.6R here, not +7.3R, because 22 manual-risk rows lack a
                  parseable ladder and drop out of the counterfactual; the comparison is like-for-like)
                 starter-only expR CI: live [−0.15,+0.39], practice [−0.11,+0.18]
              ACTUAL gap       = +17.3R over 70 trades, perm p = 0.3015
              STARTER-ONLY gap = +5.6R  over 70 trades, perm p = 0.6043
              Alt counterfactual (starter exits at FIRST exit rather than average): live +7.5R,
              practice +6.8R — same answer, so the exit assumption is not driving it.
  mechanism:  The adds ARE the P&L. His starter lot, in both books, is roughly a break-even-to-losing
              proposition; the business is the pyramid on the minority of trades that work immediately.
  confounds:  This is the artifact-#11-honest form: it compares each trade against itself, so the
              "he only adds when already right" selection effect is removed by construction.
              Both exit assumptions tested.
  verdict:    The live month's advantage over practice lives entirely in the add behaviour. 11.7 of
              the 17.3R gap is pyramid lift. That is the correct place to look for improvement — and
              section 4b is what I found when I looked.
```

```
[T3-HYPOTHESIS]  The pyramid lift itself is not distinguishable from practice's — but the ADD RULE genuinely changed.
  numbers:    Pyramid lift among adding trades:
                 live n=27, total +11.7R, mean +0.43R, median −0.46R, CI=[−0.21,+1.22], helped 11/27 = 41%
                 prac n=76, total  +5.4R, mean +0.07R, median −0.42R, CI=[−0.25,+0.43], helped 26/76 = 34%
                 perm p = 0.3333
              Null: draw 27 adding trades from practice's lift distribution ->
                 median +1.5R, 95% [−12.2,+18.5], P(lift >= +11.7R) = 11.1%
              Lift concentration: live total +11.7R, excl top1 +5.9R, excl top2 +0.9R, excl top3 −2.9R.
              ADD BEHAVIOUR (counts, not P&L — these are the robust part):
                 adds taken while UNDERWATER: live 0/27 = 0%   vs practice 7/76 = 9%
                 first add taken at (initial-risk) R: live median +0.60R vs practice +0.40R, perm p = 0.1051
                 all adds >= +0.5R: live 69% (of 36 adds) vs practice 45% (of 82 adds)
                 first-add lag: live median 237s vs practice 108s
                 add rate: live 27/70 = 39% vs practice 76/232 = 33%, perm p = 0.3887
                 size multiple among adders: live median 2.50x vs practice 2.33x, perm p = 0.9871
  mechanism:  He now waits for the trade to prove itself further before adding (+0.60R vs +0.40R) and
              has stopped adding to losers entirely. That is a real, stateable rule change with an
              obvious causal story: adding to a loser converts a −1R into a −2R, and he did it seven
              times in practice and zero times live.
  confounds:  The P&L half is NOT established — p=0.33, null p=0.11, and the lift is the same three
              trades again (excl top3 it is −2.9R). I am deliberately separating the BEHAVIOUR
              (0/27 vs 7/76 underwater adds — a count, not a P&L outcome, so it cannot be
              manufactured by three lucky trades) from the RETURN (not significant).
              Note also: median lift per adding trade is NEGATIVE in both books. The pyramid usually
              costs a little and occasionally pays enormously. It is itself a right-tail bet.
  verdict:    The single most credible "he improved" claim in the whole file, and it is a behavioural
              count, not a P&L result. The money it made is indistinguishable from variance
              (p=0.33, null p=0.11); the discipline behind it is real and worth protecting.
```

```
[T3-HYPOTHESIS]  His starter lot alone is a losing bet in BOTH books — this is structural, not a live-month fact.
  numbers:    single-entry trades (which ARE their own starter):
                 live n=43, win%=9,  expR=−0.33, 95% CI=[−0.59,−0.02], sumR=−14.3   <-- excludes zero
                 prac n=156, win%=22, expR=−0.21, 95% CI=[−0.35,−0.06], sumR=−33.4  <-- excludes zero
                 perm p (live vs prac) = 0.4635 — no change between books
              multi-entry trades:
                 live n=27, win%=44, expR=+1.25, CI=[+0.24,+2.35], sumR=+33.7
                 prac n=76, win%=37, expR=+0.62, CI=[+0.04,+1.21], sumR=+46.9; perm p = 0.2914
  mechanism:  Combined n=199 single-entry trades across two books and 73 sessions, both CIs excluding
              zero, unchanged between periods. Structurally: an ORB entry with a ~0.9%-of-price stop
              and a ~20% hit rate does not pay for itself on the starter lot.
  confounds:  Artifact #11 in full force — "single entry" largely means "the trade never went my way,
              so I never added." It is NOT actionable as "stop taking single-entry trades," because
              you cannot know at entry which kind it will be, and refusing them would also refuse the
              starters that become pyramids.
  verdict:    Descriptively the most reliable thing in the dataset (it replicates across both books
              with CIs excluding zero) and simultaneously the least actionable. Its real value is
              framing: his edge is not the entry, it is what he does in the two minutes after it.
```

---

## 5. RISK DISCIPLINE — THE ONE PLACE HE GOT MEASURABLY WORSE

```
[T2-REJECT]  Risk discipline did NOT tighten in live. Peak exposure relative to committed risk got worse.
  numbers:    Max Risk At Stake / Initial Risk:
                 live n=70: median 1.00, mean 1.33, p75 1.28, p90 2.06, max 6.95
                 prac n=226: median 1.00, mean 1.16, p75 1.14, p90 1.54, max 3.62
                 perm p (ratio)        = 0.0130
                 perm p P(ratio > 2x)  = 0.0089    live 10% (7/70) vs practice 2% (5/226)
                 <=1.0x: live 64% vs practice 69%   |  <=1.5x: live 81% vs practice 88%
              The live breaches: CRM 08-28 at 6.95x ($15 committed -> $106 at stake, 5 stop raises),
              GOOGL 08-03 at 4.02x, SE 08-11 at 2.76x (single entry!), MRNA 08-21 at 2.73x,
              SPY 08-07 at 2.64x, SMCI 08-13 at 2.14x, AMD 08-05 at 2.06x.
              Not a mid-month drift: 4 breaches in the first 32 trades, 3 in the last 38.
  mechanism:  Bigger pyramids mean more shares against a stop that has not moved up proportionally.
              Two of the seven (SE, AMD) are single-entry, so it is not purely a pyramid effect — on
              those he moved the stop AWAY or the position ran before the stop caught up.
  confounds:  This is one of only three sub-0.05 results in 87 tests, so ~4 false positives are
              expected — but p=0.0089 on a behavioural count with a clean mechanism, replicated on
              two independent framings (mean ratio and tail rate), is stronger than a typical
              multiple-comparisons casualty. It is also measured, not self-reported (artifact #7
              does not apply). It is NOT outcome-contaminated: the 7 breaches split 3 winners /
              4 losers.
  verdict:    Rejects the hypothesis that he held exposure to one unit more reliably in live. He held
              it LESS reliably. 10% of live trades exceeded 2x committed risk, one by nearly 7x. This
              is the most solid negative finding in the file and the only one I would act on now.
```

```
[T3-HYPOTHESIS]  The realised loss tail did tighten, though not significantly.
  numbers:    live losers n=52: worst −1.60R, p5 −1.20R, median −0.75R, beyond −1R: 5/52 = 10%
              prac losers n=174: worst −3.90R, p5 −1.60R, median −0.70R, beyond −1R: 30/174 = 17%
              perm p P(loss < −1R | loser) = 0.2019
              Stopped out: live 16/70 = 23% vs practice 86/232 = 37%
              Stop raises: live mean 1.2 vs practice 1.0, perm p = 0.2902
  mechanism:  No live loss exceeded −1.6R against a practice worst of −3.9R. Consistent with the
              no-adding-to-losers rule change.
  confounds:  p=0.20; also partly a consequence of section 5's opposite finding — higher exposure
              with tighter trailing stops can produce both a fatter risk-at-stake tail and a thinner
              realised-loss tail simultaneously. The two are not contradictory, they describe
              different moments in the trade.
  verdict:    Encouraging and directionally consistent with the add-rule change, but not significant.
              Note the tension with finding 5: exposure got worse, realised losses got better. Only
              one of those two is under his control at the moment it matters.
```

---

## 6. NO WITHIN-MONTH IMPROVEMENT

```
[T3-HYPOTHESIS]  The live edge is entirely in the first half of the month and did not persist.
  numbers:    first 10 sessions sumR = +19.1R  |  last 9 sessions sumR = +0.3R
              live first half (to 08-11): n=32, win%=28, expR=+0.45, CI=[−0.24,+1.25], sumR=+14.5
              live second half (08-12+):  n=39, win%=18, expR=+0.13, CI=[−0.40,+0.81], sumR=+4.9
              perm p = 0.5284
  mechanism:  none — pattern only
  confounds:  p=0.53, both CIs cross zero, and the split point is arbitrary (median session).
  verdict:    Not significant, and I am not claiming decay. But it is the relevant sanity check on
              any "he levelled up" narrative: if a skill step-change happened at the start of live
              trading, the second half should look at least as good as the first. It does not.
              Consistent with variance; inconsistent with a durable improvement.
```

---

## WHAT I WOULD OVERTURN, AND WHAT I WOULD NOT

**Overturned from the previous round:**
- "Practice was a losing book" — false. It was +7.3R.
- "The gap is 32R" — it is 12.1R raw / 17.3R normalised.
- "Low VIX explains it" — cannot be supported. The VIX gradient inside practice is rho=−0.149,
  p=0.281. The 17.2 threshold is an in-sample discovered split on a non-significant relationship.
  The regime term is somewhere in [0R, 14R] and the two defensible estimates disagree by 10R.
- H8's direction — 9:30-9:35 was the best bucket in live, not the worst, and it survives top-3 removal.
- "Practice 9:30-9:35 was −3.1R" — on corrected risk it is +6.7R.

**Not overturned — re-derived on better grounds:**
- **He did not demonstrably get better.** The old argument was wrong; the conclusion is right for a
  new reason. Remove three trades and live is −1.9R against practice's +7.3R (p=0.80). The
  practice-era null reproduces the month 11-14% of the time. No test in this file separates the two
  books at conventional significance: per-trade p=0.30, session-level p=0.38, green-session-rate
  p=0.79, starter-only p=0.60.

**New and genuinely his:**
- He stopped adding to losers (0/27 vs 7/76) and now waits for +0.60R instead of +0.40R before adding.
  Behavioural, counted, not manufacturable by three lucky trades.
- His peak risk-at-stake discipline got worse (p=0.0089), and that is the finding with the strongest
  statistics in the file.

---

TESTS EXAMINED: 87

---

TOP 3 THINGS THE TRADER SHOULD KNOW:

**1. Three trades are your month, and without them you are behind your own practice book.**
MRNA 08-19 (+9.0R), QQQ 08-06 (+6.9R), NVDA 08-05 (+5.4R). Remove them and live is −1.9R over 68
trades while practice was +7.3R over 248 (p=0.80). Your practice self, unchanged, produces a
+19.4R 19-session stretch 11-14% of the time. The month's 95% CI is [−11.9R, +55.4R] — it contains
zero. Nothing here establishes that you improved, and the corrected numbers do not rescue the
question, they just move it. **Do not scale risk on the basis of this month.** You already scaled
mid-month ($14 → $18 → $28); this analysis gives you no evidence that justified it.

**2. Your peak risk-at-stake got worse, and it is the most statistically solid thing in this file.**
10% of live trades exceeded 2x your committed risk versus 2% in practice (p=0.0089), and CRM on
08-28 reached **6.95x** — $15 committed, $106 actually at stake. Two of the seven breaches were
single-entry trades, so this is not purely a pyramid side-effect. Your stated rule is a max-loss
rule; a 7x exposure event silently voids it. This is a fixable, mechanical problem: when you add,
the stop must move up enough to keep total risk at one unit, and you should be able to state your
current dollars-at-risk at any moment. Fix this before anything else in this report.

**3. Your edge is the pyramid, not the entry — and the one thing you genuinely improved is the add rule.**
Strip the adds from both books and the gap between them collapses from 17.3R to 5.6R (p=0.60). Your
starter lot alone loses money in *both* books (live −0.33R/trade, practice −0.21R/trade, both CIs
excluding zero, n=199 combined). What changed is the discipline around the add: you took **zero**
adds while underwater in live versus 7 in practice, and you now wait for +0.60R instead of +0.40R.
That is a counted behaviour, not a P&L outcome, so three lucky trades cannot have manufactured it —
it is the most credible improvement in the data. But be clear-eyed about what the pyramid is: the
median adding trade *loses* 0.46R versus the starter-only counterfactual, and adds helped on only
11 of 27 trades. It is a right-tail bet layered on a right-tail strategy. Protect the add rule,
keep logging the ladder, and judge it on 200 trades, not 27.
