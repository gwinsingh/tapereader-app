# Build Plan — what it would actually take

**Written 2026-09-01** · **Persona:** engineer (`00-method.md` §2) · **Audience:** the one
person who will have to do this, with heavy AI assistance and no team.

Confidence tags per `00-method.md`: `[V]` verified on a primary source · `[R]` reported by
a third party · `[I]` our inference. Every price and platform limit carries an as-of date
of **2026-09-01** and must be re-verified before it drives a spend decision.

**Source files this rests on, so a reader can verify anything here:**
`vendors/_theme-data-integration.md` (the engineering core — architecture, licensing,
effort table), `vendors/_theme-business-model.md` (ARPU, churn, affiliate structure),
`03-gap-analysis.md` (Part A audit, Part B gap list), `02-feature-matrix.md` (what the
category ships), `vendors/_theme-red-team.md` (what does not survive scrutiny),
`docs/market-scans/phase-1-spec.md` (the D1 `market_db` design already planned),
`CLAUDE.md` (current stack).

---

## 0. The one thing to hold in your head

**There are two products in this document and they differ by roughly an order of
magnitude.**

| | **Scope A — Dogfood** | **Scope B — Sellable v1** |
|---|---|---|
| Users | 1 (the author) | multi-tenant, paying |
| Store | Google Sheet stays the system of record | Sheets is **deleted** |
| Effort | **17–28.5 person-weeks**, and a **7–12 pw slice gets most of the value** | **56–81 person-weeks** |
| Calendar, one person @ 30 h/wk | ~4–6 months for all of it; **~2 months for the useful slice** | **18–24 months**, honestly |
| Fixed cash cost before user 1 | **$0** | **$2.4k–$30k/yr** market-data licence, due in month 1 |
| Failure mode | you get bored | you breach a contract or ship wrong numbers |
| Abandonable? | Yes, at any commit | Only at the gates in §8 |

Everything below keeps these separate. Blurring them is the single most common way this
decision gets made badly, because Scope A's items look like a subset of Scope B's and
**they are not** — Scope A deliberately keeps a single-tenant Google Sheet that Scope B
must remove before its first external signup.

---

## 1. Scope A — Dogfood-only

### 1.1 Premise

Build the high-value features from `03-gap-analysis.md` §B.3 **into the journal that
exists**, for one user, with no auth story beyond "lock the door", no billing, no broker
sync, no multi-tenancy, and no market-data licence — because §3.2 of
`_theme-business-model.md` only bites *"the moment you have a second user"* `[V]`.

Everything in §B.3 is arithmetic over columns already in the sheet or over 1-minute bars
already fetched. **The maths exists and is already exercised against real trading.**

### 1.2 What stays on Sheets, and what must move

| Concern | Decision | Why |
|---|---|---|
| **System of record** (trades, plan, config) | **Stays on Sheets** | It is the trader's own file — the one architectural property the whole category lacks (`01-landscape.md` §3, empty space 4). The 18 manual columns are typed *there*, and the inverted header colouring is a real editing affordance. Moving it buys nothing at n=1. |
| **Per-request analytics** | **Moves to D1**, precomputed nightly | Today every stats call is a full `A:CG` read plus an O(rows) scan in a Cloudflare isolate with a hard CPU limit; **two 503-causing hotspots have already been engineered around** (`etCache`, `buildOpenRangeByDate`) `[V]`. Adding the §B.3 report suite on top of a full-tab scan reintroduces the same wall. Write a nightly job that materialises trades + enrichment into `market_db` (already planned in `docs/market-scans/phase-1-spec.md`) and serve every report from SQL. |
| **1-minute bar windows for charting** | **Moves to R2 or D1**, keyed by trade | A chart cannot re-fetch Polygon on every page view at 5 req/min. Cache `entry−30 min → exit+30 min` once at enrichment: 4,000 trades/yr × ~120 bars × 50 B ≈ **24 MB/yr** `[I]` — trivial. |
| **Enrichment loop** | **Moves off the browser tab** to a GitHub Action hitting a `WRITE_KEY`-protected route | The worst thing in the product today: **65 s per symbol with a tab held open**, ~11 min of foreground work for a 10-symbol backfill, dies if the tab closes, no queue, no resume `[V]` (§7.4). Pages Functions have no cron triggers, so GitHub Actions is the established pattern in this repo. |
| **Screenshots** | **Stays on Drive** for now | The `date\|symbol` collision problem is a multi-user problem. Add in-app upload that writes the conventional filename via the Drive API — that removes the hand-typing without changing the store. |
| **Auth** | **Cloudflare Access or a shared-secret middleware**, this week | Not a feature. 14 edge routes are publicly readable *and writable* on a live domain today (`03-gap-analysis.md` §7.1). |

### 1.3 Scope A effort

Assumptions: **one person, heavy AI assistance, a person-week is 30 focused hours.** AI
roughly halves parser/CRUD/report/plumbing work and barely touches correctness-under-real-data
work — the same split `_theme-data-integration.md` §6.1 applies to Scope B `[I]`.

