'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle } from 'lucide-react';

const CONSENT_VERSION = '2026-07-16';

export default function UserConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('docupdf_consent');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.version === CONSENT_VERSION && data.accepted) {
          setAccepted(true);
          setShowConsent(false);
          return;
        }
      } catch {}
    }
    setShowConsent(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('docupdf_consent', JSON.stringify({
      accepted: true,
      version: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    }));
    setAccepted(true);
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Privacy & Terms</h3>
                  <p className="text-slate-400 text-xs">Your data matters to us</p>
                </div>
              </div>
              <div className="flex-1 text-sm text-slate-300 leading-relaxed">
                By using DocuPDF, you agree to our{' '}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">Terms & Conditions</Link>.
                Your files are processed locally in your browser and are never uploaded to our servers.
              </div>
              <button
                onClick={handleAccept}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Accept</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
