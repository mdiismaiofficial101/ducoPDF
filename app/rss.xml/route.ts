import { getPublishedBlogs, calculateReadingTime } from '@/lib/blog';

export const dynamic = 'force-static';

export async function GET() {
  const siteUrl = 'https://docupdf.com';
  const blogs = getPublishedBlogs();

  const items = blogs.map(blog => `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${siteUrl}/blog/${blog.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${blog.slug}</guid>
      <description><![CDATA[${blog.shortDescription}]]></description>
      <category>${blog.category}</category>
      <pubDate>${new Date(blog.publishDate).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${blog.author}]]></dc:creator>
      <content:encoded><![CDATA[${blog.content}]]></content:encoded>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DocuPDF Blog</title>
    <link>${siteUrl}/blog</link>
    <description>PDF tips, tutorials, and guides to help you work smarter with documents.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
