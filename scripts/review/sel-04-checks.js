const L = require("./lib.js");
const IDX=new Set(["SPY","QQQ","IWM","DIA"]), LEV=new Set(["SOXL","SQQQ","TQQQ","SOXS","TNA","UVXY"]),
 SEC=new Set(["XLE","IGV","SKHY"]),
 MEGA=new Set(["AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","NFLX","ORCL","JPM","V","MA","WMT","XOM","COST","LLY","JNJ","PG","HD"]);
const cls=s=>IDX.has(s)?"index ETF":LEV.has(s)?"lev ETF":SEC.has(s)?"sector ETF":MEGA.has(s)?"mega":"other";
function e(T){T.forEach(t=>{t.cls=cls(t.sym);t.adrPct=t.adr/t.ent*100;
  t.extAbs=(t.side==="Short")?(t.orL-t.ent):(t.ent-t.orH);t.extOR=t.extAbs/t.orSize;t.extATR=t.extAbs/t.atr;
  t.post935=t.t>=9*3600+35*60;});}
e(L.live);e(L.practice);

console.log("=== CONFOUND: is the live adrPct split just the instrument-class split? ===");
const m=L.med(L.live.map(t=>t.adrPct).filter(isFinite));
console.log("live adrPct median =",L.f(m,3));
["index ETF","lev ETF","sector ETF","mega","other"].forEach(c=>{
 const g=L.live.filter(t=>t.cls===c); if(!g.length)return;
 console.log(`  ${c.padEnd(11)} n=${g.length} medADR%=${L.f(L.med(g.map(t=>t.adrPct)),2)} below-median share=${L.pctf(g.filter(t=>t.adrPct<=m).length,g.length)}`);
});
const lo=L.live.filter(t=>t.adrPct<=m);
console.log("  low-ADR% bucket composition:", Object.entries(lo.reduce((a,t)=>((a[t.cls]=(a[t.cls]||0)+1),a),{})).map(([k,v])=>`${k}:${v}`).join(" "));
console.log("  low-ADR% EXCLUDING index ETFs: "+L.st(lo.filter(t=>t.cls!=="index ETF"),"lowADR non-index"));
console.log("  high-ADR% (all are non-index): "+L.st(L.live.filter(t=>t.adrPct>m),"highADR"));

console.log("\n=== P&L concentration inside index ETFs (live) ===");
const idx=L.live.filter(t=>IDX.has(t.sym)).sort((a,b)=>b.pnlR-a.pnlR);
console.log("  top3 R:",idx.slice(0,3).map(t=>`${t.date} ${t.sym} ${L.f(t.pnlR)}`).join(" | "),
 " sum top3=",L.f(L.sum(idx.slice(0,3).map(t=>t.pnlR)),1)," rest(n=21)=",L.f(L.sum(idx.slice(3).map(t=>t.pnlR)),1));

console.log("\n=== CONSTRUCT VALIDITY: self-tagged 'extended entry' vs computed extension (practice) ===");
L.practice.filter(t=>/extended/i.test(t.tags)).forEach(t=>
 console.log(`  ${t.date} ${t.sym.padEnd(5)} tags="${t.tags}" post935=${t.post935} extOR=${L.f(t.extOR)} extATR=${L.f(t.extATR)} R=${L.f(t.pnlR)}`));
const tagged=L.practice.filter(t=>/extended/i.test(t.tags)), untag=L.practice.filter(t=>!/extended/i.test(t.tags)&&isFinite(t.extOR));
console.log("  tagged-extended mean extOR =",L.f(L.mean(tagged.map(t=>t.extOR).filter(isFinite))),
 " vs untagged median extOR =",L.f(L.med(untag.map(t=>t.extOR))));

console.log("\n=== Conviction=1 pooled across books (auto-filled pre-market => knowable at entry) ===");
[["LIVE",L.live],["PRACTICE",L.practice]].forEach(([n,T])=>{
 const c1=T.filter(t=>t.conv===1), c23=T.filter(t=>t.conv>=2);
 console.log("  "+n); console.log("    "+L.st(c1,"conv=1")); console.log("    "+L.st(c23,"conv>=2"));
 console.log("    p="+L.f(L.permP(L.R(c1),L.R(c23)),3));
});
const pc1=[...L.live,...L.practice].filter(t=>t.conv===1), pc23=[...L.live,...L.practice].filter(t=>t.conv>=2);
console.log("  POOLED"); console.log("    "+L.st(pc1,"conv=1")); console.log("    "+L.st(pc23,"conv>=2"));
console.log("    p="+L.f(L.permP(L.R(pc1),L.R(pc23)),3));

console.log("\n=== Extension x entry-timing 2x2 (live) ===");
[[true,"post-9:35"],[false,"pre-9:35"]].forEach(([p,lab])=>{
 const g=L.live.filter(t=>t.post935===p);
 console.log("  "+L.st(g,lab));
 [[t=>t.extOR<=0,"  ext<=0"],[t=>t.extOR>0,"  ext>0"]].forEach(([fn,l2])=>{
   const h=g.filter(fn); if(h.length) console.log("    "+L.st(h,lab+l2));
 });
});
console.log("  practice reference:");
[[true,"post-9:35"],[false,"pre-9:35"]].forEach(([p,lab])=>{
 const g=L.practice.filter(t=>t.post935===p&&isFinite(t.extOR));
 console.log("  "+L.st(g,lab));
 [[t=>t.extOR<=0,"  ext<=0"],[t=>t.extOR>0,"  ext>0"]].forEach(([fn,l2])=>{
   const h=g.filter(fn); if(h.length) console.log("    "+L.st(h,lab+l2));
 });
});

console.log("\n=== Index-ETF share by half-month (mix drift inside live) ===");
const d=L.days(L.live); const half=d[Math.floor(d.length/2)];
[["first half",t=>t.date<half],["second half",t=>t.date>=half]].forEach(([lab,fn])=>{
 const g=L.live.filter(fn);
 console.log(`  ${lab.padEnd(12)} n=${g.length} index=${L.pctf(g.filter(t=>t.cls==="index ETF").length,g.length)} other=${L.pctf(g.filter(t=>t.cls==="other").length,g.length)} sumR=${L.f(L.sum(L.R(g)),1)}`);
});
