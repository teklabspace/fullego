'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { getAccountStats, getMyAccount } from '@/utils/accountsApi';
import { getUserProfile } from '@/utils/authApi';
import { getBankAccounts } from '@/utils/bankingApi';
import
  {
    getPortfolioHistory,
    getPortfolioPerformance,
    getPortfolioSummary
  } from '@/utils/portfolioApi';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import
  {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
  } from 'recharts';

export default function DashboardPage() {
  const { isDarkMode } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Dashboard data states
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [portfolioPerformance, setPortfolioPerformance] = useState(null);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [accountData, setAccountData] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setIsLoadingProfile(true);
        
        // Fetch all data in parallel using Promise.allSettled
        const results = await Promise.allSettled([
          getUserProfile().catch(err => ({ error: err })),
          getPortfolioSummary('ALL').catch(err => ({ error: err })),
          getPortfolioPerformance(365).catch(err => ({ error: err })),
          getPortfolioHistory(365).catch(err => ({ error: err })),
          getMyAccount().catch(err => ({ error: err })),
          getAccountStats().catch(err => ({ error: err })),
          getBankAccounts().catch(err => ({ error: err })),
        ]);

        // Process results
        const [
          profileResult,
          portfolioSummaryResult,
          portfolioPerformanceResult,
          portfolioHistoryResult,
          accountResult,
          accountStatsResult,
          bankAccountsResult,
        ] = results;

        // User Profile
        if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
          setUserProfile(profileResult.value);
        } else {
          const error = profileResult.value?.error || profileResult.reason;
          console.error('Failed to fetch user profile:', error);
          setErrors(prev => ({ ...prev, profile: error }));
        }
        setIsLoadingProfile(false);

        // Portfolio Summary
        if (portfolioSummaryResult.status === 'fulfilled' && !portfolioSummaryResult.value.error) {
          setPortfolioSummary(portfolioSummaryResult.value.data || portfolioSummaryResult.value);
        } else {
          const error = portfolioSummaryResult.value?.error || portfolioSummaryResult.reason;
          console.error('Failed to fetch portfolio summary:', error);
          setErrors(prev => ({ ...prev, portfolioSummary: error }));
        }

        // Portfolio Performance
        if (portfolioPerformanceResult.status === 'fulfilled' && !portfolioPerformanceResult.value.error) {
          setPortfolioPerformance(portfolioPerformanceResult.value);
        } else {
          const error = portfolioPerformanceResult.value?.error || portfolioPerformanceResult.reason;
          console.error('Failed to fetch portfolio performance:', error);
          setErrors(prev => ({ ...prev, portfolioPerformance: error }));
        }

        // Portfolio History
        if (portfolioHistoryResult.status === 'fulfilled' && !portfolioHistoryResult.value.error) {
          const historyData = portfolioHistoryResult.value.data || portfolioHistoryResult.value;
          setPortfolioHistory(Array.isArray(historyData) ? historyData : []);
        } else {
          const error = portfolioHistoryResult.value?.error || portfolioHistoryResult.reason;
          console.error('Failed to fetch portfolio history:', error);
          setErrors(prev => ({ ...prev, portfolioHistory: error }));
        }

        // Account Data
        if (accountResult.status === 'fulfilled' && !accountResult.value.error) {
          const account = accountResult.value.data || accountResult.value;
          if (accountStatsResult.status === 'fulfilled' && !accountStatsResult.value.error) {
            const stats = accountStatsResult.value;
            setAccountData({ ...account, stats });
          } else {
            setAccountData(account);
          }
        } else {
          const error = accountResult.value?.error || accountResult.reason;
          console.error('Failed to fetch account data:', error);
          setErrors(prev => ({ ...prev, account: error }));
        }

        // Bank Accounts
        if (bankAccountsResult.status === 'fulfilled' && !bankAccountsResult.value.error) {
          const accounts = bankAccountsResult.value.data || bankAccountsResult.value;
          setBankAccounts(Array.isArray(accounts) ? accounts : []);
        } else {
          const error = bankAccountsResult.value?.error || bankAccountsResult.reason;
          console.error('Failed to fetch bank accounts:', error);
          setErrors(prev => ({ ...prev, bankAccounts: error }));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <DashboardContent 
      userProfile={userProfile} 
      isLoadingProfile={isLoadingProfile}
      portfolioSummary={portfolioSummary}
      portfolioPerformance={portfolioPerformance}
      portfolioHistory={portfolioHistory}
      accountData={accountData}
      bankAccounts={bankAccounts}
      loading={loading}
    />
  );
}

