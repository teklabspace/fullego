'use client';

import { useEffect, useState } from 'react';
import { getAccountHoldings } from '@/utils/bankingApi';

const formatMoney = (value, currency = 'USD') => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `${value} ${currency || ''}`.trim();
  }
};

// Plaid quantities run to 8 decimals for fractional and crypto positions, but
// showing "12.50000000" for a whole-share holding is noise.
const formatQuantity = value => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(8)));
};

/**
 * Holdings for an investment account.
 *
 * `institutionValue` is Plaid's own figure for the position's market value and
 * is authoritative — we display and total that rather than recomputing
 * quantity * price, which does not always agree with it.
 */
export default function AccountHoldings({ accountId, isDarkMode }) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });

    getAccountHoldings(accountId)
      .then(result => {
        if (!cancelled) setState({ loading: false, error: null, data: result });
      })
      .catch(err => {
        if (!cancelled)
          setState({
            loading: false,
            error: err?.message || 'Could not load holdings.',
            data: null,
          });
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const strong = isDarkMode ? 'text-white' : 'text-gray-900';

  if (state.loading)
    return <p className={`text-sm ${muted}`}>Loading holdings…</p>;

  if (state.error) return <p className='text-sm text-red-400'>{state.error}</p>;

  const holdings = state.data?.holdings ?? [];

  // An investment account with nothing in it is a normal state, not a failure.
  if (holdings.length === 0)
    return (
      <p className={`text-sm ${muted}`}>
        No holdings reported for this account yet.
      </p>
    );

  return (
    <div>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm min-w-[420px]'>
          <thead>
            <tr className={`text-xs uppercase tracking-wide ${muted}`}>
              <th className='text-left font-medium pb-2'>Holding</th>
              <th className='text-right font-medium pb-2'>Qty</th>
              <th className='text-right font-medium pb-2'>Cost basis</th>
              <th className='text-right font-medium pb-2'>Value</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(holding => (
              <tr
                key={holding.id}
                className={`border-t ${
                  isDarkMode ? 'border-white/5' : 'border-gray-100'
                }`}
              >
                <td className='py-2 pr-3'>
                  {/* Name is the primary label — ticker can be null, or an
                      options-contract string like NFLX180201C00355000. */}
                  <p className={`font-medium ${strong}`}>
                    {holding.name || holding.tickerSymbol || 'Holding'}
                  </p>
                  <p className={`text-xs ${muted}`}>
                    {[holding.tickerSymbol, holding.securityType]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </td>
                <td className={`py-2 text-right tabular-nums ${strong}`}>
                  {formatQuantity(holding.quantity)}
                </td>
                <td className={`py-2 text-right tabular-nums ${muted}`}>
                  {formatMoney(holding.costBasis, holding.currency)}
                </td>
                <td className={`py-2 text-right tabular-nums font-semibold ${strong}`}>
                  {formatMoney(holding.institutionValue, holding.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.data?.totalValue != null && (
        <div
          className={`flex justify-between items-center mt-3 pt-3 border-t ${
            isDarkMode ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <span className={`text-sm ${muted}`}>Total value</span>
          <span className={`text-sm font-semibold tabular-nums ${strong}`}>
            {/* Server-side sum of every holding's institutionValue. */}
            {formatMoney(
              state.data.totalValue,
              holdings[0]?.currency || 'USD'
            )}
          </span>
        </div>
      )}
    </div>
  );
}
