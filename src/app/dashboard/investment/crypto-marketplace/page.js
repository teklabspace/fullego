'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { addToWatchlist, removeFromWatchlist } from '@/utils/investmentApi';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function CryptoMarketplacePage() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState('7d');

  // Chart data
  const chartData = [
    { date: 'Apr 14', price: 3000, marketCap: 2500 },
    { date: 'Apr 15', price: 3500, marketCap: 3000 },
    { date: 'Apr 16', price: 4000, marketCap: 3500 },
    { date: 'Apr 17', price: 5500, marketCap: 5000 },
    { date: 'Apr 18', price: 6000, marketCap: 5500 },
    { date: 'Apr 19', price: 7000, marketCap: 6500 },
    { date: 'Apr 20', price: 10000, marketCap: 9500 },
  ];

  // Marketplace assets
  const marketplaceAssets = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      logo: 'bitcoin',
      price: '$7,000.32',
      change: '+10%',
      changeType: 'positive',
      total: '$7,001.32',
      chartData: [20, 35, 25, 45, 38, 52],
    },
    {
      name: 'CryptoCoin',
      symbol: 'CC',
      logo: 'ethereum',
      price: '$5,900.99',
      change: '-28%',
      changeType: 'negative',
      total: '$6,750.50',
      chartData: [45, 38, 32, 28, 18, 12],
    },
    {
      name: 'BlockMint',
      symbol: 'BM',
      logo: 'blockmint',
      price: '$8,500.75',
      change: '+12%',
      changeType: 'positive',
      total: '$8,250.75',
      chartData: [15, 28, 32, 25, 42, 48],
    },
    {
      name: 'ChainCash',
      symbol: 'CH',
      logo: 'chaincash',
      price: '$6,300.10',
      change: '-10%',
      changeType: 'negative',
      total: '$9,999.99',
      chartData: [40, 35, 30, 25, 20, 15],
    },
    {
      name: 'DigiDollar',
      symbol: 'DD',
      logo: 'digidollar',
      price: '$9,250.50',
      change: '+16%',
      changeType: 'positive',
      total: '$5,500.00',
      chartData: [20, 25, 30, 35, 40, 45],
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      logo: 'bitcoin',
      price: '$7,000.32',
      change: '+10%',
      changeType: 'positive',
      total: '$7,001.32',
      chartData: [20, 35, 25, 45, 38, 52],
    },
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Header Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8'>
          <StatCard
            title='Market Cap'
            value='$2.34T'
            icon='wallet'
            isDarkMode={isDarkMode}
          />
          <StatCard
            title='Volume (Daily)'
            value='$6.35B'
            icon='wallet'
            isDarkMode={isDarkMode}
          />
          <StatCard
            title='Total Supply'
            value='19.89M BTC'
            icon='wallet'
            isDarkMode={isDarkMode}
          />
          <BitcoinPriceCard isDarkMode={isDarkMode} />
        </div>

        {/* Chart Section */}
        <div
          className={`rounded-2xl border p-6 mb-8 ${
            isDarkMode
              ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2
              className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Chart
            </h2>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-green-500' />
                  <span
                    className={`text-xs ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Price
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full' style={{ backgroundColor: '#F1CB68' }} />
                  <span
                    className={`text-xs ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Market Cap
                  </span>
                </div>
              </div>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 90 days</option>
                <option value='1y'>Last year</option>
              </select>
            </div>
          </div>

          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData}>
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
                  tickFormatter={value => `${value}K`}
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
                />
                <Legend
                  wrapperStyle={{
                    display: 'none',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='price'
                  stroke='#10B981'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='marketCap'
                  stroke='#F1CB68'
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketplace Section */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2
              className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Marketplace
            </h2>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search all assets'
                  className={`pl-10 pr-4 py-2 rounded-lg text-sm border ${
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
              <button
                className={`text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                See all +
              </button>
            </div>
          </div>

          <div className='space-y-3'>
            {marketplaceAssets.map((asset, index) => (
              <MarketplaceAssetCard
                key={index}
                asset={asset}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, isDarkMode }) {
  const getIconColor = () => {
    if (title === 'Market Cap') return 'bg-green-500';
    if (title === 'Volume (Daily)') return 'bg-purple-500';
    if (title === 'Total Supply') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const getIconContent = () => {
    if (title === 'Market Cap') {
      return (
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#FFFFFF'
          strokeWidth='2'
        >
          <path d='M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' />
        </svg>
      );
    }
    if (title === 'Volume (Daily)') {
      return (
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#FFFFFF'
          strokeWidth='2'
        >
          <path d='M3 3v18h18M7 16l4-4 4 4 6-6' />
        </svg>
      );
    }
    if (title === 'Total Supply') {
      return (
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#FFFFFF'
          strokeWidth='2'
        >
          <circle cx='8' cy='8' r='2' />
          <circle cx='16' cy='8' r='2' />
          <circle cx='12' cy='16' r='2' />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl p-6 border ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between mb-2'>
        <p
          className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {title}
        </p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor()}`}
        >
          {getIconContent()}
        </div>
      </div>
      <p
        className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// Bitcoin Price Card Component
function BitcoinPriceCard({ isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-black flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>₿</span>
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Bitcoin
            </p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <svg
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#10B981'
            strokeWidth='2'
          >
            <path d='M5 12h14M12 5l7 7-7 7' />
          </svg>
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <div>
          <p
            className={`text-2xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            $10,208.73
          </p>
          <p className='text-sm text-green-500 font-medium'>+1.25%</p>
        </div>
      </div>
    </div>
  );
}

// Marketplace Asset Card Component
function MarketplaceAssetCard({ asset, isDarkMode }) {
  const [isSaved, setIsSaved] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const getLogoColor = logo => {
    switch (logo) {
      case 'bitcoin':
        return 'bg-orange-500/20 text-orange-500';
      case 'ethereum':
        return 'bg-purple-500/20 text-purple-500';
      case 'blockmint':
        return 'bg-blue-500/20 text-blue-500';
      case 'chaincash':
        return 'bg-green-500/20 text-green-500';
      case 'digidollar':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getLogoSymbol = logo => {
    switch (logo) {
      case 'bitcoin':
        return '₿';
      case 'ethereum':
        return 'Ξ';
      case 'blockmint':
        return 'BM';
      case 'chaincash':
        return 'CH';
      case 'digidollar':
        return 'DD';
      default:
        return '?';
    }
  };

  const handleToggleWatchlist = async () => {
    if (!asset.symbol) return;

    try {
      setSaving(true);
      if (!isSaved || !watchlistItemId) {
        const item = await addToWatchlist(asset.symbol, 'crypto', asset.name);
        setWatchlistItemId(item?.id || null);
        setIsSaved(true);
        toast.success('Added to watchlist');
      } else {
        await removeFromWatchlist(watchlistItemId);
        setIsSaved(false);
        setWatchlistItemId(null);
        toast.success('Removed from watchlist');
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
      toast.error('Failed to update watchlist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-6 border ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4 flex-1'>
          {/* Logo */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getLogoColor(
              asset.logo
            )}`}
          >
            {asset.logo === 'bitcoin' || asset.logo === 'ethereum' ? (
              <span className='text-lg'>{getLogoSymbol(asset.logo)}</span>
            ) : (
              <span className='text-xs'>{getLogoSymbol(asset.logo)}</span>
            )}
          </div>

          {/* Asset Info */}
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <p
                className={`text-base font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.name}
              </p>
              <span
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {asset.symbol}
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.price}
              </p>
              <div className='w-16 h-8'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={asset.chartData.map(v => ({ value: v }))}>
                    <Line
                      type='monotone'
                      dataKey='value'
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                className={`text-sm font-medium ${
                  asset.changeType === 'positive'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {asset.change}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {asset.total}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isDarkMode
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            Buy
          </button>
          <button
            onClick={handleToggleWatchlist}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
              isDarkMode
                ? 'border-[#FFFFFF14] hover:bg-white/5 text-gray-300'
                : 'border-gray-300 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill={isSaved ? '#F1CB68' : 'none'}
              stroke={isSaved ? '#F1CB68' : 'currentColor'}
              strokeWidth='2'
            >
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
            Save to watchlist
          </button>
        </div>
      </div>
    </div>
  );
}

