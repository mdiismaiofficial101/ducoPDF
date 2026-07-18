'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, 
  Sparkles, CheckCircle, ArrowRight, BookOpen, Star, Zap, ArrowLeft 
} from 'lucide-react';
import { signupUser } from '@/lib/auth';
import { auth, createUserWithEmailAndPassword, isFirebaseConfigured } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simple live password strength checker
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-slate-200', width: '0%', textClass: 'text-slate-400' };
    if (password.length < 5) return { label: 'Weak', color: 'bg-red-500', width: '33%', textClass: 'text-red-500' };
    if (password.length < 8) return { label: 'Good', color: 'bg-amber-500', width: '66%', textClass: 'text-amber-500' };
    return { label: 'Strong (Secure!)', color: 'bg-emerald-500', width: '100%', textClass: 'text-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Please enter your full name');
      return;
    }
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!password || password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy');
      return;
    }

    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const newUser = signupUser(name, fbUser.email || email);
        if (newUser) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          setError('Signup failed. Please try again.');
        }
      } catch (err: any) {
        let msg = 'Failed to create user with Firebase. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'This email address is already in use by another account.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'The email address is invalid.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'The password must be stronger.';
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulate secure user generation delay
      setTimeout(() => {
        try {
          const newUser = signupUser(name, email);
          if (newUser) {
            setSuccess(true);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            setError('Signup failed. Please try again.');
          }
        } catch (err) {
          setError('An unexpected registration error occurred.');
        } finally {
          setIsLoading(false);
        }
      }, 1200);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gradient-to-br from-indigo-50/50 via-white to-slate-100 relative">
      
      <button onClick={() => router.push('/')} className="absolute top-4 left-4 z-20 inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-slate-200">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* LEFT SIDE - INTERACTIVE SIGNUP FORM */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/70 backdrop-blur-md">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-amber-200"
            >
              <Sparkles className="w-3 h-3 text-[#FF6F00] animate-pulse" />
              <span>Complimentary Pro Workspace gifted today!</span>
            </motion.div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#FF6F00] hover:text-amber-600 transition">
                Sign in here
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
                <span>Success! Setting up your workspace environment...</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

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
                    placeholder="john@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 5 characters"
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

                {/* Password strength meter bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-[10px] mb-1 font-medium">
                      <span className="text-slate-500">Password strength:</span>
                      <span className={strength.textClass}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${strength.color}`}
                        initial={{ width: '0%' }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-md cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="agree-terms" className="font-medium text-slate-500 select-none cursor-pointer">
                    I agree to the{' '}
                    <span className="font-bold text-slate-700 hover:underline">Terms of Service</span>{' '}
                    and{' '}
                    <span className="font-bold text-slate-700 hover:underline">Privacy Policy</span>.
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
                    <span>Spinning up environment...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Pro Account</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - DECORATIVE PRESENTATION */}
      <div className="hidden lg:flex flex-1 relative bg-[#1A237E] items-center justify-center p-12 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#FF6F00]/20 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />

        <div className="relative max-w-md text-center z-10">
          <div className="h-64 flex items-center justify-center mb-8 relative">
            
            {/* Morphing visual vector card */}
            <motion.div
              animate={{ 
                y: [8, -8, 8],
                rotate: [2, -2, 2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-52 h-44 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[9px]">PREMIUM ACTIVE</div>
              </div>
              <div className="space-y-2 mt-4 text-left">
                <div className="h-2 w-full bg-white/20 rounded" />
                <div className="h-2 w-4/5 bg-white/20 rounded" />
                <div className="h-2 w-3/5 bg-white/20 rounded" />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3 text-[10px] text-indigo-200">
                <span>Account Tier</span>
                <span className="font-bold text-white">DocuPDF Pro</span>
              </div>
              
              {/* Extra floating elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-5 -right-5 p-3 rounded-full bg-indigo-600 shadow-xl"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-3 tracking-tight">
              Instant Setup in 3 Seconds
            </h3>
            <p className="text-indigo-200/80 text-sm leading-relaxed mb-6">
              Create your account to unlock professional workspace features, track processing history, access your customized API endpoints, and experience priority processing.
            </p>
          </motion.div>

          <div className="space-y-3.5 text-left">
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-indigo-100">Unlock priority high-speed PDF processing</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-indigo-100">Keep history log of your converted files</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-indigo-100">Manage custom developer integration API keys</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
