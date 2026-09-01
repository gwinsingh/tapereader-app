# Theme Teardown — UX & Information Architecture

**As-of: 2026-09-01** · Public sources only (no accounts created, no trials started, no
credentials entered) · Confidence tags per `00-method.md`: `[V]` verified on the vendor's
own site/docs · `[R]` reported by reviews/forums/third parties · `[I]` our inference.

**Scope note.** Other files in this research catalogue *features*. This file studies how the
products **feel to use** and **how they present information**. Two reasons it matters: feature
parity is worthless if the product is unusable, and our own output (dashboards, reports, the
`report/index.html` deliverable) has to be legible to a human — so the best presentation
patterns in this category are directly reusable.

**A caveat on sources.** This category has an unusually dense affiliate-review layer
(journalplus.co, traderssecondbrain.com, lunefi.com, journali.io, tradertrac.com, rizetrade.com
and similar). These sites publish scored comparison tables that consistently rank whichever
product they sell against. Their *descriptive* claims about UI are often accurate and
corroborated; their *scores and verdicts* are marketing. Everything sourced from that layer is
tagged `[R]` and, where it matters, corroborated against a vendor-first source or a
non-affiliate review (StockBrokers.com, Trustpilot, vendor help centers). Vendor help centers
and vendor onboarding courses turned out to be the single most useful source type — they
describe the real IA without the marketing gloss, and occasionally admit to problems the
marketing pages don't.

---

## 1. Information architecture per vendor

The pattern across all six: **every one of them lands you on a metrics dashboard, not on your
trades and not on a task.** Nobody lands you on "what should I do next." That is a shared blind
spot and is discussed in §3 and §6.

### TradeZella

**Top-level navigation** — left sidebar, four sections: **Tracking**, **Back Testing**,
**Mentor/Student Mode**, **Zella University**. `[V]` (help.tradezella.com, Getting Started)

**Default landing view:** the **Dashboard**, described by the vendor as "your home base for
everything in TradeZella." `[V]`

The Dashboard is split into two bands `[V]`:

- **Upper band — performance snapshot tiles.** Net P&L · Account Balance & P&L · Trade Win % ·
  Profit Factor · Day Win % · Avg Win/Loss Trade · Trade Expectancy · Current Day Streak ·
  Current Trade Streak · Current Streak · Max Drawdown · Average Drawdown.
- **Lower band — widget grid (user-arrangeable).** Zella Score · Daily Net Cumulative P&L ·
  Win % – Avg Win – Avg Loss · Trade Time Performance · Trade Duration Performance · Net Daily
  P&L · Daily & Cumulative Net P&L · Recent Trades & Open Positions · Calendar · Account
  Balance · Drawdown · Challenge · Calendar Mini · Advanced Calendar · Progress Tracker ·
  Report · Yearly Calendar.

A single **View** control re-denominates the entire dashboard: **Dollars (default)**,
Percentage, Privacy, **R-Multiple**, Ticks, Pips, Points. `[V]` This is the single best IA idea
in the vendor set and is discussed in §4.

Reports live under **Reports → Recaps & Insights** and **Reports → Date & Time**; the latter has
four tabs (Days, Month, Trade Time, Trade Duration) each with a summary line, a customisable
chart taking up to three plotted metrics, a sortable summary table, and a "Cross Analysis"
secondary filter. `[V]` There is also a **Notebook** (free-form notes with user-defined
templates, e.g. a Pre-Market Game Plan) and a **Playbook** (named strategies with per-setup
stats). `[V]`

**What the default reveals:** TradeZella believes the headline is *a graded scorecard of you as
a trader* — the Zella Score, a 0–100 composite of Profit Factor 25%, Avg Win/Loss Ratio 20%,
Max Drawdown 20%, Trade Win % 15%, Recovery Factor 10%, Consistency Score 10%. `[V]` It is a
gamified self-assessment product first and an analysis product second.

### TraderSync

**Top-level sections** (derived from the vendor's own support-guide taxonomy, which is the best
public proxy for the nav): Dashboard · Journal · Reports · Insights · Calendar · Charts ·
Setups · Mistakes · Backtester · Evaluator · Market Replay · Assistant (Cypher AI) · Portfolio ·
Sharing · Import Trades · Settings. `[V]` (tradersync.com/support categories)

**Default landing view:** a customisable **Dashboard**, "over 20 widgets," `[V]` presenting
trades with days colour-coded win/loss so patterns read at a glance. `[R]` (StockBrokers.com)

Distinctive IA choices `[V]` (tradersync.com/features):

- **Mistakes** and **Setups** are *first-class objects with their own sections*, not tags buried
  in a trade record. Rule-adherence reporting is framed under a "DISCIPLINE" heading.
- **Sharing** is a whole section: public profile, mentor access, and *selective* sharing (hide
  your returns, hide your notes) — built for the coaching relationship.
- The vendor explicitly positions the web app as responsive rather than desktop-only: "The only
  trading journal fully optimized to work on any device." `[V]`

**What the default reveals:** TraderSync believes the headline is *your trades, coloured by
outcome, with a customisable stat surround* — and that the second-most-important thing is
whether you followed your rules. It is a discipline/coaching product.

### Tradervue

**Top-level sections:** Dashboard · Trades · Reports · Analytics · Calendar · Journal · Filters.
`[V]` (tradervue.com)

**Default landing view:** the Dashboard. A non-affiliate reviewer's description of what a new
user meets immediately after importing: **"a wall full of charts and data,"** and "At first
glance, the dashboard felt a little overwhelming." `[R]` (StockBrokers.com, 2026)

The **Reports** section is the deepest and most systematically organised in the category `[V]`:

- **Report groups:** Overview (Recent / Year-Month-Day / Calendar) · Days & Times · Price &
  Volume · Instrument · Market Behavior · Win/Loss/Expectation · Liquidity · Tag Reports ·
  Advanced Trade · Advanced Trend · Risk Reporting · Drawdown · TR/ATR · SQN · Day Type.
- **Every report group is viewable through three tabs — Detailed, Win vs Loss Days, and
  Compare.** `[V]` The Compare tab is the most interesting structure in the category; see §4.
- Every chart has an **aggregate vs. average** mode toggle, so "total P&L by hour" and "average
  P&L per trade by hour" are the same chart with a switch. `[V]`

**What the default reveals:** Tradervue believes the headline is *the full report battery*. It
is a reporting engine with a journal attached — the oldest IA in the set and the one that most
obviously predates modern dashboard design. Multiple reviewers describe full-page reloads on
navigation and non-obvious destructive actions ("I tried deleting some trade data by clicking
the garbage can icon, but nothing happened"). `[R]` (StockBrokers.com; corroborated by several
affiliate reviews describing a "2013" feel and multi-click navigation.)

### TradesViz

