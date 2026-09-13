# A7 — Derived-Sentiment Aggregators

**Track:** A7 (brief §4, `01-sources-social.md` feeder) · **Status:** complete
**Research window:** 2026-09-08 21:30 ET → 2026-09-08 22:10 ET (2026-09-09 ~01:40–02:15 UTC)
**All measurements as-of 2026-09-08/09 unless stated otherwise.**
**Constraints honoured:** no account created, no credential entered, no money spent, no trial started. Every `[V]` below is either the vendor's own published material or a live unauthenticated request made from this machine.

Evidence tags per `docs/journal-market-research/00-method.md`: `[V]` verified on the source's own material (incl. our own measurement of their live endpoint) · `[R]` reported by third parties · `[I]` our inference.

---

## 0. Headline

Two aggregators work **right now, with no key, no signup, no headers, no throttling we could provoke**: **ApeWisdom** and **Tradestie**. They are the whole of Rung 0 in this track. Everything else in the named list is either key-gated, dead, frozen, or priced above the $10 cap.

But the two free ones are **not interchangeable, and neither is what it advertises**:

- **ApeWisdom gives us breadth and freshness but no history.** ~787 tickers/day, updating inside 5 minutes, rolling-24h mention counts — and **zero retrievable past**. Its value is entirely prospective: every night we don't collect is a night permanently lost.
- **Tradestie gives us history but its sentiment field is fake.** It serves per-date data back to ~2021-03-20 — genuinely useful — but we measured `sentiment_score` across **480 distinct tickers over 37 non-empty dates spanning 5.4 years and found _zero_ within-ticker variation**. TSLA is `0.381` on all 30 dates it appears. The score is a static per-ticker constant, not a time series. Only `no_of_comments` and the ranking carry date-varying information. Its own docs claim the sentiment is "re-calculate[d]" every 15 minutes; the data says otherwise.

**Recommendation: collect both tonight, persist ApeWisdom in full, and treat Tradestie as a comment-count source only — explicitly drop or quarantine its `sentiment`/`sentiment_score` fields.** Details in §"Night-zero collector targets".

---

## 1. Verdict table

