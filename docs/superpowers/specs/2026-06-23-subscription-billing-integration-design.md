# Subscription Billing Integration — Design Spec

**Date:** 2026-06-23
**Topic:** Wire all subscription functions into the Payment & Billing tab
**Status:** Approved for planning

## 1. Problem

`src/utils/subscriptionsApi.js` exposes 9 functions, but only 2 are used in the
UI (`getCurrentSubscription`, `getSubscriptionLimits` in
`src/components/settings/PaymentBilling.jsx`). These 7 are built but wired to
nothing:

- `getAvailablePlans` — browse plans
- `createSubscription` — subscribe
- `updateSubscriptionPlan` — upgrade/downgrade
- `cancelSubscription` — cancel
- `renewSubscription` — renew
- `getSubscriptionHistory` — plan-change history
- `getSubscriptionPermissions` — plan-gated feature list

Goal: integrate all 7 into the user-facing UI, **entirely within the existing
Payment & Billing tab** at `/dashboard/settings`. No new routes/pages.

## 2. Scope & non-goals

**In scope:** Render UI for all 7 functions inside the Payment & Billing tab;
subscribe / upgrade / downgrade / cancel / renew flows; plan-change history;
plan-feature display.

**Non-goals (explicitly out):**
- No Stripe Elements / payment-intent / card-entry UI. There is **no Stripe SDK
  or publishable key in the repo**, and this is a static export. Subscribe/upgrade
  call the util directly; the **backend bills the saved payment method**.
- No new routes or pages. Everything lives in the billing tab.
- No app-wide plan-based feature gating (that is a separate future project).
- The existing payment-methods and payment-history blocks are kept as-is.

## 3. Payment model (decision)

**Direct call, backend bills.** Mutations call the subscription util directly
with `{ planId, billingCycle }`; the backend charges the saved payment method.
If a response ever indicates payment action is required (e.g. a `client_secret`
or `requires_action` field), the UI surfaces an informational toast/message
rather than attempting a client-side Stripe confirmation. A full Stripe flow is
a separate project.

## 4. Architecture (Approach A — refactor into focused subcomponents)

`PaymentBilling.jsx` is already ~320 lines. Rather than bolt 7 flows onto it, we
split the tab into a container plus small, single-purpose presentational
components, and centralize data/mutations in one hook. **None of these are
routes** — they are components rendered inside the billing tab.

```
PaymentBilling.jsx                      (container; renders tab sections in order)
  └─ useSubscription()  hook            (loads data, exposes mutations + refresh)
  ├─ CurrentPlanCard                    getCurrentSubscription / cancel / renew
  ├─ PlanSelector                       getAvailablePlans / subscribe / change
  │    └─ PlanChangeModal               confirm subscribe/upgrade/downgrade
  ├─ PlanFeatures                       getSubscriptionPermissions
  ├─ (existing) Usage block             getSubscriptionLimits
  ├─ (existing) Payment Methods block   getPaymentMethods   (unchanged)
  ├─ SubscriptionHistory                getSubscriptionHistory
  └─ (existing) Payment History block   getPaymentHistory   (unchanged)
```

### File layout
- `src/hooks/useSubscription.js` — **new**
- `src/components/settings/CurrentPlanCard.jsx` — **new**
- `src/components/settings/PlanSelector.jsx` — **new**
- `src/components/settings/PlanChangeModal.jsx` — **new**
- `src/components/settings/PlanFeatures.jsx` — **new**
- `src/components/settings/SubscriptionHistory.jsx` — **new**
- `src/components/settings/PaymentBilling.jsx` — **edit** (compose the above; keep
  existing payment-methods + payment-history blocks)

No changes to `src/utils/subscriptionsApi.js`, `src/config/api.js`, or routes.

## 5. Data flow — `useSubscription` hook

Single source of truth for the tab's subscription state. Keeps subcomponents
presentational.

**Loads on mount (via `Promise.allSettled`, mirroring the existing pattern so one
failed call does not blank the tab):**
`getCurrentSubscription`, `getAvailablePlans`, `getSubscriptionLimits`,
`getSubscriptionPermissions`, `getSubscriptionHistory`.

