/**
 * Subscriptions API Service
 * Handles all subscription and billing-related API calls for the Preferences tab
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut } from '@/lib/api/client';

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
// SUBSCRIPTION APIs (from PREFERENCES_TAB_APIS.md)
// ============================================================================

/**
 * The full status set the backend can report. All lowercase, like kyc_status.
 * `incomplete` means the subscription row exists but no money has moved — it
 * grants NO access. Everything else is self-explanatory.
 */
export const SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due',
};

/** Dig the subscription object out of either response shape. */
const unwrapSubscription = (res) =>
  res && typeof res === 'object' && 'subscription' in res ? res.subscription : res;

/**
 * Pull the 3DS/confirmation client_secret out of a subscribe/renew/upgrade
 * response. The backend exposes it at the top level, but has historically also
 * nested it under `data` or `payment_intent`, so check all three. Both casings,
 * because only `data` and `subscription` go through transformKeys.
 */
const pickPaymentIntent = (res) => {
  const top = res || {};
  const data = top.data || {};
  return (
    top.payment_intent || top.paymentIntent ||
    data.payment_intent || data.paymentIntent || {}
  );
};

export const extractClientSecret = (res) => {
  const top = res || {};
  const data = top.data || {};
  const pi = pickPaymentIntent(res);
  return (
    top.client_secret || top.clientSecret ||
    data.client_secret || data.clientSecret ||
    pi.client_secret || pi.clientSecret ||
    null
  );
};

/**
 * PaymentIntent statuses that mean the money has already moved. Confirming an
 * intent in one of these states is not a payment attempt — Stripe rejects the
 * call outright.
 */
export const SETTLED_PAYMENT_INTENT_STATUSES = ['succeeded', 'processing'];

/** Lowercased status of the returned PaymentIntent, or null when there is none. */
export const extractPaymentIntentStatus = (res) => {
  const status = pickPaymentIntent(res).status;
  return status ? String(status).toLowerCase() : null;
};

/** True when the returned intent has already settled server-side. */
export const isPaymentIntentSettled = (res) =>
  SETTLED_PAYMENT_INTENT_STATUSES.includes(extractPaymentIntentStatus(res) || '');

/**
 * Whether Stripe.js still has to confirm a card for this response.
 *
 * The presence of a client_secret does NOT mean "confirm me". `PUT /subscriptions/upgrade`
 * bills the proration with Stripe's `always_invoice`, so Stripe finalizes the invoice and
 * charges the customer's saved default card server-side before we ever get a reply. The
 * intent comes back already `succeeded` — with its client_secret still populated, and
 * `requires_action: false`. Confirming it anyway is rejected by Stripe, and that rejection
 * ('A processing error occurred.') used to render as a payment failure above a live Pay
 * button, for money that had already left the customer's account.
 *
 * So: read the intent's status, not whether a secret happens to be present.
 */
export const needsCardConfirmation = (res) => {
  if (!extractClientSecret(res)) return false;

  const status = extractPaymentIntentStatus(res);
  if (status) return !SETTLED_PAYMENT_INTENT_STATUSES.includes(status);

  // No status on the intent (older/edge response shapes): fall back to the explicit
  // flag, and only assume confirmation is needed when that is absent too.
  const top = res || {};
  const data = top.data || {};
  const flag =
    top.requiresAction ?? top.requires_action ??
    data.requiresAction ?? data.requires_action;
  return flag === undefined || flag === null ? true : Boolean(flag);
};

/**
 * Block until Stripe's webhook has landed and the subscription is really live.
 *
 * Purchase, renewal and upgrade all return `incomplete` now: confirming the card
 * with Stripe.js only proves the charge cleared, not that our backend knows it.
 * The webhook lands a beat later. Anything that reads the subscription in that
 * window — the dashboard's SecureRoute gate above all — sees `incomplete`, reads
 * it as "no plan", and bounces a paying user back to /select-plan, where they can
 * cheerfully buy the same plan a second time.
 *
 * So: never navigate, never toast success, until this resolves truthy.
 *
 * @param {(sub) => boolean} [isSettled] - override the "we're done" test. Upgrade
 *        passes one that waits for plan_id to flip, not just for `active`.
 * @returns {Promise<object|null>} the settled subscription, or null on timeout.
 *          A timeout is NOT a failure — the money moved. Say so in the UI.
 */
export const waitForActiveSubscription = async ({
  timeoutMs = 20000,
  intervalMs = 1500,
  isSettled = (sub) => String(sub?.status || '').toLowerCase() === SUBSCRIPTION_STATUS.ACTIVE,
} = {}) => {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      // Ask the backend to reconcile against Stripe on each poll. Without it this loop
      // can only ever observe what the webhook has already written, and an upgrade whose
      // webhook never arrives spins until the deadline every single time.
      const sub = unwrapSubscription(await getCurrentSubscription({ sync: true }));
      if (sub && isSettled(sub)) return sub;
    } catch {
      // A transient read failure mid-poll is not a payment failure. Keep trying
      // until the deadline; the caller's timeout copy covers the rest.
    }
    if (Date.now() >= deadline) return null;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
};

