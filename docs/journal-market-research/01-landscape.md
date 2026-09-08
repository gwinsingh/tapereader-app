# 01 — Landscape Sweep

**As-of: 2026-09-01** · Public sources only · No accounts created, no credentials entered
· Confidence tags per `00-method.md`: `[V]` verified on vendor's own site · `[R]` reported
by third parties · `[I]` our inference.

**Scope of this file:** breadth and structure, not depth. TradeZella, Tradervue,
TraderSync, Edgewonk, TradesViz, Chartlog and Trademetria are listed here for
completeness and price-banding only — they have dedicated vendor files.

## Reading note: the source pollution problem

The "best trading journal 2026" search surface is **almost entirely vendor-owned
content marketing**. `journalplus.co/best/…`, `lunefi.com/blog/best-…`,
`tradetanto.com/learn/best-…`, `tradelens.vip/resources/…` and
`tradingjournal.com` all publish rubric-scored "independent" roundups **that rank
their own product at or near the top** `[V]`. `tradervue.com/blog/best-trading-journal`
is a competitor listicle on a vendor domain `[V]`. Two separate "independent"
sources both scored TradeZella exactly 9.4/10, which suggests shared affiliate
copy rather than independent testing `[I]`.

A newer variant is worth naming because it targets us directly: **journali.io's
homepage claims it is "ranked #1 by Claude for trading journals"** `[V]`. That is
unverifiable marketing copy aimed at LLM-mediated discovery. Treated as data, not
evidence, per method §4.

**Consequence for this research:** listicles were used only to *discover vendor
names*. Every price and feature claim below tagged `[V]` was read on the vendor's
own site on 2026-09-01. Where only third-party pricing exists it is tagged `[R]`.

The least-conflicted third-party source found was **StockBrokers.com** (updated
2026-08-25, named research lead, stated methodology) `[V]` — though its TradeZella
price is already stale (see Pricing section).

---

## 1. Full vendor roster

**Tier key**
- **Primary** — a serious, funded, actively-developed product a US retail trader
  would realistically shortlist; direct competitor to anything we ship.
- **Secondary** — real product, real users, but narrower reach, newer, or weaker distribution.
- **Niche** — deliberately serves one asset class, one platform, or one form factor.
- **Stalled/dying** — no visible development, dead-end pricing, or superseded `[I]`.

### 1a. Incumbents (covered in depth by other agents — listed, not detailed)

| Product | URL | Age | Asset focus | Price band | Positioning (one line) | Tier |
|---|---|---|---|---|---|---|
| TradeZella | tradezella.com | Launched early 2022 `[R]` | Stocks, options, futures, forex, crypto | $35–99/mo; $315–891/yr `[V]` | Creator-led all-in-one journal + backtester + AI agent; the category's marketing gravity well | **Primary** |
| Tradervue | tradervue.com | Founded 2011 `[R]` | Stocks, options, futures, forex | Free tier; $29.95 Silver / $49.95 Gold per mo `[V]` | The old-guard analytics workhorse; MFE/MAE and exit-quality depth, no AI, no replay `[R]` | **Primary** |
| TraderSync | tradersync.com | ~2016 `[R]` | Stocks, options, futures, forex, crypto | $29.95 / $49.95 / $79.95 per mo `[R]` | Broadest broker-import coverage (claims 700+) plus "Cypher" AI, metered by tier | **Primary** |
| TradesViz | tradesviz.com | ~2020 `[R]` | Stocks, options, futures, forex, crypto, CFDs | Free tier; Pro C$26.99/mo, Platinum C$37.49/mo (≈US$20/$27) `[V]` | Analytics maximalist — 600+ stats, 100+ charts, best free tier in the category | **Primary** |
| Chartlog | chartlog.com | Founded 2019 `[R]` | US equities/options day trading | $14.99 Lite / $39.99 Pro per mo `[R]` | Clean, fast, US-equity day-trader-native; narrowest scope of the incumbents | **Secondary** |
| Edgewonk | edgewonk.com | ~2014 `[R]` | Multi-asset, forex-leaning | $197 per 16 months, single tier `[V]` | Psychology-first journal; "Edge Finder"; the only major non-monthly incumbent | **Secondary** |
| Trademetria | trademetria.com | ~2011 `[R]` | Equities, options, futures, forex, crypto, CFDs | Free; $19.95 Basic / $29.95 Pro per mo `[V]` | Journal + portfolio/back-office accounting hybrid; the affordability pick | **Secondary** |

> Note: TradesViz prices in **Canadian dollars** `[V]` — a detail every comparison
> article gets wrong, and it makes them ~25% cheaper in USD than the listicles imply `[I]`.

### 1b. Newer entrants, 2024–2026

