# EXECUTION TRACK — monthly review (live month 2026-07-30 → 2026-08-28, n=71)

Scripts: `exe-00-explore.js` … `exe-06-stopbehav.js` in this directory. All analysis in R.

---

## DATA-QUALITY FINDING THAT PRECEDES EVERYTHING

**`Max R Before Stop` is censored, and the censoring lands on his nine best trades.**

The enrichment stops walking 1-min bars the moment the stop *price* is touched. But he does not
trade a hard stop — 56% of live trades traded through their nominal 1R stop level and he stayed in.
So nine live trades that dipped through the stop and then ran are recorded with `maxR = 0`:

| date | sym | realised R | MAE | dur | day-high in R |
|---|---|---|---|---|---|
| 07-30 | MSFT | +1.8 | -3.52 | 22.7m | 7.7 |
| 08-03 | AMZN | +2.2 | -3.30 | 19.7m | 4.6 |
| 08-03 | SPY  | +3.9 | -3.70 | 33.6m | 14.2 |
| 08-05 | NVDA | +5.1 | -4.49 | 50.3m | 7.4 |
| 08-06 | QQQ  | +6.3 | -4.01 | 40.8m | 9.8 |
| 08-10 | SPY  | +1.7 | -1.31 | 19.9m | 5.6 |
| 08-19 | MRNA | +8.2 | -4.52 | 26.4m | 32.5 |
| 08-21 | MRNA | +3.5 | -1.01 | 31.8m | 8.8 |
| 08-28 | CRM  | +1.8 | -3.09 | 19.4m | 6.2 |

Those nine total **+34.5R** — more than the whole month's +23.1R. Taken at face value `maxR`
places them in the "market offered nothing" bucket. Practice has the same defect (7 trades, +14.5R).

**Fix used throughout:** `MFE = max(maxR, pnlR, 0)`. A trade that *realised* x R was necessarily
*offered* at least x R, so this is a valid lower bound. For those nine it is a strict
under-statement (day-high suggests 4.6–32.5R was genuinely on the table).

**Action item for the app:** `Max R Before Stop` should record MFE-to-16:00 unconditionally and
put the stop-hit flag in a separate column. As shipped, the Capture Tracker and the Prediction &
Execution Skill funnel in `AggregateStats` under-report his best trades as zero-opportunity.

---

## 1. MFE DECOMPOSITION — what did the market offer?

```
LIVE (n=70)                                        PRACTICE (n=248)
bucket    n   win%  meanMFE  meanReal  sumR         n   win%  meanMFE meanReal  sumR
<0.5R    27     4%   0.14    -0.59   -15.8         85     1%   0.16   -0.73   -62.3
0.5-1R   11*    0%   0.65    -0.69    -7.6         53     9%   0.67   -0.54   -28.6
1-2R     14*   29%   1.41    +0.01    +0.1         40    33%   1.43   -0.11    -4.2
2-3R      5*   20%   2.42    +0.14    +0.7         19    58%   2.45   +0.71   +13.5
3R+      13*   77%   7.21    +3.52   +45.7         51    71%   5.86   +1.48   +75.3
```

```
[T3-HYPOTHESIS]  The month is three trades. Everything else nets to zero.
  numbers:    top-1 = +8.2R, top-3 = +20.5R (89% of the month), top-5 = +30.7R (133%).
              Book minus its top 3 trades: n=67, sumR=+2.6, expR=+0.04, 95% CI [-0.31, +0.43].
              15 winners = +56.8R; 52 losers = -33.7R; payoff ratio 5.84.
  mechanism:  ORB is a lottery-ticket structure — a small tail of trend days pays for a long
              stream of failed breaks. This is the intended shape of the strategy, not a flaw.
  confounds:  Artifact #1 — MFE is R-normalised, so a tight stop inflates MFE. His stop distance
              is set to make R the constant $ unit, so tighter stop = more shares, not a free
              MFE boost; the concentration result is on realised R and unaffected either way.
  verdict:    At n=71 with 89% of P&L in 3 trades, the month establishes nothing about edge —
              but the SHAPE (fat right tail, capped left tail) is consistent across both books.

[T3-HYPOTHESIS]  38/70 live trades (54%) were offered less than 1R. That is a selection problem, not an exit problem.
  numbers:    MFE<1R: n=38, sumR=-23.4, win%=3%. MFE>=1R: n=32, sumR=+46.5.
              Practice identical in shape: MFE<1R n=138 sumR=-90.9; MFE>=1R n=110 sumR=+84.6.
  mechanism:  On these trades the break failed before offering a single R. No exit rule recovers
              them — the only lever is entry selection or entry timing.
  confounds:  Not duration-driven (artifact #2): MFE is measured entry→16:00 ET regardless of
              how long he held, so a 1-minute trade is credited with the whole day's opportunity.
  verdict:    Roughly half his trades never worked at all, and that half is worth -23R a month;
              this is the single largest addressable pool and it is upstream of execution.
```

