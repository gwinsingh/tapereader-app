"use client";

// Morning Intel — read-only panels on the Morning Plan page: the trader's
// Obsidian Morning Brief and the Relative Strength lists, both published to the
// sheet by the local `scripts/rs/run.js` and served by
// /api/trade-journal/morning-intel. "Add to plan" only pre-fills the plan form
// (via onAddToPlan); saving stays with the page's own Save button.

import { useEffect, useMemo, useState } from "react";
import BriefMarkdown from "./BriefMarkdown";
import type {
  BriefPayload,
  IntelListName,
  RsChart,
  RsGroup,
  RsItem,
  RsPayload,
} from "@/lib/trade-journal/morning-intel";

export interface IntelPlanPatch {
  symbol: string;
  catalyst: string;
  thesis: string;
  dailyTrend: string;
}

const BRIEF_OPEN_KEY = "pct-mi-brief-open";
const STALE_DAYS = 4;
const UP_STROKE = "var(--color-text)";
const DOWN = "#e53935";
const RS_BLUE = "#3A90DB";

const TABS: { key: IntelListName; label: string }[] = [
  { key: "leaders", label: "Leaders" },
  { key: "day2", label: "Day 2" },
  { key: "day3", label: "Day 3" },
  { key: "weakest", label: "Weakest" },
];

