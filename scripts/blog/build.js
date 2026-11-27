#!/usr/bin/env node
// Builds the blog: scripts/blog/posts/*.md → static pages in web/public/blog/ (served at tapereader.us/blog).
//   node scripts/blog/build.js            build (drafts left out)
//   node scripts/blog/build.js --drafts   include posts marked draft: true (for local preview only)
// Plain Node, no install step: the Markdown parser is vendored in vendor/marked.min.js.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { marked } = require("./vendor/marked.min.js");
const fig = require("./lib/figures");
const { ROOT, loadSite, loadPosts, seriesOrder, fmtDate, collectionId, shortTitle } = require("./lib/posts");

const OUT = path.join(ROOT, "..", "..", "web", "public", "blog");
const args = process.argv.slice(2);
const site = loadSite();
const BASE = site.base;
const esc = fig.esc;
const problems = [];

const posts = loadPosts({ drafts: args.indexOf("--drafts") >= 0 });
const bySlug = {};
posts.forEach((p) => { if (bySlug[p.slug]) problems.push(`two posts share the slug "${p.slug}"`); bySlug[p.slug] = p; });
if (bySlug.archive) problems.push('a post has the slug "archive", which is the address of the list of all notes');

// collections (the shelf on the home page): every published post sits in exactly one
const colById = {};
site.collections.forEach((c) => { colById[c.id] = c; c.posts = []; });
posts.forEach((p) => {
  const id = collectionId(site, p);
  p.col = colById[id] || null;
  if (id && !p.col) problems.push(`${p.file}: collection "${id}" is not listed in site.json (under "collections")`);
  else if (!p.col && !p.draft) problems.push(`${p.file}: no collection (add "collection: <id>" to the front matter; the ids are in site.json)`);
  if (p.col) p.col.posts.push(p);
});
const shelf = site.collections.filter((c) => c.posts.length);

// ---------------------------------------------------------------- Markdown
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
let ctx = null;
const CALLOUT = { take: "What to take from it", warn: "Limits", define: "In plain words", test: "A test worth running", note: "Note" };

marked.use({
  renderer: {
    heading(text, level, raw) {
      let id = slugify(raw) || "section";
      while (ctx.ids[id]) id += "-2";
      ctx.ids[id] = 1;
      if (level === 2) ctx.toc.push({ id, text: text.replace(/<[^>]+>/g, "") });
      return `<h${level} id="${id}">${text}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>\n`;
    },
    code(code, lang) {
      if (lang !== "figure") return false;
      let spec;
      try { spec = JSON.parse(code); } catch (e) { problems.push(`${ctx.file}: figure ${ctx.figs + 1} is not valid JSON (${e.message})`); return ""; }
      ctx.figs += 1;
      try { return fig.render(spec, ctx.figs) + "\n"; } catch (e) { problems.push(`${ctx.file}: figure ${ctx.figs}: ${e.message}`); return ""; }
    },
    blockquote(quote) {
      const m = /^\s*<p>\[!(\w+)\][ \t]*([^\n<]*)(\n|<\/p>)/.exec(quote);
      if (!m) return false;
      const type = CALLOUT[m[1]] ? m[1] : "note";
      const rest = quote.slice(m[0].length);
      const body = m[3] === "\n" ? "<p>" + rest : rest;
      return `<aside class="callout ${type}"><div class="ct">${m[2].trim() || CALLOUT[type]}</div>${body}</aside>\n`;
    },
    link(href, title, text) {
      const ext = /^https?:\/\//.test(href);
      if (!ext && href.indexOf(BASE + "/") === 0) ctx.links.push(href);
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
    },
    table(header, body) {
      return `<div class="scroll"><table class="t"><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});

function renderBody(p) {
  ctx = { file: p.file, toc: [], ids: {}, figs: 0, links: [] };
  let html = marked.parse(p.body, { gfm: true, smartypants: true, headerIds: false, mangle: false });
  if (/<!--\s*FIGURE/.test(html)) problems.push(`${p.file}: a FIGURE placeholder is left in the text (turn it into a \`\`\`figure block)`);
  // numeric table cells right-aligned: a cell holding only a number, percent or money amount
  html = html.replace(/<td>(\s*[+−-]?[$£€]?\d[\d,.]*\s?(?:%|x|bn|m|k|pp)?\s*)<\/td>/g, '<td class="num">$1</td>');
  const out = { html, toc: ctx.toc, figs: ctx.figs, links: ctx.links };
  ctx = null;
  return out;
}

// ---------------------------------------------------------------- shell
const assetHash = crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, "site/assets/blog.css"))).update(fs.readFileSync(path.join(ROOT, "site/assets/blog.js"))).digest("hex").slice(0, 8);
const url = (p) => BASE + (p ? "/" + p : "");
const tagLink = (t) => `<a class="tag" href="${url("tags/" + t)}">${esc(t)}</a>`;

