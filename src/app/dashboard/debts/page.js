'use client';

import { useTheme } from '@/context/ThemeContext';
import { getAssets } from '@/utils/assetsApi';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Manual debt management: every liability entered through the asset flow
// (category group "Liabilities") in one dedicated view, with totals.
export default function DebtsPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setLoading(true);
        const res = await getAssets({ categoryGroup: 'Liabilities', limit: 100 });
        const list = Array.isArray(res.data) ? res.data : res.data?.assets || [];
        setDebts(list);
      } catch (err) {
        console.error('Error fetching debts:', err);
        toast.error(err?.message || 'Failed to load debts');
      } finally {
        setLoading(false);
      }
    };
    fetchDebts();
  }, []);

  const amountOwed = (debt) => {
    const specs = debt.specifications || {};
    const value = specs.amountOwed ?? debt.currentValue ?? 0;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const totalDebt = debts.reduce((sum, d) => sum + amountOwed(d), 0);

  const interestRates = debts
    .map((d) => parseFloat(d.specifications?.interestRate))
    .filter((r) => !Number.isNaN(r));
  const avgInterest = interestRates.length
    ? interestRates.reduce((a, b) => a + b, 0) / interestRates.length
    : null;

  const dueDates = debts
    .map((d) => d.specifications?.maturityDate)
    .filter(Boolean)
    .map((raw) => new Date(raw))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);
  const upcoming = dueDates.find((d) => d >= new Date()) || dueDates[0] || null;

  const cardClass = `bg-transparent border rounded-2xl p-6 ${
    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
  }`;
  const labelClass = `text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
  const valueClass = `text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`;

  return (
    <>
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Debt Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            All liabilities you track manually — mortgages, loans, credit cards and other debts.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/assets/add')}
          className='px-4 py-2.5 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold text-sm hover:bg-[#d4b55a] transition-colors'
        >
          Add Debt
        </button>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className={cardClass}>
          <h3 className={`${labelClass} mb-2`}>Total Debt</h3>
          {loading ? (
            <div className='animate-pulse h-8 bg-gray-300/40 rounded w-1/2' />
          ) : (
            <h2 className={valueClass}>{formatCurrency(totalDebt)}</h2>
          )}
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Across {debts.length} liabilit{debts.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <div className={cardClass}>
          <h3 className={`${labelClass} mb-2`}>Average Interest Rate</h3>
          {loading ? (
            <div className='animate-pulse h-8 bg-gray-300/40 rounded w-1/2' />
          ) : (
            <h2 className={valueClass}>
              {avgInterest != null ? formatPercent(avgInterest, { sign: false }) : '—'}
            </h2>
          )}
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Over debts with a recorded rate
          </p>
        </div>
        <div className={cardClass}>
          <h3 className={`${labelClass} mb-2`}>Next Due Date</h3>
          {loading ? (
            <div className='animate-pulse h-8 bg-gray-300/40 rounded w-1/2' />
          ) : (
            <h2 className={valueClass}>
              {upcoming
                ? upcoming.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '—'}
            </h2>
          )}
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Earliest recorded due / maturity date
          </p>
        </div>
      </div>

      {/* Debts table */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Your Debts
        </h3>
        {loading ? (
          <div className='animate-pulse space-y-3'>
            <div className='h-10 bg-gray-300/40 rounded' />
            <div className='h-10 bg-gray-300/40 rounded' />
            <div className='h-10 bg-gray-300/40 rounded' />
          </div>
        ) : debts.length === 0 ? (
          <div className='text-center py-10'>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No debts tracked yet. Add a liability (mortgage, loan, credit card…) to start managing it here.
            </p>
            <button
              onClick={() => router.push('/dashboard/assets/add')}
              className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold text-sm hover:bg-[#d4b55a] transition-colors'
            >
              Add your first debt
            </button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                  {['Name', 'Type', 'Creditor', 'Amount Owed', 'Interest Rate', 'Due Date', ''].map((h) => (
                    <th
                      key={h || 'actions'}
                      className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debts.map((debt) => {
                  const specs = debt.specifications || {};
                  return (
                    <tr
                      key={debt.id}
                      className={`border-b last:border-0 ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}
                    >
                      <td className={`py-4 px-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {debt.name || '—'}
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {specs.debtType || debt.category || '—'}
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {specs.creditorName || '—'}
                      </td>
                      <td className={`py-4 px-4 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(amountOwed(debt), { currency: debt.currency || 'USD' })}
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {specs.interestRate != null && specs.interestRate !== ''
                          ? formatPercent(specs.interestRate, { sign: false })
                          : '—'}
                      </td>
                      <td className={`py-4 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {specs.maturityDate || '—'}
                      </td>
                      <td className='py-4 px-4 text-right'>
                        <button
                          onClick={() => router.push(`/dashboard/assets/${debt.id}`)}
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'
                          } hover:opacity-80 transition-opacity`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
