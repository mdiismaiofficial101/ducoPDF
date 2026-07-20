const https = require('https');
const zlib = require('zlib');
const BASE = "https://cybronetwork.online";

function req(method, path, obj, extraHeaders){
  return new Promise((resolve,reject)=>{
    const data = obj===undefined?null:JSON.stringify(obj);
    const u = new URL(BASE+path);
    const headers = Object.assign({"Content-Type":"application/json"}, extraHeaders||{});
    if(data) headers["Content-Length"]=Buffer.byteLength(data);
    const r=https.request({method,hostname:u.hostname,path:u.pathname+u.search,headers},res=>{let b="";res.on("data",c=>b+=c);res.on("end",()=>resolve({status:res.statusCode,body:b}));});
    r.on("error",reject);if(data)r.write(data);r.end();
  });
}

// Build a simple PNG cover (1200x630) with gradient + title text drawn as basic shapes.
// We'll generate a minimal valid PNG: solid/gradient background, no font rendering (use simple bars).
// Simpler: generate an SVG and convert? No converter. Instead produce a PNG via manual bitmap + zlib.
function makeCoverPNG(title){
  const W=1200,H=630;
  const raw=Buffer.alloc(H*(1+W*3)); // add filter byte per row
  for(let y=0;y<H;y++){
    raw[y*(1+W*3)]=0; // filter none
    for(let x=0;x<W;x++){
      const t=x/W;
      // gradient indigo -> amber
      const r=Math.round(26 + t*(255-26));
      const g=Math.round(35 + t*(111-35));
      const b=Math.round(126 + t*(0-126));
      const off=y*(1+W*3)+1+x*3;
      raw[off]=r; raw[off+1]=g; raw[off+2]=b;
    }
  }
  // build PNG
  function chunk(type,data){
    const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
    const t=Buffer.from(type,'ascii');
    const crc=Buffer.alloc(4);
    const buf=Buffer.concat([t,data]);
    crc.writeUInt32BE(crc32(buf)>>>0,0);
    return Buffer.concat([len,buf,crc]);
  }
  function crc32(buf){
    let c=~0;
    for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}
    return ~c;
  }
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  const idat=zlib.deflateSync(raw);
  return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
}

function b64(buf){return buf.toString('base64');}

async function getBlogs(){
  const r=await req("GET","/api/blogs");
  return JSON.parse(r.body).blogs||[];
}

async function main(){
  const blogs=await getBlogs();
  let done=0, skip=0;
  for(const b of blogs){
    if(b.featuredImage && b.featuredImage.startsWith("https://img.cybronetwork.online")){ skip++; continue; }
    const png=makeCoverPNG(b.title);
    const up=await req("POST","/api/upload",{base64:b64(png),ext:"png"});
    if(up.status!==200){ console.log("UPLOAD FAIL "+b.slug); continue; }
    const url=JSON.parse(up.body).url;
    b.featuredImage=url;
    b.imageAlt=b.imageAlt||b.title;
    const save=await req("POST","/api/blogs",b);
    if(save.status===200){done++; console.log("IMG OK "+b.slug);} else {console.log("SAVE FAIL "+b.slug);}
    await new Promise(r=>setTimeout(r,300));
  }
  console.log(`\nDONE. images added=${done} skipped=${skip}`);
}
main().catch(e=>console.error(e));
