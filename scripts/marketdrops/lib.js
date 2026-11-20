// Market-drops study: loaders for the downloaded series and the helpers every step shares.
// Raw files live in scripts/marketdrops/.data/raw; a few long series (Ken French industries, Shiller, multpl)
// are read from scripts/fedcycles/.data/raw when this study has no copy of its own.
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const DATA = path.join(__dirname, ".data"), RAW = path.join(DATA, "raw"), RAW2 = path.join(__dirname, "..", "fedcycles", ".data", "raw");
const safe = s => s.replace(/[\^]/g, "_");
const memo = {}; const once = (k, f) => (k in memo ? memo[k] : (memo[k] = f()));
const raw = f => fs.existsSync(path.join(RAW, f)) ? path.join(RAW, f) : path.join(RAW2, f);

/** FRED csv -> [[iso, number]...] (missing rows dropped) */
const fred = id => once("F" + id, () => fs.readFileSync(raw(`fred_${id}.csv`), "utf8").trim().split(/\r?\n/).slice(1)
  .map(l => { const [d, v] = l.split(","); return [d.slice(0, 10), v === "" || v === "." ? NaN : +v]; }).filter(r => isFinite(r[1])));
const parseBars = txt => txt.trim().split("\n").slice(1).map(l => { const p = l.split(","); return { d: p[0], o: +p[1] || +p[4], h: +p[2] || +p[4], l: +p[3] || +p[4], c: +p[4], a: p[5] === "" ? +p[4] : +p[5], v: +p[6] || 0 }; }).filter(b => b.c > 0);
/** index or ETF daily bars [{d,o,h,l,c,a,v}] ; o/h/l/c are split-adjusted prices, a = close adjusted for dividends too */
const bars = sym => once("Y" + sym, () => parseBars(fs.readFileSync(raw(`yahoo_${safe(sym)}.csv`), "utf8")));
/** one stock's daily bars from 1998 (null when the download has no file) */
const stock = sym => once("S" + sym, () => { const f = path.join(RAW, "stocks", sym + ".csv.gz"); return fs.existsSync(f) ? parseBars(zlib.gunzipSync(fs.readFileSync(f)).toString("utf8")) : null; });
const anyBars = sym => fs.existsSync(raw(`yahoo_${safe(sym)}.csv`)) ? bars(sym) : stock(sym);
const universe = () => once("U", () => JSON.parse(fs.readFileSync(path.join(DATA, "universe.json"), "utf8")));
/** CBOE index history csv -> [{d,o,h,l,c}] (files with one value column give o=h=l=c) */
const cboeRaw = id => once("C" + id, () => fs.readFileSync(raw(`cboe_${id}${id === "VIX" && !fs.existsSync(path.join(RAW, "cboe_VIX.csv")) ? "_History" : ""}.csv`), "utf8").trim().split(/\r?\n/).slice(1)
  .map(l => { const p = l.split(","), [m, d, y] = p[0].split("/"); const c = +(p[4] != null && p[4] !== "" ? p[4] : p[1]); return { d: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`, o: +p[1], h: +(p[2] || p[1]), l: +(p[3] || p[1]), c }; }).filter(b => b.c > 0));
/** the VIX: CBOE history, topped up from Yahoo for the latest sessions CBOE has not posted yet */
const cboe = id => once("CC" + id, () => { const a = cboeRaw(id); if (id !== "VIX" || !fs.existsSync(path.join(RAW, "yahoo__VIX.csv"))) return a; const last = a[a.length - 1].d; return a.concat(bars("^VIX").filter(b => b.d > last).map(b => ({ d: b.d, o: b.o, h: b.h, l: b.l, c: b.c }))); });
/** CBOE put/call archive -> [[iso, ratio]] */
const putCall = id => once("P" + id, () => fs.readFileSync(raw(`cboe_${id}.csv`), "utf8").split(/\r?\n/).map(l => { const p = l.split(","); const m = /^(\d+)\/(\d+)\/(\d{4})$/.exec((p[0] || "").trim()); return m ? [`${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`, +p[4]] : null; }).filter(r => r && isFinite(r[1])));
function frenchTable(dirName, which = 0) {
  return once("K" + dirName + which, () => { const dir = raw(dirName), f = fs.readdirSync(dir).find(x => /\.csv$/i.test(x)), L = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    const tables = []; let cur = null, head = null;
    for (const l of L) { if (/^\s*\d{8},/.test(l)) { if (!cur) { cur = { head, rows: [] }; tables.push(cur); } const p = l.split(","); cur.rows.push([p[0].trim().replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3"), ...p.slice(1).map(x => { const v = +x; return v <= -99 ? NaN : v; })]); }
      else { if (/^\s*,/.test(l)) head = l.split(",").slice(1).map(s => s.trim()); cur = null; } }
    return tables[which]; });
}
const french49 = () => frenchTable("french_49_Industry_Portfolios_daily_CSV");
const french12 = () => frenchTable("french_12_Industry_Portfolios_daily_CSV");
const multpl = key => once("M" + key, () => fs.readFileSync(raw(`multpl_${key}.csv`), "utf8").trim().split("\n").slice(1).map(l => { const [d, v] = l.split(","); return [d, +v]; }));

// ---- dates ----
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const nice = iso => iso ? `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}` : "—";
const niceS = iso => iso ? `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}` : "—";
const niceM = iso => iso ? `${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}` : "—";

// ---- lookups on sorted [[iso, v]] or [{d}] arrays ----
function idxAtOrBefore(arr, iso, key) { let lo = 0, hi = arr.length - 1, ans = -1; const D = key ? x => x[key] : x => x[0]; while (lo <= hi) { const m = (lo + hi) >> 1; if (D(arr[m]) <= iso) { ans = m; lo = m + 1; } else hi = m - 1; } return ans; }
const idxAtOrAfter = (arr, iso, key) => { const i = idxAtOrBefore(arr, iso, key); const D = key ? x => x[key] : x => x[0]; return i >= 0 && D(arr[i]) === iso ? i : i + 1; };
const bi = (B, iso) => idxAtOrBefore(B, iso, "d");          // bar index at or before a date
const bia = (B, iso) => idxAtOrAfter(B, iso, "d");
const valueAt = (pairs, iso) => { const i = idxAtOrBefore(pairs, iso); return i < 0 ? NaN : pairs[i][1]; };

// ---- statistics ----
const sum = a => a.reduce((s, x) => s + x, 0), mean = a => a.length ? sum(a) / a.length : NaN;
const sorted = a => [...a].sort((x, y) => x - y);
const quantile = (a, q) => { const s = sorted(a.filter(isFinite)); if (!s.length) return NaN; const p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo); };
const median = a => quantile(a, 0.5);
const stdev = a => { const m = mean(a); return a.length > 1 ? Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - 1)) : NaN; };
const corr = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return a / Math.sqrt(b * c); };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/** spearman rank correlation */
const rank = a => { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); idx.forEach(([, i], k) => (r[i] = k)); return r; };
const spearman = (x, y) => corr(rank(x), rank(y));

// ---- indicators on plain arrays ----
const sma = (v, n) => { const out = new Array(v.length).fill(NaN); let s = 0; for (let i = 0; i < v.length; i++) { s += v[i]; if (i >= n) s -= v[i - n]; if (i >= n - 1) out[i] = s / n; } return out; };
const ema = (v, n) => { const out = new Array(v.length).fill(NaN), k = 2 / (n + 1); let e = NaN, s = 0; for (let i = 0; i < v.length; i++) { if (i < n - 1) { s += v[i]; continue; } if (i === n - 1) { s += v[i]; e = s / n; } else e = v[i] * k + e * (1 - k); out[i] = e; } return out; };
const rollMax = (v, n) => v.map((_, i) => { let m = -Infinity; for (let j = Math.max(0, i - n + 1); j <= i; j++) if (v[j] > m) m = v[j]; return m; });
const rollMin = (v, n) => v.map((_, i) => { let m = Infinity; for (let j = Math.max(0, i - n + 1); j <= i; j++) if (v[j] < m) m = v[j]; return m; });
/** weekly bars (week = Monday..Friday) from daily bars; d = first session of the week, last = last session */
function weekly(B) { const out = []; let cur = null, key = null;
  for (const b of B) { const t = new Date(b.d + "T00:00:00Z"), k = addDays(b.d, -((t.getUTCDay() + 6) % 7));
    if (k !== key) { cur = { d: b.d, o: b.o, h: b.h, l: b.l, c: b.c, a: b.a, v: b.v, last: b.d }; out.push(cur); key = k; } else { cur.h = Math.max(cur.h, b.h); cur.l = Math.min(cur.l, b.l); cur.c = b.c; cur.a = b.a; cur.v += b.v; cur.last = b.d; } }
  return out; }

const J = f => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const saveJ = (f, o, pretty) => { const p = path.join(DATA, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, pretty === false ? JSON.stringify(o) : JSON.stringify(o, null, 1)); };
const pct = (x, d = 1) => x == null || !isFinite(x) ? "—" : (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d) + "%";
const num = (x, d = 1) => x == null || !isFinite(x) ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toFixed(d);
const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;

module.exports = { DATA, RAW, fred, bars, stock, anyBars, universe, cboe, putCall, french49, french12, frenchTable, multpl, addDays, daysBetween, MON, nice, niceS, niceM,
  idxAtOrBefore, idxAtOrAfter, bi, bia, valueAt, sum, mean, sorted, quantile, median, stdev, corr, rng, rank, spearman, sma, ema, rollMax, rollMin, weekly, J, saveJ, pct, num, r1, r2 };
