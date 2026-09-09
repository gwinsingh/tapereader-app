# Polygon.io / Massive licensing — independent verification

**Verified:** 2026-09-08 · **Method:** vendor terms pages fetched directly (curl + rendered fetch), plus
one read-only HTTP check against tapereader.us. No account created, no credentials entered, nothing
purchased. Confidence tags per `docs/journal-market-research/00-method.md`: `[V]` verified on the
vendor's own material · `[R]` reported by third parties · `[I]` inference.

---

## VERDICT

> **The claim is CONFIRMED on its text and CONFIRMED in substance, with one material correction.**
>
> Both quoted phrases are real, current, and appear verbatim in the governing document. `[V]`
> The redirect is real: polygon.io 301s to massive.com. `[V]`
>
> **The correction:** "regardless of plan tier" is wrong as stated. The restriction applies to every
> **individual** plan — free Basic through $199/mo Advanced — and Massive *does* sell a tier that
> lifts it. But that tier is **Stocks Business at $2,499/mo** ($1,999/mo on commitment, $1,599/mo
> annualised). `[V]` So the practical conclusion the claim reached is right; the reasoning was
> one step short. There is an escape hatch, and it is priced 250× above this study's cap.
>
> **The other correction:** it is a **rebrand, not an acquisition.** Same company, same entity
> lineage, effective 2025-10-30. `[V]` No change of control, no new licensor.

**Practical consequence:**

| Use | Status | Confidence |
|---|---|---|
| **(a) Private trade journal** (in production) | **Clear, with two conditions to check.** Single-user, non-published, non-business analysis is the paradigm case the individual licence is written for. Verified today that `/pct-bootcamp/*` is gated behind Cloudflare Access — it is genuinely not public. The two conditions are below (§5). | `[V]` terms; `[V]` gating |
| **(b) Planned public market-scans product** (`docs/market-scans/phase-1-spec.md`) | **Blocked on Polygon/Massive as currently keyed.** Not marginally — squarely, on three independent grounds. This is a real licensing problem and it predates the sentiment study. The spec is not dead; it needs a different data supply. | `[V]` |
| **(c) News-sentiment use in this study** | **Same restriction, same document.** `/v2/reference/news` and its `insights` field are Market Data under the same terms. Fine to *test* and to use privately; publishing a sentiment score derived from it is the same violation as publishing a price. | `[V]` |

**The single most useful thing in this document:** the blocker is a *vendor contract*, not an
*exchange encumbrance*. Exchange rights would follow the data to every vendor. A vendor contract does
not. See §7 — at T+1 the exchanges largely step out of the way, which is why switching supplier is a
real fix rather than a shell game.

---

## 1. Corporate situation

- `https://polygon.io/` returns **HTTP 301 → `https://massive.com/`**. Measured 2026-09-08. `[V]`
- **Rebrand, effective 2025-10-30**, announced by the company. Not an acquisition; no change of
  control reported. `[R]` (company announcement + trade press)
- The governing entity is now **Massive.com, Inc.** The legal pages and the NYSE schedule both name
  "Massive.com, Inc." as the contracting party. `[V]`
- A **stale artefact** exists and is a trap: `https://massive.com/terms/market_data_terms.pdf` is
  still served (HTTP 200) and is headed **"POLYGON.IO, INC. MARKET DATA TERMS OF SERVICE, Last
  Updated: October 9, 2024."** `[V]` It is superseded. Anyone citing that PDF is citing a document
  ~11 months out of date under the old entity name. Cite the HTML page instead.
- Existing API keys and endpoints continue to work across both domains during migration. `[R]`

---

## 2. The governing documents (as of 2026-09-08)

Massive now runs a **two-track legal structure**. This is the fact the original finding missed, and
it is the whole answer.

| Document | URL | Last updated | Governs |
|---|---|---|---|
| Terms of Service (hub) | `massive.com/legal/terms` | — | Routes you to one of the three below |
| **Massive for Individuals ToS** | `massive.com/legal/individuals-terms-of-service` | **2025-07-18** | Anything "labeled for Individual Use" |
| **Massive for Businesses ToS** | `massive.com/legal/businesses-terms-of-service` | **2025-09-02** | Anything "labeled for business, enterprise, or commercial use" |
| **Market Data Terms of Service** | `massive.com/legal/market-data-terms-of-service` | **2025-08-28** | Incorporated by the **Individuals** ToS. Carries the OPRA, Nasdaq/UTP and NYSE subscriber agreements as schedules |
| Website ToS | `massive.com/legal/website-terms-of-service` | 2024-10-15 | The website itself |

