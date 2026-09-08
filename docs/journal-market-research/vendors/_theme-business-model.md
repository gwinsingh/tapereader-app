# Theme: Business Model & Market Economics

**As of:** 2026-09-01 · **Scope:** money, market size, go-to-market. Features are covered by sibling theme files.
**Persona:** market researcher, deliberately skeptical of their own optimism.
**Evidence rules:** `[V]` read on the vendor's/primary source's own page · `[R]` reported by third parties · `[I]` our inference.

> **Standing caveat on this whole document.** A large share of the "statistics" available
> about retail trading, prop firms, and journaling adoption comes from SEO content farms
> that cite each other in a circle. Where that is the case I say so and tag it `[R-weak]`.
> Do not put a number from this file into a pitch deck without re-deriving it.

---

## 1. Market sizing — bottom-up, with the arithmetic exposed

### 1.1 What we can actually verify

| Fact | Value | Tag | Source |
|---|---|---|---|
| Robinhood funded customers | 28.4M, Q2 2026 (+940k QoQ) | `[V]` | Robinhood Q2 2026 results |
| Schwab active brokerage accounts | 39.9M as of 2026-07-31 | `[V]` | Schwab monthly activity |
| Interactive Brokers client accounts (global) | 5.185M, June 2026, +34% YoY | `[V]` | IBKR brokerage metrics |
| Retail share of US equity volume | 17.9% of total equity volume (2024, SIFMA); range 15–25% depending on methodology | `[R]` | daytrading.com compilation of SIFMA/Nasdaq/Cboe |
| Retail share of options volume | ~45–48% (NYSE, 2022–23); Cboe year-end puts retail near 50% of total options volume | `[R]` | daytrading.com; Cboe |
| SPX 0DTE share of SPX volume | 61% in May 2025; retail = 54% of SPX 0DTE volume that month | `[V]` | Cboe Insights |
| 0DTE growth | ~20% of SPX volume in 2020 → >50% by 2024 → ~60%+ 2025–26 | `[R]` | SpotGamma / Traders Magazine / Cboe |
| PDT rule abolished | FINRA Reg. Notice 26-10: pattern-day-trader designation and the $25,000 minimum **eliminated**, effective **2026-06-04**, 18-month phase-in to 2027-10-20 | `[V]` | FINRA |
| Day-trader survival (Taiwan, Barber/Lee/Liu/Odean) | 44% survive 1yr, 24% 2yr, 15% 3yr; ~40% quit within the first month; ~80% within two years | `[R]` | Tradicted / bananafarmer summaries of the primary papers |
| Journaling adoption | "fewer than 15% of active traders maintain any form of consistent trade log"; a cited 2023 survey (n=4,200) claims 78% of profitable vs 19% of unprofitable traders journal | `[R-weak]` | broker-sponsored survey summaries; primary source not locatable |
| Retail prop trading | Retail prop market ~$850M revenue 2026, ~2.1M funded traders globally, ~12M challenge purchases/yr at ~$250 avg; 120–150 active firms, down from 220+ in 2023 | `[R-weak]` | track360.io, quantvps.com — both SEO properties |

### 1.2 The funnel, stated as an argument

The number that matters is not "retail investors." It is **people who trade often enough,
and deliberately enough, that reviewing their own execution is a felt need.** That is a
much smaller set, and every layer below it is a judgement call.

| Layer | Low | Mid | High | Basis |
|---|---:|---:|---:|---|
| A. Distinct US retail brokerage relationships | 60M | 75M | 90M | `[I]` from Schwab 39.9M + Robinhood 28.4M + Fidelity/E*TRADE/Webull/tastytrade/IBKR, minus heavy multi-account overlap `[V]` on the component counts |
| B. …who trade actively (≥ weekly, discretionary, self-directed) | 3.0M | 6.0M | 12.0M | `[I]` 5–13% of A. Anchored on retail = ~18% of equity volume `[R]` concentrated in a small active tail |
| C. …who self-identify as day/swing traders working on a *method* | 0.8M | 2.0M | 4.5M | `[I]` 25–40% of B. Cross-check: SEO sources claim ~400–500k US "active day traders/yr" `[R-weak]` — that is day-traders-only and excludes swing traders and prop, so it sits near our low end |
| D. …who journal in **any** form (spreadsheet, Notion, app, notebook) | 120k | 400k | 1.35M | `[I]` 15–30% of C, using the "<15% keep a consistent log" figure `[R-weak]` as a floor and allowing that self-identified method-traders journal more than the average |
| E. …who pay for a **dedicated tool** rather than a spreadsheet | 25k | 100k | 400k | `[I]` 20–30% of D. Spreadsheets are free and genuinely sufficient; broker-native analytics (IBKR PortfolioAnalyst, thinkorswim, TradingView) keeps improving and is free |

**Serviceable paying market (E), US-weighted: roughly 25,000 – 400,000 subscribers.**
Central estimate ~100,000–150,000.

### 1.3 Top-down sanity check (this is the more useful number)

Two vendor-published figures, both `[V]` but both marketing claims:

- Tradervue: **"207,623 traders"** on the homepage — cumulative registrations over 13+ years, the large majority on the free 30–100-trade tier `[V]` + `[I]`.
- TradeZella: **"100K+ traders"**, "20.2B trades journaled", "500+ brokers & prop firms", "4.8★", **1,015 Trustpilot reviews** `[V]`.

The Trustpilot count is the most informative. Consumer SaaS typically converts
**0.5–3% of paying customers into a public review** `[I]`. 1,015 reviews implies an
order of **35,000–200,000 lifetime paying customers** for the category's most
aggressively-marketed player — not concurrent subscribers, lifetime. Concurrent
paying subscribers for TradeZella are plausibly **20,000–50,000** `[I]`.

