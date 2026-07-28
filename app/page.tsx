import JsonLd from '@/components/JsonLd';
import HomeContent from '@/components/HomeContent';

const tools = [
  { name: 'PDF to WORD Converter', href: '/pdf-to-word' },
  { name: 'Merge PDF files', href: '/merge' },
  { name: 'Split PDF file', href: '/split' },
  { name: 'Compress PDF files', href: '/compress' },
  { name: 'Convert PDF to POWERPOINT', href: '/pdf-to-ppt' },
  { name: 'Convert PDF to EXCEL', href: '/pdf-to-excel' },
  { name: 'Convert POWERPOINT to PDF', href: '/ppt-to-pdf' },
  { name: 'Convert EXCEL to PDF', href: '/excel-to-pdf' },
  { name: 'PDF to JPG', href: '/pdf-to-jpg' },
  { name: 'JPG to PDF', href: '/jpg-to-pdf' },
  { name: 'eSign PDF for Free', href: '/esignature' },
  { name: 'Add watermark into a PDF', href: '/watermark' },
  { name: 'Convert HTML to PDF', href: '/html-to-pdf' },
  { name: 'Unlock PDF', href: '/unlock' },
  { name: 'Password Protect PDF', href: '/protect' },
  { name: 'PDF to PDF/A', href: '/pdf-to-pdfa' },
  { name: 'Repair PDF file', href: '/repair' },
  { name: 'PDF OCR', href: '/ocr' },
  { name: 'Compare PDF', href: '/compare' },
  { name: 'Rotate PDF', href: '/rotate' },
  { name: 'Organize PDF', href: '/organize' },
  { name: 'Delete Pages', href: '/delete-pages' },
  { name: 'Add PDF page numbers', href: '/page-numbers' },
  { name: 'Crop PDF', href: '/crop' },
  { name: 'Redact PDF', href: '/redact' },
  { name: 'PDF Forms', href: '/pdf-forms' },
  { name: 'Smart Watermark', href: '/smart-watermark' },
  { name: 'PDF Summarizer', href: '/summarizer' },
  { name: 'Translate PDF', href: '/translate' },
  { name: 'Convert PDF to Markdown', href: '/pdf-to-markdown' },
  { name: 'Scan to PDF', href: '/scan-to-pdf' },
  { name: 'OCR to Editable PDF', href: '/ocr-editable' },
  { name: 'PDF Translator', href: '/pdf-translator' },
  { name: 'Password Checker', href: '/password-check' },
  { name: 'Word to PDF', href: '/word-to-pdf' },
  { name: 'Workflows', href: '/workflows' },
  { name: 'Template Library', href: '/templates' },
  { name: 'Resume Builder', href: '/resume-builder' },
];

export default function Home() {
  return (
    <div className="w-full">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: tools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: tool.name,
            url: `https://cybronetwork.online${tool.href}`,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web Browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cybronetwork.online' },
        ],
      }} />
      <HomeContent />
    </div>
  );
}
