// Market-drops study: the small framework the page modules use (page builder, chart-data registry, HTML helpers).
const fs = require("fs"), path = require("path");
const L = require("./lib.js");
const OUT = process.env.OUT || path.join(__dirname, "..", "..", "web", "public", "studies", "market-drops");
const SITE = path.join(__dirname, "site");
const BASE = process.env.BASE_PATH || "/studies/market-drops/";      // every page carries <base href>, so links work with or without a trailing slash in the address
const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safe = s => s.replace(/[\^]/g, "_").replace(/[^A-Za-z0-9_.-]/g, "-");
const pct = (x, d = 1) => (x == null || !isFinite(x) ? "—" : (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d) + "%");
const num = (x, d = 1) => (x == null || !isFinite(x) ? "—" : (x < 0 ? "−" : "") + Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
const mag = (x, d = 1) => (x == null || !isFinite(x) ? "—" : Math.abs(x).toFixed(d) + "%");       // size without a sign, for "fell 19.8%"
const sign = x => (x == null || !isFinite(x) ? "" : x > 0 ? "pos" : x < 0 ? "neg" : "");

const NAV = [
  ["Start", [["index", "Start here"], ["now", "Autumn 2026: the drop so far"]]],
  ["2018", [["y2018", "2018, day by day"], ["y2018-turn", "How 2018 bottomed and turned"], ["compare", "Now against 2018"]]],
  ["The big bears", [["bears", "2000–02 and 2007–09"], ["ai-dotcom", "The AI boom against the dot-com bubble"], ["scenarios", "Correction or bear: two paths"]]],
  ["All drops", [["atlas", "Every drop since 1950"], ["lookalike", "Do look-alike charts mean anything?"]]],
  ["The turn", [["bounces", "Failed pops and the real turn"], ["bottoms", "Signs at the low"], ["gauges", "Hand-kept breadth gauges, tested"], ["filters", "Moving averages as a filter"], ["news", "Reaction to news"]]],
  ["What leads", [["sectors", "Sectors and themes"], ["leaders", "The stocks that led"]]],
  ["Under the surface", [["leverage", "Leverage and positioning"], ["intraday", "The shape of the day"], ["fundamentals", "Earnings, rates and credit"]]],
  ["Practice and reference", [["drills", "Train the eye"], ["glossary", "Glossary"], ["method", "Method, data and limits"], ["sources", "Research notes and sources"]]],
];
const ORDER = NAV.flatMap(g => g[1].map(p => p[0])), TITLE = Object.fromEntries(NAV.flatMap(g => g[1]));

class Site {
  constructor(asOf) { this.asOf = asOf; this.px = {}; this.ser = {}; this.pages = {}; this.missing = []; }
  /** register a window of daily bars for the charts; returns the data key ("px/<file>") */
  bars(sym, tag, from, to, pad = 330) {
    const key = safe(sym) + (tag ? "-" + tag : ""), f = L.addDays(from, -pad), cur = this.px[key];
    this.px[key] = { sym, from: cur && cur.from < f ? cur.from : f, to: cur && cur.to > (to || "9999") ? cur.to : (to || "9999") };
    return "px/" + key;
  }
  /** register a date series {d:[iso], <key>:[values]...} */
  series(name, obj) { this.ser[name] = obj; return "ser/" + name; }
  page(slug) { const p = new Page(this, slug); this.pages[slug] = p; return p; }
  write() {
    const dData = path.join(OUT, "data"); for (const d of ["px", "ser", "pg"]) fs.mkdirSync(path.join(dData, d), { recursive: true });
    fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
    let bytes = 0, files = 0; const put = (f, s) => { const p = path.join(OUT, f); if (!fs.existsSync(p) || fs.readFileSync(p, "utf8") !== s) fs.writeFileSync(p, s); bytes += Buffer.byteLength(s); files++; return f; };
    const keep = new Set();
    for (const [key, w] of Object.entries(this.px)) { const B = L.anyBars(w.sym); if (!B) { this.missing.push("bars " + w.sym); continue; } const a = L.bia(B, w.from), z = L.bi(B, w.to), S = B.slice(a, z + 1); if (!S.length) continue;
      const p = x => +x.toPrecision(6), dd = S.map((b, i) => (i ? L.daysBetween(S[i - 1].d, b.d) : 0)), vs = S.map(b => b.v), big = Math.max(...vs) > 5e6;
      keep.add(put(`data/px/${key}.json`, JSON.stringify({ s: w.sym, t0: S[0].d, dd, o: S.map(b => p(b.o)), h: S.map(b => p(b.h)), l: S.map(b => p(b.l)), c: S.map(b => p(b.c)), v: vs.map(v => (big ? Math.round(v / 1000) : v)) }))); }
    for (const [name, o] of Object.entries(this.ser)) { const { d, ...rest } = o, dd = d.map((x, i) => (i ? L.daysBetween(d[i - 1], x) : 0)); keep.add(put(`data/ser/${name}.json`, JSON.stringify({ t0: d[0], dd, ...rest }))); }
    for (const p of Object.values(this.pages)) { keep.add(put(`data/pg/${p.slug}.json`, JSON.stringify(p.specs))); keep.add(put(`${p.slug}.html`, p.render())); }
    for (const f of fs.readdirSync(path.join(SITE, "assets"))) keep.add(put(`assets/${f}`, fs.readFileSync(path.join(SITE, "assets", f), "utf8")));
    // remove files a previous build wrote and this one did not
    const walk = d => fs.readdirSync(path.join(OUT, d), { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(d ? d + "/" + e.name : e.name) : [d ? d + "/" + e.name : e.name])); let gone = 0;
    for (const f of walk("")) if (!keep.has(f)) { fs.unlinkSync(path.join(OUT, f)); gone++; }
    return { files, bytes, gone, out: OUT };
  }
}

class Page {
  constructor(site, slug) { this.site = site; this.slug = slug; this.title = TITLE[slug] || slug; this.parts = []; this.specs = {}; this.n = 0; this.toc = []; this.lede = ""; }
  h(html) { this.parts.push(html); return this; }
  /** a section heading that also goes into the page's table of contents */
  sec(id, title, lead) { this.toc.push([id, title]); this.parts.push(`<h2 id="${id}">${title}</h2>` + (lead ? `<p class="lead">${lead}</p>` : "")); return this; }
  /** add a chart. spec is a charts.js spec; opt: {title, cap, note, after (html below the chart)} */
  fig(spec, opt = {}) { const id = "c" + (++this.n); this.specs[id] = spec;
    this.parts.push(`<figure class="fig${opt.cls ? " " + opt.cls : ""}">${opt.title ? `<figcaption><b>${opt.title}</b>${opt.cap ? " " + opt.cap : ""}</figcaption>` : ""}<div data-chart="${id}" class="md-host" style="min-height:${opt.minH || 300}px"></div>${opt.note ? `<p class="fignote">${opt.note}</p>` : ""}${opt.after || ""}</figure>`); return this; }
  /** a narrative fragment written to site/content/<name>.html; headings inside it join the table of contents */
  frag(name, only) { const f = path.join(SITE, "content", name + ".html"); if (!fs.existsSync(f)) { this.site.missing.push("fragment " + name); return this; }
    let t = fs.readFileSync(f, "utf8").replace(/<!--\s*CHART:[\s\S]*?-->/g, "");
    if (only) { const want = [].concat(only), secs = t.split(/(?=<section id=")/).filter(x => want.some(id => x.startsWith(`<section id="${id}"`))); if (!secs.length) { this.site.missing.push(`section ${want.join(",")} of ${name}`); return this; } t = secs.join("\n"); }
    for (const m of t.matchAll(/<section id="([^"]+)">\s*<h2>([\s\S]*?)<\/h2>/g)) this.toc.push([m[1], m[2].replace(/<[^>]+>/g, "")]);
    t = t.split('href="#').join(`href="${this.slug}.html#`);
    this.parts.push(t.replace(/<section id="([^"]+)">\s*<h2>/g, '<section><h2 id="$1">')); return this; }
  render() {
    const i = ORDER.indexOf(this.slug), prev = ORDER[i - 1], next = ORDER[i + 1];
    const nav = NAV.map(([g, ps]) => `<div class="navg"><div class="navt">${g}</div>${ps.map(([s, t]) => `<a href="${s}.html" data-slug="${s}"${s === this.slug ? ' class="on"' : ""}>${t}</a>`).join("")}</div>`).join("");
    const toc = this.toc.length > 2 ? `<nav class="toc"><b>On this page</b>${this.toc.map(([id, t]) => `<a href="${this.slug}.html#${id}">${t}</a>`).join("")}</nav>` : "";
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${BASE}"><meta name="robots" content="noindex"><title>${esc(this.title.replace(/<[^>]+>/g, ""))} · Anatomy of a Drop</title>
<link rel="stylesheet" href="assets/site.css"></head>
<body data-page="${this.slug}">
<header class="top"><button id="menu" aria-label="Pages">☰</button><a class="brand" href="index.html">Anatomy of a Drop</a><span class="asof">data to ${L.nice(this.site.asOf)}</span></header>
<aside class="side" id="side">${nav}<p class="sidenote">A historical study, not advice. Nothing here says what to buy or sell.</p></aside>
<main><article>
<h1>${this.title}</h1>${this.lede ? `<p class="lede">${this.lede}</p>` : ""}${toc}
${this.parts.join("\n")}
<div class="pager">${prev ? `<a href="${prev}.html">← ${TITLE[prev]}</a>` : "<span></span>"}<label class="done"><input type="checkbox" id="studied"> studied this page</label>${next ? `<a href="${next}.html">${TITLE[next]} →</a>` : "<span></span>"}</div>
</article></main>
<script src="assets/charts.js"></script><script src="assets/app.js"></script>
</body></html>`;
  }
}

// ---- HTML helpers ----
/** table: head = ["Name", {t:"Fall", num:true}, ...], rows = arrays of cells; a cell may be {v, cls, raw} */
function tbl(head, rows, opt = {}) {
  const H = head.map(h => (typeof h === "string" ? { t: h } : h));
  const th = H.map(h => `<th${h.num ? ' class="num"' : ""}${h.tip ? ` title="${esc(h.tip)}"` : ""}>${h.t}</th>`).join("");
  const tr = rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map((c, i) => { const o = c != null && typeof c === "object" ? c : { v: c }; const cls = [(H[i] || {}).num ? "num" : "", o.cls || ""].filter(Boolean).join(" "); return `<td${cls ? ` class="${cls}"` : ""}${o.bar != null ? ` style="--b:${Math.max(0, Math.min(100, o.bar)).toFixed(0)}%"` : ""}>${o.v == null ? "—" : o.v}</td>`; }).join("")}</tr>`).join("");
  return `<div class="scroll"><table class="t${opt.cls ? " " + opt.cls : ""}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>${opt.note ? `<p class="fignote">${opt.note}</p>` : ""}`;
}
const P = (x, d = 1) => ({ v: pct(x, d), cls: sign(x) });                         // a signed % cell
/** a signed % cell with a bar behind it; scale = the value that fills the cell */
const PB = (x, scale, d = 1) => ({ v: pct(x, d), cls: sign(x) + (x < 0 ? " barn" : " barp"), bar: x == null ? 0 : Math.abs(x) / scale * 100 });
const tiles = a => `<div class="tiles">${a.map(([b, s, c]) => `<div class="tile"><b${c ? ` class="${c}"` : ""}>${b}</b><span>${s}</span></div>`).join("")}</div>`;
const take = (items, title = "What to take from it") => `<div class="take"><b>${title}</b><ul>${items.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
const warn = (html, title = "Limits") => `<div class="warn"><b>${title}</b> ${html}</div>`;
const ul = items => `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`;
const link = (slug, text, hash) => `<a href="${slug}.html${hash ? "#" + hash : ""}">${text || TITLE[slug]}</a>`;

module.exports = { Site, Page, NAV, ORDER, TITLE, OUT, SITE, esc, pct, mag, num, sign, tbl, P, PB, tiles, take, warn, ul, link, safe };
