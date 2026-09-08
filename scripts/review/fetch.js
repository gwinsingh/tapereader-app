// Snapshot the trade tabs into scripts/review/.data/ (gitignored).
//   node scripts/review/fetch.js
const fs = require("fs"), path = require("path");
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const OUT = path.join(__dirname, ".data");
const TABS = ["WIP-U16632046-GURI", "WIP-TRPCT1541-GURI", "Daily Plan", "Calendar Config"];

(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const id = env.GOOGLE_SPREADSHEET_ID;
  fs.mkdirSync(OUT, { recursive: true });
  for (const tab of TABS) {
    const r = await (await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(tab)}!A1:EZ1000`,
      { headers: { Authorization: `Bearer ${tok}` } })).json();
    const rows = r.values || [];
    const hdr = rows[0] || [];
    const data = rows.slice(1).filter(x => (x[0] || "").trim() && (x[1] || "").trim());
    const file = tab.replace(/[^A-Za-z0-9]/g, "_") + ".json";
    fs.writeFileSync(path.join(OUT, file), JSON.stringify({ tab, hdr, data }));
    const dates = [...new Set(data.map(d => d[0]))].sort();
    console.log(`${tab.padEnd(20)} ${String(data.length).padStart(4)} rows` +
      (dates.length ? `  ${dates.length} dates  ${dates[0]} → ${dates[dates.length - 1]}` : ""));
  }
  console.log(`\nsnapshot written to ${OUT}`);
})();
