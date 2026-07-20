import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('html-to-pdf');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('html-to-pdf');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'HTML to PDF', url: '/html-to-pdf' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/html-to-pdf')} />
      {generateToolFAQ('html-to-pdf') && <JsonLd data={generateToolFAQ('html-to-pdf')!} />}
      {children}
      <ToolSEOSection toolId="html-to-pdf" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}