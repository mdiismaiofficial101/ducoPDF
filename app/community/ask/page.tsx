'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, HelpCircle } from 'lucide-react';
import { addQAQuestion, getQACategories } from '@/lib/qa-client';

export default function AskQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getQACategories().then(c => setCategories(c)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) { alert('Please enter a question title.'); return; }
    if (!body.trim()) { alert('Please enter the question details.'); return; }
    setSubmitting(true);

    try {
      await addQAQuestion({
        title: title.trim(),
        body: body.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        category,
      });
      router.push('/community');
    } catch (err: any) {
      alert(err.message || 'Failed to submit question.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <button onClick={() => router.back()} className="inline-flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition mb-6 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /><span>Back</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 text-[#1A237E] rounded-2xl"><HelpCircle className="w-8 h-8" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A237E]">Ask a Question</h1>
            <p className="text-sm text-slate-500">Be specific and provide details to get helpful answers.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
            <input type="text" placeholder="What is your question about?" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Details</label>
            <textarea placeholder="Provide more context, details, and what you've tried..." value={body} onChange={e => setBody(e.target.value)} className="w-full h-40 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
              <input type="text" placeholder="Comma-separated (e.g., merge, beginner)" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-[#1A237E] hover:bg-[#151D65] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4" /><span>{submitting ? 'Submitting...' : 'Submit Question'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
