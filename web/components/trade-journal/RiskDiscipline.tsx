"use client";

import { useState, useEffect, useMemo } from "react";

/**
 * Risk & Stop Discipline.
 *
 * Everything here is a COUNTED BEHAVIOUR, not a P&L outcome. That is deliberate: at
 * n≈70 no P&L split survives contact with a confidence interval, but "the stop never
 * crossed your cost" and "peak exposure hit 6.95x the committed risk" are facts from
 * the order ladder that a lucky month cannot manufacture. These are the numbers worth
 * looking at daily; the return stats are not.
 */

interface TradeForAnalysis {
  date: string;
  symbol: string;
  side: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  pnl: number;
  risk: number;
  maxRBeforeStop: number;
  inWindowMfeR: number | null;
  initialRisk: number | null;
  maxRiskAtStake: number | null;
  numEntries: number | null;
  firstEntry: number | null;
  initialStop: number | null;
  stopRaises: number | null;
  stoppedOut: string;
  bestStop: number | null;
  entryTime: string;
  conviction: string;
  processFollowed: string;
  hasNote: boolean;
}

interface TrendPoint {
  weekStart: string;
  pct: number | null;
  hits: number;
  n: number;
}

interface Props {
  tabName: string;
  filterParams: string;
  disciplineTrend?: TrendPoint[];
  heldGreenTrend?: TrendPoint[];
}

/** Peak exposure above this multiple of committed risk voids a max-loss rule. */
const RISK_BREACH_MULT = 2;

