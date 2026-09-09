# Trade Journal Module

## Overview
Processes DAS Trader CSV exports into round-trip trades and writes them to Google Sheets. Runs on Cloudflare edge runtime — no Node.js APIs.

## CSV format (DAS Trader)
Headers: `Event,B/S,Symbol,Shares,Price,Route,Time,Account,Note`
`validateAndParse()` keeps only rows where `Event === "Execute"` — everything the round-trip grouper needs. `parseFullExport()` is a **parallel** export over the same text that keeps every event, because the bracket lifecycle (`Accept`/`Sending`/`Replaced`/`Canceled`) is what the order-ladder reconstruction reads. Do not change `validateAndParse`'s return shape; the upload route and grouper depend on it.

The `Note` column carries rejection reasons, not order IDs. **There is no order ID in the DAS export**, which is why fill clustering is a 3-second heuristic — corroborated by every bracket placement timestamp coinciding exactly with an entry fill. Don't "improve" it without re-checking that.

## Trade grouping algorithm
Position tracking: Buy = +shares, Sell/Shrt = -shares. When cumulative position returns to 0, that's one complete round-trip trade. The grouper handles multiple partial fills and computes volume-weighted average entry/exit prices. DAS labels some long exits `Shrt`; `positionDelta` already handles that (Sell and Shrt are both negative) — do not "fix" it.

