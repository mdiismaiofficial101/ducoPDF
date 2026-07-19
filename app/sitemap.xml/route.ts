import { NextResponse } from 'next/server';

const SITE_URL = 'https://cybronetwork.online';
const API_BASE = 'https://server.cybronetwork.online/api/v1';

async function fetchDynamicUrls() {
  const urls: Array<{ url: string; lastModified: string; changeFrequency: string; priority: number }> = [];

  try {
    const [categoriesRes, tagsRes, blogRes] = await Promise.allSettled([
      fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/tags`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/blog/posts?limit=100`, { next: { revalidate: 1800 } }),
    ]);

    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
      const data = await categoriesRes.value.json();
      if (data.categories?.length) {
        data.categories.forEach((cat: { slug: string }) => {
          urls.push({
            url: `${SITE_URL}/category/${cat.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      }
    }

    if (tagsRes.status === 'fulfilled' && tagsRes.value.ok) {
      const data = await tagsRes.value.json();
      if (data.tags?.length) {
        data.tags.forEach((tag: { slug: string }) => {
          urls.push({
            url: `${SITE_URL}/tag/${tag.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        });
      }
    }

    if (blogRes.status === 'fulfilled' && blogRes.value.ok) {
      const data = await blogRes.value.json();
      if (data.posts?.length) {
        data.posts.forEach((post: { slug: string; updatedAt?: string; createdAt?: string }) => {
          urls.push({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updatedAt || post.createdAt || new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8,
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