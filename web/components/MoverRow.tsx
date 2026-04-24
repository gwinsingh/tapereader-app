import Link from "next/link";
import type { Mover } from "@/lib/types";
import { fmtPct, fmtPrice, fmtVolume } from "@/lib/format";

export default function MoverRow({ mover }: { mover: Mover }) {
  const up = mover.changePct >= 0;
  return (
    <Link
      href={`/ticker/${mover.symbol}`}
      className="flex items-center justify-between rounded border border-transparent px-3 py-2 font-mono text-sm hover:border-border hover:bg-panel"
    >
      <div className="flex items-baseline gap-3">
        <span className="w-14 font-semibold">{mover.symbol}</span>
        <span className="text-text">{fmtPrice(mover.lastPrice)}</span>
      </div>
      <div className="flex items-baseline gap-4 text-xs">
        <span className={up ? "text-accent" : "text-danger"}>{fmtPct(mover.changePct)}</span>
        <span className="w-16 text-right text-muted">{fmtVolume(mover.volume)}</span>
        <span className="w-12 text-right text-muted">{mover.relVolume.toFixed(1)}x</span>
      </div>
    </Link>
  );
}
