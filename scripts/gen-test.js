const https = require('https');

const BAZAAR_KEY = "sk-bl-PlqAkxbBcu-lJuR8VAsDDk6rydb41Y7s0HcGimt0Wy0ckMFR";
const BASE = "https://cybronetwork.online";

const TITLES = [
  "How to Merge PDF Files Online for Free",
  "Split PDF into Multiple Files: Step-by-Step Guide",
  "Compress PDF Without Losing Quality",
  "Rotate PDF Pages in Seconds",
  "Convert PDF to Word Easily",
  "Convert Word to PDF Online",
  "JPG to PDF Converter: Combine Images",
  "Extract Images with PDF to JPG",
  "Protect PDF with a Password",
  "Unlock PDF When You Forget the Password",
  "Add a Watermark to Your PDF",
  "OCR PDF: Turn Scans into Text",
  "Organize PDF Pages Like a Pro",
  "Crop PDF Pages to Remove Margins",
  "AI PDF Summarizer: Save Reading Time",
  "Delete Pages from a PDF",
  "Add eSignature to PDF Documents",
  "Compare Two PDFs to Spot Differences",
  "Repair a Corrupted PDF File",
  "Redact Sensitive Info in PDFs",
  "Convert Excel to PDF",
  "Convert PDF to Excel for Data",
  "Convert PPT to PDF Presentations",
  "Convert PDF to PowerPoint",
  "Convert HTML to PDF",
  "Convert PDF to PDF/A for Archiving",
  "Convert PDF to Markdown",
  "Translate PDF Documents Online",
  "Build a Resume with PDF Templates",
  "Automate Tasks with PDF Workflows",
  "Top 10 PDF Tips for Students",
  "How Small Businesses Use PDF Tools",
  "PDF Security Best Practices 2026",
  "Reduce PDF Size for Email",
  "Create Fillable PDF Forms",
  "Edit PDF Text Without Adobe",
  "Annotate and Comment on PDFs",
  "Batch Process Multiple PDFs",
  "Extract Text from Scanned PDFs",
  "Combine Screenshots into One PDF",
  "Password Protect Confidential Reports",
  "Flatten PDF for Final Delivery",
  "Number Pages in a PDF",
  "Bookmark Long PDF Documents",
  "Optimize PDFs for Web Viewing",
  "Archive Invoices as Searchable PDFs",
  "Share Large PDFs via Link",
  "Convert Contracts to Editable Word",
  "Make Accessible PDFs for Everyone"
];

function postJSON(path, obj, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(obj);
    const u = new URL(BASE + path);
    const opts = {
      method: "POST",
      hostname: u.hostname,
      path: u.pathname,
      headers: Object.assign({
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }, extraHeaders)
    };
    const req = https.request(opts, res => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function genSlug(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function cleanJSON(raw) {
  let s = String(raw).trim();
  s = s.replace(/```json?/gi, '').replace(/```/g, '').trim();
  const m = s.match(/\{[\s\S]*\}/);
  return m ? m[0] : s;
}

(async () => {
  const cats = ['PDF Tips','Convert PDF','Compress PDF','PDF Security','PDF Editing','Document Management','Productivity','Tutorial'];
  let ok = 0, fail = 0;
  for (let i = 0; i < 3; i++) {
    const title = TITLES[i];
    const slug = genSlug(title);
    try {
      // 1) auto-seo
      const seoRes = await postJSON("/api/bazaarlink/chat", {
        action: "auto-seo", title, keyword: "", model: "deepseek/deepseek-v4-flash:free"
      });
      if (seoRes.status !== 200) { console.log(`SEO FAIL ${i} ${title}: ${seoRes.status}`); fail++; continue; }
      const seoParsed = JSON.parse(cleanJSON(JSON.parse(seoRes.body).result));
      const blog = {
        id: uid(),
        title,
        slug,
        category: cats[i % cats.length],
        featuredImage: "",
        imageAlt: seoParsed.imageAlt || title,
        shortDescription: seoParsed.shortDescription || (title + " - learn everything you need in this complete guide."),
        content: seoParsed.content || "",
        metaTitle: seoParsed.metaTitle || (title + " | DocuPDF Blog"),
        metaDescription: seoParsed.metaDescription || (title + " - complete step-by-step guide with tips and best practices."),
        focusKeyword: seoParsed.focusKeyword || title.toLowerCase(),
        tags: seoParsed.tags && seoParsed.tags.length ? seoParsed.tags : [title.split(' ')[0], "pdf"],
        canonicalUrl: seoParsed.canonicalUrl || (BASE + "/blog/" + slug),
        publishDate: new Date().toISOString().split('T')[0],
        author: "DocuPDF Team",
        faq: seoParsed.faq && seoParsed.faq.length ? seoParsed.faq : [],
        relatedTools: seoParsed.relatedTools && seoParsed.relatedTools.length ? seoParsed.relatedTools : ["Merge PDF"],
        relatedBlogs: [],
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // 2) save to server
      const saveRes = await postJSON("/api/blogs", blog);
      if (saveRes.status === 200) { ok++; console.log(`OK ${i+1}/${TITLES.length} ${slug}`); }
      else { fail++; console.log(`SAVE FAIL ${i} ${slug}: ${saveRes.status} ${saveRes.body}`); }
      // small delay to be polite
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      fail++; console.log(`ERR ${i} ${title}: ${e.message}`);
    }
  }
  console.log(`\nDONE. ok=${ok} fail=${fail}`);
})();

