const L=require("./lib.js");
const {live,practice,sum,mean,med,f,R,st,permP}=L;
const ALL=[...live,...practice];
const pctl=(a,p)=>{const s=[...a].filter(x=>!isNaN(x)).sort((x,y)=>x-y);return s[Math.floor(p*s.length)];};

console.log("################ K. THE 09:35-09:40 WINDOW — robustness of the one strong timing result");
const W=ALL.filter(t=>!isNaN(t.t)&&t.t-34200>=300&&t.t-34200<600);
const rest=ALL.filter(t=>!isNaN(t.t)&&!(t.t-34200>=300&&t.t-34200<600));
console.log("  09:35-09:40 "+st(W));
console.log("  every other  "+st(rest));
console.log("  permutation p = "+f(permP(R(W),R(rest)),4));
const wr=R(W).sort((a,b)=>a-b);
console.log("  drop its worst trade: sumR "+f(sum(wr.slice(1)),1)+"  | worst 3: "+f(sum(wr.slice(3)),1)+"  | n="+wr.length);
console.log("  live "+st(live.filter(t=>t.t-34200>=300&&t.t-34200<600))+"\n  prac "+st(practice.filter(t=>t.t-34200>=300&&t.t-34200<600)));

console.log("\n################ L. GAP x VWAP");
const G=ALL.filter(t=>!isNaN(t.gap)&&!isNaN(t.vwap));
[["gap<=1% & near VWAP (<0.5%)",t=>t.gap<=1&&t.vwap<0.5],
 ["gap<=1% & extended (>=0.5%)",t=>t.gap<=1&&t.vwap>=0.5],
 ["gap>3% & near VWAP",t=>t.gap>3&&t.vwap<0.5],
 ["gap>3% & extended",t=>t.gap>3&&t.vwap>=0.5]].forEach(([l,fn])=>{
 const a=G.filter(fn); if(a.length)console.log(`  ${l.padEnd(30)} ${st(a)}`);});

console.log("\n################ M. SIZING GRANULARITY — what his risk unit can actually trade");
console.log("  He sizes shares = risk / stopDistance, whole shares only. A coarse share count");
console.log("  means the realised risk drifts from the intended unit.\n");
const S=ALL.filter(t=>!isNaN(t.sh)&&t.sh>0&&!isNaN(t.initRisk));
[["1-4 shares",t=>t.sh<=4],["5-9",t=>t.sh>=5&&t.sh<=9],["10-19",t=>t.sh>=10&&t.sh<=19],
 ["20-49",t=>t.sh>=20&&t.sh<=49],["50+",t=>t.sh>=50]].forEach(([l,fn])=>{
 const a=S.filter(fn); if(a.length)console.log(`  ${l.padEnd(12)} n=${String(a.length).padStart(3)} (${f(a.length/S.length*100,0).padStart(2)}%)  medPrice $${f(med(a.map(t=>t.ent)),0).padStart(4)}  med30mATR $${f(med(a.map(t=>t.m30)))}  ${st(a)}`);});
console.log("\n  implied: at an $18 unit and a stop of 0.27x the 30m ATR, shares ~= 66 / 30mATR");
[2,4,6,10,20,40].forEach(m=>console.log(`     30mATR $${String(m).padStart(2)}  ->  stop ~$${f(0.27*m)}  ->  ~${Math.floor(18/(0.27*m))} shares at \$18 risk`));

console.log("\n################ N. PER-SYMBOL NEGATIVES (CI excludes zero, both books)");
const SY={};ALL.forEach(t=>(SY[t.sym]||=[]).push(t));
Object.entries(SY).filter(([k,a])=>a.length>=5).forEach(([k,a])=>{
  const ci=L.bootCI(R(a)); if(ci[1]<0||ci[0]>0) console.log(`  ${k.padEnd(7)} ${st(a)}`);});

console.log("\n################ O. WHAT A DAY LOOKS LIKE");
const byDay=L.byDay(ALL), days=L.days(ALL);
const cnt=days.map(d=>byDay[d].length);
console.log(`  ${days.length} sessions | trades/session: med ${med(cnt)} p90 ${pctl(cnt,.9)} max ${Math.max(...cnt)}`);
console.log(`  first entry median ${(()=>{const s=med(days.map(d=>byDay[d][0].t));return String(Math.floor(s/3600)).padStart(2,"0")+":"+String(Math.floor(s%3600/60)).padStart(2,"0");})()}`);
console.log(`  distinct symbols per session: med ${med(days.map(d=>new Set(byDay[d].map(t=>t.sym)).size))}`);
const green=days.filter(d=>sum(R(byDay[d]))>0).length;
console.log(`  green sessions ${green}/${days.length} = ${f(green/days.length*100,0)}%`);
console.log(`  session R: p10 ${f(pctl(days.map(d=>sum(R(byDay[d]))),.1),1)}  med ${f(med(days.map(d=>sum(R(byDay[d])))),1)}  p90 ${f(pctl(days.map(d=>sum(R(byDay[d]))),.9),1)}`);
