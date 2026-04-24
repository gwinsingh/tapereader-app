import type { Bar, Mover, Setup, Ticker, Timeframe } from "../types";
import {
  fixtureBars,
  fixtureMovers,
  fixtureSetup,
  fixtureSetups,
  fixtureTicker,
  fixtureTickers,
  fixtureUniverse,
} from "./fixtures";
import { fetchYahooBars } from "./yahoo";
import { fetchPolygonBars } from "./polygon";
import { getCached, makeLimiter, setCached, withDedupe } from "./cache";

export type DataSource = {
  getActiveSetups(): Promise<Setup[]>;
  getFormingSetups(): Promise<Setup[]>;
  getTopMovers(): Promise<Mover[]>;
  getTicker(symbol: string): Promise<Ticker | null>;
  getTickers(): Promise<Ticker[]>;
  getBars(symbol: string, timeframe: Timeframe): Promise<Bar[]>;
  getSetup(id: string): Promise<Setup | null>;
  getSetupsForTicker(symbol: string): Promise<Setup[]>;
  getUniverse(): Promise<{ symbol: string; name: string }[]>;
};

type Source = "fixtures" | "yahoo" | "polygon";
const SOURCE: Source = (process.env.DATA_SOURCE as Source) || "fixtures";

// Yahoo is more permissive but still throttles bursts; Polygon free is 5/min.
const yahooLimit = makeLimiter({ concurrency: 3, spacingMs: 150 });
const polygonLimit = makeLimiter({ concurrency: 1, spacingMs: 13_000 }); // <5/min

async function getBarsFromSource(symbol: string, timeframe: Timeframe): Promise<Bar[]> {
  if (SOURCE === "fixtures") return fixtureBars(symbol, timeframe);

  const cached = getCached(SOURCE, symbol, timeframe);
  if (cached) return cached;

  return withDedupe(SOURCE, symbol, timeframe, async () => {
    try {
      const bars =
        SOURCE === "yahoo"
          ? await yahooLimit(() => fetchYahooBars(symbol, timeframe))
          : await polygonLimit(() => fetchPolygonBars(symbol, timeframe));
      setCached(SOURCE, symbol, timeframe, bars);
      return bars.length ? bars : fixtureBars(symbol, timeframe);
    } catch (err) {
      // console.warn (not error) so the Next dev overlay doesn't treat it as unhandled.
      console.warn(
        `[data] ${SOURCE} ${symbol} ${timeframe} failed, using fixtures: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return fixtureBars(symbol, timeframe);
    }
  });
}

async function tickerFromBars(symbol: string): Promise<Ticker | null> {
  const fixtureMeta = fixtureTicker(symbol);
  if (SOURCE === "fixtures") return fixtureMeta;
  const bars = await getBarsFromSource(symbol, "daily");
  if (bars.length < 2) return fixtureMeta;
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  return {
    symbol: symbol.toUpperCase(),
    name: fixtureMeta?.name ?? symbol.toUpperCase(),
    sector: fixtureMeta?.sector,
    lastPrice: last.close,
    changePct: ((last.close - prev.close) / prev.close) * 100,
    volume: last.volume,
    asOf: last.time,
  };
}

export const data: DataSource = {
  async getActiveSetups() {
    return fixtureSetups().filter((s) => s.status === "active" || s.status === "triggered");
  },
  async getFormingSetups() {
    return fixtureSetups().filter((s) => s.status === "forming");
  },
  async getTopMovers() {
    if (SOURCE === "fixtures") return fixtureMovers();
    // Only use already-cached real bars to avoid blocking the dashboard on
    // a cold cache (Polygon free tier would take 2+ minutes for 10 symbols).
    // Symbols visited via /ticker/X warm the cache; the dashboard then upgrades
    // them from fixtures to real data on next load.
    const fallback = fixtureMovers();
    return fallback
      .map((m) => {
        const bars = getCached(SOURCE, m.symbol, "daily");
        if (!bars || bars.length < 21) return m;
        const last = bars[bars.length - 1];
        const prev = bars[bars.length - 2];
        const avg20 = bars.slice(-21, -1).reduce((s, b) => s + b.volume, 0) / 20 || last.volume;
        return {
          ...m,
          lastPrice: last.close,
          changePct: ((last.close - prev.close) / prev.close) * 100,
          volume: last.volume,
          relVolume: avg20 ? last.volume / avg20 : 1,
        };
      })
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  },
  async getTicker(symbol) {
    return tickerFromBars(symbol);
  },
  async getTickers() {
    if (SOURCE === "fixtures") return fixtureTickers();
    // Cache-only for the same reason as getTopMovers: don't block on a cold cache.
    return fixtureTickers().map((t) => {
      const bars = getCached(SOURCE, t.symbol, "daily");
      if (!bars || bars.length < 2) return t;
      const last = bars[bars.length - 1];
      const prev = bars[bars.length - 2];
      return {
        ...t,
        lastPrice: last.close,
        changePct: ((last.close - prev.close) / prev.close) * 100,
        volume: last.volume,
        asOf: last.time,
      };
    });
  },
  async getBars(symbol, timeframe) {
    return getBarsFromSource(symbol, timeframe);
  },
  async getSetup(id) {
    return fixtureSetup(id);
  },
  async getSetupsForTicker(symbol) {
    return fixtureSetups().filter((s) => s.ticker === symbol.toUpperCase());
  },
  async getUniverse() {
    return fixtureUniverse();
  },
};

export const dataSourceName: Source = SOURCE;
