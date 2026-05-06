'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register } from '@/utils/authApi';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { API_BASE_URL, API_BASE_PATH } from '@/config/api';

const carouselSlides = [
  {
    title: 'Smarter Wealth.',
    subtitle: 'Seamless Control.',
    image:
      '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__820 1.png',
  },
  {
    title: 'Unified Wealth',
    subtitle: 'Management.',
    image:
      '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__823-removebg-preview_upscaled (1) 1.png',
  },
  {
    title: 'Smart Portfolio',
    subtitle: 'Optimization.',
    image:
      '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__90775 1.png',
  },
];

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const firstParam = searchParams.get('first_name');
    const lastParam = searchParams.get('last_name');
    const oauthParam = searchParams.get('oauth');

    if (emailParam) setEmail(emailParam);
    if (firstParam) setFirstName(firstParam);
    if (lastParam) setLastName(lastParam);

    if (emailParam || firstParam || lastParam || oauthParam) {
      router.replace('/signup', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_verification_email', email);
      }

      window.location.href = '/forgot-password?verify=true';
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.status === 409) {
        errorMessage =
          'An account with this email already exists. Please login instead.';
      } else if (err.status === 400) {
        errorMessage =
          err.data?.detail ||
          'Invalid information provided. Please check your details.';
      } else if (err.status === 422) {
        errorMessage =
          err.data?.detail || 'Please provide valid information.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.status === 0 || err.message === 'Failed to fetch') {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (err.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleGoogleLogin = () => {
    try {
      const base = API_BASE_URL.replace(/\/+$/, '');
      const path = `${API_BASE_PATH}/auth/google/login`.replace(/^\/+/, '/');
      const googleAuthUrl = `${base}${path}`;
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error('Google login redirect failed:', err);
      toast.error('Unable to start Google sign-in. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] flex flex-col lg:flex-row'>
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12'>
        <div className='w-full max-w-md'>
          <div className='flex items-center gap-2 mb-12'>
            <div className='w-10 h-10 bg-[#F1CB68] rounded-lg flex items-center justify-center'>
              <span className='text-[#0B0D12] text-xl font-bold'>F</span>
            </div>
            <span className='text-white text-xl font-semibold'>Akunuba</span>
          </div>

          <div className='mb-8'>
            <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
              Create your account
            </h1>
            <p className='text-gray-400 text-sm'>
              Sign up to start your journey at Akunuba
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor='firstName'
                className='block text-white text-sm mb-2'
              >
                First Name
              </label>
              <input
                type='text'
                id='firstName'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder='John'
                className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>

            <div>
              <label
                htmlFor='lastName'
                className='block text-white text-sm mb-2'
              >
                Last Name
              </label>
              <input
                type='text'
                id='lastName'
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder='Doe'
                className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>

            <div>
              <label htmlFor='email' className='block text-white text-sm mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>

            <div>
              <label
                htmlFor='phone'
                className='block text-white text-sm mb-2'
              >
                Phone Number
              </label>
              <input
                type='tel'
                id='phone'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder='+1 (555) 000-0000'
                className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-white text-sm mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(prev => !prev)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='remember'
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className='w-4 h-4 rounded border-gray-700 bg-transparent focus:ring-[#F1CB68] focus:ring-offset-0'
              />
              <label
                htmlFor='remember'
                className='ml-2 text-gray-400 text-sm'
              >
                Remember me
              </label>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type='button'
              onClick={handleSignIn}
              className='w-full bg-transparent border border-gray-700 hover:border-gray-600 text-white font-normal py-3 rounded-full transition-colors'
            >
              Sign In
            </button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-800' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 text-gray-500 bg-[#0B0D12]'>
                  or continue with
                </span>
              </div>
            </div>

            <button
              type='button'
              onClick={handleGoogleLogin}
              className='w-full bg-transparent border border-gray-700 hover:border-gray-600 text-white font-normal py-3 rounded-full transition-colors flex items-center justify-center gap-3'
            >
              <svg width='20' height='20' viewBox='0 0 20 20'>
                <path
                  d='M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z'
                  fill='#4285F4'
                />
                <path
                  d='M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z'
                  fill='#34A853'
                />
                <path
                  d='M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z'
                  fill='#FBBC05'
                />
                <path
                  d='M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z'
                  fill='#EA4335'
                />
              </svg>
              Google
            </button>
          </form>
        </div>
      </div>

      <div className='hidden lg:flex w-full lg:w-1/2 items-center justify-center p-12'>
        <div className='relative w-[580px] h-[784px] border-0 overflow-hidden rounded-[24px]'>
          <div
            className='absolute inset-0'
            style={{
              background: 'rgba(40, 40, 45, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          />
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className='relative w-full h-full flex items-center justify-center'>
                <Image
                  src={slide.image}
                  alt={`${slide.title} ${slide.subtitle}`}
                  width={100}
                  height={100}
                  className='object-contain w-full h-full'
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

