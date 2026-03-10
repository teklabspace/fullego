/**
 * Referrals API Service
 * Handles all referral-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost } from '@/lib/api/client';

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
// REFERRALS APIs
// ============================================================================

/**
 * Get Referral Statistics
 * GET /api/v1/referrals
 */
export const getReferralStats = async () => {
  const endpoint = API_ENDPOINTS.REFERRALS.BASE;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Referral List
 * GET /api/v1/referrals/list
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.statusFilter - Optional: Filter by status ('pending', 'completed', 'cancelled')
 * @param {number} params.page - Optional: Page number (default: 1)
 * @param {number} params.limit - Optional: Items per page (default: 20, max: 100)
 */
export const getReferralList = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const endpoint = `${API_ENDPOINTS.REFERRALS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
 * Get Referral Code
 * GET /api/v1/referrals/code
 */
export const getReferralCode = async () => {
  const endpoint = API_ENDPOINTS.REFERRALS.CODE;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Generate Referral Code
 * POST /api/v1/referrals/generate-code
 */
export const generateReferralCode = async () => {
  const endpoint = API_ENDPOINTS.REFERRALS.GENERATE_CODE;
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Referral Rewards
 * GET /api/v1/referrals/rewards
 */
export const getReferralRewards = async () => {
  const endpoint = API_ENDPOINTS.REFERRALS.REWARDS;
  const response = await apiGet(endpoint);
  
  // Handle both array and object responses
  if (Array.isArray(response)) {
    return { data: response.map(transformKeys) };
  }
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Referral Leaderboard
 * GET /api/v1/referrals/leaderboard
 * 
 * @param {number} limit - Optional: Number of top referrers to return (default: 10, max: 100)
 */
export const getReferralLeaderboard = async (limit = 10) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  
  const endpoint = `${API_ENDPOINTS.REFERRALS.LEADERBOARD}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  // Handle both array and object responses
  if (Array.isArray(response)) {
    return { data: response.map(transformKeys) };
  }
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
