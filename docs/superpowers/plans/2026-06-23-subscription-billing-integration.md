# Subscription Billing Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all 7 unused `subscriptionsApi` functions into the Payment & Billing tab at `/dashboard/settings`, with no new routes.

**Architecture:** A single `useSubscription` hook loads all subscription data and exposes mutations (`subscribe`/`changePlan`/`cancel`/`renew`) + `refresh()`. `PaymentBilling.jsx` becomes a thin container that owns a shared confirmation-modal state and composes small presentational subcomponents. Mutations call utils directly; the backend bills the saved payment method (no Stripe UI).

**Tech Stack:** Next.js 15 (App Router, static export), React 19, Tailwind CSS 4, Framer Motion, react-toastify. JavaScript only (`.js`/`.jsx`). Path alias `@/` → `src/`.

## Global Constraints

- **JavaScript only** — `.js`/`.jsx`, no TypeScript.
- **No new routes/pages.** Everything renders inside the existing Payment & Billing tab.
- **No Stripe SDK / payment-intent / card UI.** Mutations call the util directly; backend bills the saved method. If a response signals payment is required (`client_secret`/`requires_action`), show an informational toast only.
- **Data layer untouched:** do not modify `src/utils/subscriptionsApi.js`, `src/config/api.js`, or `src/lib/api/client.js`. Components consume the existing util functions.
- **Case mapping** already happens in the util layer (snake_case ⇄ camelCase); still read defensively (`x.camelCase ?? x.snake_case`) because backend response shapes are inconsistent.
- **Toasts** via `react-toastify` `toast.success` / `toast.error` (established pattern in `src/app/dashboard/admin/subscriptions/page.js`).
- **Theming** keyed off `isDarkMode` prop; gold accent `#F1CB68`; rounded `2xl` cards; skeleton-pulse loaders — match existing `PaymentBilling.jsx`.
- **No test runner exists.** Verification per task = `npm run lint` (no new errors) + `npm run build` (compiles) + manual browser check. There is no Jest/Vitest; do not author unit tests.
- **Shared Modal:** `src/components/ui/Modal.jsx` with props `{ isOpen, setIsOpen, children, maxWidth }`.

---

## File Structure

- Create `src/hooks/useSubscription.js` — data + mutations for the tab.
- Create `src/components/settings/PlanChangeModal.jsx` — shared confirm modal for all 5 actions.
- Create `src/components/settings/CurrentPlanCard.jsx` — current plan + Cancel/Renew.
- Create `src/components/settings/PlanSelector.jsx` — plan grid + Subscribe/Upgrade/Downgrade.
- Create `src/components/settings/PlanFeatures.jsx` — current plan's unlocked features.
- Create `src/components/settings/SubscriptionHistory.jsx` — plan-change history table.
- Modify `src/components/settings/PaymentBilling.jsx` — compose all of the above; own modal state; keep existing payment-methods + payment-history blocks.

---

### Task 1: `useSubscription` hook

**Files:**
- Create: `src/hooks/useSubscription.js`

**Interfaces:**
- Consumes: existing exports from `@/utils/subscriptionsApi` — `getCurrentSubscription`, `getAvailablePlans`, `getSubscriptionLimits`, `getSubscriptionPermissions`, `getSubscriptionHistory`, `createSubscription`, `updateSubscriptionPlan`, `cancelSubscription`, `renewSubscription`.
- Produces: `useSubscription()` returning `{ current, plans, limits, permissions, history, loading, error, refresh, subscribe(planId, billingCycle), changePlan(planId, billingCycle), cancel(), renew() }`. Mutations return `Promise<boolean>` (true on success). `current` is an object or `null`; `plans` and `history` are arrays.

- [ ] **Step 1: Create the hook file**

```javascript
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
      setError('Failed to load subscription data.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runMutation = async (fn, successMsg, failMsg) => {
    try {
      await fn();
      toast.success(successMsg);
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
```

- [ ] **Step 2: Lint the new file**

