"use client";

import { useState, useRef, FormEvent, DragEvent } from "react";
import TradePreview from "@/components/trade-journal/TradePreview";
import AggregateStats from "@/components/trade-journal/AggregateStats";

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
}

interface UploadResult {
  success: boolean;
  date: string;
  tradesProcessed: number;
  rowsAppended: number;
  rowsSkipped: number;
  accounts: string[];
  trades: TradeRow[];
  stats: StatsData | null;
}

function getTodayEST(): string {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, "0");
  const d = String(est.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TradeJournalPage() {
  const [date, setDate] = useState(getTodayEST());
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
      <div>
        <h1 className="text-2xl font-bold">Auto Trade Journal</h1>
        <p className="mt-1 text-sm text-muted">
          Upload your DAS Trader CSV export. Executed trades are grouped into round-trip
          entries and appended to the shared Google Sheet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label htmlFor="trade-date" className="mb-1 block text-xs font-medium text-muted">
              Trade Date
            </label>
            <input
              id="trade-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-border bg-panel px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="sheet-suffix" className="mb-1 block text-xs font-medium text-muted">
              Sheet Name Suffix
            </label>
            <input
              id="sheet-suffix"
              type="text"
              value={sheetSuffix}
              onChange={(e) => setSheetSuffix(e.target.value)}
              placeholder="e.g. yourname"
              className="rounded border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
            <p className="mt-0.5 text-xs text-muted/60">
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
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : file
                ? "border-accent/50 bg-panel"
                : "border-border hover:border-muted"
          }`}
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
              <p className="font-mono text-sm font-semibold text-accent">{file.name}</p>
              <p className="text-xs text-muted">
                {(file.size / 1024).toFixed(1)} KB — click or drop to replace
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted">
                Drop your DAS Trader CSV here, or click to browse
              </p>
              <p className="text-xs text-muted/60">Only .csv files are accepted</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Processing..." : "Upload & Process"}
          </button>
          {(file || result) && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded border border-border px-4 py-2 text-sm text-muted hover:text-text"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="rounded border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
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
