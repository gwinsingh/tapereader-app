/* SELECTION track — Section 1 & 2: instrument class, symbol concentration, re-trade attempts */
const L = require("./lib.js");

const INDEX_ETF = new Set(["SPY","QQQ","IWM","DIA"]);
const LEV_ETF   = new Set(["SOXL","SQQQ","TQQQ","SOXS","TNA","TZA","UVXY","SPXL","SPXS","LABU","FNGU"]);
const SECTOR_ETF= new Set(["XLE","IGV","SKHY","XLF","XLK","SMH"]);
// mega-cap = >$500B mkt cap US singles as of 2026
const MEGA = new Set(["AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","BRK.B",
                      "LLY","JPM","V","MA","NFLX","WMT","XOM","ORCL","COST","JNJ","PG","HD"]);

function cls(sym) {
  if (INDEX_ETF.has(sym)) return "index ETF";
  if (LEV_ETF.has(sym))   return "leveraged/vol ETF";
  if (SECTOR_ETF.has(sym))return "sector ETF";
  if (MEGA.has(sym))      return "mega-cap single";
  return "other stock";
}
L.live.forEach(t => t.cls = cls(t.sym));
L.practice.forEach(t => t.cls = cls(t.sym));

function classTable(T, name) {
  console.log(`\n### instrument class — ${name} (n=${T.length})`);
  const g = {}; T.forEach(t => (g[t.cls] ||= []).push(t));
  const order = ["index ETF","leveraged/vol ETF","sector ETF","mega-cap single","other stock"];
  order.filter(k => g[k]).forEach(k => {
    console.log("  " + L.st(g[k], k) + `  share=${L.pctf(g[k].length, T.length)}`);
  });
  return g;
}
const gl = classTable(L.live, "LIVE");
const gp = classTable(L.practice, "PRACTICE");

console.log("\n### mix shift practice -> live (share of trades)");
["index ETF","leveraged/vol ETF","sector ETF","mega-cap single","other stock"].forEach(k => {
  console.log(`  ${k.padEnd(20)} prac=${L.pctf((gp[k]||[]).length, L.practice.length).padStart(4)}  live=${L.pctf((gl[k]||[]).length, L.live.length).padStart(4)}`);
});

// ---- H2 / H3 on live ----
console.log("\n### H2 mega-cap single names underperform (LIVE only)");
const mega = L.live.filter(t => t.cls === "mega-cap single");
const nonmega = L.live.filter(t => t.cls !== "mega-cap single");
console.log("  " + L.st(mega, "mega-cap"));
console.log("  " + L.st(nonmega, "non-mega"));
console.log("  p=", L.f(L.permP(L.R(mega), L.R(nonmega)), 3));
console.log("  practice ref: " + L.st(L.practice.filter(t=>t.cls==="mega-cap single"), "prac mega"));
console.log("  live mega symbols:", mega.map(t=>t.sym).join(","));

console.log("\n### H3 index ETFs (SPY/QQQ) produce ~zero (LIVE only)");
const idx = L.live.filter(t => INDEX_ETF.has(t.sym));
const nonidx = L.live.filter(t => !INDEX_ETF.has(t.sym));
console.log("  " + L.st(idx, "index ETF"));
console.log("  " + L.st(nonidx, "non-index"));
console.log("  p=", L.f(L.permP(L.R(idx), L.R(nonidx)), 3));
console.log("  SPY only: " + L.st(L.live.filter(t=>t.sym==="SPY"), "SPY"));
console.log("  QQQ only: " + L.st(L.live.filter(t=>t.sym==="QQQ"), "QQQ"));
console.log("  practice ref: " + L.st(L.practice.filter(t=>INDEX_ETF.has(t.sym)), "prac index"));

// ---- concentration ----
console.log("\n### symbol concentration");
function conc(T, name) {
  const g = {}; T.forEach(t => (g[t.sym] ||= []).push(t));
  const s = Object.entries(g).sort((a,b)=>b[1].length-a[1].length);
  const tot = T.length;
  const top1 = s[0][1].length, top3 = s.slice(0,3).reduce((a,x)=>a+x[1].length,0),
        top5 = s.slice(0,5).reduce((a,x)=>a+x[1].length,0);
  console.log(`  ${name}: ${s.length} symbols over ${tot} trades. top1=${L.pctf(top1,tot)} top3=${L.pctf(top3,tot)} top5=${L.pctf(top5,tot)}`);
  const hhi = s.reduce((a,x)=>a+(x[1].length/tot)**2,0);
  console.log(`    HHI=${L.f(hhi,3)} (1/HHI = ${L.f(1/hhi,1)} effective symbols)`);
  s.filter(x=>x[1].length>=3).forEach(([k,v]) => console.log("    " + L.st(v, k)));
  return s;
}
conc(L.live, "LIVE"); conc(L.practice, "PRACTICE");

// ---- re-trade attempt within a symbol-day ----
console.log("\n### attempt # on the same symbol within a day");
function attempts(T, name) {
  const key = {}; const arr = [...T].sort((a,b)=> a.date===b.date ? a.t-b.t : (a.date<b.date?-1:1));
  arr.forEach(t => { const k = t.date+"|"+t.sym; key[k]=(key[k]||0)+1; t.att = key[k]; });
  console.log(`  -- ${name} --`);
  const b = {1:[],2:[],"3+":[]};
  arr.forEach(t => b[t.att===1?1:t.att===2?2:"3+"].push(t));
  Object.entries(b).forEach(([k,v]) => v.length && console.log("    " + L.st(v, "attempt "+k)));
  const first = b[1], later = [...b[2], ...b["3+"]];
  console.log("    " + L.st(later, "attempt 2+"));
  console.log("    p(1 vs 2+)=", L.f(L.permP(L.R(first), L.R(later)), 3));
  // conditional: did attempt-1 lose?
  const g = {}; arr.forEach(t => (g[t.date+"|"+t.sym] ||= []).push(t));
  const afterLoss = [], afterWin = [];
  Object.values(g).forEach(v => { for (let i=1;i<v.length;i++) (v[i-1].pnl<0?afterLoss:afterWin).push(v[i]); });
  console.log("    " + L.st(afterLoss, "re-entry after a loser"));
  console.log("    " + L.st(afterWin,  "re-entry after a winner"));
  // symbol-day level
  const sd = Object.values(g);
  const single = sd.filter(v=>v.length===1), multi = sd.filter(v=>v.length>1);
  console.log(`    symbol-days: ${sd.length} (single-attempt ${single.length}, multi ${multi.length})`);
  console.log(`    sumR on single-attempt symbol-days = ${L.f(L.sum(single.flat().map(t=>t.pnlR).filter(x=>!isNaN(x))),1)}`);
  console.log(`    sumR on multi-attempt  symbol-days = ${L.f(L.sum(multi.flat().map(t=>t.pnlR).filter(x=>!isNaN(x))),1)}`);
}
attempts(L.live, "LIVE"); attempts(L.practice, "PRACTICE");
