import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';
import RatingWidget from '@/components/RatingWidget';
import { getToolRatings } from '@/lib/ratings';

export const metadata: Metadata = getPageSEO('watermark');

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  const ratingSummary = await getToolRatings('watermark');
  const aggregateRating = ratingSummary.total > 0 ? { ratingValue: ratingSummary.average, ratingCount: ratingSummary.total } : undefined;


  const seo = getPageSEO('watermark');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Watermark PDF', url: '/watermark' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/watermark', aggregateRating)} />
      {generateToolFAQ('watermark') && <JsonLd data={generateToolFAQ('watermark')!} />}
      {children}
      <RatingWidget toolId="watermark" toolName="watermark" />
      <ToolSEOSection toolId="watermark" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}