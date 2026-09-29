# Screenshot pipeline — naming, cropping and uploading DAS screenshots

Status: **live for DAS (Windows)** since 2026-09-29 · **Bookmap + TradingView inbox: built 2026-09-29, not yet run on real files** (see [the inbox section](#bookmap--tradingview-the-inbox))

The journal's Screenshot Review and calendar drill-down find screenshots purely by
filename (`web/lib/trade-journal/google-drive.ts` → `parseScreenshotFilename`):
token 1 is the date, token 2 the symbol, and a third token of `EOD` marks an EOD shot.
There is no metadata layer: **the name is the whole contract**, including order.

## The daily routine

1. Trade as usual; press **Win+PrtScn** after each action (entry, add, stop move, exit,
   or any moment worth remembering). Windows saves `Screenshot (n).png`.
2. After the session, set up the DAS EOD layout and Win+PrtScn once per ticker (again later
   in the day for `EOD 2` if wanted).
3. Export the DAS trade log to `DAS Reports\YYYY-MM-DD-trade-log.csv` (unchanged).
4. Run the script (or ask Claude to "do today's screenshots"):

```powershell
scripts\screenshots\Journal-Screenshots.ps1                 # plan: writes _journal\<date>.plan.csv, changes nothing
scripts\screenshots\Journal-Screenshots.ps1 -Apply          # rename + crop + copy to Drive, verified
scripts\screenshots\Journal-Screenshots.ps1 -Undo           # put everything back (needs the backup)
scripts\screenshots\Journal-Screenshots.ps1 -Date 2026-09-25,2026-09-28   # backlog days
```

Between plan and apply, add notes (`FEAR`, `Meeting time`, ...) in the plan's `Note`
column, change `Setup` from the `ORB` default, or set `Include=N` to leave a file alone.
Every row with anything uncertain says why in `Check`.

Paths live in `scripts/screenshots/config.json` (git-ignored; copy `config.example.json`).
`"backup": true` keeps every original under `_journal\backup\<date>\` — turn it off once
the routine has earned trust; `-Apply` still validates everything before touching a file.

## How each screenshot is identified

| | Signal | Why it works |
|---|---|---|
| **Trade vs EOD** | A DAS title bar ("Dastrader Powered by DASTrader.com") on the **big monitor** | During trading the big monitor is the borderless chart grid; the EOD layout is a normal window. File size is *not* reliable (EOD shots range 1.1–2.6 MB). |
| **Ticker (trade)** | Chart watermark (`NVDA--1 Minute`) in the **left half of the laptop screen**, plus the montage window's `QQQ Bid:` / `QQQ Long:18` line | Double-clicking a pane moves focus there, so the laptop's left half always shows the ticker that just changed. |
| **Ticker (EOD)** | Watermarks inside the cropped DAS window + the quote window title (`TQQQ 77.43 -- 77.44 ProShares…`) | The quote title is crisp text and outweighs the faint watermark. |
| **Action** | The DAS event just **before** the screenshot | Measured 3–8 s gap on every shot of 2026-09-24/25/28/29. |
| **EOD crop** | The window's white frame and 1 px border, found from the title bar | Works wherever the window sits and at any size (tested moved, on white/black desktops, and at 70% size). |

OCR is the engine built into Windows (`Windows.Media.Ocr`); nothing to install. It
misreads the faint watermark in predictable ways (drops letters, `EQXL` for `SOXL`), so
readings that are a substring of, or one letter away from, a symbol traded that day (or
QQQ/SPY) are folded into it.

Action labels, from the day's DAS log (order lifecycle, not just fills):

| Label | Rule |
|---|---|
| *(none)* | first entry in that symbol today |
| `Re-Entry` | a later entry from flat |
| `AddSize` | execution in the direction of the open position |
| `Partial` | reduces but doesn't close |
| `Stopped` | closes at (≤0.15% through) the resting stop |
| `TP` | closes at the resting target |
| `AllOut` | any other close |
| `RaisedStop` / `LoweredStop` / `WidenedStop` | a resting stop moved (tighter long / tighter short / looser) |
| `TargetChange` | a resting target moved |

A resting stop vs target is told apart by which side of the last fill it was placed on;
an order that fills within a second of being sent is an entry/exit, not a resting leg.

## Naming convention

```
2026-09-24 SOXL 3 AddSize ORB Long Screenshot (1121).png
<date>     <sym> <step> <action> [<note>] <setup> <side> Screenshot (<n>).png

2026-09-24 META EOD Screenshot (1139).png
2026-09-22 AMD EOD 2 Screenshot (1099).png
```

`<step>` counts that symbol's screenshots for the day, continuing from whatever is
already in the local or Drive folders. `Screenshot (<n>)` is kept as a unique suffix.
Renamed files keep their original **creation time**; it's what ties a shot to its DAS
event if it ever needs re-matching.

## Safety checks

`-Apply` refuses to change anything unless every row passes: source still there and
unchanged since planning, name fits the app's `YYYY-MM-DD SYMBOL …` parse, EOD names
carry `EOD` as the third word, no duplicate targets, nothing already at the target
locally or on Drive, Drive folders reachable. After copying, each Drive file's SHA-256
is compared with the local file. Every step goes to `_journal\<date>.log.jsonl`; `-Undo`
replays it backwards (restoring bytes and capture times). A second `-Apply` of the same
day is refused because the sources are gone.

## Bookmap + TradingView: the inbox

Goal: every screenshot of a trade, from any app and either machine, lands in the **same
Drive folder** the journal already reads, named so it sits right after the DAS shot it
belongs to; Bookmap's own order log is archived next to the DAS logs. The Screenshot
Review page then shows them side by side (badged **Bookmap** / **TV**, in step order).

It is the same script and the same plan → apply → undo, with one addition: **inbox
folders** inside the Drive folder that the Mac and TradingView drop raw files into.
Inbox subfolders are invisible to the app (it lists only the folder's direct children),
so nothing half-named ever shows up in Screenshot Review.

```
Screenshots - Draft/                     <- app's entry folder (unchanged)
├── 2026-09-29 NVDA 2 AddSize ORB Long Screenshot (1121).png     DAS, step 2
├── 2026-09-29 NVDA 2.1 TradingView AddSize 09.41.30.png         its companions
├── 2026-09-29 NVDA 2.2 Bookmap 09.43.00.png
├── EOD Screenshots/                     <- app's EOD folder (unchanged)
│   └── 2026-09-29 NVDA EOD Bookmap 16.21.40.png
├── DAS - Trades Report/                 (unchanged)
├── Bookmap - Trades Report/             NEW: 2026-09-29-bookmap-orders.txt
└── _Inbox/                              NEW: raw drops, emptied by -Apply
    ├── Bookmap/        Mac screenshots + Bookmap order exports
    └── TradingView/    TradingView "Download image" files
```

### One-time setup

1. **Drive:** create `_Inbox/Bookmap`, `_Inbox/TradingView` and `Bookmap - Trades Report`
   inside `Screenshots - Draft`. No sharing change needed — they inherit the folder's.
2. **Mac screenshots:** Cmd+Shift+5 → Options → *Other Location…* → `_Inbox/Bookmap` (it is
   inside the Mac's backed-up `DOCS (BACKED UP)` folder, so it syncs to Drive by itself).
   Cmd+Shift+4 then Space captures just the Bookmap window. If Bookmap's own screenshot
   (Ctrl+S) is used instead, point its save dialog at the same folder.
3. **TradingView:** desktop app → profile → *App Settings → General → Downloads* →
   `_Inbox/TradingView` (browser: set the download folder, or move the files there).
   Then per shot: the camera icon → *Download image* (Windows hotkey Alt+Ctrl+S).
4. **Bookmap orders** (only if orders are placed *in* Bookmap — see below): after the
   session, File → Export → *Export orders as plain text* → save into `_Inbox/Bookmap`.
5. **Windows:** add `driveBookmapDir`, `inboxes` and `marketCloseEt` to `config.json`
   (see `config.example.json`). `clockOffsetMinutes` is added to times read from inbox
   file names — leave 0 while the Mac and TradingView run on Eastern time.

### Daily routine

Unchanged: run `Journal-Screenshots.ps1`, review the plan, `-Apply`. The plan now also
lists every inbox file of that date (`Kind` = `companion`, `companion-eod` or
`bookmap-orders`, with `App` and `SourceDir`). On apply they are **moved** from the inbox
to their final Drive folder under the new name (a Drive-side rename, verified by hash,
original backed up, reversible with `-Undo`). The Mac never has to run anything.

### How an inbox file is identified

| | Signal | Notes |
|---|---|---|
| **Capture time** | macOS name `Screenshot 2026-09-29 at 9.52.47 AM.png`; TradingView name `NVDA_2026-09-29_09-52-47.png` | macOS 14+ writes a U+202F narrow space before AM/PM — handled. Anything else falls back to the file's modified time (Drive keeps it across machines) and is flagged. |
| **Symbol** | TradingView: the file name. Bookmap: OCR of the instrument alias on its tab (`NVDA@DXFEED`) | Falls back to whatever was traded within `matchWindowSecs` before the shot, flagged `CHECK`. |
| **App** | The inbox it came from; the screen text overrides it (a Cmd+Shift+4 of TradingView dropped in the Bookmap inbox) and is flagged | |
| **Step** | The latest DAS step of that symbol taken **at or before** the capture (a DAS shot trails its event by 3–8 s, so a step counts from 8 s before its screenshot) | `0.k` before the first DAS shot (SOD reads — precedent `2026-08-05 PLTR 0 SOD …`). Works across runs: steps already on disk are read back from file names and times. |
| **Action** | The nearest DAS **or Bookmap** event before it, same rules as DAS shots | Bookmap orders map onto the DAS lifecycle (S→Accept, U→Replaced, C→Canceled, E→Execute), so `RaisedStop` / `AddSize` / `Stopped` come out identically. |
| **EOD** | Captured at or after `marketCloseEt` (16:00) | → `EOD Screenshots`, named `… EOD Bookmap <time>` — DAS EOD numbering ignores these. |

### Naming convention (companions)

```
<date> <SYM> <step>.<k> <App> [<Action>] [<Note>] <HH.mm.ss>.png
<date> <SYM> EOD <App> [<Note>] <HH.mm.ss>.png
```

`<k>` counts companions within a step (Bookmap and TradingView share it, in time order),
continuing from files already on disk. Two EOD companions in the same second get
` 2`, ` 3` after the time. `<HH.mm.ss>` is the capture time on the ET clock —
the only join key between two machines. The July hand-named files
(`… 4.1 Bookmap Screenshot 2026-07-21 at 9.52.47 AM.png`) keep working: the app reads
both suffixes (`web/lib/trade-journal/screenshot-names.ts`).

Editing the plan: Mac file names contain a U+202F space, so edit the plan CSV in a text
editor, or save from Excel as **CSV UTF-8** — a plain "CSV" save turns it into `?` and
apply then reports the source file as gone. A row's origin is fixed: inbox rows can
only be `companion` / `companion-eod` (or `Include=N`), DAS rows only `trade` / `eod`.

### Verify on the first real run

Built from vendor docs and forum evidence; this sandbox had no real files. Check once:

- **TradingView's file-name time zone.** Evidence says it is the machine's local clock.
  If a 09:41 shot is named `…_13-41-…`, it is UTC: set that inbox's `clockOffsetMinutes`
  to `-240` (EDT) — or better, tell Claude, since DST makes that a moving target.
- **Bookmap's tab shows `SYMBOL@DXFEED`** and Windows OCR reads it off a Retina capture.
  If not, the `CHECK` column will say "ticker taken from the trade log only".
- **Bookmap Ctrl+S file names** — unknown format. They still work (modified time), just
  flagged; tell Claude one real name and it becomes a parsed pattern.
- **Mac clock = ET.** Timestamps from the Mac are taken as ET.

### Bookmap trades — what is and isn't done

Bookmap routes US stock orders only through **Interactive Brokers or TradeStation**
(market data via dxFeed); it has **no DAS integration**. So there are two cases:

- **Orders placed in DAS, Bookmap only watched:** there are no Bookmap trades; the DAS
  log stays the record, and Bookmap shots are companions of DAS steps. Nothing else to do.
- **Orders placed in Bookmap (IB / TradeStation / sim):** the export (format: Bookmap KB
  "Appendix IV. Orders Format", UTC timestamps) is archived to `Bookmap - Trades Report`
  and used to label companion shots. A second export of the same day is archived as
  `…-bookmap-orders-2.txt`, and events present in several exports are counted once.
  Unreadable lines are skipped with a warning rather than failing the plan.
  **It is not yet imported into the journal sheet.**
  Proposed next step, for decision: a pure `bookmap-orders.ts` converting the export into
  DAS-shaped rows (the same mapping as above) so the upload page, trade grouper and
  order-ladder reconstruction work unchanged, writing to a separate account tab
  (e.g. `BOOKMAP-IB`). That creates a new tab in the live sheet, so it waits for a go-ahead.

### Tests

`pwsh scripts/screenshots/Test-JournalInbox.ps1` — the pure inbox logic (`JournalInbox.ps1`):
name parsing incl. U+202F, Bookmap order parsing and UTC→ET, step/companion numbering
across runs. Runs on any OS; the OCR/screen parts need Windows and are exercised by the
plan pass itself.
