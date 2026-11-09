// Load + validate the setup library: systems/*.json, setups/*.json, exits/*.json.
// A setup must name an existing system and exit scheme, a known scanner and entry/stop type.
const fs = require("fs"), path = require("path");
const { ROOT } = require("./util.js");
const SCANNERS = ["ema_pullback", "high52_breakout", "tight_base", "ep_earnings", "post_earnings_drift", "washout", "ma50_first_pullback_short", "parabolic_index"];
const ENTRY = ["stop_entry", "orh_break"];
const LEVELS = ["signal_high", "signal_low", "base_high", "hi252", "lo10", "hi_since_gap", "gap_low", "touch_ma"];
const STOPS = ["signal_low", "signal_high", "lo10", "gap_low", "lod"];
const MAS = ["ema9", "ema10", "ema20", "ema21", "ema50", "sma50"];

function readDir(d) { const p = path.join(ROOT, d); return fs.existsSync(p) ? fs.readdirSync(p).filter(f => f.endsWith(".json")).map(f => ({ f, j: JSON.parse(fs.readFileSync(path.join(p, f), "utf8")) })) : []; }

function load() {
  const errors = [];
  const systems = new Map(readDir("systems").map(x => [x.j.id, x.j]));
  const exits = new Map(readDir("exits").map(x => [x.j.id, x.j]));
  const setups = new Map();
  for (const { f, j } of readDir("setups")) {
    const e = [];
    if (!j.id || f !== j.id + ".json") e.push("file name must be <id>.json");
    if (!systems.has(j.system)) e.push(`unknown system ${j.system}`);
    if (!exits.has(j.exit)) e.push(`unknown exit scheme ${j.exit}`);
    if (!Number.isInteger(j.version)) e.push("version must be an integer");
    if (!["long", "short"].includes(j.direction)) e.push("direction must be long|short");
    if (!j.scan || !SCANNERS.includes(j.scan.type)) e.push(`unknown scanner ${j.scan && j.scan.type}`);
    if (!j.entry || !ENTRY.includes(j.entry.type)) e.push(`unknown entry type ${j.entry && j.entry.type}`);
    if (j.entry && j.entry.type === "stop_entry" && !LEVELS.includes(j.entry.level)) e.push(`unknown entry level ${j.entry.level}`);
    if (j.entry && j.entry.type === "orh_break" && !j.entry.dailyApprox) e.push("orh_break needs dailyApprox for the backtest");
    if (!j.stop || !STOPS.includes(j.stop.type)) e.push(`unknown stop type ${j.stop && j.stop.type}`);
    if (j.stop && j.stop.type === "lod" && !j.stop.dailyApprox) e.push("lod stop needs dailyApprox for the backtest");
    if (e.length) { errors.push(`${f}: ${e.join("; ")}`); continue; }
    const sys = systems.get(j.system);
    if (j.source !== sys.source) errors.push(`${f}: source ${j.source} != system source ${sys.source} (fixed)`);
    j.source = sys.source;
    setups.set(j.id, j);
  }
  for (const [id, x] of exits) {
    if (x.trail && x.trail.ma && !MAS.includes(x.trail.ma)) errors.push(`exits/${id}: unknown MA ${x.trail.ma}`);
    for (const t of x.trims || []) if (!(t.atR > 0) && !(t.afterSessions > 0)) errors.push(`exits/${id}: trim needs atR or afterSessions`);
  }
  return { systems, setups, exits, errors };
}
module.exports = { load, MAS };
