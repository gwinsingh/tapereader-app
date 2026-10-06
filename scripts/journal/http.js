// Minimal fetch for the Windows trading PC, which runs Node 16 (no global fetch / FormData).
// Covers what the journal scripts need: method, headers, string/Buffer/URLSearchParams body,
// and res.ok / res.status / res.json() / res.text(). A newer Node keeps its own fetch.
const https = require("https");

function fetchShim(url, opts = {}) {
  return new Promise((resolve, reject) => {
    let body = opts.body;
    const headers = { ...(opts.headers || {}) };
    if (body instanceof URLSearchParams) {
      body = body.toString();
      headers["Content-Type"] = headers["Content-Type"] || "application/x-www-form-urlencoded";
    }
    if (body != null) headers["Content-Length"] = Buffer.byteLength(body);
    const req = https.request(url, { method: opts.method || "GET", headers }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: async () => text,
          json: async () => JSON.parse(text),
        });
      });
    });
    req.on("error", reject);
    if (body != null) req.write(body);
    req.end();
  });
}

// multipart/form-data body for one file plus text fields.
function multipart(fields, file) {
  const boundary = "----journal" + Date.now().toString(16);
  const parts = Object.entries(fields).map(([k, v]) =>
    `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`);
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="${file.field}"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`;
  const body = Buffer.concat([Buffer.from(parts.join("") + head), file.data, Buffer.from(`\r\n--${boundary}--\r\n`)]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

if (typeof globalThis.fetch !== "function") globalThis.fetch = fetchShim;
module.exports = { multipart };
