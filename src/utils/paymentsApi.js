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
 */
export const getPaymentHistory = async () => {
  const endpoint = API_ENDPOINTS.PAYMENTS.HISTORY;
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
 */
export const addPaymentMethod = async (paymentMethodId) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.ADD_PAYMENT_METHOD;
  const response = await apiPost(endpoint, { payment_method_id: paymentMethodId });
  
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
 */
export const createInvoice = async (invoiceData) => {
  const queryParams = new URLSearchParams();
  if (invoiceData.amount) queryParams.append('amount', invoiceData.amount);
  if (invoiceData.currency) queryParams.append('currency', invoiceData.currency);
  if (invoiceData.description) queryParams.append('description', invoiceData.description);
  if (invoiceData.dueDate) queryParams.append('due_date', invoiceData.dueDate);
  
  const endpoint = `${API_ENDPOINTS.PAYMENTS.CREATE_INVOICE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * List Invoices
 * GET /api/v1/payments/invoices
 */
export const listInvoices = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  
  const endpoint = `${API_ENDPOINTS.PAYMENTS.LIST_INVOICES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
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
 */
export const payInvoice = async (invoiceId) => {
  const endpoint = API_ENDPOINTS.PAYMENTS.PAY_INVOICE(invoiceId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