| Vendor | Keyless? | Cost | History | Coverage | Cadence | Methodology | Rung | Verdict |
|---|---|---|---|---|---|---|---|---|
| **ApeWisdom** | **Yes** `[V]` | **$0** | **None via API** `[V]` | ~787 stock tickers/day, ~12K universe `[V]` | <5 min `[V]` | **Disclosed & auditable** (raw counts, published ticker rules) `[V]` | **0** | **TAKE TONIGHT.** Best free source in the track. Raw counts we normalize ourselves. |
| **Tradestie** | **Yes** `[V]` | **$0** | **~2021-03-20 → today, with large holes** `[V]` | Top **50** only `[V]` | 15 min (docs); daily in practice `[V]` | Counts fine; **sentiment is a static constant — broken** `[V]` | **0** | **TAKE TONIGHT, counts only.** Backfill is a genuine bonus. Discard the sentiment fields. |
| SwaggyStocks | No (free acct) | $0 w/ acct | Not exposed | Top 15 free, rest gated `[V]` | Unknown | Undisclosed bull% | 0* | Skip. No public API; SSR page, top-15 free, login wall. Scraping = ToS risk for no marginal data over ApeWisdom. |
| **Quiver Quantitative** | No | $30/mo Hobbyist, $25/mo annual `[V]` | — | — | — | — | **n/a** | **DEAD for this track.** WSB series frozen: last data point **2025-02-21** `[V]`. WSB is not listed in any API tier `[V]`. |
| StockGeist | No | Free/$50/$100 dashboard `[V]`; API credits separate | 24h free / 7d / 30d `[V]` | US + global | 1m/5m/1h/1d `[V]` | **Best-disclosed schema in the track** (12 raw count metrics, per-source) `[V]` | 2–3 | Great schema, terrible economics. $100/mo buys 30 days at **daily** resolution. Dashboard shows "under maintenance". |
| Sentiment Investor | — | — | — | — | — | — | **n/a** | **DEAD.** `sentimentinvestor.com` is NXDOMAIN `[V]`. |
| Utradea | No | Undisclosed | Unknown | Twitter+StockTwits+Reddit `[R]` | Unknown | Raw counts (posts/comments/likes/impressions) `[R]` | ? | **Likely dead.** `cloud.utradea.com` connection **timed out** at 25s `[V]`. Docs live, service not. |
| **Finnhub social sentiment** | No | Premium `[V]` | from/to params `[V]` | US | **Hourly** `[V]` | Reddit + Twitter, scoring undisclosed | 2–4 | **MOVED OFF FREE.** Finnhub's own spec marks `/stock/social-sentiment` `"premium": "Premium required."` `[V]`. The listicles saying it's free are stale. Best schema of any paid option (hourly `mention`/`positiveMention`/`negativeMention`). |
| EODHD sentiment | Demo only | Free plan = 20 calls/day `[V]`; $19.99–$99.99 tiers `[V]` | 2016→now but **30 gaps >4d**, incl. a 594-day hole `[V]` | Full universe on paid | Daily `[V]` | **News articles, not social** `[V]`; `/tweets-sentiments` returned `[]` on demo | 1–2 | Marginal. This is Track B (news) data wearing a sentiment label. Batching (comma-separated tickers) makes 20 calls/day survivable. |
| Tickeron | — | — | — | — | — | — | **n/a** | **DEAD END.** `api.tickeron.com` NXDOMAIN; `tickeron.com` 403s bots `[V]`. Not a sentiment-data vendor. |
| Adanos *(discovered)* | No | Free 250 req/**month**; $29 / $299 `[V]` | 30d free / 90d / 365d `[V]` | 50+ subreddits + X + news | Hourly `[R]` | BuzzScore formula named, not specified | 2 | Skip. Free tier is a demo, not a source. **Also writes the listicles that rank itself #1 — treat all its comparative claims as marketing.** |
| FMP social sentiment *(discovered)* | No (free key) | Free 250 calls/day `[R]` | Historical endpoint exists | StockTwits + Twitter | Hourly `[R]` | **Sourced from SentimentInvestor** `[R]` — which is a dead domain `[V]` | 1 | **Suspect.** Docs marked "Legacy". Freshness unverifiable without a key. Put on the K checklist with an explicit "check the newest timestamp first" test. |
| LunarCrush | No | — | — | Crypto-primary | — | — | 2+ | 401 keyless `[V]`. Crypto focus; low relevance to US-equity breakouts. |
| SentiSense | No | — | — | — | — | — | ? | `api.sentisense.ai` does not resolve `[V]`. Appears mainly as a name in 2026 listicles. |
| socialsentiment.io | — | — | — | — | — | — | **n/a** | **DEAD.** Domain now redirects to an unrelated Vietnamese streaming site `[V]`. |
| Stocksera | — | — | — | — | — | — | **n/a** | **DEAD.** `stocksera.pythonanywhere.com` shows PythonAnywhere's expired-account page; `stocksera.io` NXDOMAIN `[V]`. |

\* SwaggyStocks is Rung 0 only if we create a free account, which the brief forbids tonight. It goes on the Track K checklist at low priority.

---

## 2. ApeWisdom

**Base:** `https://apewisdom.io/api/v1.0/filter/{filter}[/page/{n}]`
**Docs:** `https://apewisdom.io/api/` · **Methodology:** `https://apewisdom.io/methodology/`
**Operator:** same team as `companiesmarketcap.com` `[V]`

### Access & auth
- **No API key, no header, no cookie, no referer check.** Plain `curl` returns 200 `[V]`.
- Served through Cloudflare, `cf-cache-status: DYNAMIC`, HTTP/2 `[V]`.

### Rate limits — measured, not documented
- **No documented rate limit anywhere on the API page** `[V]`.
- **No `x-ratelimit-*`, `retry-after`, or any throttling header in the response** `[V]`.
- Measured: **30 sequential requests → 30× HTTP 200**; then **60 requests at concurrency 20 → 60× HTTP 200**, immediately followed by another 200 `[V]`. We could not provoke a limit.
- Latency: **0.20–0.44 s**, median ~0.21 s `[V]`.
- `[I]` Effectively unmetered at any cadence we would plausibly use. **We should still self-limit** — an undocumented limit is a limit that can appear without warning, and 8 page requests × 4 snapshots/day is 32 requests/day, which is nothing.

### History depth — **the decisive fact**
**There is no history. At all.** `[V]`

- No date/from/to parameter is honoured: `?date=2026-09-01` returns the identical current payload `[V]`.
- No `history` path exists: `/api/v1.0/history/GME` and `/api/v1.0/ticker/GME` both return `[]`; `/filter/all-stocks/history` silently returns the current snapshot `[V]`.
- **Unknown filter names return `{"count":0,...}`, not 404** — so path-guessing gives false negatives. `filter/nonsense-filter` → `count: 0` `[V]`. Any collector must validate filter names against the published list, not against HTTP status.
- The public per-ticker page (`/stocks/GME/`) embeds a Chart.js series, but it is **9 points at 10-minute steps = an 80-minute window**, and `?range=30d` / `/30d/` return byte-identical charts `[V]`. Deeper charts are behind the sign-in wall.
- The only backward-looking data in the API is the **single lag pair** `mentions_24h_ago` / `rank_24h_ago` `[V]`.

`[I]` **This is why the collector must start tonight.** ApeWisdom is the best free source in the track and it is a pure flow — every night not collected is permanently unrecoverable. Nothing in Rung 1–4 buys back ApeWisdom's past.

### Coverage breadth
Full `all-stocks` pull (8 pages, 787 rows) on 2026-09-08 `[V]`:

| Threshold | Tickers |
|---|---|
| total rows returned | 787 |
| mentions ≥ 10 | 48 |
| mentions ≥ 5 | 94 |
| mentions ≥ 2 | 183 |
| mentions == 1 | 604 |
| `mentions_24h_ago` null | 252 |

Site header claims a tracked universe of **12K stocks / 551 cryptos / 12.5K all / 344 4chan** `[V]`.

`[I]` **The honest read for a breakout trader: the daily signal universe is ~50–100 names.** 77% of returned rows are a single mention — indistinguishable from noise. A small-cap breakout candidate that is *not* already a WSB name will show 0 or 1. This does **not** kill the source; it reframes it. ApeWisdom cannot be an alerting layer over the whole liquid universe (~4,174 names/day per `docs/market-scans/phase-1-spec.md`). It can be (a) a *context* column on the ~50 names that are in play, and (b) the raw material for H3 (fresh discovery: 0→N activation), which is precisely a question about the *bottom* of this distribution, where a jump from 0 to 6 mentions is a real event.

### Update cadence & window semantics — measured
Methodology page: *"scans the most popular stock and cryptocurrency sub reddits twice an hour"* `[V]`.

We sampled `all-stocks` every 5 minutes over a 15-minute window and diffed `[V]`:
- **27 of the top 100 tickers changed within a single 5-minute interval.** Freshness is well under the documented 30 minutes.
- Values move in **both directions** — `AGI: 139 → 138 → 137`, `QQQ: 64 → 64 → 63`, `MU: 186 → 187 → 187`. Cumulative across consecutive samples: **6 increases, 7 decreases**; end-to-end over 15 minutes, **11 of the top 100 rose and 8 fell**.
- Control: **Tradestie's 50 rows changed 0 times over the same 15 minutes** `[V]`, so the movement is ApeWisdom's, not an artefact of our sampling.

`[V]→[I]` **`mentions` is a rolling trailing-24h count, not a cumulative day count.** This matters enormously for signal design and is not stated anywhere in their docs:
1. A snapshot at time *T* measures attention over *[T−24h, T]*. A **09:15 ET snapshot is a genuine pre-market attention state** — exactly what H5 (overnight attention delta) and the Morning Plan panel need. This is a feature, not a defect.
2. Two snapshots 24h apart are near-independent windows; two snapshots 4h apart overlap ~83% and **must not be differenced naively** to get "mentions in the last 4 hours".
3. `mentions_24h_ago` is a lagged rolling window, so `mentions / mentions_24h_ago` is a clean, self-normalizing velocity ratio with no baseline needed — a free head start on the D-track metric family.
4. Snapshot timestamps must be recorded to the second. A rolling window is meaningless without knowing where it ends.

### Underlying source — disclosed
**Reddit + 4chan /biz.** `[V]` The API page lists the exact filter values, which are the sources:

`all` · `all-stocks` · `all-crypto` · `4chan` · `CryptoCurrency` · `CryptoCurrencies` · `Bitcoin` · `SatoshiStreetBets` · `CryptoMoonShots` · `CryptoMarkets` · `stocks` · `wallstreetbets` · `options` · `WallStreetbetsELITE` · `Wallstreetbetsnew` · `SPACs` · `investing` · `Daytrading` `[V]`

All verified live except that `superstonk` (not on the list) correctly returns `count: 0` `[V]`. Note `pennystocks` and `stockmarket` also return data (267/115 rows) despite not appearing on the published list `[V]` — the list is incomplete.

### Methodology — disclosed and auditable
This is ApeWisdom's real advantage over every scored competitor. From `/methodology/` `[V]`:
- Ticker detected by **bare uppercase token** (`AMD`) **or** `$`-prefix (`$aapl`, `$AAPL`).
- *"If a ticker is present two or more times in a submission or a comment this will still be counted as a single mention"* — **mentions are deduplicated per post/comment**, so `mentions` ≈ *number of distinct posts/comments referencing the ticker*, not raw token frequency. Good: it is already partially bot-resistant.
- Common-word tickers (`CFO`, `YOLO` named explicitly) counted **only** with the `$` prefix.
- Only tickers listed on Infinite Marketcap are displayed.
- Scans **twice an hour** (our measurement says the served data moves faster).

**Not disclosed:** how `upvotes` is aggregated; whether posts and comments are weighted differently; the full blacklist.

**Verdict on auditability: this is raw material, not a black box.** `mentions` and `upvotes` are counts with a stated construction rule. We can compute our own z-scores, percentiles, velocity, and attention-per-dollar-volume on top of them (brief §D). That is worth strictly more than any competitor's undecomposable 0–100 "sentiment score", because a black-box score cannot be renormalized, cannot be audited for regime drift, and silently embeds the vendor's own (unstated, unstable) model.

### Ticker-collision contamination — a real and measurable defect
The blacklist is clearly narrow. On 2026-09-08 `all-stocks`:
- `AGI` (Alamos Gold, a gold miner) ranked **#3 with 140 mentions**, and **371 mentions 24h ago** `[V]`. `[I]` Overwhelmingly likely to be "AGI" = artificial general intelligence, not the miner. A mid-cap gold miner does not out-mention NVDA on WSB.
- The blacklist *does* work where they applied it: `AI` (C3.ai) sat at **rank 587 with 1 mention** `[V]` — correctly suppressed.
- Cross-vendor confirmation of the same class of failure: SwaggyStocks' #1 ticker was **`OIL` with 354 mentions** `[V]`, and Tradestie's top ticker was **`AI` on 27 of 37 sampled dates** `[V]`.

`[I]` **Action for Track D:** cashtag collision is not a hypothetical trap, it is present in today's live data at rank 3. The collector should persist the raw rows unaltered and apply a **project-side deny-list at analysis time** (`AGI`, `AI`, `OIL`, `TA`, `IT`, `ON`, `ALL`, `CEO`, `EV`, `DD`, `PM`, `OR`, `SO`, `GO`, `NOW`, `RE`, `AM`, `PT`, `USA`, `SPY`/`QQQ` as market-proxies rather than single names). Filtering at ingest destroys evidence; filtering at analysis is reversible. Note that Tradestie ranked `TA` in the top 50 on 23 of 37 dates `[V]` — almost certainly "TA" = technical analysis.

### Terms / redistribution (feeds Track H)
- **No terms-of-service page exists.** `/terms/` and `/about/` both 404 `[V]`. Only `/privacy/` exists.
- The API page states no licence, no attribution requirement, no commercial-use restriction, and no rate limit `[V]`.
- `[I]` **Absence of a licence is not a grant of one.** Safe for private research and internal journal enrichment. **Do not put ApeWisdom-derived numbers on the public tapereader.us surface** until Track H resolves this — likely by asking them directly (`hello@8marketcap.com`, published on their API page `[V]`).

### Collector gotchas
- The docs' sample response shows `"mentions":"2"` and `"upvotes":"2"` as **strings**; the live API returns them as **numbers** `[V]`. Parse defensively — coerce.
- Company names are **HTML-entity-encoded** in JSON: `"SPDR S&amp;P 500 ETF Trust"` `[V]`. Decode on read or store raw and decode at render.
- Pagination is 100/page; `pages` tells you the count; requesting `page/99` returns `results: []` with the correct `count`/`pages`, not a 404 `[V]`.
- `mentions_24h_ago` is `null` for 252/787 rows (new entrants) — NULL, not 0. Preserve the distinction; it *is* the H3 fresh-discovery signal.

---

## 3. Tradestie

**Working base:** `https://tradestie.com/api/v1/apps/reddit[?date=MM-DD-YYYY]`
**Documented base:** `https://api.tradestie.com/v1/apps/reddit` — **BROKEN, see below**
**Docs:** `https://tradestie.com/apps/reddit/api/`

### ⚠️ The documented endpoint has an expired TLS certificate
```
api.tradestie.com  →  CN=tradestie.com, Let's Encrypt R13
                      notAfter = Jan  3 23:17:12 2026 GMT      ← expired 8 months ago
tradestie.com      →  CN=tradestie.com, Google Trust Services WE1
                      notAfter = Nov 15 09:22:08 2026 GMT      ← valid
```
`[V]` measured 2026-09-08 via `openssl s_client`. Every `curl` to `api.tradestie.com` fails with `SSL certificate problem: certificate has expired`. **A collector written from their documentation will not work.** Use the `tradestie.com/api/...` host. `[I]` Also a small negative signal on how actively the service is maintained.

### Access & auth
- Docs state plainly: *"No API key or token is required — this API is free and open."* `[V]`
- **User-Agent gate:** requests with UA `Python-urllib/3.13` return **403**; `curl`'s default UA, a browser UA, and a custom `tapereader-collector/1.0` all return **200** `[V]`. The collector **must** set an explicit non-default User-Agent — a naive `urllib`/`requests`-default script will silently 403 every night.

### Rate limits
- Documented: **20 requests per minute per IP** `[V]`.
- Measured: **40 rapid sequential requests → 40× HTTP 200**, no throttling observed `[V]`. Enforcement appears absent, but **honour the documented 20/min** — it is the one published number we have, and a backfill is the exact workload that would trip it.
- Latency: **0.12–0.22 s** `[V]`.

### History depth — real, deep, and full of holes
`?date=MM-DD-YYYY` (that exact format; `YYYY-MM-DD` returns a 400 with a helpful message) `[V]`.

**Floor:** between `03-15-2021` (empty) and `03-20-2021` (50 rows) `[V]`.

**Coverage map — 15th of each month, 2021-04 → 2026-08, rows returned** `[V]`:

| Period | Rows/day | Status |
|---|---|---|
| 2021-04 → 2023-09 | 50 | **usable** |
| **2023-10 → 2024-03** | **0** | **6-month hole** |
| 2024-04 → 2024-09 | 50 | usable |
| **2024-10 → 2025-07** | **0–2** | **10-month hole** |
| 2025-08 → 2026-09 | 50 | **usable** |

A contiguous 30-day scan of 2026-08-10 → 2026-09-08 returned **50 rows on all 30 days, weekends included** `[V]`. So the recent regime is complete and daily.

`[I]` Usable continuous history is roughly **~30 months in three disjoint blocks**. That is enough to characterise the *shape* of WSB attention distributions and to sanity-check a normalization scheme, but **not enough for a clean walk-forward backtest** — and the two holes land in exactly the period most of the journal's own trades would sit in. Treat Tradestie history as a **descriptive prior**, not an evaluation set.

### Coverage breadth
**Top 50 tickers only.** `[V]` No pagination, no `limit` parameter (`&limit=100` is ignored — identical 50-row response) `[V]`.

`[I]` Strictly narrower than ApeWisdom's 787. Its only unique contribution is the historical archive.

### **The sentiment field is a static per-ticker constant — measured, and it contradicts their docs**

This is the most important finding in the track.

Their docs claim: *"Every 15 minutes, algorithm takes in to account all the comments till that point of time and re-calculates the sentiment"* and *"The sentiment reflects the daily sentiment"* `[V]`.

**Test:** 42 dates sampled at 47-day intervals from 2021-05-01 to 2026-09-08 (37 non-empty), yielding **480 distinct tickers**, of which **87 appear on ≥5 different dates**.

**Result:** `[V]`
```
distinct tickers:                                   480
tickers with >1 distinct sentiment_score:             0
tickers seen on >=5 dates:                           87
   ...of those, varying:                              0
```
Concretely: `TSLA` = `0.381` on all **30** dates it appears (2021 through 2026). `AI` = `0.117` on all 27. `NVDA` = `0.106` on all 27. `AAPL` = `-0.091` on all 27. `SPY` = `-0.152`.

A second, independent check: four live snapshots taken 5 minutes apart across a **15-minute window** showed **0 changes** in any of the 50 rows, including `no_of_comments` — so the "every 15 minutes" recalculation cadence is also not observable `[V]`. (ApeWisdom moved 19 of its top 100 over the identical window, so this is not a sampling artefact.)

**Conclusions:**
1. `sentiment_score` and `sentiment` (`Bullish`/`Bearish`) are **fixed per-ticker attributes**, applied identically to every historical date. They carry **zero within-ticker time-series information**. Any backtest that regresses returns on Tradestie's `sentiment` is regressing on a ticker fixed-effect wearing a sentiment costume — it will look like it works and mean nothing.
2. **This is a look-ahead-bias landmine of exactly the kind the brief names in §D.** A single score stamped onto 2021 data was not computable in 2021. Using it is time-travel.
3. The only genuinely date-varying fields are **`no_of_comments`** and the implied **rank** (array order).

`[I]` **Persist `no_of_comments` and rank. Store `sentiment`/`sentiment_score` only in a quarantined column explicitly flagged `NOT_A_TIMESERIES`, or drop them.** The pre-registration doc (D2) should name this as a specific excluded variable so nobody rediscovers it in March and gets excited.

### Underlying source & methodology
- **r/wallstreetbets only** — the docs are explicit: *"Get top 50 stocks discussed on Reddit subreddit - Wallstreetbets"* `[V]`.
- `no_of_comments` = comment count referencing the ticker. Deduplication rules, ticker-detection rules, and the scoring model are **all undisclosed** `[V]`.
- Same collision problem as everyone: `AI` topped 27 of 37 sampled dates, `TA` appeared in the top 50 on 23 `[V]`.
- Update cadence documented as 15 min; measured as **not changing within 10 minutes** `[V]`. `[I]` Effectively a daily source. A single fixed-time daily snapshot loses ~nothing.

### Terms
Site has Terms of Service and Privacy links; the API doc page itself imposes no licence or attribution requirement `[V]`. Same Track H caveat as ApeWisdom: fine for private use, **unresolved for public redistribution**.

---

## 4. SwaggyStocks

**Surface:** `https://swaggystocks.com/dashboard/wallstreetbets/ticker-sentiment` (server-rendered Next.js)

- **No public API.** `api.swaggystocks.com` resolves and runs an Express server, but every route we tried returns `Cannot GET /...` — `/`, `/api`, `/health`, `/sentiment`, `/wsb`, `/wsb/sentiment`, `/api/wsb/sentiment`, `/ticker-sentiment`, `/v1/wsb/sentiment` `[V]`.
- The page is server-rendered with **no client-side XHR at all** (verified by driving a real browser and reading the network log — zero API requests after page load) `[V]`. There is no endpoint to point a collector at; the data only exists inside the HTML.
- **Top 15 tickers free, everything else behind "Login to View More · Create a free account to unlock all tickers."** `[V]`
- Data shown per ticker: `Mentions`, a bullish percentage with a Bullish/Neutral/Bearish label, rank + prior rank, `Call-to-Put OI`, `30D IV`. Windows: 12H / 1D / 1W `[V]`.
- Methodology **undisclosed** — the bullish % has no published construction `[V]`.
- Same collision defect: **`OIL` ranked #1 with 354 mentions** `[V]`.

**Verdict: skip.** Requires either an account (forbidden tonight) or HTML scraping of a site with a `/tos` page, to obtain a narrower, less-transparent version of what ApeWisdom gives us keyless. The one genuinely differentiated field is the options overlay (`Call-to-Put OI`, `30D IV`) — but that is derivable from Track C sources without touching their ToS.

---

## 5. Quiver Quantitative — **dead for this track**

- `api.quiverquant.com/beta/live/wallstreetbets` → **401** `{"detail":"Authentication credentials were not provided."}` `[V]`.
- **Pricing** (`api.quiverquant.com/pricing/`, as-of 2026-09-08) `[V]`:

| Tier | Monthly | Annual | Datasets |
|---|---|---|---|
| Hobbyist | **$30.00** | $25.00/mo ($300/yr) | Congress Trading, Politician Net Worth, Corporate Donors, Gov Contracts, Lobbying, Off-Exchange Trading, Trump Trades; 10 of 18 MCP tools |
| Trader | **$75.00** | $62.50/mo ($750/yr) | + Insider Trading, Hedge Fund Activity, ETF Holdings, Top Shareholders, Patents, Exec Comp, App Ratings, Newsfeed; all 18 MCP tools |
| Commercial | quote | — | + commercial use rights, higher rate limits |

- **No free API tier.** Website Premium ≠ API access `[V]`.
- **WallStreetBets is not listed in any tier's dataset list** `[V]`.
- **The public WSB dataset is frozen.** We pulled `https://www.quiverquant.com/wallstreetbets/` and extracted every ISO date in the page: the series runs to **2025-02-21 and stops** `[V]`. Independently reported as stale since the same date `[R]`.

**Verdict:** even at $30/mo — 3× over the cap — you would be buying Congressional trading data, not sentiment. `[I]` Quiver is a *political/insider* alt-data vendor that used to have a WSB tracker. For A7 purposes it does not exist. It may still matter to a different track (Congress trades as a catalyst source); that is not this track's call.

---

## 6. StockGeist

**API:** `https://api.stockgeist.ai` (FastAPI; `openapi.json` is **public and unauthenticated** `[V]`)

- **Key required for all data.** With `start`/`end` supplied, `hist/message-metrics` returns `401 {"detail":"Invalid API token"}` `[V]`.
- **Dashboard pricing** (as-of 2026-09-08) `[V]` — and the page carries the banner *"StockGeist.ai dashboard is under maintenance"* `[V]`:

| Tier | Monthly | History | Resolution | Ranking depth |
|---|---|---|---|---|
| Free | $0 | past 24 h | 5-minute | top 5, 3 watchlist |
| Starter | **$50** | past 7 days | 1-hour | top 10, 10 watchlist |
| Pro | **$100** | past 30 days | **1-day** | top 20, 20 watchlist |

`[I]` Read that table again: **$100/month buys 30 days of daily-resolution data on 20 tickers.** For a study tool that needs multi-year history across hundreds of names, this is close to the worst value in the track. API credit pricing is separate and not published on that page.

- **Methodology is the best-disclosed in the entire track**, and worth recording as the *shape* of what good looks like `[V]`, straight from their OpenAPI spec:
  - **Sources are selectable and named:** `stocktwits`, `reddit`, `twitter`.
  - **Timeframes:** `1m`, `5m`, `1h`, `1d`.
  - **12 raw count metrics**, not a composite score:
    `pos_em_count`, `pos_nem_count`, `neu_em_count`, `neu_nem_count`, `neg_em_count`, `neg_nem_count`, `em_total_count`, `nem_total_count`, `pos_total_count`, `neu_total_count`, `neg_total_count`, `total_count`
    — i.e. polarity **×** emotionality, cross-tabbed, as counts.
- `[I]` **This is the schema we should aim our own derived store at**, whether or not we ever pay them. Polarity × emotionality × source × timeframe, all as counts, lets a consumer compute unanimity, dispersion, and polarity ratios themselves. That decomposition — not the price — is the thing worth stealing.

**Verdict: Rung 2–3, and poor value even there.** Note as the reference schema; do not buy.

---

## 7. Finnhub social sentiment — **has moved off the free tier**

The brief asked specifically whether this is still free. **It is not.** `[V]`

Finnhub's own embedded API spec (extracted from `finnhub.io/docs/api/social-sentiment`, 2026-09-08) carries a per-endpoint gating field. For `/stock/social-sentiment`:

```
"freeTier": null,     "premium": "Premium required.",     "highUsage": null
```

For contrast, from the same spec on the same day `[V]`:

| Endpoint | freeTier | premium |
|---|---|---|
| `/stock/social-sentiment` | null | **"Premium required."** |
| `/news-sentiment` | null | **"Premium Access Required"** |
| `/stock/insider-sentiment` | null | null *(free)* |
| `/company-news` | "1 year of historical news and new updates" | null *(free)* |

Keyless request returns `401 {"error":"Please use an API key."}` `[V]`.

**Every 2026 listicle we found claiming Finnhub social sentiment is on the free tier is stale** `[R]` — a clean example of the search-surface hazard the brief warns about in §2. Do not put this on the Track K signup list as a free win.

**What it would give us, if bought** `[V]`:
- Sources: *"social sentiment for stocks on Reddit and Twitter"* (the only methodology statement — the scoring model is a **black box**).
- Params: `symbol` (required), `from`, `to` — so **real history**, per-symbol.
- **Hourly resolution**, with the response decomposed into countable parts:
```json
{"data":[{"atTime":"2021-05-08 14:00:00","mention":32,
          "positiveScore":0.9213675,"negativeScore":-0.9864475,
          "positiveMention":20,"negativeMention":12,
          "score":-0.0341123222115352}], "symbol":"AAPL"}
```

`[I]` `mention` / `positiveMention` / `negativeMention` are **raw counts we could renormalize ourselves** — that makes it materially more auditable than a bare composite, even though `score` itself is opaque. Hourly + per-symbol history is the single best fit in this track for **H5 (overnight attention delta)**, because it can be *replayed* rather than only accrued. Price is not published on the pricing page as a line item; third-party reports put Finnhub premium bands at **$11.99–$99.99/mo** with alt-data as add-ons `[R]` — unverified, and the range is wide enough to be useless for planning. **Track K action: this needs a price, from Finnhub, in writing.** If the entry price is genuinely near $11.99 it is the most interesting near-cap option in the track; if alt-data is a $50+ add-on it is Rung 3.

---

## 8. EODHD sentiment

**Endpoints:** `https://eodhd.com/api/sentiments` and `https://eodhd.com/api/tweets-sentiments` `[V]`

Tested using **EODHD's own publicly documented `demo` token** — their published sample credential, restricted to a handful of demo tickers. No account, no signup, nothing entered.

### Measured behaviour
```
GET /api/sentiments?s=AAPL.US&from=2015-01-01&to=2026-09-08&api_token=demo&fmt=json
→ 200, 2199 rows, 2016-02-19 → 2026-09-08
   {"date":"2026-09-08","count":30,"normalized":0.508}
```
- **Fields:** `date`, `count` (articles analysed that day), `normalized` (docs: −1..+1) `[V]`.
- Measured distribution over 2199 AAPL rows: min **−0.993**, max **1.0**, mean **0.583**, median **0.618**, **only 60 negative values (2.7%)** `[V]`. `[I]` The scale is real but heavily positively skewed — cross-sectional comparison will need de-meaning, and a raw threshold like "normalized < 0" will fire ~3% of the time.
- **History is deep in span but badly holed:** **30 gaps longer than 4 days**, including a **594-day gap from 2016-02-19 to 2017-10-05**, then 53/62/44/67/123-day gaps through 2018 `[V]`. `[I]` Pre-2019 is unusable; recent years look dense.
- **Ticker gating on demo:** `AAPL.US`, `TSLA.US`, `AMZN.US` return data; `NVDA.US`, `GME.US`, `SOUN.US` return `Forbidden` `[V]` — as documented for the demo token.
- **Batching works:** `s=AAPL.US,TSLA.US,AMZN.US` returns **all three tickers in one response** `[V]`. This is the single most important economic fact about EODHD here — see below.
- `/api/tweets-sentiments` returned **`[]`** for both AAPL and TSLA on demo `[V]`. Either demo-gated or empty; **unverifiable without a key.**

### Source & methodology
- `/api/sentiments` is **news-article sentiment**, not social — `count` is explicitly "number of articles analysed" `[V]`. EODHD's docs hedge with *"calculated from news and social media"* but the field semantics say articles `[V]`.
- Scoring model **undisclosed** — a black box producing one number per ticker-day.

`[I]` **This is Track B data, not Track A7 data.** The social product is `/tweets-sentiments`, which we could not verify at all. Do not count EODHD as a social-sentiment source on the strength of the endpoint that works.

### Cost
`[V]` as-of 2026-09-08: Free **$0 / 20 API calls per day**; EOD All-World **$19.99/mo**; EOD+Intraday **$29.99/mo**; Fundamentals **$59.99/mo**; ALL-IN-ONE **$99.99/mo** — all paid tiers 100,000 calls/day. Their docs note the free plan *"can't access certain data types."*

`[I]` The free tier's 20 calls/day sounds fatal but **batching rescues it**: if the multi-ticker limit is meaningfully large, 20 calls/day could cover a few hundred tickers daily. We could not measure the per-call ticker ceiling (demo allows 3). **Track K action: on signup, first measure how many comma-separated tickers one `/api/sentiments` call accepts, and confirm whether `sentiments` is one of the "certain data types" the free plan excludes.** Those two numbers decide whether EODHD is a Rung 1 option or nothing.

---

## 9. Dead ends (one line each)

- **Sentiment Investor** — `sentimentinvestor.com` **NXDOMAIN**. Company gone. `[V]`
- **Utradea** — docs live (`cloud.utradea.com/v1/get-social`, `Authorization` header, sources reddit/stocktwits/twitter, fields posts/comments/likes/impressions) `[R]`, but the host **timed out after 25 s** and `api.utradea.com` 404s at root `[V]`. Presume dead; needs a key regardless.
- **Tickeron** — `api.tickeron.com` NXDOMAIN; `tickeron.com` 403s non-browser clients. Not a sentiment-data vendor. `[V]`
- **socialsentiment.io** — domain lapsed; now 301s to an unrelated Vietnamese streaming site. `[V]`
- **Stocksera** — `stocksera.pythonanywhere.com` serves PythonAnywhere's expired-account placeholder; `stocksera.io` NXDOMAIN. `[V]`
- **Adanos** — key-gated; free tier is **250 requests per _month_** with 30-day history; $29/mo (90d) / $299/mo (365d). Also authors the "best sentiment API 2026" listicles that rank Adanos first — **discovered through its own content marketing; treat every comparative claim as advertising.** `[V]` pricing, `[I]` on the marketing.
- **LunarCrush** — `401 Not authorized` keyless; crypto-primary. `[V]`
- **SentiSense** — `api.sentisense.ai` does not resolve; surfaces mainly inside 2026 listicles. `[V]`
- **FMP** (`financialmodelingprep.com`) — all three social-sentiment paths return `401 Invalid API KEY` `[V]`. Docs URL is `.../docs/social-sentiment-api` under a **"Legacy"** heading, and the data is reportedly **sourced from SentimentInvestor** `[R]` — a company whose domain no longer resolves `[V]`. Free key = 250 calls/day `[R]`. **On the Track K list with a mandatory first test: fetch the newest timestamp and confirm it is today's, not 2023's.**
- **CNN Fear & Greed** (`production.dataviz.cnn.io/index/fearandgreed/graphdata`) — returns **418 "I'm a teapot. You're a bot."** to plain curl `[V]`. Macro, not per-ticker; belongs to Track C anyway.
- **alternative.me Fear & Greed** — keyless, works, returns daily index `[V]`. **Crypto only.** Irrelevant to US-equity breakouts; noted so nobody re-checks it.

### Cross-track note (belongs to A3, recorded because we measured it)
`https://api.stocktwits.com/api/2/streams/symbol/{SYM}.json` and `https://api.stocktwits.com/api/2/trending/symbols.json?limit=30` both return **rich JSON, keyless, HTTP 200** `[V]`. The trending call returned 30 symbols including `RKLB`, `SMR`, `AMD`, `TTAN`, `GME`, `AXTI`, `BMNR`, `ALAB`, `VSTM`, `POET` — notably **a very different, more small-cap-and-momentum-flavoured list than either WSB aggregator**, and much closer to a breakout trader's actual universe. Symbol payloads carry `watchlist_count` (GME: 307,450) — a *stock-of-attention* measure, complementary to ApeWisdom's *flow-of-attention*. **Track A3 should treat this as a priority, and the night-zero collector should probably include it** — but the ToS question is A3's and H's to answer, not A7's, so this track does not recommend it unilaterally.

---

## 10. Budget ladder placement

| Rung | Monthly | What A7 delivers at this rung |
|---|---|---|
| **0** | **$0** | **ApeWisdom (787 tickers, <5-min freshness, rolling-24h counts, disclosed methodology, zero history) + Tradestie (top 50, ~30 months of holed history, comment counts only).** This is the whole product. It supports H1/H2/H3/H5/H6 *prospectively* from tonight, and gives a partial descriptive prior from Tradestie's archive. |
| **1** | **≤$10** | **A7 adds nothing at this rung.** No vendor in the track sells anything between $0 and $25. The cheapest real option, EODHD, is $19.99/mo and is news data. **The ≤$10 budget is better spent outside A7** — Rung 1 money should go to Track A/B/C sources, not aggregators. This is a firm negative finding, not a gap in the research. |
| **2** | **$25–50** | **Nothing worth breaking the cap for in this track.** Quiver $30 has no WSB. StockGeist $50 gives 7 days of history on 10 tickers. Adanos $29 gives 90 days. EODHD $19.99–29.99 gives news sentiment with real depth. `[I]` **The first thing worth breaking the cap for is not here — it is a *price quote from Finnhub*.** If Finnhub social sentiment lands near the bottom of its reported $11.99–99.99 band `[R]`, hourly replayable per-symbol history is the single highest-value purchase in this track, because it is the only thing that buys back time we haven't collected. |
| **3** | **$100–200** | StockGeist Pro ($100) — 30 days, daily resolution, 20 tickers. **Does not change the category.** No. |
| **4** | **$500+** | Institutional text-analytics (LSEG/MarketPsych, RavenPack/BigData.com, Social Market Analytics) — multi-year point-in-time-stamped archives with survivorship controls, which is the one thing genuinely unavailable below. Named only to mark the ceiling; nothing here is reachable or necessary. |

**The ladder's shape is the finding: A7 is flat from $0 to $100.** ApeWisdom + Tradestie at $0 gets ~90% of what $100/month gets, and the missing 10% is *replayable history* — which no vendor under $100 sells anyway. Collect now; the accrual *is* the asset.

---

## 11. Night-zero collector targets

Both sources are keyless, require no account, and were verified working minutes before this was written. **Ship the collector against these two and nothing else in this track.**

### Target 1 — ApeWisdom (primary)

```
GET https://apewisdom.io/api/v1.0/filter/all-stocks/page/{1..N}
    N from the "pages" field of page 1 (8 on 2026-09-08)
    User-Agent: tapereader-collector/1.0 (+https://tapereader.us)
    No auth. No headers required. ~0.21 s/request.
```

Also snapshot, same shape, for source decomposition and H6 (regime):
```
GET https://apewisdom.io/api/v1.0/filter/wallstreetbets/page/{n}    (591 rows)
GET https://apewisdom.io/api/v1.0/filter/stocks/page/{n}            (267 rows)
GET https://apewisdom.io/api/v1.0/filter/Daytrading/page/{n}        (168 rows)
GET https://apewisdom.io/api/v1.0/filter/options/page/{n}           ( 98 rows)
GET https://apewisdom.io/api/v1.0/filter/pennystocks/page/{n}       (146 rows)
```
`[I]` `Daytrading`, `options` and `pennystocks` are the three most likely to carry breakout-relevant rather than meme chatter — worth separating from day one so Track D can test whether the sub-source matters. `pennystocks` is undocumented but live.

**Persist every field, verbatim, plus our own envelope:**

| Field | Source | Why |
|---|---|---|
| `ticker` | API | join key |
| `mentions` | API | **the primary series.** Rolling trailing-24h count. |
| `upvotes` | API | engagement weight; aggregation rule undisclosed — keep raw |
| `rank` | API | cheap cross-sectional percentile |
| `mentions_24h_ago` | API | **keep `null` as `null`, never coerce to 0** — null = new entrant = the H3 fresh-discovery signal |
| `rank_24h_ago` | API | lagged rank; `0` appears to be a sentinel for "unranked" |
| `name` | API | HTML-entity-encoded; decode at render, store raw |
| `filter` | ours | which subreddit set this row came from |
| `captured_at` | ours | **ISO-8601 UTC, second precision. Non-negotiable** — a rolling window is meaningless without its endpoint |
| `page`, `count`, `pages` | ours | completeness audit; detect truncated pulls |

**Cadence:** four snapshots per US trading day, at **16:05 ET (prior close), 09:15 ET (pre-market cut — the Morning Plan input), 12:30 ET (midday), 20:00 ET (evening)**. Rationale: `mentions` is a rolling 24h window, so these are overlapping-but-informative reads of *attention state at setup time*, and the 09:15 ET cut is the one H5 and the Morning Plan panel actually consume. Weekends included — WSB is busiest on Sunday nights and Tradestie shows real weekend volume `[V]`.

**Storage** (measured on the real 787-row payload) `[V]`:
| Scope | NDJSON | gzipped |
|---|---|---|
| one full snapshot | 40.0 KB | 7.6 KB |
| 1 snapshot/day × 1 yr | 14.6 MB | **2.8 MB** |
| 4 snapshots/day × 1 yr | 58.3 MB | **11.2 MB** |
| 4/day × 1 yr, `mentions ≥ 2` only | 13.6 MB | 2.6 MB |

`[I]` Trivial against a git repo and trivial against D1's 500 MB. **Do not pre-filter to `mentions ≥ 2`** — the 604 single-mention rows are exactly the population H3 is about. The 11 MB/year is not worth the lost evidence.

### Target 2 — Tradestie (secondary: counts only, plus a one-shot backfill)

```
GET https://tradestie.com/api/v1/apps/reddit                    # today
GET https://tradestie.com/api/v1/apps/reddit?date=MM-DD-YYYY    # historical
    User-Agent: tapereader-collector/1.0     ← REQUIRED (urllib default UA → 403)
    Do NOT use api.tradestie.com — its TLS cert expired 2026-01-03
    Honour 20 req/min (documented); no enforcement observed
```

**Persist:** `ticker`, `no_of_comments`, array index as `rank`, plus `as_of_date`, `captured_at`, `source='tradestie_wsb'`.

**Quarantine or drop:** `sentiment`, `sentiment_score`. If persisted at all, put them in a column literally named to warn — e.g. `tradestie_static_ticker_score__NOT_A_TIMESERIES` — because they are per-ticker constants stamped onto every date and using them as a signal is silent look-ahead bias. Measured: 480 tickers, 37 dates, 5.4 years, **zero variation**.

**One-shot backfill** (do this once, then daily): walk `MM-DD-YYYY` from **2021-03-20** to today at ≤20 req/min ≈ 2,000 days ≈ **100 minutes**. Expect empties in 2023-10→2024-03 and 2024-10→2025-07; record them in the ingest log as *fetched-and-empty*, distinct from *not-fetched*, so a later re-run doesn't churn. `[I]` ~2,000 rows/day × 50 = 100k rows ≈ 5 MB gzipped. Do it tonight — it is the only retrievable past in this track and it costs 100 minutes.

### Idempotency & failure modes to code for
- **Set an explicit User-Agent.** A default-UA Python collector 403s on Tradestie silently and forever.
- **Never point at `api.tradestie.com`** (expired cert) even though it is the documented host.
- **ApeWisdom returns `count: 0` for unknown filters instead of 404** — validate the filter list at startup and alarm on an unexpected zero, or a typo becomes a silent year-long gap.
- **Type coercion:** ApeWisdom docs show `mentions`/`upvotes` as strings, live API returns numbers. Coerce both ways.
- **Empty ≠ failed.** Distinguish HTTP-200-with-`[]` (a real historical hole) from a network error in `ingest_log`, per the market-scans discipline.
- **Store raw responses, filter at analysis time.** The `AGI`/`AI`/`OIL`/`TA` collision deny-list belongs in the analysis layer, not the collector — filtering at ingest destroys evidence irreversibly.

### What this does *not* cover
No source in A7 gives per-post text, author identity, or unique-author counts. **Author diversity — the bot/pump detector the brief names in §D — is not computable from any aggregator in this track.** It requires raw platform access (A2 Reddit, A3 StockTwits, A4 Bluesky). A7 can deliver mentions, velocity, rank, and engagement; it cannot deliver dispersion or authenticity. That gap should be stated plainly in `04-signal-design.md`, because it bounds which hypotheses are testable on Rung 0 data alone.

---

## 12. Open questions for `13-open-questions.md`

1. **What does Finnhub actually charge for social sentiment?** The band `$11.99–$99.99` is third-party `[R]` and too wide to plan against. This is the highest-value unknown in the track — it is the only thing that can buy back history.
2. **How many comma-separated tickers does one EODHD `/api/sentiments` call accept, and is `sentiments` excluded from the free plan's "certain data types"?** Two measurements that decide whether EODHD is Rung 1 or nothing.
3. **Is EODHD `/api/tweets-sentiments` alive?** Returned `[]` on the demo token for both AAPL and TSLA. Could be demo-gating or could be dead.
4. **Is FMP's social sentiment stale?** Docs are marked "Legacy" and the data is reportedly sourced from a company whose domain no longer resolves. One authenticated call to check the newest timestamp settles it.
5. **Redistribution.** ApeWisdom has *no ToS page at all* — absence of a licence is not a grant of one. Track H must resolve this before anything ApeWisdom-derived appears on tapereader.us. They publish a contact address (`hello@8marketcap.com`); asking is cheap and definitive.
6. **Is ApeWisdom's `AGI` = Alamos Gold or artificial general intelligence?** Cross-check `AGI` mentions against AGI's actual dollar volume on the same dates. A clean, cheap validation of how much collision contamination is in the top 10 — and a template for auditing the rest.
