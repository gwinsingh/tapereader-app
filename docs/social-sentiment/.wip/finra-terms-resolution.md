# FINRA Short-Sale Volume — Terms Resolution

**Resolves `13-open-questions.md` item 4 (Track C "adopt" vs Track H "blocked").**
**As of: 2026-09-08.** All fetches performed this date unless noted.
Tags: `[V]` verified on the source's own page · `[R]` reported by third parties ·
`[I]` our inference. **Not legal advice.**

---

## ⬛ VERDICT

> ### Both tracks were right — about *different routes to the same bytes.*
>
> FINRA publishes Reg SHO daily short-sale volume through **two channels with two
> different licences**, and neither track knew about the other's channel.
>
> | Route | Governing document | Automated pull | Build a DB | Public display of derived metrics |
> |---|---|---|---|---|
> | **`cdn.finra.org/equity/regsho/daily/*.txt`** (anonymous flat files — what Track C measured) | `finra.org/terms-of-use` | ⛔ **prohibited** | ⛔ **prohibited** | ⛔ **prohibited** |
> | **Query API + free Public credential** (`api.finra.org/data/group/otcMarket/name/regShoDaily`) | API ToS + **Specific Terms for Equity Data** | ✅ **the licensed method** | ✅ (no retention limit) | ✅ **expressly permitted**, with conditions |
>
> **Track H was right about the flat files. Track C was right that the data is
> obtainable and free. The fix is a route change, not a source change.**
>
> ### 5(a) — Private, single-user journal, nothing published?
> **YES, on either route — but only the API route is clean.**
> The Specific Terms grant "non-commercial personal or professional use" outright `[V]`.
> Even via the CDN, the site ToU's *Permitted Uses* clause allows exactly this use —
> what it forbids is the **automated retrieval and the database**, not the reading.
> So: private journal use is permitted; **private journal use built by a nightly
> scraper of the CDN is not.** Use the API and (a) is unambiguously fine.
>
> ### 5(b) — Aggregate derived metrics on a free public website?
> **YES via the API route, conditionally. NO via the CDN route.**
> Specific Terms for Equity Data §2.3 expressly permits redistributing the data
> *and* derivative data to third-party end users `[V]`. Four conditions attach:
> **(1)** attribute FINRA as owner and source, **(2)** charge nothing for it,
> **(3)** tell end users they may not further redistribute it, **(4)** make
> commercially reasonable efforts to hold them to that. tapereader.us is free, so
> (2) holds today — **the moment ads, a subscription, or a paid tier appear, §2.2's
> "non-commercial" limit is squarely in play and this answer flips.** `[I]`
>
> ### 5(c) — Automated daily collector?
> **YES against the API. NO against the CDN.**
> API ToS §3.3(d) forbids using "any process **other than the Licensed APIs**" to
> copy in bulk `[V]` — which frames the API as *the* sanctioned automated channel.
> Documented sync limit **1,200 req/min per IP** `[V]`; one call/day is nothing.
> The site ToU, by contrast, bans "data mining, scraping or harvesting tools
> (including robots)" with no API carve-out `[V]`.
>
> ### ⚠️ The catch that decides the build
> **The API is a 365-day rolling window. The 8.1-year history exists only on the
> CDN.** Measured today: API returns rows for `2025-09-08` but nothing for
> `2025-09-02` `[V]`. So the licensed route gives you a *forward-accruing* series
> and **no backfill**. See §7 for the three options.

---

## 1. Which terms actually govern? — the document map

### 1.1 `finra.org/terms-of-use` — governs the CDN flat files

**URL:** `https://www.finra.org/terms-of-use` · **Last modified: November 9, 2023** `[V]`

Scope clause, verbatim:

> "The use of the FINRA.ORG site, including all of its content ("FINRA Website"),
> is conditioned upon the acceptance by you ("End User"), without modification, of
> these terms of use" `[V]`

The four operative restrictions Track H found — quoted exactly:

