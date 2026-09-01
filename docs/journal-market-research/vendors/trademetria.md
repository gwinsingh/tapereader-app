# Trademetria

**URL:** <https://www.trademetria.com> · **As of:** 2026-09-01 · **Tier:** primary
**One-line positioning (theirs):** "Trading Journal for Traders and Investors. Turn your trading history into actionable insights." `[V]`
**One-line positioning (ours):** A one-founder, decade-old, multi-asset journal that
survives by being *broad and cheap* on the B2C side while quietly licensing the same
engine as white-label back-office to prop firms and brokers on the B2B side.

## Snapshot

| | |
|---|---|
| Founded / age | Site says **"a U.S.-based company founded in 2016"** and "Trusted by 80,000+ users since 2016" `[V]` (/about, homepage). The product predates that — Trademetria appears in trader forums well before 2016, and the oldest blog post found is **2018-03-06** `[V]`; 2016 is most likely the US incorporation date, not the product's birth `[I]`. Either way it is one of the longest-running products in the category. |
| Team size (est.) | **Effectively one person plus contractors.** The About page is written first-person by a single named owner, **Thiago Ghilardi**, "owner of Trademetria" `[V]`. Blog posts are bylined "Trademetria Team" `[V]`. No other named staff found anywhere. `[I]` |
| Primary asset classes | **Everything.** Equities (global), options (any 100-multiplier market), futures (US + Europe + India + Brazil), forex (all pairs), CFDs (CSV only), crypto (spot + perpetuals, ≤8 decimals; leveraged contracts unsupported), plus cash transactions/dividends `[V]` (/help). |
| Primary user segment | Deliberately *un*segmented: retail multi-asset traders and investors globally, skewing international (Brazil, India, Europe brokers well represented in the integration list) `[V]`. Plus a real second segment: **prop firms, trading schools and brokers** buying the white-label back office `[V]`. |
| Business model | **Two-sided.** B2C freemium SaaS (Free / $19.95 / $29.95) *and* B2B white-label + REST API licensing to firms `[V]`. B2B claims **"50+ firms"** `[V]` (/back-office-reporting-for-brokers). Also an affiliate program `[V]`. No evidence of outside funding `[I]`. |
| Est. scale (users/revenue) | Self-reported: **80,000+ users worldwide, 15,000,000+ trades processed, 2,500+ system updates** `[V]` (/about counters). Those are cumulative registrations, and the free tier is real and usable, so paid conversion is likely low single-digit % `[I]`. A defensible read: **~1,500–4,000 paying subs (~$0.4–1.0M B2C ARR)** plus B2B contracts that are probably the larger and stickier half `[I]`. Only **12 Trustpilot reviews** ever `[V]` — consistent with a long-tail product that acquires by SEO rather than by community moment `[I]`. |

### Liveness signals (the opposite of Chartlog)

- Blog posts dated **2026-08-21, 2026-08-06, 2026-06-02, 2026-05-19, 2026-05-08,
  2026-04-15, 2026-03-27, 2026-03-19, 2026-01-23** — roughly monthly, all 2026 `[V]`.
- Ships genuinely new capability: **AI Assistant / AI Insights** (2026-01),
  **Verified Trading Results** (2026-03), **PWA install** (2026-05) `[V]`.
- **283-URL sitemap** including ~190 per-broker landing pages and a full blog `[V]` —
  a deliberate programmatic-SEO surface, which is exactly how a solo operator acquires
  users without a marketing budget `[I]`.
- New broker partnership announced 2026-08 (xChief) `[V]`.

## Pricing

As of 2026-09-01, from trademetria.com/pricing. Every tier includes **all asset classes** —
equities, options, futures, forex, crypto, CFDs `[V]`.

