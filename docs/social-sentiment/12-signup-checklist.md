# 12 — Morning Checklist

**As of:** 2026-09-09 (written overnight 2026-09-08/09)
**Track:** K · **Status:** complete · **Read this first. It stands alone.**
**Evidence tags:** `[V]` verified on the source's own material or measured live ·
`[R]` reported by third parties · `[I]` our inference

---

## ✅ Nothing is on fire

> **Nothing broke overnight. Nothing is running that shouldn't be. Nothing costs
> money. Nothing is public.**
>
> - **The collector took its first real capture** at **2026-09-08 21:00 ET** `[V]`.
>   2,078 rows across 6 ApeWisdom filters, written to
>   `data/social/apewisdom/2026/2026-09-08.ndjson`, slot `evening`. 494 KB raw /
>   46 KB gzipped. **Idempotency verified** — an immediate re-run in the same slot
>   wrote 0 rows and skipped 2,078 `[V]`. You cannot double-count by re-running it.
> - **It is NOT on a schedule.** The cron block in
>   `.github/workflows/social-ingest.yml` is deliberately commented out. It only
>   runs when you press the button. **That is the one thing on this page with a
>   deadline — see Decision 1.**
> - **Polygon news sentiment already works on the key you hold.** `[V]`
>   `/v2/reference/news` returns HTTP 200 with a populated per-ticker `insights`
>   object (`sentiment` + a free-text `sentiment_reasoning`). 370 articles for a
>   single weekday in **one call**. Coverage of `insights` is 100% from mid-2024
>   onward — **your entire journal can be backfilled with news sentiment for $0,
>   with no signup.** Nothing to do this morning; this is just good news.
> - **No account was created and no credential was entered anywhere last night.**
>   That was a hard constraint. Everything below that needs a human is here.
> - **Nothing was deployed. tapereader.us is unchanged.**
>
> **The honest shape of this list: it is short on signups and heavy on decisions.**
> Almost everything worth having turned out to be keyless. Two of the four
> decisions below are worth more than every signup on the page combined.

### If you only have 5 minutes

Do **Decision 1** (turn the cron on — 2 minutes, and it is the only irreversible
clock on the page) and **Decision 2** (open the Google Sheet's share dialog and
look — 3 minutes). Everything else can wait a week with no cost.

---

# 1. THE DECISIONS

Ranked by consequence. Each has a recommendation. These matter more than the
signups.

---

## 🔴 Decision 1 — Turn the collector's cron on. **Recommendation: YES, today.**

**Time: 2 minutes (+ one check, below). Cost: $0.**

### Why this is first

**ApeWisdom exposes no retrievable history** `[V]`. There is no `date` parameter
and no archive — `?date=` silently returns the current payload. **Every day the
job does not run is a day of crowd-attention data that cannot be bought back at
any price, from anyone, at any budget.** The whole research run confirmed this:
the cheapest thing money can buy that recovers uncollected social history is a
Finnhub premium quote (unpriced, `[R]` $11.99–$99.99/mo) and even that is
per-symbol, not universe-wide.

Every other item on this page can wait a month with zero loss. This one cannot
wait a day.

### The exact change

- [ ] **Edit `.github/workflows/social-ingest.yml`, lines 41–45.** Remove the
      `# ` prefix from five lines so the block reads:

```yaml
  schedule:
    - cron: '15 13 * * *'   # 09:15 ET  premarket   <- the signal-bearing slot
    - cron: '30 16 * * *'   # 12:30 ET  midday
    - cron: '5  20 * * *'   # 16:05 ET  prior_close
    - cron: '0  0  * * *'   # 20:00 ET  evening
```

- [ ] **Push.**

### ⚠️ Two gotchas that will silently make this do nothing

1. **GitHub only runs `schedule:` triggers on the repository's DEFAULT branch**
   `[R] — GitHub's documented behaviour; confirm it before you trust the job`.
   The collector currently lives on `social-sentiment-research`. **Uncommenting
   the cron on that branch will produce exactly zero runs and no error message.**
   Before you consider this done, either merge the workflow + script to `main`,
   or verify a scheduled run actually fired. **Check the Actions tab tomorrow
   morning and confirm you see four runs, not zero.** Do not assume.
