# Gap Analysis — TapeReader Auto Trade Journal vs. the market

**Status:** Part A complete (internal audit, 2026-09-01) · Part B pending vendor research
**Method:** `00-method.md`. Part A is a code audit, not a doc summary — every claim below was
read out of the implementation. Where `CLAUDE.md` or `docs/trade-journal/README.md` drifts
from the code, the code wins and the drift is flagged.

---

# Part A — What TapeReader's journal does today (internal audit)

## 1. Data in

### 1.1 The only supported import: DAS Trader "Trades" CSV

`web/lib/trade-journal/csv-parser.ts:12` defines the contract:

```
EXPECTED_HEADERS = ["Event", "B/S", "Symbol", "Shares", "Price", "Route", "Time", "Account", "Note"]
```

Validation (`web/lib/trade-journal/csv-parser.ts:14-92`):

- Header row is the first non-blank line, trailing commas stripped
  (`csv-parser.ts:27`). **Every** expected header must be present by exact name or the
  whole upload throws (`csv-parser.ts:30-37`). Extra columns are tolerated; order is
  irrelevant (indices are resolved by name at `csv-parser.ts:39-42`).
- Only rows with `Event === "Execute"` are kept (`csv-parser.ts:51`). Order placements,
  cancels, and rejects are silently dropped.
- `B/S` must be exactly one of `Buy` / `Sell` / `Shrt`, else **the entire upload fails**
  with a row-number error (`csv-parser.ts:53-56`). Notably `Cvr` (cover) is *not* in the
  allow-list — DAS emits `Buy` for covers, so this holds for DAS, but it makes the parser
  brittle to any variant export.
- `Shares` must parse as a positive int, `Price` as a positive float, `Account` must be
  non-empty — each a hard throw (`csv-parser.ts:58-73`).
- Zero executions after filtering → throw (`csv-parser.ts:87-89`).

Splitting is naive `line.split(",")` (`csv-parser.ts:48`) — **a quoted field containing a
comma would corrupt the row**. The `Note` column is required to exist but never read.

### 1.2 What the route accepts

`web/app/api/trade-journal/upload/route.ts:19-80`: multipart form with `file` (must end
`.csv`, `:29`), `date` (`YYYY-MM-DD`, defaults to today ET, `:23`/`:36`), optional
`sheetSuffix`. **The trade date comes from the form field, not from the CSV** — DAS's export
has a `Time` column but no date, so one upload = one trading day. Uploading a
multi-day export would stamp every trade with the same date.

### 1.3 What is NOT supported

- **No other broker.** No IBKR Flex, no TD/Schwab, no Tradovate/NinjaTrader, no
  Webull/Robinhood, no generic CSV mapper, no broker OAuth auto-sync. One vendor, one
  layout, exact header names.
- **No API ingest.** There is no authenticated write endpoint for trades other than the
  browser upload form.
- **No options, futures, forex, or crypto.** The grouper's P&L is
  `(exit − entry) × shares` (`trade-grouper.ts:151-155`) — no contract multiplier, no
  option leg/expiry/strike, no per-leg spread handling.
- **No commissions, fees, ECN rebates, borrow, or slippage** anywhere in the pipeline.
  Reported P&L is gross.
- **No corporate-action handling** (splits, dividends). Polygon aggregates are fetched
  with default adjustment while trade prices are raw fills — a split inside the enrichment
  lookback silently distorts ATR/ADR/SMA comparisons.
- **No manual trade entry UI.** If DAS didn't export it, it isn't in the journal.
- **No screenshot upload from the app** — screenshots are dropped into Google Drive folders
  by hand, named by convention (§5.6/§6.4).

---

## 2. Trade construction (fills → round trips)

`web/lib/trade-journal/trade-grouper.ts`.

**Bucketing.** Executions are keyed by `account::symbol` (`trade-grouper.ts:37`), fills sorted
by `HH:MM:SS` (`:53`). Multi-account CSVs are handled here and again at write time
(`google-sheets.ts:2615-2618` groups by account → one sheet tab per account).

**Position walk** (`trade-grouper.ts:61-111`):

- `positionDelta`: `Buy = +shares`, `Sell`/`Shrt` = `−shares` (`:113-118`).
- At `position === 0`, the next fill opens a trade and sets direction by sign (`:76-82`).
- Same-sign fills append to `entryFills` (scaling in); opposite-sign fills append to
  `exitFills` (scaling out) (`:84-91`).
- When `position` returns to exactly 0, the round trip is finalized (`:95-100`).

**Handled:** scaling in and out, arbitrary partial counts, shorts, multiple sequential
round trips in the same symbol/day, multiple accounts in one file.

**Not handled / silently wrong:**

- **Flips.** A fill that crosses through zero (e.g. long 100, sell 200) is treated as a
  single exit; `position` lands at −100 and the *next* fill is appended to a still-open
  trade rather than opening a short. The code only opens a new trade when `position === 0`.
- **Overnight / multi-day holds.** Everything is keyed to the single form-supplied date. An
  unclosed position at end of file is finalized anyway as a "partial trade"
  (`trade-grouper.ts:103-108`) — `avgExit` is `0` when there are no exit fills
  (`weightedAvgPrice([]) → 0`, `:120-129`) and `pnl` is `0` because
  `closedShares = min(entryShares, 0) = 0` (`:148-155`). It lands on the sheet as a
  zero-P&L row with a `$0.00` average exit. The next day's upload creates a *separate*
  trade for the closing fills. **There is no position carry.**