| Tier | Price | What it unlocks | Notes |
|---|---|---|---|
| **Free** | $0 | **30 orders/month**, 1 account, 3 open positions — and then the *entire* core journal: portfolio tracking, daily journal, per-trade journal, historical performance, key metrics, **Daytrader Report**, commission/fee tracking, WYSIWYG editor, **trade history calendar**, customizable dashboard, journal search, **unlimited strategy tracking**, **unlimited image uploads**, deposits/withdrawals, **buys & sells plotted on charts**, trade sharing, **challenges**, options-spread merging | The most generous free tier in the category by a wide margin `[I]`. No credit card, "start in 15 seconds" `[V]` |
| **Basic** | $19.95/mo · $169/yr ($14.10/mo, ~30% off) | 500 orders/mo, 1 account, 200 open positions. Adds: **REST API**, **PnL Simulator**, Instrument Rankings, **Distribution by Time**, **Distribution by Market Condition**, Strategy Rankings, Fundamental Research, trade export, watchlists | |
| **Pro** | $29.95/mo · $249/yr ($20.80/mo, ~30% off) | **Unlimited** orders, **50 accounts**, unlimited open positions. Adds: **Broker auto-sync**, **AI Insights**, **AI Assistant** | |
| **Business / white-label** | Not published — "Request a Demo" | Admin dashboard across all traders, per-trader dashboards, AI business intelligence, API/webhook client onboarding, risk & fraud controls, white-label branding + custom URL + multiple languages, plan/group segmentation | `[V]` |

- **Free tier / trial:** a permanent free plan *and* an extended trial. Help center adds
  that a free trial permits up to **1,000 executions** and 200 page views to evaluate `[V]`.
- **Annual discount:** ~30% on both paid tiers — the steepest in the category `[V]`.
- **Refunds:** essentially none — refunds only for unresolvable coding errors; pro-rated
  on upgrade `[V]`. Stripe + PayPal, cancel anytime, no contract `[V]`.
- **Notable paywall lines — and they are the interesting part:**
  1. **Order volume**, not features, is the primary gate (30 → 500 → unlimited). This is
     precisely calibrated: 30 orders/month is unusable for a day trader and perfectly
     adequate for a swing trader or investor. **Trademetria's free tier is a full product
     for investors and a teaser for day traders** `[I]`.
  2. **Broker auto-sync is Pro-only.** Free and Basic users upload files.
  3. **AI is Pro-only** — the newest feature is the top-tier hostage.
  4. The **REST API is Basic-tier ($19.95)**, which is remarkably cheap for programmatic
     access and is clearly the on-ramp to the B2B product `[I]`.

## Feature inventory

### Data in (import / sync)

- **194 unique brokers/platforms listed**, each with its own SEO landing page and export
  instructions `[V]` (parsed from /integrations/). Marketing copy quotes this
  inconsistently as "hundreds" (homepage), "140" (B2B page) and "1500+" (broker landing
  pages) `[V]` — the **194 in the table is the only number backed by an actual list** `[I]`.
- **Only 21 of the 194 support auto-import/sync** `[V]`: Alpaca, Bitget, Bitmex,
  Charles Schwab, E*TRADE (via Alerts), Fidelity, Interactive Brokers, Kraken, KuCoin,
  MetaTrader 4, MetaTrader 5, Moomoo, Power E*TRADE, Questrade, Robinhood, Stake,
  Tastytrade, TradeStation (via Client Center), Tradier, Tradovate, Webull.
- **The finding that matters for us: not one day-trading / prop broker has auto-sync.**
  DAS Trader, Cobra Trading, CenterPoint Securities, Lightspeed, Sterling Trader,
  Colmex Pro, CMEG, TradeZero, Takion, Apex Clearing, Rithmic Trader, Sierra Chart,
  Warrior Trading and **Prop Reports** are all **file upload only** `[V]`.
- Import paths: manual entry, Trademetria template CSV, native broker CSV, and API sync `[V]`.
- The DAS import spec is a bare-minimum CSV contract — `Time,Symb,Qty,Price,Side`, with
  the user expected to add a date column themselves `[V]` (/integrations/das-trader).
  Compare our own DAS parser, which reads the native export directly `[I]`.
- Supports importing from **Prop Reports** — the back-office reporting system many US
  prop desks actually run `[V]`. That is a smart, low-glamour integration `[I]`.

### Trade construction & data model

- Order-level ingest rolled into positions; **options spread tracking and merging** on
  every tier `[V]`.
- **Multi-account and multi-currency** by design: up to 50 accounts on Pro, and crypto
  results are explicitly *not* converted to a base currency — "if you trade in multiple
  currencies, your results will be in multiple currencies" `[V]`. A candid admission that
  the multi-asset breadth has ragged edges `[I]`.
- Tracks **non-trade cash flows as first-class data**: deposits, withdrawals, dividends,
  platform fees, custom adjustments, per-account commissions `[V]`. This is what makes it
  a *portfolio* product rather than only a *trade* product, and it is the single biggest
  data-model difference from Chartlog and from us `[I]`.
