import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('word-to-pdf');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('word-to-pdf');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Word to PDF', url: '/word-to-pdf' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/word-to-pdf')} />
      {generateToolFAQ('word-to-pdf') && <JsonLd data={generateToolFAQ('word-to-pdf')!} />}
      {children}
    </>
  );
}
