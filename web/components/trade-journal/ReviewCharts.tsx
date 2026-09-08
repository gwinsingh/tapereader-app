import type { Metric, Series } from "@/lib/reviews/types";

/* Inline SVG only — no charting library. Colours come from the PCT theme variables so
   these follow the light/dark toggle without a second palette. */

const POS = "var(--color-pos, #16a34a)";
const NEG = "var(--color-neg, #dc2626)";
const AXIS = "var(--color-border)";
const MUTED = "var(--color-muted)";
const ACCENT = "var(--color-accent)";

const fmt = (v: number | null | undefined, unit: Metric["unit"]) => {
  if (v == null || isNaN(v)) return "—";
  if (unit === "$") return `${v < 0 ? "−" : ""}$${Math.abs(v).toFixed(2)}`;
  if (unit === "pct") return `${v.toFixed(0)}%`;
  if (unit === "count") return `${v}`;
  if (unit === "ratio") return v.toFixed(2);
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}R`;
};

export function Scorecard({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => {
        const d = m.prev != null && m.value != null ? m.value - m.prev : null;
        const better = d == null ? null : m.inverse ? d < 0 : d > 0;
        return (
          <div key={m.key} className="rounded-lg border p-3" style={{ borderColor: AXIS }}>
            <div className="text-xs" style={{ color: MUTED }}>{m.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold">{fmt(m.value, m.unit)}</span>
              {d != null && (
                <span className="font-mono text-xs" style={{ color: better ? POS : NEG }}>
                  {d > 0 ? "▲" : "▼"} {fmt(Math.abs(d), m.unit)}
                </span>
              )}
            </div>
            {(m.n != null || m.note) && (
              <div className="mt-1 text-[11px]" style={{ color: MUTED }}>
                {m.n != null ? `n=${m.n}` : ""}{m.n != null && m.note ? " · " : ""}{m.note ?? ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EquityCurve({ series, height = 200 }: { series: Series; height?: number }) {
  const pts = series.points;
  if (!pts.length) return null;
  const W = 720, H = height, PAD = 34;
  const ys = pts.map((p) => p.y);
  const lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
  const span = hi - lo || 1;
  const x = (i: number) => PAD + (i / Math.max(1, pts.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - PAD * 2);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  const zeroY = y(0);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.label}>
      <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke={AXIS} strokeDasharray="3 3" />
      <path d={`${d} L${x(pts.length - 1)},${zeroY} L${x(0)},${zeroY} Z`}
            fill={last.y >= 0 ? POS : NEG} opacity="0.10" />
      <path d={d} fill="none" stroke={last.y >= 0 ? POS : NEG} strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="2" fill={last.y >= 0 ? POS : NEG} opacity="0.7">
          <title>{`${p.x}: ${p.y.toFixed(1)}R${p.meta ? ` — ${p.meta}` : ""}`}</title>
        </circle>
      ))}
      <text x={PAD} y={16} fontSize="11" fill={MUTED}>{series.label}</text>
      <text x={W - PAD} y={y(last.y) - 8} fontSize="12" textAnchor="end"
            fill={last.y >= 0 ? POS : NEG} fontWeight="bold">
        {last.y > 0 ? "+" : ""}{last.y.toFixed(1)}R
      </text>
      <text x={PAD} y={H - 8} fontSize="10" fill={MUTED}>{pts[0].x}</text>
      <text x={W - PAD} y={H - 8} fontSize="10" textAnchor="end" fill={MUTED}>{last.x}</text>
    </svg>
  );
}

export function DailyBars({ series, height = 160 }: { series: Series; height?: number }) {
  const pts = series.points;
  if (!pts.length) return null;
  const W = 720, H = height, PAD = 28;
  const mag = Math.max(...pts.map((p) => Math.abs(p.y)), 1);
  const bw = (W - PAD * 2) / pts.length;
  const mid = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.label}>
      <line x1={PAD} y1={mid} x2={W - PAD} y2={mid} stroke={AXIS} />
      {pts.map((p, i) => {
        const h = (Math.abs(p.y) / mag) * (H / 2 - PAD / 2);
        return (
          <rect key={i} x={PAD + i * bw + bw * 0.15} width={bw * 0.7}
                y={p.y >= 0 ? mid - h : mid} height={Math.max(1, h)}
                fill={p.y >= 0 ? POS : NEG} opacity="0.85">
            <title>{`${p.x}: ${p.y > 0 ? "+" : ""}${p.y.toFixed(1)}R${p.meta ? ` — ${p.meta}` : ""}`}</title>
          </rect>
        );
      })}
      <text x={PAD} y={12} fontSize="11" fill={MUTED}>{series.label}</text>
    </svg>
  );
}

/** Realized vs available. Every point below the diagonal is money the market offered. */
export function CaptureScatter({ series, height = 320 }: { series: Series; height?: number }) {
  const pts = series.points.filter((p) => typeof p.x === "number") as { x: number; y: number; meta?: string }[];
  if (!pts.length) return null;
  const W = 560, H = height, PAD = 44;
  const maxX = Math.max(...pts.map((p) => p.x), 1);
  const minY = Math.min(0, ...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y), 1);
  const sx = (v: number) => PAD + (v / maxX) * (W - PAD * 2);
  const sy = (v: number) => H - PAD - ((v - minY) / (maxY - minY || 1)) * (H - PAD * 2);
  const diagEnd = Math.min(maxX, maxY);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.label}>
      <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke={AXIS} />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} stroke={AXIS} />
      <line x1={sx(0)} y1={sy(0)} x2={sx(diagEnd)} y2={sy(diagEnd)}
            stroke={ACCENT} strokeDasharray="4 4" opacity="0.7" />
      <text x={sx(diagEnd)} y={sy(diagEnd) - 6} fontSize="10" fill={ACCENT} textAnchor="end">
        perfect capture
      </text>
      {pts.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4"
                fill={p.y >= 0 ? POS : NEG} opacity="0.65">
          <title>{`${p.meta ?? ""} — offered ${p.x.toFixed(1)}R, took ${p.y.toFixed(1)}R`}</title>
        </circle>
      ))}
      <text x={W / 2} y={H - 8} fontSize="11" fill={MUTED} textAnchor="middle">
        position MFE (R) — what the market offered
      </text>
      <text x={12} y={H / 2} fontSize="11" fill={MUTED} transform={`rotate(-90 12 ${H / 2})`}
            textAnchor="middle">realized R</text>
    </svg>
  );
}

export function Histogram({ series, height = 180 }: { series: Series; height?: number }) {
  const pts = series.points;
  if (!pts.length) return null;
  const W = 560, H = height, PAD = 30;
  const max = Math.max(...pts.map((p) => p.y), 1);
  const bw = (W - PAD * 2) / pts.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.label}>
      {pts.map((p, i) => {
        const h = (p.y / max) * (H - PAD * 2);
        const neg = String(p.x).trim().startsWith("−") || String(p.x).trim().startsWith("-");
        return (
          <g key={i}>
            <rect x={PAD + i * bw + bw * 0.12} width={bw * 0.76} y={H - PAD - h} height={Math.max(1, h)}
                  fill={neg ? NEG : POS} opacity="0.8">
              <title>{`${p.x}: ${p.y}${p.meta ? ` — ${p.meta}` : ""}`}</title>
            </rect>
            <text x={PAD + i * bw + bw / 2} y={H - PAD + 12} fontSize="9" fill={MUTED} textAnchor="middle">
              {p.x}
            </text>
          </g>
        );
      })}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={AXIS} />
      <text x={PAD} y={12} fontSize="11" fill={MUTED}>{series.label}</text>
    </svg>
  );
}
