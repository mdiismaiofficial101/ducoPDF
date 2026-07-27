import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';
import RatingWidget from '@/components/RatingWidget';

export const metadata: Metadata = getPageSEO('redact');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('redact');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Redact PDF', url: '/redact' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/redact')} />
      {generateToolFAQ('redact') && <JsonLd data={generateToolFAQ('redact')!} />}
      {children}
      <RatingWidget toolId="redact" toolName="redact" />
      <ToolSEOSection toolId="redact" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}