- **`# Partials` is mislabeled.** It stores `allFills.length` (`:171`), i.e. total fills,
  not the number of scale-outs.
- **Duration is exit-minus-entry in seconds/60** (`:159-160`), clamped at 0 — negative
  durations from an overnight wrap are floored, not detected.
- **No timezone** anywhere in the grouper: `HH:MM:SS` is taken as-is and later interpreted
  as ET by the analytics.
- **Dedup key is `Date|Symbol|normalizedEntryTime|Side`** (`google-sheets.ts:1269-1277`).
  Two genuinely distinct trades in the same symbol with the same entry second on the same
  side would collide; re-uploading the same day is safely idempotent.

---

## 3. Stored data model — the sheet **is** the database

One Google Sheet, one tab per trading account (matched by account prefix,
`google-sheets.ts:430-441`), plus shared tabs `Daily Plan`, `Calendar Config`, and
`Instructions`. The managed schema is **75 columns** (`SHEET_HEADERS`,
`google-sheets.ts:4-95`). New headers are only ever *appended* (migration
`migrateTabIfNeeded`, `:1092-1125`) so the legacy positional `COL` map stays valid; all
reads/writes go through a header-name → index map (`buildColMap`, `:155-159`), so a user
reordering columns in the sheet does not break the app.

### 3.1 Auto-filled from the CSV (11)

`Date`, `Entry Time`, `Exit Time`, `Duration (mins)`, `Symbol`, `Side`, `Shares`,
`Avg Entry`, `Avg Exit`, `# Partials`, `P&L` — written by `tradeToRow`
(`google-sheets.ts:1191-1258`).

### 3.2 Formula columns (8)

Generated by `buildFormulas` (`google-sheets.ts:1156-1189`) and re-written on every
migration pass by `repairFormulas` (`:1041-1089`):

| Column | Formula |
|---|---|
| `Stop` | `Avg Entry ∓ R/Shares` (Long: minus; Short: plus) |
| `P&L (R)` | `P&L / R (Risk)` |
| `1R`…`6R` | `IF(Max R Before Stop >= n, "Y", "N")` |

All blank-guarded (`IF(R="","",…)`).

### 3.3 Manual, per trade (7)

`R (Risk)`, `Setup` (dropdown: ORB / ABCD / BHOD / BLOD / VWAP Bounce / Mean Reversion,
`:173-180`), `Process Followed?` (Yes/No dropdown), `Notes`, `Conviction (1-3)`,
`Catalyst` (9 options, `:182-192`), `Tags` (free text + 11 presets, `:194-206`).
`Origin` (`Watchlist` / `Callout` / `Intraday discovery`, `:208-212`) is a manual dropdown
that is *auto-seeded* at upload (§3.7).

### 3.4 Manual, per day (2 legacy)

`Emotional State` (Calm/Anxious/Excited/Frustrated/Fatigued, `:219-225`) and `Market Bias`
(Bullish/Bearish/Neutral, `:227-231`). Emotional State is explicitly legacy — kept for
history, superseded by the psych block.

### 3.5 Psych / readiness block (6) — auto-filled from the Morning Plan

`DAY_FILL_COLS` (`google-sheets.ts:2030-2037`): `Energy (1-5)`, `Tension (1-5)`,
`Urge to Trade Fast?`, `Sleep Score` (0-100), `Readiness Score` (0-100), `Sleep (hrs)`.
Keyed by **date alone** and stamped onto *every* trade of that date, on-plan or not
(`appendTrades`, `google-sheets.ts:2674-2683`), fill-if-blank.

### 3.6 Pre-market read block (9) — auto-filled from the Morning Plan by `date|SYMBOL`

`PLAN_FILL_COLS` (`google-sheets.ts:2006-2016`): `Conviction (1-3)`, `Catalyst`,
`L2 Bias`, `Daily Trend`, `Daily Conv`, `1H Trend`, `1H Conv`, `5m Trend`, `5m Conv`.
Trend fields reuse Bullish/Bearish/Neutral; Conv fields are 1–3. One header map drives
both plan-read and trade-write, so plan and journal cannot drift.

### 3.7 `Origin` derivation

`appendTrades` (`google-sheets.ts:2657-2662`): symbol present in the plan for that date →
`Watchlist`; `QQQ`/`SPY` → always `Watchlist` (`ALWAYS_WATCHLIST_SYMBOLS`, `:217`);
otherwise `Intraday discovery`. `Callout` is a human override only. Origin is deliberately
kept orthogonal to `Process Followed?`.

### 3.8 Market-data enrichment (33)

`Max R Before Stop`, `Farthest Price`, `MAE (R)`, `#1m`, `#5m`, `#1H`, `%Gap`, `%ATR`,
`RVOL`, `%VWAP`, `OR Size ($)`, `OR %ATR`, `OR High`, `OR Low`, `Breakout Vol Ratio`,
`Prior Close Loc`, `Dist 20 SMA (%)`, `Dist 50 SMA (%)`, `Float`, `Avg $ Vol`, `SPY Dir`,
`VIX`, `PDC`, `PDH`, `PDL`, `O`, `H`, `L`, `C`, `V`, `ATR`, `30mATR`, `ADR`. Detail in §5.

### 3.9 Formatting as UI

