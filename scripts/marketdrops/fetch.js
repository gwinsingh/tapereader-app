// Market-drops study: download every series the study uses into scripts/marketdrops/.data/raw/ and write coverage.json.
//   node scripts/marketdrops/fetch.js                 (skips files younger than 20 hours)
//   node scripts/marketdrops/fetch.js --force         (re-download everything)
//   node scripts/marketdrops/fetch.js --only=etf|stocks|cboe|fred
// Sources (free, no key): Yahoo chart API (daily bars), CBOE (VIX family, put/call archive to Oct 2019), FRED.
// Stocks are stored gzipped (date,open,high,low,close,adjclose,volume from 1998) to keep the folder small.
// No Polygon here. Uses curl because this PC runs Node 16.
const fs = require("fs"), path = require("path"), cp = require("child_process"), zlib = require("zlib");
const DATA = path.join(__dirname, ".data"), RAW = path.join(DATA, "raw"); fs.mkdirSync(RAW, { recursive: true });
const FORCE = process.argv.includes("--force"), ONLY = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const fresh = f => !FORCE && fs.existsSync(f) && fs.statSync(f).size > 150 && Date.now() - fs.statSync(f).mtimeMs < 20 * 3600e3;
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function curl(url, out, ua, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { cp.execFileSync("curl", ["-sS", "-L", "-m", "90", "--fail", ...(ua ? ["-A", UA] : []), "-o", out + ".tmp", url], { stdio: ["ignore", "pipe", "pipe"] });
      if (fs.statSync(out + ".tmp").size > 100) { fs.renameSync(out + ".tmp", out); return true; } } catch (e) { const m = String(e.stderr || e.message).trim().slice(0, 90); if (/404/.test(m)) return false; console.log("  retry", i + 1, path.basename(out), m); }
    sleep(3000 * (i + 1));
  }
  return false;
}
const safe = s => s.replace(/[\^]/g, "_");
const U = JSON.parse(fs.readFileSync(path.join(DATA, "universe.json"), "utf8"));
const cov = fs.existsSync(path.join(DATA, "coverage.json")) ? JSON.parse(fs.readFileSync(path.join(DATA, "coverage.json"), "utf8")) : { series: {} };
cov.fetchedAt = new Date().toISOString(); const fail = [];

