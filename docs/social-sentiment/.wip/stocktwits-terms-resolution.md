# Stocktwits — Terms Resolution

**Resolves `13-open-questions.md` item 6 (Track A1–A3 "find of the run" vs Track H "blocked").**
**As of: 2026-09-08/09.** All fetches performed this date unless noted.
Tags: `[V]` verified on the source's own page · `[A]` verified on an *archived* copy of
the source's own page · `[R]` reported by third parties · `[I]` our inference.
**Not legal advice. Not a lawyer.**

---

## ⬛ VERDICT

> ### Track H was right. Track A1–A3's measurements are all correct and its framing does not survive contact with the documents.
>
> The narrow question was: **is unauthenticated access to documented public v2 JSON
> endpoints "scraping", or is it ordinary API use that merely lacks a key?**
>
> **It is neither, and that is the finding.** The v2 API is *no longer documented at all* —
> `api.stocktwits.com/developers/docs` and every method page under it return **HTTP 404**
> today `[V]`. The developer portal is a single frozen page saying registration is shut,
> footer **"© 2021"** `[V]`. There is **no live API Terms of Service, no live rate-limit
> page, no live display guidelines, and no API document of any kind** to invoke the
> precedence clause with. The endpoints are the site's own backend, publicly reachable
> and undocumented — the task's *third* framing, and the weakest of the three.
>
> **All three framings land restrictive. That is why this resolves cleanly rather than
> ambiguously:**
>
> | Framing | Governing text | Result |
> |---|---|---|
> | It is **scraping** | ToS §5: no automated extraction "except as expressly authorized … through an **approved** API" `[V]` | ⛔ banned; nothing today is "approved" |
> | It is **ordinary API use** | The only API terms Stocktwits ever published — API License Agreement, 2019-07-03, **now 404** `[A]` | ⛔ **worse**: 30-day retention cap, express ban on creating *or displaying* "sentiment information", no redistribution at all |
> | It is the **site's internal backend** | ToS §1 scope: the Terms govern "websites, mobile applications, widgets, **APIs**, content" `[V]` | ⛔ ToS §5 applies unmodified; no licence, no grant |
>
> **There is no FINRA-style second channel here.** FINRA turned on a *more permissive*
> product licence hiding behind a restrictive site ToU. Stocktwits' product licence is
> **more restrictive than its site ToS**, and it has been withdrawn rather than replaced.
> Searching for the licensed route was the right instinct; the route does not exist.
>
> ### (a) — Collect and store for a private, single-user journal, nothing published?
> **AMBER, and only in a deliberately restrained form. Not clean.**
> The current ToS's bite is at the **collection step**, not the use step: §5 bans
> automated extraction; nothing in the current ToS bans private analysis of data you
> lawfully hold, and there is **no current retention cap** (the 30-day cap lived in the
> withdrawn API licence, which we are not party to) `[V][A]`. So the *use* is fine and the
> *method* is the exposure — the same shape as FINRA's CDN. **Occasional, hand-triggered,
> un-paginated retrieval of a handful of symbols is the most defensible version that
> exists. A scheduled backfill of 12,000 requests is not, on any reading.**
>
> ### (b) — Aggregate derived metrics (mention counts, bull/bear ratios) on a free public site?
> **NO. This is the clearest "no" in the document, and it is worse than (a) on three
> independent grounds.**
> 1. It requires (c) to be true, and (c) fails.
> 2. **Stocktwits sells this exact product.** ToS §8 reserves the right to "use, analyze,
>    and create products and services derived from your public User Content … and may
>    license those products and services to third parties, including financial
>    institutions and investment firms" `[V]`. A free public bull/bear ratio page is a
>    free competitor to their revenue line, built from their data.
> 3. The withdrawn API licence banned precisely this by name — "shall not create,
>    disclose, sell, or display any information derived by analysis … including …
>    **sentiment information** … or any summaries of the foregoing" `[A]`. That is not
>    binding on us, but it is unambiguous evidence of intent, and it is the clause that
>    would be written into any licence we ever asked for.
>
> ### (c) — Automated recurring collector vs occasional manual retrieval?
> **NO to the automated collector. The manual case collapses into (a).**
> §5 names "scraping service, automation service" and bans extraction "by automated
> means" `[V]`. Two further specifics that were not in evidence before:
> - **`api.stocktwits.com/robots.txt` exists** (via 301 to `api-gw-prd.stocktwits.com`)
>   and disallows **`/*?` for all user-agents** `[V]` — i.e. **every paginated
>   `?max=<cursor>` call, which is the entire backfill mechanism, is robots-disallowed.**
>   A1–A3 recorded "serves no robots.txt of its own". **That is wrong; correct it.**
> - The only unauthenticated rate figure Stocktwits ever published is **200 requests/hour
>   per IP** `[A]`. The measured 8.9 req/s is **~160× that**; the 120-page walk at 0.25s
>   spacing is **~72×**. ToS §6 bans circumventing "rate limits" `[V]`. The absence of
>   `X-RateLimit-*` headers today is a *change in the gateway*, not a grant.
>
> ### ⚠️ The one genuine argument on the other side — stated at full strength, then weighed
> **Contract formation.** We hold no account, never clicked "I accept", and the endpoint
> returns bare JSON with no notice. In *Meta v. Bright Data* (N.D. Cal., Jan 2024) the
> court held a logged-out scraper was not bound by Meta's terms `[R]`. **But the reasoning
> turned on the exact clause Stocktwits still has and Meta had deleted:** Chen relied on
> Meta having removed, in 2009, language binding "anyone who visited" `[R]`. Stocktwits
> §1 reads **"By accessing or using the Service, you agree to these Terms"**, and defines
> the Service to include **APIs** `[V]`. **The fact pattern that won for Bright Data is
> materially weaker here.** Treat "we might not be bound" as a litigation posture, not a
> plan — and note it gives no licence even if it wins.

