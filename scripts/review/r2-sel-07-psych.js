const L = require("/Users/gurwinder/Workspace/tapereader-app/scripts/review/lib.js");
const { live, practice, st, f, mean, sum, med, sd, R, permP, bootCI, byDay, days } = L;

// Psych vars are DAY-LEVEL -> collapse to sessions (artifact #8).
function sessions(T) {
  const d = byDay(T);
  return days(T).map(k => { const g = d[k];
    const first = v => { const x = g.map(t=>t[v]).find(x=>!isNaN(x) && x!==""); return x===undefined?NaN:x; };
    const firstS = v => { const x = g.map(t=>t[v]).find(x=>x!==""); return x===undefined?"":x; };
    return { date:k, n:g.length, r:sum(R(g)), pnl:sum(g.map(t=>t.pnl)), g,
      energy:first("energy"), tension:first("tension"), urge:firstS("urge"),
      sleepH:first("sleepH"), sleepSc:first("sleepSc"), ready:first("ready"),
      procYes:g.filter(t=>t.proc==="Yes").length, procNo:g.filter(t=>t.proc==="No").length,
      procBlank:g.filter(t=>t.proc==="").length,
      notes:g.filter(t=>t.notes!=="").length, setupBlank:g.filter(t=>t.setup==="").length,
      dow:new Date(k+"T12:00:00Z").getUTCDay() };
  });
}
const S = sessions(live), SP = sessions(practice);
const corr=(a,b)=>{const ma=mean(a),mb=mean(b);return sum(a.map((x,i)=>(x-ma)*(b[i]-mb)))/Math.sqrt(sum(a.map(x=>(x-ma)**2))*sum(b.map(x=>(x-mb)**2)));};
function permCorr(a,b,iters=20000){const obs=Math.abs(corr(a,b));let c=0;
  for(let i=0;i<iters;i++){const p=[...b];for(let j=p.length-1;j>0;j--){const q=(Math.random()*(j+1))|0;[p[j],p[q]]=[p[q],p[j]];}
    if(Math.abs(corr(a,p))>=obs)c++;} return c/iters;}

console.log("=== PSYCH COVERAGE (live sessions, n=" + S.length + ") ===");
["energy","tension","sleepH","sleepSc","ready"].forEach(k=>
  console.log(" ", k.padEnd(9), S.filter(s=>!isNaN(s[k])).length + "/" + S.length,
    " range " + f(Math.min(...S.filter(s=>!isNaN(s[k])).map(s=>s[k]))) + "-" + f(Math.max(...S.filter(s=>!isNaN(s[k])).map(s=>s[k]))) +
    " sd=" + f(sd(S.filter(s=>!isNaN(s[k])).map(s=>s[k])))));
console.log("  urge:", JSON.stringify(S.reduce((a,s)=>{a[s.urge||"(blank)"]=(a[s.urge||"(blank)"]||0)+1;return a;},{})));

let T1=0;
console.log("\n=== PSYCH -> PERFORMANCE (day R). n_sessions in brackets ===");
console.log("var        n   corr(dayR)  p       | corr(trades/day) p      | corr(procRate)  p");
for (const k of ["energy","tension","sleepH","sleepSc","ready"]) {
  const w = S.filter(s=>!isNaN(s[k]));
  if (w.length < 8) { console.log(k, "n too small"); continue; }
  const x = w.map(s=>s[k]);
  const c1=corr(x,w.map(s=>s.r)), p1=permCorr(x,w.map(s=>s.r));
  const c2=corr(x,w.map(s=>s.n)), p2=permCorr(x,w.map(s=>s.n));
  const wp = w.filter(s=>s.procYes+s.procNo>0);
  const c3 = wp.length>5 ? corr(wp.map(s=>s[k]), wp.map(s=>s.procYes/(s.procYes+s.procNo))) : NaN;
  const p3 = wp.length>5 ? permCorr(wp.map(s=>s[k]), wp.map(s=>s.procYes/(s.procYes+s.procNo))) : NaN;
  T1+=3;
  console.log(k.padEnd(9), String(w.length).padStart(3), f(c1,3).padStart(9), f(p1,4).padStart(8),
    " |", f(c2,3).padStart(6), f(p2,4).padStart(7), " |", f(c3,3).padStart(6), f(p3,4).padStart(7));
}
// urge (binary)
{ const y=S.filter(s=>s.urge==="Yes"), n=S.filter(s=>s.urge==="No");
  console.log("urge      Yes n="+y.length+" meanDayR="+f(mean(y.map(s=>s.r)))+" trades/day="+f(mean(y.map(s=>s.n)))+
    " | No n="+n.length+" meanDayR="+f(mean(n.map(s=>s.r)))+" trades/day="+f(mean(n.map(s=>s.n))));
  console.log("          permP(dayR)="+f(permP(y.map(s=>s.r),n.map(s=>s.r)),4)+
    " permP(trades)="+f(permP(y.map(s=>s.n),n.map(s=>s.n)),4)); T1+=2; }
