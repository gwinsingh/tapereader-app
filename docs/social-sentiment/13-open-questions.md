# 13 — Open Questions & Run Incidents

Live file. Anything that could not be settled during the run, plus incidents
that affect how much to trust a given track. Updated as the run proceeds.

---

## Blocking-ish, ranked

### 1. ⚖️ Polygon licensing may forbid public display of derived analytics
**Status: under independent verification.**

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

## Questions for the trader (not researchable)

- The capture target used by the journal defaults to 2.5R. Should the sentiment
  hypotheses be evaluated against that same target, or against realised R?
  Affects Track D2's primary outcome variable.
- How many trades per month, currently? Track D2's power analysis needs a real
  accrual rate to say when H1–H5 become answerable rather than guessing.
