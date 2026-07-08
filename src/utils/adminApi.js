/**
 * Admin API Service
 * Handles user management, subscriptions, and verification endpoints.
 * All endpoints require role: "admin" — backend returns 403 otherwise.
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';

const buildQuery = (params) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  if (!Object.keys(clean).length) return '';
  return `?${new URLSearchParams(clean)}`;
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const getAdminDashboard = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.DASHBOARD}${buildQuery(params)}`);

// ── Users ──────────────────────────────────────────────────────────────────

export const listAdminUsers = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_USERS}${buildQuery(params)}`);

export const getAdminUser = (userId) =>
  apiGet(API_ENDPOINTS.ADMIN.GET_USER(userId));

export const updateUserRole = (userId, role) =>
  apiPatch(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId), { role });

// Create an advisor. The backend always assigns role "advisor" (do NOT send a
// role) and pre-verifies the email. Password modes:
//  - password provided → admin sets it; advisor can log in immediately (no invite).
//  - password omitted   → advisor is emailed a set-password invite link.
export const createAdvisor = ({ email, firstName, lastName, phone, password } = {}) =>
  apiPost(API_ENDPOINTS.ADMIN.CREATE_USER, {
    email,
    first_name: firstName,
    last_name: lastName,
    ...(phone ? { phone } : {}),
    ...(password ? { password } : {}),
  });

// Full KYC review detail for one user: status, capture_status, extracted
// fields, Persona checks, and documents (each with a short-lived signed
// view_url, ~600s — re-call this to refresh expired links).
export const getUserKyc = (userId) =>
  apiGet(API_ENDPOINTS.ADMIN.GET_USER_KYC(userId));

// Manually approve a user's KYC (fallback when Persona doesn't succeed). Admin
// only; rejected for admin targets / already-approved KYC.
export const approveUserKyc = (userId) =>
  apiPost(API_ENDPOINTS.ADMIN.APPROVE_USER_KYC(userId), {});

// Reject a user's KYC with a reason (required) — notifies the user.
export const rejectUserKyc = (userId, reason) =>
  apiPost(API_ENDPOINTS.ADMIN.REJECT_USER_KYC(userId), { reason });

// Re-pull documents from Persona when capture_status is "failed". Returns
// capture_status: "pending" — poll getUserKyc to see it flip to "captured".
export const recaptureUserKyc = (userId) =>
  apiPost(API_ENDPOINTS.ADMIN.RECAPTURE_USER_KYC(userId), {});

// ── Advisor ↔ client assignment ──────────────────────────────────────────────
// Assign an investor to an advisor (auto-creates their chat + notifies both).
export const assignAdvisorClient = (advisorId, investorId) =>
  apiPost(API_ENDPOINTS.ADMIN.ADVISOR_CLIENTS(advisorId), { investor_id: investorId });

export const listAdvisorClients = (advisorId) =>
  apiGet(API_ENDPOINTS.ADMIN.ADVISOR_CLIENTS(advisorId));

export const unassignAdvisorClient = (advisorId, investorId) =>
  apiDelete(API_ENDPOINTS.ADMIN.UNASSIGN_ADVISOR_CLIENT(advisorId, investorId));

export const deactivateUser = (userId) =>
  apiPatch(API_ENDPOINTS.ADMIN.DEACTIVATE_USER(userId), {});

export const activateUser = (userId) =>
  apiPatch(API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId), {});

// ── Subscriptions ──────────────────────────────────────────────────────────

export const listAdminSubscriptions = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_SUBSCRIPTIONS}${buildQuery(params)}`);

export const cancelSubscription = (id) =>
  apiPatch(API_ENDPOINTS.ADMIN.CANCEL_SUBSCRIPTION(id), {});

// Change a user's subscription to a tier (starter | pro | premium) + billing
// cycle. Sends both `plan_id` and `plan` (back-compat) plus `billing_cycle` so
// the backend can apply the change to the user's live subscription.
export const updateSubscriptionPlan = (id, { planId, billingCycle, reason } = {}) =>
  apiPatch(API_ENDPOINTS.ADMIN.UPDATE_SUBSCRIPTION_PLAN(id), {
    plan_id: planId,
    plan: planId,
    ...(billingCycle ? { billing_cycle: billingCycle } : {}),
    ...(reason ? { reason } : {}),
  });

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

// ── Marketplace Escrow (oversight table) ─────────────────────────────────────

/**
 * List all escrows for the admin oversight table.
 * @param {object} params - { statusFilter?, page?, limit? }
 *   statusFilter: pending|funded|released|refunded|disputed (optional).
 * Response payload: { items, total, page, limit, pages }.
 */
export const listEscrows = ({ statusFilter, page, limit } = {}) =>
  apiGet(
    `${API_ENDPOINTS.ADMIN.ESCROW_LIST}${buildQuery({
      status_filter: statusFilter,
      page,
      limit,
    })}`
  );

/** Single escrow detail (same item shape as the list, unwrapped). */
export const getEscrowAdmin = (id) =>
  apiGet(API_ENDPOINTS.ADMIN.ESCROW_DETAIL(id));

/**
 * Admin force-release a (non-disputed) escrow's funds to the seller.
 * Pending backend deployment — see the backend request note.
 * @param {string} id - escrow id
 * @param {string} [reason] - optional admin note
 */
export const adminReleaseEscrow = (id, reason = '') =>
  apiPost(API_ENDPOINTS.ADMIN.ESCROW_RELEASE(id), reason ? { reason } : {});

/**
 * Admin force-refund a (non-disputed) escrow to the buyer (Stripe refund).
 * Pending backend deployment — see the backend request note.
 * @param {string} id - escrow id
 * @param {string} [reason] - optional admin note
 */
export const adminRefundEscrow = (id, reason = '') =>
  apiPost(API_ENDPOINTS.ADMIN.ESCROW_REFUND(id), reason ? { reason } : {});

// ── Marketplace Escrow Disputes ──────────────────────────────────────────────

export const listDisputes = (params = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.LIST_DISPUTES}${buildQuery(params)}`);

export const getDispute = (id) =>
  apiGet(API_ENDPOINTS.ADMIN.GET_DISPUTE(id));

/**
 * Resolve a marketplace escrow dispute.
 * @param {string} id - escrow id (the dispute is keyed by its escrow id)
 * @param {'release'|'refund'} resolution - release funds to seller or refund the buyer
 * @param {string} [reason] - admin resolution reason (spec body field is `reason`)
 */
export const resolveDispute = (id, resolution, reason = '') =>
  apiPost(API_ENDPOINTS.ADMIN.RESOLVE_DISPUTE(id), {
    resolution,
    ...(reason ? { reason } : {}),
  });
