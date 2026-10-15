// Morning Intel — read-side parsers for the two locally-written sheet tabs:
//
//   `RS Watchlist`  Date | Generated At | List | Tier | Rank | Symbol | Side | Group | Score |
//                   Signals | Why | Close | PDH | PDL | ATR | Stop Ref | Chart JSON |
//                   Data Through | Config
//   `Morning Brief` Date | Generated At | Order | Section | Markdown
//
// Both tabs are written by `scripts/rs/run.js` on the trader's PC; the app only
// reads them. Parsing is header-name based and defensive: missing columns read
// as blank, bad numbers as null, bad Chart JSON as no chart. Pure and
// import-free so the client component can share the types.

export const MORNING_INTEL_VERSION = "morning-intel-v1";
export const RS_WATCHLIST_TAB = "RS Watchlist";
export const MORNING_BRIEF_TAB = "Morning Brief";

export type IntelListName = "leaders" | "weakest" | "day2" | "day3";
export const INTEL_LISTS: IntelListName[] = ["leaders", "weakest", "day2", "day3"];

export interface RsChart {
  d: string[];
  o: (number | null)[];
  h: (number | null)[];
  l: (number | null)[];
  c: (number | null)[];
  rs: (number | null)[];
  rs50: (number | null)[];
}

export interface RsItem {
  list: IntelListName;
  tier: string; // "focus" | "next" (anything else is shown as next)
  rank: number | null;
  symbol: string;
  side: string; // "long" | "short" | ""
  group: string;
  score: number | null;
  signals: string[];
  why: string;
  close: number | null;
  pdh: number | null;
  pdl: number | null;
  atr: number | null;
  stopRef: number | null;
  chart: RsChart | null;
}

export interface RsGroup {
  side: string;
  theme: string;
  reps: string[];
  also: string;
}

export interface RsRegime {
  label: string;
  summary: string;
  breadth: string;
  nLeaders: number | null;
}

export interface RsPayload {
  date: string;
  generatedAt: string;
  dataThrough: string;
  config: string;
  regime: RsRegime | null;
  lists: Record<IntelListName, RsItem[]>;
  groups: RsGroup[];
}

export interface BriefSection {
  order: number;
  title: string;
  markdown: string;
}

export interface BriefPayload {
  date: string;
  generatedAt: string;
  sections: BriefSection[];
}

