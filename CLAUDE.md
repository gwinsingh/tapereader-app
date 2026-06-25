# CLAUDE.md

## What is this project?

TapeReader is a trader's tool — a free US-stock setup scanner with annotated charts and watchlists. Live at **tapereader.us**, hosted on **Cloudflare Pages**.

The repo also contains the **PCT Bootcamp** section (`/pct-bootcamp/*`), which includes an **Auto Trade Journal** that processes DAS Trader CSV exports into round-trip trades and writes them to a shared Google Sheet.

It also hosts the **4-Week Challenge** (`/4-week-challenge`), a standalone Vite + React fitness tracker with Cloudflare KV cloud sync, shared across a crew of athletes.

## Repo layout

```
tapereader-app/
├── apps/
│   └── 4-week-challenge/        # Vite + React source (standalone build)
│       ├── src/                  # App.jsx, main.jsx
│       ├── public/               # Static assets (og.svg) copied to build
│       ├── vite.config.js        # Builds to web/public/4-week-challenge/
│       └── .env                  # VITE_WRITE_KEY (gitignored)
├── data/                         # static refs (ticker universe CSV, images)
├── scanner/                      # Python scanner (not yet built)
└── web/                          # Next.js 15 app (Cloudflare Pages)
    ├── app/                      # App Router pages
    │   ├── 4-week-challenge/api/ # KV API route (edge, reads Cloudflare KV)
    │   ├── pct-bootcamp/         # PCT Bootcamp section (trade journal, etc.)
    │   └── api/trade-journal/    # API routes (edge runtime)
    ├── components/
    │   └── trade-journal/        # Journal-specific UI components
    └── lib/
        ├── data/            # Data interface (fixtures, Yahoo, Polygon, Turso)
        └── trade-journal/   # CSV parser, trade grouper, Google Sheets client
```

## Build & deploy

```bash
cd web
npm install
npm run dev          # local dev on http://localhost:3000
npm run build        # Next.js build
npx @cloudflare/next-on-pages@1   # Cloudflare Pages build (run locally to verify)
```

Deploy: push to `main` on GitHub. Cloudflare auto-deploys.

## Key architectural decisions

### Cloudflare edge runtime
All API routes must export `export const runtime = 'edge'`. Node.js APIs are not available.
- **No `googleapis` SDK** — it uses Node.js `crypto`/`http`. We use raw `fetch` calls to the Google Sheets REST API instead.
- **JWT signing uses Web Crypto API** (`crypto.subtle.importKey` + `crypto.subtle.sign`) for service account auth.
- The `wrangler.toml` has `nodejs_compat` flag but the code doesn't rely on it.

### Theming (PCT Bootcamp pages only)
- PCT pages use **CSS custom properties** (`var(--color-bg)`, `var(--color-text)`, etc.), NOT hardcoded Tailwind colors.
- Theme toggle (dark/light) stored in `localStorage` key `pct-theme`, default is **light**.
- `data-theme` attribute on `<html>` controls the active theme.
- `PCTBodyStyle` component syncs `document.body.backgroundColor` with the theme using a MutationObserver.
- The main TapeReader pages use hardcoded Tailwind dark theme — these are separate systems.

