const L=require("./lib.js"); const {f}=L;
const bad=L.live.filter(t=>t.maxR===0&&t.pnlR>0);
console.log("sym    date        ent      ex      stop    risk  sh  part  pnlR  maxR  mae   orH     orL");
bad.forEach(t=>console.log(`${t.sym.padEnd(6)} ${t.date} ${f(t.ent).padStart(8)} ${f(t.ex).padStart(8)} ${f(t.stop).padStart(8)} ${f(t.risk,0).padStart(4)} ${f(t.sh,0).padStart(3)} ${f(t.part,0).padStart(4)} ${f(t.pnlR).padStart(5)} ${f(t.maxR).padStart(5)} ${f(t.mae).padStart(5)} ${f(t.orH).padStart(8)} ${f(t.orL).padStart(8)}`));
console.log("\nnormal winners for contrast:");
L.live.filter(t=>t.pnlR>0&&t.maxR>0).forEach(t=>console.log(`${t.sym.padEnd(6)} ${t.date} ${f(t.ent).padStart(8)} ${f(t.ex).padStart(8)} ${f(t.stop).padStart(8)} ${f(t.risk,0).padStart(4)} ${f(t.sh,0).padStart(3)} ${f(t.part,0).padStart(4)} ${f(t.pnlR).padStart(5)} ${f(t.maxR).padStart(5)} ${f(t.mae).padStart(5)}`));
console.log("\nstop vs entry sign check on bad set: stop>entry?", bad.map(t=>t.stop>t.ent).join(","));
console.log("shares vs risk/(ent-stop):", bad.map(t=>f(t.risk/Math.abs(t.ent-t.stop),0)+"/"+f(t.sh,0)).join("  "));
