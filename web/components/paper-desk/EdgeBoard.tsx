"use client";

import { useMemo, useState } from "react";
import EquityChart from "./EquityChart";
import {
  arr,
  isNum,
  fmtPct,
  fmtPF,
  fmtR,
  rColor,
  scenarioList,
  Empty,
  Pill,
  StatusPill,
  TrackPill,
  type Bucket,
  type EdgeBlob,
  type LedgerBlob,
} from "./ui";

type RecordType = "forward" | "backtest";

function BucketTable({ rows, minN, backtest, nameOf }: { rows: Bucket[]; minN?: number; backtest: boolean; nameOf: (id: string) => string }) {
  if (rows.length === 0) return <Empty>No buckets match</Empty>;
  return (
    <div className="pd-scroll">
      <table className="pd-table">
        <thead>
          <tr>
            {backtest && <th>Record</th>}
            <th>System</th>
            <th>Setup</th>
            <th>Scenario</th>
            <th>Regime</th>
            <th>Track</th>
            <th className="r">n</th>
            <th className="r">Win rate</th>
            <th className="r">Avg R</th>
            <th className="r">Expectancy</th>
            <th className="r">PF</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b, i) => {
            const thin = isNum(minN) && isNum(b.n) && b.n < minN;
            return (
              <tr key={b.key ?? i}>
                {backtest && (
                  <td>
                    <Pill tone="orange" title="Backtest result — not part of the forward record">
                      BACKTEST — not forward record
                    </Pill>
                  </td>
                )}
                <td>{b.system ? nameOf(b.system) : "—"}</td>
                <td>{b.setup ?? "—"}</td>
                <td>
                  {scenarioList(b.scenario).map((s) => (
                    <span key={s} className="pd-tag">
                      {s}
                    </span>
                  ))}
                  {scenarioList(b.scenario).length === 0 && <span className="pd-faint">any</span>}
                </td>
                <td>{b.regime ?? <span className="pd-faint">any</span>}</td>
                <td>
                  <TrackPill track={b.track} />
                </td>
                <td className="r" style={thin ? { color: "var(--pd-faint)" } : undefined} title={thin ? `below minN (${minN})` : undefined}>
                  {isNum(b.n) ? b.n : "—"}
                </td>
                <td className="r">{fmtPct(b.winRate)}</td>
                <td className="r" style={{ color: rColor(b.avgR) }}>
                  {fmtR(b.avgR)}
                </td>
                <td className="r" style={{ color: rColor(b.expectancy) }}>
                  {fmtR(b.expectancy)}
                </td>
                <td className="r">{fmtPF(b.profitFactor)}</td>
                <td>
                  <StatusPill value={b.status ?? "collecting"} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EdgeBoard({ edge, ledger, nameOf }: { edge: EdgeBlob | null; ledger: LedgerBlob | null; nameOf: (id: string) => string }) {
  const [tab, setTab] = useState<RecordType>("forward");
  const [sys, setSys] = useState<string>("all");
  const [track, setTrack] = useState<string>("all");

  const fwd = arr(edge?.forward?.buckets);
  const bt = arr(edge?.backtest?.buckets);
  const buckets = tab === "forward" ? fwd : bt;

  const systemIds = useMemo(() => {
    const s = new Set<string>();
    [...fwd, ...bt].forEach((b) => b?.system && s.add(b.system));
    Object.keys(edge?.forward?.equity ?? {}).forEach((k) => s.add(k));
    Object.keys(edge?.backtest?.equity ?? {}).forEach((k) => s.add(k));
    return Array.from(s).sort();
  }, [fwd, bt, edge]);

  const rows = buckets.filter(
    (b) =>
      b &&
      (sys === "all" || b.system === sys) &&
      (track === "all" || b.track === track || b.track === "both")
  );

  if (!edge) return <Empty />;

  const equity = tab === "forward" ? edge.forward?.equity : edge.backtest?.equity;
  const fs = ledger?.summary?.forward;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="pd-row" style={{ justifyContent: "space-between" }}>
        <div className="pd-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "forward"} onClick={() => setTab("forward")}>
            Forward record ({fwd.length})
          </button>
          <button role="tab" aria-selected={tab === "backtest"} onClick={() => setTab("backtest")}>
            Backtest ({bt.length})
          </button>
        </div>
        <div className="pd-row">
          <label className="pd-small pd-muted">
            System{" "}
            <select value={sys} onChange={(e) => setSys(e.target.value)}>
              <option value="all">All</option>
              {systemIds.map((id) => (
                <option key={id} value={id}>
                  {nameOf(id)}
                </option>
              ))}
            </select>
          </label>
          <label className="pd-small pd-muted">
            Track{" "}
            <select value={track} onChange={(e) => setTrack(e.target.value)}>
              <option value="all">All</option>
              <option value="rules">Rules-only</option>
              <option value="agent">Agent</option>
            </select>
          </label>
        </div>
      </div>

      {tab === "backtest" ? (
        <div className="pd-banner">
          BACKTEST — not forward record
          {(edge.backtest?.from || edge.backtest?.to) && (
            <span style={{ fontWeight: 400 }}>
              {" "}
              · {edge.backtest?.from ?? "?"} → {edge.backtest?.to ?? "?"}
            </span>
          )}
        </div>
      ) : (
        <div className="pd-row pd-small pd-muted">
          <Pill tone="green">FORWARD — paper record since lock</Pill>
          {isNum(edge.minN) && <span>Buckets need n ≥ {edge.minN} before leaving “collecting”.</span>}
          {fs && (
            <span>
              Rules-only: {fs.rules?.n ?? 0} trades <span style={{ color: rColor(fs.rules?.sumR) }}>{fmtR(fs.rules?.sumR, 1)}</span> · Agent: {fs.agent?.n ?? 0} trades{" "}
              <span style={{ color: rColor(fs.agent?.sumR) }}>{fmtR(fs.agent?.sumR, 1)}</span>
            </span>
          )}
        </div>
      )}

      <BucketTable rows={rows} minN={edge.minN} backtest={tab === "backtest"} nameOf={nameOf} />

      <div className="pd-card">
        <div className="pd-row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
          <h3>
            {tab === "forward" ? "Forward equity" : "Backtest equity"} — cumulative R, rules-only, one line per system
          </h3>
          {tab === "backtest" && <Pill tone="orange">BACKTEST</Pill>}
        </div>
        <EquityChart equity={equity} systems={sys === "all" ? undefined : [sys]} nameOf={nameOf} />
      </div>

      {tab === "forward" && arr(ledger?.recent).length > 0 && (
        <div>
          <h3 style={{ marginBottom: 6 }}>Recent closed paper trades</h3>
          <div className="pd-scroll">
            <table className="pd-table">
              <thead>
                <tr>
                  <th>Sym</th>
                  <th>Dir</th>
                  <th>System</th>
                  <th>Setup</th>
                  <th>Track</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th className="r">Entry $</th>
                  <th className="r">Exit $</th>
                  <th className="r">R</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {arr(ledger?.recent)
                  .filter((t) => t && (sys === "all" || t.system === sys) && (track === "all" || t.track === track || t.track === "both"))
                  .map((t, i) => (
                    <tr key={t.id ?? i}>
                      <td style={{ fontWeight: 650 }}>{t.sym ?? "—"}</td>
                      <td>{t.dir ?? "—"}</td>
                      <td>{t.system ? nameOf(t.system) : "—"}</td>
                      <td>{t.setup ?? "—"}</td>
                      <td>
                        <TrackPill track={t.track} />
                      </td>
                      <td>{t.entryDate ?? "—"}</td>
                      <td>{t.exitDate ?? "—"}</td>
                      <td className="r">{isNum(t.entry) ? t.entry.toFixed(2) : "—"}</td>
                      <td className="r">{isNum(t.exitAvg) ? t.exitAvg.toFixed(2) : "—"}</td>
                      <td className="r" style={{ color: rColor(t.r), fontWeight: 650 }}>
                        {fmtR(t.r)}
                      </td>
                      <td className="pd-muted">{t.reason ?? ""}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
