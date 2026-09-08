/* SELECTION track — Section 4: THE EXTENSION METRIC */
const L = require("./lib.js");

// ---- construct ----
function enrich(T) {
  T.forEach(t => {
    const long = t.side !== "Short";
    t.long = long;
    t.brk  = long ? t.orH : t.orL;                 // breakout level
    t.extAbs = long ? (t.ent - t.orH) : (t.orL - t.ent);
    t.extOR  = t.extAbs / t.orSize;                // OR-size units
    t.extATR = t.extAbs / t.atr;                   // daily-ATR units
    t.ext30  = t.extAbs / t.m30;                   // opening-range-volatility units
    t.posOR  = long ? (t.ent - t.orL)/t.orSize : (t.orH - t.ent)/t.orSize; // 0=low,1=high of OR
    t.openExt30 = (long ? (t.ent - t.O) : (t.O - t.ent)) / t.m30;   // knowable at entry
    t.stopD  = Math.abs(t.ent - t.stop);
    t.stopATR= t.stopD / t.atr;
    t.stopOR = t.stopD / t.orSize;
    t.post935 = t.t >= 9*3600 + 35*60;
    t.mfeATR = t.maxR * t.stopD / t.atr;           // stop-distance-free MFE
    t.retATR = t.pnlR * t.stopD / t.atr;           // stop-distance-free realized
    t.mfeOK  = !isNaN(t.maxR) && !isNaN(t.pnlR) && t.maxR >= t.pnlR - 0.05;
    t.pdhD   = (t.ent - t.pdh) / t.atr;
  });
}
enrich(L.live); enrich(L.practice);

function q(a, p) { const s=[...a].filter(x=>!isNaN(x)).sort((x,y)=>x-y); if(!s.length) return NaN;
  return s[Math.min(s.length-1, Math.floor(p*s.length))]; }
function dist(T, f, name) {
  const v = T.map(t=>t[f]).filter(x=>isFinite(x));
  console.log(`  ${name.padEnd(12)} n=${String(v.length).padStart(3)} p10=${L.f(q(v,.10))} p25=${L.f(q(v,.25))} med=${L.f(L.med(v))} p75=${L.f(q(v,.75))} p90=${L.f(q(v,.90))} max=${L.f(Math.max(...v))}`);
}

console.log("=== 4.1 Distribution of entry position vs the opening range ===");
[["LIVE",L.live],["PRACTICE",L.practice]].forEach(([n,T])=>{
  console.log(`-- ${n} (all) --`);
  ["extOR","extATR","ext30","posOR","openExt30","vwap","stopATR","stopOR"].forEach(f=>dist(T,f,f));
  const post = T.filter(t=>t.post935), pre = T.filter(t=>!t.post935);
  console.log(`-- ${n} POST-9:35 (OR complete & knowable at entry) n=${post.length} --`);
  ["extOR","extATR","ext30","openExt30"].forEach(f=>dist(post,f,f));
  console.log(`-- ${n} PRE-9:35 (OR not yet complete; ext is post-hoc) n=${pre.length} --`);
  ["extOR","extATR","ext30","openExt30"].forEach(f=>dist(pre,f,f));
});

console.log("\n=== 4.2 Rule compliance: how often does he enter beyond the breakout level? ===");
[["LIVE",L.live],["PRACTICE",L.practice]].forEach(([n,T])=>{
  const post = T.filter(t=>t.post935 && isFinite(t.extOR));
  const all  = T.filter(t=>isFinite(t.extOR));
  const bands = [["at/below OR (ext<=0)",x=>x<=0],["0 - 0.25 OR",x=>x>0&&x<=.25],
                 ["0.25 - 0.5 OR",x=>x>.25&&x<=.5],["0.5 - 1.0 OR",x=>x>.5&&x<=1],[">1.0 OR",x=>x>1]];
  console.log(`-- ${n} ALL (n=${all.length}) --`);
  bands.forEach(([lab,fn])=>{const g=all.filter(t=>fn(t.extOR)); console.log("   "+L.st(g,lab)+"  share="+L.pctf(g.length,all.length));});
  console.log(`-- ${n} POST-9:35 only (n=${post.length}) --`);
  bands.forEach(([lab,fn])=>{const g=post.filter(t=>fn(t.extOR)); console.log("   "+L.st(g,lab)+"  share="+L.pctf(g.length,post.length));});
});

