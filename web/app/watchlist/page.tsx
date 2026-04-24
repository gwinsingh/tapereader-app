"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWatchlist, removeFromWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSymbols(getWatchlist());
    setReady(true);
    const h = () => setSymbols(getWatchlist());
    window.addEventListener("watchlist:change", h);
    return () => window.removeEventListener("watchlist:change", h);
  }, []);

  if (!ready) return null;

  return (
    <div>
      <h1 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Your Watchlist</h1>
      {symbols.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-panel p-8 text-center">
          <p className="text-sm text-muted">
            Your watchlist is empty. Search for a ticker (press <kbd className="rounded border border-border px-1 font-mono">/</kbd>) and add it from the ticker page.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {symbols.map((s) => (
            <div key={s} className="flex items-center justify-between rounded border border-border bg-panel p-3">
              <Link href={`/ticker/${s}`} className="font-mono text-lg font-semibold hover:text-accent">
                {s}
              </Link>
              <button
                onClick={() => removeFromWatchlist(s)}
                className="text-xs text-muted hover:text-danger"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
