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

          const isEmailVerified = !!user?.is_email_verified;
          const isKYCVerified = !!user?.is_kyc_verified;

          if (isEmailVerified && isKYCVerified) {
            toast.success('Welcome back!');
            router.replace('/dashboard');
            return;
          }

          toast.info('Complete your profile setup to continue.');
          router.replace('/choose-profile');
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

        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('Backend did not return JSON callback response');
        }

        const data = await response.json();
        const exchangedAccessToken = data?.access_token;
        const exchangedRefreshToken = data?.refresh_token;
        const user = data?.user || {};

        if (!exchangedAccessToken || !exchangedRefreshToken) {
          throw new Error('Tokens missing from Google callback response');
        }

        localStorage.setItem('access_token', exchangedAccessToken);
        localStorage.setItem('refresh_token', exchangedRefreshToken);
        localStorage.setItem('user_info', JSON.stringify(user));

        const isEmailVerified = !!user.is_email_verified;
        const isKYCVerified = !!user.is_kyc_verified;

        // Product flow:
        // - Existing fully-verified users -> dashboard
        // - First-time or partially onboarded users -> choose profile / Persona
        if (isEmailVerified && isKYCVerified) {
          toast.success('Welcome back!');
          router.replace('/dashboard');
          return;
        }

        toast.info('Complete your profile setup to continue.');
        router.replace('/choose-profile');
      } catch (error) {
        // Fallback for backends that expect browser redirect handling instead of fetch
        setStatusText('Finalizing sign-in...');
        const redirectUrl = getGoogleCallbackUrl(searchParams);
        window.location.href = redirectUrl;
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

