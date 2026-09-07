/**
 * Monthly performance review — the frozen snapshot behind /pct-bootcamp/reviews.
 *
 * Three deliberately separate tiers, because at ~70 trades a month discovery and
 * confirmation cannot share data without manufacturing false positives:
 *   scorecard  — fixed metrics, identical every month, never searched. Detects drift.
 *   hypotheses — pre-registered predictions, tested ONLY on the new month (out-of-sample).
 *   findings   — everything else, tiered and labelled; T3 is never actionable this month.
 */

export type Tier = "T2-CONFIRM" | "T2-REJECT" | "T3-HYPOTHESIS" | "UNDERPOWERED";
export type HypothesisStatus = "proposed" | "testing" | "confirmed" | "rejected" | "retired";

export interface Metric {
  key: string;
  label: string;
  value: number | null;
  /** Rendering hint. "R" and "$" are summed; "pct" and "ratio" are averaged. */
  unit: "R" | "$" | "pct" | "ratio" | "count";
  /** Prior month's value, for the delta arrow. */
  prev?: number | null;
  /** Lower is better (e.g. trades/session, probe rate). */
  inverse?: boolean;
  note?: string;
  /** Denominator, so a rate is never shown without its sample size. */
  n?: number;
}

export interface HypothesisTest {
  month: string;          // "2026-08"
  result: "confirmed" | "rejected" | "underpowered" | "untestable";
  detail: string;
}

export interface Hypothesis {
  id: string;             // "H1"
  claim: string;
  origin: string;         // month it was first proposed
  status: HypothesisStatus;
  mechanism: string;
  history: HypothesisTest[];
}

export interface Finding {
  tier: Tier;
  claim: string;
  numbers: string;
  mechanism: string;
  confounds: string;
  verdict: string;
}

export interface Target {
  label: string;
  baseline: string;
  target: string;
  horizon: string;
  tier: "outcome" | "performance" | "process";
}

/** A generic series for the inline SVG charts — no charting library, theme-aware. */
export interface Series {
  label: string;
  points: { x: string | number; y: number; meta?: string }[];
}

export interface MonthlyReview {
  month: string;              // "2026-08"
  label: string;              // "August 2026"
  account: string;
  period: { start: string; end: string; sessions: number; trades: number };
  /** One paragraph, plain language, at the top. The thing to read if nothing else. */
  verdict: string;
  headline: { label: string; value: string; sub?: string }[];
  scorecard: Metric[];
  charts: {
    equityR?: Series;          // cumulative R by session
    dailyR?: Series;           // per-session R
    mfeVsRealized?: Series;    // x = position MFE (R), y = realized R
    rMultiples?: Series;       // histogram
    holdTime?: Series;         // duration bucket -> expectancy
    addLadder?: Series;        // entries per trade -> contribution
  };
  hypotheses: Hypothesis[];
  findings: Finding[];
  targets: Target[];
  /** Multiple-comparison exposure — how many splits were examined to produce the above. */
  testsExamined: number;
  caveats: string[];
  generatedAt: string;
}
