# 08 — Cost Ladder

**Track G · As of 2026-09-08** (every price below was read or measured on 2026-09-08 / 2026-09-09 UTC unless the line says otherwise)

**Evidence key:** `[V]` verified on the vendor's own pricing/terms page or measured live · `[R]` reported by third parties · `[I]` our inference.
**Prices that are quote-only are labelled quote-only. Nothing here is estimated to fill a gap.**

> This file is synthesis. Every figure traces to `00-measured-facts.md`, `01-sources-social.md`,
> `02-sources-news.md`, `03-sources-flow.md`, `09-legal-tos.md`, `13-open-questions.md`, or
> `.wip/*`. Where those files disagree, `13-open-questions.md` governs.

---

## The ladder

**Read the two "what you get" columns as separate products.** They diverge violently, and that
divergence is the most important thing on this page. Private = the gated single-user trade
journal (`/pct-bootcamp/trade-journal`, 302 → Cloudflare Access `[V]`). Public = a page anyone
can load on tapereader.us.

| Rung | What you get — **PRIVATE journal** | What you get — **PUBLIC site** | What you still cannot do | What it costs | Verdict |
|---|---|---|---|---|---|
| **0 · $0** | Polygon/Massive news `insights` on the key **already held** — per-ticker pre-scored sentiment + free-text reasoning, backfillable across the entire existing journal `[V]` · SEC EDGAR full-text search (2001→, exact CIK resolution) `[V]` · ApeWisdom (787 tickers/day, <5 min fresh, disclosed methodology) `[V]` · Tradestie (counts, 2021-03-20→ with holes) `[V]` · Reddit via Arctic Shift (full history, ~4 min lag) `[M]` · Wikipedia pageviews (11.2 yr) `[V]` · FINRA short-sale volume via Query API (365-day rolling) `[V]` · Cboe delayed option chains incl. **IV30** `[V]` · Alpha Vantage `NEWS_SENTIMENT` + Alpaca (free signup) `[V]` | **Only five sources survive the licence test:** Wikipedia pageviews (CC0) · GDELT (attribution) · Bluesky aggregates · SEC EDGAR · FINRA Query API (attribution, free-of-charge, downstream no-redistribution clause) `[V]`. **None of them is a social-sentiment signal.** Wikipedia maps ~84% of the universe; Bluesky is measured empty; GDELT has no tickers; EDGAR and FINRA are catalysts and positioning, not crowd mood | Show any crowd-sentiment number publicly · buy back ApeWisdom's past (it has none) · compute author diversity (no Rung-0 aggregator exposes authors) `[V]` · use StockTwits at all `[V]` | **$0.** No card, no trial. Two of the nine need a free signup (Alpha Vantage, FINRA Public credential) | ✅ **TAKE IT. This is the product.** ~90% of achievable value in the whole study sits here |
| **1 · ≤$10** | **Nothing.** Every subscription product found in the entire survey starts at **$19.99 or above**. The only sub-$10 spend that exists at all is X's usage-based read at **$0.005/post** `[V]` — $10 buys 2,000 posts/month ≈ **95 posts/day across the whole watchlist** | **Nothing.** No vendor at any price under $499 sells a licence permitting public display of derived market analytics `[V]`; no vendor at **any published price** sells one for social sentiment | Everything Rung 0 cannot do, unchanged | $10 | ❌ **DO NOT SPEND IT. There is nothing to buy.** This is the answer to the question that was asked |
| **2 · $25–50** | EODHD $19.99 daily aggregated −1…+1 series `[V]` · StockNewsAPI Premium $49.99 (per-ticker sentiment, March-2019 archive) `[R]` · Massive Stocks Starter $29 `[V]` · StockGeist Starter $50 = **7 days on 10 tickers** `[V]` · Apify-routed X at ~5–20k tweets/day `[V][R]` · Unusual Whales $50 `[V]` | **Still nothing.** Every one of these is `personal` / non-professional / internal-use-only, and Finnhub, Quiver and Alpha Vantage each ban sharing *derived results* by name `[V]` | Replay social history · publish anything · get author-level data | $25–50 | ⚠️ **Buys duplicates of free data.** The only defensible spend here is not a product — it is **getting Finnhub to quote social sentiment in writing** (reported band $11.99–$99.99 `[R]`, unverified) |
| **3 · $100–200** | **Massive Stocks Advanced $199** `[V]` — the first genuine category change, and *not* for the news: it lifts 5 req/min → unlimited, extends news history to 2016-06-22, and unblocks the snapshots + `I:VIX` the project currently works around with the CBOE CSV fallback `[V]` · Official X pay-per-use ≈ **$210/mo** for ~2,000 posts/day — the only way to make X history *replayable* `[I]` · StockGeist Pro $100 = 30 days, daily, 20 tickers `[V]` | **Still nothing.** Massive Advanced is still `license_type: personal` `[V]`. Paying 200× the free tier on the consumer ladder buys rate limit and history, **never licence scope** `[V]` | Publish. At all | $100–200 | 🟡 **If a rung is ever broken, break it here — and for the rate limit and `I:VIX`, not the sentiment** |
| **4 · $500+** | Institutional text analytics: LSEG/MarketPsych, RavenPack/BigData.com, Social Market Analytics — multi-year point-in-time-stamped archives with survivorship controls, the one genuinely unavailable thing below `[R]`. **All quote-only.** Reddit commercial ≈ $0.24/1k, bundles reported ~$12k/mo `[R]`; X Enterprise ~$42k/mo `[R]` | **The licence finally appears — for market data only.** Twelve Data **Venture $499/mo** ($414 annual) is the **cheapest confirmed self-serve public-display licence found anywhere in the survey** `[V]`. Massive Stocks Business **$2,499/mo** ($1,999 committed, $1,599 annual) `[V]`. Databento Plus $1,750 `[V]`. EODHD Enterprise $2,499 `[V]`. **For social sentiment specifically there is still no published price at any tier** | Buy public social sentiment self-serve — it is not sold that way by anyone found | $499 → $42,000 | 📏 **Named to mark the ceiling, per the brief.** $499 is 50× the cap; $2,499 is 250× |

