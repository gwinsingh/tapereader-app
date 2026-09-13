# 04 — Signal Design for Breakouts

**Track D.** The metric family, the falsifiable form of H1–H6, the cadence argument,
the traps as build requirements, and the three metrics that actually get built.

**As-of: 2026-09-09.** Written against measured source behaviour (Tracks A, B, C, H)
and the collector that has been running since 2026-09-08 21:00 ET. Every metric below
is specified to the level an engineer implements from: formula, window, normalization,
edge cases, N/A rule, and the named sources that can and cannot compute it.

**Evidence key:** `[V]` verified/measured on the source's own material · `[R]` reported
by third parties · `[I]` our inference.

---

> **Status note (orchestrating session).** This track was written while
> `13-open-questions.md` §6 (StockTwits) was still open. **It has since resolved
> AGAINST us** — §6 now reads RESOLVED AGAINST US, §7 is WITHDRAWN. Every
> reference below marked "unresolved" should be read as **ruled out**, and the
> conditional branches that say "if StockTwits is ruled out" are the live ones.
>
> This costs less than it might: the design **already does not depend on
> StockTwits** (see the "will the data exist?" table), and the minimal viable
> signal set is ApeWisdom-only. What is genuinely lost is `polarity_social`,
> `author_diversity` from a second source, and any true Δ/hour arrival rate —
> leaving Arctic Shift as the sole route to event-level data. Do not wait for §6.


> ## ⬛ The minimal viable signal set
>
> If only three metrics are built, these three, in this order:
>
> | # | Metric | Source | Why it earns the slot |
> |---|---|---|---|
> | **1** | **`overnight_delta`** — `ln((mentions_0915 + 1) / (mentions_prev1605 + 1))` | ApeWisdom `all-stocks` (already collecting) | It is the **sole input to the study's only confirmatory test** (`05-preregistration.md` §5.1). Nothing else in the study can be called a finding. Available from the snapshots already on disk. |
> | **2** | **`mentions_z20`** — 09:15 ET mentions z-scored against that ticker's own prior 20 sessions at the same slot, σ floored at 1.0 | ApeWisdom `all-stocks` | The H1/H2 workhorse and the only metric here a Morning Plan panel would actually display. **First computable 2026-10-06** (needs 20 sessions). |
> | **3** | **`apdv_resid`** — attention per dollar volume, as a per-day cross-sectional median-regression residual of `ln(1+mentions)` on `ln(prior-session $ volume)` | ApeWisdom × Polygon grouped-daily | The **only** metric in the family constructed to survive the pre-registration's §8.1 RVOL gate. Everything else is at genuine risk of being "RVOL with extra steps". |
>
> **Two are free right now. The third, and the confirmatory test's own outcome
> variable, both block on the same missing thing: a daily-bar store.** `market_db`
> does not exist (`web/wrangler.toml` still carries `TODO_RUN_WRANGLER_D1_CREATE`).
> `|next-session gap| ÷ ADR` cannot be computed without it. **To keep the
> pre-registration's ~Dec 2026 date for H5, daily-bar collection must start by
> ~2026-09-15.** That is the most actionable item in this document.
>
> **Two zero-cost freebies are already in the stored payload and need no history:**
> `new_entrant` (= 1 iff `mentions_24h_ago` is NULL — 252 of 787 rows on
> 2026-09-08 `[V]`) and `v1_vendor` (= `ln((mentions+1)/(mentions_24h_ago+1))`).
> Compute both from day one; they cost nothing and they are the only novelty and
> velocity signals available before October.
>
> **And the honest omission: `author_diversity` — the bot detector the brief asks
> for — is not computable from any source currently collecting.** No aggregator
> exposes author identity. See §7.

---

## 0. What binds this document, and what it may not do

`docs/social-sentiment/05-preregistration.md` is the statistical contract and it was
written first, deliberately. **This document is subordinate to it.** Specifically:

- The **primary outcome is `Max R Before Stop`** (§2.2). Nothing here substitutes it.
- The **bucket boundaries in §3 are absolute constants** and are not re-derived here.
  Where a boundary interacts badly with measured data, this document says so and
  **predicts the consequence numerically** — it does not move the boundary.
- The **§8.1 RVOL gate runs before any hypothesis test.** Every metric below is
  designed with that gate in mind, and §7 flags which ones are likely to fail it.
- **H5 is the only confirmatory arm** (§5.1). H1–H4 and H6 are exploratory by
  construction. This document does not promote anything.
- Where this document identifies something the pre-registration could not have known
  — three cases, all in §4 — it says **"this requires a dated §10 amendment, made
  before the data is examined"** and stops there. Track D has no authority to amend
  §05, and an undated amendment voids the result.

**Three findings in this document are amendment-shaped and are flagged as such:**
`⚑A1` the H5 predictor differences two *overlapping* rolling windows (§2.4, §4.5);
`⚑A2` the H5 `Surging` cut is trivially crossed by low-count names (§4.5);
`⚑A3` the H6 predictor is **not computable from any currently-collecting source** (§4.6).

---

## 1. The data substrate — what is actually on disk, and what its numbers mean

### 1.1 What the collector persists right now

`scripts/social-ingest.mjs`, first capture 2026-09-08 21:00 ET, slot `evening`,
2,078 rows across 6 filters, 494 KB raw / 46 KB gzipped, idempotency verified `[V]`.

**ApeWisdom record** — one per (scope, slot, date, ticker):

```
source scope slot date captured_at ticker name rank mentions upvotes
rank_24h_ago mentions_24h_ago
```

Scopes collected: `all-stocks` (797), `wallstreetbets` (594), `stocks` (267),
`Daytrading` (168), `options` (102), `pennystocks` (150) `[V]`.

**Tradestie record** — `ticker rank no_of_comments`, daily, top 50 WSB only.
`sentiment` / `sentiment_score` are **deliberately not persisted**: measured static
per-ticker constants across 480 tickers / 37 dates / 5.4 years, zero within-ticker
variation (TSLA = 0.381 on all 30 dates it appears) `[V]`. Storing them would
introduce silent look-ahead into every downstream study.

### 1.2 The distribution that governs every normalization decision

Full `all-stocks` pull, 2026-09-08 `[V]`:

| Slice | Count | Share |
|---|---|---|
| Rows returned | 787 | 100% |
| `mentions` ≥ 10 | 48 | 6.1% |
| `mentions` ≥ 5 | 94 | 11.9% |
| `mentions` ≥ 2 | 183 | 23.3% |
| **`mentions` == 1** | **604** | **76.7%** |
| `mentions_24h_ago` NULL (new entrants) | 252 | 32.0% |

**Read this before designing anything.** Three quarters of the daily list is a single
mention — statistically indistinguishable from noise. The *informative* universe is
~180 names/day, and the *strongly* informative one is ~50. Against the liquid
universe of ~4,174 names (`docs/market-scans/phase-1-spec.md`), **ApeWisdom covers
~19% of names at all and ~4% meaningfully.** A metric whose denominator is the liquid
universe is therefore ~81% zeros by construction, which is why §9 cuts one of the
brief's requested metrics outright.

**Do not pre-filter `mentions >= 2` at ingest.** The 604 single-mention rows are the
fresh-discovery population H3 is entirely about. Filter at analysis, reversibly.

### 1.3 The window semantics that every velocity metric must respect

**`mentions` is a rolling trailing-24h count, not a daily total** `[V]`. Measured:
27 of the top 100 changed within a single 5-minute interval; values move **down** as
well as up (`AGI: 139 → 138 → 137`); control (Tradestie) moved 0 times over the same
window, so this is ApeWisdom's behaviour and not a sampling artefact `[V]`.

Formally: a snapshot at time `T` reports `m(T)` = distinct posts/comments referencing
the ticker in `(T−24h, T]`. ApeWisdom's published methodology dedups a ticker to **one
mention per post/comment**, so `m` ≈ *number of distinct posts referencing the ticker*,
not raw token frequency `[V]`.

Four consequences, and the third is the one everybody gets wrong:

1. **A 09:15 ET snapshot is a genuine pre-market attention state.** Its window is
   `(prev 09:15, today 09:15]` — the whole overnight and pre-market conversation,
   ending 15 minutes before the open. This is a feature of the semantics, not a
   workaround.
2. **Two snapshots less than 24h apart overlap.** 09:15 vs 12:30 overlap 86.5%;
   09:15 vs 16:05 overlap 71.5%; 09:15 vs 20:00 overlap 55.2%. A difference of two
   overlapping windows is **not** "mentions in the intervening hours."
3. **But the naive difference is not meaningless — it is mis-*named*.** For `T1 < T2`
   within 24h:

   ```
   m(T2) − m(T1)  =  posts in (T1, T2]  −  posts in (T1−24h, T2−24h]
   ```

   That is exactly **"how many more posts arrived in this clock window today than in
   the same clock window yesterday"** — a disjoint, equal-length, seasonally-matched
   comparison. It is a legitimate and rather good flow measure. What it is *not* is a
   post count or an arrival rate. **Design rule: compute it, and never name it
   `mentions_last_4h` or divide it by elapsed hours and call it Δ/hour.**
4. **A true arrival rate (posts per hour) is not computable from ApeWisdom at any
   cadence.** No number of snapshots recovers it, because every snapshot is the same
   24h integral shifted. Sources that *can* produce a true rate: **Arctic Shift**
   (Reddit comments carry `created_utc`) and **StockTwits** (messages carry
   `created_at`) — both event-level. Sources that cannot: ApeWisdom, Tradestie,
   Wikipedia (daily buckets), Bluesky (too thin to matter).

### 1.4 `mentions_24h_ago` — the free, correct velocity primitive

The API returns a single lag pair, `mentions_24h_ago` / `rank_24h_ago` `[V]`. Because
both are the same rolling metric measured 24h apart, their windows are **adjacent and
disjoint** — `(T−48h, T−24h]` vs `(T−24h, T]`. So `mentions / mentions_24h_ago` is a
clean day-over-day ratio available **from the very first snapshot, with no baseline
history whatsoever**. This is the single most useful undocumented fact about the
source.

