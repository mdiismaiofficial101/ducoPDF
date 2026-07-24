'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight, Calendar } from 'lucide-react';
import { toolFAQs, toolFeatures, toolRelatedTools, toolGuides } from '@/lib/tool-seo-data';

const ALL_TOOLS: Record<string, { name: string; href: string }> = {
  merge: { name: 'Merge PDF', href: '/merge' },
  split: { name: 'Split PDF', href: '/split' },
  compress: { name: 'Compress PDF', href: '/compress' },
  rotate: { name: 'Rotate PDF', href: '/rotate' },
  'pdf-to-word': { name: 'PDF to Word', href: '/pdf-to-word' },
  'word-to-pdf': { name: 'Word to PDF', href: '/word-to-pdf' },
  'jpg-to-pdf': { name: 'JPG to PDF', href: '/jpg-to-pdf' },
  'pdf-to-jpg': { name: 'PDF to JPG', href: '/pdf-to-jpg' },
  'excel-to-pdf': { name: 'Excel to PDF', href: '/excel-to-pdf' },
  'pdf-to-excel': { name: 'PDF to Excel', href: '/pdf-to-excel' },
  'ppt-to-pdf': { name: 'PPT to PDF', href: '/ppt-to-pdf' },
  'pdf-to-ppt': { name: 'PDF to PPT', href: '/pdf-to-ppt' },
  'html-to-pdf': { name: 'HTML to PDF', href: '/html-to-pdf' },
  'pdf-to-pdfa': { name: 'PDF to PDF/A', href: '/pdf-to-pdfa' },
  'pdf-to-markdown': { name: 'PDF to Markdown', href: '/pdf-to-markdown' },
  'pdf-translator': { name: 'PDF Translator', href: '/pdf-translator' },
  watermark: { name: 'Watermark', href: '/watermark' },
  'smart-watermark': { name: 'Smart Watermark', href: '/smart-watermark' },
  protect: { name: 'Protect PDF', href: '/protect' },
  unlock: { name: 'Unlock PDF', href: '/unlock' },
  'password-check': { name: 'Password Check', href: '/password-check' },
  organize: { name: 'Organize PDF', href: '/organize' },
  crop: { name: 'Crop PDF', href: '/crop' },
  compare: { name: 'Compare PDF', href: '/compare' },
  ocr: { name: 'OCR PDF', href: '/ocr' },
  'ocr-editable': { name: 'OCR Editable', href: '/ocr-editable' },
  repair: { name: 'Repair PDF', href: '/repair' },
  'scan-to-pdf': { name: 'Scan to PDF', href: '/scan-to-pdf' },
  'pdf-forms': { name: 'PDF Forms', href: '/pdf-forms' },
  redact: { name: 'Redact PDF', href: '/redact' },
  esignature: { name: 'eSignature', href: '/esignature' },
  'page-numbers': { name: 'Page Numbers', href: '/page-numbers' },
  'delete-pages': { name: 'Delete Pages', href: '/delete-pages' },
  summarizer: { name: 'Summarizer', href: '/summarizer' },
  translate: { name: 'Translate PDF', href: '/translate' },
  'resume-builder': { name: 'Resume Builder', href: '/resume-builder' },
  workflows: { name: 'Workflows', href: '/workflows' },
  templates: { name: 'Templates', href: '/templates' },
};

interface ToolSEOSectionProps {
  toolId: string;
  toolTitle?: string;
  toolDescription?: string;
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      <div className="w-10 h-10 bg-indigo-50 text-[#1A237E] rounded-lg flex items-center justify-center mb-3">
        <span className="text-lg font-bold">{title[0]}</span>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className={`border rounded-xl transition-all duration-200 ${isOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <h3 className="font-semibold text-slate-900 pr-4">{question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <p className="text-slate-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function ToolSEOSection({ toolId, toolTitle, toolDescription }: ToolSEOSectionProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);

  const faqs = toolFAQs[toolId] || [];
  const features = toolFeatures[toolId] || [];
  const relatedIds = toolRelatedTools[toolId] || [];
  const guide = toolGuides[toolId];

  useEffect(() => {
    const tool = ALL_TOOLS[toolId];
    if (!tool) return;
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => {
        const all: any[] = Array.isArray(d.blogs) ? d.blogs : [];
        const matched = all.filter(b =>
          b.relatedTools?.some((t: string) => t === tool.name)
        );
        setRelatedBlogs(matched.slice(0, 3));
      })
      .catch(() => {});
  }, [toolId]);

  if (faqs.length === 0 && features.length === 0 && relatedIds.length === 0 && !guide && relatedBlogs.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

      {guide && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{guide.title}</h2>
          <p className="text-slate-600 mb-8">Follow these simple steps to get your document ready in seconds. No technical skills required.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.steps.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                <div className="w-10 h-10 bg-indigo-50 text-[#1A237E] rounded-lg flex items-center justify-center mb-3 text-lg font-bold">{step.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Why Choose {toolTitle || 'This Tool'}?
          </h2>
          <p className="text-slate-600 mb-8">
            {toolDescription || 'Fast, secure, and free — processing happens entirely in your browser.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 mb-8">
            Get answers to common questions about using this tool.
          </p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </section>
      )}

      {relatedIds.length > 0 && (
        <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Related Tools</h2>
          <p className="text-slate-600 mb-6">
            Explore more PDF tools that work great with this one.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {relatedIds.map(toolId => {
              const tool = ALL_TOOLS[toolId];
              if (!tool) return null;
              return (
                <Link
                  key={toolId}
                  href={tool.href}
                  className="flex items-center justify-between gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-[#FF6F00] hover:shadow-md transition-all text-sm font-semibold text-slate-700 hover:text-[#1A237E]"
                >
                  {tool.name}
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {relatedBlogs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Related Articles</h2>
          <p className="text-slate-600 mb-8">
            Learn more about PDF tools and tips from our blog.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedBlogs.map((b: any) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all">
                <span className="text-xs text-indigo-600 font-semibold">{b.category}</span>
                <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-[#1A237E] transition">{b.title}</h3>
                {b.shortDescription && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{b.shortDescription}</p>
                )}
                {b.publishDate && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(b.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Ready to Process Your PDF?
        </h2>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
          Upload your file above to get started. All processing happens in your browser — your files never leave your device.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            100% Free
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            No Registration
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Client-Side Processing
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            No File Limits
          </span>
        </div>
      </section>
    </div>
  );
}