/** Yahoo daily bars -> csv text (or null). from = unix seconds */
function yahooCsv(sym, from) {
  const j = path.join(RAW, "_y.json");
  const ok = curl(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=${from}&period2=1900000000&interval=1d&events=div%2Csplit`, j, true);
  if (!ok) return null;
  try { const r = JSON.parse(fs.readFileSync(j, "utf8")).chart.result[0], q = r.indicators.quote[0], adj = (r.indicators.adjclose || [{}])[0].adjclose || [], off = r.meta.gmtoffset || -18000;
    const rows = ["date,open,high,low,close,adjclose,volume"]; let prev = "";
    (r.timestamp || []).forEach((t, i) => { if (q.close[i] == null) return; const d = new Date((t + off) * 1000).toISOString().slice(0, 10); if (d === prev) rows.pop(); prev = d;
      const g = x => x == null ? "" : +(+x).toFixed(4); rows.push([d, g(q.open[i]), g(q.high[i]), g(q.low[i]), g(q.close[i]), g(adj[i]), q.volume[i] == null ? "" : q.volume[i]].join(",")); });
    return rows.length > 30 ? rows : null; } catch (e) { return null; }
}
const range = rows => ({ from: rows[1].slice(0, 10), to: rows[rows.length - 1].slice(0, 10), n: rows.length - 1 });

if (!ONLY || ONLY === "etf") {
  for (const [sym, what] of Object.entries({ ...U.index, ...U.etf })) {
    const f = path.join(RAW, `yahoo_${safe(sym)}.csv`);
    if (!fresh(f)) { const rows = yahooCsv(sym, -1500000000); if (!rows) { fail.push(sym); console.log("FAIL", sym); continue; } fs.writeFileSync(f, rows.join("\n")); sleep(500); }
    const L = fs.readFileSync(f, "utf8").split("\n"); cov.series["Yahoo:" + sym] = { what, source: "Yahoo Finance", ...range(L) }; console.log(sym.padEnd(8), L[1].slice(0, 10), "→", L[L.length - 1].slice(0, 10), L.length - 1);
  }
}
if (!ONLY || ONLY === "stocks") {
  const dir = path.join(RAW, "stocks"); fs.mkdirSync(dir, { recursive: true }); let n = 0, got = 0; const syms = Object.keys(U.stocks).filter(s => s !== "ISIN");
  for (const sym of syms) {
    const f = path.join(dir, `${sym}.csv.gz`); n++;
    if (fresh(f)) { got++; continue; }
    const rows = yahooCsv(sym, 883612800);                  // 1998-01-01
    if (!rows) { fail.push(sym); console.log("FAIL", sym); sleep(400); continue; }
    fs.writeFileSync(f, zlib.gzipSync(rows.join("\n"))); got++; sleep(350);
    if (n % 40 === 0) console.log(`stocks ${n}/${syms.length} (last ${sym} ${rows[1].slice(0, 10)} → ${rows[rows.length - 1].slice(0, 10)})`);
  }
  cov.stocks = { n: got, of: syms.length, source: "Yahoo Finance, daily bars from 1998 (or listing)", missing: fail.slice() }; console.log("stocks saved:", got, "of", syms.length);
}
if (!ONLY || ONLY === "cboe") {
  const C = { VIX: "VIX (30-day implied volatility of the S&P 500), daily, from 1990", VIX3M: "3-month VIX, from 2009-09 (2007-12 on Yahoo ^VIX3M)", VIX9D: "9-day VIX, from 2011", VIX6M: "6-month VIX, from 2008", VIX1D: "1-day VIX, from 2022-05", VVIX: "VVIX: implied volatility of the VIX itself, from 2006", VXN: "Nasdaq-100 volatility index, from 2009-09", SKEW: "CBOE SKEW index, from 1990" };
  for (const [id, what] of Object.entries(C)) { const f = path.join(RAW, `cboe_${id}.csv`);
    if (!fresh(f) && !curl(`https://cdn.cboe.com/api/global/us_indices/daily_prices/${id}_History.csv`, f)) { fail.push("CBOE " + id); continue; }
    const L = fs.readFileSync(f, "utf8").trim().split(/\r?\n/), iso = s => { const [m, d, y] = s.split(",")[0].split("/"); return `${y}-${m}-${d}`; };
    cov.series["CBOE:" + id] = { what, source: "CBOE", from: iso(L[1]), to: iso(L[L.length - 1]), n: L.length - 1 }; console.log("CBOE", id.padEnd(6), iso(L[1]), "→", iso(L[L.length - 1])); }
  for (const [id, what] of Object.entries({ totalpc: "CBOE total put/call volume ratio, daily, 2006-11 → 2019-10 (archive; CBOE stopped the file)", equitypc: "CBOE equity-only put/call ratio, daily, 2006-11 → 2019-10 (archive)", indexpc: "CBOE index put/call ratio, daily, 2006-11 → 2019-10 (archive)" })) {
    const f = path.join(RAW, `cboe_${id}.csv`); if (!fresh(f) && !curl(`https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/${id}.csv`, f)) { fail.push("CBOE " + id); continue; }
    cov.series["CBOE:" + id] = { what, source: "CBOE", from: "2006-11-01", to: "2019-10-04" }; console.log("CBOE", id); }
  for (const [sym, what] of Object.entries({ "^VIX": "VIX (Yahoo; used only for days CBOE has not posted yet)", "^VIX3M": "3-month VIX (Yahoo, longer history than the CBOE file)", "^VVIX": "VVIX (Yahoo)" })) { const f = path.join(RAW, `yahoo_${safe(sym)}.csv`);
    if (!fresh(f)) { const rows = yahooCsv(sym, -1500000000); if (rows) fs.writeFileSync(f, rows.join("\n")); else { fail.push(sym); continue; } }
    const L = fs.readFileSync(f, "utf8").split("\n"); cov.series["Yahoo:" + sym] = { what, source: "Yahoo Finance", ...range(L) }; console.log(sym, L[1].slice(0, 10), "→", L[L.length - 1].slice(0, 10)); }
}
if (!ONLY || ONLY === "fred") {
  const FRED = { DGS2: "2-year Treasury yield, daily", DGS10: "10-year Treasury yield, daily", DGS30: "30-year Treasury yield, daily", DGS3MO: "3-month Treasury yield, daily", DFF: "Effective fed funds rate, daily", T10YIE: "10-year breakeven inflation, daily (2003 →)", DFII10: "10-year real (TIPS) yield, daily (2003 →)",
    BAA10Y: "Moody's Baa corporate yield minus 10-year Treasury, daily (1986 →)", AAA10Y: "Moody's Aaa corporate yield minus 10-year Treasury, daily", BAMLH0A0HYM2: "ICE BofA US high-yield spread, daily (FRED shows the last 3 years only)", NFCI: "Chicago Fed financial conditions index, weekly", STLFSI4: "St. Louis Fed financial stress index, weekly (1993 →)",
    DCOILWTICO: "WTI crude oil, daily (1986 →)", DTWEXBGS: "Broad dollar index, daily (2006 →)", WALCL: "Fed total assets, weekly (2002-12 →)", WRESBAL: "Reserve balances at the Fed, weekly", RRPONTSYD: "Overnight reverse repo at the Fed, daily",
    ICSA: "Initial jobless claims, weekly", UNRATE: "Unemployment rate, monthly", CPIAUCSL: "CPI, monthly", CPILFESL: "Core CPI, monthly", PCEPILFE: "Core PCE price index, monthly", UMCSENT: "Michigan consumer sentiment, monthly", INDPRO: "Industrial production, monthly", USREC: "NBER recession indicator, monthly",
    DFEDTAR: "Fed funds target rate, daily (1982-09 → 2008-12)", DFEDTARU: "Fed funds target range, upper limit, daily (2008-12 →)", DFEDTARL: "Fed funds target range, lower limit, daily", VXOCLS: "VXO (old VIX on the S&P 100), daily close (1986 → 2021)", DTWEXM: "Major-currencies dollar index, daily (1973 → 2019)",
    BOGZ1FL663067003Q: "Security brokers and dealers: margin loans to customers (Fed Z.1), quarterly", NCBEILQ027S: "Non-financial corporate equities, market value (Fed Z.1), quarterly", GDP: "Nominal GDP, quarterly", CP: "Corporate profits after tax, quarterly", DRTSCILM: "Banks tightening standards on business loans (survey), quarterly" };
  for (const [id, what] of Object.entries(FRED)) { const f = path.join(RAW, `fred_${id}.csv`);
    if (!fresh(f)) { if (!curl(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, f)) { fail.push("FRED " + id); console.log("FAIL", id); continue; } sleep(600); }
    const L = fs.readFileSync(f, "utf8").trim().split(/\r?\n/).slice(1).filter(l => { const v = l.split(",")[1]; return v !== "" && v !== "." && v != null; });
    cov.series["FRED:" + id] = { what, source: "FRED (St. Louis Fed)", from: L.length ? L[0].slice(0, 10) : null, to: L.length ? L[L.length - 1].slice(0, 10) : null, n: L.length }; console.log("FRED", id.padEnd(18), L.length ? `${L[0].slice(0, 10)} → ${L[L.length - 1].slice(0, 10)}  n=${L.length}` : "EMPTY"); }
}
if (!ONLY || ONLY === "other") {
  // Ken French industry portfolios (daily returns from 1926; no survivorship problem)
  for (const [zip, what] of Object.entries({ "12_Industry_Portfolios_daily_CSV.zip": "Ken French 12 industry portfolios, daily returns (1926-07 →)", "49_Industry_Portfolios_daily_CSV.zip": "Ken French 49 industry portfolios, daily returns (1926-07 →)" })) {
    const f = path.join(RAW, "french_" + zip), dir = path.join(RAW, "french_" + zip.replace(/\.zip$/i, ""));
    if (!fresh(f)) { if (!curl("https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/" + zip, f)) { fail.push("French " + zip); continue; } fs.mkdirSync(dir, { recursive: true }); cp.execFileSync("unzip", ["-o", "-q", f, "-d", dir]); sleep(800); }
    const csv = fs.readdirSync(dir).find(x => /\.csv$/i.test(x)), rows = fs.readFileSync(path.join(dir, csv), "utf8").split(/\r?\n/).filter(l => /^\s*\d{8},/.test(l)), d = s => s.trim().slice(0, 8).replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3");
    let last = rows.length - 1; for (let i = 1; i < rows.length; i++) if (rows[i].trim().slice(0, 8) < rows[i - 1].trim().slice(0, 8)) { last = i - 1; break; }
    cov.series["French:" + zip.replace(/_daily_CSV\.zip$/i, "")] = { what, source: "Ken French data library (CRSP)", from: d(rows[0]), to: d(rows[last]), n: last + 1 }; console.log("FRENCH", zip, d(rows[0]), "→", d(rows[last])); }
  // multpl.com tables: Shiller's CAPE and S&P 500 trailing 12-month real earnings, monthly
  for (const [slug, key, what] of [["shiller-pe", "CAPE", "Shiller P/E (CAPE), monthly"], ["s-p-500-earnings", "EPS", "S&P 500 earnings per share, trailing 12 months, inflation-adjusted, monthly"]]) {
    const h = path.join(RAW, `multpl_${key}.htm`), f = path.join(RAW, `multpl_${key}.csv`);
    if (!fresh(f)) { if (!curl(`https://www.multpl.com/${slug}/table/by-month`, h, true)) { fail.push("multpl " + key); continue; }
      const MONS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" }, rows = [];
      for (const m of fs.readFileSync(h, "utf8").matchAll(/<td>([A-Z][a-z]{2}) (\d+), (\d{4})<\/td>\s*<td>([\s\S]*?)<\/td>/g)) { const v = parseFloat(m[4].replace(/&#x2002;|,|\s/g, "")); if (isFinite(v)) rows.push(`${m[3]}-${MONS[m[1]]}-${String(m[2]).padStart(2, "0")},${v}`); }
      rows.sort(); fs.writeFileSync(f, "date,value\n" + rows.join("\n")); fs.unlinkSync(h); sleep(1200); }
    const Lm = fs.readFileSync(f, "utf8").trim().split("\n"); cov.series["multpl:" + key] = { what, source: "multpl.com (from R. Shiller's and S&P's data)", from: Lm[1].slice(0, 10), to: Lm[Lm.length - 1].slice(0, 10), n: Lm.length - 1 }; console.log("MULTPL", key, Lm[1].slice(0, 10), "→", Lm[Lm.length - 1].slice(0, 10)); }
}
try { fs.unlinkSync(path.join(RAW, "_y.json")); } catch (e) {}
cov.failed = fail; fs.writeFileSync(path.join(DATA, "coverage.json"), JSON.stringify(cov, null, 1));
console.log(fail.length ? "FAILED: " + fail.join(", ") : "all series downloaded");