All `[V]`, fetched directly today.

**Key structural finding:** the Market Data Terms — the document containing both quoted clauses — is
incorporated by the **Individuals** ToS. The **Businesses** ToS contains **zero** occurrences of
"Market Data Terms", "Derived Works", or "personal, non-business". `[V]` (measured by string search
over the fetched page). The two tracks are genuinely different licences, not one licence with a
price ladder.

---

## 3. Does the restriction apply to all tiers, or only free?

**Neither. It applies to all *individual* tiers, and is lifted only by a *business* plan.**

The pricing pages carry a machine-readable `license_type` field per product. Extracted from the
page payload today `[V]`:

| Plan | Monthly | `license_type` |
|---|---|---|
| Stocks **Basic** | $0 | `personal` |
| Stocks **Starter** | $29 | `personal` |
| Stocks **Developer** | $79 | `personal` |
| Stocks **Advanced** | $199 | `personal` |
| **Stocks Business** | **$2,499** ($1,999 w/ commitment · $19,188/yr ≈ $1,599/mo) | **`commercial`** |

Every individual card is also labelled **"Individual use only"** in the rendered UI, including the
$199 tier. `[V]` So paying more on the consumer ladder buys rate limit, history depth and latency —
**it does not buy licence scope.** That is the specific way this vendor differs from the usual
"paid tiers lift the restriction" pattern the task flagged, and it is worth stating plainly: here,
they don't.

**Operative individual-tier language** (Market Data ToS §1) `[V]`:

> …license to use Market Data exclusively for your personal, non-business, and non-commercial purposes.

and, in the same section, the clause that matters more for TapeReader than the commercial one:

> you may not use the Market Data to build an application intended for use by end users other than you.

**Is there a separate "commercial use" or "redistribution" add-on?** No — it is a whole different
plan, not an add-on. Massive's own knowledge base is unambiguous
(`massive.com/knowledge-base/article/how-can-i-redistribute-massives-market-data`) `[V]`:

> Any user who wishes to redistribute Massive's market data must sign up for one of our business products.

Business-plan prices, same extraction method `[V]`: Stocks $2,499/mo · Options $1,999 · Indices
$2,500 · Currencies $999 · Financials & Ratios for Business $699. Exchange **feed expansions** are
priced separately on top and carry pass-through exchange fees: Full Market Real-time $1,999/mo,
Full Market **15-min Delayed $499/mo**, IEX $499, Cboe EDGX $1,999, Nasdaq Basic $1,999. `[V]`
A 25%-off first-year startup discount is advertised, by email application. `[V]`

---

## 4. "Derived Works" — and the display/redistribution distinction

The quoted definition is verbatim and current. Market Data ToS §5(c) `[V]`:

> …or any data, charts, analytics, research, or other works based on, referring to, or derived from the Market Data ("Derived Works")

**Does this actually prohibit public display of an aggregate statistic like "412 stocks closed up
more than 4% today"?** The task rightly insisted on separating display from redistribution. Here is
the honest answer: **under Massive's individual terms the distinction does not save you, because the
terms prohibit both, in three separate places, and one of them names display explicitly.**

1. **§5(c)** bars transferring Market Data *or Derived Works* "to any third party" **and**, as a
   separate limb joined by "or", bars use "for business or commercial purposes." Publishing to
   site visitors engages the first limb whether or not the site earns a cent.
2. **§2** independently bars Market Data being "publicly displayed … or distributed in any way …
   to any other computer, server, website, or other medium for publication or distribution."
   `[V]` This one is about **display**, not resale, and it names websites.
3. **§1** independently bars building "an application intended for use by end users other than you."
   `[V]` A public breadth dashboard is exactly that.

So: the prohibition here is **not** narrowly aimed at re-serving the feed. It reaches display, and it
reaches derived analytics by name. `[V]` A cautious reading and a plain reading agree, which is
unusual and worth noting — normally I would flag this as the ambiguous part. It isn't.

