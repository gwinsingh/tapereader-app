# TraderSync

**URL:** <https://tradersync.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "The Trading Journal That Tells You How to Win" `[V]`
**One-line positioning (ours):** The broad-coverage, multi-asset incumbent — the widest broker list and the deepest replay simulator in the category, wrapped around an aging, bug-prone core that mishandles money math.

> **Research constraint:** tradersync.com serves HTTP 403 to WebFetch and to plain
> curl (Cloudflare bot rule). All `[V]` vendor content below was read through the
> `r.jina.ai` text-reader proxy against the live pages on 2026-09-01, and the raw
> markdown of the broker table was parsed programmatically (see *Broker sync,
> counted* below). No account was created and no trial was started.

## Snapshot

| | |
|---|---|
| Founded / age | Founder "David" began trading 2013; first journal MVP built 2019 out of his web-development company; company itself commonly dated **2014**. ~7–12 yrs depending on which date you take. `[V]` (about page) / `[R]` (CB Insights: 2014) |
| Team size (est.) | Small — likely **<25**. No leadership page, no investor page, no press. Support is named individuals ("Pedro", "Nixon") in reviews, i.e. a handful of agents. `[I]` |
| Primary asset classes | Stocks, equity options, futures, futures options, forex, CFDs, indices, crypto `[V]` |
| Primary user segment | Genuinely mixed. The autosync list skews **forex/prop-firm (MetaTrader) and crypto**; the marketing and replay simulator skew **US equity day trader**. Neither is clearly the centre of gravity. `[I]` |
| Business model | Pure subscription SaaS, 3 tiers, no free tier, 7-day trial `[V]` |
| Est. scale (users/revenue) | **50K+ Android installs**, 227 Play reviews, 84 iOS ratings, 321 Trustpilot reviews `[V]`. Mobile installs are a weak proxy for a web-first tool; a reasonable band is **~10k–30k paying subscribers**, i.e. roughly **$4M–$12M ARR** at blended ~$35/mo. Wide error bars — treat as an order-of-magnitude only. `[I]` |

## Pricing

Prices are rendered client-side and did not appear in the fetched pricing page
text, so tier prices are `[R]` from a reputable third party; the **limits and
feature gating below are `[V]`** from tradersync.com/pricing/ itself.

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Pro** | **$29.95/mo**, $312.60/yr (~$26.05/mo) `[R]` | 5 active accounts; 3 strategies; 1 trade plan; 3 playlists; Cypher AI **5 msgs/day**; replay at **1-min candles** | Entry tier. Full analytics suite is *already here* — see paywall note below. `[V]` limits |
| **Premium** | **$49.95/mo**, $521.40/yr (~$43.45/mo) `[R]` | 20 accounts; unlimited strategies/plans/playlists; Cypher **15 msgs/day**; replay at **1-sec (1:1 real time)** | `[V]` limits |
| **Elite** | **$79.95/mo**, $834.60/yr (~$69.55/mo) `[R]` | 50 accounts; Cypher **60 msgs/day** + **Cypher Coach** (proactive); replay at **250 ms**; **Level II**, **Time & Sales**, **Key Stats**, **Screeners**, **Watchlist** in replay; **Automated Backtesting** (stocks/forex/crypto) | `[V]` limits |

- **Free tier / trial:** **7-day free trial, no credit card**, full feature access `[V]` (homepage) / `[R]` (StockBrokers.com). A permanent free "Basic" plan **existed historically and has been removed** `[R]`.
- **Annual discount:** ~13% `[R]`. Heavy seasonal promo culture — a "**Labor Day — Up To 60% Off**" banner sat sitewide on 2026-09-01 `[V]`. Discount codes (e.g. `MM15`) circulate freely `[R]`. **The list price is soft**; effectively they discount continuously.
- **iOS in-app prices disagree with web prices**: App Store lists Pro $29.99/mo **$179.99/yr**, Premium $49.99/mo $299.99/yr, Elite $79.99/mo $399.99/yr `[V]` (App Store listing). Annual-through-iOS is *~40–50% cheaper* than annual-through-web. Either legacy SKUs never retired, or an unmanaged pricing leak. `[I]`
- **Notable paywall lines** `[V]`:
  - **Everything analytical is in the $29.95 tier.** MFE/MAE, exit efficiency, optimal exit point, rolling exit analytics, running P&L, risk exposure, drill-down reporting, side-by-side trade comparison, options spread recognition, autosync, multi-currency, mobile — all three tiers. Of 59 comparison rows scraped, **only 24 cells are locked**, all of them in *replay/simulator/AI*.
  - **The upgrade ladder is therefore not "better journaling" — it is "better simulator + more AI messages."** Pro→Premium buys account count, replay speed and unlimited plans; Premium→Elite buys Level II, Time & Sales, screeners, watchlist, Cypher Coach and automated backtesting.
  - **Refunds:** a "no refunds" policy is repeatedly cited by unhappy users `[R]` (multiple Trustpilot reviews 2023–2026).

