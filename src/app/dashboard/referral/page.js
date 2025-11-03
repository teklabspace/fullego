'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ReferralPage() {
  return (
    <DashboardLayout>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white'>Referral Program</h1>
          <p className='text-gray-400 mt-2'>
            Invite your friends and earn rewards together
          </p>
        </div>

        {/* Content */}
        <div
          className='rounded-2xl p-8 text-center'
          style={{
            background:
              'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Coming Soon
            </h2>
            <p className='text-gray-400'>
              Our referral program is currently under development. Stay tuned
              for exciting rewards and benefits!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

