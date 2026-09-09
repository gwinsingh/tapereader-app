# 09 — Legal, ToS & Redistribution

**Track H · As of 2026-09-08 · Public documentation and terms pages only · No accounts created, no credentials entered, no money spent.**

> **Not legal advice.** This is an engineering-grade read of public terms pages by a non-lawyer.
> Items flagged **⚖️ LEGAL REVIEW** below are ones where a real lawyer should look before anything ships.

**Evidence tags used throughout:**
`[V]` verified on the source's own terms/policy page during this run ·
`[R]` reported by third parties (secondary sources) ·
`[I]` my inference from the verified text.

---

## 0. The question this track actually answers

TapeReader is a **public, free website**. That single fact splits every data source into
three separate legal questions, and they have different answers for the same source:

| | Question | What governs it |
|---|---|---|
| **A** | May I *collect* it at all? | Access terms / scraping clauses / API terms |
| **B** | May I *keep* it? | Retention & deletion obligations |
| **C** | May I *show a number derived from it* on a free public page? | Redistribution + commercial-use clauses |

A source can pass A and B and fail C. **Most of them do.** The private trade journal
(already built, single user, nothing published) sits in a completely different and far
safer legal position than a public breadth page — and this document exists to stop those
two use cases from being conflated in the build plan.

### The single most important finding

**"Just show aggregates" is a real mitigation, but it is NOT a universal safe harbour, and
several sources close that door explicitly.**

It genuinely helps with two things:

1. **Copyright.** A mention count is a *fact*, and facts are not copyrightable in the US
   (*Feist v. Rural Telephone*, 499 U.S. 340). Publishing "TSLA was mentioned 412 times"
   reproduces no protected expression. `[I]`
2. **Retention obligations.** Deletion duties attach to *stored platform content*. If your
   database holds only `(date, ticker, count, z-score)` and no post text, no post ID and no
   user ID, then when a user deletes their post there is nothing in your store that is
   theirs to delete. `[I]` — this is the design pattern that makes retention compliance
   tractable, and it is worth building around regardless of source.

It does **not** help with the third thing, which is the one that kills sources:

3. **Contract.** Terms of service bind by contract, not by copyright. Several providers
   define their protected asset to *expressly include* derived analytics — Polygon's
   "Derived Works" is literally "data, charts, analytics, research, or other works based
   on, referring to, or derived from the Market Data" `[V]`, and Finnhub bans sharing
   "data **or derived results** from the data" `[V]`. Aggregation does not launder a
   licence. Where the contract says "derived", derived is covered.

So the safe design pattern is narrower than "aggregate only". It is:

> **Aggregate-only metrics, computed from sources whose terms permit public display of
> derived output, stored with no platform content retained.**

The set of sources that satisfies all three clauses is small. Section 12 names it.

---

## 1. Summary table

**Legend for "Public redistribution of derived metrics OK?"** — this means: showing a
number *computed from* the source (mention count, z-score, aggregate sentiment) on a
free, publicly-accessible page on tapereader.us. It does **not** mean showing raw posts.