Caveats, both `[I]`: the vendor's lag alignment is undocumented and its recompute runs
twice an hour, so its "24h ago" may be up to ~30 min off our `captured_at`; and it is
NULL for 32% of rows. **Rule: NULL is a new entrant, never 0.** Set
`v1_vendor = NULL, new_entrant = 1`. Once two same-slot sessions exist (from
2026-09-09), prefer our own `v1` and report `v1_vendor` as a cross-check.

---

## 2. The metric family

Naming follows `05-preregistration.md` §9.1 exactly where a column already exists
there. New metrics are marked **[new]** and are reported-only until amended in.

Every metric below carries this contract:

- **Provenance.** Computed only from a snapshot whose recorded `captured_at` is
  strictly earlier than the decision time. `feature_lag_minutes = decision_time −
  captured_at` must be **> 0**; rows failing it are dropped and counted (prereg §9.1).
- **Missingness.** A failed or absent snapshot yields **NULL**, never 0. A ticker
  absent from a *successful* snapshot yields **0** only if that ticker has appeared in
  at least one ApeWisdom snapshot in the trailing 90 days (i.e. it is in the vendor's
  tracked universe); otherwise **NULL**. This distinction is the difference between
  "nobody is talking about it" and "we cannot see it", and conflating them would
  actively mislead.
- **N/A convention.** Follows the journal's own rule: the literal string `N/A` means
  *structurally not computable* (too little history, no Wikipedia article, ticker
  outside the tracked universe); **blank means not computed yet** and is a data-quality
  defect that blocks the analysis window. Never impute.

---

### M1 · `mentions` — the raw level

```
mentions(s, d, slot, scope) = ApeWisdom `mentions` for ticker s
                              in the snapshot for (date d, slot, scope)
```

- **Window:** trailing 24h ending at `captured_at`.
- **Scope default:** `all-stocks`. The five subreddit scopes are kept for M7.
- **Normalization:** none. **This metric is not usable as a predictor on its own** and
  is retained only as the input to M2–M4/M9 and as a reported denominator.
- **Edge cases:** absent ticker → 0 or NULL per the missingness rule above; string vs
  number type drift in the vendor payload (docs show `"2"`, live returns `2`) — coerce
  `[V]`; company `name` is HTML-entity-encoded (`S&amp;P`) — decode at render, store raw `[V]`.
- **Sources:** ApeWisdom `[V]` · Tradestie (`no_of_comments`, top-50 WSB only) `[V]` ·
  Arctic Shift (`/api/comments/search/aggregate?aggregate=created_utc&frequency=day`,
  returns exact daily per-ticker counts, ~6s per query) `[V]` · StockTwits (message
  count per symbol stream) `[M, unresolved]` · Wikipedia (pageviews, a different kind
  of attention) `[V]` · Bluesky (per-ticker volume is 0–15/day for breakout names —
  unusable) `[V]`.

---

### M2 · `mentions_z20` — z-score vs the ticker's own baseline **(H1 predictor)**

```
μ20(s, slot) = mean of mentions(s, j, slot) over the prior 20 TRADING SESSIONS
σ20(s, slot) = sample sd of the same
mentions_z20 = (mentions(s, d, slot) − μ20) / max(σ20, 1.0)
```

- **Slot alignment is mandatory.** A 09:15 observation is compared only to prior 09:15
  observations. Mixing slots compares windows with different day/night composition.
- **Sessions, not calendar days.** Index by the NYSE trading calendar. Weekend and
  holiday snapshots are still *captured* (§5) but are not baseline members; see the
  Monday note in §5.6.
- **Completeness gate (inherited, prereg §3.1):** requires **≥ 15 of the prior 20**
  sessions present. Below that → `N/A`, and the trade is **excluded, not imputed**.
- **σ floor = 1.0 mention.** Fixed here, before any data. This is not a tuning
  parameter, it is a division-by-zero guard with a stated value: 604 of 787 tickers sit
  at exactly 1 mention `[V]`, so σ20 = 0 is the *common* case, not the exceptional one.
  Without a floor, a ticker going 1,1,1,…,1 → 4 produces z = +∞. With floor 1.0 it
  produces z = +3.0, which is correctly sized for a count variable whose Poisson sd at
  λ=1 is 1.0. **Do not change this after seeing data.**
- **Display cap:** clamp to ±10 **for rendering only**. Never clamp the analysis value.
- **Availability:** collection began 2026-09-08 → **first computable ~2026-10-06**
  (20 sessions). `z60` (≥45 of 60) → **~2026-12-02**. This costs H1 roughly one month
  of the pre-registration's 18-analyzable-trades/month accrual and should be recorded
  in the accrual tracker (prereg F3).
- **Sensitivity variant (reported, not tested):** `z20_log`, the same z computed on
  `ln(1 + mentions)`. Counts are right-skewed; the log form is better behaved. It is
  **not** substituted for the pre-registered `mentions_z20`, whose 0.0/1.5 cut points
  are calibrated to the plain z.
- **Predicted behaviour on this trader's book `[I]`:** of his non-ETF symbols, only
  NVDA is reliably high-count. CSCO, DELL, NOW, QUBT will sit at 0–3 mentions most
  days, so their z reduces to roughly `(m − 1)/1` — a three-valued variable. **H1's
  usable cross-sectional variation is materially smaller than its N.** This
  strengthens, rather than contradicts, prereg §8.3.
- **Sources:** ApeWisdom `[V]` · Arctic Shift `[V]` · Wikipedia (as `wiki_pageviews_z20`) `[V]` ·
  StockTwits `[M, unresolved]`. Tradestie cannot (top-50 only → the baseline is
  censored by list entry/exit, which is itself the signal).

---

### M3 · `mentions_pct_universe` — cross-sectional rank **(H2 predictor)**

Pre-registration §3.2 defines this **within that day's full ApeWisdom `all-stocks`
list**, not within the liquid universe. That definition is binding.

```
mentions_pct_universe(s, d, slot)
  = 100 × |{ t in list(d, slot) : mentions(t) < mentions(s) }| / |list(d, slot)|
```

- **Tie rule (fixed here): strict "less-than", so an entire tie block shares the lowest
  percentile of the block.** With 604 of 787 at `mentions == 1`, this is not a detail —
  it decides what the bucket boundaries mean.
- **What the pre-registered boundaries actually mean, in mentions `[V, from the
  2026-09-08 distribution]`:**

  | Bucket | Definition | Actual requirement on 2026-09-08 |
  |---|---|---|
  | `Normal` | pct < 90 | fewer than ~7 mentions |
  | `Crowded` | 90 ≤ pct < 99 | roughly **7–60 mentions**, i.e. the top ~79 of 787 |
  | `Extreme` | pct ≥ 99 | **the top ~8 tickers on all of Reddit that day** |

  Everything at `mentions == 1` — 77% of the list — maps to **pct = 0.0**.
  "90th percentile" sounds mild and in fact means "top eighty names on Reddit".
- **Confound this exposes `[I]`:** NVDA sits pinned near the top of every list, and NVDA
  is **6 of 18 non-ETF trades (33%)** in the measured export `[V]`. The `Extreme` cell
  will therefore be substantially one symbol, making the H2 contrast "NVDA vs
  everything else" — a symbol effect, not an attention effect. Prereg §8.4 already
  requires distinct-symbol counts on every cell; **recommend a §10 amendment, dated
  before the first window, pre-committing that if any H2 cell is >50% a single symbol,
  H2 is reported as unanalyzable rather than tested.**
- **Sources:** ApeWisdom `[V]` only, as defined. Arctic Shift could produce an
  equivalent rank over its own daily aggregate but would be a different universe and
  a different metric — do not silently substitute.

---

### M4 · Velocity and acceleration — three distinct quantities, named correctly

Under trailing-24h semantics there is no single "velocity". There are three, and
conflating them is how a spurious result gets built.

**M4a · `v1` — day-over-day velocity (the workhorse).**
```
v1(s, d, slot) = ln( (mentions(s, d,   slot) + 1)
                   / (mentions(s, d−1, slot) + 1) )
```
Two adjacent, **disjoint** 24h windows. `d−1` is the prior *session* at the same slot.
Laplace `+1` handles zeros and bounds the ratio. Requires the prior session's snapshot;
missing → NULL. **Available from 2026-09-09.**

**M4b · `v1_vendor` — the same thing, vendor-supplied, with no history requirement.**
```
v1_vendor(s, d, slot) = ln( (mentions + 1) / (mentions_24h_ago + 1) )   if mentions_24h_ago non-NULL
                      = NULL, and new_entrant = 1                       if NULL
```
**Available from the first snapshot.** Report both; they should track closely, and a
persistent divergence is a vendor-alignment warning, not a signal.

**M4c · `flow_delta` — excess posts in a clock window vs. the same window yesterday. [new]**
```
flow_delta(s, d, T1→T2) = mentions(s, d, T2) − mentions(s, d, T1)
```
Interpreted **only** as "posts in `(T1,T2]` today minus posts in `(T1,T2]` yesterday".
Defined for the three intraday pairs 09:15→12:30, 12:30→16:05, 16:05→20:00. It is a
difference of two counts: noisy at low `m`, legitimately negative, and **must not be
divided by elapsed hours and reported as Δ/hour**. Require `max(m(T1), m(T2)) ≥ 5` else
NULL.

**M4d · `a1` — acceleration.**
```
a1(s, d, slot) = v1(s, d, slot) − v1(s, d−1, slot)
```
Second difference of noisy counts. Requires three consecutive same-slot sessions and
`max` of the three mention values ≥ 5, else NULL. **Available 2026-09-10.**
**Status: reported, never tested.** Acceleration is not in the pre-registration's
frozen predictor set, and adding a hypothesis on it would be a new test in an already
50-node garden of forking paths (prereg §5). It is computed and stored so that a future
study has the series; it does not enter H1–H6.

**Sources for a true Δ/hour arrival rate:** **Arctic Shift** and **StockTwits** only,
both event-level. **ApeWisdom, Tradestie, Wikipedia and Bluesky cannot produce one at
any cadence.**

---

### M5 · `polarity_social` / `polarity_news` — bull:bear **(H4 predictor)**

Pre-registration §3.4 fixes the preference order and forbids pooling the two sources.
Inherited verbatim.

