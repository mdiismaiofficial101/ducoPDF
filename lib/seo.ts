import type { Metadata } from 'next';
import { toolFAQs as toolFAQData } from '@/lib/tool-seo-data';

const SITE_URL = 'https://cybronetwork.online';
const SITE_NAME = 'DocuPDF';
const DEFAULT_OG_IMAGE = `${SITE_URL}/myicon.png`;

export interface PageSEO {
  title: string;
  description: string;
  canonical?: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  type?: 'website' | 'article';
}

function buildMetadata(page: PageSEO): Metadata {
  const url = `${SITE_URL}${page.path}`;
  const canonical = page.canonical || url;
  const ogImage = page.ogImage || DEFAULT_OG_IMAGE;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', '),
    robots: {
      index: page.noindex !== true,
      follow: page.nofollow !== true,
      googleBot: {
        index: page.noindex !== true,
        follow: page.nofollow !== true,
      },
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: page.type || 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [ogImage],
    },
  };
}

export const siteSEO: Record<string, PageSEO> = {
  home: {
    title: 'DocuPDF - Free Online PDF Tools | Merge, Split, Compress & Convert PDF',
    description: 'DocuPDF offers 30+ free online PDF tools. Merge, split, compress, convert, rotate, watermark, protect and edit PDFs instantly in your browser. 100% secure, no uploads.',
    path: '/',
    keywords: ['pdf tools', 'online pdf editor', 'merge pdf', 'split pdf', 'compress pdf', 'free pdf tools', 'pdf converter', 'edit pdf online', 'pdf merger', 'pdf splitter'],
  },
  merge: {
    title: 'Merge PDF Files Online - Free PDF Merger Tool | DocuPDF',
    description: 'Merge multiple PDF files into one document instantly. Free online PDF merger with drag-and-drop reordering. No file size limit, no watermarks, 100% private.',
    path: '/merge',
    keywords: ['merge pdf', 'combine pdf', 'pdf merger', 'merge pdf files', 'join pdf', 'pdf combine online free', 'merge multiple pdf'],
  },
  split: {
    title: 'Split PDF Online - Extract Pages from PDF | DocuPDF',
    description: 'Split PDF files into separate documents. Extract specific pages or split by range from any PDF. Free, fast, and secure PDF splitting tool.',
    path: '/split',
    keywords: ['split pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages', 'split pdf online free', 'cut pdf', 'divide pdf'],
  },
  compress: {
    title: 'Compress PDF Online - Reduce PDF File Size | DocuPDF',
    description: 'Reduce PDF file size without losing quality. Free online PDF compressor that optimizes documents for faster sharing and storage. Instant results.',
    path: '/compress',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'optimize pdf', 'pdf size reducer online free', 'make pdf smaller'],
  },
  rotate: {
    title: 'Rotate PDF Pages Online - Free PDF Rotation Tool | DocuPDF',
    description: 'Rotate PDF pages to any angle. Fix page orientation instantly with our free online PDF rotator. Support 90°, 180°, 270° rotations.',
    path: '/rotate',
    keywords: ['rotate pdf', 'pdf rotator', 'rotate pdf pages', 'change pdf orientation', 'rotate pdf online free', 'flip pdf'],
  },
  'pdf-to-word': {
    title: 'PDF to Word Converter - Free Online PDF to DOC/DOCX | DocuPDF',
    description: 'Convert PDF to editable Word documents instantly. Free PDF to DOCX converter preserves formatting, fonts, and layouts. No registration required.',
    path: '/pdf-to-word',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to document', 'pdf to text editor', 'pdf to word converter free online'],
  },
  'word-to-pdf': {
    title: 'Word to PDF Converter - Free Online DOC/DOCX to PDF | DocuPDF',
    description: 'Convert Word documents to PDF in seconds. Free DOCX to PDF converter maintains formatting and layout. Works with all Word versions.',
    path: '/word-to-pdf',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'word to pdf converter free online', 'microsoft word to pdf'],
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF Converter - Free Image to PDF Tool | DocuPDF',
    description: 'Convert JPG, PNG, and other images to PDF instantly. Free online image to PDF converter with adjustable orientation, margins, and page size.',
    path: '/jpg-to-pdf',
    keywords: ['jpg to pdf', 'image to pdf', 'png to pdf', 'convert image to pdf', 'photo to pdf', 'jpg to pdf converter free online'],
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG Converter - Extract Images from PDF | DocuPDF',
    description: 'Convert PDF pages to high-quality JPG images. Free online PDF to image extractor preserves resolution and quality. Download individual or all pages.',
    path: '/pdf-to-jpg',
    keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpeg', 'pdf to png', 'extract images from pdf', 'pdf to jpg converter free online'],
  },
  'excel-to-pdf': {
    title: 'Excel to PDF Converter - Free XLS/XLSX to PDF | DocuPDF',
    description: 'Convert Excel spreadsheets to PDF documents. Free online XLS to PDF converter preserves tables, charts, and formatting perfectly.',
    path: '/excel-to-pdf',
    keywords: ['excel to pdf', 'xlsx to pdf', 'xls to pdf', 'spreadsheet to pdf', 'convert excel to pdf free online'],
  },
  'ppt-to-pdf': {
    title: 'PowerPoint to PDF Converter - Free PPT/PPTX to PDF | DocuPDF',
    description: 'Convert PowerPoint presentations to PDF. Free online PPT to PDF converter preserves slides, animations, and layout. Works with all PPT versions.',
    path: '/ppt-to-pdf',
    keywords: ['ppt to pdf', 'powerpoint to pdf', 'pptx to pdf', 'presentation to pdf', 'convert powerpoint to pdf free online'],
  },
  'html-to-pdf': {
    title: 'HTML to PDF Converter - Webpage to PDF Tool | DocuPDF',
    description: 'Convert any webpage or HTML code to PDF. Free online HTML to PDF converter captures web content perfectly. Just paste a URL or HTML code.',
    path: '/html-to-pdf',
    keywords: ['html to pdf', 'webpage to pdf', 'convert html to pdf', 'website to pdf', 'save webpage as pdf', 'url to pdf'],
  },
  'pdf-to-excel': {
    title: 'PDF to Excel Converter - Extract Tables from PDF | DocuPDF',
    description: 'Extract data from PDF into editable Excel spreadsheets. Free online PDF to XLSX converter recognizes tables and text. Instant conversion.',
    path: '/pdf-to-excel',
    keywords: ['pdf to excel', 'pdf to xlsx', 'extract tables from pdf', 'pdf to spreadsheet', 'convert pdf to excel free online'],
  },
  'pdf-to-ppt': {
    title: 'PDF to PowerPoint Converter - Free PDF to PPT/PPTX | DocuPDF',
    description: 'Convert PDF presentations to editable PowerPoint slides. Free online PDF to PPT converter preserves layout, images, and formatting.',
    path: '/pdf-to-ppt',
    keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx', 'convert pdf to presentation', 'pdf to powerpoint converter free online'],
  },
  'pdf-to-pdfa': {
    title: 'PDF to PDF/A Converter - Long-Term Archiving Format | DocuPDF',
    description: 'Convert PDF to PDF/A, the ISO-standardized format for long-term document archiving. Free online PDF/A converter ensures compliance and durability.',
    path: '/pdf-to-pdfa',
    keywords: ['pdf to pdfa', 'pdfa converter', 'pdf to pdf/a', 'pdf archiving format', 'iso 19005', 'pdf to pdfa converter free'],
  },
  'pdf-to-markdown': {
    title: 'PDF to Markdown Converter - Extract Text to MD Format | DocuPDF',
    description: 'Convert PDF documents to Markdown format for developers. Free online PDF to MD converter extracts text, headings, and structure.',
    path: '/pdf-to-markdown',
    keywords: ['pdf to markdown', 'pdf to md', 'convert pdf to markdown', 'pdf to text', 'extract text from pdf'],
  },
  'pdf-translator': {
    title: 'PDF Translator - Translate PDF Documents with AI | DocuPDF',
    description: 'Translate entire PDF documents into multiple languages while preserving layout. AI-powered PDF translator supports 50+ languages. Free and instant.',
    path: '/pdf-translator',
    keywords: ['translate pdf', 'pdf translator', 'translate pdf document', 'pdf translation', 'ai pdf translate', 'translate pdf to spanish'],
  },
  watermark: {
    title: 'Add Watermark to PDF - Free PDF Watermark Tool | DocuPDF',
    description: 'Add text or image watermarks to your PDF documents. Free online PDF watermark tool with customizable font, size, color, transparency and position.',
    path: '/watermark',
    keywords: ['add watermark to pdf', 'pdf watermark', 'watermark pdf', 'stamp pdf', 'pdf watermark free online', 'add text watermark pdf'],
  },
  'smart-watermark': {
    title: 'Smart Watermark PDF - Advanced Watermark Tool | DocuPDF',
    description: 'Add professional text or logo watermarks with opacity, rotation, position, and multi-page support. Advanced PDF watermarking tool for batch processing.',
    path: '/smart-watermark',
    keywords: ['smart watermark pdf', 'advanced pdf watermark', 'logo watermark pdf', 'batch watermark pdf', 'professional pdf watermark'],
  },
  protect: {
    title: 'Protect PDF with Password - Free PDF Encryption | DocuPDF',
    description: 'Encrypt your PDF with a password to keep sensitive data confidential. Free online PDF password protection with 256-bit AES encryption.',
    path: '/protect',
    keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf', 'pdf password', 'pdf encryption', 'lock pdf', 'protect pdf with password free'],
  },
  unlock: {
    title: 'Unlock PDF - Remove PDF Password Protection | DocuPDF',
    description: 'Remove PDF password security restrictions. Free online PDF unlocker gives you full access to your protected PDF documents instantly.',
    path: '/unlock',
    keywords: ['unlock pdf', 'remove pdf password', 'pdf unlocker', 'decrypt pdf', 'open password protected pdf', 'unlock pdf free online'],
  },
  'password-check': {
    title: 'PDF Password Checker - Analyze PDF Security | DocuPDF',
    description: 'Check PDF password strength with cracking time estimates and improvement tips. Free online PDF security analyzer tool.',
    path: '/password-check',
    keywords: ['pdf password checker', 'pdf security check', 'password strength analyzer', 'pdf password audit', 'check pdf security'],
  },
  organize: {
    title: 'Organize PDF Pages - Reorder, Sort & Manage PDF | DocuPDF',
    description: 'Sort, add, and delete PDF pages with drag-and-drop. Free online PDF organizer lets you rearrange pages easily. Visual page thumbnail preview.',
    path: '/organize',
    keywords: ['organize pdf', 'reorder pdf pages', 'sort pdf pages', 'pdf page organizer', 'arrange pdf pages', 'manage pdf pages'],
  },
  crop: {
    title: 'Crop PDF Pages - Trim & Resize PDF | DocuPDF',
    description: 'Trim PDF margins, change page size, and crop PDF documents precisely. Free online PDF crop tool with visual page preview and custom dimensions.',
    path: '/crop',
    keywords: ['crop pdf', 'trim pdf', 'pdf crop tool', 'resize pdf page', 'cut pdf margins', 'crop pdf online free'],
  },
  compare: {
    title: 'Compare PDF Documents - Find Differences | DocuPDF',
    description: 'Compare two PDF documents side-by-side to spot differences. Free online PDF comparison tool highlights changes in text, formatting, and layout.',
    path: '/compare',
    keywords: ['compare pdf', 'pdf diff', 'compare pdf documents', 'pdf comparison tool', 'find differences in pdf', 'pdf compare online free'],
  },
  ocr: {
    title: 'OCR PDF - Make Scanned PDF Searchable | DocuPDF',
    description: 'Make scanned PDFs searchable and selectable with OCR technology. Free online PDF OCR tool converts image-based text into searchable content.',
    path: '/ocr',
    keywords: ['ocr pdf', 'scan pdf to text', 'pdf optical character recognition', 'make pdf searchable', 'ocr pdf free online', 'text recognition pdf'],
  },
  'ocr-editable': {
    title: 'OCR to Editable PDF - Convert Scans to Editable Text | DocuPDF',
    description: 'Convert scanned PDFs into searchable, selectable, and editable text PDF documents. Free online OCR to editable PDF conversion tool.',
    path: '/ocr-editable',
    keywords: ['ocr editable pdf', 'scan to editable pdf', 'convert scan to text', 'ocr pdf editable', 'make scanned pdf editable'],
  },
  repair: {
    title: 'Repair PDF - Fix Corrupted PDF Files | DocuPDF',
    description: 'Repair damaged and corrupted PDF files instantly. Free online PDF repair tool recovers data from broken PDFs and fixes structural issues.',
    path: '/repair',
    keywords: ['repair pdf', 'fix corrupted pdf', 'recover pdf', 'pdf repair tool', 'fix damaged pdf', 'restore pdf', 'repair pdf free online'],
  },
  'scan-to-pdf': {
    title: 'Scan to PDF - Mobile Document Scanner | DocuPDF',
    description: 'Capture document scans from your mobile device and convert them to PDF instantly. Free online scan to PDF tool with auto-crop and enhancement.',
    path: '/scan-to-pdf',
    keywords: ['scan to pdf', 'document scanner', 'mobile scan pdf', 'scan document to pdf', 'pdf scanner free online'],
  },
  'pdf-forms': {
    title: 'PDF Forms - Create & Fill PDF Forms Online | DocuPDF',
    description: 'Create fillable PDF forms or fill existing ones online. Free PDF form builder with text fields, checkboxes, dropdowns, and signature fields.',
    path: '/pdf-forms',
    keywords: ['pdf forms', 'fill pdf form', 'create pdf form', 'fillable pdf', 'pdf form builder', 'edit pdf form online free'],
  },
  redact: {
    title: 'Redact PDF - Remove Sensitive Information | DocuPDF',
    description: 'Permanently remove sensitive or hidden data from PDF documents. Free online PDF redaction tool ensures confidential information is fully erased.',
    path: '/redact',
    keywords: ['redact pdf', 'remove sensitive data pdf', 'pdf redaction', 'black out pdf', 'censor pdf', 'redact pdf free online'],
  },
  esignature: {
    title: 'eSignature - Sign PDF Documents Online | DocuPDF',
    description: 'Add electronic signatures to PDF documents. Free online e-signature tool for signing yourself or requesting signatures from others.',
    path: '/esignature',
    keywords: ['esignature', 'electronic signature pdf', 'sign pdf', 'digital signature', 'e-sign pdf', 'pdf signature free online'],
  },
  'page-numbers': {
    title: 'Add Page Numbers to PDF - Free PDF Page Number Tool | DocuPDF',
    description: 'Add page numbers to PDF documents with custom position, font, size, and format. Free online PDF page numbering tool. Supports Roman numerals.',
    path: '/page-numbers',
    keywords: ['add page numbers to pdf', 'pdf page numbers', 'number pdf pages', 'pdf page numbering', 'add page numbers free online'],
  },
  'delete-pages': {
    title: 'Delete PDF Pages - Remove Pages from PDF | DocuPDF',
    description: 'Remove unwanted pages from PDF documents instantly. Free online PDF page deletion tool with visual page selection and preview.',
    path: '/delete-pages',
    keywords: ['delete pdf pages', 'remove pages from pdf', 'pdf page remover', 'cut pages from pdf', 'delete pages from pdf free online'],
  },
  summarizer: {
    title: 'AI PDF Summarizer - Summarize PDF with AI | DocuPDF',
    description: 'Get instant summaries of PDF documents using advanced AI. Free AI PDF summarizer extracts key points, generates bullet points, and creates study questions.',
    path: '/summarizer',
    keywords: ['pdf summarizer', 'ai summarize pdf', 'summarize pdf', 'pdf summary tool', 'ai pdf summary', 'auto summarize document'],
  },
  translate: {
    title: 'Translate PDF with AI - Multi-Language PDF Translation | DocuPDF',
    description: 'Translate your PDF documents into any language using AI technology. Free online PDF translator preserves original formatting and layout.',
    path: '/translate',
    keywords: ['translate pdf', 'ai pdf translation', 'pdf translate to spanish', 'translate pdf document', 'multi language pdf'],
  },
  resume: {
    title: 'Resume Builder - Create Professional CV Online | DocuPDF',
    description: 'Build professional resumes and CVs with modern templates. Free online resume builder with live preview and PDF export. Stand out from the crowd.',
    path: '/resume-builder',
    keywords: ['resume builder', 'cv maker', 'create resume online', 'resume template', 'free resume builder', 'professional cv'],
  },
  workflows: {
    title: 'PDF Workflows - Automate PDF Processing Chains | DocuPDF',
    description: 'Create automated PDF processing workflows. Chain multiple PDF tools together for batch processing. Free workflow automation for PDF tasks.',
    path: '/workflows',
    keywords: ['pdf workflow', 'pdf automation', 'batch pdf processing', 'pdf workflow builder', 'automate pdf tasks'],
  },
  templates: {
    title: 'PDF Templates - Professional Document Templates | DocuPDF',
    description: 'Browse and download professional PDF templates for resumes, invoices, agreements, and more. Free collection of high-quality document templates.',
    path: '/templates',
    keywords: ['pdf templates', 'document templates', 'free pdf templates', 'invoice template', 'resume template pdf', 'agreement template'],
  },
  community: {
    title: 'Community Q&A - PDF Help & Support Forum | DocuPDF',
    description: 'Ask questions, share knowledge, and get help from the DocuPDF community. Find answers to PDF processing questions and share tips.',
    path: '/community',
    keywords: ['pdf help', 'pdf support', 'pdf community', 'pdf questions answers', 'pdf forum', 'pdf tips'],
  },
  login: {
    title: 'Sign In - DocuPDF Account Login',
    description: 'Sign in to your DocuPDF account to access your dashboard, processing history, and developer API keys. Secure authentication.',
    path: '/login',
    keywords: ['docupdf login', 'sign in docupdf', 'pdf tool login', 'account login'],
    noindex: true,
  },
  signup: {
    title: 'Create Free Account - DocuPDF Registration',
    description: 'Create a free DocuPDF account to unlock premium PDF tools, processing history, and developer API access. Instant setup.',
    path: '/signup',
    keywords: ['docupdf signup', 'create account', 'register docupdf', 'free pdf account'],
    noindex: true,
  },
  'forgot-password': {
    title: 'Reset Password - DocuPDF Account Recovery',
    description: 'Reset your DocuPDF account password. Enter your email to receive secure password reset instructions.',
    path: '/forgot-password',
    noindex: true,
  },
  dashboard: {
    title: 'Dashboard - DocuPDF Workspace',
    description: 'Access your DocuPDF workspace dashboard. View processing history, manage API keys, and launch PDF tools.',
    path: '/dashboard',
    noindex: true,
  },
  profile: {
    title: 'My Profile - DocuPDF Account',
    description: 'View and manage your DocuPDF profile information and account settings.',
    path: '/profile',
    noindex: true,
  },
  settings: {
    title: 'Account Settings - DocuPDF',
    description: 'Manage your DocuPDF account settings, preferences, and security options.',
    path: '/settings',
    noindex: true,
  },
  blog: {
    title: 'DocuPDF Blog - PDF Tips, Tutorials & Guides',
    description: 'Explore the DocuPDF blog for expert tips, step-by-step tutorials, and guides on PDF compression, conversion, editing, security, and document management.',
    path: '/blog',
    keywords: ['pdf blog', 'pdf tips', 'pdf tutorials', 'compress pdf guide', 'pdf editing tips', 'document management'],
    ogImage: DEFAULT_OG_IMAGE,
  },
  privacy: {
    title: 'Privacy Policy - DocuPDF Data Protection',
    description: 'DocuPDF Privacy Policy - How we handle your data, files, and personal information. Learn about our client-side processing and zero-upload approach.',
    path: '/privacy',
    keywords: ['privacy policy', 'data protection', 'docupdf privacy', 'pdf tool privacy', 'file security'],
  },
  terms: {
    title: 'Terms of Service - DocuPDF Usage Agreement',
    description: 'DocuPDF Terms of Service - Read our usage agreement, acceptable use policy, and service terms for using our free online PDF tools.',
    path: '/terms',
    keywords: ['terms of service', 'usage agreement', 'docupdf terms', 'service terms'],
  },
};

