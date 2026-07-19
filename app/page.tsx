'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import TrustStatsBar from '@/components/TrustStatsBar';
import AnimatedIcon from '@/components/AnimatedIcon';
import JsonLd from '@/components/JsonLd';
import { getPublishedBlogs, formatDate, calculateReadingTime } from '@/lib/blog';
import { Calendar, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const categories = [
  'All',
  'Convert PDF',
  'Organize PDF',
  'Optimize PDF',
  'Edit PDF',
  'PDF Security',
  'PDF Intelligence',
  'Workflows',
];

const tools = [
  // Convert PDF
  { name: 'Merge PDF', description: 'Combine PDFs in the order you want with the easiest PDF merger available.', href: '/merge', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Convert PDF' },
  { name: 'Split PDF', description: 'Separate one page or a whole set for easy conversion into independent PDF files.', href: '/split', color: 'text-amber-600', bg: 'bg-amber-50', category: 'Organize PDF' },
  { name: 'Word to PDF', description: 'Make DOC and DOCX files easy to read by converting them to PDF.', href: '/word-to-pdf', color: 'text-blue-600', bg: 'bg-blue-50', category: 'Convert PDF' },
  { name: 'PDF to Word', description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', href: '/pdf-to-word', color: 'text-blue-600', bg: 'bg-blue-50', category: 'Convert PDF' },
  { name: 'JPG to PDF', description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', href: '/jpg-to-pdf', color: 'text-amber-500', bg: 'bg-amber-50', category: 'Convert PDF' },
  { name: 'PDF to JPG', description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', href: '/pdf-to-jpg', color: 'text-amber-500', bg: 'bg-amber-50', category: 'Convert PDF' },
  { name: 'PDF to Excel', description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', href: '/pdf-to-excel', color: 'text-green-600', bg: 'bg-green-50', category: 'Convert PDF' },
  { name: 'Excel to PDF', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', href: '/excel-to-pdf', color: 'text-green-600', bg: 'bg-green-50', category: 'Convert PDF' },
  { name: 'PDF to PPT', description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', href: '/pdf-to-ppt', color: 'text-orange-600', bg: 'bg-orange-50', category: 'Convert PDF' },
  { name: 'PPT to PDF', description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', href: '/ppt-to-pdf', color: 'text-orange-600', bg: 'bg-orange-50', category: 'Convert PDF' },
  { name: 'PDF to PDF/A', description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.', href: '/pdf-to-pdfa', color: 'text-slate-600', bg: 'bg-slate-50', category: 'Convert PDF' },
  { name: 'HTML to PDF', description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF.', href: '/html-to-pdf', color: 'text-slate-600', bg: 'bg-slate-50', category: 'Convert PDF' },
  { name: 'PDF to Markdown', description: 'Convert PDF files to Markdown format for developers.', href: '/pdf-to-markdown', color: 'text-slate-700', bg: 'bg-slate-100', category: 'Convert PDF' },
  { name: 'PDF Translator', description: 'Translate entire PDF documents into multiple languages while preserving layout.', href: '/pdf-translator', color: 'text-purple-600', bg: 'bg-purple-50', category: 'Convert PDF' },

  // Organize PDF
  { name: 'Rotate PDF', description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!', href: '/rotate', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Organize PDF' },
  { name: 'Organize PDF', description: 'Sort, add and delete PDF pages. Drag and drop the page thumbnails and sort them.', href: '/organize', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Organize PDF' },
  { name: 'Delete Pages', description: 'Remove pages from a PDF document in a flash.', href: '/delete-pages', color: 'text-red-600', bg: 'bg-red-50', category: 'Organize PDF' },
  { name: 'Page Numbers', description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.', href: '/page-numbers', color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'Organize PDF' },
  { name: 'Crop PDF', description: 'Trim PDF margins, change PDF page size and crop PDF documents.', href: '/crop', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Organize PDF' },

  // Optimize PDF
  { name: 'Compress PDF', description: 'Reduce file size while optimizing for maximal PDF quality.', href: '/compress', color: 'text-emerald-600', bg: 'bg-emerald-50', category: 'Optimize PDF' },
  { name: 'Repair PDF', description: 'Repair a damaged PDF and recover data from corrupt PDF.', href: '/repair', color: 'text-teal-600', bg: 'bg-teal-50', category: 'Optimize PDF' },

  // Edit PDF
  { name: 'Watermark', description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.', href: '/watermark', color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'Edit PDF' },
  { name: 'Smart Watermark', description: 'Add text or logo watermarks with opacity, rotation, position, and multi-page support.', href: '/smart-watermark', color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'Edit PDF' },
  { name: 'PDF Forms', description: 'Create fillable PDF forms or fill existing ones.', href: '/pdf-forms', color: 'text-teal-600', bg: 'bg-teal-50', category: 'Edit PDF' },
  { name: 'Redact PDF', description: 'Permanently remove sensitive information or hidden data from your PDF.', href: '/redact', color: 'text-gray-800', bg: 'bg-gray-100', category: 'Edit PDF' },
  { name: 'eSignature', description: 'Sign yourself or request electronic signatures from others.', href: '/esignature', color: 'text-purple-600', bg: 'bg-purple-50', category: 'Edit PDF' },
  { name: 'Compare PDF', description: 'Compare two PDF documents to spot the differences.', href: '/compare', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Edit PDF' },

  // PDF Security
  { name: 'Protect PDF', description: 'Encrypt your PDF with a password to keep sensitive data confidential.', href: '/protect', color: 'text-rose-600', bg: 'bg-rose-50', category: 'PDF Security' },
  { name: 'Unlock PDF', description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', href: '/unlock', color: 'text-rose-600', bg: 'bg-rose-50', category: 'PDF Security' },
  { name: 'Password Checker', description: 'Analyze PDF password strength with cracking time estimates and improvement tips.', href: '/password-check', color: 'text-rose-600', bg: 'bg-rose-50', category: 'PDF Security' },

  // PDF Intelligence
  { name: 'AI Summarizer', description: 'Get a quick summary of the contents of your PDF using advanced AI.', href: '/summarizer', color: 'text-[#FF6F00]', bg: 'bg-amber-50', category: 'PDF Intelligence' },
  { name: 'Translate PDF', description: 'Translate your PDF into any language using AI.', href: '/translate', color: 'text-purple-600', bg: 'bg-purple-50', category: 'PDF Intelligence' },
  { name: 'OCR PDF', description: 'Make your scanned PDF searchable and selectable.', href: '/ocr', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', category: 'PDF Intelligence' },
  { name: 'OCR to Editable PDF', description: 'Convert scanned PDFs into searchable, selectable text PDF documents.', href: '/ocr-editable', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', category: 'PDF Intelligence' },
  { name: 'Scan to PDF', description: 'Capture document scans from your mobile device and send them instantly to your browser.', href: '/scan-to-pdf', color: 'text-blue-600', bg: 'bg-blue-50', category: 'PDF Intelligence' },

  // Workflows
  { name: 'Workflows', description: 'Create chains of tools to automate your PDF tasks.', href: '/workflows', color: 'text-indigo-500', bg: 'bg-indigo-50', category: 'Workflows' },
  { name: 'Template Library', description: 'Browse and download professional PDF templates for resumes, invoices, agreements, and more.', href: '/templates', color: 'text-teal-600', bg: 'bg-teal-50', category: 'Workflows' },
  { name: 'Resume Builder', description: 'Create professional resumes and CVs with modern templates and live preview.', href: '/resume-builder', color: 'text-emerald-600', bg: 'bg-emerald-50', category: 'Workflows' },
  { name: 'Community Q&A', description: 'Ask questions, share knowledge, and get help from the DocuPDF community.', href: '/community', color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'Workflows' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);

  useEffect(() => {
    setLatestBlogs(getPublishedBlogs().slice(0, 3));
    const handler = () => setLatestBlogs(getPublishedBlogs().slice(0, 3));
    window.addEventListener('blog-updated', handler);
    return () => window.removeEventListener('blog-updated', handler);
  }, []);

  const filteredTools = activeCategory === 'All'
    ? tools
    : tools.filter((tool) => tool.category === activeCategory);

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
            description: tool.description,
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
      {/* Cinematic Hero Section with Video Background */}
      <section 
        id="hero-section"
        className="relative w-full h-[420px] sm:h-[500px] lg:h-[600px] bg-sky-50 overflow-hidden flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 border-b border-gray-100"
      >
        {/* Background Video (HTML5 Autoplayer) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="/hero.mp4.mp4" type="video/mp4" />
        </video>

        {/* Top & Bottom Seamless White Blending Gradients */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

        {/* Smooth Fade-in & Slide-up Content Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-20 max-w-4xl mx-auto flex flex-col items-center justify-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A237E] tracking-tight mb-6 drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed max-w-3xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>
        </motion.div>
      </section>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 lg:pt-6 lg:pb-24">
        
        {/* Category Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            return (
              <Link 
                key={tool.name} 
                href={tool.href}
                className="group h-full block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-[#FF6F00] transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.03, type: 'spring', bounce: 0.4 }}
                    className={`p-3 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300 icn-hw`}
                  >
                    <AnimatedIcon name={tool.name} color={tool.color} className="w-8 h-8" aria-hidden="true" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1A237E] transition-colors">
                    {tool.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {latestBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6F00] icn-f" />
              <h2 className="text-2xl font-bold text-slate-900">Latest from Blog</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-[#FF6F00] hover:text-amber-600 transition flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4 icn-hp" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#FF6F00] transition-all">
                <div className="relative aspect-[1200/630] bg-slate-100">
                  {blog.featuredImage ? (
                    <Image src={blog.featuredImage} alt={blog.imageAlt || blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">D</div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{blog.category}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-[#1A237E] transition">{blog.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.publishDate)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calculateReadingTime(blog.content)} min</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <TrustStatsBar />
    </div>
  );
}
