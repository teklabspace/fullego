'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getCryptoPortfolioSummary,
  getCryptoPerformance,
  getCryptoBreakdown,
  getCryptoHoldings,
} from '@/utils/portfolioApi';
import CryptoPortfolioSkeleton from '@/components/skeletons/CryptoPortfolioSkeleton';

export default function CryptoPortfolioPage() {
  const { isDarkMode } = useTheme();
  const [performanceTab, setPerformanceTab] = useState('value-over-time');
  const [timeRange, setTimeRange] = useState('24h');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] =
    useState('5th Jan - 30th Jan');
  const [portfolioBreakdownTab, setPortfolioBreakdownTab] = useState('value');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [cryptoSummary, setCryptoSummary] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [holdings, setHoldings] = useState([]);

  // Fetch crypto portfolio data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map performance tab to API metric
        const metricMap = {
          'value-over-time': 'value-over-time',
          'return-rate': 'return-rate',
          'risk-exposure': 'risk-exposure',
        };

        // Fetch all data in parallel
        const [
          summaryRes,
          performanceRes,
          breakdownRes,
          holdingsRes,
        ] = await Promise.all([
          getCryptoPortfolioSummary(),
          getCryptoPerformance(timeRange, metricMap[performanceTab] || 'value-over-time'),
          getCryptoBreakdown(portfolioBreakdownTab),
          getCryptoHoldings({ sortBy: 'value', order: 'desc' }),
        ]);

        // Set summary
        if (summaryRes.data) {
          setCryptoSummary(summaryRes.data);
        }

        // Set performance data
        if (performanceRes.data) {
          setPerformanceData(performanceRes.data);
        }

        // Set breakdown data
        if (breakdownRes.data) {
          setBreakdownData(breakdownRes.data);
        }

        // Set holdings
        if (holdingsRes.data) {
          setHoldings(holdingsRes.data);
        }
      } catch (err) {
        console.error('Error fetching crypto portfolio data:', err);
        const errorMessage = err.data?.detail || err.message || 'Failed to load crypto portfolio data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [timeRange, performanceTab, portfolioBreakdownTab]);

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

  // Get chart data
  const getChartData = () => {
    return performanceData;
  };

  // Get portfolio breakdown
  const getPortfolioBreakdown = () => {
    return breakdownData;
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <DashboardLayout>
        <CryptoPortfolioSkeleton isDarkMode={isDarkMode} />
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !cryptoSummary) {
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
            Error loading crypto portfolio
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
        <div className='mb-6 rounded-2xl'>
          <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
            {/* Left Section - Title */}
            <div className='flex-shrink-0'>
              {/* All Assets */}
              <div className='flex items-center gap-2'>
                <img src='/assets.svg' alt='Assets' className='w-4 h-4' />
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  All Assets
                </span>
              </div>

              <h1
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Crypto Portfolio
              </h1>
            </div>

            {/* Right Section - Controls Row 1 (Scrollable on mobile) */}
            <div className='flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide'>
              <div className='flex items-center gap-3'>
                {/* Time Range Dropdown */}
                <div className='relative flex-shrink-0'>
                  <button
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <span className='text-sm font-medium'>{timeRange}</span>
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className={`transition-transform ${
                        showTimeDropdown ? 'rotate-180' : ''
                      } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <path d='M6 9l6 6 6-6' strokeWidth='2' />
                    </svg>
                  </button>

                  {showTimeDropdown && (
                    <>
                      <div
                        className='fixed inset-0 z-40'
                        onClick={() => setShowTimeDropdown(false)}
                      />
                      <div
                        className={`absolute top-full mt-2 right-0 w-32 rounded-lg overflow-hidden z-50 ${
                          isDarkMode ? 'bg-[#2C2C2E]' : 'bg-white'
                        }`}
                        style={{
                          boxShadow: isDarkMode
                            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
                            : '0 10px 40px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {['1h', '6h', '12h', '24h'].map(range => (
                          <button
                            key={range}
                            onClick={() => {
                              setTimeRange(range);
                              setShowTimeDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all ${
                              timeRange === range
                                ? 'bg-[#F1CB68] text-white'
                                : isDarkMode
                                ? 'text-gray-300 hover:bg-[#3C3C3E]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Link/Share Button */}
                <button
                  className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    <path
                      d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                    <path
                      d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>

                {/* Refresh Button */}
                <button
                  className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => window.location.reload()}
                >
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    <path
                      d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>

                {/* Date Range Selector */}
                <div className='relative flex-shrink-0'>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                    >
                      <rect
                        x='3'
                        y='4'
                        width='18'
                        height='18'
                        rx='2'
                        ry='2'
                        strokeWidth='2'
                      />
                      <line x1='16' y1='2' x2='16' y2='6' strokeWidth='2' />
                      <line x1='8' y1='2' x2='8' y2='6' strokeWidth='2' />
                      <line x1='3' y1='10' x2='21' y2='10' strokeWidth='2' />
                    </svg>
                    <span className='text-sm font-medium'>
                      {selectedDateRange}
                    </span>
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className={`transition-transform ${
                        showDatePicker ? 'rotate-180' : ''
                      } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <path d='M6 9l6 6 6-6' strokeWidth='2' />
                    </svg>
                  </button>

                  {showDatePicker && (
                    <DatePicker
                      isDarkMode={isDarkMode}
                      onClose={() => setShowDatePicker(false)}
                      onSelect={range => {
                        setSelectedDateRange(range);
                        setShowDatePicker(false);
                      }}
                    />
                  )}
                </div>

                {/* Export Button */}
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span className='text-sm font-medium'>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <StatCard
            label='Total Value'
            value={cryptoSummary?.totalValue ? formatCurrency(cryptoSummary.totalValue) : '$0.00'}
            subtitle={cryptoSummary?.totalReturn ? `+${formatCurrency(cryptoSummary.totalReturn)}` : '$0.00'}
            trend='up'
            trendValue={cryptoSummary?.returnPercentage ? `+${cryptoSummary.returnPercentage.toFixed(1)}%` : '0%'}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label='Total Return'
            value={cryptoSummary?.returnPercentage ? `+${cryptoSummary.returnPercentage.toFixed(1)}%` : '0%'}
            subtitle={cryptoSummary?.totalReturn ? formatCurrency(cryptoSummary.totalReturn) : '$0.00'}
            trend='up'
            trendValue={cryptoSummary?.returnPercentage ? `+${cryptoSummary.returnPercentage.toFixed(1)}%` : '0%'}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label='Volatility'
            value={cryptoSummary?.volatility || 'Low'}
            subtitle={cryptoSummary?.volatilityScore?.toString() || '0.000'}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label='Risk Grade'
            value={cryptoSummary?.riskGrade || 'N/A'}
            subtitle={cryptoSummary?.riskLevel || 'Unknown'}
            isDarkMode={isDarkMode}
            highlight
          />
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          {/* Performance Chart */}
          <div className='lg:col-span-2'>
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className='flex justify-start mb-10   items-center'>
                <h2
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Performance
                </h2>

                {/* Tabs */}
                <div
                  className={`flex gap-2 ms-5 p-2 rounded-full overflow-x-auto ${
                    isDarkMode ? '' : 'bg-transparent'
                  }`}
                  style={
                    isDarkMode
                      ? {
                          background:
                            'linear-gradient(to right, #222126 0%, #111116 100%)',
                        }
                      : {
                          background: 'rgba(241, 203, 104, 0.2)',
                        }
                  }
                >
                  <TabButton
                    active={performanceTab === 'value-over-time'}
                    onClick={() => setPerformanceTab('value-over-time')}
                    isDarkMode={isDarkMode}
                  >
                    Value Over Time
                  </TabButton>
                  <TabButton
                    active={performanceTab === 'return-rate'}
                    onClick={() => setPerformanceTab('return-rate')}
                    isDarkMode={isDarkMode}
                  >
                    Return Rate
                  </TabButton>
                  <TabButton
                    active={performanceTab === 'risk-exposure'}
                    onClick={() => setPerformanceTab('risk-exposure')}
                    isDarkMode={isDarkMode}
                  >
                    Risk Exposure
                  </TabButton>
                </div>
              </div>
              {/* Chart */}
              <div className='h-100'>
                {getChartData().length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient
                        id='colorValue'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='0%'
                          stopColor='rgba(250, 197, 21, 0.1)'
                          stopOpacity={1}
                        />
                        <stop
                          offset='94.88%'
                          stopColor='rgba(250, 197, 21, 0)'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={isDarkMode ? '#333' : '#e5e7eb'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='time'
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      style={{ fontSize: '12px' }}
                      tickFormatter={value =>
                        performanceTab === 'value-over-time'
                          ? `$${(value / 1000).toFixed(0)}k`
                          : performanceTab === 'return-rate'
                          ? `${value}%`
                          : `${value}`
                      }
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
                      formatter={value =>
                        performanceTab === 'value-over-time'
                          ? [`$${value.toLocaleString()}`, 'Value']
                          : performanceTab === 'return-rate'
                          ? [`${value}%`, 'Return']
                          : [`${value}`, 'Risk']
                      }
                    />
                    <Area
                      type='monotone'
                      dataKey='value'
                      stroke='#FAC515'
                      strokeWidth={2}
                      fill='url(#colorValue)'
                      dot={{ fill: '#FAC515', r: 4 }}
                      activeDot={{ r: 6 }}
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
          </div>

          {/* Portfolio Breakdown */}
          <div className='lg:col-span-1 '>
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Portfolio Breakdown
                </h2>
              </div>

              {/* Tabs */}
              <div className='flex gap-2 mb-6'>
                <button
                  onClick={() => setPortfolioBreakdownTab('value')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    portfolioBreakdownTab === 'value'
                      ? isDarkMode
                        ? ''
                        : 'text-black'
                      : isDarkMode
                      ? ''
                      : 'text-black'
                  }`}
                  style={
                    portfolioBreakdownTab === 'value'
                      ? isDarkMode
                        ? {
                            background:
                              'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                            color: '#fff',
                          }
                        : {
                            background: 'rgba(241, 203, 104, 0.2)',
                            color: '#000',
                          }
                      : isDarkMode
                      ? {
                          background: 'transparent',
                          color: '#FFFFFF',
                        }
                      : {
                          background: 'transparent',
                          color: '#000',
                        }
                  }
                >
                  Value
                </button>
                <button
                  onClick={() => setPortfolioBreakdownTab('returnRate')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    portfolioBreakdownTab === 'returnRate'
                      ? isDarkMode
                        ? ''
                        : 'text-black'
                      : isDarkMode
                      ? ''
                      : 'text-black'
                  }`}
                  style={
                    portfolioBreakdownTab === 'returnRate'
                      ? isDarkMode
                        ? {
                            background:
                              'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                            color: '#fff',
                          }
                        : {
                            background: 'rgba(241, 203, 104, 0.2)',
                            color: '#000',
                          }
                      : isDarkMode
                      ? {
                          background: 'transparent',
                          color: '#FFFFFF',
                        }
                      : {
                          background: 'transparent',
                          color: '#000',
                        }
                  }
                >
                  Return Rate
                </button>
              </div>

              {/* Bar Chart */}
              <div className='h-48 mb-6'>
                {getPortfolioBreakdown().length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={getPortfolioBreakdown()}>
                    <XAxis
                      dataKey='name'
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1A1A1D' : '#fff',
                        border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value, name, props) => {
                        if (portfolioBreakdownTab === 'value') {
                          return [
                            `$${props.payload.value.toLocaleString()}`,
                            'Value',
                          ];
                        } else {
                          return [`${value}%`, 'Return Rate'];
                        }
                      }}
                    />
                    <Bar
                      dataKey='percentage'
                      radius={[8, 8, 0, 0]}
                      fill='url(#barGradient)'
                    />
                    <defs>
                      <linearGradient
                        id='barGradient'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'
                      >
                        <stop offset='0%' stopColor='#FFFFFF' />
                        <stop offset='100%' stopColor='#F1CB68' />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
                ) : (
                  <div className='h-full flex items-center justify-center text-gray-400'>
                    No breakdown data available
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className='space-y-3'>
                {getPortfolioBreakdown().length > 0 ? (
                  getPortfolioBreakdown().map(item => (
                  <div key={item.name} className='flex items-center gap-3'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`text-sm flex-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  ))
                ) : (
                  <div className='text-center py-4 text-gray-400 text-sm'>
                    No breakdown data
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div
          className={`rounded-2xl border ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='p-6 border-b border-[#FFFFFF14]'>
            <div className='flex items-center justify-between'>
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Holdings
              </h2>
              <button
                className={`text-sm flex items-center gap-1 ${
                  isDarkMode
                    ? 'text-[#F1CB68] hover:text-[#C49D2E]'
                    : 'text-[#F1CB68] hover:text-[#C49D2E]'
                } transition-colors`}
              >
                View All
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' strokeWidth='2' />
                </svg>
              </button>
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
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Quantity
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
                    % Change
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Market Value
                  </th>
                  <th
                    className={`text-right px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Portfolio Weight
                  </th>
                  <th className='px-6 py-4'></th>
                </tr>
              </thead>
              <tbody>
                {holdings.length > 0 ? (
                  holdings.map(holding => (
                    <tr
                      key={holding.id || holding.symbol}
                      className={`border-b ${
                        isDarkMode
                          ? 'border-[#FFFFFF14] hover:bg-white/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-10 h-10 rounded-full flex items-center justify-center text-white font-bold'
                            style={{ backgroundColor: holding.iconBg || '#F7931A' }}
                          >
                            {holding.icon || holding.symbol?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div
                              className={`font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {holding.name || 'Unknown'}
                            </div>
                            <div
                              className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {holding.symbol || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.quantity?.toLocaleString() || '0'}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.currentPrice ? formatCurrency(holding.currentPrice) : '$0.00'}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex flex-col items-end gap-1'>
                          <span
                            className={`text-sm font-medium ${
                              (holding.change24h || 0) >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {(holding.change24h || 0) >= 0 ? '+' : ''}
                            {(holding.change24h || 0).toFixed(2)}% (24h)
                          </span>
                          <span
                            className={`text-xs ${
                              (holding.change7d || 0) >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {(holding.change7d || 0) >= 0 ? '+' : ''}
                            {(holding.change7d || 0).toFixed(2)}% (7d)
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {holding.marketValue ? formatCurrency(holding.marketValue) : '$0.00'}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <div className='w-24 h-2 bg-gray-700 rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full'
                              style={{
                                width: `${holding.portfolioWeight || 0}%`,
                                background:
                                  'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                              }}
                            />
                          </div>
                          <span
                            className={`text-sm font-semibold min-w-[3rem] ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {(holding.portfolioWeight || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <button
                          className={`${
                            isDarkMode
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          } transition-colors`}
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                          >
                            <circle cx='12' cy='12' r='1' />
                            <circle cx='12' cy='5' r='1' />
                            <circle cx='12' cy='19' r='1' />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='px-6 py-8 text-center text-gray-400'>
                      No crypto holdings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// StatCard Component
function StatCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  highlight,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        isDarkMode
          ? 'bg-gradient-to-r from-[#111116] to-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-start justify-between mb-2'>
        <span
          className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {label}
        </span>
        {trend && (
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            className='text-green-500'
          >
            <path d='M12 19V5M5 12l7-7 7 7' strokeWidth='2' />
          </svg>
        )}
      </div>
      <div
        className={`text-3xl font-bold mb-1 ${
          highlight
            ? 'text-[#F1CB68]'
            : isDarkMode
            ? 'text-white'
            : 'text-gray-900'
        }`}
      >
        {value}
      </div>
      <div className='flex-col items-center gap-2'>
        <span
          className={`text-xs  text-nowrap ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          {subtitle}
        </span>
        {trendValue && (
          <>
            <div className='w-36 mt-4 h-1 bg-[#F1CB68] rounded-full' />
          </>
        )}
      </div>
    </div>
  );
}

// TabButton Component
function TabButton({ active, onClick, children, isDarkMode }) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 text-xs  font-medium rounded-full transition-all whitespace-nowrap ${
          isDarkMode ? 'bg-[#313035] text-white' : 'bg-[#F1CB68] text-black'
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
        isDarkMode ? '' : 'text-black'
      }`}
      style={
        isDarkMode
          ? {
              color: '#F',
            }
          : {
              color: '#000',
            }
      }
    >
      {children}
    </button>
  );
}

// DatePicker Component
function DatePicker({ isDarkMode, onClose, onSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is first day
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month days
    if (firstDay > 0) {
      const prevMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1
      );
      const prevMonthDays = getDaysInMonth(prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          day: prevMonthDays - i,
          isCurrentMonth: false,
          date: new Date(
            prevMonth.getFullYear(),
            prevMonth.getMonth(),
            prevMonthDays - i
          ),
        });
      }
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
      });
    }

    return days;
  };

  const handleDateClick = date => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date > startDate) {
        setEndDate(date);
      } else {
        setEndDate(startDate);
        setStartDate(date);
      }
    }
  };

  const isDateInRange = date => {
    if (!startDate || !date) return false;
    if (!endDate) return date.getTime() === startDate.getTime();
    return date >= startDate && date <= endDate;
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const formatDate = date => {
        const day = date.getDate();
        const month = monthNames[date.getMonth()].slice(0, 3);
        return `${day}${
          day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'
        } ${month}`;
      };
      const range = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      onSelect(range);
    }
  };

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <div
        className={`absolute top-full mt-2 right-0 w-96 rounded-2xl z-50 p-6 ${
          isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
        }`}
        style={{
          boxShadow: isDarkMode
            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
            : '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h3
            className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Select Date Range
          </h3>
          <button
            onClick={onClose}
            className={`${
              isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M18 6L6 18M6 6l12 12'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className='flex items-center justify-between mb-4'>
          <h4
            className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <div className='flex gap-2'>
            <button
              onClick={goToPreviousMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-[#2C2C2E]' : 'hover:bg-gray-100'
              }`}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  d='M15 18l-6-6 6-6'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-[#2C2C2E]' : 'hover:bg-gray-100'
              }`}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path d='M9 18l6-6-6-6' strokeWidth='2' strokeLinecap='round' />
              </svg>
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className='text-center text-xs text-gray-400 py-2'>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className='grid grid-cols-7 gap-1 mb-4'>
          {generateCalendarDays().map((dayObj, index) => {
            const isSelected = isDateInRange(dayObj.date);
            const isStart =
              startDate && dayObj.date.getTime() === startDate.getTime();
            const isEnd =
              endDate && dayObj.date.getTime() === endDate.getTime();

            return (
              <button
                key={index}
                onClick={() =>
                  dayObj.isCurrentMonth && handleDateClick(dayObj.date)
                }
                disabled={!dayObj.isCurrentMonth}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#F1CB68] text-white font-semibold'
                    : dayObj.isCurrentMonth
                    ? isDarkMode
                      ? 'text-white hover:bg-[#2C2C2E]'
                      : 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              isDarkMode
                ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              startDate && endDate
                ? 'bg-[#F1CB68] text-white hover:bg-[#C49D2E]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
