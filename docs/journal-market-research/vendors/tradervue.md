# Tradervue

**URL:** <https://www.tradervue.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "The Trading Journal to Improve Your Trading Performance" `[V]`
**One-line positioning (ours):** The category's founding statistician — the deepest execution-quality
analytics in retail journaling, wrapped in a 2013 web app, owned since 2021 by a cash-flow-optimizing
SaaS holding company that has shipped almost nothing structural since.

## Snapshot

| | |
|---|---|
| Founded / age | 2011, by Greg Reinacker (software entrepreneur turned trader). ~15 years old — the oldest serious player in the category. `[V]` (SureSwift acquisition post, `help/3437-swing-trades` says "When Tradervue was first released in 2011, it was tailored for active intraday traders") |
| Ownership | Acquired by **SureSwift Capital, Inc.** — a bootstrapped-SaaS roll-up / holding company. Announcement dated **2021-03-30**; SureSwift's own later commentary dates the deal to **September 2020**. Footer on every page today reads "© 2026 SureSwift Capital, Inc." `[V]` |
| Team size (est.) | The acquisition post named **4 people** on Tradervue: 2 product managers (Michael Thomas, John Lien), 1 software engineer (Deepak Vig), 1 support (Richard Dalder). `[V]` Today's webinar host is still Richard Dalder. `[V]` Realistically a 3–6 person shared-services team inside a portfolio. `[I]` |
| Primary asset classes | US equities & ETFs, options, futures (long explicit contract list), forex. **No crypto spot** — only CME/CBOE Bitcoin futures. `[V]` (`help/2784-supported-trading-products`) |
| Primary user segment | US intraday equity and futures traders; secondarily prop/education firms via the `trading-firms` org product. Swing support was retrofitted ~2021. `[V]` |
| Business model | Freemium SaaS. Free plan (30 grouped trades/mo, stocks/ETFs only) → Silver → Gold. Plus a B2B org tier for firms, and a 20% lifetime-recurring affiliate program. `[V]` |
| Est. scale (users/revenue) | Homepage: "Join **207,623** traders" `[V]`; their own blog says "Trusted by 200,000+ traders" `[V]`. Cumulative signups, not actives. **TTM EBITDA $826k at acquisition → $1,432k by Dec 2023 (+73%)** — stated publicly by SureSwift founder Don Wharton on LinkedIn, Mar 2024 `[R]`. At typical bootstrapped-SaaS margins that implies roughly **$2.5–4M ARR** and on the order of **5,000–9,000 paying subscribers** `[I]` — i.e. ~3–4% of the signup count converts. |

## Pricing

Prices read directly off `tradervue.com/site/pricing/` on 2026-09-01.

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Free** | $0 | Stocks/ETFs only; **30 grouped trades per calendar month**; auto price charts, entries/exits on charts, tagging & filtering, overview + detailed reports, dashboard, share trades with community | **Not shown on the pricing page at all** — you only find it in the help center and via the "Sign Up For Free" CTA. `[V]` The quota counts *grouped trades*, not executions, so thousands of fills can fit. `[V]` |
| **Silver** | **$29.95/mo** | Unlimited trade imports, unlimited trading accounts, unlimited mentors/mentees, Broker Sync, futures/forex/options, intraday & running P&L charts, Renko/Volume-Bar/Range-Bar charts, **MFE/MAE statistics**, multiple independent accounts, CSV export, 1 GB image storage, mentoring, chart studies & comparison symbols, adjustable auto-merge/auto-split, P&L with shared trades | `[V]` |
| **Gold** | **$49.95/mo** ("Most popular") | Everything in Silver plus: **Trade Exit Performance Analysis**, **Max Potential P&L Analysis**, **Commissions & Fees Support**, interactive drill-down reports, **advanced reports ("more than 100")**, advanced filters, **risk tracking and reporting (R-multiples)**, **liquidity reports**, selectable base currency, 5 GB image storage | `[V]` |
| **Firms / orgs** | Not published | Admin control panel, group reporting across the firm, API for automated import + user management, branded `yourfirm.tradervue.com` subdomain, **all traders get Gold-level access**, consolidated monthly invoice | Contact-sales. `[V]` |

- **Free tier / trial:** Free plan is permanent. Trials exist only for Silver/Gold at signup and **require a card**: "Your credit card will be automatically charged when the trial period is up, unless you switch to a free plan before the end of the trial period." `[V]` Third parties consistently report 7 days. `[R]`
- **Annual discount:** Not shown on the pricing page. StockBrokers.com reports Silver $323.46/yr (10% off) and Gold $479.52/yr (20% off) `[R]`; another 2026 review says no annual discount is advertised `[R]`. Treat as unverified.
- **Notable paywall lines:**
  - **Asset class is the first wall.** Free is stocks/ETFs only — futures, forex and options all require Silver. Most modern competitors include every asset class on every tier. `[V]`/`[R]`
  - **MFE/MAE is Silver.** Their signature metric is not free. `[V]`
  - **Everything that makes them *distinctive* is Gold.** Exit analysis/efficiency, R-multiple reporting, liquidity reports, commissions & fees, and the 100+ advanced reports are all Gold-only. `[V]` A trader who buys Tradervue *for the analytics* has no real choice below $49.95/mo. `[I]`
  - **Commissions & fees are Gold.** Net-P&L reporting — arguably table stakes — costs $20/mo more than Silver. `[V]`
  - **Mentoring requires both parties to be Silver or Gold.** `[V]` The social layer is gated on both sides, which is a hard brake on network effects. `[I]`
  - Documentation contradicts itself: help says the free cap is **30** trades/month `[V]`, their own Aug-2026 blog post says **100** `[V]`. Nobody is maintaining this.

## Feature inventory

### Data in (import / sync)

- **83 broker/platform rows** on `help/brokers`; the marketing site says "80+ Trading Platform Integrations." `[V]`
- **Automated import exists for exactly five entries**, per the "Automated" column of their own support matrix: **CMEG, DAS Trader Pro, NinjaTrader, PropReports, SpeedTrader** `[V]`. NinjaTrader's is not even theirs — footnote 10: "Fully automated and near-realtime trade importing from NinjaTrader is available using the third-party **Journal Lync** NinjaTrader plugin." `[V]`
  - **This is the single most important fact in the file.** "80+ integrations" means 80+ *CSV parsers*. The number of brokers with a real API connection is ~5, and Interactive Brokers, Schwab, Fidelity, Webull, TradeStation, Tradovate, Robinhood, Lightspeed and Sterling are all **not** among them. `[V]`/`[I]`
