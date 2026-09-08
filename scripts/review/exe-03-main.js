const L = require("./lib.js");
const f = L.f, sum = L.sum, mean = L.mean, med = L.med, R = L.R;
const mfe = t => { const a=isNaN(t.maxR)?-99:t.maxR, b=isNaN(t.pnlR)?-99:t.pnlR;
  return (isNaN(t.maxR)&&isNaN(t.pnlR))?NaN:Math.max(a,b,0); };
const has = t => !isNaN(mfe(t)) && !isNaN(t.pnlR);
const hdr = s => console.log("\n"+"=".repeat(78)+"\n"+s+"\n"+"=".repeat(78));
const books = [["LIVE", L.live], ["PRACTICE", L.practice]];

// ==== 4. EXIT EFFICIENCY ================================================
hdr("4. EXIT EFFICIENCY  (leftR = mfe - realisedR, on trades that offered >=1R)");
for (const [lab, T] of books) {
  const W = T.filter(has).filter(t => mfe(t) >= 1);
  console.log(`\n--- ${lab}  n=${W.length}  totalLeft=${f(sum(W.map(t=>mfe(t)-t.pnlR)),1)}R  meanLeft=${f(mean(W.map(t=>mfe(t)-t.pnlR)))}R  effic(sumReal/sumMFE)=${f(sum(R(W))/sum(W.map(mfe))*100,0)}% ---`);
  const grp = (name, keyf) => {
    const m = {}; W.forEach(t => { const k = keyf(t); if (k==null) return; (m[k] ||= []).push(t); });
    console.log(` by ${name}:`);
    Object.keys(m).sort().forEach(k => { const a = m[k];
      console.log(`   ${String(k).padEnd(14)} n=${String(a.length).padStart(3)}${a.length<15?"*":" "} meanMFE=${f(mean(a.map(mfe))).padStart(6)} meanReal=${f(mean(R(a))).padStart(6)} meanLeft=${f(mean(a.map(t=>mfe(t)-t.pnlR))).padStart(6)} effic=${f(sum(R(a))/sum(a.map(mfe))*100,0).padStart(4)}% sumLeft=${f(sum(a.map(t=>mfe(t)-t.pnlR)),1).padStart(6)}`); });
  };
  grp("MFE size", t => mfe(t)<2?"1-2R":mfe(t)<3?"2-3R":mfe(t)<6?"3-6R":"6R+");
  grp("risk unit", t => isNaN(t.risk)?null:"$"+t.risk);
  grp("hour ET", t => { const h=Math.floor(t.t/3600), m=Math.floor(t.t%3600/60);
    return h===9?(m<35?"0930-0935":"0935-1000"):h===10?"1000-1100":h>=11?"1100+":null; });
  grp("symbol cls", t => ["SPY","QQQ","IWM","SQQQ","TQQQ"].includes(t.sym)?"ETF":
    ["AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA","AVGO"].includes(t.sym)?"megacap":"other");
  grp("partials", t => t.part<=2?"all-out(<=2)":t.part===3?"3":"4+");
  grp("dur", t => t.dur<5?"<5m":t.dur<15?"5-15m":"15m+");
  // biggest single leaks
  const s=[...W].sort((x,y)=>(mfe(y)-y.pnlR)-(mfe(x)-x.pnlR));
  console.log(" top leaks:", s.slice(0,8).map(t=>`${t.date} ${t.sym} mfe=${f(mfe(t))} real=${f(t.pnlR)} left=${f(mfe(t)-t.pnlR)}`).join(" | "));
}