**PM read:** gating the *analysis* at the bottom and the *simulation* at the top
is unusual and revealing — they have concluded the journal itself is
commoditised and the defensible, cost-bearing product is the tick-data replay
engine. That is also the most expensive thing they run. `[I]`

## Feature inventory

### Data in (import / sync)

This is their headline claim and the thing we most needed to pin down.

**Broker sync, counted.** We parsed the raw table at
`tradersync.com/supported-broker/` on 2026-09-01. Every row carries six boolean
columns: Stocks, Options, Futures, Forex, Crypto, **Autosync**. Their own tooltip
states: *"Only supported brokers/exchange/applications with a check mark on
'Autosync' column can be imported via a direct connection, otherwise you must
assume that you can simple just upload your trades via export and import using
csv method."* `[V]`

| Metric | Count `[V]` |
|---|---|
| Integration rows listed | **495** (488 distinct names) |
| Rows flagged **Autosync** | **73** |
| Rows that are **CSV-only** | **422 (85%)** |
| Autosync as % of list | **~15%** |

**The "700+ / 900+ brokers" claim does not survive contact with their own table.**
Their homepage says "over **700** brokers and trading platforms" `[V]`;
third-party reviews and their own affiliate/SEO material say "**900+**" `[R]`.
Their published integration table contains **495 rows**. `[I]` The gap is
marketing inflation, and the number that actually matters — true auto-sync — is
**73**.

**Is it an aggregator?** No evidence of SnapTrade, Plaid, Akoya or similar. The
composition of the autosync list is the tell — it is **an in-house pile of
per-source adapters**, and grouping the 73 by their logo asset shows the real
mechanism count is far smaller than 73: `[V]` (parsed) / `[I]` (interpretation)

| Mechanism | Rows | What it actually is |
|---|---|---|
| **MetaTrader 4/5 investor-password sync** | **31** | Aqua Funded, Atlas Funded, Blue Guardian, Bright Funded, City Traders Imperium, FXIFY, Funder Pro, Goat Funded Trader, Hola Prime, KudoTrade, Markets4You, Maven Trading, MidasFX, Moneta Funded, MOT Capital, Sure Leverage Funding, Traderscale, WM Markets, XM Global, Oanda (MT), Bybit (MT) … — **all render the MT4 logo.** These are not 31 integrations; they are **one MetaTrader adapter** resold across 31 forex brokers and prop firms. |
| **PropReports** | **2** | PropReports itself + Zimtra. PropReports is the back-office reporting vendor used by US prop desks; TraderSync reads it and thereby claims ~15 prop firms (Black Eagle FG, CMEG, CenterPoint, Chimera, Great Point, T3Trading, Venom, Vortex, …) — **one adapter, many logos.** `[V]` (their PropReport support page) |
| **Genuinely distinct connectors** | **~40** | 5paisa, Alpaca, Binance, Bitfinex, Bitget, BitMEX, Bitstamp, ByBit, CMEG, CenterPoint (US + Canada), **Charles Schwab / TDA**, Coinbase, Coinex, Crypto.com, cTrader, Deribit, Dhan, dYdX, FXCM, Gemini, Huobi, **Interactive Brokers**, Iron Beam, Kraken, Kucoin, MEXC, **NinjaTrader**, Nuvama, Oanda, Ocean One, OKX, Phemex, **Tastytrade**, TradeLocker, **TradeStation**, **Tradier**, **Tradovate**, WOOX, Zerodha |

**So the true engineering surface is roughly: MetaTrader + PropReports + cTrader
+ ~20 crypto-exchange REST/API-key readers + ~12 real broker connectors.** `[I]`
The crypto exchanges are the cheapest possible integrations (user pastes a
read-only API key/secret; every exchange exposes a `myTrades`-style endpoint,
and ccxt-shaped libraries normalise them). Strip those out and **the genuinely
hard, US-broker-specific work is about a dozen connectors.** `[I]`

**And even the marquee ones are not real APIs.** Their own IBKR page describes
the flow as *"Directly upload your IBKR data using the **Flex Query** reporting
tool"* `[V]` — i.e. the user configures an IBKR Flex Query and TraderSync pulls
the generated report via the Flex Web Service token. That is a scheduled report
fetch, not an OAuth brokerage API. `[I]` Same shape for MetaTrader (investor
password → account history) and PropReports (portal credentials → report).
**The moat is much shallower than the logo wall implies.**

**Who is CSV-only** (verified false in the Autosync column) `[V]`:
**Robinhood, Webull, Fidelity, E*TRADE, DAS Trader, Lightspeed, Sterling Trader
Pro, Cobra Trading, SpeedTrader, TradingView, Rithmic R Trader, TopstepX,
ProjectX, Apex-cleared brokers, Coinbase Pro.**

