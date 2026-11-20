// Market-drops study: save 30-minute bars for SPY and QQQ over the two years the repo's Polygon key reaches,
// for the page on the shape of the trading day (the April 2025 drop and the present one).
//   node scripts/marketdrops/intraday.js        → .data/intraday/<SYM>_30m.json  ([{t (ms), o, h, l, c, v}], extended hours included)
// Rules: 5 calls a minute (spaced 13 s); never between 09:15 and 16:15 New York time on a weekday.
require("../journal/http.js");
const fs = require("fs"), path = require("path");
const L = require("./lib.js");
const { parseEnvLocal, ENV_PATH } = require("../review/env.js");
const OUT = path.join(L.DATA, "intraday"); fs.mkdirSync(OUT, { recursive: true });
const SYMS = (process.argv.find(a => a.startsWith("--syms=")) || "--syms=SPY,QQQ").slice(7).split(","), sleep = ms => new Promise(r => setTimeout(r, ms));
const ny = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
const mins = +ny.hour * 60 + +ny.minute;
if (!["Sat", "Sun"].includes(ny.weekday) && mins >= 555 && mins <= 975) { console.log(`New York time ${ny.hour}:${ny.minute}: inside 09:15–16:15, not calling Polygon. Run it after the close.`); process.exit(0); }
(async () => {
  const KEY = parseEnvLocal(ENV_PATH).POLYGON_API_KEY; if (!KEY) { console.log("no POLYGON_API_KEY in web/.env.local"); return; }
  const today = new Date().toISOString().slice(0, 10), start = L.addDays(today, -728); let last = 0;
  for (const sym of SYMS) { const all = new Map();
    for (let a = start; a <= today; a = L.addDays(a, 46)) { const z = L.addDays(a, 45) > today ? today : L.addDays(a, 45);
      for (let tries = 0; tries < 3; tries++) { const wait = last + 13000 - Date.now(); if (wait > 0) await sleep(wait); last = Date.now();
        try { const r = await fetch(`https://api.polygon.io/v2/aggs/ticker/${sym}/range/30/minute/${a}/${z}?adjusted=true&sort=asc&limit=50000&apiKey=${KEY}`), j = await r.json();
          if (!j.results) { console.log("no bars", sym, a, z, j.status || r.status, String(j.error || j.message || "").slice(0, 80)); if (r.status === 429) continue; break; }
          for (const b of j.results) all.set(b.t, { t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v }); console.log(sym, a, "→", z, j.results.length, "bars"); break; } catch (e) { console.log("FAIL", sym, a, String(e.message).slice(0, 80)); } } }
    const rows = [...all.values()].sort((x, y) => x.t - y.t); if (rows.length) fs.writeFileSync(path.join(OUT, `${sym}_30m.json`), JSON.stringify(rows)); console.log(sym, "saved", rows.length, "bars", rows.length ? new Date(rows[0].t).toISOString().slice(0, 10) + " → " + new Date(rows[rows.length - 1].t).toISOString().slice(0, 10) : ""); }
})();
