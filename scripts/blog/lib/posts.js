// Loads the posts (scripts/blog/posts/*.md) and the site configuration. Shared by build.js and vault.js.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function parseValue(v) {
  v = v.trim();
  if (v === "") return "";
  if (v[0] === "[" && v[v.length - 1] === "]") return v.slice(1, -1).split(",").map((s) => parseValue(s)).filter((s) => s !== "");
  if ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'")) return v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

// A small subset of YAML: one "key: value" per line, lists in [a, b] form.
function frontmatter(text, file) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) throw new Error(`${file}: no front matter (the file must start with --- ... ---)`);
  const meta = {};
  m[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim() || line.trim()[0] === "#") return;
    const i = line.indexOf(":");
    if (i < 0) throw new Error(`${file}: bad front matter line: ${line}`);
    meta[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
  });
  return { meta, body: text.slice(m[0].length) };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`bad date "${iso}" (use YYYY-MM-DD)`);
  return `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}`;
}

function loadSite() {
  const site = JSON.parse(read("site.json"));
  Object.keys(site.series || {}).forEach((id) => {
    site.series[id] = Object.assign({ id }, JSON.parse(read(site.series[id].file)));
  });
  // Collections are the shelf on the home page: every published post sits in exactly one. A collection is either a
  // series (title and summary come from the series file) or a plain list of posts that name it in their front matter.
  site.collections = (site.collections || []).map((c) => {
    const s = c.series && site.series[c.series];
    if (c.series && !s) throw new Error(`site.json: collection "${c.id}" names the series "${c.series}", which is not under "series"`);
    return Object.assign({}, c, { title: c.title || (s && s.title) || c.id, summary: c.summary || (s && s.summary) || "" });
  });
  return site;
}

// The id of the collection a post belongs to: its own `collection:` line, or the collection of its series.
function collectionId(site, p) {
  if (p.collection) return p.collection;
  const c = p.series && site.collections.filter((x) => x.series === p.series)[0];
  return c ? c.id : "";
}

// A short name for lists: the `short:` line, or the title up to its first colon.
const shortTitle = (p) => p.short || p.title.split(":")[0];

function loadPosts(opts) {
  opts = opts || {};
  const dir = path.join(ROOT, "posts");
  const posts = fs.readdirSync(dir).filter((f) => /\.md$/.test(f) && f[0] !== "_").map((f) => {
    const { meta, body } = frontmatter(fs.readFileSync(path.join(dir, f), "utf8"), f);
    const nm = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(f);
    if (!nm) throw new Error(`${f}: name the file YYYY-MM-DD-some-slug.md`);
    ["title", "summary"].forEach((k) => { if (!meta[k]) throw new Error(`${f}: front matter needs "${k}"`); });
    const date = meta.date || nm[1];
    const words = body.replace(/```figure[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Object.assign({}, meta, {
      file: f, slug: meta.slug || nm[2], date, dateText: fmtDate(date), updatedText: meta.updated ? fmtDate(meta.updated) : "",
      tags: [].concat(meta.tags || []), body, words, minutes: Math.max(1, Math.round(words / 220)),
    });
  }).filter((p) => opts.drafts || !p.draft);
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.order || 0) - (b.order || 0) || a.slug.localeCompare(b.slug)));
  return posts;
}

// The reading order inside a series: each group's primer, then its members, in the order of the series file.
function seriesOrder(series) {
  const out = [];
  series.groups.forEach((g) => {
    if (g.primer && out.indexOf(g.primer) < 0) out.push(g.primer);
    g.members.forEach((m) => { if (out.indexOf(m.post) < 0) out.push(m.post); });
  });
  return out;
}

module.exports = { ROOT, read, frontmatter, fmtDate, loadSite, loadPosts, seriesOrder, collectionId, shortTitle };
