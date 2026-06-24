// App settings (single-user key/value in D1). Currently holds the flashcard
// daily pacing caps. Reads return sensible defaults when unset.
import type { D1Database } from "./db";

export interface Settings {
  /** Max brand-new cards to introduce per day. 0 = introduce none (pure review). */
  newPerDay: number;
  /** Max review-state cards to surface per day. 0 = unlimited. Learning/relearning are never capped. */
  maxReviewsPerDay: number;
}

export const DEFAULT_SETTINGS: Settings = { newPerDay: 20, maxReviewsPerDay: 200 };

const KEYS = { newPerDay: "new_per_day", maxReviewsPerDay: "max_reviews_per_day" } as const;

export async function getSettings(db: D1Database): Promise<Settings> {
  const { results } = await db.prepare(`SELECT key, value FROM app_settings`).all<{ key: string; value: string }>();
  const map = new Map(results.map((r) => [r.key, r.value]));
  const num = (k: string, d: number) => {
    const v = map.get(k);
    const n = v == null ? NaN : parseInt(v, 10);
    return Number.isFinite(n) ? n : d;
  };
  return {
    newPerDay: num(KEYS.newPerDay, DEFAULT_SETTINGS.newPerDay),
    maxReviewsPerDay: num(KEYS.maxReviewsPerDay, DEFAULT_SETTINGS.maxReviewsPerDay),
  };
}

/** Upsert the provided settings (clamped to safe ranges). Returns the merged result. */
export async function updateSettings(db: D1Database, patch: Partial<Settings>): Promise<Settings> {
  const stmts = [];
  if (patch.newPerDay !== undefined) {
    const v = Math.min(Math.max(Math.round(patch.newPerDay), 0), 1000);
    stmts.push(
      db.prepare(`INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
        .bind(KEYS.newPerDay, String(v))
    );
  }
  if (patch.maxReviewsPerDay !== undefined) {
    const v = Math.min(Math.max(Math.round(patch.maxReviewsPerDay), 0), 10000);
    stmts.push(
      db.prepare(`INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
        .bind(KEYS.maxReviewsPerDay, String(v))
    );
  }
  if (stmts.length) await db.batch(stmts);
  return getSettings(db);
}
