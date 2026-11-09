// Plan = locked conditional orders for ONE session, per track ("rules" = deterministic twin, "agent").
// buildOrder(cand, setup, ...) turns a scanner candidate into a fully price-resolved order;
// validateOrder() rejects anything not machine-checkable. rulesPlan() picks orders under the portfolio limits.
const crypto = require("crypto");
const fin = x => typeof x === "number" && isFinite(x);
const r4 = x => +(+x).toFixed(4);

function capStop(dir, entry, stop, cap, c) {
  // a stop may never be further than any cap (ATR / % / ADR); returns the tighter stop
  const lim = [];
  if (cap.maxAtr) lim.push(cap.maxAtr * c.atr);
  if (cap.maxPct) lim.push(entry * cap.maxPct / 100);
  if (cap.maxAdrFrac && fin(c.adrPct)) lim.push(entry * cap.maxAdrFrac * c.adrPct / 100);
  const maxDist = lim.length ? Math.min(...lim) : Infinity;
  // ... and never closer than minAtr (default 0.5 ATR, the swing book's proxy-stop floor): a 0.3% stop is noise
  const minDist = Math.min((cap.minAtr ?? 0.5) * c.atr, maxDist);
  if (dir === "long") return Math.min(Math.max(stop, entry - maxDist), entry - minDist);
  return Math.max(Math.min(stop, entry + maxDist), entry + minDist);
}

function earningsBlock(scheme, setup, nextRep, D) {
  const rule = setup.lane === "ep" ? "entered on the report; " + scheme.earnings : scheme.earnings;
  return { rule, next: nextRep ? nextRep.date : null, nextTime: nextRep ? nextRep.time : null };
}

