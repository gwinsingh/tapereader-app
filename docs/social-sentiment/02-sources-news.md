# 02 — News & Narrative Sentiment

**As of:** 2026-09-08 (all measurements taken 2026-09-08/09 UTC unless noted)
**Track:** B · **Status:** complete
**Evidence tags:** `[V]` verified on the source's own material · `[R]` reported by third parties · `[I]` our inference

> **Headline.** The best ≤$10/mo news-sentiment answer costs **$0** and we already hold the
> key. **Polygon (now "Massive") `/v2/reference/news` is on the free Stocks Basic tier, ships a
> per-ticker `insights` object with `sentiment` + `sentiment_reasoning`, and carries 2 years of
> history** — enough to backfill the trader's entire journal. The catch is licensing, not cost:
> Basic is non-professional, non-redistributable, so it can enrich the **private journal** but
> may not be displayed on public tapereader.us. The public-facing story is a different and
> weaker one, and the genuinely free, redistributable, full-history catalyst source turns out
> not to be a news vendor at all — it is **SEC EDGAR full-text search**.

---

## Summary verdict table

| Source | Auth | Free-tier limit | History depth | Sentiment | Ticker resolution | Rung |
|---|---|---|---|---|---|---|
| **Polygon / Massive news** | key (held) | 5 req/min, free Basic | **2 yr** (free) · 2016-06-22 (paid) | **pre-scored per ticker + reasoning** | vendor-tagged, good | **0 — winner (private use)** |
| **SEC EDGAR FTS** | **none** | ~10 req/s, keyless | **2001 → present** | none (structured facts) | **exact, via CIK** | **0 — winner (catalysts)** |
| **Alpha Vantage `NEWS_SENTIMENT`** | key (free signup) | **25 req/day** | ~2022 → present `[I]` | **pre-scored, per-ticker relevance + sentiment** | vendor-tagged, good | 0 — strong #2 |
| Alpaca news | key (free acct) | account-gated | **2015 →** | none (raw text) | Benzinga tags, good | 0 — raw-text option |
| Finnhub | key (free signup) | ~60 req/min `[R]` | company-news 1 yr `[R]`; **sentiment endpoint has no date params** | snapshot only, **not replayable** | good | 0 — but unbackfillable |
| GDELT | **none** | **1 req/5 s (throttled harder in practice)** | 2015-02-18 → present | document-level tone only | **poor — no tickers** | 0 — reject |
| Tiingo | key (free) | 50 req/hr, 500 sym/mo | **3 months** | none | proprietary tagging | 0 — history too shallow |
| Marketaux | key (free) | 100 req/day × **3 articles** | not stated | pre-scored | entity-tagged | 0 — 300 art/day, unusable |
| EODHD news | key | **20 calls/day; 5 calls per request** | ≥1 yr (paid) | pre-scored (polarity/neg/neu/pos) | symbol array | 2 ($19.99+) |
| StockNewsAPI | key | 5-day trial only | **March 2019 →** `[R]` | pre-scored | good | 2 ($19.99+) |
| NewsAPI.org | key | 100/day, **1 month, non-commercial, 24 h delay** | 5 yr (paid) | none | none (keyword only) | **reject** |
| Benzinga direct | sales contact | none | n/a | ratings/analyst structured | excellent | 4 (unpriced, enterprise) |

---

## Polygon / Massive — `/v2/reference/news`

**Rebrand note.** `polygon.io` 301-redirects to `massive.com` `[V] 2026-09-08`. Polygon.io renamed
to Massive effective 2025-10-30 `[R]`. `api.polygon.io` still serves and `api.massive.com` runs in
parallel — both returned an identical `{"status":"ERROR", ..., "error":"API Key was not provided"}`
401 on an unauthenticated call `[V] 2026-09-08`. **No code change is needed**; the existing
`api.polygon.io` base in `lib/trade-journal/market-data.ts` keeps working.

### What the docs promise

- **Tier availability:** the endpoint is included on **all Stocks plans, Basic (free) through
  Advanced, plus Business** `[V]`. The docs page's own plan matrix renders "Stocks Basic — Free —
  2 years" and "Updated hourly" `[V] 2026-09-08`.
- **History depth:** **2 years on Basic**; Starter/Developer/Advanced/Business get full history
  back to **2016-06-22** `[V]`.
- **Rate limit:** Stocks Basic is **5 API calls/minute** `[V]` — which exactly matches the 5 req/min
  the project already measured, confirming **the project's key is the free Basic tier** `[I]`.