Rolling that up across TradeZella, TraderSync, Tradervue, TradesViz, Edgewonk,
Chartlog, Trademetria and the long tail:

| Scenario | Category paying subs | Blended ARPU/mo | Implied category revenue/yr |
|---|---:|---:|---:|
| Conservative | 120,000 | $28 | **~$40M** |
| Central | 250,000 | $30 | **~$90M** |
| Generous | 450,000 | $33 | **~$180M** |

**Defensible range for the global dedicated-trading-journal category: $40M–$180M/yr
revenue, central ~$90M** `[I]`. US-only is perhaps 55–70% of that `[I]`.

That is a **small** category. It is roughly one mid-sized vertical SaaS company's
revenue, split across a dozen vendors. Any TAM number above ~$500M for *dedicated
journals* (as distinct from "trading software") should be treated as marketing.

### 1.4 Directional context — is the pond growing?

**Arguments the pond is growing:**
- Retail share of US equity volume roughly doubled from a ~10–15% pre-2020 base to 15–25% and has *not* mean-reverted `[R]`.
- 0DTE/options retail activity is structurally up: SPX 0DTE from ~20% (2020) to ~61% (May 2025) of SPX volume, retail = 54% of that `[V]`.
- Retail prop firms manufactured a new, highly-motivated buyer who *must* track rules, drawdown and consistency — ~2.1M funded traders globally `[R-weak]`. This cohort has an unusually concrete reason to journal.
- **The PDT repeal (effective 2026-06-04) is the single largest structural change in this market in 25 years** `[V]`. Removing the $25,000 minimum admits a large cohort of sub-$25k accounts to unrestricted intraday trading.

**Arguments to discount all of that:**
- The PDT repeal expands the *number* of day traders, but overwhelmingly at the **small-account end** — precisely the segment least able and least willing to pay $29–$59/month for software. A trader with a $3,000 account is not spending 12% of it annually on a journal `[I]`. The new entrants raise the funnel top and *worsen* blended churn.
- Prop-firm growth is decelerating and consolidating: 80–100 firms closed Feb 2024–late 2025, ~40% of the peak population; top 5 firms hold ~62% of acquisition `[R-weak]`. Bundling into prop firms means negotiating with an oligopsony.
- The academic survival data has not moved: ~40% of day traders quit within a month, ~80% within two years `[R]`. Retail participation being higher does not mean *individual* participation is more durable.

**Net read `[I]`:** the addressable pond is flat-to-modestly-growing in *revenue* while
growing faster in *headcount* — which is the worst combination, because it means more
free-tier load and more churn per dollar of subscription revenue.

---

## 2. Pricing architecture across the category

### 2.1 The table

All figures verified on vendor pages or credible review sites on the dates noted.
Prices are USD unless stated.

| Vendor | Free tier | Entry paid | Mid | Top | Annual discount | Tag |
|---|---|---|---|---|---|---|
| **TradeZella** | None | Essential **$35/mo** ($26/mo annual, $315/yr) | Pro **$59/mo** ($44/mo, $531/yr) | Ultra **$99/mo** ($74/mo, $891/yr) | **25%** | `[V]` 2026-09-01 |
| **TraderSync** | None (7-day trial of top tier) | Pro **$29.95/mo** (~$215–270/yr) | Premium **$49.95/mo** | Elite **$79.95/mo** | ~20–25% | `[R]` multiple review sites agree |
| **Tradervue** | Yes — 30–100 trades/mo, limited analytics | Silver **$29.95/mo** ($323.46/yr, 10% off) | Gold **$49.95/mo** ($479.52/yr, 20% off) | — | 10% / 20% | `[V]` pricing page + `[R]` review sites |
| **TradesViz** | Yes — 3,000 executions/mo, **stocks only**, 1 account | Pro **C$26.99/mo** (C$19.99/mo annual) | Platinum **C$37.49/mo** (C$28.04/mo annual) | — | 25% ("3 months free") | `[V]` 2026-09-01 |
| **Chartlog** | 7-day trial | Lite **$14.99/mo** ($13.49 annual) | Standard **$29.99/mo** ($25.49) | Pro **$39.99/mo** ($31.99) | ~10–20% | `[R]` |
| **Trademetria** | Yes — 30 orders/mo, 1 account, 3 open positions | Basic **$19.95/mo** ($169/yr = $14.10/mo) | Pro **$29.95/mo** ($249/yr = $20.80/mo) | — | ~30% | `[V]` |
| **Edgewonk** | None (14-day money-back) | **$197 per 16-month term** — one tier, all features | — | — | n/a (term *is* the discount) | `[V]` |
| **JournalPlus** | — | prop bundle **~$39/mo** | — | — | — | `[R-weak]` |
| **Journali** | — | Pro **~$20/mo** unlimited prop accounts | — | — | — | `[R-weak]` |
| **Trader's Second Brain** | Yes | **$49/mo** or **$299 lifetime** | — | — | n/a | `[R]` |
| Spreadsheet / Notion / broker-native | Free | — | — | — | — | `[V]` |

### 2.2 What the numbers say

**Modal price point: $29–$30/month at the entry paid tier.** Five of the eleven
products cluster within a dollar of $29.95 `[V]`/`[R]`. This is not a coincidence — it is
the price at which a trader with a $25k+ account stops doing arithmetic.

**Second cluster: $49–$59/month** for the "AI / advanced analytics" tier.