---

## 1. Which documents govern? — the map, and the missing document

### 1.1 Stocktwits Terms & Conditions — the operative document, and today the *only* one

**URL:** `https://stocktwits.com/terms` → `https://stocktwits.com/about/legal/terms/`
**"Last Revised: July 10, 2026"** `[V]` — current, and revised two months ago.

**Scope — this answers the task's core question directly:**

> **§1.** "These Terms & Conditions ('Terms') govern your access to and use of the
> Stocktwits websites, mobile applications, widgets, **APIs**, content, subscriptions, and
> other products or services that link to these Terms (collectively, the 'Service'). **By
> accessing or using the Service, you agree to these Terms**" `[V]`

APIs are inside "the Service" **by name**. There is no reading on which the v2 endpoints
sit outside this document's stated scope. `[V]`

**The precedence clause — the FINRA-shaped clause the task asked us to look for. It exists,
and it points at a document that no longer exists:**

> **§1.** "We may provide additional terms for specific products, features, promotions,
> **APIs**, or paid offerings. If those additional terms conflict with these Terms, the
> additional terms control for the specific offering." `[V]`

FINRA's equivalent clause deferred to a *more permissive* product licence that was live and
free. **Stocktwits' clause defers to nothing.** Verified 404 today: `/developers/docs`,
`/developers/docs/api`, `/developers/api-terms`, `/developers/docs/rate_limiting`,
`/developers/docs/display_requirement` `[V]`. The developer portal links only to itself,
`stocktwits.com`, and two `mailto:` addresses — **no terms link at all** `[V]`.
**Conclusion: the general ToS governs unauthenticated API access, unrebutted.** `[I]`

### 1.2 The operative restrictions, quoted exactly

> **§5 (heading).** "No Unauthorized Managed, Automated, or Scraping Access" `[V]`
>
> **§5.** "You may not share your account credentials, provide managed access to your
> account, or use the Service through an unauthorized third-party posting service,
> **scraping service, automation service**, signal service, copy-trading service,
> account-management service, or similar arrangement." `[V]`
>
> **§5.** "You may not scrape, harvest, mirror, frame, deep-link to, data-mine, or
> otherwise **extract data or content from the Service by automated means** except as
> expressly authorized by us in writing or **through an approved API, widget, developer
> offering, or other product rule**." `[V]`
>
> **§5.** "General-purpose search engines may crawl publicly available pages in the
> ordinary course for indexing purposes." `[V]`

**The whole question reduces to whether the unauthenticated v2 endpoints are an "approved
API".** Three facts say no, and none say yes `[I]`:
1. Approval is something Stocktwits grants; the only approval mechanism they ever ran was
   developer registration, and it is **shut** `[V]`.
