# 10 — Build Plan

**Track I.** The document an engineer executes from. Dated critical path, storage
decision with the arithmetic behind it, feature pipeline, monitoring, secrets,
effort, and the list of things that must not be built yet.

**As-of: 2026-09-09** (written in the overnight run that began 2026-09-08).

**Evidence key:** `[V]` verified/measured on the source's own material · `[R]`
reported by third parties · `[I]` our inference.

**Binding inputs.** `04-signal-design.md` defines what must be computed and is
binding on this document. `05-preregistration.md` defines when it may be looked
at and is binding on both. This document decides only *where code runs and where
bytes live*. Where it disagrees with either, they win.

---

## 0. The critical path, dated

### 0.1 The one hard deadline, restated and then substantially defused

`13-open-questions.md` §13 is the only dated blocker in the entire run:

> the confirmatory test (H5) needs a daily-bar store; `market_db` does not exist;
> **daily-bar collection must start by ~2026-09-15** to hold the ~December 2026
> answer date.

**That deadline is real, and it is much cheaper to hit than §13 assumes — because
the bar store does not have to be D1, and does not have to be paced.**

Three facts decide this:

1. Bars are **backfillable**. Polygon grouped-daily serves any past date `[V]`.
   Unlike the social snapshots, nothing is permanently lost by starting late
   (`04-signal-design.md` §8 says this explicitly). The 2026-09-15 date is a
   *schedule* constraint, not a *data-loss* constraint.
2. The **~11-day backfill pacing** in `docs/market-scans/phase-1-spec.md` §7 is
   imposed by **D1's 100k-rows-written/day free-tier cap**, not by Polygon `[V]`.
   Remove D1 from the write path and the pacing constraint evaporates.
3. Polygon's measured limit is **5 req/min** `[V]`, i.e. 13 s spacing — the value
   already hardcoded as `POLYGON_SPACING_MS` in `scripts/market-ingest.mjs`.
   **One call = one full session** (12,424 tickers, 1.36 MB) `[V]`.

   > 252 sessions × 13 s ≈ **55 minutes of pacing**, plus fetch/parse ≈
   > **60–70 minutes total** `[I, arithmetic on two measured constants]`.
   >
   > **A full year of daily bars is one GitHub Actions run**, comfortably inside
   > the 6-hour job ceiling. Not eleven days. One run.

**Consequence, and it is the most useful thing in this document:** the H5
blocking dependency is cleared by adding a **file sink** to a script that already
exists, and running it once. Estimated **4–6 hours of work** and **~70 minutes of
unattended runtime**. Creating `market_db`, applying migrations, wiring Cloudflare
secrets and pacing an 11-day backfill are **all off the critical path**.

### 0.2 The dated sequence

Dates are the **latest** each item can start without pushing the December H5 date.
Everything before 2026-09-15 is one working session.

| # | Date (by) | Item | Depends on | Blocks |
|---|---|---|---|---|
| **C1** | **2026-09-10** | Get the untracked market-ingest work under version control on a branch (see §1.2 — it is currently at risk of loss) | — | C2, C3 |
| **C2** | **2026-09-12** | Add `--sink file` to `scripts/market-ingest.mjs`; store **unfiltered** grouped rows as NDJSON (§2.4) | C1 | C3, C4 |
| **C3** | **2026-09-14** | Commit `market-ingest.yml` to the **default branch** with a `daily` cron only (backfill stays `workflow_dispatch`) | C2 | C5 |
| **🔴 C4** | **🔴 2026-09-15** | **Run the one-shot bar backfill** `--mode backfill --sink file --start 2024-01-01` (~90 min, ~420 sessions) | C2 | H5 outcome variable; `apdv_resid`; the §8.1 gate |
| **C5** | **2026-09-15** | Daily bar ingest verified running (two consecutive green days) | C3 | continuity of the panel |
| **C6** | **2026-09-16** | Harden + enable the **social** cron: **exit non-zero on failure (S9)**, DST dual-cron, ET-clock guard (§1.3, §4.6) — **on the default branch** | — | every social feature |
| **C7** | **2026-09-22** | Monitoring harness v1 live (§4) — staleness, row floors, variance, schema | C5, C6 | trustworthiness of everything downstream |
| **C8** | **2026-09-26** | Freeze the two denylist files (`R1.1` authors, `R2.1` tickers) — **frozen before any window** | — | H1/H2 reportability |
| **C9** | **2026-09-30** | Land the three `⚑A1` / `⚑A2` / `⚑A3` amendments in `05-preregistration.md` §10, **dated, before any outcome is examined** | — | H5 being reportable at all |
| **C10** | **2026-10-06** | Feature pipeline v1 emits `mentions_z20` (first computable date — needs 20 sessions) | C4, C5, C6 | H1/H2 predictors |
| **C11** | **2026-10-09** | **The cheapest falsifying experiment** (§7.3): run the pre-registered §8.1 RVOL gate + the `⚑A2` joint distribution. **Outcome columns are not read.** | C9, C10 | whether to continue at all |
| **C12** | **2026-12-07** | 90 sessions of paired 09:05/16:05 snapshots exist → H5 is computable | C6 continuity | the confirmatory test |
| **C13** | **2027-01-04** | First pre-registered analysis window | C12 | — |

### 0.3 What actually slips if 2026-09-15 is missed

The dependency is **90 paired social snapshot days**, which is fixed by C6 and
started 2026-09-08. Bars can be backfilled at any time. So:

| Miss | Consequence |
|---|---|
| **C4 slips days-to-weeks** | **Nothing slips.** Bars for Sep–Dec are still retrievable in one run in November. The December date holds. |
| **C4 slips past ~2026-11-20** | Still recoverable, but the run must now also produce the ADR lookback and the §8.1 gate inputs in the same fortnight as the analysis. Compresses C11 out of existence — you lose the *early kill*, not the answer. |
| **C6 slips, or the social cron silently fails** | **This is the real deadline.** Every missed 09:05 or 16:05 slot is a permanently unrecoverable H5 observation `[V]`. A two-week outage in October pushes the 90-session date into January and takes H5 past its own first window. |
| **C9 slips past the first H5 data being examined** | H5 becomes unreportable as a confirmatory result. An undated amendment voids it (`05` §10). This is a one-hour task and it is on the critical path for *credibility*, not for data. |

> **Correction to the framing in §13.** §13 says "daily-bar collection must start
> by ~2026-09-15." Measured against what actually exists, the binding item is not
> bar collection at all — it is **social snapshot continuity**, which started on
> time and is the only thing in the study that cannot be repurchased. The bar
> deadline should be read as *"do not let the D1 dependency turn a one-hour task
> into a three-month excuse"*, and this plan removes the D1 dependency entirely.

---

## 1. What already exists — verified against the files, not against the docs

### 1.1 The social collector: real, running, and honest about it

`scripts/social-ingest.mjs` + `.github/workflows/social-ingest.yml`, both present
in this worktree `[V]`.