`applyFormatting` (`google-sheets.ts:448-1037`) does real work: frozen header; **inverted
header colors on all 18 manual columns** so the human knows what to fill
(`manualHeaders`, `:456`); per-column pixel widths for all 75; currency/number formats;
conditional formatting (green/red on P&L, P&L (R), Side, Process Followed, 1R–6R); and 13
`setDataValidation` dropdowns.

### 3.10 Other tabs

- **`Daily Plan`** (`PLAN_HEADERS`, `:1979-1988`): `Date | Symbol | Conviction (1-3) |
  Thesis | Catalyst | L2 Bias | Daily Trend | Daily Conv | 1H Trend | 1H Conv | 5m Trend |
  5m Conv | Energy | Tension | Urge to Trade Fast? | Sleep Score | Readiness Score |
  Sleep (hrs)`. Day-level psych is replicated onto every row of the date.
- **`Calendar Config`**: `Account | Effective Date | Full R($)` — a *dated schedule* of
  risk-unit sizes (`getFullRSchedule`, `:1921-1951`).
- **`Instructions`**: a populated help tab (`populateInstructionsSheet`, `:2353+`).
- **Unmanaged, hand-added on the live sheet:** `RightTheory?` and `EOD Screenshot`. The
  code ignores the former; the calendar *does* read `EOD Screenshot` to set the day's
  note dot (`google-sheets.ts:2249`), and `scripts/fill-eod-links.mjs` backfills it with
  Drive hyperlinks.

---

## 4. Analytics actually computed

### 4.1 Aggregate stats — `computeStats` (`google-sheets.ts:1572-1727`)

Runs server-side on the filtered rows. Rows lacking a `P&L` value are excluded (`:1588`).

- `totalPnl` = Σ P&L; `avgDailyPnl` = totalPnl ÷ **count of distinct dates** (`:1638`)
- `winRate` = winners ÷ total ×100 (P&L > 0; exactly-0 trades count in neither bucket but
  do count in the denominator)