`attachLadders(trades, logRows)` then joins the reconstructed ladder onto each trade by `symbol` + normalised entry time. `buildLadders()` does its own round-trip splitting with the same position rule, so the two agree; joining rather than duplicating the position logic is deliberate — two copies would drift. Each ladder is consumed at most once, and when an account has no rows in the log it falls back to an unfiltered read (2026-07-30's fills were executed under the old practice account but recorded against the live one).

## Order ladder
`order-ladder.ts` — pure, import-free by design so it runs on the Cloudflare edge AND under `node --experimental-strip-types`. Keep it that way. It recovers the **actual protective stop the trader worked**, so `Initial Risk ($)` is measured rather than typed; `R (Risk)` is auto-filled from it (fill-if-blank) and `Risk Source` records `auto (ladder)` vs `manual`.

- Trading model: pyramiding at constant risk — each add is sized so its own risk is ~1 unit and the whole-position stop is re-set at the same instant.
- `initialStop` is the stop still standing `SETTLE_SECS` (30s) after entry, taken from the build phase only and never past the second entry — stops get nudged in the first seconds.
- `riskBasis` records where risk was measured: normally `first-entry`, but a **token starter** (a first lot under a tenth of the final position) falls back to `max-at-stake`, because the first lot's risk is a meaningless denominator (2026-06-24 WEN opened with 1 share: $0.35 risk turned a -$13 loss into -33.7R).
- `Peak Position Value ($)` runs to 16:00 and ignores the exit — a loose ceiling. Use `Peak In-Window ($)` for anything about exit quality.
- `# Partials` counts entries AND exits, so "2 partials" means zero partials taken. Deprecated in favour of `# Entries` / `# Exits`; kept for back-compat.
- `parseFills()` is the inverse of `fmtFills()` — read stored ladder cells back with it rather than re-deriving the format.

## Migration safety (98-column tabs)
The live tab carries 96 managed columns plus two hand-added unmanaged ones (`RightTheory?`, `EOD Screenshot`). Migration is **additive-only by construction**, and that is asserted rather than assumed:

- `planMigration(headerRow)` is a pure function holding the whole decision: a set difference for `missingHeaders`, an append at `headerRow.length` (strictly past every existing column), a name-keyed `colMap`, and `formulaWriteCols` — the complete set of columns any migration writes into. The header row is never rewritten, so existing column ORDER survives.
- `FORMULA_HEADERS` is the set of columns this module OWNS and regenerates in full on every migration. Nothing outside it is ever written. Adding a column to it is a **transfer of ownership** — check first that no row holds a hand-typed literal there.
- `scripts/review/migration-safety.ts` asserts all of the above against the live tabs (read-only), including that the archive `OLD-U16632046-GURI` is unreachable by `findTabByAccountPrefix` (its `OLD-` prefix shields it) and that no hand-typed literal sits in an owned formula column (read with `valueRenderOption=FORMULA`).
- **New headers go at the END of `SHEET_HEADERS`, never mid-array** — the positional `COL` map breaks otherwise.

## Google Sheets API (edge-compatible)
No `googleapis` SDK. All calls use `fetch` directly against `https://sheets.googleapis.com/v4/spreadsheets`.

Auth flow:
1. Parse service account JSON from env var
2. Build JWT with `iss`, `scope`, `aud`, `iat`, `exp` — scope includes `spreadsheets` and `drive.readonly`
3. Sign with Web Crypto API (`RSASSA-PKCS1-v1_5` / `SHA-256`)
4. Exchange JWT for access token at `https://oauth2.googleapis.com/token`

Key functions:
- `getAccessToken()` — JWT-based OAuth2 service account auth (exported, shared with Google Drive client)
- `ensureSheetTab()` — finds or creates a tab for the account, applies formatting
- `appendTrades()` — main entry point: dedup, append, compute stats
- `getTradesForReview()` — returns trades with tags for screenshot review page
- `updateTradeTags()` — writes tags to a specific trade row
- `populateInstructionsSheet()` — one-shot: writes column reference to Instructions tab
- `getDailyCalendar()` — per-day calendar cells (P&L, Realized R, Standard R, trades, W/L, avg risk, note flag) + a per-day `tradeList` for the calendar drill-down
- `applyRowFilter()` — shared row filter used by `computeStats`, `extractTradesForAnalysis`, and `getDailyCalendar` so all three sections filter identically (no drift)
- `parseStatsFilter()` — parses a `StatsFilter` from URL query params; shared by the stats, analysis, and calendar routes (`includeDates: false` for the calendar, which uses month nav for time)
- `getDailyPlan(date)` / `upsertDailyPlan(date, entries, daily)` / `ensureDailyPlanTab()` — read/replace the pre-market `Daily Plan` tab; upsert is replace-by-date and dedups entries by uppercased symbol; `daily` is the day-level psych check-in (returned alongside `entries` from `getDailyPlan`)
- `planMigration(headerRow)` — pure: the whole migration decision, asserted read-only by `scripts/review/migration-safety.ts`
- `tradeToRow(trade, rowIndex, colMap, enrichment?)` — builds one sheet row (exported so the upload path can be exercised offline)
- `backfillVixForTab(tabName)` — one-shot per-date pass that fills every blank VIX cell (no per-symbol Polygon calls; never overwrites existing values); route: `POST /api/trade-journal/backfill-vix`

## Morning Plan (pre-market watchlist + conviction)
A `Daily Plan` tab (`Date | Symbol | Conviction (1-3) | Thesis | Catalyst | L2 Bias | Daily Trend | Daily Conv | 1H Trend | 1H Conv | 5m Trend | 5m Conv | Energy (1-5) | Tension (1-5) | Urge to Trade Fast?`) lets the trader pre-qualify names **before the open**, when calm — solving the "can't log this at the open" problem. Catalyst is a dropdown of `CATALYST_OPTIONS`; **L2 Bias** (per-symbol order-book read) and each **MTF Trend** reuse `MARKET_BIAS_OPTIONS` (`Bullish`/`Bearish`/`Neutral`); each **MTF Conv** is 1–3. The MTF block is a per-timeframe direction + strength read for Daily / Hourly / 5min (1min is deliberately excluded — too noisy pre-open). The in-app form (`/pct-bootcamp/trade-journal/plan`, route `/api/trade-journal/plan`, GET by date + POST upsert) renders each name as a card. QQQ/SPY are seeded; the route dedups by symbol so re-typing them is safe.

At CSV upload, `appendTrades` loads the plan map once and, per new trade row, **auto-fills** every field in `PLAN_FILL_COLS` (Conviction, Catalyst, L2 Bias, and the six MTF columns — each only if the trade cell is blank) and sets the new **`Origin`** column by matching `date|symbol`: a name on the plan → `Watchlist`, anything not on the plan → `Intraday discovery`. `PLAN_FILL_COLS` maps a plan-fill key to a header string that is identical on both the plan tab and the trade sheet, so one list drives both reading the plan and writing the trade row.

**Day-level psych check-in** (`Energy (1-5)` drained↔fully charged, `Tension (1-5)` settled↔wired, `Urge to Trade Fast?` Yes/No, plus `Sleep Score` 0-100, `Readiness Score` 0-100, and `Sleep (hrs)` hours slept): replaced the daily "Emotional State" dropdown as the primary psych input (that column stays for history). Logged once per day in the Morning Plan form (button groups + numeric inputs above the symbol cards, ~10s), stored replicated on each plan row of the date, carried in the plan API as a separate `daily` object (`DailyPsych`). At upload they flow through `DAY_FILL_COLS` — keyed by **date alone**, so every trade of the day gets them, on- or off-plan (unlike `PLAN_FILL_COLS`, which is keyed `date|symbol`). Fill-if-blank; same identical-header convention. `Sleep Score`/`Readiness Score` already existed on the trade sheet (formerly hand-filled dailies, now auto-filled from the plan); `Sleep (hrs)` is a **new** column appended to the END of `SHEET_HEADERS` (never mid-array — that would break the positional `COL` map) and to `PLAN_HEADERS`. `L2 Bias` and the MTF reads are separate trade-sheet columns from the daily `Market Bias` (instrument/timeframe reads vs. overall-market read). `Origin` is a deliberately **separate axis from "Process Followed?"** — idea source must not pollute the execution-discipline signal. `Origin` is a manual column (dropdown `Watchlist / Callout / Intraday discovery`, flipped header) the trader can override — e.g. set `Callout` by hand for a vetted callout. **QQQ/SPY always get `Watchlist`** (`ALWAYS_WATCHLIST_SYMBOLS`, kept in sync with the plan form's `SEED_SYMBOLS`) even when no plan was saved that day.

## Capture / Trail-Leak Tracker
Client component (`CaptureTracker.tsx`) on the journal page; reads the existing `/api/trade-journal/analysis` endpoint (which already returns `pnl`, `risk`, `maxRBeforeStop`). Per trade: realized R = `pnl/risk`, MFE = `Max R Before Stop`. Headline KPI **Target Capture %** = among trades whose MFE ≥ target, `mean(min(realizedR, target)) / target` — isolates the trail leak from trades that simply failed early. Also: **R left on table**, winners' MFE-capture %, reach rate, a **weekly capture trend**, and a per-trade realized-vs-target-vs-MFE bar view. Target is configurable (default **2.5R**), persisted in `localStorage` (`pct-capture-target`). Driven by the shared page filter bar.

## Trading Calendar
Monthly calendar view of daily performance, three unit modes:
- **R (Standard)** — `daily $ P&L ÷ Full R target for that date`. Default. Conviction-aware: half-size days show proportionally smaller R.
- **Realized R** — sum of the `P&L (R)` column (each trade vs its own risk). Reveals when position sizing rescued/sank a day (a day can be green in $ but red in Realized R).
- **$** — raw dollar P&L.

The **Full R target** is read from a `Calendar Config` tab: columns `Account | Effective Date | Full R($)`. For each trade, the latest entry whose Effective Date ≤ the trade's date (matched by account/tab prefix) is used. This handles risk-unit changes over time (e.g. $28 → $48) without retroactively rescaling history. If no config row matches an account, the Standard R view is disabled and falls back to Realized R.

**Weekly execution gap**: the Week column shows `B` (bracket counterfactual: fixed −1R stop + fixed target, no management after entry) and `Δ` (actual − bracket). Per trade: MFE (`Max R Before Stop`, order-aware) ≥ target → +target, else −1R (pessimistic — trades reaching neither level by EOD count as −1R). Only trades with R + MFE participate, and actual is summed over those same trades. Target = the Capture Tracker's `pct-capture-target` (default 2.5R). Works in all three unit modes ($ via `bracketR × risk`, Std via `÷ fullR`); `tradeList` carries `maxRBeforeStop` for this. A month-level `Exec Gap` stat sits in the summary bar.

**Day drill-down**: clicking a calendar day expands a table of that day's trades (from the cell's `tradeList`). Columns are all sortable (Time, Symbol, Side, Setup, Conv, Risk, P&L, Realized R, Std R — numeric-aware, nulls last). A "Shots" column shows Entry/EOD screenshots (matched by `date|symbol` via the screenshots index) and opens a full-screen lightbox gallery. The screenshot index is lazily fetched once on first drill-down, cached, and fails soft. Constraint: shots key on `date|symbol`, so multiple same-symbol trades on a day share one screenshot set.

**Shared filters**: the page-level filter bar (Process Followed, date range, Setup, Conviction, Side, Symbol, Catalyst, Tags) drives Performance Overview, Risk & Stop Discipline, the Calendar, the Capture Tracker and Pyramid Analysis together via `applyRowFilter`/`parseStatsFilter`. The calendar ignores the date range (it uses month navigation).

## Google Drive API (edge-compatible)
In `google-drive.ts`. Lists screenshot files from two configurable Google Drive folders (entry + EOD), parses filenames to extract date/symbol, builds an index for matching with trades.

Key functions:
- `buildScreenshotIndex()` — lists both folders, parses filenames, returns `ScreenshotIndex` map
- `getFileContent()` — proxies raw image bytes from Drive for serving to the browser
- `parseScreenshotFilename()` — extracts date, symbol, type from filename

Filename convention:
- Entry: `YYYY-MM-DD SYMBOL <more details>.png`
- EOD: `YYYY-MM-DD SYMBOL EOD <more details>.png`

## Column layout (96 managed columns; 98 on the live tab with two unmanaged hand-added ones)
Auto-filled from CSV: Date, Entry Time, Exit Time, Duration, Symbol, Side, Shares, Avg Entry, Avg Exit, # Partials, P&L.
Formula columns: Stop (real Initial Stop, else Entry ± R/Shares), P&L(R) (P&L/R), Position MFE (R), Capture %, In-Window MFE (R), In-Window Capture %, 1R-6R (Y/N whether Max R Before Stop reached each R-multiple).
Max R Before Stop: Order-aware enrichment — walks 1-min bars from entry to 16:00 ET, tracks max favorable R-multiple, stops if stop-loss hit. Skips adverse check on the entry bar (intra-bar order unknown — low may be pre-entry). Requires R filled. Farthest Price is the stock price at that point.
MAE (R): enrichment — walks 1-min bars over the ACTUAL holding window (entry → exit), max adverse R-multiple stored negative (e.g. -0.62; 0 = never adverse). Skips the entry bar's adverse check like Max R; does NOT stop at the stop level (it measures heat actually taken). Requires R filled. In the analysis + trades-for-review payloads as `maeR`; MAE badge in Screenshot Review.
PDC/PDH/PDL: Prior Day Close/High/Low from daily bars — stored for pivot point analysis.
Per-trade manual: Setup (dropdown), Process Followed? (dropdown), Notes, Conviction 1-3 (dropdown), Catalyst (comma-separated), Tags (comma-separated, editable from Screenshot Review page). R (Risk) used to be manual and is now auto-filled from the measured Initial Risk ($) — fill-if-blank, so a hand correction survives; Risk Source records which.
Order ladder (auto from the DAS log at upload — see "Order ladder" above): Entry Ladder, Exit Ladder, Stop Ladder, # Entries, # Exits, First Entry, Initial Stop, Initial Risk ($), Max Risk At Stake ($), Stop Raises, Stopped Out?, MFE (R), Risk Source, Peak Position Value ($), Trough Position Value ($), Position MFE (R), Capture %, Risk Basis, Peak In-Window ($), In-Window MFE (R), In-Window Capture %. The four R/capture columns are live formulas over Initial Risk ($) and the peak values.
Daily manual (fill once on first trade of the day): Emotional State (dropdown — legacy, kept for history), Market Bias (dropdown).
Daily psych check-in (auto-filled from the Morning Plan onto every trade of the date): Energy (1-5), Tension (1-5), Urge to Trade Fast? (Yes/No) — dropdown-validated, flipped manual headers — plus Sleep Score (0-100), Readiness Score (0-100), Sleep (hrs) (hours slept, decimals; new column appended to the end of SHEET_HEADERS). Sleep Score/Readiness Score are the same trade-sheet columns that used to be hand-filled dailies, now auto-filled fill-if-blank from the plan.
Origin (manual dropdown, auto-filled from the Daily Plan at upload): Watchlist / Callout / Intraday discovery — idea source, kept separate from Process Followed?.
L2 Bias (manual dropdown, auto-filled from the Daily Plan at upload): Bullish / Bearish / Neutral — per-symbol pre-market order-book read, distinct from the daily Market Bias.
MTF read (manual, auto-filled from the Daily Plan): Daily/1H/5m Trend (Bullish/Bearish/Neutral) + Daily/1H/5m Conv (1-3) — per-timeframe direction + strength captured pre-market.
Market data enrichment (auto from Polygon): #1m, #5m, #1H, %Gap, %ATR, RVOL, %VWAP, OR Size ($), OR %ATR, OR High, OR Low, Max R Before Stop, Farthest Price, MAE (R), Breakout Vol Ratio, Prior Close Loc, Dist 20 SMA (%), Dist 50 SMA (%), Float, Avg $ Vol, SPY Dir, VIX, PDC, PDH, PDL, O, H, L, C, V, ATR, 30mATR, ADR.
Trade-date daily candle + volatility (auto from Polygon; live-sheet headers `O H L C V ATR 30mATR` + `ADR`): raw daily OHLCV of the trade date plus three **pre-open** volatility snapshots, all over the 14 sessions **before** the trade date (no lookahead). `ATR` = daily ATR-14 (**true** range — counts overnight gaps; `computeATR14`); reference volatility, feeds %ATR / OR %ATR. `30mATR` = mean 9:30–10:00 ET range (`compute30mATR`, from 1-min bars; null with <14 prior sessions). `ADR` = mean daily **High − Low** (`computeADR14`) — **gap-free**, the yardstick for the Daily Prediction metric (because the favorable move is measured from the open and so is also gap-free; dividing that by gap-inclusive ATR mismatched the numerator). Storing raw OHLCV keeps the data generic — new prediction thresholds won't need a re-backfill.

### Prediction & Execution Skill (computeStats)
- Computed server-side in `computeStats` (filter-aware), returned in `AggregateStats.skill`, rendered in Performance Overview (`AggregateStats.tsx`). Favorable excursion beyond the open: long `H − O`, short `O − L` (entry-independent, a pure prediction signal).
- **Intra-Day Prediction %** = share of readable trades with excursion ≥ `INTRADAY_READ_MULT` (1×) `30mATR`. **Daily Prediction %** = ≥ `DAILY_READ_MULT` (0.8×) `ADR` (headline) with ≥ `DAILY_READ_STRONG_MULT` (1.0×) as the strong read. **Uses `ADR`, not `ATR`** — the excursion is gap-free (measured from the open) so its yardstick must be gap-free too; dividing by true-range ATR compared gap-free travel to a gap-inflated bar. **Execution Skill %** = Target Capture % (same formula as `CaptureTracker`): among trades whose `Max R Before Stop` ≥ target, mean(min(realized R, target)) ÷ target. Each metric carries its readable-trade denominator; `numCell()` treats blank/`N/A` as null so young-listing rows drop out.
- The capture target flows from the client (`localStorage` `pct-capture-target`, default `DEFAULT_CAPTURE_TARGET` 2.5) → stats route `?target=` → `getStatsForTab` → `computeStats`.

### Discipline % (computeStats)
- Also computed server-side in `computeStats` on the already-filtered `dataRows` (so it respects the shared filter bar), returned as `AggregateStats.disciplinePct` / `disciplineN`, rendered in Performance Overview (`AggregateStats.tsx`) as a filter-aware card with a denominator + tooltip. **Discipline %** = trades marked `Process Followed?` = `Yes` ÷ trades labeled `Yes` or `No` (blank/unlabeled trades excluded from the denominator). `null` when nothing is labeled.

### Enrichment semantics
- **`entryRef` is the true entry**, recovered from the ladder columns: `{ price, riskPerShare, entries[], initialRisk }` with `riskPerShare = Initial Risk ($) / first-entry shares`. `R / totalShares` spread the whole trade's risk across lots that were not open yet when the stop was set, understating risk per share on every pyramid. `entries[]` also makes the excursion position-aware, so `Peak Position Value ($)` actually bounds realised P&L on a scaled-in trade. Built in `getTradesForBackfill` (from the sheet) and by `ladderEntryRef()` (from a fresh upload), threaded through `/api/trade-journal/enrich` → `enrichSymbol`. **Without it the code falls back to the old blended-average behaviour — preserve that**, so rows with no ladder keep working.
- **VIX** is per-date, not per-symbol. Polygon `I:VIX` requires an Indices plan (the current stocks key gets NOT_AUTHORIZED — verified); `fetchVixMap()` tries it once per isolate, then falls back to CBOE's free daily VIX history CSV (no auth, 1990→yesterday, memoized). Two fill paths: `backfillVixForTab()` (fast per-date pass, run first by the Backfill button) and `enrichSymbol()` (covers new uploads).
- **"N/A"** is written for daily-history fields (%Gap, %ATR, OR %ATR, Prior Close Loc, Dist 20/50 SMA, Avg $ Vol, PDC/PDH/PDL) when the ticker is a young listing: daily bars begin >21 days after the requested 250-day window start AND the trade date's bar index is below the field's lookback. Blank = "not enriched yet"; `N/A` = "impossible, don't retry". Parsers use `parseNullableNum()` which maps `N/A`/blank → null.
- The daily fetch window is 250 calendar days: sparsely traded tickers (e.g. SPAC SPCX trades well under half of sessions) need the margin for the 50-day SMA — this is why SPCX gets real values while genuinely young SSPC/SKHY get `N/A`.
- The **intraday** fetch window is **28 calendar days** before the earliest trade (widened from 7). The 7-day version only served the RVOL baseline; the 30mATR needs the 9:30–10:00 range over 14 prior sessions, so ≥14 trading days of 1-min bars must precede the earliest trade in a batch (28 cal ≈ 18-19 trading days). `atr14`/`atr30m`/`adr14` are wrapped in `naIfYoung` so young listings get `N/A`.
- `updateEnrichment()` **skips null fields** (keeps the existing cell) so re-running backfill never wipes previously computed values; `"N/A"` and numbers are written through.
- Backfill eligibility (`getTradesForBackfill`): a row needs work if it lacks basic enrichment, lacks the daily-candle group (gated on the `O` column, always computable when the daily bar exists — avoids re-triggering forever on genuinely-uncomputable ATR), or has R filled but is missing Max R Before Stop or MAE (R). VIX is excluded from eligibility — the per-date pass owns it.

All formulas are generated by `buildFormulas()` and used by both `tradeToRow()` (new trades) and `migrateTabIfNeeded()` (existing rows).
`repairFormulas()` regenerates all formula columns on every migration call, fixing #REF! errors from column reordering/deletion.
Sheet read range uses `READ_RANGE_END` (`TOTAL_COLS + READ_BUFFER_COLS`, 26) instead of hardcoded column letters. The buffer is deliberately generous: a read that stops at `TOTAL_COLS` silently drops unmanaged columns from every `colMap` built downstream — that is how `resolveMfe()` could never see `Position MFE (R)`. Reading past the last real column is free.

`Stop` prefers the real `Initial Stop` and falls back to the old `Avg Entry ± R/Shares` derivation only when there is no ladder. That fallback is circular (it back-derives the stop from the number the trader typed) and is measured off the blended average, a price no order ever rested at — that is how MRNA read 121.76 when the real stop was 114.19.

## Tags
Retrospective pattern labels applied during screenshot review. Stored as comma-separated values in the Tags column.
Preset options: clean entry, extended entry, chased, FOMO, added size, perfect process, revenge trade, oversize, strong momentum, gap>2xATR, gap<2xATR.
Custom tags can be typed freely (strict: false validation).
Tags are editable from the Screenshot Review page — saved immediately to Google Sheets via PATCH /api/trade-journal/tags.

## Dedup
Key: `Date|Symbol|normalizedEntryTime|Side`. Times are normalized (leading zeros stripped) because Google Sheets drops them (e.g., `09:30:46` → `9:30:46`).

## Known gotchas
- `Infinity` → use `9999` sentinel (JSON.stringify turns Infinity into null)
- Time normalization is critical for dedup — always strip leading zeros before comparison
- Google Sheets currency columns return values like `$32.21` — strip `$` and `,` when parsing P&L values back
- **Edge CPU limit / `timestampToET`**: enrich CPU is dominated by `timestampToET` (Intl.DateTimeFormat). Each bar's timestamp is converted many times (it's re-processed across every trade of a symbol), so on wide-date-range symbols (QQQ/SPY, dozens of trades over months) the raw cost blew Cloudflare's edge resource limit → **HTTP 503 / error 1102** (an HTML error page, so the client sees `Unexpected token '<'`). It is now **memoized** (bounded cache). Do NOT reintroduce per-bar `timestampToET` in hot per-trade loops, and prefer grouping intraday bars by date **once per symbol** (see `buildOpenRangeByDate`) rather than per trade.
- Sustained concurrent load (a full backfill + other heavy requests at once) can transiently 1102 even light routes; it recovers within ~1-2 min of quiet. Run big backfills when not also hammering the site.
- **Polygon 50k-row cap → `fetchPolygon` must paginate**: a single Polygon aggregates response is capped at 50,000 rows. Minute bars over ~55+ trading days (QQQ/SPY, any active symbol across months) exceed that, and with `sort=asc` the **most-recent dates get silently dropped** — recent trades look un-enriched even though Polygon has the data. `fetchPolygon` follows `next_url` to page the full range; don't reintroduce a single-request fetch for minute data.
