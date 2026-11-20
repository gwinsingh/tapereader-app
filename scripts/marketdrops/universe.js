// Market-drops study: the symbol lists.
//   node scripts/marketdrops/universe.js      → .data/universe.json  (S&P 500 + Nasdaq-100 members from Wikipedia, with sector)
// The stock universe is TODAY's index membership plus a hand list of past leaders that still trade.
// That is survivorship-biased for old episodes (dead companies are missing); every page that uses it says so.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const DATA = path.join(__dirname, ".data"); fs.mkdirSync(path.join(DATA, "raw"), { recursive: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// ---- indices and ETFs (Yahoo symbols) : what it is ----
const INDEX = {
  "^GSPC": "S&P 500", "^IXIC": "Nasdaq Composite", "^NDX": "Nasdaq 100", "^RUT": "Russell 2000", "^DJI": "Dow Jones Industrials", "^SOX": "PHLX Semiconductor index", "^NYA": "NYSE Composite", "^DJT": "Dow Jones Transports",
};
const ETF = {
  // broad
  SPY: "S&P 500", QQQ: "Nasdaq 100", IWM: "Russell 2000 (small caps)", DIA: "Dow 30", RSP: "S&P 500 equal weight", MDY: "S&P 400 mid caps",
  // the eleven sectors
  XLK: "Technology", XLC: "Communication services", XLY: "Consumer discretionary", XLF: "Financials", XLI: "Industrials", XLB: "Materials", XLE: "Energy", XLV: "Health care", XLP: "Consumer staples", XLU: "Utilities", XLRE: "Real estate",
  // industries and themes
  SMH: "Semiconductors", SOXX: "Semiconductors (iShares)", IGV: "Software", SKYY: "Cloud computing", HACK: "Cyber security", FDN: "Internet", XBI: "Biotech (equal weight)", IBB: "Biotech", IHI: "Medical devices",
  KRE: "Regional banks", KBE: "Banks", IAI: "Brokers and exchanges", KIE: "Insurance", XHB: "Homebuilders and suppliers", ITB: "Home construction", XRT: "Retail", IYT: "Transports", JETS: "Airlines", ITA: "Aerospace and defence",
  XOP: "Oil and gas producers", OIH: "Oil services", XME: "Metals and mining", GDX: "Gold miners", IYR: "Real estate (iShares)", PAVE: "Infrastructure", URA: "Uranium", TAN: "Solar", ICLN: "Clean energy", IPO: "Recent IPOs", ARKK: "ARK Innovation", BOTZ: "Robotics and AI",
  // styles and factors
  IWF: "Large growth", IWD: "Large value", IWO: "Small growth", IWN: "Small value", MTUM: "Momentum", QUAL: "Quality", USMV: "Minimum volatility", SPLV: "Low volatility", SPHB: "High beta", VLUE: "Value factor", MGK: "Mega-cap growth",
  // world
  EEM: "Emerging markets", EFA: "Developed markets ex-US", FXI: "China large caps", KWEB: "China internet", EWJ: "Japan", EWZ: "Brazil", EWG: "Germany",
  // bonds and credit
  TLT: "20+ year Treasuries", IEF: "7-10 year Treasuries", SHY: "1-3 year Treasuries", HYG: "High-yield bonds", JNK: "High-yield bonds (SPDR)", LQD: "Investment-grade bonds", TIP: "Inflation-linked Treasuries",
  // commodities, dollar, crypto
  GLD: "Gold", SLV: "Silver", USO: "Oil", DBC: "Commodities", UUP: "US dollar", "BTC-USD": "Bitcoin",
  // leveraged
  TQQQ: "3x Nasdaq 100", SQQQ: "-3x Nasdaq 100", SOXL: "3x semiconductors", SOXS: "-3x semiconductors", SPXL: "3x S&P 500", UPRO: "3x S&P 500 (ProShares)", SSO: "2x S&P 500", QLD: "2x Nasdaq 100", TNA: "3x small caps",
};
// ---- past and present leaders that still trade (beyond today's index members). era tags are filled by the analysis, not here ----
const EXTRA = `ROKU SHOP TTD ZS OKTA PAYC NOW MELI ENPH SEDG AMD LRCX KLAC LULU CMG PYPL MA V TWLO MDB VEEV TEAM WDAY CRM ADBE MSFT AAPL NFLX TSLA XYZ ETSY ZM CRWD DOCU HUBS DXCM PODD INSP TNDM EW ALGN ISRG FIVN RNG SE PDD BABA NIO LITE QRVO SWKS TER AMAT ASML TSM NVDA MU AVGO SNAP PINS UBER LYFT BYND CVNA W CHGG PLNT FND FIVE ULTA DPZ COST TGT DG MKTX MSCI SPGI MCO GPN SSNC EPAM GLOB CDNS SNPS FTNT PANW TTWO EA DIS BA CAT DE FDX GS JPM BAC C WFC XOM CVX COP SLB HAL OXY FCX NEM NUE DHI LEN PHM TOL NVR KBH HD LOW WMT AMZN GOOGL META INTC CSCO ORCL IBM QCOM TXN EBAY BKNG BIDU NTES SOHU BB DECK CROX FSLR CME ICE MOS FLR CLF BTU FFIV CTSH EXPE WYNN LVS F SBUX AXP COF PTON MRNA DKNG FVRR PLUG DDOG NET SNOW SMCI PLTR LLY NVO ELF CELH ANET VRT ONON APP AXON GE ETN PWR TDG URI BLDR HOOD RKLB NBIS CRWV OKLO CEG VST GEV RBLX COIN MSTR SOFI IONQ RGTI ASTS CLS ALAB CRDO SNDK WDC STX COHR CIEN BE IREN CIFR APLD TLN NRG SOUN TEM RDDT DUOL AFRM UPST CAVA TOST SPOT ARM MRVL ON MPWR NXPI ADI MCHP ENTG ACLS ONTO CAMT FN AAOI GLW APH TEL JBL FLEX DELL HPE NTAP PSTG TWST HIMS LMND OPEN RIVN LCID JD TME BILI FUTU XPEV LI YUMC TCOM VIPS WB MOMO IQ GDS CGC TLRY ACB CRON RIOT MARA NVAX BNTX REGN VRTX ILMN EXAS TDOC SQM ALB LAC MP UEC CCJ LEU SMR NNE BWXT FLNC STEM RUN SPWR ARRY NXT CSIQ JKS DQ GME AMC BBBY X AA CENX STLD RS TECK VALE RIO BHP SCCO HL AG PAAS WPM FNV GOLD AEM KGC GFI AU RGLD`.split(/\s+/);

