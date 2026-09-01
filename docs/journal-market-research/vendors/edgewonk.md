# Edgewonk

**URL:** <https://edgewonk.com> (app at <https://edgewonk.app>) · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "Automated trading journal that turns your data into profits" `[V]`
**One-line positioning (ours):** The behavioural-analytics journal — a statistics engine whose defining input is the trader's own self-rated commentary on each trade, not the broker fill data.

> **Research note on source quality.** Edgewonk generates an unusually large volume of low-quality
> affiliate/SEO "reviews," many of which are **stale but dated 2026**. Multiple such pages still assert
> a "$169 one-time licence" and a "Java desktop app" — both of which contradict Edgewonk's own live
> pricing page and changelog. Where third-party and first-party sources conflict in this file, the
> first-party `[V]` claim wins and the conflict is called out explicitly. Edgewonk's own help centre
> (`edgewonk.zendesk.com`) is behind a Cloudflare challenge and was **not** directly fetchable; help-centre
> content below is quoted via search-result extracts and is tagged `[R]` accordingly.

## Snapshot

| | |
|---|---|
| Founded / age | Product launched **2015**; legal entity founded as Quantum Trade Solutions UG (März 2015), converted to GmbH by 2018 `[R]`. Founders Rolf Schlotmann & Moritz Czubatinski also run the trader-education site Tradeciety (founded 2012) `[R]`. ~11 years old. |
| Team size (est.) | Small. German GmbH, two named managing directors `[V]` (imprint). Changelog cadence is roughly weekly-to-fortnightly with mostly single-theme releases — consistent with **~3–8 people** `[I]`. |
| Primary asset classes | Forex, Stocks, Futures, Crypto, Options, Indices, Commodities `[V]`. Historically **FX-first**; futures and prop-firm traders are the visible growth segment (FTMO/TopstepX importers added 2024–25 `[V]`). |
| Primary user segment | Serious, self-directed, already-has-a-strategy retail traders who want to fix *execution and discipline*, not discover setups. Explicitly a poor fit for beginners `[R]`. |
| Business model | **Subscription** — $197 USD per 16 months, auto-renewing, single tier, all features `[V]`. Historically a one-time perpetual licence (~$169) for the Edgewonk 2.x Java desktop app; migrated to cloud + subscription with **Edgewonk 3, released ~Feb 2024** `[R]`. Free "Journal Review" video service acts as content marketing `[V]`. |
| Est. scale (users/revenue) | No disclosed numbers. Trustpilot shows only **44 reviews, 4.7/5, 13 in the last 12 months** `[V]` — low review volume relative to VC-backed rivals. Changelog references journals with ">20k trades" and "thousands of trades" as a perf concern `[V]`, implying a real but power-user-skewed base. `[I]` Best guess **low tens of thousands of paying users, ~$2–6M ARR** — bootstrapped, profitable, not hypergrowth. Low confidence. |

## Pricing

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| Edgewonk Trading Journal (single plan) | **$197 USD / 16 months** `[V]` | Everything. No feature tiering, unlimited journals, unlimited trades. | Marketed as "16 months for the price of 12"; renews annually thereafter. VAT added for EU/UK. |

- **Free tier / trial:** none `[V]`. Substituted by a **14-day, no-questions money-back guarantee** `[V]`.
- **Annual discount:** the 16-for-12 promo *is* the discount. "Lock in your price for life" grandfathering on renewal `[V]`.
- **Notable paywall lines:** none internally — the paywall is the front door. `[I]` This is strategically distinctive: every competitor gates backtesting, AI, or broker-sync behind a higher tier; Edgewonk has exactly one SKU. It removes upsell revenue but also removes the "which plan do I need" friction and the resentment that drives churn.
- **Pricing-model discrepancy `[R]`:** many 2026-dated review pages still quote "$169/year" or "$169 one-time, lifetime access." The live pricing page says $197/16mo subscription `[V]`. Treat any "one-time fee" claim about Edgewonk as **obsolete**.

**Market-researcher read.** At ~$148/yr effective ($197 ÷ 16 × 12), Edgewonk is priced *below* TradeZella (~$288/yr) and TraderSync (~$216/yr) `[R]` while claiming the deepest behavioural analytics. That is a deliberate value-play from a bootstrapped German firm that never had to service venture return expectations. The 2024 move off perpetual licensing is the single biggest reputational liability they carry — it is the recurring complaint in community discussion `[R]`.

## Feature inventory

### Data in (import / sync)

- **200+ brokers/platforms** claimed `[V]`. Named: MT4/MT5, NinjaTrader 7/8, Interactive Brokers, cTrader, Tradovate, Charles Schwab, TradeStation, Sierra Chart, Webull, CQG, TD Ameritrade, tastytrade, **DAS Trader**, Rithmic, Lightspeed, TradeZero, Colmex, Sterling Pro, Jigsaw, MultiCharts, Quantower, MotiveWave, Forex Tester, TickBlaze `[V]`.
  - **DAS Trader is supported** `[V]` — directly relevant to TapeReader, whose whole ingest is a DAS CSV parser.
