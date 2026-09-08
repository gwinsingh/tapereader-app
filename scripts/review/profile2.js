const L=require("./lib.js");
const {live,practice,sum,mean,med,f,R,st,permP,bootCI}=L;
const ALL=[...live,...practice];
const g=(t,k)=>t[k];
const cmp=(name,fn,d=2)=>{
  const W=TOP.map(fn).filter(x=>!isNaN(x)), Lo=BOT.map(fn).filter(x=>!isNaN(x));
  if(W.length<5||Lo.length<5)return;
  console.log(`  ${name.padEnd(26)} winners ${f(med(W),d).padStart(9)}   losers ${f(med(Lo),d).padStart(9)}   p=${f(permP(W,Lo),3)}`);
};
// top/bottom by realised R
const S=[...ALL].filter(t=>!isNaN(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR);
const TOP=S.slice(0,25), BOT=S.slice(-25);
console.log("################ F. TOP 25 WINNERS vs BOTTOM 25 LOSERS — pre-trade characteristics only");
console.log(`  winners: median ${f(med(TOP.map(t=>t.pnlR)))}R   losers: median ${f(med(BOT.map(t=>t.pnlR)))}R\n`);
cmp("entry price $",t=>t.ent);
cmp("ADR $",t=>t.adr);
cmp("ADR % of price",t=>t.adr/t.ent*100);
cmp("30m ATR $",t=>t.m30);
cmp("%Gap",t=>t.gap);
cmp("gap % of ATR",t=>t.gapATR,0);
cmp("RVOL",t=>t.rvol);
cmp("%VWAP at entry",t=>t.vwap);
cmp("OR size $",t=>t.orSize);
cmp("OR % of ATR",t=>t.orATR,0);
cmp("OR size % of price",t=>t.orSize/t.ent*100);
cmp("float (M)",t=>t.float/1e6,0);
cmp("avg $vol (M)",t=>t.advol/1e6,0);
cmp("prior close loc",t=>t.pcl,0);
cmp("dist 20 SMA %",t=>t.d20);
cmp("dist 50 SMA %",t=>t.d50);
cmp("stop dist % price",t=>Math.abs(t.firstEntry-t.initStop)/t.firstEntry*100);
cmp("stop dist / 30mATR",t=>Math.abs(t.firstEntry-t.initStop)/t.m30);
cmp("entry sec after 9:30",t=>t.t-34200,0);
cmp("entry vs OR high (OR)",t=>(t.firstEntry-t.orH)/t.orSize);
cmp("VIX",t=>t.vix);
console.log("\n  POST-entry (outcome-linked, NOT selectable — shown for contrast):");
cmp("# entries",t=>t.nEntries,1);
cmp("duration (min)",t=>t.dur,1);

console.log("\n################ G. CATALYST");
const C={};ALL.forEach(t=>{if(t.cat)t.cat.split(",").map(x=>x.trim()).filter(Boolean).forEach(c=>(C[c]||=[]).push(t));});
Object.entries(C).sort((a,b)=>b[1].length-a[1].length).forEach(([k,a])=>console.log(`  ${k.padEnd(22)} ${st(a)}`));
console.log(`  ${"(none logged)".padEnd(22)} ${st(ALL.filter(t=>!t.cat))}`);

console.log("\n################ H. INSTRUMENT");
const idx=["SPY","QQQ","IWM","DIA"],lev=["SOXL","SQQQ","TQQQ","SOXS","TNA","UVXY","LABU"];
const cls=t=>idx.includes(t.sym)?"Index ETF":lev.includes(t.sym)?"Leveraged ETF":(t.float>2e9?"Mega-cap":"Single name");
const K={};ALL.forEach(t=>(K[cls(t)]||=[]).push(t));
Object.entries(K).sort((a,b)=>b[1].length-a[1].length).forEach(([k,a])=>
 console.log(`  ${k.padEnd(16)} ${st(a)}  medADR%=${f(med(a.map(t=>t.adr/t.ent*100)))}  medPrice=$${f(med(a.map(t=>t.ent)),0)}`));
console.log("\n  most-traded symbols (both books):");
const SY={};ALL.forEach(t=>(SY[t.sym]||=[]).push(t));
Object.entries(SY).sort((a,b)=>b[1].length-a[1].length).slice(0,16).forEach(([k,a])=>
 console.log(`   ${k.padEnd(7)} ${st(a)}`));

console.log("\n################ I. MANAGEMENT SIGNATURE");
const lad=ALL.filter(t=>t.nEntries>0);
console.log(`  add rate ${f(lad.filter(t=>t.nEntries>1).length/lad.length*100,0)}%  |  median entries ${med(lad.map(t=>t.nEntries))}  |  scaled out on ${lad.filter(t=>t.nExits>1).length}/${lad.length}`);
console.log(`  median hold: winners ${f(med(ALL.filter(t=>t.pnlR>0).map(t=>t.dur)),1)} min   losers ${f(med(ALL.filter(t=>t.pnlR<=0).map(t=>t.dur)),1)} min`);
console.log(`  median stop raises ${med(lad.map(t=>t.stopRaises))}  |  stopped out ${f(lad.filter(t=>t.stoppedOut==="Y").length/lad.length*100,0)}%`);
console.log(`  avg loser ${f(mean(R(ALL.filter(t=>t.pnlR<0))))}R   avg winner ${f(mean(R(ALL.filter(t=>t.pnlR>0))))}R   win rate ${f(ALL.filter(t=>t.pnl>0).length/ALL.length*100,0)}%`);

console.log("\n################ J. SPY DIRECTION (long-only trader)");
const D={};ALL.forEach(t=>{if(t.spy)(D[t.spy]||=[]).push(t);});
Object.entries(D).forEach(([k,a])=>console.log(`  SPY ${k.padEnd(6)} ${st(a)}`));
