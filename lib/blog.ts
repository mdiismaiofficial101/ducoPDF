export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  featuredImage: string;
  imageAlt: string;
  shortDescription: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  tags: string[];
  canonicalUrl: string;
  publishDate: string;
  author: string;
  faq: Array<{ question: string; answer: string }>;
  relatedTools: string[];
  relatedBlogs: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'docupdf_blogs';

export function getBlogs(): BlogPost[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getPublishedBlogs(): BlogPost[] {
  return getBlogs().filter(b => b.published).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return getBlogs().find(b => b.slug === slug);
}

export function getBlogById(id: string): BlogPost | undefined {
  return getBlogs().find(b => b.id === id);
}

export function saveBlog(blog: BlogPost): void {
  const blogs = getBlogs();
  const idx = blogs.findIndex(b => b.id === blog.id);
  if (idx >= 0) {
    blogs[idx] = { ...blog, updatedAt: new Date().toISOString() };
  } else {
    blogs.push(blog);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  window.dispatchEvent(new Event('blog-updated'));
}

export function deleteBlog(id: string): void {
  const blogs = getBlogs().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  window.dispatchEvent(new Event('blog-updated'));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

export function uniqueSlug(title: string): string {
  let slug = generateSlug(title);
  const blogs = getBlogs();
  let counter = 1;
  while (blogs.some(b => b.slug === slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  return slug;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const BLOG_CATEGORIES = [
  'PDF Tips',
  'Convert PDF',
  'Compress PDF',
  'PDF Security',
  'PDF Editing',
  'Document Management',
  'Productivity',
  'Tutorial',
];

export const ALL_TOOLS = [
  { name: 'Merge PDF', href: '/merge' },
  { name: 'Split PDF', href: '/split' },
  { name: 'Compress PDF', href: '/compress' },
  { name: 'Rotate PDF', href: '/rotate' },
  { name: 'PDF to Word', href: '/pdf-to-word' },
  { name: 'Word to PDF', href: '/word-to-pdf' },
  { name: 'JPG to PDF', href: '/jpg-to-pdf' },
  { name: 'PDF to JPG', href: '/pdf-to-jpg' },
  { name: 'Protect PDF', href: '/protect' },
  { name: 'Unlock PDF', href: '/unlock' },
  { name: 'Watermark PDF', href: '/watermark' },
  { name: 'OCR PDF', href: '/ocr' },
  { name: 'Organize PDF', href: '/organize' },
  { name: 'Crop PDF', href: '/crop' },
  { name: 'AI Summarizer', href: '/summarizer' },
  { name: 'Delete Pages', href: '/delete-pages' },
  { name: 'eSignature', href: '/esignature' },
  { name: 'Compare PDF', href: '/compare' },
  { name: 'Repair PDF', href: '/repair' },
  { name: 'Redact PDF', href: '/redact' },
];

export function getBlogSchema(blog: BlogPost) {
  const siteUrl = 'https://cybronetwork.online';
  const readingTime = calculateReadingTime(blog.content);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.shortDescription,
    image: blog.featuredImage || `${siteUrl}/myicon.png`,
    datePublished: blog.publishDate,
    dateModified: blog.updatedAt || blog.publishDate,
    author: {
      '@type': 'Person',
      name: blog.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DocuPDF',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/myicon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${blog.slug}`,
    },
    wordCount: blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
  };
}

export function getBlogBreadcrumbSchema(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://docupdf.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://docupdf.com/blog' },
      { '@type': 'ListItem', position: 3, name: title, item: `https://docupdf.com/blog/${slug}` },
    ],
  };
}

export function getBlogFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function generateMetaTitle(title: string, keyword?: string): string {
  if (keyword) {
    return `${title} - ${keyword} | DocuPDF Blog`;
  }
  return `${title} | DocuPDF Blog`;
}

export function generateMetaDescription(shortDesc: string, keyword?: string): string {
  const desc = shortDesc.substring(0, 155);
  if (keyword && !desc.toLowerCase().includes(keyword.toLowerCase())) {
    return `${desc} Learn about ${keyword} and more.`;
  }
  return desc;
}

export interface SEOScore {
  score: number;
  checks: Array<{ label: string; pass: boolean }>;
}

export function calculateSEOScore(blog: Partial<BlogPost>): SEOScore {
  const checks: Array<{ label: string; pass: boolean }> = [];

  checks.push({ label: 'Focus Keyword exists', pass: !!blog.focusKeyword });
  checks.push({ label: 'Title length (30-60 chars)', pass: blog.metaTitle ? blog.metaTitle.length >= 30 && blog.metaTitle.length <= 60 : false });
  checks.push({ label: 'Meta description (120-160 chars)', pass: blog.metaDescription ? blog.metaDescription.length >= 120 && blog.metaDescription.length <= 160 : false });
  checks.push({ label: 'H1 tag present', pass: (blog.content || '').includes('<h1') || !!blog.title });
  checks.push({ label: 'H2 tags present', pass: (blog.content || '').includes('<h2') });
  checks.push({ label: 'Featured image set', pass: !!blog.featuredImage });
  checks.push({ label: 'Image alt text', pass: !!blog.imageAlt });
  checks.push({ label: 'Short description', pass: !!blog.shortDescription && blog.shortDescription.length >= 50 });
  checks.push({ label: 'FAQ section', pass: blog.faq ? blog.faq.length > 0 : false });
  checks.push({ label: 'Related tools linked', pass: blog.relatedTools ? blog.relatedTools.length > 0 : false });
  checks.push({ label: 'Content length > 500 words', pass: blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length > 500 : false });
  checks.push({ label: 'Canonical URL set', pass: !!blog.canonicalUrl });
  checks.push({ label: 'Tags added', pass: blog.tags ? blog.tags.length > 0 : false });
  checks.push({ label: 'Category selected', pass: !!blog.category });
  checks.push({ label: 'Reading time > 2 min', pass: blog.content ? calculateReadingTime(blog.content) >= 2 : false });

  const passCount = checks.filter(c => c.pass).length;
  const score = Math.round((passCount / checks.length) * 100);

  return { score, checks };
}

export function getBlogsForSitemap() {
  return getPublishedBlogs().map(b => ({
    url: `https://docupdf.com/blog/${b.slug}`,
    lastModified: new Date(b.updatedAt || b.publishDate),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
}