- `profitFactor` = grossWins ÷ |grossLosses|; `9999` sentinel when there are no losses
  (`Infinity` doesn't survive `JSON.stringify`)
- `avgWinner`, `avgLoser`, `largestWin`, `largestLoss`
- `maxConsecutiveWins` / `Losses` — walked in **sheet row order**, not date order
  (`:1645-1652`); a zero-P&L trade resets both streaks
- `avgDurationMins`

### 4.2 Time-of-day breakdowns

Two grids over `Entry Time`, both via `computeSegment` (`:1445-1461`):
4 coarse blocks (`HOUR_BLOCKS`, `:1417-1422`: Opening Bell 9:30–10:00, Morning 10:00–11:30,
Lunch 11:30–14:00, Closing 14:00–16:00) and 12 granular blocks (`:1424-1437`, starting
9:30–9:35 / 9:35–9:45 / 9:45–10:00). Empty blocks are dropped.

### 4.3 Categorical breakdowns

`setupBreakdown`, `convictionBreakdown`, `catalystBreakdown` (`:1665-1706`). Setup and
Catalyst are **comma-split and multi-counted** — a trade tagged `ORB, ABCD` contributes its
full P&L to both segments, so segment totals can exceed the account total. Conviction is a
single value.

### 4.4 `Max R Before Stop` (MFE, order-aware) — `market-data.ts:544-583`

Walks 1-minute bars from the entry minute to **16:00 ET**. On each bar after the first,
computes adverse excursion (`entry − low` long / `high − entry` short); if adverse ≥
`riskPerShare`, **stops the walk** (the stop would have been hit). Otherwise tracks max
favorable excursion. Returns `maxFavorable / riskPerShare`, plus `Farthest Price` (the
high/low at that point). The adverse check is skipped on the entry bar because intra-bar
ordering is unknown. Requires `R (Risk)` to be filled.

### 4.5 `MAE (R)` — `market-data.ts:592-616`

Same bar walk but over the **actual holding window** (entry → exit minute) and **without**
the stop-out break — it measures heat actually taken. Returns a negative R (or exactly `0`
if price never traded against entry). Entry bar's adverse check skipped, same rationale.

### 4.6 Prediction & Execution Skill funnel — `computeSkillMetrics` (`google-sheets.ts:1498-1568`)

The favorable excursion is measured **from the day's open**, not from entry — deliberately
entry-timing-independent:

```
excursion = Long ? (H − O) : (O − L)          // sheet columns H/L/O
```

| Metric | Formula | Denominator |
|---|---|---|
| **Intra-Day Prediction %** | share with `excursion ≥ 1.0 × 30mATR` | rows with O/H/L **and** numeric `30mATR` (`intradayReadN`) |
| **Daily Prediction %** (headline) | share with `excursion ≥ 0.8 × ADR` | rows with O/H/L **and** numeric `ADR` (`dailyReadN`) |
| **Daily Prediction, strong** | share with `excursion ≥ 1.0 × ADR` | same |
| **Execution Skill %** | among rows with `Max R Before Stop ≥ target`: `mean(min(P&L (R), target)) / target` | `executionN` |

Thresholds at `:1476-1478`. `ADR` (gap-free mean High−Low) is used rather than `ATR` (true
range) because the excursion is measured from the open and therefore excludes the overnight
gap — a documented, deliberate correction (`:1533-1538`). Blank and the literal `"N/A"`
both parse to null (`numCell`, `:1490-1496`), so young listings are excluded from the
denominators rather than counted as misses. `null` is returned when n = 0; every metric
surfaces its own n.

The capture target flows in from the client's `localStorage` `pct-capture-target`
(default 2.5) through `?target=` on `/api/trade-journal/stats`
(`app/api/trade-journal/stats/route.ts:13-14`,
`app/pct-bootcamp/trade-journal/page.tsx:330-334`).

### 4.7 Discipline % — `google-sheets.ts:1624-1636`

`Yes ÷ (Yes + No)` over `Process Followed?`; blanks excluded from the denominator;
`null` when nothing is labeled; `disciplineN` surfaced. Computed on already-filtered rows,
so it is filter-aware for free.

### 4.8 Target Capture / trail leak — `CaptureTracker.tsx:93-125`

Client-side over `/api/trade-journal/analysis`:

- `Target Capture %` = among trades whose MFE ≥ target, `mean(min(realizedR, target)) / target`
  (identical to Execution Skill % in §4.6, computed independently on the client)
- `R left on table` = `Σ max(0, target − realizedR)` over those same trades
- `MFE capture %` = `Σ realizedR(winners) ÷ Σ MFE(winners)` — a different, looser measure
- **Weekly trend** of Target Capture %, ISO-week (Monday-anchored) keys (`:26-32`)
- Per-trade realized-vs-MFE-vs-target bars

### 4.9 Trading Calendar — `getDailyCalendar` (`google-sheets.ts:2229-2351`) + `TradingCalendar.tsx`

Three units:

- **R (Standard)** = day's `$ P&L ÷ Full R target for that date` (`:2325`). Full R comes
  from `Calendar Config` by latest `Effective Date ≤ trade date` (`fullRForDate`,
  `:1953-1976`), with prefix matching from config Account → tab name. Because it divides by
  the *intended* full risk unit, a deliberately half-sized day scores ~half an R —
  conviction-aware by construction.
- **Realized R** = Σ `P&L (R)`, falling back to `P&L ÷ R` when the formula cell is empty
  (`:2288-2290`) — each trade against its own risk.
- **$**.

Per-day cell also carries `avgRisk`, `wins/losses`, a note dot (from `Notes` **or**
`EOD Screenshot`), a **size pill** = `avgRisk ÷ fullR` as a percentage
(`TradingCalendar.tsx:579-604`), and a full `tradeList` for the drill-down (sortable by 10
keys, with an entry/EOD screenshot lightbox matched on `date|symbol`).

### 4.10 Execution-gap bracket counterfactual — `TradingCalendar.tsx:72-118`

Per week (and per month) over trades having both `R` and `MFE`:

```
bracketR_per_trade = (maxRBeforeStop >= target) ? +target : −1
```

i.e. what a set-and-forget bracket — fixed −1R stop, fixed target, no management — would
have returned. Because MFE is order-aware (stops accruing at the stop), `MFE ≥ target`
means the target genuinely printed *before* the stop. Trades reaching neither by EOD are
counted −1R (deliberately pessimistic). Rendered in each week row as `B` (bracket) and
`Δ = actual − bracket` over exactly the covered trades, in whichever unit is selected
(`bracketValues`, `:114-119`; Standard-R variant divides by that day's Full R). A
month-level `Exec Gap` stat sits in the summary bar (`:395-401`). Green Δ = discretionary
management beat the machine.

### 4.11 Profitability simulation — `ProfitabilityAnalysis.tsx:58-125`

8 preset partial-scaling strategies plus a custom rule builder. For each trade,
`rPerShare = risk / shares`; for each partial rule in ascending R order, if
`maxRBeforeStop ≥ rMultiple` the simulated fill is taken at exactly that R; the residual
percentage exits at the **actual** exit price. Reports total P&L, avg trade, win rate,
profit factor, expectancy in R. Also computes an R-reach ladder (`% of trades whose MFE
reached 1R…6R`, `:126-138`), an 8-bucket realized-R distribution (`:140-163`), and edge
stats (expectancy R, avg win R, avg loss R, `:218-232`).

**Known optimism/pessimism in the simulation:** it assumes any touched R level fills
exactly, ignores queue/slippage, and assumes the residual behaves identically to the actual
trade despite the partials having changed the position.

### 4.12 Shared filter

One `applyRowFilter` (`google-sheets.ts:1347-1394`) + `parseStatsFilter` (`:1396-1415`)
serve stats, analysis, and calendar so all three cannot drift. Exact-match:
Process/Setup/Conviction/Side/Symbol. Substring: Catalyst/Tags. Date range: string
comparison on `Date` (works because dates are ISO). Calendar ignores the date range and
uses month navigation instead.

---

## 5. Market-data enrichment

Source: **Polygon.io aggregates** (1-minute and 1-day) plus **Polygon ticker details** for
float, plus **CBOE** for VIX. Entry point `enrichSymbol`
(`web/lib/trade-journal/market-data.ts:869-983`).

### 5.1 Fetch strategy

- **Intraday 1-min**: from `earliest trade − 28 calendar days` to `min(latest, yesterday ET)`.
  28 days (≈18–19 sessions) because `30mATR` needs 14 *prior* sessions of opening-range
  bars (`:887-893`). Same-day intraday is blocked on the Polygon free tier, hence the
  yesterday cap (`:881-885`).
- **Daily**: 250 calendar days back — margin for the 50-day SMA on sparsely traded tickers
  (`:895-899`).
- **SPY 1-min** over the same window, and **float** via ticker details, both fail-soft.
- Polygon caps a response at 50,000 rows, so `fetchPolygon` follows `next_url`
  (`:151-191`) — a fix for silently truncated recent dates. Retry/backoff at 5s/10s/20s/30s
  and HTML (CDN rate-limit page) detection at `:119-149`.
- Rate limit is **5 req/min**; each symbol burns ~5 requests, so the client sleeps
  **65 s between symbols** (`page.tsx:117`, `:196`, `:445`). ~5 symbols ≈ 5.5 minutes of a
  browser tab held open.

### 5.2 Field inventory

| Column | Meaning | Lookback / edge case |
|---|---|---|
| `#1m`, `#5m`, `#1H` | consecutive same-direction candles at/before entry | `countConsecutive` `:364`; 5m/1H aggregated from 1-min anchored at 9:30 (`aggregate`, `:332`) |
| `%Gap` | `(open − prior close) / prior close × 100` | needs 1 prior bar (`:377`) |
| `ATR` | daily ATR-14, **true range** (includes gaps) | mean TR over the 14 sessions *before* the trade date; needs ≥15 bars (`:385-399`) |
| `ADR` | mean daily `High − Low`, **gap-free** | same window/minimum (`:406-415`) |
| `30mATR` | mean of the 9:30–10:00 ET range over the prior 14 sessions | built from 1-min bars; precomputed once per symbol (`buildOpenRangeByDate` `:437`) after per-trade recomputation blew the edge CPU limit |
| `%ATR` | day's high−low up to entry ÷ ATR × 100 | `:463` |
| `RVOL` | cumulative volume to the entry minute ÷ mean of the same cutoff over all prior fetched days | `:482-509` — baseline is "all days in the intraday window", not a fixed 20 |
| `%VWAP` | `(avgEntry − session VWAP at entry) / VWAP × 100`, typical-price VWAP from 9:30 | `:472` |
| `OR High` / `OR Low` / `OR Size ($)` | **5-minute** opening range, 9:30–9:35 | `:513-535` (note: OR is 5m while `30mATR` uses 30m) |
| `OR %ATR` | OR size ÷ daily ATR × 100 | `:770-774` |
| `Breakout Vol Ratio` | volume of the first bar after 9:35 to break the OR ÷ mean OR-bar volume | null if never broke (`:620-645`) |
| `Prior Close Loc` | `(prevClose − prevLow) / (prevHigh − prevLow) × 100` | `:649` |
| `Dist 20/50 SMA (%)` | `(avgEntry − SMA) / SMA × 100`, SMA over the N sessions before the trade date | `:660-668` |
| `Avg $ Vol` | mean `close × volume` over the prior 20 sessions | `:672` |
| `Float` | Polygon ticker details `share_class_shares_outstanding`-family | fail-soft null (`:252`) |
| `SPY Dir` | SPY % change open→entry: `>+0.05% = Up`, `<−0.05% = Down`, else `Flat` | `:684-700` |
| `VIX` | CBOE daily close for the date | §5.3 |
| `PDC`/`PDH`/`PDL` | prior day close/high/low | `:810` |
| `O`/`H`/`L`/`C`/`V` | the trade date's raw daily candle | stored raw on purpose so future threshold changes need no re-backfill |
| `Max R Before Stop`, `Farthest Price`, `MAE (R)` | §4.4/§4.5 | require `R (Risk)` |

### 5.3 VIX

Polygon `I:VIX` requires an Indices plan; the current key returns `NOT_AUTHORIZED`
(verified). Fallback is CBOE's free daily history CSV
(`https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv`,
`market-data.ts:202`), parsed `MM/DD/YYYY → YYYY-MM-DD` and memoized per isolate. VIX is
per-*date*, so `backfillVixForTab` (`google-sheets.ts:2814-2871`) fills every blank VIX cell
in a single pass with zero per-symbol Polygon calls — and works even for delisted tickers
whose symbol enrichment fails.

### 5.4 The `N/A` convention

`naIfYoung` (`market-data.ts:725-730`): when a listing is "young" (first fetched daily bar
starts well after the requested window, with 21 days of slack for sparse tickers,
`:962-967`) **and** the trade date sits fewer than the required bars from the start, the
literal string `"N/A"` is written. This makes **blank mean "not enriched yet"** — the
invariant the backfill scanner relies on. Required lookbacks: 1 (gap, prior-close-loc,
PDC/PDH/PDL), 14 (30mATR), 15 (ATR, ADR, %ATR, OR %ATR), 20 (Dist 20 SMA, Avg $ Vol),
50 (Dist 50 SMA).

`updateEnrichment` (`google-sheets.ts:2703-2812`) **skips null fields entirely** — a re-run
never wipes a previously computed value. `"N/A"` is written through as a value.

### 5.5 Backfill scanner

`getTradesForBackfill` (`google-sheets.ts:1819-1895`) decides a row needs work if it is
missing basic enrichment (`OR Size ($)` blank), missing the daily candle (`O` blank),
missing `ADR`, or has `R` filled but is missing `Max R Before Stop` / `MAE (R)`. Rows whose
`Symbol` doesn't look like a ticker are skipped.

### 5.6 Screenshots (Google Drive)

`google-drive.ts`. Two folders (entry / EOD) listed with pagination
(`:68-101`), filenames parsed as `YYYY-MM-DD SYMBOL [EOD] …`
(`parseScreenshotFilename`, `:32-50`), indexed as `"date|SYMBOL" → {entry[], eod[]}`
(`:107-155`). Non-conforming filenames land in `unmatched`. Bytes are streamed through
`/api/trade-journal/screenshot-image?fileId=` so the Drive token never reaches the browser,
with a 24 h cache header (`screenshot-image/route.ts:19-25`).

---

## 6. UI surfaces

### 6.1 `/pct-bootcamp/trade-journal` — the main page (`page.tsx`, 941 lines)

- CSV drag-drop / file picker, trade-date picker defaulting to **the last weekday**
  (`:119-129`), optional sheet-name suffix.
- On upload: `TradePreview` (per-trade table + counts appended/skipped/total P&L) and a
  deep link into the Google Sheet at the right `gid`.
- **Auto-enrichment** after upload, symbol by symbol, with a live progress panel
  (total / completed / current / succeeded / failed).
- **"Backfill Market Data"** button: first a one-shot VIX per-date pass, then the paced
  per-symbol enrichment loop over every row the scanner flagged.
- **Tab picker** ("View Stats") listing every sheet tab except `Instructions`.
- **Shared filter bar**: Process Followed, start/end date (defaults to the 1st of the
  current month), Setup, Conviction, Side, Symbol, Catalyst, Tags — refetches stats and is
  passed down to Calendar / Capture Tracker / Profitability Analysis.
- Sections: `AggregateStats`, `TradingCalendar`, `CaptureTracker`, `ProfitabilityAnalysis`,
  `HowToUse`.

### 6.2 `AggregateStats.tsx`

Stat cards (P&L, win rate, profit factor, avg winner/loser, largest win/loss, streaks, avg
duration, avg daily P&L), a **Discipline** card, the three-card
**Prediction & Execution Skill** panel with per-metric denominators and hover explanations
(`:239-278`), and breakdown tables for hourly / granular-hourly / setup / conviction /
catalyst.

### 6.3 `TradingCalendar.tsx` (889 lines)

Month grid Mon–Fri, unit toggle (Standard R / Realized R / $), color-scaled cells, size
pill, note dot, week-total column carrying `B` and `Δ`, month summary bar with `Exec Gap`,
and a click-through **day drill-down**: sortable trade table (time, symbol, side, setup,
process, conviction, risk, P&L, realized R, standard R) plus an entry/EOD screenshot
gallery and lightbox.

### 6.4 `/pct-bootcamp/trade-journal/screenshots` — `ScreenshotReview.tsx` (1009 lines)

Trades joined to Drive screenshots on `date|symbol`. Filters: winners/losers, setup,
symbol, tag, "has screenshots only" (default on), date range, process, side. Sortable by
date / P&L / P&L (R) / symbol, paginated. Each card shows P&L, R multiple, risk, setup,
duration, notes, and an **MAE badge**; tags are editable inline against 11 presets or free
text and `PATCH`ed straight to the sheet. Full-screen lightbox.

### 6.5 `/pct-bootcamp/trade-journal/plan` — Morning Plan (`plan/page.tsx`, 613 lines)

Date picker, day-level psych check-in rendered once at the top — Energy 1-5, Tension 1-5,
Urge to trade fast? Yes/No, Sleep score 0-100, Readiness score 0-100, Sleep hours — each
with written anchor hints (`:486-520`). Then one card per symbol: symbol, conviction 1-3,
thesis, catalyst, L2 bias, and the three MTF rows (Daily / 1H / 5m, each direction +
conviction). QQQ and SPY are seeded on every load. Save upserts the whole date (replace-by-
date, dedup by uppercased symbol).

### 6.6 API surface (14 edge routes, all under `/api/trade-journal/`)

`upload` (POST), `enrich` (POST), `backfill` (GET), `backfill-vix` (POST), `stats` (GET),
`calendar` (GET), `analysis` (GET), `trades-for-review` (GET), `tags` (PATCH), `plan`
(GET/POST), `tabs` (GET), `screenshots` (GET), `screenshot-image` (GET),
`populate-instructions` (POST).

---

## 7. Honest weaknesses

**These are the reasons this is a personal tool, not a product.**

1. **No authentication of any kind.** There is no `middleware.ts`, no session, no API key
   on any journal route. Every endpoint above is publicly reachable on `tapereader.us`.
   Anyone who guesses a tab name can `GET /api/trade-journal/stats?tab=…` and read the
   owner's full P&L, or `PATCH /api/trade-journal/tags` to write into the sheet, or
   `POST /api/trade-journal/plan` to overwrite a day's plan. The 4-Week Challenge KV route
   has a `WRITE_KEY`; the journal has nothing.
2. **Single-tenant by construction.** One `GOOGLE_SPREADSHEET_ID` env var is the entire
   data layer. The production spreadsheet ID is even **hardcoded into the client bundle**
   (`app/pct-bootcamp/trade-journal/page.tsx:116`). "Multi-user" here means "multiple tabs
   in one person's spreadsheet".
3. **Google Sheets is the database.** Consequences: every read is a full-tab
   `A:CG` fetch (`READ_RANGE_END`, `google-sheets.ts:171`) and every analytic is an O(rows) scan in an edge isolate — no indexes, no
   incremental reads, no query. Writes are `values:batchUpdate` with **no transactions and
   no optimistic concurrency**; a human editing the sheet while an enrichment run is in
   flight can lose data. Sheets' 10 M-cell and per-minute API quotas are hard ceilings.
   Sharing a sheet with a second user gives them raw write access to every row.
4. **Manual CSV upload is the only ingest**, and the enrichment that follows requires
   **holding a browser tab open for 65 s per symbol** — a 10-symbol backfill is ~11 minutes
   of foreground work that dies if the tab closes. There is no queue, no cron, no resume;
   the only idempotence is the "blank means unenriched" convention.
5. **Rate-limited, single-key market data.** One Polygon free key at 5 req/min, shared by
   every request. Two concurrent users would rate-limit each other into failures. Polygon
   also blocks same-day intraday, so today's trades cannot be enriched until tomorrow.
6. **The manual columns are the analytics' fuel, and they are hand-typed in a spreadsheet.**
   `R (Risk)` gates `Stop`, `P&L (R)`, `1R-6R`, `Max R Before Stop`, `MAE (R)`, Target
   Capture, Execution Skill, the bracket counterfactual, and the whole Profitability
   simulation. `Process Followed?` gates Discipline %. There is no in-app editor for either
   — the workflow is "open Google Sheets and type".
7. **No mobile UI.** Dense tables, a 12-column calendar grid, and drag-drop upload; no
   responsive treatment, no PWA, no native app. The Morning Plan — the one thing genuinely
   wanted on a phone at 9:00 am — is a desktop form.
8. **No auth means no per-user config**, so the capture target, theme, and filter state live
   in `localStorage` and are per-browser, not per-account.
9. **Correctness gaps** already enumerated: position flips mis-grouped (§2), overnight holds
   recorded as $0 rows, gross P&L only (no fees/commissions), no split adjustment,
   naive CSV comma splitting, `# Partials` counting all fills, streaks computed in row order
   rather than chronological order, comma-split Setup/Catalyst double-counting P&L in
   breakdowns.
10. **Operational fragility:** `computeStats` and enrichment run inside Cloudflare edge
    isolates with hard CPU limits — two separate 503-causing hotspots have already been
    engineered around (`etCache` memoization at `market-data.ts:294`, `buildOpenRangeByDate`
    hoisting at `:431-436`). This gets worse linearly with row count.
11. **No tests.** There is no test file anywhere under `web/lib/trade-journal/`,
    `web/app/api/trade-journal/`, or `web/components/trade-journal/`, despite the grouper
    and the R-math being exactly the code you'd want pinned.
12. **Screenshot workflow is entirely out-of-band** — files must be dropped into a Drive
    folder with a hand-typed `YYYY-MM-DD SYMBOL` filename. No upload from the app, no paste,
    no auto-capture.

**What breaks the moment a second user shows up** — concretely: (a) they read and write the
first user's data, because there is no auth and one spreadsheet; (b) their trades land in
the same spreadsheet as a new account tab, visible to everyone with the link; (c) their
enrichment run competes for the same 5 req/min Polygon key and both fail; (d) their
screenshots go into the same two Drive folders, so a `date|symbol` collision cross-joins two
people's charts; (e) `Calendar Config`, `Daily Plan`, and the capture target are global, so
their Full R schedule and morning plan overwrite the first user's; (f) `upsertDailyPlan`
does clear-then-rewrite of the whole tab (`google-sheets.ts:2150-2193`), so two people
saving a plan the same morning will destroy each other's rows.

---

## 8. Genuinely distinctive things

Each described precisely enough to test against a vendor's feature list.

### 8.1 Prediction/Execution skill funnel measured from the open against two volatility yardsticks

Decomposes performance into three separately-improvable skills rather than one P&L number:
**did the move I predicted actually happen** (intraday scale), **did it happen at daily
scale**, and **did I convert it**. The technically unusual parts:
(a) the favorable excursion is measured **from the session open, not from the entry**, so it
scores the *thesis* independent of entry timing; (b) the intraday yardstick is a
purpose-built **`30mATR`** — the mean 9:30–10:00 ET range over the 14 prior sessions, built
from 1-minute bars, a pre-open no-lookahead snapshot; (c) the daily yardstick is
**gap-free ADR** (mean High−Low), explicitly chosen over true-range ATR because a
from-the-open excursion cannot capture the overnight gap, so a gap-inclusive denominator
would systematically understate the read on gap days.
*Check for:* any vendor that separates "was your directional read right" from "did you
capture it", or that publishes a volatility-normalized read-accuracy metric at all. Most
publish MFE/MAE and win rate; the funnel framing and the 30m/ADR normalization are the
distinctive claims. (`google-sheets.ts:1498-1568`, `market-data.ts:406-461`)

### 8.2 Biometric and psych state captured **pre-market** and stamped onto every trade of the day

Sleep score, readiness score, hours slept, energy 1-5, tension 1-5, and an explicit
"urge to trade fast?" flag, logged in a pre-open form and auto-written onto **every** trade
row of that date — including symbols that were never on the plan — via a date-keyed fill
(`DAY_FILL_COLS`, `google-sheets.ts:2030-2037`; applied `:2674-2683`). The design point is
that the state is recorded **before** the P&L is known, which removes the hindsight bias
that makes post-hoc mood tagging worthless.
*Check for:* vendors with wearable integrations (Whoop/Oura/Apple Health), or with any
pre-market state capture as opposed to a post-trade emotion tag. Post-trade emotion tagging
is common; pre-market, wearable-sourced, auto-joined to every trade is the specific claim.

### 8.3 Morning Plan → Origin classification + multi-timeframe read auto-fill

A pre-market watchlist (symbol, conviction 1-3, thesis, catalyst, L2 order-book bias, and a
direction+strength read for Daily / 1H / 5m) that does two things at upload:
(a) **derives `Origin` from plan presence** — on plan → `Watchlist`, off plan →
`Intraday discovery` — giving a clean *idea-source* axis deliberately kept orthogonal to the
*execution-discipline* axis (`Process Followed?`), so a "was this my own idea or did I chase
someone's callout" analysis is never contaminated by discipline; and (b) **back-fills nine
pre-market judgment columns onto the matching trades**, solving the real problem that
nobody can rate conviction and MTF trend at the moment of entry.
*Check for:* vendors with a pre-market planning surface at all, and specifically one whose
plan data auto-populates the executed trades. Watchlists exist everywhere; a plan that
writes conviction/catalyst/MTF onto the filled trade, and derives an idea-source taxonomy
from plan membership, is the specific claim. (`google-sheets.ts:1978-2020`, `:2645-2672`)

### 8.4 Execution-gap counterfactual: you vs. a set-and-forget bracket

For every trade with risk and MFE, computes what a dumb bracket (fixed −1R stop, fixed
target, zero management) would have made — `+target` if MFE reached the target, else −1R —
and reports `Δ = actual − bracket` **per calendar week** and per month, in R, Standard R, or
dollars. It answers "is my discretionary trade management adding or destroying value versus
doing nothing after entry?" The MFE is order-aware (it stops accruing once the stop level
trades), so `MFE ≥ target` genuinely means the target printed first — the counterfactual is
not the usual naive "highest price of the day" fantasy.
*Check for:* any vendor computing a no-management baseline as a per-period benchmark.
Vendors commonly show MFE/"missed profit"; framing it as an explicit counterfactual P&L you
are being scored against, weekly, is the specific claim. (`TradingCalendar.tsx:72-118`)

### 8.5 Conviction-aware "Standard R" calendar with a dated Full-R schedule

The calendar's default unit is `day $ P&L ÷ the Full R target in effect on that date`, where
Full R comes from a dated schedule (`Account | Effective Date | Full R($)`) applied by
latest effective date ≤ trade date. This does two things at once: a deliberately half-sized
day scores ~0.5R instead of looking like a bad day, **and** raising the risk unit over time
(e.g. $28 → $48) does not retroactively rescale history — a problem every R-based journal
has and most solve by either using a single global R or by using per-trade realized R only.
Both alternatives are also offered (Realized R, $), and a per-day **size pill**
(`avgRisk ÷ fullR`) shows sizing discipline at a glance.
*Check for:* vendors whose R normalization supports a time-varying account risk unit rather
than a single account-level setting. (`google-sheets.ts:1909-1976`, `:2325`)

### 8.6 Chart screenshots joined to trades on `date|symbol`, with entry/EOD as distinct classes

Two Drive folders (entry chart, end-of-day chart) auto-indexed by filename convention and
joined to trade rows, surfaced both as a dedicated review page (with inline retrospective
tagging written straight back to the store) and inside the calendar's day drill-down. The
entry-vs-EOD distinction is the interesting part: it supports "what did I see" versus "what
actually happened" review side by side.
*Check for:* vendors that support a separate end-of-day/outcome chart per trade as a
first-class artifact rather than one generic attachment list. (`google-drive.ts:32-155`,
`ScreenshotReview.tsx`)

### 8.7 Minor but unusual

- **MAE measured over the actual holding window** (entry → exit), not to the stop and not to
  EOD — so it reports heat *actually taken while in the trade*, with the entry bar's adverse
  check skipped because intra-bar ordering is unknown (`market-data.ts:592-616`).
- **`"N/A"` vs blank as a first-class distinction** for young listings, which makes
  read-accuracy denominators honest (young tickers are excluded, not counted as misses)
  and makes backfill idempotent (`market-data.ts:725-730`, `google-sheets.ts:1490-1496`).
- **12-block granular time-of-day analysis** starting at 9:30–9:35 / 9:35–9:45 / 9:45–10:00
  — finer than the usual hourly bucket, aimed specifically at open-drive traders
  (`google-sheets.ts:1424-1437`).
- **Discipline % with blanks excluded from the denominator** and its `n` surfaced, rather
  than treating unlabeled trades as failures (`google-sheets.ts:1624-1636`).

---

# Part B — Gap analysis vs. the market (filled in after vendor research completes)

> **Placeholder.** To be written by the orchestrator once `01-landscape.md`,
> `02-feature-matrix.md`, and the `vendors/*.md` files exist. Expected contents:
>
> - **B.1 Table stakes we lack** — import breadth, auto-sync, fees/commissions, options and
>   futures, mobile, sharing/accountability, reports.
> - **B.2 Parity features we have** — calendar, R multiples, MFE/MAE, tagging, setup and
>   time-of-day breakdowns, screenshot review.
> - **B.3 Features we have that the category lacks** — validate §8 against the matrix,
>   keeping only what survives vendor evidence.
> - **B.4 Verdict per persona** — market researcher / product manager / engineer, per §2 of
>   `00-method.md`, flagging where they disagree.
