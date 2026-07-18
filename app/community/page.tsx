'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, HelpCircle, MessageSquare, ThumbsUp, Plus, ArrowLeft, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { getQAQuestions, voteQAQuestion, QAQuestion, getQACategories } from '@/lib/pdf-tools';

export default function CommunityPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'votes'>('newest');

  useEffect(() => {
    setQuestions(getQAQuestions());
  }, []);

  const refresh = () => setQuestions(getQAQuestions());

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.body.toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === 'all' || q.category === category;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleVote = (id: string, delta: 1 | -1) => {
    voteQAQuestion(id, delta);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition mb-4">
            <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A237E] tracking-tight">Community Q&A</h1>
          <p className="text-slate-600 mt-1">Ask questions, share answers, and help the community.</p>
        </div>
        <button onClick={() => router.push('/community/ask')} className="bg-[#FF6F00] hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow flex items-center space-x-2 cursor-pointer">
          <Plus className="w-4 h-4" /><span>Ask Question</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Categories</option>
          {getQACategories().map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setSortBy('newest')} className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${sortBy === 'newest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Newest</button>
          <button onClick={() => setSortBy('votes')} className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${sortBy === 'votes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Top Voted</button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((q, idx) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-1 min-w-[48px]">
                <button onClick={() => handleVote(q.id, 1)} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer"><ChevronUp className="w-5 h-5" /></button>
                <span className={`font-bold text-sm ${q.votes > 0 ? 'text-emerald-600' : q.votes < 0 ? 'text-red-500' : 'text-slate-500'}`}>{q.votes}</span>
                <button onClick={() => handleVote(q.id, -1)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><ChevronDown className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/community/question/${q.id}`} className="text-lg font-bold text-slate-900 hover:text-[#1A237E] transition line-clamp-1">{q.title}</Link>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{q.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{q.category}</span>
                  {q.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{t}</span>)}
                  <span className="text-[10px] text-slate-400 ml-auto">{q.answers.length} answers</span>
                  <span className="text-[10px] text-slate-400">{q.viewCount} views</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No questions found</h3>
            <p className="text-slate-400 text-sm">Be the first to ask a question!</p>
          </div>
        )}
      </div>
    </div>
  );
}
