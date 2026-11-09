// Edge monitor: groups closed trades by system × setup × scenario × regime × track and gives each bucket a status.
// push / normal / size-down / pause need n >= minN; below that a bucket is "collecting" (normal size).
// The EP lane uses epMinN over its long window and can never be auto-paused (worst = size-down).
const { mean, winRate, profitFactor } = require("../../backtest/lib/stats.js");
const r3 = x => x == null || !isFinite(x) ? null : +x.toFixed(3);

function status(rs, cfg, isEp) {
  const E = cfg.edge, n = rs.length, minN = isEp ? E.epMinN : E.minN;
  if (n < minN) return "collecting";
  const ex = mean(rs);
  if (ex >= E.pushExpectancyR) return "push";
  if (ex <= E.pauseExpectancyR) return isEp ? "size-down" : "pause";
  if (ex < E.sizeDownExpectancyR) return "size-down";
  return "normal";
}
function buckets(trades, cfg, keyFn) {
  const m = new Map();
  for (const t of trades) { const k = keyFn(t); if (!m.has(k.key)) m.set(k.key, { ...k, rs: [] }); m.get(k.key).rs.push(t.r); }
  return [...m.values()].map(b => {
    const isEp = (b.scenario || "").includes("ep") || /episodic/.test(b.setup || "");
    const pf = profitFactor(b.rs);
    return { key: b.key, system: b.system, setup: b.setup, scenario: b.scenario, regime: b.regime, track: b.track, n: b.rs.length,
      winRate: r3(winRate(b.rs)), avgR: r3(mean(b.rs)), expectancy: r3(mean(b.rs)), profitFactor: pf === Infinity ? 9999 : r3(pf), sumR: r3(b.rs.reduce((a, x) => a + x, 0)), status: status(b.rs, cfg, isEp) };
  }).sort((a, b) => a.system < b.system ? -1 : a.system > b.system ? 1 : b.n - a.n);
}
// three views: by setup (drives sizing), by setup × regime, by system
function board(trades, cfg) {
  return {
    bySetup: buckets(trades, cfg, t => ({ key: `${t.track}|${t.setup}`, system: t.system, setup: t.setup, scenario: (t.scenario || []).join(","), regime: "all", track: t.track })),
    bySetupRegime: buckets(trades, cfg, t => ({ key: `${t.track}|${t.setup}|${t.regime}`, system: t.system, setup: t.setup, scenario: (t.scenario || []).join(","), regime: t.regime || "?", track: t.track })),
    bySystem: buckets(trades, cfg, t => ({ key: `${t.track}|${t.system}`, system: t.system, setup: "all", scenario: "all", regime: "all", track: t.track })),
  };
}
function equity(trades) {     // cumulative account R ($ / R) per system, by exit date
  const out = {}; const s = [...trades].sort((a, b) => a.exitDate < b.exitDate ? -1 : 1);
  for (const t of s) { const k = `${t.system}`; const a = out[k] || (out[k] = []); const last = a.length ? a[a.length - 1].cumR : 0; a.push({ date: t.exitDate, cumR: +(last + t.pnlR).toFixed(3) }); }
  return out;
}
module.exports = { board, equity, status };
