# R2 — SELECTION, TIMING, PSYCHOLOGY & DISCIPLINE (corrected R)

Books: `live` 71 trades / 19 sessions / +19.4R; `practice` 248 trades / 54 sessions / +7.3R.
All numbers on measured initial risk from the DAS order ladder. `posMFE` (`Position MFE (R)`)
used for everything about what the market offered.

---

## 0. NEW ARTIFACT — read this before anything else

```
[T2-REJECT]  #1m / #5m / #1H are LOOK-AHEAD. They are the strongest-looking signal in the
             dataset and they are not tradeable. Propose a new artifact #15.
  numbers:    live  #5m=0  n=18 win%=0  expR=-0.74 [-0.88,-0.58] sumR=-12.5  vs #5m>=1 n=53 expR=+0.60 p=0.016
              prac  #5m=0  n=49 win%=0  expR=-0.85 [-0.97,-0.73] sumR=-41.7  vs #5m>=1 n=199 expR=+0.25 p=0.0001
              live  #1H=0  n=22 win%=0  expR=-0.78 [-0.92,-0.65] sumR=-17.2  vs #1H>=1 n=49 expR=+0.76 p=0.003
              prac  #1H=0  n=93 win%=16 expR=-0.53 [-0.70,-0.35] sumR=-49.2  vs #1H>=1 n=155 expR=+0.36 p=0.0001
              LAG-1 TEST (the part that IS knowable at entry): among trades whose entry bar
              closed with the trade, prior-consecutive=0 vs >=1 —
                live  #1m p=0.99, #5m p=0.85, #1H p=0.52
                prac  #1m p=0.86, #5m p=0.55, #1H p=0.82   — six tests, six nulls.
  mechanism:  `countConsecutive()` in web/lib/trade-journal/market-data.ts:370 starts at the
              ENTRY bar (`for (let i = entryIdx; ...)`) and uses that bar's CLOSE. The entry bar
              closes AFTER entry. For #1H the bar is 09:30–10:30, so on a 09:31 long entry the
              variable is literally "did the first hour finish green" — measured up to 59 minutes
              after he committed. Live median trade duration is 5.4 min: most trades are closed
              before their own 5m bar, let alone their 1H bar, prints.
  confounds:  A 0% win rate on 67 trades across two independent books cannot come from a genuine
              pre-trade variable — only from one that encodes the outcome. Confirmed structurally
              by reading the enrichment source. #1H is also effectively day-level (constant inside
              the 09:30–10:30 hour on 3/18 live and 10/50 practice days; days with any #1H=0 mean
              day R −0.22 vs +2.73). Long-only trader + "did the tape go up" = circular.
  verdict:    Delete #1m/#5m/#1H from every screen. Recompute them lagged (last COMPLETED bar
              before entry) if you want them at all; the lagged version is a clean null.
```

---

## 1. SELECTION

```
[T2-REJECT]  H2 — mega-cap single names do NOT underperform on live.
  numbers:    live mega n=15 win%=33 expR=+0.50 [-0.45,+1.56] sumR=+7.5, permP vs rest 0.66
              prac mega n=61 win%=25 expR=-0.18 [-0.50,+0.18] sumR=-10.7, permP 0.27
  mechanism:  none needed — the practice signal was never significant (p=0.27) and it flipped sign.
  confounds:  n=15 is exactly at MIN_CELL; CI is enormous and crosses zero.
  verdict:    Rejected out of sample. His stated position ("no mega-cap exclusion") is unrefuted.
```

```
[T2-REJECT]  H3 — index ETFs did NOT produce ~zero; they produced 60% of the month.
  numbers:    live indexETF n=25 win%=24 expR=+0.47 [-0.28,+1.35] sumR=+11.7 of the month's +19.4R
              SPY+QQQ alone n=24 sumR=+11.7 (permP vs rest 0.54)
              prac indexETF n=105 expR=+0.06 [-0.22,+0.37] sumR=+6.4
  mechanism:  none — pattern only. QQQ carried it (+9.1R on 12 trades, of which two trades = +11.5R).
  confounds:  Not a directional finding: the live CI crosses zero. The prediction ("~zero") is
              rejected in the sense that his ETF book was the single largest contributor, but
              nothing here says ETFs are *better*.
  verdict:    H3 rejected. Do not read this as "trade more SPY/QQQ" — read it as "the month was
              carried by index ETFs and cannot be reproduced from n=25".
```

