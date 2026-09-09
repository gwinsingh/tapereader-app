# 06 — Journal Integration

**Track E.** The sheet columns, the join rule that decides whether any of this is
honest, what backfills and what never will, the EDGAR catalyst auto-fill, and the
proof that the whole thing is additive-only.

**As-of: 2026-09-09.** Written against `04-signal-design.md` (binding on the
metrics), `05-preregistration.md` (binding on what the columns must serve),
`13-open-questions.md` (§1 constrains what may be public, §13 is a live blocking
dependency), and the real code — `web/lib/trade-journal/google-sheets.ts` (96
managed headers, measured) and `scripts/review/migration-safety.ts`.

**Evidence key:** `[V]` verified / measured · `[R]` reported by third parties ·
`[I]` our inference.

---

## The proposal — 9 new columns, 1 new dropdown value, 0 new formula columns

Appended to the **end** of `SHEET_HEADERS`, after `In-Window Capture %`. On the
live 98-column tab they land at **columns 99–107 (CU..DC)**.

| # | Header string | Type | Source | Fill rule | What it is for |
|---|---|---|---|---|---|
| 1 | `Mentions` | integer ≥ 0, or `N/A` | ApeWisdom `all-stocks`, **`premarket` slot of the trade's own ET date** | Fill-if-blank, offline enrichment job. Present in snapshot → the integer. Absent from a *successful* snapshot but seen in the trailing 90 days → `0`. Absent and never seen in 90 days → `N/A`. No snapshot → `N/A`. | The raw attention level at setup time. Input to `mentions_z20` (M2), `mentions_pct_universe` (M3), `apdv_resid` (M10) — none of which are stored; all are derived offline from this and the snapshot store. |
| 2 | `Mentions 24h Ago` | integer ≥ 0, or `N/A` | Same snapshot record's `mentions_24h_ago` field `[V]` | Same. Vendor NULL → `N/A` (**never `0`** — NULL means new entrant). Ticker absent from the snapshot entirely → `N/A`. | Gives `v1_vendor = ln((m+1)/(m24+1))` and `new_entrant = 1 iff N/A` — the two zero-history freebies (M4b, M9c). The only velocity and novelty signals that exist before October 2026. |
| 3 | `Mentions Rank` | integer ≥ 1, or `N/A` | Same snapshot record's `rank` | Same. Ticker not in the list → `N/A` **even when `Mentions` is `0`** (rank is undefined for an unlisted name). | The only one of the three a human can read without a baseline: `Mentions 4` means nothing on day one; `Rank 37` of a ~787-name list means something. Raw ingredient of M3. |
| 4 | `Attention Snapshot` | ISO-8601 UTC, e.g. `2026-09-14T13:05:11.402Z`, or `N/A` | The joined snapshot's `captured_at`, **verbatim, to the second** `[V]` | Written together with columns 1–3, atomically. Never written without them. | **The join audit.** `feature_lag_minutes = entry_ts_utc − this` is computed from it at analysis time (prereg §9.1), and a row with lag ≤ 0 is dropped and counted. Without this column the join is unverifiable and the whole attention arm is unfalsifiable. |
| 5 | `Sentiment Source` | provenance string (grammar in §2.6) | The enrichment job itself | Written on every enrichment pass that touches columns 1–3 or 6–7, including passes that write only `N/A`. Fill-if-blank. | **The provenance column, mirroring `Risk Source`.** Records vendor, dataset, slot, schema version, and — when a value is `N/A` — *which kind* of `N/A`. The run found vendors silently change scores (`sentiment_reasoning` stability unverified `[V]`) and silently freeze them (Tradestie's per-ticker constants `[V]`). A value without a source and a version is not evidence. |
| 6 | `News Sentiment` | float in [−1, +1], 3 dp, or `N/A` | Polygon `/v2/reference/news` → `insights[].sentiment` `[V]` | Fill-if-blank. `(n_pos − n_neg) / (n_pos + n_neg + n_neu)` over articles where the symbol ∈ `insights[].ticker` and `published_utc ∈ [prior session 16:00 ET, entry_ts_utc)`. `n_total < 3` → `N/A`. Trade date before 2024-07-01 → `N/A`. | M5b, the news arm of H4 (wall of worry). **The one new feature column that is not blank on history** — `insights` is 100% covered from mid-2024 `[V]`, which is the entire journal. |
| 7 | `News Articles` | integer ≥ 0 | Same query | Fill-if-blank. Written as `0` when the query succeeded and returned nothing — **`0` here is a real measurement, not a gap.** `N/A` only when the date precedes the insights window. | The denominator. `News Sentiment = +1.00` on one article and on forty are different facts, and the ≥3 minimum cannot be checked without it. Also the coverage statistic prereg §4.6 requires be reported before H4 is run. |
| 8 | `Catalyst Source` | `auto (edgar)` · `auto (news)` · `manual` · `N/A` | The catalyst cascade (§4) | Written whenever the cascade writes `Catalyst`. Set to `manual` — never overwritten — when `Catalyst` was already non-blank. | Mirrors `Risk Source` exactly. The trader keeps the final say; the machine never overwrites a human label, and a reader can always tell which is which. `Catalyst` is currently **100% blank (36/36)** `[V]`, so without this column a backfilled sheet would be indistinguishable from a hand-labelled one. |
| 9 | `Catalyst Ref` | evidence string, or `N/A` | EDGAR / news, raw | Written with `Catalyst Source`. Format in §4.4. | The raw evidence behind the label: the 8-K accession number, the item codes, the filing date, the form type. **Storing raw keeps the mapping generic** — the same reasoning `CLAUDE.md` gives for storing raw daily OHLCV rather than derived thresholds — so a later change to the item→catalyst map needs no re-backfill. It also makes every auto-label auditable against `sec.gov` in one click. |

**Plus one dropdown value:** add `Offering/Dilution` to `CATALYST_OPTIONS`
(google-sheets.ts:220, mirrored at `plan/page.tsx:41`). Recommendation and its
mechanics in §4.5.

**No new formula columns.** `FORMULA_HEADERS` is unchanged, so
`planMigration().formulaWriteCols` is unchanged, so the two most dangerous
assertions in `migration-safety.ts` are untouched. See §6.

### What was deliberately cut, and why

Every column is permanent surface area, so the cuts matter as much as the adds.

| Candidate | Verdict | Why |
|---|---|---|
| `mentions_z20` (MVS #2) | **Cut** | Derived from 20 prior sessions and from a σ floor that is a design choice. Freezing it in a cell means a definition change silently splits the series into two incomparable halves. It is recomputable from `Mentions` + the snapshot store at any time, and it joins to the trade by `date|symbol` whenever the analysis runs. **Store raw; derive offline.** |
| `apdv_resid` (MVS #3) | **Cut** | Worse than z20: it is a *per-day cross-sectional median-regression residual*, so its value for one trade depends on ~183 other tickers' data that day and on the estimator. It is not a property of the trade. It also blocks on a daily-bar store that does not exist (§13 of open questions). |
| `overnight_delta` (MVS #1) | **Cut, emphatically** | H5 is a **universe-panel test on ticker-days, not a trade-level test** (prereg §5.1, §3.5). No trade-level column serves it. A column here would look like it did, which is worse than not having it. |
| `wiki_pageviews_z20` (M11) | **Cut, for now** | It is the exogenous *control* in Track D's design, not a predictor, and controls belong in the analysis table. It is also the one attention source that backfills to 2015 `[V]`, so unlike social data **it costs nothing to add later** — the asymmetry that justifies deferring it. |
| `polarity_social`, `unanimity`, `author_diversity` | **Cut — not computable** | StockTwits is ruled out (`13-open-questions.md` §6, RESOLVED AGAINST US); no collecting aggregator exposes author identity or a sentiment label `[V]`. Specifying a column for data that has no source is exactly what the brief's standard forbids. |
| `novelty_flag` (H3 predictor) | **Cut** | Derived from 10 prior sessions of `Mentions`; same argument as z20. And H3 is pre-committed as *structurally unanswerable on this journal* (prereg §3.3) — his book is 11 mega-cap-skewed symbols and fresh-discovery events are rare in it by construction. |
| A separate `News Cutoff` timestamp | **Cut** | The news window ends at the row's own entry timestamp, which is already on the row as `Date` + `Entry Time`. A second copy would be a second thing to keep in sync. |

### The rule that makes this set small

**The sheet is not the analysis substrate.** The pre-registration's one-row-per-trade
table (§9.1) is materialised offline at each analysis window from two immutable
sources: the sheet export (outcomes, controls, trader covariates) and the NDJSON
snapshot store (`data/social/**`, append-only, git-committed). Derived features are
recomputed from raw on every window, never read back out of a cell.

So a column earns a place on the sheet only if it is **(a) raw**, **(b) not
recoverable from anywhere else later**, or **(c) something the trader reads with
his own eyes.** Columns 1–4 are (a) and (b); column 5 is the provenance that makes
(b) meaningful; 6–7 are (a) and (b) *within his own risk of vendor drift*; 8–9 are
(c) plus the evidence trail.

---

## 2. The timing rule

> **This is the most important section in this document.** A wrong join produces
> look-ahead bias that survives every downstream check, because a contaminated
> feature and a clean feature are the same datatype in the same cell. Nothing in
> the analysis can detect it. It has to be right here.

### 2.1 The join key

For a trade row with `Date = d` (`YYYY-MM-DD`, ET calendar date `[V]`),
`Symbol = s`, `Entry Time = t_et` (`H:MM:SS` ET, leading zeros stripped by Sheets
`[V]`), `Side`:

```
entry_ts_utc(trade) = toUTC( d + " " + t_et , America/New_York )      # DST-aware
```

The ApeWisdom block (columns 1–4) joins on:

```
key = (source = 'apewisdom', scope = 'all-stocks', date = d, slot = 'premarket', ticker = UPPER(s))
```

Exactly one snapshot record can match, because the collector's idempotency
mechanism is `(scope, slot)` per date `[V]` — a re-run inside the same slot writes
nothing. `slotFor()` buckets `premarket` as ET clock time `< 11:00` `[V]`.

**This is a fixed-slot join, not a nearest-snapshot-before join.** The trade's
entry time selects nothing. A 09:47 trade and a 15:12 trade on the same date in the
same symbol carry **identical** values in columns 1–4.

### 2.2 Why fixed-slot, and not "the latest snapshot before entry"

The worked example in the assignment is the whole argument: a trade at 10:47 joins
to the **09:15 (target 09:05) pre-market snapshot**, and it must still join to that
snapshot even though a 12:30 snapshot will exist later the same day. Three
independent reasons, any one of which is sufficient:

1. **The pre-registration binds the slot.** H1's predictor is
   "`mentions_z20` at the 09:15 ET slot" (prereg §3.1, `04-signal-design.md` M2);
   H2's is `mentions_pct_universe` at 09:15 (M3); H3's is `mentions_0915` (M9a).
   Those are absolute, frozen definitions. A join that picks a different slot for
   a later trade is not computing the pre-registered predictor.

2. **A nearest-before join makes the feature a function of entry time.** Later
   trades would carry fresher, higher-information features. Time-of-day is
   already known to interact with this trader's outcomes — the journal computes an
   hourly breakdown across four time blocks for exactly that reason `[V]` — so the
   feature would be confounded with the outcome through a channel that has nothing
   to do with attention, and the §9.3 control set does not include time of day.

3. **Reflexivity — the contamination that has a name.** `mentions` is a rolling
   trailing-24h count `[V]`. The 12:30 snapshot's window is `(prev 12:30, 12:30]`,
   which **contains that morning's session**. If the symbol is running, part of
   the mention count *is* people posting about the run — the same run the trade is
   riding. `04-signal-design.md` R1 measured this directly: a real share of
   small-cap cashtag volume is other people's breakout scanners echoing price
   verbatim (`"$SATL breakout, up 13.9% on 4,801,697 volume"` `[V]`). Joining a
   13:10 trade to a 12:30 snapshot lets a partly-outcome-derived quantity into the
   predictor. It is not *look-ahead* in the strict sense — the number was
   genuinely on screen at 12:30 — but it is measuring price against itself, and
   the study would report it as attention.

   The 09:05/09:15 window `(prev 09:15, today 09:15]` contains **no part of the
   trade's own session.** That is not a workaround; it is a property of the
   trailing-24h semantics, and it is why the pre-market slot is the only one that
   can carry a clean trade-level feature.

**Corollary, stated so nobody "fixes" it later:** the 12:30, 16:05 and 20:00 slots
are collected and are valuable — 16:05 is the denominator of the H5 delta and
20:00 is the earliest overnight warning — but **none of them may ever be joined to
a trade row.** They exist for the universe panel and the Morning Plan, not for the
journal.

### 2.3 Eligibility guard — `feature_lag_minutes > 0`

The fixed-slot rule selects the snapshot; the lag guard decides whether it is
*usable*.

```
feature_lag_minutes = (entry_ts_utc − captured_at) / 60000
```

- `> 0` → eligible. Write columns 1–4 normally.
- `≤ 0` → **ineligible.** The snapshot was captured at or after entry, so the
  feature is contaminated by the trade itself. Write `N/A` to columns 1–4 and
  `ape=N/A(lag<=0)` to `Sentiment Source`. **Do not fall back to an earlier
  slot** — that would re-introduce the entry-time dependence §2.2 rejects, and it
  would do so only for the subset of trades entered pre-market, which is a
  selected subset.

In practice the premarket capture lands ~09:05 ET and virtually every entry is at
or after 09:31, so this fires only for genuine pre-market entries. Prereg §9.1
already drops such rows and counts them; writing `N/A(lag<=0)` makes the drop
visible on the sheet instead of silently plausible.

**Enforce from the recorded `captured_at`, never from the slot label.**
`04-signal-design.md` §5.2 is explicit: a slot label is an intention, a timestamp
is a fact, and GitHub Actions cron is best-effort with routine queue delays of
5–20+ minutes `[R]`. A `premarket` snapshot that actually fired at 09:40 is
look-ahead on a 09:35 entry, and only the timestamp can catch it.

### 2.4 The news block's window — different by design, and stated precisely

Columns 6–7 are **not** slot-joined. They are a time-window aggregation, and the
window ends at the row's own entry:

```
window = [ prior_session_close_16:00_ET , entry_ts_utc )        # half-open
articles = { a : symbol ∈ a.insights[].ticker
                 AND a.published_utc ∈ window }
News Sentiment = (n_pos − n_neg) / (n_pos + n_neg + n_neu)      if n_total ≥ 3
               = N/A                                            otherwise
News Articles  = n_total
```

Fixed here, so they are not chosen later (M5b, inherited verbatim): dedup by
`(article_id, ticker)`; **no publisher weighting**; **no time decay**; a hard
window rather than a decayed one.

Two consequences to accept knowingly:

- **Two trades in the same symbol on the same date can carry different news
  values.** That is correct — the second trade genuinely had more news available.
  The `published_utc < entry` filter is what makes this the one vendor-scored
  feature in the study that is legitimately replayable `[V]`, and it is mandatory,
  not optional (prereg §8.7).
- **"Prior session", not "yesterday".** A Monday trade's window opens at **Friday
  16:00 ET** and spans the whole weekend. Calendar-day arithmetic would silently
  drop every weekend news item. This needs an NYSE trading calendar — the same
  dependency `04-signal-design.md` §5.7 and §4 below both require.

### 2.5 When the slot is missing — enumerated, because "missing" has five meanings

The collector may not have run. ApeWisdom has **no archive** — `?date=` silently
returns the current payload and `/history/GME` returns `[]` `[V]` — so a missed
slot is **unrecoverable forever**, not "not enriched yet".

That distinction decides the write. The journal's convention is that **blank means
"not enriched yet" and is a data-quality defect that blocks the analysis window**
(prereg §2.4). A permanently-missing snapshot is not a defect that will ever clear,
so leaving it blank would block every future window on a gap that can never be
filled. **Write `N/A`, and put the reason in `Sentiment Source`.**

| Situation | Cols 1–3 | Col 4 | `Sentiment Source` ape segment |
|---|---|---|---|
| Snapshot exists, ticker listed | values | `captured_at` | `ape=apewisdom/all-stocks/premarket/v1` |
| Snapshot exists, ticker absent, **seen in trailing 90 days** | `0` / `N/A` / `N/A` | `captured_at` | `ape=apewisdom/all-stocks/premarket/v1` |
| Snapshot exists, ticker absent, **never seen in 90 days** | `N/A` | `captured_at` | `ape=N/A(not-in-universe)` |
| Snapshot missing (collector did not run that slot) | `N/A` | `N/A` | `ape=N/A(no-snapshot)` |
| Trade date precedes the first premarket capture | `N/A` | `N/A` | `ape=N/A(pre-collection)` |
| Snapshot exists but `captured_at ≥ entry` | `N/A` | `N/A` | `ape=N/A(lag<=0)` |

Rows 2 and 3 are the distinction that matters most and the one that is easiest to
get wrong: **`0` means "nobody was talking about it"; `N/A(not-in-universe)` means
"we could not see."** Conflating them would actively mislead — it would put a
confident zero on exactly the thin, recently-listed small caps that produce the
most violent breakouts. This is `04-signal-design.md` §2's missingness contract,
made concrete.

**Never impute. Never retry a written `N/A`.** All six states are terminal:
ApeWisdom cannot be re-queried for a past slot, so a second pass computing a
different value means a bug, and overwriting would destroy the evidence of it.
The enrichment job is therefore **fill-if-blank on all nine columns**, matching
`PLAN_FILL_COLS` / `DAY_FILL_COLS` semantics `[V]` rather than
`updateEnrichment`'s overwrite-unless-null semantics.

### 2.6 `Sentiment Source` grammar

Two segments, semicolon-separated, each `<block>=<vendor>/<dataset>/<cut>/<schema-version>`
or `<block>=N/A(<reason>)`:

```
ape=apewisdom/all-stocks/premarket/v1;news=polygon/insights/entry-cut/v1
ape=N/A(no-snapshot);news=polygon/insights/entry-cut/v1
ape=N/A(pre-collection);news=N/A(n<3)
ape=N/A(not-in-universe);news=N/A(pre-insights)
```

Reason codes are a **closed set**: ape → `no-snapshot` · `pre-collection` ·
`not-in-universe` · `lag<=0`; news → `pre-insights` · `n<3` · `no-coverage`.
Adding a code is a schema-version bump.

**Version bump rule.** Bump `v1 → v2` when the vendor's field semantics change,
the scope or slot changes, or the aggregation rule changes. **Never rewrite old
rows on a bump** — a row that says `v1` is the record that it was produced under
v1, and that is the entire point of the column. Pair the bump with a dated entry
in `05-preregistration.md` §10.

This is the column that answers the run's own finding that vendors silently change
data (Polygon's `sentiment_reasoning` is model-generated with unverified stability
`[V]`) and silently freeze it (Tradestie's sentiment measured as a per-ticker
constant with zero within-ticker variation over 5.4 years `[V]`). Prereg §8.7
already requires 20 archived articles be re-scored at every analysis window to
detect Polygon drift; `Sentiment Source` is what makes the detection actionable —
it identifies exactly which rows were produced under the pre-drift version.

### 2.7 ETFs are populated, not excluded

`SPY` was **rank 1 with 213 mentions** in the first stored snapshot `[V]`, and
half this trader's trades are index/sector ETFs `[V]`. The columns are written for
them normally. Exclusion from H1–H4 is an **analysis-time eligibility flag**
(`is_etf`, prereg §9.1), not a reason to leave a cell blank — blanks mean
something specific here and must not be overloaded.

---

## 3. Backfill reality — per column, without softening it

| Column | Backfills? | Coverage on trades before 2026-09-09 |
|---|---|---|
| `Mentions` | **No** | `N/A` on every row |
| `Mentions 24h Ago` | **No** | `N/A` on every row |
| `Mentions Rank` | **No** | `N/A` on every row |
| `Attention Snapshot` | **No** | `N/A` on every row |
| `Sentiment Source` | Partially | `ape=N/A(pre-collection)` + a real news segment |
| `News Sentiment` | **Yes, to mid-2024** | Populated wherever ≥3 articles clear the window |
| `News Articles` | **Yes, to mid-2024** | Populated (`0` is a real value) |
| `Catalyst Source` | **Yes, to 2001** | Populated |
| `Catalyst Ref` | **Yes, to 2001** | Populated |

**Four of nine columns will read `N/A` on every historical trade, permanently.**

The dates, precisely:

- **Social attention starts 2026-09-08 21:00 ET, and that first capture was the
  `evening` slot** `[V]`. The columns above are joined to the **`premarket`** slot,
  so the **first trade that can carry a real attention value has `Date` ≥
  2026-09-09**. Trades on 2026-09-08 itself get `ape=N/A(pre-collection)` like
  everything before them.
- ApeWisdom has no archive `[V]`. There is no vendor, no price, and no paid tier
  that sells this history — the source does not retain it.
- StockTwits was the one source whose message history was walkable backwards
  (AUPH: 4 months, 3,590 messages, ~30s `[M]`) and would have rescued this. It is
  **ruled out** — `13-open-questions.md` §6 resolved against us on all three
  possible framings, and §7 is withdrawn as a consequence. There is no second
  channel the way there was for FINRA.
- Polygon `insights` coverage is **0% at 2024-05 and 100% from 2024-07 forward**
  `[V]`. The journal begins well inside that, so news columns cover it entirely.
- SEC EDGAR full-text search reaches **2001** `[V]`, so the catalyst columns cover
  the whole journal and anything the trader ever adds to it.

### 3.1 What this does to the discovery/replication split

Prereg §4.6 cuts the split at **2026-09-08**: everything before is *discovery*
(findings are hypotheses, permanently, labelled as such), everything after is
*replication* (never touched outside a scheduled window), and exactly one
hypothesis may be carried across.

- **The news arm has both halves.** Discovery ≈ 150 trades × ~50% non-ETF ≈ **75
  analyzable**, detectable *d* ≈ 0.65 ≈ **0.97 R** — large effects only, and that
  qualifier belongs next to every number quoted from it. At the measured accrual
  of ~18 analyzable trades/month `[V]`, the replication set reaches parity with
  discovery around **February 2027** `[I]`. That is the design working as intended.
- **The catalyst arm gains a discovery set it did not have.** `Catalyst` is 100%
  blank today `[V]`, so no catalyst-conditioned analysis exists at all. EDGAR
  backfill creates one across the full journal — the single largest increase in
  analyzable surface area in this entire proposal. With the caveat in §4.6.
- **The attention arm has no discovery set at all.** There is no held-out half,
  there is no split, and there never can be one. Its first window is also its
  only look. Combined with prereg §4.4 — *d* = 0.5 needs N ≈ 188 → ~Aug 2027,
  *d* = 0.3 needs N ≈ 523 → ~Feb 2029 — the honest statement is:

  > **The four attention columns are a collection mechanism, not an analysis
  > input on any horizon worth planning around.** Their value at the trade level
  > is that in 2028 there will exist a series that cannot be bought at any price
  > today. The study's actual answer comes from H5 on the universe panel
  > (~Dec 2026), which uses **none** of these columns.

That is a plainly disappointing sentence and it is the correct one. It is also
precisely the trader's original request — *"start collecting that data in my trade
book and my trade journal over time"* — so the right response is to build the four
columns, keep expectations off them, and not let their existence quietly promote
the trade-level arm above what prereg §5.1 permits.

**One thing to avoid, explicitly:** because these columns will be `N/A` on every
historical row, the temptation to reconstruct them from a third-party archive
later is real. `13-open-questions.md` §6 and §7 close that door for StockTwits;
any other retrospective reconstruction of a "what was attention on 2026-05-14"
value is post-hoc-scored vendor data, which is `04-signal-design.md` R3's named
trap and prereg §8.7's exclusion. **A reconstructed value must never be written
into these columns.** If one is ever wanted, it gets its own column and its own
`Sentiment Source` version.

---

## 4. The EDGAR catalyst auto-fill

`Catalyst` is **blank on 36 of 36 rows** `[V]`. Prereg §8.8 calls it a blocker,
not a caveat. Track B found the fix is free, keyless, and reaches further back
than the journal does.

### 4.1 Why this is the highest-value item in the document

The 8-K `items` array is a **controlled vocabulary the company files under legal
liability** `[V]` — not a model's guess. `company_tickers.json` gives 10,412
ticker→CIK→name mappings keylessly in one 797 KB file `[V]`, which removes the
entity-resolution ambiguity that sinks GDELT. Coverage reaches **2001** `[V]`.
SEC's published fair-access limit is **10 req/s** with a descriptive User-Agent
`[R]`, three orders of magnitude above any vendor here, and all measured probes
were served unthrottled `[V]`.

It is also the only source in the whole study that is **unambiguously
redistributable** — US government work product — which matters for Track F given
`13-open-questions.md` §1.

### 4.2 The cascade

Only three of the nine existing `CATALYST_OPTIONS` are news events at all.
`Gap Only`, `Key Daily Level`, `Day 2` and `Pullback to DEMA` are *price states*
and `Sector Momentum` is a *cross-sectional* state — no news source can or should
populate them. So this is a cascade with a stated precedence, not a classifier:

```
1. EDGAR filing event      → Earnings/News · FDA/Regulatory · Offering/Dilution   [auto (edgar)]
2. analyst-action regex    → Upgrade/Downgrade                                     [auto (news)]
3. Polygon insights/topics → Earnings/News · FDA/Regulatory · Other                [auto (news)]
4-5. price state           → NOT AUTOMATED (needs market_db; leave blank)
6. fallthrough             → leave blank, not "Other"
```

Stages 1–2 always win over stage 3. **Stage 6 deliberately writes nothing.**
`Other` in the existing vocabulary means "the trader looked and it was something
else"; a machine that found no filing has not established that. Writing `Other`
would manufacture a label out of an absence and would make "no identifiable
catalyst" — genuinely useful information for a breakout trader — indistinguishable
from "the cascade did not run". Leave `Catalyst` blank and write
`Catalyst Source = N/A`, `Catalyst Ref = N/A`.

### 4.3 Stage 1 mapping

| Filing signal | `Catalyst` | Confidence |
|---|---|---|
| 8-K item **2.02** (Results of Operations & Financial Condition) | `Earnings/News` | very high — this *is* the earnings release |
| **424B5** / **424B3**, or 8-K item **3.02** (Unregistered Sales of Equity) | **`Offering/Dilution`** *(new)* | very high |
| 8-K item **1.01** (Material Definitive Agreement), **2.01** (Completion of Acquisition), or **SC 13D** | `Earnings/News` (M&A) | high |
| 8-K item **5.02** (Departure/Election of Officers) | `Earnings/News` (management) | high |
| 8-K item **8.01** (Other Events) **+ SIC 2836/8731** | `FDA/Regulatory` | medium — 8.01 is a catch-all; the SIC gate and a keyword check are both required |
| 8-K item **1.03** (Bankruptcy) | `Other` | high |

When several items match on one filing, precedence is the table order (2.02 first).
When several filings match in the window, precedence is §4.4.

Error mode is **recall, not precision** — a mover with no filing falls through the
cascade correctly `[I]`. That asymmetry is what makes stage 1 safe to run
unattended.

### 4.4 The timing trap, and the join that fixes it

> An 8-K's `file_date` is the **filing** date. Earnings 8-Ks are routinely filed
> **after the close**, for a move that happens the **next** morning. Matching a
> filing to a trade on the same calendar date mislabels a large fraction of
> gap-up trades — which for an ORB trader (26 of 36 trades are ORB `[V]`) is the
> population that matters most.

**The join window:**

```
file_date ∈ { trade_date , prior NYSE trading session }
```

**Not `trade_date − 1 calendar day`.** A Monday trade must reach back to **Friday**;
calendar arithmetic would land on Sunday, when nothing is filed, and would miss
every Friday-after-close earnings release — the single most common
gap-up-on-Monday setup. Half-day sessions and holidays have the same shape. This
needs the same NYSE calendar §2.4 requires; build it once.

**Precedence when both dates carry a filing:** take the **trade-date** filing (it
is the more proximate catalyst) and record both accession numbers in
`Catalyst Ref`. When only the prior session carries one, take it.

**Refinement worth pursuing, and its status.** `data.sec.gov/submissions/CIK##########.json`
is documented to return each filing's form type, `filingDate`, `items`,
`accessionNumber` **and `acceptanceDateTime`** — the last of which would resolve
"filed at 16:31 after the close" versus "filed at 08:02 pre-market" exactly, and
would let the prior-session case be *preferred* on evidence rather than by rule.
**This was not measured in this run** `[I]` — Track B's measured route is
`efts.sec.gov/LATEST/search-index`, whose `_source` carries `display_names`,
`file_type`, `file_date`, `items`, `adsh` but no acceptance time `[V]`, and which
requires a `q=` term so it cannot cleanly enumerate all 8-Ks for a ticker.
**Verify the submissions endpoint before building; the date-window rule above is
the fallback and is sufficient on its own.**

**`Catalyst Ref` format** — pipe-separated, raw, no interpretation:

```
edgar|8-K|2.02,9.01|2026-05-13|0001045810-26-000058
edgar|424B5|-|2026-05-12|0001628280-26-004417
edgar|8-K|2.02|2026-05-13|0001045810-26-000058 + 8-K|8.01|2026-05-12|0001628280-26-004417
news|polygon|3 articles|relevance=0.81|https://…
```

Storing the item codes and the accession number rather than only the label is what
makes a later change to §4.3's mapping a re-derivation instead of a re-backfill —
the same reasoning `CLAUDE.md` gives for storing raw OHLCV `[V]`.

### 4.5 `Offering/Dilution` — recommendation: **add it**

The honest case against, first: this trader's measured book is QQQ 7, SPY 6,
NVDA 6, SOXL 5, NBIS 3 `[V]` — mega-caps and index ETFs, where a dilutive
offering is essentially never the catalyst. On the May 2026 sample the new option
would fire **zero times** `[I]`. Judged on his current book alone, its marginal
value is ~0.

The case for, which wins:

1. **The cost of not having it is unrecoverable.** Without the option, a genuine
   424B5 shelf takedown gets labelled `Other` (or, under §4.2's rule, nothing at
   all) and is indistinguishable in analysis from "no catalyst". A missing
   category cannot be recovered from the data later; an unused category costs one
   line in an array.
2. **EDGAR surfaces it exactly and keylessly** — 12 424B5s in a single measured
   week `[V]`. The detection is already built by stage 1; only the label is
   missing.
3. **It is the catalyst class where the trader's own read is most likely to be
   wrong.** An overnight offering is the thing that turns a clean day-2
   continuation into a failed breakout, and it is invisible on the chart. This is
   precisely a case where the machine knows something the screen does not.

**Mechanics, and one concrete gotcha.** The dropdown is applied by
`applyFormatting` via `setDataValidation` with **`strict: false`** `[V]`, so
adding a value invalidates no existing cell and rejects no hand-typed entry. It
does not touch the header row, so `planMigration` never sees it — a dropdown value
is not a column and is outside the additive-only contract entirely.

**But:** `migrateTabIfNeeded` calls `applyFormatting` **only when
`missingHeaders.length > 0`** — the no-op branch runs `repairFormulas` and returns
`[V]`. So a dropdown-only change **would never reach the live tab.** Because this
proposal adds nine headers, the same migration fires `applyFormatting` and the
dropdown updates in the same pass. **Ship them together.** If the columns are ever
deferred, the dropdown change needs its own trigger, or it silently does nothing.

Keep the addition to one. `IPO/Lockup` was also floated; there is no measured
evidence it fires on this book, and the vocabulary is a dropdown a human reads
every day.

### 4.6 The caveat that must ride along

Auto-population changes what `Catalyst` *means*. Today it is an empty column that
was going to be hand-labelled; after this it is a machine-derived column with a
hand-override path. Two consequences:

- `Catalyst Source` is what keeps them separable, and any analysis that
  stratifies on catalyst must report the `auto` / `manual` split alongside.
- A catalyst-conditioned result on the backfilled discovery set is a **hypothesis**
  under prereg §4.6, exactly like the news arm, and inherits the same *d* ≈ 0.65
  detectability floor.

---

## 5. Morning Plan integration

The form at `/pct-bootcamp/trade-journal/plan` gains a **read-only, attention-ranked
pre-market panel**. It writes nothing.

### 5.1 What is actually computable at 09:15, honestly

| Available from day one | First computable | Never (no source) |
|---|---|---|
| `mentions`, `rank` (the raw snapshot) | `overnight_delta` — **2026-09-09** (needs a prior `prior_close` slot) | any polarity — no source since StockTwits was ruled out `[V]` |
| `mentions_24h_ago` → `v1_vendor = ln((m+1)/(m24+1))` | `novelty_flag` — **~2026-09-22** (10 prior sessions) | `author_diversity` — no aggregator exposes author identity `[V]` |
| `new_entrant` (= vendor field NULL; 252 of 787 rows on day one `[V]`) | **`mentions_z20` — ~2026-10-06** (20 prior sessions, ≥15 required) | `apdv_resid` — blocks on `market_db`, which does not exist |
| `scope_breadth` across the 6 collected scopes | `z60` — ~2026-12-02 | |

**So for the first month the panel shows day-over-day change and novelty, and
nothing normalized.** `mentions_z20` — the one metric Track D says a Morning Plan
panel would actually display — **does not exist until ~2026-10-06.** Building the
panel to display it before then means shipping a permanently-empty column or,
worse, a z computed on 4 sessions with a floored σ, which is a number that looks
like a z and is not one. Ship the panel with the freebies; add the z column on
2026-10-06 with a dated note.

### 5.2 The cadence problem the panel must show, not hide

The premarket capture targets **09:05 ET** (Track D §5.2 hardening: dual cron at
13:05 and 14:05 UTC for DST, plus an ET-clock guard refusing to write the
`premarket` slot outside `[09:00, 10:30]`). If the trader opens the form at 08:40,
**today's snapshot does not exist yet** and the freshest available is last night's
`evening` (20:00) capture.

**Requirement:** the panel displays the `slot` and `captured_at` of the snapshot it
is rendering, in the header, always. Never render a stale snapshot as "this
morning". A morning-plan panel that silently shows last night's numbers under
today's date is the same class of error as §2.2's join bug, arriving through the UI
instead of the data.

### 5.3 Panel contents

Rank the day's `all-stocks` list by `v1_vendor` among names with `mentions ≥ 5`
(the informative slice is ~180 names/day and the strongly informative one ~50;
604 of 787 rows sit at exactly 1 mention `[V]`), showing per row: ticker,
`mentions`, `rank`, `v1_vendor`, a `new` badge for new entrants, and
`scope_breadth`. Plus a direct lookup panel for the symbols already on today's
plan, so the trader can see the attention state of names he chose for other
reasons.

**Show the prior session's % change beside every attention number.** This is
`04-signal-design.md` R1 turned into UI: a name may be high-attention *because it
already moved*, and the panel should let the trader see the echo himself rather
than presenting attention as if it were independent information. It depends on the
daily-bar store, so it ships when that does.

### 5.4 No new columns on the `Daily Plan` tab — and this one is not a style preference

`upsertDailyPlan` **clears `PLAN_RANGE` and rewrites the tab wholesale**
(`sheetsValuesClear` then `sheetsValuesUpdate` with `[PLAN_HEADERS, ...otherDates,
...newRows]`) `[V]`. That path is **not** protected by the additive-only contract
that guards the trade tabs — there is no `planMigration` equivalent for it and
`migration-safety.ts` does not cover it. A stored attention value there would also
be an un-versioned second copy of a snapshot the store already holds immutably.

**The panel reads; it does not write.** If a pre-market attention value ever needs
to be persisted, it belongs in the snapshot store keyed by `(date, slot, ticker)`,
where it already is.

### 5.5 The behavioural cost of shipping this, stated before it is shipped

The moment the trader can see attention rankings at plan time, he will trade some
names *because* of them. That is prereg §8.2's selection circularity, and it means
trades after the panel's ship date are drawn from a different population than
trades before it.

**Requirement: record the panel's ship date in `05-preregistration.md` §10 as a
dated amendment, and treat it as a pre-specified stratifier** — trades before and
after are reported separately in every trade-level attention analysis. This costs
nothing if done in advance and is unrecoverable if not. It is also a second reason
the panel is better shipped *after* the H5 confirmatory window (~Dec 2026): H5 runs
on the universe panel and is immune, so nothing is lost by waiting, and the
pre-panel trade sample stays clean for a few months longer.

---

## 6. Migration safety

### 6.1 The live shape

`SHEET_HEADERS.length` = **96** `[V, counted]`. The live `U16632046-GURI` tab is
**98 columns** — 96 managed plus two hand-added columns the code does not manage,
`RightTheory?` and `EOD Screenshot` `[V]`.

Adding nine headers: `SHEET_HEADERS` 96 → **105**; the live tab 98 → **107**; the
new columns occupy indices 98–106 = **CU..DC**.

### 6.2 How the proposal satisfies the contract

1. **Appended at the end of `SHEET_HEADERS`, after `In-Window Capture %`. Never
   inserted mid-list.** The positional `COL` map and the `SHEET_HEADERS.indexOf(h)`
   lookups in `applyFormatting` depend on order; an insertion would silently
   misalign currency and conditional formatting. Every existing block in the file
   carries this same warning `[V]`.
2. **`planMigration` is a set difference plus an append past the last existing
   column.** The nine appear in `missingHeaders`; `appendStartCol = headerRow.length
   = 98`; the write range is `CU1:DC1` only. The header row is never rewritten
   wholesale, so existing order and identity survive by construction.
3. **`RightTheory?` and `EOD Screenshot` are unaffected.** They are not in
   `SHEET_HEADERS`, so the set difference never enumerates them; the nine land
   *after* them, so their indices do not move and their data is untouched. This is
   the standing precedent for unmanaged columns, preserved exactly.
4. **Zero new formula columns.** `FORMULA_HEADERS` is unchanged, so
   `plan.formulaWriteCols` is unchanged, so nothing new is ever written by
   `repairFormulas`.

### 6.3 What `migration-safety.ts` asserts, assertion by assertion

| Assertion | Effect of this proposal |
|---|---|
| **1.** No formula write lands in a protected column | **Unchanged.** `formulaWriteCols` does not grow; `PROTECTED` does not grow. |
| **2.** Every write target is an owned formula column | **Unchanged**, same reason. Resolved against the post-migration header, which now includes the nine — none of them is a write target. |
| **3.** New headers land strictly past the last existing column | **Now exercised, and passes.** `appendStartCol = 98 ≥ hdr.length = 98`. Today this assertion takes the no-op branch (`no headers missing`); after this change it takes the append branch and prints `9 missing headers append at col 99 (past all 98 existing)`. |
| **4.** Existing column order preserved | **Unchanged.** `colMap` is name-keyed and the header row is never rewritten. |
| **4b.** No hand-typed literal in an app-owned formula column | **Unchanged.** No new owned formulas, so the scanned range does not change. |
| **5.** Read range spans the tab | **Passes with room.** `READ_RANGE_END = colLetter(TOTAL_COLS + 26)` → 105 + 26 = **131 ≥ 107**. Headroom over the live tab drops from 24 unmanaged-column slots to 24 (the two unmanaged columns are a constant), so `READ_BUFFER_COLS` needs no change. |
| **6.** Protected columns within the read range | **Unchanged.** Ladder block and both unmanaged columns remain far inside 131. |

**Run `node --experimental-strip-types scripts/review/migration-safety.ts` before
and after, and require 0 failures both times.** The before-run matters: it proves
assertion 3 flipped from the no-op branch to the append branch for the expected
reason.

### 6.4 One assertion worth adding, which this proposal motivates

`updateEnrichment`'s `enrichFieldMap` carries a comment that the R and capture
columns are "deliberately absent from this map — writing a literal there would
replace the formula with a frozen number" `[V]`. That is currently a comment, not
a check, and this proposal adds nine entries to that map (or to its fill-if-blank
sibling). **Add to `migration-safety.ts`: every enrichment write target is
disjoint from `FORMULA_HEADERS` and from `PROTECTED`.** It is a set-intersection
test over two exported constants, it needs no network, and it converts the one
remaining "we were careful" into "it is asserted".

### 6.5 Where the enrichment job runs — an edge-runtime constraint with teeth

**The join cannot run in the upload path.** Every API route is
`export const runtime = 'edge'` `[V, CLAUDE.md]`, and the snapshot store is
NDJSON under `data/social/**` — outside `web/`, so not in the Next.js bundle, and
**66 MB/year gzipped** across six scopes `[V]`, which no edge route should be
reading anyway.

**Recommendation:** a Node script, `scripts/journal-social-enrich.mjs`, run by the
same GitHub Action that already runs the collector, authenticating through the
existing `scripts/review/env.js` service-account pattern that `migration-safety.ts`
and the other review scripts already use `[V]`. It reads the tab, reads the
snapshot store, and writes only blank cells among the nine. This keeps the
whole join in Node, keeps it out of the request path, and makes it re-runnable and
idempotent by construction (fill-if-blank).

The news and EDGAR passes can live in the same script or in an edge route — both
are plain `fetch` against remote APIs with no local corpus, so either works. Put
them in the same script for one provenance-writing path.

---

## 7. Implementation checklist

1. `google-sheets.ts` — append the nine headers to `SHEET_HEADERS` (end of list,
   with a block comment matching the existing convention); add `Offering/Dilution`
   to `CATALYST_OPTIONS`; mirror it in `plan/page.tsx:41`.
2. Do **not** add any of the nine to `FORMULA_HEADERS`, `manualHeaders`, or
   `enrichFieldMap` (the latter overwrites; these nine are fill-if-blank).
3. Number formats are optional and deliberately omitted to keep the
   `applyFormatting` diff small — `News Sentiment` at 3 dp is the only one worth
   considering.
4. `scripts/journal-social-enrich.mjs` — the §2 join, the §2.5 state table, the
   §2.6 provenance grammar, fill-if-blank writes.
5. `scripts/journal-catalyst-enrich.mjs` (or the same script) — the §4 cascade,
   the §4.4 window, `company_tickers.json` cached locally.
6. An NYSE trading calendar module, needed by §2.4, §4.4 and
   `04-signal-design.md` §5.7. Build it once; three consumers already exist.
7. `npx tsc --noEmit`, then `migration-safety.ts` (0 failures), then
   `verify-upload-pipeline.ts` and `verify.ts --tab=U16632046-GURI` per the
   standing contract.
8. Morning Plan panel — **read-only**, ships after the H5 window unless the
   §5.5 stratifier amendment is recorded first.

---

## 8. Handoffs and dependencies

- **→ `05-preregistration.md` §10.** Two amendments this document creates, both
  needing a date and both made before any window's data is examined: (a) the
  Morning Plan panel's ship date as a pre-specified stratifier (§5.5); (b) the
  `Catalyst` column's change of meaning from hand-labelled to machine-derived,
  with `Catalyst Source` as the separator (§4.6). These are **in addition** to
  Track D's `⚑A1`/`⚑A2`/`⚑A3`.
- **→ Track I (build plan).** §6.5's Node enrichment job and §7's NYSE calendar
  module. Neither is on Track I's current list.
- **→ `13-open-questions.md` §13.** Nothing in this document blocks on the missing
  `market_db`, which is deliberate — the nine columns are all raw and none is a
  cross-sectional derivative. The only casualty is §5.3's prior-session % change
  in the Morning Plan panel. **The ~2026-09-15 deadline for daily-bar collection
  stands untouched by anything here.**
- **→ Track F (product surface).** None of these nine columns may appear on
  tapereader.us. Polygon news and grouped-daily are on an individual (`personal`)
  licence `[V]`, and ApeWisdom has **no terms page at all** `[V]`. The journal is
  gated behind Cloudflare Access and is squarely inside the individual licence
  `[V]`. **But `13-open-questions.md` §1 flags one live exposure that this
  proposal makes larger: the Google Sheet is described as *shared*, and if anyone
  other than the account holder can open it, Polygon-derived columns are being
  furnished to another person.** This document adds two more Polygon-derived
  columns to that sheet. **Check who the sheet is shared with before running the
  news backfill.**