- **Parameters:** `ticker` (case-sensitive, with `gte/gt/lte/lt` comparators), `published_utc`
  (with the same comparators — this is the backfill lever), `order`, `sort`, `limit`
  (default 10, **max 1000**), plus `next_url` cursor pagination `[V]`.

### The `insights` object

Confirmed from the docs' own sample payload and its CSV field list `[V] 2026-09-08`:

```
id, publisher_name, publisher_homepage_url, publisher_logo_url, publisher_favicon_url,
title, author, published_utc, article_url, ticker, amp_url, image_url, description,
keywords, sentiment, sentiment_reasoning
```

Each article carries an `insights` **array**, one entry per ticker:

```json
"insights": [{
  "ticker": "…",
  "sentiment": "positive",
  "sentiment_reasoning": "UBS analysts are providing a bullish outlook on the extent of
                          future Federal Reserve rate cuts, suggesting that markets are
                          underestimating…"
}]
```

So it is **per-ticker, pre-scored, and carries a free-text rationale**. `sentiment` is a
three-way label (`positive` / `negative` / `neutral`) — **not** a continuous score `[V]`. That is
coarser than Alpha Vantage, which gives a float. The `sentiment_reasoning` string is the more
valuable field for our purposes: it is a one-sentence, model-written explanation of *why* the
stock is in play, which is very close to a catalyst label already (see catalyst section).

### Backfill arithmetic

