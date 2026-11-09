import { arr, isNum, fmtR, type Equity } from "./ui";

// Hand-written SVG line chart: cumulative R per system, x = trading-day index
// over the union of dates across all series.

const SERIES_COLORS = [
  "var(--pd-accent)",
  "var(--pd-cyan)",
  "var(--pd-orange)",
  "var(--pd-blue)",
  "var(--pd-green)",
  "var(--pd-yellow)",
  "var(--pd-red)",
];

const W = 640;
const H = 220;
const PAD = { l: 44, r: 12, t: 12, b: 24 };

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

export default function EquityChart({
  equity,
  systems,
  nameOf,
}: {
  equity: Equity | null | undefined;
  systems?: string[]; // restrict to these system ids (filter); undefined = all
  nameOf: (id: string) => string;
}) {
  const all = equity && typeof equity === "object" ? equity : {};
  const series = Object.entries(all)
    .filter(([id]) => !systems || systems.includes(id))
    .map(([id, pts]) => ({
      id,
      pts: arr(pts)
        .filter((p) => p && typeof p.date === "string" && isNum(p.cumR))
        .sort((a, b) => String(a.date).localeCompare(String(b.date))) as { date: string; cumR: number }[],
    }))
    .filter((s) => s.pts.length > 0);

  if (series.length === 0) return <div className="pd-empty">No equity curve yet</div>;

  const dates = Array.from(new Set(series.flatMap((s) => s.pts.map((p) => p.date)))).sort();
  const idx = new Map(dates.map((d, i) => [d, i]));
  const ys = series.flatMap((s) => s.pts.map((p) => p.cumR));
  let yMin = Math.min(0, ...ys);
  let yMax = Math.max(0, ...ys);
  if (yMax - yMin < 1) {
    yMax += 0.5;
    yMin -= 0.5;
  }
  const pad = (yMax - yMin) * 0.06;
  yMin -= pad;
  yMax += pad;

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (d: string) => PAD.l + (dates.length === 1 ? iw / 2 : ((idx.get(d) ?? 0) / (dates.length - 1)) * iw);
  const y = (v: number) => PAD.t + ((yMax - v) / (yMax - yMin)) * ih;
  const ticks = niceTicks(yMin, yMax);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Cumulative R by system" style={{ display: "block", height: "auto" }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--pd-border)" strokeWidth={t === 0 ? 1.4 : 1} strokeDasharray={t === 0 ? undefined : "3 4"} />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--pd-muted)">
              {t > 0 ? "+" : ""}
              {t}R
            </text>
          </g>
        ))}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="var(--pd-muted)">
          {dates[0]}
        </text>
        {dates.length > 1 && (
          <text x={W - PAD.r} y={H - 6} textAnchor="end" fontSize="11" fill="var(--pd-muted)">
            {dates[dates.length - 1]}
          </text>
        )}
        {series.map((s, i) => {
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          if (s.pts.length === 1)
            return <circle key={s.id} cx={x(s.pts[0].date)} cy={y(s.pts[0].cumR)} r={3.5} fill={color} />;
          const d = s.pts.map((p, j) => `${j ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.cumR).toFixed(1)}`).join(" ");
          return <path key={s.id} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />;
        })}
      </svg>
      <div className="pd-row pd-small" style={{ marginTop: 4 }}>
        {series.map((s, i) => {
          const last = s.pts[s.pts.length - 1].cumR;
          return (
            <span key={s.id} className="pd-row" style={{ gap: 5 }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: SERIES_COLORS[i % SERIES_COLORS.length], display: "inline-block" }} />
              <span>{nameOf(s.id)}</span>
              <span className="num" style={{ color: last >= 0 ? "var(--pd-green)" : "var(--pd-red)" }}>
                {fmtR(last, 1)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
