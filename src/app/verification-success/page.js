'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerificationSuccessPage() {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden'>
      {/* Logo */}
      <div className='absolute top-6 md:top-8 flex items-center gap-2'>
        <div className='w-8 h-8 md:w-10 md:h-10 bg-[#F1CB68] rounded-lg flex items-center justify-center'>
          <span className='text-[#0B0D12] text-lg md:text-xl font-bold'>F</span>
        </div>
        <span className='text-white text-lg md:text-xl font-semibold'>
          Fullego
        </span>
      </div>

      {/* Main Content */}
      <div className='flex flex-col mt-20 items-center justify-center max-w-md w-full'>
        {/* Success Title */}
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 md:mb-6'>
          You're Now Verified
        </h1>

        {/* Radar Animation */}
        <div className='relative w-full  max-w-[400px] aspect-square my-8 md:my-12 flex items-center justify-center'>
          {/* Animated Radar Circles */}
          <div className='absolute inset-0 flex items-center justify-center'>
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`absolute rounded-full border border-[#F1CB68]/30 transition-all duration-1000 ${
                  animate ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  width: `${(index + 1) * 20}%`,
                  height: `${(index + 1) * 20}%`,
                  animation: animate
                    ? `radar-pulse ${2 + index * 0.3}s ease-out infinite`
                    : 'none',
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Grid Lines */}
          <div className='absolute inset-0'>
            {/* Vertical Line */}
            <div className='absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#F1CB68]/20 to-transparent' />
            {/* Horizontal Line */}
            <div className='absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F1CB68]/20 to-transparent' />
          </div>

          {/* Center Success Icon */}
          <div
            className={`relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#F1CB68] flex items-center justify-center shadow-2xl transition-all duration-500 ${
              animate ? 'scale-100 rotate-0' : 'scale-50 rotate-180'
            }`}
            style={{
              boxShadow: '0 0 60px rgba(241, 203, 104, 0.5)',
            }}
          >
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#0B0D12'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`transition-all duration-700 ${
                animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            >
              <polyline points='20 6 9 17 4 12' />
            </svg>
          </div>

          {/* Radiating Dots from Center - Using transform for direction */}
          {[...Array(12)].map((_, index) => {
            const angle = (index * 30 * Math.PI) / 180;
            const distance = 120;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            return (
              <div
                key={`dot-${index}`}
                className='absolute w-2 h-2 bg-[#F1CB68] rounded-full'
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: animate
                    ? `radiate-out 2s ease-out infinite`
                    : 'none',
                  animationDelay: `${index * 0.1}s`,
                  '--end-x': `${endX}px`,
                  '--end-y': `${endY}px`,
                }}
              />
            );
          })}

          {/* Additional smaller dots for depth */}
          {[...Array(8)].map((_, index) => {
            const angle = ((index * 45 + 22.5) * Math.PI) / 180;
            const distance = 100;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            return (
              <div
                key={`dot-small-${index}`}
                className='absolute w-1.5 h-1.5 bg-[#F1CB68]/80 rounded-full'
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: animate
                    ? `radiate-out 2.3s ease-out infinite`
                    : 'none',
                  animationDelay: `${index * 0.15 + 0.3}s`,
                  '--end-x': `${endX}px`,
                  '--end-y': `${endY}px`,
                }}
              />
            );
          })}
        </div>

        {/* Success Message */}
        <p className='text-gray-400 text-center text-sm md:text-base mb-8 md:mb-10'>
          Your identity has been securely verified
        </p>

        {/* Action Buttons */}
        <div className='w-full space-y-4'>
          <button
            onClick={handleContinue}
            className='w-full hidden text-[#0B0D12] cursor-pointer font-semibold px-8 py-3 md:py-4 rounded-full transition-all text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            Continue
          </button>

          <button
            onClick={handleGoToDashboard}
            className='w-full bg-transparent border border-[#F1CB68] text-[#F1CB68] hover:bg-[#F1CB68] hover:text-[#0B0D12] font-semibold px-8 py-3 md:py-4 rounded-full transition-all text-base md:text-lg'
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes radar-pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }

        @keyframes radiate-out {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          60% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%)
              translate(var(--end-x), var(--end-y)) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes float-dot {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0px);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