> **Permitted Uses.** "the content and material provided through the FINRA Website
> shall be used ONLY for your own non-commercial personal or professional use." `[V]`
>
> **Restrictions (d).** "develop or create a database of data using the FINRA
> Website, *except as expressly permitted by any other terms of use on the FINRA
> Website*" `[V]`
>
> **Restrictions (e).** "use any process to monitor or copy the FINRA Website in
> bulk, or use any data mining, scraping or harvesting tools (including robots), or
> any similar data-gathering or extraction tools" `[V]`
>
> **Copyright §b.** works "may not be copied, reproduced, transmitted, displayed,
> performed, distributed … or otherwise used in whole or in part in any manner
> without FINRA's prior written consent, except to the extent that such use
> constitutes 'fair use'" `[V]`

Track H also correctly flagged **Restrictions (m)**, which prohibits use of the
site "in conjunction with any machine learning, neural network, deep learning,
predictive analytics or other artificial intelligence computer or software
program, including … a model, algorithm, or process that is designed to predict
trades for or within an individual portfolio, fund, or other investment vehicle" `[V]`.
**That clause describes this project's hypotheses H1–H6 almost word for word.**
It is the single most hostile sentence in the document, and it has **no counterpart
anywhere in the API terms** — which is itself a strong signal about which document
FINRA intends for data consumers. `[I]`

**Two clauses in this same document point away from it, and Track H missed both:**

> **Restrictions (d)** … "*except as expressly permitted by any other terms of use
> on the FINRA Website*" `[V]`
>
> **Entirety.** "Nothing contained herein shall supersede, alter, or nullify the
> terms of any other agreements or policies for other FINRA products or services
> accessed through FINRA.org ('Other FINRA Terms'). **In the event of a conflict,
> between these Terms of Use and the Other FINRA Terms, the Other FINRA Terms shall
> govern.**" `[V]`

The site ToU therefore **defers, by its own text, to a product-specific licence.**
That licence exists, and it covers this dataset.

**Does it reach `cdn.finra.org`?** Genuinely ambiguous `[I]`. The scope names "the
FINRA.ORG site"; `cdn.finra.org` is a `finra.org` subdomain, but it is an S3/CloudFront
origin serving no HTML, no ToU link, no notice of any kind — verified: `server:
cloudflare`, `via: … cloudfront.net`, `x-amz-server-side-encryption` `[V]`. Against
that, the human-facing page that *publishes* those file URLs
(`/finra-data/browse-catalog/short-sale-volume`) states in its own Terms of Use
block: **"Data is free for non-commercial use. See Terms of Use"**, linking to
`/terms-of-use` `[V]`. A cautious reading treats the CDN files as covered.
**Assume covered.**

### 1.2 FINRA API Terms of Service — governs the Query API

**URL:** `https://developer.finra.org/finra-api-terms-service`
**"THESE TERMS OF SERVICE WERE LAST UPDATED ON MARCH 19, 2026."** `[V]`

> **§2 Order of Precedence.** "These Terms of Service (these 'Terms') include the
> API Program Terms and Specific Terms. In the event of a conflict among the
> foregoing, the order of precedence is as follows (in descending order of
> control): **Specific Terms**, these general terms, the API Program Terms." `[V]`

Specific Terms sit at the **top** of the stack. That matters, because the general
§3.3 restrictions read like the site ToU — until you read the preamble:

> **§3.3 Restrictions.** "***Except to the extent set forth in these Terms
> (including in the Specific Terms)***, Developer shall not … (a) transfer, sell,
> lease, license, sublicense, distribute … (b) … create derivative works …
> (c) use the Licensed Materials to create any algorithm, product, or service that
> competes with FINRA's products or services, (d) use any process **other than the
> Licensed APIs** to monitor or copy the Licensed Materials in bulk, or use any
> data mining, scraping, or harvesting tools (including robots) … or (e) access or
> use the Licensed Materials in a manner that would be typically categorized as a
> bulk distributor or a service bureau." `[V]`

Three things follow. **(1)** (a) and (b) are switched off wherever the Specific
Terms say otherwise — and for Equity Data they do. **(2)** (d) does not ban
automation; it bans automation *outside the API*. **(3)** (c) and (e) survive:
don't compete with FINRA, don't act as a bulk redistributor.

