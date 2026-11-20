// Market-drops study: chart-spec builders shared by the page modules.
const fs = require("fs"), path = require("path");
const L = require("./lib.js"), G = require("./sitegen.js");
const { pct, esc } = G;
const SPX = L.bars("^GSPC"), spxI = new Map(SPX.map((b, i) => [b.d, i]));
const CAT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
const tradeDay = (iso, n) => { const i = L.bi(SPX, iso); return SPX[Math.max(0, Math.min(SPX.length - 1, i + n))].d; };

/** events file → array (empty when the file is not written yet) */
function events(name) { const f = path.join(G.SITE, "events", name + ".json"); if (!fs.existsSync(f)) return []; try { return JSON.parse(fs.readFileSync(f, "utf8")).filter(e => e && e.d).sort((a, b) => (a.d < b.d ? -1 : 1)); } catch (e) { console.log("bad events file", name, e.message); return []; } }
/** the S&P 500's move on an event day and over the next sessions */
function evMove(d) { const i = L.bi(SPX, d); if (i < 1) return {}; const c = k => (i + k < SPX.length ? (SPX[i + k].c / SPX[i - 1].c - 1) * 100 : null); return { d0: c(0), d1: i + 1 < SPX.length ? (SPX[i + 1].c / SPX[i].c - 1) * 100 : null, d5: i + 5 < SPX.length ? (SPX[i + 5].c / SPX[i].c - 1) * 100 : null, on: SPX[i].d }; }
/** marks + the numbered list under a chart for the events inside [from, to] */
function evBlock(evs, from, to, opt = {}) {
  const inW = evs.filter(e => e.d >= from && e.d <= to), marks = inW.map((e, k) => ({ d: e.d, n: k + 1, c: e.cat === "Fed" ? CAT[6] : e.cat === "earnings" || e.cat === "AI" ? CAT[1] : e.cat === "technical" || e.cat === "positioning" ? "#55534e" : CAT[0] }));
  const li = inW.map((e, k) => { const m = evMove(e.d); return `<li><i style="background:${marks[k].c}">${k + 1}</i><span class="when">${L.nice(e.d)}</span><b>${esc(e.t)}</b><span class="cat">${esc(e.cat || "")}</span> <span class="mv">S&amp;P that day <b class="${G.sign(m.d0)}">${pct(m.d0)}</b>, next day <span class="${G.sign(m.d1)}">${pct(m.d1)}</span>, next five <span class="${G.sign(m.d5)}">${pct(m.d5)}</span></span>${e.how ? `<span class="how">${esc(e.how)}</span>` : ""}</li>`; }).join("");
  return { marks, list: inW.length ? `<details${opt.open ? " open" : ""}><summary>The numbered days (${inW.length})</summary><ol class="ev">${li}</ol></details>` : "" };
}
/** bands and markers for one S&P episode: failed rallies amber, the turn green, peak and low marked */
function epLayers(e, opt = {}) {
  const bands = [], marks = [{ d: e.peak, k: "high", t: `high ${L.niceS(e.peak)}` }];
  for (const r of e.rallies) { if (r.cls === "failed") bands.push({ from: r.low, to: r.top, c: "rally", t: `+${r.gain.toFixed(0)}%` }); else if (r.cls === "turn" && !e.open) bands.push({ from: r.low, to: r.top, c: "turn", t: opt.turnLabel === false ? "" : "the turn" }); }
  if (!e.open) marks.push({ d: e.low, k: "low", t: `low ${L.niceS(e.low)} (${pct(e.depth)})` }); else marks.push({ d: e.low, k: "low", t: `${pct(e.depth)} so far`, c: "#55534e" });
  return { bands, marks };
}
/** daily or weekly candle chart of an index/ETF/stock around an S&P episode */
function epSpec(site, sym, e, opt = {}) {
  const from = opt.from || tradeDay(e.peak, -(opt.before == null ? 90 : opt.before)), to = opt.to || tradeDay(e.end || e.low, opt.after == null ? 40 : opt.after);
  const Ly = opt.layers === false ? { bands: [], marks: [] } : epLayers(e, opt);
  const spec = { type: "candle", src: site.bars(sym, opt.tag || e.id, from, to, opt.tf === "W" ? 420 : 330), from, to, tf: opt.tf || "D", title: opt.title || sym, bands: (opt.bands || []).concat(opt.noBands ? [] : Ly.bands), marks: (opt.marks || []).concat(opt.noMarks ? [] : sym === "^GSPC" || opt.spxMarks ? Ly.marks : []), panels: opt.panels || [{ k: "vol" }] };
  for (const k of ["h", "log", "hlines", "rs", "focus", "pitch", "ma", "reveal", "anon"]) if (opt[k] != null) spec[k] = opt[k];
  if (spec.rs) spec.rs = site.bars(opt.rsSym || "^GSPC", (opt.tag || e.id), from, to, 30);
  return spec;
}
/** % from the peak close, by session number, for overlay charts */
function pathFromPeak(B, peakDate, n, before = 0) { const p = L.bi(B, peakDate), out = []; for (let k = -before; k <= n && p + k < B.length; k++) if (p + k >= 0) out.push([k, Math.round((B[p + k].c / B[p].c - 1) * 10000) / 100]); return out; }
/** % from a base date for a date-axis line */
function pathFromDate(B, from, to, key = "a") { const a = L.bia(B, from), z = L.bi(B, to), out = []; for (let i = a; i <= z; i++) out.push([B[i].d, Math.round((B[i][key] / B[a][key] - 1) * 10000) / 100]); return out; }
const weeklyCloses = (B, from, to) => L.weekly(B.filter(b => b.d >= from && b.d <= (to || "9999"))).map(w => [w.last, w.c]);

module.exports = { SPX, spxI, CAT, tradeDay, events, evMove, evBlock, epLayers, epSpec, pathFromPeak, pathFromDate, weeklyCloses };