**Psychological ceiling: $99/month.** TradeZella Ultra ($99) and TraderSync Elite
($79.95) are the observed top of the market `[V]`/`[R]`. Above $100/mo a journal is
competing for wallet share with the trader's *charting and data* subscription
(TradingView Premium, DAS, a Polygon/data feed), which is load-bearing for the actual
trading. A journal is not. `[I]`

**Effective realized ARPU is well below sticker.** With 25% annual discounts and
discount-code affiliate promos everywhere, blended realized ARPU across the category is
plausibly **$24–$30/month** `[I]`.

**Price has drifted up.** StockBrokers.com's TradeZella review still lists Basic $29 /
Premium $49 `[V]`; the live page today is $35 / $59 / $99 `[V]`. That is roughly a
20% list increase plus a new top tier — the standard response to bad net revenue
retention: raise price on the survivors.

### 2.3 What sits behind the first paywall — i.e. what the category believes is worth paying for

This is the most useful pricing question, and the answer is consistent:

| Behind the first paywall at most vendors | Evidence |
|---|---|
| **Volume** — unlimited trades/executions/orders (Tradervue 30–100 trades, Trademetria 30 orders, TradesViz 3,000 executions) | `[V]` |
| **Asset classes beyond equities** — options, futures, forex, crypto (TradesViz free = stocks only) | `[V]` |
| **Multiple accounts** — the prop-trader tax; TradeZella Essential = 1 account, Pro = 50, Ultra = unlimited | `[V]` |
| **Broker auto-sync** — Trademetria gates auto-sync to Pro | `[V]` |
| **AI, metered by credits** — TradeZella 500/1,500/3,000 credits by tier; TraderSync gates Cypher AI by messages/day (~5/15/full) | `[V]` / `[R]` |
| **Advanced exit / MFE / MAE analysis** — Tradervue Gold gates "trade exit performance" and "max potential P&L"; TradesViz Platinum gates "advanced exit analysis" and options flow | `[V]` |
| **Trade replay** — TradeZella Pro+ | `[V]` |
| **Backtesting** — TradeZella Essential caps at 10 manual strategies; automated AI backtesting is Pro+ | `[V]` |

**Read `[I]`:** basic journaling is a commodity and the category knows it. Nobody gates
"can you log a trade." What is monetized is (a) *scale* — more trades, more accounts,
more asset classes, which is really a proxy for "you are a serious trader"; and (b)
*the analysis that tells you where you left money on the table* — exit analysis, MFE,
replay. Note that (b) is exactly what TapeReader already computes (Max R Before Stop,
MAE (R), Capture Tracker, Exec Gap) — the category charges its *top* tier for it.

**Edgewonk's pricing is the tell of a mature, churn-scarred vendor.** One tier, all
features, **$197 for a 16-month term** `[V]`. There is no monthly option. That is a
vendor that has concluded monthly churn is unsurvivable and has moved entirely to
prepaid multi-month. Everyone else is drifting the same way via 25% annual discounts.

---

## 3. Unit economics — what it actually costs to serve a paying user

### 3.1 The line items

| Cost line | Amount | Tag |
|---|---|---|
| Compute/storage (Cloudflare Workers + D1) | D1 free: 5M rows read/day, 100k rows written/day, 5GB. Paid: 25B rows read/mo included then $0.001/M; 50M rows written/mo included then $1.00/M; storage $0.75/GB-mo | `[V]` |
| Payment processing | ~2.9% + $0.30 → **~4.0% of a $29 charge** | `[I]` standard Stripe |
| Broker sync (SnapTrade) | Free to 5 connected accounts; then **$2.00/connected user/mo** (real-time) or **$1.00/connected user/mo** (daily). Billed per *user*, not per broker connection | `[V]` |
| Broker sync (Plaid Investments) | Per-Item **monthly subscription**; Holdings and Transactions are separate subscriptions. **Price not published** — sales-gated | `[V]` that it is per-item monthly; price `[unverified]` |
| LLM inference for AI features | Metered by vendors as "credits" — an explicit admission it is material COGS. **$0.50–$3.00/user/mo** for a chat-style coach at real usage | `[I]`, corroborated by `[V]` credit metering at TradeZella and message caps at TraderSync |
| Support | 1 support head per ~1,500–3,000 consumer subs | `[I]` |
| **Market data** | **See below. This is the whole game.** | |

### 3.2 Market data licensing — the underestimated gate

**The core finding: every cheap retail-priced market data plan explicitly forbids
showing the data to your users.**

Polygon.io (now **massive.com**) Market Data Terms of Service, verbatim:

> "you may not use the Market Data to build an application intended for use by end users other than you"

and separately prohibits "redistribute, display, disseminate, duplicate, license,
sublicense, publish, broadcast, transmit, distribute" `[V]`.

The terms make **no distinction between real-time, delayed, and historical data** for
purposes of the redistribution prohibition `[V]`. So the Polygon individual plans that
a hobby journal is built on — $0 / $29 / $79 / $199 — are **all unusable the moment you
have a second user.**

