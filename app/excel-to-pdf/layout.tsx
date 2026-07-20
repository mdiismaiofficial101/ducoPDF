import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('excel-to-pdf');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('excel-to-pdf');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Excel to PDF', url: '/excel-to-pdf' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/excel-to-pdf')} />
      {generateToolFAQ('excel-to-pdf') && <JsonLd data={generateToolFAQ('excel-to-pdf')!} />}
      {children}
      <ToolSEOSection toolId="excel-to-pdf" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}