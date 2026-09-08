/**
 * Order-ladder reconstruction from a full DAS Trader log.
 *
 * The existing csv-parser keeps only `Event === "Execute"` rows. DAS also logs the
 * whole bracket lifecycle — `Accept`/`Sending` when a protective order is placed,
 * `Replaced` on every stop/target adjustment, `Canceled` when it is pulled. That is
 * enough to recover the ACTUAL stop the trader worked, which the sheet otherwise
 * only back-derives from the manually-entered R (a circular value that is wrong for
 * any scaled-in position).
 *
 * Trading model this supports: pyramiding at constant risk. Each add is sized so its
 * own risk is ~1 unit, and the whole-position stop is re-set at the same instant, so
 * total risk at stake stays near one unit while size grows.
 *
 * Pure module — no I/O, no imports. Safe on the Cloudflare edge runtime and runnable
 * directly from Node via --experimental-strip-types.
 */

export interface LogRow {
  event: string;   // Execute | Accept | Sending | Replaced | Canceled | Canceling | Send_Rej
  side: string;    // Buy | Sell | Shrt
  symbol: string;
  shares: number;
  price: number;
  route: string;
  time: string;    // HH:MM:SS
  account: string;
  note: string;
}

export interface FillEvent {
  time: string;
  shares: number;
  price: number;   // share-weighted across the fills in this cluster
  fills: number;   // how many raw executions were merged
}

export interface BracketEvent {
  time: string;
  price: number;
  shares: number;
  kind: "placed" | "moved";
}

export interface RiskPoint {
  time: string;
  stop: number;
  shares: number;
  risk: number;    // dollars at stake across all open lots against this stop
}

export interface TradeLadder {
  symbol: string;
  side: "Long" | "Short";
  entryTime: string;
  exitTime: string | null;
  entries: FillEvent[];
  exits: FillEvent[];
  stops: BracketEvent[];
  targets: BracketEvent[];
  totalShares: number;
  avgEntry: number;
  firstStop: number | null;        // first protective order placed (may be a transient misfire)
  initialStop: number | null;      // stop active SETTLE_SECS after entry — the one he committed to
  initialRisk: number | null;      // dollars risked on the trade, measured off the real stop
  /**
   * Which entry `initialRisk` was measured from. Normally the first entry — but a token
   * starter (2026-06-24 WEN opened with 1 share and added 38 six minutes later) makes the
   * first lot's risk a meaningless denominator: $0.35, which turned a -$13 loss into -33.7R.
   */
  riskBasis: "first-entry" | "max-at-stake";
  maxRiskAtStake: number | null;   // peak risk during the BUILD phase (before the first exit)
  riskCurve: RiskPoint[];
  stopRaises: number;              // count of protective-stop moves in the favourable direction
  everStoppedOut: boolean;         // did an exit fill at or through the then-active stop
}

const CLUSTER_SECS = 3;
/** Stops are often nudged within seconds of entry; settle before reading the committed level. */
const SETTLE_SECS = 30;

export function toSecs(t: string): number {
  const p = (t || "").split(":").map(Number);
  if (p.length < 3 || p.some(isNaN)) return NaN;
  return p[0] * 3600 + p[1] * 60 + p[2];
}

/** Parse a full DAS log, keeping every event type. */
export function parseFullLog(csvText: string): LogRow[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].replace(/,+$/, "").split(",").map((h) => h.trim());
  const ix = (n: string) => headers.indexOf(n);
  const I = {
    event: ix("Event"), side: ix("B/S"), symbol: ix("Symbol"), shares: ix("Shares"),
    price: ix("Price"), route: ix("Route"), time: ix("Time"), account: ix("Account"), note: ix("Note"),
  };
  if (I.event < 0 || I.side < 0 || I.symbol < 0) return [];
  const out: LogRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(",").map((x) => x.trim());
    const shares = parseInt(c[I.shares], 10);
    const price = parseFloat(c[I.price]);
    if (!c[I.symbol] || isNaN(shares) || isNaN(price)) continue;
    out.push({
      event: c[I.event] || "", side: c[I.side] || "", symbol: c[I.symbol],
      shares, price, route: c[I.route] || "", time: c[I.time] || "",
      account: c[I.account] || "", note: I.note >= 0 ? (c[I.note] || "") : "",
    });
  }
  return out;
}

const delta = (r: LogRow) => (r.side === "Buy" ? r.shares : -r.shares);

/** Merge executions that belong to one logical order (same direction, within CLUSTER_SECS). */
function cluster(fills: LogRow[]): FillEvent[] {
  const out: FillEvent[] = [];
  for (const f of fills) {
    const last = out[out.length - 1];
    if (last && toSecs(f.time) - toSecs(last.time) <= CLUSTER_SECS) {
      const sh = last.shares + f.shares;
      last.price = (last.price * last.shares + f.price * f.shares) / sh;
      last.shares = sh;
      last.fills += 1;
    } else {
      out.push({ time: f.time, shares: f.shares, price: f.price, fills: 1 });
    }
  }
  return out.map((e) => ({ ...e, price: Math.round(e.price * 10000) / 10000 }));
}

