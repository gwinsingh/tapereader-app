# Monthly review — state and follow-ups

## The August 2026 cycle is COMPLETE

- Both books corrected (the live one has since been swapped in as `U16632046-GURI`):
  `WIP-U16632046-GURI` (71 trades / 19 sessions / **+19.4R**) and
  `WIP-TRPCT1541-GURI` (248 / 54 / **+7.3R**), both passing `verify.ts` with zero failures.
- Report published as an Artifact and rendered at `/pct-bootcamp/reviews/2026-08`; the frozen
  snapshot is `web/data/reviews/2026-08.json`, narrative in `scripts/review/narrative-2026-08.json`,
  standalone HTML in `scripts/review/report-2026-08.html`.
- Findings from the three tracks: `r2-findings-{regime,execution,selection}.md`.

## To run the next cycle

Since 2026-09-08 the app writes the ladder at upload, so `backfill-ladders` / `re-enrich` /
`auto-risk` are only needed for historical rows that predate that (or a day whose DAS export
arrived late). New uploads land correct on the first try; `verify.ts` still gates the cycle.

```bash
node scripts/review/fetch.js                                    # snapshot the live + practice tabs
node --experimental-strip-types scripts/review/backfill-ladders.ts --tab=<TAB> --acct=<ACCT> --write
node --experimental-strip-types scripts/review/re-enrich.ts      --tab=<TAB> --write
node --experimental-strip-types scripts/review/auto-risk.ts      --tab=<TAB> --write
node --experimental-strip-types scripts/review/verify.ts         --tab=<TAB>   # must be 0 failures
node --experimental-strip-types scripts/review/metrics.ts        --tab=<TAB>
# spawn the three analysis tracks against BRIEF.md, author narrative-<MONTH>.json, then:
node --experimental-strip-types scripts/review/build-report.ts --month=<YYYY-MM>
```

## DONE — the sheet swap (2026-09-08)
Done by hand for the live book: `U16632046-GURI` is the corrected 98-column tab, and the
original is archived as `OLD-U16632046-GURI`. The `OLD-` prefix is load-bearing —
`findTabByAccountPrefix` matches `<account>` or `<account>-`, so the archive is unreachable
and uploads cannot land in it. **Do not rename or delete either tab.**
The practice swap was deliberately skipped (`TRPCT1541-GURI` is still the 77-column original,
`WIP-TRPCT1541-GURI` the corrected one) — low value, he trades the live account now. Note that
`TRPCT1541-GURI` will gain the 21 ladder columns on its next migration, empty; that is additive
and harmless, but the values only arrive if the practice backfill is ever run.

## DONE — the upload path is wired (2026-09-08)
`order-ladder.ts` is no longer script-only. A CSV uploaded through the app now produces rows
carrying the ladder, a measured `R (Risk)` (`Risk Source` = `auto (ladder)`), a non-circular
`Stop`, and ladder-aware enrichment via `entryRef`. `# Partials` is deprecated in the docs and
the upload response in favour of `# Entries` / `# Exits`; the column stays for back-compat.
Two read-only checks guard it, both currently green:
```bash
node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types \
     scripts/review/migration-safety.ts          # migration is additive-only
node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types \
     scripts/review/verify-upload-pipeline.ts    # upload path == the reviewed backfill
```

## OPEN — carried forward
- **H11** skip conviction-1 (1 winner in 24 pooled, p=0.019). Needs 100% Conviction coverage to test.
- **H12** no entries 09:35–09:40 (worst window in both books, live n=12).
- **H1** VIX < 17.2 — still zero out-of-sample exposure; he has never traded live above 17.2.
- Re-test the pyramid's profitability at ~200 adding trades. The add RULE improved (0/27 underwater
  adds vs 7/76); the RETURN is not separable from variance.
- 2026-08-24 (1 trade) and 16 practice trades have no DAS export, so no ladder; risk stays manual.
  The upload path handles this the same way: no ladder means no `entryRef`, `Risk Source` =
  `manual`, and the row falls back to the old blended-average behaviour. Preserve that fallback.

## Quirks encoded — do not "fix" without re-reading
- `2026-07-30` fills are logged under the OLD practice account `TRPCT1541` but recorded in the live
  sheet; the backfill falls back to an unfiltered account read and logs a note.