This is a large, specific hole. **The entire US retail-brokerage mass market
(Robinhood, Webull, Fidelity, E*TRADE) and the entire US day-trading /
prop-futures execution stack (DAS, Sterling, Lightspeed, Rithmic, TopstepX,
ProjectX) are manual CSV.** `[I]` A 2-star Trustpilot reviewer (Shiva
Gurumurthy, 2026-08-04) complains specifically that Robinhood requires manual
CSV uploads `[R]` — the gap is felt, not theoretical.

**Marketing/reality gap.** The `/trading-journal/` page runs a logo wall headed
*"Integration with Top Brokers / Exchanges — Seamlessly integrate with popular
brokers to **automatically journal your trades**"* featuring DAS Trader, Webull,
Robinhood, ThinkOrSwim, Rithmic, TopstepX, Sterling, Cobra, Vanguard, Ally,
TC2000 — **and FTX**, defunct since November 2022. `[V]` None of those have
autosync in their own table; FTX has not existed in nearly four years. `[I]`

Other import paths `[V]`: CSV/Excel upload, manual entry, multiple accounts per
broker (added 2025-06-30), auto-applied fees & commissions, multi-currency
conversion to a common reporting currency.

### Trade construction & data model

- **Options spread auto-detection** — groups legs into recognised structures (verticals, strangles, butterflies, iron condors) and reports P&L and win rate at the *strategy* level, not the leg level. `[V]` Tracks put/call, strike, expiry per leg. `[V]` This is the single most technically substantial part of their data model.
- **Futures**: auto-detected contracts and contract multipliers; futures **options** treated as a distinct asset class from equity options. `[V]`
- **Multi-currency**: per-trade base currency normalised to a reporting currency. `[V]`
- **Where it breaks (and this is the recurring failure mode):**
  - **Options rolls are not modelled.** iOS reviewers report the app "doesn't properly track option rolls or complex spreads, forcing manual workarounds." `[R]` A roll is economically one decision but mechanically a close + open across two expiries; without a roll primitive the P&L attribution is wrong.
  - **No unrealized P&L / open-position view.** Repeatedly called a deal-breaker by iOS reviewers. `[R]` The data model is **closed-round-trip-only** — the same architectural choice our own journal makes. It suits day traders and fails swing/options traders. `[I]`
  - **"Zombie trades"** — failed API parsing (ThinkOrSwim cited) leaves positions stuck open, requiring manual closure. `[R]` (Trustpilot, Zezen Nguyen 2026-05-23; Kenneth 2024-05-04)
  - **Currency-base bugs corrupt commissions, fees and P&L.** Multiple independent reports, USD/GBP specifically, one unresolved for 7 months. `[R]` (Trustpilot, "Disappointed" 2026-05-01; "alxxx xxxa" 2026-04-20)
  - **CSV import scaling bug** — one user reports imported trade sizes reduced "by 10x". `[R]`

### Core analytics & statistics

All available at the **entry tier** `[V]`:

- **MFE / MAE per trade** with excursion-vs-outcome efficiency framing
- **Exit Efficiency** — actual exit vs. the best post-trade price
- **Optimal Exit Point Analysis** — the highest-value exit that was available
- **Rolling Exit Analytics** — performance of scaled/multi-part exits
- **Running P&L chart** — intra-trade equity path from entry to exit
- **Target / Stop Execution Tracking** — did the trade respect its declared levels
- **Risk Exposure Report** — risk per trade / setup / portfolio
- **What-If Simulator** — counterfactual "what if every trade were timed differently"
- **Evaluator** — side-by-side strategy comparison
- **Calendar** — daily P&L calendar
- **Advanced Filtering** + **Drilled-Down Reporting** (zoom any report range into raw trades and generate a focused sub-report)
- **Granular Trade Breakdown**, **Side-by-Side Trade Comparison**
- Breakdowns by symbol, time-of-day, day, month, setup, sector, mistake `[V]`/`[R]`

**Assessment:** the excursion/exit-quality family (MFE, MAE, exit efficiency,
optimal exit, rolling exit) is **the most complete in the category** and is
directly comparable to — and broader than — our own Max R Before Stop / MAE (R) /
Capture Tracker trio. They have the same insight we do (the leak is in the exit)
and have built four separate lenses on it. `[I]`

**Missing:** no R-multiple-native framing anywhere in their published feature
list — no per-trade R, no R-multiple distribution, no expectancy-in-R. `[I]`
Everything is dollar- and percentage-denominated. For a risk-unit-driven trader
that is a real gap.

### Charts & visual review

- **Trade Chart Visualization** — entries/exits/overlays plotted on price `[V]`
- **Interactive price-action charts**, zoomable `[V]`
- **Market Replay Simulator** — the flagship. Tick-by-tick reconstruction at 1-min / 1-sec / 250ms by tier, across US equities, equity options, futures, futures options, forex, crypto; **Level II order-book reconstruction** (US stocks, options, futures) and **colour-coded Time & Sales tape** at Elite; indicators, multiple charts, speed control (2x/3x/5x and 1/5/10/30 min-per-second), go-to, screeners during replay, watchlists, **"Play Entire Universe"**, and **Playlists** of curated setups to re-drill. Claims **30,000+ backtestable assets**. `[V]`
- **Automated Backtesting** (Elite) — rule-based strategies backtested on historical stock/forex/crypto data `[V]`
- **Complaint:** charting displays **only one trade at a time**; users cannot see multiple trades on a single chart or a daily summary view. `[R]` (iOS reviews)
- **Complaint:** Replay is "so buggy" and premium/elite features "unusable". `[R]` (Trustpilot, Vinay 2026-01-25)

