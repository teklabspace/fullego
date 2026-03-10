/**
 * Tasks API Service
 * Handles all user task-related API calls
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
 * Get user tasks with filters and pagination
 * @param {Object} filters - Filter object with optional fields: status, priority, category, dueDateFrom, dueDateTo
 * @param {number} limit - Number of tasks (default: 20, max: 100)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Tasks list with pagination
 */
export const getTasks = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    // Add filters to params
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.dueDateFrom) params.append('due_date_from', filters.dueDateFrom);
    if (filters.dueDateTo) params.append('due_date_to', filters.dueDateTo);
    
    const endpoint = `${API_ENDPOINTS.TASKS.LIST}?${params}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data with fields: title, description, priority, category, dueDate, reminderDate
 * @returns {Promise<Object>} Created task object
 */
export const createTask = async (taskData) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.LIST;
    const transformedData = transformToSnake(taskData);
    const response = await apiPost(endpoint, transformedData);
    return transformKeys(response.task || response);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Get task details
 * @param {string} taskId - UUID of the task
 * @returns {Promise<Object>} Task object
 */
export const getTaskDetails = async (taskId) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.DETAILS(taskId);
    const response = await apiGet(endpoint);
    return transformKeys(response.task || response);
  } catch (error) {
    console.error('Error fetching task details:', error);
    throw error;
  }
};

/**
 * Update a task
 * @param {string} taskId - UUID of the task
 * @param {Object} updates - Update object with optional fields: title, description, priority, category, dueDate, reminderDate
 * @returns {Promise<Object>} Updated task object
 */
export const updateTask = async (taskId, updates) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.UPDATE(taskId);
    const transformedData = transformToSnake(updates);
    const response = await apiPut(endpoint, transformedData);
    return transformKeys(response.task || response);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - UUID of the task
 * @returns {Promise<boolean>} Success status
 */
export const deleteTask = async (taskId) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.DELETE(taskId);
    await apiDelete(endpoint);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Mark task as complete
 * @param {string} taskId - UUID of the task
 * @returns {Promise<Object>} Updated task object
 */
export const markTaskComplete = async (taskId) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.COMPLETE(taskId);
    const response = await apiPut(endpoint);
    return transformKeys(response.task || response);
  } catch (error) {
    console.error('Error marking task as complete:', error);
    throw error;
  }
};

/**
 * Set task reminder
 * @param {string} taskId - UUID of the task
 * @param {string} reminderDate - ISO 8601 datetime string
 * @returns {Promise<Object>} Updated task object
 */
export const setTaskReminder = async (taskId, reminderDate) => {
  try {
    const endpoint = API_ENDPOINTS.TASKS.REMIND(taskId);
    const response = await apiPut(endpoint, {
      reminderDate,
    });
    return transformKeys(response.task || response);
  } catch (error) {
    console.error('Error setting task reminder:', error);
    throw error;
  }
};
