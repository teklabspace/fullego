'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getKYCStatus,
  getKYCRejectionReason,
  resubmitKYC,
  KYC_STATUS,
} from '@/utils/kycApi';
import { getUserProfile } from '@/utils/authApi';
import { getStoredUser } from '@/utils/permissions';
import { resolveOnboardingRoute } from '@/utils/onboarding';

// Persona redirects the browser here after the hosted inquiry finishes and
// appends its own query params (inquiry-id, reference-id, status). We ignore
// all of them: they're client-controlled and a user could edit them. The only
// source of truth is GET /kyc/status, which reads the result from Persona
// server-side, so a single fetch is enough — no polling, no delay.

// Refresh the cached profile so the KYC gate (useAuth and resolveOnboardingRoute
// read user_info.is_kyc_verified) lifts without a re-login. Note is_verified is
// NOT the KYC signal — it's true for a merely email-verified user.
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

// After approval, hand the user to the step they still owe: checkout when a
// plan was pre-picked (pendingPlan), the plan picker otherwise, dashboard for
// staff and existing subscribers. resolveOnboardingRoute is the single source
// of truth for that order.
const destinationAfterApproval = async () => {
  await refreshStoredProfile();
  try {
    return (await resolveOnboardingRoute(getStoredUser())) || '/dashboard';
  } catch {
    return '/dashboard';
  }
};

// IN_PROGRESS means Persona hasn't finalized the inquiry yet; it's a pending
// state, never an error. NOT_STARTED/EXPIRED shouldn't reach this page, but a
// pending screen with a refresh is a safer landing than an error.
const uiStateFor = status => {
  switch (status) {
    case KYC_STATUS.APPROVED:
      return 'approved';
    case KYC_STATUS.REJECTED:
      return 'rejected';
    case KYC_STATUS.PENDING_REVIEW:
      return 'pending_review';
    default:
      return 'pending';
  }
};

export default function KycCompletePage() {
  const router = useRouter();
  const [uiStatus, setUiStatus] = useState('loading');
  const [kycData, setKycData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [error, setError] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);

  const checkStatus = useCallback(async () => {
    setError(null);
    setUiStatus('loading');

    try {
      const kyc = await getKYCStatus();
      setKycData(kyc);
      const next = uiStateFor(kyc.status);

      if (next === 'rejected') {
        // /kyc/status carries no rejection_reason, so this second call is the
        // only way to get one. It 400s unless status is exactly `rejected`,
        // which is why it lives in this branch and nowhere else.
        try {
          const detail = await getKYCRejectionReason();
          setRejectionReason(detail?.reason || detail?.detail || null);
        } catch {
          // Generic copy covers it.
        }
        setUiStatus('rejected');
        return;
      }

      if (next === 'approved') {
        setUiStatus('approved');
        router.replace(await destinationAfterApproval());
        return;
      }

      setUiStatus(next);
    } catch (err) {
      if (err.status === 401) {
        router.replace('/login');
        return;
      }
      setError(
        err.data?.detail || err.message || 'Failed to check verification status'
      );
      setUiStatus('error');
    }
  }, [router]);

  useEffect(() => {
    // KYC endpoints are authenticated; Persona returns the user in the same
    // browser, so the session should still be here. If not, sign in.
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.replace('/login');
      return;
    }
    checkStatus();
  }, [router, checkStatus]);

  // Contract: POST /kyc/resubmit 400s unless status is exactly `rejected`, so
  // it's only ever reachable from the rejected screen. On success it mints a
  // fresh Persona inquiry and returns the verification_url — that URL is the
  // ONLY way back into the flow, so never swallow a failure here and route on
  // regardless; that walks the user into a dead end with no inquiry.
  const handleRetry = async () => {
    setResubmitting(true);
    try {
      const res = await resubmitKYC();
      if (res?.verification_url) {
        window.location.href = res.verification_url;
        return;
      }
      setError('Could not start a new verification. Please contact support.');
      setUiStatus('error');
    } catch (err) {
      setError(
        err.data?.detail ||
          err.message ||
          'Could not restart verification. Please contact support.'
      );
      setUiStatus('error');
    } finally {
      setResubmitting(false);
    }
  };

  // in_progress means Persona has an open inquiry; reuse the URL already on the
  // /kyc/status response rather than minting a new one.
  const resumeUrl =
    kycData?.status === KYC_STATUS.IN_PROGRESS ? kycData?.verification_url : null;

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
          <p className='text-gray-400 text-sm'>Taking you to the next step…</p>
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
              ? 'We’re reviewing your documents. We’ll email you as soon as it’s done — this usually takes 1–2 business days.'
              : 'Your verification is still processing. You can refresh the status or come back later.'}
          </p>
          {error && <p className='text-yellow-400/90 text-sm mb-4'>{error}</p>}
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Continue verification
              </a>
            ) : (
              <button
                type='button'
                onClick={checkStatus}
                className='px-6 py-3 rounded-full font-semibold text-[#0B0D12]'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Refresh status
              </button>
            )}
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
      'Your verification could not be completed. Please try again with clearer documents.';

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
              onClick={handleRetry}
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
            onClick={checkStatus}
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
