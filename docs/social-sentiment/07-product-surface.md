# 07 — Product Surface

**Track F.** Where this lives on tapereader.us, if anywhere. Written against the
licensing findings of Track H, `.wip/polygon-licensing-verification.md`,
`.wip/finra-terms-resolution.md`, `.wip/stocktwits-terms-resolution.md`, and the
measured signal design in `04-signal-design.md`.

**As-of: 2026-09-09.**

**Evidence key:** `[V]` verified on the source's own material · `[R]` reported by
third parties · `[I]` our inference.

---

> ## ⬛ Is there a public product here?
>
> ### **No. Not now, and not on any data this project can obtain at its budget.**
>
> The social-sentiment product is a **private journal feature**. It cannot become
> a public page until a data licence changes, and the cheapest confirmed
> self-serve licence that would change it is **$499/mo** — 50× the study's cap
> `[V]`.
>
> The reason is not statistical and it is not technical. It is that **every
> source in the minimal viable signal set is barred from public display**:
>
> | MVS component | Source | Public display |
> |---|---|---|
> | `overnight_delta` | ApeWisdom | ⚠️ **No permission exists** — no terms page at all, and it redistributes Reddit-derived data with no evident Reddit licence `[V]` |
> | `mentions_z20` | ApeWisdom | same |
> | `apdv_resid` | ApeWisdom × Polygon daily bars | same, **plus** Polygon: individual `personal` licence, Derived Works may not be displayed to third parties `[V]` |
> | `polarity_news` | Polygon news `insights` | ⛔ same Polygon clause `[V]` |
> | H6 regime | *(no source at all)* | n/a — `13-open-questions.md` §14 ⚑A3 |
>
> **Three sources in the entire study are cleanly publishable, and none of them
> is social sentiment:** Wikipedia pageviews (CC0) `[V]`, GDELT (rejected on data
> grounds — ticker resolution fails) `[V]`, and Bluesky (measured too thin for
> per-ticker use: 0–15 posts/day on the names a breakout scan surfaces) `[V]`.
> FINRA short-sale volume is publishable via the Query API but is positioning,
> not attention, and it carries a permanent cost described in §2.3.
>
> ### The same finding kills a product that was already designed
>
> `docs/market-scans/phase-1-spec.md` — the breadth dashboard, the movers scans,
> the follow-through study, all of it — **cannot ship publicly on Polygon data**
> either `[V]`. That is a fully-specified, unbuilt product with a licensing
> problem that predates this study. §3 lays out the options.
>
> ### What this document actually recommends
>
> 1. **Ship nothing publicly.** Not the sentiment surface, not the market-scans
>    pages, not yet.
> 2. **Put the market-scans product behind Cloudflare Access**, next to the
>    journal, which is already gated `[V]`. That preserves the entire design at
>    $0 with zero licence exposure, and it unblocks the 2026-09-15 daily-bar
>    deadline today.
> 3. **Build the private surface** (§4). It is the real product, it is legally
>    clean, and it is where the decisions actually get made.
> 4. **Send two free emails** (Tiingo, Databento) so the public question has an
>    answer before anyone wants one.
>
> **Do not read this as "the work was wasted."** The study's purpose is to make
> one trader's mornings better. That happens behind Access. A public page was
> always the optional second act.

---

## 1. How the question splits

Track H's framing is the right one and it is worth restating, because the two
halves have opposite answers for almost every source:

| | Question | Governed by | Answer for this project |
|---|---|---|---|
| **A** | May I *collect* it? | access / scraping / API terms | **Mostly yes** |
| **B** | May I *keep* it? | retention clauses | **Mostly yes**, aggregate-only storage helps |
| **C** | May I *show a number derived from it* on a free public page? | redistribution + commercial-use clauses | **Almost never** |

The private journal already sits entirely inside A and B. Everything this
document has to say about "no" is about C.

**And "just show aggregates" is not a safe harbour.** A mention count is a fact,
and facts are not copyrightable `[I]` — but contracts bind independently of
copyright, and the vendors that matter here define their protected asset to
expressly include derived output. Polygon's "Derived Works" is *"data, charts,
analytics, research, or other works based on, referring to, or derived from the
Market Data"* `[V]`. Finnhub bars sharing *"data or derived results from the
data"* `[V]`. **Aggregation does not launder a licence.**

### 1.1 The honest status of ApeWisdom and Tradestie

The task asked for this stated rather than assumed. Per `09-legal-tos.md` §8.1
and §8.2:

- **ApeWisdom** — open endpoint, no key. **No terms of use, no licence, no
  attribution requirement, no commercial-use or redistribution statement appears
  anywhere on the site or the API docs** `[V]`.
- **Tradestie** — free, keyless, 20 req/min. A ToS and a financial disclaimer are
  linked from the site, but **the API page states no licence, no attribution
  requirement and no redistribution terms** `[V]`.

Both are **⚠️ UNCLEAR**, and the two halves of that unclarity point in different
directions:

- **For private collection, silence is workable.** No terms means no prohibition.
  The position is acquiescence — weak, revocable without notice, but not a
  violation of anything written down. The private journal proceeds. `[I]`
