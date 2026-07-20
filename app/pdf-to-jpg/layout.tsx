import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('pdf-to-jpg');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('pdf-to-jpg');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'PDF to JPG', url: '/pdf-to-jpg' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/pdf-to-jpg')} />
      {generateToolFAQ('pdf-to-jpg') && <JsonLd data={generateToolFAQ('pdf-to-jpg')!} />}
      {children}
      <ToolSEOSection toolId="pdf-to-jpg" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}