| Source | Private collection OK? | Public redistribution of derived metrics OK? | Retention constraint | Verdict |
|---|---|---|---|---|
| **X / Twitter API** | Yes, on a paid tier | **Doubtful** — display-to-users is permitted, but "derivative analysis" is licensed narrowly and a public site exceeds self-serve tier scope | Delete/modify to match X within 24h of request; keep offline copies in sync with X | ⛔ **BLOCKED** (tier scope + cost + ambiguity) |
| **X / non-API scraping** | No | No | n/a | ⛔ **BLOCKED** |
| **Reddit Data API** | Yes (free tier, non-commercial) | **No** without written commercial approval | Delete when user deletes; ~48h recommended purge; anonymised retention still a violation | ⛔ **PRIVATE-USE-ONLY** |
| **Reddit — Pushshift / academic dumps** | Grey; no clear licence | **No** | Same deletion expectation flows through | ⛔ **PRIVATE-USE-ONLY**, and thin ice |
| **StockTwits** | API closed to new registrations; scraping expressly banned | No | n/a | ⛔ **BLOCKED** (no lawful access route) |
| **Bluesky / AT Protocol** | **Yes** — public firehose, no key, terms silent on scraping | **Probably yes** for aggregates | Honour deletions (protocol emits delete events); no fixed window in ToS | ✅ **SHIP** (best social source by a distance) |
| **Discord** | Only via a bot in servers that added it; scraping & self-bots banned | **No** — "will not share API Data with any third party" | Delete promptly when no longer necessary / on user request | ⛔ **PRIVATE-USE-ONLY at best** |
| **Telegram** | Yes, via official API | Unclear — terms silent | No stated deletion obligation | ⚠️ **UNCLEAR** — silence is not permission |
| **YouTube Data API** | Yes | **No** — derived metrics expressly prohibited; aggregates are owner-only | Hard 30-day cap on most API data | ⛔ **BLOCKED** |
| **ApeWisdom** | Yes (open endpoint) | **Unknown** — no published terms at all | None stated | ⚠️ **UNCLEAR** — and inherits Reddit's problem upstream |
| **Tradestie** | Yes (open, no key, 20 req/min) | **Unknown** — no API terms published | None stated | ⚠️ **UNCLEAR** — same upstream problem |
| **Quiver Quantitative** | Yes, on a personal plan | **No** — "may not redistribute, republish, resell... to any third party" | Display-only; no general storage right | ⛔ **PRIVATE-USE-ONLY** |
| **Finnhub** | Yes (personal plan, non-business) | **No** — bans sharing data *or derived results* | Delete all data when subscription ends | ⛔ **PRIVATE-USE-ONLY** |
| **Alpha Vantage (news & sentiment)** | Yes | **No** — publishing to others is *by definition* commercial use under their ToS | Not specified | ⛔ **PRIVATE-USE-ONLY** without a paid commercial licence |
| **Polygon (news + market data)** | Personal/non-business only | **No** — "Derived Works" expressly cannot be displayed to third parties | Delete all Market Data on termination | ⛔ **NEEDS LICENCE** — ⚖️ **and this already affects the live site, see §9.2** |
| **GDELT** | Yes | **Yes** — explicitly unrestricted, commercial included | None | ✅ **SHIP** (attribution + link required) |
| **Marketaux** | Presumed yes | Not verified (terms page blocked this run) | Unknown | ⚠️ **UNVERIFIED** |
| **FINRA short interest** | Yes, but automated retrieval is banned by their ToU | **No** — non-commercial personal/professional use only; redistribution needs written consent | Must not build a database from it | ⛔ **BLOCKED** as published by FINRA directly |
| **Wikipedia pageviews** | Yes | **Yes** — CC0, public domain, no attribution required | None | ✅ **SHIP** (cleanest source in the entire study) |

---

## 2. X / Twitter

**Sources:** `docs.x.com/developer-terms/policy`, `docs.x.com/developer-terms/agreement`,
`docs.x.com/developer-terms/more-on-restricted-use-cases` (all fetched 2026-09-08).
Note: `developer.x.com` and `x.com/en/tos` were unreachable from this environment
(HTTP 402); the `docs.x.com` mirror is X's own current documentation host.

### 2.1 Scraping posture

The developer terms do not contain a standalone anti-scraping clause; they require you to
"use the APIs as intended and documented" `[V]`. The prohibition on non-API collection
lives in the consumer ToS, which I could not fetch this run — historically it has required
X's prior written consent for crawling. `[R]`

**Practical enforcement reality:** X has been the most aggressive litigant in this space
(*X Corp. v. Bright Data*, and the 2023 rate-limit lockdown), and unauthenticated scraping
is now technically obstructed as well as contractually barred. `[R]` This is not a source
where enforcement is theoretical.

### 2.2 Commercial use

Developer Agreement §III(B) defines Commercial Use as use "as part of a product or service
that is monetized (e.g., website advertising, licensing fees, in-app promotions, and
sponsorships)". `[V]` TapeReader is free and unmonetised, so on that definition alone it
is *not* commercial use. `[I]`

But §III(L)–(M) is the clause that actually bites: self-serve plans (Pay-Per-Use, Basic,
Pro) are "designed for hobbyists, commercial prototyping, initial development, early-stage
X product integrations, and supporting applications with a **limited number of end-users**",
and anything beyond that "must apply (or already subscribe to) an Enterprise plan". `[V]`
**A public website is not an application with a limited number of end users.** `[I]`
So the correct tier for a public TapeReader feature is Enterprise, which is a
negotiated-contract, four-to-five-figure-monthly product. `[R]`

### 2.3 Redistribution — the decisive analysis

Two clauses pull in opposite directions and the tension is real:

- §II(A) **permits** you to "copy a reasonable amount of and display the X Content on and
  through your Services to Users" `[V]` — so showing things to *your* users is squarely
  contemplated.
- §III(A)(d) **prohibits** "sell, rent, lease, sublicense, distribute, redistribute,
  syndicate, create derivative works of, assign, or otherwise transfer or provide access
  to, in whole or in part, the Licensed Material **to any third party** except as expressly
  permitted". `[V]`

