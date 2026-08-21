'use client';
import { useTheme } from '@/context/ThemeContext';
import { getAccountStats, getMyAccount } from '@/utils/accountsApi';
import { getUserProfile } from '@/utils/authApi';
import { getBankAccounts } from '@/utils/bankingApi';
import { getBenchmarks } from '@/utils/marketApi';
import AllocationCharts from '@/components/dashboard/AllocationCharts';
import StaffDashboardCharts from '@/components/dashboard/StaffDashboardCharts';
import
  {
    getCashFlowSummary,
    getPortfolioHistory,
    getPortfolioPerformance,
    getPortfolioSummary,
  } from '@/utils/portfolioApi';
import {
  formatCurrency as sharedFormatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
} from '@/utils/formatters';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { isCash, sumCash } from '@/utils/bankingCategories';
import
  {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
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

  // Network failures log as warnings (backend unreachable ≠ code bug) so the
  // dev overlay doesn't raise them as Console Errors; real errors stay loud.
  const logFetchFailure = (label, error) =>
    (error?.isNetworkError ? console.warn : console.error)(label, error);

  // One transparent retry for network-level failures ("Failed to fetch"): the
  // dev backend restarts on save and drops whatever was in flight, and 7
  // parallel calls make a partial drop likely. A real outage still surfaces —
  // the retry fails the same way.
  const withRetry = async (call) => {
    try {
      return await call();
    } catch (err) {
      if (!err?.isNetworkError) throw err;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return call();
    }
  };

  const fetchAllData = useCallback(async () => {
      try {
        setLoading(true);
        setIsLoadingProfile(true);

        // Fetch all data in parallel using Promise.allSettled
        const results = await Promise.allSettled([
          withRetry(() => getUserProfile()).catch(err => ({ error: err })),
          withRetry(() => getPortfolioSummary('ALL')).catch(err => ({ error: err })),
          withRetry(() => getPortfolioPerformance(365)).catch(err => ({ error: err })),
          withRetry(() => getPortfolioHistory(365)).catch(err => ({ error: err })),
          withRetry(() => getMyAccount()).catch(err => ({ error: err })),
          withRetry(() => getAccountStats()).catch(err => ({ error: err })),
          withRetry(() => getBankAccounts()).catch(err => ({ error: err })),
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
          logFetchFailure('Failed to fetch user profile:', error);
          setErrors(prev => ({ ...prev, profile: error }));
        }
        setIsLoadingProfile(false);

        // Portfolio Summary
        if (portfolioSummaryResult.status === 'fulfilled' && !portfolioSummaryResult.value.error) {
          setPortfolioSummary(portfolioSummaryResult.value.data || portfolioSummaryResult.value);
        } else {
          const error = portfolioSummaryResult.value?.error || portfolioSummaryResult.reason;
          logFetchFailure('Failed to fetch portfolio summary:', error);
          setErrors(prev => ({ ...prev, portfolioSummary: error }));
        }

        // Portfolio Performance
        if (portfolioPerformanceResult.status === 'fulfilled' && !portfolioPerformanceResult.value.error) {
          setPortfolioPerformance(portfolioPerformanceResult.value);
        } else {
          const error = portfolioPerformanceResult.value?.error || portfolioPerformanceResult.reason;
          logFetchFailure('Failed to fetch portfolio performance:', error);
          setErrors(prev => ({ ...prev, portfolioPerformance: error }));
        }

        // Portfolio History
        if (portfolioHistoryResult.status === 'fulfilled' && !portfolioHistoryResult.value.error) {
          const historyData = portfolioHistoryResult.value.data || portfolioHistoryResult.value;
          setPortfolioHistory(Array.isArray(historyData) ? historyData : []);
        } else {
          const error = portfolioHistoryResult.value?.error || portfolioHistoryResult.reason;
          logFetchFailure('Failed to fetch portfolio history:', error);
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
          logFetchFailure('Failed to fetch account data:', error);
          setErrors(prev => ({ ...prev, account: error }));
        }

        // Bank Accounts
        if (bankAccountsResult.status === 'fulfilled' && !bankAccountsResult.value.error) {
          const accounts = bankAccountsResult.value.data || bankAccountsResult.value;
          setBankAccounts(Array.isArray(accounts) ? accounts : []);
        } else {
          const error = bankAccountsResult.value?.error || bankAccountsResult.reason;
          logFetchFailure('Failed to fetch bank accounts:', error);
          setErrors(prev => ({ ...prev, bankAccounts: error }));
        }

        // One aggregated notice instead of silent gaps when the server was
        // unreachable — the header Refresh button is the retry path.
        if (results.some(r => r.status === 'fulfilled' && r.value?.error?.isNetworkError)) {
          toast.warn('Could not reach the server for some data. Use Refresh to try again.');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
      onRefresh={fetchAllData}
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
  onRefresh,
}) {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  // BUG-05: header Download exports the already-loaded dashboard snapshot as
  // CSV. Failures must never be silent — every path ends in a toast.
  const handleDownload = () => {
    try {
      const s = portfolioSummary || {};
      const rows = [['Metric', 'Value']];
      const pushIf = (label, v) => {
        if (v !== undefined && v !== null && v !== '') rows.push([label, v]);
      };
      pushIf('Net worth', s.netWorth ?? s.net_worth ?? s.totalValue ?? s.total_value);
      pushIf('Total assets', s.totalAssets ?? s.total_assets);
      pushIf('Total liabilities', s.totalLiabilities ?? s.total_liabilities);
      pushIf('Investable cash', s.investableCash ?? s.investable_cash ?? s.cashBalance ?? s.cash_balance);
      pushIf('Linked bank accounts', Array.isArray(bankAccounts) ? bankAccounts.length : undefined);
      pushIf('Account status', accountData?.status);
      if (Array.isArray(portfolioHistory) && portfolioHistory.length) {
        rows.push([''], ['Date', 'Portfolio value']);
        portfolioHistory.forEach(p =>
          rows.push([
            p.date ?? p.timestamp ?? '',
            p.value ?? p.totalValue ?? p.total_value ?? '',
          ])
        );
      }
      if (rows.length <= 1) {
        toast.info('Nothing to export yet — wait for the dashboard to finish loading.');
        return;
      }
      const csv = rows
        .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `akunuba-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Dashboard snapshot exported');
    } catch (err) {
      console.error('Dashboard export failed:', err);
      toast.error('Could not export the dashboard. Please try again.');
    }
  };

  return (
    <>
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
            'Welcome, User'
          ) : userProfile ? (
            `Welcome, ${userProfile.first_name || userProfile.email?.split('@')[0] || 'User'}`
          ) : (
            'Welcome, User'
          )}
        </h1>
        
        {/* Navigation Icons */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onRefresh}
            disabled={loading}
            title='Refresh'
            aria-label='Refresh dashboard'
            className={`p-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
            }`}
          >
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2' className={loading ? 'animate-spin' : ''}>
              <path d='M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2' />
            </svg>
          </button>
          <button
            onClick={() => router.push('/dashboard/marketplace')}
            title='Search marketplace'
            aria-label='Search marketplace'
            className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.35-4.35' />
            </svg>
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            title='Download dashboard snapshot (CSV)'
            aria-label='Download dashboard snapshot'
            className={`p-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
          }`}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={isDarkMode ? '#666666' : '#9CA3AF'} strokeWidth='2'>
              <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
              <polyline points='16 6 12 2 8 6' />
              <line x1='12' y1='2' x2='12' y2='15' />
            </svg>
          </button>
          <button
            onClick={() => router.push('/dashboard/settings')}
            title='Settings'
            aria-label='Open settings'
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-[#2A2A2D]' : 'hover:bg-gray-100'
            }`}
          >
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

      {/* Role-specific charts: advisor book of business / admin escrow money
          story (same donut + Sankey forms; renders nothing for investors).
          Placed FIRST for staff — the investor widgets below are mostly empty
          for them, and the charts were being missed at the bottom. */}
      <StaffDashboardCharts />

      {/* Top Row Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Net Worth & Investable Card */}
        <NetWorthInvestableCard
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          portfolioHistory={portfolioHistory}
          loading={loading}
        />

        {/* Assets Card */}
        <AssetsCard
          portfolioSummary={portfolioSummary}
          portfolioPerformance={portfolioPerformance}
          portfolioHistory={portfolioHistory}
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

      {/* Asset allocation Sankey + asset-class donut (investor only — staff
          have no portfolio; the component renders nothing for them). */}
      <AllocationCharts />
    </>
  );
}

// Full amounts with thousands separators, never more than 2 decimals.
const formatCurrency = (value) => sharedFormatCurrency(value);

const formatPercentage = (value) => formatPercent(value);

// ── Stat-tile building blocks ────────────────────────────────────────────────

// Pill that shows a signed change: ▲ +$X (+Y%) green, ▼ red, dash when null.
function DeltaChip({ amount, percent, isDarkMode }) {
  if (amount == null && percent == null) return null;
  const up = (amount ?? percent) >= 0;
  const cls = up
    ? 'bg-[#10B981]/10 text-[#10B981]'
    : 'bg-[#EF4444]/10 text-[#EF4444]';
  const parts = [];
  if (amount != null) parts.push(`${up ? '+' : ''}${formatCurrency(amount)}`);
  if (percent != null) parts.push(`${amount != null ? '(' : ''}${formatPercentage(percent)}${amount != null ? ')' : ''}`);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <svg width='9' height='9' viewBox='0 0 10 10' fill='currentColor' style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
        <path d='M5 1l4 6H1z' />
      </svg>
      {parts.join(' ')}
    </span>
  );
}

// Tiny axis-less area chart of {date, value} history — trend at a glance.
function MiniSparkline({ history, isDarkMode, height = 48 }) {
  const data = (history || [])
    .map((item) => ({ value: parseFloat(item.value) || 0 }))
    .filter((d) => d.value > 0);
  if (data.length < 2) return null;
  const gold = isDarkMode ? '#F1CB68' : '#c98500';
  const gradId = `spark-${isDarkMode ? 'd' : 'l'}-${height}`;
  return (
    <div style={{ height }} className='mt-3 -mx-1'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          {/* Padded domain so a flat history renders as a mid-height line
              instead of hugging the top edge like a solid block. */}
          <YAxis hide domain={[(min) => min * 0.96, (max) => max * 1.04]} />
          <defs>
            <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={gold} stopOpacity={0.35} />
              <stop offset='100%' stopColor={gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type='monotone'
            dataKey='value'
            stroke={gold}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal meter: `ratio` (0..1) of the track filled in `color`.
function MeterBar({ ratio, color, isDarkMode, label }) {
  const pct = Math.max(0, Math.min(1, ratio ?? 0)) * 100;
  return (
    <div>
      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
        <div
          className='h-full rounded-full transition-all'
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {label && (
        <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </p>
      )}
    </div>
  );
}

// Net Worth & Investable Card Component
function NetWorthInvestableCard({ portfolioSummary, portfolioPerformance, portfolioHistory, loading }) {
  const { isDarkMode } = useTheme();
  const [benchmarks, setBenchmarks] = React.useState([]);
  const [benchmarksLoading, setBenchmarksLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchBenchmarks = async () => {
      try {
        const response = await getBenchmarks();
        const data = response?.benchmarks || response?.data || [];
        if (isMounted && Array.isArray(data)) {
          setBenchmarks(data);
        }
      } catch (error) {
        (error?.isNetworkError ? console.warn : console.error)('Failed to fetch market benchmarks:', error);
      } finally {
        if (isMounted) {
          setBenchmarksLoading(false);
        }
      }
    };

    fetchBenchmarks();

    return () => {
      isMounted = false;
    };
  }, []);

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
      {/* Net Worth — hero + delta chip + trend sparkline */}
      <div className='mb-5'>
        <div className='flex items-center gap-2 mb-2'>
          <h3 className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Net Worth
          </h3>
          <InfoIcon />
        </div>
        <div className='flex items-center gap-3 flex-wrap'>
          <h2 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>
            {formatCurrency(netWorth, true)}
          </h2>
          <DeltaChip percent={netWorthReturn} isDarkMode={isDarkMode} />
        </div>
        <MiniSparkline history={portfolioHistory} isDarkMode={isDarkMode} height={48} />
      </div>

      {/* Investable — secondary metric with its own chip */}
      <div className={`mb-5 pt-4 border-t ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Investable
          </h3>
          <InfoIcon />
        </div>
        <div className='flex items-center gap-3 flex-wrap'>
          <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-black'
          }`}>
            {formatCurrency(investable, true)}
          </h2>
          <DeltaChip percent={investableReturn} isDarkMode={isDarkMode} />
        </div>
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
          {benchmarksLoading ? (
            <div
              className={`text-xs text-center py-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Loading market benchmarks...
            </div>
          ) : benchmarks.length > 0 ? (
            benchmarks.map((benchmark, index) => (
              <div key={benchmark.symbol || benchmark.name || index} className='flex items-center justify-between'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {benchmark.name || benchmark.symbol}
                </span>
                <span className='text-[#10B981] text-xs font-medium'>
                  {formatPercentage(
                    benchmark.changePercentage ?? benchmark.change_percentage ?? benchmark.value,
                  )}
                </span>
              </div>
            ))
          ) : (
            <div
              className={`text-xs text-center py-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              No benchmark data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Assets Card Component
function AssetsCard({ portfolioSummary, portfolioPerformance, portfolioHistory, loading }) {
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
      <h2 className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-black'
      }`}>
        {formatCurrency(totalAssets, true)}
      </h2>
      <MiniSparkline history={portfolioHistory} isDarkMode={isDarkMode} height={44} />

      <div className='space-y-2.5 mt-4'>
        {todayChange != null && todayChangePercent != null && (
          <div className='flex items-center justify-between gap-2'>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              1 DAY
            </p>
            <DeltaChip amount={todayChange} percent={todayChangePercent} isDarkMode={isDarkMode} />
          </div>
        )}
        {oneYearChange != null && oneYearChangePercent != null && (
          <div className='flex items-center justify-between gap-2'>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              1 YEAR
            </p>
            <DeltaChip amount={oneYearChange} percent={oneYearChangePercent} isDarkMode={isDarkMode} />
          </div>
        )}
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
      <h2 className={`text-3xl font-bold mb-5 ${
          isDarkMode ? 'text-white' : 'text-black'
      }`}>
        {formatCurrency(totalDebts, true)}
      </h2>

      {/* Leverage meter: debts as a share of gross assets. */}
      {(() => {
        const grossAssets = portfolioSummary?.totalAssets || 0;
        if (!(grossAssets > 0)) return null;
        const ratio = totalDebts / grossAssets;
        return (
          <div className='mb-5'>
            <MeterBar
              ratio={ratio}
              color='#EF4444'
              isDarkMode={isDarkMode}
              label={`${(ratio * 100).toFixed(1)}% of gross assets (${formatCurrency(grossAssets, true)})`}
            />
          </div>
        );
      })()}

      <div className='space-y-2.5'>
        <div className='flex items-center justify-between gap-2'>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            1 DAY
          </p>
          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {formatCurrency(oneDayChange)}
          </span>
        </div>
        {oneYearChange != null && (
          <div className='flex items-center justify-between gap-2'>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              1 YEAR
            </p>
            <DeltaChip amount={oneYearChange} isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
    </div>
  );
}

// Cash on hand Card Component
function CashOnHandCard({ accountData, bankAccounts, loading }) {
  const { isDarkMode } = useTheme();

  // Only depository accounts are cash. Since Plaid categorisation landed, the
  // same endpoint also returns credit cards, loans and investment accounts —
  // summing all of them counted a mortgage balance AS cash.
  const cashAccounts = Array.isArray(bankAccounts)
    ? bankAccounts.filter(isCash)
    : [];
  const hasCashData = !!accountData || cashAccounts.length > 0;
  const totalCash = hasCashData
    ? sumCash(bankAccounts) || accountData?.stats?.portfolioValue || 0
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
      {/* Per-account breakdown, bar length proportional to balance. */}
      {cashAccounts.length > 0 && totalCash > 0 && (
        <div className='space-y-2.5 mb-1'>
          {[...cashAccounts]
            .map((a) => ({
              name: a.accountName || a.name || a.institutionName || a.institution_name || 'Account',
              mask: a.mask || a.accountNumber?.slice(-4) || null,
              balance: parseFloat(a.balance) || 0,
            }))
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 4)
            .map((a, i) => (
              <div key={`${a.name}-${i}`}>
                <div className='flex items-center justify-between gap-2 mb-1'>
                  <span className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {a.name}{a.mask ? ` ··${a.mask}` : ''}
                  </span>
                  <span className={`text-xs font-medium shrink-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatCurrency(a.balance)}
                  </span>
                </div>
                <MeterBar
                  ratio={a.balance / totalCash}
                  color={isDarkMode ? '#F1CB68' : '#c98500'}
                  isDarkMode={isDarkMode}
                />
              </div>
            ))}
        </div>
      )}
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
  const [plaidIncome, setPlaidIncome] = React.useState(null);

  // Income seen on linked bank accounts (Plaid) over the last 12 months feeds
  // the estimate too. Banking is subscription-gated — fail silently without it.
  React.useEffect(() => {
    let isMounted = true;
    const fetchIncome = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        const res = await getCashFlowSummary({
          period: 'custom',
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
        });
        const summary = res?.data || res || {};
        const inflow = summary.totalInflow ?? summary.total_inflow;
        if (isMounted && inflow != null && !Number.isNaN(parseFloat(inflow))) {
          setPlaidIncome(parseFloat(inflow));
        }
      } catch (error) {
        // Expected for accounts without linked banking — never an overlay error.
        console.warn('Tax estimate: no Plaid cash-flow data available:', error);
      }
    };
    fetchIncome();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate tax estimate (typically 15-20% of gains)
  const totalGains = portfolioPerformance?.totalReturn ??
                     portfolioSummary?.totalReturns ??
                     null;
  const gainsTax = totalGains != null ? totalGains * 0.20 : null; // 20% tax estimate
  const incomeTax = plaidIncome != null && plaidIncome > 0 ? plaidIncome * 0.20 : null;
  const taxEstimate =
    gainsTax != null || incomeTax != null
      ? (gainsTax || 0) + (incomeTax || 0)
      : null;

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
      {/* Where the estimate comes from: gains vs bank income as one split bar. */}
      {taxEstimate != null && taxEstimate > 0 && (gainsTax != null || incomeTax != null) && (
        <div className='mb-4'>
          <div className={`flex h-2 rounded-full overflow-hidden gap-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
            {gainsTax > 0 && (
              <div
                className='h-full'
                style={{ width: `${(gainsTax / taxEstimate) * 100}%`, backgroundColor: isDarkMode ? '#F1CB68' : '#c98500' }}
              />
            )}
            {incomeTax > 0 && (
              <div
                className='h-full'
                style={{ width: `${(incomeTax / taxEstimate) * 100}%`, backgroundColor: isDarkMode ? '#3987e5' : '#2a78d6' }}
              />
            )}
          </div>
          <div className='space-y-1 mt-2'>
            {gainsTax != null && gainsTax > 0 && (
              <div className='flex items-center justify-between gap-2'>
                <span className={`inline-flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className='w-2 h-2 rounded-sm inline-block' style={{ backgroundColor: isDarkMode ? '#F1CB68' : '#c98500' }} />
                  Investment gains (20%)
                </span>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatCurrency(gainsTax)}
                </span>
              </div>
            )}
            {incomeTax != null && incomeTax > 0 && (
              <div className='flex items-center justify-between gap-2'>
                <span className={`inline-flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className='w-2 h-2 rounded-sm inline-block' style={{ backgroundColor: isDarkMode ? '#3987e5' : '#2a78d6' }} />
                  Bank income, last 12 mo (20%)
                </span>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatCurrency(incomeTax)}
                </span>
              </div>
            )}
          </div>
        </div>
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
                  {sharedFormatCurrency(currentNetWorth * 1e6)}
                </h2>
                {netWorthGrowth != null && netWorthGrowthPercent != null && (
                  <p className={`text-sm font-medium ${
                    netWorthGrowth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {netWorthGrowth >= 0 ? '+' : ''}{formatCurrencyCompact(netWorthGrowth * 1e6)} ({netWorthGrowthPercent}%)
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
                  {sharedFormatCurrency(currentInvestable * 1e6)}
                </h2>
                {investableGrowth != null && investableGrowthPercent != null && (
                  <p className={`text-sm font-medium ${
                    investableGrowth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {investableGrowth >= 0 ? '+' : ''}{formatCurrencyCompact(investableGrowth * 1e6)} ({investableGrowthPercent}%)
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
                  tickFormatter={(value) => `$${formatNumber(value)}M`}
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
                    return [`$${formatNumber(value)}M`, label];
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

