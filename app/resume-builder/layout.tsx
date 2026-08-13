import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ToolSEOSection from '@/components/ToolSEOSection';
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, generateToolFAQ } from '@/lib/seo';
import RatingWidget from '@/components/RatingWidget';
import { getToolRatings } from '@/lib/ratings';

export const metadata: Metadata = getPageSEO('resume');

export default async function ToolLayout({ children }: { children: React.ReactNode }) {
  const ratingSummary = await getToolRatings('resume-builder');
  const aggregateRating = ratingSummary.total > 0 ? { ratingValue: ratingSummary.average, ratingCount: ratingSummary.total } : undefined;


  const seo = getPageSEO('resume');
  const toolName = typeof seo.title === 'string' ? seo.title.split(' - ')[0].split(' | ')[0] : '';
  return (
    <>
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resume Builder', url: '/resume-builder' },
      ])} />
      <JsonLd data={generateSoftwareApplicationSchema(toolName, typeof seo.description === 'string' ? seo.description : '', '/resume-builder', aggregateRating)} />
      {generateToolFAQ('resume-builder') && <JsonLd data={generateToolFAQ('resume-builder')!} />}
      {children}
      <RatingWidget toolId="resume-builder" toolName="resume-builder" />
      <ToolSEOSection toolId="resume-builder" toolTitle={toolName} toolDescription={typeof seo.description === 'string' ? seo.description : ''} />
    </>
  );
}