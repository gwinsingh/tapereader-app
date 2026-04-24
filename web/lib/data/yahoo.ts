import type { Bar, Timeframe } from "../types";

// Yahoo Finance unofficial chart endpoint — no API key required.
// Risk: Yahoo can change/break this without notice.

type YahooChartResponse = {
  chart: {
    result?: Array<{
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
};

function paramsFor(timeframe: Timeframe): { interval: string; range: string; isDaily: boolean } {
  switch (timeframe) {
    case "daily":
      return { interval: "1d", range: "1y", isDaily: true };
    case "15m":
      return { interval: "15m", range: "1mo", isDaily: false };
    case "5m":
      return { interval: "5m", range: "5d", isDaily: false };
  }
}

export async function fetchYahooBars(symbol: string, timeframe: Timeframe): Promise<Bar[]> {
  const { interval, range, isDaily } = paramsFor(timeframe);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?range=${range}&interval=${interval}`;

  const res = await fetch(url, {
    headers: {
      // Yahoo blocks default fetch UAs sometimes
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 900 }, // 15 min cache
  });

  if (!res.ok) {
    throw new Error(`Yahoo ${symbol} ${timeframe} HTTP ${res.status}`);
  }
  const json = (await res.json()) as YahooChartResponse;
  const result = json.chart.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    return [];
  }
  const ts = result.timestamp;
  const q = result.indicators.quote[0];
  const bars: Bar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open[i];
    const h = q.high[i];
    const l = q.low[i];
    const c = q.close[i];
    const v = q.volume[i];
    if (o == null || h == null || l == null || c == null) continue;
    const date = new Date(ts[i] * 1000);
    bars.push({
      time: isDaily ? date.toISOString().slice(0, 10) : date.toISOString(),
      open: +o.toFixed(4),
      high: +h.toFixed(4),
      low: +l.toFixed(4),
      close: +c.toFixed(4),
      volume: v ?? 0,
    });
  }
  return bars;
}
