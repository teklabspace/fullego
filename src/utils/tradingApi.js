/**
 * Trading API Service
 * Handles all trading-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet } from '@/lib/api/client';

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
// TRADING APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Get Alpaca Account Information
 * GET /api/v1/trading/account
 */
export const getTradingAccount = async () => {
  const endpoint = API_ENDPOINTS.TRADING.ACCOUNT;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Alpaca Assets/Positions
 * GET /api/v1/trading/assets
 */
export const getTradingAssets = async () => {
  const endpoint = API_ENDPOINTS.TRADING.ASSETS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Alpaca Transaction History
 * GET /api/v1/trading/transactions
 */
export const getTradingTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.TRADING.TRANSACTIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
