'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { resetPassword } from '@/utils/authApi';

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

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Get reset token from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
      } else {
        // If no token in URL, check if it was stored (e.g., from forgot-password flow)
        const storedToken = sessionStorage.getItem('reset_token');
        if (storedToken) {
          setResetToken(storedToken);
        }
      }
    }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!resetToken) {
      setError('Reset token is missing. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(resetToken, password);
      // Clear stored token
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('reset_token');
      }
      // Only redirect on success
      window.location.href = '/login';
    } catch (err) {
      setError(err.data?.detail || err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] flex flex-col lg:flex-row'>
      {/* Left Side - Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12'>
        <div className='w-full max-w-md'>
          {/* Logo */}
          <div className='flex items-center gap-2 mb-12'>
            <div className='w-10 h-10 bg-[#F1CB68] rounded-lg flex items-center justify-center'>
              <span className='text-[#0B0D12] text-xl font-bold'>F</span>
            </div>
            <span className='text-white text-xl font-semibold'>Akunuba</span>
          </div>

          {/* Form Header */}
          <div className='mb-8'>
            <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
              Reset Password
            </h1>
            <p className='text-gray-400 text-sm'>
              Create a new password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Error Message */}
            {error && (
              <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                {error}
              </div>
            )}

            {!resetToken && (
              <div className='bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-xl text-sm'>
                No reset token found. Please use the link from your email or request a new password reset.
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-white text-sm mb-2'
              >
                New Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='********'
                  className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  required
                  minLength={8}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    {showPassword ? (
                      <>
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                        <line x1='1' y1='1' x2='23' y2='23' />
                      </>
                    ) : (
                      <>
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-white text-sm mb-2'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='********'
                  className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  required
                  minLength={8}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    {showConfirmPassword ? (
                      <>
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                        <line x1='1' y1='1' x2='23' y2='23' />
                      </>
                    ) : (
                      <>
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className='text-xs text-gray-400'>
              <p>Password must contain:</p>
              <ul className='list-disc list-inside mt-1 space-y-1'>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            {/* Reset Button */}
            <button
              type='submit'
              disabled={isLoading || !resetToken}
              className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className='text-center'>
              <a
                href='/login'
                className='text-gray-400 text-sm hover:text-white transition-colors'
              >
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Carousel */}
      <div className='hidden lg:flex w-1/2 items-center justify-center relative'>
        <div className='relative flex items-center justify-center py-12'>
          {/* Carousel Container - Simplified Square Design */}
          <div
            className='relative w-[580px] h-[784px] border-0 overflow-hidden rounded-[24px]'
            style={{
              background: 'rgba(40, 40, 45, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Carousel Images */}
            {carouselSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className='relative w-full h-full flex items-center justify-center px-12'>
                  <Image
                    src={slide.image}
                    alt={`${slide.title} ${slide.subtitle}`}
                    width={600}
                    height={600}
                    className='object-contain w-full h-auto max-h-[600px]'
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}

            {/* Bottom gradient overlay */}
            <div
              className='absolute bottom-0 left-0 right-0 h-[280px] pointer-events-none'
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 100%)',
              }}
            />

            {/* Text Overlay */}
            <div className='absolute bottom-20 left-6 right-6 z-10'>
              <h2 className='text-white font-bold text-[48px] leading-[1.3] tracking-[-0.02em]'>
                {carouselSlides[currentSlide].title}
              </h2>
              <h2 className='text-white font-bold text-[48px] leading-[1.3] tracking-[-0.02em]'>
                {carouselSlides[currentSlide].subtitle}
              </h2>
            </div>

            {/* Carousel Indicators */}
            <div className='absolute bottom-6 left-6 flex items-center gap-3 z-20'>
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'w-4 h-4 bg-white'
                      : 'w-4 h-4 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


