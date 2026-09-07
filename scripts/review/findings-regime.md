# TRACK: THE REGIME CHANGE — did he get better, or did the market get easier?

**Bottom line: the market got easier. There is no measurable improvement in skill.**
Once the practice book is restricted to days that look like the live month (low VIX + wide
opening ranges), practice already earned **+0.39R/trade** — *more* than live's +0.33R/trade
(permP = 0.87). A 19-session block drawn from that regime-matched practice pool produces
**+23.1R or better 34% of the time**. The month is an ordinary draw from an edge he already had,
in a tape that suited it.

---

## THE DECOMPOSITION (all figures normalised to 71 trades, in R)

| Component | R | Basis |
|---|---|---|
| Full-practice baseline (71 trades) | **−1.8R** | expR −0.025 × 71 |
| → attributable to **MARKET REGIME** (VIX 14.25–17.09) | **+13.1R** | practice low-VIX expR +0.159; in-band vs out-of-band permP = **0.032** |
| Regime-matched baseline | **+11.3R** | |
| → attributable to **SELECTION** (instrument mix shift) | **−1.0R** | live's mix at practice's per-class rates = −2.8R vs practice's own mix −1.8R |
| → attributable to **EXECUTION** | **not measurable** | MFE enrichment failed on 10 of the trades carrying the month (see F2) |
| → **RESIDUAL** | **+11.8R** | permP = **0.52**; 95% CI over 71 trades = **[−25.1R, +51.9R]** |
| **Actual live** | **+23.1R** | |

Adding the second regime variable (wide opening ranges) removes the residual entirely:
the **double-matched** practice pool (low VIX *and* OR%ATR ≥ live median) is 48 trades over
19 sessions at **expR +0.390, sumR +18.7R** — statistically identical to live (permP = 0.87),
and its per-71-trade equivalent is **+27.7R, i.e. more than he actually made.**

**Honest summary: ~13R of the ~25R swing is regime, ~−1R is selection, and the remaining
~12R is indistinguishable from variance. Under the two-variable regime match, the entire
swing is accounted for and he slightly underperformed his own regime-matched baseline.**

---

## FINDINGS

```
[T2-CONFIRM]  The live month is fully explained by a low-VIX / wide-range tape plus variance.
  numbers:    live n=71 expR=+0.330 95% CI=[-0.11,+0.84] sumR=+23.1
              practice low-VIX (n=117, 26 sessions) expR=+0.159 sumR=+18.6
              practice double-matched (n=48, 19 sessions) expR=+0.390 95% CI=[-0.04,+0.87] sumR=+18.7
              permP live vs low-VIX practice = 0.5183 ; live vs double-matched = 0.8728
              P(19-session block >= +23.1R): all-practice 2.4% | low-VIX 25.6% | double-matched 34.5%
  mechanism:  VIX fell 17.49 -> 15.46 (day-level, permP<0.0001) and opening ranges widened
              (OR Size $ 4.17->7.70 permP=0.0011; OR%ATR 34.5->54.9 permP=0.0035). An ORB
              long-bias playbook needs range to work; the live month supplied it and supplied
              only 3 SPY-down sessions out of 19 (vs 21/54 in practice) to a long-only trader.
  confounds:  Artifact #7 (VIX/SPY are day-level) honoured — regime tested at n=19 vs n=54
              SESSIONS, not trades. Artifact #1 ruled out: stop distance, the R denominator, is
              statistically identical across books (stopDist/ADR 0.176 vs 0.187, permP=0.77;
              /price 0.727% vs 0.783%, permP=0.60; /30mATR permP=0.67), so no R-inflation.
              Re-running the whole book with a FIXED synthetic ADR-based stop preserves the
              direction (practice -11.1R vs live +20.5R per 71) but permP=0.23 — not significant.
  verdict:    Conditioned on the tape he was actually handed, this month is an unremarkable
              draw from the edge he already had; roughly one such month in three.
```

```
[T2-CONFIRM]  H1 (VIX<17.2) has zero out-of-sample exposure, but the regime shift is itself the finding.
  numbers:    live VIX span 14.25-17.09 (mean 15.46, n=19 sessions); practice 15.03-22.22 (mean 17.49)
              permP day-level VIX = 0.0000
              practice VIX<17.2 n=126 expR=+0.15 sumR=+18.6 | VIX>=17.2 n=122 expR=-0.20 sumR=-24.9, permP=0.0245
  mechanism:  Low VIX in this book means orderly trend days; his ORB longs need follow-through
              rather than chop. The threshold was discovered on practice and the live month sat
              entirely on the profitable side of it.
  confounds:  Cannot be tested out-of-sample — 0 live sessions above 17.2. Reported as regime
              description, NOT as a confirmed filter.
  verdict:    He has never traded live money in the VIX regime that lost him money in practice;
              treat the live record as untested above VIX 17.
```

