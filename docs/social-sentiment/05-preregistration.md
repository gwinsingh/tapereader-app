# 05 — Analysis Pre-Registration

**Track D2.** The document that stops this study from fooling its own author.

**As-of: 2026-09-08.** Written *before* any social feature has been joined to any
trade. That timing is the only reason it is worth anything — after the first
cross-tab, every choice in here becomes a choice made in the presence of a
result.

**Evidence key:** `[V]` verified / measured directly · `[R]` reported by a third
party · `[I]` my inference.

**Status of the numbers below:** every distributional figure in §1 was computed
directly from `PCT Bootcamp (May 2026) - Master Trade Journal - TRPCT1541-GURI.csv`
in the repo root — a real export, 36 trades, 2026-05-06 → 2026-05-29 `[V]`. The
power arithmetic is standard normal-theory two-sample power and is reproducible
from the formulas given.

---

## ⬛ The honest bottom line — "when will I know?"

> **For the hypotheses that would actually change how you trade (H1–H4, H6, all
> measured on your own trades): you will not know in 2027, and for realistic
> effect sizes you will not know this decade.**
>
> The arithmetic, not an opinion:
>
> - You trade ~35 trades/month `[I, from 36 measured in May 2026]`.
> - **Half of those are index/sector ETFs** — QQQ 7, SPY 6, SOXL 5 out of 36
>   `[V]` — which have no usable ticker-level retail-attention signal. They are
>   excluded by construction. **Analyzable accrual is therefore ~18/month, not
>   35.**
> - Social collection started **2026-09-08**. There is no backfill. The counter
>   starts at zero.
> - To detect a **large** effect (Cohen's *d* = 0.5, ≈ **0.75 R of MFE**
>   difference between the top and bottom attention bucket) at 80% power you
>   need **N ≈ 188** analyzable trades → **~July 2027**.
> - To detect a **moderate** effect (*d* = 0.3, ≈ 0.45 R) you need **N ≈ 523** →
>   **~February 2029**.
> - To detect the effect size the published social-sentiment literature actually
>   reports (*d* ≈ 0.2, or Spearman ρ ≈ 0.05) you need **N ≈ 1,200–3,100** →
>   **2032 to 2041**. That is a polite way of saying **never**.
>
> **So the pre-committed answer is: the trade-level social question is not
> answerable by this trader's own journal on any horizon worth planning around.**
> That is a finding, and it should be written down now, before three months of
> collection produce a suggestive-looking tercile table that nobody can
> statistically defend.
>
> **What *is* answerable, and when:**
>
> | Arm | Unit of analysis | Answerable? | When |
> |---|---|---|---|
> | **H5 — overnight attention delta → next-day gap/RVOL** | ticker-days across the **whole liquid universe** (~4,000/day) | **Yes, comfortably** | **~Dec 2026** (90 days of snapshots) |
> | **News sentiment (Polygon `insights`)** on existing trades | trades, **backfillable to mid-2024** `[V]` | Weakly — large effects only | **Now**, as a *discovery* set only |
> | H1–H4, H6 on his own trades | trades | **No, for any plausible effect** | 2029+ / never |
>
> **The confirmatory test of this entire study is therefore H5, measured on the
> universe panel, not on his trades.** Everything measured on his own trades is
> exploratory by construction and may not be acted on. That designation is made
> here, on 2026-09-08, and is binding.

---

## 0. What this document binds

Six rules. Violating any of them voids the result, and the correct response to a
violation is to say so in writing, not to quietly proceed.

1. **No cut point may be chosen after seeing an outcome.** Every boundary in §3
   is an absolute number, fixed today. Sample quantiles (terciles, medians,
   "natural breaks") are **forbidden** as bucket definitions, because they are
   computed from the same data that produces the answer.
2. **No comparison with a cell below the minimum N is reported at all** — not in
   a table, not in a figure, not in a sentence. See §3.8.
3. **One confirmatory test.** Named in §5. Everything else is exploratory and
   carries the label in every place it appears.
4. **Analysis runs on a calendar, not on curiosity.** §6.
5. **Every hypothesis has a written falsification condition and a written
   pre-committed conclusion, agreed before the data exists.** §7.
6. **Changes to this document are amendments, dated, in §10, with the reason —
   never edits.** An amendment made after an analysis window is a red flag on
   its own and must be marked as such.

---

## 1. The measured baseline everything rests on

From the May 2026 export, n = 36 trades, 12 distinct trading dates `[V]`:

| Quantity | Measured |
|---|---|
| Trades | **36** over 2026-05-06 → 2026-05-29 |
| Distinct traded dates | **12** (mean 3.0 trades/day, max **9 in one day**) |
| **Distinct symbols** | **11** |
| Symbol concentration | QQQ 7 · SPY 6 · NVDA 6 · SOXL 5 · NBIS 3 · SMCI 2 · IREN 2 · CSCO 2 · QUBT 1 · NOW 1 · DELL 1 |
| **ETF / index share** | **18 / 36 = 50%** (QQQ + SPY + SOXL) |
| `P&L (R)` | mean **+0.16**, sd **1.14**, skew **+0.82**, min **−1.00**, median −0.30, max **+2.40** |
| Win rate | **36.1%** |
| Daily sum of `P&L (R)` | n=12 days, mean +0.49, sd **1.20**, range −1.2 → +2.6 |
| `Side` | **Long 35, Short 1** |
| `Setup` | ORB 26 (72%) · Mean Reversion 4 · BHOD 4 · ABCD 2 |
| `Process Followed?` | Yes 24 / No 12 (100% labelled) |
| `Conviction (1-3)` | **blank on 22 / 36 (61%)** |
| `Catalyst` | **blank on 36 / 36 (100%)** |
| `RVOL` | mean 2.70, sd 4.79, median **0.985** |
| Symbol-cluster ICC on `P&L (R)` | **0.10** → design effect **1.22** |
| Date-cluster ICC on `P&L (R)` | **not estimable** (point estimate −0.32, a small-sample artifact at k=12) |

Seven of these are load-bearing and are easy to miss:

- **Half the trades are ETFs.** This is the single largest constraint on the
  study and it was not visible from the brief. ApeWisdom/StockTwits/Wikipedia
  attention for `SPY`/`QQQ`/`SOXL` is either absent or a constant — there is no
  cross-sectional variation to test against. **They are excluded from H1–H4,
  which halves the analyzable accrual rate.**
- **NVDA is 6 of the 18 non-ETF trades (33%).** NVDA sits permanently at the top
  of every mention list. A percentile-rank feature has almost no variance on it —
  a **ceiling effect** that further shrinks the usable variation. `[I]`
- **11 symbols, 36 trades.** Observations are not independent draws. Measured
  symbol ICC 0.10 (deff 1.22); date ICC is unidentifiable at this size. Plan for
  a design effect of **1.2–1.5** and inflate every N in §4 by ~25%. `[I]`
