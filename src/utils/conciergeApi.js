/**
 * Concierge/Appraisals API Service
 * Handles all concierge and appraisal-related API calls for the CRM Dashboard
 */

import { API_ENDPOINTS, API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api/client';
import { getDefaultHeaders } from '@/lib/api/client';

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

/**
 * List Appraisals
 * GET /api/v1/concierge/appraisals
 */
export const listAppraisals = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const endpoint = `${API_ENDPOINTS.CONCIERGE.LIST_APPRAISALS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Appraisal Details
 * GET /api/v1/concierge/appraisals/{appraisal_id}
 */
export const getAppraisal = async (appraisalId) => {
  const endpoint = API_ENDPOINTS.CONCIERGE.GET_APPRAISAL(appraisalId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Update Appraisal Status
 * PATCH /api/v1/concierge/appraisals/{appraisal_id}/status
 */
export const updateAppraisalStatus = async (appraisalId, statusData) => {
  const transformedData = transformToSnake(statusData);
  const endpoint = API_ENDPOINTS.CONCIERGE.UPDATE_STATUS(appraisalId);
  const response = await apiPatch(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Assign Appraisal
 * POST /api/v1/concierge/appraisals/{appraisal_id}/assign
 */
export const assignAppraisal = async (appraisalId, assignmentData) => {
  const transformedData = transformToSnake(assignmentData);
  const endpoint = API_ENDPOINTS.CONCIERGE.ASSIGN_APPRAISAL(appraisalId);
  const response = await apiPost(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Upload Documents to Appraisal
 * POST /api/v1/concierge/appraisals/{appraisal_id}/documents
 */
export const uploadAppraisalDocuments = async (appraisalId, files) => {
  try {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${API_ENDPOINTS.CONCIERGE.APPRAISAL_DOCUMENTS(appraisalId)}`;
    const headers = getDefaultHeaders();
    delete headers['Content-Type'];

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || 'Document upload failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();
    return transformKeys(data);
  } catch (error) {
    console.error('Failed to upload appraisal documents:', error);
    throw error;
  }
};

/**
 * Get Appraisal Documents
 * GET /api/v1/concierge/appraisals/{appraisal_id}/documents
 */
export const getAppraisalDocuments = async (appraisalId) => {
  const endpoint = API_ENDPOINTS.CONCIERGE.APPRAISAL_DOCUMENTS(appraisalId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Add Comment to Appraisal
 * POST /api/v1/concierge/appraisals/{appraisal_id}/comments
 */
export const addAppraisalComment = async (appraisalId, commentData) => {
  const transformedData = transformToSnake(commentData);
  const endpoint = API_ENDPOINTS.CONCIERGE.APPRAISAL_COMMENTS(appraisalId);
  const response = await apiPost(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Get Appraisal Comments
 * GET /api/v1/concierge/appraisals/{appraisal_id}/comments
 */
export const getAppraisalComments = async (appraisalId) => {
  const endpoint = API_ENDPOINTS.CONCIERGE.APPRAISAL_COMMENTS(appraisalId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Update Appraisal Valuation
 * PUT /api/v1/concierge/appraisals/{appraisal_id}/valuation
 */
export const updateAppraisalValuation = async (appraisalId, valuationData) => {
  const transformedData = transformToSnake(valuationData);
  const endpoint = API_ENDPOINTS.CONCIERGE.UPDATE_VALUATION(appraisalId);
  const response = await apiPut(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Download Valuation Report
 * GET /api/v1/concierge/appraisals/{appraisal_id}/report
 */
export const downloadValuationReport = async (appraisalId) => {
  const endpoint = API_ENDPOINTS.CONCIERGE.DOWNLOAD_REPORT(appraisalId);
  const response = await apiGet(endpoint);
  return response;
};

/**
 * Get Appraisal Statistics
 * GET /api/v1/concierge/statistics
 */
export const getAppraisalStatistics = async () => {
  const endpoint = API_ENDPOINTS.CONCIERGE.STATISTICS;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};