// mode: "forward" (orh/lod resolved intraday) | "backtest" (dailyApprox used, tagged approx)
function buildOrder({ cand, setup, system, scheme, D, track, sizeMult = 1, cfg, nextRep = null, mode = "forward" }) {
  const dir = setup.direction, L = cand.levels, sgn = dir === "long" ? 1 : -1;
  let E = setup.entry, S = setup.stop, approx = false;
  if (mode === "backtest" && E.type === "orh_break") { E = { ...E.dailyApprox }; approx = true; }
  if (mode === "backtest" && S.type === "lod") { S = { ...S.dailyApprox }; approx = true; }
  const veto = [];
  let trigger, stop, refEntry;
  if (E.type === "stop_entry" || E.type === "open_gap") {
    const lvl = E.type === "open_gap" ? null : L[E.level];
    if (E.type === "stop_entry" && !fin(lvl)) return { veto: [`missing level ${E.level}`] };
    if (E.type === "open_gap") {
      trigger = { type: "open_gap", minGapPrice: r4(L.prev_close * (1 + E.minGapPct / 100)), offsetPct: E.offsetPct, text: `if it opens ≥ +${E.minGapPct}% (≥ ${(L.prev_close * (1 + E.minGapPct / 100)).toFixed(2)}), buy-stop ${E.offsetPct}% above the open (backtest approximation of the ORH trigger)` };
      refEntry = L.prev_close * (1 + E.minGapPct / 100);
    } else {
      const level = r4(lvl * (1 + sgn * (E.offsetPct || 0) / 100));
      trigger = { type: "stop_entry", level, maxChasePct: E.maxChasePct ?? 2, validSessions: E.validSessions || 1,
        text: `${dir === "long" ? "buy-stop above" : "sell-stop below"} ${level.toFixed(2)} (${E.level.replace(/_/g, " ")}${E.offsetPct ? ` ${dir === "long" ? "+" : "−"}${E.offsetPct}%` : ""}); skip if it opens more than ${E.maxChasePct ?? 2}% through the level` };
      refEntry = level;
    }
  } else if (E.type === "orh_break") {
    const cnd = E.conditions || {};
    trigger = { type: "orh_break", minutes: E.minutes, cutoff: E.cutoff || "11:30" };
    const parts = [`buy the break of the first ${E.minutes}-min high after ${minToHm(570 + E.minutes)} ET, before ${trigger.cutoff}`];
    if (cnd.minGapPct) { trigger.minGapPrice = r4(L.prev_close * (1 + cnd.minGapPct / 100)); parts.push(`only if it opens ≥ ${trigger.minGapPrice.toFixed(2)} (+${cnd.minGapPct}%)`); }
    if (cnd.minFirstVolFracOfAvg) { trigger.minFirstVol = Math.round(cnd.minFirstVolFracOfAvg * cand.vol50); parts.push(`and the first ${E.minutes} min trade ≥ ${trigger.minFirstVol.toLocaleString("en-US")} shares`); }
    if (cnd.touchLevel) { trigger.touchPrice = r4(L[cnd.touchLevel] * (1 + (cnd.touchPct || 0) / 100)); parts.push(`only after the day's low has reached ≤ ${trigger.touchPrice.toFixed(2)} (daily ${cand.levels.touch_ma ? "EMA zone" : cnd.touchLevel})`); }
    if (cnd.maxAboveLodPct) { trigger.maxAboveLodPct = cnd.maxAboveLodPct; parts.push(`skip if the trigger is > ${cnd.maxAboveLodPct}% above the low of day`); }
    trigger.text = parts.join("; ");
    refEntry = cnd.minGapPct ? trigger.minGapPrice : L.signal_high;
  } else return { veto: [`entry type ${E.type}`] };

  if (S.type === "lod") {
    stop = { type: "lod", maxPct: S.maxPct || null, maxAtr: S.maxAtr || null, maxAdrFrac: S.maxAdrFrac || null, atr: r4(cand.atr), adrPct: r4(cand.adrPct),
      text: `low of day at the entry, no further than ${[S.maxAdrFrac && `${S.maxAdrFrac}× ADR`, S.maxPct && `${S.maxPct}%`, S.maxAtr && `${S.maxAtr} ATR`].filter(Boolean).join(" / ")} from the fill` };
  } else if (S.type === "open_minus_atr") {
    stop = { type: "open_minus_atr", atr: r4(cand.atr * S.atr), text: `open − ${S.atr} ATR` };
  } else {
    const raw = L[S.type]; if (!fin(raw)) return { veto: [`missing stop level ${S.type}`] };
    let px = raw * (1 - sgn * (S.offsetPct || 0) / 100);
    const distPct = Math.abs(refEntry - px) / refEntry * 100;
    if (setup.scan.params.vetoStopPct && distPct > setup.scan.params.vetoStopPct) veto.push(`stop too wide (${distPct.toFixed(1)}% > ${setup.scan.params.vetoStopPct}%)`);
    px = capStop(dir, refEntry, px, S, cand);
    if (sgn * (refEntry - px) <= 0) return { veto: ["stop on the wrong side of the entry"] };
    stop = { type: "price", price: r4(px), text: `${px.toFixed(2)} (${S.type.replace(/_/g, " ")}${px !== raw ? ", capped" : ""})` };
    if (setup.scan.params.minRewardR && fin(L.hi10)) { const rr = (L.hi10 - refEntry) / (refEntry - px); if (rr < setup.scan.params.minRewardR) veto.push(`reward to the 10-day high ${rr.toFixed(1)}R < ${setup.scan.params.minRewardR}R`); }
  }
  const invalidation = stop.type === "price"
    ? { price: stop.price, text: `cancel if price trades ${dir === "long" ? "at or below" : "at or above"} ${stop.price.toFixed(2)} before the trigger` }
    : trigger.minGapPrice ? { text: "cancel if the gap / volume conditions fail" } : { text: "cancel if the trigger conditions fail before the cutoff" };
  const gradeMult = cfg.grades[cand.grade] ?? 0.5;
  const sizeR = +(gradeMult * sizeMult * (system.sizing && system.sizing.baseR || 1)).toFixed(3);
  if (!(sizeR > 0)) veto.push("edge status pause → size 0");
  const thesis = `${cand.sym}: ${cand.facts}.`.slice(0, 300);
  const order = {
    id: `${D}-${track}-${setup.id}-${cand.sym}`, date: D, track, system: setup.system, source: setup.source, setup: setup.id, setupVersion: setup.version, sym: cand.sym, dir,
    grade: cand.grade, sizeR, scenario: [...new Set([...(setup.scenario || []), ...(cand.neglected ? ["neglected"] : [])])], thesis, trigger, invalidation, stop,
    exits: { scheme: scheme.id, text: scheme.name, def: scheme }, earnings: earningsBlock(scheme, setup, nextRep, D), cluster: cand.cluster, theme: cand.theme,
    liquidity: { adv20: Math.round(cand.adv20), vol50: Math.round(cand.vol50), maxShares: Math.floor(cfg.universe.maxPctOfAdv * cand.vol50) },
    facts: { close: r4(cand.close), atr: r4(cand.atr), adrPct: r4(cand.adrPct), rs: cand.rs, sector: cand.sector, score: cand.score, report: cand.report },
    approx,
  };
  return { order, veto };
}
function minToHm(m) { return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; }

