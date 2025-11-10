'use client';
import { useRouter } from 'next/navigation';

export default function KYCVerificationPage() {
  const router = useRouter();

  const handleStartVerification = () => {
    // Log previous page data to console
    console.log('Step 1 - Account Setup: Profile selected and journey started');
    // Redirect to document verification page
    router.push('/document-verification');
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 hidden md:block'>
        {/* Grid pattern */}
        <div
          className='absolute'
          style={{
            width: '400px',
            height: '400px',
            left: '10%',
            top: '20%',
            opacity: 0.1,
          }}
        >
          <div className='w-full h-full grid grid-cols-4 grid-rows-4 gap-4'>
            {[...Array(16)].map((_, i) => (
              <div key={i} className='border border-white/20'></div>
            ))}
          </div>
        </div>

        {/* Glowing circles */}
        <div
          className='absolute w-64 h-64 rounded-full'
          style={{
            background: '#F1CB68',
            filter: 'blur(100px)',
            opacity: 0.2,
            right: '15%',
            top: '30%',
          }}
        />
        <div
          className='absolute w-48 h-48 rounded-full'
          style={{
            background: '#F1CB68',
            filter: 'blur(80px)',
            opacity: 0.15,
            left: '20%',
            bottom: '20%',
          }}
        />
      </div>

      {/* Main Content */}
      <div className='relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-16 flex flex-col items-center'>
        {/* Content */}
        <div className='w-full text-center'>
          <div className='relative inline-block'>
            <h1 className='text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight'>
              Secure Verification
            </h1>
            <span className='absolute left-1/2 -translate-x-1/2 bottom-5 w-1/4 h-[3px] bg-[#F1CB68] rounded-full'></span>
          </div>

          <p className='text-gray-400 text-base md:text-lg lg:text-xl mb-6 md:mb-8 leading-relaxed'>
            Your gateway to exclusive wealth management
          </p>

          <div className='mb-8 md:mb-10 max-w-2xl mx-auto'>
            <p className='text-gray-300 text-sm md:text-base leading-relaxed'>
              Fullego prioritizes your security. All information is encrypted
              and handled according to the highest industry standards.
            </p>
          </div>
        </div>

        {/* Image/Visual - Centered between text and button */}
        <div className='w-full flex items-center justify-center relative mb-8 md:mb-10'>
          <div className='relative'>
            {/* Decorative Background Elements */}
            <div
              className='absolute w-96 h-96 rounded-full'
              style={{
                background:
                  'radial-gradient(circle, #F1CB68 0%, transparent 70%)',
                filter: 'blur(60px)',
                opacity: 0.3,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Credit Cards Mockup */}
            <div className='relative z-10'>
              <div
                className='relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto'
                style={{
                  transform:
                    'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                }}
              >
                <img 
                  src='/Group 4055.svg' 
                  alt='Credit Card Front' 
                  className='w-full h-auto'
                />
                {/* Floating Security Icons */}
                <div
                  className='absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center'
                  style={{
                    background: 'rgba(241, 203, 104, 0.2)',
                    border: '2px solid rgba(241, 203, 104, 0.5)',
                    top: '10%',
                    right: '20%',
                    animation: 'float 3s ease-in-out infinite',
                  }}
                >
                  <svg
                    className='w-6 h-6 md:w-8 md:h-8'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#F1CB68'
                    strokeWidth='2'
                  >
                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                  </svg>
                </div>

                <div
                  className='absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center'
                  style={{
                    background: 'rgba(241, 203, 104, 0.2)',
                    border: '2px solid rgba(241, 203, 104, 0.5)',
                    bottom: '15%',
                    left: '5%',
                    animation: 'float 4s ease-in-out infinite',
                    animationDelay: '1s',
                  }}
                >
                  <svg
                    className='w-5 h-5 md:w-6 md:h-6'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#F1CB68'
                    strokeWidth='2'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Button - After Image */}
        <button
          onClick={handleStartVerification}
          className='text-[#0B0D12] cursor-pointer font-semibold px-8 md:px-10 py-3 md:py-4 rounded-full transition-all text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
          style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
          }}
        >
          Start Verification
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
