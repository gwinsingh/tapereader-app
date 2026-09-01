# TradeZella

**URL:** <https://www.tradezella.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "Meet Your AI Trading Partner. The AI trading journal that knows your trades." `[V]`
**One-line positioning (ours):** The category leader — a web-first, subscription journal that has annexed backtesting, tick replay, prop-firm ops tracking, education and a social layer, and is now betting the brand on agentic AI.

> **Why this file matters most.** TradeZella is the reference point every other vendor
> is measured against and every trader has heard of. Its shipped feature set is,
> for practical purposes, the definition of **table stakes** in this category.
> Anything below is table stakes unless explicitly called a differentiator.

## Snapshot

| | |
|---|---|
| Founded / age | Company registered 2020; product launched early 2022 `[R]` (Tracxn, Fast Company). ~4.5 yrs live. |
| Team size (est.) | Not disclosed. Core build was outsourced to **Railsware** with 3 engineers + 1 designer + 1 PM from Jun 2021 `[V]` (Railsware case study). Now in-house + agency; **est. 25–60 people** `[I]` given support volume, education arm, content marketing cadence. |
| Primary asset classes | Stocks, ETFs, options, futures, forex, crypto `[V]` |
| Primary user segment | Active retail day/swing traders; **very heavily prop-firm futures traders** in 2025-26 `[I]` — inferred from PropFirm Sync being built and given away free, and from ICT/SMC concept libraries shipping in backtesting |
| Business model | Pure SaaS subscription. **No free tier, no free trial.** Affiliate/partner program. Owner also runs Stock Market Lab (education) `[R]` |
| Est. scale | Site claims "100K+ traders trust us" and "20.2B trades journaled" `[V]` — but the same site's `/trading-journal` page says "50,000+" in the header and "100,000+" in the body `[V]`, so treat as marketing. **Est. 15k–35k paying subs** `[I]`; at a ~$45 blended monthly ARPU that is **~$8M–19M ARR** `[I]`. Bounded by 1,015 Trustpilot reviews `[V]` and unfunded status `[R]` (Crunchbase/Tracxn: no funding raised). |

## Pricing

Repriced **2026-07-07/14** — first increase since 2022 launch `[V]`. Previously Essential $29/mo ($288/yr), Pro $49/mo ($399/yr) `[V]`.

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Essential** | $35/mo · $315/yr (~$26/mo) | 1 connected account, 10 strategies, 500 AI credits/mo, unlimited **manual** backtest sessions, 1 free automated backtest run, Mentor Mode join-only | `[V]` |
| **Pro** | $59/mo · $531/yr (~$44/mo) | Up to **50** accounts, unlimited strategies, 1,500 AI credits/mo, **Zella Agents**, **10 automated backtest runs/mo**, unlimited Trade Replay + 1-sec replay chart + replay AI insights, create Spaces | `[V]` — "Most popular" |
| **Ultra** | $99/mo · $891/yr (~$74/mo) | Unlimited accounts, 3,000 AI credits/mo, **100 automated runs/mo**, unlimited Spaces/mentor invites | `[V]` — new tier, added 2026 |

All tiers include: automated journaling from "500+ brokers", "300+ reports", PropFirm Sync, Zella University, community `[V]`.

- **Free tier / trial:** none of either. `[V]` This is the single most-cited structural objection `[R]`.
- **Refund:** **not clearly published.** Third parties variously report a 14-day money-back guarantee `[R]` and "all sales final" `[R]`. The absence of a findable policy page is itself the finding. `[I]`
- **Annual discount:** 25% `[V]`.
- **Notable paywall lines:**
  - **Trade Replay → Pro.** Their best-known differentiator is behind the middle tier. `[V]` *Contradiction on record:* the 2026-08-04 changelog says replay (10/mo) was extended to Essential `[V]`, and the help centre says Essential gets 10/mo `[V]`, while the pricing page and pricing blog still say "not included" `[V]`. Their own surfaces disagree.
  - **Zella Agents → Pro.** Essential gets the AI chat but not the autonomous agents. `[V]`
  - **Account count → Pro.** 1 account on Essential is the real upgrade lever for anyone with a cash account + a prop eval. `[I]`
  - **Automated backtesting runs → metered by tier** (1 / 10 / 100). `[V]`
  - **AI is metered by credits on every tier.** `[V]`

## Feature inventory

