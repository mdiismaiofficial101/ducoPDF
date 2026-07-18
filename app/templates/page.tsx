'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Download, LayoutTemplate, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { getTemplates, generateTemplatePDF, Template } from '@/lib/pdf-tools';
import { getLoggedInUser } from '@/lib/auth';

const categoryIcons: Record<string, string> = {
  resume: '📄', invoice: '💰', agreement: '📝', certificate: '🎓', letter: '✉️',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
    setTemplates(getTemplates());
  }, []);

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || t.category === category;
    return matchSearch && matchCategory;
  });

  const handleDownload = async (t: Template) => {
    setGeneratingId(t.id);
    try {
      const { blob, name } = await generateTemplatePDF(t);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition mb-4">
            <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A237E] tracking-tight">PDF Template Library</h1>
          <p className="text-slate-600 mt-1">Browse, preview, and download professional PDF templates.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Categories</option>
          <option value="resume">Resume</option>
          <option value="invoice">Invoice</option>
          <option value="agreement">Agreement</option>
          <option value="certificate">Certificate</option>
          <option value="letter">Letter</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <LayoutTemplate className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No templates found</h3>
          <p className="text-slate-400 text-sm">No templates available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, idx) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6F00] transition-all duration-300"
            >
              <div className="text-3xl mb-3">{categoryIcons[t.category] || '📄'}</div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{t.name}</h3>
              <p className="text-xs text-slate-500 capitalize mb-1">{t.category}</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{t.description}</p>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-4">
                <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
              <button onClick={() => handleDownload(t)} disabled={generatingId === t.id}
                className="w-full bg-[#1A237E] hover:bg-[#151D65] disabled:bg-slate-300 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {generatingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{generatingId === t.id ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
