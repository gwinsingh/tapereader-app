// Plan lock: plan JSON written once (atomically) to .data/plans/<date>.json; the SHA-256 of the EXACT bytes written is
// appended to the append-only .data/locks.log (one JSON line per lock). A plan is in the forward record only if
// (a) its file hashes to the logged value, (b) it was locked before the deadline (late = false), (c) it is not a dry run.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { DATA } = require("./util.js");
const DIR = path.join(DATA, "plans"); fs.mkdirSync(DIR, { recursive: true });
const LOG = path.join(DATA, "locks.log");
const file = d => path.join(DIR, d + ".json");
const sha = s => crypto.createHash("sha256").update(s, "utf8").digest("hex");

function lock(plan, { dry = false } = {}) {
  const f = dry ? path.join(DATA, "dry", plan.date + ".json") : file(plan.date);
  if (!dry && (fs.existsSync(f) || entries().some(e => e.date === plan.date && !e.dry))) throw new Error(`plan for ${plan.date} is already locked — plans are written once`);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const body = { ...plan, lockedAt: new Date().toISOString() };
  const text = JSON.stringify(body, null, 1), hash = sha(text);
  const tmp = f + ".tmp"; fs.writeFileSync(tmp, text); fs.renameSync(tmp, f);
  const line = { date: plan.date, lockedAt: body.lockedAt, sha256: hash, late: !!plan.late, dry, file: path.relative(DATA, f).replace(/\\/g, "/") };
  if (!dry) fs.appendFileSync(LOG, JSON.stringify(line) + "\n");
  return { ...line, plan: JSON.parse(text) };
}
function entries() { if (!fs.existsSync(LOG)) return []; return fs.readFileSync(LOG, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean); }
const isLocked = d => fs.existsSync(file(d)) || entries().some(e => e.date === d && !e.dry);
// verified plan for date d, or { error }
function verified(d) {
  const f = file(d); if (!fs.existsSync(f)) return { error: "no plan" };
  let text, plan; try { text = fs.readFileSync(f, "utf8"); plan = JSON.parse(text); } catch (e) { return { error: "plan file unreadable: " + e.message }; }
  const e = entries().filter(x => x.date === d && !x.dry);
  if (e.length !== 1) return { error: `${e.length} lock-log entries for ${d}`, plan };
  if (sha(text) !== e[0].sha256) return { error: "hash mismatch: the plan file changed after it was locked", plan };
  if (e[0].late) return { error: "locked late (after the deadline): excluded from the forward record", plan, late: true };
  return { plan, lock: e[0] };
}
module.exports = { lock, verified, entries, file, isLocked };