This is where the roster in most published roundups is badly stale. The pattern:
**futures/prop-firm-native, AI-coach-forward, and often lifetime-priced.**

| Product | URL | Age | Asset focus | Price band | Positioning (one line) | Tier |
|---|---|---|---|---|---|---|
| **Tanto** | tradetanto.com | 2024–25 `[I]` | Futures, prop firms; multi-asset | $13.99 / $24.99 / $39.99 per mo; 20% annual `[V]` | Futures- and prop-firm-native journal; 35+ brokers *and prop firms* incl. Tradovate, Rithmic, TopstepX, Apex, FTMO `[V]` | **Primary (in futures)** |
| **JournalPlus** | journalplus.co | Public launch April 2025 `[R]` | Multi-asset, universal CSV | **$159 one-time lifetime** (₹6,599) `[R]` | AI journal sold as a lifetime licence explicitly to undercut $30–80/mo SaaS; India-built, global sell `[R]` | **Secondary** |
| **Journali** | journali.io | 2025–26 `[I]` | Futures, options, stocks, forex | Free (6 trades); **$8/wk Pro, $10/wk Premier** `[V]` | "Discipline engine" — pre-trade gate (*TradeCheck*), AI coach, prop-firm rule mode; 30+ brokers, 10+ prop firms `[V]` | **Secondary** |
| **Lune** | lunefi.com | 2025 `[I]` | Futures, prop firms | ~$39/mo, free when bundled with other Lune products `[R]` | Real-time sync from 100+ futures prop firms via Rithmic/ProjectX/Tradovate; labels copied vs. manual trades `[R]` | **Secondary** |
| **TradersForge** | tradersforge.net | 2026 `[V]` | Futures, prop firms | Pro from $10/mo; 14-day Elite trial `[V]` | Futures-first journal with native prop-firm drawdown tracking + AI reviews; 13 brokers/firms `[V]` | **Secondary** |
| **Trade Journal AI** | tradejournal.ai | 2025–26 `[I]` | Crypto + futures first | $19.95/mo or $195/yr, single tier; +$9.95/mo unlimited AI `[V]` | Crypto-native AI coach that "reads every entry, not just every trade"; syncs Bitunix, Hyperliquid, Binance, Bybit, OKX `[V]` | **Niche** |
| **Tradoshi** | tradoshi.com | Web + **Android launch 2026-08-27** `[V]` | Multi-asset, prop/evaluation focus | Free; premium from $19.99/mo `[R]` | Pre-session check-in + rule monitoring + AI coach that recommends a daily position size; tracks multiple evaluations side-by-side `[V]` | **Niche** |
| **Scope360** | scope360.io | 2024 (App Store) `[R]` | Crypto futures, forex | Free Starter; $20/mo Basic; $45/mo Pro `[V]` | Mobile-first automated journal; exchange-API sync, emotion-based alerts, team seats `[V]` | **Niche** |
| **FreeTradeJournal** | freetradejournal.com | 2025–26 `[I]` | Forex, futures, indices | Free tier; **Lifetime Pro $199** (promo) `[V]` | Free journal + prop-firm dashboard (FTMO/Apex/TopStep/20+); **monetised by prop-firm affiliate revenue** `[V]` | **Niche** |
| **TraderInsight.pro** | traderinsight.pro | 2025–26 `[I]` | Futures, prop firms | Not published `[V]` | Prop-firm rule-adherence tagging; imports TopstepX, Tradovate, FTMO `[R]` | **Niche** |
| **TradeLens** | tradelens.vip | 2025–26 `[I]` | Multi-asset | Not verified (site 403s to fetch) `[V]` | Journal fronted by a large SEO comparison library; content-led acquisition | **Niche** |
| **Traders Second Brain (TSB)** | traderssecondbrain.com | 2025–26 `[I]` | Multi-asset | **$299 one-time** `[V]` | Notion-native "second brain": journal + analytics + daily review + AI coaching, sold as a template product not SaaS `[V]` | **Niche (spreadsheet-adjacent)** |
| **Tradonite** | tradonite.com | 2025–26 `[I]` | Multi-asset | $7.99/mo `[R]` | Cheapest credible AI journal; discipline/consistency framing `[R]` | **Niche** |
| **TraderCater** | tradercater.com | 2025–26 `[I]` | Multi-asset | $7.99/mo `[R]` | AI journal + analytics, budget tier `[R]` | **Niche** |
| **TradeResona** | traderesona.com | 2025–26 `[I]` | Multi-asset | Free tier; $12/mo premium `[R]` | AI-assisted analytics/journal `[R]` | **Niche** |
| **Madlytics** | madlytics.com | 2025–26 `[I]` | Multi-asset | $10/mo `[R]` | Journal + analytics, minimal differentiation `[R]` | **Niche** |
| **TradeSave+** | tradesaveplus.com | 2024–26 `[I]` | FX, indices, commodities, crypto | $24.99/mo `[R]` | Journal **merged with a macro-research workspace** — unusual combination `[R]` | **Niche** |
| **WealthBee** | wealthbee.io | ~2023–24 `[I]` | Options-leaning multi-asset | ~$35/mo `[R]` | Journal + portfolio insights for options sellers `[R]` | **Niche** |
| **TradeChainly** | tradechainly.com | 2025–26 `[I]` | Crypto | $17.99/mo billed annually `[R]` | Crypto-only activity tracking + journal `[R]` | **Niche** |
| **TradeZap** | tradezap.app | 2026 `[I]` | Multi-asset | Not verified | Positions itself explicitly against TraderSync pricing `[R]` | **Niche** |
| **TradeBook** | — | 2025–26 `[I]` | Multi-asset | Not verified | Named only in competitor comparison pages; existence not independently confirmed `[R]` | **Unconfirmed** |

