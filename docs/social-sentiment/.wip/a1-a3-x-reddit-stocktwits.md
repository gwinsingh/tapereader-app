# Track A1–A3 — X/Twitter, Reddit, StockTwits

**Status:** research complete · **As-of date: 2026-09-08** (live probes ran 2026-09-08 ~21:00 ET → 2026-09-09 ~02:00 UTC)
**Scope:** A1 X/Twitter · A2 Reddit · A3 StockTwits
**Constraints honoured:** no account created, no credentials entered, no money spent, no trial started. Every measured result below came from an **unauthenticated** endpoint.

Confidence tags per `docs/journal-market-research/00-method.md`:
`[V]` verified on the source's own material · `[R]` reported by third parties · `[I]` our inference.
**`[M]`** is used additionally for **measured by us** — a live probe recorded in this document. `[M]` outranks `[V]` outranks `[R]`.

---

## Summary verdict table

| Platform / path | Auth | Cost | History depth | Cashtag quality | Bot risk | Rung | Verdict |
|---|---|---|---|---|---|---|---|
| **StockTwits unofficial API** (`api.stocktwits.com/api/2`) | **None** `[M]` | **$0** | **Deep, walkable** — 3,590 msgs / 4 months on a mid-cap `[M]` | **Excellent** — structurally tagged `[M]` | Low–moderate, **measurable** `[M]` | **0** | **BUILD TONIGHT.** The single best source in this track. |
| **StockTwits Bullish/Bearish tag** | None `[M]` | $0 | Persists on month-old messages `[M]` | n/a | n/a | **0** | **The strategic prize. 45–48% of messages carry it.** |
| **Reddit via Arctic Shift** | None `[M]` | $0 | **2005→now, ~4 min lag** `[M]` | **Poor** — 0.6% cashtag use `[M]` | Moderate | **0** | **Build, but ticker extraction is the hard part.** |
| Reddit official Data API | OAuth, **manual approval** `[R]` | $0 non-commercial / $0.24 per 1k commercial `[R]` | Live only, no archive | Poor | Moderate | 0* | Approval-gated + commercial clause. Not tonight. |
| Reddit keyless (`.json`, RSS, old.reddit) | — | — | — | — | — | — | **DEAD — 403 Blocked** `[M]` |
| **X official API** | Account + credits | **$0.005/post read**, no free tier `[V]` | **Full archive to 2006** `[V]` | **Good** — `$` operator is standard `[V]` | High | **2–3** | **Priced out.** $10 buys ~2,000 posts/month. |
| X via Apify actors | Account + card | $0.15–$0.50 / 1k `[V][R]` | Unlimited date ranges `[V]` | Good | High | 1–2 | Only viable X path at ≤$10, but needs an account. |
| X via resellers (twitterapi.io etc.) | Account | $0.02–$0.20 / 1k `[R]` | Varies | Good | High | 1 | Cheapest $/post, but vendor-reported and ToS-hostile. |
| X keyless — Nitter | — | — | — | — | — | — | **DEAD — C&D from X Corp, 24 Aug 2026** `[M][V]` |
| X keyless — syndication CDN | — | — | — | — | — | — | **DEAD — empty/404** `[M]` |

\* Reddit's official API is free only for **non-commercial** use; TapeReader is a public site, which makes the classification a live legal question for Track H.

**One-line answer for the ≤$10 rung:** *StockTwits + Arctic Shift give a genuinely good product at exactly $0. X gives essentially nothing at $10 and is not worth the cap.*

---

## A1 — X / Twitter

### The headline: the free tier is gone

X moved to **pay-per-usage as the default on 2026-02-06**, and the free tier was discontinued for new developers `[R]`. X's own pricing page confirms the model verbatim `[V]` (fetched 2026-09-08):

> "The X API uses pay-per-usage pricing. No subscriptions—pay only for what you use."

There is **no free read allowance** described anywhere on the pricing page `[V]`. Legacy Basic ($200/mo) closed to new signups in Feb 2026 and existing subscribers were auto-migrated from 2026-06-01; legacy Pro ($5,000/mo) was announced deprecated on 2026-08-14 with migration after 2026-09-01 `[R]`. Existing free-plan users got a one-time $10 voucher `[R]` — irrelevant to us, we have no account.

**Consequence for this project: there is no keyed X path at Rung 0. None.**

### Verified pricing (docs.x.com/x-api/getting-started/pricing, 2026-09-08) `[V]`

| Resource | Unit cost |
|---|---|
| **Posts: Read** | **$0.005 per resource** |
| User: Read | $0.010 per resource |
| Like / Mute / Block: Read | $0.001 per resource |
| Post: Create | $0.015 per request |
| Post: Create (with URL) | $0.200 per request |

> "Pay-per-usage plans are capped at 3 million Post reads per monthly billing cycle." `[V]`

Note the unit: **per resource returned**, not per request. A 500-post full-archive page costs $2.50 `[I]`.

### What $10/month actually buys