---

## 2. CAPTURE — of what was offered, what did he take?

`capture% = mean(min(realisedR, target)) / target`, over trades with MFE >= target.

```
          LIVE                                    PRACTICE
target   n    capture%  meanReal  hit%      n    capture%  meanReal  hit%
>=1     32       15%     +1.45     47%     110      23%     +0.77     36%
>=2     18       52%     +2.58     61%      70      46%     +1.27     40%
>=2.5   16       55%     +2.79     56%      60      47%     +1.42     18%
>=3     13*      70%     +3.52     62%      51      42%     +1.48     18%
```

```
[T3-HYPOTHESIS]  Capture improved live vs practice at every target, and is now good on big trades and terrible on small ones.
  numbers:    @2.5R: live 55% (n=16) vs practice 47% (n=60). @3R: 70% (n=13*) vs 42% (n=51).
              @1R: 15% (n=32) vs 23% (n=110) — WORSE live.
              R left on the table vs a 2.5R target: 18.0R live over 16 trades.
  mechanism:  He now recognises and rides the genuine trend day (the 3R+ bucket realises 3.52R
              of 7.21R offered, 49% efficiency). The 1–2R bucket he converts to exactly zero
              (n=14, sumR +0.1R) — a trade that offers 1.4R and nothing more gets round-tripped.
  confounds:  Artifact #1 (R-normalisation) applies to the target definition, not to the
              comparison across books, since the stop-sizing convention is unchanged.
              Censoring (above) understates capture, so if anything these are floors.
  verdict:    T3 not T2 — @2.5R and @3R cells are n=16 and n=13, both under the n>=15 bar or
              barely at it, and no CI is reported for a ratio statistic; directionally
              encouraging, not established.

[T3-HYPOTHESIS]  The 1–2R MFE bucket is a dead zone: 14 trades, +0.1R total.
  numbers:    LIVE MFE 1-2R: n=14*, win%=29, meanMFE=1.41, meanReal=+0.01, sumR=+0.1,
              efficiency 1%. Practice MFE 1-2R: n=40, meanReal=-0.11, sumR=-4.2, efficiency -7%.
  mechanism:  A 1.4R excursion is not enough to trigger his "this is working" recognition, so he
              sits through the full give-back. Replicates across both books, which is the
              strongest thing about it.
  confounds:  n=14 live is below the cell floor. The practice replication (n=40) is what
              carries it.
  verdict:    UNDERPOWERED live, but the practice cell (n=40, two-year-equivalent sample) says
              the same thing; a mechanical partial at ~1R on non-trending trades is the obvious
              next-month experiment, and it should be pre-registered rather than acted on now.
```

---

## 3. MAE — how far offside do winners go, and would a stop have helped?

```
LIVE winners  n=15  meanMAE=-2.08  medMAE=-1.35  worst=-4.52
LIVE losers   n=55  meanMAE=-0.92  medMAE=-1.06
PRAC winners  n=61  meanMAE=-0.52  medMAE=-0.42
PRAC losers   n=187 meanMAE=-0.95  medMAE=-0.88
```

Recovery curve — among trades reaching MAE <= -x, share that ended positive:

```
          LIVE                              PRACTICE
MAE<=  n     win%   expR   sumR        n     win%   expR    sumR
-0.5   49     22%  +0.25  +12.2       161     19%   -0.24   -39.0
-1     39     26%  +0.37  +14.4        94     10%   -0.64   -60.0
-1.5   15     47%  +1.55  +23.3        34      6%   -0.78   -26.5
-2      9*    78%  +3.14  +28.3        14*     7%   -0.87   -12.2
-3      7*   100%  +4.19  +29.3         3*    33%   -0.50    -1.5
```

```
[T3-HYPOTHESIS]  In live, the recovery curve INVERTED versus practice: the deeper the drawdown, the better the outcome.
  numbers:    LIVE MAE<=-2: n=9*, win%=78, expR=+3.14, sumR=+28.3.
              PRACTICE MAE<=-2: n=14*, win%=7, expR=-0.87, sumR=-12.2.
  mechanism:  Two candidate stories and I cannot separate them at n=9.
              (a) Genuine: he now holds through the shakeout on trades where his thesis is
                  intact, and August's low-VIX grind rewarded that.
              (b) ENDOGENEITY — and this is the one I believe. MAE is measured over the ACTUAL
                  holding window. A trade he cuts in 90 seconds CANNOT register a -3R MAE. Deep
                  MAE is therefore a *consequence* of his decision to hold, and he holds the
                  ones he believes in. Live: median MAE by duration is -0.67 (<2m), -0.73
                  (2-5m), -1.12 (5-15m), -2.04 (15m+); the MAE<=-2 group has median duration
                  22.7 min. Practice shows no such gradient (-0.65 / -0.87 / -0.78 / -0.67),
                  which is exactly why the practice curve does not invert.
  confounds:  Artifact #2 in a new dress — MAE depth is a duration proxy here. Also 9 trades
              across 8 different symbols and 8 different dates, so not one lucky name.
  verdict:    NOT ACTIONABLE. "Deep drawdowns become winners" is very likely his own selection
              of what to hold, read backwards. Do not turn this into a rule about sitting
              through pain.
```

### 3b. Stop-level counterfactuals

For a hypothetical hard stop at -X R: a trade with MAE <= -X exits at -X, otherwise unchanged.

```
        LIVE (actual +23.1R, expR +0.33)          PRACTICE (actual -6.3R, expR -0.03)
stop    sumR    expR    delta   nTrig 95%CI       sumR    expR   delta   nTrig
-0.30   -3.9   -0.06   -27.0     55  [-.29,+.24]  -18.9  -0.08  -12.6    181
-0.40   -9.1   -0.13   -32.2     53  [-.37,+.18]  -35.0  -0.14  -28.7    172
-0.50  -13.6   -0.19   -36.7     49  [-.44,+.13]  -47.8  -0.19  -41.5    161
-0.60  -17.9   -0.26   -41.0     47  [-.49,+.05]  -49.0  -0.20  -42.7    148
-0.75  -24.6   -0.35   -47.6     45  [-.60,-.04]  -33.5  -0.14  -27.2    121
-1.00  -30.3   -0.43   -53.4     39  [-.71,-.09]  -40.3  -0.16  -34.0     94
-1.25  -29.6   -0.42   -52.7     26  [-.73,-.05]  -44.5  -0.18  -38.2     57
```

```
[T2-CONFIRM]  Every mechanical stop from -0.3R to -1.25R would have made the live month worse. His discretionary loss-cutting holds up out of sample.
  numbers:    Best mechanical stop over a 0.1R–3.0R grid search: -0.10R → +7.0R, still far short
              of the actual +23.1R. All seven pre-specified levels destroy 27R to 53R.
              A -1.0R stop (his nominal stop!) turns +23.1R into -30.3R, expR -0.43 [-0.71,-0.09].
  mechanism:  He does not use the stop as a price level; he uses it as a max-loss budget and
              exits into the retrace. 56% of live trades traded through their 1R stop level.
              Of those that still lost, mean realised was -0.78R with the worst at -1.10R —
              i.e. he recovered a mean of +0.63R from the low before getting out. That patience
              costs him nothing on the losers and is what keeps the nine big winners alive.
  confounds:  CLAUDE.md notes MAE skips the entry bar's adverse check, so true MAE is at least
              as deep as reported — stops would trigger MORE often, making the counterfactual
              conservative in his favour. Checked artifact #1: the counterfactual is entirely
              within-trade, no cross-stop-distance comparison.
  FRAGILITY:  Remove the nine censored winners and a -0.3R stop turns POSITIVE (+10.2R vs the
              remaining book's -11.4R). The whole result rests on the same nine trades. Report
              it as confirmed, but understand it is confirmed by a very small tail.
  verdict:    CONFIRMED and unusually robust in direction across both books — do not install a
              hard stop; his exit discretion is the strongest single thing in this data set.
```

