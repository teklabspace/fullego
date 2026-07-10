/**
 * Onboarding gate — the single place that decides where a user must go next based
 * on their account state. The required order is:
 *
 *   email verified  →  KYC/KYB verified  →  active subscription  →  dashboard
 *
 * Staff (admin/advisor) skip the KYC and subscription gates. Used by the login
 * redirect and by SecureRoute so the rules live in one place.
 */
import { getCurrentSubscription } from '@/utils/subscriptionsApi';

// In-memory cache so we don't hit GET /subscriptions on every dashboard
// navigation. Reset it (clearSubscriptionCache) after subscribing/cancelling.
let subCache = null;

const hasPendingPlan = () => {
  try {
    return !!localStorage.getItem('pendingPlan');
  } catch {
    return false;
  }
};

/**
 * Whether the user has a usable subscription, per the backend contract:
 *   GET /subscriptions always returns 200. Body is `null` (no subscription),
 *   the subscription object directly (investor with one), or
 *   `{ subscription: null, ... }` (staff). status enum:
 *   "incomplete" | "active" | "past_due" | "expired" | "cancelled".
 *
 * We grant access for "active" and "past_due" (so a payment-retry user can still
 * reach settings to fix billing instead of being pushed to re-subscribe, which
 * would overwrite their subscription and double-charge). Fails open on unexpected
 * errors so a transient hiccup never traps the user in a redirect loop.
 *
 * "incomplete" means a subscription row exists but no money has moved yet, so it
 * grants nothing. That's correct — but it also means anything that navigates to a
 * gated route straight after a successful card charge will race Stripe's webhook
 * and get bounced. Callers must waitForActiveSubscription() before navigating.
 */
export async function hasActiveSubscription({ force = false } = {}) {
  if (!force && subCache !== null) return subCache;
  try {
    const res = await getCurrentSubscription();
    // Unwrap the staff shape ({ subscription: null }); otherwise the body IS the
    // subscription object (or null when there's none).
    const sub = res && typeof res === 'object' && 'subscription' in res ? res.subscription : res;

    let result = false;
    if (sub && typeof sub === 'object') {
      const status = String(sub.status || '').toLowerCase();
      result = status === 'active' || status === 'past_due';
    }
    subCache = result;
    return result;
  } catch {
    return true; // fail open — don't lock the user out on a transient error
  }
}

/** Call after a successful subscribe/cancel so the next check re-fetches. */
export function clearSubscriptionCache() {
  subCache = null;
}

/**
 * Returns the route the user must be sent to, or null if onboarding is complete
 * (free to enter the dashboard).
 *
 * @param {object|null} user - the stored/login user object
 */
export async function resolveOnboardingRoute(user) {
  if (!user) return '/login';

  if (!user.is_email_verified) return '/signup';

  const role = user.role;

  // Admins: no KYC, no subscription.
  if (role === 'admin') return null;

  // Advisors: must complete KYC, but never need a subscription.
  if (role === 'advisor') {
    if (!user.is_kyc_verified) return '/choose-profile';
    return null;
  }

  // Investors (and any other role): KYC, then an active subscription.
  if (!user.is_kyc_verified) return '/choose-profile';

  const subscribed = await hasActiveSubscription();
  if (!subscribed) {
    // If they already picked a plan (e.g. came from the marketing page), take
    // them straight to pay; otherwise to the in-app plan picker.
    return hasPendingPlan() ? '/checkout' : '/select-plan';
  }

  return null;
}