> **§3.6 Attribution.** "If any Specific Terms authorize Developer to publish or
> provide any other Person access to and/or use of the Licensed Data … or any
> Resultant Data, **including on a website or in a database or an application**,
> Developer shall identify FINRA as the owner and source of that Licensed Data" `[V]`

**The terms explicitly contemplate publishing this data on a website.** `[V]`

> **§1.6 "Resultant Data"** means "any data produced by Developer through processing
> Licensed Data, which data is substantially different from the original Licensed
> Data and which has been processed in a manner that third parties are unable to
> identify (through reverse engineering or otherwise) the Licensed Data from which
> the Resultant Data was derived." `[V]`

Note that a z-scored, percentile-ranked short-volume metric probably *is* Resultant
Data; a table of raw `ShortVolume/TotalVolume` per ticker probably is **not**.
It does not matter much here, because §2.3 below permits redistributing **both**.

### 1.3 Specific Terms for Equity Data — **the operative licence**

**URL:** `https://developer.finra.org/specific-terms-equity-data`
**"These Specific Terms were last updated on December 20, 2022."** `[V]`

**Coverage — this is the link that resolves the whole question:**

> **§1.1 Available Datasets.** "The Equity Data includes the following datasets:
> **All datasets in the 'otcMarket' dataset group**" `[V]`

Reg SHO daily short-sale volume **is** in that group. Verified two ways:
the FINRA Developer Center dataset page for "Reg SHO Daily Short Sale Volume"
lists group `OTCMarket` under the **Equity** category `[V]`; and a live
unauthenticated call to `POST https://api.finra.org/data/group/otcMarket/name/regShoDaily`
returned **HTTP 200** with CSV rows `[V]`. The fee matrix at
`developer.finra.org/fees` lists **"Reg SHO Daily Short Sale Volume"** by name
under **Query API → Equity** `[V]`.

**The grant, verbatim and in full:**

> **§2.2 Internal Use.** "Developer and its Authorized Users may access and use the
> Equity Data only for Developer's non-commercial personal or professional use." `[V]`
>
> **§2.3 Redistribution.** "Developer may redistribute the Equity Data **and any
> derivative data or Resultant Data** to third party end users ('End Users') for
> such End Users' non-commercial personal or professional use only, subject to the
> following:
> **(a) Attribution.** Developer shall clearly identify FINRA as the owner and
> source of that Equity Data including any derivative or Resultant Data derived
> therefrom.
> **(b) No Charge.** Developer may not charge or collect from an End User any fee
> for such End User's receipt and use of the Equity Data. For the avoidance of
> doubt, Developer may distribute Equity Data in conjunction with other fee-liable
> data distributed by Developer provided that there is no additional or incremental
> fee charged for the Equity Data.
> **(c) No Further Redistribution.** End Users shall not be permitted to further
> redistribute the Equity Data received from Developer.
> **(d) Compliance Efforts.** Developer shall take commercially reasonable efforts
> to ensure that End Users receiving Equity Data from Developer comply with the
> applicable terms and conditions set forth herein (for example, by requiring End
> Users to enter into agreements with Developer that require such compliance)." `[V]`
>
> **§2.4 Derivative Data/Resultant Data.** "Developer is permitted to create
> derivative data and Resultant Data." `[V]`
>
> **§6 Data Retention. "Not applicable."** — i.e. **no retention limit; you may
> keep it indefinitely.** `[V]`
>
> **§1.2 Permitted Developers.** "The Equity Data may only be accessed and used by
> Developers with valid Access Credentials for the Query API of the following
> types: **Public**, Firm or Organization." `[V]`

**This is a materially more permissive licence than the website ToU, exactly as the
task hypothesised.** Database-building: unrestricted. Derived analytics: expressly
permitted. Public display: permitted with attribution, free of charge, and a
downstream no-redistribution notice.

