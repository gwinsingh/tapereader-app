import type { RawExecution } from "./csv-parser";
import {
  buildLadders, fmtBrackets, fmtFills, normTime, parseFills,
  type LogRow, type TradeLadder,
} from "./order-ladder";
import type { EntryRef } from "./market-data";

/**
 * The order ladder for one trade, flattened to the shapes the sheet stores.
 *
 * Reconstructed from the FULL DAS log (not just fills) by `order-ladder.ts`, which
 * recovers the protective stop the trader actually worked. That makes `initialRisk` a
 * measured number rather than a hand-typed one, and `initialStop` a real price rather
 * than one back-derived from that typed number.
 */
export interface TradeLadderFields {
  entryLadder: string;             // "09:32:46@119.65x3 | 09:38:08@123.09x3"
  exitLadder: string;
  stopLadder: string;              // "09:32:49@117.9 | 09:41:02@120.1"
  numEntries: number;
  numExits: number;
  firstEntry: number | null;
  initialStop: number | null;
  initialRisk: number | null;
  maxRiskAtStake: number | null;
  /** Risk still on the line against the working stop when the position was closed. */
  riskAtExit: number | null;
  stopRaises: number;
  stoppedOut: "Y" | "N";
  riskBasis: TradeLadder["riskBasis"];
}

export interface GroupedTrade {
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:MM:SS of first fill
  exitTime: string; // HH:MM:SS of last fill
  symbol: string;
  side: "Long" | "Short";
  totalShares: number;
  avgEntry: number;
  /**
   * Volume-weighted across every entry fill. NOT a price any order rested at once the
   * position was scaled into — use `ladder.firstEntry` for anything measured from the
   * entry (excursion, risk per share).
   */
  avgExit: number;
  /**
   * Counts entry fills AND exit fills, so "2 partials" means zero partials were taken.
   * Kept for back-compat with existing sheet rows; `ladder.numEntries` / `numExits` are
   * the meaningful pair.
   */
  numPartials: number;
  pnl: number;
  durationMins: number;
  account: string;
  /** Present only when the upload carried a full DAS log that matched this trade. */
  ladder?: TradeLadderFields;
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

const round2 = (n: number | null): number | null =>
  n == null || isNaN(n) ? null : Math.round(n * 100) / 100;

function toLadderFields(l: TradeLadder): TradeLadderFields {
  return {
    entryLadder: fmtFills(l.entries),
    exitLadder: fmtFills(l.exits),
    stopLadder: fmtBrackets(l.stops),
    numEntries: l.entries.length,
    numExits: l.exits.length,
    firstEntry: round2(l.entries[0]?.price ?? null),
    initialStop: round2(l.initialStop),
    initialRisk: round2(l.initialRisk),
    maxRiskAtStake: round2(l.maxRiskAtStake),
    riskAtExit: round2(l.riskAtExit),
    stopRaises: l.stopRaises,
    stoppedOut: l.everStoppedOut ? "Y" : "N",
    riskBasis: l.riskBasis,
  };
}

/**
 * Attach the reconstructed order ladder to trades already built by
 * `groupExecutionsIntoTrades`.
 *
 * `buildLadders()` does its own round-trip splitting with the same position-tracking
 * rule as `buildRoundTrips` above, so the two agree on where one trade ends and the
 * next begins. Joining on `symbol` + normalised entry time is deliberate: duplicating
 * the position logic in a second place is exactly how the two would drift.
 *
 * Every trade keeps its ladder or keeps nothing — a trade with no matching ladder is
 * returned untouched, and the sheet then falls back to the manual R. That matters for
 * days with no DAS export at all, and for the mixed-account day noted below.
 *
 * Ported from `scripts/review/backfill-ladders.ts`, which ran this against the whole
 * book. Two behaviours come from that run and are load-bearing:
 *  - Each ladder is consumed at most once, so two trades in the same symbol at
 *    different times cannot both claim the first one.
 *  - When an account has no rows in the log, fall back to an unfiltered read. On
 *    2026-07-30 the fills were executed under the old practice account but recorded
 *    against the live one; filtering strictly would silently drop the whole day.
 */
export function attachLadders(trades: GroupedTrade[], logRows: LogRow[]): GroupedTrade[] {
  if (!logRows.length) return trades;

  const byAccount = new Map<string, GroupedTrade[]>();
  for (const t of trades) {
    if (!byAccount.has(t.account)) byAccount.set(t.account, []);
    byAccount.get(t.account)!.push(t);
  }

  for (const [account, group] of byAccount) {
    let ladders = buildLadders(logRows, account);
    if (!ladders.length) ladders = buildLadders(logRows);
    if (!ladders.length) continue;

    const used = new Set<TradeLadder>();
    for (const t of group) {
      const want = normTime(t.entryTime);
      const hit = ladders.find(
        (l) => !used.has(l) && l.symbol === t.symbol && normTime(l.entryTime) === want
      );
      if (!hit) continue;
      used.add(hit);
      t.ladder = toLadderFields(hit);
    }
  }

  return trades;
}

/**
 * The enrichment entry reference for a trade, from its ladder.
 *
 * `riskPerShare` is measured off the REAL initial stop over the FIRST entry's shares.
 * The old `R / totalShares` spread the whole trade's risk across lots that were not
 * open yet when that stop was set, which understates risk per share on every pyramid
 * and inflates every R-multiple derived from it.
 *
 * Returns null when the ladder is too incomplete to measure from, so the caller falls
 * back to the previous blended-average behaviour rather than enriching off a guess.
 */
export function ladderEntryRef(lad: TradeLadderFields | undefined): EntryRef | null {
  if (!lad || lad.firstEntry == null || lad.initialRisk == null || lad.initialRisk <= 0) return null;
  const lots = parseFills(lad.entryLadder);
  const firstLotShares = lots[0]?.shares ?? 0;
  if (firstLotShares <= 0) return null;
  return {
    price: lad.firstEntry,
    riskPerShare: lad.initialRisk / firstLotShares,
    entries: lots,
    initialRisk: lad.initialRisk,
  };
}
