import Link from "next/link";
import { SETUP_LABELS, type Setup } from "@/lib/types";
import { fmtPrice, fmtRelTime } from "@/lib/format";

export default function SetupCard({ setup }: { setup: Setup }) {
  const color =
    setup.status === "active"
      ? "text-accent"
      : setup.status === "forming"
        ? "text-warn"
        : setup.status === "invalidated"
          ? "text-danger"
          : "text-text";
  return (
    <Link
      href={`/setups/${setup.id}`}
      className="block rounded border border-border bg-panel p-3 transition hover:border-accent"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold">{setup.ticker}</span>
          <span className={`text-xs uppercase tracking-wider ${color}`}>{setup.status}</span>
        </div>
        <span className="text-xs text-muted">{fmtRelTime(setup.detectedAt)}</span>
      </div>
      <div className="mt-1 text-sm">{SETUP_LABELS[setup.type]}</div>
      <div className="mt-2 flex items-center gap-4 font-mono text-xs text-muted">
        <span>trigger <span className="text-text">{fmtPrice(setup.triggerPrice)}</span></span>
        {setup.stopHint && <span>stop <span className="text-text">{fmtPrice(setup.stopHint)}</span></span>}
        {setup.targetHint && <span>target <span className="text-text">{fmtPrice(setup.targetHint)}</span></span>}
        <span className="ml-auto">{setup.timeframe}</span>
      </div>
    </Link>
  );
}
