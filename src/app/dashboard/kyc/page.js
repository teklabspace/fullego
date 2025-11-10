'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  return (
    <DashboardLayout>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white'>KYC Verification</h1>
          <p className='text-gray-400 mt-2'>
            Complete your identity verification to unlock all features
          </p>
        </div>

        {/* Content */}
        <div
          className='rounded-2xl p-8'
          style={{
            background:
              'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className='max-w-2xl mx-auto text-center'>
            <div className='mb-6'>
              <Image
                src='/icons/user-check.svg'
                alt='KYC'
                width={64}
                height={64}
                className='mx-auto'
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Verify Your Identity
            </h2>
            <p className='text-gray-400 mb-6'>
              To ensure the security of your account and comply with regulations,
              please complete your KYC verification.
            </p>
            <button
              onClick={() => router.push('/choose-profile')}
              className='px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                color: '#000000',
              }}
            >
              Start Verification
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