**One clause deserves a flag, because it is the reading most likely to be wrong:**
§3 of the Specific Terms reads **"Exceptions to Terms of Use. Not applicable."** `[V]`
The template's own §8 is "Other FINRA Terms. Not applicable." `[V]` The most natural
reading is that these slots mean *no additional exceptions or third-party terms
apply to this dataset* — not that the site ToU is silently reimported. But it is a
sentence with a plausible second reading, and it is the kind of thing a lawyer
should look at. `[I]` See §8.

---

## 2. robots.txt and rate-limit guidance

**robots.txt is a crawling convention, not a contract. Reported as evidence of
intent only — it grants nothing.**

| Host | robots.txt | Bearing on the regsho files |
|---|---|---|
| `cdn.finra.org` | **HTTP 403, `<Error><Code>AccessDenied</Code>` — no robots.txt exists** `[V]` | No crawl directives govern the CDN at all. A strict robots-exclusion reader (`403 ⇒ treat as disallowed`) would stop; the common convention (`no file ⇒ allowed`) would not. **Neutral-to-unhelpful — do not lean on it.** |
| `www.finra.org` | Present. Full directive list read `[V]` | **Nothing** under `/finra-data/*`, `/equity/*`, or any data path is disallowed. Disallows are CMS plumbing (`/core/`, `/node/*`, `/admin/`), investor-education pages, and a long PDF list. **No `Crawl-delay`. No `Sitemap`.** |
| `api.finra.org` | HTTP 404 (JSON error envelope) `[V]` | None. |
| `developer.finra.org` | Present, identical Drupal boilerplate `[V]` | Nothing data-related disallowed. |
| `data.finra.org` | **Does not resolve (NXDOMAIN)** `[V]` | The FINRA Data portal lives at `finra.org/finra-data`, not a separate host. Worth correcting in the brief. |

**Reading:** robots.txt shows **no intent to block automated retrieval of data
paths** `[I]`. It also cannot override the ToU's express robots prohibition — the
contract is stricter than the convention, and the contract wins.

**Published rate limits (Query API, `developer.finra.org/docs`) `[V]`:**
- Synchronous: **1,200 requests/minute per IP address**; max 5,000 records/request; 3 MB response body.
- Asynchronous: **20 requests/minute per dataset per API account**; max 100,000 records/request; unlimited payload.

**No published rate limit or acceptable-use guidance exists for `cdn.finra.org`.** `[V]`
Track C's "82 files concurrently, zero 429s" is consistent with that — the absence
of throttling is not permission, and the ToU's Restriction (f) specifically
anticipates people inferring otherwise. `[I]`

---

## 3. The official bulk / API / redistribution path

**It exists, it is free, and it covers this dataset.** `[V]`

From `developer.finra.org/fees` — the credential matrix, read directly:

| Credential | Cost | Who may create it | Reg SHO Daily Short Sale Volume? |
|---|---|---|---|
| **Public** | **$0/month** `[V]` | Firms, Organizations, **and Individuals** `[V]` | ✅ listed by name under Query API → Equity `[V]` |
| Mock / test | $0/month `[V]` | anyone | mock data only |
| Firm | **$1,650/month** + $250 per 10 GB overage `[V]` | FINRA member firms | — |
| Organization | **$1,650/month** + overage `[V]` | non-member organizations | — |

The Public credential page states: "The Public Credential Type can be used to
access publicly available data provided by FINRA including Equity and Fixed Income
data." `[V]`

**Account creation is required** — an Individual API account, credentials by email,
password reset within 1 hour, passwords expiring every 120 days `[V]`. **Not done
in this run** (hard constraint). → **Track K signup checklist: $0, ~10 minutes,
unlocks the only licensed public-display route for this dataset.**

**Redistribution path:** there is no separate "redistribution licence" product to
buy. §2.3 of the Specific Terms *is* the redistribution grant, and it is included
free with a Public credential. `[I]`

**Measured limitation — the reason this is not a pure win:**

