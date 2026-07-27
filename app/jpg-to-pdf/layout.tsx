import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';
import RatingWidget from '@/components/RatingWidget';
import { getToolRatings } from '@/lib/ratings';

export const metadata: Metadata = getPageSEO('jpg-to-pdf');

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  const ratingSummary = await getToolRatings('jpg-to-pdf');
  const aggregateRating = ratingSummary.total > 0 ? { ratingValue: ratingSummary.average, ratingCount: ratingSummary.total } : undefined;


  const seo = getPageSEO('jpg-to-pdf');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'JPG to PDF', url: '/jpg-to-pdf' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/jpg-to-pdf', aggregateRating)} />
      {generateToolFAQ('jpg-to-pdf') && <JsonLd data={generateToolFAQ('jpg-to-pdf')!} />}
      {children}
      <RatingWidget toolId="jpg-to-pdf" toolName="jpg-to-pdf" />
      <ToolSEOSection toolId="jpg-to-pdf" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}