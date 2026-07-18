import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('ocr-editable');

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const seo = getPageSEO('ocr-editable');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'OCR to Editable PDF', url: '/ocr-editable' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/ocr-editable')} />
      {children}
    </>
  );
}
