const L=require("./lib.js"); const {f,mean,med,sum,R}=L;
const bad=L.live.filter(t=>t.maxR===0&&t.pnlR>0);
console.log("LIVE trades with MFE(maxR)=0 but realized R>0:", bad.length);
bad.forEach(t=>console.log(`  ${t.date} ${t.sym.padEnd(5)} ${t.entry} R=${f(t.pnlR)} maxR=${f(t.maxR)} mae=${f(t.mae)} risk=${f(t.risk)}`));
console.log("\nsame in practice:", L.practice.filter(t=>t.maxR===0&&t.pnlR>0).length);
console.log("\nmaxR=0 overall live:", L.live.filter(t=>t.maxR===0).length, " of which winners:", bad.length);
console.log("\n=> MFE-based comparisons on live are corrupted for these", bad.length, "trades (they are 5 of the 8 biggest winners).");
const T935=9*3600+35*60;
console.log("of which pre-9:35:", bad.filter(t=>t.t<T935).length, " 9:35+:", bad.filter(t=>t.t>=T935).length);
