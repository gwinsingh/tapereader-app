/* REGIME TRACK 3 — HOW is +23.1R constructed, given that
     - stop distance (the R denominator) is statistically identical across books
     - MFE (what the market offered) is LOWER in live
     - realised move in denominator-free units is NOT different (permP 0.74)
   sumR = sum_i (move_i / stopDist_i). So sumR is sensitive to the COVARIANCE between
   stop tightness and move size. Test whether that covariance, not skill, carries the month. */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, dayR, days } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);
const dirOf = t => /shrt|short|sell/i.test(t.side) ? -1 : 1;
const move = t => (ok(t.ent)&&ok(t.ex)) ? dirOf(t)*(t.ex-t.ent) : NaN;
const sdist = t => (ok(t.ent)&&ok(t.stop)&&t.stop>0) ? Math.abs(t.ent-t.stop) : NaN;

line("3A. STOP TIGHTNESS ON WINNERS vs LOSERS (the covariance channel)");
function tight(T,lbl){
  const rows=T.filter(t=>ok(sdist(t))&&ok(t.pnlR)&&ok(t.adr)&&t.adr>0)
    .map(t=>({w:t.pnlR>0, s:sdist(t)/t.adr, r:t.pnlR}));
  const W=rows.filter(r=>r.w).map(r=>r.s), Ls=rows.filter(r=>!r.w).map(r=>r.s);
  P(`${lbl} stopDist/ADR  winners med=${f(med(W),3)} mean=${f(mean(W),3)} (n=${W.length}) | losers med=${f(med(Ls),3)} mean=${f(mean(Ls),3)} (n=${Ls.length})  permP=${f(permP(W,Ls),4)}`);
  // rank correlation between stop tightness and realised R
  const xs=rows.map(r=>r.s), ys=rows.map(r=>r.r);
  P(`   spearman(stopDist/ADR , realisedR) = ${f(spearman(xs,ys),3)}   (negative = tight stops paid)`);
}
function rank(a){const idx=a.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]);const r=new Array(a.length);
  let i=0;while(i<idx.length){let j=i;while(j+1<idx.length&&idx[j+1][0]===idx[i][0])j++;const av=(i+j)/2+1;
  for(let k=i;k<=j;k++)r[idx[k][1]]=av;i=j+1;}return r;}
function spearman(a,b){const ra=rank(a),rb=rank(b);const ma=mean(ra),mb=mean(rb);
  let n=0,da=0,db=0;for(let i=0;i<ra.length;i++){n+=(ra[i]-ma)*(rb[i]-mb);da+=(ra[i]-ma)**2;db+=(rb[i]-mb)**2;}
  return n/Math.sqrt(da*db);}
tight(practice,"practice"); tight(live    ,"live    ");

line("3B. COUNTERFACTUAL — hold the R denominator FIXED, recompute the book");
// Replace each trade's actual stop distance with a book-neutral one: k * ADR, where k is the
// POOLED median stopDist/ADR across both books. Then pseudoR = move / (k*ADR).
// This removes every stop-tightness effect and asks: was the PRICE ACTION better in live?
const allK = [...live,...practice].map(t=>ok(sdist(t))&&ok(t.adr)&&t.adr>0?sdist(t)/t.adr:NaN).filter(ok);
const K = med(allK);
P(`pooled median stopDist/ADR = ${f(K,4)}  (used as the fixed synthetic stop)`);
function pseudo(T,lbl){
  const rows=T.filter(t=>ok(move(t))&&ok(t.adr)&&t.adr>0).map(t=>move(t)/(K*t.adr));
  const ci=bootCI(rows);
  P(`${lbl} pseudoR (fixed ADR-based stop): n=${rows.length} mean=${f(mean(rows),3)} [${f(ci[0],3)},${f(ci[1],3)}] sumR=${f(sum(rows),1)} med=${f(med(rows),3)}`);
  return rows;
}
const pP=pseudo(practice,"practice"), pL=pseudo(live    ,"live    ");
P(`   permP pseudoR = ${f(permP(pL,pP),4)}`);
P(`   ==> actual sumR: practice ${f(sum(R(practice)),1)} vs live ${f(sum(R(live)),1)}`);
P(`   ==> fixed-stop  : practice ${f(sum(pP),1)} vs live ${f(sum(pL),1)}  (per-trade ${f(mean(pP),3)} vs ${f(mean(pL),3)})`);
// scale live pseudo to 71 trades vs practice scaled to 71 trades
P(`   ==> per-71-trades equivalent: practice ${f(mean(pP)*71,1)}R  live ${f(mean(pL)*71,1)}R`);

