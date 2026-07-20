import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('ocr-editable');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('ocr-editable');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'OCR Editable', url: '/ocr-editable' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/ocr-editable')} />
      {generateToolFAQ('ocr-editable') && <JsonLd data={generateToolFAQ('ocr-editable')!} />}
      {children}
      <ToolSEOSection toolId="ocr-editable" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}