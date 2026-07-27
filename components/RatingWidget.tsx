'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getLoggedInUser } from '@/lib/auth';
import { submitRating, getToolRatings, getUserRating, type ToolRatingSummary } from '@/lib/ratings';

interface RatingWidgetProps {
  toolId: string;
  toolName: string;
}

export default function RatingWidget({ toolId, toolName }: RatingWidgetProps) {
  const [summary, setSummary] = useState<ToolRatingSummary>({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [s, userRat] = await Promise.all([
        getToolRatings(toolId),
        (async () => {
          const user = getLoggedInUser();
          if (!user) return null;
          return getUserRating(toolId, user.email);
        })()
      ]);
      setSummary(s);
      if (userRat) setUserRating(userRat.rating);
    } catch { /* silent */ }
    setLoading(false);
  }, [toolId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    const user = getLoggedInUser();
    if (!user) {
      setError('Please sign in to rate this tool.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitRating(toolId, selectedRating, user.email, user.name, comment);
      setSubmitted(true);
      setUserRating(selectedRating);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    }
    setSubmitting(false);
  };

  const openModal = () => {
    const user = getLoggedInUser();
    if (!user) {
      setError('Please sign in to rate this tool.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (userRating !== null) {
      setError('You have already rated this tool.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setShowModal(true);
    setSelectedRating(0);
    setHoverRating(0);
    setComment('');
    setSubmitted(false);
    setError('');
  };

  const barWidth = (count: number) => summary.total > 0 ? (count / summary.total) * 100 : 0;

  return (
    <>
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: Summary */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1A237E]">{summary.average > 0 ? summary.average : '—'}</div>
              <div className="flex items-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(summary.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">{summary.total} {summary.total === 1 ? 'rating' : 'ratings'}</div>
            </div>
            <div className="hidden sm:block h-16 w-px bg-gray-200" />
            {/* Distribution bars */}
            <div className="hidden sm:block space-y-1 text-xs">
              {[5,4,3,2,1].map(star => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-gray-500">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${barWidth(summary.distribution[star])}%` }} />
                  </div>
                  <span className="w-6 text-right text-gray-400">{summary.distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Rate button */}
          <div className="flex flex-col items-end gap-2">
            {userRating !== null ? (
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <CheckCircle className="w-4 h-4" />
                You rated this {userRating}/5
              </div>
            ) : (
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#FF6F00] hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4" />
                Rate Now
              </button>
            )}
            {error && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Rate {toolName}</h3>
                <p className="text-sm text-gray-500 mb-6">How would you rate this tool?</p>

                {/* Star selector */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(i)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          i <= (hoverRating || selectedRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mb-4">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating]}
                  </p>
                )}

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={selectedRating === 0 || submitting}
                  className="w-full bg-[#1A237E] hover:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Thank you for your rating!</h4>
                <p className="text-sm text-gray-500 mb-6">Your feedback helps us improve {toolName}.</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-[#1A237E] hover:bg-indigo-800 text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
