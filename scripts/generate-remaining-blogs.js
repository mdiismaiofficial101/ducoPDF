const https = require('https');
const BASE = "https://cybronetwork.online";

const ALL_TITLES = [
  "How to Merge PDF Files Online for Free","Split PDF into Multiple Files: Step-by-Step Guide","Compress PDF Without Losing Quality","Rotate PDF Pages in Seconds","Convert PDF to Word Easily","Convert Word to PDF Online","JPG to PDF Converter: Combine Images","Extract Images with PDF to JPG","Protect PDF with a Password","Unlock PDF When You Forget the Password","Add a Watermark to Your PDF","OCR PDF: Turn Scans into Text","Organize PDF Pages Like a Pro","Crop PDF Pages to Remove Margins","AI PDF Summarizer: Save Reading Time","Delete Pages from a PDF","Add eSignature to PDF Documents","Compare Two PDFs to Spot Differences","Repair a Corrupted PDF File","Redact Sensitive Info in PDFs","Convert Excel to PDF","Convert PDF to Excel for Data","Convert PPT to PDF Presentations","Convert PDF to PowerPoint","Convert HTML to PDF","Convert PDF to PDF/A for Archiving","Convert PDF to Markdown","Translate PDF Documents Online","Build a Resume with PDF Templates","Automate Tasks with PDF Workflows","Top 10 PDF Tips for Students","How Small Businesses Use PDF Tools","PDF Security Best Practices 2026","Reduce PDF Size for Email","Create Fillable PDF Forms","Edit PDF Text Without Adobe","Annotate and Comment on PDFs","Batch Process Multiple PDFs","Extract Text from Scanned PDFs","Combine Screenshots into One PDF","Password Protect Confidential Reports","Flatten PDF for Final Delivery","Number Pages in a PDF","Bookmark Long PDF Documents","Optimize PDFs for Web Viewing","Archive Invoices as Searchable PDFs","Share Large PDFs via Link","Convert Contracts to Editable Word","Make Accessible PDFs for Everyone"
];

function req(method, path, obj, extraHeaders) {
  return new Promise((resolve, reject) => {
    const data = obj === undefined ? null : JSON.stringify(obj);
    const u = new URL(BASE + path);
    const headers = Object.assign({ "Content-Type": "application/json" }, extraHeaders || {});
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    const r = https.request({ method, hostname: u.hostname, path: u.pathname + u.search, headers }, res => {
      let body = ""; res.on("data", c => body += c);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

function genSlug(t){return t.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_]+/g,'-').replace(/^-+|-+$/g,'').substring(0,80);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substring(2,9);}
function cleanJSON(raw){let s=String(raw).trim().replace(/```json?/gi,'').replace(/```/g,'').trim();const m=s.match(/\{[\s\S]*\}/);return m?m[0]:s;}

async function getServerSlugs(){
  const r = await req("GET","/api/blogs");
  const d = JSON.parse(r.body);
  return new Set((d.blogs||[]).map(b=>b.slug));
}

async function genOne(title, cat){
  for (let attempt=0; attempt<3; attempt++){
    try {
      const seo = await req("POST","/api/bazaarlink/chat",{action:"auto-seo",title,keyword:"",model:"deepseek/deepseek-v4-flash:free"});
      if (seo.status!==200) throw new Error("seo "+seo.status);
      const sp = JSON.parse(cleanJSON(JSON.parse(seo.body).result));
      const slug = genSlug(title);
      const blog = {id:uid(),title,slug,category:cat,featuredImage:"",imageAlt:sp.imageAlt||title,shortDescription:sp.shortDescription||(title+" - complete guide."),content:sp.content||"",metaTitle:sp.metaTitle||(title+" | DocuPDF Blog"),metaDescription:sp.metaDescription||(title+" - step-by-step guide."),focusKeyword:sp.focusKeyword||title.toLowerCase(),tags:sp.tags&&sp.tags.length?sp.tags:[title.split(' ')[0],"pdf"],canonicalUrl:sp.canonicalUrl||(BASE+"/blog/"+slug),publishDate:new Date().toISOString().split('T')[0],author:"DocuPDF Team",faq:sp.faq||[],relatedTools:sp.relatedTools&&sp.relatedTools.length?sp.relatedTools:["Merge PDF"],relatedBlogs:[],published:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      const save = await req("POST","/api/blogs",blog);
      if (save.status===200) return true;
      throw new Error("save "+save.status);
    } catch(e){
      if (attempt===2) return false;
      await new Promise(r=>setTimeout(r,1000));
    }
  }
  return false;
}

(async () => {
  const cats = ['PDF Tips','Convert PDF','Compress PDF','PDF Security','PDF Editing','Document Management','Productivity','Tutorial'];
  const existing = await getServerSlugs();
  let ok=0, skip=0, fail=0;
  for (let i=0;i<ALL_TITLES.length;i++){
    const title = ALL_TITLES[i];
    const slug = genSlug(title);
    if (existing.has(slug)){ skip++; console.log(`SKIP ${i+1} ${slug}`); continue; }
    const done = await genOne(title, cats[i%cats.length]);
    if (done){ ok++; console.log(`OK ${i+1} ${slug}`); } else { fail++; console.log(`FAIL ${i+1} ${slug}`); }
    await new Promise(r=>setTimeout(r,500));
  }
  console.log(`\nDONE. ok=${ok} skip=${skip} fail=${fail}`);
})();
