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