- **35 of 36 trades are long.** H4 (wall of worry) is a long-only test. The short
  arm cannot be pooled and cannot be analyzed. `[V]`
- **`Catalyst` is 100% blank.** Any hypothesis conditioning on catalyst type is
  unanalyzable today. Auto-population from Polygon news `insights` is a
  *prerequisite* for that, not a bonus.
- **`Conviction` is 61% blank.** Conviction may be a covariate where present; it
  may **not** be a stratifier until coverage exceeds 80%.
- **Realized R is floored at −1.00 and right-skewed (+0.82).** It is not normal,
  and MFE is worse. This decides the choice of test in §9.3.

**On the "~140–200 trades already on the live sheet" estimate:** the May export is
the only file that can be measured here. 35/month × the May 2026 → Sept 2026 span
gives roughly that range, but it is **an inference, not a measurement** `[I]`.
The first action at the first analysis window is to replace it with a count. It
does not change any conclusion in this document — a factor of two on the existing
sample moves the "when" dates by months, not by years.

---

## 2. The primary outcome variable

### 2.1 The distinction that decides it

The journal measures two different things and they must not be blended:

- **Opportunity** — how much the trade *offered*. `Max R Before Stop`,
  `Position MFE (R)`.
- **Outcome** — how much he *took*. `P&L (R)`. This is opportunity **times his
  own exit management**, and the journal's own Capture Tracker exists precisely
  because that second factor is large and varies independently.

H1–H5 are hypotheses about whether crowd attention predicts **opportunity**. If
the primary outcome is realized R, then a null result is uninterpretable — it
could mean "attention carries no information" *or* "attention carries
information and he trailed out of it", and those imply opposite actions (drop the
feature vs. change the exit rule). **A metric that cannot distinguish those two is
the wrong primary.**

### 2.2 Decision

**PRIMARY OUTCOME: `Max R Before Stop`** — the order-aware maximum favorable
excursion in R, walked from entry to 16:00 ET, terminating if the working stop is
hit.

Why this one and not the alternatives:

| Candidate | Verdict |
|---|---|
| **`Max R Before Stop`** | **PRIMARY.** Measures opportunity. Order-aware (defined against the real ladder stop, not the circular back-derived one). Longest enrichment history of the MFE family, so the widest coverage on existing rows. |
| `Position MFE (R)` | **Robustness variant, not primary.** More faithful for scaled-in positions, but it requires the 21-column ladder block, which only exists for uploads since the ladder wiring — coverage on historical rows is unknown and probably poor. Reported alongside; if the two disagree in sign, neither is reported as a finding. |
| `P&L (R)` | **SECONDARY S1.** The outcome question, deliberately kept. |
| `MAE (R)` | **SECONDARY S2.** The risk question. |
| `Capture %` | **EXCLUDED as an outcome.** It is realized ÷ MFE — a pure execution metric. There is no reason crowd attention should predict how well he manages an exit, and testing it invites a spurious hit. It may be *reported descriptively* per bucket; it may not be tested. |
| Win rate | **EXCLUDED as an outcome.** Binary, throws away magnitude, and by far the worst-powered: at N=200 split two ways it takes a **+19.6 percentage-point** win-rate gap (36% → 55.6%) to reach 80% power `[V, computed]`. Nothing in this study will produce that. Reported descriptively only. |

**Exactly two secondaries, named now, and no others may be added:**

- **S1 `P&L (R)`** — realized. Its role is diagnostic: if the primary moves and S1
  does not, the correct reading is *"attention predicts opportunity you are not
  capturing"*, which is a coaching finding about exits, **not** a case for a
  pre-trade attention filter. Pre-commit to that reading now.
- **S2 `MAE (R)`** — maximum adverse excursion over the actual holding window.
  Its role: if high-attention names offer the same MFE but with materially worse
  MAE, the actionable output is a **sizing** change, not a **selection** change.
  This is the only outcome in the set that could justify keeping a feature that
  fails on the primary.

### 2.3 The censoring problem, and the pre-registered fix

`Max R Before Stop` **stops walking when the stop is hit**. So MFE is *censored by
stop width*. If high-attention names are more volatile — and they are, that is
half the point of confounder §8.1 — they hit the stop sooner and record a lower
MFE **for reasons that have nothing to do with attention and run exactly opposite
to H1.** Ignoring this would bias the study toward rejecting its own hypothesis.

**Pre-registered fix, fixed now:** every primary test is run twice —

1. On `Max R Before Stop` as stored (censored), and
2. On an **uncensored excursion**, computed from the trade-date daily candle
   already in the sheet: for longs `(H − First Entry) / riskPerShare`, for shorts
   `(First Entry − L) / riskPerShare`, where `riskPerShare = Initial Risk ($) ÷
   first-entry shares`. This ignores the stop entirely and is not censorable.

If the two disagree in **direction**, the result is reported as
*"direction depends on stop-censoring"* and **is not called a finding.** The
uncensored variant is coarser (daily H/L, not the intraday path) — it is a
sensitivity check, not a replacement.

### 2.4 Coverage rules

- A trade enters the analysis only if `R (Risk)` is filled (MFE is undefined
  without it). The ladder now auto-fills `R` from `Initial Risk ($)`, so forward
  coverage should be near-complete; historical coverage must be **counted and
  reported**, never assumed.
- The literal string `N/A` in any enrichment column is **null**, per the journal's
  own convention. A blank is "not enriched yet" and is a **data-quality defect
  that blocks the analysis window**, not a missing value to impute.
- **No imputation of any outcome or predictor. Ever.** Missing rows are excluded
  and the exclusion count is reported next to every N.

---

## 3. Bucket definitions — frozen, numerically, today

Every predictor below is computed **from a snapshot the collector itself took,
with `snapshot_ts_utc` strictly earlier than the trade's entry time.** A feature
that could only be reconstructed after the fact is exploratory-only and must be
labelled as such wherever it appears (see §8.7).

**The z-scores below are per-ticker transforms against that ticker's own trailing
20 sessions — that is legitimate and is not a sample-dependent cut point. The
*boundaries* applied to those z-scores are absolute constants, fixed here.**

### 3.1 H1 — Fuel (attention velocity)

- **Predictor:** `mentions_z20` = (mentions in the 09:15 ET pre-market snapshot −
  mean of that ticker's prior 20 sessions' 09:15 mentions) ÷ sd of same.
- **Requires** ≥ 15 of the prior 20 sessions present, else the trade is excluded
  (not imputed).
- **Cut points (absolute, fixed):** `Low: z < 0.0` · `Mid: 0.0 ≤ z < 1.5` ·
  `High: z ≥ 1.5`
- **Primary contrast:** High vs Low. **Direction:** High > Low on the primary.
- **Min cell N: 25.**