**What is genuinely ambiguous** is the outer edge of "derived from." Read at maximum breadth, a count
of stocks up >4% is "based on … the Market Data" and never stops being so, no matter how aggregated.
Read narrowly, a scalar that cannot reconstruct any price is not the thing the clause protects.
Massive's terms, unlike Tiingo's (§8), **draw no reconstruction line at all** — there is no
carve-out for irreversible aggregates. `[V]` Absent that carve-out, the breadth-vs-movers distinction
that would matter elsewhere has nothing to hang on here. This is where a lawyer would be earning
their fee, but the answer under the text as written is not close.

**One consequence worth stating for the market-scans spec specifically:** even the *most* aggregated
page in `phase-1-spec.md` — pure breadth, no tickers — is not obviously safer than the movers scan
under these terms. The two fail together. Do not spend design effort trying to make a
"licence-safe subset" of the current spec; there isn't one on this supply.

---

## 5. The private journal — the use already in production

**Verdict: clear.** `[I]`, resting on `[V]` facts.

Single user, own trading, no publication, output not offered to anyone else. That is the fact
pattern the Non-Professional individual licence exists to permit, and the enrichment columns
(%ATR, RVOL, %VWAP, PDC/PDH/PDL, O/H/L/C/V, VIX) are ordinary personal analysis of Market Data,
expressly contemplated by §1.

**Verified rather than assumed:** `https://tapereader.us/pct-bootcamp/trade-journal` returns
**HTTP 302 to Cloudflare Access** (`gwinsingh.cloudflareaccess.com`), with a
`www-authenticate: Cloudflare-Access` header. Measured today. `[V]` The journal is genuinely gated,
not merely unlinked. Good — the alarming version of this finding is not true.

**Two conditions to check, both cheap:**

1. **Non-Professional status is a continuing warranty, not a checkbox.** The NYSE schedule §12
   requires, among other things, that you not trade others' capital, not share trading profits, and
   not receive compensation or benefits for trading or financial consulting. `[V]` "PCT Bootcamp"
   implies a coaching context. If any bootcamp arrangement involves compensation for trading-related
   work, professional status attaches — and Massive reserves the right to **retroactively invoice
   the pro/non-pro difference back to subscription start**, charged to the card on file. `[V]` That
   is the concrete downside risk, and it is financial rather than legal.
2. **"Shared Google Sheet" needs one look.** NYSE schedule §5: *"Subscriber shall not furnish Market
   Data to any other person or entity."* `[V]` If the sheet's Polygon-derived enrichment columns are
   visible to anyone but the account holder, that clause is engaged regardless of how private the
   web UI is. The web gate does not cover the spreadsheet. **Action: confirm the sheet is shared
   only with the service account and the one human.**

Neither condition is about the app's code. Both are about facts outside the repo.

---

## 6. What would it cost to get terms permitting public display?

Real numbers, not "contact us" — Massive publishes them and self-serves the checkout. `[V]`

| Route | Cost | Notes |
|---|---|---|
| **Massive Stocks Business** (annual) | **$1,599/mo** ($19,188/yr) | `license_type: commercial`, self-serve |
| Massive Stocks Business (12-mo commitment, monthly) | $1,999/mo | |
| Massive Stocks Business (no commitment) | $2,499/mo | |
| — with 25% startup discount, if granted | ≈ $1,199–1,874/mo | Email application, first year only `[V]` |

Crucially, the base Business plan is advertised as **"No Exchange Fees or Approvals"** and
**"no exchange reporting requirements"** — it delivers Massive's own Fair Market Value blend plus
100% EOD coverage, deliberately engineered to sit outside exchange entitlement. `[V]` So the
$1,599–2,499 is **Massive's own licence fee**, not an exchange pass-through. Nothing about
TapeReader needing only T-1 EOD data reduces it. There is no cheaper EOD-only commercial SKU.

**For the study's budget ladder: this is a Rung 4+ number.** It is ~160–250× the $10/mo cap and
should be recorded as "proves the ceiling exists", exactly as §1 of the brief intends.

---

## 7. Is exchange licensing the real gate? And is EOD treated better?

