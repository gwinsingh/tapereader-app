/* REGIME TRACK 7 — THE CORRECT NULL, plus robustness.
   The right question is NOT "could ALL of practice produce +23.1R in 19 sessions?"
   It is "could the REGIME-MATCHED (low-VIX) practice pool produce +23.1R in 19 sessions?" */
const L = require("./lib.js");
const { live, practice, sum, mean, med, sd, f, R, bootCI, permP, byDay, days, dayR } = L;
const P = s => console.log(s);
const line = t => P("\n" + "=".repeat(78) + "\n" + t + "\n" + "=".repeat(78));
const ok = x => !isNaN(x);

line("7A. THE REGIME-MATCHED NULL");
const LOV=14.25, HIV=17.09;
const pIn = practice.filter(t=>ok(t.vix)&&t.vix>=LOV&&t.vix<=HIV);
const pInDays = dayR(pIn);
P(`regime-matched practice pool: ${pIn.length} trades over ${pInDays.length} sessions, sumR=${f(sum(R(pIn)),1)}, expR=${f(mean(R(pIn)),3)}`);
function blockTail(sessions,k,target,iters=200000){
  let c=0;const sums=[];
  for(let i=0;i<iters;i++){let s=0;for(let j=0;j<k;j++)s+=sessions[(Math.random()*sessions.length)|0].r;sums.push(s);if(s>=target)c++;}
  sums.sort((a,b)=>a-b);
  return {p:c/iters,med:sums[iters>>1],lo:sums[Math.floor(.025*iters)],hi:sums[Math.floor(.975*iters)],p95:sums[Math.floor(.95*iters)]};
}
const TGT=sum(R(live));
const allD=dayR(practice);
const a1=blockTail(allD,19,TGT), a2=blockTail(pInDays,19,TGT);
P(`NULL A  all-practice sessions      : median=${f(a1.med,1)} 95%CI=[${f(a1.lo,1)},${f(a1.hi,1)}]  P(>=+${f(TGT,1)}R) = ${f(a1.p*100,2)}%`);
P(`NULL B  regime-matched sessions    : median=${f(a2.med,1)} 95%CI=[${f(a2.lo,1)},${f(a2.hi,1)}]  P(>=+${f(TGT,1)}R) = ${f(a2.p*100,2)}%  <<< THE CORRECT NULL`);
// also match trade count (71) rather than session count
function tradeTail(arr,n,target,iters=200000){let c=0;const s=[];
  for(let i=0;i<iters;i++){let x=0;for(let j=0;j<n;j++)x+=arr[(Math.random()*arr.length)|0];s.push(x);if(x>=target)c++;}
  s.sort((p,q)=>p-q);return {p:c/iters,med:s[iters>>1],p95:s[Math.floor(.95*iters)]};}
const t1=tradeTail(R(practice),71,TGT), t2=tradeTail(R(pIn),71,TGT);
P(`NULL C  71 trades from all practice   : median=${f(t1.med,1)} P(>=)=${f(t1.p*100,2)}%`);
P(`NULL D  71 trades from regime-matched : median=${f(t2.med,1)} P(>=)=${f(t2.p*100,2)}%`);

line("7B. DECOMPOSITION OF THE +23.1R vs -6.3R GAP (all in R, per-71-trades)");
const base = mean(R(practice))*71;
const reg  = mean(R(pIn))*71;
P(`  full-practice baseline, 71 trades          = ${f(base,1)}R`);
P(`  regime-matched practice baseline, 71 trades= ${f(reg,1)}R`);
P(`  actual live                                = ${f(TGT,1)}R`);
P(``);
P(`  ATTRIBUTABLE TO REGIME (low VIX)   = ${f(reg-base,1)}R   [ permP practice in-band vs out-of-band = ${f(permP(R(pIn),R(practice.filter(t=>ok(t.vix)&&(t.vix<LOV||t.vix>HIV)))),4)} ]`);
P(`  RESIDUAL (live vs regime-matched)  = ${f(TGT-reg,1)}R   [ permP live vs practice-in-band = ${f(permP(R(live),R(pIn)),4)} ]`);
P(`  ==> the residual is NOT distinguishable from zero.`);
// bootstrap CI on the residual
function bootDiff(a,b,iters=20000){const o=[];
  for(let i=0;i<iters;i++){let s=0;for(let j=0;j<a.length;j++)s+=a[(Math.random()*a.length)|0];
    let s2=0;for(let j=0;j<b.length;j++)s2+=b[(Math.random()*b.length)|0];
    o.push(s/a.length-s2/b.length);}
  o.sort((x,y)=>x-y);return [o[Math.floor(.025*iters)],o[Math.floor(.975*iters)]];}
const bd=bootDiff(R(live),R(pIn));
P(`  residual per-trade 95% CI = [${f(bd[0],3)}, ${f(bd[1],3)}]R  => over 71 trades [${f(bd[0]*71,1)}, ${f(bd[1]*71,1)}]R`);