2. The API is **undocumented today** — you cannot be inside a product rule that has been
   deleted `[V]`.
3. The currently-open sanctioned routes are named in the same sentence and are different
   things: the **widget** (live, `stocktwits.com/widgets` `[V]`) is display-only and
   yields no data for analysis; the **developer offering** is closed.

Also live and relevant:

> **§4.** "we grant you a limited, revocable, non-exclusive, non-transferable license to
> access and use the Service **for its intended purposes**." `[V]`
>
> **§6.** you may not "**circumvent our technical measures, rate limits**, access controls,
> or security protections" `[V]`
>
> **§12.** "The Service, including its software, design, **compilation**, look and feel …
> and other content **other than User Content**, is owned by or licensed to Stocktwits …
> You may not copy, modify, create derivative works of … or otherwise exploit any part of
> the Service except as expressly permitted by these Terms" `[V]`
>
> **§8.** "you acknowledge and agree that Stocktwits may use, analyze, and **create
> products and services derived from your public User Content** … and **may license those
> products and services to third parties, including financial institutions and investment
> firms**, for research, analysis, benchmarking" `[V]`

**Two nuances worth being precise about, because they cut in opposite directions `[I]`:**
- **In our favour:** §12's IP grant expressly *excludes* User Content — the messages are
  the users' `[V]`, and Stocktwits holds a licence, not title. The current ToS contains
  **no retention cap, no express non-commercial limit, and no clause banning derived
  metrics.** Under *Feist*, mention counts and bull:bear ratios are facts and are not
  copyrightable `[I]`. **The exposure here is contract and the compilation, not copyright
  in the messages** — same structure as the FINRA finding.
- **Against us:** the **compilation** *is* Stocktwits' under §12 `[V]`, and a stored
  message archive is a copy of that compilation. And §8 establishes the commercial
  adversity that makes (b) the version most likely to draw an actual complaint `[I]`.

### 1.3 The withdrawn Stocktwits API License Agreement — the document the "ordinary API use" framing would import

**URL (now HTTP 404):** `https://api.stocktwits.com/developers/api-terms` `[V]`
**Archived copy read:** `web.archive.org/web/20210618145045/…` · **"Last Updated on July 3, 2019"** `[A]`

This is the decisive artefact, because it is what "it's just ordinary API use" would mean
in practice. It is **far more hostile than the site ToS**:

> **Licence grant.** "…to integrate one or more parts of the Stocktwits API into Licensee's
> website, mobile or desktop application … and to display the Stocktwits Data on such
> Application, **but not for any kind of re-distribution of the Stocktwits Data, whether
> instantaneous or as copies of archived data, whether whole or in part.**" `[A]`
>
> **Retention.** "any messages contained within the Stocktwits Data **cannot be stored for
> more than 30 days for any purpose**" `[A]`
>
> **Derived data.** "Licensee shall not create, disclose, sell, or display any information
> derived by analysis of the Stocktwits Data or the Stocktwits API, including, without
> limitation, any **message trend information, sentiment information** … or any summaries
> of the foregoing **or any other kind of algorithmic products** using the Stocktwits Data" `[A]`
>
> **Competition.** "shall not use the Stocktwits Data or Stocktwits API to compete with
> Stocktwits" `[A]`
>
> **Display.** display all messages "in their entirety, in the order they are received",
> not selectively, with the Stocktwits trademark per the Content Display Requirements `[A]`

**Read that against this study's design.** The derived-data clause bans, by name, the two
things the study wants: a sentiment time series and message-trend counts. The 30-day cap
bans the archive. The display clause bans the aggregate view. **A registered developer in
2019 was worse off than an unregistered reader is today** — which is a strange and
important result: *the closed door is not hiding a better deal.* `[I]`

**It does not bind us** (we are not a Licensee; it required click-through acceptance and an
issued access key; it is withdrawn) `[I]`. It is admitted here as **evidence of intent**,
and it is strong: this is what Stocktwits' own lawyers wrote about exactly this data.

### 1.4 Historical rate limits — the number that reframes the "no throttling" measurement

**URL (now 404):** `/developers/docs/rate_limiting`; archived 2021, footer "© 2012" `[A]`

