const L=require("./lib.js"); const {f,mean,med,sum,R}=L;
const all=[...L.live];
all.forEach(t=>{t.stopPct = Math.abs(t.ent-t.stop)/t.ent*100; t.stopVsATR = Math.abs(t.ent-t.stop)/t.atr;});
console.log("stop distance as % of price, live: min="+f(Math.min(...all.map(t=>t.stopPct)),3)+" med="+f(med(all.map(t=>t.stopPct)),3)+" max="+f(Math.max(...all.map(t=>t.stopPct)),3));
console.log("stop distance / daily ATR:        min="+f(Math.min(...all.map(t=>t.stopVsATR)),3)+" med="+f(med(all.map(t=>t.stopVsATR)),3)+" max="+f(Math.max(...all.map(t=>t.stopVsATR)),3));
console.log("\nmaxR==0 rate by stop-distance quartile (live):");
const s=all.filter(t=>!isNaN(t.stopPct)).sort((a,b)=>a.stopPct-b.stopPct);
for(let q=0;q<4;q++){const a=s.slice(Math.floor(q*s.length/4),Math.floor((q+1)*s.length/4));
  console.log(`  Q${q+1} stopPct ${f(a[0].stopPct,3)}-${f(a[a.length-1].stopPct,3)}%  n=${a.length}  maxR=0 rate=${f(a.filter(t=>t.maxR===0).length/a.length*100,0)}%  medPartials=${f(med(a.map(t=>t.part)),0)}  medShares=${f(med(a.map(t=>t.sh)),0)}  sumR=${f(sum(R(a)),1)}`);}
console.log("\nmaxR==0 rate by # partials:");
[0,1,2,3,4].forEach(p=>{const a=all.filter(t=>p<4?t.part===p:t.part>=4);
  if(a.length)console.log(`  partials ${p<4?p:"4+"}: n=${a.length} maxR=0 rate=${f(a.filter(t=>t.maxR===0).length/a.length*100,0)}% medStopPct=${f(med(a.map(t=>t.stopPct)),3)}% sumR=${f(sum(R(a)),1)}`);});
console.log("\ncorrelation partials vs stopPct (rank):");
function rank(v){const q=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]);const r=new Array(v.length);
 let i=0;while(i<q.length){let j=i;while(j+1<q.length&&q[j+1][0]===q[i][0])j++;const a=(i+j)/2+1;
 for(let k=i;k<=j;k++)r[q[k][1]]=a;i=j+1;}return r;}
function pear(x,y){const n=x.length,mx=mean(x),my=mean(y);let a=0,b=0,c=0;
 for(let i=0;i<n;i++){const dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return a/Math.sqrt(b*c);}
const v=all.filter(t=>!isNaN(t.part)&&!isNaN(t.stopPct));
console.log("  rho = "+f(pear(rank(v.map(t=>t.part)),rank(v.map(t=>t.stopPct)))));
