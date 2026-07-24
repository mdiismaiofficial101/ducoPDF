import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const authorName = decodeURIComponent(name);
  return {
    title: `${authorName} - DocuPDF Blog Author`,
    description: `Read articles written by ${authorName} on the DocuPDF blog. Tips, tutorials, and guides for PDF management.`,
    alternates: { canonical: `https://cybronetwork.online/author/${name}` },
    openGraph: {
      title: `${authorName} - DocuPDF Blog Author`,
      description: `Articles by ${authorName} on the DocuPDF blog.`,
      url: `https://cybronetwork.online/author/${name}`,
      siteName: 'DocuPDF',
      locale: 'en_US',
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title: `${authorName} - DocuPDF Blog Author`, description: `Read ${authorName}'s articles on DocuPDF.` },
  };
}

export default async function AuthorLayout({ children, params }: { children: React.ReactNode; params: Promise<{ name: string }> }) {
  const { name } = await params;
  const authorName = decodeURIComponent(name);

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: authorName, url: `/author/${name}` },
      ])} />
      {children}
    </>
  );
}