$10 ÷ $0.005 = **2,000 post reads/month** `[I]`. Over ~21 trading days that is ~95 posts/day — across the *entire* watchlist. For a 20-symbol morning plan that is under 5 posts per symbol per day. **That is not a sentiment signal; it is an anecdote.** X is structurally off the ≤$10 ladder.

To put it on the ladder you would need roughly 2,000 posts/day (100 symbols × 20 posts) = 42,000/month = **$210/month** `[I]` — Rung 3, and still thin.

### Cashtag search — better than the folklore

Community threads from the v2 era report that the `$` cashtag operator was an *advanced operator restricted to Academic Research access*, returning `"Reference to invalid operator 'cashtag'"` on standard tiers `[R]`. **That appears to be stale.** X's current operators reference lists it as a plain Standalone operator with no access-level note `[V]` (fetched 2026-09-08):

> "`$` Standalone — Matches Posts containing a cashtag — `$twtr OR @XDevelopers -$fb`"

`has:cashtags` also exists as a conjunction-required operator `[V]`. The only access-level distinction the current docs draw is **query character length**: self-serve gets 512 chars (recent) / 1,024 (full-archive); Enterprise gets 4,096 `[V]`.

**So cashtag search quality on X is good** — X users genuinely use `$TICKER` (unlike Reddit, see A2), and the operator is first-class. The problem is purely price.

### History depth `[V]`

From docs.x.com/x-api/posts/search/introduction (2026-09-08):

| Endpoint | Depth | Access |
|---|---|---|
| `GET /2/tweets/search/recent` | **Last 7 days** | "All developers" |
| `GET /2/tweets/search/all` | **Complete archive back to March 2006** | "Pay-per-use, Enterprise" |

Full-archive returns up to **500 Posts per request** and "All query operators available" `[V]`.

> **Correction to widely-repeated vendor marketing:** several reseller blogs claim full-archive search "requires Enterprise at $42,000+/month" `[R]`. **X's own documentation contradicts this** — full-archive is explicitly available to pay-per-use `[V]`. The resellers selling the alternative have an obvious incentive to overstate the official price. `[V]` beats `[R]`.

### Third-party resellers and Apify actors

