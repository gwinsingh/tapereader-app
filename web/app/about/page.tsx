export default function AboutPage() {
  return (
    <article className="prose prose-invert mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">About TapeReader</h1>
      <p className="text-sm text-muted">
        A free, public setup scanner for US equities. Built for discretionary traders who already speak the language of
        patterns and triggers.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">What you'll find here</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li><strong>Active setups</strong> — setups whose trigger just hit on the current or most recent bar.</li>
        <li><strong>Forming setups</strong> — setups likely to trigger in the next 1 day / 1 week.</li>
        <li><strong>Top movers</strong> — unusual volume, gainers, losers.</li>
        <li><strong>Per-ticker charts</strong> — daily and intraday, with setup annotations overlaid.</li>
        <li><strong>Watchlist</strong> — local to your browser. No accounts, no sync.</li>
      </ul>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">Setup catalog (V1)</h2>
      <dl className="mt-2 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Breakout above N-day high</dt>
          <dd className="text-muted">Close above the highest high of the last N sessions with above-average volume.</dd>
        </div>
        <div>
          <dt className="font-semibold">Pullback to key EMA</dt>
          <dd className="text-muted">In an established uptrend, price pulls back and holds the 20/50 EMA.</dd>
        </div>
        <div>
          <dt className="font-semibold">Inside Day / NR7</dt>
          <dd className="text-muted">Narrow-range bar fully inside the prior day — compression before expansion.</dd>
        </div>
        <div>
          <dt className="font-semibold">Volume Dry-Up Coil</dt>
          <dd className="text-muted">Tight range with contracting volume after a prior trend leg.</dd>
        </div>
        <div>
          <dt className="font-semibold">Gap-and-Go</dt>
          <dd className="text-muted">Gaps above prior high, opens strong, no early fade.</dd>
        </div>
      </dl>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">Data freshness</h2>
      <p className="text-sm text-muted">
        Daily scans run after US market close. Intraday scans run every 15 minutes during RTH. All data is
        15+ minutes delayed.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted">Disclaimer</h2>
      <p className="text-sm text-muted">
        TapeReader is a tool for education and personal research. It is not investment advice and nothing on this site
        is a recommendation to buy or sell any security. Trade at your own risk.
      </p>
    </article>
  );
}