| Tier | Workstream | pw | Source |
|---|---|---|---|
| **0** | **Auth on the journal routes** + remove the hardcoded spreadsheet ID from the client bundle | **0.5–1** | `03-gap-analysis.md` §7.1–7.2 |
| **0** | **Golden-file test suite** for the grouper, the R math, MFE/MAE, `naIfYoung` | **1–2** | §7.11; `_theme-data-integration.md` §6.4 rates this the single highest-value engineering investment in the whole plan |
| **0** | **Defect fixes**: position flips through zero · chronological streak order · stop comma-splitting Setup/Catalyst in breakdowns · RFC-4180 CSV parse · `# Partials` semantics | **1.5–2** | §B.1(b) |
| **0** | **Commissions & fees** — read the DAS fee column we currently discard; net P&L end-to-end | **0.5–1** | §B.1(b); this one silently invalidates every dollar figure until it lands |
| **Tier 0 subtotal** | | **3.5–6** | |
| **1** | **Market Behavior report group** (11 reports over the 33 enrichment columns we already store) + **Day Type classifier** | **1.5–2.5** | §B.3.2 — highest insight-per-line-of-code in the study |
| **1** | **Deterministic detector suite** — 11 of TradesViz's 16, ranked by dollar impact, **two-proportion z-test gated at n≥10**, ≤4 cards, variant-scoped suppression | **1.5–2** | §B.3.4 |
| **1** | **Significance + drawdown block** — SQN, K-Ratio, Kelly, P&L std dev, p-value; drawdown over *completed* periods; day-of-week; hold-duration; tag report | **1–2** | §B.3.6 |
| **1** | **Psych → outcome join** — win rate / expectancy by sleep, energy, tension, urge bucket | **0.5–1** | row 6.6, currently ○ |
| **Tier 1 subtotal** | | **4.5–7.5** | |
| **2** | **Lightweight Charts** over bars we already fetch: candles, execution markers, MFE/MAE lines, stop and target lines | **2–3** | §4 below |
| **2** | **Tradervue-style Exit Analysis** — float the last exit group, bounded by prior execution, session close, and risk actually taken | **1–1.5** | §B.3.1 — runs on the existing order-aware walker |
| **2** | **Daily/weekly retro object** + reflection templates + mark-as-reviewed + day-lock | **1–2** | §B.3.6; rows 5.2, 5.4, 12.1 |
| **2** | **In-app screenshot upload** (Drive API, generated filename) | **0.5–1** | row 4.5 |
| **Tier 2 subtotal** | | **4.5–7.5** | |
| **3** | **Missed Trades** from the unmatched plan rows we already compute and discard | **1–1.5** | §B.3.3; row 7.7 — one implementation in the entire study |
| **3** | **Plan-vs-execution reconciliation** + **plan-fill-rate instrumentation** + forecast accuracy by conviction bucket | **1.5–2.5** | §B.4.1; `_theme-red-team.md` §4C.1 says do the fill-rate query *first* |
| **3** | **Rules & Rule Groups per setup** + Sample Sets with the N≥25 norm; upgrades `Process Followed? Y/N` into "which rule broke" | **1–2** | §B.3.5 |
| **3** | **Pre-rated behaviour vocabulary** (Edgewonk's valence-while-calm mechanism) + Efficiency % + a discipline **time series** | **1–1.5** | §B.3.3; §B.4.2 |
| **Tier 3 subtotal** | | **4.5–7.5** | |
| **Scope A total** | | **17–28.5 pw** | ~4.5–7 months for one person at 30 h/wk |

**Nobody should build all of it.** The honest recommendation is **Tier 0 plus three items
from Tier 1 — roughly 7–12 person-weeks, ~2–3 months calendar** — which fixes the numbers,
locks the door, and turns 33 dead enrichment columns into reports. Everything after that
is optional and independently abandonable.

**Two ordering constraints that are not negotiable** `[I]`:

1. **Tests before defect fixes.** Fixing the flip logic without golden files is how you
   introduce a second flip bug.
2. **The plan-fill-rate query before any Tier 3 work.** It is ~30 lines against a sheet we
   already own, and `_theme-red-team.md` rates the assumption it tests as the thesis's
   single point of failure — *"a trader will author a per-symbol MTF pre-market forecast on
   ≥60–70% of trading days, for ≥6 months, without being the author of the software"*,
   **unverified, zero instances found in either direction** `[I]`. Spending 4–7 pw on
   Tier 3 before knowing our own fill rate is building on an unmeasured behaviour.

### 1.4 Scope A run cost

**$0 incremental.** Cloudflare Pages free tier plus the existing free Polygon key plus the
existing Google account. The one thing to watch is the edge CPU wall — see §2.4 — which is
why §1.2 pushes aggregation into SQL rather than adding scans.

---

## 2. Scope B — Sellable v1

### 2.1 What "v1" means here

Deliberately narrow, per `_theme-data-integration.md` §6.1 assumption 3 `[I]`:
**US equities + futures, end-of-day only, one chart type, four ingest paths, web plus a
responsive PWA. No options, no forex, no crypto, no replay simulator, no native mobile.**

Options are the single biggest scope trap in this category — multi-leg construction,
assignment, expiry, spread recognition and Greeks are each a project, every competitor
supports them because the market demands it, and every competitor's complexity problems
trace partly to it. Say no in v1 and mean it.

~**40%** of the existing codebase survives: the grouper's core walk, the R math, MFE/MAE,
ATR/ADR/30mATR enrichment, the calendar, the capture tracker, the plan→trade auto-fill.
**The Sheets data layer and the entire API surface do not.**

### 2.2 Target architecture

| Layer | Choice | Why | Cost |
|---|---|---|---|
| **Tenant relational data** (users, accounts, executions, trades, tags, plans, config) | **Turso (libSQL), database-per-tenant** — Developer $4.99/mo → Scaler $24.92/mo (24 GB, 100 B rows read, 100 M written) `[V]` | HTTP-native driver, so it works from the edge runtime with **no TCP and no connection pooling** — the constraint that eliminates most Postgres options. Unlimited DBs on paid plans makes per-tenant sharding free, which fixes single-threaded serialisation and gives per-user export/delete (GDPR/CCPA) for nothing. Migration from SQLite is near-zero. | see §2.5 |
| **Shared market artefacts** (daily bars, breadth, scan hits, hot per-trade bar windows) | **Cloudflare D1** | Small, read-mostly, already the chosen store in `docs/market-scans/phase-1-spec.md`. Daily bars for a 4,000-name universe × 20 years ≈ **1.2 GB** — fits comfortably. | pennies |
| **1-minute bar store** | **R2 + columnar files, not a database.** Partition `bars/1m/{symbol}/{yyyy-mm}.parquet` | **This is the central storage finding.** 1-min bars for a 4,000-name liquid universe are ≈ **19.5 GB/yr** — they **exceed D1's 10 GB per-database ceiling in under six months** `[V]` limit, `[I]` arithmetic. R2 is $0.015/GB-mo with **free egress**: 20 GB/yr = **$0.30/mo**. Massive ships daily flat files over an S3-compatible endpoint in **all paid plans** `[V]`, so ingest is a copy, not a 5-req/min crawl. | ~$0.30/mo |
| **Screenshots / annotated rasters** | **R2** | 10,000 users × ~0.3 GB/yr = 3 TB = **$45/mo**, zero egress. Replaces the Drive folder convention, whose `date\|symbol` key **cross-joins two users' charts** the moment there are two users (`03-gap-analysis.md` §7). | $45/mo @ 10k |
| **Compute** | **Workers Paid, $5/mo minimum** | **Non-negotiable at the first paying customer.** Free tier is **10 ms CPU per request** `[V]`; Paid gives 30 s default / 5 min max. 10 ms is not a budget, it is a wall. | $5/mo |
| **Heavy jobs** (nightly ingest, backfill, enrichment) | **GitHub Actions or Cloudflare Queues → `WRITE_KEY`-protected route** | Pages Functions have **no cron triggers** `[V]`. Kills the browser-tab enrichment loop. | ~$0 |
| **Auth** | **Clerk** (50k MRU included; Pro to drop branding) `[V]` | Buying this is correct: every subsequent bug in a hand-rolled version is a data-leak bug. | $25/mo |
| **Billing** | **Stripe** — 2.9% + $0.30; Billing at 0.7% of volume PAYG `[R]` | Category norm; annual-discount and dunning machinery is what actually takes the time. | ~4% of revenue |
| **Caching** | Semantic cache keys (`filter + account + engine_version + suppressions`), per TradesViz's published design `[V]` | `lib/data/cache.ts` is in-memory and **does not survive Cloudflare isolates** — a known-broken dependency (`CLAUDE.md`). Version-bump invalidation beats TTLs. | — |

**Why not D1 for tenant data**, despite it being closest to hand: the 10 GB per-database
ceiling, single-threaded throughput on a shared database, and **50 queries per Worker
invocation** on free `[V]`. **Why not Neon Postgres as the default**, despite the analytics
being materially easier in Postgres: the edge-runtime constraint
(`export const runtime = 'edge'` on every route, per `CLAUDE.md`) rules out TCP drivers,
and the HTTP fallback reintroduces per-query latency that database-per-tenant SQLite
avoids. If we ever leave the edge runtime, revisit immediately `[I]`.

### 2.3 Sheets-as-database dies at ~60 concurrent users — say it plainly

The Google Sheets API allows **300 read + 300 write requests/min per project** and 60 per
user `[V]`. Every stats request today is a full `A:CG` fetch, and a single page load makes
roughly five of them. **The project-wide 300/min ceiling is therefore hit at roughly 60
concurrent users** `[I]` — and that is the *quota* ceiling, before the deeper problems:

- no indexes and no incremental reads — every analytic is an O(rows) scan;
- `values:batchUpdate` with **no transactions and no optimistic concurrency**, so a human
  editing the sheet during an enrichment run can lose data;
- `upsertDailyPlan` does clear-then-rewrite of the entire tab, so **two people saving a
  plan the same morning destroy each other's rows** `[V]` (`google-sheets.ts:2150-2193`);
- sharing a sheet with a second user gives them **raw write access to every row**;
- one Polygon free key at **5 req/min** shared globally — two concurrent enrichment runs
  rate-limit each other into failure.

**This is not a scaling concern to revisit later. It is a rewrite that must precede the
first external signup** `[I]`. Retrofitting tenancy is strictly harder than building with
it, and every week the Sheets layer survives adds to the migration.

### 2.4 The edge-runtime constraints that will bite

| Constraint | Number `[V]` | What it does to you |
|---|---|---|
| Workers CPU, **free** | **10 ms/request** | `computeStats` is an O(rows) scan in an isolate. Two hotspots already engineered around **at single-user scale**. Not survivable at 100 users. |
| Workers CPU, paid | 30 s default, 5 min max | Fine — this is why Paid is mandatory. |
| Workers subrequests | 50/invocation free · 10,000 paid | Per-symbol enrichment fan-out dies on free. |
| Workers memory | **128 MB per isolate, both plans** | Caps how much of a tenant's history can be pulled into memory — **forces aggregation into SQL rather than JS**. |
| D1 free | 500 MB/db · 100k rows written/day · **50 queries per invocation** | 50 queries/invocation kills any per-trade lookup loop; 100k writes/day caps the platform at ~100 CSV uploads/day. |
| D1 paid | **10 GB max per database** · 1,000 queries/invocation · 5 GB storage included then $0.75/GB-mo | The 10 GB ceiling binds on **market data, not user data**. |
| D1 throughput | single-threaded — "1 ms queries → ~1,000 q/s; 100 ms queries → ~10 q/s" | A shared analytics DB serialises. This is the argument for per-tenant Turso. |

**The practical rule:** every analytics feature carries a hidden *"will this fit in an
isolate?"* question. Moving aggregation into SQL early removes most of it; discovering it
late costs a rewrite each time — which has already happened twice at n=1 `[V]`.

### 2.5 Data sizing, per user per year

Assumptions `[I]`: an active day trader, ~100 executions/day × 250 sessions = **25,000
executions/yr** grouping to **~4,000 round trips/yr**. Sanity check: TradesViz's *free*
tier allows 3,000 executions/month `[V]`, so this sits inside their notion of a normal user.

| Dataset | Per user / year |
|---|---|
| Executions (25,000 rows × ~150 B) | **~4 MB** |
| Round trips + ~75 enrichment columns (4,000 × ~600 B) | **~2.5 MB** |
| Cached per-trade 1-min bar windows (4,000 × ~120 bars × 50 B) | **~24 MB** |
| Screenshots (~800 images × 400 KB, assuming 20% of trades get 2) | **~320 MB** |
| **Relational subtotal** | **~10 MB** |
| **Blob subtotal** | **~0.3 GB** |

**User data is tiny.** 10,000 users is ~100 GB relational, which any database handles
without thinking. **The shared 1-minute bar store is ~200× larger than all user data
combined** — which is exactly why it belongs in R2 and not in a database.

---

## 3. Ingest plan — four adapters, not seventy

The category's logo walls are inflated by roughly an order of magnitude and the inflation
is itself a churn engine (`02-feature-matrix.md`, blind spot 3). Verified real auto-syncs:
**TraderSync 73** (31 of them one MetaTrader adapter, ~15 one PropReports adapter) ·
**TradesViz ~70** · **Trademetria 21** · **TradeZella ~13** · **Tradervue 5**, one of which
is a third party's NinjaTrader plugin `[V]`.

**The lesson worth more than any single connector: find the aggregator-shaped source.**

| # | Adapter | Coverage bought | Fill-level? | Cost | Difficulty |
|---|---|---|---|---|---|
| **1** | **Generic execution-level CSV with a saveable column mapper** | DAS, Sterling, Lightspeed, Cobra, SpeedTrader, TradingView exports, and every broker nobody has written a parser for | Yes | $0 | Tedious, high volume. TradesViz proves the shape (`Custom` = one fill per row) and even ships an "convert it in ChatGPT first" escape hatch for the tail `[V]` |
| **2** | **IBKR Flex Web Service** | The largest self-directed active-trader base | **Yes** — Trades / Trade Confirmations sections of a user-configured Flex Query `[V]` | $0 | Medium. Token lifetime is user-configurable **6 hours to 1 year** `[V]`. **Pursue the Third-party Services picklist early** — being named there collapses onboarding from a 10-step walkthrough to two clicks; TradesViz is on it `[V]` |
| **3** | **PropReports** | **~15 US equity prop desks from one adapter** — CenterPoint, T3, Black Eagle, CMEG, Venom, Vortex, Great Point, Chimera, Zimtra `[V]` | **Yes** — `fills` action, 50,000 records/call, 600 req/min `[V]` | $0 | Low. **Highest coverage-per-unit-effort of any US equities route.** This is how TraderSync and TradesViz get their prop logo wall from *two rows* |
| **4** | **SnapTrade** | The retail mass market — Schwab, Fidelity, Robinhood, Webull, eToro, moomoo, Public, Alpaca, Coinbase `[V]` | **Partly** — `Orders` gives `execution_price` + `time_executed` but is **order-level, not fill-level**, and looks back only a few months `[V]` | **$1/connected user/mo (daily) or $2 (real-time)**; free to 5 connected accounts `[V]` | Medium, plus a trap — see below |
| **5** | **ProjectX Gateway** *(only if futures prop is a target)* | The prop firms on the ProjectX/TopstepX stack | **Yes, unambiguously** — `POST /api/Trade/search` returns price, size, `creationTimestamp`, **fees**, side, orderId, P&L, date-ranged `[V]` | $0 | **The single cleanest integration in this entire study. A weekend's work** `[I]` |

**Excluded, with reasons:**

- **Plaid Investments — cannot serve as primary ingest.** `/investments/transactions/get`
  returns *settled* transactions where `date` is "typically the settlement date" and
  `datetime` is optional, present only "when available from institution" `[V]`. A settled
  transaction with no intraday timestamp **cannot be grouped into a round trip, cannot be
  time-of-day bucketed, and cannot be joined to a 1-minute bar.** Usable only as a
  coverage backstop for buy-and-hold accounts — which is exactly how TradesViz frames its
  Jul 2026 adoption ("periodic journal sync, not execution streaming") `[V]`.
- **Akoya — rule out.** No evidence of fill-level data anywhere; products are Transactions
  / Balances / Accounts & Investments / Statements, built for open-banking compliance, not
  trade reconstruction. Pricing is "customized, usage-based" with nothing published, and
  sales-led onboarding is the wrong shape for a one-person team `[V]`/`[I]`.
- **DAS / Sterling / Lightspeed platform APIs — not a product route.** DAS's own API is
  **$100/mo (CMD only) → $500 → $1,500/mo**, requires a valid DAS Trader Pro user **and DAS
  certification** via an application portal, and is an order-entry API `[V]`. You would be
  asking each user to pay $100/mo to export their own fills. Sterling is desktop COM
  automation that cannot be driven from a server `[V]`. **The upgrade path from "DAS CSV"
  is not "DAS API" — it is a mapped CSV importer plus PropReports** `[I]`.

**The SnapTrade trap, stated because nobody solves it.** The backfill path and the ongoing
sync path are **different endpoints with different fidelity**: `Activities` has years of
history but is **updated once daily with no intraday granularity**, while `Orders` has
`time_executed` but "look[s] back only a few months" `[V]`. Any product built on SnapTrade
has users whose first five years of history carry day-resolution timestamps and whose last
three months carry real ones. Neither TraderSync nor TradesViz appears to solve this; it
surfaces in reviews as "zombie trades" and mis-grouped positions `[R]`.

**The economics.** At $1/connected user/month on the daily plan, a $19/mo journal spends
**5%** of revenue on connectivity per connecting user — acceptable. At $2 (real-time)
against a $9/mo price it is **22%** — not. Since the category is EOD anyway (TradesViz
syncs nightly at ~6pm ET `[V]`), **the daily plan is both the correct choice and the cheap
one** `[I]`.

---

## 4. Charting — Lightweight Charts, not Advanced Charts

Three TradingView products, three very different answers. We read the operative licence
agreement rather than the marketing page.

| Product | Licence | Own data? | Paid product OK? | Cost |
|---|---|---|---|---|
| **Widgets** | Proprietary; site policy | No — TradingView's own data and symbols | **No.** Policy: *"we do not permit commercial usage of any of our services or APIs"* `[V]` | Free with branding |
| **Advanced Charts** (ex-Charting Library) | **Free Advanced Charts Agreement v.0626.FAC** — a *signed contract*, not a click-through `[V]` | **You must supply your own** (§2.2) | **No, as written.** §2.4: *"This license is intended for Implementations as a public access service (as a free offering only…) and not for private, personal or internal uses"* `[V]` | $0 licence fee — **but §7.5 sets liquidated damages at USD $50,000 per proven breach** `[V]` |
| **Lightweight Charts** | **Apache 2.0** `[V]` | You supply your own | **Yes, unreservedly** | Free |

### 4.1 The decision

**Ship on Lightweight Charts.** `[I]` It is Apache 2.0, unambiguously commercial-safe, and
the attribution requirement is a chart option (`attributionLogo`) plus a link. It renders
candles, volume, markers, price lines and custom series plugins — which covers **every
overlay a journal needs**: execution markers at fill price, entry/exit arrows, dotted
MFE/MAE lines, dashed stop and target lines. That is precisely the overlay set TradesViz
plots on its *rented* TradingView instance `[V]`.

What it does not give you is 110+ drawing tools and 100+ built-in indicators. For a journal
that is close to irrelevant — **the user is reviewing a chart, not analysing one live** —
and the annotation use case is better served by a stored raster with a drawing layer, which
is TradesViz's own answer (they maintain an entire *second* server-rendered PNG pipeline
purely so drawings persist `[V]`) and which we already half-own via Screenshot Review.

