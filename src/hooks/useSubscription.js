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
} from '@/utils/subscriptionsApi';
import { getStripe } from '@/lib/stripe';

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
      // `requires_action` + `client_secret` are returned at the top level for 3DS
      // (and may also appear nested under `data`). Cover both shapes.
      const payload = (res && (res.data ?? res)) || {};
      const top = res || {};
      const needsAction =
        top.requiresAction || top.requires_action ||
        payload.requiresAction || payload.requires_action;
      const clientSecret =
        top.clientSecret || top.client_secret ||
        payload.clientSecret || payload.client_secret;

      if (needsAction || clientSecret) {
        const stripe = await getStripe();
        if (stripe && clientSecret) {
          // Complete 3DS / SCA against the PaymentIntent already attached to the
          // user's payment method — no card re-entry required.
          const { error } = await stripe.confirmCardPayment(clientSecret);
          if (error) {
            toast.error(error.message || 'Payment authentication failed.');
            await load();
            return false;
          }
          toast.success(successMsg);
        } else {
          toast.info('Additional authentication is required to complete payment.');
        }
      } else {
        toast.success(successMsg);
      }
      await load();
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