### 3.2 H2 — Crowded / late

- **Predictor:** `mentions_pct_universe` = the ticker's percentile rank by mention
  count *within that day's full ApeWisdom all-stocks list* — a cross-sectional
  rank inside the source's own universe, **not** a rank inside his trade sample.
- **Cut points (absolute, fixed):** `Normal: pct < 90` · `Crowded: 90 ≤ pct < 99` ·
  `Extreme: pct ≥ 99`
- **Primary contrast:** Extreme vs Normal. **Direction:** Extreme **<** Normal
  (H2 predicts attention extremes are a fade). This is the one hypothesis whose
  pre-registered direction is *negative*; recording that now is what prevents a
  negative result being re-narrated as "confirms H2" after the fact.
- **Min cell N: 25.**

### 3.3 H3 — Fresh discovery

- **Predictor (binary):** `novelty_flag` = 1 iff the ticker's 09:15 snapshot shows
  **mentions ≥ 5** *and* the ticker showed **< 5 mentions on every one of the
  prior 10 sessions**. Else 0.
- **Cut points:** binary, as defined. The thresholds 5 and 10 are fixed here and
  may not be tuned.
- **Direction:** Fresh > Not-fresh on the primary.
- **Min cell N: 25 in the `Fresh` arm.** ⚠️ **This is the binding constraint and
  it will very likely never be met.** Fresh-discovery events are rare, and his
  traded set is 11 mega-cap-skewed symbols. Expected `Fresh` count in a year:
  plausibly single digits `[I]`. **Pre-commit: if the `Fresh` arm has not reached
  25 by the 2027-07 window, H3 is declared unanswerable on this trader's journal
  and is closed.** It may be re-opened only as a universe-panel question (does
  fresh discovery precede multi-day runs *in general*), which is a different
  study.

### 3.4 H4 — Wall of worry

- **Predictor:** `polarity` ∈ [−1, +1]. Preference order, fixed now:
  1. StockTwits declared Bullish/Bearish tags: `(bull − bear) / (bull + bear)`,
     requiring ≥ 10 tagged messages that session;
  2. else Polygon news `insights` day score: `(positive − negative) / (positive +
     negative + neutral)` over articles with `published_utc <` entry time,
     requiring ≥ 3 articles.
  **The two sources are never pooled.** Each is a separate test with its own N.
- **Cut points (absolute, fixed):** `Negative: ≤ −0.20` · `Neutral: −0.20 < p <
  +0.20` · `Positive: ≥ +0.20`
- **Restriction: LONG trades only.** 35 of 36 measured trades are long `[V]`; the
  short arm is unanalyzable and pooling it would silently invert the hypothesis's
  meaning.
- **Direction:** Negative-polarity longs > Positive-polarity longs on the primary.
- **Min cell N: 25.**

### 3.5 H5 — Overnight attention delta ⭐ *the confirmatory arm*

**Unit of analysis is the ticker-day, on the full liquid universe — not his
trades.** This is what makes it answerable and what makes it immune to the
selection circularity in §8.2.

- **Predictor:** `overnight_delta = ln((mentions_0915 + 1) / (mentions_prevEOD + 1))`
  where `prevEOD` is the 16:05 ET snapshot of the prior session.
- **Cut points (absolute, fixed):** `Flat: < 0.25` (≈ <+28%) · `Rising: 0.25 ≤ d <
  1.00` · `Surging: ≥ 1.00` (≈ ≥+172%)
- **Outcome (this arm only — the primary in §2 does not apply here, and this is
  stated so the substitution is visible rather than convenient):**
  **`|next-session gap| ÷ ADR`**, using the trade-date daily candle columns the
  journal already computes. ADR (gap-free) not ATR, matching the journal's own
  Daily Prediction convention.
- **Secondary outcome:** next-session RVOL.
- **Universe restriction:** price ≥ $1 and dollar volume ≥ $5M — the same liquid
  universe as `docs/market-scans/phase-1-spec.md`, so the two studies compose.
- **Min cell N: 500 ticker-days.** (Deliberately much higher — this arm has the
  observations, so it should be held to a higher bar, not the same one.)
- **Direction:** Surging > Flat.

### 3.6 H6 — Regime filter

- **Unit of analysis:** the **trading day**. `n` = *traded* days, not trades.
  Measured: **12 traded days per month** `[V]`.
- **Predictor:** `market_bull_share` = share of the day's top-100 ApeWisdom
  all-stocks tickers whose polarity ≥ +0.20, at the 09:15 snapshot.
- **Cut points (absolute, fixed):** `Bearish: < 0.40` · `Mixed: 0.40–0.60` ·
  `Bullish: > 0.60`
- **Outcome:** daily sum of `P&L (R)` (measured sd **1.20** `[V]`).
- **Min cell N: 25 traded days.**
- ⚠️ **H6 is the worst-powered hypothesis in the set.** At 12 traded days/month,
  reaching N=100 days takes **8.3 months**, and at N=100 split two ways the
  detectable effect is *d* = 0.56 ≈ **0.67 R per day** — larger than the entire
  measured daily mean (+0.49 R). **H6 is exploratory permanently** unless it is
  re-specified against a universe-level outcome (e.g. next-day breadth), which
  would make it a market-scans question rather than a journal question.

### 3.7 Forbidden operations — explicit

Every one of these is a documented route to a manufactured result. Each is banned
by name so that doing it later requires an amendment in §10 with a signature.

- ❌ Sample terciles, quartiles, medians, or any quantile of the analysis sample
  as a bucket boundary.
- ❌ Moving a boundary "because the cells came out uneven".
- ❌ Adding a fourth bucket, or collapsing three into two, after seeing the data.
- ❌ Switching the primary outcome, or promoting a secondary, post hoc.
- ❌ Dropping a bucket "because it's noisy".
- ❌ Adding a covariate or a filter (a date range, a setup, a symbol exclusion)
  that is not already named in this document.
- ❌ Reporting a comparison whose smallest cell is below its stated minimum.
- ❌ Reporting a percentage without its denominator.

### 3.8 The minimum-cell rule, and why 25

At **n = 25 per cell**, the detectable effect at 80% power is already *d* = 0.79
`[V, computed]` — nearly a full standard deviation. Below 25 the cell mean is not
an estimate, it is an anecdote with error bars wide enough to contain any story.

- **n < 25 in any cell → the comparison is not reported at all.** Not plotted, not
  tabulated, not mentioned.
- **25 ≤ n < 60 → the comparison may be plotted, and may be described only as
  "underpowered; direction only".** No p-value is reported for such a cell.
- **n ≥ 60 → normal reporting.**