export function getPageSEO(pageKey: string): Metadata {
  const page = siteSEO[pageKey];
  if (!page) {
    return {
      title: `${SITE_NAME} - Online PDF Tools`,
      description: 'Free online PDF tools for every document need.',
    };
  }
  return buildMetadata(page);
}

export function getToolPagesSEO(): Metadata[] {
  return Object.values(siteSEO).map(buildMetadata);
}

export const SITE_CONFIG = {
  url: SITE_URL,
  name: SITE_NAME,
  logo: `${SITE_URL}/myicon.png`,
  ogImage: DEFAULT_OG_IMAGE,
};

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_CONFIG.logo,
    description: 'Free online PDF tools for merging, splitting, compressing, converting, and editing PDF documents.',
    sameAs: [
      'https://t.me/cybrotechnology',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'cybrotechnology1@gmail.com',
      contactType: 'customer support',
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Every tool you need to work with PDFs in one place. Free online PDF tools for merging, splitting, compressing, converting, and editing.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareApplicationSchema(toolName: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${toolName} - ${SITE_NAME}`,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export const toolFAQs = toolFAQData;

export function generateToolFAQ(toolId: string) {
  const faqs = toolFAQData[toolId];
  if (!faqs) return null;
  return generateFAQSchema(faqs);
}
