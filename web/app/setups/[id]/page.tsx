import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "edge";

import PriceChart from "@/components/charts/PriceChart";
import { data } from "@/lib/data";
import { SETUP_LABELS } from "@/lib/types";
import { fmtPrice, fmtRelTime } from "@/lib/format";

export default async function SetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const setup = await data.getSetup(id);
  if (!setup) notFound();

  const bars = await data.getBars(setup.ticker, setup.timeframe);
  const color =
    setup.status === "active" ? "text-accent" : setup.status === "forming" ? "text-warn" : "text-text";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-baseline gap-3">
            <Link href={`/ticker/${setup.ticker}`} className="font-mono text-3xl font-bold hover:text-accent">
              {setup.ticker}
            </Link>
            <span className={`text-xs uppercase tracking-wider ${color}`}>{setup.status}</span>
            <span className="text-xs text-muted">{setup.timeframe}</span>
          </div>
          <h1 className="mt-1 text-lg">{SETUP_LABELS[setup.type]}</h1>
          <p className="mt-1 text-xs text-muted">Detected {fmtRelTime(setup.detectedAt)}</p>
        </div>
        <Link
          href={`/ticker/${setup.ticker}`}
          className="rounded border border-border bg-panel px-3 py-1.5 text-sm hover:border-accent"
        >
          ← Back to {setup.ticker}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[3fr_1fr]">
        <div className="rounded border border-border bg-panel p-2">
          <PriceChart bars={bars} annotations={setup.annotations} height={480} />
        </div>
        <aside className="rounded border border-border bg-panel p-4 font-mono text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted">Trigger</dt>
              <dd>{fmtPrice(setup.triggerPrice)}</dd>
            </div>
            {setup.stopHint !== undefined && (
              <div className="flex justify-between">
                <dt className="text-muted">Stop hint</dt>
                <dd className="text-danger">{fmtPrice(setup.stopHint)}</dd>
              </div>
            )}
            {setup.targetHint !== undefined && (
              <div className="flex justify-between">
                <dt className="text-muted">Target hint</dt>
                <dd className="text-accent">{fmtPrice(setup.targetHint)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Timeframe</dt>
              <dd>{setup.timeframe}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Status</dt>
              <dd className={color}>{setup.status}</dd>
            </div>
          </dl>
          {setup.notes && (
            <p className="mt-4 border-t border-border pt-3 font-sans text-xs text-muted">
              {setup.notes}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
