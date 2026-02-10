'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import {
    getAssetSummaryCards,
    getCryptoPrices,
    getInvestmentActivity,
    getTraderProfile,
} from '@/utils/investmentApi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export default function InvestmentOverviewPage() {
  const { isDarkMode } = useTheme();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [assetCards, setAssetCards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [traderProfile, setTraderProfile] = useState(null);

  // Fetch all investment overview data
  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel with individual error handling
        const results = await Promise.allSettled([
          getAssetSummaryCards(),
          getInvestmentActivity({ limit: 10 }),
          getCryptoPrices(),
          getTraderProfile(),
        ]);

        // Handle asset cards
        if (results[0].status === 'fulfilled' && results[0].value.data) {
          setAssetCards(Array.isArray(results[0].value.data) ? results[0].value.data : []);
        } else if (results[0].status === 'rejected') {
          const err = results[0].reason;
          // Handle 405 (Method Not Allowed) or 400 (Bad Request) - backend issues, handle gracefully
          if (err.status === 405 || err.status === 400 || 
              err.message?.includes('Method Not Allowed') || 
              err.data?.detail?.includes('Method Not Allowed') ||
              err.data?.detail?.includes('unsupported operand')) {
            // Silently handle - endpoint has issues or not implemented yet
            setAssetCards([]);
          } else {
            console.error('Error fetching asset cards:', err);
          }
        }

        // Handle activities
        if (results[1].status === 'fulfilled' && results[1].value.data) {
          setActivities(Array.isArray(results[1].value.data) ? results[1].value.data : []);
        } else if (results[1].status === 'rejected') {
          const err = results[1].reason;
          if (err.status === 405 || err.status === 400 || 
              err.message?.includes('Method Not Allowed') || 
              err.data?.detail?.includes('Method Not Allowed') ||
              err.data?.detail?.includes('unsupported operand')) {
            // Silently handle - endpoint has issues or not implemented yet
            setActivities([]);
          } else {
            console.error('Error fetching activities:', err);
          }
        }

        // Handle crypto prices
        if (results[2].status === 'fulfilled' && results[2].value.data) {
          setCryptoPrices(Array.isArray(results[2].value.data) ? results[2].value.data : []);
        } else if (results[2].status === 'rejected') {
          const err = results[2].reason;
          if (err.status === 405 || err.status === 400 || 
              err.message?.includes('Method Not Allowed') || 
              err.data?.detail?.includes('Method Not Allowed') ||
              err.data?.detail?.includes('unsupported operand')) {
            // Silently handle - endpoint has issues or not implemented yet
            setCryptoPrices([]);
          } else {
            console.error('Error fetching crypto prices:', err);
          }
        }

        // Handle trader profile
        if (results[3].status === 'fulfilled' && results[3].value.data) {
          setTraderProfile(results[3].value.data);
        } else if (results[3].status === 'rejected') {
          const err = results[3].reason;
          if (err.status === 405 || err.status === 400 || 
              err.message?.includes('Method Not Allowed') || 
              err.data?.detail?.includes('Method Not Allowed') ||
              err.data?.detail?.includes('unsupported operand')) {
            // Silently handle - endpoint has issues or not implemented yet
            setTraderProfile(null);
          } else {
            console.error('Error fetching trader profile:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching investment overview data:', err);
        // Only set error if it's not a 405 or 400 (endpoint issues or backend bugs)
        if (err.status !== 405 && err.status !== 400 && 
            !err.message?.includes('Method Not Allowed') && 
            !err.data?.detail?.includes('Method Not Allowed') &&
            !err.data?.detail?.includes('unsupported operand')) {
          const errorMessage = err.data?.detail || err.message || 'Failed to load investment data';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, []);

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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get icon for asset
  const getAssetIcon = (symbol) => {
    const symbolUpper = symbol?.toUpperCase() || '';
    if (symbolUpper.includes('BTC') || symbolUpper.includes('BITCOIN')) return 'bitcoin';
    if (symbolUpper.includes('ETH') || symbolUpper.includes('ETHEREUM')) return 'ethereum';
    if (symbolUpper.includes('DOGE') || symbolUpper.includes('DOGECOIN')) return 'doge';
    return 'ethereum';
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4'></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading investment data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state only for critical errors (not 405 or 400 - endpoint issues)
  if (error && !error.includes('Method Not Allowed') && !error.includes('unsupported operand') && !assetCards.length && !activities.length && !cryptoPrices.length && !traderProfile) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading investment data
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
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main Content Area */}
        <div className='flex-1'>
          {/* Header */}
          <div className='mb-8'>
            <h1
              className={`text-3xl md:text-4xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Investment Overview
            </h1>
            <p className={`text-sm md:text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              For browsing your stocks, Bonds, ETFs, etc.
            </p>
          </div>

          {/* Asset Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8'>
            {assetCards.length > 0 ? (
              assetCards.slice(0, 2).map((asset, index) => (
                <AssetCard
                  key={asset.id || asset.symbol || index}
                  name={asset.name || asset.symbol || 'Asset'}
                  value={asset.value ? formatCurrency(asset.value) : '$0.00'}
                  profit={asset.profitPercentage ? `+${asset.profitPercentage.toFixed(2)}%` : '+0.00%'}
                  loss={asset.lossPercentage ? `-${Math.abs(asset.lossPercentage).toFixed(2)}%` : '-0.00%'}
                  neutral='0.00%'
                  chartData={asset.chartData || asset.historyData || [{ value: 0 }]}
                  chartColor='#F1CB68'
                  isGradient={index === 0}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <>
                <div className={`rounded-2xl p-6 border ${
                  isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
                }`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No asset data available
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border ${
                  isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
                }`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No asset data available
                  </p>
                </div>
              </>
            )}
            {/* New Asset Card */}
            <NewAssetCard isDarkMode={isDarkMode} />
          </div>

          {/* Activity Section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2
                className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                ACTIVITY
              </h2>
              <Link
                href='/dashboard/investment/crypto-marketplace'
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                More Activity
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' />
                </svg>
              </Link>
            </div>

            <div
              className={`rounded-2xl border overflow-hidden ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
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
                        Transactions
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Amount
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Total
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length > 0 ? (
                      activities.map((activity, index) => {
                        const assetIcon = getAssetIcon(activity.asset || activity.symbol);
                        return (
                          <tr
                            key={activity.id || index}
                            className={`border-b ${
                              isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                            } ${
                              index % 2 === 0
                                ? isDarkMode
                                  ? 'bg-[#1A1A1D]'
                                  : 'bg-gray-50'
                                : ''
                            }`}
                          >
                            <td className='px-6 py-4'>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={`w-10 h-7 rounded-full flex items-center justify-center ${
                                    assetIcon === 'bitcoin'
                                      ? isDarkMode
                                        ? 'bg-orange-500/30 '
                                        : 'bg-orange-500/20'
                                      : isDarkMode
                                      ? 'bg-blue-500/30'
                                      : 'bg-blue-500/20'
                                  }`}
                                >
                                  {assetIcon === 'bitcoin' ? (
                                    <span className='text-orange-500 font-bold text-sm'>
                                      ₿
                                    </span>
                                  ) : (
                                    <span className='text-blue-500 font-bold text-sm'>
                                      Ξ
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-sm font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {activity.transaction || `${activity.type || 'Transaction'} - ${activity.asset || activity.symbol || 'Asset'}`}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {activity.amount || activity.quantity || 'N/A'}
                            </td>
                            <td
                              className={`px-6 py-4 text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {activity.total ? formatCurrency(activity.total) : activity.totalValue ? formatCurrency(activity.totalValue) : '$0.00'}
                            </td>
                            <td className='px-6 py-4'>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  (activity.status === 'Done' || activity.status === 'completed' || activity.status === 'filled')
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-yellow-500/20 text-yellow-500'
                                }`}
                              >
                                {activity.status || 'Pending'}
                              </span>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {activity.date ? formatDate(activity.date) : activity.createdAt ? formatDate(activity.createdAt) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className='px-6 py-8 text-center text-gray-400'>
                          No activity found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cryptocurrency Price Tracker */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
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
                      Cryptocurrency
                    </th>
                    <th
                      className={`text-left px-6 py-4 text-xs font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Updated
                    </th>
                    <th
                      className={`text-left px-6 py-4 text-xs font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Change
                    </th>
                    <th
                      className={`text-left px-6 py-4 text-xs font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoPrices.length > 0 ? (
                    cryptoPrices.map((crypto, index) => {
                      const cryptoIcon = getAssetIcon(crypto.symbol || crypto.name);
                      const changePercentage = crypto.changePercentage || crypto.change || 0;
                      const isPositive = changePercentage >= 0;
                      return (
                        <tr
                          key={crypto.id || crypto.symbol || index}
                          className={`border-b ${
                            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                          }`}
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  cryptoIcon === 'bitcoin'
                                    ? isDarkMode
                                      ? 'bg-orange-500/30'
                                      : 'bg-orange-500/20'
                                    : cryptoIcon === 'ethereum'
                                    ? isDarkMode
                                      ? 'bg-blue-500/30'
                                      : 'bg-blue-500/20'
                                    : isDarkMode
                                    ? 'bg-yellow-500/30'
                                    : 'bg-yellow-500/20'
                                }`}
                              >
                                {cryptoIcon === 'bitcoin' ? (
                                  <span className='text-orange-500 font-bold text-sm'>
                                    ₿
                                  </span>
                                ) : cryptoIcon === 'ethereum' ? (
                                  <span className='text-blue-500 font-bold text-sm'>
                                    Ξ
                                  </span>
                                ) : (
                                  <span className='text-yellow-500 font-bold text-sm'>
                                    Ð
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {crypto.name || crypto.symbol || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {crypto.updated || crypto.updatedAt ? 
                              (crypto.updated || new Date(crypto.updatedAt).toLocaleTimeString()) : 
                              'Just now'}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`text-sm font-medium ${
                                isPositive
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {!isPositive && '↓ '}
                              {isPositive && '↑ '}
                              {Math.abs(changePercentage).toFixed(2)}%
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {crypto.price ? formatCurrency(crypto.price) : '$0.00'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className='px-6 py-8 text-center text-gray-400'>
                        No crypto prices available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trader Profile Sidebar */}
        <div className='w-full lg:w-80 shrink-0'>
          {traderProfile ? (
            <TraderProfileSidebar
              profile={traderProfile}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className={`rounded-2xl border p-6 ${
              isDarkMode
                ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Profile data not available
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Asset Card Component
function AssetCard({
  name,
  value,
  profit,
  loss,
  neutral,
  chartData,
  chartColor,
  isGradient,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-2xl p-6 border overflow-hidden relative ${
        isGradient
          ? ''
          : isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
      style={
        isGradient
          ? {
              background: 'linear-gradient(135deg, #F1CB68 0%, #D4A017 100%)',
              border: 'none',
            }
          : {}
      }
    >
      <div className='flex items-start justify-between mb-4'>
        <div>
          <span
            className={`text-4xl font-bold mb-2 block ${
              isGradient
                ? 'text-white'
                : isDarkMode
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            ${value}
          </span>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-green-500 font-medium'>
                {profit}
              </span>
              <span
                className={`text-xs ${
                  isGradient
                    ? 'text-white/80'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Profit
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-red-500 font-medium'>{loss}</span>
              <span
                className={`text-xs ${
                  isGradient
                    ? 'text-white/80'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Loss
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`text-xs font-medium ${
                  isGradient
                    ? 'text-white/80'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                {neutral}
              </span>
              <span
                className={`text-xs ${
                  isGradient
                    ? 'text-white/80'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                Neutral
              </span>
            </div>
          </div>
        </div>
        <div className='w-24 h-16'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData}>
              <Line
                type='monotone'
                dataKey='value'
                stroke={isGradient ? '#FFFFFF' : chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// New Asset Card Component
function NewAssetCard({ isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all ${
        isDarkMode
          ? 'border-gray-600 hover:border-[#F1CB68] bg-[#1A1A1D]'
          : 'border-gray-300 hover:border-[#F1CB68] bg-gray-50'
      }`}
    >
      <p
        className={`text-sm font-medium mb-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        New Asset
      </p>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isDarkMode
            ? 'bg-[#2C2C2E] border border-gray-600'
            : 'bg-white border border-gray-300'
        }`}
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke={isDarkMode ? '#F1CB68' : '#F1CB68'}
          strokeWidth='2'
        >
          <path d='M12 5v14M5 12h14' />
        </svg>
      </div>
    </div>
  );
}

// Trader Profile Sidebar Component
function TraderProfileSidebar({ profile, isDarkMode }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDarkMode
          ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className='mb-6'>
        <h2
          className={`text-lg font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Trader Profile
        </h2>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-12 h-12 rounded-full bg-[#F1CB68] flex items-center justify-center'>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#000000'
              strokeWidth='2'
            >
              <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z' />
            </svg>
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {profile.name || profile.firstName || 'User'}
            </p>
            <p
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {profile.accountType || profile.accountType || 'User Account'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className='mb-6'>
        <h3
          className={`text-sm font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Account
        </h3>
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Joined
            </span>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {profile.joined ? formatDate(profile.joined) : profile.createdAt ? formatDate(profile.createdAt) : 'N/A'}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Assets Value
            </span>
            <span
              className={`text-xs font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {profile.assetsValue ? formatCurrency(profile.assetsValue) : profile.totalAssetsValue ? formatCurrency(profile.totalAssetsValue) : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Assets List */}
      {profile.assets && profile.assets.length > 0 && (
        <div className='mb-6'>
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Assets
          </h3>
          <div className='space-y-2'>
            {profile.assets.slice(0, 4).map((asset, index) => (
              <div key={asset.id || index} className='flex justify-between items-center'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {asset.name || asset.symbol || 'Asset'}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {asset.amount || asset.quantity || '0'}
                </span>
              </div>
            ))}
          </div>
          {profile.assets.length > 4 && (
            <button
              className={`mt-3 text-xs transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              More assets...
            </button>
          )}
        </div>
      )}

      {/* Trade Now Button */}
      <Link href='/dashboard/portfolio/trade-engine'>
        <button
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Trade Now
        </button>
      </Link>
    </div>
  );
}