- **For public display, silence is fatal.** No terms also means **no permission**.
  There is nothing to point at if challenged. And both services redistribute
  Reddit-derived data with no evident Reddit commercial licence, so publishing on
  top of them means **inheriting an unresolved upstream exposure with no contract
  of your own to stand on** `[I]`.

This single paragraph decides the public-product question for social sentiment,
because the entire minimal viable signal set is ApeWisdom. Nothing downstream of
it can be shown.

---

## 2. What *is* publishable — and why most of it still should not ship

Being permitted and being worth shipping are different questions. Both get
answered here.

### 2.1 Wikipedia pageviews — publishable without conditions

**CC0 public-domain dedication. No attribution required, no redistribution
restriction, no commercial restriction, no retention limit** `[V]`. History to
2015-07-01, keyless, 30 concurrent requests → 30× HTTP 200 with no throttling
`[V]`. This is the cleanest source in the entire study and the only attention
series with real backfill.

**What could legitimately appear on screen, computed from pageviews alone:**

| Element | Exact number shown | Traceable to |
|---|---|---|
| Daily pageviews for a ticker's mapped article | integer | Wikimedia REST `per-article/.../user/daily` `[V]` |
| `wiki_pageviews_z20` | z-score vs that article's own prior 20 sessions, σ floor 5 views | derived, CC0 `[V]` |
| Attention leaderboard | top N tickers by `wiki_pageviews_z20` | derived, CC0 `[V]` |
| Coverage statement | "3,510 of ~4,174 liquid-universe names map to an article (~84%)" | measured `[V]` |

**Three display rules that are not optional** `[I]`:

1. **A blank is `N/A` — "no article mapped" — never 0.** The missing sixth of the
   universe is not random: it is recent IPOs, low floats and small caps, i.e.
   exactly the population that produces violent breakouts `[I]`. Rendering that
   as zero attention would actively mislead.
2. **Label the T+1 lag on the panel.** The daily bucket is a UTC day landing the
   following morning; at 09:15 ET only data through the *previous* UTC day exists
   `[V]`. Wikipedia can never be an overnight or pre-market signal.
3. **Show the mapping's staleness risk.** A measured row mapped `MLKN` to *Knoll,
   Inc.*, absorbed into MillerKnoll years ago `[V]`. The map needs an override
   table, and the page needs to admit it can be wrong.

**But here is the problem with shipping it alone:** a pageview leaderboard with
no price context is a curiosity, not a study tool. The things that would make it
useful — dollar volume for the `apdv_resid` normalization, the liquid-universe
filter, the return the attention is supposed to precede — are **all Polygon-derived
and cannot be published** `[V]`. Wikipedia attention next to a price move is a
tool; Wikipedia attention next to nothing is a trivia page.

**Verdict: permitted, permanently, at zero risk. Not worth shipping until the
price-context question in §3 is resolved.** Nothing is lost by waiting — CC0 does
not expire and the backfill goes to 2015.

### 2.2 GDELT — publishable, already rejected on data grounds

*"Unlimited and unrestricted use for any academic, commercial, or governmental
use of any kind without fee"*, subject only to a citation and a link `[V]`.
Track B rejected it anyway: **ticker resolution fails** `[V]`. A permissive
licence over data that cannot be joined to a symbol is not a product. Recorded so
nobody re-opens it.

### 2.3 FINRA short-sale volume — publishable via the Query API, at a cost the site cannot afford to pay quietly

This is the interesting one, and the recommendation is counter-intuitive.

**The route matters more than the source.** Per `.wip/finra-terms-resolution.md`:

| Route | Automated pull | Build a DB | Public display of derived metrics |
|---|---|---|---|
| `cdn.finra.org/equity/regsho/daily/*.txt` (8.1 years of history) | ⛔ prohibited | ⛔ prohibited | ⛔ prohibited `[V]` |
| **Query API** + free Public credential | ✅ the sanctioned channel | ✅ no retention limit | ✅ **expressly permitted**, four conditions `[V]` |

Specific Terms for Equity Data §2.3 permits redistributing the data *and derived
data* to end users, subject to: **(a) attribution** — clearly identify FINRA as
owner and source; **(b) no charge**; **(c)** tell end users they may not further
redistribute; **(d)** commercially reasonable efforts to hold them to that `[V]`.
§6 Data Retention: **"Not applicable"** — keep it indefinitely `[V]`.

**What could appear on screen:**

| Element | Exact number | Note |
|---|---|---|
| `ShortVolume / TotalVolume` per ticker per day | ratio, 3 dp | **Label it "short share of off-exchange volume", never "bearish bets"** — market-maker internalisation means a rising ratio can mean retail is *buying* `[V]` |
| 20-day z-score of that ratio | z | derived data, expressly permitted `[V]` |
| Attribution line | "Short-sale volume data © FINRA. Source: FINRA." | §2.3(a) says *clearly identify* — on the panel, not in a footer `[V]` |

**Two hard build constraints** `[V]/[I]`:

- **No public endpoint that dumps the raw panel.** A JSON route returning the
  whole day's 12k symbols reads as §3.3(e) bulk distribution. Per-ticker and
  aggregate reads only.
- **The API is a 365-day rolling window.** The 8.1 years exist only on the blocked
  CDN `[V]`. The licensed route accrues forward with no backfill.

