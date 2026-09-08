import Link from "next/link";
import { notFound } from "next/navigation";
import { REVIEWS, getReview } from "@/lib/reviews";
import { Scorecard, EquityCurve, DailyBars, CaptureScatter, Histogram }
  from "@/components/trade-journal/ReviewCharts";
import type { Tier } from "@/lib/reviews/types";

export function generateStaticParams() {
  return REVIEWS.map((r) => ({ month: r.month }));
}
export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  return { title: `${getReview(month)?.label ?? month} Review — PCT Bootcamp` };
}

const BORDER = "var(--color-border)";
const MUTED = "var(--color-muted)";

const TIER_STYLE: Record<Tier, { bg: string; label: string }> = {
  "T2-CONFIRM": { bg: "var(--color-pos, #16a34a)", label: "Confirmed out-of-sample" },
  "T2-REJECT": { bg: "var(--color-neg, #dc2626)", label: "Rejected out-of-sample" },
  "T3-HYPOTHESIS": { bg: "var(--color-accent)", label: "Hypothesis — not actionable yet" },
  "UNDERPOWERED": { bg: MUTED, label: "Underpowered" },
};

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm" style={{ color: MUTED }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function ReviewPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const r = getReview(month);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <Link href="/pct-bootcamp/reviews" className="text-sm" style={{ color: "var(--color-accent)" }}>
          ← All reviews
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{r.label} — Performance Review</h1>
        <p className="mt-1 font-mono text-xs" style={{ color: MUTED }}>
          {r.account} · {r.period.start} → {r.period.end} · {r.period.trades} trades over {r.period.sessions} sessions
        </p>
      </div>

      {/* Verdict first: the thing to read if nothing else gets read. */}
      <div className="rounded-lg border-l-4 p-4" style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-alt, transparent)" }}>
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Verdict</div>
        <p className="mt-2 text-[15px] leading-relaxed">{r.verdict}</p>
      </div>

      {!!r.headline.length && (
        <div className="grid gap-3 sm:grid-cols-3">
          {r.headline.map((h) => (
            <div key={h.label} className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
              <div className="text-xs" style={{ color: MUTED }}>{h.label}</div>
              <div className="mt-1 font-mono text-2xl font-bold">{h.value}</div>
              {h.sub && <div className="mt-1 text-[11px]" style={{ color: MUTED }}>{h.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {!!r.scorecard.length && (
        <Section title="Scorecard"
                 subtitle="Fixed metrics, computed identically every month. Nothing here is searched for, so nothing here can be a false positive — its job is detecting drift.">
          <Scorecard metrics={r.scorecard} />
        </Section>
      )}

      {r.charts.equityR && (
        <Section title="Equity" subtitle="In R. Dollars hide risk-unit changes.">
          <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
            <EquityCurve series={r.charts.equityR} />
          </div>
          {r.charts.dailyR && (
            <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
              <DailyBars series={r.charts.dailyR} />
            </div>
          )}
        </Section>
      )}

      {r.charts.mfeVsRealized && (
        <Section title="Capture"
                 subtitle="Each point is a trade. The diagonal is perfect capture; everything below it is money the position was worth at some point and didn't keep.">
          <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
            <CaptureScatter series={r.charts.mfeVsRealized} />
          </div>
        </Section>
      )}

      {(r.charts.rMultiples || r.charts.holdTime || r.charts.addLadder) && (
        <Section title="Distributions">
          <div className="grid gap-4 lg:grid-cols-2">
            {[r.charts.rMultiples, r.charts.holdTime, r.charts.addLadder]
              .filter(Boolean)
              .map((s, i) => (
                <div key={i} className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
                  <Histogram series={s!} />
                </div>
              ))}
          </div>
        </Section>
      )}

      {!!r.hypotheses.length && (
        <Section title="Hypothesis register"
                 subtitle="Predictions made in earlier months, tested only on this month's data. A rule graduates after surviving two independent months — one month is an anecdote.">
          <div className="space-y-2">
            {r.hypotheses.map((h) => {
              const latest = h.history[h.history.length - 1];
              return (
                <div key={h.id} className="rounded-lg border p-3" style={{ borderColor: BORDER }}>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-xs font-bold" style={{ color: "var(--color-accent)" }}>{h.id}</span>
                    <span className="flex-1 text-sm font-medium">{h.claim}</span>
                    {latest && (
                      <span className="rounded px-2 py-0.5 font-mono text-[10px] uppercase text-white"
                            style={{ background: latest.result === "confirmed" ? "var(--color-pos, #16a34a)"
                              : latest.result === "rejected" ? "var(--color-neg, #dc2626)" : MUTED }}>
                        {latest.result}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs" style={{ color: MUTED }}>{h.mechanism}</p>
                  {!!h.history.length && (
                    <div className="mt-2 space-y-1">
                      {h.history.map((t, i) => (
                        <div key={i} className="font-mono text-[11px]" style={{ color: MUTED }}>
                          <span className="font-bold">{t.month}</span> · {t.result} — {t.detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {!!r.findings.length && (
        <Section title="Findings"
                 subtitle={`Every claim carries its tier, its confounds, and what would falsify it. ${r.testsExamined} splits were examined to produce this section — at this sample size roughly one in twenty looks significant by chance.`}>
          <div className="space-y-3">
            {r.findings.map((f, i) => (
              <div key={i} className="rounded-lg border p-3" style={{ borderColor: BORDER }}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="rounded px-2 py-0.5 font-mono text-[10px] uppercase text-white"
                        style={{ background: TIER_STYLE[f.tier].bg }}>{f.tier}</span>
                  <span className="flex-1 text-sm font-medium">{f.claim}</span>
                </div>
                <dl className="mt-2 space-y-1 text-xs" style={{ color: MUTED }}>
                  <div><dt className="inline font-bold">Numbers: </dt><dd className="inline font-mono">{f.numbers}</dd></div>
                  <div><dt className="inline font-bold">Mechanism: </dt><dd className="inline">{f.mechanism}</dd></div>
                  <div><dt className="inline font-bold">Confounds: </dt><dd className="inline">{f.confounds}</dd></div>
                  <div><dt className="inline font-bold">Verdict: </dt><dd className="inline">{f.verdict}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </Section>
      )}

      {!!r.targets.length && (
        <Section title="Next period" subtitle="Each with its baseline, so the goal can actually be judged.">
          <div className="space-y-2">
            {(["outcome", "performance", "process"] as const).map((tier) => {
              const items = r.targets.filter((t) => t.tier === tier);
              if (!items.length) return null;
              return (
                <div key={tier} className="rounded-lg border p-3" style={{ borderColor: BORDER }}>
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>{tier}</div>
                  <ul className="mt-2 space-y-2">
                    {items.map((t, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{t.label}</span>
                        <div className="font-mono text-xs" style={{ color: MUTED }}>
                          baseline {t.baseline} → target {t.target} · {t.horizon}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {!!r.caveats.length && (
        <Section title="What this report does not establish">
          <ul className="list-inside list-disc space-y-1 text-sm" style={{ color: MUTED }}>
            {r.caveats.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </Section>
      )}

      <p className="border-t pt-4 font-mono text-[11px]" style={{ borderColor: BORDER, color: MUTED }}>
        Generated {r.generatedAt || "—"}
      </p>
    </div>
  );
}
