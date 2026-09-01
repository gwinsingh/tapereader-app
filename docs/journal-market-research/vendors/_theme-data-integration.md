# Theme — Data & Integration Layer

**As of:** 2026-09-01 · **Persona:** Engineer (per `00-method.md` §2) · **Tier:** cross-cutting theme
**Scope:** engineering feasibility and cost-to-serve. Business model and pricing bands are covered
separately in `_theme-business-model.md` — this file deliberately does not duplicate them, except
where a licence *price* is itself the engineering constraint.

**Rules of evidence:** public sources only. No accounts created, no credentials entered, no trials
started. Claims tagged `[V]` verified on a primary source with URL, `[R]` reported by a third party,
`[I]` our inference. Every price and limit below carries an as-of date of **2026-09-01** and should
be re-verified before it drives a spend decision.

**Built on (established elsewhere, not re-derived):**
- TraderSync's "700+ brokers" is ~73 autosync connectors collapsing to ~40 distinct adapters once
  MetaTrader (31 brokers, one adapter) and PropReports (~15 prop firms, one adapter) are grouped.
  Even IBKR is Flex Query report-fetch, not OAuth. (`vendors/tradersync.md`)
- TradesViz does not run a charting engine: server-rendered PNGs for drawing persistence, a rented
  TradingView widget for interactivity, nightly ~6pm ET batch sync. **The category tolerates
  end-of-day latency.** (`vendors/tradesviz.md`)

**The one-paragraph version.** Fill-level broker sync is achievable — but not the way the logo walls
imply. Aggregators mostly cannot serve a journal, and the ones that can charge per connected user.
Chart *rendering* is genuinely free (TradingView Lightweight Charts, Apache 2.0). Chart *data* is
not: every consumer-priced market-data plan we examined forbids display to end users, and the
commercially-licensed floor is $199–$2,499/month **fixed**, which is the single largest determinant
of whether this business works below ~500 paying users. Being deliberately end-of-day is worth more
than any other architectural decision in this document, because T+1 historical data sidesteps the
CTA/UTP exchange-fee regime almost entirely.

---

## 1. Broker connectivity: the real options

### 1.1 The distinction that decides everything: fills vs. holdings

A journal needs **executions** — price, quantity, side, and an intraday timestamp, per fill. Most
"financial data aggregators" were built for net-worth apps and lending underwriting, and return
*holdings* (what you own now) plus *settled transactions* (what changed, dated by settlement). A
settled transaction with a settlement date and no intraday timestamp cannot be grouped into a round
trip, cannot be time-of-day bucketed, and cannot be joined to a 1-minute bar. **That aggregator is
useless for a journal regardless of how many institutions it covers.** `[I]`

### 1.2 Comparison

