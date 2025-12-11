'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
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
  const { isDarkMode } = useTheme();

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className={`mb-8 flex items-center justify-between ${
        isDarkMode ? '' : ''
      }`}>
        <h1
          className={`text-3xl md:text-4xl font-bold ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}
        >
          Olá, Clark
        </h1>
        
        {/* Navigation Icons */}
        <div className='flex items-center gap-4'>
          <button className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <path d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2' />
            </svg>
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.35-4.35' />
            </svg>
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
              <polyline points='16 6 12 2 8 6' />
              <line x1='12' y1='2' x2='12' y2='15' />
            </svg>
          </button>
          <button className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <circle cx='12' cy='12' r='3' />
              <path d='M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24' />
            </svg>
          </button>
          <select className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
            isDarkMode 
              ? 'bg-[#1A1A1D] border-[#FFFFFF14] text-white' 
              : 'bg-white border-gray-200 text-black'
          } focus:outline-none`}>
            <option>USD $</option>
            <option>EUR €</option>
            <option>GBP £</option>
          </select>
        </div>
      </div>

      {/* Top Row Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Net Worth & Investable Card */}
        <NetWorthInvestableCard />

        {/* Assets Card */}
        <AssetsCard />

        {/* Debts Card */}
        <DebtsCard />
      </div>

      {/* Middle Row Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Cash on hand Card */}
        <CashOnHandCard />

        {/* Tax Estimate Card */}
        <TaxEstimateCard />
      </div>

      {/* Historical Performance Graph */}
      <HistoricalPerformanceGraph />
    </DashboardLayout>
  );
}

