# Social Market Sentiment — Overnight Research Brief

**Status:** brief written 2026-09-08 · research not started
**Branch:** `social-sentiment-research` · **never commit to `main`**
**Owner:** parent orchestration session (self-paced `/loop`)

> **Read this first if you are picking this up in a new session.** This file is
> the contract for the whole run: what is being answered, what may be touched,
> what "done" means per track, and the rules that keep the output honest.
> It supersedes any assumption you arrive with.

---

## 1. The question

**Can social/crowd sentiment be added to TapeReader in a way that measurably
improves a discretionary intraday breakout trader's decisions, on a budget of
effectively $0 and hard-capped at $10/month?**

Three linked sub-questions, in priority order:

1. **Feasibility & cost.** What crowd-sentiment data is actually obtainable at
   $0 and at ≤$10/mo, from whom, at what resolution, with what history, under
   what terms? What does it cost to run forever on our stack?
2. **Alignment.** How does crowd attention interact specifically with
   **breakouts** — not "sentiment good, stock up", but precise, falsifiable
   hypotheses about follow-through, exhaustion, and pre-market discovery, stated
   as computable metrics against the journal's existing R/MFE/MAE/capture fields.
3. **Accrual.** What must start collecting **tonight** so that in three months
   there is a dataset capable of answering (2) with real trades?

### The budget ladder (explicit deliverable)

Every source and every capability must be placed on this ladder. A table with
"what breaks and what unlocks" at each rung is a required output, not a bonus:

| Rung | Monthly | Question it answers |
|---|---|---|
| **0** | $0 | What can we have tonight with zero signups? |
| **1** | ≤$10 | **The live constraint.** What is the best possible product here? |
| 2 | $25–50 | What is the first thing worth breaking the cap for? |
| 3 | $100–200 | Does anything at this rung change the *category* of what we can do? |
| 4 | $500+ | Institutional tier — named only to show where the ceiling is and prove we are not missing something structural. |

Rungs 2–4 are **research output, not a purchase recommendation.** State the
incremental capability per dollar and stop.

---

## 2. Hard constraints (non-negotiable)

| Constraint | Consequence |
|---|---|
| **No account creation. No credentials entered anywhere.** | Sources are evaluated from public docs, pricing pages, and unauthenticated endpoints. Anything needing a key is researched, spec'd, and built against a stub, then listed in the morning signup checklist (Track K). |
| **No spending.** | Zero purchases, zero trials that require a card, even free ones. |
| **Work in the dedicated worktree, never the main checkout.** | All work happens in `.claude/worktrees/social-sentiment` on branch `social-sentiment-research`. **A second Claude session is active in this repo and switches the main checkout's branch without warning** — that is not hypothetical, it happened at 21:42 on 2026-09-08 and misrouted a commit onto `main`. The worktree is immune. Verify with `git branch --show-current` before every commit. |
| **Branch only, scoped `git add`.** | Only `docs/social-sentiment/**` and new social-collector files. The tree has uncommitted market-scans work — never `git add -A`, never `git add .`, never touch `main`. |
| **Nothing deployed, nothing public.** | tapereader.us is a public site. No page ships tonight. Redistribution rights are a research question (Track H), not an assumption. |
| **Edge runtime.** | Every API route is `export const runtime = 'edge'`. No Node built-ins. Collectors that need Node run in GitHub Actions, not in a route. See `CLAUDE.md`. |
| **Existing patterns are the default.** | Follow `docs/journal-market-research/` for research form and `docs/market-scans/phase-1-spec.md` for spec form. Do not invent new conventions. |

### Evidence discipline

Reuse the confidence tags from `docs/journal-market-research/00-method.md`
verbatim: `[V]` verified on the source's own material · `[R]` reported by third
parties · `[I]` our inference. Every price, rate limit, and history depth gets a
tag and an as-of date. **Measured beats documented** — where an endpoint can be
hit unauthenticated, hit it and record the real response shape, real limits, and
real latency rather than trusting the docs.

The prior research surfaced a real hazard worth restating: this category's
search surface is dominated by vendor-owned content marketing and affiliate
listicles. Sentiment vendors are *worse* than journal vendors here, because
"our AI sentiment score beat the market" is unfalsifiable marketing. Use
listicles only to discover names. Treat every backtest published by a vendor
selling the signal as marketing, tagged `[R]` at best.

---

## 3. What we already have (do not re-derive)

- **Polygon key** — grouped daily aggregates authorized, snapshots and `I:VIX`
  NOT authorized, **5 req/min** measured. `/v2/reference/news` and its
  `insights` sentiment field are **untested — test them early** (Track B).
- **D1 `market_db`** — scaffolded in `web/wrangler.toml` but `database_id` is
  still `TODO_RUN_WRANGLER_D1_CREATE`. **It does not exist yet.** The collector
  must not depend on it. Free tier: 500 MB/db, 100k row writes/day.
