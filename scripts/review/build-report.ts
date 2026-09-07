/**
 * Assemble web/data/reviews/<month>.json from the corrected sheet.
 *
 * Scorecard and charts are computed here (deterministic, no judgement). Narrative parts
 * — verdict, findings, hypothesis register, targets — are merged from a hand-authored
 * narrative file so the analysis and the rendering stay separable.
 *
 *   node --experimental-strip-types scripts/review/build-report.ts [--tab=NAME] [--month=YYYY-MM]
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");

const arg = (k: string, d: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const TAB = arg("tab", "WIP-U16632046-GURI");
const MONTH = arg("month", "2026-08");
const OUT = path.join(process.cwd(), "web/data/reviews", `${MONTH}.json`);
const NARRATIVE = path.join(process.cwd(), "scripts/review", `narrative-${MONTH}.json`);

const num = (s: any) => { if (s == null || s === "") return NaN;
  const t = String(s).replace(/[$,%\s]/g, ""); return (t === "" || t === "N/A") ? NaN : parseFloat(t); };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const mean = (a: number[]) => (a.length ? sum(a) / a.length : NaN);
const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const got: any = await (await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SPREADSHEET_ID}/values/${encodeURIComponent(TAB)}!A1:DZ400`,
    { headers: H })).json();
  const hdr: string[] = got.values[0]; const I: Record<string, number> = {};
  hdr.forEach((h, i) => I[h] = i);
  const T = got.values.slice(1)
    .filter((x: string[]) => (x[0] || "").trim() && (x[1] || "").trim())
    .map((x: string[]) => ({
      date: x[0], sym: x[1], entry: x[2], dur: num(x[I["Duration (mins)"]]),
      pnl: num(x[I["P&L"]]), risk: num(x[I["Initial Risk ($)"]]) || num(x[I["R (Risk)"]]),
      pnlR: num(x[I["P&L (R)"]]), peak: num(x[I["Peak Position Value ($)"]]),
      nEnt: num(x[I["# Entries"]]), proc: (x[I["Process Followed?"]] || "").trim(),
      setup: (x[I["Setup"]] || "").trim(),
    }))
    .filter((t: any) => !isNaN(t.pnl));

  const R = T.map((t: any) => t.pnlR).filter((x: number) => !isNaN(x));
  const days = [...new Set(T.map((t: any) => t.date))].sort();
  const dayR = days.map((d) => ({
    d, r: sum(T.filter((t: any) => t.date === d).map((t: any) => t.pnlR).filter((x: number) => !isNaN(x))),
    n: T.filter((t: any) => t.date === d).length,
  }));
  let cum = 0;
  const equity = dayR.map((x) => ({ x: x.d.slice(5), y: r1((cum += x.r)), meta: `${x.n} trades` }));

  const wins = T.filter((t: any) => t.pnl > 0);
  const cap = T.filter((t: any) => !isNaN(t.peak) && t.peak > 0);
  const labeled = T.filter((t: any) => t.proc === "Yes" || t.proc === "No");
  const posMFE = (t: any) => t.peak / t.risk;

  const bucket = (v: number) =>
    v <= -1 ? "≤−1" : v < -0.5 ? "−1..−0.5" : v < 0 ? "−0.5..0" : v < 1 ? "0..1" : v < 2 ? "1..2" : v < 3 ? "2..3" : "3+";
  const order = ["≤−1", "−1..−0.5", "−0.5..0", "0..1", "1..2", "2..3", "3+"];
  const hist: Record<string, number> = {};
  R.forEach((v) => { const b = bucket(v); hist[b] = (hist[b] || 0) + 1; });

  const durBuckets: [string, (t: any) => boolean][] = [
    ["<2m", (t) => t.dur < 2], ["2-5m", (t) => t.dur >= 2 && t.dur < 5],
    ["5-15m", (t) => t.dur >= 5 && t.dur < 15], ["15m+", (t) => t.dur >= 15],
  ];
  const addDist: Record<number, number> = {};
  T.forEach((t: any) => { if (!isNaN(t.nEnt)) addDist[t.nEnt] = (addDist[t.nEnt] || 0) + 1; });

  const scorecard = [
    { key: "sumR", label: "Net R", value: r1(sum(R)), unit: "R", n: R.length },
    { key: "expR", label: "Expectancy", value: r2(mean(R)), unit: "R", n: R.length },
    { key: "winRate", label: "Win rate", value: Math.round(wins.length / T.length * 100), unit: "pct", n: T.length },
    { key: "tradesPerSession", label: "Trades / session", value: r1(T.length / days.length), unit: "ratio", inverse: true, n: days.length },
    { key: "grossPnl", label: "Gross P&L", value: r2(sum(T.map((t: any) => t.pnl))), unit: "$" },
    { key: "payoff", label: "Payoff ratio", unit: "ratio", value: (() => {
      const w = wins.map((t: any) => t.pnlR).filter((v: number) => !isNaN(v));
      const l = T.filter((t: any) => t.pnl <= 0).map((t: any) => t.pnlR).filter((v: number) => !isNaN(v));
      if (!w.length || !l.length || mean(l) === 0) return null;
      return r2(Math.abs(mean(w) / mean(l)));
    })() },
    { key: "captureOfPeak", label: "Capture of peak", value: Math.round(sum(cap.map((t: any) => t.pnl)) / sum(cap.map((t: any) => t.peak)) * 100), unit: "pct", n: cap.length, note: "position-aware" },
    { key: "addRate", label: "Add rate", value: Math.round(T.filter((t: any) => t.nEnt > 1).length / T.length * 100), unit: "pct", n: T.length },
    { key: "disciplinePct", label: "Process followed", value: labeled.length ? Math.round(labeled.filter((t: any) => t.proc === "Yes").length / labeled.length * 100) : null, unit: "pct", n: labeled.length },
    { key: "maxDrawdownR", label: "Max drawdown", value: r1(Math.min(...equity.map((e, i) => e.y - Math.max(...equity.slice(0, i + 1).map((z) => z.y))))), unit: "R", inverse: true },
    { key: "reach25", label: "Reached 2.5R", value: cap.length ? Math.round(cap.filter((t: any) => posMFE(t) >= 2.5).length / cap.length * 100) : null, unit: "pct", n: cap.length },
    { key: "sessions", label: "Sessions", value: days.length, unit: "count" },
  ];

  const charts = {
    equityR: { label: "Cumulative R by session", points: equity },
    dailyR: { label: "R per session", points: dayR.map((x) => ({ x: x.d.slice(5), y: r1(x.r), meta: `${x.n} trades` })) },
    mfeVsRealized: { label: "Offered vs realized",
      points: cap.map((t: any) => ({ x: r2(posMFE(t)), y: r2(t.pnlR), meta: `${t.date} ${t.sym}` })) },
    rMultiples: { label: "R-multiple distribution", points: order.filter((b) => hist[b]).map((b) => ({ x: b, y: hist[b] })) },
    holdTime: { label: "Expectancy by hold time (R)",
      points: durBuckets.map(([l, fn]) => { const a = T.filter(fn); return { x: l, y: r2(mean(a.map((t: any) => t.pnlR).filter((v: number) => !isNaN(v))) || 0), meta: `n=${a.length}` }; }) },
    addLadder: { label: "Trades by number of entries",
      points: Object.keys(addDist).sort().map((k) => ({ x: `${k} entr${k === "1" ? "y" : "ies"}`, y: addDist[+k],
        meta: `${r1(sum(T.filter((t: any) => t.nEnt === +k).map((t: any) => t.pnlR).filter((v: number) => !isNaN(v))))}R` })) },
  };

  const narrative = fs.existsSync(NARRATIVE) ? JSON.parse(fs.readFileSync(NARRATIVE, "utf8")) : {};
  const report = {
    month: MONTH,
    label: new Date(`${MONTH}-01T12:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
    account: TAB.replace(/^WIP-/, ""),
    period: { start: days[0], end: days[days.length - 1], sessions: days.length, trades: T.length },
    verdict: narrative.verdict ?? "",
    headline: narrative.headline ?? [],
    scorecard,
    charts,
    hypotheses: narrative.hypotheses ?? [],
    findings: narrative.findings ?? [],
    targets: narrative.targets ?? [],
    testsExamined: narrative.testsExamined ?? 0,
    caveats: narrative.caveats ?? [],
    generatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(`wrote ${OUT}`);
  console.log(`  ${report.period.trades} trades / ${report.period.sessions} sessions, net ${scorecard[0].value}R`);
  console.log(`  narrative: ${fs.existsSync(NARRATIVE) ? "merged from " + path.basename(NARRATIVE) : "NOT FOUND — run the analysis and author it"}`);
})();
