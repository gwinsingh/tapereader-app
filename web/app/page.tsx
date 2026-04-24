import SetupCard from "@/components/SetupCard";
import MoverRow from "@/components/MoverRow";
import { data } from "@/lib/data";

export default async function Dashboard() {
  const [active, forming, movers] = await Promise.all([
    data.getActiveSetups(),
    data.getFormingSetups(),
    data.getTopMovers(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Active Setups
          </h1>
          <span className="text-xs text-muted">{active.length} triggered</span>
        </div>
        {active.length === 0 ? (
          <p className="text-sm text-muted">No active setups right now.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <SetupCard key={s.id} setup={s} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Forming Setups
          </h2>
          <span className="text-xs text-muted">{forming.length} tracking</span>
        </div>
        {forming.length === 0 ? (
          <p className="text-sm text-muted">No forming setups.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {forming.map((s) => (
              <SetupCard key={s.id} setup={s} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Top Movers
        </h2>
        <div className="rounded border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-xs uppercase text-muted">
            <div className="flex gap-3"><span className="w-14">Sym</span><span>Last</span></div>
            <div className="flex gap-4"><span>%</span><span className="w-16 text-right">Vol</span><span className="w-12 text-right">RVol</span></div>
          </div>
          <div className="divide-y divide-border">
            {movers.map((m) => (
              <MoverRow key={m.symbol} mover={m} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
