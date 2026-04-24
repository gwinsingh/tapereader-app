"use client";

const KEY = "tapereader.watchlist.v1";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function setWatchlist(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(list.map((s) => s.toUpperCase())))));
  window.dispatchEvent(new Event("watchlist:change"));
}

export function inWatchlist(symbol: string): boolean {
  return getWatchlist().includes(symbol.toUpperCase());
}

export function addToWatchlist(symbol: string) {
  const next = Array.from(new Set([...getWatchlist(), symbol.toUpperCase()]));
  setWatchlist(next);
}

export function removeFromWatchlist(symbol: string) {
  setWatchlist(getWatchlist().filter((s) => s !== symbol.toUpperCase()));
}
