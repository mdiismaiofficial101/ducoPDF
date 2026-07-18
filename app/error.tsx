'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        An unexpected error has occurred. We have logged the issue.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => reset()}
          className="bg-[#1A237E] hover:bg-indigo-800 text-white font-medium px-6 py-3 rounded-lg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-lg"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