**This rule exists because of a specific precedent inside this very run.** Track C
(`03-sources-flow.md` §11) found a beautifully monotone tercile gradient —
+1.41% / +3.54% / +6.37% next-day return — on **n = 14 per bucket**, and had the
discipline to write *"it is worth almost nothing as evidence"* and *"a single ASTS
or OKLO print moves the bucket mean by more than the entire spread between
buckets."* That is exactly right, and it is exactly the shape of thing that
becomes a "finding" the moment nobody is guarding it. **The n=25 floor is the
guard, written down before there is anything to be tempted by.**

---

## 4. Power analysis

### 4.1 Assumptions, stated and justified

**Standard deviation of the primary outcome.** Measured sd of `P&L (R)` is
**1.14** `[V]`. MFE (`Max R Before Stop`) has a different shape: it is floored at
0 rather than −1, and it is unbounded above where realized R is effectively
capped by his own exits (measured max realized R = **+2.40**). Both changes widen
it. **I assume sd(MFE) = 1.5 R** `[I]`, and carry sd = 1.14 and sd = 1.8 as
brackets so no conclusion depends on the assumption. This is the one number in the
document that should be replaced with a measurement at the first analysis window;
the substantive conclusion (§0) survives across the whole 1.14–1.8 range.

**Skew and the normal approximation.** Measured skew of realized R is **+0.82**,
with a hard floor at −1.00 `[V]`. MFE is more skewed still: a small number of
runners carry the right tail. Consequences:

- The normal approximation is **not** reliable at the per-cell sizes this study
  will actually have (25–70). The t-test's nominal 5% will not be its real 5%.
- **A rank test is the more honest primary**, and it is nearly free: the
  Mann–Whitney U has asymptotic relative efficiency **0.955** against the t-test
  *under normality* — a ~5% power cost in the case where the t-test is right —
  and **exceeds 1.0** under exactly the right-skewed, heavy-tailed shape this
  data has `[R, standard result]`. Paying 5% in the world where you are wrong to
  gain power in the world where you are right is an easy trade.
- **Decision: Mann–Whitney U is the primary test; the t-test is reported only as
  a sensitivity check.** The power tables below are computed on normal theory and
  are therefore, if anything, mildly *optimistic* about the t-test and roughly
  right for MW. They are not optimistic enough to change any date in §0.

**Clustering.** Measured symbol ICC 0.10 → deff 1.22 `[V]`. Date ICC not
estimable at k=12 (point estimate −0.32, a small-sample artifact — reporting it as
a real negative ICC would itself be a small-sample error). **Plan for deff
1.2–1.5; every N below should be read as ~25% larger in practice.** `[I]`

### 4.2 Detectable effect at 80% power, α = 0.05 two-sided

`d_min = (z₀.₉₇₅ + z₀.₈₀) × √(2/n) = 2.802 × √(2/n)`

| Total analyzable N | Split | n / cell | *d* min | @ sd 1.14 | **@ sd 1.50** | @ sd 1.80 |
|---|---|---|---|---|---|---|
| 50 | 2 buckets | 25 | 0.79 | 0.90 R | **1.19 R** | 1.43 R |
| 50 | 3 buckets (High vs Low) | 17 | 0.97 | 1.11 R | **1.46 R** | 1.75 R |
| 100 | 2 buckets | 50 | 0.56 | 0.64 R | **0.84 R** | 1.01 R |
| 100 | 3 buckets (High vs Low) | 33 | 0.69 | 0.78 R | **1.03 R** | 1.24 R |
| 200 | 2 buckets | 100 | 0.40 | 0.45 R | **0.59 R** | 0.71 R |
| 200 | 3 buckets (High vs Low) | 67 | 0.49 | 0.55 R | **0.73 R** | 0.87 R |
| 400 | 2 buckets | 200 | 0.28 | 0.32 R | **0.42 R** | 0.50 R |
| 400 | 3 buckets (High vs Low) | 133 | 0.34 | 0.39 R | **0.51 R** | 0.62 R |
| 800 | 3 buckets (High vs Low) | 267 | 0.24 | 0.28 R | **0.36 R** | 0.44 R |

**Read the sd = 1.50 column.** At **N = 100 analyzable trades split three ways,
the top and bottom attention buckets must differ by more than a full R of MFE
before this study can tell them apart.** A full R of MFE is not a subtle
sentiment tilt; it is the difference between a losing setup and a good one. No
social-sentiment feature has ever been reported to do that.

### 4.3 The same question inverted: N required for a given effect

| True effect | ≈ R gap (sd 1.5) | n/cell | **N required** (3 buckets) |
|---|---|---|---|
| *d* = 1.00 | 1.50 R | 16 | 47 |
| *d* = 0.70 | 1.05 R | 32 | 96 |
| **d = 0.50** | **0.75 R** | 63 | **188** |
| *d* = 0.40 | 0.60 R | 98 | 294 |
| **d = 0.30** | **0.45 R** | 174 | **523** |
| *d* = 0.25 | 0.38 R | 251 | 753 |
| *d* = 0.20 | 0.30 R | 392 | 1,177 |

Full-sample monotone trend test (Spearman, which uses all N rather than two
cells, and is therefore the *most* generous framing available):

| True ρ | N required | Comment |
|---|---|---|
| 0.30 | 85 | Implausibly large for a sentiment factor |
| 0.20 | 194 | Would be a headline result in the literature |
| 0.15 | 347 | Optimistic |
| **0.10** | **783** | About the ceiling of what published social factors report `[R]` |
| 0.05 | 3,137 | The realistic value `[I]` |

### 4.4 Converting to calendar time

Start: **2026-09-08**. Three accrual scenarios:

- **35/month** — all trades. *Not applicable to H1–H4*, listed to bracket.
- **18/month** — non-ETF only. Measured ETF share is 50% `[V]`. **This is the
  planning number.**
- **12/month** — non-ETF **and** has attention data **and** has `R` filled.
  Realistic once ~30% attrition from coverage gaps is allowed `[I]`.

| Target N | @35/mo | **@18/mo (plan)** | @12/mo |
|---|---|---|---|
| 50 | Oct 2026 | **Dec 2026** | Jan 2027 |
| 100 | Dec 2026 | **Feb 2027** | May 2027 |
| **188** (*d*=0.50) | Feb 2027 | **Jul 2027** | Dec 2027 |
| 200 | Feb 2027 | **Aug 2027** | Jan 2028 |
| 294 (*d*=0.40) | May 2027 | **Jan 2028** | Sep 2028 |
| **523** (*d*=0.30) | Dec 2027 | **Feb 2029** | Apr 2030 |
| 753 (*d*=0.25) | Jun 2028 | **Mar 2030** | Dec 2031 |
| 1,177 (*d*=0.20) | Jun 2029 | **Feb 2032** | Nov 2034 |

**Apply the clustering inflation (deff ~1.25) and every date in the plan column
slips by roughly a quarter of its own distance.** *d* = 0.30 lands in mid-2029.

### 4.5 The one arm that is well powered — H5

