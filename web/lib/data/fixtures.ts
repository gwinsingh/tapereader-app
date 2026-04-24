import type { Bar, Mover, Setup, Ticker, Timeframe } from "../types";

type Seed = { s: number };
function rand(seed: Seed): number {
  // mulberry32
  seed.s |= 0;
  seed.s = (seed.s + 0x6d2b79f5) | 0;
  let t = seed.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const UNIVERSE: { symbol: string; name: string; sector: string; basePrice: number }[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", basePrice: 215 },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", basePrice: 420 },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", basePrice: 135 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical", basePrice: 245 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", basePrice: 195 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services", basePrice: 175 },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Communication Services", basePrice: 540 },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology", basePrice: 165 },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services", basePrice: 685 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services", basePrice: 218 },
];

function isWeekend(d: Date) {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

function generateDailyBars(symbol: string, basePrice: number, days: number): Bar[] {
  const seed: Seed = { s: hashSeed(symbol) };
  const bars: Bar[] = [];
  let price = basePrice * 0.85; // start lower to give an uptrend
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const dates: Date[] = [];
  const cursor = new Date(end);
  while (dates.length < days) {
    if (!isWeekend(cursor)) dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  dates.reverse();
  for (const d of dates) {
    const drift = 0.0015; // mild uptrend
    const vol = 0.018;
    const r = (rand(seed) - 0.5) * 2;
    const change = drift + r * vol;
    const open = price;
    const close = Math.max(1, open * (1 + change));
    const high = Math.max(open, close) * (1 + rand(seed) * 0.012);
    const low = Math.min(open, close) * (1 - rand(seed) * 0.012);
    const volume = Math.floor(20_000_000 + rand(seed) * 60_000_000);
    bars.push({
      time: d.toISOString().slice(0, 10),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return bars;
}

function generateIntradayBars(symbol: string, dailyClose: number, timeframe: "5m" | "15m"): Bar[] {
  const seed: Seed = { s: hashSeed(symbol + timeframe) };
  const bars: Bar[] = [];
  const stepMin = timeframe === "5m" ? 5 : 15;
  const sessionsBack = timeframe === "5m" ? 5 : 30;
  let price = dailyClose * 0.99;
  // generate sessions ending today (skip weekends), 9:30 to 16:00 ET (use UTC -4 ~ 13:30 to 20:00 UTC for simplicity)
  const sessionDates: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while (sessionDates.length < sessionsBack) {
    if (!isWeekend(cursor)) sessionDates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  sessionDates.reverse();
  for (const d of sessionDates) {
    const start = new Date(d);
    start.setUTCHours(13, 30, 0, 0);
    const end = new Date(d);
    end.setUTCHours(20, 0, 0, 0);
    for (let t = start.getTime(); t < end.getTime(); t += stepMin * 60_000) {
      const r = (rand(seed) - 0.5) * 2;
      const change = r * 0.003;
      const open = price;
      const close = Math.max(1, open * (1 + change));
      const high = Math.max(open, close) * (1 + rand(seed) * 0.0015);
      const low = Math.min(open, close) * (1 - rand(seed) * 0.0015);
      const volume = Math.floor(50_000 + rand(seed) * 400_000);
      bars.push({
        time: new Date(t).toISOString(),
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
        volume,
      });
      price = close;
    }
  }
  return bars;
}

const dailyCache = new Map<string, Bar[]>();
function getDaily(symbol: string, basePrice: number) {
  if (!dailyCache.has(symbol)) {
    dailyCache.set(symbol, generateDailyBars(symbol, basePrice, 180));
  }
  return dailyCache.get(symbol)!;
}

export function fixtureTickers(): Ticker[] {
  return UNIVERSE.map((u) => {
    const bars = getDaily(u.symbol, u.basePrice);
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2];
    return {
      symbol: u.symbol,
      name: u.name,
      sector: u.sector,
      lastPrice: last.close,
      changePct: ((last.close - prev.close) / prev.close) * 100,
      volume: last.volume,
      asOf: last.time,
    };
  });
}

export function fixtureTicker(symbol: string): Ticker | null {
  return fixtureTickers().find((t) => t.symbol === symbol.toUpperCase()) ?? null;
}

export function fixtureBars(symbol: string, timeframe: Timeframe): Bar[] {
  const u = UNIVERSE.find((x) => x.symbol === symbol.toUpperCase());
  if (!u) return [];
  if (timeframe === "daily") return getDaily(u.symbol, u.basePrice);
  const dailyClose = getDaily(u.symbol, u.basePrice).slice(-1)[0].close;
  return generateIntradayBars(u.symbol, dailyClose, timeframe);
}

export function fixtureSetups(): Setup[] {
  const setups: Setup[] = [];
  const tickers = fixtureTickers();

  // active: AAPL breakout
  {
    const bars = getDaily("AAPL", 215);
    const recent = bars.slice(-30);
    const high = Math.max(...recent.slice(0, -1).map((b) => b.high));
    const last = bars[bars.length - 1];
    setups.push({
      id: "AAPL-breakout-1",
      ticker: "AAPL",
      type: "breakout_high",
      status: "active",
      timeframe: "daily",
      detectedAt: last.time + "T20:30:00Z",
      triggerPrice: +high.toFixed(2),
      stopHint: +(high * 0.97).toFixed(2),
      targetHint: +(high * 1.06).toFixed(2),
      notes: "Closed above 30-day high on above-average volume.",
      annotations: {
        zones: [{ yTop: high * 1.005, yBottom: high * 0.995, color: "rgba(74, 222, 128, 0.15)", label: "Breakout level" }],
        trendlines: [{ x1: recent[0].time, y1: high, x2: last.time, y2: high, color: "#4ade80", label: "30D high" }],
        markers: [{ x: last.time, price: last.high, shape: "arrowUp", text: "BREAKOUT", color: "#4ade80" }],
      },
    });
  }

  // active: NVDA pullback to EMA
  {
    const bars = getDaily("NVDA", 135);
    const last = bars[bars.length - 1];
    const ema = last.close * 0.985;
    setups.push({
      id: "NVDA-pullback-1",
      ticker: "NVDA",
      type: "pullback_ema",
      status: "active",
      timeframe: "daily",
      detectedAt: last.time + "T20:35:00Z",
      triggerPrice: +last.close.toFixed(2),
      stopHint: +(ema * 0.97).toFixed(2),
      targetHint: +(last.close * 1.08).toFixed(2),
      notes: "Pullback held the 20 EMA in an established uptrend.",
      annotations: {
        zones: [{ yTop: ema * 1.01, yBottom: ema * 0.99, color: "rgba(251, 191, 36, 0.18)", label: "20 EMA zone" }],
        markers: [{ x: last.time, price: last.low, shape: "circle", text: "Held EMA", color: "#fbbf24" }],
      },
    });
  }

  // forming: MSFT NR7
  {
    const bars = getDaily("MSFT", 420);
    const last = bars[bars.length - 1];
    setups.push({
      id: "MSFT-nr7-1",
      ticker: "MSFT",
      type: "nr7",
      status: "forming",
      timeframe: "daily",
      detectedAt: last.time + "T20:30:00Z",
      triggerPrice: +last.high.toFixed(2),
      stopHint: +last.low.toFixed(2),
      notes: "Narrowest range of last 7 sessions — coil tightening.",
      annotations: {
        zones: [{ yTop: last.high, yBottom: last.low, color: "rgba(96, 165, 250, 0.18)", label: "NR7 range" }],
      },
    });
  }

  // forming: TSLA volume dry-up
  {
    const bars = getDaily("TSLA", 245);
    const last = bars[bars.length - 1];
    setups.push({
      id: "TSLA-voldryup-1",
      ticker: "TSLA",
      type: "vol_dryup",
      status: "forming",
      timeframe: "daily",
      detectedAt: last.time + "T20:30:00Z",
      triggerPrice: +last.high.toFixed(2),
      notes: "Volume contracting into a tight range after prior trend.",
      annotations: {
        zones: [{ yTop: last.high, yBottom: last.low * 0.99, color: "rgba(167, 139, 250, 0.18)", label: "Coil" }],
      },
    });
  }

  // forming: AMD inside day
  {
    const bars = getDaily("AMD", 165);
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2];
    setups.push({
      id: "AMD-insideday-1",
      ticker: "AMD",
      type: "inside_day",
      status: "forming",
      timeframe: "daily",
      detectedAt: last.time + "T20:30:00Z",
      triggerPrice: +prev.high.toFixed(2),
      stopHint: +prev.low.toFixed(2),
      notes: "Inside the prior day's range — directional break setup.",
      annotations: {
        trendlines: [
          { x1: prev.time, y1: prev.high, x2: last.time, y2: prev.high, color: "#60a5fa", label: "Mother bar high" },
          { x1: prev.time, y1: prev.low, x2: last.time, y2: prev.low, color: "#60a5fa", label: "Mother bar low" },
        ],
      },
    });
  }

  // active: META gap and go (intraday flavor)
  {
    const bars = getDaily("META", 540);
    const last = bars[bars.length - 1];
    setups.push({
      id: "META-gapgo-1",
      ticker: "META",
      type: "gap_go",
      status: "active",
      timeframe: "daily",
      detectedAt: last.time + "T13:35:00Z",
      triggerPrice: +last.open.toFixed(2),
      stopHint: +(last.open * 0.98).toFixed(2),
      targetHint: +(last.open * 1.05).toFixed(2),
      notes: "Gapped above prior high, opened strong, no fade.",
      annotations: {
        markers: [{ x: last.time, price: last.open, shape: "arrowUp", text: "Gap & Go", color: "#4ade80" }],
      },
    });
  }

  return setups;
}

export function fixtureSetup(id: string): Setup | null {
  return fixtureSetups().find((s) => s.id === id) ?? null;
}

export function fixtureMovers(): Mover[] {
  return fixtureTickers()
    .map((t) => ({
      symbol: t.symbol,
      name: t.name,
      lastPrice: t.lastPrice,
      changePct: t.changePct,
      volume: t.volume,
      relVolume: 1 + ((Math.abs(t.changePct) % 4) / 4) * 2.5,
    }))
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

export function fixtureUniverse(): { symbol: string; name: string }[] {
  return UNIVERSE.map(({ symbol, name }) => ({ symbol, name }));
}
