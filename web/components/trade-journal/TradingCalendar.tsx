"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

// --- Types ---

interface DailyTrade {
  symbol: string;
  setup: string;
  side: string;
  entryTime: string;
  pnl: number;
  realizedR: number | null;
  standardR: number | null;
  risk: number | null;
  conviction: string;
  processFollowed: string; // "Yes" | "No" | ""
  hasNote: boolean;
}

interface DailyCalendarCell {
  date: string;
  pnl: number;
  realizedR: number;
  standardR: number | null;
  trades: number;
  wins: number;
  losses: number;
  avgRisk: number | null;
  fullR: number | null;
  hasNote: boolean;
  tradeList: DailyTrade[];
}

interface CalendarData {
  cells: DailyCalendarCell[];
  hasFullRConfig: boolean;
}

interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  date: string | null;
  symbol: string | null;
  type: "entry" | "eod";
}

interface ScreenshotIndex {
  [key: string]: { entry: DriveFileInfo[]; eod: DriveFileInfo[] };
}

interface GalleryImage {
  fileId: string;
  name: string;
  kind: "Entry" | "EOD";
}

type Unit = "standardR" | "realizedR" | "dollar";

type DrillSortKey = "entryTime" | "symbol" | "side" | "setup" | "process" | "conviction" | "risk" | "pnl" | "realizedR" | "standardR";
type SortDir = "asc" | "desc";

const GREEN = "#48bb78";
const RED = "#f56565";

