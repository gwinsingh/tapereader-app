# TradesViz

**URL:** <https://www.tradesviz.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "#1 RANKED Online Trading Journal with AI Coach & AI Analytics" `[V]`
**One-line positioning (ours):** The analytics-maximalist of the category — a six-year-old, founder-led, multi-asset journal that has annexed screening, simulation, backtesting and options analytics, and competes on feature count and price rather than on taste.

> **Research constraint:** public sources only. No account was created, no trial started. Everything
> below is from vendor marketing/docs/changelogs, third-party reviews, or app-store/Trustpilot data.
> No claim here rests on hands-on use of the product.

## Snapshot

| | |
|---|---|
| Founded / age | Oldest dated blog post is 2021-03-25; they claim "6+ years in continuous service" as of Jul 2026, implying a ~2019–2020 start `[V]` |
| Team size (est.) | Very small — likely founder + a handful. Support is "our founder and team answer chats directly"; a single `support@` inbox is the stated channel for feature requests, bug reports, broker additions and billing `[V]`. Trustpilot reviewers repeatedly name the founder personally `[R]`. Estimate 1–5 FTE `[I]` |
| Primary asset classes | Stocks, stock options, futures, futures options, index options, forex, crypto, CFDs — all first-class `[V]` |
| Primary user segment | Data-literate active traders; options traders; futures/prop traders; price-sensitive multi-asset traders. Secondary: India/Canada/Australia retail (market-data support exists for those four markets only) `[V]` |
| Business model | Freemium SaaS. Free "Basic" forever + two paid tiers, monthly/annual, Stripe & PayPal. No refunds. 15% referral credit. Frequent sitewide discount campaigns `[V]` |
| Est. scale (users/revenue) | Vendor claims 200,000+ traders, 100M+ trades processed, ~700,000 trade imports `[V]` (self-reported, unaudited). Third-party proxies are far smaller: 67 Trustpilot reviews `[V]`, 54 Play Store ratings / 10K+ installs `[V]`. If ~2–4% of 200k claimed accounts pay at ~$15–25/mo blended, that implies roughly **$0.7M–2.4M ARR** — a solid indie business, not a funded startup `[I]` |

## Pricing

Prices render in the visitor's local currency; the page served to this session quoted CAD. USD list
prices below are corroborated by third-party reviews and the iOS in-app purchase range. A 30% sitewide
sale (code `TVLDAY26`, 31 Aug – 11 Sep 2026) was live at time of writing `[V]`.

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Basic (Free)** | C$0 / $0 forever `[V]` | 3,000 executions/month; **stocks only**; 1 trading account; **auto-sync included**; unrealized-PnL tracking; deposits/withdrawals + equity curve; 2 image charts per trade (2 indicators, candlestick only); "80+ base charts" (Trade Analysis except market-based + Date charts); drill-to-trades on PnL charts only (10); Symbol Research Dashboard; Stock Fundamental Analysis; mobile app | Permanent free plan, not a trial `[V]` |
| **Pro** | C$26.99/mo, C$19.99/mo billed annually (sale: C$18.89 / C$13.99). USD list ≈ **$19.99/mo, $14.99/mo annual** `[R]` | All asset types; unlimited imports; 10 accounts; 10 image charts/trade (8 indicators, 5 chart types); auto-plotted **TradingView** charts; "100+ base charts"; drill-to-trades on all charts; full AI suite (Coach 16 checks, Query, Chat, Summary, Notes, Daily Insights, 1 AI widget); stop-loss tracking; commissions/fees; notes management; sharing; export/import management; prop-firm compliance; SEC 13F; 4 daily goals | 7-day free trial `[V]` |
| **Platinum** | C$37.49/mo, C$28.04/mo annual (sale: C$26.24 / C$19.63). USD list ≈ **$29.99/mo, $22.49/mo annual** `[R]` | Everything in Pro plus: 20 accounts; 20 image charts/trade; global TradingView templates + multi-chart grid; "150+ base charts / 600+ stats"; **Pivot+Grid charting**; **custom table columns**; custom tag groups; Exit Insights / Best-Exit / EOD-exit / multi-timeframe exit charts; Running-PnL analysis; trade plans + checklist/mistake analysis; Options Command Center; real-time screener; all simulators + trade replay; options flow + scanner; options strategy backtester; technical-analysis backtester (70+ indicators, 35k symbols); seasonality; dividend tracker; 30+ goals; 10 AI widgets; AI Coach 18 checks | 7-day free trial `[V]` |

- **Free tier / trial:** Free forever at 3,000 executions/mo, stocks only. 7-day trial on paid tiers, card required, cancel anytime `[V]`.
- **Annual discount:** 25% (marketed as "3 months free"); stacked with the 30% sale it is pitched as "50% total savings" `[V]`.
- **Notable paywall lines** `[V]`:
  - **Asset class is the hardest wall.** Free is stocks-only. Any options/futures/forex/crypto trader is forced to Pro on day one. This is the single most effective monetisation lever in the pricing table `[I]`.
  - **Interactive TradingView charts are Pro+.** Free users only get 2 static image charts per trade.
  - **Chart interactivity is tiered.** Free can only drill from data point → trades on 10 PnL charts.
  - **Everything genuinely differentiated is Platinum**: pivot grid, custom columns, exit analysis, simulators, screener, options flow, backtesters. Pro is the "real journal"; Platinum is the "platform".
  - **AI is entirely paid.** No AI feature is on Free.
  - Chat quotas: AI Trade Chat 25 msgs/day (Pro) vs 50/day (Platinum); each AI Summary costs 1 chat credit `[V]`.
- **No refunds** under any circumstance; PayPal cancellations require user-side action `[V]`. At least one Trustpilot reviewer reports being charged for 4 months after emailing a cancellation `[R]`.

## Feature inventory

### Data in (import / sync)