### ⚠️ The condition that makes this a business-model decision, not a footnote

> **§2.3(b) No Charge.** *"Developer may not charge or collect from an End User
> any fee for such End User's receipt and use of the Equity Data."* `[V]`
> And §2.2 limits the licence to **non-commercial** personal or professional use
> `[V]`.

tapereader.us is free today, so the condition holds today. **The moment ads, a
subscription, a Pro tier, a paywall, or a sponsorship appears anywhere near this
data, both §2.3(b) and the §2.2 non-commercial limit are squarely in play and
this answer flips** `[I]`.

That is not a compliance detail to note and move past. **Publishing FINRA data
sells a permanent option on ever monetising the site**, in exchange for one panel
of a metric that measured **r = −0.0035 against next-day return** — no univariate
edge at all `[V]`. Two further live consequences:

- It requires **new site terms** — a clause saying visitors may not further
  redistribute FINRA data or FINRA-derived data obtained from tapereader.us.
  The site has no such clause today. That is real work, and a legal artefact the
  project would then have to maintain.
- The reading that a public, unrestricted-audience website counts as
  redistribution to "End Users" for "non-commercial personal or professional use"
  is ours, at **moderate confidence, not high** `[V]/[I]`. A hedge fund reading
  the chart is arguably a commercial end user, and the terms neither define
  End User nor require verification.

**Verdict: permitted, and recommended NOT to publish.** Use FINRA privately —
where §2.2's grant is unambiguous and no condition attaches — and keep the
monetisation option unencumbered. If the site is ever monetised, this decision
costs nothing to have made. If FINRA is published first and monetised later, the
data has to come down and the terms have to be unwound. **Asymmetric, so take the
cheap side.** `[I]`

### 2.4 Bluesky — publishable, and empty

Aggregates are shippable and the access is genuinely excellent `[V]`. The data is
not there: 0–15 posts/day on the names a breakout scan surfaces (BBAI 0, AEHR 0);
a 14,514-post firehose sample contained **one** genuine US-equity post; all of
Bluesky's US-equity cashtag output across every ticker for a whole day is about
one third of StockTwits' TSLA volume alone `[V]`. **A free firehose of nothing is
worth nothing.** No screen element.

### 2.5 The summary

| Source | May publish? | Should publish now? |
|---|---|---|
| Wikipedia pageviews | ✅ unconditionally (CC0) | **Not yet** — needs price context that cannot be published |
| GDELT | ✅ with citation | ❌ ticker resolution fails |
| FINRA (Query API) | ✅ with 4 conditions | ❌ **the "no charge" condition costs more than the panel is worth** |
| FINRA (CDN files) | ⛔ | ⛔ |
| Bluesky | ✅ | ❌ measured empty |
| ApeWisdom / Tradestie | ⚠️ no permission exists | ⛔ |
| Polygon news + bars | ⛔ | ⛔ |
| Reddit / Arctic Shift / Quiver / Finnhub / Alpha Vantage | ⛔ private use only | ⛔ |
| StockTwits | ⛔ refused unconditionally; they license derived sentiment to institutions | ⛔ |

**One source is both permitted and useful, and it needs a companion that is not
currently publishable. That is the whole public product, and it is why the answer
is "not yet".**

---

## 3. Composition with the planned market-scans pages

`/`, `/market` and `/scans` are fully designed in
`docs/market-scans/phase-1-spec.md` and **entirely unbuilt**. `13-open-questions.md`
§1 establishes they cannot ship on Polygon data.

### 3.1 The scope of the breakage, stated precisely

**Both halves of the spec fail, and they fail for the same reason.** Massive
(Polygon) prohibits display and redistribution of Market Data and Derived Works
across three independent clauses, one naming public display and websites
explicitly, with no reconstruction carve-out `[V]`. So there is **no licence-safe
subset of the current spec to design toward** — not the breadth aggregates, not
the movers table.

Every individual plan, free through the $199/mo Advanced tier, carries
`license_type: personal` `[V]`. **Paying more on the consumer ladder buys rate
limit and history, not licence scope.** The tier that lifts it is Stocks Business
at **$2,499/mo** ($1,599 annualised) `[V]`.

**Three things this does NOT break, and they matter:**

1. **Private collection and private analysis are fine.** Ingesting grouped-daily
   bars into a private store for the trader's own study is squarely inside the
   individual licence `[V]`. **The 2026-09-15 daily-bar deadline is not blocked by
   this finding** — it is only publishing that is blocked.
2. **The journal is clean.** `/pct-bootcamp/trade-journal` returns 302 to
   Cloudflare Access; gated, single-user `[V]`.
3. **The blocker is a vendor contract, not an exchange encumbrance** `[V]` — which
   is why changing supplier is a genuine fix rather than a shell game.

### 3.2 A build-order trap worth naming

The spec's **"Fixture retirement"** step (§10) says the six hardcoded
`fixtureSetups()` are retired once real scans produce hits, and the WIP banners
come off. **That step, executed on public pages, is itself the breach.** Synthetic
fixtures are fine to publish; the moment `/`, `/setups/[id]` or `/ticker/[symbol]`
render values read from `daily_bars`, those pages are displaying Polygon-derived
works to third parties `[I]`.

