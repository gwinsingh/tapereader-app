"use client";

import { useState, useEffect, useMemo } from "react";

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
  setup: string;
  entryTime: string;
}

interface PartialRule {
  rMultiple: number;
  pct: number;
}

interface StrategyResult {
  name: string;
  totalPnl: number;
  avgTradePnl: number;
  winRate: number;
  profitFactor: number;
  winners: number;
  losers: number;
  expectancyR: number;
}

interface RReachStats {
  level: number;
  reached: number;
  total: number;
  pct: number;
}

interface Props {
  tabName: string;
  filterParams: string;
}

const PRESET_STRATEGIES: { name: string; description: string; partials: PartialRule[] }[] = [
  { name: "Full Hold (Actual)", description: "100% exits at actual exit price", partials: [] },
  { name: "25% off at 1R", description: "25% at 1R, 75% at actual exit", partials: [{ rMultiple: 1, pct: 25 }] },
  { name: "50% off at 1R", description: "50% at 1R, 50% at actual exit", partials: [{ rMultiple: 1, pct: 50 }] },
  { name: "25% at 1R + 25% at 2R", description: "25% at 1R, 25% at 2R, 50% at actual exit", partials: [{ rMultiple: 1, pct: 25 }, { rMultiple: 2, pct: 25 }] },
  { name: "33% at 1R + 33% at 2R + 34% at 3R", description: "Thirds at 1R/2R/3R — fully scaled out if 3R reached", partials: [{ rMultiple: 1, pct: 33 }, { rMultiple: 2, pct: 33 }, { rMultiple: 3, pct: 34 }] },
  { name: "50% off at 2R", description: "50% at 2R, 50% at actual exit", partials: [{ rMultiple: 2, pct: 50 }] },
  { name: "Exit all at 2R", description: "If 2R reached: 100% at 2R. Otherwise: actual exit", partials: [{ rMultiple: 2, pct: 100 }] },
  { name: "Exit all at 3R", description: "If 3R reached: 100% at 3R. Otherwise: actual exit", partials: [{ rMultiple: 3, pct: 100 }] },
];

function simulateStrategy(
  trades: TradeForAnalysis[],
  partials: PartialRule[]
): StrategyResult & { name: string } {
  const sortedPartials = [...partials].sort((a, b) => a.rMultiple - b.rMultiple);
  let totalPnl = 0;
  let totalRPnl = 0;
  let wins = 0;
  let losses = 0;
  let grossWins = 0;
  let grossLosses = 0;

  for (const trade of trades) {
    const rPerShare = trade.risk / trade.shares;
    const actualPnlPerShare =
      trade.side === "Long"
        ? trade.avgExit - trade.avgEntry
        : trade.avgEntry - trade.avgExit;

    let simPnl: number;

    if (sortedPartials.length === 0) {
      simPnl = trade.pnl;
    } else {
      let remainingPct = 100;
      simPnl = 0;

      for (const partial of sortedPartials) {
        if (trade.maxRBeforeStop >= partial.rMultiple && remainingPct > 0) {
          const takePct = Math.min(partial.pct, remainingPct);
          const partialShares = Math.round(trade.shares * takePct / 100);
          if (partialShares > 0) {
            simPnl += partialShares * partial.rMultiple * rPerShare;
            remainingPct -= takePct;
          }
        }
      }

      if (remainingPct > 0) {
        const remainingShares = Math.round(trade.shares * remainingPct / 100);
        simPnl += remainingShares * actualPnlPerShare;
      }
    }

    totalPnl += simPnl;
    totalRPnl += trade.risk > 0 ? simPnl / trade.risk : 0;

    if (simPnl > 0) {
      wins++;
      grossWins += simPnl;
    } else if (simPnl < 0) {
      losses++;
      grossLosses += Math.abs(simPnl);
    }
  }

  const total = trades.length;
  return {
    name: "",
    totalPnl: Math.round(totalPnl * 100) / 100,
    avgTradePnl: total > 0 ? Math.round((totalPnl / total) * 100) / 100 : 0,
    winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
    profitFactor: grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? 9999 : 0,
    winners: wins,
    losers: losses,
    expectancyR: total > 0 ? Math.round((totalRPnl / total) * 100) / 100 : 0,
  };
}