**M5a · `polarity_social` — StockTwits declared tags. ⚠️ CONTRACTUALLY UNRESOLVED.**
```
polarity_social(s, d) = (bull − bear) / (bull + bear)
  over messages with created_at inside (prev 16:00 ET, decision time],
  requiring bull + bear ≥ 10, else N/A
```
- **Why it is the only clean labelled source found anywhere in this study:** the tag is
  `entities.sentiment.basic`, **declared by the human who wrote the post, at the moment
  they wrote it** `[M]`. There is no model, no post-hoc scoring, and therefore no
  look-ahead surface at all. Measured coverage **45.4%** (109 of 240 messages across 8
  tickers) and **47.9%** on a 900-message walk back a month, so **it persists
  retrospectively** `[M]`.
- **Measured level-skew that makes raw polarity nearly information-free:** `$AUPH` ran
  **426 Bullish : 5 Bearish = 98.8% bullish**; the large-cap pooled sample ran 78:31 =
  71% `[M]`. People who post about a single name are holders of it. **Polarity is a
  per-ticker constant plus noise, and only its deviation from its own baseline is
  informative.**
- **The conflict, stated rather than resolved:** prereg §3.4 applies **absolute** cut
  points (`Negative ≤ −0.20` / `Positive ≥ +0.20`) to this raw level. Given 98.8%
  bullish on a real small-cap, **the `Negative` cell will very likely never reach the
  n = 25 floor**, and H4's social arm will fail on cell size rather than on effect —
  the same failure mode prereg already predicts for H3's `Fresh` arm. **This document
  does not move the boundary.** It records the prediction, and recommends
  `polarity_z20` (M5c) be carried as a reported descriptive so that, if H4 dies on cell
  size, a future amendment has a measured basis rather than a post-hoc one.
- **Status: DO NOT BUILD YET.** `13-open-questions.md` §6 is unresolved — Track A3
  measured the documented v2 endpoints serving public data keylessly at 0.14s and
  8.9 req/s with no throttling `[M]`; Track H read the ToS as expressly banning
  scraping with developer registration closed. **The design must not depend on this
  source, and §7 shows exactly what survives without it.**

**M5b · `polarity_news` — Polygon `/v2/reference/news` `insights`.**
```
polarity_news(s, d) = (n_pos − n_neg) / (n_pos + n_neg + n_neu)
  over articles where s ∈ insights[].ticker
  AND published_utc < decision time
  AND published_utc ≥ (prev session 16:00 ET)
  requiring n_total ≥ 3, else N/A
```
- **Rules fixed here so they are not chosen later:** dedup by `(article_id, ticker)`;
  **no publisher weighting**; **no time decay**; a hard same-session window rather than
  a decayed one. Aggregation from per-article to per-ticker-day was flagged in
  `00-measured-facts.md` as a Track D decision — this is the decision.
- **The `published_utc < decision time` filter is mandatory, not optional.** It is
  what makes this the one vendor-scored feature in the study that is genuinely
  replayable `[V]`.
- **Backfillable.** `insights` coverage is **100% from mid-2024 forward** `[V]`, which
  covers the entire existing journal — so the pre-registration's discovery/replication
  split (§4.6) is live *today* on the news arm. One market-wide call returns a full
  weekday (370 articles, `next_url` absent) `[V]`; a ~50-symbol two-year backfill is
  minutes of wall clock at 5 req/min `[I]`.
- **Licence:** individual/`personal` plan — **journal enrichment only, never the public
  site** (`13-open-questions.md` §1) `[V]`.
- **Distribution risk `[I]`:** vendor news-sentiment scores skew positive (EODHD's
  measured AAPL series was only **2.7% negative** over 2,199 rows `[V]`). If Polygon
  skews similarly, H4's `Negative` arm starves on this source too. **Requirement: at
  the first window, report the raw `polarity_news` distribution across the liquid
  universe *before* running H4.**

**M5c · `polarity_z20` [new] — polarity vs the ticker's own baseline. Reported only.**
Same z construction as M2, applied to `polarity_social` or `polarity_news`, σ floor
0.10. This is the form the measured AUPH skew says is actually informative. It is
**not** a pre-registered predictor and does not enter any test.

**M5d · Sources that cannot produce polarity, stated plainly:**
- **ApeWisdom has no sentiment field at all.** `upvotes` is not polarity (§6, R5).
- **Tradestie's `sentiment` / `sentiment_score` are excluded by name** — measured static
  per-ticker constants, zero within-ticker variation over 5.4 years `[V]`. Regressing
  on them is regressing on a ticker fixed effect wearing a sentiment costume.
- **Bluesky** has volume too thin for per-ticker polarity outside the top ~30 names `[V]`.
- **Arctic Shift** carries raw text but no label; deriving polarity requires an NLP
  model — introducing model error, drift and an unfalsifiable black box exactly where
  the brief warns against one. **Out of scope for this design.**

---

### M6 · `unanimity` / dispersion

```
unanimity_social(s, d) = max(bull, bear) / (bull + bear)          ∈ [0.5, 1]
dispersion_news(s, d)  = 1 − max(n_pos, n_neg, n_neu) / n_total   ∈ [0, 2/3]
```
Same source constraints, same minimum counts, as M5. **If StockTwits is ruled out,
social unanimity does not exist and only the news form survives.**

---

### M7 · `scope_breadth` / `scope_concentration` [new] — dispersion without polarity

The one dispersion metric that needs no sentiment label at all, and it is free because
the collector already pulls six scopes.

```
Let K = { wallstreetbets, stocks, Daytrading, options, pennystocks }     (all-stocks EXCLUDED — it is a superset)
scope_breadth(s, d, slot)       = |{ k ∈ K : s is listed in scope k }|          ∈ 0..5
scope_concentration(s, d, slot) = max_k mentions_k / Σ_k mentions_k             ∈ (0, 1]
                                  NULL if Σ_k mentions_k < 5
```

- **What it separates:** a name mentioned across `wallstreetbets` + `stocks` +
  `Daytrading` + `options` is a broad-community story. A name whose entire volume sits
  in `pennystocks` is a room, or a bot. Measured scope sizes on 2026-09-08:
  wallstreetbets 594, stocks 267, Daytrading 168, pennystocks 150, options 102 `[V]`.
- **Why it earns its place:** it is the **only bot/echo proxy computable from
  ApeWisdom** (§6, R1), because ApeWisdom exposes no author identity.
- **Status: reported.** Not a pre-registered predictor.

---

### M8 · `author_diversity` — the bot detector, and the honest gap

```
author_diversity(s, d, window) = |distinct authors| / |posts|
```
Excluding `[deleted]` and `AutoModerator` from **both** numerator and denominator, and
reporting the excluded count. Computed only when `posts ≥ 20`; below that AD is
mechanically near 1.0 and means nothing. Report `top1_share` and `top5_share`
alongside — AD alone missed the measured StockTwits case where AD = 0.164 yet the top
5 authors carried **37.2%** of volume `[M]`.

**Measured reference values, so a threshold is not invented later:**

| Population | AD | Reading |
|---|---|---|
| Bluesky genuine chatter | **0.70 – 0.85** `[V]` | healthy |
| Bluesky `$QQQ` single-source flood | **0.46** `[V]` | one loud account |
| StockTwits `$AUPH`, 900 messages | **0.164** `[M]` | enthusiast concentration, not bots (median account age 8.8y, 3.1% accounts <90d) |
| Bluesky `informaq-*` translation farm | **0.19** `[V]` | one farm posting in five languages |

Note that 0.164 and 0.19 are near-identical numbers meaning opposite things.
**AD alone does not distinguish an echo chamber from a bot farm** — pair it with
account age and post-source distribution, both of which StockTwits exposes `[M]`.

> ### ⚠️ **NO AGGREGATOR EXPOSES AUTHOR IDENTITY.**
> ApeWisdom: no author field `[V]`. Tradestie: no author field `[V]`. Neither can
> compute this metric, at any cadence, ever.
>
> **Computable from:** Arctic Shift (`author` on every comment row) `[M]` · StockTwits
> (`user` object per message) `[M, unresolved]` · Bluesky (author DID) `[V]`.
>
> **If StockTwits is ruled out, `author_diversity` is computable only from Arctic
> Shift — and only for tickers that can be resolved out of Reddit prose, where
> **0.6% of comments use a cashtag** and **39 of 51 common English words are real
> tickers** `[M]`. That is the sharpest capability gap in this entire design, and it
> is why §6/R1 specifies a structural echo guard that works without authors.**

---

### M9 · `novelty_flag` and `sessions_since_cross` **(H3 predictor)**

**M9a · `novelty_flag` — pre-registered, binary.**
```
novelty_flag(s, d) = 1  iff  mentions(s, d, 0915) ≥ 5
                     AND     mentions(s, j, 0915) < 5 for every one of the prior 10 sessions
                   = 0  otherwise
                   = N/A if fewer than 10 prior sessions are present
```
Thresholds 5 and 10 are fixed by prereg §3.3 and **may not be tuned**.
**First computable ~2026-09-22.**

**M9b · `sessions_since_cross` [new] — the continuous form the brief asks for.**
```
sessions_since_cross(s, d, θ=5) = d_index − max{ j < d_index : mentions(s, j, 0915) ≥ θ }
                                = NULL with novelty_censored = 1, if no cross in available history
```
**Left-censored for roughly the first year.** The series starts 2026-09-08, so at the
first analysis window (2027-01-04) the maximum observable value is ~81 sessions and
every larger true value reads as 81. **Requirement: report it as a lower bound with
the censoring flag, never as a value.** Reported, not tested.

**M9c · `new_entrant` — free, and the only novelty signal before 2026-09-22.**
```
new_entrant(s, d, slot) = 1 iff mentions_24h_ago is NULL
```
252 of 787 rows on 2026-09-08 `[V]` — 32% of the daily list. A one-day-horizon proxy,
strictly weaker than `novelty_flag`, but it needs zero history and it is already in
the stored payload. Compute it from day one.

**Prediction, from measured data `[I]`:** fresh-discovery events are *common in the
universe* (~32% of listed names are new entrants daily) and *rare in this trader's
book* (11 mega-cap-skewed symbols). This is precisely prereg §3.3's stated expectation,
now with a number: **H3 is answerable on the universe panel and structurally
unanswerable on the journal.**