- Known reconciliation pain is documented by the vendor itself: a blog post titled
  "Why my balance is not matching my broker's statement" `[V]`.

### Core analytics & statistics

- "50+ trading metrics and reports" `[V]` (B2B page); "20+ performance metrics" on the
  B2C page `[V]` — including **profit factor, expectancy, R-multiples, win rate,
  holding times** `[V]`.
- **R-multiples are native**, both per-trade and as "total and average risk … to control
  position sizing and drawdowns" `[V]` — and R-multiple is also a column in the
  **portfolio tracker** for *open* positions `[V]`, which is genuinely unusual: most
  journals only compute R after the trade closes `[I]`.
- Named reports: **Daytrader Report** (free tier), Instrument Rankings, Strategy Rankings,
  **Distribution by Time**, **Distribution by Market Condition**, historical performance `[V]`.
- **"Compare swings vs day trades"** as an explicit analysis axis `[V]` — a direct
  consequence of the multi-asset/multi-horizon positioning.
- **PnL Simulator** (Basic+): "Test your past trades to find patterns, weaknesses and
  profitable adjustments… Compare scenarios to see which rules improve performance before
  risking money… Save simulations to track your strategy's evolution" `[V]`. This is the
  same idea as our Profitability Analysis, but **persisted and versioned over time** —
  saved simulations you can revisit `[I]`.

### Charts & visual review

- **Automatic buy/sell markers on daily, 1-minute and 5-minute charts** `[V]`.
- Coverage is explicitly bounded: **"Works with 2,500+ US stocks, global equities, FX
  pairs and major futures contracts"** `[V]`. A 2,500-symbol ceiling on US stocks means
  small caps — the exact universe a momentum day trader lives in — likely fall outside it `[I]`.
- Charts described as "fully customizable, professional-grade"; the fundamental-research
  charts are explicitly **"Powered by TradingView"** `[V]`.
- **Unlimited image uploads on every tier** `[V]` — so screenshot-based review is a
  first-class, unpaywalled path, unlike Chartlog's "forget about screenshots" stance `[I]`.
- No trade replay found `[V]`.

### Journaling, notes & tagging

- **Daily Journal** and **Individual Trade Journal** as two distinct objects, both free `[V]`.
- **WYSIWYG HTML editor** with unlimited image storage and **full-text search across
  journal entries** `[V]` — search is the feature most journals forget `[I]`.
- **Trade history calendar** free `[V]`.
- **Journal templates** — subject of a dedicated 2026-05 post `[V]`.
- Tracks "strategies, mistakes, spreads" — **mistakes are a tracked dimension**, not just
  free text `[V]`.

### Psychology / discipline / process

- Framed heavily in the marketing ("Master your discipline", "Cut emotional decisions",
  "Uncover trading psychology mistakes that silently eat into your capital") `[V]`, but
  the mechanism is:
- **Challenges** — the actual discipline feature, and it is on the **free tier** `[V]`:
  > "Set your trading rules and instantly see which ones you're passing or breaking.
  > Start, pause, or reset challenges anytime… Share challenges with other traders to
  > stay accountable" `[V]`
  A gamified, time-boxed, rule-adherence tracker with a public share link and a live
  pass/fail state per rule. There is a public sample challenge `[V]`.
- **"Track daily habits and mistakes that hold you back"** `[V]` — a mistake taxonomy.
- No quantified biometric/psych check-in (energy, tension, sleep, readiness) found `[V]`.
  Our Morning Plan psych block has no counterpart here `[I]`.

### Planning & pre-market

- **Watch lists** (Basic+) `[V]` — that is the whole of it.
- **No pre-market plan, thesis capture, conviction rating, or morning routine** `[V]`.
- Same gap as Chartlog. Across both of this batch's vendors, **pre-market planning is
  simply not a thing anyone ships** `[I]`.

### Risk & money management

- "Set stops and targets and monitor how your trades behave around them" `[V]`.
- "Review your exits to understand if you're cutting losses and managing winners
  correctly" `[V]` — an exit-quality lens, i.e. the trail-leak question our Capture
  Tracker answers.
- **Open risk per position and total portfolio risk**, plus allocation by asset class and
  trade type, in the portfolio tracker `[V]`. **Live, forward-looking risk** — not
  post-hoc analysis. Neither Chartlog nor TapeReader has this `[I]`.
- **Free futures P&L calculator** as a standalone SEO tool `[V]`.

