"use client";

import { useState, useRef, FormEvent, DragEvent } from "react";
import TradePreview from "@/components/trade-journal/TradePreview";
import AggregateStats from "@/components/trade-journal/AggregateStats";
import HowToUse from "@/components/trade-journal/HowToUse";

interface TradeRow {
  symbol: string;
  side: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  pnl: number;
  numPartials: number;
  durationMins: number;
  entryTime: string;
  exitTime: string;
}

interface SegmentStats {
  label: string;
  totalPnl: number;
  trades: number;
  winners: number;
  losers: number;
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  profitFactor: number;
}

interface StatsData {
  totalPnl: number;
  avgDailyPnl: number;
  avgWinner: number;
  avgLoser: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgDurationMins: number;
  hourlyBreakdown: SegmentStats[];
  setupBreakdown: SegmentStats[];
}

interface UploadResult {
  success: boolean;
  date: string;
  tradesProcessed: number;
  rowsAppended: number;
  rowsSkipped: number;
  accounts: string[];
  sheetGid: number | null;
  trades: TradeRow[];
  stats: StatsData | null;
}

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1Hg1g73D8l8EH0j65IQBJhSEHzp3Ot_ib-ZD9UcN3ucU/edit";

function getLastWeekdayEST(): string {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = est.getDay();
  // 0=Sun → back 2, 1=Mon → back 3 (to Friday), otherwise back 1
  const daysBack = day === 0 ? 2 : day === 1 ? 3 : 1;
  est.setDate(est.getDate() - daysBack);
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, "0");
  const d = String(est.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TradeJournalPage() {
  const [date, setDate] = useState(getLastWeekdayEST());
  const [sheetSuffix, setSheetSuffix] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped);
      setError(null);
      setResult(null);
    } else {
      setError("Please drop a .csv file.");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("date", date);
      if (sheetSuffix.trim()) {
        formData.append("sheetSuffix", sheetSuffix.trim());
      }

      const res = await fetch("/api/trade-journal/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
      } else {
        setResult(data as UploadResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auto Trade Journal</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Upload your DAS Trader CSV export. Executed trades are grouped into round-trip
            entries and appended to the shared Google Sheet.
          </p>
        </div>
        <a
          href={result?.sheetGid != null ? `${SHEET_URL}#gid=${result.sheetGid}` : SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Open Trade Journal &raquo;
        </a>
      </div>

      <HowToUse />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label htmlFor="trade-date" className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              Trade Date
            </label>
            <div className="relative inline-block">
              <input
                id="trade-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="cursor-pointer rounded border py-2 pl-3 pr-8 text-sm focus:outline-none"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)", color: "var(--color-text)" }}
              />
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M2 6.5h12" />
                <path d="M5 1.5v3M11 1.5v3" />
              </svg>
            </div>
          </div>
          <div>
            <label htmlFor="sheet-suffix" className="mb-1 block text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              Sheet Name Suffix
            </label>
            <input
              id="sheet-suffix"
              type="text"
              value={sheetSuffix}
              onChange={(e) => setSheetSuffix(e.target.value)}
              placeholder="e.g. yourname"
              className="rounded border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)", color: "var(--color-text)" }}
            />
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)", opacity: 0.6 }}>
              Only used when creating a new sheet tab (e.g. TRPCT1541-yourname)
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
          style={{
            borderColor: dragOver
              ? "var(--color-accent)"
              : file
                ? "var(--color-accent)"
                : "var(--color-border)",
            backgroundColor: dragOver || file ? "var(--color-panel)" : "transparent",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="space-y-1">
              <p className="font-mono text-sm font-semibold" style={{ color: "var(--color-accent)" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {(file.size / 1024).toFixed(1)} KB — click or drop to replace
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Drop your DAS Trader CSV here, or click to browse
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)", opacity: 0.6 }}>Only .csv files are accepted</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            {loading ? "Processing..." : "Upload & Process"}
          </button>
          {(file || result) && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded border px-4 py-2 text-sm hover:opacity-80"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {error && (
        <div
          className="rounded border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", backgroundColor: "color-mix(in srgb, var(--color-danger) 8%, transparent)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}

      {result && (
        <>
          <TradePreview
            trades={result.trades}
            rowsAppended={result.rowsAppended}
            rowsSkipped={result.rowsSkipped}
            accounts={result.accounts}
          />
          {result.stats && <AggregateStats stats={result.stats} />}
        </>
      )}
    </div>
  );
}
