const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
(async()=>{
  const env=parseEnvLocal(ENV_PATH);
  const tok=await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H={Authorization:`Bearer ${tok}`};
  const q=encodeURIComponent(`'13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH' in parents and name='trade-log.csv' and trashed=false`);
  const r=await(await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,{headers:H})).json();
  if(!r.files||!r.files.length){console.log("not found");return;}
  const t=await(await fetch(`https://www.googleapis.com/drive/v3/files/${r.files[0].id}?alt=media`,{headers:H})).text();
  const lines=t.split(/\r?\n/).filter(x=>x.trim());
  console.log("trade-log.csv —",lines.length,"lines");
  console.log(lines.slice(0,4).join("\n"));
  console.log("...");
  console.log(lines.slice(-2).join("\n"));
})();
