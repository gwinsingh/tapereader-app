import type { D1Database } from "./db";

// Bar ingest for the market-scans store.
//
// Division of labour (see docs/market-scans/phase-1-spec.md §7):
//   - GitHub Actions (Node, no CPU limit) fetches Polygon grouped-daily, applies
//     the liquidity filter, and POSTs the rows here.
//   - This edge route only writes to D1.
// Fetching + filtering deliberately does NOT happen on the edge: parsing a
// 1.36 MB payload would burn the free-tier CPU budget for no benefit.

export type MarketBar = {
  ticker: string;
  date: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw: number | null;
  n: number | null;
};

// Liquidity filter "A" from the spec. Authoritative copy lives in
// scripts/market-ingest.mjs (which does the filtering); these are kept here for
// server-side sanity checks and must stay in sync.
export const MIN_PRICE = 1;
export const MIN_DOLLAR_VOLUME = 5_000_000;

const TICKER_RE = /^[A-Z]{1,6}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(d: unknown): d is string {
  return typeof d === "string" && DATE_RE.test(d);
}

/**
 * D1 allows a maximum of 100 BOUND PARAMETERS per query, which with 9 columns
 * would cap a parameterised INSERT at 11 rows — ~380 statements for one date,
 * against a free-tier ceiling of 50 queries per invocation.
 *
 * So bulk inserts are built as literal VALUES instead, which is bounded by the
 * 100 KB statement-length limit rather than the parameter limit: ~600 rows per
 * statement (~42 KB) means a full date lands in ~7 statements.
 *
 * That is only safe because every value is validated to a strict shape first —
 * tickers must match /^[A-Z]{1,6}$/, dates YYYY-MM-DD, and every numeric field
 * must be a finite number. Anything failing validation is dropped, never
 * escaped-and-passed-through. Do not relax this without switching back to
 * bound parameters.
 */
export const ROWS_PER_STATEMENT = 600;

/** Validates and normalises one incoming row. Returns null if it fails any check. */
export function sanitizeBar(raw: unknown): MarketBar | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const ticker = typeof r.ticker === "string" ? r.ticker.toUpperCase() : "";
  if (!TICKER_RE.test(ticker)) return null;
  if (!isValidDate(r.date)) return null;

  const nums: Record<string, number> = {};
  for (const k of ["o", "h", "l", "c", "v"]) {
    const val = r[k];
    if (typeof val !== "number" || !Number.isFinite(val)) return null;
    nums[k] = val;
  }
  if (nums.c < MIN_PRICE) return null;

  const optional = (k: string): number | null => {
    const val = r[k];
    return typeof val === "number" && Number.isFinite(val) ? val : null;
  };

  return {
    ticker,
    date: r.date,
    o: nums.o,
    h: nums.h,
    l: nums.l,
    c: nums.c,
    v: nums.v,
    vw: optional("vw"),
    n: optional("n"),
  };
}

/** Renders a finite number as a SQL literal. Values are pre-validated by sanitizeBar. */
function num(n: number | null): string {
  return n === null ? "NULL" : String(n);
}

/**
 * Builds INSERT OR REPLACE statements for the given (already sanitized) bars.
 * OR REPLACE keeps re-ingesting a date safe, which is what lets the backfill
 * retry freely and lets split-adjusted restatements be re-pulled later.
 */
export function buildInsertStatements(db: D1Database, bars: MarketBar[]) {
  const statements = [];
  for (let i = 0; i < bars.length; i += ROWS_PER_STATEMENT) {
    const chunk = bars.slice(i, i + ROWS_PER_STATEMENT);
    const values = chunk
      .map(
        (b) =>
          `('${b.ticker}','${b.date}',${num(b.o)},${num(b.h)},${num(b.l)},${num(b.c)},` +
          `${num(b.v)},${num(b.vw)},${num(b.n)})`,
      )
      .join(",");
    statements.push(
      db.prepare(
        `INSERT OR REPLACE INTO daily_bars (ticker,date,o,h,l,c,v,vw,n) VALUES ${values}`,
      ),
    );
  }
  return statements;
}