| Provider | Individual (no redistribution) | Commercial / redistribution-permitted | Tag |
|---|---|---|---|
| **Polygon / Massive — Stocks** | Basic $0 · Starter **$29/mo** · Developer **$79/mo** · Advanced **$199/mo** — all marked *"Individual use only"*, *"Non-pros only"* | **Stocks Business $2,499/mo.** Add-ons: Cboe EDGX / Nasdaq Basic / Full Market real-time **$1,999/mo each**; Full Market **Delayed (15-min) $499/mo**; IEX $499/mo; NYSE Imbalances $399/mo. Enterprise = custom. Startups: "25% or more off first year" | `[V]` 2026-09-01 |
| **Databento** | Usage-based (historical) · Standard **$199/mo** (live, no licence fees) | **Plus $1,750/mo licence fees** (annual contract) adds **external distribution rights**; **Unlimited $4,500/mo**. Separately: **Equities Basic bundle — $825/mo flat, zero exchange licence fees, explicitly licensed for distribution, display and non-display** — but covers only **NYSE Chicago, NYSE National, IEX, MIAX Pearl** (small-share venues; IEX TOPS is 15ms delayed). "Most of our datasets can be redistributed internally or externally **after 24 hours**" | `[V]` |
| **Tiingo** | Starter free · Power **$30/mo** — both: *"you may only use the data for your own personal use and you may not display or share the data with another person or organization"* | Contact sales | `[V]` |
| **EODHD** | Free · EOD £19.99/mo · EOD+Intraday £29.99/mo · Fundamentals £59.99/mo · All-in-One £99.99/mo — **all marked personal use** | "Startups & Enterprise Data Solution Plan" — sales-gated, price not published | `[V]` |
| **Twelve Data** | Basic free · Grow $29/mo · Pro $99/mo · Ultra $329/mo — described for *"personal, internal, and non-commercial purposes"* | Not published | `[V]` on prices; redistribution terms `[unverified]` |
| **Alpaca** | Free (15-min delayed REST, real-time IEX-only WS) · Algo Trader Plus **$99/mo** (full SIP, OPRA) | Broker API partner tiers — **bespoke per partner**, not published | `[R]` |
| **Finnhub** | Pricing page not machine-readable on fetch | — | `[unverified]` |

**The exchange fees underneath all of it:**

- SIP display fees, per Cboe DataShop's published estimates: **Professional real-time display $66–$92/subscriber/month; Non-Professional real-time display $3.00/subscriber/month; UTP delayed = $250/year admin fee** `[V]`.
- Databento: exchange licence fees "range from $32 to $20K+ per month per exchange" and are **vendor-agnostic** — you pay them no matter who you buy through. A single Nasdaq TotalView professional configuration was cited at **~$2,051/month minimum** `[V]`.
- Databento's CEO, on why the zero-licence-fee bundle exists: **"non-display fees alone for the SIPs run over $100,000 per year"** `[V]`.

### 3.3 What this means for a new entrant, concretely

**If your journal draws price charts for your users, you need a redistribution licence.**
The realistic options are:

| Option | Fixed cost | What you give up |
|---|---:|---|
| **Databento Equities Basic** | **$825/mo** = $9,900/yr | Only 4 minor venues; not consolidated tape. Fine for a *shape-of-the-bar* chart, wrong for anything claiming accurate NBBO/volume |
| **Polygon/Massive Stocks Business** | **$2,499/mo** = $30,000/yr | Nothing — this is the clean answer. 25%+ startup discount may take year 1 to ~$22.5k |
| **Polygon/Massive Full Market Delayed** | **$499/mo** = $6,000/yr | Real-time. For an *end-of-day journal reviewing closed trades*, this may be entirely sufficient |
| **Push data cost onto the user** | $0 | Ask each user to bring their own TradingView/broker chart; you render your annotations over a screenshot. This is what TapeReader's Screenshot Review already effectively does |
| **Ship no charts** | $0 | The feature the category considers table stakes |

**The breakeven arithmetic that matters `[I]`:** at a $29/mo list price and ~50%
contribution margin after affiliate, processing and sync costs, you clear roughly
$14–16/subscriber/month. To cover a **$2,499/mo** data licence you need **~165
subscribers before you make a single dollar** — that part is survivable. The real
problem is that the licence is due in **month 1**, before subscriber 1, and it is
$30,000/yr of unavoidable cash. For a bootstrapped entrant that is the gate.

### 3.4 Fully-loaded contribution margin, one affiliate-referred $29 subscriber

| Line | $/mo | Note |
|---|---:|---|
| Gross subscription | 29.00 | modal list price `[V]` |
| Payment processing | −1.14 | ~3.9% `[I]` |
| **Affiliate commission @30%** | **−8.70** | category standard `[V]` |
| Broker sync (SnapTrade, daily) | −1.00 | `[V]` |
| Market data, amortized over 2,000 subs @ $1,600/mo | −0.80 | `[I]` on a blended Databento/delayed licence |
| LLM/AI features | −1.25 | `[I]` |
| Hosting, storage, support | −0.75 | `[I]` |
| **Contribution** | **≈ $15.36** | **~53% margin** |

**This is not a software business's 80–90% gross margin.** A journal with charts,
broker sync, AI and affiliate distribution is a **~50–55% gross margin business.** That
single fact reframes everything downstream: the LTV/CAC arithmetic, how much you can
spend on paid acquisition, and how much churn you can absorb.

**LTV `[I]`:** at 7–9% monthly churn (see §5), average life is 11–14 months →
**LTV ≈ $170–$215.** A direct-response CAC of $80–200 in finance keywords is therefore
marginal-to-negative. **The affiliate model is not a preference in this category; it is
the only channel whose economics close**, because it converts CAC from cash-up-front to
a revenue share that automatically stops when the customer churns.

---

## 4. Go-to-market — how these products actually acquire users

### 4.1 The founding fact

**TradeZella's founder, Umar Ashraf, had a YouTube channel with 750,000+ subscribers
before TradeZella launched in early 2022** `[R]` (Fast Company profile). The product
did not win a distribution fight. It launched with distribution already paid for.

Every subsequent GTM observation in this category is downstream of that.

### 4.2 The channels, ranked by observed importance

**1. Educator / creator affiliate programmes — dominant.**

