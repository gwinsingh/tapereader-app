# Trade Journal Module

## Overview
Processes DAS Trader CSV exports into round-trip trades and writes them to Google Sheets. Runs on Cloudflare edge runtime — no Node.js APIs.

## CSV format (DAS Trader)
Headers: `Event,B/S,Symbol,Shares,Price,Route,Time,Account,Note`
Only rows where `Event === "Execute"` are processed. Everything else (Accept, Cancel, etc.) is filtered out.

## Trade grouping algorithm
Position tracking: Buy = +shares, Sell/Shrt = -shares. When cumulative position returns to 0, that's one complete round-trip trade. The grouper handles multiple partial fills and computes volume-weighted average entry/exit prices.

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
- `getDailyPlan(date)` / `upsertDailyPlan(date, entries)` / `ensureDailyPlanTab()` — read/replace the pre-market `Daily Plan` tab; upsert is replace-by-date and dedups entries by uppercased symbol

## Morning Plan (pre-market watchlist + conviction)
A `Daily Plan` tab (`Date | Symbol | Conviction (1-3) | Thesis | Source`, `Source` ∈ `Watchlist`/`Callout`) lets the trader pre-qualify names **before the open**, when calm — solving the "can't log conviction at the open" problem. The in-app form is at `/pct-bootcamp/trade-journal/plan` (route: `/api/trade-journal/plan`, GET by date + POST upsert). QQQ/SPY are seeded; the route dedups by symbol so re-typing them is safe.

At CSV upload, `appendTrades` loads the plan map once and, per new trade row, **auto-fills** `Conviction` (if blank) and sets the new **`Origin`** column by matching `date|symbol`: a planned name → its `Source` (`Watchlist`/`Callout`), anything not on the plan → `Intraday discovery`. `Origin` is a deliberately **separate axis from "Process Followed?"** — idea source must not pollute the execution-discipline signal. `Origin` is a manual column (dropdown `Watchlist / Callout / Intraday discovery`, flipped header) the trader can override.

## Capture / Trail-Leak Tracker
Client component (`CaptureTracker.tsx`) on the journal page; reads the existing `/api/trade-journal/analysis` endpoint (which already returns `pnl`, `risk`, `maxRBeforeStop`). Per trade: realized R = `pnl/risk`, MFE = `Max R Before Stop`. Headline KPI **Target Capture %** = among trades whose MFE ≥ target, `mean(min(realizedR, target)) / target` — isolates the trail leak from trades that simply failed early. Also: **R left on table**, winners' MFE-capture %, reach rate, a **weekly capture trend**, and a per-trade realized-vs-target-vs-MFE bar view. Target is configurable (default **2.5R**), persisted in `localStorage` (`pct-capture-target`). Driven by the shared page filter bar.

## Trading Calendar
Monthly calendar view of daily performance, three unit modes:
- **R (Standard)** — `daily $ P&L ÷ Full R target for that date`. Default. Conviction-aware: half-size days show proportionally smaller R.
- **Realized R** — sum of the `P&L (R)` column (each trade vs its own risk). Reveals when position sizing rescued/sank a day (a day can be green in $ but red in Realized R).
- **$** — raw dollar P&L.

The **Full R target** is read from a `Calendar Config` tab: columns `Account | Effective Date | Full R($)`. For each trade, the latest entry whose Effective Date ≤ the trade's date (matched by account/tab prefix) is used. This handles risk-unit changes over time (e.g. $28 → $48) without retroactively rescaling history. If no config row matches an account, the Standard R view is disabled and falls back to Realized R.

**Day drill-down**: clicking a calendar day expands a table of that day's trades (from the cell's `tradeList`). Columns are all sortable (Time, Symbol, Side, Setup, Conv, Risk, P&L, Realized R, Std R — numeric-aware, nulls last). A "Shots" column shows Entry/EOD screenshots (matched by `date|symbol` via the screenshots index) and opens a full-screen lightbox gallery. The screenshot index is lazily fetched once on first drill-down, cached, and fails soft. Constraint: shots key on `date|symbol`, so multiple same-symbol trades on a day share one screenshot set.

**Shared filters**: the page-level filter bar (Process Followed, date range, Setup, Conviction, Side, Symbol, Catalyst, Tags) drives Performance Overview, the Calendar, and Profitability Analysis together via `applyRowFilter`/`parseStatsFilter`. The calendar ignores the date range (it uses month navigation).

## Google Drive API (edge-compatible)
In `google-drive.ts`. Lists screenshot files from two configurable Google Drive folders (entry + EOD), parses filenames to extract date/symbol, builds an index for matching with trades.

Key functions:
- `buildScreenshotIndex()` — lists both folders, parses filenames, returns `ScreenshotIndex` map
- `getFileContent()` — proxies raw image bytes from Drive for serving to the browser
- `parseScreenshotFilename()` — extracts date, symbol, type from filename

Filename convention:
- Entry: `YYYY-MM-DD SYMBOL <more details>.png`
- EOD: `YYYY-MM-DD SYMBOL EOD <more details>.png`

## Column layout (54 columns)
Auto-filled from CSV: Date, Entry Time, Exit Time, Duration, Symbol, Side, Shares, Avg Entry, Avg Exit, # Partials, P&L.
Formula columns: Stop (Entry ± R/Shares), P&L(R) (P&L/R), 1R-6R (Y/N whether Max R Before Stop reached each R-multiple).
Max R Before Stop: Order-aware enrichment — walks 1-min bars from entry to 16:00 ET, tracks max favorable R-multiple, stops if stop-loss hit. Skips adverse check on the entry bar (intra-bar order unknown — low may be pre-entry). Requires R filled. Farthest Price is the stock price at that point.
PDC/PDH/PDL: Prior Day Close/High/Low from daily bars — stored for pivot point analysis.
Per-trade manual: R (Risk), Setup (dropdown), Process Followed? (dropdown), Notes, Conviction 1-3 (dropdown), Catalyst (comma-separated), Tags (comma-separated, editable from Screenshot Review page).
Daily manual (fill once on first trade of the day): Sleep Score (0-100), Readiness Score (0-100), Emotional State (dropdown), Market Bias (dropdown).
Origin (manual dropdown, auto-filled from the Daily Plan at upload): Watchlist / Callout / Intraday discovery — idea source, kept separate from Process Followed?.
Market data enrichment (auto from Polygon): #1m, #5m, #1H, %Gap, %ATR, RVOL, %VWAP, OR Size ($), OR %ATR, OR High, OR Low, Max R Before Stop, Farthest Price, Breakout Vol Ratio, Prior Close Loc, Dist 20 SMA (%), Dist 50 SMA (%), Float, Avg $ Vol, SPY Dir, VIX, PDC, PDH, PDL.
All formulas are generated by `buildFormulas()` and used by both `tradeToRow()` (new trades) and `migrateTabIfNeeded()` (existing rows).
`repairFormulas()` regenerates all formula columns on every migration call, fixing #REF! errors from column reordering/deletion.
Sheet read range uses `READ_RANGE_END` (TOTAL_COLS + 10 buffer) instead of hardcoded column letters — handles old columns not yet removed.

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
