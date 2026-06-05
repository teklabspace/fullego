'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/** Legacy path — Persona redirect URI is /kyc/complete */
function VerificationCompleteRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/kyc/complete${qs ? `?${qs}` : ''}`);
  }, [router, searchParams]);

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center text-gray-400 text-sm'>
      Redirecting…
    </div>
  );
}

export default function VerificationCompletePage() {
  return (
    <Suspense fallback={null}>
      <VerificationCompleteRedirect />
    </Suspense>
  );
}
