import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

const BLOG_API_URL = 'https://img.cybronetwork.online/blogs-api.php';

async function getBlogBySlug(slug: string) {
  try {
    const res = await fetch(`${BLOG_API_URL}?published=1`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.blogs)) return null;
    return data.blogs.find((b: any) => b.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
      description: 'The blog post you are looking for does not exist.',
      robots: { index: false, follow: true },
    };
  }

  const title = blog.metaTitle || `${blog.title} | DocuPDF Blog`;
  const description = blog.metaDescription || blog.shortDescription || `Read about ${blog.title} on the DocuPDF blog.`;
  const url = `https://cybronetwork.online/blog/${blog.slug}`;

  return {
    title,
    description,
    keywords: blog.tags?.join(', ') || blog.focusKeyword || '',
    alternates: { canonical: blog.canonicalUrl || url },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description,
      url,
      siteName: 'DocuPDF',
      locale: 'en_US',
      type: 'article',
      publishedTime: blog.publishDate || blog.createdAt,
      modifiedTime: blog.updatedAt || blog.createdAt,
      authors: [blog.author || 'DocuPDF'],
      images: blog.featuredImage
        ? [{ url: blog.featuredImage, width: 1200, height: 630, alt: blog.imageAlt || blog.title }]
        : [{ url: 'https://cybronetwork.online/myicon.png', width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description,
      images: blog.featuredImage ? [blog.featuredImage] : ['https://cybronetwork.online/myicon.png'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: blog?.title || 'Blog Post', url: `/blog/${slug}` },
      ])} />
      {blog?.faq && blog.faq.length > 0 && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: blog.faq.map((faq: { question: string; answer: string }) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }} />
      )}
      {children}
    </>
  );
}
