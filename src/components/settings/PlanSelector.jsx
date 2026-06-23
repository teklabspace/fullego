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
