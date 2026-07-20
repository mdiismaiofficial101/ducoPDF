import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('merge');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('merge');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Merge PDF', url: '/merge' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/merge')} />
      {generateToolFAQ('merge') && <JsonLd data={generateToolFAQ('merge')!} />}
      {children}
      <ToolSEOSection toolId="merge" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}