'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import {
  getAvailablePlans,
  createSubscription,
  updateSubscriptionPlan,
  waitForActiveSubscription,
  extractClientSecret,
  SUBSCRIPTION_STATUS,
} from '@/utils/subscriptionsApi';
import { clearSubscriptionCache, hasActiveSubscription } from '@/utils/onboarding';
import { FALLBACK_PRICING } from '@/config/plans';
import { ERROR_CODES } from '@/config/apiErrorCodes';

// Shared Stripe instance promise for the Elements provider.
const stripePromise = getStripe();

// Always render as USD with a leading "$". Backend prices may arrive as numbers
// or as decimal strings ("49.00"), so coerce before formatting.
const formatUSD = (n) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (num === null || num === undefined || Number.isNaN(num)) return '—';
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Stripe Elements render in an iframe, so the CardElement must be styled via the
// `style` option rather than Tailwind classes. This page is always dark.
const cardStyle = {
  style: {
    base: {
      color: '#FFFFFF',
      fontFamily: 'inherit',
      fontSize: '15px',
      '::placeholder': { color: '#9CA3AF' },
      iconColor: '#F1CB68',
    },
    invalid: { color: '#F87171', iconColor: '#F87171' },
  },
};

function CheckoutForm({ mode = 'subscribe', billingCycle, price, planId, planReady, onDone, onAlreadySubscribed }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [cardError, setCardError] = useState(null);
  // Set when the card cleared but the webhook hasn't landed within our patience.
  // The money HAS moved — this is never an error state.
  const [awaitingWebhook, setAwaitingWebhook] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const isUpgrade = mode === 'upgrade';

  // Poll until the backend agrees the plan is live, then hand off. Purchase waits
  // for status === 'active'; an upgrade's status is already active, so it waits
  // for plan_id to actually flip to the plan we asked for.
  const settleAndFinish = async () => {
    setConfirming(true);
    const settled = await waitForActiveSubscription(
      isUpgrade
        ? { isSettled: (sub) => String(sub?.planId || '').toLowerCase() === String(planId).toLowerCase() }
        : {}
    );
    setConfirming(false);

    if (!settled) {
      // Don't navigate. /dashboard's SecureRoute would re-read `incomplete`,
      // decide they have no plan, and bounce them to /select-plan — where they
      // could pay a second time for what they just bought.
      setAwaitingWebhook(true);
      setBusy(false);
      return;
    }

    toast.success(isUpgrade ? 'Payment confirmed — your plan has been upgraded.' : 'Subscription activated. Welcome aboard!');
    onDone();
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!planId) {
      toast.error('This plan can’t be checked out right now. Please contact support.');
      return;
    }

    setBusy(true);
    setCardError(null);

    try {
      // 1) Create the subscription (or request the plan upgrade). Neither grants
      // the plan: both return status "incomplete" plus a client_secret.
      const res = isUpgrade
        ? await updateSubscriptionPlan({ planId, billingCycle })
        : await createSubscription({ planId, billingCycle });
      const clientSecret = extractClientSecret(res);

      // 2) Confirm the PaymentIntent with the card entered here; this also
      // resolves any 3DS challenge. Clearing the card proves the money moved —
      // it does NOT mean our backend knows yet. Stripe tells it via webhook.
      if (clientSecret) {
        const card = elements.getElement(CardElement);
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });
        if (error) {
          setCardError(error.message || 'Payment failed. Please try another card.');
          setBusy(false);
          return;
        }
      } else if (String(res?.subscription?.status || '').toLowerCase() === SUBSCRIPTION_STATUS.INCOMPLETE) {
        // Incomplete with nothing to confirm means we can't finish the payment
        // and must not pretend we did.
        setCardError('We couldn’t start the payment. Please try again or contact support.');
        setBusy(false);
        return;
      }

      // 3) Only now is it safe to believe anything.
      await settleAndFinish();
      return;
    } catch (err) {
      // Pre-Stripe subscriptions have no Stripe subscription to proration-invoice.
      // Nothing was charged; the only way onto a new plan is cancel + re-subscribe.
      if (err?.code === ERROR_CODES.SUBSCRIPTION_NOT_STRIPE_BACKED) {
        toast.error(err?.message || 'This plan can’t be upgraded. Please cancel it and subscribe again.');
        router.push('/dashboard/settings?tab=payment');
        return;
      }
      // 409 on purchase no longer just means "you have an active plan, go upgrade".
      // It ALSO fires when our DB says `incomplete` but Stripe says the invoice is
      // already paid — a missed webhook. In that state the user's money is gone and
      // they DO have a plan. Telling them to buy again, or nudging them toward
      // upgrade, would ask them to pay for something they already own. Treat it as
      // a successful purchase whose confirmation we're still waiting on: re-read
      // the subscription and let the poll decide.
      if (!isUpgrade && err?.code === ERROR_CODES.SUBSCRIPTION_ALREADY_EXISTS) {
        clearSubscriptionCache();
        await settleAndFinish();
        return;
      }
      // On the upgrade path a 409 keeps its original meaning.
      if (err?.code === ERROR_CODES.SUBSCRIPTION_ALREADY_EXISTS) {
        toast.info('You already have an active plan. Manage it in settings.');
        onAlreadySubscribed?.();
        return;
      }
      // Plan/billing no longer valid → send them back to pick again.
      if (
        err?.code === ERROR_CODES.PLAN_INVALID ||
        err?.code === ERROR_CODES.BILLING_CYCLE_INVALID
      ) {
        toast.error(err?.message || 'That plan or billing option is no longer available. Please choose again.');
        router.push(isUpgrade ? '/dashboard/settings?tab=payment' : '/select-plan');
        return;
      }
      // Custom-priced plan → hand off to sales.
      if (err?.code === ERROR_CODES.PLAN_REQUIRES_CUSTOM_PRICING) {
        toast.info('This plan needs custom pricing — our team will help you set it up.');
        router.push('/contact');
        return;
      }
      // Eligibility gates → send the user to the step they still owe.
      if (err?.code === ERROR_CODES.EMAIL_NOT_VERIFIED) {
        toast.error(err?.message || 'Please verify your email before subscribing.');
        router.push('/signup');
        return;
      }
      if (err?.code === ERROR_CODES.KYC_NOT_APPROVED) {
        toast.error(err?.message || 'Please complete identity verification before subscribing.');
        router.push('/choose-profile');
        return;
      }
      if (err?.code === ERROR_CODES.SUBSCRIPTION_NOT_APPLICABLE) {
        toast.info(err?.message || 'Your account does not require a subscription.');
        router.push('/dashboard');
        return;
      }
      toast.error(err?.message || 'Failed to complete subscription');
    } finally {
      setBusy(false);
    }
  };

  // Card cleared, webhook still in flight. Never offer a "pay again" affordance
  // here — the charge succeeded and a second submit would double-charge.
  if (awaitingWebhook) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[#F1CB68]/15 border border-[#F1CB68]/40 flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin h-6 w-6 text-[#F1CB68]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Payment received</h2>
        <p className="text-sm text-gray-400 mb-6">
          Your card was charged successfully. We’re still activating your plan — this
          usually takes a few seconds. You will not be charged again.
        </p>
        <button
          type="button"
          onClick={() => { setAwaitingWebhook(false); setBusy(true); settleAndFinish(); }}
          disabled={confirming}
          className="w-full rounded-full px-6 py-3 font-semibold text-[#0B0D12] disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
        >
          {confirming ? 'Checking…' : 'Check again'}
        </button>
        <p className="text-[11px] text-gray-500 mt-3">
          Still stuck after a minute? Contact support — don’t re-enter your card.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay}>
      <label className="block text-sm font-medium text-gray-300 mb-2">Card details</label>
      <div className="rounded-lg px-4 py-3.5 mb-3 border bg-white/5 border-[#FFFFFF14]">
        <CardElement
          options={cardStyle}
          onChange={(ev) => setCardError(ev.error ? ev.error.message : null)}
        />
      </div>
      {cardError && <p className="text-xs text-red-400 mb-3">{cardError}</p>}

      {!planReady && <p className="text-xs text-amber-300/80 mb-3">Loading plan details…</p>}
      {planReady && !planId && (
        <p className="text-xs text-red-400 mb-3">
          This plan isn’t available from the billing service yet. Please contact support.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !stripe || !planId}
        className="w-full rounded-full px-6 py-3 font-semibold transition-all shadow-lg text-[#0B0D12] disabled:opacity-50"
        style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
      >
        {confirming
          ? 'Confirming payment…'
          : busy
          ? 'Processing…'
          : `Pay ${formatUSD(price)} / ${billingCycle === 'annual' ? 'year' : 'month'}`}
      </button>

      <p className="text-[11px] text-gray-500 mt-3 text-center">
        Secured by Stripe. You can cancel anytime from your dashboard settings.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [pending, setPending] = useState(null);
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Require an auth session, block re-checkout for existing subscribers (it would
  // overwrite their subscription and double-charge — send them to settings), then
  // read the plan chosen on /plans.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('access_token')) {
      router.replace('/signup');
      return;
    }
    // Subscriptions are investor-only — staff never reach checkout.
    try {
      const u = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (u.role === 'admin' || u.role === 'advisor') {
        router.replace('/dashboard');
        return;
      }
    } catch {
      /* ignore */
    }
    // Read the chosen plan up front — upgrade handoffs from settings carry
    // action: 'upgrade' and must not be bounced by the already-subscribed guard.
    let parsed = null;
    try {
      const raw = localStorage.getItem('pendingPlan');
      if (raw) parsed = JSON.parse(raw);
    } catch {
      /* ignore malformed pendingPlan */
    }
    let cancelled = false;
    (async () => {
      const subscribed = await hasActiveSubscription();
      if (cancelled) return;
      if (subscribed && parsed?.action !== 'upgrade') {
        toast.info('You already have an active plan. Manage it in settings.');
        router.replace('/dashboard/settings?tab=payment');
        return;
      }
      // Upgrade requested but no live subscription to upgrade (e.g. it lapsed
      // in another tab) → fall back to a fresh subscribe of the same plan.
      if (!subscribed && parsed?.action === 'upgrade') {
        parsed = { ...parsed, action: undefined };
      }
      if (parsed) {
        setPending(parsed);
        if (parsed.billingCycle) setBillingCycle(parsed.billingCycle);
      }
      setPendingLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Load available plans to resolve the real plan id + price.
  useEffect(() => {
    let active = true;
    getAvailablePlans()
      .then((res) => {
        if (!active) return;
        const list = res?.plans || res?.data || [];
        setPlans(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setPlansLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const isUpgrade = pending?.action === 'upgrade';

  // Match the chosen plan to a backend plan by id (lowercase: starter/pro/premium),
  // falling back to name. Upgrade handoffs from settings carry the exact planId.
  const matchedPlan = useMemo(() => {
    const target = String(pending?.planId ?? pending?.name ?? '').toLowerCase();
    if (!target || !Array.isArray(plans)) return null;
    return (
      plans.find((p) => String(p?.id ?? '').toLowerCase() === target) ||
      plans.find((p) => (p?.name || p?.planName || '').toLowerCase() === target) ||
      null
    );
  }, [plans, pending]);

  // The backend accepts the plain lowercase id, so we can derive it from the
  // chosen plan name even if the plans list is slow/unavailable.
  const planId =
    matchedPlan?.id ??
    pending?.planId ??
    (pending?.name ? pending.name.toLowerCase() : null);

  const fallback = FALLBACK_PRICING[(pending?.name || '').toLowerCase()] || {};
  const price =
    billingCycle === 'annual'
      ? matchedPlan?.annualPrice ?? matchedPlan?.annualCost ?? fallback.annual
      : matchedPlan?.monthlyPrice ?? matchedPlan?.monthlyCost ?? fallback.monthly;

  const handleDone = () => {
    try {
      localStorage.removeItem('pendingPlan');
    } catch {
      /* ignore */
    }
    // The user is now subscribed (or upgraded) — invalidate the cached check so
    // the dashboard gate (SecureRoute) sees the new subscription state.
    clearSubscriptionCache();
    // Upgrades came from the billing tab; land them back there to see the new plan.
    router.push(isUpgrade ? '/dashboard/settings?tab=payment' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[#FFFFFF14]">
        <Link href="/" className="inline-flex items-center">
          <img src="/darkmode_logo.svg" alt="Akunuba" className="h-9 w-auto object-contain" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-1">
            {isUpgrade ? 'Upgrade your plan' : 'Complete your subscription'}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {isUpgrade
              ? 'Review your new plan and confirm payment. Your plan is upgraded only after the payment succeeds. Stripe prorates the change, so the amount charged today may be less than the full plan price shown.'
              : 'You’re one step away. Review your plan and add a payment method to activate it.'}
          </p>

          {/* No plan chosen → send them to pick one. */}
          {pendingLoaded && !pending && (
            <div className="rounded-2xl border border-[#FFFFFF1A] bg-[#1a1a24]/60 p-6 text-center">
              <p className="text-sm text-gray-300 mb-4">No plan selected yet.</p>
              <Link
                href="/select-plan"
                className="inline-block rounded-full px-6 py-3 font-semibold text-[#0B0D12]"
                style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
              >
                Choose a plan
              </Link>
            </div>
          )}

          {pending && (
            <div className="rounded-2xl border border-[#F1CB68]/40 bg-[#1a1a24]/60 backdrop-blur-xl p-6">
              {/* Plan summary */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-lg font-bold">{pending.name}</div>
                  <div className="text-xs text-gray-400">Akunuba subscription</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F1CB68]">{formatUSD(price)}</div>
                  <div className="text-xs text-gray-400">
                    per {billingCycle === 'annual' ? 'year' : 'month'}
                  </div>
                </div>
              </div>

              {/* Billing cycle toggle */}
              <div className="flex items-center gap-2 mb-6 text-sm">
                {['monthly', 'annual'].map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    className={`px-3 py-1.5 rounded-full border transition-all capitalize ${
                      billingCycle === cycle
                        ? 'border-[#F1CB68] text-[#F1CB68] bg-[#F1CB68]/10'
                        : 'border-[#FFFFFF1A] text-gray-400 hover:text-white'
                    }`}
                  >
                    {cycle}
                    {cycle === 'annual' && <span className="ml-1 text-[10px]">(save ~20%)</span>}
                  </button>
                ))}
              </div>

              <div className="h-px bg-[#FFFFFF14] mb-6" />

              {/* Payment */}
              {!isStripeConfigured() ? (
                <p className="text-sm text-gray-300">
                  Payment processing is not configured. Set{' '}
                  <code className="text-[#F1CB68]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
                  enable checkout.
                </p>
              ) : (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    mode={isUpgrade ? 'upgrade' : 'subscribe'}
                    billingCycle={billingCycle}
                    price={price}
                    planId={planId}
                    planReady={plansLoaded}
                    onDone={handleDone}
                    onAlreadySubscribed={() => {
                      clearSubscriptionCache();
                      router.replace('/dashboard/settings?tab=payment');
                    }}
                  />
                </Elements>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