### 4.2 Why not the Advanced Charts route, in one paragraph

§2.4's *"as a free offering only"* is unambiguous on its face. §2.4 additionally grants
TradingView "free, unlimited access to any services… that include an Implementation… in a
manner that permits TradingView to view the Implementation as Client's other clients and
users do" — an **explicit compliance-monitoring right** — and §7.5 prices a breach at
**$50,000**. That is a contract designed to be audited `[V]`/`[I]`. TradesViz gates
interactive TradingView charts at Pro+, i.e. behind a paywall; there are three readings
(a negotiated paid licence, an older agreement version — this one is stamped v.**0626** =
June 2026 — or non-compliance) and none is verifiable from public sources. **Do not infer
permission from a competitor's behaviour.**

**⚠️ Needs written confirmation if the freemium question ever matters:** "free offering"
is not defined in the agreement, so a freemium product whose free tier includes charts may
or may not qualify. Ask platforms@tradingview.com. The answer is free; the downside is
$50,000 per breach.

**The headline correction to a common premise:** renting TradingView removes the
*rendering* cost. It removes **none** of the data cost, because Advanced Charts explicitly
requires you to bring your own feed (§2.2) `[V]`. §5 is the expensive half regardless of
which library wins.

---

## 5. Market data and licensing — the single most important economic fact here

