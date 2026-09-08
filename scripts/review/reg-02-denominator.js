/* REGIME TRACK 2 — THE R-DENOMINATOR ARTIFACT (brief artifact #1).
   avgWin went 1.76R -> 3.79R while avgLoss stayed -0.61R. Either the market moved more,
   he captured more, or THE DENOMINATOR SHRANK. Test the denominator first. */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, days } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("2A. RISK UNIT IN DOLLARS");
function riskDist(T,lbl){
  const r = T.map(t=>t.risk).filter(ok);
  const c={}; r.forEach(x=>c[x]=(c[x]||0)+1);
  P(`${lbl}: n=${r.length}/${T.length}  mean=$${f(mean(r))} med=$${f(med(r))} min=$${f(Math.min(...r))} max=$${f(Math.max(...r))}`);
  P(`   counts: ${Object.entries(c).sort((a,b)=>+a[0]-+b[0]).map(([k,v])=>`$${k}x${v}`).join("  ")}`);
}
riskDist(practice,"practice"); riskDist(live,"live    ");

line("2B. STOP DISTANCE — the actual R denominator, in price terms");
// R($) = shares * stopDistance. Normalise stop distance by price and by ATR/ADR.
function stopStats(T,lbl){
  const rows = T.filter(t=>ok(t.ent)&&ok(t.stop)&&t.stop>0).map(t=>{
    const d = Math.abs(t.ent - t.stop);
    return { d, pct: d/t.ent*100, vsATR: ok(t.atr)&&t.atr>0 ? d/t.atr : NaN,
             vsADR: ok(t.adr)&&t.adr>0 ? d/t.adr : NaN, vsM30: ok(t.m30)&&t.m30>0 ? d/t.m30 : NaN,
             vsOR: ok(t.orSize)&&t.orSize>0 ? d/t.orSize : NaN, price:t.ent };
  });
  const g = k => rows.map(r=>r[k]).filter(ok);
  P(`${lbl} n=${rows.length}`);
  P(`   stopDist $        med=${f(med(g("d")),3)}  mean=${f(mean(g("d")),3)}`);
  P(`   stopDist %price   med=${f(med(g("pct")),3)}%  mean=${f(mean(g("pct")),3)}%`);
  P(`   stopDist / ATR    med=${f(med(g("vsATR")),3)}  mean=${f(mean(g("vsATR")),3)}  n=${g("vsATR").length}`);
  P(`   stopDist / ADR    med=${f(med(g("vsADR")),3)}  mean=${f(mean(g("vsADR")),3)}  n=${g("vsADR").length}`);
  P(`   stopDist / 30mATR med=${f(med(g("vsM30")),3)}  mean=${f(mean(g("vsM30")),3)}  n=${g("vsM30").length}`);
  P(`   stopDist / ORsize med=${f(med(g("vsOR")),3)}  mean=${f(mean(g("vsOR")),3)}  n=${g("vsOR").length}`);
  P(`   entry price       med=$${f(med(g("price")),2)}`);
  return rows;
}
const ps = stopStats(practice,"practice"), ls = stopStats(live,"live    ");
["pct","vsATR","vsADR","vsM30","vsOR"].forEach(k=>{
  const a=ls.map(r=>r[k]).filter(ok), b=ps.map(r=>r[k]).filter(ok);
  P(`   permP live-vs-practice on ${k.padEnd(6)} = ${f(permP(a,b),4)}   (live mean ${f(mean(a),3)} vs prac ${f(mean(b),3)})`);
});

line("2C. IS THE R DENOMINATOR CONSISTENT WITH SHARES*STOPDIST?");
function coherence(T,lbl){
  const rows=T.filter(t=>ok(t.risk)&&ok(t.sh)&&ok(t.ent)&&ok(t.stop)&&t.stop>0);
  const rat=rows.map(t=>t.risk/(t.sh*Math.abs(t.ent-t.stop))).filter(ok);
  P(`${lbl}: n=${rat.length} med(R$ / shares*stopDist)=${f(med(rat),3)} (1.00 = coherent)`);
}
coherence(practice,"practice"); coherence(live    ,"live    ");

