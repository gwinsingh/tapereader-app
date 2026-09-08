# Feature Matrix — canonical taxonomy

**Status:** taxonomy defined 2026-09-01; **matrix filled 2026-09-01** from the seven
primary vendor files + `03-gap-analysis.md` Part A. 105 features × 8 columns.

This is the join point of the whole study. Vendor files feed it; the gap
analysis and the dogfood backlog read from it. When a vendor file changes, this
must be re-derived.

## How to read it

Each feature is scored per vendor:

| Mark | Meaning |
|---|---|
| ● | Full, first-class implementation |
| ◐ | Partial — present but limited, or gated behind an awkward workflow |
| ○ | Absent |
| ? | Could not establish from public sources |

The **TR** column is TapeReader's journal as it exists today (from the internal
audit in `03-gap-analysis.md`), so the matrix doubles as our gap list.

Each feature also carries a **class**, which is the judgment that actually
drives the backlog:

- **Table stakes** — everyone has it; absence is disqualifying; building it wins nothing.
- **Differentiator** — some have it, it is visibly valued, it can win a user.
- **Frontier** — few or none have it well; the interesting ground.
- **Vitamin** — demoed well, rarely used in practice. Cheap to skip.

---

## 1. Data in — import, sync, and coverage

- 1.1 Manual trade entry (single trade form)
- 1.2 CSV / file import from broker exports
- 1.3 Breadth of broker file-format support
- 1.4 True automatic broker sync (credentialed or API, unattended)
- 1.5 Third-party aggregator use (SnapTrade / Plaid Investments / similar)
- 1.6 Multi-account support, and aggregation across accounts
- 1.7 Multi-currency / non-US market support
- 1.8 Asset classes: equities · options · futures · forex · crypto
- 1.9 Import of historical backfill at signup
- 1.10 Handling of corporate actions (splits, symbol changes)
- 1.11 Duplicate detection and idempotent re-import
- 1.12 Data export / portability out

## 2. Trade construction & data model

- 2.1 Fill-to-round-trip grouping (position tracking)
- 2.2 Scaling in/out and partial fills
- 2.3 Short handling
- 2.4 Overnight / multi-day position handling
- 2.5 Multi-leg options structures (spreads, expiry, assignment)
- 2.6 Futures contract multipliers, rollovers
- 2.7 Commissions, fees, borrow, slippage accounting
- 2.8 User-defined custom fields
- 2.9 Trade-level vs. day-level vs. account-level data separation
- 2.10 Account-level cash flows (deposits, withdrawals, dividends, fees) and a true equity curve **[added during synthesis]**

## 3. Core analytics & statistics

- 3.1 P&L, win rate, expectancy, profit factor
- 3.2 R-multiple analysis (requires per-trade risk)
- 3.3 MFE / MAE (favorable and adverse excursion)
- 3.4 Distribution/histogram views rather than just averages
- 3.5 Breakdown by setup / strategy / tag
- 3.6 Breakdown by time of day, day of week, hold duration
- 3.7 Breakdown by symbol, sector, price band, volatility regime
- 3.8 Drawdown, streaks, Kelly / risk-of-ruin
- 3.9 Position sizing analysis
- 3.10 Entry vs. exit quality decomposition
- 3.11 Statistical significance / sample-size honesty
- 3.12 Custom user-defined metrics
- 3.13 Benchmarking against market conditions on the trade date

## 4. Charts & visual review

- 4.1 Trade-annotated price chart (entries/exits plotted on bars)
- 4.2 Intraday granularity of that chart (1m and below)
- 4.3 Multi-timeframe view of the same trade
- 4.4 Market replay / bar-by-bar playback
- 4.5 Screenshot upload and attachment
- 4.6 Screenshot auto-matching to trades
- 4.7 Drawing / annotation on charts
- 4.8 Side-by-side comparison of multiple trades

## 5. Journaling, notes & tagging

- 5.1 Free-text notes per trade
- 5.2 Daily / session journal separate from per-trade notes
- 5.3 Tagging, and tag-based analytics
- 5.4 Templates for structured reflection
- 5.5 Rich media in notes (images, links)
- 5.6 Search across journal history
- 5.7 Retrospective re-tagging workflow

## 6. Psychology, discipline & process

- 6.1 Emotion / state capture per trade or per day
- 6.2 Rule-adherence ("did I follow my process?") tracking
- 6.3 Tilt / behavioural-degradation detection
- 6.4 Pre-market conviction capture
- 6.5 Physiological inputs (sleep, readiness, energy)
- 6.6 Correlation of psychological inputs with performance
- 6.7 Discipline scoring over time
- 6.8 Streak / habit mechanics

## 7. Planning & pre-market

- 7.1 Watchlist / daily plan capture
- 7.2 Thesis and catalyst recorded before the trade
- 7.3 Multi-timeframe bias recorded pre-open
- 7.4 Plan-vs-execution reconciliation (did I trade my plan?)
- 7.5 Idea-origin classification (own watchlist vs. callout vs. impulse)
- 7.6 Scanner / idea generation integrated with the journal
- 7.7 Missed-trade capture — planned but not taken, with reason and its own analytics **[added during synthesis]**

## 8. Risk & money management

- 8.1 Per-trade risk (R) capture
- 8.2 Daily loss limits and monitoring
- 8.3 Drawdown / trailing-drawdown tracking
- 8.4 Prop-firm rule compliance
- 8.5 Position-size calculator
- 8.6 Risk-unit schedule over time (risk changing as account grows)
- 8.7 Exposure and correlation across open positions
- 8.8 Prop-firm cost/payout accounting — eval fees, resets, payouts, net ROI on the habit **[added during synthesis]**

## 9. Playbooks, setups & rules engine

- 9.1 Named setups / strategies with definitions
- 9.2 Playbook documents with criteria checklists
- 9.3 Automatic classification of trades into setups
- 9.4 Per-setup performance with enough sample to be meaningful
- 9.5 Rule violations detected automatically
- 9.6 Backtesting / manual replay to build a setup's sample

## 10. Simulation & counterfactuals

- 10.1 "What if I had used a different exit" analysis
- 10.2 Partial-taking / scaling strategy simulation
- 10.3 Fixed-bracket counterfactual vs. discretionary management
- 10.4 Monte Carlo / sequence-risk simulation
- 10.5 Optimal stop / target discovery from own data

## 11. AI & automation

- 11.1 LLM summary of statistics
- 11.2 Conversational query over own trade history
- 11.3 Pattern detection beyond stated tags
- 11.4 Vision analysis of chart screenshots
- 11.5 Coaching against the trader's own stated plan and rules
- 11.6 Automatic tagging / setup classification
- 11.7 Generated periodic review documents

## 12. Reporting, sharing & social

- 12.1 Periodic (daily/weekly/monthly) review reports
- 12.2 Shareable public trade links
- 12.3 Mentor / coach access with permissions
- 12.4 Team / group / trading-room dashboards
- 12.5 Community feed, leaderboards
- 12.6 Tax / accounting export

## 13. Platform, UX & trust

- 13.1 Mobile app (native) / mobile web quality
- 13.2 Offline capability
- 13.3 Speed with large trade histories
- 13.4 Onboarding time to first insight
- 13.5 Data privacy posture, security claims, and hosting jurisdiction
- 13.6 API for the user's own data
- 13.7 Pricing transparency and free-tier generosity
- 13.8 Data provenance — "these trades came from a sync and were never hand-edited" **[added during synthesis]**

---

## Matrix

