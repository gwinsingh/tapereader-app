# 13 — Open Questions & Run Incidents

Live file. Anything that could not be settled during the run, plus incidents
that affect how much to trust a given track. Updated as the run proceeds.

---

## Blocking-ish, ranked

### 1. ⚖️ RESOLVED — Polygon/Massive forbids public display. The planned public market-scans product cannot ship on this data.
**Status: verified. CONFIRMED on the text, with one material correction.**
Full detail in `.wip/polygon-licensing-verification.md`.

**This is not a social-sentiment finding.** It lands on
`docs/market-scans/phase-1-spec.md` — a fully designed, unbuilt product — and it
predates this study entirely. It surfaced here by accident.

**What was verified:**
- Massive's pricing pages carry a machine-readable `license_type`. **Every
  individual plan — free through the $199/mo Advanced tier — is `personal`.**
  Every business plan is `commercial`. Massive's own KB: any user wishing to
  redistribute market data must be on a business product. **Paying more on the
  consumer ladder buys rate limit and history, not licence scope.**
- Stocks Business, the tier that lifts it, is **$2,499/mo** ($1,599 annualised).
- polygon.io → massive.com is a **rebrand, not an acquisition** (2025-10-30,
  same entity). `api.polygon.io` still works; no code change needed.

**Correction to the original claim:** "regardless of plan tier" was wrong as
stated — it holds for all *individual* plans, and a tier does exist that lifts
it. The original reached the right conclusion one step short of the reasoning.

**Display vs redistribution does not rescue it.** That distinction was worth
testing and it fails here: Massive prohibits both across three independent
clauses, one naming public display and websites explicitly, with no
reconstruction carve-out. **Breadth aggregates and the movers table fail
together — there is no licence-safe subset of the current spec to design
toward.**

**What is NOT affected — three corrections from verifying rather than assuming:**
1. **The private trade journal is clean.** `/pct-bootcamp/trade-journal` returns
   302 to Cloudflare Access. It is gated, single-user, and squarely inside the
   individual licence. The alarming version of this finding is simply false.
2. **EOD/T-1 genuinely is more permissive** — Databento states anything T+1 or
   earlier needs no exchange licence, and TapeReader's T-1 target lands on the
   right side. But that is an exemption from *access* licensing, not
   *redistribution*, so it helps without self-rescuing.
3. **The blocker is a vendor contract, not an exchange encumbrance.** This is
   why changing supplier is a genuine fix rather than a shell game — exchange
   rights would follow the data to any vendor.

**Routes forward, cheapest first:**
- **Tiingo** is the one vendor whose terms explicitly permit distributing
  irreversible derived aggregates — "aggregated statistics calculated across
  multiple instruments" is a listed permitted example, which describes the
  breadth page exactly. A movers *table* is still excluded. **But §7.3
  ("internal consumption only") is in real tension with §1.6(c)'s distribution
  grant and could not be resolved from the text.** Highest-value free question
  to ask a vendor.
- **Databento DBEQ** carries $0 exchange fees with distribution/display rights;
  only its vendor-side rights at the $199 tier are unclear.
- **Cheapest CONFIRMED self-serve public-display licence found anywhere in the
  survey: Twelve Data Venture, $499/mo. Nothing at $0–10 permits it, from any
  vendor.** That is a direct, evidenced answer to the budget-ladder question.

**Two live exposures that sit outside the repo and could not be checked:**
- Continuing **Non-Professional status** — Massive retroactively bills the
  pro/non-pro difference to the card on file.
- **The shared Google Sheet.** The web app is gated, but the journal writes
  Polygon-derived columns into a Google Sheet that `CLAUDE.md` describes as
  *shared*. The exchange schedules bar furnishing Market Data to any other
  person, and Cloudflare Access does not cover a spreadsheet. **If anyone other
  than the account holder can open that sheet, that is the one genuinely live
  exposure found tonight.** Worth checking who it is shared with.

#### Original claim, for the record

Track H reported, incidentally, that Polygon's Market Data ToS grants data
"exclusively for your personal, non-business, and non-commercial purposes"
regardless of tier, and defines "Derived Works" broadly enough to cover charts
and analytics `[V, single read]`. It also noted polygon.io appears to redirect
to massive.com — a rebrand or acquisition.

**Why this outranks everything else in this file:** it is not a
social-sentiment question at all. `docs/market-scans/phase-1-spec.md` is a
fully-designed, unbuilt product that publishes Polygon-derived bars, breadth
and scan hits publicly on tapereader.us. If the reading is right, that product
has a licensing problem that predates this study. The private trade journal —
single user, nothing published — is in a materially safer position.

A verification pass is running. It is specifically checking the most likely
route to a clean answer: **EOD/delayed data is often licensed far more
liberally than real-time, and TapeReader's stated freshness target is T-1.**
Do not act on the pessimistic reading until that returns. Do not let it derail
the sentiment study either — the journal use case is unaffected on any reading.

