'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function PortfolioOverviewPage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState('1M');

  // Portfolio Performance Data
  const performanceData = [
    { date: 'Jan', value: 245000 },
    { date: 'Feb', value: 258000 },
    { date: 'Mar', value: 252000 },
    { date: 'Apr', value: 268000 },
    { date: 'May', value: 275000 },
    { date: 'Jun', value: 285000 },
    { date: 'Jul', value: 295420 },
  ];

  // Asset Allocation Data
  const allocationData = [
    { name: 'Stocks', value: 125000, percentage: 42.3, color: '#F1CB68' },
    { name: 'Crypto', value: 85000, percentage: 28.8, color: '#36D399' },
    { name: 'Real Estate', value: 45000, percentage: 15.2, color: '#60A5FA' },
    { name: 'Cash', value: 40420, percentage: 13.7, color: '#F1CB68' },
  ];

  // Top Holdings
  const topHoldings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'Stock',
      shares: 250,
      avgPrice: 145.2,
      currentPrice: 185.92,
      value: 46480,
      change: 28.04,
      changePercent: 28.04,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'Crypto',
      shares: 1.5,
      avgPrice: 28500,
      currentPrice: 35200,
      value: 52800,
      change: 10050,
      changePercent: 23.51,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      type: 'Stock',
      shares: 150,
      avgPrice: 320.5,
      currentPrice: 354.58,
      value: 53187,
      change: 5112,
      changePercent: 10.63,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'Crypto',
      shares: 15,
      avgPrice: 1850,
      currentPrice: 2145,
      value: 32175,
      change: 4425,
      changePercent: 15.94,
    },
  ];

  // Recent Activity
  const recentActivity = [
    {
      type: 'buy',
      asset: 'AAPL',
      name: 'Apple Inc.',
      amount: 25,
      price: 185.92,
      total: 4648,
      date: '2023-07-28',
      time: '10:45 AM',
    },
    {
      type: 'sell',
      asset: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      price: 35200,
      total: 17600,
      date: '2023-07-27',
      time: '02:30 PM',
    },
    {
      type: 'dividend',
      asset: 'MSFT',
      name: 'Microsoft Corporation',
      amount: 150,
      price: 2.5,
      total: 375,
      date: '2023-07-25',
      time: '09:00 AM',
    },
    {
      type: 'buy',
      asset: 'ETH',
      name: 'Ethereum',
      amount: 2,
      price: 2145,
      total: 4290,
      date: '2023-07-24',
      time: '03:15 PM',
    },
  ];

  return (
    <DashboardLayout>
      <div className=''>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Portfolio Overview
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Track and manage all your investments in one place
              </p>
            </div>

            {/* Time Range Selector */}
            <div
              className={`flex items-center gap-2 p-2 rounded-full border ${
                isDarkMode ? '' : 'bg-transparent'
              }`}
              style={
                isDarkMode
                  ? {
                      background:
                        'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                      borderColor: '#29292E',
                    }
                  : {
                      background: 'rgba(241, 203, 104, 0.2)',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    }
              }
            >
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    timeRange === range
                      ? isDarkMode
                        ? 'bg-[#30333B] text-white'
                        : 'bg-[#F1CB68] text-black'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-black'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Total Portfolio Value */}
          <div
            className={`p-6 rounded-2xl border mb-6 ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div>
                <p
                  className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Total Portfolio Value
                </p>
                <h2
                  className={`text-4xl md:text-5xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  $295,420.00
                </h2>
                <div className='flex items-center gap-4 mt-3'>
                  <div className='flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#36D399'
                      strokeWidth='2'
                    >
                      <path d='M12 19V5M5 12l7-7 7 7' />
                    </svg>
                    <span className='text-lg font-semibold text-[#36D399]'>
                      +$15,420.00 (5.51%)
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    All Time
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-2 gap-4'>
                <div
                  className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
                  }`}
                >
                  <p className='text-xs text-gray-400 mb-1'>
                    Today&apos;s Change
                  </p>
                  <p className='text-xl font-bold text-[#36D399]'>+$2,340</p>
                  <p className='text-xs text-[#36D399]'>+0.79%</p>
                </div>
                <div
                  className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
                  }`}
                >
                  <p className='text-xs text-gray-400 mb-1'>Cash Available</p>
                  <p
                    className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    $40,420
                  </p>
                  <p className='text-xs text-gray-400'>13.7% of portfolio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <MetricCard
            icon='/icons/up-side-yellow-arrow.svg'
            title='Total Invested'
            value='$280,000'
            change='+$15,420'
            positive={true}
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/icons/net-cash-flow-icon.svg'
            title='Total Returns'
            value='$15,420'
            subtitle='5.51% return'
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/icons/cash-flow-forecast.svg'
            title='Asset Types'
            value='4'
            subtitle='Stocks, Crypto, Real Estate, Cash'
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/assets.svg'
            title='Total Holdings'
            value='47'
            subtitle='Active positions'
            isDarkMode={isDarkMode}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          {/* Portfolio Performance Chart */}
          <div
            className={`lg:col-span-2 rounded-2xl border p-6 ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`text-lg font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Portfolio Performance
            </h3>

            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient
                      id='portfolioGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor='#F1CB68' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#F1CB68' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke={isDarkMode ? '#333' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                    style={{ fontSize: '12px' }}
                    tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1A1A1D' : '#fff',
                      border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    formatter={value => [
                      `$${value.toLocaleString()}`,
                      'Portfolio Value',
                    ]}
                  />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#F1CB68'
                    strokeWidth={2}
                    fill='url(#portfolioGradient)'
                    dot={{ fill: '#F1CB68', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`text-lg font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Asset Allocation
            </h3>

            <div className='h-48 mb-6'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1A1A1D' : '#fff',
                      border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    formatter={value => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='space-y-3'>
              {allocationData.map((item, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      ${item.value.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-400'>{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Holdings */}
        <div
          className={`rounded-2xl border overflow-hidden mb-6 ${
            isDarkMode
              ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='p-6 border-b border-[#FFFFFF14]'>
            <div className='flex items-center justify-between'>
              <h3
                className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Top Holdings
              </h3>
              <Link
                href='/dashboard/portfolio/crypto'
                className='text-sm text-[#F1CB68] hover:underline'
              >
                View All →
              </Link>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Asset
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Type
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Shares
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Avg Price
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Current Price
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Total Value
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((holding, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                    } hover:bg-white/5 transition-colors`}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-100'
                          }`}
                        >
                          {holding.symbol.charAt(0)}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {holding.symbol}
                          </p>
                          <p className='text-xs text-gray-400'>
                            {holding.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          holding.type === 'Stock'
                            ? 'bg-[#F1CB68]/10 text-[#F1CB68]'
                            : 'bg-[#36D399]/10 text-[#36D399]'
                        }`}
                      >
                        {holding.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {holding.shares}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      ${holding.avgPrice.toLocaleString()}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      ${holding.currentPrice.toLocaleString()}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      ${holding.value.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex flex-col items-end'>
                        <span className='text-sm font-semibold text-[#36D399]'>
                          +${holding.change.toLocaleString()}
                        </span>
                        <span className='text-xs text-[#36D399]'>
                          +{holding.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Activity */}
          <div
            className={`rounded-2xl border ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className='p-6 border-b border-[#FFFFFF14]'>
              <div className='flex items-center justify-between'>
                <h3
                  className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Recent Activity
                </h3>
                <Link
                  href='/dashboard/portfolio/trade-engine'
                  className='text-sm text-[#F1CB68] hover:underline'
                >
                  View All →
                </Link>
              </div>
            </div>

            <div className='p-6'>
              <div className='space-y-4'>
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'buy'
                              ? 'bg-[#36D399]/20'
                              : activity.type === 'sell'
                              ? 'bg-[#FF6B6B]/20'
                              : 'bg-[#F1CB68]/20'
                          }`}
                        >
                          {activity.type === 'buy' ? (
                            <svg
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='#36D399'
                              strokeWidth='2'
                            >
                              <path d='M12 19V5M5 12l7-7 7 7' />
                            </svg>
                          ) : activity.type === 'sell' ? (
                            <svg
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='#FF6B6B'
                              strokeWidth='2'
                            >
                              <path d='M12 5v14M19 12l-7 7-7-7' />
                            </svg>
                          ) : (
                            <svg
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='#F1CB68'
                              strokeWidth='2'
                            >
                              <path d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {activity.type === 'buy'
                              ? 'Bought'
                              : activity.type === 'sell'
                              ? 'Sold'
                              : 'Received'}{' '}
                            {activity.asset}
                          </p>
                          <p className='text-xs text-gray-400'>
                            {activity.name}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p
                          className={`text-sm font-semibold ${
                            activity.type === 'buy' ||
                            activity.type === 'dividend'
                              ? 'text-[#36D399]'
                              : 'text-[#FF6B6B]'
                          }`}
                        >
                          {activity.type === 'sell' ? '-' : '+'}$
                          {activity.total.toLocaleString()}
                        </p>
                        <p className='text-xs text-gray-400'>
                          {activity.date} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-xs text-gray-400'>
                      <span>
                        {activity.amount}{' '}
                        {activity.type === 'dividend' ? 'shares' : 'units'} @ $
                        {activity.price}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          activity.type === 'buy'
                            ? 'bg-[#36D399]/10 text-[#36D399]'
                            : activity.type === 'sell'
                            ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                            : 'bg-[#F1CB68]/10 text-[#F1CB68]'
                        }`}
                      >
                        {activity.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Market Summary */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Quick Actions
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                <Link
                  href='/dashboard/portfolio/trade-engine'
                  className={`p-4 rounded-xl border-2 transition-all hover:border-[#F1CB68] ${
                    isDarkMode
                      ? 'border-[#FFFFFF14] bg-[#2C2C2E]'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='w-10 h-10 rounded-lg bg-[#36D399]/20 flex items-center justify-center mb-3'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#36D399'
                      strokeWidth='2'
                    >
                      <path d='M12 19V5M5 12l7-7 7 7' />
                    </svg>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Buy Assets
                  </p>
                  <p className='text-xs text-gray-400'>Place new order</p>
                </Link>

                <Link
                  href='/dashboard/portfolio/cash-flow'
                  className={`p-4 rounded-xl border-2 transition-all hover:border-[#F1CB68] ${
                    isDarkMode
                      ? 'border-[#FFFFFF14] bg-[#2C2C2E]'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='w-10 h-10 rounded-lg bg-[#F1CB68]/20 flex items-center justify-center mb-3'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <path d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' />
                    </svg>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Transfer Funds
                  </p>
                  <p className='text-xs text-gray-400'>Manage cash flow</p>
                </Link>

                <Link
                  href='/dashboard/marketplace'
                  className={`p-4 rounded-xl border-2 transition-all hover:border-[#F1CB68] ${
                    isDarkMode
                      ? 'border-[#FFFFFF14] bg-[#2C2C2E]'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='w-10 h-10 rounded-lg bg-[#60A5FA]/20 flex items-center justify-center mb-3'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#60A5FA'
                      strokeWidth='2'
                    >
                      <path d='M3 3h18l-2 13H5L3 3zM16 16a2 2 0 11-4 0' />
                    </svg>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Explore Market
                  </p>
                  <p className='text-xs text-gray-400'>Find opportunities</p>
                </Link>

                <Link
                  href='/dashboard/reports'
                  className={`p-4 rounded-xl border-2 transition-all hover:border-[#F1CB68] ${
                    isDarkMode
                      ? 'border-[#FFFFFF14] bg-[#2C2C2E]'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='w-10 h-10 rounded-lg bg-[#F1CB68]/20 flex items-center justify-center mb-3'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <path d='M9 17H7a2 2 0 01-2-2V7a2 2 0 012-2h6l4 4v8a2 2 0 01-2 2h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2M9 17h6' />
                    </svg>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    View Reports
                  </p>
                  <p className='text-xs text-gray-400'>Analytics & insights</p>
                </Link>
              </div>
            </div>

            {/* Market Summary */}
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Market Summary
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>S&P 500</span>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      4,515.77
                    </p>
                    <p className='text-xs text-[#36D399]'>+0.85%</p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>NASDAQ</span>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      14,035.39
                    </p>
                    <p className='text-xs text-[#36D399]'>+1.12%</p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>Bitcoin</span>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      $35,200
                    </p>
                    <p className='text-xs text-[#FF6B6B]'>-2.34%</p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>Ethereum</span>
                  <div className='text-right'>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      $2,145
                    </p>
                    <p className='text-xs text-[#36D399]'>+1.56%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Alerts */}
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Portfolio Alerts
              </h3>
              <div className='space-y-3'>
                <div className='p-3 rounded-lg bg-[#36D399]/10 border border-[#36D399]/30'>
                  <div className='flex items-start gap-3'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#36D399'
                      className='shrink-0 mt-0.5'
                    >
                      <circle cx='12' cy='12' r='10' strokeWidth='2' />
                      <path d='M12 8v4M12 16h.01' strokeWidth='2' />
                    </svg>
                    <div>
                      <p className='text-xs font-semibold text-[#36D399]'>
                        Dividend Received
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        $375 dividend from MSFT has been credited
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-3 rounded-lg bg-[#F1CB68]/10 border border-[#F1CB68]/30'>
                  <div className='flex items-start gap-3'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      className='shrink-0 mt-0.5'
                    >
                      <circle cx='12' cy='12' r='10' strokeWidth='2' />
                      <path d='M12 8v4M12 16h.01' strokeWidth='2' />
                    </svg>
                    <div>
                      <p className='text-xs font-semibold text-[#F1CB68]'>
                        Price Alert
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        AAPL reached your target price of $185
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// MetricCard Component
function MetricCard({
  icon,
  title,
  value,
  change,
  positive,
  subtitle,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-3 mb-3'>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-100'
          }`}
        >
          <img src={icon} alt={title} className='w-5 h-5' />
        </div>
        <p
          className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {title}
        </p>
      </div>
      <p
        className={`text-2xl font-bold mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      {change && (
        <p
          className={`text-sm ${
            positive ? 'text-[#36D399]' : 'text-[#FF6B6B]'
          }`}
        >
          {change}
        </p>
      )}
      {subtitle && (
        <p
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
