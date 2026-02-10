'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/utils/authApi';
import { toast } from 'react-toastify';

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

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // First login attempt (without totp_code)
      const response = await login(email, password);
      console.log('Login response:', response);
      
      // Check if 2FA is required
      if (response.requires_2fa) {
        // Store temp token if provided (for potential future use)
        if (response.temp_token) {
          setTempToken(response.temp_token);
        }
        // Show 2FA input screen
        setRequires2FA(true);
        setIsLoading(false);
        return;
      }
      
      // No 2FA required - proceed with normal login flow
      await handleLoginSuccess(response);
    } catch (err) {
      // Don't reveal if 2FA is enabled for security (generic error message)
      const errorMessage = err.data?.detail || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate: 6-digit TOTP code or 8-character backup code
    if (!twoFactorCode || (twoFactorCode.length !== 6 && twoFactorCode.length !== 8)) {
      setError('Please enter a valid 6-digit code or 8-character backup code');
      return;
    }

    setIsLoading(true);

    try {
      // Call login again with totp_code parameter (as per backend documentation)
      // Backend accepts both TOTP codes (6 digits) and backup codes (8 characters)
      const response = await login(email, password, twoFactorCode);
      
      // Check if still requires 2FA (invalid code)
      if (response.requires_2fa) {
        setError('Invalid code. Please check and try again.');
        toast.error('Invalid code. Please check and try again.');
        setIsLoading(false);
        // Clear the input for retry
        setTwoFactorCode('');
        return;
      }
      
      // 2FA verified - proceed with login
      await handleLoginSuccess(response);
    } catch (err) {
      // Generic error message for security (don't reveal if it's a code issue or password issue)
      const errorMessage = err.data?.detail || err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      // Clear the input for retry
      setTwoFactorCode('');
    }
  };

  // Handle successful login (common logic for both 2FA and non-2FA)
  const handleLoginSuccess = async (response) => {
    // Get user verification status from response
    const user = response.user || {};
    const isEmailVerified = user.is_email_verified || false;
    const isKYCVerified = user.is_kyc_verified || false;
    const isVerified = user.is_verified || false;
    
    console.log('User verification status:', {
      isEmailVerified,
      isKYCVerified,
      isVerified,
      role: user.role,
    });
    
    // Redirect based on verification status
    if (isEmailVerified && isKYCVerified) {
      // Both verified - go to dashboard
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else if (isEmailVerified && !isKYCVerified) {
      // Email verified but KYC not - go to profile selection and Persona verification
      toast.info('Please complete your KYC verification');
      router.push('/choose-profile');
    } else {
      // Neither verified - redirect to signup to complete account setup
      toast.warning('Please verify your email and complete account setup');
      router.push('/signup');
    }
    
    setIsLoading(false);
  };

  // Go back to email/password form
  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setTempToken(null);
    setError('');
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth
    console.log('Google login');
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
              Welcome back
            </h1>
            <p className='text-gray-400 text-sm'>
              Sign in to continue your journey at Akunuba
            </p>
          </div>

          {/* Form */}
          {!requires2FA ? (
            <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Error Message */}
            {error && (
              <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor='email' className='block text-white text-sm mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='johnadams@gmail.com'
                className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                required
              />
            </div>

            {/* Password Field */}
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
                  placeholder='********'
                  className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  required
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

            {/* Remember Me and Forgot Password */}
            <div className='flex items-center justify-between'>
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
              <a
                href='/forgot-password'
                className='text-[#F1CB68] text-sm hover:text-[#D6A738] transition-colors'
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
            >
              {isLoading ? 'Signing in...' : 'Get Started'}
            </button>

            {/* Create Account Button */}
            <button
              type='button'
              onClick={() => (window.location.href = '/signup')}
              className='w-full bg-transparent border border-gray-700 hover:border-gray-600 text-white font-normal py-3 rounded-full transition-colors'
            >
              Create Account
            </button>

            {/* Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-800'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 text-gray-500 bg-[#0B0D12]'>
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
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
          ) : (
            <form onSubmit={handle2FAVerify} className='space-y-6'>
              {/* 2FA Header */}
              <div className='mb-6'>
                <button
                  type='button'
                  onClick={handleBackToLogin}
                  className='mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm'
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <line x1='19' y1='12' x2='5' y2='12' />
                    <polyline points='12 19 5 12 12 5' />
                  </svg>
                  Back to login
                </button>
                <h2 className='text-white text-2xl font-semibold mb-2'>
                  Two-Factor Authentication
                </h2>
                <p className='text-gray-400 text-sm'>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                  {error}
                </div>
              )}

              {/* 2FA Code Input */}
              <div>
                <label htmlFor='2fa-code' className='block text-white text-sm mb-2'>
                  Authentication Code
                </label>
                <input
                  type='text'
                  id='2fa-code'
                  inputMode='numeric'
                  pattern='[0-9]{6,8}'
                  value={twoFactorCode}
                  onChange={(e) => {
                    // Allow 6-digit TOTP codes or 8-character backup codes
                    const value = e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
                    setTwoFactorCode(value);
                    setError('');
                  }}
                  placeholder='000000'
                  maxLength={8}
                  autoFocus
                  autoComplete='one-time-code'
                  className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors text-center text-2xl font-mono tracking-widest'
                  required
                />
                <div className='mt-2 space-y-1'>
                  <p className='text-gray-500 text-xs text-center'>
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <p className='text-gray-600 text-xs text-center'>
                    Or use an 8-character backup code if you lost your device
                  </p>
                </div>
              </div>

              {/* Verify Button */}
              <button
                type='submit'
                disabled={isLoading || (twoFactorCode.length !== 6 && twoFactorCode.length !== 8)}
                className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              {/* Help Link */}
              <div className='text-center'>
                <button
                  type='button'
                  className='text-gray-500 hover:text-gray-400 text-xs transition-colors'
                  onClick={() => {
                    // Could link to support or show help modal
                    toast.info('If you lost your device, use a backup code or contact support');
                  }}
                >
                  Lost your device?
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Carousel (Desktop Only) */}
      <div className='hidden lg:flex w-1/2 items-center justify-center relative'>
        <div className='relative flex items-center justify-center h- py-12'>
          {/* Header Badge - Positioned Above Container */}
          <div className='absolute top-12  -translate-x-1/2 z-30'>
            <div className='relative flex items-center justify-center'>
              {/* Badge with border */}
              <div className='px-8 py-4 mt-1 border z-10 bg-[#0B0D12] border-white/10 rounded-[90px]'>
                <p className='text-white text-[18px] font-normal whitespace-nowrap'>
                  Your Personalized Wealth Hub
                </p>
              </div>
              <div className='px-8 absolute w-[364px] h-[80px] left-0 top-0 py-4 border-0 bg-[#0B0D12] border-white/10 rounded-r-[52px]'></div>
            </div>
          </div>

          {/* Carousel Container */}
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
                <div className='relative w-full h-full flex items-center justify-center '>
                  <Image
                    src={slide.image}
                    alt={`${slide.title} ${slide.subtitle}`}
                    width={100}
                    height={100}
                    className='object-contain w-full h-full '
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