### Journaling, notes & tagging

- Free-text trade journal / notes `[V]`
- **Custom trade tags** — user-defined labels for emotions, market conditions, strategy, mistakes `[V]`
- **Public trade sharing** — publish individual trades `[V]`
- **Complaint:** the journal itself is "poorly organized" — no daily summary view. `[R]` (iOS reviews). Notably, journaling is the *least* developed surface of a product called a trading journal. `[I]`

### Psychology / discipline / process

Thin, and largely delegated to tags and to the AI. `[I]`

- Emotion/mistake tagging via the generic custom-tag system `[V]`
- **Strategy Checker** — rule-based validation of a trade against a declared strategy `[V]`
- **Cypher Coach** (Elite) — "monitors every trade, ensuring you stick to your refined strategy", "I catch when you slip" `[V]`
- **No structured pre-market psych check-in** (energy, tension, sleep, readiness) `[I]` — nothing of the kind appears in any published feature list. This is a real gap and one we happen to have already built.

### Planning & pre-market

- **Trade Planning** — "Create detailed trade plans with entry, exit, risk, and strategy notes **before executing your trades**." Limited to **1 plan** on Pro, unlimited above. `[V]`
- **Strategy Creations** — "detailed trade plans with time filters, risk rules, and position limits". **3 on Pro**, unlimited above. `[V]`
- Cypher assists in building and adapting plans, and ties risk parameters to measured performance. `[V]`
- **Watchlist** exists only *inside the replay simulator*, Elite-only — not as a live pre-market watchlist. `[V]`
- **Assessment:** they have plan-vs-execution machinery (plan → Strategy Checker → adherence), which is the same axis as our Morning Plan → Origin → Process Followed. But it is **strategy-rule-shaped, not day-shaped** — there is no evidence of a dated morning watchlist with per-symbol conviction/thesis/catalyst, nor of auto-attributing a filled trade back to a pre-market plan row. `[I]`

### Risk & money management

- Risk Exposure Report (per trade / setup / portfolio) `[V]`
- Position limits and risk rules inside Strategy definitions `[V]`
- Cypher "Tie Risk to Reality" — set risk from measured performance metrics `[V]`
- Auto-applied fees & commissions; net-P&L-after-costs reporting emphasised heavily on the IBKR/Schwab/Binance pages (maker/taker fees, funding rates, gas costs, swap fees, exchange/regulatory fees) `[V]`
- **No R-multiple risk unit, no per-date risk-unit schedule** `[I]`

### Playbooks / setups / rules engine

- **Strategies** (3 on Pro / unlimited above) with time filters, risk rules, position limits `[V]`
- **Strategy Checker** validates trades against them `[V]`
- **Evaluator** compares strategies side by side `[V]`
- **Playlists** (3 on Pro / unlimited above) — curated collections of trades, strategies or sessions to re-watch in replay `[V]`. This is a genuinely good idea: a *deliberate-practice* primitive, not just a reporting one. `[I]`

### AI & automation

**Cypher**, launched ~June 2025 `[V]`:

- **Assistant** — conversational Q&A over your own trade history; **5 / 15 / 60 messages per day** by tier `[V]`
- **Natural-language filtering** — "find trades with the Gap and Go setup, not placed on Tuesdays, executed between 10–11 AM" and it filters journal + analytics `[V]` (changelog 2025-07-05). This is the most defensible AI feature: NL → structured filter over a well-typed trade table, cheap to build, immediately useful. `[I]`
- **Cypher Coach** (Elite only) — proactive, unprompted pattern detection and alerts `[V]`
- Marketed as seven personas (Performance, Strategy Intelligence, Planning & Risk, Pattern Detection, Insights, Accountability, Trade Review) `[V]` — presentation, not seven systems. `[I]`
- **A hard daily message cap is a strong signal that inference cost is not comfortably absorbed by a $30–$80/mo subscription.** `[I]`

### Reporting, sharing & social

- Customisable reports by symbol/time/setup/mistake/market; drill-down to raw trades `[V]`
- Public trade sharing `[V]`
- **No community, no social feed, no mentor/coach seat, no team accounts.** Explicitly called out as a con vs. Tradervue. `[R]` (StockBrokers.com, 2026-08-14)

### Mobile, integrations & platform

