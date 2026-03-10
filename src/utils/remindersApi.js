/**
 * Reminders API Service
 * Handles all reminder-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';

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
 * Transform camelCase keys to snake_case
 * @param {Object} obj - Object to transform
 * @returns {Object} Transformed object
 */
const transformToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformToSnake);
  }
  if (typeof obj !== 'object') return obj;
  
  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    transformed[snakeKey] = typeof value === 'object' ? transformToSnake(value) : value;
  }
  return transformed;
};

/**
 * Get user reminders with filters and pagination
 * @param {Object} filters - Filter object with optional fields: status, dueDateFrom, dueDateTo
 * @param {number} limit - Number of reminders (default: 20, max: 100)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Reminders list with pagination
 */
export const getReminders = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    // Add filters to params
    if (filters.status) params.append('status', filters.status);
    if (filters.dueDateFrom) params.append('due_date_from', filters.dueDateFrom);
    if (filters.dueDateTo) params.append('due_date_to', filters.dueDateTo);
    
    const endpoint = `${API_ENDPOINTS.REMINDERS.LIST}?${params}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

/**
 * Create a new reminder
 * @param {Object} reminderData - Reminder data with fields: title, description, reminderDate, taskId, notificationChannels
 * @returns {Promise<Object>} Created reminder object
 */
export const createReminder = async (reminderData) => {
  try {
    const endpoint = API_ENDPOINTS.REMINDERS.LIST;
    const transformedData = transformToSnake(reminderData);
    const response = await apiPost(endpoint, transformedData);
    return transformKeys(response.reminder || response);
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

/**
 * Get reminder details
 * @param {string} reminderId - UUID of the reminder
 * @returns {Promise<Object>} Reminder object
 */
export const getReminderDetails = async (reminderId) => {
  try {
    const endpoint = API_ENDPOINTS.REMINDERS.DETAILS(reminderId);
    const response = await apiGet(endpoint);
    return transformKeys(response.reminder || response);
  } catch (error) {
    console.error('Error fetching reminder details:', error);
    throw error;
  }
};

/**
 * Update a reminder
 * @param {string} reminderId - UUID of the reminder
 * @param {Object} updates - Update object with optional fields: title, description, reminderDate, notificationChannels
 * @returns {Promise<Object>} Updated reminder object
 */
export const updateReminder = async (reminderId, updates) => {
  try {
    const endpoint = API_ENDPOINTS.REMINDERS.UPDATE(reminderId);
    const transformedData = transformToSnake(updates);
    const response = await apiPut(endpoint, transformedData);
    return transformKeys(response.reminder || response);
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

/**
 * Delete a reminder
 * @param {string} reminderId - UUID of the reminder
 * @returns {Promise<boolean>} Success status
 */
export const deleteReminder = async (reminderId) => {
  try {
    const endpoint = API_ENDPOINTS.REMINDERS.DELETE(reminderId);
    await apiDelete(endpoint);
    return true;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

/**
 * Snooze a reminder
 * @param {string} reminderId - UUID of the reminder
 * @param {string} snoozeUntil - ISO 8601 datetime string
 * @returns {Promise<Object>} Updated reminder object
 */
export const snoozeReminder = async (reminderId, snoozeUntil) => {
  try {
    const endpoint = API_ENDPOINTS.REMINDERS.SNOOZE(reminderId);
    const response = await apiPut(endpoint, {
      snoozeUntil,
    });
    return transformKeys(response.reminder || response);
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    throw error;
  }
};