// Net Worth & Investable Card Component
function NetWorthInvestableCard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      {/* Net Worth */}
      <div className='mb-6'>
        <div className='flex items-center gap-2 mb-2'>
          <h3 className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Net Worth
          </h3>
          <InfoIcon />
        </div>
        <h2 className={`text-3xl font-bold ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>
          $16.995 Million
        </h2>
      </div>

      {/* Investable */}
      <div className='mb-6'>
        <div className='flex items-center gap-2 mb-2'>
          <h3 className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Investable
          </h3>
          <InfoIcon />
        </div>
        <h2 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-black'
        }`}>
          $12.228 Million
        </h2>
      </div>

      {/* CAGR YTD Section */}
      <div>
        <h4 className={`text-xs font-medium mb-3 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          CAGR YTD
        </h4>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>NET WORTH</span>
            <span className='text-[#10B981] text-xs font-medium'>+35%</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>INVESTABLE</span>
            <span className='text-[#10B981] text-xs font-medium'>+30%</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>S&P 500</span>
            <span className='text-[#10B981] text-xs font-medium'>+14%</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>DOW JONES</span>
            <span className='text-[#10B981] text-xs font-medium'>+9%</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>TSLA</span>
            <span className='text-[#10B981] text-xs font-medium'>+9%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assets Card Component
function AssetsCard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      <h3 className={`text-sm font-medium mb-4 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Assets
      </h3>
      <h2 className={`text-3xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-black'
      }`}>
        $18.226 Million
      </h2>
      
      <div className='space-y-3'>
        <div>
          <p className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 DAY
          </p>
          <p className='text-[#10B981] text-sm font-medium'>
            +$32,682 (0.18%)
          </p>
        </div>
        <div>
          <p className={`text-xs mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 YEAR
          </p>
          <p className='text-[#EF4444] text-sm font-medium'>
            -$62,249 (0.34%)
          </p>
        </div>
      </div>
    </div>
  );
}

// Debts Card Component
function DebtsCard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      <h3 className={`text-sm font-medium mb-4 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Debts
          </h3>
      <h2 className={`text-3xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-black'
      }`}>
        $1.232 Million
      </h2>

      <div className='space-y-3'>
        <div>
          <p className={`text-xs mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 DAY
          </p>
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            $0
          </p>
            </div>
        <div>
          <p className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 YEAR
          </p>
          <p className='text-[#EF4444] text-sm font-medium'>
            -$83,791 (6%)
          </p>
          </div>
      </div>
    </div>
  );
}

// Cash on hand Card Component
function CashOnHandCard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      <div className='flex items-center gap-2 mb-4'>
        <h3 className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Cash on hand
        </h3>
        <InfoIcon />
      </div>
      <h2 className={`text-3xl font-bold mb-4 ${
        isDarkMode ? 'text-white' : 'text-black'
      }`}>
        $430,778
      </h2>
      <div>
        <p className={`text-xs mb-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Overdue
        </p>
        <p className='text-[#EF4444] text-sm font-medium'>
          -$15,000
        </p>
      </div>
    </div>
  );
}

// Tax Estimate Card Component
function TaxEstimateCard() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      <div className='flex items-center gap-2 mb-4'>
        <h3 className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Tax Estimate
        </h3>
        <InfoIcon />
      </div>
      <h2 className={`text-3xl font-bold mb-4 ${
        isDarkMode ? 'text-white' : 'text-black'
      }`}>
        $227,056
      </h2>
      <div>
        <p className={`text-xs mb-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Adjusted Net Worth
        </p>
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>
          $16.759 Million
        </p>
      </div>
    </div>
  );
}


// Historical Performance Graph Component
function HistoricalPerformanceGraph() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = React.useState('ALL-TIME');

  // Historical data for Net Worth and Investable - matching the image with more data points
  const historicalData = [
    { date: '2020', netWorth: 6.5, investable: 4.2 },
    { date: '2021', netWorth: 7.8, investable: 5.5 },
    { date: '2022', netWorth: 9.2, investable: 6.8 },
    { date: '2023', netWorth: 11.5, investable: 8.9 },
    { date: '2024 Q1', netWorth: 13.2, investable: 10.1 },
    { date: '2024 Q2', netWorth: 14.8, investable: 11.2 },
    { date: '2024 Q3', netWorth: 16.995, investable: 12.228 },
  ];

  const currentNetWorth = 16.995;
  const currentInvestable = 12.228;
  const initialNetWorth = 6.5;
  const initialInvestable = 4.2;
  const netWorthGrowth = currentNetWorth - initialNetWorth;
  const investableGrowth = currentInvestable - initialInvestable;
  const netWorthGrowthPercent = ((netWorthGrowth / initialNetWorth) * 100).toFixed(0);
  const investableGrowthPercent = ((investableGrowth / initialInvestable) * 100).toFixed(0);

  return (
    <div className={`bg-transparent border rounded-2xl p-6 ${
      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
    }`}>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Side - Summary Stats */}
        <div className='space-y-8'>
          {/* Net Worth Summary */}
          <div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Net Worth
            </h3>
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              $16.995 Million
            </h2>
            <p className='text-[#10B981] text-sm font-medium'>
              +${netWorthGrowth.toFixed(2)}M ({netWorthGrowthPercent}%)
            </p>
          </div>

          {/* Investable Summary */}
          <div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Investable
            </h3>
            <h2 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              $12.228 Million
            </h2>
            <p className='text-[#10B981] text-sm font-medium'>
              +${investableGrowth.toFixed(2)}M ({investableGrowthPercent}%)
            </p>
          </div>
        </div>

        {/* Right Side - Graph */}
        <div>
          {/* Graph Header */}
          <div className='flex items-center justify-end gap-2 mb-4'>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${
                isDarkMode 
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14] text-white' 
                  : 'bg-white border-gray-200 text-black'
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value='ALL-TIME'>ALL-TIME</option>
              <option value='1Y'>1 YEAR</option>
              <option value='6M'>6 MONTHS</option>
              <option value='3M'>3 MONTHS</option>
            </select>
            <button className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
            }`}>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke={isDarkMode ? '#666666' : '#9CA3AF'}
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='3' />
                <path d='M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24' />
              </svg>
            </button>
          </div>

          {/* Chart */}
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Gradient for Investable (lighter purple) */}
                  <linearGradient id='investableGradientHist' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='rgba(139, 92, 246, 0.5)'
                      stopOpacity={1}
                    />
                    <stop
                      offset='95%'
                      stopColor='rgba(139, 92, 246, 0)'
                      stopOpacity={1}
                    />
                  </linearGradient>
                  {/* Gradient for Net Worth (darker purple) */}
                  <linearGradient id='netWorthGradientHist' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='rgba(124, 58, 237, 0.6)'
                      stopOpacity={1}
                    />
                    <stop
                      offset='95%'
                      stopColor='rgba(124, 58, 237, 0)'
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray='3 3' 
                  stroke={isDarkMode ? '#2A2A2D' : '#E5E7EB'}
                  vertical={false}
                />
                <XAxis
                  dataKey='date'
                  stroke={isDarkMode ? '#666666' : '#9CA3AF'}
                  style={{ fontSize: '12px' }}
                  tick={{ fill: isDarkMode ? '#666666' : '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke={isDarkMode ? '#666666' : '#9CA3AF'} 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: isDarkMode ? '#666666' : '#9CA3AF' }}
                  tickFormatter={(value) => `$${value}M`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1A1A1D' : '#FFFFFF',
                    border: isDarkMode ? '1px solid #FFFFFF14' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: isDarkMode ? '#fff' : '#111827' }}
                  formatter={(value, name) => {
                    const label = name === 'netWorth' ? 'Net Worth' : 'Investable';
                    return [`$${value.toFixed(2)}M`, label];
                  }}
                />
                {/* Net Worth Area (darker purple, behind) */}
                <Area
                  type='monotone'
                  dataKey='netWorth'
                  stroke='#7C3AED'
                  strokeWidth={2.5}
                  fill='url(#netWorthGradientHist)'
                />
                {/* Investable Area (lighter purple, on top) */}
                <Area
                  type='monotone'
                  dataKey='investable'
                  stroke='#8B5CF6'
                  strokeWidth={2.5}
                  fill='url(#investableGradientHist)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
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

