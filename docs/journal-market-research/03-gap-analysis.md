# Gap Analysis — TapeReader Auto Trade Journal vs. the market

**Status:** Part A complete (internal audit, 2026-09-01) · **Part B complete (2026-09-01)**
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

# Part B — Gap analysis vs. the market

**Written 2026-09-01**, after `01-landscape.md`, `02-feature-matrix.md`, the seven vendor
files and the six thematic files were complete. Part A is a code audit and stands
unchanged; Part B joins it to the market evidence.

**Two things constrain everything below, and they are not optional framing.**

1. **`vendors/_theme-red-team.md` FALSIFIED the claim that our enrichment substrate is a
   scarce asset** (Claim 3). Order-aware MFE, MAE, ADR, 30mATR and the bracket
   counterfactual are commodity: NinjaTrader gives MFE/MAE away free `[R]`, a frozen
   two-person Chartlog gives MFE/MAE + full R/R away unpaywalled at $14.99 `[V]`, and
   TradesViz ships the whole family at **higher resolution** (5-second for futures and
   S&P 500 names) **with two-proportion z-test gating we do not have**, at ~$20–27/mo
   `[V]`. Our entire enrichment module is 983 lines `[V]`. Nothing in Part B may be
   written as though that substrate is a lead.
2. **`_theme-red-team.md` Claim 4 is UNRESOLVED, leaning against**: no public evidence
   anywhere shows *any* trader sustaining a per-symbol multi-timeframe pre-market
   forecast log, and a strictly lighter input (per-trade conviction) was already abandoned
   by this project's own trader for open-pace friction `[V]`. Every lead in §B.2 that
   depends on the Morning Plan being filled inherits that risk. The day-level bounded
   psych check-in (Energy/Tension/Urge/sleep) is the half the red team rates SURVIVES.

Confidence tags follow `00-method.md`. Row numbers refer to `02-feature-matrix.md`.

---

## B.1 Where we stand against table stakes

**34 features classed table stakes score TR at ○ or ◐ — 20 absent, 14 partial**
(`02-feature-matrix.md`, "Table stakes we lack"). The useful move is not to list them
again but to split them by *who is harmed*, because that split decides whether an item
belongs in `06-dogfood-backlog.md` or only in `05-build-plan.md`.

### (a) Genuine product gaps — real capability we do not have, and would use ourselves

| # | Feature | Status | What its absence costs *us* |
|---|---|---|---|
| 4.1 / 4.2 | Trade-annotated price chart | ○ / ◐ | **The single largest hole.** Universal across all seven vendors, and none of them built it — TradingView's library renders four of them `[V]`. We *fetch* 1-minute bars for every trade and render none of them. Its absence is what forces the entire out-of-band Drive screenshot ritual (§5.6, §6.4). |
| 5.2 | Daily/session journal as an object | ○ | We have a pre-market plan and **no closing ritual of any kind**. The review loop where a journal's value is actually realised does not exist for us. Edgewonk's Sessions (report cards, reflection prompts, lesson tracking) is the reference `[V]`. |
| 5.4 / 5.5 | Reflection templates · rich media in notes | ○ / ○ | Cheap, universal, and the documented fix for the blank-page problem that stops people journaling. Our Notes column is a plain spreadsheet cell. |
| 3.8 / 8.3 | Drawdown | ◐ / ○ | We have **no drawdown of any kind**, and streaks are walked in sheet row order rather than date order (§4.1). "How long do my bad stretches last" is the question that actually causes people to quit `[V]` Tradervue. |
| 9.1 / 9.2 / 9.4 | Named setups with definitions · criteria checklists · per-setup performance | ◐ / ○ / ◐ | `Setup` is a six-option dropdown with no definition behind it. Chartlog's Rules & Rule Groups (market conditions / entry triggers / exit triggers) + Sample Sets with a published **N≥25** norm is the most coherent playbook in the segment `[V]`. |
| 3.5 / 5.3 | Tag analytics | ◐ / ◐ | We have tags and **no tag report** — tags are filter-only. Tradervue ships tag *combinations* `[V]`. |
| 3.6 | Day-of-week and hold-duration breakdowns | ◐ | Our 12-block granular time-of-day grid starting 9:30–9:35 is finer than anyone's, and we have neither of the two breakdowns every vendor ships. |
| 12.1 | Periodic review artifact | ◐ | The calendar is a periodic *surface* with no review *artifact* — nothing to write, finish, or look back at. |
| 4.5 | Screenshot upload from the app | ◐ | Files must be dropped into Drive with a hand-typed `YYYY-MM-DD SYMBOL` filename. Edgewonk's Chartbook does clipboard paste + auto-compression + TradingView import, indexed across trades, plans **and missed trades** `[V]`. |
| 1.9 | Historical backfill | ◐ | The date comes from a form field, so **one upload = one trading day**. Any multi-day export stamps every trade with the same date. |
| 6.2 | Rule adherence | ◐ | One self-graded Yes/No bit per trade, no lock, no per-rule attribution. Six of seven vendors ship something richer. TradeZella's **"Finish My Day"** — which locks the day's rule checkboxes so compliance cannot be backfilled — is the highest behavioural-integrity-per-line-of-code idea in the study `[V]`. |
| 1.1 | Manual trade entry | ○ | If DAS didn't export it, it isn't in the journal. Blocks paper/sim reps, blocks reconstructing a missing day. |
| 11.1 / 11.2 | LLM stat summary · conversational query | ○ / ○ | Universal among live vendors as of 2026. Worth noting the counter-evidence: **Tradervue — 200k signups, 15 years — has shipped zero AI of any kind** `[V]`, and we cannot tell whether that is disruption risk or evidence the feature does not drive retention. |

