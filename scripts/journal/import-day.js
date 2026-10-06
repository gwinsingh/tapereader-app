// Imports a day's DAS trade log into the journal sheet through the live app - the same two calls
// the upload page makes (/pct-bootcamp/trade-journal), so rows, ladder columns and enrichment
// columns come out exactly as a manual upload would. Needs no credentials on this PC.
//
//   node scripts/journal/import-day.js <date>                upload + enrich
//   node scripts/journal/import-day.js <date> --no-enrich    upload only
//
// Safe to re-run: the upload dedups on Date|Symbol|Entry Time|Side, and enrichment never wipes
// existing values. Enrichment pauses 65 s between symbols (Polygon free tier), like the page.
const fs = require("fs");
const path = require("path");
const { multipart } = require("./http.js");

const { parseEnvLocal, ENV_PATH } = require("../review/env.js");

// tapereader.us sits behind Cloudflare Access; a script gets in with a service token kept in
// web/.env.local (CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET).
const BASE = "https://tapereader.us";
function accessHeaders() {
  const env = fs.existsSync(ENV_PATH) ? parseEnvLocal(ENV_PATH) : {};
  if (!env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET)
    throw new Error("tapereader.us is behind Cloudflare Access - add CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET to web/.env.local");
  return { "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID, "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET };
}
const DAS_DIR = "C:\\Users\\gurip\\OneDrive\\Documents\\DAS Reports";
const ENRICH_DELAY_MS = 65000;

async function main() {
  const [date, flag] = process.argv.slice(2);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) throw new Error("usage: import-day.js <YYYY-MM-DD> [--no-enrich]");
  const file = path.join(DAS_DIR, `${date}-trade-log.csv`);
  if (!fs.existsSync(file)) throw new Error(`no DAS log: ${file}`);

  const auth = accessHeaders();
  const form = multipart({ date }, { field: "file", name: path.basename(file), type: "text/csv", data: fs.readFileSync(file) });
  const r = await fetch(`${BASE}/api/trade-journal/upload`, {
    method: "POST", headers: { ...auth, "Content-Type": form.contentType }, body: form.body,
  });
  const up = await r.json().catch(() => ({ error: `HTTP ${r.status} (not JSON - Access token rejected?)` }));
  if (!r.ok) throw new Error(`upload failed: ${up.error || r.status}`);
  console.log(`${date}: ${up.tradesProcessed} trades, ${up.rowsAppended} appended, ${up.rowsSkipped} already there -> tab ${up.accounts?.join(", ")}`);
  for (const t of up.trades) console.log(`  ${t.entryTime} ${t.symbol} ${t.side} ${t.shares} P&L ${t.pnl}`);
  if (up.planMatch) console.log("  plan match:", JSON.stringify(up.planMatch));

  const tabName = up.accounts?.[0];
  if (flag === "--no-enrich" || !tabName) return;
  const bySymbol = new Map();
  for (const t of up.trades) bySymbol.set(t.symbol, [...(bySymbol.get(t.symbol) || []), t]);
  let i = 0, failed = 0;
  for (const [symbol, trades] of bySymbol) {
    if (i++ > 0) await new Promise((res) => setTimeout(res, ENRICH_DELAY_MS));
    const er = await fetch(`${BASE}/api/trade-journal/enrich`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol, tabName,
        trades: trades.map((t) => ({
          date: t.date, entryTime: t.entryTime, exitTime: t.exitTime, side: t.side,
          avgEntry: t.avgEntry, index: t.index,
          riskPerShare: t.entryRef?.riskPerShare, entryRef: t.entryRef ?? undefined,
        })),
      }),
    });
    const ej = await er.json().catch(() => ({}));
    if (er.ok) console.log(`  enriched ${symbol}`);
    else { failed++; console.log(`  enrich FAILED ${symbol}: ${ej.error || er.status}`); }
  }
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error(e.message); process.exit(1); });
