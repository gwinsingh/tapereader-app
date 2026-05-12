import { GroupedTrade } from "./trade-grouper";

export interface MarketEnrichment {
  consec1m: number | null;
  consec5m: number | null;
  consec1h: number | null;
  gapPct: number | null;
  atrPct: number | null;
  rvol: number | null;
  vwapPct: number | null;
}

interface Bar {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DailyBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const EMPTY: MarketEnrichment = {
  consec1m: null,
  consec5m: null,
  consec1h: null,
  gapPct: null,
  atrPct: null,
  rvol: null,
  vwapPct: null,
};

// --- Yahoo Finance fetchers ---

type YahooResult = {
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

const YAHOO_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

async function fetchYahoo(symbol: string, interval: string, range: string): Promise<Bar[]> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=${interval}&range=${range}`;

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url, {
      headers: { "User-Agent": YAHOO_UA, Accept: "application/json" },
    });
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  if (!res || !res.ok) throw new Error(`Yahoo ${symbol} ${interval} HTTP ${res?.status}`);

  const json = (await res.json()) as YahooResult;
  const result = json.chart.result?.[0];
  if (!result?.timestamp || !result.indicators?.quote?.[0]) return [];

  const ts = result.timestamp;
  const q = result.indicators.quote[0];
  const bars: Bar[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i], v = q.volume[i];
    if (o == null || h == null || l == null || c == null) continue;
    bars.push({ ts: ts[i], open: o, high: h, low: l, close: c, volume: v ?? 0 });
  }
  return bars;
}

// --- Timezone helpers ---

const etFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function timestampToET(ts: number): { date: string; h: number; m: number } {
  const parts = etFmt.formatToParts(new Date(ts * 1000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    h: parseInt(get("hour")),
    m: parseInt(get("minute")),
  };
}

function etMinutes(h: number, m: number): number {
  return h * 60 + m;
}

function parseEntryMinutes(entryTime: string): number {
  const [h, m] = entryTime.split(":").map(Number);
  return etMinutes(h, m);
}

// --- Bar filtering & aggregation ---

function barsForDate(bars: Bar[], date: string): Bar[] {
  return bars.filter((b) => timestampToET(b.ts).date === date);
}

function barsByDate(bars: Bar[]): Map<string, Bar[]> {
  const map = new Map<string, Bar[]>();
  for (const b of bars) {
    const d = timestampToET(b.ts).date;
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(b);
  }
  return map;
}

function aggregate(bars: Bar[], periodMinutes: number): Bar[] {
  const buckets = new Map<number, Bar[]>();
  for (const bar of bars) {
    const et = timestampToET(bar.ts);
    const minSinceOpen = etMinutes(et.h, et.m) - 570; // 9:30 ET = 570 min
    const bucket = Math.floor(minSinceOpen / periodMinutes);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(bar);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => ({
      ts: group[0].ts,
      open: group[0].open,
      high: Math.max(...group.map((b) => b.high)),
      low: Math.min(...group.map((b) => b.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((s, b) => s + b.volume, 0),
    }));
}

// --- Metric computations ---

function findEntryBarIndex(bars: Bar[], entryMinute: number): number {
  for (let i = bars.length - 1; i >= 0; i--) {
    const et = timestampToET(bars[i].ts);
    if (etMinutes(et.h, et.m) <= entryMinute) return i;
  }
  return -1;
}

function countConsecutive(bars: Bar[], entryIdx: number, isLong: boolean): number {
  let count = 0;
  for (let i = entryIdx; i >= 0; i--) {
    const bullish = bars[i].close >= bars[i].open;
    if (isLong ? bullish : !bullish) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function computeGap(dailyBars: DailyBar[], tradeDate: string): number | null {
  const idx = dailyBars.findIndex((b) => b.date === tradeDate);
  if (idx < 1) return null;
  const prevClose = dailyBars[idx - 1].close;
  if (prevClose === 0) return null;
  return ((dailyBars[idx].open - prevClose) / prevClose) * 100;
}

function computeATR14(dailyBars: DailyBar[], tradeDate: string): number | null {
  const idx = dailyBars.findIndex((b) => b.date === tradeDate);
  if (idx < 15) return null;

  let sum = 0;
  for (let i = idx - 14; i < idx; i++) {
    const tr = Math.max(
      dailyBars[i].high - dailyBars[i].low,
      Math.abs(dailyBars[i].high - dailyBars[i - 1].close),
      Math.abs(dailyBars[i].low - dailyBars[i - 1].close)
    );
    sum += tr;
  }
  return sum / 14;
}

function computeAtrPct(dayBars: Bar[], entryIdx: number, atr: number): number {
  let high = -Infinity, low = Infinity;
  for (let i = 0; i <= entryIdx; i++) {
    if (dayBars[i].high > high) high = dayBars[i].high;
    if (dayBars[i].low < low) low = dayBars[i].low;
  }
  return ((high - low) / atr) * 100;
}

function computeVWAP(dayBars: Bar[], entryIdx: number): number {
  let cumPV = 0, cumV = 0;
  for (let i = 0; i <= entryIdx; i++) {
    const tp = (dayBars[i].high + dayBars[i].low + dayBars[i].close) / 3;
    cumPV += tp * dayBars[i].volume;
    cumV += dayBars[i].volume;
  }
  return cumV > 0 ? cumPV / cumV : 0;
}

function computeRVOL(
  allIntradayBars: Bar[],
  tradeDate: string,
  entryMinute: number
): number | null {
  const grouped = barsByDate(allIntradayBars);
  const tradeDayBars = grouped.get(tradeDate);
  if (!tradeDayBars) return null;

  const volumeUpTo = (bars: Bar[], cutoffMinute: number) =>
    bars
      .filter((b) => {
        const et = timestampToET(b.ts);
        return etMinutes(et.h, et.m) <= cutoffMinute;
      })
      .reduce((s, b) => s + b.volume, 0);

  const tradeDayVol = volumeUpTo(tradeDayBars, entryMinute);

  const priorDays = [...grouped.entries()]
    .filter(([d]) => d < tradeDate)
    .sort(([a], [b]) => a.localeCompare(b));

  if (priorDays.length === 0) return null;

  const priorVols = priorDays.map(([, bars]) => volumeUpTo(bars, entryMinute));
  const avgPrior = priorVols.reduce((s, v) => s + v, 0) / priorVols.length;
  return avgPrior > 0 ? Math.round((tradeDayVol / avgPrior) * 100) / 100 : null;
}

// --- Main enrichment function ---

function computeEnrichment(
  trade: GroupedTrade,
  intradayBars: Bar[],
  dailyBars: DailyBar[]
): MarketEnrichment {
  const entryMinute = parseEntryMinutes(trade.entryTime);
  const dayBars = barsForDate(intradayBars, trade.date);
  if (dayBars.length === 0) return { ...EMPTY };

  const isLong = trade.side === "Long";

  // Consecutive candles at 1m, 5m, 1H
  const idx1m = findEntryBarIndex(dayBars, entryMinute);
  const consec1m = idx1m >= 0 ? countConsecutive(dayBars, idx1m, isLong) : null;

  const bars5m = aggregate(dayBars, 5);
  const idx5m = findEntryBarIndex(bars5m, entryMinute);
  const consec5m = idx5m >= 0 ? countConsecutive(bars5m, idx5m, isLong) : null;

  const bars1h = aggregate(dayBars, 60);
  const idx1h = findEntryBarIndex(bars1h, entryMinute);
  const consec1h = idx1h >= 0 ? countConsecutive(bars1h, idx1h, isLong) : null;

  // Gap %
  const gapPct = computeGap(dailyBars, trade.date);

  // %ATR
  const atr = computeATR14(dailyBars, trade.date);
  const atrPct = atr && idx1m >= 0 ? computeAtrPct(dayBars, idx1m, atr) : null;

  // RVOL
  const rvol = computeRVOL(intradayBars, trade.date, entryMinute);

  // %VWAP
  let vwapPct: number | null = null;
  if (idx1m >= 0) {
    const vwap = computeVWAP(dayBars, idx1m);
    if (vwap > 0) {
      vwapPct = ((trade.avgEntry - vwap) / vwap) * 100;
    }
  }

  return {
    consec1m,
    consec5m,
    consec1h,
    gapPct: gapPct !== null ? Math.round(gapPct * 100) / 100 : null,
    atrPct: atrPct !== null ? Math.round(atrPct * 10) / 10 : null,
    rvol,
    vwapPct: vwapPct !== null ? Math.round(vwapPct * 100) / 100 : null,
  };
}

export async function enrichTrades(trades: GroupedTrade[]): Promise<MarketEnrichment[]> {
  const symbols = [...new Set(trades.map((t) => t.symbol))];

  const cache = new Map<string, { intraday: Bar[]; daily: DailyBar[] }>();

  for (const symbol of symbols) {
    try {
      const [raw1m, rawDaily] = await Promise.all([
        fetchYahoo(symbol, "1m", "7d"),
        fetchYahoo(symbol, "1d", "1mo"),
      ]);

      const daily: DailyBar[] = rawDaily.map((b) => ({
        date: timestampToET(b.ts).date,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume,
      }));

      cache.set(symbol, { intraday: raw1m, daily });
    } catch (err) {
      console.warn(`[market-data] ${symbol} fetch failed:`, err instanceof Error ? err.message : err);
    }
  }

  return trades.map((trade) => {
    const data = cache.get(trade.symbol);
    if (!data) return { ...EMPTY };
    return computeEnrichment(trade, data.intraday, data.daily);
  });
}