function weekKey(date: string): string {
  const dt = new Date(date + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}

/**
 * Weekly trend as a bar chart. Bars rather than a line: the weeks are discrete buckets
 * with wildly different n, and a line implies a continuity the data does not have. Each
 * bar carries its own n so a 100% week built on two trades cannot be misread.
 */
function TrendChart({
  title,
  points,
  hint,
  warnBelow,
}: {
  title: string;
  points: TrendPoint[];
  hint: string;
  warnBelow?: number;
}) {
  if (!points || points.length === 0) return null;

  const W = 100 / points.length;

  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{title}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-[var(--color-muted)]">{hint}</p>

      <div className="mt-3 flex h-32 items-end gap-1">
        {points.map((p) => {
          const pct = p.pct ?? 0;
          const low = warnBelow !== undefined && p.pct !== null && p.pct < warnBelow;
          return (
            <div
              key={p.weekStart}
              className="flex h-full flex-1 flex-col justify-end"
              style={{ minWidth: `${Math.min(W, 20)}%` }}
              title={`Week of ${p.weekStart}: ${p.pct === null ? "—" : `${p.pct}%`} (${p.hits}/${p.n})`}
            >
              <span
                className={`mb-1 text-center font-mono text-[10px] ${
                  low ? "text-[var(--stat-red)]" : "text-[var(--color-muted)]"
                }`}
              >
                {p.pct === null ? "—" : `${Math.round(p.pct)}%`}
              </span>
              <div
                className={`w-full rounded-t ${low ? "bg-[var(--stat-red)]" : "bg-[var(--stat-green)]"}`}
                style={{ height: `${Math.max(pct, 2)}%`, opacity: p.n < 5 ? 0.45 : 1 }}
              />
              <span className="mt-1 text-center text-[9px] leading-tight text-[var(--color-muted)]">
                {p.weekStart.slice(5)}
                <br />
                n={p.n}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--color-muted)]">
        Faded bars are weeks with fewer than 5 qualifying trades — too few to read.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone = "neutral",
  title,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad" | "neutral";
  title: string;
}) {
  const cls =
    tone === "bad"
      ? "text-[var(--stat-red)]"
      : tone === "good"
        ? "text-[var(--stat-green)]"
        : "text-[var(--color-text)]";
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3" title={title}>
      <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
        {label}
        <span className="cursor-help text-[10px] opacity-60" aria-hidden="true">ⓘ</span>
      </p>
      <p className={`mt-0.5 font-mono text-2xl font-semibold ${cls}`}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-[var(--color-muted)]">{sub}</p>
    </div>
  );
}

export default function RiskDiscipline({ tabName, filterParams, disciplineTrend, heldGreenTrend }: Props) {
  const [trades, setTrades] = useState<TradeForAnalysis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/trade-journal/analysis?tab=${encodeURIComponent(tabName)}${filterParams}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setTrades(data.trades);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load risk data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, tabName, filterParams]);

  const m = useMemo(() => {
    if (!trades || trades.length === 0) return null;
    const laddered = trades.filter((t) => t.initialRisk !== null && t.initialRisk > 0);

    // --- Risk at stake ---
    const withStake = laddered
      .filter((t) => t.maxRiskAtStake !== null && t.maxRiskAtStake > 0)
      .map((t) => ({ ...t, mult: t.maxRiskAtStake! / t.initialRisk! }))
      .sort((a, b) => b.mult - a.mult);
    const breaches = withStake.filter((t) => t.mult > RISK_BREACH_MULT);

    // --- Stop discipline ---
    // Compared against the BLENDED entry, not the first entry: on a pyramid the first lot
    // is the cheapest, so a stop above it can still be a loss on the position as built.
    const withStop = laddered.filter((t) => t.bestStop !== null);
    const protectedProfit = withStop.filter((t) =>
      t.side === "Long" ? t.bestStop! >= t.avgEntry : t.bestStop! <= t.avgEntry
    );
    const raised = withStop.filter((t) => (t.stopRaises ?? 0) > 0);

    // --- Journal coverage, weekly. Blanks cluster on bad days, so this is a mood
    //     indicator as much as a data-quality one.
    const covByWeek = new Map<string, { hits: number; n: number }>();
    for (const t of trades) {
      if (!t.date) continue;
      const k = weekKey(t.date);
      if (!covByWeek.has(k)) covByWeek.set(k, { hits: 0, n: 0 });
      const o = covByWeek.get(k)!;
      o.n++;
      if (t.conviction) o.hits++;
    }
    const coverageTrend: TrendPoint[] = [...covByWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, o]) => ({
        weekStart,
        pct: o.n ? Math.round((o.hits / o.n) * 1000) / 10 : null,
        hits: o.hits,
        n: o.n,
      }));

    const convFilled = trades.filter((t) => t.conviction).length;

    return { laddered, withStake, breaches, withStop, protectedProfit, raised, coverageTrend, convFilled, total: trades.length };
  }, [trades]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-left hover:bg-[var(--color-panel)]/70"
      >
        <span>
          <span className="text-lg font-semibold">Risk &amp; Stop Discipline</span>
          <span className="ml-2 text-xs text-[var(--color-muted)]">
            counted behaviours — exposure, stop handling, journal coverage
          </span>
        </span>
        <span className="text-sm text-[var(--color-muted)]">{expanded ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-5">
          {loading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
          {error && <p className="text-sm text-[var(--stat-red)]">{error}</p>}

          {m && m.laddered.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">
              No trades in this selection carry an order ladder, so exposure and stop behaviour cannot be
              measured. Upload a day with its DAS log to populate them.
            </p>
          )}

          {m && m.laddered.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric
                  label="Risk-rule breaches"
                  value={`${m.breaches.length}`}
                  sub={`of ${m.withStake.length} trades exceeded ${RISK_BREACH_MULT}× committed risk`}
                  tone={m.breaches.length > 0 ? "bad" : "good"}
                  title="Trades whose peak dollars genuinely at stake during the build phase exceeded twice the risk committed at entry. Your stated rule is a max-loss rule; an exposure spike silently voids it, and it is invisible in P&L because it only shows up when it goes wrong. Counts only shares covered by a resting protective order, and ignores orders the broker refused — both were previously inflating this number."
                />
                <Metric
                  label="Worst exposure"
                  value={m.withStake.length ? `${m.withStake[0].mult.toFixed(2)}×` : "—"}
                  sub={
                    m.withStake.length
                      ? `${m.withStake[0].symbol} ${m.withStake[0].date.slice(5)} · $${m.withStake[0].initialRisk!.toFixed(2)} committed → $${m.withStake[0].maxRiskAtStake!.toFixed(2)}`
                      : "no ladder data"
                  }
                  tone={m.withStake.length && m.withStake[0].mult > RISK_BREACH_MULT ? "bad" : "neutral"}
                  title="The single largest gap between what you committed at entry and what was actually at stake at the peak of the build. When you add, the stop has to move up enough to keep total risk at one unit. Measured against each lot's own cost, so a lot already in profit reduces the total rather than adding to it."
                />
                <Metric
                  label="Stop protected a profit"
                  value={`${m.protectedProfit.length} / ${m.withStop.length}`}
                  sub={`stop raised at all on ${m.raised.length}`}
                  tone={m.protectedProfit.length === 0 ? "bad" : "good"}
                  title="Trades where the stop was ever moved past your blended entry — i.e. where the trade could no longer lose. Measured against the blended cost, not the first entry: on a pyramid the first lot is the cheapest, so a stop above it can still be a loss on the position as built. If this is zero, every winning exit is a discretionary decision made under live P&L pressure with a full initial loss still on the table."
                />
              </div>

              {m.breaches.length > 0 && (
                <div className="overflow-x-auto rounded border border-[var(--color-border)]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-xs uppercase text-[var(--color-muted)]">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2 text-center">Entries</th>
                        <th className="px-3 py-2 text-right">Committed</th>
                        <th className="px-3 py-2 text-right">Peak at stake</th>
                        <th className="px-3 py-2 text-right">Multiple</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.breaches.map((t) => (
                        <tr key={`${t.date}-${t.symbol}-${t.entryTime}`} className="border-b border-[var(--color-border)]/50">
                          <td className="px-3 py-2 font-mono text-xs">{t.date}</td>
                          <td className="px-3 py-2 font-medium">{t.symbol}</td>
                          <td className="px-3 py-2 text-center font-mono">{t.numEntries ?? "—"}</td>
                          <td className="px-3 py-2 text-right font-mono">${t.initialRisk!.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono">${t.maxRiskAtStake!.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-[var(--stat-red)]">
                            {t.mult.toFixed(2)}×
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <TrendChart
                  title="Discipline % by week"
                  points={disciplineTrend || []}
                  hint="Process Followed = Yes, among labelled trades."
                  warnBelow={70}
                />
                <TrendChart
                  title="+1R held green, by week"
                  points={heldGreenTrend || []}
                  hint="Positions that reached +1R while held and still closed green. The leading indicator — it moves before P&L."
                  warnBelow={35}
                />
                <TrendChart
                  title="Journal coverage by week"
                  points={m.coverageTrend}
                  hint={`Conviction filled before the trade — ${m.convFilled}/${m.total} overall. Blanks cluster on bad days.`}
                  warnBelow={60}
                />
              </div>

              <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
                Exposure is measured lot by lot against the stop actually resting at that moment —
                a lot already in profit lowers the total, which is why a stop raised past your first
                entry can leave a large position risking less than the first share did. Orders the
                broker refused, and shares not covered by the resting bracket, are excluded.
              </p>

              <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
                Conviction is the only pre-trade field in this sheet that has ever separated the book, and it
                can only be tested on trades where you filled it. Coverage collapsing during a drawdown is
                itself the signal — it is when the data would have been most useful.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