### Data in (import / sync)
- **Auto-sync (direct broker connection), ~13 confirmed:** Charles Schwab/thinkorswim, Interactive Brokers, Webull, Robinhood, Tradovate, cTrader, DXtrade, MetaTrader 4/5, Power E*Trade, TradeLocker, TradeStation, NinjaTrader, ByBit `[V]`. **Rithmic Sync** added 2026-07-21; **MT4 futures** support and **IBKR same-day sync** added Jul–Aug 2026; **eToro SSO** Jun 2026 `[V]`.
- **File upload (CSV) for 38+ more**, incl. **DAS Trader Pro**, Lightspeed, TradingView, Tastyworks, Moomoo, Coinbase, Questrade, FTMO, ATAS `[V]`. Note: our own DAS workflow is upload-only here too.
- The "**500+ brokers**" headline is achieved by counting every white-label MetaTrader/cTrader/DXtrade/TradeLocker broker as a separate integration `[I]` — the real count of distinct sync *mechanisms* is ~13.
- Same-day / intraday sync is recent and was shipped broker-by-broker `[V]` — historically it was next-day. `[R]`
- **Export:** CSV export from Trade Log with user-selected columns `[V]`. **No public API found** `[V]` (searched; only CSV export documented).
- **PropFirm Sync via Plaid** — links a bank/credit card and auto-classifies eval fees, resets, activation fees and payouts across 10 auto-detected firms (TopStep, Apex, Tradeify, Take Profit Trader, Bulenox, Top One Futures, My Funded Futures, Funded Next, Alpha Futures, Lucid), manual entry for 200+ more `[V]`. Payout detection only supports Wise and WorkMarket `[V]`.

### Trade construction & data model
- Round-trip trades built from executions; execution list viewable/editable per trade `[V]`.
- Multiple take-profit and stop-loss levels per trade `[V]`.
- Regular vs extended trading hours toggle `[V]`.
- Commission/fee tracking; auto-close expired options `[V]`.
- **Unrealized P&L / open positions** surfaced on the dashboard `[V]`.
- Multi-account, multi-asset in one view `[V]`.
- **Options:** groups multi-leg into a unified position and surfaces net greeks/IV when the source export carries them `[R]`; **complex multi-leg (esp. calendar spreads) reportedly groups incorrectly and needs manual fixing** `[R]` — consistent across several (competitor-authored) reviews, so treat direction as reliable and detail as soft.

### Core analytics & statistics
- **Zella Score** — 0–100 composite. **Published weights** `[V]`: Profit Factor **25%**, Avg Win/Loss **20%**, Max Drawdown **20%**, Trade Win% **15%**, Recovery Factor **10%**, Consistency **10%**. Each sub-metric maps to a 0–100 band; Trade Win% = `(Win% ÷ TopThreshold) × 100`, default threshold 60% (adjustable), capped at 100. Consistency = `100 − (stdev(daily profit) ÷ total profit)`. Recovery Factor 3.5 → 100, <1.0 → 0.
  → **Engineering read: this is entirely computable from data we already hold.** It is a *presentation* invention, not a data moat. `[I]`
- **Zella Scale** — per-trade "potential vs actual" scorecard: what the trade would have made executed exactly to plan vs what it actually made `[V]`. Shown on Trade Log, Daily Journal, Trade Tracking. This is functionally the same idea as our Capture Tracker / Exec-Gap, but per-trade and prominently placed. `[I]`
- **MAE / MFE per trade** `[V]` — computation method and granularity **not documented** `[V]`.
- **R-multiple**: planned vs realized R, both averaged in reports `[V]`. Dashboard has a dedicated **R-Multiple view mode**, alongside Dollars, Percentage, Privacy, Ticks, Pips, Points `[V]`.
- Dashboard widgets `[V]`: Net P&L, Account Balance & P&L, Trade Win %, Profit Factor, Day Win %, Avg Win/Loss, **Trade Expectancy**, Current Day Streak, Current Trade Streak, Current Streak, Max Drawdown, Average Drawdown; plus Zella Score, Daily Net Cumulative P&L, Win%–AvgWin–AvgLoss, **Trade Time Performance**, **Trade Duration Performance**, Net Daily P&L, Daily & Cumulative Net P&L, Recent Trades & Open Positions, Calendar / Calendar Mini / Advanced Calendar / Yearly Calendar, Account Balance, Drawdown, **Challenge** (prop rule compliance), **Progress Tracker**, Report.
- **"300+ reports"** (was "50+" in 2024-25 marketing) `[V]` — report families include Overview, Symbol, Playbook, Tags, plus cross-analysis charts comparing arbitrary metric pairs `[V]`. **30+ filters** `[V]`.
- Best/worst performing **tag** reports `[V]` — the "which of my labels actually make money" cut.

### Charts & visual review
- **TradingView charting library** embedded `[V]` — they did not build charting. Full TradingView indicator library plus TradeZella-built custom indicators.
- **Proprietary indicators, all ICT/SMC-flavoured** `[V]`: Sessions (London/NY/Asia), **ICT FVG** (fair value gaps), **Key Levels** (today's H/L/O, opening range, pre-market, overnight, after-hours, yesterday's H/L/O/C), **HTF** bias tool, **PO3** (Power of Three). This is a very deliberate audience bet. `[I]`
- Entry/exit markers on chart; click a marker to jump to the trade; marker clustering for perf `[V]`.
- Copy drawings **from** TradingView into TradeZella `[V]`.
- Screenshot/image attachments per trade `[V]`.
- Running P&L curve per trade, incl. options price chart `[V]`.

