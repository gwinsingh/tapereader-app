const fs=require("fs"),path=require("path");
const { parseEnvLocal, getAccessToken, ENV_PATH } = require("./env.js");
const OUT=path.join(__dirname,".data","shots");
(async()=>{
  const env=parseEnvLocal(ENV_PATH);
  const tok=await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const H={Authorization:`Bearer ${tok}`};
  const ids=process.argv.slice(2);
  for(const spec of ids){
    const [id,name]=spec.split("::");
    const r=await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`,{headers:H});
    if(!r.ok){console.log("FAIL",name,r.status);continue;}
    const buf=Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(OUT,name),buf);
    console.log("saved",name,buf.length,"bytes");
  }
})();
