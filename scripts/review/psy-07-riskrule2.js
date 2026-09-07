const L=require("./lib.js"); const {f,st,R,sum,mean,med,permP,byDay,days}=L;
const D=byDay(L.live),DK=days(L.live), PD=byDay(L.practice),PK=days(L.practice);

console.log("=== decompose: trades taken AFTER the day was already <= -2R ===");
function after(d,ks,level,name){
  const out=[];
  ks.forEach(k=>{let c=0,hit=false; d[k].forEach(t=>{const r=isNaN(t.pnlR)?0:t.pnlR;
    if(hit){out.push({k,sym:t.sym,r,entry:t.entry});return;} c+=r; if(c<=level)hit=true;});});
  console.log(`${name} level ${level}R: n=${out.length} sumR=${f(sum(out.map(x=>x.r)),1)} expR=${f(mean(out.map(x=>x.r)))} win%=${f(out.filter(x=>x.r>0).length/out.length*100,0)}`);
  out.forEach(x=>console.log(`   ${x.k} ${x.sym.padEnd(5)} ${x.entry} R=${f(x.r)}`));
  return out;
}
after(D,DK,-2,"LIVE");
const pa=after(PD,PK,-2,"PRACTICE"); // will print many; ok
console.log("");
[-1,-1.5,-2,-2.5].forEach(lv=>{
  const g=(d,ks)=>{const o=[];ks.forEach(k=>{let c=0,h=false;d[k].forEach(t=>{const r=isNaN(t.pnlR)?0:t.pnlR;
    if(h){o.push(r);return;}c+=r;if(c<=lv)h=true;});});return o;};
  const lv1=g(D,DK), pv=g(PD,PK), comb=[...lv1,...pv];
  console.log(`AFTER <= ${lv}R  live n=${lv1.length} sumR=${f(sum(lv1),1)} expR=${f(mean(lv1))} | practice n=${pv.length} sumR=${f(sum(pv),1)} expR=${f(mean(pv))} | COMBINED n=${comb.length} sumR=${f(sum(comb),1)} expR=${f(mean(comb))} CI=[${L.bootCI(comb).map(x=>f(x)).join(",")}]`);
});

console.log("\n=== 'ever down <= -2R intraday -> finish green?' combined test ===");
function paths(d,ks){return ks.map(k=>{let c=0;const p=[];d[k].forEach(t=>{c+=isNaN(t.pnlR)?0:t.pnlR;p.push(c);});
  return {k,p,final:c,n:d[k].length};});}
const lp=paths(D,DK), pp=paths(PD,PK), allp=[...lp,...pp];
[-1,-1.5,-2,-2.5,-3].forEach(lv=>{
  const hit=allp.filter(r=>Math.min(...r.p)<=lv);
  const green=hit.filter(r=>r.final>0).length;
  console.log(`  ever <= ${String(lv).padStart(4)}R: sessions=${String(hit.length).padStart(2)}  finishedGreen=${green} (${f(green/hit.length*100,0)}%)  sumFinalR=${f(sum(hit.map(r=>r.final)),1).padStart(7)}  meanFinalR=${f(mean(hit.map(r=>r.final)))}  bestFinal=${f(Math.max(...hit.map(r=>r.final)),1)}`);
});
const nev=allp.filter(r=>Math.min(...r.p)>-2);
console.log(`  never <= -2R: sessions=${nev.length} green=${nev.filter(r=>r.final>0).length} (${f(nev.filter(r=>r.final>0).length/nev.length*100,0)}%) sumR=${f(sum(nev.map(r=>r.final)),1)}`);
// binomial: base rate of green sessions
const baseGreen=allp.filter(r=>r.final>0).length/allp.length;
const k=allp.filter(r=>Math.min(...r.p)<=-2), kg=k.filter(r=>r.final>0).length;
function binomP(n,x,p){ // P(X<=x)
  let s=0; for(let i=0;i<=x;i++){ let c=1; for(let j=0;j<i;j++) c=c*(n-j)/(j+1); s+=c*Math.pow(p,i)*Math.pow(1-p,n-i);} return s;}
console.log(`  base green rate=${f(baseGreen*100,0)}%  observed ${kg}/${k.length}  one-sided binomial p=${f(binomP(k.length,kg,baseGreen),4)}`);

console.log("\n=== alternative circuit breakers (live / practice / combined) ===");
function simRule(d,ks,stopFn){ let tot=0,cutN=0,cutR=0;
  ks.forEach(key=>{const a=d[key];const st_={cum:0,losses:0,consec:0,n:0};let hit=false;
    a.forEach(t=>{const r=isNaN(t.pnlR)?0:t.pnlR;
      if(hit){cutN++;cutR+=r;return;}
      tot+=r; st_.cum+=r; st_.n++; if(r<0){st_.losses++;st_.consec++;}else st_.consec=0;
      if(stopFn(st_))hit=true;});});
  return {tot,cutN,cutR};}
const rules=[
  ["none", ()=>false],
  ["cum<=-2R", s=>s.cum<=-2],
  ["cum<=-1.5R", s=>s.cum<=-1.5],
  ["3 consecutive losses", s=>s.consec>=3],
  ["2 consecutive losses", s=>s.consec>=2],
  ["3 losing trades (any)", s=>s.losses>=3],
  ["cum<=-2R OR 3 consec L", s=>s.cum<=-2||s.consec>=3],
  ["max 4 trades", s=>s.n>=4],
  ["max 3 trades", s=>s.n>=3],
  ["max 2 trades", s=>s.n>=2],
];
console.log("rule                        LIVE dR    PRACTICE dR   COMBINED dR");
const bl=sum(DK.flatMap(k=>R(D[k]))), bp=sum(PK.flatMap(k=>R(PD[k])));
rules.forEach(([n,fn])=>{const a=simRule(D,DK,fn),b=simRule(PD,PK,fn);
  console.log(`${n.padEnd(26)} ${f(a.tot-bl,1).padStart(6)}     ${f(b.tot-bp,1).padStart(6)}      ${f((a.tot-bl)+(b.tot-bp),1).padStart(6)}`);});
