const L=require("./lib.js"); const f=L.f,sum=L.sum,R=L.R;
const mfe=t=>{const a=isNaN(t.maxR)?-99:t.maxR,b=isNaN(t.pnlR)?-99:t.pnlR;return (isNaN(t.maxR)&&isNaN(t.pnlR))?NaN:Math.max(a,b,0);};
const W=L.live.filter(t=>!isNaN(t.pnlR));
const sh=W.filter(t=>t.dur<5);
const dead=sh.filter(t=>mfe(t)<0.5), bail=sh.filter(t=>mfe(t)>=2);
console.log("short dead n=",dead.length,"sumR=",f(sum(R(dead)),1));
console.log("short mid  n=",sh.filter(t=>mfe(t)>=0.5&&mfe(t)<2).length,"sumR=",f(sum(R(sh.filter(t=>mfe(t)>=0.5&&mfe(t)<2))),1));
console.log("short bail n=",bail.length,"sumR=",f(sum(R(bail)),1),bail.map(t=>`${t.date} ${t.sym} mfe=${f(mfe(t))} real=${f(t.pnlR)} left=${f(mfe(t)-t.pnlR)}`));
console.log("bail potential left =",f(sum(bail.map(t=>mfe(t)-t.pnlR)),1),"R");
