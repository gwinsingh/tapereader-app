"use client";

import { useState, useEffect, useMemo } from "react";

/**
 * Pyramid Analysis — replaces the old Profitability Analysis.
 *
 * The section it replaces simulated taking partials at fixed R multiples on a fixed,
 * single-entry position. That is not this trader: he exits all-out as a norm and he
 * scales IN. So the simulation was answering a question about someone else's book.
 *
 * The question that matters here is whether the pyramid pays. It cannot be answered by
 * comparing added trades with non-added trades — he only adds once the trade has already
 * proved him right, so that split is definitional, not causal. The honest test is the
 * STARTER-ONLY COUNTERFACTUAL: hold the first lot alone, exit exactly where he exited,
 * and compare.
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
  entryTime: string;
  maxRBeforeStop: number;
  inWindowMfeR: number | null;
  positionMfeR: number | null;
  initialRisk: number | null;
  numEntries: number | null;
  numExits: number | null;
  firstEntry: number | null;
  starterR: number | null;
  addRs: number[];
}

interface Props {
  tabName: string;
  filterParams: string;
}

/** A single-entry trade whose in-window peak reached this is a missed add. */
const MISSED_ADD_R = 1;

function fmtR(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(d)}R`;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
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

export default function PyramidAnalysis({ tabName, filterParams }: Props) {
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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load pyramid data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, tabName, filterParams]);

  const m = useMemo(() => {
    if (!trades) return null;
    const laddered = trades.filter((t) => t.starterR !== null && t.risk > 0);
    if (!laddered.length) return { laddered, empty: true as const };

    const rows = laddered.map((t) => ({
      ...t,
      realizedR: t.pnl / t.risk,
      addDelta: t.pnl / t.risk - t.starterR!,
    }));

    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const actualR = sum(rows.map((r) => r.realizedR));
    const starterOnlyR = sum(rows.map((r) => r.starterR!));

    const pyramids = rows.filter((r) => (r.numEntries ?? 1) > 1);
    const helped = pyramids.filter((r) => r.addDelta > 0);
    const hurt = pyramids.filter((r) => r.addDelta < 0);

    const allAddRs = rows.flatMap((r) => r.addRs);
    const underwaterAdds = allAddRs.filter((x) => x < 0).length;

    // Single-entry trades whose in-window peak reached the add threshold: the tape gave
    // the signal his own rule waits for, and no add went on.
    const missed = rows.filter(
      (r) => (r.numEntries ?? 1) === 1 && (r.inWindowMfeR ?? r.maxRBeforeStop ?? 0) >= MISSED_ADD_R
    );

    return {
      laddered, empty: false as const, rows, actualR, starterOnlyR,
      addContribution: actualR - starterOnlyR,
      pyramids, helped, hurt, allAddRs, underwaterAdds, missed,
      medianAddR: median(allAddRs),
    };
  }, [trades]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-left hover:bg-[var(--color-panel)]/70"
      >
        <span>
          <span className="text-lg font-semibold">Pyramid Analysis</span>
          <span className="ml-2 text-xs text-[var(--color-muted)]">
            does scaling in actually pay? — starter-only counterfactual
          </span>
        </span>
        <span className="text-sm text-[var(--color-muted)]">{expanded ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-5">
          {loading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
          {error && <p className="text-sm text-[var(--stat-red)]">{error}</p>}

          {m && m.empty && (
            <p className="text-sm text-[var(--color-muted)]">
              No trades in this selection carry an order ladder, so the counterfactual cannot be built.
              Upload a day with its DAS log to populate it.
            </p>
          )}

          {m && !m.empty && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="Actual"
                  value={fmtR(m.actualR)}
                  sub={`${m.rows.length} trades with a ladder`}
                  tone={m.actualR > 0 ? "good" : "bad"}
                  title="Realised R over the trades that carry an order ladder, as actually traded."
                />
                <Metric
                  label="Starter only"
                  value={fmtR(m.starterOnlyR)}
                  sub="first lot alone, same exits"
                  tone={m.starterOnlyR > 0 ? "good" : "bad"}
                  title="What the same trades would have returned holding ONLY the first lot and exiting at exactly the same price. This is the counterfactual that isolates the pyramid — it holds entry selection and exit timing fixed and varies only the adds."
                />
                <Metric
                  label="Adds contributed"
                  value={fmtR(m.addContribution)}
                  sub={`helped ${m.helped.length} of ${m.pyramids.length} pyramids`}
                  tone={m.addContribution > 0 ? "good" : "bad"}
                  title="Actual minus starter-only. Positive means the adds added money in aggregate — but check the hit rate beside it: a right-tail contribution carried by a couple of trades is not the same as a reliable edge."
                />
                <Metric
                  label="Adds while underwater"
                  value={`${m.underwaterAdds}`}
                  sub={`of ${m.allAddRs.length} adds · median add at ${m.medianAddR === null ? "—" : fmtR(m.medianAddR, 2)}`}
                  tone={m.underwaterAdds === 0 ? "good" : "bad"}
                  title="Adds placed while the position was below the first entry. This is your add rule expressed as a counted behaviour — it is not a P&L outcome, so a lucky month cannot manufacture it, which makes it the most trustworthy number on this page. Zero is the target."
                />
              </div>

              <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  How to read this
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
                  Comparing added trades against non-added trades is <strong>not</strong> a test of the
                  pyramid — you only add once a trade has already proved you right, so that split is
                  definitional. The starter-only column above is the honest version: same entries, same
                  exits, adds removed. Judge the add rule on the counted behaviours (adds while underwater,
                  add timing) rather than on the R contribution, which needs a few hundred trades before it
                  means anything.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Metric
                  label="Missed adds"
                  value={`${m.missed.length}`}
                  sub={`single-entry trades that ran ≥ ${MISSED_ADD_R}R while held`}
                  tone={m.missed.length > 0 ? "bad" : "good"}
                  title="Trades you entered once, where the position still reached the level your add rule waits for. The tape gave the signal and no add went on. These are the trades your notes keep calling 'missed to add'."
                />
                <Metric
                  label="Adds that hurt"
                  value={`${m.hurt.length} / ${m.pyramids.length}`}
                  sub="pyramids that finished below their starter-only result"
                  tone={m.hurt.length > m.helped.length ? "bad" : "neutral"}
                  title="Pyramids where adding left you worse off than simply holding the first lot to the same exit. Adding raises the average cost, so a trade that reverses after the add gives back more than the starter would have."
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Per-trade detail
                </h3>
                <div className="max-h-96 overflow-auto rounded border border-[var(--color-border)]">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-panel)] text-xs uppercase text-[var(--color-muted)]">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2 text-center">Entries</th>
                        <th className="px-3 py-2 text-center">Adds at</th>
                        <th className="px-3 py-2 text-right">Starter</th>
                        <th className="px-3 py-2 text-right">Actual</th>
                        <th className="px-3 py-2 text-right">Add Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.rows
                        .slice()
                        .sort((a, b) => Math.abs(b.addDelta) - Math.abs(a.addDelta))
                        .map((r) => (
                          <tr
                            key={`${r.date}-${r.symbol}-${r.entryTime}`}
                            className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-panel)]/50"
                          >
                            <td className="px-3 py-2 font-mono text-xs">{r.date}</td>
                            <td className="px-3 py-2 font-medium">{r.symbol}</td>
                            <td className="px-3 py-2 text-center font-mono">{r.numEntries ?? "—"}</td>
                            <td className="px-3 py-2 text-center font-mono text-xs text-[var(--color-muted)]">
                              {r.addRs.length ? r.addRs.map((x) => x.toFixed(1)).join(", ") : "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{fmtR(r.starterR, 2)}</td>
                            <td className="px-3 py-2 text-right font-mono">{fmtR(r.realizedR, 2)}</td>
                            <td
                              className={`px-3 py-2 text-right font-mono font-semibold ${
                                r.addDelta > 0.005
                                  ? "text-[var(--stat-green)]"
                                  : r.addDelta < -0.005
                                    ? "text-[var(--stat-red)]"
                                    : "text-[var(--color-muted)]"
                              }`}
                            >
                              {Math.abs(r.addDelta) < 0.005 ? "—" : fmtR(r.addDelta, 2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-[var(--color-muted)]">
                  &ldquo;Adds at&rdquo; is how far the trade had already run, in initial-R, when each add went on.
                  Negative means the add was placed while the position was underwater.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