H5 is measured on **ticker-days across the liquid universe (~4,000/day)**, not on
his trades. 90 days of snapshots ≈ **360,000 ticker-days** — of which the
`Surging` bucket (overnight delta ≥ 1.0) will be a small but easily four-figure
subset `[I]`. At those sizes the detectable Spearman ρ is well below 0.05, and the
binding constraint stops being statistical power and becomes **whether the effect
is real and whether it survives §8.1's incremental-to-RVOL gate.**

**That is the correct place to put the confirmatory test**, and it is why §5
designates it. It is also the arm that most directly serves the brief's stated
purpose — H5 is the hypothesis that feeds the Morning Plan.

### 4.6 The retrospective news arm — answerable now, and dangerous

Polygon `/v2/reference/news` `insights` has **100% coverage from mid-2024
forward** `[V, 00-measured-facts.md]`, which covers the entire existing journal.
So the *news*-sentiment version of H4 can be scored on ~140–200 existing trades
**today**, at zero cost.

This is a genuine asset and a genuine hazard. The hazard: a backfill that can be
re-run with different parameters until something appears is the purest form of the
thing this document exists to prevent.

**Pre-registered design, fixed now — split-sample, and this is the strongest
design available for free:**

- **Discovery set:** all trades with entry date **< 2026-09-08**. Anything found
  here is a *hypothesis*, permanently, and is labelled as such in every
  appearance. It may not be described as evidence for anything.
- **Replication set:** all trades with entry date **≥ 2026-09-08**. Never touched
  outside a scheduled window.
- Exactly **one** hypothesis may be carried from discovery to replication, chosen
  and written into §10 **before** the replication set is examined.
- Estimated discovery-set power: ~150 trades × 50% non-ETF ≈ **75 analyzable**,
  two buckets → detectable *d* ≈ 0.65 ≈ **0.97 R**. Large effects only. Say so
  wherever the discovery result is quoted.

---

## 5. Multiple comparisons

Six hypotheses × three outcomes × two censoring variants × two polarity sources is
**a garden of forking paths with well over fifty terminal nodes.** At α = 0.05 and
50 independent tests, the probability of at least one "significant" result under a
complete null is **92%**. Correction alone does not fix this; the structural
split does.

### 5.1 The confirmatory test — one, named

> **CONFIRMATORY: H5.** On the universe ticker-day panel, `overnight_delta`
> **Surging (≥ 1.00)** vs **Flat (< 0.25)**, outcome `|next-session gap| ÷ ADR`,
> Mann–Whitney U, **one-sided** in the pre-registered direction (Surging >
> Flat), **α = 0.05**, minimum 500 ticker-days per cell, **and** the effect must
> survive the incremental-to-controls test in §8.1.
>
> **This is the only test in the study whose result may be described as a
> finding.** Everything else is exploratory.

Why H5 and not H1 (which is the one the trader would most like to act on): because
§4 shows H1 is unanswerable for years, and a confirmatory designation on an
underpowered test is worse than no designation — it converts noise into an
official result. **A confirmatory slot must go to a test that can actually be
passed or failed.** H5 is the only one that qualifies, it is the one the brief
names as feeding the Morning Plan, and it is measured on a panel that is not
conditioned on the trader's own selection.

### 5.2 The exploratory family

**H1, H2, H3, H4, H6** × {primary `Max R Before Stop`, S1 `P&L (R)`, S2 `MAE (R)`}
= **15 tests**, plus the censoring and polarity-source variants as sensitivity
checks that are reported but not counted.

- **Correction: Benjamini–Hochberg, FDR q = 0.10**, applied across all 15 at once,
  in one pass, at a scheduled window. Raw p and BH-adjusted p both reported.
- **Bonferroni is rejected here, deliberately.** At α = 0.05/15 = 0.0033 the
  detectable effect at N=200 split three ways rises to *d* ≈ 0.66 ≈ 0.99 R — the
  test becomes decorative. Bonferroni is the right instrument when each test is
  independently actionable; here **none of them is actionable**, because §5.3
  forbids acting on the exploratory family at all. The real control is the
  promotion rule, not the alpha.
- **Nothing in this family, at any q, is a finding.** BH survival earns exactly
  one thing: eligibility for the promotion rule below.

### 5.3 The promotion rule

A trade-level hypothesis may be promoted to confirmatory **only when all four
hold**, and the promotion is written into §10 **before** the data for that window
is examined:

1. Analyzable N for that hypothesis ≥ **188** (the *d* = 0.50 threshold), with
   every cell ≥ 25;
2. it survived BH at q = 0.10 in a **previous** window;
3. its direction matches the direction pre-registered in §3;
4. it survived the incremental-to-controls test in §8.1 in that previous window.

On promotion it gets **one** confirmatory test at α = 0.05, one-sided, on data
accrued **after** the promotion date. Not on the data that earned it the
promotion. There is no second chance and no re-promotion.

---

## 6. The stopping rule

- **Analysis windows are calendar-fixed: the first Monday of January, April, July
  and October.** First window: **2027-01-04.** (Not 2026-10-05 — at 18/month that
  window would hold ~17 analyzable trades, below every minimum cell size in §3,
  and looking at it would purchase nothing but temptation.)
- **Between windows, outcome-by-bucket data is not examined.** Not informally, not
  "just to see", not in a notebook that isn't saved.
- **What *is* allowed and encouraged between windows:** row counts, coverage and
  join rates, null rates, snapshot continuity, collector failures, the ETF share,
  the `Fresh` arm's count. **These are data quality, not outcome.** The line is
  bright: anything that requires reading the *outcome* columns is an analysis;
  anything that only reads counts and coverage is monitoring.
- **No stop-when-significant.** Peeking four times a year and stopping at the
  first nominal p < 0.05 raises the true type-I rate from 5% to roughly **12–14%**
  over four looks `[R, standard sequential-testing result]`. That alone would
  more than account for any effect this study is likely to see.
- **The study does not stop early on a positive.** A positive at window *k* is
  re-tested at window *k+1* on new data. A result that does not survive one
  quarter of fresh data was never a result.
- **Futility stop, pre-registered:** if at the **2027-07-05** window the
  confirmatory H5 estimate's 95% CI excludes a **10% increase in mean
  |gap|/ADR** for Surging vs Flat, the social arm is **abandoned** and written up
  as null. That threshold is the minimum interesting effect and is fixed now,
  before it is known whether it will be met.
- **The collector keeps running regardless of any stop.** History is the one thing
  in this study that cannot be bought later at any price, storage is a measured
  66 MB/year gzipped `[V]`, and a futility stop on the *analysis* is not a reason
  to destroy the *series*.

---

## 7. Falsification and pre-committed interpretation

Written now, so that the conclusion is not chosen after the number.

