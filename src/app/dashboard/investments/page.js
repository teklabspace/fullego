'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

export default function InvestmentsPage() {
  const investments = [
    { name: 'Tech Growth Fund', amount: '$24,580', return: '+15.2%', risk: 'High' },
    { name: 'S&P 500 Index', amount: '$18,450', return: '+8.5%', risk: 'Medium' },
    { name: 'Corporate Bonds', amount: '$15,890', return: '+4.2%', risk: 'Low' },
    { name: 'Real Estate REIT', amount: '$12,340', return: '+6.8%', risk: 'Medium' },
  ];

  return (
    <DashboardLayout>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-white mb-2'>
          Investments
        </h1>
        <p className='text-gray-400'>Track and manage your active investments</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {investments.map((investment, index) => (
          <GlassCard key={index} className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h3 className='text-white font-semibold mb-1'>{investment.name}</h3>
                <p className='text-gray-400 text-sm'>{investment.risk} Risk</p>
              </div>
              <span className='px-3 py-1 bg-akunuba-gold/20 text-akunuba-gold rounded-full text-xs font-medium'>
                Active
              </span>
            </div>
            <div className='flex items-end justify-between'>
              <div>
                <p className='text-gray-400 text-sm mb-1'>Amount Invested</p>
                <p className='text-2xl font-bold text-white'>{investment.amount}</p>
              </div>
              <div className='text-right'>
                <p className='text-gray-400 text-sm mb-1'>Return</p>
                <p className='text-xl font-bold text-green-400'>{investment.return}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </DashboardLayout>
  );
}