- **Crypto:** ByBit, Coinbase, MEXC, BYDFI, Capital.com `[V]`.
- **Prop firms:** FTMO, TopstepX `[V]`.
- **Competitor migration importers:** Tradervue (Mar 2025), TraderSync incl. options (Oct 2025), **TradeZella (Nov 2024)**, TradingView Backtester, FxReplay `[V]`. `[I]` A deliberate switching-cost attack: they built importers *for their competitors' export formats*. Cheap to build, disproportionately effective at the point of purchase.
- **Sync mechanics:** genuinely automatic sync appears limited to **MetaTrader via an Expert Advisor / FTP relay** (MT5 EA auto-import shipped Aug 2026; FTP migration path mentioned) `[V]`. Everything else is **file-based CSV/XLSX upload** with per-broker parsers `[V]`. Multiple independent reviews state there is "no real-time broker API syncing" `[R]` — consistent with the changelog, which is ~40% importer bugfixes and contains almost no OAuth/API-connection work.
- Generic Excel/CSV importer with manual column mapping for unsupported venues `[V]`.
- Import history page; per-instrument fee configuration; seven selectable date formats; per-journal timezone with minute-level time-shifting and UTC normalisation `[V]`.

`[I]` **Engineer's note:** this is a parser farm, not an integration platform. ~100+ hand-written format adapters, continually breaking as brokers change CSV layouts. It is a *maintenance* moat, not a technical one — expensive to replicate only because it is tedious.

### Trade construction & data model

- Round-trip trades with **scale-in / scale-out** support (partial fills tracked; "Scale in/out date fixes" in changelog) `[V]`.
- Per-trade fields beyond fills: **Stop Loss price, Take Profit price, Highest price during trade, Lowest price during trade** — all user-editable numeric columns `[V]`.
- **`OTP Hit` (Original Take Profit Hit)** — a checkbox: *"Did the price hit the Original Take Profit price before it hit the initial stop loss?"* — evaluated **independently of the actual exit** `[R]`. If TP was $90, you exited at $80, and price later tagged $90 → `OTP = YES`; if it went straight to your initial stop → `OTP = NO`.
  - **This is precisely TapeReader's `Max R Before Stop` reduced to one bit.** Edgewonk asks the trader to fill it in by hand; TapeReader computes it from 1-minute Polygon bars.
- **`Breakeven?`** flag, excluded from loss calculations `[V]`.
- Unlimited journals (multi-account/multi-strategy), multi-currency, **Portfolio tab** aggregating across journals (Jan 2025) `[V]`.
- **Missed Trades** — a first-class object, not a note: setups seen but not taken, with reason tagging and its own "Missed Trades Analysis" performance breakdown `[R]`.
- **Trading Plans** — pre-market planned trades that *promote* into the live journal if executed, or *demote* into Missed Trades if not (shipped May 2022) `[V]`. Trade-type fields added to both Missed Trades and Trading Plans (Jul 2024) `[V]`.
- 30-day recycle bin for deleted journals (Aug 2026) `[V]`.

### Core analytics & statistics

Named, with computations where Edgewonk states them `[V]` (from their own "Deep Dive into Edgewonk Performance Statistics"):

| Metric | Stated computation |
|---|---|
| Net Return | Cumulative sum of per-trade returns, based on account balance at trade time |
| ROI | (Current balance − initial deposit) ÷ initial deposit |
| Avg P&L / Expectancy | Total return ÷ number of trades |
| Profit Factor | (Return of all wins) ÷ (return of all losses) |
| Drawdown | Distance below account peak, % |
| R-Multiple | Entry→stop distance = 1R; exit expressed in R units |
| RRR (planned) | Potential reward ÷ potential risk, measured at entry from TP and SL |
| **Drawdown (%)** | *How close price came to the **stop loss*** while open |
| **Updraw (%)** | *How close price came to the **take profit*** while open |
| MAE | Max adverse excursion (largest open drawdown) |
| MFE | Max favourable excursion (largest open profit) |
| **Efficiency** | **% of positive trade comments ÷ total trade comments** |
| Sharpe | Σ(returns) ÷ stdev(all returns) |
| Sortino | Σ(returns) ÷ stdev(returns of losing trades only) |
| Calmar | Σ(returns) ÷ max drawdown |
| Gain to Pain | Σ(all returns) ÷ (Σ(losing returns) × −1) |
| SQN | Present in the ratio suite `[V]`, formula not published |

- **Edgewonk Score (EWS)** — proprietary composite of exactly three components: **sample size, profit factor, and return-to-drawdown** `[V]`. Sample size *penalises* small datasets; RtD rewards stability. **Weights, scale, and the combining formula are undisclosed** `[V]` — the blog explicitly does not give them.
  - `[I]` This is a smart piece of product design masquerading as a vanity metric: baking sample size *into* the headline score is a direct structural answer to overconfidence after 20 trades. Nobody else does this.
- **Return to Drawdown analysis** (Dec 2025), **True System Edge** and **Total Edge Leak** (Dec 2025) `[V]` — Edge Leak = the profit destroyed by rule-breaking; True System Edge = performance with rule-break noise removed. `[I]` This requires that rule-adherence be a *structured field*, not free text — which is exactly what the trade-comment ratings provide.
- **Coin Flip Distribution** — compares your equity curve against the distribution random entries would have produced; tells you whether your result is statistically distinguishable from luck `[R]`.
- **Risk Distribution** (formerly "R-Distribution") — surfaces risk-sizing outliers `[V]`.
- **Confidence intervals on charts** (Mar 2025) `[V]`.
- Breakdowns by: setup/strategy, instrument, weekday, hour, **30-minute window**, session, holding time, and any custom statistic `[V]`.
- Consecutive winners/losers, losing-streak probability, underwater/drawdown-depth-and-length charts `[V]`.
- "50+ data reports" in **Chart Lab** `[V]` (unenumerated by the vendor).
- Interactive trade charts with candlestick data, 1-minute to 1-month intervals, in the trade editor (Jul 2026) `[V]`.

### Charts & visual review