const UNIT_LABELS: Record<Unit, string> = {
  standardR: "R (Standard)",
  realizedR: "Realized R",
  dollar: "$",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// --- Helpers ---

function parseDate(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function dowMonStart(y: number, m: number, d: number): number {
  // 0 = Mon ... 6 = Sun
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  return (js + 6) % 7;
}

function valueFor(cell: DailyCalendarCell, unit: Unit): number | null {
  if (unit === "standardR") return cell.standardR;
  if (unit === "realizedR") return cell.realizedR;
  return cell.pnl;
}

function fmtValue(val: number | null, unit: Unit): string {
  if (val === null) return "—";
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  if (unit === "dollar") return `${sign}$${Math.abs(val).toFixed(2)}`;
  return `${sign}${Math.abs(val).toFixed(1)}R`;
}

function colorFor(val: number | null): string {
  if (val === null || val === 0) return "var(--color-muted)";
  return val > 0 ? GREEN : RED;
}

// --- Main Component ---

export default function TradingCalendar({ tabName, filterParams = "" }: { tabName: string; filterParams?: string }) {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [unit, setUnit] = useState<Unit>("standardR");
  const [monthCursor, setMonthCursor] = useState<{ y: number; m: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Screenshots — lazily fetched once on first drill-down open, then cached
  const [ssIndex, setSsIndex] = useState<ScreenshotIndex | null>(null);
  const [ssLoading, setSsLoading] = useState(false);
  // Lightbox gallery: list of images + the currently shown index
  const [gallery, setGallery] = useState<{ images: GalleryImage[]; index: number } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/trade-journal/calendar?tab=${encodeURIComponent(tabName)}${filterParams}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load calendar");
        setData(json as CalendarData);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tabName, filterParams]);

  // Clear any open drill-down when the data set changes
  useEffect(() => { setSelectedDate(null); }, [filterParams, tabName]);

  // Lazily load the screenshot index the first time a day is opened
  useEffect(() => {
    if (!selectedDate || ssIndex !== null || ssLoading) return;
    setSsLoading(true);
    fetch("/api/trade-journal/screenshots")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("screenshots fetch failed"))))
      .then((j: { index: ScreenshotIndex }) => setSsIndex(j.index || {}))
      .catch(() => setSsIndex({})) // fail soft — drill-down still works without shots
      .finally(() => setSsLoading(false));
  }, [selectedDate, ssIndex, ssLoading]);

  // Default the unit toggle away from Standard R if there's no Full R config
  useEffect(() => {
    if (data && !data.hasFullRConfig && unit === "standardR") setUnit("realizedR");
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Index cells by date + figure out the data's month range
  const { byDate, months } = useMemo(() => {
    const map = new Map<string, DailyCalendarCell>();
    const monthSet = new Set<string>();
    for (const c of data?.cells || []) {
      map.set(c.date, c);
      const { y, m } = parseDate(c.date);
      monthSet.add(`${y}-${String(m).padStart(2, "0")}`);
    }
    const monthList = [...monthSet].sort();
    return { byDate: map, months: monthList };
  }, [data]);

  // Default cursor to the latest month with data
  useEffect(() => {
    if (!monthCursor && months.length > 0) {
      const last = months[months.length - 1];
      const [y, m] = last.split("-").map(Number);
      setMonthCursor({ y, m });
    }
  }, [months, monthCursor]);

  const canPrev = useMemo(() => {
    if (!monthCursor || months.length === 0) return false;
    return `${monthCursor.y}-${String(monthCursor.m).padStart(2, "0")}` > months[0];
  }, [monthCursor, months]);

  const canNext = useMemo(() => {
    if (!monthCursor || months.length === 0) return false;
    return `${monthCursor.y}-${String(monthCursor.m).padStart(2, "0")}` < months[months.length - 1];
  }, [monthCursor, months]);

  const step = useCallback((dir: -1 | 1) => {
    setMonthCursor((c) => {
      if (!c) return c;
      let m = c.m + dir;
      let y = c.y;
      if (m < 1) { m = 12; y -= 1; }
      if (m > 12) { m = 1; y += 1; }
      return { y, m };
    });
  }, []);

  // Build the week rows for the active month
  const weeks = useMemo(() => {
    if (!monthCursor) return [];
    const { y, m } = monthCursor;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = dowMonStart(y, m, 1);

    const slots: (DailyCalendarCell | null | undefined)[] = [];
    for (let i = 0; i < lead; i++) slots.push(undefined); // padding before month start
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      slots.push(byDate.get(ds) ?? null);
    }
    while (slots.length % 7 !== 0) slots.push(undefined);

    const rows: (DailyCalendarCell | null | undefined)[][] = [];
    for (let i = 0; i < slots.length; i += 7) rows.push(slots.slice(i, i + 7));
    return rows;
  }, [monthCursor, byDate]);

  // Monthly aggregate + intensity scaling
  const monthCells = useMemo(() => {
    if (!monthCursor) return [];
    const prefix = `${monthCursor.y}-${String(monthCursor.m).padStart(2, "0")}`;
    return (data?.cells || []).filter((c) => c.date.startsWith(prefix));
  }, [data, monthCursor]);

  const maxAbs = useMemo(() => {
    let mx = 0;
    for (const c of monthCells) {
      const v = valueFor(c, unit);
      if (v !== null) mx = Math.max(mx, Math.abs(v));
    }
    return mx || 1;
  }, [monthCells, unit]);

  const monthSummary = useMemo(() => {
    let pnl = 0, realizedR = 0, standardR = 0, hasStd = false, wins = 0, losses = 0, days = 0;
    let best: DailyCalendarCell | null = null, worst: DailyCalendarCell | null = null;
    for (const c of monthCells) {
      pnl += c.pnl; realizedR += c.realizedR;
      if (c.standardR !== null) { standardR += c.standardR; hasStd = true; }
      wins += c.wins; losses += c.losses; days += 1;
      const v = valueFor(c, unit);
      if (v !== null) {
        if (best === null || v > (valueFor(best, unit) ?? -Infinity)) best = c;
        if (worst === null || v < (valueFor(worst, unit) ?? Infinity)) worst = c;
      }
    }
    const total = unit === "dollar" ? pnl : unit === "realizedR" ? realizedR : (hasStd ? standardR : null);
    const wr = wins + losses > 0 ? (wins / (wins + losses)) * 100 : null;
    return { total, days, wr, best, worst, pnl };
  }, [monthCells, unit]);

  const selectedCell = selectedDate ? byDate.get(selectedDate) ?? null : null;

  if (loading) {
    return <div className="py-12 text-center text-sm" style={{ color: "var(--color-muted)" }}>Loading calendar...</div>;
  }
  if (error) {
    return <div className="rounded border px-4 py-3 text-sm" style={{ borderColor: RED, color: RED }}>{error}</div>;
  }
  if (!data || data.cells.length === 0) {
    return <div className="py-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>No trades to display on the calendar yet.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            disabled={!canPrev}
            className="rounded border px-2.5 py-1 text-sm disabled:opacity-30"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            &laquo;
          </button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {monthCursor ? `${MONTH_NAMES[monthCursor.m - 1]} ${monthCursor.y}` : ""}
          </span>
          <button
            onClick={() => step(1)}
            disabled={!canNext}
            className="rounded border px-2.5 py-1 text-sm disabled:opacity-30"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            &raquo;
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(["standardR", "realizedR", "dollar"] as Unit[]).map((u) => {
            const disabled = u === "standardR" && !data.hasFullRConfig;
            return (
              <button
                key={u}
                onClick={() => !disabled && setUnit(u)}
                disabled={disabled}
                title={disabled ? "Set a Full R baseline in the Calendar Config tab to enable this view" : undefined}
                className="rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-30"
                style={{
                  borderColor: unit === u ? "var(--color-accent)" : "var(--color-border)",
                  backgroundColor: unit === u ? "var(--color-accent)" : "transparent",
                  color: unit === u ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {UNIT_LABELS[u]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly summary */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border px-4 py-2.5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
        <SummaryStat label="Month" value={fmtValue(monthSummary.total, unit)} color={colorFor(monthSummary.total)} />
        <SummaryStat label="Days Traded" value={String(monthSummary.days)} />
        <SummaryStat label="Win Rate" value={monthSummary.wr === null ? "—" : `${monthSummary.wr.toFixed(1)}%`} />
        <SummaryStat label="Best Day" value={monthSummary.best ? fmtValue(valueFor(monthSummary.best, unit), unit) : "—"} color={GREEN} />
        <SummaryStat label="Worst Day" value={monthSummary.worst ? fmtValue(valueFor(monthSummary.worst, unit), unit) : "—"} color={RED} />
      </div>

      {/* Grid header */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(5, 1fr) 1.1fr" }}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider pb-1" style={{ color: "var(--color-muted)" }}>
            {d}
          </div>
        ))}
        <div className="text-center text-xs font-semibold uppercase tracking-wider pb-1" style={{ color: "var(--color-muted)" }}>
          Week
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => {
          // weekly aggregate
          let wPnl = 0, wReal = 0, wStd = 0, wHasStd = false, wWins = 0, wLoss = 0, wDays = 0;
          for (const c of week) {
            if (!c) continue;
            wPnl += c.pnl; wReal += c.realizedR;
            if (c.standardR !== null) { wStd += c.standardR; wHasStd = true; }
            wWins += c.wins; wLoss += c.losses; wDays += 1;
          }
          const wTotal = unit === "dollar" ? wPnl : unit === "realizedR" ? wReal : (wHasStd ? wStd : null);

          return (
            <WeekRow
              key={wi}
              week={week}
              unit={unit}
              maxAbs={maxAbs}
              weekTotal={wTotal}
              weekDays={wDays}
              selectedDate={selectedDate}
              onSelect={(d) => setSelectedDate((cur) => (cur === d ? null : d))}
            />
          );
        })}
      </div>

      {/* Drill-down for the selected day */}
      {selectedCell && (
        <DayDrillDown
          cell={selectedCell}
          unit={unit}
          ssIndex={ssIndex}
          ssLoading={ssLoading}
          onOpenGallery={(images, index) => setGallery({ images, index })}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {gallery && (
        <GalleryLightbox
          images={gallery.images}
          index={gallery.index}
          onIndex={(i) => setGallery((g) => (g ? { ...g, index: i } : g))}
          onClose={() => setGallery(null)}
        />
      )}

      {/* Legend / context */}
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        {unit === "standardR" && "Standard R = daily $ P&L ÷ your Full R target for that date. Half-size days show proportionally smaller R. "}
        {unit === "realizedR" && "Realized R = each trade scored against its own risk. Reveals when position sizing rescued or sank a day. "}
        {unit === "dollar" && "Raw dollar P&L per day. "}
        Click a day to see its trades — sort by any column header, and click the <span style={{ color: "#63b3ed" }}>shots</span> icon to view Entry/EOD screenshots. A <span style={{ color: "var(--color-accent)" }}>●</span> dot marks days with a note or EOD screenshot; the size pill (e.g. <span className="font-mono">50%</span>) shows avg risk vs full R.
      </p>
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>{label}</span>
      <span className="text-sm font-semibold font-mono" style={{ color: color || "var(--color-text)" }}>{value}</span>
    </div>
  );
}

function WeekRow({
  week, unit, maxAbs, weekTotal, weekDays, selectedDate, onSelect,
}: {
  week: (DailyCalendarCell | null | undefined)[];
  unit: Unit;
  maxAbs: number;
  weekTotal: number | null;
  weekDays: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  return (
    <>
      {week.slice(0, 5).map((cell, di) => (
        <DayCell key={di} cell={cell} unit={unit} maxAbs={maxAbs} selectedDate={selectedDate} onSelect={onSelect} />
      ))}
      <div
        className="rounded-lg border px-2 py-2 flex flex-col justify-center"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        {weekDays > 0 ? (
          <>
            <span className="text-sm font-semibold font-mono leading-tight" style={{ color: colorFor(weekTotal) }}>
              {fmtValue(weekTotal, unit)}
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>{weekDays}d</span>
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-border)" }}>—</span>
        )}
      </div>
    </>
  );
}

function DayCell({ cell, unit, maxAbs, selectedDate, onSelect }: {
  cell: DailyCalendarCell | null | undefined;
  unit: Unit;
  maxAbs: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  // undefined = padding outside the month; null = in-month day with no trades
  if (cell === undefined) {
    return <div className="rounded-lg" style={{ minHeight: "76px" }} />;
  }

  const dayNum = cell ? parseDate(cell.date).d : null;

  if (cell === null) {
    return (
      <div className="rounded-lg border" style={{ minHeight: "76px", borderColor: "var(--color-border)", opacity: 0.4 }} />
    );
  }

  const cellData = cell; // narrowed (not null/undefined)
  const val = valueFor(cellData, unit);
  const positive = val !== null && val > 0;
  const negative = val !== null && val < 0;
  const intensity = val === null ? 0 : Math.min(0.4, 0.1 + (Math.abs(val) / maxAbs) * 0.3);
  const bg = positive
    ? `color-mix(in srgb, ${GREEN} ${intensity * 100}%, var(--color-panel))`
    : negative
      ? `color-mix(in srgb, ${RED} ${intensity * 100}%, var(--color-panel))`
      : "var(--color-panel)";
  const border = positive ? GREEN : negative ? RED : "var(--color-border)";
  const isSelected = selectedDate === cellData.date;

  // size pill: avg deployed risk vs full R target (shown on every traded day)
  const sizeFrac = cellData.avgRisk !== null && cellData.fullR ? cellData.avgRisk / cellData.fullR : null;
  const showSize = sizeFrac !== null;

  return (
    <div
      onClick={() => onSelect(cellData.date)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(cellData.date); } }}
      className="rounded-lg border px-1.5 py-1.5 flex flex-col cursor-pointer transition-shadow hover:brightness-105"
      style={{
        minHeight: "76px",
        borderColor: isSelected ? "var(--color-accent)" : `color-mix(in srgb, ${border} 45%, var(--color-border))`,
        borderWidth: isSelected ? "2px" : "1px",
        backgroundColor: bg,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>{dayNum}</span>
        <div className="flex items-center gap-1">
          {showSize && (
            <span className="text-[10px] font-mono rounded px-1" style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}>
              {Math.round(sizeFrac! * 100)}%
            </span>
          )}
          {cell.hasNote && <span style={{ color: "var(--color-accent)", fontSize: "8px" }}>●</span>}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="text-sm font-bold font-mono leading-tight" style={{ color: colorFor(val) }}>
          {fmtValue(val, unit)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
          #{cell.trades} · {cell.wins}/{cell.losses}
        </span>
      </div>
    </div>
  );
}

function fmtR(val: number | null): string {
  if (val === null) return "—";
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  return `${sign}${Math.abs(val).toFixed(1)}R`;
}

function fmtDollar(val: number): string {
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  return `${sign}$${Math.abs(val).toFixed(2)}`;
}

function timeToSeconds(t: string): number {
  const p = t.split(":").map(Number);
  if (p.length < 2 || isNaN(p[0])) return -1;
  return p[0] * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
}

const DRILL_COLUMNS: { key: DrillSortKey; label: string; numeric: boolean }[] = [
  { key: "entryTime", label: "Time", numeric: true },
  { key: "symbol", label: "Symbol", numeric: false },
  { key: "side", label: "Side", numeric: false },
  { key: "setup", label: "Setup", numeric: false },
  { key: "process", label: "Process", numeric: false },
  { key: "conviction", label: "Conv", numeric: true },
  { key: "risk", label: "Risk", numeric: true },
  { key: "pnl", label: "P&L", numeric: true },
  { key: "realizedR", label: "Realized R", numeric: true },
  { key: "standardR", label: "Std R", numeric: true },
];

function drillSortValue(t: DailyTrade, key: DrillSortKey): number | string | null {
  switch (key) {
    case "entryTime": return timeToSeconds(t.entryTime);
    case "symbol": return t.symbol;
    case "side": return t.side;
    case "setup": return t.setup;
    case "process": {
      // Sort: Yes=0, No=1, blank=null (last)
      const p = t.processFollowed;
      if (p === "Yes") return 0;
      if (p === "No") return 1;
      return null;
    }
    case "conviction": return t.conviction ? Number(t.conviction) : null;
    case "risk": return t.risk;
    case "pnl": return t.pnl;
    case "realizedR": return t.realizedR;
    case "standardR": return t.standardR;
  }
}

function DayDrillDown({ cell, unit, ssIndex, ssLoading, onOpenGallery, onClose }: {
  cell: DailyCalendarCell;
  unit: Unit;
  ssIndex: ScreenshotIndex | null;
  ssLoading: boolean;
  onOpenGallery: (images: GalleryImage[], index: number) => void;
  onClose: () => void;
}) {
  const dayTotal = valueFor(cell, unit);
  const [sortKey, setSortKey] = useState<DrillSortKey>("entryTime");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: DrillSortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sortedTrades = useMemo(() => {
    const rows = [...cell.tradeList];
    rows.sort((a, b) => {
      const av = drillSortValue(a, sortKey);
      const bv = drillSortValue(b, sortKey);
      // nulls always sort last regardless of direction
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [cell.tradeList, sortKey, sortDir]);

  // Screenshots for a given symbol on this day (keyed date|symbol)
  function shotsFor(symbol: string): GalleryImage[] {
    if (!ssIndex) return [];
    const entry = ssIndex[`${cell.date}|${symbol}`];
    if (!entry) return [];
    return [
      ...entry.entry.map((f) => ({ fileId: f.id, name: f.name, kind: "Entry" as const })),
      ...entry.eod.map((f) => ({ fileId: f.id, name: f.name, kind: "EOD" as const })),
    ];
  }

  return (
    <div className="rounded-lg border" style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-panel)" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold font-mono">{cell.date}</span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            #{cell.trades} · {cell.wins}W/{cell.losses}L
          </span>
          <span className="text-sm font-semibold font-mono" style={{ color: colorFor(dayTotal) }}>
            {fmtValue(dayTotal, unit)}
          </span>
          {cell.avgRisk !== null && cell.fullR && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              avg risk ${cell.avgRisk} of ${cell.fullR} ({Math.round((cell.avgRisk / cell.fullR) * 100)}%)
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-xs rounded px-2 py-0.5 hover:opacity-70" style={{ color: "var(--color-muted)" }}>
          ✕ Close
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              {DRILL_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left font-medium px-3 py-1.5 whitespace-nowrap cursor-pointer select-none hover:opacity-80"
                  title={`Sort by ${col.label}`}
                >
                  {col.label}
                  <span className="ml-1" style={{ opacity: sortKey === col.key ? 1 : 0.25 }}>
                    {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
                  </span>
                </th>
              ))}
              <th className="text-left font-medium px-3 py-1.5 whitespace-nowrap">Shots</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((t, i) => {
              const shots = shotsFor(t.symbol);
              return (
                <tr key={i} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-3 py-1.5 font-mono whitespace-nowrap" style={{ color: "var(--color-muted)" }}>{t.entryTime}</td>
                  <td className="px-3 py-1.5 font-semibold">{t.symbol}</td>
                  <td className="px-3 py-1.5">
                    <span style={{ color: t.side === "Long" ? GREEN : t.side === "Short" ? RED : "var(--color-text)" }}>{t.side}</span>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">{t.setup || "—"}</td>
                  <td className="px-3 py-1.5 text-center">
                    {t.processFollowed === "Yes" ? (
                      <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "rgba(72,187,120,0.18)", color: GREEN }}>Y</span>
                    ) : t.processFollowed === "No" ? (
                      <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "rgba(245,101,101,0.18)", color: RED }}>N</span>
                    ) : (
                      <span style={{ color: "var(--color-muted)", opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center">{t.conviction || "—"}</td>
                  <td className="px-3 py-1.5 font-mono whitespace-nowrap">{t.risk !== null ? `$${t.risk}` : "—"}</td>
                  <td className="px-3 py-1.5 font-mono whitespace-nowrap" style={{ color: colorFor(t.pnl) }}>{fmtDollar(t.pnl)}</td>
                  <td className="px-3 py-1.5 font-mono whitespace-nowrap" style={{ color: colorFor(t.realizedR) }}>{fmtR(t.realizedR)}</td>
                  <td className="px-3 py-1.5 font-mono whitespace-nowrap" style={{ color: colorFor(t.standardR) }}>{fmtR(t.standardR)}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    {ssLoading && !ssIndex ? (
                      <span style={{ color: "var(--color-muted)", opacity: 0.6 }}>…</span>
                    ) : shots.length > 0 ? (
                      <button
                        onClick={() => onOpenGallery(shots, 0)}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:opacity-80"
                        style={{ backgroundColor: "rgba(99,179,237,0.12)", color: "#63b3ed" }}
                        title={shots.map((s) => `${s.kind}: ${s.name}`).join("\n")}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {shots.length}
                      </button>
                    ) : (
                      <span style={{ color: "var(--color-muted)", opacity: 0.4 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GalleryLightbox({ images, index, onIndex, onClose }: {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const current = images[index];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasMultiple) onIndex((index + 1) % images.length);
      else if (e.key === "ArrowLeft" && hasMultiple) onIndex((index - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, images.length, hasMultiple, onIndex, onClose]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full p-2 hover:opacity-80"
        style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </>
      )}

      <div className="max-w-[95vw] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/trade-journal/screenshot-image?fileId=${current.fileId}`}
          alt={current.name}
          className="max-w-none"
          style={{ maxHeight: "84vh" }}
        />
      </div>

      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded px-3 py-1 text-xs"
        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.85)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rounded px-1.5 py-0.5 font-semibold" style={{ backgroundColor: current.kind === "Entry" ? "rgba(72,187,120,0.3)" : "rgba(99,179,237,0.3)" }}>
          {current.kind}
        </span>
        <span className="max-w-[60vw] truncate">{current.name}</span>
        {hasMultiple && <span style={{ opacity: 0.7 }}>· {index + 1}/{images.length}</span>}
      </div>
    </div>
  );
}
