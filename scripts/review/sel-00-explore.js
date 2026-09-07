const L = require("./lib.js");

function overview(T, name) {
  console.log(`\n===== ${name} =====`);
  console.log(L.st(T, "ALL"));
  console.log("sessions:", L.days(T).length, L.days(T)[0], "->", L.days(T).slice(-1)[0]);
  const fields = ["pnlR","risk","maxR","mae","ent","orH","orL","orSize","orATR","atr","adr","m30",
    "vwap","gap","rvol","float","advol","pcl","d20","d50","pdc","pdh","pdl","O","H","L","C","V","bvr","conv"];
  fields.forEach(f => {
    const v = T.map(t => t[f]).filter(x => !isNaN(x));
    console.log(`  ${f.padEnd(8)} filled=${String(v.length).padStart(3)}/${T.length}  min=${L.f(Math.min(...v))} med=${L.f(L.med(v))} max=${L.f(Math.max(...v))}`);
  });
  const sfields = ["side","setup","proc","right","cat","origin","l2","dT","hT","mT","spy","tags","bias","emo","urge"];
  sfields.forEach(f => {
    const c = {};
    T.forEach(t => { const v = t[f] || "(blank)"; c[v] = (c[v]||0)+1; });
    console.log(`  ${f.padEnd(8)} ` + Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join("  ").slice(0,260));
  });
  const nf = ["dC","hC","mC"];
  nf.forEach(f => {
    const v = T.map(t=>t[f]).filter(x=>!isNaN(x));
    const c = {}; v.forEach(x => c[x]=(c[x]||0)+1);
    console.log(`  ${f.padEnd(8)} filled=${v.length} ` + Object.entries(c).sort().map(([k,v])=>`${k}:${v}`).join(" "));
  });
  // symbols
  const sc = {}; T.forEach(t => (sc[t.sym] ||= []).push(t));
  console.log("  symbols:", Object.keys(sc).length);
  console.log("  top:", Object.entries(sc).sort((a,b)=>b[1].length-a[1].length).slice(0,25)
    .map(([k,v])=>`${k}:${v.length}`).join("  "));
}
overview(L.live, "LIVE");
overview(L.practice, "PRACTICE");
