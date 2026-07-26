interface SegmentStats {
  label: string;
  totalPnl: number;
  trades: number;
  winners: number;
  losers: number;
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  profitFactor: number;
}

interface SkillMetrics {
  intradayReadPct: number | null;
  intradayReadN: number;
  dailyReadPct: number | null;
  dailyReadStrongPct: number | null;
  dailyReadN: number;
  executionPct: number | null;
  executionN: number;
  captureTarget: number;
}

interface Stats {
  totalPnl: number;
  avgDailyPnl: number;
  avgWinner: number;
  avgLoser: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgDurationMins: number;
  hourlyBreakdown: SegmentStats[];
  granularHourlyBreakdown: SegmentStats[];
  setupBreakdown: SegmentStats[];
  convictionBreakdown?: SegmentStats[];
  catalystBreakdown?: SegmentStats[];
  skill?: SkillMetrics;
  disciplinePct?: number | null;
  disciplineN?: number;
}

interface Props {
  stats: Stats;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "neutral";
}) {
  const colorClass =
    color === "green"
      ? "text-[var(--stat-green)]"
      : color === "red"
        ? "text-[var(--stat-red)]"
        : "text-[var(--color-text)]";

  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}

function pnlColor(v: number): "green" | "red" | "neutral" {
  if (v > 0) return "green";
  if (v < 0) return "red";
  return "neutral";
}

function SkillCard({
  label,
  pct,
  sub,
  title,
}: {
  label: string;
  pct: number | null;
  sub: string;
  title: string;
}) {
  return (
    <div
      className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3"
      title={title}
    >
      <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
        {label}
        <span className="cursor-help text-[10px] opacity-60" aria-hidden="true">ⓘ</span>
      </p>
      <p
        className={`mt-0.5 font-mono text-2xl font-semibold ${
          pct === null ? "text-[var(--color-muted)]" : "text-[var(--color-text)]"
        }`}
      >
        {pct === null ? "—" : `${pct}%`}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-[var(--color-muted)]">{sub}</p>
    </div>
  );
}

