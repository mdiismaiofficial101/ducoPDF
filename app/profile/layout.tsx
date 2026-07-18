import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('profile');

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Profile', url: '/profile' },
      ])} />
      {children}
    </>
  );
}
