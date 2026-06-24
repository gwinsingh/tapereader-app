"use client";

import { useState, useEffect, useCallback } from "react";

interface PlanRow {
  symbol: string;
  conviction: string;
  thesis: string;
  source: string;
}

const SEED_SYMBOLS = ["QQQ", "SPY"];

function todayStr(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function emptyRow(symbol = "", source = "Watchlist"): PlanRow {
  return { symbol, conviction: "", thesis: "", source };
}

function seededRows(): PlanRow[] {
  return SEED_SYMBOLS.map((s) => emptyRow(s));
}

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

  const inputStyle = {
    borderColor: "var(--color-border)",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Morning Plan</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Pre-qualify your names before the open. Conviction and origin set here auto-fill
            onto matching trades at upload — so you never have to log conviction at the open.
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

      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        <div
          className="grid items-center gap-2 px-3 py-2 text-xs font-semibold"
          style={{ gridTemplateColumns: "1.4fr 1fr 3fr 1.4fr 0.4fr", color: "var(--color-muted)", borderBottom: "1px solid var(--color-border)" }}
        >
          <span>Symbol</span>
          <span>Conviction</span>
          <span>Thesis</span>
          <span>Origin</span>
          <span />
        </div>

        {rows.map((row, i) => (
          <div
            key={i}
            className="grid items-center gap-2 px-3 py-2"
            style={{ gridTemplateColumns: "1.4fr 1fr 3fr 1.4fr 0.4fr", borderBottom: "1px solid var(--color-border)" }}
          >
            <input
              type="text"
              value={row.symbol}
              onChange={(e) => updateRow(i, { symbol: e.target.value.toUpperCase() })}
              placeholder="TICKER"
              className="rounded border py-1.5 px-2 text-sm uppercase focus:outline-none"
              style={inputStyle}
            />
            <select
              value={row.conviction}
              onChange={(e) => updateRow(i, { conviction: e.target.value })}
              className="rounded border py-1.5 px-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="">—</option>
              <option value="1">1 (low)</option>
              <option value="2">2 (med)</option>
              <option value="3">3 (high)</option>
            </select>
            <input
              type="text"
              value={row.thesis}
              onChange={(e) => updateRow(i, { thesis: e.target.value })}
              placeholder="Why it's in play (fresh catalyst / 1H range near key daily level)…"
              className="rounded border py-1.5 px-2 text-sm focus:outline-none"
              style={inputStyle}
            />
            <select
              value={row.source}
              onChange={(e) => updateRow(i, { source: e.target.value })}
              className="rounded border py-1.5 px-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="Watchlist">Watchlist</option>
              <option value="Callout">Callout</option>
            </select>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--color-muted)" }}
              aria-label="Remove row"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="w-full py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--color-accent)" }}
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
      </p>
    </div>
  );
}
