const L=require("./lib.js");
const {live,practice,sum,mean,med,f,R,st}=L;
const ALL=[...live,...practice];
const pct=(a,p)=>{const s=[...a].filter(x=>!isNaN(x)).sort((x,y)=>x-y);return s.length?s[Math.min(s.length-1,Math.floor(p*s.length))]:NaN;};
const q=(name,vals,d=2)=>{const a=vals.filter(x=>!isNaN(x));if(a.length<5)return;
  console.log(`  ${name.padEnd(26)} n=${String(a.length).padStart(3)}  p10 ${f(pct(a,.10),d).padStart(9)}  p25 ${f(pct(a,.25),d).padStart(9)}  MED ${f(pct(a,.50),d).padStart(9)}  p75 ${f(pct(a,.75),d).padStart(9)}  p90 ${f(pct(a,.90),d).padStart(9)}`);};
const hhmm=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");};

console.log("################ A. THE ENVELOPE — what he actually trades (both books, n="+ALL.length+")");
q("entry price $",ALL.map(t=>t.ent));
q("ADR $",ALL.map(t=>t.adr));
q("ADR % of price",ALL.map(t=>t.adr/t.ent*100));
q("ATR $",ALL.map(t=>t.atr));
q("30m ATR $",ALL.map(t=>t.m30));
q("float (M shares)",ALL.map(t=>t.float/1e6),0);
q("avg $ volume (M)",ALL.map(t=>t.advol/1e6),0);
q("RVOL",ALL.map(t=>t.rvol));
q("OR size $",ALL.map(t=>t.orSize));
q("OR as % of ATR",ALL.map(t=>t.orATR),0);
q("OR size % of price",ALL.map(t=>t.orSize/t.ent*100));
q("shares",ALL.map(t=>t.sh),0);
q("initial risk $",ALL.map(t=>t.initRisk));
q("stop distance $/share",ALL.map(t=>Math.abs(t.firstEntry-t.initStop)));
q("stop dist % of price",ALL.map(t=>Math.abs(t.firstEntry-t.initStop)/t.firstEntry*100));
q("stop dist / 30mATR",ALL.map(t=>Math.abs(t.firstEntry-t.initStop)/t.m30));
q("stop dist / ADR",ALL.map(t=>Math.abs(t.firstEntry-t.initStop)/t.adr));

console.log("\n################ B. GAP");
q("%Gap",ALL.map(t=>t.gap));
q("gap as % of ATR",ALL.map(t=>t.gapATR),0);
const gb=[["gap down < -1%",t=>t.gap<-1],["flat -1..+1%",t=>t.gap>=-1&&t.gap<=1],
 ["gap up 1-3%",t=>t.gap>1&&t.gap<=3],["gap up 3-8%",t=>t.gap>3&&t.gap<=8],["gap up 8%+",t=>t.gap>8]];
console.log("\n  by gap bucket (BOTH books):");
gb.forEach(([l,fn])=>{const a=ALL.filter(t=>!isNaN(t.gap)&&fn(t));if(a.length)console.log(`   ${l.padEnd(18)} ${st(a)}  share=${f(a.length/ALL.filter(t=>!isNaN(t.gap)).length*100,0)}%`);});
console.log("  by gap bucket (LIVE only):");
gb.forEach(([l,fn])=>{const a=live.filter(t=>!isNaN(t.gap)&&fn(t));if(a.length)console.log(`   ${l.padEnd(18)} ${st(a)}`);});

console.log("\n################ C. VWAP AT ENTRY  (%VWAP = (entry-VWAP)/VWAP*100)");
q("%VWAP at entry",ALL.map(t=>t.vwap));
const V=ALL.filter(t=>!isNaN(t.vwap));
console.log(`  entries ABOVE vwap: ${V.filter(t=>t.vwap>0).length}/${V.length} = ${f(V.filter(t=>t.vwap>0).length/V.length*100,0)}%   BELOW: ${V.filter(t=>t.vwap<=0).length}`);
[["below VWAP",t=>t.vwap<=0],["0 to +0.5%",t=>t.vwap>0&&t.vwap<=0.5],["+0.5 to +1.5%",t=>t.vwap>0.5&&t.vwap<=1.5],
 ["+1.5 to +3%",t=>t.vwap>1.5&&t.vwap<=3],["+3%+",t=>t.vwap>3]].forEach(([l,fn])=>{
 const a=V.filter(fn);if(a.length)console.log(`   ${l.padEnd(16)} ${st(a)}`);});

console.log("\n################ D. ENTRY TIMING — exact");
const T=ALL.filter(t=>!isNaN(t.t));
q("entry (seconds after 9:30)",T.map(t=>t.t-34200),0);
const bins=[[0,300,"09:30-09:35 (OR forming)"],[300,600,"09:35-09:40"],[600,900,"09:40-09:45"],
 [900,1800,"09:45-10:00"],[1800,3600,"10:00-10:30"],[3600,99999,"10:30+"]];
bins.forEach(([lo,hi,l])=>{const a=T.filter(t=>t.t-34200>=lo&&t.t-34200<hi);
 if(a.length)console.log(`   ${l.padEnd(26)} ${st(a)}  share=${f(a.length/T.length*100,0)}%`);});
console.log("  median entry time: "+hhmm(med(T.map(t=>t.t)))+"   |  live: "+hhmm(med(live.filter(t=>!isNaN(t.t)).map(t=>t.t)))+"  practice: "+hhmm(med(practice.filter(t=>!isNaN(t.t)).map(t=>t.t))));
console.log("  first trade of the day, median: "+hhmm(med(Object.values(L.byDay(ALL)).map(d=>d[0].t))));

console.log("\n################ E. ENTRY LOCATION vs THE OPENING RANGE");
const O=ALL.filter(t=>!isNaN(t.orH)&&!isNaN(t.orL)&&t.orSize>0&&!isNaN(t.firstEntry));
O.forEach(t=>{t.posOR=(t.firstEntry-t.orL)/t.orSize; t.extOR=(t.firstEntry-t.orH)/t.orSize;});
q("position in OR (0=low,1=high)",O.map(t=>t.posOR));
q("beyond OR high (OR units)",O.map(t=>t.extOR));
[["inside the OR",t=>t.extOR<=0],["0 to 0.25 OR above",t=>t.extOR>0&&t.extOR<=0.25],
 ["0.25-0.5 above",t=>t.extOR>0.25&&t.extOR<=0.5],["0.5+ above (extended)",t=>t.extOR>0.5]].forEach(([l,fn])=>{
 const a=O.filter(fn);if(a.length)console.log(`   ${l.padEnd(22)} ${st(a)}  share=${f(a.length/O.length*100,0)}%`);});
