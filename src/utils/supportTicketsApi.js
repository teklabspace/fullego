/**
 * Support Tickets API Service
 * Handles all support ticket-related API calls for the CRM Dashboard
 */

import { API_ENDPOINTS, API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { apiGet, apiPost, apiPut } from '@/lib/api/client';
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
 * Create Support Ticket
 * POST /api/v1/support/tickets
 */
export const createTicket = async (ticketData) => {
  const transformedData = transformToSnake(ticketData);
  const endpoint = API_ENDPOINTS.SUPPORT.CREATE_TICKET;
  const response = await apiPost(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * List Support Tickets
 * GET /api/v1/support/tickets
 */
export const listTickets = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.issuer) queryParams.append('issuer', params.issuer);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const endpoint = `${API_ENDPOINTS.SUPPORT.LIST_TICKETS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  // apiGet already unwraps the {success, data} envelope, so `response` here
  // is the ticket array itself — not a wrapper with a `.data` property. The
  // old `if (response.data)` check was always false (arrays have no `.data`),
  // so every ticket kept its raw snake_case keys (e.g. `ticket_number` never
  // became `ticketNumber`).
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * List Support Tickets with pagination total.
 * GET /api/v1/support/tickets
 *
 * The endpoint response body is a bare array — the total row count (across all
 * pages, not just this page's length) comes back in the X-Total-Count response
 * header instead. Use this over `listTickets` wherever the UI needs to render
 * a real pager; `total` falls back to the returned page's length if the header
 * is ever missing so callers don't have to special-case it.
 */
export const listTicketsPage = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.issuer) queryParams.append('issuer', params.issuer);
  if (params.search) queryParams.append('search', params.search);
  queryParams.append('page', params.page || 1);
  queryParams.append('limit', params.limit || 50);

  const endpoint = `${API_ENDPOINTS.SUPPORT.LIST_TICKETS}?${queryParams.toString()}`;
  const { data, headers } = await apiGet(endpoint, { returnHeaders: true });
  const tickets = transformKeys(data) || [];
  const totalHeader = parseInt(headers.get('X-Total-Count'), 10);
  return {
    tickets,
    total: Number.isNaN(totalHeader) ? tickets.length : totalHeader,
  };
};

/**
 * Get Ticket Details
 * GET /api/v1/support/tickets/{ticket_id}
 */
export const getTicket = async (ticketId) => {
  const endpoint = API_ENDPOINTS.SUPPORT.GET_TICKET(ticketId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Update Ticket
 * PUT /api/v1/support/tickets/{ticket_id}
 */
export const updateTicket = async (ticketId, ticketData) => {
  const transformedData = transformToSnake(ticketData);
  const endpoint = API_ENDPOINTS.SUPPORT.UPDATE_TICKET(ticketId);
  const response = await apiPut(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Assign Ticket
 * POST /api/v1/support/tickets/{ticket_id}/assign
 */
export const assignTicket = async (ticketId, assignmentData) => {
  const transformedData = transformToSnake(assignmentData);
  const endpoint = API_ENDPOINTS.SUPPORT.ASSIGN_TICKET(ticketId);
  const response = await apiPost(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Upload Documents to Ticket
 * POST /api/v1/support/tickets/{ticket_id}/documents
 */
export const uploadTicketDocuments = async (ticketId, files) => {
  try {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${API_ENDPOINTS.SUPPORT.TICKET_DOCUMENTS(ticketId)}`;
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
    console.error('Failed to upload ticket documents:', error);
    throw error;
  }
};

/**
 * Upload documents with live progress.
 * POST /api/v1/support/tickets/{ticket_id}/documents
 *
 * `fetch` can't report upload progress, so this uses XHR directly — same
 * approach as conciergeApi's appraisal document upload.
 * @param {function} onProgress - called with an integer 0–100
 */
export const uploadTicketDocumentsWithProgress = (ticketId, files, onProgress) =>
  new Promise((resolve, reject) => {
    const fileList = Array.isArray(files) ? files : [files];
    const formData = new FormData();
    fileList.forEach(file => formData.append('files', file));

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${API_ENDPOINTS.SUPPORT.TICKET_DOCUMENTS(ticketId)}`;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON ok */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(transformKeys(data));
      } else {
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
 * Get Ticket Documents
 * GET /api/v1/support/tickets/{ticket_id}/documents
 */
export const getTicketDocuments = async (ticketId) => {
  const endpoint = API_ENDPOINTS.SUPPORT.TICKET_DOCUMENTS(ticketId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Add Reply to Ticket (BUG-09)
 * POST /api/v1/support/tickets/{ticket_id}/replies
 *
 * `/replies` is the canonical route. The old `/comments` route only exists as
 * an undocumented alias on the backend and may be removed, so we target
 * `/replies` directly. Request body is unchanged: { message, is_internal }.
 */
export const addTicketReply = async (ticketId, replyData) => {
  const transformedData = transformToSnake(replyData);
  const endpoint = API_ENDPOINTS.SUPPORT.TICKET_REPLIES(ticketId);
  const response = await apiPost(endpoint, transformedData);
  return transformKeys(response);
};

/**
 * Get Ticket Replies (BUG-09)
 * GET /api/v1/support/tickets/{ticket_id}/replies
 */
export const getTicketReplies = async (ticketId) => {
  const endpoint = API_ENDPOINTS.SUPPORT.TICKET_REPLIES(ticketId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * @deprecated Use addTicketReply — points at the canonical /replies route.
 */
// Submit a CSAT rating (1–5) for a resolved/closed ticket. Owner-only; the
// backend rejects (403) anyone else and (400) tickets that aren't resolved/closed.
export const submitTicketRating = async (ticketId, { rating, comment } = {}) => {
  const endpoint = API_ENDPOINTS.SUPPORT.TICKET_RATING(ticketId);
  return await apiPost(endpoint, { rating, ...(comment ? { comment } : {}) });
};

export const addTicketComment = addTicketReply;

/**
 * @deprecated Use getTicketReplies — points at the canonical /replies route.
 */
export const getTicketComments = getTicketReplies;

/**
 * Get Ticket History
 * GET /api/v1/support/tickets/{ticket_id}/history
 */
export const getTicketHistory = async (ticketId) => {
  const endpoint = API_ENDPOINTS.SUPPORT.TICKET_HISTORY(ticketId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get role-scoped support analytics (Reports tab).
 * GET /api/v1/support/analytics?range=7d|30d|90d
 * Scope is decided server-side by role: admin sees all tickets, advisor sees
 * tickets assigned to them, investor sees tickets they opened.
 */
export const getOwnSupportAnalytics = async (range = '30d') => {
  const endpoint = `${API_ENDPOINTS.SUPPORT.ANALYTICS}?range=${encodeURIComponent(range)}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Support Ticket Statistics
 * GET /api/v1/support/tickets/stats
 */
export const getTicketStatistics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.dateRangeStart) queryParams.append('date_range_start', params.dateRangeStart);
  if (params.dateRangeEnd) queryParams.append('date_range_end', params.dateRangeEnd);

  const endpoint = `${API_ENDPOINTS.SUPPORT.STATISTICS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};