So the sequencing rule is: **wire the pages to real data and gate them in the same
change, or not at all.** The public site keeps its fixtures until a licence
question is answered.

### 3.3 The realistic options

| # | Option | Cost | What it buys | What it costs |
|---|---|---|---|---|
| **A** | **Gate everything behind Cloudflare Access** — `/market`, `/scans`, `/scans/[id]`, and a data-backed home, next to the journal | **$0** | The entire spec ships as designed, immediately. Zero licence exposure. No vendor migration. `market_db` can be created today and the 09-15 deadline held | tapereader.us has no public study tool. The "free US-stock setup scanner" positioning goes away or shrinks to the fixture demo |
| **B** | **Switch to Tiingo** (Power $30/mo individual) | $30/mo | ToS §1.6(c) expressly permits distributing a Derived Product, with *"aggregated statistics calculated across multiple instruments … averages, medians, volatility measures, correlations, percentiles, or distributions"* listed as a permitted example — **that is the breadth page, described almost verbatim** `[V]` | **The movers table is still excluded** — the prohibited list names *"tables, files, feeds, APIs, databases, dashboards, charts, downloads, or query tools that display, deliver, or permit extraction"* `[V]`. And **§7.3 "internal consumption only" is in genuine tension with §1.6(c) and could not be resolved from the text** `[V]`. The free tier forbids persistent storage entirely `[V]`, so $30/mo is the floor for a bar store |
| **C** | **Switch to Databento DBEQ** | $199/mo Standard (+$125 signup credits) | The **exchange** layer is bought down: DBEQ carries **$0 exchange licence fees**, described as *"free to license for distribution, display, and non-display applications"* and *"ideal for web apps"* `[V]`. All plans include US Equities Summary — official EOD prices across all exchanges `[V]`, which is exactly the spec's input | **Databento's own vendor-side distribution rights at $199 are unclear** — Plus at $1,750/mo advertises "external distribution rights" as a differentiator `[I]`. Exchange side settled and free; vendor side not, from public pages alone |
| **D** | **Buy a confirmed public-display licence** | **$499/mo** (Twelve Data Venture; $414 annual) | The only **confirmed self-serve** licence found anywhere in the survey permitting *"commercial display … to third parties"* `[V]` | 50× the study's cap. For a free site with no revenue, indefensible |
| **E** | **Shelve market-scans** | $0 | Nothing to maintain | Throws away a complete spec, a working `scripts/market-ingest.mjs`, and the daily-bar store the confirmatory test needs. **Also misses the 09-15 deadline and pushes H5 past December** |

### 3.4 Recommendation — A now, B or C only if an audience appears

**Take option A.** Reasoning:

1. **It is the only option that costs nothing and blocks nothing.** The spec ships
   whole — breadth, movers, follow-through, all of it — because private display to
   the account holder is exactly what the individual licence grants `[V]`.
2. **It unblocks the only hard deadline in the run.** `13-open-questions.md` §13:
   daily-bar collection must start by **~2026-09-15** to hold the ~December 2026
   answer date for H5. Option A requires no vendor decision, so `market_db` can be
   created and `scripts/market-ingest.mjs` pointed at it **this week**. Every other
   option delays that behind a purchase or a legal answer.
3. **It defers the expensive decision to the moment there is evidence for it.**
   There is currently no measured public demand for a TapeReader breadth page. B,
   C and D all spend money — or a legal review — on an audience that has not been
   shown to exist.
4. **Option A is reversible in one direction only, and it is the safe direction.**
   Gating first and opening later is a config change plus a vendor migration.
   Publishing first and discovering the licence problem later is a takedown.
5. **The failure mode is honest.** "The study tool is private while a data licence
   is sorted out" is a true and unembarrassing thing for the public home page to
   say.

**Free actions to take alongside A, in the order of value per minute** `[I]`:

- **Email Tiingo** on the §7.3 / §1.6(c) tension. It is the cheapest possible
  unlock of the entire public product, it costs one paragraph, and a written
  answer converts the single largest ambiguity in this document into a fact.
- **Email Databento** on DBEQ vendor-side distribution rights at the $199 tier.
- **Check who the shared Google Sheet is shared with.** `13-open-questions.md` §1
  flags this as the one genuinely live exposure found in the run: the web app is
  gated, but the journal writes Polygon-derived columns into a sheet `CLAUDE.md`
  describes as *shared*, and Cloudflare Access does not cover a spreadsheet `[V]`.
  If anyone other than the account holder can open it, that is furnishing Market
  Data to another person. **This is a five-minute check and it outranks every
  design decision in this document.**

### 3.5 What the public site keeps under option A

| Route | Status |
|---|---|
| `/` | Stays on `fixtureSetups()` with its WIP banner, or becomes a plain landing page. **Must not be wired to `daily_bars`** |
| `/about`, `/watchlist` | Unchanged — no licensed data |
| `/ticker/[symbol]` | Stays on `fixtureBars`. Wiring it to `daily_bars` moves it behind Access |
| `/market`, `/scans`, `/scans/[id]` | **Built behind Cloudflare Access**, alongside `/pct-bootcamp/*` |
| `/pct-bootcamp/*` | Unchanged — already gated `[V]` |

