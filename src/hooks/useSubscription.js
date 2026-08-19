'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getCurrentSubscription,
  getAvailablePlans,
  getSubscriptionLimits,
  getSubscriptionPermissions,
  getSubscriptionHistory,
  createSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  renewSubscription,
  waitForActiveSubscription,
  extractClientSecret,
  needsCardConfirmation,
  isPaymentIntentSettled,
} from '@/utils/subscriptionsApi';
import { clearSubscriptionCache } from '@/utils/onboarding';
import { getPaymentMethods } from '@/utils/paymentsApi';
import { getStripe } from '@/lib/stripe';

// Resolve the user's saved default card (Stripe pm_… id). Subscription
// PaymentIntents created server-side carry no payment method, so confirming
// without one fails with "A payment method of type card was expected…".
const getSavedPaymentMethodId = async () => {
  try {
    const res = await getPaymentMethods();
    const list = Array.isArray(res?.data) ? res.data : [];
    const preferred = list.find(m => m.isDefault || m.is_default) || list[0];
    return preferred?.id || null;
  } catch {
    return null;
  }
};

// Backend response shapes are inconsistent; prefer `data`, then a named key,
// then the raw response, finally the provided fallback.
const pick = (res, key, fallback = null) => {
  if (!res) return fallback;
  if (res.data !== undefined && res.data !== null) return res.data;
  if (key && res[key] !== undefined && res[key] !== null) return res[key];
  return fallback;
};

export function useSubscription() {
  const [current, setCurrent] = useState(null);
  // Capability flags + reason from GET /subscriptions' wrapper; drive the
  // Subscribe / Cancel / Upgrade buttons off these rather than guessing.
  const [capabilities, setCapabilities] = useState(null);
  const [plans, setPlans] = useState([]);
  const [limits, setLimits] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cur, pl, lim, perm, hist] = await Promise.allSettled([
      getCurrentSubscription(),
      getAvailablePlans(),
      getSubscriptionLimits(),
      getSubscriptionPermissions(),
      getSubscriptionHistory(),
    ]);

    if (cur.status === 'fulfilled') {
      // New shape: a wrapper carrying the subscription + capability flags.
      const w = cur.value && typeof cur.value === 'object' ? (cur.value.data ?? cur.value) : {};
      setCurrent(w?.subscription ?? null);
      setCapabilities({
        subscriptionRequired: w?.subscriptionRequired ?? w?.subscription_required ?? true,
        canSubscribe: w?.canSubscribe ?? w?.can_subscribe ?? false,
        canCancel: w?.canCancel ?? w?.can_cancel ?? false,
        canUpgrade: w?.canUpgrade ?? w?.can_upgrade ?? false,
        reason: w?.reason ?? null,
      });
    }
    if (pl.status === 'fulfilled') {
      const p = pick(pl.value, 'plans', []);
      setPlans(Array.isArray(p) ? p : []);
    }
    if (lim.status === 'fulfilled') setLimits(pick(lim.value, 'limits'));
    if (perm.status === 'fulfilled') setPermissions(pick(perm.value, 'permissions'));
    if (hist.status === 'fulfilled') {
      const h = pick(hist.value, 'history', []);
      setHistory(Array.isArray(h) ? h : []);
    }

    if (cur.status === 'rejected' && pl.status === 'rejected') {
      console.warn('Subscription API unavailable; using fallback plan data.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runMutation = async (fn, successMsg, failMsg) => {
    try {
      const res = await fn();
      // A client_secret is not a mandate to confirm. `always_invoice` upgrades come
      // back already charged against the saved card (`succeeded`), secret included;
      // confirming those is refused by Stripe and the refusal reads as a decline for
      // money already taken. Gate on the intent's status instead.
      const clientSecret = extractClientSecret(res);
      const mustConfirm = needsCardConfirmation(res);
      const alreadyPaid = isPaymentIntentSettled(res);

      if (mustConfirm && !(await getStripe())) {
        toast.info('Additional authentication is required to complete payment.');
      } else if (mustConfirm || alreadyPaid) {
        if (mustConfirm) {
          const stripe = await getStripe();
          // Confirm with the user's saved card. The PaymentIntent arrives with
          // no payment method attached, so omitting one fails with Stripe's
          // "a payment method of type card was expected" error.
          const savedPm = await getSavedPaymentMethodId();
          const { error } = await stripe.confirmCardPayment(
            clientSecret,
            savedPm ? { payment_method: savedPm } : undefined
          );
          if (error) {
            const noCard =
              !savedPm && /payment[_ ]method/i.test(error.message || '');
            toast.error(
              noCard
                ? 'No saved card found. Add a payment method in Settings → Billing, then try again.'
                : error.message || 'Payment authentication failed.'
            );
            await load();
            return false;
          }
        }
        // A cleared card is not an active plan. Purchase, renewal and upgrade
        // all stay `incomplete` until Stripe's webhook reaches our backend, so
        // announcing success here would be a lie the UI immediately contradicts.
        const settled = await waitForActiveSubscription();
        await load();
        if (!settled) {
          toast.info('Payment received — we’re still activating your plan. Refresh in a moment.');
          return true;
        }
        toast.success(successMsg);
        clearSubscriptionCache();
        return true;
      } else {
        toast.success(successMsg);
      }
      await load();
      clearSubscriptionCache();
      return true;
    } catch (err) {
      toast.error(err?.message || failMsg);
      return false;
    }
  };

  const subscribe = (planId, billingCycle) =>
    runMutation(
      () => createSubscription({ planId, billingCycle }),
      'Subscribed successfully',
      'Failed to subscribe',
    );

  const changePlan = (planId, billingCycle) =>
    runMutation(
      () => updateSubscriptionPlan({ planId, billingCycle }),
      'Plan updated',
      'Failed to update plan',
    );

  // Defaults to cancel-at-period-end; pass { cancelImmediately: true } to end now.
  const cancel = (opts) =>
    runMutation(() => cancelSubscription(opts), 'Subscription cancelled', 'Failed to cancel subscription');

  const renew = () =>
    runMutation(() => renewSubscription(), 'Subscription renewed', 'Failed to renew subscription');

  return {
    current,
    capabilities,
    plans,
    limits,
    permissions,
    history,
    loading,
    error,
    refresh: load,
    subscribe,
    changePlan,
    cancel,
    renew,
  };
}
