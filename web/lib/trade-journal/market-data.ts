import { GroupedTrade } from "./trade-grouper";

export interface MarketEnrichment {
  consec1m: number | null;
  consec5m: number | null;
  consec1h: number | null;
  gapPct: number | null;
  atrPct: number | null;
  rvol: number | null;
  vwapPct: number | null;
  orSize: number | null;
  orAtrPct: number | null;
  orHigh: number | null;
  orLow: number | null;
  maxRBeforeStop: number | null;
  farthestPrice: number | null;
  breakoutVolRatio: number | null;
  priorCloseLoc: number | null;
  dist20Sma: number | null;
  dist50Sma: number | null;
  floatShares: number | null;
  avgDollarVol: number | null;
  spyDir: string | null;
  vix: number | null;
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
  orSize: null,
  orAtrPct: null,
  orHigh: null,
  orLow: null,
  maxRBeforeStop: null,
  farthestPrice: null,
  breakoutVolRatio: null,
  priorCloseLoc: null,
  dist20Sma: null,
  dist50Sma: null,
  floatShares: null,
  avgDollarVol: null,
  spyDir: null,
  vix: null,
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
  for (let attempt = 0; attempt < 5; attempt++) {
    res = await fetch(url);
    // Also treat HTML responses (CDN rate-limit pages) as retryable
    const ct = res.headers.get("content-type") || "";
    if (res.status !== 429 && (res.ok ? ct.includes("application/json") : true)) break;
    // Backoff: 5s, 10s, 20s, 30s, 30s
    const delay = Math.min(5000 * Math.pow(2, attempt), 30000);
    await new Promise((r) => setTimeout(r, delay));
  }
  if (!res || !res.ok) {
    const body = await res?.text().catch(() => "") ?? "";
    let detail = "";
    try { detail = JSON.parse(body).message || ""; } catch { /* ignore */ }
    throw new Error(detail || `Polygon ${symbol} ${multiplier}${timespan} HTTP ${res?.status}`);
  }

  // Guard against non-JSON responses (Polygon CDN can return HTML challenge
  // pages when rate-limited, even with HTTP 200 status).
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Polygon ${symbol} ${multiplier}${timespan}: non-JSON response (${contentType || "no content-type"})`);
  }

  let json: PolygonResponse;
  try {
    json = (await res.json()) as PolygonResponse;
  } catch {
    throw new Error(`Polygon ${symbol} ${multiplier}${timespan}: invalid JSON response`);
  }

  if (json.status === "ERROR") {
    throw new Error(`Polygon error: ${json.error ?? json.message ?? json.status}`);
  }

  // Polygon returns {status:"OK"} without results field when there's no data
  // for the given ticker/date range — this is not an error, just empty data.
  if (!json.results || json.results.length === 0) {
    return [];
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

async function fetchTickerDetails(symbol: string): Promise<number | null> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.polygon.io/v3/reference/tickers/${encodeURIComponent(symbol)}?apiKey=${apiKey}`;

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url);
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }

  if (!res || !res.ok) return null;

  try {
    const json = await res.json();
    return json?.results?.weighted_shares_outstanding
      ?? json?.results?.share_class_shares_outstanding
      ?? null;
  } catch {
    return null;
  }
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

// --- Opening Range computations ---

const OR_START_MIN = 570; // 9:30 ET
const OR_END_MIN = 575;   // 9:35 ET (5-min OR)

interface OpeningRange {
  orHigh: number;
  orLow: number;
  orBars: Bar[];
}

function computeOpeningRange(dayBars: Bar[]): OpeningRange | null {
  const orBars = dayBars.filter((b) => {
    const et = timestampToET(b.ts);
    const min = etMinutes(et.h, et.m);
    return min >= OR_START_MIN && min < OR_END_MIN;
  });
  if (orBars.length === 0) return null;

  return {
    orHigh: Math.max(...orBars.map((b) => b.high)),
    orLow: Math.min(...orBars.map((b) => b.low)),
    orBars,
  };
}

// --- Max R Before Stop (order-aware bar walking) ---

interface MaxRResult {
  maxR: number;
  farthestPrice: number;
}

function computeMaxRBeforeStop(
  dayBars: Bar[],
  entryMinute: number,
  entryPrice: number,
  riskPerShare: number,
  isLong: boolean
): MaxRResult | null {
  const EOD_MINUTE = 960; // 16:00 ET
  const barsInWindow = dayBars.filter((b) => {
    const et = timestampToET(b.ts);
    const min = etMinutes(et.h, et.m);
    return min >= entryMinute && min <= EOD_MINUTE;
  });
  if (barsInWindow.length === 0 || riskPerShare <= 0) return null;

  let maxFavorable = 0;
  let priceAtMax = entryPrice;

  for (const b of barsInWindow) {
    const adverse = isLong ? entryPrice - b.low : b.high - entryPrice;

    if (adverse >= riskPerShare) break;

    const favorable = isLong ? b.high - entryPrice : entryPrice - b.low;
    if (favorable > maxFavorable) {
      maxFavorable = favorable;
      priceAtMax = isLong ? b.high : b.low;
    }
  }

  return {
    maxR: Math.round((maxFavorable / riskPerShare) * 100) / 100,
    farthestPrice: Math.round(priceAtMax * 100) / 100,
  };
}