2. **The UTC times are correct for EDT (Mar–Nov) and land one hour early during
   EST** `[V] — noted in the workflow's own comments`. In November the 09:15 ET
   pre-market cut becomes 08:15 ET. Either accept the drift (it is a rolling
   24 h window, so the damage is small) or split into two schedule blocks later.
   **Do not let this stop you turning it on today** — an hour of drift is
   infinitely better than a gap.

### What happens if you do nothing

The collector holds exactly one snapshot — the evening of 2026-09-08 — and
accrues nothing further. **The pre-registration's clock (`05-preregistration.md`)
does not start.** Every horizon in it (`~Jul 2027` for a large effect at 18
analyzable trades/month) slips day-for-day with every day the job stays off. This
is the only item on the page where inaction has a permanent, unrecoverable cost.

### Storage, so it doesn't surprise you later

Measured at **66 MB/year gzipped** across all six filters `[V]` — six times the
original estimate, which had covered one filter. That is acceptable in a git repo
but it compounds. **Do not tune it this morning.** If it ever matters, the
options are: keep only `all-stocks` + `wallstreetbets`, or store only changed
rows. **Do not pre-filter to `mentions >= 2`** — the single-mention rows are the
entire fresh-discovery population that hypothesis H3 is about.

---

## 🔴 Decision 2 — Check who the Google Sheet is shared with. **Recommendation: check it this morning; almost certainly fine; fix in 60 seconds if not.**

**Time: 3 minutes. Cost: $0.**

### The finding, stated plainly

This is **the only genuinely live licensing exposure the whole run found.**

- Your Polygon/Massive key is on an **individual (`personal`) licence** `[V]`.
  Every individual plan — free through the $199/mo Advanced tier — is `personal`;
  only business plans ($1,599–2,499/mo) are `commercial` `[V]`.
- The market-data terms bar a subscriber from **"furnishing Market Data to any
  other person or entity"** `[V]`.
- **The web app is clean.** `/pct-bootcamp/trade-journal` returns 302 to
  Cloudflare Access `[V]` — gated, single-user, squarely inside the individual
  licence. The alarming version of this finding is false.
- **The spreadsheet is not covered by Cloudflare Access.** The journal writes
  Polygon-derived columns (VIX, PDC/PDH/PDL, ATR, ADR, O/H/L/C/V, %Gap, RVOL and
  the rest) into a Google Sheet that `CLAUDE.md` describes as **shared** `[V]`.

**If nobody but you can open that sheet, there is no issue and you are done.**

- [ ] Open the journal spreadsheet → **Share** → read the access list.
- [ ] If it is "Anyone with the link", or if any other person has view access:
      **restrict it to your own account.** That is the entire fix.
- [ ] If other people genuinely need to see it, share a **derived view that
      carries no Polygon-sourced columns** (your own P&L, R, setup, notes are
      yours; the market-data enrichment columns are not).

### While you are in the neighbourhood — the second, softer exposure

**Confirm your Massive/Polygon account is still flagged Non-Professional** `[V]`.
Massive **retroactively bills the professional/non-professional difference to the
card on file**. Nothing in this run suggests your status has changed; it costs
one page-load to look, and the failure mode is a surprise charge, not a takedown.

- [ ] Log in to massive.com → account/subscription → confirm Non-Professional.

---

## 🟠 Decision 3 — What to do with the market-scans product. **Recommendation: keep it private behind Cloudflare Access now; send the Tiingo email; decide properly in a month.**

**Time: 5 minutes to decide. Cost: $0 today.**

### The finding

`docs/market-scans/phase-1-spec.md` is a fully-designed, unbuilt product that
publishes Polygon-derived daily bars, breadth aggregates and scan hits publicly
on tapereader.us. **It cannot ship publicly on Polygon/Massive data.** `[V]`

Verified on the terms text, not inferred: Massive prohibits public display **and**
redistribution across three independent clauses, one naming public display and
websites explicitly, with **no reconstruction carve-out** `[V]`. **Breadth
aggregates and the movers table fail together — there is no licence-safe subset
of the current spec.** Paying more on the consumer ladder buys rate limit and
history, not licence scope.

**This predates the sentiment study entirely and surfaced here by accident. It is
a data-supply problem, not a design problem** — the scan formulas, D1 schema,
free-tier pacing and Actions ingest are all supplier-agnostic. What changes is
one adapter.

### Your four options, cheapest first

