/**
 * Market API Service
 * Handles market benchmark-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet } from '@/lib/api/client';

/**
 * Transform snake_case keys to camelCase
 * @param {Object} obj - Object to transform
 * @returns {Object} Transformed object
 */
const transformKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (typeof obj !== 'object') return obj;
  
  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = typeof value === 'object' ? transformKeys(value) : value;
  }
  return transformed;
};

/**
 * Get market benchmark data
 * @param {Array<string>|string} benchmarks - Array of benchmark symbols or comma-separated string (e.g., ['SPY', 'DIA', 'TSLA'] or 'SPY,DIA,TSLA')
 * @param {string} timeRange - Time range: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' (default: '1Y')
 * @returns {Promise<Object>} Benchmarks data with historical data
 */
export const getBenchmarks = async (benchmarks = ['SPY', 'DIA', 'TSLA'], timeRange = '1Y') => {
  try {
    // Handle both array and string formats
    const benchmarksParam = Array.isArray(benchmarks) 
      ? benchmarks.join(',') 
      : benchmarks;
    
    const params = new URLSearchParams({
      benchmarks: benchmarksParam,
      timeRange,
    });
    
    const endpoint = `${API_ENDPOINTS.MARKET.BENCHMARKS}?${params}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    throw error;
  }
};