| Route | Coverage | Fill-level? | Auth model | Published price | Rate limits | Verdict for a journal |
|---|---|---|---|---|---|---|
| **SnapTrade** | "30+ brokerages", 35+ institutions; names Fidelity, Schwab, Robinhood, Webull, eToro, moomoo, Public, Alpaca, Coinbase, Chase, Citi, DEGIRO, CommSec `[V]` | **Partly.** `Orders` returns `filled_quantity`, `execution_price`, `time_placed`/`time_updated`/`time_executed`, "each record represents a single order leg" — **order-level, not fill-level**, and looks back only a few months. `Activities` has years of history but is **daily-updated, position-change only** `[V]` | OAuth/credential flow via SnapTrade's hosted connection portal; per-user secret `[V]` | **$2/connected user/mo** (real-time) · **$1/connected user/mo** (daily) · Free to 5 connected accounts · manual sync $0.05/op on daily plan `[V]` | **250 req/min per customer**; 10 req/min per account for Personal users; ≥15s between account polls recommended `[V]` | **The best available aggregator route, with a caveat.** Order-level with `execution_price` + `time_executed` is enough to build a round trip for most retail traders. It is *not* enough for a scalper taking 8 partials, where per-fill VWAP matters. `[I]` |
| **Plaid Investments** | "100s of banks/brokers"; E*TRADE, Vanguard, Merrill and the API-less long tail (per TradesViz's Jul 2026 adoption) `[V]` | **No.** `/investments/transactions/get` returns settled transactions: `date` is "typically the settlement date"; `datetime` is optional and only "when available from institution" `[V]` | Plaid Link OAuth | Not published (sales-led) | Not published | **Cannot serve as the primary ingest.** Usable only as a coverage backstop for buy-and-hold accounts where day-level granularity is acceptable — which is precisely how TradesViz frames it ("periodic journal sync, not execution streaming") `[V]` |
| **Akoya** | Bank-consortium network; brokerage account types included; FDX-aligned `[V]` | **No evidence of fill-level.** Products are Transactions (2 years, "amounts, dates, and descriptions"), Balances, Accounts & Investments, Statements `[V]` | OAuth, consumer-permissioned, bank-direct | "Customized, usage-based" — nothing published `[V]` | Not published | **Rule out.** Built for open-banking/data-sharing compliance, not trade reconstruction. Sales-led onboarding is also wrong for a two-person team `[I]` |
| **Rithmic (R\|API+)** | Futures. The de-facto routing layer under most US futures prop firms `[V]`/`[R]` | **Yes** — execution platform API, order and fill events | Broker-issued credentials; developer integration of Rithmic's own libraries `[V]` | **~$100/mo API fee + $25/mo user ID = ~$125/mo flat**, plus $0.10/contract routed live; varies by broker ($20/mo at EdgeClear, $99.99 elsewhere) `[R]` (broker pages, not Rithmic's own) | Not published | **Viable but priced per *trader*, not per vendor.** The cost lands on the user, and it is a native library rather than REST — awkward from a Cloudflare edge runtime `[I]` |
| **ProjectX Gateway** (TopstepX and the prop firms on it) | Futures prop firms on the ProjectX stack `[V]` | **Yes, unambiguously.** `POST /api/Trade/search` returns `price`, `size`, `creationTimestamp`, `fees`, `side`, `orderId`, `profitAndLoss`, `voided`, filtered by `accountId` + timestamp range `[V]` | API key → bearer token `[V]` | Not published for third-party read (the API key is the trader's) | Not published | **The single cleanest integration found in this entire study.** REST, JSON, fill-level with fees, date-ranged, one endpoint. A weekend's work `[I]` |
| **PropReports** | The back-office reporting system used across US equity prop desks — CenterPoint, T3, Black Eagle, CMEG, Venom, Vortex, Great Point, Chimera, Zimtra and more `[V]` (TraderSync's own list) | **Yes.** The API exposes a `fills` action, capped at **50,000 records** per call `[V]` | POST to `https://<firm>.propreports.com/api.php`, multipart or form-encoded, user's portal credentials `[V]` | Free to the firm's traders; no vendor fee found | **40 requests / 4 seconds (600/min)** `[V]` | **One adapter, ~15 prop firms.** Highest coverage-per-unit-effort of any US equities route. This is exactly how TraderSync and TradesViz get their prop-firm logo wall `[V]`/`[I]` |
| **Tradovate API** | Tradovate futures accounts | **Yes** — REST + WebSocket execution platform API `[V]` | Bearer token via `POST /auth/accessTokenRequest` or OAuth; Partner API needs Org Admin credentials, API Key and a CID `[V]` | Not published for read-only third parties | Not published | **Viable.** OAuth path exists, which matters — credential-collection is a trust and liability problem a two-person team should avoid `[I]` |
| **Schwab Trader API** | Schwab + former TDA | **Order and transaction history** endpoints (`/trader/v1/accounts/{hash}/orders`, transactions with type/symbol/date filters) `[V]` | OAuth; developer app registration with **manual approval**; individual developers approved after commercial ones `[V]` | Free | Not published | **Viable but gated on Schwab's approval queue, and tokens expire every 7 days** (Schwab-imposed; TradesViz surfaces a manual "Refresh connection") `[V]` — a permanent support cost, not an engineering one `[I]` |
| **IBKR Flex Web Service** | IBKR | **Yes** — Trades / Trade Confirmations sections of a user-configured Flex Query `[V]`/`[R]` | User generates a Flex token (lifetime configurable **6 hours to 1 year**, optionally IP-restricted) and a Query ID; **or** selects the vendor by name from IBKR's *Third-party Services* list, which issues token + query ID automatically `[V]` | Free | **~1 req/sec, 10 req/min per token** `[R]` | **Viable, with a named-vendor shortcut worth pursuing early.** Being on IBKR's Third-party Services picklist collapses onboarding from a 10-step Flex Query walkthrough to two clicks. Trade Confirmations update within 5–10 min of execution; Activity Statements once daily after close `[R]` |

### 1.3 What this actually means

**Cannot serve a journal at all — rule out for primary ingest:** Plaid Investments, Akoya. Both are
holdings-and-settled-transactions products. Plaid earns a place as a *coverage backstop* only. `[I]`

**The realistic v1 ingest matrix is four adapters, not seventy:** `[I]`

1. **Generic execution-level CSV** with a saveable column mapper — absorbs DAS, Sterling, Lightspeed,
   Cobra, SpeedTrader, TradingView exports, and every broker nobody has written a parser for.
   TradesViz proves the shape works (`Custom` = one fill per row) and even ships an "convert it in
   ChatGPT first" escape hatch for the long tail `[V]`.
2. **IBKR Flex** — one adapter, the largest self-directed active-trader base.
3. **PropReports** — one adapter, ~15 US equity prop firms.
4. **SnapTrade** — one adapter, the entire retail mass market (Schwab, Fidelity, Robinhood, Webull),
   at $1–2/connected user/month.

Add **ProjectX** as a fifth if futures prop traders are a target segment; it is the cheapest
integration in the study.

**The economics of SnapTrade deserve naming.** At $1/connected user/month on the daily plan, a
$19/month journal spends 5% of revenue on connectivity for every user who connects. That is
acceptable. At $2 (real-time) with a $9/month price point it is 22%, which is not. Since the
category is EOD anyway (TradesViz syncs nightly at 6pm ET `[V]`), **the daily plan is the correct
choice and it also happens to be the cheap one.** `[I]`

**A hard warning about the aggregator route.** SnapTrade's own docs are explicit that `Activities`
— the endpoint with years of history — is **updated once daily and contains no intraday
granularity**, while `Orders` — the one with `time_executed` — "look[s] back only a few months"
`[V]`. So the backfill path and the ongoing-sync path are *different endpoints with different
fidelity*. Any product built on SnapTrade must handle a user whose first 5 years of history has
day-resolution timestamps and whose last 3 months has real ones. Neither TraderSync nor TradesViz
appears to solve this; it shows up in reviews as "zombie trades" and mis-grouped positions `[R]`.

---

## 2. DAS / Sterling / Lightspeed / Cobra — is there a programmatic route?

These are the professional day-trading platforms our own journal already serves via CSV. The short
answer: **yes, but never at the platform layer for a third party — always at the back office.** `[I]`

| Platform | Programmatic route | Reality |
|---|---|---|
| **DAS Trader Pro** | CMD API / .NET API / FIX `[V]` | Real, documented, and **priced per trader, not per vendor**: Basic $100/mo (100 symbols, 5,000 orders, CMD only) → Standard $500/mo → Enterprise $1,500/mo (.NET or FIX). Requires a valid DAS Trader Pro user **and DAS certification** via an API Request Portal application `[V]`. FIX is order-entry-only and institutional-approved. **This is an order-entry/automation API, not a journal feed** — you would be asking each user to pay $100/mo for the privilege of exporting their own fills. Not a viable product route `[I]` |
| **Sterling Trader Pro** | ActiveX API (VB-oriented; other languages "possible but not as well supported"); WebSocket API at the broker `[V]` | Desktop COM automation. Cannot be driven from a server. Broker-set pricing — e.g. Alaric Securities lists **Sterling Trader Pro $190/mo** and a **WebSocket API at $350 setup + $0–350/mo by volume** `[V]`. Same problem as DAS: it is a trading API, priced at the trader, requiring a Windows desktop `[I]` |
| **Lightspeed** | **Lightspeed Connect** (launched Nov 2024) — WebSocket-only, Certification + Production environments, monitor/place/cancel/replace orders `[V]`/`[R]` | Again an execution API. Also now IBKR-affiliated, which suggests the Flex route may become the practical path for Lightspeed accounts over time `[I]` |
| **Cobra Trading** | No first-party API. Offers DAS Trader Pro and Sterling Trader Pro as platforms `[V]` | **The route is the back office, not the platform.** |

### 2.1 The actual answer: the back office

Every one of these desks runs a back-office reporting system that receives fills from the clearing
firm or execution provider. **PropReports is that system for a large share of the US prop and
retail-pro world**, and it has a documented public API — `api.php`, POST, form-encoded, a `fills`
action returning up to 50,000 records, rate-limited to 600 req/min `[V]`. PropReports' own material
states it "downloads trading activity from clearing firms or execution providers on a daily basis"
`[V]` — i.e. it is already the T+1 authoritative record of what filled.

This is why TraderSync claims ~15 prop firms from **two rows** in its broker table `[V]`
(`vendors/tradersync.md`), and it is the highest-leverage single integration available for the
professional US equities segment. `[I]`

**What this means for TapeReader specifically.** Our DAS CSV parser is not a stopgap to be replaced
by a DAS API — **there is no DAS journal API to replace it with, at any price a retail trader would
pay.** The upgrade path from "DAS CSV" is not "DAS API", it is:
(a) generalise the parser into a mapped execution-level CSV importer that also eats Sterling,
Lightspeed and Cobra exports; and
(b) add PropReports for whichever of those desks clear through it. `[I]`

**Ambiguity flagged.** How TradesViz achieves "100% auto-sync" for DAS Trader Pro (shipped Apr 2026)
is not disclosed on any public page we could read `[V]` — their brokers page confirms the claim but
not the mechanism. The plausible candidates are (i) PropReports behind the scenes for DAS-using prop
desks, (ii) their Google Drive import channel plus a user-side scheduled export, or (iii) a per-broker
back-office feed. We could not settle it. Do not assume a DAS API exists because a competitor claims
DAS auto-sync. → `07-open-questions.md`.

---

## 3. Market data for display: the licensing question

This is the section where getting it wrong is expensive, so it is written conservatively.

### 3.1 The three uses, which vendors price very differently

- **(a) Internal / analytics use** — you fetch bars, compute MFE/MAE/ATR, store the *numbers*, and
  never show a price series to anyone. Cheapest. Arguably what our current enrichment does.
- **(b) Display to end users** — you render a candlestick chart, or show OHLC values, to a person who
  is not the licence holder. **This is a distinct, separately-priced right at essentially every
  vendor examined**, and it is what a trade-annotated chart requires.
- **(c) Redistribution** — you hand the data itself onward (API, export, bulk download) so a third
  party can use it independently. Most expensive; almost never included below enterprise.

A trading journal that draws a chart is squarely in **(b)**, and (b) is exactly what consumer plans
forbid. `[I]`

### 3.2 Vendor comparison

| Vendor | Consumer plan | What the consumer plan permits | Display-to-end-users route | Published cost of that route |
|---|---|---|---|---|
| **Polygon.io / Massive** (rebranded — polygon.io now 301s to massive.com `[V]`) | Basic free (5 req/min, EOD, 2 yr) · Starter $29 · Developer $79 · Advanced $199 `[V]` | **Nothing commercial.** ToS: "You may not use the Market Data for any business or commercial purpose, and you may not use the Market Data to build an application intended for use by end users other than you"; prohibits "redistribute, display, disseminate…to any third party"; requires Non-Professional certification `[V]` | **Stocks for Business** | **$2,499/mo.** Marketed as "no extra licensing required" because it serves a proprietary blended *fair market value* rather than raw exchange feeds. Real exchange feeds are add-ons that **do** need approval and exchange fees: Cboe EDGX $1,999, Nasdaq Basic $1,999, Full Market real-time $1,999, **Full Market Delayed 15-min $499**, IEX $499, NYSE Imbalances $399 — all per month `[V]` |
| **Databento** | Usage-based (metered per uncompressed GB) · **Standard $199/mo** ("no license fees") `[V]` | Standard covers live + historical with no exchange licence fees; the pricing page reserves **"external distribution rights"** for the Plus tier `[V]` | **Plus** | **$1,750/mo** (annual contract), 16+ yr L1 history, external distribution rights. Unlimited $4,500/mo `[V]` |
| **Databento US Equities Mini** (`EQUS.MINI`) | Included with any Standard/Plus/Unlimited sub; historical from 2023-03-28 usage-based `[V]` | **The exception worth knowing about.** Vendor states it is "the only blended offering of US stock market data that supports commercial applications—such as external redistribution and non-display trading—without licensing restrictions", with "no per-user fees or additional licensing paperwork" `[V]` | Same product | Real-time **top-of-book only** (synthetic NBBO + trade volume) — you build your own 1-min bars from it. Coverage starts 2023 `[V]` |
| **Intrinio** | Individual $150/mo — "Personal use only… No redistribution or display" `[V]` | Explicitly no display | **Startup** tier: "Commercial Use and Display Rights", business-wide licence `[V]` | **$333/mo rising to $999**; Enterprise custom from ~$1,250/mo `[V]`. **The cheapest published, unambiguous display licence found in this study** `[I]` |
| **Alpaca** | Free (IEX, 15-min delayed REST, 200 req/min) · **Algo Trader Plus $99/mo** (full SIP real-time, 7+ yr history) `[V]` | Data plans are documented as *trading* data plans. The customer agreement **incorporates the NASDAQ OMX Global Subscriber Agreement and the Agreement for Market Data Display Services by reference** `[V]` — i.e. the user is the subscriber, not the app | No published commercial/redistribution tier on the data page; directed to Broker API / sales `[V]` | **Unpriced. → needs legal confirmation before use.** `[I]` |
| **Finnhub** | Free tier ~60 calls/min, explicitly "personal, non-commercial projects" `[R]`; paid from ~$50/mo per market `[R]` | "The moment your app is monetised or redistributes data, you need a paid plan" `[R]` | Separate *Startups & Enterprise* commercial page; **no prices published** `[V]` | **Unpriced, sales-led** `[V]` |
| **Tiingo** | Starter free · **Power $30/mo** `[V]` | **Blocked.** Standard licence is "Internal Use Only" — "you may not display or share" the data. Applies to both tiers, EOD *and* IEX intraday `[V]` | Contact sales; nothing published `[V]` | **Unpriced.** Cheapest-looking vendor, categorically unusable for display without a negotiated licence `[I]` |
| **EODHD** | Free (20 calls/day) · EOD £19.99 · EOD+Intraday £29.99 · Fundamentals £59.99 · All-in-One £99.99/mo `[V]` | Standard plans marked personal use; page states "For commercial use, choose Startups & Enterprise Data Solution Plan" `[V]` | Startups & Enterprise plan | **Unpriced, sales-led** `[V]` |
| **TradingView** | — | Widgets carry TradingView's own data; Advanced Charts carries **none** (see §4) | — | Not a data vendor for this purpose `[V]` |

### 3.3 The exchange-fee reality for US equities — and why EOD is the whole ballgame

US equity consolidated tape data is licensed through the **CTA** (NYSE-administered, Tapes A/B) and
**UTP** (Nasdaq-administered, Tape C) plans, plus per-exchange proprietary feeds. Fees are
**vendor-agnostic** — you owe them regardless of which API vendor you buy through — and are
segmented by professional vs. non-professional subscriber, and by display vs. non-display use.
Databento's licensing primer puts the range at **$32 to $20,000+ per month per exchange**, and gives
a worked example: Nasdaq's *lowest* professional cost is ~$2,051/mo (TotalView Internal Distribution
$1,500 + $100 admin + $76/subscriber depth non-display + $375/non-display subscriber RAW surcharge)
`[V]`.

**And then the sentence that reframes this entire product:**

> Databento, on licensing: *historical (T+1) data does not require a licence*; "anything T+1
> (24 hours and earlier) **doesn't** require a licence", while exchanges "require a license for any
> intraday or delayed data" `[V]`

Read carefully, that draws the line at **24 hours**, not at "real-time vs delayed". A 15-minute
delayed feed is still licensed (Massive prices it at $499/mo as an add-on `[V]`). **T+1 historical
is not.**

**Implication for a deliberately end-of-day product** `[I]`:

- Every chart we would draw is of a session that closed **yesterday or earlier**. It is T+1
  historical by construction.
- We therefore never enter the CTA/UTP subscriber-fee regime, never need professional/non-professional
  attestation per user, never need exchange approval, and never need a per-user reporting obligation.
- What remains is purely the **vendor's own commercial/display licence** — a flat monthly fee,
  independent of user count.
- Our existing architecture already enforces this: Polygon's free tier blocks same-day intraday, so
  `enrichSymbol` caps the fetch window at *yesterday ET* (`market-data.ts:881-885`). What was a
  free-tier workaround is, viewed correctly, a **compliance moat**. Keep it deliberately.

**⚠️ Needs legal confirmation before any spend.** Three points in the above are vendor
characterisations of exchange rules, not the exchange rules themselves, and one is genuinely
ambiguous:
1. The "T+1 needs no licence" line is **Databento's own blog**, not a CTA/UTP plan document. It is
   consistent with industry practice and with every vendor's pricing structure, but it should be
   confirmed against the CTA/UTP plan documents or with the vendor in writing before it is relied on.
2. Whether **Databento Standard ($199)** permits display in a paid product is unclear: the pricing
   page attaches "external distribution rights" to Plus, and separately says `EQUS.MINI` supports
   "external redistribution… without licensing restrictions". Those two statements are about
   different things (plan tier vs. exchange licensing) and their intersection is not documented.
   **Get this in writing.** It is the difference between $199/mo and $1,750/mo.
3. **Alpaca** incorporates the Nasdaq display-services agreement by reference into a *customer*
   agreement. Whether an app may show that data to its own users is not addressed on any public page.
   Assume no until told otherwise.

### 3.4 Concrete monthly cost to serve, by user count

Assumptions, stated so they can be argued with `[I]`:
- Product is **EOD**; charts are T+1 historical only; no real-time quotes anywhere in the UI.
- Data is fetched **once per symbol-day globally**, not per user. Market data is shared, not tenanted
  — so vendor cost is **fixed**, not per-user. (This is the single most important cost property of
  the design.)
- ~4,000-name liquid universe (price ≥ $1, dollar volume ≥ $5M — the same definition already used in
  `docs/market-scans/phase-1-spec.md`), 1-minute bars, nightly ingest via bulk flat files rather than
  per-symbol REST. Massive includes daily flat files (S3-compatible, compressed CSV) **in all paid
  plans** `[V]`, which removes the 5-req/min pagination pain entirely.
- $25/mo blended ARPU for the margin lines.

| | 100 users | 1,000 users | 10,000 users |
|---|---|---|---|
| **Market data — optimistic** (Intrinio Startup, display rights) | $333 | $333–999 | $999 |
| **Market data — pessimistic** (Massive Stocks for Business) | $2,499 | $2,499 | $2,499 |
| **Broker sync** (SnapTrade daily $1/connected user, ~60% connect rate) | $60 | $600 | $6,000¹ |
| **Cloudflare** (Workers Paid $5 + D1 + R2, §5) | ~$8 | ~$60 | ~$400 |
| **Auth** (Clerk: 50k MRU included; Pro to drop branding) | $25 | $25 | $25 |
| **Stripe** (2.9% + $0.30) | ~$103 | ~$1,025 | ~$10,250 |
| **Total, optimistic** | **~$529** | **~$2,043** | **~$17,674** |
| **Total, pessimistic** | **~$2,695** | **~$4,209** | **~$19,174** |
| Revenue @ $25 ARPU | $2,500 | $25,000 | $250,000 |
| **Gross margin, optimistic** | **79%** | **92%** | **93%** |
| **Gross margin, pessimistic** | **−8%** | **83%** | **92%** |

¹ SnapTrade publishes volume discounts on its Custom plan `[V]`; $6,000 is the undiscounted list.

**Read the pessimistic row at 100 users.** A $2,499/mo fixed data licence against $2,500 of MRR is a
**negative gross margin**. The market-data licence is not a line item, it is a **gate**: it sets a
minimum viable scale of roughly **150–200 paying users just to cover data**, before a single hour of
labour is paid for. `[I]`

**Three ways through it, in order of preference** `[I]`:
1. **Start on Intrinio Startup ($333/mo) or a written Databento Standard clarification ($199/mo)**
   and treat Massive Business as the tier you graduate *to*, not the one you launch on. Break-even
   on data alone falls to ~15–25 users.
2. **Charge for charts.** Put the annotated chart behind the paid tier and serve the free tier
   pure-numbers (MFE/MAE, R multiples, calendar) computed from data we hold internally. Analytics on
   internally-derived numbers is use (a), not (b). This is not a hypothetical — TradesViz already
   gates interactive charts at Pro+ `[V]`.
3. **Databento `EQUS.MINI`** if the "no per-user fees, external redistribution supported" language
   survives legal review, which would make the display right effectively free at usage-based
   historical rates. Its 2023 start date is the constraint.

---

## 4. The TradingView route — verified carefully, because it matters

TradesViz rents TradingView rather than building a chart engine `[V]`. If that route is legitimate
for a paid product, it removes the most expensive component of a journal. **We read the actual
licence agreement rather than the marketing page, and the answer is more restrictive than the
marketing implies.**

### 4.1 Three distinct TradingView products, three very different answers

| Product | Licence | Own data? | Paid product OK? | Attribution | Cost |
|---|---|---|---|---|---|
| **Widgets** (embeddable iframes) | Proprietary; site policy | **No — TradingView's own data, TradingView's own symbols.** "We don't have an API that gives access to data"; some symbols show "only available on TradingView" and cannot render at all `[V]` | **Policy says no.** tradingview.com/policies: *"Except as otherwise expressly permitted by separate agreement, we do not permit commercial usage of any of our services or APIs"* `[V]` | Required and enforced: attribution "clearly visible at all times", min font 10pt/13px, permanent bans and legal action threatened for violations `[V]` | Free with TV branding; branding removal "available upon request" `[V]` |
| **Advanced Charts** (formerly Charting Library) | **Free Advanced Charts Agreement, v.0626.FAC** — a signed contract, not a click-through `[V]` | **You must supply your own.** §2.2: *"The Implementation shall be hosted on Client's servers, and integrate the Client's own Market Data feed streaming and history"* `[V]` | **No, as written.** §2.4: *"This license is intended for Implementations as a public access service (as a free offering only, and whether account registration is required or not), and not for private, personal or internal uses"* `[V]` | §3.2: TV Branding link, no `nofollow`/`ugc`/`sponsored`. §2.11 additionally requires publishing **a blog post announcing the partnership** or an approved promotional placement with a contextual backlink `[V]` | $0 licence fee — **but §7.5 sets liquidated damages at USD $50,000 per proven breach** `[V]` |
| **Lightweight Charts** | **Apache 2.0** `[V]` | You supply your own | **Yes, unreservedly** | NOTICE-file attribution + a link to tradingview.com in "a prominent place"; the built-in `attributionLogo` chart option satisfies it, and can be disabled if you attribute elsewhere `[V]` | Free |

### 4.2 The verdict

**The free Advanced Charts licence does not cover a paid trading journal.** §2.4's "as a free
offering only" is unambiguous on its face, §2.4 also grants TradingView "free, unlimited access to
any services, products, websites, or applications that include an Implementation… in a manner that
permits TradingView to view the Implementation as Client's other clients and users do" — i.e. an
explicit compliance-monitoring right — and §7.5 prices a breach at $50,000. That is a contract
designed to be audited. `[V]`/`[I]`

TradesViz gates interactive TradingView charts at Pro+ `[V]`, which is behind a paywall. Three
readings, none verifiable from public sources: they hold a negotiated paid licence; they are on an
older agreement version (this one is stamped v.**0626** = June 2026, so it may postdate their
integration); or they are out of compliance. **Do not infer permission from a competitor's
behaviour.** → `07-open-questions.md`.

**⚠️ Needs legal confirmation.** "Free offering" is not defined in the agreement. A freemium product
with a genuinely free tier that includes charts may or may not qualify. Ask TradingView
(platforms@tradingview.com) in writing before shipping; the answer is cheap and the downside is
$50,000 per breach.

### 4.3 What we would actually do

**Ship on Lightweight Charts.** `[I]` It is Apache 2.0, unambiguously commercial-safe, the
attribution requirement is a logo option and a link, and it renders candles, volume, markers, price
lines and custom series plugins — which covers **every overlay a journal needs**: execution markers
at fill price, entry/exit arrows, dotted MFE/MAE lines, dashed stop and target lines. That is
precisely the overlay set TradesViz plots on its rented TradingView instance `[V]`, and none of it
requires Advanced Charts' drawing-tool suite.

What Lightweight Charts does *not* give you is the 110+ drawing tools and 100+ built-in indicators.
For a journal that is close to irrelevant — the user is reviewing a chart, not analysing one live —
and the annotation use case is better served by TradesViz's own answer: **a stored raster with a
drawing layer** `[V]`, which we already half-own via the Drive-backed Screenshot Review keyed on
`date|symbol` (`google-drive.ts:107-155`).

**The headline correction to the premise:** renting TradingView removes the *rendering* cost. It
removes **none** of the data cost, because Advanced Charts explicitly requires you to bring your own
feed (§2.2) `[V]`. §3 remains the expensive half regardless of which chart library wins.

---

## 5. Storage and compute on our actual stack

### 5.1 What breaks the moment the journal is multi-tenant

`03-gap-analysis.md` §7 already enumerates the single-tenant failures. The specifically *platform*
failures, with numbers:

| Constraint | Number `[V]` | What breaks |
|---|---|---|
| **Pages Functions / Workers CPU, Free** | **10 ms per request** | `computeStats` is an O(rows) scan of a full sheet in an isolate. Two CPU hotspots have already been engineered around at single-user scale (`etCache`, `buildOpenRangeByDate`). At 100 users this is not survivable. **Workers Paid ($5/mo, 30 s default CPU, 5 min max) is mandatory at the first paying customer** `[I]` |
| **Workers subrequests** | 50/invocation free, 10,000 paid | Per-symbol Polygon enrichment fan-out dies on free |
| **Workers memory** | 128 MB per isolate, both plans | Caps how much of a tenant's history can be pulled into memory at once — forces pushing aggregation into SQL rather than JS `[I]` |
| **D1 free** | 500 MB/db · 5 GB account · **100k rows written/day** · **50 queries per Worker invocation** · 5M rows read/day | 50 queries/invocation kills any per-trade lookup loop. 100k writes/day caps the whole platform at ~100 CSV uploads/day |
| **D1 paid** | **10 GB max per database** · 1 TB account · 1,000 queries/invocation · 50M rows written/mo included, then $1/M · 5 GB storage included, then $0.75/GB-mo | **The 10 GB per-database ceiling is the binding constraint, and it binds on market data, not user data** (§5.2) |
| **D1 throughput** | Single-threaded; "1 ms queries → ~1,000 queries/sec, 100 ms queries → ~10 queries/sec" | A shared analytics DB serialises. Argues for per-tenant or sharded DBs `[I]` |
| **Google Sheets API** | 300 read + 300 write req/min per project; 60 per user; ~2 MB recommended payload | Every stats request today is a full `A:CG` fetch. **At ~5 requests per page load, the project-wide 300/min ceiling is hit at roughly 60 concurrent users** — and there are no indexes, no transactions, and no optimistic concurrency `[I]` |
| **Polygon free key** | 5 req/min, shared across all requests | Two concurrent users rate-limit each other into failure today |

**Sheets-as-database with full-tab scans per request will not survive a second paying user**, let
alone a hundred. That is not a scaling concern to revisit later; it is a rewrite that must precede
the first external signup. `[I]`

### 5.2 Sizing the data, per user per year

Assumptions `[I]`: an active day trader; ~100 executions/day × 250 sessions = **25,000 executions/yr**
grouping to **~4,000 round trips/yr**. (Sanity check: TradesViz's free tier allows 3,000
executions/month `[V]`, so 25k/yr sits comfortably inside their notion of a normal user; a heavy
scalper is 5× this, a swing trader 20× less.)

| Dataset | Per user / year | Notes |
|---|---|---|
| **Executions** | 25,000 rows × ~150 B ≈ **4 MB** | Narrow relational rows: account, symbol, side, qty, price, ts, fees, broker order id |
| **Trades (round trips) + enrichment** | 4,000 rows × ~600 B ≈ **2.5 MB** | ~75 columns of the kind we already compute |
| **Derived per-trade metrics** (MFE/MAE/R ladder/excursions) | folded into the above | Computed once at ingest, stored as numbers — **use (a), not (b)** in §3 terms |
| **Per-trade 1-min bar window for chart display** | 4,000 × ~120 bars × 50 B ≈ **24 MB** | entry−30 min → exit+30 min. Only if cached per trade rather than read from the shared store |
| **Screenshots / annotated rasters** | ~800 images × 400 KB ≈ **320 MB** | Assumes 20% of trades get 2 images. Full coverage would be ~2.4 GB |
| **Relational subtotal** | **~10 MB / user / yr** | |
| **Blob subtotal** | **~0.3 GB / user / yr** | |

**And the shared dataset, which is the one that actually breaks D1:**

| Dataset | Global size | Notes |
|---|---|---|
| 1-min bars, 4,000-name liquid universe, 1 year | 4,000 × 250 × 390 × ~50 B ≈ **19.5 GB/yr** | **Exceeds D1's 10 GB per-database ceiling in under 6 months** `[V]` limit, `[I]` arithmetic |
| Daily bars, same universe, 20 years | 4,000 × 5,000 × ~60 B ≈ **1.2 GB** | Comfortably fits D1 |
| Breadth / scan hits (per `docs/market-scans/phase-1-spec.md`) | ~105 MB/yr | Fits |

**This is the central storage finding.** User data is tiny — 10,000 users is only ~100 GB relational,
which any Postgres handles without thinking. **The 1-minute bar store is 200× larger than all user
data combined and does not fit in a D1 database.** `[I]`

### 5.3 Recommended architecture

| Layer | Choice | Why |
|---|---|---|
| **Tenant relational data** (users, accounts, executions, trades, tags, plans, config) | **Turso** (libSQL) — Developer $4.99/mo → Scaler $24.92/mo (24 GB, 100 B rows read, 100 M rows written) `[V]` | HTTP-native driver, so it works from the edge runtime with no TCP and no connection pooling — the constraint that eliminates most Postgres options. Unlimited databases on paid plans enables **database-per-tenant**, which fixes D1's single-threaded serialisation and gives per-user export/delete for free (GDPR/CCPA). We already have a Turso reference in `lib/data/`. Migration path from D1 is near-zero: both are SQLite |
| **Alternative if per-tenant sharding is rejected** | **Neon Postgres** — Free 0.5 GB, Launch $0.106/CU-hr + $0.35/GB-mo, HTTP Data API, scale-to-zero `[V]` | Real Postgres (window functions, CTEs, partial indexes) makes the analytics far easier than SQLite. The HTTP Data API is what makes it edge-viable. Costs more and adds a second infra vendor |
| **Shared 1-min bar store** | **R2 + columnar files, not a database.** Partition `bars/1m/{symbol}/{yyyy-mm}.parquet` (or zstd-CSV) `[V]` pricing | $0.015/GB-mo storage, **free egress**, $0.36/M Class B reads. 20 GB/yr = **$0.30/mo**. Massive already ships daily flat files over an S3-compatible endpoint in every paid plan `[V]`, so the ingest is a copy, not a 5-req/min crawl. Fetch a symbol-month, slice the window, cache the slice |
| **Hot per-trade bar windows** | **D1 or Turso**, keyed `(trade_id)`, written once at enrichment | Turns chart rendering into one indexed row read instead of an object fetch |
| **Screenshots and annotated rasters** | **R2** | 10,000 users × 0.3 GB = 3 TB = **$45/mo**, zero egress. Replaces the Google Drive folder convention entirely (which cross-joins two users' charts on a `date\|symbol` collision — `03-gap-analysis.md` §7) |
| **Compute** | **Workers Paid, $5/mo minimum** `[V]` | Non-negotiable. 10 ms CPU is not a budget, it is a wall |
| **Heavy jobs** (nightly ingest, backfill, enrichment) | **GitHub Actions or Cloudflare Queues + a `WRITE_KEY`-protected route** | Already the chosen pattern in `docs/market-scans/phase-1-spec.md` because Pages Functions have no cron triggers. **This also kills the current "hold a browser tab open for 65 s per symbol" enrichment loop**, which is the worst thing in the product today |
| **Caching** | Semantic cache keys, per TradesViz's design: `filter + account + engine_version + suppressions` `[V]` | `lib/data/cache.ts` is in-memory and does not survive Cloudflare isolates — a known-broken dependency (`CLAUDE.md`). Version-bump invalidation beats TTLs |

**Why not D1 for tenant data.** It is closest to hand and the free tier is generous, but three
properties disqualify it at multi-tenant scale: the 10 GB per-database ceiling, single-threaded
throughput on a shared database, and 50 queries per invocation on free. D1 remains right for the
**market-scans** workload it was chosen for (daily bars, breadth, scan hits — all small, all
read-mostly) and for the hot per-trade bar cache. **Use both: D1 for shared market artefacts,
Turso-per-tenant for user data, R2 for everything large.** `[I]`

**Why not Postgres/Neon as the default.** Not because it is worse — the analytics would be
materially easier in Postgres — but because the edge-runtime constraint (`export const runtime =
'edge'` on every route) rules out TCP drivers, and the HTTP fallback reintroduces per-query latency
that a database-per-tenant SQLite avoids. If we ever move off the edge runtime, revisit
immediately. `[I]`

---

## 6. Build effort, honestly sized

### 6.1 Assumptions

`[I]` — argue with these, they drive everything below.

1. **One to two people**, heavy AI assistance. AI roughly halves the *tedious* work (parsers, CRUD,
   forms, migrations, billing plumbing) and barely touches the *hard* work (correctness under
   adversarial real-world data, licensing, third-party auth lifecycles, ops).
2. **~40% of the existing codebase survives** — the grouper's core walk, the R math, MFE/MAE,
   ATR/ADR/30mATR enrichment, the calendar, the capture tracker, the plan→trade auto-fill. The Sheets
   data layer and the whole API surface do not.
3. **v1 scope is deliberately narrow**: US equities + futures, EOD only, one chart type, three
   ingest paths (mapped CSV, IBKR Flex, SnapTrade), web + responsive PWA. **No options, no forex,
   no crypto, no replay simulator, no native mobile.** Options are the single biggest scope trap in
   this category and are excluded on purpose.
4. A person-week is 30 focused hours.

### 6.2 Estimate

| Workstream | Person-weeks | What it covers | Hard or tedious? |
|---|---|---|---|
| **Auth + multi-tenancy** | **6–8** | Clerk/Auth.js, org model, per-tenant DB provisioning, row-level scoping on every query, session handling on the edge, migration of the existing single-tenant data | Hard — every subsequent bug is a data-leak bug |
| **Storage layer + schema** | **3–4** | Turso-per-tenant + D1 shared + R2, migrations, seed, backup/restore, export/delete | Tedious |
| **Ingest: mapped CSV importer** | **4–5** | Proper RFC-4180 parser (today's `line.split(",")` corrupts any quoted field), saveable column maps, timezone handling, preview + Import-Doctor-style error explanation, idempotent dedup | Tedious, high volume |
| **Ingest: IBKR Flex + PropReports + SnapTrade** | **6–8** | Three adapters, token lifecycle, connection health UI, retry/backoff queue, the *two-fidelity* backfill-vs-sync problem (§1.3), per-source dedup keys | **Hard** |
| **Trade engine rewrite** | **6–10** | Position flips through zero (currently silently wrong), overnight/multi-day carry (currently $0 rows), contract multipliers, commissions/fees/rebates, split and corporate-action adjustment, correct `# Partials`, chronological streak ordering | **Hard, and the highest-reputation-risk item in the list** |
| **Market data pipeline** | **5–7** | Nightly flat-file ingest to R2, universe selection, bar slicing, MFE/MAE at scale, backfill orchestration, `N/A`-vs-blank invariant preserved | Tedious with hard edges (corporate actions) |
| **Analytics** | **4–6** | Port the existing suite; add exit efficiency, best-exit, EOD-exit counterfactual, multi-timeframe hold; move all of it from JS scans to SQL aggregates | Tedious — the maths already exists |
| **Charts** | **4–6** | Lightweight Charts + a datafeed adapter, execution markers, MFE/MAE and stop/target lines, annotated-raster store with a drawing layer, screenshot upload/paste (replacing the Drive filename convention) | Medium |
| **UI / UX** | **8–12** | Dashboard, calendar, trade table + detail, review flow, shared filters, settings, **onboarding** (the part every competitor is bad at — "instructions are a book" `[V]`) | Tedious, large surface |
| **Billing** | **3–4** | Stripe (2.9% + $0.30 `[R]`, Billing at 0.7% of volume PAYG `[R]`), plans, feature gating, trials, dunning, proration, tax | Tedious |
| **Mobile** | **3–5** | Responsive PWA. Native is 12+ weeks and TradesViz's 2.9★ on Play after a flagship rebuild `[V]` is the argument against attempting it | Tedious |
| **Ops + trust** | **4–6** | Observability, job monitoring, backups + restore drills, support tooling, status page, ToS/privacy, **market-data licence procurement and compliance** | Hard in the non-code sense |
| **Total** | **56–81 person-weeks** | | |

**Headline: ~60–80 person-weeks to a sellable v1.** For two people at reasonable velocity that is
**7–10 months**; for one person, 14–20 months. Add ~25% for the things not on any list, and the
honest planning number is **9–12 calendar months for two people.** `[I]`

### 6.3 Genuinely hard vs. merely tedious

**Genuinely hard — these do not respond to more hours or better AI assistance:**

1. **Trade construction correctness.** Flips through zero, overnight carry, partial fills across
   accounts, futures rollovers, splits mid-holding, prop-firm commission structures. Every one is a
   silent wrong-number bug, and a journal that shows a wrong P&L has destroyed its only asset.
   TraderSync's Trustpilot record — currency-base bugs corrupting commissions unresolved for seven
   months, "zombie trades", a CSV import scaling trades by 10× `[R]` — is what this failure mode
   looks like from the outside, at a company with far more engineers than we would have.
2. **Broker auth lifecycle.** Schwab's 7-day token expiry `[V]`, IBKR Flex tokens expiring between
   6 hours and a year `[V]`, OAuth refresh, per-broker history depth limits, connections that fail
   silently and are noticed by the user three weeks later. This is a **permanent operating cost**,
   not a project.
3. **Market-data licensing.** Three of the ambiguities in §3 cannot be resolved by reading; they
   require written vendor answers. Getting one wrong is not a bug, it is a contract breach — and in
   TradingView's case a contractually stipulated **$50,000 per proven breach** `[V]`.
4. **The economics below ~200 users.** A fixed data licence against near-zero revenue is a business
   problem that engineering cannot solve, only mitigate (§3.4).
5. **Onboarding a user's history without silently corrupting it.** The two-fidelity backfill problem
   (§1.3) is under-appreciated and appears unsolved by the incumbents.

**Merely tedious — real work, but bounded and predictable, and where AI assistance genuinely pays:**
CSV parsers and column mappers, the UI surface area, Stripe plumbing, migrations, SEO landing pages,
the analytics port (the formulas exist and are already tested against our own trading), the
Lightweight Charts integration.

### 6.4 Where the schedule risk actually lives

`[I]`, in descending order:

1. **The trade engine's long tail.** Not week 4, but months 6–18, arriving one furious support ticket
   at a time from a user whose numbers do not match their broker. Mitigation: **write the test suite
   first.** There is currently no test file anywhere under `web/lib/trade-journal/`
   (`03-gap-analysis.md` §7.11) for exactly the code most worth pinning. Golden-file tests against
   real exports from every supported broker are the single highest-value engineering investment in
   this whole plan.
2. **Market-data licence negotiation.** Sales-led, unpriced at four of eight vendors, and on
   someone else's calendar. **Start this in week 1, before writing a line of ingest code** — the
   answer determines whether the product is viable at the price point the business-model theme picks.
3. **The edge-runtime tax.** Two CPU-limit rewrites have already happened at single-user scale
   (`CLAUDE.md`). Every analytics feature carries a hidden "will this fit in an isolate?" question.
   Moving aggregation into SQL early removes most of it; discovering it late costs a rewrite each time.
4. **Multi-tenancy retrofit.** Retrofitting tenancy is strictly harder than building with it. The
   Sheets layer must go **before** the first external user, not after — every week it survives adds
   to the migration.
5. **Scope creep into options.** Multi-leg construction, assignment, expiry, spread recognition and
   Greeks are each a project. Every competitor supports options because the market demands it, and
   every competitor's complexity problems trace partly to it. Say no in v1 and mean it.

### 6.5 The engineer's bottom line

Building this is **not technically hard, and it is not cheap either.** The hard parts are attritional
(import correctness, auth lifecycles) or contractual (data licensing) rather than algorithmic — which
is precisely why TradesViz's own essay names its moat as *"seven years of accumulated damage"* from
broker-format drift `[V]`. A two-person team with AI assistance can absolutely reach a sellable v1 in
~9–12 months. What it cannot do is out-accumulate seven years of import edge cases, which means the
wedge must be somewhere other than breadth of import coverage — and everything TapeReader already
does that the category does not (`03-gap-analysis.md` §8) lives on the analysis side, not the
ingest side. `[I]`

---

## Sources

All accessed **2026-09-01** unless noted.

**Aggregators and broker connectivity**
- [SnapTrade — Pricing](https://snaptrade.com/pricing)
- [SnapTrade — Brokerage API overview](https://snaptrade.com/brokerage-api)
- [SnapTrade docs — Account Data (orders vs activities)](https://docs.snaptrade.com/docs/account-data)
- [SnapTrade docs — List account orders](https://docs.snaptrade.com/reference/Account%20Information/AccountInformation_getUserAccountOrders)
- [SnapTrade docs — List account activities](https://docs.snaptrade.com/reference/Account%20Information/AccountInformation_getAccountActivities)
- [SnapTrade docs — Rate limiting](https://docs.snaptrade.com/docs/ratelimiting)
- [SnapTrade docs — FAQ (sync cadence)](https://docs.snaptrade.com/docs/faq)
- [SnapTrade docs — Brokerage integrations](https://docs.snaptrade.com/docs/integrations)
- [Plaid — Investments API reference](https://plaid.com/docs/api/products/investments/)
- [Akoya — Transactions API](https://akoya.com/products/transactions)
- [Akoya — Accounts & Investments API](https://akoya.com/products/investments)
- [Akoya — Pricing](https://akoya.com/pricing)
- [ProjectX Gateway API — Search for Trades](https://gateway.docs.projectx.com/docs/api-reference/trade/trade-search/)
- [ProjectX Gateway API — Introduction](https://gateway.docs.projectx.com/)
- [PropReports — API documentation (Confluence)](https://propreports.atlassian.net/wiki/spaces/PR/pages/589971/API)
- [PropReports — Trader FAQs](https://www.propreports.com/traders_faqs.php)
- [Tradovate API reference](https://api.tradovate.com/)
- [Tradovate Partner API](https://partner.tradovate.com/)
- [Schwab Developer Portal — Trader API (Individual)](https://developer.schwab.com/products/trader-api--individual)
- [IBKR Campus — Flex Web Service](https://www.interactivebrokers.com/campus/ibkr-api-page/flex-web-service/) *(403 to automated fetch; details `[R]` from secondary sources and the TradesViz walkthrough below)*
- [TradesViz — Auto import trades from Interactive Brokers](https://www.tradesviz.com/blog/auto-import-interactive-brokers/)

**Professional day-trading platforms**
- [DAS|Inc — API Services (tiers and pricing)](https://dastrader.com/das-api-services/)
- [DAS|Inc — Can I automate my trading strategy?](https://dastrader.com/docs/can-i-automate-my-trading-strategy/)
- [Sterling Trading Tech — ActiveX API Guide (PDF)](https://download.sterlingtrader.com/documents/Sterling_ActiveX_API_Guide.pdf)
- [Alaric Securities — Platform & WebSocket API access fees](https://alaricsecurities.com/pricing/platform-fees/)
- [Lightspeed — API Trading / Lightspeed Connect](https://lightspeed.com/trading/api-trading)
- [Lightspeed Connect API — Getting Started Guide v2.0.4 (PDF)](https://d31x4u3ydvpof.cloudfront.net/manuals/Lightspeed_Connect_API_Getting_Started_Guide_IBKR_Prod.pdf)
- [Cobra Trading — Trading Platforms](https://www.cobratrading.com/platforms/)
- [TradesViz — DAS Trader broker page](https://www.tradesviz.com/brokers/das-trader)
- [TradesViz — PropReports broker page](https://www.tradesviz.com/brokers/PropReports)

**Market data pricing and licensing**
- [Massive (formerly Polygon.io) — Pricing](https://massive.com/pricing)
- [Massive — Business pricing](https://massive.com/business)
- [Massive — Stocks for Business](https://massive.com/business-stocks)
- [Massive — Market Data Terms of Service](https://massive.com/legal/market-data-terms-of-service)
- [Massive — Terms of Service index](https://massive.com/legal/terms)
- [Massive — Historical flat files included in all paid plans](https://massive.com/blog/flat-files)
- [Databento — Pricing](https://databento.com/pricing)
- [Databento — Part 1: Introduction to market data licensing](https://databento.com/blog/introduction-market-data-licensing)
- [Databento — Part 2: Understanding exchange license fees](https://databento.com/blog/understanding-exchange-fees)
- [Databento — US Equities Mini now available](https://databento.com/blog/databento-us-equities-mini-now-available)
- [Databento — Upcoming changes to pricing plans (Jan 2025)](https://databento.com/blog/upcoming-changes-to-pricing-plans-in-january-2025)
- [Alpaca — Market Data plans](https://alpaca.markets/data)
- [Alpaca — Customer Agreement (PDF)](https://files.alpaca.markets/disclosures/library/AcctAppMarginAndCustAgmt.pdf)
- [Finnhub — Pricing for startups and enterprise](https://finnhub.io/pricing-startups-and-enterprise)
- [Tiingo — Pricing](https://www.tiingo.com/pricing)
- [EODHD — Pricing](https://eodhd.com/pricing)
- [Intrinio — Pricing](https://intrinio.com/pricing)

**TradingView**
- [TradingView — Free Advanced Charts Agreement, v.0626.FAC (PDF)](https://s3.amazonaws.com/tradingview/charting_library_license_agreement.pdf) — the operative licence; §§2.2, 2.4, 2.5, 2.11, 3.2, 7.5
- [TradingView — Free charting libraries comparison](https://www.tradingview.com/free-charting-libraries/)
- [TradingView — Advanced Charts](https://www.tradingview.com/advanced-charts/)
- [TradingView — Terms of Service and Company Policy](https://www.tradingview.com/policies/)
- [TradingView — Widget docs](https://www.tradingview.com/widget-docs/)
- [TradingView — Widget FAQ: General](https://www.tradingview.com/widget-docs/faq/general/)
- [TradingView — Widget FAQ: Data](https://www.tradingview.com/widget-docs/faq/data/)
- [TradingView — Lightweight Charts (GitHub, Apache 2.0)](https://github.com/tradingview/lightweight-charts)
- [Lightweight Charts — LayoutOptions.attributionLogo](https://tradingview.github.io/lightweight-charts/docs/api/interfaces/LayoutOptions#attributionLogo)

**Infrastructure**
- [Cloudflare D1 — Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare D1 — Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare Workers — Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers — Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare R2 — Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Turso — Pricing](https://turso.tech/pricing)
- [Neon — Pricing](https://neon.com/pricing)
- [Google Sheets API — Usage limits](https://developers.google.com/workspace/sheets/api/limits)
- [Clerk — Pricing](https://clerk.com/pricing)
- [Stripe — Pricing](https://stripe.com/pricing)

**Internal**
- `docs/journal-market-research/00-method.md`
- `docs/journal-market-research/03-gap-analysis.md` (Part A)
- `docs/journal-market-research/vendors/tradersync.md`
- `docs/journal-market-research/vendors/tradesviz.md`
- `docs/market-scans/phase-1-spec.md`
- `CLAUDE.md`

---

## Open questions handed to `07-open-questions.md`

1. **Does Databento Standard ($199/mo) permit displaying data to end users in a paid product**, or is
   Plus ($1,750/mo) required? The pricing page attaches "external distribution rights" to Plus while
   `EQUS.MINI` marketing says redistribution is supported "without licensing restrictions". These are
   different claims and their intersection is undocumented. **Worth $18,600/year to resolve.**
2. **Does TradingView's Free Advanced Charts Agreement §2.4 ("as a free offering only") permit a
   freemium product whose free tier includes charts?** Ask platforms@tradingview.com in writing.
3. **How does TradesViz achieve DAS Trader Pro auto-sync?** No public page discloses the mechanism.
4. **Is Databento's "T+1 historical requires no exchange licence" accurate against the CTA/UTP plan
   documents themselves**, not just a vendor blog? This underpins the entire EOD cost argument.
5. **Alpaca's position on displaying its market data to an application's end users** — nothing public.
6. **SnapTrade volume pricing** at 1,000+ connected users (Custom plan, unpublished).
7. **Can a journal get itself onto IBKR's Third-party Services picklist**, and what does IBKR require?
   TradesViz is on it `[V]`; the qualification process is not documented publicly.
