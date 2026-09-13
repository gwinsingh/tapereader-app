# 03 — Retail-Flow & Positioning Proxies

**Track C.** Crowd positioning expressed through *behaviour*, not words.

**As-of: 2026-09-08** (all measurements taken 2026-09-08 / 2026-09-09 UTC unless a
line says otherwise).

**Evidence key:** `[V]` verified against the source's own material or measured in a
live response · `[R]` reported by a third party · `[I]` my inference.

**Constraint compliance:** no account was created, no credential entered, no trial
started, no money spent. Every measurement below was taken against an
**unauthenticated** endpoint with `curl`. I deliberately did *not* reuse the
project's `POLYGON_API_KEY`, so nothing here depends on an existing subscription.
One source (Stooq) was abandoned rather than proceed, because it now gates access
behind a proof-of-work bot check — solving that is bot-detection bypass and is
out of bounds.


> ## ⚠️ CORRECTION — read before acting on the FINRA recommendation
>
> This track recommends adopting FINRA daily short-sale volume via the
> **`cdn.finra.org` flat files**, on measured grounds that remain accurate.
> **That specific access route is not licensed for this use.** The site Terms of
> Use ban harvesting, database-building and redistribution.
>
> The dataset is still adopted — but through the **Query API**
> (`api.finra.org/data/group/otcMarket/name/regShoDaily`), which is free, is
> governed by the permissive *Specific Terms for Equity Data*, and expressly
> permits derived data and redistribution with attribution.
>
> **Consequence for the numbers below:** the 8.1 years of history measured here
> exist only on the blocked CDN. The licensed API is a **365-day rolling
> window**, so treat every historical claim in this file as demonstrating the
> data's properties, not as a backfill that may actually be performed.
>
> See `13-open-questions.md` §4 and `.wip/finra-terms-resolution.md`.

---

---

## 1. The bar every source has to clear

The project already computes, from Polygon daily + 1-minute bars:

> RVOL · %ATR · %Gap · dollar volume · distance to 20/50 SMA · opening-range size
> and OR %ATR · %VWAP · breakout volume ratio · prior-day C/H/L · ADR · 30mATR

So the question is not "is this data interesting?" It is: **does this series carry
information that is not already a monotone function of price and volume?** A
put/call ratio that just tracks volume is worthless here. A short-volume ratio that
just tracks RVOL is worthless here.

I tested this empirically rather than asserting it. See §11.

---

## 2. Summary verdict table

