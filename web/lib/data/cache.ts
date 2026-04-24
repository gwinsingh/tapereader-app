import type { Bar, Timeframe } from "../types";

const TTL_MS = 15 * 60 * 1000;

type Entry = { ts: number; bars: Bar[] };
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Bar[]>>();

function key(source: string, symbol: string, tf: Timeframe) {
  return `${source}:${symbol.toUpperCase()}:${tf}`;
}

export function getCached(source: string, symbol: string, tf: Timeframe): Bar[] | null {
  const e = cache.get(key(source, symbol, tf));
  if (!e) return null;
  if (Date.now() - e.ts > TTL_MS) {
    cache.delete(key(source, symbol, tf));
    return null;
  }
  return e.bars;
}

export function setCached(source: string, symbol: string, tf: Timeframe, bars: Bar[]) {
  if (bars.length === 0) return;
  cache.set(key(source, symbol, tf), { ts: Date.now(), bars });
}

// Dedupe concurrent identical requests so we don't multiply rate-limit pressure.
export async function withDedupe(
  source: string,
  symbol: string,
  tf: Timeframe,
  loader: () => Promise<Bar[]>,
): Promise<Bar[]> {
  const k = key(source, symbol, tf);
  const existing = inflight.get(k);
  if (existing) return existing;
  const p = loader().finally(() => inflight.delete(k));
  inflight.set(k, p);
  return p;
}

// Serial queue with optional spacing — enough to stay under strict rate limits.
type QueueOpts = { concurrency: number; spacingMs?: number };
export function makeLimiter({ concurrency, spacingMs = 0 }: QueueOpts) {
  let active = 0;
  let lastStart = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= concurrency) return;
    const job = queue.shift();
    if (!job) return;
    active++;
    const wait = Math.max(0, spacingMs - (Date.now() - lastStart));
    setTimeout(() => {
      lastStart = Date.now();
      job();
    }, wait);
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
  };
}
