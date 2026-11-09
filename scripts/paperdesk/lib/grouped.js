// Whole-market daily bars: one Polygon grouped-daily call per session.
// Reads the RS study's cache (scripts/rs/.data/grouped, READ-ONLY) first, then our own (.data/grouped).
// Missing days are fetched into our own cache only. Format = {date, n, rows:[[T,o,h,l,c,v,vw,trades]]}.
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const { DATA, isSession, sessionsBetween, etParts, log } = require("./util.js");
const OWN = path.join(DATA, "grouped"); fs.mkdirSync(OWN, { recursive: true });
const RS = path.join(__dirname, "..", "..", "rs", ".data", "grouped");
const fileOf = (dir, d) => path.join(dir, d + ".json.gz");
function locate(d) { for (const dir of [RS, OWN]) { const f = fileOf(dir, d); if (fs.existsSync(f)) return f; } return null; }
const have = d => !!locate(d);
function readDay(d) {
  const f = locate(d); if (!f) return null;
  try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString("utf8")); } catch (e) { return null; }
}
async function fetchDay(d) {
  const { get } = require("./polygon.js");
  const j = await get(`https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${d}?adjusted=true&include_otc=false`);
  const res = j.results || [];
  // empty answer: on a real session (per our NYSE calendar) it means "not published / glitch" -> never cache it
  if (res.length === 0 && (d >= etParts().date || isSession(d))) return { date: d, pending: true };
  const rec = res.length === 0 ? { date: d, holiday: true } : { date: d, fetched: Date.now(), n: res.length, rows: res.map(r => [r.T, r.o, r.h, r.l, r.c, r.v, r.vw == null ? null : +r.vw.toFixed(4), r.n == null ? null : r.n]) };
  const f = fileOf(OWN, d), t = f + ".tmp";
  fs.writeFileSync(t, zlib.gzipSync(JSON.stringify(rec))); fs.renameSync(t, f);
  return rec;
}
// Fetch every missing session in [from, to] (newest first). Returns the log lines.
async function sync(from, to, maxCalls = 40) {
  const days = sessionsBetween(from, to).filter(d => !have(d)).reverse().slice(0, maxCalls);
  const msgs = [];
  for (const d of days) {
    try { const r = await fetchDay(d); msgs.push(`grouped ${d}: ${r.pending ? "not published yet" : r.holiday ? "empty" : r.n + " tickers"}`); }
    catch (e) { msgs.push(`grouped ${d}: FAIL ${e.message}`); if (/NOT_AUTHORIZED/.test(e.message)) break; }
  }
  msgs.forEach(m => log(m));
  return msgs;
}
function cachedSessions(from = "0000", to = "9999") {
  const s = new Set();
  for (const dir of [RS, OWN]) if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith(".json.gz")) {
    const d = f.slice(0, 10); if (d >= from && d <= to && isSession(d)) { const j = readHead(path.join(dir, f)); if (j) s.add(d); }
  }
  return [...s].sort();
}
// cheap check that a cached file is a real trading day (not a {holiday:true} stub)
function readHead(f) { try { return fs.statSync(f).size > 2000; } catch (e) { return false; } }
module.exports = { readDay, have, sync, cachedSessions, fetchDay };
