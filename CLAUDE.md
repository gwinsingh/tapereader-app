# CLAUDE.md

## What is this project?

TapeReader is a trader's tool — a free US-stock setup scanner with annotated charts and watchlists. Live at **tapereader.us**, hosted on **Cloudflare Pages**.

The repo also contains the **PCT Bootcamp** section (`/pct-bootcamp/*`), which includes an **Auto Trade Journal** that processes DAS Trader CSV exports into round-trip trades and writes them to a shared Google Sheet.

## Repo layout

```
tapereader-app/
├── data/                    # static refs (ticker universe CSV, images)
├── scanner/                 # Python scanner (not yet built)
└── web/                     # Next.js 15 app (Cloudflare Pages)
    ├── app/                 # App Router pages
    │   ├── pct-bootcamp/    # PCT Bootcamp section (trade journal, etc.)
    │   └── api/trade-journal/  # API routes (edge runtime)
    ├── components/
    │   └── trade-journal/   # Journal-specific UI components
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

### Google Drive integration (Screenshot Review)
- **Auth**: Shares service account OAuth2 token with Sheets (scope: `drive.readonly`).
- **Folder structure**: Two configurable folders — entry screenshots and EOD screenshots, set via `GOOGLE_DRIVE_ENTRY_FOLDER_ID` and `GOOGLE_DRIVE_EOD_FOLDER_ID`.
- **Filename convention**: `YYYY-MM-DD SYMBOL <details>.png` for entry, `YYYY-MM-DD SYMBOL EOD <details>.png` for EOD. Date + symbol extracted for matching with trades.
- **Screenshot index**: Built by listing both folders, parsing filenames, joining with trade data on `date|symbol` key.
- **Image proxy**: `/api/trade-journal/screenshot-image?fileId=xxx` streams Drive file content through edge, avoids exposing auth tokens to client.
- **Tags**: Retrospective pattern labels (comma-separated) editable from the Screenshot Review UI. Saved immediately to Google Sheets via `PATCH /api/trade-journal/tags`. Presets: clean entry, extended entry, chased, FOMO, added size, perfect process, revenge trade, oversize, strong momentum, gap>2xATR, gap<2xATR.

### JSON serialization gotcha
`Infinity` doesn't survive `JSON.stringify()` (becomes `null`). Use `9999` as sentinel, display as `∞` in UI.

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
| `web/components/HeaderVisibility.tsx` | Hides main app header on `/pct-bootcamp` routes |

## Environment variables (production: Cloudflare Pages dashboard)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON of the Google service account key |
| `GOOGLE_SPREADSHEET_ID` | The shared Google Sheet ID (`1Hg1g73D8l8EH0j65IQBJhSEHzp3Ot_ib-ZD9UcN3ucU`) |
| `DATA_SOURCE` | Optional: `yahoo` or `polygon` for real market data (default: fixtures) |
| `POLYGON_API_KEY` | Required if `DATA_SOURCE=polygon` |
| `GOOGLE_DRIVE_ENTRY_FOLDER_ID` | Google Drive folder ID for entry screenshots |
| `GOOGLE_DRIVE_EOD_FOLDER_ID` | Google Drive folder ID for EOD screenshots |

## Conventions

- Commit messages: imperative, 1-2 sentence summary, then bullet points for details.
- All commits end with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.
- Always run `npx tsc --noEmit` before committing. Run `npx @cloudflare/next-on-pages@1` to verify Cloudflare compatibility for API route changes.
- When patching between worktree and main repo: use `git diff HEAD~1 -- '*.ts' '*.tsx'` to generate patches, exclude `package-lock.json` and `.gitignore`.
