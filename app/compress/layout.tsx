import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('compress');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('compress');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Compress PDF', url: '/compress' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/compress')} />
      {generateToolFAQ('compress') && <JsonLd data={generateToolFAQ('compress')!} />}
      {children}
      <ToolSEOSection toolId="compress" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}