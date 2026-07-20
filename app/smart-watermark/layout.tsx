import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('smart-watermark');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('smart-watermark');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Smart Watermark', url: '/smart-watermark' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/smart-watermark')} />
      {generateToolFAQ('smart-watermark') && <JsonLd data={generateToolFAQ('smart-watermark')!} />}
      {children}
      <ToolSEOSection toolId="smart-watermark" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}