/**
 * Split a symbol's executions into round trips, then attach the bracket orders that
 * were resting during each trip's lifetime.
 */
export function buildLadders(rows: LogRow[], accountPrefix?: string): TradeLadder[] {
  const scoped = rows.filter(
    (r) => r.symbol && (!accountPrefix || (r.account || "").startsWith(accountPrefix))
  );
  const bySym = new Map<string, LogRow[]>();
  for (const r of scoped) {
    if (!bySym.has(r.symbol)) bySym.set(r.symbol, []);
    bySym.get(r.symbol)!.push(r);
  }

  const ladders: TradeLadder[] = [];
  for (const [symbol, all] of bySym) {
    const sorted = [...all].sort((a, b) => toSecs(a.time) - toSecs(b.time));
    const execs = sorted.filter((r) => r.event === "Execute");

    // Round trips by position tracking (mirrors trade-grouper).
    let pos = 0;
    let entryFills: LogRow[] = [];
    let exitFills: LogRow[] = [];
    let dir: "Long" | "Short" | null = null;

    const flush = () => {
      if (!entryFills.length || !dir) return;
      ladders.push(assemble(symbol, dir, entryFills, exitFills, sorted));
      entryFills = []; exitFills = []; dir = null;
    };

    for (const f of execs) {
      const d = delta(f);
      if (pos === 0) { dir = d > 0 ? "Long" : "Short"; entryFills = [f]; exitFills = []; pos = d; continue; }
      const same = (dir === "Long" && d > 0) || (dir === "Short" && d < 0);
      if (same) entryFills.push(f); else exitFills.push(f);
      pos += d;
      if (pos === 0) flush();
    }
    flush(); // open position at EOD still recorded
  }
  return ladders.sort((a, b) => toSecs(a.entryTime) - toSecs(b.entryTime));
}

