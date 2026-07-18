'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Menu, X, ChevronDown, User as UserIcon, 
  LogOut, LayoutDashboard, History, Sparkles, HelpCircle,
  CreditCard, Key
} from 'lucide-react';
import { getLoggedInUser, logoutUser, User } from '@/lib/auth';
import LottiePlayer from '@/components/LottiePlayer';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync auth state on mount and dynamically listen to custom auth events
  useEffect(() => {
    const activeUser = getLoggedInUser();
    
    const timer = setTimeout(() => {
      setUser(activeUser);
    }, 0);

    const handleAuthChange = () => {
      setUser(getLoggedInUser());
    };

    window.addEventListener('auth-state-change', handleAuthChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('auth-state-change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-[#1A237E] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-11 h-11 flex-shrink-0">
              <Image 
                src="/myicon.png" 
                alt="DocuPDF Logo" 
                width={44}
                height={44}
                className="h-11 w-11 object-contain transform group-hover:scale-110 transition-transform duration-300 rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              DocuPDF
            </span>
          </Link>

          {/* DESKTOP NAVIGATION MENU BAR */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/merge" className="hover:text-amber-400 transition font-medium text-sm">Merge PDF</Link>
            <Link href="/split" className="hover:text-amber-400 transition font-medium text-sm">Split PDF</Link>
            <Link href="/rotate" className="hover:text-amber-400 transition font-medium text-sm">Rotate PDF</Link>
            <Link href="/blog" className="hover:text-amber-400 transition font-medium text-sm flex items-center space-x-1">
              <span>Blog</span>
              <span className="text-[8px] bg-amber-500 text-slate-900 px-1 py-0.5 rounded font-bold">NEW</span>
            </Link>
            
            {/* TOOLS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                onBlur={() => setTimeout(() => setIsToolsOpen(false), 200)}
                className="flex items-center space-x-1 hover:text-amber-400 transition font-medium text-sm focus:outline-none cursor-pointer"
              >
                <span>More Tools</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-100 py-2 z-50"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Popular Features
                    </div>
                    <Link href="/merge" className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-[#1A237E] transition">Merge PDF</Link>
                    <Link href="/split" className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-[#1A237E] transition">Split PDF</Link>
                    <Link href="/rotate" className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-[#1A237E] transition">Rotate PDF</Link>
                    <Link href="/delete-pages" className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-[#1A237E] transition text-red-600 hover:text-red-700 font-medium">Delete Pages</Link>
                    <Link href="/summarizer" className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-[#1A237E] transition text-amber-600 hover:text-amber-700 font-medium">AI Summarizer</Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <div className="px-4 py-2 text-xs text-amber-600 font-medium bg-amber-50 rounded-lg mx-2 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 icn-f" />
                      <span>Unlock 30+ tools for free</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Premium Unified Avatar Dropdown (Always visible on desktop and mobile) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                className="relative flex items-center justify-center w-11 h-11 rounded-full focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                id="user-avatar-button"
              >
                {/* Lottie Profile Icon */}
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 via-[#FF6F00] to-orange-600 shadow-lg border-2 border-white/20 select-none flex items-center justify-center">
                  <LottiePlayer src="/lottie/profile.json" className="w-11 h-11" style={{ transform: 'scale(1.2)' }} />
                </div>
                
                {/* Online Status Indicator (🟢) */}
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#1A237E]"></span>
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 w-64 rounded-2xl bg-slate-950/90 backdrop-blur-xl text-white shadow-2xl border border-white/10 py-4 z-50 overflow-hidden"
                  >
                    {user ? (
                      <>
                        {/* Logged In: User Info & Menu */}
                        <div className="px-5 pb-3">
                          <div className="font-bold text-lg tracking-tight truncate text-white">{user.name}</div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-xs text-amber-400 font-medium tracking-wide">
                              {user.tier === 'DocuPDF Premium Pro' ? 'Premium Pro Plan' : 'Free Plan'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          </div>
                        </div>
                        <div className="border-t border-white/10 my-1 mx-5" />
                        <div className="px-2 py-2 space-y-1">
                          <Link href="/dashboard?tab=overview" onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition duration-150">
                            <UserIcon className="w-4 h-4 text-amber-400" />
                            <span>Profile</span>
                          </Link>
                          <Link href="/dashboard" onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition duration-150">
                            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                            <span>Dashboard</span>
                          </Link>
                          <Link href="/dashboard?tab=developer" onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition duration-150">
                            <Key className="w-4 h-4 text-emerald-400" />
                            <span>API Keys</span>
                          </Link>
                          <button onClick={() => { setIsProfileOpen(false); alert('Billing feature coming soon!'); }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition duration-150 text-left cursor-pointer">
                            <CreditCard className="w-4 h-4 text-[#FF6F00]" />
                            <span>Billing</span>
                          </button>
                        </div>
                        <div className="border-t border-white/10 my-1 mx-5" />
                        <div className="px-2 pt-2">
                          <button onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition duration-150 text-left cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Not Logged In: Login / Sign Up */}
                        <div className="px-5 pb-3">
                          <div className="font-bold text-lg tracking-tight truncate text-white">Welcome</div>
                          <div className="text-xs text-slate-400 mt-0.5">Sign in to access all features</div>
                        </div>
                        <div className="border-t border-white/10 my-1 mx-5" />
                        <div className="px-2 py-3 space-y-2">
                          <Link href="/login" onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition duration-150">
                            <UserIcon className="w-4 h-4" />
                            <span>Log in</span>
                          </Link>
                          <Link href="/signup" onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-[#FF6F00] hover:bg-amber-600 text-white transition duration-150">
                            <Sparkles className="w-4 h-4" />
                            <span>Sign up for Free Pro</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile tools drawer trigger button next to the Avatar */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION MENU (SLIDES IN FROM RIGHT) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 text-white shadow-2xl p-6 z-50 flex flex-col md:hidden"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <Image 
                    src="/myicon.png" 
                    alt="DocuPDF Logo" 
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold text-lg">DocuPDF</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              {/* User Identity on Mobile */}
              {user && (
                <div className="mb-6 p-4 bg-slate-800/60 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-base">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white truncate flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        <span className="text-[8px] bg-amber-500 text-slate-900 px-1 rounded font-bold">PRO</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col space-y-4 flex-grow">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tools</div>
                <Link 
                  href="/merge" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Merge PDF</span>
                </Link>
                <Link 
                  href="/split" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Split PDF</span>
                </Link>
                <Link 
                  href="/rotate" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Rotate PDF</span>
                </Link>
                <Link 
                  href="/delete-pages" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Delete Pages</span>
                </Link>
                <Link 
                  href="/summarizer" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span>AI Summarizer</span>
                </Link>
                <Link 
                  href="/blog" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Blog</span>
                  <span className="text-[8px] bg-amber-500 text-slate-900 px-1 rounded font-bold">NEW</span>
                </Link>

                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-1">Account</div>
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                      <span>Dashboard Workspace</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=history" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-800 transition"
                    >
                      <History className="w-5 h-5 text-indigo-400" />
                      <span>Activity Log</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-2.5 rounded-lg hover:bg-red-950/40 text-red-400 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link 
                      href="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition text-sm font-medium"
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl bg-[#FF6F00] hover:bg-amber-600 transition text-sm font-medium"
                    >
                      Sign up for Free Pro
                    </Link>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="mt-auto border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} DocuPDF. Made for developers and creators.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
