const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
(async () => {
  const env = parseEnvLocal(ENV_PATH);
  const tok = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H = { Authorization: `Bearer ${tok}` };

  // 1. WIP sheet present?
  const meta = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SPREADSHEET_ID}?fields=sheets.properties`, { headers: H })).json();
  console.log("TABS:", meta.sheets.map(s => s.properties.title).join(" | "));

  const folders = {
    ENTRY: env.GOOGLE_DRIVE_ENTRY_FOLDER_ID,
    EOD: env.GOOGLE_DRIVE_EOD_FOLDER_ID,
    DASLOGS: "13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH",
  };
  for (const [name, id] of Object.entries(folders)) {
    if (!id) { console.log(`\n${name}: NOT CONFIGURED`); continue; }
    const q = encodeURIComponent(`'${id}' in parents and trashed=false`);
    const r = await (await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=1000&orderBy=name`, { headers: H })).json();
    if (r.error) { console.log(`\n${name} (${id}): ERROR ${r.error.code} ${r.error.message}`); continue; }
    const files = r.files || [];
    console.log(`\n${name} (${id}): ${files.length} files`);
    if (name === "DASLOGS") {
      files.slice(0, 60).forEach(f => console.log(`   ${f.name.padEnd(52)} ${f.mimeType.padEnd(30)} ${f.size || ""}`));
      if (files.length > 60) console.log(`   ... +${files.length - 60} more`);
    } else {
      const m = files.filter(f => /2026-08-19/.test(f.name) && /MRNA/i.test(f.name));
      console.log(`   matching 2026-08-19 MRNA: ${m.length}`);
      m.forEach(f => console.log(`   ${f.id}  ${f.name}`));
    }
  }
})();