### (b) Defects — wrong numbers, not missing features. Fix regardless of any strategy.

A gap costs you a sale; **a defect costs you the numbers**, and "the numbers are wrong and
stay wrong" is the #1 churn driver in `vendors/tradersync.md`. These are the items where
the journal is currently lying to its only user.

| Defect | Where | Consequence |
|---|---|---|
| **No authentication on any route** (13.5) | §7.1 — no `middleware.ts`, no session, no API key on any of 14 edge routes | Every endpoint is publicly reachable on `tapereader.us`. A guessed tab name reads full P&L; `PATCH /tags` and `POST /plan` **write**. The production spreadsheet ID is hardcoded into the client bundle. This is not "pre-product"; it is a live exposure today. |
| **Position flips mis-grouped** (2.1) | `trade-grouper.ts:76-100` | A fill crossing through zero is treated as a single exit; position lands negative and the *next* fill is appended to a still-open trade. Silently wrong P&L, silently wrong direction. |
| **Comma-split Setup/Catalyst double-counting** (9.4) | `google-sheets.ts:1665-1706` | A trade tagged `ORB, ABCD` contributes its **full** P&L to both segments, so segment totals can exceed the account total. Every setup conclusion drawn from this is inflated. |
| **Gross-only P&L** (2.7) | No commissions, fees, ECN rebates, borrow or slippage anywhere in the pipeline | **This quietly invalidates every dollar figure we compute** — including Standard R, the calendar, the bracket counterfactual and the whole profitability simulation — and makes 12.6 moot. Tradervue treats exchange fees and **ECN fee/rebate sign** as first-class, which is what makes its liquidity reports possible `[V]`. DAS exports carry the fee column; we discard it. |
| **No tests** (§7.11) | Nothing under `web/lib/trade-journal/`, `web/app/api/trade-journal/`, `web/components/trade-journal/` | The grouper and the R math are exactly the code you would want pinned. `_theme-data-integration.md` §6.4 names golden-file tests against real broker exports as the single highest-value engineering investment in the entire build plan `[I]`. |
| **Corporate actions unhandled** (1.10) | Polygon adjusted bars fetched against raw fills | A split inside the 250-day enrichment lookback silently distorts ATR / ADR / SMA. Nobody markets this; everybody needs it. |
| **Overnight holds recorded as $0 rows** (2.4) | `trade-grouper.ts:103-108` | An unclosed position is finalized anyway with `avgExit = $0.00` and `pnl = 0`. Note this is the *same architectural choice* TraderSync made, and **its own paying users call the missing unrealized P&L a deal-breaker** `[V]`. |
| Naive `line.split(",")` (1.2) · `# Partials` = all fills · streaks in row order | `csv-parser.ts:48`, `trade-grouper.ts:171`, `google-sheets.ts:1645-1652` | Individually small, collectively the reason no number here can be quoted without checking. |

**Four have outsized leverage**, because everything in their section depends on them:
**2.7 fees** (every dollar figure), **4.1 the chart** (the whole review ritual),
**5.2 a daily journal object** (the whole review *loop*), and **13.5 auth** (without it
there is no per-user anything, which is why capture target, theme and filters all live in
`localStorage`).

### (c) Only matters if a second user ever exists

