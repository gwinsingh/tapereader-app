# Screenshot pipeline — naming, cropping and uploading DAS screenshots

Status: **live for DAS (Windows)** since 2026-09-29 · **Bookmap (Mac): convention only, not automated yet**

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

## Spoken journal (trade notes -> sheet)

Since 2026-10-02 the notes are dictated, not typed. Driven by the `/daily-journal` Claude
skill (user-level, `~/.claude/skills/daily-journal/SKILL.md`):

1. After the session, talk through the day **ticker by ticker** to Claude and take that
   ticker's EOD screenshot while talking about it. Say per trade: why it looked good/bad
   beforehand, why in/out, emotion, lesson, and **Right theory** / **Process followed** yes/no.
2. Claude runs the screenshot plan, fixes EOD tickers OCR misread (`Check` doesn't catch an
   EOD read like `IHOOD` - verify each EOD symbol was traded that day), drops repeat EOD shots,
   sets `Setup` (FOMO for non-trade-book trades) and a one-word `Note` that lands in the
   filename (`Scalp`, `FEAR`, `TILT`), then applies.
3. Claude distils the talk into per-round-trip cells, prefixed **`[Claude] `** so they're
   distinguishable from hand-written notes:

   | Column | Content |
   |---|---|
   | `Notes` | what was seen, why in/out, emotion, lesson |
   | `Pre-Trade Notes` | why the setup looked good/bad *before* entry (watchlist?, daily context, catalyst quality, known risks, idea source) - for long-term pre-trade patterns |
   | `Right Theory` | Yes/No - was the read right, regardless of outcome |
   | `Setup`, `Tags`, `Process Followed?` | as usual |

4. After a yes, they're saved to `_journal\<date>.notes.json` and `node scripts/journal/sync.js
   <date>` does the rest: `import-day.js` uploads the DAS log through the live app (same calls as
   the upload page, so the trade rows, ladder and enrichment columns appear as with a manual
   upload; dedups), then `write-notes.js --write` writes the notes (columns by name; rows by
   Date + Symbol + Entry Time; appends to existing text, merges Tags, never overwrites a different
   Setup/Process/Right Theory) and reads them back, and the day gets an empty
   `_journal\<date>.notes.written` marker. `sync.js` with no date catches up every pending day;
   the routine runs it at the start of every round. Needs `web/.env.local` with the Google
   service account plus a Cloudflare Access service token (`CF_ACCESS_CLIENT_ID` /
   `CF_ACCESS_CLIENT_SECRET`) - tapereader.us is behind Access. The PC's Node 16 gets `fetch`
   from `scripts/journal/http.js`.

## Next: Bookmap screenshots from the Mac

Not journaled today. The goal is to eventually view DAS price action and the Bookmap
order-flow view **side by side** for the same moment. Two machines, no shared session —
so the link has to be the **timestamp**, which both already have.

**There is already a precedent in the Drive folder**, from July:

```
2026-07-21 NBIS 4 ORB Long Screenshot (605).png                 <- DAS, Windows
2026-07-21 NBIS 4.1 Bookmap Screenshot 2026-07-21 at 9.52.47 AM.png   <- Bookmap, Mac
2026-07-21 NBIS 4.2 Bookmap Screenshot 2026-07-21 at 9.53.00 AM.png
```

Proposed convention (keeps that precedent):

```
<date> <SYM> <step>.<k> Bookmap [<note>] Screenshot <date> at <h.mm.ss AM>.png
```

- `<step>` = the DAS step number of the same symbol's latest screenshot at or before
  the Bookmap capture time; `<k>` = 1, 2, … for multiple Bookmap shots in that step.
  `0.k` for shots before the first DAS screenshot (SOD reads — also precedented:
  `2026-08-05 PLTR 0 SOD Screenshot …`).
- Keep the Mac's own `Screenshot <date> at <time>` suffix: it carries the capture time to
  the second, which is the only join key between the machines.
- It sorts right after its DAS shot (`"4 "` < `"4.1"`), and the app already indexes it under
  `date|SYM`, so it appears in Screenshot Review with **no app change**.

Steps, cheapest first:

1. **Start capturing (now, no code).** On the Mac, Cmd+Shift+5 → Options → *Other Location…*
   → a `Bookmap Inbox` folder inside `DOCS (BACKED UP)/AA - Trading and PCT Bootcamp/Screenshots - Draft/`.
   Google Drive's Mac backup makes it visible on Windows under `G:\Other computers\My Mac\…`.
   Prefer Cmd+Shift+4 then Space (window capture) on the Bookmap window.
2. **Automate naming.** Extend `Journal-Screenshots.ps1` to read `Bookmap Inbox`, parse the time
   from the Mac filename, get the symbol from the Bookmap window title (OCR) — or, failing that,
   the DAS action nearest in time — and name `<step>.<k>` against the DAS shots of the same day.
   To verify first: the Mac clock's timezone (DAS log times are ET), and that the Bookmap
   title bar shows the instrument.
3. **Side-by-side view** in Screenshot Review: pair `N` with `N.k` for the same date and symbol.