### 1c. Mobile-first journals (App Store / Play native)

A distinct and under-analysed cohort — these compete on *logging friction*, not analytics `[I]`.

| Product | URL | Asset focus | Price band | Positioning | Tier |
|---|---|---|---|---|---|
| UltraTrader | ultratrader.app | Stocks, crypto, futures, forex, options | Free Basic; **$9/mo billed annually** Premium `[V]` | Best-in-class free mobile tier; broker sync, replay, Telegram integration behind Premium `[V]` | **Secondary** |
| SuperTrader | supertrader.me | Stocks, forex, crypto, options | Freemium `[R]` | All-in-one mobile tracker; also runs a comparison content site `[R]` | **Niche** |
| AccuTrader | App Store id6449833706 | Multi-asset | Freemium `[R]` | Mobile journal, pattern/trend surfacing `[R]` | **Niche** |
| Trading Journal: TrackIt | App Store id6743252790 | Multi-asset | Freemium `[R]` | Lightweight mobile logging `[R]` | **Niche** |
| kinfo | kinfo.com | Stocks | Free `[R]` | Journal + **verified public track record / social leaderboard** — the community-first archetype `[R]` | **Stalled** `[I]` |

### 1d. Free / donation / loss-leader

| Product | URL | Price | Notes | Tier |
|---|---|---|---|---|
| Stonk Journal | stonkjournal.com | Free, donation-supported `[R]` | Ranked #4 and "best free" by StockBrokers.com 2026-08-25 `[V]` | **Secondary (free)** |
| TraderWaves | traderwaves.com | Free `[R]` | Forex/crypto/futures/equities, full feature set claimed free `[R]` | **Niche** |
| TradeBench | tradebench.com | Free `[R]` | Long-lived free journal + risk/planning; dated UI `[R]` | **Stalled** `[I]` |
| StockCal | — | Free `[R]` | Minimal logging app `[R]` | **Stalled** `[I]` |

### 1e. Legacy / stalled / probably dying `[I]`

Judgement basis: one-time desktop pricing with no visible modern development, or
presence only in aggregator directories with no current marketing footprint.

| Product | Price | Why flagged |
|---|---|---|
| TradingDiary Pro | $149 one-time `[R]` | Desktop-era, perpetual licence, no cloud/AI story `[I]` |
| MaxProfit | $20.92 one-time `[R]` | Strategy tester with journal bolted on `[I]` |
| Tradiry | $20/mo `[R]` | No visible marketing presence outside directories `[I]` |
| Utluna | $25/mo `[R]` | Portfolio analytics, journal is incidental `[I]` |
| AntSignals | €12.90/mo `[R]` | EU-only footprint, minimal US presence `[I]` |
| Improve Your Trade | $15/mo `[R]` | **NinjaTrader 8 only** — single-platform dependency `[I]` |
| OptionIncome | $19/mo `[R]` | Options-only analytics niche `[I]` |
| Journalytix | bundled `[R]` | Historically bundled with a trading-education/futures community; little independent signal `[I]` |
| kinfo | Free `[R]` | Social/verified-track-record model appears to have not taken; last visible momentum years old `[I]` |

### 1f. Adjacent, not competitors (yet)

- **Broker-native analytics** — the important finding is how *weak* these are.
  tastytrade has trade history, P&L and live Greeks but **no journaling at all**:
  no pre-trade notes, no post-trade review, no strategy tags `[R]`. Webull,
  thinkorswim and TradingView have no native journal; they appear in this
  category only as *import sources* `[R]`. **Brokers have conceded this
  category** `[I]` — the risk is a broker annexing it later, not competing today.
