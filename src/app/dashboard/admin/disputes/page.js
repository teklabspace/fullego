'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  listEscrows,
  adminReleaseEscrow,
  adminRefundEscrow,
} from '@/utils/adminApi';

// Escrow status → badge styling. Matches the state machine in the escrow spec
// (pending → funded → released, with disputed / refunded branches).
const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'bg-yellow-500/20 text-yellow-400' },
  funded: { label: 'Funded', cls: 'bg-blue-500/20 text-blue-400' },
  released: { label: 'Released', cls: 'bg-green-500/20 text-green-400' },
  refunded: { label: 'Refunded', cls: 'bg-orange-500/20 text-orange-400' },
  disputed: { label: 'Disputed', cls: 'bg-red-500/20 text-red-400' },
};

// Status tabs. '' = all escrows. The rest map to the backend `status_filter`.
// This single page is both the escrow oversight table and the disputes queue
// (the Disputed tab), driven by GET /admin/escrow alone.
const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'funded', label: 'Funded' },
  { key: 'released', label: 'Released' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'disputed', label: 'Disputed' },
];

const PAGE_SIZE = 20;

// Neutral placeholder for escrows whose asset has no photo (thumbnail_url null).
const THUMB_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%232A2A2D'/%3E%3Cpath d='M30 62l16-18 12 14 8-9 14 16H30z' fill='%234A4A4D'/%3E%3Ccircle cx='40' cy='36' r='7' fill='%234A4A4D'/%3E%3C/svg%3E";

const fmt = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null) return '—';
  return `${currency === 'USD' ? '$' : ''}${Number(price).toLocaleString()}`;
};

