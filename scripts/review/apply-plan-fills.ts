/**
 * Apply the Daily Plan onto trade rows that already exist.
 *
 * `appendTrades` joins the plan at INSERT time only, so a CSV uploaded under the wrong
 * date lands with every plan-driven column blank and nothing ever revisits it. This
 * re-runs that join over rows already on the sheet, optionally correcting the date first.
 *
 *   node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types \
 *     scripts/review/apply-plan-fills.ts --tab=NAME --date=YYYY-MM-DD [--from=YYYY-MM-DD] [--write]
 *
 * `--from` re-dates rows currently carrying that date to `--date` before filling, for the
 * case where the upload date picker was left on its default (the previous weekday).
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");

const arg = (k: string, d = "") => {
  const h = process.argv.find((a) => a.startsWith(`--${k}=`));
  return h ? h.slice(k.length + 3) : d;
};
const TAB = arg("tab"), DATE = arg("date"), FROM = arg("from");
const WRITE = process.argv.includes("--write");
if (!TAB || !DATE) { console.error("need --tab and --date"); process.exit(1); }

/** Plan header -> trade-sheet header. Identical strings by convention; listed so the join is explicit. */
const PLAN_FILL = ["Conviction (1-3)", "Catalyst", "L2 Bias",
  "Daily Trend", "Daily Conv", "1H Trend", "1H Conv", "5m Trend", "5m Conv"];
const DAY_FILL = ["Energy (1-5)", "Tension (1-5)", "Urge to Trade Fast?",
  "Sleep Score", "Readiness Score", "Sleep (hrs)"];
const ALWAYS_WATCHLIST = new Set(["QQQ", "SPY"]);
const colA1 = (n: number) => { let s = "", x = n + 1; while (x > 0) { const m = (x - 1) % 26; s = String.fromCharCode(65 + m) + s; x = Math.floor((x - 1) / 26); } return s; };

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" };
  const SS = env.GOOGLE_SPREADSHEET_ID;
  const api = (p: string, o?: any): Promise<any> =>
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SS}${p}`, o).then((r) => r.json());

  const plan = (await api(`/values/${encodeURIComponent("'Daily Plan'!A1:Z500")}`, { headers: H })).values || [];
  const ph: string[] = plan[0]; const PI: Record<string, number> = {}; ph.forEach((h, i) => (PI[h.trim()] = i));
  const planRows = plan.slice(1).filter((r: string[]) => String(r[PI["Date"]] ?? "").trim() === DATE);
  if (!planRows.length) { console.error(`no Daily Plan rows for ${DATE}`); process.exit(1); }
  const bySymbol = new Map<string, string[]>();
  for (const r of planRows) bySymbol.set(String(r[PI["Symbol"]] ?? "").trim().toUpperCase(), r);
  // Day-level fields are replicated on every plan row of the date; first non-empty wins.
  const day: Record<string, string> = {};
  for (const f of DAY_FILL) for (const r of planRows) { const v = String(r[PI[f]] ?? "").trim(); if (v && !day[f]) day[f] = v; }
  console.log(`plan ${DATE}: ${planRows.length} symbols (${[...bySymbol.keys()].join(", ")})`);
  console.log(`day-level: ${DAY_FILL.map((f) => `${f.split(" ")[0]}=${day[f] ?? "·"}`).join(" ")}\n`);

  const all = (await api(`/values/${encodeURIComponent(`'${TAB}'!A1:DZ2000`)}`, { headers: H })).values || [];
  const hdr: string[] = all[0]; const I: Record<string, number> = {}; hdr.forEach((h, i) => (I[h.trim()] = i));
  const match = FROM || DATE;
  const data: any[] = [];
  let touched = 0;

  all.slice(1).forEach((r: string[], i: number) => {
    if (String(r[I["Date"]] ?? "").trim() !== match) return;
    const rowNum = i + 2;
    const sym = String(r[I["Symbol"]] ?? "").trim().toUpperCase();
    const put = (header: string, val: string) => {
      const c = I[header]; if (c === undefined || !val) return;
      data.push({ range: `${TAB}!${colA1(c)}${rowNum}`, values: [[val]] });
    };
    const changes: string[] = [];
    if (FROM) { put("Date", DATE); changes.push(`date->${DATE}`); }
    // Day-level: keyed by date alone, so every row of the date gets it. Fill-if-blank.
    for (const f of DAY_FILL) if (!String(r[I[f]] ?? "").trim() && day[f]) { put(f, day[f]); changes.push(f.split(" ")[0]); }
    // Per-symbol: only for names actually on the plan.
    const p = bySymbol.get(sym);
    if (p) for (const f of PLAN_FILL) {
      const v = String(p[PI[f]] ?? "").trim();
      if (v && !String(r[I[f]] ?? "").trim()) { put(f, v); changes.push(f.split(" ")[0]); }
    }
    const origin = p || ALWAYS_WATCHLIST.has(sym) ? "Watchlist" : "Intraday discovery";
    if (String(r[I["Origin"]] ?? "").trim() !== origin) { put("Origin", origin); changes.push(`Origin->${origin}`); }
    if (changes.length) { touched++; console.log(`  row ${rowNum} ${sym.padEnd(6)} ${changes.join(", ")}`); }
  });

  console.log(`\n${touched} rows to update, ${data.length} cells`);
  if (!WRITE) { console.log("(dry run — pass --write)"); return; }
  const res = await api(`/values:batchUpdate`, { method: "POST", headers: H,
    body: JSON.stringify({ valueInputOption: "USER_ENTERED", data }) });
  console.log(res.error ? `ERROR ${JSON.stringify(res.error)}` : `wrote ${res.totalUpdatedCells} cells`);
})();
