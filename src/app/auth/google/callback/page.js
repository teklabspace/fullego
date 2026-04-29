'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { API_BASE_PATH, API_BASE_URL } from '@/config/api';
import { getUserProfile } from '@/utils/authApi';

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

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState('Completing Google sign-in...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const code = searchParams.get('code');

      // Preferred contract: backend redirects here with access/refresh tokens.
      if (accessToken && refreshToken) {
        try {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          let user = null;
          try {
            user = await getUserProfile();
          } catch (profileError) {
            console.warn('Could not fetch user profile after Google sign-in:', profileError);
          }

          if (user) {
            localStorage.setItem('user_info', JSON.stringify(user));
          }

          toast.success('Welcome back!');
          router.replace('/dashboard');
          return;
        } catch (error) {
          console.error('Failed to finalize Google sign-in:', error);
          toast.error('Google sign-in failed. Please try again.');
          router.replace('/login');
          return;
        }
      }

      // Fallback contract: callback arrives with Google code and needs backend exchange.
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

        localStorage.setItem('access_token', exchangedAccessToken);
        localStorage.setItem('refresh_token', exchangedRefreshToken);
        if (data?.user) {
          localStorage.setItem('user_info', JSON.stringify(data.user));
        }

        toast.success('Welcome back!');
        router.replace('/dashboard');
      } catch (error) {
        console.error('Google callback processing failed:', error);
        toast.error('Google sign-in failed. Please try again.');
        setStatusText('Google sign-in failed. Please try again.');
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center p-6'>
      <div className='w-full max-w-md border border-gray-800 rounded-2xl p-8 text-center bg-[#11141C]'>
        <h1 className='text-white text-2xl font-semibold mb-3'>Google Sign-In</h1>
        <p className='text-gray-400 text-sm'>{statusText}</p>
      </div>
    </div>
  );
}

