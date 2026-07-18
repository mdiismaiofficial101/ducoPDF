'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const TOOL_ROUTES = new Set([
  'ocr', 'merge', 'split', 'compress', 'rotate', 'watermark', 'protect', 'unlock',
  'pdf-to-word', 'word-to-pdf', 'jpg-to-pdf', 'pdf-to-jpg', 'pdf-to-excel', 'excel-to-pdf',
  'pdf-to-ppt', 'ppt-to-pdf', 'pdf-to-markdown', 'pdf-to-pdfa', 'pdf-translator', 'html-to-pdf',
  'organize', 'delete-pages', 'page-numbers', 'crop', 'repair', 'redact', 'esignature',
  'compare', 'scan-to-pdf', 'pdf-forms', 'translate', 'summarizer', 'ocr-editable',
  'smart-watermark', 'password-check', 'resume-builder', 'workflows', 'templates',
]);

export default function ShowFooter() {
  const pathname = usePathname();
  const firstSegment = pathname.split('/')[1];

  if (TOOL_ROUTES.has(firstSegment) || firstSegment === 'tool') return null;

  return <Footer />;
}
