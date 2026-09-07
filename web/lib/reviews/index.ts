import type { MonthlyReview } from "./types";
import aug2026 from "@/data/reviews/2026-08.json";

/**
 * Explicit manifest rather than a filesystem scan: the Cloudflare edge runtime has no
 * fs, so each month's snapshot is imported and bundled at build time. Adding a month
 * is one import plus one array entry.
 */
export const REVIEWS: MonthlyReview[] = [aug2026 as MonthlyReview].sort((a, b) =>
  b.month.localeCompare(a.month)
);

export const getReview = (month: string) => REVIEWS.find((r) => r.month === month);
export type { MonthlyReview } from "./types";
