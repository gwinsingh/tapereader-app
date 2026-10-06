// Catches the journal sheet up with every pending day: a `_journal\<date>.notes.json` (notes the
// user already approved) without a `<date>.notes.written` marker. Per day:
//   1. import-day.js <date> --no-enrich   trades into the sheet (dedups - safe if already there)
//   2. write-notes.js <notes> --write     notes onto those rows, read back
//   3. <date>.notes.written               marker, only if 1 and 2 succeeded
//   4. import-day.js <date>               enrichment columns (65 s per symbol, runs last)
//
//   node scripts/journal/sync.js              all pending days
//   node scripts/journal/sync.js 2026-10-05   just that day (even if already written)
//   node scripts/journal/sync.js --no-enrich  skip step 4
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const JOURNAL = "C:\\Users\\gurip\\OneDrive\\Pictures\\Screenshots\\_journal";
const run = (script, ...args) =>
  spawnSync(process.execPath, [path.join(__dirname, script), ...args], { stdio: "inherit" }).status === 0;

const args = process.argv.slice(2);
const noEnrich = args.includes("--no-enrich");
const only = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const days = only ? [only] : fs.readdirSync(JOURNAL)
  .map((f) => f.match(/^(\d{4}-\d{2}-\d{2})\.notes\.json$/)?.[1]).filter(Boolean)
  .filter((d) => !fs.existsSync(path.join(JOURNAL, `${d}.notes.written`))).sort();

if (!days.length) { console.log("nothing pending"); process.exit(0); }
console.log("pending:", days.join(", "));
let failed = 0;
const written = [];
for (const d of days) {
  console.log(`\n== ${d}`);
  const notes = path.join(JOURNAL, `${d}.notes.json`);
  if (!run("import-day.js", d, "--no-enrich")) { failed++; continue; }
  if (fs.existsSync(notes)) {
    if (!run("write-notes.js", notes, "--write")) { failed++; continue; }
    fs.writeFileSync(path.join(JOURNAL, `${d}.notes.written`), "");
  }
  written.push(d);
}
if (!noEnrich) for (const d of written) { console.log(`\n== enrich ${d}`); if (!run("import-day.js", d)) failed++; }
console.log(failed ? `\n${failed} step(s) failed` : `\nall done: ${written.join(", ")}`);
process.exitCode = failed ? 1 : 0;
