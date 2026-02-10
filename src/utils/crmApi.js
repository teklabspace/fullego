/**
 * CRM Dashboard API Service
 * Handles all CRM dashboard-related API calls
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

/**
 * Get CRM Users
 * GET /api/v1/crm/users
 */
export const getCrmUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.role) queryParams.append('role', params.role);
  if (params.team) queryParams.append('team', params.team);

  const endpoint = `${API_ENDPOINTS.CRM.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get CRM Dashboard Overview Statistics
 * GET /api/v1/crm/dashboard/overview
 */
export const getDashboardOverview = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.dateRangeStart) queryParams.append('date_range_start', params.dateRangeStart);
  if (params.dateRangeEnd) queryParams.append('date_range_end', params.dateRangeEnd);

  const endpoint = `${API_ENDPOINTS.CRM.DASHBOARD_OVERVIEW}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Task Updates/Activity Feed
 * GET /api/v1/crm/updates
 */
export const getCrmUpdates = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = `${API_ENDPOINTS.CRM.UPDATES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    // If endpoint returns 403/401, return empty array instead of throwing
    // This allows the dashboard to load even if updates endpoint is not accessible
    if (error.status === 403 || error.status === 401) {
      console.warn('CRM updates endpoint not accessible, returning empty updates');
      return { data: [], message: 'Updates not available' };
    }
    // Re-throw other errors
    throw error;
  }
};