function validateOrder(o) {
  const e = [];
  if (!o || typeof o !== "object") return ["not an object"];
  for (const k of ["id", "date", "track", "system", "setup", "sym", "dir", "grade", "thesis"]) if (typeof o[k] !== "string" || !o[k]) e.push(`missing ${k}`);
  if (!["long", "short"].includes(o.dir)) e.push("dir");
  if (!["A+", "B"].includes(o.grade)) e.push("grade must be A+ or B");
  if (!(o.sizeR > 0 && o.sizeR <= 1.5)) e.push("sizeR out of (0, 1.5]");
  if (o.thesis && o.thesis.length > 400) e.push("thesis too long");
  const t = o.trigger || {};
  if (t.type === "stop_entry") { if (!fin(t.level)) e.push("trigger.level"); if (!fin(t.maxChasePct)) e.push("trigger.maxChasePct"); }
  else if (t.type === "orh_break") { if (!(t.minutes >= 1 && t.minutes <= 60)) e.push("trigger.minutes"); if (!/^\d\d:\d\d$/.test(t.cutoff || "")) e.push("trigger.cutoff"); }
  else if (t.type === "open_gap") { if (!fin(t.minGapPrice)) e.push("trigger.minGapPrice"); }
  else e.push(`trigger.type ${t.type}`);
  const s = o.stop || {};
  if (s.type === "price") { if (!fin(s.price)) e.push("stop.price"); else if (t.type === "stop_entry" && (o.dir === "long" ? s.price >= t.level : s.price <= t.level)) e.push("stop on the wrong side"); }
  else if (s.type === "lod") { if (!(s.maxPct || s.maxAtr || s.maxAdrFrac)) e.push("lod stop needs a cap"); }
  else if (s.type !== "open_minus_atr") e.push(`stop.type ${s.type}`);
  if (!o.exits || !o.exits.def) e.push("exits.def");
  return e;
}

// Pick orders for one track under per-system and global limits, given the track's current open book.
function selectOrders(orders, book, cfg, systems) {
  const P = cfg.portfolio, out = [], skipped = [];
  const perSysOpen = {}, perSysCount = {};
  for (const p of book) { perSysOpen[p.system] = (perSysOpen[p.system] || 0) + p.openRiskR; perSysCount[p.system] = (perSysCount[p.system] || 0) + 1; }
  const newPerSys = {};
  const held = new Set(book.map(p => `${p.system}|${p.sym}`));
  for (const o of orders) {
    const sys = systems.get(o.system), cap = (sys.sizing && sys.sizing.riskBudgetR) || P.perSystemOpenR, maxPos = sys.maxPositions || P.perSystemMaxPositions;
    if (held.has(`${o.system}|${o.sym}`)) { skipped.push([o.id, "already held by this system (adds need a fresh setup + profit: handled by the add rule)"]); continue; }
    if ((newPerSys[o.system] || 0) >= P.maxNewPerDayPerSystem) { skipped.push([o.id, "max new orders per system per day"]); continue; }
    if ((perSysCount[o.system] || 0) + (newPerSys[o.system] || 0) >= maxPos) { skipped.push([o.id, "system position cap"]); continue; }
    if ((perSysOpen[o.system] || 0) >= cap) { skipped.push([o.id, "system risk budget full"]); continue; }
    newPerSys[o.system] = (newPerSys[o.system] || 0) + 1; out.push(o); held.add(`${o.system}|${o.sym}`);
  }
  return { orders: out, skipped };
}

// canonical JSON (sorted keys) for hashing
function canon(x) { if (Array.isArray(x)) return "[" + x.map(canon).join(",") + "]"; if (x && typeof x === "object") return "{" + Object.keys(x).sort().map(k => JSON.stringify(k) + ":" + canon(x[k])).join(",") + "}"; return JSON.stringify(x); }
const sha256 = x => crypto.createHash("sha256").update(canon(x)).digest("hex");

module.exports = { buildOrder, validateOrder, selectOrders, sha256, canon, capStop };
