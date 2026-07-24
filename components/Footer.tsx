'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  Send, 
  Mail, 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  ShieldCheck, 
  Lock
} from 'lucide-react';

export default function Footer() {
  const [language, setLanguage] = useState('en');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const code = match[1].split('/').pop();
      if (code) setLanguage(code);
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    document.cookie = `googtrans=/en/${newLang}; path=/;`;
    if (window.location.hostname !== 'localhost') {
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
    }
    window.location.reload();
  };

  const languages = [
    { code: 'en', name: 'English (US)' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'bn', name: 'বাংলা (Bangla)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'zh-CN', name: '中文 (Chinese)' },
    { code: 'ar', name: 'العربية (Arabic)' },
  ];

  return (
    <footer 
      id="main-premium-footer"
      className="relative bg-slate-950/90 backdrop-blur-xl border-t border-white/10 text-slate-300 overflow-hidden shadow-[0_-15px_40px_-15px_rgba(99,102,241,0.25)] mt-auto"
      aria-label="DocuPDF Site Directory"
    >
      {/* Premium Glassmorphism Lighting Accents */}
      <div 
        id="bg-light-accent-left"
        className="absolute top-0 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" 
      />
      <div 
        id="bg-light-accent-right"
        className="absolute bottom-0 right-1/4 translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Column 1: Brand & SEO Description */}
          <div className="flex flex-col space-y-4" id="footer-column-brand">
            <Link 
              href="/" 
              className="flex items-center space-x-2 w-max focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg p-1"
              aria-label="DocuPDF Home Page"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/10">
                <Image src="/myicon.png" alt="DocuPDF Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-teal-300 bg-clip-text text-transparent font-extrabold text-2xl tracking-tight">
                DocuPDF
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              DocuPDF is a highly secure, modern document optimization platform. 
              Seamlessly merge, split, rotate, delete pages, and summarize PDFs using advanced 
              intelligence directly in your browser. Engineered for fast, client-side efficiency.
            </p>

            <div className="flex items-center space-x-3 text-xs text-slate-500 pt-2" id="footer-security-badges">
              <span className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Client-Side Secure</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>SSL Encrypted</span>
              </span>
            </div>
          </div>

          {/* Column 2: Core PDF Utilities Navigation */}
          <div className="flex flex-col" id="footer-column-tools">
            <h2 className="text-white font-semibold uppercase tracking-wider text-xs mb-5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
              <span>PDF Utilities</span>
            </h2>
            <nav aria-label="PDF Tools Navigation">
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/merge" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Merge multiple PDF files into one single document">
                    Merge PDF Documents
                  </Link>
                </li>
                <li>
                  <Link href="/split" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Split PDF files into individual selected pages">
                    Split PDF Files
                  </Link>
                </li>
                <li>
                  <Link href="/compress" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Reduce PDF file size without losing quality">
                    Compress PDF
                  </Link>
                </li>
                <li>
                  <Link href="/rotate" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Rotate orientation of PDF pages">
                    Rotate PDF Pages
                  </Link>
                </li>
                <li>
                  <Link href="/delete-pages" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Remove selected pages from PDF document">
                    Delete PDF Pages
                  </Link>
                </li>
                <li>
                  <Link href="/organize" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Rearrange and organize PDF pages">
                    Organize PDF
                  </Link>
                </li>
                <li>
                  <Link href="/crop" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Trim PDF margins and resize pages">
                    Crop PDF
                  </Link>
                </li>
                <li>
                  <Link href="/page-numbers" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Add page numbers to PDF">
                    Add Page Numbers
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300" title="Compare two PDF documents side by side">
                    Compare PDF
                  </Link>
                </li>
                <li>
                  <Link href="/summarizer" className="text-slate-400 hover:text-teal-300 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center font-medium focus:outline-none" title="Summarize document content using AI">
                    <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] mr-2 font-bold tracking-wider border border-indigo-500/30 uppercase">AI</span>
                    PDF Summarizer
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Platform Navigation & Legal Links */}
          <div className="flex flex-col" id="footer-column-platform">
            <h2 className="text-white font-semibold uppercase tracking-wider text-xs mb-5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              <span>Convert & Edit</span>
            </h2>
            <nav aria-label="Convert and Edit Tools Navigation">
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/pdf-to-word" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Convert PDF to editable Word document">
                    PDF to Word
                  </Link>
                </li>
                <li>
                  <Link href="/word-to-pdf" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Convert Word document to PDF">
                    Word to PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf-to-jpg" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Convert PDF pages to JPG images">
                    PDF to JPG
                  </Link>
                </li>
                <li>
                  <Link href="/jpg-to-pdf" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Convert JPG images to PDF">
                    JPG to PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf-to-excel" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Extract tables from PDF to Excel">
                    PDF to Excel
                  </Link>
                </li>
                <li>
                  <Link href="/watermark" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Add watermark to PDF documents">
                    Watermark PDF
                  </Link>
                </li>
                <li>
                  <Link href="/protect" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Password protect your PDF files">
                    Protect PDF
                  </Link>
                </li>
                <li>
                  <Link href="/unlock" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Remove password from protected PDF">
                    Unlock PDF
                  </Link>
                </li>
                <li>
                  <Link href="/ocr" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Make scanned PDFs searchable with OCR">
                    PDF OCR
                  </Link>
                </li>
                <li>
                  <Link href="/esignature" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Add electronic signature to PDF">
                    eSign PDF
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: More Tools & Resources */}
          <div className="flex flex-col" id="footer-column-more">
            <h2 className="text-white font-semibold uppercase tracking-wider text-xs mb-5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full" />
              <span>More Tools</span>
            </h2>
            <nav aria-label="More Tools and Resources Navigation">
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/redact" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Remove sensitive info from PDF">
                    Redact PDF
                  </Link>
                </li>
                <li>
                  <Link href="/repair" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Fix corrupted or damaged PDF files">
                    Repair PDF
                  </Link>
                </li>
                <li>
                  <Link href="/pdf-forms" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Fill and create PDF forms">
                    PDF Forms
                  </Link>
                </li>
                <li>
                  <Link href="/translate" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Translate PDF to any language">
                    Translate PDF
                  </Link>
                </li>
                <li>
                  <Link href="/scan-to-pdf" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Scan documents to PDF with your phone">
                    Scan to PDF
                  </Link>
                </li>
                <li>
                  <Link href="/password-check" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Check PDF password strength">
                    Password Check
                  </Link>
                </li>
                <li>
                  <Link href="/resume-builder" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Build professional resumes online">
                    Resume Builder
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Browse free PDF templates">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="PDF tips, tutorials and guides">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300" title="Ask questions and get help">
                    Community
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 5: Contact Support & Legal */}
          <div className="flex flex-col space-y-4" id="footer-column-contact">
            <h2 className="text-white font-semibold uppercase tracking-wider text-xs flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full" />
              <span>Support & Legal</span>
            </h2>
            <nav aria-label="Support and Legal Links">
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="mailto:cybrotechnology1@gmail.com" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-2 focus:outline-none focus:text-teal-300">
                    <Mail className="w-4 h-4" />
                    <span>Email Support</span>
                  </a>
                </li>
                <li>
                  <a href="https://t.me/cybrotechnology" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-2 focus:outline-none focus:text-teal-300">
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

        </div>

        {/* Separator */}
        <hr className="border-white/5 my-8" />

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500" id="footer-bottom-bar">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span>&copy; {currentYear} DocuPDF. All rights reserved.</span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span>Built by <a href="https://cybrotechnology.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition">CybroTechnology</a></span>
            <span className="hidden sm:inline text-white/10">|</span>
              <span className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Client-Side Secure Processing</span>
              </span>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl hover:border-white/15 transition-all duration-300">
            <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <select id="language-select" value={language} onChange={handleLanguageChange} className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none border-none outline-none cursor-pointer pr-1">
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-300">{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </footer>
  );
}
