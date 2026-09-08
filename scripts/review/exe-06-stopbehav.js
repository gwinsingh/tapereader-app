const L=require("./lib.js"); const f=L.f,mean=L.mean,sum=L.sum,med=L.med,R=L.R;
for(const [lab,T] of [["LIVE",L.live],["PRACTICE",L.practice]]){
  const W=T.filter(t=>!isNaN(t.mae)&&!isNaN(t.pnlR));
  const deep=W.filter(t=>t.mae<=-1), dl=deep.filter(t=>t.pnlR<0);
  console.log(`${lab}: traded through the 1R stop level: n=${deep.length}/${W.length} (${f(deep.length/W.length*100,0)}%)`);
  console.log(`  of those, losers n=${dl.length} meanRealised=${f(mean(R(dl)))} medRealised=${f(med(R(dl)))} worst=${f(Math.min(...R(dl)))}`);
  console.log(`  mean recovery from MAE to exit (losers): ${f(mean(dl.map(t=>t.pnlR-t.mae)))}R`);
  const shallow=W.filter(t=>t.mae>-1&&t.pnlR<0);
  console.log(`  losers that never breached 1R: n=${shallow.length} meanRealised=${f(mean(R(shallow)))}`);
  console.log(`  ALL losers mean=${f(mean(R(W.filter(t=>t.pnlR<0))))} n>=-1R breaches among losers=${f(dl.length/W.filter(t=>t.pnlR<0).length*100,0)}%`);
}
