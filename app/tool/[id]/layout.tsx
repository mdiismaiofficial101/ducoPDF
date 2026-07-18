import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Tool #${id} - DocuPDF`,
    description: 'Use our free online PDF tool to process your documents instantly. 100% secure, client-side processing.',
    alternates: { canonical: `https://docupdf.com/tool/${id}` },
    robots: { index: true, follow: true },
  };
}

export default function ToolIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
