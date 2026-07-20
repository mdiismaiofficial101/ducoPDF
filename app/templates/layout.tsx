import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('templates');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('templates');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'PDF Templates', url: '/templates' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/templates')} />
      {generateToolFAQ('templates') && <JsonLd data={generateToolFAQ('templates')!} />}
      {children}
      <ToolSEOSection toolId="templates" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}