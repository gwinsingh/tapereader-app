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
      ? "text-accent"
      : color === "red"
        ? "text-danger"
        : "text-text";

  return (
    <div className="rounded border border-border bg-panel px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}

function pnlColor(v: number): "green" | "red" | "neutral" {
  if (v > 0) return "green";
  if (v < 0) return "red";
  return "neutral";
}

export default function AggregateStats({ stats }: Props) {
  return (
    <div className="space-y-3">
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
          value={stats.profitFactor === Infinity ? "—" : `${stats.profitFactor}`}
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
    </div>
  );
}
