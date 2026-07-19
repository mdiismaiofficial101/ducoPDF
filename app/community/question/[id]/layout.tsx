import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Question #${id} - DocuPDF Community`,
    description: 'Ask questions and get answers from the DocuPDF community about PDF tools and techniques.',
    alternates: { canonical: `https://cybronetwork.online/community/question/${id}` },
    robots: { index: true, follow: true },
  };
}

export default function QuestionIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}