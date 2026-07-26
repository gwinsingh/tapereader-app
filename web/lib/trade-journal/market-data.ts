import { GroupedTrade } from "./trade-grouper";

// Daily-history fields can be "N/A" — the literal string written to the sheet
// when a recently listed ticker doesn't have enough daily bars to compute the
// value. null = not computable this run (leave the cell alone); "N/A" = will
// never be computable, so blank reliably means "not enriched yet".
export interface MarketEnrichment {
  consec1m: number | null;
  consec5m: number | null;
  consec1h: number | null;
  gapPct: number | string | null;
  atrPct: number | string | null;
  rvol: number | null;
  vwapPct: number | null;
  orSize: number | null;
  orAtrPct: number | string | null;
  orHigh: number | null;
  orLow: number | null;
  maxRBeforeStop: number | null;
  farthestPrice: number | null;
  maeR: number | null;
  breakoutVolRatio: number | null;
  priorCloseLoc: number | string | null;
  dist20Sma: number | string | null;
  dist50Sma: number | string | null;
  floatShares: number | null;
  avgDollarVol: number | string | null;
  spyDir: string | null;
  vix: number | null;
  pdc: number | string | null;
  pdh: number | string | null;
  pdl: number | string | null;
  // Trade-date daily candle (O/H/L/C/V) + volatility references. OHLCV is raw
  // generic data (future-proof: new questions won't need a re-backfill). atr14
  // is the daily ATR ($) and atr30m is the mean 9:30-10:00 ET range over the
  // prior 14 sessions — both pre-open snapshots (no lookahead). N/A-able when
  // the listing is too young to have the required prior history.
  dayOpen: number | string | null;
  dayHigh: number | string | null;
  dayLow: number | string | null;
  dayClose: number | string | null;
  dayVolume: number | string | null;
  atr14: number | string | null;
  atr30m: number | string | null;
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
  maeR: null,
  breakoutVolRatio: null,
  priorCloseLoc: null,
  dist20Sma: null,
  dist50Sma: null,
  floatShares: null,
  avgDollarVol: null,
  spyDir: null,
  vix: null,
  pdc: null,
  pdh: null,
  pdl: null,
  dayOpen: null,
  dayHigh: null,
  dayLow: null,
  dayClose: null,
  dayVolume: null,
  atr14: null,
  atr30m: null,
};

// --- Polygon.io fetchers ---

type PolygonAgg = { t: number; o: number; h: number; l: number; c: number; v: number };
type PolygonResponse = {
  status: string;
  results?: PolygonAgg[];
  error?: string;
  message?: string;
  next_url?: string;
};

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Fetch one Polygon page (with retry/backoff), returning the parsed JSON.
async function fetchPolygonPage(url: string, label: string): Promise<PolygonResponse> {
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
    throw new Error(detail || `Polygon ${label} HTTP ${res?.status}`);
  }

  // Guard against non-JSON responses (Polygon CDN can return HTML challenge
  // pages when rate-limited, even with HTTP 200 status).
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Polygon ${label}: non-JSON response (${contentType || "no content-type"})`);
  }

  try {
    return (await res.json()) as PolygonResponse;
  } catch {
    throw new Error(`Polygon ${label}: invalid JSON response`);
  }
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
  const label = `${symbol} ${multiplier}${timespan}`;

  // Polygon caps a single response at 50,000 rows. A minute-resolution range
  // spanning more than ~55 trading days (e.g. QQQ/SPY across months) exceeds
  // that, and with sort=asc the tail (most recent dates) would be silently
  // dropped — leaving recent trades un-enriched. Follow next_url to page through
  // the full range instead. (Cap pages defensively to avoid runaway loops.)
  let url =
    `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}` +
    `/range/${multiplier}/${timespan}/${from}/${to}` +
    `?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

  const all: PolygonAgg[] = [];
  for (let page = 0; page < 12 && url; page++) {
    const json = await fetchPolygonPage(url, label);
    if (json.status === "ERROR") {
      throw new Error(`Polygon error: ${json.error ?? json.message ?? json.status}`);
    }
    if (json.results?.length) all.push(...json.results);
    // next_url carries the paging cursor but not the API key — re-append it.
    url = json.next_url ? `${json.next_url}&apiKey=${apiKey}` : "";
  }

  return all.map((r) => ({
    ts: r.t / 1000,
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));
}

// --- VIX (per-date, index data) ---
//
// Preferred source is Polygon's I:VIX daily aggregates, but index data needs a
// Polygon Indices plan — a stocks-only key gets NOT_AUTHORIZED (verified on the
// current plan). Fallback: CBOE's free public daily VIX history CSV, which needs
// no auth and covers 1990 → yesterday. The entitlement result and the parsed
// CBOE history are memoized per isolate so a multi-symbol run fetches each
// source at most once.

