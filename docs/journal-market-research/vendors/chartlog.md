# Chartlog

**URL:** <https://www.chartlog.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "#1 Journaling and Analytics Software for Traders" `[V]`
**One-line positioning (ours):** A US-equity day-trader journal built by two Bear Bull
Traders members — narrowest asset scope in the category, best-in-class chart-first
trade review, and a product that appears to have stopped shipping around 2022.

Secondary tagline worth keeping, because it is the whole product thesis in five words:
> "Forget about screenshots! See your trades with entries and exits in dynamic charts" `[V]`
> — chartlog.com/lp

## Snapshot

| | |
|---|---|
| Founded / age | 2019, by Adrian Campos and Igor Milivojevic — both members of the **Bear Bull Traders** community, who were independently building trading journals and merged efforts `[R]` (Crunchbase/Tracxn profiles + tradingreviewers.com). Entity is "Chartlog, Inc." `[V]` (site footer). Tracxn lists founding as 2006, which is almost certainly a data error `[I]`. |
| Team size (est.) | **~2 people.** The help center names exactly two authors across all 43 articles — Igor and Adrian `[V]`. No jobs page, no about page, no third name found anywhere. `[I]` |
| Primary asset classes | **US stocks and options only.** No futures, no forex, no crypto — every listed integration is a US equity/options venue `[V]` (integrations page), corroborated `[R]` (rizetrade, trading-journals.com). |
| Primary user segment | US equity **intraday day traders**, specifically the DAS-Trader / prop-desk / Bear Bull Traders cohort. The integration list is the tell: CenterPoint, CMEG, Great Point Capital, Colmex, Takion, Sterling, TradeZero, Guardian, HeldenTrader, Warrior Trading Sim `[V]`. |
| Business model | Pure B2C SaaS subscription, three tiers, 7-day trial. An "Enterprise Pricing" link exists in the footer but 404s `[V]`. Unfunded / bootstrapped `[R]` (Crunchbase). |
| Est. scale (users/revenue) | Marketing claims **"Over 10,000 Traders use Chartlog everyday"** `[V]` (chartlog.com/lp) — self-reported, undated, and a 2021 third-party review said "1,000+ users" `[R]` (tradingreviewers.com, Jan 2021). If ~10k accounts were real *and* paying at a ~$25 blended ARPU that would be ~$3M ARR, which is implausible for a 2-person shop with a frozen changelog; a realistic read is low thousands of paying subs, **~$0.3–1.0M ARR** `[I]`. |

### Staleness signals (this matters more than any single feature)

- Homepage carries a **"New Year Offer — Get up to 55% OFF!"** banner on 2026-09-01 `[V]`.
- The pricing page footer reads **"Copyright © 2020 Chartog, Inc."** — wrong year *and*
  a typo in the company name — while the homepage footer says 2026 `[V]`.
- The **most recent help-center article is dated 2022-03-07** (tastyworks import);
  everything else is 2020–2021 `[V]`.
- The sitemap contains **8 non-integration pages** total. No blog, no changelog, no
  release notes, no about page `[V]`.
- The integrations page lists **21 live** brokers and **110 "Coming Soon"** entries,
  including Bloomberg, BNP Paribas, Credit Suisse (defunct since 2023), Vanguard and
  Zerodha `[V]`. A "coming soon" list four times longer than the shipped list, containing
  a bank that no longer exists, is a roadmap page that was written once and abandoned `[I]`.

**Read:** the product is live and billing, but engineering has effectively stopped.
For our purposes that makes Chartlog a *design reference*, not a competitive threat `[I]`.

## Pricing

As of 2026-09-01, from chartlog.com/pricing `[V]`:

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Lite** | $14.99/mo · $13.49/mo billed yearly (save 10%) | Unlimited trades, unlimited accounts, full journal, calendar + table views, tags, media upload, dynamic charts, drawing tools, indicators, pre/post-market data, **R/R calculation**, **MFE/MAE** | Astonishingly generous floor — MFE/MAE and R/R are *not* paywalled |
| **Standard** | $29.99/mo · $25.49/mo yearly (save 15%) | + Strategy Tracking, Strategy Analysis, **Rules & Rule Groups**, **Sample Sets**, **Performance Forecast**, and 7 Insights reports (Performance Overview, Strategy, Time of Day, Price, Tags, Symbol, Side) | "Most Popular" badge |
| **Pro** | $39.99/mo · $31.99/mo yearly (save 20%) | + 10 more reports (Day of Week, Month of Year, Volume/Quantity, **Tags Combination**, Holding Duration, Sector, Industry, Market Cap, Asset Type, Option Spread) + **Custom Dashboards** and **Custom Reports** | |

