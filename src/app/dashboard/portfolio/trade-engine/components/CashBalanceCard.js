'use client';

import { formatCurrency } from '@/utils/formatters';

/**
 * Trading cash balance + recent ledger movements.
 *
 * Accounts start at $0.00 and buy orders are funds-checked against this
 * balance, so a zero balance is the reason buys fail — call that out here
 * rather than letting the user discover it at order time.
 */
export default function CashBalanceCard({ cash, isDarkMode, onDeposit }) {
  const balance = cash?.cashBalance ?? 0;
  const currency = cash?.currency || 'USD';
  const transactions = Array.isArray(cash?.transactions) ? cash.transactions : [];
  const isEmpty = !(balance > 0);

  return (
    <div
      className={`rounded-3xl border p-6 ${
        isDarkMode
          ? 'bg-gradient-to-r shadow-lg border-[#FFFFFF1A] from-[#222126] to-[#111116]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-start justify-between gap-4 mb-4'>
        <div>
          <h3
            className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Trading Cash
          </h3>
          <p
            className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {formatCurrency(balance, { minDecimals: 2, maxDecimals: 2 })}
            <span
              className={`ml-2 text-sm font-normal ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              {currency}
            </span>
          </p>
        </div>

        <button
          onClick={onDeposit}
          className='px-4 py-2 rounded-lg bg-[#F1CB68] text-[#101014] text-sm font-semibold hover:bg-[#d4b55a] transition-colors flex-shrink-0'
        >
          Deposit
        </button>
      </div>

      {isEmpty && (
        <div
          className={`rounded-lg px-3 py-2.5 mb-4 text-sm ${
            isDarkMode
              ? 'bg-[#F1CB6814] text-[#F1CB68]'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          You have no trading cash. Deposit from a linked bank account before
          placing a buy order.
        </div>
      )}

      {transactions.length > 0 && (
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wide mb-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            Recent activity
          </p>
          <ul className='space-y-2 max-h-56 overflow-y-auto'>
            {transactions.map((tx, i) => {
              const amount = Number(tx.amount) || 0;
              const isCredit = amount >= 0;
              return (
                <li
                  key={tx.id || tx.orderId || `${tx.createdAt}-${i}`}
                  className='flex items-center justify-between gap-3 text-sm'
                >
                  <div className='min-w-0'>
                    <p
                      className={`truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {tx.description || (isCredit ? 'Deposit' : 'Withdrawal')}
                    </p>
                    {tx.createdAt && (
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}
                      >
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 font-medium ${
                      isCredit ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {isCredit ? '+' : '−'}
                    {formatCurrency(Math.abs(amount), {
                      minDecimals: 2,
                      maxDecimals: 2,
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
