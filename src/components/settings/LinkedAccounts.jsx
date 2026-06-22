'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getBankAccounts,
  unlinkBankAccount,
  getBankTransactions,
  createBankLinkToken,
} from '@/utils/bankingApi';

export default function LinkedAccounts({ isDarkMode }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError('Please log in to view linked accounts.');
          setLoading(false);
          return;
        }
      }
      const response = await getBankAccounts();
      const data = Array.isArray(response) ? response : response.data || [];
      setAccounts(data);
    } catch (err) {
      console.error('Error fetching linked accounts:', err);
      if (err.status === 401 || err.message?.includes('authentication') || err.message?.includes('Unauthorized')) {
        setError('Authentication failed. Please log out and log in again.');
      } else {
        setError(err.message || 'Failed to load linked accounts.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDisconnect = async (accountId) => {
    try {
      await unlinkBankAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error disconnecting account:', err);
    }
  };

  const handleViewTransactions = async (accountId) => {
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
      setTransactions([]);
      setTransactionsError(null);
      return;
    }
    try {
      setSelectedAccountId(accountId);
      setLoadingTransactions(true);
      setTransactionsError(null);
      const response = await getBankTransactions(accountId, { limit: 10 });
      const data = response.transactions || response.data || [];
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactionsError(err.message || 'Failed to load transactions.');
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setLinkingAccount(true);
      setLinkError(null);
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setLinkError('You must be logged in to link accounts. Please log in and try again.');
          setLinkingAccount(false);
          return;
        }
      }
      const tokenResponse = await createBankLinkToken();
      const linkToken =
        tokenResponse?.linkToken ||
        tokenResponse?.data?.linkToken ||
        tokenResponse?.link_token ||
        tokenResponse?.data?.link_token;
      if (!linkToken) throw new Error('Failed to get link token from server');
      alert(`Link token received: ${linkToken.substring(0, 20)}...\n\nTo complete the integration, you need to:\n1. Install: npm install react-plaid-link\n2. Use usePlaidLink hook with this token\n3. On success, call linkBankAccount({ public_token })`);
    } catch (err) {
      console.error('Error linking account:', err);
      let errorMessage = err.message || 'Failed to initialize account linking. Please try again.';
      if (err.data) {
        if (typeof err.data === 'string') errorMessage = err.data;
        else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            errorMessage = err.data.detail.map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join('; ');
          } else if (typeof err.data.detail === 'string') errorMessage = err.data.detail;
          else errorMessage = JSON.stringify(err.data.detail);
        } else if (err.data.message) errorMessage = err.data.message;
        else if (err.data.error) errorMessage = err.data.error;
      }
      if (err.status === 401 || err.message?.includes('authentication') || err.message?.includes('Unauthorized')) {
        setLinkError('Authentication failed. Please log out and log in again, then try linking your account.');
      } else if (err.status === 403) {
        setLinkError('Banking integration requires Annual subscription. Please upgrade your plan.');
      } else if (err.status === 400) {
        setLinkError(`Bad Request: ${errorMessage}. This might be a backend configuration issue. Please check if Plaid is properly configured on the backend.`);
      } else {
        setLinkError(errorMessage);
      }
    } finally {
      setLinkingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Linked Accounts
          </h2>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your connected banking accounts
          </p>
        </div>
        <button
          onClick={handleAddAccount}
          disabled={linkingAccount}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${linkingAccount ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} ${
            isDarkMode
              ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white border border-[#FFFFFF14]'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {linkingAccount ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Account
            </span>
          )}
        </button>
      </div>

      {linkError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {linkError}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 md:p-6 border animate-pulse ${
                isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className="space-y-2">
                  <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`h-3 w-24 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className="h-8 w-full rounded-lg mt-2 border-dashed border" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div
          className={`rounded-2xl p-8 md:p-12 border text-center ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="max-w-md mx-auto">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No linked accounts yet
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect your bank accounts to track balances and transactions
            </p>
            <button
              onClick={handleAddAccount}
              disabled={linkingAccount}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${linkingAccount ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} ${
                isDarkMode
                  ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white border border-[#FFFFFF14]'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {linkingAccount ? 'Connecting...' : 'Add Your First Account'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {accounts.map((account) => (
            <ServiceCard
              key={account.id}
              account={account}
              isDarkMode={isDarkMode}
              selected={selectedAccountId === account.id}
              loadingTransactions={loadingTransactions && selectedAccountId === account.id}
              transactions={transactions}
              transactionsError={transactionsError}
              onViewTransactions={() => handleViewTransactions(account.id)}
              onDisconnect={() => handleDisconnect(account.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  account,
  isDarkMode,
  selected,
  loadingTransactions,
  transactions,
  transactionsError,
  onViewTransactions,
  onDisconnect,
}) {
  const status = account.isActive === false ? 'inactive' : 'connected';

  return (
    <div className={`rounded-2xl p-5 md:p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold uppercase shrink-0 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {(account.institutionName || account.institution_name || 'BA').toString().slice(0, 2)}
          </div>
          <div>
            <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {account.accountName || account.account_name || 'Linked Account'}
            </h3>
            {status === 'connected' && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                Connected
              </span>
            )}
            {status === 'inactive' && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                Inactive
              </span>
            )}
          </div>
        </div>
        <button className={`shrink-0 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className={`ms-16 text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {account.institutionName || account.institution_name || 'Bank'} · {account.maskedNumber || account.accountNumber || account.account_number || '••••'}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onViewTransactions}
          className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg font-medium border transition-all ${
            isDarkMode ? 'border-[#F1CB68] text-white hover:bg-[#F1CB68]/10' : 'border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
          }`}
        >
          {selected ? 'Hide Transactions' : 'View Recent Transactions'}
        </button>
        <button onClick={onDisconnect} className="px-4 py-2 text-red-400 hover:text-red-300 font-medium transition-colors">
          Disconnect
        </button>
      </div>
      {selected && (
        <div className="mt-4 ms-16 border-t border-dashed border-gray-600/40 pt-3">
          {loadingTransactions ? (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading transactions...</p>
          ) : transactionsError ? (
            <p className="text-sm text-red-400">{transactionsError}</p>
          ) : transactions.length === 0 ? (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No recent transactions available.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {transactions.map((tx) => (
                <li
                  key={tx.id || `${tx.transactionDate || tx.transaction_date}-${tx.amount}`}
                  className={`flex justify-between gap-3 rounded-lg px-3 py-2 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tx.description || 'Transaction'}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tx.transactionDate || tx.transaction_date}</p>
                  </div>
                  <p className={`font-semibold ${(tx.amount || 0) < 0 ? 'text-red-400' : isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {tx.amount != null ? `${tx.amount} ${tx.currency || ''}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