- **iOS** app: **2.7★ / 84 ratings**, 28 MB, iOS 13.4+, **last updated v2.10.15 on 2025-03-12** `[V]`
- **Android** app: **3.1★ / 227 reviews, 50,000+ downloads** `[V]`
- Mobile app included on all tiers `[V]`
- Mobile is review/analytics/notes only — no unrealized P&L, no current account value `[R]`
- Web app at `app.tradersync.com`; marketing site is **WordPress** (`/wp-content/themes/tradersync_v26/`) `[V]`
- **No public API for users**, no webhooks, no Zapier — nothing found `[I]`
- **Public changelog is stale: latest entry 2025-07-09**, ~14 months before the as-of date, despite the page being linked as "What's New" in primary nav `[V]`

## What they do genuinely well

1. **Exit-quality analytics are the best in the category.** MFE/MAE + Exit Efficiency + Optimal Exit Point + Rolling Exit Analytics + Running P&L is four independent lenses on the one question that actually separates profitable discretionary traders — *did you leave money on the table, and where.* `[V]`
2. **Options spread auto-detection.** Grouping raw legs into named structures and reporting at strategy level is real, unglamorous, high-value work most competitors skip. `[V]`
3. **The replay simulator is a moat by cost, not cleverness.** 250ms ticks with reconstructed Level II and Time & Sales across US equities, options, futures, forex and crypto, over 30,000 assets, is an enormous historical-data bill and a hard rendering problem. Nobody else in the journal category offers it at this depth. `[V]`/`[I]`
4. **Playlists** — curating sets of past trades/sessions to re-drill turns the journal into a practice tool rather than a filing cabinet. `[V]`
5. **Cost accuracy as a first-class concern** — maker/taker, funding rates, swaps, exchange and regulatory fees, multi-currency. Boring, and correct. `[V]`
6. **Everything analytical ships at $29.95.** The entry tier is genuinely capable, not a demo. `[V]`
7. **Programmatic SEO at scale** — a landing page per broker (~490), per asset class, per competitor ("TradeZella alternative"). This is a real distribution asset and probably the single biggest reason they still lead on brand recall. `[V]`/`[I]`

## Where they are weak

**Structural (hard for them to fix):**

1. **The autosync moat is 15% of the logo wall, and the missing 85% is precisely the US retail and US day-trading market.** Robinhood, Webull, Fidelity, E*TRADE, DAS, Sterling, Lightspeed, Rithmic, TopstepX, ProjectX are all CSV. Fixing this needs either an aggregator deal (SnapTrade/Plaid — a per-connected-account COGS they would have to absorb) or ~10 new bespoke connectors against brokers that mostly don't want to be connected to. Both are expensive; the second is also perpetual maintenance. `[I]`
2. **The claim itself is a liability.** "700+ / 900+ brokers" sets an expectation their own table contradicts, and users discover it *after paying* (they have a no-refund policy). That is a churn engine, and reviews show it firing. `[I]`
3. **Money math is not trustworthy, and has not been for years.** Currency-base errors, zombie trades, 10x CSV size scaling, P&L that won't reconcile with ThinkOrSwim — reported continuously from 2021 through 2026 by independent reviewers. `[R]` For a product whose only output is numbers, this is existential, and its persistence across five years suggests **deep data-model debt, not a bug queue**. `[I]`
4. **Closed-round-trip-only data model.** No unrealized P&L, no open-position view, no option rolls. Retrofitting a position-state model onto a trade-completion model is a rewrite, not a feature. `[I]` It also structurally excludes swing and options-income traders — a large, well-monetising segment.
5. **Support does not scale with the surface area.** Seven-month unresolved tickets, cases dropped when staff leave, named agents described as rude across five separate years. `[R]` A small team maintaining ~40 fragile connectors, six asset classes and a tick-replay engine will always be support-bound. `[I]`
6. **Replay is a permanent COGS anchor.** Tick + Level II + Time & Sales history across six asset classes and 30k assets must be paid for every month regardless of usage, which is presumably why the AI is rationed by message count.

**Cosmetic / fixable:**

7. Stale marketing — FTX still on the "automatically journal your trades" logo wall in 2026 `[V]`; changelog untouched for 14 months `[V]`; iOS app not updated since March 2025 `[V]`.
8. Mobile is bad and known to be bad (2.7★ / 3.1★ against a 4.4 Trustpilot) `[V]`.
9. UX complexity — "super complex", "rather poor UX", "confusing", "inconsistent filters" `[R]`.
10. Journaling and psychology — the two things the category is named after — are the least developed surfaces `[I]`.

**The rating spread is the most diagnostic single fact.** Trustpilot **4.4/5 (321
reviews, 89% five-star)** vs App Store **2.7/5** vs Play Store **3.1/5** `[V]`.
Trustpilot reviews are typically solicited at a moment of satisfaction (support
ticket closed); app-store ratings are unsolicited. **The 1.3–1.7 star gap is the
honest measure of the product's day-to-day experience.** `[I]`

## What real users say

