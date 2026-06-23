/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';

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
// NOTIFICATIONS APIs
// ============================================================================

/**
 * Get Notifications
 * GET /api/v1/notifications
 * 
 * @param {Object} params - Query parameters
 * @param {boolean} params.unreadOnly - Optional: Filter to show only unread notifications (default: false)
 */
export const getNotifications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.unreadOnly !== undefined) {
    queryParams.append('unread_only', params.unreadOnly.toString());
  }
  
  const endpoint = `${API_ENDPOINTS.NOTIFICATIONS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);

  // Backend shape varies between deployments: a bare array, { data: [...] },
  // { notifications: [...] }, or a paginated { items/results: [...] }. Normalise
  // every shape to { data: [...] } so the UI never silently shows an empty list
  // (the previous code returned the raw object for unknown shapes, which the
  // dropdown then read as []).
  const list = Array.isArray(response)
    ? response
    : response?.data ||
      response?.notifications ||
      response?.items ||
      response?.results ||
      [];

  const normalized = (Array.isArray(list) ? list : []).map((item) => {
    const n = transformKeys(item);
    // Unify the read flag — backend may send is_read / isRead / read.
    n.read = n.read ?? n.isRead ?? false;
    return n;
  });

  return { data: normalized };
};

/**
 * Get Unread Notifications
 * GET /api/v1/notifications/unread
 */
export const getUnreadNotifications = async () => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.UNREAD;
  const response = await apiGet(endpoint);
  
  // Handle both array and object responses
  if (Array.isArray(response)) {
    return { data: response.map(transformKeys) };
  }
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Unread Count
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async () => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT;
  const response = await apiGet(endpoint);

  // Count may come back as a bare number, { count }, { unread_count }, or nested
  // under data. Transform the WHOLE response so snake_case (unread_count) becomes
  // camelCase, then resolve the first numeric value. Previously a top-level
  // unread_count was never normalised, so the badge always read 0.
  const t = transformKeys(response);
  const count =
    (typeof t === 'number' ? t : undefined) ??
    t?.count ??
    t?.unreadCount ??
    t?.data?.count ??
    t?.data?.unreadCount ??
    0;

  return { count: typeof count === 'number' ? count : 0, data: t?.data };
};

/**
 * Mark Notification as Read
 * POST /api/v1/notifications/{id}/read
 *
 * @param {string} notificationId - Notification ID
 */
export const markAsRead = async (notificationId) => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId);
  const response = await apiPost(endpoint, {});

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Mark All as Read
 * POST /api/v1/notifications/read-all
 */
export const markAllAsRead = async () => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ;
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Delete Notification
 * DELETE /api/v1/notifications/{notification_id}
 * 
 * @param {string} notificationId - Notification ID
 */
export const deleteNotification = async (notificationId) => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId);
  const response = await apiDelete(endpoint);
  
  return response;
};

/**
 * Get Notification Settings
 * GET /api/v1/notifications/settings
 */
export const getNotificationSettings = async () => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.SETTINGS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Notification Settings
 * PUT /api/v1/notifications/settings
 * 
 * @param {Object} settings - Notification settings
 * @param {boolean} settings.emailEnabled - Optional: Enable email notifications
 * @param {boolean} settings.pushEnabled - Optional: Enable push notifications
 * @param {boolean} settings.smsEnabled - Optional: Enable SMS notifications
 * @param {boolean} settings.orderNotifications - Optional: Enable order notifications
 * @param {boolean} settings.offerNotifications - Optional: Enable offer notifications
 * @param {boolean} settings.paymentNotifications - Optional: Enable payment notifications
 * @param {boolean} settings.kycNotifications - Optional: Enable KYC notifications
 * @param {boolean} settings.supportNotifications - Optional: Enable support notifications
 * @param {boolean} settings.generalNotifications - Optional: Enable general notifications
 */
export const updateNotificationSettings = async (settings) => {
  const transformedData = transformToSnake({
    email_enabled: settings.emailEnabled,
    push_enabled: settings.pushEnabled,
    sms_enabled: settings.smsEnabled,
    order_notifications: settings.orderNotifications,
    offer_notifications: settings.offerNotifications,
    payment_notifications: settings.paymentNotifications,
    kyc_notifications: settings.kycNotifications,
    support_notifications: settings.supportNotifications,
    general_notifications: settings.generalNotifications
  });
  
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.UPDATE_SETTINGS;
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
