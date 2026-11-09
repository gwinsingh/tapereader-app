import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Blob shapes (published to KV by the local paper-desk runner). Every field is
// optional: the page must render whatever subset is present.
// ---------------------------------------------------------------------------

export type Track = "rules" | "agent" | "both" | string;

export interface StatusBlob {
  name?: string;
  version?: string;
  lastRun?: { kind?: string; at?: string; status?: string; forDate?: string; messages?: string[] };
  lock?: { at?: string; sha256?: string; late?: boolean };
  agent?: { status?: string; reason?: string; promptVersion?: string };
}

export interface Order {
  id?: string;
  track?: Track;
  system?: string;
  source?: string;
  setup?: string;
  setupVersion?: string | number;
  sym?: string;
  dir?: string;
  grade?: string;
  scenario?: string[];
  thesis?: string;
  trigger?: { type?: string; level?: number; text?: string };
  invalidation?: { text?: string };
  stop?: number;
  sizeR?: number;
  shares?: number;
  exits?: { scheme?: string; text?: string };
  earnings?: { rule?: string; date?: string };
  cluster?: string;
}

export interface PlanBlob {
  date?: string;
  lockedAt?: string;
  sha256?: string;
  late?: boolean;
  regime?: { label?: string; tags?: string[]; qqq?: { close?: number; ema9?: number; ema21?: number; sma50?: number } };
  agent?: { status?: string; reason?: string };
  orders?: Order[];
}

export interface Position {
  id?: string;
  track?: Track;
  system?: string;
  setup?: string;
  sym?: string;
  dir?: string;
  entryDate?: string;
  entry?: number;
  stop?: number;
  shares?: number;
  remainingShares?: number;
  lastClose?: number;
  currentR?: number;
  openRiskR?: number;
  nextExit?: string;
  cluster?: string;
}

export interface PositionsBlob {
  asOf?: string;
  totalOpenR?: number;
  caps?: { totalR?: number; clusterR?: number; perSystemR?: number };
  bySystemR?: Record<string, number>;
  byClusterR?: Record<string, number>;
  positions?: Position[];
}

export interface Bucket {
  key?: string;
  system?: string;
  setup?: string;
  scenario?: string | string[];
  regime?: string;
  track?: Track;
  n?: number;
  winRate?: number;
  avgR?: number;
  expectancy?: number;
  profitFactor?: number;
  status?: string;
}

export type Equity = Record<string, { date?: string; cumR?: number }[]>;

export interface EdgeBlob {
  asOf?: string;
  minN?: number;
  forward?: { buckets?: Bucket[]; equity?: Equity };
  backtest?: { from?: string; to?: string; buckets?: Bucket[]; equity?: Equity };
}

export interface SystemDef {
  id?: string;
  name?: string;
  source?: string;
  vault?: string;
  setups?: string[];
  gateToday?: { open?: boolean; reason?: string };
}

export interface SetupsBlob {
  systems?: SystemDef[];
  setups?: { id?: string; system?: string; source?: string; version?: string | number; name?: string; direction?: string; scenario?: string[]; exitScheme?: string }[];
}

export interface LedgerTrade {
  id?: string;
  track?: Track;
  system?: string;
  setup?: string;
  sym?: string;
  dir?: string;
  entryDate?: string;
  exitDate?: string;
  entry?: number;
  exitAvg?: number;
  r?: number;
  reason?: string;
}

export interface LedgerBlob {
  asOf?: string;
  summary?: { trades?: number; forward?: { rules?: { n?: number; sumR?: number }; agent?: { n?: number; sumR?: number } } };
  recent?: LedgerTrade[];
}

export interface DeskData {
  status: StatusBlob | null;
  plan: PlanBlob | null;
  positions: PositionsBlob | null;
  edge: EdgeBlob | null;
  setups: SetupsBlob | null;
  ledger: LedgerBlob | null;
}

// ---------------------------------------------------------------------------
// Defensive accessors + formatters
// ---------------------------------------------------------------------------

export const arr = <T,>(x: T[] | null | undefined): T[] => (Array.isArray(x) ? x : []);
export const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
export const obj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

export function fmtNum(x: unknown, d = 2): string {
  return isNum(x) ? x.toFixed(d) : "—";
}

export function fmtR(x: unknown, d = 2): string {
  if (!isNum(x)) return "—";
  return `${x > 0 ? "+" : ""}${x.toFixed(d)}R`;
}