---

## 4. The private surface — the actual product

Everything below sits behind Cloudflare Access, is single-user, and publishes
nothing. On that footing the licensing analysis simplifies enormously: ApeWisdom
(acquiescence, §1.1), Wikipedia (CC0), Polygon news + bars (individual licence,
private use expressly permitted), FINRA via Query API (§2.2 grant, no conditions
attached to private use), Arctic Shift. **All available.**

### 4.0 Two rules that govern every screen below

**Rule 1 — nothing writes to the sheet yet.** `04-signal-design.md` §10 and the
pre-registration §7.1 are explicit: a column added on the strength of a null is
permanent clutter, and the additive-only migration contract asserted by
`scripts/review/migration-safety.ts` makes columns easy to add and effectively
impossible to remove. **Every attention view is a read-side join on `date|symbol`
against the NDJSON/D1 store — the same key screenshots already use.** Sheet
columns wait for the pre-registration's futility stop.

**Rule 2 — the UI is built to resist p-hacking, not to assist it.** With ~18
analyzable trades/month and half of them index/sector ETFs `[V]`, every bucket
will be small for a long time. So: **n is displayed at least as prominently as any
mean; no significance markers; no highlighting of the best-performing bucket; no
sorting a breakdown table by its outcome column.** This is a design requirement,
not a preference — the whole point of `05-preregistration.md` is to stop the
trader being fooled by his own journal, and a UI that ranks buckets by outcome
undoes that work in one click. `[I]`

---

### 4.1 Morning Plan — the highest-value placement in the whole study

**Where:** `/pct-bootcamp/trade-journal/plan` — the pre-market card form.
**Cadence fit:** the `premarket` snapshot targets **09:05 ET** (hardened from
09:15 for cron-queue margin, with an ET-clock guard and dual `13:05`/`14:05` UTC
crons for DST) `[V]`. Its trailing-24h window is `(prev 09:15, today 09:15]` —
**the entire overnight and pre-market conversation, ending before the open.** This
is genuinely attention state at setup time, which is exactly what a morning form
needs.

**Panel A — attention on the symbols already on the plan.** One row per card:

| Field | Source | Available |
|---|---|---|
| `mentions` at the premarket slot | ApeWisdom `all-stocks` | now |
| Ordinal band: `unlisted / 1 / 2–9 / ≥10` | derived | now |
| `overnight_delta` = `ln((m_0915+1)/(m_prev1605+1))` | ApeWisdom | now |
| `new_entrant` (= `mentions_24h_ago` is NULL) | ApeWisdom payload | **now, free** — 32% of the daily list `[V]` |
| `v1_vendor` day-over-day velocity | ApeWisdom payload | **now, free** |
| `scope_breadth` — which of the 6 subreddit lists it appears in | ApeWisdom | now |
| `mentions_z20` | ApeWisdom | **from ~2026-10-06** (needs 20 sessions) `[V]` |
| `wiki_pageviews_z20` | Wikipedia | now, **labelled T+1** |
| News `polarity_news` + one `sentiment_reasoning` line | Polygon news `insights` | now (insights history from mid-2024) `[V]` |

**Decision it supports:** *"Is my thesis already crowded, or am I early?"* That is
H1 vs H2 stated as a morning question, and it is the one the trader can act on
before he has any statistical answer — because seeing that a name went from 1 to
40 mentions overnight is decision-relevant on its face, independent of whether
the effect is significant across 200 trades.

**Panel B — the discovery list.** Top N names by `overnight_delta` that are
**not** on the plan, with the same fields. This is the H3/H5 surface made
operational: *"is something in play this morning that I have not looked at?"*
It is also the panel most likely to change behaviour, because the trader can only
watch 2–3 tickers live and the whole point of the market-scans spec was to surface
what he otherwise misses.

**Five display rules, each traceable to a measured finding:**

1. **Mark ETFs as structurally signal-free.** QQQ and SPY are seeded on every plan
   (`ALWAYS_WATCHLIST_SYMBOLS`) and ETFs are 18 of 36 archived trades `[V]`. They
   carry no usable ticker-level retail-attention signal and are excluded by
   construction. The panel must **say "no attention signal — ETF"**, not render a
   number that looks meaningful.
2. **Show `captured_at`, not the slot name.** A slot label is an intention; a
   timestamp is a fact `[V]`. If the 09:05 cron queued late, the trader should be
   able to see that the data he is looking at is 09:41, not "premarket".
3. **A missing snapshot renders as "no data", never as 0.** Collector gaps are
   missing, not zero (R7) `[V]`. Conflating them is the single easiest way to
   manufacture a false `overnight_delta` spike.
4. **`N/A` means structurally not computable** (outside the tracked universe, no
   Wikipedia article, too little history); **blank means not computed yet** — the
   journal's existing convention, applied unchanged.
5. **A standing caption: "attention is context, not a prediction."** `13-open-questions.md`
   §10 records that a real share of small-cap cashtag volume is **automated scanner
   output** — a lagging transform of price wearing the costume of sentiment `[V]`.
   Until the reflexivity test (§4.5) clears a feature, the panel is showing what
   was said, not what will happen.

---

### 4.2 Screenshot Review — the retrospective view, and the one immediate win