// ==== 5. HOLD TIME vs OUTCOME (artifact #2) =============================
hdr("5. HOLD TIME vs OUTCOME — MFE separates 'entry was bad' from 'exited early'");
for (const [lab, T] of books) {
  const W = T.filter(has).filter(t=>!isNaN(t.dur));
  console.log(`\n--- ${lab} n=${W.length} ---`);
  const DB=[["<2m",t=>t.dur<2],["2-5m",t=>t.dur>=2&&t.dur<5],["5-15m",t=>t.dur>=5&&t.dur<15],["15m+",t=>t.dur>=15]];
  console.log(" dur      n   win%  expR    sumR    meanMFE  %MFE<0.5 (never worked)  %MFE>=2 (bailed on winner)");
  for (const [b,fn] of DB) { const a=W.filter(fn); if(!a.length) continue;
    console.log(`  ${b.padEnd(7)} ${String(a.length).padStart(3)}${a.length<15?"*":" "} ${f(a.filter(t=>t.pnl>0).length/a.length*100,0).padStart(4)} ${f(mean(R(a))).padStart(6)} ${f(sum(R(a)),1).padStart(7)} ${f(mean(a.map(mfe))).padStart(8)} ${f(a.filter(t=>mfe(t)<0.5).length/a.length*100,0).padStart(10)}% ${f(a.filter(t=>mfe(t)>=2).length/a.length*100,0).padStart(22)}%`); }
  const sh=W.filter(t=>t.dur<5), lo=W.filter(t=>t.dur>=5);
  console.log(` <5m  n=${sh.length} sumR=${f(sum(R(sh)),1)} MFE<0.5:${sh.filter(t=>mfe(t)<0.5).length} MFE 0.5-2:${sh.filter(t=>mfe(t)>=0.5&&mfe(t)<2).length} MFE>=2:${sh.filter(t=>mfe(t)>=2).length}`);
  console.log(` >=5m n=${lo.length} sumR=${f(sum(R(lo)),1)} MFE<0.5:${lo.filter(t=>mfe(t)<0.5).length} MFE 0.5-2:${lo.filter(t=>mfe(t)>=0.5&&mfe(t)<2).length} MFE>=2:${lo.filter(t=>mfe(t)>=2).length}`);
  console.log(` H4 permP(<5m vs >=5m) = ${f(L.permP(R(sh),R(lo)),4)}`);
  // MFE-matched: within MFE>=1 only, does duration still matter?
  const m1=W.filter(t=>mfe(t)>=1), a1=m1.filter(t=>t.dur<5), b1=m1.filter(t=>t.dur>=5);
  console.log(` MFE>=1 matched: <5m ${L.st(a1,"")} ;  >=5m ${L.st(b1,"")}  permP=${f(L.permP(R(a1),R(b1)),4)}`);
}

// ==== 6. PARTIALS (artifact #3) ==========================================
hdr("6. PARTIALS — value AFTER controlling for opportunity (MFE)");
for (const [lab, T] of books) {
  const W = T.filter(has).filter(t=>!isNaN(t.part));
  console.log(`\n--- ${lab} n=${W.length} ---`);
  const lo=W.filter(t=>t.part<=2), hi=W.filter(t=>t.part>=3);
  console.log(" raw:", L.st(lo,"<=2 partials"), "\n     ", L.st(hi,">=3 partials"), "\n      permP=", f(L.permP(R(lo),R(hi)),4));
  console.log("  meanMFE  <=2:", f(mean(lo.map(mfe))), " >=3:", f(mean(hi.map(mfe))), " medDur <=2:", f(med(lo.map(t=>t.dur)),1), " >=3:", f(med(hi.map(t=>t.dur)),1));
  console.log(" MFE-stratified (compare only within similar opportunity):");
  for (const [b,fn] of [["MFE<0.5",t=>mfe(t)<0.5],["MFE 0.5-2",t=>mfe(t)>=0.5&&mfe(t)<2],["MFE>=2",t=>mfe(t)>=2]]) {
    const a=W.filter(fn), x=a.filter(t=>t.part<=2), y=a.filter(t=>t.part>=3);
    if(!x.length||!y.length) continue;
    console.log(`  ${b.padEnd(10)} <=2: n=${String(x.length).padStart(3)}${x.length<15?"*":" "} expR=${f(mean(R(x))).padStart(6)} capt=${f(sum(R(x))/sum(x.map(mfe))*100,0).padStart(4)}%  |  >=3: n=${String(y.length).padStart(3)}${y.length<15?"*":" "} expR=${f(mean(R(y))).padStart(6)} capt=${f(sum(R(y))/sum(y.map(mfe))*100,0).padStart(4)}%  permP=${f(L.permP(R(x),R(y)),4)}`);
  }
}