---

### M10 · `apdv_resid` [new] — attention per dollar volume **(MVS #3)**

The metric that separates genuine retail discovery from "this is just a liquid stock
that is moving", and the one deliberately constructed to survive prereg §8.1.

```
Fit, once per (date d, slot), across the cross-section:

    ln(1 + mentions(s, d, slot))  ~  β0 + β1 · ln( dollar_volume(s, d−1) )

  fit population : tickers with mentions ≥ 2 in that snapshot   (n ≈ 183 measured [V])
  estimator      : MEDIAN (quantile) regression — matches prereg §9.2's choice and
                   avoids NVDA/TSLA leverage dominating an OLS line
  minimum n      : 100, else the whole day's apdv_resid = N/A

apdv_resid(s, d, slot) = ln(1 + mentions) − (β0 + β1 · ln(dollar_volume(s, d−1)))
                       = N/A for tickers with mentions ≤ 1
```

- **`dollar_volume` is PRIOR SESSION, never same-day.** Same-day dollar volume is not
  knowable at 09:15 and using it is straightforward look-ahead. This is the most common
  way this metric is built wrong.
- **Why the fit population is `mentions ≥ 2`, stated now:** 604 of 787 listed names sit
  at exactly 1 `[V]`. Including them makes the fit a description of the ties. Restricting
  to ≥2 conditions the residual correctly: *among names people are talking about at
  all, which are over-talked relative to their liquidity?*
- **Per-day fit, never pooled.** A pooled fit leaks future days into past residuals and
  bakes in regime. A per-day fit is automatically regime-adjusted and strictly causal.
- **Why it is the RVOL-gate favourite `[I]`:** prereg §8.1 drops any feature with
  `|r| > 0.5` against RVOL. `mentions` and `mentions_z20` are at real risk there —
  people post about what is moving. `apdv_resid` is the residual after liquidity is
  projected out, so it is the family member most likely to clear the gate. **Prediction,
  recorded before the gate is run: `mentions` fails, `mentions_z20` is borderline,
  `apdv_resid` and `wiki_pageviews_z20` pass.**
- **Dependency:** a daily-bar store. `market_db` does not exist. See §8.
- **Sources:** ApeWisdom (or Arctic Shift / StockTwits) **×** any daily-bar store.
  Polygon grouped-daily gives every US stock for one date in a single call — 12,424
  tickers, 1.36 MB, verified `[V]` — at 1 call/day, comfortably inside the 5 req/min
  limit.

---

### M11 · `wiki_pageviews_z20` — the exogenous control

```
GET wikimedia.org/api/rest_v1/metrics/pageviews/per-article/
    en.wikipedia/all-access/user/<Article>/daily/<start>/<end>
wiki_pageviews_z20 = z20 of daily views, same construction as M2, σ floor 5 views
```

- **Use the `/user/` agent segment, not `/all-agents`** — it filters bots and spiders `[V]`.
- **History from 2015-07-01** `[V]`, keyless, 30 concurrent requests → 30× HTTP 200 with
  no throttling `[V]`. **This is the only attention source in the whole study with real
  backfill**, so it — uniquely — can be scored on the journal's *existing* trades.
- **CC0 / public domain, no attribution required — the only social-adjacent source in
  the study that is unambiguously safe to publish derived metrics from** `[V]`.
- **Coverage ceiling ~84%** of the liquid universe (3,510 of 3,894 US tickers in
  Wikidata have an en-wiki article; the liquid universe is ~4,174) `[V]`, and the missing
  sixth is **not random** — it is recent IPOs, low floats and small caps, i.e. exactly
  the population that produces violent breakouts `[I]`. **A blank is `N/A` ("no article"),
  never 0.** The mapping is also stale in places (a measured row mapped `MLKN` to
  *Knoll, Inc.*, absorbed into MillerKnoll years ago `[V]`), so it needs a staleness
  check and a manual override table.
- **T+1 lag, and it matters:** the daily bucket is a UTC day landing the following
  morning. At 09:15 ET (13:15 UTC) on day *d*, only through UTC day *d−1* is available —
  which ended 19:00 ET on *d−1*. **Wikipedia therefore cannot contribute an
  overnight-delta feature and cannot participate in H5.** It is a daily-level attention
  feature only.
- Already named in prereg §8.1's RVOL gate, so it is in scope by construction.

---

## 3. Normalization — the argument, not the formulas

Raw counts are worthless because AAPL always wins. Every metric above is one of five
normalization strategies, and choosing among them is the design:

| Strategy | Metric | What it removes | What it costs |
|---|---|---|---|
| **Own-history z-score** | M2, M5c, M11 | The ticker's permanent popularity level — NVDA's constant, AGI's constant "artificial general intelligence" background, AUPH's 98.8% permabull baseline | 20 sessions of warm-up; degenerate when σ→0 (hence the floor); breaks if the *non-ticker* meaning has a regime shift |
| **Own-history ratio** | M4a/M4b | The same, without needing a σ estimate | One session of warm-up only; noisier; undefined-ish at zero (hence Laplace `+1`) |
| **Cross-sectional rank** | M3 | The day's market-wide chatter level, so a quiet Tuesday and a CPI day are comparable | Destroyed by ties — 77% of the list shares one percentile `[V]`; and the top cell can be a single symbol |
| **Cross-sectional residual** | M10 | Liquidity and size, which is the confound the pre-registration's §8.1 gate exists to catch | Needs a daily-bar store; only defined on the ~183 names with mentions ≥ 2 |
| **Structural / compositional** | M7, M8 | Nothing about level — measures *who* and *where*, not *how much* | Needs author or scope decomposition; author identity does not exist on any aggregator |

**The decision:** for a per-ticker predictor, **own-history normalization is primary**
(z or ratio), cross-sectional residual is the confound-killer, and cross-sectional rank
is retained only because the pre-registration binds it for H2. **The one thing never to
use as a predictor is a raw level.**

The measured justification is not theoretical. `$AUPH` at 98.8% bullish `[M]` and
`$AGI` at rank 3 on 140 mentions while meaning "artificial general intelligence" `[V]`
are two different diseases with the same cure: a per-ticker baseline absorbs both a
permabull community and a constant background of non-ticker usage. That is also why
§6/R2 can *keep* collision-risk tickers instead of blocklisting them out of existence.

---

## 4. H1–H6, made falsifiable and computable

For each: the exact predictor expression, the pre-registered outcome, direction,
disconfirmation, and — honestly — whether the data will exist.

The pre-registration found that **only H5 is answerable on a useful horizon**
(§0, §4.5). Nothing below contradicts that. What follows adds the *computability* layer
the pre-registration did not have: for three hypotheses, the constraint turns out to be
not statistical power but whether the predictor can be built at all.

---

### H1 — Fuel

| | |
|---|---|
| **Predictor** | `mentions_z20` at the 09:15 ET slot, `all-stocks` scope (M2) |
| **Buckets** | `Low: z < 0.0` · `Mid: 0.0 ≤ z < 1.5` · `High: z ≥ 1.5` (prereg §3.1, absolute, fixed) |
| **Outcome** | **`Max R Before Stop`** (primary), run twice: as stored (censored) and on the uncensored daily-candle excursion (prereg §2.3) |
| **Direction** | High > Low |
| **Test** | Mann–Whitney U, two-sided, cluster-bootstrap CI clustered on `Date`; then the §9.3 median regression with the frozen control set |
| **Disconfirmed if** | CI on the High−Low shift contains 0, **or** the shift is < 0.5 R, **or** it dies after residualizing on RVOL / %ATR / %Gap |
| **Will the data exist?** | **Yes, from ApeWisdom alone — but not until ~2026-10-06** (20 sessions). ETFs are excluded by prereg §8.3, halving accrual to ~18/month, and the z-warmup costs roughly another month. N = 188 (*d* = 0.50) lands **~Aug 2027**, a month later than prereg §4.4's July figure. |
| **The honest caveat** | Of the non-ETF symbols in the measured export, only NVDA is reliably high-count. For CSCO/DELL/NOW/QUBT, σ20 will sit at the 1.0 floor and z reduces to a three-valued variable. **Effective variation is smaller than N.** `[I]` |

---

### H2 — Crowded / late

| | |
|---|---|
| **Predictor** | `mentions_pct_universe` at 09:15, within that day's ApeWisdom `all-stocks` list (M3) |
| **Buckets** | `Normal: pct < 90` · `Crowded: 90 ≤ pct < 99` · `Extreme: pct ≥ 99` — which measured out as **<7 mentions / ~7–60 / top ~8 names on Reddit** `[V]` |
| **Outcome** | `Max R Before Stop` |
| **Direction** | **Extreme < Normal.** The one hypothesis whose pre-registered direction is negative. Recording that now is what stops a negative result being re-narrated as "confirms H2". |
| **Disconfirmed if** | CI contains 0, **or** Extreme is *above* Normal. Note explicitly: Extreme > Normal is **not** "H1 confirmed" — H1 has its own test. |
| **Will the data exist?** | **Yes, today.** This is the only trade-level predictor needing no baseline history — one snapshot suffices. It is computable on every trade since 2026-09-08. |
| **The killer `[I]`** | The `Extreme` cell is ~NVDA, and NVDA is 33% of non-ETF trades `[V]`. **Recommend a §10 amendment, dated before the first window: if any cell is >50% one symbol, H2 is reported as unanalyzable.** |

---

### H3 — Fresh discovery

| | |
|---|---|
| **Predictor** | `novelty_flag` (M9a): `mentions_0915 ≥ 5` AND `< 5` on all prior 10 sessions |
| **Outcome** | `Max R Before Stop` |
| **Direction** | Fresh > Not-fresh |
| **Disconfirmed if** | CI contains 0 — **or, far more likely, the `Fresh` arm never reaches n = 25** |
| **Will the data exist?** | **The predictor: yes, from ~2026-09-22. The population: almost certainly no.** ~32% of the daily list are new entrants `[V]`, so fresh events are *common in the universe*; his book is 11 mega-cap-skewed symbols, so they are *rare in the journal*. |
| **Pre-committed conclusion (prereg §3.3, inherited)** | If `Fresh` has not reached 25 by the 2027-07 window, H3 is **closed as unanswerable on this journal** and may be re-opened only as a universe-panel question — a different study. |
| **Free head start** | `new_entrant` (M9c) is available from snapshot one and needs no history. It is a weaker proxy and is **reported, not substituted** for `novelty_flag`. |

