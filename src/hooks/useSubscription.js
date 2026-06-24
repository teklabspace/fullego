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

    if (cur.status === 'fulfilled') setCurrent(pick(cur.value, 'subscription'));
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
      const payload = (res && (res.data ?? res)) || {};
      const needsAction =
        payload.requiresAction ||
        payload.requires_action ||
        payload.clientSecret ||
        payload.client_secret;
      if (needsAction) {
        toast.info('Action required to complete payment. Please check your billing details.');
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

  const cancel = () =>
    runMutation(() => cancelSubscription(), 'Subscription cancelled', 'Failed to cancel subscription');

  const renew = () =>
    runMutation(() => renewSubscription(), 'Subscription renewed', 'Failed to renew subscription');

  return {
    current,
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