**This was the most promising line of inquiry and it half-pays off. The honest answer is: yes, EOD is
dramatically more permissive at the exchange layer — and no, that does not rescue the Polygon route,
because Polygon/Massive's restriction is contractual and self-imposed.**

Databento publishes the clearest public explanation of US market-data licensing mechanics. Their
licensing FAQ (`databento.com/blog/introduction-market-data-licensing`, `/understanding-exchange-fees`,
`/subscriber-status`) states `[V]`:

- §1.1 — *"You need a license to access real-time (live, intraday) market data if you're a
  professional user or if you're distributing data externally within 24 hours of receipt. You do NOT
  need a license to access historical (T+1) data."*
- §2.5 — *"Anything T+1 (24 hours and earlier) doesn't require a license."*
- §1.8 — a licence **is** required for 15-minute-delayed data; delayed is cheaper than real-time but
  not free. **Delayed ≠ historical.** These are different regulatory animals and conflating them is
  the classic error here.

**TapeReader's stated freshness target is T-1, through yesterday's close.** That lands on the
permissive side of the line, not the delayed-intraday side. `[I]` That is a genuinely good structural
position and it is the reason a supplier switch can actually fix this.

**Two caveats that stop this from being a clean win — do not skip these:**

1. Databento §1.7 lists exceptions where a licence *is* needed for historical data, and the first is
   **"You plan to redistribute the data."** `[V]`
2. Databento §3.3: **"some exchanges require a redistribution fee for historical data as well as
   real-time data."** `[V]`

So the T+1 exemption is an exemption from **access** licensing, not from **redistribution**
licensing. Public display of per-ticker T-1 bars may still touch venue redistribution terms at some
exchanges. Aggregate breadth counts are much further from that line than a ticker-level movers table
is — and unlike Massive, several vendors *do* draw that line explicitly (§8).

**Scale, for orientation** `[V]`: direct proprietary feeds cost vendors ~$60,000/mo to license; the
SIPs ~$10,500/mo; Nasdaq's minimum professional real-time bundle ~$2,051/mo. This is why every
consumer-tier vendor pushes the personal/non-commercial covenant down to the end user — they are
managing an obligation that is genuinely enormous upstream. It also explains why the constraint feels
disproportionate to a solo dev's free tier: it isn't aimed at you.

**Net:** the exchanges are not what is stopping TapeReader at T-1. Massive is. That is fixable by
changing supplier in a way that an exchange encumbrance would not be.

---

## 8. Alternatives

Every mainstream vendor uses the same two-track shape. **None permits public display of derived
analytics on a free tier**, and I found no exception. `[V]` across all rows below.

| Vendor | Free/individual tier | Public display of derived analytics | Cheapest route to permission |
|---|---|---|---|
| **Tiingo** | Starter $0; Power $30 (individual) / $50 (internal commercial) | **Partially permitted outright — see below** | Redistribution licence, **quote-only** |
| **Twelve Data** | Basic $0 · Grow $29 · Pro $99 · Ultra $329 — all "personal or internal use" | **Business plans permit "commercial display … to third parties"** | **Venture $499/mo** ($414/mo annual). Cheapest self-serve display licence found |
| **Databento** | Usage-based, $0.40/GB historical; Standard $199/mo; $125 free credits | Standard is not a distribution licence; **Plus $1,750/mo lists "external distribution rights"** | $1,750/mo — but see DBEQ note below |
| **EODHD** | Free; EOD All-World $19.99/mo; All-in-One $99.99/mo — non-professional | Commercial **"Internal Use" $399/mo explicitly does NOT permit external display** | **Enterprise $2,499/mo** or Custom |
| **Massive** (Polygon) | $0–$199, all `personal` | No | **$1,599–2,499/mo** |
| **FMP** | Basic free · Starter $22 · Premium $59 · Ultimate $149 — all "Individual" | No | "Data Display and Licensing Agreement", **quote-only** |
| **Alpaca** | Basic free (IEX) · Pro $99 (SIP) | No — non-professional, *"shall not furnish Market Data to any other person or entity"* | Not self-serve |
| **Alpha Vantage** | Free + premium | No — "commercial use" is defined to include *any purpose beyond … activities that are private and individual in nature* | Quote-only |
| **Finnhub** | Free + paid | No — bars sharing *"derived results from the data"* by name | Written approval, quote-only |
| **Nasdaq Data Link** | Per-dataset | Dataset-specific; derived-data distribution generally not permitted under standard licences | Per-dataset, quote-only `[R]` |
| **marketstack** | Free = personal/evaluation | No | Paid/quoted `[R]` |

