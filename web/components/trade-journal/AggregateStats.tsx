"use client";

import { useState } from "react";

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

export interface TrendPoint {
  weekStart: string;
  pct: number | null;
  hits: number;
  n: number;
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
  disciplineTrend?: TrendPoint[];
  sumR?: number | null;
  expR?: number | null;
  expRLo?: number | null;
  expRHi?: number | null;
  rTradeCount?: number;
  sumRExclTop3?: number | null;
  top3Labels?: string[];
  heldGreenPct?: number | null;
  heldGreenN?: number;
  heldGreenTrend?: TrendPoint[];
}

interface Props {
  stats: Stats;
}

function rColor(v: number | null | undefined): string {
  if (v === null || v === undefined) return "text-[var(--color-muted)]";
  if (v > 0) return "text-[var(--stat-green)]";
  if (v < 0) return "text-[var(--stat-red)]";
  return "text-[var(--color-text)]";
}

/**
 * One headline number. `sub` carries the denominator or the caveat — every card here
 * shows one, because a percentage without an n invites exactly the over-reading this
 * redesign exists to prevent.
 */
function HeadlineCard({
  label,
  value,
  sub,
  title,
  valueClass = "text-[var(--color-text)]",
  emphasis = false,
}: {
  label: string;
  value: string;
  sub: string;
  title: string;
  valueClass?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded border bg-[var(--color-panel)] px-4 py-3 ${
        emphasis ? "border-[var(--color-text)]/30" : "border-[var(--color-border)]"
      }`}
      title={title}
    >
      <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
        {label}
        <span className="cursor-help text-[10px] opacity-60" aria-hidden="true">
          ⓘ
        </span>
      </p>
      <p className={`mt-0.5 font-mono text-2xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-[var(--color-muted)]">{sub}</p>
    </div>
  );
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
                <td className={`px-3 py-2 text-center font-mono ${seg.trades < 15 ? "text-[var(--color-muted)]" : ""}`}>
                  {seg.trades}
                  {seg.trades < 15 && <span title="n < 15 — too few trades to read as a finding">*</span>}
                </td>
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
  const [showDetail, setShowDetail] = useState(false);

  const fmtR = (v: number | null | undefined) =>
    v === null || v === undefined ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}R`;

  // A CI that spans zero means the sample cannot establish an edge — surfaced in the
  // card's own subtitle rather than buried, because it is the single most over-read
  // number on this page.
  const ciSpansZero =
    stats.expRLo !== null && stats.expRLo !== undefined &&
    stats.expRHi !== null && stats.expRHi !== undefined &&
    stats.expRLo <= 0 && stats.expRHi >= 0;

  const hasR = stats.sumR !== null && stats.sumR !== undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Performance Overview</h2>

      {hasR ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <HeadlineCard
            label="Total R"
            value={fmtR(stats.sumR)}
            sub={`${stats.rTradeCount ?? 0} trades with a risk value`}
            valueClass={rColor(stats.sumR)}
            emphasis
            title="Sum of realised R across the filtered trades. Shown in R, not dollars: the risk unit moved $14 → $18 → $28 inside this book, so dollar totals are not comparable across it."
          />
          <HeadlineCard
            label="R excl. top 3"
            value={fmtR(stats.sumRExclTop3)}
            sub={
              stats.top3Labels && stats.top3Labels.length
                ? `without ${stats.top3Labels.join(", ")}`
                : "needs > 3 trades"
            }
            valueClass={rColor(stats.sumRExclTop3)}
            emphasis
            title="Total R with the three largest winners removed. A right-tail strategy's total is carried by a handful of trades — the gap between this and Total R is the difference between 'I have an edge' and 'I had three good trades'."
          />
          <HeadlineCard
            label="Expectancy"
            value={
              stats.expR === null || stats.expR === undefined
                ? "—"
                : `${stats.expR > 0 ? "+" : ""}${stats.expR.toFixed(2)}R`
            }
            sub={
              stats.expRLo === null || stats.expRLo === undefined
                ? "per trade"
                : `95% CI [${stats.expRLo.toFixed(2)}, ${stats.expRHi!.toFixed(2)}]${ciSpansZero ? " — spans 0" : ""}`
            }
            valueClass={ciSpansZero ? "text-[var(--color-muted)]" : rColor(stats.expR)}
            title="Mean R per trade with a bootstrap 95% confidence interval. If the interval spans zero, this sample cannot establish an edge — the number is greyed out to say so."
          />
          <HeadlineCard
            label="+1R held green"
            value={stats.heldGreenPct === null || stats.heldGreenPct === undefined ? "—" : `${stats.heldGreenPct}%`}
            sub={`of ${stats.heldGreenN ?? 0} positions that reached +1R`}
            valueClass="text-[var(--color-text)]"
            title="Among positions whose in-window peak reached +1R, the share that still closed green. This is the leading indicator — it moves before P&L does. When it halves, stop trading."
          />
          <HeadlineCard
            label="Discipline"
            value={stats.disciplinePct === null || stats.disciplinePct === undefined ? "—" : `${stats.disciplinePct}%`}
            sub={`Process Followed = Yes · n = ${stats.disciplineN ?? 0}`}
            valueClass="text-[var(--color-text)]"
            title="Share of trades marked Process Followed? = Yes, among trades labeled Yes or No. Blank trades are excluded — and blanks cluster on bad days, so read the coverage panel alongside this."
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          No trades with a risk value in this selection — R-denominated stats need <code>R (Risk)</code> filled.
        </p>
      )}

      {stats.skill && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Prediction &amp; Execution Skill
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            A funnel: read direction (intra-day) → read magnitude (daily) → convert to P&L (execution).
            Prediction measures whether price moved your way <em>beyond the open</em> (long: High−Open, short: Open−Low);
            execution measures whether you captured a move that was genuinely there while you held it.
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
              title="Share of trades where price moved at least 0.8× the daily ADR beyond the open in your direction (headline); 'strong' = the full 1.0× ADR. ADR is the mean daily High−Low of the prior 14 sessions — gap-free, unlike ATR — matching the gap-free move measured from the open."
            />
            <SkillCard
              label="Execution Skill"
              pct={stats.skill.executionPct}
              sub={`Target Capture @ ${stats.skill.captureTarget}R · n = ${stats.skill.executionN}`}
              title="Among trades whose IN-WINDOW peak (while you actually held) reached the target, the mean of min(realised R, target) ÷ target. Benchmarked in-window on purpose: a peak measured to 16:00 counts levels you were never in the trade for."
            />
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="text-xs font-medium text-[var(--color-muted)] underline underline-offset-2 hover:text-[var(--color-text)]"
        >
          {showDetail ? "Hide" : "Show"} descriptive stats &amp; breakdowns
        </button>
        <p className="mt-1 text-[11px] text-[var(--color-muted)]">
          Dollar totals, win rate and the per-category tables. Kept out of the way: at this sample size
          most cells are below n = 15, and dollar figures are not comparable across a book whose risk
          unit changed mid-month.
        </p>
      </div>

      {showDetail && (
        <div className="space-y-6 border-l-2 border-[var(--color-border)] pl-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <HeadlineCard
              label="Total P&L"
              value={`$${stats.totalPnl.toFixed(2)}`}
              sub="not comparable across risk-unit changes"
              valueClass={rColor(stats.totalPnl)}
              title="Raw dollar P&L. The risk unit moved $14 → $18 → $28 inside this book, so this number mixes trades that were not risking the same amount. Use Total R."
            />
            <HeadlineCard
              label="Win Rate"
              value={`${stats.winRate}%`}
              sub={`${stats.winningTrades}W / ${stats.losingTrades}L`}
              title="A low win rate is not a defect here — this is a payoff-ratio strategy, so the size of the winners is what matters, not how often they arrive."
            />
            <HeadlineCard
              label="Profit Factor"
              value={stats.profitFactor >= 9999 ? "∞" : `${stats.profitFactor}`}
              sub={`${stats.totalTrades} trades`}
              valueClass={stats.profitFactor >= 1 ? "text-[var(--stat-green)]" : "text-[var(--stat-red)]"}
              title="Gross profit ÷ gross loss, in dollars. Same risk-unit caveat as Total P&L."
            />
            <HeadlineCard
              label="Avg Duration"
              value={`${stats.avgDurationMins} min`}
              sub="winners run longer by construction"
              title="Mean hold time. Partly definitional — a winner has to last long enough to become one — so do not read a duration split as an exit rule."
            />
          </div>

          <BreakdownTable title="Performance by Time Block" segments={stats.hourlyBreakdown} />
          <BreakdownTable title="Performance by Setup" segments={stats.setupBreakdown} />
          <BreakdownTable title="Performance by Conviction" segments={stats.convictionBreakdown || []} />
          <BreakdownTable title="Performance by Catalyst" segments={stats.catalystBreakdown || []} />
        </div>
      )}
    </div>
  );
}