/** Accepts a fraction (0.55) or a percentage (55). */
export function fmtPct(x: unknown): string {
  if (!isNum(x)) return "—";
  const p = Math.abs(x) <= 1 ? x * 100 : x;
  return `${p.toFixed(0)}%`;
}

export function fmtPF(x: unknown): string {
  if (!isNum(x)) return "—";
  return x >= 9999 ? "∞" : x.toFixed(2);
}

/** ISO timestamp → "Nov 8, 09:14 ET". Falls back to the raw string. */
export function fmtTime(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return (
      d.toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " ET"
    );
  } catch {
    return d.toISOString();
  }
}

export function scenarioList(x: unknown): string[] {
  if (Array.isArray(x)) return x.filter((s) => typeof s === "string");
  if (typeof x === "string" && x) return [x];
  return [];
}

export const rColor = (x: unknown) =>
  isNum(x) ? (x > 0 ? "var(--pd-green)" : x < 0 ? "var(--pd-red)" : "var(--pd-muted)") : "var(--pd-faint)";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type Tone = "green" | "red" | "orange" | "yellow" | "accent" | "cyan" | "blue" | "muted";

const TONE_VAR: Record<Tone, string> = {
  green: "var(--pd-green)",
  red: "var(--pd-red)",
  orange: "var(--pd-orange)",
  yellow: "var(--pd-yellow)",
  accent: "var(--pd-accent)",
  cyan: "var(--pd-cyan)",
  blue: "var(--pd-blue)",
  muted: "var(--pd-muted)",
};

export function Pill({ tone = "muted", children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return (
    <span className="pd-pill" style={{ color: TONE_VAR[tone] }} title={title}>
      {children}
    </span>
  );
}

export function statusTone(s: unknown): Tone {
  switch (String(s ?? "").toLowerCase()) {
    case "ok":
    case "push":
    case "open":
      return "green";
    case "failed":
    case "pause":
      return "red";
    case "late":
    case "missing":
    case "size-down":
      return "orange";
    case "dry":
      return "yellow";
    case "normal":
      return "accent";
    default:
      return "muted";
  }
}

export function StatusPill({ value, title }: { value: unknown; title?: string }) {
  const v = typeof value === "string" && value ? value : "unknown";
  return (
    <Pill tone={statusTone(v)} title={title}>
      {v}
    </Pill>
  );
}

export function TrackPill({ track }: { track: unknown }) {
  const t = String(track ?? "");
  if (t === "both")
    return (
      <Pill tone="green" title="In both the rules-only plan and the agent plan">
        rules + agent
      </Pill>
    );
  if (t === "agent")
    return (
      <Pill tone="accent" title="Agent plan only">
        agent
      </Pill>
    );
  if (t === "rules")
    return (
      <Pill tone="cyan" title="Rules-only plan only">
        rules
      </Pill>
    );
  return <span className="pd-faint">—</span>;
}

export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="pd-section">
      <div className="pd-section-head">
        <h2>{title}</h2>
        {aside != null && <div className="pd-aside">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children = "No data published yet" }: { children?: ReactNode }) {
  return <div className="pd-empty">{children}</div>;
}

// ---------------------------------------------------------------------------
// Theme: Obsidian default theme, scoped to `.paperdesk`, following the PCT
// `data-theme` attribute on <html> (light is the default).
// ---------------------------------------------------------------------------