### Journaling, notes & tagging
- **Notebook** — folder-organised note store. Trade notes auto-file into a `Trade Notes` folder, daily journal entries into `Daily Journal`, so notes written anywhere in the app aggregate into one browsable notebook `[V]`. Custom folder icons; undo/recover deleted text (re-added 2026-08-25 after being broken) `[V]`.
- **Custom templates** for daily journal / pre-market prep / EOD summary `[V]`.
- **Tags** — free-form custom taxonomy for setups, emotions, mistakes `[V]`; bulk-apply from Trade Log; AI auto-tagging (see below).
- **Trade rating** — rate each trade to filter best/worst executions `[V]`.
- **Rate My Day** — day-level rating with history, shipped 2026-08-25 `[V]`.

### Psychology / discipline / process
- **Progress Tracker** — a rules engine, not a checklist. Six predefined rules, each toggleable/customisable: which days you trade, a start time for your day, **every trade must be linked to a playbook**, **every trade must have a stop loss**, max loss per trade, max loss per day. Plus arbitrary custom rules `[V]`.
- **"Finish My Day"** — once clicked, the day's rules **lock** and unchecked rules stay unchecked permanently `[V]`. This is a genuinely good commitment device: it removes the ability to retroactively grade yourself as compliant. `[I]`
- **Consistency heatmap** `[V]`.
- **Sentiment Agent (SA-01)** claims tilt detection from journal tone `[V]` (marketing claim; efficacy unverified).
- Notably **absent**: sleep, readiness, energy/tension check-ins, or any biometric input. Their psychology layer is entirely rules-and-tone based. `[I]` — *this is a gap our journal already fills.*

### Planning & pre-market
- **"Start My Day"** workflow — one click runs the Sentiment Agent, which auto-detects the assets you trade, scans conditions, and produces pre-market scenarios and a trading plan `[V]`.
- **Economic calendar** built in `[V]`.
- Pre-market prep templates; daily checklist `[V]`.
- **Scenarios (beta, Jul 2026)** — a gallery of shareable market scenarios (gap-up open, trend reversal) you replay and trade through for pattern-recognition reps `[V]`. Sharable by link/email and duplicable.

### Risk & money management
- Stop Loss and Profit Target fields per trade; SL enforcement as a Progress Tracker rule `[V]`.
- Max daily loss / max per-trade loss as tracked rules `[V]`.
- **Challenge widget** — live compliance against a prop firm's specific ruleset: daily drawdown, total drawdown, profit target, consistency requirement `[V]`.
- **Risk Management Agent** — claims to warn before rule breaks `[V]` (marketing).
- Reported weakness: **"risk calculations are inaccurate"** (Trustpilot, 2025-11-24) `[R]` — single source.

### Playbooks / setups / rules engine
- **Playbook** = a named strategy with an explicit rule/criteria list. Attach a trade to a playbook, then **tick off which rules the trade actually satisfied** `[V]`. Bulk-attach from Trade Log.
- **Reports: Playbook** breaks performance down by playbook `[V]` — the "which of my setups earn" cut.
- **Strategies** with rule *groups*; strategy archiving; a library of pre-built/"proven" strategies `[V]`.
- Essential is capped at **10 strategies** `[V]`.

### AI & automation
Launched **2026-05-26** as "Zella AI", beta first `[V]`. Branded as agents with SKU-like IDs.

- **SA-01 Sentiment Agent** — pre-session scan: economic events, news, key levels, volatility regime. Runs inside Start My Day. `[V]`
- **AT-02 Auto-Tagging Agent** — tags each incoming trade with setup type, strategy, session, quality grade, market conditions; label rules written in **plain English**; retroactively tags historical imports. `[V]`
- **SR-03 Session Review Agent** — fires when the last trade closes: compares the session against the morning plan, **scores plan adherence and flags broken rules with timestamps**, writes the day's journal entry, and feeds forward into tomorrow's pre-market prep. Output lands in the Notebook. `[V]`
- **BT-04 Backtesting Agent** and **CA-05 Custom Agent** — listed "coming soon" on the Zella AI page `[V]` while automated backtesting itself went GA 2026-07-14 `[V]`. Roadmap and shipped state are not in sync on their own site. `[I]`
- **Conversational mode** grounded in the user's own trades; remembers name, risk limits, strategies, style across sessions `[V]`. File upload into chat, chart annotation drawing by the AI, an AI Settings screen with a **model tier selector**, and thumbs-feedback all shipped Jul–Aug 2026 `[V]`. "Upgraded AI model" 2026-08-25 `[V]`.
- **Metered by credits** (500/1,500/3,000 per month). What one credit buys is **not published** `[V]`.
- Marketing claim: "Trained on 20.2 billion trades. Knows your patterns better than you do." `[V]` — and simultaneously "No picks. No predictions." `[V]` They are deliberately staying off the investment-advice line.
- **Reality check** `[R]`: an independent-ish review reports the AI gives per-trade commentary but **does not do cross-history behavioural pattern detection** (revenge trading, tilt cycles, overtrading) — i.e. the thing the marketing sells hardest. Source is a competitor's blog, so weight accordingly, but it is consistent with a RAG-over-your-trades architecture. `[I]`
- **Worst-case failure on record:** a Trustpilot reviewer (2026-07-26) reports **AI tagging corrupted ~200 trades with wrong labels and there was no reliable undo** `[R]`. Auto-tagging that writes into user data without a transactional undo is a real product bug class.

