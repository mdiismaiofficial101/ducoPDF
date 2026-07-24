'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Loader2, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setSent(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gradient-to-br from-indigo-50/50 via-white to-slate-100 relative">
      <button onClick={() => router.push('/')} className="absolute top-4 left-4 z-20 inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-slate-200">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/70 backdrop-blur-md">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h1>
            <p className="mt-2 text-sm text-slate-500">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 text-sm text-red-700">{error}</motion.div>
            )}

            {sent ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h3>
                  <p className="text-sm text-slate-500 mb-6">We sent a password reset link to <strong>{email}</strong></p>
                  <button onClick={() => router.push('/login')}
                    className="w-full bg-[#1A237E] hover:bg-[#151D65] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer">
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-[#1A237E] hover:bg-[#151D65] text-white text-sm font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span>Sending...</span></>
                  ) : (
                    <><span>Send Reset Instructions</span><ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Remember your password?{' '}
                  <Link href="/login" className="font-semibold text-[#FF6F00] hover:text-amber-600 transition">Sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-[#1A237E] items-center justify-center p-12 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="relative max-w-md text-center z-10">
          <div className="h-48 flex items-center justify-center mb-8">
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-40 h-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center">
              <Mail className="w-12 h-12 text-amber-400 mb-3" />
              <p className="text-sm text-indigo-200">Password reset</p>
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Secure account recovery</h3>
          <p className="text-indigo-200/80 text-sm leading-relaxed">Enter your email and we&apos;ll send you a link to reset your password securely.</p>
        </div>
      </div>
    </div>
  );
}