export interface MorningIntelResponse {
  brief: BriefPayload | null;
  rs: RsPayload | null;
  version: typeof MORNING_INTEL_VERSION;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function headerIndex(header: string[]): (name: string) => number {
  const map = new Map<string, number>();
  header.forEach((h, i) => {
    const k = String(h ?? "").trim().toLowerCase();
    if (k && !map.has(k)) map.set(k, i);
  });
  return (name: string) => map.get(name.toLowerCase()) ?? -1;
}

function cellGetter(header: string[]) {
  const idx = headerIndex(header);
  return (row: string[], name: string): string => {
    const i = idx(name);
    if (i < 0) return "";
    const v = row[i];
    return v == null ? "" : String(v).trim();
  };
}

/** Sheet cells may come back locale-formatted ("1,234.50", "$12.3"); blank / N/A → null. */
export function toNum(s: string): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[$,\s]/g, "");
  if (!cleaned || /^n\/?a$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Normalise a sheet date cell to YYYY-MM-DD when recognisable (ISO or M/D/YYYY). */
export function toIsoDate(s: string): string {
  if (!s) return "";
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  return s;
}

function numArray(v: unknown, len: number): (number | null)[] {
  const out: (number | null)[] = [];
  const arr = Array.isArray(v) ? v : [];
  for (let i = 0; i < len; i++) {
    const x = arr[i];
    const n = typeof x === "number" ? x : typeof x === "string" && x.trim() ? Number(x) : NaN;
    out.push(Number.isFinite(n) ? n : null);
  }
  return out;
}

export function parseChart(s: string): RsChart | null {
  if (!s) return null;
  let j: unknown;
  try {
    j = JSON.parse(s);
  } catch {
    return null;
  }
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  const len = Math.max(
    Array.isArray(o.c) ? o.c.length : 0,
    Array.isArray(o.d) ? o.d.length : 0
  );
  if (len < 2 || !Array.isArray(o.c)) return null;
  const d = Array.isArray(o.d) ? o.d.map((x) => String(x ?? "")) : [];
  while (d.length < len) d.push("");
  const chart: RsChart = {
    d: d.slice(0, len),
    o: numArray(o.o, len),
    h: numArray(o.h, len),
    l: numArray(o.l, len),
    c: numArray(o.c, len),
    rs: numArray(o.rs, len),
    rs50: numArray(o.rs50, len),
  };
  if (!chart.c.some((x) => x != null)) return null;
  return chart;
}

function latestOf(values: string[]): string {
  return values.filter(Boolean).sort().pop() ?? "";
}

function splitSignals(s: string): string[] {
  return s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
}

function normList(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

// ── RS Watchlist ─────────────────────────────────────────────────────────────

export function parseRsWatchlist(values: string[][] | null): RsPayload | null {
  if (!values || values.length < 2) return null;
  const get = cellGetter(values[0]);
  let rows = values.slice(1).filter((r) => r.some((c) => String(c ?? "").trim()));
  if (rows.length === 0) return null;

  // One snapshot is expected, but if the tab ever holds several runs keep the
  // latest Date only.
  const dates = rows.map((r) => toIsoDate(get(r, "Date")));
  const date = latestOf(dates);
  if (date) rows = rows.filter((_, i) => dates[i] === date || !dates[i]);

  const generatedAt = latestOf(rows.map((r) => get(r, "Generated At")));
  const dataThrough = toIsoDate(latestOf(rows.map((r) => toIsoDate(get(r, "Data Through")))));
  const config = rows.map((r) => get(r, "Config")).find(Boolean) ?? "";

  let regime: RsRegime | null = null;
  const lists: Record<IntelListName, RsItem[]> = { leaders: [], weakest: [], day2: [], day3: [] };
  const groups: RsGroup[] = [];

  for (const r of rows) {
    const list = normList(get(r, "List"));
    if (list === "regime") {
      if (!regime) {
        regime = {
          label: get(r, "Group"),
          summary: get(r, "Why"),
          breadth: get(r, "Signals"),
          nLeaders: toNum(get(r, "Score")),
        };
      }
      continue;
    }
    if (list === "group" || list === "groups") {
      const theme = get(r, "Group");
      const reps = get(r, "Symbol").split(/[\s,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
      if (!theme && reps.length === 0) continue;
      groups.push({
        side: get(r, "Side").toLowerCase(),
        theme,
        reps,
        also: get(r, "Why").replace(/^\s*also moving\s*:\s*/i, "").trim(),
      });
      continue;
    }
    const key = (INTEL_LISTS as string[]).includes(list) ? (list as IntelListName) : null;
    if (!key) continue;
    const symbol = get(r, "Symbol").toUpperCase();
    if (!symbol) continue;
    lists[key].push({
      list: key,
      tier: get(r, "Tier").toLowerCase() || "next",
      rank: toNum(get(r, "Rank")),
      symbol,
      side: get(r, "Side").toLowerCase(),
      group: get(r, "Group"),
      score: toNum(get(r, "Score")),
      signals: splitSignals(get(r, "Signals")),
      why: get(r, "Why"),
      close: toNum(get(r, "Close")),
      pdh: toNum(get(r, "PDH")),
      pdl: toNum(get(r, "PDL")),
      atr: toNum(get(r, "ATR")),
      stopRef: toNum(get(r, "Stop Ref")),
      chart: parseChart(get(r, "Chart JSON")),
    });
  }

  const tierOrder = (t: string) => (t === "focus" ? 0 : 1);
  for (const k of INTEL_LISTS) {
    lists[k].sort(
      (a, b) =>
        tierOrder(a.tier) - tierOrder(b.tier) ||
        (a.rank ?? 9999) - (b.rank ?? 9999) ||
        (b.score ?? -1) - (a.score ?? -1)
    );
  }

  return { date, generatedAt, dataThrough, config, regime, lists, groups };
}

// ── Morning Brief ────────────────────────────────────────────────────────────

export function parseMorningBrief(values: string[][] | null): BriefPayload | null {
  if (!values || values.length < 2) return null;
  const get = cellGetter(values[0]);
  let rows = values.slice(1).filter((r) => r.some((c) => String(c ?? "").trim()));
  if (rows.length === 0) return null;

  const dates = rows.map((r) => toIsoDate(get(r, "Date")));
  const date = latestOf(dates);
  if (date) rows = rows.filter((_, i) => dates[i] === date || !dates[i]);

  const generatedAt = latestOf(rows.map((r) => get(r, "Generated At")));
  const sections: BriefSection[] = rows
    .map((r, i) => ({
      order: toNum(get(r, "Order")) ?? 1000 + i,
      title: get(r, "Section"),
      // Keep the markdown's internal whitespace — only strip the cell's outer edges.
      markdown: get(r, "Markdown").replace(/\r\n?/g, "\n"),
    }))
    .filter((s) => s.title || s.markdown)
    .sort((a, b) => a.order - b.order);
  if (sections.length === 0) return null;
  return { date, generatedAt, sections };
}