line("3C. SAME COUNTERFACTUAL WITH A 30mATR-BASED STOP (opening-range volatility)");
const allK2=[...live,...practice].map(t=>ok(sdist(t))&&ok(t.m30)&&t.m30>0?sdist(t)/t.m30:NaN).filter(ok);
const K2=med(allK2);
P(`pooled median stopDist/30mATR = ${f(K2,4)}`);
function pseudo2(T,lbl){
  const rows=T.filter(t=>ok(move(t))&&ok(t.m30)&&t.m30>0).map(t=>move(t)/(K2*t.m30));
  const ci=bootCI(rows);
  P(`${lbl} pseudoR30: n=${rows.length} mean=${f(mean(rows),3)} [${f(ci[0],3)},${f(ci[1],3)}] sumR=${f(sum(rows),1)}`);
  return rows;
}
const q1=pseudo2(practice,"practice"), q2=pseudo2(live    ,"live    ");
P(`   permP = ${f(permP(q2,q1),4)}   per-71 equivalent: practice ${f(mean(q1)*71,1)}R live ${f(mean(q2)*71,1)}R`);

line("3D. WHICH TRADES ARE THE +23.1R? full anatomy of the top 5");
const top=[...live].filter(t=>ok(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR).slice(0,6);
top.forEach(t=>P(`  ${t.date} ${t.sym.padEnd(6)} R=${f(t.pnlR,2).padStart(5)} MFE=${f(t.maxR,2).padStart(5)} risk=$${f(t.risk,0)} `+
  `stopDist=${f(sdist(t),3)} (${f(sdist(t)/t.adr,3)} ADR) move=${f(move(t),3)} (${f(move(t)/t.adr,3)} ADR) dur=${f(t.dur,0)}m part=${t.part} entry=${t.entry} vix=${f(t.vix,2)} spy=${t.spy}`));
P("  --- practice top 5 for contrast ---");
[...practice].filter(t=>ok(t.pnlR)).sort((a,b)=>b.pnlR-a.pnlR).slice(0,5).forEach(t=>
  P(`  ${t.date} ${t.sym.padEnd(6)} R=${f(t.pnlR,2).padStart(5)} MFE=${f(t.maxR,2).padStart(5)} risk=$${f(t.risk,0)} `+
  `stopDist=${f(sdist(t),3)} (${f(sdist(t)/t.adr,3)} ADR) move=${f(move(t),3)} (${f(move(t)/t.adr,3)} ADR) dur=${f(t.dur,0)}m part=${t.part}`));

line("3E. WAS THE PRACTICE BOOK CAPPED? max winner distribution");
// practice maxWin 5.8R vs live 8.2R. Check whether practice simply never held long enough.
function tail(T,lbl){
  const r=R(T).sort((a,b)=>b-a);
  P(`${lbl} top8 R: ${r.slice(0,8).map(x=>f(x,1)).join(", ")}   #>=3R: ${r.filter(x=>x>=3).length} (${f(r.filter(x=>x>=3).length/r.length*100,1)}%)  #>=5R: ${r.filter(x=>x>=5).length}`);
  const m=T.map(t=>t.maxR).filter(ok).sort((a,b)=>b-a);
  P(`${lbl} top8 MFE: ${m.slice(0,8).map(x=>f(x,1)).join(", ")}  #MFE>=5R: ${m.filter(x=>x>=5).length} (${f(m.filter(x=>x>=5).length/m.length*100,1)}%)`);
}
tail(practice,"practice"); tail(live    ,"live    ");
// among trades with MFE>=3R, what did each book realise?
[3,5].forEach(th=>{
  ["practice","live"].forEach(nm=>{
    const T=nm==="live"?live:practice;
    const s=T.filter(t=>ok(t.maxR)&&t.maxR>=th&&ok(t.pnlR));
    P(`   MFE>=${th}R  ${nm.padEnd(9)} n=${String(s.length).padStart(3)} meanRealR=${f(mean(s.map(t=>t.pnlR)),2)} sumR=${f(sum(s.map(t=>t.pnlR)),1)} capture=${f(mean(s.map(t=>t.pnlR/t.maxR))*100,1)}%`);
  });
});

line("3F. DOLLARS SANITY — the R story vs the $ story");
P(`practice $ total = ${f(sum(practice.map(t=>t.pnl)),2)}   live $ total = ${f(sum(live.map(t=>t.pnl)),2)}`);
P(`practice $/trade = ${f(mean(practice.map(t=>t.pnl)),2)}  live $/trade = ${f(mean(live.map(t=>t.pnl)),2)}`);
const pD=practice.map(t=>t.pnl).filter(ok), lD=live.map(t=>t.pnl).filter(ok);
P(`permP on $/trade = ${f(permP(lD,pD),4)}   (NOTE: risk unit differs, this is context only)`);
P(`practice $ per unit risk = ${f(sum(practice.map(t=>t.pnl))/mean(practice.map(t=>t.risk).filter(ok)),2)}`);
P(`live     $ per unit risk = ${f(sum(live.map(t=>t.pnl))/mean(live.map(t=>t.risk).filter(ok)),2)}`);
