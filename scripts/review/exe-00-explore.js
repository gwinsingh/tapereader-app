const L = require("./lib.js");

const cov = (T, label) => {
  const n = T.length;
  const c = (name, fn) => `${name}=${T.filter(fn).length}/${n}`;
  console.log(label, n,
    c("maxR", t => !isNaN(t.maxR)),
    c("mae", t => !isNaN(t.mae)),
    c("pnlR", t => !isNaN(t.pnlR)),
    c("risk", t => !isNaN(t.risk)),
    c("part", t => !isNaN(t.part)),
    c("dur", t => !isNaN(t.dur)),
    c("right=Y/N", t => t.right === "Yes" || t.right === "No"),
  );
};
cov(L.live, "LIVE");
cov(L.practice, "PRACTICE");

console.log("\nlive risk units:", JSON.stringify(L.live.reduce((a,t)=>{a[t.risk]=(a[t.risk]||0)+1;return a;},{})));
console.log("practice risk units:", JSON.stringify(L.practice.reduce((a,t)=>{a[t.risk]=(a[t.risk]||0)+1;return a;},{})));
console.log("\nlive part dist:", JSON.stringify(L.live.reduce((a,t)=>{a[t.part]=(a[t.part]||0)+1;return a;},{})));
console.log("live right dist:", JSON.stringify(L.live.reduce((a,t)=>{a[t.right||"(blank)"]=(a[t.right||"(blank)"]||0)+1;return a;},{})));
console.log("\n", L.st(L.live, "LIVE ALL"));
console.log("", L.st(L.practice, "PRACTICE ALL"));

// sanity: does pnlR ~ pnl/risk?
const bad = L.live.filter(t => !isNaN(t.pnlR) && !isNaN(t.pnl) && !isNaN(t.risk) && Math.abs(t.pnlR - t.pnl/t.risk) > 0.02);
console.log("\npnlR mismatch rows (live):", bad.length, bad.slice(0,5).map(t=>[t.row,t.sym,t.pnl,t.risk,t.pnlR]));

// maxR vs pnlR sanity: maxR should be >= pnlR generally
const viol = L.live.filter(t => !isNaN(t.maxR) && !isNaN(t.pnlR) && t.pnlR > t.maxR + 0.05);
console.log("pnlR > maxR rows (live):", viol.length, viol.slice(0,8).map(t=>[t.row,t.date,t.sym,L.f(t.pnlR),L.f(t.maxR),L.f(t.mae)]));

// mae sign
console.log("\nmae range live:", L.f(Math.min(...L.live.map(t=>t.mae).filter(x=>!isNaN(x)))), L.f(Math.max(...L.live.map(t=>t.mae).filter(x=>!isNaN(x)))));
console.log("mae>0 count live:", L.live.filter(t=>t.mae>0).length);
console.log("maxR range live:", L.f(Math.min(...L.live.map(t=>t.maxR).filter(x=>!isNaN(x)))), L.f(Math.max(...L.live.map(t=>t.maxR).filter(x=>!isNaN(x)))));

// duration dist
const durs = L.live.map(t=>t.dur).filter(x=>!isNaN(x)).sort((a,b)=>a-b);
console.log("\nlive dur quantiles:", [0,.1,.25,.5,.75,.9,1].map(q=>L.f(durs[Math.min(durs.length-1,Math.floor(q*durs.length))],1)).join(" "));
console.log("live n<5min:", L.live.filter(t=>t.dur<5).length, " >=5min:", L.live.filter(t=>t.dur>=5).length);

// scratches
console.log("\nlive pnl==0:", L.live.filter(t=>t.pnl===0).length, "|pnlR|<0.1:", L.live.filter(t=>Math.abs(t.pnlR)<0.1).length);
