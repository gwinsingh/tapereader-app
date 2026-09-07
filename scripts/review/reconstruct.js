/* Prototype: rebuild a trade's entry ladder + stop ladder from a full DAS log. */
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const ACCT = "U16632046";
const sec = t => { const [h,m,s]=t.split(":").map(Number); return h*3600+m*60+s; };

async function getCsv(name){
  const env=parseEnvLocal(ENV_PATH);
  const tok=await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H={Authorization:`Bearer ${tok}`};
  const q=encodeURIComponent(`'13IuvOxDpzBnoyyxnLkbXP4Icrqd7TowH' in parents and name='${name}' and trashed=false`);
  const r=await(await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`,{headers:H})).json();
  if(!r.files||!r.files.length) throw new Error("no file "+name);
  const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${r.files[0].id}?alt=media`,{headers:H}); return await resp.text();
}
function rows(t){
  const L=t.split(/\r?\n/).filter(x=>x.trim());
  const h=L[0].split(",").map(s=>s.trim());
  const I=n=>h.indexOf(n);
  return L.slice(1).map(l=>l.split(",").map(s=>s.trim())).map(c=>({
    event:c[I("Event")], side:c[I("B/S")], sym:c[I("Symbol")],
    sh:+c[I("Shares")], px:+c[I("Price")], route:c[I("Route")],
    time:c[I("Time")], acct:c[I("Account")], note:c[I("Note")],
  })).filter(r=>r.sym && r.acct && r.acct.startsWith(ACCT));
}
(async()=>{
  const [file,sym]=process.argv.slice(2);
  const R=rows(await getCsv(file)).filter(r=>r.sym===sym).sort((a,b)=>sec(a.time)-sec(b.time));
  // executions -> the fill ladder
  const ex=R.filter(r=>r.event==="Execute");
  console.log(`=== ${file}  ${sym} — ${ex.length} executions`);
  let pos=0;
  const entries=[],exits=[];
  ex.forEach(r=>{
    const d = r.side==="Buy" ? r.sh : -r.sh;
    const opening = pos===0 || Math.sign(d)===Math.sign(pos);
    (opening?entries:exits).push(r); pos+=d;
  });
  const tot=entries.reduce((a,e)=>a+e.sh,0);
  const avg=entries.reduce((a,e)=>a+e.sh*e.px,0)/tot;
  console.log(`  entries: ${entries.length} fills, ${tot} sh, avgEntry ${avg.toFixed(3)}`);
  entries.forEach(e=>console.log(`     ${e.time}  Buy ${String(e.sh).padStart(3)} @ ${e.px}`));
  console.log(`  exits:   ${exits.length} fills`);
  exits.forEach(e=>console.log(`     ${e.time}  ${e.side} ${String(e.sh).padStart(3)} @ ${e.px}`));

  // resting protective orders: opposite-side working orders. Track by Accept/Replaced, drop on Canceled.
  const isLong = entries[0] && entries[0].side==="Buy";
  const prot=R.filter(r=>["Accept","Replaced"].includes(r.event) && (isLong? r.side==="Sell" : r.side==="Buy"));
  console.log(`  resting opposite-side orders (stop candidates = price BELOW last trade for a long):`);
  const seen=new Set();
  prot.forEach(r=>{
    const k=r.time+r.sh+r.px; if(seen.has(k))return; seen.add(k);
    const ref=[...ex].filter(e=>sec(e.time)<=sec(r.time)).pop();
    const mkt=ref?ref.px:avg;
    const kind = isLong ? (r.px < mkt ? "STOP  " : "TARGET") : (r.px > mkt ? "STOP  " : "TARGET");
    console.log(`     ${r.time}  ${r.event.padEnd(9)}${kind} ${String(r.sh).padStart(3)} @ ${String(r.px).padStart(9)}   (mkt~${mkt})`);
  });
})();
