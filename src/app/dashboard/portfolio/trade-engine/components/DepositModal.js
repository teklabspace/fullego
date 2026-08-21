'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getBankAccounts } from '@/utils/bankingApi';
import { isCash } from '@/utils/bankingCategories';
import { depositTradingCash } from '@/utils/portfolioApi';
import { formatCurrency } from '@/utils/formatters';
import {
  MONEY_PRECISION,
  sanitizeDecimal,
  validateAmount,
} from '@/utils/validation';

/**
 * Deposit cash from a linked bank account into the trading cash ledger.
 *
 * Without this the ledger sits at $0.00 and every buy order fails with
 * 400 INSUFFICIENT_FUNDS.
 */
export default function DepositModal({ isDarkMode, onClose, onSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getBankAccounts();
        // getBankAccounts returns the array directly (the client already
        // unwrapped the envelope); tolerate a nested `data` just in case.
        const all = Array.isArray(res) ? res : res?.data || [];
        // You can only fund trading cash FROM cash. The linked-accounts list
        // now also carries credit cards, loans and investment accounts.
        const list = all.filter(isCash);
        setAccounts(list);
        if (list.length > 0) setAccountId(list[0].id || '');
      } catch (err) {
        console.error('Error loading linked accounts:', err);
        toast.error('Could not load your linked accounts.');
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  // bankingApi hasn't been migrated onto a normalizer yet, so these can arrive
  // in either casing depending on the endpoint. Read both.
  const accountLabel = (a) => {
    const name = a.accountName || a.account_name || a.name || 'Account';
    const institution = a.institutionName || a.institution_name || '';
    const mask = a.mask || a.accountMask || a.account_mask || '';
    return [institution, name, mask ? `••${mask}` : ''].filter(Boolean).join(' · ');
  };
  const accountBalance = (a) => a?.balance ?? a?.availableBalance ?? a?.available_balance;

  const selected = accounts.find((a) => (a.id || '') === accountId);
  const available = accountBalance(selected);
  const parsedAmount = parseFloat(amount);
  // payments/transfer amounts are Numeric(20, 2): two decimal places, and a
  // deposit of zero is meaningless.
  const amountError = validateAmount(amount, { label: 'Amount' });
  const canSubmit =
    !submitting &&
    accountId &&
    String(amount ?? '').trim() !== '' &&
    !amountError &&
    Number.isFinite(parsedAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const result = await depositTradingCash({
        linkedAccountId: accountId,
        amount: parsedAmount,
      });
      toast.success(
        `Deposited ${formatCurrency(parsedAmount, { minDecimals: 2, maxDecimals: 2 })} to your trading cash.`
      );
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error('Error depositing trading cash:', err);
      const message =
        err.code === 'INSUFFICIENT_FUNDS'
          ? "That's more than the linked account has available."
          : err.status === 404
          ? 'That linked account is no longer available. Pick another one.'
          : err.data?.detail || err.message || 'Deposit failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-[#1A1A1D] border-[#FFFFFF1A] text-white focus:border-[#F1CB68]'
      : 'bg-white border-gray-300 text-gray-900 focus:border-[#F1CB68]'
  }`;

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border p-6 ${
          isDarkMode
            ? 'bg-[#18181B] border-[#FFFFFF1A]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-lg font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Deposit Trading Cash
        </h2>
        <p
          className={`text-sm mb-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Move funds from a linked bank account into your trading balance.
        </p>

        {loadingAccounts ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your linked accounts…
          </p>
        ) : accounts.length === 0 ? (
          <div>
            <p
              className={`text-sm mb-5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              You don’t have a linked bank account to fund from yet. Link a
              checking or savings account in Settings before you can fund
              trading — credit cards, loans and investment accounts can’t be
              used as a funding source.
            </p>
            <a
              href='/dashboard/settings'
              className='inline-block px-4 py-2 rounded-lg bg-[#F1CB68] text-[#101014] text-sm font-semibold hover:bg-[#d4b55a] transition-colors'
            >
              Go to Settings
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              From account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={`${fieldClass} mb-1.5`}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountLabel(a)}
                </option>
              ))}
            </select>
            {available != null && (
              <p
                className={`text-xs mb-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                Available:{' '}
                {formatCurrency(available, { minDecimals: 2, maxDecimals: 2 })}
              </p>
            )}

            <label
              className={`block text-sm font-medium mb-1.5 mt-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Amount
            </label>
            <input
              type='text'
              inputMode='decimal'
              placeholder='0.00'
              value={amount}
              onChange={(e) =>
                setAmount(
                  sanitizeDecimal(e.target.value, {
                    decimals: MONEY_PRECISION.decimals,
                    intDigits: MONEY_PRECISION.intDigits,
                  })
                )
              }
              className={`${fieldClass} ${amountError ? 'border-red-500' : ''}`}
            />
            {amountError && (
              <p className='mt-1.5 text-xs text-red-400'>{amountError}</p>
            )}

            <div className='flex gap-3 mt-6'>
              <button
                type='button'
                onClick={onClose}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] text-gray-300 hover:bg-[#3C3C3E]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={!canSubmit}
                className='flex-1 px-4 py-2.5 rounded-lg bg-[#F1CB68] text-[#101014] text-sm font-semibold hover:bg-[#d4b55a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {submitting ? 'Depositing…' : 'Deposit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
