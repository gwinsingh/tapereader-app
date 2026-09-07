const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, R, permP, bootCI, byDay, days } = L;
const OPEN=9*3600+30*60, pre=t=>t.t<OPEN+300;

// ---- reverse causality on timing: does a bad early result cause more late trades? ----
console.log("=== does the early result drive later activity? ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const d=byDay(T);
  const rows=days(T).map(k=>{const g=d[k]; const e=g.filter(pre), l=g.filter(t=>!pre(t));
    return {date:k, eR:sum(R(e)), nE:e.length, nL:l.length, lR:sum(R(l))};}).filter(x=>x.nE>0);
  const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
  console.log(bn, "corr(early R, # trades after 09:35) =", f(corr(rows.map(x=>x.eR),rows.map(x=>x.nL)),3), "nDays="+rows.length);
  const neg=rows.filter(x=>x.eR<0), pos=rows.filter(x=>x.eR>0);
  console.log("   early RED days: n="+neg.length+" mean late trades="+f(mean(neg.map(x=>x.nL)))+" mean late R="+f(mean(neg.map(x=>x.lR))));
  console.log("   early GREEN days: n="+pos.length+" mean late trades="+f(mean(pos.map(x=>x.nL)))+" mean late R="+f(mean(pos.map(x=>x.lR))));
}

// ---- THE RISK RULE: running intraday drawdown thresholds ----
console.log("\n=== RUNNING INTRADAY DRAWDOWN — corrected R ===");
function runDD(T) {
  const d=byDay(T);
  return days(T).map(k=>{
    const g=d[k]; let cum=0, minCum=0, peak=0, hitAt={};
    const path=[];
    g.forEach((t,i)=>{ const r=isNaN(t.pnlR)?0:t.pnlR; cum+=r; path.push(cum);
      if(cum<minCum) minCum=cum; if(cum>peak) peak=cum; });
    return {date:k, n:g.length, final:cum, minCum, peak, path, g};
  });
}
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const rows=runDD(T);
  console.log("-- "+bn+" ("+rows.length+" sessions, "+f(sum(rows.map(r=>r.final)),1)+"R total)");
  for (const thr of [-1.0,-1.5,-2.0,-2.5,-3.0]) {
    const hit=rows.filter(r=>r.minCum<=thr);
    const green=hit.filter(r=>r.final>0);
    // R forfeited by stopping at thr: trades taken after the threshold was first breached
    let after=0, nAfter=0;
    hit.forEach(r=>{ let cum=0, stopped=false;
      r.g.forEach(t=>{ const x=isNaN(t.pnlR)?0:t.pnlR; if(stopped){after+=x;nAfter++;} cum+=x; if(cum<=thr) stopped=true; }); });
    console.log("  "+String(thr).padStart(5)+"R: sessions hit="+String(hit.length).padStart(3)+
      "  finished GREEN="+String(green.length).padStart(2)+"/"+hit.length+
      "  R after breach="+f(after,1).padStart(7)+" over "+String(nAfter).padStart(3)+" trades"+
      "  (mean "+f(nAfter?after/nAfter:NaN)+"R/trade)");
  }
}
console.log("\n=== COMBINED books, daily-stop counterfactual ===");
for (const thr of [-1.0,-1.5,-2.0,-2.5,-3.0]) {
  let saved=0, n=0, hitS=0, greenS=0;
  for (const T of [practice,live]) { const d=byDay(T);
    days(T).forEach(k=>{ let cum=0,stopped=false,f2=0; const g=d[k];
      g.forEach(t=>{const x=isNaN(t.pnlR)?0:t.pnlR; if(stopped){saved-=x;n++;} cum+=x; if(cum<=thr&&!stopped)stopped=true;});
      if(stopped){hitS++; if(sum(R(g))>0)greenS++;} }); }
  console.log("  stop at "+String(thr).padStart(5)+"R: R saved="+f(saved,1).padStart(7)+" by skipping "+String(n).padStart(3)+
    " trades; sessions triggered="+hitS+", of which finished green anyway="+greenS);
}
// live only
console.log("\n=== LIVE-ONLY daily-stop counterfactual (month total 19.4R) ===");
for (const thr of [-1.0,-1.5,-2.0,-2.5,-3.0]) {
  let tot=0; const d=byDay(live);
  days(live).forEach(k=>{ let cum=0,stopped=false;
    d[k].forEach(t=>{const x=isNaN(t.pnlR)?0:t.pnlR; if(stopped)return; cum+=x; if(cum<=thr)stopped=true;});
    tot+=cum; });
  console.log("  stop at "+String(thr).padStart(5)+"R -> month = "+f(tot,1)+"R");
}

// ---- H6: <=2 trades/day ----
console.log("\n=== H6: <=2 trades/day vs more (artifact #14: contradicts his stated max-loss rule) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const d=byDay(T);
  const small=[],big=[];
  days(T).forEach(k=>{ (d[k].length<=2?small:big).push(...d[k]); });
  console.log("-- "+bn); console.log(st(small,"days with <=2 trades")); console.log(st(big,"days with >2 trades"));
  console.log("   permP=",f(permP(R(small),R(big)),4));
  // truncation counterfactual: cap at first 2 trades of each day
  let cap2=0, capAll=0;
  days(T).forEach(k=>{ cap2+=sum(R(d[k].slice(0,2))); capAll+=sum(R(d[k])); });
  console.log("   hard cap of 2 trades/day -> "+f(cap2,1)+"R vs actual "+f(capAll,1)+"R");
  for (const c of [1,2,3,4,5]) { let s=0; days(T).forEach(k=>s+=sum(R(d[k].slice(0,c))));
    console.log("     cap "+c+": "+f(s,1)+"R"); }
  // day-level: does trade count predict day R?
  const rows=days(T).map(k=>({n:d[k].length,r:sum(R(d[k]))}));
  const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
  console.log("   corr(trades/day, dayR)="+f(corr(rows.map(x=>x.n),rows.map(x=>x.r)),3));
}

// ---- sequence: R of trade N given trade N-1 was a loss ----
console.log("\n=== after a loss / after a win (same day) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const d=byDay(T); const aL=[],aW=[];
  Object.values(d).forEach(g=>g.forEach((t,i)=>{ if(i===0)return; const p=g[i-1].pnlR;
    if(isNaN(p))return; (p<0?aL:aW).push(t); }));
  console.log("-- "+bn); console.log(st(aL,"after a loser")); console.log(st(aW,"after a winner"));
  console.log("   permP=",f(permP(R(aL),R(aW)),4));
}
