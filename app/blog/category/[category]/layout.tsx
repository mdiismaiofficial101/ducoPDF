import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  return {
    title: `${cat} - DocuPDF Blog`,
    description: `Read our collection of ${cat.toLowerCase()} articles. Expert tips, tutorials, and guides about ${cat.toLowerCase()} for PDF management.`,
    alternates: { canonical: `https://docupdf.com/blog/category/${category}` },
    openGraph: {
      title: `${cat} - DocuPDF Blog`,
      description: `Expert ${cat.toLowerCase()} articles, tips, and tutorials.`,
      url: `https://docupdf.com/blog/category/${category}`,
      siteName: 'DocuPDF',
      locale: 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${cat} - DocuPDF Blog`, description: `Read our ${cat.toLowerCase()} articles.` },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
