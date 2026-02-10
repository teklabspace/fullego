'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { getInvestmentStrategies } from '@/utils/investmentApi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function StrategiesPage() {
  const { isDarkMode } = useTheme();
  const [strategiesFilter, setStrategiesFilter] = useState('all');
  const [openSourceOnly, setOpenSourceOnly] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [strategies, setStrategies] = useState([]);

  // Fetch investment strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        setError(null);

        const strategiesRes = await getInvestmentStrategies({
          filter: strategiesFilter,
          openSourceOnly: openSourceOnly,
          sortBy: 'date',
          limit: 20,
        });

        if (strategiesRes.data) {
          const formattedStrategies = Array.isArray(strategiesRes.data) ? strategiesRes.data.map(strategy => ({
            id: strategy.id,
            title: strategy.title || strategy.name,
            description: strategy.description,
            author: strategy.author || strategy.authorName || 'Unknown',
            date: formatDate(strategy.date || strategy.createdAt),
            comments: strategy.comments || strategy.commentCount || 0,
            boosts: strategy.boosts || strategy.boostCount || 0,
            chartType: strategy.chartType || 'candlestick',
            image: strategy.image || null,
          })) : [];
          setStrategies(formattedStrategies);
        }
      } catch (err) {
        console.error('Error fetching investment strategies:', err);
        // Handle 405 (Method Not Allowed) or 400 (Bad Request) - backend issues, handle gracefully
        if (err.status === 405 || err.status === 400 || 
            err.message?.includes('Method Not Allowed') || 
            err.data?.detail?.includes('Method Not Allowed') ||
            err.data?.detail?.includes('unsupported operand')) {
          // Silently handle - endpoint has issues or not implemented yet
          setStrategies([]);
        } else {
          const errorMessage = err.data?.detail || err.message || 'Failed to load strategies';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [strategiesFilter, openSourceOnly]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4'></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading strategies...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state only for critical errors (not 405 or 400 - endpoint issues)
  if (error && !error.includes('Method Not Allowed') && !error.includes('unsupported operand') && !strategies.length) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading strategies
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
      <div>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Investment Strategies
              </h1>
              <p className='text-gray-400 text-sm md:text-base'>
                For browsing your stocks, Bonds, ETFs, etc.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
              {/* Add Strategy Button */}
              <button
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  isDarkMode
                    ? 'border-[#F1CB68] hover:bg-[#F1CB68]/10'
                    : 'border-[#F1CB68] hover:bg-[#F1CB68]/10'
                }`}
              >
                <svg
                  width='18'
                  height='18'
                  className='sm:w-5 sm:h-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke={isDarkMode ? '#F1CB68' : '#F1CB68'}
                  strokeWidth='2'
                >
                  <path d='M12 5v14M5 12h14' />
                </svg>
              </button>

              {/* Strategies Filter Dropdown */}
              <div className='relative'>
                <button
                  onClick={() =>
                    setStrategiesFilter(
                      strategiesFilter === 'all' ? 'my' : 'all'
                    )
                  }
                  className={`px-3 sm:px-4 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                    isDarkMode
                      ? 'border-[#F1CB68] text-black bg-[#F1CB68] hover:bg-[#F1CB68]/90'
                      : 'border-[#F1CB68] text-black bg-[#F1CB68] hover:bg-[#F1CB68]/90'
                  }`}
                >
                  <span className='hidden sm:inline'>Strategies</span>
                  <span className='sm:hidden'>All</span>
                  <svg
                    width='14'
                    height='14'
                    className='sm:w-4 sm:h-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
              </div>

              {/* Open-source Only Toggle */}
              <button
                onClick={() => setOpenSourceOnly(!openSourceOnly)}
                className={`px-3 sm:px-4 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  openSourceOnly
                    ? isDarkMode
                      ? 'border-[#F1CB68] text-black bg-[#F1CB68]'
                      : 'border-[#F1CB68] text-black bg-[#F1CB68]'
                    : isDarkMode
                    ? 'border-[#F1CB68] text-black bg-[#F1CB68] hover:bg-[#F1CB68]/90'
                    : 'border-[#F1CB68] text-black bg-[#F1CB68] hover:bg-[#F1CB68]/90'
                }`}
              >
                <svg
                  width='14'
                  height='14'
                  className='sm:w-4 sm:h-4 shrink-0'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                  <path d='M7 11V7a5 5 0 0110 0v4' />
                </svg>
                <span className='hidden sm:inline'>Open-source only</span>
                <span className='sm:hidden'>Open</span>
              </button>
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {strategies.length > 0 ? (
            strategies.map((strategy) => (
              <Link
                key={strategy.id}
                href={`/dashboard/investment/strategies/${strategy.id}`}
              >
                <StrategyCard strategy={strategy} isDarkMode={isDarkMode} />
              </Link>
            ))
          ) : (
            <div className={`col-span-full rounded-2xl p-6 border text-center ${
              isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No strategies found. {strategiesFilter === 'my' ? 'You haven\'t created any strategies yet.' : 'Be the first to create a strategy!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Strategy Card Component
function StrategyCard({ strategy, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all cursor-pointer hover:scale-[1.02] ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14] hover:border-[#F1CB68]/50'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Chart Image */}
      <div
        className={`w-full h-48 ${
          isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-100'
        } flex items-center justify-center relative overflow-hidden`}
      >
        {/* Placeholder Chart - You can replace with actual images */}
        <div className='w-full h-full flex items-center justify-center'>
          <svg
            width='100%'
            height='100%'
            viewBox='0 0 400 200'
            className='absolute inset-0'
          >
            {/* Chart Background */}
            <rect
              width='400'
              height='200'
              fill={isDarkMode ? '#0A0A0A' : '#FFFFFF'}
            />

            {/* Sample Chart Lines */}
            {strategy.chartType === 'candlestick' ? (
              <>
                {/* Candlesticks */}
                {[50, 100, 150, 200, 250, 300, 350].map((x, i) => (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={100 - i * 10}
                      x2={x}
                      y2={100 + i * 5}
                      stroke={isDarkMode ? '#8B5CF6' : '#6366F1'}
                      strokeWidth='2'
                    />
                    <rect
                      x={x - 8}
                      y={100 - i * 10}
                      width='16'
                      height={i * 15}
                      fill={isDarkMode ? '#F1CB68' : '#F1CB68'}
                    />
                  </g>
                ))}
              </>
            ) : (
              <>
                {/* Line Chart */}
                <polyline
                  points='50,150 100,120 150,100 200,80 250,70 300,60 350,50'
                  fill='none'
                  stroke={isDarkMode ? '#3B82F6' : '#2563EB'}
                  strokeWidth='2'
                />
                <polyline
                  points='50,100 100,90 150,85 200,75 250,70 300,65 350,60'
                  fill='none'
                  stroke={isDarkMode ? '#EF4444' : '#DC2626'}
                  strokeWidth='2'
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Card Content */}
      <div className='p-6'>
        {/* Title */}
        <h3
          className={`text-xl font-bold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {strategy.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm mb-4 line-clamp-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {strategy.description}
        </p>

        {/* Author and Date */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              by
            </span>
            <span
              className={`text-xs font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {strategy.author}
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              •
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {strategy.date}
            </span>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              strokeWidth='2'
            >
              <path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' />
            </svg>
            <span
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {strategy.comments}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
              strokeWidth='2'
            >
              <path d='M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13' />
            </svg>
            <span
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {strategy.boosts}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
