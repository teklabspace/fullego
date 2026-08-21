'use client';

import { useEffect, useState } from 'react';
import { getAccountLiabilities } from '@/utils/bankingApi';

const formatMoney = (value, currency = 'USD') => {
  if (value == null || Number.isNaN(Number(value))) return null;
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

// Dates arrive as plain ISO days ("2026-08-15"). Parsing those with `new Date`
// treats them as UTC midnight, which can render as the previous day west of
// Greenwich — so format the parts directly.
const formatDay = value => {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Row = ({ label, value, isDarkMode, emphasis }) => {
  if (value == null || value === '') return null;
  return (
    <div className='flex justify-between gap-4 py-1.5'>
      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </span>
      <span
        className={`text-xs tabular-nums text-right ${
          emphasis ? 'font-semibold' : ''
        } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {value}
      </span>
    </div>
  );
};

/**
 * Liability detail for a credit-card or loan account.
 *
 * Two shapes come back depending on `liabilityType`:
 *   - 'credit'   → minimumPaymentAmount / lastStatementBalance / isOverdue are
 *                  populated, and `details.aprs` carries the rates.
 *   - 'mortgage' → those payment fields are null (Plaid does not report them
 *                  for mortgages — expected, not an error), and `details` has
 *                  the loan terms instead.
 * `details` is a raw Plaid passthrough, so every key is read defensively.
 */
export default function AccountLiability({ accountId, currency, isDarkMode }) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });

    getAccountLiabilities(accountId)
      .then(result => {
        if (!cancelled) setState({ loading: false, error: null, data: result });
      })
      .catch(err => {
        if (!cancelled)
          setState({
            loading: false,
            error: err?.message || 'Could not load liability details.',
            data: null,
          });
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (state.loading)
    return <p className={`text-sm ${muted}`}>Loading details…</p>;

  if (state.error) return <p className='text-sm text-red-400'>{state.error}</p>;

  // getAccountLiabilities maps a 404 to null: the account is linked but Plaid
  // has not synced its liability data yet. That is pending, not broken.
  if (!state.data)
    return (
      <p className={`text-sm ${muted}`}>
        Details haven’t synced from your bank yet. They usually appear within a
        day of linking the account.
      </p>
    );

  const {
    liabilityType,
    balanceOwed,
    lastPaymentAmount,
    lastPaymentDate,
    nextPaymentDueDate,
    minimumPaymentAmount,
    lastStatementBalance,
    isOverdue,
    details = {},
  } = state.data;

  const money = value => formatMoney(value, currency);
  const aprs = Array.isArray(details?.aprs) ? details.aprs : [];
  const rate = details?.interestRate;

  return (
    <div>
      {isOverdue === true && (
        <p className='mb-3 rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-400'>
          This account is overdue.
        </p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8'>
        <div>
          <Row label='Balance owed' value={money(balanceOwed)} emphasis isDarkMode={isDarkMode} />
          <Row label='Next payment due' value={formatDay(nextPaymentDueDate)} isDarkMode={isDarkMode} />
          <Row label='Minimum payment' value={money(minimumPaymentAmount)} isDarkMode={isDarkMode} />
          <Row label='Last payment' value={money(lastPaymentAmount)} isDarkMode={isDarkMode} />
          <Row label='Last payment date' value={formatDay(lastPaymentDate)} isDarkMode={isDarkMode} />
          <Row label='Last statement balance' value={money(lastStatementBalance)} isDarkMode={isDarkMode} />
        </div>

        <div>
          {/* Credit cards report a list of APRs by balance type. */}
          {aprs.map((apr, i) => (
            <Row
              key={`${apr?.aprType || 'apr'}-${i}`}
              label={String(apr?.aprType || 'APR').replace(/_/g, ' ')}
              value={apr?.aprPercentage != null ? `${apr.aprPercentage}%` : null}
              isDarkMode={isDarkMode}
            />
          ))}

          {/* Mortgages and student loans report terms instead. */}
          <Row
            label='Interest rate'
            value={
              rate?.percentage != null
                ? `${rate.percentage}%${rate.type ? ` (${rate.type})` : ''}`
                : null
            }
            isDarkMode={isDarkMode}
          />
          <Row label='Loan term' value={details?.loanTerm} isDarkMode={isDarkMode} />
          <Row label='Originated' value={formatDay(details?.originationDate)} isDarkMode={isDarkMode} />
          <Row label='Matures' value={formatDay(details?.maturityDate)} isDarkMode={isDarkMode} />
          <Row
            label='Original principal'
            value={money(details?.originationPrincipalAmount)}
            isDarkMode={isDarkMode}
          />
          <Row label='Escrow balance' value={money(details?.escrowBalance)} isDarkMode={isDarkMode} />
          <Row
            label='Past due'
            value={details?.pastDueAmount ? money(details.pastDueAmount) : null}
            isDarkMode={isDarkMode}
          />
          <Row
            label='Statement issued'
            value={formatDay(details?.lastStatementIssueDate)}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {liabilityType && (
        <p className={`mt-2 text-[11px] uppercase tracking-wide ${muted}`}>
          {liabilityType} account
        </p>
      )}
    </div>
  );
}