```
[T3-HYPOTHESIS]  The well-powered NULL across pre-trade characteristics HOLDS on corrected R.
  numbers:    53 median-split tests over 28 variables (%Gap, %ATR, RVOL, Float, Avg $ Vol, ADR,
              ADR%, ATR, 30mATR, OR Size, OR %ATR, Prior Close Loc, Dist 20/50 SMA, %VWAP, BVR,
              VIX, entry position in OR, stop dist %, stop dist/ADR, dist to PDH/PDC/PDL, ...).
              6 hit p<0.05, 9 hit p<0.10; chance expects 2.7 and 5.3. FOUR of the six p<0.05 hits
              are the #5m/#1H look-ahead pair. Excluding those, 2 of 49 tests at p<0.05 — exactly
              chance. NOT ONE variable is significant in both books in the same direction.
              Direction agreement across books: 19/26 (chance 13) — driven by the look-ahead trio.
  mechanism:  none. He runs one setup on liquid names in a two-VIX-point regime; the pre-trade
              feature space he actually samples is narrow, so there is little variance to exploit.
  confounds:  Artifact #1 (R-normalisation) checked directly — stop distance/ADR is itself one of
              the 28 and its live p=0.059 does not replicate (prac p=0.21). Artifact #6 (BVR)
              honoured: BVR p=0.24 prac / 0.93 live, dead as expected.
  verdict:    The null survives the R correction unchanged. There is no entry filter in this data.
              Stop looking for one in these 28 columns; the next marginal R is not here.
```

```
[T3-HYPOTHESIS]  Self-rated pre-market Conviction = 1 is the only pre-trade variable that
                 separates anything, in both books, in the same direction.
  numbers:    pooled conv=1  n=24 win%=4 (1 winner in 24) expR=-0.67 [-0.88,-0.42] sumR=-16.2
              pooled conv>=2 n=122 win%=30 expR=+0.31 [-0.02,+0.68] sumR=+38.0   permP=0.019
              prac conv=1 n=16 expR=-0.59 [-0.89,-0.24] | live conv=1 n=8 expR=-0.84 [-1.02,-0.64]
              17 of the 24 conv=1 trades DID reach +1R on the position (posMFE permP=0.058)
  mechanism:  He knows. Pre-market, on the Daily Plan, he labels the idea a 1 and then takes it
              anyway. Causally prior to the trade, unlike Process Followed or RightTheory.
  confounds:  Coverage is 48% live / 45% practice and NOT random — coverage collapses to 0/4, 0/5,
              0/3, 0/7 on the late-month days. Live cell is n=8, below MIN_CELL, so the live leg is
              formally UNDERPOWERED; only the pooled cell clears n>=15. Not confounded with
              instrument (conv=1 SPY/QQQ share 50% prac / 13% live vs 45% / 23% for conv>=2).
              Not pre-registered, so this is discovery, not confirmation.
  verdict:    The strongest surviving selection signal, and it is a self-report, not a market
              variable. Register it: next month, fill Conviction on 100% of trades and pre-register
              "skip conv=1" as H11. Do not act on it yet — one winner in 24 is suggestive but n=8
              on live is not a test.
```

```
[T3-HYPOTHESIS]  The apparent "ETFs offer more" edge is a STOP-WIDTH artifact (artifact #1).
  numbers:    single-entry trades only (so artifact #12 cannot bite):
              % of positions ever reaching +1R — prac ETF 80% vs single-name 67% (posMFE p=0.0002)
                                                 live ETF 75% vs single-name 43% (p=0.114)
              BUT median stop distance / ADR:  prac indexETF 0.094 vs 'other' 0.151
                                               live indexETF 0.130 vs 'other' 0.211
              Re-measured stop-width-free (peak excursion in ADR units):
                prac ETF vs single-name p=0.68 | 'other' vs rest p=0.50
                live ETF vs single-name p=0.54 | 'other' vs rest p=0.76   — dead.
  mechanism:  He uses proportionally tighter stops on SPY/QQQ, so the identical percentage move
              registers as a bigger multiple of R. MFE-in-R is defined by stop distance.
  confounds:  This is artifact #1 caught in the act. Restricting to #Entries=1 removes artifact #12.
  verdict:    No instrument offers a bigger move. It offers a bigger move *relative to the stop he
              chose*. Null once normalised.
```

