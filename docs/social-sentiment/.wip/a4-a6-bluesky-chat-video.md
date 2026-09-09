# A4–A6 — Bluesky / AT Protocol · Discord & Telegram · Video

**Track:** A (social platform landscape) · **Scope:** A4, A5, A6
**Researched:** 2026-09-08 → 2026-09-09 (overnight) · **All measurements taken 2026-09-09 UTC**
**Constraint compliance:** no account created, no credential entered, no money spent.
Every live test below used unauthenticated public endpoints only.

Evidence tags per `docs/journal-market-research/00-method.md`:
`[V]` verified on the source's own material (incl. our own live measurement) ·
`[R]` reported by third parties · `[I]` our inference.

---

## Summary verdict table

| # | Source | Access | Auth | History | Ticker resolution | Bot risk | ToS | Rung | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| A4 | **Bluesky — PDS `listRecords`** | HTTPS XRPC per-repo | **None** `[V]` | **Full** (per account) `[V]` | DIY regex, no facet `[V]` | Med (you pick authors) | Silent on scraping `[V]` | **$0** | ✅ **The only Bluesky path that works.** Build it — as a cheap curated-author collector, not as a market-wide sentiment feed |
| A4 | Bluesky — `searchPosts` (api.bsky.app) | HTTPS XRPC | None `[V]` | **Full archive to 2023-08** `[V]` | **Broken — `$` is stripped** `[V]` | High | Silent `[V]` | $0 | ⚠️ Works, but opaque-403 throttled to ~1 req/60s under load, and cashtag search is unusable without client-side re-filtering |
| A4 | Bluesky — `searchPosts` (public.api.bsky.app) | — | — | — | — | — | — | — | ❌ **Dead — HTTP 403 for everyone since mid-2026** `[V]` |
| A4 | Bluesky — Jetstream firehose | WSS | **None** `[V]` | **~37 h replay only** `[V]` | DIY regex | High | Silent | $0 | ⚠️ Forward-only. 672 MB/h for ~2 equity posts per 4 minutes |
| A4 | **Bluesky — finance density** | — | — | — | — | — | — | — | ❌ **Too thin to support the metric family in Track D.** ~37 `$TSLA` posts/day vs ~3,585 on StockTwits `[V]/[R]` |
| A5 | Discord — bot + MESSAGE_CONTENT | Gateway | Bot token + server consent | Forward + channel backfill | Free text | Low N, high conflict | Dev Policy: no mining/scraping, no ML training `[R]` | $0 + signup | ❌ Not worth it (argued below) |
| A5 | Discord — self-bot | — | User token | — | — | — | **Explicitly forbidden, account termination** `[R]` | — | ❌ **Never.** |
| A5 | Discord — `/invites/{code}?with_counts=true` | HTTPS | **None** `[V]` | None (point-in-time) | N/A | N/A | Public endpoint | $0 | 🟡 Only keyless Discord signal: room member/online counts. Not per-ticker. Curiosity, not a source |
| A5 | Telegram — `t.me/s/<channel>` | HTML | **None** `[V]` | Deep, `?before=` paginates `[V]` | Free text | High | ToS bars AI/ML training on Telegram data `[V]` | $0 | ❌ Works technically; **zero US-equity content found.** Public channels are RU/FA crypto + macro relays |
| A5 | Telegram — MTProto | Client lib | **User account** | Deep | Free text | High | Same ToS | — | ❌ Requires account creation — out of scope tonight, and the rooms that matter are private anyway |
| A6 | YouTube Data API v3 | HTTPS | API key (free, no card) | **30-day retention cap** `[V]` | Titles/descriptions, noisy | Med | **Must delete/refresh stored data after 30 days** `[V]` | $0 + signup | ❌ **Structurally cannot accrue history.** 100 searches/day |
| A6 | TikTok Research API | HTTPS | Vetted application | — | — | — | Academic/non-profit only; **commercial explicitly ineligible** `[R]` | — | ❌ Dead end |

**One-line answer for the track:** *the only thing worth building from A4–A6 is a
keyless Bluesky per-author collector, and it is worth building for the option
value and the $0 price — not because the data is good. The data is thin. A5 and
A6 are both no.*

---

## A4 — Bluesky / AT Protocol

