"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// --- Types ---

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

interface TradeForReview {
  date: string;
  symbol: string;
  side: string;
  entryTime: string;
  pnl: number;
  pnlR: number;
  risk: number;
  setup: string;
  tags: string;
  processFollowed: string;
  catalyst: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  rowIndex: number;
  notes: string;
}

interface TradeWithScreenshots extends TradeForReview {
  entryScreenshots: DriveFileInfo[];
  eodScreenshots: DriveFileInfo[];
}

type SortKey = "date" | "pnl" | "pnlR" | "symbol";
type SortDir = "asc" | "desc";
type ProcessFilter = "all" | "yes" | "no";

const TAG_OPTIONS = [
  "clean entry",
  "extended entry",
  "chased",
  "FOMO",
  "added size",
  "perfect process",
  "revenge trade",
  "oversize",
  "strong momentum",
  "gap>2xATR",
  "gap<2xATR",
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// --- Main Component ---

export default function ScreenshotReview({ tabName }: { tabName: string }) {
  const [trades, setTrades] = useState<TradeWithScreenshots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [wlFilter, setWlFilter] = useState<"all" | "winners" | "losers">("all");
  const [setupFilter, setSetupFilter] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [screenshotsOnly, setScreenshotsOnly] = useState(true);
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [processFilter, setProcessFilter] = useState<ProcessFilter>("all");
  const [sideFilter, setSideFilter] = useState<"" | "Long" | "Short">("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tradesRes, screenshotsRes] = await Promise.all([
          fetch(`/api/trade-journal/trades-for-review?tab=${encodeURIComponent(tabName)}`),
          fetch("/api/trade-journal/screenshots"),
        ]);

        if (!tradesRes.ok) throw new Error((await tradesRes.json()).error || "Failed to load trades");
        if (!screenshotsRes.ok) throw new Error((await screenshotsRes.json()).error || "Failed to load screenshots");

        const tradesData = (await tradesRes.json()) as { trades: TradeForReview[] };
        const ssData = (await screenshotsRes.json()) as { index: ScreenshotIndex };

        const joined: TradeWithScreenshots[] = tradesData.trades.map((t) => {
          const key = `${t.date}|${t.symbol}`;
          const ss = ssData.index[key];
          return {
            ...t,
            entryScreenshots: ss?.entry || [],
            eodScreenshots: ss?.eod || [],
          };
        });

        setTrades(joined);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tabName]);

  // Reset page when filters/sort change
  useEffect(() => { setCurrentPage(1); }, [wlFilter, setupFilter, symbolFilter, tagFilter, screenshotsOnly, startDate, endDate, processFilter, sideFilter, sortKey, sortDir, pageSize]);

  // --- Filter + Sort + Paginate ---
  const { filtered, sorted, paginated, totalPages } = useMemo(() => {
    // Filter
    let f = trades.filter((t) => {
      if (wlFilter === "winners" && t.pnl <= 0) return false;
      if (wlFilter === "losers" && t.pnl >= 0) return false;
      if (setupFilter && t.setup !== setupFilter) return false;
      if (symbolFilter && t.symbol !== symbolFilter) return false;
      if (sideFilter && t.side !== sideFilter) return false;
      if (tagFilter && !t.tags.toLowerCase().includes(tagFilter.toLowerCase())) return false;
      if (screenshotsOnly && t.entryScreenshots.length === 0 && t.eodScreenshots.length === 0) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      if (processFilter === "yes" && t.processFollowed !== "Yes") return false;
      if (processFilter === "no" && t.processFollowed !== "No") return false;
      return true;
    });

    // Sort
    const s = [...f].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp = a.date.localeCompare(b.date) || a.entryTime.localeCompare(b.entryTime);
          break;
        case "pnl":
          cmp = a.pnl - b.pnl;
          break;
        case "pnlR":
          cmp = a.pnlR - b.pnlR;
          break;
        case "symbol":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    // Paginate
    const total = Math.max(1, Math.ceil(s.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const p = s.slice(start, start + pageSize);

    return { filtered: f, sorted: s, paginated: p, totalPages: total };
  }, [trades, wlFilter, setupFilter, symbolFilter, sideFilter, tagFilter, screenshotsOnly, startDate, endDate, processFilter, sortKey, sortDir, pageSize, currentPage]);

  // Unique values for filter dropdowns
  const uniqueSetups = useMemo(() => [...new Set(trades.map((t) => t.setup).filter(Boolean))].sort(), [trades]);
  const uniqueSymbols = useMemo(() => [...new Set(trades.map((t) => t.symbol).filter(Boolean))].sort(), [trades]);
  const uniqueTags = useMemo(() => [...new Set(trades.flatMap((t) => t.tags.split(",").map((s) => s.trim())).filter(Boolean))].sort(), [trades]);

  // Counts for W/L tabs (respect other active filters except W/L)
  const countForWl = useCallback((wl: "all" | "winners" | "losers") => {
    return trades.filter((t) => {
      if (wl === "winners" && t.pnl <= 0) return false;
      if (wl === "losers" && t.pnl >= 0) return false;
      if (setupFilter && t.setup !== setupFilter) return false;
      if (symbolFilter && t.symbol !== symbolFilter) return false;
      if (sideFilter && t.side !== sideFilter) return false;
      if (tagFilter && !t.tags.toLowerCase().includes(tagFilter.toLowerCase())) return false;
      if (screenshotsOnly && t.entryScreenshots.length === 0 && t.eodScreenshots.length === 0) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      if (processFilter === "yes" && t.processFollowed !== "Yes") return false;
      if (processFilter === "no" && t.processFollowed !== "No") return false;
      return true;
    }).length;
  }, [trades, setupFilter, symbolFilter, sideFilter, tagFilter, screenshotsOnly, startDate, endDate, processFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "desc");
    }
  }

  const hasActiveFilters = setupFilter || symbolFilter || tagFilter || sideFilter || processFilter !== "all" || startDate !== "2025-05-01" || endDate !== "";

  if (loading) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        Loading screenshots and trade data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded border px-4 py-3 text-sm"
        style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="rounded-lg border p-4 space-y-3"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
      >
        {/* Row 1: W/L toggle + Screenshots toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "winners", "losers"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setWlFilter(f)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={{
                borderColor: wlFilter === f ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: wlFilter === f ? "var(--color-accent)" : "transparent",
                color: wlFilter === f ? "var(--color-bg)" : "var(--color-text)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({countForWl(f)})
            </button>
          ))}

          <span className="mx-1" style={{ color: "var(--color-border)" }}>|</span>

          {/* Process Followed filter */}
          {(["all", "yes", "no"] as const).map((pf) => {
            const labels: Record<ProcessFilter, string> = { all: "All Process", yes: "Followed", no: "Not Followed" };
            return (
              <button
                key={pf}
                onClick={() => setProcessFilter(pf)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: processFilter === pf
                    ? (pf === "no" ? "#f56565" : "var(--color-accent)")
                    : "var(--color-border)",
                  backgroundColor: processFilter === pf
                    ? (pf === "no" ? "rgba(245,101,101,0.15)" : "var(--color-accent)")
                    : "transparent",
                  color: processFilter === pf
                    ? (pf === "no" ? "#f56565" : "var(--color-bg)")
                    : "var(--color-text)",
                }}
              >
                {labels[pf]}
              </button>
            );
          })}

          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <ToggleSwitch checked={screenshotsOnly} onChange={setScreenshotsOnly} />
            <span className="text-xs font-medium">With screenshots only</span>
          </label>
        </div>

        {/* Row 2: Date range + dropdowns */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cursor-pointer rounded border py-1.5 px-2 text-xs focus:outline-none"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cursor-pointer rounded border py-1.5 px-2 text-xs focus:outline-none"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          <FilterSelect label="Symbol" value={symbolFilter} onChange={setSymbolFilter} options={uniqueSymbols} placeholder="All Symbols" />
          <FilterSelect label="Setup" value={setupFilter} onChange={setSetupFilter} options={uniqueSetups} placeholder="All Setups" />
          <FilterSelect label="Side" value={sideFilter} onChange={(v) => setSideFilter(v as "" | "Long" | "Short")} options={["Long", "Short"]} placeholder="All Sides" />
          <FilterSelect label="Tags" value={tagFilter} onChange={setTagFilter} options={uniqueTags} placeholder="All Tags" />

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSetupFilter(""); setSymbolFilter(""); setTagFilter(""); setSideFilter("");
                setProcessFilter("all"); setStartDate("2025-05-01");
                setEndDate(new Date().toISOString().slice(0, 10));
              }}
              className="rounded border px-2 py-1.5 text-xs hover:opacity-80 self-end"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Row 3: Sort + Pagination controls */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>Sort by:</span>
            {([
              { key: "date" as SortKey, label: "Date" },
              { key: "pnl" as SortKey, label: "P&L ($)" },
              { key: "pnlR" as SortKey, label: "P&L (R)" },
              { key: "symbol" as SortKey, label: "Symbol" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className="rounded border px-2 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: sortKey === key ? "var(--color-accent)" : "var(--color-border)",
                  backgroundColor: sortKey === key ? "var(--color-accent)" : "transparent",
                  color: sortKey === key ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {label} {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {filtered.length} trade{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="mx-1" style={{ color: "var(--color-border)" }}>|</span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>Per page:</span>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: pageSize === size ? "var(--color-accent)" : "transparent",
                  color: pageSize === size ? "var(--color-bg)" : "var(--color-muted)",
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trade cards */}
      {paginated.map((trade) => (
        <TradeCard
          key={`${trade.date}-${trade.symbol}-${trade.entryTime}-${trade.side}`}
          trade={trade}
          tabName={tabName}
          onImageClick={(url, name) => setLightboxImage({ url, name })}
          onTagsUpdate={(rowIndex, newTags) => {
            setTrades((prev) =>
              prev.map((t) => (t.rowIndex === rowIndex ? { ...t, tags: newTags } : t))
            );
          }}
        />
      ))}

      {filtered.length === 0 && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          No trades match the current filters.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-30"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            &laquo; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="text-xs px-1" style={{ color: "var(--color-muted)" }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className="rounded px-2.5 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: currentPage === p ? "var(--color-accent)" : "transparent",
                    color: currentPage === p ? "var(--color-bg)" : "var(--color-text)",
                  }}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-30"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          url={lightboxImage.url}
          name={lightboxImage.name}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}

// --- Reusable Filter Select ---

function FilterSelect({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1.5 text-xs"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      >
        <option value="">{placeholder}</option>
        {options.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// --- Toggle Switch ---

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors"
      style={{
        borderColor: checked ? "var(--color-accent)" : "var(--color-border)",
        backgroundColor: checked ? "var(--color-accent)" : "var(--color-border)",
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full transition-transform"
        style={{
          backgroundColor: "var(--color-bg)",
          transform: checked ? "translateX(16px)" : "translateX(1px)",
          marginTop: "1px",
        }}
      />
    </button>
  );
}

// --- Trade Card ---

function TradeCard({
  trade,
  tabName,
  onImageClick,
  onTagsUpdate,
}: {
  trade: TradeWithScreenshots;
  tabName: string;
  onImageClick: (url: string, name: string) => void;
  onTagsUpdate: (rowIndex: number, tags: string) => void;
}) {
  const isWinner = trade.pnl > 0;
  const allScreenshots = [...trade.entryScreenshots, ...trade.eodScreenshots];
  const processNotFollowed = trade.processFollowed === "No";

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        borderColor: isWinner ? "rgba(72, 187, 120, 0.3)" : "rgba(245, 101, 101, 0.3)",
        backgroundColor: "var(--color-panel)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: isWinner
            ? "rgba(72, 187, 120, 0.06)"
            : "rgba(245, 101, 101, 0.06)",
        }}
      >
        {/* Top row: core trade info */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono" style={{ color: "var(--color-muted)" }}>
              {trade.date}
            </span>
            <span className="font-semibold text-sm">{trade.symbol}</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: trade.side === "Long" ? "rgba(72, 187, 120, 0.15)" : "rgba(245, 101, 101, 0.15)",
                color: trade.side === "Long" ? "#48bb78" : "#f56565",
              }}
            >
              {trade.side}
            </span>
            {trade.setup && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}>
                {trade.setup}
              </span>
            )}
            {trade.catalyst && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(99,179,237,0.12)", color: "#63b3ed" }}>
                {trade.catalyst}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span
              className="font-semibold"
              style={{ color: isWinner ? "#48bb78" : "#f56565" }}
            >
              {isWinner ? "+" : ""}${trade.pnl.toFixed(2)}
            </span>
            {trade.pnlR !== 0 && (
              <span
                className="text-xs"
                style={{ color: isWinner ? "#48bb78" : "#f56565" }}
              >
                {isWinner ? "+" : ""}{trade.pnlR.toFixed(1)}R
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {trade.entryTime}
            </span>
          </div>
        </div>

        {/* Process Not Followed warning */}
        {processNotFollowed && (
          <div
            className="mt-2 flex items-start gap-2 rounded px-2.5 py-1.5 text-xs"
            style={{ backgroundColor: "rgba(245,101,101,0.1)" }}
          >
            <span className="shrink-0 font-bold" style={{ color: "#f56565" }}>
              Process NOT Followed
            </span>
            {trade.notes && (
              <span
                className="truncate cursor-help"
                style={{ color: "var(--color-muted)", maxWidth: "500px" }}
                title={trade.notes}
              >
                — {trade.notes}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Screenshots */}
      {allScreenshots.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {trade.entryScreenshots.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                Entry
              </p>
              <ImageCarousel
                files={trade.entryScreenshots}
                onImageClick={onImageClick}
              />
            </div>
          )}
          {trade.eodScreenshots.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                End of Day
              </p>
              <ImageCarousel
                files={trade.eodScreenshots}
                onImageClick={onImageClick}
              />
            </div>
          )}
        </div>
      )}

      {allScreenshots.length === 0 && (
        <div className="px-4 py-4 text-center text-xs" style={{ color: "var(--color-muted)" }}>
          No screenshots for this trade
        </div>
      )}

      {/* Tags */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <TagEditor
          tags={trade.tags}
          tabName={tabName}
          rowIndex={trade.rowIndex}
          onUpdate={(newTags) => onTagsUpdate(trade.rowIndex, newTags)}
        />
      </div>
    </div>
  );
}

// --- Image Carousel ---

function ImageCarousel({
  files,
  onImageClick,
}: {
  files: DriveFileInfo[];
  onImageClick: (url: string, name: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const getCaption = (name: string): string => {
    return name
      .replace(/^\d{4}-\d{2}-\d{2}\s*/, "")
      .replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
      .replace(/Screenshot \(\d+\)\s*-?\s*/i, "")
      .replace(/Screenshot \(\d+\)/i, "")
      .trim() || name;
  };

  return (
    <div className="relative group">
      {files.length > 1 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round">
              <path d="M10 4L6 8L10 12" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round">
              <path d="M6 4L10 8L6 12" />
            </svg>
          </button>
        </>
      )}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
        style={{ scrollbarColor: "var(--color-border) transparent" }}
      >
        {files.map((f) => (
          <div key={f.id} className="shrink-0 group/thumb">
            <div
              className="rounded-lg overflow-hidden border cursor-pointer hover:border-[var(--color-accent)] transition-colors"
              style={{ borderColor: "var(--color-border)", width: "300px" }}
              onClick={() => onImageClick(`/api/trade-journal/screenshot-image?fileId=${f.id}`, f.name)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/trade-journal/screenshot-image?fileId=${f.id}`}
                alt={f.name}
                loading="lazy"
                className="w-full h-auto"
                style={{ minHeight: "100px", backgroundColor: "var(--color-bg)" }}
              />
            </div>
            <p className="text-xs mt-1 truncate max-w-[300px]" style={{ color: "var(--color-muted)" }}>
              {getCaption(f.name)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Tag Editor ---

function TagEditor({
  tags,
  tabName,
  rowIndex,
  onUpdate,
}: {
  tags: string;
  tabName: string;
  rowIndex: number;
  onUpdate: (tags: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTags = tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const saveTags = useCallback(
    async (newTags: string[]) => {
      const tagStr = newTags.join(", ");
      setSaving(true);
      try {
        const res = await fetch("/api/trade-journal/tags", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tab: tabName, rowIndex, tags: tagStr }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Failed to save tags:", data.error);
          return;
        }
        onUpdate(tagStr);
      } catch (err) {
        console.error("Failed to save tags:", err);
      } finally {
        setSaving(false);
      }
    },
    [tabName, rowIndex, onUpdate]
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed || currentTags.map((t) => t.toLowerCase()).includes(trimmed)) return;
      saveTags([...currentTags, trimmed]);
    },
    [currentTags, saveTags]
  );

  const removeTag = useCallback(
    (tag: string) => {
      saveTags(currentTags.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
    },
    [currentTags, saveTags]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
        Tags:
      </span>
      {currentTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
          style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            disabled={saving}
            className="hover:opacity-60 ml-0.5"
            style={{ color: "var(--color-muted)" }}
          >
            &times;
          </button>
        </span>
      ))}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={saving}
          className="rounded-full border px-2 py-0.5 text-xs hover:opacity-80 transition-opacity"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-accent)",
            borderStyle: "dashed",
          }}
        >
          {saving ? "..." : "+ Add"}
        </button>

        {showDropdown && (
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-lg border shadow-lg py-1 min-w-[200px]"
            style={{
              backgroundColor: "var(--color-panel)",
              borderColor: "var(--color-border)",
            }}
          >
            {TAG_OPTIONS.filter((t) => !currentTags.map((c) => c.toLowerCase()).includes(t.toLowerCase())).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  addTag(tag);
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-xs hover:opacity-80"
                style={{ color: "var(--color-text)" }}
              >
                {tag}
              </button>
            ))}
            <div className="border-t px-2 py-1.5" style={{ borderColor: "var(--color-border)" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customTag.trim()) {
                    addTag(customTag);
                    setCustomTag("");
                    setShowDropdown(false);
                  }
                }}
                className="flex gap-1"
              >
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Custom tag..."
                  className="flex-1 rounded border px-2 py-1 text-xs"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded px-2 py-1 text-xs font-semibold"
                  style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Lightbox ---

function Lightbox({
  url,
  name,
  onClose,
}: {
  url: string;
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full p-2 hover:opacity-80"
        style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div
        className="max-w-[95vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-w-none"
          style={{ maxHeight: "88vh" }}
        />
      </div>
      <p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs rounded px-3 py-1"
        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.7)" }}
      >
        {name}
      </p>
    </div>
  );
}