function DashboardContent({ 
  userProfile, 
  isLoadingProfile,
  portfolioSummary,
  portfolioPerformance,
  portfolioHistory,
  accountData,
  bankAccounts,
  loading,
}) {
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
          {isLoadingProfile ? (
            'Loading...'
          ) : userProfile ? (
            `Olá, ${userProfile.first_name || userProfile.email?.split('@')[0] || 'User'}`
          ) : (
            'Olá, User'
          )}
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
        <NetWorthInvestableCard 
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          loading={loading}
        />

        {/* Assets Card */}
        <AssetsCard 
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          loading={loading}
        />

        {/* Debts Card */}
        <DebtsCard 
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          loading={loading}
        />
      </div>

      {/* Middle Row Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Cash on hand Card */}
        <CashOnHandCard 
          accountData={accountData}
          bankAccounts={bankAccounts}
          loading={loading}
        />

        {/* Tax Estimate Card */}
        <TaxEstimateCard 
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          loading={loading}
        />
      </div>

      {/* Historical Performance Graph */}
      <HistoricalPerformanceGraph 
        portfolioHistory={portfolioHistory}
        portfolioSummary={portfolioSummary}
        loading={loading}
      />
    </DashboardLayout>
  );
}

// Helper function to format currency
const formatCurrency = (value, showMillion = false) => {
  if (value === null || value === undefined) return '$0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0';
  
  if (showMillion && numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(3)} Million`;
  }
  
  if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(1)}K`;
  }
  
  return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format percentage
const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0%';
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
};