```
[T3-HYPOTHESIS]  DATA INTEGRITY: Max R Before Stop is broken on the trades that carry the month.
  numbers:    live MFE==0 on 17/71 rows (23.9%); 10 rows are logically impossible (realised R
              exceeds recorded MFE), 9 of them winners totalling +34.5R — more than the entire
              month's +23.1R. Practice: 34 zeros, 7 impossible, +14.5R.
              MFE==0 rate by #Partials — live: 11.5% at 2-3 partials, 61.1% at 4+ (n=18).
              Top 5 live winners (MRNA +8.2R, QQQ +6.3R, NVDA +5.1R, ...): MFE recorded as 0.00.
  mechanism:  The enrichment walks 1-min bars from entry and aborts when the stop is hit. On
              heavily-scaled trades the recorded Avg Entry sits away from the true initial entry,
              so an early bar reads as a stop hit and the walk terminates at 0. Live took more
              partials than practice (2.92 vs 2.41, permP=0.0000), so the failure rate rose.
  confounds:  Restricting to internally-consistent rows gives live -13.2R, but that exclusion can
              ONLY drop winners (10 of 11 dropped rows are winners) — it selects on the outcome
              and is NOT a valid performance estimate. Reported as data quality only.
  verdict:    Every MFE-based conclusion about the live month — capture rate, "what the market
              offered", trail-leak — is currently unusable; re-run enrichment before next month.
```

```
[T2-REJECT]  "The market offered more in live" — false, and the apparent difference was a data artifact.
  numbers:    raw MFE(R) live 1.444 vs practice 1.765 (permP=0.38) — but contaminated by the zeros.
              Internally-consistent subset: 1.668 vs 1.816, permP=0.72.
              MFE lower-bound imputation (MFE >= realised R): live 1.949 vs practice 1.823, permP=0.75.
              Denominator-free: MFE/ADR 0.205 vs 0.271 (permP=0.30); MFE/30mATR 0.357 vs 0.479 (permP=0.17).
  mechanism:  none — under every treatment of the missing data the two books are indistinguishable.
  confounds:  Artifact #1 handled by also measuring MFE in ADR and 30mATR units, which do not
              depend on stop placement.
  verdict:    Per-trade opportunity was the same; the live month did not hand him bigger setups,
              it handed him more sessions of the kind he already traded well.
```

```
[T2-REJECT]  Selection change does NOT explain the month.
  numbers:    ETF share fell 51.2% -> 38.0%, OTHER rose 33.5% -> 43.7%, MEGA 15.3% -> 18.3%.
              Live's mix priced at practice's per-class rates = -2.8R vs practice's own mix -1.8R.
              MIX SHIFT IS WORTH -1.0R over 71 trades.
              H2 mega: practice -1.2R/n=38 vs live +7.8R/n=13* (UNDERPOWERED), permP vs rest of live = 0.61.
              H3 ETF:  practice +2.9R/n=127 vs live +14.4R/n=27, permP vs rest of live = 0.52.
  mechanism:  none — pattern only; class-level expR in live has CIs spanning zero everywhere
              (ETF [-0.25,+1.45], MEGA [-0.33,+1.69], OTHER [-0.51,+0.75]).
  confounds:  n<15 on MEGA. Symbol concentration is thin (28 symbols / 71 trades).
  verdict:    He traded slightly worse-performing categories and still made money; selection is
              not the cause and if anything worked against him.
```

```
[T3-HYPOTHESIS]  He held winners roughly twice as long in live, and scaled out more.
  numbers:    winner duration med 22.7m (live) vs 11.3m (practice), permP=0.0461
              loser duration med 2.3m vs 2.5m, permP=0.4050 (unchanged)
              #Partials mean 2.92 vs 2.41, permP=0.0000
              avgWin 3.79R vs 1.76R, permP=0.0001; avgLoss identical -0.61R vs -0.61R, permP=0.9525
              realised >=3R rate: live 11.4% | double-matched practice 10.4% | low-VIX 7.7% | all 3.6%
  mechanism:  Plausible and specific — he began scaling out of runners instead of exiting all-out,
              which lengthens winners without touching losers. This is the one behavioural change
              with a clean signature: the entire R improvement sits in the WIN side of the
              distribution, with the loss side untouched.
  confounds:  Artifact #2 (duration is partly definitional) and #3 (#Partials is a duration proxy)
              both apply and CANNOT be separated here, because the MFE data needed to isolate
              entry quality from exit behaviour is exactly what is broken (see the integrity
              finding). Critically, the >=3R FREQUENCY is fully matched by regime (11.4% live vs
              10.4% double-matched practice) — only the SIZE of the top few differs, and
              avgWin vs double-matched practice is permP=0.0160 at nW=15* vs 17*.
  verdict:    The most promising real change in the book, but at 15 winners and with MFE broken
              it is a hypothesis for next month, not an established improvement.
```