function computeRReach(trades: TradeForAnalysis[]): RReachStats[] {
  const levels = [1, 2, 3, 4, 5, 6];
  return levels.map((n) => {
    const reached = trades.filter((t) => t.maxRBeforeStop >= n).length;
    return {
      level: n,
      reached,
      total: trades.length,
      pct: trades.length > 0 ? Math.round((reached / trades.length) * 1000) / 10 : 0,
    };
  });
}

function computeRDistribution(trades: TradeForAnalysis[]): { bucket: string; count: number; pct: number }[] {
  const buckets = [
    { label: "< -2R", min: -Infinity, max: -2 },
    { label: "-2R to -1R", min: -2, max: -1 },
    { label: "-1R to 0", min: -1, max: 0 },
    { label: "0 to 1R", min: 0, max: 1 },
    { label: "1R to 2R", min: 1, max: 2 },
    { label: "2R to 3R", min: 2, max: 3 },
    { label: "3R to 5R", min: 3, max: 5 },
    { label: "> 5R", min: 5, max: Infinity },
  ];

  const counts = buckets.map((b) => {
    const count = trades.filter((t) => {
      const rMultiple = t.risk > 0 ? t.pnl / t.risk : 0;
      return rMultiple >= b.min && rMultiple < b.max;
    }).length;
    return { bucket: b.label, count, pct: trades.length > 0 ? Math.round((count / trades.length) * 1000) / 10 : 0 };
  });

  return counts;
}

