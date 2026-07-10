/**
 * API error codes — verbatim contract shared with the backend.
 *
 * Source of truth (mirrors backend app/core/responses.py + exceptions.py).
 * Human-readable reference: ./API_ERROR_CODES.md
 *
 * Every error response is `{ success:false, status_code, message, error:{ code, details } }`.
 * `status_code` in the body always equals the HTTP status. Branch on `error.code`
 * for specific cases and on `status_code` for generic handling.
 *
 * Any new domain code must be added here AND to API_ERROR_CODES.md in the same PR
 * so client and server never drift.
 */

// Generic, status-derived codes emitted by the global exception handlers.
export const GENERIC_ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  // `ERROR` is the ultimate fallback — its HTTP status varies, so it's not mapped.
};

// Domain codes — Subscriptions / checkout.
export const SUBSCRIPTION_ERROR_CODES = {
  PLAN_INVALID: 400,
  BILLING_CYCLE_INVALID: 400,
  PLAN_REQUIRES_CUSTOM_PRICING: 400,
  SUBSCRIPTION_ALREADY_EXISTS: 409,
  SUBSCRIPTION_NOT_FOUND: 404,
  NO_ACTIVE_SUBSCRIPTION: 400,
  SUBSCRIPTION_ALREADY_ACTIVE: 400,
  SUBSCRIPTION_NOT_ACTIVE: 400,
  // Upgrading a subscription created before Stripe backed them. No Stripe
  // subscription exists to proration-invoice, so the only path is cancel +
  // re-subscribe.
  SUBSCRIPTION_NOT_STRIPE_BACKED: 400,
  // 403s when a user isn't eligible to subscribe/upgrade/renew.
  EMAIL_NOT_VERIFIED: 403,
  KYC_NOT_APPROVED: 403,
  SUBSCRIPTION_NOT_APPLICABLE: 403,
};

// Domain codes — Users / access / KYC.
export const USER_ERROR_CODES = {
  ROLE_NOT_ALLOWED: 400, // admin sent a role other than "advisor" to create-user
  KYC_REQUIRED: 403, // resource needs an approved KYC
};

// code → fixed HTTP status (everything except the varies-status `ERROR` fallback).
export const ERROR_CODE_STATUS = {
  ...GENERIC_ERROR_CODES,
  ...SUBSCRIPTION_ERROR_CODES,
  ...USER_ERROR_CODES,
};

// Stable string constants for branching without magic strings / typos.
export const ERROR_CODES = Object.keys(ERROR_CODE_STATUS).reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  { ERROR: 'ERROR' },
);

/** HTTP status for a code, or null when it varies / is unknown. */
export const statusForCode = (code) => ERROR_CODE_STATUS[code] ?? null;