```
[T3-HYPOTHESIS]  He sat through much deeper drawdown in live — his winners routinely traded through the stop.
  numbers:    MAE(R) med -1.080 (live) vs -0.730 (practice), permP=0.0045
              share MAE <= -1.0R: 55.7% vs 37.9%
              WINNERS' MAE med -1.35R vs -0.42R; 66.7% of live winners went beyond -1R first (vs 14.8%)
              duration-controlled: identical at 0-2m (permP=0.98), 2-5m (0.77), 5-15m (0.48);
              diverges only at 15m+ — live med -2.04R vs practice -0.67R, n=15 vs 32, permP=0.0014
  mechanism:  Holding through the nominal stop on trades he wants to run. Consistent with the
              longer-winner finding — the same behaviour seen from the adverse side.
  confounds:  Artifact #2 — a longer holding window mechanically allows deeper excursion, and the
              effect vanishes in every bucket except 15m+. The winners-only cell is n=12*
              (UNDERPOWERED). May also be partly an Avg-Entry artifact on scaled trades, the same
              root cause as the MFE zeros (live 4+ partials medMAE -1.34 vs 2-3 partials -0.90).
  verdict:    Either he has stopped honouring his stop on runners — which paid this month and is
              a live tail risk — or it is a measurement artifact of scaled entries; the data
              cannot currently tell these apart, and that ambiguity is itself worth fixing.
```

```
[T2-REJECT]  H8 (9:30-9:35 entries underperform) — reverses on live, but not robustly.
  numbers:    practice <=9:35 n=101 expR=-0.03 sumR=-3.1 | live <=9:35 n=35 expR=+0.79
              95% CI=[+0.03,+1.65] sumR=+27.0 (i.e. MORE than the whole month)
              permP within live = 0.0659 ; within regime-matched practice = 0.4110
              drop top 1 winner -> +18.8R ; top 2 -> +12.8R ; top 3 -> +7.7R
              live median entry 9:35:04 vs practice 9:37:22, permP entry-time distribution = 0.0223
  mechanism:  He entered earlier in live. But the effect is carried by 3 trades and the CI's lower
              bound is +0.03 — one trade from crossing zero.
  confounds:  This bucket contains the top winners, so it inherits the whole concentration problem.
              The regime-matched practice pool shows no such effect (permP=0.41), so it does not
              replicate out-of-sample.
  verdict:    H8 is not confirmed and its reversal is not established either; the earlier entry
              timing is real, its profitability is not.
```

```
[UNDERPOWERED]  Sizing is completely confounded with calendar period — the question cannot be answered.
  numbers:    live $14 n=32 sumR=+23.5 (102% of the month) | $18 n=30 sumR=+3.4 | $28/24/38 n=8* sumR=-3.8
              ALL 32 of the $14 trades fall in 7/30-8/13; ALL 30 of the $18 trades fall in 8/14-8/28.
              early (7/30-8/13) +22.6R / 37 trades vs late (8/14-8/28) +0.5R / 34 trades, permP=0.2298
              practice shows the same collinearity in reverse ($28 +24.9R vs $14 -22.3R, only 15
              shared dates).
  mechanism:  He scaled up AFTER the hot streak; performance reverted immediately afterwards.
              Regression to the mean is a sufficient explanation and no sizing effect is identifiable.
  confounds:  Risk unit and date are ~perfectly collinear in BOTH books. Any "sizing" split is a
              date split wearing a disguise.
  verdict:    Nothing in this review is a sizing artifact because sizing cannot be separated from
              time at all — but note that 100% of the month's R was earned before he sized up.
```

```
[T2-REJECT]  Prediction metrics show no improvement in stock-picking.
  numbers:    Intra-Day Prediction (excursion >= 1x 30mATR): live 54.9% (n=71) vs practice 53.4%
              (n=238) — two-prop z=0.23, p=0.8161. NO CHANGE.
              Daily Prediction (excursion >= 0.8x ADR): live 43.7% vs practice 29.4%, z=2.26, p=0.0239
              BUT the underlying continuous measure is flat: mean excursion/ADR 1.122 vs 0.977,
              permP=0.8556; median 0.672 vs 0.539.
  mechanism:  none for the daily metric — a significant threshold rate sitting on top of a
              completely null continuous distribution is the signature of dichotomisation noise,
              not of a real shift.
  confounds:  mean excursion/30mATR IS higher (1.839 vs 1.234, permP=0.0060) but that is a
              tail/scale effect from the wider opening ranges — i.e. regime — and it does not
              move the >=1x rate at all.
  verdict:    He is not picking stocks that move any better than before; the tape moved more.
```

