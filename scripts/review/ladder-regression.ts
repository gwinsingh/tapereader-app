/**
 * Regression test for the two order-ladder artifacts that invented risk.
 *
 * Both were caught by the trader reading a number against his own screenshots, not by any
 * automated check — `verify.ts` passed throughout, because the ladder was internally
 * consistent while faithfully reporting orders that never rested. These fixtures are the
 * cheap guard that stops either from coming back.
 *
 * Pure and offline: fixtures are inlined, no credentials, no network, no sheet.
 *
 *   node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types \
 *        scripts/review/ladder-regression.ts
 */
import { buildLadders, parseFullLog, fmtBrackets, type LogRow } from "../../web/lib/trade-journal/order-ladder.ts";

const HEAD = "Event,B/S,Symbol,Shares,Price,Route,Time,Account,Note";

/**
 * 2026-08-28 CRM, trimmed to the rows that matter.
 *
 * Three entries (3 @ 253.78, 4 @ 255.205 clustered, 8 @ 257.4095), a stop ladder walked
 * up 248.72 → 251.46 → 251.62 → 253.25 → 255.19, then TWO REFUSED marketable limit sells
 * at 249.06 and 250.22 placed to exit, and finally the real exit at 258.29.
 *
 * Reading those two refused orders as protective stops priced 15 open shares against
 * 249.06 and reported $105.54 at stake against $15.18 committed — 6.95x, the worst
 * "risk-rule breach" in the book, on a trade whose true peak exposure was $20.82 (1.37x).
 */
const CRM = [
  HEAD,
  "Execute,Buy,CRM,3,253.78,SMRT,09:31:00,U16632046,",
  "Accept,Sell,CRM,3,248.72,SMAT,09:31:00,U16632046,",
  "Replaced,Sell,CRM,3,251.46,SMAT,09:31:55,U16632046,",
  "Canceled,Sell,CRM,3,251.46,SMAT,09:32:50,U16632046,Canceled",
  "Execute,Buy,CRM,2,255.205,SMRT,09:32:51,U16632046,",
  "Execute,Buy,CRM,2,255.205,SMRT,09:32:51,U16632046,",
  "Accept,Sell,CRM,7,251.62,SMAT,09:32:52,U16632046,",
  "Replaced,Sell,CRM,7,253.25,SMAT,09:38:07,U16632046,",
  "Canceled,Sell,CRM,7,253.25,SMAT,09:45:29,U16632046,Canceled",
  "Execute,Buy,CRM,8,257.4095,SMRT,09:45:29,U16632046,",
  "Accept,Sell,CRM,15,255.19,SMAT,09:45:29,U16632046,",
  "Canceled,Sell,CRM,15,255.19,SMAT,09:50:11,U16632046,Canceled",
  // The two refusals. Note carries the reason; an ordinary cancel's Note is "Canceled".
  "Accept,Sell,CRM,15,249.06,SMRT,09:50:11,U16632046,We cannot accept an order at a limit price at ormore aggressive than 252.21041. Please submit your order using a limit price that is closer to the current market price of 259.85.",
  "Canceled,Sell,CRM,15,249.06,SMRT,09:50:11,U16632046,We cannot accept an order at a limit price at ormore aggressive than 252.21041. Please submit your order using a limit price that is closer to the current market price of 259.85.",
  "Accept,Sell,CRM,15,250.22,SMRT,09:50:13,U16632046,We cannot accept an order at a limit price at ormore aggressive than 252.220116. Please submit your order using a limit price that is closer to the current market price of 259.86.",
  "Canceled,Sell,CRM,15,250.22,SMRT,09:50:13,U16632046,We cannot accept an order at a limit price at ormore aggressive than 252.220116. Please submit your order using a limit price that is closer to the current market price of 259.86.",
  "Execute,Sell,CRM,15,258.29,SMRT,09:50:21,U16632046,",
].join("\n");

/**
 * 2026-08-05 AMD. Two fills 3 seconds apart cluster into ONE 3-share entry stamped at the
 * first fill's time — but the bracket resting at that instant covered 1 share. Charging it
 * against all 3 read $30.74 (2.06x) against a real $14.93 (1.00x).
 */
const AMD = [
  HEAD,
  "Execute,Buy,AMD,1,491.43,SMRT,09:34:22,U16632046,",
  "Accept,Sell,AMD,1,481.27,SMAT,09:34:22,U16632046,",
  "Canceled,Sell,AMD,1,481.27,SMAT,09:34:24,U16632046,Canceled",
  "Execute,Buy,AMD,2,491.56,SMRT,09:34:25,U16632046,",
  "Accept,Sell,AMD,3,486.54,SMAT,09:34:25,U16632046,",
  "Execute,Sell,AMD,3,486.61,SMRT,09:36:41,U16632046,",
].join("\n");

let failures = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = Math.abs(Number(got) - Number(want)) < 0.011 || String(got) === String(want);
  console.log(`  ${ok ? "✓" : "✗"} ${label}: ${got}${ok ? "" : `  (expected ${want})`}`);
  if (!ok) failures++;
}

const one = (csv: string): ReturnType<typeof buildLadders>[number] => {
  const rows: LogRow[] = parseFullLog(csv);
  const ladders = buildLadders(rows, "U16632046");
  if (ladders.length !== 1) {
    console.log(`  ✗ expected exactly 1 round trip, got ${ladders.length}`);
    failures++;
  }
  return ladders[0];
};

console.log("\n# 2026-08-28 CRM — refused exit orders must not be read as stops");
const crm = one(CRM);
check("entries", crm.entries.length, 3);
check("total shares", crm.totalShares, 15);
check("initial stop", crm.initialStop, 248.72);
check("initial risk", crm.initialRisk, 15.18);
check("max risk at stake", crm.maxRiskAtStake, 20.82);
check("stop raises", crm.stopRaises, 4);
check(
  "stop ladder ends at the last REAL stop",
  fmtBrackets(crm.stops),
  "09:31:00@248.72 | 09:31:55@251.46 | 09:32:52@251.62 | 09:38:07@253.25 | 09:45:29@255.19"
);
if (crm.stops.some((s) => s.price === 249.06 || s.price === 250.22)) {
  console.log("  ✗ a REFUSED order is in the stop ladder");
  failures++;
}

console.log("\n# 2026-08-05 AMD — a bracket only covers the shares it was placed for");
const amd = one(AMD);
check("entries (fills within CLUSTER_SECS merge)", amd.entries.length, 1);
check("total shares", amd.totalShares, 3);
check("initial risk", amd.initialRisk, 14.93);
check("max risk at stake", amd.maxRiskAtStake, 14.93);

console.log(
  `\n${failures === 0 ? "PASS — both artifacts stay fixed" : `FAIL — ${failures} assertion(s)`}`
);
process.exit(failures ? 1 : 0);