**Top-level sections:** a left sidebar grouped into **Tables**, **Calendars**, **Summary**,
**Charts**, plus **Notes**, **Custom Dashboard**, and **AI Q&A**. `[V]`
(tradesviz.com/blog/getting-started-with-tradesviz)

Within that: three "Explore" surfaces — **Trade Explore**, **Day Explore**, **Chart Explore** —
which are the drill-down destinations from anything clickable. `[V]`

Chart taxonomy, nine groups `[V]` (tradesviz.com/blog/charts-statistics-reference): Overview &
Date · Trades Analysis · Performance Metrics · Options Analysis · Technical Analysis
(correlations vs ATR/ADX/RSI/MFI/CCI/TSI) · Symbols/Sectors/Industries · Activity · Tags
Analysis · Distribution & Drawdown.

**Default landing view:** the **Overview dashboard**. Advertised scale: **600+ statistics and
widgets**, "70+ interactive charts," "50+ numeric and 30+ categorical stats" in the pivot grid,
a drag-and-drop custom dashboard builder, and unlimited saved custom dashboards. `[V]`

**What the default reveals:** TradesViz believes the headline is *everything, and you decide
what matters*. It is a BI tool for your trades. Its defining IA principle is stated in its own
mobile release notes and is genuinely good: **"A chart should help you find something worth
reviewing. It should not be a dead end."** `[V]` — every chart value is clickable and filters
the trade list to the matching records.

### Edgewonk

**Top-level tabs:** **Home** · **Journal** · **Chart Lab** · **Trade Analytics** · **Reports**,
plus **Edge Finder**, **Trading Psychology Lab**, **Sessions**, and a checklist system. `[V]`
(edgewonk.com/features; edgewonk.com/blog/edgewonk-review-guide)

**Default landing view:** **Home**, described as "the top five widget boxes" — a deliberately
small set of average-P&L-style metrics with filters, rather than a wall. `[V]` This is the most
restrained default in the set after Chartlog.

Distinctive: the **Journal** tab carries a **Tiltmeter column** *inline in the trade list* — a
per-trade red/green indicator of how closely you followed your plan, sitting in the same table
as P&L. `[V]` Discipline is not a separate report; it is a column next to the money.

**What the default reveals:** Edgewonk believes the headline is *are you following your rules*.
It is the only vendor that puts a behavioural metric in the primary trade table rather than in a
report. Its stated review workflow is also ordered by that belief: (1) Rule Adherence, (2)
Strategy Performance, (3) Risk Management, (4) Trade Management & Exits. `[V]`

### Chartlog

⚠️ **Identity warning.** `chartlog.com` and `chartlog.ai` are **different products** and should
not be conflated. `chartlog.com` is Chartlog, Inc. (founded 2019, Adrian Campos & Igor
Milivojevic), a US-equity journal with Dashboard/Journal/Insights/Strategies/Charts/Market Data
and DAS Trader Pro / IBKR / thinkorswim / Webull integrations `[V]`. `chartlog.ai` is a
differently-structured AI-coach product (Dashboard/History/AI Coach/Heatmap/Trading, euro
currency, "Discipline score," Claude-powered coach) `[V]` with no public evidence linking it to
Chartlog, Inc. `[I]` Several 2026 comparison articles appear to blend the two. Treat any
"Chartlog has an AI coach" claim as unverified.

For chartlog.com:

**Top-level sections:** **Dashboard** · **Trades** (with three sub-views: **Journal**,
**Table**, **Calendar**) · **Strategies** · **Insights** · **Charts** · **Market Data**;
strategies are managed under a **Library** tab and custom reports under **Analytics**. `[V]`
(chartlog.com; chartlog.com/course/find-your-way-around-chartlog)

**Default landing view — the most precisely documented default in this research, from the
vendor's own orientation course** `[V]`:

> The Dashboard shows the most important overall stats **for the current month**. For each
> trading day, profit/loss is a **bar chart**. Below that: **win rate, profit factor, number of
> trades, and total quantity traded**. Further down: **recent trading days with key figures**.
> **Upper right: a calendar with green or red dots under each date.** Month is switched from
> the top-left corner.

That is roughly a dozen numbers on the landing page, month-scoped, versus TradeZella's
twelve-tile band plus seventeen-widget grid and TradesViz's 600-widget library. **Chartlog's
default is an order of magnitude smaller than the category's, and that is the whole point of
it.** `[I]`

**What the default reveals:** Chartlog believes the headline is *this month, at a glance, then
go look at the trades.* It treats the dashboard as a launch pad, and says so: "Use the Dashboard
as a starting point to get an overview before diving deeper!" `[V]`

---

## 2. Onboarding

### The shape of the funnel

Every vendor's onboarding has the same three gates, and the drop-off is concentrated in gate 2:

1. **Account + intent** (seconds to a minute)
2. **Get data in** — broker connect or CSV export/import (**the killer**)
3. **First meaningful insight** — which for most vendors is just "the dashboard now has numbers"

Gate 2 is where the category loses people. The most quantified public claim: *"Most US traders
lose 30–60 minutes the first time they try to export from their broker — menus move, column
names don't match, and dates import as text."* `[R]` (traderssecondbrain.com — affiliate layer,
but the failure modes it names are corroborated everywhere.) The specific IBKR failure is
consistently reported and is worth knowing because it is a design lesson: users download the
*Activity Statement* (a human-readable report with merged cells, summary rows, inconsistent
column names) instead of a Flex Query, and the parser chokes. `[R]`

### Step counts and time, by vendor

