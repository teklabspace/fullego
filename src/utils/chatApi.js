/**
 * Chat API Service
 * Handles all chat/messaging-related API calls
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
 * Get all conversations for the current user
 * @param {string} status - Filter by status: 'active' | 'archived' | 'all' (default: 'active')
 * @param {number} limit - Number of results (default: 20)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Object>} Conversations list with pagination
 */
export const getConversations = async (status = 'active', limit = 20, offset = 0) => {
  try {
    const params = new URLSearchParams({
      status,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const endpoint = `${API_ENDPOINTS.CHAT.CONVERSATIONS}?${params}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - UUID of the conversation
 * @param {number} limit - Number of messages (default: 50)
 * @param {string|null} before - ISO 8601 timestamp - get messages before this time
 * @param {string|null} after - ISO 8601 timestamp - get messages after this time
 * @returns {Promise<Object>} Messages list with pagination
 */
export const getMessages = async (conversationId, limit = 50, before = null, after = null) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (before) params.append('before', before);
    if (after) params.append('after', after);
    
    const endpoint = `${API_ENDPOINTS.CHAT.CONVERSATION_MESSAGES(conversationId)}?${params}`;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - UUID of the conversation
 * @param {string} content - Message content (max 5000 characters)
 * @param {Array<string>} attachments - Optional array of file IDs
 * @returns {Promise<Object>} Created message object
 */
export const sendMessage = async (conversationId, content, attachments = []) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.SEND_MESSAGE(conversationId);
    const response = await apiPost(endpoint, {
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    return transformKeys(response.message || response);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {string} conversationId - UUID of the conversation
 * @param {Array<string>|null} messageIds - Optional array of message UUIDs. If not provided, marks all as read
 * @returns {Promise<Object>} Update result
 */
export const markAsRead = async (conversationId, messageIds = null) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.MARK_READ(conversationId);
    const body = messageIds ? { messageIds } : {};
    const response = await apiPut(endpoint, body);
    return transformKeys(response);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - UUID of the message
 * @returns {Promise<boolean>} Success status
 */
export const deleteMessage = async (messageId) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.DELETE_MESSAGE(messageId);
    await apiDelete(endpoint);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Get conversation participants
 * @param {string} conversationId - UUID of the conversation
 * @returns {Promise<Array>} Array of participant objects
 */
export const getParticipants = async (conversationId) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.PARTICIPANTS(conversationId);
    const response = await apiGet(endpoint);
    return transformKeys(response.participants || []);
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {Array<string>} participantIds - Array of user UUIDs (min 1, max 10)
 * @param {string|null} subject - Optional subject (max 200 characters)
 * @param {string|null} initialMessage - Optional initial message (max 5000 characters)
 * @returns {Promise<Object>} Created conversation object
 */
export const createConversation = async (participantIds, subject = null, initialMessage = null) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.CONVERSATIONS;
    const body = {
      participantIds,
      ...(subject && { subject }),
      ...(initialMessage && { initialMessage }),
    };
    const response = await apiPost(endpoint, body);
    return transformKeys(response.conversation || response);
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Update conversation (mute, archive, subject)
 * @param {string} conversationId - UUID of the conversation
 * @param {Object} updates - Update object with optional fields: subject, muted, archived
 * @returns {Promise<Object>} Updated conversation object
 */
export const updateConversation = async (conversationId, updates) => {
  try {
    const endpoint = API_ENDPOINTS.CHAT.UPDATE_CONVERSATION(conversationId);
    const response = await apiPut(endpoint, updates);
    return transformKeys(response.conversation || response);
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};
