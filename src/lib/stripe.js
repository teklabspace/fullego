/**
 * Stripe.js loader (singleton)
 *
 * Loads Stripe with the publishable key from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
 * Used for collecting payment methods (card Elements) and for completing 3DS
 * (`requires_action` / `client_secret`) on subscribe / upgrade flows.
 */
import { loadStripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise;

/**
 * Returns the shared Stripe instance promise, or a promise resolving to null
 * when no publishable key is configured (so callers can degrade gracefully).
 */
export const getStripe = () => {
  if (!PUBLISHABLE_KEY) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(PUBLISHABLE_KEY);
  return stripePromise;
};

/** Whether Stripe.js has a publishable key and can be used. */
export const isStripeConfigured = () => Boolean(PUBLISHABLE_KEY);
