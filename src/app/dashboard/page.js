'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className='mb-8 border border-[#1A1A1A] rounded-2xl p-6'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3'>
          Good morning, Olivia.
        </h1>
        <p className='text-gray-400 text-lg mb-8'>
          Here&apos;s a 360° view of your financial position.
        </p>

        {/* Top Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Net Worth</p>
            <div className='flex items-center gap-3'>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>$12.4M</h2>
              <span className='text-[#10B981] text-sm font-medium bg-[#10B9811A] px-2 py-1 rounded'>
                ↑ 3.7%
              </span>
            </div>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Asset Allocation</p>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>5 Classes</h2>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Available Liquidity</p>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>$1.75M</h2>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className='flex flex-wrap xl:flex-nowrap gap-6 mb-8'>
        {/* Net Worth Card */}
        <NetWorthCard />

        {/* Asset Allocation Card */}
        <AssetAllocationCard />

        {/* Liabilities Card */}
        <LiabilitiesCard />

        {/* Available Liquidity Card */}
        <AvailableLiquidityCard />
      </div>

      {/* Performance Analytics */}
      <PerformanceAnalyticsCard />
    </DashboardLayout>
  );
}

// Net Worth Card Component
function NetWorthCard() {
  const data = [
    { month: 'Jan', value: 10.5 },
    { month: 'Feb', value: 10.8 },
    { month: 'Mar', value: 11.2 },
    { month: 'Apr', value: 11.0 },
    { month: 'May', value: 11.5 },
    { month: 'Jun', value: 12.4 },
  ];

  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl p-4 w-full xl:w-[238px] h-[238px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <h3 className='text-gray-900 dark:text-white font-semibold text-sm'>Net Worth</h3>
          <InfoIcon />
        </div>
      </div>

      {/* Value */}
      <div className='flex items-center gap-2 mb-3'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>$12.4M</h2>
        <span className='text-[#10B981] text-xs font-medium bg-[#10B9811A] px-1.5 py-0.5 rounded'>
          ↑ 3.7%
        </span>
      </div>

      {/* Chart */}
      <div className='flex-1 mb-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='netWorthGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='rgba(212, 175, 55, 0.301961)'
                  stopOpacity={1}
                />
                <stop
                  offset='95%'
                  stopColor='rgba(212, 175, 55, 0)'
                  stopOpacity={1}
                />
              </linearGradient>
            </defs>
            <Area
              type='monotone'
              dataKey='value'
              stroke='#D4AF37'
              strokeWidth={2}
              fill='url(#netWorthGradient)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <p className='text-gray-500 text-xs'>Last 6 months</p>
    </div>
  );
}

