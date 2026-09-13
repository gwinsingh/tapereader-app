# 01 — Social Platform Landscape

**Track A** · **As-of: 2026-09-08** (live probes ran 2026-09-08 ~21:00 ET → 2026-09-09 ~02:15 UTC)
**Scope:** A1 X/Twitter · A2 Reddit · A3 StockTwits · A4 Bluesky/AT Protocol · A5 Discord & Telegram · A6 Video · A7 derived-sentiment aggregators
**Constraints honoured:** no account created, no credential entered, no money spent, no trial started. Every measurement below came from an **unauthenticated** endpoint.

### Evidence tags

Per `docs/journal-market-research/00-method.md`:

- `[V]` — verified on the source's own material (its docs, pricing page, spec, ToS)
- `[R]` — reported by third parties
- `[I]` — our inference
- `[A]` — verified on an **archived** copy of the source's own page (used by `.wip/stocktwits-terms-resolution.md`, cited in §5)
- `[M]` — **measured by us** against a live endpoint during this run. Used by the A1–A3 research where a probe result exists. **`[M]` outranks `[V]` outranks `[R]`.** Elsewhere in this document a live measurement is folded into `[V]` per the original file's convention; where the distinction matters it is stated in the sentence.

> Where two source files disagree, or where `13-open-questions.md` overrules a
> raw finding, the disagreement is surfaced inline rather than resolved
> silently. **`13-open-questions.md` is authoritative.**

---

> **Status note (added by the orchestrating session).** Where this file describes
> StockTwits as "unresolved in §6", that question has since been **settled
> restrictively** — `13-open-questions.md` §6 now reads RESOLVED AGAINST US and
> §7 is WITHDRAWN. The file's verdict (NOT ADOPTED, do not add to the collector)
> is correct and unchanged; only the "pending" framing is stale. The knock-on
> matters: the pre-registration's forward-only assumption and its 2027+ horizons
> stand, and ticker resolution has no free licensed solution.


## 1. Summary verdict