- **GitHub Actions** — `.github/workflows/market-ingest.yml` is the working
  pattern for scheduled ingest (Pages has no cron).
- **The journal** — a 96-column Google Sheet per account, order-ladder-derived
  measured risk, `Max R Before Stop`, `MAE (R)`, `Position MFE (R)`,
  `Capture %`, `Origin`, `Conviction`, `Setup`, the Morning Plan tab, and an
  **additive-only migration contract asserted by
  `scripts/review/migration-safety.ts`**. Read that script before proposing a
  single new column.

---

## 4. Track decomposition

Each track produces one file in `docs/social-sentiment/`. Tracks A–C and H can
run in parallel; D depends on A–C; E–G depend on D.

### A — Social platform landscape → `01-sources-social.md`
Per-platform: access method, auth requirement, rate limits, cost, **history
depth**, ticker/cashtag resolution quality, bot contamination, ToS posture.

- **A1 X/Twitter** — API v2 tier structure and current pricing; what the free
  tier actually permits for *reading*; third-party resellers and Apify-style
  actors; cashtag search quality; the ToS position on scraping.
- **A2 Reddit** — official OAuth API limits; the Pushshift succession question
  (what replaced it, is it public); Academic Torrents / arctic-shift historical
  dumps; which subreddits carry breakout-relevant chatter vs meme noise.
- **A3 StockTwits** — public API registration status; unofficial endpoints;
  **the user-declared Bullish/Bearish tag is unusually clean labelled ground
  truth — assess whether it is still exposed and how it can be obtained.**
- **A4 Bluesky / AT Protocol** — likely the strongest keyless option: open
  firehose, full history, no cost. Assess finance-community density honestly —
  a free firehose of nothing is worth nothing.
- **A5 Discord / Telegram** — trading-room chatter; ToS and self-bot risk;
  probably a "no" but must be argued, not assumed.
- **A6 Video** — YouTube Data API (free quota), TikTok finance; low priority,
  timebox it.
- **A7 Derived-sentiment aggregators** — Apewisdom, Tradestie, swaggystocks,
  Quiver Quantitative, StockGeist, Sentiment Investor, Utradea, Finnhub social
  sentiment, EODHD. **Several are keyless and free — those are Rung 0 gold.**
  For each: what is the underlying source, is the methodology disclosed, and is
  it a black box we cannot audit?

### B — News & narrative → `02-sources-news.md`
Where the free, historical, *licensable* data actually lives.
Polygon news `insights` (**test against the live key**), Alpha Vantage
`NEWS_SENTIMENT` (free tier, ticker-scoped, has history — verify), GDELT
(free, tone-scored, deep history), Marketaux, Finnhub, Alpaca, Benzinga,
StockNewsAPI. Assess **catalyst classification** quality — a breakout trader
cares *why* a stock is in play, and the journal already has a `Catalyst` column
with `CATALYST_OPTIONS`. Auto-populating it is a concrete win; evaluate it.

### C — Retail-flow & positioning proxies → `03-sources-flow.md`
Crowd positioning that is not words: FINRA short interest (free), Google Trends,
**Wikipedia pageviews (free, full history, real academic pedigree)**, CBOE
options volume, Fintel, unusual-whales-class vendors, exchange short-volume
files. For each, the honest question: is this *sentiment* or is it just
another price-derived series we already have?

### D — Signal design for breakouts → `04-signal-design.md` **← the intellectual core**

Raw mention counts are worthless (AAPL always wins). This track defines
**normalized, computable metrics** and **falsifiable hypotheses**.

Metric family to define precisely (formula, window, edge cases, N/A rules):
mention count · **z-score vs own 20/60d baseline** · percentile rank within the
liquid universe · velocity (Δ/hr) and acceleration · polarity (bull:bear) ·
unanimity/dispersion · **author diversity** (unique authors ÷ posts — the
bot/pump detector) · novelty (sessions since last threshold cross) ·
**attention-per-dollar-volume** (separates genuine retail discovery from
institutional flow).

Hypotheses, each stated so it can be *rejected*:
- **H1 Fuel** — breakouts with rising attention velocity show higher
  `Position MFE (R)` and `Capture %`.
- **H2 Crowded/late** — breakouts already at extreme attention percentile have
  *lower* expectancy; attention extreme is a fade, not a confirmation.
- **H3 Fresh discovery** — activation from a near-zero baseline precedes the
  multi-day runs the movers scan is meant to catch.
- **H4 Wall of worry** — price breaking out *against* negative polarity shows
  better continuation than consensus-bullish breakouts.
- **H5 Overnight attention delta** — 16:00→09:15 ET mention delta predicts next-day
  gap and RVOL. **This is the one that feeds the Morning Plan directly.**
- **H6 Regime filter** — market-wide social bullishness as a breadth-adjacent
  macro filter on whether breakouts work *at all* today. Composes with
  `docs/market-scans/phase-1-spec.md`.

