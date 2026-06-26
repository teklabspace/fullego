'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Modal from '@/components/ui/Modal';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { addPaymentMethod } from '@/utils/paymentsApi';

// Shared Stripe instance promise for the Elements provider.
const stripePromise = getStripe();

// CardElement styling tuned for both themes. Stripe Elements render in an iframe,
// so colours must be passed via the `style` option rather than Tailwind classes.
const cardStyle = (isDarkMode) => ({
  style: {
    base: {
      color: isDarkMode ? '#FFFFFF' : '#111827',
      fontFamily: 'inherit',
      fontSize: '15px',
      '::placeholder': { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
      iconColor: '#F1CB68',
    },
    invalid: { color: '#F87171', iconColor: '#F87171' },
  },
});

function AddCardForm({ onAdded, onClose, isDarkMode }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setBusy(true);
    setCardError(null);

    const card = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      setCardError(error.message);
      setBusy(false);
      return;
    }

    try {
      await addPaymentMethod({ paymentMethodId: paymentMethod.id, isDefault });
      toast.success('Payment method added');
      onAdded?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to save payment method');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Add payment method
      </h3>

      <div
        className={`rounded-lg px-4 py-3.5 mb-3 border ${
          isDarkMode ? 'bg-white/5 border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <CardElement
          options={cardStyle(isDarkMode)}
          onChange={(ev) => setCardError(ev.error ? ev.error.message : null)}
        />
      </div>

      {cardError && <p className="text-xs text-red-400 mb-3">{cardError}</p>}

      <label className={`flex items-center gap-2 text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="accent-[#F1CB68]"
        />
        Set as default payment method
      </label>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
            isDarkMode
              ? 'bg-white/5 text-gray-300 border border-[#FFFFFF14] hover:bg-white/10'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || !stripe}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 bg-[#F1CB68]/15 text-[#BF9B30] border border-[#F1CB68]/40 hover:bg-[#F1CB68]/25"
        >
          {busy ? 'Saving…' : 'Add card'}
        </button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodModal({ isOpen, setIsOpen, onAdded, isDarkMode }) {
  const close = () => setIsOpen(false);

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth="max-w-md">
      {!isStripeConfigured() ? (
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add payment method
          </h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Payment processing is not configured. Set{' '}
            <code className="text-[#F1CB68]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable adding cards.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold ${
                isDarkMode ? 'bg-white/5 text-gray-300 border border-[#FFFFFF14]' : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <AddCardForm onAdded={onAdded} onClose={close} isDarkMode={isDarkMode} />
        </Elements>
      )}
    </Modal>
  );
}
