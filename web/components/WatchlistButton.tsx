"use client";

import { useEffect, useState } from "react";
import { addToWatchlist, inWatchlist, removeFromWatchlist } from "@/lib/watchlist";

export default function WatchlistButton({ symbol }: { symbol: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(inWatchlist(symbol));
    const handler = () => setActive(inWatchlist(symbol));
    window.addEventListener("watchlist:change", handler);
    return () => window.removeEventListener("watchlist:change", handler);
  }, [symbol]);

  return (
    <button
      onClick={() => (active ? removeFromWatchlist(symbol) : addToWatchlist(symbol))}
      className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-panel text-text hover:border-accent"
      }`}
    >
      {active ? "★ In watchlist" : "☆ Add to watchlist"}
    </button>
  );
}
