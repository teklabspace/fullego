import { Suspense } from 'react';
import GoogleCallbackClient from './GoogleCallbackClient';

function GoogleCallbackFallback() {
  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-6'>
      <div className='w-full max-w-md border border-gray-800 rounded-2xl p-8 text-center bg-[#11141C]'>
        <h1 className='text-white text-2xl font-semibold mb-3'>Google Sign-In</h1>
        <p className='text-gray-400 text-sm'>Completing Google sign-in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackFallback />}>
      <GoogleCallbackClient />
    </Suspense>
  );
}
