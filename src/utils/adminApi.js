/**
 * Admin API Service
 * Handles user management, subscriptions, and verification endpoints.
 * All endpoints require role: "admin" — backend returns 403 otherwise.
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPatch } from '@/lib/api/client';

const buildQuery = (params) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  if (!Object.keys(clean).length) return '';
  return `?${new URLSearchParams(clean)}`;
};

// ── Users ──────────────────────────────────────────────────────────────────

export const listAdminUsers = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_USERS}${buildQuery(params)}`);

export const getAdminUser = (userId) =>
  apiGet(API_ENDPOINTS.ADMIN.GET_USER(userId));

export const updateUserRole = (userId, role) =>
  apiPatch(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId), { role });

export const deactivateUser = (userId) =>
  apiPatch(API_ENDPOINTS.ADMIN.DEACTIVATE_USER(userId), {});

export const activateUser = (userId) =>
  apiPatch(API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId), {});

// ── Subscriptions ──────────────────────────────────────────────────────────

export const listAdminSubscriptions = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_SUBSCRIPTIONS}${buildQuery(params)}`);

export const cancelSubscription = (id) =>
  apiPatch(API_ENDPOINTS.ADMIN.CANCEL_SUBSCRIPTION(id), {});

export const updateSubscriptionPlan = (id, plan, reason = '') =>
  apiPatch(API_ENDPOINTS.ADMIN.UPDATE_SUBSCRIPTION_PLAN(id), { plan, ...(reason ? { reason } : {}) });

// ── Verifications ──────────────────────────────────────────────────────────

export const listAdminVerifications = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_VERIFICATIONS}${buildQuery(params)}`);

export const approveVerification = (type, id) =>
  apiPost(type === 'kyc'
    ? API_ENDPOINTS.ADMIN.APPROVE_KYC(id)
    : API_ENDPOINTS.ADMIN.APPROVE_KYB(id),
    null
  );

export const rejectVerification = (type, id, reason) =>
  apiPost(type === 'kyc'
    ? API_ENDPOINTS.ADMIN.REJECT_KYC(id)
    : API_ENDPOINTS.ADMIN.REJECT_KYB(id),
    { reason }
  );