---

## The three findings, stated plainly

### 1. The ≤$10 rung buys essentially nothing. This holds across every track.

This was checked track by track, and it is not a gap in the research — it is the result.

| Track | Cheapest thing above $0 | Price | Tag |
|---|---|---|---|
| **A — social** | Fintel Bronze (resells FINRA data available free and fresher) | **~$10.95/mo** | `[R]`, **unverified** — `fintel.io/plans` and `/pricing` both returned HTTP 403 to curl *and* WebFetch |
| A — social (next) | EODHD EOD All-World / StockNewsAPI Basic | **$19.99/mo** | `[V]` |
| **B — news** | EODHD news / StockNewsAPI Basic | **$19.99/mo** | `[V]` |
| **C — flow** | SerpApi (Google Trends escape hatch), 1,000 searches | **$25/mo** | `[R]` |
| **All tracks** | X API pay-per-use — *the only sub-$10 spend that exists* | **$0.005/post** | `[V]` |

**Every subscription product in the survey starts at $19.99 or higher.** The single lowest-priced
subscription found anywhere is Fintel Bronze at ~$10.95/mo — which is *still above the cap*, could
not be verified because the pricing page 403s, and resells FINRA short-volume data the project can
fetch free and same-day. `[V][R]`

The one genuinely sub-$10 option is X's usage-based read. Do the arithmetic: $10 ÷ $0.005 =
**2,000 post reads/month**, which over ~21 trading days is **~95 posts/day across the entire
watchlist** — under 5 posts per symbol per day for a 20-symbol morning plan `[I]`. That is not a
sentiment signal, it is an anecdote, and a sample that small actively invites over-fitting. The
Apify route lands ~1,200 tweets/day for the same money but requires an account, a card, and
running against a platform whose terms are hostile by construction `[V]`.

**Recommendation: keep the $10.** Not "spend it carefully" — keep it. There is no product at that
price, and the two things that technically exist are worse than nothing because they produce
samples small enough to fool you.

### 2. Rung 0 is unusually strong — enumerate what $0 actually delivers

This is not the usual "free tier is a demo" situation. What $0 delivers here:

**Already paid for, already on the key, zero signup:**
- **Polygon/Massive `/v2/reference/news`** — measured HTTP 200 on the existing `POLYGON_API_KEY`
  `[V]`. Ships an `insights` array of `{ticker, sentiment, sentiment_reasoning}` per article.
  370 articles in a single call covers a full trading day, all carrying insights, no pagination
  needed `[V]`. `insights` coverage is 100% from mid-2024 onward, so **every trade already in the
  journal can be scored retroactively — the history is free** `[V]`. `sentiment_reasoning` is
  substantive free text, which makes it auditable rather than a black box. Steady-state cost:
  ~1 call/day against a 5 req/min limit.

