# Order-ladder work — state and follow-ups

## Done (live month only, `WIP-U16632046-GURI`)

- **`web/lib/trade-journal/order-ladder.ts`** — pure, import-free TS module. Parses a FULL DAS log
  (not just `Event === "Execute"`), rebuilds round trips, clusters fills into logical entries, and
  recovers the real bracket ladder from `Accept`/`Replaced`/`Canceled` rows. Typecheck clean, safe on
  the edge runtime, and runnable from Node via `--experimental-strip-types`.
- **`scripts/review/backfill-ladders.ts`** — Drive-backed one-time backfill. Dry-run by default;
  `--write` applies. Widens the grid, appends headers, writes per-cell.
- **`scripts/review/validate-ladder.ts`** — validation harness against known trades.
- **11 new columns**, 70/71 rows populated: `Entry Ladder`, `Exit Ladder`, `Stop Ladder`,
  `# Entries`, `# Exits`, `First Entry`, `Initial Stop`, `Initial Risk ($)`,
  `Max Risk At Stake ($)`, `Stop Raises`, `Stopped Out?`.

**Validation:** every trade on every date with a log matched the sheet exactly on share count and
avg entry (70/70). MRNA 2026-08-19 rebuilt from the CSV matches an independent reconstruction read
off the DAS screenshots to the cent on all three entries and all three stops.

**Not covered:** `2026-08-24` (1 trade) — no DAS CSV has ever existed; the sheet note already says
"Reconstructed from screenshots".

**Quirks encoded, do not "fix" without re-reading:**
- `2026-07-30` fills are logged under the OLD practice account `TRPCT1541` but recorded in the live
  sheet. The backfill falls back to an unfiltered account read and logs a note when that happens.
- DAS labels some long exits `Shrt`, so side alone cannot separate a protective order from a short
  entry; the trip's own time window does that.
- DAS log filenames come in two shapes: `2026-08-05-trade-log.csv` and `trade-log-july-30.csv`.
- Three date-pairs are byte-identical duplicates; first-wins dedupe.
- Google Sheets strips leading zeros from times — always match with `normTime()`.
- There is **no order ID** in the DAS export (`Note` carries rejection reasons), so fill clustering is
  a 3-second heuristic. It is corroborated by the fact that every bracket placement timestamp
  coincides exactly with an entry fill.

## DONE — Follow-up 1: enrichment fix + auto-R  (2026-09-07)

`market-data.ts`: favourable excursion is now counted BEFORE the stop check on each bar;
excursions walk from the TRUE first entry using an optional `EntryRef` (real first-entry price
+ real risk-per-share from the ladder) instead of blended `Avg Entry` with `R/totalShares`; new
`MFE (R)` (unconditional to 16:00 — "was the entry good") split from `Max R Before Stop` (the
bracket counterfactual). `GroupedTrade` import made type-only so the module runs under Node's
type stripping.

`scripts/review/re-enrich.ts` re-enriched all 70 laddered rows on WIP.
`scripts/review/auto-risk.ts` set `R (Risk)` from the measured `Initial Risk ($)`, repointed the
`Stop` formula at the real `Initial Stop`, and added a `Risk Source` column.

Result: `Max R Before Stop = 0` went 17 -> 0. Realised-R-exceeds-MFE went 10 -> 4, and **all four
survivors are pyramids, where that is arithmetically correct** — MFE is measured on the first
lot's risk while the P&L comes from a position that grew (NVDA 7 -> 39 shares). Of the 43
single-entry trades, **zero** violate. Month total: **+23.4R as logged -> +19.4R on measured risk.**
2026-08-13 SPY/QQQ confirmed by the trader as deliberate full-size entries mis-logged as half —
exactly the class of error auto-R removes.

### NEW CONSTRAINT this exposes
**"Capture %" is undefined for a pyramid.** Realised R can legitimately exceed MFE, so the Capture
Tracker / Execution Skill formula `mean(min(realisedR, target))/target` is meaningless on the 27
multi-entry trades. It needs a position-aware denominator (e.g. excursion valued against the
share ladder actually held at each moment) before any capture number is quoted again.

## Follow-up 1b — original enrichment notes (kept for context)

`web/lib/trade-journal/market-data.ts` is wrong for any scaled-in position:
- `computeMaxRBeforeStop` walks from blended `Avg Entry` with `riskPerShare = R / totalShares`, where
  totalShares is the FULL pyramided size. On NVDA 2026-08-05 that is $0.359/share against a true
  $1.898 — a 5.3x understatement, so the walk "stops out" on bar one and records `maxR = 0`.
- Line ~569 `break`s on the adverse check BEFORE the favorable check on the same bar, so the breaking
  bar's high is never counted. Intra-bar order is unknown — the same reason the entry bar's adverse
  check is already skipped.
- `maxR = 0` on 17/71 live rows; 10 are arithmetically impossible (realised R > recorded MFE); 9 are
  winners totalling +34.5R, more than the whole month's +23.1R. Failure rate by fill count:
  2 fills 3%, 3 fills 28%, 4+ fills 61%. The 4+ fill trades carry 22.6R of the month's 23.1R.

Fix: walk from `First Entry`, use `Initial Risk ($) / firstEntryShares` as riskPerShare, check
favorable before breaking, and split the field into `MFE (R)` (unconditional to EOD — "was the entry
good") vs `Max R Before Stop` (bracket counterfactual against the REAL stop ladder). Recompute
`MAE (R)` the same way. Then re-enrich WIP.

## Follow-up 2 — app wiring
`CaptureTracker`, `ProfitabilityAnalysis`, `TradingCalendar` (the `B` bracket column),
`AggregateStats` and `ScreenshotReview` all read `maxR` directly and are wrong for this account
today. Capture should use the trader's real target definition (2.5R **of the last entry**). Add
`Half R ($)` to `Calendar Config`. Deprecate `# Partials` (it counts entries AND exits — "2 partials"
means zero partials taken) in favour of `# Entries` / `# Exits`.

## Follow-up 3 — practice book
Same backfill over `TRPCT1541-GURI` (248 trades). 51 of 54 sessions have logs; missing 2026-06-26 and
2026-07-29 (`trade-log.csv` unnamed is 2026-05-06). Note the risk unit was $28 then $14, and
`Calendar Config` needs a half-size column per era.

## Follow-up 4 — new metrics unlocked
Add rate; add timing (how far into the move, in initial-R); **missed adds** (trades that ran >=1R with
no add — his notes repeatedly say "Missed to add"); **the starter-only counterfactual** (what he would
have made never adding — the number that tests whether the pyramid actually pays); risk creep; stop
honour.

## Open findings needing verification before they are reported as fact
- 11/70 trades where logged `R (Risk)` differs from true initial risk by >25%. Five logged half-size
  while actually risking ~$27 (full size): 2026-07-31 GOOGL, 2026-08-13 SPY, 2026-08-13 QQQ,
  2026-08-14 GOOGL, 2026-08-18 QQQ. If real, R-multiples on those trades are overstated — and
  2026-08-13 is his best session (+10.1R).
- 13/70 trades whose build-phase risk-at-stake exceeded ~1.5 units. Worst: 2026-08-28 CRM at $105.54
  against an $18 unit. Needs a manual read against the chart before being called a rule violation —
  a mis-classified target order would produce the same signature.