| # | Confirmed if | **Disconfirmed if** | **Pre-committed conclusion on disconfirmation** |
|---|---|---|---|
| **H1 Fuel** | High-velocity bucket exceeds Low on `Max R Before Stop`, ≥ 0.5 R, survives controls | CI on the High−Low shift contains 0, **or** the shift is < 0.5 R, **or** it dies after residualizing on RVOL/%ATR/%Gap | **Attention velocity is not a usable pre-trade filter for him.** No column, no Morning Plan sort, no scan rank. If it dies specifically at the controls step, the honest statement is *"it was RVOL with extra steps"* — and RVOL is already in the journal. |
| **H2 Crowded** | Extreme bucket **below** Normal, ≥ 0.5 R | CI contains 0, **or** Extreme is *above* Normal | **The attention-extreme-is-a-fade story is not supported.** Note explicitly: Extreme > Normal is not "H1 confirmed" — it is H2 falsified, and H1 has its own separate test. Do not let a failed H2 be re-narrated as a success. |
| **H3 Fresh** | Fresh > Not-fresh, ≥ 0.5 R, `Fresh` n ≥ 25 | CI contains 0 — **or, far more likely, the `Fresh` arm never reaches n = 25** | **Closed as unanswerable on this journal.** The trader's 11-symbol mega-cap-skewed universe does not generate fresh-discovery events at a testable rate. That is a fact about his trading, not about the hypothesis, and it should be said that way. |
| **H4 Wall of worry** | Negative-polarity longs > Positive-polarity longs, ≥ 0.5 R | CI contains 0, or sign reverses | **Polarity is not a filter.** Also record which source was used — a null on Polygon news polarity does not falsify social polarity, and vice versa. Two sources, two verdicts. |
| **H5 Overnight ⭐** | Surging > Flat on \|gap\|/ADR by ≥ 10% of the Flat mean, one-sided p < 0.05, survives controls | CI excludes a +10% effect, or the effect vanishes after residualizing on prior-day RVOL and %ATR | **The whole social arm returns null and the study is over.** No Morning Plan panel, no collector expansion, no signup checklist item. This is the futility stop and it is the *most likely single outcome of this study* `[I]`. |
| **H6 Regime** | Bullish-regime days exceed Bearish by ≥ 0.67 R/day, n ≥ 25 days/cell | CI contains 0 | **No regime gate.** Note that at 12 traded days/month the test is near-powerless regardless, so a null here is weak evidence of absence — say that rather than claiming the hypothesis was tested. |

### 7.1 The pre-commitment that matters most: what happens if the answer is "no"

**The study must be able to return "no", and here is exactly what "no" means, in
advance:**

- **No social column is added to the trade journal sheet.** The migration contract
  is additive-only and asserted by `scripts/review/migration-safety.ts`; a column
  added on the strength of a null is permanent clutter that everyone downstream
  must handle forever.
- **No social panel is added to the Morning Plan.** A pre-market attention rank
  that has been *measured* not to predict anything is worse than absent — it will
  be looked at, and it will influence decisions, precisely because it is on the
  screen.
- **The signup checklist (Track K) shrinks to the keyless sources only.** No key
  is obtained for a signal that has failed.
- **The collector keeps running.** ~66 MB/year gzipped `[V]`, and the series
  cannot be reconstructed later. Collection and belief are separate decisions.
- **The null is written up as a result in this directory**, with its own file and
  its power figures attached, so that in 2028 nobody re-runs this study from
  scratch without knowing it was already run and what it could and could not have
  detected.

**And the outcome most likely of all** `[I]`: not a clean "no", but
**"underpowered — the study could not distinguish a real effect from none."**
That is a *third* outcome and it must be reported as itself, never collapsed into
either "no effect" or "promising, needs more data". §4's tables exist so that this
outcome can be stated with a number attached: *"at N = 87 analyzable trades we
could only have detected a difference larger than 1.1 R, and we did not see one;
that rules out large effects and says nothing whatsoever about small ones."*

---

## 8. Confounders specific to this trader and this journal

### 8.1 ⚠️ Attention ≈ volume ≈ volatility — the gate that decides everything

The journal **already** computes RVOL, %ATR, %Gap, Avg $ Vol, Breakout Vol Ratio,
OR %ATR, ADR and 30mATR. Retail attention is strongly correlated with volume and
volatility by construction — people post about what is moving. **A "sentiment
effect" that is really a volume effect is measuring RVOL with extra steps, and
RVOL is already free and already on the sheet.**

Track C set the standard here and it should be inherited exactly: it tested
short-volume ratio against RVOL, measured **r = −0.005 on 4,100 ticker-days**, and
only then claimed additivity `[V]`. **Attention features have not been given that
test.** So:

> **PRE-REGISTERED GATE, run BEFORE any hypothesis test:** on the universe
> ticker-day panel, compute Pearson r between each attention feature
> (`mentions_z20`, `mentions_pct_universe`, `overnight_delta`, Wikipedia pageview
> z-score) and **RVOL**, and against **%ATR** and **log dollar volume**.
> **If |r| vs RVOL > 0.5 for a feature, that feature is dropped from the
> trade-level tests entirely** and may be used only as a residual
> (feature ⊥ RVOL). This gate is run once, reported in full including the
> features that pass, and its result is published whether or not it is
> convenient.

**Frozen control set** (fixed now; nothing may be added or removed later):
`RVOL`, `%ATR`, `%Gap`, `log(Avg $ Vol)`, `Float`.

Every hypothesis test is run **twice**: raw, and incremental-to-controls (§9.3).
**A result that does not survive the second form is reported as not incremental,
in those words.**

### 8.2 ⚠️ Selection circularity — the deepest problem in the study

He trades what he watches. He watches what is "in play". **"In play" *is* an
attention signal.** So his trade set is already conditioned on the predictor,
which produces three distinct problems:

1. **Range restriction** → attenuated effects. A correlation of 0.15 in the
   population can present as 0.05 inside a sample selected on the predictor `[I]`.
   Every trade-level null is therefore weaker evidence than it looks.
2. **The Low-attention bucket is not a random low-attention draw.** It is
   populated by index ETFs and pre-planned levels — *structurally different
   trades*, not the same trades with less attention. A High-vs-Low difference may
   be a difference in *kind*, not in attention.
3. **Reverse causation.** If he trades a name *because* it is trending on social,
   then attention causes the trade, and any relationship to outcome runs through
   his selection skill rather than through the market.

**Mitigations, pre-registered:**
- **Report the distribution of every predictor in his trade set against the
  universe distribution, at every window.** If his trades sit entirely above the
  90th universe percentile of attention, say so in the headline — that alone
  bounds what the trade-level tests can possibly show.
- **Stratify by `Origin`** (`Watchlist` / `Callout` / `Intraday discovery`) — a
  direct proxy for how the idea reached him, and the journal already captures it.
  `Intraday discovery` trades are the least pre-conditioned on his own watchlist
  and are the cleanest sub-sample. Report it as a pre-specified stratifier
  (subject to the n=25 floor), not as a subgroup invented later.
