'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getKYCStatus, getKYCRejectionReason, KYC_STATUS } from '@/utils/kycApi';

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 60000;

function KycCompleteContent() {
  const router = useRouter();
  const [uiStatus, setUiStatus] = useState('loading');
  const [kycData, setKycData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [error, setError] = useState(null);
  const pollStartedAt = useRef(null);

  const loadRejectionReason = useCallback(async () => {
    try {
      const reason = await getKYCRejectionReason();
      setRejectionReason(reason?.reason || reason?.detail || reason);
    } catch {
      // Optional endpoint
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      if (cancelled) return;

      const elapsed = Date.now() - (pollStartedAt.current ?? Date.now());
      if (elapsed >= MAX_POLL_MS) {
        setUiStatus('pending');
        setError(
          'Verification is taking longer than expected. You can refresh or check back shortly.'
        );
        return;
      }

      try {
        setPollAttempt(prev => prev + 1);
        const kycStatus = await getKYCStatus();
        if (cancelled) return;

        setKycData(kycStatus);

        if (kycStatus.status === KYC_STATUS.APPROVED) {
          setUiStatus('approved');
          timeoutId = setTimeout(() => router.replace('/dashboard'), 1500);
          return;
        }

        if (kycStatus.status === KYC_STATUS.REJECTED) {
          setUiStatus('rejected');
          await loadRejectionReason();
          if (kycStatus.rejection_reason) {
            setRejectionReason(kycStatus.rejection_reason);
          }
          return;
        }

        if (kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
          setUiStatus('pending_review');
          return;
        }

        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        const message =
          err.data?.detail || err.message || 'Failed to check verification status';
        setError(message);
        setUiStatus('error');
      }
    };

    pollStartedAt.current = Date.now();
    poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, loadRejectionReason]);

  const handleRefresh = async () => {
    setError(null);
    setUiStatus('loading');
    pollStartedAt.current = Date.now();
    setPollAttempt(0);
    try {
      const kycStatus = await getKYCStatus();
      setKycData(kycStatus);
      if (kycStatus.status === KYC_STATUS.APPROVED) {
        setUiStatus('approved');
        router.replace('/dashboard');
      } else if (kycStatus.status === KYC_STATUS.REJECTED) {
        setUiStatus('rejected');
        if (kycStatus.rejection_reason) {
          setRejectionReason(kycStatus.rejection_reason);
        } else {
          await loadRejectionReason();
        }
      } else if (kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
        setUiStatus('pending_review');
      } else {
        setUiStatus('pending');
      }
    } catch (err) {
      setError(err.data?.detail || err.message || 'Failed to refresh status');
      setUiStatus('error');
    }
  };

  const handleRetry = () => {
    router.push('/kyc-verification');
  };

  if (uiStatus === 'loading') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <svg
            className='animate-spin h-12 w-12 text-[#F1CB68] mx-auto mb-6'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          <h1 className='text-white text-xl font-semibold mb-2'>
            Verifying your identity…
          </h1>
          <p className='text-gray-400 text-sm'>
            Please wait while we confirm your verification with Persona.
          </p>
          {pollAttempt > 0 && (
            <p className='text-gray-500 text-xs mt-3'>Checking status…</p>
          )}
        </div>
      </div>
    );
  }

  if (uiStatus === 'approved') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <h1 className='text-white text-2xl font-bold mb-2'>Verification approved</h1>
          <p className='text-gray-400 text-sm'>Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  if (uiStatus === 'pending_review' || uiStatus === 'pending') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md w-full'>
          <h1 className='text-white text-2xl font-bold mb-2'>Under review</h1>
          <p className='text-gray-400 text-sm mb-6'>
            {uiStatus === 'pending_review'
              ? 'Your identity verification is being reviewed. This usually takes 1–2 business days.'
              : 'Your verification is still processing. You can refresh status or return later.'}
          </p>
          {error && (
            <p className='text-yellow-400/90 text-sm mb-4'>{error}</p>
          )}
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              type='button'
              onClick={handleRefresh}
              className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Refresh status
            </button>
            <button
              type='button'
              onClick={() => router.push('/dashboard')}
              className='px-6 py-3 rounded-full font-semibold border border-[#F1CB68] text-[#F1CB68]'
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (uiStatus === 'rejected') {
    const reason =
      rejectionReason ||
      kycData?.rejection_reason ||
      'Your verification could not be completed. Please try again.';

    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md w-full'>
          <h1 className='text-white text-2xl font-bold mb-2'>Verification rejected</h1>
          <div className='bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 text-left'>
            <p className='text-gray-300 text-sm'>{reason}</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              type='button'
              onClick={handleRetry}
              className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Try again
            </button>
            <button
              type='button'
              onClick={() => router.push('/support')}
              className='px-6 py-3 rounded-full font-semibold border border-[#F1CB68] text-[#F1CB68]'
            >
              Contact support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
      <div className='text-center max-w-md w-full'>
        <h1 className='text-white text-xl font-semibold mb-2'>Something went wrong</h1>
        <p className='text-red-400 text-sm mb-6'>
          {error || 'We could not confirm your verification status.'}
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <button
            type='button'
            onClick={handleRefresh}
            className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            Try again
          </button>
          <button
            type='button'
            onClick={() => router.push('/dashboard')}
            className='px-6 py-3 rounded-full font-semibold border border-gray-600 text-gray-300'
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KycCompletePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center text-white'>
          Loading…
        </div>
      }
    >
      <KycCompleteContent />
    </Suspense>
  );
}