> "**Unauthenticated calls are permitted 200 requests per hour** and measured against the
> public facing IP of the server or device making the request." `[A]`
> "Authenticated calls are permitted 400 requests per hour" `[A]`
> "All Stocktwits API responses return a set of rate limit HTTP headers … `X-RateLimit-Limit`,
> `X-RateLimit-Remaining`, `X-RateLimit-Reset`" `[A]`
> "We ask that you honor the rate limits. If you or your application abuses the rate limits
> we will be forced to **suspend and or blacklist** it." `[A]`

The archived method page for `streams/symbol` records: **Rate Limited? Yes · Requires
Authentication? No · Requires Partner-Level Access? No** `[A]` — so A1–A3 is right that the
endpoint was documented as key-free, **and in the same table it is documented as rate
limited**, at 200/hr.

**Measured today (one request, this run): HTTP 200, `x-served-by: core-api`, and no
`X-RateLimit-*` header of any kind** `[V]` — reproducing A1–A3's observation. The honest
reading is that the gateway in front of the API stopped emitting (and possibly stopped
enforcing) the documented limit. **"No headers" is a fact about their infrastructure. The
only published number is 200/hr, and ToS §6 bans circumventing rate limits.** `[I]`

---

## 2. robots.txt — evidence of intent, not a contract

Both files read directly this run. **This section corrects a factual error in A1–A3.**

| Host | robots.txt | Bearing |
|---|---|---|
| `stocktwits.com` | **200**, `last-modified: 2026-09-08` `[V]` | Disallows `/advanced/`, `/stocks`, `/watchers`, `/watchlist`, `/widgets/`, `/followers`, `/following`, `/liked`, `/symbol/*/earningscall`, `/c/`, `/sentiment/calendar/*`. **Blanket `Disallow: /` for a named block of ~20 AI/scraper agents** (CCBot, ByteSpider, cohere-ai, Diffbot, Scrapy, Amazonbot, Applebot-Extended, …). **`/api/` is not mentioned.** |
| `api.stocktwits.com` | **301 → `api-gw-prd.stocktwits.com/robots.txt`, which is 200** `[V]` | **`User-Agent: * … Disallow: /*?`** — plus `/advanced/`, `/widgets/`, `/watchers`, `/followers`, `/following`, `/stocks`, `/liked`, `/watchlist`. `GPTBot: Disallow: /` outright. Googlebot alone gets `Allow: /sentiment-api/`. |

**What this actually says `[I]`:**
- A1–A3 reported the API host "serves no robots.txt of its own." **It does** — RFC 9309
  requires following redirects, and the redirect resolves to a live file. **Correct this in
  the track file.**
- **`Disallow: /*?` covers every query-string request on the API host.** The un-paginated
  first page (`/api/2/streams/symbol/AAPL.json`) carries no query string and is not
  disallowed. **Every `?max=<cursor>` page is.** The deep history walk — the single most
  valuable thing A1–A3 found — is the part robots.txt disallows.
- Naming Scrapy, CCBot and GPTBot for blanket exclusion is not the posture of a site that
  regards bulk programmatic collection as welcome.
- **None of this is a contract and none of it grants anything.** A path robots.txt does not
  disallow is still governed by ToS §5.

---

## 3. Registration, the commercial path, and the contact route

| Question | Finding |
|---|---|
| **Is registration closed?** | **Yes, and it appears frozen rather than paused.** `api.stocktwits.com/developers`: "we are currently reviewing all of our APIs, documentation and terms … **won't be accepting new registrations until we have finished our review**" `[V]`. **The page's own footer reads "© 2021 Stocktwits, Inc."** `[V]` — while the site ToS was revised July 2026. A five-year "review" with the documentation deleted in the interim reads as a **discontinued self-serve programme**, not a queue. `[I]` |
| **Partner tier?** | Yes, historically — the archived docs gate extended metadata behind "**Partner-Level Access**" `[A]`, and the archived rate-limit page says "If your application requires extended data or a higher rate limit, you may want to consider becoming a partner" `[A]`. Today it is not self-serve. |
| **Commercial / enterprise path?** | **Yes, and it is the only open door.** `stocktwits.com/enterprise` is live: a **"Talk to Sales — Connect with our team to explore tailored solutions"** form (name, job title, work email, company, website, message) `[V]`. **No pricing is published anywhere on Stocktwits' own site** `[V, negative]`. Third-party write-ups put institutional sentiment-feed contracts in the six figures per year `[R]` — but the sources are low-quality SEO/business-model blogs and **should not be relied on**; treat the price as *unknown and probably far outside a $0–10/mo study*. `[I]` |
| **Real partner integrations exist?** | Yes — Alpaca advertises a Stocktwits integration delivering "Stocktwits social feeds, Stocktwits social sentiment" to **Broker API partners**, OAuth2-authenticated `[R]`. Confirms a live licensed channel exists; it is for brokerages, not individuals. |
| **Contact route to ask?** | **`developers@stocktwits.com`** (from the developer portal) `[V]`; `support@stocktwits.com` and `legal@stocktwits.com` from the ToS `[V]`; the enterprise sales form `[V]`. |