### Playbooks / setups / rules engine

- **Unlimited strategy tracking on the free tier**, plus Strategy Rankings (Basic+) `[V]`.
- **Challenges are the de-facto rules engine** — rules are declared and evaluated
  continuously against live trading `[V]`.
- Weaker than Chartlog here: no equivalent of Rules & Rule Groups broken into market
  conditions / entry triggers / exit triggers, and no Sample Sets construct `[I]`.

### AI & automation

Pro-tier only, shipped ~2026-01 `[V]`:

- **AI Assistant** — "chat with an AI that understands your trading patterns", "your
  personal trading coach, available 24/7" `[V]`.
- **Auto-generated journal entries from your trades** `[V]` — this is the highest-value,
  lowest-friction AI application in a journal, because the blank-page problem is the
  actual reason traders stop journaling `[I]`.
- **AI Insights** — multi-variable analysis pitched explicitly as combining dimensions
  charts can't ("Which strategies perform best during the first hour?" = strategy × time
  of day; "Do I perform better with smaller size on certain strategies?" = size × strategy
  × performance) `[V]` (blog, 2026-01-23).
- **AI-powered business intelligence** on the B2B side, "AI powered with your own data" `[V]`.

### Reporting, sharing & social

**Verified Trading Results** (2026-03) is the most strategically interesting feature
either vendor in this batch has shipped `[I]`. From the vendor's own writeup `[V]`:

- Three badge states on a public profile: **Verified Account** (broker sync working, data
  unedited), **Verified Simulator Account**, and **Unverified Account** — where unverified
  means "your account lacks sync **or includes manual changes or file uploads**".
- Two granularities: **account-level verification** and **per-trade verification** (each
  trade matched against synced broker data, blue ribbon badge on the trade detail page).
- Pitched squarely at the fake-screenshot credibility crisis in trading social media.

**Why this is structurally clever, and structurally hostile to our segment `[I]`:**
it converts *auto-sync* — the thing that is expensive to build and impossible to fake —
into the moat, and makes every other journal's CSV-import path produce a visibly
second-class artifact. It also means **every DAS / Cobra / CenterPoint / Lightspeed
day trader on Trademetria is permanently Unverified**, because none of those brokers has
auto-sync. The credibility feature is unavailable to exactly the segment TapeReader serves.

Also: trade sharing on the free tier, shareable challenges, public profiles, 13-language
white-label support on B2B `[V]`.

### Mobile, integrations & platform

- **PWA, not a native app** — install instructions for iPhone and desktop published
  2026-05 `[V]`. Cheap, cross-platform, no app-store tax; also no push, no widgets `[I]`.
- **Public REST API from the $19.95 tier**, plus **webhooks** on the business tier `[V]`.
- **Fundamental research** built in: financials, earnings dates, company profiles from
  20+ global exchanges, powered by TradingView `[V]`.
- Security posture published: TLS 1.2+, irreversibly hashed passwords, daily backups via
  multiple services, semi-annual security audits, SSL Labs A+, Cloudflare `[V]`.
- Stripe + PayPal billing `[V]`. Affiliate program `[V]`.
- Extensive customization: colors, filters, widgets, templates, sharing options,
  timezones, light/dark mode; **"Over 2,000 user-requested features implemented"** `[V]`.

## What they do genuinely well

1. **They solved the survival problem, and the answer is B2B.** The white-label
   back-office for prop desks, trading schools and brokers ("50+ firms") runs on the same
   engine as the consumer app: admin dashboard across all traders, per-trader journals,
   API/CRM onboarding, risk & fraud anomaly detection, custom branding and URL, multi-language
   `[V]`. **The consumer product is simultaneously the product, the demo and the lead-gen
   for the enterprise product.** This is the single most important lesson in this file `[I]`.
2. **The free tier is a real product, volume-gated rather than feature-gated.** An
   investor or swing trader under 30 orders/month never has to pay, and gets the calendar,
   the journal, strategy tracking, challenges, charts and unlimited images. That is both
   generous and cynical: it is free for people who wouldn't have paid anyway, and useless
   for day traders, who convert `[V]`/`[I]`.
3. **Cash flows and open positions are in the data model.** Deposits, withdrawals,
   dividends, fees, cost basis, open P&L, open risk per position, allocation by asset
   class. It answers "how is my *account* doing", not just "how did that *trade* go" `[V]`.