### 5.1 The three uses, priced very differently

- **(a) Internal / analytics** — fetch bars, compute MFE/MAE/ATR, store the *numbers*, never
  show a price series to anyone. Cheapest. This is what our current enrichment does.
- **(b) Display to end users** — render a candlestick chart, or show OHLC values, to a person
  who is not the licence holder. **A distinct, separately-priced right at essentially every
  vendor examined**, and it is what a trade-annotated chart requires.
- **(c) Redistribution** — hand the data onward so a third party can use it independently.
  Almost never included below enterprise.

**A journal that draws a chart is squarely in (b), and (b) is exactly what consumer plans
forbid** `[I]`.

Polygon/Massive's Market Data ToS, verbatim: *"you may not use the Market Data to build an
application intended for use by end users other than you"*, and separately prohibits
"redistribute, display, disseminate… to any third party" — with **no distinction between
real-time, delayed and historical** `[V]`. **Every Polygon individual plan ($0 / $29 / $79 /
$199) becomes unusable the moment there is a second user.**

### 5.2 The display-licence tiers

| Vendor | Consumer plan (no display) | Display-permitted route | Published cost |
|---|---|---|---|
| **Massive (ex-Polygon)** | Basic $0 · Starter $29 · Developer $79 · Advanced $199 — all "individual use only", "non-pros only" `[V]` | **Stocks for Business** | **$2,499/mo.** Add-ons: Cboe EDGX / Nasdaq Basic / Full Market real-time **$1,999/mo each**; **Full Market Delayed (15-min) $499/mo**; IEX $499; NYSE Imbalances $399 `[V]` |
| **Databento** | Usage-based historical · **Standard $199/mo** ("no license fees") `[V]` | **Plus** (adds external distribution rights) | **$1,750/mo** annual contract · Unlimited $4,500/mo. Separately: **Equities Basic bundle $825/mo flat**, zero exchange licence fees, explicitly licensed for distribution, display and non-display — but only NYSE Chicago, NYSE National, IEX, MIAX Pearl `[V]` |
| **Databento `EQUS.MINI`** | Included with any paid sub; historical from 2023-03-28 | Same product — vendor states it is "the only blended offering of US stock market data that supports commercial applications—such as external redistribution and non-display trading—without licensing restrictions", "no per-user fees" `[V]` | Usage-based. Real-time is **top-of-book only**; you build your own 1-min bars. Coverage starts 2023 |
| **Intrinio** | Individual $150/mo — "Personal use only… No redistribution or display" `[V]` | **Startup** tier — "Commercial Use and Display Rights", business-wide licence | **$333/mo rising to $999** `[V]`. **The cheapest published, unambiguous display licence found in this study** `[I]` |
| **Tiingo** | Starter free · Power $30/mo — both "Internal Use Only", "you may not display or share" `[V]` | Contact sales | **Unpriced.** Cheapest-looking vendor, categorically unusable for display |
| **EODHD / Finnhub / Twelve Data** | Personal-use plans from £19.99 / ~$50 / $29 `[V]`/`[R]` | Separate "Startups & Enterprise" pages | **Unpriced, sales-led** `[V]` |
| **Alpaca** | Free (IEX, 15-min delayed) · Algo Trader Plus $99/mo (full SIP) `[V]` | None published | **Unpriced.** Its customer agreement **incorporates the Nasdaq display-services agreement by reference** — i.e. the *user* is the subscriber, not the app. **Assume no until told otherwise** `[I]` |

