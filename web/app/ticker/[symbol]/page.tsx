import { notFound } from "next/navigation";
import PriceChart from "@/components/charts/PriceChart";
import SetupCard from "@/components/SetupCard";
import WatchlistButton from "@/components/WatchlistButton";
import { data } from "@/lib/data";
import { fmtPct, fmtPrice, fmtRelTime, fmtVolume } from "@/lib/format";

export default async function TickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();
  const [ticker, daily, intraday, setups] = await Promise.all([
    data.getTicker(symbol),
    data.getBars(symbol, "daily"),
    data.getBars(symbol, "15m"),
    data.getSetupsForTicker(symbol),
  ]);
  if (!ticker) notFound();

  const up = ticker.changePct >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-3xl font-bold">{ticker.symbol}</h1>
            <span className="text-sm text-muted">{ticker.name}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3 font-mono">
            <span className="text-2xl">{fmtPrice(ticker.lastPrice)}</span>
            <span className={`text-base ${up ? "text-accent" : "text-danger"}`}>
              {fmtPct(ticker.changePct)}
            </span>
            <span className="text-xs text-muted">Vol {fmtVolume(ticker.volume)}</span>
            <span className="text-xs text-muted">as of {fmtRelTime(ticker.asOf)}</span>
          </div>
        </div>
        <WatchlistButton symbol={ticker.symbol} />
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Daily</h2>
        <div className="rounded border border-border bg-panel p-2">
          <PriceChart bars={daily} height={420} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Intraday (15m)</h2>
        <div className="rounded border border-border bg-panel p-2">
          <PriceChart bars={intraday} height={320} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Setups on {ticker.symbol}</h2>
        {setups.length === 0 ? (
          <p className="text-sm text-muted">No active or forming setups on this ticker.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {setups.map((s) => (
              <SetupCard key={s.id} setup={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