- **Free tier / trial:** 7-day free trial, no credit card `[V]`. There is **no free tier**
  today. A 2021 review describes a permanent free plan with 30-day journal history and a
  $19.99/mo Pro tier `[R]` (tradingreviewers.com) — so they **killed the free plan and
  roughly doubled top-tier price** at some point after 2021 `[I]`.
- **Annual discount:** graduated 10% / 15% / 20% by tier — an unusual design that pushes
  the annual commitment hardest at the top `[V]`.
- **Notable paywall lines:** the split is *analytics depth*, never data volume. Trade
  imports and trading accounts are **Unlimited on every tier** `[V]`. Everything a trader
  needs to *record* a trade is in Lite; everything that helps them *cross-tabulate* is
  Standard/Pro. Day-of-week and tag-combination reports — cheap to compute, high perceived
  value — are the Pro hostages `[I]`.

## Feature inventory

### Data in (import / sync)

- **21 live integrations**, of which **17 are manual file upload** and only **4 are
  "Automatic": TD Ameritrade, CMEG, CenterPoint Securities, Great Point Capital** `[V]`.
  Three of those four automatics are **prop/day-trading shops**, which strongly implies a
  back-office/clearing feed arrangement rather than a retail OAuth API `[I]`.
- **The Chartlog Importer** — the single most interesting thing they built. A Windows
  desktop `.exe` (`Chartlog_Importer_Setup_1.1.13.exe`, hosted on Azure blob storage) that
  the trader installs, points at their DAS installation directory, and which then **tails
  DAS Trader Pro's debug log** to push fills to Chartlog in near-real-time `[V]`
  (help.chartlog.com, Adrian Campos, 2021-02-28).
  - The documented install paths include `C:\DAS Trader Pro`, `C:\DASTrader DEMO`,
    `C:\Traders Elite Pro ETFA` (CMEG's DAS skin) and **`C:\Cobra Trading 2`** `[V]` —
    so **Cobra Trading is implicitly supported** even though it never appears on the
    integrations page.
  - Requires the trader to manually enable Debug Logging in DAS, and explicitly
    **cannot backfill**: "Only trades you make after you set the Debug logging will be
    visible for us" `[V]`.
  - Version 1.1.13, Azure-hosted, unsigned binary that triggers the Windows SmartScreen
    warning — and the article walks users through clicking "Run anyway" `[V]`.
- Also supported by manual CSV: DAS Trader Pro (incl. **Replay Mode**), Lightspeed
  (Trader *and* website exports, separately documented), Interactive Brokers, TWS,
  thinkorswim, TradeStation, TradeZero, Webull, E*TRADE, Merrill Edge, tastyworks,
  Sterling Trader, Takion, TEFS, Colmex Pro, Guardian Trading, HeldenTrader, IQ Edge
  (Questrade), Warrior Trading Simulator, and a generic CSV format `[V]`.
- "Uploading Generic Trades" article exists — there is a documented generic CSV shape `[V]`.

### Trade construction & data model

- Position-based model ("positions", not "trades") with **Merging Trades** as an explicit
  user action, and a **"Close Position" feature for DAS** to reconcile positions the
  importer saw open `[V]` (help center).
- **Manual position creation** supported `[V]`.
- **Open-position handling** is documented as its own article — i.e. multi-day/swing
  positions are a known edge case `[V]`.
- **Per-execution commission editing** inside the trade detail `[V]`.
- **Mark all trades as reviewed** bulk action — a review-workflow primitive, not just a
  data primitive `[V]`. This is a small thing that signals they thought about the *ritual*
  of journaling, not just storage `[I]`.

### Core analytics & statistics

- Headline metrics: gross P/L, **profit factor**, win rate %, total positions,
  expectancy, commissions `[V]`.
- **Insights** = a library of named reports, gated by tier (full list under Pricing).
  The Pro-only set is notably the "slice-by-attribute" set: Sector, Industry, Market Cap,
  Holding Duration, Volume/Quantity, Tags Combination, Asset Type, Option Spread `[V]`.
- **Custom Reports + Custom Dashboards** (Pro): user picks the metric, the breakdown
  dimension and the chart type (line/pie/bar), and pins it to a drag-and-drop dashboard
  `[V]` (product/insights, product/dashboard).
- **Maximum Excursion (MFE / MAE)** per position, on **every tier** `[V]`.
- **Risk/Reward engine** with a well-specified definition `[V]` (help, Igor, 2020-09-02):
  - *Planned R/R units* from stop-loss price + profit target + avg entry.
  - *Effective R/R units*, computed from stop price, avg entry and avg exit — and on a
    losing position it **always reports −1.00R by assumption**, regardless of the actual
    loss. That is exactly the pessimistic convention our own bracket counterfactual uses `[I]`.
- Dashboard includes a **"Recent Trading Days" — last 14 days** widget `[V]`.

### Charts & visual review

**This is their differentiator and it is genuinely strong** `[I]`.

- Every position renders on a full interactive chart with entry/exit markers plotted —
  not a screenshot `[V]`. Multiple third-party reviews identify the charting as
  TradingView-based `[R]` (rizetrade, trading-journals.com, bullishbears).
- **100+ indicators & studies**, drawing tools, and **saveable Chart Templates** so a
  trader's preferred study set auto-applies to every reviewed trade `[V]`.
- **Draggable stop and target lines directly on the chart**, with a toolbar toggle to
  hide them `[V]` — the R/R model is *manipulated on the chart*, not typed into a form.
- **Pre- and post-market data** on every tier `[V]`.
- Market data: "all 16 US exchanges", "15+ years of historical data" `[V]`.
- Chart drawings persist per-trade as their own documented feature `[V]`.
- **No trade replay / bar-by-bar playback** `[R]` (rizetrade, 2026-06).

### Journaling, notes & tagging

- **Journal View** is the primary surface: navigation grouped by **Day / Week / Month**,
  a collapsible Overview stats block per grouping, a free-text description per grouping
  (i.e. a *daily* note, distinct from per-trade notes), the chart, the notes editor, and a
  **re-orderable Details card stack** `[V]`.
- **Reusable Journal Templates** — the trader defines their own note skeleton
  (headers/bullets) once and applies it with two clicks on any entry `[V]`.
- **Calendar View** and **Table View with filtering** as alternate lenses `[V]`.
- Free-form **tags** on all tiers; **Tags Report** at Standard, **Tags Combination
  Report** at Pro `[V]`.
- **Media upload** per trade on all tiers `[V]`.

### Psychology / discipline / process

- Weak-to-absent as a *structured* feature. There is no energy/tension/sleep-style
  quantified check-in, no discipline score, no rule-adherence percentage `[I]`.
- What exists is the **daily/weekly/monthly free-text description** in the Journal View
  `[V]`, plus the strategy **Rules & Rule Groups** (below) which is process-adjacent.
- Third-party reviews describe Chartlog as *encouraging* daily subjective entries for
  psychological context `[R]` — that is a convention they teach, not a feature they compute.

### Planning & pre-market

- **Nothing.** There is no pre-market plan, watchlist, thesis capture, or morning
  check-in anywhere in the product, the help center, or the marketing `[V]` (absence
  verified across all 5 product pages + 43 help articles + sitemap).
- This is a **real gap and a notable one**, because TapeReader's Morning Plan → Origin
  auto-fill is precisely this `[I]`.

### Risk & money management

- Per-trade stop/target/R-R (above). Initial Risk $ and Initial Reward $ auto-computed
  from the stop price `[V]`.
- **No position sizing calculator, no daily loss limit, no max-drawdown guard, no
  account-level risk model** found `[V]`.
- **Performance Forecast** (Standard+) is listed in the pricing matrix but never
  explained anywhere in the docs `[V]` — likely a simple expectancy × frequency
  projection `[I]`.

### Playbooks / setups / rules engine

Their second-strongest area, and it is philosophically opinionated `[I]`.

- **Strategies** are first-class objects, not just tags. Each strategy carries:
  - **Strategy Criteria / Rules & Rule Groups** — an explicit checklist split into
    *market conditions* (e.g. "mid-cap", "tech sector", "low short interest",
    "RVOL +20%", "has news"), *entry triggers* (e.g. "only enter if B is above VWAP")
    and *exit triggers* (e.g. "exit at 2R") `[V]`.
  - **Sample Sets** — a named, counted batch of trades taken under one rule set, with the
    explicit teaching that you need **≥25 instances** before drawing conclusions `[V]`.
  - **Strategy Comparison** and **Strategy Rankings** across sets `[V]`.
- The framing is literally the scientific method — hypothesis → experiment → collect
  data → analysis → conclusion `[V]` (help, Adrian Campos, 2021-08-10).
- Trades are assigned to a strategy sample set from the Journal View details panel `[V]`.

### AI & automation

- **None.** No AI features of any kind — no auto-summaries, no chat-with-your-trades,
  no anomaly detection `[V]` (absent from site and docs) `[R]` (rizetrade, 2026).
- In a 2026 market where Trademetria, TradeZella and TradesViz all ship AI, this is the
  clearest evidence the product is frozen `[I]`.

### Reporting, sharing & social

- **Sharing** on every tier `[V]`; third-party review describes sharing individual
  journal entries *with the TradingView chart* to 13+ social platforms `[R]` (bullishbears).
- No verified/attested track-record concept, no public profile, no leaderboard `[I]`.
- Notable that sharing is *not* paywalled — it is their acquisition loop `[I]`.

### Mobile, integrations & platform

- **Web only. No mobile app, no PWA mentioned** `[R]` (rizetrade, 2026-06;
  tradingreviewers, 2021 — consistent across a 5-year gap).
- Windows-only desktop importer (the `.exe` above) `[V]`.
- **No public REST API** `[V]` (nothing in sitemap or docs).
- Help center runs on Intercom (`help.chartlog.com`, "We run on Fin") `[V]`.
- Support: business hours only, live chat `[R]` (bullishbears, rizetrade).
- Distribution is community-led: endorsement quotes from **Andrew Aziz
  (BearBullTraders)**, **Max Madaz (MadazMoney)** and **Ed Martin (AverageJoeTrader)** are
  the entire social-proof section `[V]`, plus a co-hosted BBT "How to use Chartlog"
  webinar `[R]`. A "Free Course" nav item and a "[FREE WEBINAR]" banner run permanently `[V]`.

## What they do genuinely well

1. **Chart-first review as the default, not an attachment.** "Forget about screenshots"
   is a real product decision. Auto-rendered charts with entry/exit markers, saved study
   templates, persisted drawings and draggable R/R lines mean review costs the trader
   near-zero setup time per trade `[V]`. Anything screenshot-based — including our
   Drive-folder Screenshot Review — is structurally more laborious `[I]`.
2. **A rules engine with a testing methodology attached.** Rules & Rule Groups + Sample
   Sets + a documented "take it 25 times before you judge it" norm is the most coherent
   playbook implementation in the segment. Most competitors ship "setups" as a dropdown;
   Chartlog ships a hypothesis-testing loop `[V]`/`[I]`.
3. **A generous floor.** MFE/MAE, R/R, pre/post-market data, unlimited accounts and
   unlimited imports at $14.99 undercuts everyone. The paywall is drawn at *cross-tabulation*,
   not at *data*, which is both fairer and better retention design `[V]`/`[I]`.
4. **The DAS debug-log importer.** Nobody else in the category solved real-time DAS
   ingestion at all. It is ugly (unsigned Windows exe, no backfill) but it is the only
   near-live pipe into the DAS/prop stack that exists `[V]`/`[I]`.
5. **Segment discipline.** They picked US equity day traders and refused to chase
   futures/forex/crypto. That focus is why the UX is clean `[I]`.

## Where they are weak

**Structural (hard for them to fix):**

- **The team is two people and appears to have stopped.** Frozen help center (2022),
  stale banners, a "Coming Soon" list containing Credit Suisse, and zero AI in 2026. Any
  weakness below compounds because nobody is fixing it `[V]`/`[I]`.
- **Asset-class ceiling.** Stocks + options only, and the whole ingest layer, the chart
  data layer and the analytics vocabulary are equity-shaped. Adding futures/forex is not a
  feature, it is a re-platform. Third-party reviews converge on "most traders eventually
  outgrow it" `[R]` (rizetrade, 2026-06).
- **Import is 17-of-21 manual.** They never built a broker-sync layer; they built one
  desktop log-tailer and four back-office feeds. Retail auto-sync (Plaid/SnapTrade-style)
  is a capability they simply do not have `[V]`/`[I]`.
- **No API, no mobile, no export story surfaced.** Nothing to build an ecosystem on `[I]`.

**Product gaps (fixable in principle, but nobody is fixing them):**

- No pre-market planning / watchlist / thesis capture at all `[V]`.
- No structured psychology or discipline metric `[V]`.
- No AI, no trade replay, no backtesting `[R]`.
- No account-level risk management (sizing, daily loss limits, drawdown) `[V]`.
- Pro-tier price ($39.99) now sits at parity with far broader competitors `[R]`.

## What real users say

Caveat: **the Chartlog "review" long-tail is dominated by competitor-owned SEO content**
(rizetrade, trading-journals.com, journalplus, lunefi, tradetanto all publish
"Chartlog alternatives" pages). Treat their negatives as directionally useful but
motivated `[I]`. No Chartlog presence found on Trustpilot, G2 or Capterra; the SourceForge
listing has **0 reviews** `[V]`. Reddit surfaced nothing usable `[V]`.

- **Praise:** "Clean, modern design", easy navigation, "provides a ton of information",
  responsive support `[R]` (tradingreviewers.com, 2021). "The reports and data analytics
  are more useful than the actual journaling" `[R]` (trading-journals.com, 2026).
  TradingView chart quality repeatedly singled out `[R]` (multiple). bullishbears rates it
  **3.9/5** and calls out reasonable pricing vs. competitors `[R]` (2026).
  Endorsements from Andrew Aziz, Max Madaz, Ed Martin `[V]` — vendor-solicited, so weight
  them as distribution evidence, not satisfaction evidence `[I]`.
- **Complaints:** limited broker integrations (10–21 depending on how you count, vs.
  TraderSync's several hundred) `[R]`; no futures/forex/crypto `[R]`; no AI, no replay, no
  backtesting `[R]` (rizetrade, 2026-06); no mobile app `[R]`; business-hours-only support
  `[R]`; "too much detail" for traders who want simple journaling `[R]` (bullishbears);
  Pro-tier features feel over-gated `[R]`.
- **Why people leave:** the dominant churn story is **outgrowing the asset scope** —
  a trader adds futures or forex and has to leave `[R]` (multiple, though competitor-authored).
  Secondary: paying $39.99 for a product that has visibly not shipped in years, once you
  notice `[I]`.

## Engineer's read

- **Ingest architecture is two disconnected things bolted together.** (a) A Windows
  desktop agent tailing a DAS debug log and POSTing fills — cheap to build, horrible to
  support (unsigned binary, install-path discovery, "enable this DAS setting", no
  backfill). (b) Four "Automatic" brokers that are all prop/clearing shops, which almost
  certainly means a nightly back-office file drop, not an API `[I]`. There is **no
  general broker-sync platform** underneath.
- **Chart layer is almost certainly TradingView's Charting Library** (the licensed
  embeddable, not the free widget), fed by their own OHLCV backend. "All 16 US exchanges"
  + "15+ years historical" + pre/post-market implies a paid consolidated-tape vendor
  (Polygon/Nasdaq Basic tier) `[I]`. **This is the real cost center**: intraday history
  for arbitrary symbols/dates at pre/post-market granularity is the expensive part of
  this product, and it is why chart-first review is a moat rather than a weekend feature `[I]`.
- **Analytics are a report engine over one positions table.** Every "Report" in the
  Insights list is `GROUP BY <dimension>` over the same rows — Time of Day, Day of Week,
  Sector, Market Cap, Holding Duration are all one query shape with a different key.
  Custom Reports = exposing the dimension picker to the user. That is why the tier list is
  so long: **the marginal cost of each named report is near zero, and each one is priced
  as if it were a feature** `[I]`. Worth internalizing — it is a pricing lesson, not an
  engineering one.
- **Sector / Industry / Market Cap reports require a reference-data join** (symbol →
  fundamentals), which is why they sit at Pro — it is their only genuinely extra data
  dependency `[I]`.
- **Hard to build:** the chart pipeline (licensed charting lib + historical intraday
  market data + persisted per-trade drawings/templates). Real-time DAS ingest. Nothing
  else here is hard.
- **Easy but tedious:** the 20 named reports, the tier gating, the 21 CSV parsers
  (each broker export is a different shape — this is the eternal tax of the category),
  journal/chart templates, calendar view.

**On our stack specifically:** journal templates, day/week/month grouped notes with a
per-grouping description, mark-as-reviewed, and the report-per-dimension pattern are all
trivial additions — our Google Sheets store already holds every column they'd need, and
the aggregation already runs server-side in `computeStats`. The **chart-first review is
the one thing that is genuinely expensive for us**: we already pay for Polygon intraday
bars for enrichment, so the data is half-solved, but rendering an interactive annotated
chart per trade on Cloudflare edge means shipping a client-side chart lib (lightweight-charts
is the free, self-hostable option) and serving bars from D1/Polygon — a real M–L, not an S `[I]`.

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Auto-rendered annotated chart per trade** (entries/exits plotted on 1m/5m/daily) replacing/augmenting the Drive screenshot flow | Kills the manual screenshot ritual entirely; the single highest-leverage thing Chartlog does. We already fetch Polygon 1-min bars for Max R / MAE — the bars are *already in the request path* | both | **L** |
| **Saved chart templates** — one study set auto-applied to every trade chart | Makes chart review zero-setup; only meaningful once the chart above exists | dogfood | S (after L) |
| **Reusable journal note templates** | Our Notes column is free text. A per-setup note skeleton makes journaling repeatable instead of blank-page | dogfood | S |
| **Draggable stop/target lines on the chart, writing back to R** | We type R into a sheet cell. Setting it *on the chart* is both faster and more accurate | dogfood | M (after L) |
| **"Effective R" convention: losers always count as −1.00R** | Exactly the pessimistic assumption our bracket counterfactual and Profitability Analysis already use — independent validation that this is the right convention, and worth stating explicitly in our UI | dogfood | S (doc only) |
| **Rules & Rule Groups per setup** (market conditions / entry triggers / exit triggers as an explicit checklist) | Turns `Process Followed? Y/N` from one binary into *which specific rule broke*. Directly upgrades our Discipline % into something actionable | both | M |
| **Sample Sets with an N≥25 norm** | Stops us drawing conclusions from 6 trades. A named, counted batch per hypothesis is the missing rigor layer above our Setup column | both | M |
| **Mark-as-reviewed + bulk mark** | A review *workflow* state, separate from data. Cheap; makes the daily ritual finishable | dogfood | S |
| **Day/Week/Month grouped journal with a description per grouping** | We have per-trade notes and a daily plan, but no weekly/monthly retro object. The weekly retro is where the execution-gap number actually gets acted on | dogfood | S |
| **Report-per-dimension as a pricing ladder** (same GROUP BY, 20 names, three tiers) | If we ever sell, this is the cheapest possible value ladder — near-zero marginal engineering per "feature" | commercial | S |
| **Unlimited accounts/imports at the floor tier; paywall cross-tabulation, not data** | Better retention design than volume-gating. Traders churn hard when their data is held hostage | commercial | — |
| **Community-led distribution** (Aziz/BBT, Madaz, AverageJoeTrader endorsements + co-hosted webinars) | A 2-person team reached ~10k claimed users with zero paid acquisition by embedding in one trading education community. This is the realistic GTM for us, not ads | commercial | — |
| **Anti-pattern to avoid: the 110-item "Coming Soon" list** | It reads as abandonment the moment one entry goes stale (Credit Suisse). Ship a short honest list | commercial | — |

## Sources

- [Chartlog — homepage](https://www.chartlog.com/) — accessed 2026-09-01
- [Chartlog — Pricing (full plan comparison matrix)](https://www.chartlog.com/pricing/) — accessed 2026-09-01
- [Chartlog — Integrations (21 live, 110 "coming soon")](https://www.chartlog.com/integrations/) — accessed 2026-09-01
- [Chartlog — Integrations: DAS Trader Pro](https://www.chartlog.com/integrations/das-trader-pro/) — accessed 2026-09-01
- [Chartlog — Product: Journal](https://www.chartlog.com/product/journal/) — accessed 2026-09-01
- [Chartlog — Product: Insights](https://www.chartlog.com/product/insights/) — accessed 2026-09-01
- [Chartlog — Product: Strategies](https://www.chartlog.com/product/strategies/) — accessed 2026-09-01
- [Chartlog — Product: Charts & Market Data](https://www.chartlog.com/product/charts-and-market-data/) — accessed 2026-09-01
- [Chartlog — Product: Dashboard](https://www.chartlog.com/product/dashboard/) — accessed 2026-09-01
- [Chartlog — landing page ("Forget about screenshots", "Over 10,000 Traders")](https://www.chartlog.com/lp) — accessed 2026-09-01
- [Chartlog — sitemap.xml (8 non-integration pages)](https://www.chartlog.com/sitemap.xml) — accessed 2026-09-01
- [Chartlog Help Center — index (2 authors, 43 articles)](http://help.chartlog.com/en/) — accessed 2026-09-01
- [Chartlog Help — Uploading Trades collection (30 articles)](http://help.chartlog.com/en/collections/2307251-uploading-trades) — accessed 2026-09-01
- [Chartlog Help — Journal collection (10 articles)](http://help.chartlog.com/en/collections/2341405-journal) — accessed 2026-09-01
- [Chartlog Help — Getting started with the Chartlog Importer (DAS Trader PRO), Adrian Campos, 2021-02-28](http://help.chartlog.com/en/articles/3985578-getting-started-with-the-chartlog-importer-das-trader-pro) — accessed 2026-09-01
- [Chartlog Help — Enabling Debug Logging in DAS](http://help.chartlog.com/en/articles/3992365-enabling-debug-logging-in-das) — accessed 2026-09-01
- [Chartlog Help — The Journal View, Adrian Campos, 2021-08-17](http://help.chartlog.com/en/articles/5503851-the-journal-view) — accessed 2026-09-01
- [Chartlog Help — Journal Templates, Adrian Campos, 2021-08-17](http://help.chartlog.com/en/articles/5503693-journal-templates) — accessed 2026-09-01
- [Chartlog Help — How to use the Risk / Reward calculation, Igor Milivojevic, 2020-09-02](http://help.chartlog.com/en/articles/4393695-how-to-use-the-risk-reward-calculation) — accessed 2026-09-01
- [Chartlog Help — Tutorial: How to track winning strategies (scientific method, sample sets, N≥25), Adrian Campos, 2021-08-10](http://help.chartlog.com/en/articles/5482668-tutorial-how-to-track-winning-strategies-on-chartog) — accessed 2026-09-01
- [Chartlog Help — How to import trades from tastyworks, 2022-03-07 (newest article found)](http://help.chartlog.com/en/articles/6023966-how-to-import-trades-from-tastyworks) — accessed 2026-09-01
- [Trading Reviewers — Chartlog Review (founders, 2021 pricing incl. former free plan)](https://www.tradingreviewers.com/chartlog-review/) — accessed 2026-09-01
- [Bullish Bears — Chartlog Review 2026 (3.9/5, social sharing, support hours)](https://bullishbears.com/chartlog-review/) — accessed 2026-09-01
- [RizeTrade — Chartlog Review 2026 (broker list, no AI/replay/mobile; competitor-authored)](https://rizetrade.com/chartlog-review) — accessed 2026-09-01
- [SourceForge — Chartlog listing (0 reviews)](https://sourceforge.net/software/product/Chartlog/) — accessed 2026-09-01
- [trading-journals.com — Chartlog Review 2026 (competitor-authored; US-equity focus, TradingView charts)](https://trading-journals.com/reviews/chartlog) — accessed 2026-09-01
- Crunchbase and Tracxn company profiles for Chartlog (unfunded; founders Adrian Campos & Igor Milivojevic) — via search summary, accessed 2026-09-01
</content>