| Claim | Verified |
|---|---|
| Runs with zero dependencies, zero env vars | `[V]` — no imports beyond `node:fs/promises`, `node:fs`, `node:path` |
| Six ApeWisdom filters, paged 100/page, 400 ms spacing | `[V]` |
| Tradestie adapter with `sentiment`/`sentiment_score` **deliberately dropped** | `[V]` — and correctly commented with the reason |
| Uses `tradestie.com`, not the documented `api.tradestie.com` (expired cert) | `[V]` |
| Browser-ish UA set (Tradestie 403s a default UA) | `[V]` |
| Idempotent per `(scope, slot)` per date | `[V]` |
| ET-aware slotting via `Intl.DateTimeFormat` | `[V]` |
| Cron **commented out**, per the brief's "reviewed decision" rule | `[V]` |
| One real capture on disk: `data/social/apewisdom/2026/2026-09-08.ndjson`, 496 KB | `[V]` |
| **Buffer-then-merge per scope** — a scope is written only if its full page walk succeeded | `[V]` |
| **Empty first page treated as failure**, not as an empty result (the `count:0` typo trap) | `[V]` |
| **Declared-count cross-check** — `buffered.length` must equal the API's own `count` | `[V]` |
| **`n_scope` completeness witness** stamped on every row | `[V]` |
| Refuses to write at all when no scope completed | `[V]` |

**This is good work and the plan below extends it rather than replacing it.**

> **Note, 2026-09-09:** `scripts/social-ingest.mjs` was hardened *during* the
> writing of this document — the last five rows above are new. Three of the eight
> gaps originally listed in §1.3 are now closed in code. §1.3 is written against
> the **current** file and says explicitly what remains.

### 1.2 The market-ingest pipeline: complete code, at real risk of loss

Verified by listing both trees `[V]`:

| Artifact | Main checkout | **This worktree** | Git state |
|---|---|---|---|
| `web/lib/market/db.ts` | present | **present** | committed |
| `web/lib/market/polygon-grouped.ts` | present | **present** | committed |
| `scripts/market-ingest.mjs` | present | **absent** | **untracked (`??`)** |
| `web/app/api/scan/ingest/route.ts` | present | **absent** | **untracked (`??`)** |
| `web/migrations/market/0001_init.sql` | present | **absent** | **untracked (`??`)** |
| `.github/workflows/market-ingest.yml` | present | **absent** | **untracked (`??`)** |
| `market_db` block in `web/wrangler.toml` | present | **absent** | **modified, uncommitted** |

> ### 🔴 C1 exists because of this row
>
> **Four files that constitute the entire bar-ingest pipeline are untracked in a
> checkout that a second Claude session switches branches on without warning**
> (`13-open-questions.md`, run incidents; the brief §2 names the same hazard) `[V]`.
> An untracked file survives `git checkout`, but does not survive `git clean -fd`,
> and nothing about the situation is protected by intent.
>
> **Also: a `schedule:` trigger fires only from the repository's default branch**
> `[R, GitHub Actions documented behaviour]` — the social workflow's own comment
> already records this. **`market-ingest.yml` sitting untracked on disk has never
> run and cannot run.** Any claim that "market ingest already exists and just
> needs a database" is half true: the *code* exists; the *pipeline* has never
> executed once.
>
> **C1 is therefore not bookkeeping. It is the difference between having this
> work and not having it.**

### 1.3 What is genuinely missing — the honest gap list

Verified by reading both scripts. Ordered by how badly each one bites.

**Social collector:**

| # | Gap | Why it matters | Fix cost |
|---|---|---|---|
| ~~**S1**~~ | ~~Partial capture sealed as complete~~ — **FIXED 2026-09-09.** Each scope now builds into its own buffer and merges only on a fully successful page walk `[V]`. | The highest-severity defect on disk is closed. **Residual:** the guard leans on the vendor's self-declared `count`; when `count` is absent the cross-check is skipped (`declared === null`) and a short-but-non-empty walk still passes. A trailing-median row floor (K4) is the independent second check. | **done** / 1 h residual |
| ~~**S5**~~ | ~~Typo'd filter returns `count:0`, not 404~~ — **FIXED 2026-09-09.** An empty first page is now treated as failure and the scope is discarded `[V]`. | **Residual:** the scope is discarded but the *run still exits 0*, so a permanently misspelled filter is a silent per-scope gap forever. Needs the ledger + exit code, not more parsing. | **done** / see S9 |
| ~~**S4**~~ | ~~Non-2xx writes a truncated snapshot~~ — **FIXED 2026-09-09.** Any non-2xx now discards the whole scope rather than writing what it has `[V]`. | **Residual:** same as S5 — discard without an alarm. | **done** / see S9 |
| **S9** | 🔴 **Nothing ever exits non-zero.** Every failure path is `console.error` + `continue`. Even "NO complete scope this run" returns normally. | **This is now the single most important gap in the collector.** The entire alerting design in §4.5 is "a failed workflow emails the owner" — and a job that always exits 0 never fails. The guards added today detect the failures correctly and then **throw the detection away**. | **1 h, highest value** |
| **S2** | No ET-clock guard on the slot. In EST the 13:05 UTC cron is 08:05 ET and still labels itself `premarket`, claiming the slot so the correct 14:05 UTC run dedups out. | `04` §5.2 requirement 3, verbatim. Silent one-hour DST drift in the signal-bearing slot. | 1 h |
| **S3** | Cron targets 09:15 ET with no retry margin, and the evening slot is `0 0 * * *` — the single most contended cron minute on GitHub Actions `[R]`. | `04` §5.2 requirements 1–2. A 09:15 target firing at 09:40 is look-ahead on a 09:35 entry. | 0.5 h |
| **S6** | No `ingest_log` / completeness ledger. `04` §6/R7 requires one (4 slots × 6 scopes per date). | Without it, "missing" and "zero" are indistinguishable downstream — the exact error R7 exists to prevent. **`n_scope` is now stamped on every row `[V]`, which is the raw material a ledger needs; the ledger itself is still absent.** | 2 h |
| **S7** | No schema assertion on the vendor payload. Docs show `"2"`, live returns `2` `[V]`. | A vendor type/field change lands as corrupt rows, not as an error. | 1 h |
| **S8** | Denylist files (`data/social/denylist/authors.json`, `tickers.json`) do not exist. | `04` §6/R1.1 and R2.1 require them **frozen before the first window**. | 1 h |
| **S10** | Tradestie's adapter received none of today's hardening — a failed date still `continue`s and a short payload is written as-is. | It is a one-shot backfill source, so the blast radius is small, but K5/K6 must cover it. | 1 h |

> **What today's fixes change about the plan:** the collector now *detects*
> three of the failure classes from `08-cost-ladder.md` correctly. It does not
> yet *report* any of them. **S9 — wiring detection to `process.exit(1)` — is
> one hour of work and it converts the guards that already exist into the
> alerting system described in §4.5.** Do it first.

**Market ingest:**

| # | Gap | Why it matters | Fix cost |
|---|---|---|---|
| **M1** | **No file sink.** The only output path is `POST /api/scan/ingest` → D1, which does not exist. | This single gap is what makes §13 read as blocking. Closing it clears the critical path. | 3–4 h |
| **M2** | **The liquidity filter is applied at write time and is irreversible.** `fetchGrouped()` drops everything below $1 / $5M dollar volume before anything is stored. | ApeWisdom's population is small caps: 604 of 787 listed names sit at 1 mention and skew small `[V]`. `apdv_resid` needs `dollar_volume(d−1)` **for the names ApeWisdom lists**, many of which this filter deletes. Recovering them means re-fetching every date. | included in M1 |
| **M3** | `--mode daily` only looks back 10 days. A two-week outage silently loses dates. | Gap detection must be a monitor, not an implicit lookback window (§4.3). | 0.5 h |
| **M4** | No ADR / gap computation anywhere. | H5's outcome variable is `abs(next-session gap) ÷ ADR` and needs 14 prior sessions of H−L. | belongs to §3 |
| **M5** | Never executed. No secrets configured, workflow untracked. | See §1.2. | see C1/C3 |