Run: `npm run lint`
Expected: no new errors referencing `src/hooks/useSubscription.js`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSubscription.js
git commit -m "feat(settings): add useSubscription hook for billing tab"
```

---

### Task 2: `PlanChangeModal` (shared confirm modal)

**Files:**
- Create: `src/components/settings/PlanChangeModal.jsx`

**Interfaces:**
- Consumes: `@/components/ui/Modal` (`{ isOpen, setIsOpen, children, maxWidth }`).
- Produces: default export `PlanChangeModal` with props `{ isOpen, setIsOpen, action, plan, billingCycle, busy, onConfirm, isDarkMode }`. `action` is one of `'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'renew'`. `plan` is the target plan object (may be `null` for cancel/renew). `onConfirm()` is called when the user confirms. `busy` disables buttons while a mutation is in flight.

- [ ] **Step 1: Create the modal file**

```jsx
'use client';
import Modal from '@/components/ui/Modal';

const COPY = {
  subscribe: { title: 'Confirm subscription', verb: 'Subscribe' },
  upgrade: { title: 'Confirm upgrade', verb: 'Upgrade' },
  downgrade: { title: 'Confirm downgrade', verb: 'Downgrade' },
  cancel: { title: 'Cancel subscription', verb: 'Cancel plan' },
  renew: { title: 'Renew subscription', verb: 'Renew' },
};

export default function PlanChangeModal({
  isOpen,
  setIsOpen,
  action,
  plan,
  billingCycle,
  busy = false,
  onConfirm,
  isDarkMode,
}) {
  const copy = COPY[action] || COPY.subscribe;
  const planName = plan?.name || plan?.planName || plan?.plan_name || '';
  const price = plan?.price ?? plan?.amount;
  const currency = plan?.currency || 'USD';

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth="max-w-md">
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {copy.title}
        </h3>

        {action === 'cancel' ? (
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Are you sure you want to cancel your subscription? You will keep access until the end of
            the current billing period.
          </p>
        ) : action === 'renew' ? (
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Renew your subscription using your saved payment method?
          </p>
        ) : (
          <div className={`text-sm mb-6 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              Plan: <span className="font-semibold">{planName}</span>
            </p>
            <p>
              Billing: <span className="font-semibold capitalize">{billingCycle}</span>
            </p>
            {price != null && (
              <p>
                Price:{' '}
                <span className="font-semibold">
                  {price} {currency}
                </span>
              </p>
            )}
            <p className="pt-2 text-xs opacity-70">
              Your saved payment method will be charged by our billing provider.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => setIsOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
              isDarkMode
                ? 'bg-white/5 text-gray-300 border border-[#FFFFFF14] hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
              action === 'cancel'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25'
                : 'bg-[#F1CB68]/15 text-[#BF9B30] border border-[#F1CB68]/40 hover:bg-[#F1CB68]/25'
            }`}
          >
            {busy ? 'Please wait…' : copy.verb}
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `PlanChangeModal.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/PlanChangeModal.jsx
git commit -m "feat(settings): add shared PlanChangeModal confirm dialog"
```

---

### Task 3: `CurrentPlanCard`

**Files:**
- Create: `src/components/settings/CurrentPlanCard.jsx`

**Interfaces:**
- Consumes: `current` and `loading` from `useSubscription` (Task 1).
- Produces: default export `CurrentPlanCard` with props `{ current, loading, onCancel, onRenew, isDarkMode }`. Calls `onCancel()` / `onRenew()` (parent opens the modal). Treats `current.status` of `active`/`trialing` as cancellable; `cancelled`/`canceled`/`expired`/`inactive` as renewable.

- [ ] **Step 1: Create the component file**

```jsx
'use client';

const isActiveStatus = (status) => ['active', 'trialing'].includes(String(status || '').toLowerCase());

