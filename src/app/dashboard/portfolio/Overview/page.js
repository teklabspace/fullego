'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
import {
  getPortfolioSummary,
  getPortfolioPerformance,
  getAssetAllocation,
  getTopHoldings,
  getRecentActivity,
  getMarketSummary,
  getPortfolioAlerts,
} from '@/utils/portfolioApi';
import PortfolioOverviewSkeleton from '@/components/skeletons/PortfolioOverviewSkeleton';

export default function PortfolioOverviewPage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState('1M');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [topHoldings, setTopHoldings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [marketSummary, setMarketSummary] = useState(null);
  const [portfolioAlerts, setPortfolioAlerts] = useState([]);

  // Fetch all portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map time range to days for performance API
        const timeRangeToDays = {
          '1D': 1,
          '1W': 7,
          '1M': 30,
          '3M': 90,
          '1Y': 365,
          'ALL': 365,
        };

        // Fetch all data in parallel
        const [
          summaryRes,
          performanceRes,
          allocationRes,
          holdingsRes,
          activityRes,
          marketRes,
          alertsRes,
        ] = await Promise.all([
          getPortfolioSummary(timeRange),
          getPortfolioPerformance(timeRangeToDays[timeRange] || 30),
          getAssetAllocation(),
          getTopHoldings({ limit: 10 }),
          getRecentActivity({ limit: 10 }),
          getMarketSummary(),
          getPortfolioAlerts({ status: 'active', limit: 10 }),
        ]);

        // Set summary data
        if (summaryRes.data) {
          setPortfolioSummary(summaryRes.data);
        }

        // Format performance data for chart
        if (performanceRes.daily_returns) {
          const formatted = performanceRes.daily_returns.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
            value: item.value,
          }));
          setPerformanceData(formatted);
        }

        // Format allocation data
        if (allocationRes.data && Array.isArray(allocationRes.data)) {
          const colors = ['#F1CB68', '#36D399', '#60A5FA', '#F1CB68', '#FF6B6B', '#A78BFA'];
          const formatted = allocationRes.data.map((item, index) => ({
            name: item.assetType || item.name,
            value: item.value,
            percentage: item.percentage,
            color: colors[index % colors.length],
          }));
          setAllocationData(formatted);
        }

        // Set top holdings
        if (holdingsRes.data) {
          setTopHoldings(holdingsRes.data);
        }

        // Format recent activity
        if (activityRes.data) {
          const formatted = activityRes.data.map(item => ({
            ...item,
            time: item.time ? item.time.split(':').slice(0, 2).join(':') + ' ' + (parseInt(item.time.split(':')[0]) >= 12 ? 'PM' : 'AM') : '',
          }));
          setRecentActivity(formatted);
        }

        // Set market summary
        if (marketRes.data) {
          setMarketSummary(marketRes.data);
        }

        // Set alerts
        if (alertsRes.data) {
          setPortfolioAlerts(alertsRes.data);
        }
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        
        // Extract more helpful error message
        let errorMessage = 'Failed to load portfolio data';
        
        if (err.data) {
          // Check for backend connectivity issues
          if (err.data.message && err.data.message.includes('Backend server is not reachable')) {
            errorMessage = 'Backend server is not running. Please start the backend server.';
          } else if (err.data.message && err.data.message.includes('Cannot connect to backend')) {
            errorMessage = err.data.message;
          } else if (err.data.detail) {
            errorMessage = Array.isArray(err.data.detail) 
              ? err.data.detail.map(d => typeof d === 'string' ? d : d.msg || JSON.stringify(d)).join('; ')
              : err.data.detail;
          } else if (err.data.message) {
            errorMessage = err.data.message;
          } else if (err.data.error) {
            errorMessage = err.data.error;
          }
        } else if (err.message) {
          if (err.message.includes('fetch failed') || err.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to backend server. Please ensure the backend is running.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format currency compactly for large numbers
  const formatCurrencyCompact = (value) => {
    if (!value && value !== 0) return '$0.00';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }
    return formatCurrency(value);
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <DashboardLayout>
        <PortfolioOverviewSkeleton isDarkMode={isDarkMode} />
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !portfolioSummary) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className='mb-4 flex justify-center'>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke={isDarkMode ? '#EF4444' : '#DC2626'}
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
          </div>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading portfolio
          </p>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

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
                  {portfolioSummary?.totalPortfolioValue
                    ? formatCurrency(portfolioSummary.totalPortfolioValue)
                    : '$0.00'}
                </h2>
                <div className='flex items-center gap-4 mt-3'>
                  <div className='flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke={portfolioSummary?.totalReturns >= 0 ? '#36D399' : '#FF6B6B'}
                      strokeWidth='2'
                    >
                      <path d={portfolioSummary?.totalReturns >= 0 ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'} />
                    </svg>
                    <span className={`text-lg font-semibold ${
                      portfolioSummary?.totalReturns >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                    }`}>
                      {portfolioSummary?.totalReturns >= 0 ? '+' : ''}
                      {portfolioSummary?.totalReturns
                        ? formatCurrency(portfolioSummary.totalReturns)
                        : '$0.00'}{' '}
                      ({portfolioSummary?.returnPercentage != null
                        ? (parseFloat(portfolioSummary.returnPercentage) >= 0 ? '+' : '') + parseFloat(portfolioSummary.returnPercentage).toFixed(2)
                        : '0.00'}%)
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {timeRange === 'ALL' ? 'All Time' : timeRange}
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
                  <p className={`text-xl font-bold ${
                    portfolioSummary?.todayChange >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                  }`}>
                    {portfolioSummary?.todayChange >= 0 ? '+' : ''}
                    {portfolioSummary?.todayChange
                      ? formatCurrency(portfolioSummary.todayChange)
                      : '$0.00'}
                  </p>
                  <p className={`text-xs ${
                    portfolioSummary?.todayChangePercentage >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                  }`}>
                    {portfolioSummary?.todayChangePercentage >= 0 ? '+' : ''}
                    {portfolioSummary?.todayChangePercentage != null ? parseFloat(portfolioSummary.todayChangePercentage).toFixed(2) : '0.00'}%
                  </p>
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
                    {portfolioSummary?.cashAvailable
                      ? formatCurrency(portfolioSummary.cashAvailable)
                      : '$0.00'}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {portfolioSummary?.cashPercentage != null ? parseFloat(portfolioSummary.cashPercentage).toFixed(1) : '0.0'}% of portfolio
                  </p>
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
            value={portfolioSummary?.totalInvested ? formatCurrencyCompact(portfolioSummary.totalInvested) : '$0.00'}
            change={portfolioSummary?.totalReturns ? `+${formatCurrencyCompact(portfolioSummary.totalReturns)}` : undefined}
            positive={portfolioSummary?.totalReturns >= 0}
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/icons/net-cash-flow-icon.svg'
            title='Total Returns'
            value={portfolioSummary?.totalReturns ? formatCurrency(portfolioSummary.totalReturns) : '$0.00'}
            subtitle={portfolioSummary?.returnPercentage != null ? `${parseFloat(portfolioSummary.returnPercentage).toFixed(2)}% return` : '0.00% return'}
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/icons/cash-flow-forecast.svg'
            title='Asset Types'
            value={portfolioSummary?.assetTypesCount?.toString() || '0'}
            subtitle={allocationData.length > 0 ? allocationData.map(a => a.name).join(', ') : 'No assets'}
            isDarkMode={isDarkMode}
          />
          <MetricCard
            icon='/assets.svg'
            title='Total Holdings'
            value={portfolioSummary?.totalHoldings?.toString() || '0'}
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
              {performanceData.length > 0 ? (
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
              ) : (
                <div className='h-full flex items-center justify-center text-gray-400'>
                  No performance data available
                </div>
              )}
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
              {allocationData.length > 0 ? (
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
              ) : (
                <div className='h-full flex items-center justify-center text-gray-400'>
                  No allocation data
                </div>
              )}
            </div>

            <div className='space-y-3'>
              {allocationData.length > 0 ? (
                allocationData.map((item, index) => (
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
                    <p className='text-xs text-gray-400'>{item.percentage != null ? parseFloat(item.percentage).toFixed(1) : '0.0'}%</p>
                  </div>
                </div>
                ))
              ) : (
                <div className='text-center py-4 text-gray-400 text-sm'>
                  No allocation data available
                </div>
              )}
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
                {topHoldings.length > 0 ? (
                  topHoldings.map((holding, index) => (
                    <tr
                      key={`${holding.symbol || 'holding'}-${index}-${holding.id || index}`}
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
                            {holding.symbol?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {holding.symbol || 'N/A'}
                            </p>
                            <p className='text-xs text-gray-400'>
                              {holding.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            holding.type === 'Stock'
                              ? 'bg-[#F1CB68]/10 text-[#F1CB68]'
                              : holding.type === 'Crypto'
                              ? 'bg-[#36D399]/10 text-[#36D399]'
                              : 'bg-[#60A5FA]/10 text-[#60A5FA]'
                          }`}
                        >
                          {holding.type || 'Unknown'}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.shares?.toLocaleString() || '0'}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {holding.avgPrice ? formatCurrency(holding.avgPrice) : '$0.00'}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.currentPrice ? formatCurrency(holding.currentPrice) : '$0.00'}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.value ? formatCurrency(holding.value) : '$0.00'}
                      </td>
                      <td className='px-6 py-4 text-right'>
                      <div className='flex flex-col items-end'>
                        <span className={`text-sm font-semibold ${
                          (holding.change || 0) >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                        }`}>
                          {(holding.change || 0) >= 0 ? '+' : ''}
                          {holding.change ? formatCurrency(holding.change) : '$0.00'}
                        </span>
                        <span className={`text-xs ${
                          (() => {
                            const change = parseFloat(holding.changePercentage || holding.changePercent || 0);
                            return isNaN(change) ? 0 : change;
                          })() >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                        }`}>
                          {(() => {
                            const change = parseFloat(holding.changePercentage || holding.changePercent || 0);
                            if (isNaN(change)) return '0.00%';
                            return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                          })()}
                        </span>
                      </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='px-6 py-8 text-center text-gray-400'>
                      No holdings found
                    </td>
                  </tr>
                )}
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
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
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
                  ))
                ) : (
                  <div className='text-center py-8 text-gray-400'>
                    No recent activity
                  </div>
                )}
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
                {marketSummary?.indices && marketSummary.indices.length > 0 ? (
                  marketSummary.indices.map((index, idx) => (
                    <div key={idx} className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>{index.name}</span>
                      <div className='text-right'>
                        <p
                          className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {index.value?.toLocaleString() || '0.00'}
                        </p>
                        <p className={`text-xs ${
                          (index.changePercentage || 0) >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                        }`}>
                          {(() => {
                            const change = parseFloat(index.changePercentage || 0);
                            if (isNaN(change)) return '0.00%';
                            return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                          })()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : null}
                {marketSummary?.crypto && marketSummary.crypto.length > 0 ? (
                  marketSummary.crypto.map((crypto, idx) => (
                    <div key={idx} className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>{crypto.name || crypto.symbol}</span>
                      <div className='text-right'>
                        <p
                          className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {crypto.price ? formatCurrency(crypto.price) : '$0.00'}
                        </p>
                        <p className={`text-xs ${
                          (crypto.changePercentage || 0) >= 0 ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                        }`}>
                          {(() => {
                            const change = parseFloat(crypto.changePercentage || 0);
                            if (isNaN(change)) return '0.00%';
                            return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                          })()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : null}
                {(!marketSummary?.indices || marketSummary.indices.length === 0) &&
                 (!marketSummary?.crypto || marketSummary.crypto.length === 0) && (
                  <div className='text-center py-4 text-gray-400 text-sm'>
                    No market data available
                  </div>
                )}
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
                {portfolioAlerts.length > 0 ? (
                  portfolioAlerts.map((alert, index) => {
                    const severityColors = {
                      info: { bg: 'bg-[#36D399]/10', border: 'border-[#36D399]/30', text: 'text-[#36D399]' },
                      warning: { bg: 'bg-[#F1CB68]/10', border: 'border-[#F1CB68]/30', text: 'text-[#F1CB68]' },
                      error: { bg: 'bg-[#FF6B6B]/10', border: 'border-[#FF6B6B]/30', text: 'text-[#FF6B6B]' },
                    };
                    const colors = severityColors[alert.severity] || severityColors.info;
                    
                    return (
                      <div key={alert.id || index} className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                        <div className='flex items-start gap-3'>
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke={colors.text.replace('text-', '#')}
                            className='shrink-0 mt-0.5'
                          >
                            <circle cx='12' cy='12' r='10' strokeWidth='2' />
                            <path d='M12 8v4M12 16h.01' strokeWidth='2' />
                          </svg>
                          <div>
                            <p className={`text-xs font-semibold ${colors.text}`}>
                              {alert.title || 'Alert'}
                            </p>
                            <p className='text-xs text-gray-400 mt-1'>
                              {alert.message || 'No message'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='text-center py-4 text-gray-400 text-sm'>
                    No alerts
                  </div>
                )}
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
      className={`rounded-xl border p-4 min-w-0 ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-3 mb-3'>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
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
      <div className='min-w-0'>
        <p
          className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 whitespace-nowrap ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ 
            lineHeight: '1.2'
          }}
        >
          {value}
        </p>
      </div>
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
