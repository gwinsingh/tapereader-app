const L = require("./lib.js");
const {f,st,R,sum,mean,med,bootCI,permP,byDay,days} = L;
const D=byDay(L.live), DK=days(L.live);

// build sequence within each day
const seq=[];
DK.forEach(k=>{ const a=D[k];
  a.forEach((t,i)=>{ t.idx=i; t.nDay=a.length; t.prev=i>0?a[i-1]:null;
    t.gapMin = i>0 ? (t.t - a[i-1].tExit)/60 : NaN;
    t.gapFromPrevEntry = i>0 ? (t.t - a[i-1].t)/60 : NaN;
    // running day R before this trade
    t.runR = sum(a.slice(0,i).map(x=>x.pnlR).filter(x=>!isNaN(x)));
    let cl=0; for(let j=i-1;j>=0;j--){ if(a[j].pnlR<0) cl++; else break; }
    t.consecLoss=cl;
    seq.push(t);
  });
});

console.log("========== AFTER WIN vs AFTER LOSS (live) ==========");
const afterW = seq.filter(t=>t.prev && t.prev.pnlR>0);
const afterL = seq.filter(t=>t.prev && t.prev.pnlR<=0);
const first  = seq.filter(t=>!t.prev);
console.log(st(first ,"first trade of day"));
console.log(st(afterW,"after a WIN"));
console.log(st(afterL,"after a LOSS"));
console.log("permP(afterW,afterL)="+f(permP(R(afterW),R(afterL)),3));
console.log("permP(first, rest)="+f(permP(R(first),R(seq.filter(t=>t.prev))),3));

console.log("\n-- after BIG win (prev>=2R) vs BIG loss (prev<=-0.9R) --");
const afterBW = seq.filter(t=>t.prev && t.prev.pnlR>=2);
const afterBL = seq.filter(t=>t.prev && t.prev.pnlR<=-0.9);
console.log(st(afterBW,"after prev >= +2R"));
console.log(st(afterBL,"after prev <= -0.9R"));

console.log("\n-- consecutive losses immediately before --");
[0,1,2,3].forEach(c=>{
  const a = c<3 ? seq.filter(t=>t.consecLoss===c) : seq.filter(t=>t.consecLoss>=3);
  if(a.length) console.log(st(a, c<3?`consecLoss=${c}`:"consecLoss>=3"));
});

console.log("\n-- trade index within day --");
[1,2,3,4,5].forEach(i=>{
  const a = i<5 ? seq.filter(t=>t.idx===i-1) : seq.filter(t=>t.idx>=4);
  if(a.length) console.log(st(a, i<5?`trade #${i}`:"trade #5+"));
});
console.log("cumulative from trade #k onwards:");
[1,2,3,4,5].forEach(i=>{ const a=seq.filter(t=>t.idx>=i-1); console.log("  "+st(a,`#${i}+`)); });

console.log("\n========== RAPID RE-ENTRY (gap since prev EXIT) ==========");
const gaps = seq.filter(t=>t.prev && !isNaN(t.gapMin)).map(t=>t.gapMin);
console.log("gapMin: n="+gaps.length+" min="+f(Math.min(...gaps))+" med="+f(med(gaps))+" max="+f(Math.max(...gaps)));
[[-1e9,2],[2,10],[10,30],[30,1e9]].forEach(([lo,hi])=>{
  const a=seq.filter(t=>t.gapMin>=lo&&t.gapMin<hi);
  if(a.length) console.log(st(a,`gap ${lo===-1e9?"<":lo}${hi===1e9?"+":"-"+hi}min`));
});
console.log("\n-- rapid re-entry AFTER A LOSS specifically --");
const rapidAfterL = seq.filter(t=>t.prev&&t.prev.pnlR<=0&&t.gapMin<5);
const slowAfterL  = seq.filter(t=>t.prev&&t.prev.pnlR<=0&&t.gapMin>=5);
console.log(st(rapidAfterL,"loss then <5min"));
console.log(st(slowAfterL ,"loss then >=5min"));
console.log("permP="+f(permP(R(rapidAfterL),R(slowAfterL)),3));
console.log("\n-- median gap after loss vs after win --");
console.log("  after loss med gap="+f(med(seq.filter(t=>t.prev&&t.prev.pnlR<=0).map(t=>t.gapMin)))+
            "  after win med gap="+f(med(seq.filter(t=>t.prev&&t.prev.pnlR>0).map(t=>t.gapMin))));
