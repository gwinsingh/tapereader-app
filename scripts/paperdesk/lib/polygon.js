// Rate-limited Polygon client for the Paper Desk. Free tier = 5 calls/min, key shared with the journal,
// RS and Aiman jobs: calls are spaced >= 13 s, a 429 waits 65 s, and we hold our own lock
// (.data/fetch.lock). While the RS study's fetch lock is held we wait (read-only check, never touch it).
require("../../journal/http.js");
const fs = require("fs"), path = require("path");
const { parseEnvLocal, ENV_PATH } = require("../../review/env.js");
const { DATA } = require("./util.js");
const LOCK = path.join(DATA, "fetch.lock");
const RS_LOCK = path.join(__dirname, "..", "..", "rs", ".data", "fetch.lock");
const SPACING_MS = 13000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let KEY = null, last = 0;
const key = () => KEY || (KEY = parseEnvLocal(ENV_PATH).POLYGON_API_KEY);
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } }
function lockHeld(f) {
  if (!fs.existsSync(f)) return false;
  try { const l = JSON.parse(fs.readFileSync(f, "utf8")); return !(Date.now() - l.started > 6 * 3600e3 || !pidAlive(l.pid)) && l.pid !== process.pid; } catch (e) { return false; }
}
function acquireLock(label) {
  if (lockHeld(LOCK)) return false;
  fs.writeFileSync(LOCK, JSON.stringify({ pid: process.pid, started: Date.now(), label }));
  process.on("exit", () => { try { const l = JSON.parse(fs.readFileSync(LOCK, "utf8")); if (l.pid === process.pid) fs.unlinkSync(LOCK); } catch (e) {} });
  return true;
}
async function get(url) {
  for (let w = 0; w < 40 && lockHeld(RS_LOCK); w++) await sleep(15000);   // RS is fetching: wait up to 10 min
  for (let attempt = 0; attempt < 6; attempt++) {
    const wait = last + SPACING_MS - Date.now(); if (wait > 0) await sleep(wait);
    last = Date.now();
    let r;
    try { r = await fetch(url + (url.includes("?") ? "&" : "?") + "apiKey=" + key()); } catch (e) { await sleep(30000); continue; }
    if (r.status === 429) { await sleep(65000); continue; }
    if (r.status >= 500) { await sleep(30000); continue; }
    const j = await r.json();
    if (j.status === "ERROR" || j.status === "NOT_AUTHORIZED") throw new Error(JSON.stringify(j).slice(0, 200));
    return j;
  }
  throw new Error("Polygon: gave up after repeated 429/5xx/network errors");
}
async function aggs(sym, mult, span, from, to) {
  const j = await get(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/range/${mult}/${span}/${from}/${to}?adjusted=true&sort=asc&limit=50000`);
  return j.results || [];
}
module.exports = { get, aggs, acquireLock, sleep };