My reading: "to any third party" governs the whole verb list, so a derived metric computed
for your own service is not automatically caught. `[I]` The redistribution rules that *are*
unambiguous target bulk data transfer — you may only pass Post IDs / DM IDs / User IDs
onward, max 1.5M Post IDs to any entity per 30 days, max 50,000 hydrated objects per
recipient per day, and up to 500 Post/User objects per user per day via non-automated
means. `[V]`

**The aggregate-metrics clause needs care.** The developer policy prohibits using the API
to "calculate aggregate X metrics". Read alone that sounds fatal. The restricted-use-cases
page scopes it: it targets **platform-wide** metrics — "aggregate X user metrics, such as
the total number of active users or accounts" and "aggregate X Post metrics, such as the
total number of Posts per day, or the number of user engagements". `[V]` A count of posts
mentioning `$TSLA` is not a platform health metric, so on the narrow reading it is fine;
that page also refers to "aggregate analysis of X content that does not store any personal
data" as a contemplated activity. `[V]`

**Verdict:** the aggregate-metric objection is probably surmountable. The *tier* objection
is not, and the cost follows from it. ⛔ **BLOCKED** — not because aggregates are forbidden,
but because lawful public-facing access requires an Enterprise agreement.
⚖️ **LEGAL REVIEW** if anyone ever wants to revisit this.

### 2.4 Retention — the strictest of any source here

You must keep offline copies "up to date with the current state of that content on X":
delete or modify content when it is deleted or modified on X, "as soon as reasonably
possible, or within twenty four (24) hours after a written request to do so by X or by an
X user". `[V]` This extends to content made private, withheld, or from suspended accounts.
On termination you must permanently delete all Licensed Material and supply evidence of
deletion within ten business days. `[V]`

**Consequence: a permanent historical archive of X posts is not permissible.** `[I]`
A permanent archive of *counts* with no post content retained is a different object and
plausibly survives — but you cannot rebuild or re-verify it, and you cannot retrospectively
un-count a deleted post.

### 2.5 Attribution

The Display Requirements apply to displaying Posts. If no Post content is displayed, they
arguably do not attach `[I]`, but crediting X as the source is prudent and free.

---

## 3. Reddit

**Sources:** `redditinc.com/policies/data-api-terms`, `support.reddithelp.com` and
`reddit.com` were **all blocked from this environment** (domain-level block, not a site
error). Wayback was also blocked. Everything below is therefore `[R]` from secondary
sources unless noted, and **Reddit is the one source in this document whose primary terms
I could not read.** Treat the detail as directionally right and the specifics as unverified.
⚖️ **LEGAL REVIEW** — someone should read the actual Data API Terms (last revised
2026-07-20 `[R]`) before any Reddit-derived feature is designed, let alone shipped.

### 3.1 Scraping posture

Scraping outside the API is not an accepted fallback; access requires OAuth and, since the
Responsible Builder Policy update (2026-06-05 `[R]`), an approval request per developer. `[R]`
Reddit has litigated against scrapers and has been actively enforcing its licensing regime. `[R]`

### 3.2 Commercial use

"You must not sell, license, share, or otherwise commercialize Reddit data without express
written approval." `[R]` The free tier is capped at 100 queries/minute per OAuth client ID
and is characterised as non-commercial; commercial tiers are reported to start around
$12,000/month. `[R]`

Here the "free website" framing does **not** save us the way it might for X. Reddit's
restriction is on *sharing* and *commercialising* the data, and publishing derived metrics
on a public site is sharing — regardless of whether money changes hands. `[I]`

### 3.3 Redistribution

Reported to require attribution and a link back to Reddit for permitted display, with
commercial redistribution at scale prohibited. `[R]` Aggregate statistics and derived works
are reported to require commercial approval. `[R]`

### 3.4 Retention — also strict

Reddit "strongly recommends" routinely deleting stored user data and content within 48
hours, and — the notable part — **"retention of content and data that has been deleted,
even if disassociated, de-identified or anonymized, is a violation"**. `[R]` There is also a
prohibition on deriving or inferring sensitive characteristics about users, and on
re-identifying or matching Reddit data with off-platform identifiers. `[R]`

That anonymised-retention clause is unusually broad. Read literally it would reach a stored
mention count derived from a since-deleted post. Read purposively it targets user-level
records. This is exactly the kind of ambiguity that needs a lawyer, not an engineer. `[I]`

### 3.5 The academic dumps (Pushshift / Academic Torrents)

The Reddit dumps on Academic Torrents (2005-06 → 2024-12) carry **no explicit licence** —
the licence fields are empty, with one listing noting an intended scientific/non-commercial
use. `[R]` Pushshift's own API access was curtailed after the 2023 API changes and is now
moderator-restricted. `[R]`

