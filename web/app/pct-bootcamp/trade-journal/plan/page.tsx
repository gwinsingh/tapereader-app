"use client";

import { useState, useEffect, useCallback } from "react";

interface PlanRow {
  symbol: string;
  conviction: string;
  thesis: string;
  catalyst: string;
  l2Bias: string;
  dailyTrend: string;
  dailyConv: string;
  hourlyTrend: string;
  hourlyConv: string;
  fiveMinTrend: string;
  fiveMinConv: string;
}

const SEED_SYMBOLS = ["QQQ", "SPY"];

// Mirrors CATALYST_OPTIONS in lib/trade-journal/google-sheets.ts (kept in sync).
const CATALYST_OPTIONS = [
  "Earnings/News",
  "Upgrade/Downgrade",
  "FDA/Regulatory",
  "Sector Momentum",
  "Gap Only",
  "Key Daily Level",
  "Day 2",
  "Pullback to DEMA",
  "Other",
];

// Mirrors MARKET_BIAS_OPTIONS in lib/trade-journal/google-sheets.ts (kept in sync).
const BIAS_OPTIONS = ["Bullish", "Bearish", "Neutral"];

// Per-timeframe read: direction (trend) + strength (conviction 1-3).
const TF_ROWS: { label: string; trendKey: keyof PlanRow; convKey: keyof PlanRow }[] = [
  { label: "Daily", trendKey: "dailyTrend", convKey: "dailyConv" },
  { label: "Hourly", trendKey: "hourlyTrend", convKey: "hourlyConv" },
  { label: "5min", trendKey: "fiveMinTrend", convKey: "fiveMinConv" },
];

function todayStr(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function emptyRow(symbol = ""): PlanRow {
  return {
    symbol, conviction: "", thesis: "", catalyst: "", l2Bias: "",
    dailyTrend: "", dailyConv: "", hourlyTrend: "", hourlyConv: "", fiveMinTrend: "", fiveMinConv: "",
  };
}

function seededRows(): PlanRow[] {
  return SEED_SYMBOLS.map((s) => emptyRow(s));
}

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-text)",
};

export default function MorningPlanPage() {
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState<PlanRow[]>(seededRows());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback((d: string) => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStatus(null);
    fetch(`/api/trade-journal/plan?date=${encodeURIComponent(d)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        const entries: PlanRow[] = data.entries || [];
        if (entries.length > 0) {
          // Ensure QQQ/SPY are present even if a saved plan omitted them.
          const have = new Set(entries.map((e) => e.symbol.toUpperCase()));
          const seeds = SEED_SYMBOLS.filter((s) => !have.has(s)).map((s) => emptyRow(s));
          setRows([...seeds, ...entries]);
        } else {
          setRows(seededRows());
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load plan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = loadPlan(date);
    return cleanup;
  }, [date, loadPlan]);

  function updateRow(i: number, patch: Partial<PlanRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setStatus(null);
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setStatus(null);
    // Dedup by symbol (uppercased), keep last; drop blank-symbol rows.
    const bySym = new Map<string, PlanRow>();
    for (const r of rows) {
      const sym = r.symbol.trim().toUpperCase();
      if (!sym) continue;
      bySym.set(sym, { ...r, symbol: sym });
    }
    const entries = Array.from(bySym.values());
    try {
      const res = await fetch("/api/trade-journal/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setStatus(`Saved ${data.count} name${data.count === 1 ? "" : "s"} for ${date}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Morning Plan</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Pre-qualify your names before the open. Conviction, catalyst, L2 bias and your
            multi-timeframe read set here auto-fill onto matching trades at upload (tagged
            <strong> Watchlist</strong>) — so you never log them at the open, when emotions run high.
          </p>
        </div>
        <a
          href="/pct-bootcamp/trade-journal"
          className="shrink-0 rounded border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          &laquo; Trade Journal
        </a>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>
            Plan date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="cursor-pointer rounded border py-1.5 px-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        {loading && (
          <span className="pb-2 text-xs" style={{ color: "var(--color-muted)" }}>Loading…</span>
        )}
      </div>

      {error && (
        <div
          className="rounded border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, i) => (
          <PlanCard
            key={i}
            row={row}
            onChange={(patch) => updateRow(i, patch)}
            onRemove={() => removeRow(i)}
          />
        ))}
        <button
          type="button"
          onClick={addRow}
          className="w-full rounded-lg border border-dashed py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ borderColor: "var(--color-border)", color: "var(--color-accent)" }}
        >
          + Add name
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          {saving ? "Saving…" : "Save plan"}
        </button>
        {status && (
          <span className="text-sm" style={{ color: "var(--color-accent)" }}>{status}</span>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        QQQ and SPY are seeded by default. Names not on the plan are tagged
        <strong> Intraday discovery </strong> automatically when their trades are uploaded.
        Trend = direction per chart (Bull/Bear/Neutral); Str = 1–3 conviction on that timeframe.
      </p>
    </div>
  );
}

