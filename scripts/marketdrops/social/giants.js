// Social image: the profitable tech companies of 2000, how far the shares fell and how long they stayed under their high.
// node scripts/marketdrops/social/giants.js   ->  social/out/giants-2000.html + .png (1080x1350 at 2x, for X)
// Amazon is in the site's table but left out here: it lost money in 2000, and the image's claim is "profitable".
const fs = require("fs"), path = require("path"), cp = require("child_process");
const L = require("../lib");

const NAMES = { CSCO: "Cisco", INTC: "Intel", QCOM: "Qualcomm", TXN: "Texas Instruments", AMAT: "Applied Materials", MSFT: "Microsoft", ORCL: "Oracle", IBM: "IBM", ADBE: "Adobe", NVDA: "Nvidia", EBAY: "eBay" };
const yf = iso => { const y = +iso.slice(0, 4), t0 = Date.UTC(y, 0, 1), t = Date.parse(iso + "T00:00:00Z"); return y + (t - t0) / 864e5 / 365.25; };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const rows = Object.keys(NAMES).map(sym => {
  const B = L.anyBars(sym), a = L.bia(B, "1999-10-01"), z = L.bi(B, "2000-12-29");
  let pk = a; for (let i = a; i <= z; i++) if (B[i].c > B[pk].c) pk = i;
  let lo = pk; const zz = L.bi(B, "2003-12-31"); for (let i = pk; i <= zz; i++) if (B[i].c < B[lo].c) lo = i;
  let back = null; for (let i = lo; i < B.length; i++) if (B[i].c >= B[pk].c) { back = i; break; }
  if (back == null) throw new Error(sym + " has not regained its high; the layout assumes all did");
  return { sym, name: NAMES[sym], peak: B[pk].d, low: B[lo].d, back: B[back].d, fall: (B[lo].c / B[pk].c - 1) * 100, years: yf(B[back].d) - yf(B[pk].d) };
}).sort((x, y) => y.years - x.years);

const X0 = 1999.6, X1 = 2027, px = v => ((v - X0) / (X1 - X0) * 100).toFixed(2) + "%";
const ticks = [2000, 2005, 2010, 2015, 2020, 2025];
const minF = Math.round(Math.min(...rows.map(r => -r.fall))), maxF = Math.round(Math.max(...rows.map(r => -r.fall))), maxY = Math.floor(Math.max(...rows.map(r => r.years)));
const num = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][rows.length];

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Profitable in 2000</title><style>
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body { background: #f6f5f1; color: #111; font-family: "Segoe UI", -apple-system, Helvetica, Arial, sans-serif; padding: 58px 56px 0; }
.k { font-size: 19px; letter-spacing: 2.2px; text-transform: uppercase; color: #8a887f; font-weight: 600; }
h1 { font-size: 66px; line-height: 1.07; letter-spacing: -1.6px; font-weight: 700; margin: 14px 0 18px; }
.sub { font-size: 25px; line-height: 1.38; color: #45433e; max-width: 930px; }
.tb { margin-top: 26px; }
.r { display: grid; grid-template-columns: 236px 96px 1fr 128px; align-items: center; height: 73px; border-top: 1px solid #e3e0d8; }
.r.h { height: 58px; border-top: none; align-items: end; padding-bottom: 10px; color: #8a887f; letter-spacing: .3px; }
.r.h > div { font-size: 16.5px; font-weight: 600; line-height: 1.25; }
.r.h .y, .r .y { text-align: right; } .r.h .f, .r .f { text-align: right; padding-right: 22px; }
.n { font-size: 26px; font-weight: 600; letter-spacing: -.3px; white-space: nowrap; }
.f { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
.y { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; } .y small { font-size: 16px; font-weight: 500; color: #8a887f; margin-left: 3px; }
.c { position: relative; height: 100%; } .c i { position: absolute; top: 0; bottom: 0; width: 1px; background: #e3e0d8; }
.c b { position: absolute; top: 50%; height: 20px; margin-top: -10px; background: #111; border-radius: 4px; }
.c em { position: absolute; top: 50%; margin-top: -11px; font-style: normal; font-size: 16px; line-height: 22px; color: #55534e; padding-left: 8px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.c em.in { color: #fff; padding: 0 8px 0 0; transform: translateX(-100%); }
.ax { position: relative; height: 22px; } .ax span { position: absolute; bottom: 0; transform: translateX(-50%); font-variant-numeric: tabular-nums; }
.ft { position: absolute; left: 56px; right: 56px; bottom: 44px; display: flex; justify-content: space-between; align-items: flex-end; gap: 30px; font-size: 16.5px; line-height: 1.42; color: #8a887f; }
.ft b { color: #111; font-size: 20px; font-weight: 700; white-space: nowrap; letter-spacing: .2px; }
</style></head><body>
<div class="k">After the dot-com peak</div>
<h1>Profitable in 2000.<br>Underwater for up to ${maxY} years.</h1>
<p class="sub">${num} tech companies that were making real money at the 2000 top. How far each stock fell, and how long before it closed above that high again.</p>
<div class="tb">
<div class="r h"><div>Company</div><div class="f">Fall</div><div class="ax">${ticks.map(t => `<span style="left:${px(t)}">${t}</span>`).join("")}</div><div class="y">Years below<br>its 2000 high</div></div>
${rows.map(r => { const a = px(yf(r.peak)), w = ((yf(r.back) - yf(r.peak)) / (X1 - X0) * 100).toFixed(2) + "%", inside = yf(r.back) > 2021, lab = MON[+r.back.slice(5, 7) - 1] + " " + r.back.slice(0, 4);
    return `<div class="r"><div class="n">${r.name}</div><div class="f">−${Math.round(-r.fall)}%</div><div class="c">${ticks.map(t => `<i style="left:${px(t)}"></i>`).join("")}<b style="left:${a};width:${w}"></b><em class="${inside ? "in" : ""}" style="left:${px(yf(r.back))}">${lab}</em></div><div class="y">${r.years.toFixed(1)}<small>yrs</small></div></div>`; }).join("\n")}
</div>
<div class="ft"><div>Bars run from each stock's highest close (Oct 1999 to Dec 2000) to its first close back above it.<br>Fall is to the lowest close by end-2003. Split-adjusted prices, dividends not included.</div><b>tapereader.us</b></div>
</body></html>`;

const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
const hp = path.join(out, "giants-2000.html"), pp = path.join(out, "giants-2000.png");
fs.writeFileSync(hp, html);
console.log(rows.map(r => [r.sym, r.peak, r.low, r.back, r.fall.toFixed(1), r.years.toFixed(2)].join("  ")).join("\n"));
console.log("falls " + minF + "–" + maxF + "%, longest " + maxY + " years");
if (!process.argv.includes("--no-png")) {
  const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(f => fs.existsSync(f));
  cp.execFileSync(edge, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=1080,1350", "--screenshot=" + pp, "file:///" + hp.split(path.sep).join("/")], { stdio: "ignore", timeout: 60000 });
  console.log("wrote " + pp);
}
