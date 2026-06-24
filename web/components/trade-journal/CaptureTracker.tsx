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

interface Props {
  tabName: string;
  filterParams: string;
}

const TARGET_KEY = "pct-capture-target";
const DEFAULT_TARGET = 2.5;

// ISO week key (Monday-anchored), e.g. "2026-06-15".
function weekKey(date: string): string {
  const dt = new Date(date + "T00:00:00Z");
  const dow = (dt.getUTCDay() + 6) % 7; // Mon=0
  dt.setUTCDate(dt.getUTCDate() - dow);
  return dt.toISOString().slice(0, 10);
}

function fmt(n: number, d = 2): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(d);
}

export default function CaptureTracker({ tabName, filterParams }: Props) {
  const [trades, setTrades] = useState<TradeForAnalysis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [target, setTarget] = useState<number>(DEFAULT_TARGET);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(TARGET_KEY) : null;
    if (stored) {
      const n = parseFloat(stored);
      if (!isNaN(n) && n > 0) setTarget(n);
    }
  }, []);

  function updateTarget(n: number) {
    setTarget(n);
    if (typeof window !== "undefined" && n > 0) window.localStorage.setItem(TARGET_KEY, String(n));
  }

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
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load capture data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [expanded, tabName, filterParams]);

  const rows = useMemo(() => {
    if (!trades) return [];
    return trades
      .filter((t) => t.risk > 0)
      .map((t) => ({
        date: t.date,
        symbol: t.symbol,
        realizedR: t.pnl / t.risk,
        mfe: t.maxRBeforeStop,
      }));
  }, [trades]);

  const metrics = useMemo(() => {
    if (rows.length === 0) return null;
    const reachers = rows.filter((r) => r.mfe >= target);
    const capturedR = reachers.map((r) => Math.min(r.realizedR, target));
    const targetCapturePct = reachers.length
      ? (capturedR.reduce((s, v) => s + v, 0) / reachers.length) / target * 100
      : null;
    const rLeftOnTable = reachers.reduce((s, r) => s + Math.max(0, target - r.realizedR), 0);

    const winners = rows.filter((r) => r.realizedR > 0);
    const sumWinReal = winners.reduce((s, r) => s + r.realizedR, 0);
    const sumWinMfe = winners.reduce((s, r) => s + r.mfe, 0);
    const mfeCapturePct = sumWinMfe > 0 ? sumWinReal / sumWinMfe * 100 : null;

    // Weekly trend of target capture %
    const byWeek = new Map<string, { reachers: number; captured: number }>();
    for (const r of reachers) {
      const k = weekKey(r.date);
      const cur = byWeek.get(k) || { reachers: 0, captured: 0 };
      cur.reachers += 1;
      cur.captured += Math.min(r.realizedR, target);
      byWeek.set(k, cur);
    }
    const weekly = Array.from(byWeek.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([wk, v]) => ({ wk, pct: (v.captured / v.reachers) / target * 100, n: v.reachers }));

    return {
      total: rows.length,
      reachers,
      reachCount: reachers.length,
      targetCapturePct,
      rLeftOnTable,
      mfeCapturePct,
      weekly,
    };
  }, [rows, target]);

  // Scale for the per-trade bars: cap the axis a bit above target/MFE for readability.
  const axisMax = useMemo(() => {
    if (!metrics) return target * 2;
    const maxMfe = Math.max(target, ...metrics.reachers.map((r) => r.mfe));
    return Math.min(maxMfe, target * 2.5);
  }, [metrics, target]);

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
          <p className="text-sm font-semibold">Capture / Trail-Leak Tracker</p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            How much of your {fmt(target, 1)}R target you actually realize on trades that reach it
          </p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-6">
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                Target (R)
              </label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={target}
                onChange={(e) => updateTarget(parseFloat(e.target.value) || DEFAULT_TARGET)}
                className="w-24 rounded border py-1.5 px-2 text-sm focus:outline-none"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
            <p className="pb-1 text-xs" style={{ color: "var(--color-muted)" }}>
              Saved on this device.
            </p>
          </div>

          {loading && <p className="text-xs" style={{ color: "var(--color-muted)" }}>Loading capture data…</p>}
          {error && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}

          {trades && rows.length === 0 && (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              No trades with both R (Risk) and Max R Before Stop data. Fill in R values and backfill market data first.
            </p>
          )}

          {metrics && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi
                  label={`Target capture (≥${fmt(target, 1)}R reachers)`}
                  value={metrics.targetCapturePct == null ? "—" : `${fmt(metrics.targetCapturePct, 0)}%`}
                  hint={`${metrics.reachCount} of ${metrics.total} trades reached ${fmt(target, 1)}R`}
                  accent={
                    metrics.targetCapturePct == null
                      ? "var(--color-muted)"
                      : metrics.targetCapturePct >= 80
                        ? "var(--color-accent)"
                        : metrics.targetCapturePct >= 60
                          ? "var(--color-warning, #d97706)"
                          : "var(--color-danger)"
                  }
                />
                <Kpi
                  label="R left on table"
                  value={fmt(metrics.rLeftOnTable, 1) + "R"}
                  hint="vs. holding every reacher to target"
                  accent="var(--color-danger)"
                />
                <Kpi
                  label="MFE capture (winners)"
                  value={metrics.mfeCapturePct == null ? "—" : `${fmt(metrics.mfeCapturePct, 0)}%`}
                  hint="realized R ÷ peak open R"
                  accent="var(--color-text)"
                />
                <Kpi
                  label="Reach rate"
                  value={`${fmt(metrics.total ? metrics.reachCount / metrics.total * 100 : 0, 0)}%`}
                  hint={`hit ${fmt(target, 1)}R of open profit`}
                  accent="var(--color-text)"
                />
              </div>

              {metrics.weekly.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                    Weekly target capture %
                  </p>
                  <div className="flex items-end gap-2" style={{ height: 90 }}>
                    {metrics.weekly.map((w) => (
                      <div key={w.wk} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${w.wk}: ${fmt(w.pct, 0)}% over ${w.n} reachers`}>
                        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{fmt(w.pct, 0)}%</span>
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${Math.max(2, Math.min(100, w.pct))}%`,
                            backgroundColor: w.pct >= 80 ? "var(--color-accent)" : w.pct >= 60 ? "var(--color-warning, #d97706)" : "var(--color-danger)",
                          }}
                        />
                        <span className="text-[9px]" style={{ color: "var(--color-muted)" }}>{w.wk.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metrics.reachers.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                    Trades that reached {fmt(target, 1)}R — realized (bar) vs target (dashed) vs MFE (▲)
                  </p>
                  <div className="space-y-1.5">
                    {metrics.reachers
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((r, i) => {
                        const realizedPct = Math.max(0, Math.min(100, r.realizedR / axisMax * 100));
                        const targetPct = Math.min(100, target / axisMax * 100);
                        const mfePct = Math.min(100, r.mfe / axisMax * 100);
                        const good = r.realizedR >= target * 0.9;
                        return (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            <span className="w-28 shrink-0 truncate" style={{ color: "var(--color-muted)" }}>
                              {r.date.slice(5)} {r.symbol}
                            </span>
                            <div className="relative h-4 flex-1 rounded" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div
                                className="absolute left-0 top-0 h-full rounded"
                                style={{
                                  width: `${realizedPct}%`,
                                  backgroundColor: good ? "var(--color-accent)" : r.realizedR <= 0 ? "var(--color-danger)" : "var(--color-warning, #d97706)",
                                }}
                              />
                              <div
                                className="absolute top-0 h-full"
                                style={{ left: `${targetPct}%`, borderLeft: "1px dashed var(--color-text)", opacity: 0.6 }}
                              />
                              <div
                                className="absolute -top-0.5 text-[9px]"
                                style={{ left: `calc(${mfePct}% - 4px)`, color: "var(--color-muted)" }}
                              >
                                ▲
                              </div>
                            </div>
                            <span className="w-10 shrink-0 text-right" style={{ color: good ? "var(--color-accent)" : "var(--color-text)" }}>
                              {fmt(r.realizedR, 1)}R
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                <strong>Target capture</strong> is the fraction of your {fmt(target, 1)}R target you actually
                bank on trades whose peak open profit (MFE / Max R Before Stop) reached it — it isolates the
                trail leak from trades that simply failed early. <strong>R left on table</strong> is how much
                more you&apos;d have made holding every reacher to target. Watch the weekly bars climb as you
                loosen the trail.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
    >
      <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-muted)" }}>{hint}</p>
    </div>
  );
}