Also required: **snapshot cadence design.** Intraday resolution is ideal and
expensive. Argue for a specific free cadence (candidate: prior close, 09:15 ET
pre-market cut, midday, EOD) that captures *attention state at setup time*,
which is what a morning-plan filter actually needs.

Name the traps explicitly: look-ahead bias from post-hoc-scored vendor data,
deleted-post survivorship, coordinated pump farms, cashtag collision
(`$ANY` ticker that is also a word), and the fact that most public sentiment
scores are computed after the fact and cannot be replayed.

### D2 — Analysis pre-registration → `05-preregistration.md`
**Guard against p-hacking his own journal.** Before any data exists: fix the
bucket definitions, the primary outcome variable, the minimum N per bucket, the
multiple-comparison discipline, and the stopping rule. Include a **power
analysis** — given the journal's current trade count and realistic accrual, how
many months until H1–H5 are answerable at a given effect size? An honest
"you cannot know before March" is a valuable finding.

### E — Journal integration spec → `06-journal-integration.md`
Proposed sheet columns following existing convention (`N/A` semantics,
`DAY_FILL_COLS` / `PLAN_FILL_COLS` fill-if-blank patterns, additive-only append
past the last column). Must be checked against `scripts/review/migration-safety.ts`
in principle. Plus: what the Morning Plan form gains (an attention-ranked
pre-market panel), and how enrichment attaches a snapshot to a trade by
`date|symbol` the way screenshots already do.

### F — Product surface → `07-product-surface.md`
Where this lives on tapereader.us. It must **compose with, not conflict with**,
the planned `/market` breadth and `/scans` pages. Storage budget math against
D1's 500 MB cap: tickers × days × metrics. Recommend a home.

### G — Cost ladder → `08-cost-ladder.md`
The §1 table, filled in with evidence. The headline answer to "what does a
bigger budget buy me."

### H — Legal, ToS & redistribution → `09-legal-tos.md`
Scraping posture per platform, commercial-use terms, **redistribution rights on
a public site** (this is the one that can kill a source), retention limits,
attribution requirements.

### I — Build plan → `10-build-plan.md`
Edge constraints, GitHub Actions collector, schema, idempotent ingest log,
backfill pacing, secret handling. Concrete enough to execute.

### J — Red team → `11-red-team.md`
**Required, and it must be written by an agent instructed to kill the idea.**
The strongest honest case that crowd sentiment is noise for a discretionary
intraday breakout trader: alpha decay in published social-sentiment factors,
why retail sentiment products are entertainment, the base-rate problem, and the
scenario where three months of collection yields nothing. Mirrors
`vendors/_theme-red-team.md` in the prior research.

### K — Morning signup checklist → `12-signup-checklist.md`
Ranked, time-estimated, cost-annotated list of accounts to create, in
dependency order, with exactly what each unlocks and where the key goes.
**This is the first thing read in the morning — make it stand alone.**

---

## 5. The collector (build deliverable)

Because history is the scarce resource, **collection starts before the research
finishes.** Priority order within the night:

1. **Night zero, keyless.** Stand up a collector against sources needing no
   account whatsoever (candidates to verify: Apewisdom, Tradestie, Wikipedia
   pageviews, Bluesky public read, GDELT, StockTwits unofficial). Even a thin
   daily snapshot beats a gap in the series.
2. **Storage: NDJSON snapshots committed by GitHub Actions**, under a dated
   path — *not* D1. Rationale: `market_db` does not exist yet, D1 free tier caps
   row writes, and a git-committed snapshot is free, permanently historical,
   trivially auditable, and imports into D1 later in one pass. Revisit only if
   the research finds a reason.
3. **Adapter shape** — one module per source behind a common interface so a
   keyed source drops in unchanged once a key exists.
4. **Idempotent + resumable**, following the `ingest_log` discipline from
   market-scans.
5. **Must not run on a schedule until reviewed.** Build it, test it by hand,
   leave the workflow's cron commented out with a one-line note. Turning it on
   is a morning decision, not a 3am one.

---

## 6. Working rules for the night

- **Commit per completed track**, imperative message, scoped paths, ending
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Parallelize research, serialize writes.** Fan out agents per track; one
  writer per file.
- **A track is done when it has an as-of date, tagged claims, and a stated
  recommendation** — not when it has a lot of words. Length is not the goal.
- **Record dead ends.** A source that turned out to be paywalled, dead, or
  key-gated is a finding; write the one-liner so nobody re-researches it.
- **If a track is blocked, move on and log it in `13-open-questions.md`.** Never
  stall the night waiting on one source.
- **Final pass:** `README.md` (read-in-this-order index, short version at top)
  and a self-contained `report/index.html`, matching the prior research's form.

## 7. Definition of done

By morning: a signup checklist that stands alone, a cost ladder with the ≤$10
answer argued, a signal-design doc with hypotheses precise enough to reject, a
pre-registration that stops the analysis from being fooled, a red-team doc that
took the other side seriously, and a keyless collector that runs when told to.