**Apify actors** (verified on the actor's own page, 2026-09-08):

| Actor | Price | Notes |
|---|---|---|
| `apidojo/tweet-scraper` (Tweet Scraper V2) | **$0.40 / 1,000 tweets** `[V]` | "unlimited date ranges", accepts advanced search syntax **including cashtags** `[V]`; 30–80 tweets/sec `[V]`; min 50 tweets/query `[V]` |
| `igolaizola/x-twitter-scraper-ppe` | $0.15 / 1k `[R]` | |
| `kaitoeasyapi/...cheapest` | $0.25 / 1k `[R]` | |
| `xquik/x-tweet-scraper` | $0.15 / 1k rows `[R]` | |

**Apify's free tier is useless for collection**: on `apidojo/tweet-scraper`, free users get "5 runs per month, each capped at 10 items" `[V]` — 50 tweets/month. Paid plans remove the cap. An account and a payment method are required, so **this cannot be stood up tonight** under the brief's constraints.

At $0.40/1k, $10/month = 25,000 tweets ≈ 1,200/trading day `[I]` — that is a real, if modest, signal. **Apify is the only X path that fits the ≤$10 rung**, and it costs a signup.

**Direct resellers** — all figures vendor-published, treat as marketing `[R]`: twitterapi.io $0.15/1k (~$0.10 trial credit); SocialData $0.20/1k; GetXAPI $0.05/1k; Sorsa $0.02/1k on a Pro plan. Note the sourcing hazard: **every one of these numbers appears on a blog owned by the vendor quoting it**, frequently in a post comparing itself favourably to competitors. Independent verification is impossible without signing up. `[R]` at best.

### ToS posture on scraping

X's terms are unambiguous on their face: scraping "in any form, for any purpose without our prior written consent is expressly prohibited" `[R]`.

**But the enforceability is genuinely contested.** In *X Corp. v. Bright Data Ltd.* (N.D. Cal., 2024-05-09) the court **dismissed** X's claims that scraping public data breached its ToS, on **Copyright Act conflict-preemption** grounds — reasoning that X's *users*, not X Corp., own the posted content, so X cannot use contract law to control it `[R]`. Commentary from Morrison Foerster, Skadden and Proskauer all read this as a significant scraper-favourable precedent `[R]`.

**Do not over-read this.** It is one district court decision, it protects a well-resourced defendant that litigated, and X has continued to enforce aggressively by other means — see the Nitter finding below. For a public-facing site like tapereader.us, the redistribution question (Track H) matters more than the collection question.

### Keyless read paths — comprehensively dead `[M]`

Probed 2026-09-08:

| Path | Result |
|---|---|
| `cdn.syndication.twimg.com/timeline/profile` | HTTP 200 but **0 bytes** — dead `[M]` |
| `cdn.syndication.twimg.com/tweet-result` | **HTTP 404** `[M]` |
| `nitter.net` | HTTP 200 → **cease-and-desist notice**, 0 tweets `[M]` |
| `xcancel.com` | "Verifying your browser…" challenge, 0 tweets `[M]` |
| `nitter.tiekoetter.com` | "Making sure you're not a bot!", 0 tweets `[M]` |
| `nitter.poast.org`, `nitter.privacydev.net` | Connection failed (HTTP 000) `[M]` |

nitter.net's front page carries a notice dated **7 September 2026** — *the day before this research* `[V][M]`:

> "On 24 August 2026 cease and desist letters were sent by X Corp. demanding a permanent takedown of Nitter instances and the project's repository. Following legal advice, the Nitter project will continue. This instance and others will be back up and running shortly."

**Verdict: there is no keyless X read path as of 2026-09-08.** Nitter may return, but building on a project under active legal attack from the platform owner is not a foundation. Treat as unavailable and do not revisit before a stable public announcement.

### A1 verdict

**Rung 2–3. Not recommended at any budget we care about.** X has the best cashtag hygiene of the three platforms and the deepest archive (2006), and if money were no object it would be the primary source. At ≤$10 it delivers ~95 posts/day, which is worse than nothing because it invites over-fitting on a tiny sample. The only ≤$10 X path is an Apify actor at ~1,200 tweets/day, which requires an account and a card. **Put X on the Track K checklist as optional/deferred, not as a night-one action.**

---

## A2 — Reddit

### The keyless path is dead `[M]`

Every classic unauthenticated Reddit route returns **HTTP 403 "Blocked"**, measured 2026-09-08:

| Path | Result |
|---|---|
| `www.reddit.com/r/<sub>/new.json` | 403 `[M]` |
| `old.reddit.com/r/<sub>/new.json` | 403 (page titled "Blocked") `[M]` |
| `www.reddit.com/r/<sub>/new/.rss` | 403 `[M]` |
| `oauth.reddit.com/r/<sub>/new` (no token) | 403 `[M]` |

Tested with a browser UA and with a descriptive bot UA in Reddit's own documented style — both blocked `[M]`.

> **Caveat `[I]`:** this machine's egress may be a datacenter IP, and Reddit blocks those aggressively. A residential IP might succeed. **This does not matter operationally** — our collector runs in GitHub Actions, which is datacenter IP space, so it would be blocked there regardless. Treat the keyless path as unavailable for our architecture.

### Official Data API

- **Free for non-commercial use** at **100 queries/minute per OAuth client**; OAuth is mandatory `[R]`.
- **Commercial use requires approval and a paid agreement at ~$0.24 per 1,000 calls**, with a bundled tier reported around $12,000/month for 50M calls `[R]`. Reddit publishes no self-serve commercial price `[R]`.
- Reddit's **"Responsible Builder Policy" closed self-service app registration in late 2025** — every new OAuth client, free or paid, now goes through **manual approval** `[R]`.

I could not verify these on Reddit's own material: `support.reddithelp.com` returned **403** and `redditinc.com` is not fetchable from this environment `[M]`. **All Reddit API terms above are `[R]` and should be re-verified by a human at signup time.** Log this in `13-open-questions.md`.

**The commercial-use clause is the live risk.** TapeReader is a free public site but it is a product, not a research project. Whether Reddit classifies it as commercial is a Track H question that could kill the official-API path entirely.

**Critically: the official API has no historical archive.** It serves recent listings only. It cannot answer H1–H5 retrospectively. `[I]`

### Arctic Shift — the actual Reddit answer `[M]`

**Arctic Shift is the maintained Pushshift successor**, run by **one person** (ArthurHeitmann), self-described as "Making Reddit data accessible to researchers, moderators and everyone else" `[V]`. Pushshift itself was restricted to verified moderators in 2023 and shut down thereafter `[R]`.

Base URL `https://arctic-shift.photon-reddit.com`. **No key, no account, no cost** `[M]`.

**Measured capabilities (2026-09-08):**

| Property | Measured value |
|---|---|
| Auth | **None** `[M]` |
| Latency | 1.1–6.7s typical `[M]` |
| **Currency** | **~4 minutes.** Newest r/wallstreetbets post `2026-09-09T01:43:05Z` vs wall clock `01:47:14Z` `[M]` |
| **History** | Serves 2021 raw comments and 2021 time-series without difficulty `[M]` |
| Page size | **limit max = 100** (`"'limit' must be between 1 and 100"`) `[M]` |
| Rate limit | Dynamic, load-based. 429 with `X-RateLimit-Reset` headers `[V]`; in practice a **422 `"Timeout. Maybe slow down a bit"`** `[M]`. ~1 request / 2.5s was sustainable `[M]` |
| Licence | **None stated** `[V]` — see risk below |
| Guarantees | **"No uptime or performance guarantees :)"** `[V]` |

> The 4-minute currency figure is the surprise of this track. Arctic Shift is widely described as a monthly-dump archive with a 4–6 week lag `[R]`; **its API is in fact near-real-time** `[M]`. Third-party summaries are wrong about this.

**Endpoints that matter:**

- `/api/posts/search`, `/api/comments/search` — full row payloads, filterable by `subreddit`, `author`, `after`, `before`, `body` (comments), `title` (posts).
- **`/api/comments/search/aggregate?aggregate=created_utc&frequency=day&body=<TICKER>&subreddit=<SUB>`** — **daily mention counts per ticker.** This is the exact primitive Track D needs, and it returns in ~6s `[M]`:

  ```
  NVDA/day in r/wallstreetbets, Aug 24 → Sep 7 2026
  2026-08-24  544     2026-08-29   51
  2026-08-25  2169    2026-08-30  130
  2026-08-26  1275    2026-08-31  115
  2026-08-27  511     2026-09-01  376
  2026-08-28   71
  ```
  A 4× spike on 08-25 followed by a 30× collapse by 08-29 — exactly the attention-velocity shape H1/H3 are about.

- **`/api/time_series?key=r/<sub>/comments/count&precision=day`** — total subreddit comments/day, returns in ~1.4s `[M]`. **This is the normalization denominator** that turns a raw mention count into a share-of-attention, which is what Track D's z-score design requires.

**Known query limits `[M]`:**
- `body=` requires scoping by `subreddit`, `author`, `link_id` or `parent_id` — you cannot keyword-search all of Reddit at once `[M]`.
- `body=` on `/posts/search` is rejected (`"Unknown query parameter: 'body'"`); posts use `title`/`selftext` `[M]`.
- **Aggregate + keyword over peak-volume history times out.** `body=GME` aggregated over r/wallstreetbets in **Jan 2021** fails with 422 even on a 2-day window, after repeated backoff `[M]`. It is **not a history gap** — I verified the same period works via raw comment fetch, via time_series, via a smaller subreddit, and via r/wallstreetbets in calmer 2022 `[M]`. It is a query-complexity ceiling on the single busiest subreddit-period in Reddit's history. Workaround: narrow windows, or use the monthly dumps for heavy backfill (the maintainer explicitly recommends this) `[V]`.

**Bulk dumps:** monthly archives distributed via **Academic Torrents** and Hugging Face; `.zst` / `.zst_blocks` compressed and `.jsonl`/ndjson uncompressed `[V]`. Reported at ~2.5B items through Feb 2026, ~261 GB Parquet on HF, 4–6 week lag; the Academic Torrents set reported at 3.97 TB `[R]`. **Sizes are far beyond our storage budget** — the API, not the dumps, is our path `[I]`.

### Subreddit volume — measured, and the answer is "one subreddit" `[M]`

Comments in **one market hour** (Thu 2026-09-03, 10:30–11:30 ET), paged with polite spacing:

| Subreddit | Comments / market hour | Share |
|---|---|---|
| **r/wallstreetbets** | **1,461** | **84%** |
| r/Daytrading | 89 | 5.1% |
| r/stocks | 82 | 4.7% |
| r/smallstreetbets | 59 | 3.4% |
| r/pennystocks | 28 | 1.6% |
| r/options | 5 | 0.3% |
| r/Shortsqueeze | 5 | 0.3% |
| r/RealDayTrading | 5 | 0.3% |
| r/swingtrading | 2 | 0.1% |
| r/StockMarket | 1 | 0.06% |

Independently, `time_series` gives r/wallstreetbets at **8,326–20,886 comments/day** across late Aug/early Sep 2026 `[M]`, and **27,996–59,719/day in Jan 2021** `[M]` — the sub is at roughly a third of its mania-era volume.

> **My earlier sample was a Saturday and understated everything by ~15×.** Recorded here so nobody repeats it: *always sample a weekday market hour.* Posts (not comments) on Sat 2026-09-05: WSB 87, Daytrading 87, stocks 51, everything else in single digits `[M]`.

**Implication:** r/wallstreetbets *is* Reddit for this purpose. The other nine subreddits together are 16% of the volume. Collecting WSB alone captures most of the signal; r/Daytrading and r/stocks are worth adding for a different (less meme-y) population, and the rest are rounding errors that mainly add cost. `[I]`

### Ticker resolution — Reddit's fatal weakness `[M]`

From 1,461 live WSB comments:

- **Comments containing a `$CASHTAG`: 9 — 0.6%** `[M]`
- Comments containing a cashtag **or** any bare ALL-CAPS ticker-like token: 324 — **22.2%** `[M]`

**Reddit users do not use cashtags.** Ticker extraction must fall back on bare ALL-CAPS tokens, and the top-20 such tokens in the live sample were:

`SPY(31) TSLA(18) QQQ(17) AVGO(16) SPCX(12) LMAO(12) HOOD(9) DELL(9) META(9) MU(8) MSTR(8) SNOW(7) AAPL(6) PL(6) BULL(6) NVDA(6) DOWN(6) FUCK(5) THIS(5) DCA(5)` `[M]`

`LMAO`, `DOWN`, `FUCK`, `THIS`, `DCA` are noise. But the trap is deeper than a stoplist fixes — I tested 51 common English words and trader slang against StockTwits' live symbol search and **39 of 51 are real US-listed tickers** `[M]`:

`$ALL` Allstate · `$ANY` Sphere 3D · `$CAN` Canaan · `$GOOD` Gladstone · `$LOVE` Lovesac · `$OPEN` Opendoor · `$REAL` TheRealReal · `$FAST` Fastenal · `$TRUE` TrueCar · `$PLAY` Dave & Buster's · `$WORK` Slack · `$NOW` ServiceNow · `$ONE` · `$TWO` · `$CASH` · `$GOLD` · `$PUMP` ProPetro · `$BULL` Webull · `$HOPE` · `$SAFE` · `$TECH` Bio-Techne · `$DATA` Tableau · `$FUND` · `$MAX` · `$MIN` · `$SEE` Sealed Air · `$STAY` · `$TURN` · `$PEAK` Healthpeak · `$STEP` · `$PAY` · `$SPOT` Spotify · `$LINE` Lineage · `$NEXT` NextDecade · `$LOW` Lowe's · `$FLY` Firefly · `$WELL` Welltower · `$EVER` EverQuote · `$BEST`

**A stoplist and a ticker universe are in direct conflict**: you cannot both catch a real `$OPEN` breakout and suppress "open". This is the cashtag-collision trap the brief names, now quantified. `[M]`

Mitigations for Track D `[I]`: require ≥2 signals (bare token **plus** a price/option/verb context word); weight by whether the token also appears cashtagged anywhere that day; restrict bare-token matching to symbols already in the day's liquid movers universe (which the market-scans work produces anyway); and **never** treat a common-word ticker's raw count as a level — only as a z-score against its own baseline, which absorbs the constant background noise.

### Bot contamination and survivorship

- **85% of the sampled WSB comments (1,249 of 1,461) sat in a single daily discussion thread** (`t3_1w63g0h`) `[M]`. Efficient to collect; also a warning that this is low-effort chat, not DD.
- **3.1% of archived bodies were already `[deleted]`/`[removed]`** `[M]`. Arctic Shift archives at post time, so it captures content that Reddit later removed — this **reduces** deletion survivorship bias relative to scraping live, which is a genuine advantage for honest research `[I]`.
- **Look-ahead hazard, verified `[V]`:** the maintainer documents that for ~36 hours after archiving, `score` and `num_comments` are 0 or 1, because rows are captured the moment they are posted and updated later. **A live collector therefore records score≈0, while a backfill of the same day records final scores.** Any model using score would be trained on data it cannot have in real time. **Either ignore score entirely, or snapshot it twice and use only the t+0 value.** This belongs in the Track D trap list and the D2 pre-registration.

### Single-maintainer risk

Arctic Shift is **one unpaid person**, with **no stated licence**, **no uptime guarantee** `[V]`, and a removal-request form implying content can be withdrawn. It is also the *only* viable free Reddit path we found. `[I]`

**Mitigation:** commit our own NDJSON snapshots from night one (which the brief already mandates). If Arctic Shift disappears, our accrued history survives — that is precisely the argument for starting collection before the research finishes. The absence of a licence is a **Track H blocker for redistribution**: we may derive private metrics from it, but publishing Reddit-derived content on tapereader.us needs a separate answer.

### A2 verdict

**Rung 0, buildable tonight, with a caveat.** Arctic Shift delivers keyless, free, near-real-time Reddit with full history and a daily-aggregate endpoint that is a near-perfect fit for the metric family in Track D. The blocker is not access, it is **ticker resolution**: 0.6% cashtag usage plus 39/51 common-word collisions means extraction quality, not data availability, decides whether Reddit contributes signal. Collect r/wallstreetbets (+ r/Daytrading, r/stocks); ignore the long tail.

**Suggested collector shape `[I]`:** pull each target subreddit's comments for the prior session via `/api/comments/search` at `limit=100` with ~2.5s spacing (~200–400 requests/day for WSB), extract tickers locally against the liquid universe, and **store only aggregated per-ticker counts** — raw WSB text is ~4 MB/day (~1.5 GB/yr), far too much to commit; aggregated counts are kilobytes. Pull `/api/time_series` once per sub per day for the normalization denominator.

---

## A3 — StockTwits

**This is the find of the track.** Assessed most carefully, per the brief.

### Registration status: closed — and it does not matter `[V][M]`

StockTwits' developer page states plainly `[V]` (fetched 2026-09-08):

> "We unfortunately won't be accepting new registrations until we have finished our review and made the necessary improvements and upgrades."

Developers are directed to `developers@stocktwits.com`. **No new API keys are being issued.** On its face this reads as a hard dead end.

**It is not**, because the documented v2 endpoints **serve public data without any key at all** `[M]`.

### Measured: the unauthenticated API is alive, fast, and generous

All probes 2026-09-08, no key, no account, no cookie:

| Endpoint | Result |
|---|---|
| `/api/2/streams/symbol/{SYM}.json` | **HTTP 200**, 86 KB, **0.14s**, 30 messages `[M]` |
| `/api/2/streams/symbol/{id}.json` (numeric id) | 200 `[M]` |
| `/api/2/trending/symbols.json` | 200 — 30 trending symbols `[M]` |
| `/api/2/trending/symbols/equities.json` | 200 `[M]` |
| `/api/2/streams/trending.json` | 200 — message stream across trending names `[M]` |
| `/api/2/streams/suggested.json` | 200 `[M]` |
| `/api/2/search/symbols.json?q=<Q>` | 200 — symbol resolution `[M]` |
| `/api/2/streams/user/{username}.json` | 200 — per-author history `[M]` |
| `/api/2/charts/ts/{SYM}.json` | 200 — 24 hourly points, trending score + price `[M]` |
| `/api/2/symbols/{SYM}.json` | 404 `[M]` |

**No User-Agent required** — an empty-UA request returned an identical 200 `[M]`.

**Rate limit — measured, not documented `[M]`:**
- **60 consecutive requests, no delay: 60/60 succeeded in 6.8s = 8.9 req/s, zero throttling.**
- **No rate-limit headers of any kind** are returned `[M]`.
- Separately, a 120-page cursor walk (~3,600 messages) completed at 0.25s spacing without a single error `[M]`.

This is an extraordinarily permissive endpoint. **Politeness, not the rate limit, should set our cadence.** `[I]`

### The Bullish/Bearish tag — still exposed, and it is the prize `[M]`

**Yes. It is live, in the public payload, on the unauthenticated endpoint.** Each message carries:

```json
"entities": { "media": [], "sentiment": null, "discussable": null }
```

and where the author tagged their post:

```json
"entities": { "sentiment": { "basic": "Bullish" } }
```

**Measured tag rate — 240 messages across 8 tickers `[M]`:**

| Ticker | Tagged / 30 | Bullish | Bearish |
|---|---|---|---|
| GME | 23 | 18 | 5 |
| TSLA | 16 | 9 | 7 |
| NVDA | 15 | 13 | 2 |
| AMD | 12 | 9 | 3 |
| PLTR | 12 | 7 | 5 |
| AAPL | 11 | 9 | 2 |
| SOFI | 11 | 9 | 2 |
| SPY | 9 | 4 | 5 |
| **Total** | **109 / 240 = 45.4%** | **78** | **31** |

**The tag persists on historical messages** — on a 900-message deep walk of `$AUPH` spanning **2026-08-07 → 2026-09-09**, **431 of 900 (47.9%) were tagged**, including messages a month old `[M]`. It is not a transient UI field; it is stored and served retrospectively.

**Why this matters more than anything else in this track `[I]`:** every other sentiment source requires *us* to infer polarity from text with an NLP model — introducing model error, model drift, and an unfalsifiable black box exactly where the brief warns against one. StockTwits' tag is **declared by the human who wrote the post, at the time they wrote it**, with no post-hoc scoring. It cannot be look-ahead contaminated. It is the cleanest labelled ground truth available at $0, and it doubles as a **training/validation set** for scoring the untagged 55% and for scoring Reddit text.

### Cashtag resolution — structurally perfect `[M]`

StockTwits does not require regex ticker extraction at all. Every message ships a **pre-parsed** `tokenized_body`:

```json
{"type":"cashTag","data":{"text":"$AAPL","symbol":"AAPL","symbol_display":"AAPL"}}
```

plus a top-level `symbols[]` array with exchange, MIC, `watchlist_count`, and per-symbol `sentiment_change` / `volume_change` fields `[M]`.

**The 39-of-51 common-word collision problem that cripples Reddit does not exist here.** The platform resolved the ticker for us, at post time, with the author's intent. This is a decisive quality advantage. `[I]`

### History depth — walkable, and deeper than expected `[M]`

Pagination is by `?max=<cursor>`. **I found no hard wall.**

| Ticker | Pages walked | Messages | Reached back to | Stop reason |
|---|---|---|---|---|
| AAPL (mega-cap, high volume) | 120 | 3,598 | **2026-08-26** (14 days) | my loop ended, not the API `[M]` |
| AUPH (mid-cap) | 120 | 3,590 | **2026-05-08** (4 months) | my loop ended, not the API `[M]` |

**Depth in time is inversely proportional to a ticker's message volume**, since each page is a fixed 30 messages. `limit=100` is ignored — the page size is hard-fixed at 30 `[M]`.

**So a genuine backfill is possible** — not just forward accrual. At ~9 req/s measured, 120 pages costs ~30s per ticker. Backfilling 100 symbols to ~3,600 messages each is roughly an hour of wall time and ~12,000 requests. `[I]`

> This materially changes the accrual argument in brief §5. For StockTwits we are **not** limited to "from tonight forward" — we can reach back weeks on liquid names and months on quieter ones, which means **H1–H4 may be partially testable against the journal's existing trade history rather than requiring three months of waiting.** That is the single most valuable consequence of this track and should be flagged to Track D2's power analysis.

### Other free signal in the payload

- **`trending/symbols.json`** returns 30 names with `rank`, **`trending_score`** (e.g. RKLB 9.295), `watchlist_count`, `sector`, `industry`, and a **`trends.summary`** — an LLM-written paragraph explaining *why* the name is trending `[M]`. That last field is a candidate for auto-populating the journal's existing **`Catalyst`** column (Track B's stated goal), though it is a black-box generated text and must be treated as such `[I]`.
- **`charts/ts/{SYM}.json`** gives **24 hourly points** of trending score + price, plus `events` marking Market Open/Close `[M]`. Rolling 24h only — **no archive**, so it must be snapshotted daily to accrue `[I]`.
- `watchlist_count` (e.g. AAPL 992,327) is a slow-moving attention stock measure; its **daily delta** is a clean, cheap "new eyes on this name" metric `[I]`.

