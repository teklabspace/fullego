/**
 * Analytics API Service
 * Handles all analytics-related API calls
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
// ANALYTICS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Get Portfolio Analytics
 * GET /api/v1/analytics/portfolio
 */
export const getPortfolioAnalytics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  if (params.groupBy) queryParams.append('group_by', params.groupBy);
  
  const endpoint = `${API_ENDPOINTS.ANALYTICS.PORTFOLIO}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Performance Analytics
 * GET /api/v1/analytics/performance
 */
export const getPerformanceAnalytics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.period) queryParams.append('period', params.period);
  if (params.compareWith) queryParams.append('compare_with', params.compareWith);
  
  const endpoint = `${API_ENDPOINTS.ANALYTICS.PERFORMANCE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Risk Analytics
 * GET /api/v1/analytics/risk
 */
export const getRiskAnalytics = async () => {
  const endpoint = API_ENDPOINTS.ANALYTICS.RISK;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