- DAS labels some long exits `Shrt`, so side alone cannot separate a protective order from a short
  entry; the trip's time window does that.
- Filenames come in two shapes plus one undated file (`trade-log.csv` = 2026-05-06, aliased).
- A date's multiple exports are merged by per-key MAX COUNT, never set-union — set-union collapses
  legitimate repeat fills and silently drops executions.
- Google Sheets strips leading zeros from times; always match with `normTime()`.
- No order ID in the DAS export, so fill clustering is a 3-second heuristic — corroborated by every
  bracket placement timestamp coinciding with an entry fill.
- A first entry under a tenth of the final position is a token starter; risk falls back to peak
  build-phase exposure (`Risk Basis` records which).
- `Peak Position Value ($)` runs to 16:00 and ignores the exit — a loose ceiling. Use
  `Peak In-Window ($)` for anything about exit quality.
## Follow-up 2 — app wiring (PARTIALLY DONE)
Done: the upload path writes the ladder, and `READ_RANGE_END` was widened so the ladder columns
are actually visible to the app at all (at 75 managed columns, reads stopped at column 85 and
silently truncated 13 of the tab's 98 — which is why `resolveMfe()` could never see
`Position MFE (R)` even though it prefers it).

Still open: `CaptureTracker`, `ProfitabilityAnalysis`, `TradingCalendar` (the `B` bracket column),
`AggregateStats` and `ScreenshotReview` all read `maxR` directly and are still wrong for this
account. Capture should use the trader's real target definition (2.5R **of the last entry**).
Add `Half R ($)` to `Calendar Config`.

## Follow-up 3 — practice book
Same backfill over `TRPCT1541-GURI` (248 trades). 51 of 54 sessions have logs; missing 2026-06-26 and
2026-07-29 (`trade-log.csv` unnamed is 2026-05-06). Note the risk unit was $28 then $14, and
`Calendar Config` needs a half-size column per era.

## Follow-up 4 — new metrics unlocked
Add rate; add timing (how far into the move, in initial-R); **missed adds** (trades that ran >=1R with
no add — his notes repeatedly say "Missed to add"); **the starter-only counterfactual** (what he would
have made never adding — the number that tests whether the pyramid actually pays); risk creep; stop
honour.

## RETRACTED — the risk-at-stake finding (2026-09-08)
`r2-findings-regime.md` ranks **"Your peak risk-at-stake got worse … Fix this before anything else
in this report"** as its #2 item: 10% of live trades over 2x committed risk, CRM 08-28 at **6.95x**
($15 committed, $106 at stake), p=0.0089 vs practice. **That finding is an artifact and must not be
repeated.** Two reconstruction flaws inflated it (see the trade-journal module CLAUDE.md):
broker-refused exit orders read as stop placements, and brackets charged against more shares than
they covered. Corrected: CRM's true peak was **$20.82 (1.37x)**, and the book has **2 trades over 2x,
median 1.00x** — his exposure control is fine, with two genuine pyramid expansions (08-07 SPY 2.64x,
08-13 SMCI 2.14x, both verified by hand against the raw log).

The trader caught this by reading the number against his own screenshots. `Initial Risk ($)` and
`Initial Stop` were unaffected on all 70 rows, so the month's +19.4R and every R-multiple stand.
`WIP-TRPCT1541-GURI` (practice) still carries the uncorrected values — re-run `backfill-ladders.ts`
on it before that book is used for anything.

## Open findings needing verification before they are reported as fact
- 11/70 trades where logged `R (Risk)` differs from true initial risk by >25%. Five logged half-size
  while actually risking ~$27 (full size): 2026-07-31 GOOGL, 2026-08-13 SPY, 2026-08-13 QQQ,
  2026-08-14 GOOGL, 2026-08-18 QQQ. If real, R-multiples on those trades are overstated — and
  2026-08-13 is his best session (+10.1R).
- 13/70 trades whose build-phase risk-at-stake exceeded ~1.5 units. Worst: 2026-08-28 CRM at $105.54
  against an $18 unit. Needs a manual read against the chart before being called a rule violation —
  a mis-classified target order would produce the same signature.
