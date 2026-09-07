const L = require("./lib.js");
const IDX=new Set(["SPY","QQQ","IWM","DIA"]);
function e(T){T.forEach(t=>{t.adrPct=t.adr/t.ent*100;t.post935=t.t>=9*3600+35*60;
 t.pdhADR=(t.ent-t.pdh)/t.adr; t.openADR=(t.ent-t.O)/t.adr; t.hodD=(t.ent-t.H)/t.adr;});}
e(L.live);e(L.practice);
let T=0;
console.log("=== pre vs post 9:35 on LIVE (confound for the extension metric; H8 is the timing track's) ===");
const pre=L.live.filter(t=>!t.post935), post=L.live.filter(t=>t.post935);
console.log("  "+L.st(pre,"pre-9:35")); console.log("  "+L.st(post,"post-9:35"));
console.log("  p="+L.f(L.permP(L.R(pre),L.R(post)),3)); T++;
console.log("  practice: "+L.st(L.practice.filter(t=>!t.post935),"pre-9:35"));
console.log("  practice: "+L.st(L.practice.filter(t=>t.post935),"post-9:35"));
console.log("  practice p="+L.f(L.permP(L.R(L.practice.filter(t=>!t.post935)),L.R(L.practice.filter(t=>t.post935))),3)); T++;
console.log("  live pre-9:35 minus its single biggest winner: "+
  L.st([...pre].sort((a,b)=>b.pnlR-a.pnlR).slice(1),"pre-9:35 ex-top1"));

console.log("\n=== ADR% (volatility class) robustness, LIVE ===");
const m=L.med(L.live.map(t=>t.adrPct).filter(isFinite));
const lo=L.live.filter(t=>t.adrPct<=m), hi=L.live.filter(t=>t.adrPct>m);
console.log("  cut="+L.f(m,2)+"%");
console.log("  "+L.st(lo,"ADR% <= cut")); console.log("  "+L.st(hi,"ADR% >  cut"));
console.log("  p="+L.f(L.permP(L.R(lo),L.R(hi)),3)); T++;
console.log("  lo ex-top1: "+L.st([...lo].sort((a,b)=>b.pnlR-a.pnlR).slice(1),"lo ex-top1"));
console.log("  lo ex-top3: "+L.st([...lo].sort((a,b)=>b.pnlR-a.pnlR).slice(3),"lo ex-top3"));
console.log("  practice same cut: "+L.st(L.practice.filter(t=>t.adrPct<=m),"prac lo"));
console.log("  practice same cut: "+L.st(L.practice.filter(t=>t.adrPct>m),"prac hi"));
console.log("  practice p="+L.f(L.permP(L.R(L.practice.filter(t=>t.adrPct<=m)),L.R(L.practice.filter(t=>t.adrPct>m))),3)); T++;
// day-level: is this driven by a few sessions?
const byd={}; L.live.forEach(t=>{const k=t.adrPct<=m?"lo":"hi"; (byd[k]||={}); byd[k][t.date]=(byd[k][t.date]||0)+(isNaN(t.pnlR)?0:t.pnlR);});
console.log("  lo-bucket sumR by session:",Object.entries(byd.lo).map(([k,v])=>`${k.slice(5)}:${L.f(v,1)}`).join(" "));
console.log("  hi-bucket sumR by session:",Object.entries(byd.hi).map(([k,v])=>`${k.slice(5)}:${L.f(v,1)}`).join(" "));

console.log("\n=== 'Daily/60m extension' proxies (what his own tags actually mean) ===");
["pdhADR","openADR","hodD"].forEach(f=>{
 [["LIVE",L.live],["PRACTICE",L.practice]].forEach(([n,S])=>{
  const v=S.filter(t=>isFinite(t[f])); if(v.length<30) return;
  const md=L.med(v.map(t=>t[f]));
  const a=v.filter(t=>t[f]<=md), b=v.filter(t=>t[f]>md);
  const p=L.permP(L.R(a),L.R(b)); T++;
  console.log(`  ${n.padEnd(9)} ${f.padEnd(8)} med=${L.f(md,3).padStart(7)} lo n=${a.length} expR=${L.f(L.mean(L.R(a))).padStart(6)} hi n=${b.length} expR=${L.f(L.mean(L.R(b))).padStart(6)} p=${L.f(p,3)}`);
 });
});
console.log("\nTESTS in this script:",T);