- **Chartbook** — a dedicated screenshot library, with metadata, aggregating screenshots from executed trades, **Missed Trades, and Trading Plans** `[V]`. `[I]` TapeReader's Screenshot Review is the same idea but only covers executed trades; extending it to plan/missed screenshots is nearly free.
- Screenshot paste from clipboard (Cmd/Ctrl+V), automatic compression, TradingView screenshot import `[V]`.
- Equity graph with **Tiltmeter overlay** and group-by-day `[V]`; screenshot export of calendar and equity graph `[V]`.
- **No trade replay / bar-by-bar market replay** `[R]` — a repeated complaint versus TradeZella.

### Journaling, notes & tagging

- **Notebook** — folder-structured diary with rich-text editing, link plugin, category search, tag keywords that resurface on the dashboard as reminders `[V]`/`[R]`.
- **Trade Comments** — see Psychology below; these are the structured backbone, not free text.
- **Custom Statistics** — up to **20 user-defined categories, each with an arbitrary list of tags**, edited under Settings → Custom Statistics; renameable headings; dropdown-with-add-new at the point of trade entry `[R]`.
  - Vendor-suggested categories: execution timeframe, level type, chart pattern, target type, stop logic, feelings about the trade, Fib confluence, volume/market structure, missed-trade reason, mental state, any indicator `[V]`.
  - **These are categorical tag dimensions, not numeric fields or formulas** `[R]`. Every custom statistic automatically becomes a slicing dimension in Chart Lab `[V]`.
- Flagging/starring trades `[R]`; dynamic cell colouring by comment rating `[V]`; emoji support `[V]`.
- Comments, notes and custom stats are included in journal export `[V]`.

### Psychology / discipline / process

**This is the core of the product and the reason it is the highest-signal vendor for TapeReader.** The architecture is worth stating precisely, because most third-party descriptions get it wrong.

1. **Trade Comments (the primitive).** In Settings, the user authors their *own* library of comment strings, bucketed by trade stage: **Pre-Trade, Entry, Management, Exit** `[V]` (pre-trade comments added Jun 2025 `[V]`; category classification confirmed in changelog `[V]`). **Each comment string is assigned a rating of positive / negative / neutral by the user, once, at definition time** `[R]`. At trade entry the user picks comments from a dropdown (Advanced Trade tab) `[R]`.
   - Rating rule as stated: *negative* if you broke your rules or deviated from plan; *positive* if the behaviour matched your trading plan `[R]`.
   - `[I]` **The key design insight: the trader pre-commits to the moral valence of each behaviour while calm, and at journaling time only performs the mechanical act of selection.** That decouples the judgement from the emotional state it is trying to measure — the single hardest problem in self-reported psychology data. It is also why a comment can be attached to a *winning* trade and still be negative, which is what makes rule-adherence measurable independently of P&L.
2. **Efficiency (%)** — `positive comments ÷ total comments`, over the filtered set `[V]`. Vendor worked example: 7 positive + 2 negative across 3 trades → **78%** `[R]`. Note the denominator is **comments, not trades** — a single trade contributes up to four ratings, so one badly-managed trade with three negative tags drags the number harder than a clean loss. Marketed as "a clear percentage of how often you follow your trading rules" `[V]`. Benchmark offered: *"efficiency above 90% means fewer than 1 in 10 trades involved a rule violation"* `[R]`.
3. **Tiltmeter** — a visual bar/gauge that adjusts as rated comments are assigned `[R]`. Stated purpose: *"analyzes the discipline and how well the trader respects his rules and follows his trading plan. A red Tiltmeter shows repeatedly broken trading rules and bad decisions"* `[R]`. It **highlights streaks** of strong and weak behaviour so the trader can spot when tilt starts `[V]`, and it is **overlaid on the equity curve** and rendered as a **column in the trade table** and **on the calendar** (Oct 2024) `[V]`. Green/red framing; the vendor's own coaching heuristic is *"will this decision make my Tiltmeter green or red?"* as an in-the-moment circuit-breaker `[V]`.
   - **Exact computation is not published** `[V]`. From the equity-graph "tiltmeter calculation fix" changelog entry `[V]` plus the streak language, it is `[I]` almost certainly a **running/rolling weighted score over recent rated comments** rather than a lifetime average — i.e. a short-window Efficiency with recency weighting.
   - **Correction to a widespread misreport `[R]` vs `[V]`:** numerous review sites describe the Tiltmeter as *"assigns a numerical rating to your emotional state during each trade."* Edgewonk's own help content says its input is **rated trade comments about behaviour**, not an emotion slider. The distinction matters a lot: **Edgewonk measures behaviour and infers state; it does not ask you to rate your feelings.**
4. **Mental Tags / psychology custom statistics** — user-defined categories for confidence, focus, stress, rule adherence, impulsive-vs-patient, correlated against performance `[V]`. This is where an explicit emotion/state rating *would* live, and it is a generic Custom Statistic slot rather than a first-class typed field `[V]`.
5. **Checklists** (shipped May 2025 `[V]`) — per-setup criteria lists, with **checklist-compliance tracking** and analysis of *which individual rules actually generate profit* `[V]`.
6. **Mistake Impact Analysis by category** (Dec 2025) `[V]` — quantifies the dollar/R cost of each error class, and rolls up into **Total Edge Leak**.
7. **Sessions** — structured daily/weekly/monthly reviews with **report cards, reflection prompts, and lesson tracking**, with their own win-rate and performance analytics grid (redesigned Nov 2025) `[V]`.
8. **Missed Trades** as a psychology instrument — the vendor frames these as evidence of "hesitation, weak routines, and confidence issues" `[V]`, i.e. measuring *failure to act*, which P&L data structurally cannot see.

