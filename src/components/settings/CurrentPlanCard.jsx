'use client';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

const isActiveStatus = (status) => ['active', 'trialing'].includes(String(status || '').toLowerCase());

// Format a price for display. Numbers (live backend prices) render as currency
// via Intl; strings pass through untouched.
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

export default function CurrentPlanCard({ current, capabilities, loading, onCancel, onRenew, isDarkMode }) {
  const planName = current?.planName || current?.plan_name || current?.plan;
  const status = current?.status;
  const currency = current?.currency || 'USD';
  const billingCycle = current?.billingCycle || current?.billing_cycle;
  const cancelAtPeriodEnd = current?.cancelAtPeriodEnd ?? current?.cancel_at_period_end;
  // Subscriptions may carry separate monthly_price/annual_price (camelCased by
  // the transform) plus a billing_cycle, or a flat amount/price. Prefer the
  // cycle-matched price, then fall back to any flat field.
  const cyclePrice =
    billingCycle === 'annual'
      ? current?.annualPrice ?? current?.annual_price
      : current?.monthlyPrice ?? current?.monthly_price;
  const amount = formatMoney(cyclePrice ?? current?.amount ?? current?.price, currency);
  const cycleSuffix = billingCycle ? ` (${billingCycle})` : '';
  const nextPayment = formatDate(current?.currentPeriodEnd || current?.current_period_end);
  const active = isActiveStatus(status);
  // Prefer the backend capability flag; fall back to status if flags are absent.
  const showCancel = capabilities ? !!capabilities.canCancel : active;
  const showRenew = !showCancel && !!current && !active;

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
            {amount != null ? `${amount}${cycleSuffix}` : '—'} · Next payment {nextPayment}
          </p>
          {cancelAtPeriodEnd && (
            <p className="text-xs text-amber-400 mb-4">
              Scheduled to cancel — your plan stays active until {nextPayment}.
            </p>
          )}
          <div className="flex gap-3">
            {showCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 transition-all"
              >
                Cancel subscription
              </button>
            ) : showRenew ? (
              <button
                type="button"
                onClick={onRenew}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#F1CB68]/15 text-[#BF9B30] border border-[#F1CB68]/40 hover:bg-[#F1CB68]/25 transition-all"
              >
                Renew subscription
              </button>
            ) : null}
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