**No licence is not the same as permissive.** The dumps are third-party redistributions of
content Reddit claims rights over and whose authors never licensed it for republication.
Using them for private backtesting is a defensible research posture; publishing metrics
derived from them on a commercial-facing public site is not. ⛔ **PRIVATE-USE-ONLY**, and
even that is thin ice. `[I]`

---

## 4. StockTwits

**Source:** `stocktwits.com/terms`, `api.stocktwits.com/developers` (both fetched 2026-09-08).

- **Scraping: expressly prohibited.** You "may not scrape, harvest, mirror, frame,
  deep-link to, data-mine, or otherwise extract data" except "as expressly authorized by us
  in writing or through an approved API, widget, developer offering". `[V]` General search
  engines are carved out; you are not a search engine.
- **API: closed.** The developer page states StockTwits is "currently reviewing all of our
  APIs, documentation and terms" and "won't be accepting new registrations until we have
  finished our review". `[V]`
- **Commercial framing:** StockTwits explicitly monetises this exact data itself, retaining
  rights to use public content in "products and services" licensed to third parties
  including "financial institutions and investment firms". `[V]` You would be building a
  free competitor to their paid product out of their data.
- Attribution: none specified. `[V]`

**Verdict: ⛔ BLOCKED.** There is no lawful access route open to us today — the API is shut
to new registrations and the only alternative is a method the terms name and ban. This is
the cleanest "no" in the document: it fails at question A, so B and C never arise.

---

## 5. Bluesky / AT Protocol

**Source:** `bsky.social/about/support/tos` and the IP policy (fetched 2026-09-08),
plus secondary sources on firehose practice.

This is the outlier, and the good news of this track.

- **Scraping posture: the ToS is silent** on automated access, crawling and scraping. `[V]`
  That is not an oversight — the AT Protocol publishes user data as signed public records
  replicated across the network and streamed over a public firehose. Reading it is the
  *designed* behaviour, with no API key, no OAuth and no enterprise tier. `[R]`
- **Commercial use: the ToS is silent** — no non-commercial restriction on users. `[V]`
- **Redistribution: the ToS does not address third-party redistribution.** `[V]` Users
  retain ownership of their content (§3.5) `[V]`, so ordinary copyright applies to reposting
  their *words* — but not to counts derived from them. `[I]`
- **Retention:** on account deletion Bluesky uses "reasonable efforts to remove your
  Content", while acknowledging "complete deletion across the network may not always be
  possible" given the protocol's decentralised nature. `[V]` No deletion obligation is
  imposed on third-party consumers by the ToS `[V]`, though the firehose emits delete
  events and research archives conventionally honour them. `[R]`
- **Attribution:** none specified. `[V]`

**Verdict: ✅ SHIP.** Public collection is the intended use, aggregate metrics carry no
identified contractual bar, and there is no fixed retention cap — so a permanent historical
archive of derived metrics is permissible here in a way it is not for X or Reddit.

**Two caveats.** (1) Silence is not a licence in perpetuity; Bluesky's terms could tighten,
so the ingest should be written to be switchable. `[I]` (2) The firehose carries personal
data and is not anonymised `[R]` — store aggregates, not posts, and the privacy surface
mostly disappears. Note the reason to prefer Bluesky is *legal*, not signal quality;
whether it carries usable finance chatter is Track-level evidence that belongs elsewhere.

---

## 6. Discord & Telegram

### 6.1 Discord

**Source:** Discord Developer Terms of Service, official `discord/discord-api-docs` repo
copy (fetched 2026-09-08); the live support-dev page returned 403.

- **Scraping and self-bots: prohibited.** Developers may not access the APIs in ways that
  "compromise, break, or circumvent any of our technical processes" `[V]`; mining/scraping
  Discord content is prohibited and self-bots (automating a user account token) violate the
  API terms and risk account bans. `[R]`
- **Redistribution: flatly no.** §5(b): developers "will not share API Data with any third
  party" except with service providers, where legally required, or where users expressly
  direct it. `[V]` §2(b) prohibits creating derivative works of, redistributing or
  syndicating access to the APIs. `[V]` **Publishing derived metrics from Discord content
  on a public site is not permitted.** `[I]`
- **Retention:** delete API Data promptly when no longer necessary for the app's stated
  functionality, on Discord's request, on user request, or when the app stops operating
  (§5(b)); retain "not longer than necessary for a legitimate business purpose" (§11).
  Users must be given an accessible route to request modification and deletion. `[V]`
- **Access reality:** even lawfully, a bot only sees servers that invited it. There is no
  legitimate route to broad market-chatter coverage.

**Verdict: ⛔ PRIVATE-USE-ONLY at best**, and realistically not worth building.

### 6.2 Telegram

**Source:** `core.telegram.org/api/terms` (fetched 2026-09-08).

