# Social Market Sentiment — Research

**Status:** research complete · 2026-09-08 (overnight run) · 16 tracks, ~9,500 lines
**Branch:** `social-sentiment-research` · nothing merged, nothing deployed

> ## The short version
>
> **Don't build it — but keep collecting.**
>
> The red team's verdict is `DON'T BUILD IT`, and the rest of the research
> supports it. No journal columns, no Morning Plan panel, no public page, no
> signup, no multi-quarter analysis programme. **The collector keeps running**
> — that is an archival decision, not a reduced build: ApeWisdom publishes no
> history and no vendor sells it, so a day not captured is gone permanently, and
> it costs 66 MB/year.
>
> **The budget question answers itself: spend $0.** Not from thrift — every
> subscription product surveyed starts at $19.99 or above. The ≤$10 rung is
> empty. The only sub-$10 option that exists at all is X's pay-per-post, where
> $10 buys ~95 posts/day across a whole watchlist.
>
> **Two things escape the verdict, because they are not social sentiment:**
> Polygon's news `insights` (already on the key you hold, backfills to mid-2024,
> covers every trade you have journalled) pointed at the **100%-blank `Catalyst`
> column**, and **SEC EDGAR** 8-K item codes — keyless, back to 2001, exact
> ticker resolution, filed under legal liability rather than guessed by a model.
> Those are the real wins of the night, and neither is what the study set out to
> find.
>
> **Do this in October, not July 2027:** run the pre-registered RVOL gate after
> ~20 days of collection. It is decisive by the study's own rule, reads no
> outcome column so it costs nothing statistically, and can close the whole
> question **eight months early**.

Start with [`12-signup-checklist.md`](12-signup-checklist.md) — it stands alone
and is written for twenty minutes before the open.

## Read in this order

| # | Doc | What it answers |
|---|---|---|
| — | [Morning checklist](12-signup-checklist.md) | **Start here.** What to do, ranked, with ready-to-send emails |
| 0 | [Brief](00-brief.md) | What was asked, the constraints, how to trust this |
| 0 | [Measured facts](00-measured-facts.md) | What was measured directly against live endpoints |
| 1 | [Social sources](01-sources-social.md) | Nine platforms, ~20 vendors — who is open, who is empty |
| 2 | [News sources](02-sources-news.md) | Where the free, historical, backfillable data actually is |
| 3 | [Flow proxies](03-sources-flow.md) | Positioning signals that are not words |
| 4 | [Signal design](04-signal-design.md) | The metrics, and the one hard deadline |
| 5 | [Pre-registration](05-preregistration.md) | **When will I know?** The arithmetic that says no |
| 6 | [Journal integration](06-journal-integration.md) | 9 columns and the join rule that prevents look-ahead |
| 7 | [Product surface](07-product-surface.md) | Why there is no public page, and where the value is |
| 8 | [Cost ladder](08-cost-ladder.md) | $0 / ≤$10 / $50 / $200 / $500+ — what each buys |
| 9 | [Legal & ToS](09-legal-tos.md) | Collect, keep, publish — three different answers |
| 11 | [Red team](11-red-team.md) | **The verdict**, and the case against |
| 13 | [Open questions](13-open-questions.md) | What is unsettled, and what the run got wrong |

Raw per-source research and the three licensing resolutions are in
[`.wip/`](.wip/). Track 10 (build plan) documents the execution sequence.

## What is actually running

- **`scripts/social-ingest.mjs`** — keyless collector for ApeWisdom and
  Tradestie. First capture taken 2026-09-08: **2,078 rows, 46 KB gzipped**,
  idempotent by `(scope, slot)`, verified by re-run.
- **`.github/workflows/social-ingest.yml`** — committed with **the cron
  commented out on purpose**. Note that GitHub fires scheduled jobs only from
  the default branch, so enabling it here would silently do nothing.
- Snapshots land in `data/social/<source>/<year>/<date>.ndjson`.

## The five findings that mattered most

1. **Polygon news `insights` is authorized on the existing key**, carries
   per-ticker sentiment *plus* written reasoning, and backfills to mid-2024 —
   free, auditable, and covering every trade already journalled.
2. **Half the trades in the May export are index/sector ETFs**, which carry no
   ticker-level attention signal. Analyzable accrual is ~18 trades/month, not
   35 — which pushes every trade-level question past 2027, and most past 2029.
3. **Ticker resolution, not access, is the binding constraint.** Only 0.6% of
   Reddit comments carry a cashtag while 39 of 51 common English words are real
   tickers. The one source with free, exact, author-declared resolution
   (StockTwits) is contractually closed.
4. **The expensive problem is licence, not data.** Private journal use is nearly
   free; public display of derived market analytics starts at $499/mo confirmed.
   **This blocks the already-designed public market-scans product** — see
   [`13-open-questions.md`](13-open-questions.md) §1. The recommended fix costs
   nothing: put it behind Cloudflare Access, as the journal already is.
5. **Tradestie's `sentiment_score` is a static per-ticker constant** — zero
   within-ticker variation across 480 tickers over 5.4 years, while the docs
   claim a 15-minute recompute. Using it would have injected silent look-ahead
   bias into everything downstream.

## Ground rules used

- **No accounts created, no credentials entered, no money spent.** Public docs,
  pricing pages, and unauthenticated endpoints only. Everything needing a human
  is in the morning checklist.
- **Measured beats documented.** Where an endpoint could be hit, it was hit —
  and the docs were wrong often enough to justify the rule. Measurements are
  tagged `[M]`, otherwise `[V]` verified on the source's own material, `[R]`
  reported by third parties, `[I]` our inference.
- **Vendor backtests are marketing, not evidence.** "Our AI sentiment beat the
  market" is unfalsifiable and is tagged `[R]` at best.
- **Dead ends are findings.** A source that is paywalled, frozen, NXDOMAIN or
  key-gated gets a line so nobody re-researches it.
- **Contradictions were resolved, not smoothed.** Three cross-track conflicts
  (FINRA, Polygon, StockTwits) got dedicated resolution passes. Two of them
  reversed a track's recommendation.

## A caution about trusting this

Every finding here carries an as-of date of 2026-09-08 and this category moves
fast. More importantly: **the entire first research wave ran without being able
to read the brief** — a concurrent session switched the shared checkout's branch
mid-run. Those tracks were written from their task prompts, which carried the
constraints faithfully, but they were not written against the full contract.
[`13-open-questions.md`](13-open-questions.md) records this and every other
incident affecting how much to trust a given track.