### Backtesting & replay (their differentiator)
Two genuinely distinct products, frequently conflated in reviews:

- **Manual backtesting** — bar-replay simulator on historical data, up to **10 years** `[V]`. You place simulated orders (market/limit/stop, **trailing stops** added Jun 2026) as the chart advances. Playback **interval** ("jump size") is selectable: 1s, 2s, 5s, 10s, 15s, 30s, 1m, 2m, 5m, 10m, 15m, 30m, 1H, plus 4H and daily added Jul 2026 `[V]`. Playback speed 0.5×–10× `[V]`. "Go to" / jump-to-candle navigation. **Every simulated trade is journaled into the same analytics engine as live trades** `[V]` — that unification is the actual insight, not the replay itself. Multi-strategy comparison. Sessions shareable via Spaces `[V]`.
- **Automated backtesting** — GA 2026-07-14 `[V]`. You describe a strategy **in plain English** ("go long when the 9 EMA crosses above the 21 EMA on the 5-minute chart"); Zella AI parses it into structured rules. Pre-built templates for **ICT concepts** (fair value gaps, order blocks, liquidity sweeps, SMT divergence) `[V]`. Runs one comprehensive pass over 3/6/12-month or custom ranges, **~2–3 minutes** `[V]`. Outputs win rate, profit factor, Sharpe, max drawdown, net P&L, equity curve, monthly P&L, full trade log with exit reasons, click-through to TradingView charts, plus an AI narrative on the results. Later additions: breakeven stop-loss offset, minimum stop distance, multi-bar liquidity sweep detection `[V]`.
- **Trade Replay** — distinct from both: replays **your actual executed trades** second-by-second with your real fills on the chart, automatically, **multiple trades at once across symbols** `[V]`. Pro tier gets a **1-second replay chart** and AI insights over the replay `[V]`.
- Reported weakness `[R]`: backtest indicator values **differ from TradingView's**, strategy rules don't always save, and limit-order/scaling execution is unreliable (Trustpilot, Dec 2025 / Jan 2026). Two independent reviewers. This is the credibility-critical bug class for a backtester.

