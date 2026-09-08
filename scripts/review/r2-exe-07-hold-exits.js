const {L, enrichAll} = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/r2-exe-lib.js");
const {f,sum,mean,med,R,st,bootCI,permP} = L;
const E=T=>{const A=enrichAll(T).filter(t=>t.ok&&!isNaN(t.pnlR)&&!isNaN(t.initRisk));
  A.forEach(t=>{ t.saMFE_R=(!isNaN(t.far))?t.totSh*(t.far-t.avgEnt)/t.initRisk:NaN; }); return A;};
const live=E(L.live), prac=E(L.practice);

console.log("########## H4 — HOLD TIME >=5min vs <5min (live) ##########");
const a=live.filter(t=>t.dur>=5), b=live.filter(t=>t.dur<5);
console.log(st(a,">=5 min")); console.log(st(b,"<5 min")); console.log("p=",f(permP(R(a),R(b)),4));
console.log("\n  DECOMPOSITION with stop-aware MFE — 'entry never worked' vs 'exited early':");
[["<5min",b],[">=5min",a]].forEach(([nm,g])=>{
  const w=g.filter(t=>!isNaN(t.saMFE_R));
  console.log(`   ${nm.padEnd(8)} n=${w.length}  median stop-aware MFE=${f(med(w.map(t=>t.saMFE_R)))}R  offered>=1R: ${w.filter(t=>t.saMFE_R>=1).length} (${f(100*w.filter(t=>t.saMFE_R>=1).length/w.length,0)}%)  offered>=2.5R: ${w.filter(t=>t.saMFE_R>=2.5).length} (${f(100*w.filter(t=>t.saMFE_R>=2.5).length/w.length,0)}%)`);
});
console.log("\n  OPPORTUNITY-MATCHED: within trades the market offered >=2.5R (stop-aware), does hold time still matter?");
const m=live.filter(t=>t.saMFE_R>=2.5), ma=m.filter(t=>t.dur>=5), mb=m.filter(t=>t.dur<5);
console.log("  "+st(ma,"  >=5min | offered>=2.5R")); console.log("  "+st(mb,"  <5min  | offered>=2.5R"));
console.log("  p=",f(permP(R(ma),R(mb)),4));
console.log("\n  Within trades the market offered <1R (stop-aware) — the entry simply failed:");
const z=live.filter(t=>t.saMFE_R<1);
console.log("  "+st(z.filter(t=>t.dur>=5),"  >=5min | offered<1R")); console.log("  "+st(z.filter(t=>t.dur<5),"  <5min  | offered<1R"));
console.log("\n  same on PRACTICE (H4 origin):");
console.log("  "+st(prac.filter(t=>t.dur>=5),">=5min")); console.log("  "+st(prac.filter(t=>t.dur<5),"<5min"));

console.log("\n########## H5(new) — SCALING OUT (nExits>1) vs ALL-OUT ##########");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const w=T.filter(t=>!isNaN(t.nExits));
  const s=w.filter(t=>t.nExits>1), o=w.filter(t=>t.nExits===1);
  console.log(` ${nm}:`); console.log("   "+st(s,"scaled out (nExits>1)")); console.log("   "+st(o,"all-out (nExits=1)"));
  console.log("   p=",f(permP(R(s),R(o)),4), " medDur scaled=",f(med(s.map(t=>t.dur)),1),"m vs all-out=",f(med(o.map(t=>t.dur)),1),"m",
    " medSaMFE scaled=",f(med(s.map(t=>t.saMFE_R).filter(x=>!isNaN(x)))),"vs",f(med(o.map(t=>t.saMFE_R).filter(x=>!isNaN(x)))));
  const g=w.filter(t=>t.saMFE_R>=2.5);
  console.log("   OPPORTUNITY-MATCHED (offered>=2.5R):");
  console.log("   "+st(g.filter(t=>t.nExits>1),"  scaled | offered>=2.5R")); console.log("   "+st(g.filter(t=>t.nExits===1),"  all-out| offered>=2.5R"));
  console.log("   p=",f(permP(R(g.filter(t=>t.nExits>1)),R(g.filter(t=>t.nExits===1))),4));
  console.log("   nExits distribution:",JSON.stringify(w.reduce((c,t)=>(c[t.nExits]=(c[t.nExits]||0)+1,c),{})));
  console.log("   nEntries distribution:",JSON.stringify(w.reduce((c,t)=>(c[t.nEntries]=(c[t.nEntries]||0)+1,c),{})));
});
console.log("\n  live: does scaling out beat all-out on CAPTURE of what was offered?");
const w=live.filter(t=>t.saMFE_R>=2.5);
[["scaled",w.filter(t=>t.nExits>1)],["all-out",w.filter(t=>t.nExits===1)]].forEach(([nm,g])=>
  console.log(`   ${nm.padEnd(8)} n=${g.length}  capture=${f(100*sum(R(g))/sum(g.map(t=>t.saMFE_R)),0)}%  med realised/offered=${f(med(g.map(t=>t.pnlR/t.saMFE_R)),2)}`));

console.log("\n########## H7 — RightTheory? (retrospective self-label, artifact #7) ##########");
[["LIVE",live],["PRACTICE",prac]].forEach(([nm,T])=>{
  const c={}; T.forEach(t=>c[t.right||"(blank)"]=(c[t.right||"(blank)"]||0)+1);
  console.log(` ${nm} labels:`,JSON.stringify(c));
  const y=T.filter(t=>t.right==="Yes"||t.right==="Y"), n=T.filter(t=>t.right==="No"||t.right==="N");
  if(y.length){console.log("   "+st(y,"RightTheory=Yes")); console.log("   "+st(n,"RightTheory=No")); console.log("   p=",f(permP(R(y),R(n)),4));
    console.log(`   med stop-aware MFE: Yes=${f(med(y.map(t=>t.saMFE_R).filter(x=>!isNaN(x))))}R  No=${f(med(n.map(t=>t.saMFE_R).filter(x=>!isNaN(x))))}R  <-- if these differ, the label tracks OUTCOME`);
    console.log(`   blank rows: ${T.filter(t=>!t.right).length}; their sumR=${f(sum(R(T.filter(t=>!t.right))),1)}`);}
});
