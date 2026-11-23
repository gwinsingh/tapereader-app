#!/usr/bin/env node
// Local preview of the built blog (and the static studies next to it): http://localhost:4174/blog
// Serves web/public the way the live site does: /blog → index.html, /blog/some-post → some-post.html.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PUB = path.join(__dirname, "..", "..", "web", "public");
const PORT = +process.env.PORT || 4174;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") { res.writeHead(302, { Location: "/blog" }); return res.end(); }
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  const candidates = [p, p + ".html", p + "/index.html"].map((c) => path.join(PUB, c));
  const file = candidates.find((f) => f.startsWith(PUB) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("404 " + p); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
// bound to this laptop only: no firewall prompt, nothing exposed to the network
}).listen(PORT, "127.0.0.1", () => console.log(`Blog preview: http://localhost:${PORT}/blog`));
