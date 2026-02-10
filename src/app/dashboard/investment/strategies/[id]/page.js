'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { getStrategyDetails, saveStrategy } from '@/utils/investmentApi';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function StrategyDetailsPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null);

  // Fetch strategy details
  useEffect(() => {
    const fetchStrategy = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);

        const strategyRes = await getStrategyDetails(params.id);

        if (strategyRes.data) {
          const formattedStrategy = {
            id: strategyRes.data.id,
            title: strategyRes.data.title || strategyRes.data.name,
            description: strategyRes.data.description,
            fullDescription: strategyRes.data.fullDescription || strategyRes.data.description,
            author: strategyRes.data.author || strategyRes.data.authorName || 'Unknown',
            date: formatDate(strategyRes.data.date || strategyRes.data.createdAt),
            comments: strategyRes.data.comments || strategyRes.data.commentCount || 0,
            boosts: strategyRes.data.boosts || strategyRes.data.boostCount || 0,
            chartType: strategyRes.data.chartType || 'candlestick',
            parameters: strategyRes.data.parameters || {},
            isSaved: strategyRes.data.isSaved || false,
          };
          setStrategy(formattedStrategy);
          setIsSaved(formattedStrategy.isSaved);
        }
      } catch (err) {
        console.error('Error fetching strategy details:', err);
        // Handle 405 (Method Not Allowed) or 400 (Bad Request) - backend issues, handle gracefully
        if (err.status === 405 || err.status === 400 || 
            err.message?.includes('Method Not Allowed') || 
            err.data?.detail?.includes('Method Not Allowed') ||
            err.data?.detail?.includes('unsupported operand')) {
          // Silently handle - endpoint has issues or not implemented yet
          setStrategy(null);
        } else {
          const errorMessage = err.data?.detail || err.message || 'Failed to load strategy';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [params.id]);

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

  // Handle save strategy
  const handleSaveStrategy = async () => {
    if (!params.id) return;

    try {
      await saveStrategy(params.id, !isSaved);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Strategy removed from saved' : 'Strategy saved');
    } catch (err) {
      console.error('Error saving strategy:', err);
      toast.error('Failed to save strategy');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4'></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading strategy details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state only for critical errors (not 405 or 400 - endpoint issues)
  if (error && !error.includes('Method Not Allowed') && !error.includes('unsupported operand') && !strategy) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading strategy
          </p>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Show not found state
  if (!strategy) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <h2
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Strategy not found
          </h2>
          <Link
            href='/dashboard/investment/strategies'
            className={`text-[#F1CB68] hover:underline`}
          >
            Back to Strategies
          </Link>
        </div>
      </DashboardLayout>
    );
  }



  return (
    <DashboardLayout>
      <div>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 text-sm transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M19 12H5M12 19l-7-7 7-7' />
          </svg>
          Back to Strategies
        </button>

        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {strategy.title}
              </h1>
              <div className='flex items-center gap-3'>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  by
                </span>
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {strategy.author}
                </span>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  •
                </span>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {strategy.date}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3'>
              <button
                onClick={handleSaveStrategy}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                  isSaved
                    ? isDarkMode
                      ? 'border-[#F1CB68] bg-[#F1CB68] text-black'
                      : 'border-[#F1CB68] bg-[#F1CB68] text-black'
                    : isDarkMode
                    ? 'border-[#F1CB68] text-[#F1CB68] hover:bg-[#F1CB68]/10'
                    : 'border-[#F1CB68] text-[#F1CB68] hover:bg-[#F1CB68]/10'
                }`}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill={isSaved ? '#000000' : 'none'}
                  stroke={isSaved ? '#000000' : 'currentColor'}
                  strokeWidth='2'
                >
                  <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                </svg>
                {isSaved ? 'Saved' : 'Save Strategy'}
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Chart Section */}
            <div
              className={`rounded-2xl border overflow-hidden ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div
                className={`w-full h-96 ${
                  isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-100'
                } flex items-center justify-center relative overflow-hidden`}
              >
                {/* Placeholder Chart */}
                <div className='w-full h-full flex items-center justify-center'>
                  <svg
                    width='100%'
                    height='100%'
                    viewBox='0 0 800 400'
                    className='absolute inset-0'
                  >
                    <rect
                      width='800'
                      height='400'
                      fill={isDarkMode ? '#0A0A0A' : '#FFFFFF'}
                    />
                    {strategy.chartType === 'candlestick' ? (
                      <>
                        {[100, 200, 300, 400, 500, 600, 700].map((x, i) => (
                          <g key={i}>
                            <line
                              x1={x}
                              y1={200 - i * 15}
                              x2={x}
                              y2={200 + i * 8}
                              stroke={isDarkMode ? '#8B5CF6' : '#6366F1'}
                              strokeWidth='3'
                            />
                            <rect
                              x={x - 12}
                              y={200 - i * 15}
                              width='24'
                              height={i * 23}
                              fill={isDarkMode ? '#F1CB68' : '#F1CB68'}
                            />
                          </g>
                        ))}
                      </>
                    ) : (
                      <>
                        <polyline
                          points='100,300 200,250 300,200 400,150 500,120 600,100 700,80'
                          fill='none'
                          stroke={isDarkMode ? '#3B82F6' : '#2563EB'}
                          strokeWidth='3'
                        />
                        <polyline
                          points='100,200 200,180 300,170 400,150 500,140 600,130 700,120'
                          fill='none'
                          stroke={isDarkMode ? '#EF4444' : '#DC2626'}
                          strokeWidth='3'
                        />
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Description
              </h2>
              <p
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {strategy.fullDescription}
              </p>
            </div>

            {/* Parameters Section */}
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Strategy Parameters
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {Object.entries(strategy.parameters).map(([key, value]) => (
                  <div key={key}>
                    <p
                      className={`text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Engagement Metrics */}
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
                Engagement
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      strokeWidth='2'
                    >
                      <path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' />
                    </svg>
                    <span
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Comments
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {strategy.comments}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      strokeWidth='2'
                    >
                      <path d='M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13' />
                    </svg>
                    <span
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Boosts
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {strategy.boosts}
                  </span>
                </div>
              </div>
            </div>

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
              <div className='space-y-3'>
                <button
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90'
                      : 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90'
                  }`}
                >
                  Apply Strategy
                </button>
                <button
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                    isDarkMode
                      ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Share Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

