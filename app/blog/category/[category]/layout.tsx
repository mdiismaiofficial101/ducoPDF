import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  return {
    title: `${cat} - DocuPDF Blog`,
    description: `Read our collection of ${cat.toLowerCase()} articles. Expert tips, tutorials, and guides about ${cat.toLowerCase()} for PDF management.`,
    alternates: { canonical: `https://cybronetwork.online/blog/category/${category}` },
    openGraph: {
      title: `${cat} - DocuPDF Blog`,
      description: `Expert ${cat.toLowerCase()} articles, tips, and tutorials.`,
      url: `https://cybronetwork.online/blog/category/${category}`,
      siteName: 'DocuPDF',
      locale: 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${cat} - DocuPDF Blog`, description: `Read our ${cat.toLowerCase()} articles.` },
  };
}

export default async function CategoryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = decodeURIComponent(category);

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: cat, url: `/blog/category/${category}` },
      ])} />
      {children}
    </>
  );
}