console.log("\n=== 4.3 Does extension predict outcome? (median split + tertiles) ===");
function split(T, f, name, label) {
  const v = T.filter(t=>isFinite(t[f]));
  if (v.length < 10) { console.log(`  ${name}: n=${v.length} too small`); return 0; }
  const m = L.med(v.map(t=>t[f]));
  const lo = v.filter(t=>t[f]<=m), hi = v.filter(t=>t[f]>m);
  console.log(`  [${label}] ${name} median=${L.f(m)}`);
  console.log("    "+L.st(lo, "<= med"));
  console.log("    "+L.st(hi, ">  med"));
  console.log("    p=", L.f(L.permP(L.R(lo), L.R(hi)),3));
  return 1;
}
let tests = 0;
console.log("-- LIVE all trades --");
["extOR","extATR","ext30","posOR","openExt30","vwap"].forEach(f=>tests+=split(L.live,f,f,"live-all"));
console.log("-- LIVE post-9:35 --");
const lpost = L.live.filter(t=>t.post935);
["extOR","extATR","openExt30"].forEach(f=>tests+=split(lpost,f,f,"live-post935"));
console.log("-- PRACTICE all (discovery set) --");
["extOR","extATR","ext30","posOR","openExt30","vwap"].forEach(f=>tests+=split(L.practice,f,f,"prac-all"));
console.log("\nsplit tests run:", tests);

console.log("\n=== 4.4 ARTIFACT #1 CONTROL: does extension mechanically widen the stop? ===");
function corr(T, a, b) {
  const v = T.filter(t=>isFinite(t[a])&&isFinite(t[b]));
  const xa = v.map(t=>t[a]), xb = v.map(t=>t[b]);
  const ma=L.mean(xa), mb=L.mean(xb);
  const cov = L.mean(v.map((_,i)=>(xa[i]-ma)*(xb[i]-mb)));
  return {r: cov/(L.sd(xa)*L.sd(xb)), n: v.length};
}
[["LIVE",L.live],["PRACTICE",L.practice]].forEach(([n,T])=>{
  [["extOR","stopOR"],["extOR","stopATR"],["extATR","stopATR"],["extOR","pnlR"],["extOR","maxR"]].forEach(([a,b])=>{
    const c = corr(T,a,b); console.log(`  ${n} corr(${a},${b}) r=${L.f(c.r,3)} n=${c.n}`);
  });
});
console.log("\n  stop-distance-free outcomes by extension band (LIVE, mfe-consistent rows only):");
const ok = L.live.filter(t=>t.mfeOK && isFinite(t.extOR));
console.log(`  (mfe-consistent live rows: ${ok.length}/${L.live.length})`);
[["ext<=0",t=>t.extOR<=0],["ext 0-0.5",t=>t.extOR>0&&t.extOR<=.5],["ext>0.5",t=>t.extOR>.5]].forEach(([lab,fn])=>{
  const g = ok.filter(fn);
  console.log(`   ${lab.padEnd(12)} n=${String(g.length).padStart(3)} win%=${L.pctf(g.filter(t=>t.pnl>0).length,g.length)}`+
    ` meanMFE_ATR=${L.f(L.mean(g.map(t=>t.mfeATR).filter(isFinite)))}`+
    ` meanRET_ATR=${L.f(L.mean(g.map(t=>t.retATR).filter(isFinite)),3)}`+
    ` meanStopATR=${L.f(L.mean(g.map(t=>t.stopATR).filter(isFinite)),3)}`+
    ` expR=${L.f(L.mean(L.R(g)))}`);
});
console.log("\n  same on PRACTICE (mfe-consistent):");
const okp = L.practice.filter(t=>t.mfeOK && isFinite(t.extOR));
[["ext<=0",t=>t.extOR<=0],["ext 0-0.5",t=>t.extOR>0&&t.extOR<=.5],["ext>0.5",t=>t.extOR>.5]].forEach(([lab,fn])=>{
  const g = okp.filter(fn);
  console.log(`   ${lab.padEnd(12)} n=${String(g.length).padStart(3)} win%=${L.pctf(g.filter(t=>t.pnl>0).length,g.length)}`+
    ` meanMFE_ATR=${L.f(L.mean(g.map(t=>t.mfeATR).filter(isFinite)))}`+
    ` meanRET_ATR=${L.f(L.mean(g.map(t=>t.retATR).filter(isFinite)),3)}`+
    ` meanStopATR=${L.f(L.mean(g.map(t=>t.stopATR).filter(isFinite)),3)}`+
    ` expR=${L.f(L.mean(L.R(g)))}`);
});
