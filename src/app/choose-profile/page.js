'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const profiles = [
  {
    id: 'individual',
    title: 'Individual',
    icon: (
      <svg
        width='48'
        height='48'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      >
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
        <circle cx='12' cy='7' r='4' />
      </svg>
    ),
    description:
      'Personal wealth management for single investors focusing on growth and security',
  },
  {
    id: 'family-office',
    title: 'Family Office',
    icon: (
      <svg
        width='48'
        height='48'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      >
        <rect x='4' y='2' width='16' height='20' rx='2' ry='2' />
        <line x1='8' y1='6' x2='16' y2='6' />
        <line x1='8' y1='10' x2='16' y2='10' />
        <line x1='8' y1='14' x2='16' y2='14' />
        <line x1='8' y1='18' x2='12' y2='18' />
      </svg>
    ),
    description:
      'Multi-generational wealth planning and preservation for families',
  },
  {
    id: 'institutional',
    title: 'Institutional Investor',
    icon: (
      <svg
        width='48'
        height='48'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      >
        <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
        <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
      </svg>
    ),
    description:
      'Comprehensive investment solutions for institutional portfolios and corporate entities',
  },
];

export default function ChooseProfilePage() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  const handleCardClick = profile => {
    setSelectedProfile(profile);
  };

  const handleContinue = () => {
    if (selectedProfile) {
      // Save profile selection data to localStorage
      const profileData = {
        selectedProfile: selectedProfile,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('profileSelection', JSON.stringify(profileData));
      
      // Log selected profile data to console
      console.log('Step 1 - Profile Selection Data:', profileData);
      router.push('/kyc-verification');
    }
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden'>
      {/* Center Grid Shape with Glow - Below Cards - Hidden on mobile */}
      <div
        className='absolute hidden md:block'
        style={{
          width: '546px',
          height: '506px',
          left: 'calc(50% - 546px/2)',
          top: 'calc(50% - 506px/2 + 100px)',
          zIndex: 0,
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

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className='absolute top-8 left-8 text-white hover:text-gray-300 transition-colors z-20'
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M19 12H5M12 19l-7-7 7-7' />
        </svg>
      </button>

      {/* Header */}
      <div className='text-center mb-8 md:mb-12 lg:mb-16 relative z-10'>
        <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-4'>
          Choose Your Investor Profile
        </h1>
        <p className='text-gray-400 text-sm md:text-base lg:text-lg px-4'>
          Select the profile that best describes your investment goals
        </p>
      </div>

      {/* Cards Container */}
      <div className='flex flex-col md:flex-row gap-6 md:gap-6 lg:gap-8 mb-8 md:mb-12 relative z-10 w-full max-w-5xl px-4'>
        {profiles.map(profile => (
          <div
            key={profile.id}
            className='relative p-[2px] rounded-3xl w-full md:w-auto flex-1'
            style={{
              perspective: '1000px',
              background:
                selectedProfile === profile.id
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                  : 'transparent',
            }}
          >
            <div
              className={`relative w-full md:w-[240px] lg:w-[280px] h-[280px] md:h-[300px] lg:h-[320px] cursor-pointer transition-all duration-500`}
              style={{
                transformStyle: 'preserve-3d',
                transform:
                  hoveredCard === profile.id ? 'rotateY(180deg)' : 'rotateY(0)',
              }}
              onMouseEnter={() => setHoveredCard(profile.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(profile.id)}
            >
              {/* Front of Card */}
              <div
                className='absolute w-full h-full rounded-[22px] flex flex-col items-center justify-center p-6 md:p-8'
                style={{
                  backfaceVisibility: 'hidden',
                  background: 'rgba(30, 30, 35, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: selectedProfile === profile.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Diamond Shape with Icon */}
                <div
                  className='w-24 h-24 md:w-28 md:h-28 mb-4 md:mb-6 flex items-center justify-center text-[#F1CB68]'
                  style={{
                    background: 'transparent',
                    border: '2px solid #F1CB68',
                    transform: 'rotate(45deg)',
                  }}
                >
                  <div style={{ transform: 'rotate(-45deg)' }}>
                    {profile.icon}
                  </div>
                </div>

                <h3 className='text-white text-xl md:text-2xl font-semibold text-center'>
                  {profile.title}
                </h3>
              </div>

              {/* Back of Card */}
              <div
                className='absolute w-full h-full rounded-[22px] flex flex-col items-center justify-center p-6 md:p-8'
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'rgba(30, 30, 35, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                }}
              >
                <h3 className='text-white text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-center'>
                  {profile.title}
                </h3>
                <p className='text-gray-300 text-xs md:text-sm text-center leading-relaxed'>
                  {profile.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedProfile && (
        <button
          onClick={handleContinue}
          className='relative z-10 text-[#0B0D12] cursor-pointer font-semibold px-8 md:px-10 lg:px-12 py-3 md:py-4 rounded-full transition-all text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
          style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
          }}
        >
          Continue
        </button>
      )}
    </div>
  );
}