**Keyless, no account, nothing entered:**
- **SEC EDGAR full-text search + `company_tickers.json`** — 2001→present, ~10 req/s, **exact**
  ticker resolution via CIK, legally-filed 8-K item codes `[V]`. The highest-accuracy catalyst
  source at any price, and the only one that is unambiguously publishable. Directly relevant: the
  journal's `Catalyst` column is **100% blank across the whole export** `[V]`.
- **ApeWisdom** — 787 tickers/day, freshness measured under 5 minutes, rolling trailing-24h counts,
  **published methodology** (bare-token or `$`-prefix, deduplicated per post, common-word tickers
  require `$`) `[V]`. Could not provoke a rate limit at 60 requests / concurrency 20 `[V]`.
- **Tradestie** — per-date Reddit counts back to 2021-03-20, ~30 usable months `[V]`. The only
  retrievable social past in the whole study, and it costs 100 minutes of backfill runtime.
- **Wikipedia pageviews** — 2015-07-01→present (11.2 years), CC0, unthrottled at 30 concurrent,
  genuinely exogenous to the tape `[V]`. ~3,510 of ~4,174 liquid names mappable via Wikidata.
- **FINRA daily short-sale volume** via the Query API — 12.2k symbols/day, same-day at ~17:20 ET,
  1,200 req/min `[V]`. Measured **r = −0.005 against RVOL**, i.e. genuinely not a price transform `[V]`.
- **Cboe delayed option chains** — full chain per name with `iv30`, per-contract volume and OI, no
  key; 15 tickers at concurrency 5 = 1 second, zero 429s `[V]`. **IV30 is forward-looking**, and
  every volatility number the project currently has (`ATR`, `ADR`, `30mATR`) is backward-looking.
- **Reddit via Arctic Shift** — full history to 2005, measured ~4 minutes behind live `[M]`. The
  only Reddit route that works; every direct route 403s datacenter IPs, GitHub Actions included `[M]`.
- **Bluesky** `listRecords` — most permissive terms in the entire survey (no anti-scraping clause,
  no automated-access clause, no API clause) `[V]`. Also measured near-empty for US equities, so
  scope it to H6 only.

**Free signup, no card:**
- **Alpha Vantage `NEWS_SENTIMENT`** — the only continuous per-ticker sentiment *and relevance*
  floats in the free field, 25 req/day `[V]`.
- **Alpaca news** — 2015→present raw text, if we ever want to score it ourselves rather than
  inherit a vendor's unreproducible label `[V]`.
- **FINRA "Public" API credential** — **$0/month**, available to individuals by name `[V]`.

The collector already ran. First capture 2026-09-08 21:00 ET: **2,078 rows across six ApeWisdom
filters, 494 KB raw / 46 KB gzipped, idempotency verified** (immediate re-run wrote 0, skipped
2,078) `[V]`. Accrual is a fact, not a plan.

### 3. The expensive problem is not data. It is LICENCE.

**The private journal is nearly free. The public site is priced out of the market entirely.**

| | Private journal | Public tapereader.us |
|---|---|---|
| Best sentiment source | Polygon `insights` — **$0**, already held, backfillable `[V]` | ⛔ barred. Massive's terms prohibit display of "Derived Works" to third parties in three separate clauses, one of which **names websites explicitly** `[V]` |
| Best crowd-attention source | ApeWisdom + Tradestie — **$0** `[V]` | ⚠️ **no published terms at all.** `/terms/` 404s. Absence of a licence is not a grant of one `[V]` |
| Best labelled ground truth | StockTwits Bullish/Bearish tags — ⛔ blocked on **every** reading `[V]` | ⛔ blocked, and ToS §8 says they license derived sentiment products to institutions — a free public bull/bear page is directly adverse to their revenue `[V]` |
| Best positioning series | FINRA short volume — $0 via Query API `[V]` | ✅ **permitted**, with attribution, free of charge, and a downstream no-redistribution notice `[V]` — the one genuinely good public answer found |
| Best attention proxy | Wikipedia pageviews — $0 `[V]` | ✅ CC0, nothing required `[V]` |
| Cheapest licence permitting public display of derived market analytics | n/a | **Twelve Data Venture, $499/mo** ($414 annual) `[V]` — the cheapest **confirmed self-serve** one found anywhere |
| Same, from the vendor we already use | n/a | **Massive Stocks Business, $2,499/mo** ($1,999 committed · $1,599 annual) `[V]` |
| Cheapest licence permitting public display of **social sentiment** | n/a | **No published price exists at any tier from any vendor found.** StockTwits enterprise is "Talk to Sales"; Finnhub, Quiver and Alpha Vantage each ban sharing derived results outright `[V]` |