**Product-manager read.** The whole psychology stack is one idea executed consistently: *make discipline a structured, aggregatable field so it can be joined against money.* Everything downstream — Efficiency, Tiltmeter, Edge Leak, True System Edge, Mistake Impact, Edge Finder module 3 — is a different projection of the same rated-comment table. That is why it is coherent, and it is also why it is a **painkiller for the "I know my setup works but I keep losing money" trader** and a **vitamin for everyone else**. It is deliberately useless in month one and increasingly hard to leave in year two.

### Planning & pre-market

- **Trading Plans** — pre-market planned trades entered before execution; promoted to journal on fill, demoted to Missed Trades if skipped `[V]`. Screenshots attachable and indexed in Chartbook `[V]`.
- Checklists gate the plan against setup criteria `[V]`.
- No news calendar, no watchlist scanning, no pre-market data feed — the plan is a pure intention record `[I]`.

### Risk & money management

- Stop and target captured per trade; R-multiple as the native unit throughout `[V]`.
- **Risk Distribution** chart for sizing outliers `[V]`; return-to-drawdown; drawdown depth *and length*; losing-streak probability `[V]`.
- **Simulator (Strategy Lab → Simulator)** — see below; outputs risk-of-ruin and streak-length distributions `[R]`.
- No live position sizing calculator, no daily-loss-limit enforcement, no prop-firm drawdown-rule tracking `[I]` — a notable gap given they added FTMO/TopstepX importers.

### Playbooks / setups / rules engine

- Setups/strategies are a first-class tag with per-setup stats grids and filtering `[V]`.
- **Alternative Strategies ("Alt Strategies") / named backtests** (management overhaul Jul 2025) `[V]` — *"test your ideas right in Edgewonk and compare it to your actual performance"* without opening a second account `[R]`.
- Checklists are the closest thing to a rules engine: criteria per setup, compliance tracked, per-rule profitability measured `[V]`. There is **no automated rule-violation detection** — the trader still self-reports `[R]`.
- No shared/community playbook library, no strategy templates `[R]`.

### Simulator / "what-if" analysis

Three separate things share the "simulation" label; keeping them distinct matters because TapeReader's Profitability Analysis maps onto only one of them.

1. **Trade Management graph (the real what-if).** Plots **actual R** against **potential R**, where *potential* = *"how the trades would have developed with a completely passive set-and-forget approach"* `[V]`, plus a third **"R lost/gained by managing"** line `[V]`. Green (potential) above blue (actual) ⇒ you mismanaged: cut winners early or held losers past the plan `[R]`. **Requires SL, TP, and the `OTP Hit` checkbox on every trade to work** `[R]`.
   - **This is the same construct as TapeReader's Calendar `B`/`Δ` bracket counterfactual and its Profitability Analysis** — but Edgewonk's version is driven by a hand-entered boolean, whereas TapeReader derives it from 1-minute bars and can therefore express *degree* (Max R Before Stop, MAE in R) rather than a binary.
2. **Exit Analysis.** Unlocked by recording the highest/lowest price reached during the trade `[V]`; shows *"how close price came to your profit target or stop loss after you closed a trade"* `[V]` — i.e. post-exit continuation, the trail-leak question.
3. **Simulator (Strategy Lab).** A Monte Carlo over your own realised distribution: configurable **number of simulations and number of trades** (defaults referenced as ~500 trades; 50-trade runs used to demonstrate small-sample variance) `[R]`, with selectable input statistics (win rate, avg winner, avg loser, R:R, position size). Outputs a fan of equity paths, **winning/losing streak length distributions, % gain distribution, and Risk of Ruin** `[R]`. Losing-streak probability visualisation added Aug 2025 `[V]`.
   - `[I]` This is *forward-looking* (what could happen given my stats) and is **not** the same as TapeReader's Profitability Analysis, which is *backward-looking* (what would have happened to my actual trades under a different exit rule). Edgewonk covers both, in different tabs; TapeReader currently covers only the backward-looking one.

### AI & automation

- **Edge Finder** (early access Nov 2025, GA Jan 2026) `[V]`. Runs **automatically every Sunday**, scans the whole journal across "hundreds of data points," and returns focused insights in **six/seven modules**: win-rate viability vs breakeven R:R, most profitable time periods, **losses attributable to rule-breaking**, costliest entry/exit/management mistakes, **True System Edge with rule-break noise removed**, return-to-drawdown risk monitoring, and **week-over-week discipline** `[V]`.
- **Explicitly anti-chatbot.** Their own launch post argues *"a chatbot can only respond to what you ask. If the question is wrong the answer will be irrelevant no matter how advanced the AI is"* `[V]`. Marketed as "AI Augmented" and "based on millions of reviewed trades," but they never claim an LLM `[V]`. `[I]` **Read this as a curated fixed-heuristic engine, not generative AI** — a push-model insight digest.
- `[I]` Strategically this is the sharpest positioning call in the file: while the whole category chased LLM chat wrappers, Edgewonk shipped a *scheduled, opinionated, non-interactive* analysis. It is cheaper to run, deterministic, has no hallucination surface, and — critically — **asks the question for you**, which is the actual failure mode of self-review. Whether the market rewards it is unproven; several reviewers score them down purely for "no AI" `[R]`.
- Automatic take-profit/stop-loss detection from market data `[V]`; automatic screenshot compression `[V]`.

### Reporting, sharing & social

