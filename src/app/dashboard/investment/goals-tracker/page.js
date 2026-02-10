'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { getInvestmentGoals } from '@/utils/investmentApi';
import { searchAssets } from '@/utils/portfolioApi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export default function GoalsTrackerPage() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [investmentGoals, setInvestmentGoals] = useState([]);
  const [marketplaceAssets, setMarketplaceAssets] = useState([]);

  // Fetch investment goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);

        const goalsRes = await getInvestmentGoals({ status: 'active' });
        
        if (goalsRes.data) {
          const formattedGoals = Array.isArray(goalsRes.data) ? goalsRes.data.map(goal => ({
            id: goal.id,
            name: goal.assetName || goal.name || goal.symbol,
            symbol: goal.symbol || goal.assetSymbol,
            icon: getCryptoIcon(goal.symbol || goal.assetSymbol),
            currentValue: goal.currentValue || goal.currentValueFormatted,
            quantity: goal.currentQuantity || goal.quantity,
            goalCompletion: goal.completionPercentage || goal.goalCompletion || 0,
            gradient: getGradientForSymbol(goal.symbol || goal.assetSymbol),
            progressColor: getProgressColor(goal.completionPercentage || goal.goalCompletion || 0),
          })) : [];
          setInvestmentGoals(formattedGoals);
        }
      } catch (err) {
        console.error('Error fetching investment goals:', err);
        // Handle 405 (Method Not Allowed) or 400 (Bad Request) - backend issues, handle gracefully
        if (err.status === 405 || err.status === 400 || 
            err.message?.includes('Method Not Allowed') || 
            err.data?.detail?.includes('Method Not Allowed') ||
            err.data?.detail?.includes('unsupported operand')) {
          // Silently handle - endpoint has issues or not implemented yet
          setInvestmentGoals([]);
        } else {
          const errorMessage = err.data?.detail || err.message || 'Failed to load goals';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Search marketplace assets
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setMarketplaceAssets([]);
      return;
    }

    try {
      const searchRes = await searchAssets({
        query,
        assetClass: 'crypto',
        limit: 10,
      });

      if (searchRes.data) {
        const formattedAssets = Array.isArray(searchRes.data) ? searchRes.data.map((asset, index) => ({
          id: asset.id || index,
          index: index + 1,
          name: asset.name,
          symbol: asset.symbol,
          icon: getCryptoIcon(asset.symbol),
          iconColor: getIconColor(asset.symbol),
          price: asset.currentPrice ? formatCurrency(asset.currentPrice) : '$0.00',
          change: asset.changePercentage ? `${asset.changePercentage >= 0 ? '+' : ''}${asset.changePercentage.toFixed(2)}%` : '0.00%',
          changeType: (asset.changePercentage || 0) >= 0 ? 'positive' : 'negative',
          currentValue: asset.currentPrice ? formatCurrency(asset.currentPrice) : '$0.00',
          chartData: asset.historyData || [20, 35, 25, 45, 38, 52],
          hasSell: asset.quantity > 0,
        })) : [];
        setMarketplaceAssets(formattedAssets);
      }
    } catch (err) {
      console.error('Error searching assets:', err);
      // Handle 405 (Method Not Allowed) or 400 (Bad Request) - backend issues, handle gracefully
      if (err.status === 405 || err.status === 400 || 
          err.message?.includes('Method Not Allowed') || 
          err.data?.detail?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('unsupported operand')) {
        // Silently handle - endpoint has issues or not implemented yet
        setMarketplaceAssets([]);
      } else {
        toast.error('Failed to search assets');
      }
    }
  };

  // Helper functions
  const getCryptoIcon = (symbol) => {
    const symbolUpper = symbol?.toUpperCase() || '';
    if (symbolUpper.includes('BTC') || symbolUpper.includes('BITCOIN')) return '₿';
    if (symbolUpper.includes('ETH') || symbolUpper.includes('ETHEREUM')) return 'Ξ';
    if (symbolUpper.includes('LTC') || symbolUpper.includes('LITECOIN')) return 'Ł';
    if (symbolUpper.includes('XRP') || symbolUpper.includes('RIPPLE')) return 'XRP';
    if (symbolUpper.includes('DSH') || symbolUpper.includes('DASH')) return 'D';
    return symbol?.charAt(0) || '?';
  };

  const getGradientForSymbol = (symbol) => {
    const symbolUpper = symbol?.toUpperCase() || '';
    if (symbolUpper.includes('BTC')) return 'linear-gradient(135deg, #F1CB68 0%, #D4A017 100%)';
    if (symbolUpper.includes('LTC')) return 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)';
    if (symbolUpper.includes('XRP')) return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    if (symbolUpper.includes('DSH')) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    return 'linear-gradient(135deg, #F1CB68 0%, #D4A017 100%)';
  };

  const getProgressColor = (completion) => {
    if (completion >= 80) return '#FF6B35';
    if (completion >= 50) return '#60A5FA';
    return '#34D399';
  };

  const getIconColor = (symbol) => {
    const symbolUpper = symbol?.toUpperCase() || '';
    if (symbolUpper.includes('BTC')) return 'bg-orange-500/20 text-orange-500';
    if (symbolUpper.includes('LTC')) return 'bg-teal-500/20 text-teal-500';
    if (symbolUpper.includes('XRP')) return 'bg-blue-500/20 text-blue-500';
    if (symbolUpper.includes('DSH')) return 'bg-green-500/20 text-green-500';
    return 'bg-purple-500/20 text-purple-500';
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4'></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading investment goals...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state only for critical errors (not 405 or 400 - endpoint issues)
  if (error && !error.includes('Method Not Allowed') && !error.includes('unsupported operand') && !investmentGoals.length) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading goals
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

  // Marketplace assets (for search results)
  const displayMarketplaceAssets = marketplaceAssets.length > 0 ? marketplaceAssets : [];

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className='mb-8'>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Investment Goals
          </h1>
          <p className='text-gray-400 text-sm md:text-base'>
            Track and manage your cryptocurrency investment goals
          </p>
        </div>

        {/* Investment Goals Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {investmentGoals.length > 0 ? (
            investmentGoals.map((goal) => (
              <GoalCard key={goal.id || goal.symbol} goal={goal} isDarkMode={isDarkMode} />
            ))
          ) : (
            <div className={`col-span-full rounded-2xl p-6 border text-center ${
              isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No investment goals found. Create your first goal to get started!
              </p>
            </div>
          )}
        </div>

        {/* Marketplace Section */}
        <div>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
            <h2
              className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Marketplace
            </h2>
            <div className='relative w-full sm:w-auto'>
              <input
                type='text'
                placeholder='Search all assets'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className={`w-full sm:w-auto pl-10 pr-4 py-2 rounded-lg text-sm border ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <svg
                className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                style={{
                  color: isDarkMode ? '#9CA3AF' : '#6B7280',
                }}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
          </div>

          <div className='space-y-3'>
            {displayMarketplaceAssets.length > 0 ? (
              displayMarketplaceAssets.map((asset) => (
                <MarketplaceAssetCard
                  key={asset.id || asset.index}
                  asset={asset}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <div className={`rounded-xl p-6 border text-center ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchQuery ? 'No assets found. Try a different search.' : 'Search for assets to see marketplace results.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Goal Card Component
function GoalCard({ goal, isDarkMode }) {
  const formatCurrency = (value) => {
    if (typeof value === 'string' && value.startsWith('$')) return value;
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      className='rounded-2xl p-6 border-0 overflow-hidden relative'
      style={{
        background: goal.gradient || 'linear-gradient(135deg, #F1CB68 0%, #D4A017 100%)',
      }}
    >
      {/* Wavy Pattern Background */}
      <div className='absolute inset-0 opacity-10'>
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 200 200'
          preserveAspectRatio='none'
        >
          <path
            d='M0,100 Q50,50 100,100 T200,100 L200,200 L0,200 Z'
            fill='white'
          />
          <path
            d='M0,150 Q50,100 100,150 T200,150 L200,200 L0,200 Z'
            fill='white'
          />
        </svg>
      </div>

      <div className='relative z-10'>
        {/* Icon */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center'>
            {goal.icon === 'XRP' ? (
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 rounded-full bg-white' />
                <div className='w-2 h-2 rounded-full bg-white' />
                <div className='w-2 h-2 rounded-full bg-white' />
              </div>
            ) : (
              <span className='text-white font-bold text-lg'>{goal.icon || goal.symbol?.charAt(0) || '?'}</span>
            )}
          </div>
          <h3 className='text-white text-lg font-bold'>{goal.name || goal.symbol || 'Goal'}</h3>
        </div>

        {/* Value */}
        <p className='text-white text-3xl font-bold mb-2'>
          {typeof goal.currentValue === 'string' ? goal.currentValue : formatCurrency(goal.currentValue)}
        </p>
        <p className='text-white/80 text-sm mb-4'>
          {goal.quantity || '0'} {goal.symbol || ''}
        </p>

        {/* Goal Completion */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-white/80 text-xs font-medium'>
              Goal Completion
            </span>
            <span className='text-white text-xs font-bold'>
              {Math.round(goal.goalCompletion || 0)}%
            </span>
          </div>
          <div className='w-full h-2 bg-white/20 rounded-full overflow-hidden'>
            <div
              className='h-full rounded-full transition-all'
              style={{
                width: `${Math.min(100, Math.max(0, goal.goalCompletion || 0))}%`,
                backgroundColor: goal.progressColor || '#FF6B35',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketplace Asset Card Component
function MarketplaceAssetCard({ asset, isDarkMode }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div
      className={`rounded-xl p-4 sm:p-6 border ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto'>
          {/* Index */}
          <span
            className={`text-xs sm:text-sm font-medium w-6 sm:w-8 shrink-0 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {asset.index}
          </span>

          {/* Logo */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${asset.iconColor}`}
          >
            {asset.icon === 'XRP' ? (
              <div className='flex items-center gap-1'>
                <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500' />
                <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500' />
                <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500' />
              </div>
            ) : (
              <span className='text-base sm:text-lg'>{asset.icon}</span>
            )}
          </div>

          {/* Asset Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1 sm:mb-1'>
              <p
                className={`text-sm sm:text-base font-semibold truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.name}
              </p>
              <span
                className={`text-xs shrink-0 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {asset.symbol}
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.price}
              </p>
              <div className='w-12 h-6 sm:w-16 sm:h-8 shrink-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={asset.chartData.map(v => ({ value: v }))}>
                    <Line
                      type='monotone'
                      dataKey='value'
                      stroke={isDarkMode ? '#8B5CF6' : '#8B5CF6'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                className={`text-xs sm:text-sm font-medium shrink-0 ${
                  asset.changeType === 'positive'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {asset.change}
              </p>
              <p
                className={`text-xs sm:text-sm shrink-0 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.currentValue}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 sm:gap-3 w-full sm:w-auto'>
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              asset.hasSell
                ? isDarkMode
                  ? 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90'
                  : 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90'
                : isDarkMode
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            Buy
          </button>
          {asset.hasSell ? (
            <button
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isDarkMode
                  ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              Sell
            </button>
          ) : (
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                isDarkMode
                  ? 'border-[#FFFFFF14] hover:bg-white/5 text-gray-300'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill={isSaved ? '#F1CB68' : 'none'}
                stroke={isSaved ? '#F1CB68' : 'currentColor'}
                strokeWidth='2'
                className='shrink-0'
              >
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
              <span className='hidden sm:inline'>Save to watchlist</span>
              <span className='sm:hidden'>Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
