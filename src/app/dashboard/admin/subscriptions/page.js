'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  listAdminSubscriptions,
  cancelSubscription,
  updateSubscriptionPlan,
} from '@/utils/adminApi';

const TIER_OPTIONS = [
  { id: 'starter', name: 'Starter' },
  { id: 'pro', name: 'Pro' },
  { id: 'premium', name: 'Premium' },
];

const planBadge = (plan) => {
  const map = {
    // Current tier ids
    starter: 'bg-blue-500/20 text-blue-400',
    pro: 'bg-[#F1CB68]/20 text-[#F1CB68]',
    premium: 'bg-purple-500/20 text-purple-400',
    // Legacy enums (kept for back-compat)
    free: 'bg-gray-500/20 text-gray-400',
    monthly: 'bg-blue-500/20 text-blue-400',
    annual: 'bg-[#F1CB68]/20 text-[#F1CB68]',
  };
  return map[String(plan || '').toLowerCase()] || 'bg-gray-500/20 text-gray-400';
};

const statusBadge = (status) => {
  const map = {
    active: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-orange-500/20 text-orange-400',
    past_due: 'bg-yellow-500/20 text-yellow-400',
  };
  return map[status] || 'bg-gray-500/20 text-gray-400';
};

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AdminSubscriptionsPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [subs, setSubs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState({ total: 0, active: 0, cancelled: 0, revenue: 0 });
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [changePlanTarget, setChangePlanTarget] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const [newBillingCycle, setNewBillingCycle] = useState('monthly');
  const [planReason, setPlanReason] = useState('');
  const [changePlanLoading, setChangePlanLoading] = useState(false);

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchSubs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 20,
        ...(search ? { search } : {}),
        ...(planFilter ? { plan: planFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };
      const res = await listAdminSubscriptions(params);
      setSubs(res.data || []);
      setPagination(res.pagination || { page: 1, page_size: 20, total: 0, total_pages: 1 });

      if (!summaryLoaded) {
        const all = res.data || [];
        const allRes = await listAdminSubscriptions({ page: 1, page_size: 1000 });
        const allData = allRes.data || [];
        setSummary({
          total: allRes.pagination?.total || allData.length,
          active: allData.filter((s) => s.status === 'active').length,
          cancelled: allData.filter((s) => s.status === 'cancelled').length,
          revenue: allData
            .filter((s) => s.status === 'active')
            .reduce((acc, s) => acc + (s.amount || 0), 0),
        });
        setSummaryLoaded(true);
      }
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter, summaryLoaded]);

  useEffect(() => {
    if (mounted && isAdmin) fetchSubs();
  }, [fetchSubs, mounted, isAdmin]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelSubscription(cancelTarget.id);
      toast.success('Subscription cancelled');
      setCancelTarget(null);
      setSummaryLoaded(false);
      fetchSubs();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!changePlanTarget || !newPlan) return;
    setChangePlanLoading(true);
    try {
      await updateSubscriptionPlan(changePlanTarget.id, {
        planId: newPlan,
        billingCycle: newBillingCycle,
        reason: planReason,
      });
      toast.success('Plan updated');
      setChangePlanTarget(null);
      setNewPlan('');
      setPlanReason('');
      setSummaryLoaded(false);
      fetchSubs();
    } catch (err) {
      toast.error(err?.message || 'Failed to update plan');
    } finally {
      setChangePlanLoading(false);
    }
  };

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] transition-colors ${
    isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const summaryCards = [
    { label: 'Total Subscriptions', value: summary.total },
    { label: 'Active', value: summary.active, color: 'text-green-400' },
    { label: 'Cancelled', value: summary.cancelled, color: 'text-red-400' },
    { label: 'Revenue (Active)', value: `$${summary.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-[#F1CB68]' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Subscriptions</h1>
        <p className={`text-sm ${textMuted}`}>Manage user subscriptions and plans</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c) => (
          <div key={c.label} className={`${cardCls} p-4`}>
            <p className={`text-xs mb-2 ${textMuted}`}>{c.label}</p>
            <p className={`text-2xl font-bold ${c.color || textMain}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${cardCls} p-4 mb-6 flex flex-wrap gap-3 items-center`}>
        <input
          type="text"
          placeholder="Search by user name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className={`${inputCls} flex-1 min-w-48`}
        />
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="past_due">Past Due</option>
        </select>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['User', 'Plan', 'Status', 'Amount', 'Period End', 'Stripe ID', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No subscriptions found</td>
                </tr>
              ) : (
                subs.map((sub) => (
                  <tr key={sub.id} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${textMain}`}>{sub.user_name}</p>
                      <p className={`text-xs ${textMuted}`}>{sub.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${planBadge(sub.plan_id || sub.plan)}`}>
                        {sub.plan_name || sub.plan_id || sub.plan || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge(sub.status)}`}>
                        {sub.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${textMain}`}>
                        {sub.amount != null ? `$${sub.amount.toFixed(2)} ${sub.currency || ''}` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{fmt(sub.current_period_end)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs font-mono ${textMuted} truncate max-w-28`} title={sub.stripe_subscription_id}>
                        {sub.stripe_subscription_id || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setChangePlanTarget(sub);
                            setNewPlan(sub.plan_id || sub.plan || 'starter');
                            setNewBillingCycle(sub.billing_cycle || 'monthly');
                            setPlanReason('');
                          }}
                          className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                            isDarkMode
                              ? 'border-[#FFFFFF14] text-white hover:bg-white/10'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Change Plan
                        </button>
                        {sub.status !== 'cancelled' && (
                          <button
                            onClick={() => setCancelTarget(sub)}
                            className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                              isDarkMode
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
            <p className={`text-xs ${textMuted}`}>
              {pagination.total} total · page {pagination.page} of {pagination.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 ${
                  isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Prev
              </button>
              {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.total_pages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded transition-colors ${
                      p === page
                        ? 'bg-[#F1CB68] text-[#101014] font-semibold'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-white/10'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className={`px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 ${
                  isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>Cancel Subscription</h3>
            <p className={`text-sm mb-1 ${textMuted}`}>
              Cancel the <span className="font-medium">{cancelTarget.plan_name || cancelTarget.plan_id || cancelTarget.plan}</span> subscription for{' '}
              <span className="font-medium">{cancelTarget.user_name}</span>?
            </p>
            <p className={`text-xs mb-6 ${textMuted}`}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {changePlanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${textMain}`}>Change Plan</h3>
            <p className={`text-sm mb-4 ${textMuted}`}>
              Changing plan for <span className="font-medium">{changePlanTarget.user_name}</span>
            </p>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>New Plan</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className={`w-full ${inputCls}`}
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id} className={isDarkMode ? 'bg-[#1A1A1D]' : ''}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Billing Cycle</label>
              <select
                value={newBillingCycle}
                onChange={(e) => setNewBillingCycle(e.target.value)}
                className={`w-full ${inputCls}`}
              >
                <option value="monthly" className={isDarkMode ? 'bg-[#1A1A1D]' : ''}>Monthly</option>
                <option value="annual" className={isDarkMode ? 'bg-[#1A1A1D]' : ''}>Annual</option>
              </select>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Reason (optional)</label>
              <input
                type="text"
                value={planReason}
                onChange={(e) => setPlanReason(e.target.value)}
                placeholder="e.g. Customer request, promotional upgrade..."
                className={`w-full ${inputCls}`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setChangePlanTarget(null)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={changePlanLoading || !newPlan}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014] transition-colors disabled:opacity-60"
              >
                {changePlanLoading ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
