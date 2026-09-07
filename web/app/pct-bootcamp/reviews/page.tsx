import Link from "next/link";
import { REVIEWS } from "@/lib/reviews";
import { EquityCurve } from "@/components/trade-journal/ReviewCharts";
import type { Metric } from "@/lib/reviews/types";

export const metadata = { title: "Performance Reviews — PCT Bootcamp" };

const pick = (m: Metric[], key: string) => m.find((x) => x.key === key);

export default function ReviewsIndex() {
  const trend = {
    label: "Cumulative R across reviewed months",
    points: [...REVIEWS].reverse().map((r) => ({
      x: r.label,
      y: pick(r.scorecard, "sumR")?.value ?? 0,
      meta: `${r.period.trades} trades / ${r.period.sessions} sessions`,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Performance Reviews</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          A frozen snapshot per period: what the numbers were, what was tested, and what
          was decided. Each report separates the fixed scorecard from pre-registered
          hypothesis tests and from exploratory findings — so a pattern found in one month
          has to survive the next before it becomes a rule.
        </p>
      </div>

      {trend.points.length > 1 && (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
          <EquityCurve series={trend} height={180} />
        </div>
      )}

      <div className="space-y-3">
        {REVIEWS.map((r) => {
          const sumR = pick(r.scorecard, "sumR")?.value ?? null;
          return (
            <Link key={r.month} href={`/pct-bootcamp/reviews/${r.month}`}
                  className="block rounded-lg border p-4 transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--color-border)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-lg font-bold">{r.label}</span>
                <span className="font-mono text-sm" style={{ color: "var(--color-muted)" }}>
                  {r.period.start} → {r.period.end} · {r.period.trades} trades · {r.period.sessions} sessions
                </span>
              </div>
              {sumR != null && (
                <div className="mt-1 font-mono text-xl font-bold"
                     style={{ color: sumR >= 0 ? "var(--color-pos, #16a34a)" : "var(--color-neg, #dc2626)" }}>
                  {sumR > 0 ? "+" : ""}{sumR.toFixed(1)}R
                </div>
              )}
              <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>{r.verdict}</p>
            </Link>
          );
        })}
        {!REVIEWS.length && (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
