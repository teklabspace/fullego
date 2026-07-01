'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { getAvailablePlans, createSubscription } from '@/utils/subscriptionsApi';
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

// Pull the 3DS client_secret out of POST /subscriptions, which the backend may
// expose at the top level, nested under `data`, or under `payment_intent`.
const extractClientSecret = (res) => {
  const top = res || {};
  const data = top.data || {};
  const pi = top.payment_intent || top.paymentIntent || data.payment_intent || data.paymentIntent || {};
  return (
    top.client_secret || top.clientSecret ||
    data.client_secret || data.clientSecret ||
    pi.client_secret || pi.clientSecret ||
    null
  );
};

function CheckoutForm({ billingCycle, price, planId, planReady, onDone, onAlreadySubscribed }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [cardError, setCardError] = useState(null);

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
      // 1) Create the subscription — backend returns a client_secret to confirm.
      const res = await createSubscription({ planId, billingCycle });
      const clientSecret = extractClientSecret(res);

      // 2) Client-confirmed charge (option A): confirm the PaymentIntent with the
      // card entered here. confirmCardPayment also resolves any 3DS challenge.
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
      }

      toast.success('Subscription activated. Welcome aboard!');
      onDone();
    } catch (err) {
      // 409 backstop: a subscription already exists (e.g. created in another tab
      // between the mount-check and pay). Route to the upgrade flow, no charge.
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
        router.push('/select-plan');
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
        {busy
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
    let cancelled = false;
    (async () => {
      const subscribed = await hasActiveSubscription();
      if (cancelled) return;
      if (subscribed) {
        toast.info('You already have an active plan. Manage it in settings.');
        router.replace('/dashboard/settings?tab=payment');
        return;
      }
      try {
        const raw = localStorage.getItem('pendingPlan');
        if (raw) {
          const parsed = JSON.parse(raw);
          setPending(parsed);
          if (parsed?.billingCycle) setBillingCycle(parsed.billingCycle);
        }
      } catch {
        /* ignore malformed pendingPlan */
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

  // Match the chosen plan to a backend plan by id (lowercase: starter/pro/premium),
  // falling back to name. The backend matches on id, so prefer it.
  const matchedPlan = useMemo(() => {
    if (!pending?.name || !Array.isArray(plans)) return null;
    const target = pending.name.toLowerCase();
    return (
      plans.find((p) => String(p?.id ?? '').toLowerCase() === target) ||
      plans.find((p) => (p?.name || p?.planName || '').toLowerCase() === target) ||
      null
    );
  }, [plans, pending]);

  // The backend accepts the plain lowercase id, so we can derive it from the
  // chosen plan name even if the plans list is slow/unavailable.
  const planId =
    matchedPlan?.id ?? (pending?.name ? pending.name.toLowerCase() : null);

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
    // The user is now subscribed — invalidate the cached check so the dashboard
    // gate (SecureRoute) sees the new subscription and lets them in.
    clearSubscriptionCache();
    router.push('/dashboard');
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
          <h1 className="text-2xl font-bold mb-1">Complete your subscription</h1>
          <p className="text-sm text-gray-400 mb-6">
            You’re one step away. Review your plan and add a payment method to activate it.
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
