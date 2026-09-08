/**
 * End-to-end check of the wired upload path, WITHOUT writing to the sheet.
 *
 * Runs the real pipeline — validateAndParse -> groupExecutionsIntoTrades ->
 * attachLadders -> tradeToRow — over the same DAS logs the monthly review used, against
 * the LIVE tab's real header row, and compares each produced row with the row already on
 * the sheet. Those sheet rows came from scripts/review/backfill-ladders.ts + auto-risk.ts
 * and pass verify.ts with zero failures, so they are the known-good reference: if the
 * upload path now reproduces them, a fresh CSV will land correct on the first try.
 *
 * Read-only. Makes no writes of any kind.
 *
 *   node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types \
 *        scripts/review/verify-upload-pipeline.ts [--tab=NAME] [--acct=PREFIX]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
import { parseFullExport, validateAndParse } from "../../web/lib/trade-journal/csv-parser.ts";
import { attachLadders, groupExecutionsIntoTrades, ladderEntryRef } from "../../web/lib/trade-journal/trade-grouper.ts";
import { tradeToRow } from "../../web/lib/trade-journal/google-sheets.ts";
import { normTime } from "../../web/lib/trade-journal/order-ladder.ts";

const arg = (k: string, d: string) => {
  const h = process.argv.find((a) => a.startsWith(`--${k}=`));
  return h ? h.slice(k.length + 3) : d;
};
const TAB = arg("tab", "U16632046-GURI");
const ACCT = arg("acct", "U16632046");
const DAS_FOLDER = "13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH";
const num = (v: any) => {
  if (v == null || v === "") return NaN;
  const t = String(v).replace(/[$,%\s]/g, "");
  return t === "" || t === "N/A" ? NaN : parseFloat(t);
};

const fails: string[] = [];
const warns: string[] = [];

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const SS = env.GOOGLE_SPREADSHEET_ID;

  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SS}/values/${encodeURIComponent(`'${TAB}'!A1:DZ1000`)}`,
    { headers: H })).json();
  const hdr: string[] = got.values[0];
  const I: Record<string, number> = {}; hdr.forEach((h, i) => (I[h.trim()] = i));
  const body: string[][] = got.values.slice(1).filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim());
  console.log(`${TAB}: ${body.length} rows, ${hdr.length} columns`);

  // Same Drive index + multi-export merge as backfill-ladders.ts. A date's exports are
  // merged by per-key MAX COUNT rather than set-union: set-union collapses legitimate
  // repeat fills and silently drops executions.
  const q = encodeURIComponent(`'${DAS_FOLDER}' in parents and trashed=false`);
  const dr: any = await (await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1000`, { headers: H })).json();
  const MON: Record<string, number> = { january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12 };
  const dateOf = (n: string): string | null => {
    const iso = n.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const named = n.match(/([a-z]+)-(\d{2})/i);
    if (named && MON[named[1].toLowerCase()]) return `2026-${String(MON[named[1].toLowerCase()]).padStart(2, "0")}-${named[2]}`;
    return null;
  };
  const ALIAS: Record<string, string> = { "trade-log.csv": "2026-05-06" };
  const byDate = new Map<string, { id: string; name: string }[]>();
  for (const f of dr.files || []) {
    const d = ALIAS[f.name] ?? dateOf(f.name);
    if (!d) continue;
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(f);
  }

  const dates = [...new Set(body.map((r) => (r[0] || "").trim()))].filter(Boolean).sort();
  let compared = 0, laddered = 0, noLog = 0, unmatched = 0;

  for (const date of dates) {
    const files = byDate.get(date);
    const sheetRows = body.filter((r) => (r[0] || "").trim() === date);
    if (!files?.length) { noLog += sheetRows.length; continue; }

    const key = (r: any) => `${r.time}|${r.event}|${r.side}|${r.symbol}|${r.shares}|${r.price}|${r.account}`;
    const perFile: string[] = [];
    for (const f of files) {
      perFile.push(await (await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, { headers: H })).text());
    }
    // Merge at the raw-line level so the pipeline sees exactly one CSV, as an upload would.
    let csv = perFile[0];
    if (perFile.length > 1) {
      const head = perFile[0].split(/\r?\n/)[0];
      const maxCount = new Map<string, number>();
      const parsedPer = perFile.map((t) => parseFullExport(t));
      const linesPer = perFile.map((t) => t.split(/\r?\n/).slice(1).filter((l) => l.trim()));
      for (const rows of parsedPer) {
        const c = new Map<string, number>();
        for (const r of rows) c.set(key(r), (c.get(key(r)) ?? 0) + 1);
        for (const [k, v] of c) maxCount.set(k, Math.max(maxCount.get(k) ?? 0, v));
      }
      const used = new Map<string, number>();
      const out: string[] = [];
      for (let fi = 0; fi < parsedPer.length; fi++) {
        for (let ri = 0; ri < parsedPer[fi].length; ri++) {
          const k = key(parsedPer[fi][ri]);
          const u = used.get(k) ?? 0;
          if (u < (maxCount.get(k) ?? 0)) { out.push(linesPer[fi][ri]); used.set(k, u + 1); }
        }
      }
      csv = [head, ...out].join("\n");
    }

    // --- the actual upload path ---
    let trades;
    try {
      const { executions } = validateAndParse(csv);
      trades = groupExecutionsIntoTrades(executions, date);
      attachLadders(trades, parseFullExport(csv));
    } catch (e: any) { fails.push(`${date}: pipeline threw — ${e.message}`); continue; }

    for (const sr of sheetRows) {
      const sym = (sr[1] || "").trim(), t = normTime(sr[2] || "");
      const trade = trades.find((x) => x.symbol === sym && normTime(x.entryTime) === t);
      if (!trade) { unmatched++; warns.push(`${date} ${sym} ${t}: no pipeline trade (log may not cover it)`); continue; }
      compared++;

      const row = tradeToRow(trade, 2, I);
      const got_ = (h: string) => row[I[h]];
      const want = (h: string) => sr[I[h]];

      const el = String(got_("Entry Ladder") ?? "");
      if (!el) { warns.push(`${date} ${sym}: no ladder reconstructed`); continue; }
      laddered++;

      // 1. The ladder must match the reviewed backfill byte for byte.
      for (const h of ["Entry Ladder", "Exit Ladder", "Stop Ladder", "Stopped Out?", "Risk Basis"]) {
        const a = String(got_(h) ?? "").trim(), b = String(want(h) ?? "").trim();
        if (a !== b) fails.push(`${date} ${sym} ${h}: pipeline "${a}" != sheet "${b}"`);
      }
      for (const h of ["# Entries", "# Exits", "Stop Raises", "First Entry", "Initial Stop",
                       "Initial Risk ($)", "Max Risk At Stake ($)"]) {
        const a = num(got_(h)), b = num(want(h));
        if (isNaN(a) && isNaN(b)) continue;
        if (isNaN(a) !== isNaN(b) || Math.abs(a - b) > 0.011)
          fails.push(`${date} ${sym} ${h}: pipeline ${a} != sheet ${b}`);
      }

      // 2. Initial Risk ($) must equal the R (Risk) the row would be written with.
      const ir = num(got_("Initial Risk ($)")), r = num(got_("R (Risk)"));
      if (isNaN(ir) || isNaN(r) || Math.abs(ir - r) > 0.011)
        fails.push(`${date} ${sym}: R (Risk) ${r} != Initial Risk ${ir}`);
      if (String(got_("Risk Source")) !== "auto (ladder)")
        fails.push(`${date} ${sym}: Risk Source is "${got_("Risk Source")}", expected "auto (ladder)"`);

      // 3. Position MFE (R) must bound the realised P&L (R) — the integrity check that
      //    caught the original bug. Read off the sheet's computed values, since the peak
      //    comes from enrichment rather than from the CSV.
      const pnlR = num(want("P&L (R)")), pos = num(want("Position MFE (R)"));
      if (!isNaN(pnlR) && !isNaN(pos) && pnlR > pos + 0.05)
        fails.push(`${date} ${sym}: realised ${pnlR}R > Position MFE ${pos}R`);

      // 4. The entry reference handed to enrichment must be measured off the FIRST lot.
      const ref = ladderEntryRef(trade.ladder);
      if (!ref) fails.push(`${date} ${sym}: ladder produced no entryRef`);
      else {
        const firstShares = ref.entries![0].shares;
        if (Math.abs(ref.riskPerShare - ref.initialRisk! / firstShares) > 1e-9)
          fails.push(`${date} ${sym}: riskPerShare not Initial Risk / first-entry shares`);
        if (Math.abs(ref.price - num(want("First Entry"))) > 0.011)
          fails.push(`${date} ${sym}: entryRef price ${ref.price} != sheet First Entry ${want("First Entry")}`);
      }
    }
  }

  console.log(`\ncompared ${compared} rows (${laddered} with a ladder); ${noLog} rows on dates with no DAS log; ${unmatched} unmatched`);
  console.log(`FAILURES: ${fails.length}`); fails.slice(0, 25).forEach((f) => console.log("  ✗ " + f));
  console.log(`WARNINGS: ${warns.length}`); warns.slice(0, 12).forEach((w) => console.log("  ! " + w));
  process.exit(fails.length ? 1 : 0);
})();
