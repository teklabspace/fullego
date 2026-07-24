'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { toast } from 'react-toastify';
import {
  getBankAccounts,
  unlinkBankAccount,
  getBankTransactions,
  createBankLinkToken,
  linkBankAccount,
} from '@/utils/bankingApi';
import { getBrokerageAccounts } from '@/utils/portfolioApi';
import { getBenchmarks } from '@/utils/marketApi';

const PROVIDERS = {
  plaid: {
    name: 'Plaid',
    tagline: 'Bank Accounts',
    tile: { bg: 'bg-[#111111]', text: 'text-white', label: 'P' },
    description:
      'Securely link your bank accounts. Linked banks power the cash-flow section and the "Cash Available" card on your dashboard.',
    powers: ['Cash-flow overview', 'Cash available card', 'Bank transactions'],
  },
  alpaca: {
    name: 'Alpaca',
    tagline: 'Brokerage',
    tile: { bg: 'bg-[#FCD32C]', text: 'text-black', label: 'A' },
    description:
      'Brokerage behind the Trade Engine — your brokerage account, placing, checking, and canceling orders. Orders are sent to Alpaca first, then mirrored into your orders history.',
    powers: ['Brokerage account', 'Place, check & cancel orders', 'Trade Engine'],
  },
  polygon: {
    name: 'Polygon',
    tagline: 'Market Data',
    tile: { bg: 'bg-[#5F5CFF]', text: 'text-white', label: '◆' },
    description:
      'Real-time and historical market data — powers the market summary, symbol search, quotes, price history, and live crypto prices in your holdings list.',
    powers: ['Market summary & quotes', 'Symbol search', 'Price history', 'Live crypto prices'],
  },
};