Everything else in `market-ingest.mjs` — the 13 s pacing, the `ingest_log`
resume, oldest-first backfill ordering, the per-date try/catch, the slice guard
against D1's 50-query ceiling — is correct and is kept unchanged.

---

## 2. Storage architecture — decided

### 2.1 The decision, up front

| Data | Home | Format |
|---|---|---|
| **Raw social snapshots** | **Git, NDJSON** — append-only, never rewritten | `data/social/<source>/<YYYY>/<YYYY-MM-DD>.ndjson` |
| **Raw daily bars** | **Git, NDJSON, unfiltered** | `data/bars/<YYYY>/<YYYY-MM-DD>.ndjson` |
| **Computed features** | **Git, NDJSON, versioned** (primary) | `data/features/v<N>/<YYYY>/<YYYY-MM-DD>.ndjson` |
| **Completeness / health ledger** | **Git, NDJSON + a rendered digest** | `data/social/_health/<YYYY-MM>.ndjson`, `HEALTH.md` |
| **Denylists** | **Git, JSON, frozen** | `data/social/denylist/{authors,tickers}.json` |
| **D1 `market_db`** | **Not created yet.** Deferred to §7. | when a *gated read surface* exists that needs it — not before |

**The boundary, stated precisely:**

> **Git holds everything that is a capture or a deterministic function of
> captures. D1 holds only what an edge request must read at request time.**
>
> Today, no edge request must read any of it — `13-open-questions.md` §1 forbids
> publishing Polygon-derived values on tapereader.us, and no gated UI exists.
> **Therefore D1 currently holds nothing, and creating it is not work, it is
> anticipation.**

### 2.2 The arithmetic that forces it

**Social, measured `[V]`:** 2,078 rows/snapshot, 494 KB raw / 46 KB gzipped.

| | Rows | Raw | Gzipped |
|---|---|---|---|
| One snapshot `[V]` | 2,078 | 494 KB | 46 KB |
| One day (4 slots) | 8,312 | 1.98 MB | 184 KB |
| **One year** | **3.03 M** | **704 MB** | **66 MB** `[V]` |

**If those rows went into D1** — 12 columns, 7 of them TEXT (`source`, `scope`,
`slot`, `date`, `captured_at` (24 chars), `ticker`, `name`), 5 INTEGER, plus
SQLite record overhead and the primary-key index: **~160–190 bytes/row** `[I]`.

```
3.03M rows/yr  ×  ~175 B  ≈  530 MB/yr
```

> **The raw social panel alone exceeds D1's 500 MB free-tier cap inside twelve
> months, before a single daily bar is written.** `[I, from a measured row count
> and an estimated row width]`

And the one-shot import is worse than the steady state:

```
steady state:  8,312 rows/day  ÷ 100,000 cap  =  8.3%          fine
one-shot import of one year:  3.03M ÷ 95,000/day  =  32 days    not fine
```

A 32-day paced import of data that is already sitting in the repo, to get it into
a database nothing reads, is the definition of anticipatory work.

**Bars:**

| Variant | Rows/session | Rows/yr (252) | D1 size | NDJSON gzipped/yr |
|---|---|---|---|---|
| Filtered ($1 / $5M) | 4,174 `[V]` | 1.05 M | **~105 MB** `[V, spec]` | ~26 MB `[I]` |
| **Unfiltered** | 12,424 `[V]` | 3.13 M | ~310 MB `[I]` | **~76 MB** `[I]` |

D1 makes the liquidity filter load-bearing (310 MB of a 500 MB cap is
irresponsible next to 105 MB). **Files do not.** 76 MB/yr gzipped is 15% more
than the social series we have already accepted.

**Combined git growth: ~142 MB/yr gzipped** (66 social + 76 bars), plus ~8 MB/yr
of features `[I]`. GitHub soft-warns above 1 GB and hard-limits at 5 GB `[R]`, so
this is **~7 years of runway** — far beyond any horizon in `05-preregistration.md`.

**Features in D1, for contrast:** 787 tickers/day × 252 = **198k rows/yr**, ~20
numeric columns ≈ 200 B → **~40 MB/yr** `[I]`. *That* is D1-shaped. It is also
the only shape D1 would ever need — which is exactly why creating the database
now, to hold raw data it cannot fit, would be the wrong call twice over.

### 2.3 Why NDJSON-in-git wins here specifically

- **It is the capture.** A snapshot of a source with no retrievable history *is*
  the primary record. Git gives it content-addressed integrity, an author, a
  timestamp, and an immutable history for free.
- **Auditability is a stated requirement.** `00-brief.md` §2 makes evidence
  discipline non-negotiable and `05` §10 requires dated amendments. A commit SHA
  is a citable input manifest; a D1 row is not.
- **Not being queryable is not a cost here.** Nothing queries it at request time.
  The consumers are (a) a nightly Node job that reads one or twenty files, and
  (b) a quarterly analysis run by one person. Both are file-shaped workloads.
- **It imports to D1 later in one pass.** This is the brief's own §5.2 rationale
  and it remains true. Nothing about this decision is hard to reverse.
- **The honest cost:** ~142 MB/yr of repo growth, `git clone` gets slower every
  year, and a `git log -p` over `data/` becomes unpleasant. Accepted. Mitigation
  if it bites: `git gc --aggressive` and, only if genuinely needed,
  a shallow-clone flag in the workflows (`actions/checkout@v4` already defaults
  to `fetch-depth: 1`).

### 2.4 Two storage rules that are decisions, not defaults

**Rule 1 — store bars UNFILTERED; filter at read time.** `[decision]`

`fetchGrouped()` currently deletes ~8,250 tickers/session before storage. Those
deletions are irreversible without re-fetching every date at 13 s apiece. The
liquid universe filter is an *analysis* choice (it belongs to H5's universe
definition), not a *storage* choice, and `04` §9 already had to cut one requested
metric because ApeWisdom's population and the liquid universe barely overlap.

Concretely: keep the dotted-suffix / length guard (warrants, units, preferreds —
those genuinely distort breadth counts and are cheap to re-derive), drop the
price and dollar-volume gates from the file sink, and apply
`MIN_PRICE` / `MIN_DOLLAR_VOLUME` in the feature job where they can be changed
without a re-fetch. **Cost: 76 MB/yr instead of 26 MB/yr. Buys: the ability to
compute `apdv_resid` for the small-cap names the study is actually about.**

**Rule 2 — do not pre-filter social rows.** `[inherited, 00-measured-facts.md]`

604 of 787 rows sit at exactly 1 mention `[V]` and they are the fresh-discovery
population H3 is about. `00-measured-facts.md` offers "keep only all-stocks +
wallstreetbets" as a storage option. **Reject it.** The four extra scopes are the
sole input to `M7 scope_breadth` / `scope_concentration`, which `04` §6/R1.3 names
as one of only two bot guards that work without author identity. Saving 44 MB/yr
by deleting the bot detector is a bad trade.

