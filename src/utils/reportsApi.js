/**
 * Reports API Service
 * Handles all report-related API calls
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
// REPORTS APIs (from INVESTMENT_APIS.md)
// ============================================================================

// Envelope-tolerant normalizer, mirroring the one in portfolioApi.js. The API
// client already unwraps {success, status_code, message, data}, so the old
// `if (response.data)` guard was dead and transformKeys never ran. Callers read
// both `res.data` and top-level fields, so serve the camelized payload as both.
const normalizePayload = (response) => {
  const payload = transformKeys(response?.data ?? response ?? {});
  if (Array.isArray(payload)) return { data: payload };
  return { ...payload, data: payload };
};

/**
 * Generate Report
 * POST /api/v1/reports/generate
 *
 * @param {object} reportData
 * @param {string} reportData.reportType portfolio | transaction | tax | custom
 * @param {string} reportData.format     csv | xlsx | pdf | json
 * @param {{startDate: string, endDate: string}} reportData.dateRange ISO-8601 UTC
 * @param {object} [reportData.filters]  e.g. { assetType: 'crypto' }
 * @returns {Promise<{id: string, status: string}>} normalized payload
 * @throws  400 UNSUPPORTED_REPORT_FORMAT when the renderer is unavailable
 */
export const generateReport = async (reportData) => {
  const transformedData = transformToSnake(reportData);
  const endpoint = API_ENDPOINTS.REPORTS.GENERATE;
  const response = await apiPost(endpoint, transformedData);
  return normalizePayload(response);
};

/**
 * List Reports
 * GET /api/v1/reports
 */
export const listReports = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.REPORTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Get Report Details
 * GET /api/v1/reports/{report_id}
 */
export const getReport = async (reportId) => {
  const endpoint = API_ENDPOINTS.REPORTS.GET_REPORT(reportId);
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};

/**
 * Download Report
 * GET /api/v1/reports/{report_id}/download
 *
 * Returns real csv/xlsx/pdf/json bytes. Requested as a blob so binary formats
 * survive — parsing this as text corrupts xlsx and pdf. Resolves to a File when
 * the backend's Content-Disposition filename is readable, otherwise a plain
 * Blob (see parseContentDispositionFilename in lib/api/client.js).
 */
export const downloadReport = async (reportId) => {
  const endpoint = API_ENDPOINTS.REPORTS.DOWNLOAD_REPORT(reportId);
  return apiGet(endpoint, { responseType: 'blob' });
};

/**
 * Get Report Statistics
 * GET /api/v1/reports/statistics
 */
export const getReportStatistics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.dateRangeStart) queryParams.append('date_range_start', params.dateRangeStart);
  if (params.dateRangeEnd) queryParams.append('date_range_end', params.dateRangeEnd);

  const endpoint = `${API_ENDPOINTS.REPORTS.STATISTICS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return normalizePayload(response);
};