| Option | Cost | What you get | Honest read |
|---|---|---|---|
| **A. Ship it private, behind Cloudflare Access** | **$0** | The whole spec, for you, today. Same posture the journal already has. | **Recommended now.** Zero licensing risk, zero delay, and it is the version you would actually use daily anyway. |
| **B. Switch supplier to Tiingo** | **$30/mo** (Power) | Tiingo's ToS §1.6(c) expressly permits distributing derived products, listing *"aggregated statistics calculated across multiple instruments"* as a permitted example `[V]` — that describes the breadth page exactly. The **movers table is still excluded** (§ bans "tables … that display or permit extraction"). | **The most promising route, but blocked on one unresolved clause.** §7.3 says API data is "internal consumption only", in real tension with §1.6(c). **Cannot be resolved from the text.** → Send the Tiingo email (§4). Free tier forbids persistent storage entirely, so $30/mo is the floor. |
| **C. Switch to Databento DBEQ** | ~$199/mo | DBEQ bundle carries **$0 exchange licence fees** and is described as free to license for distribution and display, "ideal for web apps" `[V]`. Exchange side is settled and free. | Vendor-side rights at the $199 Standard tier are unclear (Plus at $1,750/mo advertises "external distribution rights" as a differentiator). Worth one email; $125 signup credit makes evaluation free. |
| **D. Buy a confirmed public-display licence** | **$499/mo** | Twelve Data Venture — **the cheapest CONFIRMED self-serve public-display licence found anywhere in the survey** `[V]`. | Wildly outside a $0–10 study budget. Named to mark the ceiling. **Nothing at $0–10/mo permits public display, from any vendor. No exception found.** |
| **E. Shelve it** | $0 | — | Only if you conclude the public site isn't the point. |

### Recommendation

- [ ] **Take option A today** — one line in the spec saying the Phase-1 surface
      ships behind Cloudflare Access, same as the journal.
- [ ] **Send the Tiingo email** (draft in §4). It is free, takes 3 minutes, and a
      "yes" moves a public breadth page down to **$30/mo**, which is the single
      cheapest possible unlock of the entire plan.
- [ ] **Do not spend anything this month.** Nothing about A is wasted work if the
      Tiingo answer comes back favourable — it is one adapter swap.

**Nothing needs a lawyer today.** Nothing is shipping, and the journal was never
at risk.

---

## 🟠 Decision 4 — Is the ETF-heavy May sample representative of how you trade now? **Only you can answer this. Recommendation: answer it before any more design work.**

**Time: 5 minutes of honest reflection. Cost: $0.**

### Why you are being asked

The entire power analysis in `05-preregistration.md` turns on this one fact.

Measured from your May 2026 export, n = 36 trades over 12 dates `[V]`:

- **18 of 36 trades (50%) are index/sector ETFs** — QQQ 7, SPY 6, SOXL 5 `[V]`.
  These carry **no usable ticker-level retail-attention signal** — they are either
  absent from mention lists or pinned at a constant — so they are excluded from
  hypotheses H1–H4 by construction.
- Within the surviving 18, **NVDA is 6 (33%)** `[V]`, and NVDA sits permanently
  pinned at the top of every mention list, so attention-percentile features have
  almost no variance on it.

**Consequence:** analyzable accrual is **~18 trades/month, not ~35.** At that
rate, detecting a *large* effect (Cohen's *d* = 0.5, ≈ 0.75 R of MFE between the
top and bottom attention bucket) needs N ≈ 188 → **~July 2027** `[V, computed]`.
A moderate effect (*d* = 0.3) needs N ≈ 523 → **~February 2029**. The effect size
the published literature actually reports needs **2032–2041** — which is a polite
way of saying never.

### The question

- [ ] **Was May 2026 typical, or unusual?**

**If May was typical (you still trade ~50% index ETFs):** the trade-level
correlation study is close to hopeless on any horizon worth planning around. The
right move is to **put the effort into the universe-level scan (H5/H6) instead**,
where the panel is not conditioned on your selection at all and N is thousands of
symbol-days rather than tens of trades. That is not a failure — it is a much
better use of the same data.

**If May was unusual and you now trade mostly single names:** the arithmetic
improves roughly 2×, pulling the large-effect horizon toward early 2027. **It
still does not rescue small effects.** Do not let a better answer here talk you
into believing the trade-level study is well-powered; it is only less badly
powered.

