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
    title: 'Merge PDF files',
    description: 'Combine multiple PDF files into one document in the order you want with the easiest free online PDF merger. No signup required.',
    path: '/merge',
    keywords: ['merge pdf', 'combine pdf', 'pdf merger', 'merge pdf files', 'join pdf', 'pdf combine online free', 'merge multiple pdf'],
  },
  split: {
    title: 'Split PDF file',
    description: 'Separate one page or a whole set of pages from a PDF for easy conversion into independent PDF files. Free online PDF splitter.',
    path: '/split',
    keywords: ['split pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages', 'split pdf online free', 'cut pdf', 'divide pdf'],
  },
  compress: {
    title: 'Compress PDF files',
    description: 'Reduce your PDF file size while optimizing for maximal quality. Shrink PDFs for email, web, or storage with our free online compressor.',
    path: '/compress',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'optimize pdf', 'pdf size reducer online free', 'make pdf smaller'],
  },
  rotate: {
    title: 'Rotate PDF',
    description: 'Rotate your PDF pages the way you need them. Fix upside-down or sideways documents. Rotate multiple PDFs at once for free online.',
    path: '/rotate',
    keywords: ['rotate pdf', 'pdf rotator', 'rotate pdf pages', 'change pdf orientation', 'rotate pdf online free', 'flip pdf'],
  },
  'pdf-to-word': {
    title: 'PDF to WORD Converter',
    description: 'Convert your PDF to editable WORD documents with incredible accuracy. Preserve formatting, fonts, and layouts. Free online converter.',
    path: '/pdf-to-word',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to document', 'pdf to text editor', 'pdf to word converter free online'],
  },
  'word-to-pdf': {
    title: 'Word to PDF',
    description: 'Make DOC and DOCX files easy to read and share by converting them to PDF. Preserve formatting perfectly. Free online Word to PDF converter.',
    path: '/word-to-pdf',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'word to pdf converter free online', 'microsoft word to pdf'],
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF in seconds. Easily adjust orientation, margins, and page size. Free online JPG to PDF converter tool.',
    path: '/jpg-to-pdf',
    keywords: ['jpg to pdf', 'image to pdf', 'png to pdf', 'convert image to pdf', 'photo to pdf', 'jpg to pdf converter free online'],
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG',
    description: 'Convert each PDF page into a high-quality JPG image or extract all images contained in a PDF. Free online PDF to JPG converter.',
    path: '/pdf-to-jpg',
    keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpeg', 'pdf to png', 'extract images from pdf', 'pdf to jpg converter free online'],
  },
  'excel-to-pdf': {
    title: 'Convert EXCEL to PDF',
    description: 'Make EXCEL spreadsheets easy to read, share, and print by converting them to PDF. Preserve tables, charts, and formatting perfectly.',
    path: '/excel-to-pdf',
    keywords: ['excel to pdf', 'xlsx to pdf', 'xls to pdf', 'spreadsheet to pdf', 'convert excel to pdf free online'],
  },
  'ppt-to-pdf': {
    title: 'Convert POWERPOINT to PDF',
    description: 'Make PPT and PPTX slideshows easy to view, share, and print by converting them to PDF. Preserve layouts and animations. Free online.',
    path: '/ppt-to-pdf',
    keywords: ['ppt to pdf', 'powerpoint to pdf', 'pptx to pdf', 'presentation to pdf', 'convert powerpoint to pdf free online'],
  },
  'html-to-pdf': {
    title: 'Convert HTML to PDF',
    description: 'Convert HTML to PDF online for free. Upload an HTML file and turn it into a clean, shareable PDF document fast. Works on any device. No signup required.',
    path: '/html-to-pdf',
    keywords: ['html to pdf', 'webpage to pdf', 'convert html to pdf', 'website to pdf', 'save webpage as pdf', 'url to pdf'],
  },
  'pdf-to-excel': {
    title: 'Convert PDF to EXCEL',
    description: 'Convert PDF tables and data to editable EXCEL spreadsheets instantly. Extract tables from PDF documents with our free online converter.',
    path: '/pdf-to-excel',
    keywords: ['pdf to excel', 'pdf to xlsx', 'extract tables from pdf', 'pdf to spreadsheet', 'convert pdf to excel free online'],
  },
  'pdf-to-ppt': {
    title: 'Convert PDF to POWERPOINT',
    description: 'Convert your PDF documents to editable POWERPOINT presentations instantly. Preserve layouts, images, and text. Free online converter.',
    path: '/pdf-to-ppt',
    keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx', 'convert pdf to presentation', 'pdf to powerpoint converter free online'],
  },
  'pdf-to-pdfa': {
    title: 'PDF to PDF/A',
    description: 'Convert PDF documents to PDF/A for archiving and long-term preservation. Convert to a specific PDF/A ISO conformance level.',
    path: '/pdf-to-pdfa',
    keywords: ['pdf to pdfa', 'pdfa converter', 'pdf to pdf/a', 'pdf archiving format', 'iso 19005', 'pdf to pdfa converter free'],
  },
  'pdf-to-markdown': {
    title: 'Convert PDF to Markdown',
    description: 'Turn PDF into clean .md file in seconds. Headings, tables, lists, and links stay intact, ready to share, reuse in LLMs or anywhere.',
    path: '/pdf-to-markdown',
    keywords: ['pdf to markdown', 'pdf to md', 'convert pdf to markdown', 'pdf to text', 'extract text from pdf'],
  },
  'pdf-translator': {
    title: 'PDF Translator',
    description: 'Convert PDF documents with AI into other languages while preserving original formatting. Fast, accurate, and ideal for business, education, or travel documents.',
    path: '/pdf-translator',
    keywords: ['translate pdf', 'pdf translator', 'translate pdf document', 'pdf translation', 'ai pdf translate', 'translate pdf to spanish'],
  },
  watermark: {
    title: 'Add watermark into a PDF',
    description: 'Stamp an image or text watermark over your PDF in seconds. Choose the typography, transparency, and position. Free online PDF watermark.',
    path: '/watermark',
    keywords: ['add watermark to pdf', 'pdf watermark', 'watermark pdf', 'stamp pdf', 'pdf watermark free online', 'add text watermark pdf'],
  },
  'smart-watermark': {
    title: 'Smart Watermark',
    description: 'Add text or logo watermarks with opacity, rotation, position control, and multi-page support. Professional PDF watermarking tool for free.',
    path: '/smart-watermark',
    keywords: ['smart watermark pdf', 'advanced pdf watermark', 'logo watermark pdf', 'batch watermark pdf', 'professional pdf watermark'],
  },
  protect: {
    title: 'Password Protect PDF',
    description: 'Protect your PDFs online with strong encryption for privacy and security. Add password protection directly in your browser. No downloads needed.',
    path: '/protect',
    keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf', 'pdf password', 'pdf encryption', 'lock pdf', 'protect pdf with password free'],
  },
  unlock: {
    title: 'Unlock PDF',
    description: 'Remove PDF password security restrictions, giving you the freedom to view, edit, print, and share your PDFs as you want. Free online tool.',
    path: '/unlock',
    keywords: ['unlock pdf', 'remove pdf password', 'pdf unlocker', 'decrypt pdf', 'open password protected pdf', 'unlock pdf free online'],
  },
  'password-check': {
    title: 'Password Checker',
    description: 'Analyze your PDF password strength with cracking time estimates and security improvement tips. Check how secure your PDF passwords are.',
    path: '/password-check',
    keywords: ['pdf password checker', 'pdf security check', 'password strength analyzer', 'pdf password audit', 'check pdf security'],
  },
  organize: {
    title: 'Organize PDF',
    description: 'Rearrange, replace, add, delete, rotate, and reorder PDF pages with our intuitive drag-and-drop tool. Free online PDF organizer, no signup.',
    path: '/organize',
    keywords: ['organize pdf', 'reorder pdf pages', 'sort pdf pages', 'pdf page organizer', 'arrange pdf pages', 'manage pdf pages'],
  },
  crop: {
    title: 'Crop PDF',
    description: 'Trim PDF margins and resize pages in seconds with our easy-to-use PDF cropper. Remove white space and adjust page dimensions for free.',
    path: '/crop',
    keywords: ['crop pdf', 'trim pdf', 'pdf crop tool', 'resize pdf page', 'cut pdf margins', 'crop pdf online free'],
  },
  compare: {
    title: 'Compare PDF',
    description: 'Easily display the visual and textual differences between two similar PDF files side by side. Find changes instantly with our free comparison tool.',
    path: '/compare',
    keywords: ['compare pdf', 'pdf diff', 'compare pdf documents', 'pdf comparison tool', 'find differences in pdf', 'pdf compare online free'],
  },
  ocr: {
    title: 'PDF OCR',
    description: 'Convert scanned, non-searchable PDFs into searchable and selectable text documents for free. Improve accessibility without manual transcription.',
    path: '/ocr',
    keywords: ['ocr pdf', 'scan pdf to text', 'pdf optical character recognition', 'make pdf searchable', 'ocr pdf free online', 'text recognition pdf'],
  },
  'ocr-editable': {
    title: 'OCR to Editable PDF',
    description: 'Convert scanned PDF documents into searchable, selectable, and editable text PDF files using advanced OCR technology. Free online tool.',
    path: '/ocr-editable',
    keywords: ['ocr editable pdf', 'scan to editable pdf', 'convert scan to text', 'ocr pdf editable', 'make scanned pdf editable'],
  },
  repair: {
    title: 'Repair PDF file',
    description: 'Upload a corrupt PDF and we will try to fix it. Depending on how much the PDF is damaged we will be able to recover it partially or completely.',
    path: '/repair',
    keywords: ['repair pdf', 'fix corrupted pdf', 'recover pdf', 'pdf repair tool', 'fix damaged pdf', 'restore pdf', 'repair pdf free online'],
  },
  'scan-to-pdf': {
    title: 'Scan to PDF',
    description: 'Scan documents directly from your smartphone camera to your browser and convert them to PDF instantly. Free mobile document scanner tool.',
    path: '/scan-to-pdf',
    keywords: ['scan to pdf', 'document scanner', 'mobile scan pdf', 'scan document to pdf', 'pdf scanner free online'],
  },
  'pdf-forms': {
    title: 'PDF Forms',
    description: 'Automatically create fillable PDFs or fill PDF forms with editable and interactive text fields, checkboxes, radio buttons, and lists.',
    path: '/pdf-forms',
    keywords: ['pdf forms', 'fill pdf form', 'create pdf form', 'fillable pdf', 'pdf form builder', 'edit pdf form online free'],
  },
  redact: {
    title: 'Redact PDF',
    description: 'Permanently remove sensitive information from your documents with our free PDF redaction tool. No signup required. No files left on our servers.',
    path: '/redact',
    keywords: ['redact pdf', 'remove sensitive data pdf', 'pdf redaction', 'black out pdf', 'censor pdf', 'redact pdf free online'],
  },
  esignature: {
    title: 'eSign PDF for Free',
    description: 'Sign PDF documents online in just a few clicks. Add electronic signatures quickly without account creation or software installation required.',
    path: '/esignature',
    keywords: ['esignature', 'electronic signature pdf', 'sign pdf', 'digital signature', 'e-sign pdf', 'pdf signature free online'],
  },
  'page-numbers': {
    title: 'Add PDF page numbers',
    description: 'Add page numbers into your PDFs with ease. Choose your preferred positions, dimensions, typography, and starting number. Free online tool.',
    path: '/page-numbers',
    keywords: ['add page numbers to pdf', 'pdf page numbers', 'number pdf pages', 'pdf page numbering', 'add page numbers free online'],
  },
  'delete-pages': {
    title: 'Delete Pages',
    description: 'Remove unwanted pages from a PDF document in a flash. Select single or multiple pages to delete instantly. Free online PDF page remover.',
    path: '/delete-pages',
    keywords: ['delete pdf pages', 'remove pages from pdf', 'pdf page remover', 'cut pages from pdf', 'delete pages from pdf free online'],
  },
  summarizer: {
    title: 'PDF Summarizer',
    description: 'Summarize PDFs and other file types in seconds with our free AI PDF Summarizer. Upload multiple documents and summarize scanned PDFs with ease.',
    path: '/summarizer',
    keywords: ['pdf summarizer', 'ai summarize pdf', 'summarize pdf', 'pdf summary tool', 'ai pdf summary', 'auto summarize document'],
  },
  translate: {
    title: 'Translate PDF',
    description: 'Convert PDF documents with AI into other languages while preserving original formatting. Fast, accurate, and ideal for business, education, or travel documents.',
    path: '/translate',
    keywords: ['translate pdf', 'ai pdf translation', 'pdf translate to spanish', 'translate pdf document', 'multi language pdf'],
  },
  resume: {
    title: 'Resume Builder',
    description: 'Build professional resumes and CVs with modern templates. Free online resume builder with live preview and PDF export. Stand out from the crowd.',
    path: '/resume-builder',
    keywords: ['resume builder', 'cv maker', 'create resume online', 'resume template', 'free resume builder', 'professional cv'],
  },
  workflows: {
    title: 'Workflows',
    description: 'Create automated chains of PDF tools to streamline your document processing tasks. Save time with repeatable PDF workflows. Free to use.',
    path: '/workflows',
    keywords: ['pdf workflow', 'pdf automation', 'batch pdf processing', 'pdf workflow builder', 'automate pdf tasks'],
  },
  templates: {
    title: 'Template Library',
    description: 'Browse and download professional PDF templates for resumes, invoices, agreements, and more.',
    path: '/templates',
    keywords: ['pdf templates', 'document templates', 'free pdf templates', 'invoice template', 'resume template pdf', 'agreement template'],
  },
  community: {
    title: 'Community Q&A',
    description: 'Ask questions, share knowledge, and get help from the DocuPDF community. Find answers to common PDF issues and share your expertise.',
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
