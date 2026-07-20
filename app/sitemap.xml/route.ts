import { NextResponse } from 'next/server';

const SITE_URL = 'https://cybronetwork.online';
const BLOG_API_URL = 'https://img.cybronetwork.online/blogs-api.php';

async function fetchDynamicUrls() {
  const urls: Array<{ url: string; lastModified: string; changeFrequency: string; priority: number }> = [];

  try {
    const blogRes = await fetch(`${BLOG_API_URL}?published=1`, { cache: 'no-store' });
    if (blogRes.ok) {
      const data = await blogRes.json();
      if (Array.isArray(data.blogs)) {
        const cats = new Set<string>();
        data.blogs.forEach((post: { slug: string; updatedAt?: string; createdAt?: string; category?: string }) => {
          if (post.slug) {
            urls.push({
              url: `${SITE_URL}/blog/${post.slug}`,
              lastModified: post.updatedAt || post.createdAt || new Date().toISOString(),
              changeFrequency: 'monthly',
              priority: 0.8,
            });
          }
          if (post.category) cats.add(post.category);
        });
        cats.forEach((cat) => {
          urls.push({
            url: `${SITE_URL}/blog/category/${encodeURIComponent(cat)}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      }
    }
  } catch (error) {
    console.error('Sitemap dynamic fetch error:', error);
  }

  return urls;
}

export async function GET() {
  const staticUrls = [
    { url: SITE_URL, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/merge`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/split`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/compress`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/rotate`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/pdf-to-word`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/word-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/jpg-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/pdf-to-jpg`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/excel-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/ppt-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/html-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/pdf-to-excel`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/pdf-to-ppt`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/pdf-to-pdfa`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/pdf-to-markdown`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/pdf-translator`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/watermark`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/smart-watermark`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/protect`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/unlock`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/password-check`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/organize`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/crop`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/compare`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/ocr`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/ocr-editable`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/repair`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/scan-to-pdf`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/pdf-forms`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/redact`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/esignature`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/page-numbers`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/delete-pages`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/summarizer`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/translate`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/resume-builder`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/workflows`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/templates`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: new Date().toISOString(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date().toISOString(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date().toISOString(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const dynamicUrls = await fetchDynamicUrls();
  const allUrls = [...staticUrls, ...dynamicUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastModified}</lastmod>
    <changefreq>${u.changeFrequency}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}