### The two that actually deserve a follow-up email

**Tiingo — the only vendor whose terms contain an explicit, reasoned derived-data carve-out.**
ToS §1.6(c) (last updated 2026-08-05) permits creating, retaining, using **and distributing** a
Derived Product without separate approval, provided it (i) is not a substitute for the data and
(ii) cannot reasonably be reverse-engineered to recover the underlying data. `[V]` The
explicitly-listed permitted examples include *"aggregated statistics calculated across multiple
instruments or time periods, such as averages, medians, volatility measures, correlations,
percentiles, or distributions"* and *"rankings, scores, trading signals, classifications, forecasts."*
`[V]`

**That is a near-exact description of the market-scans breadth page.** "412 stocks closed up more
than 4% today" is an aggregated statistic across instruments that reconstructs no price.

The prohibited list is equally explicit, and it catches the *other* half of the spec: *"tables,
files, feeds, APIs, databases, dashboards, charts, downloads, or query tools that display, deliver,
or permit extraction"* of the data. `[V]` **So under Tiingo's terms as written, the breadth
dashboard is permitted and the ticker-level movers table is not.** That is precisely the
display-vs-redistribution line the task asked me not to blur — and Tiingo is the one vendor that
draws it for you rather than leaving you to argue it.

Two blockers before treating that as a green light:
- **§7.3 says "All data via the API is for internal consumption only"** and requires a separate paid
  licence for redistribution. `[V]` This sits in genuine tension with §1.6(c)'s grant of a right to
  *distribute* a compliant Derived Product. **I cannot resolve that tension from the text and I am
  not going to pretend otherwise** — §1.4(h) hints §1.6 is meant to be the carve-out that overrides
  the general bar, but "hints" is the honest word. **This is the single most valuable question to
  put to a vendor in writing**, and it is free to ask.
- **Starter (free) forbids persistent storage entirely** — no writing data to "databases, object
  stores, file systems, logs, queues, archives, backups." `[V]` That rules out a free-tier Tiingo
  backing a D1 daily-bar store. A paid plan ($30/mo) is the floor for the market-scans architecture.

**Databento — the only vendor that has bought down the exchange layer on your behalf.** Its
**US Equities Mini** / **DBEQ** bundle (NYSE Chicago, NYSE National, IEX, MIAX Pearl) carries
**$0 exchange licence fees** and is described as *"free to license for distribution, display, and
non-display applications"* and *"ideal for web apps"*, with *"permissive distribution terms for web
applications"* and no exchange reporting. `[V]` Databento holds a derived-use licence with those
venues specifically for redistribution, so end users inherit it. `[V]` Separately, **all plans
include US Equities Summary — official EOD prices and 100% delayed volume across all exchanges and
ATSs** `[V]`, which is exactly the market-scans input.

The unresolved bit: the $199/mo Standard plan's relationship to *Databento's own* distribution
rights, given that Plus ($1,750/mo) advertises "external distribution rights" as a differentiator.
The **exchange** side is settled and free; the **vendor** side is not, from public pages alone.
`[I]` Worth one email, and the $125 signup credit makes evaluation genuinely free.

---

## 9. What is genuinely ambiguous, and what warrants a lawyer

**Not ambiguous — settled by the text** `[V]`:
- Massive individual tiers forbid public display of Market Data and Derived Works. Three
  independent clauses; no reconstruction carve-out; no delay-based carve-out.
- A commercial licence from Massive exists and costs $1,599–2,499/mo.
- Private single-user journal use is permitted.
- T+1 historical data needs no exchange **access** licence.

**Genuinely ambiguous — flag, don't resolve** `[I]`:
1. **Tiingo §7.3 vs §1.6(c).** Internal-consumption-only vs an express right to distribute compliant
   Derived Products. Ask Tiingo in writing. Cheapest possible unlock of the whole plan.
