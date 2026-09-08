const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const L = require("./lib.js");
(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };
  const q = encodeURIComponent(`'13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH' in parents and trashed=false`);
  const r = await (await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size)&pageSize=1000&orderBy=name`, { headers: H })).json();
  const files = r.files || [];
  console.log("ALL " + files.length + " DAS log files:");
  files.forEach(f => process.stdout.write(f.name + "  "));
  console.log("\n");
  // map filename -> date
  const MON = {january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
  const dateOf = (n) => {
    let m = n.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = n.match(/([a-z]+)-(\d{2})/i);
    if (m && MON[m[1].toLowerCase()]) return `2026-${String(MON[m[1].toLowerCase()]).padStart(2,"0")}-${m[2]}`;
    return null;
  };
  const have = new Map();
  files.forEach(f => { const d = dateOf(f.name); if (d) { if(!have.has(d)) have.set(d,[]); have.get(d).push(f); } });
  console.log("distinct dates covered:", have.size);
  const live = L.days(L.live), prac = L.days(L.practice);
  const miss = d => !have.has(d);
  console.log("\nLIVE sessions (" + live.length + ") missing a DAS log:", live.filter(miss).join(" ") || "none");
  console.log("PRACTICE sessions (" + prac.length + ") missing a DAS log:", prac.filter(miss).join(" ") || "none");
  const extra = [...have.keys()].filter(d => !live.includes(d) && !prac.includes(d)).sort();
  console.log("DAS logs with no matching sheet session:", extra.join(" ") || "none");
  const dupes = [...have.entries()].filter(([d,fs]) => fs.length > 1);
  console.log("\ndates with MULTIPLE files (dedupe needed):");
  dupes.forEach(([d,fs]) => console.log("  " + d + " -> " + fs.map(f=>f.name+"("+f.size+"b)").join(" , ")));
})();
