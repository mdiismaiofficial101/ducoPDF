'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, Sparkles, 
  CheckCircle, ArrowRight, Shield, Zap, RefreshCw, ArrowLeft 
} from 'lucide-react';
import { loginUser } from '@/lib/auth';
import { auth, signInWithEmailAndPassword, isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const loggedIn = loginUser(fbUser.email || email);
        if (loggedIn) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err: any) {
        let msg = 'Failed to sign in with Firebase. Please verify your email and password.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Invalid email or password. Please try again.';
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulate real network request/hash delay
      setTimeout(() => {
        try {
          const loggedIn = loginUser(email);
          if (loggedIn) {
            setSuccess(true);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            setError('Authentication failed. Please try again.');
          }
        } catch (err) {
          setError('An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      }, 1200);
    }
  };

  const handleQuickDemo = () => {
    setEmail('developer@omnitemp.io');
    setPassword('demopass123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gradient-to-br from-indigo-50/50 via-white to-slate-100 relative">
      
      <button onClick={() => router.push('/')} className="absolute top-4 left-4 z-20 inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-slate-200">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* LEFT SIDE - INTERACTIVE FORM */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/70 backdrop-blur-md">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            >
              <Sparkles className="w-3 h-3 text-[#FF6F00] animate-pulse" />
              <span>DocuPDF Accounts Suite</span>
            </motion.div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Or{' '}
              <Link href="/signup" className="font-semibold text-[#FF6F00] hover:text-amber-600 transition">
                create an account for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6 text-sm text-green-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Success! Redirecting you to your workspace...</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-md"
                    defaultChecked
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-500 select-none">
                    Remember my session
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-[#1A237E] hover:bg-[#151D65] text-white text-sm font-bold shadow-lg shadow-indigo-900/10 hover:shadow-indigo-900/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">Or quick developer access</span>
              </div>
            </div>

            {/* QUICK PREFILL BUTTON */}
            <button
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow text-indigo-500" />
              <span>Fill with Premium Demo Credentials</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - HIGH-FIDELITY LOTTIE PRESENTATION */}
      <div className="hidden lg:flex flex-1 relative bg-[#1A237E] items-center justify-center p-12 overflow-hidden text-white">
        {/* Dynamic ambient grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        {/* Swirling decorative light halos */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen" />

        <div className="relative max-w-md text-center z-10">
          {/* Main animated vector graphic matching Lottie Files aesthetics */}
          <div className="h-64 flex items-center justify-center mb-8 relative">
            <motion.div
              animate={{ 
                y: [-12, 12, -12],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-44 h-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between"
            >
              {/* Paper header */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                </div>
                <div className="text-[10px] text-indigo-200 font-mono">SECURE</div>
              </div>

              {/* Floating inner widgets */}
              <div className="my-auto space-y-3">
                <div className="h-2 w-16 bg-white/30 rounded" />
                <div className="h-2 w-28 bg-white/20 rounded" />
                <div className="h-2.5 w-20 bg-amber-400/40 rounded" />
              </div>

              {/* Animated processing meter */}
              <div className="h-8 bg-black/20 rounded-xl p-1.5 flex items-center justify-between border border-white/5 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-[#FF6F00] rounded-lg"
                  animate={{ width: ['20%', '100%', '20%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Superimposed Floating Shield icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 p-4 rounded-2xl bg-gradient-to-br from-[#FF6F00] to-orange-600 shadow-lg shadow-orange-950/40"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-3 tracking-tight">
              One account, limitless power
            </h3>
            <p className="text-indigo-200/80 text-sm leading-relaxed mb-8">
              Join millions of creators and developers using DocuPDF to combine, transform, structure, and secure critical business documents.
            </p>
          </motion.div>

          {/* Core premium key points */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Infinite Limits</div>
                <div className="text-[11px] text-indigo-200/70">Merge/split any file sizes</div>
              </div>
            </div>
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Full Privacy</div>
                <div className="text-[11px] text-indigo-200/70">Encrypted server sandboxes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