console.log("  after loss mean gap="+f(mean(seq.filter(t=>t.prev&&t.prev.pnlR<=0&&!isNaN(t.gapMin)).map(t=>t.gapMin)))+
            "  after win mean gap="+f(mean(seq.filter(t=>t.prev&&t.prev.pnlR>0&&!isNaN(t.gapMin)).map(t=>t.gapMin))));

console.log("\n========== RUNNING DAY R BEFORE THE TRADE ==========");
[[-1e9,-2],[-2,-1],[-1,0],[0,1e9]].forEach(([lo,hi])=>{
  const a=seq.filter(t=>t.prev&&t.runR>=lo&&t.runR<hi);
  if(a.length) console.log(st(a,`runR in [${lo===-1e9?"-inf":lo},${hi===1e9?"inf":hi})`));
});
const down = seq.filter(t=>t.prev&&t.runR<0), up=seq.filter(t=>t.prev&&t.runR>=0);
console.log(st(down,"day currently DOWN"));
console.log(st(up  ,"day currently UP/flat"));
console.log("permP="+f(permP(R(down),R(up)),3));

// size escalation after loss?
console.log("\n========== SIZE / RISK behaviour after loss ==========");
console.log("  mean risk$ after loss="+f(mean(afterL.map(t=>t.risk).filter(x=>!isNaN(x))))+
            "  after win="+f(mean(afterW.map(t=>t.risk).filter(x=>!isNaN(x))))+
            "  first="+f(mean(first.map(t=>t.risk).filter(x=>!isNaN(x)))));
console.log("  mean MAE after loss="+f(mean(afterL.map(t=>t.mae).filter(x=>!isNaN(x))))+
            "  after win="+f(mean(afterW.map(t=>t.mae).filter(x=>!isNaN(x)))));
console.log("  mean MFE after loss="+f(mean(afterL.map(t=>t.maxR).filter(x=>!isNaN(x))))+
            "  after win="+f(mean(afterW.map(t=>t.maxR).filter(x=>!isNaN(x)))));
console.log("  mean dur after loss="+f(mean(afterL.map(t=>t.dur).filter(x=>!isNaN(x))))+
            "  after win="+f(mean(afterW.map(t=>t.dur).filter(x=>!isNaN(x)))));

// PRACTICE replication
console.log("\n========== PRACTICE replication (sequencing) ==========");
const PD=byDay(L.practice), PK=days(L.practice); const pseq=[];
PK.forEach(k=>{ const a=PD[k]; a.forEach((t,i)=>{ t.idx=i; t.prev=i>0?a[i-1]:null;
  t.gapMin=i>0?(t.t-a[i-1].tExit)/60:NaN;
  t.runR=sum(a.slice(0,i).map(x=>x.pnlR).filter(x=>!isNaN(x)));
  let cl=0;for(let j=i-1;j>=0;j--){if(a[j].pnlR<0)cl++;else break;} t.consecLoss=cl; pseq.push(t);});});
console.log(st(pseq.filter(t=>!t.prev),"P first of day"));
console.log(st(pseq.filter(t=>t.prev&&t.prev.pnlR>0),"P after WIN"));
console.log(st(pseq.filter(t=>t.prev&&t.prev.pnlR<=0),"P after LOSS"));
console.log("permP="+f(permP(R(pseq.filter(t=>t.prev&&t.prev.pnlR>0)),R(pseq.filter(t=>t.prev&&t.prev.pnlR<=0))),3));
console.log(st(pseq.filter(t=>t.prev&&t.runR<0),"P day DOWN"));
console.log(st(pseq.filter(t=>t.prev&&t.runR>=0),"P day UP"));
[0,1,2,3].forEach(c=>{const a=c<3?pseq.filter(t=>t.consecLoss===c):pseq.filter(t=>t.consecLoss>=3);
  if(a.length)console.log(st(a,c<3?`P consecLoss=${c}`:"P consecLoss>=3"));});
[[-1e9,2],[2,10],[10,30],[30,1e9]].forEach(([lo,hi])=>{const a=pseq.filter(t=>t.gapMin>=lo&&t.gapMin<hi);
  if(a.length)console.log(st(a,`P gap ${lo===-1e9?"<":lo}${hi===1e9?"+":"-"+hi}min`));});
