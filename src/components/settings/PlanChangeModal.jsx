'use client';
import Modal from '@/components/ui/Modal';

const COPY = {
  subscribe: { title: 'Confirm subscription', verb: 'Subscribe' },
  upgrade: { title: 'Confirm upgrade', verb: 'Continue to checkout' },
  downgrade: { title: 'Confirm downgrade', verb: 'Downgrade' },
  cancel: { title: 'Cancel subscription', verb: 'Cancel plan' },
  renew: { title: 'Renew subscription', verb: 'Renew' },
};

// Format a price for display. Numbers (live backend prices) render as currency
// via Intl; strings (pre-formatted fallback data) pass through untouched.
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
  const currency = plan?.currency || 'USD';
  // Backend plans carry separate monthly_price/annual_price (camelCased by the
  // transform), not a flat `price`. Pick the cycle the user is confirming, then
  // fall back to any legacy flat field.
  const rawPrice =
    billingCycle === 'annual'
      ? plan?.annualPrice ?? plan?.annual_price
      : plan?.monthlyPrice ?? plan?.monthly_price;
  const price = formatMoney(rawPrice ?? plan?.price ?? plan?.amount, currency);

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
                  {price}
                  {typeof rawPrice === 'number' && (
                    <span className="font-normal opacity-70">
                      {' '}/{billingCycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  )}
                </span>
              </p>
            )}
            <p className="pt-2 text-xs opacity-70">
              {action === 'upgrade'
                ? 'You will be taken to our secure Stripe checkout to review and pay for the new plan before it is upgraded.'
                : 'Your saved payment method will be charged by our billing provider.'}
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