| Vendor | Onboarding shape | Evidence |
|---|---|---|
| **TradeZella** | Playful profile step (pick a trader "mode" — Newbie / Ninja Level / Monk Mode), then **Add Trade → Add New Account → select broker → auto-sync or file upload**, then a nudged 4-step setup: (1) import, (2) explore dashboard, (3) **set up Tags & Strategies**, (4) establish a daily workflow with pre-market templates and the Progress Tracker. Vendor says tags and strategies "are two of the most impactful things" to configure early. | `[V]` help.tradezella.com; `[R]` StockBrokers.com for the mode step and for spreadsheet upload "required multiple attempts in testing" |
| **TraderSync** | The best-reviewed onboarding in the set. Broker-specific tailored instructions, proactive warnings about brokers whose integration is currently broken, a **demo portfolio** to explore without connecting real accounts, and an onboarding checklist described as "a low-pressure way to get familiar with the tools." 900+ broker integrations. Criticism: manual uploads are "slow and time-consuming" and the trading-plan builder was "a little tricky to figure out." | `[R]` StockBrokers.com; `[V]` tradersync.com |
| **Tradervue** | Prominent green **Import** button; per-broker step-by-step instructions; 80+ brokers but several (e.g. Robinhood) require a manual spreadsheet download — "a little annoying." Free tier caps at **30 grouped trades/month, stocks & ETFs only**, which is a real onboarding constraint: an active day trader exhausts it in a session or two. | `[R]` StockBrokers.com; `[V]` app.tradervue.com/help/quota |
| **TradesViz** | Vendor's own getting-started guide is **10 sections, "approximately 30 minutes."** Step 6 is explicitly *"focus on 5–6 essential charts rather than all 200+ available"* — the vendor telling new users to ignore most of the product. | `[V]` tradesviz.com/blog/getting-started-with-tradesviz |
| **Edgewonk** | The heaviest setup burden. No broker auto-sync — manual entry or CSV with column mapping. Worse, the *signature* features don't work until you configure them: the Tiltmeter is inert until you have authored entry/exit/management **comments** in settings and rated each one positive/negative/neutral. So the flagship metric has a prerequisite the user must invent from scratch. Reported as "feels like homework"; a real time cost above ~30 trades/week. | `[V]` edgewonk.zendesk.com (Tiltmeter prerequisites); `[R]` multiple 2026 reviews |
| **Chartlog** | Narrowest but shortest. Import is chapter 2 of an 8-chapter course; DAS Trader Pro export is six clicks, documented literally. Live chat "usually answer within minutes." The narrow broker list (~10 US equity/options brokers) is a conversion filter, not a friction point — you either match or you bounce. | `[V]` chartlog.com/course/import-your-trades |

### Where people get stuck — the pattern

`[I]` Three distinct stalls, and they need different fixes:

1. **The export stall.** The user never gets a file the parser accepts. Fixed by broker-specific
   instructions *with screenshots of the current UI*, and by naming the exact export type
   (Flex Query, not Activity Statement). TraderSync's proactive "this broker's integration is
   currently broken" notice is the single classiest touch found in this research — it converts
   a silent failure into an expected one.
2. **The blank-dashboard stall.** Data is in, but 12 trades produce a dashboard of noise, so the
   user concludes the product is useless. Only TradesViz addresses this directly (see §6).
