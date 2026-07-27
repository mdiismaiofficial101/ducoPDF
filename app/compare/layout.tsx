import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';
import RatingWidget from '@/components/RatingWidget';
import { getToolRatings } from '@/lib/ratings';

export const metadata: Metadata = getPageSEO('compare');

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  const ratingSummary = await getToolRatings('compare');
  const aggregateRating = ratingSummary.total > 0 ? { ratingValue: ratingSummary.average, ratingCount: ratingSummary.total } : undefined;


  const seo = getPageSEO('compare');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Compare PDF', url: '/compare' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/compare', aggregateRating)} />
      {generateToolFAQ('compare') && <JsonLd data={generateToolFAQ('compare')!} />}
      {children}
      <RatingWidget toolId="compare" toolName="compare" />
      <ToolSEOSection toolId="compare" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}