The terms are thin. They prohibit using or aggregating Telegram platform data "to train,
fine-tune or otherwise engage in the development" of AI `[V]`, require apps to guard user
privacy, permit monetisation "through advertising or other legitimate means" `[V]`, and are
**silent on storing or redistributing message content** and silent on deletion
obligations. `[V]`

**Verdict: ⚠️ UNCLEAR.** Silence is not permission, and the AI-development prohibition is
broad enough that an NLP sentiment pipeline over Telegram messages could plausibly be read
into it depending on how the model is built. ⚖️ **LEGAL REVIEW** if this source is ever
seriously pursued. Given coverage is limited to channels you can join, the cost/benefit
does not justify the review.

---

## 7. YouTube

**Source:** `developers.google.com/youtube/terms/developer-policies` and
`.../api-services-terms-of-service` (fetched 2026-09-08).

YouTube is a clean, well-documented **no**, and unusually it says so directly:

- **Derived metrics prohibited.** §III.E.2 / §III.L: API clients "must not (i) replace API
  Data with similar, independently calculated data, or (ii) access or use API Data to
  create new or derived metrics". `[V]` Independently-calculated metrics may be shown
  alongside YouTube data only if clearly disclosed as non-YouTube. `[V]`
- **Aggregation restricted to content owners.** Aggregation is permitted only across
  channels under the same content owner, and aggregate data is viewable only by the
  authorising content owner — **not publicly**. `[V]` You also may not aggregate data to
  gain insight into YouTube's business or usage. `[V]`
- **Retention: hard 30-day cap.** Non-authorised data, and authorised data other than
  Analytics/Reporting/statistics, must be deleted or refreshed within 30 calendar days;
  user deletion requests must be honoured within 7 days. `[V]`
  **This alone forecloses a permanent historical archive.** `[I]`
- **Attribution:** any page displaying YouTube content must make clear YouTube is the
  source via YouTube Brand Features (§III.F.2). `[V]`
- **Commercial:** may not sell, redistribute or sublicense any portion of the API Services;
  may not sell ads on pages containing YouTube data unless independent non-YouTube content
  carries standalone value (§III.G). `[V]`

**Verdict: ⛔ BLOCKED.** It fails the derived-metrics test explicitly and the retention test
independently. Two separate kill shots.

---

## 8. Derived-sentiment aggregators

These are attractive because they look like they have already solved the upstream problem.
Mostly they have not — they have just moved it.

### 8.1 ApeWisdom

Open endpoint, no key required, documenting mention/upvote counts across r/wallstreetbets,
r/stocks, r/investing and 4chan /biz. `[V]` **No terms of use, no licence, no attribution
requirement and no commercial-use or redistribution statement appear anywhere on the site
or API docs.** `[V]`

**⚠️ UNCLEAR.** No terms means no permission and no prohibition — you are relying on
acquiescence, with no contractual basis to point to if challenged, and no notice if they
change their mind. It also **inherits Reddit's problem**: ApeWisdom is redistributing
Reddit-derived data, and it is not evident they hold a Reddit commercial licence to do so.
Building a public feature on an unlicensed re-publisher inherits their exposure. `[I]`

### 8.2 Tradestie

Free and open, no key, 20 requests/minute per IP, refreshing every 15 minutes over
r/wallstreetbets. `[V]` A Terms of Service and a Financial Disclaimer are linked from the
site but **the API page states no licence, no attribution requirement and no
commercial-use or redistribution terms**. `[V]`

**⚠️ UNCLEAR**, same analysis and same upstream Reddit inheritance as ApeWisdom.

### 8.3 Quiver Quantitative

**Source:** `quiverquant.com/termsofservice` (fetched 2026-09-08).

"You may not redistribute, republish, resell, sublicense, broadcast, or otherwise make
Quiver Data available to any third party" absent an enterprise agreement with
redistribution rights or written email permission. `[V]` Commercial purposes — expressly
including incorporating the data into products or services for third parties — are
forbidden on personal subscriptions; personal securities trading is carved out as
non-commercial. `[V]` No general storage right beyond what is needed to display it. `[V]`

**Verdict: ⛔ PRIVATE-USE-ONLY.** Explicitly fine for the trade journal; explicitly not fine
for a public page.

### 8.4 Finnhub

**Source:** `finnhub.io/terms-of-service` (fetched 2026-09-08).

The sharpest clause of any aggregator: "You hereby agree to not redistribute or share
access to data **or derived results from the data** obtained from Finnhub with anyone or
any 3rd party without written approval." `[V]` The personal plan "can't be used by any
business even internally without a written approval", and you are ineligible for it if you
are a securities professional or using the data for business purposes. `[V]` All data must
be deleted when the subscription to it ends. `[V]`

