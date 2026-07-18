import type {Metadata} from 'next';
import Link from 'next/link';
import { getPageSEO } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = getPageSEO('terms');

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <JsonLd data={generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
      ])} />
      <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-8 inline-block">&larr; Back to Home</Link>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: July 16, 2026</p>
      <div className="space-y-8 text-slate-600 leading-relaxed">

        <section>
          <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>By accessing or using DocuPDF (&ldquo;the Service&rdquo;), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">2. Description of Service</h2>
          <p>DocuPDF provides online PDF processing tools including but not limited to: merging, splitting, rotating, compressing, converting, protecting, and AI-powered summarization of PDF documents. Processing is performed client-side where possible, with AI features powered by Google&apos;s Gemini API.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may create an account to access dashboard features and processing history</li>
            <li>You are responsible for maintaining the confidentiality of your credentials</li>
            <li>Account data is stored locally in your browser. We are not responsible for data loss due to clearing browser storage</li>
            <li>You must be at least 13 years of age to use the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">4. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must not upload illegal, infringing, or malicious content</li>
            <li>You must not attempt to reverse-engineer, disrupt, or abuse the Service</li>
            <li>You must not use the Service for any unlawful purpose</li>
            <li>You are solely responsible for the files you process and the content you submit to AI features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">5. Data Processing and Privacy</h2>
          <p>PDF processing occurs in your browser. Files are not stored on our servers. AI summarization sends document content to Google&apos;s Gemini API. By using AI features, you consent to this transmission. See our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> for details.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">6. Intellectual Property</h2>
          <p>The Service, including its code, design, and branding, is owned by DocuPDF. You retain all rights to your uploaded documents. We claim no ownership over your content.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">7. Limitation of Liability</h2>
          <p>DocuPDF is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from the use or inability to use the Service, including data loss, processing errors, or AI-generated inaccuracies.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">8. AI Services Disclaimer</h2>
          <p>AI summarization and translation are powered by Google Gemini and may produce inaccurate or incomplete results. You should review AI-generated content before relying on it. We are not responsible for AI-generated errors or omissions.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">9. Termination</h2>
          <p>We reserve the right to suspend or terminate access to the Service at our discretion, without prior notice, for violations of these terms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">10. Governing Law</h2>
          <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the State of Delaware.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">11. Contact</h2>
          <p>For questions about these terms, contact: <strong>legal@docupdf.com</strong></p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">12. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms. Users will be notified of material changes.</p>
        </section>
      </div>
    </div>
  );
}