function page(o) {
  const canonical = site.url + o.path;
  const nav = [["Collections", url(""), "home"], ["All notes", url("archive"), "archive"], ["Tags", url("tags"), "tags"]]
    .map((n) => `<a href="${n[1]}"${o.nav === n[2] ? ' aria-current="page"' : ""}>${n[0]}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}${o.path === BASE ? "" : " · " + esc(site.title)}</title>
<meta name="description" content="${esc(o.description || site.description)}">
${site.index ? "" : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description || site.description)}">
<meta property="og:type" content="${o.article ? "article" : "website"}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(site.title)}">
<meta name="twitter:card" content="summary">
<link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${url("feed.xml")}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){try{var t=localStorage.getItem("blog-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()</script>
<link rel="stylesheet" href="${url("assets/blog.css")}?v=${assetHash}">
</head>
<body class="${o.cls || ""}">
<a class="skip" href="#main">Skip to the text</a>
<header class="top"><div class="wrap">
  <a class="brand" href="${url("")}"><b>${esc(site.wordmark)}</b><span>${esc(site.section)}</span></a>
  <nav aria-label="Sections">${nav}</nav>
  <button class="theme" type="button" aria-label="Switch between light and dark" title="Light / dark"><span></span></button>
</div></header>
<main id="main">
${o.body}
</main>
<footer class="foot"><div class="wrap">
  <p>${esc(site.disclaimer)}</p>
  <p><a href="${url("")}">Collections</a> · <a href="${url("archive")}">All notes</a> · <a href="${url("tags")}">Tags</a> · <a href="${url("feed.xml")}">RSS</a> · <a href="/">tapereader.us</a></p>
</div></footer>
<div id="tip" role="tooltip" hidden></div>
<script src="${url("assets/blog.js")}?v=${assetHash}" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- pieces
const colUrl = (c) => (c.series ? url("series/" + c.series) : url("collections/" + c.id));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;

function postRow(p, inCollection) {
  const c = inCollection ? null : p.col;
  return `<article class="row" data-tags="${esc(p.tags.join(" "))}">
  <time datetime="${p.date}">${p.dateText}</time>
  <div>
    <h3><a href="${url(p.slug)}">${esc(p.title)}</a>${p.link ? '<span class="badge">Full study</span>' : ""}</h3>
    <p>${esc(p.summary)}</p>
    <div class="meta">${p.tags.map(tagLink).join("")}<span>${p.link ? "multi-page study" : p.minutes + " min read"}</span>${c ? `<span>In: <a href="${colUrl(c)}">${esc(c.title)}</a></span>` : ""}</div>
  </div>
</article>`;
}

function rowsByYear(list) {
  let out = "", year = "";
  list.forEach((p) => {
    const y = p.date.slice(0, 4);
    if (y !== year) { out += `${year ? "</section>" : ""}<section class="year"><h2>${y}</h2>`; year = y; }
    out += postRow(p);
  });
  return out + (year ? "</section>" : "");
}

function seriesStats(s) {
  const order = seriesOrder(s);
  const done = order.filter((slug) => bySlug[slug]);
  const members = [].concat.apply([], s.groups.map((g) => g.members));
  return { order, done, total: order.length, members: members.length, membersDone: members.filter((m) => bySlug[m.post]).length };
}

// One card of the shelf: what the collection is, how much of it exists, and its three newest notes.
function shelfCard(c) {
  const s = c.series && site.series[c.series];
  let prog = "";
  if (s) {
    const st = seriesStats(s);
    prog = `<div class="prog" role="img" aria-label="${st.done.length} of ${st.total} parts published"><i style="width:${Math.max(2, (st.done.length / st.total) * 100).toFixed(1)}%"></i></div>
  <p class="cmeta">${st.done.length} of ${st.total} parts published · ${st.membersDone} of ${st.members} profiles · updated ${c.posts[0].dateText}</p>`;
  } else prog = `<p class="cmeta">${plural(c.posts.length, "note")} · updated ${c.posts[0].dateText}</p>`;
  return `<article class="ccard">
  <p class="kicker">${s ? "Series, read in order" : "Collection"}</p>
  <h3><a href="${colUrl(c)}">${esc(c.title)}</a></h3>
  <p class="csum">${esc(c.summary)}</p>
  ${prog}
  <ul class="clist">${c.posts.slice(0, 3).map((p) => `<li><a href="${url(p.slug)}">${esc(shortTitle(p))}</a><time datetime="${p.date}">${p.dateText.replace(/ \d{4}$/, "")}</time></li>`).join("")}</ul>
  <a class="call" href="${colUrl(c)}">${s ? "The map and all " + c.posts.length + " notes" : c.posts.length > 3 ? "All " + c.posts.length + " notes" : "Open the collection"}<span>→</span></a>
</article>`;
}

// The newest work, one line per collection and day, so a batch of series parts does not fill the page.
function latestLines(max) {
  const groups = [], byKey = {};
  posts.forEach((p) => {
    const k = p.date + "|" + (p.col ? p.col.id : p.slug);
    if (!byKey[k]) { byKey[k] = { date: p.date, dateText: p.dateText, col: p.col, posts: [] }; groups.push(byKey[k]); }
    byKey[k].posts.push(p);
  });
  return groups.slice(0, max).map((g) => {
    const links = g.posts.map((p) => `<a href="${url(p.slug)}">${esc(g.posts.length > 1 ? shortTitle(p) : p.title)}</a>`);
    const list = links.length > 1 ? links.slice(0, -1).join(", ") + " and " + links[links.length - 1] : links[0];
    const lead = g.posts.length > 1 ? `<span>${g.posts.length} new ${g.col && g.col.series ? "parts" : "notes"}:</span> ` : "";
    return `<li><time datetime="${g.date}">${g.dateText}</time><div>${g.col ? `<a class="lc" href="${colUrl(g.col)}">${esc(g.col.title)}</a>` : ""}<p>${lead}${list}</p></div></li>`;
  }).join("");
}

// ---------------------------------------------------------------- pages
const out = {};
const rendered = {};
posts.forEach((p) => { rendered[p.slug] = renderBody(p); });

// index
(function () {
  const counts = {};
  posts.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const chips = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const body = `<div class="wrap">
<section class="hero">
  <h1>${esc(site.section)}</h1>
  <p class="lede">${esc(site.lede)}</p>
  <p class="status"><b>Work in development</b>${esc(site.status)}</p>
</section>
<h2 class="sect">Collections</h2>
<section class="shelf">${shelf.map(shelfCard).join("")}</section>
<h2 class="sect">Latest</h2>
<ol class="lat">${latestLines(8)}</ol>
<p class="allnotes"><a href="${url("archive")}">All ${posts.length} notes by date<span>→</span></a></p>
</div>`;
  out["index.html"] = page({ title: site.title, path: BASE, body, nav: "home", cls: "home" });
  out["archive.html"] = page({
    title: "All notes", path: url("archive"), nav: "archive", description: "Every note on the site, newest first.",
    body: `<div class="wrap">
<section class="hero small"><h1>All notes</h1><p class="lede">Every note, newest first. The tags narrow the list; the <a href="${url("")}">collections</a> group the same notes by project.</p></section>
<section class="list">
  <div class="filter" role="group" aria-label="Filter by tag"><button type="button" class="chip on" data-tag="">All <i>${posts.length}</i></button>${chips.map((t) => `<button type="button" class="chip" data-tag="${esc(t)}" title="${esc(site.tags[t] || "")}">${esc(t)} <i>${counts[t]}</i></button>`).join("")}</div>
  ${rowsByYear(posts)}
  <p class="empty" hidden>No notes carry this tag yet.</p>
</section>
</div>`,
  });
})();

// tags
(function () {
  const map = {};
  posts.forEach((p) => p.tags.forEach((t) => { (map[t] = map[t] || []).push(p); }));
  const tags = Object.keys(map).sort();
  tags.forEach((t) => { if (!site.tags[t]) problems.push(`tag "${t}" is not described in site.json (add it under "tags")`); });
  out["tags.html"] = page({
    title: "Tags", path: url("tags"), nav: "tags",
    body: `<div class="wrap narrow"><section class="hero small"><h1>Tags</h1><p class="lede">Every note carries tags for the kind of work it is and the subject it covers.</p></section><ul class="taglist">${tags.map((t) => `<li><a class="tag big" href="${url("tags/" + t)}">${esc(t)}</a><span>${esc(site.tags[t] || "")}</span><i>${map[t].length}</i></li>`).join("")}</ul></div>`,
  });
  tags.forEach((t) => {
    out[`tags/${t}.html`] = page({
      title: `Notes tagged ${t}`, path: url("tags/" + t), nav: "tags", description: site.tags[t],
      body: `<div class="wrap"><section class="hero small"><p class="kicker"><a href="${url("tags")}">Tags</a></p><h1>${esc(t)}</h1><p class="lede">${esc(site.tags[t] || "")}</p></section><section class="list">${rowsByYear(map[t])}</section></div>`,
    });
  });
})();

// collections that are not a series: one page listing their notes
shelf.filter((c) => !c.series).forEach((c) => {
  out[`collections/${c.id}.html`] = page({
    title: c.title, path: url("collections/" + c.id), nav: "home", description: c.summary,
    body: `<div class="wrap"><section class="hero small"><p class="kicker"><a href="${url("")}">Collections</a></p><h1>${esc(c.title)}</h1><p class="lede">${esc(c.summary)}</p><p class="progtext">${plural(c.posts.length, "note")} · updated ${c.posts[0].dateText}</p></section><section class="list">${c.posts.map((p) => postRow(p, true)).join("")}</section></div>`,
  });
});

// series
Object.keys(site.series).forEach((id) => {
  const s = site.series[id], st = seriesStats(s);
  const groups = s.groups.map((g) => {
    const primer = bySlug[g.primer];
    const members = g.members.map((m) => {
      const p = bySlug[m.post];
      return `<li class="${p ? "done" : "todo"}">${p ? `<a href="${url(p.slug)}">${esc(m.name)}</a>` : `<span>${esc(m.name)}</span>`}<small>${p ? p.dateText : m.depth === "full" ? "planned · full profile" : "planned · short profile"}</small></li>`;
    }).join("");
    return `<section class="group" id="${g.id}">
  <h3>${esc(g.title)}</h3>
  <p>${esc(g.blurb)}</p>
  <div class="primer ${primer ? "done" : "todo"}">${primer ? `<a href="${url(primer.slug)}">Primer: ${esc(primer.title)}</a>` : "<span>Primer: planned</span>"}</div>
  <ul>${members}</ul>
</section>`;
  }).join("");
  const published = st.order.filter((slug) => bySlug[slug]).map((slug) => bySlug[slug]).concat(posts.filter((p) => p.series === id && st.order.indexOf(p.slug) < 0));
  const body = `<div class="wrap">
<section class="hero small">
  <p class="kicker"><a href="${url("")}">Collections</a> <span>›</span> Series</p>
  <h1>${esc(s.title)}</h1>
  ${s.intro.map((t, i) => `<p class="${i ? "" : "lede"}">${esc(t)}</p>`).join("")}
  <div class="prog wide" role="img" aria-label="${st.done.length} of ${st.total} parts published"><i style="width:${Math.max(1, (st.done.length / st.total) * 100).toFixed(1)}%"></i></div>
  <p class="progtext">${st.done.length} of ${st.total} parts published: ${st.membersDone} of ${st.members} profiles and ${st.done.length - st.membersDone} of ${st.total - st.members} primers.${s.method && bySlug[s.method] ? ` <a href="${url(s.method)}">How each profile is researched</a>.` : ""}</p>
</section>
<h2 class="sect">The map: 30 names by style</h2>
<div class="groups">${groups}</div>
<h2 class="sect">Published so far, in reading order</h2>
<section class="list">${published.map((p) => postRow(p, true)).join("")}</section>
</div>`;
  out[`series/${id}.html`] = page({ title: s.title, path: url("series/" + id), nav: "home", description: s.summary, body });
});

// posts
posts.forEach((p) => {
  const r = rendered[p.slug];
  const s = p.series && site.series[p.series];
  let seriesNav = "", kicker = "";
  if (s) {
    const order = seriesOrder(s).filter((slug) => bySlug[slug]);
    const i = order.indexOf(p.slug);
    const group = s.groups.filter((g) => g.primer === p.slug || g.members.some((m) => m.post === p.slug))[0];
    kicker = `<a href="${url("series/" + s.id)}">${esc(s.title)}</a>${group ? ` <span>›</span> <a href="${url("series/" + s.id)}#${group.id}">${esc(group.title)}</a>` : ""}`;
    const prev = i > 0 ? bySlug[order[i - 1]] : null, next = i >= 0 && i < order.length - 1 ? bySlug[order[i + 1]] : null;
    seriesNav = `<nav class="pn" aria-label="In this series">${prev ? `<a class="prev" href="${url(prev.slug)}"><small>Previous in the series</small><b>${esc(prev.title)}</b></a>` : "<span></span>"}${next ? `<a class="next" href="${url(next.slug)}"><small>Next in the series</small><b>${esc(next.title)}</b></a>` : `<a class="next" href="${url("series/" + s.id)}"><small>The whole series</small><b>${esc(s.title)}: the map</b></a>`}</nav>`;
  }
  if (!s && p.col) {
    const c = p.col, i = c.posts.indexOf(p);
    kicker = `<a href="${colUrl(c)}">${esc(c.title)}</a>`;
    const near = [c.posts[i - 1], c.posts[i + 1]].filter(Boolean);
    const cell = (q, cls) => `<a class="${cls}" href="${url(q.slug)}"><small>Also in ${esc(c.title)}</small><b>${esc(q.title)}</b></a>`;
    const whole = (cls) => `<a class="${cls}" href="${colUrl(c)}"><small>The whole collection</small><b>${esc(c.title)}: ${plural(c.posts.length, "note")}</b></a>`;
    const all = `<a class="next" href="${url("")}"><small>Everything else</small><b>All collections</b></a>`;
    seriesNav = `<nav class="pn" aria-label="In this collection">${near.length === 2 ? cell(near[0], "prev") + cell(near[1], "next") : near.length === 1 ? cell(near[0], "prev") + whole("next") : whole("prev") + all}</nav>`;
  }
  const toc = r.toc.length >= 3 ? `<nav class="toc" aria-label="On this page"><details open><summary>On this page</summary><ol>${r.toc.map((t) => `<li><a href="#${t.id}">${t.text}</a></li>`).join("")}</ol></details></nav>` : "";
  const linkBox = p.link ? `<p class="cta"><a href="${esc(p.link)}">Open the full study<span>→</span></a></p>` : "";
  const body = `<div class="wrap post${toc ? " has-toc" : ""}">
<header class="phead">
  ${kicker ? `<p class="kicker">${kicker}</p>` : ""}
  <h1>${esc(p.title)}</h1>
  <p class="standfirst">${esc(p.summary)}</p>
  <div class="meta"><time datetime="${p.date}">${p.dateText}</time>${p.updatedText ? `<span>updated ${p.updatedText}</span>` : ""}<span>${p.link ? "multi-page study" : p.minutes + " min read"}</span>${p.tags.map(tagLink).join("")}</div>
  ${linkBox}
</header>
${toc}
<article class="prose">
${r.html}
${p.link ? linkBox : ""}
</article>
<footer class="pfoot">
  ${seriesNav}
  <p class="disc">${esc(site.disclaimer)} Figures and facts are dated; check the sources before relying on them.</p>
</footer>
</div>`;
  out[`${p.slug}.html`] = page({ title: p.title, path: url(p.slug), description: p.summary, article: true, body, cls: "article" });
  r.links.forEach((href) => {
    const target = href.slice(BASE.length + 1).split("#")[0].replace(/\/$/, "");
    if (target && !out[target + ".html"] && !bySlug[target] && !/^(tags|series|collections)(\/|$)/.test(target)) problems.push(`${p.file}: link to ${href} has no page`);
  });
});

// feed
(function () {
  const items = posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${site.url}${url(p.slug)}</link><guid>${site.url}${url(p.slug)}</guid><pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate><description>${esc(p.summary)}</description>${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}</item>`).join("\n");
  out["feed.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(site.title)}</title><link>${site.url}${BASE}</link><description>${esc(site.description)}</description><language>en</language>\n${items}\n</channel></rss>\n`;
})();

