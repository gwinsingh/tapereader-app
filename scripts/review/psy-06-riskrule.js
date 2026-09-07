const L=require("./lib.js"); const {f,st,R,sum,mean,med,bootCI,permP,byDay,days}=L;
const D=byDay(L.live),DK=days(L.live);
const PD=byDay(L.practice),PK=days(L.practice);

function simStop(d,ks,level){ // stop trading for the day once cumulative R <= level
  let tot=0, cut=0, tradesKept=0, tradesCut=0, daysHit=0;
  ks.forEach(k=>{ let c=0,hit=false;
    d[k].forEach(t=>{ const r=isNaN(t.pnlR)?0:t.pnlR;
      if(hit){ tradesCut++; cut+=r; return; }
      c+=r; tot+=r; tradesKept++;
      if(c<=level){ hit=true; }
    });
    if(hit) daysHit++;
  });
  return {level,tot,cut,tradesKept,tradesCut,daysHit};
}
function simCount(d,ks,cap){
  let tot=0,cut=0,kept=0,cutN=0,daysHit=0;
  ks.forEach(k=>{ d[k].forEach((t,i)=>{ const r=isNaN(t.pnlR)?0:t.pnlR;
    if(i<cap){tot+=r;kept++;} else {cut+=r;cutN++;} });
    if(d[k].length>cap) daysHit++; });
  return {cap,tot,cut,kept,cutN,daysHit};
}
function report(d,ks,name){
  const base=sum(ks.flatMap(k=>R(d[k])));
  console.log(`\n===== ${name} — baseline sumR=${f(base,1)} over ${ks.length} sessions, ${ks.reduce((s,k)=>s+d[k].length,0)} trades =====`);
  console.log("-- DAILY MAX-LOSS STOP (stop after cumulative day R <= X) --");
  [-1,-1.5,-2,-2.5,-3,-4].forEach(lv=>{ const s=simStop(d,ks,lv);
    console.log(`  stop at ${String(lv).padStart(5)}R: kept sumR=${f(s.tot,1).padStart(6)}  delta=${f(s.tot-base,1).padStart(6)}  daysHit=${String(s.daysHit).padStart(2)}/${ks.length}  tradesForgone=${String(s.tradesCut).padStart(3)} (their R=${f(s.cut,1)})`);});
  console.log("-- TRADE-COUNT CAP --");
  [1,2,3,4,5].forEach(c=>{ const s=simCount(d,ks,c);
    console.log(`  cap ${c}: kept sumR=${f(s.tot,1).padStart(6)}  delta=${f(s.tot-base,1).padStart(6)}  daysAffected=${String(s.daysHit).padStart(2)}/${ks.length}  tradesForgone=${String(s.cutN).padStart(3)} (their R=${f(s.cut,1)})`);});
  // combined
  console.log("-- COMBINED: max-loss -2R AND cap 4 --");
  let tot=0,cutN=0,cutR=0;
  ks.forEach(k=>{let c=0,hit=false; d[k].forEach((t,i)=>{const r=isNaN(t.pnlR)?0:t.pnlR;
    if(hit||i>=4){cutN++;cutR+=r;return;} c+=r;tot+=r; if(c<=-2)hit=true;});});
  console.log(`  kept sumR=${f(tot,1)} delta=${f(tot-base,1)} tradesForgone=${cutN} (R=${f(cutR,1)})`);
}
report(D,DK,"LIVE"); report(PD,PK,"PRACTICE");

console.log("\n===== HIS CLAIM: 'good days after early losses' =====");
function claim(d,ks,name){
  const rows=ks.map(k=>{const a=d[k]; const c=[]; let run=0; a.forEach(t=>{run+=isNaN(t.pnlR)?0:t.pnlR;c.push(run);});
    return {k,a,cum:c,day:sum(R(a))};});
  console.log(`-- ${name} --`);
  // days where after 1st trade you were down
  [1,2,3].forEach(n=>{
    const dn=rows.filter(r=>r.a.length>n && r.cum[n-1]<0);
    if(!dn.length)return;
    const rest=dn.map(r=>r.day-r.cum[n-1]);
    const recovered=dn.filter(r=>r.day>0).length;
    console.log(`  down after trade ${n}: sessions=${dn.length}  meanRestOfDayR=${f(mean(rest))}  sumRestOfDayR=${f(sum(rest),1)}  finished green=${recovered}/${dn.length}  meanFinalDayR=${f(mean(dn.map(r=>r.day)))}`);
  });
  // down >= 1R after any point early
  const deep=rows.filter(r=>r.a.length>1&&Math.min(...r.cum.slice(0,Math.min(2,r.cum.length)))<=-1);
  console.log(`  down <= -1R within first 2 trades: sessions=${deep.length} finishedGreen=${deep.filter(r=>r.day>0).length} sumFinalR=${f(sum(deep.map(r=>r.day)),1)} meanFinalR=${f(mean(deep.map(r=>r.day)))}`);
  const deep2=rows.filter(r=>Math.min(...r.cum)<=-2);
  console.log(`  ever down <= -2R intraday: sessions=${deep2.length} finishedGreen=${deep2.filter(r=>r.day>0).length} sumFinalR=${f(sum(deep2.map(r=>r.day)),1)} best=${f(Math.max(...deep2.map(r=>r.day)),1)}`);
  deep2.forEach(r=>console.log(`     ${r.k} n=${r.a.length} path=[${r.cum.map(x=>f(x,1)).join(", ")}] final=${f(r.day,1)}`));
}
claim(D,DK,"LIVE"); claim(PD,PK,"PRACTICE");

console.log("\n===== distribution of day R (live) =====");
const dr=L.dayR(L.live).sort((a,b)=>a.r-b.r);
dr.forEach(x=>console.log(`  ${x.date} n=${x.n} R=${f(x.r,1)}`));
console.log("worst day R="+f(dr[0].r,1)+"  n days <= -2R: "+dr.filter(x=>x.r<=-2).length+"  n days <= -3R: "+dr.filter(x=>x.r<=-3).length);
