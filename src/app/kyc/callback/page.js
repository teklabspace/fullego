'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getKYCStatus,
  getKYCRejectionReason,
  resubmitKYC,
  syncKYCStatus,
  KYC_STATUS,
} from '@/utils/kycApi';
import { getUserProfile } from '@/utils/authApi';

// Persona redirects here after the hosted inquiry finishes (same URL for pass
// and fail): /kyc/callback?inquiry-id=inq_xxx&status=completed
//
// The query params are a hint only — they're client-controlled and can arrive
// before the Persona webhook has processed the result. The real outcome is
// always confirmed against GET /kyc/status; if the webhook hasn't landed yet
// we poll, forcing one POST /kyc/sync-status refresh along the way.

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 60000;
// If the status still isn't terminal by this attempt, the webhook is likely
// lagging — force one backend refresh straight from Persona.
const SYNC_AFTER_ATTEMPTS = 2;

// Refresh the cached profile so the KYC gate (useAuth reads
// user_info.is_kyc_verified) lifts without a re-login.
const refreshStoredProfile = async () => {
  try {
    const profile = await getUserProfile();
    if (profile && (profile.role || 'is_kyc_verified' in profile)) {
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem('user_info'));
      } catch {
        /* ignore */
      }
      localStorage.setItem(
        'user_info',
        JSON.stringify({ ...(stored || {}), ...profile })
      );
    }
  } catch {
    // Non-fatal — useAuth re-fetches the profile on next mount anyway.
  }
};

function KycCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('inquiry-id');

  const [uiStatus, setUiStatus] = useState('checking');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [error, setError] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const startedAt = useRef(null);

  const loadRejectionReason = useCallback(async kycStatus => {
    if (kycStatus?.rejection_reason) {
      setRejectionReason(kycStatus.rejection_reason);
      return;
    }
    try {
      const reason = await getKYCRejectionReason();
      setRejectionReason(reason?.reason || reason?.detail || null);
    } catch {
      // Optional endpoint — the generic copy covers it.
    }
  }, []);

  useEffect(() => {
    // KYC endpoints are authenticated; Persona brings the user back in the
    // same browser, so the session should still be here. If not, sign in.
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    let timeoutId;
    let attempts = 0;
    let synced = false;

    const check = async () => {
      if (cancelled) return;

      const elapsed = Date.now() - (startedAt.current ?? Date.now());
      if (elapsed >= MAX_POLL_MS) {
        setUiStatus('pending');
        return;
      }

      try {
        attempts += 1;
        const kycStatus = await getKYCStatus();
        if (cancelled) return;

        if (kycStatus.status === KYC_STATUS.APPROVED) {
          await refreshStoredProfile();
          if (cancelled) return;
          setUiStatus('approved');
          timeoutId = setTimeout(() => router.replace('/dashboard'), 2000);
          return;
        }

        if (kycStatus.status === KYC_STATUS.REJECTED) {
          setUiStatus('rejected');
          await loadRejectionReason(kycStatus);
          return;
        }

        // in_progress / pending_review — usually just the webhook race.
        // Force one refresh from Persona, then keep polling; a genuine
        // manual review lands on the 'pending' screen at timeout.
        if (!synced && attempts >= SYNC_AFTER_ATTEMPTS) {
          synced = true;
          try {
            await syncKYCStatus();
          } catch {
            // Sync is best-effort; polling continues either way.
          }
        }
        timeoutId = setTimeout(check, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          router.replace('/login');
          return;
        }
        setError(
          err.data?.detail || err.message || 'Failed to check verification status'
        );
        setUiStatus('error');
      }
    };

    startedAt.current = Date.now();
    check();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, loadRejectionReason]);

  // Full reload re-runs the whole confirm cycle (poll + one sync) from zero.
  const handleRefresh = () => {
    window.location.reload();
  };

  // Contract: rejected users restart via POST /kyc/resubmit, then go back
  // through the verification flow with the fresh inquiry.
  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await resubmitKYC();
    } catch {
      // If resubmit fails (e.g. not in a resubmittable state) the
      // verification page still handles starting/continuing a flow.
    }
    router.push('/kyc-verification');
  };

  if (uiStatus === 'checking') {
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
            Finalizing your verification…
          </h1>
          <p className='text-gray-400 text-sm'>
            We&apos;re confirming your result with Persona. This usually takes a
            few seconds.
          </p>
          {inquiryId && (
            <p className='text-gray-600 text-xs mt-3 font-mono'>{inquiryId}</p>
          )}
        </div>
      </div>
    );
  }

  if (uiStatus === 'approved') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <div className='w-16 h-16 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center mx-auto mb-6'>
            <svg
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#4ADE80'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M20 6L9 17l-5-5' />
            </svg>
          </div>
          <h1 className='text-white text-2xl font-bold mb-2'>
            Identity verified
          </h1>
          <p className='text-gray-400 text-sm mb-6'>
            Your verification was approved. Taking you to your dashboard…
          </p>
          <button
            type='button'
            onClick={() => router.replace('/dashboard')}
            className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (uiStatus === 'rejected') {
    const reason =
      rejectionReason ||
      'Your identity could not be verified. Please try again with clearer documents.';

    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md w-full'>
          <div className='w-16 h-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto mb-6'>
            <svg
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#F87171'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </div>
          <h1 className='text-white text-2xl font-bold mb-2'>
            Verification unsuccessful
          </h1>
          <div className='bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 text-left'>
            <p className='text-gray-300 text-sm'>{reason}</p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              type='button'
              onClick={handleResubmit}
              disabled={resubmitting}
              className={`px-6 py-3 rounded-full font-semibold text-[#0B0D12] ${
                resubmitting ? 'opacity-60 cursor-wait' : ''
              }`}
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              {resubmitting ? 'Restarting…' : 'Try again'}
            </button>
            <button
              type='button'
              onClick={() => router.push('/support')}
              className='px-6 py-3 rounded-full font-semibold border border-[#F1CB68] text-[#F1CB68]'
            >
              Contact support
            </button>
          </div>
          {inquiryId && (
            <p className='text-gray-600 text-xs mt-4 font-mono'>{inquiryId}</p>
          )}
        </div>
      </div>
    );
  }

  if (uiStatus === 'pending') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
        <div className='text-center max-w-md w-full'>
          <h1 className='text-white text-2xl font-bold mb-2'>
            Verification in review
          </h1>
          <p className='text-gray-400 text-sm mb-6'>
            Your result is taking a little longer to confirm — some
            verifications need a manual review, which usually completes within
            1–2 business days. We&apos;ll notify you as soon as it&apos;s done;
            you can keep using the app in the meantime.
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
              Check again
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

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-4'>
      <div className='text-center max-w-md w-full'>
        <h1 className='text-white text-xl font-semibold mb-2'>
          Something went wrong
        </h1>
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

export default function KycCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center text-white'>
          Loading…
        </div>
      }
    >
      <KycCallbackContent />
    </Suspense>
  );
}