These are the ones that disqualify us as a *product* and cost us nothing as a *tool*.
Everything here belongs to `05-build-plan.md`, not to the dogfood backlog.

| # | Feature | Why it is inert for us |
|---|---|---|
| 1.3 | Breadth of file-format support (○) | We trade on DAS. Verified competitor parser counts: TS 495 · TVz ~250 · EW ~100+ · TM 194 · TV 83 · TZ ~50 · CL 21 `[V]`. Irrelevant to a user with one broker; `_theme-data-integration.md` §6.5 says we cannot out-accumulate "seven years of broker-format drift" anyway `[V]`. |
| 1.4 | True auto broker sync (○) | The most inflated row in the matrix — real auto-sync is TS 73 · TVz ~70 · TM 21 · TZ ~13 · TV **5** `[V]`. And **there is no DAS journal API at any price a retail trader would pay** — DAS's own API is $100–1,500/mo per trader and certification-gated `[V]`. Our CSV upload is not a stopgap; it is the route. |
| 1.8 / 2.6 | Options, futures, forex, crypto · contract multipliers (○) | We trade US equities. Worth flagging the counter-risk: Chartlog's documented churn story is traders **outgrowing the asset scope** `[R]`, and the red team rates "equity-only reproduces Chartlog's churn mode" as unverified with the one datapoint against us. |
| 1.6 / 2.9 | Multi-account aggregation · account-level layer (◐) | One tab per account is adequate for one person with one active account (`U16632046-GURI`). |
| 12.2 / 12.3 / 12.4 | Shareable links · mentor access · team dashboards (○) | No audience. Note 12.2 is currently *worse* than absent: every route is unauthenticated, so exposure is accidental rather than designed. |
| 13.3 | Speed with large histories (○) | We read the full tab `A:CG` and scan O(rows) in an edge isolate with a hard CPU limit; two 503-causing hotspots have already been engineered around. This degrades linearly and will bite *us* eventually — but at one trader's row count it is years away, not weeks. |
| 13.1 | Mobile (○) | **Half-inert.** As a product it is a named churn reason for four of seven vendors and the category bar is on the floor (best in class: a 2.9★ Play app, a 2.7★ iOS app, a PWA) `[V]`. As a *tool*, exactly one surface is wanted on a phone: the Morning Plan at 9:00 am, which is currently a desktop form. |

---

## B.2 Where we are ahead — stated conservatively

Rigorously, from `02-feature-matrix.md`: **five features where TR scores ● and no vendor
does**, plus two contested. Each is stated with how long the lead survives a funded
competitor deciding it matters. The honest summary is that **none of these is a moat, and
four of the five are gated on a behaviour we have not measured.**

| # | Lead | Best vendor | Durability — stated plainly |
|---|---|---|---|
| **6.5** | Physiological inputs typed (Sleep Score, Readiness, hours slept, Energy, Tension, Urge-to-Trade-Fast) | TVz ◐ | **Weeks, and a precedent already exists.** TradesViz's *own published worked example* for Day Plans is **Sleep Score / Stress / Mood / Major Life Event**, auto-applied to every trade opened that day `[V]` — architecturally identical to our `DAY_FILL_COLS`. The red team notes this **falsifies** the separate claim that sleep/readiness has no precedent in the category. Our lead is that ours is *typed and shipped* where theirs is *user-constructed*. That is an onboarding advantage, not a capability one. |
| **6.4** | Pre-market conviction 1–3 per planned symbol, back-filled onto the executed trade | TZ/TS/EW/TVz all ◐ | **One join and one accuracy statistic away for three competitors.** All of TradeZella (SR-03 scores the session against the morning plan, flags broken rules with timestamps), Edgewonk (Trading Plans promote-on-fill) and TradesViz (Trade/Day Plans + Plan Analysis) already hold the pre-commitment container `[V]`. Conviction is the field they left out. Assume **~2 quarters of lead, not a moat** (`_theme-red-team.md` "What would have to be true" item 4). |
| **7.3** | Multi-timeframe bias recorded pre-open (Daily/1H/5m × trend + conviction) | TVz ◐ | **Genuinely unshipped anywhere** — TradeZella's "HTF bias" is a chart *indicator*, not a recorded judgment `[V]`. But this is the single field most exposed to Claim 4: six structured fields *per symbol*, authored in the 20 minutes before the open. For a 5-name watchlist that is ~40 fields plus 5 free-text theses at the highest-friction minute of the day. **Unresolved whether anyone including us sustains it.** |
| **7.5** | Idea-origin classification (`Watchlist`/`Callout`/`Intraday discovery`, auto-derived, orthogonal to `Process Followed?`) | EW/TVz ◐ | **Cheap to copy, and its value is asserted rather than evidenced.** It is derived from a join we already do, so a competitor with a plan object gets it for a day's work. The matrix records the honest caveat: no market demand for it appears anywhere in the study. |
| **8.6** | Risk-unit schedule over time (dated Full-R, applied by latest effective date ≤ trade date) | all ○ | **The most durable of the five, and the narrowest.** Nobody has it; Tradervue's file names the exact gap — "risk is a static scalar per trade with no history" `[V]`. It is a real correctness win for any R-native trader whose account grows ($28 → $48 does not retroactively rescale history), and it is perhaps 200 lines. Nobody will copy it because nobody has noticed it. |