**Where:** `/pct-bootcamp/trade-journal/screenshots`, joined on `date|symbol`
exactly as screenshots already are.

**What appears:** an attention badge next to the existing MAE badge —
`mentions` at the premarket slot, the ordinal band, `overnight_delta`,
`new_entrant`, `wiki_pageviews_z20`, and the news polarity with its one-line
`sentiment_reasoning` (which is auditable free text, not an opaque score `[V]`).

**Decision it supports:** none, directly — and that is fine. This is the surface
where the trader's own pattern recognition does the work the statistics cannot yet
do. Flipping through entry screenshots and seeing *"the ones that ran to 3R were
mostly names nobody was talking about at 09:15"* is a hypothesis he can then test
properly. It is also where he will notice if the data is wrong, which is worth
more than any single metric.

> #### ⭐ The one thing available today with no accrual wait
>
> **Wikipedia is the only attention source in the study with real backfill —
> to 2015-07-01, keyless, unthrottled `[V]`.** Every other source starts at
> 2026-09-08 with nothing behind it.
>
> That means **the existing archived trades can be scored retroactively, right
> now**, with `wiki_pageviews_z20` on the trade date and the prior 20 sessions.
> No waiting until October for `mentions_z20`, no waiting until December for H5.
>
> Two honest caveats: the ~84% mapping ceiling misses exactly the small-cap
> population that matters `[V]`, and half the archived trades are ETFs `[V]` —
> so on a 36-trade sample this is a *look*, not a finding. But it is the only
> thing in this entire study that produces something to look at this week, and
> it costs a mapping table and a batch of REST calls.

---

### 4.3 Performance Overview — the study surface, deliberately underpowered

**Where:** `AggregateStats.tsx`, as a new breakdown table in the same shape as the
existing hourly and setup breakdowns, driven by the same shared filter bar.

**Buckets** (fixed by the pre-registration, **not tunable from the UI** — a
tunable bucket boundary is a garden of forking paths with a slider on it):

| Bucket | Definition |
|---|---|
| Attention band | `unlisted / 1 / 2–9 / ≥10` mentions at the premarket slot |
| Novelty | `new_entrant` Y/N |
| Overnight | `overnight_delta` terciles |

**Columns:** `n` first, then mean `Max R Before Stop`, mean `Capture %`, mean
`MAE (R)`, `Discipline %`. **`Max R Before Stop` is the primary outcome, not
realized R** — H1–H5 are claims about *opportunity*, and realized R folds in the
trader's own exits, so a null on it would be uninterpretable `[V]`.

**Decision it supports:** none yet, and the panel should say so. Per the
pre-registration the analysis window does not open until ~January 2027, and
`13-open-questions.md` §14 records that **H1's accrual clock does not even start
until ~2026-10-06**, because `mentions_z20` needs 20 prior sessions.

So this table ships with a permanent header: **"Descriptive only. Not a finding.
See `05-preregistration.md`."** It exists so the trader can watch the counts fill
up and see when the question becomes answerable — which is itself useful, because
the honest answer to "when will I know?" is currently "not before 2027" and a
visible `n` makes that concrete instead of abstract.

---

### 4.4 Trading Calendar — **nothing here earns a slot, and that is the finding**

The obvious move is a per-day market-wide attention or regime strip on the
monthly calendar. **It cannot be built.**

`13-open-questions.md` §14 ⚑A3: **H6 is not computable from any currently
collecting source.** ApeWisdom has no sentiment field `[V]`, Tradestie's is a
measured static per-ticker constant with zero within-ticker variation across 5.4
years `[V]` (a look-ahead landmine, deliberately not persisted), StockTwits is
ruled out, and H6's predictor needs polarity on ~100 names/day. There is no data
path.

What the Calendar could take *later*, from sources that do exist:

- A **market-wide breadth row** per day (`up4`/`down4`, `t2108`) once `market_db`
  is created — Polygon-derived, private-only, which is fine here because the whole
  page is behind Access.
- A **news-polarity market aggregate** from Polygon `insights`, which is real,
  replayable and backfillable to mid-2024 `[V]` — but it is *news* sentiment, not
  social, and `04-signal-design.md` R8 warns explicitly against letting the easy
  source quietly redefine the question.

**Recommendation: add nothing to the Calendar in this phase.** Revisit when
breadth exists. Inventing a widget to fill the slot would be exactly the kind of
manufactured product this document is supposed to refuse.

---

### 4.5 A new private page — `/pct-bootcamp/attention`

The other four surfaces are *placements*. This one is the store made inspectable,
and it is where the data-quality and anti-self-deception machinery lives.

| Section | Contents |
|---|---|
| **Today's panel** | The full premarket snapshot, sortable: ticker, ordinal band, `mentions`, `overnight_delta`, `v1_vendor`, `new_entrant`, `scope_breadth`, `wiki_pageviews_z20`, `apdv_resid` (once bars exist) |
| **Per-ticker history** | Sparkline of the four daily slots, with weekend observations visually distinguished — the Monday 09:15 window contains **no trading hours at all** `[V]` and must not be read as a weekday observation |
| **Collector health** | `ingest_log` completeness: which (scope, slot) pairs fired, which are missing, last `captured_at`. **A gap must be visible, because R7 says gaps are missing, not zero** `[V]` |
| **🔴 Reflexivity / price-echo diagnostic** | For each feature: `r(feature, prior-day return)` beside `r(feature, next-day outcome)`. **If `|r(feature, return(d−1))| > |r(feature, outcome(d))|` the feature is labelled a PRICE ECHO and rendered struck-through everywhere on the site** |

