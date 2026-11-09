// KV publish: one POST per run with ≤ 6 blobs (status, plan, positions, edge, setups, ledger) to the
// Access-gated route /pct-bootcamp/paper-desk/api. ~1 run/weekday + Saturday = well under KV's 1,000 writes/day.
// Auth: Cloudflare Access service token (web/.env.local CF_ACCESS_CLIENT_ID/SECRET) + x-write-key.
// Write key: web/.env.local PAPERDESK_WRITE_KEY, else apps/4-week-challenge/.env VITE_WRITE_KEY. Missing -> skipped.
const fs = require("fs"), path = require("path");
const { parseEnvLocal, ENV_PATH } = require("../../review/env.js");
const { openRiskR } = require("./replay.js");
const EDGE = require("./edge.js");
const APP_ENV = path.join(__dirname, "..", "..", "..", "apps", "4-week-challenge", ".env");

function slimOrder(o) { return { id: o.id, track: o.track, system: o.system, source: o.source, setup: o.setup, setupVersion: o.setupVersion, sym: o.sym, dir: o.dir, grade: o.grade, scenario: o.scenario, thesis: o.thesis,
  trigger: { type: o.trigger.type, level: o.trigger.level ?? o.trigger.minGapPrice ?? null, text: o.trigger.text }, invalidation: { text: o.invalidation.text }, stop: o.stop.price ?? null, sizeR: o.sizeR,
  exits: { scheme: o.exits.scheme, text: o.exits.text }, earnings: o.earnings, cluster: o.cluster, epVerdict: o.epVerdict || null }; }

function blobs(out) {
  const { cfg, lib, st, trades, bt, status, plan } = out;
  const B = { status };
  if (plan) {
    const r = plan.rules.orders.map(slimOrder), a = ((plan.agent && plan.agent.orders) || []).map(slimOrder);
    const both = new Set(a.map(o => `${o.setup}|${o.sym}`));
    for (const o of r) if (both.has(`${o.setup}|${o.sym}`)) o.track = "both";
    B.plan = { date: plan.date, lockedAt: plan.lockedAt, sha256: out.status.lock ? out.status.lock.sha256 : null, late: plan.late, dry: plan.dry, regime: { label: plan.regime.label, tags: plan.regime.tags, qqq: plan.regime.qqq },
      agent: { status: plan.agent.status, reason: plan.agent.reason, regimeNote: plan.agent.regimeNote || null }, orders: [...r, ...a.filter(o => true)] };
  }
  const open = st.positions.filter(p => p.shares > 0);
  const bySystemR = {}, byClusterR = {};
  for (const p of open) { const k = `${p.track}:${p.system}`; bySystemR[k] = +((bySystemR[k] || 0) + openRiskR(p, cfg.R)).toFixed(3); if (p.cluster) { const c = `${p.track}:${p.cluster}`; byClusterR[c] = +((byClusterR[c] || 0) + openRiskR(p, cfg.R)).toFixed(3); } }
  B.positions = { asOf: status.lastRun.at, totalOpenR: +open.reduce((a, p) => a + openRiskR(p, cfg.R), 0).toFixed(3), caps: { totalR: cfg.portfolio.maxTotalOpenR, clusterR: cfg.portfolio.maxClusterR, perSystemR: cfg.portfolio.perSystemOpenR }, bySystemR, byClusterR,
    positions: open.map(p => ({ id: p.id, track: p.track, system: p.system, setup: p.setup, sym: p.sym, dir: p.dir, entryDate: p.entryDate, entry: p.entry, stop: +(+p.stop).toFixed(4), shares: p.initShares, remainingShares: p.shares, lastClose: p.lastClose ?? null, currentR: p.lastCloseR ?? null, openRiskR: +openRiskR(p, cfg.R).toFixed(3), nextExit: p.pendingExit || (p.scheme && p.scheme.name) || "" })) };
  const fb = EDGE.board(trades, cfg), bb = EDGE.board(bt.trades || [], cfg);
  B.edge = { asOf: status.lastRun.at, minN: cfg.edge.minN, forward: { buckets: [...fb.bySystem, ...fb.bySetup], equity: EDGE.equity(trades) }, backtest: { from: bt.from, to: bt.to, buckets: [...bb.bySystem, ...bb.bySetup], equity: EDGE.equity(bt.trades || []) } };
  B.setups = { systems: [...lib.systems.values()].map(s => ({ id: s.id, name: s.name, source: s.source, vault: s.vault, setups: s.setups, gateToday: plan ? (() => { const g = s.setups.map(id => plan.gates[id]).filter(Boolean); const open = g.some(x => x.open); return { open, reason: (g.find(x => x.open === open) || {}).reason || "" }; })() : null })),
    setups: [...lib.setups.values()].map(s => ({ id: s.id, system: s.system, source: s.source, version: s.version, name: s.name, direction: s.direction, scenario: s.scenario, exitScheme: s.exit })) };
  const cl = [...trades].sort((a, b) => a.exitDate < b.exitDate ? 1 : -1);
  const sum = tr => { const t = trades.filter(x => x.track === tr); return { n: t.length, sumR: +t.reduce((a, x) => a + x.pnlR, 0).toFixed(3) }; };
  B.ledger = { asOf: status.lastRun.at, summary: { trades: trades.length, forward: { rules: sum("rules"), agent: sum("agent") } },
    recent: cl.slice(0, 60).map(t => ({ id: t.id, track: t.track, system: t.system, setup: t.setup, sym: t.sym, dir: t.dir, entryDate: t.entryDate, exitDate: t.exitDate, entry: t.entry, exitAvg: t.exitAvg, r: t.r, reason: t.exitReason })) };
  return B;
}

function creds() {
  const env = fs.existsSync(ENV_PATH) ? parseEnvLocal(ENV_PATH) : {};
  let key = env.PAPERDESK_WRITE_KEY || null;
  if (!key && fs.existsSync(APP_ENV)) key = parseEnvLocal(APP_ENV).VITE_WRITE_KEY || null;
  return { key, id: env.CF_ACCESS_CLIENT_ID, secret: env.CF_ACCESS_CLIENT_SECRET };
}

async function publish(out) {
  const { cfg } = out, B = blobs(out);
  fs.writeFileSync(path.join(__dirname, "..", ".data", "last-publish.json"), JSON.stringify(B));
  const c = creds();
  if (!c.key) return "skipped — no write key on this laptop (add PAPERDESK_WRITE_KEY to web/.env.local, same value as the Pages WRITE_KEY); blobs saved to .data/last-publish.json";
  if (!c.id || !c.secret) return "skipped — no Cloudflare Access service token in web/.env.local";
  require("../../journal/http.js");
  const r = await fetch(cfg.publish.base + cfg.publish.route, { method: "POST", headers: { "content-type": "application/json", "x-write-key": c.key, "CF-Access-Client-Id": c.id, "CF-Access-Client-Secret": c.secret }, body: JSON.stringify({ blobs: B }) });
  const t = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`);
  return `ok (${Object.keys(B).length} KV writes) ${t.slice(0, 120)}`;
}
module.exports = { publish, blobs };
