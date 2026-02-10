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
 */
export const updateSubscriptionPlan = async (plan) => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE;
  const body = transformToSnake({ plan });
  const response = await apiPut(endpoint, body);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Subscription History
 * GET /api/v1/subscriptions/history
 */
export const getSubscriptionHistory = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.HISTORY;
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

