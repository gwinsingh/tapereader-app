const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
(async()=>{
  const env=parseEnvLocal(ENV_PATH);
  const tok=await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H={Authorization:`Bearer ${tok}`};
  const name=process.argv[2];
  const q=encodeURIComponent(`'13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH' in parents and name='${name}' and trashed=false`);
  const r=await(await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,{headers:H})).json();
  if(!r.files||!r.files.length){console.log("not found:",name);return;}
  const t=await(await fetch(`https://www.googleapis.com/drive/v3/files/${r.files[0].id}?alt=media`,{headers:H})).text();
  const lines=t.split(/\r?\n/).filter(x=>x.trim());
  const hdr=lines[0].split(",").map(s=>s.trim());
  console.log("HEADERS:",JSON.stringify(hdr));
  const rows=lines.slice(1).map(l=>l.split(",").map(s=>s.trim()));
  const ev={}; rows.forEach(r=>ev[r[0]]=(ev[r[0]]||0)+1);
  console.log("EVENT TYPES:",JSON.stringify(ev));
  const notes=[...new Set(rows.map(r=>r[8]).filter(Boolean))];
  console.log("DISTINCT NOTES:",JSON.stringify(notes.slice(0,12)));
  const sym=process.argv[3];
  if(sym){
    console.log("\nALL rows for "+sym+" (chronological):");
    rows.filter(r=>r[2]===sym).sort((a,b)=>a[6].localeCompare(b[6]))
      .forEach(r=>console.log("  "+r[6]+"  "+r[0].padEnd(9)+r[1].padEnd(5)+String(r[3]).padStart(4)+" @ "+String(r[4]).padStart(9)+"  "+(r[5]||"").padEnd(6)+(r[8]||"")));
  }
})();
