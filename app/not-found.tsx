'use client';

import Link from 'next/link';
import LottiePlayer from '@/components/LottiePlayer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <LottiePlayer
        src="/lottie/cat-404.json"
        className="w-72 h-72 sm:w-96 sm:h-96 mx-auto"
      />
      <h1 className="text-6xl font-bold text-slate-900 mt-4">404</h1>
      <p className="text-lg text-slate-500 mt-2 max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center px-6 py-3 bg-[#1A237E] text-white font-semibold rounded-xl hover:bg-[#283593] transition-colors duration-200 shadow-lg"
      >
        Go Back Home
      </Link>
    </div>
  );
}
