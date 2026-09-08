// Service-account auth + .env.local parsing for the monthly review tooling.
const fs = require("fs"), crypto = require("crypto");

function parseEnvLocal(p) {
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  const out = {}; let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1]; let val = m[2];
    const q = val[0];
    if (q === "'" || q === '"') {
      if (val.length > 1 && val.endsWith(q)) { val = val.slice(1, -1); i++; }
      else {
        let buf = val.slice(1); i++;
        while (i < lines.length) {
          const x = lines[i]; i++;
          if (x.endsWith(q)) { buf += "\n" + x.slice(0, -1); break; }
          buf += "\n" + x;
        }
        val = buf;
      }
    } else i++;
    out[key] = val;
  }
  return out;
}

async function getAccessToken(saJson) {
  const sa = typeof saJson === "string" ? JSON.parse(saJson) : saJson;
  const b64 = o => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
  });
  const s = crypto.createSign("RSA-SHA256"); s.update(unsigned); s.end();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + s.sign(sa.private_key).toString("base64url"),
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(JSON.stringify(j));
  return j.access_token;
}

const ENV_PATH = "/Users/gurwinder/Workspace/tapereader-app/web/.env.local";
module.exports = { parseEnvLocal, getAccessToken, ENV_PATH };
