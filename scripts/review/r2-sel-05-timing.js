const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, R, permP, bootCI, byDay, days } = L;
const OPEN = 9*3600+30*60;
const pre = t => t.t < OPEN + 300;

console.log("=== H8: entries before 09:35 vs after — CORRECTED R ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const a = T.filter(pre), b = T.filter(t=>!pre(t) && !isNaN(t.t));
  console.log("-- " + bn); console.log(st(a,"<09:35")); console.log(st(b,">=09:35"));
  console.log("   permP (trade-level) =", f(permP(R(a),R(b)),4));
}

// ---- WITHIN-DAY permutation: shuffle the pre/post LABEL inside each day ----
function withinDayPerm(T, iters=20000) {
  const d = byDay(T);
  const dd = Object.values(d).filter(g => g.some(pre) && g.some(t=>!pre(t)));
  const tr = [].concat(...dd);
  const obs = mean(R(tr.filter(pre))) - mean(R(tr.filter(t=>!pre(t))));
  let c=0;
  for (let i=0;i<iters;i++){
    let sa=0,na=0,sb=0,nb=0;
    for (const g of dd) {
      const k = g.filter(pre).length;
      const rs = g.map(t=>t.pnlR).filter(x=>!isNaN(x));
      const p = [...rs]; for(let j=p.length-1;j>0;j--){const q=(Math.random()*(j+1))|0;[p[j],p[q]]=[p[q],p[j]];}
      const kk = Math.min(k, p.length);
      for(let j=0;j<p.length;j++){ if(j<kk){sa+=p[j];na++;} else {sb+=p[j];nb++;} }
    }
    if (Math.abs(sa/na - sb/nb) >= Math.abs(obs)) c++;
  }
  return { obs, p: c/iters, nDays: dd.length, nTr: tr.length,
    pre: tr.filter(pre), post: tr.filter(t=>!pre(t)) };
}
console.log("\n=== WITHIN-DAY permutation (mixed days only) ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const r = withinDayPerm(T);
  console.log("-- " + bn + "  days=" + r.nDays + " trades=" + r.nTr);
  console.log(st(r.pre,"   <09:35 (mixed days)")); console.log(st(r.post,"   >=09:35 (mixed days)"));
  console.log("   obs diff=" + f(r.obs) + "  WITHIN-DAY p=" + f(r.p,4));
}

// ---- BETWEEN-day component: does the pre-09:35 SHARE of a day predict day R? ----
console.log("\n=== BETWEEN-day: day's pre-09:35 share vs day R ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const d = byDay(T);
  const rows = days(T).map(k=>({ date:k, share: d[k].filter(pre).length/d[k].length, r: sum(R(d[k])), n:d[k].length }));
  const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
  console.log("-- "+bn+" corr(preShare, dayR) = " + f(corr(rows.map(x=>x.share), rows.map(x=>x.r)),3) + "  (nDays=" + rows.length + ")");
  const hi = rows.filter(x=>x.share>=0.5), lo = rows.filter(x=>x.share<0.5);
  console.log("   days >=50% pre: n=" + hi.length + " meanDayR=" + f(mean(hi.map(x=>x.r))) +
              " | <50%: n=" + lo.length + " meanDayR=" + f(mean(lo.map(x=>x.r))));
}

// ---- FIRST TRADE OF DAY vs later (order effect, distinct from clock time) ----
console.log("\n=== FIRST trade of day vs subsequent ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const d = byDay(T); const first=[], rest=[];
  Object.values(d).forEach(g=>{ first.push(g[0]); rest.push(...g.slice(1)); });
  console.log("-- "+bn); console.log(st(first,"first of day")); console.log(st(rest,"later in day"));
  console.log("   permP=", f(permP(R(first),R(rest)),4));
}
// trade ordinal
console.log("\n=== trade ordinal within day (live) ===");
{ const d=byDay(live); const b={};
  Object.values(d).forEach(g=>g.forEach((t,i)=>(b[Math.min(i+1,5)] ||= []).push(t)));
  Object.entries(b).forEach(([k,a])=>console.log(st(a, k==="5"?"#5+":"#"+k))); }

// ---- H10 Friday, and full day-of-week ----
console.log("\n=== H10: day of week ===");
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
for (const [bn,T] of [["prac",practice],["live",live]]) {
  console.log("-- "+bn); const b={};
  T.forEach(t=>{ const dw=DOW[new Date(t.date+"T12:00:00Z").getUTCDay()]; (b[dw] ||= []).push(t); });
  ["Mon","Tue","Wed","Thu","Fri"].forEach(k=>b[k]&&console.log(st(b[k],k)));
  const fri=T.filter(t=>new Date(t.date+"T12:00:00Z").getUTCDay()===5), nf=T.filter(t=>new Date(t.date+"T12:00:00Z").getUTCDay()!==5);
  console.log("   Friday permP=", f(permP(R(fri),R(nf)),4));
  const d=byDay(T); const fd=days(T).filter(k=>new Date(k+"T12:00:00Z").getUTCDay()===5);
  console.log("   Friday sessions n=" + fd.length + " meanDayR=" + f(mean(fd.map(k=>sum(R(d[k]))))) +
    " | non-Fri n=" + (days(T).length-fd.length) + " meanDayR=" + f(mean(days(T).filter(k=>new Date(k+"T12:00:00Z").getUTCDay()!==5).map(k=>sum(R(d[k]))))));
}

// robustness of the live pre-09:35 result
console.log("\n=== live <09:35 robustness ===");
const a=live.filter(pre);
console.log(st(a,"all"));
console.log(st(a.filter(t=>t.sym!=="MRNA"),"ex-MRNA"));
console.log(st(a.filter(t=>t.sym!=="SPY"&&t.sym!=="QQQ"),"ex SPY/QQQ"));
const srt=[...a].filter(t=>!isNaN(t.pnlR)).sort((x,y)=>y.pnlR-x.pnlR);
console.log("top3 winners inside <09:35:", srt.slice(0,3).map(t=>t.date+" "+t.sym+" "+f(t.pnlR)).join(" | "));
console.log("drop top 2:", st(srt.slice(2),"  "));