### Google Sheets integration
- **Auth**: Service account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON` env var. JWT signed with Web Crypto.
- **Sheet structure**: One tab per trading account (matched by account prefix, e.g. `TRPCT1541-GS`).
- **54 columns**: Auto-filled trade data, formula columns (Stop after Avg Exit), manual per-trade + daily, enrichment + formula analysis columns (Max R Before Stop, Farthest Price, 1R-6R), market data enrichment.
- **Auto-filled columns**: Date, Entry Time, Exit Time, Duration, Symbol, Side, Shares, Avg Entry, Avg Exit, # Partials, P&L.
- **Formula columns**: Stop (Entry ± R/Shares), P&L (R) (P&L/R), 1R-6R (Y/N whether Max R Before Stop reached each R-multiple).
- **Max R Before Stop**: Order-aware enrichment field. Walks 1-minute bars from entry to 16:00 ET, tracks max favorable R-multiple reached, stops if stop-loss is hit. Skips adverse check on the entry bar (intra-bar order unknown). Requires R to be filled. Farthest Price is the stock price at that max point.
- **PDC/PDH/PDL**: Prior Day Close/High/Low — stored for pivot point analysis.
- **Per-trade manual columns**: R (Risk), Setup, Process Followed?, Notes, Conviction (1-3), Catalyst, Tags — user fills these for every trade.
- **Daily manual columns**: Sleep Score (0-100), Readiness Score (0-100), Emotional State (dropdown), Market Bias (dropdown) — user fills these once on the first trade of each day.
- **Market data enrichment columns** (auto-filled from Polygon): #1m, #5m, #1H, %Gap, %ATR, RVOL, %VWAP, OR Size ($), OR %ATR, OR High, OR Low, Breakout Vol Ratio, Prior Close Loc, Dist 20 SMA (%), Dist 50 SMA (%), Float, Avg $ Vol, SPY Dir, VIX, PDC, PDH, PDL.
- All manual columns have flipped header colors (light bg, dark text) to visually distinguish them.
- **1R-6R columns** have green/red conditional formatting (Y=green, N=red) like Process Followed.
- **Formulas use `buildFormulas()`** which generates all formula strings from dynamic colMap — used by both `tradeToRow` and migration.
- **Dedup** uses key: `Date|Symbol|normalizedEntryTime|Side`. Time is normalized (leading zeros stripped) because Google Sheets strips them.
- **Formatting**: frozen header, conditional colors (green/red for P&L, Side, Process, 1R-6R), currency formats, dropdowns for Setup and Process Followed.
- **Stats**: computed server-side from all sheet rows — overall stats, hourly breakdown (4 time blocks), setup breakdown.
- **Profitability Analysis**: client-side simulation of partial-taking strategies using per-trade R and Max R Before Stop data (order-aware). API endpoint: `/api/trade-journal/analysis`.
- **Trading Calendar**: monthly calendar of daily performance with three unit modes — **R (Standard)** = daily $ P&L ÷ Full R target for that date (default; conviction-aware so half-size days show smaller R), **Realized R** = sum of `P&L (R)` (each trade vs its own risk; exposes when sizing rescued/sank a day), and **$**. The Full R target comes from the `Calendar Config` sheet tab (`Account | Effective Date | Full R($)`), applied by latest effective date ≤ trade date — so changing the risk unit over time (e.g. $28 → $48) doesn't retroactively rescale history. Clicking a day opens a **drill-down** of that day's trades with sortable columns and a screenshot viewer (Entry/EOD lightbox gallery, matched by `date|symbol`). API endpoint: `/api/trade-journal/calendar`.
- **Shared filters**: one page-level filter bar (Process Followed, date range, Setup, Conviction, Side, Symbol, Catalyst, Tags) drives Performance Overview, Trading Calendar, and Profitability Analysis together. Backed by a single `applyRowFilter()` helper + `parseStatsFilter()` shared across the stats/analysis/calendar routes (the calendar ignores the date range and uses month navigation instead).

### Google Drive integration (Screenshot Review)
- **Auth**: Shares service account OAuth2 token with Sheets (scope: `drive.readonly`).
- **Folder structure**: Two configurable folders — entry screenshots and EOD screenshots, set via `GOOGLE_DRIVE_ENTRY_FOLDER_ID` and `GOOGLE_DRIVE_EOD_FOLDER_ID`.
- **Filename convention**: `YYYY-MM-DD SYMBOL <details>.png` for entry, `YYYY-MM-DD SYMBOL EOD <details>.png` for EOD. Date + symbol extracted for matching with trades.
- **Screenshot index**: Built by listing both folders, parsing filenames, joining with trade data on `date|symbol` key.
- **Image proxy**: `/api/trade-journal/screenshot-image?fileId=xxx` streams Drive file content through edge, avoids exposing auth tokens to client.
- **Tags**: Retrospective pattern labels (comma-separated) editable from the Screenshot Review UI. Saved immediately to Google Sheets via `PATCH /api/trade-journal/tags`. Presets: clean entry, extended entry, chased, FOMO, added size, perfect process, revenge trade, oversize, strong momentum, gap>2xATR, gap<2xATR.

### Morning Plan, Origin & Capture Tracker (Phase 1 — see `docs/trade-journal/phase-1-spec.md`)
- **Daily Plan tab** (`Date | Symbol | Conviction (1-3) | Thesis | Catalyst | L2 Bias`): pre-market watchlist filled via the in-app Morning Plan form (`/pct-bootcamp/trade-journal/plan`). Solves logging conviction/catalyst/bias at the open — captured the night before / pre-market instead. Catalyst uses a dropdown of `CATALYST_OPTIONS`; **L2 Bias** (per-symbol order-book read) reuses the Market Bias options (`Bullish`/`Bearish`/`Neutral`). QQQ/SPY seeded; upsert dedups by symbol.
- **Origin column** (manual dropdown `Watchlist / Callout / Intraday discovery`): auto-filled at CSV upload by matching `date|symbol` against the Daily Plan — **on the plan → `Watchlist`, off-plan → `Intraday discovery`** (`Callout` stays a manual override). Conviction, Catalyst, and L2 Bias also auto-fill from the plan when blank. **Origin is a separate axis from "Process Followed?"** — idea source must not contaminate the execution-discipline signal. (`L2 Bias` is a distinct trade-sheet column from the daily `Market Bias`: instrument order-book read vs. overall-market read.)
- **Capture / Trail-Leak Tracker** (`CaptureTracker.tsx`): headline **Target Capture %** = among trades whose MFE (`Max R Before Stop`) ≥ target, `mean(min(realizedR, target))/target`. Isolates the trail leak (cutting runners short of a reachable target) from trades that fail early. Target configurable (default 2.5R, `localStorage`); reuses `/api/trade-journal/analysis`; driven by the shared filter bar.

### JSON serialization gotcha
`Infinity` doesn't survive `JSON.stringify()` (becomes `null`). Use `9999` as sentinel, display as `∞` in UI.

### 4-Week Challenge
- **Standalone Vite + React app** at `apps/4-week-challenge/`, builds to `web/public/4-week-challenge/`.
- **Pre-built & committed**: run `cd apps/4-week-challenge && npm run build` locally, commit the output. Vite's `emptyOutDir: true` clears the output folder on each build — static assets (like `og.svg`) must live in `apps/4-week-challenge/public/` to survive.
- **Cloud data via Cloudflare KV**: roster + athlete records stored in KV namespace `crew-data` (binding: `CREW_KV`). Per-device localStorage only stores "who am I" pointer.
- **KV API route**: `web/app/4-week-challenge/api/kv/route.ts` — a Next.js edge route (not a standalone Pages Function, because `@cloudflare/next-on-pages` ignores `functions/`).
- **Write protection**: client sends `x-write-key` header; server checks against `WRITE_KEY` env var. Both must match `VITE_WRITE_KEY` in `apps/4-week-challenge/.env`.
- **Next.js rewrite** in `web/next.config.mjs` maps `/4-week-challenge` → `/4-week-challenge/index.html` (Next.js doesn't auto-serve index.html from `public/` subdirectories).
- **Local dev**: KV endpoint returns 503 locally (no KV binding). UI renders but can't persist. Use production for full testing.

## Trade journal data flow

1. User uploads DAS Trader CSV on `/pct-bootcamp/trade-journal`
2. `csv-parser.ts` validates headers, filters to `Event === "Execute"` rows
3. `trade-grouper.ts` groups executions into round-trip trades using position tracking (Buy=+shares, Sell/Shrt=-shares; position returning to 0 = trade complete)
4. `google-sheets.ts` ensures the account tab exists, deduplicates, appends rows, applies formatting, computes aggregate stats
5. API returns trades + stats, frontend renders `TradePreview` and `AggregateStats`

## File reference

| File | Purpose |
|------|---------|
| `web/lib/trade-journal/csv-parser.ts` | Validates DAS CSV, filters to executions |
| `web/lib/trade-journal/trade-grouper.ts` | Groups fills into round-trip trades with P&L |
| `web/lib/trade-journal/google-sheets.ts` | All Google Sheets API calls (fetch-based, edge-compatible) |
| `web/app/api/trade-journal/upload/route.ts` | POST endpoint for CSV upload |
| `web/app/api/trade-journal/populate-instructions/route.ts` | One-shot endpoint to populate Instructions sheet tab |
| `web/app/pct-bootcamp/layout.tsx` | PCT section layout, metadata, theme toggle |
| `web/app/pct-bootcamp/trade-journal/page.tsx` | Trade journal page (upload form, results) |
| `web/components/trade-journal/AggregateStats.tsx` | Stats cards + breakdown tables |
| `web/components/trade-journal/TradePreview.tsx` | Trade table + summary cards |
| `web/components/trade-journal/HowToUse.tsx` | Collapsible instructions with DAS screenshots |
| `web/components/trade-journal/ProfitabilityAnalysis.tsx` | Partial-taking strategy simulation and R-multiple analysis |
| `web/app/api/trade-journal/analysis/route.ts` | GET endpoint for raw trade data (R + MFE) for simulation |
| `web/lib/trade-journal/google-drive.ts` | Google Drive API client for screenshot access |
| `web/app/api/trade-journal/screenshots/route.ts` | GET endpoint for screenshot index (both folders) |
| `web/app/api/trade-journal/screenshot-image/route.ts` | GET endpoint to proxy Drive image bytes |
| `web/app/api/trade-journal/trades-for-review/route.ts` | GET endpoint for trade data with tags |
| `web/app/api/trade-journal/tags/route.ts` | PATCH endpoint to update trade tags |
| `web/app/pct-bootcamp/trade-journal/screenshots/page.tsx` | Screenshot Review page |
| `web/components/trade-journal/ScreenshotReview.tsx` | Screenshot review UI with filters, carousel, tags, lightbox |
| `web/components/trade-journal/TradingCalendar.tsx` | Monthly calendar view (Standard R / Realized R / $ toggle) |
| `web/app/api/trade-journal/calendar/route.ts` | GET endpoint for per-day calendar cells |
| `web/components/trade-journal/CaptureTracker.tsx` | Trail-leak tracker: Target Capture %, R left on table, weekly trend (reads `/analysis`) |
| `web/app/pct-bootcamp/trade-journal/plan/page.tsx` | Morning Plan form — pre-market watchlist + conviction |
| `web/app/api/trade-journal/plan/route.ts` | GET/POST endpoint for the `Daily Plan` tab (upsert by date) |
| `web/components/HeaderVisibility.tsx` | Hides main app header on `/pct-bootcamp` routes |
| `apps/4-week-challenge/src/App.jsx` | 4-Week Challenge React app (single-file) |
| `apps/4-week-challenge/vite.config.js` | Vite config, builds to `web/public/4-week-challenge/` |
| `web/app/4-week-challenge/api/kv/route.ts` | KV GET/POST endpoint for crew data |

## Environment variables (production: Cloudflare Pages dashboard)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON of the Google service account key |
| `GOOGLE_SPREADSHEET_ID` | The shared Google Sheet ID (`1Hg1g73D8l8EH0j65IQBJhSEHzp3Ot_ib-ZD9UcN3ucU`) |
| `DATA_SOURCE` | Optional: `yahoo` or `polygon` for real market data (default: fixtures) |
| `POLYGON_API_KEY` | Required if `DATA_SOURCE=polygon` |
| `GOOGLE_DRIVE_ENTRY_FOLDER_ID` | Google Drive folder ID for entry screenshots |
| `GOOGLE_DRIVE_EOD_FOLDER_ID` | Google Drive folder ID for EOD screenshots |
| `WRITE_KEY` | Shared secret for 4-Week Challenge KV writes (must match `VITE_WRITE_KEY`) |

## Conventions

- Commit messages: imperative, 1-2 sentence summary, then bullet points for details.
- All commits end with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.
- Always run `npx tsc --noEmit` before committing. Run `npx @cloudflare/next-on-pages@1` to verify Cloudflare compatibility for API route changes.
- When patching between worktree and main repo: use `git diff HEAD~1 -- '*.ts' '*.tsx'` to generate patches, exclude `package-lock.json` and `.gitignore`.
