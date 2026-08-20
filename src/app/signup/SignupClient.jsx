'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register } from '@/utils/authApi';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { isValidationError, fieldErrorsFromError } from '@/utils/apiError';
import useFormValidation from '@/hooks/useFormValidation';
import { COMMON_SPECS } from '@/utils/validation';

// Keyed snake_case to match the backend's 422 envelope, so per-field messages
// from the API merge into the same slots the client-side rules write to.
const SIGNUP_SPECS = {
  first_name: COMMON_SPECS.firstName,
  last_name: COMMON_SPECS.lastName,
  email: COMMON_SPECS.email,
  phone: COMMON_SPECS.phone,
  password: COMMON_SPECS.password,
};

const SIGNUP_INITIAL = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
};

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
  const [rememberMe, setRememberMe] = useState(false);

  // Sanitises on every keystroke (digits can't be typed into the name fields,
  // letters can't be typed into the phone) and validates on blur + submit.
  const form = useFormValidation(SIGNUP_SPECS, SIGNUP_INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // A field's message shows once it has been blurred, submitted, or returned in
  // a 422 envelope — never while it is being filled in for the first time.
  const fieldError = form.errorFor;

  const inputClass = hasError =>
    `w-full bg-transparent border ${
      hasError ? 'border-red-500' : 'border-gray-700'
    } rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors`;

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const firstParam = searchParams.get('first_name');
    const lastParam = searchParams.get('last_name');
    const oauthParam = searchParams.get('oauth');

    // Shared-asset links prefill the email only. No claim context is needed:
    // share grants are keyed by email server-side and VERIFYING the email is
    // the claim — the asset then shows up under GET /assets/shared-with-me.
    // Prefills go through setValue so a name arriving from an OAuth callback is
    // sanitised the same way a typed one is.
    if (emailParam) form.setValue('email', emailParam);
    if (firstParam) form.setValue('first_name', firstParam);
    if (lastParam) form.setValue('last_name', lastParam);

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

    // Every field is checked against the same rules the API enforces, so the
    // round-trip is only spent on things the client genuinely cannot know
    // (duplicate email, rate limits).
    if (!form.validateAll()) {
      setError('Please correct the highlighted fields');
      return;
    }

    setIsLoading(true);
    const { first_name, last_name, email, phone, password } = form.values;

    try {
      await register({
        email: email.trim(),
        password,
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        phone: phone.trim(),
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_verification_email', email.trim());
      }

      window.location.href = '/forgot-password?verify=true';
    } catch (err) {
      // Field-level validation → show messages inline under each input.
      if (isValidationError(err)) {
        form.setServerErrors(fieldErrorsFromError(err));
      }

      // Top banner — the backend message is now user-friendly; only special-case
      // the conflict and network cases for clearer guidance.
      let errorMessage;
      if (err.status === 409) {
        errorMessage =
          'An account with this email already exists. Please login instead.';
      } else if (err.isNetworkError || err.message === 'Failed to fetch') {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'Registration failed. Please try again.';
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
                First Name <span className='text-[#F1CB68]'>*</span>
              </label>
              <input
                type='text'
                id='firstName'
                {...form.fieldProps('first_name')}
                placeholder='John'
                className={inputClass(fieldError('first_name'))}
              />
              {fieldError('first_name') && (
                <p className='text-xs text-red-400 mt-1'>{fieldError('first_name')}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='lastName'
                className='block text-white text-sm mb-2'
              >
                Last Name <span className='text-[#F1CB68]'>*</span>
              </label>
              <input
                type='text'
                id='lastName'
                {...form.fieldProps('last_name')}
                placeholder='Doe'
                className={inputClass(fieldError('last_name'))}
              />
              {fieldError('last_name') && (
                <p className='text-xs text-red-400 mt-1'>{fieldError('last_name')}</p>
              )}
            </div>

            <div>
              <label htmlFor='email' className='block text-white text-sm mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                {...form.fieldProps('email')}
                placeholder='you@example.com'
                className={inputClass(fieldError('email'))}
              />
              {fieldError('email') && (
                <p className='text-xs text-red-400 mt-1'>{fieldError('email')}</p>
              )}
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
                {...form.fieldProps('phone')}
                placeholder='+1 (555) 000-0000'
                className={inputClass(fieldError('phone'))}
              />
              {fieldError('phone') && (
                <p className='text-xs text-red-400 mt-1'>{fieldError('phone')}</p>
              )}
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
                  {...form.fieldProps('password')}
                  placeholder='Enter your password'
                  className={`${inputClass(fieldError('password'))} pr-10`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(prev => !prev)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldError('password') && (
                <p className='text-xs text-red-400 mt-1'>{fieldError('password')}</p>
              )}
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