### Bot contamination — low, and measurable `[M]`

From the 900-message `$AUPH` walk:

| Metric | Value | Reading |
|---|---|---|
| Unique authors | 148 / 900 | **author diversity = 0.164** `[M]` |
| Top-5 authors' share | **37.2%** of volume `[M]` | High concentration |
| Median account age | **8.8 years** `[M]` | Not a bot farm |
| Accounts < 90 days old | 3.1% `[M]` | Low |
| Zero-follower posts | 0.6% `[M]` | Low |
| Post sources | Web 372 / Android 295 / iOS 232 / news bot 1 `[M]` | **Overwhelmingly human app clients** |

**Reading `[I]`:** on a single small/mid-cap, volume is dominated by a handful of long-tenured, high-follower enthusiasts — **concentration, not bots**. That is still a hazard (it is an echo chamber), but it is a *different* hazard, and it is directly measurable from fields the API already gives us. `author_diversity = unique_authors / messages` is exactly the bot/pump detector the brief asks Track D to define, and **it is computable from this source for free**.

**The echo chamber is severe and must shape the signal design.** On `$AUPH` the tagged sentiment ran **426 Bullish : 5 Bearish — 98.8% bullish** `[M]`. Compare the large-cap sample at 78:31 (71% bullish) `[M]`. People who post about a small-cap are holders of it. **Raw bull:bear polarity on a single ticker is nearly information-free.** It only becomes a signal as a **z-score against that ticker's own polarity baseline** — which is precisely the normalization Track D already proposes, now with measured justification.

