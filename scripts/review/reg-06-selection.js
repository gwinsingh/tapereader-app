/* REGIME TRACK 6 — SELECTION CHANGE, SIZING ARTIFACTS, REAL-MONEY SIGNATURE. */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, byDay, days, dayR } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("6A. INSTRUMENT MIX SHIFT");
const ETF=new Set(["SPY","QQQ","IWM","DIA","SQQQ","TQQQ","SPXL","SOXL","SOXS"]);
const MEGA=new Set(["AAPL","MSFT","NVDA","AMZN","GOOGL","GOOG","META","TSLA","AVGO","NFLX","JPM","V","MA","ORCL","CRM","AMD"]);
function mix(T,lbl){
  const c={}; T.forEach(t=>c[t.sym]=(c[t.sym]||0)+1);
  const top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,12);
  P(`${lbl}: ${T.length} trades, ${Object.keys(c).length} symbols. top: ${top.map(([k,v])=>`${k}:${v}`).join(" ")}`);
  const cls=x=>ETF.has(x.sym)?"ETF":MEGA.has(x.sym)?"MEGA":"OTHER";
  ["ETF","MEGA","OTHER"].forEach(k=>{
    const s=T.filter(t=>cls(t)===k);
    P(`   ${k.padEnd(6)} ${String(s.length).padStart(3)} (${f(s.length/T.length*100,1).padStart(5)}%)  ${L.st(s,"").trim()}`);
  });
  return T.map(cls);
}
const pc=mix(practice,"practice"), lc=mix(live,"live    ");
// mix-shift attribution: what would live have earned at PRACTICE per-class rates?
P("\n   MIX-SHIFT ATTRIBUTION (live mix x practice class rates vs practice mix x practice rates):");
const cls=x=>ETF.has(x.sym)?"ETF":MEGA.has(x.sym)?"MEGA":"OTHER";
let cf=0, base=0;
["ETF","MEGA","OTHER"].forEach(k=>{
  const pr=mean(R(practice.filter(t=>cls(t)===k)));
  const nl=live.filter(t=>cls(t)===k).length;
  cf += pr*nl; base += pr*(practice.filter(t=>cls(t)===k).length/practice.length)*71;
  P(`   ${k.padEnd(6)} practice expR=${f(pr,3).padStart(7)}  live n=${nl}  contribution=${f(pr*nl,2).padStart(7)}R`);
});
P(`   ==> live's MIX at practice's SKILL = ${f(cf,1)}R ; practice's own mix over 71 trades = ${f(base,1)}R`);
P(`   ==> mix shift alone is worth ${f(cf-base,1)}R. Actual live = ${f(sum(R(live)),1)}R.`);

line("6B. PRE-REGISTERED H2 / H3 ON LIVE");
const lMega=live.filter(t=>MEGA.has(t.sym)), lEtf=live.filter(t=>ETF.has(t.sym));
const pMega=practice.filter(t=>MEGA.has(t.sym)), pEtf=practice.filter(t=>ETF.has(t.sym));
P(L.st(pMega,"H2 practice mega")); P(L.st(lMega,"H2 live mega    "));
P(`   permP mega live-vs-rest-of-live = ${f(permP(R(lMega),R(live.filter(t=>!MEGA.has(t.sym)))),4)}`);
P(L.st(pEtf,"H3 practice ETF ")); P(L.st(lEtf,"H3 live ETF     "));
P(`   permP ETF live-vs-rest-of-live  = ${f(permP(R(lEtf),R(live.filter(t=>!ETF.has(t.sym)))),4)}`);

line("6C. ENTRY-TIME MIX (selection / behaviour)");
function tmix(T,lbl){
  const b=[[0,9*3600+35*60,"<=9:35"],[9*3600+35*60,9*3600+45*60,"9:35-9:45"],
           [9*3600+45*60,10*3600,"9:45-10:00"],[10*3600,24*3600,">=10:00"]];
  P(`${lbl}:`);
  b.forEach(([a,z,n])=>{const s=T.filter(t=>ok(t.t)&&t.t>=a&&t.t<z);
    if(s.length) P(`   ${n.padEnd(11)} ${L.st(s,"").trim()}`);});
  const ts=T.map(t=>t.t).filter(ok);
  P(`   median entry = ${new Date(med(ts)*1000).toISOString().substr(11,8)}   mean=${f(mean(ts)/60,1)}min-of-day`);
  return ts;
}
const pt=tmix(practice,"practice"), lt=tmix(live,"live    ");
P(`   permP entry-time = ${f(permP(lt,pt),4)}`);
// H8
const p935=practice.filter(t=>ok(t.t)&&t.t<=9*3600+35*60), l935=live.filter(t=>ok(t.t)&&t.t<=9*3600+35*60);
P(`   H8 practice <=9:35 ${L.st(p935,"").trim()}`);
P(`   H8 live     <=9:35 ${L.st(l935,"").trim()}`);