---

### H4 — Wall of worry

| | |
|---|---|
| **Predictor** | `polarity_social` (M5a) **or** `polarity_news` (M5b) — **two separate tests, never pooled**, each with its own N (prereg §3.4) |
| **Buckets** | `Negative ≤ −0.20` · `Neutral` · `Positive ≥ +0.20` (absolute, fixed) |
| **Restriction** | **LONG trades only.** 35 of 36 measured trades are long `[V]`; the short arm cannot be pooled without silently inverting the hypothesis. |
| **Outcome** | `Max R Before Stop` |
| **Direction** | Negative-polarity longs > Positive-polarity longs |
| **Disconfirmed if** | CI contains 0, or the sign reverses. **Record which source was used** — a null on news polarity does not falsify social polarity, and vice versa. Two sources, two verdicts. |
| **Will the data exist? — social arm** | **Unknown, and possibly never.** StockTwits is the only clean labelled source found in the entire study and `13-open-questions.md` §6 is unresolved. **The design does not depend on it.** |
| **Will the data exist? — news arm** | **Yes, and it is backfillable to mid-2024** `[V]` — so the pre-registration's discovery/replication split (§4.6) is live today, at ~75 analyzable discovery trades (detectable *d* ≈ 0.65 ≈ 0.97 R: **large effects only**). |
| **The distributional risk `[I]`** | Both sources skew positive — StockTwits measured 98.8% bullish on a small-cap `[M]`; a comparable vendor news series measured 2.7% negative `[V]`. **The `Negative` arm is the one likely to starve.** Requirement: report the raw polarity distribution across the liquid universe *before* running H4. |

---

### H5 — Overnight attention delta ⭐ *the confirmatory arm*

| | |
|---|---|
| **Unit** | **ticker-day on the universe panel**, not his trades — which is what makes it answerable and immune to the selection circularity of prereg §8.2 |
| **Predictor** | `overnight_delta = ln((mentions_0915 + 1) / (mentions_prev1605 + 1))` (prereg §3.5, verbatim) |
| **Buckets** | `Flat < 0.25` · `Rising 0.25 ≤ d < 1.00` · `Surging ≥ 1.00` |
| **Outcome** | **`abs(next-session gap) ÷ ADR`** — ADR (gap-free), matching the journal's own Daily Prediction convention. Secondary: next-session RVOL. |
| **Universe** | price ≥ $1 and dollar volume ≥ $5M, matching `docs/market-scans/phase-1-spec.md` so the two studies compose |
| **Test** | Mann–Whitney U, **one-sided**, Surging > Flat, α = 0.05, ≥ 500 ticker-days per cell, **and** it must survive the §8.1 incremental-to-RVOL test |
| **Disconfirmed if** | The CI excludes a **+10% increase in mean \|gap\|/ADR** for Surging vs Flat, or the effect vanishes after residualizing on prior-day RVOL and %ATR. That is also the pre-registered futility stop at the 2027-07-05 window. |

**Will the data exist? — the predictor, yes; the outcome, not yet.**

- The predictor needs both the 16:05 and 09:15 slots. Both are collecting `[V]`.
- **Panel size, revised downward from prereg §4.5's ~360,000 ticker-days.** ApeWisdom
  lists ~787 names/day, not ~4,000 `[V]`. 90 days × 787 ≈ **70,800 ticker-days** with
  any listing at all. That still clears the 500/cell floor comfortably — **H5 remains
  well powered** — but the panel is an order of magnitude smaller than assumed and the
  figure should be corrected in the window write-up.
- **The outcome is the blocker.** `|next-session gap| ÷ ADR` requires open(d+1),
  close(d), and 14 prior sessions of High−Low to form ADR. `market_db` does not exist.
  **See §8.**

**`⚑A1` — The predictor differences two OVERLAPPING rolling windows.** 09:15 and the
prior 16:05 are 17h10m apart, so their trailing-24h windows overlap **6h50m = 28.5%**.
`overnight_delta` is therefore **not** "mentions accumulated overnight", and must never
be described that way in code, column names or UI.

*Why it is nonetheless valid, and why the pre-registered form is kept unchanged:* both
slots are at fixed clock times, so the overlap fraction is **identical for every ticker
on every day**. It is a constant monotone transform, not a per-observation bias, and
H5 is a purely cross-sectional bucketed comparison. **The formula stands.** Two
requirements follow:

1. **Naming discipline.** Store it as `overnight_delta` per prereg §9.1, but carry a
   one-line data-dictionary note: *"ratio of two overlapping trailing-24h windows; not
   an overnight post count."*
2. **A disjoint-window sensitivity companion**, reported alongside and **never
   substituted**: `ln((mentions_0915,d + 1) / (mentions_0915,d−1 + 1))` — two adjacent
   disjoint 24h windows. If the two forms disagree in direction, the result is reported
   as *"direction depends on window construction"* and is not called a finding.
   **This companion requires a dated §10 amendment made before the first window.**

**`⚑A2` — the `Surging` cut is trivially crossed by low-count names.** With Laplace
`+1` and a distribution where 77% of listed names sit at exactly 1 mention `[V]`, a
move from **1 → 5 mentions** gives `ln(6/2) = 1.10 ≥ 1.00` and lands in `Surging`.
A change of four posts crosses the threshold. **Consequence: the `Surging` bucket will
be dominated by low-count noise transitions, and the risk on H5 is not underpower — it
is a well-powered test of a noise-dominated predictor.** Two requirements:

1. Report the **joint distribution of `overnight_delta` × `mentions_0915` level** at the
   first window, before the test.
2. Run the confirmatory test **additionally** stratified to `mentions_0915 ≥ 5` as a
   pre-specified sensitivity. **Requires a dated §10 amendment, before data.** The
   primary remains the unstratified pre-registered form.

---

### H6 — Regime filter

| | |
|---|---|
| **Unit** | the trading day (measured: **12 traded days/month** `[V]`) |
| **Predictor (as pre-registered)** | `market_bull_share` = share of the day's top-100 ApeWisdom `all-stocks` tickers whose **polarity ≥ +0.20** at the 09:15 snapshot |
| **Buckets** | `Bearish < 0.40` · `Mixed 0.40–0.60` · `Bullish > 0.60` |
| **Outcome** | daily sum of `P&L (R)` (measured sd 1.20 `[V]`) |
| **Direction** | Bullish > Bearish |
| **Status** | **exploratory permanently** (prereg §3.6) — at 12 traded days/month, N=100 takes 8.3 months and the detectable effect is 0.67 R/day, larger than the entire measured daily mean of +0.49 R |

> ### `⚑A3` — **H6 is not computable from any currently-collecting source.**
>
> **ApeWisdom has no sentiment field.** The predictor requires per-ticker polarity on
> 100 names every day. That needs one of:
>
> - **StockTwits** — 100 symbol streams/day at 0.14s each is trivially cheap `[M]`, but
>   `13-open-questions.md` §6 is unresolved. **This is the option, and it is blocked.**
> - **Polygon news** — most of the top-100 WSB names will not clear the ≥3-article
>   minimum on a given day `[I]`. Coverage skews to names journalists cover; thin
>   small-caps are exactly the gap.
> - **Bluesky** — scoped by Track A4's own verdict to market-level use only, and it
>   cannot produce per-ticker polarity for 100 names either. It could produce a
>   *market-wide* bull:bear from a curated author set — but that is a **different
>   predictor**, not the pre-registered one.
>
> **Two honest routes, both requiring a dated §10 amendment made before data is
> examined:** (a) wait for §6 to resolve and build the StockTwits path; or (b)
> re-specify H6's predictor to something ApeWisdom *can* compute — candidates, neither
> pre-registered: `market_attention_concentration` (Herfindahl of the top-100 mention
> distribution) or `share of the top-100 that are new entrants`. Both are computable
> today from data already on disk.
>
> **Until one of those happens, H6 has no predictor and cannot be run.** That is a
> stronger statement than "underpowered", and it should be recorded as such.

---

## 5. Snapshot cadence — argued, not assumed

Current design: four slots, `premarket` (target 09:15 ET), `midday` (12:30),
`prior_close` (16:05), `evening` (20:00), bucketed by `slotFor()` with (scope, slot)
idempotency. Weekends captured.

### 5.1 The general principle, which decides most of the argument

> **Cadence only matters for sources with no retrievable history.** For an event-level
> source with timestamps — StockTwits `created_at`, Arctic Shift `created_utc` — you
> pull once daily and re-bucket offline to any resolution you like, retroactively.
> For a source that serves only "now" with no archive, the snapshot *is* the history
> and a missed slot is unrecoverable.

ApeWisdom is the second kind: **no date parameter, no archive, `?date=` silently
returns the current payload, `/history/GME` returns `[]`** `[V]`. That is the entire
justification for the cadence discussion, and it applies to exactly one source.

### 5.2 09:15 — right, and the most valuable slot. Keep it. Harden it.

Because `mentions` is trailing-24h, the 09:15 snapshot's window is
`(prev 09:15, today 09:15]` — the **whole overnight and pre-market conversation**,
ending 15 minutes before the open and ~20 minutes before a typical opening-range
entry. It is genuinely "attention state at setup time", which is what a Morning Plan
filter needs and what H5 is built on. **The 09:15 cut is correct.**

Do not move it later for freshness. A 09:29 capture would leave no margin for a retry
and risks a **negative `feature_lag_minutes`** against a 09:31 entry, which prereg §9.1
drops outright.

**But the schedule needs hardening, and this is a real build defect risk `[I]`:**

- GitHub Actions cron is **best-effort**; queue delays of 5–20+ minutes at popular cron
  times are routine `[R]`. **A 09:15 target that actually fires at 09:40 is look-ahead
  on a 09:35 entry.**
- Cron is UTC-only, so 09:05 ET is 13:05 UTC in EDT and 14:05 UTC in EST.

**Requirements:**

1. **Target 09:05 ET, not 09:15** — ten minutes of retry margin, and still inside the
   pre-market window.
