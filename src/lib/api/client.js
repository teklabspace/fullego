/**
 * Base API Client
 * Provides common functionality for all API requests
 */

import { API_BASE_PATH, API_BASE_URL } from '@/config/api';
import { isPersonaInquiryCreateMessage } from '@/utils/kycErrors';

/**
 * Simple Logger utility for API calls
 */
export const apiLogger = {
  info: (message, data = {}) => {
    console.log('[API]', message, data);
  },
  error: (message, meta = {}) => {
    if (meta instanceof Error) {
      console.error(
        '[API ERROR]',
        message,
        meta.message,
        meta.status != null ? `(HTTP ${meta.status})` : ''
      );
      return;
    }
    const detail =
      meta?.detail ??
      meta?.message ??
      (typeof meta === 'string' ? meta : null);
    if (detail) {
      console.error('[API ERROR]', message, detail, meta?.status != null ? `(HTTP ${meta.status})` : '');
    } else {
      console.error('[API ERROR]', message, meta);
    }
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

// ─── Access-token auto-refresh ────────────────────────────────────────────────
// The access token in localStorage is short-lived; when it expires the backend
// returns 401. Rather than surfacing that as a failure, we transparently exchange
// the refresh token for a new access token and retry the original request once.
// This is what makes a short access-token TTL viable (smaller stolen-token window)
// without hurting UX. Implemented inline here — importing authApi would create a
// circular dependency (authApi imports this module).

// Endpoints that must never trigger a refresh attempt (avoids loops / nonsense).
const NO_REFRESH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

const readStoredToken = (key) =>
  typeof window !== 'undefined' ? localStorage.getItem(key) : null;

const clearStoredTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
};

// Single-flight guard: if many requests 401 at once, only one refresh call goes
// out; the rest await the same promise.
let inFlightRefresh = null;

const refreshAccessToken = () => {
  const refresh_token = readStoredToken('refresh_token');
  if (!refresh_token) return Promise.resolve(false);

  if (!inFlightRefresh) {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const basePath = API_BASE_PATH.replace(/^\//, '');
    const url = `${baseUrl}/${basePath}/auth/refresh`;
    inFlightRefresh = fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const body = await res.json().catch(() => null);
        // /auth/refresh is enveloped too — unwrap `data` if present.
        const data =
          body && typeof body === 'object' && typeof body.success === 'boolean' && 'data' in body
            ? body.data
            : body;
        if (data?.access_token) {
          localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
};

// ─── Standardized response envelope ───────────────────────────────────────────
// Every JSON endpoint returns:
//   success: { success: true,  status_code, message, data }
//   error:   { success: false, status_code, message, error: { code, details } }
// We detect it by the `success` boolean + `status_code` (so legacy/excluded
// shapes — binary downloads, /health — are left untouched), unwrap `data` on
// success, and normalize errors into a thrown Error with .status/.code/.details.
const isEnvelope = (b) =>
  b && typeof b === 'object' && typeof b.success === 'boolean' && 'status_code' in b;

// Flatten a legacy FastAPI `detail` (string or [{loc,msg,type}]) to a message.
const flattenLegacyDetail = (detail) => {
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        if (typeof err === 'string') return err;
        if (err?.msg && err?.loc) return `${err.loc.join('.')}: ${err.msg}`;
        if (err?.msg) return err.msg;
        return JSON.stringify(err);
      })
      .join('; ');
  }
  return typeof detail === 'string' ? detail : JSON.stringify(detail);
};

/**
 * Generic API request handler with logging and error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Always use direct backend URL (proxy route removed for static export compatibility)
  // Note: Backend must have CORS configured to allow requests from the frontend
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const basePath = API_BASE_PATH.replace(/^\//, '');
  const endpointPath = endpoint.replace(/^\//, '');
  const url = `${baseUrl}/${basePath}/${endpointPath}`;
  
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
      // Expired/invalid access token → try a one-time silent refresh + retry.
      const eligibleForRefresh =
        response.status === 401 &&
        !options._retry &&
        !NO_REFRESH_ENDPOINTS.some((p) => endpoint.includes(p)) &&
        !!readStoredToken('refresh_token');
      if (eligibleForRefresh) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Re-issue the original request; getDefaultHeaders() picks up the new
          // token. `_retry` guards against an infinite loop if it 401s again.
          return apiRequest(endpoint, { ...options, _retry: true });
        }
        // Refresh failed → the session is truly over. Clear the dead tokens so we
        // stop sending a stale Bearer; route guards / 401 handlers (SecureRoute,
        // ProfileDropdown) take the user to /login.
        clearStoredTokens();
      }

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
      const notFoundText =
        (responseData && typeof responseData === 'object' && (responseData.detail || responseData.message)) || '';
      const is404AssetDetails = response.status === 404 && (
        endpoint.includes('/trade-engine/assets/') ||
        (endpoint.includes('/assets/') && typeof notFoundText === 'string' && notFoundText.toLowerCase().includes('not found'))
      );

      // Extract a user-friendly message + stable code. Prefer the standardized
      // envelope; fall back to legacy `detail`/`message`/`error` shapes for any
      // non-migrated or excluded endpoint.
      let errorMessage = 'Something went wrong. Please try again.';
      let errorCode = null;
      let errorDetails = null;

      if (responseData) {
        if (typeof responseData === 'string') {
          errorMessage = responseData || errorMessage;
        } else if (isEnvelope(responseData)) {
          errorMessage = responseData.message || errorMessage;
          errorCode = responseData.error?.code || null;
          errorDetails = responseData.error?.details || null;
        } else if (responseData.detail) {
          errorMessage = flattenLegacyDetail(responseData.detail);
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage =
            typeof responseData.error === 'string'
              ? responseData.error
              : responseData.error.message || JSON.stringify(responseData.error);
        } else {
          errorMessage = JSON.stringify(responseData);
        }
      }

      const isKycPersonaHostedRequired =
        endpoint.includes('kyc/start') &&
        isPersonaInquiryCreateMessage(errorMessage);

      if (response.status === 404 && is404AssetDetails) {
        console.log('[API] Asset not found:', endpoint, '- This is expected if asset does not exist in backend');
      } else if (response.status === 403 || response.status === 401) {
        console.warn('[API PERMISSION]', method, endpoint, response.status, 'Access denied or endpoint not available');
      } else if (isKycPersonaHostedRequired) {
        console.warn(
          '[API] KYC start: Persona inquiry API not enabled on server; hosted flow required.',
          response.status
        );
      } else if (response.status !== 405 && response.status !== 400 && response.status !== 403 && response.status !== 401 && !is422UUIDError) {
        console.error('[API ERROR RESPONSE]', method, endpoint, response.status, responseData);
      }
      
      // Server-enforced KYC gate: a guarded resource needs an approved KYC. Send
      // the user into the verification flow (unless they're already on an auth /
      // verification page, to avoid redirect loops).
      if (errorCode === 'KYC_REQUIRED' && typeof window !== 'undefined') {
        const path = window.location.pathname;
        const exempt = [
          '/choose-profile', '/kyc-verification', '/identity-verification',
          '/document-verification', '/kyc', '/verification-success',
          '/login', '/signup', '/reset-password', '/forgot-password', '/verify-email',
        ];
        if (!exempt.some((p) => path.startsWith(p))) {
          window.location.href = '/choose-profile';
        }
      }

      // Create error object with backend error details
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusCode = (isEnvelope(responseData) && responseData.status_code) || response.status;
      error.data = responseData;
      if (errorCode) error.code = errorCode;
      if (errorDetails) error.details = errorDetails;
      if (isKycPersonaHostedRequired) {
        error.isPersonaHostedFlowRequired = true;
      }
      throw error;
    }

    // Unwrap the success envelope so callers receive the payload directly. Non-
    // enveloped bodies (binary downloads, /health, plain text) pass through.
    if (isEnvelope(responseData)) {
      if (responseData.success === false) {
        // Defensive: success:false arriving with a 2xx — still an error.
        const error = new Error(responseData.message || 'Request failed');
        error.status = response.status;
        error.statusCode = responseData.status_code || response.status;
        error.data = responseData;
        if (responseData.error?.code) error.code = responseData.error.code;
        if (responseData.error?.details) error.details = responseData.error.details;
        throw error;
      }
      return 'data' in responseData ? responseData.data : responseData;
    }

    return responseData;
  } catch (error) {
    // Network or other exception (no backend response attached)
    if (!error.data) {
      // "Failed to fetch" / TypeError means the backend was unreachable (server down,
      // CORS, offline) — not a code bug. Log as a warning so it doesn't surface as a
      // red Console Error; callers handle the rejection and degrade gracefully.
      const isNetworkError = error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(error.message || '');
      const log = isNetworkError ? console.warn : console.error;
      log('[API NETWORK ERROR]', method, endpoint, error.message, url);
      error.url = url;
      error.isNetworkError = isNetworkError;
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
  // If data is undefined or null, don't send a body
  const body = data === undefined || data === null ? undefined : JSON.stringify(data);
  
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: body,
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
