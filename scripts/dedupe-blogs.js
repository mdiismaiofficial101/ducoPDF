const https = require('https');
const BASE = "https://cybronetwork.online";
function req(method, path, obj){
  return new Promise((resolve,reject)=>{
    const data = obj===undefined?null:JSON.stringify(obj);
    const u = new URL(BASE+path);
    const headers={"Content-Type":"application/json"};
    if(data)headers["Content-Length"]=Buffer.byteLength(data);
    const r=https.request({method,hostname:u.hostname,path:u.pathname+u.search,headers},res=>{let b="";res.on("data",c=>b+=c);res.on("end",()=>resolve({status:res.statusCode,body:b}));});
    r.on("error",reject);if(data)r.write(data);r.end();
  });
}
(async()=>{
  const r = await req("GET","/api/blogs");
  const d = JSON.parse(r.body);
  const all = d.blogs||[];
  const seen = new Set(); const unique=[];
  for(const b of all){ if(seen.has(b.slug)){ continue; } seen.add(b.slug); unique.push(b); }
  const dupes = all.length - unique.length;
  // delete all then re-add unique
  for(const b of all){ try{ await req("DELETE","/api/blogs?id="+encodeURIComponent(b.id)); }catch(e){} }
  for(const b of unique){ try{ await req("POST","/api/blogs",b); }catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const r2 = await req("GET","/api/blogs");
  const d2 = JSON.parse(r2.body);
  console.log(`Removed ${dupes} duplicates. Now total: ${d2.count}`);
})();
