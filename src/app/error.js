'use client';

import ErrorPage from '@/components/error/ErrorPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#101014] flex flex-col items-center justify-center p-6 gap-4">
      <ErrorPage
        title="Oops!"
        buttonText="Take me Home"
        onAction={() => router.push('/')}
      />
      {typeof reset === 'function' && (
        <button
          type="button"
          onClick={reset}
          className="px-6 py-2 rounded-full text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