| | CDN flat files | Query API (Public) |
|---|---|---|
| History | **2018-08-01 → today (8.1 yr)** `[V]`, Track C, boundary binary-searched | **~365-day rolling window** |
| Boundary measured today | 403 before 2018-08-01 `[V]` | rows for `2025-09-08`; **zero rows for `2025-09-02`, `2025-07-01`, `2025-06-02`, `2024-01-02`, `2020-01-02`, `2018-08-01`** `[V]` |
| Consolidation | pre-consolidated `CNMSshvol` | one row **per facility** — you sum `NQTRF`/`NCTRF`/`NYTRF`/`ORF` yourself `[V]` |
| Rows/request | whole day, ~12.2k symbols, one GET | 5,000 sync / 100,000 async `[V]` |
| Licence | restrictive | **permissive** |

The catalogue page confirms the window is by design: the interactive display
"contains up to 365 days of Daily Short Sale Volume" `[V]`.

---

## 4. The regulatory-mandate angle — investigated, and it does *not* rescue the CDN route

This was the most promising theory. It fails on the facts, for a specific reason.

**4.1 Why the data is published, verbatim from FINRA's own page:**

> "**Pursuant to a U.S. Securities and Exchange Commission request**, FINRA makes
> short sale trade data publicly available for off-exchange (*i.e.*, OTC) trades in
> exchange-listed securities reported to a FINRA Trade Reporting Facility (TRF) or
> the Alternative Display Facility (ADF)" `[V]`

An **SEC request**, not an SEC rule and not a statutory mandate. Publication began
2009-09-30 (monthly) and 2009-11-09 (daily) `[R]`. Regulation SHO governs the
*conduct* (marking, locates, close-outs); it does not compel this publication. `[I]`

**4.2 FINRA is not a government agency.** It is a private, non-profit
self-regulatory organisation. **17 U.S.C. §105 — which puts US Government works in
the public domain — does not apply to FINRA.** `[I]` This is the crux, and it is
why "regulator-published ⇒ public domain" fails here. Compare SEC EDGAR, which
*is* a federal agency work and *is* public domain.

**4.3 But the copyright FINRA actually holds is thin.** Under *Feist v. Rural
Telephone* (499 U.S. 340), **facts are not copyrightable**, and a compilation is
protected only in its original selection, coordination and arrangement — with the
"sweat of the brow" doctrine expressly rejected. A pipe-delimited file of
`Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market`, sorted by ticker,
is close to the *Feist* white-pages paradigm. `[I]` **The realistic exposure on the
CDN route is therefore contract (breach of the ToU you accepted by using the site),
not copyright infringement.** That is a real but different risk, and it is why "the
numbers aren't copyrightable" is not an answer. ⚖️ **Lawyer question.**

**4.4 A supportive fact, on the record:** FINRA's own description says the files
cover trades reported "**for public dissemination purposes** (*i.e.*, media-reported
trades)" `[V]`. Read in context that phrase describes the *trade-reporting* category,
not a licence grant — but it does sit awkwardly beside a site ToU banning display
and redistribution, and it is consistent with the far more permissive API licence
being FINRA's actual intent for data consumers. `[I]`

**4.5 Permissively-licensed republishers — searched, none found.**

| Candidate | Finding |
|---|---|
| **SEC / EDGAR / data.sec.gov** | Does **not** republish FINRA daily short-*volume*. The SEC's own short-sale product is **Rule 13f-2 / Form SHO** aggregates: monthly, institutional short *positions* (not off-exchange volume), individual filings **non-public**, only aggregates disseminated, first reports due Feb 2026 after exemptive relief `[R]`. Public domain as a US Government work `[I]` — but wrong cadence, wrong population, ~0 history. **Not a substitute.** |
| **Cboe DataShop — U.S. Equity Short Volume** | Cboe-exchange short volume, 2015→present. "the dataset is proprietary to Cboe Global Markets, and external redistribution of this data is strictly prohibited … external distribution of derived data is permitted subject to **additional licensing fees and use case approval**" `[R]`. **Strictly worse than FINRA's API licence.** |
| **Nasdaq Trader / NYSE FTP** | Nasdaq publishes short *interest*, not daily short volume; the daily short-volume files it points to **are FINRA's** `[R]`. Track C separately measured `ftp.nyse.com/ShortData/NYSEshvol/` → **404** `[V]`. Dead end. |
| **Kaggle mirrors** (`saakethkoka/finra-short-volume-data`, `denzilg/finra-short-volumes-us-equities`, `meicher/finra-short-interest-w-close-price`) | Exist `[R]`. **Uploader-asserted licences on data the uploader did not own.** A third party cannot grant rights FINRA never gave them. **Provides no cover whatsoever — do not use as a licence laundry.** `[I]` |
| **data.gov / academic open-data portal** | No FINRA daily short-volume dataset found `[V, negative]`. |

