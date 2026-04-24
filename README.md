# TapeReader

A trader's tape-reading tool — free US-stock setup scanner. Active and forming setups, annotated charts, watchlist.
Live at **[tapereader.us](https://tapereader.us)**.

This repo will eventually contain both the Python scanner and the Next.js frontend. Today it contains the frontend only,
backed by deterministic fixture data so the whole UI renders end-to-end. When the scanner ships and starts writing to
Turso, a single change to `web/lib/data/index.ts` swaps every page over to real data — no page-level code changes.

## Repo layout

```
tapereader-app/
├── data/                # static refs (ticker universe CSV, etc.)
├── scanner/             # Python scanner (not yet built)
└── web/                 # Next.js app (Cloudflare Pages)
    ├── app/             # App Router pages
    ├── components/      # UI + chart components
    └── lib/data/        # data interface — swap fixtures for Turso here
```

## Architecture (planned end-state)

- **Scanner** — Python, scheduled on GitHub Actions cron. Pulls bars from `yfinance` + `Polygon` free tier, computes
  setups, writes results to **Turso** (SQLite).
- **Frontend** — Next.js on **Cloudflare Pages**. Reads from Turso only; never calls market-data APIs directly.
- **Charts** — TradingView Lightweight Charts.

Today the frontend is independent: it runs entirely on fixtures.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000.

### Choosing a data source

The frontend can pull bars from three sources, controlled by `DATA_SOURCE`:

```bash
# Synthetic fixtures (default — no network, no keys, prices are not real)
npm run dev

# Real bars from Yahoo Finance (no API key, unofficial endpoint)
DATA_SOURCE=yahoo npm run dev

# Real bars from Polygon free tier (5 req/min, 15-min delayed, requires key)
DATA_SOURCE=polygon POLYGON_API_KEY=your_key_here npm run dev
```

Or put them in `web/.env.local`:

```
DATA_SOURCE=polygon
POLYGON_API_KEY=your_key_here
```

When using `yahoo` or `polygon`:
- Daily and intraday charts show **real** OHLCV.
- The dashboard's Top Movers list is computed from real bars across the fixture universe.
- Setup cards and setup detail pages still use **fixture metadata** (trigger/stop/target levels were computed against synthetic prices). The annotations will look off against real bars — this is expected until the Python scanner ships and writes real setups to Turso.
- If an upstream API call fails, the app falls back to fixtures for that symbol/timeframe and logs the error to the server console.

Routes:

- `/` — dashboard (active setups, forming setups, top movers)
- `/ticker/AAPL` — per-ticker view with daily + intraday charts, setup cards
- `/setups/AAPL-breakout-1` — annotated setup chart with trigger/stop/target
- `/watchlist` — localStorage-backed watchlist
- `/about` — what the tool is and how setups are defined

Keyboard: press `/` anywhere to focus the ticker search.

## Build

```bash
cd web
npm run build
```

## Deploy to Cloudflare Pages

The app deploys as a Cloudflare Pages project using `@cloudflare/next-on-pages`.

1. **Push this repo to GitHub.**

2. **Register/point the domain.** `tapereader.us` should be on Cloudflare (DNS + registrar). If it's not already there,
   add the domain to your Cloudflare account and update the nameservers at your registrar.

3. **Create the Pages project.**
   - Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
   - Select the repo.
   - **Framework preset:** `Next.js`
   - **Root directory:** `web`
   - **Build command:** `npx @cloudflare/next-on-pages@1`
   - **Build output directory:** `.vercel/output/static`
   - **Node version:** 20 (set `NODE_VERSION=20` under env vars if needed)

4. **Environment variables.** None required for V1 (fixtures only). Later, when swapping to Turso:
   - `TURSO_URL`
   - `TURSO_AUTH_TOKEN`

5. **Custom domain.** Pages project → **Custom domains** → **Set up a custom domain** → add `tapereader.us` and
   `www.tapereader.us`. DNS auto-configures since the domain is on Cloudflare.

6. **First deploy.** Cloudflare builds and deploys automatically. Every push to `main` redeploys. Preview deploys are
   created for every PR.

### One-time local preview of the Cloudflare build

```bash
cd web
npx @cloudflare/next-on-pages@1
npx wrangler pages dev .vercel/output/static
```

## Swapping fixtures → Turso (later)

When the scanner starts writing to Turso:

1. Fill in `web/lib/data/turso.ts` with a `DataSource` implementation backed by `@libsql/client/web`.
2. In `web/lib/data/index.ts`, export the Turso implementation as `data` instead of the fixtures-backed one.
3. Add `TURSO_URL` and `TURSO_AUTH_TOKEN` to Pages env vars.

No page code needs to change — every route reads through the `DataSource` interface.

## V1 scope

Included: dashboard, per-ticker charts, watchlist, setup permalinks, about. Dark mode only.

Not included: accounts, alerts, backtesting UI, portfolio tracking, options data, non-US markets, real-time data
(everything is 15+ minutes delayed).

## Disclaimer

Not financial advice. Educational and personal-research use only.