3. **The configuration stall** (Edgewonk-specific, but TradeZella's tags/strategies step and
   TraderSync's plan builder share it). The product's best feature requires the user to author a
   taxonomy before they have any idea what their taxonomy should be. **Asking a new user to
   define their own mistake categories on day one is asking them to have already done the
   analysis the product is supposed to do for them.** The fix is shipping a good default
   taxonomy that the user edits later, not an empty one they must fill first.

---

## 3. The density problem

### The evidence

**TradesViz is the maximalist pole.** 600+ statistics/widgets, 70+ interactive charts, nine
chart families, a drag-and-drop dashboard builder, unlimited saved dashboards, AI-generated
widgets. `[V]`

The most useful evidence is that **the vendor admits the problem in its own documentation**:

> "With hundreds of charts and 600+ statistics, it can be hard for new users to know exactly
> where a chart lives." `[V]` (tradesviz.com/blog/charts-statistics-reference — the page exists
> specifically to provide a searchable index of the product's own charts)

And in the getting-started guide, step 6 is to *focus on 5–6 essential charts rather than all
200+ available.* `[V]` **When a product ships a search engine for its own UI and tells new users
to ignore 97% of it, the density is a defect, not a feature.** `[I]`

Real user comments, both directions (Trustpilot, tradesviz.com profile) `[R]`:

- 3★ "require[s] learning curve to understand all data" (NQ trader, Nov 28)
- 5★ but critical: wished for "more guides or walkthroughs for the advanced features" (Emil, Sep 19)
- 5★ backhanded: "TradesViz is a journal with capabilities beyond… 90% of traders want" (Bruce Johnstone, Dec 17)
- Counter-evidence, and it is real: "Simple and straightforward UI for new and experienced traders" (Joan, 5★, Apr 12); "UI is clean, polished, always improving" (Denise, 5★, Mar 20); "Easey to use dashboard" (Susan, 5★, Jun 11). Several reviewers note the UI was **redesigned** and now "feels more polished and modern without overwhelming." `[R]`

The sharpest formulation of the cost, from a 2026 review `[R]`:

> "Menus, widgets, and charts sit close together, so first sessions can feel more like software
> onboarding than trade review."

**Tradervue sits in the middle** and gets the same complaint from a different cause — not widget
count but report count and dated interaction: "a wall full of charts and data," "At first
glance, the dashboard felt a little overwhelming." `[R]`

**Chartlog is the minimalist pole**, and is consistently described as "one of the cleanest
analytics platforms on the market, with a surprisingly simple interface" and "a gentle learning
curve." `[R]` But note the honest contradiction: at least one comparison calls Chartlog's UI
"dated and non-intuitive relative to TradeZella." `[R]` **Clean and modern are different axes.**
Chartlog is low-density; TradeZella is high-polish. They are praised for different things and a
reviewer optimising for visual modernity will rate Chartlog poorly. `[I]`

And the crucial nuance: **even Chartlog's own course concedes density where density is
unavoidable** — of the trade Details panel, "The sheer number of fields and the amount of data
here can look a bit overwhelming in the beginning." `[V]` The vendor's response is not to remove
fields but to *narrate* them, splitting them into "automatically calculated" vs. "you fill this
in," and then telling the user which two to care about first ("For this course, we will focus on
Strategies and Custom Fields to get you started!"). `[V]`

### The actual lesson

`[I]` The tradeoff is **not** "fewer metrics good, more metrics bad." Both poles have satisfied
users, and TradesViz's depth is genuinely its moat with power users. The real findings:

1. **Density is a cost paid at a specific moment: session one.** Every negative density comment
   in this research is about the *first* sessions. Nobody complains that a product they have
   used for six months has too many charts. So the fix is not deletion, it is **staged
   revelation** — a small, opinionated default with the depth reachable but not presented.
2. **Customisability is not a defence against density; it is often the cause.** TradesViz,
   TradeZella and TraderSync all let you build your dashboard. That pushes an information-design
   decision the vendor is better equipped to make onto a user who has no basis to make it. A
   drag-and-drop builder is a great *second* experience and a poor *first* one.
3. **Discoverability is the real failure mode, not count.** "It can be hard to know where a
   chart lives" is a wayfinding problem. TradesViz's own mitigations are the right ones: a
   searchable chart index, and making every chart a clickable filter so charts form a navigation
   graph rather than 600 dead ends.
4. **The strongest antidote found is narration, not subtraction.** Chartlog's course tells you
   what to look at and in what order; Edgewonk publishes a four-step review sequence (rules →
   strategy → risk → exits). A dense screen with a stated reading order is far more usable than
   a sparse screen with none.
5. **For our own output:** land on ≤ ~10 numbers with an explicit reading order, make every one
   of them a link into the detail that produced it, and put the long tail behind search rather
   than behind a menu. `[I]`

---

## 4. How dense trading statistics get presented well

Patterns below are described precisely enough to implement. Ranked roughly by how much we
should want them.

### 4.1 The unit toggle — one control re-denominates the entire dashboard ★ best idea found

**Vendor:** TradeZella. `[V]`

A single **View** control in the dashboard header switches every monetary figure on the page
between **Dollars (default) · Percentage · R-Multiple · Ticks · Pips · Points · Privacy**.
Privacy blanks or masks absolute figures (for screenshots and screen-shares) while leaving
ratios and shapes intact.

Why it works: traders argue about which unit is "correct" (dollars anchor to lifestyle, R
normalises for sizing, percent normalises for account growth) and the honest answer is that you
need all of them at different moments. Rather than picking one or showing three side by side,
the whole page becomes a function of one variable.

**Implementation:** store every stat as a raw value plus a unit-class (currency / ratio / count
/ R). One page-level unit selector maps currency-class values through a per-trade divisor (R for
that trade's risk, tick value for that instrument, account equity for percent). Persist the
choice. Tradervue does a weaker version of the same thing (dollars / risk / ticks on reports).
`[V]` **Note we already have most of the machinery for this** — the calendar's R (Standard) /
Realized R / $ toggle is exactly this pattern applied to one component; the missing step is
promoting it to a page-level control that governs every stat. `[I]`

### 4.2 The aggregate-vs-average switch on every chart

**Vendor:** Tradervue. `[V]`

Every report chart carries a mode toggle: **aggregate** (total P&L for the bucket) vs.
**average** (mean per-trade P&L for the bucket). Same axes, same bars, different question.

Why it works: aggregate charts are dominated by trade count, so "10am is my best hour" usually
just means "I trade most at 10am." The average mode answers the actually-useful question — is
this hour *better*, per trade — and putting them one click apart makes the confound visible
instead of hidden. **The single cheapest honesty upgrade in this entire document.** `[I]`

### 4.3 Comparison as a first-class report *mode*, not a separate report

**Vendor:** Tradervue's **Compare** tab. `[V]`

Every report group has three tabs — **Detailed**, **Win vs Loss Days**, **Compare**. On Compare
you pick two cohorts and the *same* chart renders both series overlaid, winners in blue and
losers in yellow. Prebuilt cohort pairs: winning vs losing trades · long vs short · intraday vs
multiday · year-over-year · month-over-month; plus custom cohorts by tag, side, duration, P&L
sign, date range, symbol.

Why it works: it turns *every* chart in the product into a comparison chart without authoring a
single extra chart. The insight it is designed to produce is stated in the vendor's own example:
two-thirds of trades win, but the average loss is nearly double the average win — so loss
management, not hit rate, is the lever.

**Implementation:** make the cohort a parameter of the chart component, not a property of the
page. Any filter expression that can produce a trade set can be cohort A or cohort B; the chart
renders `n` series instead of one. Fix the colour mapping globally (cohort A / cohort B) so the
legend is learned once.

### 4.4 "You vs. your own past" — framed as *delta*, not as a second line

**Vendors:** Edgewonk (Edge Finder), TradeZella (Recaps), Chartlog (month switcher). `[V]`/`[R]`

Three distinct framings observed, in increasing order of quality:

- **Weakest — the month switcher.** Chartlog scopes the dashboard to the current month with a
  top-left month control; you compare by flipping back and forth and remembering. `[V]` Honest
  and cheap, but the comparison happens in the user's head.
- **Middle — the periodic digest.** Edgewonk emails a summary every Monday and on the 1st:
  best-performing setup, most profitable day, **shifts in your win rate**, and how efficiently
  you followed your plan. `[R]` The comparison is done for you but arrives out-of-product.
- **Strongest — the delta metric in the dashboard.** Edge Finder surfaces **"Winrate metrics
  with weekly changes"** and, more interestingly, **"Total Edge Leak"** (P&L lost to rule
  breaks) and **"True System Edge"** (what the strategy makes with rule-break trades removed).
  `[V]`

**Total Edge Leak / True System Edge is the pattern worth stealing** and it is not a chart, it
is a framing: compute the same P&L twice, once over all trades and once over only the
rule-compliant subset, and present the *difference* as a named quantity with a dollar sign on
it. It converts "discipline" from a virtue into a line item. `[I]` **We can compute this today**
— `Process Followed? = Yes` is exactly the compliant subset, and our Discipline % already has
the denominator. The missing piece is the counterfactual P&L and the naming.

Our existing **execution-gap counterfactual** in the calendar (actual vs. a set-and-forget
bracket, weekly `Δ`) is the same species of idea and is, as far as this research found, **not
done by any vendor in the set.** `[I]`

### 4.5 R-multiple distribution as a binned histogram with a loss tail called out

**Vendors:** Edgewonk R-Distribution; TradesViz distribution charts. `[V]`/`[R]`

Edgewonk's R-Distribution: **x-axis = R-multiple intervals (bins), y-axis = count of trades in
each bin.** `[R]` Edgewonk's related **Risk Distribution** histogram groups results into
intervals and **colours the bars red where losses are outsized**, so the left tail is visually
flagged rather than left to be read off the axis. `[V]`

Why it works: expectancy is a single number that hides its own shape. A 0.3R expectancy built
from many small wins and a few −4R disasters is a different business from one built on a
symmetric spread, and the histogram is the only view where that difference is instant.

**Implementation:** fixed bins of 0.5R from −3R to +6R with a signed overflow bucket at each end
(labelled "≤ −3R" and "≥ +6R" — never silently clip). Bars neutral in the ±1R band, warm/red for
bins below −1R, cool/green above +1R. Overlay a vertical rule at 0 and a second at mean R.
Annotate the two overflow buckets with their trade counts, because those are the trades that
decide the year.

### 4.6 The annotated trade chart with excursion geometry

**Vendor:** TradesViz Trade Explore. `[V]` This is the most complete trade-chart spec found.

Two-column layout. Left column: stacked stats sections. Right column: an interactive price chart
where **each individual execution is plotted at its exact price (y) and time (x)** — not one
entry marker and one exit marker, but every fill. Drawn on the same chart:

- open and close markers
- **MFE and MAE lines** (horizontal rules at max favourable / max adverse excursion)
- **stop-loss and profit-target lines**
- **a marker for the best possible exit of the trade**

Below the chart, collapsible sections in order: notes & tags · multi-timeframe exit analysis ·
execution table (sortable/filterable) · uploaded images with annotation tools · static and
interactive charts · realized and running P&L · **"similar trades"** recommendations. Every
section has a collapse arrow, **and the collapsed/expanded state persists across sessions.**
Arrows at the top step to the previous/next trade without leaving the view.

Why it works: the four extra lines (MFE, MAE, stop, target) turn a picture of what happened into
a picture of *what was available* — the gap between the best-exit marker and your actual exit is
the trade-management lesson, rendered as a distance on screen.

Three specific details worth copying verbatim `[I]`:
- **Per-execution markers, not per-trade.** Scaling in and out is invisible with two markers.
- **Persisted collapse state.** The user curates their own layout once, by use, without a
  settings screen. This is a far better answer to density than a dashboard builder.
- **Prev/next trade arrows in the detail view.** Reviewing 40 trades should not require 40 round
  trips through a list.

TraderSync does the lighter version — targets and stops auto-charted on every trade, screenshot
upload for platform context — and Chartlog renders every trade on a **full TradingView chart**
with entries/exits marked, drawable and saveable as a template. `[V]`/`[R]`

### 4.7 The running-P&L strip under the price chart

**Vendors:** TradesViz, TradeZella. `[V]`

Directly beneath the price chart, a second time-aligned panel: **x-axis shared with the chart
above, y-axis = P&L of the open position**, sampled every 5 seconds to 1 minute depending on
trade duration. Peaks and troughs on this curve *are* MFE and MAE in money terms.

Why it works: the price chart shows the market; this shows the position. Sharing the x-axis lets
the eye connect "the market did this" to "I was down this much" without arithmetic. TradesViz
extends the same idea to the day level — a day-long realized-P&L chart where each bar is one
execution's realized P&L with a cumulative line overlaid. `[V]`

### 4.8 Calendar heatmap — the converged design, and the one differentiator

The category has converged on a near-identical monthly P&L calendar `[V]`/`[R]`:

- Month grid, one cell per day, **green for winning days, red for losing days**, shade intensity
  scaled to magnitude.
- **Distinct colours for flat and no-trade days.** Tradervue is explicit and correct here: green
  win, red loss, **blue flat, grey no-trade.** `[V]` Grey ≠ red matters; a day you didn't trade
  is not a bad day, and most implementations get this wrong by leaving both blank.
- **Weekly totals in a right-hand column**, one per row. `[R]`
- **A summary bar above the grid**: total P&L, best day, worst day, most active day, win rate,
  green vs red day counts. `[R]`
- **Clicking a day navigates to that day's journal/trade list** — the calendar is a navigation
  control, not a picture. Tradervue, TradesViz and Chartlog all do this. `[V]`
- **A year view of tiny month grids** for zoom-out (TradeZella "Yearly Calendar," TradesViz year
  view with clickable small cells). `[V]`
- Chartlog's compact variant: the dashboard's upper-right calendar uses a **coloured dot under
  each date** rather than a filled cell — the same information at a fraction of the visual
  weight, suitable for a corner of a dashboard rather than a page of its own. `[V]`

**Our week column already carries something none of them have** — the bracket counterfactual and
`Δ`. That is the differentiator; the rest is table stakes. `[I]`

### 4.9 Multi-account equity curves — scope switching, not overlays

**Vendors:** TradesViz prop-firm dashboard; several others. `[V]`/`[R]`

Nobody overlays N account curves on one axis. The converged pattern is an **account scope
selector** with an explicit "All Accounts" aggregate option, where *every* view on the page —
equity curve, calendar, win rate, profit factor, expectancy, reports — respects the selection.
`[R]` Same principle as the unit toggle in §4.1: one control, whole page.

The genuinely well-designed multi-account view is TradesViz's compliance dashboard `[V]`:

- **Row 1 — aggregate tiles:** total accounts · active · passed · failed · combined P&L.
- **Row 2 — one card per account:** firm, account size, status badge (ACTIVE / PASSED / FAILED,
  with the failure reason printed when failed), current balance, a **drawdown-buffer progress
  bar** and a **profit-target progress bar**.
- **Row 3 — a sortable, filterable, column-customisable table** of the same accounts with the
  full metric set, CSV export.
- The drawdown buffer is a **three-band gauge**: green > 50% buffer remaining, yellow 25–50%,
  red < 25%, with the max allowable drawdown, the drawdown calculation method, and the current
  trailing floor printed underneath.

**The reusable pattern is aggregate → cards → table**: one glance, one scan, one drill. And the
gauge's supporting text is the detail to copy — it prints *the method* alongside the number, so
the user can tell whether "buffer" means trailing or static. `[I]`

### 4.10 Discipline as a table column, not a report

**Vendor:** Edgewonk Tiltmeter. `[V]`

A per-trade red/green indicator of plan adherence rendered **as a column in the main trade list,
adjacent to P&L.** Red = frequent rule violations, green = adherence.

Why it works: it puts the behavioural variable in the same visual scan as the money, so the
correlation is noticed passively rather than discovered by opening a report nobody opens.

The cost, already noted in §2: it does nothing until the user has authored and rated their own
comment taxonomy. **Steal the placement, not the setup burden** — our `Process Followed?` is
already a Yes/No that can render as a column glyph on day one with zero configuration. `[I]`

### 4.11 The weighted composite score — with a warning

**Vendor:** TradeZella Zella Score. `[V]` 0–100 from Profit Factor 25% · Avg Win/Loss 20% · Max
Drawdown 20% · Trade Win % 15% · Recovery Factor 10% · Consistency 10%; each sub-metric
normalised 0–100 against its own thresholds, then weighted.

It is the most-cited feature of the most-successful product in the category, so the demand is
real: **traders want one number that says whether they are good.** `[R]`

But `[I]`: it is six correlated metrics collapsed into one, with weights the vendor chose and
does not justify, computed on whatever sample the user happens to have. On 12 trades it is
noise with two significant figures. If we do anything like this, the honest version shows the
component breakdown by default (the composite is the summary, not the headline) and refuses to
render at all below a stated sample size. See §6.

### 4.12 Plain-language findings as cards

**Vendor:** Edgewonk Edge Finder. `[V]`

A weekly automated pass over the full trade history that outputs **cards, each pairing a metric
with a sentence**: winrate with its weekly change and the break-even ratio; strongest hours;
Total Edge Leak; the comment most associated with losing trades; True System Edge; return-to-
drawdown; discipline efficiency; reward-to-risk. Findings are stated in clear language rather
than left as chart-reading exercises.

**Implementation:** each card = one claim sentence + the number that supports it + a link to the
filtered view that proves it. Generate them from a fixed rule set (not free text) so every card
is reproducible and auditable. The link is what stops it being horoscope output. `[I]`

---

## 5. Mobile

### Who actually has a native app

| Vendor | Native apps | Evidence |
|---|---|---|
| **TradesViz** | **Yes — iOS + Android, actively developed.** Mobile **V3** shipped **2026-08-22**, described as its biggest mobile update. | `[V]` tradesviz.com/blog/android-ios-app-v3; App Store id1643338387 |
| **TraderSync** | **Yes — iOS + Android, the longest-running in the category.** Also claims a fully responsive web app. | `[V]` App Store id1177329277 |
| **TradeZella** | **Recently — contested.** StockBrokers.com's review states "No dedicated mobile app"; later 2026 sources say iOS and Android shipped. Vendor said in May 2024 it planned to release both "this year." **Treat as "recently launched, immature."** | `[R]` conflicting; `[V]` vendor tweet for the intent |
| **Tradervue** | **No.** "Tradervue only operates as a web program… there's no Tradervue app." | `[R]` StockBrokers.com |
| **Chartlog** | **No native app**; browser/PWA access only. | `[R]` |
| **Edgewonk** | **No native app**; web application. | `[V]` edgewonk.com |

### Do traders actually use them? The ratings say: not happily

- **TraderSync iOS: 2.7 / 5 from 84 ratings.** `[V]` Android ~3.02 / 5 from 220 ratings. `[R]`
  For a category-leading app that has existed since 2017, those are poor numbers.
- The App Store review content is diagnostic. Reviewers describe it as **a read-only reporting
  surface**: good at displaying historical trades and analytics, but missing live unrealized
  P&L, current account value, and calendar drill-down ("wish you could dive into it on the
  mobile app"). One review is a precise indictment of mobile IA rather than mobile features:
  **"has all of the functions, they just aren't assembled in a useable format."** `[V]`

### Testing the "mobile is for capture, not analysis" thesis

**The thesis is right about what users need and wrong about what vendors built.** `[I]`

Evidence *for* capture:
- The complaints about TraderSync's app are that it can't do capture-adjacent, in-the-moment
  things (live P&L, account value) — not that it lacks charts.
- TradesViz V3's headline capture features are exactly the capture set: manual trade/execution
  entry, broker file import from the phone, **screenshot attachment**, note and tag management,
  and bulk-applying notes/tags across selected trades. `[V]`
- The one strongly positive mobile datapoint found — "Excellent mobile app also!" (Kay, 5★,
  Trustpilot) `[R]` — is about the app that most recently rebuilt around the daily loop.

Evidence *against* a pure-capture design:
- TradesViz V3 deliberately ships **analysis** on mobile too: native OHLC charts (1-minute to
  daily, pinch zoom, fullscreen), Chart Explore drill-down, a Review section with risk metrics,
  and an AI Coach. It explicitly keeps **custom dashboards, simulators, replay, advanced
  screeners and options-flow tools desktop-only** — so the split is not capture/analysis, it is
  **daily loop vs. deep research.** `[V]`
- Its five-screen IA is worth recording as the reference design for mobile in this category:
  **Home · Calendar · Add · Trades · Review** — with **Add** in the centre position, the
  capture affordance given the most reachable slot. `[V]`

**Conclusion `[I]`:** the correct mobile scope is neither "capture only" nor "the whole product
shrunk." It is **the daily loop**: capture (screenshot, note, emotional state, manual trade),
plus the one review pass you'd do after the close (today's P&L, today's trades, a day note) —
and nothing that requires building a view. The evidence that vendors got this wrong is that the
oldest, most feature-complete mobile app in the category sits at 2.7 stars while its reviewers
complain not about missing analytics but about missing *now*.

**For us `[I]`:** this maps almost exactly onto the Morning Plan and the post-close psych
check-in. Those are phone-shaped tasks trapped in a desktop form. And note our own screenshot
workflow is already a phone-to-Drive capture pipeline — the missing piece is the review-side
mobile surface, not the capture side.

---

## 6. Empty-state and low-data behaviour

### What vendors actually do

**The honest summary: nobody in the incumbent set gates statistics on sample size.** The
dashboards render Zella Scores, profit factors, win rates and expectancy on whatever data
exists, including twelve trades. No vendor in this research was found to display a confidence
interval, a sample-size caveat, or a "not enough data" state on a computed statistic.
`[I]` — this is a negative finding from absence of evidence across help centers, feature pages
and reviews, so it is inference, not proof; but it is a consistent absence across six products.

What they *do* have:

- **TradesViz — "Add sample data."** The single best empty-state pattern found. A new user's
  first login shows "empty charts and stats"; there is an **"Add sample data" button in the
  top-right corner** that immediately populates the whole dashboard with demonstration content
  so the user can learn the interface before their own data arrives. `[V]` It solves *learn the
  product* without pretending twelve trades are an edge.
- **TraderSync — the demo portfolio.** Explore the tools without connecting a real account.
  `[R]` Same idea, positioned at the broker-connection gate rather than the dashboard.
- **Chartlog — a downloadable 25-trade sample set** that the entire 8-chapter onboarding course
  teaches against. `[V]` The user learns the analysis workflow on data that isn't theirs.
- **TradeZella — First Import Analysis.** Auto-generated once, on the first file upload to a new
  account: "an instant breakdown of your trading performance based on the imported data,"
  delivered via a notification with a **See Report** button and archived under Reports → Recaps
  & Insights. `[V]` It is a good *onboarding* device — it manufactures a first insight moment at
  exactly the point of maximum drop-off. It is also, precisely, confident statistics on an
  arbitrary sample, with **no sample-size warning documented.** `[V]` (absence in the help
  article)
- **Third-party apps** in the long tail ship "example data" toggles and redesigned onboarding
  screens for the same reason. `[R]`

### The intellectual-honesty gap

Vendors discuss sample size **only in content marketing, never in the product.**

- Edgewonk publishes a blog post titled *"Are Your Wins Just Luck?"* on the power of big data in
  trading. `[V]`
- Chartlog's own course, after walking a user through a report that "gives you an explicit
  recommendation," immediately concedes: **"Obviously, these results are based on a quite small
  example set of trades and aren't necessarily statistically significant."** `[V]`
- The widely-repeated guidance in the category's content layer: 30–50 trades before win rate
  stabilises, 100+ before expectancy and Sharpe mean anything; at 30 trades a true 45% strategy
  commonly reads 33% or 57%. `[R]`

**So the vendors know. They just don't let the UI say it.** The commercial reason is obvious:
the product has to look valuable in week one, and "we can't tell you anything yet" is a poor
first impression. `[I]`

### The one implementation worth copying — and it isn't from a journal vendor

**TestMax's win-rate calculator** (a public tool, not a journal) does the honest version `[V]`:

- Displays the observed win rate prominently (e.g. **45.0%**).
- Directly beneath it, the **95% confidence interval computed by the Wilson score method**,
  rendered as a range: **"95% CI 35.6–54.8%."**
- A **sample-strength label** from four fixed bands: **preliminary (< 30) · early (30–99) ·
  useful (100–199) · stronger (200+)** — explicitly described as "practical communication
  guides, not proof of statistical validity."
- An **interpretive sentence** that does the reasoning for the reader: *"The observed 45.0% win
  rate is above the 34.4% after-cost breakeven estimate, but the 35.6–54.8% interval shows the
  remaining sampling uncertainty."*
- Alongside: net expectancy, net profit factor, cost-adjusted breakeven rate, total net P&L.

**Implementation for us `[I]`:** every proportion-type statistic (win rate, Discipline %,
Intra-Day Prediction %, Daily Prediction %, Execution Skill %) is a binomial proportion and has a
Wilson interval available for free — we already surface the denominators (`disciplineN`, the
readable-trade counts per prediction metric), which is 80% of the work. The pattern is:

1. Big number, unchanged.
2. Interval underneath in smaller, dimmer type — always present, never a warning that only
   appears when things are bad.
3. A band label driven by `n` alone.
4. Below `n = 30`, **render the number in a visibly provisional style** (reduced weight or
   muted) rather than suppressing it — suppression feels broken, provisional styling teaches.

**This is a genuine differentiator, not just a nicety.** `[I]` It is cheap for us (we compute
server-side and already carry the counts), it is *credible* in a way marketing copy is not, and
it directly serves the dogfood case: the honest answer to "is this setup working" after nine
trades is "you cannot tell yet," and no product currently says so. The commercial risk that
stops incumbents from shipping it — looking less impressive in week one — is a risk we do not
carry, because we are our own week-one user.

---

## 7. Report design

### The three delivery modes in use

**In-app report sections** are the default everywhere. Tradervue is the deepest (11+ report
groups × 3 tabs); TradeZella's Reports → Date & Time is the best-composed single report page —
a four-part unit of *summary line → configurable chart (up to 3 plotted metrics) → sortable
summary table → cross-analysis filter*, which is a good reusable template: **prose finding,
picture, numbers, then a way to slice it further.** `[V]`

**Scheduled email digests** are the differentiator, and only two vendors do them well:

- **Edgewonk**: fully automated **Edge Finder** analysis of all trading data **every Sunday**,
  plus performance summaries **every Monday and on the 1st of each month** covering
  best-performing setup, most profitable day, win-rate shifts, and plan-adherence efficiency.
  `[V]`/`[R]`
- **TradeZella**: opt-in **weekly and monthly** performance reports by email, plus daily P&L
  summaries and threshold alerts; the report itself lives in-app under Reports → Recaps &
  Insights and the email is the delivery mechanism. `[V]`/`[R]`

**PDF export** is conspicuously absent. No vendor in this set was found to advertise a PDF
performance report. `[I]` Reports here are read, not filed — which is a signal about what the
artifact is for.

### Edgewonk Sessions — the structured review artifact

The most interesting report format found is not a report at all. **Sessions** lets a trader
perform daily/weekly/monthly reviews in a structured form and **save the findings as report
cards, tracked over time.** `[V]`/`[R]`

Why it matters `[I]`: a generated report tells you what happened. A **saved review** records
what you concluded and lets you check later whether the conclusion held. That closes the loop
the rest of the category leaves open — every other product's reports are stateless snapshots
with no memory of what you decided last time.

### What to emulate for a human-readable report

`[I]` Synthesising the above into a spec for our own `report/index.html` and any periodic review
output:

1. **Lead with claims, not charts.** Edge Finder's card format — *one sentence + the number that
   supports it + a link to the filtered view that proves it*. A report that opens with a chart
   makes the reader do the analysis; a report that opens with a sentence has already done it.
2. **Fixed cadence beats on-demand.** Sunday/Monday delivery, same sections in the same order
   every time, so week-over-week comparison is a matter of reading the same line twice. Both
   digest vendors picked the boundary of the trading week deliberately.
3. **Every section in the four-part shape:** finding → chart → table → drill-in filter.
4. **State the delta explicitly.** "Win rate 47% (−4pts vs. prior 4 weeks)" — the comparison is
   the content; the level alone is not.
5. **Carry the sample size and interval on every proportion** (§6). In a written report this is
   nearly free and it is what makes the document trustworthy rather than promotional.
6. **Make it a saved artifact with a date, not a live view.** Sessions' insight: the value is in
   being able to read last month's conclusions and find out you were wrong.
7. **No PDF.** Nobody wants one. A stable, dated, linkable HTML page is the right medium — which
   is what the deliverable already is.

---

## Sources

All URLs consulted 2026-09-01. Marked ▶ = video-guide index or video source; ★ = vendor-first
(help center, docs, onboarding course) and therefore highest-confidence for IA claims.

**TradeZella**
1. ★ https://help.tradezella.com/en/articles/13863136-getting-started-with-tradezella — nav sections, onboarding steps, default landing
2. ★ https://help.tradezella.com/en/articles/7118437-understanding-dashboard-widgets-and-stats — full widget inventory, View modes
3. ★ https://help.tradezella.com/en/articles/10305642-introducing-the-all-new-zella-score — six metrics + weights
4. ★ https://help.tradezella.com/en/articles/14072606-first-import-analysis-in-tradezella — first-run insight artifact
5. ★ https://help.tradezella.com/en/articles/11391581-reports-day-time — report page composition
6. ★ https://help.tradezella.com/en/articles/5860216-understanding-the-trade-page — trade page 3-panel layout
7. ★ https://help.tradezella.com/en/articles/7190696-organizing-and-managing-your-notes-within-your-tradezella-notebook — Notebook templates
8. https://www.stockbrokers.com/review/tools/tradezella — onboarding modes, import friction, mobile status, criticisms
9. https://www.trustpilot.com/review/tradezella.com — user comments on quirks, import, learning curve
10. https://www.tradezella.com/blog/trading-dashboard — vendor's own view of which KPIs matter
11. https://x.com/TradeZella/status/1793510435586802083 — May 2024 mobile-app intent
12. ▶ https://www.youtube.com/watch?v=32Y9RFrOLmA — "How To Journal Your Trades With TradeZella | Walkthrough + Tutorial"

**TraderSync**
13. ★ https://tradersync.com/features/ — full feature/section inventory, responsive-web claim, 20+ dashboard widgets (retrieved via browser)
14. ★ https://tradersync.com/support/ (category taxonomy) — best public proxy for nav sections
15. ★ https://tradersync.com/tradersync-dashboards-customize-your-trading-experience/ — dashboard customisation
16. https://www.stockbrokers.com/review/tools/tradersync — onboarding quality, demo portfolio, criticisms
17. https://apps.apple.com/us/app/tradersync/id1177329277 — 2.7/5 (84 ratings) + review text on mobile scope
18. ▶ https://www.youtube.com/watch?v=bf_7VgXF-Ao — "TraderSync Overview and Brief Walkthrough"
19. ▶ https://www.youtube.com/watch?v=00g1GL3nEcI — "BEST TraderSync Review 2026"

**Tradervue**
20. ★ https://www.tradervue.com/ — top-level nav sections
21. ★ https://www.tradervue.com/help/reports — report group taxonomy
22. ★ https://www.tradervue.com/help/reports/reports_overview — Overview report chart specs, calendar colour scheme
23. ★ https://help.tradervue.com/article/3457-winning-vs-losing-trades — Compare tab structure and colours
24. ★ https://help.tradervue.com/category/3410-trade-reports — full report list
25. ★ https://app.tradervue.com/help/quota — 30-trade free-tier cap
26. https://www.stockbrokers.com/review/tools/tradervue — "a wall full of charts and data," deletion-UX failure, no mobile app
27. https://www.trustpilot.com/review/tradervue.com — TrustScore 2.4/5, 10 reviews, 90% 1-star; billing/support complaints
28. https://blog.tradervue.com/tag/journal/ — Journal view redesign, day notes, notes sidebar

**TradesViz**
29. ★ https://www.tradesviz.com/ — 600+ widgets, feature taxonomy, custom dashboards
30. ★ https://www.tradesviz.com/blog/getting-started-with-tradesviz/ — 10-step / ~30-min onboarding, "Add sample data," sidebar structure, "focus on 5–6 essential charts"
31. ★ https://www.tradesviz.com/blog/charts-statistics-reference/ — nine chart families; vendor's own overload admission
32. ★ https://www.tradesviz.com/blog/tab-explore-trade/ — Trade Explore layout, MFE/MAE/stop/target/best-exit annotations, persisted collapse state
33. ★ https://www.tradesviz.com/blog/tab-explore-day/ — Day Explore panel order
34. ★ https://www.tradesviz.com/blog/advanced-stats/ — MFE/MAE/Running P&L/Best Exit computation and display
35. ★ https://www.tradesviz.com/blog/android-ios-app-v3/ — mobile V3 (2026-08-22), five-screen IA, desktop-only exclusions, design philosophy
36. ★ https://www.tradesviz.com/blog/prop-firm-compliance-tracking/ — aggregate→cards→table multi-account pattern, drawdown gauge bands
37. ★ https://www.tradesviz.com/blog/custom-dashboard/ — drag-and-drop builder
38. ▶ ★ https://www.tradesviz.com/video-guides/ — index of 75+ vendor walkthrough videos, incl. Dashboard Overview (AS_1sdjxrAE), Dashboard Walkthrough (nJeNwLNB8VA), Trade Explore (OHs2qISVH7U), Day Explore (hx4J9Z2Lglg), Equity Curve & Account Balance (_5wxsZzmUR4), Calendar Tab (rWwPnNKbgvk), Custom Dashboard & AI Widgets (lD5PeAhOLsU), Filters & Toggles (9o5jbo07uv0)
39. https://www.trustpilot.com/review/www.tradesviz.com — usability comments both directions, mobile praise, support outliers
40. https://apps.apple.com/us/app/tradesviz-trading-journal/id1643338387 — iOS app listing
41. https://daytradereview.com/tradesviz-review/ — "overwhelming due to the large number of visualizations"; post-redesign reassessment
42. https://bullishbears.com/tradesviz-review/ — beginner vs power-user split
43. https://www.saashub.com/tradesviz-reviews — aggregated user sentiment

**Edgewonk**
44. ★ https://edgewonk.com/features — feature/section inventory, Sessions, Psychology Lab
45. ★ https://edgewonk.com/blog/edgewonk-review-guide — tab structure, 4-step review workflow, every Chart Lab visualization described
46. ★ https://edgewonk.com/edge-finder — Sunday automated analysis, card outputs, Total Edge Leak / True System Edge
47. ★ https://edgewonk.zendesk.com/hc/en-us/articles/360010150259-The-Tiltmeter — Tiltmeter column + its configuration prerequisites
48. ★ https://edgewonk.zendesk.com/hc/en-us/articles/360010061900-R-Distribution — R-multiple histogram axes and bins
49. ★ https://edgewonk.zendesk.com/hc/en-us/articles/360010150219-Sessions — saved review report cards
50. ★ https://edgewonk.com/blog/are-your-wins-just-luck-unveiling-the-power-of-big-data-in-trading — vendor content-marketing on sample size
51. ▶ https://www.youtube.com/watch?v=rZWQT6f242M — "Full Edgewonk Trading Journal Tour – All Features"
52. ▶ https://www.youtube.com/watch?v=RqSlNcW_y1U — "Learn to master the best chart analytics in the Edgewonk trading journal"

**Chartlog**
53. ★ https://chartlog.com/ — product sections (Dashboard/Journal/Insights/Strategies/Charts/Market Data), integrations (retrieved via browser)
54. ★ https://www.chartlog.com/course/find-your-way-around-chartlog/ — precise default-dashboard contents; Trades Journal/Table/Calendar views; "sheer number of fields… can look a bit overwhelming"
55. ★ https://www.chartlog.com/course/import-your-trades/ — import paths, DAS Trader Pro steps, 25-trade sample set
56. ★ https://www.chartlog.com/course/insights-how-to-improve-your-performance/ — Insights structure, report list, and the explicit small-sample caveat
57. https://www.tradingreviewers.com/chartlog-review/ — dashboard sequence, equity graph, TradingView charts, integration limits
58. https://trading-journals.com/reviews/chartlog — "cleanest analytics platforms… surprisingly simple interface"
59. ⚠️ https://www.chartlog.ai/ — **distinct product**; recorded only to document the naming collision

**Cross-vendor, comparison and pattern sources**
60. https://daytradingz.com/best-trading-journal/ — cross-vendor UI comparison
61. https://tradeciety.com/best-online-trading-journals — cross-vendor comparison
62. https://test-max.com/tools/win-rate-calculator/ — **the sample-size honesty pattern**: Wilson 95% CI, four-band labels, interpretive sentence
63. https://www.edgeflo.com/blog/sample-size-trading and /hundred-trade-sample-size — 30/50/100-trade thresholds
64. https://www.quantifiedstrategies.com/sample-size-neglect-bias-in-trading/ — sample-size neglect bias
65. https://www.tradezella.com/blog/pnl-calendar and https://www.tradesviz.com/pnl-calendar/ — converged calendar-heatmap design
66. https://traderssecondbrain.com/guides/prop-firm-multi-account-tracking — account scope switching ⚠️ affiliate layer
67. https://traderssecondbrain.com/guides/import-any-broker-csv — the 30–60 minute first-export figure, IBKR Activity Statement failure ⚠️ affiliate layer
68. https://journalplus.co/learn/guides/trading-journal-metrics-guide/ — sample-size guidance in content marketing ⚠️ affiliate layer
69. https://www.techjockey.com/us/reviews/tradervue — third-party review aggregation
70. https://www.modestmoney.com/tradersync-vs-tradervue/ — head-to-head UX comparison