**Returns:**
```
{
  current,            // current subscription object (or null)
  plans,              // available plans array
  limits,             // usage limits
  permissions,        // plan-gated feature list
  history,            // subscription change history
  loading,            // boolean
  error,              // string | null
  refresh(),          // re-run the loaders
  subscribe(planId, billingCycle),
  changePlan(planId, billingCycle),   // upgrade or downgrade
  cancel(),
  renew(),
}
```

**Mutation contract:** each mutation calls its util, and on success shows a
`react-toastify` toast (`toast.success`) and calls `refresh()`; on failure shows
`toast.error(err?.message || fallback)`. This mirrors the established pattern in
`src/app/dashboard/admin/subscriptions/page.js`.

**Response unwrapping:** continue the existing defensive unwrap used in
`PaymentBilling.jsx` (`res.data || res.subscription || res || null`) since the
backend response shape is not fully consistent.

## 6. Component contracts

**CurrentPlanCard** — props: `{ current, loading, onCancel, onRenew, isDarkMode }`.
Shows plan name, status, amount, next payment date. Renders **Cancel** when an
active subscription exists; **Renew** when cancelled/expired. Buttons open the
confirm modal (owned by the parent or a shared modal — see PlanChangeModal).
Empty state: "No active subscription."

**PlanSelector** — props: `{ plans, current, loading, onSelectPlan, isDarkMode }`.
Grid of plan cards + a monthly/annual billing-cycle toggle. Each card's CTA is
derived vs. the current plan: **Subscribe** (no active plan), **Current Plan**
(disabled, if it matches), **Upgrade** / **Downgrade** (by relative tier/price).
Clicking a CTA calls `onSelectPlan(plan, billingCycle, action)`, which opens
`PlanChangeModal`.

**PlanChangeModal** — props: `{ isOpen, setIsOpen, action, plan, billingCycle,
onConfirm, busy, isDarkMode }`. Uses `src/components/ui/Modal.jsx`
(`isOpen` / `setIsOpen` / `children` / `maxWidth`). Summarizes the change (plan,
cycle, price, action label) with **Confirm** / **Cancel**. `onConfirm` triggers
the mutation; `busy` disables buttons while in flight. Used for subscribe,
upgrade, downgrade, cancel, and renew (copy varies by `action`).

**PlanFeatures** — props: `{ permissions, loading, isDarkMode }`. Lists what the
current plan unlocks from `getSubscriptionPermissions`. Graceful empty state if
the endpoint returns nothing.

**SubscriptionHistory** — props: `{ history, loading, isDarkMode }`. Table of
plan changes (date, from/to plan, action, status). Distinct from the existing
**Payment History** table. Desktop table + mobile card layout, matching the
existing payment-history styling. Empty state: "No subscription history."

## 7. Error handling

- Per-loader failures isolated via `Promise.allSettled`; the tab still renders
  with whatever loaded. A global error banner shows only if the core load
  (current + plans) fails, matching existing behavior.
- Mutations: errors → `toast.error`; never leave the modal in a stuck state
  (`busy` always reset in `finally`).
- All async UI has loading (skeleton/pulse) and empty states, consistent with the
  current tab.

## 8. Styling

Reuse the existing billing-tab visual language: rounded `2xl` cards, the
`#F1CB68` gold accent, dark/light variants keyed off `isDarkMode`, and the
existing skeleton-pulse loaders. No new design system.

## 9. Testing / verification

Manual verification at `/dashboard/settings` → Payment & Billing tab:
1. All sections render with data (and degrade gracefully when a call fails).
2. Subscribe (no active plan) → modal → confirm → toast → current plan updates.
3. Upgrade and downgrade → correct CTA label → modal → refresh reflects change.
4. Cancel → modal → toast → status flips, Renew appears.
5. Renew → modal → toast → status flips back.
6. Subscription history and plan features populate.
7. Dark and light themes both correct; mobile layout for tables.

## 10. Risks / open questions

- **Backend response shapes** for plans, history, and permissions are not
  documented here; components must read defensively and tolerate missing fields.
- **Plan tier ordering** for Upgrade vs. Downgrade: derive from plan price or an
  explicit `tier`/`level` field if the backend provides one; otherwise fall back
  to price comparison.
- If the backend requires a payment intent before `createSubscription` succeeds,
  this scope surfaces a message only — full payment UX is deferred.