### ToS posture

`stocktwits.com/robots.txt` disallows a set of site paths (`/stocks`, `/watchers`, `/watchlist`, `/widgets/`, `/advanced/`, various `/symbol/*/…` call pages) and names a long list of AI/scraper user-agents `[M]`. **It does not cover `api.stocktwits.com`** — that host 301-redirects and serves no robots.txt of its own `[M]`.

**Honest assessment `[I]`:** we would be using the platform's own documented v2 API endpoints, unauthenticated, at a polite rate, for read-only public data — not scraping HTML pages that robots.txt disallows. That is a materially better posture than HTML scraping. But **registration being closed means we have no Terms of Service acceptance and no license grant**, so this is *tolerated* access, not *authorized* access. It could be closed off without notice.

**Consequences for the build `[I]`:** (1) rate-limit ourselves well below the measured ceiling and set a descriptive UA; (2) **accrue our own snapshots from night one** so a shutdown costs us the future, not the past; (3) **treat redistribution as a separate, unresolved question for Track H** — deriving private metrics for the journal is very different from publishing StockTwits-derived content on a public site. Do not ship a public surface on this source until Track H clears it.

### A3 verdict

**Rung 0. The strongest source in this track, by a wide margin. Build against it tonight.**

It is the only source that is simultaneously: free, keyless, fast (0.14s), effectively unthrottled (8.9 req/s measured), historically walkable (weeks to months), **structurally cashtag-resolved**, and carrying **human-declared sentiment labels on ~46% of messages**. Its weaknesses — echo-chamber polarity skew and author concentration — are both *measurable from the same payload*, which turns them from unknown risks into modelled covariates.