Three consequences worth stating without hedging:

1. **Paying more on any consumer ladder never buys licence scope.** Massive's pricing pages carry
   a machine-readable `license_type`: Basic $0, Starter $29, Developer $79 and Advanced $199 are
   **all `personal`**; only Business at $2,499 is `commercial` `[V]`. The consumer ladder sells
   rate limit, history depth and latency. It never sells the right to publish.
2. **The gap is roughly 50× the stated budget at the very cheapest**, and 250× from the incumbent
   vendor. There is no intermediate SKU. There is no EOD-only commercial tier — Massive Business
   is advertised as "No Exchange Fees or Approvals", so the $1,599–2,499 is Massive's **own**
   licence fee, and TapeReader needing only T-1 data does not reduce it `[V]`.
3. **This lands on `docs/market-scans/phase-1-spec.md`, not on this study.** That is a fully
   designed, unbuilt public product that publishes Polygon-derived bars, breadth and scan hits.
   It surfaced here by accident and it predates this work. See `13-open-questions.md` §1. The
   sentiment study's journal use case is unaffected on every reading.

**The routes that could change the public answer are free to ask and cost nothing to try:**
Tiingo is the one vendor whose terms explicitly permit distributing irreversible derived
aggregates — "aggregated statistics calculated across multiple instruments" is a listed permitted
example, which describes a breadth page exactly — but §7.3's "internal consumption only" is in
real tension with §1.6(c)'s distribution grant and could not be resolved from the text `[V]`.
Databento's DBEQ carries $0 exchange fees with distribution and display rights, and only its
vendor-side rights at the $199 tier are unclear `[V]`. **Two emails, zero dollars, and either one
could unlock a public product for ≤$30/mo.** That is a far better use of effort than any purchase
on this page.

---

## Per-rung detail: the incremental capability per dollar

### Rung 0 — $0 · what it buys that nothing buys

Covered in Finding 2 above. The incremental question here runs backwards: **what does Rung 0
give up?** Four things, precisely.

1. **No replayable social history.** ApeWisdom has **zero** retrievable past — no date parameter,
   no history path, an 80-minute embedded chart, sign-in wall beyond `[V]`. Tradestie's ~30 months
   is the only exception and it is counts-only. This is why the collector had to start on night
   zero and why no later purchase buys the gap back.
2. **No author-level data**, so **author diversity — the bot/pump detector Track D was asked to
   define — is not computable from Rung 0 aggregators at all** `[V]`. It requires raw platform
   access, and the source where it worked cleanly (StockTwits: 0.164 on `$AUPH`, 0.7–0.85 on
   genuine chatter) is contractually blocked.
3. **No clean ticker resolution.** Only 0.6% of WSB comments carry a cashtag, and **39 of 51**
   common English words tested are real US tickers `[M]`. The collision is in today's live top 10:
   `AGI` (Alamos Gold, a gold miner) at rank #3 with 140 mentions `[V]`.
4. **No public display of anything crowd-derived.**

### Rung 1 — ≤$10 · incremental capability: zero

There is no product. See Finding 1. The $10, spent on X, buys 95 posts/day; spent on Apify, buys
~1,200 tweets/day plus an account, a card and ToS exposure; spent on Fintel (at $10.95, over cap)
buys a nicer front end on FINRA data the project already fetches free and fresher `[V][R]`.

**Incremental capability over Rung 0: none that is worth having.**

### Rung 2 — $25–50 · incremental capability: duplicates, plus one quote worth chasing

