/**
 * Accounts API Service
 * Handles all account-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';

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
// ACCOUNT MANAGEMENT APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Account
 * POST /api/v1/accounts
 */
export const createAccount = async (accountData) => {
  const transformedData = transformToSnake(accountData);
  const endpoint = API_ENDPOINTS.ACCOUNTS.CREATE;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Current User's Account
 * GET /api/v1/accounts/me
 */
export const getMyAccount = async () => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.GET_ME;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Account Information
 * PUT /api/v1/accounts/me
 */
export const updateMyAccount = async (accountData) => {
  const transformedData = transformToSnake(accountData);
  const endpoint = API_ENDPOINTS.ACCOUNTS.UPDATE_ME;
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Delete Account (Soft Delete)
 * DELETE /api/v1/accounts/me
 */
export const deleteMyAccount = async () => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.DELETE_ME;
  return await apiDelete(endpoint);
};

/**
 * Get All User Accounts
 * GET /api/v1/accounts
 */
export const getAccounts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.append('type', params.type);
  
  const endpoint = `${API_ENDPOINTS.ACCOUNTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Verify Account (Requires KYC Approval)
 * POST /api/v1/accounts/verify
 */
export const verifyAccount = async (verificationData) => {
  const transformedData = transformToSnake(verificationData);
  const endpoint = API_ENDPOINTS.ACCOUNTS.VERIFY;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Account Statistics
 * GET /api/v1/accounts/stats
 */
export const getAccountStats = async () => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.STATS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Account Settings
 * GET /api/v1/accounts/settings
 */
export const getAccountSettings = async () => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.SETTINGS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Account Settings
 * PUT /api/v1/accounts/settings
 */
export const updateAccountSettings = async (settingsData) => {
  const transformedData = transformToSnake(settingsData);
  const endpoint = API_ENDPOINTS.ACCOUNTS.UPDATE_SETTINGS;
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// JOINT ACCOUNTS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Get Joint Account Users
 * GET /api/v1/accounts/joint-users
 */
export const getJointUsers = async () => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.JOINT_USERS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Invite User to Join as Joint Account Holder
 * POST /api/v1/accounts/joint-users/invite
 */
export const inviteJointUser = async (invitationData) => {
  const transformedData = transformToSnake(invitationData);
  const endpoint = API_ENDPOINTS.ACCOUNTS.INVITE_JOINT_USER;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Accept Joint Account Invitation
 * POST /api/v1/accounts/joint-users/accept-invitation
 */
export const acceptJointInvitation = async (token) => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.ACCEPT_JOINT_INVITATION;
  const response = await apiPost(endpoint, { token });
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Remove Joint User from Account
 * DELETE /api/v1/accounts/joint-users/{user_id}
 */
export const removeJointUser = async (userId) => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.REMOVE_JOINT_USER(userId);
  return await apiDelete(endpoint);
};

// ============================================================================
// ADMIN ACCOUNT MANAGEMENT APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Suspend Account (Admin Only)
 * POST /api/v1/accounts/admin/{account_id}/suspend
 */
export const suspendAccount = async (accountId, reason) => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.SUSPEND_ACCOUNT(accountId);
  const response = await apiPost(endpoint, { reason });
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Activate Account (Admin Only)
 * POST /api/v1/accounts/admin/{account_id}/activate
 */
export const activateAccount = async (accountId) => {
  const endpoint = API_ENDPOINTS.ACCOUNTS.ACTIVATE_ACCOUNT(accountId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
