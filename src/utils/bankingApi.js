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
// LINKED ACCOUNTS APIs (from LINKED_ACCOUNTS_NEXTJS_GUIDE.md)
// All 8 endpoints are implemented and integrated
// ============================================================================

/**
 * 1. Create Plaid Link Token
 * POST /api/v1/banking/link-token
 * 
 * Response: { link_token: "link-sandbox-xxx" }
 * 
 * Note: Backend expects empty body (no body sent)
 */
export const createBankLinkToken = async () => {
  const endpoint = API_ENDPOINTS.BANKING.LINK_TOKEN;

  // Use apiPost with null/undefined to avoid sending empty JSON object
  // apiPost will handle this and not stringify undefined
  const response = await apiPost(endpoint, undefined);

  // The token arrives as a top-level { link_token: "..." } (the documented shape)
  // or nested under { data: { link_token } }. Transform the WHOLE response so every
  // snake_case key becomes camelCase (link_token -> linkToken). Previously only
  // response.data was transformed, so a top-level link_token was never normalised
  // and the caller threw "Failed to get link token from server".
  return transformKeys(response);
};

/**
 * 2. Link Bank Account
 * POST /api/v1/banking/link
 * 
 * @param {Object} linkData - Link data object
 * @param {string} linkData.public_token - Plaid public token (required)
 * 
 * Response: { message: "2 account(s) linked successfully" }
 * Error Responses:
 * - 403 Forbidden: "Banking integration requires Annual subscription"
 * - 400 Bad Request: "Failed to link account" or "No accounts found"
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
 * 3. Get All Linked Accounts
 * GET /api/v1/banking/accounts
 * 
 * Response: Array of LinkedAccount objects
 * [
 *   {
 *     id: "uuid",
 *     institution_name: "Chase Bank",
 *     account_name: "Checking Account",
 *     account_type: "banking",
 *     balance: 5000.00,
 *     currency: "USD"
 *   }
 * ]
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
 * 4. Get Linked Account Details
 * GET /api/v1/banking/accounts/{linked_account_id}
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 * 
 * Response: LinkedAccountDetails object with full account information
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
 * 5. Refresh Account Balance
 * POST /api/v1/banking/accounts/{linked_account_id}/refresh
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 * 
 * Response: {
 *   message: "Account balance refreshed successfully",
 *   balance: 5200.00,
 *   currency: "USD"
 * }
 */
export const refreshBankAccount = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.REFRESH_BALANCE(accountId);
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * 6. Sync Transactions
 * POST /api/v1/banking/sync/{linked_account_id}
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 * 
 * Response: { message: "Synced 15 new transactions" }
 */
export const syncBankTransactions = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.SYNC_TRANSACTIONS(accountId);
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * 7. Get Account Transactions
 * GET /api/v1/banking/accounts/{linked_account_id}/transactions
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD, optional)
 * @param {string} params.end_date - End date (YYYY-MM-DD, optional)
 * @param {number} params.limit - Limit (1-500, default: 50, optional)
 * 
 * Response: {
 *   transactions: [...],
 *   count: 15
 * }
 */
export const getBankTransactions = async (accountId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const endpoint = `${API_ENDPOINTS.BANKING.GET_TRANSACTIONS(accountId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 8. Disconnect Account
 * DELETE /api/v1/banking/accounts/{linked_account_id}
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 * 
 * Response: { message: "Account disconnected successfully" }
 */
export const unlinkBankAccount = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.DELETE_ACCOUNT(accountId);
  return await apiDelete(endpoint);
};

/**
 * Get Account Balance (Additional endpoint)
 * GET /api/v1/banking/accounts/{account_id}/balance
 * 
 * @param {string} accountId - Linked account ID (UUID, required)
 */
export const getBankBalance = async (accountId) => {
  const endpoint = API_ENDPOINTS.BANKING.GET_BALANCE(accountId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
