import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('pdf-to-pdfa');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('pdf-to-pdfa');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'PDF to PDF/A', url: '/pdf-to-pdfa' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/pdf-to-pdfa')} />
      {generateToolFAQ('pdf-to-pdfa') && <JsonLd data={generateToolFAQ('pdf-to-pdfa')!} />}
      {children}
      <ToolSEOSection toolId="pdf-to-pdfa" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}