**Recommendation on this point, mirroring FINRA option 3:** a one-paragraph email to
`developers@stocktwits.com` asking (i) whether unauthenticated read access to `/api/2/`
endpoints at a low rate is acceptable for private research, and (ii) whether any tier
permits publishing derived aggregate counts, is **free, low-effort, and converts the entire
ambiguity into a written answer.** Unlike FINRA, the likely answer is "no" — which is still
worth having in writing before anyone builds. → **Track K.**

---

## 4. The three practical questions, answered separately

### (a) Collect + store for a private, single-user journal, nothing published

**⚠️ AMBER — the use is fine, the method is the problem. Do not record this as a clean yes.**

| | |
|---|---|
| **What is permitted** | Reading Stocktwits for your own trading is the Service's intended purpose (§4) `[V]`. The current ToS has **no retention cap, no non-commercial limit, and no derived-analysis ban** — a private bull/bear feature column in a gated journal breaches nothing in the live document *by itself*. `[V]` |
| **What is not** | §5 bans automated extraction `[V]`. A nightly collector is squarely inside it. The `?max=` backfill is additionally robots-disallowed `[V]`. Volume above ~200 req/hr runs into §6's rate-limit clause against the only published figure `[A]`. |
| **The most defensible version that exists** | Hand-triggered, low-volume, first-page-only retrieval for symbols already in the journal; no cursor walk; no schedule; store what you fetched. **This is a grey area we are choosing to sit in, not a permission.** `[I]` |
| **The version to refuse** | The 12,000-request, 100-symbol, ~1-hour backfill A1–A3 costed. That is the paradigm case of what §5 describes, executed at ~72× the only published rate limit, against robots-disallowed paths. `[I]` |

**Consequence for `13-open-questions.md` §7:** the retroactive-scoring plan that would have
rescued Track D2's power analysis **is the specific activity with the worst standing in this
whole document.** D2 should not be revised on the assumption that the backfill is available.

### (b) Aggregate derived metrics on a free public website

**⛔ NO. Do not ship this. There is no conditional version, no attribution string, and no
free-tier carve-out that fixes it.**

Reasons, independent of each other `[I]`:
1. It presupposes (c). (c) fails.
2. §8 establishes that Stocktwits **sells derived sentiment products to financial
   institutions** `[V]`. A free public bull/bear page is directly adverse to a live revenue
   line — the *worst* possible posture for a party with no licence.
3. The withdrawn API licence banned creating *or displaying* "sentiment information" and
   "message trend information" outright `[A]`. Not binding, but it tells you exactly what
   any negotiated licence would say.
4. §12's compilation right plus §5's collection ban means both the input and the artefact
   are contested `[V]`.

**What survives:** the *facts* (counts, ratios) are not copyrightable `[I]`, so this is a
contract and unfair-competition question rather than an infringement one. That distinction
changes the remedy, not the answer.

### (c) Automated recurring collector vs occasional manual retrieval

| | Automated recurring | Occasional manual |
|---|---|---|
| **Verdict** | ⛔ **No.** §5 names "scraping service, automation service" and bans automated extraction `[V]`; `Disallow: /*?` blocks the paginated form `[V]`; 200 req/hr is the only published unauthenticated budget `[A]`. | ⚠️ **See (a).** Genuinely lower risk, genuinely not a loophole. A "manual" habit that reconstructs months of history is the same act with more clicks. `[I]` |