**Either way, do not change the pre-registration to fit the answer you want.**
Write your answer down with today's date, then leave the buckets alone.

### Two related data-quality facts, since they need you and nobody else

- [ ] **`Catalyst` is 100% blank across the whole export** `[V]`. Not a caveat —
      a blocker for any catalyst-conditioned analysis. This is why the SEC EDGAR
      auto-population idea (keyless, free, 2001→present, exact ticker resolution
      via CIK `[V]`) is worth more than it looked. **Decide whether you will
      start filling it by hand, or wait for auto-population.**
- [ ] **`Conviction (1-3)` is 61% blank** `[V]`. Usable as a covariate, never as
      a stratifier. Filling it takes seconds per trade in the Morning Plan form.

---

## 🟡 Decision 5 — Do you want the licensed FINRA route, or nothing? **Recommendation: create the free account, ~10 min, but only if you intend to build on it.**

**Time: 10 minutes. Cost: $0/month.**

This is a signup, but the decision comes first, so it sits here.

FINRA daily short-sale volume exists behind two different doors with **opposite
licences** `[V]`:

- **`cdn.finra.org` flat files** — 8.1 years of history, keyless, same-day at
  ~17:20 ET, 12.2k symbols. Governed by the site Terms of Use, which ban
  harvesting, database-building, display and redistribution, **and include a
  clause prohibiting use with predictive analytics models** — which describes
  this study's hypotheses almost verbatim `[V]`. **Do not build a collector
  against this.**
- **The Query API** (`api.finra.org/data/group/otcMarket/...`) — governed by the
  *Specific Terms for Equity Data*, which **expressly permit derivative data,
  permit redistribution of derived data to end users with attribution, impose no
  retention limit, and explicitly contemplate publishing on a website** `[V]`.
  **Cost: $0.** Requires a free Individual/Public credential.

**The catch that decides it: the API is a 365-day rolling window** `[V]`. The 8.1
years exist only on the blocked CDN. So the licensed route **accrues forward with
no backfill** — the same urgency class as ApeWisdom, but with a year of runway
instead of none.

**Also relevant to whether it is worth your time:** the empirical result on short
volume was honestly null. Short-volume ratio vs next-day return measured
**r = −0.0035** `[V]` — no univariate edge. There was a monotone breakout-day
tercile gradient (+1.41% / +3.54% / +6.37%) on **n = 14 per bucket** `[V]`, which
is a hypothesis, not a result.

**Recommendation:** create the free account (§3, item 2) **only if** you intend to
run the conditional test properly on the accruing series. If short volume is not
something you would look at, skip it — a year of runway means this can wait.

---

# 2. THE SIGNUPS

**Ranked. Every one is free.** The research found nothing between $0 and $19.99
worth buying in this whole category, and **nothing at any price under ~$100/mo
that buys back history you have not collected.** `[V]`

---

## Signup 1 — Alpha Vantage (free tier) · **the one genuine candidate**

**Time: ~5 minutes · Cost: $0/month · Priority: do it this week, not necessarily
today.**

- [ ] Sign up at `alphavantage.co/support/#api-key` (email address, no card `[R]`).

### What it unlocks

The **only continuous per-ticker sentiment float and per-ticker relevance float**
available free anywhere in the survey `[V]`. Polygon (which you already have)
gives a three-way label — `positive`/`negative`/`neutral`. Alpha Vantage gives:

- `ticker_sentiment_score` — a float, with published bands
  (`≤ −0.35` Bearish … `≥ 0.35` Bullish) `[V]`
- `relevance_score` — a float `0 < x ≤ 1`, **measured min 0.52 / max 1.00 /
  mean 0.789** across 50 live AAPL articles `[V]`. This is the more valuable of
  the two: it is exactly the field that discards "AAPL mentioned in passing in a
  market-wrap" articles that would otherwise dominate any per-ticker aggregate.
- A **15-value `topics` vocabulary** (`earnings`, `ipo`,
  `mergers_and_acquisitions`, `financial_markets`, …) `[V]` — **the cleanest
  catalyst signal of any vendor in the field**, and a direct feed for your 100%-
  blank `Catalyst` column.

Verified live on the public `demo` key: HTTP 200, 0.24 s, 50 items, 3.1 tickers
tagged per article, a genuine sentiment distribution (not a bullish constant) `[V]`.

### The binding constraint