**Contested — real, but we are not alone.**

- **10.3 fixed-bracket counterfactual.** Edgewonk ships the construct (actual R vs.
  passive set-and-forget R, with an explicit "R lost/gained by managing" line) but drives
  it from a **hand-ticked `OTP Hit` boolean** `[V]`. Ours is derived from order-aware
  1-minute bars, so it can express degree rather than a bit, and it is reported per
  calendar week. **We have the better method on a construct that already exists.**
- **10.2 partial-taking simulation.** TraderSync's Rolling Exit Analytics covers the same
  ground from the other direction `[V]`. Ours is honest about its own optimism (any
  touched R level is assumed to fill exactly; the residual is assumed to behave as the
  actual trade did) — which is a documentation virtue, not a lead.

**Three things people will want to put on this list that do not belong on it.**

1. **The Prediction & Execution funnel.** It has no counterpart anywhere in the study,
   and it is an *instance* of row 3.13 (benchmarking vs. market conditions), not a row of
   its own — and **3.13 is a row where Tradervue and TradesViz both beat us on breadth**.
   It is the only one of 33 enrichment fields that reaches a report.
2. **Order-aware MFE.** A better *method* on a row where five vendors also score ●, and
   `_theme-red-team.md` §3A shows the resolution race is already lost (TradesViz computes
   MFE/MAE at 5-second granularity for futures and S&P 500 names `[V]`).
3. **Screenshot auto-matching (4.6).** We score ● only because every vendor solved the
   problem by *rendering charts instead* — Chartlog states the category position outright:
   "Forget about screenshots" `[V]`. Our `date|symbol` join is a workaround for lacking
   4.1, not an advantage. The one part that survives the critique is treating **entry and
   EOD charts as distinct classes** — "what I saw" vs. "what actually happened" — which
   no chart renderer produces.

**And two things that are advantages but are not features**, per `_theme-red-team.md` §3B:
**same-session cadence** (we enrich the evening of the trade; TradesViz runs a 24-hour
sync with ~16-hour delay on same-day extended-hours data and "cannot credibly serve any
intraday or same-session review use case" `[V]`), and **the user owns the store** (the
Google Sheet is the trader's own file — maximal portability, arrived at by accident of
architecture).

---

## B.3 Where we are behind in ways that matter to us as a USER

This is the section that feeds `06-dogfood-backlog.md`. The filter applied here is
strictly *"would this have improved our own trading over the last six months?"* —
commercial value is deliberately ignored. Everything below is computable from data we
already store or already fetch.

### B.3.1 Tradervue's Exit Analysis is better-formed than our Capture Tracker

Tradervue explicitly **rejects** naive max-theoretical-P&L — "rarely actionable… for
non-trivial trades with more than one exit" `[V]` — and instead:

1. identifies the **last exit group** (final exit-side execution plus fills within a few
   seconds of it);
