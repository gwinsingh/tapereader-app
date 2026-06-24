# Trade Journal — Phase 1 Spec (Watchlist/Conviction + Capture Tracker)

Status: **in progress** · Created 2026-06-23 · Sheet tab: `TRPCT1541-GURI`

This phase came out of a mentor-grade review of ~124 trades (May 6 → Jun 23). Full
findings live in the conversation; the short version that drives this build:

- **One real edge cluster, heavily diluted.** Process-followed + index/sector ETF +
  gap < 3% = 58% win, +0.56R over 31 trades. Everything else = 23% win, −$168 over 93.
- **Trail leak.** Trader targets **2.5R** (no partials). On trades whose MFE *reached*
  2.5R, he realizes only ~59% of target; ~16.5R left on the table in the good cluster.
  His conservative manual trail clips runners early. (June already improved capture
  29% → 40%, so the dial works.)
- **Conviction is well-calibrated when rated** (Conv 1 → 0% win, Conv 3 → 100%) but
  most trades are unrated because logging at the open is infeasible.
- **Origin matters but must stay separate from process.** Idea source (own watchlist
  vs callout vs intraday discovery) is a *different axis* than execution discipline.

## Design decisions (locked)

1. **`Origin` is a new, separate dimension — never folded into "Process Followed?".**
   Values: `Watchlist` / `Callout` / `Intraday discovery`. Process flag stays a pure
   execution-discipline judgment so the +$462 vs −$190 signal isn't polluted. Let the
   *data* decide later whether callout/intraday trades underperform.
2. **Conviction captured pre-market, not at entry.** A `Daily Plan` tab + a quick
   in-app morning form. Conviction stays on the existing **1–3** scale everywhere
   (no A/B/C mapping). At upload, conviction auto-fills from the plan by `date|symbol`.
3. **Capture target = configurable, default 2.5R.** Persisted in **localStorage**
   (`pct-capture-target`) — single-user personal setting, no sheet round-trip needed.
   (Deviation from the earlier "store in Calendar Config" idea; localStorage is simpler
   and instant.)
4. **Manual QQQ/SPY must still work.** The form seeds QQQ + SPY, but the route dedups
   plan entries by symbol (uppercased), so typing them again never creates duplicates.

## Scope — Phase 1

### Data model (Google Sheet)
- **`Origin` column** appended to `TRPCT1541-GURI` (added via existing `migrateTabIfNeeded`
  on next upload). Manual-column styling (flipped header), dropdown
  `Watchlist / Callout / Intraday discovery` (strict: false), centered.
- **`Daily Plan` tab**: `Date | Symbol | Conviction (1-3) | Thesis | Source`
  (`Source` ∈ `Watchlist`/`Callout`). Created on demand.

### Backend (`lib/trade-journal/google-sheets.ts`)
- `ORIGIN_OPTIONS` const; add `Origin` to `SHEET_HEADERS`, `manualHeaders`, colWidths,
  center-align, and a `setDataValidation` dropdown in `applyFormatting`.
- `ensureDailyPlanTab`, `getDailyPlan(date)`, `getDailyPlanMap()` (all rows →
  `Map<"date|symbol", {conviction, source}>`), `upsertDailyPlan(date, entries)`
  (replace-by-date).
- In `appendTrades`: fetch plan map once; for each new row set `Origin`
  (plan source, else `Intraday discovery`) and fill `Conviction` if blank.

### API
- **`/api/trade-journal/plan`** (edge): `GET ?date=` → entries; `POST {date, entries}`
  → upsert (dedup by symbol).

### UI
- **`/pct-bootcamp/trade-journal/plan`** page: date picker (today default), editable rows
  `{symbol, conviction, thesis, source}`, QQQ/SPY seeded, add/remove, save. Nav link
  from the main journal header.
- **`CaptureTracker`** component (collapsible card, shared filter bar) on the journal
  page. Reads existing `/api/trade-journal/analysis` (already returns pnl, risk, maxR).
  KPIs: **Target Capture %** (among MFE ≥ target trades, mean(min(realized,target))/target),
  **R left on table**, overall MFE capture %, **weekly capture trend**, and a
  realized-vs-MFE-vs-target per-trade view. Configurable target (default 2.5R).

## Out of scope (Phase 2, deferred)
Edge-concentration equity curve · pre-trade setup scorer · symbol scorecard /
auto-restricted list · daily state go/no-go + overtrading governor + post-win nudge ·
auto weekly AI mentor report.

## Verification
`npx tsc --noEmit` and `npx @cloudflare/next-on-pages@1` (edge compat) before commit;
update both `CLAUDE.md` files.