| # | Source | Auth | Cost | History depth | Update lag | Coverage | Genuinely additive? | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **FINRA Daily Short Sale Volume** (CDN flat files) | **None** | **$0** | **2018-08-01 → today** (8.1 yr) | **Same day, ~17:20 ET** | 12.2k symbols/day | **YES** — measured r = −0.005 vs RVOL | **ADOPT.** Best source in this track by a wide margin |
| 2 | **Cboe delayed option chain** (`cdn.cboe.com`) | **None** | **$0** | **None — snapshot only** | Live / EOD same day | Every optionable name incl. small caps | **YES** — per-name P/C + IV30 are not price-derivable | **ADOPT (conditionally).** Must self-build history from day 1 |
| 3 | **Wikipedia Pageviews REST API** | **None** | **$0** | **2015-07-01 → today** (11.2 yr) | **T+1, ~by 09:00 UTC** | ~3,510 US tickers mappable (of ~4,174 liquid universe) | **YES** — attention, wholly exogenous to tape | **ADOPT (conditionally).** Mapping is the whole problem |
| 4 | Wikidata SPARQL (ticker→article map) | None | $0 | n/a | n/a | 3,894 US tickers known; 3,510 with en-wiki article | Enabler, not a signal | **ADOPT as infrastructure for #3** |
| 5 | FINRA Consolidated Short Interest (biweekly) | None | $0 | ≥2018-05-31 | **25 days** (measured) | All NMS + OTC | Weakly — it is a *stock*, not a *flow* | **CUT** as a signal; keep as slow context only |
| 6 | FINRA ATS / OTC Weekly Transparency ("dark pool") | None | $0 | ≥2022 via API | **22 days** (measured) | Per-symbol per-venue | Would be, if it were timely | **CUT** — lag kills it |
| 7 | SEC Fails-to-Deliver (CNS) | None | $0 | Long | **~3–5 weeks** (measured) | All CNS-eligible | No | **CUT** |
| 8 | **Google Trends** (unofficial / pytrends) | None | $0 | 2004→ | Daily–ish | Global | Would be | **CUT** — measured HTTP 429 on the *first* request |
| 9 | SerpApi / scraper-vendor Google Trends | API key | **$25/mo** for 1k searches | 2004→ | Daily | Global | Would be | **CUT** — 2.5× over the ≤$10 rung, for a weak signal |
| 10 | Cboe free put/call ratio CSVs | None | $0 | 2006-11-01 → **2019-10-04** | **Frozen since 2019** | Market-wide only | No | **CUT** — dead file, still widely cited |
| 11 | Polygon/**Massive** Options | API key | $0 free tier / **$29/mo** Starter | 2 yr free, 4–5 yr paid | EOD free / 15-min delayed paid | Full US options | Yes, but | **CUT at budget.** Free tier = 5 req/min, EOD only — Cboe (#2) is strictly better for free |
| 12 | Unusual Whales | Account | **$50/mo** retail, **$150/mo** API | — | Real-time | Options flow + dark pool | Yes | **CUT** — 5–15× over budget |
| 13 | Quiver Quantitative | Account | **from $30/mo** API | — | Daily | Off-exchange, congress, insiders | Partly | **CUT** — 3× over budget; its off-exchange data is FINRA's, free |
| 14 | Fintel | Account | **~$10.95/mo** Bronze `[R]` | — | Daily | Short interest, off-exchange, options sentiment | Repackages #1/#5 | **CUT** — pays for free data; could not verify price (403) |
| 15 | Robinhood popularity endpoint | None | $0 | Withdrawn 2020 | — | — | — | **CUT — confirmed dead.** HTTP 404, nothing replaced it |
| 16 | MEMX Retail Trading Insights | None | $0 | — | Periodic report | **Market-wide only** | No per-symbol data | **CUT** |
| 17 | 13F-derived crowding (SEC EDGAR) | None | $0 | Long | **45 days** statutory | Institutional only | No — wrong crowd, wrong clock | **CUT** |
| 18 | Nasdaq short-interest JSON API | None | $0 | Long | 25 days | Per-symbol | Duplicate of #5 | **CUT** — same FINRA data, one hop further away |

**Net: 3 adopts + 1 enabler, 14 cuts.**

---

## 3. FINRA Daily Short Sale Volume — **the find of this track**

### Access, measured

Plain HTTPS GET, **no key, no registration, no User-Agent games**:

```
https://cdn.finra.org/equity/regsho/daily/CNMSshvol20260904.txt
```

`[V]` measured 2026-09-08:

| Property | Measured |
|---|---|
| HTTP | 200, ~540 KB, ~0.16–0.24 s |
| Format | Pipe-delimited: `Date\|Symbol\|ShortVolume\|ShortExemptVolume\|TotalVolume\|Market` |
| Rows | **12,217** for 2026-09-04 (one row per symbol, pre-consolidated) |
| Facility variants | `FNSQshvol` (Nasdaq TRF Carteret), `FNQCshvol` (Chicago), `FNYXshvol` (NYSE TRF), `FORFshvol` (ORF) all 200 for the same date — `CNMSshvol` is the consolidated one you want |
| Bulk fetch | **82 trading days downloaded in seconds at 12 concurrent, zero 429s, 41 MB total** |

### History depth `[V]`

Binary-searched the CDN. `20180801`, `20180815`, `20181001`, `20190102`,
`20200102`, `20260102` → all **200**. `20180716`, `20180702`, `20180601`,
`20180501`, `20180301`, `20180102`, and every 2010–2017 probe → **403**.
The boundary sits exactly at **2018-08-01**. FINRA's own catalogue page independently
states "Consolidated NMS files start August 1, 2018" `[V]`. Two sources agree.
That is **8.1 years of daily, full-universe history, free, in flat files.**

### Update lag — this is the headline `[V]`

```
last-modified: Tue, 08 Sep 2026 21:18:31 GMT   →  17:18 ET, same trading day
```

The file for **today** was already complete and served at the time of measurement.
FINRA documents "no later than 6:00:00pm ET of the same day on the relevant trade
date" `[V]`. **Measured 17:18 ET beats the documented 18:00 ET commitment.**

For an end-of-day study tool this is as good as it gets: the data for day *T* is
in hand the evening of day *T*, before the open of *T+1*.

### The caveat that most users of this file get wrong `[V]`

The file covers **only trades reported to a FINRA facility** (the three TRFs, the
ADF, and the ORF) — i.e. **off-exchange volume only**. It is not total market
short volume. I measured the size of that gap across the whole panel:

> **FINRA `TotalVolume` ÷ consolidated volume: mean 43.7%, sd 10.8%, n = 4,100
> ticker-days.** NVDA on 2026-09-08: 51,690,889 ÷ 122,965,555 = **42.0%**.

So `ShortVolume/TotalVolume` is *the short share of off-exchange flow*, not of the
market. Two consequences, and they pull in opposite directions:

- **Against:** you cannot read it as "X% of trading was bearish bets." A large
  share of off-exchange short volume is **wholesaler/market-maker internalisation**
  — the sell side of a retail buy order is often booked as a short by the
  market maker. A rising ratio can mean *retail is buying harder*, not that anyone
  is bearish. Anyone shipping this as a "bearishness gauge" is shipping a bug.
- **In favour, and this is the interesting part:** off-exchange volume is
  *precisely* where retail wholesaler flow lives. For a track whose whole point is
  **retail** positioning, being restricted to the off-exchange tape is arguably the
  right restriction rather than a defect. `[I]`

### Also free and keyless: the FINRA data API

`POST https://api.finra.org/data/group/otcMarket/name/regShoDaily` answers
**unauthenticated** `[V]`. Filters work (`EQUAL`/`GTE`/`LTE` on symbol and
`tradeReportDate`), which makes per-ticker history retrieval a single call.

Two measured limits:
- **`limit` caps at 5,000 rows** per request (`record-total: 28039` returned but
  only 5,001 lines delivered for one date).
- **The API only holds a rolling window** — `regShoDaily` returned nothing before
  **2026-01-06**. `[V]`

`[I]` **Use the CDN flat files for the 8-year backfill and for the nightly job;
use the API only for ad-hoc single-ticker lookups.** One file per day is one
request per day — trivially inside any free-tier budget, and it arrives
pre-consolidated across facilities, which the API does not (the API returns one
row per facility, 3× the rows to sum yourself).

### Verdict

**$0 rung. Adopt.** Free, keyless, daily, same-day, full-universe, 8 years deep,
and — measured in §11 — **statistically orthogonal to everything the project
already computes**. There is no other source in this track with that combination.

---

## 4. Cboe delayed option chain — free per-name options positioning

### Access, measured `[V]` 2026-09-08

```
https://cdn.cboe.com/api/global/delayed_quotes/options/NVDA.json
```

No key. Returns the **full chain** with per-contract `volume`, `open_interest`,
`iv`, `delta/gamma/vega/theta/rho`, `bid/ask`, `last_trade_price`, plus an
underlying block carrying `current_price`, `volume`, **`iv30`** and
`iv30_change_percent`.

| Property | Measured |
|---|---|
| NVDA | 3,460 contracts, 1.55 MB |
| SPX (`_SPX`) | **12.6 MB** — heavy, avoid unless needed |
| Small caps | SOUN 632 contracts / 0.28 MB; BBAI 254 / 0.11 MB — **coverage reaches down-cap** |
| **15 tickers @ 5 concurrent** | **1 second, 14 MB, zero 429s** |
| Freshness | `last_trade_time: 2026-09-08T15:59:59`, `cache-control: s-maxage=5` |

Derived per-name figures computed from the raw chain (2026-09-08):

| Sym | Contracts | P/C **volume** | P/C **OI** | IV30 |
|---|---|---|---|---|
| NVDA | 3,460 | 0.566 | 0.885 | 34.11 |
| PLTR | 2,182 | 0.830 | 1.052 | 47.77 |
| GME | 1,260 | 0.227 | 0.291 | 46.10 |
| RKLB | 1,184 | 0.251 | 0.719 | 70.54 |
| BBAI | 254 | 0.186 | 0.290 | 64.17 |
| OKLO | 1,100 | 0.319 | 0.507 | 79.48 |

Note the **dispersion**: P/C volume ranges 0.19 → 0.83 across the sample. That is
not a constant, and it is not obviously volume-driven.

### Is it additive?

**Yes, and unusually clearly so.** `[I]`

- **Put/call volume ratio** is flow in a *different market* with *different
  participants*. There is no function of the equity daily bar that produces it.
- **`iv30` is the strongest single item in this whole track.** Implied volatility
  is the market's *forward* expectation of range. The project's `ATR`, `ADR` and
  `30mATR` are all **backward-looking realised** volatility. For a breakout trader
  the ratio **IV30 ÷ realised-ATR-implied-vol** is a genuine
  expectation-vs-history spread the project cannot currently compute at any price.
  That alone justifies the integration.
- **Open interest** is a true position stock, not a flow — it is the one
  "positioning" number here in the literal sense.

### The disqualifying-unless-handled limitation

**There is no history. It is a snapshot endpoint.** `[V]` I probed for archives:

- `cdn.cboe.com/data/us/options/market_statistics/**` → **403** on every path tried.
- Cboe's paid **DataShop** is where historical options data now lives `[R]`.

`[I]` So the integration is: **start polling nightly now, and you have a usable
history in 3–6 months, and a good one in 18.** There is no backfill. That is a real
cost — but the daily job is ~1 s and ~1 MB per watchlist name, and it costs $0.
The decision to start collecting is cheap; the decision to delay is expensive,
because history you did not collect cannot be bought back for free.

### Verdict

**$0 rung. Adopt, conditionally** — conditional on accepting forward-only history.
Scope it to a watchlist (50–200 names), not the 4,174-name liquid universe, or the
nightly payload becomes ~4 GB. Store the *derived* daily row (P/C volume, P/C OI,
IV30, total contract volume), not the raw chain.

---

## 5. Wikipedia Pageviews — the cleanest exogenous attention signal

### Access, measured `[V]` 2026-09-08

```
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/
  en.wikipedia/all-access/user/Nvidia/daily/20260801/20260908
```

No key. A descriptive `User-Agent` is the documented courtesy and I used one.
The `/user/` agent segment filters out bots and spiders — **use it, not `all-agents`.**

| Property | Measured |
|---|---|
| History depth | **First data 2015-07-01.** `2015-07-01` returns views; `2015-01-01` and `2014-01-01` return "we do not have data for those date(s)" |
| Rate limiting | **30 concurrent identical requests → 30 × HTTP 200.** No 429, no throttle observed |
| Sequential | 23/25 OK; the 2 failures were my own malformed dates (400/404), not throttling |
| Granularity | Daily (hourly needs the bulk dumps, not this API) |
| Lag | T+1 `[R]` — the day's aggregate lands the following morning UTC |

Sanity: NVDA daily views over Aug 2026 ranged ~3,500–5,100 — a real, moving,
non-degenerate series.

### Is it additive?

**Yes, and it is the most *conceptually* independent source in the track.** `[I]`
Nothing about a Wikipedia pageview is generated by the tape. It is a person
deciding to go read about a company. That is attention in its rawest form, and it
cannot be reconstructed from OHLCV at any lookback.

There is genuine academic pedigree `[R]`: Moat et al., *Quantifying Wikipedia Usage
Patterns Before Stock Market Moves* (Scientific Reports, 2013) is the founding
paper; more recent work covers Nasdaq-specific attention indicators and long/short
strategies on pageview changes. I did not verify the strategies' replicability and
would treat published alpha claims as `[R]` and probably decayed.

### The real obstacle: ticker → article mapping

This is where the source usually dies, so I tested the fix. **Wikidata's SPARQL
endpoint is free, keyless, and answers this directly** `[V]`:

```sparql
SELECT ?ticker ?companyLabel ?article WHERE {
  ?company p:P414 ?st .
  ?st ps:P414 ?exch ; pq:P249 ?ticker .
  VALUES ?exch { wd:Q82059 wd:Q13677 }        # NYSE, Nasdaq
  ?article schema:about ?company ;
           schema:isPartOf <https://en.wikipedia.org/> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
```

Measured counts `[V]` 2026-09-08:

- **3,894** distinct US-exchange tickers exist in Wikidata with a ticker statement.
- **3,510** of those have an English Wikipedia article — a **90.1% join rate
  within Wikidata**.

But against the project's own universe the picture is worse:
**3,510 mappable vs ~4,174 names in the liquid universe → ~84% ceiling, and the
missing sixth is not random.** `[I]` Wikidata coverage is best for large, famous,
long-listed companies and worst for exactly the recent-IPO / low-float /
small-cap names that produce the most violent breakouts. The tool would have
attention data for AAPL and none for the ticker that actually gapped 40%.

The mapping is also **stale in places**. My very first result row mapped ticker
`MLKN` to the article *Knoll, Inc.* — Knoll was absorbed into MillerKnoll years
ago. So the map needs a staleness check and a manual override table, not blind
trust.

### Verdict

**$0 rung. Adopt, conditionally.** Free, keyless, 11 years of history, no rate
limit worth worrying about, and genuinely exogenous. Ship it **only** with the
coverage number displayed honestly — a blank is "we have no article for this
ticker", not "nobody is paying attention", and conflating those two would actively
mislead the trader.

---

## 6. FINRA Consolidated Short Interest (biweekly) — **CUT**

Free and keyless via the same FINRA API `[V]`:
`POST api.finra.org/data/group/otcMarket/name/consolidatedShortInterest`.
Returns `currentShortPositionQuantity`, `previousShortPositionQuantity`,
`averageDailyVolumeQuantity`, `daysToCoverQuantity`, `changePercent`. History
reaches at least **2018-05-31** `[V]`.

**The lag kills it.** Measured 2026-09-08: **the most recent settlement date
available is 2026-08-14** `[V]` — 25 days stale. And because the series is
*biweekly*, the effective staleness of "the current reading" ranges from ~14 to
~28 days depending on where you are in the cycle.

The task framing said a biweekly series is nearly useless to a day trader, and the
measurement confirms it, harder than expected. **For a trader making entry
decisions on an intraday breakout, a number describing the crowd's position
three-and-a-half weeks ago is not a signal.**

`[I]` There is one legitimate residual use: **days-to-cover as a slow, static
context tag** ("this name is structurally heavily shorted") to help interpret the
*daily* short-volume ratio in §3. That is a footnote on another metric, not a
feature. **Cut as a signal.**

*(Nasdaq's keyless `api.nasdaq.com/api/quote/{SYM}/short-interest` returns the
identical numbers — latest settlement `08/14/2026` `[V]`. Same data, one hop
further from the source. Cut.)*

---

## 7. FINRA ATS / OTC Weekly Transparency ("dark pool") — **CUT**

`POST api.finra.org/data/group/otcMarket/name/weeklySummary` — free, keyless,
per-symbol **and per-venue** (MPID-level: `ICBX`, `JPBX`, IBKR, …), with
`totalWeeklyTradeCount`, `totalWeeklyShareQuantity`, `totalNotionalSum` `[V]`.

On paper this is exactly what "dark pool print" vendors resell.

**Measured lag, 2026-09-08** `[V]`:

| Latest week available | Its publication date | Lag from week start |
|---|---|---|
| `2026-08-17` | `2026-09-08` | **22 days** |

Weekly buckets, published three weeks late. **Cut.** This is the free upstream of
what Quiver sells as "Off-Exchange Trading" and what dark-pool vendors dress up —
worth knowing so you do not pay for it, but it cannot inform a trade.

---

## 8. SEC Fails-to-Deliver — **CUT**

Free, keyless, no registration:
`https://www.sec.gov/files/data/fails-deliver-data/cnsfails202608a.zip` → **HTTP
200, 1.35 MB** `[V]`.

**Latest file available on 2026-09-08 is `202608a`** — the *first half of August*
`[V]`. `202608b` and `202609a` both 404. So the lag is **~3–5 weeks**, semi-monthly.

Same disqualification as §6, and FTD is a narrower, noisier construct besides
(settlement mechanics, not directional conviction). **Cut.**

---

## 9. Google Trends — **CUT, on a hard measurement**

This is the source the task flagged as "free but unofficial API only." The
measurement settles it faster than any argument:

`[V]` **2026-09-08, first request from a clean IP, no prior traffic:**

```
GET https://trends.google.com/trends/api/explore?...   →  HTTP 429 Too Many Requests
GET https://trends.google.com/trends/explore?q=NVDA    →  HTTP 429
```

Not rate-limited *after* a burst. **429 on request number one.** Google is
blocking the endpoint class, not throttling a quota.

Corroborating `[R]`: the `GeneralMills/pytrends` repository was **archived
2025-04-17** and is read-only; its last release was April 2023. Google announced an
official Trends API on 2025-07-24 but it remains an **application-gated alpha**
more than a year later, so it is not available to this project.

Three further reasons to cut even if access were solved `[I]`:

1. **Relative, not absolute.** Trends returns 0–100 normalised *within the query
   window and query set*. Two tickers pulled in separate calls are not comparable,
   and the same ticker pulled over two different windows is not comparable to
   itself. Building a stable cross-sectional daily panel across 4,000 names out of
   pairwise-normalised series is a substantial engineering project with a
   permanent calibration wound in it.
2. **Ticker ambiguity.** Searching `"NVDA"` gets thin volume; searching
   `"Nvidia"` gets GPU shoppers, gamers and job-seekers. Neither is investor
   attention. Wikipedia (§5) has the same ambiguity in principle but far less of
   it in practice, because a pageview is a completed act of reading one specific
   disambiguated article.
3. Any workaround needs proxy pools and cookie rotation `[R]` — that is
   adversarial scraping infrastructure, and it is a maintenance liability that
   will break silently.

**Paid escape hatches, priced** `[R]` as of 2026: SerpApi **$25/mo for 1,000
searches**, $75 for 5,000, $150 for 15,000, with a free tier of 250 searches/month
and credits that expire monthly. At 4,000 tickers a day, 1,000 searches/month is
not a rounding error away from useless — it is **one day of a 30-ticker
watchlist**. Even the $150 tier does not cover a daily universe scan.

**Verdict: cut at every rung.** $0 is blocked; ≤$10 does not exist; the cheapest
real tier is $25/mo and still cannot cover the use case. **Wikipedia pageviews
(§5) is the same signal, free, keyless, unthrottled, absolutely-scaled, and with
11 years of backfill.** Google Trends is strictly dominated.

---

## 10. Cboe free put/call ratio CSVs — **CUT, and a trap worth documenting**

These files are still live, still returning HTTP 200, and still cited across the
internet as the canonical free put/call history:

```
https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/equitypc.csv  → 200, 136 KB
                                                          .../totalpc.csv       → 200, 140 KB
                                                          .../indexpc.csv       → 200, 134 KB
```

`[V]` **Every one of them ends on 2019-10-04.** Measured last rows:

```
equitypc  10/04/2019,  916877,  598296, 1515173, 0.65
totalpc   10/04/2019, 2175006, 2289715, 4464721, 1.05
indexpc   10/04/2019,  783827, 1180047, 1963874, 1.51
```

They have been frozen for nearly seven years while continuing to serve 200s.
Corroborated `[R]`: Cboe retired the free archives in 2019 and routes historical
requests to the paid DataShop.

`[I]` **Anything downstream that consumed these silently stopped updating in 2019.**
Recorded here mainly as a warning: a 200 response is not evidence of a live feed,
and this is a case where "measured beats documented" means *checking the last row*,
not just the status code.

Note this does **not** affect the project's existing **VIX** dependency —
`cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv` is a different
path and is **live** (200, 472 KB, current) `[V]`, as are `VIX9D_History.csv` and
`VIX3M_History.csv`.

---

## 11. Empirical test: is short-volume ratio just RVOL in a hat?

This is the honest question the track exists to answer, so I ran it rather than
asserting it.

### Method

- **Short volume:** 82 FINRA `CNMSshvol` daily files, **2026-05-12 → 2026-09-08**,
  fetched keylessly.
- **Prices:** Yahoo's keyless chart endpoint (`query1.finance.yahoo.com/v8/finance/chart`),
  6-month daily bars.
- **Universe:** 50 liquid, breakout-relevant names (mega-cap tech, high-beta
  momentum, meme/retail favourites, recent-IPO small caps) — deliberately skewed
  toward names this trader would actually scan.
- **Panel:** **4,100 ticker-days.**
- `SVR = ShortVolume / TotalVolume` (both from FINRA, so the off-exchange
  restriction cancels within the ratio).

### Result 1 — SVR is **not** a repackaging of the project's existing features

| Correlate | Pearson r | n |
|---|---|---|
| **RVOL (vs 20-day avg volume)** | **−0.005** | 4,100 |
| log(volume) | −0.225 | 4,100 |
| same-day return | −0.091 | 4,100 |
| intraday return (C/O − 1) | −0.083 | 4,100 |
| (high − low)/close | +0.140 | 4,100 |

**r = −0.005 against RVOL is as close to zero as a real financial series gets.**
Short-volume ratio is measuring something the project's volume features do not see
at all. The mild negative loading on log(volume) (−0.23) is the only meaningful
overlap, and it is small enough to residualise away trivially.

**This is the strongest single piece of evidence in the track, and it is a clean
pass.** `[V]`

### Result 2 — it is not a static stock characteristic either

| Statistic | Measured |
|---|---|
| SVR distribution | mean **0.467**, sd **0.112**, range 0.148 → 0.865 |
| Lag-1 autocorrelation (per ticker, median) | **0.444** |
| Between-ticker sd of means | **0.078** |
| Mean within-ticker sd | **0.079** |

Variance splits almost exactly **50/50** between "which stock is this" and "which
day is this". If it had been 90/10 the series would have been a fixed effect
wearing a time-series costume, and I would have cut it. It is not. The day-specific
half is real, and the usable form of the feature is therefore a **z-score against
the name's own trailing 20-day SVR**, not the raw level.

### Result 3 — no raw predictive power, and I am not going to hide that

| Correlate | Pearson r |
|---|---|
| **SVR vs NEXT-day return** | **−0.0035** |

Flat. Zero. **SVR is not a next-day return predictor in raw form.** Anyone shipping
"high short volume → stock goes up" off this data has not measured it.

### Result 4 — a conditional gradient, reported with its sample size in bold

Conditioning on breakout-shaped days (RVOL ≥ 2 **and** up > 2%), split by SVR
z-score tercile, next-day return:

| Bucket | n | Mean next-day | Median | Win % |
|---|---|---|---|---|
| Low SVR-z (least shorted) | **14** | +1.41% | +0.54% | 64.3 |
| Mid | **14** | +3.54% | +3.84% | 78.6 |
| High SVR-z (most shorted) | **14** | +6.37% | +5.00% | 78.6 |
| *All breakout days* | *42* | *+3.77%* | — | *73.8* |
| *All ticker-days (baseline)* | *6,300* | *+0.17%* | — | *50.4* |

The gradient is monotone and points the way the squeeze-fuel story would predict:
a breakout into unusually heavy short volume follows through harder.

**And it is worth almost nothing as evidence.** `[I]` **n = 14 per bucket.** Over a
four-month window, in a sample of 50 names chosen partly *because* they are
high-beta, during one market regime. With 14 observations a single ASTS or OKLO
print moves the bucket mean by more than the entire spread between buckets. The
`+3.77%` mean for all breakout days versus `+0.17%` baseline is itself mostly a
statement about the momentum regime of mid-2026, not about short volume.

**Treat this as a hypothesis worth testing properly on the 8-year backfill — which
is free and available (§3) — not as a result.** It is precisely the kind of finding
that looks like alpha and dissolves on a wider sample. The honest use of it is:
*it justifies spending the backfill, and nothing more.*

### What the test establishes

1. **SVR passes the additivity bar decisively** (r = −0.005 vs RVOL). It is new
   information.
2. **It is a legitimate time-varying series**, not a stock fixed effect (50/50
   variance split, AR(1) = 0.44).
3. **It has no demonstrated univariate edge.** Its value, if any, is conditional
   and needs the long backfill to establish.
4. Point 1 is the one that matters for a *study tool*. TapeReader's job is to show
   the trader something they cannot otherwise see; it does not have to be alpha to
   be worth displaying, but it does have to be **new**, and this is.

---

## 12. Vendor aggregators — priced against the ladder

| Vendor | Entry price | API price | What you actually get | Verdict |
|---|---|---|---|---|
| **Unusual Whales** | **$50/mo** Retail Basic (annual $404/yr) `[V]`; Pro $75, Max $120 | **$150/mo** Basic; $375 Advanced; $625 Startup `[R]` | Real-time options flow, dark pool, SPX GEX/MM exposure | **CUT** — 5× the ≤$10 rung at the *cheapest* tier |
| **Quiver Quantitative** | free web tier exists `[V]` | **from $30/mo** `[R]` | 15 datasets: congress, insiders, lobbying, **off-exchange trading** | **CUT** — 3× rung, and its off-exchange dataset is FINRA's §7 data, free upstream |
| **Fintel** | **~$10.95/mo** Bronze, $19.95 Silver, $95 Gold `[R]` | included at higher tiers | Short interest, off-exchange volume, options sentiment, ownership | **CUT** — see below |
| **Polygon / Massive** *(options product)* | **$0** Options Basic | **$29/mo** Starter; $79 Developer; $199 Advanced `[V]` | Free: 5 req/min, **EOD only**, 2 yr history | **CUT at budget** |

**Verified 2026-09-08:** unusualwhales.com/pricing served its tiers directly `[V]`.
`polygon.io/pricing` now **301-redirects to `massive.com/pricing`** `[V]` — Polygon
appears to have rebranded; worth flagging separately since the project depends on
Polygon and its docs/billing URLs have moved.

### On Fintel specifically

It is the only vendor that lands anywhere near the ≤$10 rung — and it lands
*just over* it at ~$10.95/mo. Two reasons to cut anyway:

1. `[V]` **I could not verify the price.** `fintel.io/plans` and `/pricing` both
   returned **HTTP 403** to curl *and* to WebFetch. The $10.95 figure is `[R]`
   from third-party review sites and may be stale. Recommending a paid tier on
   unverified pricing would be poor practice.
2. `[I]` More decisively: **its short-interest, short-volume and off-exchange
   datasets are FINRA's, which §3, §6 and §7 obtain for free and at lower latency
   than any resale.** Paying ~$131/year for a nicer front end on data the project
   already fetches keylessly — for a tool whose whole positioning is *free* — is
   backwards.

### On Polygon/Massive's free options tier

Genuinely interesting on paper: $0, 2 years of history, EOD aggregates. But
**5 requests/minute** `[V]` means a 200-name watchlist takes 40 minutes of wall
clock, and it is EOD aggregates rather than a full chain with open interest and
greeks. **Cboe §4 gives more per name, faster, with no key and no rate limit
observed.** Cut on comparison, not on price.

---

## 13. Dead ends — one line each

- **Robinhood popularity** — `[V]` `api.robinhood.com/instruments/{id}/popularity/`
  returns **HTTP 404 `{"detail":"Not found."}`** for a valid, live NVDA instrument
  id. **Confirmed withdrawn (2020) and confirmed nothing replaced it.** The
  surviving `midlands/tags/tag/100-most-popular/` returns an unranked list of
  exactly 100 instruments with `membership_count: 100` and **no holder counts** —
  a static bucket, not a popularity series.
- **MEMX Retail Trading Insights** — `[R]` published as periodic **market-wide
  reports** (retail ≈ 30–37% of volume), not a per-symbol feed. No API.
  `info.memxtrading.com/retail-trading-insights` → 404 `[V]`.
- **13F-derived crowding** — free from SEC EDGAR (`data.sec.gov` answers keylessly
  `[V]`) but **45-day statutory filing lag**, quarterly, and it measures
  *institutional* positions. Wrong crowd, wrong clock, wrong frequency for an
  intraday breakout trader.
- **Nasdaq / NYSE own daily short-volume files** — `[V]`
  `nasdaqtrader.com/dynamic/symdir/shortsale/...` redirects to a 404 page;
  `ftp.nyse.com/ShortData/NYSEshvol/...` returns 404. Consolidate via FINRA (§3)
  instead; FINRA is the actual publisher.
- **Stooq daily bars** — `[V]` now gated behind a **JavaScript proof-of-work bot
  challenge**. Abandoned rather than bypassed. Yahoo's keyless chart endpoint was
  used instead for the §11 test.
- **Cboe options market-statistics archives** — `[V]` every
  `cdn.cboe.com/data/us/options/market_statistics/**` path probed returns **403**.
  Historical options stats are DataShop (paid) only.
- **FINRA metadata catalogue endpoint** — `[V]` `api.finra.org/metadata/group/otcMarket`
  returns 404; dataset names must be discovered from the developer docs, not
  enumerated.

---

## 14. Recommendation

### Adopt (all $0, all keyless)

1. **FINRA Daily Short Sale Volume — do this one first, and backfill it.**
   Same-day at ~17:20 ET, 12.2k symbols, **8.1 years of free history**, and a
   **measured r = −0.005 against RVOL**. It is the only source in this track that
   is simultaneously timely, deep, free, universe-wide, and provably not something
   the project already has. Fetch one flat file per day from
   `cdn.finra.org/equity/regsho/daily/CNMSshvol{YYYYMMDD}.txt`; store
   `short`, `short_exempt`, `total`, and compute the **20-day z-score of
   `short/total`** as the display feature. **Label it honestly** — "short share of
   off-exchange volume", never "bearish bets" — because market-maker
   internalisation means a rising ratio can mean retail is *buying*.

2. **Cboe delayed option chain — start collecting tonight.**
   The per-name **IV30** is the single most valuable field in this track for a
   breakout trader, because every volatility number the project currently has
   (`ATR`, `ADR`, `30mATR`) is backward-looking and IV30 is forward-looking. There
   is **no backfill**, so the cost of waiting is permanent. Scope to a watchlist,
   persist only the derived daily row.

3. **Wikipedia pageviews + Wikidata mapping — adopt with the coverage caveat
   surfaced in the UI.** 11 years of free history, unthrottled at 30 concurrent,
   and genuinely exogenous to the tape. But **~84% of the liquid universe maps at
   best**, and the misses concentrate in exactly the small-cap, recent-listing
   names that produce the best breakouts. Ship the coverage number next to the
   metric; a blank must read as "no article mapped", never as "no attention".

### Cut, and why the cuts matter

The single most useful thing this track produces may be the cuts:

- **Everything biweekly, weekly or quarterly is out** — short interest (25 days),
  ATS/dark pool (22 days), fails-to-deliver (3–5 weeks), 13F (45 days). Each is
  free, each is easy to fetch, and each would be **decoration on a day trader's
  screen**. Measured lags are in §6–8; they are not close calls.
- **Google Trends is out on a measurement, not an opinion** — HTTP 429 on the
  first request. Wikipedia pageviews dominates it on every axis.
- **Every vendor is out on price** — the cheapest credible one is Fintel at
  ~$10.95/mo *unverified*, and it resells FINRA data the project can fetch free
  and fresher. Unusual Whales starts at $50. Nothing in this category lands at or
  under $10/month with data that is not already free upstream.
- **Cboe's free put/call CSVs are a trap** — live 200s, frozen since 2019-10-04.

### The caution to carry into synthesis

`[I]` Two of the three adopts are **information without demonstrated edge**. SVR
showed **r = −0.0035 against next-day return** — flat. The breakout-day gradient
was monotone and encouraging and had **14 observations per bucket**, which is not
a result. Wikipedia's predictive literature is `[R]` and probably decayed.

That is fine for a **study tool** — TapeReader's job is to show the trader
something the tape does not, and all three clear that bar. It would not be fine
for a signal that gets ranked, scored, or acted on. **The FINRA backfill is free
and eight years deep; run the conditional test properly on it before any of this
is presented to the trader as predictive.**