| Vendor | Commission | Recurrence | Cookie | Cumulative paid out | Tag |
|---|---|---|---|---|---|
| **TradeZella** | 20% (Bronze, 6mo) → **30%** (Silver, up to 12mo) → 10% **lifetime** (Gold/Top). Tiers by referral count: 1 / 10 / 100 / 400 | mixed | **60 days** | not stated | `[V]` |
| **Edgewonk** | **30% lifetime** | lifetime | not stated | **>$500,000** | `[V]` |
| **Tradervue** | **20%** of all paid subscriptions, "entire customer lifetime" | lifetime | **30 days** | **>$200,000** | `[V]` |
| **TraderSync** | **30%** of subscription, recurring on all subsequent subscriptions (one aggregator claims 40% — conflicting) | recurring | not stated | not stated | `[R]`, conflicting |
| Retail prop firms (same audience) | **$40–$80 CPA or 10–25% rev-share**; **40–50% of all challenge purchases come via affiliates** | mixed | — | — | `[R-weak]` |

Edgewonk's affiliate page is the most revealing: it offers educators and coaches
"tailored webinars, onboarding assistance, custom educational materials, and special
discount codes to offer their communities" `[V]`. That is not an affiliate programme;
that is a **channel partnership programme dressed as one.** The product is being sold
*through* trading educators as a bundled component of their course.

**2. Comparison-site / review SEO — a second affiliate tax.**

Searching any vendor name returns a wall of near-identical properties: bullishbears,
daytradingtoolkit, traderssecondbrain, tradingtoolshub, trading-journals.com,
rizetrade, lunefi, tradezap, tradecovex, tradingsfx, damnpropfirms, journalplus
comparison pages, plus vendors' own `/vs/` pages (`tradezella.com/vs/tradersync`) `[V]`.
Almost all of these carry affiliate links. **The bottom-of-funnel discovery surface for
this category is itself monetized by commission.** A vendor that does not pay 20–30%
does not appear on it.

**3. Community / Discord partnerships.** TradeZella's homepage claims **"150+ trader
communities"** integrated and **"10K+ community members"**, plus "Spaces" for private
mentoring/group trading rooms and "Zella University" courses, "100+ webinars &
bootcamps" `[V]`. Tradervue has a long-standing mentor/mentee model with unlimited
mentors on paid tiers `[V]`. This is the same channel as (1) — the educator's Discord
is the distribution unit — but structured as a product feature so the educator's
students land *inside* the product.

**4. Prop-firm bundling — the newest and most interesting channel.** TradeZella's
"PropFirm Sync" launched late 2025, free for every subscriber, integrating Apex,
TopStep, Tradeify, FTMO, Leeloo `[R]`. JournalPlus sells a prop bundle at ~$39/mo;
Journali at ~$20/mo `[R-weak]`. A prop firm has thousands of paying evaluation
customers who are *contractually required* to respect drawdown and consistency rules —
the single most acute journaling need in the market. `[I]` This is the one channel
where a new entrant could plausibly win a large block of seats in one deal. It is also
an oligopsony: the top 5 firms hold ~62% of trader acquisition `[R-weak]`.

**5. Paid ads — largely absent as a primary channel.** No vendor's public materials
lead with it. `[I]` Finance/trading keywords are among the most expensive in search, and
at a $170–215 LTV and 50% margin, direct-response paid acquisition does not close.

### 4.3 The blunt implication

**Distribution in this category is rented from trading educators at 20–30% of revenue,
in perpetuity, and the discovery layer is owned by the same people.**

Three consequences, stated without softening:

1. **A superior product with no audience does not get discovered.** Not "grows slower" — *does not get discovered*. Organic search is saturated by commission-funded review sites; the YouTube/Discord layer only surfaces what pays it; and word of mouth in trading communities routes through the same educators.
2. **The 20–30% is permanent, not a launch cost.** Tradervue and Edgewonk pay it for the customer's **entire lifetime** `[V]`. It is not amortizable CAC; it is a structural haircut on gross margin — which is why §3.4 lands at ~53% and not 85%.
3. **The winning play is to *be* the audience, not to buy it.** TradeZella's 750k-subscriber founder is not an anecdote, it is the category's actual business model. The realistic alternatives are (a) acquire an audience first and ship the product second, (b) win a prop-firm or broker bundle, or (c) accept that you are building for yourself and a few hundred people. There is no fourth option visible in the evidence.

---

## 5. Retention and churn — the structural problem

### 5.1 The churn floor is set by the customer's hobby, not by your product

| Input | Value | Tag |
|---|---|---|
| Day traders quitting within the first month | ~40% | `[R]` Barber/Lee/Odean 2010, via summaries |
| Quitting within two years | ~80% | `[R]` same |
| Taiwan survival: 1yr / 2yr / 3yr | 44% / 24% / 15% | `[R]` Barber/Lee/Liu/Odean, TWSE 1992–2006 |
| Brazil, traders persisting >300 days | 97% lost money | `[R]` Chague et al. |
| B2C SaaS monthly churn benchmark | 5–8% (one set: B2C 6.5–6.7% vs B2B 3.8–3.9%) | `[R]` |
| Prosumer SaaS "good" target | 3–5%/mo | `[R]` |

**The arithmetic `[I]`:** a ~44% one-year survival rate for the underlying activity
implies **~6.6% monthly attrition from the customer ceasing to trade at all** —
before a single complaint about the product. Layer normal B2C SaaS dissatisfaction
churn on top and a realistic blended figure is **7–10% monthly**, i.e. a **10–14 month
average customer life**.

And the churn is **adversely selected**. The customers who quit are the ones losing
money. The customers who stay are profitable and price-insensitive — which is
comforting until you notice it means your cohort curves look terrible while your
surviving-cohort revenue looks fine, and you will be tempted to report the latter.

