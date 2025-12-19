'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-white mb-2'>
          Analytics
        </h1>
        <p className='text-gray-400'>Deep insights into your investment performance</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <MetricCard title='ROI' value='24.3%' change='+3.2%' positive />
        <MetricCard title='Volatility' value='12.8%' change='-1.5%' positive />
        <MetricCard title='Sharpe Ratio' value='1.85' change='+0.15' positive />
        <MetricCard title='Alpha' value='2.4%' change='+0.8%' positive />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <GlassCard className='p-6'>
          <h2 className='text-lg font-semibold text-white mb-6'>Risk Analysis</h2>
          <div className='space-y-4'>
            <RiskBar label='Market Risk' percentage={65} color='bg-yellow-500' />
            <RiskBar label='Credit Risk' percentage={35} color='bg-green-500' />
            <RiskBar label='Liquidity Risk' percentage={45} color='bg-blue-500' />
            <RiskBar label='Operational Risk' percentage={25} color='bg-purple-500' />
          </div>
        </GlassCard>

        <GlassCard className='p-6'>
          <h2 className='text-lg font-semibold text-white mb-6'>Sector Allocation</h2>
          <div className='space-y-4'>
            <SectorItem sector='Technology' percentage='35%' value='$43,505' />
            <SectorItem sector='Healthcare' percentage='20%' value='$24,917' />
            <SectorItem sector='Finance' percentage='18%' value='$22,425' />
            <SectorItem sector='Energy' percentage='15%' value='$18,688' />
            <SectorItem sector='Consumer' percentage='12%' value='$14,950' />
          </div>
        </GlassCard>
      </div>

      <GlassCard className='p-6'>
        <h2 className='text-lg font-semibold text-white mb-6'>Performance Metrics</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Best Performing Asset</p>
            <p className='text-white text-lg font-semibold'>Tesla Inc.</p>
            <p className='text-green-400 text-sm'>+45.2% return</p>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Most Volatile Asset</p>
            <p className='text-white text-lg font-semibold'>Bitcoin ETF</p>
            <p className='text-yellow-400 text-sm'>28.5% volatility</p>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Largest Holding</p>
            <p className='text-white text-lg font-semibold'>Apple Inc.</p>
            <p className='text-blue-400 text-sm'>$24,580 (19.7%)</p>
          </div>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, change, positive }) {
  return (
    <GlassCard className='p-6'>
      <p className='text-gray-400 text-sm mb-2'>{title}</p>
      <p className='text-2xl font-bold text-white mb-1'>{value}</p>
      <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change} from last period
      </p>
    </GlassCard>
  );
}

function RiskBar({ label, percentage, color }) {
  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-gray-300 text-sm'>{label}</span>
        <span className='text-white text-sm font-medium'>{percentage}%</span>
      </div>
      <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function SectorItem({ sector, percentage, value }) {
  return (
    <div className='flex items-center justify-between py-2 border-b border-akunuba-border last:border-0'>
      <span className='text-gray-300'>{sector}</span>
      <div className='text-right'>
        <p className='text-white font-medium'>{value}</p>
        <p className='text-gray-400 text-sm'>{percentage}</p>
      </div>
    </div>
  );
}

