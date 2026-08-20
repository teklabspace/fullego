'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ctaFor,
  cycleOfSubscription,
  isCustomPlan,
  planId,
} from './planCta';

const FALLBACK_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: '$49',
    annualPrice: '$470',
    features: [
      'Basic portfolio dashboard and limited aggregation (1–2 accounts)',
      'Read-only market performance view',
      'Marketplace access for browsing assets (yachts, real estate, jets, collectibles)',
      'View sample valuations but cannot list or buy',
      'Standard email support only',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: '$299',
    annualPrice: '$2,870',
    popular: true,
    features: [
      'Full portfolio management (stocks, bonds, ETFs, alternatives)',
      'Automated rebalancing & cash-flow analytics',
      'Access to Marketplace with ability to list and purchase assets',
      'Asset valuation tools for real estate, luxury assets, collectibles',
      'Transaction & trade engine for execution tracking',
      'Standard compliance logs and reporting downloads',
      'Priority support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: '$899',
    annualPrice: '$8,630',
    features: [
      'Everything in Pro + AI-driven wealth insights and risk optimization',
      'Automated asset valuation updates via third-party feeds',
      'Marketplace with full interaction: buy/sell, ROI projections, appraisal requests',
      'Document center for legal/estate and appraisal storage',
      'Dedicated tax & investment advisory sessions (monthly)',
      'Premium support with faster SLAs',
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    isCustom: true,
    monthlyPrice: 'Custom ($1,000+/mo)',
    annualPrice: 'Custom ($10,000+/yr)',
    features: [
      'All Premium features + bespoke wealth strategy design',
      'Private Marketplace access to exclusive deals & off-market assets',
      'Real-time valuation feeds for properties, art, and collectibles',
      'Dedicated wealth manager & research analyst',
      'Family office tools: delegated access, secure document sharing, escrow integration',
      'Priority onboarding, white-glove 24/7 concierge support',
    ],
  },
];

// Format a price for display. Numbers are rendered as currency via Intl; strings
// (pre-formatted fallback data) pass through untouched.
const formatMoney = (value, currency = 'USD') => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

export default function PlanSelector({ plans, current, capabilities, loading, onSelectPlan, isDarkMode }) {
  // Open on the cycle the user is actually paying for. Defaulting to monthly
  // showed an annual subscriber a monthly view of their own plan, which reads
  // as though their subscription changed.
  const [billingCycle, setBillingCycle] = useState(
    () => cycleOfSubscription(current) || 'monthly',
  );

  // `current` arrives after the first render, so adopt its cycle once — but
  // never override a cycle the user has picked themselves.
  const userChoseCycle = useRef(false);
  const subscriptionCycle = cycleOfSubscription(current);
  useEffect(() => {
    if (!userChoseCycle.current && subscriptionCycle) {
      setBillingCycle(subscriptionCycle);
    }
  }, [subscriptionCycle]);

  const chooseCycle = (cycle) => {
    userChoseCycle.current = true;
    setBillingCycle(cycle);
  };

  const displayPlans = plans.length > 0 ? plans : FALLBACK_PLANS;

  const getPriceDisplay = (plan) => {
    const currency = plan.currency || 'USD';
    if (isCustomPlan(plan)) {
      // Prefer a human-written custom label from fallback data; else "Custom".
      const raw = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      return typeof raw === 'string' ? raw : 'Custom';
    }
    const raw =
      billingCycle === 'annual'
        ? plan.annualPrice ?? plan.annual_price
        : plan.monthlyPrice ?? plan.monthly_price;
    const formatted = formatMoney(raw, currency);
    if (formatted != null) return formatted;
    return formatMoney(plan.price ?? plan.amount, currency) ?? '—';
  };

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
              onClick={() => chooseCycle(cycle)}
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

      {!current && capabilities && !capabilities.canSubscribe && capabilities.reason && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {capabilities.reason}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayPlans.map((plan) => {
            const cta = ctaFor(plan, current, capabilities, billingCycle);
            const name = plan.name || plan.planName || plan.plan_name;
            return (
              <div
                key={planId(plan)}
                className={`rounded-xl p-5 border flex flex-col ${
                  cta.action === 'current'
                    ? 'border-[#F1CB68]/60'
                    : plan.popular
                      ? 'border-[#F1CB68]/40'
                      : isDarkMode
                        ? 'border-[#FFFFFF14]'
                        : 'border-gray-200'
                } ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                {plan.popular && (
                  <span className="self-start mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1CB68]/20 text-[#BF9B30]">
                    Most Popular
                  </span>
                )}
                <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {name}
                </p>
                <p className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'}`}>
                  {getPriceDisplay(plan)}
                  {!isCustomPlan(plan) && (
                    <span className={`text-xs font-normal ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{billingCycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  )}
                </p>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className={`text-xs space-y-1.5 mb-4 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#F1CB68] mt-0.5 flex-shrink-0">✓</span>
                        {typeof f === 'string' ? f : f?.label || f?.name}
                      </li>
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