**And do not read the absence of throttling as permission.** Stocktwits reserves the right
to "suspend or terminate any account or **access method** used in connection with
unauthorized … automated access" (§5) `[V]`, and the archived policy warns of blacklisting
`[A]`. The realistic failure mode is not a lawsuit — it is an IP block that arrives without
notice and takes the whole series with it. `[I]`

---

## 5. Alternatives — human-labelled sentiment, or clean cashtag resolution

Ranked. **Honest headline: nothing replaces Stocktwits. It was the find of the run because
it is genuinely unique, and losing it is a real loss, not a routing problem.**

| # | Source | Human-labelled? | Cashtag-clean? | Cost | Terms | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Stocktwits widget** (`stocktwits.com/widgets`, live `[V]`) | n/a | n/a | $0 | The one currently-open sanctioned route named in §5 | **Display-only embed. Yields no data for analysis.** Useful if the public site wants Stocktwits *presence* without Stocktwits *data*. |
| 2 | **Stocktwits enterprise** (`/enterprise` sales form `[V]`) | ✅ | ✅ | **Unpublished; assume ≫ $10/mo** `[I]` | Negotiated | The only route to a real licence. Ask, expect no. |
| 3 | **Bluesky / AT Protocol** | ⛔ model-inferred | ⛔ no structural cashtag | $0 | The study's own A4–A6 found the ToS **silent on automated access**, firehose public by design `[V, per 09-legal-tos §5]` | **The best-licensed social source in the study.** Solves the legal problem, not the two data problems. |
| 4 | **Reddit via Arctic Shift** | ⛔ | ⛔ **0.6% cashtag rate; 39/51 common words are tickers** | $0 | Arctic Shift states **no licence at all** `[per A1–A3]` | Already the study's spine. Its ticker-resolution problem is exactly what Stocktwits solved. |
| 5 | **FMP Social Sentiment API** `[R]` — advertises coverage of "Reddit, Yahoo, StockTwits, and Twitter" | inherited | ✅ per-ticker | paid | **Unverified; their page returned HTTP 403 to us this run** `[V, negative]` | ⚠️ **If it resells Stocktwits content, you inherit an exposure you cannot audit** — the ApeWisdom/Kaggle problem. Do not adopt without reading FMP's own terms *and* satisfying yourself they are licensed. |
| 6 | `stockapis.com/parsers/stocktwits`, `stocktwitsapi.com` `[R]` | inherited | ✅ | paid | Third-party scrapers of Stocktwits | ⛔ **Never. A vendor cannot grant rights Stocktwits never gave them.** This is licence laundering with an invoice attached. |
| 7 | **Market-level human sentiment surveys** (AAII bull/bear, NAAIM exposure) `[I]` | ✅ genuinely human-declared | n/a — market-level | $0 | Each has its own ToU; unverified this run | Not a ticker-level substitute. Worth one line as a *market-regime covariate* if the study wants any human-declared series at all. |

**What is actually lost, stated plainly `[I]`:** the study's ticker-resolution problem
(§9 of the open questions) has **no free, licensed solution left.** The remaining honest
options are (i) accept bare-token extraction with a stoplist and quantify the error rate as
a first-class result, or (ii) restrict the universe to a small watchlist where a
hand-curated alias map is tractable. Option (ii) fits this journal's ~18 analyzable
trades/month better than option (i) does.

---

## 6. Recommendations

1. **Do not add Stocktwits to the collector.** `13-open-questions.md` §6's holding —
   "do not add StockTwits to the collector; private-journal candidate at most" — is
   **confirmed, and should be tightened**: even the private-journal route excludes the
   scheduled/paginated backfill.
2. **Revise `13-open-questions.md` §7 rather than acting on it.** The walkable-history
   finding is technically true and is the item with the worst legal standing in the file.
   D2's power analysis must **not** be relaxed on the assumption that retroactive scoring
   is available.
3. **Correct two factual claims in `.wip/a1-a3-x-reddit-stocktwits.md`:**
   (i) `api.stocktwits.com` **does** serve a robots.txt, via 301, and it disallows `/*?`;
   (ii) the v2 endpoints are **not currently documented** — the docs 404, and the archived
   docs recorded a 200 req/hr unauthenticated limit that the measurement exceeded ~160×.
4. **Track K:** email `developers@stocktwits.com` (and/or the `/enterprise` sales form) with
   the two-question ask in §3. Free; produces a written answer either way.