function wikiTable(html, marker) {                          // first wikitable after `marker`; returns rows of cell texts
  const at = html.indexOf(marker); if (at < 0) return [];
  const t0 = html.lastIndexOf("<table", at), t1 = html.indexOf("</table>", t0); const t = html.slice(t0, t1);
  const clean = s => s.replace(/<sup[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#160;|&nbsp;/g, " ").replace(/&#39;/g, "'").trim();
  return t.split(/<tr[^>]*>/).slice(1).map(r => [...r.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(m => clean(m[1])));
}
function get(url, out) { cp.execFileSync("curl", ["-sS", "-L", "-m", "90", "--fail", "-A", UA, "-o", out, url]); return fs.readFileSync(out, "utf8"); }

if (require.main === module) {
  const yh = s => s.replace(/\./g, "-");
  const sp = wikiTable(get("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies", path.join(DATA, "raw", "wiki_sp500.html")), 'id="constituents"');
  const members = {};
  for (const r of sp) { if (r.length < 6 || !/^[A-Z.]{1,6}$/.test(r[0])) continue; members[yh(r[0])] = { name: r[1], sector: r[2], industry: r[3], added: r[5], sp500: true }; }
  const nd = get("https://en.wikipedia.org/wiki/List_of_NASDAQ-100_companies", path.join(DATA, "raw", "wiki_ndx.html"));
  const tk = nd.indexOf("Ticker"); const nq = wikiTable(nd.slice(nd.lastIndexOf("<table", tk)), "<table"); let n = 0;
  for (const r of nq) { const sym = r.find(c => /^[A-Z.]{1,6}$/.test(c)); if (!sym || r.length < 3) continue; const k = yh(sym); n++;
    members[k] = Object.assign(members[k] || { name: r.find(c => c.length > 6 && c !== sym) || sym, sector: "", industry: "" }, { ndx: true }); }
  for (const s of EXTRA) if (!members[s]) members[s] = { name: s, sector: "", industry: "", extra: true };
  const out = { builtAt: new Date().toISOString(), index: INDEX, etf: ETF, stocks: members };
  fs.writeFileSync(path.join(DATA, "universe.json"), JSON.stringify(out, null, 1));
  const S = Object.values(members);
  console.log(`S&P 500 members: ${S.filter(x => x.sp500).length} | Nasdaq-100 rows: ${n} | hand list not in either: ${S.filter(x => x.extra).length} | stocks in all: ${S.length} | ETFs: ${Object.keys(ETF).length}`);
}
module.exports = { INDEX, ETF, EXTRA };
