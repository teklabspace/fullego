'use client';

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/context/ThemeContext';
import {
  getPortfolioAnalytics,
  getPerformanceAnalytics,
  getRiskAnalytics,
} from '@/utils/analyticsApi';

export default function AnalyticsPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState(null);
  const [riskAnalytics, setRiskAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [portfolioRes, performanceRes, riskRes] = await Promise.allSettled([
          getPortfolioAnalytics({ timeRange: '1Y' }),
          // Service currently uses `period` – backend accepts this per backend doc
          getPerformanceAnalytics({ period: '1Y' }),
          getRiskAnalytics(),
        ]);

        if (portfolioRes.status === 'fulfilled') {
          const value = portfolioRes.value;
          setPortfolioAnalytics(value.data || value);
        } else {
          console.error('Failed to fetch portfolio analytics:', portfolioRes.reason);
        }

        if (performanceRes.status === 'fulfilled') {
          const value = performanceRes.value;
          setPerformanceAnalytics(value.data || value);
        } else {
          console.error('Failed to fetch performance analytics:', performanceRes.reason);
        }

        if (riskRes.status === 'fulfilled') {
          const value = riskRes.value;
          setRiskAnalytics(value.data || value);
        } else {
          console.error('Failed to fetch risk analytics:', riskRes.reason);
        }

        if (
          portfolioRes.status === 'rejected' &&
          performanceRes.status === 'rejected' &&
          riskRes.status === 'rejected'
        ) {
          setError('Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const roi =
    performanceAnalytics?.totalReturnPercentage ??
    portfolioAnalytics?.totalReturnPercentage ??
    null;

  const volatility =
    performanceAnalytics?.volatility ??
    riskAnalytics?.volatility ??
    null;

  const sharpeRatio = performanceAnalytics?.sharpeRatio ?? null;
  const alpha = portfolioAnalytics?.alpha ?? null;

  const metrics = [
    {
      title: 'ROI',
      value: roi != null ? `${roi.toFixed(2)}%` : '—',
      change: performanceAnalytics?.periodReturnPercentage
        ? `${performanceAnalytics.periodReturnPercentage.toFixed(2)}%`
        : null,
    },
    {
      title: 'Volatility',
      value: volatility != null ? `${volatility.toFixed(2)}%` : '—',
      change: null,
    },
    {
      title: 'Sharpe Ratio',
      value: sharpeRatio != null ? sharpeRatio.toFixed(2) : '—',
      change: null,
    },
    {
      title: 'Alpha',
      value: alpha != null ? `${alpha.toFixed(2)}%` : '—',
      change: null,
    },
  ];

  const riskBars = (() => {
    const vol = riskAnalytics?.volatility ?? 0;
    const concentration = riskAnalytics?.concentrationRisk ?? 0;
    const diversification = riskAnalytics?.diversificationScore ?? 0;

    return [
      {
        label: 'Market Risk',
        percentage: clamp0To100(vol),
        color: 'bg-yellow-500',
      },
      {
        label: 'Credit Risk',
        percentage: clamp0To100(concentration),
        color: 'bg-green-500',
      },
      {
        label: 'Liquidity Risk',
        percentage: clamp0To100(vol * 0.6),
        color: 'bg-blue-500',
      },
      {
        label: 'Operational Risk',
        percentage: clamp0To100(100 - diversification),
        color: 'bg-purple-500',
      },
    ];
  })();

  const sectorItems = (() => {
    const sectorAllocation = portfolioAnalytics?.sectorAllocation;
    const currentValue = portfolioAnalytics?.currentValue;

    if (!sectorAllocation || typeof sectorAllocation !== 'object') {
      return [];
    }

    return Object.entries(sectorAllocation).map(([sector, pct]) => {
      const percentageNumber =
        typeof pct === 'number' ? pct : parseFloat(String(pct));
      const safePct = Number.isNaN(percentageNumber) ? 0 : percentageNumber;
      const value =
        currentValue && !Number.isNaN(safePct)
          ? `$${((currentValue * safePct) / 100).toLocaleString()}`
          : '—';
      return {
        sector,
        percentage: `${safePct.toFixed(1)}%`,
        value,
      };
    });
  })();

  const bestPerformer = performanceAnalytics?.bestPerformer;
  const mostVolatileAsset = performanceAnalytics?.mostVolatileAsset;
  const largestHolding =
    portfolioAnalytics?.largestHolding ?? portfolioAnalytics?.topHolding;

  return (
    <>
      <div className='mb-8'>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}
        >
          Analytics
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Deep insights into your investment performance
        </p>
        {error && (
          <p className='mt-2 text-sm text-red-400'>
            {error}
          </p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            positive={
              metric.change
                ? !metric.change.startsWith('-')
                : true
            }
            isDarkMode={isDarkMode}
            loading={loading}
          />
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <GlassCard className='p-6'>
          <h2
            className={`text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}
          >
            Risk Analysis
          </h2>
          <div className='space-y-4'>
            {riskBars.map((bar) => (
              <RiskBar
                key={bar.label}
                label={bar.label}
                percentage={bar.percentage}
                color={bar.color}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className='p-6'>
          <h2
            className={`text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}
          >
            Sector Allocation
          </h2>
          <div className='space-y-4'>
            {sectorItems.length > 0 ? (
              sectorItems.map((item) => (
                <SectorItem
                  key={item.sector}
                  sector={item.sector}
                  percentage={item.percentage}
                  value={item.value}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                No sector allocation data available.
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className='p-6'>
        <h2
          className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}
        >
          Performance Metrics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <p className={isDarkMode ? 'text-gray-400 text-sm mb-2' : 'text-gray-600 text-sm mb-2'}>
              Best Performing Asset
            </p>
            <p
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              {bestPerformer?.name ?? bestPerformer?.symbol ?? '—'}
            </p>
            {bestPerformer?.returnPercentage != null && (
              <p className='text-green-400 text-sm'>
                {bestPerformer.returnPercentage >= 0 ? '+' : ''}
                {bestPerformer.returnPercentage.toFixed(1)}% return
              </p>
            )}
          </div>
          <div>
            <p className={isDarkMode ? 'text-gray-400 text-sm mb-2' : 'text-gray-600 text-sm mb-2'}>
              Most Volatile Asset
            </p>
            <p
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              {mostVolatileAsset?.name ?? mostVolatileAsset?.symbol ?? '—'}
            </p>
            {mostVolatileAsset?.volatility != null && (
              <p className='text-yellow-400 text-sm'>
                {mostVolatileAsset.volatility.toFixed(1)}% volatility
              </p>
            )}
          </div>
          <div>
            <p className={isDarkMode ? 'text-gray-400 text-sm mb-2' : 'text-gray-600 text-sm mb-2'}>
              Largest Holding
            </p>
            <p
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              {largestHolding?.name ?? largestHolding?.symbol ?? '—'}
            </p>
            {largestHolding?.value != null && largestHolding?.weight != null && (
              <p className='text-blue-400 text-sm'>
                ${Number(largestHolding.value).toLocaleString()} (
                {largestHolding.weight.toFixed(1)}%)
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </>
  );
}

function MetricCard({ title, value, change, positive, isDarkMode, loading }) {
  return (
    <GlassCard className='p-6'>
      <p className={isDarkMode ? 'text-gray-400 text-sm mb-2' : 'text-gray-600 text-sm mb-2'}>
        {title}
      </p>
      <p className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {loading ? '—' : value}
      </p>
      {change && !loading && (
        <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {change} from last period
        </p>
      )}
    </GlassCard>
  );
}

function RiskBar({ label, percentage, color, isDarkMode }) {
  const safePercentage =
    typeof percentage === 'number' && !Number.isNaN(percentage) ? percentage : 0;
  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <span className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-700 text-sm'}>
          {label}
        </span>
        <span className={isDarkMode ? 'text-white text-sm font-medium' : 'text-black text-sm font-medium'}>
          {safePercentage.toFixed(0)}%
        </span>
      </div>
      <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${clamp0To100(safePercentage)}%` }}
        />
      </div>
    </div>
  );
}

function SectorItem({ sector, percentage, value, isDarkMode }) {
  return (
    <div className='flex items-center justify-between py-2 border-b border-akunuba-border last:border-0'>
      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{sector}</span>
      <div className='text-right'>
        <p className={isDarkMode ? 'text-white font-medium' : 'text-black font-medium'}>
          {value}
        </p>
        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
          {percentage}
        </p>
      </div>
    </div>
  );
}

function clamp0To100(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

