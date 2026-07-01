/**
 * Single source of truth for the subscription plans shown in-app
 * (the `/select-plan` onboarding step and `/checkout`).
 *
 * `id` matches the backend plan id (lowercase: "starter" | "pro" | "premium"),
 * which is what we send as `plan_id` to POST /subscriptions. Prices are USD whole
 * units. The marketing `/plans` page keeps its own richly-styled copy; this config
 * drives the authenticated flow.
 */
export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 49,
    annual: 470,
    idealUser: 'New or casual investors',
    features: [
      'Basic portfolio dashboard and limited aggregation (1–2 accounts)',
      'Read-only market performance view',
      'Marketplace access for browsing assets (yachts, real estate, jets, collectibles)',
      'View sample valuations but cannot list or buy',
      'Standard email support only',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 299,
    annual: 2870,
    idealUser: 'Active investors & small business owners',
    features: [
      'Full portfolio management (stocks, bonds, ETFs, alternatives)',
      'Automated rebalancing & cash-flow analytics',
      'Access to Marketplace with ability to list and purchase assets',
      'Asset valuation tools for real estate, luxury assets, collectibles',
      'Transaction & trade engine for execution tracking',
      'Standard compliance logs and reporting downloads',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 899,
    annual: 8630,
    idealUser: 'Advanced investors, entrepreneurs & multi-portfolio users',
    features: [
      'Everything in Pro + AI-driven wealth insights and risk optimization',
      'Automated asset valuation updates via third-party feeds',
      'Marketplace with full interaction: buy/sell, ROI projections, appraisal requests',
      'Document center for legal/estate and appraisal storage',
      'Dedicated tax & investment advisory sessions (monthly)',
      'Premium support with faster SLAs',
    ],
    popular: false,
  },
];

/** id → { monthly, annual } for quick price lookup / checkout fallback. */
export const FALLBACK_PRICING = PLANS.reduce((acc, p) => {
  acc[p.id] = { monthly: p.monthly, annual: p.annual };
  return acc;
}, {});