- **Prop firms** — FTMO's and Topstep's own dashboards show account state
  (drawdown, targets) but **not trade-by-trade analytics** `[R]`. This gap is the
  single largest driver of the 2024-26 entrant wave `[I]`.
- **FX Replay, Myfxbook** — replay/backtest and portfolio-tracking tools that
  journals get compared against but which do not journal `[R]`.

---

## 2. Serious spreadsheet & template alternatives

This section matters disproportionately to us: **TapeReader's journal is itself
Google-Sheets-backed.** The people who choose sheets are not a competitor's users
we must convert — they are plausibly our *natural first users* `[I]`.

### The paid spreadsheet market

| Product | Price | Model | Notes |
|---|---|---|---|
| **Trading Journal Spreadsheet (TJS)** | **$149.95 one-time** `[R]` | Excel workbook (importable to Google Sheets) | **Sold since 2007**, "thousands of traders in nearly 100 countries" `[V]`. Editions for stocks, options, futures, forex, spread betting, CFD, crypto `[V]`. 30+ metrics, expectancy, drawdown, position-size and milestone sheets `[R]`. The category's anchor spreadsheet product. |
| **Traders Second Brain (TSB)** | **$299 one-time** `[V]` | Notion workspace | Journal + analytics + daily review + AI coaching + live widget embeds `[V]`. The most expensive template product found — and priced *above* a year of most SaaS entry tiers `[I]`. |
| SpreadsheetsHub trading journals | ~$5–$25 `[R]` | Excel/Sheets templates | Commodity end of the market |
| Gumroad template economy | ~$5–$30 `[R]` | Notion/Sheets | Large, fragmented creator long tail (multiple sellers surfaced in every search) `[V]` |
| Notion Marketplace templates | **Mostly free** `[V]` | Notion | Top free template (by Ashwani) has 4.85★ across 700+ ratings `[R]` — the free tier of this segment is genuinely good |
| Vendor lead-magnet templates | Free `[V]` | Excel/Sheets | TradeZella and StockBrokers.com both publish free templates as top-of-funnel `[V]` |

### A notable health signal

**TJS has migrated direct purchase/download to Etsy** `[V]` — its own purchase
page now carries a notice redirecting buyers there. For a 19-year-old product
with a registered trademark, outsourcing checkout to Etsy reads as
de-investment rather than growth `[I]`. Separately, TJS Elite v7/v8 appear on
numerous file-sharing and "download" sites `[V]` — heavy piracy is both a demand
signal and a reason one-time spreadsheet pricing is hard to defend `[I]`.

### Why people actually choose spreadsheets over SaaS

Reasons found across vendor pages, template marketplaces and roundups:

1. **No recurring cost.** TJS markets "no log-ins, subscriptions or recurring
   charges… one easy payment" `[V]`. Against a $360–1,188/yr SaaS bill this is
   the whole pitch.
2. **Data ownership and portability.** The file is yours; no vendor lock-in, no
   account to lose, works offline `[I]`.
3. **Total customisability.** Discretionary traders track idiosyncratic fields
   (setup taxonomies, conviction, market context) that SaaS schemas won't model.
   This is precisely why TapeReader's sheet has 75 columns `[I]`.
4. **Privacy.** No upload of full trade history to a third party `[I]`.
5. **Zero onboarding.** Works on any device, in a browser, immediately `[V]`.

**And why they leave:** manual entry cost scales linearly with trade count, and
analytics "either take hours to wire up or never get built" `[V]` (UltraTrader's
framing — self-serving, but correct `[I]`).

> **Strategic read `[I]`:** the spreadsheet crowd's stated objections are
> *recurring cost, data ownership, and schema rigidity* — and their one real pain
> is *manual entry plus absent analytics*. TapeReader's existing architecture
> (broker CSV → automatic round-trip grouping → their own Google Sheet, with
> Polygon enrichment computed for them) resolves the pain **without** triggering
> any of the three objections. That is a genuinely unoccupied position, and it is
> the most commercially interesting finding in this sweep. See `04-product-thesis.md`.

---

## 3. Category structure — proposed market map

Nine archetypes. Most products sit primarily in one and lean into a second.