---

## 4. EXIT EFFICIENCY — realised R vs MFE (trades offering >= 1R)

LIVE: n=32, total left on table **79.0R**, mean 2.47R/trade, aggregate efficiency 37%
(practice: n=110, 317.9R left, efficiency 21%).

```
by MFE size (live)                 by duration (live)              by entry window (live)
1-2R   n=14* effic   1%  left 19.6  <5m    n= 9* effic  1% left 34.6  0930-0935 n=17 effic 53%
2-3R   n= 5* effic   6%  left 11.4  5-15m  n=10* effic  4% left 36.9  0935+     n=15 effic 16%
3-6R   n= 7* effic  54%  left 14.4  15m+   n=13* effic 86% left  7.5
6R+    n= 6* effic  46%  left 33.6
by risk unit: $14 n=19 effic 38% | $18 n=11* effic 35% | $28 n=2* effic 39%
by symbol:    ETF n=14* effic 34% | megacap n=7* effic 46% | other n=11* effic 38%
```

Top leaks: 08-13 SPY (offered 20.4R, took 5.1R), 08-25 MRNA (offered 9.2R, took -0.8R),
07-30 QQQ (5.6R offered, -0.3R), 07-30 QQQ (9.7R → 4.2R), 07-31 GOOGL (4.4R → -0.7R).

```
[T3-HYPOTHESIS]  Efficiency is bimodal by MFE, not linear: he converts 3R+ opportunities at ~50% and 1-3R opportunities at ~1-6%.
  numbers:    LIVE 1-2R effic 1% (n=14*), 2-3R effic 6% (n=5*), 3-6R effic 54% (n=7*),
              6R+ effic 46% (n=6*). Practice: -7% / 29% / 27% / 24% — flatter, no threshold.
  mechanism:  Plausible: a trade that moves >3R has usually announced itself (real catalyst,
              trend day) and he recognises it and holds. A 1-3R move looks the same as noise
              on the way up, so he round-trips it.
  confounds:  Every cell is n<=14 — all below the floor. R-normalisation (artifact #1) means a
              wide-stop trade can't reach 3R as easily, so the 3R+ bucket over-selects
              tight-stop days; not ruled out.
  verdict:    UNDERPOWERED. Interesting, not established; carry to next month's register.

[T3-HYPOTHESIS]  Nothing in size, symbol class, or risk unit explains the leak. Duration and entry-window do.
  numbers:    Risk unit spread 35-39% efficiency (flat). Symbol class 34-46% (flat).
              Duration: <5m 1%, 5-15m 4%, 15m+ 86%. Entry window: 0930-0935 53% vs 0935+ 16%,
              permP=0.076 on realised R (n=17 vs 15).
  mechanism:  The duration split is near-tautological (artifact #2: you cannot capture a 4R move
              in 90 seconds), so it is not an independent finding. The entry-window split is
              NOT tautological — same-size opportunity (meanMFE 4.19 vs 3.61), very different
              conversion, and the 0935+ trades have median duration 7.9m vs 19.4m. Consistent
              with the idea that a late entry gives him less conviction so he manages it out.
  confounds:  Overlaps H8 (whole live book 0930-0935 +27.0R vs 0935+ -3.9R, permP=0.064) which
              is outside my track. n=15 in one cell, exactly at the floor. Not multiple-comparison
              corrected — at 43 live tests this is well inside the noise band.
  verdict:    UNDERPOWERED and confounded with an entry-side hypothesis; flag, do not act.
```

---

## 5. HOLD TIME vs OUTCOME — selection or patience?

This is the question the brief asks to get right, so, precisely:

```
LIVE                                   n   win%   expR   sumR   meanMFE  MFE<0.5  MFE>=2
<2m                                   24     0%  -0.63  -15.1    0.65      63%      8%
2-5m                                   9*   11%  -0.07   -0.6    2.83      44%     11%
5-15m                                 22    14%  -0.25   -5.5    1.94      27%     27%
15m+                                  15    80%  +2.95  +44.3    3.51      13%     60%
```

**Composition of the 33 short (<5 min) live trades: 19 (58%) had MFE < 0.5R — the market never
offered a thing. 11 (33%) offered 0.5–2R. Only 3 (9%) offered >= 2R.**
(Practice <5m, n=148: 70 / 57 / 21 = 47% / 39% / 14%. Same shape.)

```
[T2-CONFIRM]  H4 confirmed: held >=5min beats <5min on live.
  numbers:    >=5min n=37 win%=41 expR=+1.05 [+0.32,+1.85] sumR=+38.8
              <5min  n=33 win%= 3 expR=-0.48 [-0.73,-0.06] sumR=-15.7
              permP=0.0008. Both cells >= 15. Practice: +66.8R vs -73.1R, permP=0.0000.
  mechanism:  See the decomposition below — the mechanism is NOT what the headline suggests.
  confounds:  Artifact #2 is the whole issue and is addressed directly below.
  verdict:    The split replicates, but the causal reading of it does not survive decomposition.

[T2-REJECT]  The fix is SELECTION, not patience. ~3 in 5 short trades were dead on arrival; only 1 in 11 was a bailed-on winner.
  numbers:    Of 33 live <5m trades: 19 (58%) MFE<0.5R (never worked, unfixable by holding),
              3 (9%) MFE>=2R (genuinely bailed on a winner). The 19 dead trades cost -12.4R
              and no exit policy recovers them. The 3 bailed-on winners left 23.6R nominally on
              the table, but 15.3R of that is one SPY trade that offered 20.4R (he still took
              +5.1R); held to a realistic 2.5R target those 3 trades add +5.2R, not 23.6R.
              Opportunity-matched test (MFE>=1 only): <5m n=9* expR=+0.03 [-0.73,+1.37] sumR=+0.3
              vs >=5m n=23 expR=+2.01 [+0.96,+3.06] sumR=+46.2, permP=0.0503.
  mechanism:  MFE here is measured entry→16:00 ET independent of his exit, so it is a clean
              read on what the entry was worth. A short trade with MFE<0.5 means the breakout
              failed immediately — no exit policy saves it.
  confounds:  Artifact #2 ruled out by construction (MFE does not grow with hold time — live
              meanMFE by bucket is 0.65 / 2.83 / 1.94 / 3.51, non-monotone). Artifact #8: I am
              NOT proposing "don't take probes" — duration is an exit-side label, unknowable at
              entry. The claim is about what the ENTRIES were worth.
  verdict:    "Hold longer" would have converted at most 3 trades. "Stop taking the ~55% of
              setups that never offer 1R" is worth an order of magnitude more. The
              opportunity-matched arm (n=9*, permP=0.05) hints that patience helps too, but it
              is underpowered live — in practice the same arm is decisive (n=41 vs 69,
              permP=0.0000), so patience is real but second-order.
```

---

## 6. PARTIALS — does scaling out add value after controlling for opportunity?

```
LIVE raw:  <=2 partials n=34 win%=12 expR=-0.09 [-0.55,+0.50] sumR=-3.0
           >=3 partials n=36 win%=33 expR=+0.72 [+0.02,+1.54] sumR=+26.1   permP=0.1013
```

MFE-stratified (only compare trades with similar opportunity):

```
              LIVE                                    PRACTICE
stratum   <=2            >=3         permP     <=2            >=3          permP
MFE<0.5   n=17 -0.62  | n=10* -0.52   0.432    n=61 -0.71  | n=24  -0.78    0.372
MFE 0.5-2 n=13* -0.43 | n=12* -0.16   0.541    n=62 -0.29  | n=31  -0.47    0.190
MFE>=2    n= 4* +3.30 | n=14* +2.37   0.585    n=37 +0.70  | n=33  +1.91    0.0012
```

