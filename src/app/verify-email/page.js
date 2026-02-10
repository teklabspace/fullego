'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { verifyEmail, resendVerificationEmail } from '@/utils/authApi';

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

export default function VerifyEmailPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Get verification token from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setVerificationToken(token);
        // Auto-verify if token is present
        handleVerify(token);
      }
    }
  }, []);

  const handleVerify = async token => {
    if (!token) {
      setError('Verification token is required');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await verifyEmail(token);
      setSuccess(true);
      setMessage(response.message || 'Email verified successfully!');
      setVerificationToken('');
    } catch (err) {
      setError(err.data?.detail || err.message || 'Email verification failed');
      setVerificationToken('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setMessage('');
    setIsResending(true);

    try {
      const response = await resendVerificationEmail(email);
      setMessage(response.message || 'Verification email sent successfully!');
    } catch (err) {
      setError(err.data?.detail || err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerify = e => {
    e.preventDefault();
    handleVerify(verificationToken);
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
              {success ? 'Email Verified!' : 'Verify Your Email'}
            </h1>
            <p className='text-gray-400 text-sm'>
              {success
                ? 'Your email has been successfully verified. You can now access all features.'
                : 'Please verify your email address to complete your registration'}
            </p>
          </div>

          {success ? (
            <div className='space-y-6'>
              <div className='bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm'>
                {message}
              </div>
              <button
                onClick={() => (window.location.href = '/login')}
                className='w-full bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                  {error}
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className='bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm'>
                  {message}
                </div>
              )}

              {/* Manual Token Verification */}
              <form onSubmit={handleManualVerify} className='space-y-6'>
                <div>
                  <label
                    htmlFor='token'
                    className='block text-white text-sm mb-2'
                  >
                    Verification Token
                  </label>
                  <input
                    type='text'
                    id='token'
                    value={verificationToken}
                    onChange={e => setVerificationToken(e.target.value)}
                    placeholder='Enter verification token from email'
                    className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                    required
                  />
                </div>

                <button
                  type='submit'
                  disabled={isLoading || !verificationToken}
                  className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              {/* Divider */}
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-800'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 text-gray-500 bg-[#0B0D12]'>or</span>
                </div>
              </div>

              {/* Resend Verification Email */}
              <div className='space-y-4'>
                <div>
                  <label htmlFor='email' className='block text-white text-sm mb-2'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='your@email.com'
                    className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>

                <button
                  type='button'
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className='w-full bg-transparent border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-normal py-3 rounded-full transition-colors'
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>

              <div className='text-center'>
                <a
                  href='/login'
                  className='text-gray-400 text-sm hover:text-white transition-colors'
                >
                  Back to Login
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Carousel */}
      <div className='hidden lg:flex w-1/2 items-center justify-center relative'>
        <div className='relative flex items-center justify-center py-12'>
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