- A help article does describe "Broker Sync" as "connects directly to your brokerage account via API integration… daily or in real-time," with the caveat that it "may not be available with all brokers" — but it never names a single broker. `[V]`
- **Stale integration list.** The supported-broker table still lists brokers that ceased to exist years ago: **Scottrade** (absorbed 2017), **optionsXpress** (2017), **OptionsHouse** (2017–18), **TradeMonster** (2016), **MB Trading** (2016), **Capital One Investing** (2018), **SureTrader** (2019), **TD Ameritrade** (fully retired into Schwab 2024). `[V]`
- **Two divergent broker lists that disagree with each other.** `help/brokers` says "Tastyworks"; `site/platforms/` says "Tastytrade" *and* "Tastyworks", adds "Seven Points Capital" and "Sierra Chart (with OEC)" that the help table lacks. `[V]`
- **The 2023 Tradier partnership is invisible on the site.** Tradier announced (2023-05-26) a collaboration delivering "seamless importing of trades at the click of a button" `[V]`. As of 2026-09-01 the string "Tradier" appears on **neither** the supported-brokers table nor the platforms page. `[V]` Either the integration died or nobody updated the page; both readings are bad. `[I]`
- **Generic Importer** — a documented CSV spec supporting commissions and fees, the escape hatch for unsupported brokers. Rated for stocks/futures/options/forex/commissions/liquidity. `[V]` This is the same posture TapeReader takes with DAS CSVs.
- **Import API** (see *Mobile, integrations & platform*) — the org tier can push trades programmatically. `[V]`
- Known data-quality footnotes: several brokers (Robinhood, Fidelity, Schwab, Capital One, Open E Cry, Apex-cleared) **do not export exact execution times**, which degrades every time-based report. `[V]` E-Trade history is limited to what is still in the alerts window. `[V]`
- **No crypto exchange support** at all. `[V]`

### Trade construction & data model

