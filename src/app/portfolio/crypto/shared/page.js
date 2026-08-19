'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { getSharedCryptoPortfolio } from '@/utils/portfolioApi';
import {
  formatCurrency,
  formatPercent,
} from '@/utils/formatters';

/**
 * Public, read-only view of a crypto portfolio shared via a share link.
 *
 * URL shape: /portfolio/crypto/shared?code={accessCode}
 * Backend  : GET /api/v1/portfolio/crypto/shared?code={accessCode}  (no auth)
 *
 * The payload deliberately carries no asset ids and no owner identity — the
 * audience is whoever holds the link, so nothing here should assume a session.
 *
 * States: loading | missing-code | invalid | expired | error | ready
 */
export default function SharedCryptoPortfolioPage() {
  const { isDarkMode } = useTheme();

  const [status, setStatus] = useState('loading');
  const [snapshot, setSnapshot] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const accessCode =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('code')
        : null;

    if (!accessCode) {
      setStatus('missing-code');
      return;
    }

    const resolve = async () => {
      try {
        const data = await getSharedCryptoPortfolio(accessCode);
        setSnapshot(data);
        setStatus('ready');
      } catch (err) {
        console.error('Error resolving shared crypto portfolio:', err);
        // 410 is a distinct, expected outcome — an expired link is not a
        // failure the visitor can do anything about, so say so plainly rather
        // than showing a generic error.
        if (err.status === 410 || err.code === 'SHARE_LINK_EXPIRED') {
          setStatus('expired');
        } else if (err.status === 404) {
          setStatus('invalid');
        } else {
          setStatus('error');
          setErrorMessage(
            err.data?.detail || err.message || 'Could not load this portfolio.'
          );
        }
      }
    };

    resolve();
  }, []);

  const pageClass = isDarkMode
    ? 'min-h-screen bg-[#101014] text-white'
    : 'min-h-screen bg-gray-50 text-gray-900';
  const cardClass = `rounded-2xl border p-6 ${
    isDarkMode
      ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF1A]'
      : 'bg-white border-gray-200'
  }`;
  const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  // ── Non-success states ────────────────────────────────────────────────────
  const Message = ({ title, body }) => (
    <div className={pageClass}>
      <div className='max-w-md mx-auto px-4 py-24 text-center'>
        <img src={isDarkMode ? '/darkmode_logo.svg' : '/lightmode_logo.svg'} alt='Akunuba' className='h-8 mx-auto mb-8' />
        <div className={cardClass}>
          <h1 className='text-xl font-bold mb-2'>{title}</h1>
          <p className={`text-sm ${mutedClass}`}>{body}</p>
        </div>
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className={pageClass}>
        <div className='max-w-4xl mx-auto px-4 py-24 text-center'>
          <p className={`text-sm ${mutedClass}`}>Loading shared portfolio…</p>
        </div>
      </div>
    );
  }

  if (status === 'missing-code') {
    return (
      <Message
        title='This link is incomplete'
        body='The share link is missing its access code. Ask the sender for the full link.'
      />
    );
  }

  if (status === 'expired') {
    return (
      <Message
        title='This share link has expired'
        body='The owner set an expiry date on this link and it has passed. Ask them for a new one.'
      />
    );
  }

  if (status === 'invalid') {
    return (
      <Message
        title='This link is no longer available'
        body='It may have been revoked by the owner, or the address may be mistyped.'
      />
    );
  }

  if (status === 'error') {
    return <Message title='Something went wrong' body={errorMessage} />;
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const holdings = Array.isArray(snapshot?.holdings) ? snapshot.holdings : [];
  const performance = Array.isArray(snapshot?.performance)
    ? snapshot.performance
    : [];
  const currency = snapshot?.currency || 'USD';
  const totalReturn = Number(snapshot?.totalReturn) || 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className={pageClass}>
      <div className='max-w-4xl mx-auto px-4 py-10'>
        {/* Header */}
        <div className='flex items-center justify-between gap-4 mb-8'>
          <img src={isDarkMode ? '/darkmode_logo.svg' : '/lightmode_logo.svg'} alt='Akunuba' className='h-7' />
          {snapshot?.expiresAt && (
            <span className={`text-xs ${mutedClass}`}>
              Link expires {new Date(snapshot.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <h1 className='text-2xl font-bold mb-1'>Crypto Portfolio</h1>
        <p className={`text-sm mb-8 ${mutedClass}`}>
          A read-only snapshot shared with you
          {snapshot?.sharedWith ? ` · ${snapshot.sharedWith}` : ''}
          {snapshot?.window ? ` · ${snapshot.window}` : ''}
        </p>

        {/* Totals */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
          <div className={cardClass}>
            <p className={`text-sm mb-1 ${mutedClass}`}>Total Value</p>
            <p className='text-2xl font-bold'>
              {formatCurrency(snapshot?.totalValue ?? 0, {
                minDecimals: 2,
                maxDecimals: 2,
              })}
              <span className={`ml-2 text-sm font-normal ${mutedClass}`}>
                {currency}
              </span>
            </p>
          </div>
          <div className={cardClass}>
            <p className={`text-sm mb-1 ${mutedClass}`}>Total Return</p>
            <p
              className={`text-2xl font-bold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? '+' : '−'}
              {formatCurrency(Math.abs(totalReturn), {
                minDecimals: 2,
                maxDecimals: 2,
              })}
              {snapshot?.returnPercentage != null && (
                <span className='ml-2 text-sm font-normal'>
                  ({formatPercent(snapshot.returnPercentage)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Performance */}
        {performance.length > 0 && (
          <div className={`${cardClass} mb-6`}>
            <h2 className='text-base font-semibold mb-4'>Performance</h2>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id='sharedFill' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#F1CB68' stopOpacity={0.35} />
                      <stop offset='100%' stopColor='#F1CB68' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke={isDarkMode ? '#FFFFFF14' : '#00000010'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey='time'
                    tick={{ fontSize: 11, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? '#1A1A1D' : '#FFFFFF',
                      border: `1px solid ${isDarkMode ? '#FFFFFF1A' : '#E5E7EB'}`,
                      borderRadius: 8,
                      color: isDarkMode ? '#FFFFFF' : '#111827',
                    }}
                    formatter={(value) => [
                      formatCurrency(value, { minDecimals: 2, maxDecimals: 2 }),
                      'Value',
                    ]}
                  />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#F1CB68'
                    strokeWidth={2}
                    fill='url(#sharedFill)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Holdings */}
        <div className={cardClass}>
          <h2 className='text-base font-semibold mb-4'>Holdings</h2>
          {holdings.length === 0 ? (
            <p className={`text-sm ${mutedClass}`}>
              This portfolio has no holdings to show.
            </p>
          ) : (
            <ul className='divide-y divide-gray-200/10'>
              {holdings.map((h, i) => (
                <li
                  key={h.symbol || i}
                  className='flex items-center justify-between gap-4 py-3'
                >
                  <span className='font-medium'>{h.symbol || '—'}</span>
                  <div className='flex items-center gap-4'>
                    <span className={`text-sm ${mutedClass}`}>
                      {formatPercent(h.percentage, { sign: false })}
                    </span>
                    <span className='font-medium tabular-nums'>
                      {formatCurrency(h.value ?? 0, {
                        minDecimals: 2,
                        maxDecimals: 2,
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className={`text-xs text-center mt-8 ${mutedClass}`}>
          Shared via Akunuba · This is a read-only snapshot
        </p>
      </div>
    </div>
  );
}