**25 API requests per day** `[V]`, stated identically on two Alpha Vantage pages.
No per-minute cap published. **The next tier up is $49.99/mo — 5× over your cap,
with nothing in between** `[V]`.

**25/day is survivable, because the unit of work is a symbol, not a day.** One
request with `tickers=XYZ&time_from=…&time_to=…&limit=1000` returns up to 1,000
articles over an arbitrarily long window. So:

- **Backfill:** ~50-symbol journal universe in **2 days**; 200 symbols in ~8 `[I]`.
- **Steady state:** the day's traded/watchlist symbols — typically well under 25 `[I]`.
- **What breaks:** anything universe-wide and daily. You cannot score 4,174 liquid
  names/day on 25 requests. **This is a journal-enrichment source, not a scanner
  source.**

### Exactly where the key goes

- **For journal enrichment (the Next.js edge routes):** Cloudflare Pages dashboard
  → your Pages project → **Settings → Environment variables → Production** → add
  **`ALPHAVANTAGE_API_KEY`**. Same place `POLYGON_API_KEY` and
  `GOOGLE_SERVICE_ACCOUNT_JSON` already live `[V] CLAUDE.md`.
- **For a scheduled collector (GitHub Actions):** GitHub repo → **Settings →
  Secrets and variables → Actions → New repository secret** → same name. Then
  reference it as `ALPHAVANTAGE_API_KEY: ${{ secrets.ALPHAVANTAGE_API_KEY }}`
  under the step's `env:`, exactly as `.github/workflows/market-ingest.yml`
  already does for `POLYGON_API_KEY` `[V]`.
- **Do not put it in `web/wrangler.toml`** or any committed file.

### Two things to measure on day one with the real key

- [ ] **The true history floor.** It is **nowhere stated in the docs** `[V] — a
      real gap`. Their own example uses `time_from=20220410T0130` and third-party
      accounts place the archive start in 2022 `[I]`. **Fire one request with
      `time_from=20200101T0000&sort=EARLIEST` and read the oldest
      `time_published` you get back.** If the floor is shallower than your
      journal, Alpha Vantage drops from "strong #2" to a forward-only source and
      is worth much less.
- [ ] **The ToS.** It is served as a **PDF that could not be parsed in this run**
      — a recorded dead end `[V]`. Redistribution posture is therefore **unknown,
      not cleared.** Their definition of "commercial use" reportedly covers *any
      purpose beyond activities that are private and individual in nature* `[V]`,
      which would defeat the "free site = non-commercial" argument. **Treat it as
      journal-only until you have read the PDF yourself.**

---

## Signup 2 — FINRA Individual / Public API credential

**Time: ~10 minutes · Cost: $0/month · Priority: only if Decision 5 was yes.**

- [ ] Register at `developer.finra.org` → **Individual account, Public credential
      type** ($0/month, available to individuals `[V]`).
- [ ] Credentials arrive by email. **Note: passwords expire every 120 days** `[V]`
      — put a reminder somewhere, or the collector dies silently in four months.

**What it unlocks:** the **only licensed public-display route** to daily
short-sale volume `[V]`. The Specific Terms for Equity Data permit derived data,
permit redistribution to end users **with attribution**, impose no retention
limit, and contemplate website publication. Rate limit 1,200 req/min; 5,000 rows
sync / 100,000 async per request `[V]`.

**Where the key goes:** GitHub Actions repo secrets (`FINRA_API_CLIENT_ID` /
`FINRA_API_CLIENT_SECRET`) for the nightly collector. It does not need to be in
Cloudflare at all unless a public page reads it live — and it shouldn't; precompute.

**Two build constraints, so you don't discover them later:**
- The API returns **one row per facility** (`NQTRF`/`NCTRF`/`NYTRF`/`ORF`) — you
  sum them yourself into a consolidated total `[V]`. The CDN files were
  pre-consolidated; the API's are not.
- **365-day rolling window, no backfill** `[V]`. Start it and it grows.

**Two clauses that genuinely warrant legal review before anything ships publicly
on this** `[I]`: whether a free public site counts as redistribution "to End Users
for non-commercial personal or professional use", and whether the Specific Terms'
*"Exceptions to Terms of Use — Not applicable"* means no exceptions attach (our
reading) or reimports the restrictive site ToU (which would flip the public answer
back to blocked). **That second one is the likeliest place this is wrong.** The
free email in §4 converts it into a written answer.