| Source | Keyless? | History depth | Ticker resolution | Cost | Legal status | Verdict |
|---|---|---|---|---|---|---|
| **ApeWisdom** (`apewisdom.io/api/v1.0`) | **Yes** `[V]` | **None** — zero retrievable past `[V]` | Bare token **or** `$` prefix; rules published; collisions present (`AGI` #3) `[V]` | **$0** | **No ToS page at all** — `/terms/` 404s. Absence of a licence ≠ a grant `[V]` | ✅ **ADOPTED. Collecting since 2026-09-08 21:00 ET.** Best free source in the track. |
| **Tradestie** (`tradestie.com/api/v1`) | **Yes** `[V]` | **2021-03-20 → today**, ~30 usable months in 3 blocks with two multi-month holes `[V]` | Undisclosed; same collisions (`AI` top on 27/37 dates) `[V]` | **$0** | Site has ToS; API page imposes no licence/attribution. Redistribution unresolved `[V]` | ✅ **ADOPTED, counts only.** `sentiment_score` is a static per-ticker constant — **quarantine or drop it.** |
| **StockTwits** (`api.stocktwits.com/api/2`) | **Yes** `[M]` | **Walkable** — AAPL 14 days, **AUPH 4 months / 3,590 msgs at ~30s/ticker** `[M]` | **Best in the track** — cashtags structurally pre-parsed in `tokenized_body` `[M]` | **$0** | ⚠️ **UNRESOLVED in §6; a later pass resolves it restrictively.** ToS §5 bans automated extraction absent an *approved* API; the v2 docs now 404 entirely `[V]` | ⚠️ **NOT ADOPTED.** Technically the best source found; contractually blocked. **Do not add to the collector.** See the §5 update — a later resolution pass hardens this. |
| **Reddit — Arctic Shift** (`arctic-shift.photon-reddit.com`) | **Yes** `[M]` | **2005 → now, ~4 min behind live** `[M]` | **Poor** — 0.6% of WSB comments carry a cashtag `[M]` | **$0** | **No licence stated at all**, no uptime guarantee `[V]`. Redistribution blocked pending Track H | 🟡 **Viable, and the only Reddit route.** Access solved; ticker extraction is the blocker. |
| Reddit — official Data API | No — OAuth, **manual approval** `[R]` | Live listings only, **no archive** `[I]` | Poor (same as above) | $0 non-commercial / ~$0.24 per 1k commercial `[R]` | Commercial-use classification of a public product site **unverified**; Reddit's own policy pages unreachable `[M]` | ❌ Approval-gated + commercial clause. Not tonight. |
| Reddit — keyless (`.json`, RSS, old.reddit, oauth host) | — | — | — | — | — | ❌ **DEAD — HTTP 403 to datacenter IPs.** GitHub Actions is blocked too `[M]` |
| **X / Twitter — official API** | No — account + credits | **Full archive to March 2006** `[V]` | **Good** — `$` is a first-class standalone operator `[V]` | **$0.005/post read**, no free tier `[V]` | Scraping "expressly prohibited" `[R]`; *X Corp v. Bright Data* dismissed ToS claims on preemption grounds `[R]` | ❌ **Priced out.** $10/mo = ~2,000 posts = **~95/day across the whole watchlist.** |
| X — Apify actors | No — account + card | "Unlimited date ranges" `[V]` | Good (advanced search incl. cashtags) `[V]` | $0.15–$0.50 / 1k `[V][R]` | ToS-hostile by construction | 🟡 Only X path that fits ≤$10 (~1,200 tweets/day). **Needs a signup — deferred, not night-one.** |
| X — direct resellers | No — account | Varies | Good | $0.02–$0.20 / 1k `[R]` | ToS-hostile | ❌ Cheapest $/post but **every price is vendor-published on the vendor's own blog.** `[R]` at best. |
| X — keyless (Nitter, syndication CDN) | — | — | — | — | X Corp C&D letters **24 Aug 2026** `[M][V]` | ❌ **DEAD.** No keyless X read path exists. |
| **Bluesky — PDS `listRecords`** | **Yes** `[V]` | **Full** (per account, to its first post) `[V]` | **DIY regex — no cashtag exists in the data model** `[V]` | **$0** | **ToS has no anti-scraping, no automated-access, no API clause at all** — most permissive in the track `[V]` | 🟡 **Build (~50 lines), but scope to H6 (market-wide regime) only.** Data is measured too thin for per-ticker use — `13-open-questions.md` §11. |
| Bluesky — `searchPosts` (`api.bsky.app`) | Yes `[V]` | Full archive to 2023-08 `[V]` | **Broken — the `$` sigil is stripped** `[V]` | $0 | Same (silent) | ❌ **Do not build on it.** Opaque-403 throttle degrades to **1 req / 61 s** and writes silent zeros. |
| Bluesky — Jetstream firehose | Yes `[V]` | **~37 h replay only** `[V]` | DIY regex | $0 | Same | ❌ 672 MB/hour to capture ~1 genuine equity post per 4 minutes. |
| **Discord** | Invite endpoint only `[V]` | n/a | n/a | $0 + signup for the real path | ToS bans scraping; **self-bots are a stated termination offence** `[R]` | ❌ **No.** Argued, not assumed — single-digit N, biased the wrong way. |
| **Telegram** (`t.me/s/<channel>`) | **Yes** `[V]` | Deep, `?before=` paginates `[V]` | Free text | $0 | ToS bars using Telegram data to train ML/AI models `[V]` | ❌ **No.** Access works; **six probed finance channels returned zero US-equity content.** |
| **YouTube Data API v3** | No — free key, no card | **30-day delete-or-refresh cap on stored text** `[V]` | Titles/descriptions, noisy | $0 + signup | Developer Policies mandate the 30-day retention limit `[V]` | ❌ **Structurally disqualified.** A source that must forget faster than the study must remember is not a source. |
| **TikTok Research API** | No — vetted application | — | — | Free if eligible | **Commercial users explicitly ineligible** `[R]` | ❌ A gate, not a price. |
| Twitch | — | — | — | — | — | ❌ **Not researched, deliberately.** Live chat: no durable artefact. |
| SwaggyStocks | No — free account | Not exposed | Same collisions (`OIL` #1, 354 mentions) `[V]` | $0 w/ account | Site has `/tos`; no public API to use | ❌ Skip. Top-15 free, rest behind a login wall; narrower and less transparent than ApeWisdom. |
| Quiver Quantitative | No | — | — | $30/mo Hobbyist `[V]` | — | ❌ **DEAD for this track.** WSB series frozen at **2025-02-21**; WSB is in no API tier `[V]`. |
| StockGeist | No | 24 h free / 7 d / 30 d `[V]` | — | Free / $50 / $100 `[V]` | — | ❌ **$100/mo buys 30 days, daily resolution, 20 tickers.** Steal the schema, not the product. |
| Finnhub social sentiment | No | `from`/`to` — real per-symbol history `[V]` | Symbol-scoped | **Premium required** `[V]` | — | 🟡 **Moved off free.** Best paid schema (hourly `mention`/`positiveMention`/`negativeMention`). **Needs a price quote.** |
| EODHD `/api/sentiments` | Demo token only | 2016 → now, **30 gaps >4 d incl. a 594-day hole** `[V]` | Symbol-scoped | Free = 20 calls/day; $19.99–$99.99 `[V]` | — | ❌ For this track: **it is news sentiment wearing a social label.** Belongs to Track B. |
| Sentiment Investor · Utradea · Tickeron · socialsentiment.io · Stocksera · SentiSense · LunarCrush · FMP · Adanos | — | — | — | — | — | ❌ **Dead, timed out, crypto-only, or key-gated demo tiers.** One line each in §10. |

**One-line answer for the ≤$10 rung:** *the $0 rung is not a compromise in this track — it is the best available option. ApeWisdom + Tradestie ship tonight for nothing; nothing between $0 and $25 exists to buy; and the ≤$10 cap is better spent on Track B/C sources than on any social platform.*

---

## 2. The strategic read

**The platforms split cleanly into three groups, and the split is not about money.**

**Group 1 — genuinely open and useful: the derived-sentiment aggregators.** ApeWisdom and Tradestie are keyless, free, unthrottled at any cadence we would use, and — critically — **serve raw counts rather than a scored composite**. ApeWisdom publishes its ticker-detection rules `[V]`, which means its `mentions` field is raw material we can renormalize, z-score and audit ourselves rather than a black box embedding somebody else's unstated model. That is worth strictly more than any competitor's undecomposable 0–100 score. Both are already collecting: the night-zero snapshot ran for real at 2026-09-08 21:00 ET, 2,078 rows across six filters, with idempotency verified. **This group is the whole of the track's Rung 0 product.**

**Group 2 — open but contractually unresolved: StockTwits.** On the measurements it is the find of the run: keyless, 0.14 s, 8.9 req/s with zero throttling and no rate-limit headers, structurally pre-parsed cashtags, walkable history reaching months back on quiet names, and **human-declared Bullish/Bearish labels on 45–48% of messages** — the only labelled ground truth in the entire study that cannot be look-ahead contaminated, because the author declared it at post time. And it is **not adopted**, because developer registration is closed, no ToS was ever accepted, no licence was ever granted, and Track H reads the terms as expressly naming and banning scraping. This is the same shape as the FINRA finding: *technically open and contractually restricted are not mutually exclusive.* The narrow unresolved question — whether unauthenticated requests to documented public v2 endpoints are "scraping" or ordinary API use that merely lacks a key because registration is shut — decides whether the best social source in the run is usable at all (`13-open-questions.md` §6). **A dedicated resolution pass has since answered it restrictively** (`.wip/stocktwits-terms-resolution.md`): the v2 docs now 404 entirely, so there is no live API ToS to invoke, and all three framings land banned. On that reading Group 2 collapses into Group 3 — see §5.

**Group 3 — closed or empty.** X has the best cashtag hygiene and the deepest archive (2006) and is simply priced out: $10/month buys ~95 posts per day across the entire watchlist, which is not a signal, it is an anecdote. Reddit's direct routes all return 403 to datacenter IPs, so **GitHub Actions would be blocked too** — Arctic Shift is the only viable route, and it is one unpaid maintainer with no stated licence and no uptime guarantee (§8). Discord and Telegram fail for the same reason stated two ways: *the chatter worth having is inside private, paid, membership-gated rooms, and the chatter that is publicly reachable is not about US equities.* Video is out on retention and eligibility grounds, not cost. And Bluesky — whose access is genuinely the most permissive and most open of anything here — belongs in this group **on data grounds**: five independent measurements agree the people are not there (§11).

**The through-line that matters more than any of the above: ticker resolution, not access, is the binding constraint across the whole track.** Every group hits it:

- On Reddit, only **0.6%** of WSB comments use a cashtag `[M]`, forcing bare-token extraction — and **39 of 51** common English words tested are real US tickers (`$OPEN`, `$NOW`, `$ALL`, `$LOVE`, `$WORK`, `$BULL`) `[M]`. A stoplist and a complete ticker universe are in direct conflict; one of them has to lose.
- On Bluesky, `searchPosts` **strips the `$` sigil** — `q=$OPEN` returned 295 hits in a full trading day, **zero** containing the literal string `[V]` — and there is **no cashtag in the AT Protocol data model at all**; the lexicon has only `mention`/`link`/`tag`, and cashtags are client-side rendering `[V]`.
- On the aggregators, collision contamination is in **today's live top 10**: `AGI` (Alamos Gold, a gold miner) ranked #3 with 140 mentions `[V]`; SwaggyStocks' #1 was `OIL` with 354 `[V]`; Tradestie's top ticker was `AI` on 27 of 37 sampled dates and `TA` was top-50 on 23 `[V]`.
- On X the resolution is good — and unaffordable. On StockTwits it is **perfect and free**, resolved by the platform at post time with the author's intent — and contractually blocked.

So the ordering of the track's problems is: the source with clean ticker resolution is the one we may not use; the sources we may use need extraction logic that is the single largest source of measurement error in the study. **Track D's ticker-extraction design, not the collector's access layer, is where this study's signal quality is actually decided.**

Two further cross-cutting hazards belong at the top rather than buried per-platform. First, **scanner reflexivity** (`13-open-questions.md` §10): a measurable share of small-cap cashtag volume is other people's breakout scanners echoing price — `tapeboard.bsky.social` posting *"$SATL breakout, up 13.9% on 4,801,697 volume"* `[V]`. That is not crowd attention; it is a lagging transform of price wearing the costume of sentiment, and left in it manufactures a spurious H1. Second, **no aggregator in A7 exposes per-post text, author identity, or unique-author counts** — so **author diversity, the bot/pump detector the brief asks Track D to define, is not computable from Rung 0 aggregator data at all.** It requires raw platform access (Reddit, StockTwits, Bluesky), and StockTwits — where it is measurable for free and where it worked cleanly (0.164 on `$AUPH`, 0.19 on a Bluesky translation farm, 0.7–0.85 on genuine chatter) — is the one under contractual hold. That bounds which hypotheses are testable on adopted sources alone, and it must be stated plainly in `04-signal-design.md`.

---

## 3. A1 — X / Twitter

### The free tier is gone

X moved to **pay-per-usage as the default on 2026-02-06**; the free tier was discontinued for new developers `[R]`. X's own pricing page confirms it verbatim `[V]` (fetched 2026-09-08):

> "The X API uses pay-per-usage pricing. No subscriptions—pay only for what you use."

There is **no free read allowance described anywhere on the pricing page** `[V]`. Legacy Basic ($200/mo) closed to new signups in Feb 2026, existing subscribers auto-migrated from 2026-06-01; legacy Pro ($5,000/mo) was announced deprecated 2026-08-14 with migration after 2026-09-01 `[R]`. Existing free-plan users got a one-time $10 voucher `[R]` — irrelevant, we have no account.

**Consequence: there is no keyed X path at Rung 0. None.**

### Verified pricing `[V]` (docs.x.com/x-api/getting-started/pricing, 2026-09-08)

| Resource | Unit cost |
|---|---|
| **Posts: Read** | **$0.005 per resource** |
| User: Read | $0.010 per resource |
| Like / Mute / Block: Read | $0.001 per resource |
| Post: Create | $0.015 per request |
| Post: Create (with URL) | $0.200 per request |

> "Pay-per-usage plans are capped at 3 million Post reads per monthly billing cycle." `[V]`

The unit is **per resource returned**, not per request — a 500-post full-archive page costs $2.50 `[I]`.

**What $10/month buys:** $10 ÷ $0.005 = **2,000 post reads/month** `[I]`. Over ~21 trading days that is ~95 posts/day across the *entire* watchlist — under 5 posts per symbol per day for a 20-symbol morning plan. **That is not a sentiment signal; it is an anecdote,** and a sample that small actively invites over-fitting. To reach ~2,000 posts/day (100 symbols × 20 posts) costs roughly **$210/month** `[I]` — Rung 3, and still thin.

### Cashtag search — better than the folklore

Community threads from the v2 era report the `$` cashtag operator was restricted to Academic Research access, returning `"Reference to invalid operator 'cashtag'"` on standard tiers `[R]`. **That is stale.** X's current operators reference lists it as a plain Standalone operator with no access-level note `[V]`:

> "`$` Standalone — Matches Posts containing a cashtag — `$twtr OR @XDevelopers -$fb`"

`has:cashtags` also exists as a conjunction-required operator `[V]`. The only access-level distinction the current docs draw is query character length: 512 (recent) / 1,024 (full-archive) self-serve, 4,096 Enterprise `[V]`. **Cashtag quality on X is good** — X users genuinely use `$TICKER`, unlike Reddit. The problem is purely price.

### History depth `[V]`

| Endpoint | Depth | Access |
|---|---|---|
| `GET /2/tweets/search/recent` | **Last 7 days** | "All developers" |
| `GET /2/tweets/search/all` | **Complete archive back to March 2006** | "Pay-per-use, Enterprise" |

Full-archive returns up to 500 Posts per request with all query operators available `[V]`.

> **Correction to widely-repeated vendor marketing:** several reseller blogs claim full-archive search "requires Enterprise at $42,000+/month" `[R]`. **X's own documentation contradicts this** — full-archive is explicitly available to pay-per-use `[V]`. The resellers selling the alternative have an obvious incentive to overstate the official price. `[V]` beats `[R]`.

### Resellers and Apify

| Actor | Price | Notes |
|---|---|---|
| `apidojo/tweet-scraper` (V2) | **$0.40 / 1,000 tweets** `[V]` | "unlimited date ranges", advanced search syntax **including cashtags** `[V]`; 30–80 tweets/sec `[V]`; min 50 tweets/query `[V]` |
| `igolaizola/x-twitter-scraper-ppe` | $0.15 / 1k `[R]` | |
| `kaitoeasyapi/...cheapest` | $0.25 / 1k `[R]` | |
| `xquik/x-tweet-scraper` | $0.15 / 1k rows `[R]` | |

**Apify's free tier is useless for collection:** on `apidojo/tweet-scraper`, free users get "5 runs per month, each capped at 10 items" `[V]` — **50 tweets/month**. At $0.40/1k, $10/month = 25,000 tweets ≈ 1,200/trading day `[I]`: a real if modest signal, and **the only X path that fits ≤$10** — at the cost of an account and a card, so it cannot be stood up tonight.

**Direct resellers**, all vendor-published `[R]`: twitterapi.io $0.15/1k (~$0.10 trial credit); SocialData $0.20/1k; GetXAPI $0.05/1k; Sorsa $0.02/1k on a Pro plan. **Sourcing hazard: every one of these numbers appears on a blog owned by the vendor quoting it**, usually in a post comparing itself favourably to competitors. Independent verification is impossible without signing up.

### ToS posture

X's terms are unambiguous on their face: scraping "in any form, for any purpose without our prior written consent is expressly prohibited" `[R]`. **Enforceability is genuinely contested** — in *X Corp. v. Bright Data Ltd.* (N.D. Cal., 2024-05-09) the court **dismissed** X's claims that scraping public data breached its ToS on **Copyright Act conflict-preemption** grounds, reasoning that X's *users*, not X Corp., own the posted content `[R]`; Morrison Foerster, Skadden and Proskauer all read it as a significant scraper-favourable precedent `[R]`. **Do not over-read it:** one district court decision, protecting a well-resourced defendant that litigated, and X has continued to enforce aggressively by other means (see Nitter). For a public site, redistribution (Track H) matters more than collection.

> X's consumer ToS could not be fetched (HTTP 402) — see `13-open-questions.md` §3. Claims resting on it are `[R]` at best.

### Keyless paths — comprehensively dead `[M]`

`cdn.syndication.twimg.com/timeline/profile` → HTTP 200 but **0 bytes**; `.../tweet-result` → **404**; `nitter.net` → HTTP 200 serving a **cease-and-desist notice**, 0 tweets; `xcancel.com` and `nitter.tiekoetter.com` → browser challenges, 0 tweets; `nitter.poast.org`, `nitter.privacydev.net` → connection failed (HTTP 000). All `[M]`, 2026-09-08.

nitter.net's front page carries a notice dated **7 September 2026 — the day before this research** `[V][M]`:

> "On 24 August 2026 cease and desist letters were sent by X Corp. demanding a permanent takedown of Nitter instances and the project's repository. Following legal advice, the Nitter project will continue. This instance and others will be back up and running shortly."

**There is no keyless X read path as of 2026-09-08.** Nitter may return; building on a project under active legal attack from the platform owner is not a foundation. Do not revisit before a stable public announcement.

### A1 verdict

**Rung 2–3. Not recommended at any budget we care about.** X would be the primary source if money were no object. At ≤$10 it delivers ~95 posts/day, which is worse than nothing. The only ≤$10 path is an Apify actor at ~1,200 tweets/day requiring an account and a card. **Track K: optional and deferred, not night-one.**

---

## 4. A2 — Reddit

### The keyless path is dead, and this would have broken the collector silently

Every classic unauthenticated Reddit route returns **HTTP 403 "Blocked"**, measured 2026-09-08 `[M]`: `www.reddit.com/r/<sub>/new.json`, `old.reddit.com/r/<sub>/new.json` (page titled "Blocked"), `www.reddit.com/r/<sub>/new/.rss`, and `oauth.reddit.com/r/<sub>/new` without a token. Tested with a browser UA and with a descriptive bot UA in Reddit's own documented style — both blocked `[M]`.

**Reddit blocks datacenter IPs.** A residential IP might succeed, but that is operationally irrelevant: **our collector runs in GitHub Actions, which is datacenter IP space, so it would be blocked there regardless.** Per `13-open-questions.md` §8, **any Reddit collection must go through Arctic Shift** — it is the only viable route, and treating the keyless path as available would have produced a silently empty series.

### Official Data API — unverified, and the terms could kill it

- **Free for non-commercial use** at **100 queries/minute per OAuth client**; OAuth mandatory `[R]`.
- **Commercial use requires approval and a paid agreement at ~$0.24 per 1,000 calls**, with a bundled tier reported around **$12,000/month for 50M calls** `[R]`. Reddit publishes no self-serve commercial price `[R]`.
- The **"Responsible Builder Policy" closed self-service app registration in late 2025** — every new OAuth client, free or paid, now goes through manual approval `[R]`. Secondary sources put the policy's last update at **2026-06-05** and add: commercial use requires express written approval; retaining content after deletion is prohibited even when anonymised (≈48 h compliance window); redistribution at scale requires attribution and a link back `[R]`.
- **The official API has no historical archive** — recent listings only. It cannot answer H1–H5 retrospectively `[I]`.

> **`13-open-questions.md` §2 — Reddit's Data API Terms were never actually read.** Attempted through three independent network paths: the in-app browser (navigation denied), WebFetch against `redditinc.com` (refused) and `support.reddithelp.com` (HTTP 403). This is an **environmental limitation, not an agent failure** — no path available to this run can read Reddit's primary terms. **Every Reddit terms claim above is `[R]` and must be re-verified by a human at signup time.**
>
> **A refinement worth carrying:** the prohibition on *deriving* appears aimed at inferring sensitive personal characteristics about users, not at aggregate mention counts. Whether aggregate counts are restricted is therefore **not settled** by anything read in this run, and the pessimistic reading should not be treated as established.

**The commercial-use clause is the live risk.** TapeReader is a free public site but it is a product, not a research project. Whether Reddit classifies it as commercial is a Track H question that could kill the official-API path entirely.

### Arctic Shift — the actual Reddit answer `[M]`

**The maintained Pushshift successor**, run by **one person** (ArthurHeitmann), self-described as "Making Reddit data accessible to researchers, moderators and everyone else" `[V]`. Pushshift itself was restricted to verified moderators in 2023 and shut down thereafter `[R]`. Base URL `https://arctic-shift.photon-reddit.com`. **No key, no account, no cost** `[M]`.

| Property | Measured value (2026-09-08) |
|---|---|
| Auth | **None** `[M]` |
| Latency | 1.1–6.7 s typical `[M]` |
| **Currency** | **~4 minutes.** Newest r/wallstreetbets post `2026-09-09T01:43:05Z` vs wall clock `01:47:14Z` `[M]` |
| **History** | Serves 2021 raw comments and 2021 time-series without difficulty `[M]` |
| Page size | **limit max = 100** (`"'limit' must be between 1 and 100"`) `[M]` |
| Rate limit | Dynamic, load-based. 429 with `X-RateLimit-Reset` headers `[V]`; in practice a **422 `"Timeout. Maybe slow down a bit"`** `[M]`. ~1 request / 2.5 s was sustainable `[M]` |
| Licence | **None stated** `[V]` |
| Guarantees | **"No uptime or performance guarantees :)"** `[V]` |

> **Disagreement resolved in favour of measurement:** Arctic Shift is widely described by third parties as a monthly-dump archive with a **4–6 week lag** `[R]`. **Its API is in fact ~4 minutes behind live** `[M]`. The 4–6 week figure is true only of the bulk dumps. Third-party summaries are wrong about the API.

**Endpoints that matter:**

- `/api/posts/search`, `/api/comments/search` — full row payloads, filterable by `subreddit`, `author`, `after`, `before`, `body` (comments), `title` (posts).
- **`/api/comments/search/aggregate?aggregate=created_utc&frequency=day&body=<TICKER>&subreddit=<SUB>`** — **daily mention counts per ticker**, the exact primitive Track D needs, returning in ~6 s `[M]`:

  ```
  NVDA/day in r/wallstreetbets, Aug 24 → Sep 7 2026
  2026-08-24  544     2026-08-29   51
  2026-08-25  2169    2026-08-30  130
  2026-08-26  1275    2026-08-31  115
  2026-08-27  511     2026-09-01  376
  2026-08-28   71
  ```
  A 4× spike on 08-25 followed by a 30× collapse by 08-29 — exactly the attention-velocity shape H1/H3 are about.

- **`/api/time_series?key=r/<sub>/comments/count&precision=day`** — total subreddit comments/day, ~1.4 s `[M]`. **This is the normalization denominator** that turns a raw count into a share-of-attention, which Track D's z-score design requires.

**Known query limits `[M]`:** `body=` requires scoping by `subreddit`/`author`/`link_id`/`parent_id` — no whole-of-Reddit keyword search; `body=` on `/posts/search` is rejected (posts use `title`/`selftext`); and **aggregate + keyword over peak-volume history times out** — `body=GME` over r/wallstreetbets in **Jan 2021** fails with 422 even on a 2-day window. That is **not a history gap**: the same period works via raw comment fetch, via `time_series`, via a smaller subreddit, and via r/wallstreetbets in calmer 2022 `[M]`. It is a query-complexity ceiling on the single busiest subreddit-period in Reddit's history. Workaround: narrow windows, or the monthly dumps for heavy backfill (which the maintainer recommends) `[V]`.

**Bulk dumps:** monthly archives via **Academic Torrents** and Hugging Face, `.zst`/`.zst_blocks` compressed `[V]`; reported at ~2.5B items through Feb 2026, ~261 GB Parquet on HF, 4–6 week lag; the Academic Torrents set reported at 3.97 TB `[R]`. **Far beyond our storage budget — the API, not the dumps, is our path** `[I]`.

### Subreddit volume — the answer is "one subreddit" `[M]`

Comments in **one market hour** (Thu 2026-09-03, 10:30–11:30 ET):

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

Independently, `time_series` gives r/wallstreetbets at **8,326–20,886 comments/day** across late Aug/early Sep 2026 `[M]`, and **27,996–59,719/day in Jan 2021** `[M]` — roughly a third of its mania-era volume.

> **Sampling lesson recorded so nobody repeats it:** an earlier sample taken on a **Saturday understated everything by ~15×** `[M]`. *Always sample a weekday market hour.*

**Implication `[I]`:** r/wallstreetbets *is* Reddit for this purpose. The other nine subreddits together are 16% of volume. Collect WSB; add r/Daytrading and r/stocks for a less meme-y population; the rest are rounding errors that mainly add cost.

### Ticker resolution — Reddit's fatal weakness `[M]`

From 1,461 live WSB comments: **comments containing a `$CASHTAG`: 9 — 0.6%**. Comments containing a cashtag **or** any bare ALL-CAPS ticker-like token: 324 — **22.2%** `[M]`.

Top-20 such tokens in the live sample: `SPY(31) TSLA(18) QQQ(17) AVGO(16) SPCX(12) LMAO(12) HOOD(9) DELL(9) META(9) MU(8) MSTR(8) SNOW(7) AAPL(6) PL(6) BULL(6) NVDA(6) DOWN(6) FUCK(5) THIS(5) DCA(5)` `[M]`.

`LMAO`, `DOWN`, `FUCK`, `THIS`, `DCA` are noise a stoplist catches. **The trap is deeper: 51 common English words and trader slang were tested against StockTwits' live symbol search and 39 of 51 are real US-listed tickers** `[M]`:

`$ALL` Allstate · `$ANY` Sphere 3D · `$CAN` Canaan · `$GOOD` Gladstone · `$LOVE` Lovesac · `$OPEN` Opendoor · `$REAL` TheRealReal · `$FAST` Fastenal · `$TRUE` TrueCar · `$PLAY` Dave & Buster's · `$WORK` Slack · `$NOW` ServiceNow · `$ONE` · `$TWO` · `$CASH` · `$GOLD` · `$PUMP` ProPetro · `$BULL` Webull · `$HOPE` · `$SAFE` · `$TECH` Bio-Techne · `$DATA` Tableau · `$FUND` · `$MAX` · `$MIN` · `$SEE` Sealed Air · `$STAY` · `$TURN` · `$PEAK` Healthpeak · `$STEP` · `$PAY` · `$SPOT` Spotify · `$LINE` Lineage · `$NEXT` NextDecade · `$LOW` Lowe's · `$FLY` Firefly · `$WELL` Welltower · `$EVER` EverQuote · `$BEST`

**A stoplist and a ticker universe are in direct conflict**: you cannot both catch a real `$OPEN` breakout and suppress "open" (`13-open-questions.md` §9).

**Mitigations for Track D `[I]`:** require ≥2 signals (bare token **plus** a price/option/verb context word); weight by whether the token also appears cashtagged anywhere that day; restrict bare-token matching to symbols already in the day's liquid movers universe (which the market-scans work produces anyway); and **never** treat a common-word ticker's raw count as a level — only as a z-score against its own baseline, which absorbs the constant background noise.

### Bot contamination, survivorship, and a look-ahead trap

- **85% of sampled WSB comments (1,249 of 1,461) sat in a single daily discussion thread** (`t3_1w63g0h`) `[M]`. Efficient to collect; also a warning that this is low-effort chat, not DD.
- **3.1% of archived bodies were already `[deleted]`/`[removed]`** `[M]`. Arctic Shift archives at post time, so it captures content Reddit later removed — this **reduces** deletion survivorship bias relative to live scraping, a genuine advantage for honest research `[I]`.
- **Look-ahead hazard, verified `[V]` and elevated to `13-open-questions.md` §8:** for ~36 hours after archiving, `score` and `num_comments` read **0 or 1**, because rows are captured the moment they are posted and updated later. **A live collector records score≈0 while a backfill of the same day records final scores — they will disagree.** Any model using score would train on values unavailable in real time. **Either exclude score-derived features entirely, or window them past 36 h.** This belongs in Track D's trap list and D2's pre-registration.

### Single-maintainer risk

Arctic Shift is **one unpaid person**, with **no stated licence**, **no uptime guarantee** `[V]`, and a removal-request form implying content can be withdrawn. It is also the *only* viable free Reddit path `[I]`. **Mitigation:** commit our own NDJSON snapshots from night one — if Arctic Shift disappears, the accrued history survives. That is precisely the argument for starting collection before the research finishes. The absence of a licence is a **Track H blocker for redistribution**: private derived metrics are one thing, publishing Reddit-derived content on tapereader.us is another.

### A2 verdict

**Rung 0, buildable, with a caveat.** Arctic Shift delivers keyless, free, near-real-time Reddit with full history and a daily-aggregate endpoint that fits Track D's metric family almost exactly. **The blocker is not access, it is ticker resolution.** Collect r/wallstreetbets (+ r/Daytrading, r/stocks); ignore the long tail.

**Suggested collector shape `[I]`:** pull each target subreddit's comments for the prior session via `/api/comments/search` at `limit=100` with ~2.5 s spacing (~200–400 requests/day for WSB), extract tickers locally against the liquid universe, and **store only aggregated per-ticker counts** — raw WSB text is ~4 MB/day (~1.5 GB/yr), far too much to commit; aggregated counts are kilobytes. Pull `/api/time_series` once per sub per day for the normalization denominator.

---

## 5. A3 — StockTwits

> ### ⚠️ Ruling first: measured excellent, contractually unresolved, **NOT ADOPTED**
>
> The A1–A3 research called StockTwits "the find of the run" and recommended building against it the same night. **`13-open-questions.md` §6 overrules that recommendation.** Track H reads the StockTwits ToS as expressly naming and banning scraping, with developer registration closed pending review. The narrow unresolved question is *not* "is scraping allowed" — it is whether **unauthenticated requests to documented public v2 API endpoints** constitute scraping under those terms, or ordinary API use that merely lacks a key because registration is shut. Those are genuinely different things.
>
> **Until it is resolved: do not add StockTwits to the collector. Treat it as a private-journal candidate at most.** Everything below is recorded because it is measured, valuable, and would be the first thing built the moment the contract question clears — not because it is adopted.
>
> **⚠️ Update — a dedicated resolution pass landed after `13-open-questions.md` §6 was written, and it hardens rather than lifts the hold.** See `.wip/stocktwits-terms-resolution.md`, which concludes **Track H was right**: the v2 API is no longer documented at all (`api.stocktwits.com/developers/docs` and every method page under it return **HTTP 404**; the developer portal is a single frozen page footed "© 2021"), so there is no live API ToS to invoke — and all three possible framings (scraping / ordinary API use / the site's own undocumented backend) land restrictive. It further **corrects one measured claim reproduced below**: `api.stocktwits.com/robots.txt` **does exist** (via 301 to `api-gw-prd.stocktwits.com`) and **disallows `/*?` for all user-agents** — i.e. every paginated `?max=<cursor>` call, which is the entire backfill mechanism. It also surfaces the only unauthenticated rate figure StockTwits ever published, **200 requests/hour per IP**, against which the 8.9 req/s measured below is **~160×**. **Track F/H should treat public display as a clear no and the automated collector as a no; this section is preserved as the measurement record, not as a build plan.** Reconcile `13-open-questions.md` §6 and §7 against that file.

### Registration status: closed `[V]`

StockTwits' developer page states plainly `[V]` (fetched 2026-09-08):

> "We unfortunately won't be accepting new registrations until we have finished our review and made the necessary improvements and upgrades."

Developers are directed to `developers@stocktwits.com`. **No new API keys are being issued.** On its face a hard dead end — except that the documented v2 endpoints serve public data without any key at all `[M]`, which is exactly what makes the contract question live rather than moot.

### Measured: the unauthenticated API is alive, fast, and generous `[M]`

All probes 2026-09-08, no key, no account, no cookie:

| Endpoint | Result |
|---|---|
| `/api/2/streams/symbol/{SYM}.json` | **HTTP 200**, 86 KB, **0.14 s**, 30 messages |
| `/api/2/streams/symbol/{id}.json` (numeric id) | 200 |
| `/api/2/trending/symbols.json` | 200 — 30 trending symbols |
| `/api/2/trending/symbols/equities.json` | 200 |
| `/api/2/streams/trending.json` | 200 — message stream across trending names |
| `/api/2/streams/suggested.json` | 200 |
| `/api/2/search/symbols.json?q=<Q>` | 200 — symbol resolution |
| `/api/2/streams/user/{username}.json` | 200 — per-author history |
| `/api/2/charts/ts/{SYM}.json` | 200 — 24 hourly points, trending score + price |
| `/api/2/symbols/{SYM}.json` | 404 — not a real route |

**No User-Agent required** — an empty-UA request returned an identical 200 `[M]`.

**Rate limit, measured not documented `[M]`:** **60 consecutive requests with no delay → 60/60 succeeded in 6.8 s = 8.9 req/s, zero throttling.** **No rate-limit headers of any kind** are returned. Separately, a **120-page cursor walk (~3,600 messages) completed at 0.25 s spacing without a single error.** This is an extraordinarily permissive endpoint; **politeness, not the rate limit, would set our cadence** `[I]`.

### The Bullish/Bearish tag — live, and the strategic prize `[M]`

It is exposed in the public payload on the unauthenticated endpoint. Each message carries `"entities": {"media": [], "sentiment": null, "discussable": null}`, and where the author tagged their post, `"entities": {"sentiment": {"basic": "Bullish"}}`.

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

**The tag persists on historical messages** — on a 900-message deep walk of `$AUPH` spanning 2026-08-07 → 2026-09-09, **431 of 900 (47.9%) were tagged**, including messages a month old `[M]`. It is stored and served retrospectively, not a transient UI field.

**Why this matters more than anything else in the track `[I]`:** every other sentiment source requires *us* to infer polarity from text with an NLP model — introducing model error, model drift, and an unfalsifiable black box exactly where the brief warns against one. This tag is **declared by the human who wrote the post, at the time they wrote it**, with no post-hoc scoring. It cannot be look-ahead contaminated. It is the cleanest labelled ground truth available at $0, and it doubles as a **training/validation set** for scoring the untagged ~55% and for scoring Reddit text.

### Cashtag resolution — structurally perfect `[M]`

No regex extraction is needed. Every message ships a **pre-parsed** `tokenized_body`:

```json
{"type":"cashTag","data":{"text":"$AAPL","symbol":"AAPL","symbol_display":"AAPL"}}
```

plus a top-level `symbols[]` array with exchange, MIC, `watchlist_count`, and per-symbol `sentiment_change` / `volume_change` fields `[M]`.

**The 39-of-51 common-word collision problem that cripples Reddit does not exist here.** The platform resolved the ticker at post time, with the author's intent `[I]`.

### History depth — walkable, and it changes the power analysis `[M]`

Pagination is by `?max=<cursor>`. **No hard wall was found.**

| Ticker | Pages walked | Messages | Reached back to | Stop reason |
|---|---|---|---|---|
| AAPL (mega-cap, high volume) | 120 | 3,598 | **2026-08-26** (14 days) | the loop ended, not the API `[M]` |
| AUPH (mid-cap) | 120 | 3,590 | **2026-05-08** (4 months) | the loop ended, not the API `[M]` |

**Depth in time is inversely proportional to a ticker's message volume**, since each page is a fixed 30 messages (`limit=` is ignored — page size is hard-fixed at 30 `[M]`). At ~9 req/s, 120 pages costs **~30 s per ticker**; backfilling 100 symbols to ~3,600 messages each is roughly an hour of wall time and ~12,000 requests `[I]`.

> **`13-open-questions.md` §7 — this is why the history matters.** Track D2's power analysis assumed social features exist only from 2026-09-08 forward, so "the counter starts at zero" and no discovery/replication split is possible on social data. **That assumption is wrong if §6 clears.** Depth is *inversely* related to message volume, so **thin single-name breakout candidates reach back further than megacaps — exactly the population the study cares about.** Existing journal trades could be scored retroactively; H1–H4 become partially testable against trade history rather than requiring three months of waiting. It would not rescue the small-effect arithmetic, but it would bring the large-effect horizon forward substantially and enable the locked discovery/replication design on social as well as news. **Track D2 needs a revision pass once §6 is settled.**

### Other free signal in the payload

- **`trending/symbols.json`** returns 30 names with `rank`, **`trending_score`** (e.g. RKLB 9.295), `watchlist_count`, `sector`, `industry`, and a **`trends.summary`** — an LLM-written paragraph explaining *why* the name is trending `[M]`. That last field is a candidate for auto-populating the journal's `Catalyst` column, though it is black-box generated text and must be treated as such `[I]`.
- **Independently confirmed from Track A7's own probing:** the trending call returned `RKLB`, `SMR`, `AMD`, `TTAN`, `GME`, `AXTI`, `BMNR`, `ALAB`, `VSTM`, `POET` — **a markedly more small-cap-and-momentum-flavoured list than either WSB aggregator, and much closer to a breakout trader's actual universe** `[V]`. Two independent agents reached the same conclusion about this endpoint's value.
- **`charts/ts/{SYM}.json`** gives **24 hourly points** of trending score + price plus `events` marking Market Open/Close `[M]`. Rolling 24 h only — **no archive**, so it must be snapshotted daily to accrue `[I]`.
- `watchlist_count` is a slow-moving *stock-of-attention* measure complementary to ApeWisdom's *flow-of-attention*; its **daily delta** is a clean, cheap "new eyes on this name" metric `[I]`. Measured values: AAPL 992,327 `[M]`; GME 307,450 `[V]`.

### Bot contamination — low, and measurable `[M]`

From the 900-message `$AUPH` walk:

| Metric | Value | Reading |
|---|---|---|
| Unique authors | 148 / 900 | **author diversity = 0.164** |
| Top-5 authors' share | **37.2%** of volume | High concentration |
| Median account age | **8.8 years** | Not a bot farm |
| Accounts < 90 days old | 3.1% | Low |
| Zero-follower posts | 0.6% | Low |
| Post sources | Web 372 / Android 295 / iOS 232 / news bot 1 | **Overwhelmingly human app clients** |

**Reading `[I]`:** on a single small/mid-cap, volume is dominated by a handful of long-tenured, high-follower enthusiasts — **concentration, not bots**. Still a hazard (an echo chamber), but a *different* hazard, and directly measurable from fields the API already gives. `author_diversity = unique_authors / messages` is exactly the bot/pump detector the brief asks Track D to define, **computable from this source for free**.

**The echo chamber is severe and must shape the signal design.** On `$AUPH` the tagged sentiment ran **426 Bullish : 5 Bearish — 98.8% bullish** `[M]`, against 78:31 (71% bullish) on the large-cap sample `[M]`. **Raw bull:bear polarity on a single ticker is nearly information-free.** It becomes a signal only as a **z-score against that ticker's own polarity baseline** — precisely the normalization Track D proposes, now with measured justification.

### ToS posture

`stocktwits.com/robots.txt` disallows a set of site paths (`/stocks`, `/watchers`, `/watchlist`, `/widgets/`, `/advanced/`, various `/symbol/*/…` call pages) and names a long list of AI/scraper user-agents `[M]`. A1–A3 recorded that **it does not cover `api.stocktwits.com`** — "that host 301-redirects and serves no robots.txt of its own" `[M]`.

> **That specific claim is wrong and is corrected here.** `.wip/stocktwits-terms-resolution.md` found that `api.stocktwits.com/robots.txt` **does exist** (reached via the 301 to `api-gw-prd.stocktwits.com`) and **disallows `/*?` for all user-agents** `[V]` — **every paginated `?max=<cursor>` request, the entire backfill mechanism described above, is robots-disallowed.** The same pass found the only unauthenticated rate figure StockTwits ever published: **200 requests/hour per IP** `[A]`. The measured 8.9 req/s is **~160×** that and the 120-page walk at 0.25 s spacing **~72×**; ToS §6 bans circumventing rate limits `[V]`. **The absence of `X-RateLimit-*` headers today is a change in the gateway, not a grant.**

**Honest assessment `[I]`:** using the platform's own documented v2 API endpoints, unauthenticated, at a polite rate, for read-only public data is a materially better posture than scraping HTML pages robots.txt disallows. But **registration being closed means we have no ToS acceptance and no licence grant** — this is *tolerated* access, not *authorized* access, and it could be closed off without notice. **That, plus Track H's contrary reading, is why §6 holds it.**

### A3 verdict

**Rung 0 on the measurements; on hold on the contract.** It is the only source that is simultaneously free, keyless, fast (0.14 s), effectively unthrottled (8.9 req/s), historically walkable (weeks to months), **structurally cashtag-resolved**, and carrying **human-declared sentiment labels on ~46% of messages**. Its weaknesses — echo-chamber polarity skew and author concentration — are both *measurable from the same payload*, turning them from unknown risks into modelled covariates.

**Two live risks, not one.** The technical risk is that tolerated access vanishes without notice — mitigated only by accruing early, which we are forbidden to do. The contractual risk is the gating one, and **the resolution pass in `.wip/stocktwits-terms-resolution.md` closes it against us**: automated recurring collection is a no, public display of derived metrics is "the clearest 'no' in the document", and even private single-user collection is amber — defensible only as occasional, hand-triggered, un-paginated retrieval of a handful of symbols, never as a scheduled 12,000-request backfill. **Consequence for `13-open-questions.md` §7: the walkable-history route into D2's power analysis does not open, so D2's forward-only assumption most likely stands on social data.** That reconciliation belongs to whoever next updates §6/§7 — this file records it rather than performing it.

---

## 6. A4 — Bluesky / AT Protocol

> **Scope ruling (`13-open-questions.md` §11):** access is genuinely excellent and keyless; **the data is genuinely not there.** Build the ~50-line keyless collector — it is free forever and has option value — but **scope it to H6 (market-wide regime) only.** It cannot produce a per-ticker series outside the top ~30 US names at any budget. This is recorded so nobody re-litigates it.

### Access mechanics — four hosts, three different answers `[V]` (all 2026-09-09)

| Host + endpoint | Result |
|---|---|
| `bsky.social/xrpc/app.bsky.feed.searchPosts` | `401 {"error":"AuthMissing"}` — it is a PDS, not an AppView |
| `public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` | **`403`**, an HTML CDN block page, for every query including `q=hello` |
| `public.api.bsky.app/xrpc/…getProfile` · `searchActors` · `getAuthorFeed` · `unspecced.getTrends` · `unspecced.getPopularFeedGenerators` | `200` unauthenticated |
| `api.bsky.app/xrpc/app.bsky.feed.searchPosts` | **`200` unauthenticated** |

The "public" API host is the one that blocks search; the nominally internal one does not. The 403 is a documented regression from mid-2026 `[R]` (bsky-docs issue #332) with the same workaround third parties give `[R]`. **`public.api.bsky.app` + `searchPosts` is dead; use `api.bsky.app`.**

`searchPosts` returns `{posts[], cursor, hitsTotal}`. **`hitsTotal` returned `10000` for every query tried, including obviously-rare ones — a capped Elasticsearch-style ceiling, not a usable volume figure `[V]`. Do not build a metric on it.** Params `q`, `limit` (≤100), `sort=latest|top`, `since`, `until` are all accepted `[V]`. Cursor pagination is reported broken unauthenticated since July 2026 (403 on any cursor) `[R]`; walking `until` backwards from the previous page's oldest `createdAt` works `[V]` and is the pattern any collector should use.

### Rate limits — measured, and worse than they look

**There is no `RateLimit-*` header on `searchPosts` and no `429`.** Exceeding the budget returns an opaque `403` HTML page (`openresty`, "Request forbidden by administrative rules") **indistinguishable from the endpoint being dead** `[V]`. **A naive collector will silently record zeros.** Measured 2026-09-09:

- Cold start: roughly **25–30 requests** got through over ~20 minutes of mixed pacing before the block engaged `[V]`.
- The block is **endpoint-scoped, not IP-wide** — `getProfile` and `getAuthorFeed` kept returning 200 throughout `[V]`.
- First block cleared after ~20–30 min; second cleared in ~182 s.
- **After sustained use the budget collapsed to one request per ~61 s** — a controlled burst test blocked on request #1 and measured a 61 s cooldown `[V]`.

`[I]` This is a reputation-decaying throttle, not a fixed quota. **It rules search out as a collection mechanism.**

**Contrast — the PDS is generous and honest about it.** `com.atproto.repo.listRecords` against an account's own PDS host returned real headers: `ratelimit-policy: 3000;w=300` — **3,000 requests per 300 s** `[V]`. We pulled **2,500 post records in 15.5 s (161 records/s)** with cursor pagination, keyless, consuming 27 of 3,000 `[V]`.

### History depth — genuinely full, the one real win

`searchPosts` returned populated pages for every window probed `[V]`:

| `until` | Posts returned | Oldest in page |
|---|---|---|
| 2023-09-01 | 25 | 2023-08-21 |
| 2024-03-01 | 25 | 2024-02-24 |
| 2024-11-15 | 24 | 2024-11-14 |
| 2025-06-01 | 22 | 2025-05-31 |
| 2026-01-01 | 24 | 2025-12-31 |
| 2026-09-09 | 100 | 2026-09-07 |

**No history cliff** — the index reaches back to the platform's invite-only era, and per-account `listRecords` walks a repo to its first post `[V]`.

The firehose is the opposite: **Jetstream's replay window measured ~37 hours.** Cursors set to 72 h, 168 h and 720 h ago all clamped to the same oldest event (`2026-09-07T12:37:43Z`, probed at `2026-09-09T02:00Z`), while 1 h / 6 h / 24 h cursors resolved exactly `[V]`. Bluesky's own docs say only "a bounded lookback window" with no number `[V]` — **so this is the number.**

### Ticker resolution — broken, twice over

**(a) `searchPosts` strips the `$` sigil** `[V]`, measured 2026-09-09:

- `q=$SPY` → posts about espionage: *"One of hijackers was Israeli spy"*, *"Tinker Tailor Soldier Spy"*
- `q=$OPEN` → **295 hits for a full trading day, 0 of which contained the literal string `$OPEN`**: US Open tennis, "open to everyone", fire-service "open 9s" alerts
- `q=$AMD` → 99 raw hits, 6 containing `$AMD`

There is no cashtag search operator. Every consumer must re-filter client-side, so **the API cost per usable post is 5–50× the naive estimate.** Naive counts inflate by the same factor (`13-open-questions.md` §11).

**(b) There is no cashtag in the data model.** The AT Protocol lexicon `app.bsky.richtext.facet` defines exactly four types — `mention`, `link`, `tag`, `byteSlice` `[V]` (fetched from the raw lexicon JSON). Bluesky shipped cashtags on 2026-01-16 `[R]` and markets them in its own January 2026 blog post `[V]`, but **they are a client-side render, not a stored entity** — confirmed against live post records: `tapeboard.bsky.social` posts reading `"$QBTS breakout, up 7.3%…"` carry only an `app.bsky.richtext.facet#link` facet `[V]`.

`[I]` Extraction is a regex you own — `\$[A-Z]{1,5}\b` plus a universe join. That is fine, it is what we already do, but **Bluesky offers no cleaner ticker resolution than scraping raw text**, and none of the "structured cashtag index" advantage the brief hoped for.

### Finance density — five measurements, one answer

**Measurement 1 — per-ticker, one full trading day** (2026-09-08 04:00 Z → 2026-09-09 04:00 Z, a normal Tuesday, `sort=latest`, walking `until` backwards). "Raw" = what search returned; "strict" = posts whose text literally contains `$TICK` or `#TICK`. All `[V]`.

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
| **BBAI** | 0 | **0** | 0 | — |
| OPEN | 295 | **0** | 0 | — |
| **AEHR** | 1 | **0** | 0 | — |

**Measurement 2 — the whole network, live.** Two Jetstream samples of `app.bsky.feed.post` creates, 2026-09-09 ~01:55–02:10 Z `[V]`:

| | Sample 1 (180 s) | Sample 2 (240 s) |
|---|---|---|
| Events received | 58,788 | — |
| New posts created | **5,961** | **8,553** |
| Posts containing any `$[A-Z]{1,5}` token | **2** | **2** |
| Of those, genuine US-equity | **0** | **1** |
| Firehose bandwidth | **672 MB/hour** | — |

Sample 1's two hits were `"…CORRUPT, LAZY A$$ES…"` (a false positive) and a crypto bot posting `$AAVE`. Sample 2's single genuine equity post was an automated insider-filing bot (`$MRCY — Ratner Steven, EVP, CHRO SOLD: 4,000 shares`). A broad finance-keyword regex fired 19 times in 8,553 posts, almost entirely false positives: *Stockholm*, *Stockton*, *"stocked up on Canadian Club"*, *"shorted by $800K"*, *"stock Dive AUVs"* `[V]`.

**Caveat, stated plainly:** both firehose samples were taken ~22:00 ET, after the close, and understate market-hours volume. But they are corroborated by Measurement 1, which *does* cover a full session and independently lands on the same order of magnitude — **~286 strict cashtag posts across the 15 most-discussed names in a whole trading day.** Extrapolating a long tail, **all US-equity cashtag chatter on all of Bluesky is order 500–1,500 posts/day** `[I]`.

**Measurement 3 — community-size proxies** `[V]`. The most-liked finance feed generator on the entire network: Stock Market (`@bullwinkle`) **113 likes**; Trading (`@insiderfinance.com`) 72; Stocks (`@bluestocks.app`) 56; Trending Finance 49; Quant Finance 25. For scale, returned in the same result set: **MTG Content Creators** (Magic: The Gathering) **158**. Bluesky's flagship stock-market feed has fewer likes than a Magic: The Gathering creator list.

**Measurement 4 — what is actually *in* those feeds** `[V]`:

| Feed | Posts/day | With a cashtag | Unique authors | Top authors |
|---|---|---|---|---|
| Stocks | 210 | **1 of 153** | 58 | reuters.com (25), bloomberg.com (15), cnbc.com (15), wsj.com (10) |
| Trending Finance | 376 | **3 of 277** | 100 | reuters.com (39), bloomberg.com (18), cnbc.com (18), wsj.com (15) |
| Stock Market | 537 | **20 of 294** | 220 | dutchbellbeaker (24), market-ocean-en (7), secwatch (6) |
| Trading | 1,022 | 143 of 299 | 74 | **formdelta (108)**, cryptonforecast (29), crypto.at.thenote.app (20), voiceofchain (14) |

**The two largest "finance" feeds are newswire RSS bridges** — Reuters, Bloomberg, CNBC, WSJ, FT auto-posting headlines. That is not crowd sentiment; **it is the same news wire Track B already covers, arriving second-hand.** The one feed with real cashtag density is 36% one account and the remainder crypto bots.

**Measurement 5 — the trend is down.** Single-page `$TSLA` rate by era `[V]` (counts ÷ page time-span; `[I]` on the extrapolation): 2023-08 ~2.5/day → 2024-02 ~5 → **2024-11-14 ~130** (the post-election exodus peak) → 2026-09-08 **37**. Finance chatter peaked with the November 2024 migration wave and has fallen ~3.5× since. This tracks the platform: mobile MAU 10.4 M in June 2026 (**−27% YoY**), DAU ~3 M in July 2026 (**−25.6% YoY**, **−52% from the Q4-2024 peak**) (Similarweb via TechCrunch, 2026-08-11) `[R]`; Bluesky's CEO has pivoted the company toward the protocol rather than the app `[R]`.

**The comparison that settles it.** StockTwits alone averages **~3,585 TSLA mentions/day** (August 2026) `[R]`. **Bluesky's entire US-equity cashtag output — every ticker, all day — is roughly one third of StockTwits' TSLA-only volume**, and Bluesky's own `$TSLA` count is **~1% of StockTwits'** `[V]/[R]`.

### Bot contamination — high, and structurally so

`[V]` The authors carrying almost all cashtag volume are automated: `insiderfinance.com`, `robot2trade`, `tradingstats.xyz`, `stocknear`, `aistockwire`, `tapeboard`, `stocktitan.net`, `insiderdashboard`, `watch4insider`, `tickerade`, `spymag-bot`, `v1s1on-3ndl3ss`, `formdelta`. Raw `$IONQ` search surfaced 216 hits whose top five authors were `informaq-pt`, `informaq-vi`, `informaq-ru`, `informaq-es`, `informaq-ko` — **one translation farm posting identical content in five languages (author diversity 0.19)** `[V]`.

Two consequences for Track D:

1. **Author diversity is not optional here — it is the whole filter.** On measured data it cleanly separates real chatter (0.7–0.85) from farms (0.19) and single-source floods (0.46 on QQQ).
2. **Most Bluesky "sentiment" is price-derived, not independent of price** — the scanner-reflexivity trap elevated to `13-open-questions.md` §10. `tapeboard.bsky.social` is literally a breakout scanner bot posting *"$SATL breakout, up 13.9% on 4,801,697 volume"* `[V]`. Counting that as attention means counting our own scan output back to ourselves. **For a breakout trader this is the worst possible contamination: the "signal" fires because the stock already broke out.** Any collector needs an author denylist of scanner/wire bots — and even then a majority of remaining volume is news bridges.

### ToS posture

Bluesky's Terms of Service (effective **2025-08-14** `[V]`) contain **no anti-scraping clause, no automated-access clause, and no API terms at all** `[V]` — unusual, and consistent with an openly-federated protocol whose data is public by design. No stated retention limit, no attribution requirement. `[I]` **The most permissive posture of any platform in Track A** — which, for a source this thin, is a fact about the *option*, not the *value*.

### A4 verdict

**Access: solved and free. Density: fatal.** Rung 0, and it **stays** Rung 0 — no amount of money improves Bluesky, because the constraint is population, not access.

- **Do build** the keyless per-author collector on `com.atproto.repo.listRecords`: ~50 lines, documented 3,000/300 s budget, no key, full history, matches the brief's §5 night-zero mandate. Seed it with the ~120–150 accounts measured actually posting equity cashtags, minus the scanner/wire denylist. Cost to run forever: effectively zero.
- **Do not build** on `searchPosts` (opaque reputation-decaying 403) or Jetstream (672 MB/h for ~1 equity post per 4 minutes).
- **Do not expect Bluesky to answer H1–H5.** At 0–15 posts/day for exactly the small/mid-caps a breakout scan surfaces — **literally 0 for `$BBAI` and `$AEHR` on a full session** — a z-score against a 20-day baseline is Poisson noise. The honest statement for D2's power analysis: **Bluesky cannot produce a per-ticker attention series for anything outside the top ~30 US names, at any horizon, at any budget.**
- **The one place it might earn its keep: H6, the market-wide regime filter.** Aggregate bull:bear polarity across all equity chatter uses the whole ~500–1,500 posts/day as a single daily observation. That N is workable — and it is also the hypothesis least likely to matter to a discretionary trader's next trade.

---

## 7. A5 — Discord & Telegram

The brief demands this be argued rather than assumed. Here is the argument.

### Discord — ToS posture

- **Terms of Service, effective 2025-09-29** `[V]`: prohibits *"scraping our services without our written consent, including by using any robot, spider, crawler, scraper, or other automatic device, process, or software."*
- **Developer Policy** `[R]` (direct fetch returns 403 to non-browser clients): *"Do not mine or scrape any data, content, or information available on or through Discord services"*, and message content obtained through the APIs may not be used to train ML/AI models without express permission.
- **Self-bots** — automating a normal user account outside the OAuth2 bot API — are *"and have always been a violation of our API Terms of Use"*, with account termination as the stated consequence, and Discord states it has implemented detection `[R]`.

**Self-bot verdict: never.** Not a risk-tolerance question. It is a stated termination offence, it violates the ToS on its face, and it puts the trader's personal Discord account — where his trading rooms live — at risk. The downside is losing access to rooms he pays for; the upside is a data source we have no evidence is predictive.

### Discord — the legitimate path exists and still fails on merit

An OAuth2 **bot application** invited by someone with Manage Server permission, with the **MESSAGE_CONTENT privileged intent**. As of **2026-06-10** Discord moved the review threshold from "100 servers" to **"10,000 unique reachable users"**, and apps below it can self-enable the intent without review `[R]` — a bot in one or two private rooms is comfortably below it. So the mechanics exist. The blockers:

1. **It needs an account and a server owner's consent.** Creating the developer application is forbidden tonight (brief §2). Getting a paid trading room's admin to install a data-collection bot is a social negotiation, not an engineering task, and most operators will refuse — their edge *is* the chatter.
2. **The Developer Policy's mining/scraping prohibition is in tension with the use case even with the intent granted** `[I]`. "The bot is in the server legitimately" answers the API-access question, not the "do not mine data" question. Redistributing derived sentiment from a private paid room on a public site is a Track H problem with no clean answer.
3. **The statistics are hopeless** `[I]`. A trading room has one to a few hundred active voices — single-digit N per ticker per day. Z-score vs a 20/60-day baseline, author diversity, percentile rank within the liquid universe: this source cannot supply the denominator.
4. **The conflict of interest is total, and points the wrong way** `[I]`. In a trading room the loudest voice is the person already in the position; callouts are published *after* entry by someone who benefits from you buying. For H2 (crowded/late) and H3 (fresh discovery) this is not merely noisy — **it is systematically biased in the direction that hurts a breakout trader most: maximum room enthusiasm coincides with the worst entry.**

**Keyless surfaces, measured 2026-09-09** `[V]`: `/api/v10/channels/{id}/messages` → `401`; `/api/guilds/{id}/widget.json` → `403` (widget off by default); **`/api/v10/invites/{code}?with_counts=true` → `200`, no auth** — guild name, description, icon, approximate member/presence counts. That invite endpoint is the only keyless Discord data in existence and carries no message content. `[I]` It could in principle be sampled daily as a *room-popularity* proxy ("is retail piling into trading Discords this month?"), an H6-flavoured regime input — but it is not per-ticker, not sentiment, and not worth a collector.

### Telegram — more permissive, and it does not help

**ToS** `[V]` (`core.telegram.org/api/terms`, no effective date shown): third-party clients are broadly permitted and monetisation is allowed, but the terms explicitly prohibit using Telegram data *"to train, fine-tune or otherwise engage in the development … of artificial intelligence, machine learning models."* `[I]` Simple counting and keyword aggregation is arguably outside that; anything model-based is squarely inside it — which closes the door on the more interesting version of the idea.

**Access paths:** the **Bot API** cannot read a channel it does not administer and cannot backfill history — useless `[R]`. **MTProto** (`messages.getHistory`) reads full history of any public channel or any channel a logged-in user belongs to `[R]`, but requires a **user account and phone number** — out of scope, and it is exactly the logged-in-user-automation posture that gets Discord users banned. **`https://t.me/s/<channel>` is genuinely keyless** and we tested it `[V]`: HTTP 200, 20 messages per page, `?before=<message_id>` paginates backwards (page 2 returned 19 messages, ids 507–526), no account, no key, no rate limit observed at low volume.

**So the access works. The content does not exist.** Six candidate finance channels, 2026-09-09 `[V]`:

| Channel | HTTP | Msgs on page | `$TICKER` tokens |
|---|---|---|---|
| `traderoom` | 200 | 20 | **0** — Persian-language Ripple/XRP whale content |
| `MarketTwits` | 200 | 20 | **0** — Russian macro/oil/reserves + broker ads |
| `stocktwits` | **302** | — | channel not publicly previewable |
| `wallstreetbets_official` | **302** | — | channel not publicly previewable |
| `StocksAndTrading` | 200 | 0 | empty |
| `stock_market_news` | 200 | 1 | "Channel created" |

`[I]` The structural reason: **US day-trading rooms on Telegram are private groups, not public channels.** `t.me/s/` cannot see private groups at all; MTProto can only read them with a member account. **The keyless path and the content are disjoint sets.** What *is* publicly previewable is Russian- and Persian-language crypto and macro relay channels, heavily ad-laden and irrelevant to a US-equity intraday breakout trader.

### A5 verdict

Both fail for the same underlying reason stated two ways: **the chatter worth having is inside private, paid, membership-gated rooms, and the chatter publicly reachable is not about US equities.** Discord adds termination risk on top. **Neither belongs on the budget ladder at any rung; neither belongs on the Track K signup checklist.**

`[I]` One thing worth carrying forward: if the trader is *already* a member of a room he values, the highest-value use is not automated collection — it is a manual `Catalyst` / `Origin` tag on the journal row, which **the sheet already supports (`Origin = Callout`)**. Same information, zero engineering cost, zero ToS exposure, already built.

---

## 8. A6 — Video

Timeboxed per the brief. Short, because the answer is short.

### YouTube Data API v3

**Cost: $0, key required, no card** `[R]`. Free tier, no billing meter.

**Quota, from Google's own `determine_quota_cost` page, fetched 2026-09-09** `[V]`: the default allocation is **100 `search.list` calls/day**, 100 `videos.insert`/day, and **10,000 units/day combined for all other endpoints**, with `search.list`, `videos.list`, `commentThreads.list`, `comments.list`, `channels.list` each costing 1 unit; `search.list` sits in its own capped bucket. Third-party sources still describe the older model where `search.list` cost 100 of 10,000 units `[R]`. **Both models give the same practical ceiling: 100 searches per day.**

`[I]` That buys 100 ticker-queries, or ~14 tickers at one query per session-window per day. TapeReader's liquid universe is ~4,174 names (`docs/market-scans/phase-1-spec.md`) — **this does not cover 0.5% of it**, and there is no grouped/bulk endpoint, no YouTube equivalent of Polygon's grouped-daily call.

**The structural killer — retention.** The YouTube API Services Developer Policies require stored API data be **deleted or refreshed after 30 calendar days** `[V]`. Approved clients may retain *statistical* metrics (views, likes, subscriber and comment counts) for up to 36 months, but **video titles, descriptions and comment text remain under the 30-day rule** `[V]`.

`[I]` This is disqualifying on its own terms, and the reason is worth being precise about: the brief's §1.3 accrual question asks what must start collecting tonight so that in three months there is a dataset. **YouTube text data cannot legally be three months old. A source that must forget faster than the study needs to remember is not a source** (`13-open-questions.md` §12).

**Signal quality `[I]`:** titles do carry tickers ("$NVDA to $250?!") and are trivially regex-extractable. But videos publish *after* the move; title/thumbnail selection is optimised for click-through, biasing toward extremes and away from the base rate; there is no timestamp precision useful intraday; and `search.list` result counts are unreliable for volume estimation. For **H5 (overnight 16:00→09:15 ET attention delta)** — the hypothesis that feeds the Morning Plan — YouTube's publish cadence is simply the wrong resolution.

**Verdict: ❌ No. Rung: would be $0, but excluded on retention grounds, not cost.**

### TikTok

**Research API** is free (1,000 requests/day, up to 100,000 records/day) but eligibility is restricted to verified academic institutions and registered non-profits in the US/EEA/UK/Switzerland, with a research proposal and evidence of ethical review; **commercial users are explicitly ineligible**, and using Research API credentials commercially risks losing access entirely `[R]` (as of 2026).

**Verdict: ❌ Dead end.** TapeReader is a commercial-adjacent public site; it does not qualify, and **no amount of budget changes that — this is an eligibility gate, not a price.**

### Twitch

**Not researched, deliberately, so the gap is visible rather than silent.** `[I]` Twitch finance streams are live-chat: no durable text record, no ticker structure, and a chat culture dominated by emotes. The brief ranked video low; Twitch is the lowest part of it.

### A6 verdict

**Nothing here goes on the ladder at any rung.** YouTube is free and technically accessible but cannot retain the history the study exists to build; TikTok is eligibility-gated to academics; Twitch has no usable artefact.

---

## 9. A7 — Derived-sentiment aggregators

**Two aggregators work right now with no key, no signup, no headers, and no throttling we could provoke: ApeWisdom and Tradestie.** They are the whole of Rung 0 in this track. Everything else in the brief's named list is key-gated, dead, frozen, or priced above the cap.

**But the two free ones are not interchangeable, and neither is what it advertises:**

- **ApeWisdom gives breadth and freshness but no history.** ~787 tickers/day, updating inside 5 minutes, rolling-24h mention counts — and **zero retrievable past**. Its value is entirely prospective: every night not collected is permanently lost.
- **Tradestie gives history but its sentiment field is fake.** Per-date data back to ~2021-03-20 — genuinely useful — but across **480 distinct tickers over 37 non-empty dates spanning 5.4 years there is _zero_ within-ticker variation** in `sentiment_score`. Only `no_of_comments` and rank carry date-varying information.

### 9.1 ApeWisdom — **ADOPTED, and already collecting**

**Base:** `https://apewisdom.io/api/v1.0/filter/{filter}[/page/{n}]` · **Methodology:** `https://apewisdom.io/methodology/` · **Operator:** same team as `companiesmarketcap.com` `[V]`

**Access:** no API key, no header, no cookie, no referer check — plain `curl` returns 200 `[V]`. Served through Cloudflare, `cf-cache-status: DYNAMIC`, HTTP/2 `[V]`.

**Rate limits — measured, not documented:** no documented limit anywhere on the API page; **no `x-ratelimit-*`, `retry-after`, or any throttling header in the response** `[V]`. Measured: **30 sequential requests → 30× HTTP 200**, then **60 requests at concurrency 20 → 60× HTTP 200**, immediately followed by another 200 `[V]`. **We could not provoke a limit.** Latency 0.20–0.44 s, median ~0.21 s `[V]`. `[I]` Effectively unmetered at any cadence we would use — **but still self-limit**: an undocumented limit is a limit that can appear without warning, and 8 pages × 4 snapshots/day is 32 requests/day, which is nothing.

**History depth — the decisive fact: there is none, at all** `[V]`.

- No date parameter is honoured: `?date=2026-09-01` returns the identical current payload.
- No history path exists: `/api/v1.0/history/GME` and `/api/v1.0/ticker/GME` both return `[]`; `/filter/all-stocks/history` silently returns the current snapshot.
- **Unknown filter names return `{"count":0,...}`, not 404** — path-guessing gives false negatives. `filter/nonsense-filter` → `count: 0`. **Any collector must validate filter names against the published list, not against HTTP status**, or a typo becomes a silent year-long gap.
- The public per-ticker page embeds a Chart.js series, but it is **9 points at 10-minute steps = an 80-minute window**, and `?range=30d` / `/30d/` return byte-identical charts. Deeper charts are behind the sign-in wall.
- The only backward-looking data in the API is the single lag pair `mentions_24h_ago` / `rank_24h_ago`.

`[I]` **This is why the collector had to start tonight.** ApeWisdom is a pure flow — nothing in Rungs 1–4 buys back its past.

**Coverage breadth** — full `all-stocks` pull (8 pages, 787 rows) on 2026-09-08 `[V]`:

| Threshold | Tickers |
|---|---|
| total rows returned | 787 |
| mentions ≥ 10 | 48 |
| mentions ≥ 5 | 94 |
| mentions ≥ 2 | 183 |
| mentions == 1 | 604 |
| `mentions_24h_ago` null | 252 |

Site header claims a tracked universe of 12K stocks / 551 cryptos / 12.5K all / 344 4chan `[V]`.

`[I]` **The honest read for a breakout trader: the daily signal universe is ~50–100 names.** 77% of returned rows are a single mention, indistinguishable from noise, and a small-cap breakout candidate not already a WSB name will show 0 or 1. **This does not kill the source; it reframes it.** ApeWisdom cannot be an alerting layer over the whole liquid universe (~4,174 names/day). It can be (a) a *context* column on the ~50 names in play, and (b) the raw material for **H3 (fresh discovery: 0→N activation)** — which is precisely a question about the *bottom* of this distribution, where a jump from 0 to 6 mentions is a real event.

**Update cadence & window semantics — measured.** Methodology page says it *"scans the most popular stock and cryptocurrency sub reddits twice an hour"* `[V]`. Sampling `all-stocks` every 5 minutes over a 15-minute window `[V]`:

- **27 of the top 100 tickers changed within a single 5-minute interval** — freshness well under the documented 30 minutes.
- Values move in **both directions**: `AGI: 139 → 138 → 137`, `QQQ: 64 → 64 → 63`, `MU: 186 → 187 → 187`. Cumulative: 6 increases, 7 decreases; end-to-end over 15 minutes, 11 of the top 100 rose and 8 fell.
- Control: **Tradestie's 50 rows changed 0 times over the same window** `[V]` — the movement is ApeWisdom's, not a sampling artefact.

`[V]→[I]` **`mentions` is a rolling trailing-24h count, not a cumulative day count** — this is not stated anywhere in their docs and it matters enormously for signal design:

1. A snapshot at time *T* measures attention over *[T−24h, T]*. **A 09:15 ET snapshot is a genuine pre-market attention state** — exactly what H5 and the Morning Plan panel need. A feature, not a defect.
2. Two snapshots 24 h apart are near-independent windows; two 4 h apart overlap ~83% and **must not be differenced naively** to get "mentions in the last 4 hours".
3. `mentions_24h_ago` is a lagged rolling window, so **`mentions / mentions_24h_ago` is a clean, self-normalizing velocity ratio with no baseline needed** — a free head start on Track D's metric family.
4. **Snapshot timestamps must be recorded to the second.** A rolling window is meaningless without knowing where it ends.

**Underlying source — disclosed: Reddit + 4chan /biz** `[V]`. The API page lists the filter values, which are the sources: `all` · `all-stocks` · `all-crypto` · `4chan` · `CryptoCurrency` · `CryptoCurrencies` · `Bitcoin` · `SatoshiStreetBets` · `CryptoMoonShots` · `CryptoMarkets` · `stocks` · `wallstreetbets` · `options` · `WallStreetbetsELITE` · `Wallstreetbetsnew` · `SPACs` · `investing` · `Daytrading`. All verified live; `superstonk` (not on the list) correctly returns `count: 0`. Note `pennystocks` and `stockmarket` also return data (267/115 rows) **despite not appearing on the published list — the list is incomplete** `[V]`.

**Methodology — disclosed and auditable**, its real advantage over every scored competitor `[V]`:

- Ticker detected by **bare uppercase token** (`AMD`) **or** `$`-prefix (`$aapl`, `$AAPL`).
- *"If a ticker is present two or more times in a submission or a comment this will still be counted as a single mention"* — **mentions are deduplicated per post/comment**, so `mentions` ≈ number of *distinct posts/comments* referencing the ticker, not raw token frequency. Already partially bot-resistant.
- Common-word tickers (`CFO`, `YOLO` named explicitly) counted **only** with the `$` prefix.
- Only tickers listed on Infinite Marketcap are displayed.

**Not disclosed:** how `upvotes` is aggregated; whether posts and comments are weighted differently; the full blacklist.

**Verdict on auditability: raw material, not a black box.** `mentions` and `upvotes` are counts with a stated construction rule, so we can compute our own z-scores, percentiles, velocity and attention-per-dollar-volume on top. **That is worth strictly more than any competitor's undecomposable 0–100 score, because a black-box score cannot be renormalized, cannot be audited for regime drift, and silently embeds the vendor's own unstated, unstable model.**

**Ticker-collision contamination — real, measurable, and in today's top 10.** The blacklist is clearly narrow. On 2026-09-08 `all-stocks`: **`AGI` (Alamos Gold, a gold miner) ranked #3 with 140 mentions, and 371 mentions 24 h ago** `[V]` — `[I]` overwhelmingly likely "AGI" = artificial general intelligence; a mid-cap gold miner does not out-mention NVDA on WSB. The blacklist *does* work where applied: `AI` (C3.ai) sat at **rank 587 with 1 mention** `[V]`. Cross-vendor confirmation of the same failure class: SwaggyStocks' #1 was **`OIL` with 354 mentions** `[V]`; Tradestie's top ticker was **`AI` on 27 of 37 sampled dates** `[V]`.

`[I]` **Action for Track D:** persist raw rows unaltered and apply a **project-side deny-list at analysis time** (`AGI`, `AI`, `OIL`, `TA`, `IT`, `ON`, `ALL`, `CEO`, `EV`, `DD`, `PM`, `OR`, `SO`, `GO`, `NOW`, `RE`, `AM`, `PT`, `USA`, and `SPY`/`QQQ` as market-proxies rather than single names). **Filtering at ingest destroys evidence irreversibly; filtering at analysis is reversible.**

**Terms / redistribution (feeds Track H):** **no terms-of-service page exists** — `/terms/` and `/about/` both 404; only `/privacy/` exists `[V]`. The API page states no licence, no attribution requirement, no commercial-use restriction and no rate limit `[V]`. `[I]` **Absence of a licence is not a grant of one.** Safe for private research and internal journal enrichment; **do not put ApeWisdom-derived numbers on the public tapereader.us surface** until Track H resolves it — likely by asking directly (`hello@8marketcap.com`, published on their API page `[V]`).

**Collector gotchas** `[V]`: docs show `"mentions":"2"`/`"upvotes":"2"` as **strings** while the live API returns **numbers** — coerce defensively. Company names are **HTML-entity-encoded** in JSON (`"SPDR S&amp;P 500 ETF Trust"`) — decode at render, store raw. Pagination is 100/page; `page/99` returns `results: []` with correct `count`/`pages`, not a 404. **`mentions_24h_ago` is `null` for 252/787 rows (new entrants) — NULL, not 0. Preserve the distinction; it *is* the H3 fresh-discovery signal.**

### 9.2 Tradestie — **ADOPTED, counts only**

**Working base:** `https://tradestie.com/api/v1/apps/reddit[?date=MM-DD-YYYY]`
**Documented base:** `https://api.tradestie.com/v1/apps/reddit` — **BROKEN.**

> **⚠️ The documented endpoint has an expired TLS certificate** `[V]`, measured 2026-09-08 via `openssl s_client`:
> ```
> api.tradestie.com  →  CN=tradestie.com, Let's Encrypt R13
>                       notAfter = Jan  3 23:17:12 2026 GMT      ← expired 8 months ago
> tradestie.com      →  CN=tradestie.com, Google Trust Services WE1
>                       notAfter = Nov 15 09:22:08 2026 GMT      ← valid
> ```
> Every `curl` to `api.tradestie.com` fails with `SSL certificate problem: certificate has expired`. **A collector written from their documentation will not work.** Use the `tradestie.com/api/...` host. `[I]` Also a small negative signal on maintenance.

**Access:** docs state *"No API key or token is required — this API is free and open."* `[V]`. **User-Agent gate:** requests with UA `Python-urllib/3.13` return **403**; curl's default UA, a browser UA, and a custom `tapereader-collector/1.0` all return **200** `[V]`. **The collector must set an explicit non-default User-Agent — a naive `urllib`/`requests`-default script will silently 403 every night.**

**Rate limits:** documented **20 requests/minute per IP** `[V]`; measured **40 rapid sequential requests → 40× HTTP 200**, no throttling observed `[V]`. Enforcement appears absent, but **honour the documented 20/min** — it is the one published number, and a backfill is exactly the workload that would trip it. Latency 0.12–0.22 s `[V]`.

**History depth — real, deep, and full of holes.** `?date=MM-DD-YYYY` in that exact format (`YYYY-MM-DD` returns a 400 with a helpful message) `[V]`. **Floor: between `03-15-2021` (empty) and `03-20-2021` (50 rows)** `[V]`. Coverage map, 15th of each month, 2021-04 → 2026-08 `[V]`:

| Period | Rows/day | Status |
|---|---|---|
| 2021-04 → 2023-09 | 50 | **usable** |
| **2023-10 → 2024-03** | **0** | **6-month hole** |
| 2024-04 → 2024-09 | 50 | usable |
| **2024-10 → 2025-07** | **0–2** | **10-month hole** |
| 2025-08 → 2026-09 | 50 | **usable** |

A contiguous 30-day scan of 2026-08-10 → 2026-09-08 returned **50 rows on all 30 days, weekends included** `[V]` — the recent regime is complete and daily.

`[I]` Usable continuous history is roughly **~30 months in three disjoint blocks** — enough to characterise the *shape* of WSB attention distributions and sanity-check a normalization scheme, but **not enough for a clean walk-forward backtest**, and **the two holes land in exactly the period most of the journal's own trades would sit in.** Treat Tradestie history as a **descriptive prior, not an evaluation set.**

**Coverage breadth: top 50 tickers only** `[V]` — no pagination, no `limit` (`&limit=100` is ignored) `[V]`. Strictly narrower than ApeWisdom's 787; **its only unique contribution is the archive** `[I]`.

**The sentiment field is a static per-ticker constant — measured, and it contradicts their docs.** Their docs claim *"Every 15 minutes, algorithm takes in to account all the comments till that point of time and re-calculates the sentiment"* and *"The sentiment reflects the daily sentiment"* `[V]`.

Test: 42 dates sampled at 47-day intervals from 2021-05-01 to 2026-09-08 (37 non-empty), yielding 480 distinct tickers, 87 appearing on ≥5 different dates. Result `[V]`:

```
distinct tickers:                                   480
tickers with >1 distinct sentiment_score:             0
tickers seen on >=5 dates:                           87
   ...of those, varying:                              0
```

Concretely: `TSLA` = `0.381` on all **30** dates it appears (2021 through 2026). `AI` = `0.117` on all 27. `NVDA` = `0.106` on all 27. `AAPL` = `-0.091` on all 27. `SPY` = `-0.152`. A second independent check: four live snapshots 5 minutes apart across a 15-minute window showed **0 changes in any of the 50 rows, including `no_of_comments`** — so the "every 15 minutes" cadence is also not observable `[V]` (ApeWisdom moved 19 of its top 100 over the identical window, so this is not a sampling artefact).

**Conclusions:**

1. `sentiment_score` and `sentiment` (`Bullish`/`Bearish`) are **fixed per-ticker attributes applied identically to every historical date.** They carry **zero within-ticker time-series information.** Any backtest regressing returns on Tradestie's sentiment **is regressing on a ticker fixed-effect wearing a sentiment costume — it will look like it works and mean nothing.**
2. **This is a look-ahead-bias landmine of exactly the kind the brief names.** A single score stamped onto 2021 data was not computable in 2021. Using it is time-travel.
3. The only genuinely date-varying fields are **`no_of_comments`** and the implied **rank** (array order).

`[I]` **Persist `no_of_comments` and rank. Store `sentiment`/`sentiment_score` only in a quarantined column literally named to warn — e.g. `tradestie_static_ticker_score__NOT_A_TIMESERIES` — or drop them.** D2's pre-registration should name this as a specific excluded variable so nobody rediscovers it in March and gets excited.

**Source & methodology:** **r/wallstreetbets only** — *"Get top 50 stocks discussed on Reddit subreddit - Wallstreetbets"* `[V]`. `no_of_comments` = comment count referencing the ticker; deduplication rules, ticker-detection rules and the scoring model are **all undisclosed** `[V]`. Same collision problem: `AI` topped 27 of 37 sampled dates, `TA` was top-50 on 23 `[V]`. `[I]` Effectively a daily source — a single fixed-time daily snapshot loses ~nothing.

**Terms:** site has ToS and Privacy links; the API doc page imposes no licence or attribution requirement `[V]`. **Same Track H caveat as ApeWisdom: fine for private use, unresolved for public redistribution.**

### 9.3 The rest of the aggregator field

- **SwaggyStocks** — **no public API.** `api.swaggystocks.com` resolves and runs an Express server but every route tried returns `Cannot GET /...` (`/`, `/api`, `/health`, `/sentiment`, `/wsb`, `/wsb/sentiment`, `/api/wsb/sentiment`, `/ticker-sentiment`, `/v1/wsb/sentiment`) `[V]`. The page is server-rendered with **no client-side XHR at all** — verified by driving a real browser and reading the network log: zero API requests after page load `[V]`. **Top 15 tickers free, everything else behind a login wall** `[V]`. Per-ticker fields: `Mentions`, a bullish % with a Bullish/Neutral/Bearish label, rank + prior rank, `Call-to-Put OI`, `30D IV`; windows 12H / 1D / 1W `[V]`. Methodology **undisclosed** `[V]`. **Skip** — account (forbidden tonight) or HTML scraping of a site with a `/tos` page, to get a narrower, less transparent version of what ApeWisdom gives keyless. Its one differentiated field is the options overlay, derivable from Track C sources without touching their ToS.
- **Quiver Quantitative — dead for this track.** `api.quiverquant.com/beta/live/wallstreetbets` → **401** `[V]`. Pricing `[V]`: Hobbyist **$30/mo** ($25/mo annual) — Congress Trading, Politician Net Worth, Corporate Donors, Gov Contracts, Lobbying, Off-Exchange Trading, Trump Trades, 10 of 18 MCP tools; Trader **$75/mo** ($62.50 annual) — adds Insider Trading, Hedge Fund Activity, ETF Holdings, Top Shareholders, Patents, Exec Comp, App Ratings, Newsfeed; Commercial by quote. **No free API tier; website Premium ≠ API access** `[V]`. **WallStreetBets is not listed in any tier's dataset list** `[V]`, and **the public WSB dataset is frozen — every ISO date on `quiverquant.com/wallstreetbets/` runs to 2025-02-21 and stops** `[V]`, independently reported stale since the same date `[R]`. `[I]` Even at 3× the cap you would be buying Congressional trading data, not sentiment. (It may matter to a different track as a *catalyst* source; not this track's call.)
- **StockGeist — great schema, terrible economics.** `openapi.json` is public and unauthenticated `[V]`; all data is key-gated (`hist/message-metrics` → `401 {"detail":"Invalid API token"}`) `[V]`. Dashboard pricing, with the page carrying the banner *"StockGeist.ai dashboard is under maintenance"* `[V]`: Free $0 = past 24 h, 5-minute resolution, top 5 + 3 watchlist; Starter **$50** = 7 days, 1-hour, top 10 + 10; Pro **$100** = **30 days, 1-day resolution, 20 tickers**. `[I]` Read that again — **$100/month buys 30 days of daily-resolution data on 20 tickers**, close to the worst value in the track. **But the methodology is the best-disclosed anywhere here and worth recording as the shape of what good looks like** `[V]`: sources selectable and named (`stocktwits`, `reddit`, `twitter`); timeframes `1m`/`5m`/`1h`/`1d`; and **12 raw count metrics rather than a composite** — `pos_em_count`, `pos_nem_count`, `neu_em_count`, `neu_nem_count`, `neg_em_count`, `neg_nem_count`, `em_total_count`, `nem_total_count`, `pos_total_count`, `neu_total_count`, `neg_total_count`, `total_count` — i.e. **polarity × emotionality, cross-tabbed, as counts.** `[I]` **This is the schema our own derived store should aim at, whether or not we ever pay them.** That decomposition, not the price, is the thing worth stealing.
- **Finnhub social sentiment — has moved off the free tier.** The brief asked specifically. **It is not free** `[V]`. Finnhub's own embedded API spec (extracted from `finnhub.io/docs/api/social-sentiment`, 2026-09-08) gates it per endpoint: `/stock/social-sentiment` → `"freeTier": null, "premium": "Premium required."`. For contrast on the same day `[V]`: `/news-sentiment` → "Premium Access Required"; `/stock/insider-sentiment` → free; `/company-news` → free with "1 year of historical news". Keyless returns `401 {"error":"Please use an API key."}` `[V]`. **Every 2026 listicle claiming Finnhub social sentiment is free is stale** `[R]` — a clean example of the search-surface hazard the brief warns about. **Do not put it on the Track K list as a free win.** What it *would* give `[V]`: Reddit + Twitter (the only methodology statement — the scoring model is a black box); `symbol`/`from`/`to`, so **real per-symbol history**; **hourly resolution** decomposed into countable parts:
  ```json
  {"data":[{"atTime":"2021-05-08 14:00:00","mention":32,
            "positiveScore":0.9213675,"negativeScore":-0.9864475,
            "positiveMention":20,"negativeMention":12,
            "score":-0.0341123222115352}], "symbol":"AAPL"}
  ```
  `[I]` `mention`/`positiveMention`/`negativeMention` are **raw counts we could renormalize ourselves**, materially more auditable than a bare composite even though `score` is opaque. **Hourly + per-symbol history is the single best fit in this track for H5, because it can be *replayed* rather than only accrued.** Price is not published as a line item; third-party reports put Finnhub premium bands at **$11.99–$99.99/mo** with alt-data as add-ons `[R]` — unverified and too wide to plan against. **Track K action: get a price from Finnhub, in writing.**
- **EODHD `/api/sentiments`** — tested using **EODHD's own publicly documented `demo` token** (their published sample credential; no account, nothing entered). `GET /api/sentiments?s=AAPL.US&from=2015-01-01&to=2026-09-08&api_token=demo` → 200, **2,199 rows, 2016-02-19 → 2026-09-08**, e.g. `{"date":"2026-09-08","count":30,"normalized":0.508}` `[V]`. Fields: `date`, `count` (articles analysed that day), `normalized` (−1..+1). Measured distribution over 2,199 AAPL rows: min **−0.993**, max **1.0**, mean **0.583**, median **0.618**, **only 60 negative values (2.7%)** `[V]` — `[I]` heavily positively skewed, so cross-sectional comparison needs de-meaning and a raw "normalized < 0" threshold fires ~3% of the time. **History deep in span but badly holed: 30 gaps longer than 4 days, including a 594-day gap from 2016-02-19 to 2017-10-05, then 53/62/44/67/123-day gaps through 2018** `[V]`; pre-2019 is unusable, recent years dense. Demo ticker-gating: `AAPL.US`/`TSLA.US`/`AMZN.US` work, `NVDA.US`/`GME.US`/`SOUN.US` return `Forbidden` `[V]`. **Batching works** — `s=AAPL.US,TSLA.US,AMZN.US` returns all three in one response `[V]`, the single most important economic fact here, because the free tier is 20 calls/day. `/api/tweets-sentiments` returned **`[]`** for both AAPL and TSLA on demo `[V]` — demo-gated or dead, unverifiable without a key. **Source: `/api/sentiments` is news-article sentiment, not social** — `count` is explicitly "number of articles analysed" `[V]`, and the scoring model is undisclosed. `[I]` **This is Track B data, not A7 data. Do not count EODHD as a social source on the strength of the endpoint that works.** Cost `[V]`: Free $0 / 20 calls per day; EOD All-World $19.99/mo; EOD+Intraday $29.99/mo; Fundamentals $59.99/mo; ALL-IN-ONE $99.99/mo (all paid tiers 100,000 calls/day). Their docs note the free plan *"can't access certain data types."*

---

## 10. Dead ends — one line each, so nobody re-researches them

| Source | Status as of 2026-09-08/09 | Evidence |
|---|---|---|
| **X free tier** | **Gone.** Discontinued for new developers 2026-02-06; pay-per-use is the default; no free allowance on the pricing page | `[R]` + `[V]` |
| **X legacy Basic / Pro** | Closed to new signups; Basic migrated from 2026-06-01, Pro deprecated 2026-08-14 | `[R]` |
| **Nitter (all instances)** | **Dead.** X Corp C&D letters 24 Aug 2026; nitter.net serves a legal notice, others serve bot challenges | `[M][V]` |
| **X syndication CDN** | **Dead.** `timeline/profile` returns 0 bytes; `tweet-result` returns 404 | `[M]` |
| **Vendor claim: "X full-archive requires Enterprise $42k/mo"** | **False.** X's own docs list full-archive as available to pay-per-use | `[V]` overrides `[R]` |
| **Apify free tier** (`apidojo/tweet-scraper`) | 5 runs/month × 10 items = 50 tweets/month. Useless for collection | `[V]` |
| **Reddit `.json` / RSS / old.reddit / oauth host, keyless** | **All HTTP 403 "Blocked"** to datacenter IPs, browser UA and bot UA alike. GitHub Actions is blocked too | `[M]` |
| **Reddit self-service app registration** | Closed late 2025 under the "Responsible Builder Policy"; manual approval required | `[R]` — unverified |
| **Reddit official docs** (`support.reddithelp.com`, `redditinc.com`, `web.archive.org`) | Not fetchable from this environment (403 / denied) — **all Reddit terms here are `[R]`** | `[M]` |
| **Pushshift** | Shut down after 2023 restriction to verified moderators | `[R]` |
| **Third-party claim: "Arctic Shift lags 4–6 weeks"** | **False for the API** — measured ~4 minutes. True only of the bulk dumps | `[M]` |
| **Arctic Shift aggregate + keyword over peak-volume history** | 422 timeout on r/wallstreetbets Jan 2021 even at a 2-day window. **Not a history gap** — raw fetch, time_series, small subs and calmer periods all work | `[M]` |
| **Arctic Shift `body=` unscoped / `body=` on `/posts/search`** | Rejected — requires `subreddit`/`author`/`link_id`/`parent_id`; posts use `title`/`selftext` | `[M]` |
| **StockTwits developer registration** | **Closed** to new applications, no reopening date | `[V]` |
| **StockTwits `/api/2/symbols/{SYM}.json`** | 404 — not a real route | `[M]` |
| **StockTwits historical sentiment time-series endpoint** | **Does not exist.** 404 `"Stat not found"` for every stat name tried except `ts` | `[M]` |
| **StockTwits `limit=` parameter** | Ignored — page size hard-fixed at 30 | `[M]` |
| **`public.api.bsky.app` + `searchPosts`** | **HTTP 403 for all queries since mid-2026.** Use `api.bsky.app` | `[V]` |
| **`bsky.social` + `searchPosts`** | 401 `AuthMissing` — it is a PDS, not an AppView | `[V]` |
| **Bluesky `hitsTotal`** | Capped at 10,000 for every query; **not a volume metric** | `[V]` |
| **Bluesky cashtag search** | **No `$` operator; the sigil is stripped.** `$SPY` returns espionage posts | `[V]` |
| **AT Protocol cashtag facet** | **Does not exist** — lexicon has only `mention`/`link`/`tag`. Cashtags are client-side rendering | `[V]` |
| **Bluesky unauthenticated search cursor pagination** | 403 on any cursor since July 2026; walk `until` backwards instead | `[R]`/`[V]` |
| **Jetstream deep replay** | Clamps to ~37 h; not a backfill mechanism | `[V]` |
| **Discord `/api/guilds/{id}/widget.json`** | 403 unless a server explicitly enables the widget | `[V]` |
| **Discord message read without a token** | 401, always | `[V]` |
| **Discord self-bots** | Stated termination offence. Never | `[R]` |
| **`t.me/s/stocktwits`, `t.me/s/wallstreetbets_official`** | 302 — not publicly previewable | `[V]` |
| **Six probed Telegram finance channels** | **Zero US-equity content.** RU/FA crypto + macro relays | `[V]` |
| **YouTube text data retention** | 30-day delete-or-refresh; cannot accrue history | `[V]` |
| **TikTok Research API** | Commercial applicants explicitly ineligible; academic/non-profit only | `[R]` |
| **Twitch** | Not researched, deliberately — live chat, no durable artefact | `[I]` |
| **`api.tradestie.com`** | **TLS certificate expired 2026-01-03.** The documented host does not work; use `tradestie.com/api/...` | `[V]` |
| **Tradestie `sentiment` / `sentiment_score`** | **Static per-ticker constants.** 480 tickers, 37 dates, 5.4 years, **zero within-ticker variation** | `[V]` |
| **ApeWisdom history** | **None exists.** No date param, no history path, 80-minute embedded chart, sign-in wall beyond | `[V]` |
| **Quiver Quantitative WSB** | Frozen at **2025-02-21**; not in any API tier; no free API | `[V]` |
| **Finnhub social sentiment "free tier"** | **Stale listicle claim.** Finnhub's own spec: `"premium": "Premium required."` | `[V]` overrides `[R]` |
| **Sentiment Investor** | `sentimentinvestor.com` **NXDOMAIN.** Company gone | `[V]` |
| **Utradea** | `cloud.utradea.com` **timed out at 25 s**; `api.utradea.com` 404s at root. Docs live, service not | `[V]`/`[R]` |
| **Tickeron** | `api.tickeron.com` NXDOMAIN; `tickeron.com` 403s bots. Not a sentiment-data vendor | `[V]` |
| **socialsentiment.io** | Domain lapsed; now 301s to an unrelated Vietnamese streaming site | `[V]` |
| **Stocksera** | `stocksera.pythonanywhere.com` serves an expired-account placeholder; `stocksera.io` NXDOMAIN | `[V]` |
| **Adanos** | Free tier is **250 requests per _month_**; $29 (90 d) / $299 (365 d). **Also authors the "best sentiment API 2026" listicles that rank Adanos first** — treat every comparative claim as advertising | `[V]` price, `[I]` marketing |
| **LunarCrush** | `401 Not authorized` keyless; crypto-primary | `[V]` |
| **SentiSense** | `api.sentisense.ai` does not resolve; surfaces mainly inside 2026 listicles | `[V]` |
| **FMP social sentiment** | All three paths → `401 Invalid API KEY`; docs under a **"Legacy"** heading; data reportedly sourced from **SentimentInvestor**, whose domain no longer resolves. **Track K: mandatory first test — fetch the newest timestamp and confirm it is today's, not 2023's** | `[V]`/`[R]` |
| **CNN Fear & Greed** | Returns **418 "I'm a teapot. You're a bot."** to plain curl. Macro, not per-ticker — Track C anyway | `[V]` |
| **alternative.me Fear & Greed** | Keyless and works, but **crypto only.** Irrelevant to US-equity breakouts | `[V]` |

---

## 11. Budget ladder placement for Track A

| Rung | Monthly | What Track A delivers |
|---|---|---|
| **0** | **$0** | **ApeWisdom** (787 tickers, <5-min freshness, rolling-24h counts, disclosed methodology, zero history) **+ Tradestie** (top 50, ~30 months of holed history, counts only) **+ Reddit via Arctic Shift** (full history, ~4-min currency, daily per-ticker aggregates + the normalization denominator) **+ a thin Bluesky per-author collector scoped to H6.** **StockTwits would belong here and is held out on `13-open-questions.md` §6.** This is ~90% of the achievable value in the track. |
| **1** | **≤$10** | **Adds essentially nothing.** X at $10 = ~95 posts/day (worthless). Apify at $10 = ~1,200 tweets/day but needs an account + card. No aggregator sells anything between $0 and $25. **Firm recommendation: do not spend the cap here** — spend it on Track B/C sources. This is a negative finding, not a gap in the research. |
| **2** | **$25–50** | Apify/reseller X collection at ~5–20k tweets/day — the first point X becomes a second opinion rather than an anecdote. Quiver $30 has no WSB; StockGeist $50 gives 7 days on 10 tickers; Adanos $29 gives 90 days; EODHD $19.99–29.99 is news. `[I]` **The first thing worth breaking the cap for is not a product — it is a price quote from Finnhub.** If social sentiment lands near the bottom of its reported $11.99–$99.99 band `[R]`, hourly replayable per-symbol history is the highest-value purchase in the track, because it is **the only thing that buys back time we have not collected.** |
| **3** | **$100–200** | Official X pay-per-use at ~2,000 posts/day (~$210/mo) — ToS-clean, full-archive-capable, cashtag-native. **The one thing here that changes category:** it makes X history *replayable*, enabling true backtests rather than forward accrual. StockGeist Pro ($100) does not — 30 days, daily, 20 tickers. |
| **4** | **$500+** | Reddit commercial (~$0.24/1k, bundles reported ~$12k/mo), X Enterprise (~$42k/mo), and institutional text analytics (LSEG/MarketPsych, RavenPack/BigData.com, Social Market Analytics) — multi-year point-in-time-stamped archives with survivorship controls, the one genuinely unavailable thing below. Named only to mark the ceiling. |

**The ladder's shape is itself the finding: Track A is nearly flat from $0 to $100.** The $0 rung is not a compromise — it is the best available option, and what money buys is *replayable history*, which no vendor under ~$100 sells anyway. **Collect now; the accrual is the asset.**

---

## 12. What this track contributes to the collector

### Adopted tonight (keyless, no account, running)

**ApeWisdom — primary.**

```
GET https://apewisdom.io/api/v1.0/filter/all-stocks/page/{1..N}
    N from page 1's "pages" field (8 on 2026-09-08)
    User-Agent: tapereader-collector/1.0 (+https://tapereader.us)
    No auth, no required headers, ~0.21 s/request.
```

Plus, for source decomposition and H6: `wallstreetbets`, `stocks`, `Daytrading`, `options`, `pennystocks`. `[I]` `Daytrading`, `options` and `pennystocks` are the three most likely to carry breakout-relevant rather than meme chatter — separate them from day one so Track D can test whether the sub-source matters. `pennystocks` is undocumented but live.

**Persist every field verbatim, plus our own envelope:** `ticker` (join key) · `mentions` (**the primary series — rolling trailing 24 h**) · `upvotes` (aggregation rule undisclosed, keep raw) · `rank` · `mentions_24h_ago` (**keep `null` as `null`, never coerce to 0 — null = new entrant = the H3 signal**) · `rank_24h_ago` (`0` appears to be an "unranked" sentinel) · `name` (HTML-entity-encoded; store raw) · `filter` (ours) · **`captured_at` (ISO-8601 UTC, second precision — non-negotiable; a rolling window is meaningless without its endpoint)** · `page`/`count`/`pages` (completeness audit).

**Cadence:** four snapshots per US trading day at **16:05 ET (prior close), 09:15 ET (pre-market cut — the Morning Plan input), 12:30 ET (midday), 20:00 ET (evening)**. Because `mentions` is a rolling 24 h window these are overlapping-but-informative reads of *attention state at setup time*, and the 09:15 ET cut is what H5 and the Morning Plan panel actually consume. **Weekends included** — WSB is busiest Sunday nights and Tradestie shows real weekend volume `[V]`.

**Tradestie — secondary, counts only, plus a one-shot backfill.**

```
GET https://tradestie.com/api/v1/apps/reddit                    # today
GET https://tradestie.com/api/v1/apps/reddit?date=MM-DD-YYYY    # historical
    User-Agent: tapereader-collector/1.0     ← REQUIRED (urllib default UA → 403)
    Do NOT use api.tradestie.com — TLS cert expired 2026-01-03
    Honour 20 req/min (documented); no enforcement observed
```

Persist `ticker`, `no_of_comments`, array index as `rank`, plus `as_of_date`, `captured_at`, `source='tradestie_wsb'`. **Quarantine or drop `sentiment`/`sentiment_score`.** **One-shot backfill:** walk `MM-DD-YYYY` from **2021-03-20** to today at ≤20 req/min ≈ 2,000 days ≈ **100 minutes**; expect empties in 2023-10→2024-03 and 2024-10→2025-07 and record them in the ingest log as *fetched-and-empty*, distinct from *not-fetched*, so a re-run does not churn. ~100k rows ≈ 5 MB gzipped. **It is the only retrievable past in this track and it costs 100 minutes.**

### First capture — measured, with a storage correction `[V]`

The collector ran for real at **2026-09-08 21:00 ET**. Accrual has started; it is no longer a plan.

| Measurement | Value |
|---|---|
| ApeWisdom rows per snapshot | **2,078** across 6 filters — all-stocks 797, wallstreetbets 594, stocks 267, Daytrading 168, options 102, pennystocks 150 |
| Snapshot size | **494 KB raw / 46 KB gzipped** |
| Idempotency | **Verified** — immediate re-run in the same slot wrote 0, skipped 2,078 |
| First stored snapshot | `data/social/apewisdom/2026/2026-09-08.ndjson`, slot `evening` |

> **Two numbers to reconcile, surfaced rather than smoothed over.**
> **(1) Storage.** A7 estimated **11.2 MB/year gzipped** at 4 snapshots/day (58.3 MB raw), and a single full snapshot at 40.0 KB / 7.6 KB gzipped `[V]`. **Measured across all six filters it is 66 MB/year gzipped (704 MB raw)** — six times higher, because the estimate covered a single filter rather than the full set. 66 MB/year in a git repo is acceptable but not free, and it compounds. Options for the build plan to decide rather than assume: keep only `all-stocks` + `wallstreetbets` (~1,391 of 2,078 rows, since the other four overlap heavily); store only rows changed since the previous slot (attractive — but `mentions` is a rolling trailing-24h figure, so "unchanged" is not rare and the diff logic must not be mistaken for a cumulative counter); or accept it, on the grounds that history cannot be repurchased at any price.
> **(2) Row counts.** A7's same-day pull recorded all-stocks **787** rows and wallstreetbets 591 / stocks 267 / Daytrading 168 / options 98 / pennystocks 146; the 21:00 ET capture recorded **797** / 594 / 267 / 168 / 102 / 150. `[I]` Consistent with a live rolling window measured hours apart, not a discrepancy — but it is the reason `count`/`pages` are persisted as a completeness audit.

**Do not silently pre-filter to `mentions >= 2`.** The 604 single-mention rows are the fresh-discovery population **H3 is entirely about**, and the ~2.6 MB/year saved is not worth the lost evidence.

### Held out of the collector, deliberately

- **StockTwits** — the best source measured, **excluded under `13-open-questions.md` §6, and the later resolution pass (`.wip/stocktwits-terms-resolution.md`) hardens that to a no**: automated recurring collection is banned on every reading, and `api.stocktwits.com/robots.txt` disallows `/*?` — the paginated backfill mechanism itself. **Do not schedule it.** The most defensible residue is occasional, hand-triggered, un-paginated retrieval of a handful of symbols for the private journal, and even that is amber.
- **Reddit direct** — 403 to datacenter IPs; **Arctic Shift is the only route**, and it must store *aggregated per-ticker counts*, not raw text (WSB raw ≈ 4 MB/day ≈ 1.5 GB/yr).
- **Bluesky** — build the `listRecords` per-author collector, but scope it to **H6 only** and seed it with a curated author list minus a scanner/wire-bot denylist. **Never implement a `searchPosts` path** — its opaque 403 will silently write zeros.
- **X, Discord, Telegram, YouTube, TikTok, Twitch** — nothing goes in, at any rung.

### Engineering gotchas this track discovered

- **Set an explicit User-Agent.** A default-UA Python collector 403s on Tradestie silently and forever.
- **Never point at `api.tradestie.com`** even though it is the documented host.
- **ApeWisdom returns `count: 0` for unknown filters instead of 404** — validate the filter list at startup and alarm on an unexpected zero, or a typo becomes a silent year-long gap.
- **Type coercion:** ApeWisdom docs show `mentions`/`upvotes` as strings, the live API returns numbers.
- **Empty ≠ failed.** Distinguish HTTP-200-with-`[]` (a real historical hole) from a network error in `ingest_log`, per the market-scans discipline.
- **Store raw responses; filter at analysis time.** The `AGI`/`AI`/`OIL`/`TA` collision deny-list belongs in the analysis layer — **filtering at ingest destroys evidence irreversibly.**
- **Bluesky's throttle returns an opaque 403, not a 429.** Any collector that does not treat 403 as "throttled, back off" will record zeros as data.

### Handoffs

- **→ Track D (signal design).** `author_diversity = unique_authors / messages` is the bot/pump detector, and it works on measured data — 0.164 on `$AUPH`, 0.19 on a Bluesky translation farm, 0.46 on a single-source QQQ flood, 0.7–0.85 on genuine chatter. **But it is not computable from any A7 aggregator** — no aggregator exposes per-post text, author identity, or unique-author counts. It requires raw platform access, and the best raw source is contractually held. **State that bound plainly in `04-signal-design.md`, because it decides which hypotheses are testable on adopted sources alone.** Also: the 98.8%-bullish `$AUPH` result is hard evidence that **raw polarity must be z-scored against a per-ticker baseline, never used as a level**; `mentions / mentions_24h_ago` is a free self-normalizing velocity ratio; and Arctic Shift's `/api/time_series` supplies the share-of-attention denominator.
- **→ Track D (traps).** Four measured traps: **(1)** Arctic Shift `score`/`num_comments` read 0–1 for ~36 h after posting, so a live collector and a backfill of the same day **disagree** — exclude score-derived features or window them past 36 h. **(2)** 39 of 51 common English words are real tickers. **(3)** **Scanner reflexivity** — other people's breakout scanners posting price moves as "sentiment" will manufacture a spurious H1; specify the denylist and the author-diversity guard. **(4)** Tradestie's `sentiment_score` is a per-ticker constant stamped onto every historical date — using it is silent look-ahead bias.
- **→ Track D2 (pre-registration / power analysis).** **If §6 clears, StockTwits history is walkable weeks-to-months back**, thin names deeper than megacaps, so existing journal trades could be scored retroactively and the discovery/replication split becomes possible on social as well as news. **D2 needs a revision pass once §6 is settled** (§7). Meanwhile: name Tradestie `sentiment_score` and Reddit `score` as explicitly excluded variables.
- **→ Track E (journal integration).** StockTwits resolves `date|symbol` natively — the same join key screenshots already use. ApeWisdom's 09:15 ET rolling-24h snapshot is the natural pre-market attention state to attach to a Morning Plan row.
- **→ Track F (product surface).** **Nothing from this track may appear on the public site yet.** ApeWisdom has *no ToS page at all*; Arctic Shift states *no licence at all*; StockTwits is §6. Absence of a licence is not a grant of one.
- **→ Track H (legal).** Four unresolved items: StockTwits tolerated-not-authorized (§6, the gating one); Arctic Shift's total absence of a licence; Reddit's commercial-use classification of a public product site, **unverifiable because Reddit's own pages are unreachable from this environment** (§2); and ApeWisdom/Tradestie redistribution — for ApeWisdom, asking is cheap and definitive (`hello@8marketcap.com`, published on their API page).
- **→ Track I (build).** Reddit must go through Arctic Shift (GitHub Actions is datacenter IP space). Store aggregated counts, not raw text. Honour Bluesky's `ratelimit-policy: 3000;w=300` on `listRecords` and never build a `searchPosts` path.
- **→ Track K (signup checklist).** **This track contributes almost nothing to the morning checklist — which is itself the useful summary of it.** Nothing in A1–A3 or A4–A6 requires a signup to start. The only candidates: **X via Apify** (optional, deferred, needs a card), **a Finnhub price quote in writing** (the highest-value unknown in the track, and the only thing that can buy back uncollected history), **two EODHD measurements** (how many comma-separated tickers one `/api/sentiments` call accepts, and whether `sentiments` is one of the free plan's excluded data types), **one FMP call** to check whether its newest timestamp is today's or 2023's, and **SwaggyStocks** at low priority. **Do not list YouTube** — it is excluded on retention grounds, not cost.
- **→ An open validation task.** Is ApeWisdom's `AGI` Alamos Gold or artificial general intelligence? Cross-check `AGI` mentions against AGI's actual dollar volume on the same dates — a clean, cheap measurement of how much collision contamination sits in the top 10, and a template for auditing the rest.