function BreakdownTable({ title, segments }: { title: string; segments: SegmentStats[] }) {
  if (segments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider">{title}</h3>
      <div className="overflow-x-auto rounded border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-panel)] text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-3 py-2">{title.includes("Time") ? "Time Block" : "Category"}</th>
              <th className="px-3 py-2 text-center">Trades</th>
              <th className="px-3 py-2 text-center">W / L</th>
              <th className="px-3 py-2 text-center">Win Rate</th>
              <th className="px-3 py-2 text-right">P&L</th>
              <th className="px-3 py-2 text-right">Avg Win</th>
              <th className="px-3 py-2 text-right">Avg Loss</th>
              <th className="px-3 py-2 text-center">PF</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => (
              <tr key={seg.label} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-panel)]/50">
                <td className="px-3 py-2 text-sm font-medium">{seg.label}</td>
                <td className="px-3 py-2 text-center font-mono">{seg.trades}</td>
                <td className="px-3 py-2 text-center font-mono">
                  <span className="text-[var(--stat-green)]">{seg.winners}</span>
                  {" / "}
                  <span className="text-[var(--stat-red)]">{seg.losers}</span>
                </td>
                <td className="px-3 py-2 text-center font-mono">{seg.winRate}%</td>
                <td
                  className={`px-3 py-2 text-right font-mono font-semibold ${
                    seg.totalPnl >= 0 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"
                  }`}
                >
                  ${seg.totalPnl.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-[var(--stat-green)]">
                  ${seg.avgWinner.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-[var(--stat-red)]">
                  ${seg.avgLoser.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center font-mono">
                  {seg.profitFactor >= 9999 ? "∞" : seg.profitFactor.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AggregateStats({ stats }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Performance Overview</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Total P&L"
          value={`$${stats.totalPnl.toFixed(2)}`}
          color={pnlColor(stats.totalPnl)}
        />
        <StatCard
          label="Avg Daily P&L"
          value={`$${stats.avgDailyPnl.toFixed(2)}`}
          color={pnlColor(stats.avgDailyPnl)}
        />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} color="neutral" />
        <StatCard
          label="Profit Factor"
          value={stats.profitFactor >= 9999 ? "∞" : `${stats.profitFactor}`}
          color={stats.profitFactor >= 1 ? "green" : "red"}
        />

        <StatCard label="Total Trades" value={`${stats.totalTrades}`} color="neutral" />
        <StatCard label="Winners" value={`${stats.winningTrades}`} color="green" />
        <StatCard label="Losers" value={`${stats.losingTrades}`} color="red" />
        <StatCard
          label="Avg Duration"
          value={`${stats.avgDurationMins} min`}
          color="neutral"
        />

        <StatCard
          label="Avg Winner"
          value={`$${stats.avgWinner.toFixed(2)}`}
          color="green"
        />
        <StatCard
          label="Avg Loser"
          value={`$${stats.avgLoser.toFixed(2)}`}
          color="red"
        />
        <StatCard
          label="Largest Win"
          value={`$${stats.largestWin.toFixed(2)}`}
          color="green"
        />
        <StatCard
          label="Largest Loss"
          value={`$${stats.largestLoss.toFixed(2)}`}
          color="red"
        />

        <StatCard
          label="Max Consec. Wins"
          value={`${stats.maxConsecutiveWins}`}
          color="neutral"
        />
        <StatCard
          label="Max Consec. Losses"
          value={`${stats.maxConsecutiveLosses}`}
          color="neutral"
        />
      </div>

      {stats.disciplineN !== undefined && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <SkillCard
            label="Discipline"
            pct={stats.disciplinePct ?? null}
            sub={`Process Followed = Yes · n = ${stats.disciplineN}`}
            title="Share of trades you marked Process Followed? = Yes, among trades labeled Yes or No (blank/unlabeled trades excluded). Reflects the filters above."
          />
        </div>
      )}

      {stats.skill && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Prediction &amp; Execution Skill
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            A funnel: read direction (intra-day) → read magnitude (daily) → convert to P&L (execution).
            Prediction measures whether price moved your way <em>beyond the open</em> (long: High−Open, short: Open−Low);
            execution measures whether you captured a move that was there. Reflects the filters above.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SkillCard
              label="Intra-Day Prediction"
              pct={stats.skill.intradayReadPct}
              sub={`moved ≥ 1× 30mATR beyond open · n = ${stats.skill.intradayReadN}`}
              title="Share of trades where price moved at least one 30-minute ATR beyond the open in your trade direction. The 30mATR is the mean 9:30–10:00 ET range over the prior 14 sessions (pre-open snapshot). The permissive 'did the day lean my way at all' bar."
            />
            <SkillCard
              label="Daily Prediction"
              pct={stats.skill.dailyReadPct}
              sub={`≥ 0.8× ADR · strong (1.0×): ${
                stats.skill.dailyReadStrongPct === null ? "—" : `${stats.skill.dailyReadStrongPct}%`
              } · n = ${stats.skill.dailyReadN}`}
              title="Share of trades where price moved at least 0.8× the daily ADR beyond the open in your direction (headline); 'strong' = the full 1.0× ADR. ADR (Average Daily Range) is the mean daily High−Low of the prior 14 sessions — gap-free, unlike ATR — matching the gap-free move measured from the open. Pre-open snapshot, no lookahead."
            />
            <SkillCard
              label="Execution Skill"
              pct={stats.skill.executionPct}
              sub={`Target Capture @ ${stats.skill.captureTarget}R · n = ${stats.skill.executionN}`}
              title="Target Capture %: among trades whose peak (Max R Before Stop) reached the target, the mean of min(realized R, target) ÷ target. Isolates the trail leak — cutting reachable runners short. Target follows the Capture Tracker setting."
            />
          </div>
        </div>
      )}

      <BreakdownTable title="Performance by Time Block" segments={stats.hourlyBreakdown} />
      <BreakdownTable title="Performance by Time Block (Granular)" segments={stats.granularHourlyBreakdown} />
      <BreakdownTable title="Performance by Setup" segments={stats.setupBreakdown} />
      <BreakdownTable title="Performance by Conviction" segments={stats.convictionBreakdown || []} />
      <BreakdownTable title="Performance by Catalyst" segments={stats.catalystBreakdown || []} />
    </div>
  );
}