**Conclusion of §4: there is no permissive upstream. The permissive path is FINRA's
own API licence, and it is the only one.**

---

## 5. The three practical questions, answered separately

### (a) Collect + store for a private, single-user trade journal, nothing published

| Route | Answer |
|---|---|
| **Query API + Public credential** | ✅ **Clean yes.** §2.2 grants exactly "non-commercial personal or professional use"; §6 imposes no retention limit; §2.3 is not even engaged because nothing is redistributed. This is the licence's core use case. `[V]` |
| **CDN flat files** | ⚠️ **The use is fine; the method is not.** Nothing in the site ToU forbids a single trader looking at this data for their own trading. Restriction (e) (robots/harvesting) and (d) (database) forbid *how you would get and keep it*, and (m) — the ML/predictive-analytics clause — arguably reaches the journal's hypothesis-testing itself. `[V]` |

**Practical:** the private-journal use case is **not blocked**, which means the
sentiment study's core deliverable survives intact. **Cautious reading:** get the
free credential and stop touching the CDN on a schedule. `[I]`

### (b) Display aggregate derived metrics on a free public website

| Route | Answer |
|---|---|
| **Query API + Public credential** | ✅ **Permitted**, and §3.6 names "on a website" explicitly. Four conditions, all satisfiable: |
| | **1. Attribution** — a visible "Short-sale volume data © FINRA. Source: FINRA." on every page/panel that shows it. Not a footer afterthought; §2.3(a) says "clearly identify". |
| | **2. No charge** — tapereader.us is free today. ⚠️ **This is the single condition most likely to break later.** Ads, a Pro tier, or a paywall anywhere near this data re-opens both §2.3(b) and the §2.2 "non-commercial" limit. Decide now that this dataset is permanently free-tier-only. |
| | **3. No further redistribution by end users** — TapeReader's site terms need a clause saying visitors may not redistribute FINRA data or FINRA-derived data obtained from the site. **New work item; the site has no such clause today.** |
| | **4. Commercially reasonable compliance efforts** — the §2.3(d) example is "requiring End Users to enter into agreements". For a public site, published terms of use + no bulk-export/API endpoint exposing the raw series is a defensible reading of "commercially reasonable". ⚖️ *Shipping a public JSON endpoint that dumps the whole panel is the version that looks like §3.3(e) "bulk distributor" — don't.* `[I]` |
| **CDN flat files** | ⛔ **No.** Copyright §b forbids display and distribution absent written consent; Permitted Uses caps it at your own personal use. Track H's verdict stands, unmodified. `[V]` |

**Also surviving on the API route:** §3.3(c) — do not build "any algorithm,
product, or service that competes with FINRA's products or services." A breakout
scanner does not compete with a regulator. `[I]`

**Genuinely ambiguous, stated plainly:** whether an unrestricted-audience public
website counts as redistribution to "End Users" for "non-commercial personal or
professional use." The terms neither define End User nor require you to verify each
one's purpose, and §3.6's "including on a website" strongly implies open web
publication was contemplated `[V]`. But a public site cannot *know* its readers'
purposes, and a hedge fund reading your chart is arguably a commercial end user.
**Our reading: permitted. Confidence: moderate, not high.** ⚖️

### (c) Automated daily collector vs manual retrieval

| | CDN | Query API |
|---|---|---|
| **Automated daily** | ⛔ Restriction (e) bans harvesting tools and robots outright; (f) bans bypassing volume/frequency limits. Track C's 12-way concurrent 82-file pull is the paradigm case of what (e) describes. `[V]` | ✅ §3.3(d)'s "any process **other than the Licensed APIs**" wording makes API automation the sanctioned path. 1 call/day against a 1,200/min budget. `[V]` |
| **Manual retrieval** | ⚠️ Occasional hand-download for personal use is within *Permitted Uses*; a "manual" habit that reconstructs 8 years of history is (d) database-building by another name. **Do not treat "manual" as a loophole.** `[I]` | ✅ n/a — no reason to. |