### A4.1 What actually works (access mechanics)

Four hosts, three different answers. All measured 2026-09-09.

| Host + endpoint | Result |
|---|---|
| `bsky.social/xrpc/app.bsky.feed.searchPosts` | `401 {"error":"AuthMissing"}` `[V]` |
| `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` | **`403`**, an HTML CDN block page, for every query including `q=hello` `[V]` |
| `public.api.bsky.app/xrpc/app.bsky.actor.getProfile` · `searchActors` · `getAuthorFeed` · `unspecced.getTrends` · `unspecced.getPopularFeedGenerators` | `200` unauthenticated `[V]` |
| `api.bsky.app/xrpc/app.bsky.feed.searchPosts` | **`200` unauthenticated** `[V]` |

So the "public" API host is the one that blocks search, and the nominally
internal one does not. The 403 on `public.api.bsky.app` search is a documented
regression from mid-2026 `[R]` (bsky-docs issue #332) and third parties give the
same workaround we measured `[R]`. **Record this so nobody re-derives it:
`public.api.bsky.app` + `searchPosts` is dead; use `api.bsky.app`.**

**Response shape** (`api.bsky.app`, `searchPosts`): `{posts[], cursor, hitsTotal}`.
`hitsTotal` returned `10000` for every query tried, including obviously-rare ones
— it is a capped Elasticsearch-style ceiling, **not a usable volume figure** `[V]`.
Do not build a metric on it.

**Params:** `q`, `limit` (≤100), `sort=latest|top`, `since`, `until` all accepted `[V]`.
Cursor pagination is reported broken unauthenticated since July 2026 (403 on any
cursor) `[R]`; we sidestepped it by walking `until` backwards from the oldest
`createdAt` of the previous page, which works `[V]` and is the pattern any
collector should use.

### A4.2 Rate limits — measured, and worse than they look

There is **no `RateLimit-*` header on `searchPosts` and no `429`.** Exceeding the
budget returns an opaque `403` HTML page (`openresty`, "Request forbidden by
administrative rules"), which is indistinguishable from the endpoint being dead `[V]`.
A naive collector will silently record zeros.

Measured behaviour 2026-09-09:

- Cold start: roughly **25–30 requests** got through over ~20 minutes of mixed
  pacing before the block engaged `[V]`.
- The block is **endpoint-scoped, not IP-wide** — `getProfile` and `getAuthorFeed`
  kept returning 200 throughout `[V]`.
- First block cleared after ~20–30 min. Second block cleared in ~182 s.
- **After sustained use the budget collapsed to one request per ~61 s** — a
  controlled burst test blocked on request #1 and measured a 61 s cooldown `[V]`.

`[I]` This is a reputation-decaying throttle, not a fixed quota. A per-ticker
daily-count collector over even 200 symbols is not viable on unauthenticated
search. This alone rules search out as the collection mechanism.

**Contrast — the PDS is generous and honest about it.** `com.atproto.repo.listRecords`
against an account's own PDS host returned real headers:
`ratelimit-policy: 3000;w=300`, i.e. **3,000 requests per 300 s** `[V]`. We pulled
**2,500 post records in 15.5 s (161 records/s)** with cursor pagination, keyless,
consuming 27 of 3,000 `[V]`.

### A4.3 History depth — genuinely full, which is the one real win

`searchPosts` returned populated pages for every window probed `[V]`:

| `until` | Posts returned | Oldest in page |
|---|---|---|
| 2023-09-01 | 25 | 2023-08-21 |
| 2024-03-01 | 25 | 2024-02-24 |
| 2024-11-15 | 24 | 2024-11-14 |
| 2025-06-01 | 22 | 2025-05-31 |
| 2026-01-01 | 24 | 2025-12-31 |
| 2026-09-09 | 100 | 2026-09-07 |

**No history cliff.** The index reaches back to the platform's invite-only era.
Per-account `listRecords` likewise walks a repo to its first post `[V]`.

The firehose is the opposite. **Jetstream's replay window measured ~37 hours**:
cursors set to 72 h, 168 h and 720 h ago all clamped to the same oldest event
(`2026-09-07T12:37:43Z`, probed at `2026-09-09T02:00Z`), while 1 h / 6 h / 24 h
cursors resolved exactly `[V]`. Bluesky's own docs say only "a bounded lookback
window" with no number `[V]` — so this is the number. **Jetstream is forward-only
plus a day and a half of grace.**

### A4.4 Ticker resolution — **broken, and this is the finding that matters**

Two independent problems, both verified.

**(a) `searchPosts` strips the `$` sigil.** Measured 2026-09-09:

- `q=$SPY` → posts about espionage: *"One of hijackers was Israeli spy"*, *"Tinker Tailor Soldier Spy"* `[V]`
- `q=$OPEN` → 295 hits for a full trading day, **0** of which contained the literal string `$OPEN`: US Open tennis, "open to everyone", fire-service "open 9s" alerts `[V]`
- `q=$AMD` → 99 raw hits, 6 containing `$AMD` `[V]`

There is no cashtag search operator. Every consumer must re-filter client-side,
which means **the API cost per usable post is 5–50× the naive estimate.**

**(b) There is no cashtag in the data model.** The AT Protocol lexicon
`app.bsky.richtext.facet` defines exactly four types — `mention`, `link`, `tag`,
`byteSlice` `[V]` (fetched from the raw lexicon JSON). Bluesky shipped cashtags on
2026-01-16 `[R]`, and its own January 2026 blog post markets them `[V]`, but
**they are a client-side render, not a stored entity.** We confirmed against live
post records: `tapeboard.bsky.social` posts reading `"$QBTS breakout, up 7.3%…"`
carry only a `app.bsky.richtext.facet#link` facet — no tag, no cashtag `[V]`.

`[I]` Consequence: extraction is a regex you own. `\$[A-Z]{1,5}\b` over post text,
plus a universe join to drop non-tickers. That is fine — it is exactly what we
already do — but it means **Bluesky offers no cleaner ticker resolution than
scraping raw text**, and none of the "structured cashtag index" advantage the
brief hoped for.

### A4.5 Finance density — the honest assessment

This is the section the brief asked to be honest about. It is worse than thin.

**Measurement 1 — per-ticker, one full trading day.** Window
2026-09-08 04:00 Z → 2026-09-09 04:00 Z (a normal Tuesday session), `sort=latest`,
walking `until` backwards. "Raw" = what search returned; "strict" = posts whose
text literally contains `$TICK` or `#TICK`.

| Ticker | Raw | **Strict** | Unique authors | Author diversity |
|---|---|---|---|---|
| QQQ | 98 | **55** | 25 | 0.46 |
| NVDA | 66 | **43** | 32 | 0.74 |
| SPY | 396 | **41** | 23 | 0.56 |
| TSLA | 55 | **37** | 25 | 0.68 |
| AAPL | 51 | **28** | 20 | 0.71 |
| GME | 22 | **19** | 14 | 0.74 |
| PLTR | 19 | **15** | 12 | 0.80 |
| IONQ | 216 | **14** | 10 | 0.71 |
| MSTR | 23 | **14** | 11 | 0.79 |
| RGTI | 19 | **13** | 11 | 0.85 |
| AMD | 99 | **6** | 6 | 1.00 |
| SOUN | 6 | **1** | 1 | — |
| BBAI | 0 | **0** | 0 | — |
| OPEN | 295 | **0** | 0 | — |
| AEHR | 1 | **0** | 0 | — |

All `[V]`, measured 2026-09-09.

**Measurement 2 — the whole network, live.** Two Jetstream samples of
`app.bsky.feed.post` creates, 2026-09-09 ~01:55–02:10 Z `[V]`:

| | Sample 1 (180 s) | Sample 2 (240 s) |
|---|---|---|
| Events received | 58,788 | — |
| New posts created | **5,961** | **8,553** |
| Posts containing any `$[A-Z]{1,5}` token | **2** | **2** |
| Of those, genuine US-equity | **0** | **1** |
| Posts with a bare mega-cap ticker | — | **1** |
| Firehose bandwidth | **672 MB/hour** | — |

Sample 1's two hits were `"…CORRUPT, LAZY A$$ES…"` (a false positive) and a crypto
bot posting `$AAVE`. Sample 2's single genuine equity post was an automated
insider-filing bot (`$MRCY — Ratner Steven, EVP, CHRO SOLD: 4,000 shares`). A
broad finance-keyword regex fired 19 times in 8,553 posts and was almost entirely
false positives: *Stockholm*, *Stockton*, *"stocked up on Canadian Club"*,
*"shorted by $800K"*, *"stock Dive AUVs"* `[V]`.

**Caveat, stated plainly:** both firehose samples were taken ~22:00 ET, after the
close. They understate market-hours volume. But they are corroborated by
Measurement 1, which *does* cover a full session and independently lands on the
same order of magnitude — ~286 strict cashtag posts across the 15 most-discussed
names in a whole trading day. Extrapolating a long tail, **all US-equity cashtag
chatter on all of Bluesky is order 500–1,500 posts/day** `[I]`.

**Measurement 3 — community-size proxies** `[V]`, 2026-09-09.
The most-liked finance feed generator on the entire network:

| Feed | Likes |
|---|---|
| Stock Market (`@bullwinkle`) | **113** |
| Trading (`@insiderfinance.com`) | 72 |
| Stocks (`@bluestocks.app`) | 56 |
| Trending Finance (`@bluestocks.app`) | 49 |
| Quant Finance | 25 |
| *— for scale, returned in the same result set —* | |
| **MTG Content Creators** (Magic: The Gathering) | **158** |

Bluesky's flagship stock-market feed has fewer likes than a Magic: The Gathering
creator list.

**Measurement 4 — what is actually *in* those feeds** `[V]`:

| Feed | Posts/day | With a cashtag | Unique authors | Top authors |
|---|---|---|---|---|
| Stocks | 210 | **1 of 153** | 58 | reuters.com (25), bloomberg.com (15), cnbc.com (15), wsj.com (10) |
| Trending Finance | 376 | **3 of 277** | 100 | reuters.com (39), bloomberg.com (18), cnbc.com (18), wsj.com (15) |
| Stock Market | 537 | **20 of 294** | 220 | dutchbellbeaker (24), market-ocean-en (7), secwatch (6) |
| Trading | 1,022 | 143 of 299 | 74 | **formdelta (108)**, cryptonforecast (29), crypto.at.thenote.app (20), voiceofchain (14) |

The two largest "finance" feeds are **newswire RSS bridges** — Reuters, Bloomberg,
CNBC, WSJ, FT auto-posting headlines. That is not crowd sentiment; it is the same
news wire Track B already covers, arriving second-hand. The one feed with real
cashtag density is 36% one account and the remainder crypto bots.

**Measurement 5 — the trend is down, not up.** Single-page `$TSLA` rate by era `[V]`
(post counts ÷ page time-span; approximate, `[I]` on the extrapolation):

| Date probed | ≈ posts/day |
|---|---|
| 2023-08 | ~2.5 |
| 2024-02 | ~5 |
| **2024-11-14** | **~130** ← the post-election exodus peak |
| 2026-09-08 | **37** |

Finance chatter on Bluesky peaked with the November 2024 migration wave and has
fallen roughly 3.5× since. This tracks the platform: mobile MAU 10.4 M in June
2026, **−27% YoY**, DAU ~3 M in July 2026, **−25.6% YoY**, and **−52% from the
Q4-2024 peak** (Similarweb via TechCrunch, 2026-08-11) `[R]`. Bluesky's own CEO has
pivoted the company toward the protocol rather than the app `[R]`.

**The comparison that settles it.** StockTwits alone averages **~3,585 TSLA
mentions/day** (August 2026) `[R]`. Bluesky's *entire* US-equity cashtag output —
every ticker, all day — is roughly **one third of StockTwits' TSLA-only volume**,
and Bluesky's own `$TSLA` count is **~1% of StockTwits'** `[V]/[R]`.

### A4.6 Bot contamination — high, and structurally so

`[V]` The authors carrying almost all the cashtag volume are automated:
`insiderfinance.com`, `robot2trade`, `tradingstats.xyz`, `stocknear`, `aistockwire`,
`tapeboard`, `stocktitan.net`, `insiderdashboard`, `watch4insider`, `tickerade`,
`spymag-bot`, `v1s1on-3ndl3ss`, `formdelta`. Raw `$IONQ` search surfaced 216 hits
of which the top five authors were `informaq-pt`, `informaq-vi`, `informaq-ru`,
`informaq-es`, `informaq-ko` — one translation farm posting identical content in
five languages (author diversity 0.19) `[V]`.

Two consequences the brief should carry into Track D:

1. **The brief's author-diversity metric is not optional here — it is the whole
   filter.** On measured data it separates real chatter (0.7–0.85) from farms
   (0.19) and single-source floods (0.46 on QQQ) cleanly.
2. **Most Bluesky "sentiment" is price-derived, not independent of price.**
   `tapeboard.bsky.social` — literally a breakout scanner bot, a TapeReader
   competitor — posts *"$SATL breakout, up 13.9% on 4,801,697 volume"* `[V]`. Counting
   that as attention means counting our own scan output back to ourselves.
   For a breakout trader this is the worst possible contamination: **the "signal"
   fires because the stock already broke out.** Any Bluesky collector must
   maintain an author denylist of scanner/wire bots, and even then a majority of
   remaining volume is news bridges.

### A4.7 ToS posture

Bluesky's Terms of Service (effective **2025-08-14** `[V]`) contain **no anti-scraping
clause, no automated-access clause, and no API terms at all** `[V]`. Unusual, and
consistent with an openly-federated protocol whose data is public by design. There
is no stated retention limit and no attribution requirement.

`[I]` This is the most permissive posture of any platform in Track A. Redistribution
on a public site is a Track H question, but nothing in the ToS forbids it — which,
for a source this thin, is a fact about the *option*, not about the *value*.

### A4.8 A4 verdict

**Access: solved and free. Density: fatal.**

Placement on the ladder: **Rung 0 ($0)** — everything above is keyless, and there
is nothing to buy at any rung that improves Bluesky, because the constraint is
that the people are not there.

Recommendation — build it anyway, but scope it honestly:

- **Do build** the keyless per-author collector on `com.atproto.repo.listRecords`.
  It is ~50 lines, has a documented 3,000/300 s budget, needs no key, has full
  history, and matches the brief's §5 "night zero" mandate. Seed it with a
  curated list of the ~120–150 accounts we measured actually posting equity
  cashtags, minus the scanner/wire denylist. Cost to run forever: effectively zero.
- **Do not build** anything on `searchPosts` (throttle is a reputation-decaying
  opaque 403) or on Jetstream (672 MB/h to capture ~1 equity post per 4 minutes).
- **Do not** expect Bluesky to answer H1–H5. At 0–15 posts/day for the small- and
  mid-caps that a breakout scanner actually surfaces — and literally **0** for
  `$BBAI` and `$AEHR` on a full session — a z-score against a 20-day baseline is
  Poisson noise. `[I]` The honest statement for Track D2's power analysis is:
  **Bluesky cannot produce a per-ticker attention series for anything outside the
  top ~30 US names, at any horizon, at any budget.**
- The one place it might earn its keep: **H6, the market-wide regime filter.**
  Aggregate bull:bear polarity across all equity chatter uses the whole ~500–1,500
  posts/day as a single daily observation rather than slicing it per ticker. That
  N is workable. It is also the hypothesis least likely to matter to a
  discretionary trader's next trade — hand this to Track D to judge.

---

## A5 — Discord & Telegram

The brief demands this be argued rather than assumed. Here is the argument.

### A5.1 Discord — ToS posture

- **Terms of Service, effective 2025-09-29** `[V]`: prohibits *"scraping our services
  without our written consent, including by using any robot, spider, crawler,
  scraper, or other automatic device, process, or software."*
- **Developer Policy** `[R]` (Discord's own support article; direct fetch returns
  403 to non-browser clients, so quoted via search of that article): *"Do not mine
  or scrape any data, content, or information available on or through Discord
  services"*, and message content obtained through the APIs may not be used to
  train ML/AI models without express permission.
- **Self-bots** — automating a normal user account outside the OAuth2 bot API —
  are *"and have always been a violation of our API Terms of Use"*, with account
  termination as the stated consequence, and Discord states it has implemented
  detection for it `[R]`.

**Self-bot verdict: never.** Not a risk-tolerance question. It is a stated
termination offence, it violates the ToS on its face, and it puts the trader's
personal Discord account — which is where his trading rooms live — at risk of
being destroyed. The downside is losing access to the rooms he pays for; the
upside is a data source we have no evidence is predictive. That trade is
strictly negative.

### A5.2 Discord — is there a legitimate path?

Yes, narrowly, and it still fails on merit.

The legitimate path is an OAuth2 **bot application** invited to a server by
someone with Manage Server permission, with the **MESSAGE_CONTENT privileged
intent** enabled. As of **2026-06-10** Discord moved the review threshold from
"100 servers" to **"10,000 unique reachable users"**, and apps below it can
self-enable the intent in the Developer Portal without review `[R]`. A bot in
one or two private trading rooms is comfortably below that.

So the mechanics exist. The blockers are:

1. **It needs an account and a server owner's consent.** Creating the Discord
   developer application is forbidden tonight (brief §2) and belongs on the Track K
   checklist at best. Getting a paid trading room's admin to install a
   data-collection bot is a social negotiation, not an engineering task, and most
   room operators will refuse — their edge *is* the chatter.
2. **The Developer Policy's mining/scraping prohibition is in tension with the use
   case** even with the intent granted `[I]`. "The bot is in the server legitimately"
   answers the API-access question, not the "do not mine data" question.
   Redistributing derived sentiment from a private paid room on a public site
   (tapereader.us) is a Track H problem with no clean answer.
3. **The statistics are hopeless.** `[I]` A trading room has one to a few hundred
   active voices. On any given ticker on any given day that is single-digit N.
   The brief's own metric family — z-score vs a 20/60-day baseline, author
   diversity, percentile rank within the liquid universe — needs a denominator
   this source cannot supply.
4. **The conflict of interest is total, and it points the wrong way.** `[I]` In a
   trading room the loudest voice is the person already in the position. Callouts
   are published *after* entry, by someone who benefits from you buying. For H2
   (crowded/late) and H3 (fresh discovery) this is not merely noisy — it is
   systematically biased in the direction that hurts a breakout trader most:
   maximum room enthusiasm coincides with the worst entry.

**Keyless surfaces, measured 2026-09-09** `[V]`:

| Endpoint | Result |
|---|---|
| `/api/v10/channels/{id}/messages` | `401 Unauthorized` |
| `/api/guilds/{id}/widget.json` | `403` (widget off by default) |
| `/api/v10/invites/{code}?with_counts=true` | **`200`, no auth** — returns guild name, description, icon, and approximate member/presence counts |

The invite endpoint is the only keyless Discord data in existence and it carries
no message content. `[I]` It could in principle be sampled daily as a
*room-popularity* proxy ("is retail piling into trading Discords this month?"),
which is an H6-flavoured regime input. It is not per-ticker, it is not sentiment,
and it is not worth a collector.

**Discord verdict: ❌ No. Rung: N/A.** Argued, not assumed.

### A5.3 Telegram — more permissive, and it does not help

**ToS** `[V]` (`core.telegram.org/api/terms`, no effective date shown): third-party
clients are broadly permitted and monetisation is allowed, but the terms
explicitly prohibit using Telegram data *"to train, fine-tune or otherwise engage
in the development … of artificial intelligence, machine learning models."*
`[I]` Simple counting and keyword aggregation is arguably outside that; anything
model-based is squarely inside it. That closes the door on the more interesting
version of the idea.

**Two access paths:**

- **Bot API** — cannot read a channel it does not administer, and cannot backfill
  history. Useless for collection `[R]`.
- **MTProto** (`messages.getHistory`) — reads full history of any public channel, or
  any channel a logged-in user belongs to `[R]`. Requires a **user account and phone
  number**. Out of scope tonight per brief §2, and it is exactly the "logged-in
  user automation" posture that got Discord users banned, even if Telegram
  tolerates it.
- **`https://t.me/s/<channel>` — genuinely keyless**, and we tested it `[V]`:
  HTTP 200, 20 messages per page, `?before=<message_id>` paginates backwards
  (page 2 returned 19 messages, ids 507–526). No account, no key, no rate limit
  observed at our (low) request volume.

**So the access works. The content does not exist.** Survey of six candidate
finance channels, 2026-09-09 `[V]`:

| Channel | HTTP | Msgs on page | `$TICKER` tokens |
|---|---|---|---|
| `traderoom` | 200 | 20 | **0** — Persian-language Ripple/XRP whale content |
| `MarketTwits` | 200 | 20 | **0** — Russian macro/oil/reserves + broker ads |
| `stocktwits` | **302** | — | channel not publicly previewable |
| `wallstreetbets_official` | **302** | — | channel not publicly previewable |
| `StocksAndTrading` | 200 | 0 | empty |
| `stock_market_news` | 200 | 1 | "Channel created" |

`[I]` The structural reason: **US day-trading rooms on Telegram are private groups,
not public channels.** `t.me/s/` cannot see private groups at all, and MTProto can
only read them with a member account. The keyless path and the content are
disjoint sets. What *is* publicly previewable is Russian- and Persian-language
crypto and macro relay channels — irrelevant to a US-equity intraday breakout
trader, and heavily ad-laden.

**Telegram verdict: ❌ No. Rung: N/A.** The one genuinely keyless chat endpoint in
this entire track returns nothing we can use.

### A5.4 A5 verdict

Discord and Telegram both fail, for the same underlying reason stated two ways:
**the chatter that would be worth having is inside private, paid, membership-gated
rooms, and the chatter that is publicly reachable is not about US equities.**
Discord adds a termination-risk hazard on top. Neither belongs on the budget
ladder at any rung; neither belongs on the Track K signup checklist.

The one thing worth carrying forward: `[I]` if the trader is *already* a member of a
room he values, the highest-value use of it is not automated collection — it is a
manual `Catalyst` / `Origin` tag on the journal row, which the sheet already
supports (`Origin` = `Callout`). That captures the same information at zero
engineering cost and zero ToS exposure, and it is already built.

---

## A6 — Video (YouTube / TikTok / Twitch)

Timeboxed per the brief. Short, because the answer is short.

### A6.1 YouTube Data API v3

**Cost: $0, key required, no card** `[R]`. Free tier, no billing meter.

**Quota, from Google's own `determine_quota_cost` page, fetched 2026-09-09** `[V]`:
the default allocation is **100 `search.list` calls/day**, 100 `videos.insert`/day,
and **10,000 units/day combined for all other endpoints**, with `search.list`,
`videos.list`, `commentThreads.list`, `comments.list` and `channels.list` each
costing 1 unit; `search.list` sits in its own capped bucket. Third-party sources
still describe the older model where `search.list` cost 100 of the 10,000 units
`[R]`. **Both models give the same practical ceiling: 100 searches per day.**

`[I]` What 100 searches/day buys: 100 ticker-queries, or ~14 tickers at one query
per session-window per day. TapeReader's liquid universe is ~4,174 names
(`docs/market-scans/phase-1-spec.md`). This does not cover 0.5% of it. There is no
grouped/bulk endpoint — no YouTube equivalent of Polygon's grouped-daily call.

**The structural killer — retention.** The YouTube API Services Developer Policies
require that stored API data be **deleted or refreshed after 30 calendar days**
`[V]`. Approved clients may retain *statistical* metrics (views, likes, subscriber
and comment counts) for up to 36 months, but **video titles, descriptions and
comment text remain under the 30-day rule** `[V]`.

`[I]` This is disqualifying on its own terms and it is worth being precise about
why. The brief's §1.3 accrual question asks what must start collecting tonight so
that in three months there is a dataset. **YouTube text data cannot legally be
three months old.** A source that must forget faster than the study needs to
remember is not a source.

**Signal quality** `[I]`: YouTube titles do carry tickers ("$NVDA to $250?!") and
would be trivially regex-extractable. But: videos publish *after* the move, not
before; thumbnail/title selection is optimised for click-through, which biases
toward extremes and away from the base rate; there is no timestamp precision
useful to an intraday trader; and `search.list` result counts are unreliable for
volume estimation. For **H5 (overnight 16:00→09:15 ET attention delta)** —
the hypothesis that feeds the Morning Plan — YouTube's publish cadence is simply
the wrong resolution.

**Verdict: ❌ No. Rung: would be $0, but excluded on retention grounds, not cost.**

### A6.2 TikTok

**Research API** is free (1,000 requests/day, up to 100,000 records/day) but
eligibility is restricted to verified academic institutions and registered
non-profits in the US/EEA/UK/Switzerland, with a research proposal and evidence of
ethical review; **commercial users are explicitly ineligible**, and using Research
API credentials commercially risks losing access entirely `[R]` (as of 2026).

**Verdict: ❌ Dead end. One line, so nobody re-researches it.** TapeReader is a
commercial-adjacent public site; it does not qualify, and no amount of budget
changes that — this is an eligibility gate, not a price.

### A6.3 Twitch

Not investigated beyond scoping. `[I]` Twitch finance streams are live-chat, which
means no durable text record, no ticker structure, and a chat culture dominated by
emotes. The brief ranked video low; Twitch is the lowest part of it. Recorded as
**not researched**, deliberately, so the gap is visible rather than silent.

### A6.4 A6 verdict

Video is out. YouTube is free and technically accessible but cannot retain the
history the study exists to build; TikTok is eligibility-gated to academics;
Twitch has no usable artefact. **Nothing here goes on the ladder at any rung.**

---

## Dead ends — one line each, so nobody re-researches them

- `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` — **HTTP 403 for all queries since mid-2026.** Use `api.bsky.app`. `[V]`
- `bsky.social/xrpc/app.bsky.feed.searchPosts` — 401 `AuthMissing`; it is a PDS, not an AppView. `[V]`
- Bluesky `hitsTotal` — capped at 10,000 for every query; not a volume metric. `[V]`
- Bluesky cashtag search — **no `$` operator; the sigil is stripped.** `$SPY` returns espionage posts. `[V]`
- AT Protocol cashtag facet — **does not exist**; lexicon has only `mention`/`link`/`tag`. Cashtags are client-side rendering. `[V]`
- Bluesky unauthenticated search cursor pagination — 403 on any cursor since July 2026; walk `until` backwards instead. `[R]`/`[V]`
- Jetstream deep replay — clamps to ~37 h; not a backfill mechanism. `[V]`
- Discord `/api/guilds/{id}/widget.json` — 403 unless a server explicitly enables the widget. `[V]`
- Discord message read without a token — 401, always. `[V]`
- Discord self-bots — stated termination offence. Never. `[R]`
- `t.me/s/stocktwits`, `t.me/s/wallstreetbets_official` — 302, not publicly previewable. `[V]`
- TikTok Research API — commercial applicants explicitly ineligible; academic/non-profit only. `[R]`
- YouTube text data retention — 30-day delete-or-refresh; cannot accrue history. `[V]`

---

## Handoff notes for Tracks D, G, I, K

- **Track D (signal design):** Bluesky supports **H6 only**, as a single daily
  market-wide aggregate. It cannot support H1–H5 per-ticker — the counts are
  0–15/day for exactly the small/mid-caps a breakout scan surfaces. If Track D
  wants a Bluesky metric, define it at the market level and state the N.
- **Track D (traps):** add one this track discovered — **scanner-bot reflexivity.**
  A measurable share of Bluesky small-cap cashtag volume is other people's
  breakout scanners echoing price action (`tapeboard.bsky.social` posts
  `"$SATL breakout, up 13.9% on 4,801,697 volume"`). Attention measured this way
  is a lagging transform of price, not an independent variable, and it will
  manufacture a spurious H1 result if not denylisted.
- **Track G (cost ladder):** A4 is Rung 0 and **stays** Rung 0 — no amount of money
  improves Bluesky, because the constraint is population, not access. A5 and A6
  do not appear on the ladder at all. If the ladder needs a social source with
  real volume, it is A1/A3, not this track.
- **Track I (build plan):** the Bluesky adapter should target
  `com.atproto.repo.listRecords` against each author's PDS (resolve handle → DID
  via `com.atproto.identity.resolveHandle`, DID → PDS via `plc.directory`), honour
  the `ratelimit-policy: 3000;w=300` headers it actually returns, and paginate by
  cursor. Do **not** implement a `searchPosts` path — the opaque-403 throttle will
  silently write zeros into the series.
- **Track K (signup checklist):** **nothing from A4–A6 needs an account.** Bluesky
  is fully keyless. YouTube would need a Google API key but is excluded on
  retention grounds, so do not list it. Discord and Telegram are excluded on
  merit. This track contributes **zero items** to the morning checklist — which is
  itself the useful summary of it.