```
[T3-HYPOTHESIS]  Concentration: the month does not survive its three best trades.
  numbers:    all live n=71 sumR=+19.4 expR=+0.28 [-0.17,+0.80]
              ex-MRNA (4 trades)      +8.5R    ex-QQQ (12)  +10.3R    ex-MRNA+NVDA  +4.9R
              drop top 1 trade +10.4R | top 2 +3.5R | top 3 -1.9R | top 5 -10.8R
              28 distinct symbols, HHI 0.080 (well diversified by count, not by P&L)
              SESSION-clustered bootstrap of the month total: 95% CI [-14.2R, +56.8R]
              mean R per session: live +1.02 [-0.73,+2.91] vs practice +0.14 [-0.79,+1.07],
              session-level permP live vs practice = 0.38
  mechanism:  27% win rate on a fat-tailed payoff. Three trades (MRNA +9.0, QQQ +6.9, NVDA +5.4)
              are 112% of the month.
  confounds:  Session clustering respected (day-block bootstrap, not trade bootstrap).
  verdict:    The month is one MRNA away from flat. And at session level there is NO detectable
              difference between the live month and the practice book (p=0.38) — the "he improved"
              claim has no statistical support even now that practice is +7.3R rather than -9.1R.
```

```
[UNDERPOWERED]  Origin (Watchlist vs Intraday discovery) — no separation.
  numbers:    live Watchlist n=44 expR=+0.26 vs Intraday n=26 expR=+0.30, permP=0.95
              ex SPY/QQQ (auto-Watchlist by rule): Watchlist n=20 expR=-0.00, Intraday n=26 +0.30, p=0.64
              prac Watchlist n=88 -0.05 vs Intraday n=35 +0.05, p=0.76
  mechanism:  none.
  confounds:  SPY/QQQ are forced to Watchlist by ALWAYS_WATCHLIST_SYMBOLS, so the raw split is
              partly definitional; removed above and it stays null.
  verdict:    Planning a name pre-market does not make it a better trade. Null in both books.
```

---

## 2. EXTENSION

```
[T2-REJECT]  Extension is null on corrected R, on 48 tercile tests, and building it off
             `firstEntry` instead of blended average entry changes nothing.
  numbers:    12 operationalisations x 2 entry-price definitions x 2 books = 48 tercile tests.
              Nothing significant in both books. Best candidates:
                entry position inside the OR — prac (firstEntry) lo/mid/hi = +0.48/-0.18/-0.12 p=0.037
                                               live (firstEntry) lo/mid/hi = +1.09/-0.32/+0.09 p=0.16
                and on avgEntry the SAME practice measure is p=0.45 — the "signal" flips on the
                definition of entry price, which is a fragility test it fails.
              Live lo-tercile n=23 sumR=+25.0R; ex-MRNA n=21 sumR=+12.2R expR +1.09 -> +0.58.
              Median split live: below-median n=35 +0.48 vs above n=35 +0.07, permP=0.41.
              Inside/at OR n=49 +0.34 vs above OR high n=21 +0.13, permP=0.70.
  mechanism:  if real: buying nearer the OR low means a tighter stop and more room to the measured
              move. But it is not real at any usable confidence.
  confounds:  firstEntry vs avgEntry are 93% correlated on (entry-O)/ADR, 86% on (entry-ORH)/ADR,
              and are IDENTICAL on 40 of 70 live trades (mean gap 0.26% of price). The "cleaner
              measure" is not a materially different measure, which is why it changes nothing.
  verdict:    Twelve operationalisations, two entry definitions, two books: still null. His
              "avoid extended entries" rule is unfalsified but also unsupported — the data
              cannot see it. Directionally every live tercile leans his way; nothing reaches
              significance and the one p<0.05 does not survive changing the entry price definition.
```

