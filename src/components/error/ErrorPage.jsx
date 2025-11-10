'use client';
import { useEffect } from 'react';

export default function ErrorPage({ 
  title = "Oops!", 
  onAction, 
  buttonText = "Take me Home" 
}) {
  useEffect(() => {
    const robot = document.getElementById('error-robot');
    if (robot) robot.classList.add('animate-float');
  }, []);

  return (
    <div className='min-h-screen bg-[#101014] flex items-center justify-center p-6 lg:p-12'>
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-20px) translateX(0px); }
          75% { transform: translateY(-10px) translateX(-5px); }
        }

      

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(-50px); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float-gentle 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .gear-spin { animation: spin 4s linear infinite; }
        .gear-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .bounce-in { animation: bounceIn 0.6s ease-out; }
        .slide-up { animation: slideUp 0.8s ease-out; }
      `}</style>

      <div className='max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12'>
        {/* Left Side - Text Content */}
        <div className='flex-1 text-center lg:text-left'>
          <h1 className='text-white text-7xl md:text-8xl lg:text-9xl font-bold mb-8 bounce-in'>
            {title}
          </h1>

          {/* Gradient Button */}
          <button
            onClick={onAction}
            className='group relative px-8 py-4 bg-transparent border-2 rounded-full font-semibold text-lg transition-all duration-300 hover:opacity-80 flex items-center gap-3 slide-up mx-auto lg:mx-0'
            style={{ 
              animationDelay: '0.2s',
              borderImage: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%) 1',
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            <span style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {buttonText}
            </span>
            <svg
              className='w-6 h-6 transition-transform duration-300 group-hover:translate-x-1'
              style={{ 
                stroke: 'url(#gradient)',
                fill: 'none'
              }}
              viewBox='0 0 24 24'
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F1CB68" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 8l4 4m0 0l-4 4m4-4H3'
              />
            </svg>
          </button>
        </div>

        {/* Right Side - Robot Illustration */}
        <div className='flex-1 relative'>
          <div className='absolute inset-0 bg-[#F9BD1D]/5 rounded-full blur-3xl animate-pulse-glow' />
          
          <div id='error-robot' className='relative animate-float'>
            <img
              src='/fix-robot-for-error-505.svg'
              alt='Error Robot'
              className='w-full max-w-md lg:max-w-lg mx-auto'
            />
          </div>

          {/* Top Left Gear */}
          <div className='absolute top-12 left-8 w-12 h-12 opacity-40 gear-spin'>
            <svg viewBox='0 0 100 100' fill='none'>
              <circle cx='50' cy='50' r='20' fill='#6B7280' />
              <circle cx='50' cy='10' r='8' fill='#6B7280' />
              <circle cx='50' cy='90' r='8' fill='#6B7280' />
              <circle cx='10' cy='50' r='8' fill='#6B7280' />
              <circle cx='90' cy='50' r='8' fill='#6B7280' />
            </svg>
          </div>

          {/* Bottom Right Gear */}
          <div className='absolute bottom-8 right-8 w-16 h-16 opacity-30 gear-spin-reverse'>
            <svg viewBox='0 0 100 100' fill='none'>
              <circle cx='50' cy='50' r='25' fill='#6B7280' />
              <circle cx='50' cy='10' r='10' fill='#6B7280' />
              <circle cx='50' cy='90' r='10' fill='#6B7280' />
              <circle cx='10' cy='50' r='10' fill='#6B7280' />
              <circle cx='90' cy='50' r='10' fill='#6B7280' />
            </svg>
          </div>

          {/* Document Icon with Dot */}
          <div className='absolute bottom-16 right-4 animate-float'>
            <div className='relative bg-white p-3 rounded-lg shadow-lg transform rotate-12'>
              <svg className='w-8 h-8 text-gray-800' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z' />
              </svg>
              <div className='absolute -top-1 -right-1 w-4 h-4 bg-[#F9BD1D] rounded-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