- **Praise:**
  - "the best IBKR importing I've used" — vendor-published testimonial `[V]` (treat with suspicion, but it is at least consistent with the Flex Query mechanism being solid).
  - "Auto sync has made things more easier" — Trustpilot, Vinay Adapa, 2026-02-06 `[R]`
  - "Customer support was quick, efficient and willing to go the distance" — Trustpilot, M.A., ~2026-09-01 `[R]`
  - "Platform has great functionality, gets regular updates, and has awesome support" — App Store `[R]`
  - "the most versatile and easy to use one, very beautifully designed" `[R]`
  - Calendar P&L view and the Evaluator/simulator singled out positively `[R]`

- **Complaints** (all `[R]`, Trustpilot unless noted, dates as shown):
  - **Broken sync / data integrity** — "Zombie Trades" from failed ThinkOrSwim API parsing; dashboard showing "$4,500 instead of $160" (Zezen Nguyen, 2026-05-23); "API sync with major brokers is fundamentally flawed" (same); "API doesn't sync correctly, trades aren't picked up, many show open requiring manual closure" (Kenneth, 2024-05-04).
  - **Currency / commission corruption** — "applying the wrong currency base to both auto and manual trades, messing up commissions, fees, profit calculations" ("Disappointed", 2026-05-01); USD/GBP unresolved **7 months**, case reassigned when the agent left, CSV import reducing trade sizes "by 10x" ("alxxx xxxa", 2026-04-20).
  - **P&L won't reconcile** — "P/L was always wrong and support guys were always trying to tweak it on their end, to no avail" vs ThinkorSwim `[R]`.
  - **Missing unrealized P&L** — repeatedly called a deal-breaker (App Store, multiple).
  - **Options rolls / complex spreads unsupported**, forcing manual workarounds (App Store).
  - **Performance** — "buggy and laggy, and sometimes will straight up just not load" (2026-04-27); "server is extremely slow" (2024-05-04); unresponsive buttons needing page refresh (App Store).
  - **Replay unusable at the tier you paid for** — "Premium/elite features unusable, Replay is so buggy, advanced features still being developed" (Vinay, 2026-01-25).
  - **Support** — "customer service is just not good enough", 7-month delays (2026-04-20); "rude and unprofessional" (2026-04-27, naming an agent); "abhorrent… so rude" (2022-02-10); "10+ unanswered support messages" on the $79.95 Elite plan (2021-02-07); "a dev is looking into it" as the standing answer (2023-03-02).
  - **Billing** — charged "long after you cancel" (2023-08-05); "no refunds" (multiple, 2023–2026); bait-and-switch discount terms (2021-03-23).
  - **Data loss** — "riddled with bugs… including loss of my data" after a year of use (2023-03-02).
  - **Coverage gap felt directly** — Robinhood requires manual CSV (Shiva Gurumurthy, 2026-08-04).
  - **Third-party cons** — no permanent free version; high price vs Edgewonk (~$169/yr); no community features (StockBrokers.com, 2026-08-14).

- **Why people leave:** in rough order of frequency in the negative corpus — (1) **the numbers are wrong and stay wrong**, (2) **support doesn't close the loop**, (3) **the broker I actually use isn't really auto-synced**, (4) **price vs. the bugs I'm living with**, (5) UX complexity. `[I]` One reviewer states plainly that users are switching to competitors (2026-04-12) `[R]`.

## Engineer's read

**Data model.** Round-trip-completion-centric, exactly like ours: fills in →
grouped into closed trades → analytics over closed trades. Evidence: no
unrealized P&L, no open-position view, "zombie trades" when grouping fails, no
option-roll primitive. The **options layer sits on top** as a leg-grouping pass
that recognises named structures — that is the genuinely non-trivial part, and
it is where roll support would have to live (a roll spans two round trips and
two expiries, so it needs an explicit link entity, not a grouping heuristic).
`[I]`

**Multi-asset is mostly a units problem, and they solved it the boring way.**
Contract multipliers for futures, leg×100 for equity options, base/quote for
forex and crypto, plus a per-trade currency normalised to a reporting currency.
The recurring currency-base bugs suggest **currency is a late retrofit**, likely
a column added rather than a value object threaded through every computation —
which is exactly the failure mode you get when commissions and fees are computed
in one currency and P&L in another. `[I]` **Lesson for us: if we ever go
multi-currency or multi-asset, currency and multiplier belong in the trade
primitive on day one, not bolted on.**

**Broker sync approach — the finding that matters most for our build estimate.**
No aggregator. It is an in-house adapter zoo, and the adapters fall into four
cost classes: `[I]`

| Class | Examples | Real cost to build |
|---|---|---|
| **Report-fetch** (creds/token → periodic file) | IBKR Flex Query, MetaTrader investor password, PropReports | **S each.** IBKR Flex is a documented token + `SendRequest`/`GetStatement` XML pull. This is a scheduled fetch + parser, not an OAuth integration. |
| **Exchange API-key readers** | Binance, Kraken, Coinbase, ByBit, OKX, ~20 more | **S each, XS with ccxt-shaped normalisation.** User pastes read-only key/secret; hit the trade-history endpoint; paginate. |
| **Real broker OAuth/API** | Schwab/TDA, Tradier, Tradovate, TradeStation, Alpaca, Tastytrade | **M–L each.** OAuth app registration, per-broker review/approval, token refresh, rate limits, and breaking changes you don't control (the TDA→Schwab migration broke every integration in the category). |
| **CSV** | the other 422 | **XS each, but ~420× tedium.** Header detection, dialect quirks, timezone, side vocabulary, fee columns. |

