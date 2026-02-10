/**
 * Assets API Service
 * Handles all assets-related API calls with snake_case to camelCase transformation
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api/client';

/**
 * Transform snake_case object keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
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
 * Transform camelCase object keys to snake_case for API requests
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformToSnake);
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof File)) {
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
 * Format currency value for display
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Format date to human-readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// ASSET MANAGEMENT APIs
// ============================================================================

/**
 * 1. Get All Assets
 * GET /api/v1/assets
 */
export const getAssets = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.category) queryParams.append('category', params.category);
  if (params.categoryId) queryParams.append('category_id', params.categoryId);
  if (params.categoryGroup) queryParams.append('category_group', params.categoryGroup);
  if (params.search) queryParams.append('search', params.search);
  if (params.minValue) queryParams.append('min_value', params.minValue);
  if (params.maxValue) queryParams.append('max_value', params.maxValue);
  if (params.currency) queryParams.append('currency', params.currency);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  else if (params.pageSize) queryParams.append('page_size', params.pageSize);

  const endpoint = `${API_ENDPOINTS.ASSETS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  // Transform response
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.pagination) {
    response.pagination = transformKeys(response.pagination);
  }
  
  return response;
};

/**
 * 2. Get Single Asset
 * GET /api/v1/assets/{asset_id}
 */
export const getAsset = async (assetId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_BY_ID(assetId));
  
  // Transform and format response
  if (response.data) {
    const asset = transformKeys(response.data);
    
    // Map last_appraisal_date to lastAppraisal
    if (asset.lastAppraisalDate) {
      asset.lastAppraisal = asset.lastAppraisalDate;
    }
    
    // Format currency values if needed
    if (asset.currentValue && typeof asset.currentValue === 'number') {
      asset.currentValueFormatted = formatCurrency(asset.currentValue, asset.currency);
    }
    if (asset.estimatedValue && typeof asset.estimatedValue === 'number') {
      asset.estimatedValueFormatted = formatCurrency(asset.estimatedValue, asset.currency);
    }
    
    return { data: asset };
  }
  
  return response;
};

/**
 * 3. Create Asset
 * POST /api/v1/assets
 */
export const createAsset = async (assetData) => {
  // Transform camelCase to snake_case for API
  const transformedData = transformToSnake(assetData);
  
  // Log transformed data for debugging
  console.log('🔄 Transformed asset data (snake_case):', JSON.stringify(transformedData, null, 2));
  
  const response = await apiPost(API_ENDPOINTS.ASSETS.CREATE, transformedData);
  
  // Transform response back to camelCase
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 4. Update Asset
 * PUT /api/v1/assets/{asset_id}
 */
export const updateAsset = async (assetId, assetData) => {
  // Transform camelCase to snake_case for API
  const transformedData = transformToSnake(assetData);
  
  const response = await apiPut(API_ENDPOINTS.ASSETS.UPDATE(assetId), transformedData);
  
  // Transform response back to camelCase
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 5. Delete Asset
 * DELETE /api/v1/assets/{asset_id}
 */
export const deleteAsset = async (assetId) => {
  return await apiDelete(API_ENDPOINTS.ASSETS.DELETE(assetId));
};

// ============================================================================
// CATEGORIES APIs
// ============================================================================

/**
 * 6. Get Categories
 * GET /api/v1/assets/categories
 */
export const getCategories = async () => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.CATEGORIES);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 7. Get Category Groups
 * GET /api/v1/assets/category-groups
 */
export const getCategoryGroups = async () => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.CATEGORY_GROUPS);
  return response;
};

// ============================================================================
// PHOTOS APIs
// ============================================================================

/**
 * 8. Upload Asset Photo
 * POST /api/v1/assets/{asset_id}/photos
 */
export const uploadAssetPhoto = async (assetId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const headers = {};
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  const { API_BASE_URL, API_BASE_PATH } = await import('@/config/api');
  const url = `${API_BASE_URL.replace(/\/$/, '')}${API_BASE_PATH}${API_ENDPOINTS.ASSETS.UPLOAD_PHOTO(assetId)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.detail || error.message || 'Upload failed');
  }
  
  const data = await response.json();
  if (data.data) {
    data.data = transformKeys(data.data);
  }
  return data;
};

