// Vault pages for the Paper Desk (folder from config.vault.folder, top level of MyVault).
// Vault path ONLY via process.env.VAULT || scripts/vault-path.js. Never writes G:/My Drive/MyVault.
// Pages: Home, Today's Plan, Open Positions, Ledger, Edge Board, Setup Library/<setup>, Systems/<system>, Plans/<date>.
// "Morning To-Do" and "Weekly Review" are written by their own steps (handoff / weekly.js), never here.
const fs = require("fs"), path = require("path");
const VAULT = process.env.VAULT || require("../../vault-path");
if (/My Drive/i.test(VAULT)) throw new Error("refusing to write into the Google Drive folder: " + VAULT);
const K = require("../../modelbook/chart.js");
const M = require("./market.js");
const { openRiskR } = require("./replay.js");
const fin = x => typeof x === "number" && isFinite(x);
const f2 = x => fin(x) ? (+x).toFixed(2) : "—";
const pct = x => fin(x) ? (x * 100).toFixed(0) + "%" : "—";
const esc = s => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function W(rel, txt) { const f = path.join(VAULT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); if (fs.existsSync(f) && fs.readFileSync(f, "utf8") === txt) return; fs.writeFileSync(f, txt); }
const fm = (tags, extra = {}) => `---\ntags: [${tags.join(", ")}]\n${Object.entries(extra).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}${Object.keys(extra).length ? "\n" : ""}---\n\n`;

// ---- per-trade daily chart, DAS daily theme (DASH): candles, 9/21/50 EMA, entry ▲ / exit ▼, stop ----
function tradeChart(P, p) {
  const t = P.T.get(p.sym); if (!t) return null;
  const I = M.ind(P, p.sym);
  const ei = P.idx.get(p.entryDate); if (ei == null) return null;
  const xi = p.exitDate && P.idx.has(p.exitDate) ? P.idx.get(p.exitDate) : P.D - 1;
  const a = Math.max(0, ei - 45), b = Math.min(P.D - 1, xi + 8);
  const bars = []; for (let j = a; j <= b; j++) if (fin(t.c[j])) bars.push({ min: j, o: t.o[j], h: t.h[j], l: t.l[j], c: t.c[j], v: t.v[j] });
  if (bars.length < 5) return null;
  const Wd = 900, H = 420, x0 = 50, x1 = Wd - 70, top = 60, bot = 330, vt = 340, vb = 400;
  let lo = Math.min(...bars.map(q => q.l), p.initStop), hi = Math.max(...bars.map(q => q.h)); const pad = (hi - lo) * 0.05; lo -= pad; hi += pad;
  const X = j => x0 + (j - a + 0.5) * (x1 - x0) / (b - a + 1), Y = v => top + (hi - v) / (hi - lo) * (bot - top), cw = Math.max(2, (x1 - x0) / (b - a + 1) * 0.65);
  const th = K.DASH;
  let body = K.yAxis(lo, hi, Y, x0, x1) + K.candles(bars, X, Y, cw, th) + K.vol(bars, X, cw, vt, vb, th);
  [["ema9", th.ma[0]], ["ema21", th.ma[1]], ["ema50", th.ma[2]]].forEach(([k, c]) => { body += K.line(bars.map(q => [X(q.min), I[k][q.min]]), c, 1.3); });
  body += `<line x1="${X(ei)}" y1="${Y(p.initStop)}" x2="${X(xi)}" y2="${Y(p.initStop)}" stroke="${K.C.stop}" stroke-dasharray="4 3"/>`;
  for (const f of p.fills || []) { const j = P.idx.get(f.date); if (j == null) continue; const buy = f.side === "buy"; body += K.tri(X(j), Y(f.px) + (buy ? 6 : -6), buy, buy ? K.C.buy : K.C.sell, 6); }
  body += K.legend([[th.ma[0], "9 EMA"], [th.ma[1], "21 EMA"], [th.ma[2], "50 EMA"], [K.C.stop, "initial stop", 1.5, "4 3"]], x0, H - 6 > 410 ? 412 : 412);
  const res = p.status === "closed" ? `${p.r >= 0 ? "+" : ""}${p.r}R (${p.exitReason})` : `open, last close ${p.lastCloseR ?? "—"}R`;
  return K.frame(Wd, H, body, `${p.sym} · ${p.setup} · ${p.track}`, `${p.entryDate} entry ${f2(p.entry)} · stop ${f2(p.initStop)} · ${res} · daily, DAS theme`);
}

