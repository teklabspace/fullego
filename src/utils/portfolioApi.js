/**
 * Portfolio API Service
 * Handles all portfolio-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiDelete } from '@/lib/api/client';

/**
 * Transform snake_case object keys to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
const transformKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(value);
    }
    return transformed;
  }
  return obj;
};

// ============================================================================
// PORTFOLIO OVERVIEW APIs
// ============================================================================

/**
 * Get Portfolio Summary
 * GET /api/v1/portfolio/summary
 */
// Envelope-tolerant normalizer. The API client already unwraps the outer
// {success, status_code, message, data} envelope; some portfolio routes nest
// ANOTHER {data: ...}, others return the payload flat and snake_case — so
// `response.data` was often undefined and transformKeys never ran (pages then
// rendered $0.00 despite a 200 with real numbers). Callers read both
// `res.data` and top-level fields, so serve the camelized payload both ways.
const normalizePayload = (response) => {
  const payload = transformKeys(response?.data ?? response ?? {});
  if (Array.isArray(payload)) return { data: payload };
  return { ...payload, data: payload };
};

export const getPortfolioSummary = async (timeRange = 'ALL') => {
  const queryParams = timeRange !== 'ALL' ? `?time_range=${timeRange}` : '';
  const endpoint = `/portfolio/summary${queryParams}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Portfolio Performance
 * GET /api/v1/portfolio/performance
 */
export const getPortfolioPerformance = async (days = 30) => {
  const endpoint = `/portfolio/performance?days=${days}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Asset Allocation
 * GET /api/v1/portfolio/allocation
 */
export const getAssetAllocation = async () => {
  const endpoint = `/portfolio/allocation`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Top Holdings
 * GET /api/v1/portfolio/holdings/top
 */
export const getTopHoldings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  
  const endpoint = `/portfolio/holdings/top${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Recent Activity
 * GET /api/v1/portfolio/activity/recent
 */
export const getRecentActivity = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.type && params.type !== 'all') queryParams.append('type', params.type);
  
  const endpoint = `/portfolio/activity/recent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Market Summary
 * GET /api/v1/portfolio/market-summary
 */
export const getMarketSummary = async () => {
  const endpoint = `/portfolio/market-summary`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Portfolio Alerts
 * GET /api/v1/portfolio/alerts
 */
export const getPortfolioAlerts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `/portfolio/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Complete Portfolio
 * GET /api/v1/portfolio
 */
export const getPortfolio = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.includePerformance) queryParams.append('include_performance', params.includePerformance);
  if (params.includeRisk) queryParams.append('include_risk', params.includeRisk);
  
  const endpoint = `/portfolio${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Historical Portfolio Values
 * GET /api/v1/portfolio/history
 */
export const getPortfolioHistory = async (days = 30) => {
  const endpoint = `/portfolio/history?days=${days}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Portfolio Risk Metrics
 * GET /api/v1/portfolio/risk
 */
export const getPortfolioRisk = async () => {
  const endpoint = `/portfolio/risk`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Compare Portfolio Performance with Benchmark
 * GET /api/v1/portfolio/benchmark
 */
export const getPortfolioBenchmark = async (benchmarkValue) => {
  const endpoint = `/portfolio/benchmark?benchmark_value=${benchmarkValue}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// CRYPTO PORTFOLIO APIs
// ============================================================================

/**
 * Get Crypto Portfolio Summary
 * GET /api/v1/portfolio/crypto/summary
 */
export const getCryptoPortfolioSummary = async () => {
  const response = await apiGet(API_ENDPOINTS.PORTFOLIO.CRYPTO_SUMMARY);
  return normalizePayload(response);
};

/**
 * Valid `time_range` values accepted by GET /portfolio/crypto/performance.
 * An unrecognised value used to fall back to 30 days with a 200; the backend
 * now rejects it with 400 INVALID_TIME_RANGE, so keep this list in sync with
 * the dropdown that feeds it.
 */
export const CRYPTO_TIME_RANGES = ['1h', '6h', '12h', '24h', '7d', '30d', '1y'];

/**
 * Get Crypto Performance Data
 * GET /api/v1/portfolio/crypto/performance
 *
 * Either a preset `timeRange` OR an explicit start/end pair — `start_date` and
 * `end_date` override `time_range` server-side, so we send one or the other
 * rather than both. Both dates are required together and start must precede
 * end, otherwise the backend answers 400 INVALID_TIME_RANGE.
 *
 * @param {string} timeRange one of CRYPTO_TIME_RANGES
 * @param {string} metric value-over-time | return-rate | risk-exposure
 * @param {{startDate: string, endDate: string}} [dateRange] ISO-8601 UTC pair
 */
export const getCryptoPerformance = async (timeRange, metric, dateRange = null) => {
  const queryParams = new URLSearchParams();
  queryParams.append('metric', metric);

  if (dateRange?.startDate && dateRange?.endDate) {
    queryParams.append('start_date', dateRange.startDate);
    queryParams.append('end_date', dateRange.endDate);
  } else {
    queryParams.append('time_range', timeRange);
  }

  const endpoint = `${API_ENDPOINTS.PORTFOLIO.CRYPTO_PERFORMANCE}?${queryParams.toString()}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Crypto Portfolio Breakdown
 * GET /api/v1/portfolio/crypto/breakdown
 */
export const getCryptoBreakdown = async (groupBy) => {
  const endpoint = `${API_ENDPOINTS.PORTFOLIO.CRYPTO_BREAKDOWN}?group_by=${groupBy}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Crypto Holdings
 * GET /api/v1/portfolio/crypto/holdings
 */
export const getCryptoHoldings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.order) queryParams.append('order', params.order);

  const endpoint = `${API_ENDPOINTS.PORTFOLIO.CRYPTO_HOLDINGS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

// ============================================================================
// CRYPTO PORTFOLIO SHARING APIs
// ============================================================================

/**
 * Create a shareable crypto portfolio link
 * POST /api/v1/portfolio/crypto/share
 *
 * @param {object} options
 * @param {number|null} [options.expiresInDays] 1-365; null = never expires
 * @param {string|null} [options.email] optional recipient; null = link only
 * @param {string} [options.timeRange] preset window for the snapshot
 * @param {string} [options.startDate] ISO-8601, use with endDate instead of timeRange
 * @param {string} [options.endDate]
 * @returns {Promise<{id: string, shareLink: string, accessCode: string}>}
 */
export const createCryptoShare = async (options = {}) => {
  const body = {
    expires_in_days: options.expiresInDays ?? null,
    email: options.email ?? null,
  };

  if (options.startDate && options.endDate) {
    body.start_date = options.startDate;
    body.end_date = options.endDate;
  } else {
    body.time_range = options.timeRange || '30d';
  }

  const response = await apiPost(API_ENDPOINTS.PORTFOLIO.CRYPTO_SHARE, body);
  return normalizePayload(response);
};

/**
 * List active crypto portfolio share links
 * GET /api/v1/portfolio/crypto/share
 */
export const listCryptoShares = async () => {
  const response = await apiGet(API_ENDPOINTS.PORTFOLIO.CRYPTO_SHARE_LIST);
  return normalizePayload(response);
};

/**
 * Revoke a crypto portfolio share link
 * DELETE /api/v1/portfolio/crypto/share/{id}
 */
export const revokeCryptoShare = async (shareId) => {
  const response = await apiDelete(
    API_ENDPOINTS.PORTFOLIO.CRYPTO_SHARE_REVOKE(shareId)
  );
  return normalizePayload(response);
};

/**
 * Resolve a shared crypto portfolio anonymously.
 * GET /api/v1/portfolio/crypto/shared?code={accessCode}
 *
 * No login and no KYC — the access code IS the credential, so the request must
 * go out WITHOUT a Bearer token. A stale token from a dead session would
 * otherwise turn a public 200 into a 401 (the bug that bit shared asset links).
 *
 * Contract: valid -> 200, unknown/revoked -> 404, expired -> 410
 * SHARE_LINK_EXPIRED.
 */
export const getSharedCryptoPortfolio = async (accessCode) => {
  const endpoint = `${API_ENDPOINTS.PORTFOLIO.CRYPTO_SHARED}?code=${encodeURIComponent(accessCode)}`;
  const response = await apiGet(endpoint, { auth: false });
  return normalizePayload(response);
};

// ============================================================================
// CASH FLOW APIs
// ============================================================================

/**
 * Get Cash Flow Summary
 * GET /api/v1/portfolio/cash-flow/summary
 */
export const getCashFlowSummary = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', params.period);
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  
  const endpoint = `/portfolio/cash-flow/summary?${queryParams.toString()}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Cash Flow Trends
 * GET /api/v1/portfolio/cash-flow/trends
 */
export const getCashFlowTrends = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', params.period);
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.granularity) queryParams.append('granularity', params.granularity);
  
  const endpoint = `/portfolio/cash-flow/trends?${queryParams.toString()}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Cash Flow Transactions
 * GET /api/v1/portfolio/cash-flow/transactions
 */
export const getCashFlowTransactions = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', params.period);
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.type && params.type !== 'all') queryParams.append('type', params.type);
  if (params.category) queryParams.append('category', params.category);
  if (params.minAmount) queryParams.append('min_amount', params.minAmount);
  if (params.maxAmount) queryParams.append('max_amount', params.maxAmount);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `/portfolio/cash-flow/transactions?${queryParams.toString()}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.pagination) {
    response.pagination = transformKeys(response.pagination);
  }
  
  return response;
};

/**
 * Get Cash Flow Accounts
 * GET /api/v1/portfolio/cash-flow/accounts
 */
export const getCashFlowAccounts = async () => {
  const endpoint = `/portfolio/cash-flow/accounts`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Create Transfer
 * POST /api/v1/portfolio/cash-flow/transfers
 * 
 * @param {Object} transferData - Transfer data
 * @param {string} transferData.transferType - Transfer type: 'internal' or 'external'
 * @param {string} transferData.fromAccountId - Source account ID
 * @param {string} transferData.toAccountId - Destination account ID (for internal transfers)
 * @param {string} transferData.walletAddress - Wallet address (for external transfers)
 * @param {number} transferData.amount - Transfer amount
 * @param {string} transferData.transferDate - Transfer date in YYYY-MM-DD format
 * @param {string} transferData.frequency - Frequency: 'one-time' or 'recurring'
 * @param {string} transferData.description - Transfer description
 */
export const createTransfer = async (transferData) => {
  // Transform camelCase to snake_case for API
  // Handle both camelCase and snake_case input
  const transformedData = {
    transfer_type: transferData.transferType || transferData.transfer_type,
    from_account_id: transferData.fromAccountId || transferData.from_account_id,
    to_account_id: transferData.toAccountId || transferData.to_account_id,
    wallet_address: transferData.walletAddress || transferData.wallet_address,
    amount: transferData.amount,
    transfer_date: transferData.transferDate || transferData.transfer_date,
    frequency: transferData.frequency,
    description: transferData.description
  };
  
  const endpoint = `/portfolio/cash-flow/transfers`;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.transfer) {
    response.transfer = transformKeys(response.transfer);
  }
  
  return response;
};

/**
 * Get Transfer Status
 * GET /api/v1/portfolio/cash-flow/transfers/{transfer_id}
 */
export const getTransferStatus = async (transferId) => {
  const endpoint = `/portfolio/cash-flow/transfers/${transferId}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// TRADE ENGINE APIs
// ============================================================================

/**
 * Search Assets
 * GET /api/v1/portfolio/trade-engine/search
 */
export const searchAssets = async (params) => {
  const queryParams = new URLSearchParams();
  queryParams.append('query', params.query);
  if (params.assetClass) queryParams.append('asset_class', params.assetClass);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `/portfolio/trade-engine/search?${queryParams.toString()}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Asset Details for Trading
 * GET /api/v1/portfolio/trade-engine/assets/{symbol}
 * Note: Backend may expect asset ID instead of symbol. If 404, try searching first.
 */
export const getAssetDetails = async (symbol) => {
  // A 404 here can mean the endpoint wanted an asset ID rather than a symbol —
  // the error propagates so the caller can decide to search first.
  const response = await apiGet(API_ENDPOINTS.TRADE_ENGINE.GET_ASSET(symbol));
  return normalizePayload(response);
};

/**
 * Get Recent Trades
 * GET /api/v1/portfolio/trade-engine/recent-trades
 */
export const getRecentTrades = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.symbol) queryParams.append('symbol', params.symbol);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `/portfolio/trade-engine/recent-trades${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Trading History for Asset
 * GET /api/v1/portfolio/trade-engine/assets/{symbol}/history
 */
export const getTradingHistory = async (symbol) => {
  const endpoint = `/portfolio/trade-engine/assets/${symbol}/history`;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Asset Price History (daily candles for the chart)
 * GET /api/v1/portfolio/trade-engine/assets/{symbol}/price-history?range=1M
 */
export const getAssetPriceHistory = async (symbol, range = '1M') => {
  const endpoint = `/portfolio/trade-engine/assets/${symbol}/price-history?range=${encodeURIComponent(range)}`;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Brokerage Accounts
 * GET /api/v1/portfolio/trade-engine/accounts
 */
export const getBrokerageAccounts = async () => {
  const response = await apiGet(API_ENDPOINTS.TRADE_ENGINE.ACCOUNTS);
  return normalizePayload(response);
};

/**
 * Place Order
 * POST /api/v1/portfolio/trade-engine/orders
 *
 * Buy orders are funds-checked against the per-user cash ledger and fail with
 * 400 INSUFFICIENT_FUNDS when the balance can't cover them. The response now
 * carries the post-trade cash balance, so callers don't need a follow-up
 * getTradingCash() to refresh what they display.
 */
export const placeOrder = async (orderData) => {
  // Transform camelCase to snake_case for API
  const transformedData = {};
  for (const [key, value] of Object.entries(orderData)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    transformedData[snakeKey] = value;
  }

  const response = await apiPost(API_ENDPOINTS.TRADE_ENGINE.PLACE_ORDER, transformedData);
  return normalizePayload(response);
};

/**
 * Get Order Status
 * GET /api/v1/portfolio/trade-engine/orders/{order_id}
 */
export const getOrderStatus = async (orderId) => {
  const response = await apiGet(API_ENDPOINTS.TRADE_ENGINE.GET_ORDER(orderId));
  return normalizePayload(response);
};

/**
 * Cancel Order
 * DELETE /api/v1/portfolio/trade-engine/orders/{order_id}
 */
export const cancelOrder = async (orderId) => {
  const response = await apiDelete(API_ENDPOINTS.TRADE_ENGINE.CANCEL_ORDER(orderId));
  return normalizePayload(response);
};

// ============================================================================
// TRADING CASH LEDGER APIs
// ============================================================================

/**
 * Get Trading Cash Balance + Ledger
 * GET /api/v1/portfolio/trade-engine/cash?limit=20
 *
 * @returns {Promise<{cashBalance: number, currency: string, transactions: Array}>}
 */
export const getTradingCash = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);

  const endpoint = `${API_ENDPOINTS.TRADE_ENGINE.CASH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Deposit Cash from a linked bank account
 * POST /api/v1/portfolio/trade-engine/cash/deposit
 *
 * @param {{linkedAccountId: string, amount: number}} depositData
 * @returns {Promise<{cashBalance, sourceAccountBalance, amount, currency}>}
 * @throws 400 INSUFFICIENT_FUNDS when the source account can't cover it,
 *         404 when the linked account id isn't the caller's
 */
export const depositTradingCash = async ({ linkedAccountId, amount }) => {
  const response = await apiPost(API_ENDPOINTS.TRADE_ENGINE.CASH_DEPOSIT, {
    linked_account_id: linkedAccountId,
    amount,
  });
  return normalizePayload(response);
};

/**
 * Withdraw Cash back to a linked bank account
 * POST /api/v1/portfolio/trade-engine/cash/withdraw
 *
 * Same request/response shape as depositTradingCash, reverse direction.
 */
export const withdrawTradingCash = async ({ linkedAccountId, amount }) => {
  const response = await apiPost(API_ENDPOINTS.TRADE_ENGINE.CASH_WITHDRAW, {
    linked_account_id: linkedAccountId,
    amount,
  });
  return normalizePayload(response);
};

/**
 * Batch Quotes for search rows
 * GET /api/v1/portfolio/trade-engine/quotes?symbols=AAPL,MSFT,BTCUSD
 *
 * New-style single wrap: payload is { quotes: { SYMBOL: {price, change,
 * change_percentage} } }. A symbol may come back { price: null } when the
 * per-call fresh-lookup budget ran out — re-request those after ~2s.
 * Max 20 symbols per call; crypto pairs plain (no X: prefix).
 *
 * @param {string[]} symbols
 * @returns {Object} map of SYMBOL -> { price, change, changePercentage }
 */
export const getBatchQuotes = async (symbols) => {
  const list = (symbols || []).filter(Boolean).slice(0, 20);
  if (!list.length) return {};

  const endpoint = `/portfolio/trade-engine/quotes?symbols=${encodeURIComponent(list.join(','))}`;
  const response = await apiGet(endpoint);
  const quotes = response?.quotes || {};

  // Camelize each quote's keys but keep the symbol keys untouched.
  const result = {};
  for (const [symbol, quote] of Object.entries(quotes)) {
    result[symbol] = transformKeys(quote);
  }
  return result;
};

// ============================================================================
// COMMON/SHARED APIs
// ============================================================================

/**
 * Get User Accounts
 * GET /api/v1/accounts
 */
export const getUserAccounts = async (type = 'all') => {
  const endpoint = `/accounts${type !== 'all' ? `?type=${type}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
