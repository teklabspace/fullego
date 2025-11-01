'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    // Log signin data
    console.log('Login Data:', { email, password, rememberMe });
    // Redirect to dashboard or home
    window.location.href = '/dashboard';
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
            <span className='text-white text-xl font-semibold'>Fullego</span>
          </div>

          {/* Form Header */}
          <div className='mb-8'>
            <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
              Welcome back
            </h1>
            <p className='text-gray-400 text-sm'>
              Sign in to continue your journey at Fullego
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
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
              className='w-full bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
            >
              Get Started
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
        </div>
      </div>

      {/* Right Side - Space for Image */}
      <div className='hidden lg:flex w-1/2 items-center justify-center relative bg-gradient-to-br from-gray-900/50 to-gray-800/50'>
        <div className='text-center text-gray-500'>
          <img src='/loginpagerightimage.png' alt='Login Illustration' />
        </div>
      </div>
    </div>
  );
}