---

## 3. The feature computation pipeline

### 3.1 Where it runs, and why not on the edge

**GitHub Actions, plain Node 22, no dependencies.** Not Cloudflare.

Three independent reasons, any one sufficient:

1. **Cloudflare Pages has no cron triggers** `[V, CLAUDE.md + market-scans spec]`.
   This is why `market-ingest.yml` exists at all.
2. **Every API route is `export const runtime = 'edge'` with no Node built-ins**
   `[V, CLAUDE.md]`. The feature job reads ~20 files off disk and does a
   cross-sectional regression per day. Neither is an edge workload.
3. **The 20-session baseline for `mentions_z20` is a multi-file read.** On the
   edge that is 20 D1 queries against a 50-query-per-invocation ceiling `[V]`,
   for a computation nobody is waiting on.

The nightly job is dependency-free Node, deliberately: it must never break
because a transitive dependency published a bad version. The **quarterly analysis**
job (§7.3, and the January window) may use Python with a pinned `requirements.txt`
— it is human-supervised, runs four times a year, and wants real statistics.

### 3.2 Inputs, outputs, contract

```
scripts/social-features.mjs  --date YYYY-MM-DD [--from D --to D] [--version 1]

INPUTS   (all read-only, all from the repo working tree)
  data/social/apewisdom/<YYYY>/<date>.ndjson     ... and the prior 20 sessions
  data/bars/<YYYY>/<date>.ndjson                 ... and the prior 15 sessions
  data/social/denylist/tickers.json              frozen, versioned
  data/social/_health/<YYYY-MM>.ndjson           completeness ledger (§4.3)

OUTPUT
  data/features/v1/<YYYY>/<date>.ndjson          one row per (date, ticker)
```

**One output row, fully specified:**

```jsonc
{
  "date": "2026-10-06",
  "ticker": "AGI",
  "feature_version": 1,
  "code_sha": "a1b2c3d",          // git SHA of scripts/social-features.mjs at runtime
  "input_sha256": "…",            // sha256 over the sorted list of input file digests
  "computed_at": "2026-10-07T02:14:33Z",

  // ---- provenance (05-preregistration §9.1) --------------------------------
  "captured_at_0915": "2026-10-06T13:06:02Z",
  "captured_at_prev1605": "2026-10-05T20:05:41Z",
  "feature_lag_minutes": 24,      // decision_time - captured_at; MUST be > 0

  // ---- MVS -----------------------------------------------------------------
  "overnight_delta": 1.0986,      // ln((m_0915+1)/(m_prev1605+1))   H5 predictor
  "overnight_delta_disjoint": 0.6931,  // ⚑A1 companion, REPORTED never substituted
  "mentions_0915": 5,             // ⚑A2 stratifier
  "mentions_z20": 3.0,            // null before 2026-10-06; N/A if <15 of 20
  "apdv_resid": -0.42,            // N/A when mentions <= 1 or bars missing

  // ---- free, from day one --------------------------------------------------
  "new_entrant": 1,               // mentions_24h_ago IS NULL
  "v1_vendor": 1.0986,
  "v1": 0.9163,
  "a1": null,                     // computed, never tested

  // ---- structural ----------------------------------------------------------
  "scope_breadth": 3,
  "scope_concentration": 0.71,
  "bot_suspect_flag": 0,          // reported, NEVER filtered on (prereg §3.7)

  // ---- outcome side (bars) -------------------------------------------------
  "adr14": 1.83,
  "gap_abs_over_adr": null,       // requires open(d+1): filled on the NEXT run
  "prior_rvol": 1.42,             // §8.1 gate covariate — NOT an outcome
  "dollar_volume_prev": 41839221,

  // ---- data quality --------------------------------------------------------
  "slots_present": 4,
  "scopes_present": 6,
  "quality": "ok"                 // ok | degraded | na
}
```

**Semantics that are not negotiable, all inherited from `04` §2:**

- `null` = **not computed yet** (a defect; blocks the analysis window).
- `"N/A"` = **structurally not computable** (too little history, ticker outside
  the tracked universe, no bars). Never impute, never coerce to 0.
- A ticker absent from a **successful** snapshot is `0` only if it appeared in
  some ApeWisdom snapshot in the trailing 90 days; otherwise `"N/A"`.
- A **failed or missing** snapshot makes every derived field `null` for that
  ticker-day and the date counts against the "≥15 of 20" baseline allowance
  (`04` §6/R7). It never deflates a mean.

**The trading calendar is derived, not configured.** A session is a date for which
`data/bars/<...>.ndjson` exists and is non-empty. Polygon returns nothing for
holidays `[V]`, so the bar store *is* the NYSE calendar. This removes a holiday
table and the class of bug where the calendar and the data disagree.

### 3.3 The one non-trivial computation: `apdv_resid`

Per-day cross-sectional **median (L1) regression** of `ln(1+mentions)` on
`ln(dollar_volume(d−1))`, fit on tickers with `mentions ≥ 2` (n ≈ 183 `[V]`),
minimum n = 100 else the whole day is `N/A` (`04` §M10).

Implemented dependency-free, deterministically:

```
for a fixed β1, the L1-optimal β0 is median(y_i − β1·x_i)      // exact
so minimise  f(β1) = Σ |y_i − β1·x_i − median(y − β1·x)|       // convex, 1-D
by golden-section search on β1 ∈ [−3, 3], 60 iterations        // ~1e-9 precision
ties in the median: lower index wins                            // determinism
```

n ≈ 183 makes this microseconds. Median rather than OLS is `04`'s explicit choice
so NVDA/TSLA leverage cannot dominate the line — do not "simplify" it to OLS.

**`dollar_volume` is PRIOR SESSION, never same-day.** `04` §M10 names this as the
most common way the metric is built wrong. It is not knowable at 09:05.

### 3.4 Idempotency, and how a bug fix works without corrupting the series

**Three properties, enforced by construction:**

1. **Raw captures are append-only and are never rewritten.** A capture is a fact
   about a moment. If a snapshot is wrong, it is wrong *and recorded*; the
   correction is a feature-level exclusion, never an edit to `data/social/`.
2. **Features are a pure function.** `f(raw snapshots, bars, denylists, code) →
   features`. No wall clock (`computed_at` is metadata, never an input), no
   randomness, no network. Re-running any date produces byte-identical output.
   This is testable and should have a test: recompute a stored date, assert
   equality on every field but `computed_at`.
3. **Recomputation is a new version, never an overwrite.**

```
bug found in apdv_resid on 2026-11-14
  → fix scripts/social-features.mjs
  → bump FEATURE_VERSION 1 → 2
  → node scripts/social-features.mjs --version 2 --from 2026-09-08 --to 2026-11-13
  → writes data/features/v2/**   (v1 is NEVER touched)
  → record the fix in a dated line of data/features/VERSIONS.md
  → the nightly job now emits v2 going forward
```

`data/features/v1/**` remains on disk and in history. Any analysis, figure or
window write-up cites `feature_version` **and** `code_sha` **and** the git SHA of
the repo at analysis time. A result computed on v1 stays reproducible after v2
exists. **You can never silently rewrite the series, because the path contains
the version and the old path still has files in it.**

