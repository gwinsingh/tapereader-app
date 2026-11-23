#!/usr/bin/env node
// Writes the full text of every post that has a `vault:` line in its front matter into the Obsidian vault, plus one map
// note per series. Text and tables only: each figure becomes its title and its numbers as a table. Everything under the
// ✍️ marker in an existing note is the reader's and survives every rewrite.
//   node scripts/blog/vault.js          write what changed
//   node scripts/blog/vault.js --dry    show what would be written
// Afterwards: make sure Obsidian is open, then run  node scripts/vault-sync/check.js --push  until it prints "in sync".
const fs = require("fs");
const path = require("path");
const fig = require("./lib/figures");
const { loadSite, loadPosts, seriesOrder } = require("./lib/posts");

const VAULT = process.env.VAULT || require("../vault-path");
const DRY = process.argv.indexOf("--dry") >= 0;
const MARK = "%% ✍️ YOUR NOTES BELOW — the generator never touches anything under this line %%";
const CALLOUT = { take: "summary", warn: "warning", define: "info", test: "question", note: "note" };
const DEFAULT_TITLE = { take: "What to take from it", warn: "Limits", define: "In plain words", test: "A test worth running", note: "Note" };

const site = loadSite();
const posts = loadPosts();
const bySlug = {};
posts.forEach((p) => { bySlug[p.slug] = p; });
const noteName = (p) => path.basename(p.vault);

function convert(p) {
  let n = 0;
  let md = p.body.replace(/```figure\r?\n([\s\S]*?)```/g, (m, json) => { n += 1; return fig.toMarkdown(JSON.parse(json), n); });
  // callouts: the blog's own types → Obsidian's built-in ones
  md = md.replace(/^> \[!(\w+)\][ \t]*(.*)$/gm, (m, type, title) => `> [!${CALLOUT[type] || "note"}] ${title.trim() || DEFAULT_TITLE[type] || ""}`.trimEnd());
  // links: another post that is also in the vault becomes a wikilink; everything else on the site becomes a full address
  md = md.replace(/\[([^\]]+)\]\((\/blog\/([a-z0-9-]+))(#[^)]*)?\)/g, (m, text, href, slug) => {
    const t = bySlug[slug];
    return t && t.vault ? `[[${noteName(t)}|${text}]]` : `[${text}](${site.url}${href})`;
  });
  md = md.replace(/\]\((\/(?:blog|studies)[^)]*)\)/g, (m, href) => `](${site.url}${href})`);
  const s = p.series && site.series[p.series];
  const tags = ["study"].concat(p.tags.filter((t) => t !== "study" && t !== "research"));
  const head = `---\ntags: [${tags.join(", ")}]\ndate: ${p.date}\nsource: ${site.url}${site.base}/${p.slug}\n---\n\n# ${p.title}\n\n> ${p.summary}\n\n`;
  const way = `Published ${p.dateText}${p.updatedText ? `, updated ${p.updatedText}` : ""} · with charts on the web: ${site.url}${site.base}/${p.slug}${s ? ` · part of [[00 ${s.title} — Map|${s.title}]]` : ""}\n\n`;
  return head + way + md.trim() + "\n";
}

function seriesMap(s) {
  const order = seriesOrder(s);
  const done = order.filter((slug) => bySlug[slug] && bySlug[slug].vault);
  let md = `---\ntags: [study, ${s.id}, home]\n---\n\n# ${s.title} — Map\n\n> ${s.summary}\n\n`;
  md += `On the web: ${site.url}${site.base}/series/${s.id} · ${done.length} of ${order.length} parts written.\n\n`;
  md += s.intro.join("\n\n") + "\n\n";
  s.groups.forEach((g) => {
    const primer = bySlug[g.primer];
    md += `## ${g.title}\n\n${g.blurb}\n\n`;
    md += `- Primer: ${primer && primer.vault ? `[[${noteName(primer)}]]` : "planned"}\n`;
    g.members.forEach((m) => {
      const p = bySlug[m.post];
      md += `- ${p && p.vault ? `[[${noteName(p)}|${m.name}]] (${p.dateText})` : `${m.name}: planned, ${m.depth} profile`}\n`;
    });
    md += "\n";
  });
  return md;
}

function write(rel, content) {
  const file = path.join(VAULT, rel + ".md");
  let tail = `\n${MARK}\n\n`;
  let old = null;
  if (fs.existsSync(file)) {
    old = fs.readFileSync(file, "utf8");
    const i = old.indexOf("%% ✍️ YOUR NOTES BELOW");
    if (i >= 0) tail = "\n" + old.slice(i);
  }
  const next = content + tail;
  if (old === next) return "same";
  if (!DRY) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, next); }
  return old == null ? "new" : "updated";
}

if (!fs.existsSync(VAULT)) { console.error("Vault not found at " + VAULT); process.exit(1); }
const report = [];
posts.filter((p) => p.vault).forEach((p) => report.push([write(p.vault, convert(p)), p.vault]));
Object.keys(site.series).forEach((id) => {
  const s = site.series[id];
  if (s.vault) report.push([write(`${s.vault}/00 ${s.title} — Map`, seriesMap(s)), `${s.vault}/00 ${s.title} — Map`]);
});
report.forEach((r) => console.log(`${r[0].padEnd(8)} ${r[1]}.md`));
const changed = report.filter((r) => r[0] !== "same").length;
console.log(`${DRY ? "(dry run) " : ""}${changed} of ${report.length} notes ${DRY ? "would change" : "written"} in ${VAULT}`);
if (changed && !DRY) console.log("Next: open Obsidian, then  node scripts/vault-sync/check.js --push");
