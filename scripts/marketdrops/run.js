// Market-drops study ("Anatomy of a Drop"): the whole pipeline.
//   node scripts/marketdrops/run.js               download → breadth → analysis → site
//   node scripts/marketdrops/run.js --no-fetch    recompute and rebuild from the data already on disk
//   node scripts/marketdrops/run.js --intraday    also refresh the 30-minute bars (Polygon; refuses 09:15–16:15 New York time)
// The site is written to web/public/studies/market-drops/ (OUT=<dir> to write elsewhere). Nothing is committed or pushed here.
const cp = require("child_process"), path = require("path"), fs = require("fs");
const A = process.argv.slice(2), run = (f, args = []) => { console.log(`\n── ${f} ${args.join(" ")}`); cp.execFileSync("node", [path.join(__dirname, f), ...args], { stdio: "inherit" }); };
if (!fs.existsSync(path.join(__dirname, ".data", "universe.json")) || A.includes("--universe")) run("universe.js");
if (!A.includes("--no-fetch")) { run("fetch.js", ["--only=etf"]); run("fetch.js", ["--only=cboe"]); run("fetch.js", ["--only=fred"]); run("fetch.js", ["--only=other"]); run("fetch.js", ["--only=stocks"]); }
if (A.includes("--intraday")) run("intraday.js");
run("breadth.js"); run("analyze.js"); run("analyze2.js");
if (fs.existsSync(path.join(__dirname, ".data", "intraday", "SPY_30m.json"))) run("intra.js");
run("build.js");