This matters more than usual here: `05-preregistration.md` §6 forbids examining
outcomes between windows, and the single most plausible way to launder a peek is
"I re-ran the features and the numbers changed." Versioned, immutable outputs make
that visible in a diff.

**Backfill semantics.** `--from/--to` recomputes a range. Because the function is
pure, a re-run is a no-op unless code or inputs changed — so the nightly job can
safely recompute a trailing 5-day window every night, which is how late-arriving
bar data (`gap_abs_over_adr` needs `open(d+1)`) gets filled in without a special
case.

### 3.5 Job wiring, and one GitHub gotcha that will bite

Three workflows on the **default branch**:

| Workflow | Cron (UTC) | Does |
|---|---|---|
| `social-ingest.yml` | `05 13`, `05 14`, `35 16`, `07 20`, `05 00` | capture + write ledger + run inline checks (§4) |
| `market-ingest.yml` | `15 2 * * 2-6` | one grouped-daily call → `data/bars/` |
| `features.yml` | `45 3 * * 2-6` | recompute the trailing 5 sessions of `data/features/` |
| `watchdog.yml` | `30 1 * * *` | **fails loudly if the others did not run** (§4.5) |

> ⚠️ **`GITHUB_TOKEN` pushes do not trigger other workflows** `[R, documented
> GitHub Actions behaviour]`. The ingest jobs commit with the default token, so a
> `features.yml` triggered `on: push` would **never fire** and would fail
> silently — precisely the failure class §4 exists to eliminate. **Use a
> `schedule:` offset after the ingest jobs, not `on: push`, and not
> `workflow_run` chaining.** The features job is idempotent, so an occasional run
> before that night's bars land is harmless: the trailing-5-day recompute picks
> them up.

> ⚠️ **`schedule:` fires only from the default branch** — already documented in
> `social-ingest.yml`'s own comments `[V]`. Enabling crons on
> `social-sentiment-research` produces **zero runs and no error**. Merge first,
> then confirm four runs appear in the Actions tab the next day. Do not assume.

**Actions minutes `[I]`:** a social run is ~21 pages × ~0.6 s ≈ 15 s of work,
call it 2 min with checkout and setup. 5 crons/day ≈ 10 min/day ≈ **300 min/mo**.
Bars daily ~3 min/day ≈ 90 min/mo. Features ~2 min/day ≈ 60 min/mo. Watchdog ~1
min/day ≈ 30 min/mo. **Steady state ≈ 480 min/month.** Public repos are
unlimited; **private repos get 2,000 free minutes/month** `[R]`. The one-shot bar
backfill is a further ~90 min, and the optional Tradestie backfill ~100 min `[V]`.
Comfortable either way, but **verify the repo's visibility before scheduling a
second backfill in the same month.**

---

## 4. Monitoring — the first-class section

### 4.1 The property that defines the whole design

`08-cost-ladder.md` catalogues thirteen failure modes measured during this run.
**Every single one returned HTTP 200 or looked healthy** `[V]`.

An expired TLS cert on the *documented* host. A `sentiment_score` that is a
static per-ticker constant across 5.4 years. Feeds frozen since 2019 and 2025
still serving 200s. `{"count":0}` instead of 404 for a typo'd filter. Throttling
behind an opaque 403 that causes a collector to write zeros as data. Reddit
403-ing datacenter IPs. Six named vendors NXDOMAIN.

> **Design principle, and it inverts the normal one:**
>
> **Errors are the easy case. This collector's job is to convert *silence and
> plausibility* into a non-zero exit code.** A monitor that only reports on
> exceptions catches none of the thirteen. Every check below therefore asserts
> something about the *content* of a successful response, not about its status.

### 4.2 Severity, and what each level does

| Level | Meaning | Effect |
|---|---|---|
| **FAIL** | The data is wrong or absent and downstream work must not use it | **exit 1** → GitHub emails the repo owner on workflow failure `[R]`; row written with `quality:"na"`; **no write of the suspect rows** |
| **WARN** | Anomalous but plausibly real | Recorded in the ledger; **no email**; surfaced in the weekly digest |
| **INFO** | Normal telemetry (counts, bytes, durations) | Ledger only |

**Never write a zero on a failed or degraded fetch.** This is the single rule that
would have caught the Bluesky-403 and the ApeWisdom-typo classes.

### 4.3 The check catalogue — one row per measured failure class

Checks K1–K4 run **inline in the collector, before `append()`**. K5–K12 run in the
watchdog (§4.5, Channel 3), which shares no code path with the collector. Every
check writes a ledger row whatever the outcome.

*(Check IDs are `K<n>`; the critical-path items in §0.2 are `C<n>`. They are
different sequences.)*

| # | Check | Detects (measured failure it maps to) | Rule | Level |
|---|---|---|---|---|
| **K1** | **Transport honesty** | *Opaque 403 throttling that writes zeros* `[V, Bluesky]`; *403 to a default UA* `[V, Tradestie]` | **Detection shipped 2026-09-09** `[V]`: any non-2xx discards the whole scope. **Remaining: make it FAIL** — the run must exit non-zero (S9), and Tradestie's adapter needs the same treatment (S10). | FAIL |
| **K2** | **Config / enum validation** | *`{"count":0}` for a typo'd filter* `[V, ApeWisdom]` | **Detection shipped 2026-09-09** `[V]`: an empty first page is a failure, not an empty result. **Remaining:** distinguish *"this filter has never worked"* (a config error — FAIL loudly, it will never self-heal) from *"this filter failed today"* (transient). The ledger's history is what makes that distinction possible. | FAIL |
| **K3** | **Schema assertion** | *Vendor payload drift*; `"2"` vs `2` type drift `[V]` | Assert the exact field set per record. **Missing expected field → FAIL. Unknown new field → WARN** (record it; a new field is information, not a fault). Coerce numeric strings, but count and report coercions. | FAIL / WARN |
| **K4** | **Row-count floor, per (scope, slot)** | *Partial capture sealed as complete* (§1.3 S1); silent truncation | **Partly shipped 2026-09-09** `[V]` as a cross-check against the vendor's self-declared `count`. **That check trusts the vendor to be honest about its own truncation, so it needs an independent partner:** floor = **60% of the trailing-20 same-slot median** for that scope, absolute floor 50 rows once a scope has ever exceeded 200. Below floor → discard the scope and FAIL. Also required for the case `count` is absent, where the shipped check silently skips. | FAIL |
| **K5** | **Staleness** | *Feeds frozen since 2019 / 2025 still serving 200s* `[V, Cboe, Quiver]` | `max(date)` in each source's ledger must advance on every expected session. **No advance for 2 consecutive expected sessions → FAIL.** For Tradestie specifically, also assert the returned payload differs from the prior session's. | FAIL |
| **K6** | **Within-entity variance** ⭐ | ***The Tradestie failure, and it is fully automatable*** `[V]` | For each numeric field, over the trailing 30 sessions: among entities with ≥5 observations, compute the share with **σ = 0**. If that share ≥ 0.95 → **FAIL: "field is a static per-entity constant"**. Run it on **every** numeric field of **every** source, including ones we trust — `mentions`, `upvotes`, `no_of_comments`. | FAIL |
| **K7** | **Cross-sectional distribution drift** | Silent methodology change at the vendor; a scoring-model swap creating a discontinuity `[V, flagged for Polygon insights] ` | Compare today's `mentions` deciles to the trailing-20 median decile boundaries. **Any boundary moving > 4 × its own trailing MAD → WARN.** Two consecutive days → FAIL. Also assert the "77% at exactly 1 mention" shape: `share(mentions==1)` outside [0.55, 0.90] → WARN. | WARN → FAIL |
| **K8** | **Completeness ledger (R7)** | *Gaps read as zeros* | Expect **4 slots × 6 scopes** per date (5 slots on DST-transition days). Any date short of that after 26h → FAIL, and every derived feature for that date is `null`, never 0. | FAIL |
| **K9** | **Host & certificate pinning** | *Expired TLS cert on the documented host* `[V, api.tradestie.com, notAfter 2026-01-03]` | Weekly: assert each collector's host matches the pinned constant, and that its leaf certificate has **> 14 days** to expiry. A vendor whose cert lapses is telling you something about the vendor. | WARN → FAIL |
| **K10** | **Join-rate floor** | Silent divergence between the two stores | `share of ApeWisdom tickers with a same-date bar` must stay within its trailing-20 band ±15pp. A collapse means a ticker-universe or symbology change on one side. | WARN |
| **K11** | **Storage trend** | *An estimate that was 6× low on first measurement* `[V]` | Monthly bytes added vs the 66 MB/yr + 76 MB/yr budgets. **> 1.5× budget → WARN.** Cheap, and it is the check that would have caught the original 11 MB/yr error on day one. | WARN |
| **K12** | **Feature purity** | A non-deterministic feature job silently rewriting history | Nightly, recompute one random already-computed date and assert byte-equality on every field but `computed_at`. Mismatch → FAIL. | FAIL |

