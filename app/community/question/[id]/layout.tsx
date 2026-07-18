import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Questions - DocuPDF',
  description: 'Browse community questions and answers about PDF processing, conversion, editing, and DocuPDF tools.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://docupdf.com/community' },
};

export default function QuestionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