**The reflexivity panel is the most important thing on this page** and it should be
built first, not last. `author_diversity` — the bot detector the brief asks for —
**is not computable from any collecting source**, because neither ApeWisdom nor
Tradestie exposes author identity `[V]`. That makes the reflexivity test the
*only* structural defence against §10's scanner-bot problem, not the second line
`[V]`. Wiring it into the UI rather than leaving it in an analysis notebook means
the trader cannot look at a feature without also seeing whether it is just price
in a costume.

**Honest note on `apdv_resid`:** it is the one metric in the family constructed to
survive the pre-registration's RVOL gate `[V]`, and it needs a dollar-volume
denominator from a daily-bar store that **does not exist yet**. It is greyed out
until `market_db` is created — another reason §3.4's option A matters this week.

---

### 4.6 What each surface is worth, ranked

| Rank | Surface | Available | Why |
|---|---|---|---|
| **1** | **Morning Plan attention panel** | now (partial), full ~2026-10-06 | The only surface that changes a decision *before* the trade. Panel B (discovery) is the highest-upside element in the study |
| **2** | **Screenshot Review badges + Wikipedia retro-scoring** | **this week** | The only thing that produces something to look at now, with no accrual wait |
| **3** | `/pct-bootcamp/attention` + reflexivity diagnostic | now | Where the data becomes trustworthy. Cheap, and it protects everything above it |
| **4** | Performance Overview breakdown | ~Jan 2027 | Descriptive until the window opens; ships early only so the `n` is visible |
| **5** | Trading Calendar | — | **Nothing to add.** Do not invent something |

---

## 5. Storage budget

### 5.1 The arithmetic, if snapshots were imported to D1

Measured: **2,078 rows per snapshot** across six scopes, 494 KB raw / 46 KB
gzipped `[V]`. Four slots per day, seven days a week (weekend capture is required
— the Monday window contains no trading hours `[V]`).