---

## Signup 3 — Alpaca (free account) · **only if you ever want to score text yourself**

**Time: ~10 minutes · Cost: $0 · Priority: low. Skip today.**

**What it unlocks:** raw news text back to **2015**, Benzinga-tagged tickers, no
sentiment score `[V]`. Its whole value is being a **raw-text corpus** for the day
you want to run your own scoring model rather than inherit a vendor's
unreproducible label.

**Why it is low priority:** you do not need it yet. Polygon (held) and Alpha
Vantage (Signup 1) both give pre-scored per-ticker sentiment for free, and neither
requires you to build a model. **Revisit only if you find yourself distrusting
both vendors' labels.** Terms are non-professional, *"shall not furnish Market
Data to any other person or entity"* `[V]` — journal-only, like Polygon.

---

## ⛔ Deliberately NOT recommended

Each of these was researched and rejected for a stated reason. **Recorded so you
do not re-research them.**

| Not doing | Why not |
|---|---|
| **X / Twitter API — any tier** | **There is no free read allowance anywhere on the pricing page** `[V]`. At $10/mo you get **~95 posts/day**, which is worse than nothing `[V]`. Legacy Basic ($200/mo) closed to new signups Feb 2026; legacy Pro ($5,000/mo) deprecated 2026-08-14 `[R]`. **The only ≤$10 path is an Apify actor at ~1,200 tweets/day, and it needs an account and a card.** Deferred, not night-one. |
| **StockTwits — developer registration** | **It is closed.** The developer portal is a single frozen page (footer **"© 2021"**) and `/developers/docs`, `/developers/docs/api`, `/developers/api-terms` all return **404 live** `[V]`. There is nothing to sign up for. **And the closed door is not hiding a better deal** — the last API terms ever published (2019, now 404) were *worse* than the site ToS: a 30-day retention cap, no redistribution, and an express ban on creating **or displaying** "sentiment information … or any summaries" `[V]`. See the email in §4 — that is the only move available. |
| **YouTube Data API** | **Structurally disqualified, not merely expensive.** Developer Policies require stored API text to be **deleted or refreshed after 30 days** `[V]`. A source that must forget faster than a three-month study needs to remember is not a source. **This is not a cost question and no budget fixes it.** |
| **TikTok Research API** | Eligibility-gated to academics; **commercial users explicitly ineligible** `[V]`. A gate, not a price. |
| **Finnhub (for social sentiment)** | **Every 2026 listicle claiming this is free is stale** `[R]`. Finnhub's own embedded API spec: `/stock/social-sentiment` → `"premium": "Premium required."` `[V]`. Keyless returns 401. **Do not put it on a checklist as a free win.** A *price quote* is worth asking for (§4, optional) because hourly replayable per-symbol history is the only thing that buys back uncollected time — but the account itself buys nothing. |
| **SwaggyStocks** | **No public API at all** — every route on `api.swaggystocks.com` returns `Cannot GET /...`, and the page is server-rendered with **zero client-side XHR**, verified by driving a real browser and reading the network log `[V]`. Top 15 tickers free, everything else behind a login wall. You would be scraping HTML to get a narrower, less transparent version of what ApeWisdom already gives you keyless. |
| **Discord / Telegram** | **Discord: self-bots are a stated termination offence** `[R]` — and the account at risk is the one where your paid trading rooms live. The legitimate path needs a room admin's consent, yields single-digit N per ticker, and is biased the wrong way (the loudest voice is already in the position). **Your journal's existing `Origin = Callout` tag is the better instrument.** Telegram: six probed finance channels yielded **zero** US-equity content `[V]`; the US day-trading rooms are private groups the keyless path cannot see. |
| **Google Trends / SerpApi** | Google Trends returned **HTTP 429 on the first request** `[V]` — cut on a measurement, not an opinion. SerpApi is **$25/mo**, 2.5× over the cap, for a weak signal. **Wikipedia pageviews dominates it on every axis and is free, keyless, and 11 years deep.** |
| **Any market-data vendor at $10–200/mo, for the public site** | **No vendor permits public display of derived US equity analytics at $0–10/mo. Confirmed with no exception found across 11 vendors** `[V]`. The cheapest confirmed self-serve public-display licence anywhere is **Twelve Data Venture at $499/mo** `[V]`. Do not go shopping; the answer is already known. |
| **EODHD / Marketaux / NewsAPI / GDELT / Tiingo news / StockNewsAPI** | Dead ends, each for one reason: EODHD `/api/sentiments` is **news sentiment wearing a social label** (`count` is explicitly "articles analysed") `[V]`; Marketaux free = 100 req/day × **3 articles** = 300/day, unusable `[V]`; NewsAPI free is **non-commercial, 1-month history, 24 h delayed** `[V]`; GDELT has **no tickers**, document-level tone only, and 429s from cloud IPs `[V]`; Tiingo news is **3 months** deep `[V]`; StockNewsAPI is a 5-day trial then $19.99+ `[V]`. |