| Product | Price | Tag | What it adds over $0 |
|---|---|---|---|
| EODHD EOD All-World | $19.99/mo | `[V]` | Daily aggregated −1…+1 series. But it is **news sentiment wearing a social label** — `count` is explicitly "articles analysed" `[V]`. Polygon already gives per-ticker news sentiment free |
| EODHD EOD+Intraday | $29.99/mo | `[V]` | — |
| StockNewsAPI Basic / Premium | $19.99 / $49.99/mo | `[V]` | Premium adds per-ticker sentiment + a March-2019 archive `[R]`. Duplicates Polygon + Alpha Vantage |
| Marketaux Basic | $29/mo | `[V]` | 2,500 req/day, 20 articles per request. Free tier is 3 articles/request — deliberately undeployable |
| Massive Stocks Starter | $29/mo | `[V]` | Lifts 5 req/min; news history to 2016-06-22. Still `personal` |
| Twelve Data Grow | $29/mo | `[V]` | Personal/internal use only |
| Adanos | $29 (90 d) / $299 (365 d) | `[V]` | Free tier is **250 requests per month**. Also authors the "best sentiment API 2026" listicles that rank Adanos first `[I]` |
| Quiver Hobbyist | $30/mo ($25 annual) | `[V]` | **WallStreetBets is not in any API tier**, and the public WSB dataset is frozen at 2025-02-21 `[V]`. At 3× the cap you would be buying Congressional trading data |
| Tiingo Power | $30/mo | `[V]` | 3-month news history, no sentiment. Interesting only for its *licence*, not its data |
| SerpApi | $25/mo (1,000 searches) | `[R]` | Google Trends escape hatch. 1,000 searches/month does not cover a daily universe scan; even the $150 tier does not `[I]` |
| Alpha Vantage Premium | $49.99/mo (75 req/min) | `[V]` | Lifts 25 req/day. The free tier already works because the unit of work is a symbol, not a day |
| StockGeist Starter | $50/mo | `[V]` | **7 days of history, hourly, top 10 + 10 watchlist tickers** |
| Unusual Whales Retail Basic | $50/mo ($404/yr) | `[V]` | Real-time options flow. Cboe gives per-name IV30 and P/C free |
| FMP Starter | $22/mo | `[V]` | Its social-sentiment endpoints are under a **"Legacy"** heading and reportedly sourced from SentimentInvestor, **whose domain no longer resolves** `[V][R]` |

**Incremental capability over Rung 0: near zero.** Everything here either duplicates a free source
or sells less of it.

**The one thing at this rung with a real argument is not a product — it is a price.**
Finnhub's social-sentiment endpoint gives hourly, per-symbol, `from`/`to`-queryable history
decomposed into `mention` / `positiveMention` / `negativeMention` raw counts `[V]`. It is the only
thing found anywhere that can be **replayed rather than only accrued** — the single capability
money can buy that time cannot. Finnhub does not publish it as a line item; third-party reports
put premium bands at **$11.99–$99.99/mo** `[R]`, which is too wide to plan against. **Get it in
writing. That email is free and it is the highest-value action on this entire page.** (Note the
constraint that follows: Finnhub bans sharing data *or derived results*, so anything bought here
is private-journal-only `[V]`.)

Also record, so nobody re-researches it: **Finnhub social sentiment is not free.** Finnhub's own
embedded spec says `"freeTier": null, "premium": "Premium required."` `[V]`. Every 2026 listicle
claiming otherwise is stale — a clean instance of the vendor-content hazard the brief warns about.

### Rung 3 — $100–200 · the first genuine category change, and it is not about sentiment

| Product | Price | Tag | Incremental capability |
|---|---|---|---|
| **Massive Stocks Advanced** | **$199/mo** | `[V]` | **The only thing at this rung that changes the project's category.** Lifts 5 req/min → unlimited; news history to 2016-06-22; **unblocks snapshots and `I:VIX`**, which the journal currently works around with a CBOE CSV fallback `[V]`. The news insights come along for free. **Still `license_type: personal`** — it does not unlock publishing `[V]` |
| Official X pay-per-use | ≈ **$210/mo** for ~2,000 posts/day | `[I]` from $0.005/post `[V]` | Makes X history **replayable** — full-archive-capable back to March 2006, cashtag-native, ToS-clean. True backtests instead of forward accrual. The one Rung-3 item that changes what is *knowable* |
| Massive Stocks Developer | $79/mo | `[V]` | Intermediate step toward Advanced. `personal` |
| Alpaca Pro | $99/mo | `[V]` | SIP data. Non-professional; *"shall not furnish Market Data to any other person or entity"* `[V]` |
| Twelve Data Pro | $99/mo | `[V]` | Personal/internal use only |
| EODHD ALL-IN-ONE | $99.99/mo | `[V]` | 100,000 calls/day |
| StockGeist Pro | $100/mo | `[V]` | **30 days of daily-resolution data on 20 tickers.** Read that twice — close to the worst value in the survey. Its *schema* (12 raw counts, polarity × emotionality cross-tabbed) is worth stealing; the product is not |
| FMP Ultimate | $149/mo | `[V]` | "Individual" licence |
| Unusual Whales API | $150/mo | `[R]` | — |
| Databento Standard | $199/mo | `[V]` | Not a distribution licence; $125 free signup credits make evaluation genuinely free `[V]` |