The one real risk is institutional, not technical: access is unauthorized-but-tolerated and could vanish. The mitigation is to start accruing immediately.

---

## Dead ends — recorded so nobody re-researches them

| Source | Status as of 2026-09-08 | Evidence |
|---|---|---|
| **X free tier** | **Gone.** Discontinued for new developers 2026-02-06; pay-per-use is the default | `[R]` + X pricing page shows no free allowance `[V]` |
| **X legacy Basic / Pro** | Closed to new signups; Basic migrated from 2026-06-01, Pro deprecated 2026-08-14 | `[R]` |
| **Nitter (all instances)** | **Dead.** X Corp C&D letters 24 Aug 2026; nitter.net serves a legal notice, others serve bot challenges | `[M][V]` |
| **X syndication CDN** (`cdn.syndication.twimg.com`) | **Dead.** `timeline/profile` returns 0 bytes; `tweet-result` returns 404 | `[M]` |
| **Reddit `.json` / RSS / old.reddit / oauth host, keyless** | **All HTTP 403 "Blocked"**, browser UA and bot UA alike | `[M]` |
| **Reddit self-service app registration** | Closed late 2025 under the "Responsible Builder Policy"; manual approval now required | `[R]` — unverified, Reddit's own pages are 403/unfetchable |
| **Reddit official docs** (`support.reddithelp.com`, `redditinc.com`) | Not fetchable from this environment (403 / blocked) — **all Reddit terms in this doc are `[R]`** | `[M]` |
| **Pushshift** | Shut down after 2023 restriction to verified moderators | `[R]` |
| **Arctic Shift aggregate + keyword over peak-volume history** | 422 timeout on r/wallstreetbets Jan 2021 even at a 2-day window. **Not a history gap** — raw fetch, time_series, small subs, and calmer periods all work | `[M]` |
| **Arctic Shift `body=` unscoped** | Rejected — requires `subreddit`/`author`/`link_id`/`parent_id` | `[M]` |
| **Arctic Shift `body=` on `/posts/search`** | Rejected — posts use `title`/`selftext` | `[M]` |
| **StockTwits developer registration** | **Closed** to new applications, no reopening date | `[V]` |
| **StockTwits `/api/2/symbols/{SYM}.json`** | 404 — not a real route | `[M]` |
| **StockTwits sentiment/message-volume chart endpoints** | 404 `"Stat not found"` for every stat name tried except `ts`. **No historical sentiment time-series endpoint exists** | `[M]` |
| **StockTwits `limit=` parameter** | Ignored — page size hard-fixed at 30 | `[M]` |
| **Apify free tier** (`apidojo/tweet-scraper`) | 5 runs/month × 10 items = 50 tweets/month. Useless for collection | `[V]` |
| **Vendor claim: "X full-archive requires Enterprise $42k/mo"** | **False.** X's own docs list full-archive as available to pay-per-use | `[V]` overrides `[R]` |
| **Third-party claim: "Arctic Shift lags 4–6 weeks"** | **False for the API** — measured ~4 minutes. True only of the bulk dumps | `[M]` |

