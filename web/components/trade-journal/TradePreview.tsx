interface TradeRow {
  symbol: string;
  side: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  pnl: number;
  numPartials: number;
  durationMins: number;
  entryTime: string;
  exitTime: string;
}

interface Props {
  trades: TradeRow[];
  rowsAppended: number;
  rowsSkipped: number;
  accounts: string[];
}

export default function TradePreview({ trades, rowsAppended, rowsSkipped, accounts }: Props) {
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded border border-border bg-panel px-3 py-2">
          <span className="text-muted">Trades:</span>{" "}
          <span className="font-mono font-semibold">{trades.length}</span>
        </div>
        <div className="rounded border border-border bg-panel px-3 py-2">
          <span className="text-muted">Appended:</span>{" "}
          <span className="font-mono font-semibold text-accent">{rowsAppended}</span>
        </div>
        {rowsSkipped > 0 && (
          <div className="rounded border border-border bg-panel px-3 py-2">
            <span className="text-muted">Skipped (dups):</span>{" "}
            <span className="font-mono font-semibold text-warn">{rowsSkipped}</span>
          </div>
        )}
        <div className="rounded border border-border bg-panel px-3 py-2">
          <span className="text-muted">Sheet(s):</span>{" "}
          <span className="font-mono font-semibold">{accounts.join(", ")}</span>
        </div>
        <div className="rounded border border-border bg-panel px-3 py-2">
          <span className="text-muted">Total P&L:</span>{" "}
          <span
            className={`font-mono font-semibold ${totalPnl >= 0 ? "text-accent" : "text-danger"}`}
          >
            ${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-panel text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Entry</th>
              <th className="px-3 py-2">Exit</th>
              <th className="px-3 py-2 text-center">Dur (min)</th>
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Side</th>
              <th className="px-3 py-2 text-right">Shares</th>
              <th className="px-3 py-2 text-right">Avg Entry</th>
              <th className="px-3 py-2 text-right">Avg Exit</th>
              <th className="px-3 py-2 text-center">Partials</th>
              <th className="px-3 py-2 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-panel/50">
                <td className="px-3 py-2 font-mono text-xs">{t.entryTime}</td>
                <td className="px-3 py-2 font-mono text-xs">{t.exitTime}</td>
                <td className="px-3 py-2 text-center font-mono text-xs">{t.durationMins.toFixed(1)}</td>
                <td className="px-3 py-2 font-semibold">{t.symbol}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      t.side === "Long"
                        ? "bg-accent/10 text-accent"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono">{t.shares}</td>
                <td className="px-3 py-2 text-right font-mono">${t.avgEntry.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {t.avgExit > 0 ? `$${t.avgExit.toFixed(2)}` : "—"}
                </td>
                <td className="px-3 py-2 text-center font-mono">{t.numPartials}</td>
                <td
                  className={`px-3 py-2 text-right font-mono font-semibold ${
                    t.pnl >= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  ${t.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