// trade-level (inflated n, shown for completeness only)
console.log("\n(trade-level, DO NOT treat n as 59 — it is 19 sessions)");
for (const k of ["energy","tension","sleepH"]) {
  const w=live.filter(t=>!isNaN(t[k])); const m=med(w.map(t=>t[k]));
  console.log(st(w.filter(t=>t[k]<m), k+" < "+f(m,1)));
  console.log(st(w.filter(t=>t[k]>=m), k+" >= "+f(m,1)));
}
// urge trade-level
console.log(st(live.filter(t=>t.urge==="Yes"),"urge=Yes"));
console.log(st(live.filter(t=>t.urge==="No"),"urge=No"));

console.log("\n=== PSYCH -> BEHAVIOUR (re-test of last round's suggestive link) ===");
console.log("median splits on sessions; behaviour = trades/day, proc-Yes rate, note-writing rate");
for (const k of ["sleepH","sleepSc","ready","energy","tension"]) {
  const w=S.filter(s=>!isNaN(s[k])); if(w.length<10) continue;
  const m=med(w.map(s=>s[k])); const lo=w.filter(s=>s[k]<m), hi=w.filter(s=>s[k]>=m);
  if(lo.length<4||hi.length<4) continue;
  const pr=a=>{const y=sum(a.map(s=>s.procYes)),n=sum(a.map(s=>s.procNo));return y+n?y/(y+n):NaN;};
  const nt=a=>sum(a.map(s=>s.notes))/sum(a.map(s=>s.n));
  console.log(k.padEnd(9)+" thr="+f(m,1)+
    "  LOW(n="+lo.length+"): trades/day="+f(mean(lo.map(s=>s.n)))+" proc%="+f(pr(lo)*100,0)+" notes%="+f(nt(lo)*100,0)+" dayR="+f(mean(lo.map(s=>s.r)))+
    " | HIGH(n="+hi.length+"): trades/day="+f(mean(hi.map(s=>s.n)))+" proc%="+f(pr(hi)*100,0)+" notes%="+f(nt(hi)*100,0)+" dayR="+f(mean(hi.map(s=>s.r))));
  console.log("          permP trades/day="+f(permP(lo.map(s=>s.n),hi.map(s=>s.n)),4)+"  permP dayR="+f(permP(lo.map(s=>s.r),hi.map(s=>s.r)),4));
  T1+=2;
}
console.log("\nPSYCH TESTS:", T1);

// ---- DISCIPLINE ----
console.log("\n=== DISCIPLINE: Process Followed? ===");
for (const [bn,T] of [["prac",practice],["live",live]]) {
  const y=T.filter(t=>t.proc==="Yes"), n=T.filter(t=>t.proc==="No"), b=T.filter(t=>t.proc==="");
  console.log("-- "+bn+"  proc rate = "+f(y.length/(y.length+n.length)*100,0)+"% ("+y.length+"/"+(y.length+n.length)+"), blank="+b.length);
  console.log(st(y,"proc=Yes")); console.log(st(n,"proc=No")); if(b.length)console.log(st(b,"proc=blank"));
  console.log("   permP Yes vs No =",f(permP(R(y),R(n)),4));
}
console.log("\nlive proc rate by half of month:");
{ const dd=days(live); const h1=dd.slice(0,Math.ceil(dd.length/2)), h2=dd.slice(Math.ceil(dd.length/2));
  [["first half",h1],["second half",h2]].forEach(([lbl,ds])=>{
    const g=live.filter(t=>ds.includes(t.date)); const y=g.filter(t=>t.proc==="Yes").length,n=g.filter(t=>t.proc==="No").length,b=g.filter(t=>t.proc==="").length;
    console.log("  "+lbl.padEnd(12)+" n="+g.length+" Yes="+y+" No="+n+" blank="+b+"  proc%="+ (y+n?f(y/(y+n)*100,0):"--") + "  sumR="+f(sum(R(g)),1)); }); }

console.log("\nper-session journal fill (live):");
S.forEach(s=>console.log("  "+s.date+" n="+String(s.n).padStart(2)+" R="+f(s.r,1).padStart(6)+
  " procYes="+s.procYes+" procNo="+s.procNo+" blank="+s.procBlank+" notes="+s.notes+"/"+s.n+
  " E="+f(s.energy,0)+" T="+f(s.tension,0)+" sleep="+f(s.sleepH,1)+" ready="+f(s.ready,0)+" urge="+(s.urge||"-")));

// journal fill as LEADING indicator: does today's blank-rate predict TOMORROW's R?
console.log("\n=== journal fill as LEADING indicator (re-verify last round's REJECT) ===");
for (const [bn,SS] of [["prac",SP],["live",S]]) {
  const a=[],b=[];
  for (let i=0;i<SS.length-1;i++){ const blankRate=SS[i].procBlank/SS[i].n; a.push(blankRate); b.push(SS[i+1].r); }
  console.log(bn+" corr(today blank-rate, TOMORROW dayR) = "+f(corr(a,b),3)+" p="+f(permCorr(a,b),4)+" nDays="+a.length);
  const a2=SS.map(s=>s.procBlank/s.n), b2=SS.map(s=>s.r);
  console.log(bn+" corr(today blank-rate, SAME-day R)   = "+f(corr(a2,b2),3)+" p="+f(permCorr(a2,b2),4));
  const a3=SS.map(s=>s.notes/s.n);
  console.log(bn+" corr(today note-rate,  SAME-day R)   = "+f(corr(a3,b2),3)+" p="+f(permCorr(a3,b2),4));
}
