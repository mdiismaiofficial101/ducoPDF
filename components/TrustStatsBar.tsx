'use client';

import React from 'react';

export default function TrustStatsBar() {
  return (
    <section 
      id="trust-and-stats-bar" 
      aria-label="Trust and Security Signals"
      className="relative w-full overflow-hidden border-t border-b border-white/10 select-none"
    >
      {/* Self-contained CSS for hardware-accelerated animated mesh gradient background */}
      <style jsx global>{`
        @keyframes subtle-mesh {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-mesh-gradient {
          background: linear-gradient(135deg, #09090b, #111115, #1d1233, #071f1e, #09090b);
          background-size: 300% 300%;
          animation: subtle-mesh 25s ease infinite;
          will-change: background-position;
        }
      `}</style>

      {/* Main glassmorphism container */}
      <div className="animate-mesh-gradient relative w-full py-8 md:py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        {/* Subtle glass reflection effect overlay */}
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[12px] pointer-events-none" />

        {/* Ambient lighting spots to add deep luster and high-end feel */}
        <div className="absolute top-0 left-1/3 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 items-center justify-center">
            
            {/* Trust Signal 1: Users */}
            <div 
              id="trust-signal-users"
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-3 text-indigo-400 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                25M+
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 leading-snug">
                Users Worldwide
              </span>
            </div>

            {/* Trust Signal 2: Rating */}
            <div 
              id="trust-signal-rating"
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                4.9 / 5
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 leading-snug">
                Customer Rating
              </span>
            </div>

            {/* Trust Signal 3: Encryption */}
            <div 
              id="trust-signal-encryption"
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02] col-span-2 md:col-span-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center mb-3 text-teal-400 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                256-Bit
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 leading-snug">
                Military Encryption
              </span>
            </div>

            {/* Trust Signal 4: Speed */}
            <div 
              id="trust-signal-speed"
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02] col-span-2 md:col-span-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-400 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                Instant
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 leading-snug">
                Lightning Fast Tools
              </span>
            </div>

            {/* Trust Signal 5: Languages */}
            <div 
              id="trust-signal-languages"
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02] col-span-2 md:col-span-2 lg:col-span-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                80+ Langs
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1 leading-snug">
                Global Accessibility
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