/**
 * Get Available Plans
 * GET /api/v1/subscriptions/plans
 */
export const getAvailablePlans = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.GET_PLANS;
  const response = await apiGet(endpoint);

  if (response.plans) {
    response.plans = transformKeys(response.plans);
  }
  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Current Subscription
 * GET /api/v1/subscriptions
 */
export const getCurrentSubscription = async ({ sync = false } = {}) => {
  // `sync` asks the backend to re-read Stripe before answering. Only the post-payment
  // poll sets it: an upgrade sits ACTIVE on the old plan until its webhook lands, so
  // that poll needs the round-trip, while routine dashboard reads must not pay for one.
  const endpoint = sync
    ? `${API_ENDPOINTS.SUBSCRIPTIONS.GET_CURRENT}?sync=true`
    : API_ENDPOINTS.SUBSCRIPTIONS.GET_CURRENT;
  const response = await apiGet(endpoint);

  // The client unwraps the envelope, so `response` is the capability wrapper:
  //   { subscription: {...}|null, subscription_required, can_subscribe,
  //     can_cancel, can_upgrade, reason }
  // camelCase the whole thing (incl. the nested subscription) for the UI.
  return response ? transformKeys(response) : response;
};

/**
 * Create Subscription
 * POST /api/v1/subscriptions
 *
 * Returns status "incomplete" plus a client_secret. The user does NOT have the
 * plan yet — confirm the payment with Stripe.js, then waitForActiveSubscription().
 */
export const createSubscription = async (subscriptionData) => {
  const transformedData = transformToSnake(subscriptionData);
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.CREATE;
  const response = await apiPost(endpoint, transformedData);

  // camelCase the whole envelope, not just `data` — requires_action,
  // client_secret and pending_plan_id all live at the top level now.
  return response ? transformKeys(response) : response;
};

/**
 * Cancel Subscription
 * POST /api/v1/subscriptions/cancel
 */
export const cancelSubscription = async ({ cancelImmediately = false } = {}) => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.CANCEL;
  // Default: cancel at period end (stays active until current_period_end).
  // Pass { cancelImmediately: true } to end the subscription right away.
  const body = cancelImmediately ? { cancel_immediately: true } : {};
  const response = await apiPost(endpoint, body);

  if (response && response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Renew Subscription
 * POST /api/v1/subscriptions/renew
 */
export const renewSubscription = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.RENEW;
  const response = await apiPost(endpoint);

  // Renewal is now payment-gated like purchase: the response carries
  // requires_action + client_secret and the subscription reads "incomplete".
  return response ? transformKeys(response) : response;
};

/**
 * Upgrade/Downgrade Subscription
 * PUT /api/v1/subscriptions/upgrade
 * 
 * @param {Object} updateData - Update data
 * @param {string} updateData.planId - New plan ID (optional)
 * @param {string} updateData.billingCycle - New billing cycle: 'monthly' or 'annual' (optional)
 *
 * WARNING: the returned `subscription.planId` is still the user's OLD plan. The
 * new plan isn't written locally until Stripe's proration invoice is paid and the
 * webhook syncs it. Read `pendingPlanId` for what they're moving to, and never
 * render the new plan from `subscription.planId` after calling this.
 *
 * Stripe computes the proration, so the amount charged may differ from any figure
 * we calculated locally. Stripe's is correct.
 */
export const updateSubscriptionPlan = async (updateData) => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE;
  const body = {
    plan_id: updateData.planId,
    billing_cycle: updateData.billingCycle,
  };
  const response = await apiPut(endpoint, body);

  return response ? transformKeys(response) : response;
};

/**
 * Get Subscription History
 * GET /api/v1/subscriptions/history
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of records (default: 20, max: 100)
 * @param {number} params.offset - Pagination offset (default: 0)
 */
export const getSubscriptionHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
  
  const endpoint = `${API_ENDPOINTS.SUBSCRIPTIONS.HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Subscription Permissions
 * GET /api/v1/subscriptions/permissions
 */
export const getSubscriptionPermissions = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.PERMISSIONS;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

/**
 * Get Usage Limits
 * GET /api/v1/subscriptions/limits
 */
export const getSubscriptionLimits = async () => {
  const endpoint = API_ENDPOINTS.SUBSCRIPTIONS.LIMITS;
  const response = await apiGet(endpoint);

  if (response.data) {
    response.data = transformKeys(response.data);
  }

  return response;
};

