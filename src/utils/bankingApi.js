/**
 * Banking API Service
 * Handles all banking-related API calls
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

/**
 * Transform camelCase object keys to snake_case for API
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformToSnake);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformToSnake(value);
    }
    return transformed;
  }
  return obj;
};

// ============================================================================
// BANKING INTEGRATION APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Plaid Link Token
 * POST /api/v1/banking/link-token
 */
export const createBankLinkToken = async () => {
  const endpoint = API_ENDPOINTS.BANKING.LINK_TOKEN;
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Link Bank Account (Plaid)
 * POST /api/v1/banking/link
 */
export const linkBankAccount = async (linkData) => {
  const transformedData = transformToSnake(linkData);
  const endpoint = API_ENDPOINTS.BANKING.LINK;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Linked Bank Accounts
 * GET /api/v1/banking/accounts
 */
export const getBankAccounts = async () => {
  const endpoint = API_ENDPOINTS.BANKING.LIST_ACCOUNTS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Linked Account Details
 * GET /api/v1/banking/accounts/{account_id}
 */
export const getBankAccount = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.GET_ACCOUNT(accountId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Unlink Bank Account
 * DELETE /api/v1/banking/accounts/{account_id}
 */
export const unlinkBankAccount = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.DELETE_ACCOUNT(accountId);
  return await apiDelete(endpoint);
};

/**
 * Get Account Transactions
 * GET /api/v1/banking/accounts/{account_id}/transactions
 */
export const getBankTransactions = async (accountId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.BANKING.GET_TRANSACTIONS(accountId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Refresh Account Balance
 * POST /api/v1/banking/accounts/{account_id}/refresh
 */
export const refreshBankAccount = async (accountId) => {
  // Endpoint documented in PREFERENCES_TAB_APIS.md; call directly
  const endpoint = `/banking/accounts/${accountId}/refresh`;
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Sync Account Transactions (last 30 days)
 * POST /api/v1/banking/sync/{account_id}
 */
export const syncBankTransactions = async (accountId) => {
  // Endpoint documented in PREFERENCES_TAB_APIS.md; call directly
  const endpoint = `/banking/sync/${accountId}`;
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Account Balance
 * GET /api/v1/banking/accounts/{account_id}/balance
 */
export const getBankBalance = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.GET_BALANCE(accountId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
