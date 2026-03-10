'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTradingTransactions } from '@/utils/tradingApi';
import { getPaymentHistory } from '@/utils/paymentsApi';
import { getRecentTrades } from '@/utils/portfolioApi';
import { getBankTransactions, getBankAccounts } from '@/utils/bankingApi';

export default function TransactionsPage() {
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'trading' | 'payment' | 'banking'
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAllTransactions();
  }, [filter, dateRange]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const allTransactions = [];

      // Fetch trading transactions
      if (filter === 'all' || filter === 'trading') {
        try {
          const tradingTxs = await fetchTradingTransactions();
          allTransactions.push(...tradingTxs);
        } catch (error) {
          console.error('Failed to fetch trading transactions:', error);
        }
      }

      // Fetch payment transactions
      if (filter === 'all' || filter === 'payment') {
        try {
          const paymentTxs = await fetchPaymentTransactions();
          allTransactions.push(...paymentTxs);
        } catch (error) {
          console.error('Failed to fetch payment transactions:', error);
        }
      }

      // Fetch recent trades
      if (filter === 'all' || filter === 'trading') {
        try {
          const recentTrades = await fetchRecentTrades();
          allTransactions.push(...recentTrades);
        } catch (error) {
          console.error('Failed to fetch recent trades:', error);
        }
      }

      // Fetch banking transactions
      if (filter === 'all' || filter === 'banking') {
        try {
          const bankingTxs = await fetchBankingTransactions();
          allTransactions.push(...bankingTxs);
        } catch (error) {
          console.error('Failed to fetch banking transactions:', error);
        }
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date || a.executedAt || a.createdAt || 0);
        const dateB = new Date(b.date || b.executedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingTransactions = async () => {
    try {
      const response = await getTradingTransactions({
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 100,
      });
      const transactionsData = response.transactions || response.data || [];
      return transactionsData.map((tx) => ({
        id: tx.id || `trading_${tx.date}`,
        type: tx.activityType === 'FILL' ? 'buy' : 'sell',
        name: tx.symbol || tx.description || 'Trading',
        amount: tx.amount ? (tx.amount >= 0 ? `+$${Math.abs(tx.amount).toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`) : '$0.00',
        date: tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        time: tx.date ? new Date(tx.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
        status: 'completed',
        category: 'trading',
        rawDate: tx.date,
      }));
    } catch (error) {
      return [];
    }
  };

  const fetchPaymentTransactions = async () => {
    try {
      const response = await getPaymentHistory({
        limit: 100,
        offset: 0,
      });
      const paymentsData = response.data || [];
      return paymentsData.map((payment) => ({
        id: payment.id || `payment_${payment.createdAt}`,
        type: 'payment',
        name: payment.description || 'Payment',
        amount: `-$${payment.amount?.toFixed(2) || '0.00'}`,
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        time: payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
        status: payment.status || 'completed',
        category: 'payment',
        rawDate: payment.createdAt,
      }));
    } catch (error) {
      return [];
    }
  };


  const fetchBankingTransactions = async () => {
    try {
      const accountsResponse = await getBankAccounts();
      const accounts = accountsResponse.data || accountsResponse || [];
      const allBankingTxs = [];

      for (const account of accounts) {
        try {
          const response = await getBankTransactions(account.id, {
            start_date: dateRange.start,
            end_date: dateRange.end,
            limit: 100,
          });
          const transactionsData = response.transactions || response.data || [];
          allBankingTxs.push(
            ...transactionsData.map((tx) => ({
              id: tx.id || `banking_${tx.transactionDate}`,
              type: tx.amount >= 0 ? 'deposit' : 'withdrawal',
              name: tx.description || tx.category || 'Banking Transaction',
              amount: tx.amount ? (tx.amount >= 0 ? `+$${Math.abs(tx.amount).toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`) : '$0.00',
              date: tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
              time: tx.transactionDate ? new Date(tx.transactionDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
              status: 'completed',
              category: 'banking',
              rawDate: tx.transactionDate,
            }))
          );
        } catch (error) {
          console.error(`Failed to fetch transactions for account ${account.id}:`, error);
        }
      }

      return allBankingTxs;
    } catch (error) {
      return [];
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const response = await getRecentTrades({ limit: 50 });
      const tradesData = response.data || [];
      return tradesData.map((trade) => ({
        id: trade.id || `trade_${trade.executedAt}`,
        type: trade.type || 'buy',
        name: trade.symbol || 'Trade',
        amount: trade.type === 'buy' ? `-$${trade.total?.toFixed(2) || '0.00'}` : `+$${trade.total?.toFixed(2) || '0.00'}`,
        date: trade.executedAt ? new Date(trade.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        time: trade.executedAt ? new Date(trade.executedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
        status: trade.status || 'completed',
        category: 'trading',
        rawDate: trade.executedAt,
      }));
    } catch (error) {
      return [];
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string') {
      return amount;
    }
    return amount >= 0 ? `+$${Math.abs(amount).toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <DashboardLayout>
      <div className='mb-8'>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Transactions
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          View your complete transaction history
        </p>
      </div>

      {/* Filters */}
      <div className='mb-6 flex flex-wrap items-center gap-4'>
        <div className='flex items-center gap-2'>
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Filter:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm border ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value='all'>All Transactions</option>
            <option value='trading'>Trading</option>
            <option value='payment'>Payments</option>
            <option value='banking'>Banking</option>
          </select>
        </div>
        <div className='flex items-center gap-2'>
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            From:
          </label>
          <input
            type='date'
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className={`px-4 py-2 rounded-lg text-sm border ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            To:
          </label>
          <input
            type='date'
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className={`px-4 py-2 rounded-lg text-sm border ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>
      </div>

      <GlassCard className='p-6'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-akunuba-border'>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Asset
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Amount
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Date
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Time
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Loader for Transactions Table
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className='border-b border-akunuba-border/50 last:border-0'>
                      <td className='py-4'>
                        <div className={`h-6 w-16 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                      <td className='py-4'>
                        <div className={`h-5 w-32 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                      <td className='py-4'>
                        <div className={`h-5 w-24 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                      <td className='py-4'>
                        <div className={`h-4 w-20 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                      <td className='py-4'>
                        <div className={`h-4 w-16 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                      <td className='py-4'>
                        <div className={`h-6 w-20 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </td>
                    </tr>
                  ))}
                </>
              ) : transactions.length > 0 ? (
                transactions.map(transaction => {
                  const isPositive = transaction.amount?.startsWith('+') || transaction.type === 'sell' || transaction.type === 'deposit';
                  const isNegative = transaction.amount?.startsWith('-') || transaction.type === 'buy' || transaction.type === 'payment' || transaction.type === 'withdrawal';
                  
                  return (
                    <tr
                      key={transaction.id}
                      className='border-b border-akunuba-border/50 last:border-0'
                    >
                      <td className='py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'buy' || transaction.type === 'deposit'
                              ? 'bg-green-500/20 text-green-400'
                              : transaction.type === 'sell' || transaction.type === 'withdrawal' || transaction.type === 'payment'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {transaction.type === 'buy' ? 'Buy' : 
                           transaction.type === 'sell' ? 'Sell' :
                           transaction.type === 'deposit' ? 'Deposit' :
                           transaction.type === 'withdrawal' ? 'Withdrawal' :
                           transaction.type === 'payment' ? 'Payment' : 'Transaction'}
                        </span>
                      </td>
                      <td
                        className={`py-4 font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {transaction.name}
                      </td>
                      <td
                        className={`py-4 font-medium ${
                          isPositive
                            ? 'text-green-400'
                            : isNegative
                            ? 'text-red-400'
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td
                        className={`py-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {transaction.date || 'N/A'}
                      </td>
                      <td
                        className={`py-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {transaction.time || 'N/A'}
                      </td>
                      <td className='py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {transaction.status === 'completed'
                            ? 'Completed'
                            : transaction.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className='py-12 text-center'>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      No transactions found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