// Asset Allocation Card Component
function AssetAllocationCard() {
  const data = [
    { name: 'Stocks', value: 45, color: '#D4AF37' },
    { name: 'Real Estate', value: 25, color: '#BF9B30' },
    { name: 'Bonds', value: 15, color: '#977A20' },
    { name: 'Alternatives', value: 10, color: '#EACE6F' },
    { name: 'Cash', value: 5, color: '#F1D976' },
  ];

  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl p-4 w-full xl:w-[238px] h-[238px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-gray-900 dark:text-white font-semibold text-sm'>Asset Allocation</h3>
          <InfoIcon />
        </div>
      </div>

      {/* Chart and Legend Container */}
      <div className='flex-1 flex items-center gap-3'>
        {/* Donut Chart */}
        <div className='shrink-0 w-[100px] h-[100px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                innerRadius={30}
                outerRadius={45}
                paddingAngle={2}
                dataKey='value'
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend on the right */}
        <div className='flex-1 space-y-2'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center gap-1.5'>
                <div
                  className='w-1.5 h-1.5 rounded-full shrink-0'
                  style={{ backgroundColor: item.color }}
                />
                <span className='text-gray-400 text-[10px]'>{item.name}</span>
              </div>
              <span className='text-gray-900 dark:text-white text-[10px] font-medium ml-1'>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Liabilities Card Component
function LiabilitiesCard() {
  const liabilities = [
    { name: 'Mortgages', amount: '$1.8M', percentage: 56 },
    { name: 'Credit Lines', amount: '$1.2M', percentage: 38 },
    { name: 'Other Debts', amount: '$0.2M', percentage: 6 },
  ];

  const total = '$3.2M';

  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl p-4 w-full xl:w-[238px] h-[238px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <h3 className='text-gray-900 dark:text-white font-semibold text-sm'>Liabilities</h3>
          <InfoIcon />
        </div>
      </div>

      {/* Total */}
      <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>{total}</h2>

      {/* Liabilities List */}
      <div className='space-y-3 flex-1'>
        {liabilities.map((item, index) => (
          <div key={index}>
            <div className='flex items-center justify-between mb-1.5'>
              <span className='text-gray-400 text-xs'>{item.name}</span>
              <span className='text-gray-900 dark:text-white text-xs font-medium'>
                {item.amount}
              </span>
            </div>
            <div className='w-full h-1.5 bg-[#2A2A2D] rounded-full overflow-hidden'>
              <div
                className='h-full bg-[#D4AF37] rounded-full'
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Available Liquidity Card Component
function AvailableLiquidityCard() {
  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl p-4 w-full xl:w-[238px] h-[238px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <h3 className='text-gray-900 dark:text-white font-semibold text-sm'>
            Available Liquidity
          </h3>
          <InfoIcon />
        </div>
      </div>

      {/* Total */}
      <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-3'>$1.75M</h2>

      {/* Details */}
      <div className='space-y-2 flex-1'>
        {/* Cash & Cash Equivalents */}
        <div>
          <p className='text-gray-400 text-xs mb-1.5'>
            Cash & Cash Equivalents
          </p>
          <div className='w-full h-1.5 bg-[#2A2A2D] rounded-full overflow-hidden'>
            <div className='h-full bg-[#D4AF37] rounded-full w-[70%]' />
          </div>
        </div>

        {/* Liquidity Target */}
        <div className='bg-[#D4AF371A] rounded-lg p-2'>
          <div className='flex items-center justify-between mb-0.5'>
            <span className='text-gray-400 text-xs'>Liquidity Target:</span>
            <span className='text-gray-900 dark:text-white text-xs font-medium'>
              70% of target
            </span>
          </div>
          <p className='text-gray-500 text-[10px]'>$2.5M</p>
        </div>

        {/* Credit Available */}
        <div className='flex items-center gap-1.5 bg-[#D4AF371A] rounded-lg p-2'>
          <svg
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#D4AF37'
            strokeWidth='2'
          >
            <rect x='1' y='4' width='22' height='16' rx='2' ry='2' />
            <line x1='1' y1='10' x2='23' y2='10' />
          </svg>
          <span className='text-[#D4AF37] text-xs font-medium'>
            $5M Credit Available
          </span>
        </div>
      </div>
    </div>
  );
}

// Performance Analytics Card Component
function PerformanceAnalyticsCard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState('30d');

  // Different datasets for each time period
  const dataByPeriod = {
    '7d': [
      { time: 'Mon', portfolio: 12.1, sp500: 10.3 },
      { time: 'Tue', portfolio: 12.0, sp500: 10.2 },
      { time: 'Wed', portfolio: 12.3, sp500: 10.4 },
      { time: 'Thu', portfolio: 12.2, sp500: 10.3 },
      { time: 'Fri', portfolio: 12.5, sp500: 10.5 },
      { time: 'Sat', portfolio: 12.4, sp500: 10.4 },
      { time: 'Sun', portfolio: 12.4, sp500: 10.4 },
    ],
    '30d': [
      { time: 'Week 1', portfolio: 11.8, sp500: 10.1 },
      { time: 'Week 2', portfolio: 11.9, sp500: 10.2 },
      { time: 'Week 3', portfolio: 12.1, sp500: 10.3 },
      { time: 'Week 4', portfolio: 12.4, sp500: 10.4 },
    ],
    '1y': [
      { time: 'Jan', portfolio: 8.5, sp500: 8.3 },
      { time: 'Feb', portfolio: 8.7, sp500: 8.5 },
      { time: 'Mar', portfolio: 9.0, sp500: 8.6 },
      { time: 'Apr', portfolio: 9.2, sp500: 8.8 },
      { time: 'May', portfolio: 9.5, sp500: 9.0 },
      { time: 'Jun', portfolio: 9.8, sp500: 9.2 },
      { time: 'Jul', portfolio: 10.2, sp500: 9.4 },
      { time: 'Aug', portfolio: 10.5, sp500: 9.6 },
      { time: 'Sep', portfolio: 11.0, sp500: 9.8 },
      { time: 'Oct', portfolio: 11.5, sp500: 10.0 },
      { time: 'Nov', portfolio: 12.0, sp500: 10.2 },
      { time: 'Dec', portfolio: 12.4, sp500: 10.4 },
    ],
    All: [
      { time: '2020', portfolio: 5.2, sp500: 6.8 },
      { time: '2021', portfolio: 6.5, sp500: 7.5 },
      { time: '2022', portfolio: 7.8, sp500: 8.0 },
      { time: '2023', portfolio: 9.5, sp500: 8.8 },
      { time: '2024', portfolio: 12.4, sp500: 10.4 },
    ],
  };

  const data = dataByPeriod[selectedPeriod];

  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl p-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
        <h3 className='text-gray-900 dark:text-white font-semibold text-lg'>
          Performance Analytics
        </h3>

        {/* Right Side Controls */}
        <div className='flex items-center gap-4'>
          {/* Legend */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-1 bg-[#D4AF37] rounded' />
              <span className='text-gray-400 text-sm'>Your Portfolio</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-1 bg-[#666666] rounded' />
              <span className='text-gray-400 text-sm'>S&P 500</span>
            </div>
          </div>

          {/* Time Buttons */}
          <div className='flex gap-1 bg-[#2A2A2D] rounded-lg p-1'>
            <TimeButton
              active={selectedPeriod === '7d'}
              onClick={() => setSelectedPeriod('7d')}
            >
              7d
            </TimeButton>
            <TimeButton
              active={selectedPeriod === '30d'}
              onClick={() => setSelectedPeriod('30d')}
            >
              30d
            </TimeButton>
            <TimeButton
              active={selectedPeriod === '1y'}
              onClick={() => setSelectedPeriod('1y')}
            >
              1y
            </TimeButton>
            <TimeButton
              active={selectedPeriod === 'All'}
              onClick={() => setSelectedPeriod('All')}
            >
              All
            </TimeButton>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className='h-64'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#2A2A2D' />
            <XAxis
              dataKey='time'
              stroke='#666666'
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke='#666666' style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1D',
                border: '1px solid #FFFFFF14',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type='monotone'
              dataKey='portfolio'
              stroke='#D4AF37'
              strokeWidth={2}
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='sp500'
              stroke='#666666'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper Components
function InfoIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#666666'
      strokeWidth='2'
      className='cursor-pointer hover:stroke-gray-400 transition-colors'
    >
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='16' x2='12' y2='12' />
      <line x1='12' y1='8' x2='12.01' y2='8' />
    </svg>
  );
}

function TimeButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 rounded text-sm font-medium transition-all
        ${
          active
            ? 'bg-[#D4AF37] text-[#101014]'
            : 'text-gray-400 dark:hover:text-white hover:text-gray-900'
        }
      `}
    >
      {children}
    </button>
  );
}