| # | Archetype | The promise | Who sits here | Health |
|---|---|---|---|---|
| 1 | **Analytics-maximalist** | "Every statistic that exists, about your trading" | TradesViz (600+ stats), Tradervue Gold, Trademetria | Mature, crowded, commoditising `[I]` |
| 2 | **All-in-one / creator-led** | "One subscription replaces your journal, backtester and coach" | TradeZella | Dominant on distribution, not on features `[I]` |
| 3 | **Psychology-first** | "Your problem is you, not your strategy" | Edgewonk, Tradoshi, Journali (*TradeCheck*), Scope360 (emotion alerts) | Small but the most defensible narrative `[I]` |
| 4 | **Broker-sync-first** | "It just appears; you never type" | TraderSync (700+ brokers), Lune, Tanto | Integration count is the moat — expensive to build, easy to describe `[I]` |
| 5 | **Prop-firm-native** | "Track the *evaluation*, not just the trades" | Tanto, TradersForge, Lune, Journali, Tradoshi, FreeTradeJournal, TraderInsight, TradesViz prop module | **The hot segment of 2024-26** `[I]` |
| 6 | **Crypto/exchange-native** | "Your CEX and perps, journaled properly" | Trade Journal AI, Scope360, TradeChainly | Structurally separate buyer; low overlap with equities `[I]` |
| 7 | **Mobile-first** | "Log it in ten seconds from your phone" | UltraTrader, SuperTrader, AccuTrader, TrackIt, Scope360 | Under-served by the incumbents, whose apps are afterthoughts `[I]` |
| 8 | **Spreadsheet/template-native** | "Own your file, pay once" | TJS, TSB, Notion/Gumroad long tail | Large, quiet, price-anchored, poorly served `[I]` |
| 9 | **Free / affiliate-funded** | "Free forever — we're paid by someone else" | FreeTradeJournal (prop-firm affiliate revenue `[V]`), Stonk Journal (donations), TraderWaves | Emerging and structurally disruptive to $30/mo pricing `[I]` |

### Where the empty spaces are `[I]`

1. **Plan-versus-execution measurement.** Almost everyone journals *what
   happened*. Almost nobody measures **adherence to a pre-committed plan** as a
   first-class, filterable metric. Journali's *TradeCheck* pre-trade gate and
   Tradoshi's pre-session check-in are the only genuine attempts found, and both
   are gates rather than *scored measurement after the fact*. TapeReader already
   ships Morning Plan → Origin (Watchlist/Callout/Intraday-discovery) →
   Discipline % — which is this exact gap, already built.
2. **Deep market-context enrichment per trade.** No vendor found advertises
   automatically attaching gap %, ATR/ADR, RVOL, VWAP distance, opening-range
   stats, SMA distance, float, and index direction to every trade. Journals
   record *your* data; almost none enrich it with *the market's*. This is the
   sharpest technical differentiator TapeReader already has.
3. **Exit-quality / trail-leak analytics.** Only Tradervue Gold (MFE/MAE, Max
   Potential P&L, exit analysis) `[V]` and TradesViz ("Exit Insights") `[V]`
   compete here. It is the highest-value analysis in the category and it is
   thinly occupied.
4. **Own-your-data professional tooling.** Nobody sells a *serious* journal where
   the store is the user's own file. Segment 8 wants this and only gets amateur
   tooling; segments 1–5 offer sophistication only in exchange for lock-in.
5. **Discretionary US equity intraday specialists.** The 2024-26 wave went
   almost entirely to futures/prop. Chartlog is the lone equity-day-trading
   specialist and it is the least-invested incumbent `[I]`. The original core
   segment has been *vacated*, not saturated.

---

## 4. Pricing bands

All monthly unless noted. `[V]` = read on vendor site 2026-09-01.

| Band | Price | Products |
|---|---|---|
| **Free tier** | $0 | Tradervue Free (30 trades/mo `[V]`), TradesViz Basic (3,000 executions/mo, stocks only `[V]`), Trademetria Free (30 orders/mo `[V]`), Scope360 Starter (20 trades/wk `[V]`), Journali Free (6 trades `[V]`), UltraTrader Basic `[V]`, FreeTradeJournal `[V]`, Stonk Journal, TraderWaves, TradeBench |
| **Budget** | $8–15 | Tradonite $7.99 `[R]`, TraderCater $7.99 `[R]`, UltraTrader $9 (annual) `[V]`, TradersForge from $10 `[V]`, Madlytics $10 `[R]`, TradeResona $12 `[R]`, Tanto Starter $13.99 `[V]`, Chartlog Lite $14.99 `[R]` |
| **Entry/mid** | $17–25 | TradeChainly $17.99 `[R]`, Trademetria Basic $19.95 `[V]`, Trade Journal AI $19.95 `[V]`, Tradoshi $19.99 `[R]`, TradesViz Pro ≈US$20 `[V]`, Scope360 Basic $20 `[V]`, Tanto Pro $24.99 `[V]`, TradeSave+ $24.99 `[R]`, TradesViz Platinum ≈US$27 `[V]` |
| **Modal / "standard"** | **$29–35** | **Tradervue Silver $29.95** `[V]`, **TraderSync Pro $29.95** `[R]`, **Trademetria Pro $29.95** `[V]`, TradeZella Essential $35 `[V]`, WealthBee ~$35 `[R]` |
| **Pro** | $39–60 | Lune ~$39 `[R]`, Chartlog Pro $39.99 `[R]`, Tanto Advanced $39.99 `[V]`, Scope360 Pro $45 `[V]`, Tradervue Gold $49.95 `[V]`, TraderSync Premium $49.95 `[R]`, TradeZella Pro $59 `[V]` |
| **Ceiling** | $75–99 | TraderSync Elite $79.95 `[R]`, **TradeZella Ultra $99** `[V]` |
| **Annual-only licence** | — | Edgewonk **$197 per 16 months** (single tier, "lock in your price for life") `[V]` |
| **Lifetime / one-time** | $149–299 | TJS $149.95 `[R]`, TradingDiary Pro $149 `[R]`, **JournalPlus $159 lifetime** `[R]`, **FreeTradeJournal Lifetime Pro $199** (promo) `[V]`, **TSB $299** `[V]` |
| **Weekly billing (outlier)** | $8–10/wk | Journali Pro $8/wk, Premier $10/wk `[V]` — ≈$416–520/yr, i.e. *above* TradeZella Pro annual while appearing cheap `[I]` |

