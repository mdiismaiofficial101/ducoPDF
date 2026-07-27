'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronUp, ChevronDown, MessageSquare, CheckCircle2, Flag, Send, Loader2 } from 'lucide-react';
import { getQAQuestion, addQAAnswer, voteQAQuestion, voteQAAnswer, markBestAnswer, reportQAQuestion, reportQAAnswer, QAQuestion } from '@/lib/qa-client';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState<Record<string, boolean>>({});

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await getQAQuestion(params?.id as string);
      setQuestion(q);
    } catch {
      setQuestion(null);
    }
    setLoading(false);
  }, [params?.id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleVoteQ = async (delta: 1 | -1) => {
    if (!question) return;
    await voteQAQuestion(question.id, delta);
    setQuestion(prev => prev ? { ...prev, votes: prev.votes + delta } : prev);
  };

  const handleVoteA = async (answerId: string, delta: 1 | -1) => {
    if (!question) return;
    await voteQAAnswer(answerId, delta);
    setQuestion(prev => prev ? {
      ...prev,
      answers: prev.answers.map(a => a.id === answerId ? { ...a, votes: a.votes + delta } : a),
    } : prev);
  };

  const handleBestAnswer = async (answerId: string) => {
    if (!question) return;
    await markBestAnswer(question.id, answerId);
    setQuestion(prev => prev ? {
      ...prev,
      bestAnswerId: answerId,
      answers: prev.answers.map(a => ({ ...a, isBestAnswer: a.id === answerId })),
    } : prev);
  };

  const handleReportQ = async () => {
    if (!question || reported[`q_${question.id}`]) return;
    await reportQAQuestion(question.id);
    setReported(prev => ({ ...prev, [`q_${question.id}`]: true }));
  };

  const handleReportA = async (answerId: string) => {
    if (!question || reported[`a_${answerId}`]) return;
    await reportQAAnswer(answerId);
    setReported(prev => ({ ...prev, [`a_${answerId}`]: true }));
  };

  const handleSubmitAnswer = async () => {
    if (!question || !answerText.trim()) return;
    setSubmitting(true);
    try {
      const answer = await addQAAnswer(question.id, answerText.trim());
      if (answer) {
        setQuestion(prev => prev ? { ...prev, answers: [...prev.answers, answer] } : prev);
      }
      setAnswerText('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
        <p className="text-slate-500">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Question not found</h3>
        <button onClick={() => router.push('/community')} className="text-indigo-600 font-medium cursor-pointer">Back to Community</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <button onClick={() => router.push('/community')} className="inline-flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition mb-6 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /><span>Back to Community</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center space-y-1 min-w-[48px]">
            <button onClick={() => handleVoteQ(1)} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer"><ChevronUp className="w-5 h-5" /></button>
            <span className={`font-bold text-lg ${question.votes > 0 ? 'text-emerald-600' : question.votes < 0 ? 'text-red-500' : 'text-slate-500'}`}>{question.votes}</span>
            <button onClick={() => handleVoteQ(-1)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">{question.title}</h1>
            <p className="text-slate-700 leading-relaxed mb-4">{question.body}</p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">{question.category}</span>
              {question.tags.map(t => <span key={t} className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">{t}</span>)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Asked by <strong>{question.author.name}</strong> on {new Date(question.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center space-x-3">
                <span>{question.viewCount} views</span>
                <button onClick={handleReportQ} disabled={reported[`q_${question.id}`]} className="flex items-center space-x-1 text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-50">
                  <Flag className="w-3.5 h-3.5" /><span>{reported[`q_${question.id}`] ? 'Reported' : 'Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
        <MessageSquare className="w-5 h-5" /><span>{question.answers.length} Answers</span>
      </h2>

      <div className="space-y-4 mb-8">
        {question.answers.map(a => (
          <div key={a.id} className={`bg-white border rounded-2xl p-5 transition-all ${a.isBestAnswer ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 hover:shadow-sm'}`}>
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-1 min-w-[40px]">
                <button onClick={() => handleVoteA(a.id, 1)} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer"><ChevronUp className="w-4 h-4" /></button>
                <span className={`font-bold text-sm ${a.votes > 0 ? 'text-emerald-600' : a.votes < 0 ? 'text-red-500' : 'text-slate-500'}`}>{a.votes}</span>
                <button onClick={() => handleVoteA(a.id, -1)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><ChevronDown className="w-4 h-4" /></button>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800">{a.author.name}</span>
                    {a.isBestAnswer && <span className="flex items-center space-x-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /><span>Best Answer</span></span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!a.isBestAnswer && (
                      <button onClick={() => handleBestAnswer(a.id)} className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer">Mark Best</button>
                    )}
                    <button onClick={() => handleReportA(a.id)} disabled={reported[`a_${a.id}`]} className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-50">{reported[`a_${a.id}`] ? 'Reported' : 'Report'}</button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{a.body}</p>
                <p className="text-[11px] text-slate-400 mt-2">Answered on {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
        {question.answers.length === 0 && (
          <div className="text-center py-8 bg-white border border-slate-200 rounded-2xl">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-bold text-slate-900 mb-3">Your Answer</h3>
        <textarea placeholder="Write your answer here..." value={answerText} onChange={e => setAnswerText(e.target.value)} className="w-full h-28 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
        <button onClick={handleSubmitAnswer} disabled={submitting || !answerText.trim()}
          className="bg-[#1A237E] hover:bg-[#151D65] disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition cursor-pointer"
        ><Send className="w-4 h-4" /><span>{submitting ? 'Submitting...' : 'Post Answer'}</span></button>
      </div>
    </div>
  );
}