4. **Verified Trading Results.** Turns auto-sync into a trust primitive and a viral
   surface at once `[V]`/`[I]`.
5. **Challenges.** Rule adherence as a shareable, resettable, gamified object — on the
   free tier — is the best discipline mechanic found in this batch `[V]`.
6. **Programmatic SEO at scale.** ~190 per-broker landing pages plus a steady blog is a
   one-person-sustainable acquisition engine `[V]`/`[I]`.
7. **Ten years of shipping.** 2,500+ updates, still releasing monthly in 2026 `[V]`.

## Where they are weak

**Structural:**

- **Bus factor of one.** A named single owner running a platform that 50+ firms depend
  on. Every roadmap risk, support-latency risk and acquisition risk collapses into one
  person `[V]`/`[I]`.
- **Breadth taxes depth.** Supporting equities/options/futures/forex/CFDs/crypto across
  ~190 brokers and 20+ exchanges means the per-segment experience is generic. There is no
  intraday-equity-specific vocabulary anywhere — no gap %, no ATR/ADR normalization, no
  opening-range, no relative volume, no float, no MFE/MAE-vs-stop walk. **Chartlog ships
  MFE/MAE at $14.99; Trademetria does not appear to ship it at all** `[V]` (absent from
  the full plan matrix and help) `[I]`.
- **Auto-sync coverage is the achilles heel and users say so.** 21 of 194, and the
  Trustpilot complaints are specifically about sync failing (Fidelity named) `[R]`.
  Because Verified Results is built *on top of* sync, sync flakiness now damages the
  flagship trust feature too `[I]`.
- **Chart coverage ceiling of "2,500+ US stocks"** `[V]` — likely excludes the small/micro
  caps that intraday momentum traders trade `[I]`.
- **Marketing numbers don't reconcile** — "hundreds" vs "140" vs "1500+" brokers on three
  pages of the same site `[V]`. Minor, but it is the kind of thing a solo operator can't
  keep tidy, and it undermines the numbers that *are* real `[I]`.
- **Multi-currency crypto results are not normalized** by the vendor's own admission `[V]`.

**Product gaps:**

- No pre-market planning, thesis capture or conviction rating `[V]`.
- No trade replay; no MFE/MAE; no order-aware "max R before stop" walk `[V]`/`[I]`.
- No native mobile app (PWA only) `[V]`.
- Reconciliation against broker statements is a documented recurring pain `[V]`.

## What real users say

The public review footprint is thin — **12 Trustpilot reviews total, 8 in the last 12
months, TrustScore 4.0/5** `[R]`. For an 80,000-user, decade-old product that is a strikingly
small trail, and it says something about how quietly this business operates `[I]`.

- **Praise:** "has everything I need to analyze my performance"; "the software helps me
  to be honest with my trading style"; support answered a technical question "immediately";
  dashboard design and reporting breadth `[R]` (Trustpilot). Homepage pull-quote:
  "Best trading journal in the market" `[V]` (vendor-selected). A prop-firm GM testimonial
  calls it "a strategic pillar for our operation… an elite reporting suite" — Thomas B.,
  LVL Trading `[V]` (vendor-selected, B2B).
- **Complaints:** **automatic sync unreliability is the dominant theme**, Fidelity called
  out by name, one reviewer saying it is "not ready for prime time yet" `[R]` (Trustpilot).
  Import accuracy and balance-vs-broker-statement mismatches `[R]`/`[V]`. The vendor's
  responses attribute these to broker-side data inconsistency `[R]` — plausible and also
  unfalsifiable from outside `[I]`.
- **Why people leave:** insufficient public evidence to state this confidently.
  Best inference: (a) free-tier users who never needed to convert simply stop showing up,
  and (b) traders whose broker sync doesn't work leave for a vendor whose does — sync is
  the only thing they can't work around with a CSV `[I]`.
- **Vendor's own retention evidence:** a 2018 case study claiming a client's traders
  averaged **−$203 (non/sporadic users) → +$23 (occasional) → +$30 (consistent) → +$350
  (daily active)** across 240,000 orders / $3bn traded / 70 days, ≥20 traders per group `[V]`.
  Treat as marketing: it is pure selection bias — profitable traders journal more `[I]` —
  but it is a *very* effective B2B sales artifact and they still lead with it eight years on.

## Engineer's read