Duration-stratified (artifact #3 — `# Partials` correlates 0.59 with duration in live):

```
LIVE  <5m   <=2 n=24 -0.38 | >=3 n= 9* -0.73  permP=0.393
      5-15m <=2 n= 8* -0.21 | >=3 n=14* -0.27  permP=0.920
      15m+  <=2 n= 2* +3.90 | >=3 n=13* +2.81  (one cell n=2, not testable)
```

```
[T2-REJECT]  H5 rejected on live: >=3 partials does not beat <=2 once you control for anything.
  numbers:    Raw permP=0.1013 — fails at 0.05 before any correction. MFE-stratified: permP
              0.43 / 0.54 / 0.59, and in the MFE>=2 stratum the all-out trades actually did
              BETTER (+3.30 vs +2.37, n=4* vs 14*). Duration-stratified: permP 0.39 / 0.92,
              no cell favours partialling.
  mechanism:  None survives. The raw live gap is entirely a restatement of H4 — median duration
              is 1.9 min for <=2 partials and 8.4 min for >=3, corr(part, dur) = 0.59. You
              cannot take 3 partials on a 2-minute trade (artifact #3).
  confounds:  Artifact #3 addressed by the duration stratification, artifact #2 by the MFE
              stratification. Both kill the effect.
  verdict:    REJECTED. His stated norm (all-out, occasional scale to hold a runner) is not
              costing him anything measurable, and the practice signal (MFE>=2 stratum,
              permP=0.0012) did NOT replicate live. Do not adopt a partialling rule on this
              evidence.
```

---

## 7. LOSER DISTRIBUTION — is the stop respected?

```
                                   LIVE (n=70)        PRACTICE (n=248)
losers                             52 (74%)           174 (70%)
mean / median loser                -0.65R / -0.70R    -0.65R / -0.70R
worst single loss                  -1.10R             -2.70R
losers worse than -1R              3 (6% of losers, -3.3R total)   10 (6%, -13.8R)
losers worse than -1.25R           0                  5
scratches |R| < 0.15               3 (4%)             32 (13%)
loser hist (0.25R bins)   0:5 0.25:13 0.5:10 0.75:14 1:10
payoff ratio (meanWin/|meanLoss|)  5.84               2.69
```

```
[T2-CONFIRM]  Loss control is the most reliable thing in this data set, and it improved live.
  numbers:    Mean loser -0.65R in both books; live max loss -1.10R vs practice -2.70R.
              Zero live losses beyond -1.25R (practice had 5). Payoff ratio doubled, 2.69 → 5.84.
              Win rate FELL 27% → 23% over the same period.
  mechanism:  He is not stopping at a price. 56% of live trades traded through the 1R stop level
              and he stayed in; of those that still lost, mean realised was -0.78R, recovering a
              mean of +0.63R from the low before he exited. Losers that never breached 1R came
              out at -0.49R. That is a deliberate exit-into-the-retrace habit, and it is why the
              max-loss tail is capped at -1.10R without a hard stop.
  confounds:  Artifact #1: R is stop-defined, so "-0.65R" is a ratio; a systematically wider
              stop would flatter it. Stop distance convention is unchanged across both books
              (implied R$ = stop distance x shares matches the risk unit to the cent), so the
              cross-book comparison is clean. Not outcome-labelled (this is realised P&L, not
              a self-label), so artifact #6 does not apply.
  verdict:    The month's improvement is entirely on the loss side, not the win side. The whole
              +23.1R is a payoff-ratio story: same win rate (slightly lower), same average loss,
              much bigger average win.
```

---

## 8. RISK-UNIT CHANGE WITHIN THE MONTH — did sizing up change his execution?

Clean two-block natural experiment ($14 era 07-30→08-13; $18 era 08-14→08-28; $28 appears 6 times):

```
                      n   win%   expR      95% CI        sumR   medDur  meanMFE  meanMAE  meanLoser
$14 (07-30→08-13)    32    31%  +0.73  [-0.06,+1.58]    +23.5    7.8m    2.82     -1.39     -0.71
$18 (08-14→08-28)    30    17%  +0.11  [-0.41,+0.85]     +3.4    4.0m    1.35     -0.98     -0.52
$28                   6*   17%  -0.30  [-0.92,+0.60]     -1.8    2.8m    0.85     -0.84       --
permP($14 vs $18) = 0.2585
Capture @2.5R: $14 n=10 → 63%   |   $18 n=5 → 50%
Chronological halves (split 08-13): first n=32 +0.39 [-0.24,+1.13]; second n=38 +0.28 [-0.31,+0.97]
```

```
[T3-HYPOTHESIS]  As size went up, hold time roughly halved, drawdown tolerance shrank, and losers got smaller — he traded tighter.
  numbers:    medDur 7.8m → 4.0m → 2.8m across $14 → $18 → $28. meanMAE -1.39 → -0.98 → -0.84.
              meanLoser -0.71R → -0.52R. Capture@2.5R 63% (n=10) → 50% (n=5). meanMFE fell too
              (2.82 → 1.35 → 0.85), so opportunity also declined — the two are not separable.
              permP on expR = 0.2585, i.e. the R-level performance difference is NOT significant.
  mechanism:  Textbook size-anxiety: bigger $ per R makes the same R excursion feel larger, so
              he takes it off sooner and tolerates less heat. Every metric that measures HIS
              behaviour (duration, MAE tolerance, loser size) moved in the same direction at the
              same time, which is more than a single noisy statistic.
  confounds:  Fatally confounded with calendar time — the $18 block IS the second half of the
              month. The chronological-halves split (+0.39 vs +0.28) shows almost no performance
              difference, so the R-level result is a wash and only the BEHAVIOURAL metrics moved.
              meanMFE also fell, so part of the shorter holds is simply less opportunity, not
              less patience. The $28 and $24/$38 cells (n=6, 1, 1) are uninterpretable.
              08-24 has a blank risk unit and is excluded from R analysis.
  verdict:    Suggestive and behaviourally coherent, but time-confounded and non-significant in
              R (permP=0.26). Do NOT conclude "sizing up hurt him." DO watch duration and MAE
              tolerance as the leading indicators when the risk unit next moves — pre-register
              this for next month.
```

---

## PRE-REGISTERED HYPOTHESIS RESULTS (live only)

```
[T2-CONFIRM]  H4  held >=5min outperforms <5min
  numbers:    >=5m n=37 expR=+1.05 [+0.32,+1.85] sumR=+38.8 | <5m n=33 expR=-0.48
              [-0.73,-0.06] sumR=-15.7 | permP=0.0008. Both cells >=15.
  mechanism:  Real, but the mechanism is entry selection (58% of short trades had MFE<0.5R),
              not impatience. See section 5.
  confounds:  Artifact #2 controlled via MFE (measured entry→16:00, independent of his exit).
              Artifact #8: not actionable as "avoid probes" — duration is defined by the exit.
  verdict:    CONFIRMED as a split; the actionable content is on the entry side, not the exit side.

[T2-REJECT]  H5  >=3 partials outperforms <=2
  numbers:    >=3 n=36 expR=+0.72 [+0.01,+1.54] sumR=+26.1 | <=2 n=34 expR=-0.09 [-0.54,+0.51]
              sumR=-3.0 | permP=0.1013. Fails at alpha=0.05 raw; dies completely under both
              MFE- and duration-stratification (all permP >= 0.39).
  mechanism:  None. corr(part, dur)=0.59; H5 is H4 wearing a different hat.
  confounds:  Artifact #3 confirmed as the whole explanation.
  verdict:    REJECTED. Practice's MFE>=2 signal (permP=0.0012) did not replicate live.

[T2-CONFIRM but non-causal]  H7  RightTheory?=Yes separates the book
  numbers:    Yes n=28 win%=54 expR=+1.66 [+0.71,+2.68] sumR=+46.6 | No n=31 win%=0
              expR=-0.61 [-0.72,-0.49] sumR=-18.9 | permP<0.0001. Blank n=12, sumR=-4.6.
  mechanism:  ZERO of 31 "No" trades were winners. A label with a 0% hit rate on one side is
              not a signal, it is the outcome written down after the fact. Confirmed by
              stratifying on opportunity: within MFE<0.5, Yes expR=-0.50 (n=5) vs No expR=-0.55
              (n=15), permP=0.724 — the label adds NOTHING once you know what the market offered.
              meanMFE for Yes=3.88 vs No=0.69; medDur Yes=8.4m vs No=2.1m.
  confounds:  Artifact #6 (retrospective self-label, outcome-contaminated) — fully in force.
              Artifact #9 (missing-not-at-random) — 12 blanks, concentrated on 08-26 and 08-28,
              both losing days, so the "No" group is if anything under-populated.
  verdict:    The split is real and enormous, and it is worthless as a forward signal. It is a
              scorecard, not a filter. Its ONE legitimate use: he can read his own thesis
              correctly about half the time and when he does the trade averages +1.66R — so
              improving pre-trade thesis quality is where the money is, which is the same
              conclusion section 5 reached from a different direction.
```

---

## TESTS EXAMINED: 84

(43 on live, 41 on practice.) Only **7** live two-group comparisons had n>=15 in *both* cells:
H4, H5, H7, H8, $14-vs-$18, chronological halves, and MAE<=-1-vs-rest. At 43 live tests,
roughly 2 false positives at p<0.05 are expected by chance; H4 (p=0.0008) and H7 (p<0.0001)
survive a Bonferroni threshold of 0.0012, H5 (p=0.10) and the entry-window split (p=0.076)
do not come close. Everything labelled T3 or UNDERPOWERED should be treated as a register
entry for next month, not as an instruction.

---

## TOP 3 THINGS THE TRADER SHOULD KNOW

**1. Your exits are not the problem. Your entries are.**
54% of live trades (38/70) were never offered a single R — the break failed before it paid
anything, and those 38 trades cost -23.4R. Of the 33 trades you held under 5 minutes, 58% had
MFE < 0.5R (nothing to hold onto) and only 9% offered >= 2R (an actual bailed-on winner).
Every exit-side rule in this analysis — hold longer, take partials, use a stop — moves single-digit
R. Cutting the dead-on-arrival half of your book is worth 20R+. H4 is confirmed, but "hold longer"
is the wrong lesson to draw from it.

**2. Do not install a hard stop. Your discretionary loss-cutting is your best-established skill.**
Seven mechanical stop levels from -0.3R to -1.25R all made the live month worse, by 27R to 53R.
A -1.0R stop — your own nominal stop — turns +23.1R into -30.3R. The reason: you trade through
the stop level on 56% of trades and exit into the retrace, recovering a mean +0.63R from the low.
Your average loser is -0.65R and your worst loss all month was -1.10R without a hard stop.
The month's entire improvement is on this side: same win rate (23%, down from 27%), same average
loss, payoff ratio up from 2.69 to 5.84. Caveat you should hold in mind: this result rests on
nine trades that dipped through the stop and recovered. Strip those out and a -0.3R stop wins.
It is a real strength on the evidence, and it is a thin evidence base.

**3. The month is three trades, and two things you might have concluded from it are wrong.**
Top-3 trades = +20.5R of the +23.1R (89%). Without them the book is +2.6R over 67 trades, CI
[-0.31, +0.43]. Two traps: (a) "deep drawdowns become winners" — live shows MAE<=-2R producing
78% winners vs 7% in practice, but MAE can only get deep on trades you chose to hold, so that is
your own conviction read backwards, not a rule; (b) "scaling out works" — H5 is rejected,
`# Partials` correlates 0.59 with duration and the effect vanishes under every control. Your
all-out norm is fine. Separately: as your risk unit went $14 → $18 → $28 your median hold went
7.8m → 4.0m → 2.8m and your drawdown tolerance shrank. Performance in R did not significantly
change (p=0.26) and it is confounded with calendar time — but those two numbers are the ones to
watch the next time you size up.

---

### Housekeeping for the app
`Max R Before Stop` should be split into (a) unconditional MFE to 16:00 and (b) a stop-touched
flag. As written it zeroes out nine of the live month's best trades, which corrupts the Capture
Tracker's Target Capture %, the Execution Skill % in the Prediction funnel, and the Profitability
Analysis simulation — all three read `maxR` directly.
