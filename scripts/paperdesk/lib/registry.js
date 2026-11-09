// Registry card in scripts/modelbook/research/studies.json (same pattern as scripts/aiman/run.js). Data only.
const fs = require("fs"), path = require("path");
const F = path.join(__dirname, "..", "..", "modelbook", "research", "studies.json");
function card(out) {
  let S; try { S = JSON.parse(fs.readFileSync(F, "utf8")); } catch (e) { return; } if (!S || !Array.isArray(S.studies)) return;
  const { cfg, trades, bt, D } = out;
  const n = tr => trades.filter(t => t.track === tr).length, sr = tr => trades.filter(t => t.track === tr).reduce((a, t) => a + t.pnlR, 0).toFixed(2);
  const c = {
    id: "S-2026-11-09-paperdesk", title: `${cfg.name} - forward paper test of setup systems (rules-only vs agent), incl. Martin Luk + JLaw from day zero`,
    asked: "2026-11-08",
    hypotheses: ["Which setups (textbook, Minervini, Qullamaggie, own swing book, Martin Luk, JLaw) show a forward edge on paper, by scenario and regime?", "Does the agent's selection/grading add edge over the rules-only twin trading the same candidates?"],
    method: "Plans locked pre-market (SHA-256 append-only log), replayed next morning on real bars with honest fills (gap-through stops at the open, same-bar ambiguity -> stop, liquidity slippage, 1% ADV cap, portfolio caps at fill). Edge buckets need n >= 20 before any status change. Backtest (daily bars) kept separate.",
    verdict: `forward from 2026-11-09: rules-only ${n("rules")} closed (${sr("rules")}R), agent ${n("agent")} closed (${sr("agent")}R); backtest ${(bt.trades || []).length} trades ${bt.from || ""} → ${bt.to || ""} (not forward)`,
    status: "running daily - paper only, no live orders, not a rule",
    run: D, data_from: "2026-11-09", data_through: out.Y || D,
    pages: [`${cfg.name} — Home`, "Edge Board", "Today's Plan"],
    results: "scripts/paperdesk/.data/state.json", code: "scripts/paperdesk/", rerun: "scripts/paperdesk/run-daily.cmd (weekly: run-weekly.cmd; backtest: node --max-old-space-size=6000 scripts/paperdesk/backtest.js)",
    next: "Review after 20 forward trades per setup bucket; trader approves proposals in scripts/paperdesk/proposals.json.",
  };
  const i = S.studies.findIndex(x => x.id === c.id); if (i >= 0) S.studies[i] = c; else S.studies.push(c);
  const t = F + ".tmp"; fs.writeFileSync(t, JSON.stringify(S, null, 2)); fs.renameSync(t, F);
}
module.exports = { card };