**The strategic read: ~31 of their 73 "autosync" integrations came from a single
MetaTrader adapter and ~15 more from a single PropReports adapter.** Finding
the *aggregator-shaped* sources — one integration that unlocks dozens of
downstream brokers — is worth far more than grinding out individual broker APIs.
For US futures/prop the equivalents are **Rithmic, ProjectX and Tradovate**;
for US retail it is **SnapTrade** (which does cover Robinhood, Webull, Fidelity,
E*TRADE — precisely TraderSync's hole). `[I]`

**Hard to build:** the replay engine (tick + Level II + Time & Sales history,
storage, and a 250ms-cadence renderer) — this is a data-licensing and
infrastructure problem, not a coding one, and on our stack it is flatly
incompatible with Cloudflare free-tier D1 and an in-memory-only cache. The
options spread recogniser is genuinely hard. Multi-currency-correct cost
accounting is hard *to keep* correct. `[I]`

**Easy but tedious:** the 400+ CSV parsers; the exchange API-key readers; the
report-fetch connectors; the entire analytics inventory (MFE/MAE, exit
efficiency, optimal exit, rolling exit, running P&L are all straightforward
walks over intraday bars once you have them — **we already compute three of the
five**). `[I]`

**Rendering:** trade-on-chart overlays and interactive price-action charts are
standard client-side charting. Their "one trade per chart" limitation is a UI
choice, not a technical wall. `[I]`

**Platform:** WordPress marketing site + separate SPA at `app.tradersync.com`.
Programmatic SEO generates ~490 broker pages from a template — visibly so: the
MetaTrader (forex) page carries boilerplate about "option type put/call, strike
prices, expiry dates". Cheap, effective, and slightly embarrassing. `[V]`

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Optimal Exit Point** — the best exit actually available in the holding window, and the gap to it | We already have Max R Before Stop (MFE) and Capture %. The *price-and-time of the best exit*, surfaced per trade, converts "you left 1.2R" into "you should have been out at 10:47". Small delta on existing 1-min bar walks. | dogfood | **S** |
| **Rolling Exit Analytics** — performance of each scaled-out tranche | We track `# Partials` but never analyse partial *quality*. Answers "is my first partial too early?" — a question our Capture Tracker raises but cannot settle. | dogfood | **M** |
| **Playlists** — curated collections of past trades/sessions to re-review deliberately | Turns the journal from a record into a practice tool. Cheap on our stack: a named saved filter + ordered trade-id list. Pairs naturally with our Screenshot Review. | dogfood + commercial | **S** |
| **Natural-language filtering** ("Gap and Go, not Tuesdays, 10–11am") | The highest-leverage AI feature in the category and the cheapest: LLM emits a structured filter against a typed schema, no RAG, no fine-tune. Our `applyRowFilter()` / `parseStatsFilter()` is already the target representation — this is a translation layer over code we've written. | dogfood + commercial | **M** |
| **Strategy Checker** — declare rules (time window, risk cap, position limit), auto-validate each trade | Our `Process Followed?` is a single manual Yes/No. Machine-checking the mechanical subset would make Discipline % objective instead of self-reported — a strictly better version of a metric we already ship. | dogfood | **M** |
| **Cost accuracy as a feature** (fees, commissions, multi-currency, net P&L) | Their most-cited bug class is also their most-marketed feature. Getting this right is table stakes and a credible wedge *against* them. For us: currency + multiplier belong in the trade primitive from day one. | commercial | **M** |
| **Aggregator-shaped integrations over per-broker ones** | 31 of their 73 autosyncs came from one MetaTrader adapter. Our equivalents: **SnapTrade** (Robinhood/Webull/Fidelity/E*TRADE — their exact hole), **Rithmic/ProjectX/Tradovate** (US prop futures), **PropReports** (US equity prop desks, which is our own DAS-adjacent world). One integration, dozens of logos. | commercial | **L** |
| **IBKR Flex Query import** | Their marquee "autosync" is a token-authenticated scheduled report pull. Cheap, well-documented, edge-fetchable, and buys the single most-requested broker. There is no reason we couldn't ship this. | dogfood + commercial | **S–M** |
| **Broker-page programmatic SEO** | ~490 templated landing pages is their real distribution moat and costs almost nothing on a static/Next.js site. Note the failure mode to avoid: don't ship a forex page that talks about strike prices, and delete brokers that no longer exist. | commercial | **M** |
| **Publish an honest integration matrix** | Their tooltip-buried Autosync column is the most useful page on the site and is contradicted by their own homepage. A competitor whose headline number is the *true* auto-sync count, stated plainly, converts their churn. | commercial | **S** |

**What NOT to steal:** the replay simulator. It is their deepest moat and their
heaviest cost, it is incompatible with our free-tier Cloudflare architecture, and
their own users say it is buggy at the tiers that pay for it. `[I]`

## Sources

- [TraderSync homepage](https://tradersync.com/) — accessed 2026-09-01 (via r.jina.ai)
- [TraderSync pricing](https://tradersync.com/pricing/) — accessed 2026-09-01 (via r.jina.ai; feature matrix and tier limits parsed from raw markdown)
- [Supported Brokers / Exchanges / Applications](https://tradersync.com/supported-broker/) — accessed 2026-09-01 (via r.jina.ai; 495-row table parsed programmatically)
- [List of Supported Brokers, Exchanges, and Apps (support)](https://tradersync.com/support/supported-brokers-exchanges/) — accessed 2026-09-01
- [PropReport Compatible Brokers for Synchronization](https://tradersync.com/support/how-can-i-synchronize-my-propreport-broker/) — accessed 2026-09-01
- [DAS Compatible Brokers for Trading Synchronization](https://tradersync.com/support/which-brokers-are-compatible-for-synchronization-with-das/) — accessed 2026-09-01
- [Which brokers do you support?](https://tradersync.com/topics/which-brokers-do-you-support/) — accessed 2026-09-01
- [Interactive Brokers integration page](https://tradersync.com/broker/interactive-brokers/) — accessed 2026-09-01 (Flex Query mechanism)
- [Charles Schwab / TDA integration page](https://tradersync.com/broker/charles-schwab-tda/) — accessed 2026-09-01
- [Binance integration page](https://tradersync.com/broker/binance/) — accessed 2026-09-01
- [MetaTrader integration page](https://tradersync.com/broker/metatrader/) — accessed 2026-09-01
- [Trading Journal / Analytics product page](https://tradersync.com/trading-journal/) — accessed 2026-09-01
- [Market Replay Simulator product page](https://tradersync.com/market-replay-simulator/) — accessed 2026-09-01
- [Cypher (AI Performance Assistant) product page](https://tradersync.com/cypher/) — accessed 2026-09-01
- [Software Updates / What's New changelog](https://tradersync.com/software-updates/) — accessed 2026-09-01 (latest entry 2025-07-09)
- [About TraderSync](https://tradersync.com/about-us/) — accessed 2026-09-01 (founder story, 2013/2019 timeline)
- [Billing, Cancellation and Refund Policy](https://tradersync.com/billing-cancellation-and-refund-policy/) — accessed 2026-09-01
- [TradeZella alternative page (TraderSync)](https://tradersync.com/tradezella-alternative/) — accessed 2026-09-01
- [TraderSync on Trustpilot](https://www.trustpilot.com/review/tradersync.com) — accessed 2026-09-01 (4.4/5, 321 reviews, 89% 5-star)
- [TraderSync Trustpilot 1- and 2-star reviews](https://www.trustpilot.com/review/tradersync.com?stars=1&stars=2) — accessed 2026-09-01 (reviews dated 2021-02 through 2026-08)
- [TraderSync on the App Store](https://apps.apple.com/us/app/tradersync/id1177329277) — accessed 2026-09-01 (2.7★, 84 ratings, v2.10.15 / 2025-03-12, IAP prices)
- [TraderSync App Store reviews](https://apps.apple.com/us/app/tradersync/id1177329277?see-all=reviews&platform=iphone) — accessed 2026-09-01
- [TraderSync on Google Play](https://play.google.com/store/apps/details?id=com.tradersync) — accessed 2026-09-01 (3.1★, 227 reviews, 50,000+ downloads)
- [TraderSync Review 2026: Pros, Cons, and Pricing — StockBrokers.com](https://www.stockbrokers.com/review/tools/tradersync) — accessed 2026-09-01 (article dated 2026-08-14; tier prices)
- [TradeZella vs TraderSync (TradeZella)](https://www.tradezella.com/vs/tradersync) — accessed 2026-09-01 (competitor framing; treat as adversarial)
- [Tradersync Trading Journal Broker and Platform Integrations (Trademetria)](https://trademetria.com/integrations/tradersync) — accessed 2026-09-01 (competitor framing)
- [CB Insights — TraderSync company profile](https://www.cbinsights.com/company/tradersync) — accessed 2026-09-01 (founded 2014)
- [Benzinga — TraderSync review](https://www.benzinga.com/money/tradersync-review) — accessed 2026-09-01
- [ghffee/tradersync (GitHub SEO mirror)](https://github.com/ghffee/tradersync) — accessed 2026-09-01 — **affiliate/SEO content, not authoritative; used only to corroborate tier prices and the "900+" claim**

**Re-verify before this drives a build decision:** tier prices (JS-rendered, not
directly readable), the 900+/700+ broker claim, and the autosync count — the
table is live and changes.
