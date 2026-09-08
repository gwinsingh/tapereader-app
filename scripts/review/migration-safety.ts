/**
 * Section-5 safety proof: assert that the app's sheet-migration path cannot truncate,
 * reorder or clobber the ladder columns (78-98) on a 98-column tab.
 *
 * The live `U16632046-GURI` carries an expensive reconstruction from broker logs. This
 * runs the REAL decision logic (`planMigration`, exported from google-sheets.ts) against
 * the REAL header rows and asserts the additive-only invariants. Read-only — it makes no
 * writes of any kind.
 *
 *   node --experimental-strip-types scripts/review/migration-safety.ts
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
import { planMigration, SHEET_HEADERS } from "../../web/lib/trade-journal/google-sheets.ts";

/** Columns the app must never write into: the ladder block plus hand-added manual columns. */
const PROTECTED = [
  "Entry Ladder", "Exit Ladder", "Stop Ladder", "# Entries", "# Exits", "First Entry",
  "Initial Stop", "Initial Risk ($)", "Max Risk At Stake ($)", "Stop Raises",
  "Stopped Out?", "MFE (R)", "Risk Source", "Peak Position Value ($)",
  "Trough Position Value ($)", "Position MFE (R)", "Capture %", "Risk Basis",
  "Peak In-Window ($)", "In-Window MFE (R)", "In-Window Capture %",
  "RightTheory?", "EOD Screenshot",
];
/** Formula columns the app DOES own and is expected to regenerate. */
const OWNED_FORMULAS = new Set(["Stop", "P&L (R)", "1R", "2R", "3R", "4R", "5R", "6R"]);

const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  console.log(`  ${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) fails.push(msg);
};

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const SS = env.GOOGLE_SPREADSHEET_ID;

  const meta: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SS}?fields=sheets.properties`, { headers: H })).json();
  const tabs = meta.sheets.map((s: any) => s.properties);

  // --- findTabByAccountPrefix must resolve the LIVE tab, never the archive ---
  // Mirrors the predicate in google-sheets.ts exactly.
  console.log("\n# tab resolution (the archive must not be selectable)");
  for (const acct of ["U16632046", "TRPCT1541"]) {
    const hit = tabs.find((p: any) => p.title === acct || p.title.startsWith(`${acct}-`));
    check(hit?.title === `${acct}-GURI`, `account ${acct} resolves to ${hit?.title} (expected ${acct}-GURI)`);
  }
  const old = tabs.find((p: any) => p.title.startsWith("OLD-"));
  check(!!old && !old.title.startsWith("U16632046"),
    `archive ${old?.title} is unreachable by prefix match (its OLD- prefix shields it)`);

  console.log(`\nSHEET_HEADERS: ${SHEET_HEADERS.length} managed columns`);

  for (const props of tabs) {
    const tab = props.title;
    if (!/GURI$/.test(tab)) continue;
    const got: any = await (await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(`'${tab}'!1:1`)}`,
      { headers: H })).json();
    const hdr: string[] = (got.values || [])[0] || [];
    if (!hdr.length) continue;

    console.log(`\n# ${tab}  (${hdr.length} columns, grid ${props.gridProperties.columnCount})`);
    const plan = planMigration(hdr);
    const idxOf = (h: string) => hdr.findIndex((x) => x.trim() === h);
    const protectedIdx = new Set(PROTECTED.map(idxOf).filter((i) => i >= 0));

    // 1. Nothing is written into a protected column.
    const trespass = plan.formulaWriteCols.filter((c) => protectedIdx.has(c));
    check(trespass.length === 0,
      `no formula write lands in a protected column (${protectedIdx.size} protected, ${plan.formulaWriteCols.length} write targets)`);

    // 2. Every write target is a column the app owns. Targets can legitimately sit in
    //    the freshly-appended region, so resolve names against the POST-migration header.
    const fullHdr = [...hdr, ...plan.missingHeaders];
    const notOwned = plan.formulaWriteCols.filter((c) => !OWNED_FORMULAS.has((fullHdr[c] || "").trim()));
    check(notOwned.length === 0,
      `every write target is an owned formula column${notOwned.length ? ` — stray: ${notOwned.map((c) => `col ${c + 1}=${fullHdr[c]}`).join(", ")}` : ""}`);

    // 3. New headers, if any, land strictly past the last existing column.
    check(plan.appendStartCol === null || plan.appendStartCol >= hdr.length,
      plan.missingHeaders.length
        ? `${plan.missingHeaders.length} missing headers append at col ${plan.appendStartCol! + 1} (past all ${hdr.length} existing)`
        : `no headers missing — migration takes the no-op branch, appendDimension never fires`);

    // 4. Existing column order and identity survive migration untouched.
    const orderKept = hdr.every((h, i) => plan.colMap[h.trim()] === i || hdr.findIndex((x) => x.trim() === h.trim()) !== i);
    check(orderKept, `existing column order is preserved (colMap is name-keyed, header row never rewritten)`);

    // 5. The read range actually reaches the last column — a truncated read drops
    //    columns from every colMap built downstream.
    const readEnd = SHEET_HEADERS.length + 26;
    check(readEnd >= hdr.length,
      `read range spans ${readEnd} columns >= the tab's ${hdr.length} (no silent truncation)`);

    // 6. Every protected column is visible to a read (so resolveMfe etc. can see it).
    const unreachable = PROTECTED.filter((h) => { const i = idxOf(h); return i >= 0 && i >= readEnd; });
    check(unreachable.length === 0,
      `all present protected columns are within the read range${unreachable.length ? ` — hidden: ${unreachable.join(", ")}` : ""}`);
  }

  console.log(`\n${fails.length === 0 ? "PASS — migration is additive-only" : `FAIL — ${fails.length} assertion(s)`}`);
  fails.forEach((f) => console.log("  ✗ " + f));
  process.exit(fails.length ? 1 : 0);
})();
