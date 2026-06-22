// Minimal D1 typings + accessor for the USMLE app.
// We avoid @cloudflare/workers-types (not installed) and declare only what we use,
// mirroring the KV pattern in app/4-week-challenge/api/kv/route.ts.

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

/** Returns the bound D1 database, or null when unavailable (e.g. local dev without --local binding). */
export function getDB(): D1Database | null {
  try {
    const env = process.env as unknown as Record<string, unknown>;
    return (env.usmle_db as D1Database) ?? null;
  } catch {
    return null;
  }
}

/** Standard 503 payload when D1 isn't bound (local dev). */
export const DB_UNAVAILABLE = { error: "Database not available" } as const;