- Executions → **grouped trades** by an auto-grouping algorithm: "typically starting a new trade when you change sides… or a certain time limit has passed since the last trade closed." `[V]` (Same problem TapeReader's `trade-grouper.ts` solves; Tradervue additionally uses a time gap, not just flat-position.)
- **Manual split and bulk merge**, plus **configurable auto-merge / auto-split** in Trade Settings ("automatically create a new trade whenever you get flat"). `[V]` Shipped Jan 2017. `[R]`
- **Account tags** change merge semantics, not just labelling: without one, a new execution merges into any open trade in that symbol; with one, it merges only within the same account tag. This is how they support the same symbol traded in two accounts, or a swing + intraday position in one account. `[V]` **Silver/Gold only.**
- **Swing / multi-day trades**: realized P&L is booked on the date it is realized, **FIFO**; a partially-closed trade shows italic realized P&L while still labelled open; the journal shows a multi-day trade on every day it has activity as opened / adjusted / closed. `[V]` Retrofitted ~2021 — the data model was originally intraday-only. `[V]`
- **Commissions, fees, exchange fees and ECN fees/rebates** are all first-class fields when the broker supplies them; otherwise per-share / per-contract estimates are configurable. Trades imported before 2012-04-02 have no fee data. `[V]`
- **Initial Risk (R)** is a per-trade field — **manually entered**, with an optional account-level default applied to all newly imported trades. `[V]` "Only trades that have an initial risk set will be included in the report data" in R mode. `[V]` (Identical constraint to TapeReader's R column.)
- Customizable columns in the Trades view: Open Date, Open Time, Closed Date, Symbol, Volume, Execution Count, P&L, **P&L (R)**, P&L (%), Commission, Commission and Fees, **Initial Risk**, **Position MFE**, **Position MAE**, Shared, Notes, Tags. `[V]`

### Core analytics & statistics

This is the part worth reading closely — it is the deepest statistics set in retail journaling and the
closest analogue to what TapeReader already computes.

**Per-trade statistics** `[V]`
| Stat | Definition (theirs, verbatim where quoted) |
|---|---|
| Position MFE | "the maximum interim profit during the trade" (runup) |
| Position MAE | "the maximum interim loss during the trade" (drawdown) |
| Price MFE | "the maximum favorable price movement during the trade, **independent of position size**" |
| Price MAE | "the maximum adverse price movement during the trade, independent of position size" |
| Best Exit P&L | "the potential P&L of the trade, if the final exit execution(s) are moved to the ideal exit **without incurring any additional risk**" |
| Efficiency (Eff) | for winning trades, actual P&L ÷ Last Exit P&L |

Splitting **position** MFE/MAE from **price** MFE/MAE is a genuinely good idea and one TapeReader does
not do: position-MFE mixes sizing decisions into the read, price-MFE isolates the market call. `[I]`

**Exit Analysis — their crown jewel** `[V]` (Gold only; stock, futures, forex)
Explicitly *rejects* naive max-theoretical-P&L: "Tradervue does not calculate a simple 'maximum
theoretical P&L,' which assumes you fully exit the trade at the point of maximum P&L. While this number
might be interesting statistically, it is rarely actionable… for non-trivial trades with more than one exit."
Instead:
1. Identify the **last exit** = final exit-side execution plus any exit fills within a few seconds of it.
2. **Float** that exit group to the point of maximum P&L, bounded by:
   - **Time window** — no earlier than the execution immediately prior to the exit group (entry *or* exit side); no later than the end of the trading day (regular session for stocks; next-day close for evening futures).
   - **Risk window** — the theoretical trade may not exceed the larger of (a) the drawdown actually experienced (Position MAE) or (b) the user's stated Initial Risk.
3. Output **Best Exit P&L** and **Efficiency**, both available as trade stats, as Trades-view columns, and as axes in Advanced Reports.

This is a materially better formulation of "how much did you leave on the table" than TapeReader's
Capture Tracker, which uses a fixed R target and a pessimistic bracket assumption. Tradervue's version
holds the *entry and the risk taken* constant and varies only the exit — which is exactly the decision
under the trader's control. `[I]`

**Aggregate report statistics (28)** `[V]`
Total gain/loss · Average daily gain/loss · Average daily volume · Average winning trade · Average
losing trade · **System Quality Number (SQN, Van Tharp)** · Total trades · Winning trades · Losing
trades · Scratch trades · Max consecutive wins · Max consecutive losses · Largest gain · Largest loss ·
Average per-share gain/loss · Average trade gain/loss · **Trade P&L standard deviation** ·
**Probability of random chance (p-value)** · **K-Ratio (Kestner)** · **Kelly percentage** · Profit
Factor · Average hold time (winning / losing / scratch, three separate stats) · Average Position MFE ·
Average Position MAE · Total commissions · Total fees.

The four in bold — SQN, p-value, K-Ratio, Kelly — are the statistical-rigor signature. No modern
competitor ships a p-value on your edge. `[I]`

**P&L reporting modes:** $ (any selectable base currency), **ticks** (futures only; ticks across
instruments are summed as equals), or **R (risk multiples)**. `[V]` Every report honours the mode.

**Report groups** `[V]`
- **Overview** — Daily P&L / Cumulative P&L / Daily volume / Win % over last 30/60/90 trading days; Year, Month, **Week**, Day-of-month; **Calendar** (green win / red loss / blue flat / grey no-trade for the whole year).
- **Days/Times** — distribution *and* performance by day-of-week, by hour-of-day (US Eastern), by month-of-year (pooled across years), by duration (intraday vs multi-day), and **Performance by Intraday Duration**.
- **Price/Volume** — distribution & performance by entry price, by volume traded, and by **in-trade price range**.
- **Instrument** — per-symbol.
- **Market Behavior** — the differentiated group (see below).
- **Win/Loss/Expectation** — Win/Loss Ratio, Win/Loss P&L Comparison, **Trade Expectation** ((avg win × win%) − (avg loss × loss%)), Cumulative P&L, **Cumulative Drawdown**.
- **Liquidity** (Gold).
- **Drawdown** — Average Drawdown, Average Days in Drawdown, Biggest Drawdown, Number of Days in Drawdown, Average Trades in Drawdown, drawdown-increase distribution by day of week, P&L moving average. Only *completed* drawdown periods (recovered to ≥ $0) are counted. `[V]` This is one of the newest articles in the help center (id 4092) — evidence they do still ship. `[I]`
- **Tag Breakdown** — Individual Tag Breakdown and **Tag Combinations Breakdown** (unique combinations of tags with P&L, trade count, volume), aggregate or per-trade average, with an option to exclude specific tags. `[V]`
- **Risk Reporting** (Gold) — every report re-expressed in R.

**Market Behavior reports — the direct analogue to TapeReader's Polygon enrichment** `[V]`
- Performance by Symbol (top/bottom 20)
- Performance by **Instrument Volume** (on entry date)
- Performance by **Instrument Relative Volume (% of 50-day MA)** ≈ our `RVOL`
- Performance by **Instrument Prior-Day Relative Volume (% of 50ma)**
- Performance by **Instrument Movement** (close − prior close on entry date)
- Performance by **Instrument Opening Gap** ≈ our `%Gap`
- Performance by **Instrument Day Type** — inside range / trend up / trend down / outside range, with published definitions: *Trend Up Day* = closes above yesterday's high, opens in the bottom 15% of the day's range, closes in the top 15%. *Inside Range* = all trading inside the prior day's range. *Outside Range* = trades partly outside the prior range but not a trend day.
- Performance by **Instrument ATR(14)** ≈ our `ATR`
- Performance by **Entry % of ATR(14)** ≈ our `%ATR`
- Performance by **Relative Volatility (TR/ATR)** — today's true range over ATR(14)
- Performance by **Entry Price vs SMA** (selectable SMA) ≈ our `Dist 20/50 SMA (%)`

TapeReader computes almost this exact feature set per trade already. The difference is that Tradervue
*reports on* them — a whole navigable report group — while TapeReader stores them as sheet columns
with no dedicated analysis surface. `[I]`

**Advanced Reports (Gold)** — user-built scatter plots, one point per closed trade, free choice of X
and Y from **40+ metrics**, optionally sized by P&L: `[V]`
P&L · Per-share P&L · Per-share P&L (ticks/pips) · Per-share % P&L · Position MFE · Position MAE ·
Price MFE · Price MAE · Price range during trade · **P&L as % of MFE/MAE** · Best exit P&L · Exit
efficiency · Duration · Trade open date/time · Day of week and time · Trade index · **Time to position
MFE** · **Time to position MAE** · Time to price MFE · Time to price MAE · Volume · Entry price ·
**R (initial risk)** · Instrument volume · Instrument volume (% of 50ma) · Instrument prior-day volume
(% of 50ma) · **% shares adding liquidity** (all / entry / exit) · **Market movement (%)** · **Market
gap (%)** · Instrument movement (%) · Instrument opening gap (%) · Instrument ATR(14) · Entry as % of
ATR(14) · Commission · Commission and fees.

`Time to position MFE` is a quietly excellent metric — it tells you whether your winners work
*immediately* or need patience, which is the empirical basis for a time-stop rule. TapeReader has the
1-minute bars to compute it and does not. `[I]`

**Advanced Trend Reports (Silver/Gold)** — moving averages of statistics over time, either
**trade-MA** (last *n* trades, X-axis = trade index) or **daily-MA** (weighted across the last *n*
days, X-axis = date). Plottable: P&L (gross/net, $ or R), Win %, Position MFE, Position MAE,
**Position MFE/MAE Ratio**, Price MFE, Price MAE. `[V]` The MFE/MAE ratio was added March 2020 — ratio
> 1.0 means average favorable excursion exceeds average adverse excursion. `[V]`

**Liquidity reports (Gold)** — genuinely unusual. `[V]`
Tradervue infers **adding vs removing liquidity** from **ECN fee/rebate data in the import**: venues
"charge you a fee for removing liquidity, and rebate you back a credit for adding liquidity," so the
sign of the per-execution fee classifies the fill. Reports:
- Performance by All Shares Adding Liquidity (0% = all taken, 100% = all added)
- Entry shares adding liquidity / Exit shares adding liquidity, separately
- An advanced X-Y plot of entry-liquidity % vs exit-liquidity %, bubble size/colour = P&L
Requires the broker to pass ECN fee detail, and only makes sense for maker/taker venues.
For an SMB/DAS-style tape reader this directly measures *"am I chasing?"* in hard data instead of by
self-report — the honest version of TapeReader's `chased` tag. `[I]`

### Charts & visual review

- **Auto-generated price charts on multiple timeframes** for every imported trade, with **entries and exits plotted on them** — the original 2011 killer feature and still the thing users name first. `[V]`
- Up to **four default charts per trade page**, each independently configured in Settings → Chart Settings. `[V]`
- **Chart studies** (e.g. EMA(20)) and **comparison symbols** — plot another instrument on the same chart. Silver/Gold. `[V]`
- **Renko, Volume Bar, and Range Bar charts** — Gold only. `[V]`
- **Intraday and running P&L charts** — Gold. `[V]`
- **Charts View for the trade list**: three display modes — Table, Charts (large), Charts (small) — so you can visually scan a filtered set of trades for pattern similarity without opening each one. The system auto-picks "the chart with the most detailed timeframe that still includes the entire trade." `[V]` This is a very good idea and cheap to copy. `[I]`
- **"Both static and interactive TradingView charts"** per their own marketing page `[V]`; a 2026 review repeats it `[R]`. The help docs describe an in-house study editor, so the two coexist. Some ambiguity remains.
- **Drawings saved with notes**: "plot trends, chart and candlestick patterns setups and save your drawings with your notes." `[V]`
- **Image uploads** — 1 GB (Silver) / 5 GB (Gold) `[V]`. This is their screenshot story: an attachment quota, not a Drive-indexed gallery.
- **No trade replay / tick-by-tick reconstruction** on any plan. `[R]` (multiple 2026 reviews, consistent)

### Journaling, notes & tagging

- **Trade notes** (per trade) and **Daily notes** (per trading day). `[V]`
- **Journal view** organized by day, with per-day statistics and running P&L for the day — redesigned ~2015. `[R]`
- **Notes templates** — user-defined templates applied on trade/journal-entry creation; the API docs explicitly describe how creation "interacts with the user's notes templates" (Aug 2016). `[V]`
- **Tags: free-form, flat strings.** Added at import (as an account tag), manually on the trade detail, or via **bulk edit** on a checkbox-selected set of trades. No categories, no hierarchy, no required fields, no per-tag schema. `[V]`
- Their marketing template page promises "custom fields" and psychology fields `[V]`, but nothing in the help center documents a structured custom-field system — the journal-template page reads as SEO content describing what *a* journal should capture, not what the product enforces. `[I]`
- **Comments** on trades, journal entries and journal notes (also exposed via API). `[V]`

### Psychology / discipline / process

**This section is nearly empty, and that is the finding.**

- There is **no** emotion/energy/tension check-in, **no** rule-adherence field, **no** discipline score, **no** streak or process metric, **no** pre-trade checklist, **no** revenge-trading or overtrading detector. `[V]` (absence across the full 70-article help center and every marketing page)
- The only mechanism is **free-form tags** plus notes. Their Edgewonk comparison page claims "emotional analytics" as a Tradervue feature `[V]` — that claim is not supported by anything in the product documentation. `[I]`
- Their **mentor/coach layer** is the psychology story: a human reads your journal. That is a deliberate and defensible choice for 2011, and a gap in 2026. `[I]`

For TapeReader this is the clearest white space in the incumbent: our Morning Plan psych check-in
(Energy / Tension / Urge to Trade Fast / Sleep / Readiness), `Process Followed?`, **Discipline %**, and
`Origin` (Watchlist / Callout / Intraday discovery) have **no counterpart in the oldest, deepest
product in the category**. `[I]`

### Planning & pre-market

- **Nothing.** There is no watchlist, no pre-market plan, no thesis-before-entry capture, no
  planned-vs-actual comparison anywhere in the product. `[V]`
- Their journal is strictly **post-hoc**: import fills, then annotate. The only forward-looking artifact
  is a Daily note you could choose to write in the morning. `[I]`
- No backtesting or strategy workspace either. `[R]`

TapeReader's Daily Plan tab + `Origin` auto-fill (did this trade come from the plan?) is a capability
the incumbent does not have in any form. `[I]`

### Risk & money management

- **Initial Risk per trade**, manual, with an account-level default. `[V]`
- **R-multiple reporting mode** across every report; per-trade `P&L (R)` column. `[V]` Gold only.
- Risk feeds the **Exit Analysis risk window** (theoretical exits may not exceed stated risk or actual MAE). `[V]`
- **Drawdown reports** (completed drawdown periods only). `[V]`
- **No position sizing calculator, no daily loss limit, no max-trades-per-day guardrail, no account-level risk-of-ruin, no Full-R-schedule-over-time concept.** `[V]` (absence)
- Risk is a **static scalar per trade** with no history. TapeReader's `Calendar Config` tab — Full R($) by account and effective date, so changing your risk unit doesn't retroactively rescale history — has no Tradervue equivalent. `[I]`

### Playbooks / setups / rules engine

- **None.** There is no playbook object, no named strategy with criteria, no rule checklist, no
  compliance scoring. Setups are modelled as tags, full stop. `[V]`
- Consequently, "did I follow my playbook?" is unanswerable in Tradervue except by manually tagging it.
- Their own comparison blog concedes competitors win on this axis and on options tooling. `[V]`

### AI & automation

- **Zero.** No AI summarization, no coaching, no pattern detection, no anomaly flags, no natural-language
  query. `[V]` (absence from the entire site and help center as of 2026-09-01)
- Multiple 2026 reviews call this out as "a meaningful and growing gap" / "generation-level gap." `[R]`
- Automation is limited to: import → auto-group → auto-chart → auto-compute stats. That pipeline is
  excellent, and it is 2013 automation. `[I]`

### Reporting, sharing & social

- **Share trades with the community** (available on **every** plan including free). `[V]`
  - Shared trades carry "notes, buy and sell points, journal templates and selected charts."
  - **P&L and share volume are stripped by default** — you may opt in to include them (that opt-in is Silver/Gold). `[V]`
  - **Symbol-matched discovery:** "If someone else has shared a trade for a symbol you were also trading, you'll see it right on your dashboard." `[V]` This is the smartest thing in their social design — the feed is joined on *your* trades, not on a follower graph. `[I]`
- **Shared Trades Widget** — embed up to 5 shared trades on your own blog, filterable by tag or symbol, under a "Community" section in the left nav. `[V]` Pure 2013-era blog-embed distribution.
- **Mentors / mentees** — invite by email; mentor gets **read-only** access to Trades, Journal and Reports including quantity and P&L, and can **leave private comments visible only to you and your mentors**. Unlimited mentors. **Both parties must be Silver or Gold.** `[V]`
- **Trading firms / orgs** — admin control panel for users, groups, onboarding and reports; firm-wide or per-group performance rollups; branded subdomain; API for automated import and user management; everyone gets Gold; single invoice; "traders can share trades with specific groups of users, for feedback and review." `[V]`
- **Export**: CSV download of the trades view (Silver/Gold), plus a calendar-P&L export. `[V]`
- **Does the social layer actually get used?** No public evidence either way. There is no public feed, no
  visible member count, no shared-trade permalink surface indexed anywhere, and the widget's "see it in
  action on various blogs" links point at the dead legacy blog. Every 2026 review lists community as a
  *differentiator on paper*; none cites activity. `[I]` The double-paywall (both mentor and mentee must
  pay) plus the mentor being read-only means the realistic use is **prop firms and trading educators**,
  where a coach already has a commercial reason to subscribe — not organic peer community. `[I]`
  Mike Bellafiore (SMB Capital) is quoted endorsing it on their Edgewonk comparison page, which fits
  that reading exactly. `[V]`

### Mobile, integrations & platform

- **No mobile app.** A search of the iOS App Store on 2026-09-01 returns TraderSync, TradingView, and
  three unrelated journals — no Tradervue. `[V]` Multiple 2026 reviews confirm no native iOS/Android app
  and a non-optimized mobile web experience. `[R]`
- **Public REST API** — `https://app.tradervue.com/api/v1`, JSON, **HTTP Basic over SSL**, mandatory
  `User-Agent` identifying your app (missing it → HTTP 400). `[V]`
  - Endpoints: **Import** (bulk trade import), **Trades** (list/create/update/delete), **Journal**
    (entries), **Journal Notes**, **Executions** (read the fills on a trade), **Comments**, **User
    Management** (org admins only). `[V]`
  - **Multi-user impersonation** for org admins via a `Tradervue-UserId` header — "you could use this to
    auto-import trades for your users." `[V]`
  - Official samples in **Ruby** and **C#**; community wrappers in Python. `[V]`
- **API changelog is the sharpest evidence of stasis in this file** `[V]`:
  `Feb 2013` initial · `Mar 2013` UA required · `Apr 2013` forex quota flag · `Dec 2013` org
  impersonation · `Dec 2015` trades/journal/notes/user docs · `Jan 2016` comments + executions ·
  `Mar 2016` exit_price field · `Aug 2016` notes-template interaction · **→ nine-year gap →** ·
  `Mar 2025` added `last_login` and renamed the host to app.tradervue.com · `Jul 2025` documented a
  `tags` query param.
  **No new API capability shipped between August 2016 and today.**
- **The legacy product blog is gone.** `blog.tradervue.com` — 19+ pages of dated feature announcements,
  the actual changelog of the product — **no longer resolves in DNS**. `[V]` Its posts are still indexed
  by search engines and a handful were migrated into the new Framer marketing blog. The rest of the
  public release history was deleted in the site rebuild. `[I]`
- **The current blog is SEO content, not product philosophy.** Of ~50 posts in the sitemap, the large
  majority are keyword pages ("hammer candlestick pattern", "best laptop for stock trading", "best day
  trading keyboard", "fair value gaps"). Only three are product announcements, two of which are
  migrated posts from 2012 and 2020. `[V]` The substantive engineering blog the category remembers
  Tradervue for no longer exists.
- **Support:** email (`support@tradervue.com`) + Help Scout knowledge base + a weekly Thursday
  onboarding webinar hosted by Richard Dalder. `[V]` No phone. A chatbot is reported. `[R]`
- **Affiliate program:** 20% recurring for the life of the customer, 30-day cookie, **"over $200,000"
  paid out to date**. `[V]`

## What they do genuinely well

1. **Execution-quality analytics nobody else attempts.** Exit Analysis (float the last exit within a
   real risk budget), position-vs-price MFE/MAE, time-to-MFE/MAE, and the liquidity add/remove
   decomposition are all decisions-under-your-control metrics rather than outcome metrics. `[V]`
2. **Statistical honesty.** SQN, K-Ratio, Kelly %, trade-P&L standard deviation and an actual
   **p-value on your edge**. This is the only retail journal that will tell you your results are noise. `[V]`
3. **Market-context conditioning.** Eleven Market Behavior reports that condition your P&L on gap,
   relative volume, ATR, TR/ATR, distance from SMA and day type. This is the "what regime do I actually
   make money in" question, answered. `[V]`
4. **Auto-charting with executions plotted.** Fifteen years on, this is still the thing users name
   first, and the Charts (large/small) list view for scanning a filtered set is a genuinely good
   review affordance. `[V]`/`[R]`
5. **A free tier that is not a bait-and-switch.** 30 *grouped* trades/month, permanent, with charts and
   reports. Reviewers who are otherwise hostile all concede this. `[R]`
6. **The org/firm product.** Admin panel + group reporting + impersonation API + branded subdomain is a
   real B2B wedge, and the SMB Capital endorsement shows it lands with prop desks. `[V]`
7. **Trade grouping and merge/split control.** Account tags that change merge *semantics*, configurable
   auto-split-on-flat, manual split and bulk merge. The unglamorous plumbing is mature. `[V]`

## Where they are weak

**Structural (hard to fix):**

1. **Broker sync is a marketing claim, not a product.** ~5 automated connections out of 83 listed
   integrations, one of which is a third party's plugin. `[V]` Building 50+ real broker/prop API
   connections is a multi-year, multi-engineer, partly commercial (contract-negotiation) project. A
   4-person team inside a holding company will not do it. Competitors that started later chose
   aggregator-first architectures and now claim 500+. This is the single biggest reason they lost
   ground. `[I]`
2. **Owned by an EBITDA optimizer.** SureSwift's public metric for Tradervue is **EBITDA growth (+73%)**,
   not users, retention, or shipped features. `[R]` A holding company that grew profit 73% on a
   stagnant product did exactly what it was supposed to do. But it means the roadmap is structurally
   capped: every engineer-year is a margin hit. `[I]`
3. **Post-hoc-only data model.** There is no pre-trade object — no plan, no thesis, no watchlist. The
   entire schema starts at "a fill happened." Adding planning is not a feature, it is a second data
   model plus a second UI surface. `[I]`
4. **Tags as the universal escape hatch.** Setup, playbook, emotion, mistake, market regime and account
   are all crammed into one flat free-text namespace. Every structured-process feature a competitor
   ships (playbooks, rule compliance, mood scoring) requires Tradervue to break that abstraction. `[I]`
5. **No mobile at all.** `[V]` A journal you cannot open on your phone loses the review habit to one you can.
6. **Aging server-rendered app.** Reviews independently describe navigation where "many clicks behave
   like a full page refresh" `[R]` — the signature of a classic Rails app (their official API sample is
   Ruby `[V]`). Modernizing the UI is a rewrite, not a reskin.
7. **Double-gated social.** Mentor *and* mentee must both pay, and the mentor is read-only. The network
   effect is switched off by the pricing model. `[I]`
8. **Analytics locked behind the top tier.** The things that make Tradervue *Tradervue* — exit analysis,
   R-reporting, liquidity, 100+ reports, net P&L — are all $49.95/mo. A prospective user evaluating on
   Silver is comparing a stripped product against a competitor's full one. `[I]`

**Cosmetic / operational:**

9. Stale, self-contradictory broker lists including brokers defunct for a decade `[V]`; an announced
   2023 Tradier auto-import partnership that appears nowhere on the site `[V]`; help docs and blog
   disagreeing on the free-tier limit (30 vs 100) `[V]`.
10. Free tier is invisible on the pricing page `[V]`; trial requires a card and auto-charges `[V]` —
    both of which show up downstream as billing complaints.
11. No crypto. `[V]`
12. Options tooling is basic — they admit it themselves. `[V]`

## What real users say

**Evidence caveat.** Reddit, Elite Trader and Google/DDG were not reachable from this session, and
several of the "review" sites that rank for Tradervue are operated by competitors (traderssecondbrain
sells "TSB"; tradezella.com hosts its own vs-pages) or run affiliate links. Everything below is tagged
accordingly and the sentiment section is weaker than the feature section. **This is the main open
question on this vendor — see below.**

- **Praise:**
  - Analytical depth is the consistent compliment. StockBrokers.com (2026-08-18, 4.5/5, Features 5/5):
    "Offers powerful analytical tools to go with the journal." `[R]`
  - The free tier: "Tradervue's free tier remains one of the best ways to start journaling for $0" `[R]`;
    "genuinely functional free tier (no bait-and-switch)" `[R]`.
  - Longevity/trust: "15 years of proven reliability" `[R]`; "long-running brand with broad recognition" `[R]`.
  - Auto-charting with plotted entries/exits is named in nearly every review. `[R]`
  - The one 5-star Trustpilot review is about outcomes, not features: "I've already identified weaknesses
    in my trading that have kept me from being more profitable." `[R]`
  - Mike Bellafiore (SMB Capital), quoted by Tradervue: "Q: What trading journal site do you prefer?
    A: Tradervue." `[V]` (vendor-selected testimonial — discount accordingly)

- **Complaints:**
  - **Billing and cancellation friction is the loudest signal.** Trustpilot 2.4/5 across only 10 reviews,
    90% one-star, profile unclaimed and never solicited: "Two years after cancelling they are still
    billing and will not refund!"; "There is no way to contact anyone in the company, other than email,
    that they never respond to"; users reporting they cannot remove their card. `[R]` Small n and a
    self-selecting channel — but two independent 2026 reviews cite the same theme as recurring. `[R]`
  - **Dated UI.** "genuinely dated by current web standards" `[R]`; "Tradervue's UI looks and feels like
    2013" `[R]`; "many clicks behave like a full page refresh" `[R]`.
  - **No AI, no trade replay, no mobile app** — named in every 2026 comparison. `[R]`
  - **Price for what you get.** "Relatively pricey for a stock trading journal" (StockBrokers) `[R]`;
    Gold at $1,800 over three years vs competitors' lifetime deals `[R]` (competitor-authored).
  - **Cluttered dashboard on first run** — StockBrokers notes it "initially feels cluttered and
    overwhelming." `[R]` (They did ship a drag-and-drop dashboard widget editor in response. `[V]`)
  - **Setup friction on the good integrations** — e.g. IBKR Flex Query "remains a barrier for less
    tech-savvy traders." `[R]`

- **Why people leave:**
  - The consistent churn story is **upgrade disappointment**: users outgrow the free tier, pay $30–50,
    and find "2015-era functionality at 2026 prices." `[R]`
  - **Missing auto-sync for their specific broker** — no Tradovate auto-sync, thin MetaTrader and
    prop-firm coverage. `[R]` Manual CSV export every day is the friction that kills the habit.
  - **Prop-firm traders in particular** are underserved: no funded-account model, no drawdown-rule
    tracking, no prop-firm sync. `[R]`
  - Counterweight: switching cost is real and cited — "some traders have years of data stored there,
    and switching has a real cost in time and adjustment." `[R]` Tradervue's retention is probably
    carried by data lock-in more than satisfaction. `[I]`

## Engineer's read

- **Stack.** Almost certainly **Ruby on Rails**, server-rendered: the only first-party API sample
  languages are Ruby and C# `[V]`; the auth is HTTP Basic (not OAuth) `[V]`; reviewers describe
  full-page-refresh navigation `[R]`. The **marketing** site was rebuilt in **Framer** (`framerusercontent.com`
  assets throughout) and the **help center** runs on **Help Scout** `[V]` — so the money went into the
  shell around the app, not the app. `[I]`
- **App/marketing split.** The product now lives at `app.tradervue.com` and marketing at `www.` — that
  split was documented in the API changelog in **March 2025** `[V]`, i.e. the Framer rebuild is recent.
- **MFE/MAE and exit analysis need intraday bars for every symbol × trade window.** They have been
  paying for that market-data feed since 2012 `[V]`. This is exactly TapeReader's Polygon dependency
  and its cost profile. Their Market Behavior reports additionally need **daily** history per symbol
  (50-day volume MA, ATR(14), prior-day range, SMA distance, prior close) — which is precisely the
  `daily_bars` store the TapeReader market-scans Phase 1 spec already plans to build. **We would get
  Tradervue's entire Market Behavior report group nearly free once `market_db` exists.** `[I]`
- **Their exit-analysis algorithm is the interesting engineering.** Floating the last exit group forward
  and backward within a *risk-bounded* window is a constrained search over intraday bars per trade —
  O(bars in window) per trade, trivially cacheable, and it degrades gracefully if the user has not set
  Initial Risk (falls back to actual Position MAE). It is entirely implementable on TapeReader's
  existing 1-minute-bar walker in `market-data.ts`, which already does the order-aware Max-R walk. `[I]`
- **Liquidity inference from ECN fee sign is clever and cheap** — no new data source, just reading the
  per-execution fee field the broker already sends. DAS CSV exports carry ECN fee/rebate columns, so
  this is achievable for TapeReader's actual data. `[I]`
- **Account tags changing merge semantics** is the right primitive and worth copying: it makes
  multi-account and swing-vs-intraday-in-one-account tractable without a schema change. TapeReader
  currently keys dedup on `Date|Symbol|EntryTime|Side`, which has the same collision class. `[I]`
- **What is hard to build:** real broker API sync at scale (commercial + operational, not just
  technical); intraday bar coverage for options and futures; the exit-analysis + MFE/MAE compute over a
  large user base (it is per-trade, per-bar, and must be recomputed when risk changes); FIFO realized
  P&L across multi-day partial closes.
- **What is easy and just tedious:** all 28 report statistics (SQN, K-Ratio, Kelly, p-value are each a
  dozen lines); the ~40 report views, which are the same group-by over the same trade table with a
  different key; the Charts (small/large) list view; the day-type classifier; CSV export; the
  drag-and-drop dashboard. Most of Tradervue's surface area is *breadth*, not depth. `[I]`
- **The API is the durable technical asset.** Basic auth + org impersonation is unfashionable but it is
  exactly what a prop firm needs to bulk-load its traders, and it is why they can sell the firm tier at
  all. `[V]`/`[I]`

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Risk-bounded Best Exit P&L + Efficiency** (float the last exit group within the actual/stated risk budget, bounded by the prior execution and the session close) | Strictly better than our Capture Tracker's fixed-target bracket: it holds entry and risk constant and isolates the exit decision, which is the thing the trader controls. Runs on our existing 1-min bar walker. | dogfood + commercial | **M** |
| **Split Position MFE/MAE from Price MFE/MAE** | Position-MFE conflates sizing with market read. Price MFE/MAE (size-independent) isolates whether the *call* was right. We already compute Max R Before Stop and MAE (R) — this is a second, unscaled pair from the same walk. | dogfood | **S** |
| **Time to MFE / Time to MAE** | Empirical basis for a time stop and for "do my winners work immediately?" We have the bars; we throw the timestamp away. | dogfood | **S** |
| **Market Behavior report group** (P&L conditioned on gap, RVOL vs 50ma, ATR(14), entry % of ATR, TR/ATR, distance from SMA, prior-day RVOL, day type) | We already *store* every one of these as enrichment columns and have no analysis surface for them. This is the highest ratio of insight to new code in the whole file — and the planned `market_db` daily bars make the missing pieces free. | dogfood + commercial | **M** |
| **Day Type classifier** (inside range / trend up / trend down / outside range, with their published 15%-of-range definition) | One cheap derived column that turns "I don't trade well on chop days" from a feeling into a filter. Computable from the daily OHLC we already store. | dogfood | **S** |
| **Liquidity add/remove from ECN fee sign** | The objective, un-self-reportable measure of chasing. DAS exports carry the fee column; we discard it. Entry-liquidity% vs exit-liquidity% scatter is the honest version of our `chased` tag. | dogfood | **M** |
| **Statistical-significance block: SQN, K-Ratio, Kelly %, P&L std dev, p-value on the edge** | Nobody else ships a p-value. For a small-sample discretionary trader it is the most important number on the page and the one that prevents over-fitting to 40 trades. Pure arithmetic on data we have. | dogfood + commercial | **S** |
| **Drawdown reports over *completed* drawdown periods** (avg drawdown, avg days in drawdown, biggest, avg trades in drawdown, drawdown-increase by day of week) | Answers "how long do my bad stretches last and what do they look like" — the question that actually causes people to quit. We have none of it. | dogfood | **S** |
| **Charts (large / small) list view** — render the trade list as a wall of auto-charts, auto-picking the finest timeframe that still contains the whole trade | Pattern-spotting across a filtered set without opening each trade. Pairs perfectly with our existing Screenshot Review and filter bar. | dogfood | **M** |
| **Account tags that change merge semantics** | Correct primitive for multi-account and for swing-vs-intraday in the same symbol. Our dedup key has the same collision class. | dogfood | **S** |
| **Advanced Reports: user-chosen X/Y scatter over 40+ trade metrics, bubble-sized by P&L** | One generic surface replaces twenty bespoke charts, and users find edges we never thought to chart. The cheapest way to look "deep" for the least code. | commercial | **M** |
| **Trend reports: trade-MA and daily-MA of any stat, incl. MFE/MAE ratio** | Turns every static stat into "am I getting better?", which is the actual product promise. | dogfood + commercial | **M** |
| **Symbol-joined community feed** ("someone else shared a trade in a symbol you traded → it appears on your dashboard") | The only social mechanic in this category that doesn't need a follower graph or a critical mass of influencers. Cold-start-resistant by construction. | commercial | **L** |
| **Org/firm tier: admin panel + group rollups + impersonation API + branded subdomain** | The B2B wedge that keeps a 15-year-old product alive. Prop desks and educators pay per-seat and churn far less than retail. | commercial | **XL** |
| **Free tier priced in *grouped trades*, not executions or days** | 30 grouped trades/month is generous to a swing trader and useless to a scalper — it self-selects exactly the users who should upgrade, while genuinely working for everyone else. Best-designed free tier in the category. | commercial | **S** (a pricing decision) |
| **Anti-pattern to avoid: "80+ integrations" that are 80 CSV parsers and 5 syncs** | The gap between the marketing number and the lived experience is a named churn reason in every 2026 review. Count auto-syncs honestly, or lose on the comparison table you wrote yourself. | commercial | — |

## Sources

Vendor-owned (`[V]` evidence):
- [Tradervue homepage](https://www.tradervue.com/) — accessed 2026-09-01
- [Pricing](https://www.tradervue.com/site/pricing/) — accessed 2026-09-01
- [Trading Analysis](https://www.tradervue.com/site/trading-analysis) — accessed 2026-09-01
- [Sharing Trades](https://www.tradervue.com/site/sharing-trades) — accessed 2026-09-01
- [Tradervue for Trading Firms](https://www.tradervue.com/site/trading-firms) — accessed 2026-09-01
- [Edgewonk Alternative (their competitive positioning)](https://www.tradervue.com/site/edgewonk-alternative) — accessed 2026-09-01
- [Affiliate Program](https://www.tradervue.com/site/affiliate-program/) — accessed 2026-09-01
- [Trading Platform Integrations](https://www.tradervue.com/site/platforms/) — accessed 2026-09-01
- [Supported Brokers and Platforms (the support matrix, incl. the "Automated" column)](https://www.tradervue.com/help/brokers) — accessed 2026-09-01
- [Reports index](https://www.tradervue.com/help/reports) — accessed 2026-09-01
- [Trade Statistics (MFE/MAE, Best Exit P&L, Efficiency)](https://www.tradervue.com/help/reports/trade_stats) — accessed 2026-09-01
- [Report Statistics (28 aggregate stats)](https://www.tradervue.com/help/reports/report_stats) — accessed 2026-09-01
- [Overview Reports](https://www.tradervue.com/help/reports/reports_overview) — accessed 2026-09-01
- [Tag Reports](https://www.tradervue.com/help/reports/reports_tags) — accessed 2026-09-01
- [Days/Times Reports](https://www.tradervue.com/help/reports/reports_dt) — accessed 2026-09-01
- [Price/Volume Reports](https://www.tradervue.com/help/reports/reports_ipv) — accessed 2026-09-01
- [Market Behavior Reports](https://www.tradervue.com/help/reports/reports_mkt) — accessed 2026-09-01
- [Win/Loss/Expectation Reports](https://www.tradervue.com/help/reports/reports_wl) — accessed 2026-09-01
- [Liquidity Reports](https://www.tradervue.com/help/reports/liquidity_reports) — accessed 2026-09-01
- [Risk Reporting](https://www.tradervue.com/help/reports/risk_reporting) — accessed 2026-09-01
- [Advanced Reports (40+ plottable metrics)](https://www.tradervue.com/help/reports/reports_advanced) — accessed 2026-09-01
- [Advanced Trend Reports](https://www.tradervue.com/help/reports/reports_advanced_trends) — accessed 2026-09-01
- [Mentors](https://www.tradervue.com/help/mentors) — accessed 2026-09-01
- [Help Center index (11 categories, 70 articles)](https://help.tradervue.com/) — accessed 2026-09-01
- [Exit Analysis methodology](https://help.tradervue.com/article/3428-exit-analysis) — accessed 2026-09-01
- [Trade Import Quota (free-tier limit)](https://help.tradervue.com/article/3420-trade-import-quota) — accessed 2026-09-01
- [Broker Sync vs Standard Import](https://help.tradervue.com/article/4626-broker-sync-vs-standar-import) — accessed 2026-09-01
- [Supported Trading Products](https://help.tradervue.com/article/2784-supported-trading-products) — accessed 2026-09-01
- [Day Type Report](https://help.tradervue.com/article/3453-day-type-report) — accessed 2026-09-01
- [Drawdown Reports](https://help.tradervue.com/article/4092-drawdown-reports) — accessed 2026-09-01
- [Weekly Performance Report](https://help.tradervue.com/article/3468-weekly-preformance-report) — accessed 2026-09-01
- [Swing Trades (FIFO realized P&L)](https://help.tradervue.com/article/3437-swing-trades) — accessed 2026-09-01
- [Account Tags / Multiple Trading Accounts](https://help.tradervue.com/article/3456-account-tags-multiple-trading-accounts) — accessed 2026-09-01
- [Split and Merge Trades](https://help.tradervue.com/article/3480-split-merge-trades) — accessed 2026-09-01
- [Customize Columns](https://help.tradervue.com/article/3467-customize-columns) — accessed 2026-09-01
- [Customize your Dashboard](https://help.tradervue.com/article/3434-customize-your-dashboard) — accessed 2026-09-01
- [Chart Studies and Comparisons](https://help.tradervue.com/article/3454-chart-studies-and-comparisions) — accessed 2026-09-01
- [Chart Display Modes on Trades View](https://help.tradervue.com/article/3473-chart-display-mode-on-trades-view) — accessed 2026-09-01
- [Shared Trades Widget](https://help.tradervue.com/article/3451-share-trades-on-your-site) — accessed 2026-09-01
- [Export Trade Data](https://help.tradervue.com/article/3466-export-trade-data) — accessed 2026-09-01
- [Tracking Commissions and Fees](https://help.tradervue.com/article/3417-tracking-commissions-and-fees) — accessed 2026-09-01
- [Mentoring and Coaching](https://help.tradervue.com/article/3418-mentoring-and-coaching) — accessed 2026-09-01
- [P&L Reporting Modes ($ / ticks / R)](https://help.tradervue.com/article/3425-pl-reporting-modes) — accessed 2026-09-01
- [How to Tag](https://help.tradervue.com/article/3484-how-to-tag) — accessed 2026-09-01
- [API docs (GitHub, tradervue/api-docs)](https://github.com/tradervue/api-docs) — accessed 2026-09-01
- [API CHANGELOG (the 2016→2025 gap)](https://github.com/tradervue/api-docs/blob/master/CHANGELOG.md) — accessed 2026-09-01
- [Blog: MFE and MAE Calculations (orig. 2012-11-29, updated 2026-08-14)](https://www.tradervue.com/blog/mfe-and-mae-calculations) — accessed 2026-09-01
- [Blog: Trend Reports + MFE/MAE Ratio (2020-03-05)](https://www.tradervue.com/blog/trend-reports-mfe-mae-ratio) — accessed 2026-09-01
- [Blog: Best Trading Journal (their own competitor comparison, 2026-08-14)](https://www.tradervue.com/blog/best-trading-journal) — accessed 2026-09-01
- [Webinars](https://www.tradervue.com/webinars) — accessed 2026-09-01
- [P&L Calendar](https://www.tradervue.com/pnl-calendar) — accessed 2026-09-01
- [View Past Trades](https://www.tradervue.com/view-past-trades) — accessed 2026-09-01
- [Trading Journal Template](https://www.tradervue.com/trading-journal-template) — accessed 2026-09-01
- [sitemap.xml (used to enumerate the full page/help/blog surface)](https://www.tradervue.com/sitemap.xml) — accessed 2026-09-01

Third-party (`[R]` evidence):
- [SureSwift Capital — Tradervue acquisition announcement (2021-03-30)](https://www.sureswiftcapital.com/blog/tradervue-acquisition) — accessed 2026-09-01
- [SureSwift Capital — Tradervue portfolio page (Reinacker interview)](https://www.sureswiftcapital.com/portfolio/tradervue) — accessed 2026-09-01
- [Don Wharton (SureSwift founder), LinkedIn, Mar 2024 — Tradervue TTM EBITDA $826k → $1,432k](https://www.linkedin.com/posts/don-wharton-966194261_we-all-know-data-driven-insights-are-a-game-activity-7172989261166706688-lmbB) — accessed 2026-09-01 (via search index; post not fetched directly)
- [Tradier — "Driving Trading Innovation Together: The Tradier and Tradervue Partnership" (2023-05-26)](https://blog.tradier.com/blog/tradier-and-tradervue-partnership) — accessed 2026-09-01
- [Trustpilot — tradervue.com (2.4/5, 10 reviews, unclaimed profile)](https://www.trustpilot.com/review/tradervue.com) — accessed 2026-09-01
- [StockBrokers.com — Tradervue Review (2026-08-18, 4.5/5)](https://www.stockbrokers.com/review/tools/tradervue) — accessed 2026-09-01
- [DayTradingToolkit — Tradervue Review (2026-07-07, 6.5/10)](https://daytradingtoolkit.com/reviews/tradervue-review) — accessed 2026-09-01
- [Tradespad — Tradervue Review (2026, 7.0/10)](https://tradespad.com/blog/tradervue-review) — accessed 2026-09-01
- [Traders Second Brain — Tradervue Review (2026-04-02) — **competitor-authored, discount heavily**](https://traderssecondbrain.com/guides/tradervue-review) — accessed 2026-09-01
- [FinancialTechWiz — TradeZella vs Tradervue (2026-08-29)](https://www.financialtechwiz.com/post/tradezella-vs-tradervue/) — accessed 2026-09-01
- [TrendSpider Learning Center — Tradervue](https://trendspider.com/learning-center/tradervue/) — accessed 2026-09-01
- [Apple iTunes Search API — query "tradervue", entity=software, 2026-09-01: no Tradervue app returned](https://itunes.apple.com/search?term=tradervue&entity=software) — accessed 2026-09-01

**Sources attempted and unavailable from this session** (recorded so the gap is auditable):
- reddit.com (blocked), elitetrader.com (403), g2.com (403), duckduckgo/google (blocked or budget-exhausted),
  web.archive.org (unreachable) — so **community sentiment is the weakest part of this file**.
- `blog.tradervue.com` — the original product-announcement blog, **no longer resolves in DNS**; its
  ~19 pages of dated feature announcements are gone from the live web.

## Open questions for `07-open-questions.md`

1. **Which brokers does "Broker Sync" actually cover today?** The pricing page sells it on both paid
   tiers; the support matrix shows 5 automated integrations; the help article names none. Settle by
   asking their support or by finding a 2025–26 user walkthrough video.
2. **Is the shared-trades community actually alive?** No public feed exists to inspect. Needs Reddit /
   Discord / YouTube evidence from a session with search access.
3. **Real churn drivers, from traders rather than affiliate reviewers.** Every sentiment claim above is
   second-hand. r/Daytrading, r/RealDayTrading and Elite Trader threads are the missing primary source.
4. **Annual pricing** — 10%/20% discounts are reported by one source and denied by another; not on the
   pricing page.
5. **Did the Tradier integration ever ship, and was it removed?** A dated Wayback diff of
   `help/brokers` would answer it.
