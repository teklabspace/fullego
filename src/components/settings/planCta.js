/**
 * Which call-to-action a plan card should show, given the user's subscription
 * and the billing cycle they are currently looking at.
 *
 * Pulled out of PlanSelector so it can be tested directly: this is pure
 * decision logic, and getting it wrong strands paying users. It previously
 * compared only the plan IDENTITY, so a Premium-monthly subscriber saw
 * "Current plan" on the Premium card no matter which cycle the toggle was set
 * to — leaving no way to move between monthly and annual.
 *
 * The backend has always supported this: PUT /subscriptions/upgrade takes
 * "at least one of plan_id or billing_cycle" and resolves a new Stripe price
 * for the (plan, cycle) pair.
 */

export const planId = p => p?.id ?? p?.planId ?? p?.plan_id;

/**
 * Normalise a billing cycle to 'monthly' | 'annual', or null when unknown.
 * The value can arrive as 'ANNUAL' from the column, 'annual' from the API
 * transform, or 'yearly' from older records.
 */
export const normalizeCycle = raw => {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!value) return null;
  if (
    value.startsWith('ann') ||
    value.startsWith('year') ||
    value === 'yr' ||
    value === 'y'
  )
    return 'annual';
  return 'monthly';
};

export const cycleOfSubscription = current =>
  normalizeCycle(current?.billingCycle ?? current?.billing_cycle);

// Custom/enterprise plans (e.g. Concierge) have no purchasable price and are
// routed to sales instead of the subscribe flow.
export const isCustomPlan = p =>
  Boolean(p?.isCustom ?? p?.is_custom) ||
  (p?.monthlyPrice == null &&
    p?.monthly_price == null &&
    p?.annualPrice == null &&
    p?.annual_price == null &&
    p?.price == null &&
    p?.amount == null);

const num = value => Number(value) || 0;

/**
 * Comparable magnitude for a plan at a given cycle, expressed per month so an
 * annual plan can be ranked against a monthly one. Fallback data carries
 * pre-formatted strings ("$899"), which coerce to 0 — the same behaviour the
 * previous implementation had.
 */
export const monthlyEquivalent = (plan, cycle) => {
  if (cycle === 'annual') {
    const annual = num(plan?.annualPrice ?? plan?.annual_price);
    if (annual) return annual / 12;
  }
  return (
    num(plan?.monthlyPrice ?? plan?.monthly_price) ||
    num(plan?.price ?? plan?.amount)
  );
};

/** Same idea for the active subscription, whose amount is for ITS own cycle. */
export const currentMonthlyEquivalent = current => {
  const amount = num(current?.amount ?? current?.price);
  return cycleOfSubscription(current) === 'annual' ? amount / 12 : amount;
};

/**
 * The current subscription may identify its plan by id, name, or slug;
 * compare across all plausible fields on both sides.
 */
export const matchesCurrent = (plan, current) => {
  const currentKeys = [
    current?.planId,
    current?.plan_id,
    current?.id,
    current?.plan,
    current?.planName,
    current?.plan_name,
  ]
    .filter(v => v != null)
    .map(v => String(v).toLowerCase());
  const planKeys = [planId(plan), plan?.name, plan?.planName, plan?.plan_name]
    .filter(v => v != null)
    .map(v => String(v).toLowerCase());
  return currentKeys.some(a => planKeys.some(b => a === b));
};

/**
 * @param {object} plan          the card being rendered
 * @param {object|null} current  the active subscription, if any
 * @param {object|null} caps     backend capability flags
 * @param {'monthly'|'annual'} selectedCycle  the toggle's current position
 */
export const ctaFor = (plan, current, caps, selectedCycle = 'monthly') => {
  const cycle = normalizeCycle(selectedCycle) || 'monthly';
  const samePlan = Boolean(current) && matchesCurrent(plan, current);
  const currentCycle = cycleOfSubscription(current);

  // When the subscription doesn't report a cycle we cannot tell a switch from a
  // no-op, so treat it as matching and keep the old, safe behaviour.
  const sameCycle = currentCycle == null || currentCycle === cycle;

  if (samePlan && sameCycle)
    return { action: 'current', label: 'Current plan', disabled: true };

  if (isCustomPlan(plan))
    return { action: 'contact', label: 'Contact Sales', disabled: false };

  if (!current)
    return {
      action: 'subscribe',
      label: 'Subscribe',
      disabled: caps ? !caps.canSubscribe : false,
    };

  const disabled = caps ? !caps.canUpgrade : false;

  // Same tier, different billing cycle. Say so plainly — "Upgrade" on a plan
  // the user is already on reads like a mistake.
  if (samePlan) {
    return cycle === 'annual'
      ? { action: 'upgrade', label: 'Switch to annual', disabled }
      : { action: 'downgrade', label: 'Switch to monthly', disabled };
  }

  // Different tier: rank like-for-like, per month.
  return monthlyEquivalent(plan, cycle) >= currentMonthlyEquivalent(current)
    ? { action: 'upgrade', label: 'Upgrade', disabled }
    : { action: 'downgrade', label: 'Downgrade', disabled };
};