- Weekly, monthly, and **session report cards** `[V]`; monthly reports with weekly breakdowns and L/W fields `[V]`.
- **Journal sharing with a mentor or coach — read-only, revocable** `[V]` (database sharing, Oct 2024). No teams, no seats, no org accounts `[R]`.
- **Free "Journal Review" service** `[V]`: submit a journal with ≥50 trades carrying SL/TP prices, `OTP Hit` marked, and ideally trade comments and price data; Edgewonk staff record an anonymised video teardown published on their YouTube channel. `[I]` A very cheap, very high-conversion content engine — it simultaneously produces marketing, teaches correct journaling behaviour, and enforces data hygiene (note that the entry requirements are exactly the fields their differentiated analytics need).
- Public profiles were **removed** in Apr 2024 `[V]`. No social feed, no leaderboards, no community `[V]`. `[I]` A deliberate anti-social-network stance, opposite to TradeZella's direction.
- Full journal export including comments/notes/custom stats `[V]`.

### Mobile, integrations & platform

- **Web app (cloud), Angular + Tailwind, at edgewonk.app** `[V]` — evidenced by the Mar 2024 Tailwind redesign, Angular 18 upgrade (Aug 2024), command palette (Cmd/Ctrl+K), WebSocket notifications service `[V]`.
- **No native mobile app on iOS or Android; mobile = responsive browser only** `[V]`/`[R]`, repeatedly cited as the top UX gap.
- Dark mode `[V]`; customisable home dashboard with reorderable performance tiles displayable in currency / Return % / R-multiple (Jul 2026) `[V]`; custom journal layouts with a "Simplified Standard Mode" that hides advanced features (Aug 2026) `[V]`.
- **No public API** found `[V]` (absent from site and changelog). No webhooks, no Zapier.
- `[I]` The Aug 2026 "Simplified Standard Mode" is a tell: they are treating **onboarding overwhelm** as a live retention problem.

## What they do genuinely well