```
[T3-HYPOTHESIS]  "Don't chase a later candle" — the 09:35–09:40 window is the worst in both books.
  numbers:    prac 09:30-35 n=101 +0.07 | 09:35-40 n=40 -0.59 [-0.90,-0.28] | 09:40-50 n=45 +0.59 | 09:50+ n=62 -0.04
              live 09:30-35 n=35 +0.69 | 09:35-40 n=12* -0.52 | 09:40-50 n=17 +0.15 | 09:50+ n=7* -0.03
  mechanism:  the 5th-to-10th minute is where a failed OR break gets bought — precisely the
              "3rd/5th-minute candle chase" he says he avoids.
  confounds:  live cell is n=12, UNDERPOWERED. Practice cell n=40 clears MIN_CELL and its CI
              excludes zero. Non-monotonic in time (09:40-50 is the best practice bucket), so this
              is not a clean "later is worse" story.
  verdict:    Suggestive and mechanism-consistent, underpowered on live. Register as H12
              ("no entries 09:35-09:40") for out-of-sample testing, do not adopt.
```

---

## 3. TIMING

```
[T2-REJECT]  H8 — entries before 09:35 did NOT underperform. At trade level they carried the
             month; but the effect is BETWEEN days, not within them, and the between-day
             component has the opposite sign in practice.
  numbers:    live  <09:35 n=35 win%=34 expR=+0.69 [-0.04,+1.51] sumR=+23.4
                    >=09:35 n=36 win%=11 expR=-0.11 [-0.58,+0.49] sumR=-4.0   trade-level permP=0.107
              prac  <09:35 n=101 +0.07 vs >=09:35 n=147 +0.00, permP=0.78
              WITHIN-DAY permutation (mixed days only, label shuffled inside each session):
                live 15 days / 62 trades, obs diff 0.19 (vs 0.80 at trade level), p=0.64
                prac 46 days / 233 trades, obs diff 0.08, p=0.72
              BETWEEN-day: corr(day's pre-09:35 share, day R) = +0.50 live but -0.11 practice.
                live days >=50% pre: mean day R +1.73 (n=10) vs <50%: +0.23 (n=9)
              Robustness of the live pre-09:35 group: ex-MRNA +23.4R -> +10.6R (expR 0.69 -> 0.33);
                drop its top 2 trades -> +9.0R, expR +0.28.
  mechanism:  reverse causality, and it is measurable. corr(early-session R, number of trades taken
              after 09:35) = -0.50 on live. Early RED days: 2.22 late trades, late R -0.34.
              Early GREEN days: 1.63 late trades, late R +0.04. When the open works he stops; when
              it doesn't he keeps hunting into a worse window. So "early trades are better" is
              partly "days that started well needed no late trades".
  confounds:  Artifact #8 logic applied — the day is the unit. Within-day permutation is the
              correct test and it is a flat null in both books.
  verdict:    H8 rejected (it predicted the opposite of what live showed) but the reverse is NOT
              established either. Within a day, entry time does not predict R. The live pattern is
              a between-day artifact of stopping early on good days, and it does not replicate.
```

```
[T2-REJECT]  H10 — Friday.
  numbers:    live Fri n=22 expR=-0.19 [-0.68,+0.40] sumR=-4.2, permP vs rest 0.21
                   5 Friday sessions mean day R -0.84 vs 14 non-Fri +1.69
              prac Fri n=45 expR=-0.13 sumR=-5.8, permP 0.49; 9 sessions mean -0.64 vs +0.29
              Live worst day is Tuesday (n=16, -0.51, sumR -8.2), not Friday.
  mechanism:  none — pattern only.
  confounds:  5 Friday sessions. Day-of-week on 19 sessions is 5 tests; one will look bad.
  verdict:    Same sign in both books, significant in neither. Noise, as pre-registered as likely.
```

```
[T3-HYPOTHESIS]  Trade #5 and beyond in a session is where the damage is.
  numbers:    live ordinal: #1 n=19 -0.01 | #2 n=18 +0.86 | #3 n=16 -0.05 | #4 n=11* +0.85
                            #5+ n=7* win%=0 expR=-0.64 [-0.86,-0.44] sumR=-4.5
              first-of-day vs later: live p=0.52, prac p=0.31 — no first-trade effect.
  mechanism:  a 5th trade only exists on days he is chasing; see the risk-rule section.
  confounds:  n=7. UNDERPOWERED, and artifact #4 (a later trade requires the day to still be
              running) applies.
  verdict:    Consistent with the drawdown story below but not independently testable at n=7.
```

---

## 4. PSYCHOLOGY (day-level, effective n = 19 sessions)