**Verdict: ⛔ PRIVATE-USE-ONLY.** "Or derived results" is the exact phrase that defeats the
aggregate-only design pattern. No ambiguity to argue with.

---

## 9. News APIs

### 9.1 Alpha Vantage — including the news & sentiment endpoint

**Source:** Alpha Vantage Terms of Service PDF, linked from `alphavantage.co/terms_of_service/`
(fetched and read 2026-09-08).

The licence grant is "for **personal, non-commercial use**, unless you and Alpha Vantage
have agreed otherwise in writing" (§2.a). `[V]` Their definition of commercial use is where
this ends, and it is remarkably on-point for our situation — usage is commercial if:

> §2.a.iii — "You plan to use or provide information accessed through the Alpha Vantage
> Platform as part of any type of commercial activity that allows individuals or entities
> **other than User to access information directly or indirectly**, even if the scope of
> such activity falls outside of the securities industry." `[V]`

Publishing an Alpha-Vantage-derived sentiment metric on tapereader.us allows people other
than the user to access that information. **That is commercial use by their own definition,
and the free tier does not license it — regardless of the fact that TapeReader charges
nothing.** `[I]` §2.a.i also limits personal use to "investment analysis, research, testing,
monitoring, and any other activities that are **private and individual in nature**". `[V]`

**Verdict: ⛔ PRIVATE-USE-ONLY** on the free tier. The trade journal is squarely licensed.
A public page is not, and would need `premium@alphavantage.co`. This is the clearest
demonstration in the entire document that "free to users" ≠ "non-commercial".

### 9.2 Polygon — ⚖️ this one already affects the live product

**Source:** Polygon.io Market Data Terms of Service, now served at
`massive.com/legal/market-data-terms-of-service` (`polygon.io/legal/...` 301-redirects there;
last updated 2024-10-09) (fetched 2026-09-08).

- **"Derived Works"** is defined as "data, charts, analytics, research, or other works
  based on, referring to, or derived from the Market Data". `[V]`
- You may not "redistribute, display, disseminate, duplicate, license, sublicense, publish,
  broadcast, transmit, distribute... sell, resell, rebrand, or otherwise transfer the
  Market Data — or any data, charts, analytics, research, or other works based on,
  referring to, or derived from the Market Data... **to any third party** or use the Market
  Data for business or commercial purposes." `[V]`
- The grant is "exclusively for your **personal, non-business, and non-commercial**
  purposes" **regardless of plan tier**. `[V]`
- §1 prohibits building applications "intended for use by end users other than you". `[V]`
- §8: cease all use and delete all Market Data on termination. `[V]`

**Verdict for the sentiment project: ⛔ NEEDS LICENCE.** Polygon news/sentiment cannot feed
a public page under a standard subscription.

**⚖️ LEGAL REVIEW — and it is broader than this track.** TapeReader already uses Polygon for
trade-journal enrichment (private, single user — fine) but `docs/market-scans/phase-1-spec.md`
plans to publish **Polygon-derived daily bars, breadth metrics and scan hits publicly on
tapereader.us**. On the text above, precomputed scan output is a "Derived Work" being
displayed to third parties, and the personal/non-business restriction applies at every
tier. **This is a pre-existing exposure in the roadmap that is independent of social
sentiment, and it should be resolved — by getting a business/redistribution licence quote,
or by re-sourcing the public pages — before Market Scans Phase 1 ships.** It is arguably the
most consequential finding in this document, and it is one nobody was looking for. `[I]`

### 9.3 GDELT — ✅ the one unambiguously open news source

**Source:** `gdeltproject.org/about.html` (fetched 2026-09-08).

> "all datasets released by the GDELT Project are available for unlimited and unrestricted
> use for any academic, commercial, or governmental use of any kind without fee" `[V]`

Redistribution allowed, public display allowed, commercial use allowed, no retention limit.
**The only condition: "any use or redistribution of the data must include a citation to the
GDELT Project and a link to" gdeltproject.org.** `[V]`

**Verdict: ✅ SHIP.** Attribution is a footer line. GDELT is the correct backbone for any
public news-tone feature.

### 9.4 Marketaux

`marketaux.com/terms` and `/terms-and-conditions` both returned 403 from this environment.
**⚠️ UNVERIFIED — no claim made.** If Marketaux matters to the design, someone must read its
terms directly; do not assume it resembles GDELT.

---

## 10. Government, exchange & open datasets

### 10.1 FINRA short interest — an unwelcome surprise

**Source:** `finra.org/terms-of-use` (fetched 2026-09-08).

Intuition says regulator-published data is free to reuse. FINRA's own terms say otherwise:

- Content may be used "**ONLY for your own non-commercial personal or professional use**". `[V]`
- You may not copy, reproduce, transmit, display, perform or distribute the content without
  prior written consent, beyond copyright fair use. `[V]`
- **Data mining, scraping, harvesting tools and robots are banned**, as is bulk monitoring
  or copying of the site. `[V]`
- **Building a database from FINRA data is expressly forbidden** unless permitted
  elsewhere. `[V]`
- Using the content with machine learning, neural networks or AI systems is prohibited. `[V]`
- Original copyright notices must be retained. `[V]`

**Verdict: ⛔ BLOCKED as published by FINRA directly.** Every part of the obvious design —
automated download, store in D1, display derived metrics publicly — is individually
prohibited. `[I]`

Note the practical tension: third-party media providers plainly do redistribute and
recalculate FINRA short data `[R]`, which suggests either licensed feeds or tolerated
practice. That is not a basis on which to build. If short interest matters, the route is a
licensed vendor or written consent from FINRA, not the public files.
⚖️ **LEGAL REVIEW** before any use.

### 10.2 Wikipedia pageviews — ✅ the cleanest source in the study

**Sources:** `dumps.wikimedia.org/legal.html`, `dumps.wikimedia.org/other/pageviews/readme.html`,
`foundation.wikimedia.org/wiki/Policy:Terms_of_Use` (fetched 2026-09-08).

> "All Analytics datasets are available under the Creative Commons CC0 dedication." `[V]`

Pageviews dumps are Analytics datasets. **CC0 is a public-domain dedication: no attribution
required, no redistribution restriction, no commercial restriction, no retention limit.** `[V]`

