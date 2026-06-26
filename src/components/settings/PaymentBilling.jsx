'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getPaymentMethods,
  getPaymentHistory,
  listInvoices,
  removePaymentMethod,
} from '@/utils/paymentsApi';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import CurrentPlanCard from '@/components/settings/CurrentPlanCard';
import PlanSelector from '@/components/settings/PlanSelector';
import PlanFeatures from '@/components/settings/PlanFeatures';
import SubscriptionHistory from '@/components/settings/SubscriptionHistory';
import PlanChangeModal from '@/components/settings/PlanChangeModal';
import AddPaymentMethodModal from '@/components/settings/AddPaymentMethodModal';

export default function PaymentBilling({ isDarkMode }) {
  const router = useRouter();
  const { isAdmin, isAdvisor } = useAuth();
  const {
    current,
    plans,
    limits,
    permissions,
    history,
    loading: subLoading,
    error: subError,
    subscribe,
    changePlan,
    cancel,
    renew,
  } = useSubscription();

  // Payment methods / payment history / invoices stay on paymentsApi.
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared confirmation modal state.
  const [modal, setModal] = useState({ open: false, action: 'subscribe', plan: null, billingCycle: 'monthly', busy: false });
  // Add-payment-method (Stripe Elements) modal + per-method delete state.
  const [addPmOpen, setAddPmOpen] = useState(false);
  const [deletingPm, setDeletingPm] = useState(null);

  // Reload only the saved payment methods (after add/remove).
  const refreshPaymentMethods = useCallback(async () => {
    try {
      const res = await getPaymentMethods();
      setPaymentMethods(res.data || res.paymentMethods || []);
    } catch (err) {
      console.error('Error refreshing payment methods:', err);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [methodsRes, historyRes, invoicesRes] = await Promise.allSettled([
        getPaymentMethods(),
        getPaymentHistory(),
        listInvoices(),
      ]);
      if (methodsRes.status === 'fulfilled') {
        setPaymentMethods(methodsRes.value.data || methodsRes.value.paymentMethods || []);
      }
      if (historyRes.status === 'fulfilled') {
        setPaymentHistory(historyRes.value.data || historyRes.value || []);
      }
      if (invoicesRes.status === 'fulfilled') {
        setInvoices(invoicesRes.value.data || invoicesRes.value || []);
      }
      if (
        methodsRes.status === 'rejected' &&
        historyRes.status === 'rejected' &&
        invoicesRes.status === 'rejected'
      ) {
        setError('Failed to load payment and billing data.');
      }
    } catch (err) {
      console.error('Error loading payment & billing:', err);
      setError(err.message || 'Failed to load payment and billing data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRemovePaymentMethod = async (methodId) => {
    setDeletingPm(methodId);
    try {
      await removePaymentMethod(methodId);
      toast.success('Payment method removed');
      await refreshPaymentMethods();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove payment method');
    } finally {
      setDeletingPm(null);
    }
  };

  const openModal = (action, plan, billingCycle = 'monthly') =>
    setModal({ open: true, action, plan, billingCycle, busy: false });

  const setModalOpen = (open) => setModal((m) => ({ ...m, open }));

  const handleConfirm = async () => {
    setModal((m) => ({ ...m, busy: true }));
    const { action, plan, billingCycle } = modal;
    const id = plan?.id ?? plan?.planId ?? plan?.plan_id;
    let ok = false;
    if (action === 'subscribe') ok = await subscribe(id, billingCycle);
    else if (action === 'upgrade' || action === 'downgrade') ok = await changePlan(id, billingCycle);
    else if (action === 'cancel') ok = await cancel();
    else if (action === 'renew') ok = await renew();
    setModal((m) => ({ ...m, busy: false, open: ok ? false : m.open }));
  };

  if (isAdmin || isAdvisor) {
    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billing</h2>
        <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F1CB68]">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No subscription required
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isAdmin ? 'Admin' : 'Advisor'} accounts have full platform access and do not require a subscription plan.
                Subscriptions apply to investor accounts only.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billing</h2>
      </div>

      {(error || subError) && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">{error || subError}</div>
      )}

      {/* 1. Current plan */}
      <CurrentPlanCard
        current={current}
        loading={subLoading}
        onCancel={() => openModal('cancel', null)}
        onRenew={() => openModal('renew', null)}
        isDarkMode={isDarkMode}
      />

      {/* 2. Available plans */}
      <PlanSelector
        plans={plans}
        current={current}
        loading={subLoading}
        onSelectPlan={(plan, billingCycle, action) =>
          action === 'contact' ? router.push('/contact') : openModal(action, plan, billingCycle)
        }
        isDarkMode={isDarkMode}
      />

      {/* 3. Plan features */}
      <PlanFeatures permissions={permissions} loading={subLoading} isDarkMode={isDarkMode} />

      {/* 4. Usage + Payment methods (existing markup) */}
      <div className={`rounded-2xl p-4 md:p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
        {limits && (
          <p className={`text-xs mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Usage this period: accounts {limits.usage?.accounts?.used ?? 0}/{limits.limits?.accounts ?? '—'}, assets{' '}
            {limits.usage?.assets?.used ?? 0}/{limits.limits?.assets ?? '—'}.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill To card */}
          <div
            className={`rounded-xl p-5 border ${
              isDarkMode ? 'bg-gradient-to-br from-[#1A1A1D] to-[#151518] border-[#F1CB68]/20' : 'bg-gradient-to-br from-white to-gray-50 border-[#F1CB68]/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F1CB68]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                BILL TO
              </label>
            </div>
            <div className={`px-4 py-4 rounded-lg mb-4 ${isDarkMode ? 'bg-white/5 border border-[#FFFFFF14]' : 'bg-white/80 border border-gray-200'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Billing contact information is managed on your account profile.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/settings?tab=profile')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20' : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              MANAGE BILLING INFO
            </button>
          </div>
          {/* Payment Method card */}
          <div
            className={`rounded-xl p-5 border ${
              isDarkMode ? 'bg-gradient-to-br from-[#1A1A1D] to-[#151518] border-[#F1CB68]/20' : 'bg-gradient-to-br from-white to-gray-50 border-[#F1CB68]/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F1CB68]">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                PAYMENT METHOD
              </label>
            </div>
            <div className={`px-4 py-4 rounded-lg mb-4 ${isDarkMode ? 'bg-white/5 border border-[#FFFFFF14]' : 'bg-white/80 border border-gray-200'}`}>
              {loading ? (
                <div className="animate-pulse h-6 w-40 rounded bg-white/10" />
              ) : paymentMethods.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No saved payment methods.</p>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between gap-2">
                      <div>
                        <p className={`text-base font-semibold mb-1 tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {method.type === 'card' && method.card ? `•••• •••• •••• ${method.card.last4}` : method.type}
                        </p>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {method.type === 'card' && method.card ? method.card.brand : method.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            method.isDefault || method.is_default ? 'bg-green-500/20 text-green-400' : isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {method.isDefault || method.is_default ? 'Default' : 'Saved'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          disabled={deletingPm === method.id}
                          aria-label="Remove payment method"
                          className="p-1.5 rounded-md text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                        >
                          {deletingPm === method.id ? (
                            <span className="text-xs">…</span>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setAddPmOpen(true)}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20' : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              Add payment method
            </button>
          </div>
        </div>
      </div>

      {/* 5. Subscription history */}
      <SubscriptionHistory history={history} loading={subLoading} isDarkMode={isDarkMode} />

      {/* 6. Payment history — existing markup */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Payment history
        </h3>
        {loading && (
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading payments...</p>
        )}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CREATION DATE</th>
                <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DETAILS</th>
                <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>INVOICE TOTAL</th>
                <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>INVOICE</th>
                <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className={`py-6 px-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No payments found.
                  </td>
                </tr>
              ) : (
                paymentHistory.map((payment, index) => (
                  <tr key={index} className={`border-b last:border-0 ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                    <td className={`py-4 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.createdAt || payment.created_at || payment.date}
                    </td>
                    <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{payment.description || payment.details}</td>
                    <td className={`py-4 px-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.amount != null ? `${payment.amount} ${payment.currency || 'USD'}` : ''}
                    </td>
                    <td className="py-4 px-4">
                      <a
                        href={payment.invoiceUrl || payment.invoice_url || '#'}
                        className={`inline-flex items-center gap-1 text-sm ${isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'} hover:opacity-80 transition-opacity`}
                      >
                        PDF
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">{payment.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4">
          {paymentHistory.length === 0 && !loading ? (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No payments found.</p>
          ) : (
            paymentHistory.map((payment, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${isDarkMode ? 'bg-white/5 border-[#FFFFFF14]' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {payment.createdAt || payment.created_at || payment.date}
                  </p>
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">{payment.status}</span>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{payment.description || payment.details}</p>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {payment.amount != null ? `${payment.amount} ${payment.currency || 'USD'}` : ''}
                  </span>
                  <a
                    href={payment.invoiceUrl || payment.invoice_url || '#'}
                    className={`inline-flex items-center gap-1 text-sm ${isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'} hover:opacity-80 transition-opacity`}
                  >
                    PDF
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PlanChangeModal
        isOpen={modal.open}
        setIsOpen={setModalOpen}
        action={modal.action}
        plan={modal.plan}
        billingCycle={modal.billingCycle}
        busy={modal.busy}
        onConfirm={handleConfirm}
        isDarkMode={isDarkMode}
      />

      <AddPaymentMethodModal
        isOpen={addPmOpen}
        setIsOpen={setAddPmOpen}
        onAdded={refreshPaymentMethods}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