2. **Whether a free, non-monetised site is "commercial."** Irrelevant for Massive (display is barred
   independently of commerciality), but decisive for vendors whose only hook is "commercial use."
   Do not build on the assumption that free = non-commercial; Alpha Vantage's definition alone
   defeats it.
3. **Redistribution fees on historical data at specific venues.** Databento says some exchanges
   charge them; which ones, and whether irreversible aggregates trigger them, is not public.
4. **Whether facts are protectable at all.** US law does not protect facts as such, and these
   restrictions are contract terms rather than copyright claims. That is a real distinction and a
   real limit on what the vendor can assert against downstream aggregates — **and it is exactly the
   kind of argument that is comforting in the abstract and worthless in a dispute you did not want
   to have.** Not a basis for shipping.

**Warrants actual legal review, if and only if the public product is going ahead:** items 1 and 3,
plus the specific wording of whichever supplier is chosen. Nothing here needs a lawyer *today* —
nothing is shipping tonight, and the journal is fine.

---

## 10. Recommendation

1. **Do not derail the market-scans spec.** `docs/market-scans/phase-1-spec.md` is a data-supply
   problem, not a design problem. The scan formulas, D1 schema, free-tier pacing and GitHub Actions
   ingest are all supplier-agnostic and all survive intact. What changes is one adapter.
2. **Keep Polygon/Massive for the private journal.** It is licensed for exactly that, it is already
   built, and it costs nothing. Check the two conditions in §5.
3. **Do not publish Polygon/Massive-derived data on tapereader.us** under the current key — not
   breadth, not movers, not news sentiment, monetised or not.
4. **Send two emails** (free, no signup, no commitment): Tiingo on the §7.3/§1.6 tension; Databento
   on whether Standard's DBEQ/Summary data may back a public breadth page. Either could unlock the
   public product for ≤$30/mo, and both are cheap to ask. Add these to Track K's checklist.
5. **Record for the cost ladder (Track G):**
   - Rung 0–1 ($0–10): no vendor permits public display of derived US equity analytics. **Confirmed
     with no exception found.** The keyless/aggregator sources in Track A are the only Rung-0 route
     to a public page, and their terms are a separate question.
   - Rung 2 ($25–50): Tiingo Power $30 or Twelve Data Grow $29 — **private analysis only**, and
     Tiingo $30 is the minimum for a persistent bar store. The pending Tiingo answer could move a
     breadth-only page down to this rung.
   - Rung 3 ($100–200): Databento Standard $199 — best data, distribution rights unconfirmed.
   - Rung 4 ($500+): **Twelve Data Venture $499/mo is the cheapest confirmed self-serve public-display
     licence in the entire survey.** Then Databento Plus $1,750, Massive Business $1,599–2,499,
     EODHD Enterprise $2,499.

**The one-line version:** the finding was right, the reasoning was one step short, the fix is a
different supplier rather than a different design — and the journal was never at risk.

---

### Sources (all fetched 2026-09-08)

Massive: `/legal/terms` · `/legal/individuals-terms-of-service` (2025-07-18) ·
`/legal/businesses-terms-of-service` (2025-09-02) · `/legal/market-data-terms-of-service` (2025-08-28) ·
`/pricing` · `/business` · `/business-stocks` ·
`/knowledge-base/article/how-can-i-redistribute-massives-market-data` ·
`/knowledge-base/article/what-are-pro-and-non-pro-classifications-for-massives-stock-data` ·
superseded PDF `/terms/market_data_terms.pdf` (2024-10-09, Polygon.io, Inc.)

Databento: `/blog/introduction-market-data-licensing` · `/blog/understanding-exchange-fees` ·
`/blog/subscriber-status` · `/equities` · `/pricing`

Tiingo: `app.tiingo.com/tos/` (2026-08-05) · `/about/pricing`
Twelve Data: `/terms` (2026-01-01) · `/pricing` · `/pricing-business` ·
`support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage` (2026-08-04)
EODHD: `/financial-apis/terms-conditions` · `/pricing` · `/commercial-pricing`
FMP: `/terms-of-service` · `/pricing-plans` · Alpaca disclosures library ·
Alpha Vantage `/terms_of_service/` · Finnhub `/terms-of-service`

tapereader.us: HTTP 302 → Cloudflare Access on `/pct-bootcamp/trade-journal` (read-only check)