export const PAPERDESK_CSS = `
.paperdesk {
  --pd-bg: #ffffff;
  --pd-bg2: #f6f6f6;
  --pd-text: #222222;
  --pd-muted: #5c5c5c;
  --pd-faint: #ababab;
  --pd-border: #e0e0e0;
  --pd-accent: #8a5cf5;
  --pd-accent-i: #7b6cd9;
  --pd-green: #08b94e;
  --pd-red: #e93147;
  --pd-orange: #ec7500;
  --pd-yellow: #e0ac00;
  --pd-cyan: #12A4B4;
  --pd-blue: #1E3FBF;
  background: var(--pd-bg);
  color: var(--pd-text);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.45;
  border-radius: 10px;
  padding: 16px;
}
[data-theme="dark"] .paperdesk {
  --pd-bg: #1e1e1e;
  --pd-bg2: #262626;
  --pd-text: #dadada;
  --pd-muted: #b3b3b3;
  --pd-faint: #666666;
  --pd-border: #363636;
  --pd-accent: #a68af9;
  --pd-accent-i: #a68af9;
  --pd-green: #44cf6e;
  --pd-red: #fb464c;
  --pd-orange: #e9973f;
  --pd-yellow: #e0de71;
  --pd-cyan: #12A4B4;
  --pd-blue: #5b7cf0;
}
.paperdesk .num, .paperdesk td, .paperdesk .pd-stat-v { font-variant-numeric: tabular-nums; }
.paperdesk h1 { font-size: 1.6em; font-weight: 700; margin: 0; }
.paperdesk h2 { font-size: 1.15em; font-weight: 650; margin: 0; }
.paperdesk h3 { font-size: 1em; font-weight: 650; margin: 0; }
.paperdesk a { color: var(--pd-accent-i); }
.paperdesk .pd-muted { color: var(--pd-muted); }
.paperdesk .pd-faint { color: var(--pd-faint); }
.paperdesk .pd-small { font-size: 12px; }
.paperdesk .pd-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.paperdesk .pd-section { margin-top: 22px; }
.paperdesk .pd-section-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--pd-border); }
.paperdesk .pd-aside { color: var(--pd-muted); font-size: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.paperdesk .pd-card { background: var(--pd-bg2); border: 1px solid var(--pd-border); border-radius: 8px; padding: 10px 12px; }
.paperdesk .pd-row { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }
.paperdesk .pd-grid { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
.paperdesk .pd-pill { display: inline-block; white-space: nowrap; font-size: 11px; font-weight: 600; line-height: 1; padding: 3px 7px; border-radius: 999px; border: 1px solid currentColor; background: transparent; background: color-mix(in srgb, currentColor 12%, transparent); }
.paperdesk .pd-tag { display: inline-block; white-space: nowrap; font-size: 11px; padding: 2px 6px; border-radius: 4px; background: var(--pd-bg2); border: 1px solid var(--pd-border); color: var(--pd-muted); margin: 1px 3px 1px 0; }
.paperdesk .pd-empty { color: var(--pd-faint); font-style: italic; padding: 14px 12px; border: 1px dashed var(--pd-border); border-radius: 8px; text-align: center; }
.paperdesk .pd-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--pd-border); border-radius: 8px; }
.paperdesk table.pd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.paperdesk .pd-table th { text-align: left; font-weight: 600; font-size: 12px; color: var(--pd-muted); background: var(--pd-bg2); padding: 6px 8px; border-bottom: 1px solid var(--pd-border); white-space: nowrap; }
.paperdesk .pd-table td { padding: 6px 8px; border-bottom: 1px solid var(--pd-border); white-space: nowrap; vertical-align: top; }
.paperdesk .pd-table tr:last-child td { border-bottom: none; }
.paperdesk .pd-table td.wrap { white-space: normal; min-width: 220px; max-width: 420px; }
.paperdesk .pd-table .r { text-align: right; }
.paperdesk .pd-table tr.pd-group td { background: var(--pd-bg2); font-weight: 650; color: var(--pd-accent-i); }
.paperdesk .pd-table tr.pd-total td { font-weight: 650; background: var(--pd-bg2); }
.paperdesk .pd-tabs { display: inline-flex; border: 1px solid var(--pd-border); border-radius: 8px; overflow: hidden; }
.paperdesk .pd-tabs button { padding: 5px 12px; font-size: 13px; background: var(--pd-bg); color: var(--pd-muted); border: none; cursor: pointer; }
.paperdesk .pd-tabs button + button { border-left: 1px solid var(--pd-border); }
.paperdesk .pd-tabs button[aria-selected="true"] { background: var(--pd-accent-i); color: #ffffff; font-weight: 600; }
.paperdesk select, .paperdesk .pd-btn { font-size: 13px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--pd-border); background: var(--pd-bg); color: var(--pd-text); }
.paperdesk .pd-btn { cursor: pointer; }
.paperdesk .pd-btn:hover { border-color: var(--pd-accent-i); }
.paperdesk .pd-banner { padding: 8px 12px; border-radius: 8px; font-weight: 650; font-size: 13px; letter-spacing: 0.02em; border: 1px solid var(--pd-orange); color: var(--pd-orange); background: transparent; background: color-mix(in srgb, var(--pd-orange) 10%, transparent); }
.paperdesk .pd-stat { display: flex; flex-direction: column; }
.paperdesk .pd-stat-k { font-size: 11px; color: var(--pd-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.paperdesk .pd-stat-v { font-size: 18px; font-weight: 650; }
.paperdesk .pd-warn { color: var(--pd-red); font-weight: 650; }
@media (max-width: 640px) {
  .paperdesk { padding: 12px; margin: 0 -8px; border-radius: 0; }
  .paperdesk .pd-table { font-size: 12px; }
}
`;
