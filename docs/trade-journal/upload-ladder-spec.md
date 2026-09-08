# Spec — wire order-ladder reconstruction into the upload path

**Goal:** a DAS CSV uploaded through the app produces trade rows that already carry the
order ladder, the measured initial risk, and correct excursion values — so no manual
backfill is ever needed again.

Today `order-ladder.ts` exists and is correct but is **imported by nothing in the app**;
only `scripts/review/*` uses it. The upload path still writes rows with blank ladder
columns and a hand-typed R.

Read first: `web/lib/trade-journal/CLAUDE.md`, `scripts/review/NEXT-STEPS.md`,
and `web/lib/trade-journal/order-ladder.ts` (heavily commented — do not rewrite it).

---

## 1. `csv-parser.ts` — keep the bracket lifecycle

Line ~51 does `if (event !== "Execute") continue`, discarding the rows the whole
reconstruction depends on: `Accept` / `Sending` (protective order placed), `Replaced`
(stop or target moved), `Canceled`.

- **Do not change `validateAndParse`'s return shape** — `upload/route.ts` and the grouper
  depend on it.
- Add a parallel export that returns every row (`order-ladder.ts` already has
  `parseFullLog` and its own `LogRow` type — reuse it rather than defining a second one).
- The `Note` column is parsed but unused; it carries rejection reasons, not order IDs.
  There is **no order ID in the DAS export**, which is why fill clustering is a 3-second
  heuristic. That heuristic is corroborated by every bracket placement timestamp
  coinciding exactly with an entry fill — do not "improve" it without re-checking that.

## 2. `trade-grouper.ts` — emit the ladder

`buildRoundTrips` already separates `entryFills` from `exitFills` and then throws them
away in `finalizeTrade` (line ~171, `numPartials: allFills.length`).

- Extend `GroupedTrade` with the ladder fields. `buildLadders()` in `order-ladder.ts`
  already does the reconstruction including round-trip splitting — the cleanest wiring is
  to call it and join on `symbol` + normalised entry time, rather than duplicating the
  position-tracking logic in two places that can then drift.
- `numPartials` counts entries AND exits. "2 partials" means zero partials taken. Keep the
  field for back-compat but treat `# Entries` / `# Exits` as the real ones.
- DAS labels some long exits `Shrt`. `positionDelta` already handles this correctly
  (Sell and Shrt are both negative); do not "fix" it.

## 3. `google-sheets.ts` — 21 new columns

Columns, in the order they already exist on the WIP tabs (BZ..CT):

```
Entry Ladder · Exit Ladder · Stop Ladder · # Entries · # Exits · First Entry ·
Initial Stop · Initial Risk ($) · Max Risk At Stake ($) · Stop Raises · Stopped Out? ·
MFE (R) · Risk Source · Peak Position Value ($) · Trough Position Value ($) ·
Position MFE (R) · Capture % · Risk Basis · Peak In-Window ($) · In-Window MFE (R) ·
In-Window Capture %
```

- **APPEND to the END of `SHEET_HEADERS`. Never insert mid-array** — the positional `COL`
  map breaks. This is called out in `web/lib/trade-journal/CLAUDE.md`.
- `tradeToRow` writes the ladder fields; `migrateTabIfNeeded` adds the columns to existing
  tabs; `repairFormulas` regenerates formula columns.
- **`R (Risk)` becomes auto-filled** from the measured `Initial Risk ($)` — fill-if-blank,
  same semantics as `PLAN_FILL_COLS`, so a manual override survives and a day with no DAS
  export still works. Set `Risk Source` to `auto (ladder)` or `manual` accordingly.
- **`Stop` stops being the circular formula** `Avg Entry ± R/Shares` (it derives the stop
  from the number the trader typed, which is why it read 121.76 on MRNA when the real stop
  was 114.19). New formula prefers the real `Initial Stop`, falling back to the old
  derivation when there is no ladder — see `scripts/review/auto-risk.ts` for the exact
  formula string already in production on the WIP tabs.
- `P&L (R)` is a live formula `=P&L/R` and needs no change; correcting R fixes every
  R-multiple automatically.
- Dedup key is `Date|Symbol|normalizedEntryTime|Side` — Google Sheets strips leading zeros
  from times, so always normalise before comparing.

## 4. Enrichment — pass `entryRef`

`computeEnrichment` takes an optional `EntryRef { price, riskPerShare, entries[], initialRisk }`.
Only `scripts/review/re-enrich.ts` passes it; the app's `enrichSymbol` calls omit it, so
deployed enrichment still walks from blended Avg Entry with `R/totalShares` — wrong for
every scaled-in trade.

- Build `entryRef` from the ladder columns where present and pass it through
  `getTradesForBackfill` → `enrichSymbol`.
- `riskPerShare = Initial Risk ($) / firstEntryShares`, parsed from `Entry Ladder`.
- Without `entryRef` the code falls back to the old behaviour, so rows with no ladder keep
  working. Preserve that.

## 5. Sheet swap — ALREADY DONE for the live account (2026-09-08)

**Do not swap or delete anything.** The trader did it by hand:

| tab | cols | state |
|---|---|---|
| `U16632046-GURI` | 98 | **live, corrected** — carries the ladder columns. The app already writes here. |
| `OLD-U16632046-GURI` | 77 | archived original, deliberately renamed out of the way |
| `TRPCT1541-GURI` | 77 | practice, NOT swapped |
| `WIP-TRPCT1541-GURI` | 98 | corrected practice, still prefixed |

The practice swap is optional and low value — he trades the live account now. Leave it.

### RISK TO CHECK FIRST, BEFORE ANY UPLOAD RUNS

`SHEET_HEADERS` has 77 entries; the live tab now has **98 columns**. Trace
`migrateTabIfNeeded`, `repairFormulas` and `ensureSheetTab` against a 98-column tab and
confirm they cannot truncate, reorder or clobber columns 78-98. `web/lib/trade-journal/CLAUDE.md`
says unmanaged columns are ignored (precedent: `RightTheory?` and `EOD Screenshot` are
hand-added and unmanaged), so this *should* be safe — but the ladder data is an expensive
reconstruction from broker logs and re-deriving it costs a long Polygon backfill. Verify
before trusting it, and if migration is destructive, fix that before anything else in
this spec.

## 6. Verify before declaring done

```bash
node --experimental-strip-types scripts/review/verify.ts --tab=<TAB>   # must be 0 failures
cd web && npx tsc --noEmit && npx next build && npx @cloudflare/next-on-pages@1
```

Then upload one real CSV and confirm the new row carries a populated `Entry Ladder`, an
`Initial Risk ($)` matching `R (Risk)`, and a `Position MFE (R)` that is >= the realised
`P&L (R)` (it must bound it — that is the integrity check that caught the original bug).

## Constraints

- **Edge runtime**: no Node APIs, no `googleapis` SDK, raw `fetch` only.
- `order-ladder.ts` is pure and import-free by design so it runs on the edge AND under
  `node --experimental-strip-types`. Keep it that way.
- `timestampToET` is memoised for a reason (it blew Cloudflare's CPU limit). Do not
  reintroduce per-bar calls in hot loops.

## Known-good reference implementations

`scripts/review/backfill-ladders.ts` (matching + writing), `re-enrich.ts` (entryRef +
enrichment), `auto-risk.ts` (the R and Stop formulas). These are working code against the
real sheet — port their logic rather than reinventing it.
