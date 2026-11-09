// Saturday job (09:00 ET, run-weekly.cmd): edge monitor over the FORWARD record -> bucket statuses that drive
// next week's paper sizing (.data/edge-status.json), the vault "Weekly Review" page, and a KV publish.
// Backtest trades never feed the statuses.
const path = require("path"), fs = require("fs");
const U = require("./lib/util.js"), L = require("./lib/library.js"), EDGE = require("./lib/edge.js");
const cfg = U.CONFIG(), lib = L.load();
const dry = process.argv.includes("--dry");
const st = U.readJ(path.join(U.DATA, "state.json"), { positions: [], closed: [] });
const trades = st.closed.filter(t => t.record !== "backtest").map(t => ({ ...t, pnlR: +(t.pnl / cfg.R).toFixed(3) }));
const B = EDGE.board(trades, cfg);
const prev = U.readJ(path.join(U.DATA, "edge-status.json"), { statuses: {} }).statuses;
const statuses = {}, changes = [];
for (const b of B.bySetup) { statuses[b.key] = b.status; if ((prev[b.key] || "collecting") !== b.status) changes.push(`${b.key}: ${prev[b.key] || "collecting"} → ${b.status} (n ${b.n}, avg ${b.avgR}R)`); }
const today = U.etParts().date;
if (!dry) U.writeJ(path.join(U.DATA, "edge-status.json"), { asOf: today, statuses, changes });

// Weekly Review page
const VAULT = process.env.VAULT || require("../vault-path");
const wkFrom = U.isoAdd(today, -7), wk = trades.filter(t => t.exitDate > wkFrom);
const sum = (a, tr) => a.filter(t => t.track === tr).reduce((x, t) => x + t.pnlR, 0).toFixed(2);
let s = `---\ntags: [paperdesk, paperdesk/weekly]\n---\n\n# Weekly Review\n\nWeek ending **${today}** · forward record only.\n\n`;
s += `## This week\n\n- Closed trades: ${wk.length} · rules-only ${sum(wk, "rules")}R · agent ${sum(wk, "agent")}R (account R)\n- Open: ${st.positions.filter(p => p.shares > 0).length} positions\n\n`;
s += `## Status changes (drive next week's paper sizing)\n\n${changes.length ? changes.map(c => `- ${c}`).join("\n") : "- none (most buckets are still collecting: n < " + cfg.edge.minN + ")"}\n\n`;
s += `## Agent vs rules-only, by system (all forward trades)\n\n| System | Track | n | Win | Avg R | Sum R | Status |\n|---|---|---|---|---|---|---|\n${B.bySystem.map(b => `| ${b.system} | ${b.track} | ${b.n} | ${b.winRate == null ? "—" : (b.winRate * 100).toFixed(0) + "%"} | ${b.avgR} | ${b.sumR} | ${b.status} |`).join("\n") || "| — | | | | | | |"}\n\n`;
const pj = U.readJ(path.join(U.ROOT, "proposals.json"), { proposals: [] });
s += `## Proposals waiting for the trader\n\n${pj.proposals.filter(p => !p.status || /waiting/.test(p.status) || p.from === "build").map(p => `- **${p.id}** (${p.system || p.from}): ${p.idea}${p.blocker ? ` — *${p.blocker}*` : ""}`).join("\n") || "- none"}\n\nMethod: statuses need n ≥ ${cfg.edge.minN} (EP lane ≥ ${cfg.edge.epMinN}, never auto-paused). One bad week changes nothing below the minimum sample — that is deliberate (JLaw's MRA: diagnosis before change).\n`;
const f = path.join(VAULT, cfg.vault.folder, "Weekly Review.md"); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s);
console.log(`weekly: ${B.bySetup.length} buckets, ${changes.length} status changes${dry ? " (dry: statuses not saved)" : ""}`);
// publish the refreshed edge board (reuses the daily blobs builder with the last plan)
(async () => {
  if (dry) return;
  try {
    const status = U.readJ(path.join(U.DATA, "last-run.json"), { lastRun: {} }); status.lastRun = { ...(status.lastRun || {}), kind: "weekly", at: new Date().toISOString(), status: "ok", messages: [`weekly edge monitor: ${changes.length} status changes`] };
    const lastPlan = fs.readdirSync(path.join(U.DATA, "plans")).filter(x => x.endsWith(".json")).sort().pop();
    const plan = lastPlan ? U.readJ(path.join(U.DATA, "plans", lastPlan), null) : null;
    const bt = U.readJ(path.join(U.DATA, "backtest", "trades.json"), { trades: [] });
    console.log("publish:", await require("./lib/publish.js").publish({ cfg, lib, st, trades, bt, status, plan }));
  } catch (e) { console.log("publish FAILED:", e.message); }
})();