- **H5 is the structural answer**, and it is why H5 is the confirmatory arm: the
  universe panel is not conditioned on his selection at all.

### 8.3 ⚠️ Half his trades are index ETFs — MEASURED

QQQ 7 + SPY 6 + SOXL 5 = **18 of 36 (50%)** `[V]`. These have no meaningful
ticker-level retail attention signal — either absent from the mention lists or
pinned at a constant. **Pre-registered exclusion: all ETFs and index products are
excluded from H1–H4** (identified by a maintained instrument-type list, not by
pattern-matching the ticker). They remain in H6 (day-level) and in all descriptive
reporting.

This exclusion is what halves the accrual rate from 35 to 18/month and is the
single largest driver of the dates in §0. **It is also a real finding in its own
right:** a social-sentiment feature is, for this trader as he currently trades,
inapplicable to half his book before any statistics are run.

**And within the surviving half, NVDA is 6 of 18 (33%)** — permanently at the top
of every mention list, so `mentions_pct_universe` is a near-constant on it. The
usable cross-sectional variation is smaller than N suggests. Report the
**effective number of distinct symbols** alongside N at every window.

### 8.4 Clustering and pseudo-replication

11 symbols / 36 trades; up to 9 trades on a single day `[V]`. Trades on the same
day share the market regime; trades in the same symbol share everything.

- Measured symbol ICC **0.10** (deff 1.22); date ICC **not estimable** at k=12.
- **Pre-registered: all inference uses cluster-robust methods clustered on
  `Date`** (cluster bootstrap, 2,000 resamples, for CIs; cluster-robust SEs for
  regressions).
- **Report nominal N *and* effective N *and* distinct-symbol count** on every
  table and every figure. A cell of "n=30" that is really 4 symbols on 6 days must
  not read the same as 30 independent trades.

### 8.5 Regime

The whole sample will span one market regime. Track C's own honest note applies
verbatim: its +3.77% breakout-day mean vs +0.17% baseline was *"mostly a statement
about the momentum regime of mid-2026"* `[V]`.

**Pre-registered stability check:** split the analysis sample at its calendar
midpoint and report the effect in each half. **If the sign flips between halves,
the pooled result is not reported as a finding regardless of its pooled p.** Also
report VIX and SPY-direction distributions per bucket — both are already on the
sheet — so a "sentiment effect" that is a VIX effect is visible.

### 8.6 Small-cap and liquidity confounds

Published attention effects concentrate in small, illiquid, heavily-shorted names
`[R]`. His set is mega-cap-heavy (NVDA, CSCO, NOW, DELL, SMCI). So:

- The study is **not** a test of the literature's claim. It is a test of whether
  the effect survives in a mega-cap-skewed intraday book — a narrower and harder
  question. State that plainly rather than citing the literature as support.
- **`Float` and `Avg $ Vol` distributions are reported per bucket.**
- **A small-cap subgroup analysis is pre-emptively forbidden** unless it reaches
  n = 25, which on current symbol mix it will not for years. Forbidding it now is
  the point: it is the subgroup someone will otherwise invent at the exact moment
  the main result comes back null.

### 8.7 Look-ahead, replay and survivorship

- **Only features from snapshots the collector itself took, with
  `snapshot_ts_utc` strictly earlier than the trade's entry time**, are eligible
  for confirmatory or exploratory tests. Most public sentiment scores are computed
  after the fact and cannot be replayed; using them is look-ahead bias wearing a
  timestamp `[I]`.
- **Polygon news `insights` is the exception and it is a genuine one:** each
  article carries a real `published_utc`, so filtering to `published_utc < entry
  time` produces a legitimately replayable feature `[V]`. That filter is
  mandatory, not optional.
- **`sentiment_reasoning` is model-generated by Polygon and its stability across
  time is unverified** `[V, 00-measured-facts.md]`. A silent change to their
  scoring model would create a discontinuity in a long series. **Pre-registered:
  a fixed set of 20 archived articles is re-scored at every analysis window and
  any drift is logged before the analysis runs.**
- **Deleted-post survivorship:** ApeWisdom mentions are trailing-24h aggregates;
  deleted posts vanish from them. Deletion correlates with spam and pump activity,
  so the **highest-attention buckets are systematically under-counted for exactly
  the noisiest names** `[I]`. Unfixable — record it as a known bias with a known
  direction rather than pretending it away.
- **Cashtag collision** (`$ANY`, `$ALL`, `$IT`, `$ON`, `$SO`) inflates mentions
  for common-word tickers. **Pre-registered: a fixed collision blocklist is
  frozen before the first window and published in this directory.** Adding a
  ticker to it after seeing its result is an amendment (§10).

### 8.8 Journal-specific coverage gaps

- **`Catalyst` 100% blank (36/36)** `[V]` — no catalyst-conditioned hypothesis is
  analyzable until auto-population from news lands. Not a caveat; a blocker.
- **`Conviction` 61% blank** `[V]` — covariate only, never a stratifier, until
  coverage > 80%.
- **`Process Followed?` 100% labelled** `[V]` — good, and it is a pre-specified
  covariate. **It must never be used as an outcome or an exclusion filter in this
  study**: attention is an idea-source axis and process is an execution-discipline
  axis, and the journal's own design keeps `Origin` separate from
  `Process Followed?` for exactly this reason.
- **Short trades: 1 of 36** `[V]` — H4 is long-only; direction cannot be pooled.

---

## 9. The concrete analysis plan

### 9.1 The table to build — one row per trade

Materialized at each analysis window as a flat CSV, saved with the window date in
the filename, **never overwritten** — so any window's result can be reproduced
from the exact table that produced it.

**Keys and provenance**
`date` · `symbol` · `entry_time_et` · `side` · `snapshot_ts_utc` ·
`snapshot_slot` · `source` · `feature_lag_minutes` (entry time − snapshot time;
**must be > 0** or the row is dropped and counted)

**Outcomes**
`max_r_before_stop` *(PRIMARY)* · `uncensored_mfe_r` *(derived, §2.3)* ·
`pnl_r` *(S1)* · `mae_r` *(S2)* · `position_mfe_r` *(robustness)* ·
`capture_pct` *(descriptive only)*

**Frozen controls** (§8.1)
`rvol` · `pct_atr` · `pct_gap` · `log_avg_dollar_vol` · `float`

**Context (reported, not controlled)**
`adr` · `atr_30m` · `vix` · `spy_dir` · `or_pct_atr` · `breakout_vol_ratio`

**Trader covariates**
`setup` · `process_followed` · `conviction` · `origin` · `tags` · `r_risk` ·
`risk_source`