function PlanCard({ row, onChange, onRemove }: {
  row: PlanRow;
  onChange: (patch: Partial<PlanRow>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="rounded-lg border p-3 space-y-3"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
    >
      {/* Top line: symbol, overall conviction, L2 bias, remove */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Symbol">
          <input
            type="text"
            value={row.symbol}
            onChange={(e) => onChange({ symbol: e.target.value.toUpperCase() })}
            placeholder="TICKER"
            className="w-28 rounded border py-1.5 px-2 text-sm uppercase font-semibold focus:outline-none"
            style={inputStyle}
          />
        </Field>
        <Field label="Conviction">
          <ConvSelect value={row.conviction} onChange={(v) => onChange({ conviction: v })} />
        </Field>
        <Field label="L2 Bias">
          <BiasSelect value={row.l2Bias} onChange={(v) => onChange({ l2Bias: v })} />
        </Field>
        <div className="ml-auto">
          <button
            type="button"
            onClick={onRemove}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--color-muted)" }}
            aria-label="Remove name"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Multi-timeframe read */}
      <div
        className="rounded-md border p-2"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
      >
        <p className="mb-1.5 text-[11px] font-semibold" style={{ color: "var(--color-muted)" }}>
          Multi-timeframe read
        </p>
        <div className="space-y-1.5">
          {TF_ROWS.map((tf) => (
            <div key={tf.label} className="flex items-center gap-2">
              <span className="w-14 text-xs" style={{ color: "var(--color-muted)" }}>{tf.label}</span>
              <BiasSelect value={row[tf.trendKey]} onChange={(v) => onChange({ [tf.trendKey]: v })} />
              <ConvSelect value={row[tf.convKey]} onChange={(v) => onChange({ [tf.convKey]: v })} />
            </div>
          ))}
        </div>
      </div>

      {/* Thesis + catalyst */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Thesis" className="min-w-[16rem] flex-1">
          <input
            type="text"
            value={row.thesis}
            onChange={(e) => onChange({ thesis: e.target.value })}
            placeholder="Why it's in play (fresh catalyst / 1H range near key daily level)…"
            className="w-full rounded border py-1.5 px-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </Field>
        <Field label="Catalyst">
          <select
            value={row.catalyst}
            onChange={(e) => onChange({ catalyst: e.target.value })}
            className="rounded border py-1.5 px-2 text-sm focus:outline-none"
            style={inputStyle}
          >
            <option value="">—</option>
            {CATALYST_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--color-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function BiasSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border py-1.5 px-2 text-sm focus:outline-none"
      style={inputStyle}
      title="Trend / direction"
    >
      <option value="">—</option>
      {BIAS_OPTIONS.map((b) => (
        <option key={b} value={b}>{b}</option>
      ))}
    </select>
  );
}

function ConvSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border py-1.5 px-2 text-sm focus:outline-none"
      style={inputStyle}
      title="Conviction / strength"
    >
      <option value="">—</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
  );
}