**On K6, because it is the one worth building first:** the Tradestie failure was
found by a human noticing that TSLA read 0.381 on all 30 dates it appeared `[V]`.
That is a two-line check — group by entity, count distinct values — and it
generalises to every vendor field in the study. It is the highest
value-per-line-of-code item in this entire plan. **Build K6 before K7.**

### 4.4 What the checks deliberately do NOT do

- **They do not filter.** `bot_suspect_flag` is reported, never applied
  (`05` §3.7 forbids unregistered exclusions). A monitor that quietly drops rows
  is an unregistered exclusion wearing a hi-vis vest.
- **They do not read outcome columns.** Every check above reads counts, coverage,
  schema and distributions of *predictors*. `05` §6 draws that line and calls it
  bright; this section stays on the monitoring side of it. `prior_rvol` is a
  covariate and is fine; `gap_abs_over_adr` is an outcome and no check touches it.
- **They do not auto-remediate.** No auto-retry that could mask a systematic
  block, no auto-backfill of a "missing" day that was actually a 403.

### 4.5 Alerting — one operator, no paging infra, trades 09:30–16:00 ET

**Channel 1 (primary): a non-zero exit.** GitHub emails the repo owner when a
workflow run fails `[R, default notification setting]`. Zero infrastructure, zero
cost, already configured. **This is why every FAIL must `process.exit(1)` rather
than log and continue** — the entire alerting design is one line of code and it
only works if the checks are wired to it.

**Channel 2 (the audit trail): the repo itself.** Each run appends one row to
`data/social/_health/<YYYY-MM>.ndjson` and regenerates
`data/social/_health/HEALTH.md` — a 30-day table of slot × scope × status. Both
are committed by the same job that commits snapshots. **A bad week is visible in
a diff**, which means it is visible in the ordinary act of looking at the repo.

**Channel 3 (the one that catches "it never ran"): `watchdog.yml`.**

> A job that never starts cannot email you that it failed. **Cron delivery on
> GitHub Actions is best-effort and runs are dropped under load** `[R]` — the
> `04` §5.2 discussion of queue delay is the same phenomenon one step further.
> **A schedule-only design cannot detect its own absence.**

So: a separate workflow, on its own cron at **01:30 UTC (~21:30 ET)**, that shares
no code path with the collector. It reads only the committed ledger and fails if
the last 24h is missing any expected slot, or if the newest `data/bars/` file is
older than two expected sessions. It is ~40 lines and it is the only check that
covers total collector absence.

**Channel 4 (optional, louder): `HEALTH_WEBHOOK_URL`.** A single secret holding an
ntfy.sh topic URL, a Discord webhook or a Slack incoming webhook — one `POST`,
no account beyond the webhook itself, no SDK. **Fires on FAIL only, never on
WARN.** Recommended if email gets buried; skip it otherwise.

**The human cadence, designed around the operator, not around the system:**

| When | What | Duration |
|---|---|---|
| **Whenever an email arrives** | Read the failing step's log. That is the whole triage. | ~5 min |
| **Sunday** | Read `HEALTH.md` — the 30-day grid. WARNs live here and nowhere else. | ~5 min |
| **First Monday of Jan/Apr/Jul/Oct** | The pre-registered window (`05` §6) | hours |

> **No check may be designed to require attention between 09:30 and 16:00 ET.**
> The operator is trading. The 09:05 premarket slot is the one that genuinely
> cannot wait — and the design compensates for it **structurally**, with a second
> UTC cron and an ET-clock guard (§1.3 S2/S3), not by expecting a human to
> notice. If the 09:05 slot fails on a given day, that day's H5 observation is
> lost and the correct response is *nothing*: the ledger records the gap, the
> feature is `null`, and the loss enters the "≥15 of 20" allowance honestly.

**Alert budget: ≤ 1 FAIL email/month in steady state.** If it exceeds that,
thresholds get loosened — not because the checks are wrong, but because an alert
channel a human learns to ignore is worse than no alert channel at all. Track the
FAIL count in `HEALTH.md` and treat a noisy month as a bug in the monitor.

### 4.6 Fix list, in build order

Revised 2026-09-09, after the collector's own hardening landed:

1. **S9 — `process.exit(1)` on any FAIL.** One hour. The guards shipped today
   already detect three failure classes and then discard the finding; this is the
   wire that connects them to the only alerting channel that exists.
2. **S6/K8 — the completeness ledger.** Everything downstream depends on it, and
   K2's "never worked vs. failed today" distinction is impossible without it.
3. **K4 — the trailing-median row floor**, as the vendor-independent partner to
   the `count` cross-check that shipped today.
4. **S2/S3** ET-clock guard + DST dual-cron + non-`:00` minutes.
5. **K6** the within-entity variance check.
6. **S10** bring the Tradestie adapter up to the ApeWisdom adapter's standard.
7. **K3, K5, K7, K9–K12** in that order.

---

## 5. Secrets and configuration

### 5.1 The headline: the social collector needs nothing

**The run created no accounts and entered no credentials** (`00-brief.md` §2,
enforced). Both collecting sources are keyless `[V]`. `social-ingest.mjs`'s header
says `Env: none. That is the point.` — and that is verified true `[V]`.

**Consequence: `social-ingest.yml` requires zero secrets** beyond the built-in
`GITHUB_TOKEN` (already granted by `permissions: contents: write`). Nothing to
provision, nothing to rotate, nothing to leak.

### 5.2 The full matrix

