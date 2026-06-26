/**
 * Subscriptions API Service
 * Handles all subscription and billing-related API calls for the Preferences tab
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut } from '@/lib/api/client';

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
// SUBSCRIPTION APIs (from PREFERENCES_TAB_APIS.md)
// ============================================================================

/**
 * Get Available Plans
 * GET /api/v1/subscriptions/plans
 */
export const getAvailablePlans = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.GET_PLANS;
  const response = await apiGet(endpoint);

  if (response.plans) {
    response.plans = transformKeys(response.plans);
  }
  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Current Subscription
 * GET /api/v1/subscriptions
 */
export const getCurrentSubscription = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.GET_CURRENT;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Create Subscription
 * POST /api/v1/subscriptions
 */
export const createSubscription = async (subscriptionData) => {
  const transformedData = transformToSnake(subscriptionData);
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.CREATE;
  const response = await apiPost(endpoint, transformedData);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Cancel Subscription
 * POST /api/v1/subscriptions/cancel
 */
export const cancelSubscription = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.CANCEL;
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Renew Subscription
 * POST /api/v1/subscriptions/renew
 */
export const renewSubscription = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.RENEW;
  const response = await apiPost(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Upgrade/Downgrade Subscription
 * PUT /api/v1/subscriptions/upgrade
 * 
 * @param {Object} updateData - Update data
 * @param {string} updateData.planId - New plan ID (optional)
 * @param {string} updateData.billingCycle - New billing cycle: 'monthly' or 'annual' (optional)
 */
export const updateSubscriptionPlan = async (updateData) => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE;
  const body = {
    plan_id: updateData.planId,
    billing_cycle: updateData.billingCycle,
  };
  const response = await apiPut(endpoint, body);

  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.subscription) {
    response.subscription = transformKeys(response.subscription);
  }

  return response;
};

/**
 * Get Subscription History
 * GET /api/v1/subscriptions/history
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of records (default: 20, max: 100)
 * @param {number} params.offset - Pagination offset (default: 0)
 */
export const getSubscriptionHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
  
  const endpoint = `${API_ENDPOINTS.SUBSCRIPTIONS.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Subscription Permissions
 * GET /api/v1/subscriptions/permissions
 */
export const getSubscriptionPermissions = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.PERMISSIONS;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Usage Limits
 * GET /api/v1/subscriptions/limits
 */
export const getSubscriptionLimits = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.LIMITS;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

