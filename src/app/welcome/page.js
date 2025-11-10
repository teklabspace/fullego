'use client';
import Image from 'next/image';

export default function WelcomePage() {
  const handleBeginJourney = () => {
    window.location.href = '/choose-profile';
  };

  return (
    <div className='min-h-screen bg-[#101014] flex items-center justify-center relative overflow-hidden'>
      {/* Center Grid Shape with Glow */}
      <div
        className='absolute'
        style={{
          width: '546px',
          height: '506px',
          left: 'calc(50% - 546px/2)',
          top: 'calc(50% - 506px/2 - 41px)',
        }}
      >
        {/* Blurred Yellow Ellipse */}
        <div
          className='absolute'
          style={{
            width: '181px',
            height: '181px',
            left: '181px',
            top: '192px',
            background: '#F1CB68',
            filter: 'blur(135px)',
            borderRadius: '50%',
          }}
        />

        {/* Grid Lines Container */}
        <div
          className='absolute'
          style={{
            width: '546px',
            height: '546px',
            left: '0px',
            top: '0px',
          }}
        >
          {/* Vertical Lines */}
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '133.71px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '267.43px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '401.14px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />

          {/* Horizontal Lines */}
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '0px',
              top: '133.71px',
            }}
          />
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '0px',
              top: '267.43px',
            }}
          />
          <div
            className='absolute bg-white/10'
            style={{
              width: '546px',
              height: '1px',
              left: '0px',
              top: '401.14px',
            }}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className='relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-16 py-8'>
        {/* Left Side - Card with Image */}
        <div className='relative flex items-center justify-center w-full lg:w-1/2 mb-8 lg:mb-0'>
          {/* Yellow Folder Background */}
          <div className='relative'>
            <Image
              src='/WelcomeRightimage.png'
              alt='Welcome'
              width={450}
              height={450}
              className='object-contain w-[250px] md:w-[350px] lg:w-[450px] h-auto'
            />
          </div>
        </div>

        {/* Right Side - Welcome Text and CTA */}
        <div className='relative w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-12'>
          <div className='mb-8 lg:mb-12'>
            <h1 className='text-white text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 lg:mb-8'>
              Welcome to
              <br />
              Fullego
            </h1>
            <p className='text-gray-400 text-base md:text-lg lg:text-xl mb-8 lg:mb-10 max-w-lg'>
              Discover personalized wealth solutions tailored to your financial
              goals
            </p>

            <button
              onClick={handleBeginJourney}
              className='text-[#0B0D12] cursor-pointer font-semibold px-8 md:px-10 lg:px-12 py-3 md:py-4 rounded-full transition-colors text-base md:text-lg shadow-lg'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Begin Journey
            </button>
          </div>

          {/* 3D Robot positioned at bottom right - Hidden on mobile */}
          <div className='hidden lg:block absolute bottom-[-80px] right-0'>
            <Image
              src='/3d-robot.svg'
              alt='3D Robot'
              width={350}
              height={350}
              className='object-contain'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
