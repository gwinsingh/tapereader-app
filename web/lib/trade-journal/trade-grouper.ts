import { RawExecution } from "./csv-parser";

export interface GroupedTrade {
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:MM:SS of first fill
  exitTime: string; // HH:MM:SS of last fill
  symbol: string;
  side: "Long" | "Short";
  totalShares: number;
  avgEntry: number;
  avgExit: number;
  numPartials: number;
  pnl: number;
  durationMins: number;
  account: string;
}

interface Fill {
  side: string;
  shares: number;
  price: number;
  time: string;
}

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export function groupExecutionsIntoTrades(
  executions: RawExecution[],
  date: string
): GroupedTrade[] {
  const byAccountSymbol = new Map<string, Fill[]>();

  for (const exec of executions) {
    const key = `${exec.account}::${exec.symbol}`;
    if (!byAccountSymbol.has(key)) {
      byAccountSymbol.set(key, []);
    }
    byAccountSymbol.get(key)!.push({
      side: exec.side,
      shares: exec.shares,
      price: exec.price,
      time: exec.time,
    });
  }

  const trades: GroupedTrade[] = [];

  for (const [key, fills] of byAccountSymbol) {
    const [account, symbol] = key.split("::");
    const sorted = fills.sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));
    trades.push(...buildRoundTrips(sorted, symbol, account, date));
  }

  trades.sort((a, b) => timeToSeconds(a.entryTime) - timeToSeconds(b.entryTime));
  return trades;
}

function buildRoundTrips(
  fills: Fill[],
  symbol: string,
  account: string,
  date: string
): GroupedTrade[] {
  const trades: GroupedTrade[] = [];
  let position = 0;
  let entryFills: Fill[] = [];
  let exitFills: Fill[] = [];
  let direction: "Long" | "Short" | null = null;

  for (const fill of fills) {
    const delta = positionDelta(fill);

    if (position === 0) {
      direction = delta > 0 ? "Long" : "Short";
      entryFills = [fill];
      exitFills = [];
      position = delta;
      continue;
    }

    const sameDirection =
      (direction === "Long" && delta > 0) || (direction === "Short" && delta < 0);

    if (sameDirection) {
      entryFills.push(fill);
    } else {
      exitFills.push(fill);
    }

    position += delta;

    if (position === 0) {
      trades.push(finalizeTrade(entryFills, exitFills, direction!, symbol, account, date));
      direction = null;
      entryFills = [];
      exitFills = [];
    }
  }

  // If there's an open position at end of day, still record it as a partial trade
  if (position !== 0 && direction && entryFills.length > 0) {
    trades.push(
      finalizeTrade(entryFills, exitFills, direction, symbol, account, date)
    );
  }

  return trades;
}

function positionDelta(fill: Fill): number {
  // Buy: +shares (open long or cover short)
  // Sell: -shares (close long)
  // Shrt: -shares (open short)
  return fill.side === "Buy" ? fill.shares : -fill.shares;
}

function weightedAvgPrice(fills: Fill[]): number {
  if (fills.length === 0) return 0;
  let totalCost = 0;
  let totalShares = 0;
  for (const f of fills) {
    totalCost += f.price * f.shares;
    totalShares += f.shares;
  }
  return totalShares > 0 ? totalCost / totalShares : 0;
}

function finalizeTrade(
  entryFills: Fill[],
  exitFills: Fill[],
  direction: "Long" | "Short",
  symbol: string,
  account: string,
  date: string
): GroupedTrade {
  const allFills = [...entryFills, ...exitFills].sort(
    (a, b) => timeToSeconds(a.time) - timeToSeconds(b.time)
  );

  const entryShares = entryFills.reduce((s, f) => s + f.shares, 0);
  const exitShares = exitFills.reduce((s, f) => s + f.shares, 0);
  const avgEntry = weightedAvgPrice(entryFills);
  const avgExit = weightedAvgPrice(exitFills);

  const closedShares = Math.min(entryShares, exitShares);
  let pnl = 0;
  if (closedShares > 0) {
    pnl =
      direction === "Long"
        ? (avgExit - avgEntry) * closedShares
        : (avgEntry - avgExit) * closedShares;
  }

  const entryTime = allFills[0].time;
  const exitTime = exitFills.length > 0 ? allFills[allFills.length - 1].time : allFills[0].time;
  const durationSecs = timeToSeconds(exitTime) - timeToSeconds(entryTime);
  const durationMins = Math.round((durationSecs / 60) * 10) / 10;

  return {
    date,
    entryTime,
    exitTime,
    symbol,
    side: direction,
    totalShares: entryShares,
    avgEntry: Math.round(avgEntry * 100) / 100,
    avgExit: Math.round(avgExit * 100) / 100,
    numPartials: allFills.length,
    pnl: Math.round(pnl * 100) / 100,
    durationMins: Math.max(0, durationMins),
    account,
  };
}