- **One multi-asset, multi-currency, order-level ledger with account-level cash flows,
  and everything else is a view over it.** That choice is why they can serve investors,
  swing traders, futures traders and prop back-offices from one codebase — and equally why
  no view is deep. There is no room in a generic order table for "%ATR", "OR high",
  "prior-close location" `[I]`.
- **The B2B product is multi-tenancy + RBAC + branding over the same ledger.** Admin
  dashboard = the same aggregations grouped by trader instead of by strategy;
  white-labelling = theming + custom domain; "risk & fraud control" = anomaly rules over
  the same rows `[I]`. **Enormous leverage: the hard part was already built for consumers.**
  This is the cheapest B2B pivot available to anyone who already has a trade ledger `[I]`.
- **Verified Results is cryptographically trivial and strategically heavy.** It is a
  provenance flag: `source == broker_sync && !edited_since_import`, propagated to trade
  level by matching against the synced record. Days of engineering, and it reprices the
  entire auto-sync investment `[I]`. **We could ship the same flag on DAS CSV lineage
  cheaply** — though without broker attestation ours would mean "unedited since import",
  a weaker claim we'd have to describe honestly `[I]`.
- **Auto-sync at 21 brokers is almost certainly a mix**: direct broker APIs where they
  exist (IBKR Flex, Tradier, Alpaca, Tradovate, Schwab), an aggregator for the retail
  names (Robinhood/Webull/Moomoo/Fidelity strongly suggest SnapTrade or similar), MT4/5
  via an EA/bridge, and an **email-alert scraper for E*TRADE ("Etrade via Alerts")** `[V]`/`[I]`.
  That last one is a lovely hack and also explains why sync is flaky.
- **AI is a straightforward RAG-over-your-own-rows implementation**: the value is entirely
  in the schema being clean and complete, not in the model. Auto-generating a journal entry
  from a trade row is the highest-ROI piece `[I]`.
- **PWA over native** is the correct call for a one-person team and we should copy it `[I]`.
- **Hard to build:** the 21 auto-syncs (and keeping them working — this is a permanent
  maintenance tax, and the Trustpilot complaints are that tax being paid publicly);
  multi-currency, multi-asset instrument modelling; futures contract/multiplier reference
  data. **Easy but tedious:** ~190 CSV parsers and their 190 SEO landing pages; the report
  library; the tier gating.

**On our stack specifically:** Challenges, mistake tagging, journal search, saved
simulations, and a data-provenance/verified flag are all near-free additions — our Google
Sheets store plus `computeStats` already has the shape. The **PWA** is a genuinely small
win for the Morning Plan form (installable, works on a phone pre-open). The parts we
should *not* copy are the ones that only pay off at their breadth: multi-currency,
multi-asset, and 190 CSV parsers. Their AI journal-entry generation would sit naturally on
our edge routes, but note the edge runtime constraint — streaming an LLM call from a
Cloudflare Pages edge route is fine, storing the result back into Sheets is the slow part `[I]`.

## Ideas worth stealing

| Idea | Why it matters | dogfood/commercial | Effort |
|---|---|---|---|
| **Challenges: declare rules, live pass/fail, resettable, shareable** | The best discipline mechanic in this batch. Our Discipline % is retrospective and binary; a live challenge makes the rule visible *while* trading. Directly extends `Process Followed?` | both | **M** |
| **AI-generated draft journal entry from the trade row** | The blank page is why journaling stops. We already have every input (setup, R, MFE, MAE, gap%, catalyst, tags, the daily candle) — a draft narrative per trade is a small edge route | dogfood | M |
| **Data-provenance / "verified" flag on each trade** (imported-and-unedited vs hand-touched) | Cheap honesty mechanic. We already reconstruct trades by hand sometimes (COIN 08-24); marking those would stop us trusting reconstructed rows as if they were fills | both | **S** |
| **Saved, versioned simulations** | Our Profitability Analysis is recomputed and thrown away each time. Saving a named scenario turns it into a record of how our strategy thinking evolved | dogfood | S |
| **Full-text search across journal entries** | We have Notes in a sheet and no way to ask "every time I wrote 'chased'". Trivially valuable | dogfood | S |
| **"Mistakes" as a tracked dimension, separate from tags** | Tags are descriptive; mistakes are corrective. Splitting them makes the mistake histogram the thing you actually work on | dogfood | S |
| **Cash flows in the data model** (deposits, withdrawals, fees, adjustments) | Makes account-level return real rather than a sum of trade P&L. Prerequisite for any honest equity curve | dogfood | M |
| **Open-position risk view** (open R, total open risk, exposure by class) | Forward-looking, not post-hoc. Neither we nor Chartlog have it | dogfood | M |
| **PWA install for the Morning Plan** | Pre-market form on a phone, installable, no app store. Days, not weeks, on our Next.js stack | dogfood | S |
| **Volume-gated free tier (orders/month), not feature-gated** | Free is a full product for the low-volume user and a hard wall for the day trader. Best freemium calibration seen so far | commercial | — |
| **B2B white-label back-office over the same ledger** (prop desks, trading schools, brokers) | The answer to "can a small team survive here?" — 50+ firms, one codebase, multi-tenancy + branding + admin rollup. TapeReader's PCT Bootcamp crew is already a miniature version of this shape | **commercial** | L |
| **REST API at the cheap tier as the B2B on-ramp** | $19.95 for programmatic access is how a firm discovers you before it licenses you | commercial | M |
| **Programmatic per-broker SEO landing pages + steady blog** | ~190 pages of "how to import from X" is how one person acquires 80k users without ad spend | commercial | M |
| **Prop Reports as an integration target** | The back-office system many US prop desks actually run — a single integration that reaches a whole segment of DAS-stack traders | commercial | M |
| **Anti-pattern: publishing three different broker counts on three pages** | Undermines the numbers that are true | — | — |