export default function CurrentPlanCard({ current, loading, onCancel, onRenew, isDarkMode }) {
  const planName = current?.plan || current?.planName || current?.plan_name;
  const status = current?.status;
  const amount = current?.amount ?? current?.price;
  const currency = current?.currency || 'USD';
  const nextPayment = current?.currentPeriodEnd || current?.current_period_end || '—';
  const active = isActiveStatus(status);

  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Current plan
      </h3>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className={`h-4 w-28 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
        </div>
      ) : current ? (
        <>
          <p className={`text-base mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Plan:{' '}
            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {planName || '—'}
            </span>{' '}
            · Status:{' '}
            <span className={`font-semibold ${active ? 'text-green-400' : 'text-red-400'}`}>
              {status || 'unknown'}
            </span>
          </p>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {amount != null ? `${amount} ${currency}` : '—'} · Next payment {nextPayment}
          </p>
          <div className="flex gap-3">
            {active ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 transition-all"
              >
                Cancel subscription
              </button>
            ) : (
              <button
                type="button"
                onClick={onRenew}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#F1CB68]/15 text-[#BF9B30] border border-[#F1CB68]/40 hover:bg-[#F1CB68]/25 transition-all"
              >
                Renew subscription
              </button>
            )}
          </div>
        </>
      ) : (
        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No active subscription. Choose a plan below to get started.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `CurrentPlanCard.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/CurrentPlanCard.jsx
git commit -m "feat(settings): add CurrentPlanCard with cancel/renew actions"
```

---

### Task 4: `PlanSelector`

**Files:**
- Create: `src/components/settings/PlanSelector.jsx`

**Interfaces:**
- Consumes: `plans`, `current`, `loading` from `useSubscription` (Task 1).
- Produces: default export `PlanSelector` with props `{ plans, current, loading, onSelectPlan, isDarkMode }`. Calls `onSelectPlan(plan, billingCycle, action)` where `action` ∈ `'subscribe' | 'upgrade' | 'downgrade'`. Owns the monthly/annual toggle locally. Derives the per-plan CTA by comparing plan price to the current plan's price; the plan matching the current plan id renders a disabled "Current plan".

- [ ] **Step 1: Create the component file**

```jsx
'use client';
import { useState } from 'react';

const planId = (p) => p?.id ?? p?.planId ?? p?.plan_id;
const planPrice = (p) => Number(p?.price ?? p?.amount ?? 0);

// Decide the CTA for a plan relative to the user's current subscription.
const ctaFor = (plan, current) => {
  const currentId = current?.planId ?? current?.plan_id ?? current?.id;
  if (!current || !currentId) return { action: 'subscribe', label: 'Subscribe', disabled: false };
  if (planId(plan) === currentId) return { action: 'current', label: 'Current plan', disabled: true };
  const currentPrice = Number(current?.amount ?? current?.price ?? 0);
  return planPrice(plan) >= currentPrice
    ? { action: 'upgrade', label: 'Upgrade', disabled: false }
    : { action: 'downgrade', label: 'Downgrade', disabled: false };
};

export default function PlanSelector({ plans, current, loading, onSelectPlan, isDarkMode }) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Available plans
        </h3>
        <div className={`inline-flex rounded-lg p-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          {['monthly', 'annual'].map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                billingCycle === cycle
                  ? 'bg-[#F1CB68]/20 text-[#BF9B30]'
                  : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No plans available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const cta = ctaFor(plan, current);
            const name = plan.name || plan.planName || plan.plan_name;
            const price = plan.price ?? plan.amount;
            const currency = plan.currency || 'USD';
            return (
              <div
                key={planId(plan)}
                className={`rounded-xl p-5 border flex flex-col ${
                  cta.action === 'current'
                    ? 'border-[#F1CB68]/60'
                    : isDarkMode
                      ? 'border-[#FFFFFF14]'
                      : 'border-gray-200'
                } ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {name}
                </p>
                <p className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {price != null ? `${price}` : '—'}
                  <span className="text-sm font-normal opacity-60"> {currency}</span>
                </p>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className={`text-xs space-y-1 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.features.map((f, i) => (
                      <li key={i}>• {typeof f === 'string' ? f : f?.label || f?.name}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  disabled={cta.disabled}
                  onClick={() => onSelectPlan(plan, billingCycle, cta.action)}
                  className={`mt-auto px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-default ${
                    cta.disabled
                      ? isDarkMode
                        ? 'bg-white/5 text-gray-400 border border-[#FFFFFF14]'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                      : 'bg-[#F1CB68]/15 text-[#BF9B30] border border-[#F1CB68]/40 hover:bg-[#F1CB68]/25'
                  }`}
                >
                  {cta.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `PlanSelector.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/PlanSelector.jsx
git commit -m "feat(settings): add PlanSelector grid with subscribe/upgrade/downgrade"
```

---

### Task 5: `PlanFeatures`

**Files:**
- Create: `src/components/settings/PlanFeatures.jsx`

**Interfaces:**
- Consumes: `permissions`, `loading` from `useSubscription` (Task 1).
- Produces: default export `PlanFeatures` with props `{ permissions, loading, isDarkMode }`. Renders a list of unlocked features. `permissions` may be an array of strings/objects, or an object whose truthy entries are the granted features; the component normalizes both.

- [ ] **Step 1: Create the component file**

```jsx
'use client';

// Normalize the permissions payload (array OR object map) into string labels.
const toFeatureList = (permissions) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) {
    return permissions.map((p) => (typeof p === 'string' ? p : p?.label || p?.name || p?.permission)).filter(Boolean);
  }
  if (typeof permissions === 'object') {
    return Object.entries(permissions)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);
  }
  return [];
};

export default function PlanFeatures({ permissions, loading, isDarkMode }) {
  const features = toFeatureList(permissions);

  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Plan features
      </h3>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className={`h-3 w-48 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className={`h-3 w-40 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
        </div>
      ) : features.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Feature details are not available for your current plan.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((f, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              <span className="text-[#F1CB68]">✓</span>
              <span className="capitalize">{String(f).replace(/[:_]/g, ' ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `PlanFeatures.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/PlanFeatures.jsx
git commit -m "feat(settings): add PlanFeatures list from subscription permissions"
```

---

### Task 6: `SubscriptionHistory`

**Files:**
- Create: `src/components/settings/SubscriptionHistory.jsx`

**Interfaces:**
- Consumes: `history`, `loading` from `useSubscription` (Task 1).
- Produces: default export `SubscriptionHistory` with props `{ history, loading, isDarkMode }`. Desktop table + mobile cards, mirroring the existing payment-history layout in `PaymentBilling.jsx`. Columns: Date, Change, Plan, Status. Reads each row defensively.

- [ ] **Step 1: Create the component file**

```jsx
'use client';

const rowDate = (r) => r.createdAt || r.created_at || r.date || '—';
const rowChange = (r) => r.action || r.changeType || r.change_type || r.event || '—';
const rowPlan = (r) => r.plan || r.planName || r.plan_name || r.toPlan || r.to_plan || '—';
const rowStatus = (r) => r.status || '—';

export default function SubscriptionHistory({ history, loading, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Subscription history
      </h3>

      {loading && (
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading history…
        </p>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
              {['Date', 'Change', 'Plan', 'Status'].map((h) => (
                <th
                  key={h}
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={4}
                  className={`py-6 px-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  No subscription history.
                </td>
              </tr>
            ) : (
              history.map((r, i) => (
                <tr key={i} className={`border-b last:border-0 ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rowDate(r)}</td>
                  <td className={`py-4 px-4 capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rowChange(r)}</td>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rowPlan(r)}</td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                      {rowStatus(r)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {history.length === 0 && !loading ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No subscription history.</p>
        ) : (
          history.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${isDarkMode ? 'bg-white/5 border-[#FFFFFF14]' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rowDate(r)}</p>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                  {rowStatus(r)}
                </span>
              </div>
              <p className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {rowChange(r)} · {rowPlan(r)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors referencing `SubscriptionHistory.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SubscriptionHistory.jsx
git commit -m "feat(settings): add SubscriptionHistory table"
```

---

### Task 7: Integrate everything into `PaymentBilling.jsx`

**Files:**
- Modify: `src/components/settings/PaymentBilling.jsx`

**Interfaces:**
- Consumes: `useSubscription` (Task 1), `CurrentPlanCard` (Task 3), `PlanSelector` (Task 4), `PlanFeatures` (Task 5), `SubscriptionHistory` (Task 6), `PlanChangeModal` (Task 2).
- Produces: the assembled Payment & Billing tab. `PaymentBilling` owns modal state `{ open, action, plan, busy }` and routes confirmation to the correct mutation. Keeps the existing payment-methods and payment-history blocks (still fed by `paymentsApi`).

This task replaces the subscription/limits sourcing in `PaymentBilling.jsx` (currently `getCurrentSubscription` + `getSubscriptionLimits` via local state) with the `useSubscription` hook, and inserts the new sections. The existing payment-methods + payment-history data (from `paymentsApi`) stays in local state exactly as today.

- [ ] **Step 1: Replace the imports and top of the component**

Replace the current import block (lines 1–5) and the subscription-related state/effect with the hook. The new top of the file:

```jsx
'use client';

import { useEffect, useState } from 'react';
import { getPaymentMethods, getPaymentHistory, listInvoices } from '@/utils/paymentsApi';
import { useSubscription } from '@/hooks/useSubscription';
import CurrentPlanCard from '@/components/settings/CurrentPlanCard';
import PlanSelector from '@/components/settings/PlanSelector';
import PlanFeatures from '@/components/settings/PlanFeatures';
import SubscriptionHistory from '@/components/settings/SubscriptionHistory';
import PlanChangeModal from '@/components/settings/PlanChangeModal';

export default function PaymentBilling({ isDarkMode }) {
  const {
    current,
    plans,
    limits,
    permissions,
    history,
    loading: subLoading,
    subscribe,
    changePlan,
    cancel,
    renew,
  } = useSubscription();

  // Payment methods / payment history / invoices stay on paymentsApi.
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared confirmation modal state.
  const [modal, setModal] = useState({ open: false, action: 'subscribe', plan: null, billingCycle: 'monthly', busy: false });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const [methodsRes, historyRes, invoicesRes] = await Promise.allSettled([
          getPaymentMethods(),
          getPaymentHistory(),
          listInvoices(),
        ]);
        if (methodsRes.status === 'fulfilled') {
          setPaymentMethods(methodsRes.value.data || methodsRes.value.paymentMethods || []);
        }
        if (historyRes.status === 'fulfilled') {
          setPaymentHistory(historyRes.value.data || historyRes.value || []);
        }
        if (invoicesRes.status === 'fulfilled') {
          setInvoices(invoicesRes.value.data || invoicesRes.value || []);
        }
        if (
          methodsRes.status === 'rejected' &&
          historyRes.status === 'rejected' &&
          invoicesRes.status === 'rejected'
        ) {
          setError('Failed to load payment and billing data.');
        }
      } catch (err) {
        console.error('Error loading payment & billing:', err);
        setError(err.message || 'Failed to load payment and billing data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const openModal = (action, plan, billingCycle = 'monthly') =>
    setModal({ open: true, action, plan, billingCycle, busy: false });

  const setModalOpen = (open) => setModal((m) => ({ ...m, open }));

  const handleConfirm = async () => {
    setModal((m) => ({ ...m, busy: true }));
    const { action, plan, billingCycle } = modal;
    const id = plan?.id ?? plan?.planId ?? plan?.plan_id;
    let ok = false;
    if (action === 'subscribe') ok = await subscribe(id, billingCycle);
    else if (action === 'upgrade' || action === 'downgrade') ok = await changePlan(id, billingCycle);
    else if (action === 'cancel') ok = await cancel();
    else if (action === 'renew') ok = await renew();
    setModal((m) => ({ ...m, busy: false, open: ok ? false : m.open }));
  };
```

- [ ] **Step 2: Replace the returned JSX structure**

Keep the existing markup for the **Bill To / Payment Method** cards and the **Payment history** block. Wrap everything in a fragment that adds the new sections in spec order and renders the modal. The new `return`:

```jsx
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billing</h2>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {/* 1. Current plan */}
      <CurrentPlanCard
        current={current}
        loading={subLoading}
        onCancel={() => openModal('cancel', null)}
        onRenew={() => openModal('renew', null)}
        isDarkMode={isDarkMode}
      />

      {/* 2. Available plans */}
      <PlanSelector
        plans={plans}
        current={current}
        loading={subLoading}
        onSelectPlan={(plan, billingCycle, action) => openModal(action, plan, billingCycle)}
        isDarkMode={isDarkMode}
      />

      {/* 3. Plan features */}
      <PlanFeatures permissions={permissions} loading={subLoading} isDarkMode={isDarkMode} />

      {/* 4. Usage + 5. Payment methods (existing markup) */}
      <div className={`rounded-2xl p-4 md:p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
        {limits && (
          <p className={`text-xs mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Usage this period: accounts {limits.usage?.accounts?.used ?? 0}/{limits.limits?.accounts ?? '—'}, assets{' '}
            {limits.usage?.assets?.used ?? 0}/{limits.limits?.assets ?? '—'}.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To card — keep existing markup from the original file */}
          {/* Payment Method card — keep existing markup from the original file (uses `paymentMethods`, `loading`) */}
        </div>
      </div>

      {/* 6. Subscription history */}
      <SubscriptionHistory history={history} loading={subLoading} isDarkMode={isDarkMode} />

      {/* 7. Payment history — keep existing markup (uses `paymentHistory`, `loading`) */}
      {/* ...existing payment history block... */}

      <PlanChangeModal
        isOpen={modal.open}
        setIsOpen={setModalOpen}
        action={modal.action}
        plan={modal.plan}
        billingCycle={modal.billingCycle}
        busy={modal.busy}
        onConfirm={handleConfirm}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
```

When wiring this, **preserve the original JSX** for the Bill To card, Payment Method card, and the full Payment history table/mobile-cards (lines ~136–318 of the original file). Move the Bill To + Payment Method cards inside the Usage wrapper above, and place the existing Payment history block where indicated. `invoices` state is retained (still set) even though display is unchanged.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors referencing `PaymentBilling.jsx`.

- [ ] **Step 4: Build to verify the tab compiles**

Run: `npm run build`
Expected: build completes with no errors; `/dashboard/settings` is included in the static export.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/dashboard/settings`, click the **Payment & Billing** tab. Verify in order:
1. Sections render top-to-bottom: Current plan → Available plans → Plan features → Usage/Payment methods → Subscription history → Payment history.
2. With no active plan: Available plans show **Subscribe**; clicking opens the modal → Confirm → success toast → Current plan updates.
3. With an active plan: a plan shows **Current plan** (disabled); higher-priced plans show **Upgrade**, lower show **Downgrade**; confirm flow refreshes the tab.
4. **Cancel subscription** → modal → toast → status flips, **Renew** appears.
5. **Renew subscription** → modal → toast → status flips back.
6. Plan features and Subscription history populate (or show graceful empty states).
7. A failed loader does not blank the tab; toggling dark/light renders correctly; tables collapse to cards on mobile.

- [ ] **Step 6: Commit**

```bash
git add src/components/settings/PaymentBilling.jsx
git commit -m "feat(settings): integrate subscription flows into Payment & Billing tab"
```

---

## Self-Review

**Spec coverage:**
- `getAvailablePlans` → Task 4 (PlanSelector). ✓
- `createSubscription` → Task 1 (`subscribe`) + Task 4 CTA + Task 7 confirm. ✓
- `updateSubscriptionPlan` → Task 1 (`changePlan`) + Task 4 upgrade/downgrade. ✓
- `cancelSubscription` → Task 1 (`cancel`) + Task 3 + Task 7. ✓
- `renewSubscription` → Task 1 (`renew`) + Task 3 + Task 7. ✓
- `getSubscriptionHistory` → Task 6. ✓
- `getSubscriptionPermissions` → Task 5. ✓
- `getCurrentSubscription` / `getSubscriptionLimits` (existing) → Task 1 + Task 3 + Task 7. ✓
- Confirmation modal for every action → Task 2 + Task 7. ✓
- No new routes; all inside the billing tab → Task 7. ✓
- Direct-call payment, no Stripe → Task 1 mutations; modal copy notes backend billing. ✓
- Existing payment-methods + payment-history preserved → Task 7. ✓

**Placeholder scan:** No TBD/TODO. The only "keep existing markup" references in Task 7 point at concrete, existing line ranges in the file being modified (the engineer has that file open), not undefined behavior.

**Type consistency:** Hook return keys (`current`, `plans`, `limits`, `permissions`, `history`, `loading`, `refresh`, `subscribe`, `changePlan`, `cancel`, `renew`) are used identically in Tasks 3–7. `onSelectPlan(plan, billingCycle, action)` signature in Task 4 matches `openModal(action, plan, billingCycle)` usage in Task 7. Plan-id resolution (`id ?? planId ?? plan_id`) is consistent across Task 4 and Task 7. Action values (`subscribe`/`upgrade`/`downgrade`/`cancel`/`renew`) match between Task 2 COPY, Task 4 `ctaFor`, and Task 7 `handleConfirm`.
