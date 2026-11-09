// Earnings dates from Nasdaq's public earnings calendar (the same source as scripts/swingbook/earnings.js).
// One call per weekday. Our own cache (.data/earnings) wins over the swing book's per-day cache (read-only).
// byDate(d, { fetch, fresh }) -> Map(sym -> time) with time = "time-pre-market" | "time-after-hours" | "time-not-supplied" | ...
// fresh = refetch unless our own copy is < 6 h old (the calendar fills in during the week; the swing-book copy can be weeks old).
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const { DATA, isoAdd, isWeekday } = require("./util.js");
const OWN = path.join(DATA, "earnings"); fs.mkdirSync(OWN, { recursive: true });
const SB = path.join(__dirname, "..", "..", "swingbook", ".data", "earnings");
const mem = new Map();
const ownF = d => path.join(OWN, d + ".json"), sbF = d => path.join(SB, d + ".json");
function fetchDay(d) {
  const t = execSync(`curl -s -m 30 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" -H "Accept: application/json" "https://api.nasdaq.com/api/calendar/earnings?date=${d}"`).toString();
  const j = JSON.parse(t);
  if (!j || !j.data || !Array.isArray(j.data.rows) && j.data.rows !== null) throw new Error("unexpected earnings payload");   // never cache error bodies
  const f = ownF(d), tmp = f + ".tmp"; fs.writeFileSync(tmp, t); fs.renameSync(tmp, f); return t;
}
function byDate(d, { fetch = true, fresh = false } = {}) {
  const key = d + (fresh ? "!" : "");
  if (mem.has(key)) return mem.get(key);
  let txt = null;
  const own = fs.existsSync(ownF(d)) ? ownF(d) : null, sb = fs.existsSync(sbF(d)) ? sbF(d) : null;
  const ownAgeH = own ? (Date.now() - fs.statSync(own).mtimeMs) / 3600e3 : Infinity;
  const want = fetch && isWeekday(d) && (fresh ? ownAgeH > 6 : !own && !sb);
  if (want) { try { txt = fetchDay(d); } catch (e) { /* fall back to whatever is cached */ } }
  if (!txt && own) txt = fs.readFileSync(own, "utf8");
  if (!txt && sb) txt = fs.readFileSync(sb, "utf8");
  const m = new Map();
  if (txt) { try { const j = JSON.parse(txt); for (const r of (j.data && j.data.rows) || []) m.set(r.symbol, r.time || "time-not-supplied"); } catch (e) {} }
  m.known = !!txt;
  mem.set(key, m); if (!fresh) mem.set(d, m); return m;
}
// Does `sym` report so that session D's open is the first reaction? (after-hours / unknown time on prevDate, or pre-market / unknown on D)
function reactsOn(sym, D, prevDate, opts) {
  const a = byDate(prevDate, opts), b = byDate(D, opts);
  if (a.get(sym) === "time-after-hours") return { date: prevDate, time: "after-hours" };
  if (a.get(sym) === "time-not-supplied") return { date: prevDate, time: "time not supplied (may be after the close)" };
  const tb = b.get(sym); if (tb && tb !== "time-after-hours") return { date: D, time: tb.replace("time-", "") };
  return null;
}
module.exports = { byDate, reactsOn };
