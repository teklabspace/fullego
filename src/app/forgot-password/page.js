'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [currentSlide, setCurrentSlide] = useState(0);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = e => {
    e.preventDefault();
    console.log('Email:', email);
    // Send OTP to email
    setStep(2);
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpSubmit = e => {
    e.preventDefault();
    const otpCode = otp.join('');
    console.log('OTP:', otpCode);
    // Verify OTP and redirect
    window.location.href = '/reset-password';
  };

  const handleResend = () => {
    console.log('Resending OTP to:', email);
    setOtp(['', '', '', '']);
    inputRefs[0].current?.focus();
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

          {step === 1 ? (
            // Email Input Step
            <>
              <div className='mb-8'>
                <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
                  Forgot Password?
                </h1>
                <p className='text-gray-400 text-sm'>
                  Enter your email address and we'll send you a code to reset
                  your password
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className='space-y-6'>
                <div>
                  <label htmlFor='email' className='block text-white text-sm mb-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='hello@livia24@gmail.com'
                    className='w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                    required
                  />
                </div>

                <button
                  type='submit'
                  className='w-full bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
                >
                  Continue
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
            </>
          ) : (
            // OTP Verification Step
            <>
              <div className='mb-8'>
                <div className='w-16 h-16 bg-[#F1CB68] rounded-2xl flex items-center justify-center mb-6'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#0B0D12'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                    <circle cx='12' cy='10' r='3' />
                  </svg>
                </div>
                <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
                  OTP verification
                </h1>
                <p className='text-gray-400 text-sm'>
                  We've sent a 4 digit code to {email}
                  <br />
                  Not your email?{' '}
                  <button
                    onClick={() => setStep(1)}
                    className='text-[#F1CB68] hover:text-[#D6A738] transition-colors'
                  >
                    Change it
                  </button>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className='space-y-6'>
                {/* OTP Input */}
                <div className='flex gap-3 justify-center'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type='text'
                      inputMode='numeric'
                      maxLength='1'
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      className='w-16 h-16 bg-transparent border border-gray-700 rounded-2xl text-white text-2xl text-center focus:outline-none focus:border-[#F1CB68] transition-colors'
                    />
                  ))}
                </div>

                <button
                  type='submit'
                  className='w-full bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
                >
                  Submit
                </button>

                <div className='text-center'>
                  <span className='text-gray-400 text-sm'>
                    Didn't get the code?{' '}
                  </span>
                  <button
                    type='button'
                    onClick={handleResend}
                    className='text-[#F1CB68] text-sm hover:text-[#D6A738] transition-colors'
                  >
                    Resend
                  </button>
                </div>
              </form>
            </>
          )}
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


