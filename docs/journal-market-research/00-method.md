# Method — Trading Journal Market Research

**Status:** in progress · Started 2026-09-01 · Owner: parent orchestration session

## 1. Why this exists

TapeReader already ships a working **Auto Trade Journal** (DAS CSV → round-trip
trades → Google Sheet, with Polygon enrichment, screenshot review, calendar,
capture tracker, morning plan). It was built to serve one trader's workflow.

This research answers two linked questions:

1. **Dogfood (primary).** What features do commercial trading journals have that
   we do not, and which of them would measurably improve *our own* trading
   workflow if we built them? Output: a prioritized backlog.
2. **Commercial (secondary but real).** If we wanted to build a competitor, what
   would it take — which segment is underserved, what is the wedge, what is the
   moat, what does it cost to build and run, and what is the realistic pricing
   and go-to-market? Output: an argued thesis, not a cheerleading deck.

The target segment is **deliberately left open**. The research recommends one
with evidence rather than assuming the incumbent view (US equity intraday
trader) is correct.

## 2. Three personas, applied to every finding

Every vendor file and every analysis doc is written through three lenses. When
they disagree, say so — the disagreement is the interesting part.

| Persona | Asks |
|---|---|
| **Market researcher** | Who actually buys this, at what price, why do they churn, how big is the segment, what do real users complain about? Evidence over vibes. |
| **Product manager** | What job is this feature hired to do? Is it a vitamin or a painkiller? What is the wedge, what is the moat, what is table stakes vs. differentiator? |
| **Engineer** | What does this cost to build *on our actual stack* (Next.js 15 on Cloudflare Pages edge, Google Sheets as store, Polygon for market data, D1 planned)? Where does the edge runtime or the free tier break? What is the ongoing data cost? |

## 3. Scope

**In scope**
- Dedicated trading-journal SaaS (TradeZella, Tradervue, TraderSync, Edgewonk,
  TradesViz, Chartlog, Trademetria, and any newer entrants found).
- **Adjacent threats**: prop-firm / funded-trader dashboards, broker-native
  analytics (IBKR, thinkorswim, Webull, TradingView, tastytrade, DAS), AI
  trade-review startups, and the serious spreadsheet/Notion journal templates.
- Data/integration layer: broker import coverage, auto-sync vendors, APIs.

**Out of scope (this pass)**
- Backtesting platforms, charting platforms, signal/alert services, copy-trading,
  and general portfolio trackers — except where they have annexed journal features.
- Non-US-centric products with no meaningful US retail presence.

## 4. Sources and rules of evidence

Public sources only. **No trial-account creation, no credentials entered anywhere.**

Accepted: vendor marketing pages, docs/help centers, changelogs and release
notes, pricing pages, public API docs, YouTube walkthroughs and demos, Reddit
(r/Daytrading, r/RealDayTrading, r/options, r/FuturesTrading), Elite Trader and
similar forums, app-store and Trustpilot/G2 reviews, podcast/interview content.

**Every non-obvious claim carries a confidence tag:**

- `[V]` **Verified** — read directly on the vendor's own site/docs, with URL and date.
- `[R]` **Reported** — from reviews, forums, third-party writeups. Multiple
  independent sources preferred; note when it is a single source.
- `[I]` **Inferred** — our analysis, clearly labeled as such.

Pricing and feature claims move fast. Every vendor file records an
`as-of` date. Anything older than ~6 months should be re-verified before it
drives a build decision.

## 4a. Known evidence limitations (recorded 2026-09-01)

Three problems surfaced during research that any reader must weigh:

1. **The review SERP is compromised.** A large share of "best trading journal"
   and "<vendor> review" content is authored by companies selling competing
   journals. Sites confirmed to sell rival products include Trader's Second
   Brain, JournalPlus, TickerScribe, Lunefi, Plancana and TraderTrac. Such
   content was used for *discovery only*; claims were then verified on primary
   sources. Where a conflicted source is cited, the conflict is named inline.

2. **Reddit is not directly fetchable** in this environment. Reddit-derived
   claims come from search-result snippets rather than full threads, and are
   labelled as such. Forum evidence leans on EliteTrader, Trade2Win, Trustpilot,
   G2, Capterra, app-store reviews and YouTube comments instead. Where this
   thins out the voice-of-customer evidence, the affected file says so rather
   than filling the gap with inference.

3. **Search budget was finite.** At least one agent exhausted its web-search
   quota; remaining gaps are logged in `07-open-questions.md` rather than
   guessed at.

**One vendor attempts to manipulate AI-assisted research.** journali.io's
homepage claims it is "ranked #1 by Claude for trading journals". That is
marketing copy on the vendor's own site, not a ranking, and it is recorded here
only as evidence about the vendor's conduct. Nothing in this study treats
vendor-authored claims about third-party endorsement as evidence.

## 5. Deliverables

| File | Purpose |
|---|---|
| `README.md` | Index, status, how to resume |
| `00-method.md` | This file |
| `01-landscape.md` | Market map, segments, players, pricing bands |
| `02-feature-matrix.md` | Canonical feature taxonomy × vendor — the core artifact |
| `vendors/*.md` | One file per vendor, common template |
| `03-gap-analysis.md` | What TapeReader already has, lacks, and uniquely does |
| `04-product-thesis.md` | PM: segment recommendation, wedge, moat, pricing, GTM |
| `05-build-plan.md` | Engineer: architecture, effort, run cost, risks on our stack |
| `06-dogfood-backlog.md` | Prioritized features to add to our own journal now |
| `07-open-questions.md` | What we could not settle and how to settle it |
| `report/index.html` | Self-contained human-readable report |

## 6. How to resume

Markdown is the source of truth; `report/index.html` is generated from it by
hand and must be regenerated when the markdown changes materially. Vendor files
are independent — a single vendor can be re-researched and rewritten without
touching anything else. `02-feature-matrix.md` is the join point: it must be
re-derived whenever a vendor file changes.