---

# 3. THE FREE EMAILS WORTH SENDING

**Total time: ~10 minutes for all three. Cost: $0. No signup, no commitment.**

These are the questions the run could not answer because **the answer is not
public**. Each produces a written answer either way, and a written answer is worth
more than any amount of further reading. **Copy, paste, send.**

---

## Email 1 — FINRA · historical short-volume files

**To:** via `finra.org/contact-finra/permission-use-finra-copyrighted-material`
(the documented route for written consent `[V]`). Support Center **800-321-6273**
is listed on the dataset page if you would rather call `[V]`.
**Send this one first** — it is the highest value per minute in the whole document.

> **Subject:** Permitted use of Reg SHO Daily Short Sale Volume files — derived metrics on a free personal site
>
> Hello,
>
> I run a free, non-monetised personal website that publishes end-of-day study
> tools for my own trading and for a small number of readers. I would like to
> confirm two points in writing before building anything.
>
> 1. May I display **derived metrics** calculated from the Daily Short Sale Volume
> data — for example a 20-day z-score of short volume as a share of total volume —
> on a free public website, with FINRA attribution and no charge to users?
>
> 2. May the **historical daily files** on cdn.finra.org (CNMSshvol) be retrieved
> for a one-time backfill for that purpose, given that the Query API's Public
> credential provides only a 365-day rolling window?
>
> I want to use the licensed route rather than assume one. Thank you.

---

## Email 2 — StockTwits · developer access

**To:** `developers@stocktwits.com` `[V]`
(`support@stocktwits.com` and `legal@stocktwits.com` also published in the ToS;
`stocktwits.com/enterprise` is a "Talk to Sales" form with **no published
pricing** anywhere on their site `[V]`.)

**Set expectations before you send:** this is the best social source measured
anywhere in the run — keyless, 0.14 s, structurally pre-parsed cashtags, and
**human-declared Bullish/Bearish labels on 45–48% of messages**, which is the only
labelled ground truth in the study that cannot be look-ahead contaminated `[V]`.
It is also the one the run resolved **against** us on every reading of the terms.
**Send the email; do not build anything while you wait; expect no reply.**