export default function LinkedAccounts({ isDarkMode }) {
  const [view, setView] = useState('hub'); // 'hub' | 'plaid' | 'alpaca' | 'polygon'

  // ── Plaid (bank accounts) state ──────────────────────────────────────────
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkToken, setLinkToken] = useState(null);

  // ── Alpaca (brokerage) state ─────────────────────────────────────────────
  const [brokerageAccounts, setBrokerageAccounts] = useState([]);
  const [alpacaStatus, setAlpacaStatus] = useState('checking'); // checking | connected | disconnected
  const [alpacaError, setAlpacaError] = useState(null);

  // ── Polygon (market data) state ──────────────────────────────────────────
  const [benchmarks, setBenchmarks] = useState([]);
  const [polygonStatus, setPolygonStatus] = useState('checking');

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          toast.error('Please log in to view linked accounts.');
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
        toast.error('Authentication failed. Please log out and log in again.');
      } else {
        toast.error(err.message || 'Failed to load linked accounts.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAlpaca = useCallback(async () => {
    try {
      setAlpacaStatus('checking');
      setAlpacaError(null);
      const response = await getBrokerageAccounts();
      const data = Array.isArray(response) ? response : response?.data || [];
      setBrokerageAccounts(data);
      setAlpacaStatus(data.length > 0 ? 'connected' : 'disconnected');
    } catch (err) {
      console.error('Error checking brokerage connection:', err);
      setBrokerageAccounts([]);
      setAlpacaStatus('disconnected');
      setAlpacaError(err.message || 'Could not reach the brokerage service.');
    }
  }, []);

  const checkPolygon = useCallback(async () => {
    setPolygonStatus('checking');
    // getBenchmarks never throws — it returns { benchmarks: [] } on failure.
    const response = await getBenchmarks(['SPY', 'DIA', 'TSLA'], '1D');
    const data = response?.benchmarks || response?.data || [];
    setBenchmarks(Array.isArray(data) ? data : []);
    setPolygonStatus(Array.isArray(data) && data.length > 0 ? 'connected' : 'disconnected');
  }, []);

  useEffect(() => {
    fetchAccounts();
    checkAlpaca();
    checkPolygon();
  }, [fetchAccounts, checkAlpaca, checkPolygon]);

  const handleDisconnect = async (accountId) => {
    try {
      await unlinkBankAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
        setTransactions([]);
      }
      toast.success('Bank account disconnected.');
    } catch (err) {
      console.error('Error disconnecting account:', err);
      toast.error(err.message || 'Failed to disconnect account. Please try again.');
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
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          toast.error('You must be logged in to link accounts. Please log in and try again.');
          setLinkingAccount(false);
          return;
        }
      }
      const tokenResponse = await createBankLinkToken();
      const token =
        tokenResponse?.linkToken ||
        tokenResponse?.data?.linkToken ||
        tokenResponse?.link_token ||
        tokenResponse?.data?.link_token;
      if (!token) throw new Error('Failed to get link token from server');
      // Hand the token to Plaid Link — the effect below opens the widget as
      // soon as the SDK reports ready. `linkingAccount` stays true until the
      // user completes or exits the Plaid flow.
      setLinkToken(token);
      return;
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
        toast.error('Authentication failed. Please log out and log in again, then try linking your account.');
      } else if (err.status === 403) {
        toast.error('Banking integration requires an Annual subscription. Please upgrade your plan in Payment and billing.');
      } else if (err.status === 400) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      setLinkingAccount(false);
    }
  };

  // Exchange the public_token Plaid hands back for a linked account, then
  // refresh the list. POST /banking/link expects { public_token } (the util
  // snake_cases the key).
  const onPlaidSuccess = useCallback(
    async (publicToken) => {
      setLinkToken(null);
      try {
        await linkBankAccount({ publicToken });
        await fetchAccounts();
        toast.success('Bank account linked successfully.');
      } catch (err) {
        console.error('Error completing bank link:', err);
        toast.error(
          err?.data?.message ||
            err?.data?.detail ||
            err?.message ||
            'Your bank was authorized but linking could not be completed. Please try again.'
        );
      } finally {
        setLinkingAccount(false);
      }
    },
    [fetchAccounts]
  );

  const onPlaidExit = useCallback((err) => {
    setLinkToken(null);
    setLinkingAccount(false);
    if (err) {
      toast.error(
        err.display_message || err.error_message || 'Bank linking was cancelled before completion.'
      );
    }
  }, []);

  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  // Open the widget once the SDK has loaded the freshly minted token.
  useEffect(() => {
    if (linkToken && plaidReady) {
      openPlaidLink();
    }
  }, [linkToken, plaidReady, openPlaidLink]);

  const plaidStatus = loading ? 'checking' : accounts.length > 0 ? 'connected' : 'disconnected';

  const statusByProvider = {
    plaid: plaidStatus,
    alpaca: alpacaStatus,
    polygon: polygonStatus,
  };

  const statusDetail = {
    plaid:
      plaidStatus === 'connected'
        ? `${accounts.length} bank account${accounts.length === 1 ? '' : 's'} linked`
        : 'No bank accounts linked',
    alpaca:
      alpacaStatus === 'connected'
        ? `${brokerageAccounts.length} brokerage account${brokerageAccounts.length === 1 ? '' : 's'} active`
        : 'Brokerage not connected',
    polygon:
      polygonStatus === 'connected' ? 'Live market data feed active' : 'Market data unavailable',
  };

  if (view !== 'hub') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setView('hub')}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Linked Accounts
        </button>

        <ProviderHeader
          provider={PROVIDERS[view]}
          status={statusByProvider[view]}
          detail={statusDetail[view]}
          isDarkMode={isDarkMode}
        />

        {view === 'plaid' && (
          <PlaidPanel
            isDarkMode={isDarkMode}
            accounts={accounts}
            loading={loading}
            linkingAccount={linkingAccount}
            onAddAccount={handleAddAccount}
            selectedAccountId={selectedAccountId}
            loadingTransactions={loadingTransactions}
            transactions={transactions}
            transactionsError={transactionsError}
            onViewTransactions={handleViewTransactions}
            onDisconnect={handleDisconnect}
          />
        )}
        {view === 'alpaca' && (
          <AlpacaPanel
            isDarkMode={isDarkMode}
            status={alpacaStatus}
            accounts={brokerageAccounts}
            error={alpacaError}
            onConnect={checkAlpaca}
          />
        )}
        {view === 'polygon' && (
          <PolygonPanel
            isDarkMode={isDarkMode}
            status={polygonStatus}
            benchmarks={benchmarks}
            onConnect={checkPolygon}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Linked Accounts
        </h2>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Connect banking, brokerage, and market data services to power your dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {Object.entries(PROVIDERS).map(([key, provider]) => (
          <ProviderCard
            key={key}
            provider={provider}
            status={statusByProvider[key]}
            detail={statusDetail[key]}
            isDarkMode={isDarkMode}
            onOpen={() => setView(key)}
          />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'checking') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
        Checking...
      </span>
    );
  }
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Not Connected
    </span>
  );
}

function ProviderTile({ provider, size = 'w-12 h-12 text-lg' }) {
  return (
    <div className={`${size} ${provider.tile.bg} ${provider.tile.text} rounded-xl flex items-center justify-center font-bold shrink-0`}>
      {provider.tile.label}
    </div>
  );
}