1. **They made discipline a data type.** The pre-rated, stage-bucketed trade-comment library is the best solution I have seen to the "self-reported psychology data is garbage" problem, because the judgement is made cold and reused warm. Everything valuable downstream falls out of that one schema decision.
2. **Rule-adherence is joined to money, not just displayed.** Edge Leak, True System Edge, and Mistake Impact answer "what is my indiscipline costing me in dollars" — a fundamentally more motivating framing than "your discipline was 78%."
3. **Sample size is baked into the headline metric.** The EW Score penalising small n is an unusually honest design choice in a category built on flattering dashboards.
4. **Trade management measured against a passive baseline.** Actual-vs-potential R with an explicit "R lost/gained by managing" line is the correct way to ask whether active management is adding or destroying value.
5. **Coin Flip Distribution.** Telling a paying customer their edge may be indistinguishable from luck is a product decision most VC-backed competitors will never ship.
6. **Missed Trades as a first-class object.** Measuring inaction is a genuine blind spot in every fill-derived journal, TapeReader's included.
7. **Anti-chatbot Edge Finder.** Push-model, scheduled, opinionated. Solves the real problem (traders don't know what to ask) rather than the demo-friendly one.
8. **One price, everything included.** No tier anxiety, no upsell drip.
9. **Genuine responsiveness.** Trustpilot praise clusters on "they listen and implement suggestions" `[V]`, and the changelog corroborates it — near-weekly shipping, heavily user-request-shaped.

## Where they are weak

**Structural (hard to fix):**

1. **The entire differentiation depends on manual, honest, disciplined data entry.** Efficiency, Tiltmeter, Edge Leak, True System Edge, Trade Management, and Exit Analysis are all dead without user-supplied comment ratings, SL/TP prices, `OTP Hit`, and high/low prices. Reviewers state it plainly: you must *"classify errors yourself, watch the Tiltmeter yourself, draw conclusions yourself"* `[R]`, and the psychology tracking *"requires self-honesty"* and struggles exactly when the trader is stressed — the moment it most needs to capture `[R]`. **This is the deepest crack in the product and it cannot be patched with UI.** It can only be closed by *deriving* the same facts from market data.
2. **Parser-farm ingest, not API sync.** ~100+ hand-maintained CSV/XLSX adapters; MetaTrader is the only broadly automatic path. Perpetual maintenance tax, and a structural loss to rivals advertising 500–950+ auto-syncing brokers `[R]`. Fixing it means a different engineering org.
3. **Free-tier-less, trial-less acquisition.** Only a 14-day refund. In a category where every rival offers a free plan, this is a top-of-funnel handicap that a small bootstrapped team is unlikely to reverse without cannibalising its single SKU.
4. **The perpetual-licence → subscription switch (2024) permanently damaged goodwill** and is the recurring sore point in community discussion `[R]`. Unfixable; it already happened.
5. **Undisclosed proprietary formulas (EW Score, Tiltmeter) in a trust-sensitive category.** They ask traders to act on a number they cannot audit. `[I]` For a self-directed, quantitatively-minded buyer this is a real objection, and it is self-inflicted.
6. **Deliberately no social/community layer** (public profiles removed 2024). Structurally forgoes the network effects rivals are building.

**Cosmetic / addressable:**

7. **No native mobile app** `[V]` — the single most-cited complaint.
8. **No trade replay / bar-by-bar market replay** `[R]`.
9. **Steep learning curve; thin documentation for advanced features** `[R]`; ~1–2 hours to set up `[R]`. The Aug 2026 "Simplified Standard Mode" is an admission.
10. **UI still reads as dated** to reviewers despite the 2024 Tailwind rebuild `[R]`.
11. **No public API, no webhooks** `[V]`.
12. **Prop-firm rules unmodelled** despite FTMO/TopstepX importers `[I]`.
13. **A reputation-lag problem:** competitor and affiliate pages still describe a Java desktop app with no cloud sync and a one-time fee `[R]`. That is objectively false in 2026 `[V]`, but it is what a prospective buyer googles.

## What real users say

**Sources are thin and quality is poor.** Trustpilot has just 44 reviews `[V]`; the Elite Trader and Forex Factory threads were 403-blocked to this research; the searchable "review" corpus is dominated by affiliate content. Treat all sentiment below as low-to-moderate confidence.

- **Praise `[V]`/`[R]`:**
  - Trustpilot **4.7/5 from 44 reviews, 98% five-star, one 1-star** `[V]`. *"I have been with Edgewonk for years now, without a problem. The team are always innovating"* (Jul 2026) `[V]`; *"Great team, and they listen to your needs. They have made so many improvements and implemented our suggestions"* (Jul 2026) `[V]`.
  - Value for money is the most consistent theme — cheapest of the premium journals `[R]`.
  - Custom Statistics and Edge Finder are the two features users name unprompted `[V]`/`[R]`.
  - Long-tenure users report it as their primary journal since 2025 with "nothing else close on value" `[R]`.
- **Complaints `[R]`:**
  - **Manual data entry is the #1 friction point**; broker integrations described as "limited and finicky"; genuinely costly for anyone trading 30+ times a week.
  - **No mobile app** — cannot log a trade or check stats from a phone.
  - **UI feels like a 2018/2019 desktop app**; navigation dense.
  - **"No AI"** relative to 2025–26 entrants — surfaces data but leaves interpretation to the user.
  - **Forced annual renewal** and, in the one 1-star review (Dec 2024), **unresponsive support** plus a data-model annoyance: *"I would have to delete the trade and start over"* when updating a closed trade `[V]`.
  - No backtesting engine proper, no strategy templates, no education `[R]`.
  - English-only UI and USD-only billing despite German origins — friction for EU users `[R]`.
- **Why people leave `[I]`, inferred:**
  - **Data-entry fatigue.** The manual inputs that make it special are the same ones that make it abandonable in a drawdown, when journaling discipline collapses first.
  - **The 2024 subscription switch**, for perpetual-licence holders who felt the deal changed underneath them.
  - **Mobile-first traders** who simply cannot use it in their workflow.
  - **Beginners** who buy it, find no setups or education, and churn — the vendor itself says they are a poor fit.

## Engineer's read

- **Stack (inferred from changelog `[V]`):** Angular (18+), Tailwind CSS, a server-side API with pagination on large grids, WebSocket notifications, and a relational store. Client-heavy analytics: performance complaints and fixes cluster around *journal load time* for >20k-trade journals and chart render speed, implying **the whole journal is pulled to the browser and aggregated client-side** `[I]`. That is a design TapeReader would recognise — and is exactly what our own D1 free-tier constraints (50 queries/invocation, 100k row writes/day) would push us away from.
- **Broker sync approach:** file parsers plus an **MT4/MT5 Expert Advisor + FTP relay** for the only true auto-sync path `[V]`. No OAuth broker connections evident. `[I]` For TapeReader this is reassuring: our DAS-CSV-only ingest is not as far behind the category leader as the "200+ brokers" headline suggests.
- **Chart rendering:** consolidation/legend work and "chart tables" suggest a single conventional charting library, not custom canvas `[I]`. Candlestick trade charts (Jul 2026) mean they now pull historical OHLC per trade — the same dependency TapeReader already has via Polygon.
- **Hard to build:**
  - The **importer estate** — not intellectually hard, but ~100 adapters × ongoing breakage is a permanent 0.5–1 FTE.
  - **Trustworthy Monte Carlo + risk-of-ruin at interactive speed** over an arbitrary filtered subset.
  - **Edge Finder** as a *curated* engine: the hard part is the editorial judgement about which of hundreds of comparisons is worth surfacing, and the multiple-comparisons discipline to avoid shipping noise as insight.
- **Easy but tedious:**
  - Custom Statistics (20 categorical dimensions) — a tag table plus a generic group-by. **On our stack this is a Google Sheet column-block plus a `groupBy` in `computeStats`.**
  - Efficiency (`positive ÷ total comments`) — trivial arithmetic on a rated-tag table.
  - Trade Comments library with pre-assigned valence — one settings screen, one join.
  - Missed Trades / Trading Plans — TapeReader already has a `Daily Plan` tab and `Origin` matching; missed trades are the *unmatched plan rows*, which we currently discard.
  - Actual-vs-potential R — **TapeReader already computes `Max R Before Stop` and `MAE (R)` from 1-minute bars**, which is strictly more information than Edgewonk's hand-ticked `OTP Hit`.
- `[I]` **The structural arbitrage for TapeReader:** Edgewonk's differentiated metrics are gated on *manual* fields (`OTP Hit`, highest/lowest price, SL/TP). We already derive the equivalents from Polygon bars. We can ship Edgewonk-class trade-management and exit analytics **with zero additional data entry**, which is the exact weakness they cannot engineer their way out of.

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Pre-rated behaviour tag library (valence assigned at definition time, not journaling time)** — author a personal list of Pre-Trade/Entry/Management/Exit comments, each flagged +/−/neutral once, then just pick them per trade | The single best idea in this file. Our `Process Followed?` is one bit per trade; this makes discipline *multi-dimensional and stage-attributed* while making the honesty problem tractable. Extends our existing `Tags` column with a valence dimension | dogfood + commercial | **M** |
| **Efficiency % = positive tags ÷ total tags** | Direct upgrade to our Discipline % (currently `Yes ÷ (Yes+No)` over trades). Comment-level granularity separates "one sloppy trade" from "sloppy all week" | dogfood | **S** |
| **Tiltmeter: rolling recent-window discipline score, overlaid on the equity curve, calendar, and trade table** | Our Discipline % is a single filtered aggregate — it cannot show *escalation*. A rolling window rendered on the existing Trading Calendar answers "was I tilting on the 14th?" Calendar + drilldown already exist | dogfood + commercial | **M** |
| **Edge Leak / True System Edge** — P&L of rule-followed trades vs all trades, and the delta in dollars and R | Turns discipline from a percentage into a dollar amount. We already have `Process Followed?` and filtered `computeStats` — this is a second pass over `dataRows` | dogfood + commercial | **S** |
| **Missed Trades** — plan rows that never became fills, with a reason tag and their own analytics | We already write a `Daily Plan` tab and match `date\|symbol` at upload to set `Origin`. The **unmatched plan rows are already computed and thrown away.** Measuring inaction is invisible to every fill-derived journal | dogfood + commercial | **S** |
| **Sample-size-penalised composite score (EW Score analogue)** | Guards against our own overconfidence on a small sample — directly relevant to the Prediction/Execution funnel, whose denominators are already surfaced but easy to ignore | dogfood | **S** |
| **Coin Flip Distribution** — bootstrap/permutation test of the equity curve against random entries | Answers "is my Daily Prediction % actually skill?" We already have the per-trade R series; this is a resampling loop | dogfood + commercial | **M** |
| **Actual-vs-potential-R trade management chart with an explicit "R lost/gained by managing" line** | We already compute the weekly `B`/`Δ` bracket counterfactual in the Calendar. Promoting it to a first-class time-series chart is mostly UI — and **our version is bar-derived, so strictly better than their hand-ticked `OTP Hit`** | dogfood + commercial | **S** |
| **Exit Analysis: how far price ran *after* our exit** | The trail-leak question our Capture Tracker asks obliquely. We already walk 1-minute bars to 16:00 ET for `Max R Before Stop` — post-exit continuation is the same walk with a different start index | dogfood | **S** |
| **Monte Carlo simulator: risk of ruin + streak-length distribution from our own realised stats** | Forward-looking risk. Our Profitability Analysis is entirely backward-looking. Pure client-side compute on data `/analysis` already returns | dogfood + commercial | **M** |
| **Up to 20 user-defined categorical statistics, each auto-becoming a slicing dimension** | Our columns are hardcoded in `google-sheets.ts`. A generic tag-dimension block would let us test hypotheses (level type, stop logic, chart pattern) without a schema migration each time. **Key architectural decision — do it before the column count grows further** | dogfood + commercial | **L** |
| **Per-setup checklists with per-rule profitability** ("which of my rules actually makes money") | Turns a static plan into a tested one. Fits the existing Morning Plan form | dogfood + commercial | **M** |
| **Sessions: structured daily/weekly/monthly review with report cards and lesson tracking** | We have a Morning Plan but **no closing ritual**. The review loop is where the journal's value is actually realised | dogfood + commercial | **M** |
| **Scheduled push-model insight digest (Edge Finder pattern), not a chatbot** | Traders don't know what to ask. A weekly generated digest over `computeStats` output beats an LLM chat box, is deterministic, and costs nothing to run at the edge | dogfood + commercial | **M** |
| **Chartbook extended to plan and missed-trade screenshots** | Our Screenshot Review only indexes executed trades; the Drive folders and `date\|symbol` join already exist | dogfood | **S** |
| **Competitor-format importers (Tradervue, TraderSync, TradeZella exports)** | Pure commercial switching-cost play. Cheap; disproportionately effective at purchase | commercial | **M** |
| **Free anonymised journal-review video service** | Content marketing that simultaneously teaches correct journaling and enforces the data hygiene your differentiated analytics need. Very high leverage for a solo/small team | commercial | **S** (per review) |
| **Single-SKU, everything-included pricing** | Removes tier anxiety and upsell resentment; matches a bootstrapped cost base. Worth copying if we ever sell | commercial | — |

## Sources

- [Edgewonk — homepage](https://edgewonk.com/) — accessed 2026-09-01
- [Edgewonk — Pricing](https://edgewonk.com/pricing) — accessed 2026-09-01
- [Edgewonk — Features](https://edgewonk.com/features) — accessed 2026-09-01
- [Edgewonk — Chart Lab](https://edgewonk.com/chart-lab) — accessed 2026-09-01
- [Edgewonk — Trading Psychology Lab](https://edgewonk.com/trading-psychology) — accessed 2026-09-01
- [Edgewonk — Edge Finder](https://edgewonk.com/edge-finder) — accessed 2026-09-01
- [Edgewonk — Import / supported brokers](https://edgewonk.com/import) — accessed 2026-09-01
- [Edgewonk — Changelog](https://edgewonk.com/changelog) — accessed 2026-09-01 (primary evidence for platform stack, feature dates, importer estate)
- [Edgewonk — Imprint](https://edgewonk.com/imprint) — accessed 2026-09-01 (legal entity, directors)
- [Edgewonk — Free journal review service](https://edgewonk.com/review) — accessed 2026-09-01
- [Edgewonk blog — A Deep Dive into Edgewonk Performance Statistics](https://edgewonk.com/blog/a-deep-dive-into-edgewonk-performance-statistics) — accessed 2026-09-01 (metric formulas)
- [Edgewonk blog — Understanding the Edgewonk Score](https://edgewonk.com/blog/understanding-the-edgewonk-score) — accessed 2026-09-01
- [Edgewonk blog — Mastering Trading Discipline with Edgewonk's Tiltmeter](https://edgewonk.com/blog/mastering-trading-discipline-with-edgewonks-tiltmeter) — accessed 2026-09-01
- [Edgewonk blog — A Clear Guide to Evaluating Your Trade Management Effectiveness](https://edgewonk.com/blog/trade-management-guide) — accessed 2026-09-01
- [Edgewonk blog — The Simulator provides insights into your profitability](https://edgewonk.com/blog/the-simulator-provides-insights-into-your-profitability) — accessed 2026-09-01
- [Edgewonk blog — 10 Things to Do in Edgewonk After You Enter Your First Trades](https://edgewonk.com/blog/10-things-to-do-in-edgewonk) — accessed 2026-09-01 (OTP Hit, Chartbook, 20 custom stats)
- [Edgewonk blog — How to review your trading in Edgewonk](https://edgewonk.com/blog/edgewonk-review-guide) — accessed 2026-09-01
- [Edgewonk blog — More Custom Statistics, Trading Plans (May 2022 update)](https://edgewonk.com/blog/more-custom-statistics-trading-plans-may-2022-update) — accessed 2026-09-01
- [Edgewonk blog — Top Custom Trading Statistics Every Trader Should Track](https://edgewonk.com/blog/top-custom-trading-statistics-every-trader-should-track) — accessed 2026-09-01
- [Edgewonk blog — The Edgewonk Edge Finder is here](https://edgewonk.com/blog/edgewonk-edge-finder) — accessed 2026-09-01 (anti-chatbot positioning)
- [Edgewonk blog — Edgewonk Adds Deeper Trading Analytics to Chart Lab](https://edgewonk.com/blog/update-deeper-chart-lab-analytics-for-trading-performance) — accessed 2026-09-01
- [Edgewonk blog index](https://edgewonk.com/blog) — accessed 2026-09-01
- [Edgewonk Help Centre — The Tiltmeter](https://edgewonk.zendesk.com/hc/en-us/articles/360010150259-The-Tiltmeter) — via search extract 2026-09-01 (direct fetch blocked by Cloudflare)
- [Edgewonk Help Centre — Using Trade Comments and ratings](https://edgewonk.zendesk.com/hc/en-us/articles/360010061440-Using-Trade-Comments-and-ratings) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Custom Statistics Settings](https://edgewonk.zendesk.com/hc/en-us/articles/360013434820-Custom-Statistics-Settings) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — What is the OTP hit field?](https://edgewonk.zendesk.com/hc/en-us/articles/360010061280-What-is-the-OTP-hit-field) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Missed Trades](https://edgewonk.zendesk.com/hc/en-us/articles/7772557295506-Missed-Trades) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Simulator](https://edgewonk.zendesk.com/hc/en-us/articles/360010150199-Simulator) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Trade Management](https://edgewonk.zendesk.com/hc/en-us/articles/360013522899-Trade-Management) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Exit Analysis](https://edgewonk.zendesk.com/hc/en-us/articles/7771586672146-Exit-Analysis) — via search extract 2026-09-01 (blocked)
- [Edgewonk Help Centre — Can I use Edgewonk from my phone?](https://edgewonk.zendesk.com/hc/en-us/articles/360010149699-Can-I-use-Edgewonk-from-my-phone) — via search extract 2026-09-01 (no native app)
- [Tradeciety — All Edgewonk's Metrics and Statistics Explained](https://tradeciety.com/all-edgewonks-metrics-and-statistics-explained-for-successful-journaling) — accessed 2026-09-01 (founder-affiliated; Drawdown/Updraw, Traffic Lights, Potential Performance)
- [Trustpilot — edgewonk.com](https://www.trustpilot.com/review/edgewonk.com) — accessed 2026-09-01 (4.7/5, 44 reviews)
- [TradingJournal.com — Edgewonk Review 2026](https://tradingjournal.com/review/edgewonk) — accessed 2026-09-01 (7.0/10; Coin Flip Distribution; competitor comparisons)
- [FlowTrader AI — Edgewonk Review 2026, European perspective](https://flowtraderai.de/en/blog/edgewonk-erfahrungen) — accessed 2026-09-01 ("psychology pioneer, overtaken by AI")
- [TraderTrac — Edgewonk Review 2026](https://tradertrac.com/blog/edgewonk-review-2026-is-the-one-time-fee-still/) — accessed 2026-09-01 (complaints; note: repeats obsolete one-time-fee claim)
- [Traders Second Brain — Edgewonk alternative](https://traderssecondbrain.com/guides/edgewonk-alternative) — accessed 2026-09-01 (competitor page; documents the subscription switch, but its "Java app, no web version" claim is factually stale)
- [EpiccTrader — Edgewonk Review](https://epicctrader.com/edgewonk/) — accessed 2026-09-01 (learning curve, thin advanced docs)
- [Livestream Trading — Edgewonk Trading Journal Review](https://livestreamtrading.com/edgewonk-trading-journal-review/) — accessed 2026-09-01 (trade plans, reflection tab, Chartbook, simulator)
- [Bullish Bears — Edgewonk Review](https://bullishbears.com/edgewonk-review/) — accessed 2026-09-01 (**stale**: describes the 2.x one-time-licence era; cited as evidence of the reputation-lag problem)
