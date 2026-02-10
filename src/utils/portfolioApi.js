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
export const getPortfolioSummary = async (timeRange = 'ALL') => {
  const queryParams = timeRange !== 'ALL' ? `?time_range=${timeRange}` : '';
  const endpoint = `/portfolio/summary${queryParams}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Portfolio Performance
 * GET /api/v1/portfolio/performance
 */
export const getPortfolioPerformance = async (days = 30) => {
  const endpoint = `/portfolio/performance?days=${days}`;
  const response = await apiGet(endpoint);
  
  if (response.daily_returns) {
    response.daily_returns = transformKeys(response.daily_returns);
  }
  if (response.best_performer) {
    response.best_performer = transformKeys(response.best_performer);
  }
  if (response.worst_performer) {
    response.worst_performer = transformKeys(response.worst_performer);
  }
  
  return response;
};

/**
 * Get Asset Allocation
 * GET /api/v1/portfolio/allocation
 */
export const getAssetAllocation = async () => {
  const endpoint = `/portfolio/allocation`;
  const response = await apiGet(endpoint);
  
  if (Array.isArray(response)) {
    return { data: response.map(transformKeys) };
  }
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Market Summary
 * GET /api/v1/portfolio/market-summary
 */
export const getMarketSummary = async () => {
  const endpoint = `/portfolio/market-summary`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
  const endpoint = `/portfolio/crypto/summary`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Crypto Performance Data
 * GET /api/v1/portfolio/crypto/performance
 */
export const getCryptoPerformance = async (timeRange, metric) => {
  const endpoint = `/portfolio/crypto/performance?time_range=${timeRange}&metric=${metric}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Crypto Portfolio Breakdown
 * GET /api/v1/portfolio/crypto/breakdown
 */
export const getCryptoBreakdown = async (groupBy) => {
  const endpoint = `/portfolio/crypto/breakdown?group_by=${groupBy}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Crypto Holdings
 * GET /api/v1/portfolio/crypto/holdings
 */
export const getCryptoHoldings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  
  const endpoint = `/portfolio/crypto/holdings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
 */
export const createTransfer = async (transferData) => {
  // Transform camelCase to snake_case for API
  const transformedData = {};
  for (const [key, value] of Object.entries(transferData)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    transformedData[snakeKey] = value;
  }
  
  const endpoint = `/portfolio/cash-flow/transfers`;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
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
  // Try using symbol as path parameter first
  const endpoint = `/portfolio/trade-engine/assets/${symbol}`;
  
  try {
    const response = await apiGet(endpoint);
    
    if (response.data) {
      response.data = transformKeys(response.data);
    }
    
    return response;
  } catch (error) {
    // If 404, the endpoint might expect an asset ID or use query parameter
    // For now, re-throw the error so the caller can handle it
    throw error;
  }
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
 * Get Brokerage Accounts
 * GET /api/v1/portfolio/trade-engine/accounts
 */
export const getBrokerageAccounts = async () => {
  const endpoint = `/portfolio/trade-engine/accounts`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Place Order
 * POST /api/v1/portfolio/trade-engine/orders
 */
export const placeOrder = async (orderData) => {
  // Transform camelCase to snake_case for API
  const transformedData = {};
  for (const [key, value] of Object.entries(orderData)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    transformedData[snakeKey] = value;
  }
  
  const endpoint = `/portfolio/trade-engine/orders`;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Order Status
 * GET /api/v1/portfolio/trade-engine/orders/{order_id}
 */
export const getOrderStatus = async (orderId) => {
  const endpoint = `/portfolio/trade-engine/orders/${orderId}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Cancel Order
 * DELETE /api/v1/portfolio/trade-engine/orders/{order_id}
 */
export const cancelOrder = async (orderId) => {
  const endpoint = `/portfolio/trade-engine/orders/${orderId}`;
  const response = await apiDelete(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
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
