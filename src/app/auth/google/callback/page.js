'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { API_BASE_PATH, API_BASE_URL } from '@/config/api';
import { getUserProfile } from '@/utils/authApi';
import { getRouteForOauthNext } from '@/utils/oauthNext';

function normalizeBaseUrl(url) {
  return (url || '').replace(/\/+$/, '');
}

function getGoogleCallbackUrl(params) {
  const base = normalizeBaseUrl(API_BASE_URL);
  const query = params.toString();
  return `${base}${API_BASE_PATH}/auth/google/callback${query ? `?${query}` : ''}`;
}

const USER_NOT_REGISTERED_MESSAGE = 'User not registered. Please sign up first.';
const DB_CONNECTION_ERROR_MESSAGE = 'Database connection error. Please try again later.';

function getClientSearchParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

function persistTokens(accessToken, refreshToken) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

function refreshUserProfileInBackground() {
  void getUserProfile()
    .then(user => {
      if (user) {
        localStorage.setItem('user_info', JSON.stringify(user));
      }
    })
    .catch(() => {});
}

function toastAndNavigate(router, destination, oauthNextHint) {
  const hint = (oauthNextHint ?? '').trim().toLowerCase();
  if (hint === 'dashboard' || (!hint && destination === '/dashboard')) {
    toast.success('Welcome back!');
  } else if (hint === 'persona_wait') {
    toast.info('Continue your identity verification to finish signing in.');
  } else if (hint === 'verify_email') {
    toast.info('Please verify your email to continue.');
  } else if (destination === '/') {
    toast.warning('Redirecting you to the home page.');
  }
  router.replace(destination);
}

/**
 * OAuth callback: read query string from window (not useSearchParams) so the route
 * never opts into Next.js CSR bailout / RSC Flight chunks that trigger
 * __webpack_modules__[moduleId] is not a function during prerender.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Completing Google sign-in...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const searchParams = getClientSearchParams();
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const code = searchParams.get('code');

      if (accessToken && refreshToken) {
        try {
          persistTokens(accessToken, refreshToken);
          refreshUserProfileInBackground();

          const oauthNextRaw = searchParams.get('oauth_next');
          const destination = getRouteForOauthNext(oauthNextRaw);
          toastAndNavigate(router, destination, oauthNextRaw ?? '');
          return;
        } catch (error) {
          console.error('Failed to finalize Google sign-in:', error);
          toast.error('Google sign-in failed. Please try again.');
          router.replace('/login');
          return;
        }
      }

      if (!code) {
        toast.error('Google sign-in failed: missing authorization code.');
        router.replace('/login');
        return;
      }

      try {
        const callbackUrl = getGoogleCallbackUrl(searchParams);
        const response = await fetch(callbackUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const detail = data?.detail || 'Google sign-in failed. Please try again.';

          if (detail === USER_NOT_REGISTERED_MESSAGE) {
            toast.warning(detail);
            setStatusText('Redirecting to sign up...');
            setTimeout(() => {
              router.replace('/signup');
            }, 2000);
            return;
          }

          if (detail === DB_CONNECTION_ERROR_MESSAGE) {
            toast.error(detail);
            setStatusText('Sign-in is temporarily unavailable. Please try again later.');
            return;
          }

          toast.error(detail);
          setStatusText('Google sign-in failed.');
          return;
        }

        if (!isJson || !data) {
          throw new Error('Backend did not return JSON callback response');
        }

        const exchangedAccessToken = data?.access_token;
        const exchangedRefreshToken = data?.refresh_token;

        if (!exchangedAccessToken || !exchangedRefreshToken) {
          throw new Error('Tokens missing from Google callback response');
        }

        persistTokens(exchangedAccessToken, exchangedRefreshToken);
        if (data?.user) {
          localStorage.setItem('user_info', JSON.stringify(data.user));
        } else {
          refreshUserProfileInBackground();
        }

        const oauthNextRaw =
          typeof data?.oauth_next === 'string' ? data.oauth_next : '';
        const destination = getRouteForOauthNext(oauthNextRaw);
        toastAndNavigate(router, destination, oauthNextRaw);
      } catch (error) {
        console.error('Google callback processing failed:', error);
        toast.error('Google sign-in failed. Please try again.');
        setStatusText('Google sign-in failed. Please try again.');
      }
    };

    handleGoogleCallback();
  }, [router]);

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-6'>
      <div className='w-full max-w-md border border-gray-800 rounded-2xl p-8 text-center bg-[#11141C]'>
        <h1 className='text-white text-2xl font-semibold mb-3'>Google Sign-In</h1>
        <p className='text-gray-400 text-sm'>{statusText}</p>
      </div>
    </div>
  );
}