function ProviderCard({ provider, status, detail, isDarkMode, onOpen }) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border flex flex-col ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <ProviderTile provider={provider} />
          <div>
            <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {provider.name}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{provider.tagline}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className={`text-sm mb-4 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {provider.description}
      </p>

      <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{detail}</p>

      <button
        onClick={onOpen}
        className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90 ${
          status === 'connected'
            ? isDarkMode
              ? 'border border-[#F1CB68] text-white hover:bg-[#F1CB68]/10'
              : 'border border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
            : isDarkMode
              ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white border border-[#FFFFFF14]'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {status === 'connected' ? 'Manage' : 'Connect'}
      </button>
    </div>
  );
}

function ProviderHeader({ provider, status, detail, isDarkMode }) {
  return (
    <div className="flex items-center gap-4">
      <ProviderTile provider={provider} size="w-14 h-14 text-xl" />
      <div>
        <div className="flex items-center gap-3">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {provider.name}
          </h2>
          <StatusBadge status={status} />
        </div>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{detail}</p>
      </div>
    </div>
  );
}

function PowersList({ provider, isDarkMode }) {
  return (
    <div className={`rounded-2xl p-5 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        What this connection powers
      </h4>
      <ul className="space-y-2">
        {provider.powers.map((item) => (
          <li key={item} className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-4 h-4 text-[#F1CB68] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Plaid detail panel ──────────────────────────────────────────────────────

function PlaidPanel({
  isDarkMode,
  accounts,
  loading,
  linkingAccount,
  onAddAccount,
  selectedAccountId,
  loadingTransactions,
  transactions,
  transactionsError,
  onViewTransactions,
  onDisconnect,
}) {
  return (
    <div className="space-y-6">
      <PowersList provider={PROVIDERS.plaid} isDarkMode={isDarkMode} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your connected banking accounts
        </p>
        <button
          onClick={onAddAccount}
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
              onClick={onAddAccount}
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
              onViewTransactions={() => onViewTransactions(account.id)}
              onDisconnect={() => onDisconnect(account.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Alpaca detail panel ─────────────────────────────────────────────────────

function AlpacaPanel({ isDarkMode, status, accounts, error, onConnect }) {
  const formatMoney = (value) =>
    value != null
      ? Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '—';

  return (
    <div className="space-y-6">
      <PowersList provider={PROVIDERS.alpaca} isDarkMode={isDarkMode} />

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {status === 'checking' ? (
        <div
          className={`rounded-2xl p-5 md:p-6 border animate-pulse ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className="space-y-2">
              <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-3 w-28 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      ) : status === 'connected' ? (
        <>
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`rounded-2xl p-5 md:p-6 border ${
                isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ProviderTile provider={PROVIDERS.alpaca} />
                  <div>
                    <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {account.name || 'Primary Trading Account'}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {account.type === 'brokerage' ? 'Brokerage' : account.type} · {account.maskedNumber || '****'}
                    </p>
                  </div>
                </div>
                <StatusBadge status="connected" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Portfolio Value</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatMoney(account.balance)}
                  </p>
                </div>
                <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Buying Power</p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatMoney(account.buyingPower)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/portfolio/trade-engine"
                  className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg font-medium text-center border transition-all ${
                    isDarkMode ? 'border-[#F1CB68] text-white hover:bg-[#F1CB68]/10' : 'border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
                  }`}
                >
                  Open Trade Engine
                </Link>
                <button
                  onClick={onConnect}
                  className={`px-4 py-2 font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Refresh Status
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div
          className={`rounded-2xl p-8 md:p-12 border text-center ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="max-w-md mx-auto">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Brokerage not connected
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your Alpaca brokerage account is provisioned automatically with your Akunuba account.
              Click connect to establish the brokerage session. If this fails repeatedly, contact support.
            </p>
            <button
              onClick={onConnect}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 ${
                isDarkMode
                  ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white border border-[#FFFFFF14]'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Polygon detail panel ────────────────────────────────────────────────────

function PolygonPanel({ isDarkMode, status, benchmarks, onConnect }) {
  return (
    <div className="space-y-6">
      <PowersList provider={PROVIDERS.polygon} isDarkMode={isDarkMode} />

      {status === 'checking' ? (
        <div
          className={`rounded-2xl p-5 md:p-6 border animate-pulse ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className="space-y-2">
              <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-3 w-28 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      ) : status === 'connected' ? (
        <div
          className={`rounded-2xl p-5 md:p-6 border ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <ProviderTile provider={PROVIDERS.polygon} />
              <div>
                <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Market Data Feed
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Live quotes via Polygon
                </p>
              </div>
            </div>
            <StatusBadge status="connected" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {benchmarks.map((benchmark) => {
              const change = benchmark.changePercentage ?? 0;
              return (
                <div key={benchmark.symbol} className={`rounded-xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {benchmark.symbol}
                  </p>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {benchmark.currentValue != null
                      ? Number(benchmark.currentValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                      : '—'}
                  </p>
                  <p className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? '+' : ''}
                    {Number(change).toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/portfolio/trade-engine"
              className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg font-medium text-center border transition-all ${
                isDarkMode ? 'border-[#F1CB68] text-white hover:bg-[#F1CB68]/10' : 'border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
              }`}
            >
              Explore Markets
            </Link>
            <button
              onClick={onConnect}
              className={`px-4 py-2 font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Refresh Status
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-2xl p-8 md:p-12 border text-center ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="max-w-md mx-auto">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Market data unavailable
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The Polygon market data feed is included with your Akunuba account.
              Click connect to check the data feed. If it stays unavailable, the service may be temporarily down.
            </p>
            <button
              onClick={onConnect}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 ${
                isDarkMode
                  ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white border border-[#FFFFFF14]'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bank account card (Plaid) ───────────────────────────────────────────────

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