Coverage on live: energy 16/19 (range 2–4, sd 0.60), tension 16/19 (2–4, sd 0.61),
sleepH 17/19 (6.0–7.5, sd 0.45), sleepSc 16/19 (73–84), ready 16/19 (74–87), urge 16/19 (11 Yes / 5 No).
**The ranges are tiny.** He sleeps 6–7.5 hours and rates himself 2–4 on everything.
There is almost no variance to correlate against.

```
[T2-REJECT]  Psych state does not predict day R.
  numbers:    session-level correlations with day R (n=16-17), permutation p:
                energy r=+0.06 p=0.83 | tension r=-0.14 p=0.62 | sleepH r=+0.20 p=0.45
                sleepSc r=+0.38 p=0.15 | ready r=+0.50 p=0.047
              urge=Yes 11 sessions mean day R +1.78 vs No 5 sessions +0.48, permP=0.60
              Pre-specified REST COMPOSITE (mean z of sleepH, sleepSc, ready), 17 sessions:
                vs day R  r=+0.395 p=0.116
  mechanism:  n/a.
  confounds:  25 psych tests were run; chance expects ~1.25 at p<0.05 and exactly one (readiness)
              landed there. It does not survive being folded into the pre-specified composite.
  verdict:    Null on outcome, as last round. Readiness r=+0.50 is one hit out of 25 and is not
              a finding.
```

```
[T3-HYPOTHESIS]  Rest predicts BEHAVIOUR, not P&L — and the previous round's suggestive link
                 survives, marginally, as the one thing psych is good for.
  numbers:    REST COMPOSITE (one pre-specified test each, 17 sessions):
                vs trades/day     r=-0.482  p=0.051
                vs proc-Yes rate  r=+0.471  p=0.068
                vs note-writing   r=+0.291  p=0.258
                vs day R          r=+0.395  p=0.116
              Median splits (sessions):
                sleepH LOW(8): 4.13 trades/day, 76% proc, 55% notes, day R -0.35
                       HIGH(9): 3.33 trades/day, 90% proc, 73% notes, day R +2.73
                ready  LOW(7): 4.14 trades/day, 76% proc, 59% notes, day R -0.24  (trades/day p=0.067)
                       HIGH(9): 3.22 trades/day, 90% proc, 76% notes, day R +2.94
                sleepSc LOW(8): 3.88 / 74% / 61% | HIGH(8): 3.38 / 93% / 74%
              All four rest measures point the same way on all three behaviours: 12/12 signs.
  mechanism:  plausible and specific — under-rested, he takes more trades and logs less. This is
              the classic self-control depletion pattern and it is measured PRE-MARKET, so it is
              causally prior, which almost nothing else in this dataset is.
  confounds:  Effective n=17 sessions (artifact #8 honoured throughout — never treated as 59
              trades). Not significant at 0.05 after 29 psych tests. Sleep range is 6.0–7.5h;
              the "LOW" group is not sleep-deprived in any clinical sense.
  verdict:    Same conclusion as last round, unchanged by the R correction: psych → behaviour,
              suggestively; psych → P&L, not at all. The sign consistency (12/12) is the strongest
              part of it. Keep logging; it is nearly free and it is the only causally-prior
              variable he has. Do not trade off it yet.
```

---

## 5. THE RISK RULE — the previous round's recommendation is now DEAD

```
[T2-REJECT]  The "-1.5R daily stop" recommendation does NOT survive the R correction. Neither
             does the "-2R sessions finish green once in 27" claim it rested on.
  numbers:    "ever traded to -2R and still finished green": now 3/22 practice + 1/7 live = 4/29
              (previously reported as 1/27). Still bad, but no longer near-absolute.
              R EARNED AFTER the threshold was first breached (i.e. what a daily stop would forfeit):
                practice  -1R: -4.4R over 118 trades | -1.5R: +5.0R | -2R: +2.3R | -2.5R: -5.5R | -3R: -5.0R
                live      -1R: +8.9R over 27 trades  | -1.5R: -0.8R | -2R: +0.1R | -2.5R: +3.8R | -3R: +6.5R
              LIVE MONTH under a hard daily stop (actual = 19.4R):
                -1R -> 10.5R | -1.5R -> 20.2R | -2R -> 19.3R | -2.5R -> 15.6R | -3R -> 12.9R
              BOTH BOOKS, total R saved by the stop across 319 trades / 73 sessions:
                -1R: -4.5R (skips 145 trades) | -1.5R: -4.2R | -2R: -2.4R | -2.5R: +1.7R | -3R: -1.5R
  mechanism:  none survives. On typed risk the deep-drawdown sessions looked unrecoverable;
              on measured risk the trades taken after a -1.5R/-2R breach are a coin flip
              (live +0.01R/trade at the -2R threshold, practice +0.05R/trade).
  confounds:  Artifact #14 honoured explicitly — this was the test that would have been required
              to justify overriding his stated max-loss rule, and it fails. The best threshold
              (-1.5R) buys +0.8R across an entire 19-session month, which is inside the noise of
              a single trade. -2.5R "saves" +1.7R across both books over 73 sessions: nothing.
  verdict:    HE IS RIGHT AND THE PREVIOUS ROUND WAS WRONG. Early losses in this book are
              genuinely recoverable. Do not adopt a tighter daily stop. This reversal is caused
              entirely by the risk correction, not by new data.
```