Two things to keep straight: (a) **article text** is CC BY-SA 4.0 / GFDL and *does* carry
attribution and share-alike obligations `[V]` — pageview *counts* do not, and only counts
are wanted here; (b) API access must respect the User-Agent Policy, Robot Policy and
API:Etiquette, and must not place undue burden on an API. `[V]` That is an operational
courtesy (set a real User-Agent, cache, don't hammer), not a licensing constraint.

**Verdict: ✅ SHIP, permanent archive included.** Nothing in this study is legally cleaner.

### 10.3 SEC EDGAR and exchange data

Not verified this run. US Government works are generally not subject to copyright and EDGAR
imposes a fair-access/User-Agent policy rather than a licence `[I]`, but **exchange-sourced
data (SIP/consolidated tape) is separately licensed and is the usual trap.** If either
enters the design, verify before relying on this paragraph.

---

## 11. Investment-advice and financial-content exposure

Kept deliberately short — the risk here is low and well-understood.

**The relevant carve-out** is the publisher's exclusion in the Investment Advisers Act of
1940, which excludes "the publisher of any bona fide newspaper, news magazine or business
or financial publication of general and regular circulation". *Lowe v. SEC*, 472 U.S. 181
(1985), gives the three-part test `[R]`:

1. **Impersonal** — the advice is not tailored to an individual's situation and there is no
   fiduciary, person-to-person relationship;
2. **Bona fide** — genuine, disinterested commentary rather than promotional material;
3. **General and regular circulation** — published on a regular schedule, not issued
   episodically in response to particular market events.

**TapeReader as designed sits comfortably inside all three.** `[I]` It is one public page
showing the same numbers to everyone, with no user accounts, no personalisation, no
recommendations, no compensation from issuers, and a regular end-of-day cadence. Charging
for it later would not change the analysis — *Lowe* concerned paid newsletters. `[I]`

**A disclaimer is the right and proportionate mitigation** — a short, permanent, visible
line stating the site is for informational and educational purposes, is not investment
advice, and is not a recommendation to buy or sell any security. It should be *on the
sentiment page*, not buried in a legal footer. `[I]`

**What a disclaimer does not do** is cure a genuinely advisory relationship. The three
things that would actually change the risk profile, and which should therefore be treated
as design rules:

- **Do not personalise.** The moment output is tailored to an individual's holdings,
  position sizing or circumstances, the impersonality limb weakens.
- **Never accept payment to feature a ticker.** Securities Act §17(b) requires disclosure
  of consideration received for publicising a security; paid ticker placement on a
  sentiment leaderboard is the textbook fact pattern for a touting problem. `[R]`
- **Do not make performance or predictive claims.** "Stocks with high sentiment z-scores
  outperform" is a marketing claim that invites scrutiny a neutral "here is what was
  discussed" does not.

Additionally: because sentiment leaderboards are structurally adjacent to pump-and-dump
dynamics, **describe the metric's methodology openly** and avoid ranking language that
reads as a call to action ("most discussed", not "top picks"). `[I]`

No registration is required on this analysis. `[I]` Nothing here rises to
⚖️ LEGAL REVIEW unless the product adds personalisation, paid placement, or performance
marketing.

---

## 12. Verdict — what can actually ship

### ✅ SAFE TO SHIP PUBLICLY

Sources whose own terms permit public display of derived metrics, with no retention cap
that forecloses a permanent historical archive:

| Source | Condition |
|---|---|
| **Wikipedia / Wikimedia pageviews** | CC0. Nothing required. Set a proper User-Agent and cache politely. |
| **GDELT** | Cite "The GDELT Project" and link gdeltproject.org. One footer line. |
| **Bluesky / AT Protocol** | Store aggregates only; honour firehose delete events; keep the ingest switchable in case terms tighten. |

That is the entire safe list. **Three sources.** Any public sentiment feature must be
buildable from these alone, or it cannot be built as designed.

### ⛔ PRIVATE-USE-ONLY — fine in the trade journal, never on a public page

**Reddit API**, **Reddit academic dumps**, **Quiver Quantitative**, **Finnhub**,
**Alpha Vantage**, **Discord**. Each of these is licensed for private analysis and each
independently prohibits sharing derived output with third parties. They remain useful for
the private journal and for offline validation of whether the signal is real — which is
arguably the right way to use them anyway: **prove the edge privately on the good data,
then reproduce it publicly on the clean data.** `[I]`

### ⛔ BLOCKED — do not build on these at all

- **X / Twitter** — public-facing use requires an Enterprise agreement; 24-hour deletion
  sync forecloses a raw archive; scraping is both barred and litigated.
- **StockTwits** — no lawful access route exists today: API closed to new registrations,
  scraping expressly named and banned. Fails at collection, so nothing downstream matters.
- **YouTube** — derived metrics expressly prohibited and public aggregation is owner-only;
  30-day retention cap kills the archive independently.
- **FINRA short interest (direct files)** — automated retrieval, database-building,
  redistribution and commercial use each separately prohibited.

### ⚠️ UNCLEAR — do not ship without resolving

- **ApeWisdom**, **Tradestie** — no published terms at all, *and* they redistribute
  Reddit-derived data without evident licence. Convenient, but you would be inheriting
  someone else's unresolved exposure with no contract to stand on.
- **Telegram** — terms silent on redistribution; broad AI-development prohibition.
- **Marketaux** — terms unreachable this run; genuinely unknown, no claim made.

### ⚖️ Items for real legal review before anything ships

1. **Polygon and the existing roadmap (§9.2)** — the Market Scans Phase 1 plan publishes
   Polygon-derived output on a public site, against terms restricting all tiers to
   personal, non-business use and barring display of Derived Works to third parties.
   **This is live-product exposure that predates this study and is the highest-priority
   item on this page.**
2. **Reddit's actual Data API Terms** — the one primary source I could not read; every
   Reddit claim here is secondary.
3. **FINRA**, if short interest is wanted — needs a licensed vendor or written consent.
4. **X's aggregate-metrics clause**, only if someone wants to reopen X.

---

## 13. Confidence, gaps and what I could not verify

**Read directly and quoted from the source's own pages `[V]`:** X developer policy,
agreement and restricted-use-cases (via `docs.x.com`); StockTwits ToS and developer page;
Bluesky ToS and IP policy; Telegram API terms; YouTube API ToS and Developer Policies;
Discord Developer ToS (official repo copy); Finnhub ToS; Quiver ToS; Alpha Vantage ToS PDF;
Polygon Market Data ToS; GDELT terms; FINRA Terms of Use; Wikimedia dumps legal page,
pageviews readme and Foundation Terms of Use; ApeWisdom and Tradestie API pages.

**Could not reach from this environment — findings are `[R]` only:**

- **Reddit** — `redditinc.com`, `www.reddit.com`, `support.reddithelp.com` and
  `web.archive.org` were all blocked. This is the single largest gap in the track, and
  Reddit is likely the highest-signal source in the whole study. Someone with a normal
  browser should read the Data API Terms and the Responsible Builder Policy directly.
- **Marketaux** — 403 on both terms URLs.
- **X consumer ToS** (`x.com/en/tos`) — HTTP 402; the anti-scraping clause is `[R]` only.
  The developer-side terms *were* verified, which is what governs API use.

**Process note:** `docs/social-sentiment/00-brief.md` — named as the contract for this run —
**did not exist** when this track executed; the directory was empty apart from `.wip/`. I
worked to the constraints as relayed in the task (no accounts, no credentials, no spending,
public documentation and terms pages only), all of which were honoured. If the brief adds
scope beyond what is covered here, this document needs a second pass against it.
