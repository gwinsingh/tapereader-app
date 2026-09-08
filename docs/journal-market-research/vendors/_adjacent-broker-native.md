# Adjacency: Broker-Native & Platform-Native Journal / Analytics

**As of:** 2026-09-01 · **Tier:** adjacent (structural threat, not a vendor)
**Question:** how much of the trading-journal job-to-be-done is already free inside
the tools traders must use anyway — and what is genuinely left over?

**Method note.** Public sources only; no accounts created, no credentials entered
(per `00-method.md` §4). Interactive Brokers' own `interactivebrokers.*` pages
return HTTP 403 to automated fetches, so IBKR claims lean on `ibkrguides.com`
(which is fetchable and is IBKR's own documentation host) plus third-party
reviews — tagged accordingly. Where the only available source is a journal
vendor's own "why our product beats your broker" page, the claim is tagged `[R]`
and flagged as **vendor-biased**: those pages have a direct incentive to
understate native tooling, and in at least one case (NinjaTrader) they
demonstrably do.

---

## 0. TL;DR for the impatient

| Claim | Confidence |
|---|---|
| Every platform surveyed can emit fills as CSV for free. "Where are my trades" is a solved, unpaid problem. | `[V]` |
| IBKR's free portfolio analytics are **better** than any journal vendor's portfolio analytics — and irrelevant to intraday trade review. | `[V]`/`[I]` |
| NinjaTrader ships a free per-trade journal **with MAE/MFE and entry/exit efficiency**. Journal vendors selling "MFE analysis" to futures traders are selling them something they already own. | `[V]` |
| TradingView has every ingredient for a journal and has not assembled one. As of 2026-09 there is no native TradingView journal. | `[V]` |
| DAS Trader / Sterling emit **executions, not trades** — no date column, no P&L, no commissions, no API, schema varies by window. This is why TapeReader's journal exists. | `[V]` |
| What no broker serves, structurally: setup/thesis/conviction tagging, screenshots, psych state, plan-vs-execution, market-context enrichment, cross-broker aggregation at fill level. | `[I]` |

---

## 1. Interactive Brokers — PortfolioAnalyst and reporting

**The historical read (strong on portfolio, weak on intraday trade review) is
correct, and the gap is structural rather than incidental.** `[I]`

### What exists

- **PortfolioAnalyst is free**, delivered through Client Portal; IBKR has also
  opened it to non-IBKR users who link external accounts, so it functions as a
  standalone aggregator. `[R]` (BrokerChooser; IBKR marketing copy surfaced via
  search — IBKR's own page blocked automated fetch)
- Up to **35 performance and measurement factors**, including time-period
  performance statistics, **performance attribution vs. benchmark**, projected
  income, and risk measures **including Value at Risk**. `[R]`
- Named risk/ratio metrics: **Max Drawdown, Sortino, Sharpe, Calmar, Alpha,
  Beta, Positive Periods, Negative Periods**. `[R]` (BrokerChooser)
- Account-level detail: deposits/withdrawals, interest, fees, dividends,
  corporate actions, plus a **daily trade summary** per account. `[R]`
- Report tiers: snapshot / detailed / custom, plus scheduled delivery and PDF
  output. `[R]`
- **CSV export is capped at one year per file.** `[R]` (single source — re-verify
  before it drives a build decision)

### The real trade-level surface: Flex Queries

PortfolioAnalyst is not how you get fills out of IBKR. **Flex Queries** are.

- **Trade Confirmation Flex Query**: pick exactly which fields appear, their
  order, the level of detail, the period, and the output format. `[V]`
  (ibkrguides.com)
- Output formats: **XML, CSV, Text (pipe-delimited), Text (tab-delimited)**. `[V]`
- Period options: Last Business Day, Last Business Week, Last Month, Last
  Quarter, Last 30 Calendar Days, **Last 365 Calendar Days**, Last N Calendar
  Days, MTD, QTD, YTD. `[V]`
- Configurable: symbol/exchange filters, include-derivatives, date/time formats
  and separators, whether to show **cancelled trades**, **audit-trail fields**,
  and account aliases. `[V]`
- **Flex Web Service**: pre-configured queries retrievable over HTTPS with a
  token + query ID, **without logging into Account Management** — a two-step
  `SendRequest` → `GetStatement` flow designed for automated client software.
  `[R]` (IBKR's own India-site documentation, surfaced via search; the page
  itself 403'd on fetch)
- Rate-limited to roughly **1 request/second per token**. `[R]` (single source)

### What it conspicuously lacks

- **No round-trip trade object.** PortfolioAnalyst is position- and
  time-weighted-return oriented. It does not construct or analyse an intraday
  round trip. `[I]` — supported by the total absence of any such feature in every
  feature list surveyed. `[R]`
- No **MAE/MFE**, no **R-multiple**, no risk-per-trade concept, no
  maximum-favourable-excursion-vs-realised comparison. `[I]`
- No **setup / strategy tagging** with efficacy breakdown; no per-trade notes;
  no screenshots; no time-of-day or hold-time analysis. `[I]`
- No pre-trade plan surface. Nothing psychological. `[I]`

**Verdict.** IBKR gives away the best free *data pipe* in this entire survey
(Flex Web Service is a genuine, documented, automatable API for fills) and the
best free *portfolio* analytics. It gives away approximately none of the
day-trader review loop. For a journal product this is the ideal shape of
competitor: excellent at the part we don't sell, absent from the part we do. `[I]`

---

## 2. thinkorswim / Charles Schwab

### What exists

- **Account Statement** (Monitor → Account Statement → date range → gear icon →
  Export to file → CSV) is the canonical export. `[R]` (multiple independent
  guides)
- The statement is a **multi-section file** — Cash Balance, Account Trade
  History, Account Order History, Positions stacked in one CSV. `[R]` For an
  ingest pipeline this is materially worse than a flat fills table: it needs
  section detection, not just header validation. `[I]`
- The Monitor tab natively shows daily P&L, position-level **option Greeks**, and
  basic per-symbol stats. `[R]` (vendor-biased source, but the claim is modest
  and consistent across guides)
- Schwab's web portal holds older statements as PDF/CSV activity reports. `[R]`

### Limits and friction

- **thinkorswim retains real-time activity data for a limited period**; older
  history is only available through the schwab.com portal, not the platform.
  `[R]`
- Very large date ranges **time out**; the recommended practice is to pull one
  quarter at a time. `[R]` (single source, vendor guide — plausible, unverified)

### What it conspicuously lacks

- No setup tagging, therefore **no efficacy-per-setup statistic** — you cannot
  ask "does my ORB actually work" inside thinkorswim. `[R]` (vendor-biased, but
  no counter-evidence found in Schwab's own docs)
- No R-multiple, no MFE/MAE, no screenshots, no notes attached to trades, no
  emotional/process fields. `[I]`
- **No thinkorswim API.** The legacy TD Ameritrade API was **sunset 2024-05-10**
  in the Schwab merger. `[R]` The replacement is the **Schwab Trader API**
  (Trader API – Individual), which requires developer-portal registration, app
  key approval, and a wait measured in days, with an "Approved – Pending" state
  before an app is usable. `[R]` Commercial developers were queued ahead of
  individuals. `[R]`

**Verdict.** A usable but awkward raw statement, genuinely thin analytics, and
an API path that is real but gated and slow. thinkorswim is the single largest
source of "I have a CSV and nothing to do with it" traders. `[I]`

---

## 3. TradingView — the one that matters

This is the highest-latent-threat entry in the survey, and the honest finding is
that **the threat has not been executed.** `[I]`

### What exists today (2026-09)

**Annotation / notes**
- **Note tool**, announced **2024-10-03**: an on-chart comment anchored to a
  selected price level, in the Annotation tools panel, with colour and text
  styling. TradingView simultaneously renamed the previous "Note" drawing to
  **"Pin"** to free up the name. `[V]` (TradingView blog)
- Persistent checklist / sticky-note surfaces exist only as **community Pine
  indicators** (e.g. "Sticky Notes", "Sticky Note Pro: Customizable Trading
  Checklist"), not as native product. `[V]` (TradingView script pages)

**Simulated trading and its statistics**
- **Bar Replay Trading** ("learn to trade on historical data") ships a five-tab
  review panel: **Overview, Performance, Trades analysis, Risk/performance
  ratios, List of trades**, with configurable initial capital, base currency and
  commission, bracket orders, and on-chart unrealised P&L. **Performance and
  List of trades can be exported.** `[V]`
- **The decisive sentence** in TradingView's own documentation: *data on trades
  and the overall result are available only in the session itself, and they are
  **not saved anywhere***. `[V]` TradingView deliberately does **not persist**
  replay review data. That is a product-philosophy statement, not an oversight.
  `[I]`
- **Paper Trading** is a separate, persistent simulated broker with a history
  tab whose columns are configurable and exportable to CSV. `[V]`
- **Strategy Tester → Performance Summary tab** reports metrics across
  All / Long / Short columns — net profit, gross profit, max drawdown, and
  (per TradingView's own strategy docs) profit factor, win rate, drawdown,
  run-up, Sharpe and Sortino. `[V]` But this is **backtest output for Pine
  strategies**, not your discretionary fills. Conflating the two is the single
  most common error in third-party "TradingView journal" content. `[I]`

**Portfolio / transactions**
- The **Transactions page** is a four-mode table — **Trades** (symbol,
  direction, date, quantity, price, value, commission), **Split**, **Cash**,
  **Dividends** — with per-row edit/delete, **CSV import** (merge or replace)
  and **CSV export**. `[V]`
- This is a position/holdings tracker. No R, no setups, no screenshots, no
  MFE/MAE, no time-of-day analysis. `[I]`

**Broker integration**
- 100+ connected brokers; the Trading Panel exposes Account Summary, Positions,
  Orders and History for the connected account, plus order entry from the chart.
  `[R]`
- **Important caveat**: the panel reflects only what the integration sees — an
  IBKR position opened in TWS or the IBKR mobile app does not show correct P&L
  in TradingView. `[R]` So TradingView is not a reliable system of record even
  for its own connected accounts. `[I]`
- **CSV export of trading data** shipped **2022-04-06** ("Export data…" in the
  broker dropdown, per-tab, holdings and trades). `[V]` (TradingView blog)

**Direction — the AI push**
- TradingView launched three AI features in early 2026: **AI-powered document
  summaries** (10-K/10-Q/earnings transcripts, US filings from June 2024
  onward), **AI-powered corporate news**, and **AI Chart Copilot**, which
  entered **public beta 2026-04-02**. `[R]` (multiple third-party writeups;
  TradingView's own blog not directly fetched)
- Chart Copilot currently ships as a **Chrome extension side panel**, and its
  advertised scope covers chart automation, drawings, alerts, **paper trading**,
  **portfolios**, screeners, watchlists, Pine Script — and **persistent notes**.
  `[R]`
- Stated intent is to bring the assistant **natively into the side panel across
  browsers and the desktop app**. `[R]`
- No evidence found of a TradingView acquisition of, or partnership with, a
  trading-journal company. `[R]` (absence of evidence, not evidence of absence)

### Assessment

TradingView holds **every ingredient**: the charts traders already review on, a
replay engine, live fills via broker integration, a notes primitive, a
persistent transactions store with CSV in *and* out, and now an AI layer whose
own feature list names notes, portfolios and paper trading. It has not assembled
them into a journal. `[I]`

The blocking factor looks like **strategic focus, not capability**. `[I]` The
"not saved anywhere" line on Replay suggests TradingView currently views
post-trade review as ephemeral practice, not as a retained record — which is
exactly the belief a journal product exists to contradict. `[I]`

**If TradingView shipped a real journal**, the "chart + notes + basic stats"
tier of the category — which is most of the sub-$20/month vendors — is
commoditised overnight. `[I]` What would survive:

1. Fill fidelity for platforms TradingView does not integrate — DAS, Sterling,
   Lightspeed, the prop/direct-access routes. `[I]`
2. Execution analytics TradingView has never shown interest in (MAE/MFE against
   risk, capture vs. reachable target, plan-vs-execution). `[I]`
3. Market-context enrichment joined to the fill. `[I]`

**Watch signal for this file:** any TradingView release note that makes Replay
results persist, or that attaches notes to a *trade* rather than a *price level*.
Either would mean they have decided to enter. `[I]`

---

## 4. Professional / direct-access platforms — DAS, Sterling, Lightspeed, Cobra, CenterPoint

First, a structural correction that matters for the market map: **Cobra Trading
and CenterPoint Securities are brokers, not platforms.** Both resell **DAS Trader
Pro**; Cobra also offers **Sterling Trader Pro** and its own Cobra TraderPro.
`[R]` (StockBrokers.com, DayTradeReview) So "DAS/Sterling reporting" *is* the
trader-facing reporting for most of this cluster. DAS Trader Pro at Cobra runs
**$125/month, waived above 250,000 shares/month**, with market data $12–$100.
`[R]`

### DAS Trader Pro — established in detail

**What export exists** `[V]` (dastrader.com's own documentation)
- `TRADE → Reports` generates daily reports for **Orders, Executions, and
  Tickets**; tick the CSV box, Refresh, Export.
- Many windows also support **right-click → Export** to **Excel, CSV, or
  Microsoft Access**.
- DAS's own doc is explicit that only *some* windows can export — the capability
  is selective, not universal. `[V]`
- Everything is a **manual, user-initiated** action. No scheduled delivery, no
  API. `[V]` (absence in DAS's own doc) `[I]`

**Why it is inadequate — the concrete list**

1. **It emits executions, not trades.** TapeReader's own parser
   (`/Users/gurwinder/Workspace/tapereader-app/web/lib/trade-journal/csv-parser.ts`)
   requires exactly `Event, B/S, Symbol, Shares, Price, Route, Time, Account,
   Note` and filters to `Event === "Execute"`. `[V]` (first-hand, our code)
   Round-tripping is done downstream in `trade-grouper.ts` by position tracking
   to flat. The independent open-source tool **structjour** implements the same
   grouping from a DAS export, confirming this is a platform property and not a
   quirk of our workflow. `[V]` (GitHub)
2. **No date column.** The execution export carries `Time` (HH:MM:SS) only —
   the trading date is implicit in "this is today's report". Any multi-day
   history has to be assembled file-by-file with the date supplied externally.
   `[V]` (our parser's `RawExecution` shape) This alone forces a per-day manual
   upload ritual. `[I]`
3. **No P&L and no commissions in that export.** `[V]` A separate Tickets or
   broker-side report is needed for costs; third-party journals publish separate
   "…w/ commissions" instructions precisely because of this. `[R]` (Chartlog's
   help article is literally titled *Manually Uploading DAS Trader PRO Trades
   (w/ Commissions)*)
4. **The schema is not stable across windows or builds.** Three vendor import
   guides describe three different DAS column sets:
   - TapeReader / DAS Reports: `Event, B/S, Symbol, Shares, Price, Route, Time, Account, Note` `[V]`
   - TradeZella: `Time, Symb, Side, Price, Qty, Route, Broker, Account, Type, Cloid` `[V]` (tradezella.com)
   - structjour: `time, symb, side, price, qty, account, cloid, P/L` plus a separate positions file `[V]` (GitHub)
   - Another guide describes a Trade History export with `Date, Time, Symbol, Side, Qty, Price, Commission, Net P&L` `[R]` (single vendor source)

   These are different windows and/or versions of the platform. For any ingest
   product this is a **real, recurring engineering tax**: header detection must
   be tolerant, and support tickets will be dominated by "my file doesn't
   import". `[I]`
5. **No annotation surface at all** — no per-trade notes, tags, setup labels,
   screenshots, conviction, or thesis. `[I]` (absence across all DAS docs)
6. **No retention.** The reports are daily. There is no accumulating history
   inside the platform to review a month later. `[I]`
7. **DAS Trader TRT** is a *broker/firm* back-office suite for real-time
   performance monitoring and risk/compliance — not trader journaling. `[R]`
   Aiming it at this job would be a category error.

**Net:** the platform tells you *what filled*. Literally everything above that —
what the trade was, whether it worked, whether you followed your plan, what the
market was doing — has to be rebuilt elsewhere. That gap is the entire reason
TapeReader's journal exists, and this file now documents it precisely. `[I]`

### Sterling Trader Pro

- `Account → Activity Report`, pick a date range, Export → **CSV or Text**. `[R]`
- **Date range capped at 30 days per export.** `[R]` (single vendor source)
- **One row per execution**: symbol, side, quantity, price, time, commission.
  `[R]` So Sterling does carry commission — a point in its favour over the DAS
  executions report — but has the identical execution-not-trade problem. `[I]`
- Guides warn to use the **execution price from the Trading Monitor rather than
  the order price** for accuracy. `[R]` (a subtle data-quality trap worth
  knowing about for any importer)
- No API, no notes, no tags, no analytics beyond the blotter. `[I]`

### Lightspeed

- Genuinely offers **native trade reporting**, always available online via
  lightspeed.com — total shares traded, unrealised P&L, realised P&L, **gross
  and net P&L**, total commission, daily equity percent change, real-time risk
  monitoring per authorised account, multi-account viewing, customisable risk
  monitors. `[V]` (lightspeed.com/trading-platforms/trade-reporting)
- This is **back-office / risk reporting**, not trade review: it answers "how much
  did the account make and am I within limits", never "which setup works".
  `[I]`
- Export path: website → My Account → Reports → Account List → Blotter → date
  range → **CSV download**. `[R]`

### Cobra Trading / CenterPoint Securities

- Trader-facing reporting = whatever platform they resell (DAS, Sterling). `[R]`
- CenterPoint additionally offers **Export as CSV** from its Client Portal for a
  selected date range. `[R]`
- Neither adds analytics of its own. `[I]`

---

## 5. Mass-retail brokers — Webull, Robinhood, tastytrade, E*TRADE, Fidelity

### Webull

- Export path: mobile Account → History → download icon; desktop Account →
  Orders widget → settings → **Export Orders**. Both require confirming a
  delivery email; the **.csv arrives by email from `noreply@webull.com` within
  5–10 minutes**. `[V]` (Webull help FAQ 992)
- The file is an **order** history, containing "filled, partially filled,
  pending, working, cancelled, and failed orders" — an importer must filter to
  fills. `[V]`
- Reported limits, each from a single third-party source and therefore soft:
  **one export per day**, **90 days per export**, and **commissions/fees are not
  included in the CSV**. `[R]`
- Native analytics: a Performance tab reaching **net P&L and win/loss count** —
  no setup labels, no R-multiple, no time-of-day analysis. `[R]`
  (vendor-biased source)

### Robinhood — the worst data citizen in the survey `[I]`

- Native export: Account → **Reports and Statements** → date range → Generate
  Report → **Download CSV**, covering trades, dividends and transfers. `[R]`
- **No public retail API.** API access is restricted to institutional partners;
  historically the retail-visible artefacts were monthly/quarterly **PDF**
  statements rather than transaction-level data. `[R]`
- The tell: an entire cottage industry of **unofficial scrapers** —
  `joshfraser/robinhood-to-csv`, `vastevenson/export-robinhood-trade-data-csv`,
  a "Robinhood Transaction History" Chrome extension, a Google Sheets add-on,
  and commercial browser-automation vendors. `[V]` (GitHub / marketplace
  listings) People only build these when the sanctioned path is inadequate.
  `[I]`
- Native analytics for traders: effectively none. `[I]`

### tastytrade — the outlier

- A **genuine public Open API**: REST/JSON, sandbox environment, documented
  **Transactions** and **Orders** endpoints, account status/balances/positions
  guides, governed by an API Terms of Service. `[V]`
  (developer.tastytrade.com)
- Plus a conventional **CSV transaction export** with selectable date range.
  `[R]`
- This makes tastytrade the cheapest mass-retail broker to integrate with,
  by a wide margin. `[I]`

### E*TRADE

- **Developer platform with a REST API**; the Transactions API returns
  transactions for a brokerage account with sub-types **Trades, Withdrawals,
  Cash**, alongside balances, positions, quotes and order preview/placement.
  `[V]` (developer.etrade.com)
- Manual path: Accounts → Transactions → Custom time period → From/To → Apply →
  download icon. `[R]`

### Fidelity

- **No public retail trading API.** `[I]` (no developer portal found)
- Manual export: Activity & Orders → History → select period → CSV. `[R]`
- **Hard 90-day cap per download**, with **5 trading years retained** — so
  covering 13 months takes roughly **5 separate files** that the user must
  concatenate before import. `[V]` (TraderFyles help centre, explicit)
- Two claims that would be disqualifying for intraday review if they hold, both
  **single-source and needing re-verification**: Fidelity's download changed in
  **May 2024 to report prices to 2 decimals instead of 4**, and the export
  **does not carry execution timestamps**. `[R]` Without a timestamp there is no
  hold time, no time-of-day analysis, and no intraday bar join — the entire
  TapeReader enrichment model would be impossible on Fidelity data. `[I]`
- Active Trader Pro's own export is limited to watchlists and positions data via
  right-click → export on the order window. `[R]`
- Native analytics: basic performance reporting only. `[R]` (vendor-biased)

### The aggregator escape hatch

**SnapTrade** is how modern journals solve the retail-API vacuum: one API to
**35+ institutions** including Robinhood, Schwab, Fidelity, Webull, Public,
eToro and moomoo, with trade-history sync, positions, balances and (where
permitted) order placement. `[R]` (snaptrade.com)

For our build plan this matters twice: it is the **only** realistic route to
mass-retail auto-sync, and it is a **paid per-user dependency** — a COGS line,
not a one-off engineering cost. `[I]`

---

## 6. Futures platforms — NinjaTrader, Tradovate, TradeStation

### NinjaTrader — the honest surprise

NinjaTrader gives away, for free, a substantial fraction of what journal vendors
charge for. This is the finding most at odds with vendor marketing. `[I]`

**Trade Performance window** (Control Center → New → Trade Performance; From/To
dates → Generate) `[V]` (NinjaTrader's own NT8 help guide):

- **Six display types**: Summary, Analysis, Executions, Trades, Orders, and
  **Journal**.
- **Analysis graphs**: Cumulative Net Profit, Net Profit, Cumulative Max
  Drawdown, **Avg. MAE, Avg. MFE, Avg. Entry Efficiency, Avg. Exit Efficiency,
  Avg. Total Efficiency**. `[V]`
- **Trades display columns**: entry/exit prices and times, profit, cumulative net
  profit, commission, **MAE, MFE, ETD (end trade drawdown), bars held**. `[V]`
- **Units** selectable: Currency, Percent, Points, Pips, or Ticks (forex
  quantities auto-normalised by lot size). `[V]`
- **Filters** applied at execution level: accounts, instruments, ATM strategy
  templates; filters update live without regenerating. `[V]`
- **Journal tab**: *"allows you to keep journal entries on your trading
  activities"*, with entries added manually **or linked to specific executions
  or trades**. `[V]`
- Works for both simulated and live accounts; NT8's tabbed interface supports
  multiple simultaneous reports (e.g. futures and forex side by side). `[R]`
- Reports are generated *from the last time you were flat*, so data may extend
  before the chosen start date to complete a position. `[V]` — a correctness
  detail most third-party journals get wrong. `[I]`

**What it lacks**: no screenshots; no setup/tag taxonomy with efficacy
breakdown; no psychology or process fields; no pre-trade plan; no cloud, mobile
or sharing; no cross-broker aggregation; Windows desktop only; and the help
documentation does not describe report export. `[I]` (absence in NT8 docs) `[V]`

**Implication.** A journal vendor pitching MFE/MAE analytics or entry/exit
efficiency to a NinjaTrader user is selling a feature that user already has for
free, locally, with better data lineage. The remaining wedge for futures is
**qualitative** (setups, screenshots, psychology, plan adherence) and
**portability** (cloud, mobile, multi-broker) — not statistics. `[I]`

### Tradovate

- **Performance Report**: P&L (with and without commissions), total trades, win
  rate, **drawdown, run-up**, performance charts, and individual trade details
  (entry/exit prices, position size, duration, execution details), over
  preset or custom date ranges. `[V]` (broker-hosted Tradovate help)
- Also tracks net profit, average winning/losing trade, and trade frequency.
  `[V]`
- **Export as CSV and PDF.** `[V]`
- Tradovate does construct **round-trip trades** natively — a meaningful step up
  from the equities direct-access cluster. `[I]`
- API: a REST API with OpenAPI definitions plus websockets. `[R]` A **reporting
  API returning CSV** for Performance, Orders, Positions and Subscriptions
  exists but is an **organisation-admin** surface (Partner API), not a retail
  end-user API. `[V]` (partner.tradovate.com/resources/admin-dashboards/reports)
- Lacks: tags, setups, notes, screenshots, psychology, plan. `[I]`

### TradeStation

- **Portfolio Maestro / Performance Report is backtest analytics**, not account
  review: it evaluates a basket of *strategies* across a portfolio of symbols.
  `[V]` (help.tradestation.com)
- Its tabs are nonetheless a good taxonomy reference: **Summary** (total return,
  profit factor, Sharpe ratio, win rate, compounded returns), **Trade Analysis**
  (strategy/efficiency/statistical), **Trades List**, **Returns & Equity**
  (including drawdown), **Periodical Returns** (daily/weekly/monthly/annual),
  **Graphs**. Settings configure initial capital, risk-free rate, commissions,
  slippage. `[V]`
- **Export to Excel** per tab, plus **Tools → Generate PDF Report**. `[V]`
- For *actual* fills, TradeStation exposes a REST API that third-party journals
  use for auto-import of stocks, options and futures. `[R]`
- The trap: TradeStation users often believe they have great trade analytics.
  They have great **strategy backtest** analytics. `[I]`

---

## 7. Export / API capability per platform — build-cost input

Ingest difficulty is our own 1–5 scale: **1 = documented API, round-trip trades,
timestamps, costs included**; **5 = manual per-day file of raw executions with a
mutable schema and missing fields**. `[I]`

| Platform / Broker | Manual export path | Format(s) | Range / volume limits | Public API for fills | Auth model | Emits executions or round-trip trades? | Commissions included? | Execution timestamps? | Ingest difficulty `[I]` |
|---|---|---|---|---|---|---|---|---|---|
| **Interactive Brokers** | Client Portal → Flex Queries → run | XML, CSV, pipe-text, tab-text `[V]` | Flex periods up to Last 365 Calendar Days / Last N days `[V]`; PortfolioAnalyst CSV ~1 yr/file `[R]` | **Yes — Flex Web Service** (token + query ID over HTTPS, no login) `[R]`; ~1 req/sec `[R]` | Token + query ID `[R]` | Executions (trade confirmations); round-tripping is on you | Yes (selectable fields) `[V]` | Yes `[V]` | **1** |
| **thinkorswim / Schwab** | Monitor → Account Statement → gear → Export to file `[R]` | CSV (multi-section) `[R]` | Limited platform retention; large ranges time out `[R]` | **Schwab Trader API** (not a TOS API); TDA API sunset 2024-05-10 `[R]` | OAuth, app registration + multi-day approval `[R]` | Executions, inside a stacked multi-table file | Yes (in statement) `[R]` | Yes `[R]` | **3** |
| **TradingView** | Broker dropdown → "Export data…" (per tab); Portfolio → Transactions → export `[V]` | CSV `[V]` | Not documented; Replay results **not saved at all** `[V]` | No public journal/fills API `[I]` | n/a | Transactions table (symbol, direction, date, qty, price, value, commission) `[V]` | Yes, on Transactions `[V]` | Date-level on Transactions; intraday within broker panel `[I]` | **3** (depends entirely on the connected broker) |
| **DAS Trader Pro** | `TRADE → Reports` (Orders / Executions / Tickets) → CSV → Export; or right-click → Export on some windows `[V]` | CSV, Excel, MS Access `[V]` | Effectively **daily, manual**; no scheduling `[V]` | **None** `[V]`/`[I]` | n/a | **Executions only** `[V]` | **No** in the executions export `[V]` | Time only — **no date column** `[V]` | **5** |
| **Sterling Trader Pro** | Account → Activity Report → date range → Export `[R]` | CSV, Text `[R]` | **30 days max per export** `[R]` | None found `[I]` | n/a | **Executions only** `[R]` | **Yes** `[R]` | Yes `[R]` | **4** |
| **Lightspeed** | lightspeed.com → My Account → Reports → Blotter → CSV `[R]`; native online trade reporting `[V]` | CSV `[R]` | Custom date range `[R]` | None found for retail `[I]` | n/a | Blotter (executions) + account-level realised/unrealised P&L `[V]` | **Yes** (total commission reported) `[V]` | Yes `[I]` | **3** |
| **Cobra Trading** | Via DAS or Sterling (resold platforms) `[R]` | as above | as above | None `[I]` | n/a | as above | as above | as above | **5** (DAS) / **4** (Sterling) |
| **CenterPoint Securities** | DAS Trade Log → right-click Export; or Client Portal → Export as CSV `[R]` | CSV `[R]` | Date range selectable in portal `[R]` | None `[I]` | n/a | Executions `[R]` | Portal export likely yes `[I]` | Yes `[R]` | **4** |
| **Webull** | Account → Orders → Export Orders (desktop) / History → download (mobile) `[V]` | CSV, **delivered by email in 5–10 min** `[V]` | Reported **1 export/day**, **90 days/export** `[R]` | No public retail API `[I]`; reachable via SnapTrade `[R]` | n/a | **Order** history — must filter to fills `[V]` | **No** `[R]` | Yes `[I]` | **4** |
| **Robinhood** | Account → Reports and Statements → Generate Report → Download CSV `[R]` | CSV; historically PDF statements `[R]` | Date range selectable `[R]` | **No public retail API** (institutional only) `[R]`; SnapTrade covers it `[R]` | n/a | Transactions (trades, dividends, transfers) `[R]` | Effectively n/a (commission-free) `[I]` | Partial `[I]` | **4** |
| **tastytrade** | Platform → transaction history → date range → export CSV `[R]` | CSV; **JSON via API** `[V]` | Not documented `[I]` | **Yes — Open API** (REST/JSON, sandbox, Transactions + Orders endpoints) `[V]` | OAuth; API ToS `[V]` | Transactions `[V]` | Yes `[I]` | Yes `[I]` | **1** |
| **E*TRADE** | Accounts → Transactions → Custom period → download `[R]` | CSV `[R]` | Custom range `[R]` | **Yes — Developer Platform REST API**, Transactions API (sub-types Trades / Withdrawals / Cash) `[V]` | OAuth, developer key `[V]` | Transactions `[V]` | Yes `[I]` | Yes `[I]` | **2** |
| **Fidelity** | Activity & Orders → History → period → CSV `[R]`; ATP right-click → export (watchlist/positions only) `[R]` | CSV `[V]` | **90 days per download**, 5 years retained → ~5 files for 13 months `[V]` | **No public retail API** `[I]`; SnapTrade covers it `[R]` | n/a | Transactions `[R]` | Yes `[I]` | **Reportedly no timestamps; 2-decimal prices since May 2024** `[R]` ⚠ re-verify | **5** (if the timestamp claim holds) |
| **NinjaTrader** | Trade Performance → Generate → (export not documented) `[V]` | Not documented `[V]` | From/To dates; reports extend back to last flat `[V]` | NinjaScript / local DB access `[I]` | Local | **Round-trip trades**, with MAE/MFE/ETD/bars-held `[V]` | **Yes** `[V]` | Yes `[V]` | **2** (data is excellent; getting it *out* is the friction) |
| **Tradovate** | Reports → Performance Report → date range → download `[V]` | **CSV, PDF** `[V]` | Presets or custom range `[V]` | REST API + websockets `[R]`; reporting-CSV API is **org-admin only** `[V]` | OAuth / API key `[R]` | **Round-trip trades** with entry/exit, size, duration `[V]` | **Yes** (P&L with and without commissions) `[V]` | Yes `[V]` | **2** |
| **TradeStation** | Portfolio Maestro → Export to Excel / Generate PDF (**backtest data**) `[V]` | XLSX, PDF `[V]` | n/a | **Yes — REST API** for account data/fills `[R]` | OAuth `[R]` | Backtest trades natively; real fills via API `[R]` | Configurable `[V]` | Yes `[I]` | **2** |

**Engineering readings from this table** `[I]`

1. **Auto-sync is available for exactly five names** on their own steam — IBKR,
   tastytrade, E*TRADE, TradeStation, Tradovate — plus whatever SnapTrade
   resells. Everything else is a file upload, permanently.
2. **The direct-access cluster TapeReader already serves (DAS, Sterling, Cobra,
   CenterPoint) is the hardest quadrant in the table**: manual, per-day, raw
   executions, unstable schemas, missing dates and costs. That is a barrier to
   entry as much as a burden — it is genuinely unpleasant work that a
   TradingView-scale player has no incentive to do.
3. **Round-trip construction is our load-bearing primitive.** Only NinjaTrader,
   Tradovate, TradeStation and (partly) Lightspeed hand you trades. Every
   equities direct-access route hands you fills.
4. **Fidelity is potentially uningestible for intraday work.** If the
   no-timestamp claim holds, Fidelity users cannot be served an intraday journal
   from broker data at all. Verify before promising support.
5. **SnapTrade is the make-or-buy decision** for mass retail, and it is a
   recurring per-user cost, not a sunk build.

---

## 8. Verdict — how much is already free, and what is genuinely left

### What the free tools already do well (state it plainly)

- **Getting fills out is solved and free, everywhere.** Every single platform
  surveyed emits CSV. No trader needs to pay for record extraction. `[V]`
- **Portfolio-level performance is solved and free, and IBKR does it better
  than the journal vendors.** 35 factors, VaR, benchmark attribution, Sharpe /
  Sortino / Calmar / alpha / beta, at zero cost, with account aggregation across
  institutions. No journal vendor beats that on portfolio analytics. `[R]`/`[I]`
- **For futures, per-trade execution analytics are solved and free.**
  NinjaTrader ships MAE, MFE, ETD, bars-held, entry/exit/total efficiency,
  filterable by account, instrument and ATM template — **plus a journal tab
  whose entries link to specific executions**. `[V]` Journal vendors are
  significantly overstating the gap here, and a futures-first product strategy
  would be walking into the strongest free incumbent in the survey. `[I]`
- **Basic backtest statistics are free and abundant** (TradingView Strategy
  Tester, TradeStation Portfolio Maestro). They are frequently mistaken for
  trade-review analytics by users and by content marketers. `[I]`

### What remains genuinely unserved — and why it is structural

1. **Round-trip construction from raw executions.** The platforms whose users
   most need review (DAS, Sterling) emit the rawest data. Nobody in the
   direct-access chain has an incentive to fix it: DAS sells order routing and
   speed; the brokers sell borrows and commissions. `[I]`
2. **Cross-platform aggregation at fill level.** IBKR aggregates *positions*
   across institutions; nothing aggregates *trades* across a broker plus a
   direct-access platform. Traders running two brokers are structurally
   unserved. `[I]`
3. **Everything the broker does not know.** Setup label, thesis, conviction,
   catalyst, screenshot, emotional/psych state, plan-vs-execution adherence. No
   broker has a field for it, and none has a business reason to create one —
   they are compensated on order flow, not on your improvement. This is the
   most durable unserved territory in the survey. `[I]`
4. **Market-context enrichment joined to the fill.** No native tool joins your
   execution to what the market was doing — %ATR, gap, RVOL, VWAP distance,
   opening-range stats, SPY direction, VIX, prior-day levels. The broker has
   your fill; the data vendor has the tape; nobody joins them. **This is
   TapeReader's actual differentiator and the survey found no native
   competitor for it.** `[I]`
5. **Retention and longitudinal review.** TradingView Replay explicitly discards
   results. thinkorswim ages real-time activity out of the platform. DAS reports
   are daily artefacts. Free tooling is oriented to *today*; improvement
   requires *quarters*. `[V]`/`[I]`
6. **The pre-trade half of the loop.** Nothing native captures a plan before the
   open and scores execution against it afterwards. Brokers begin at the order
   ticket. `[I]`

### Threat ranking `[I]`

| Threat | Level | Why |
|---|---|---|
| **TradingView** | **High, latent** | Holds every ingredient plus an AI layer already advertising "persistent notes"; has chosen not to assemble them. One release changes the category. |
| **NinjaTrader** | **High, already realised (futures only)** | Free per-trade MAE/MFE/efficiency and an execution-linked journal. Do not pick a fight here on statistics. |
| **IBKR** | Medium | Unbeatable free portfolio analytics and the best free API — but zero intraday review. Complementary more than competitive. |
| **Tradovate / TradeStation** | Low–medium | Solid round-trip reporting, no qualitative layer. |
| **thinkorswim, Webull, Robinhood, Fidelity, E*TRADE** | Low | Basic P&L only; their weak native tooling is a *reason* the category exists. |
| **DAS / Sterling / Cobra / CenterPoint** | None | Actively generate demand for third-party journals. |

### The uncomfortable conclusion

**"Why pay when my broker does it?" is a fair question for roughly half the
category.** Any journal whose value proposition is *statistics computed from
fills* — win rate, profit factor, equity curve, hold time, P&L by symbol — is
selling something the trader can already get free, and in the futures case can
get free *with better data lineage*. That half of the market is defensible only
on convenience and cloud/mobile, which is a thin, price-eroding moat. `[I]`

The half that is safe is the half brokers structurally cannot supply: **the
trader's own intent, the market's context, and the passage of time.** Plan
before the open; label and annotate the trade; join it to what the tape was
doing; keep it for a year; then ask whether the plan or the execution was at
fault. Nothing native does any of that, and no broker is incentivised to start.
`[I]`

**For TapeReader specifically:** the two things we already do that this entire
survey found no free substitute for are (a) **Polygon enrichment joined to the
fill** and (b) **the Morning Plan → Origin → execution loop**. The thing we do
that is merely table stakes is round-tripping DAS executions — hard, valuable,
but a moat made of tedium rather than insight. The thing we should not build is
another stats dashboard. `[I]`

---

## Open questions for `07-open-questions.md`

1. Does the Fidelity export really lack execution timestamps, and did prices
   really drop to 2 decimals in May 2024? Single-source; disqualifying if true.
   `[R]` ⚠
2. Are the Webull limits (1 export/day, 90 days, no commissions) current?
   Single-source each. `[R]` ⚠
3. Can NinjaTrader's Trade Performance reports be exported programmatically, or
   only read on screen? Not covered in NT8's help guide. `[V]` (gap)
4. Does TradingView's "Export data…" work for **all** connected live brokers, or
   only paper trading and the Portfolio Transactions table? The support article
   is generic. `[V]` (gap)
5. Has TradingView made any hiring or release move toward persistent trade
   review since Chart Copilot's April 2026 beta? Highest-value thing to monitor.
6. What does SnapTrade actually cost per connected user? Pricing not public.
   `[R]` (gap) — needed for `05-build-plan.md`.

---

## Sources

*Retrieved 2026-09-01 unless noted. `†` = fetched directly; others surfaced via
search result summaries where the origin blocked automated fetch.*

**Interactive Brokers**
1. IBKR — Trade Confirmation Flex Queries † <https://www.ibkrguides.com/brokerportal/performanceandstatements/tradeflex.htm>
2. IBKR — Trade Confirmation Flex Queries (org portal) <https://www.ibkrguides.com/orgportal/performanceandstatements/tradeflex.htm>
3. IBKR — Statements & Trade Confirmations, Flex Web Service <https://www.interactivebrokers.co.in/en/?f=asr_statements_tradeconfirmations&p=flexqueries4>
4. IBKR Campus — Trade Confirmation Flex Query glossary <https://www.interactivebrokers.com/campus/glossary-terms/trade-confirmation-flex-query/>
5. IBKR — PortfolioAnalyst Features <https://www.interactivebrokers.com/en/portfolioanalyst/features.php>
6. IBKR — PortfolioAnalyst Overview <https://www.interactivebrokers.com/en/portfolioanalyst/overview.php>
7. IBKR Campus — PortfolioAnalyst Overview lesson <https://www.interactivebrokers.com/campus/trading-lessons/portfolioanalyst-overview/>
8. BrokerChooser — PortfolioAnalyst review <https://brokerchooser.com/broker-reviews/interactive-brokers-review/portfolioanalyst>
9. Optimus Edge — How to Set Up IBKR Flex Queries <https://www.optimus-edge.com/blog/ibkr-flex-query-setup>
10. IBKR — YTD Realized P&L (TWS docs) <https://www.ibkrguides.com/traderworkstation/ytd-realized-pnl.htm>

**thinkorswim / Schwab**
11. Schwab — Using the Account Statement on thinkorswim <https://www.schwab.com/learn/story/using-account-statement-on-thinkorswim>
12. TradeLogr — How to Export Thinkorswim Trade History to CSV (2026) † *(vendor-biased)* <https://tradelogr.com/blog/thinkorswim-trading-journal>
13. TradersForge — thinkorswim Account Statement Import (2026) *(vendor-biased)* <https://app.tradersforge.net/guides/thinkorswim-trading-journal>
14. TradersPost — TD Ameritrade API status after the Schwab merger <https://blog.traderspost.io/article/does-td-ameritrade-have-api>
15. tda-api docs — the Schwab transition <https://tda-api.readthedocs.io/en/latest/schwab.html>

**TradingView**
16. TradingView — New note tool added (2024-10-03) † <https://www.tradingview.com/blog/en/new-note-tool-47007/>
17. TradingView — Export your holdings and trades data into a CSV file (2022-04-06) † <https://www.tradingview.com/blog/en/export-trading-data-into-a-csv-file-30748>
18. TradingView — How can I export trading data? † <https://www.tradingview.com/support/solutions/43000663814-how-can-i-export-trading-data/>
19. TradingView — Learn to trade on historical data (Bar Replay Trading) † <https://www.tradingview.com/support/solutions/43000691889-learn-to-trade-on-historical-data/>
20. TradingView — Transactions page † <https://www.tradingview.com/support/solutions/43000756105-transactions-page/>
21. TradingView — Demo features on TradingView † <https://www.tradingview.com/support/solutions/43000754966-demo-features-on-tradingview/>
22. TradingView — Performance Summary Tab (Strategy Tester) † <https://www.tradingview.com/support/solutions/43000681683-performance-summary-tab/>
23. TradingView — Sticky Note Pro community indicator <https://www.tradingview.com/script/vx0Qwt05-Sticky-Note-Pro-Customizable-Trading-Checklist/>
24. TradersPost — TradingView AI features: Chart Copilot, Documents, News <https://blog.traderspost.io/article/tradingview-ai-features-chart-copilot-documents-news>
25. TradersPost — TradingView AI Chart Copilot review/guide <https://blog.traderspost.io/article/tradingview-ai-chart-copilot-review-guide>
26. TradesViz — Trading journal for TradingView † *(vendor-biased)* <https://www.tradesviz.com/brokers/TradingView>

**DAS / Sterling / Lightspeed / Cobra / CenterPoint**
27. DAS Inc — How do I export data into an Access database or a text file? † <https://dastrader.com/docs/how-do-i-export-data-into-an-access-database-or-a-text-file/>
28. MikePia/structjour — DAS Trader Pro + IBKR statement importer † <https://github.com/MikePia/structjour>
29. TradeZella — DAS Trader integration (column list) † *(vendor-biased)* <https://www.tradezella.com/integrations/das-trader>
30. Chartlog — Manually uploading DAS Trader PRO trades (w/ commissions) *(vendor-biased)* <http://help.chartlog.com/en/articles/4247853-manually-uploading-das-trader-pro-trades-w-commissions>
31. Lightspeed Financial — Trade Reporting † <https://lightspeed.com/trading-platforms/trade-reporting>
32. TraderFyles — How to export trade history from Lightspeed † <https://traderfyles.helpscoutdocs.com/article/13-how-to-export-trade-history-from-lightspeed>
33. TradeZella — Sterling Trader Pro integration *(vendor-biased)* <https://www.tradezella.com/integrations/sterling-trader-pro>
34. Sterling Trading Tech — Export to CSV file <https://portal.sterlingtradingtech.com/product-tutorials/oms-admin-console/export-to-csv-file>
35. StockBrokers.com — 5 Best DAS Trader Pro Brokers for 2026 <https://www.stockbrokers.com/guides/das-trader-pro>
36. DayTradeReview — Cobra Trading review <https://daytradereview.com/cobra-trading-broker-review/>
37. TradeLog — Importing from a CSV file: CenterPoint <https://support.tradelogsoftware.com/hc/en-us/articles/4422010736407-Importing-from-a-CSV-File-CenterPoint>
38. **First-hand:** `/Users/gurwinder/Workspace/tapereader-app/web/lib/trade-journal/csv-parser.ts` — required DAS headers `Event, B/S, Symbol, Shares, Price, Route, Time, Account, Note`; filters `Event === "Execute"`.

**Mass retail**
39. Webull — How do I get a copy of my transaction history? † <https://www.webull.com/help/faq/992-How-do-I-get-a-copy-of-my-transaction-history>
40. Portseido — How to export your trades from Webull <https://support.portseido.com/export-trades/webull/>
41. TraderLog — How to export trade history on Webull <https://traderlog.io/how-to-export-trade-history-on-webull/>
42. Tradervue — How to get a Robinhood CSV file (without coding) *(vendor)* <https://tradervue.medium.com/how-to-get-a-robinhood-csv-file-without-coding-554a5cb199cf>
43. Anchor — Robinhood data export without API † <https://anchorbrowser.io/hub/robinhood-data-export-automation-api-alternative>
44. joshfraser/robinhood-to-csv <https://github.com/joshfraser/robinhood-to-csv>
45. vastevenson/export-robinhood-trade-data-csv <https://github.com/vastevenson/export-robinhood-trade-data-csv>
46. tastytrade — API Overview † <https://developer.tastytrade.com/api-overview/>
47. tastytrade — Trading API landing page <https://tastytrade.com/api/>
48. tastytrade Help Center — Export transaction data to a spreadsheet (CSV) <https://support.tastytrade.com/support/s/solutions/articles/43000435389>
49. E*TRADE Developer Platform — Getting started <https://developer.etrade.com/getting-started>
50. E*TRADE — Transaction API documentation <https://apisb.etrade.com/docs/api/account/api-transaction-v1.html>
51. TraderFyles — How to export trade history from Fidelity † <https://traderfyles.helpscoutdocs.com/article/11-how-to-export-trade-history-from-fidelity>
52. Fidelity — Active Trader Pro FAQs <https://www.fidelity.com/trading/advanced-trading-tools/active-trader-pro/faqs-desktop>
53. SnapTrade — Brokerage integrations <https://snaptrade.com/brokerage-integrations>
54. SnapTrade — Integrations documentation <https://docs.snaptrade.com/docs/integrations>

**Futures**
55. NinjaTrader — Trade Performance: Performance Displays † <https://ninjatrader-live.ninjatrader.com/support/helpguides/nt8/performance_displays.htm>
56. NinjaTrader — Using Trade Performance † <https://ninjatrader-live.ninjatrader.com/support/helpguides/nt8/using_trade_performance.htm>
57. NinjaTrader — Track paper trading results with the Trade Performance window <https://ninjatrader.medium.com/track-paper-trading-results-with-trade-performance-window-c71fd03c50ac>
58. Tradovate (via broker help centre) — How to review your trading performance † <https://intercom.help/aquafutures-help-center/en/articles/15892655-how-to-review-your-trading-performance-in-tradovate>
59. Tradovate Partner API — Reports <https://partner.tradovate.com/resources/admin-dashboards/reports>
60. TradeStation — About Performance Report † <https://help.tradestation.com/10_00/eng/tsportfolio/reports/about_performance_report.htm>
61. TradeStation — About Portfolio Maestro <https://help.tradestation.com/10_00/eng/tsportfolio/general/about_portfolio_maestro.htm>