```
[T2-REJECT]  H6 — a <=2 trades/day cap.
  numbers:    live days with <=2 trades n=5* expR +1.68 vs >2 trades n=66 +0.19, permP=0.11
              prac days with <=2 trades n=8* +0.60 vs n=240 +0.01, permP=0.32
              Hard-cap counterfactual (truncate each session after N trades):
                practice: cap1 12.6R | cap2 14.4R | cap3 -1.4R | cap4 3.8R | cap5 9.9R (actual 7.3R)
                live:     cap1 -0.2R | cap2 15.3R | cap3 14.5R | cap4 23.9R | cap5 20.6R (actual 19.4R)
              corr(trades/day, day R): live -0.325, practice -0.105.
  mechanism:  none. The counterfactual is wildly non-monotonic in the cap — practice likes cap 2
              and hates cap 3; live hates cap 1 and likes cap 4. That is the signature of noise.
  confounds:  Artifacts #10 and #14 both bite. The <=2-trade days are n=5 live / n=8 practice —
              far below MIN_CELL — and they are days he stopped early because the open worked
              (see the timing reverse-causality above), so the split is partly definitional.
  verdict:    Rejected. A trade-count cap would have cost him 4.1R on live at cap-2 and gained
              4.5R at cap-4. There is no cap in this data, and per artifact #14 it would have
              had to beat his max-loss rule to be proposable. It doesn't.
```

```
[T2-REJECT]  Tilt after a loss — he does not tilt. If anything the reverse.
  numbers:    live after a loser n=40 expR=+0.27 [-0.36,+1.04] vs after a winner n=12* +0.73, p=0.55
              prac after a loser n=137 +0.11 vs after a winner n=57 -0.35 [-0.61,-0.07], p=0.053
  mechanism:  the practice sign (worse after a WINNER) is the opposite of tilt; live doesn't replicate it.
  confounds:  same-day sequencing only; artifact #4 applies.
  verdict:    No evidence of revenge trading in either book. Another reason his max-loss rule
              is the right rule for him.
```

---

## 6. DISCIPLINE AND JOURNAL QUALITY

```
[T2-CONFIRM]  Process Followed? separates the book in both books — but it is a retrospective
              self-label (artifact #7) and is descriptive only.
  numbers:    prac proc rate 73% (181/248, zero blanks)
                Yes n=181 expR=+0.20 [-0.05,+0.49] sumR=+37.0 | No n=67 -0.44 [-0.67,-0.21] -29.7, p=0.005
              live proc rate 83% (49/59), 12 blanks
                Yes n=49 expR=+0.65 [+0.05,+1.36] sumR=+31.9 | No n=10* -0.70 [-0.96,-0.44], p=0.066
                blank n=12* expR=-0.50 sumR=-5.5
  mechanism:  partly real (he knows when he broke his own rules), partly outcome contamination —
              a losing trade is easier to label "No".
  confounds:  Artifact #7 is the whole story. Cannot be made causal from this data.
  verdict:    Confirms out of sample, means less than it looks. Useful as a diary metric, not as
              evidence that following process causes profit.
```