**Worse: your product's core value proposition is showing the customer evidence they
are losing money.** A cited 2021 survey found **62% of traders who abandoned journals
cited "emotional discomfort with reviewing losses"** as the primary reason
`[R-weak]` — provenance unverifiable, but the mechanism is obviously real. This is a
product whose successful use produces an emotionally aversive experience for the
majority of its users. Fitness apps and budgeting apps share this pathology and share
its churn profile.

### 5.2 How strong is accumulated-history lock-in, really?

The obvious moat candidate. Assess it honestly:

**Arguments it is weak `[I]`:**
- The trade data **originates in the broker**, not in your product. The user can re-download 2 years of executions from IBKR/DAS/Robinhood in minutes.
- Every vendor accepts generic CSV import — TradeZella advertises "500+ broker integrations", Tradervue "80+", TraderSync "700+" `[V]`/`[R]`. Import is a *marketed feature* of your competitors, aimed directly at your customers.
- Migrating is an afternoon of CSV work, not a quarter-long project. Compare to a CRM or an accounting system: there is no workflow, no team, no integration, no compliance record holding the user in place.

**Arguments something real accrues `[I]`:**
- **Hand-built taxonomy** — setups, playbooks, tags, rules. This is *not* in the broker data and cannot be re-derived. This is the genuinely sticky asset.
- **Screenshots and annotations** — hundreds of images tied to trades. Portable in principle, painful in practice.
- **Social graph** — mentors, Spaces, shared trade reviews (Tradervue's mentoring, TradeZella's Spaces). Leaving means leaving a relationship, not just a database.
- **Prop-firm rule tracking bound to live accounts** — switching mid-evaluation is genuinely costly.

**Verdict `[I]`:** accumulated trade history is a **weak** moat and should not be relied
on. The defensible lock-in is the *user-authored layer on top of the data* — taxonomy,
playbooks, annotations, and social ties. Notably, **that is also the layer the user is
least likely to have built** if they churn in month 3.

### 5.3 The category's actual retention mechanism is prepayment

Look at what everyone quietly does:

- Edgewonk: **no monthly plan at all — $197/16 months** `[V]`.
- TradeZella: **25% annual discount** — the largest in the category `[V]`.
- Trademetria: ~30% effective annual discount `[V]`.
- TradesViz: annual = "3 months free" `[V]`.
- Tradervue: 10% (Silver) / 20% (Gold) `[R]`.
- Trader's Second Brain: **$299 lifetime** `[R]`.
- TraderSync: 7-day trial of the *top* tier, no free plan `[R]` — trial-to-paid conversion pressure rather than freemium.

**Read `[I]`:** a category where the standard annual discount is 20–30% and one vendor
has abolished monthly billing entirely is a category that has measured its monthly churn
and did not like the answer. Prepayment does not fix churn; it **defers recognition of
it by 12–16 months** and buys the vendor a year of cash. Any new entrant should assume
the same, and should assume investors and acquirers know it.

---

## 6. Realistic revenue scenarios for a new entrant, 24 months

### 6.1 Shared assumptions (stated so they can be attacked)

| Assumption | Value | Basis |
|---|---|---|
| List price | $29/mo entry, $49/mo mid | modal category price `[V]` |
| Annual mix | 30% of subscribers take annual at 25% off | category norm `[V]` |
| Blended realized ARPU | **$26/mo** | `[I]` |
| Contribution margin | **53%** (per §3.4) | `[I]` |
| Monthly churn | 8% base / 10% pessimistic / 6.5% optimistic | `[R]` + §5 attrition floor |
| Fixed data licence | $6k–$30k/yr, entered when subs > ~400 | `[V]` Polygon delayed $499/mo → Business $2,499/mo |
| Affiliate share of new subs | 0% / 50% / 70% by scenario | `[V]` category structure |
| Team | founder-led; no outside capital | project context |

**Steady-state ceiling is set by churn, not by acquisition.** At 8% monthly churn, a
constant N net-new/month asymptotes at **N ÷ 0.08 = 12.5N subscribers**. This single
identity governs every scenario below and is the most important number on this page.

### 6.2 The three scenarios

| | **Pessimistic** | **Base** | **Optimistic** |
|---|---|---|---|
| **Premise** | No pre-existing audience. Organic Reddit/SEO/word-of-mouth only. Competing against free spreadsheets and a paid-review layer that ignores you. | One or two mid-size educator partnerships (50–150k subs each) at 30% rev-share, plus comparison-site placement bought with commission. | Founder (or co-founder) brings an existing trading audience of 100k+, **or** a prop-firm bundle covering thousands of seats lands in year 1. |
| Gross adds/mo by M24 | 30 | 130 | 400 |
| Monthly churn | 10% | 8% | 6.5% |
| **Steady-state ceiling** | ~300 | ~1,625 | ~6,150 |
| **Paying subs @ M24** | **250–400** | **1,200–1,800** | **4,000–6,000** |
| **MRR @ M24** | **$6.5k–$10.4k** | **$31k–$47k** | **$104k–$156k** |
| **ARR run-rate @ M24** | **$78k–$125k** | **$375k–$560k** | **$1.25M–$1.9M** |
| Affiliate share of new subs | 0% | 50% | 70% |
| Contribution margin | ~62% (no affiliate) | ~53% | ~48% |
| **Monthly contribution @ M24** | **$4k–$6.5k** | **$16k–$25k** | **$50k–$75k** |
| Data strategy affordable | Delayed-only ($499/mo) or user-supplied screenshots | Delayed ($499/mo), Business at the top end | Polygon Business ($2,499/mo) comfortably |
| Headcount supportable | 0 FTE — side income | 1 FTE + contractor | 4–6 FTE |
| **What it actually is** | A well-loved tool for a few hundred people. Covers hosting and a data licence and buys the founder a good journal. | A real, unglamorous small business. Roughly Trademetria/Chartlog scale. Not venture-fundable. | Roughly where TradeZella-class outcomes begin. |