line("7C. ROBUSTNESS — does the live <=9:35 result survive dropping the top winners?");
const l935=live.filter(t=>ok(t.t)&&t.t<=9*3600+35*60);
P(L.st(l935,"live <=9:35 (all)"));
[1,2,3].forEach(k=>{
  const s=[...l935].filter(t=>ok(t.pnlR)).sort((x,y)=>y.pnlR-x.pnlR).slice(k);
  P(`   drop top ${k}: n=${s.length} sumR=${f(sum(s.map(t=>t.pnlR)),1)} expR=${f(mean(s.map(t=>t.pnlR)),3)}`);
});
// is the same true in the regime-matched practice pool? (out-of-sample check on the mechanism)
const pIn935=pIn.filter(t=>ok(t.t)&&t.t<=9*3600+35*60), pInL=pIn.filter(t=>ok(t.t)&&t.t>9*3600+35*60);
P(L.st(pIn935,"regime-matched prac <=9:35"));
P(L.st(pInL  ,"regime-matched prac >9:35 "));
P(`   permP within regime-matched practice = ${f(permP(R(pIn935),R(pInL)),4)}`);
P(`   permP within live                    = ${f(permP(R(l935),R(live.filter(t=>ok(t.t)&&t.t>9*3600+35*60))),4)}`);
P(`   ==> H8 said <=9:35 UNDERperforms. Practice(all) sumR=${f(sum(R(practice.filter(t=>ok(t.t)&&t.t<=9*3600+35*60))),1)}, live sumR=${f(sum(R(l935)),1)}`);

line("7D. THE PERIOD/SIZE CONFOUND — $14 vs $18 is really 'first half vs second half'");
const d=byDay(live);
const early=live.filter(t=>t.date<="2026-08-13"), late=live.filter(t=>t.date>"2026-08-13");
P(L.st(early,"live 7/30-8/13 (mostly $14)"));
P(L.st(late ,"live 8/14-8/28 (mostly $18)"));
P(`   permP early-vs-late = ${f(permP(R(early),R(late)),4)}`);
const r14=live.filter(t=>t.risk===14), r18=live.filter(t=>t.risk===18);
P(`   $14 trades: ${r14.filter(t=>t.date<="2026-08-13").length}/${r14.length} fall in the EARLY window`);
P(`   $18 trades: ${r18.filter(t=>t.date> "2026-08-13").length}/${r18.length} fall in the LATE  window`);
P(`   ==> risk unit and calendar period are ~perfectly collinear; the sizing question is UNIDENTIFIABLE.`);
// same check in practice
const p14=practice.filter(t=>t.risk===14), p28=practice.filter(t=>t.risk===28);
P(`   practice $14 date range ${p14.map(t=>t.date).sort()[0]} .. ${p14.map(t=>t.date).sort().slice(-1)[0]}`);
P(`   practice $28 date range ${p28.map(t=>t.date).sort()[0]} .. ${p28.map(t=>t.date).sort().slice(-1)[0]}`);
const ov=new Set(p14.map(t=>t.date)); const shared=[...new Set(p28.map(t=>t.date))].filter(x=>ov.has(x));
P(`   practice dates where BOTH $14 and $28 were used: ${shared.length}`);

line("7E. HOLD-LONGER BEHAVIOUR — is it visible independent of outcome?");
// Use MFE-clean trades only; compare time-to-exit conditional on the trade reaching >=1R MFE
const clean=T=>T.filter(t=>ok(t.maxR)&&ok(t.pnlR)&&t.maxR>=Math.max(t.pnlR,0)-0.001);
[["practice",clean(practice)],["live",clean(live)]].forEach(([lbl,T])=>{
  const s=T.filter(t=>t.maxR>=1&&ok(t.dur));
  P(`   ${lbl.padEnd(9)} MFE>=1R: n=${String(s.length).padStart(3)} med dur=${f(med(s.map(t=>t.dur)),1)}m med partials=${f(med(s.map(t=>t.part).filter(ok)),1)} capture=${f(mean(s.map(t=>t.pnlR/t.maxR))*100,1)}%`);
});
// partials trend within live over time
P("   live #partials by half:");
P(`     early med=${f(med(early.map(t=>t.part).filter(ok)),1)} mean=${f(mean(early.map(t=>t.part).filter(ok)),2)}`);
P(`     late  med=${f(med(late.map(t=>t.part).filter(ok)),1)} mean=${f(mean(late.map(t=>t.part).filter(ok)),2)}`);
P(`     permP = ${f(permP(early.map(t=>t.part).filter(ok),late.map(t=>t.part).filter(ok)),4)}`);

line("7F. MAE — deeper in live. artifact or behaviour?");
// MAE <= -1 means price traded through the stop while he was still in.
[["practice",practice],["live",live]].forEach(([lbl,T])=>{
  const m=T.map(t=>t.mae).filter(ok);
  P(`   ${lbl.padEnd(9)} n=${m.length} med=${f(med(m),3)} share MAE<=-1.0R = ${f(m.filter(x=>x<=-1).length/m.length*100,1)}%  share MAE<=-1.5R = ${f(m.filter(x=>x<=-1.5).length/m.length*100,1)}%`);
  // among WINNERS: did he sit through drawdown and get paid?
  const w=T.filter(t=>ok(t.mae)&&ok(t.pnlR)&&t.pnlR>0).map(t=>t.mae);
  P(`   ${"".padEnd(9)} winners' MAE med=${f(med(w),3)} (n=${w.length})  share of winners with MAE<=-1R = ${f(w.filter(x=>x<=-1).length/w.length*100,1)}%`);
});