line("2D. THE DECISIVE TEST — measure the SAME trades in a DENOMINATOR-FREE unit");
// Convert every trade's realised P&L into (a) % of entry price, (b) multiples of the stock's ADR,
// (c) multiples of 30mATR.  These do NOT depend on where he put his stop.
function priceMove(t){
  if(!ok(t.ent)||!ok(t.ex)) return NaN;
  const dir = /shrt|short|sell/i.test(t.side) ? -1 : 1;
  return dir*(t.ex-t.ent);
}
function neutral(T,lbl){
  const rows=T.map(t=>{const m=priceMove(t);return{
    pct: ok(m)&&ok(t.ent)? m/t.ent*100:NaN,
    adr: ok(m)&&ok(t.adr)&&t.adr>0? m/t.adr:NaN,
    m30: ok(m)&&ok(t.m30)&&t.m30>0? m/t.m30:NaN, r:t.pnlR }});
  const g=k=>rows.map(r=>r[k]).filter(ok);
  P(`${lbl}  n=${T.length}`);
  ["pct","adr","m30"].forEach(k=>{
    const a=g(k), ci=bootCI(a);
    P(`   move/${k.padEnd(4)} mean=${f(mean(a),4).padStart(8)} [${f(ci[0],4)},${f(ci[1],4)}] med=${f(med(a),4).padStart(8)} sum=${f(sum(a),2).padStart(8)} n=${a.length}`);
  });
  return rows;
}
const pn=neutral(practice,"practice"), ln=neutral(live    ,"live    ");
P("");
["pct","adr","m30"].forEach(k=>{
  const a=ln.map(r=>r[k]).filter(ok), b=pn.map(r=>r[k]).filter(ok);
  P(`   permP live-vs-practice on realised move/${k.padEnd(4)} = ${f(permP(a,b),4)}`);
});
// and the winners only, in denominator-free units
P("\n   WINNERS ONLY, denominator-free:");
["pct","adr","m30"].forEach(k=>{
  const a=ln.filter(r=>r.r>0).map(r=>r[k]).filter(ok), b=pn.filter(r=>r.r>0).map(r=>r[k]).filter(ok);
  P(`   winner move/${k.padEnd(4)}: live mean=${f(mean(a),4)} (n=${a.length}) prac=${f(mean(b),4)} (n=${b.length}) permP=${f(permP(a,b),4)}`);
});
P("\n   LOSERS ONLY, denominator-free:");
["pct","adr","m30"].forEach(k=>{
  const a=ln.filter(r=>r.r<=0).map(r=>r[k]).filter(ok), b=pn.filter(r=>r.r<=0).map(r=>r[k]).filter(ok);
  P(`   loser  move/${k.padEnd(4)}: live mean=${f(mean(a),4)} (n=${a.length}) prac=${f(mean(b),4)} (n=${b.length}) permP=${f(permP(a,b),4)}`);
});

line("2E. MFE (Max R Before Stop) — what the market OFFERED, in R and denominator-free");
function mfe(T,lbl){
  const m=T.map(t=>t.maxR).filter(ok);
  const ci=bootCI(m);
  P(`${lbl} MFE(R): n=${m.length}/${T.length} mean=${f(mean(m),3)} [${f(ci[0],2)},${f(ci[1],2)}] med=${f(med(m),2)} ` +
    `>=1R ${f(m.filter(x=>x>=1).length/m.length*100,0)}% >=2R ${f(m.filter(x=>x>=2).length/m.length*100,0)}% >=3R ${f(m.filter(x=>x>=3).length/m.length*100,0)}%`);
  return m;
}
const pm=mfe(practice,"practice"), lm=mfe(live    ,"live    ");
P(`   permP MFE(R) = ${f(permP(lm,pm),4)}`);
// MFE in denominator-free terms: MFE_R * stopDist / ADR  = favourable excursion in ADRs
function mfeNeutral(T,lbl){
  const rows=T.filter(t=>ok(t.maxR)&&ok(t.ent)&&ok(t.stop)&&t.stop>0).map(t=>{
    const d=Math.abs(t.ent-t.stop), exc=t.maxR*d;
    return { adr: ok(t.adr)&&t.adr>0? exc/t.adr:NaN, m30: ok(t.m30)&&t.m30>0? exc/t.m30:NaN,
             pct: exc/t.ent*100 };
  });
  const g=k=>rows.map(r=>r[k]).filter(ok);
  P(`${lbl} MFE denominator-free: /ADR mean=${f(mean(g("adr")),3)} med=${f(med(g("adr")),3)} | /30mATR mean=${f(mean(g("m30")),3)} med=${f(med(g("m30")),3)} | %price mean=${f(mean(g("pct")),3)}`);
  return rows;
}
const pmn=mfeNeutral(practice,"practice"), lmn=mfeNeutral(live    ,"live    ");
["adr","m30","pct"].forEach(k=>{
  const a=lmn.map(r=>r[k]).filter(ok), b=pmn.map(r=>r[k]).filter(ok);
  P(`   permP MFE/${k.padEnd(4)} = ${f(permP(a,b),4)}`);
});

line("2F. CAPTURE — realised R / MFE R (execution, denominator-cancels)");
function capture(T,lbl){
  const rows=T.filter(t=>ok(t.pnlR)&&ok(t.maxR)&&t.maxR>0.05);
  const c=rows.map(t=>t.pnlR/t.maxR);
  const ci=bootCI(c);
  P(`${lbl} capture=realR/MFE: n=${rows.length} mean=${f(mean(c),3)} [${f(ci[0],3)},${f(ci[1],3)}] med=${f(med(c),3)}`);
  return c;
}
const pc=capture(practice,"practice"), lc=capture(live,"live    ");
P(`   permP capture = ${f(permP(lc,pc),4)}`);
// Target-capture style: among trades whose MFE >= 2.5, mean(min(realR,2.5))/2.5
[2.0,2.5,3.0].forEach(T0=>{
  const c=(A)=>{const s=A.filter(t=>ok(t.maxR)&&t.maxR>=T0&&ok(t.pnlR));
    return {n:s.length, v:mean(s.map(t=>Math.min(t.pnlR,T0)/T0))};};
  const a=c(live), b=c(practice);
  P(`   target ${T0}R capture: live n=${a.n} ${f(a.v*100,1)}%  |  practice n=${b.n} ${f(b.v*100,1)}%`);
});