- **250+ brokers/platforms supported for import** (vendor claim); their sitemap exposes **641 broker landing pages** `[V]`. Treat 250 as the honest number for maintained import modules and 641 as SEO surface `[I]`.
- **~70 auto-sync connections** `[V]`. Enumerated list includes IBKR (Flex + trade-confirm queries), Schwab/TDA, TradeStation, Tradier, Tradovate, Rithmic, NinjaTrader (real-time), SierraChart (real-time), MetaTrader 4/5 (FTP and non-FTP), cTrader, Webull, Robinhood, Alpaca, tastytrade, Questrade, TopStepX, Ironbeam, PropReports, TradeLocker, Trading212, IG, eToro, Freedom24, Public.com, ~25 crypto venues (Binance, Coinbase, Kraken, Bybit, OKX, Hyperliquid, Deribit, dYdX…), Indian brokers (Zerodha, Dhan, Angel One, Fyers, 5paisa), **TradingView**, **Google Drive (any broker)**, and **DAS Trader Pro** (shipped Apr 2026) `[V]`.
- **Plaid investment-account sync** (Jul 2026) — read-only, brings in E*TRADE, Vanguard, Merrill and "100s of banks/brokers" that expose no API. Explicitly framed as periodic journal sync, not execution streaming. Stable transaction IDs for dedup `[V]`.
- **Sync cadence: once per 24h**, batch usually starts after 6 PM ET, exact time not guaranteed; manual on-demand "Sync" button available `[V]`. This is an **EOD product, not a live one** `[I]`.
- **Broker history limits are surfaced in the connect dialog**; documented recommended flow is "import full history manually once, then set auto-sync from-date after your last trade" `[V]`.
- **Schwab tokens expire every 7 days** (Schwab-imposed) and require a manual "Refresh connection" `[V]` — a recurring support burden they cannot engineer away `[I]`.
- **Generic CSV formats**: `Custom` (execution-level, one fill per row: date, time, symbol, asset_type, price, currency, quantity, commiss, tags, notes, stop_loss, profit_target) and `Custom Alt` (trade-level). Described as **strict schemas**, explicitly "not placeholders for arbitrary CSV layouts" `[V]`.
- **AI file converter escape hatch**: when a broker format is unsupported, the import page hands you a prompt to convert the file in ChatGPT/Gemini *outside* TradesViz, then import as Custom. They warn you to strip personal data first `[V]`. A cheap, honest way to absorb the long tail without writing a parser `[I]`.
- **Import Doctor** (May 2026): import results explain duplicates, open positions, caveats and reconciliation in plain language; front-end validation catches malformed custom/cTrader files pre-upload `[V]`.
- **Grouping controls at import**: "Group executions based on flat-positions + symbol", a "Scalper/stock settings" profile, and "Attempt Advanced grouping of options" `[V]`. Round-trip construction is user-tunable, not a fixed algorithm `[I]`.
- Manual trade/execution entry; multi-account, multi-currency (with conversion to a base currency), multi-timezone `[V]`.
- **Export**: trades or executions, "Base" or "Native" format (native re-importable), PDF/Excel export from tables, plus original uploaded files retrievable per import `[V]`.
- **Public API** for programmatic trade access on paid tiers `[R]` — asserted by one third-party review; **not verified on TradesViz's own site** and not listed in their pricing matrix. Treat as unconfirmed.

### Trade construction & data model

- Execution-level store → grouped trades. Trades table exposes **80+ columns** `[V]`.
- Three table views over the same data: **Trades (grouped by trade)**, **Symbol-grouped**, **Day-grouped**; rows expand to inner executions `[V]`.
- Column-level control: show/hide, drag-reorder, horizontal-scroll toggle, **saveable table state** `[V]`.
- **Group Apply**: bulk add commissions, generate charts, add/remove tags and notes across many trades `[V]`.
- **Custom table columns** (Platinum) and **pivot-grid custom columns with formulas** — arbitrary arithmetic over any numeric column `[V]`.
- **Trade Plans** — the real extensibility primitive. A user-defined template of **checkboxes, categories, free text, and numeric fields**, attachable to an individual trade (**Trade Plan**) or to a whole day (**Day Plan**, auto-applied to all trades opened that day) `[V]`. Plan fields become first-class analyzable columns with their own **Plan Analysis** tab (win rate / avg win / avg loss / profit factor / PnL-per-qty split by condition-followed) `[V]`.
- **Combining plans + pivot custom columns** is their documented recipe for arbitrary user-defined metrics — e.g. three alternative stop losses per trade, each with its own computed R-value `[V]`.
- **Tags**: free-form, attachable to **both trades and days**; **Tag Groups** are 100% user-defined (any tag in any group), Platinum-only; bulk tagging and import-rule tagging; wildcard cleanup tools `[V]`.
- **Notes**: dedicated Notes tab, multi-type **note templates**, real-time note taking and merging (Platinum) `[V]`.
- Stop loss can be entered as an absolute dollar risk or as a price, configurable in account settings; one SL/TP pair per trade by design (they explain the constraint is to keep risk/open-PnL math unambiguous) `[V]`.
- **Simulated trades are flagged with a column** and journal alongside real ones `[V]`.

### Core analytics & statistics

Vendor headline: **"600+ statistics"**, "70+ interactive charts", "150+ metrics on the Overall Statistics
tab alone", "80+ trades-table columns" `[V]`. Enumerated from their own two-part reference guide:

**Overall Statistics tab** (searchable, collapsible, Simple/Advanced modes, persistent expand state) `[V]`:

- *PnL totals*: Fully-Closed PnL, Gross PnL, Net PnL, Realized PnL (incl. partials), Unrealized PnL, Only-Profit PnL, Only-Loss PnL, Total Account Value.
- *Account & transactions*: money transactions (deposits − withdrawals), total deposits with return-on-deposits %, total withdrawals, total dividends, TAV+Dividends, TAV+Unrealized, TAV+Unrealized+Dividends.
- *By period*: last day / week / month / year profit.
- *Averages*: per-trade avg PnL (+ avg % return), avg PnL per day/month/year, each split again for winners and losers.
- *Win/loss extremes*: avg & total winning PnL %, avg & total losing PnL %, best winning / worst losing per trade and per day.
- *Performance ratios*: Profit Factor, Gain-to-Pain, Kelly Criterion, System Quality Number (Van Tharp), Win/Loss Ratio, Adjusted Win/Loss Ratio, **Sharpe, Sortino, Calmar, Omega, Ulcer Performance Index, Recovery Factor, Tail Ratio, CAGR**.
- *Risk & deviation*: PnL / daily / profit-only / loss-only standard deviation; Max Drawdown with date.
- *Streaks & expectancy*: Trading Expectancy, max consecutive wins/losses with date ranges, average & total R-value.
- *Trades*: total / winning / losing / breakeven / long / short counts, closed-vs-open, winning-vs-losing days, avg & max trades per day/month/year.
- *Volume*: total / winning / losing volume, PnL-per-quantity, avg/max/min volume per trade/day/month/year.
- *Symbol*: best & worst ticker by wins/losses, by total PnL, single highest/lowest-PnL symbol, most/least traded by volume and count — every ticker click-to-filter.
- *Duration*: total/avg/max/min holding time for all / winning / losing trades.
- *Commissions & fees*: totals and per-trade/day/month/year averages; **commission profiles** for advanced cost modelling.

**Chart families** (grouped as their reference groups them) `[V]`:

- *Overview / equity / date*: Total PnL–Volume–Win-rate vs date; daily PnL bars; daily wins/losses; **full equity curve** (deposits only / deposits+withdrawals / +dividends — the only charts that include cash movements); equity curve compared by symbol; PnL/Volume/Trades vs Year/Month/Day; aggregate PnL/Volume/Trades/Position vs grouped timeframe; **continuous / unrealized running PnL**.
- *PnL & win-rate families*, each sliceable by the same dimension set: price range, volume range, time of day, day of week, month, year, trade duration, position, asset type, grouped timeframe. Plus Hit Ratio vs dimension (incl. top/bottom symbols, tags, sectors), and averaged win/loss % vs month. Win-rate charts carry a count-vs-% type toggle.
- *Performance metrics*: R:R ratio vs price range/time/duration/day/month/year/position; **cumulative per-day** Profit Factor / Expectancy / Hit Ratio / R-value ratio / Reward-Risk; cumulative average per-day per-trade PnL, MFE, price MAE/MFE, return %, duration, executions, commission, fees, quantity; **treemaps** (PnL/Volume/Trades/Duration × Symbol/Tag/Sector); **Trend Analysis** — per-trade or per-execution metric trends with moving averages (the "moving average applied to your own performance" idea).
- *Distribution & drawdown*: distribution of gains/losses in PnL, %, and **R-value**; **Drawdown chart (EOD)** and **Drawdown chart (30-minute)**.
- *Symbols / Sectors / Industries* (unified June 2026): summary cards, ranking chart with metric dropdown + min-trades filter, win/loss mix, participation row (volume + trade count + duration together), **edge-vs-participation scatter**, sortable leaderboard, all click-to-trades.
- *Activity tab* (June 2026, replaced separate Trade Count and Volume tabs): three-way switch Trade Count / Volume / **Duration (time in market)**. Charts: **Activity vs PnL by dimension** ("the misallocation detector"), **win rate by activity-intensity bucket** (by position size, by hold time, by trades-per-day — "the overtrading detector"), activity over time with net-PnL overlay, **When You Trade** weekday × time-of-day heatmap, and a consistency/distribution chart. Five summary cards including "share of activity sitting in losing groups".
- *MFE / MAE*: Price MFE/MAE, Price % MFE/MAE, Tick MFE/MAE, Trade MFE/MAE, MFE/MAE Ratio; plotted vs open time, close time, PnL, volume; plus **MFE Date, MAE Date, Time-till-MFE/MAE, Time-after-MFE/MAE** as columns.
- *Exit analysis*: **Best Exit PnL**, **Exit Efficiency %** (share of the ideal post-last-execution exit you captured), Best Exit R-value, Best Exit Timestamp; **EOD Exit PnL / EOD Efficiency / EOD Exit R-value**; **multi-timeframe exit analysis** (what if you'd exited at 5 min / 2 h / 3 days); High/Low-of-Running-PnL duration vs PnL.
- *Exit Insights* (Jul 2026, Platinum): five-number scorecard, **two exit matrices**, ranked leak analysis, reliability charts, best-exit timing — explicitly built to separate "gave back open profit" from "cut it before it had room" `[V]`.
- *Costs & units*: commissions / fees / combined vs day/month/year/time/asset type; R-value distributions & statistics; **points & ticks** PnL stats for futures; relative-volume analysis.
- *Options*: PnL / win-rate / R:R vs **Delta, Abs Delta, Theta, Gamma, Rho, Vega, IV**; Options Command Center (portfolio Greeks summary, risk metrics, premium gained/realized, strategy view, wheel/CSP cost-basis and premium timeline); options flow dashboard + scanner; payoff charts; intraday options pricing chart; execution simulation; NSE options.
- *Market context*: **PnL vs indicator** (ATR, ADX, MFI, CCI, RSI, TSI, % price/volume gap, 14-day % change) computed against SPY/IWM/QQQ/GLD **or against each traded symbol**; seasonality charts, portfolios and screener; fundamentals; SEC 13F.
- *Compare & pivot*: **any-stat vs any-stat bubble chart** (Grouped Compare); side-by-side trade comparison; **Pivot Grid** (drag dimensions, ~70 columns × multiple aggregations); **Accounts Statistics Comparison**.
- *Calendar*: **year heat-map**, month view with PnL per day **plus event markers (IPOs, splits, earnings)**, **week view with a chart + comparison table**, and a **day view** (full-day summary, trades with explore links, running PnL, realized-PnL graph).
- *Prop Firm Compliance*: daily loss limits, max drawdown, profit targets, minimum trading days, consistency rules, across multiple accounts; **Custom Prop Firm Profiles** (starting balance, drawdown type, phase, commissions, allowed assets); **retroactive evaluation**; **Challenge Mode** inside the simulator `[V]`.
- *Open Trades Summary* (rebuilt Jul 2026, **available on every plan**): six KPI cards, conditional alerts for positions near a stop, missing a stop, near options expiry, open unusually long, or concentrated in one symbol `[V]`.
- *Deterministic auto-insights*: PnL and win-rate charts render a text insight panel derived from the chart's own data points — explicitly "100% deterministic", not LLM `[V]`.

**Chart interaction model** (uniform across every chart) `[V]`: click to expand full-screen; **click a data point → the exact trades behind it**; **right-click a data point → apply that bucket as a global dashboard-wide filter**; and an "explain this chart with AI" affordance.

### Charts & visual review

- **Two parallel chart systems**, which is the key architectural fact:
  1. **Static "image stock charts"** — server-rendered price charts saved **as images on TradesViz's servers**, precisely so users can **draw and write on them** and have the annotation persist. They go stale when executions change and must be explicitly "Refresh chart" / "Refresh all charts" `[V]`. Quotas by tier: **2 / 10 / 20 per trade**; indicators **2 / 8 / 8**; available indicator library 2 / 10 / 10; types candlestick only on Free, vs candlestick + OHLC + Heikin-Ashi + Renko + volume bars on paid `[V]`. Also "Any-Symbol Custom Stockcharts" — plot a chart for a symbol you didn't trade `[V]`.
  2. **Interactive TradingView charts** (Pro+) on every trade-explore page, with **auto-plotted overlays**: left/right triangles at each execution's exact price, large green/red entry & exit arrows, arrow-in-circle markers at candle extremes for options legs, **thin dotted green/red lines for MFE/MAE**, **dashed green/red lines for stop and profit target**. Drawings persist per trade per account; **global study templates** (Platinum) apply a saved indicator set to every chart `[V]`. A separate, non-editable delayed TradingView widget also appears in trade explore `[V]`.
- **Granularity**: down to **1-minute for all asset types** and **5-second for US futures** `[V]`. MFE/MAE is computed from **5-second data for futures and S&P 500 stocks** — they claim to be first to do so `[V]`.
- **Pre/post-market**: only available on 1/2/3-minute charts, and **the current day is ~16 hours delayed** (next-day fill) `[V]`. Another confirmation this is an EOD product `[I]`.
- **Market data coverage: US, Canada, India, Australia only**, plus global indices, forex and crypto `[V]`. Trades from anywhere can be *imported*, but chart context outside those four markets doesn't exist.
- **Charts View / Chart Trades View**: all your trades on one symbol plotted on a single chart `[V]`.
- **Trade Replay** (Platinum) — second-by-second replay of a past trade, and (Jul 2026) **whole-day symbol replay** that replays the entire chronological execution stream for a day including scale-ins/outs `[V]`.
  Note: two third-party reviews assert TradesViz has "no trade replay" `[R]`; **the vendor's own pricing table and changelog contradict this** `[V]`. The reviews appear stale or wrong `[I]`.
- Screenshot/image attachment to trades and days, from web and mobile `[V]`.

### Journaling, notes & tagging

- Notes at trade, day and "misc" level; dedicated Notes tab; **note templates** (post-trade review, EOD checklist, setup plan); real-time note taking and merging (Platinum); note search from Review `[V]`.
- Tags on **both trades and days**, user-defined tag groups, bulk tagging, import-rule tagging, wildcard cleanup `[V]`.
- **Tags Analysis v2**: best/worst tags and tag groups by PnL, win-rate (%/count/PnL), longest/shortest duration, most/least traded, automatic tag insights, day-tag support in pivot grids `[V]`.
- **Day Tags & Day Tag Groups** get the full parallel chart family `[V]`. Being able to analyse day-level context as a first-class dimension is genuinely uncommon `[I]`.
- Daily watchlist (Pro+) `[V]`.

### Psychology / discipline / process

TradesViz's stance is explicitly anti-mood-meter: *"Seeing a gauge say 'You are Tilted' is functionally
useless."* Their answer is to give you primitives rather than a fixed psych schema `[V]`:

- **Psychological tags** (FOMO, REVENGE, HESITATION, OVERSIZE…) grouped under a user-made "Psychology" tag group, then pivoted to a dollar figure per tag — "quantified self-sabotage with a dollar sign attached" `[V]`.
- **Boolean discipline checklists via Trade Plans** ("Waited for candle close?", "Size within 2% risk rule?", "Stop placed immediately?"), with a **Plan Analysis** tab comparing followed-vs-not on win rate, avg win/loss, profit factor and PnL/qty `[V]`.
- **Day Plans for contextual variables** — their own worked example is *Sleep Score (numeric 1–10), Stress Level (category), Mood (category), Major Life Event (checkbox)* — auto-applied to all trades opened that day and pivotable against outcomes `[V]`.
- **Behavioural detectors in AI Coach** (below): revenge trading, size-up-after-loss, cold-start `[V]`.
- **Trading Goals**: 4 daily goals on Pro, 30+ daily/weekly/monthly on Platinum `[V]`.
- They pointedly claim "playbook" features elsewhere are a rebrand of Trade Plans, which they shipped in early 2023 `[V]`.
- Counterpoint: one competitor-owned review asserts TradesViz has "no structured emotional tracking or psychology review" `[R]`. That is defensible only in the narrow sense that **there is no built-in psych schema — you must construct one** `[I]`. This is the classic power/onboarding tradeoff and it is the single clearest wedge against them `[I]`.

### Planning & pre-market

- **Trade Plans and Day Plans authored before the trade**, then attached — their docs describe "document your trading plan before executing a trade, capturing your mental and emotional state in real-time" `[V]`.
- **Daily watchlist**; idea capture from screener results into watchlists and notes `[V]`.
- **AI Daily Insights**: give it a date and lookback window, get ten broad observations to read **before the open** — explicitly framed as a session-prep briefing, distinct from the retrospective audit `[V]`.
- **Real-time stock screener** (Platinum) with 18 strategy presets, plus **daily screener results** delivered into the dashboard `[V]`.
- **Economic calendar** with tiered events, used by the AI Coach's news-day detector `[V]`; calendar also carries earnings, IPOs and splits (Pro+) `[V]`.
- **Seasonality** charts, portfolios, screener, heatmaps and sector rotation `[V]`.

### Risk & money management

- One stop-loss / profit-target pair per trade, enterable as price or as absolute risk; **R-Value and Unrealized R-Value** computed from it; dashboard-wide **R-value / point / tick toggle** `[V]`.
- Columns: Stop Loss, Profit Target (+ % variants), Stop/Profit Distance, Open Stop PnL, Open Profit PnL, Expected Target Return, Expected Loss, **% Profit Target Realized** `[V]`.
- **Max/Min Running PnL, Positive/Negative PnL Time** — how far a trade travelled in each direction *while open* and how long it spent onside vs offside `[V]`.
- **Stop-Loss / Profit-Target Simulator** with reusable "profiles" — replay what-if bracket rules across your history, now including options `[V]`.
- Drawdown at EOD and 30-minute resolution; Kelly, SQN, Ulcer, Recovery Factor, Calmar `[V]`.
- Equity Curve tab is where deposits/withdrawals are entered — required for CAGR and true account value `[V]`.
- Prop-firm rule tracking as above `[V]`.

### Playbooks / setups / rules engine

- **Trade Plans are the playbook**, with the important twist that every plan field is an analyzable column, so "did I follow the playbook" is a queryable dimension rather than a note `[V]`.
- Plan templates are reusable and applicable from mobile `[V]`.
- No evidence of an *automatic* setup classifier (i.e. nothing that reads the chart and labels the setup for you) `[I]`.

### AI & automation

Seven named AI surfaces `[V]`. Their public philosophy is unusually explicit and worth quoting for the
thesis doc: *"TradesViz will never be an AI-first journal"*, because *"you cannot dump numbers into an
LLM and get generalizable insight… What comes back will be catastrophically overfitted."* `[V]`

| Feature | What it actually does | Data leaves TradesViz? |
|---|---|---|
| **AI Coach / Trading Review** (Jun 2026, Pro+) | **16 deterministic statistical detectors** (18 on Platinum), ranked by dollar impact, max **4 cards** shown, min sample 10 trades. Not an LLM. | Detectors: **no**. Optional one-paragraph "Coach Takeaway": yes, card summaries only, no raw rows `[V]` |
| **AI Query / Q&A** (2023 — first in category) | Natural language → **structured** chart + linked table. Results can be pinned as dashboard widgets. | **No data sent externally** `[V]` |
| **AI Trade Chat** (Oct 2025) | Open-ended chat with memory + chain-of-thought. Two agents: **Trade Agent** (your data, no product knowledge) and **Support Agent** (product knowledge, no data access); contexts are not shared. 25 msgs/day Pro, 50 Platinum. | **Yes** — requires an explicit opt-in consent checkbox in account settings `[V]` |
| **AI Summary** (Mar 2026) | One-click summary of a chart (PnL charts) or the current page of a table, saveable to Notes. 1 chat credit each. | Yes (same pipeline as Chat) `[V]` |
| **AI Notes** | Auto-generate trade notes combining trade data + market context. | Yes `[V]` |
| **AI Daily Insights** | Ten pre-market observations for a chosen date + lookback. | Yes `[V]` |
| **AI Widgets** (Pro ×1, Platinum ×10) | Turn a saved AI Query into a persistent custom-dashboard widget. | No (built on AI Query) `[V]` |
| **AI Fundamentals Q&A** | Natural-language questions over stock fundamentals. | Yes `[V]` |
| **AI file converter** | Hands you a prompt to convert an unsupported broker CSV in *your own* ChatGPT/Gemini. Conversion happens outside TradesViz entirely. | N/A — user-side `[V]` |

**The AI Coach detector list is the most directly stealable artifact in this whole research pass** `[I]`.
Verbatim from their docs `[V]`:

*Risk & execution* — 1. Risk/Reward Leak (avg win vs avg loss). 2. **Losers Took Extra Heat** (adverse excursion past planned invalidation). 3. Losers Need Faster Invalidations (time spent underwater). 4. **Losses Beyond Planned Stop** (realized loss ≥ 125% of planned loss). 5. **Winners Need More Room** (closed well before best available exit). 6. **EOD Exit Would Have Helped** (simulate flat-by-X). 7. MAE Bigger Than MFE.
*Behavioural* — 8. **Revenge Trading** (opened within 30 min of a losing close, same account). 9. **Size Increases After Losses** (post-loss size ≥ 1.25× post-win size and that bucket is negative). 10. **Cold-Start Trades Underperform** (>24 h since last close vs <24 h).
*Timing & context* — 11. Weak Time Window (hour of day). 12. Weak Trading Day (weekday). 13. **Worst Day × Hour Cell** (2-D interaction neither marginal explains). 14. **High-News Days Underperform** (tier-3 economic-calendar events).
*Focus & edge* — 15. **Loss Is Concentrated** (≥30% of red ink from one ticker). 16. **Best Current Edge** (the one positive card).

Ranking mechanics, also published `[V]`:
`score = abs(pnl_impact) × confidence_weight × detector_weight × (1 + helpful_boost) × trend_multiplier`,
then a **diversity pass** across eight groups (timing, focus, risk, execution, excursion, exit_plan,
behavioral, edge) picking the top card per group before filling by raw score. Every win-rate comparison
is gated by a **two-proportion z-test** vs the pooled baseline, surfacing High (p<0.05) / Medium (p<0.10)
/ Low confidence chips. Per-review **fingerprints** produce **trend pills** (worsening ↗ / improving ↘ /
stable → / new), scoped **per account, not per filter**, retained 60 days. Feedback is **Helpful / Not
useful / Known issue**, and suppression is **scoped to the specific variant** ("Weak Trading Day: Tuesday"
doesn't hide Thursday) and **auto-expires after 30 days** if the pattern stops firing.

### Reporting, sharing & social

- **Custom trade reports**; PDF/Excel export per table page `[V]`.
- Granular sharing: share a single trade or a single trading day with per-field visibility controls; **private view-only account sharing** (add someone by display name); advanced performance/dashboard share settings; **specific portfolio dashboard sharing** (Platinum) `[V]`.
- **No community, forum, or social feed** — sharing is point-to-point, not a network `[I]`. This is a real structural difference from Tradervue.
- Referral system: 15% credit for both parties `[V]`.
- **Content marketing is the go-to-market.** A 400+ URL sitemap of blog posts, per-broker landing pages, per-asset landing pages, per-country hubs, a glossary, a psychology hub, and direct `tradesviz-vs-*` comparison pages against TradeZella, Tradervue, TraderSync and FXReplay. Blog posts carry a **"Copy for AI"** button — they are optimising for LLM retrieval, not just Google `[V]`/`[I]`.

### Mobile, integrations & platform

- **Mobile V3** (Aug 2026, iOS + Android), a substantial rebuild: five destinations (Home, Calendar, Add, Trades, Review); global filters that persist across screens; **AI Coach and AI Chat on mobile**; month calendar → Day Review; running daily PnL; apply day-plan templates; trades table with search/sort/filter and multi-select; **bulk tag/note apply, split and merge**; trade detail + editing (split executions, add executions, attach screenshots, edit SL/TP); **native OHLC charts with entry/exit markers, pinch zoom, fullscreen**; chart-value → matching trades; broker file import (200+ brokers) and broker connection health/sync; account management; manual entry `[V]`.
- **But the store numbers are poor**: Google Play **2.9★ from 54 ratings, 10K+ installs** `[V]`. iOS rating was **reset** and shows no aggregate `[V]`. Visible Play reviews split between "Huge improvement from the previous version!" and "This app is terrible… does not even calculate correctly" and "near impossible to link my trading account… the instructions are a book" `[V]`.
- Web app is heavily JavaScript-based; their own FAQ has a dedicated entry blaming browser extensions for slowness and instructing users to test in incognito `[V]`. That entry existing at all is a tell about perceived performance `[I]`.
- English-only UI; they suggest Google Translate `[V]`.
- Integrations outward: TradingView charts + custom TradingView indicators; Google Drive as an import channel; Plaid; FTP for MetaTrader `[V]`.

## What they do genuinely well

1. **Breadth, honestly earned.** The two-part statistics reference is not marketing fluff — it is a real, categorised, cross-linked map of hundreds of charts with "where to find it" instructions. Very few products in any category document themselves this well `[V]`.
2. **The exit-quality analytics stack is best-in-class.** Best Exit PnL, Exit Efficiency %, EOD-exit variants, multi-timeframe exit ("what if I'd held 5 min / 2 h / 3 days"), Exit Insights matrices, MFE/MAE at 5-second resolution for futures and S&P 500 names, plus Time-till-MFE and Time-after-MFE. Nobody else appears to go this deep on the exit `[V]`/`[I]`.
3. **AI Coach is the right architecture.** Deterministic detectors, dollar-ranked, z-tested, sample-gated at n≥10, capped at four cards, diversity-enforced, with variant-scoped suppression and auto-resurface — and the LLM confined to writing one paragraph *on top of* findings it cannot invent. This is a genuinely well-designed feature and a strong rebuttal to "dump the CSV in ChatGPT" `[V]`/`[I]`.
4. **Extensibility instead of a fixed schema.** Trade Plans (checkbox/category/text/numeric, per trade *or* per day) + pivot custom columns with formulas + user-defined tag groups means a user can encode their own methodology rather than adopt the vendor's. Day Plans especially — sleep, stress, life events as analyzable dimensions — is a real capability `[V]`.
5. **Import surface area is the actual moat, and they know it.** 250+ formats, ~70 auto-syncs, Plaid for the API-less long tail, Google Drive as a universal channel, an AI converter for everything else, Import Doctor to explain failures, and a documented "import history manually, then sync forward" playbook. Their own essay names this correctly: the moat is "seven years of accumulated damage" from broker CSV drift, contract rollovers, corporate actions and multi-leg assignments `[V]`.
6. **Price/feature ratio is aggressive to the point of being a competitive weapon.** ~$15/mo annual for a product whose nearest analogue costs $30–50 `[V]`/`[R]`.
7. **Support responsiveness.** The most consistent praise across Trustpilot and their own CSAT wall is fast, human, founder-level support — including shipping a requested import format inside 24 hours `[R]`.
8. **Shipping velocity.** Their Apr–Aug 2026 changelog alone covers AI Coach, Plaid, Exit Insights, Mobile V3, options backtesting, prop-firm profiles, a rebuilt statistics page, two rebuilt analysis tabs, and ~15 new broker integrations `[V]`.

## Where they are weak

**Structural (hard for them to fix):**

1. **Feature count is the product strategy, so density is not a bug they can remove.** Every review and every UI complaint traces to the same root: 600+ stats, ~11 sidebar chart sections, three table views, a pivot grid, simulators, screeners, backtesters and options flow in one navigation tree. Their own reference guide's opening line — *"it can be hard for new users to know exactly where a chart lives"* — concedes it `[V]`. They have patched around it (search-first Overall Statistics, Simple Mode, Simulator Simple Mode, collapsible sections) but the information architecture cannot get simple without abandoning the positioning `[I]`.
2. **The flexible data model has no default.** Trade Plans can express anything, which means they express nothing until the user designs a schema. A trader who doesn't already know what to track gets an empty template. Competitors that ship an opinionated psych/discipline schema out of the box beat them on time-to-first-insight even though they lose on ceiling `[I]`.
3. **Static image charts are an architectural debt.** Server-rendered PNGs that go stale and need manual "Refresh chart" exist only because that was the way to support annotation. The interactive path (TradingView) can't carry the same drawings, so the product maintains **two chart systems with different capabilities, quotas and behaviours** `[V]`/`[I]`.
4. **Market data coverage is only US/CA/IN/AU.** Everything chart-, MFE/MAE-, indicator-, fundamentals- and seasonality-related silently degrades outside those four markets, even though trades from anywhere can be imported `[V]`.
5. **24-hour sync cadence + ~16-hour delay on same-day pre/post-market data.** They cannot credibly serve any intraday or same-session review use case `[V]`/`[I]`.
6. **Mobile has a real quality problem, not just a perception one.** 2.9★ / 54 ratings on Play and a reset iOS rating, after a flagship V3 launch `[V]`. Small team, three surfaces (web, iOS, Android), all moving fast `[I]`.
7. **Bus factor.** Founder-led, tiny team, founder personally in the support queue, six years of accumulated broker-format knowledge with no evidence of institutional redundancy `[I]`.
8. **Adjacent-market sprawl.** Screener, seasonality, options flow, three backtesters, five simulators, 13F, fundamentals. Each is a maintained data dependency competing for the same scarce engineering time as the journal `[I]`.

**Cosmetic / fixable:**

9. Free tier is stocks-only, which several reviewers call "too limited to properly evaluate" `[R]`.
10. No refunds at all, and at least one credible report of billing continuing after an emailed cancellation `[R]`.
11. English-only UI despite heavy India/Canada/Australia targeting `[V]`.
12. Documentation lags feature velocity, per multiple reviews `[R]`.
13. Their own marketing tone ("we dare you", "World's ONLY", naming competitors) reads as defensive and will alienate some buyers `[V]`/`[I]`.

## What real users say

**Praise**

- Trustpilot **4.1/5 across 67 reviews** `[V]`. (One third-party review cites ~4.3/5 across 90+ `[R]` — likely a different snapshot date; prefer the directly-read figure.)
- Support is the dominant theme: *"Great Product — Even Better Support Team… within less than 24 hours, they added support for that process"* (Jun 9, 2026) `[R]`. Multiple reviewers name the founder as personally responsive.
- Analytics depth and price: reviewers repeatedly frame it as "the most analytically dense journal in the category" and note "no other journal delivers this level of analytics depth at this price point" `[R]`.
- Options traders specifically call out proper multi-leg tracking as missing elsewhere `[R]`.
- Play Store, on V3: *"Huge improvement from the previous version! Now, it is super easy to use"* `[V]`.
- TradesViz's own `/reviews` page is a wall of testimonials — but reading them, they are almost entirely **support-ticket CSAT snippets** ("good resolution to my issue", "Rep was helpful"), not product reviews. Discount accordingly `[V]`/`[I]`.

**Complaints**

- **Onboarding overwhelm** is the single most repeated theme: "new users often feel overwhelmed"; "many traders looking for a fast post-session review find navigation overwhelming in week one"; "expect a few hours of exploration before feeling oriented"; menus/widgets/charts sit so close together that early sessions feel "like software training rather than straightforward trade review" `[R]`.
- **Import friction**, especially multi-broker setups, and at least one reviewer reporting **PnL calculation discrepancies** on high-volume accounts `[R]`. A Play reviewer: *"This service does not even calculate correctly"* `[V]`.
- **CFD handling** — one Trustpilot reviewer reports futures price data being used incorrectly for CFDs `[R]`.
- **Mobile onboarding**: *"After installing it was near impossible to link my trading account… the instructions are a book and hard to understand. It was a nightmare."* `[V]`
- **Billing**: *"I canceled this by email 4 months ago and they have continued to charge my card"* (Dec 22, 2025) `[R]`.
- **AI data egress** — reviewers flag that AI Trade Chat sends trade data to external LLM providers and advise reading the consent terms `[R]`. (The vendor discloses this clearly and gates it behind opt-in `[V]`.)
- **Free tier too thin to evaluate** for anyone not trading stocks only `[R]`.

**Evidence-quality warning** `[I]`: a large share of "TradesViz review" results are content-marketing
pages published by **competing journals** (TraderTrac, Tradespad, Lunefi, Tradernotion, Traders Second
Brain). TraderTrac's review, for example, claims TradesViz has "no AI coaching" and "no structured
emotional tracking" and then recommends TraderTrac for exactly those — both claims are contradicted by
TradesViz's own dated documentation (AI Coach, Jun 2026; Trade/Day Plans, since 2023). Two separate
reviews also claim "no trade replay" when replay is a documented Platinum feature. **Treat single-source
third-party feature claims about this vendor as unreliable; verify against their changelog.**

**Why people leave** `[R]`/`[I]`

- Bounced off the interface in week one and went to something simpler for the daily-review habit — the most commonly cited reason.
- Wanted guided coaching / a ready-made psychology framework rather than a toolkit to build one.
- Import or PnL accuracy problems on high-volume or CFD accounts destroyed trust in the numbers — fatal for a journal.
- Bought Platinum for tools (simulators, screener, backtesters) they never used, then downgraded.
- Mobile-first traders who tried the app first and never made it to the web product.

## Engineer's read

**Inferred technical choices**

- **Execution-level relational store, trades derived on top.** Evidenced by re-groupable imports ("group by flat position + symbol", scalper profile, advanced options grouping), expandable trade rows showing inner executions, split/merge execution tooling, and `Custom` vs `Custom Alt` (execution-level vs trade-level) import schemas `[V]`/`[I]`.
- **Two chart pipelines.** (a) Server-side rendering to **stored PNGs** with an annotation layer on top — confirmed verbatim: *"The static charts are saved as images on our servers since we allow drawings and writings on the charts"* `[V]`. They go stale on data change and require an explicit refresh, which is exactly what a materialised-image cache does. (b) **TradingView's charting widget** for the interactive path, with executions/MFE/MAE/SL/TP pushed in as overlays and drawings + study templates persisted to the user's account `[V]`. **They did not build an interactive charting engine. They rented one, and built a cheap annotatable raster for the rest.** `[I]`
- **Market data**: OHLC down to 1-minute for all assets, 5-second for US futures, US/CA/IN/AU coverage, pre/post-market only on 1/2/3-min and ~16h delayed for the current session `[V]`. This profile — cheap, deep-history, batch-loaded, next-day for extended hours — reads like a bulk historical vendor plus overnight ingestion, **not** a real-time feed `[I]`.
- **Batch/queue architecture.** Auto-sync is a nightly batch starting ~6 PM ET across "many thousands of connections", with retry/backoff, connection-state tracking and a retry queue added Jul 2026. AI Coach "runs as a background job so the Overview tab never blocks" `[V]`. Heavy use of async workers `[I]`.
- **Aggressive caching keyed on semantic inputs.** AI Coach caches on `filter payload + trading account + engine version + suppression set + helpful votes`, and bumping the engine version invalidates everything `[V]`. That's a mature, well-thought-out cache-key design worth copying outright `[I]`.
- **Pivot grid on ~70 columns with client- or server-side aggregation**, saveable table state, formula-evaluated custom columns `[V]`.
- **Idempotent sync** via broker-native or Plaid-stable transaction IDs, plus a `Date|Symbol|time|side`-style dedup for file imports (they claim duplicates are handled even on manual re-sync) `[V]`.

**What is genuinely hard to build**

- **The import layer.** Not intellectually hard — *attritionally* hard. 250 formats that silently drift, futures rollovers, corporate actions, multi-leg assignment, partial fills across accounts, and "seventeen ways a prop firm reports commissions". This is the real moat and it is measured in years, not sprints `[V]`/`[I]`.
- **Broker auth lifecycle.** IBKR flex-query tokens expiring, Schwab's 7-day token expiry, OAuth refresh, per-broker history depth limits. Every one is a permanent support cost `[V]`.
- **Second-resolution MFE/MAE at scale.** 5-second bars for futures and S&P 500 names, walked per trade, is a serious data-volume and compute problem — and it is what makes the exit analytics credible `[V]`/`[I]`.
- **Best Exit / multi-timeframe exit / EOD-exit counterfactuals.** Each requires replaying the full post-entry bar series per trade at several horizons `[I]`.
- **Options correctness**: spread auto-detection, per-leg Greeks, expiry/assignment, wheel cost-basis. Wide and unforgiving `[I]`.
- **The five simulators, screener and three backtesters.** Each is arguably its own product `[I]`.

**What is easy but tedious**

- The 600-stat catalogue itself. Almost every number is a group-by over one table; the work is enumeration, naming, definitions, and putting each in a findable place — not algorithmic difficulty `[I]`.
- The uniform chart interaction contract (expand / click→trades / right-click→global filter). Design it once, apply everywhere `[I]`.
- The **AI Coach detectors** — each is 20–60 lines of aggregation plus a z-test. Sixteen of them is a couple of weeks, not a quarter. **The value is in the taxonomy and the ranking/suppression/trend machinery, and they published all of it** `[V]`/`[I]`.
- The pricing-tier gating matrix and the SEO landing-page farm — pure volume work `[I]`.

**Read against our stack (Next.js 15 / Cloudflare Pages edge / Sheets / Polygon / D1 planned)** `[I]`

- We already have the expensive half of their exit stack: order-aware `Max R Before Stop` (MFE) and `MAE (R)` walked over 1-minute bars, plus daily ATR/ADR/30mATR context. What we lack is the **framing**: Exit Efficiency %, Best Exit PnL, EOD-exit counterfactual, and multi-timeframe "what if I'd held N longer". Those are arithmetic on data we already fetch.
- Their **static-PNG-plus-annotation** trick is directly relevant: our Screenshot Review already stores annotated images in Drive keyed `date|symbol`. Their model validates that a journal does **not** need a bespoke interactive chart engine — rent TradingView for interactive, store rasters for annotated. Building our own candlestick renderer would be the wrong call.
- Their 24h batch sync + ~16h extended-hours delay means the whole category tolerates EOD latency. Our Polygon-batch/D1 plan is not behind the state of the art.
- Their **cache key design** (`filter + account + engine_version + suppressions + votes`) is a clean pattern for our stats routes, where in-memory caching is already known-broken across Cloudflare isolates.
- Their AI Coach costs them almost nothing to run — the detectors are pure SQL/aggregation and only a single short narration paragraph touches an LLM, rate-limited and cached. **A detector suite is affordable on our free-tier constraints; an LLM-per-trade product is not.**
- Their **Trade Plan / Day Plan** model maps almost exactly onto what we already do with `PLAN_FILL_COLS` and `DAY_FILL_COLS` (Morning Plan → auto-fill onto every trade of the date). We have built the same primitive for a fixed schema; they generalised it to user-defined fields. Generalising ours is a Sheets-column-management problem, not a data-model one.

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Exit Efficiency %** (realized ÷ best-available-exit after last execution) as a headline stat | We compute MFE already but only express it as capture-vs-target. Efficiency vs the *best available* exit is the honest denominator and pairs directly with our Capture Tracker | dogfood + commercial | S |
| **EOD-exit counterfactual** ("what if you were flat by X every day") | We already have the daily candle (O/H/L/C) and 1-min bars per trade date. A "flat by 15:45" simulation is a few lines and answers a question every intraday trader asks | dogfood | S |
| **Multi-timeframe exit analysis** (P&L if exit moved +5m / +30m / +2h / EOD / +3d) | Turns one MFE number into an exit-timing curve. Strictly more informative than a single capture % | dogfood | M |
| **AI Coach detector suite — deterministic, dollar-ranked, z-tested, max 4 cards** | The single highest-value idea here. Cheap to compute, no LLM cost, works on our stack, and directly serves our "what do I fix next" need. Their 16-detector taxonomy is published and can be implemented verbatim | dogfood + commercial | M |
| **Revenge-trade detector** (trade opened <30 min after a losing close) | Pure timestamp arithmetic over data we already have. We track discipline via a manual `Process Followed?` flag; this is the automatic version | dogfood | S |
| **Size-after-loss detector** (post-loss size ≥ 1.25× post-win size, and that bucket negative) | Martingale creep is invisible without it and we have shares + P&L per trade already | dogfood | S |
| **Cold-start detector** (>24h since last trade) | Directly testable against our own Monday/post-break performance | dogfood | S |
| **Loss concentration** (≥30% of total losses from one ticker) | One group-by. High signal-to-effort | dogfood | S |
| **Worst (day × hour) cell**, not just worst day and worst hour | Our hourly breakdown already exists in `computeStats`; the 2-D version catches interactions the marginals hide | dogfood | S |
| **Statistical gating: two-proportion z-test + n≥10 suppression + confidence chips** | Our Discipline %, Prediction % and Capture % are all currently reported without sample-size honesty. Adding a confidence tag would stop us over-reading 12-trade subsets | dogfood + commercial | S |
| **Trend pills on findings** (worsening ↗ / improving ↘ / new), fingerprinted per account, 60-day retention | Turns a static stat page into something that tracks whether a fix is working. This is what makes a coach feel like a coach | dogfood | M |
| **Variant-scoped suppression with 30-day auto-resurface** | The mechanism that stops an insights panel becoming noise. Suppressing "Tuesday" must not suppress "Thursday" | commercial | M |
| **Day-level tags and Day Plans as first-class analyzable dimensions** | We already auto-fill sleep/readiness/energy/tension per date. What we lack is *pivoting outcomes by them*. "Avg R by sleep-hours bucket" is the payoff for data we're already collecting | dogfood | S |
| **Activity-vs-PnL "misallocation detector"** and **win-rate by trades-per-day bucket** (overtrading detector) | Frames effort/size/time-in-market as the *cost* against P&L as the *reward*. Genuinely novel framing and trivial on our data | dogfood | S |
| **Distribution charts in R-value buckets** (not just $) | We are already R-native; the shape of the R distribution says more about tail risk than any average | dogfood | S |
| **Right-click a data point → apply as global dashboard filter** | Our shared filter bar already exists; wiring chart→filter closes the explore loop with almost no new state | dogfood | S |
| **Click a data point → the exact trades behind it**, everywhere | We do this in the calendar drill-down only. Making it universal is the difference between a report and a tool | dogfood | M |
| **Trade Plan primitive: user-defined checkbox/category/text/numeric fields, per trade or per day, each analyzable** | Generalises our fixed Morning Plan schema. The "Plan Analysis" split (followed vs not, on win rate / avg win / avg loss / PF) is exactly our Discipline % generalised | commercial | L |
| **Searchable, collapsible stats page with per-section match counts + Simple/Advanced mode** | The mitigation for our own density as we add metrics. Cheap insurance against becoming what people complain about | commercial | S |
| **Import Doctor** — explain duplicates, open positions, reconciliation and next steps in plain language after every import | Our DAS upload path is silent on partial/ambiguous results. This is where trust in a journal is won or lost | dogfood + commercial | M |
| **"Convert it with AI" escape hatch for unsupported broker formats** | Absorbs the entire long tail of brokers for near-zero engineering, without shipping a parser or touching the user's data server-side | commercial | S |
| **Cache key = filter + account + engine_version + suppressions + votes** | Directly fixes the known "in-memory cache doesn't survive Cloudflare isolates" problem, and version-bumping for invalidation is cleaner than TTLs | dogfood | S |
| **Rent TradingView for interactive charts; store annotated rasters separately** | Validates not building a chart engine. Our Drive-based screenshot store is already half of this pattern | commercial | M |
| **Commission profiles** (model per-venue cost structures rather than trusting the import) | Gross-vs-net is a real gap in our stats and prop/retail commission structures vary wildly | dogfood | M |
| **Prop-firm compliance profiles** (daily loss limit, max drawdown, consistency rule, min days, retroactive evaluation) | The fastest-growing underserved segment in the category, and mostly arithmetic over data a journal already holds | commercial | M |
| **"Copy for AI" button on documentation** | They are optimising for LLM retrieval, not just search. Cheap, and increasingly how buyers discover tools | commercial | S |

## Sources

**Vendor (primary)**

- [TradesViz homepage](https://www.tradesviz.com/) — accessed 2026-09-01
- [Pricing](https://www.tradesviz.com/pricing/) — accessed 2026-09-01
- [About](https://www.tradesviz.com/about/) — accessed 2026-09-01
- [General FAQ](https://www.tradesviz.com/faq/) — accessed 2026-09-01
- [Product FAQ: Charts & Visualization](https://www.tradesviz.com/product-faq/category/charts-visualization/) — accessed 2026-09-01
- [Product FAQ: Importing & Syncing Trades](https://www.tradesviz.com/product-faq/category/importing-syncing-trades/) — accessed 2026-09-01
- [Product FAQ: Additional Features](https://www.tradesviz.com/product-faq/category/additional-features/) — accessed 2026-09-01
- [Statistics & Charts: The definitive reference (Part 1)](https://www.tradesviz.com/blog/charts-statistics-reference/) — accessed 2026-09-01
- [Tables & Overall Statistics reference (Part 2)](https://www.tradesviz.com/blog/general-statistics-reference/) — accessed 2026-09-01
- [AI Coach Trading Review](https://www.tradesviz.com/blog/ai-coach-trading-review/) — accessed 2026-09-01
- [AI Trade Chat](https://www.tradesviz.com/blog/ai-trade-chat/) — accessed 2026-09-01
- [Trading Psychology Journal: track emotions & quantify discipline](https://www.tradesviz.com/blog/trading-journal-psychology-tracking/) — accessed 2026-09-01
- [Pivot grid + trade plans for custom statistics](https://www.tradesviz.com/blog/custom-stats-pivot-trade-plans/) — accessed 2026-09-01
- [How to auto-sync trades (full connector list)](https://www.tradesviz.com/blog/auto-import-trades/) — accessed 2026-09-01
- [Technical analysis / TradingView charts in TradesViz](https://www.tradesviz.com/blog/technical-analysis-charts/) — accessed 2026-09-01
- [Apr–Aug 2026 changelog](https://www.tradesviz.com/blog/aug-2026-updates/) — accessed 2026-09-01
- [Mobile V3 announcement](https://www.tradesviz.com/blog/android-ios-app-v3/) — accessed 2026-09-01
- [State of Trade Journaling 2026](https://www.tradesviz.com/blog/state-of-journaling-2026/) — accessed 2026-09-01
- [Reviews / testimonials page](https://www.tradesviz.com/reviews/) — accessed 2026-09-01
- [sitemap.xml and sitemap-brokers.xml (641 broker URLs)](https://www.tradesviz.com/sitemap.xml) — accessed 2026-09-01

**Third-party**

- [Trustpilot — tradesviz.com (4.1/5, 67 reviews)](https://www.trustpilot.com/review/www.tradesviz.com) — accessed 2026-09-01
- [Google Play — TradesViz (2.9★, 54 ratings, 10K+ installs)](https://play.google.com/store/apps/details?id=com.tradesviz.tradesviz_app) — accessed 2026-09-01
- [Apple App Store — TradesViz Trading Journal (v3.00, rating reset)](https://apps.apple.com/us/app/tradesviz-trading-journal/id1643338387) — accessed 2026-09-01
- [Traders Second Brain — TradesViz Review 2026: Pricing, API, Honest Verdict](https://traderssecondbrain.com/guides/tradesviz-review) — accessed 2026-09-01
- [TraderTrac — TradesViz Review 2026 (competitor-published; treat with caution)](https://www.tradertrac.com/blog/tradesviz-review-2026-powerful-analytics-but-is/) — accessed 2026-09-01
- [Tradespad — TradesViz Review 2026 (competitor-published; treat with caution)](https://tradespad.com/blog/tradesviz-review) — accessed 2026-09-01
- [Bullish Bears — TradesViz Review 2026](https://bullishbears.com/tradesviz-review/) — accessed 2026-09-01
- [DayTradingz — TradesViz Review 2026 (surfaced in search; direct fetch returned 403, claims not independently verified)](https://daytradingz.com/tradesviz-review/) — accessed 2026-09-01