### 2. Reddit's Data API Terms were never actually read
Every Reddit claim in Track H is tagged `[R]`. The research environment could
not reach `redditinc.com`, `reddit.com`, `support.reddithelp.com`, or
`web.archive.org`. Reddit is plausibly the highest-signal social source in the
whole study, so its terms being unverified is a real gap, not a footnote.
**Action:** read the Data API Terms through the in-app browser and re-tag.

### 3. Unverified terms pages
Marketaux (HTTP 403) and X's consumer ToS (HTTP 402) could not be fetched.
Claims resting on them are `[R]` at best.

### 4. ✅ RESOLVED — FINRA short-sale volume files
**Both tracks were right, about different channels to the same bytes.** Neither
knew about the other's route. Full detail in `.wip/finra-terms-resolution.md`.

- **`cdn.finra.org` flat files** (what Track C measured, 8.1 years) are governed
  by the site Terms of Use, which ban harvesting, database-building, display and
  redistribution — and include a clause prohibiting use with predictive
  analytics models, which describes this study's hypotheses almost verbatim.
  **Track H's BLOCKED verdict stands, unmodified.**
- **The Query API** (`api.finra.org/data/group/otcMarket/...`) is governed by the
  *Specific Terms for Equity Data*, which expressly permit derivative data,
  permit redistribution of derived data to end users with attribution, impose
  **no retention limit**, and explicitly contemplate publishing on a website.
  The site ToU defers to it by its own conflict clause. **Cost: $0.**

**Practical answers:** private journal use — yes via API. Public derived
metrics — yes via API with attribution and no charge, no via CDN. Automated
collection — yes against the API (1,200 req/min), no against the CDN.

**The catch that decides the build: the API is a 365-day rolling window.** The
8.1 years exist only on the blocked CDN. So the licensed route accrues forward
with no backfill, which puts FINRA in the same accrual-urgency class as
ApeWisdom, just with a year of runway instead of none.

**Two items genuinely warrant legal review** before anything public ships:
whether a free public site counts as redistribution "to End Users for
non-commercial personal or professional use", and whether the Specific Terms'
"Exceptions to Terms of Use — Not applicable" means no exceptions attach (our
reading) or reimports the site ToU (which would flip the public answer back to
blocked). That second one is the likeliest place this is wrong.

**Also for Track F:** the "no charge" condition is the one most likely to break
later — ads or a paid tier anywhere near this data reopens the non-commercial
limit. And do not build a public endpoint that dumps the raw panel; that reads
as bulk distribution.

#### Original contradiction, for the record

- **Track C** measured the daily short-sale volume flat files as keyless, with
  **8.1 years of history** (boundary measured at 2018-08-01), 12,217
  symbols/day, same-day availability at 17:18 ET, and 82 files pulled
  concurrently with zero 429s. It is the strongest free historical
  crowd-positioning series found anywhere in the run.
- **Track H** read FINRA's Terms of Use as separately prohibiting automated
  retrieval, database-building, redistribution, and non-personal use.

**Technically open and contractually restricted are not mutually exclusive** —
that combination is common, and it is exactly the trap this run is supposed to
catch. Resolution needed before Track I builds a collector against it:
1. Which FINRA property's ToU actually governs the **short-sale volume flat
   files** specifically? FINRA's site-wide terms may not be the operative
   document for a published regulatory data file.
2. Does the split hold that the private journal may use it while the public
   page may not — the same split that applies to Polygon?
3. Is there an official redistribution or bulk-data path?

~~Until resolved, treat FINRA short-sale volume as private-journal-use
candidate.~~ **Resolved above: use the Query API, not the CDN.**

### 5. The empirical result on short-volume was honestly null — keep it that way
Track C found short-volume ratio vs next-day return **r = −0.0035**: no
univariate edge. It also found a monotone breakout-day tercile gradient
(+1.41% / +3.54% / +6.37%) on **n=14 per bucket**, and correctly reported it as
a hypothesis rather than a result. Track D2's pre-registration must inherit
that discipline — an n=14 gradient is exactly the shape of thing that becomes a
"finding" if nobody guards it.

### 6. ⚠️ CROSS-TRACK CONTRADICTION — StockTwits (the FINRA pattern, again)
**Track A1–A3 says it is the find of the run. Track H says blocked. Unresolved.**

- **A1–A3 measured** the documented v2 endpoints serving public data with **no
  key at all**: 0.14s latency, 8.9 req/s across 60 consecutive requests with
  zero throttling and no rate-limit headers, no pagination wall at 120 pages.
  The **human-declared Bullish/Bearish tag is live** in
  `entities.sentiment.basic` on 45.4% of messages and persists retrospectively
  (47.9% on a 900-message walk back a month). Cashtags are **structurally
  pre-parsed** in `tokenized_body`, so ticker resolution is free and exact —
  which is the single hardest problem in every other social source.
- **Track H read** the StockTwits ToS as expressly naming and banning scraping,
  with developer registration closed pending review.