**Social / news features** — each as of the last snapshot strictly before entry
`mentions` · `mentions_z20` · `mentions_pct_universe` ·
`overnight_delta` · `author_diversity` · `novelty_flag` ·
`polarity_social` · `polarity_news` · `news_article_count` ·
`wiki_pageviews_z20`

**Eligibility flags** — every one reported as a count at every window
`is_etf` · `has_social` · `has_r` · `has_20d_baseline` · `analyzable`

A **parallel universe-panel table** (ticker-day) carries the same social features
plus `next_gap_over_adr`, `next_rvol`, `rvol`, `pct_atr`, `dollar_volume`. **This
is the table the confirmatory H5 test runs on.**

### 9.2 Tests, by hypothesis

| Hypothesis | Unit | Test | Reported with |
|---|---|---|---|
| **H5 ⭐ CONFIRMATORY** | ticker-day | Mann–Whitney U, **one-sided**, Surging vs Flat on \|gap\|/ADR | Hodges–Lehmann shift + 95% CI; Spearman ρ over the full delta range; the §8.1 RVOL gate result |
| H1, H2, H4 | trade | Mann–Whitney U, two-sided, on the §3 contrast | HL shift + **cluster-bootstrap** 95% CI (2,000 resamples, clustered on `Date`); Jonckheere–Terpstra for monotone trend across the three ordered buckets; nominal N, effective N, distinct symbols |
| H3 | trade | Mann–Whitney U, Fresh vs Not | as above — **only if the Fresh arm reaches n = 25** |
| H6 | trading day | Kruskal–Wallis across three regime buckets | as above, on daily sum `P&L (R)` |
| **All of the above, second form** | — | **Median (quantile) regression** of outcome on the social feature + the frozen control set, cluster-robust SEs on `Date` | the social coefficient and its CI, **before and after** controls |

**Why Mann–Whitney and not the t-test:** measured skew +0.82 on realized R, a hard
floor at −1.00, heavier skew expected on MFE, and cells of 25–70. ARE 0.955 under
normality means the insurance costs ~5% power in the world where the t-test would
have been right `[R]`. The t-test is reported as a sensitivity check and if the
two disagree, **the rank test wins and the disagreement is reported.**

**Why quantile regression at the median rather than OLS:** the outcome is
right-skewed with a heavy tail; an OLS mean is dominated by two or three runners
in a cell of 30. The median is the honest central tendency for this shape `[I]`.

### 9.3 The incremental test, stated precisely

For each hypothesis, fit at the median:

```
outcome ~ social_feature + rvol + pct_atr + pct_gap + log_avg_dollar_vol + float
```

cluster-robust on `Date`. **The reported quantity is the coefficient on
`social_feature` and its 95% CI, side by side with the same coefficient from the
univariate fit.** If the CI crosses zero in the controlled fit, the result is
labelled **"not incremental to RVOL/volatility"** in the table, in the figure and
in the summary sentence. No exceptions, no "directionally consistent" language.

### 9.4 The figures — exactly three

**F1 — Bucket dot-plot (one panel per hypothesis, one row per outcome).**
Median outcome per bucket, cluster-bootstrap 95% CI, **cell n printed on every
point**, horizontal band for the all-trades baseline. **Cells below their minimum
N are drawn as a grey "n too small" tick with the count — never as a point
estimate with a CI.** This is the anti-n=14 device, and it is the most important
design decision in the figure set: it makes an underpowered cell *look*
underpowered instead of looking like a data point.

**F2 — The incremental panel.** One row per hypothesis-outcome pair, two dots per
row: the social coefficient univariate, and after the frozen controls, each with
its CI, on a common axis with zero marked. **A reader should be able to see "it
was RVOL all along" in one glance.**

**F3 — The accrual / power tracker.** Analyzable N over time, with horizontal
lines at the pre-registered thresholds **188 (d=0.50)**, **294 (d=0.40)** and
**523 (d=0.30)**, and a projected accrual line at 18/month. **This figure answers
"when will I know?" by being looked at**, quarter after quarter, instead of by
hope. It should be the first figure in every window's write-up, before any result.

### 9.5 What each window produces

A single dated file in this directory containing, in this order:

1. Counts: total trades, analyzable N, exclusions **by reason**, distinct symbols,
   effective N, ETF share, coverage rates.
2. **F3** — where accrual stands against the thresholds.
3. The §8.1 RVOL gate result.
4. The confirmatory H5 test.
5. The exploratory family with raw and BH-adjusted p, all cells labelled by power
   band.
6. **F1** and **F2**.
7. Promotion decisions (§5.3), if any, with the date they were made.
8. Amendments, if any, appended to §10 of this document.

---

## 10. Amendment log

*Empty at pre-registration. Every subsequent entry: date · what changed · why ·
whether it was made before or after that window's data was examined. An amendment
made after the data was seen is not forbidden, but it must be marked, and any
result depending on it is exploratory regardless of its p-value.*

| Date | Change | Reason | Before/after data seen |
|---|---|---|---|
| 2026-09-08 | Initial pre-registration | — | Before (no social data exists) |

---

## 11. Answers to the two questions Track D2 was asked to settle

From `13-open-questions.md` § "Questions for the trader":

**"Should the sentiment hypotheses be evaluated against the 2.5R capture target,
or against realised R?"**
**Neither, as the primary.** The primary is `Max R Before Stop` (MFE), because
H1–H5 are claims about *opportunity* and both alternatives fold in his own exit
management. Realized `P&L (R)` is retained as secondary S1 precisely so the two
can be distinguished. The 2.5R capture target is an **execution** metric and is
excluded as an outcome entirely (§2.2) — crowd attention has no reason to predict
how well he manages an exit, and testing it is a free extra draw from the null.

**"How many trades per month, currently?"**
**Measured: 36 trades over 12 traded dates, 2026-05-06 → 2026-05-29** `[V]` — ~35
trades/month, ~3 per traded day, ~12 traded days per month. **But the number that
governs this study is 18/month**, because 50% of those trades are index/sector
ETFs with no usable ticker-level attention signal (§8.3). Every date in §0 and
§4.4 uses 18.

---

## 12. One paragraph, for the morning

This study can answer one question well and five questions badly. The one it can
answer — does an overnight jump in crowd attention predict a bigger next-day gap,
across the whole universe — is measurable on hundreds of thousands of ticker-days
and will have a real answer by roughly December 2026. The five it cannot answer
are the ones about his own trades, and the reason is arithmetic rather than
pessimism: half his trades are ETFs with no social signal, the other half accrue
at eighteen a month, and detecting anything smaller than a three-quarter-R
difference in maximum favorable excursion needs 188 of them and would land in July
2027 at the earliest, with the effect sizes the literature actually reports
needing a sample that arrives in the 2030s. **The most likely outcome of this
study is a null on H5 and "underpowered" on everything else, and the most valuable
thing in this document is that that sentence was written on 2026-09-08, before
anyone had a result to defend.**
