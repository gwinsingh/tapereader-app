const L = require("./lib.js");
const f=L.f,sum=L.sum,mean=L.mean,med=L.med,R=L.R;
const mfe = t => { const a=isNaN(t.maxR)?-99:t.maxR,b=isNaN(t.pnlR)?-99:t.pnlR;
  return (isNaN(t.maxR)&&isNaN(t.pnlR))?NaN:Math.max(a,b,0); };
const hdr=s=>console.log("\n"+"=".repeat(78)+"\n"+s+"\n"+"=".repeat(78));
const W=L.live.filter(t=>!isNaN(t.pnlR)), P=L.practice.filter(t=>!isNaN(t.pnlR));

hdr("H5 vs H4 — is '# Partials' anything but a duration proxy? (artifact #3)");
for(const [lab,T] of [["LIVE",W],["PRACTICE",P]]){
  console.log(`\n ${lab}: within duration bands, does partial count add anything?`);
  for(const [b,fn] of [["<5m",t=>t.dur<5],["5-15m",t=>t.dur>=5&&t.dur<15],["15m+",t=>t.dur>=15]]){
    const a=T.filter(fn),x=a.filter(t=>t.part<=2),y=a.filter(t=>t.part>=3);
    if(!x.length||!y.length){console.log(`  ${b}: one side empty (x=${x.length} y=${y.length}) -> partials IS duration here`);continue;}
    console.log(`  ${b.padEnd(6)} <=2 n=${String(x.length).padStart(3)}${x.length<15?"*":" "} expR=${f(mean(R(x))).padStart(6)} | >=3 n=${String(y.length).padStart(3)}${y.length<15?"*":" "} expR=${f(mean(R(y))).padStart(6)} | permP=${f(L.permP(R(x),R(y)),3)}`);
  }
  const c=T.filter(t=>!isNaN(t.part)&&!isNaN(t.dur));
  const mx=mean(c.map(t=>t.part)),my=mean(c.map(t=>t.dur));
  const r=sum(c.map(t=>(t.part-mx)*(t.dur-my)))/Math.sqrt(sum(c.map(t=>(t.part-mx)**2))*sum(c.map(t=>(t.dur-my)**2)));
  console.log(`  corr(part,dur)=${f(r)}`);
}

hdr("EXIT EFFICIENCY — entry-window split, opportunity-matched (live)");
{
  const A=W.filter(t=>mfe(t)>=1);
  for(const [b,fn] of [["0930-0935",t=>t.t<9*3600+35*60],["0935+",t=>t.t>=9*3600+35*60]]){
    const a=A.filter(fn);
    console.log(` ${b.padEnd(10)} n=${String(a.length).padStart(2)}${a.length<15?"*":" "} meanMFE=${f(mean(a.map(mfe)))} meanReal=${f(mean(R(a)))} effic=${f(sum(R(a))/sum(a.map(mfe))*100,0)}% medDur=${f(med(a.map(t=>t.dur)),1)}`);
  }
  const x=A.filter(t=>t.t<9*3600+35*60),y=A.filter(t=>t.t>=9*3600+35*60);
  console.log(` permP(realised R)=${f(L.permP(R(x),R(y)),3)}`);
  // H8 for reference (whole book)
  console.log(" H8 whole live book:", L.st(W.filter(t=>t.t<9*3600+35*60),"0930-0935"));
  console.log("                    ", L.st(W.filter(t=>t.t>=9*3600+35*60),"0935+"),
    " permP=",f(L.permP(R(W.filter(t=>t.t<9*3600+35*60)),R(W.filter(t=>t.t>=9*3600+35*60))),3));
}

hdr("STOP COUNTERFACTUAL — robustness: exclude the 9 censored trades? and winners-only view");
{
  const A=W.filter(t=>!isNaN(t.mae));
  const run=(set,lab)=>{
    console.log(` ${lab} n=${set.length} actual=${f(sum(R(set)),1)}`);
    [0.3,0.5,0.75,1.0,1.25].forEach(X=>{
      const sim=set.map(t=>t.mae<=-X?-X:t.pnlR);
      console.log(`   stop -${X}: sumR=${f(sum(sim),1).padStart(7)} delta=${f(sum(sim)-sum(R(set)),1).padStart(7)}`);});
  };
  run(A,"ALL");
  run(A.filter(t=>!(t.maxR===0&&t.pnlR>0.05)),"excl. 9 censored winners");
  // best possible mechanical stop search
  let best=null;
  for(let X=0.1;X<=3;X+=0.05){const s=sum(A.map(t=>t.mae<=-X?-X:t.pnlR));if(!best||s>best[1])best=[X,s];}
  console.log(` best mechanical stop over grid 0.1..3.0: -${f(best[0])}R -> sumR=${f(best[1],1)} vs actual ${f(sum(R(A)),1)}`);
  console.log(" NOTE: MAE skips the entry bar's adverse check (CLAUDE.md) so true MAE is <= reported; stops would trigger MORE often, not less.");
}

hdr("WHERE THE +23.1R CAME FROM");
{
  const s=[...W].sort((a,b)=>b.pnlR-a.pnlR);
  s.slice(0,8).forEach(t=>console.log(`  +${f(t.pnlR)} ${t.date} ${t.sym.padEnd(6)} mfe=${f(mfe(t)).padStart(5)} mae=${f(t.mae).padStart(5)} dur=${f(t.dur,1).padStart(6)}m part=${t.part}`));
  console.log(`  sum of all 15 winners = ${f(sum(R(W.filter(t=>t.pnlR>0))),1)}R ; all 52 losers = ${f(sum(R(W.filter(t=>t.pnlR<0))),1)}R`);
  const noTop3=sum(R(W))-sum(s.slice(0,3).map(t=>t.pnlR));
  console.log(`  book without top 3 trades: sumR=${f(noTop3,1)} over n=${W.length-3}, expR=${f(noTop3/(W.length-3))}`);
  const ci=L.bootCI(R(W).sort((a,b)=>b-a).slice(3));
  console.log(`  95% CI of that trimmed book: [${f(ci[0])},${f(ci[1])}]`);
}
