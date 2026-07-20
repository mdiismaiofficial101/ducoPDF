import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('pdf-translator');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('pdf-translator');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'PDF Translator', url: '/pdf-translator' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/pdf-translator')} />
      {generateToolFAQ('pdf-translator') && <JsonLd data={generateToolFAQ('pdf-translator')!} />}
      {children}
      <ToolSEOSection toolId="pdf-translator" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}