Underneath all of it sit the exchange fees, which are **vendor-agnostic** — you owe them
regardless of which API you buy through. Cboe DataShop: professional real-time display
**$66–92/subscriber/month**; non-professional **$3.00/subscriber/month** `[V]`. Databento
puts the per-exchange range at **$32 to $20,000+/month**, with Nasdaq's lowest professional
configuration at ~**$2,051/mo** `[V]`, and its CEO stating that "non-display fees alone for
the SIPs run over $100,000 per year" `[V]`.

### 5.3 The finding that reframes the entire product

> Databento, on licensing: *historical (T+1) data does not require a licence*; "anything
> T+1 (24 hours and earlier) **doesn't** require a license", while exchanges "require a
> license for any intraday or delayed data" `[V]`

**Read that carefully: the line is drawn at 24 hours, not at "real-time vs delayed".** A
15-minute delayed feed is *still licensed* — Massive prices it as a $499/mo add-on `[V]`.
T+1 historical is not.

**Implications for a deliberately end-of-day product** `[I]`:

- Every chart we would draw is of a session that **closed yesterday or earlier**. It is
  T+1 historical by construction.
- We therefore **never enter the CTA/UTP subscriber-fee regime**, never need
  professional/non-professional attestation per user, never need exchange approval, and
  never carry a per-user reporting obligation.
- What remains is purely the **vendor's own commercial/display licence** — a **flat monthly
  fee, independent of user count**.
- Our existing architecture already enforces this by accident: Polygon's free tier blocks
  same-day intraday, so `enrichSymbol` caps the fetch window at *yesterday ET*
  (`market-data.ts:881-885`). **What was a free-tier workaround is, viewed correctly, a
  compliance moat. Keep it deliberately.**

This is the **single most important economic fact in this build plan**: an end-of-day-only
journal can enter this market for roughly **$4k–$6k/yr** of data cost instead of **$30k**.

**⚠️ Three points need legal confirmation before any spend** — they are vendor
characterisations of exchange rules, not the rules themselves:

1. **"T+1 needs no licence" is Databento's own blog**, not a CTA/UTP plan document. It is
   consistent with every vendor's pricing structure, but the whole EOD cost argument rests
   on it. Confirm against the plan documents or get it in writing.
2. **Does Databento Standard ($199) permit display in a paid product**, or is Plus ($1,750)
   required? The pricing page attaches "external distribution rights" to Plus while
   `EQUS.MINI` marketing says redistribution is supported "without licensing restrictions".
   Different claims; their intersection is undocumented. **Worth $18,600/year to resolve.**
3. **Alpaca's position on displaying its data to an application's end users** — nothing
   public.

### 5.4 Three ways through the licence gate, in order of preference `[I]`