// ---------------------------------------------------------------- write
if (problems.length && args.indexOf("--loose") >= 0) {
  // preview only: never publish a loose build
  console.warn("Built anyway (--loose). Still to fix before publishing:\n- " + problems.join("\n- "));
} else if (problems.length) {
  console.error("Not built. Fix these first (or preview anyway with --loose):\n- " + problems.join("\n- "));
  process.exit(1);
}
fs.rmSync(OUT, { recursive: true, force: true });
Object.keys(out).forEach((rel) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, out[rel]);
});
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from, { withFileTypes: true }).forEach((e) => {
    if (e.isDirectory()) copyDir(path.join(from, e.name), path.join(to, e.name));
    else fs.copyFileSync(path.join(from, e.name), path.join(to, e.name));
  });
}
copyDir(path.join(ROOT, "site", "assets"), path.join(OUT, "assets"));
copyDir(path.join(ROOT, "site", "img"), path.join(OUT, "img"));
// the home page of the Next app shows the latest notes from this file
const published = posts.filter((p) => !p.draft);
fs.writeFileSync(path.join(ROOT, "..", "..", "web", "lib", "blog-latest.json"), JSON.stringify({
  count: published.length,
  posts: published.slice(0, 6).map((p) => ({ title: p.title, slug: p.slug, date: p.date, dateText: p.dateText, summary: p.summary, tags: p.tags })),
}, null, 2) + "\n");
const figs = posts.reduce((a, p) => a + rendered[p.slug].figs, 0);
console.log(`Built ${posts.length} posts (${figs} figures), ${Object.keys(out).length} files → ${path.relative(process.cwd(), OUT)}`);
posts.forEach((p) => console.log(`  ${p.date}  ${BASE}/${p.slug}  ${p.words} words, ${rendered[p.slug].figs} figures`));
void fmtDate;