// --- Breakout volume ratio ---

function computeBreakoutVolRatio(
  dayBars: Bar[],
  orHigh: number,
  orLow: number,
  isLong: boolean
): number | null {
  const postOrBars = dayBars.filter((b) => {
    const et = timestampToET(b.ts);
    return etMinutes(et.h, et.m) >= OR_END_MIN;
  });

  const breakoutBar = postOrBars.find((b) =>
    isLong ? b.high > orHigh : b.low < orLow
  );
  if (!breakoutBar) return null;

  const orBars = dayBars.filter((b) => {
    const et = timestampToET(b.ts);
    const min = etMinutes(et.h, et.m);
    return min >= OR_START_MIN && min < OR_END_MIN;
  });
  if (orBars.length === 0) return null;

  const avgOrVol = orBars.reduce((s, b) => s + b.volume, 0) / orBars.length;
  return avgOrVol > 0 ? Math.round((breakoutBar.volume / avgOrVol) * 100) / 100 : null;
}

// --- Prior day close location ---

function computePriorCloseLoc(dailyBars: DailyBar[], tradeDate: string): number | null {
  const idx = dailyBars.findIndex((b) => b.date === tradeDate);
  if (idx < 1) return null;
  const prev = dailyBars[idx - 1];
  const range = prev.high - prev.low;
  if (range === 0) return null;
  return Math.round(((prev.close - prev.low) / range) * 1000) / 10;
}

// --- SMA ---

function computeSMA(dailyBars: DailyBar[], tradeDate: string, period: number): number | null {
  const idx = dailyBars.findIndex((b) => b.date === tradeDate);
  if (idx < period) return null;
  let sum = 0;
  for (let i = idx - period; i < idx; i++) {
    sum += dailyBars[i].close;
  }
  return sum / period;
}

// --- Average daily dollar volume ---

function computeAvgDollarVol(dailyBars: DailyBar[], tradeDate: string, period: number = 20): number | null {
  const idx = dailyBars.findIndex((b) => b.date === tradeDate);
  if (idx < period) return null;
  let sum = 0;
  for (let i = idx - period; i < idx; i++) {
    sum += dailyBars[i].close * dailyBars[i].volume;
  }
  return Math.round(sum / period);
}

// --- SPY direction ---

function computeSpyDir(spyDayBars: Bar[], entryMinute: number): string | null {
  if (spyDayBars.length === 0) return null;

  const spyOpen = spyDayBars[0].open;
  const entryBar = spyDayBars.filter((b) => {
    const et = timestampToET(b.ts);
    return etMinutes(et.h, et.m) <= entryMinute;
  });
  if (entryBar.length === 0) return null;

  const spyPriceAtEntry = entryBar[entryBar.length - 1].close;
  const pctChange = ((spyPriceAtEntry - spyOpen) / spyOpen) * 100;

  if (pctChange > 0.05) return "Up";
  if (pctChange < -0.05) return "Down";
  return "Flat";
}

// --- Main enrichment function ---

function computeEnrichment(
  trade: GroupedTrade & { exitTime: string },
  intradayBars: Bar[],
  dailyBars: DailyBar[],
  floatShares: number | null,
  spyBarsForDate: Bar[],
  vixLevel: number | null,
  riskPerShare?: number
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

  // ATR-14
  const atr = computeATR14(dailyBars, trade.date);

  // %ATR
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

  // Opening Range
  const or = computeOpeningRange(dayBars);
  const orSize = or ? Math.round((or.orHigh - or.orLow) * 100) / 100 : null;
  const orAtrPct = or && atr && atr > 0
    ? Math.round(((or.orHigh - or.orLow) / atr) * 1000) / 10
    : null;

  // Max R before stop (order-aware: walks bars, stops at stop-loss)
  const maxRResult = riskPerShare && riskPerShare > 0
    ? computeMaxRBeforeStop(dayBars, entryMinute, trade.avgEntry, riskPerShare, isLong)
    : null;

  // Breakout volume ratio
  const breakoutVolRatio = or
    ? computeBreakoutVolRatio(dayBars, or.orHigh, or.orLow, isLong)
    : null;

  // Prior close location
  const priorCloseLoc = computePriorCloseLoc(dailyBars, trade.date);

  // SMA distances
  const sma20 = computeSMA(dailyBars, trade.date, 20);
  const dist20Sma = sma20 && sma20 > 0
    ? Math.round(((trade.avgEntry - sma20) / sma20) * 1000) / 10
    : null;
  const sma50 = computeSMA(dailyBars, trade.date, 50);
  const dist50Sma = sma50 && sma50 > 0
    ? Math.round(((trade.avgEntry - sma50) / sma50) * 1000) / 10
    : null;

  // Avg dollar volume
  const avgDollarVol = computeAvgDollarVol(dailyBars, trade.date);

  // SPY direction
  const spyDir = computeSpyDir(spyBarsForDate, entryMinute);

  return {
    consec1m,
    consec5m,
    consec1h,
    gapPct: gapPct !== null ? Math.round(gapPct * 100) / 100 : null,
    atrPct: atrPct !== null ? Math.round(atrPct * 10) / 10 : null,
    rvol,
    vwapPct: vwapPct !== null ? Math.round(vwapPct * 100) / 100 : null,
    orSize,
    orAtrPct,
    orHigh: or ? Math.round(or.orHigh * 100) / 100 : null,
    orLow: or ? Math.round(or.orLow * 100) / 100 : null,
    maxRBeforeStop: maxRResult?.maxR ?? null,
    farthestPrice: maxRResult?.farthestPrice ?? null,
    breakoutVolRatio,
    priorCloseLoc,
    dist20Sma,
    dist50Sma,
    floatShares,
    avgDollarVol,
    spyDir,
    vix: vixLevel,
  };
}