**This is the FINRA shape again: technically open, contractually questionable.**
The specific unresolved question is narrower than "is scraping allowed" — it is
whether **unauthenticated requests to documented public v2 API endpoints**
constitute scraping under those terms, or ordinary API use that merely lacks a
key because registration is shut. Those are genuinely different things and the
answer decides whether the best social source in the run is usable.

Until resolved: **do not add StockTwits to the collector.** Treat it as a
private-journal candidate at most.

### 7. 🔴 Track D2's power analysis may be too pessimistic — StockTwits history is WALKABLE
D2 assumed social features exist only from 2026-09-08 forward, so "the counter
starts at zero" and no discovery/replication split is possible on social data.

**A1–A3 measured otherwise:** message history is walkable backwards — AAPL 14
days, **AUPH 4 months (3,590 messages) at ~30s per ticker**. Depth is inversely
related to message volume, so thin single-name breakout candidates reach back
*further* than megacaps — which is exactly the population the study cares about.

If StockTwits clears §6, **existing journal trades could be scored
retroactively**, and D2's central constraint changes. That would not rescue the
small-effect arithmetic, but it could bring the large-effect horizon forward
substantially and enable the locked discovery/replication design on social as
well as news. **Track D2 needs a revision pass once §6 is settled.**

### 8. Two operational facts that would have broken the collector silently
- **Reddit blocks datacenter IPs.** Every keyless route — `.json`, RSS,
  old.reddit, the oauth host — returns 403. **GitHub Actions will be blocked
  too.** Any Reddit collection must go through Arctic Shift, which is keyless,
  free, and measured at **~4 minutes behind live** while also serving 2021 data
  (contradicting third-party claims of a 4–6 week lag).
- **Arctic Shift archives at post time**, so `score` and `num_comments` read 0–1
  for roughly 36 hours. A live collector and a later backfill of the same day
  **will disagree**. Any model using score would train on values unavailable in
  real time — a clean look-ahead trap. Pre-registration must exclude
  score-derived features or window them past 36h.

### 9. Reddit ticker resolution is the real blocker, now quantified
Only **0.6%** of WSB comments use a cashtag, so bare-token extraction is
forced — and **39 of 51** common English words tested are real US tickers
(`$OPEN`, `$NOW`, `$ALL`, `$LOVE`, `$WORK`, `$BULL`). A stoplist and a complete
ticker universe are in direct conflict; one of them has to lose. This is why
StockTwits' pre-parsed cashtags matter so much.

---

## Run incidents (affect trust, not conclusions)

### The brief was invisible to the entire first wave
A second Claude session working in this repo switched the shared main checkout
to `main` at 21:42 on 2026-09-08, where `docs/social-sentiment/00-brief.md`
does not exist. All six wave-1 agents were pointed at that path and found
nothing. They ran on their inline task prompts instead — which carried the
constraints, the evidence-tagging discipline and the scope faithfully, so the
practical damage is limited — but **no wave-1 track was written against the
full brief.**

Consequences and mitigations:
- Every wave-1 track file needs a reconciliation pass against the brief before
  the run is called done. Specifically check: budget-ladder placement, the
  history-depth question, and whether dead ends were recorded.
- The brief has been mirrored into the main checkout as an untracked file so
  any still-running agent can read it.
- All subsequent agents are pointed at the **worktree** path, which is stable.
- The brief now carries a hard constraint requiring work in the worktree.

### A commit landed on `main`
The same branch switch misrouted the measured-facts commit (`a159082`) onto
`main`. The content has been re-landed on this branch. Removing it from `main`
needs `git reset`, which the permission classifier blocked — left for the user
to run or decline. It is a docs-only addition and harmless to leave.

---

## Questions for the trader

### ✅ Both original questions answered by Track D2
- **Primary outcome** is `Max R Before Stop` (MFE), not the 2.5R capture target.
  H1–H5 are claims about *opportunity*; realised R folds in the trader's own
  exits, so a null on realised R would be uninterpretable.
- **Accrual rate** is measured at 36 trades over 12 traded dates, but the
  governing number is **~18 analyzable trades/month** — see below.

### 🔴 NEW, and it reshapes the product
**Half the trades are index/sector ETFs** — QQQ 7, SPY 6, SOXL 5 of 36 `[V]` —
which carry no usable ticker-level retail-attention signal and are excluded by
construction. Within the surviving half NVDA is 6 of 18, and NVDA sits pinned at
the top of every mention list, so percentile features have almost no variance
on it.

**Question for the trader:** is that ETF-heavy May sample representative of how
you trade now? If yes, the trade-level correlation study is close to hopeless on
any useful horizon and the effort belongs in the universe-level scan instead. If
May was unusual and you now trade mostly single names, the arithmetic improves —
but not by enough to rescue small effects.

### 🔴 `Catalyst` is 100% blank across the whole export
Not a caveat — a blocker for any catalyst-conditioned analysis, and it makes the
EDGAR auto-population from Track B considerably more valuable than it looked.

### 🔴 `Conviction (1-3)` is 61% blank
Usable as a covariate, never as a stratifier.