5. **Track F:** nothing Stocktwits-derived on the public site. If Stocktwits presence is
   wanted there, use the **widget**, which is a sanctioned display route `[V]`.
6. **Track G cost ladder:** Stocktwits sits at **no rung** — $0 buys tolerated-not-licensed
   access, and the licensed tier has no published price. It is not a budget question.

---

## 7. What warrants real legal review

Ranked by how much rides on it.

1. **Contract formation against a never-registered, logged-out client.** The entire
   "we are not bound" position rests here. *Meta v. Bright Data* is genuinely favourable
   `[R]`; Stocktwits' §1 "by accessing or using" language is the specific thing that
   distinguishes it `[V]`. ⚖️ **Highest stakes, and we are probably on the losing side of
   the distinction.**
2. **Whether the unauthenticated v2 endpoints are an "approved API" under §5.** Our reading
   is no, on three grounds `[I]`. A lawyer might weigh differently the fact that Stocktwits
   *publishes* these endpoints to anonymous callers from its own homepage footer link to
   `api.stocktwits.com/api/2/` `[V]` — the only fact in the record that points our way.
3. **Whether a stored message archive infringes §12's "compilation"** even though the
   messages themselves are user-owned and the derived counts are *Feist* facts `[I]`.
4. **Whether the withdrawn 2019 API License Agreement has any residual force** as evidence
   of the terms on which such access is offered. Our reading: evidentiary only, not binding `[I]`.
5. **Unfair competition / tortious interference** exposure from (b), given §8's express
   commercial framing `[V]`. This is the theory a plaintiff would actually plead, and it is
   not a copyright question.

---

## 8. Sources

All fetched **2026-09-08/09** unless noted. `[A]` = Internet Archive copy of a page that is
now 404 on the live site.

| Document | URL | Version / status |
|---|---|---|
| **Stocktwits Terms & Conditions** | `https://stocktwits.com/terms` → `/about/legal/terms/` | **Last Revised 2026-07-10** `[V]` |
| Privacy Policy | `https://stocktwits.com/about/legal/privacy` | Effective **July 2026** `[V]` |
| Developer portal (registration closed) | `https://api.stocktwits.com/developers` | live; footer **"© 2021"** `[V]` |
| **Stocktwits API License Agreement** | `https://api.stocktwits.com/developers/api-terms` | **404 live** `[V]`; archived `web.archive.org/web/20210618145045/…`, **Last Updated 2019-07-03** `[A]` |
| API method documentation (incl. `streams/symbol`: auth not required, rate limited) | `https://api.stocktwits.com/developers/docs/api` | **404 live** `[V]`; archived `…/20210507041010/…` `[A]` |
| API rate limits (**200 req/hr unauthenticated**, `X-RateLimit-*`, blacklisting) | `https://api.stocktwits.com/developers/docs/rate_limiting` | **404 live** `[V]`; archived `…/20210507041010/…` `[A]` |
| Content Display Requirements | `https://api.stocktwits.com/developers/docs/display_requirement` | **404 live** `[V]` |
| Enterprise / "Talk to Sales" | `https://stocktwits.com/enterprise` | live, no pricing `[V]` |
| Trending widget (sanctioned display route) | `https://stocktwits.com/widgets` | live `[V]` |
| robots.txt | `stocktwits.com` (200, `last-modified 2026-09-08`) `[V]` · `api.stocktwits.com` → 301 → `api-gw-prd.stocktwits.com` (200, **`Disallow: /*?`**) `[V]` | — |
| Live endpoint probe (single request): HTTP 200, `x-served-by: core-api`, **no `X-RateLimit-*`** | `https://api.stocktwits.com/api/2/streams/symbol/AAPL.json` | measured `[V]` |
| Alpaca × Stocktwits broker integration | `alpaca.markets/stocktwits` | `[R]` (search summary) |
| *Meta Platforms v. Bright Data* (N.D. Cal., 2024-01-23) | law-firm client alerts | `[R]` |
| Third-party Stocktwits ARR / enterprise pricing figures | SEO/business-model blogs | `[R]`, **low quality — not relied on** |

**Not done, per hard constraints:** no account created, no credentials entered, no developer
registration attempted, no purchase, no bulk collection. Live requests this run were a
handful of metadata/robots/terms fetches plus **one** `streams/symbol` call to observe
response headers.