> **Subject:** Developer access for a single-user research project — is registration reopening?
>
> Hi,
>
> I'm building a private, single-user trading journal and would like to use
> Stocktwits data properly rather than by assumption. Two questions.
>
> 1. Your developer portal indicates registration is closed and the v2 API
> documentation pages now return 404. **Is there a current path to approved API
> access for an individual, non-commercial project?**
>
> 2. If not: does Stocktwits consider **unauthenticated read requests to
> api.stocktwits.com/api/2/** to be permitted use, or does that fall under the
> automated-extraction restriction in section 5 of your Terms?
>
> I would rather have a "no" in writing than guess. Thank you.

---

## Email 3 — Tiingo · the §7.3 vs §1.6(c) tension

**To:** the support/contact address on `app.tiingo.com` `[V]`.
**This is the single most valuable question to put to any vendor**, because a
favourable answer moves a public breadth page from **$499/mo to $30/mo.**

> **Subject:** Clarification — ToS §1.6(c) Derived Products vs §7.3 internal-consumption-only
>
> Hello,
>
> I'm evaluating Tiingo as the data source for a free public website that would
> display **aggregated market-breadth statistics** — for example "412 US stocks
> closed up more than 4% today" — computed from end-of-day bars. No individual
> prices, no per-ticker tables, no downloads or API, and nothing from which the
> underlying data could be reconstructed.
>
> Your ToS §1.6(c) expressly permits distributing a Derived Product and lists
> *"aggregated statistics calculated across multiple instruments"* as a permitted
> example. §7.3 states data obtained via the API is for internal consumption only.
>
> **Which governs the case above, on a paid individual plan?** If §1.6(c) is the
> intended carve-out, I'd like that confirmed before I build.
>
> Thank you.

---

## Optional emails — only if the public market-scans product is going ahead

**Skip both unless Decision 3 lands on "yes, public".**

- [ ] **Databento** — *"Does the $199/mo Standard plan permit backing a free
      public market-breadth page using US Equities Summary and the DBEQ bundle?
      Your pages describe DBEQ as carrying $0 exchange fees and permissive
      distribution terms for web applications, while Plus lists 'external
      distribution rights' as a differentiator — I'd like to know which side of
      that line Standard sits on."* `[V] on the pages quoted`. Their $125 signup
      credit makes evaluation genuinely free.
- [ ] **ApeWisdom** — `hello@8marketcap.com`, published on their own API page
      `[V]`. **ApeWisdom has no terms-of-service page at all — `/terms/` 404s**
      `[V]`, and absence of a licence is not a grant of one. One line: *"I'm
      collecting your API daily for a personal research project and may later
      display derived aggregates on a free site — is that acceptable, and do you
      want attribution?"* Cheap and definitive, and it is the source your
      collector is actually running against.
- [ ] **Finnhub** — ask for a written price on the social-sentiment endpoint.
      Third-party reports put their premium bands at $11.99–$99.99/mo `[R]` —
      too wide to plan against. **This is the only product in the entire survey
      that can buy back social history you have not collected**, so if it lands
      near the bottom of that band it is worth knowing.

---

# 4. THE "DO NOTHING" OPTION

**Read this if you close the laptop and go trade.**

| If you do nothing about… | What happens |
|---|---|
| **🔴 The collector cron (Decision 1)** | **You permanently lose data you cannot repurchase.** ApeWisdom publishes no history and no archive `[V]`. Every day the job stays off is a hole in the series that no vendor sells and no amount of money fixes. The pre-registration's clock never starts. **This is the only asymmetric item on the page.** |
| **The Google Sheet share list (Decision 2)** | Probably nothing — the exposure is contractual, not technical, and only bites if someone other than you can open the sheet. But it is the **one genuinely live exposure the run found**, and it costs 3 minutes to close. |
| **Non-Professional status** | Possibly a retroactive charge to the card on file, at some future point `[V]`. Low probability, non-zero cost. |
| **The market-scans decision (Decision 3)** | **Nothing bad.** The product is unbuilt. It stays unbuilt. No exposure, no cost, no clock. It waits indefinitely. |
| **The ETF question (Decision 4)** | Nothing breaks, but every downstream design decision stays provisional and you will be asked again. |
| **Alpha Vantage signup** | Nothing lost. Its history is **retrievable** (~2022 onward, to be measured `[I]`) — unlike ApeWisdom's, it can be backfilled whenever you get round to it. **Zero urgency.** |
| **FINRA account** | You lose one day off a **365-day rolling window** `[V]`. A year of runway. Genuinely fine to leave for a month. |
| **All three emails** | Nothing breaks. Three questions stay open, and any public product stays blocked on unresolved terms. **Free to send, free to ignore.** |
| **Every "not recommended" item** | Nothing. They were rejected on evidence, and the reasons are recorded above so you never have to look again. |

### The asymmetry, stated once

**Everything on this page can wait a month at zero cost — except turning the cron
on.** That one is 2 minutes of work today against a permanent, unrecoverable,
unpurchasable loss for every day it slips.

**If you do exactly one thing this morning, uncomment four lines and push — then
check the Actions tab tomorrow to confirm it actually fired on the default
branch.**

---

## Sources

All measurements and terms readings behind this page: `00-measured-facts.md`
(live endpoint measurements), `13-open-questions.md` (every unresolved item and
its resolution), `01-sources-social.md` (platforms and aggregators),
`02-sources-news.md` (news vendors, Alpha Vantage detail), `03-sources-flow.md`
(FINRA, Cboe, Wikipedia), `09-legal-tos.md` (terms posture),
`05-preregistration.md` (power analysis and the ETF finding), and
`.wip/polygon-licensing-verification.md`, `.wip/finra-terms-resolution.md`,
`.wip/stocktwits-terms-resolution.md` (the three licensing resolutions).
Collector: `scripts/social-ingest.mjs`, `.github/workflows/social-ingest.yml`.