```
[T2-REJECT]  Real-money behaviour change: only partly present, and not in the expected direction.
  numbers:    trades/day 4.59 -> 3.74, permP=0.1142 (NOT significant)
              "probe" (<2min) share 32.3% -> 35.2% (unchanged)
              loser duration med 2.5m -> 2.3m, permP=0.4050 (no faster cutting)
              worst single loss -2.70R (practice) vs -1.10R (live); share of losers worse than
              -1R: 5.3% vs 5.5% (unchanged)
              median notional $4,258 -> $2,738 (smaller positions), shares/trade med 15 in both
  mechanism:  The classic live-money signature (hesitation, faster cuts, fewer trades) is absent
              or weak. The only clear changes are LONGER winner holds and DEEPER drawdown
              tolerance — the opposite of timidity.
  confounds:  Artifact #8 — "probe" is defined by the exit, used descriptively only.
              Notional fell partly because he traded lower-priced names (median entry $359 -> $311).
  verdict:    Live money did not make him tighter; if anything it made him hold longer, which is
              the behaviour that needs watching rather than celebrating.
```

```
[T2-CONFIRM]  The month's profit is carried by 3 trades and did not persist.
  numbers:    sumR +23.1 | drop top 1 -> +14.9 | top 2 -> +8.6 | top 3 -> +2.6 | top 5 -> -7.6
              top 3 winners = 20.5R = 89% of the month; 15 winners vs 55 losers
              session R: 8 positive / 19; drop top 3 sessions -> -3.3R
              first 10 sessions +22.6R, last 9 sessions +0.5R (permP=0.2773)
              trade-bootstrap sumR 95% CI = [-7.9, +59.0], P(sumR <= 0) = 7.9%
              session-block bootstrap 95% CI = [-10.3, +60.5], P(sumR <= 0) = 9.7%
  mechanism:  Structural — the payoff profile is 21% win rate at ~6:1, so a 71-trade sample is
              dominated by the upper tail by construction. This is expected, not pathological.
  confounds:  None; this is a direct property of the return distribution.
  verdict:    The month rests on three trades and one half of the calendar; it establishes nothing
              about the next month's expectancy.
```

---

## WHAT I COULD NOT DISTINGUISH

- **Execution quality (better exits) vs regime.** The capture-rate machinery is the right tool
  and it is broken on precisely the decisive trades. Unresolvable until MFE is re-enriched.
- **Deeper MAE: discipline slippage vs Avg-Entry measurement artifact.** Same root cause.
- **Sizing.** Perfectly collinear with date in both books.
- **Anything above VIX 17.2.** Zero live exposure.
- **Short side.** All 71 live trades are long; no data.

## MULTIPLE-COMPARISONS NOTE

162 comparisons were examined. At p<0.05, ~8 would be expected significant by chance; 12 were.
The robust ones survive at p<0.005 with a stated mechanism (VIX regime, OR size/OR%ATR, #Partials,
avgWin, MAE). The marginal ones — entry-time (0.022), Daily Prediction (0.024), winner duration
(0.046), Avg $ Vol (0.021) — should be treated as noise until they replicate.

TESTS EXAMINED: 162

## TOP 3 THINGS THE TRADER SHOULD KNOW

1. **You did not get better — the tape got easier, and you can prove it to yourself.** On the
   practice days that looked like August (VIX 14–17 with wide opening ranges) you were already
   making +0.39R per trade. Live you made +0.33R. A random 19-session block from that
   regime-matched history beats +23.1R **one time in three**. Do not raise size, expectations, or
   conviction on the basis of this month. The single most important number in this review is that
   **you have never traded live money above VIX 17.2 — the regime that cost you 24.9R in practice.**

2. **Fix Max R Before Stop before next month, or the next review will be just as blind.** The
   enrichment failed on 10 live trades worth +34.5R — more than the entire month's profit. It
   breaks on trades with 4+ partials (61% failure rate), almost certainly because the stop-walk
   uses Avg Entry rather than the initial entry. Every conclusion about your exits, your capture
   rate and your trail leak is currently unverifiable, and those are the questions you most want
   answered.

3. **The one real change in your behaviour is that you now hold winners twice as long — and sit
   through your stop to do it.** Winner duration doubled (11m to 23m) while loser duration did not
   move, and your losses stayed exactly the same size (-0.61R in both books). That is the right
   shape for an edge. But 67% of your live winners traded beyond -1R before working, against 15%
   in practice. In this tape that was rewarded. Decide deliberately whether you are widening your
   stop or ignoring it, because those two look identical on a good month and nothing alike on a
   bad one.
