/**
 * Base API Client
 * Provides common functionality for all API requests
 */

import { API_BASE_PATH, API_BASE_URL } from '@/config/api';

/**
 * Simple Logger utility for API calls
 */
export const apiLogger = {
  info: (message, data = {}) => {
    console.log('[API]', message, data);
  },
  error: (message, error = {}) => {
    console.error('[API ERROR]', message, error);
  },
  success: (message, data = {}) => {
    console.log('[API SUCCESS]', message, data);
  },
};

/**
 * Get default headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
export const getDefaultHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  // Add authorization token if available
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  return headers;
};

/**
 * Generic API request handler with logging and error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Check if we're in development and should use proxy
  const useProxy = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  let url;
  if (useProxy) {
    // Use Next.js API proxy to avoid CORS issues in development
    const endpointPath = endpoint.replace(/^\//, '');
    url = `/api/proxy/${endpointPath}`;
  } else {
    // Use direct backend URL in production
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const basePath = API_BASE_PATH.replace(/^\//, '');
    const endpointPath = endpoint.replace(/^\//, '');
    url = `${baseUrl}/${basePath}/${endpointPath}`;
  }
  
  const method = options.method || 'GET';
  const startTime = Date.now();

  // Prepare headers
  const headers = getDefaultHeaders(options.headers);

  // Parse request body for logging
  let requestBody = null;
  try {
    if (options.body) {
      requestBody =
        typeof options.body === 'string'
          ? JSON.parse(options.body)
          : options.body;
    }
  } catch (e) {
    requestBody = options.body;
  }

  // Log request
  console.log('[API REQUEST]', method, endpoint, requestBody);
  if (useProxy) {
    console.log('[API PROXY] Using proxy route:', url);
  }

  try {
    // Handle FormData specially - don't stringify it
    let body = options.body;
    if (body instanceof FormData) {
      // Remove Content-Type header for FormData, let browser set it with boundary
      delete headers['Content-Type'];
    } else if (body && typeof body !== 'string' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body || options.body,
      ...(options.responseType ? { responseType: options.responseType } : {}),
    });

    let responseData;

    // Try to parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => ({}));
    } else {
      responseData = await response.text().catch(() => '');
    }

    // Log response
    if (response.ok) {
      console.log('[API RESPONSE]', method, endpoint, response.status, responseData);
    } else {
      // Check if 422 is a UUID validation error (backend routing issue)
      // Error format: {detail: [{loc: ['path', 'offer_id'], msg: '...', type: 'uuid_parsing'}]}
      const is422UUIDError = response.status === 422 && responseData && (
        (Array.isArray(responseData.detail) && responseData.detail.some(d => 
          (typeof d === 'object' && (d?.msg?.includes('valid UUID') || d?.type === 'uuid_parsing')) ||
          (typeof d === 'string' && d.includes('valid UUID'))
        )) ||
        (typeof responseData.detail === 'string' && responseData.detail.includes('valid UUID'))
      );

      // Check if this is a 404 for asset details (expected when asset doesn't exist in backend)
      const is404AssetDetails = response.status === 404 && (
        endpoint.includes('/trade-engine/assets/') ||
        (endpoint.includes('/assets/') && responseData?.detail?.includes('not found'))
      );

      // Don't log 405 (Method Not Allowed), 400 (Bad Request), 403 (Forbidden), 401 (Unauthorized), 404 (asset details), or 422 UUID errors as errors
      // These are expected when endpoints have issues, backend bugs, validation errors, routing problems, permission issues, or assets don't exist
      // 422 UUID errors occur when backend routes are misconfigured (e.g., treating "my" as UUID parameter)
      // 403/401 errors are permission-related and should be handled gracefully by the calling code
      // 404 asset details errors are expected when assets don't exist in the backend yet
      if (response.status === 404 && is404AssetDetails) {
        // Log 404 asset details as debug info (not an error)
        console.log('[API] Asset not found:', endpoint, '- This is expected if asset does not exist in backend');
      } else if (response.status === 403 || response.status === 401) {
        // Log permission errors as warnings instead of errors (less noisy)
        // These are expected when endpoints require special permissions or don't exist yet
        console.warn('[API PERMISSION]', method, endpoint, response.status, 'Access denied or endpoint not available');
      } else if (response.status !== 405 && response.status !== 400 && response.status !== 403 && response.status !== 401 && !is422UUIDError) {
        console.error('[API ERROR RESPONSE]', method, endpoint, response.status, responseData);
      }
      
      // Extract error message from response
      let errorMessage = 'API request failed';
      
      if (responseData) {
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.detail) {
          // Handle array of validation errors (FastAPI style)
          if (Array.isArray(responseData.detail)) {
            const errorMessages = responseData.detail.map(err => {
              if (typeof err === 'string') return err;
              if (err.msg && err.loc) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              if (err.msg) return err.msg;
              return JSON.stringify(err);
            });
            errorMessage = errorMessages.join('; ');
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else {
            errorMessage = JSON.stringify(responseData.detail);
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else {
          errorMessage = JSON.stringify(responseData);
        }
      }
      
      // Create error object with backend error details
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    // Network or other exception
    if (!error.data) {
      console.error('[API NETWORK ERROR]', method, endpoint, error.message, url);
      error.url = url;
    }
    throw error;
  }
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export const apiPost = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export const apiPut = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request helper
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export const apiPatch = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response data
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};
