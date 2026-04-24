import type { Bar, Timeframe } from "../types";

// Polygon.io aggregates endpoint. Free tier: 5 req/min, 15-min delayed.
// Requires POLYGON_API_KEY env var.

type PolygonAgg = { t: number; o: number; h: number; l: number; c: number; v: number };
type PolygonAggsResponse = {
  status: string;
  results?: PolygonAgg[];
  resultsCount?: number;
  error?: string;
  message?: string;
};

function paramsFor(timeframe: Timeframe): {
  multiplier: number;
  timespan: "minute" | "day";
  daysBack: number;
  isDaily: boolean;
} {
  switch (timeframe) {
    case "daily":
      return { multiplier: 1, timespan: "day", daysBack: 365, isDaily: true };
    case "15m":
      return { multiplier: 15, timespan: "minute", daysBack: 30, isDaily: false };
    case "5m":
      return { multiplier: 5, timespan: "minute", daysBack: 5, isDaily: false };
  }
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchPolygonBars(symbol: string, timeframe: Timeframe): Promise<Bar[]> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) throw new Error("POLYGON_API_KEY is not set");

  const { multiplier, timespan, daysBack, isDaily } = paramsFor(timeframe);
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - daysBack);

  const url =
    `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}` +
    `/range/${multiplier}/${timespan}/${fmtDate(from)}/${fmtDate(to)}` +
    `?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Polygon ${symbol} ${timeframe} HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as PolygonAggsResponse;
  if (json.status === "ERROR" || !json.results) {
    throw new Error(`Polygon error: ${json.error ?? json.message ?? json.status}`);
  }
  return json.results.map((r) => {
    const date = new Date(r.t);
    return {
      time: isDaily ? date.toISOString().slice(0, 10) : date.toISOString(),
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v,
    };
  });
}
