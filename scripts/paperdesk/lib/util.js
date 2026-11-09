// Small shared helpers: paths, JSON io (atomic), ET clock, trading calendar.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, ".data");
fs.mkdirSync(DATA, { recursive: true });
const CONFIG = () => JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));

function readJ(f, dflt) { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return dflt; } }
function writeJ(f, obj) { fs.mkdirSync(path.dirname(f), { recursive: true }); const t = f + ".tmp"; fs.writeFileSync(t, JSON.stringify(obj, null, 1)); fs.renameSync(t, f); }

// Eastern time via Intl (DST-correct; the backtest lib's et.js is EDT-only).
const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
function etParts(ms = Date.now()) {
  const p = {}; for (const x of fmt.formatToParts(new Date(ms))) p[x.type] = x.value;
  return { date: `${p.year}-${p.month}-${p.day}`, min: (+p.hour) * 60 + (+p.minute), hhmm: `${p.hour}:${p.minute}`, sec: +p.second };
}
const hm2min = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// NYSE full-day closures 2024-2027 (half days trade normally for our purposes).
const HOLIDAYS = new Set([
  "2024-11-28", "2024-12-25", "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26", "2025-06-19", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25",
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24"]);
const isoAdd = (d, n) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const isWeekday = d => { const w = new Date(d + "T12:00:00Z").getUTCDay(); return w !== 0 && w !== 6; };
const isSession = d => isWeekday(d) && !HOLIDAYS.has(d);
function nextSession(d) { let x = isoAdd(d, 1); while (!isSession(x)) x = isoAdd(x, 1); return x; }
function prevSession(d) { let x = isoAdd(d, -1); while (!isSession(x)) x = isoAdd(x, -1); return x; }
function sessionsBetween(a, b) { const out = []; for (let x = a; x <= b; x = isoAdd(x, 1)) if (isSession(x)) out.push(x); return out; }

const r2 = (x, d = 2) => x == null || !isFinite(x) ? null : +(+x).toFixed(d);
function log(...a) { console.log(`[${etParts().hhmm}]`, ...a); }

module.exports = { ROOT, DATA, CONFIG, readJ, writeJ, etParts, hm2min, HOLIDAYS, isoAdd, isWeekday, isSession, nextSession, prevSession, sessionsBetween, r2, log };