**Modal price point: $29.95/month.** Three of the seven incumbents land on that
exact figure `[V]`. It is the category's reference price and any pricing decision
we make is read against it `[I]`.

**Ceiling: $99/month** (TradeZella Ultra) `[V]`. Annual ceiling ≈$891 `[V]`.
Nothing credible sells above ~$100/mo to retail.

**Effective annual spend for a serious retail trader: $315–600** `[V]`.

### Pricing observations `[I]`

- **AI is now the metering axis.** TradeZella tiers on *AI credits* (500 /
  1,500 / 3,000/mo) `[V]`; TraderSync tiers on *AI messages per day* (~5 / ~15 /
  full) `[R]`; Trade Journal AI sells an explicit $9.95/mo unlimited-AI add-on
  `[V]`. Two years ago tiers metered accounts and imports. **Inference token cost
  is now visibly passed to the customer** — relevant to our own build economics.
- **TradeZella has repriced upward.** StockBrokers.com (2026-08-25) lists
  TradeZella at $29/mo `[V]`; the vendor's own pricing page on 2026-09-01 shows
  $35/$59/$99 `[V]`. Either a very recent restructure or a stale third-party
  figure — either way, **it confirms method §4: third-party pricing decays within
  weeks** `[I]`.
- **The lifetime tier is a real attack vector.** JournalPlus ($159) and
  FreeTradeJournal ($199) both explicitly position lifetime pricing against
  monthly SaaS `[R]`/`[V]`. Combined with the free-tier expansion, there is
  visible **downward pressure on the $29.95 anchor** `[I]`.
- **Free tiers got materially better.** TradesViz's free tier (3,000
  executions/mo) `[V]` is more capable than several paid competitors. Free is
  now a customer-acquisition weapon, not a demo `[I]`.
- **A new monetisation model exists: prop-firm affiliate revenue.**
  FreeTradeJournal states outright that it monetises through prop-firm affiliate
  partnerships rather than subscriptions `[V]`. Prop-firm referral fees are large
  enough to fund a free product — which structurally undercuts subscription
  pricing in segment 5 `[I]`.

---

## 5. Consolidation & health signals

### Confirmed M&A

- **SureSwift Capital acquired Tradervue** — closed September 2020, announced
  2021-03-30, undisclosed sum `[R]`. Founder Greg Reinacker launched it in 2011;
  100,000+ traders at acquisition `[R]`. It was SureSwift's **first acquisition
  in the trading vertical** `[V]`.
- **Tradervue post-acquisition performance:** TTM EBITDA grew **73%**, from
  ~$826k (Sept 2020) to ~$1,432k (Dec 2023) `[R]`. This is the only hard
  profitability datapoint found for the whole category, and it is a good one:
  **a single trading journal throws off ~$1.4M EBITDA** `[R]`. It also implies
  the category is profitable at modest scale — attractive to bootstrappers,
  unattractive to VCs `[I]`.
- **Tradervue appears to have been sold on by SureSwift.** Its SureSwift
  portfolio page renders a "Tradervue — Founded / Sold" card `[V]`, though the
  sale year and acquirer fields did not render and no announcement was found.
  **Unconfirmed — flag for `07-open-questions.md`** `[I]`.

### Funding

- **TradeZella is bootstrapped.** Crunchbase shows no funding rounds `[R]`;
  company-affiliated messaging says "zero funding, zero ads" `[R]`. Founded by
  trader/educator **Umar Ashraf**, launched early 2022, covered by Fast Company
  `[R]`. A LinkedIn claim of **crossing $16M ARR** was found `[R]` — **single
  self-reported source, treat with suspicion**, but even discounted heavily it
  implies the category leader is meaningfully larger than Tradervue `[I]`.