---

## Budget ladder placement

| Rung | Monthly | What this track delivers |
|---|---|---|
| **0** | **$0** | **StockTwits full stream + human sentiment tags + trending + structural cashtags; Reddit via Arctic Shift with full history and daily aggregates.** Both keyless, both buildable tonight. **This is ~90% of the achievable value in this track.** |
| **1** | **≤$10** | **Adds almost nothing from these three platforms.** X at $10 = ~95 posts/day (worthless). Apify at $10 = ~1,200 tweets/day, but requires an account + card. **Recommendation: do not spend the $10 here** — the Rung 0 sources are better than anything $10 buys, and the cap is better spent on Track B/C sources. |
| 2 | $25–50 | Apify/reseller X collection at ~5–20k tweets/day. First point where X becomes a real second opinion rather than an anecdote. |
| 3 | $100–200 | Official X pay-per-use at ~2,000 posts/day (~$210/mo). Buys ToS-clean, full-archive-capable, cashtag-native X data. **The first thing here that changes category** — it makes X history *replayable*, enabling true backtests rather than forward accrual. |
| 4 | $500+ | Reddit commercial agreement (~$0.24/1k, bundles reported ~$12k/mo) and X Enterprise (~$42k/mo). Named only to mark the ceiling. Nothing here is proportionate. |

