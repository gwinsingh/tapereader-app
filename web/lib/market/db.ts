// Minimal D1 typings + accessor for the market-scans app.
// Mirrors lib/usmle/db.ts — we avoid @cloudflare/workers-types (not installed)
// and declare only what we use.

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

/** Returns the bound market D1 database, or null when unavailable (local dev without a binding). */
export function getMarketDB(): D1Database | null {
  try {
    const env = process.env as unknown as Record<string, unknown>;
    return (env.market_db as D1Database) ?? null;
  } catch {
    return null;
  }
}

/** Standard 503 payload when D1 isn't bound (local dev). */
export const DB_UNAVAILABLE = { error: "Market database not available" } as const;

// D1's free tier allows only 50 queries per Worker invocation, so every write
// path batches. Each batch() call counts as one invocation's worth of queries
// against that ceiling, and SQLite's variable limit caps a single multi-row
// INSERT — CHUNK_ROWS keeps us under both with room to spare.
export const CHUNK_ROWS = 80;

/**
 * Splits `items` into chunks and runs `toStatement` over each, sequentially.
 * Sequential (not parallel) because a D1 database processes queries one at a
 * time anyway, and serial execution keeps error attribution clean.
 */
export async function batchInChunks<T>(
  db: D1Database,
  items: T[],
  toStatement: (chunk: T[]) => D1PreparedStatement,
  chunkSize: number = CHUNK_ROWS,
): Promise<number> {
  let written = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await toStatement(chunk).run();
    written += chunk.length;
  }
  return written;
}