**Filled 2026-09-01** by joining the seven primary vendor files against Part A of
`03-gap-analysis.md`. Column keys:

`TZ` TradeZella · `TV` Tradervue · `TS` TraderSync · `EW` Edgewonk ·
`TVz` TradesViz · `CL` Chartlog · `TM` Trademetria · `TR` TapeReader (us)

Three standing caveats that apply to every table below:

- **Vendor marketing was not trusted where a vendor file established otherwise.**
  Broker-coverage rows in particular score the *verified* count, not the headline.
- **`CL` reflects a frozen product.** Chartlog's newest help article is 2022-03-07 and
  its "Coming Soon" list still contains Credit Suisse. What it shipped, it shipped well;
  nothing in its row should be read as a live roadmap.
- **`?` means we could not establish it**, not that it is absent. Several `?` cells sit
  on features that are almost certainly present but were never documented on a fetchable
  page — an honest gap is recorded rather than a guessed `●`.

Four rows were added to the taxonomy during synthesis, flagged **[added]** — see 2.10,
7.7, 8.8 and 13.8. Each is a capability at least two vendors ship that had no home in the
original 13 sections.

---

### 1. Data in — import, sync, and coverage

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 Manual trade entry | table stakes | ◐ | ◐ | ● | ● | ● | ● | ● | ○ | TZ/TV document execution editing and API create, not a standalone entry form. TR: if DAS didn't export it, it isn't in the journal. |
| 1.2 CSV / file import | table stakes | ● | ● | ● | ● | ● | ● | ● | ● | Universal. TR supports exactly one layout (DAS "Trades"), with naive `split(",")`. |
| 1.3 Breadth of file-format support | table stakes | ● | ● | ● | ● | ● | ◐ | ● | ○ | Verified parser counts: TS 495 rows · TVz ~250 (641 SEO pages) · EW ~100+ · TV 83 (incl. brokers defunct since 2016) · TM 194 · TZ ~50 · CL 21. |
| 1.4 True automatic broker sync | table stakes | ● | ◐ | ● | ◐ | ● | ◐ | ◐ | ○ | **The most inflated row in the category.** Real auto-sync: TS 73 · TVz ~70 · TM 21 · TZ ~13 mechanisms · TV **5** (one is a third party's NinjaTrader plugin) · CL 4 + a DAS log-tailer · EW MetaTrader only. |
| 1.5 Third-party aggregator (SnapTrade/Plaid) | differentiator | ◐ | ○ | ○ | ○ | ● | ○ | ? | ○ | TVz is the reference: Plaid investment sync (Jul 2026) reaches E*TRADE/Vanguard/Merrill. TZ uses Plaid only for prop-firm *bank* transactions. TM's retail names imply an aggregator but it is unstated. |
| 1.6 Multi-account + aggregation | table stakes | ● | ● | ● | ● | ● | ● | ● | ◐ | TV's account tags change *merge semantics*, not just labels — the best primitive found. TR: one sheet tab per account, no cross-account view. |
| 1.7 Multi-currency / non-US markets | vitamin | ◐ | ● | ◐ | ● | ● | ○ | ● | ○ | Table stakes only if you serve non-US traders. TS ships it and its own users report currency-base bugs corrupting P&L and commissions. TVz converts currency but has market data for US/CA/IN/AU only. |
| 1.8 Asset classes (eq·opt·fut·fx·crypto) | table stakes | ● | ◐ | ● | ● | ● | ◐ | ● | ○ | TV has no crypto spot; CL is stocks+options only and "outgrowing the asset scope" is its named churn story. TR is equities-only with no multiplier concept. |
| 1.9 Historical backfill at signup | table stakes | ● | ● | ● | ● | ● | ◐ | ● | ◐ | TVz documents the correct playbook (import history once, then set the sync from-date). CL's log-tailer explicitly cannot backfill. TR: the date comes from a form field, so **one upload = one trading day**. |
| 1.10 Corporate actions (splits, symbol changes) | table stakes | ? | ? | ◐ | ? | ◐ | ? | ◐ | ○ | Nobody markets it; everybody needs it. TVz names corporate actions as part of the import moat; TS auto-detects futures rollovers. TR fetches adjusted Polygon bars against raw fills — a split in the lookback silently distorts ATR/ADR/SMA. |
| 1.11 Duplicate detection / idempotent re-import | table stakes | ◐ | ◐ | ◐ | ? | ● | ◐ | ◐ | ● | TVz is the reference (stable transaction IDs + an "Import Doctor" that explains duplicates in plain language). TS's "zombie trades" and TZ's duplication reports are the failure mode. TR's `Date\|Symbol\|EntryTime\|Side` key makes re-uploading a day safe. |
| 1.12 Data export / portability out | table stakes | ● | ● | ? | ● | ● | ? | ● | ● | TVz exports in a re-importable "Native" format and retains original uploads. TR's store *is* a Google Sheet the user owns — maximal portability, by accident of architecture. |

### 2. Trade construction & data model

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 Fill-to-round-trip grouping | table stakes | ● | ● | ● | ● | ● | ● | ● | ◐ | TV adds a time-gap rule and configurable auto-merge/split; TVz makes grouping user-tunable at import. TR mis-groups **position flips** (a fill crossing through zero) and floors negative durations. |
| 2.2 Scaling in/out, partial fills | table stakes | ● | ● | ● | ● | ● | ● | ● | ● | Universal and correct in TR (though `# Partials` stores total fills, not scale-outs). |
| 2.3 Short handling | table stakes | ● | ● | ● | ● | ● | ● | ● | ● | Universal. |
| 2.4 Overnight / multi-day positions | table stakes | ● | ● | ○ | ? | ● | ◐ | ● | ○ | TV books realized P&L FIFO on the date realized. **TS is closed-round-trip-only and its users call the missing unrealized P&L a deal-breaker** — the same architectural choice TR made. TR writes unclosed positions as $0-P&L rows with a $0.00 avg exit. |
| 2.5 Multi-leg options structures | differentiator | ◐ | ◐ | ● | ◐ | ● | ◐ | ◐ | ○ | TVz is the reference (per-leg greeks, payoff charts, wheel cost-basis, options flow). TS auto-detects named spread structures but **does not model rolls**. TZ reportedly mis-groups calendar spreads. |
| 2.6 Futures multipliers, rollovers | table stakes | ● | ● | ● | ● | ● | ○ | ● | ○ | The prop-futures cohort is where category growth is; CL and TR are the two that opted out. |
| 2.7 Commissions, fees, borrow, slippage | table stakes | ● | ● | ● | ● | ● | ● | ● | ○ | TV is the reference — exchange fees and **ECN fee/rebate sign** are first-class (which is what makes its liquidity reports possible). TV gates it at Gold. **TR reports gross P&L with no cost accounting of any kind.** |
| 2.8 User-defined custom fields | differentiator | ◐ | ○ | ○ | ● | ● | ○ | ◐ | ○ | The key architectural fork. EW: 20 user-defined *categorical* dimensions. TVz: Trade/Day Plans with checkbox/category/text/**numeric** fields plus formula columns — the only fully general one. TR has 75 hardcoded columns; a new dimension is a code change. |
| 2.9 Trade vs. day vs. account separation | table stakes | ● | ● | ◐ | ● | ● | ● | ● | ◐ | TVz gives day-level tags and plans a full parallel chart family. TR replicates day-level data *onto* trade rows (`DAY_FILL_COLS`) rather than having a day object, and has no account-level layer. |
| 2.10 Account cash flows + true equity curve **[added]** | differentiator | ◐ | ○ | ○ | ○ | ● | ○ | ● | ○ | TM and TVz treat deposits/withdrawals/dividends/fees as first-class, which is what makes CAGR and account-level return real rather than a sum of trade P&L. Added because it has no home in the original taxonomy and is the difference between a *trade* product and a *portfolio* product. |

### 3. Core analytics & statistics

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 P&L, win rate, expectancy, profit factor | table stakes | ● | ● | ● | ● | ● | ● | ● | ● | Universal, and free from every broker. Building it wins nothing. |
| 3.2 R-multiple analysis | table stakes | ● | ● | ○ | ● | ● | ● | ● | ● | **TS is the outlier — no R framing anywhere**, everything is dollars and percent. TM computes R on *open* positions. TR is the most R-native of all (Standard R, Realized R, R ladder, R distribution). |
| 3.3 MFE / MAE | table stakes | ● | ● | ● | ◐ | ● | ● | ○ | ● | TV splits **position** MFE/MAE from **price** MFE/MAE (isolating the market call from the sizing decision) — nobody else does. TVz computes it from 5-second bars for futures and S&P 500 names. EW's is gated on hand-entered high/low prices. **TM ships none.** TR's is order-aware (stops accruing once the stop level trades). |
| 3.4 Distributions, not just averages | differentiator | ◐ | ● | ◐ | ● | ● | ◐ | ◐ | ● | TVz distributes P&L in dollars, % **and R**. EW adds confidence intervals. TR has an 8-bucket realized-R distribution and an R-reach ladder. |
| 3.5 Breakdown by setup / strategy / tag | table stakes | ● | ● | ● | ● | ● | ● | ● | ◐ | Universal. TV's Tag *Combinations* breakdown is the deepest. TR has setup/conviction/catalyst breakdowns but **no tag breakdown** — tags are filter-only — and Setup is comma-split and multi-counted, so segment totals can exceed the account total. |
| 3.6 Breakdown by time of day, day of week, duration | table stakes | ● | ● | ● | ● | ● | ● | ● | ◐ | Universal (CL gates day-of-week and duration at Pro). EW slices by **30-minute window**. TR's 12-block granular grid starting 9:30–9:35 is finer than anyone's — but it has **no day-of-week and no hold-duration breakdown**. |
| 3.7 Breakdown by symbol, sector, price band, volatility regime | differentiator | ◐ | ● | ◐ | ◐ | ● | ◐ | ◐ | ◐ | TV's Market Behavior group and TVz's "PnL vs indicator" are the two reference implementations. **TR stores every input either of them uses (%Gap, RVOL, ATR, ADR, 30mATR, %ATR, Dist 20/50 SMA, Float, Avg $Vol, SPY Dir, VIX, PDC/PDH/PDL) and has no breakdown surface for any of them.** |
| 3.8 Drawdown, streaks, Kelly / risk-of-ruin | table stakes | ◐ | ● | ◐ | ● | ● | ○ | ◐ | ◐ | TV: Kelly %, K-Ratio, SQN over *completed* drawdown periods. EW: drawdown depth **and length**, losing-streak probability, risk of ruin. TVz: drawdown at EOD **and 30-minute** resolution. TR has streaks only — and computes them in sheet row order rather than date order. |
| 3.9 Position sizing analysis | differentiator | ◐ | ◐ | ◐ | ● | ● | ○ | ◐ | ◐ | EW's Risk Distribution surfaces sizing outliers; TVz buckets win rate by position size. TR's calendar **size pill** (avgRisk ÷ Full R) is a real sizing-discipline lens, but nothing correlates size with outcome. |
| 3.10 Entry vs. exit quality decomposition | differentiator | ◐ | ● | ● | ● | ● | ◐ | ◐ | ◐ | **The most competed-on analytic in the category — on the exit half only.** TV floats the last exit group within the *actual risk taken* (best formulation). TS ships four lenses. TVz adds multi-timeframe and EOD exit counterfactuals. **Entry-quality decomposition is absent from all eight columns.** |
| 3.11 Statistical significance / sample honesty | differentiator | ○ | ● | ○ | ● | ● | ◐ | ○ | ◐ | TV publishes a **p-value on your edge**; EW penalises small n *inside* its headline score and ships a coin-flip distribution; TVz gates every comparison on a two-proportion z-test with n≥10. CL teaches an N≥25 norm without computing it. TR surfaces honest denominators (and excludes `N/A` young listings) but runs **no significance test**. |
| 3.12 Custom user-defined metrics | differentiator | ○ | ◐ | ○ | ◐ | ● | ◐ | ○ | ◐ | Only TVz has real user formulas (pivot custom columns). TV's 40-metric X/Y scatter is user-*composed* rather than user-defined. TR: a user can add any formula column to the sheet, but the app ignores unmanaged columns, so it never reaches an analysis surface. |
| 3.13 Benchmarking vs. market conditions on the trade date | differentiator | ○ | ● | ○ | ◐ | ● | ◐ | ◐ | ◐ | TV's 11 Market Behavior reports are the reference. TR's Prediction funnel (excursion from the open vs. `30mATR` and gap-free `ADR`) is a genuinely novel *instance* of this — but it is the only one of 33 enrichment fields that reaches a report. |

### 4. Charts & visual review

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 Trade-annotated price chart | table stakes | ● | ● | ● | ● | ● | ● | ● | ○ | **Universal, and the single largest hole in TR.** Nobody in this category built charting — TradingView's library renders TZ, TVz, CL and TM. CL's whole thesis is "forget about screenshots". TR renders no chart anywhere. |
| 4.2 Intraday granularity (1m and below) | table stakes | ● | ● | ● | ● | ● | ● | ◐ | ◐ | TVz reaches 5-second for US futures and S&P 500; TS reaches 250ms in replay. TM's 2,500-symbol US ceiling excludes small caps. TR **fetches** 1-minute bars for every trade and never renders them. |
| 4.3 Multi-timeframe view of one trade | vitamin | ◐ | ● | ? | ◐ | ● | ◐ | ◐ | ○ | TV's four independently-configured charts per trade page is the reference. Well-liked, rarely the reason anyone buys. |
| 4.4 Market replay / bar-by-bar playback | differentiator | ● | ○ | ● | ○ | ● | ○ | ○ | ○ | TS's 250ms replay with reconstructed Level II and Time & Sales across 30k assets is the deepest moat in the category **and its heaviest COGS** — and its own paying users call it buggy. TZ's Trade Replay of your real fills is the most-praised feature in its file. A deliberate "do not build" for TR: this is a data-licensing problem, not an engineering one. |
| 4.5 Screenshot upload and attachment | table stakes | ● | ● | ? | ● | ● | ● | ● | ◐ | EW's Chartbook (clipboard paste, auto-compression, TradingView import, indexed across trades/plans/missed trades) is the reference. TR has screenshots but **no upload from the app** — files must be dropped in Drive with a hand-typed filename. |
| 4.6 Screenshot auto-matching to trades | vitamin | ○ | ○ | ○ | ◐ | ○ | ○ | ○ | ● | Read this row carefully: every vendor makes attachment explicit at upload, so auto-matching is *unnecessary* for them. TR's `date\|symbol` join is a workaround for lacking in-app upload — not an advantage. The part that **is** genuinely distinct is treating entry and EOD charts as separate classes, which no chart renderer produces. |
| 4.7 Drawing / annotation on charts | vitamin | ● | ● | ? | ? | ● | ● | ◐ | ○ | TVz maintains a whole second (static-PNG) chart pipeline *purely* so drawings persist. CL puts draggable stop/target lines on the chart that write back to R. |
| 4.8 Side-by-side comparison of multiple trades | differentiator | ◐ | ● | ● | ○ | ● | ○ | ○ | ◐ | TV's Charts (large/small) list view — a filtered trade set rendered as a wall of auto-charts, auto-picking the finest timeframe containing the whole trade — is cheap and highly rated. TR's Screenshot Review card grid is the same idea using images. |

### 5. Journaling, notes & tagging

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 5.1 Free-text notes per trade | table stakes | ● | ● | ● | ● | ● | ● | ● | ● | Universal. |
| 5.2 Daily / session journal, separate object | table stakes | ● | ● | ◐ | ● | ● | ● | ● | ○ | EW's Sessions (daily/weekly/monthly with report cards, reflection prompts and lesson tracking) is the reference. TS is the category's worst here despite being called a journal. **TR has a pre-market plan and no closing ritual of any kind.** |
| 5.3 Tagging + tag-based analytics | table stakes | ● | ● | ● | ● | ● | ● | ● | ◐ | TVz gives **day** tags the full chart family; TV ships tag *combinations*. TR has tags and no tag report. |
| 5.4 Templates for structured reflection | table stakes | ● | ● | ○ | ● | ● | ● | ● | ○ | Cheap, universal, and the fix for the blank-page problem that stops people journaling. |
| 5.5 Rich media in notes | table stakes | ● | ● | ? | ● | ● | ● | ● | ○ | TM: WYSIWYG HTML editor with unlimited images on the **free** tier. TR: a plain spreadsheet cell. |
| 5.6 Search across journal history | differentiator | ◐ | ? | ? | ● | ● | ? | ● | ○ | Only 3 of 7 clearly ship it; TM explicitly frames it as "the feature most journals forget", and they are right. Cheap, high daily utility. |
| 5.7 Retrospective re-tagging workflow | differentiator | ● | ● | ◐ | ◐ | ● | ◐ | ◐ | ● | TVz's Group Apply (bulk tags/notes/split/merge + wildcard cleanup) is the reference. TZ's AI auto-tagger **corrupted ~200 trades with no reliable undo** — the design lesson is suggest-and-confirm with a batch undo. EW reportedly requires delete-and-recreate to update a closed trade. TR's Screenshot Review exists precisely for this and writes straight back to the store. |

### 6. Psychology, discipline & process

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 6.1 Emotion / state capture per trade or day | differentiator | ◐ | ○ | ◐ | ◐ | ◐ | ○ | ◐ | ● | Free-text emotion tags are table stakes; a **typed** state schema is not. EW's important correction: it measures *behaviour* and infers state, it does not ask you to rate your feelings. TVz ships the mechanism but no schema — you must design your own. |
| 6.2 Rule-adherence tracking | table stakes | ● | ○ | ◐ | ● | ● | ● | ● | ◐ | Six of seven ship something richer than ours. TZ's **"Finish My Day"** locks the day's rule checkboxes so compliance cannot be backfilled — the highest behavioural-integrity-per-line-of-code idea in the study. **TR has one self-graded Yes/No bit per trade, with no lock and no per-rule attribution.** |
| 6.3 Tilt / behavioural-degradation detection | frontier | ◐ | ○ | ◐ | ● | ● | ○ | ○ | ○ | Two real implementations, differently architected: EW's Tiltmeter (rolling recency-weighted discipline score, overlaid on equity curve, calendar and trade table — formula undisclosed) and TVz's deterministic detectors (revenge trade <30 min after a losing close; size ≥1.25× after losses; cold start). Everyone else claims it without a mechanism. |
| 6.4 Pre-market conviction capture | frontier | ◐ | ○ | ◐ | ◐ | ◐ | ○ | ○ | ● | **No vendor scores ●.** Where plans exist (EW, TVz, TS) conviction is either absent or a field the user must invent. TR captures conviction 1–3 per planned symbol and back-fills it onto the executed trade. |
| 6.5 Physiological inputs (sleep, readiness, energy) | frontier | ○ | ○ | ○ | ○ | ◐ | ○ | ○ | ● | TZ's file states the absence explicitly; TS's and TM's do too. TVz's *own worked example* for Day Plans is Sleep Score / Stress / Mood / Major Life Event — so the pattern is documented, but the schema is user-built and nothing ships typed. |
| 6.6 Correlation of psych inputs with performance | frontier | ○ | ○ | ○ | ◐ | ● | ○ | ○ | ○ | TVz is the only ● — any Day Plan field becomes a pivot dimension, so "win rate by sleep bucket" falls out for free. **TR collects the richest psych inputs in the category and joins none of them to outcomes.** The sharpest self-indictment in this matrix. |
| 6.7 Discipline scoring over time | differentiator | ◐ | ○ | ○ | ● | ◐ | ○ | ◐ | ◐ | EW is far ahead: Efficiency % (positive ÷ total rated comments), Tiltmeter, and **Edge Leak / True System Edge** which express indiscipline in dollars rather than percent. TR's Discipline % is honest (blanks excluded, n surfaced, filter-aware) but is a single aggregate with **no time series**, so it cannot show escalation. |
| 6.8 Streak / habit mechanics | vitamin | ● | ◐ | ○ | ◐ | ◐ | ○ | ● | ◐ | Classed vitamin on the evidence: gamification demos well, and the vendor leading with it (TM's Challenges) has 12 Trustpilot reviews in a decade. Most "streaks" here are outcome streaks, not habit streaks. The exception with real teeth is TZ's day-lock, which belongs to 6.2. |

### 7. Planning & pre-market

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 7.1 Watchlist / daily plan capture | differentiator | ◐ | ○ | ◐ | ● | ● | ○ | ◐ | ● | EW's Trading Plans and TVz's Trade/Day Plans are the two real implementations. TV and CL have **nothing** — verified across their full help centres. TS's watchlist exists only inside the Elite-tier replay simulator. |
| 7.2 Thesis and catalyst recorded before the trade | frontier | ◐ | ○ | ◐ | ◐ | ◐ | ○ | ○ | ● | Where a plan exists it carries free-text "strategy notes"; a typed catalyst taxonomy appears nowhere. TR: free-text thesis + a controlled 9-option catalyst that back-fills onto the filled trade. |
| 7.3 Multi-timeframe bias recorded pre-open | frontier | ○ | ○ | ○ | ○ | ◐ | ○ | ○ | ● | **Nobody has this.** TZ ships an "HTF bias" *chart indicator*, which is a drawing tool, not a recorded judgment. TR records direction + strength for Daily / 1H / 5m and writes all six onto the trade. |
| 7.4 Plan-vs-execution reconciliation | differentiator | ● | ○ | ◐ | ● | ● | ○ | ◐ | ◐ | EW's promote-on-fill / demote-to-missed is the cleanest primitive; TZ's SR-03 scores adherence and flags broken rules **with timestamps**; TVz's Plan Analysis splits win rate / avg win / avg loss / PF by condition-followed. TR derives `Origin` from plan membership but produces **no reconciliation report**. |
| 7.5 Idea-origin classification | frontier | ○ | ○ | ○ | ◐ | ◐ | ○ | ○ | ● | Unique to TR (`Watchlist` / `Callout` / `Intraday discovery`, auto-derived, deliberately orthogonal to `Process Followed?`). Honest caveat: its *value* is asserted from our own use, not evidenced by any market demand. |
| 7.6 Scanner / idea generation integrated | frontier | ◐ | ○ | ◐ | ○ | ● | ○ | ◐ | ◐ | Only TVz ships a real screener into the journal — and its own file flags "adjacent-market sprawl" as a weakness. For TR this is a peculiar case: the scanner and the journal already live in one repo and share no data. |
| 7.7 Missed-trade capture **[added]** | frontier | ○ | ○ | ○ | ● | ○ | ○ | ○ | ○ | **Exactly one implementation in the entire study** (EW's Missed Trades, a first-class object with reason tagging and its own analytics). Every fill-derived journal is structurally blind to the trades you didn't take. TR already computes the unmatched plan rows at upload and discards them. Added because it fits no existing row. |

### 8. Risk & money management

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 8.1 Per-trade risk (R) capture | table stakes | ● | ● | ◐ | ● | ● | ● | ● | ● | Everywhere it is manual, and everywhere it gates the interesting metrics — TV states plainly that trades without an initial risk are excluded from R reports. CL lets you drag the stop line **on the chart**, which is the best entry affordance found. |
| 8.2 Daily loss limits and monitoring | differentiator | ● | ○ | ◐ | ○ | ● | ○ | ● | ○ | TM's Challenges put this on the free tier. TV and EW — the two most analytically serious vendors — both ship nothing. |
| 8.3 Drawdown / trailing-drawdown tracking | table stakes | ● | ● | ◐ | ● | ● | ○ | ◐ | ○ | Account drawdown is table stakes; prop-style *trailing* drawdown is a different algorithm and only TZ and TVz implement it. TR has no drawdown of any kind. |
| 8.4 Prop-firm rule compliance | differentiator | ● | ○ | ◐ | ◐ | ● | ○ | ◐ | ○ | TVz is best in class (20 firms, 65 configs, all 4 drawdown algorithms, retroactive "would I have passed?", Challenge Mode). **A differentiator that has stopped differentiating** — both leaders include it at no extra charge, and the prop adjacency file rates the wedge a qualified no. |
| 8.5 Position-size calculator | vitamin | ○ | ○ | ◐ | ○ | ◐ | ○ | ◐ | ○ | Classed vitamin on the evidence: five of seven don't ship it, two vendor files record its absence explicitly, and no user complaint anywhere in the study asks for it. It is five lines of arithmetic available free in a hundred places. |
| 8.6 Risk-unit schedule over time | frontier | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | **Nobody else has it.** TV's file names the gap precisely: "risk is a static scalar per trade with no history." TR's `Calendar Config` applies Full R by latest effective date ≤ trade date, so raising the unit ($28 → $48) does not retroactively rescale history. Narrow, but a real correctness win for any R-native trader whose account grows. |
| 8.7 Exposure / correlation across open positions | differentiator | ● | ○ | ◐ | ○ | ● | ○ | ● | ○ | TZ's cross-account correlated-exposure view (total contracts per instrument across all funded accounts) is the one genuinely non-obvious multi-account feature in the study — copy-trading one setup across five accounts silently multiplies real risk by five. |
| 8.8 Prop-firm cost/payout accounting **[added]** | differentiator | ● | ○ | ○ | ○ | ◐ | ○ | ○ | ○ | TZ's PropFirm Sync links a bank account via Plaid and classifies eval fees, resets and payouts across 10 auto-detected firms — answering "am I net positive on this habit?", which no firm will answer honestly. Given away free at every tier. Added because it is cost accounting, not rule compliance. |

### 9. Playbooks, setups & rules engine

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 9.1 Named setups / strategies with definitions | table stakes | ● | ○ | ● | ● | ● | ● | ● | ◐ | **TV is the outlier — setups are modelled as flat tags, full stop**, and its own comparison page concedes the axis. TR's `Setup` is a six-option dropdown with no definition behind it. |
| 9.2 Playbook documents with criteria checklists | table stakes | ● | ○ | ◐ | ● | ● | ● | ◐ | ○ | CL's split into *market conditions / entry triggers / exit triggers* is the most opinionated version; EW measures **which individual rules generate profit**. This is the upgrade path from a Yes/No discipline bit to "which rule I skip costs me money". |
| 9.3 Automatic classification into setups | frontier | ● | ○ | ○ | ○ | ○ | ○ | ◐ | ○ | Exactly one shipped implementation (TZ's AT-02), and its most-cited outcome is ~200 trades mislabelled with no reliable undo. TVz's file states plainly it has no automatic setup classifier. |
| 9.4 Per-setup performance with meaningful sample | table stakes | ● | ◐ | ● | ● | ● | ● | ● | ◐ | CL's **Sample Sets with a published N≥25 norm** is the only implementation that couples the report to a sample-size discipline. TR's setupBreakdown double-counts comma-split setups, so segment totals can exceed the account total. |
| 9.5 Rule violations detected automatically | frontier | ● | ○ | ◐ | ○ | ● | ○ | ◐ | ○ | The gap between "I say I followed my process" and "the tape says I didn't". Only TZ (timestamped rule breaks in SR-03) and TVz (Losses Beyond Planned Stop ≥125%, Losers Took Extra Heat) close it. **EW — the discipline vendor — explicitly does not**: the trader still self-reports. |
| 9.6 Backtesting / manual replay to build a sample | differentiator | ● | ○ | ● | ◐ | ● | ○ | ◐ | ○ | The structural idea worth more than the replay UI: **TZ and TVz journal simulated trades into the same analytics engine as live ones**, so practice reps accrue into the same statistics. Even hand-entered paper trades through an existing pipeline captures most of that value. |

### 10. Simulation & counterfactuals

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 10.1 "What if I had exited differently" | differentiator | ◐ | ● | ● | ● | ● | ◐ | ◐ | ● | The most crowded analytic in the category. **TV's formulation is the best**: float the last exit group to its optimum, bounded by the prior execution, the session close, and *the risk actually taken* — explicitly rejecting the naive max-theoretical-P&L that everyone else's "missed profit" number reports. |
| 10.2 Partial-taking / scaling simulation | frontier | ○ | ○ | ● | ○ | ◐ | ○ | ◐ | ● | Only TS (Rolling Exit Analytics, per-tranche) and TR (8 preset ladders + a custom rule builder) do it properly. TR's is honest about its own optimism: any touched R level is assumed to fill exactly, and the residual is assumed to behave as the actual trade did. |
| 10.3 Fixed-bracket counterfactual vs. discretionary management | frontier | ◐ | ○ | ○ | ● | ◐ | ◐ | ○ | ● | Two implementations. EW's Trade Management graph (actual R vs. passive-set-and-forget R, plus an explicit "R lost/gained by managing" line) is driven by a **hand-ticked `OTP Hit` boolean**; TR's weekly `B`/`Δ` is derived from order-aware 1-minute bars, so it can express degree rather than a bit. CL's "losers always count −1.00R" is the same pessimistic convention, independently arrived at. |
| 10.4 Monte Carlo / sequence-risk simulation | differentiator | ○ | ○ | ○ | ● | ◐ | ◐ | ○ | ○ | EW is the only real one (configurable sims × trades → equity fan, streak-length distributions, **risk of ruin**). CL lists a "Performance Forecast" in its pricing matrix and never explains it anywhere in its docs. TR's simulation is entirely backward-looking. |
| 10.5 Optimal stop / target discovery from own data | frontier | ○ | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | **Nobody computes it; everybody has the data.** All the ◐s are manual sweeps or by-eye scatter plots. The unaddressed reason is overfitting: fitting a stop to 60 trades is how you learn last quarter by heart, and no vendor pairs the sweep with a significance guard. |

### 11. AI & automation

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 11.1 LLM summary of statistics | table stakes | ● | ○ | ● | ◐ | ● | ○ | ● | ○ | Universal among the live vendors as of 2026. TV — 200k signups, 15 years — has shipped **zero AI of any kind**, and we cannot yet tell whether that is disruption or evidence the feature doesn't drive retention. |
| 11.2 Conversational query over own history | table stakes | ● | ○ | ● | ○ | ● | ○ | ● | ○ | TVz shipped it in **May 2023**, a year before anyone else. The cheap correct version is not RAG: it is natural language → a structured filter over a typed trade table (TS's "Gap and Go, not Tuesdays, 10–11am"). EW refuses it publicly and on principle. |
| 11.3 Pattern detection beyond stated tags | frontier | ◐ | ○ | ◐ | ● | ● | ○ | ◐ | ○ | Two real ones out of seven, both under a year old. **TVz's AI Coach is the reference and is fully published**: 16 deterministic detectors, ranked by dollar impact, gated on a two-proportion z-test with n≥10, capped at four cards, diversity-enforced, with variant-scoped suppression that auto-expires. The LLM writes one paragraph and cannot invent findings. TZ markets this hardest and, per an independent report, does per-trade commentary rather than cross-history detection. |
| 11.4 Vision analysis of chart screenshots | frontier | ◐ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | **Absent from all eight columns.** TZ's AI draws annotations on command; TVz's AI Notes is documented as numeric-only and explicitly does not look at chart images. The one AI capability that maps onto artifacts these products already store, and nobody has built it. |
| 11.5 Coaching against the trader's stated plan and rules | frontier | ● | ○ | ◐ | ◐ | ◐ | ○ | ○ | ○ | The declared frontier of the AI wave. TZ's SR-03 is the only ● — and it **requires the user to have configured strategies with entry criteria, exit rules and risk parameters up front**, which is the dependency everyone underestimates. TVz coaches against *planned stop* rather than a full plan. |
| 11.6 Automatic tagging / setup classification | frontier | ● | ○ | ○ | ○ | ○ | ○ | ◐ | ◐ | See 9.3. TR's `Origin` + nine plan columns auto-fill is automatic classification on a different axis, done deterministically from a join rather than by a model — which is also why it cannot corrupt 200 rows. |
| 11.7 Generated periodic review documents | differentiator | ● | ○ | ○ | ● | ◐ | ○ | ● | ○ | The push model beats the chat box, and both non-chat vendors say so out loud. EW's Edge Finder runs **automatically every Sunday**; TZ's SR-03 fires when the last trade closes and feeds forward into tomorrow's prep. TR has no periodic review artifact at all. |

### 12. Reporting, sharing & social

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 12.1 Periodic review reports | table stakes | ● | ● | ◐ | ● | ● | ● | ● | ◐ | EW's weekly/monthly/session report cards with reflection prompts and lesson tracking is the reference. TR's calendar is a periodic *surface* with no review *artifact* — nothing to write, finish, or look back at. |
| 12.2 Shareable public trade links | table stakes | ● | ● | ● | ◐ | ● | ● | ● | ○ | CL leaves sharing unpaywalled as its acquisition loop. EW deliberately **removed** public profiles in Apr 2024. TR is worse than absent: every journal route is unauthenticated, so exposure is accidental rather than designed. |
| 12.3 Mentor / coach access with permissions | differentiator | ● | ● | ○ | ● | ◐ | ○ | ◐ | ○ | TZ's Mentor Mode gives real-time read access with inline feedback. TV's requires **both parties to pay**, which switches the network effect off by pricing — its realistic users are prop desks and educators, not peers. |
| 12.4 Team / group / firm dashboards | differentiator | ● | ● | ○ | ○ | ◐ | ○ | ● | ○ | **The survival strategy for a small team, not a feature.** TM runs a white-label back office for 50+ firms on the same ledger as its consumer app; TV's org tier (admin panel, group rollups, impersonation API, branded subdomain) is what keeps a 15-year-old product alive. CL's "Enterprise Pricing" link 404s. |
| 12.5 Community feed, leaderboards | vitamin | ● | ◐ | ○ | ○ | ○ | ○ | ◐ | ○ | Classed vitamin on strong evidence: TV's symbol-joined feed is the cleverest social design in the study (no follower graph needed) and there is **no public evidence it is alive** after 15 years; EW deleted its public profiles; TVz and TS never built one. The one vendor investing runs it out of an education business. |
| 12.6 Tax / accounting export | vitamin | ◐ | ◐ | ? | ◐ | ◐ | ? | ◐ | ◐ | Nobody ships a tax report; third-party software and a $5/mo niche tool own the job. Moot for TR regardless, since P&L is gross. |

### 13. Platform, UX & trust

| Feature | Class | TZ | TV | TS | EW | TVz | CL | TM | TR | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 13.1 Mobile app / mobile web quality | table stakes | ○ | ○ | ◐ | ○ | ◐ | ○ | ◐ | ○ | **Universally demanded, universally unsolved.** The best in category is a 2.9★ Play app after a flagship rebuild, a 2.7★ iOS app last updated Mar 2025, and a PWA. TZ publicly promised iOS + Android in **May 2024**. "No mobile" is a named churn reason for four of seven vendors. The bar is low. |
| 13.2 Offline capability | vitamin | ○ | ○ | ? | ○ | ○ | ○ | ◐ | ○ | Nobody has it, nobody asks for it, and the journaling moment happens at a desk. |
| 13.3 Speed with large trade histories | table stakes | ● | ◐ | ◐ | ◐ | ◐ | ? | ? | ○ | TZ warehouses analytics in BigQuery — the right architecture, visible in the fact that "300+ reports" is affordable. EW's own perf work clusters on >20k-trade journal load, i.e. client-side aggregation. **TR reads the full tab `A:CG` and scans O(rows) inside an edge isolate with a hard CPU limit; two 503-causing hotspots have already been engineered around.** |
| 13.4 Onboarding time to first insight | differentiator | ● | ◐ | ◐ | ○ | ○ | ● | ● | ○ | "Bounced off the interface in week one" is the most commonly cited churn reason in the study. The two most powerful products (EW, TVz) are the two worst here, and both have shipped explicit remedies (Simplified Standard Mode; Simple Mode + a searchable stats page). CL and TM win by being narrow and by starting free. |
| 13.5 Privacy posture, security claims, jurisdiction | table stakes | ◐ | ◐ | ? | ◐ | ● | ? | ● | ○ | TVz is the reference: per-AI-feature disclosure of whether data leaves, AI Query runs the generated query internally, AI Chat requires explicit opt-in. **TR has no authentication of any kind on any journal route, and the production spreadsheet ID is hardcoded into the client bundle.** |
| 13.6 API for the user's own data | differentiator | ○ | ● | ○ | ○ | ? | ○ | ● | ◐ | Retail demand for this is approximately zero; **both implementers use it as the B2B on-ramp** (TV's org impersonation API is why it can sell a firm tier at all; TM puts REST at the $19.95 tier deliberately). TR has 14 edge routes that are a de-facto public API because nothing authenticates them — capability by accident. |
| 13.7 Pricing transparency / free-tier generosity | differentiator | ○ | ◐ | ◐ | ◐ | ● | ○ | ● | ● | TM and TVz run real permanent free tiers; TV's (30 *grouped* trades/month) is the best-*designed* one — generous to a swing trader, useless to a scalper — but it is invisible on its own pricing page. **TZ has neither a free tier nor a trial in a category where value depends on an integration working**, which is the single most-cited structural objection against it. TR's ● is uninformative: there is no product to price. |
| 13.8 Data provenance / verified results **[added]** | frontier | ○ | ○ | ○ | ○ | ○ | ○ | ● | ○ | TM's Verified Trading Results: badges for *synced and unedited* vs. *manual/file-uploaded*, at account **and** trade level. Strategically it converts auto-sync into a trust primitive — and it is structurally hostile to our segment, since every DAS/Cobra/CenterPoint trader is permanently Unverified. Technically it is a provenance flag (`source == sync && !edited_since_import`). Added because it fits no existing row. |

---

## Table stakes we lack

**34 features classed table stakes have TR at ○ or ◐ — 20 fully absent, 14 partial.**
This is the honest list of what disqualifies our journal as a product today. Grouped by
the reason they are missing, because the reasons cluster hard.

**Absent (20).** The ingest and cost layer — 1.1 manual entry, 1.3 format breadth,
1.4 auto sync, 1.8 asset classes, 1.10 corporate actions, 2.4 overnight/multi-day
positions, 2.6 futures multipliers, **2.7 commissions and fees**. The visual layer —
**4.1 trade-annotated chart**. The journaling layer — 5.2 daily/session journal,
5.4 reflection templates, 5.5 rich media in notes. Risk — 8.3 drawdown.
Playbooks — 9.2 criteria checklists. AI — 11.1 LLM summary, 11.2 conversational query.
Social — 12.2 shareable trade links. Platform — 13.1 mobile, 13.3 speed at scale,
**13.5 authentication and privacy posture**.

**Partial (14).** 1.6 multi-account aggregation · 1.9 historical backfill (one upload =
one trading day) · 2.1 round-trip grouping (position flips are silently mis-grouped) ·
2.9 day/account-level separation · 3.5 tag analytics · 3.6 day-of-week and hold-duration
breakdowns · 3.8 drawdown/streaks (and streaks are computed in row order, not date order) ·
4.2 intraday chart granularity (bars fetched, never rendered) · 4.5 screenshot upload ·
5.3 tag analytics · 6.2 rule adherence (one self-graded bit) · 9.1 named setups ·
9.4 per-setup performance (comma-split setups double-count P&L) · 12.1 periodic reports.

**Three of these are not gaps but defects**, and should be read differently from the rest:
no authentication on any route (13.5), position flips mis-grouped (2.1), and comma-split
Setup/Catalyst double-counting P&L in breakdowns (9.4). A gap costs you a sale; a defect
costs you the numbers, and "the numbers are wrong and stay wrong" is the #1 churn driver
in the TraderSync file.

**Four have outsized leverage** because everything else in their section depends on them:
**2.7 commissions/fees** (gross-only P&L quietly invalidates every dollar figure we
compute, and makes 12.6 moot), **4.1 the chart** (its absence is what forces the
out-of-band screenshot ritual), **5.2 a daily journal object** (there is no closing
ritual, so the review loop where a journal's value is actually realised does not exist),
and **13.5 auth** (without it there is no per-user anything, which is why capture target,
theme and filters live in `localStorage`).

## Where we are already ahead

Rigorously: **five features where TR is ● and no vendor is**, plus two contested.

| Feature | Best vendor | Why we're ahead |
|---|---|---|
| **6.5 Physiological inputs** | TVz ◐ | Sleep Score, Readiness Score, hours slept, Energy, Tension, Urge-to-Trade-Fast as *typed* fields. TZ's file records the absence explicitly; TS's and TM's do too. TVz can express it, but the user must design the schema. |
| **6.4 Pre-market conviction capture** | TZ/TS/EW/TVz all ◐ | Conviction 1–3 per planned symbol, recorded before the open and back-filled onto the executed trade. No vendor scores ●. |
| **7.3 Multi-timeframe bias pre-open** | TVz ◐ | Daily / 1H / 5m direction + strength, six columns, recorded pre-open. TZ's "HTF bias" is a chart indicator, not a captured judgment. |
| **7.5 Idea-origin classification** | EW/TVz ◐ | `Watchlist` / `Callout` / `Intraday discovery`, auto-derived from plan membership and deliberately kept orthogonal to `Process Followed?`. |
| **8.6 Risk-unit schedule over time** | all ○ | Dated Full-R schedule applied by latest effective date ≤ trade date. TV's file names this exact gap: "risk is a static scalar per trade with no history." |

**Contested — real, but we are not alone.** *10.3 fixed-bracket counterfactual*: EW ships
the construct, but drives it from a hand-ticked `OTP Hit` bit, where ours is derived from
order-aware 1-minute bars and reported per calendar week. *10.2 partial-taking simulation*:
TS's Rolling Exit Analytics covers the same ground from the other direction.

**Not on this list, and worth saying why.** The **Prediction & Execution funnel** (excursion
measured from the open, normalised by a purpose-built `30mATR` and gap-free `ADR`) has no
counterpart anywhere in the study, but it is an *instance* of 3.13 rather than a taxonomy
row of its own — and 3.13 is a row where TV and TVz both beat us on breadth. The
**order-aware MFE** is a better *method* than anyone's on a row where five vendors also
score ●. And **4.6 screenshot auto-matching** is scored ● only because every vendor solved
the problem by rendering charts instead; it is a workaround, not a lead. The genuinely
distinct part is the entry-vs-EOD class distinction.

## Frontier — thin or absent everywhere

Where nearly every column is ○ or ◐. Ranked by how much of the category is missing.

**Nothing at all from anyone (all ○, or one lonely ●):**

- **11.4 Vision analysis of chart screenshots** — zero implementations. The one AI capability that maps onto artifacts every journal already stores.
- **7.3 Multi-timeframe bias pre-open**, **8.6 risk-unit schedule**, **7.7 missed-trade capture** (one: EW), **13.8 data provenance** (one: TM), **9.3 auto setup classification** (one: TZ, and it corrupted 200 trades).
- **10.5 Optimal stop/target discovery from own data** — every vendor has the data, none computes it. The honest reason is overfitting, and nobody pairs a sweep with a significance guard.

**Two implementations out of seven, both recent, differently architected:**

- **6.3 Tilt detection** — EW's rolling Tiltmeter (undisclosed formula) vs. TVz's deterministic detectors (revenge <30 min, size ≥1.25× after losses, cold start).
- **11.3 Pattern detection beyond tags** — TVz's published 16-detector suite vs. EW's Edge Finder. Everyone else claims it without a mechanism.
- **9.5 Automatic rule-violation detection** — TZ and TVz only. Note that **Edgewonk, the discipline vendor, explicitly does not**: the trader still self-reports.
- **10.3 Bracket counterfactual**, **10.2 partial simulation**.

**Ships, but only as a capability the user must configure themselves:**

- **6.6 Correlating psych inputs with performance** — TVz alone, and only because *any* Day Plan field becomes a pivot dimension. Nobody ships the join as a product.
- **7.2 Thesis and catalyst before the trade**, **7.6 scanner integrated with the journal**, **11.5 coaching against the stated plan** (TZ ships it, gated on the user having configured strategies up front).

## Universal table stakes

Every vendor scores ● on these ten. Building them wins nothing; omitting them loses.

| Feature | TR |
|---|---|
| 1.2 CSV / file import | ● |
| 1.6 Multi-account support | ◐ |
| 2.2 Scaling in/out, partial fills | ● |
| 2.3 Short handling | ● |
| 2.7 Commissions, fees, borrow | ○ |
| 3.1 P&L, win rate, expectancy, profit factor | ● |
| 3.5 Breakdown by setup / strategy / tag | ◐ |
| 3.6 Breakdown by time of day, day of week, duration | ◐ |
| 4.1 Trade-annotated price chart | ○ |
| 5.1 Free-text notes per trade | ● |

Two observations. First, **3.1 is free from every broker** — the broker-native survey
found every platform emits fills as CSV, IBKR's free portfolio analytics beat every
vendor's, and NinjaTrader ships free per-trade MAE/MFE and entry/exit efficiency. Any
journal whose pitch is "statistics computed from fills" is selling something the trader
already owns. Second, **4.1 is the one universal that TR scores ○ on**, and no vendor
built it themselves — TradingView's charting library renders four of them. It is a rent,
not a build.

## Category blind spots

Patterns visible only across the whole matrix.

**1. Everyone competes on the exit; nobody competes on the entry — and it is the same
blind spot as the missing pre-trade object.** Row 3.10 has five vendors with real,
differently-architected exit-quality implementations, and TraderSync's file calls it the
question "that actually separates profitable discretionary traders." Entry-quality
decomposition is absent from all eight columns. The reason is structural: exit quality is
computable from bars with no additional input, whereas entry quality requires knowing what
you *intended*, and section 7 shows nobody has an intent object. Tradervue's file states
it plainly — "the entire schema starts at 'a fill happened'"; adding planning "is not a
feature, it is a second data model plus a second UI surface." The broker-native survey
found the identical gap on the other side: brokers begin at the order ticket. **The
pre-trade half of the loop is unserved by the journals *and* by the platforms, and that
is why half the analytics in this category can only grade the exit.**

**2. Psychology is the most-marketed and least-built section in the matrix.** Every vendor
sells discipline in its headline copy. What they actually ship is one of three things:
free-text emotion tags (TV, TS, CL, TM), a schema the user must invent (EW's custom
statistics, TVz's Day Plans), or LLM tone-reading (TZ's Sentiment Agent). Rows 6.3, 6.5
and 6.6 are near-empty. The cause is that self-reported psych data collapses exactly when
it matters — reviewers say Edgewonk's tracking "requires self-honesty" and struggles when
the trader is stressed. Only two structural fixes to that exist anywhere in the study:
Edgewonk's — **pre-commit the moral valence of each behaviour while calm, then only
select at journaling time** — and pulling the number off an instrument before the P&L is
known, which is what our pre-market biometric block does. Both work by removing the
judgment from the moment of judgment. And note the further failure: TradesViz is the only
vendor that *joins* psych data to money at all (6.6), and it only manages it because Day
Plan fields happen to become pivot dimensions. Collecting psych inputs is not the hard
part; nobody has made them pay.

**3. Coverage numbers are inflated by roughly an order of magnitude, category-wide, and
the inflation is itself a churn engine.** TraderSync: 700–900 claimed, 495 listed, **73**
autosync — 31 of which are one MetaTrader adapter and ~15 one PropReports adapter.
Tradervue: "80+ integrations", **5** automated, one of them a third party's plugin.
TradeZella: "500+ brokers", ~**13** sync mechanisms. Trademetria publishes "hundreds",
"140" and "1500+" on three pages of one site; the real number is **21**. TradesViz: 641
SEO pages, 250 claimed, ~**70** real. Chartlog lists 21 live against a **110-item**
"Coming Soon" containing a bank dissolved in 2023. Users discover the truth *after* paying,
and every vendor file names it as a churn reason. Two consequences: the honest integration
matrix is a marketing weapon nobody has picked up, and the fan-out lesson (find the
aggregator-shaped source — MetaTrader, PropReports, SnapTrade, Rithmic — rather than
grinding out individual brokers) is worth more than any single connector.

**4. Statistical honesty is inversely correlated with commercial success.** The three
vendors that ship significance machinery are Tradervue (p-value on your edge, SQN,
K-Ratio, Kelly), Edgewonk (sample size baked *into* the headline score; a coin-flip
distribution that tells a paying customer their edge may be luck) and TradesViz
(two-proportion z-tests gating every comparison, n≥10 minimum). Those are, respectively,
a four-person team inside an EBITDA roll-up, a bootstrapped German shop with 44 Trustpilot
reviews, and a founder-led indie at roughly $1–2M ARR. The category leader ships a 0–100
composite with published weights and no significance handling whatsoever, and is plausibly
5–10× larger than any of them. This is not proof that honesty doesn't sell — but any plan
that leads with rigor should price that pattern in.

**5. Mobile is the category's collective failure, and the bar is on the floor.** Row 13.1
has no ● anywhere. Best in category is a 2.9★ Play app after a flagship rebuild, a 2.7★
iOS app last updated eighteen months ago, and a PWA from a one-person shop. Meanwhile "no
mobile app" is a named churn reason for four of seven vendors, and TradeZella's public
promise of iOS and Android is two years old. The cause is visible in the architecture:
these are chart-heavy JS web apps built on a rented TradingView dependency, which is
genuinely hostile to native. But the actual mobile job — log and reflect after the close,
check a plan before the open — needs almost none of that surface. **The only vendor that
shipped something that works chose a PWA, and it is the smallest team in the study.**

**6. The AI wave split into two publicly stated architectures in eighteen months, and the
deterministic camp produced the better artifact.** TradesViz and Edgewonk both attack the
chatbot approach by name — Edgewonk's argument being that traders don't know which
questions to ask, which is the actual failure mode of self-review. TradesViz then published
its entire mechanism: detector list, ranking formula, z-test gating, diversity pass,
variant-scoped suppression with auto-resurface, and the cache key. TradeZella published
none of its agents' mechanisms and shipped a data-corruption incident. Of sixteen flagship
AI features surveyed, four are specified well enough to evaluate and three of those four
are TradesViz's. The cost asymmetry matters more than the taste one: a detector suite is
aggregation plus a z-test and costs nothing to run; an LLM-per-trade product is metered by
credits or capped at 5–60 messages a day at every vendor that ships one, which tells you
the inference cost is not comfortably absorbed by a $30–80/mo subscription.

**7. The screenshot is a second-class citizen everywhere, because everyone solved review by
rendering charts instead.** Chartlog states the category's implicit position outright —
"Forget about screenshots" — and TradingView's library made it affordable for four vendors
to do so. TradesViz maintains an entire *second* chart pipeline of server-rendered PNGs
purely so drawings persist, which is the strongest evidence that annotated rasters and
interactive charts are genuinely different artifacts. The implication for us is
uncomfortable and worth stating: a Drive-indexed screenshot store reads as a differentiator
and is more accurately a symptom of 4.1. The one part that survives the critique is the
entry-vs-EOD distinction — "what I saw" against "what actually happened" — which no chart
renderer produces.

**8. Measuring inaction is a category-wide blind spot with exactly one implementation.**
Every fill-derived journal is structurally blind to the trade you didn't take, and
hesitation is a named failure mode in Edgewonk's own framing. Only Edgewonk built Missed
Trades as a first-class object. This is the cheapest unclaimed ground in the matrix for
anyone who already has a plan object — and for TapeReader specifically, the unmatched plan
rows are already computed at upload and thrown away.