**The finding that should drive the night's build:** the $0 rung is not a compromise on these three platforms — it is genuinely the best available option, and the ≤$10 cap is not the binding constraint here. Spend the cap elsewhere.

---

## Handoffs to other tracks

- **→ Track D (signal design).** `author_diversity = unique_authors / messages` is measurable on StockTwits for free `[M]`. The 98.8%-bullish `$AUPH` result `[M]` is hard evidence that raw polarity must be z-scored against a per-ticker baseline, never used as a level. Arctic Shift's `/api/time_series` supplies the share-of-attention denominator `[M]`.
- **→ Track D traps list.** Two measured traps to add: (1) Arctic Shift `score`/`num_comments` are 0–1 for ~36h after posting `[V]`, so a live collector and a backfill of the same day **disagree** — a live-only look-ahead hazard. (2) 39 of 51 common English words are real tickers `[M]`.
- **→ Track D2 (pre-registration / power analysis).** **StockTwits history is walkable weeks-to-months back** `[M]`, so some hypotheses may be testable against existing journal trades rather than requiring three months of accrual. This should change the power analysis.
- **→ Track E (journal integration).** StockTwits resolves `date|symbol` natively — the same join key screenshots already use.
- **→ Track H (legal).** Three unresolved blockers: StockTwits access is tolerated-not-authorized (registration closed, no ToS accepted); Arctic Shift states **no licence at all**; Reddit's commercial-use classification of a public product site is unverified because Reddit's own policy pages are unfetchable here.
- **→ Track I (build).** Reddit keyless is 403 from datacenter IPs — **GitHub Actions will be blocked**; the Reddit path must go through Arctic Shift. Store aggregated counts, not raw text (WSB raw ≈ 4 MB/day ≈ 1.5 GB/yr).
- **→ Track K (signup checklist).** Nothing in A1–A3 requires a signup to start. X/Apify is the only candidate and it is **optional and deferred**, not night-one.
- **→ `13-open-questions.md`.** All Reddit official-API terms are `[R]` only — `support.reddithelp.com` returned 403 and `redditinc.com` is unfetchable from this environment. Needs human verification.
