"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EdgeBoard from "@/components/paper-desk/EdgeBoard";
import {
  PAPERDESK_CSS,
  arr,
  isNum,
  obj,
  fmtNum,
  fmtR,
  fmtTime,
  rColor,
  scenarioList,
  Empty,
  Pill,
  Section,
  StatusPill,
  TrackPill,
  type DeskData,
  type Order,
  type PlanBlob,
  type PositionsBlob,
  type SetupsBlob,
  type StatusBlob,
} from "@/components/paper-desk/ui";

const EMPTY: DeskData = { status: null, plan: null, positions: null, edge: null, setups: null, ledger: null };
const KEYS = Object.keys(EMPTY) as (keyof DeskData)[];

function pickBlobs(j: unknown): DeskData {
  const out = { ...EMPTY } as Record<keyof DeskData, unknown>;
  if (obj(j)) for (const k of KEYS) out[k] = obj(j[k]) ? j[k] : null;
  return out as unknown as DeskData;
}

// ---------------------------------------------------------------------------

function SystemsStrip({ setups }: { setups: SetupsBlob | null }) {
  const systems = arr(setups?.systems);
  if (systems.length === 0) return <Empty />;
  return (
    <div className="pd-grid">
      {systems.map((s, i) => {
        const n = Array.isArray(s.setups) ? s.setups.length : arr(setups?.setups).filter((x) => x?.system === s.id).length;
        const gate = s.gateToday;
        return (
          <div key={s.id ?? i} className="pd-card">
            <div className="pd-row" style={{ justifyContent: "space-between" }}>
              <strong>{s.name ?? s.id ?? "—"}</strong>
              {s.source && <span className="pd-tag">{s.source}</span>}
            </div>
            <div className="pd-row pd-small" style={{ marginTop: 6 }}>
              <span className="pd-muted">
                {n} setup{n === 1 ? "" : "s"}
              </span>
              {gate && typeof gate.open === "boolean" ? (
                <Pill tone={gate.open ? "green" : "red"} title={gate.reason}>
                  gate {gate.open ? "open" : "closed"}
                </Pill>
              ) : (
                <Pill tone="muted">gate —</Pill>
              )}
            </div>
            {gate?.reason && <div className="pd-small pd-faint" style={{ marginTop: 4 }}>{gate.reason}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

function PlanSection({ plan, status, nameOf, systemOrder }: { plan: PlanBlob | null; status: StatusBlob | null; nameOf: (id: string) => string; systemOrder: string[] }) {
  const agentStatus = plan?.agent?.status ?? status?.agent?.status;
  const agentReason = plan?.agent?.reason ?? status?.agent?.reason;
  const sha = plan?.sha256 ?? status?.lock?.sha256;
  const late = plan?.late ?? status?.lock?.late;
  const qqq = plan?.regime?.qqq;

  const aside = plan ? (
    <>
      <span>agent</span>
      <StatusPill value={agentStatus ?? "missing"} title={agentReason} />
    </>
  ) : undefined;

  if (!plan) {
    return (
      <Section title="Today's plan">
        <Empty />
      </Section>
    );
  }

  const orders = arr(plan.orders).filter(Boolean);
  const groups = new Map<string, Order[]>();
  for (const o of orders) {
    const k = o.system ?? "—";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(o);
  }
  const groupKeys = Array.from(groups.keys()).sort((a, b) => {
    const ia = systemOrder.indexOf(a);
    const ib = systemOrder.indexOf(b);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
  });
  const nCols = 12;

  return (
    <Section title={`Today's plan${plan.date ? ` — ${plan.date}` : ""}`} aside={aside}>
      <div className="pd-card" style={{ marginBottom: 10 }}>
        <div className="pd-row pd-small">
          <span>
            <span className="pd-muted">Locked</span> {fmtTime(plan.lockedAt ?? status?.lock?.at)}
          </span>
          <span className="pd-mono" title={sha ?? undefined}>
            <span className="pd-muted">SHA-256</span> {sha ? sha.slice(0, 12) : "—"}
          </span>
          {late ? <Pill tone="orange" title="Plan was locked after the pre-market deadline">LATE LOCK</Pill> : <Pill tone="green">on time</Pill>}
          {plan.regime?.label && <Pill tone="accent">{plan.regime.label}</Pill>}
          {arr(plan.regime?.tags).map((t) => (
            <span key={t} className="pd-tag">
              {t}
            </span>
          ))}
        </div>
        {qqq && (isNum(qqq.close) || isNum(qqq.ema21)) && (
          <div className="pd-small pd-muted" style={{ marginTop: 6 }}>
            QQQ close <span className="num">{fmtNum(qqq.close)}</span> · EMA9 <span className="num">{fmtNum(qqq.ema9)}</span> · EMA21{" "}
            <span className="num">{fmtNum(qqq.ema21)}</span> · SMA50 <span className="num">{fmtNum(qqq.sma50)}</span>
          </div>
        )}
        {agentReason && agentStatus !== "ok" && <div className="pd-small" style={{ marginTop: 6, color: "var(--pd-orange)" }}>Agent: {agentReason}</div>}
      </div>

      {orders.length === 0 ? (
        <Empty>No orders in today&apos;s plan</Empty>
      ) : (
        <div className="pd-scroll">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Sym</th>
                <th>Dir</th>
                <th>System</th>
                <th>Setup</th>
                <th>Grade</th>
                <th>Scenario</th>
                <th>Trigger</th>
                <th className="r">Stop</th>
                <th className="r">Size</th>
                <th>Cluster</th>
                <th>Thesis</th>
              </tr>
            </thead>
            <tbody>
              {groupKeys.map((g) => (
                <GroupRows key={g} title={nameOf(g)} orders={groups.get(g)!} nCols={nCols} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pd-row pd-small pd-muted" style={{ marginTop: 6 }}>
        Plan column: <TrackPill track="rules" /> rules-only plan · <TrackPill track="agent" /> agent plan · <TrackPill track="both" /> in both
      </div>
    </Section>
  );
}

function GroupRows({ title, orders, nCols }: { title: string; orders: Order[]; nCols: number }) {
  return (
    <>
      <tr className="pd-group">
        <td colSpan={nCols}>
          {title} <span className="pd-faint" style={{ fontWeight: 400 }}>· {orders.length}</span>
        </td>
      </tr>
      {orders.map((o, i) => {
        const trig = o.trigger?.text ?? ([o.trigger?.type, isNum(o.trigger?.level) ? o.trigger?.level : null].filter((x) => x != null).join(" ") || "—");
        return (
          <tr key={o.id ?? `${o.sym}-${i}`}>
            <td>
              <TrackPill track={o.track} />
            </td>
            <td style={{ fontWeight: 650 }}>{o.sym ?? "—"}</td>
            <td style={{ color: o.dir === "short" ? "var(--pd-red)" : o.dir === "long" ? "var(--pd-green)" : undefined }}>{o.dir ?? "—"}</td>
            <td>{o.source ? <span className="pd-tag">{o.source}</span> : <span className="pd-faint">—</span>}</td>
            <td>
              {o.setup ?? "—"}
              {o.setupVersion != null && <span className="pd-faint"> v{String(o.setupVersion).replace(/^v/i, "")}</span>}
            </td>
            <td>{o.grade ? <Pill tone={o.grade === "A+" ? "green" : "muted"}>{o.grade}</Pill> : "—"}</td>
            <td>
              {scenarioList(o.scenario).map((s) => (
                <span key={s} className="pd-tag">
                  {s}
                </span>
              ))}
            </td>
            <td className="wrap" style={{ minWidth: 160 }}>
              {trig}
            </td>
            <td className="r">{fmtNum(o.stop)}</td>
            <td className="r">{isNum(o.sizeR) ? `${o.sizeR.toFixed(2)}R` : "—"}</td>
            <td>{o.cluster ?? <span className="pd-faint">—</span>}</td>
            <td className="wrap">
              {o.thesis ?? <span className="pd-faint">—</span>}
              {o.invalidation?.text && <div className="pd-small pd-muted">Invalid if: {o.invalidation.text}</div>}
              {(o.exits?.text || o.exits?.scheme) && <div className="pd-small pd-muted">Exits: {o.exits?.text ?? o.exits?.scheme}</div>}
              {o.earnings?.date && (
                <div className="pd-small" style={{ color: "var(--pd-orange)" }}>
                  Earnings {o.earnings.date}
                  {o.earnings.rule ? ` — ${o.earnings.rule}` : ""}
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------

function RiskTotals({ title, values, cap, nameOf }: { title: string; values: Record<string, number>; cap?: number; nameOf?: (id: string) => string }) {
  const entries = Object.entries(values).filter(([, v]) => isNum(v));
  return (
    <div className="pd-card">
      <div className="pd-row" style={{ justifyContent: "space-between" }}>
        <h3>{title}</h3>
        {isNum(cap) && <span className="pd-small pd-muted">cap {cap.toFixed(1)}R</span>}
      </div>
      {entries.length === 0 ? (
        <div className="pd-small pd-faint" style={{ marginTop: 4 }}>none</div>
      ) : (
        <table className="pd-table" style={{ marginTop: 4 }}>
          <tbody>
            {entries.map(([k, v]) => {
              const over = isNum(cap) && v >= cap;
              return (
                <tr key={k}>
                  <td>{nameOf ? nameOf(k) : k}</td>
                  <td className={`r ${over ? "pd-warn" : ""}`} title={over ? "at or over cap" : undefined}>
                    {v.toFixed(2)}R{over ? " ⚠" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PositionsSection({ positions, nameOf }: { positions: PositionsBlob | null; nameOf: (id: string) => string }) {
  if (!positions) {
    return (
      <Section title="Open positions">
        <Empty />
      </Section>
    );
  }
  const rows = arr(positions.positions).filter(Boolean);
  const caps = positions.caps ?? {};
  const sumRisk = rows.reduce((s, p) => s + (isNum(p.openRiskR) ? p.openRiskR : 0), 0);
  const total = isNum(positions.totalOpenR) ? positions.totalOpenR : sumRisk;

  let bySystem = obj(positions.bySystemR) ? (positions.bySystemR as Record<string, number>) : null;
  if (!bySystem) {
    bySystem = {};
    for (const p of rows) if (p.system && isNum(p.openRiskR)) bySystem[p.system] = (bySystem[p.system] ?? 0) + p.openRiskR;
  }
  let byCluster = obj(positions.byClusterR) ? (positions.byClusterR as Record<string, number>) : null;
  if (!byCluster) {
    byCluster = {};
    for (const p of rows) if (p.cluster && isNum(p.openRiskR)) byCluster[p.cluster] = (byCluster[p.cluster] ?? 0) + p.openRiskR;
  }
  const totalOver = isNum(caps.totalR) && total >= caps.totalR;

  return (
    <Section title="Open positions" aside={positions.asOf ? <span>as of {positions.asOf}</span> : undefined}>
      <div className="pd-grid" style={{ marginBottom: 10 }}>
        <div className="pd-card pd-stat">
          <span className="pd-stat-k">Total open risk</span>
          <span className={`pd-stat-v ${totalOver ? "pd-warn" : ""}`}>
            {total.toFixed(2)}R
            {isNum(caps.totalR) && <span className="pd-small pd-muted" style={{ fontWeight: 400 }}> / {caps.totalR.toFixed(1)}R cap</span>}
          </span>
          <span className="pd-small pd-muted">{rows.length} open position{rows.length === 1 ? "" : "s"}</span>
        </div>
        <RiskTotals title="Open risk by system book" values={bySystem} cap={caps.perSystemR} nameOf={nameOf} />
        <RiskTotals title="Open risk by correlated cluster" values={byCluster} cap={caps.clusterR} />
      </div>

      {rows.length === 0 ? (
        <Empty>No open paper positions</Empty>
      ) : (
        <div className="pd-scroll">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Sym</th>
                <th>Dir</th>
                <th>System</th>
                <th>Setup</th>
                <th>Track</th>
                <th>Entry date</th>
                <th className="r">Entry</th>
                <th className="r">Stop</th>
                <th className="r">Last</th>
                <th className="r">Shares</th>
                <th className="r">Current R</th>
                <th className="r">Open risk</th>
                <th>Next exit rule</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id ?? `${p.sym}-${i}`}>
                  <td style={{ fontWeight: 650 }}>{p.sym ?? "—"}</td>
                  <td style={{ color: p.dir === "short" ? "var(--pd-red)" : p.dir === "long" ? "var(--pd-green)" : undefined }}>{p.dir ?? "—"}</td>
                  <td>{p.system ? nameOf(p.system) : "—"}</td>
                  <td>{p.setup ?? "—"}</td>
                  <td>
                    <TrackPill track={p.track} />
                  </td>
                  <td>{p.entryDate ?? "—"}</td>
                  <td className="r">{fmtNum(p.entry)}</td>
                  <td className="r">{fmtNum(p.stop)}</td>
                  <td className="r">{fmtNum(p.lastClose)}</td>
                  <td className="r">
                    {isNum(p.remainingShares) && isNum(p.shares) && p.remainingShares !== p.shares
                      ? `${p.remainingShares} / ${p.shares}`
                      : isNum(p.remainingShares)
                        ? p.remainingShares
                        : isNum(p.shares)
                          ? p.shares
                          : "—"}
                  </td>
                  <td className="r" style={{ color: rColor(p.currentR), fontWeight: 650 }}>
                    {fmtR(p.currentR)}
                  </td>
                  <td className="r">{isNum(p.openRiskR) ? `${p.openRiskR.toFixed(2)}R` : "—"}</td>
                  <td className="wrap pd-muted">{p.nextExit ?? "—"}</td>
                </tr>
              ))}
              <tr className="pd-total">
                <td colSpan={11}>Total open risk</td>
                <td className={`r ${totalOver ? "pd-warn" : ""}`}>{sumRisk.toFixed(2)}R</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------------------

function RunStatus({ status }: { status: StatusBlob | null }) {
  if (!status) {
    return (
      <Section title="Last run">
        <Empty />
      </Section>
    );
  }
  const run = status.lastRun;
  const messages = arr(run?.messages).filter((m) => typeof m === "string");
  return (
    <Section title="Last run" aside={status.name ? <span>{status.name}{status.version ? ` v${status.version}` : ""}</span> : undefined}>
      <div className="pd-card">
        <div className="pd-row">
          <StatusPill value={run?.status ?? "unknown"} />
          {run?.kind && <span className="pd-tag">{run.kind}</span>}
          <span className="pd-small">{fmtTime(run?.at)}</span>
          {run?.forDate && <span className="pd-small pd-muted">for {run.forDate}</span>}
        </div>
        <div className="pd-row pd-small pd-muted" style={{ marginTop: 6 }}>
          {status.lock?.at && <span>lock {fmtTime(status.lock.at)}</span>}
          {status.lock?.late && <Pill tone="orange">late lock</Pill>}
          {status.agent?.status && (
            <span className="pd-row" style={{ gap: 4 }}>
              agent <StatusPill value={status.agent.status} title={status.agent.reason} />
            </span>
          )}
          {status.agent?.promptVersion && <span>prompt {status.agent.promptVersion}</span>}
        </div>
        {messages.length > 0 ? (
          <ul className="pd-small" style={{ marginTop: 8, paddingLeft: 18, listStyle: "disc" }}>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : (
          <div className="pd-small pd-faint" style={{ marginTop: 8 }}>No messages</div>
        )}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------

export default function PaperDeskPage() {
  const [data, setData] = useState<DeskData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/pct-bootcamp/paper-desk/api?key=all", { cache: "no-store" });
      const j: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = obj(j) && typeof j.error === "string" ? j.error : `HTTP ${res.status}`;
        setError(res.status === 503 ? `${msg} — data is only available on the deployed site` : msg);
        setData(EMPTY);
      } else {
        setData(pickBlobs(j));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const systems = arr(data.setups?.systems);
  const nameOf = (id: string) => systems.find((s) => s?.id === id)?.name ?? id;
  const systemOrder = systems.map((s) => s?.id ?? "").filter(Boolean);
  const run = data.status?.lastRun;

  return (
    <div className="paperdesk">
      <style dangerouslySetInnerHTML={{ __html: PAPERDESK_CSS }} />

      <div className="pd-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="pd-small pd-muted">
            <Link href="/pct-bootcamp">PCT Bootcamp</Link> / Paper Desk
          </div>
          <h1>Paper Desk</h1>
          <div className="pd-small pd-muted" style={{ marginTop: 2 }}>
            Forward-tested paper trading: rules-only vs agent, locked pre-market plans.
          </div>
        </div>
        <div className="pd-row">
          {run?.status && (
            <span className="pd-row pd-small" style={{ gap: 4 }}>
              last run <StatusPill value={run.status} /> <span className="pd-muted">{fmtTime(run.at)}</span>
            </span>
          )}
          <button className="pd-btn" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Reload"}
          </button>
        </div>
      </div>

      {error && (
        <div className="pd-card pd-small" style={{ marginTop: 12, color: "var(--pd-red)" }}>
          Couldn&apos;t load Paper Desk data: {error}
        </div>
      )}

      {loading && !error && !data.status && !data.plan ? (
        <div className="pd-empty" style={{ marginTop: 16 }}>Loading…</div>
      ) : (
        <>
          <Section title="Systems">
            <SystemsStrip setups={data.setups} />
          </Section>
          <PlanSection plan={data.plan} status={data.status} nameOf={nameOf} systemOrder={systemOrder} />
          <PositionsSection positions={data.positions} nameOf={nameOf} />
          <Section title="Edge board" aside={data.edge?.asOf ? <span>as of {data.edge.asOf}</span> : undefined}>
            <EdgeBoard edge={data.edge} ledger={data.ledger} nameOf={nameOf} />
          </Section>
          <RunStatus status={data.status} />
        </>
      )}
    </div>
  );
}