### 6.3 Probability weighting, and the uncomfortable part

For a team **with no pre-existing trading audience** `[I]`:

| Scenario | Probability |
|---|---:|
| Pessimistic | **55%** |
| Base | **35%** |
| Optimistic | **10%** |

For a team **with** an existing audience of 100k+ engaged traders, flip pessimistic and
optimistic. **The distribution of outcomes in this category is determined almost
entirely by one binary input that has nothing to do with the software.**

Expected value at the no-audience weighting: ~$330k ARR at month 24, ~$170k of annual
contribution, one to two people. That is a viable lifestyle business and a bad venture
investment — which is the correct conclusion and matches what the category actually
looks like (one loud, audience-funded leader; a dozen small profitable survivors; a
long tail of abandoned products).

### 6.4 Two specific hazards to price in

1. **The free/adjacent floor keeps rising.** Broker-native analytics (IBKR
   PortfolioAnalyst, thinkorswim, TradingView's journal-adjacent tooling) and
   spreadsheets are free and improving. The category's own free tiers
   (Tradervue 30–100 trades, Trademetria 30 orders, TradesViz 3,000 executions `[V]`)
   are adequate for a large share of users. You are selling against $0 with a real
   product.
2. **The PDT repeal (2026-06-04) grows the funnel at the wrong end** `[V]`. More
   small-account intraday traders means more free-tier load, higher blended churn, and
   more support cost per dollar of revenue. Do not model it as pure upside.

---

## 7. Summary judgement

- **Market size:** defensible range **$40M–$180M/yr** of dedicated-journal revenue globally, central ~$90M, on **120k–450k paying subscribers** worldwide. Small. `[I]`
- **Modal price:** **$29–$30/month** entry tier; second cluster $49–$59; ceiling $99. Realized ARPU ~$24–30 after annual discounting. `[V]`/`[I]`
- **What the paywall protects:** volume limits, multi-account, multi-asset, broker sync, AI credits, and **exit/MFE/replay analysis** — the last of which TapeReader already computes. `[V]`
- **Unit economics:** ~**53% contribution margin**, not 85%. Market data redistribution licences run **$825–$2,499/month fixed** before customer one; SnapTrade is $1–2/user/mo; affiliate is 20–30% forever. `[V]`
- **Dominant channel:** **trading-educator affiliate and community partnerships at 20–30% recurring**, with the review/comparison SEO layer funded by the same commissions. `[V]`
- **Churn:** **7–10%/month blended**, with a ~6.6%/mo floor imposed by traders quitting trading. LTV ~$170–215. Accumulated history is a weak moat; the user-authored taxonomy layer is the real one. `[I]`
- **Biggest economic obstacle:** **distribution**, not product and not data. Data is a solvable five-figure fixed cost with known workarounds (delayed-only, or user-supplied charts); distribution is a permanent 20–30% revenue share paid to gatekeepers who will not surface you unless you pay it, in a market where the leader won by *already owning the audience*.

**One genuinely useful strategic finding for TapeReader specifically `[I]`:** the
product as built reviews **closed trades using historical/EOD bars**, not live
quotes. Historical and delayed data is licensed far more cheaply than real-time —
Databento states most datasets can be redistributed externally **after 24 hours**
`[V]`, Polygon's Full Market **Delayed** feed is **$499/mo** vs **$2,499/mo** for the
real-time Business plan `[V]`, and UTP delayed carries a **$250/year** admin fee `[V]`.
An end-of-day-only journal can therefore enter this market for roughly **$6k/yr** of
data cost instead of $30k. That is not a small difference at the scale these
businesses actually operate at.

---

## Sources

**Vendor pricing & programmes**
- [TradeZella — Pricing](https://www.tradezella.com/pricing) — accessed 2026-09-01
- [TradeZella — Trading Journal](https://www.tradezella.com/trading-journal) — accessed 2026-09-01
- [TradeZella — Homepage (scale claims)](https://www.tradezella.com/) — accessed 2026-09-01
- [TradeZella — Partner Program](https://www.tradezella.com/partners) — accessed 2026-09-01
- [Tradervue — Homepage (207,623 traders)](https://www.tradervue.com/) — accessed 2026-09-01
- [Tradervue — Pricing](https://www.tradervue.com/site/pricing/) — accessed 2026-09-01
- [Tradervue — Affiliate Program](https://www.tradervue.com/site/affiliate-program/) — accessed 2026-09-01
- [TradesViz — Pricing](https://www.tradesviz.com/pricing) — accessed 2026-09-01
- [Edgewonk — Pricing](https://edgewonk.com/pricing) — accessed 2026-09-01
- [Edgewonk — Affiliate](https://edgewonk.com/affiliate) — accessed 2026-09-01
- [Trademetria — Pricing](https://www.trademetria.com/pricing) — accessed 2026-09-01
- [TraderSync — Affiliate Program](https://tradersync.com/affiliate-program/) — 403 on fetch; content via search snippets, 2026-09-01
- [AffCobra — TraderSync affiliate listing (conflicting 40% claim)](https://affcobra.com/program/tradersync/) — accessed 2026-09-01

**Third-party vendor reviews (pricing corroboration)**
- [StockBrokers.com — TradeZella Review](https://www.stockbrokers.com/review/tools/tradezella) — accessed 2026-09-01
- [StockBrokers.com — Tradervue Review](https://www.stockbrokers.com/review/tools/tradervue) — accessed 2026-09-01
- [BullishBears — TraderSync Review](https://bullishbears.com/tradersync-review/) — accessed 2026-09-01
- [Trader's Second Brain — Best Trading Journal App](https://traderssecondbrain.com/guides/best-trading-journal-app) — accessed 2026-09-01
- [TradingSFX — TradeZella Alternatives](https://tradingsfx.com/blog/tradezella-alternatives) — accessed 2026-09-01
- [Trustpilot — TradeZella (4.8★, 1,015 reviews)](https://www.trustpilot.com/review/tradezella.com) — accessed 2026-09-01
- [Coupler.io — TradeZella case study](https://www.coupler.io/case-studies/tradezella) — accessed 2026-09-01
- [Fast Company — "Built by one of their own, TradeZella…"](https://www.fastcompany.com/91212604/built-by-one-of-their-own-tradezella-lets-day-traders-track-and-plan-transactions) — 403 on fetch; founder/YouTube facts via search snippets, 2026-09-01

**Market data licensing**
- [Massive (formerly Polygon.io) — Pricing](https://massive.com/pricing) — accessed 2026-09-01
- [Massive — Business pricing](https://massive.com/business) — accessed 2026-09-01
- [Massive — Market Data Terms of Service](https://massive.com/legal/market-data-terms-of-service) — accessed 2026-09-01
- [Databento — Pricing](https://databento.com/pricing) — accessed 2026-09-01
- [Databento — Understanding exchange license fees](https://databento.com/blog/understanding-exchange-fees) — accessed 2026-09-01
- [LiquidityFinder — Databento zero-license-fee US equities bundle ($825/mo)](https://liquidityfinder.com/news/databento-launches-the-industrys-first-zero-license-fee-us-equities-data-bundle-bafb7) — accessed 2026-09-01
- [Cboe DataShop — SIP Fees](https://datashop.cboe.com/sip-fees) — accessed 2026-09-01
- [Tiingo — Pricing](https://www.tiingo.com/pricing) — accessed 2026-09-01
- [EODHD — Pricing](https://eodhd.com/pricing) — accessed 2026-09-01
- [Twelve Data — Pricing](https://twelvedata.com/pricing) — accessed 2026-09-01
- [Alpaca — About Market Data API](https://docs.alpaca.markets/us/docs/about-market-data-api) — accessed 2026-09-01

**Broker-sync aggregators**
- [SnapTrade — Pricing](https://snaptrade.com/pricing) — accessed 2026-09-01
- [Plaid — Pricing](https://plaid.com/pricing/) — accessed 2026-09-01
- [Plaid Docs — Pricing and billing](https://plaid.com/docs/account/billing/) — accessed 2026-09-01

**Infrastructure cost**
- [Cloudflare — D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) — accessed 2026-09-01

**Market structure, participation, regulation**
- [FINRA Regulatory Notice 26-10 — intraday margin replaces PDT, effective 2026-06-04](https://www.finra.org/rules-guidance/notices/26-10) — accessed 2026-09-01
- [Cboe Insights — SPX 0DTE options jump to 61% share on retail resurgence](https://www.cboe.com/insights/posts/spx-0-dte-options-jump-to-61-share-on-retail-resurgence) — accessed 2026-09-01
- [DayTrading.com — Individual Traders ("Retail") in the US Stock Market](https://www.daytrading.com/retail-traders-statistics) — accessed 2026-09-01
- [Robinhood — Q2 2026 results (28.4M funded customers)](https://investors.robinhood.com/news-releases/news-release-details/robinhood-reports-second-quarter-2026-results) — accessed 2026-09-01
- [Interactive Brokers — brokerage metrics (5.185M accounts, June 2026)](https://www.interactivebrokers.com/mkt/getFileNew.php?file=latestMetricPR) — accessed 2026-09-01
- [Charles Schwab — Monthly Activity Highlights (39.9M active brokerage accounts)](https://pressroom.aboutschwab.com/press-releases/press-release/2026/Schwab-Reports-Monthly-Activity-Highlights/default.aspx) — accessed 2026-09-01

**Trader survival, churn, prop firms**
- [Tradicted — Barber, Lee, Liu & Odean, "Day Traders Lose Money and Keep Trading: Evidence from Taiwan"](https://www.tradicted.com/research/barber-learning-2020/) — accessed 2026-09-01
- [Bananafarmer — Day Trading Failure Rate: 30 Studies, 8 Countries](https://bananafarmer.app/research/day-trading-failure-rate) — accessed 2026-09-01
- [Startup Edition — Subscription churn and retention benchmarks (2026)](https://blog.mean.ceo/subscription-churn-retention-benchmarks-statistics/) — accessed 2026-09-01
- [Track360 — Prop Trading Industry Statistics 2026](https://track360.io/blog/prop-trading-industry-statistics-2026) — accessed 2026-09-01 `[R-weak]`
- [Track360 — Prop Trading Industry Report 2026 ($850M market)](https://track360.io/blog/prop-trading-industry-report-2026-market-analysis) — accessed 2026-09-01 `[R-weak]`
- [QuantVPS — Prop Firm Statistics 2026](https://www.quantvps.com/blog/prop-firm-statistics) — accessed 2026-09-01 `[R-weak]`
- [Paper Trading Journal — Day trade statistics](https://papertradingjournal.com/2026/03/23/day-trade-statistics/) — accessed 2026-09-01 `[R-weak]`
- [TraderLens — Trading Journal: Why Most Traders Fail to Use It Properly](https://traderlens.app/en/blog/trading-journal-guide) — accessed 2026-09-01 `[R-weak]` (journaling-adoption survey figures)
