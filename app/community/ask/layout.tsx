import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask a Question - DocuPDF Community',
  description: 'Ask a question about PDFs, document processing, or DocuPDF tools. Get answers from the DocuPDF community and experts.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://cybronetwork.online/community/ask' },
  openGraph: {
    title: 'Ask a Question - DocuPDF Community',
    description: 'Ask a question about PDFs, document processing, or DocuPDF tools. Get answers from the community.',
    url: 'https://cybronetwork.online/community/ask',
    siteName: 'DocuPDF',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask a Question - DocuPDF Community',
    description: 'Ask a question about PDFs, document processing, or DocuPDF tools.',
  },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