const panelStyle = { borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" } as const;
const muted = { color: "var(--color-muted)" } as const;

function todayLocal(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number | null {
  const a = Date.parse(fromIso + "T00:00:00Z");
  const b = Date.parse(toIso + "T00:00:00Z");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

function fmtWhen(iso: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function fmtPx(n: number | null): string {
  if (n == null) return "—";
  return n >= 1000 ? n.toFixed(0) : n.toFixed(2);
}

function fmtScore(n: number | null): string {
  return n == null ? "—" : String(Math.round(n));
}

// ── Add-to-plan mapping ──────────────────────────────────────────────────────

function day1Type(why: string): string {
  const m = why.match(/gap[- ]and[- ]go|intraday trend|reversal/i);
  return m ? m[0].toLowerCase() : "";
}

function inMovingGroup(item: RsItem, groups: RsGroup[]): boolean {
  const g = item.group.trim().toLowerCase();
  return groups.some(
    (gr) =>
      (g && gr.theme.trim().toLowerCase() === g) ||
      gr.reps.includes(item.symbol) ||
      gr.also.toUpperCase().split(/[\s,]+/).includes(item.symbol)
  );
}

export function planPatchFor(item: RsItem, groups: RsGroup[]): IntelPlanPatch {
  const why = item.why.trim();
  const score = item.score != null ? ` (score ${Math.round(item.score)})` : "";
  const side = item.side === "short" ? "short" : item.side === "long" ? "long" : "";
  let catalyst = "Other";
  let thesis = why;
  switch (item.list) {
    case "day2": {
      catalyst = "Day 2";
      const t = day1Type(why);
      thesis = `Day 2${side ? " " + side : ""}${t ? ` (${t})` : ""}: ${why}`;
      break;
    }
    case "day3": {
      catalyst = "Day 2";
      const core = why.replace(/[\s·,;:—–-]*smaller size than Day 2\.?\s*$/i, "").trim();
      thesis = `Day 3 — smaller size than Day 2: ${core}`;
      break;
    }
    case "leaders":
      catalyst = inMovingGroup(item, groups) ? "Sector Momentum" : "Key Daily Level";
      thesis = `RS leader${score}: ${why}`;
      break;
    case "weakest":
      catalyst = "Other";
      thesis = `RS weakest${score}: ${why}`;
      break;
  }
  return {
    symbol: item.symbol,
    catalyst,
    thesis: thesis.replace(/:\s*$/, ""),
    dailyTrend: side === "long" ? "Bullish" : side === "short" ? "Bearish" : "",
  };
}

// ── component ────────────────────────────────────────────────────────────────

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; brief: BriefPayload | null; rs: RsPayload | null };

export default function MorningIntel({
  planSymbols,
  onAddToPlan,
  disabled = false,
}: {
  planSymbols: string[];
  onAddToPlan: (patch: IntelPlanPatch) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trade-journal/morning-intel", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        if (cancelled) return;
        if (!res.ok || data.error) {
          setState({ status: "error", error: String(data.error || `HTTP ${res.status}`) });
        } else {
          setState({ status: "ready", brief: data.brief ?? null, rs: data.rs ?? null });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: err instanceof Error ? err.message : "Network error" });
      });
    return () => { cancelled = true; };
  }, []);

  const inPlan = useMemo(
    () => new Set(planSymbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
    [planSymbols]
  );

  if (state.status === "loading") {
    return <p className="text-xs" style={muted}>Loading morning intel…</p>;
  }
  if (state.status === "error") {
    return (
      <p className="text-xs" style={muted}>
        Morning intel unavailable right now ({state.error}). The plan form below still works.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <BriefPanel brief={state.brief} />
      <RsPanel rs={state.rs} inPlan={inPlan} onAddToPlan={onAddToPlan} disabled={disabled} />
    </div>
  );
}

// ── Morning Brief panel ──────────────────────────────────────────────────────

function BriefPanel({ brief }: { brief: BriefPayload | null }) {
  const [open, setOpen] = useState<boolean | null>(null);

  // Restore after mount (localStorage / viewport are client-only).
  useEffect(() => {
    let v: boolean | null = null;
    try {
      const s = window.localStorage.getItem(BRIEF_OPEN_KEY);
      if (s === "1") v = true;
      else if (s === "0") v = false;
    } catch { /* storage blocked */ }
    if (v == null) v = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 768px)").matches : true;
    setOpen(v);
  }, []);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      try { window.localStorage.setItem(BRIEF_OPEN_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  if (!brief || brief.sections.length === 0) {
    return <p className="text-xs" style={muted}>Morning brief not published yet.</p>;
  }

  const today = todayLocal();
  const old = brief.date && brief.date < today;
  const isOpen = open === true;

  return (
    <div className="rounded-lg border" style={panelStyle}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2.5 text-left"
      >
        <span className="text-xs" style={muted} aria-hidden>{isOpen ? "▾" : "▸"}</span>
        <span className="text-sm font-semibold">Morning Brief</span>
        {brief.generatedAt && (
          <span className="text-[11px]" style={muted}>updated {fmtWhen(brief.generatedAt)}</span>
        )}
        {old && (
          <span className="text-[11px] italic" style={muted}>· from {brief.date}</span>
        )}
      </button>
      {isOpen && (
        <div className="space-y-4 border-t px-3 pb-3 pt-2" style={{ borderColor: "var(--color-border)" }}>
          {brief.sections.map((s, i) => (
            <section key={`${s.order}-${i}`} className="min-w-0">
              {s.title && (
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
                  {s.title}
                </h3>
              )}
              <BriefMarkdown markdown={s.markdown} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Relative Strength panel ──────────────────────────────────────────────────

function RsPanel({ rs, inPlan, onAddToPlan, disabled }: {
  rs: RsPayload | null;
  inPlan: Set<string>;
  onAddToPlan: (patch: IntelPlanPatch) => void;
  disabled: boolean;
}) {
  const [tab, setTab] = useState<IntelListName>("leaders");
  const [showNext, setShowNext] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(null), 4000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const total = rs ? Object.values(rs.lists).reduce((n, l) => n + l.length, 0) : 0;
  if (!rs || (total === 0 && !rs.regime && rs.groups.length === 0)) {
    return (
      <p className="text-xs" style={muted}>
        RS lists not published yet{rs?.dataThrough ? ` — data through ${rs.dataThrough}` : ""}.
      </p>
    );
  }

  const today = todayLocal();
  const age = rs.dataThrough ? daysBetween(rs.dataThrough, today) : null;
  const stale = age != null && age > STALE_DAYS;
  const items = rs.lists[tab];
  const focus = items.filter((x) => x.tier === "focus");
  const next = items.filter((x) => x.tier !== "focus");

  function add(item: RsItem) {
    onAddToPlan(planPatchFor(item, rs!.groups));
    setJustAdded(item.symbol);
  }

  return (
    <div className="rounded-lg border p-3 space-y-3" style={panelStyle}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-sm font-semibold">Relative Strength</span>
        <span className="text-[11px]" style={muted}>
          {rs.dataThrough && <>data through {rs.dataThrough}</>}
          {rs.generatedAt && <> · run {fmtWhen(rs.generatedAt)}</>}
        </span>
      </div>

      {stale && (
        <p className="text-[11px] italic" style={muted}>
          Stale — the RS data is {age} days old (through {rs.dataThrough}). Re-run the local RS script before trusting these lists.
        </p>
      )}

      {rs.regime && (
        <div className="rounded-md border px-3 py-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}>
          {rs.regime.label && <p className="text-sm font-semibold">{rs.regime.label}</p>}
          {rs.regime.summary && <p className="mt-0.5 text-xs leading-relaxed">{rs.regime.summary}</p>}
          {(rs.regime.breadth || rs.regime.nLeaders != null) && (
            <p className="mt-1 text-[11px]" style={muted}>
              {rs.regime.breadth}
              {rs.regime.breadth && rs.regime.nLeaders != null ? " · " : ""}
              {rs.regime.nLeaders != null ? `${rs.regime.nLeaders} leaders qualified` : ""}
            </p>
          )}
        </div>
      )}

      {rs.groups.length > 0 && (
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={muted}>Groups moving</p>
          {rs.groups.map((g, i) => (
            <p key={i} className="text-xs leading-relaxed">
              <SideBadge side={g.side} />{" "}
              <strong>{g.theme || "Group"}</strong>
              {g.reps.length > 0 && <>: {g.reps.join(", ")} lead</>}
              {g.also && <span style={muted}> · also moving: {g.also}</span>}
            </p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b" style={{ borderColor: "var(--color-border)" }} role="tablist">
        {TABS.map((t) => {
          const active = t.key === tab;
          const n = rs.lists[t.key].length;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { setTab(t.key); setShowNext(false); }}
              className="-mb-px shrink-0 border-b-2 px-2.5 py-1.5 text-xs font-medium"
              style={{
                borderColor: active ? "var(--color-accent)" : "transparent",
                color: active ? "var(--color-text)" : "var(--color-muted)",
              }}
            >
              {t.label} <span className="text-[10px]" style={muted}>({n})</span>
            </button>
          );
        })}
      </div>

      {justAdded && (
        <p className="text-xs" style={{ color: "var(--color-accent)" }} role="status">
          {justAdded} added to the plan below — remember to Save.
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-xs" style={muted}>Nothing on this list today.</p>
      ) : (
        <>
          {focus.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {focus.map((it) => (
                <FocusCard
                  key={`${it.list}-${it.symbol}`}
                  item={it}
                  inPlan={inPlan.has(it.symbol)}
                  onAdd={() => add(it)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
          {next.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowNext((s) => !s)}
                aria-expanded={showNext}
                className="text-xs font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                {showNext ? "▾" : "▸"} Next up ({next.length})
              </button>
              {showNext && (
                <ul className="mt-1.5 divide-y rounded-md border" style={{ borderColor: "var(--color-border)" }}>
                  {next.map((it) => (
                    <li
                      key={`${it.list}-${it.symbol}`}
                      className="flex items-start gap-2 px-2 py-1.5 text-xs"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold">{it.symbol}</span>{" "}
                        <SideBadge side={it.side} />
                        {it.group && <span style={muted}> · {it.group}</span>}
                        <span style={muted}> · {fmtScore(it.score)}</span>
                        {it.why && <p className="mt-0.5 leading-snug" style={muted}>{it.why}</p>}
                      </div>
                      <AddButton inPlan={inPlan.has(it.symbol)} onAdd={() => add(it)} disabled={disabled} compact />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SideBadge({ side }: { side: string }) {
  if (side !== "long" && side !== "short") return null;
  const color = side === "long" ? "var(--color-accent)" : "var(--color-danger)";
  return (
    <span
      className="inline-block rounded border px-1 text-[10px] font-semibold uppercase leading-4 align-middle"
      style={{ borderColor: color, color }}
    >
      {side}
    </span>
  );
}

function AddButton({ inPlan, onAdd, disabled, compact = false }: {
  inPlan: boolean;
  onAdd: () => void;
  disabled: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      title={inPlan ? "Already a card in the plan — fills only its empty fields" : "Pre-fill a plan card (not saved until you press Save)"}
      className={`shrink-0 rounded border font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
      style={
        inPlan
          ? { borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "transparent" }
          : { borderColor: "var(--color-accent)", color: "var(--color-accent)", backgroundColor: "transparent" }
      }
    >
      {inPlan ? "In plan ✓" : "Add to plan"}
    </button>
  );
}

function FocusCard({ item, inPlan, onAdd, disabled }: {
  item: RsItem;
  inPlan: boolean;
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <div className="min-w-0 rounded-md border p-2.5 space-y-1.5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-base font-bold leading-tight">{item.symbol}</span>
            <SideBadge side={item.side} />
            <span className="text-[11px]" style={muted}>score {fmtScore(item.score)}</span>
          </div>
          {item.group && <p className="truncate text-[11px]" style={muted}>{item.group}</p>}
        </div>
        <AddButton inPlan={inPlan} onAdd={onAdd} disabled={disabled} />
      </div>
      {item.why && <p className="text-xs leading-snug">{item.why}</p>}
      {item.signals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.signals.map((s) => (
            <span
              key={s}
              className="rounded-full border px-1.5 text-[10px] leading-4"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] tabular-nums" style={muted}>
        <span>Close <b style={{ color: "var(--color-text)" }}>{fmtPx(item.close)}</b></span>
        <span>PDH <b style={{ color: "var(--color-text)" }}>{fmtPx(item.pdh)}</b></span>
        <span>PDL <b style={{ color: "var(--color-text)" }}>{fmtPx(item.pdl)}</b></span>
        <span>ATR <b style={{ color: "var(--color-text)" }}>{fmtPx(item.atr)}</b></span>
        <span>Stop ref <b style={{ color: "var(--color-text)" }}>{fmtPx(item.stopRef)}</b></span>
      </div>
      {/* RS charts are research (not part of the trade book): closed by default, labelled */}
      {item.chart && (
        <details className="text-[11px]">
          <summary className="cursor-pointer" style={muted}>
            Chart{" "}
            <span
              className="rounded border px-1 py-px text-[10px] uppercase tracking-wide"
              style={{ borderColor: "var(--color-border)" }}
            >
              experimental
            </span>
          </summary>
          <MiniChart chart={item.chart} symbol={item.symbol} />
        </details>
      )}
    </div>
  );
}

// ── mini daily chart (candles + RS vs QQQ) ───────────────────────────────────

const W = 320;
const PRICE_H = 96;
const GAP = 6;
const RS_H = 34;
const H = PRICE_H + GAP + RS_H;
const PAD_R = 2;

function MiniChart({ chart, symbol }: { chart: RsChart; symbol: string }) {
  const n = chart.c.length;
  const slot = (W - PAD_R) / n;
  const bodyW = Math.max(1, Math.min(6, slot * 0.62));

  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < n; i++) {
    for (const v of [chart.h[i], chart.l[i], chart.o[i], chart.c[i]]) {
      if (v != null) { if (v < lo) lo = v; if (v > hi) hi = v; }
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  if (hi === lo) { hi += 1; lo -= 1; }
  const py = (v: number) => 2 + (PRICE_H - 4) * (1 - (v - lo) / (hi - lo));

  let rlo = Infinity;
  let rhi = -Infinity;
  for (const arr of [chart.rs, chart.rs50]) for (const v of arr) if (v != null) { if (v < rlo) rlo = v; if (v > rhi) rhi = v; }
  const hasRs = Number.isFinite(rlo) && Number.isFinite(rhi);
  if (hasRs && rhi === rlo) { rhi += 1; rlo -= 1; }
  const ry = (v: number) => PRICE_H + GAP + 2 + (RS_H - 4) * (1 - (v - rlo) / (rhi - rlo));
  const cx = (i: number) => i * slot + slot / 2;

  function path(arr: (number | null)[]): string {
    let d = "";
    let pen = false;
    arr.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${cx(i).toFixed(1)},${ry(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  }

  const first = chart.d[0] || "";
  const lastD = chart.d[n - 1] || "";

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`${symbol} daily chart, ${n} sessions, with relative strength versus QQQ`}
      >
        <line x1={0} x2={W} y1={PRICE_H + GAP / 2} y2={PRICE_H + GAP / 2} stroke="var(--color-border)" strokeWidth={1} />
        {chart.c.map((c, i) => {
          const o = chart.o[i] ?? c;
          const h = chart.h[i];
          const l = chart.l[i];
          if (c == null || o == null) return null;
          const up = c >= o;
          const stroke = up ? UP_STROKE : DOWN;
          const x = cx(i);
          const yTop = py(Math.max(o, c));
          const yBot = py(Math.min(o, c));
          return (
            <g key={i}>
              {h != null && l != null && (
                <line x1={x} x2={x} y1={py(h)} y2={py(l)} stroke={stroke} strokeWidth={0.8} />
              )}
              <rect
                x={x - bodyW / 2}
                y={yTop}
                width={bodyW}
                height={Math.max(0.8, yBot - yTop)}
                fill={up ? "var(--color-panel)" : DOWN}
                stroke={stroke}
                strokeWidth={0.8}
              />
            </g>
          );
        })}
        {hasRs && (
          <>
            <path d={path(chart.rs50)} fill="none" stroke={RS_BLUE} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
            <path d={path(chart.rs)} fill="none" stroke={RS_BLUE} strokeWidth={1.4} />
          </>
        )}
      </svg>
      <div className="flex justify-between text-[10px]" style={muted}>
        <span>{first}</span>
        {hasRs && <span><span style={{ color: RS_BLUE }}>━</span> RS vs QQQ <span style={{ color: RS_BLUE, opacity: 0.6 }}>┅</span> 50d</span>}
        <span>{lastD}</span>
      </div>
    </div>
  );
}