const CBOE_VIX_URL = "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv";

let polygonVixEntitled: boolean | null = null;
let cboeVixCache: Map<string, number> | null = null;

async function fetchCboeVixHistory(): Promise<Map<string, number>> {
  if (cboeVixCache) return cboeVixCache;
  const res = await fetch(CBOE_VIX_URL);
  if (!res.ok) throw new Error(`CBOE VIX history HTTP ${res.status}`);
  const text = await res.text();
  const map = new Map<string, number>();
  // Format: DATE,OPEN,HIGH,LOW,CLOSE with DATE as MM/DD/YYYY
  for (const line of text.split("\n").slice(1)) {
    const parts = line.trim().split(",");
    if (parts.length < 5) continue;
    const [mm, dd, yyyy] = parts[0].split("/");
    if (!yyyy) continue;
    const close = parseFloat(parts[4]);
    if (isNaN(close)) continue;
    map.set(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`, Math.round(close * 100) / 100);
  }
  if (map.size === 0) throw new Error("CBOE VIX history: no rows parsed");
  cboeVixCache = map;
  return map;
}

// Date (YYYY-MM-DD) -> VIX close for [earliest, latest]. Never throws — VIX is
// supplementary; an empty map just leaves the cells blank for a later retry.
export async function fetchVixMap(earliest: string, latest: string): Promise<Map<string, number>> {
  if (polygonVixEntitled !== false) {
    try {
      const bars = await fetchPolygon("I:VIX", 1, "day", earliest, latest);
      polygonVixEntitled = true;
      const map = new Map<string, number>();
      for (const b of bars) {
        map.set(timestampToET(b.ts).date, Math.round(b.close * 100) / 100);
      }
      if (map.size > 0) return map;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/not entitled|not_authorized/i.test(msg)) polygonVixEntitled = false;
    }
  }
  try {
    return await fetchCboeVixHistory();
  } catch {
    return new Map();
  }
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

// Memoized: Intl.formatToParts is expensive and the same bar timestamps are
// converted millions of times (each bar is re-processed across every trade of a
// symbol). Without the cache, wide-range symbols (QQQ/SPY, dozens of trades over
// months) blew the Cloudflare edge isolate's CPU limit → HTTP 503 during backfill.
// Bar timestamps are a small, bounded set per run, so the cache stays modest.
const etCache = new Map<number, { date: string; h: number; m: number }>();
const ET_CACHE_MAX = 250_000; // ~months of 1-min bars for several symbols; bounded so a reused isolate can't grow without limit
function timestampToET(ts: number): { date: string; h: number; m: number } {
  const cached = etCache.get(ts);
  if (cached) return cached;
  const parts = etFmt.formatToParts(new Date(ts * 1000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const result = {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    h: parseInt(get("hour")),
    m: parseInt(get("minute")),
  };
  if (etCache.size >= ET_CACHE_MAX) etCache.clear();
  etCache.set(ts, result);
  return result;
}

function etMinutes(h: number, m: number): number {
  return h * 60 + m;
}

function parseEntryMinutes(entryTime: string): number {
  const [h, m] = entryTime.split(":").map(Number);
  return etMinutes(h, m);
}

// --- Bar filtering & aggregation ---

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

// 30-minute ATR: mean of the 9:30-10:00 ET opening range (high-low) over the
// 14 sessions BEFORE the trade date. A pre-open snapshot (no lookahead) that
// captures the "typical opening-bell move" — the unit that matters most when
// entering at the open. Built from intraday 1-min bars, so the intraday fetch
// window must extend >=14 trading days before the earliest trade (see
// enrichSymbol). Returns null if fewer than 14 prior sessions are available.
const OPEN30_START_MIN = 570; // 9:30 ET
const OPEN30_END_MIN = 600;   // 10:00 ET

interface OpenRangeDay {
  date: string;
  range: number;
}

// Precompute each session's 9:30-10:00 range ONCE per symbol. Doing this inside
// compute30mATR (per trade) rebuilt a by-date map over the whole multi-month
// 1-min series on every trade, which for wide-range symbols (e.g. QQQ/SPY with
// dozens of trades across months) spiked the Cloudflare edge isolate past its
// resource limit (503). This runs a single O(bars) pass; compute30mATR is then
// an O(distinct-dates) slice.
function buildOpenRangeByDate(grouped: Map<string, Bar[]>): OpenRangeDay[] {
  const out: OpenRangeDay[] = [];
  for (const [date, bars] of grouped) {
    let high = -Infinity;
    let low = Infinity;
    for (const b of bars) {
      const et = timestampToET(b.ts);
      const min = etMinutes(et.h, et.m);
      if (min < OPEN30_START_MIN || min >= OPEN30_END_MIN) continue;
      if (b.high > high) high = b.high;
      if (b.low < low) low = b.low;
    }
    if (high === -Infinity) continue;
    out.push({ date, range: high - low });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return out;
}

function compute30mATR(openRangeByDate: OpenRangeDay[], tradeDate: string): number | null {
  const prior = openRangeByDate.filter((d) => d.date < tradeDate);
  if (prior.length < 14) return null;
  const last14 = prior.slice(-14);
  return Math.round((last14.reduce((s, d) => s + d.range, 0) / 14) * 100) / 100;
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
  grouped: Map<string, Bar[]>,
  tradeDate: string,
  entryMinute: number
): number | null {
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

  for (let i = 0; i < barsInWindow.length; i++) {
    const b = barsInWindow[i];

    // Skip adverse check on entry bar — its low/high may reflect
    // price action before the entry, which happened mid-bar.
    if (i > 0) {
      const adverse = isLong ? entryPrice - b.low : b.high - entryPrice;
      if (adverse >= riskPerShare) break;
    }

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

// --- MAE (Max Adverse Excursion) over the actual holding window ---

// Walks 1-min bars from entry to exit and returns the worst adverse R-multiple
// as a negative number (e.g. -0.62), or 0 if the trade never went against
// entry. Skips the adverse check on the entry bar (intra-bar order unknown),
// consistent with computeMaxRBeforeStop. Unlike Max R this does NOT stop at the
// stop-loss level — it measures the heat actually taken while in the trade.
function computeMAE(
  dayBars: Bar[],
  entryMinute: number,
  exitMinute: number,
  entryPrice: number,
  riskPerShare: number,
  isLong: boolean
): number | null {
  if (riskPerShare <= 0 || exitMinute < entryMinute) return null;
  const barsInWindow = dayBars.filter((b) => {
    const et = timestampToET(b.ts);
    const min = etMinutes(et.h, et.m);
    return min >= entryMinute && min <= exitMinute;
  });
  if (barsInWindow.length === 0) return null;

  let maxAdverse = 0;
  for (let i = 1; i < barsInWindow.length; i++) {
    const b = barsInWindow[i];
    const adverse = isLong ? entryPrice - b.low : b.high - entryPrice;
    if (adverse > maxAdverse) maxAdverse = adverse;
  }

  return maxAdverse === 0 ? 0 : -Math.round((maxAdverse / riskPerShare) * 100) / 100;
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
  intradayByDate: Map<string, Bar[]>,
  dailyBars: DailyBar[],
  floatShares: number | null,
  spyBarsForDate: Bar[],
  vixLevel: number | null,
  openRangeByDate: OpenRangeDay[],
  riskPerShare?: number,
  youngListing?: boolean
): MarketEnrichment {
  const entryMinute = parseEntryMinutes(trade.entryTime);
  const dayBars = intradayByDate.get(trade.date) || [];
  if (dayBars.length === 0) return { ...EMPTY };

  const isLong = trade.side === "Long";

  // Position of the trade date in the fetched daily history. Used both for
  // prior-day fields and to decide N/A: if the listing is young (daily bars
  // begin at the IPO, well after our requested fetch start) and the trade date
  // sits closer to the first bar than a field's required lookback, that field
  // is impossible to compute — write "N/A" so blank means "not enriched yet".
  const dayIdx = dailyBars.findIndex((b) => b.date === trade.date);
  const naIfYoung = (value: number | null, requiredDays: number): number | string | null => {
    if (value !== null) return value;
    if (youngListing && dayIdx >= 0 && dayIdx < requiredDays) return "N/A";
    return null;
  };

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
  const rvol = computeRVOL(intradayByDate, trade.date, entryMinute);

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

  // MAE over the actual holding window (entry -> exit); requires R, like Max R
  const maeR = riskPerShare && riskPerShare > 0 && trade.exitTime
    ? computeMAE(dayBars, entryMinute, parseEntryMinutes(trade.exitTime), trade.avgEntry, riskPerShare, isLong)
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

  // Prior day OHLC
  const prevDay = dayIdx >= 1 ? dailyBars[dayIdx - 1] : null;

  // Trade-date daily candle (raw OHLCV) + 30-minute ATR (pre-open snapshot).
  const dayCandle = dayIdx >= 0 ? dailyBars[dayIdx] : null;
  const atr30m = compute30mATR(openRangeByDate, trade.date);

  return {
    consec1m,
    consec5m,
    consec1h,
    gapPct: naIfYoung(gapPct !== null ? Math.round(gapPct * 100) / 100 : null, 1),
    atrPct: naIfYoung(atrPct !== null ? Math.round(atrPct * 10) / 10 : null, 15),
    rvol,
    vwapPct: vwapPct !== null ? Math.round(vwapPct * 100) / 100 : null,
    orSize,
    orAtrPct: naIfYoung(orAtrPct, 15),
    orHigh: or ? Math.round(or.orHigh * 100) / 100 : null,
    orLow: or ? Math.round(or.orLow * 100) / 100 : null,
    maxRBeforeStop: maxRResult?.maxR ?? null,
    farthestPrice: maxRResult?.farthestPrice ?? null,
    maeR,
    breakoutVolRatio,
    priorCloseLoc: naIfYoung(priorCloseLoc, 1),
    dist20Sma: naIfYoung(dist20Sma, 20),
    dist50Sma: naIfYoung(dist50Sma, 50),
    floatShares,
    avgDollarVol: naIfYoung(avgDollarVol, 20),
    spyDir,
    vix: vixLevel,
    pdc: naIfYoung(prevDay ? Math.round(prevDay.close * 100) / 100 : null, 1),
    pdh: naIfYoung(prevDay ? Math.round(prevDay.high * 100) / 100 : null, 1),
    pdl: naIfYoung(prevDay ? Math.round(prevDay.low * 100) / 100 : null, 1),
    dayOpen: dayCandle ? Math.round(dayCandle.open * 100) / 100 : null,
    dayHigh: dayCandle ? Math.round(dayCandle.high * 100) / 100 : null,
    dayLow: dayCandle ? Math.round(dayCandle.low * 100) / 100 : null,
    dayClose: dayCandle ? Math.round(dayCandle.close * 100) / 100 : null,
    dayVolume: dayCandle ? dayCandle.volume : null,
    atr14: naIfYoung(atr !== null ? Math.round(atr * 100) / 100 : null, 15),
    atr30m: naIfYoung(atr30m, 14),
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
  // Fetch 28 extra calendar days of intraday data before the earliest trade.
  // ~7 would cover the RVOL baseline, but the 30-minute ATR needs the 9:30-10:00
  // range over the 14 sessions BEFORE the trade date, so the earliest trade in a
  // batch must have >=14 prior trading days of 1-min bars in the window
  // (28 calendar days ~= 18-19 trading days, comfortable margin over 14).
  const intradayFromDate = new Date(earliest);
  intradayFromDate.setUTCDate(intradayFromDate.getUTCDate() - 28);
  const intradayFrom = fmtDate(intradayFromDate);

  // 250 calendar days back: enough margin for the 50-day SMA even on sparsely
  // traded tickers (e.g. SPACs like SPCX trade well under half of sessions, so
  // Polygon returns far fewer bars than calendar days). Still one request.
  // Also anchors the young-listing check below.
  const dailyFrom = new Date(earliest);
  dailyFrom.setUTCDate(dailyFrom.getUTCDate() - 250);

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
  // Per-date VIX close: Polygon I:VIX when the plan allows it, else CBOE's
  // free daily history CSV (memoized per isolate — one fetch covers all dates).
  const vixByDate = await fetchVixMap(earliest, latest);

  const dailyBars: DailyBar[] = rawDaily.map((b) => ({
    date: timestampToET(b.ts).date,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));

  // Young listing: Polygon only returns bars since the IPO, so if the first
  // daily bar starts well after the window we asked for, the ticker simply
  // doesn't have the history — ATR/SMA-family fields get "N/A", not blank.
  // 21-day slack tolerates sparse tickers whose first fetched bar lags the
  // window start by a gap in trading rather than a recent listing (harmless
  // either way: N/A is only written when the bar count is also insufficient).
  const dailyFromSlack = new Date(dailyFrom);
  dailyFromSlack.setUTCDate(dailyFromSlack.getUTCDate() + 21);
  const youngListing = dailyBars.length > 0 && dailyBars[0].date > fmtDate(dailyFromSlack);

  const spyByDate = barsByDate(spyRaw);
  // Group the symbol's 1-min bars by date ONCE (not per trade). Every per-trade
  // computation then reads its day's bars (and the opening-range baseline) from
  // these maps — keeps enrich CPU bounded regardless of how many trades or how
  // wide the date range is (was a source of edge resource-limit 503s).
  const intradayByDate = barsByDate(raw1m);
  const openRangeByDate = buildOpenRangeByDate(intradayByDate);

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
        intradayByDate,
        dailyBars,
        floatShares,
        spyByDate.get(t.date) || [],
        vixByDate.get(t.date) ?? null,
        openRangeByDate,
        t.riskPerShare,
        youngListing
      ),
    };
  });

  return { symbol, enrichments };
}
