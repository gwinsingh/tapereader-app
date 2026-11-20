# Anatomy of a Drop (market-drops study)

A historical study of how US stock-market drops unfold and end, built around the comparison of autumn 2026 with
autumn 2018, with 2000–02 and 2007–09 as the other path. It is a static website with interactive charts.

- **Live:** https://tapereader.us/studies/market-drops/ (static files in `web/public/studies/market-drops/`, deployed with the site)
- **Local preview:** `node scripts/marketdrops/serve.js` → http://localhost:4173/
- **Rebuild everything:** `node scripts/marketdrops/run.js` (download, analyse, build). `--no-fetch` reuses the data on disk.
- It is a historical study, not advice. Every rule-like sentence is an observation; only the trader decides rules.

## Resume here

1. `node scripts/marketdrops/run.js` (after the US close; add `--intraday` to refresh the 30-minute bars).
2. Look at the site locally (`serve.js`), then commit `web/public/studies/market-drops/` and the scripts and push to `main`.
3. Narrative sections are hand-written HTML fragments in `site/content/`; they do **not** update themselves. After new data,
   re-read `now-*.html` and the `2026.json` events file, and the hand-written conclusions in `pages-*.js`
   (search for `take(` and `p.lede`): numbers inside them are computed, the sentences around them are not.

## Files

| File | What it does |
|---|---|
| `universe.js` | Symbol lists: indices, ~90 ETFs, today's S&P 500 and Nasdaq-100 members (Wikipedia) plus a hand list of past leaders → `.data/universe.json` |
| `fetch.js` | Downloads Yahoo daily bars (indices, ETFs, ~665 stocks gzipped), CBOE VIX family and put/call archive, FRED series → `.data/raw/`, `.data/coverage.json` |
| `intraday.js` | 30-minute bars of SPY and QQQ for two years (Polygon key from `web/.env.local`; never 09:15–16:15 New York time) |
| `lib.js` | Loaders and helpers. Falls back to `scripts/fedcycles/.data/raw` for Ken French industries, Shiller/multpl and the fed-funds target files |
| `drops.js` | The definitions: `episodes()` (10% below the 52-week closing high → next new 52-week high), `swings()`, `rallies()` (5% reversals; failed / turn) |
| `breadth.js` | One memory-light pass over the stock files → `.data/breadth.json` (daily breadth since 1999) and `.data/stockstats.json` (each stock in each drop) |
| `analyze.js` | Catalogue of S&P and Nasdaq drops, features of every rally, what surrounded each low, base rates after −10%, the look-alike test → `.data/core.json` |
| `analyze2.js` | Sector/industry ETFs per drop, leaders, macro backdrop at each peak and similarity score, day shape from daily bars, VIX family, margin loans, today's snapshot → `.data/more.json`, `.data/nightday.json` |
| `analyze3.js` | The hand-kept breadth gauges (share above the 10-/20-day EMA and 50-day average, 4% up/down days, 10-day ratio, 25%-in-a-quarter): washouts, surges, held vs failed lows, per-low table, today → `.data/gauges.json` |
| `intra.js` | Half-hour day shape by phase from the 30-minute bars → `.data/intra.json` |
| `inspect.js` | Prints result tables (`bounce`, `lows`, `cross`, `analog`, `sectors <id>`, `leaders <id>`, `macro`, `shape`, `vix`, `lev`, `now`); `site/facts/*.txt` are dumps of these for the fragment writers |
| `sitegen.js` | Page builder, chart-data registry, HTML helpers, navigation (`NAV`) |
| `kit.js` | Chart-spec builders (episode charts with failed-rally bands, event lists, paths from the peak) |
| `pages-a.js` … `pages-f.js` | The pages: a atlas, lookalike · b bounces, bottoms, filters · c sectors, leaders · d intraday, leverage, fundamentals, news · e now, y2018, y2018-turn, compare · g gauges · f bears, ai-dotcom, scenarios, drills, glossary, method, sources, index |
| `build.js` | Runs the page modules, checks links and bad text, writes the site (removes stale files) |
| `vault.js` | Writes the one summary note in the Obsidian vault (`Market/Market Drops/00 Anatomy of a Drop`), keeping the trader's notes under the ✍️ marker; then run `scripts/vault-sync/check.js --push` |
| `publish.sh` | Copies code and built site into the deployment worktree (`~/tapereader-worktrees/marketdrops`); commit and push from there |
| `site/assets/` | `charts.js` (the chart engine: candles and lines as SVG, hover read-out, replay mode), `site.css`, `app.js` |
| `site/content/*.html` | Narrative fragments (body HTML only). `site/STYLE.md` is the writing guide |
| `site/events/*.json` | Key days per drop, drawn as numbered badges on charts |
| `research/*.md` | The four research notes with sources (shown on the Sources page) |

## Things that bite

- **Shell and backslashes:** this PC's Bash tool eats backslashes in heredocs and `node -e`. Write files with an editor, not with shell heredocs.
- **6 GB of memory:** `breadth.js` keeps one stock in memory at a time on purpose; do not load all stocks at once.
- **Survivorship:** the stock universe is today's index membership. Breadth and leader tables before about 2010 are flattering; the pages say so.
- **Chart theme:** white up-candles, black down-candles on every timeframe (the trader, 20 Nov 2026: never white/red). Daily averages as on the trader's daily DAS chart and the vault's daily charts (`DASH.ma` in `scripts/modelbook/chart.js`): EMA 9 `#464646`, EMA 20 `#808080`, SMA 50 `#B0B0B0`, SMA 200 `#D0D0D0`, dark to light; weekly 10- and 40-week in the same greys. Intraday candle charts, if added, use the DAS1 set: black EMA 9, blue EMA 20 `#0080FF`, grey EMA 50, pale-blue EMA 200, thick blue VWAP.
- **Yahoo on the day:** today's bar is final only some hours after the close (volume changes); CBOE posts the VIX close in the evening; Polygon's bars for the day arrive after the close.
- **No strategy tests:** the trader asked for description, not back-tests. Keep it that way unless asked.
- **Privacy:** the site is public (noindex). No personal details, accounts or trades belong in it.
