import { describe, expect, it } from 'vitest';
import { ctaFor, cycleOfSubscription, normalizeCycle } from './planCta';

const PLANS = {
  starter: { id: 'starter', name: 'Starter', monthlyPrice: 49, annualPrice: 470 },
  pro: { id: 'pro', name: 'Pro', monthlyPrice: 299, annualPrice: 2870 },
  premium: { id: 'premium', name: 'Premium', monthlyPrice: 899, annualPrice: 8630 },
  concierge: { id: 'concierge', name: 'Concierge', isCustom: true },
};

const sub = (id, billingCycle, amount) => ({
  planId: id,
  billingCycle,
  amount,
  status: 'active',
});

const CAPS = { canSubscribe: true, canUpgrade: true };

describe('normalizeCycle', () => {
  it.each([
    ['annual', 'annual'],
    ['ANNUAL', 'annual'],
    ['Annual', 'annual'],
    ['yearly', 'annual'],
    ['monthly', 'monthly'],
    ['MONTHLY', 'monthly'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeCycle(input)).toBe(expected);
  });

  it('returns null when unknown', () => {
    expect(normalizeCycle(undefined)).toBeNull();
    expect(normalizeCycle('')).toBeNull();
  });
});

// The reported bug, from mahimahih460@gmail.com: subscribed to Premium monthly,
// and the Premium card said "Current plan" on the annual toggle too, so there
// was no way to move to annual.
describe('Premium monthly subscriber', () => {
  const current = sub('premium', 'monthly', 899);

  it('shows "Current plan" on Premium while the toggle is monthly', () => {
    const cta = ctaFor(PLANS.premium, current, CAPS, 'monthly');
    expect(cta).toMatchObject({ action: 'current', disabled: true });
  });

  it('offers a switch on Premium when the toggle is annual', () => {
    const cta = ctaFor(PLANS.premium, current, CAPS, 'annual');
    expect(cta.action).toBe('upgrade');
    expect(cta.disabled).toBe(false);
    expect(cta.label).toBe('Switch to annual');
  });

  it('still ranks other plans correctly on the annual toggle', () => {
    expect(ctaFor(PLANS.starter, current, CAPS, 'annual').action).toBe('downgrade');
    expect(ctaFor(PLANS.pro, current, CAPS, 'annual').action).toBe('downgrade');
  });
});

describe('Premium annual subscriber', () => {
  const current = sub('premium', 'annual', 8630);

  it('shows "Current plan" on Premium while the toggle is annual', () => {
    expect(ctaFor(PLANS.premium, current, CAPS, 'annual')).toMatchObject({
      action: 'current',
      disabled: true,
    });
  });

  it('offers a switch back to monthly', () => {
    const cta = ctaFor(PLANS.premium, current, CAPS, 'monthly');
    expect(cta.action).toBe('downgrade');
    expect(cta.label).toBe('Switch to monthly');
    expect(cta.disabled).toBe(false);
  });
});

describe('cross-plan ranking uses a per-month comparison', () => {
  // $2,870/yr Pro is ~$239/mo, which is BELOW $899/mo Premium — annual Pro must
  // not read as an upgrade just because 2870 > 899.
  it('treats annual Pro as a downgrade from monthly Premium', () => {
    const current = sub('premium', 'monthly', 899);
    expect(ctaFor(PLANS.pro, current, CAPS, 'annual').action).toBe('downgrade');
  });

  it('treats annual Premium as an upgrade from monthly Starter', () => {
    const current = sub('starter', 'monthly', 49);
    expect(ctaFor(PLANS.premium, current, CAPS, 'annual').action).toBe('upgrade');
  });

  it('treats monthly Premium as an upgrade from annual Starter', () => {
    const current = sub('starter', 'annual', 470);
    expect(ctaFor(PLANS.premium, current, CAPS, 'monthly').action).toBe('upgrade');
  });
});

describe('other states are unchanged', () => {
  it('offers Subscribe when there is no subscription', () => {
    expect(ctaFor(PLANS.pro, null, CAPS, 'monthly')).toMatchObject({
      action: 'subscribe',
      disabled: false,
    });
  });

  it('routes custom plans to sales', () => {
    expect(ctaFor(PLANS.concierge, null, CAPS, 'monthly').action).toBe('contact');
    expect(
      ctaFor(PLANS.concierge, sub('pro', 'monthly', 299), CAPS, 'annual').action
    ).toBe('contact');
  });

  it('honours the canSubscribe capability flag', () => {
    const caps = { canSubscribe: false, canUpgrade: true };
    expect(ctaFor(PLANS.pro, null, caps, 'monthly').disabled).toBe(true);
  });

  it('honours the canUpgrade flag on a cycle switch', () => {
    const caps = { canSubscribe: true, canUpgrade: false };
    const current = sub('premium', 'monthly', 899);
    expect(ctaFor(PLANS.premium, current, caps, 'annual').disabled).toBe(true);
  });

  it('falls back to "Current plan" when the cycle is unknown', () => {
    // No billingCycle on the subscription — we cannot tell a switch from a
    // no-op, so the safe answer is the old behaviour.
    const current = { planId: 'premium', amount: 899 };
    expect(ctaFor(PLANS.premium, current, CAPS, 'annual').action).toBe('current');
    expect(ctaFor(PLANS.premium, current, CAPS, 'monthly').action).toBe('current');
  });

  it('matches the plan by name or snake_case keys too', () => {
    const byName = { plan_name: 'Premium', billing_cycle: 'MONTHLY', amount: 899 };
    expect(cycleOfSubscription(byName)).toBe('monthly');
    expect(ctaFor(PLANS.premium, byName, CAPS, 'monthly').action).toBe('current');
    expect(ctaFor(PLANS.premium, byName, CAPS, 'annual').label).toBe(
      'Switch to annual'
    );
  });
});