5 req/min × `limit=1000` with `published_utc.gte/lte` windows. For a bounded journal symbol set
(the trader's realised universe, order tens of symbols), one request per symbol per wide window
returns up to 1,000 articles. **A full 2-year backfill of ~50 symbols is minutes of wall-clock,
not days** `[I]` — a completely different cost profile from the 11-day paced grouped-daily
backfill in `docs/market-scans/phase-1-spec.md`. Pagination via `next_url` is the only complexity.

### The licensing problem — read this before building a public page

Individual plans (Basic → Advanced) are licensed for **personal, non-professional use**; the
market-data terms state a subscriber "shall not furnish Market Data to any other person or
entity", that a Nonprofessional Subscriber receives data "solely for his or her personal,
non-business use", and that data is "strictly for display use only". Redistribution or
customer-facing display requires a **Business plan** `[R], from the terms text surfaced in search;
the PDF at massive.com/terms/market_data_terms.pdf is the primary source and should be read
directly before shipping anything public`.

**Consequence:** Polygon news insights are fine for enriching the trader's own Google Sheet
journal (private, single user — the same posture the journal already takes with Polygon market
data). They are **not** clearly fine for rendering on public tapereader.us. This is a Track H
question but it is decisive enough to state here.

**Verdict: Rung 0. Adopt immediately for journal enrichment and catalyst labelling. Do not put
it on the public site without resolving the redistribution term.**

**Open item for the parent session** (which is testing the live key): confirm the key actually
returns a populated `insights` array rather than an empty one, and confirm the real
`published_utc` floor — docs say 2 years on Basic, but a stricter server-side cutoff is possible.

---

## Alpha Vantage — `NEWS_SENTIMENT`

### Measured, live

The publicly documented `apikey=demo` example is **not canned** — it served genuinely current
articles. `GET /query?function=NEWS_SENTIMENT&tickers=AAPL&apikey=demo` returned **HTTP 200,
122,139 bytes, 0.24 s, 50 items spanning 2026-09-02T22:30 → 2026-09-08T22:08**
`[V] 2026-09-08`. The demo key is locked to exactly that query — adding `time_from`, `limit`,
`sort`, or any other ticker returns the "demo API key is for demo purposes only" notice `[V]`.
So the **schema is verified from live data; the history and limits are documented only.**

Measured properties of that live sample `[V]`:

- **3.1 tickers tagged per article** (min 1, max 5).
- **AAPL relevance score:** min 0.52, max 1.00, mean 0.789 across all 50 — i.e. the relevance
  filter is doing real work, not returning 1.0 for everything.
- **AAPL sentiment labels:** Somewhat-Bullish 16, Neutral 17, Bullish 7, Somewhat-Bearish 7,
  Bearish 3 — a genuine distribution, not a bullish-constant.
- **Topics observed:** technology 36, financial_markets 30, **earnings 26**, finance 6,
  retail_wholesale 5, manufacturing 5, life_sciences 4, energy_transportation 2, economy_macro 2,
  economy_monetary 2, **mergers_and_acquisitions 1**, **ipo 1**, blockchain 1, economy_fiscal 1.
- **Sources:** Yahoo Finance 8, Investing.com (+Canada) 10, USA Today 2, NYT 1, Engadget 1, …

### Response schema `[V]`

```
items, sentiment_score_definition, relevance_score_definition,
feed[]: title, url, time_published (YYYYMMDDTHHMMSS), authors[], summary, banner_image,
        source, category_within_source, source_domain,
        topics[]: {topic, relevance_score},
        overall_sentiment_score (float), overall_sentiment_label,
        ticker_sentiment[]: {ticker, relevance_score, ticker_sentiment_score,
                             ticker_sentiment_label}
```

Score bands, quoted from the response itself `[V]`:
`x ≤ -0.35 Bearish · -0.35 < x ≤ -0.15 Somewhat-Bearish · -0.15 < x < 0.15 Neutral ·
0.15 ≤ x < 0.35 Somewhat_Bullish · x ≥ 0.35 Bullish`. Relevance is `0 < x ≤ 1`.

**This is a richer schema than Polygon's**: a continuous per-ticker sentiment float *and* a
continuous per-ticker relevance float, versus Polygon's three-way label. The relevance score is
the more important of the two — it is exactly the field needed to discard the "AAPL mentioned in
passing in a market-wrap" articles that would otherwise dominate any per-ticker aggregate.

### Parameters and history `[V] from docs`

`tickers` (comma-separated, AND semantics — `tickers=COIN,CRYPTO:BTC,FOREX:USD` requires all three
to be mentioned), `topics` (15-value controlled vocabulary, listed below), `time_from` / `time_to`
in `YYYYMMDDTHHMM`, `sort` = `LATEST` (default) / `EARLIEST` / `RELEVANCE`, `limit` default 50,
**max 1000**.

Full `topics` vocabulary `[V]`: `blockchain`, `earnings`, `ipo`, `mergers_and_acquisitions`,
`financial_markets`, `economy_fiscal`, `economy_monetary`, `economy_macro`,
`energy_transportation`, `finance`, `life_sciences`, `manufacturing`, `real_estate`,
`retail_wholesale`, `technology`.

**History depth is nowhere stated in the docs** `[V] — a real gap`. The docs' own second example
uses `time_from=20220410T0130`, and third-party accounts place the archive start in 2022 `[I]`.
**Treat "≈ April 2022 →" as an inference to be measured on day one with a real key.** If it holds,
it covers the trader's entire journal with years to spare.

### The free tier — this is the binding constraint

**25 API requests per day** `[V], stated identically on both alphavantage.co/premium/ and
/support/ 2026-09-08`. No per-minute cap is published for free `[V]`. Premium: $49.99/mo
(75 req/min), $99.99 (150), $149.99 (300), $199.99 (600), $249.99 (1200), all with "no daily
limits" `[V]`. **Every premium tier blows the $10 cap by 5×.** The free tier is the only rung-0/1
option and there is nothing in between.

### Why 25/day is survivable anyway

This is the non-obvious part. 25 requests/day sounds fatal, but **news backfill is
per-symbol-window, not per-day**: one request with `tickers=XYZ&time_from=…&time_to=…&limit=1000`
returns up to 1,000 articles covering an arbitrarily long window. So the unit of work is *a
symbol*, not *a trading day*.

- **Backfill:** 25 symbols/day → a ~50-symbol journal universe backfills in **2 days**; a
  200-symbol universe in ~8 days `[I]`.
- **Steady state:** the daily pull is the day's traded/watchlist symbols, typically well under
  25 `[I]`. A market-wide `topics=`-only pull costs 1 request.
- **What breaks:** anything universe-wide and daily. You cannot score 4,174 liquid names/day on
  25 requests. Alpha Vantage is a **journal-enrichment** source, not a scanner source.

**Verdict: Rung 0. Adopt as the #2 source and the primary *continuous-score* source.** Its float
sentiment + float relevance are strictly more informative than Polygon's three-way label, and its
`topics` vocabulary is the cleanest catalyst signal of any vendor here. Requires a free signup
(Track K).

*Terms note:* the Alpha Vantage ToS is served as a PDF and could not be parsed in this run —
**dead end, retry manually.** Redistribution posture is therefore **unknown**, not cleared.

---

## SEC EDGAR full-text search — the keyless sleeper that actually wins

Not on the brief's source list. It should have been. This is the only source in the whole track
that is **free, keyless, full-history, exactly ticker-resolved, and unambiguously
redistributable** (US government work product).

### Measured `[V] 2026-09-08`, endpoint `https://efts.sec.gov/LATEST/search-index`

| Probe | Result |
|---|---|
| `q="clinical"&forms=8-K&startdt=2026-09-01&enddt=2026-09-05` | HTTP 200, 51,791 b, **84 hits** |
| `q="quarterly"&forms=8-K&entityName=TSLA` | HTTP 200, **131 hits**, 100 returned per page |
| `q="earnings"&forms=8-K&startdt=2001-01-01&enddt=2001-03-31` | **4,489 hits** — archive genuinely reaches 2001 |
| `q="earnings"&forms=8-K&startdt=2015-01-01&enddt=2015-01-31` | 2,850 hits |
| `q="common stock"&forms=424B5&startdt=2026-09-01&enddt=2026-09-05` | **12 hits** — every dilutive shelf takedown that week |

Each hit's `_source` carries exactly what a catalyst classifier needs `[V]`:

```json
{ "display_names": ["Summit Therapeutics Inc.  (SMMT)  (CIK 0001599298)"],
  "file_type": "EX-99.1",
  "file_date": "2026-09-03",
  "items": ["8.01", "9.01"],
  "adsh": "0001599298-26-000076" }
```

**`items` is the 8-K item-code array — a controlled vocabulary, filed by the company itself,
under legal liability.** This is not a model's guess at a catalyst. It is the catalyst, declared.

Entity resolution is solved too: **`https://www.sec.gov/files/company_tickers.json` returned
10,412 ticker→CIK→name mappings, keyless, 796,994 bytes** `[V] 2026-09-08` — e.g.
`{"cik_str": 1045810, "ticker": "NVDA", "title": "NVIDIA CORP"}`. That single file removes the
name-matching ambiguity that sinks GDELT.

Rate limit: SEC's published fair-access policy is **10 requests/second** with a required
descriptive `User-Agent` `[R]` — three orders of magnitude more generous than any vendor here.
All probes above used a descriptive UA and were served without throttling `[V]`.

**Verdict: Rung 0. Adopt for catalyst ground truth.** Not a sentiment source — it carries no
tone — but for the specific sub-question the brief flagged as "a concrete, shippable win", it is
the highest-accuracy option available at any price.

**Adjacent keyless sources, also verified 2026-09-08:**
- **openFDA** `api.fda.gov/drug/drugsfda.json` — HTTP 200 keyless `[V]`. Documented 240 req/min
  per IP without a key `[R]`. Drug approval events for biotech catalysts.
- **ClinicalTrials.gov API v2** — HTTP 200 keyless `[V]`, returns full study protocol sections.
- **FDA press-release RSS** — HTTP 200, 15,414 b `[V]`.

These are narrow but they cover the exact catalyst class (`FDA/Regulatory`) where a breakout
trader most needs to know whether the move has a real event behind it.

---

## GDELT — honest evaluation: reject

The brief called this "a sleeper candidate — evaluate honestly." Evaluated honestly, it fails on
ticker resolution, and the failure is structural rather than fixable.

### Access, measured `[V] 2026-09-08`

- **DOC 2.0 API is keyless but severely throttled.** Of 6 requests spaced 7–16 s apart, **5
  returned HTTP 429** with "Please limit requests to one every 5 seconds". The one success
  (`mode=tonechart`) took 14.8 s and returned 20,542 b. The documented 1-req/5-s limit is
  **not** what is actually enforced from a shared/cloud IP — which is precisely where a GitHub
  Actions collector would run `[I]`. The 429 body itself steers "all high-traffic users" to the
  bulk ngrams dataset instead.
- **Bulk files are keyless and unthrottled.** `data.gdeltproject.org/gdeltv2/lastupdate.txt`
  returned the current 15-minute triple (export / mentions / gkg) `[V]`. `masterfilelist.txt` is
  **127,450,147 bytes** and its first entry is **`20150218230000`** — so GKG 2.0 history starts
  **2015-02-18** `[V]`.
- **Volume is prohibitive.** One 15-minute GKG file is **3,985,875 b compressed → 12,319,822 b
  raw** `[V]`. That is ~96 files/day ≈ **380 MB/day compressed, ~1.2 GB/day raw**. Against D1's
  500 MB/database free cap and a git-committed NDJSON collector, this is not a rounding error —
  **one day of GDELT exceeds the entire free storage budget** `[I]`.

### Why the ticker resolution fails

Parsed one full GKG file (944 records, 27 columns) `[V] 2026-09-08`:

- **There is no ticker field.** Company identity lives in the free-text `ORGANIZATIONS` column as
  lowercased names: `alcoa`, `jollibee foods corporation`, `hong kong stock exchange`,
  `pirramimma trademark limited edition shiraz`. Mapping those to US tickers is an unsolved
  entity-resolution problem, and it is the *whole* job.
- **Tone is document-level, not per-company.** Column 15 gives one tone score per *article*. An
  article mentioning `alcoa` alongside `michaels`, `health administration`, and `university of
  pittsburgh professor john mendeloff` (a real observed row) yields one number attributable to
  none of them. Compare Polygon and Alpha Vantage, which both attribute sentiment **per ticker**.
- **The theme taxonomy is macro, not corporate.** Across 4,000 records the finance-relevant themes
  were `EPU_ECONOMY_HISTORIC` 197, `TAX_ECON_PRICE` 121, `ECON_OILPRICE` 29,
  **`ECON_STOCKMARKET` only 21**. There is no earnings theme, no FDA theme, no offering theme —
  nothing that maps to `CATALYST_OPTIONS`.
- **The DOC API's own relevance is loose.** The single successful `tonechart` call for the query
  `"Nvidia"` surfaced top articles about **Huawei, oil prices, Archer Aviation, and BigBear.ai**
  `[V]`. Full-text matching on a company name is not ticker resolution.

**Verdict: reject.** Deep free history is real and the pedigree is real, but GDELT answers "what
is the tone of world news mentioning this word", not "what is the market's read on this ticker".
Rebuilding the second from the first would cost more engineering than every other source in this
document combined, to produce a weaker signal than a free Polygon key already returns.

---

## The rest of the field

### Alpaca news API
Benzinga-sourced, **history back to 2015**, ~130+ articles/day `[R]`. Parameters: `start`/`end`
(RFC-3339 or `YYYY-MM-DD`), `symbols`, `limit` **1–50 only**, `sort`, `include_content`,
`exclude_contentless`, `page_token` `[V]`. Schema: headline, author, summary, content,
created/updated, source, related symbols, images, id, url — **no sentiment field of any kind**
`[V]`. Requires an Alpaca account (a free paper account suffices `[R]`), and the docs do not
state a subscription tier for news `[V]`.

**Verdict: Rung 0, conditional.** The one free source offering **long history + full article
body**. If we ever decide to score text ourselves rather than trust a vendor's label — which is
the only way to escape the look-ahead trap the brief names in Track D — this is the corpus.
`limit` max 50 makes backfill chatty. Keep as the fallback/raw-text option.

### Finnhub — the unbackfillable one
Endpoints, from the official swagger `[V] 2026-09-08`: `/news`, `/company-news`,
`/news-sentiment`, `/stock/social-sentiment`, `/stock/insider-sentiment`,
`/stock/filings-sentiment`, `/stock/newsroom`. Unauthenticated call returns
`{"error":"Please use an API key."}` HTTP 401 `[V]`.

**The decisive detail:** `/news-sentiment` takes **`symbol` and nothing else** — no `from`, no
`to` `[V] from the swagger parameter list`. It returns a *current* snapshot
(`buzz{articlesInLastWeek, buzz, weeklyAverage}`, `companyNewsScore`, `sentiment{bullishPercent,
bearishPercent}`, sector averages). **There is no way to ask what the sentiment was on a past
date.** For a study whose entire premise is backfilling months of journaled trades, an
unreplayable snapshot is worthless — and worse, snapshotting it forward and comparing to
post-hoc data is exactly the look-ahead trap Track D warns about.

`/company-news` does take `from`/`to`, but free tier is capped at ~1 year `[R]` and returns
headline/summary text with **no sentiment**. Free tier ~60 calls/min `[R]`.

Also noted for adjacent tracks: `/stock/social-sentiment` (Reddit + Twitter, **does** take
`from`/`to`) belongs to Track A; `/stock/filings-sentiment` scores 10-K/10-Q text with the
Loughran–McDonald finance word lists — a legitimate, disclosed methodology, unlike most vendor
black boxes.

**Verdict: Rung 0 for social (Track A's call), reject for news sentiment — cannot backfill.**

### Tiingo
Free Starter $0: 500 unique symbols/month, 50 requests/hour, 1 GB/month, news included. Power
**$30/mo** `[V] 2026-09-08` (note: not the $10 the plan is sometimes remembered as). Ticker
tagging by a "proprietary tagging algo", 8,000–12,000 articles/day `[V]`. **No sentiment scores**
`[V]`. **"News API allows 3 Months of queryable history and all data going forward"** `[V]` —
extended history (up to 15 years) is a sales conversation.

**Verdict: reject.** Three months of history cannot backfill the journal, and there is no
sentiment. Both halves of what this track needs are missing.

### Marketaux
From its own pricing page `[V] 2026-09-08`: **Free $0 — 100 requests daily, 3 articles per news
request.** Basic $29/mo (2,500/day, 20 articles), Standard $49 (10,000/day, 50 articles), Pro $99
(25,000/day, 100 articles), Pro-50K $199 (50,000/day). Annual billing ≈20% off. Entity
recognition with per-entity sentiment. History depth not stated on the pricing page `[V]`.

**Verdict: reject at Rung 0/1.** 100 × 3 = **300 articles/day maximum** on free, and the first
paid tier is $29 — 3× over the cap. The article-per-request throttle is deliberately structured
to make the free tier undeployable.

### EODHD news
Free plan **20 API calls/day**, and **each news request consumes 5 calls, per ticker** — i.e.
**4 single-ticker news requests per day** `[V]`. Paid from $19.99 `[V]`. Sentiment **is**
pre-scored: `{polarity, neg, neu, pos}` per article, plus a separate Sentiment Data API giving
daily aggregates normalised −1…+1 `[V]`. Free EOD history is capped at 1 year `[V]`; news archive
depth unstated `[V]`.

**Verdict: Rung 2.** Genuinely good sentiment schema — the daily-aggregate endpoint is close to
what Track D wants — but the free tier is a demo and $19.99 is 2× the cap.

### StockNewsAPI
No free tier — a **5-day, 100-call trial** only `[V]`. Basic $19.99/mo (20,000 calls/mo),
Premium $49.99 (50,000 calls/mo, adds "Top Mentions & Sentiment" and historical data), Business
custom `[V]`. Archive reaches back to **March 2019** `[R]`.

**Verdict: Rung 2.** Per-ticker sentiment sits behind the $49.99 Premium tier, 5× the cap.

### NewsAPI.org — dead end
Free Developer: 100 requests/day, **1 month of history, 24-hour delay, explicitly non-commercial
and barred from staging or production** `[V]`. Paid jumps straight to **$449/mo** (Business) and
$1,749 (Advanced) `[V]`. No sentiment, no ticker tagging — keyword search only.

**Verdict: reject outright.** Fails the licence test before the price test.

### Benzinga direct — dead end at our budget
No published API pricing; enterprise/custom quote only `[R]`. Benzinga *Pro* (the terminal, not
the API) is $37–$197/mo `[R]`. Benzinga's structured analyst-ratings feed is the best-in-class
source for the `Upgrade/Downgrade` catalyst, and it is the content behind Alpaca's free news API
— **so the cheapest legal route to Benzinga content is Alpaca, at $0**, minus the structured
ratings fields `[I]`.

**Verdict: Rung 4, unpriced. Reach it through Alpaca instead.**

---

## Catalyst classification

The concrete, shippable win. Treated here as a first-class deliverable.

### What we are actually populating

From `web/lib/trade-journal/google-sheets.ts:220` and mirrored at
`web/app/pct-bootcamp/trade-journal/plan/page.tsx:41` `[V]`:

```
"Earnings/News", "Upgrade/Downgrade", "FDA/Regulatory", "Sector Momentum",
"Gap Only", "Key Daily Level", "Day 2", "Pullback to DEMA", "Other"
```

**First finding, and it reframes the whole problem: only three of the nine options are news
events at all.** `Gap Only`, `Key Daily Level`, `Day 2`, and `Pullback to DEMA` are *price
states*, and `Sector Momentum` is a *cross-sectional* state. No news source can or should
populate those — they are computable from the daily-bar store that
`docs/market-scans/phase-1-spec.md` already specifies. Any honest design is therefore a
**cascade**, not a classifier:

```
1. structured filing event   (EDGAR)          → Earnings/News · FDA/Regulatory · [Offering]
2. structured analyst action (title regex)    → Upgrade/Downgrade
3. vendor topic + sentiment  (AV / Polygon)   → Earnings/News · FDA/Regulatory · Other
4. cross-sectional price     (market_db)      → Sector Momentum
5. single-name price state   (market_db)      → Gap Only · Key Daily Level · Day 2 · Pullback to DEMA
6. fallthrough                                → Other  (== "no identifiable catalyst")
```

Stages 1–2 are high-precision and should always win over stage 3. Stage 6 is a real answer, not a
failure: "this broke out on no news" is exactly the finding a breakout trader needs, and it maps
onto the brief's `no identifiable catalyst` requirement.

**Second finding — a gap in the vocabulary.** There is **no option for a dilutive offering**, and
for a small-cap breakout trader an overnight 424B5 shelf takedown or ATM is one of the most
consequential things that can happen to a runner. EDGAR surfaces these keylessly and exactly (12
424B5s in one week, measured above). **Recommend adding `Offering/Dilution` to `CATALYST_OPTIONS`**
— noting that touching that list means touching a sheet dropdown, so it must go through the
additive-only contract asserted by `scripts/review/migration-safety.ts` (per the brief, read that
script before proposing a column; a *dropdown value* change is a lighter operation than a new
column, but the same review applies).

### Stage 1 — EDGAR 8-K item codes → catalyst (highest accuracy, free, keyless, full history)

8-K item numbers are a controlled vocabulary the company files under legal liability. Mapping:

| Filing signal | Catalyst | Confidence |
|---|---|---|
| 8-K item **2.02** (Results of Operations & Financial Condition) | `Earnings/News` | **very high** — this *is* the earnings release |
| **424B5** / **424B3**, or 8-K item **3.02** (Unregistered Sales of Equity) | **`Offering/Dilution`** *(new)* | **very high** |
| 8-K item **1.01** (Material Definitive Agreement), **2.01** (Completion of Acquisition), or **SC 13D** | `Earnings/News` (M&A) | high |
| 8-K item **5.02** (Departure/Election of Officers) | `Earnings/News` (management) | high |
| 8-K item **8.01** (Other Events) **+ SIC 2836/8731 (biotech)** | `FDA/Regulatory` | medium — 8.01 is a catch-all; needs the SIC gate and a keyword check |
| 8-K item **1.03** (Bankruptcy) | `Other` | high |

Ticker→CIK comes from `company_tickers.json` (10,412 mappings, keyless) `[V]`.

**The timing trap, and it is the one that matters.** An 8-K's `file_date` is the *filing* date,
and earnings 8-Ks are routinely filed **after the close** for a move that happens the *next*
morning. Matching a filing to a trade on the same calendar date will mislabel a large fraction of
gap-up trades. The join must be **`file_date ∈ {trade_date, trade_date − 1 session}`**, with the
prior-session case preferred when the filing carries an after-hours timestamp `[I]`. The journal
already has the machinery for a `date|symbol` join — screenshots use exactly that key — so this
is a variation on an existing pattern, not new infrastructure.

**Estimated accuracy:** for `Earnings/News` via item 2.02, precision approaching ground truth;
the error mode is recall (a mover with no filing), which correctly falls through the cascade
`[I]`. For `FDA/Regulatory` via item 8.01 + SIC, materially lower — 8.01 is a catch-all — which
is why openFDA and ClinicalTrials.gov are worth joining as a confirmation signal.

### Stage 2 — analyst actions

Neither EDGAR nor any vendor topic vocabulary covers upgrades/downgrades: **an analyst rating
change generates no SEC filing.** Options, cheapest first:
1. **Title regex over any news feed** (Polygon / AV / Alpaca) on `upgrade`, `downgrade`,
   `raises price target`, `lowers price target`, `initiated at`, `reiterates`, plus the
   `Buy|Sell|Hold|Overweight|Underweight|Neutral` rating lexicon. Cheap, and analyst-note
   headlines are unusually formulaic, so precision should be high `[I]`.
2. Benzinga's structured analyst-ratings feed — best quality, unpriced/enterprise. `[R]`

**Recommendation: regex.** This is the one catalyst class where a hand-written rule beats every
free ML signal, because the headlines are near-templated.

### Stage 3 — vendor topics and reasoning

**Alpha Vantage `topics` is the cleanest vendor catalyst signal in the field** `[V]`, and it was
observed doing real work on live data: in one 50-article AAPL pull, `earnings` fired on 26,
`mergers_and_acquisitions` on 1, `ipo` on 1, `life_sciences` on 4 `[V]`. Direct mapping:

| AV topic | Catalyst |
|---|---|
| `earnings` | `Earnings/News` |
| `mergers_and_acquisitions` | `Earnings/News` (M&A) |
| `life_sciences` **+ FDA/trial keywords** | `FDA/Regulatory` |
| `ipo` | `Other` (or a future `IPO/Lockup`) |
| `financial_markets`, `economy_*` only | `Sector Momentum` candidate — market-level, not single-name |

Gate every topic assignment on **`ticker_sentiment.relevance_score` for the traded symbol** —
with a measured mean of 0.789 and a floor of 0.52 on a strong-relevance query, a threshold around
**0.6–0.7** is a sensible starting cut `[I]`, to be tuned once real data lands.

**Polygon `sentiment_reasoning` is the sleeper here.** It is a one-sentence, model-written
explanation of why the article matters to that specific ticker — semantically much closer to a
catalyst label than any topic enum. It can be classified with a keyword pass, or, since the
volume is small (one string per article per traded symbol), by an LLM pass at negligible cost
`[I]`. That said, it is vendor-generated and **cannot be audited or reproduced** — treat its
labels as a convenience, never as ground truth, and never let it override stage 1.

### Recommended design

- Follow the codebase's own precedent: auto-fill **fill-if-blank** and record provenance in a
  **`Catalyst Source`** column mirroring the existing `Risk Source` (`auto (edgar)` /
  `auto (topics)` / `manual`). The trader keeps the final say; the machine never overwrites a
  human label. This is the same contract `R (Risk)` already operates under `[V] CLAUDE.md`.
- Write the literal string **`N/A`** where a source could be consulted but yields nothing, per the
  journal's existing N/A convention — blank must keep meaning "not enriched yet" `[V] CLAUDE.md`.
- Attach by `date|symbol` with the session-boundary correction above.
- **Store the raw evidence, not just the label**: the 8-K accession number (`adsh`), the item
  codes, the article URL, and the relevance score. Storing raw keeps the data generic so a later
  change to the mapping needs no re-backfill — the same reasoning `CLAUDE.md` gives for storing
  raw daily OHLCV rather than derived thresholds `[V]`.

---

## Closing recommendation

**Rung 0 ($0) — do all of this, it needs no purchase:**

1. **Polygon/Massive `/v2/reference/news`** with the key already held. Per-ticker pre-scored
   sentiment + reasoning, 2 years of history, 5 req/min — enough to backfill the whole journal in
   minutes. **Private journal enrichment only** until the redistribution term is cleared.
2. **SEC EDGAR full-text search + `company_tickers.json`.** Keyless, 2001→present, exact ticker
   resolution, legally-filed catalyst codes. The highest-accuracy catalyst source at any price,
   and the only one here that is unambiguously redistributable on a public site.
3. **Alpha Vantage `NEWS_SENTIMENT`** (free signup → Track K). The only continuous per-ticker
   *sentiment* and *relevance* floats in the free field, plus the cleanest catalyst topic
   vocabulary. 25 req/day is survivable because the unit of work is a symbol, not a day.
4. **openFDA / ClinicalTrials.gov / FDA RSS**, keyless, for the `FDA/Regulatory` class.
5. **Alpaca** (free account) as the raw-text corpus if we ever need to score text ourselves
   rather than inherit a vendor's unreproducible label.

**Rung 1 (≤$10/mo) — nothing to buy. There is no news product priced between $0 and $19.99.**
The ladder's live constraint is satisfied entirely at $0, and the ≤$10 rung buys literally
nothing that Rung 0 does not already provide. That is the single most useful finding in this
track.

**Rung 2 ($25–50)** — EODHD ($19.99) for its daily aggregated −1…+1 sentiment series, or
StockNewsAPI Premium ($49.99) for per-ticker sentiment with a March-2019 archive. **Neither is
worth breaking the cap for**, because Polygon + Alpha Vantage already deliver per-ticker scored
sentiment with sufficient history for free.

**Rung 3 ($100–200)** — Massive Stocks Advanced ($199) is the first thing that changes *category*,
and not because of the news: it lifts the 5 req/min limit to unlimited, extends news history to
2016-06-22, and unblocks the snapshots and `I:VIX` the project is currently working around with
the CBOE CSV fallback. **If a rung is ever broken, break it here and for those reasons — the news
insights come along for free.**

**Rung 4 ($500+)** — Benzinga direct, NewsAPI Advanced ($1,749). Structured analyst ratings and
low-latency wires. Irrelevant to an end-of-day study tool; named only to mark the ceiling.

**Dead ends, recorded so nobody re-researches them:** GDELT (no tickers, document-level tone,
380 MB/day, DOC API 429s from cloud IPs) · NewsAPI.org (non-commercial free tier, 1-month
history) · Tiingo (3-month news history, no sentiment) · Marketaux (300 articles/day on free) ·
Finnhub `/news-sentiment` (no date parameters — cannot be backfilled or replayed) · Benzinga
direct (no public pricing) · the Alpha Vantage `demo` key (locked to `tickers=AAPL` with no other
parameters) · the Alpha Vantage ToS (PDF, unparsed — redistribution posture still unknown).

**Two things the parent session must resolve that this track could not:**
1. **Alpha Vantage's true history floor.** Undocumented. Docs hint at April 2022; measure it on
   day one with a real key. If it is shallower than the journal, AV drops from #2 to a
   forward-only source.
2. **Polygon's redistribution term.** The Basic plan is non-professional/non-redistributable per
   the terms text. Journal enrichment is safe; a public tapereader.us panel is not. Read
   `massive.com/terms/market_data_terms.pdf` directly before any public surface is designed —
   this belongs in Track H but it gates Track F.