export default function AdminDisputesPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // The action confirm modal: { escrow, action: 'release' | 'refund' }.
  const [actionTarget, setActionTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [viewTarget, setViewTarget] = useState(null); // row opened in the detail modal

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchEscrows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listEscrows({ statusFilter: statusFilter || undefined, page, limit: PAGE_SIZE });
      // The client unwraps the envelope, so `res` is the payload
      // ({ items, total, page, limit, pages }). Fall back defensively.
      const payload = res?.data ?? res ?? {};
      const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
      setEscrows(items);
      setTotalPages(payload.pages || 1);
      setTotal(payload.total ?? items.length);
    } catch (err) {
      // Until the new backend ships, /admin/escrow 404s — degrade to an empty
      // table rather than a scary error toast.
      if (err?.status === 404 || err?.status === 405 || err?.status === 400) {
        setEscrows([]);
        setTotalPages(1);
        setTotal(0);
      } else {
        toast.error('Failed to load escrows');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    if (mounted && isAdmin) fetchEscrows();
  }, [fetchEscrows, mounted, isAdmin]);

  // Re-fetch when the window regains focus — an investor action can move an
  // escrow's status out from under the admin table.
  useEffect(() => {
    if (!(mounted && isAdmin)) return;
    const onFocus = () => fetchEscrows();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchEscrows, mounted, isAdmin]);

  const selectTab = (key) => {
    setStatusFilter(key);
    setPage(1);
  };

  // Confirm a release/refund. Both admin endpoints handle funded AND disputed,
  // so we always call them (no separate dispute-resolve path needed). On success
  // the endpoint returns the updated escrow, which we patch into the row in place
  // — no full-table reload.
  const handleActionSubmit = async () => {
    if (!actionTarget) return;
    const { escrow, action } = actionTarget;
    setActionLoading(true);
    try {
      const res =
        action === 'release'
          ? await adminReleaseEscrow(escrow.id, reason.trim())
          : await adminRefundEscrow(escrow.id, reason.trim());
      // The client unwraps the envelope, so `res` is the updated escrow object.
      const updated = res?.data ?? res;
      if (updated && updated.id) {
        setEscrows((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
      } else {
        fetchEscrows();
      }
      toast.success(action === 'release' ? 'Funds released to the seller.' : 'Escrow refunded to the buyer.');
      setActionTarget(null);
      setReason('');
    } catch (err) {
      const code = err?.data?.error?.code;
      if (err?.status === 400 || code === 'INVALID_ESCROW_STATE') {
        // Idempotency guard — someone already resolved it. Resync so the row
        // reflects the true state.
        toast.info('This escrow was already resolved. Refreshing…');
        setActionTarget(null);
        fetchEscrows();
      } else if (err?.status === 404) {
        toast.error('This escrow no longer exists. Refreshing…');
        setActionTarget(null);
        fetchEscrows();
      } else {
        toast.error(err?.data?.message || err?.message || `Failed to ${action} escrow`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (escrow, action) => {
    setActionTarget({ escrow, action });
    setReason('');
  };

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Escrow &amp; Disputes</h1>
        <p className={`text-sm ${textMuted}`}>
          Oversight of every marketplace escrow. Resolve disputes from the Disputed tab.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            onClick={() => selectTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              statusFilter === tab.key
                ? 'bg-[#F1CB68] text-[#101014] border-[#F1CB68]'
                : isDarkMode
                ? 'border-[#FFFFFF14] text-gray-300 hover:bg-white/5'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className={`ml-auto text-xs ${textMuted}`}>{total} total</span>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['Asset', 'Buyer', 'Seller', 'Amount', 'Commission', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && escrows.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : escrows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No escrows found</td>
                </tr>
              ) : (
                escrows.map((e) => {
                  const st = String(e.status || '').toLowerCase();
                  const statusCfg = STATUS_CONFIG[st] || { label: e.status || '—', cls: 'bg-gray-500/20 text-gray-400' };
                  // Release / refund are actionable while funds are held (funded)
                  // or under dispute.
                  const canAct = st === 'funded' || st === 'disputed';
                  return (
                    <tr key={e.id} className={`border-b transition-colors ${isDarkMode ? 'border-[#FFFFFF14] hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={e.thumbnail_url || THUMB_PLACEHOLDER}
                            alt={e.asset_name || e.listing_title || 'Asset'}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate max-w-[200px] ${textMain}`}>
                              {e.listing_title || e.asset_name || '—'}
                            </p>
                            {e.id && <p className={`text-xs font-mono truncate max-w-[200px] ${textMuted}`}>{e.id}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{e.buyer?.account_name || '—'}</p>
                        <p className={`text-xs ${textMuted}`}>{e.buyer?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{e.seller?.account_name || '—'}</p>
                        <p className={`text-xs ${textMuted}`}>{e.seller?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{fmtPrice(e.amount, e.currency)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMuted}`}>{e.commission != null ? fmtPrice(e.commission, e.currency) : '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs ${textMuted}`}>{fmt(e.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {/* Every row can be inspected. */}
                          <button
                            onClick={() => setViewTarget(e)}
                            className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                              isDarkMode ? 'border-[#FFFFFF14] text-gray-200 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            View
                          </button>
                          {/* Release funds to the seller. */}
                          {canAct && (
                            <button
                              onClick={() => openAction(e, 'release')}
                              className="text-xs px-2 py-1 rounded border font-medium transition-colors border-green-500/40 text-green-500 hover:bg-green-500/10"
                            >
                              Release
                            </button>
                          )}
                          {/* Refund the buyer. */}
                          {canAct && (
                            <button
                              onClick={() => openAction(e, 'refund')}
                              className="text-xs px-2 py-1 rounded border font-medium transition-colors border-red-400/30 text-red-400 hover:bg-red-400/10"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className={`text-sm ${textMuted}`}>Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/5' : 'border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/5' : 'border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal — the list item is self-contained (spec §3a), so no extra
          fetch is needed to show the full escrow record. */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setViewTarget(null)}>
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`} onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${textMain}`}>Escrow Detail</h3>
              <button onClick={() => setViewTarget(null)} className={textMuted}>✕</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={viewTarget.thumbnail_url || THUMB_PLACEHOLDER}
                alt={viewTarget.asset_name || viewTarget.listing_title || 'Asset'}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${textMain}`}>{viewTarget.listing_title || viewTarget.asset_name || '—'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(STATUS_CONFIG[String(viewTarget.status || '').toLowerCase()] || { cls: 'bg-gray-500/20 text-gray-400' }).cls}`}>
                  {(STATUS_CONFIG[String(viewTarget.status || '').toLowerCase()] || { label: viewTarget.status }).label}
                </span>
              </div>
            </div>
            <div className={`rounded-lg p-4 space-y-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              {[
                ['Escrow ID', viewTarget.id, true],
                ['Amount', fmtPrice(viewTarget.amount, viewTarget.currency)],
                ['Commission', viewTarget.commission != null ? fmtPrice(viewTarget.commission, viewTarget.currency) : '—'],
                ['Buyer', `${viewTarget.buyer?.account_name || '—'}${viewTarget.buyer?.email ? ` · ${viewTarget.buyer.email}` : ''}`],
                ['Seller', `${viewTarget.seller?.account_name || '—'}${viewTarget.seller?.email ? ` · ${viewTarget.seller.email}` : ''}`],
                ['Listing ID', viewTarget.listing_id, true],
                ['Offer ID', viewTarget.offer_id, true],
                ['Payment Intent', viewTarget.stripe_payment_intent_id || '—', true],
                ['Created', fmt(viewTarget.created_at)],
                ['Released', fmt(viewTarget.released_at)],
                // Audit trail — present once an admin has resolved the escrow.
                ...(viewTarget.resolved_by ? [['Resolved by', viewTarget.resolved_by, true]] : []),
                ...(viewTarget.resolution_reason ? [['Resolution reason', viewTarget.resolution_reason]] : []),
              ].map(([label, value, mono]) => (
                <div key={label} className="flex justify-between items-center gap-3 py-1">
                  <span className={`text-xs ${textMuted}`}>{label}</span>
                  <span className={`text-xs font-medium text-right truncate max-w-[60%] ${mono ? 'font-mono' : ''} ${textMain}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Release / Refund confirm modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>
              {actionTarget.action === 'release' ? 'Release funds to seller' : 'Refund the buyer'}
            </h3>
            <p className={`text-sm mb-4 ${textMuted}`}>
              {fmtPrice(actionTarget.escrow.amount, actionTarget.escrow.currency)} held in escrow for{' '}
              <span className="font-medium">{actionTarget.escrow.listing_title || actionTarget.escrow.asset_name || 'this listing'}</span>.
              {actionTarget.action === 'release'
                ? ' The funds go to the seller and the sale completes.'
                : ' The funds return to the buyer and the sale cancels.'}
            </p>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Reason</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(ev) => setReason(ev.target.value)}
                placeholder="Optional reason explaining the decision..."
                className={`w-full px-3 py-2 rounded-lg text-sm border resize-none focus:outline-none focus:border-[#F1CB68] transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionTarget(null)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-60 ${
                  actionTarget.action === 'release' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading
                  ? (actionTarget.action === 'release' ? 'Releasing…' : 'Refunding…')
                  : (actionTarget.action === 'release' ? 'Release funds' : 'Refund buyer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