## Sources

- [Trademetria — homepage (80,000+ users since 2016; AI assistant; challenges; multi-market)](https://www.trademetria.com/) — accessed 2026-09-01
- [Trademetria — Pricing (Free / Basic $19.95 / Pro $29.95, full 39-row plan matrix)](https://www.trademetria.com/pricing) — accessed 2026-09-01
- [Trademetria — Integrations (194 brokers/platforms, 21 with auto-sync)](https://www.trademetria.com/integrations/) — accessed 2026-09-01
- [Trademetria — Integrations: DAS Trader (file upload only, CSV column spec)](https://trademetria.com/integrations/das-trader) — accessed 2026-09-01
- [Trademetria — About (founder Thiago Ghilardi; 2016; 80,000+ users, 15M+ trades, 2,500+ updates)](https://www.trademetria.com/about) — accessed 2026-09-01
- [Trademetria — Trademetria for Business / back-office reporting for brokers (50+ firms, white-label, API/webhooks, AI BI)](https://www.trademetria.com/back-office-reporting-for-brokers) — accessed 2026-09-01
- [Trademetria — Help desk (asset classes, security, refunds, import limits, PWA, broker table)](https://www.trademetria.com/help) — accessed 2026-09-01
- [Trademetria — Blog index (post cadence through 2026-08)](https://trademetria.com/blog/) — accessed 2026-09-01
- [Trademetria — How to Get Verified Trading Results (badge states, account + trade verification), 2026-03-27](https://trademetria.com/blog/verified-trading-results/) — accessed 2026-09-01
- [Trademetria — AI Trading Analytics: Beyond Charts and Tables, 2026-01-23](https://trademetria.com/blog/ai-trading-analytics-beyond-charts-and-tables/) — accessed 2026-09-01
- [Trademetria — Why Trademetria Works: A 3 billion dollar case study, 2018-03-06](https://trademetria.com/blog/why-trademetria-works-a-3-billion-dollar-case-study/) — accessed 2026-09-01
- [Trademetria — How to install our progressive web app, 2026-05-08](https://trademetria.com/blog/how-to-install-our-progressive-web-app/) — accessed 2026-09-01
- [Trademetria — The 6-step process to better trade journaling, 2026-08-21](https://trademetria.com/blog/the-6-step-process-to-better-trade-jornaling/) — accessed 2026-09-01
- [Trademetria — Trademetria Partners with xChief, 2026-08-06](https://trademetria.com/blog/trademetria-partners-with-xchief/) — accessed 2026-09-01
- [Trademetria — Why my balance is not matching my broker's statement](https://trademetria.com/blog/why-my-balance-is-not-matching-my-brokers-statement/) — accessed 2026-09-01
- [Trademetria — sitemap.xml (283 URLs, ~190 broker landing pages)](https://www.trademetria.com/sitemap.xml) — accessed 2026-09-01
- [Trustpilot — Trademetria (TrustScore 4.0, 12 reviews; sync complaints)](https://www.trustpilot.com/review/trademetria.com) — accessed 2026-09-01
</content>