function assemble(
  symbol: string, side: "Long" | "Short",
  entryFills: LogRow[], exitFills: LogRow[], all: LogRow[]
): TradeLadder {
  const isLong = side === "Long";
  const entries = cluster(entryFills);
  const exits = cluster(exitFills);
  const totalShares = entries.reduce((s, e) => s + e.shares, 0);
  const avgEntry = totalShares
    ? entries.reduce((s, e) => s + e.shares * e.price, 0) / totalShares : 0;

  const t0 = toSecs(entryFills[0].time);
  const tEnd = exitFills.length ? toSecs(exitFills[exitFills.length - 1].time) : Infinity;

  // Resting protective orders on the opposite side, live during the trip. DAS sometimes
  // labels a long exit "Shrt", so side alone cannot separate a protective order from a
  // genuine short entry — the trip's own time window does that instead.
  const resting = all.filter(
    (r) => ["Accept", "Replaced"].includes(r.event) &&
      (isLong ? r.side !== "Buy" : r.side === "Buy") &&
      toSecs(r.time) >= t0 && toSecs(r.time) <= tEnd
  );

  // A bracket rests one order below and one above. Within each timestamp group the
  // lower is the stop and the higher the target (inverted for a short) — this needs
  // no market-price reference, so it cannot go stale.
  const byTime = new Map<string, LogRow[]>();
  for (const r of resting) {
    if (!byTime.has(r.time)) byTime.set(r.time, []);
    byTime.get(r.time)!.push(r);
  }
  const stops: BracketEvent[] = [];
  const targets: BracketEvent[] = [];
  for (const [time, group] of [...byTime.entries()].sort((a, b) => toSecs(a[0]) - toSecs(b[0]))) {
    const prices = group.map((g) => g.price);
    const stopPx = isLong ? Math.min(...prices) : Math.max(...prices);
    const tgtPx = isLong ? Math.max(...prices) : Math.min(...prices);
    const shares = group[0].shares;
    const push = (arr: BracketEvent[], price: number) => {
      const prev = arr[arr.length - 1];
      if (prev && Math.abs(prev.price - price) < 0.005 && prev.shares === shares) return;
      arr.push({ time, price, shares, kind: arr.length ? "moved" : "placed" });
    };
    // Only treat the pair as two distinct orders when they actually straddle.
    if (group.length > 1 && Math.abs(stopPx - tgtPx) > 0.005) {
      push(stops, stopPx); push(targets, tgtPx);
    } else {
      // Single resting order: classify against the entries filled so far.
      const filledBy = entries.filter((e) => toSecs(e.time) <= toSecs(time));
      const ref = filledBy.length
        ? filledBy.reduce((s, e) => s + e.shares * e.price, 0) / filledBy.reduce((s, e) => s + e.shares, 0)
        : avgEntry;
      const isStop = isLong ? stopPx < ref : stopPx > ref;
      push(isStop ? stops : targets, stopPx);
    }
  }

  // Risk at stake: open lots (entries filled, minus shares already exited FIFO) measured
  // against the stop active at that moment.
  const riskCurve: RiskPoint[] = stops.map((s) => {
    const ts = toSecs(s.time);
    const filled = entries.filter((e) => toSecs(e.time) <= ts);
    let exited = exits.filter((x) => toSecs(x.time) <= ts).reduce((a, x) => a + x.shares, 0);
    let risk = 0, open = 0;
    for (const e of filled) {                       // FIFO: earliest lots close first
      const take = Math.min(exited, e.shares);
      exited -= take;
      const live = e.shares - take;
      if (live <= 0) continue;
      open += live;
      risk += (isLong ? e.price - s.price : s.price - e.price) * live;
    }
    return { time: s.time, stop: s.price, shares: open, risk: Math.round(risk * 100) / 100 };
  });

  // Strictly before the first exit: a re-bracket stamped at or after a partial exit
  // belongs to the wind-down, not the build. Anything later can also be a cancelled
  // remnant of a position that is already flat, which would badly overstate risk.
  const firstExit = exits.length ? toSecs(exits[0].time) : Infinity;
  const buildPhase = riskCurve.filter((r) => toSecs(r.time) < firstExit);

  // The committed stop is the one still standing once the first-seconds churn settles —
  // taken from the build phase only, and never past the second entry.
  const firstStop = stops.length ? stops[0].price : null;
  const settleAt = toSecs(entries[0].time) + SETTLE_SECS;
  const secondEntry = entries.length > 1 ? toSecs(entries[1].time) : Infinity;
  const settled =
    buildPhase.filter((r) => toSecs(r.time) <= settleAt && toSecs(r.time) < secondEntry).pop()
    ?? buildPhase[0] ?? null;
  const initialStop = settled ? settled.stop : firstStop;
  // Read risk straight off the curve so it reflects the shares actually open.
  let initialRisk = settled ? settled.risk : null;
  let riskBasis: "first-entry" | "max-at-stake" = "first-entry";

  const maxAtStake = buildPhase.length
    ? Math.round(Math.max(...buildPhase.map((r) => r.risk)) * 100) / 100 : null;

  // A first entry under a tenth of the final position is a token starter, not the trade.
  // Fall back to peak build-phase exposure so the R denominator reflects real risk taken.
  const TOKEN_STARTER = 0.10;
  if (entries.length > 1 && totalShares > 0 && maxAtStake != null && maxAtStake > 0 &&
      entries[0].shares / totalShares < TOKEN_STARTER) {
    initialRisk = maxAtStake;
    riskBasis = "max-at-stake";
  }

  let stopRaises = 0;
  for (let i = 1; i < stops.length; i++) {
    const better = isLong ? stops[i].price > stops[i - 1].price : stops[i].price < stops[i - 1].price;
    if (better) stopRaises++;
  }

  const everStoppedOut = exits.some((x) => {
    const active = [...stops].filter((s) => toSecs(s.time) <= toSecs(x.time)).pop();
    if (!active) return false;
    return isLong ? x.price <= active.price + 0.02 : x.price >= active.price - 0.02;
  });

  return {
    symbol, side,
    entryTime: entryFills[0].time,
    exitTime: exitFills.length ? exitFills[exitFills.length - 1].time : null,
    entries, exits, stops, targets,
    totalShares,
    avgEntry: Math.round(avgEntry * 100) / 100,
    firstStop,
    initialStop,
    initialRisk,
    riskBasis,
    maxRiskAtStake: maxAtStake,
    riskCurve,
    stopRaises,
    everStoppedOut,
  };
}

/** Google Sheets strips leading zeros from times; normalise before matching. */
export const normTime = (t: string) => (t || "").replace(/^0/, "").trim();

/**
 * Inverse of `fmtFills`: read a stored `Entry Ladder` cell back into lots.
 *
 * `minute` is minute-of-day, which is the unit the intraday bar walk indexes on — the
 * seconds in the stored timestamp are deliberately dropped here rather than at each call
 * site. Unparseable segments are skipped, so a hand-edited cell degrades to the lots it
 * can still read instead of throwing mid-enrichment.
 */
export function parseFills(s: string): { minute: number; price: number; shares: number }[] {
  return (s || "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(\d+):(\d+):(\d+)@([\d.]+)x(\d+)$/);
      if (!m) return null;
      return { minute: +m[1] * 60 + +m[2], price: parseFloat(m[4]), shares: parseInt(m[5], 10) };
    })
    .filter((x): x is { minute: number; price: number; shares: number } => x !== null);
}

/** Compact one-cell encodings for the sheet. */
export const fmtFills = (f: FillEvent[]) =>
  f.map((e) => `${e.time}@${e.price}x${e.shares}`).join(" | ");
export const fmtBrackets = (b: BracketEvent[]) =>
  b.map((e) => `${e.time}@${e.price}`).join(" | ");
