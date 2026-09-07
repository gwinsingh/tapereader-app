/* REGIME TRACK 4 — MFE DATA INTEGRITY.
   3D showed live trades with realised +8.2R but Max R Before Stop = 0.00. Impossible.
   Every MFE-based comparison must be re-run on the CLEAN subset only. */
const L = require("./lib.js");
const { live, practice, sum, mean, med, f, R, bootCI, permP } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("4A. HOW BROKEN IS MFE?");
function audit(T,lbl){
  const n=T.length;
  const blank=T.filter(t=>!ok(t.maxR)).length;
  const zero=T.filter(t=>ok(t.maxR)&&t.maxR===0).length;
  const impossible=T.filter(t=>ok(t.maxR)&&ok(t.pnlR)&&t.pnlR>0&&t.maxR<t.pnlR-0.001);
  P(`${lbl}: n=${n} blankMFE=${blank} MFE==0 =${zero} (${f(zero/n*100,1)}%)  IMPOSSIBLE(MFE<realR & realR>0)=${impossible.length}`);
  const zw=T.filter(t=>ok(t.maxR)&&t.maxR===0&&ok(t.pnlR)&&t.pnlR>0);
  P(`   of the MFE==0 rows, ${zw.length} are WINNERS totalling ${f(sum(zw.map(t=>t.pnlR)),1)}R`);
  return impossible;
}
const pI=audit(practice,"practice"), lI=audit(live    ,"live    ");
P("\n   live impossible rows:");
lI.slice(0,25).forEach(t=>P(`     ${t.date} ${t.sym.padEnd(6)} realR=${f(t.pnlR,2).padStart(5)} MFE=${f(t.maxR,2)} risk=${f(t.risk,0)} part=${t.part} dur=${f(t.dur,0)}`));
P(`\n   practice impossible rows: ${pI.length}`);
pI.slice(0,15).forEach(t=>P(`     ${t.date} ${t.sym.padEnd(6)} realR=${f(t.pnlR,2).padStart(5)} MFE=${f(t.maxR,2)} part=${t.part}`));

line("4B. IS 'MFE==0' A MISSING-DATA SENTINEL? cross-check with MAE");
function sent(T,lbl){
  const z=T.filter(t=>ok(t.maxR)&&t.maxR===0);
  const zMaeBlank=z.filter(t=>!ok(t.mae)).length, zMae0=z.filter(t=>ok(t.mae)&&t.mae===0).length;
  P(`${lbl}: MFE==0 rows=${z.length}; of those MAE blank=${zMaeBlank} MAE==0=${zMae0}`);
  P(`   MFE==0 & realR>0 : ${z.filter(t=>t.pnlR>0).length}   MFE==0 & realR<=0 : ${z.filter(t=>t.pnlR<=0).length}`);
  // partials: MFE enrichment requires R filled; check partial counts
  P(`   MFE==0 rows mean #Partials=${f(mean(z.map(t=>t.part).filter(ok)),2)} vs all=${f(mean(T.map(t=>t.part).filter(ok)),2)}`);
  P(`   MFE==0 rows mean dur=${f(mean(z.map(t=>t.dur).filter(ok)),1)}m vs all=${f(mean(T.map(t=>t.dur).filter(ok)),1)}m`);
}
sent(practice,"practice"); sent(live    ,"live    ");

