'use client';

import { useEffect, useState } from 'react';
import { getPaymentMethods, getPaymentHistory, listInvoices } from '@/utils/paymentsApi';
import { getCurrentSubscription, getSubscriptionLimits } from '@/utils/subscriptionsApi';

export default function PaymentBilling({ isDarkMode }) {
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [subRes, methodsRes, historyRes, invoicesRes, limitsRes] = await Promise.allSettled([
          getCurrentSubscription(),
          getPaymentMethods(),
          getPaymentHistory(),
          listInvoices(),
          getSubscriptionLimits(),
        ]);
        if (subRes.status === 'fulfilled') setSubscription(subRes.value.data || subRes.value.subscription || null);
        if (methodsRes.status === 'fulfilled') {
          const pmData = methodsRes.value.data || methodsRes.value.paymentMethods || [];
          setPaymentMethods(pmData);
        }
        if (historyRes.status === 'fulfilled') {
          const histData = historyRes.value.data || historyRes.value || [];
          setPaymentHistory(histData);
        }
        if (invoicesRes.status === 'fulfilled') {
          const invData = invoicesRes.value.data || invoicesRes.value || [];
          setInvoices(invData);
        }
        if (limitsRes.status === 'fulfilled') setUsage(limitsRes.value.data || limitsRes.value || null);
        if (
          subRes.status === 'rejected' &&
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
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Billing
        </h2>
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div className="mb-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`h-16 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                <div className={`h-16 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
              </div>
            </div>
          ) : subscription ? (
            <p className={`text-base mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Plan: <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {subscription.plan || subscription.planName || subscription.plan_name}
              </span>{' '}
              · Status: <span className="font-semibold text-green-400">{subscription.status}</span>
            </p>
          ) : (
            <p className={`text-base mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No active subscription.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={`block text-xs font-semibold uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ANNUAL PLAN
            </label>
            {subscription ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.amount ? `${subscription.amount} ${subscription.currency || 'USD'}` : '—'} estimated
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Next payment {subscription.currentPeriodEnd || subscription.current_period_end || '—'}
                </p>
              </>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Subscribe to a plan to see billing details.
              </p>
            )}
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              MONTHLY OVERAGE
            </label>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Overage charges will appear here when applicable.
            </p>
          </div>
        </div>
        {usage && (
          <p className={`text-xs mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Usage this period: accounts {usage.usage?.accounts?.used ?? 0}/{usage.limits?.accounts ?? '—'}, assets{' '}
            {usage.usage?.assets?.used ?? 0}/{usage.limits?.assets ?? '—'}.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20' : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              MANAGE BILLING INFO
            </button>
          </div>
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
                    <div key={method.id} className="flex items-center justify-between">
                      <div>
                        <p className={`text-base font-semibold mb-1 tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {method.type === 'card' && method.card ? `•••• •••• •••• ${method.card.last4}` : method.type}
                        </p>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {method.type === 'card' && method.card ? method.card.brand : method.type}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          method.isDefault || method.is_default ? 'bg-green-500/20 text-green-400' : isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {method.isDefault || method.is_default ? 'Default' : 'Saved'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20' : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              Manage payment methods
            </button>
          </div>
        </div>
      </div>
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
    </div>
  );
}
