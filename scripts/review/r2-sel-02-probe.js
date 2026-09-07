const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, R } = L;
// What ARE #1m / #5m / #1H ? cross-tab against entry time.
console.log("date       sym    entry     #1m #5m #1H   R");
live.slice(0,30).forEach(t=>console.log(t.date, t.sym.padEnd(6), t.entry.padStart(8),
  String(t.n1m).padStart(4), String(t.n5m).padStart(4), String(t.n1h).padStart(4), f(t.pnlR).padStart(6)));
const corr = (a,b) => { const n=a.length,ma=mean(a),mb=mean(b);
  return L.sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(L.sum(a.map(x=>(x-ma)**2))*L.sum(b.map(x=>(x-mb)**2))); };
const w = live.filter(t=>!isNaN(t.n5m)&&!isNaN(t.t));
console.log("\ncorr(entrySec, #1m)=", f(corr(w.map(t=>t.t), w.map(t=>t.n1m)),3));
console.log("corr(entrySec, #5m)=", f(corr(w.map(t=>t.t), w.map(t=>t.n5m)),3));
console.log("corr(entrySec, #1H)=", f(corr(w.map(t=>t.t), w.map(t=>t.n1h)),3));
console.log("\ndistribution #5m live:", JSON.stringify(live.reduce((a,t)=>{a[t.n5m]=(a[t.n5m]||0)+1;return a;},{})));
console.log("distribution #1H live:", JSON.stringify(live.reduce((a,t)=>{a[t.n1h]=(a[t.n1h]||0)+1;return a;},{})));
console.log("distribution #1m live:", JSON.stringify(live.reduce((a,t)=>{a[t.n1m]=(a[t.n1m]||0)+1;return a;},{})));
console.log("\n#5m=0 trades entry times:", live.filter(t=>t.n5m===0).map(t=>t.entry).join(" "));
console.log("#5m>=1 min entry time:", Math.min(...live.filter(t=>t.n5m>=1).map(t=>t.t)));
console.log("\nEntry time buckets vs #5m:");
[[0,570*60+300],[570*60+300,1e9]].forEach(([a,b])=>{
  const g = live.filter(t=>t.t>=a&&t.t<b);
  console.log(" bucket", a, "n="+g.length, "mean#5m="+f(mean(g.map(t=>t.n5m))), "mean#1H="+f(mean(g.map(t=>t.n1h))));
});
// header names present?
console.log("\nheaders containing '#':", live[0].hdr.filter(h=>h.includes("#")).join(" | "));
