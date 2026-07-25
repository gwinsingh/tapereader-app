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
- `getDailyPlan(date)` / `upsertDailyPlan(date, entries, daily)` / `ensureDailyPlanTab()` — read/replace the pre-market `Daily Plan` tab; upsert is replace-by-date and dedups entries by uppercased symbol; `daily` is the day-level psych check-in (returned alongside `entries` from `getDailyPlan`)
- `backfillVixForTab(tabName)` — one-shot per-date pass that fills every blank VIX cell (no per-symbol Polygon calls; never overwrites existing values); route: `POST /api/trade-journal/backfill-vix`

## Morning Plan (pre-market watchlist + conviction)
A `Daily Plan` tab (`Date | Symbol | Conviction (1-3) | Thesis | Catalyst | L2 Bias | Daily Trend | Daily Conv | 1H Trend | 1H Conv | 5m Trend | 5m Conv | Energy (1-5) | Tension (1-5) | Urge to Trade Fast?`) lets the trader pre-qualify names **before the open**, when calm — solving the "can't log this at the open" problem. Catalyst is a dropdown of `CATALYST_OPTIONS`; **L2 Bias** (per-symbol order-book read) and each **MTF Trend** reuse `MARKET_BIAS_OPTIONS` (`Bullish`/`Bearish`/`Neutral`); each **MTF Conv** is 1–3. The MTF block is a per-timeframe direction + strength read for Daily / Hourly / 5min (1min is deliberately excluded — too noisy pre-open). The in-app form (`/pct-bootcamp/trade-journal/plan`, route `/api/trade-journal/plan`, GET by date + POST upsert) renders each name as a card. QQQ/SPY are seeded; the route dedups by symbol so re-typing them is safe.

At CSV upload, `appendTrades` loads the plan map once and, per new trade row, **auto-fills** every field in `PLAN_FILL_COLS` (Conviction, Catalyst, L2 Bias, and the six MTF columns — each only if the trade cell is blank) and sets the new **`Origin`** column by matching `date|symbol`: a name on the plan → `Watchlist`, anything not on the plan → `Intraday discovery`. `PLAN_FILL_COLS` maps a plan-fill key to a header string that is identical on both the plan tab and the trade sheet, so one list drives both reading the plan and writing the trade row.

**Day-level psych check-in** (`Energy (1-5)` drained↔fully charged, `Tension (1-5)` settled↔wired, `Urge to Trade Fast?` Yes/No): replaced the daily "Emotional State" dropdown as the primary psych input (that column stays for history). Logged once per day in the Morning Plan form (button groups above the symbol cards, ~10s), stored replicated on each plan row of the date, carried in the plan API as a separate `daily` object. At upload they flow through `DAY_FILL_COLS` — keyed by **date alone**, so every trade of the day gets them, on- or off-plan (unlike `PLAN_FILL_COLS`, which is keyed `date|symbol`). Fill-if-blank; same identical-header convention. `L2 Bias` and the MTF reads are separate trade-sheet columns from the daily `Market Bias` (instrument/timeframe reads vs. overall-market read). `Origin` is a deliberately **separate axis from "Process Followed?"** — idea source must not pollute the execution-discipline signal. `Origin` is a manual column (dropdown `Watchlist / Callout / Intraday discovery`, flipped header) the trader can override — e.g. set `Callout` by hand for a vetted callout.

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

## Column layout (66 columns)
Auto-filled from CSV: Date, Entry Time, Exit Time, Duration, Symbol, Side, Shares, Avg Entry, Avg Exit, # Partials, P&L.
Formula columns: Stop (Entry ± R/Shares), P&L(R) (P&L/R), 1R-6R (Y/N whether Max R Before Stop reached each R-multiple).
Max R Before Stop: Order-aware enrichment — walks 1-min bars from entry to 16:00 ET, tracks max favorable R-multiple, stops if stop-loss hit. Skips adverse check on the entry bar (intra-bar order unknown — low may be pre-entry). Requires R filled. Farthest Price is the stock price at that point.
MAE (R): enrichment — walks 1-min bars over the ACTUAL holding window (entry → exit), max adverse R-multiple stored negative (e.g. -0.62; 0 = never adverse). Skips the entry bar's adverse check like Max R; does NOT stop at the stop level (it measures heat actually taken). Requires R filled. In the analysis + trades-for-review payloads as `maeR`; MAE badge in Screenshot Review.
PDC/PDH/PDL: Prior Day Close/High/Low from daily bars — stored for pivot point analysis.
Per-trade manual: R (Risk), Setup (dropdown), Process Followed? (dropdown), Notes, Conviction 1-3 (dropdown), Catalyst (comma-separated), Tags (comma-separated, editable from Screenshot Review page).
Daily manual (fill once on first trade of the day): Sleep Score (0-100), Readiness Score (0-100), Emotional State (dropdown — legacy, kept for history), Market Bias (dropdown).
Daily psych check-in (auto-filled from the Morning Plan onto every trade of the date): Energy (1-5), Tension (1-5), Urge to Trade Fast? (Yes/No) — dropdown-validated, flipped manual headers.
Origin (manual dropdown, auto-filled from the Daily Plan at upload): Watchlist / Callout / Intraday discovery — idea source, kept separate from Process Followed?.
L2 Bias (manual dropdown, auto-filled from the Daily Plan at upload): Bullish / Bearish / Neutral — per-symbol pre-market order-book read, distinct from the daily Market Bias.
MTF read (manual, auto-filled from the Daily Plan): Daily/1H/5m Trend (Bullish/Bearish/Neutral) + Daily/1H/5m Conv (1-3) — per-timeframe direction + strength captured pre-market.
Market data enrichment (auto from Polygon): #1m, #5m, #1H, %Gap, %ATR, RVOL, %VWAP, OR Size ($), OR %ATR, OR High, OR Low, Max R Before Stop, Farthest Price, MAE (R), Breakout Vol Ratio, Prior Close Loc, Dist 20 SMA (%), Dist 50 SMA (%), Float, Avg $ Vol, SPY Dir, VIX, PDC, PDH, PDL.

### Enrichment semantics
- **VIX** is per-date, not per-symbol. Polygon `I:VIX` requires an Indices plan (the current stocks key gets NOT_AUTHORIZED — verified); `fetchVixMap()` tries it once per isolate, then falls back to CBOE's free daily VIX history CSV (no auth, 1990→yesterday, memoized). Two fill paths: `backfillVixForTab()` (fast per-date pass, run first by the Backfill button) and `enrichSymbol()` (covers new uploads).
- **"N/A"** is written for daily-history fields (%Gap, %ATR, OR %ATR, Prior Close Loc, Dist 20/50 SMA, Avg $ Vol, PDC/PDH/PDL) when the ticker is a young listing: daily bars begin >21 days after the requested 250-day window start AND the trade date's bar index is below the field's lookback. Blank = "not enriched yet"; `N/A` = "impossible, don't retry". Parsers use `parseNullableNum()` which maps `N/A`/blank → null.
- The daily fetch window is 250 calendar days: sparsely traded tickers (e.g. SPAC SPCX trades well under half of sessions) need the margin for the 50-day SMA — this is why SPCX gets real values while genuinely young SSPC/SKHY get `N/A`.
- `updateEnrichment()` **skips null fields** (keeps the existing cell) so re-running backfill never wipes previously computed values; `"N/A"` and numbers are written through.
- Backfill eligibility (`getTradesForBackfill`): a row needs work if it lacks basic enrichment, or has R filled but is missing Max R Before Stop or MAE (R). VIX is excluded from eligibility — the per-date pass owns it.

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