1. **Start on Intrinio Startup ($333/mo)** or a written Databento Standard clarification
   ($199/mo), and treat Massive Business as the tier you *graduate to*, not the one you
   launch on. Break-even on data alone falls to ~**15–25 users**.
2. **Charge for charts.** Free tier = pure numbers (MFE/MAE, R multiples, calendar)
   computed from data we hold internally, which is **use (a), not (b)**. Paid tier = the
   annotated chart. Not hypothetical: TradesViz already gates interactive charts at Pro+
   `[V]`, and Tradervue gates exit analysis, R-reporting and net P&L at Gold `[V]`.
3. **Databento `EQUS.MINI`** if the "no per-user fees, external redistribution supported"
   language survives legal review — that would make the display right effectively free at
   usage-based historical rates. Its 2023 start date is the constraint.

---

## 6. Effort — Scope B

### 6.1 Assumptions, stated so they can be argued with `[I]`

1. **One person with heavy AI assistance.** AI roughly **halves** the tedious work (parsers,
   CRUD, forms, migrations, billing plumbing, report ports) and **barely touches** the hard
   work (correctness under adversarial real-world data, licensing, third-party auth
   lifecycles, ops).
2. **~40% of the existing codebase survives** (§2.1).
3. **Narrow v1 scope** (§2.1) — no options, no forex, no crypto, no replay, no native mobile.
4. **A person-week is 30 focused hours.**

### 6.2 The estimate