line("6D. SETUP / ORIGIN / CATALYST MIX");
function cat(T,key,lbl){
  const c={}; T.forEach(t=>{const v=(t[key]||"(blank)");c[v]=(c[v]||0)+1;});
  P(`${lbl} ${key}: ${Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`${k}=${v}`).join("  ")}`);
}
["setup","origin","cat","proc"].forEach(k=>{cat(practice,k,"practice");cat(live,k,"live    ");P("");});

line("6E. REAL-MONEY SIGNATURE");
function beh(T,lbl){
  const d=byDay(T);
  const tpd=days(T).map(k=>d[k].length);
  const dur=T.map(t=>t.dur).filter(ok);
  const wd=T.filter(t=>t.pnlR>0).map(t=>t.dur).filter(ok);
  const ld_=T.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(ok);
  const mae=T.map(t=>t.mae).filter(ok);
  P(`${lbl}: trades/day mean=${f(mean(tpd),2)} med=${f(med(tpd),1)} max=${Math.max(...tpd)}`);
  P(`   duration  all med=${f(med(dur),1)}m mean=${f(mean(dur),1)}m | winners med=${f(med(wd),1)}m | losers med=${f(med(ld_),1)}m`);
  P(`   <2min ("probe") share = ${f(T.filter(t=>ok(t.dur)&&t.dur<2).length/T.length*100,1)}%`);
  P(`   MAE(R) mean=${f(mean(mae),3)} med=${f(med(mae),3)} n=${mae.length} | MAE<=-0.5 share=${f(mae.filter(x=>x<=-0.5).length/mae.length*100,1)}%`);
  P(`   loser size: mean=${f(mean(R(T).filter(x=>x<=0)),3)} med=${f(med(R(T).filter(x=>x<=0)),3)} | worst=${f(Math.min(...R(T)),2)} | share of losers worse than -1R = ${f(R(T).filter(x=>x<-1).length/R(T).filter(x=>x<=0).length*100,1)}%`);
  P(`   shares/trade med=${f(med(T.map(t=>t.sh).filter(ok)),0)}  notional med=$${f(med(T.map(t=>ok(t.sh)&&ok(t.ent)?t.sh*t.ent:NaN).filter(ok)),0)}`);
  return {tpd,dur,mae};
}
const bP=beh(practice,"practice"), bL=beh(live,"live    ");
P(`   permP trades/day = ${f(permP(bL.tpd,bP.tpd),4)}`);
P(`   permP duration   = ${f(permP(bL.dur,bP.dur),4)}`);
P(`   permP MAE(R)     = ${f(permP(bL.mae,bP.mae),4)}`);
const lwd=live.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(ok), pwd=practice.filter(t=>t.pnlR<=0).map(t=>t.dur).filter(ok);
P(`   permP LOSER duration (faster cuts?) = ${f(permP(lwd,pwd),4)}  live med=${f(med(lwd),1)}m prac med=${f(med(pwd),1)}m`);
const lww=live.filter(t=>t.pnlR>0).map(t=>t.dur).filter(ok), pww=practice.filter(t=>t.pnlR>0).map(t=>t.dur).filter(ok);
P(`   permP WINNER duration (longer holds?) = ${f(permP(lww,pww),4)} live med=${f(med(lww),1)}m prac med=${f(med(pww),1)}m`);

line("6F. SIZING — did R-per-trade change when he sized up? (within live)");
[[14],[18],[28,24,38]].forEach(g=>{
  const s=live.filter(t=>ok(t.risk)&&g.includes(t.risk));
  P(`   live risk $${g.join("/")} : ${L.st(s,"").trim()}`);
});
P("");
[[14],[28],[23,24,15,17,18,19,20]].forEach(g=>{
  const s=practice.filter(t=>ok(t.risk)&&g.includes(t.risk));
  P(`   prac risk $${g.join("/")} : ${L.st(s,"").trim()}`);
});
// chronological: when did he size up, and did performance change at that point?
P("\n   live risk unit by date:");
const d=byDay(live);
days(live).forEach(k=>{const rs=d[k].map(t=>t.risk).filter(ok);
  P(`     ${k} risk=${[...new Set(rs)].join("/")} R=${f(sum(R(d[k])),2)}`);});
// is sumR concentrated in one risk tier?
[14,18,28].forEach(r=>{const s=live.filter(t=>t.risk===r);
  P(`   $${r}: n=${s.length} sumR=${f(sum(R(s)),1)} share of month = ${f(sum(R(s))/sum(R(live))*100,0)}%`);});

line("6G. DOES ANY OF THIS SURVIVE MULTIPLE-COMPARISON REALITY?");
P("   (see findings doc — test count reported there)");
