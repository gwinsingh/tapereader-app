const L=require("./lib.js"); const {f,sum,mean,R,byDay,days}=L;
console.log("===== ALL LIVE NOTES (chronological) =====");
L.live.filter(t=>t.notes).forEach(t=>{
  console.log(`\n[${t.date} ${t.sym} ${t.entry}] R=${f(t.pnlR)} MFE=${f(t.maxR)} proc=${t.proc} right=${t.right}`);
  console.log("  "+t.notes.replace(/\s+/g," "));
});
console.log("\n\n===== keyword frequency (live notes) =====");
const txt=L.live.map(t=>t.notes.toLowerCase()).join(" | ");
const kw=["fomo","greed","emotion","revenge","make back","lost money","chase","chased","extended","size","added","add ",
  "mistake","hotkey","button","patience","patient","wait","early","late","rush","forced","force","stop","cut",
  "should","shouldn't","didn't","not my setup","qualify","valid","plan","discipline","hold","exit","partial","scared","fear","panic","tired"];
kw.forEach(k=>{const c=(txt.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length; if(c)console.log(`  ${k.padEnd(14)} ${c}`);});