// Net Worth & Investable Card Component
function NetWorthInvestableCard({ portfolioSummary, portfolioPerformance, loading }) {
  const { isDarkMode } = useTheme();

  // Calculate net worth from portfolio summary
  const hasPortfolioSummary = !!portfolioSummary;
  const netWorth = hasPortfolioSummary
    ? portfolioSummary.totalPortfolioValue ||
      (portfolioSummary.totalAssets && portfolioSummary.totalDebts
        ? portfolioSummary.totalAssets - portfolioSummary.totalDebts
        : 0)
    : 0;
  
  // Calculate investable (cash available + portfolio value)
  const investable = hasPortfolioSummary
    ? portfolioSummary.cashAvailable || portfolioSummary.totalPortfolioValue || 0
    : 0;

  // Get return percentages
  const netWorthReturn = portfolioPerformance?.totalReturnPercentage ??
    portfolioSummary?.returnPercentage;
  const investableReturn = portfolioPerformance?.totalReturnPercentage ??
    portfolioSummary?.returnPercentage;

  // Market benchmarks (mock data - can be replaced with actual market data API)
  const benchmarks = [
    { name: 'S&P 500', value: 14 },
    { name: 'DOW JONES', value: 9 },
    { name: 'TSLA', value: 9 },
  ];

  if (loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Net Worth & Investable
        </h3>
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No data available.
        </p>
      </div>
    );
  }

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
          {formatCurrency(netWorth, true)}
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
          {formatCurrency(investable, true)}
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
            <span className={`text-xs font-medium ${
              netWorthReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatPercentage(netWorthReturn)}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>INVESTABLE</span>
            <span className={`text-xs font-medium ${
              investableReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatPercentage(investableReturn)}
            </span>
          </div>
          {benchmarks.map((benchmark, index) => (
            <div key={index} className='flex items-center justify-between'>
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{benchmark.name}</span>
              <span className='text-[#10B981] text-xs font-medium'>
                {formatPercentage(benchmark.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Assets Card Component
function AssetsCard({ portfolioSummary, portfolioPerformance, loading }) {
  const { isDarkMode } = useTheme();

  // Get total assets value
  const hasAssetsData = !!portfolioSummary;
  const totalAssets = hasAssetsData
    ? (portfolioSummary?.totalAssets ||
       portfolioSummary?.totalPortfolioValue ||
       0)
    : 0;

  // Get today's change
  const todayChange = portfolioSummary?.todayChange ??
    portfolioPerformance?.totalReturn;
  const todayChangePercent = portfolioSummary?.todayChangePercentage ??
    portfolioPerformance?.totalReturnPercentage;

  // Get 1 year change (from performance data)
  const oneYearChange = portfolioPerformance?.totalReturn;
  const oneYearChangePercent = portfolioPerformance?.totalReturnPercentage;

  if (loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !hasAssetsData) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Assets
        </h3>
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No data available.
        </p>
      </div>
    );
  }

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
        {formatCurrency(totalAssets, true)}
      </h2>
      
      <div className='space-y-3'>
        <div>
          <p className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 DAY
          </p>
          {todayChange != null && todayChangePercent != null && (
            <p className={`text-sm font-medium ${
              todayChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {todayChange >= 0 ? '+' : ''}{formatCurrency(todayChange)} ({formatPercentage(todayChangePercent)})
            </p>
          )}
        </div>
        <div>
          <p className={`text-xs mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 YEAR
          </p>
          {oneYearChange != null && oneYearChangePercent != null && (
            <p className={`text-sm font-medium ${
              oneYearChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {oneYearChange >= 0 ? '+' : ''}{formatCurrency(oneYearChange)} ({formatPercentage(oneYearChangePercent)})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Debts Card Component
function DebtsCard({ portfolioSummary, portfolioPerformance, loading }) {
  const { isDarkMode } = useTheme();

  // Get total debts
  const hasPortfolioSummary = !!portfolioSummary;
  const totalDebts = hasPortfolioSummary ? (portfolioSummary.totalDebts || 0) : 0;

  // Debt changes (typically debts don't change daily, but can change over time)
  const oneDayChange = 0; // Debts typically don't change daily
  const oneYearChange = portfolioPerformance?.totalReturn ?? null; // Use as placeholder

  if (loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Debts
        </h3>
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No data available.
        </p>
      </div>
    );
  }

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
        {formatCurrency(totalDebts, true)}
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
            {formatCurrency(oneDayChange)}
          </p>
        </div>
        <div>
          <p className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            1 YEAR
          </p>
          {oneYearChange != null && (
            <p className={`text-sm font-medium ${
              oneYearChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {oneYearChange >= 0 ? '+' : ''}{formatCurrency(oneYearChange)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Cash on hand Card Component
function CashOnHandCard({ accountData, bankAccounts, loading }) {
  const { isDarkMode } = useTheme();

  // Calculate total cash from bank accounts
  const hasCashData = !!accountData || (bankAccounts && bankAccounts.length > 0);
  const totalCash = hasCashData
    ? (bankAccounts?.reduce((sum, account) => {
        return sum + (parseFloat(account.balance) || 0);
      }, 0) || accountData?.stats?.portfolioValue || 0)
    : 0;

  // Calculate overdue payments (negative balance or pending payments)
  const overdue = null; // Not used when payment stats are unavailable

  if (loading && !accountData && !bankAccounts.length) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !hasCashData) {
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
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No data available.
        </p>
      </div>
    );
  }

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
        {formatCurrency(totalCash)}
      </h2>
      {overdue != null && overdue < 0 && (
        <div>
          <p className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Overdue
          </p>
          <p className='text-[#EF4444] text-sm font-medium'>
            {formatCurrency(overdue)}
          </p>
        </div>
      )}
    </div>
  );
}

// Tax Estimate Card Component
function TaxEstimateCard({ portfolioSummary, portfolioPerformance, loading }) {
  const { isDarkMode } = useTheme();

  // Calculate tax estimate (typically 15-20% of gains)
  const totalGains = portfolioPerformance?.totalReturn ??
                     portfolioSummary?.totalReturns ??
                     null;
  const taxEstimate = totalGains != null ? totalGains * 0.20 : null; // 20% tax estimate

  // Adjusted net worth (net worth minus tax estimate)
  const hasPortfolioSummary = !!portfolioSummary;
  const netWorth = hasPortfolioSummary
    ? (portfolioSummary.totalPortfolioValue ||
       (portfolioSummary.totalAssets && portfolioSummary.totalDebts
         ? portfolioSummary.totalAssets - portfolioSummary.totalDebts
         : 0))
    : 0;
  const adjustedNetWorth = taxEstimate != null ? (netWorth - taxEstimate) : null;

  if (loading && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !portfolioSummary && totalGains == null) {
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
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No data available.
        </p>
      </div>
    );
  }

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
      {taxEstimate != null && (
        <h2 className={`text-3xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>
          {formatCurrency(taxEstimate)}
        </h2>
      )}
      <div>
        <p className={`text-xs mb-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Adjusted Net Worth
        </p>
        {adjustedNetWorth != null && (
          <p className={`text-sm font-medium ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            {formatCurrency(adjustedNetWorth, true)}
          </p>
        )}
      </div>
    </div>
  );
}


// Historical Performance Graph Component
function HistoricalPerformanceGraph({ portfolioHistory, portfolioSummary, loading }) {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = React.useState('ALL-TIME');

  // Transform portfolio history data for chart
  const transformHistoryData = (history) => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      return [];
    }

    return history.map((item, index) => {
      const date = item.date ? new Date(item.date) : new Date();
      const value = parseFloat(item.value) || 0;
      
      // Format date based on time range
      let dateLabel = '';
      if (timeRange === 'ALL-TIME') {
        dateLabel = date.getFullYear().toString();
      } else if (timeRange === '1Y') {
        const month = date.toLocaleString('default', { month: 'short' });
        dateLabel = `${month} ${date.getDate()}`;
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // Calculate net worth and investable from portfolio value
      // For now, we'll use the same value for both (can be adjusted based on actual data structure)
      return {
        date: dateLabel,
        netWorth: value / 1000000, // Convert to millions
        investable: value / 1000000 * 0.72, // Assume investable is 72% of net worth
      };
    });
  };

  // Get historical data from API (no static fallback)
  const hasHistory = portfolioHistory && portfolioHistory.length > 0;
  const historicalData = hasHistory ? transformHistoryData(portfolioHistory) : [];

  // Calculate current values
  const currentNetWorth = portfolioSummary?.totalPortfolioValue
    ? portfolioSummary.totalPortfolioValue / 1000000
    : (historicalData[historicalData.length - 1]?.netWorth ?? null);
  
  const currentInvestable = portfolioSummary?.cashAvailable
    ? portfolioSummary.cashAvailable / 1000000
    : (historicalData[historicalData.length - 1]?.investable ?? null);

  const initialNetWorth = historicalData[0]?.netWorth ?? null;
  const initialInvestable = historicalData[0]?.investable ?? null;
  const netWorthGrowth =
    currentNetWorth != null && initialNetWorth != null
      ? currentNetWorth - initialNetWorth
      : null;
  const investableGrowth =
    currentInvestable != null && initialInvestable != null
      ? currentInvestable - initialInvestable
      : null;
  const netWorthGrowthPercent =
    netWorthGrowth != null && initialNetWorth
      ? ((netWorthGrowth / initialNetWorth) * 100).toFixed(0)
      : null;
  const investableGrowthPercent =
    investableGrowth != null && initialInvestable
      ? ((investableGrowth / initialInvestable) * 100).toFixed(0)
      : null;

  if (loading && !hasHistory && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // If not loading and still no data, don't show dummy values
  if (!loading && !hasHistory && !portfolioSummary) {
    return (
      <div className={`bg-transparent border rounded-2xl p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Historical Performance
        </h3>
        <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-500 text-sm'}>
          No historical data available.
        </p>
      </div>
    );
  }

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
            {currentNetWorth != null && (
              <>
                <h2 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  ${currentNetWorth.toFixed(3)} Million
                </h2>
                {netWorthGrowth != null && netWorthGrowthPercent != null && (
                  <p className={`text-sm font-medium ${
                    netWorthGrowth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {netWorthGrowth >= 0 ? '+' : ''}${netWorthGrowth.toFixed(2)}M ({netWorthGrowthPercent}%)
                  </p>
                )}
              </>
            )}
          </div>

          {/* Investable Summary */}
          <div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Investable
            </h3>
            {currentInvestable != null && (
              <>
                <h2 className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  ${currentInvestable.toFixed(3)} Million
                </h2>
                {investableGrowth != null && investableGrowthPercent != null && (
                  <p className={`text-sm font-medium ${
                    investableGrowth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {investableGrowth >= 0 ? '+' : ''}${investableGrowth.toFixed(2)}M ({investableGrowthPercent}%)
                  </p>
                )}
              </>
            )}
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