export default function ProfitabilityAnalysis({ tabName, filterParams }: Props) {
  const [trades, setTrades] = useState<TradeForAnalysis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [customPartials, setCustomPartials] = useState<PartialRule[]>([
    { rMultiple: 1, pct: 25 },
    { rMultiple: 2, pct: 25 },
  ]);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/trade-journal/analysis?tab=${encodeURIComponent(tabName)}${filterParams}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setTrades(data.trades);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load analysis data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [expanded, tabName, filterParams]);

  const strategyResults = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    return PRESET_STRATEGIES.map((s) => ({
      ...simulateStrategy(trades, s.partials),
      name: s.name,
      description: s.description,
    }));
  }, [trades]);

  const customResult = useMemo(() => {
    if (!trades || trades.length === 0) return null;
    const totalPct = customPartials.reduce((s, p) => s + p.pct, 0);
    if (totalPct > 100) return null;
    return { ...simulateStrategy(trades, customPartials), name: "Custom Strategy" };
  }, [trades, customPartials]);

  const rReach = useMemo(() => (trades ? computeRReach(trades) : []), [trades]);
  const rDistribution = useMemo(() => (trades ? computeRDistribution(trades) : []), [trades]);

  const edgeStats = useMemo(() => {
    if (!trades || trades.length === 0) return null;
    const rMultiples = trades.map((t) => t.risk > 0 ? t.pnl / t.risk : 0);
    const avgR = rMultiples.reduce((s, v) => s + v, 0) / rMultiples.length;
    const winRs = rMultiples.filter((r) => r > 0);
    const lossRs = rMultiples.filter((r) => r < 0);
    const avgWinR = winRs.length > 0 ? winRs.reduce((s, v) => s + v, 0) / winRs.length : 0;
    const avgLossR = lossRs.length > 0 ? lossRs.reduce((s, v) => s + v, 0) / lossRs.length : 0;
    return {
      expectancy: Math.round(avgR * 100) / 100,
      avgWinR: Math.round(avgWinR * 100) / 100,
      avgLossR: Math.round(avgLossR * 100) / 100,
      totalTrades: trades.length,
    };
  }, [trades]);

  const maxBarPct = useMemo(() => Math.max(...rDistribution.map((d) => d.pct), 1), [rDistribution]);

  return (
    <div
      className="rounded-lg border space-y-4"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="text-left">
          <p className="text-sm font-semibold">Profitability Analysis</p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Simulate partial-taking strategies and analyze R-multiple distribution
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-6">
          {loading && (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Loading analysis data...</p>
          )}
          {error && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>
          )}

          {trades && trades.length === 0 && (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              No trades with both R (Risk) and Max R Before Stop data. Fill in R values and backfill market data first.
            </p>
          )}

          {trades && trades.length > 0 && edgeStats && (
            <>
              {/* Edge Analysis */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  Edge Analysis ({edgeStats.totalTrades} trades with R + Max R data)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>Expectancy (R)</p>
                    <p className={`font-mono text-lg font-semibold ${edgeStats.expectancy >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                      {edgeStats.expectancy > 0 ? "+" : ""}{edgeStats.expectancy}R
                    </p>
                  </div>
                  <div className="rounded border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>Avg Win (R)</p>
                    <p className="font-mono text-lg font-semibold text-[var(--stat-green)]">
                      +{edgeStats.avgWinR}R
                    </p>
                  </div>
                  <div className="rounded border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>Avg Loss (R)</p>
                    <p className="font-mono text-lg font-semibold text-[var(--stat-red)]">
                      {edgeStats.avgLossR}R
                    </p>
                  </div>
                </div>
              </div>

              {/* R-Multiple Reach */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  R-Multiple Reach Rate
                </h3>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  What % of your trades reached each R-multiple before the stop was hit?
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {rReach.map((r) => (
                    <div key={r.level} className="rounded border px-2 py-2 text-center" style={{ borderColor: "var(--color-border)" }}>
                      <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>{r.level}R</p>
                      <p className={`font-mono text-sm font-semibold ${r.pct >= 50 ? "text-[var(--stat-green)]" : r.pct >= 25 ? "text-[var(--color-text)]" : "text-[var(--stat-red)]"}`}>
                        {r.pct}%
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {r.reached}/{r.total}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* R-Multiple Distribution */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  R-Multiple Distribution (Actual)
                </h3>
                <div className="space-y-1">
                  {rDistribution.map((d) => (
                    <div key={d.bucket} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-right font-mono" style={{ color: "var(--color-muted)" }}>{d.bucket}</span>
                      <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${(d.pct / maxBarPct) * 100}%`,
                            backgroundColor: d.bucket.startsWith("-") || d.bucket.startsWith("<")
                              ? "var(--stat-red)"
                              : "var(--stat-green)",
                            minWidth: d.count > 0 ? "2px" : "0",
                          }}
                        />
                      </div>
                      <span className="w-10 font-mono" style={{ color: "var(--color-muted)" }}>
                        {d.count}
                      </span>
                      <span className="w-12 font-mono text-right" style={{ color: "var(--color-muted)" }}>
                        {d.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy Simulation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  Partial-Taking Strategy Simulation
                </h3>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  How would different partial-taking plans have impacted your P&L? Uses Max R Before Stop to determine which R-levels were reachable (order-aware).
                </p>
                <div className="overflow-x-auto rounded border" style={{ borderColor: "var(--color-border)" }}>
                  <table className="w-full text-left text-sm">
                    <thead
                      className="border-b text-xs uppercase"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)", color: "var(--color-muted)" }}
                    >
                      <tr>
                        <th className="px-3 py-2">Strategy</th>
                        <th className="px-3 py-2 text-right">Total P&L</th>
                        <th className="px-3 py-2 text-right">Avg Trade</th>
                        <th className="px-3 py-2 text-center">Win Rate</th>
                        <th className="px-3 py-2 text-center">PF</th>
                        <th className="px-3 py-2 text-center">Exp (R)</th>
                        <th className="px-3 py-2 text-right">vs Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strategyResults.map((s, i) => {
                        const baseline = strategyResults[0]?.totalPnl ?? 0;
                        const diff = s.totalPnl - baseline;
                        return (
                          <tr
                            key={s.name}
                            className="border-b hover:opacity-90"
                            style={{
                              borderColor: "var(--color-border)",
                              backgroundColor: i === 0 ? "color-mix(in srgb, var(--color-accent) 6%, transparent)" : "transparent",
                            }}
                          >
                            <td className="px-3 py-2">
                              <div className="text-sm font-medium">{s.name}</div>
                              <div className="text-xs" style={{ color: "var(--color-muted)" }}>{s.description}</div>
                            </td>
                            <td className={`px-3 py-2 text-right font-mono font-semibold ${s.totalPnl >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                              ${s.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`px-3 py-2 text-right font-mono ${s.avgTradePnl >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                              ${s.avgTradePnl.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center font-mono">{s.winRate}%</td>
                            <td className="px-3 py-2 text-center font-mono">
                              {s.profitFactor >= 9999 ? "∞" : s.profitFactor.toFixed(2)}
                            </td>
                            <td className={`px-3 py-2 text-center font-mono ${s.expectancyR >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                              {s.expectancyR > 0 ? "+" : ""}{s.expectancyR}R
                            </td>
                            <td className={`px-3 py-2 text-right font-mono ${i === 0 ? "" : diff >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                              {i === 0 ? "—" : `${diff >= 0 ? "+" : ""}$${diff.toFixed(2)}`}
                            </td>
                          </tr>
                        );
                      })}
                      {customResult && (
                        <tr
                          className="border-t-2"
                          style={{ borderColor: "var(--color-accent)" }}
                        >
                          <td className="px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                            Custom Strategy
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${customResult.totalPnl >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                            ${customResult.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono ${customResult.avgTradePnl >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                            ${customResult.avgTradePnl.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">{customResult.winRate}%</td>
                          <td className="px-3 py-2 text-center font-mono">
                            {customResult.profitFactor >= 9999 ? "∞" : customResult.profitFactor.toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 text-center font-mono ${customResult.expectancyR >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}`}>
                            {customResult.expectancyR > 0 ? "+" : ""}{customResult.expectancyR}R
                          </td>
                          <td className={`px-3 py-2 text-right font-mono ${
                            customResult.totalPnl - (strategyResults[0]?.totalPnl ?? 0) >= 0
                              ? "text-[var(--stat-green)]"
                              : "text-[var(--stat-red)]"
                          }`}>
                            {(() => {
                              const d = customResult.totalPnl - (strategyResults[0]?.totalPnl ?? 0);
                              return `${d >= 0 ? "+" : ""}$${d.toFixed(2)}`;
                            })()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Custom Strategy Builder */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  Custom Strategy Builder
                </h3>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Define your own partial-taking rules. Total % must not exceed 100%. Remainder exits at actual exit price.
                </p>
                <div className="space-y-2">
                  {customPartials.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--color-muted)" }}>Take</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={p.pct}
                        onChange={(e) => {
                          const next = [...customPartials];
                          next[i] = { ...next[i], pct: parseInt(e.target.value) || 0 };
                          setCustomPartials(next);
                        }}
                        className="w-16 rounded border px-2 py-1 text-xs font-mono text-center focus:outline-none"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--color-muted)" }}>% off at</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        value={p.rMultiple}
                        onChange={(e) => {
                          const next = [...customPartials];
                          next[i] = { ...next[i], rMultiple: parseFloat(e.target.value) || 1 };
                          setCustomPartials(next);
                        }}
                        className="w-16 rounded border px-2 py-1 text-xs font-mono text-center focus:outline-none"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
                      />
                      <span className="text-xs" style={{ color: "var(--color-muted)" }}>R</span>
                      {customPartials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCustomPartials(customPartials.filter((_, j) => j !== i))}
                          className="text-xs hover:opacity-80"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {customPartials.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setCustomPartials([...customPartials, { rMultiple: customPartials.length + 1, pct: 25 }])}
                      className="rounded border px-2 py-1 text-xs hover:opacity-80"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                    >
                      + Add Level
                    </button>
                  )}
                  {customPartials.reduce((s, p) => s + p.pct, 0) > 100 && (
                    <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                      Total exceeds 100% — reduce partial sizes.
                    </p>
                  )}
                  {customPartials.reduce((s, p) => s + p.pct, 0) < 100 && (
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {100 - customPartials.reduce((s, p) => s + p.pct, 0)}% of position exits at actual exit price.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