---

## 6. If you conclude (b) is too risky — the alternatives

Ranked. **Honest headline: there is no better-licensed daily short-volume source at
any price the project would pay.**

| # | Source | Cost | Terms for public display of derived analytics | Verdict |
|---|---|---|---|---|
| 1 | **FINRA Query API, Public credential** | **$0** `[V]` | ✅ expressly permitted, attribution + free + no-further-redistribution | **Recommended.** Nothing else is close. |
| 2 | SEC Form SHO aggregates (Rule 13f-2) | $0 | ✅ US Government work → public domain `[I]` | Monthly, institutional positions, first data 2026 `[R]`. Clean licence, useless properties. **Context only.** |
| 3 | Cboe DataShop U.S. Equity Short Volume | paid | ⛔ redistribution "strictly prohibited"; derived distribution needs **additional fees + use-case approval** `[R]` | **Worse than FINRA on both axes.** Cut. |
| 4 | Quiver Quantitative | from **$30/mo** `[R]` | resells FINRA off-exchange data | 3× the ≤$10 cap, **and** its upstream is #1, free. Cut (Track C already cut it). |
| 5 | Nasdaq / NYSE exchange files | $0 | NYSE path 404s `[V]`; Nasdaq's daily short-volume pointer is FINRA's own `[R]` | Dead end. |
| 6 | Kaggle mirrors | $0 | ⛔ uploader-asserted licence on data they don't own `[I]` | **Never.** |

**Comparable positioning data with clean public-display terms — the honest fallback
if FINRA is dropped entirely:** the study already has one, and it is the cleanest
source in the whole run — **Wikipedia pageviews, CC0** `[V]` (per `09-legal-tos.md`
§10.2): no attribution required, no redistribution restriction, no commercial
restriction, no retention limit. It measures attention rather than positioning, so
it is not a substitute — but it is the only crowd series in this study with *zero*
licensing overhead, and Track F's public surface can be built on it alone.

---

## 7. Recommendation to Track I (build plan)

**Do not build a collector against `cdn.finra.org`.** Three options for the history
problem, in preference order:

1. **API-only, forward-accruing (recommended).** Free Public credential; nightly
   `POST /data/group/otcMarket/name/regShoDaily` filtered to the trade date; sum the
   per-facility rows into a consolidated `TotalVolume`/`ShortVolume` yourself. Gives
   ~365 days on day one and grows. **Fully licensed for both (a) and (b).** Costs
   the 8-year backfill.
2. **Split-licence build (defensible, needs discipline).** API series for anything
   the public site displays; CDN backfill, if used at all, **private-journal-only,
   never rendered publicly, retrieved once by hand rather than by a scheduled job.**
   This still sits against Restrictions (d)/(e) and should not be a workflow. `[I]`
3. **Ask FINRA.** `finra.org/contact-finra/permission-use-finra-copyrighted-material`
   is the documented route for written consent `[V]`, and the Support Center
   (800-321-6273) is listed on the dataset page `[V]`. A one-paragraph email asking
   whether a free personal site may display derived metrics from the CDN files, and
   whether historical files may be retrieved for backfill, is **free, low-effort,
   and converts the whole ambiguity into a written answer.** Highest value per
   minute of anything in this document. → **Track K.**

**Concrete work items this creates:**
- Track K: create a **free Individual/Public API account** at developer.finra.org ($0, ~10 min).
- Track K: send the FINRA permission email (option 3).
- Track F/I: FINRA attribution string rendered wherever the data appears.
- Track F: add a no-further-redistribution clause to tapereader.us site terms.
- Track F: **no public endpoint that dumps the raw panel** (§3.3(e) bulk-distributor risk).
- Track G cost ladder: FINRA short volume sits at **Rung 0 ($0)** — the *licensed* route is free. The Firm/Organization tier at **$1,650/mo** is Rung 4 and buys nothing this project needs.
- `13-open-questions.md` item 4: **resolved** — supersede the "private-journal-use candidate, not a public-surface source" holding with the route split above.