**Incremental capability over Rung 2: real but narrow.** Two items justify themselves — Massive
Advanced for the rate limit and `I:VIX`, and X pay-per-use for replayability. Neither is a
sentiment purchase. **If a rung is ever broken, break it here, and be honest that you are buying
market-data plumbing, not crowd mood.**

### Rung 4 — $500+ · where the licence finally appears

| Product | Price | Tag | What it buys |
|---|---|---|---|
| **Twelve Data Venture** | **$499/mo** ($414 annual) | `[V]` | **The cheapest confirmed self-serve licence permitting "commercial display … to third parties" found anywhere in the survey.** This is the number that answers "what would a public product actually cost" |
| Massive 15-min Delayed feed expansion | $499/mo | `[V]` | Feed expansion only; priced on top of a Business plan |
| NewsAPI Business | $449/mo | `[V]` | Free tier is non-commercial and **barred from staging or production** `[V]`. No sentiment, no ticker tagging |
| EODHD "Internal Use" commercial | $399/mo | `[V]` | **Explicitly does NOT permit external display.** Priced here to show the trap |
| Databento Plus | $1,750/mo | `[V]` | Lists "external distribution rights" |
| NewsAPI Advanced | $1,749/mo | `[V]` | — |
| **Massive Stocks Business** | **$2,499/mo** · $1,999 committed · **$1,599 annual** | `[V]` | `license_type: commercial`, self-serve. A 25% startup discount may bring year one to ≈$1,199–1,874 `[V]` |
| EODHD Enterprise | $2,499/mo | `[V]` | — |
| Reddit commercial | ≈$0.24 per 1k, bundles reported ~$12,000/mo | `[R]` | — |
| X Enterprise | ~$42,000/mo | `[R]` | The correct tier for a public site under X's own §III(L)–(M), which limits self-serve plans to "a limited number of end-users" `[V]` |
| LSEG/MarketPsych · RavenPack/BigData.com · Social Market Analytics | **quote-only, unpublished** | `[R]` | Multi-year **point-in-time-stamped** archives with survivorship controls. The one genuinely unavailable thing below this rung |

**Incremental capability over Rung 3: the right to publish, and point-in-time archives.** Nothing
else. And note what is *still* missing at $2,499/mo: **a licence to publish social sentiment.** No
vendor found sells one at a published price at any tier.

**For orientation on why these numbers are shaped this way** `[V]`: direct proprietary exchange
feeds cost vendors ~$60,000/mo to license; the SIPs ~$10,500/mo; Nasdaq's minimum professional
real-time bundle ~$2,051/mo. Retail-priced market data exists because vendors amortise that across
many non-redistributing individuals. Asking to redistribute is asking to leave that pool.

---

## What I would actually spend

### At $0/mo — **✅ this is the recommendation**

Take the whole of Rung 0 and stop. Concretely:

1. **Polygon `insights` → journal enrichment**, backfilled across every existing trade. Free,
   already authorized, auditable via `sentiment_reasoning`. Private use only.
2. **SEC EDGAR FTS → auto-populate the `Catalyst` column**, which is 100% blank today `[V]`. This
   is the highest-value concrete win in the study and it is publishable.
3. **Keep the ApeWisdom + Tradestie collector running.** It is the only thing on this page that
   gets worse every night it does not run.
4. **Run the Tradestie one-shot backfill** — 2,000 days at ≤20 req/min ≈ 100 minutes, ~5 MB
   gzipped. The only retrievable social past in existence for this study.
5. **Add FINRA short volume via the Query API** (free Public credential) and **Cboe IV30**, both
   forward-only, both cheap to start and expensive to delay.
6. **Send two emails** — Tiingo on the §7.3 / §1.6(c) tension, Databento on DBEQ vendor-side
   rights. Either could unlock a public product for ≤$30/mo. Cost: zero.
7. **Get Finnhub's social-sentiment price in writing.** Not to buy it — to know.

### At $10/mo — **buy nothing. Keep the money.**

There is no product. The honest answer to a real budget offered in good faith is that the market
does not sell anything at that price, and the two things that technically exist (95 X posts/day;
an Apify actor requiring a card and running against hostile terms) are worse than the free
alternative because they produce samples small enough to manufacture false confidence.

**If the $10 must be spent on something, spend it outside this category.** $120/year does not
meaningfully advance any hypothesis in this study. It would go further toward the eventual Massive
Advanced $199 (rate limit + `I:VIX`, both of which the journal actually hits) than toward any
sentiment product.

### At $50/mo — **still buy nothing, with one conditional exception**

