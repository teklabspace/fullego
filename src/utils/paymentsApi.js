/**
 * Payments API Service
 * Handles all payment-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiDelete } from '@/lib/api/client';

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
// PAYMENT PROCESSING APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Payment Intent
 * POST /api/v1/payments/create-intent
 */
export const createPaymentIntent = async (intentData) => {
  const transformedData = transformToSnake(intentData);
  const endpoint = API_ENDPOINTS.PAYMENTS.CREATE_INTENT;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Handle Stripe Webhook Events
 * POST /api/v1/payments/webhook
 */
export const handlePaymentWebhook = async (webhookData) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.WEBHOOK;
  const response = await apiPost(endpoint, webhookData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Payment History
 * GET /api/v1/payments/history
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of payments (default: 20, max: 100)
 * @param {number} params.offset - Pagination offset (default: 0)
 * @param {string} params.status - Filter by status: 'completed', 'pending', 'failed', 'refunded' (optional)
 */
export const getPaymentHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.status) queryParams.append('status', params.status);
  
  const endpoint = `${API_ENDPOINTS.PAYMENTS.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Payment Statistics
 * GET /api/v1/payments/stats
 */
export const getPaymentStats = async () => {
  const endpoint = API_ENDPOINTS.PAYMENTS.STATS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// PAYMENT METHODS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Get Saved Payment Methods
 * GET /api/v1/payments/payment-methods
 */
export const getPaymentMethods = async () => {
  const endpoint = API_ENDPOINTS.PAYMENTS.GET_PAYMENT_METHODS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Add Payment Method
 * POST /api/v1/payments/payment-methods
 * 
 * @param {Object} paymentMethodData - Payment method data
 * @param {string} paymentMethodData.paymentMethodId - Stripe payment method ID
 * @param {boolean} paymentMethodData.isDefault - Set as default payment method (optional)
 */
export const addPaymentMethod = async (paymentMethodData) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.ADD_PAYMENT_METHOD;
  const body = transformToSnake({
    payment_method_id: paymentMethodData.paymentMethodId,
    is_default: paymentMethodData.isDefault || false
  });
  const response = await apiPost(endpoint, body);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Remove Payment Method
 * DELETE /api/v1/payments/payment-methods/{method_id}
 */
export const removePaymentMethod = async (methodId) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.DELETE_PAYMENT_METHOD(methodId);
  return await apiDelete(endpoint);
};

// ============================================================================
// REFUNDS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Refund for Payment
 * POST /api/v1/payments/payments/{payment_id}/refund
 */
export const createRefund = async (paymentId, refundData) => {
  const transformedData = transformToSnake(refundData);
  const endpoint = API_ENDPOINTS.PAYMENTS.CREATE_REFUND(paymentId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Refunds for Payment
 * GET /api/v1/payments/payments/{payment_id}/refunds
 */
export const getRefunds = async (paymentId) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.GET_REFUNDS(paymentId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// INVOICES APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Invoice
 * POST /api/v1/payments/invoices
 * 
 * @param {Object} invoiceData - Invoice data
 * @param {number} invoiceData.amount - Invoice amount (required)
 * @param {string} invoiceData.currency - Currency code (default: "USD")
 * @param {string} invoiceData.description - Invoice description (required)
 * @param {string} invoiceData.dueDate - Due date in YYYY-MM-DD format (required)
 * @param {string} invoiceData.customerEmail - Customer email (optional)
 * @param {Array} invoiceData.lineItems - Line items array (optional)
 * @param {Object} invoiceData.metadata - Additional metadata (optional)
 */
export const createInvoice = async (invoiceData) => {
  const transformedData = transformToSnake({
    amount: invoiceData.amount,
    currency: invoiceData.currency || 'USD',
    description: invoiceData.description,
    due_date: invoiceData.dueDate,
    customer_email: invoiceData.customerEmail,
    line_items: invoiceData.lineItems,
    metadata: invoiceData.metadata
  });
  
  const endpoint = API_ENDPOINTS.PAYMENTS.CREATE_INVOICE;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.invoice) {
    response.invoice = transformKeys(response.invoice);
  }
  
  return response;
};

/**
 * List Invoices
 * GET /api/v1/payments/invoices
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.statusFilter - Filter by status: 'paid', 'unpaid', 'overdue' (optional)
 * @param {number} params.limit - Number of invoices (default: 20, max: 100) (optional)
 * @param {number} params.offset - Pagination offset (default: 0) (optional)
 */
export const listInvoices = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const endpoint = `${API_ENDPOINTS.PAYMENTS.LIST_INVOICES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
 * Get Invoice Details
 * GET /api/v1/payments/invoices/{invoice_id}
 */
export const getInvoice = async (invoiceId) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.GET_INVOICE(invoiceId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Pay Invoice
 * POST /api/v1/payments/invoices/{invoice_id}/pay
 * 
 * @param {string} invoiceId - Invoice ID
 * @param {string} paymentMethodId - Optional: Payment method ID to use (defaults to default payment method)
 */
export const payInvoice = async (invoiceId, paymentMethodId = null) => {
  const body = paymentMethodId ? transformToSnake({ payment_method_id: paymentMethodId }) : {};
  const endpoint = API_ENDPOINTS.PAYMENTS.PAY_INVOICE(invoiceId);
  const response = await apiPost(endpoint, body);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.invoice) {
    response.invoice = transformKeys(response.invoice);
  }
  
  return response;
};