2. **Schedule both `13:05` and `14:05` UTC**, on minutes that are neither `:00` nor
   `:30` (highest queue contention).
3. **Add an ET-clock guard to the collector:** refuse to write the `premarket` slot
   unless ET time is within `[09:00, 10:30]`. In EDT the 13:05 run writes and the 14:05
   run is a no-op via the existing (scope, slot) dedup; in EST the 13:05 run refuses
   (08:05 ET) and the 14:05 run writes (09:05 ET). **This is a small change to
   `slotFor()` and it makes the whole schedule DST-correct.**
4. **Enforce lag at analysis time from the recorded `captured_at`, never from the
   intended slot name.** The collector already records `captured_at` to the second —
   use it. A slot label is an intention; a timestamp is a fact.

### 5.3 16:05 — keep, for a narrower reason than it looks

It is *not* "the close" in any attention sense: its window overlaps 09:15's by 71.5%.
Its role in this design is **entirely** as the denominator of the pre-registered H5
delta, and that role is binding. Keep it, and do not attribute more meaning to it.

### 5.4 12:30 — the weakest slot. Keep it anyway, with a demoted justification.

As a *level* it is 86.5% redundant with 09:15. As a **`flow_delta` endpoint** it gives a
distinct, interpretable quantity ("excess lunchtime chatter vs. yesterday's lunchtime")
and it is a free fallback if the 09:15 run fails. At 494 KB / 46 KB gzipped per
snapshot `[V]`, the cost is nil. **Keep — but its justification is redundancy and flow
geometry, not information in the level.**

### 5.5 20:00 — keep. It is the second-most defensible slot.

Its window captures the after-hours and evening reaction to the day's news — the
*leading* half of the overnight window that 09:15 will later measure. Its day-over-day
delta is the cleanest "did tonight's chatter exceed last night's" measure available,
and for a Morning Plan it is the earliest possible warning, available the night before.

### 5.6 Is four enough? Yes. Do not add a fifth.

**More ApeWisdom snapshots do not buy more information about intraday flow** — every
snapshot is the same 24h integral, shifted. Additional slots buy only more
clock-aligned day-over-day series, whose marginal value falls off fast. Four is right.

The *cost* is not the constraint either: measured **66 MB/year gzipped across all six
scopes** `[V]` (six times the original single-scope estimate — the correction is
recorded in `00-measured-facts.md`). If that ever needs trimming, drop scopes, not
slots: `all-stocks` + `wallstreetbets` carry ~1,391 of 2,078 rows and the other four
overlap heavily. But **do not trim on a `mentions >= 2` filter** — that discards the
H3 population.

### 5.7 Weekends — **keep capturing. Here is the numeric reason.**

Reddit does not stop on Saturday, and `mentions` is a continuous trailing-24h window.
The **Monday 09:15 snapshot's window is `(Sun 09:15, Mon 09:15]` — it contains no
trading hours at all.** Every other Tue–Fri 09:15 observation contains a full prior
session. Monday is structurally a different observation.

Without weekend captures there is no way to know what a normal weekend attention level
looks like, and Monday's z20 would silently compare a weekend-dominated window against
weekday-dominated baseline members. (Measured context: Saturday WSB volume is roughly
**15× lower** than a weekday market hour `[M]`.)

**Requirements:**

1. **Keep weekend and holiday capture.** Cost is ~5 snapshots/week of 46 KB.
2. **Baselines are indexed on NYSE trading sessions**, so weekend/holiday snapshots are
   stored but are not baseline members. This needs a market calendar — a concrete
   dependency, and the same one the market-scans work already requires.
3. **Flag `window_spans_weekend = 1` on Monday-morning observations** and report Monday
   as a pre-specified stratifier. Do **not** add an unregistered Monday exclusion; the
   bias is present in both the observation and its Monday baseline members and largely
   cancels, but it must be visible rather than assumed away.
4. **Holidays:** weekdays with no session. `is_session = 0`, same treatment as weekends.

### 5.8 Cadence for every other source — decided, once

| Source | Cadence | Why |
|---|---|---|
| ApeWisdom | **4 slots/day** | No archive. The snapshot is the history. |
| Tradestie | **1/day** | Measured not to change within 10 minutes; effectively daily `[V]`. Plus a **one-shot backfill to 2021-03-20**, holes and all. |
| Arctic Shift | **1/day, off-hours** | Event-level with `created_utc`; re-bucket offline to any resolution. Rate-limit dynamic, ~1 req/2.5s sustainable `[M]`. **Never** from a Reddit-blocked path — Reddit 403s datacenter IPs, so GitHub Actions cannot hit Reddit directly `[M]`. |
| Wikipedia | **1/day** | Daily buckets, T+1. Plus a **one-shot backfill to 2015-07-01**. |
| Polygon news | **1/day, one market-wide call** | One call returns a full weekday (370 articles, no `next_url`) `[V]`. Steady state ~1 call/day; the 5/min limit is irrelevant. |
| Daily bars | **1/day, one grouped call** | 12,424 tickers, 1.36 MB, single request `[V]`. |

---

## 6. The traps, stated as build requirements

Each of these is a way to manufacture a result. They are written as requirements with
acceptance criteria, not as warnings.

---

### R1 · Scanner-bot echo — **the trap that can manufacture H1 out of nothing**

A measurable share of small-cap cashtag volume is **other people's breakout scanners
echoing price**. Measured verbatim: `tapeboard.bsky.social` posts
*"$SATL breakout, up 13.9% on 4,801,697 volume"* `[V]`. Left in, "attention predicts
breakouts" is measuring "breakouts cause bots to post about breakouts" — a lagging
transform of price wearing the costume of sentiment.

**R1.1 — Author denylist (for sources that expose authors).**
File `data/social/denylist/authors.json`, versioned in git, **frozen before the first
analysis window**. Seeded from measurement `[V]`: `tapeboard`, `insiderfinance.com`,
`robot2trade`, `tradingstats.xyz`, `stocknear`, `aistockwire`, `stocktitan.net`,
`insiderdashboard`, `watch4insider`, `tickerade`, `spymag-bot`, `v1s1on-3ndl3ss`,
`formdelta`, and the `informaq-*` family (one translation farm posting identical
content in five languages, author diversity 0.19 `[V]`).
**Additions are dated amendments. An author is NEVER removed after seeing a result.**

**R1.2 — Template denylist (body text).**
A post is flagged bot-echo if its body matches a price-report template:
`/\b(up|down)\s+\d+(\.\d+)?%/i` **AND** a bare volume-like integer `≥ 4 digits`, or the
`"<TICKER> breakout, up X% on N volume"` shape. Applies to Reddit / Bluesky /
StockTwits raw text. Flagged posts are **excluded from mention counts and from author
diversity**, and the excluded count is reported per ticker-day.

**R1.3 — The structural guard, because ApeWisdom has no authors.**

> **ApeWisdom cannot be author-denylisted. There is no author field.** For
> ApeWisdom-derived features, the pre-registration's §8.1 RVOL gate is **not a second
> line of defence — it is the only line.** Any H1 result resting solely on ApeWisdom
> features must be weighted down accordingly and must say so in the write-up.

Two guards that *do* work without authors:

- **`bot_suspect_flag` (M7).** `scope_concentration ≥ 0.9` with `Σ mentions ≥ 20`.
  A scanner flooding one subreddit shows near-total concentration; a genuine
  community story spreads across `wallstreetbets` / `stocks` / `Daytrading` / `options`.
  **Report it; do not filter on it** — an unregistered exclusion is forbidden by
  prereg §3.7.
- **The reflexivity test — pre-specified, and it works with no author data at all.**
  For every attention feature, compute and report side by side:
  ```
  r( feature(d) , return(d−1) )        ← backward-looking: is it an echo of price?
  r( feature(d) , outcome(d)   )        ← forward-looking: is it a signal?
  ```
  **If `|r(feature, return(d−1))| > |r(feature, outcome(d))|`, the feature is labelled
  "price echo" and its hypothesis result is not reportable as a finding.** This is the
  one bot guard that survives the total absence of author identity, and it should be
  run at the same window as the §8.1 gate.

---

### R2 · Cashtag collision — measured live, at rank 3

Not hypothetical. On 2026-09-08, **`$AGI` ranked #3 on 140 mentions** `[V]` — Alamos
Gold, a mid-cap gold miner, out-mentioning NVDA on WSB, because "AGI" means artificial
general intelligence. Cross-vendor confirmation of the same failure: SwaggyStocks' #1
was `OIL` on 354 mentions `[V]`; Tradestie ranked `TA` in its top 50 on 23 of 37 sampled
dates `[V]`. And **39 of 51 common English words tested are real US tickers** `[M]`.