Nothing in the $25–50 band adds capability over $0. Every candidate either duplicates Polygon and
Alpha Vantage, sells 7–30 days of history on 10–20 tickers, or resells free upstream data.

**The one conditional:** if Finnhub quotes social sentiment at or under ~$50/mo, buy it — and buy
it for one specific reason. It is the only source found anywhere that sells **replayable
per-symbol hourly history**, and replayable history is the only capability money can buy that
waiting cannot. Its value is set by the arithmetic in `05-preregistration.md`: at $0, with
collection starting 2026-09-08 and no backfill, a **large** effect (*d* = 0.5) is not decidable
until **~July 2027**, and a moderate effect (*d* = 0.3) not until **~February 2029** `[V, computed]`.
A replayable archive collapses that wait. Nothing else on this page does.

Two caveats that must travel with that purchase: Finnhub's `score` is a black box (only the raw
`mention` / `positiveMention` / `negativeMention` counts are auditable), and Finnhub's terms ban
sharing data **or derived results**, so it can never touch the public site `[V]`.

### The recommendation in one line

**$0. And the reason is not thrift — it is that the paid market does not sell what this study
needs.** What it needs is (a) replayable social history, which only Finnhub might sell and does not
publish a price for, and (b) a public-display licence for crowd sentiment, which nobody sells at
any published price. Everything the paid market *does* sell between $10 and $200 is a duplicate of
something already free.

---

## Non-monetary costs — a free source with a high maintenance burden is not free

### Build effort

No source file estimated engineering time, so these are `[I]`, scaled against the collector work
already done in this run (the ApeWisdom/Tradestie collector exists and captured live data).

| Work item | Est. build | Notes |
|---|---|---|
| ApeWisdom + Tradestie collector | **done** — ran 2026-09-08 21:00 ET | Sunk cost. 2,078 rows, idempotency verified `[V]` |
| Tradestie one-shot backfill | ~1 h build + **100 min runtime** `[V]` | Must log fetched-and-empty distinctly from not-fetched |
| Bluesky H6 collector | ~2–3 h `[I]` | "~50 lines" per Track A. Must use `listRecords`, never `searchPosts` |
| FINRA Query API collector | ~2–3 h `[I]` | Plus a free credential signup and a site-terms clause the site does not have today `[V]` |
| Cboe IV30 collector | ~3–4 h `[I]` | ~1 MB/name/day; store the derived row, not the raw chain |
| Wikipedia pageviews + Wikidata mapping | ~6–10 h `[I]` | **The mapping is the whole problem.** ~84% coverage at best, and the misses concentrate in exactly the small-cap recent listings that produce the best breakouts |
| Polygon `insights` → journal columns + backfill | ~8–16 h `[I]` | Additive-only sheet migration under `scripts/review/migration-safety.ts`, plus an enrichment pass |
| EDGAR FTS → `Catalyst` auto-population | ~10–16 h `[I]` | Ticker→CIK map, 8-K item-code mapping, after-hours session-boundary handling |
| Ticker extraction + collision deny-list (Track D) | **unbounded** `[I]` | **This, not access, is where signal quality is decided.** 39 of 51 common English words are real tickers `[M]` |

### Ongoing maintenance

Every adopted source except Polygon and Wikipedia is a **keyless third-party endpoint with no SLA,
no contract, and in two cases no terms page at all.** Realistic ongoing burden: **~1–2 h/month
routine, with incident spikes**, plus a standing obligation to watch for silent failure `[I]`.

The collector must alarm on *plausible* data, not just on errors — because every failure mode
found in this run produced HTTP 200.

### Failure modes measured in this run — all of these returned 200 or looked healthy