### Reporting, sharing & social
- **Spaces** (evolution of Mentor Mode) — private rooms with friends/mentor/group; live trade sharing, group challenges, leaderboards `[V]`.
- **Mentor Mode / Student Mode** — a mentor gets full read access to the student's Daily Journal, Trade Log, Playbooks and Notes, in real time, and can leave feedback inline `[V]`. Invite by link. Essential = join only; Pro = invite + join; Ultra = unlimited `[V]`.
- Backtesting sessions shareable into Spaces — for educators reviewing students' *practice*, not just live trades `[V]`.
- Per-trade Share button `[V]`; Scenario sharing by link/email `[V]`.
- **Zella University** — structured courses + playbooks, bundled at every tier `[V]`. Discord community, "10k+ community members", "150+ trader communities integrated" `[V]`.
- Affiliate/**Partner Program** `[V]` — and the SEO landscape around this vendor is saturated with affiliate and competitor-authored "reviews".

### Mobile, integrations & platform
- **Mobile app: unresolved, most likely no native app.** `[V]` A search of the Apple App Store API for "tradezella" returns **no TradeZella app** (the similarly-named "Tradezell: Buy Sell Trade" is an unrelated marketplace app by a different developer) `[V]`. The help centre's Getting Started guide and FAQ collection make **no mention of mobile** `[V]`. Their marketing page shows a phone mockup captioned as a mobile app `[V]`, and third-party reviews contradict each other — some say apps launched, StockBrokers.com's hands-on says "no dedicated mobile app" `[V]`. **Best read: responsive web / PWA-ish, no shipped native app as of 2026-09-01** `[I]`. They publicly promised iOS + Android "this year" back in **May 2024** `[V]` — a two-year-old unfulfilled promise.
- Plaid (banking), Stripe (billing), Google Auth, Intercom (support) `[V]`.
- **Stack** `[V]` (Railsware case study): Ruby on Rails + Sidekiq + PostgreSQL + **BigQuery** + AWS/Heroku backend; React/Sass/Webpack/Material UI frontend; New Relic. BigQuery is the tell — analytics are warehoused, not computed in the app database.

## What they do genuinely well

1. **They unified journaling and practice on one data model.** Backtested trades, replayed trades and live trades all land in the same analytics engine. Nobody else does this cleanly, and it is why "TradeZella is the one with backtesting" is the sentence everyone repeats. The moat isn't the replay UI — it's that practice reps accrue into the same statistics as real reps.
2. **Zella Score is brilliant packaging of unremarkable maths.** Six commodity metrics, published weights, one number that goes up. It gives users a scoreboard, gives the product a retention hook, and costs nothing to compute. `[I]`
3. **"Finish My Day" rule-locking.** A commitment device with real teeth — you cannot retroactively mark yourself compliant. That is a genuine behavioural design insight, not a feature. `[I]`
4. **PropFirm Sync is a strategically excellent free feature.** Plaid-linked eval-fee and payout tracking answers "am I actually net-positive on this prop-firm habit?", a question no broker or firm will ever answer honestly. Free = land-grab on the fastest-growing retail segment. `[I]`
5. **Audience commitment.** Shipping ICT/SMC concept libraries into a *backtester* is a strong, unhedged bet on the modern retail futures/prop cohort. It reads as pandering to some, but it is precise positioning.
6. **Support.** Overwhelmingly the most-praised theme across 1,015 Trustpilot reviews `[V]`.
7. **Shipping cadence.** Weekly changelog, substantive entries, sustained through 2026 `[V]`.

## Where they are weak

**Structural (hard for them to fix):**

1. **No free tier and no trial, in a category where the product's entire value depends on an integration working.** You cannot know whether your broker syncs cleanly until after you've paid. TraderSync gives 7 days, Tradervue has a free tier. This is a self-inflicted conversion tax that they cannot remove without cannibalising a fully-paid funnel. `[V]`/`[I]`
2. **Broker sync is 13 real integrations wearing a "500+" costume, and each one is a maintenance liability they don't control.** Schwab refresh tokens expire in 6–7 days and the sync silently dies `[V]` — that is Schwab's design, and TradeZella eats the support ticket and the churn. 37% of negative reviews cite bugs, dominated by sync `[R]`. Every new broker makes this worse, not better. This is the permanent tax of the auto-sync business model.
3. **They own no market data and no charting.** TradingView renders the charts; the historical data is licensed. Reported indicator-value divergence from TradingView `[R]` suggests their backtest engine runs on a *different* data source than the chart the user is looking at — a credibility problem in the exact feature that is their differentiator.
4. **The AI is metered, which fights the product's own thesis.** Selling "your AI trading partner that works 24/7" while charging per question creates hesitation at precisely the moment of intended engagement. Credits are also unpriced in public — nobody knows what 1,500 buys. `[V]`/`[I]`
5. **AI writes into user data without a robust undo.** The ~200-trades-mislabelled report `[R]` is a symptom of shipping agentic writes before transactional safety. Trust, once burned here, is expensive.
6. **Two-year-old unfulfilled mobile promise.** `[V]` A Rails+React web app with a heavy TradingView dependency is genuinely awkward to bring to native mobile, which is probably why it hasn't happened.
7. **Price ratchet with no lifetime option.** $531–$891/yr compounds; one-time-purchase competitors ($299 lifetime class) exist and market against exactly this. `[R]`
8. **Their own surfaces contradict each other on what's in which tier** (Trade Replay on Essential; agents listed "coming soon" after GA). `[V]` Small, but it is the signature of shipping faster than the marketing site can be maintained.

**Cosmetic / fixable:** options multi-leg grouping `[R]`, chart-template persistence `[R]`, occasional 500 errors `[R]`, no public API `[V]`.

## What real users say

Sourcing caveat, and it matters: **the "TradeZella review" SERP is almost entirely affiliate or competitor-authored.** Trader's Second Brain, JournalPlus, TickerScribe, Lunefi, Plancana, TraderTrac, RizeTrade and TraderWaves all sell competing journals and all rank for "TradeZella review". Their *criticisms* are directionally usable because they're specific and repeat across independent competitors; their *comparisons* are worthless. Trustpilot is the better signal, though a 91%-5-star distribution on a paid product suggests review solicitation. `[I]`

- **Praise:**
  - *Customer support* — the single most-cited positive across 1,015 Trustpilot reviews `[V]`, TrustScore 4.8, 458 reviews in the trailing 12 months `[V]`.
  - Trade Replay quality — "best-in-class" even from a competitor's review `[R]`.
  - Breadth: "covers stocks, props, forex, futures — everything I trade" and filter depth (Trustpilot, 2026-08-20) `[V]`.
  - The structured journaling workflow enforcing discipline `[R]`.
- **Complaints** (Trustpilot 1–2★, dated) `[V]`:
  - AI auto-tagging corrupted ~200 trades, no reliable undo (2026-07-26).
  - Duplication bugs, formatting changes, backtesting failures (2026-01-22).
  - Limit-order execution and scaling don't work correctly in backtesting (2026-01-18).
  - Backtest indicators differ from TradingView; strategy rules don't save (2025-12-05).
  - Constant 500 errors; inaccurate risk calculations (2025-11-24).
  - Confusing cancellation flow; repeated daily charge retries after insufficient funds (2026-06-04).
  - Chart templates don't persist; beta broker integrations drop weekly (2025-08-27).
  - Support silence for months, resolved only after a public negative review (2025-07-02); "support is non-existent" (2025-08-28). **Note the tension with the praise theme — support appears excellent on the main path and absent on hard/edge cases.** `[I]`
  - Only 23% of negative reviews get a company reply, typically within two weeks `[V]`.
- **Why people leave:**
  1. **Price after the July 2026 increase**, especially for anyone whose usage is "log trades and look at stats" — that user is paying $531+/yr for features they don't touch. `[R]`/`[I]`
  2. **Sync broke and stayed broken** — Schwab token expiry and IBKR import failures are the named culprits. `[R]`
  3. **Bought without a trial, broker didn't work, felt trapped by an unclear refund policy.** `[R]`
  4. **AI didn't deliver the coaching the marketing promised** — per-trade commentary rather than behavioural pattern detection. `[R]` (single-source, competitor-authored)
  5. **No mobile** for anyone who wants to journal on the phone after the close. `[R]`

## Engineer's read

- **Stack** `[V]`: Rails + Sidekiq + Postgres + **BigQuery** + AWS/Heroku; React + Material UI. The BigQuery presence says the "300+ reports" are warehouse-backed, computed off a columnar store, not aggregated per-request from Postgres. **Directly relevant to us:** our stats are computed per-request from Google Sheets rows on a Cloudflare edge isolate. That works at one trader's volume and will not survive multi-tenant. If we ever go commercial, D1 → an analytical store is the fork in the road. `[I]`
- **Broker sync is the whole cost centre.** ~13 mechanisms: OAuth (Schwab, Robinhood, Webull, eToro), FIX/vendor APIs (Rithmic, Tradovate, IBKR), and MetaTrader/cTrader/DXtrade/TradeLocker bridges that fan out to hundreds of white-label brokers under one implementation. That fan-out is precisely how "500+" is achieved and it's a legitimately smart lever — **one MT5 integration buys hundreds of forex brokers.** Also the source of most of their bug reports. `[I]`
- **Chart rendering is not theirs** — TradingView charting library. `[V]` Nobody in this category should build charting. We shouldn't either.
- **Hard to build:**
  - **Tick-accurate replay of a user's own fills.** Needs licensed tick/second-resolution history across equities+futures+FX, storage for it, and a streaming replay engine. This is a data-licensing problem before it is an engineering problem. **On our stack this is the single most out-of-reach feature** — Polygon's tick endpoints plus the storage would blow past free-tier D1 immediately. `[I]`
  - **Natural-language → executable backtest rules.** The LLM parse is the easy half; a correct, deterministic bar-by-bar execution engine with limit/stop/trailing semantics and honest fill assumptions is the hard half — and their own 1★ reviews say they haven't fully nailed it. `[R]`/`[I]`
  - **Plaid-based prop-firm transaction classification.** Plaid integration is routine; the merchant-string → "this is an Apex reset fee" classifier is the actual work, and it's a maintained rules table, not ML. Tedious more than hard. `[I]`
- **Easy but tedious (i.e. table stakes we could match):**
  - Zella Score — six published formulas over data we already have. **Half a day.** `[I]`
  - Zella Scale (potential vs actual per trade) — we already compute the harder inputs (Max R Before Stop, MAE). **This is a rendering job.** `[I]`
  - Playbook rule-checklists attached to trades, with a per-playbook performance report — schema + UI, no new data. `[I]`
  - Progress Tracker rules + day-locking — pure app logic. `[I]`
  - Dashboard view-mode switching (R-multiple / $ / % / ticks) — we already have two of these in the calendar; generalising is cheap. `[I]`
  - Notebook auto-filing of trade and daily notes into folders — organisational, not computational. `[I]`

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **"Finish My Day" rule locking** — end-of-day commit that freezes the day's rule checkboxes so compliance can't be backfilled | Our `Process Followed?` is self-graded with no locking, which is exactly the failure mode this prevents. Highest behavioural-integrity-per-line-of-code idea in the whole vendor. | dogfood + commercial | **S** |
| **Zella Scale per-trade "potential vs actual"** surfaced on every trade row | We already compute Max R Before Stop and MAE — the inputs. Putting the gap on the trade itself (not only in an aggregate Capture Tracker) makes the leak visible at the moment of review. | dogfood | **S** |
| **A single composite 0–100 score with published weights** | Users need one number to move. Their weights are public so we can adopt or deliberately diverge — e.g. weight *our* Discipline % and Prediction % into it, which they can't, because they don't collect those inputs. **Potential differentiator, not just parity.** | dogfood + commercial | **S** |
| **Playbook = named setup + explicit rule checklist, ticked per trade, then reported per playbook** | We have `Setup` as a flat label. Rules-per-setup with per-rule adherence turns "which setup works" into "which rule I skip costs me money". | dogfood + commercial | **M** |
| **Progress Tracker rules engine** (max daily loss, every trade needs a stop, every trade needs a playbook, start time) | Turns the journal from retrospective to prescriptive. Pairs directly with the day-lock above. | dogfood + commercial | **M** |
| **Simulated/backtested trades journaled into the same analytics engine as live trades** | The strongest structural idea they have. Practice reps compound into the same statistics. Even without replay, letting hand-entered "paper" trades flow through our existing pipeline captures most of the value. | commercial | **M** |
| **Auto-tagging from trade characteristics — but as suggestions requiring accept, not silent writes** | Their 200-mislabelled-trades incident is the lesson. Suggest-and-confirm plus a batch undo is the correct design, and is a marketable trust difference. | dogfood + commercial | **M** |
| **PropFirm eval-fee/payout net-ROI tracking via bank sync** | Free feature aimed at the fastest-growing retail cohort; answers a question nobody else will. If we ever pick a commercial segment, this is evidence the prop cohort is where the growth is. | commercial | **L** |
| **Notebook that auto-files notes written anywhere into one browsable store** | Our notes live in sheet cells and are effectively unbrowsable. Low cleverness, high daily utility. | dogfood | **M** |
| **Dashboard view-mode switcher (R / $ / % / ticks / privacy)** | Privacy view alone (hide dollar amounts) is a small thing users love, and we already have R/$ in the calendar. | dogfood | **S** |
| **Trade Replay of one's own fills, tick-by-tick** | Their genuine differentiator and the thing reviewers rate highest. **Explicitly do NOT build this** — data licensing and storage put it out of reach on our stack. Worth recording as a deliberate no. | — | **XL** |

**The gap they leave us.** Their entire psychology layer is rules-and-tone: checklists, rule adherence, journal sentiment. They collect **nothing about the trader's physical state** — no sleep, no readiness, no energy/tension check-in — and they have no notion of **pre-market prediction accuracy** as a measurable skill separable from execution. Our journal already captures both (Sleep/Readiness/Energy/Tension in the Morning Plan; the Intra-Day / Daily Prediction % vs Execution Skill % funnel). That is the one axis on which we are ahead of the category leader rather than behind it, and it is not a feature they can bolt on — it requires a daily pre-market input ritual they have no hook for. `[I]`

## Sources

- [TradeZella — home](https://www.tradezella.com/) — accessed 2026-09-01
- [TradeZella — Pricing](https://www.tradezella.com/pricing) — accessed 2026-09-01
- [Our Pricing | TradeZella Help Center](https://help.tradezella.com/en/articles/8911582-our-pricing) — accessed 2026-09-01
- [TradeZella New Pricing: Every Plan Explained (2026)](https://www.tradezella.com/blog/tradezella-pricing) — accessed 2026-09-01
- [TradeZella — Features](https://www.tradezella.com/features) — accessed 2026-09-01
- [TradeZella — Trading Journal](https://www.tradezella.com/trading-journal) — accessed 2026-09-01
- [Zella AI — Your AI Trading Partner](https://www.tradezella.com/zella-ai) — accessed 2026-09-01
- [Introducing Zella AI: Your AI Trading Partner (blog, 2026-05-26)](https://www.tradezella.com/blog/zella-ai-your-ai-trading-partner) — accessed 2026-09-01
- [Automated Backtesting Inside TradeZella: Plain English to Results](https://www.tradezella.com/blog/tradezella-automated-backtesting-guide) — accessed 2026-09-01
- [Changelog (Canny)](https://tradezella.canny.io/changelog) — accessed 2026-09-01
- [Introducing the All-New Zella Score! | Help Center](https://help.tradezella.com/en/articles/10305642-introducing-the-all-new-zella-score) — accessed 2026-09-01
- [Zella Scale: Maximize Your Trade Insights | Help Center](https://help.tradezella.com/en/articles/7218420-zella-scale-maximize-your-trade-insights) — accessed 2026-09-01
- [Understanding MAE and MFE | Help Center](https://help.tradezella.com/en/articles/7218426-understanding-mae-and-mfe-maximizing-trade-potential) — accessed 2026-09-01
- [Trade Replay vs Backtesting | Help Center](https://help.tradezella.com/en/articles/11787298-what-is-the-trade-replay-feature-in-tradezella-and-how-does-it-compare-to-backtesting) — accessed 2026-09-01
- [List of Supported Brokers and Platforms | Help Center](https://help.tradezella.com/en/articles/10055421-list-of-supported-brokers-and-platforms) — accessed 2026-09-01
- [What Is PropFirm Sync? | Help Center](https://help.tradezella.com/en/articles/14499729-what-is-propfirm-sync-tradezella-s-command-center-for-prop-firm-traders) — accessed 2026-09-01
- [Understanding Dashboard Widgets and Stats | Help Center](https://help.tradezella.com/en/articles/7118437-understanding-dashboard-widgets-and-stats) — accessed 2026-09-01
- [Understanding the Trade Page | Help Center](https://help.tradezella.com/en/articles/5860216-understanding-the-trade-page) — accessed 2026-09-01
- [Getting Started with TradeZella | Help Center](https://help.tradezella.com/en/articles/13863136-getting-started-with-tradezella) — accessed 2026-09-01
- [Organizing and Managing Notes in Your Notebook | Help Center](https://help.tradezella.com/en/articles/7190696-organizing-and-managing-your-notes-within-your-tradezella-notebook) — accessed 2026-09-01
- [Understanding and Using Progress Tracker Rules | Help Center](https://help.tradezella.com/en/articles/10371695-understanding-and-using-progress-tracker-rules) — accessed 2026-09-01
- [Understanding Mentor Mode | Help Center](https://help.tradezella.com/en/articles/8293313-understanding-mentor-mode) — accessed 2026-09-01
- [List of Supported Indicators | Help Center](https://help.tradezella.com/en/articles/10502927-list-of-supported-indicators-in-tradezella) — accessed 2026-09-01
- [FAQs collection | Help Center](https://help.tradezella.com/en/collections/3281450-faqs) — accessed 2026-09-01
- [How to Export Data to CSV from the Trade Log | Help Center](https://help.tradezella.com/en/articles/9725069-how-to-export-data-to-a-csv-file-from-the-trade-log-page) — accessed 2026-09-01
- [Trustpilot — TradeZella (all reviews)](https://www.trustpilot.com/review/tradezella.com) — accessed 2026-09-01
- [Trustpilot — TradeZella (1–2 star filter)](https://www.trustpilot.com/review/tradezella.com?stars=1&stars=2) — accessed 2026-09-01
- [Railsware — Tradezella case study (tech stack, team)](https://railsware.com/case-studies/tradezella/) — accessed 2026-09-01
- [Tracxn — TradeZella company profile](https://tracxn.com/d/companies/tradezella/__hgHMLnddY9Bb2QABFtMbIxopZIQCK5U7xfF8zaghYfs) — accessed 2026-09-01
- [Crunchbase — TradeZella](https://www.crunchbase.com/organization/tradezella) — accessed 2026-09-01 (via search result metadata)
- [StockBrokers.com — TradeZella Review 2026 (hands-on; pricing stale)](https://www.stockbrokers.com/review/tools/tradezella) — accessed 2026-09-01
- [LuxAlgo — TradeZella Review](https://www.luxalgo.com/blog/tradezella-review-journaling-and-backtesting-platform/) — accessed 2026-09-01
- [Trader's Second Brain — TradeZella Review **(competitor-authored, affiliate/commercial interest)**](https://traderssecondbrain.com/guides/tradezella-review) — accessed 2026-09-01
- [Fast Company — "Built by one of their own, TradeZella lets day traders track and plan transactions" (403 on fetch; used via search summary only)](https://www.fastcompany.com/91212604/built-by-one-of-their-own-tradezella-lets-day-traders-track-and-plan-transactions) — accessed 2026-09-01
- [Apple App Store search API for "tradezella" — no TradeZella app returned](https://itunes.apple.com/search?term=tradezella&entity=software&limit=10) — accessed 2026-09-01
- [Apple App Store — "Tradezell: Buy Sell Trade" (confirmed UNRELATED, different developer)](https://apps.apple.com/us/app/tradezell-buy-sell-trade/id6744620839) — accessed 2026-09-01
- [@TradeZella on X — "planning to release mobile iOS and android app this year" (May 2024)](https://x.com/TradeZella/status/1793510435586802083) — accessed 2026-09-01
- [@TradeZella on X — early Zella Score description (3 metrics)](https://x.com/TradeZella/status/1790858565311172983) — accessed 2026-09-01