- **No venture funding was found for any other journal vendor.** This is a
  **bootstrapper's category**: no rounds, no unicorns, no consolidator besides
  SureSwift `[I]`.

### Growth / vitality signals

- **A visible 2024-26 entrant wave**, heavily concentrated in prop-firm and
  AI-coach positioning: Tanto, Lune, TradersForge, Journali, Tradoshi,
  JournalPlus, Trade Journal AI, FreeTradeJournal, TraderInsight, TradeLens,
  TradeZap, plus a long budget tail (Tradonite, TraderCater, TradeResona,
  Madlytics) `[V]`. **Barriers to entry have collapsed** — AI coding plus
  aggregated broker APIs (Rithmic/Tradovate/ProjectX/SnapTrade) mean a credible
  journal is now a small-team build `[I]`.
- **Tradoshi shipped Android on 2026-08-27** `[V]` — the most recent verifiable
  product launch in the sweep, and evidence the wave is still cresting.
- **TradeZella restructured into three AI-metered tiers** `[V]` — the leader is
  actively repricing, not coasting `[I]`.
- **Edgewonk still ships and still refuses monthly billing** ($197/16mo, "weekly
  product updates", "2026" branding) `[V]`. Deliberately counter-positioned `[I]`.
- **TradesViz ran a 30% promo (2026-08-31 → 09-11)** `[V]` — active pricing
  experimentation.

### Stall / decline signals

- **TJS moved checkout to Etsy** `[V]` — de-investment in a 2007-vintage product `[I]`.
- **Chartlog served an invalid TLS certificate** when fetched on 2026-09-01
  (`unable to verify the first certificate`) `[V]`. Third-party reviews from
  Mar–Jun 2026 confirm it is operating and priced `[R]`, so it is not dead — but
  an expired/misconfigured certificate on your marketing site is an
  under-maintenance tell `[I]`. It is also the incumbent most exposed to the
  vacated equity-day-trading segment.
- **Aggregator-only long tail.** Tradiry, Utluna, Madlytics, StockCal, MaxProfit,
  TradingDiary Pro appear in Slashdot/SourceForge directories with essentially no
  independent marketing or community footprint `[V]` — the standard shape of a
  dying SaaS `[I]`.
- **kinfo's verified-track-record/social model has not compounded** `[I]` —
  community-first (archetype 11 in earlier framings) is the one archetype with no
  healthy occupant, which is itself informative.
- **No shutdowns confirmed.** Journalytix and kinfo both still resolve `[R]`.
  Products in this category appear to *fade* rather than announce closure `[I]`.

### Where the category is heading `[I]`

1. **Prop-firm-native is where the growth is**, because the prop firms themselves
   refuse to build trade-level analytics `[R]` and their affiliate programmes
   fund customer acquisition `[V]`.
2. **AI coaching has gone from differentiator to table stakes in ~18 months** —
   and is being metered as a cost line, not given away `[V]`.
3. **Price is under attack from two sides simultaneously**: lifetime licences
   ($159–299) and affiliate-funded free tiers. The $29.95 anchor is not safe `[I]`.
4. **Consolidation is minimal and the buyer pool is tiny** (one known
   micro-PE acquirer). Anyone building here should assume they operate it, not
   sell it `[I]`.
5. **The original segment — discretionary US equity intraday — has been
   vacated** while everyone chased funded-futures traders. That is either a
   market signal that the segment is shrinking, or an opening. Resolving which
   is the key question for `04-product-thesis.md` `[I]`.

---

## Sources

Accessed 2026-09-01 unless noted. Vendor-own sources are marked `[own]`;
affiliate/vendor-authored comparison content is marked `[affiliate — discovery only]`.

**Vendor sites (primary, verified)**
1. https://www.tradezella.com/pricing `[own]`
2. https://www.tradervue.com/site/pricing/ `[own]`
3. https://www.tradervue.com/ `[own]`
4. https://www.tradesviz.com/pricing `[own]`
5. https://www.tradesviz.com/prop-firm-journal/ `[own]`
6. https://edgewonk.com/ `[own]`
7. https://edgewonk.com/pricing `[own]`
8. https://trademetria.com/pricing `[own]`
9. https://tradetanto.com/ `[own]`
10. https://tradetanto.com/pricing `[own]`
11. https://tradejournal.ai/ `[own]`
12. https://journali.io/ `[own]`
13. https://journali.io/propfirms/ `[own]`
14. https://www.freetradejournal.com/ `[own]`
15. https://www.freetradejournal.com/prop-firm-dashboard `[own]`
16. https://scope360.io/pricing/ `[own]`
17. https://scope360.io/ `[own]`
18. https://app.tradersforge.net/guides/topstep-journal `[own]`
19. https://trading-journal-spreadsheet.com/ `[own]`
20. https://trading-journal-spreadsheet.com/purchase-download/ `[own]`
21. https://trading-journal-spreadsheet.com/tjs-elite/ `[own]`
22. https://traderssecondbrain.com/guides/trading-journals `[own]`
23. https://blog.ultratrader.app/top-5-free-notion-trading-journal-templates/ `[own]`
24. https://traderinsight.pro/for/prop-firms `[own]`
25. https://tradersync.com/trading-journal/ `[own]`
26. https://trademetria.com/ `[own]`
27. https://kinfo.com/trading-journal/ `[own]`
28. https://journalytix.me/ `[own]`
29. https://traderwaves.com/ `[own]`
30. https://www.tradezella.com/tools/trading-journal-template `[own]`
31. https://chartlog.com/ `[own]` — *TLS certificate validation failed on fetch*

**Ownership, funding, company**
32. https://www.crunchbase.com/acquisition/sureswift-capital-acquires-tradervue--036faba3
33. https://www.sureswiftcapital.com/blog/tradervue-acquisition
34. https://www.sureswiftcapital.com/portfolio/tradervue
35. https://www.crunchbase.com/organization/tradezella
36. https://www.fastcompany.com/91212604/built-by-one-of-their-own-tradezella-lets-day-traders-track-and-plan-transactions
37. https://tracxn.com/d/companies/tradezella/
38. https://www.openpr.com/news/4615269/tradoshi-ltd-releases-its-ai-assisted-trading-journal — Tradoshi Android launch, 2026-08-27

**Third-party directories and reviews**
39. https://slashdot.org/software/trading-journals/ — 25-product long-tail directory with list prices
40. https://sourceforge.net/software/trading-journals/integrates-with-webull/
41. https://sourceforge.net/software/product/Chartlog/
42. https://www.stockbrokers.com/guides/best-trading-journals — updated 2026-08-25, stated methodology
43. https://www.stockbrokers.com/education/trading-journal-excel-spreadsheet
44. https://bullishbears.com/chartlog-review/
45. https://bullishbears.com/tradersync-review/
46. https://tradingsfx.com/blog/tradersync-pricing
47. https://www.globaltradingtools.com/software/trading-journal-spreadsheet/

**App stores**
48. https://apps.apple.com/us/app/ultratrader-trading-journal/id1615206113
49. https://apps.apple.com/us/app/supertrader-trading-journal/id1601101836
50. https://apps.apple.com/us/app/accutrader-trading-journal/id6449833706
51. https://apps.apple.com/app/id6743252790 — Trading Journal: TrackIt
52. https://play.google.com/store/apps/details?id=com.scope.futures
53. https://apps.apple.com/us/app/kinfo-trading-journal/id1220075825

**Templates / spreadsheets**
54. https://www.notion.com/templates/free-trading-journal
55. https://notiontradingjournal.com/blog/best-trading-journal-template/
56. https://tradingjournaltemplates.com/
57. https://spreadsheetshub.com/collections/trading-journals

**Affiliate / vendor-authored roundups — used for vendor discovery only, not as evidence**
58. https://journalplus.co/ and https://journalplus.co/best/* `[affiliate]`
59. https://lunefi.com/blog/* `[affiliate]`
60. https://tradingjournal.com/blog/best-trading-journals `[affiliate]`
61. https://www.tradelens.vip/resources/best-trade-journal-apps `[affiliate]`
62. https://www.tradervue.com/blog/best-trading-journal `[affiliate]`
63. https://tradeciety.com/best-online-trading-journals `[affiliate]`
64. https://proptradingvibes.com/blog/best-trading-journal-software `[affiliate]`
65. https://tradeify.co/post/best-trading-journals-2026 `[affiliate]`
66. https://tradespad.com/blog/tradersync-review `[affiliate]`
67. https://tradezap.app/blog/tradezap-vs-tradersync `[affiliate]`
68. https://www.tradezella.com/blog/prop-firm-trading-journal `[affiliate]`

## Open items handed to `07-open-questions.md`

1. Did SureSwift sell Tradervue, when, and to whom? Portfolio page implies a sale
   but renders no year or acquirer.
2. TradeZella's real ARR — the $16M figure is single-source and self-reported.
3. TradeLens, TradeZap, TradeBook, Tradonite, TraderCater, TradeResona and
   Madlytics pricing could not be read on vendor sites (403s, or directory-only
   listings). Some may not be real operating products.
4. Chartlog's actual development status — priced and reviewed, but a broken TLS
   cert and no visible changelog. Needs a direct look.
5. Whether the discretionary US-equity intraday segment is genuinely shrinking or
   merely unfashionable. This determines the product thesis.