---

## 8. What warrants real legal review

Ranked by how much rides on it. **We are not lawyers; each of these is a place
where a careful reading could go the other way.**

1. **Does a free, unrestricted-audience public website qualify as §2.3
   redistribution "to End Users for non-commercial personal or professional use"?**
   The entire (b) answer rests on yes. §3.6's "including on a website" is strong
   support `[V]`; the absence of any End User definition or purpose-verification
   duty is the weak point. ⚖️ **Highest stakes.**
2. **Specific Terms §3 "Exceptions to Terms of Use. Not applicable."** We read the
   template slots (§3–§8, all "Not applicable") as "no *further* exceptions or
   third-party terms attach to this dataset." A reading that the site ToU is
   thereby reimported would flip (b) and (c) back to blocked. ⚖️ **Highest
   probability of being where we are wrong.**
3. **What "commercially reasonable efforts" (§2.3(d)) means for a public website**
   whose readers sign nothing. Published site terms may or may not suffice.
4. **Whether `cdn.finra.org` is inside "the FINRA.ORG site."** Only matters if
   option 2 or 3 above is pursued. Our recommendation routes around it.
5. **Whether *Feist* thinness matters at all** when the exposure is contract rather
   than copyright. Our read: it does not help much. `[I]`
6. **Restriction (m)** (ML / predictive-analytics prohibition) in the site ToU has
   no API-terms counterpart. If any argument put the site ToU back in play, this
   clause reaches the study's hypotheses directly. `[V]`

---

## 9. Sources

All fetched **2026-09-08** unless noted.

| Document | URL | Version date |
|---|---|---|
| FINRA Terms of Use | `https://www.finra.org/terms-of-use` | Last modified **2023-11-09** `[V]` |
| FINRA API Terms of Service | `https://developer.finra.org/finra-api-terms-service` | Last updated **2026-03-19** `[V]` |
| **Specific Terms for Equity Data** | `https://developer.finra.org/specific-terms-equity-data` | Last updated **2022-12-20** `[V]` |
| Fee structure / credential matrix | `https://developer.finra.org/fees` · `/fees/public` | live `[V]` |
| API documentation (rate limits, accounts) | `https://developer.finra.org/docs` | live `[V]` |
| Reg SHO Daily dataset page (group = OTCMarket, Equity) | `https://developer.finra.org/docs/reg-sho-daily-short-sale-volume` | live `[V]` |
| Short Sale Volume catalogue ("Data is free for non-commercial use"; SEC request; 365 days) | `https://www.finra.org/finra-data/browse-catalog/short-sale-volume` | live `[V]` |
| Daily Short Sale Volume Files (CDN URL pattern; 6:00 pm ET) | `https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data/daily-short-sale-volume-files` | live `[V]` |
| robots.txt | `www.finra.org` `[V]` · `developer.finra.org` `[V]` · `api.finra.org` 404 `[V]` · `cdn.finra.org` **403, none** `[V]` · `data.finra.org` **NXDOMAIN** `[V]` | — |
| Live API probe (`regShoDaily`, unauth 200; 365-day window boundary between 2025-09-02 and 2025-09-08) | `https://api.finra.org/data/group/otcMarket/name/regShoDaily` | measured `[V]` |
| CDN header probe (`last-modified`, CloudFront/S3 origin) | `https://cdn.finra.org/equity/regsho/daily/CNMSshvol20260904.txt` | measured `[V]` |
| Cboe short-volume redistribution terms | `https://datashop.cboe.com/us-equity-short-volume-report` | `[R]` (search summary; not fetched directly) |
| SEC Rule 13f-2 / Form SHO | SEC final rule 34-98738 and law-firm summaries | `[R]` |

**Not done, per hard constraints:** no account created, no credentials entered, no
purchase, no bulk archive built. The single live API probe and the CDN `HEAD` were
metadata-only observations of already-public endpoints.
