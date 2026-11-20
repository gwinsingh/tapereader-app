// Market-drops study: build the static site.
//   node scripts/marketdrops/build.js              → web/public/studies/market-drops/   (OUT=<dir> to write elsewhere)
//   node scripts/marketdrops/build.js atlas now    → build everything but report only; page modules always all run
// Run fetch.js, breadth.js, analyze.js and analyze2.js first (run.js does the lot).
const fs = require("fs"), path = require("path");
const L = require("./lib.js"), G = require("./sitegen.js");
const C = L.J("core.json"), M = L.J("more.json");
const site = new G.Site(C.asOf);
for (const mod of ["pages-a", "pages-b", "pages-c", "pages-d", "pages-e", "pages-g", "pages-f"]) { const f = path.join(__dirname, mod + ".js"); if (fs.existsSync(f)) require(f)(site, C, M); }
// pages named in the navigation that no module has written yet get a placeholder, so that every link resolves
for (const slug of G.ORDER) if (!site.pages[slug]) { const p = site.page(slug); p.lede = "This page is still being written."; site.missing.push("page " + slug); }
// checks before writing: every in-site link points at a page that exists; no "undefined"/"NaN" in the text
const problems = [];
for (const p of Object.values(site.pages)) { const html = p.parts.join("\n");
  for (const m of html.matchAll(/href="([a-z0-9-]+)\.html(#[^"]*)?"/g)) if (!site.pages[m[1]]) problems.push(`${p.slug}: link to missing page ${m[1]}`);
  const bad = html.replace(/<[^>]+>/g, " ").match(/undefined|NaN|\[object|Infinity/); if (bad) { const t = html.replace(/<[^>]+>/g, " "), i = t.indexOf(bad[0]); problems.push(`${p.slug}: "${bad[0]}" near …${t.slice(Math.max(0, i - 80), i + 40).replace(/\s+/g, " ")}…`); }
  const sj = JSON.stringify(p.specs); if (/\bNaN\b|undefined/.test(sj)) problems.push(`${p.slug}: NaN/undefined inside a chart spec`); }
if (problems.length) { console.log(problems.length, "problems:"); for (const x of problems.slice(0, 30)) console.log("  " + x); if (!process.env.FORCE) process.exit(1); }
const r = site.write();
console.log(`site: ${Object.keys(site.pages).length} pages, ${Object.keys(site.px).length} bar files, ${r.files} files, ${(r.bytes / 1e6).toFixed(1)} MB → ${r.out}${r.gone ? ` (${r.gone} stale files removed)` : ""}`);
if (site.missing.length) console.log("not there yet:", [...new Set(site.missing)].join(" | "));