function ordersTable(orders) {
  if (!orders || !orders.length) return "_No orders._\n";
  let s = "| Sym | Dir | System | Setup | Grade | Size R | Trigger | Stop | Exits | Thesis |\n|---|---|---|---|---|---|---|---|---|---|\n";
  for (const o of orders) s += `| ${o.sym} | ${o.dir} | ${o.source} | ${o.setup}@${o.setupVersion} | ${o.grade} | ${o.sizeR} | ${esc(o.trigger.text)} | ${esc(o.stop.text)} | ${esc(o.exits.text)} | ${esc(o.thesis)}${o.epVerdict ? ` **EP verdict:** ${esc(o.epVerdict.story)} — ${esc(o.epVerdict.notes)}` : ""} |\n`;
  return s;
}

function write(out) {
  const { cfg, lib, st, trades, bt, status, plan, P } = out;
  const F = cfg.vault.folder, A = path.join("_assets", "paperdesk", "charts");
  const sysName = id => (lib.systems.get(id) || {}).name || id;
  // charts for open + recent closed positions
  const chartFor = p => { try { const svg = tradeChart(P, p); if (!svg) return null; const n = `${p.entryDate} ${p.sym} ${p.track} ${p.setup}.svg`; W(path.join(A, n), svg); return n; } catch (e) { return null; } };

  // Today's Plan
  let tp = fm(["paperdesk", "paperdesk/plan"]) + `# Today's Plan\n\n`;
  if (!plan) tp += "_No plan for today (weekend, holiday, data missing, or the run started after 09:30)._\n";
  else {
    tp += `**${plan.date}** · data through ${plan.dataThrough} · ${plan.dry ? "**DRY RUN — not locked**" : plan.late ? "**LOCKED LATE — excluded from the forward record**" : "locked"} ${plan.lockedAt || ""}\n\n`;
    tp += `> [!info] Market\n> **${plan.regime.label}** — ${plan.regime.tags.join(" · ")}\n> QQQ ${f2(plan.regime.qqq && plan.regime.qqq.close)} · 9 EMA ${f2(plan.regime.qqq && plan.regime.qqq.ema9)} · 21 EMA ${f2(plan.regime.qqq && plan.regime.qqq.ema21)} · 50-day ${f2(plan.regime.qqq && plan.regime.qqq.sma50)}\n\n`;
    tp += `## System gates today\n\n| System | Setup | Gate |\n|---|---|---|\n` + Object.entries(plan.gates).map(([id, g]) => { const s = lib.setups.get(id); return `| ${s ? sysName(s.system) : ""} | ${id} | ${g.open ? (g.aPlusOnly ? "open (A+ only)" : "open") : "**closed**"} — ${esc(g.reason)} |`; }).join("\n") + "\n\n";
    tp += `## Rules-only twin (${plan.rules.orders.length} orders)\n\n` + ordersTable(plan.rules.orders) + "\n";
    tp += `## Agent (${plan.agent.status}${plan.agent.reason ? ` — ${esc(plan.agent.reason)}` : ""})\n\n` + (plan.agent.status === "ok" ? (plan.agent.regimeNote ? `> ${esc(plan.agent.regimeNote)}\n\n` : "") + ordersTable(plan.agent.orders) : "_The agent plan is missing; only the rules-only twin trades today._\n") + "\n";
    if (plan.rules.skipped && plan.rules.skipped.length) tp += `<details><summary>${plan.rules.skipped.length} rules-only candidates over the limits</summary>\n\n${plan.rules.skipped.map(x => `- ${x[0]}: ${x[1]}`).join("\n")}\n\n</details>\n\n`;
    tp += `Integrity: plans are written once before 09:25 ET and hashed into \`scripts/paperdesk/.data/locks.log\` (SHA-256 ${plan.sha256 || "—"}). The engine replays them the next morning on real bars.\n`;
  }
  W(`${F}/Today's Plan.md`, tp);
  if (plan && !plan.dry) W(`${F}/Plans/${plan.date}.md`, tp.replace("# Today's Plan", `# Plan ${plan.date}`));

  // Open Positions
  const open = st.positions.filter(p => p.shares > 0);
  let op = fm(["paperdesk", "paperdesk/positions"]) + `# Open Positions\n\n`;
  for (const tr of ["rules", "agent"]) {
    const ps = open.filter(p => p.track === tr), tot = ps.reduce((a, p) => a + openRiskR(p, cfg.R), 0);
    op += `## ${tr === "rules" ? "Rules-only twin" : "Agent"} — ${ps.length} open, open risk ${tot.toFixed(2)}R of ${cfg.portfolio.maxTotalOpenR}R\n\n`;
    if (!ps.length) { op += "_None._\n\n"; continue; }
    const bySys = {}, byCl = {}; for (const p of ps) { bySys[p.system] = (bySys[p.system] || 0) + openRiskR(p, cfg.R); if (p.cluster) byCl[p.cluster] = (byCl[p.cluster] || 0) + openRiskR(p, cfg.R); }
    op += `Per system: ${Object.entries(bySys).map(([k, v]) => `${k} ${v.toFixed(2)}R`).join(" · ")}. Clusters: ${Object.entries(byCl).map(([k, v]) => `${k} ${v.toFixed(2)}R${v >= cfg.portfolio.maxClusterR ? " ⚠" : ""}`).join(" · ") || "—"}\n\n`;
    op += "| Sym | System | Setup | Entry date | Entry | Stop | Shares | Last close R | Open risk R | Next exit |\n|---|---|---|---|---|---|---|---|---|---|\n";
    for (const p of ps) op += `| ${p.sym} | ${p.source} | ${p.setup} | ${p.entryDate} | ${f2(p.entry)} | ${f2(p.stop)} | ${p.shares}/${p.initShares} | ${p.lastCloseR ?? "—"} | ${openRiskR(p, cfg.R).toFixed(2)} | ${esc(p.pendingExit || (p.scheme && p.scheme.name) || "")} |\n`;
    op += "\n"; for (const p of ps) { const c = chartFor(p); if (c) op += `![[${c}]]\n`; } op += "\n";
  }
  W(`${F}/Open Positions.md`, op);

  // Ledger
  const cl = [...trades].sort((a, b) => a.exitDate < b.exitDate ? 1 : -1);
  let lg = fm(["paperdesk", "paperdesk/ledger"]) + `# Ledger (forward record)\n\n`;
  for (const tr of ["rules", "agent"]) { const t = cl.filter(x => x.track === tr); lg += `- **${tr}**: ${t.length} closed trades, ${t.reduce((a, x) => a + x.pnlR, 0).toFixed(2)}R account\n`; }
  lg += `\n| Exit | Sym | Track | System | Setup | Entry | Exit avg | R | Account R | Why out | Flags |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const t of cl.slice(0, 300)) lg += `| ${t.exitDate} | ${t.sym} | ${t.track} | ${t.source} | ${t.setup} | ${t.entryDate} ${f2(t.entry)} | ${f2(t.exitAvg)} | ${t.r} | ${t.pnlR} | ${esc(t.exitReason)} | ${(t.flags || []).join(", ")} |\n`;
  if (!cl.length) lg += "| — | | | | | | | | | | |\n";
  lg += "\n" + cl.slice(0, 20).map(chartFor).filter(Boolean).map(c => `![[${c}]]`).join("\n") + "\n";
  W(`${F}/Ledger.md`, lg);

  // Edge Board
  const EDGE = require("./edge.js");
  const fb = EDGE.board(trades, cfg), bb = bt.trades && bt.trades.length ? EDGE.board(bt.trades, cfg) : null;
  const tbl = rows => rows.length ? "| System | Setup | Regime | Track | n | Win | Avg R | PF | Sum R | Status |\n|---|---|---|---|---|---|---|---|---|---|\n" + rows.map(b => `| ${b.system} | ${b.setup} | ${b.regime} | ${b.track} | ${b.n} | ${pct(b.winRate)} | ${b.avgR} | ${b.profitFactor === 9999 ? "∞" : b.profitFactor} | ${b.sumR} | ${b.status} |`).join("\n") + "\n" : "_No closed trades yet._\n";
  let eb = fm(["paperdesk", "paperdesk/edge"]) + `# Edge Board\n\nStatuses need **n ≥ ${cfg.edge.minN}** (EP lane n ≥ ${cfg.edge.epMinN}, never auto-paused); below that a bucket is *collecting* at normal size. Statuses are set by the Saturday job and drive paper sizing (push ×${cfg.edge.sizing.push}, size-down ×${cfg.edge.sizing["size-down"]}, pause ×0).\n\n`;
  eb += `## Forward record (plans locked before the open, from the first forward day)\n\n### By system — agent vs rules-only\n\n${tbl(fb.bySystem)}\n### By setup\n\n${tbl(fb.bySetup)}\n### By setup × regime\n\n${tbl(fb.bySetupRegime)}\n`;
  eb += `\n## BACKTEST — not the forward record\n\n> [!warning] Rules-only historical backtest on cached daily bars (${bt.from || "—"} → ${bt.to || "—"}). Intraday triggers use their daily approximation (tagged approx) and same-bar ambiguity resolves to the stop. It only exists so the board isn't empty on day one; it never mixes into the forward record or sizing.\n\n`;
  if (bb) { eb += `### By system\n\n${tbl(bb.bySystem)}\n### By setup\n\n${tbl(bb.bySetup)}\n### By setup × regime\n\n${tbl(bb.bySetupRegime)}\n`; if (bt.chart) eb += `\n![[${bt.chart}]]\n`; }
  else eb += "_Backtest not run yet._\n";
  W(`${F}/Edge Board.md`, eb);

  // Systems + Setup Library
  for (const [id, s] of lib.systems) {
    let t = fm(["paperdesk", "paperdesk/system"], { source: s.source }) + `# ${s.name}\n\nSource tag \`${s.source}\`${s.vault ? ` · study: [[${s.vault.split("/").pop()}]]` : ""}\n\n${s.description}\n\n`;
    t += `**Market gate:** ${JSON.stringify(s.regimeGate)} · **Sizing:** ${s.sizing && s.sizing.note ? s.sizing.note : `${(s.sizing && s.sizing.baseR) || 1}R per A+ trade, ½ for B`}${s.sizing && s.sizing.riskBudgetR ? ` · risk budget ${s.sizing.riskBudgetR}R` : ""}\n\n`;
    if (s.universe) t += `**Universe overlay:** ${JSON.stringify(s.universe)}\n\n`;
    t += `## Setups\n\n${s.setups.map(x => `- [[${x}]]`).join("\n")}\n\n`;
    if (s.gaps && s.gaps.length) t += `## Gaps in the source, and how they were filled\n\n${s.gaps.map(g => `- ${g}`).join("\n")}\n`;
    W(`${F}/Systems/${s.name.replace(/[\\/:*?"<>|]/g, "-")}.md`, t);
  }
  for (const [id, s] of lib.setups) {
    const ex = lib.exits.get(s.exit);
    let t = fm(["paperdesk", "paperdesk/setup"], { setup: id, system: s.system, source: s.source, version: s.version }) + `# ${id}\n\n**${s.name}** · source \`${s.source}\` · version ${s.version} · ${s.direction}${s.lane ? ` · lane ${s.lane}` : ""} · scenario ${s.scenario.join(", ")}\n\n`;
    if (s.notes) t += `${s.notes}\n\n`;
    t += `| Part | Rule |\n|---|---|\n| Scan | \`${s.scan.type}\` ${esc(JSON.stringify(s.scan.params))} |\n| Entry | ${esc(JSON.stringify(s.entry))} |\n| Stop | ${esc(JSON.stringify(s.stop))} |\n| Exit | ${esc(ex ? ex.name : s.exit)} |\n\n`;
    if (ex && ex.gaps) t += ex.gaps.map(g => `- ${g}`).join("\n") + "\n\n";
    t += `Edit: \`scripts/paperdesk/setups/${id}.json\`. Fork = copy with a new id, source \`own:...\`, version 1; both run side by side and the record decides.\n`;
    W(`${F}/Setup Library/${id}.md`, t);
  }

  // Home
  const last = status.lastRun || {};
  let h = fm(["paperdesk", "paperdesk/home"]) + `# ${cfg.name}\n\nForward-tests setup systems on paper, every trading day, unattended: **code** scans, sizes and replays; an **agent** only selects and grades; a **rules-only twin** trades the same candidates mechanically so the record shows whether the agent adds edge. No live orders.\n\n`;
  h += `> [!${last.status === "ok" ? "success" : last.status === "failed" ? "failure" : "warning"}] Last run: **${last.status || "—"}** · ${last.at ? new Date(last.at).toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET" : "—"} · for ${last.forDate || "—"}\n> Agent: ${status.agent ? status.agent.status + (status.agent.reason ? " — " + esc(status.agent.reason) : "") : "—"}\n\n`;
  h += `## Pages\n\n- [[Today's Plan]] · [[Open Positions]] · [[Ledger]] · [[Edge Board]] · [[Weekly Review]] · [[Morning To-Do]]\n- Plans archive: \`${F}/Plans/\`\n\n`;
  h += `## Systems (from day zero, 2026-11-09)\n\n| System | Source | Setups |\n|---|---|---|\n${[...lib.systems.values()].map(s => `| [[${s.name.replace(/[\\/:*?"<>|]/g, "-")}]] | \`${s.source}\` | ${s.setups.map(x => `[[${x}]]`).join(", ")} |`).join("\n")}\n\n`;
  h += `Studies behind ML and JLaw: [[ML — System Rules]] · [[JLaw — System Rules]] · [[JLaw — Integration with My Swing & ORB]].\n\n`;
  h += `## Rules of the desk\n\n- Plans lock before 09:25 ET (SHA-256, append-only log); late plans are excluded; nothing is written after the open.\n- The agent never runs on past dates. The backtest is labeled backtest everywhere and never mixes in.\n- 1R = $${cfg.R}. Limits: total ${cfg.portfolio.maxTotalOpenR}R, per system ${cfg.portfolio.perSystemOpenR}R (JLaw ${(lib.systems.get("jlaw") || { sizing: {} }).sizing.riskBudgetR || cfg.portfolio.perSystemOpenR}R), cluster ${cfg.portfolio.maxClusterR}R, ${cfg.portfolio.maxPositions} positions — per track.\n- New setup ideas wait in \`scripts/paperdesk/proposals.json\`; only the trader moves them into the library.\n`;
  W(`${F}/${cfg.name} — Home.md`, h);
}
module.exports = { write, tradeChart, VAULT };