2. **floats that group** to maximum P&L, bounded by a **time window** (no earlier than the
   immediately prior execution, no later than session close) **and a risk window** (may not
   exceed the larger of actual Position MAE or the user's stated Initial Risk);
3. outputs **Best Exit P&L** and **Efficiency**, usable as a stat, a column, and a report axis.

**Why this beats ours.** Our Target Capture % uses a *fixed* R target (default 2.5) and a
pessimistic bracket assumption, so it answers "did you capture the target you nominated".
Tradervue's holds **the entry and the risk actually taken constant and varies only the
exit** — which is precisely the decision under the trader's control, and it needs no
nominated target at all. It is a constrained search over intraday bars, O(bars in window)
per trade, trivially cacheable, and it degrades gracefully when Initial Risk is missing
(falls back to Position MAE). **It is directly implementable on the existing order-aware
1-minute walker in `market-data.ts`.** `[I]`

Adjacent, from the same file: Tradervue splits **Position** MFE/MAE from **Price** MFE/MAE
— isolating the market call from the sizing decision — and **nobody else does** `[V]`.

### B.3.2 The eleven Market Behavior reports — the sharpest self-indictment in the study

Tradervue's Market Behavior group conditions P&L on: symbol · instrument volume ·
**relative volume vs. 50-day MA** · prior-day relative volume · instrument movement ·
**opening gap** · **day type** · **ATR(14)** · **entry % of ATR(14)** · relative volatility
(TR/ATR) · **entry price vs. SMA** `[V]`.

**We store every single input either Tradervue or TradesViz uses** — `%Gap`, `RVOL`, `ATR`,
`ADR`, `30mATR`, `%ATR`, `Dist 20/50 SMA (%)`, `Float`, `Avg $ Vol`, `SPY Dir`, `VIX`,
`PDC/PDH/PDL`, `O/H/L/C/V` — **and have a breakdown surface for none of them.** Thirty-three
enrichment columns; exactly one (the Prediction funnel) reaches a report. That is the
highest ratio of insight to new code anywhere in this research (`vendors/tradervue.md`
rates it M effort).

Two cheap additions ride along:

- **Day Type classifier** — inside range / trend up / trend down / outside range, with
  Tradervue's published definition (*Trend Up Day* = closes above yesterday's high, opens
  in the bottom 15% of the day's range, closes in the top 15%) `[V]`. One derived column
  from daily OHLC we already store; turns "I don't trade well on chop days" from a feeling
  into a filter.
- **Liquidity add/remove from ECN fee sign** `[V]` — the objective, un-self-reportable
  measure of chasing. **DAS exports carry the fee column and we discard it.** Entry-liquidity%
  vs. exit-liquidity% is the honest version of our hand-applied `chased` tag.

### B.3.3 Edgewonk's pre-rated behaviour tags, and Missed Trades

**The mechanism that matters.** Edgewonk's trade-comment library is a set of behaviour
statements whose **moral valence (positive/negative) is pre-assigned by the trader while
calm**, bucketed by trade stage; at journaling time the trader only *selects*. `[V]`

> This decouples the judgement from the emotional state it is trying to measure — the
> single hardest problem in self-reported psychology data. It is also why a comment can
> attach to a *winning* trade and still be negative, which is what makes rule-adherence
> measurable independently of P&L.

Everything downstream is a projection of that one table: **Efficiency %** (positive ÷ total
comments — note the denominator is comments, not trades), the **Tiltmeter** (a rolling,
recency-weighted discipline score overlaid on the equity curve, the calendar *and* the
trade table — formula undisclosed), **Mistake Impact Analysis by category**, and
**Edge Leak / True System Edge**, which express indiscipline **in dollars rather than
percent** `[V]`.

Against that, our Discipline % is honest (blanks excluded, `n` surfaced, filter-aware) and
**is a single aggregate with no time series, so it cannot show escalation** — which is the
only thing tilt data is for.

**Missed Trades.** Exactly **one implementation in the entire study** (row 7.7). Edgewonk's
Trading Plans promote into the journal on fill and **demote into Missed Trades if not**,
with reason tagging and its own analytics; the vendor frames them as evidence of
"hesitation, weak routines, and confidence issues" — i.e. measuring *failure to act*, which
P&L data structurally cannot see `[V]`. **We already compute the unmatched plan rows at
upload and throw them away** (`appendTrades`, `google-sheets.ts:2657-2662`). This is the
cheapest unclaimed ground in the matrix for anyone who already has a plan object, and we
are that anyone.

Also worth copying, and nearly free: Edgewonk's **Chartbook** indexes screenshots from
executed trades, **Missed Trades and Trading Plans** `[V]`; our Screenshot Review covers
executed trades only.

### B.3.4 TradesViz's z-test-gated deterministic detectors

`_theme-ai-review.md` and `vendors/tradesviz.md` call this the most directly stealable
artifact in the whole research pass, and it is fully published `[V]`: **16 deterministic
detectors** (18 on Platinum), **not an LLM**, ranked by dollar impact, minimum sample
**n≥10**, capped at **four cards**, with a diversity pass across eight groups, and
**every win-rate comparison gated by a two-proportion z-test** against the pooled baseline
(High p<0.05 / Medium p<0.10 / Low chips). Suppression is scoped to the *variant*
("Weak Trading Day: Tuesday" doesn't hide Thursday) and **auto-expires after 30 days** if
the pattern stops firing. Ranking is published verbatim:
`score = abs(pnl_impact) × confidence_weight × detector_weight × (1 + helpful_boost) × trend_multiplier`.

The detector list, with what we can compute **today** from data already in the sheet:

| Detector | Computable now? |
|---|---|
| Losers Took Extra Heat (adverse excursion past planned invalidation) | **Yes** — `MAE (R)` |
| Losses Beyond Planned Stop (realized loss ≥ 125% of planned) | **Yes** — `P&L (R)` vs `R (Risk)` |
| Winners Need More Room (closed well before best available exit) | **Yes** — `Max R Before Stop` vs `P&L (R)` |
| EOD Exit Would Have Helped (simulate flat-by-X) | **Yes** — 1-min bars already fetched |
| MAE Bigger Than MFE · Risk/Reward Leak | **Yes** |
| Revenge Trading (opened within 30 min of a losing close, same account) | **Yes** — entry/exit times are on the row |
| Size Increases After Losses (post-loss size ≥ 1.25× post-win size, and that bucket is negative) | **Yes** — `Shares`, `R (Risk)` |
| Cold-Start Trades Underperform (>24 h since last close) | **Yes** |
| Weak Time Window · Weak Trading Day · Worst Day × Hour cell | **Yes** — needs the day-of-week breakdown we lack (3.6) |
| Loss Is Concentrated (≥30% of red ink from one ticker) | **Yes** |
| High-News Days Underperform (tier-3 economic-calendar events) | No — needs an economic calendar |

**Eleven of sixteen are arithmetic over columns we already have.** The part we should copy
even more than the detectors is **the z-test gate** — row 3.11 records that we surface
honest denominators and run **no significance test at all**, which for a discretionary
trader with 124 trades is exactly the failure mode that matters.

### B.3.5 Chartlog's rules engine and the N≥25 sample norm

Chartlog models **Strategies as first-class objects**, each carrying an explicit checklist
split into **market conditions** ("mid-cap", "RVOL +20%", "has news"), **entry triggers**
("only enter if B is above VWAP") and **exit triggers** ("exit at 2R"), plus **Sample Sets**
— a named, counted batch of trades taken under one rule set, with the published teaching
that you need **≥25 instances before drawing conclusions** `[V]`. The framing is literally
the scientific method: hypothesis → experiment → collect → analyse → conclude.

Two things this fixes for us. First, it **upgrades `Process Followed? Y/N` from one binary
into "which specific rule broke"** — and Edgewonk goes one step further by measuring *which
individual rules actually generate profit* `[V]`. Second, the N≥25 norm is the missing
rigor layer above our `Setup` dropdown, and it is the discipline that stops us drawing
conclusions from six trades. Chartlog teaches the norm without computing it; pairing it
with §B.3.4's z-test is strictly better than either.

Also from Chartlog, cheap and useful to us: **"losers always count as −1.00R"** as a stated
convention — independently arrived at, and identical to the pessimistic assumption our
bracket counterfactual and Profitability Analysis already use. Worth saying out loud in
our own UI.

### B.3.6 The rest of the dogfood-relevant deficit, briefly

- **Statistical-significance block** — SQN, K-Ratio, Kelly %, P&L standard deviation and a
  **p-value on your edge**. Tradervue is the only retail journal that will tell you your
  results are noise `[V]`. Pure arithmetic on data we hold. Row 3.11: we score ◐.
- **Drawdown over *completed* drawdown periods** — average drawdown, average days in
  drawdown, biggest, average trades in drawdown `[V]`. We have none of it.
- **Weekly/monthly retro object** — Chartlog's day/week/month grouped journal with a
  description per grouping, and Edgewonk's Sessions report cards. **The weekly retro is
  where our execution-gap `Δ` number would actually get acted on**, and there is nowhere
  for it to be acted on today.
- **Correlating our psych inputs with performance (row 6.6).** TradesViz is the only ●,
  and only because *any* Day Plan field becomes a pivot dimension `[V]`. The matrix's own
  verdict: **"TR collects the richest psych inputs in the category and joins none of them
  to outcomes."** Win rate and expectancy by sleep bucket / energy bucket / urge-flag is a
  `GROUP BY` over columns already on every row.
- **Mark-as-reviewed** — a review *workflow* state separate from the data `[V]` Chartlog.
  Cheap, and it makes the daily ritual finishable.
- **Charts (large/small) list view** — Tradervue renders a filtered trade set as a wall of
  auto-charts, auto-picking the finest timeframe containing the whole trade `[V]`. Cheap,
  highly rated, and it pairs directly with our existing filter bar and Screenshot Review.
- **TradeZella's day-lock ("Finish My Day")** — locks the day's rule checkboxes so
  compliance cannot be backfilled `[V]`. The single highest behavioural-integrity return
  per line of code in the study.

---

## B.4 The two category blind spots — and whether we actually exploit them

`02-feature-matrix.md` identifies eight cross-cutting patterns. Two are structural
openings rather than observations. The honest assessment of both is the same: **we hold
the prerequisite and we do not use it.**

### B.4.1 Everyone competes on the exit; nobody competes on the entry

Row 3.10 has **five vendors with real, differently-architected exit-quality
implementations** — TraderSync's file calls it the question "that actually separates
profitable discretionary traders" — and **entry-quality decomposition is absent from all
eight columns**, ours included.

The cause is structural, and Tradervue's file states it plainly: *the entire schema starts
at "a fill happened"*, and adding planning "is not a feature, it is a second data model
plus a second UI surface" `[V]`. Exit quality is computable from bars with no additional
input; entry quality requires knowing what you **intended**, and §7 of the matrix shows
nobody has an intent object. The broker-native survey found the identical gap from the
other side: **brokers begin at the order ticket** `[V]`.

**Do we exploit it? We hold the prerequisite and produce nothing from it.** `[I]`

*What we have that they don't:* a real intent object. `Daily Plan` carries per-symbol
conviction, thesis, a controlled catalyst taxonomy, L2 bias and six MTF fields, authored
pre-open and back-filled onto the executed trade through one shared header map
(`PLAN_FILL_COLS`), with `Origin` derived from plan membership and deliberately kept
orthogonal to `Process Followed?`. That is the second data model the category does not
have.

*What we produce from it:* **`Origin` as a filter value, and nothing else.** Row 7.4
scores us ◐ with the note "derives `Origin` from plan membership but produces **no
reconciliation report**." There is no plan-fill rate, no forecast accuracy by conviction
bucket, no missed-trade object, no entry-efficiency metric of any kind.

*And the funnel does not count.* The Prediction & Execution funnel measures excursion
**from the session open, deliberately entry-timing-independent** (§8.1) — by construction
it grades the **thesis**, not the entry. It is the right metric for a different question.

*Two honest caveats before anyone builds on this.* (i) `_theme-red-team.md` Claim 2:
the pre-commitment *container* is already shipped by three competitors, the grading
*mechanism* is industrialised elsewhere (TipRanks; Pikkit's automatic closing-line value
in free sports-betting apps; Sinux scoring Discord analysts' calls), and the manual
practice is taught in the ICT/SMC community with a free TradingView script attached.
**This is an unported mechanism, not an invention** — worth building, worth roughly zero
as a moat. (ii) `_theme-red-team.md` Claim 4: whether the input survives contact with the
9:10 am clock is **unresolved and leaning against**, and the decisive test costs nothing —
**plot our own plan-fill rate (distinct dates with a `Daily Plan` row ÷ distinct trading
dates, weekly since 2026-06-23, plus per-field fill rate) before building anything on top
of it.**

### B.4.2 Psychology is the most-marketed and least-built section in the matrix

Every vendor sells discipline in its headline copy. What they ship is one of three things:
free-text emotion tags (TV, TS, CL, TM), a schema the user must invent (EW's Custom
Statistics, TVz's Day Plans), or LLM tone-reading (TZ's Sentiment Agent). Rows 6.3, 6.5
and 6.6 are near-empty. The cause is that self-reported psych data **collapses exactly when
it matters** — reviewers say Edgewonk's tracking "requires self-honesty" and struggles when
the trader is stressed `[R]`.

Only two structural fixes exist anywhere in the study, and both work by **removing the
judgment from the moment of judgment**:

1. **Edgewonk's** — pre-commit the valence of each behaviour while calm, then only
   *select* at journaling time.
2. **Ours** — pull the number off an instrument (sleep score, readiness, hours slept)
   **before the P&L is known**.

**Do we exploit it? We own half the fix and none of the payoff.** `[I]`

- We ship the **richest typed psych schema in the category** (6.5 ●, 6.4 ●), and it is
  authored pre-open, which is the unloaded moment — `_theme-voice-of-customer.md` §1.2(d)
  shows journal-avoidance bites hardest *after* losses, so front-loading is the right call.
- We ship **row 6.6 as ○**. Nothing joins any of it to money. The matrix's verdict is
  blunt: *"collecting psych inputs is not the hard part; nobody has made them pay."*
- We do **not** have Edgewonk's half — a pre-rated behaviour vocabulary. Our
  `Process Followed?` is a single self-graded bit written after the outcome is known,
  which is precisely the design the structural fix exists to avoid.
- We have **no time series** on discipline (6.7 ◐), so escalation — the only thing tilt
  data is for — is invisible to us.
- And the leverage argument is genuinely in our favour, which is why this is worth doing:
  one plan entry auto-fills `PLAN_FILL_COLS` + `DAY_FILL_COLS` onto **every trade of that
  date** and sets `Origin`. Most abandoned journaling inputs are per-trade and scale with
  trade count; ours is per-day and scales with nothing `[I]`.

**A caution the evidence forces.** Across hundreds of reviews of six vendors,
`_theme-voice-of-customer.md` §6.3 found **not one user praising a mood/emotion field**;
praise attaches to checklists, custom statistics and rule adherence. The surviving pattern
is *bounded, scored* inputs — the one documented survivor sustained **12 criteria scored
1–5 per session for 41 sessions** `[R]`. Our day-level block (Energy 1–5, Tension 1–5,
Urge Yes/No, sleep hours) is near-verbatim that shape and the red team rates it
**SURVIVES**. Our per-symbol MTF block is not, and the red team rates it **UNRESOLVED,
leaning against**. Build the join for the half that survives first.

---

## B.5 Verdict per persona

Per `00-method.md` §2. Strategy selection is `04-product-thesis.md`'s job, not this file's;
these are the three readings of the same evidence, and the disagreement is the point.

**Market researcher.** The category is small — a defensible **$40M–$180M/yr globally,
central ~$90M**, on 120k–450k paying subscribers `[I]`. Modal price $29–30, realized ARPU
**$24–30** after annual discounting `[V]`/`[I]`. Distribution is **rented from trading
educators at 20–30% of revenue in perpetuity**, and the discovery layer (comparison-site
SEO) is funded by the same commissions — TradeZella's founder brought a 750k-subscriber
YouTube channel to launch `[R]`, and `_theme-business-model.md` §4.3 finds **no fourth
channel** in the evidence. Churn is 7–10%/month blended against a ~6.6%/month floor set by
traders quitting trading altogether. The verdict on our leads: they are real, they are
narrow, and **none of them is a distribution answer**.

**Product manager.** The 34 table-stakes gaps are almost all bounded and known; the four
with leverage (fees, chart, daily journal object, auth) are the ones that unblock
everything else in their sections. The interesting ground is `02-feature-matrix.md`'s
frontier list, and the two blind spots in §B.4 are the only places where we hold a
prerequisite the category structurally lacks. But the wedge that follows from them is an
**unported mechanism, not an invention** (three competitors hold the container; the
grading mechanism ships in adjacent verticals), and it rests on an assumption rated
**total load-bearing and entirely unverified** — that a trader who did not write the
software will author a per-symbol MTF forecast on 60–70% of days for six months. Assume
**~2 quarters of lead** on anything visible, and **measure our own plan-fill rate before
building on it.**

**Engineer.** Everything in §B.3 is computable from data already in the sheet or bars
already fetched; the maths exists and is already exercised against our own trading. What
does *not* survive contact with a second user is the substrate: **Sheets-as-database with
full-tab `A:CG` scans in a 10 ms edge isolate**, one Polygon key at 5 req/min, one Drive
folder pair joined on `date|symbol`, and zero tests under the grouper. And the commercial
version has a constraint the tool version does not: our Polygon plan states verbatim *"you
may not use the Market Data to build an application intended for use by end users other
than you"* `[V]` — **the substrate is not an asset we own, it is a licence we do not have.**

**Where they disagree.** The PM sees the pre-trade object as the one genuinely open
position on the board; the market researcher notes that a superior product with no audience
in this category *does not get discovered*, not merely grows slower; the engineer notes
that the cheapest work in §B.3 is entirely independent of both arguments and pays off on
the first Sunday it is used. That last point is the one thing all three agree on, and it
is what `06-dogfood-backlog.md` is for.

Costing for both scopes — dogfood and sellable v1 — is in
[`05-build-plan.md`](05-build-plan.md).