// ==== 7. LOSER DISTRIBUTION =============================================
hdr("7. LOSER DISTRIBUTION / is the stop respected?");
for (const [lab, T] of books) {
  const W = T.filter(t=>!isNaN(t.pnlR));
  const los=W.filter(t=>t.pnlR<0), win=W.filter(t=>t.pnlR>0), scr=W.filter(t=>Math.abs(t.pnlR)<0.15);
  console.log(`\n--- ${lab} n=${W.length} ---`);
  console.log(` losers n=${los.length} (${f(los.length/W.length*100,0)}%) meanR=${f(mean(R(los)))} medR=${f(med(R(los)))} sumR=${f(sum(R(los)),1)} worst=${f(Math.min(...R(los)))}`);
  console.log(` winners n=${win.length} meanR=${f(mean(R(win)))} medR=${f(med(R(win)))} sumR=${f(sum(R(win)),1)} best=${f(Math.max(...R(win)))}`);
  console.log(` payoff ratio (meanWin/|meanLoss|)=${f(mean(R(win))/Math.abs(mean(R(los))))}`);
  console.log(` scratches |R|<0.15: n=${scr.length} (${f(scr.length/W.length*100,0)}%)`);
  for (const x of [1,1.25,1.5,2]) { const a=los.filter(t=>t.pnlR<-x);
    console.log(`   losers worse than -${x}R: n=${a.length} (${f(a.length/los.length*100,0)}% of losers) sumR=${f(sum(R(a)),1)}`); }
  const hist={}; los.forEach(t=>{const b=Math.floor(-t.pnlR*4)/4; hist[b]=(hist[b]||0)+1;});
  console.log("  loser size hist (0.25R bins, -R):", Object.keys(hist).sort((a,b)=>a-b).map(k=>`${k}:${hist[k]}`).join(" "));
}

// ==== 8. RISK-UNIT CHANGE ===============================================
hdr("8. RISK-UNIT CHANGE WITHIN THE LIVE MONTH  ($14 -> $18 -> $28)");
{
  const W = L.live.filter(has);
  const g = {}; W.forEach(t => { const k = isNaN(t.risk)?"blank":"$"+t.risk; (g[k]||=[]).push(t); });
  for (const k of Object.keys(g).sort((a,b)=>parseFloat(a.slice(1))-parseFloat(b.slice(1)))) {
    const a=g[k]; console.log(L.st(a, k), ` meanMFE=${f(mean(a.map(mfe)))} medDur=${f(med(a.map(t=>t.dur)),1)} meanMAE=${f(mean(a.map(t=>t.mae)))} capt(mfe>=1)=${(()=>{const b=a.filter(t=>mfe(t)>=1);return b.length?f(mean(b.map(t=>Math.min(t.pnlR,2.5)))/2.5*100,0)+"%":"--";})()}`);
  }
  // clean two-block comparison: $14 era vs $18 era
  const e14=W.filter(t=>t.risk===14), e18=W.filter(t=>t.risk===18);
  console.log("\n clean blocks:");
  console.log(L.st(e14,"$14 (7/30-8/13)"), ` medDur=${f(med(e14.map(t=>t.dur)),1)} meanMFE=${f(mean(e14.map(mfe)))} meanMAE=${f(mean(e14.map(t=>t.mae)))} meanLoser=${f(mean(R(e14.filter(t=>t.pnlR<0))))}`);
  console.log(L.st(e18,"$18 (8/14-8/28)"), ` medDur=${f(med(e18.map(t=>t.dur)),1)} meanMFE=${f(mean(e18.map(mfe)))} meanMAE=${f(mean(e18.map(t=>t.mae)))} meanLoser=${f(mean(R(e18.filter(t=>t.pnlR<0))))}`);
  console.log(" permP =", f(L.permP(R(e14),R(e18)),4));
  console.log(" capture@2.5 $14:", (()=>{const b=e14.filter(t=>mfe(t)>=2.5);return `n=${b.length} ${b.length?f(mean(b.map(t=>Math.min(t.pnlR,2.5)))/2.5*100,0)+"%":"--"}`;})(),
              "| $18:", (()=>{const b=e18.filter(t=>mfe(t)>=2.5);return `n=${b.length} ${b.length?f(mean(b.map(t=>Math.min(t.pnlR,2.5)))/2.5*100,0)+"%":"--"}`;})());
  // chronological halves as an alternative framing (calendar, not risk)
  const ds=L.days(L.live); const mid=ds[Math.floor(ds.length/2)];
  const h1=W.filter(t=>t.date<mid), h2=W.filter(t=>t.date>=mid);
  console.log("\n chronological halves (split", mid, "):");
  console.log(L.st(h1,"first half"), ` medDur=${f(med(h1.map(t=>t.dur)),1)}`);
  console.log(L.st(h2,"second half"), ` medDur=${f(med(h2.map(t=>t.dur)),1)}`);
}
