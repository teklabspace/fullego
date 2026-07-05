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

// Upload constraints enforced by the backend. Files failing these are rejected
// server-side (older deploys even did so silently with an empty 200), so
// validate up front and give the user the precise reason instead.
const ALLOWED_DOC_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const MAX_DOC_SIZE_MB = 10;

const validateAppraisalFiles = (files) => {
  const problems = [];
  for (const f of files) {
    const name = f?.name || '';
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    if (!ext || !ALLOWED_DOC_EXTENSIONS.includes(ext)) {
      problems.push(
        `${name || 'Unnamed file'}: unsupported file type${ext ? ` ".${ext}"` : ''} — allowed: ${ALLOWED_DOC_EXTENSIONS.join(', ')}`
      );
    } else if (f.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
      problems.push(`${name}: larger than ${MAX_DOC_SIZE_MB} MB`);
    }
  }
  if (problems.length) {
    throw new Error(problems.join('. '));
  }
};

// Append files with an explicit filename — a raw Blob without one is sent as
// "blob" (no extension) and the backend always rejects it.
const appendFiles = (formData, files) => {
  files.forEach((f) => {
    if (f?.name) formData.append('files', f, f.name);
    else formData.append('files', f);
  });
};

// The upload endpoint can return HTTP 200 with some (or, on older deploys, all)
// files rejected — `count` / `rejected` are the source of truth, not the status
// code. Throws when nothing was saved; passes `rejected` through otherwise so
// callers can warn about partial success.
const assertDocumentsSaved = (parsed, fileCount) => {
  const rejected = Array.isArray(parsed?.rejected) ? parsed.rejected : [];
  const count = parsed?.count ?? (Array.isArray(parsed?.data) ? parsed.data.length : null);
  if (fileCount > 0 && count === 0) {
    const reasons = rejected
      .map((r) => `${r.fileName || r.file_name || 'file'}: ${r.reason || 'rejected'}`)
      .join('; ');
    const error = new Error(
      reasons ? `No documents were saved — ${reasons}` : 'No documents were saved — the files were rejected by the server.'
    );
    error.data = parsed;
    throw error;
  }
  return parsed;
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
    const fileList = Array.isArray(files) ? files : [files];
    validateAppraisalFiles(fileList);

    const formData = new FormData();
    appendFiles(formData, fileList);

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
    return assertDocumentsSaved(transformKeys(data), fileList.length);
  } catch (error) {
    console.error('Failed to upload appraisal documents:', error);
    throw error;
  }
};

// Shared XHR upload core (fetch can't report upload progress). Validates the
// files, appends them with explicit filenames, and enforces the count/rejected
// contract on the response.
const xhrUploadDocuments = (endpointPath, files, onProgress) =>
  new Promise((resolve, reject) => {
    const fileList = Array.isArray(files) ? files : [files];
    try {
      validateAppraisalFiles(fileList);
    } catch (err) {
      reject(err);
      return;
    }
    const formData = new FormData();
    appendFiles(formData, fileList);

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${endpointPath}`;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON ok */ }
        try {
          resolve(assertDocumentsSaved(transformKeys(data), fileList.length));
        } catch (err) {
          reject(err);
        }
      } else {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
        const err = new Error(data.detail || 'Document upload failed');
        err.status = xhr.status;
        err.data = data;
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });

/**
 * Upload documents with live progress — STAFF surface.
 * POST /api/v1/concierge/appraisals/{appraisal_id}/documents
 *
 * `documentType` and `isClientVisible` are query params, not form fields — the
 * backend's marketplace auto-publish trigger (staff uploads a document_type=
 * valuation doc + saves the appraised value) only reads document_type off the
 * query string, and it must be exactly the lowercase string 'valuation'.
 * `isClientVisible: false` keeps a document staff-internal.
 * @param {function} onProgress - called with an integer 0–100
 * @returns {Promise<object>} parsed JSON response ({ data, count, rejected? })
 */
export const uploadAppraisalDocumentsWithProgress = (
  appraisalId,
  files,
  { onProgress, documentType, isClientVisible } = {}
) => {
  const queryParams = new URLSearchParams();
  if (documentType) queryParams.append('document_type', documentType);
  if (typeof isClientVisible === 'boolean') {
    queryParams.append('is_client_visible', String(isClientVisible));
  }
  const query = queryParams.toString();
  const path = `${API_ENDPOINTS.CONCIERGE.APPRAISAL_DOCUMENTS(appraisalId)}${query ? `?${query}` : ''}`;
  return xhrUploadDocuments(path, files, onProgress);
};

/**
 * Upload documents with live progress — INVESTOR surface (owner only).
 * POST /api/v1/assets/{asset_id}/appraisals/{appraisal_id}/documents
 *
 * Always client-visible; the backend accepts no document_type/is_client_visible
 * here. Investors must use this route — the /concierge one is staff-only.
 */
export const uploadAssetAppraisalDocumentsWithProgress = (
  assetId,
  appraisalId,
  files,
  { onProgress } = {}
) =>
  xhrUploadDocuments(
    API_ENDPOINTS.ASSETS.APPRAISAL_DOCUMENTS(assetId, appraisalId),
    files,
    onProgress
  );

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
