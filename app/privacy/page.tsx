import type {Metadata} from 'next';
import Link from 'next/link';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('privacy');

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ])} />
      <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-8 inline-block">&larr; Back to Home</Link>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: July 16, 2026</p>
      <div className="space-y-8 text-slate-600 leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
          <p>DocuPDF (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our PDF processing tools and website.</p>
          <p className="mt-2">By using DocuPDF, you agree to the collection and use of information in accordance with this policy.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">2.1 Files You Upload</h3>
          <p>PDF files and documents you upload are processed entirely in your browser using client-side JavaScript (pdf-lib). Files are NOT stored on our servers. Processing happens locally in your browser session.</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">2.2 Account Information</h3>
          <p>If you create an account, we store your name, email address, and authentication data. This data is stored locally in your browser&apos;s localStorage. If Firebase Authentication is enabled, your credentials are handled by Firebase&apos;s secure infrastructure.</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">2.3 Processing History</h3>
          <p>Your document processing history is stored locally in your browser&apos;s localStorage. This data never leaves your device unless you explicitly share it.</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">2.4 AI Summarization</h3>
          <p>When using the AI Summarizer feature, your PDF file content is sent to Google&apos;s Gemini API (via our server-side proxy) for processing. We do not store or retain your document content after processing.</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-4">2.5 Newsletter Subscription</h3>
          <p>If you subscribe to our newsletter, we collect your email address. This is currently handled via a simulated endpoint and no data is persisted.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide PDF processing services (merge, split, rotate, etc.)</li>
            <li>To deliver AI-powered summarization via Gemini API</li>
            <li>To maintain your user account and preferences</li>
            <li>To improve our services and troubleshoot issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">4. Data Storage and Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>PDF processing occurs client-side; files are not uploaded to our servers</li>
            <li>Authentication data is stored in localStorage or managed by Firebase</li>
            <li>AI summarization data is transmitted securely via HTTPS to Google&apos;s Gemini API</li>
            <li>We do not operate third-party analytics or tracking scripts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Firebase (Google):</strong> Authentication services (optional, if configured)</li>
            <li><strong>Google Gemini API:</strong> AI summarization and translation</li>
            <li><strong>Google Translate:</strong> Website language translation (client-side widget)</li>
            <li><strong>pdfjs-dist (CDN):</strong> PDF rendering in browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">6. Cookies</h2>
          <p>We use minimal cookies for Google Translate language preference (googtrans cookie). We do not use tracking cookies, advertising cookies, or analytics cookies.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">7. Data Retention</h2>
          <p>Data stored in your browser&apos;s localStorage persists until you clear it. Account data can be removed by logging out or clearing browser storage. We do not retain any uploaded files or processing data on our servers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your account data</li>
            <li>Delete your account data by clearing browser storage</li>
            <li>Withdraw consent for AI processing</li>
            <li>Request information about how your data is processed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">9. Contact</h2>
          <p>For privacy-related inquiries, contact us at: <strong>privacy@docupdf.com</strong></p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes are effective immediately upon posting. We will notify users of material changes via the website.</p>
        </section>
      </div>
    </div>
  );
}