line("4C. RE-RUN THE MFE COMPARISON ON THE CLEAN SUBSET");
// clean = MFE present AND MFE >= max(realR,0) - eps  (i.e. internally consistent)
const clean = T => T.filter(t=>ok(t.maxR)&&ok(t.pnlR)&&t.maxR>=Math.max(t.pnlR,0)-0.001);
const pc=clean(practice), lc=clean(live);
P(`clean practice n=${pc.length}/${practice.length} (${f(pc.length/practice.length*100,0)}%)   clean live n=${lc.length}/${live.length} (${f(lc.length/live.length*100,0)}%)`);
P(`   dropped-from-live sumR = ${f(sum(R(live))-sum(R(lc)),1)}R of ${f(sum(R(live)),1)}R  <<< how much of the month is unauditable`);
P(`   dropped-from-prac sumR = ${f(sum(R(practice))-sum(R(pc)),1)}R of ${f(sum(R(practice)),1)}R`);
P(L.st(pc,"practice CLEAN")); P(L.st(lc,"live CLEAN"));
function mfeC(T,lbl){
  const m=T.map(t=>t.maxR).filter(ok), ci=bootCI(m);
  P(`${lbl} MFE(R) n=${m.length} mean=${f(mean(m),3)} [${f(ci[0],2)},${f(ci[1],2)}] med=${f(med(m),2)} >=1R ${f(m.filter(x=>x>=1).length/m.length*100,0)}% >=2R ${f(m.filter(x=>x>=2).length/m.length*100,0)}% >=3R ${f(m.filter(x=>x>=3).length/m.length*100,0)}%`);
  return m;
}
const pmC=mfeC(pc,"practice CLEAN"), lmC=mfeC(lc,"live CLEAN    ");
P(`   permP MFE(R) clean = ${f(permP(lmC,pmC),4)}`);
// denominator-free MFE on clean
const sdist=t=>Math.abs(t.ent-t.stop);
function mfeN(T,lbl){
  const rows=T.filter(t=>ok(t.adr)&&t.adr>0&&ok(sdist(t))).map(t=>t.maxR*sdist(t)/t.adr);
  const rows2=T.filter(t=>ok(t.m30)&&t.m30>0&&ok(sdist(t))).map(t=>t.maxR*sdist(t)/t.m30);
  P(`${lbl} MFE/ADR mean=${f(mean(rows),3)} med=${f(med(rows),3)} (n=${rows.length}) | MFE/30mATR mean=${f(mean(rows2),3)} med=${f(med(rows2),3)}`);
  return [rows,rows2];
}
const [pa,pb]=mfeN(pc,"practice CLEAN"), [la,lb]=mfeN(lc,"live CLEAN    ");
P(`   permP MFE/ADR clean=${f(permP(la,pa),4)}   permP MFE/30mATR clean=${f(permP(lb,pb),4)}`);

line("4D. CAPTURE ON THE CLEAN SUBSET (execution)");
function cap(T,lbl){
  const s=T.filter(t=>t.maxR>0.05);
  const c=s.map(t=>t.pnlR/t.maxR), ci=bootCI(c);
  P(`${lbl} n=${s.length} capture mean=${f(mean(c),3)} [${f(ci[0],3)},${f(ci[1],3)}] med=${f(med(c),3)}`);
  return c;
}
const cP=cap(pc,"practice CLEAN"), cL=cap(lc,"live CLEAN    ");
P(`   permP capture clean = ${f(permP(cL,cP),4)}`);
[2,2.5,3].forEach(T0=>{
  const g=A=>{const s=A.filter(t=>t.maxR>=T0);return{n:s.length,v:mean(s.map(t=>Math.min(t.pnlR,T0)/T0))};};
  const a=g(lc), b=g(pc);
  P(`   target ${T0}R capture CLEAN: live n=${a.n}${a.n<15?"*":" "} ${f(a.v*100,1)}%  |  practice n=${b.n} ${f(b.v*100,1)}%`);
});

line("4E. WHAT IF the MFE==0 winners are simply un-enriched? impute MFE = realised R");
// Lower bound on MFE: a trade that realised +X R had MFE >= X.
const imp = T => T.map(t=>({...t, mfeLB: ok(t.maxR)? Math.max(t.maxR, ok(t.pnlR)?t.pnlR:0) : (ok(t.pnlR)?Math.max(t.pnlR,0):NaN)}));
const pi=imp(practice), li=imp(live);
const g=(A,lbl)=>{const m=A.map(t=>t.mfeLB).filter(ok);P(`${lbl} MFE-lower-bound mean=${f(mean(m),3)} med=${f(med(m),2)} n=${m.length}`);return m;};
const gp=g(pi,"practice"), gl=g(li,"live    ");
P(`   permP = ${f(permP(gl,gp),4)}  (still a lower bound; direction is what matters)`);
