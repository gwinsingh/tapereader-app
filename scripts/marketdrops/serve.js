// Market-drops study: tiny static server to look at the built site locally.  node scripts/marketdrops/serve.js  → http://localhost:4173/
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = process.env.OUT || path.join(__dirname, "..", "..", "web", "public", "studies", "market-drops"), PORT = +process.env.PORT || 4173;
const BASE = process.env.BASE_PATH || "/studies/market-drops/";
const TYPE = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") { res.writeHead(302, { location: BASE }); res.end(); return; } if (p.startsWith(BASE)) p = "/" + p.slice(BASE.length); else if (p + "/" === BASE) p = "/"; if (p.endsWith("/")) p += "index.html"; if (!path.extname(p)) p += ".html";
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPE[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" }); fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log("serving", ROOT, "on http://localhost:" + PORT));
