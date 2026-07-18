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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
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
                  <Link 
                    href="/merge" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300"
                    title="Merge multiple PDF files into one single document"
                  >
                    Merge PDF Documents
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/split" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300"
                    title="Split PDF files into individual selected pages"
                  >
                    Split PDF Files
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/rotate" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300"
                    title="Rotate orientation of PDF pages"
                  >
                    Rotate PDF Pages
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/delete-pages" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-flex items-center focus:outline-none focus:text-teal-300"
                    title="Remove selected pages from PDF document"
                  >
                    Delete PDF Pages
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/summarizer" 
                    className="text-slate-400 hover:text-teal-300 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center font-medium focus:outline-none"
                    title="Summarize document content using Gemini Intelligence"
                  >
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
              <span>Platform & Trust</span>
            </h2>
            <nav aria-label="Company Info and Legal Navigation">
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link 
                    href="/dashboard" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300"
                  >
                    User Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/login" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/signup" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-slate-400 hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block focus:outline-none focus:text-teal-300"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Contact Support & Social */}
          <div className="flex flex-col space-y-4" id="footer-column-newsletter">
            <h2 className="text-white font-semibold uppercase tracking-wider text-xs flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full" />
              <span>Contact Support</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Need help? Click the button below to email our support team directly.
            </p>

            {/* Permanent Support Email Box */}
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300">
                <label htmlFor="support-email" className="sr-only">Support Email</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="support-email"
                  type="email"
                  readOnly
                  value="cybrotechnology1@gmail.com"
                  tabIndex={-1}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-transparent text-slate-300 focus:outline-none border-none outline-none cursor-default select-all"
                  aria-label="Support email address"
                />
              </div>
              <a
                href="mailto:cybrotechnology1@gmail.com"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all duration-300"
                aria-label="Send email to support"
              >
                <Send className="w-4 h-4" />
                <span>Send us an email</span>
              </a>
            </div>

            {/* Social Network Links - Touch targets of min 44x44px */}
            <div className="pt-2" id="footer-social-wrapper">
              <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block mb-2.5">Connect With Us</span>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://t.me/cybrotechnology" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-11 px-3 flex items-center justify-center space-x-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="DocuPDF Telegram Channel"
                >
                  <Send className="w-5 h-5" />
                </a>
                <div 
                  className="h-11 px-3 flex items-center justify-center space-x-2 text-slate-500 bg-white/5 border border-white/5 rounded-xl cursor-not-allowed group relative"
                  aria-label="DocuPDF Twitter Account (Coming Soon)"
                >
                  <Twitter className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">Coming Soon</span>
                </div>
              </div>
            </div>
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
              <span>Complies with ISO 27001 & SOC2 Standards</span>
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