/**
 * 9. Delete Asset Photo
 * DELETE /api/v1/assets/{asset_id}/photos/{photo_id}
 */
export const deleteAssetPhoto = async (assetId, photoId) => {
  return await apiDelete(API_ENDPOINTS.ASSETS.DELETE_PHOTO(assetId, photoId));
};

// ============================================================================
// DOCUMENTS APIs
// ============================================================================

/**
 * 10. Upload Asset Document
 * POST /api/v1/assets/{asset_id}/documents
 */
export const uploadAssetDocument = async (assetId, file, documentType = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType) {
    formData.append('document_type', documentType);
  }
  
  const headers = {};
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  const { API_BASE_URL, API_BASE_PATH } = await import('@/config/api');
  const url = `${API_BASE_URL.replace(/\/$/, '')}${API_BASE_PATH}${API_ENDPOINTS.ASSETS.UPLOAD_DOCUMENT(assetId)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.detail || error.message || 'Upload failed');
  }
  
  const data = await response.json();
  if (data.data) {
    data.data = transformKeys(data.data);
  }
  return data;
};

/**
 * 11. Get Asset Documents
 * GET /api/v1/assets/{asset_id}/documents
 */
export const getAssetDocuments = async (assetId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_DOCUMENTS(assetId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 12. Delete Asset Document
 * DELETE /api/v1/assets/{asset_id}/documents/{document_id}
 */
export const deleteAssetDocument = async (assetId, documentId) => {
  return await apiDelete(API_ENDPOINTS.ASSETS.DELETE_DOCUMENT(assetId, documentId));
};

// ============================================================================
// VALUATION & APPRAISAL APIs
// ============================================================================

/**
 * 13. Get Asset Value History
 * GET /api/v1/assets/{asset_id}/value-history
 */
export const getAssetValueHistory = async (assetId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.period) queryParams.append('period', params.period);
  
  const endpoint = `${API_ENDPOINTS.ASSETS.VALUE_HISTORY(assetId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 14. Request Asset Appraisal
 * POST /api/v1/assets/{asset_id}/appraisals
 */
export const requestAssetAppraisal = async (assetId, appraisalData) => {
  const transformedData = transformToSnake(appraisalData);
  const response = await apiPost(API_ENDPOINTS.ASSETS.REQUEST_APPRAISAL(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 15. Get Asset Appraisals
 * GET /api/v1/assets/{asset_id}/appraisals
 */
export const getAssetAppraisals = async (assetId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_APPRAISALS(assetId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 16. Get Appraisal Status
 * GET /api/v1/assets/{asset_id}/appraisals/{appraisal_id}
 */
export const getAppraisalStatus = async (assetId, appraisalId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_APPRAISAL(assetId, appraisalId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 17. Update Asset Valuation
 * PATCH /api/v1/assets/{asset_id}/valuation
 */
export const updateAssetValuation = async (assetId, valuationData) => {
  const transformedData = transformToSnake(valuationData);
  const response = await apiPatch(API_ENDPOINTS.ASSETS.UPDATE_VALUATION(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 18. Create Valuation
 * POST /api/v1/assets/{asset_id}/valuations
 */
export const createValuation = async (assetId, valuationData) => {
  const transformedData = transformToSnake(valuationData);
  const endpoint = `/assets/${assetId}/valuations`;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// SALE REQUESTS APIs
// ============================================================================

/**
 * 19. Request Asset Sale
 * POST /api/v1/assets/{asset_id}/sale-requests
 */
export const requestAssetSale = async (assetId, saleData) => {
  const transformedData = transformToSnake(saleData);
  const response = await apiPost(API_ENDPOINTS.ASSETS.REQUEST_SALE(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 20. Get Asset Sale Requests
 * GET /api/v1/assets/{asset_id}/sale-requests
 */
export const getAssetSaleRequests = async (assetId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_SALE_REQUESTS(assetId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 21. Get Sale Request Status
 * GET /api/v1/assets/{asset_id}/sale-requests/{request_id}
 */
export const getSaleRequestStatus = async (assetId, requestId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_SALE_REQUEST(assetId, requestId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 22. Cancel Sale Request
 * DELETE /api/v1/assets/{asset_id}/sale-requests/{request_id}
 */
export const cancelSaleRequest = async (assetId, requestId) => {
  return await apiDelete(API_ENDPOINTS.ASSETS.CANCEL_SALE_REQUEST(assetId, requestId));
};

// ============================================================================
// ASSET ACTIONS APIs
// ============================================================================

/**
 * 23. Transfer Asset Ownership
 * POST /api/v1/assets/{asset_id}/transfer
 */
export const transferAssetOwnership = async (assetId, transferData) => {
  const transformedData = transformToSnake(transferData);
  const response = await apiPost(API_ENDPOINTS.ASSETS.TRANSFER(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 24. Share Asset Details
 * POST /api/v1/assets/{asset_id}/share
 */
export const shareAssetDetails = async (assetId, shareData) => {
  const transformedData = transformToSnake(shareData);
  const response = await apiPost(API_ENDPOINTS.ASSETS.SHARE(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 25. Generate Asset Report
 * POST /api/v1/assets/{asset_id}/reports
 */
export const generateAssetReport = async (assetId, reportData) => {
  const transformedData = transformToSnake(reportData);
  const response = await apiPost(API_ENDPOINTS.ASSETS.GENERATE_REPORT(assetId), transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 26. Get Asset Report Status
 * GET /api/v1/assets/{asset_id}/reports/{report_id}
 */
export const getAssetReportStatus = async (assetId, reportId) => {
  const response = await apiGet(API_ENDPOINTS.ASSETS.GET_REPORT(assetId, reportId));
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// ANALYTICS APIs
// ============================================================================

/**
 * 27. Get Assets Summary
 * GET /api/v1/assets/summary
 */
export const getAssetsSummary = async (categoryGroup = null) => {
  const queryParams = categoryGroup ? `?category_group=${categoryGroup}` : '';
  const endpoint = `${API_ENDPOINTS.ASSETS.SUMMARY}${queryParams}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * 28. Get Asset Value Trends
 * GET /api/v1/assets/value-trends
 */
export const getAssetValueTrends = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.period) queryParams.append('period', params.period);
  if (params.categoryGroup) queryParams.append('category_group', params.categoryGroup);
  
  const endpoint = `${API_ENDPOINTS.ASSETS.VALUE_TRENDS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// FILE UPLOAD API
// ============================================================================

/**
 * 29. Upload File (General)
 * POST /api/v1/files/upload
 */
export const uploadFile = async (file, fileType, assetId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);
  if (assetId) {
    formData.append('asset_id', assetId);
  }
  
  const headers = {};
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  
  const { API_BASE_URL, API_BASE_PATH } = await import('@/config/api');
  const url = `${API_BASE_URL.replace(/\/$/, '')}${API_BASE_PATH}${API_ENDPOINTS.FILES.UPLOAD}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.detail || error.message || 'Upload failed');
    }
    
    const data = await response.json();
    if (data.data) {
      data.data = transformKeys(data.data);
    }
    return data;
  } catch (error) {
    // Handle CORS and network errors
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      const corsError = new Error(
        'CORS Error: Backend must allow requests from frontend origin. ' +
        'Please configure CORS on backend to allow: ' + 
        (typeof window !== 'undefined' ? window.location.origin : 'frontend origin')
      );
      corsError.isCorsError = true;
      throw corsError;
    }
    throw error;
  }
};