export interface SymbolEnrichmentResult {
  symbol: string;
  enrichments: { tradeIndex: number; data: MarketEnrichment }[];
}

// Validate that a symbol looks like a real ticker (letters, dots, colons, hyphens)
// and not a number or other garbage from a misaligned column read.
function isValidSymbol(s: string): boolean {
  if (!s || s.length === 0 || s.length > 15) return false;
  // Reject if it parses as a number (catches "10.1", "3.5", etc.)
  if (!isNaN(Number(s))) return false;
  // Must contain at least one letter
  return /[A-Za-z]/.test(s);
}

export async function enrichSymbol(
  symbol: string,
  trades: { date: string; entryTime: string; exitTime: string; side: "Long" | "Short"; avgEntry: number; index: number; riskPerShare?: number }[]
): Promise<SymbolEnrichmentResult> {
  if (!isValidSymbol(symbol)) {
    throw new Error(`Invalid symbol "${symbol}" — expected a ticker like AAPL or SPY, got a number or empty value. This usually means the sheet columns are misaligned.`);
  }

  const tradeDates = [...new Set(trades.map((t) => t.date))].sort();
  const earliest = tradeDates[0];
  const latest = tradeDates[tradeDates.length - 1];

  // Polygon free tier blocks same-day intraday data — cap to yesterday ET
  const todayET = timestampToET(Date.now() / 1000).date;
  const yesterdayParts = todayET.split("-").map(Number);
  const yesterdayDate = new Date(Date.UTC(yesterdayParts[0], yesterdayParts[1] - 1, yesterdayParts[2] - 1));
  const yesterdayET = fmtDate(yesterdayDate);
  const intradayTo = latest < todayET ? latest : yesterdayET;
  // Fetch ~7 extra calendar days of intraday data for RVOL baseline
  const intradayFromDate = new Date(earliest);
  intradayFromDate.setUTCDate(intradayFromDate.getUTCDate() - 7);
  const intradayFrom = fmtDate(intradayFromDate);

  // Extended to 75 days for 50-day SMA
  const dailyFrom = new Date(earliest);
  dailyFrom.setUTCDate(dailyFrom.getUTCDate() - 75);

  // Stagger requests to stay within Polygon free-tier rate limits (5 req/min).
  // Batch 1: symbol's own bars (essential — 2 requests)
  const [raw1m, rawDaily] = await Promise.all([
    intradayFrom <= intradayTo
      ? fetchPolygon(symbol, 1, "minute", intradayFrom, intradayTo)
      : Promise.resolve([]),
    fetchPolygon(symbol, 1, "day", fmtDate(dailyFrom), latest),
  ]);

  // Small delay to avoid bursting rate limit
  await new Promise((r) => setTimeout(r, 1500));

  // Batch 2: supplementary data (all gracefully fallback to null/empty)
  const floatShares = await fetchTickerDetails(symbol);
  const spyRaw = intradayFrom <= intradayTo
    ? await fetchPolygon("SPY", 1, "minute", intradayFrom, intradayTo).catch(() => [] as Bar[])
    : [];
  const vixRaw = await fetchPolygon("I:VIX", 1, "day", earliest, latest)
    .catch(() => fetchPolygon("VIX", 1, "day", earliest, latest))
    .catch(() => [] as Bar[]);

  const dailyBars: DailyBar[] = rawDaily.map((b) => ({
    date: timestampToET(b.ts).date,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));

  const spyByDate = barsByDate(spyRaw);

  const vixByDate = new Map<string, number>();
  for (const b of vixRaw) {
    vixByDate.set(timestampToET(b.ts).date, b.close);
  }

  const enrichments = trades.map((t) => {
    const fake: GroupedTrade & { exitTime: string } = {
      date: t.date,
      entryTime: t.entryTime,
      exitTime: t.exitTime || "",
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
    return {
      tradeIndex: t.index,
      data: computeEnrichment(
        fake,
        raw1m,
        dailyBars,
        floatShares,
        spyByDate.get(t.date) || [],
        vixByDate.get(t.date) ?? null,
        t.riskPerShare
      ),
    };
  });

  return { symbol, enrichments };
}
