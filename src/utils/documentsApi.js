/**
 * Documents API Service
 * Handles all document-related API calls for the CRM Dashboard
 */

import { API_ENDPOINTS, API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { apiGet, apiPost, apiDelete } from '@/lib/api/client';
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
 * Upload Document
 * POST /api/v1/files/upload
 */
export const uploadDocument = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.category) formData.append('category', options.category);
    if (options.tags) {
      if (Array.isArray(options.tags)) {
        options.tags.forEach(tag => formData.append('tags', tag));
      } else {
        formData.append('tags', options.tags);
      }
    }
    if (options.description) formData.append('description', options.description);
    if (options.relatedType) formData.append('related_type', options.relatedType);
    if (options.relatedId) formData.append('related_id', options.relatedId);

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${API_ENDPOINTS.FILES.UPLOAD}`;
    const headers = getDefaultHeaders();
    delete headers['Content-Type']; // Let browser set boundary for FormData

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
    console.error('Failed to upload document:', error);
    throw error;
  }
};

/**
 * List Documents
 * GET /api/v1/documents
 */
export const listDocuments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const endpoint = `${API_ENDPOINTS.DOCUMENTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);

  // The backend returns a raw array (snake_case: file_name, file_size,
  // document_type, created_at). A top-level array has no `.data`, so the old
  // check skipped transformKeys entirely and snake_case leaked to the UI.
  // Normalise to { data: [...camelCase] } so callers get a consistent shape.
  if (Array.isArray(response)) {
    return { data: transformKeys(response) };
  }
  if (response && response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Document Details
 * GET /api/v1/documents/{document_id}
 */
export const getDocument = async (documentId) => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.GET_DOCUMENT(documentId);
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Download Document
 * GET /api/v1/documents/{document_id}/download
 */
export const downloadDocument = async (documentId) => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.DOWNLOAD(documentId);
  const response = await apiGet(endpoint);
  return response;
};

/**
 * Delete Document
 * DELETE /api/v1/documents/{document_id}
 */
export const deleteDocument = async (documentId) => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.DELETE(documentId);
  const response = await apiDelete(endpoint);
  return response;
};

/**
 * Share Document
 * POST /api/v1/documents/{document_id}/share
 */
export const shareDocument = async (documentId, shareData) => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.SHARE(documentId);
  const response = await apiPost(endpoint, shareData);
  return transformKeys(response);
};

/**
 * Get Document Statistics
 * GET /api/v1/documents/statistics
 */
export const getDocumentStatistics = async () => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.STATISTICS;
  const response = await apiGet(endpoint);
  return normalizeDocumentStats(response);
};

/**
 * Platform-wide document category counts across ALL users.
 * GET /api/v1/admin/documents/statistics  — admin only (403 otherwise).
 *
 * Returns { categories: { <label>: n }, total } where total is the platform-wide
 * document count. Call this only for admin; branch on role in the page.
 */
export const getAdminDocumentStatistics = async () => {
  const endpoint = API_ENDPOINTS.ADMIN.DOCUMENTS_STATISTICS;
  const response = await apiGet(endpoint);
  return normalizeDocumentStats(response);
};

/**
 * The document category labels ARE the backend enum values, verbatim: Title Case,
 * and "Bank Statements" contains a space. They must be read exactly — never
 * lowercased or slugified (same casing trap as kyc_status). transformKeys only
 * rewrites snake_case (an "_x" -> "X"), so these particular labels pass through
 * untouched; even so we transform the envelope but hand the `categories` map back
 * exactly as the backend sent it, so a future label with an underscore can't be
 * silently mangled.
 */
const normalizeDocumentStats = (response) => {
  if (!response || typeof response !== 'object') return response;
  const rawCategories = response.categories;
  const shaped = transformKeys(response);
  if (rawCategories && typeof rawCategories === 'object') {
    shaped.categories = rawCategories; // verbatim, keys are the enum values
  }
  return shaped;
};

/**
 * Get Document Preview
 * GET /api/v1/documents/{document_id}/preview
 */
export const getDocumentPreview = async (documentId) => {
  const endpoint = API_ENDPOINTS.DOCUMENTS.PREVIEW(documentId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};
