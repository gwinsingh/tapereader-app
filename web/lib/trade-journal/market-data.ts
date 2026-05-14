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

// --- Polygon.io fetchers ---

type PolygonAgg = { t: number; o: number; h: number; l: number; c: number; v: number };
type PolygonResponse = {
  status: string;
  results?: PolygonAgg[];
  error?: string;
  message?: string;
};

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchPolygon(
  symbol: string,
  multiplier: number,
  timespan: "minute" | "day",
  from: string,
  to: string
): Promise<Bar[]> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) throw new Error("POLYGON_API_KEY is not set");

  const url =
    `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}` +
    `/range/${multiplier}/${timespan}/${from}/${to}` +
    `?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url);
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  if (!res || !res.ok) {
    const body = await res?.text().catch(() => "") ?? "";
    let detail = "";
    try { detail = JSON.parse(body).message || ""; } catch { /* ignore */ }
    throw new Error(detail || `Polygon ${symbol} ${multiplier}${timespan} HTTP ${res?.status}`);
  }

  const json = (await res.json()) as PolygonResponse;
  if (json.status === "ERROR" || !json.results) {
    throw new Error(`Polygon error: ${json.error ?? json.message ?? json.status}`);
  }

  return json.results.map((r) => ({
    ts: r.t / 1000,
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));
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

export interface SymbolEnrichmentResult {
  symbol: string;
  enrichments: { tradeIndex: number; data: MarketEnrichment }[];
}

export async function enrichSymbol(
  symbol: string,
  trades: { date: string; entryTime: string; side: "Long" | "Short"; avgEntry: number; index: number }[]
): Promise<SymbolEnrichmentResult> {
  const tradeDates = [...new Set(trades.map((t) => t.date))].sort();
  const earliest = tradeDates[0];
  const latest = tradeDates[tradeDates.length - 1];

  // Polygon free tier blocks same-day intraday data — cap to yesterday ET
  const todayET = timestampToET(Date.now() / 1000).date;
  const yesterdayParts = todayET.split("-").map(Number);
  const yesterdayDate = new Date(Date.UTC(yesterdayParts[0], yesterdayParts[1] - 1, yesterdayParts[2] - 1));
  const yesterdayET = fmtDate(yesterdayDate);
  const intradayTo = latest < todayET ? latest : yesterdayET;
  const intradayFrom = earliest < todayET ? earliest : intradayTo;

  const dailyFrom = new Date(earliest);
  dailyFrom.setUTCDate(dailyFrom.getUTCDate() - 35);

  const fetches: [Promise<Bar[]>, Promise<Bar[]>] = [
    intradayFrom <= intradayTo
      ? fetchPolygon(symbol, 1, "minute", intradayFrom, intradayTo)
      : Promise.resolve([]),
    fetchPolygon(symbol, 1, "day", fmtDate(dailyFrom), latest),
  ];
  const [raw1m, rawDaily] = await Promise.all(fetches);

  const dailyBars: DailyBar[] = rawDaily.map((b) => ({
    date: timestampToET(b.ts).date,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));

  const enrichments = trades.map((t) => {
    const fake: GroupedTrade = {
      date: t.date,
      entryTime: t.entryTime,
      exitTime: "",
      symbol,
      side: t.side,
      totalShares: 0,
      avgEntry: t.avgEntry,
      avgExit: 0,
      numPartials: 0,
      pnl: 0,
      durationMins: 0,
      account: "",
    };
    return { tradeIndex: t.index, data: computeEnrichment(fake, raw1m, dailyBars) };
  });

  return { symbol, enrichments };
}