| Workstream | pw | What it covers | Hard or tedious? |
|---|---|---|---|
| **Auth + multi-tenancy** | **6–8** | Clerk/Auth.js, org model, per-tenant DB provisioning, row-level scoping on *every* query, edge session handling, migrating existing single-tenant data | **Hard** — every subsequent bug is a data-leak bug |
| **Storage layer + schema** | **3–4** | Turso-per-tenant + D1 shared + R2, migrations, seed, backup/restore, export/delete | Tedious |
| **Ingest: mapped CSV importer** | **4–5** | RFC-4180 parser (today's `line.split(",")` corrupts any quoted field), saveable column maps, timezone handling, preview + Import-Doctor-style error explanation, idempotent dedup | Tedious, high volume |
| **Ingest: IBKR Flex + PropReports + SnapTrade** | **6–8** | Three adapters, token lifecycle, connection-health UI, retry/backoff queue, the **two-fidelity backfill-vs-sync problem** (§3), per-source dedup keys | **Hard** |
| **Trade engine rewrite** | **6–10** | Position flips through zero, overnight/multi-day carry, contract multipliers, commissions/fees/rebates, split and corporate-action adjustment, correct `# Partials`, chronological streaks | **Hard — highest reputation risk in the list** |
| **Market data pipeline** | **5–7** | Nightly flat-file ingest to R2, universe selection, bar slicing, MFE/MAE at scale, backfill orchestration, preserving the `N/A`-vs-blank invariant | Tedious with hard edges (corporate actions) |
| **Analytics** | **4–6** | Port the existing suite; add exit efficiency, best-exit, EOD-exit counterfactual, multi-timeframe hold; move it all from JS scans to SQL aggregates | Tedious — **the maths already exists** |
| **Charts** | **4–6** | Lightweight Charts + datafeed adapter, execution markers, MFE/MAE and stop/target lines, annotated-raster store with a drawing layer, screenshot upload/paste | Medium |
| **UI / UX** | **8–12** | Dashboard, calendar, trade table + detail, review flow, shared filters, settings, **onboarding** — the part every competitor is bad at ("the instructions are a book" `[V]`) | Tedious, large surface |
| **Billing** | **3–4** | Stripe, plans, feature gating, trials, dunning, proration, tax | Tedious |
| **Mobile** | **3–5** | Responsive PWA. Native is 12+ weeks and the category's flagship rebuild scores **2.9★ on Play** `[V]` — that is the argument against attempting it | Tedious |
| **Ops + trust** | **4–6** | Observability, job monitoring, backups + restore drills, support tooling, status page, ToS/privacy, **market-data licence procurement and compliance** | Hard in the non-code sense |
| **Total** | **56–81 pw** | | |

### 6.3 What "one person with AI" changes about that number

`_theme-data-integration.md` §6.2 gives **7–10 months for two people**, and **14–20 months
for one**, then adds ~25% for what is on no list — landing at **9–12 calendar months for
two**. For **one person at 30 h/week**, the same arithmetic gives **18–24 calendar months**,
and that is the number to plan with `[I]`.

Three things get *worse* with one person, not just slower:

- **No second pair of eyes on the data-leak surface.** Row-level scoping bugs in a
  multi-tenant financial product are the failure that ends the product, and they are
  exactly the class of bug that a solo author with AI assistance is least likely to catch —
  AI writes the query, AI reviews the query.
- **Support is not delegable.** `_theme-business-model.md` estimates one support head per
  ~1,500–3,000 consumer subs `[I]`; broker auth lifecycles (Schwab's 7-day token expiry
  `[V]`, IBKR Flex tokens, silent connection failures noticed three weeks later) are a
  **permanent operating cost, not a project**, and it lands on the same person who is
  supposed to be building.
- **Licence negotiation is on someone else's calendar** and cannot be parallelised away.

One thing gets *better*: **~40% of the codebase and 100% of the analytics maths already
exist and are exercised daily against real trading.** That is the genuine head start, and
it is on the analysis side, not the ingest side.

### 6.4 Genuinely hard vs. merely tedious

**Genuinely hard — does not respond to more hours or better AI:**

1. **Trade construction correctness.** Flips through zero, overnight carry, partials across
   accounts, futures rollovers, splits mid-holding, prop-firm commission structures. Every
   one is a **silent wrong-number bug**, and a journal that shows a wrong P&L has destroyed
   its only asset. TraderSync's Trustpilot record — currency-base bugs corrupting
   commissions unresolved for seven months, "zombie trades", a CSV import scaling trades by
   10× `[R]` — is what this failure mode looks like from the outside, **at a company with
   far more engineers than we would have**.
2. **Broker auth lifecycle** — see §6.3. A permanent operating cost.
3. **Market-data licensing.** Three ambiguities in §5 cannot be resolved by reading. Getting
   one wrong is not a bug, it is a contract breach — and in TradingView's case a
   contractually stipulated **$50,000 per proven breach** `[V]`.
4. **The economics below ~200 users.** A fixed data licence against near-zero revenue is a
   business problem engineering can only mitigate (§5.4).
5. **Onboarding a user's history without silently corrupting it** — the two-fidelity
   backfill problem (§3), which appears unsolved by the incumbents.

**Merely tedious — real work, bounded and predictable, and where AI genuinely pays:** CSV
parsers and column mappers, the UI surface area, Stripe plumbing, migrations, SEO landing
pages, **the analytics port** (the formulas exist and are already validated against our own
trading), the Lightweight Charts integration.

### 6.5 Where the schedule risk actually lives `[I]`

1. **The trade engine's long tail.** Not week 4 — **months 6–18**, arriving one furious
   support ticket at a time from a user whose numbers do not match their broker.
   **Mitigation: write the test suite first.** There is currently **no test file anywhere**
   under `web/lib/trade-journal/` for exactly the code most worth pinning. Golden-file
   tests against real exports from every supported broker are the single highest-value
   engineering investment in this plan.
2. **Market-data licence negotiation.** Sales-led and unpriced at four of eight vendors, and
   **on someone else's calendar**. **Start it in week 1, before writing a line of ingest
   code** — the answer decides whether the product is viable at the price point.
3. **The edge-runtime tax.** Two CPU-limit rewrites have already happened at n=1. Move
   aggregation into SQL early or pay for it repeatedly.
4. **Multi-tenancy retrofit.** Strictly harder than building with it. The Sheets layer must
   go **before** the first external user.
5. **Scope creep into options.** Each of multi-leg construction, assignment, expiry, spread
   recognition and Greeks is a project.

---

## 7. Run cost and where gross margin lands

### 7.1 Assumptions `[I]`

- **EOD product**; charts are T+1 historical only; no real-time quotes anywhere in the UI.
- **Market data is fetched once per symbol-day globally, not per user** — so vendor cost is
  **fixed, not per-user**. This is the single most important cost property of the design.
- ~4,000-name liquid universe (price ≥ $1, dollar volume ≥ $5M — the definition already
  used in `docs/market-scans/phase-1-spec.md`), nightly ingest via bulk flat files rather
  than per-symbol REST. Massive includes daily flat files (S3-compatible, compressed CSV)
  in **all paid plans** `[V]`, which removes the 5-req/min pagination pain entirely.
- **Blended realized ARPU $26/mo**, the midpoint of the **$24–30** range
  `_theme-business-model.md` §2.2 derives from a $29–30 modal list price after 20–30%
  annual discounting `[I]`.
- ~60% of users connect a broker via SnapTrade.

### 7.2 Monthly cost to serve

| | 100 users | 1,000 users | 10,000 users |
|---|---|---|---|
| Market data — **optimistic** (Intrinio Startup, display rights) | $333 | $333–999 | $999 |
| Market data — **pessimistic** (Massive Stocks for Business) | $2,499 | $2,499 | $2,499 |
| Broker sync (SnapTrade daily, $1/connected user, 60% connect) | $60 | $600 | $6,000¹ |
| Cloudflare (Workers Paid $5 + D1 + R2) | ~$8 | ~$60 | ~$400 |
| Auth (Clerk) | $25 | $25 | $25 |
| Stripe (2.9% + $0.30) | ~$105 | ~$1,054 | ~$10,540 |
| **Total, optimistic** | **~$531** | **~$2,072** | **~$17,964** |
| **Total, pessimistic** | **~$2,697** | **~$4,238** | **~$19,464** |
| **Revenue @ $26 ARPU** | **$2,600** | **$26,000** | **$260,000** |
| **Infrastructure gross margin, optimistic** | **80%** | **92%** | **93%** |
| **Infrastructure gross margin, pessimistic** | **−4%** | **84%** | **92%** |

¹ SnapTrade publishes volume discounts on its Custom plan `[V]`; $6,000 is undiscounted list.

**Read the pessimistic row at 100 users.** A **$2,499/mo fixed data licence against
$2,600 of MRR is a negative gross margin.** The licence is not a line item, it is a
**gate**: it sets a minimum viable scale of roughly **150–200 paying users just to cover
data**, before a single hour of labour is paid for — and the cash is due in **month 1,
before subscriber 1**. §5.4 is how you avoid that.

### 7.3 Where gross margin actually lands — the honest walk-down at 1,000 users

The table above is **infrastructure-only gross margin**, and quoting it unqualified would
be the mistake. `_theme-business-model.md` §3.4 costs a fully-loaded subscriber and lands
somewhere very different. Both are correct; they measure different things.

| Layer, at 1,000 users / $26,000 MRR | Monthly cost | Margin remaining |
|---|---:|---:|
| Revenue | — | **100%** |
| − Infrastructure (data, sync, compute, auth, Stripe) | $2,072 – $4,238 | **84–92%** |
| − **Affiliate commission**, 50% of subs sourced via affiliate × 30% recurring | ~$3,900 | **69–77%** |
| − LLM/AI features (metered as "credits" by every vendor that ships them — an explicit admission it is material COGS) `[I]` | ~$1,250 | **64–72%** |
| − Support (~0.5 FTE at this scale, per 1 head / 1,500–3,000 subs) `[I]` | ~$4,000 | **49–57%** |
| **Fully loaded** | | **≈ 53%** |

**This is not a software business's 80–90% gross margin. It is a ~50–55% gross-margin
business** `[V]`/`[I]`, and that single fact reframes everything downstream:

- **Affiliate is structural, not a launch cost.** Tradervue and Edgewonk pay it for the
  customer's **entire lifetime** `[V]`. It is not amortizable CAC; it is a permanent haircut.
- **LTV is $170–215** at 7–10%/month blended churn (11–14 month average life) `[I]`, against
  finance-keyword direct-response CAC of $80–200 — which is why **no vendor in the study
  leads with paid ads**, and why the affiliate model is not a preference in this category
  but the only channel whose economics close.
- **Distribution, not data, is the binding economic constraint** — and
  `_theme-business-model.md` §4.3 finds **no fourth channel** in the evidence beyond
  educator affiliates, comparison-site SEO (funded by the same commissions), community
  partnerships, and prop-firm bundling.

**The number to plan with at 1,000 users is ~53% gross margin, ≈ $13–15k/month of
contribution** — not the 92% the infrastructure table shows.

### 7.4 Scope A run cost, for contrast

**$0.** Cloudflare free tier, the existing free Polygon key (legal, because there is no
second user), the existing Google account. That asymmetry — $0 versus a five-figure annual
licence due before customer one — is most of the decision.

---

## 8. Sequencing — written so it can be abandoned cheaply at each gate

Each stage states **what must be true before it starts** and **what it costs to walk away
after it**. Nothing before Gate 3 commits any cash.

### Stage 0 — Close the door and pin the numbers *(1–2 weeks, Scope A Tier 0)*

**Preconditions:** none.
**Do:** auth on the journal routes; remove the hardcoded spreadsheet ID; golden-file tests
for the grouper and R math; then the defect fixes (flips, streak order, comma-split
breakdowns, RFC-4180, fees).
**Why first:** 14 edge routes are publicly readable *and writable* on a live domain right
now, and every conclusion drawn from the journal is currently gross-of-fees and
double-counted by setup.
**Walk-away cost:** zero — this is pure improvement to a tool in daily use, valuable under
every possible strategy.

### Stage 1 — Turn 33 dead columns into reports *(3–5 weeks, Scope A Tier 1)*

**Preconditions:** Stage 0 tests green.
**Do:** the Market Behavior report group; the z-test-gated detector suite; the significance
and drawdown block; the psych→outcome join. Precompute nightly into D1 rather than scanning
the sheet per request.
**Walk-away cost:** zero, same reason. This is the highest insight-per-line-of-code work in
the study and it is entirely independent of any commercial decision.

### Gate 2 — **Measure the plan-fill rate.** *(half a day)*

**This gate exists because `_theme-red-team.md` says the thesis has a single point of
failure and this query settles it.** Plot distinct dates with a `Daily Plan` row ÷ distinct
trading dates, weekly since 2026-06-23, plus **per-field** fill rate (does Thesis get
skipped while MTF survives? does symbol #4 get skipped?).

- **If day-level psych fill rate is high and per-symbol MTF fill rate is high** → the
  pre-trade work in Scope A Tier 3 is justified. Proceed.
- **If MTF fill collapses** (the red team's expectation) → **build only the day-level half**,
  and drop the forecast-grading wedge from any commercial argument. It is not a small
  adjustment; the wedge *is* that input.

**Do this before writing another line of strategy on top of it.** Cost of the gate: half a
day. Cost of skipping it: 4–7 person-weeks of Tier 3 built on an unmeasured behaviour.

### Stage 3 — The chart, and the review ritual *(4–7 weeks, Scope A Tier 2)*

**Preconditions:** Stages 0–1 done; you still want to use this thing daily.
**Do:** Lightweight Charts over already-fetched bars; Tradervue-style Exit Analysis; the
daily/weekly retro object with templates, mark-as-reviewed and a day-lock; in-app
screenshot upload.
**Why here and not earlier:** the chart is the largest hole in the product (row 4.1) but it
is not where the *wrong numbers* are. Fix truth before fixing pixels.
**Walk-away cost:** zero. Still single-user, still $0/month, still no licence.

### Gate 4 — **The commercial gate. Three questions, all answerable before spending.**

Do not proceed unless all three are answered:

1. **Written confirmation on market-data display rights** — Intrinio Startup at $333/mo, or
   Databento Standard clarified in writing, or Massive Business at $2,499/mo. **Start this
   conversation months before you need it**; it is sales-led and on someone else's calendar.
2. **A distribution answer that is not "build it and they will come."** The evidence is
   unambiguous: a superior product with no audience in this category **does not get
   discovered** — organic search is saturated by commission-funded review sites, the
   YouTube/Discord layer surfaces only what pays it, and the category leader launched with a
   750k-subscriber channel already in hand `[R]`. `_theme-business-model.md` §4.3 finds no
   fourth channel. Name yours, or stop here.
3. **Gate 2's answer**, if the forecast-grading wedge is load-bearing in the pitch.

**Walk-away cost after Gate 4 but before Stage 5: still zero cash**, provided you have not
signed a data contract. This is the last free exit.

### Stage 5 — Multi-tenant foundation *(15–22 pw)*

**Preconditions:** Gate 4 passed and a licence signed or credibly priced.
**Do:** auth + multi-tenancy; the Turso/D1/R2 storage layer; migrate off Sheets **entirely**;
the trade engine rewrite (flips, carry, multipliers, fees, corporate actions) on top of the
Stage-0 golden files.
**Order matters:** tenancy and the trade engine both get strictly harder the later they
land, and the Sheets layer must be gone **before the first external signup** — retrofitting
tenancy is harder than building with it, and Sheets dies at ~60 concurrent users anyway (§2.3).
**Walk-away cost:** the licence commitment plus ~4–6 months. This is where abandonment
starts hurting.

### Stage 6 — Ingest and the market-data pipeline *(15–20 pw)*

**Do, in this order:** mapped CSV importer → **PropReports** (highest coverage per unit
effort) → **IBKR Flex** (largest base; apply for the Third-party Services picklist early,
it is a lead time not a task) → **SnapTrade** (mass market; handle the two-fidelity problem
explicitly) → **ProjectX** only if futures prop is in scope. Nightly flat-file ingest to R2
in parallel.

### Stage 7 — Product surface, billing, ops *(26–39 pw)*

Charts, analytics port to SQL, UI/onboarding, Stripe, responsive PWA, observability,
backups, status page, ToS/privacy. **Onboarding is where every competitor is bad** — "the
instructions are a book" `[V]` and "bounced off the interface in week one" is the most
commonly cited churn reason in the study. It is also the cheapest place to be visibly
better.

---

## 9. The engineer's bottom line

Building this is **not technically hard, and it is not cheap either.** The hard parts are
**attritional** (import correctness, auth lifecycles, support) or **contractual** (data
licensing) rather than algorithmic — which is exactly why TradesViz's own essay names its
moat as *"seven years of accumulated damage"* from broker-format drift `[V]`.

Three things follow, and they are the whole document in three sentences:

1. **A one-person team with AI assistance can reach a sellable v1 in 18–24 months.** What it
   cannot do is out-accumulate seven years of import edge cases — **so the wedge cannot be
   breadth of import coverage**, and everything TapeReader already does that the category
   does not (`03-gap-analysis.md` §8, §B.2) lives on the **analysis** side, not the ingest side.
2. **Scope A costs $0 and 7–12 person-weeks for most of its value, and is correct under every
   strategy** — including "never sell this". Scope B costs 56–81 person-weeks and a
   five-figure annual licence before customer one. Do Scope A first regardless of what you
   decide about Scope B; nothing in it is wasted if you decide not to sell.
3. **The single biggest engineering risk is the trade engine's long tail against zero
   existing test coverage** — silent wrong-number bugs surfacing over months 6–18, in a
   product whose only asset is that its numbers are right. It is also the cheapest risk to
   retire: golden-file tests, written first, in Stage 0, for a tool you already use.