**R2.1 — Frozen collision list.** `data/social/denylist/tickers.json`, **frozen before
the first analysis window** (this implements prereg §8.7's requirement). Seeded from
measurement: `AGI AI OIL TA IT ON ALL CEO EV DD PM OR SO GO NOW RE AM PT USA ANY CAN
GOOD LOVE OPEN REAL FAST TRUE PLAY WORK ONE TWO CASH GOLD PUMP BULL HOPE SAFE TECH DATA
FUND MAX MIN SEE STAY TURN PEAK STEP PAY SPOT LINE NEXT LOW FLY WELL EVER BEST DCA LMAO
THIS DOWN`. Adding a ticker after seeing its result is a dated amendment.

**R2.2 — Do NOT blocklist-and-drop. Tier by how the source resolved the ticker.**
A blocklist and a complete ticker universe are in direct conflict — you cannot both
catch a real `$OPEN` breakout and suppress the word "open". The resolution:

| Tier | Sources | Rule |
|---|---|---|
| **1 — structurally resolved** | StockTwits `tokenized_body` cashTag `[M]`; Polygon news `insights[].ticker` `[V]` | Collision-free by construction. **No blocklist applied.** |
| **2 — vendor-ruled** | ApeWisdom (documented to count common-word tickers only with a `$` prefix — but the measured `AGI` failure proves the list is incomplete) `[V]` | **Flag, do not drop.** Set `collision_risk = 1`. **Such a ticker may enter analysis via z-score / velocity features only; its raw level (M1) and percentile rank (M3) are set `N/A`.** A constant background of non-ticker usage is absorbed into μ20 and σ20 — which is exactly what own-history normalization is for (§3). |
| **3 — bare-token extraction** | Arctic Shift / Reddit. Measured: **0.6%** of comments carry a cashtag; **22.2%** carry any ALL-CAPS ticker-like token `[M]` | Require **≥ 2 signals**: the bare token **plus** either a context word from a frozen list, or the same token appearing cashtagged somewhere that day. **And** restrict bare-token matching to the day's liquid movers universe. |

**R2.3 — The residual risk, stated.** Tier-2 baseline absorption fails if the
*non-ticker* meaning has a regime shift — an AGI news cycle produces an enormous false
z on `$AGI`. **Requirement: `collision_risk` is a pre-specified stratifier, and any
finding must survive with collision-risk tickers dropped.**

**R2.4 — ETFs.** `SPY`/`QQQ`/`SOXL` are excluded from H1–H4 by prereg §8.3 anyway, via
a **maintained instrument-type list, not a ticker regex** (prereg's own wording). They
remain in H6 and in all descriptive reporting.

---

### R3 · Look-ahead from post-hoc-scored vendor data

**R3.1 — Named exclusions, frozen now:**

- **Tradestie `sentiment` / `sentiment_score`** — measured static per-ticker constants,
  480 tickers, 37 dates, 5.4 years, **zero** within-ticker variation `[V]`. A score
  stamped onto 2021 data was not computable in 2021. Already dropped by the collector;
  named here so nobody rediscovers it in March and gets excited.
- **Finnhub `/news-sentiment` snapshot** — no date parameters, therefore unbackfillable
  and unreplayable `[V]`.
- **Any vendor score lacking a per-observation `as_of` timestamp.**

**R3.2 — The positive rule.** A feature is *replayable* iff every input row carries a
timestamp stamped at generation and stored by us, and that timestamp is strictly before
the decision time. Qualifying: our own `captured_at` `[V]`; Polygon `published_utc`
`[V]`; ApeWisdom `mentions_24h_ago` (a lag of a live field, not a re-score) `[V]`.

**R3.3 — Archive raw, never only derived.** Already true (NDJSON committed). Add:
**never overwrite a snapshot file.** A correction appends a new record carrying
`correction_of`, so the original stays reproducible.

**R3.4 — Vendor drift monitor.** Inherited from prereg §8.7: a fixed set of 20 archived
Polygon articles is re-scored at every analysis window, and any drift is logged before
the analysis runs. `sentiment_reasoning` is model-generated and its stability across
time is unverified `[V]`; a silent model change would create a discontinuity in a long
series.

---

### R4 · Deleted-post survivorship — **direction known, magnitude measurable**

ApeWisdom's trailing-24h counts drop deleted posts. Deletion correlates with spam and
pump activity. **Therefore the highest-attention buckets are systematically
under-counted for exactly the noisiest names** `[I]` — a bias that runs *against* H2
(crowded) and *against* H1's top bucket. It is unfixable on ApeWisdom.

**But it becomes measurable the moment Arctic Shift is added**, because Arctic Shift
archives at post time and retains `[deleted]`/`[removed]` bodies (**3.1%** measured on a
live WSB sample) `[M]`.

**Requirement:** when Arctic Shift is wired in, compute
`deletion_rate(s, d) = share of that ticker-day's comments later showing [deleted]/[removed]`
and **report it per attention bucket at every window**. If deletion rate rises
monotonically with the attention bucket, the bias is confirmed and quantified. That
converts an unfixable bias into a measured one, which is the best available outcome.

---

### R5 · The Arctic Shift 36-hour score trap, and its ApeWisdom twin

**R5.1 — Arctic Shift.** Rows are archived the moment they are posted, so `score` and
`num_comments` read **0–1 for roughly 36 hours** `[V]`. A live collector records
score ≈ 0; a backfill of the same day records final scores. **The two disagree, and any
model using score trains on values unavailable in real time.**

> **Requirement: `score`, `num_comments`, and every upvote-derived field from Arctic
> Shift are excluded from every feature.** Mention *counts* are unaffected — a comment
> exists the instant it is posted.

If score is ever wanted: dual-snapshot. Record `score_t0` at collection and `score_t72`
on a re-pull ≥ 72h later; store both; use only `score_t0` in features. **Never mix.**

**R5.2 — The same disease on ApeWisdom, not previously flagged.** `upvotes` is
collected and its aggregation rule is **undisclosed** `[V]`. Upvotes accrue *after*
posting, so a 09:15 snapshot sees ~0 upvotes for a 09:00 post while any later view
would show hundreds. **`upvotes` is a maturity-confounded field of exactly the same
shape as Arctic Shift's `score`.**

> **Requirement: `upvotes` is stored (it is free and may be useful later) but is
> excluded from every feature in this design.**

---

### R6 · Bluesky's `$`-stripping search, and the silent-zero throttle

- **`searchPosts` strips the `$` sigil.** `$OPEN` returned **295 hits in a day with
  zero containing the literal string** `[V]`. Naive counts inflate **5–50×**.
- **There is no cashtag in the AT Protocol data model** — it is client-side rendering
  only, verified against live post records `[V]`.
- **Search throttling is silent**: an opaque HTML 403, no 429, no headers, degrading to
  **1 request per 61 seconds** under load `[V]`. **A collector built on search would
  quietly write zeros into the series** — the worst possible failure mode, because it
  looks like data.
- `hitsTotal` returns `10000` for every query including rare ones — a capped ceiling,
  **not a volume figure** `[V]`. Do not build a metric on it.

> **Requirements:** (1) **no Bluesky feature may be built on `searchPosts`**; use
> `com.atproto.repo.listRecords` against a curated author set, which returns honest
> `ratelimit-policy: 3000;w=300` headers `[V]`. (2) **Bluesky is scoped to H6
> market-level use only.** It cannot produce a per-ticker series outside the top ~30
> US names at any budget — measured: BBAI 0 posts/day, AEHR 0, `$TSLA` ~37/day against
> StockTwits' ~3,585/day; the platform's *entire* US-equity cashtag output across every
> ticker for a whole day is about one third of StockTwits' TSLA alone `[V]/[R]`.

---

### R7 · Collector gaps are missing, not zero

A slot that fails must not become a zero. **Requirement:** an `ingest_log`-style
completeness table (`date, slot, scope, rows, captured_at, status`) with an expected
**4 slots × 6 scopes** per date. A date with fewer is flagged; its observations are
NULL for every derived feature and it counts against the "≥ 15 of 20" baseline
allowance rather than silently deflating a mean.

---

### R8 · Do not let the easy source redefine the question

Recorded in `00-measured-facts.md` and worth restating as a design rule: **Polygon news
`insights` is news sentiment, not crowd sentiment.** It measures what wire services
wrote, not what the crowd said. For a breakout trader those are related but distinct —
news is more likely the *catalyst*, social is more likely the *fuel*. It is by a
distance the easiest source in this study to use (already paid for, backfillable to
mid-2024, one call/day). **That is precisely why it must not be allowed to quietly
become the study.** H1, H2, H3 and H5 are social hypotheses and stay social. Only H4
has a legitimate news arm, and prereg §3.4 already forbids pooling it with the social
arm.

---

## 7. Source → metric capability matrix

**Legend:** ✅ computable and measured · ⚠️ computable with a stated defect ·
❌ not computable, at any cadence or budget · 🔒 computable but **contractually
unresolved or blocked**.

| Metric | ApeWisdom | Tradestie | Arctic Shift (Reddit) | Wikipedia | Polygon news | Bluesky | StockTwits | FINRA |
|---|---|---|---|---|---|---|---|---|
| **M1** mention level | ✅ 787/day, 77% at 1 | ⚠️ top-50 WSB only | ✅ exact daily aggregate | ✅ pageviews (proxy) | ⚠️ article count | ❌ 0–15/day on breakout names | 🔒 ✅ best volume | ❌ not attention |
| **M2** `mentions_z20` | ✅ from 2026-10-06 | ⚠️ censored by top-50 entry/exit | ✅ + full history | ✅ **backfillable to 2015** | ⚠️ sparse for small caps | ❌ | 🔒 ✅ | ❌ |
| **M3** `mentions_pct_universe` | ✅ (the pre-registered definition) | ❌ top-50 has no tail | ⚠️ different universe | ⚠️ 84% coverage ceiling | ❌ | ❌ | 🔒 ⚠️ trending list is top-30 | ❌ |
| **M4a/b** day-over-day velocity | ✅ + free `mentions_24h_ago` | ✅ | ✅ | ✅ | ⚠️ | ❌ | 🔒 ✅ | ❌ |
| **M4c** `flow_delta` (clock-window) | ✅ 4 slots | ❌ daily only | ✅ (better: real rate) | ❌ daily buckets | ⚠️ by `published_utc` | ❌ | 🔒 ✅ | ❌ |
| **M4d** true Δ/hour arrival rate | ❌ **rolling-24h — impossible at any cadence** | ❌ | ✅ `created_utc` | ❌ | ⚠️ `published_utc` | ❌ thin | 🔒 ✅ `created_at` | ❌ |
| **M5** polarity | ❌ **no sentiment field** | ❌ **static constant — excluded by name** | ❌ needs an NLP model | ❌ | ✅ **replayable, backfillable** | ❌ thin | 🔒 ✅ **human-declared, 45–48%** | ❌ |
| **M6** unanimity / dispersion | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | 🔒 ✅ | ❌ |
| **M7** scope breadth / concentration | ✅ **6 scopes already collected** | ❌ | ✅ per-subreddit | ❌ | ❌ | ❌ | ❌ | ❌ |
| **M8** `author_diversity` | ❌ **no author field** | ❌ **no author field** | ✅ `author` — gated on ticker resolution | ❌ | ❌ | ✅ but thin | 🔒 ✅ + account age + post source | ❌ |
| **M9** novelty | ✅ + free `new_entrant` | ⚠️ list entry/exit only | ✅ | ✅ | ⚠️ | ❌ | 🔒 ✅ | ❌ |
| **M10** `apdv_resid` | ✅ **× a daily-bar store** | ⚠️ | ✅ × bars | ✅ × bars | ❌ | ❌ | 🔒 ✅ × bars | ❌ |
| **M11** `wiki_pageviews_z20` | — | — | — | ✅ **CC0, publishable** | — | — | — | — |

**Contract status, so the matrix is read correctly:**

- **StockTwits 🔒** — `13-open-questions.md` §6 is an unresolved cross-track
  contradiction: A1–A3 measured documented v2 endpoints serving public data keylessly
  at 0.14s / 8.9 req/s with no rate-limit headers `[M]`; Track H read the ToS as
  expressly banning scraping with developer registration closed `[V]`. The narrow
  question is whether unauthenticated requests to *documented public API endpoints*
  constitute scraping or ordinary keyless API use. **Until resolved: do not add it to
  the collector.**
- **FINRA 🔒/❌** — `13-open-questions.md` §4: the 8.1-year CDN flat files are governed
  by terms that ban harvesting, database-building **and use with predictive analytics
  models** `[V]`. The Query API is permitted but is a **365-day rolling window** with no
  backfill. Either way it is short-interest positioning, not attention, and it does not
  compute any metric in this family. It belongs in the frozen control set, not here.

### 7.1 What survives if StockTwits **and** FINRA are ruled out entirely

**This is the design as written.** Nothing in the minimal viable signal set, and nothing
in H1, H2, H3 or H5, depends on either.

| Survives intact | Degraded | **Lost outright** |
|---|---|---|
| M1, M2, M3, M4a/b/c, M7, M9, M10, M11 | **M5 polarity** → news arm only (Polygon), which is *news* not *social*, so H4's social arm simply does not run | **M8 `author_diversity`** → computable only from Arctic Shift, and only for tickers resolvable out of Reddit prose where 0.6% of comments carry a cashtag `[M]` |
| H1, H2, H3, H5 | **M6 unanimity** → news form only | **H6** → its pre-registered predictor requires per-ticker polarity on 100 names/day and has **no source** (`⚑A3`) |
| The whole MVS | **H4** → one arm instead of two | **M4d** true arrival rate → Arctic Shift only |

**The one genuine casualty is the bot detector.** The brief asks for author diversity
explicitly, and without StockTwits it is reachable only through Arctic Shift, gated
behind the hardest unsolved problem in the study (Reddit ticker resolution). **That is
why §6/R1.3's reflexivity test exists** — it is a structural echo guard that needs no
author identity and can be run on ApeWisdom features today.

---

## 8. The minimal viable signal set — and its one blocking dependency

**If only three metrics get built:**

**1 · `overnight_delta` — ApeWisdom `all-stocks`, 09:15 vs prior 16:05.**
It is the sole input to the study's only confirmatory test. Nothing else in the study
may be described as a finding (prereg §5.1). The predictor data is already accruing;
the two `⚑A1`/`⚑A2` requirements above must be recorded as dated amendments before the
first window.

**2 · `mentions_z20` — ApeWisdom `all-stocks`, 09:15, σ floor 1.0, ≥15 of 20.**
The H1/H2 workhorse and the only metric here a Morning Plan panel would display.
**First computable ~2026-10-06.**

**3 · `apdv_resid` — ApeWisdom × a daily-bar store, per-day median-regression residual.**
The only family member constructed to survive the §8.1 RVOL gate. Without it, a positive
H1 is very likely to be reported as *"it was RVOL with extra steps"*, which prereg §7
already names as the pre-committed reading.

**Free, and already in the stored payload — build these too, they cost nothing:**
`new_entrant` (M9c) and `v1_vendor` (M4b). They need zero history and they are the only
novelty and velocity signals available before October.

> ### 🔴 The blocking dependency
>
> **Metric 3 and the confirmatory test's own outcome variable both require a daily-bar
> store that does not exist.** `web/wrangler.toml` still carries
> `database_id = "TODO_RUN_WRANGLER_D1_CREATE"`.
>
> `|next-session gap| ÷ ADR` needs `open(d+1)`, `close(d)`, and **14 prior sessions of
> High − Low** to form ADR (gap-free, matching the journal's own convention). The liquid
> universe filter (price ≥ $1, $ volume ≥ $5M) comes from the same data.
>
> **What it takes:** Polygon `/v2/aggs/grouped/locale/us/market/stocks/{date}` — every
> US stock for one date in a single call, **12,424 tickers, 1.36 MB, verified** `[V]`,
> 1 call/day, comfortably inside the measured 5 req/min limit `[V]`. Stored as NDJSON in
> the same committed-snapshot pattern the social collector already uses, or imported to
> D1 later in one pass.
>
> **To preserve the pre-registration's ~Dec 2026 date for H5, this must start by
> ~2026-09-15.** Every day it does not run is a day the confirmatory arm cannot be
> scored on — and unlike the social snapshots, this one *is* backfillable, so the
> urgency is about the December date, not about permanent loss.
>
> **Licence note:** grouped-daily on an individual (`personal`) Polygon plan is fine for
> the private journal and for private analysis. It may **not** be published on
> tapereader.us (`13-open-questions.md` §1). This is analysis infrastructure, not a
> product surface.

---

## 9. Metrics considered and removed

Per the brief's standard — where the honest answer is "this cannot be computed", remove
it rather than design something unbuildable.

| Requested | Verdict | Why |
|---|---|---|
| **Percentile rank within the liquid universe** | **CUT** (distinct from M3, which ranks within the ApeWisdom list and is retained because prereg binds it) | The liquid universe is ~4,174 names; ApeWisdom lists ~787 `[V]`. **~81% of the universe is a zero**, so any liquid-universe percentile is ≥81 for every listed name and adds nothing over `ln(1 + mentions)`. It is a rescaled indicator of "listed at all". Report the four-level ordinal `unlisted / 1 / 2–9 / ≥10` instead, which says the same thing honestly. |
| **True velocity (Δ/hour) and acceleration on ApeWisdom** | **CUT for ApeWisdom** — retained as M4a/b/c/d in the day-over-day and clock-window forms | `mentions` is a rolling 24h integral. No cadence recovers an arrival rate (§1.3). A true rate exists only on event-level sources (Arctic Shift, StockTwits). |
| **Acceleration as a hypothesis predictor** | **Computed, never tested** | Not in the pre-registration's frozen predictor set; adding a test to an already ~50-node garden of forking paths (prereg §5) is exactly what the document exists to prevent. Stored so a future study has the series. |
| **`author_diversity` from any aggregator** | **NOT COMPUTABLE** | Neither ApeWisdom nor Tradestie exposes author identity `[V]`. Reachable only via Arctic Shift (ticker-resolution-gated) or StockTwits (contractually unresolved). |
| **Polarity from ApeWisdom or Tradestie** | **NOT COMPUTABLE / EXCLUDED** | ApeWisdom has no sentiment field `[V]`. Tradestie's is a measured static per-ticker constant across 5.4 years `[V]` and is a look-ahead landmine. |
| **Any upvote/score-derived feature** | **EXCLUDED** | Maturity-confounded on both Arctic Shift (`score` ≈ 0 for ~36h `[V]`) and ApeWisdom (`upvotes`, undisclosed aggregation `[V]`). A live collector and a backfill disagree. |
| **Google Trends attention** | **CUT** (Track C) | **HTTP 429 on request number one from a clean IP** `[V]`; `pytrends` archived 2025-04-17; the official API is application-gated alpha. And it is window-relative, not absolutely scaled, so a cross-sectional daily panel across 4,000 names is not constructible from pairwise-normalised series. **Wikipedia pageviews is the same signal, free, keyless, unthrottled, absolutely scaled, with 11 years of backfill.** Strictly dominated. |
| **Bluesky per-ticker attention** | **CUT** | 0–15 posts/day on the names a breakout scan surfaces `[V]`. Retained for H6 market-level only. |
| **Discord / Telegram / YouTube / TikTok** | **CUT** (Track A5/A6) | Self-bots are a termination offence; six probed Telegram finance channels yielded zero US-equity content; **YouTube's Developer Policies require stored API text to be deleted or refreshed after 30 days** — a source that must forget faster than a three-month study needs to remember; TikTok's Research API is academic-only with commercial users explicitly ineligible `[V]/[R]`. |

---

## 10. Handoffs

- **→ `05-preregistration.md` §10.** Three amendments are required, each dated and made
  **before** any window's data is examined: `⚑A1` the `overnight_delta` disjoint-window
  sensitivity companion; `⚑A2` the `mentions_0915 ≥ 5` stratified sensitivity on the
  confirmatory test; `⚑A3` either the StockTwits path for H6 or a re-specified H6
  predictor. Also worth recording: the H5 panel is ~70,800 ticker-days over 90 days,
  not ~360,000 (§4.5), and H1's accrual clock starts ~2026-10-06 rather than
  2026-09-08 (§4, H1).
- **→ Track I (build plan).** Four concrete collector changes: the DST-safe dual-cron
  with an ET-clock guard (§5.2); the `ingest_log` completeness table (§6/R7); the two
  frozen denylist files (§6/R1.1, R2.1); and the daily-bar collector, which is the
  critical path (§8).
- **→ Track E (journal integration).** The MVS is three columns plus two freebies, all
  joining on `date|symbol` — the same key screenshots already use. Nothing here
  justifies a sheet column before the pre-registration's futility stop; prereg §7.1 is
  explicit that a column added on the strength of a null is permanent clutter.
- **→ Track F (product surface).** Every metric in the MVS derives from ApeWisdom, whose
  redistribution status is **⚠️ UNCLEAR — no terms page exists at all** `[V]`, and which
  inherits Reddit's upstream problem. **Wikipedia (CC0) is the only source in this
  design that is unambiguously safe to publish derived metrics from.** Design the public
  surface on that assumption, not on the best source.
- **→ Track J (red team).** The strongest attack on this design is not statistical, it is
  R1.3: **for the source the whole MVS rests on, author-level bot filtering is
  impossible, and the RVOL gate is the only defence.** A red team should press on
  whether the reflexivity test is sufficient, or whether an ApeWisdom-only H1 is
  structurally uninterpretable.
- **→ Track K (signup checklist).** Nothing in this design requires an account. The MVS
  is keyless end to end, and the daily-bar dependency runs on the Polygon key already
  held.