| Failure | What was measured | Why it matters |
|---|---|---|
| **Expired TLS cert on the documented host** | `api.tradestie.com` cert `notAfter = 2026-01-03` — **expired 8 months ago**; `tradestie.com` is valid `[V]` | **A collector written from the vendor's own documentation does not work.** Also a maintenance signal about the vendor |
| **A sentiment field that is a static constant** | Tradestie `sentiment_score`: 480 tickers × 37 dates × 5.4 years, **zero within-ticker variation** `[V]` | Using it stamps today's constant onto every historical date — **silent look-ahead bias** dressed as a time series |
| **A silently frozen feed still serving 200s** | Cboe free put/call CSVs frozen at **2019-10-04**, still widely cited `[V]`. Quiver's public WSB dataset frozen at **2025-02-21** `[V]` | A feed that stops updating without erroring is worse than one that dies |
| **Silent 403 on a default User-Agent** | Tradestie returns **403** to `Python-urllib/3.13`, 200 to curl/browser/custom UA `[V]` | A naive `requests`-default collector 403s every night, forever, silently |
| **404 semantics replaced by empty success** | ApeWisdom returns `{"count":0}` for **unknown filter names**, not 404 `[V]` | A single typo becomes a silent year-long gap. Validate filter names at startup |
| **Throttling that returns 403, not 429** | Bluesky `searchPosts` degrades to **1 request / 61 s** behind an opaque HTML 403 — no 429, no headers `[V]` | A collector that does not treat 403 as backoff **writes zeros as data** |
| **Datacenter-IP blocks** | Every keyless Reddit route (`.json`, RSS, old.reddit, oauth host) returns **403** to datacenter IPs — **GitHub Actions is blocked too** `[M]` | Would have been discovered only after the workflow was live |
| **Archive-time look-ahead** | Arctic Shift archives at post time, so `score`/`num_comments` read 0–1 for **~36 hours** `[V]` | A live collector and a later backfill of the same day **disagree**. Any score-derived feature trains on values unavailable in real time |
| **NXDOMAIN and lapsed vendors** | `sentimentinvestor.com` **NXDOMAIN** · `api.tickeron.com` NXDOMAIN · `socialsentiment.io` now 301s to an unrelated Vietnamese streaming site · `stocksera.pythonanywhere.com` serves an expired-account placeholder · `api.sentisense.ai` does not resolve · `cloud.utradea.com` timed out at 25 s `[V]` | **Six of the brief's named vendors are dead.** And FMP's social sentiment is reportedly sourced from SentimentInvestor — i.e. a live API fronting a dead upstream `[V][R]` |
| **Stale listicle claims** | Finnhub social sentiment is **premium**, per Finnhub's own spec — every 2026 listicle saying "free" is wrong `[V]` | The category's search surface is vendor marketing. `[V]` overrides `[R]`, always |
| **Storage estimated 6× low** | Track A7 estimated 11 MB/yr gzipped; measured across all six filters it is **66 MB/yr gzipped / 704 MB raw** `[V]` | Not fatal in git, but it compounds, and the estimate was wrong by 6× on the very first measurement |
| **Single-maintainer dependency** | Arctic Shift: one unpaid maintainer, **no stated licence, no uptime guarantee** `[V]` | The only viable Reddit route in existence for this project |
| **No terms page at all** | ApeWisdom `/terms/` and `/about/` both **404**; only `/privacy/` exists `[V]` | Convenient for collection, useless for publishing. **Absence of a licence is not a grant of one** |

### The largest non-monetary cost is not engineering — it is time

`05-preregistration.md` computes it: at ~35 trades/month of which **~50% are index/sector ETFs
with no ticker-level attention signal** `[V]`, analyzable accrual is **~18 trades/month**. With
collection starting 2026-09-08 and no backfill, the first date at which a *large* effect
(*d* = 0.5, ≈0.75 R of MFE) becomes decidable is **~July 2027**; a moderate effect (*d* = 0.3),
**~February 2029**; the effect size the published literature actually reports (*d* ≈ 0.2),
**2032–2041** `[V, computed]`.

**No rung on this ladder shortens that except by buying replayable history — and the only vendor
that might sell it does not publish a price.** That is the honest shape of the whole cost question.

---

## Bottom line

- **$0 is the recommended budget, at every budget.** Rung 0 is not a compromise; it is the best
  available product, and it is already running.
- **The ≤$10 rung is empty.** Every subscription in the survey starts at $19.99+. The lowest
  price found anywhere is Fintel at ~$10.95/mo `[R]`, unverified (403), above the cap, and a
  resale of free FINRA data. The only true sub-$10 spend is X at $0.005/post = ~95 posts/day.
  **Keep the money.**
- **The ladder is nearly flat from $0 to $200 in capability**, and then jumps discontinuously — not
  on data, but on **licence**. $499/mo (Twelve Data Venture) is the cheapest confirmed self-serve
  public-display licence for derived market analytics; $2,499/mo from the vendor already in use.
  For **social sentiment** specifically, a public-display licence has **no published price at any
  tier from any vendor found**.
- **The private journal is nearly free. The public site is priced out.** Design Tracks E and F on
  that split and it holds together; conflate them and the whole thing fails on a contract clause
  rather than on a p-value.
- **The three free actions worth more than any purchase:** email Tiingo (§7.3 vs §1.6(c)), email
  Databento (DBEQ vendor-side rights at $199), and get Finnhub's social-sentiment price in writing.