```
[T3-HYPOTHESIS]  Discipline decayed across the month, and the decay is concentrated exactly
                 where artifact #10 says it is.
  numbers:    first half of month (10 sessions, 37 trades): 33 Yes / 4 No / 0 blank -> 89%, sumR +19.1
              second half   (9 sessions, 34 trades): 16 Yes / 6 No / 12 blank -> 73%, sumR +0.3
              All 12 blanks fall on exactly three sessions: 08-24 (1/1), 08-26 (4/4), 08-28 (7/7).
              Note-writing: 74% of trades before 08-21, 24% after.
  mechanism:  he stopped journalling when the month turned. This is the behaviour, not a signal.
  confounds:  Artifact #10 exactly — missing-not-at-random, and the missingness IS the last
              three losing sessions. Any "blank predicts loss" reading is circular.
  verdict:    Real as a description of what he did. Not usable as a predictor. See next.
```

```
[T2-REJECT]  Journal fill as a LEADING indicator — rejected again, as last round.
  numbers:    live corr(today's blank rate, TOMORROW's day R) = -0.333, permutation p=0.164, n=18
              live corr(today's blank rate, SAME-day R)       = -0.302, p=0.224
              live corr(today's note rate,  SAME-day R)       = +0.257, p=0.288
              practice: UNTESTABLE — zero blank Process cells in 248 trades.
  mechanism:  none. The apparent live relationship is three sessions (08-24, 08-26, 08-28) which
              were consecutive AND at the end of a losing streak, so "yesterday was blank" and
              "we are in the drawdown" are the same variable.
  confounds:  Artifact #10; n=18 day pairs; the practice book cannot even test it.
  verdict:    Stays rejected. Do not resurrect it. Nothing in the corrected data changes this.
```

---

## 7. THE END-OF-MONTH DRAWDOWN (peak 2026-08-21, then 08-24 → 08-28)

```
[T3-HYPOTHESIS]  The drawdown was an EXIT collapse, not a selection collapse and not a regime
                 change. The market kept offering; he stopped converting.
  numbers:    through 08-21 n=54 win%=28 expR=+0.53 [-0.04,+1.17] sumR=+28.6
              after   08-21 n=17 win%= 6 expR=-0.58 [-0.89,-0.12] sumR=-9.2    permP=0.054
              WHAT THE MARKET OFFERED (posMFE) barely moved:
                % of positions reaching +1R: 76% before -> 69% after, permP on posMFE = 0.288
                mean posMFE 4.94 -> 3.28, median 3.44 -> 2.30
              WHAT HE DID WITH IT collapsed:
                among trades that reached +1R on the position, closed green: 15/41 (37%) -> 1/11 (9%)
                median duration 6.05 min -> 2.10 min (permP 0.137); mean 10.0 -> 5.5
                median realised R / posMFE: -0.158 -> -0.364
              The exhibits: 08-25 MRNA posMFE +7.24 closed -1.00R; 08-25 MRNA posMFE +10.63
                closed -0.90R; 08-28 SPY posMFE +9.07 closed -0.60R; 08-26 INTU posMFE +3.01
                closed -0.40R. Four positions that were worth 3x-10x the risk committed, all red.
              NOT the tape: SPY Dir "Up" 52% of trades before vs 71% after. VIX 15.52 -> 15.00.
                RVOL 4.60 -> 5.12. The last four sessions were, if anything, an easier tape.
              NOT selection: SPY/QQQ share 35% -> 29%, ETF share 41% -> 35%, mega-cap 20% -> 24%,
                mean risk $16.80 -> $17.20, mean shares 18.4 -> 19.6, multi-entry 39% -> 35%.
                Nothing about what he picked or how big he went changed materially.
              WHAT DID CHANGE BEHAVIOURALLY:
                trades/session 3.60 -> 4.25; entered <09:35 54% -> 35% (he drifted later);
                stop raised on 57% -> 41% of trades; Process blank 0% -> 71%; notes 74% -> 24%.
  mechanism:  Coherent and mundane: after the 08-21 peak he cut every trade at the first adverse
              tick (duration halved), so trades that went 3-10R in his favour were exited red.
              Simultaneously he traded MORE (4.25/session vs 3.60), LATER (into the 09:35+ window
              that is his worst in both books), and stopped writing anything down. That is a
              protecting-the-number pattern, not a market pattern.
  confounds:  Artifact #12 — posMFE grows with position size, so the before/after posMFE
              comparison could be a sizing artifact; checked, mean #Entries 1.52 -> 1.50 and mean
              shares 18.4 -> 19.6, so sizing did not change. Artifact #2 — duration is partly
              definitional (winners run longer), so the duration drop is CONFIRMED by the
              independent capture measure (15/41 -> 1/11 conversion of +1R positions), which is
              not duration-defined. Artifact #10 — the journal blanks are part of what is being
              described, not evidence for it. n=17 trades / 4 sessions: the permP of 0.054 on
              R is not significant at session level and this is labelled T3 for that reason.
  verdict:    Four sessions is not a finding, but every independent measure points the same way and
              none of them points at the market. He stopped holding. Watch the conversion rate of
              +1R positions, not the P&L, as the early-warning metric.
```