| Name | Where | Needed by | Status |
|---|---|---|---|
| `GITHUB_TOKEN` | **built in** | all workflows (commit + push) | already working `[V]` |
| `POLYGON_API_KEY` | **GitHub Actions secret** | `market-ingest.yml` | **must be added** — exists in Cloudflare Pages today, not in Actions |
| `HEALTH_WEBHOOK_URL` | GitHub Actions secret | watchdog (Channel 4) | **optional** |
| `WRITE_KEY` | GitHub Actions secret | `market-ingest.mjs` **only in `--sink d1` mode** | **not needed yet** — the file sink makes it deferrable |
| `SITE_URL` | GitHub Actions secret | same, D1 sink only | **not needed yet** |
| `WRITE_KEY` | **Cloudflare Pages env var** | `/api/scan/ingest` route auth | **not needed yet**; must equal the Actions value when D1 arrives |
| `market_db` binding | **`web/wrangler.toml`** | the ingest route | **not needed yet** — and note the binding must be declared in `wrangler.toml`, **not** in the Pages dashboard, which is locked for this project `[V, user memory: "Bindings via wrangler.toml"]` |

**The split rule:** *GitHub Actions holds credentials for things that fetch;
Cloudflare Pages holds credentials for things that serve.* `POLYGON_API_KEY`
belongs in both eventually (the journal's enrichment already uses it on Pages),
but the Actions copy is a separate secret and must be added there explicitly —
Pages env vars are not visible to Actions.

**Licence constraint that is a configuration constraint.** Polygon-derived values
may not be published on tapereader.us on the current individual (`personal`) plan
`[V, 13-open-questions.md §1]`. Any future D1-backed route reading `daily_bars`
must therefore sit behind Cloudflare Access, as `/pct-bootcamp/*` already does
`[V]`. **Build that gate at the same time as the route, not after.**

**One live exposure worth an hour, from §1 of the open questions:** the shared
Google Sheet already carries Polygon-derived columns and Cloudflare Access does
not cover it. **Check who that spreadsheet is shared with.** It is unrelated to
this build but it is the only genuinely live contract exposure the run found.

---

## 6. Effort estimate — one part-time engineer, honest

Hours are for someone who knows this codebase. They include reading, testing and
the pull request, and they assume interruption. `[I]` throughout.

### 6.1 Required for the December H5 answer

| Phase | Work | Hours |
|---|---|---|
| **P0** | **Preserve & unblock.** C1 (get 4 untracked files onto a branch), review, PR to default branch. | **2–3** |
| **P0** | **File sink for bars.** `--sink file`, drop the write-time liquidity filter, path scheme, tests. | **4–6** |
| **P0** | Commit `market-ingest.yml` to default branch, add `POLYGON_API_KEY` to Actions, verify two green daily runs. | **1–2** |
| **P0** | **Run the backfill.** `--start 2024-01-01`, ~420 sessions. | **0.5 human, ~90 min unattended** |
| **P1** | **Social collector hardening.** S9 exit-code wiring (do first), S2 ET-clock guard, S3 dual-cron, S10 Tradestie parity. *(S1, S4, S5 landed 2026-09-09.)* | **3–5** |
| **P1** | **Completeness ledger** (S6/K8) + `HEALTH.md` renderer. | **3–4** |
| **P1** | Enable the social cron on the default branch; confirm 4–5 runs appear the next day. | **1** |
| **P2** | **Monitoring harness.** K1–K4 inline; K5, K6, K7 in the watchdog; `watchdog.yml`; severity plumbing to `exit 1`. | **10–14** |
| **P3** | **Feature pipeline v1.** Session calendar from bars, missingness/N-A semantics, `overnight_delta` + companion, `mentions_z20`, `v1`/`v1_vendor`/`new_entrant`/`a1`, `scope_*`, ADR-14, gap, `prior_rvol`. | **10–14** |
| **P3** | `apdv_resid`: golden-section L1 regression + the prior-session dollar-volume join. | **3–4** |
| **P3** | Versioned output, input manifest, `VERSIONS.md`, K12 purity test. | **3–4** |
| **P4** | **Denylists** (R1.1/R2.1): seed from the measured lists in `04` §6, freeze, document the amendment rule. | **2–3** |
| **P4** | **Prereg amendments** `⚑A1`/`⚑A2`/`⚑A3` written into `05` §10, dated. | **1–2** |
| **P5** | **The early kill (§7.3):** §8.1 RVOL gate + `⚑A2` joint distribution, outcome-free. | **4–6** |
| | **Subtotal to a defensible December H5** | **~48–69 h** |
| **P6** | **The H5 analysis itself**, Dec 2026 / Jan 2027 window: Mann–Whitney, incremental-to-RVOL, reflexivity test, three figures, write-up. | **12–20** |
| | **TOTAL** | **~60–89 h** |

### 6.2 The honest part

> **48–69 hours from 2026-09-10 is:**
>
> | Budget | Weeks | Lands |
> |---|---|---|
> | 8 h/week | 6–9 | **late Oct–mid Nov** — comfortable |
> | 4 h/week | 12–17 | **early Dec–early Jan** — on top of the deadline, no slack |
> | 2 h/week | 24–35 | **Mar–May 2027** — misses December entirely |
>
> **The risk to the December date is the part-time budget, not the engineering.**
> Nothing here is hard; there is simply more of it than a few evenings.
>
> **The saving grace, and it is real:** the ~14 hours of P0 + P1 are what protect
> the irreplaceable data, and they are the *first* fourteen. Everything after
> them can slip without losing anything — features and monitoring are computed
> from captures, and captures can be recomputed forever. **If only one thing gets
> done this month, it is P0 + P1.**

**If the budget is genuinely 2 h/week, cut in this order** (and the ordering is a
recommendation, not a preference — it preserves the two things that cannot be
recovered later):

1. Keep P0 and P1 **in full**. They protect data that cannot be repurchased.
2. Keep K4, K6, K8 from P2; defer K7, K9, K10, K11.  (**−6 h**)
3. Cut `mentions_z20`, `scope_*`, `a1` from P3 v1 — H1/H2 are not answerable
   before 2029 anyway (`05` §4). Ship `overnight_delta` + `apdv_resid` + ADR/gap
   only.  (**−5 h**)
4. Do **not** cut P4 or P5. The amendments are an hour and they decide whether the
   answer counts; the early kill can save the other forty.

That reduced path is **~38–57 h** — which at 3 h/week is 13–19 weeks and lands in
**December to January**. It buys the January window rather than the December one.
State that plainly rather than pretending the cuts recover the schedule: they
recover about eleven hours, and eleven hours is not three months.

### 6.3 Explicitly excluded from the estimate

Journal sheet columns (8–16 h `[I, 08-cost-ladder]`), Wikipedia + Wikidata
mapping (6–10 h `[I]`), EDGAR catalyst auto-population (10–16 h `[I]`), D1
creation + import (6–8 h `[I]`), any UI (20 h+ `[I]`). All are §7.

---

## 7. What NOT to build yet

`05-preregistration.md` §7.1 states the governing principle: **a column, table or
panel added on the strength of a null is permanent clutter.** `08-cost-ladder.md`
adds the second: **the largest cost in this project is not money or engineering,
it is time**. Both argue for the same thing.

### 7.1 The don't-build list, with the reason each is premature

| Do not build | Why not | Revisit when |
|---|---|---|
| **`market_db` (the D1 database)** | Nothing reads it. The raw social panel does not fit in it (§2.2, ~530 MB/yr). Creating it puts a 32-day paced import and a secrets round-trip on a critical path that files clear in 70 minutes. | A **gated** read surface exists that needs request-time queries |
| **`/api/scan/ingest` in production** | Same. The route is written and correct; it just has nothing to serve yet. | with `market_db` |
| **Any public page on tapereader.us** | `13-open-questions.md` §1: Massive prohibits public display on every individual plan; the cheapest confirmed public-display licence found anywhere is **$499/mo** `[V]`. ApeWisdom has **no terms page at all** — `/terms/` and `/about/` both 404 `[V]` — and absence of a licence is not a grant of one. | a licensed data path exists, or never |
| **Journal sheet columns for social features** | `04` §10 and `05` §7.1 both say the same thing. The migration contract is additive-only and asserted `[V]`, so a column added now is a column forever. | H5 clears the 2027-07-05 futility stop |
| **A Morning Plan attention panel** | Its only display-worthy metric is `mentions_z20`, first computable 2026-10-06 and not testable until 2029+ `[V, 05 §4]`. Shipping it now ships an untested number to a trader mid-decision. | same |
| **Wikipedia / Wikidata mapping** | 6–10 h, an 84% coverage ceiling, and the missing sixth is concentrated in exactly the recent small-cap listings that produce breakouts `[V]`. It is a *control* for H1, and H1 is not answerable this decade. | H1 becomes answerable, or a publishable surface needs a CC0 source |
| **Bluesky, FINRA, Cboe collectors** | Bluesky is measured too thin for per-ticker use `[V]`; FINRA's licensed channel is a 365-day rolling window with no backfill `[V]`; Cboe IV30 is genuinely interesting and computes nothing in the current metric family. | after H5 resolves |
| **StockTwits, in any form** | `13-open-questions.md` §6 resolved **against** us. All three framings land restrictive; the withdrawn API terms are worse than the site ToS. | never, absent an enterprise conversation |
| **The Tradestie one-shot backfill** | ~1 h + 100 min runtime for the only retrievable social past `[V]` — but its **only** date-varying field is `no_of_comments` on the top-50 WSB, which computes no metric in the MVS. | it is a legitimate **week-one** task if the monitoring harness needs a long series to test K5/K6 against — and that is its best justification |
| **A `bot_suspect_flag` filter** | `05` §3.7 forbids unregistered exclusions. Compute it, report it, never apply it. | never |

### 7.2 The one thing on this list that is a close call

The **Tradestie backfill** is the only deferral worth arguing about. It is cheap,
it is the sole retrievable social history in the whole study, and it will not get
cheaper. The case for doing it in week one is not analytical — it is that
**37 dates over 5.4 years of a source with a known static-constant field is the
perfect test fixture for check C6**, and building the variance detector against
a series where you already know the right answer is worth more than the data is.

Do it *if and only if* it is framed that way. Do not do it because it feels like
progress on the study.

### 7.3 The cheapest falsifying experiment, and it comes before the full build

> **C11, 2026-10-09. Roughly four to six hours. It can kill the confirmatory arm
> three months before the first window, on a rule that is already
> pre-registered — and it reads no outcome column.**

By ~2026-10-06 there will be ~20 sessions of paired 09:05/16:05 snapshots and a
complete bar backfill. That is enough to run **two pre-registered checks that
`05` §6 explicitly classifies as monitoring rather than analysis**, because
neither touches an outcome:

1. **The §8.1 RVOL gate.** Correlate `overnight_delta`, `mentions_z20` and
   `apdv_resid` against **prior-day** RVOL. `05` §8.1 drops any feature with
   `|r| > 0.5`. `04` §M10 records the prediction, before the data:
   *`mentions` fails, `mentions_z20` is borderline, `apdv_resid` and
   `wiki_pageviews_z20` pass.*
   **If `overnight_delta` fails the gate, the study's only confirmatory arm is
   dead on a rule written before any data existed — in October, for six hours of
   work, instead of in January after fifty.**
2. **The `⚑A2` joint distribution** of `overnight_delta` × `mentions_0915`.
   `04` §4.5 predicts the `Surging` bucket will be dominated by 1→5-mention
   transitions `[V, from the measured 77%-at-one distribution]`. This is a
   frequency table of predictors. It requires the amendment (C9) to be landed and
   dated first, which is why C9 precedes C11 in the critical path.

**The discipline that makes this legitimate:** neither reads
`gap_abs_over_adr`, next-session RVOL, `Max R Before Stop`, or any P&L field. The
line in `05` §6 is bright — *"anything that requires reading the outcome columns
is an analysis"* — and this stays on the monitoring side of it. **Do not extend
this experiment by "just looking" at the outcome side.** That is the exact move
the pre-registration exists to prevent, and it would cost the confirmatory status
of the whole study to save a few weeks.

---

## 8. Open decisions, and the decision that unblocks each

| # | Undecided | Blocks | **Decision that unblocks it** |
|---|---|---|---|
| 1 | Should bars be stored filtered or unfiltered? | `apdv_resid` coverage on small caps | **Unfiltered.** 76 MB/yr vs 26 MB/yr buys back the population the study is about. Filter in the feature job. (§2.4) |
| 2 | Create `market_db` now or later? | nothing, once the file sink exists | **Later.** It does not fit the raw data and nothing reads it. (§7.1) |
| 3 | Keep all six ApeWisdom scopes? | `scope_breadth` / `bot_suspect_flag` | **Keep all six.** They are the only bot guard available without author identity. (§2.4) |
| 4 | Python or Node for features? | the nightly job's fragility | **Node, dependency-free, for the nightly job. Python with pinned deps for the quarterly analysis only.** (§3.1) |
| 5 | Which branch carries the crons? | whether anything runs at all | **The default branch.** `schedule:` fires nowhere else, silently. (§3.5) |
| 6 | Is the repo public or private? | Actions-minutes budget for backfills | **Check before scheduling a second backfill in one month.** 480 min/mo steady state is fine either way; two 90-minute backfills plus the Tradestie run is not obviously fine on 2,000. `[I]` |
| 7 | Who can open the shared Google Sheet? | a live licence exposure, unrelated to this build | **Check the sharing settings.** One hour, and it is the only live contract exposure the run found. (`13` §1) |

---

## 9. Handoffs

- **→ `05-preregistration.md` §10.** Three amendments, dated, landed by C9
  (2026-09-30): `⚑A1` disjoint-window companion, `⚑A2` `mentions_0915 ≥ 5`
  stratified sensitivity, `⚑A3` H6's predictor (re-specify or retire). Also
  correct the H5 panel to ~70,800 ticker-days and H1's clock to 2026-10-06.
- **→ `11-red-team.md`.** The two claims most worth attacking here are (a) that
  76 MB/yr of bars in git is acceptable for three years, and (b) that C11's early
  kill genuinely reads no outcome. If (b) is wrong, delete §7.3.
- **→ `12-signup-checklist.md`.** This plan adds **exactly one** provisioning
  item: `POLYGON_API_KEY` as a GitHub Actions secret. No new accounts, no card,
  no vendor. `HEALTH_WEBHOOK_URL` is optional and needs no account beyond an
  ntfy.sh topic name.
- **→ Track E / Track F.** Both are gated on the 2027-07-05 futility stop.
  Nothing in this plan builds toward either, deliberately.
