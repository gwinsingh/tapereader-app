// Paper Desk daily run (scheduled weekdays 06:45 ET via run-daily.cmd).
//   node --max-old-space-size=4000 scripts/paperdesk/run.js [--dry] [--date=YYYY-MM-DD] [--no-agent] [--no-fetch] [--no-publish] [--no-vault]
// Steps: grouped daily through yesterday -> replay every un-replayed session against its LOCKED plan (1-min bars
// where the daily bar can't settle the order of events) -> scans -> rules-only plan -> agent plan -> validate ->
// lock (deadline 09:25 ET; nothing is written after 09:30) -> KV publish -> vault pages.
// Integrity: the agent is never run for a past date; --date (a past or future date) forces --dry.
const fs = require("fs"), path = require("path");
const U = require("./lib/util.js"), G = require("./lib/grouped.js"), P0 = require("./lib/panel.js"), M = require("./lib/market.js");
const L = require("./lib/library.js"), PL = require("./lib/planner.js"), { selectOrders, validateOrder } = require("./lib/plan.js");
const LK = require("./lib/lock.js"), SE = require("./lib/session.js"), { replaySession, openRiskR } = require("./lib/replay.js");
const E = require("./lib/earnings.js"), EDGE = require("./lib/edge.js");
const { runAgent } = require("./agent/run-agent.js");
const args = Object.fromEntries(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const cfg = U.CONFIG(), STATE = path.join(U.DATA, "state.json"), RUN = path.join(U.DATA, "last-run.json");
const msgs = []; const say = (...a) => { const s = a.join(" "); msgs.push(s); U.log(s); };

async function main() {
  const now = U.etParts(), today = now.date;
  const D = args.date || today;
  const dry = !!args.dry || D !== today;
  if (D !== today) say(`--date ${D} ≠ today ${today}: dry run, no agent, nothing enters the forward record`);
  if (!U.isSession(D)) { say(`${D} is not a trading session (weekend / NYSE holiday): replay + publish only`); }
  const deadline = U.hm2min(cfg.lockDeadlineET);
  const tooLate = !dry && now.min >= 570, late = !dry && now.min >= deadline;
  const Y = U.isSession(D) ? U.prevSession(D) : (() => { let x = D; while (!U.isSession(x) || x >= D) x = U.isoAdd(x, -1); return x; })();

  // 1) daily bars
  if (!args["no-fetch"]) { const m = await G.sync(U.isoAdd(Y, -45), Y, 30); m.filter(x => /FAIL|not published/.test(x)).forEach(x => say(x)); }
  const lib = L.load(); lib.errors.forEach(e => say("library:", e));
  const P = P0.loadPanel({ lastN: cfg.history.planLookbackSessions, keep: M.KEEP_FUNDS, log: s => say(s) });
  const iY = P.idx.get(Y);
  if (iY == null) say(`no daily bars for ${Y} yet — planning from ${P.dates[P.D - 1]} would be stale; plan skipped`);

  // 2) replay every un-replayed session through Y
  const st = U.readJ(STATE, { lastReplayed: null, positions: [], closed: [] });
  const planDates = LK.entries().filter(e => !e.dry).map(e => e.date).sort();
  const firstDay = st.lastReplayed ? U.nextSession(st.lastReplayed) : planDates[0];
  if (firstDay) for (const s of U.sessionsBetween(firstDay, Y)) {
    const j = P.idx.get(s); if (j == null) { say(`replay ${s}: no daily bars cached — stopping catch-up here (resumes next run)`); break; }
    const V = LK.verified(s);
    let orders = [];
    if (V.plan && !V.error) {
      orders = [...(V.plan.rules.orders || []), ...((V.plan.agent && V.plan.agent.orders) || [])];
      for (const a of (V.plan.agent && V.plan.agent.adjustments) || []) { const p = st.positions.find(x => x.id === a.positionId && x.shares > 0); if (p && (p.dir === "long" ? a.newStop > p.stop : a.newStop < p.stop)) { p.stop = a.newStop; say(`replay ${s}: agent pre-market stop adjustment ${p.sym} → ${a.newStop}`); } }
    } else if (planDates.includes(s) || V.plan) say(`replay ${s}: plan not used — ${V.error}`);
    const bySym = new Map(); orders.forEach((o, k) => { o.rank = k; if (!bySym.has(o.sym)) bySym.set(o.sym, []); bySym.get(o.sym).push(o); });   // rank = plan order (fill-time caps)
    const need = SE.needs1m(P, j, bySym, st.positions);
    const bars1m = new Map(); let fails = 0;
    if (!args["no-fetch"]) for (const sym of need) { try { bars1m.set(sym, await SE.fetch1m(s, sym)); } catch (e) { fails++; say(`1-min ${s} ${sym}: ${e.message.slice(0, 120)} → daily fallback`); } }
    else for (const sym of need) { const c = SE.cached1m(s, sym); if (c) bars1m.set(sym, c); }
    const syms = new Set([...bySym.keys(), ...st.positions.filter(p => p.shares > 0).map(p => p.sym)]);
    const sess = SE.buildSession(P, j, syms, bars1m, { fetch: !args["no-fetch"] });
    const ev = replaySession(sess, bySym, st, cfg, lib.systems);
    if (!dry) U.writeJ(path.join(U.DATA, "events", s + ".json"), ev);
    const n = k => ev.filter(e => e.type === k).length;
    say(`replay ${s}: ${orders.length} orders, ${need.size} 1-min fetches${fails ? ` (${fails} failed)` : ""}; ${n("entry")} entries, ${n("add")} adds, ${n("trim")} trims, ${n("stop") + n("exit")} exits, ${n("skip")} skipped at fill`);
    st.lastReplayed = s;
    if (!dry) U.writeJ(STATE, st);
  }
  for (const t of st.closed) t.pnlR = +(t.pnl / cfg.R).toFixed(3);

  // 3) plan for D
  let planInfo = null;
  const already = !dry && LK.isLocked(D);
  if (already) { say(`plan for ${D} is already locked — not rebuilt (no second agent run)`); planInfo = (() => { const V = LK.verified(D); const e = LK.entries().find(x => x.date === D && !x.dry) || {}; return V.plan ? { ...e, plan: V.plan } : null; })(); }
  if (U.isSession(D) && iY != null && !tooLate && !already) {
    // fresh earnings calendar for yesterday, today and the next two sessions (red-team #4)
    const n1 = U.nextSession(D), n2 = U.nextSession(n1);
    if (!args["no-fetch"]) for (const d of [Y, D, n1, n2]) E.byDate(d, { fetch: true, fresh: true });
    const C = PL.candidates({ P, i: iY, D, lib, cfg });
    const edgeStatus = U.readJ(path.join(U.DATA, "edge-status.json"), { statuses: {} }).statuses;
    const sizeMult = (track, setupId) => cfg.edge.sizing[edgeStatus[`${track}|${setupId}`] || "collecting"] ?? 1;
    // non-EP entries are vetoed when a report falls before D's open (gap risk on the entry) or before the next session's open
    const nextRepFor = sym => {
      const r0 = E.reactsOn(sym, D, Y, { fetch: !args["no-fetch"] }); if (r0) return { date: r0.date, time: r0.time };
      for (const d of [D, n1]) { const m = E.byDate(d, { fetch: !args["no-fetch"] }); if (m.has(sym)) return { date: d, time: m.get(sym) }; }
      return null;
    };
    const book = tr => st.positions.filter(p => p.track === tr && p.shares > 0);
    const R = PL.rulesOrders({ C, D, lib, cfg, track: "rules", book: book("rules"), sizeMult, nextRepFor });
    R.orders.push(...PL.addOrders({ C, D, lib, cfg, track: "rules", book: book("rules") }));
    say(`plan ${D}: regime ${C.reg.label} (${C.reg.tags.join("; ")}); universe ${C.uni.core} core + ${C.uni.ep} EP-lane; rules-only ${R.orders.length} orders (${R.skipped.length} over limits, ${R.vetoed.length} vetoed)`);

    // agent track
    let agent = { status: "missing", reason: "not run", orders: [], skipped: [], adjustments: [], proposals: [] };
    const pool = PL.rulesOrders({ C, D, lib, cfg, track: "agent", book: [], sizeMult, nextRepFor, select: false }).orders;
    if (!dry && !args["no-agent"]) {
      const packet = {
        date: D, asOf: new Date().toISOString(), note: "All prices are from data through " + Y + ". Candidates are from the fixed setup library; pick from them only.",
        regime: C.reg, systems: [...lib.systems.values()].map(s => ({ id: s.id, name: s.name, source: s.source, gates: Object.fromEntries(s.setups.map(id => [id, C.gates[id]])), gaps: s.gaps || [] })),
        edge: edgeStatus, positions: book("agent").map(p => ({ id: p.id, sym: p.sym, dir: p.dir, setup: p.setup, entry: p.entry, stop: p.stop, lastClose: p.lastClose, lastCloseR: p.lastCloseR, entryDate: p.entryDate, nextReport: p.earnings })),
        candidates: pool.map(o => ({ cid: o.id.replace(`${D}-agent-`, ""), setup: o.setup, system: o.system, sym: o.sym, dir: o.dir, grade: o.grade, ep: o.scenario.includes("ep"), thesisDraft: o.thesis, trigger: o.trigger.text, triggerLevel: o.trigger.level ?? null,
          stopType: o.stop.type, stop: o.stop.price ?? null, stopText: o.stop.text, exits: o.exits.text, earnings: o.earnings, theme: o.theme, rs: o.facts.rs, report: o.facts.report })),
      };
      // the agent must finish 5 min before the lock deadline, so the rules-only twin is never lost to an overrun (red-team #2)
      const n0 = U.etParts(), deadlineMs = Date.now() + ((deadline - 5 - n0.min) * 60 - n0.sec) * 1000;
      const res = runAgent(packet, cfg, deadlineMs);
      agent = { status: res.status, reason: res.reason || null, promptVersion: res.promptVersion, meta: res.meta || null, log: res.log || [], orders: [], skipped: [], adjustments: [], proposals: [] };
      if (res.status === "ok") {
        const byCid = new Map(pool.map(o => [o.id.replace(`${D}-agent-`, ""), o]));
        const picks = [];
        for (const d of res.out.decisions.filter(x => x.take)) {
          const o = JSON.parse(JSON.stringify(byCid.get(d.cid)));
          o.grade = d.grade; o.sizeR = +((cfg.grades[d.grade] ?? 0.5) * sizeMult("agent", o.setup)).toFixed(3); o.thesis = d.thesis.slice(0, 300);
          if (d.stopPrice != null && o.stop.type === "price") { o.stop.price = d.stopPrice; o.stop.text = `${d.stopPrice} (agent tightened)`; o.invalidation.price = d.stopPrice; }
          if (d.epVerdict) o.epVerdict = d.epVerdict; o.agentReason = d.reason || null;
          if (validateOrder(o).length === 0 && o.sizeR > 0) picks.push(o);
        }
        const ep = picks.filter(o => o.scenario.includes("ep")), rest = picks.filter(o => !o.scenario.includes("ep"));
        const sel = selectOrders(rest, book("agent"), cfg, lib.systems);
        agent.orders = [...sel.orders, ...ep.slice(0, 8), ...PL.addOrders({ C, D, lib, cfg, track: "agent", book: book("agent") })]; agent.skipped = sel.skipped;   // adds: same mechanical rule as the twin
        agent.declined = res.out.decisions.filter(x => !x.take).map(x => [x.cid, x.reason || ""]);
        agent.adjustments = res.out.positionAdjustments || []; agent.proposals = res.out.proposals || []; agent.regimeNote = res.out.regimeNote || null;
        if (agent.proposals.length) { const pf = path.join(U.ROOT, "proposals.json"), pj = U.readJ(pf, { proposals: [] }); for (const x of agent.proposals) pj.proposals.push({ id: `P-AG-${D}-${pj.proposals.length + 1}`, from: `agent ${D}`, ...x, status: "waiting for the trader" }); U.writeJ(pf, pj); }
      }
      say(`agent: ${agent.status}${agent.reason ? " — " + agent.reason : ""}${agent.status === "ok" ? `; ${agent.orders.length} orders` : ""}`);
    } else agent.reason = dry ? "dry run" : "--no-agent";

    const plan = { name: cfg.name, version: cfg.version, date: D, dataThrough: Y, createdAt: new Date().toISOString(), late, dry, regime: C.reg, universe: C.uni,
      gates: C.gates, library: [...lib.setups.values()].map(s => `${s.id}@${s.version}`), rules: { orders: R.orders, skipped: R.skipped, vetoed: R.vetoed, invalid: R.invalid }, agent };
    const nowAgain = U.etParts();
    if (!dry && nowAgain.date === D && nowAgain.min >= 570) say("past 09:30 ET by the time the plan was ready: NOT written (a plan is never written after the open)");
    else {
      plan.late = !dry && nowAgain.min >= deadline;
      const lk = LK.lock(plan, { dry });
      say(`${dry ? "DRY plan written (not locked)" : plan.late ? "plan LOCKED LATE (excluded from the forward record)" : "plan locked"} ${lk.lockedAt} sha256 ${lk.sha256.slice(0, 16)}…`);
      planInfo = { ...lk, plan: lk.plan };
    }
  } else if (tooLate) say("started after 09:30 ET: no plan for today (replay + publish only)");

  // 4) outputs
  const trades = st.closed.filter(t => t.record !== "backtest");
  const bt = U.readJ(path.join(U.DATA, "backtest", "trades.json"), { trades: [], from: null, to: null });
  const status = { name: cfg.name, version: cfg.version, lastRun: { kind: "daily", at: new Date().toISOString(), status: dry ? "dry" : planInfo && planInfo.late ? "late" : "ok", forDate: D, messages: msgs.slice(-40) },
    lock: planInfo ? { at: planInfo.lockedAt, sha256: planInfo.sha256, late: planInfo.late } : null, agent: planInfo ? { status: planInfo.plan.agent.status, reason: planInfo.plan.agent.reason, promptVersion: cfg.agent.promptVersion } : null,
    locks: LK.entries().slice(-15) };            // lock-log tail kept off the laptop too (red-team #18)
  const shownPlan = planInfo ? { ...planInfo.plan, sha256: planInfo.sha256 } : (U.readJ(LK.file(D), null));
  const out = { cfg, lib, st, trades, bt, status, plan: shownPlan, D, P, iY };
  if (!dry) U.writeJ(RUN, status);
  if (!args["no-vault"]) { try { require("./lib/vault.js").write(out); say("vault pages written"); } catch (e) { say("vault FAILED: " + e.message); } }
  if (!dry) { try { require("./lib/registry.js").card({ ...out, Y }); } catch (e) { say("registry card FAILED: " + e.message); } }
  if (!args["no-publish"] && !dry) { try { const r = await require("./lib/publish.js").publish(out); say("publish: " + r); } catch (e) { say("publish FAILED: " + e.message); } }
  if (!dry) { status.lastRun.messages = msgs.slice(-40); U.writeJ(RUN, status); }
}
main().catch(e => {
  console.error(e);
  try { U.writeJ(RUN, { name: cfg.name, lastRun: { kind: "daily", at: new Date().toISOString(), status: "failed", messages: [...msgs.slice(-30), "FAILED: " + e.message] } }); } catch (x) {}
  process.exit(1);
});