---

## TESTS EXAMINED: 269

(185 produced a formal permutation p-value or bootstrap 95% CI; the remainder are counterfactual
simulations and share/mean comparisons.) Breakdown: 53 pre-trade median splits, 48 extension
terciles, 38 risk-rule/daily-stop tests, 29 psychology, 25 drawdown comparisons, 15 instrument
class/offer, 14 timing, 12 look-ahead, 12 month robustness, 11 discipline/journal, 10 origin/
conviction/catalyst, 2 pooled conviction. At p<0.05 across the 185 formal tests, chance expects
~9; the six that landed there and were not the look-ahead trio did not replicate across books.

---

## TOP 3 THINGS THE TRADER SHOULD KNOW

**1. Do not add a daily loss stop. The last review was wrong about this, and the corrected risk
data reverses it.** On measured risk, a −1.5R daily stop would have earned +0.8R more across the
entire 19-session live month, and across both books every threshold from −1R to −3R lands between
−4.5R and +1.7R over 319 trades. The trades he takes after a bad start are a coin flip, not a
bleed (live: +0.01R/trade after breaching −2R). The "one green session in 27 after hitting −2R"
number that drove that recommendation was an artifact of typed risk; it is now 4 in 29. **His
stated max-loss rule is the correct rule and the data cannot beat it.** Same for a trade-count cap
(H6): capping at 2 trades/day would have cost him 4.1R on live.

**2. The end-of-month drawdown was him, not the tape, and it has a specific signature worth
watching in real time.** The market kept offering — 69% of his positions after 08-21 still went
+1R or better in his favour, statistically indistinguishable from the 76% before (p=0.29), on a
tape that was *more* often up (SPY Dir Up 52% → 71%). What changed is that he stopped holding:
median trade duration fell from 6.1 to 2.1 minutes, and of the positions that reached +1R he
converted 15 of 41 before the peak and 1 of 11 after. Two MRNA trades that went +7.2R and +10.6R
on the position both closed red. Alongside it: more trades per session (3.6 → 4.25), later entries
(54% → 35% before 09:35, drifting into the 09:35–09:40 window that is the worst bucket in both
books), and the journal abandoned entirely (0% → 71% blank). **The leading metric is not P&L. It
is the share of positions that reach +1R and still close green.** When that halves, stop.

**3. There is still no entry filter, and the strongest-looking one in the sheet is fake.** Across
53 median splits on 28 pre-trade variables the null holds on corrected R — nothing is significant
in both books in the same direction, and excluding the look-ahead columns the hit rate is exactly
chance (2 of 49 at p<0.05). Extension is null on 48 tests and rebuilding it off `firstEntry`
instead of blended average entry changes nothing (the two are 86–93% correlated and identical on
40 of 70 trades). **And `#1m` / `#5m` / `#1H` must be deleted from every screen: they count the
entry bar's close, which happens after the entry, so `#5m=0` has a 0% win rate on 67 trades across
both books — it is measuring the outcome.** The one real candidate is his own pre-market
Conviction score: 1 winner in 24 trades he labelled conviction-1 before the open, expR −0.67
[−0.88, −0.42], p=0.019 pooled, same direction in both books. Fill that column on every trade
next month so it can actually be tested (live coverage is 48% and collapses to zero on the bad
days) and pre-register "skip conviction-1" as H11.

*Also worth stating plainly: at session level the live month is not distinguishable from the
practice book (mean R/session +1.02 vs +0.14, permutation p=0.38), the month's total has a
session-clustered 95% CI of [−14.2R, +56.8R], and dropping its three best trades makes it −1.9R.
Nothing here establishes an edge. That is not a criticism of the month; it is the sample size.*
