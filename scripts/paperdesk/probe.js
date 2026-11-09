// Dev probe: scan the latest cached session and print candidates + rules-only orders (no writes).
//   node --max-old-space-size=4000 scripts/paperdesk/probe.js [planDate]
const P0 = require("./lib/panel.js"), M = require("./lib/market.js"), L = require("./lib/library.js"), PL = require("./lib/planner.js"), U = require("./lib/util.js");
const cfg = U.CONFIG(), lib = L.load(); if (lib.errors.length) console.log("library errors", lib.errors);
const P = P0.loadPanel({ lastN: cfg.history.planLookbackSessions, keep: M.KEEP_FUNDS, log: console.log }); const i = P.D - 1;
const D = process.argv[2] || U.nextSession(P.dates[i]);
console.time("scan");
const C = PL.candidates({ P, i, D, lib, cfg });
console.timeEnd("scan");
console.log(C.reg.label, C.reg.tags, C.uni);
for (const [k, v] of Object.entries(C.bySetup)) console.log(k.padEnd(24), C.gates[k].open ? "open " : "GATED", String(v.length).padStart(4), v.slice(0, 5).map(c => c.sym + "(" + c.grade + ")").join(" "), "|", C.gates[k].reason);
const R = PL.rulesOrders({ C, D, lib, cfg, track: "rules", book: [], sizeMult: () => 1 });
console.log("orders", R.orders.length, "skipped", R.skipped.length, "vetoed", R.vetoed.length, "invalid", R.invalid);
for (const o of R.orders) console.log(" ", o.id, o.grade, o.sizeR, "|", o.trigger.text, "| stop", o.stop.text);
console.log(R.vetoed.slice(0, 10));