| Quantity | Value |
|---|---|
| Rows per snapshot | 2,078 `[V]` |
| Slots per day | 4 `[V]` |
| **Rows written per day** | **8,312** |
| Rows per year | **~3,033,900** |
| Bytes/row in D1 incl. PK + index (spec's own convention is ~100 B for a narrower row; the ApeWisdom row carries a `name` string) `[I]` | ~100–120 B |
| **D1 size per year, raw snapshots** | **~300–365 MB** |

**Against the free tier:**

| Limit | Free value | Consumption |
|---|---|---|
| **D1 max database size** | **500 MB** | **~300–365 MB/yr — 60–73% of the entire cap in year one, before a single price bar** |
| **D1 rows written / day** | **100,000** | 8,312/day = **8.3%** |
| **D1 queries per Worker invocation** | **50** | Fine — the attention panel is 1–3 batched reads |

**The collision that decides it:** `market_db`'s `daily_bars` is budgeted at
**~105 MB/year** and the whole market-scans design at **~120 MB/year** of the same
500 MB `[V]`. Raw social snapshots at ~300–365 MB/year would put the pair at
**420–485 MB in year one and over the cap in year two.** A separate `social_db`
sidesteps the per-database size cap but not the daily write budget, and it adds a
second database to migrate, back up and reason about for data that has no reason
to be relational.

**Write-budget interaction, for the record:** the market-scans backfill is paced
to consume roughly the full 100k rows/day for ~11 days `[V]`. Social snapshots
writing 8,312/day alongside it stretch that to ~12 days. Tolerable. A **one-shot
import of a year of raw snapshots (3.03M rows) would consume the entire daily
write budget for ~31 days** — which on its own is enough to reject the design.

### 5.2 Trimming options, and why none of them rescues the raw import

| Option | Rows/day | D1/year | Verdict |
|---|---|---|---|
| All 6 scopes, 4 slots | 8,312 | ~300–365 MB | ❌ blows the shared cap |
| `all-stocks` + `wallstreetbets` only (1,391 of 2,078 rows `[V]`) | 5,564 | ~200–245 MB | ❌ still crowds out `daily_bars` |
| `all-stocks` only, 4 slots | 3,188 | ~115–140 MB | ⚠️ survivable, but throws away `scope_breadth` (M7), which is one of the few metrics ApeWisdom computes uniquely |
| **Derived daily feature row per ticker** | **~787** | **~29–35 MB** | ✅ |
| Pre-filter `mentions >= 2` | ~1,900 | — | ⛔ **forbidden** — the 604 single-mention rows are the fresh-discovery population H3 is entirely about `[V]` |

### 5.3 Recommendation

**Keep the archive of record in git as NDJSON. Put only derived daily features in
D1. Do not create a `social_db`.**

1. **Archive: `data/social/apewisdom/YYYY/YYYY-MM-DD.ndjson`, as the collector
   already writes** `[V]`. **66 MB/year gzipped** across all six scopes (measured;
   704 MB raw) `[V]`. This is the right home because it is free, permanently
   historical, trivially auditable in a diff, idempotency-verified `[V]`, and it
   imports to D1 later in one pass if that ever becomes necessary. **The snapshot
   *is* the history** — ApeWisdom has no archive, no date parameter, and
   `/history/GME` returns `[]` `[V]` — so this file is unrepurchasable at any
   price and belongs somewhere durable.
2. **Watch the repo, and have an escape hatch.** 66 MB/year compounds, and this
   repo also carries the Next.js app, the 4-Week Challenge build output and the
   journal's DAS archives. At three years the social data alone is ~200 MB. If it
   becomes a problem the answer is **Cloudflare R2 (10 GB free)** or a separate
   data repo — a decision for `10-build-plan.md`, flagged here so it is not a
   surprise `[I]`.
3. **D1 holds one narrow derived table**, written nightly, joined on
   `(ticker, date)` — the same key everything else in the journal uses:

```sql
CREATE TABLE IF NOT EXISTS attention_daily (
  ticker TEXT NOT NULL,
  date   TEXT NOT NULL,              -- ET session date
  mentions_0915 INTEGER,             -- NULL = no snapshot; distinct from 0
  mentions_1605_prev INTEGER,
  overnight_delta REAL,
  v1_vendor REAL,
  new_entrant INTEGER,               -- 0/1
  scope_breadth INTEGER,             -- how many of the 6 scopes list it
  mentions_z20 REAL,                 -- NULL until ~2026-10-06
  wiki_views INTEGER,
  wiki_z20 REAL,
  apdv_resid REAL,                   -- NULL until daily_bars exists
  window_spans_weekend INTEGER,      -- 1 on Monday observations
  captured_at TEXT,                  -- the fact; never trust the slot label
  PRIMARY KEY (ticker, date)
);
CREATE INDEX IF NOT EXISTS idx_attn_date ON attention_daily(date);
```

   **~787 rows/day → ~287k rows/year → ~29–35 MB/year**, or **6–7% of one
   database's cap**. It sits comfortably next to `daily_bars`, so it belongs in
   `market_db` rather than a database of its own — the two are joined on
   `(ticker, date)` in every query that matters, and a cross-database join is not
   available on D1.

4. **Where `market_db` stands.** It **does not exist**: `web/wrangler.toml` still
   carries `database_id = "TODO_RUN_WRANGLER_D1_CREATE"` `[V]`. Creating it is on a
   **~2026-09-15 deadline for reasons unrelated to this document** — it is the
   outcome variable for H5, the only confirmatory test in the study, and the
   denominator for `apdv_resid` `[V]`. **`scripts/market-ingest.mjs` already
   exists**, so this is largely a create-the-database-and-run-it task, not new
   engineering `[V]`.

   Section 3.4's option A is what makes that deadline safe to hit: **ingesting
   Polygon bars into a private store is not blocked by the licensing finding —
   only publishing them is** `[V]`. Do not let the §1 finding stall the one thing
   in this run that has a date on it.

---

## 6. What this document commits to, and what it declines

**Commits:**

- No public social-sentiment surface. The MVS is ApeWisdom-derived and ApeWisdom
  grants no permission to publish `[V]`.
- Market-scans ships **behind Cloudflare Access** on the existing Polygon key,
  at $0, preserving the whole spec and the 09-15 deadline.
- The private surface is built in the order of §4.6: Morning Plan panel,
  Screenshot Review badges + Wikipedia retro-scoring, `/pct-bootcamp/attention`
  with the reflexivity diagnostic, then the Performance Overview breakdown.
- Raw snapshots stay in git; D1 gets one derived table in `market_db`.
- **No sheet columns** until the pre-registration's futility stop passes.

**Declines, with reasons:**

- **Publishing FINRA short volume**, though it is permitted. The §2.3(b) "no
  charge" condition and the §2.2 non-commercial limit would make TapeReader
  permanently unmonetisable in exchange for a metric measured at **r = −0.0035**
  against next-day return `[V]`. The trade is bad in both directions.
- **A Wikipedia-only public page**, for now. Permitted unconditionally, but
  attention without price context is trivia, and the price context is the part
  that cannot be published.
- **A Trading Calendar attention strip.** H6 has no data path `[V]`. Building one
  anyway would mean inventing a number.
- **Buying a licence.** $499/mo is the cheapest confirmed self-serve public-display
  licence found anywhere in the survey `[V]`. There is no audience yet to justify
  it, and option A costs nothing while the question stays open.

**Open, and owned by someone else:**

- Tiingo §7.3 vs §1.6(c) — one email, and it is the cheapest possible unlock of
  the entire public product.
- Databento DBEQ vendor-side distribution rights at $199/mo — one email.
- **Who the shared Google Sheet is shared with** — five minutes, and it is the
  only live exposure identified in this run `[V]`.
- Whether a free public site counts as redistribution to "End Users" under
  FINRA's Specific Terms, and whether §3's "Exceptions to Terms of Use — Not
  applicable" means what we read it to mean. ⚖️ Both are real legal-review items
  and **neither is on the critical path**, because §2.3's recommendation is not to
  publish FINRA at all.
