'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { listDisputes, resolveDispute } from '@/utils/adminApi';

const STATUS_CONFIG = {
  open: { label: 'Open', cls: 'bg-yellow-500/20 text-yellow-400' },
  under_review: { label: 'Under Review', cls: 'bg-blue-500/20 text-blue-400' },
  resolved: { label: 'Resolved', cls: 'bg-green-500/20 text-green-400' },
  refunded: { label: 'Refunded', cls: 'bg-orange-500/20 text-orange-400' },
  released: { label: 'Released', cls: 'bg-green-500/20 text-green-400' },
};

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null) return '—';
  return `${currency === 'USD' ? '$' : ''}${Number(price).toLocaleString()}`;
};

export default function AdminDisputesPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolution, setResolution] = useState('release');
  const [notes, setNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listDisputes(statusFilter ? { status: statusFilter } : {});
      const data = res?.data ?? res;
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.status === 405 || err?.status === 400) {
        setDisputes([]);
      } else {
        toast.error('Failed to load disputes');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (mounted && isAdmin) fetchDisputes();
  }, [fetchDisputes, mounted, isAdmin]);

  const handleResolveSubmit = async () => {
    if (!resolveTarget) return;
    setResolveLoading(true);
    try {
      await resolveDispute(resolveTarget.id, resolution, notes.trim());
      toast.success(`Dispute ${resolution === 'release' ? 'released to seller' : 'refunded to buyer'}`);
      setResolveTarget(null);
      setNotes('');
      setResolution('release');
      fetchDisputes();
    } catch (err) {
      toast.error(err?.message || 'Failed to resolve dispute');
    } finally {
      setResolveLoading(false);
    }
  };

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] transition-colors ${
    isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Escrow Disputes</h1>
        <p className={`text-sm ${textMuted}`}>Review and resolve marketplace escrow disputes</p>
      </div>

      {/* Filters */}
      <div className={`${cardCls} p-4 mb-6 flex flex-wrap gap-3 items-center`}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['Listing', 'Buyer', 'Seller', 'Amount', 'Reason', 'Status', 'Opened', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No disputes found</td>
                </tr>
              ) : (
                disputes.map((d) => {
                  const statusCfg = STATUS_CONFIG[d.status] || { label: d.status, cls: 'bg-gray-500/20 text-gray-400' };
                  const canResolve = d.status === 'open' || d.status === 'under_review';
                  return (
                    <tr key={d.id} className={`border-b transition-colors ${isDarkMode ? 'border-[#FFFFFF14] hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-medium ${textMain}`}>{d.listingTitle || d.listingId || '—'}</p>
                        {d.escrowId && <p className={`text-xs font-mono ${textMuted}`}>{d.escrowId}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{d.buyerName || '—'}</p>
                        <p className={`text-xs ${textMuted}`}>{d.buyerEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{d.sellerName || '—'}</p>
                        <p className={`text-xs ${textMuted}`}>{d.sellerEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMain}`}>{fmtPrice(d.amount, d.currency)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs truncate max-w-xs ${textMuted}`} title={d.reason}>{d.reason || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs ${textMuted}`}>{fmt(d.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {canResolve ? (
                          <button
                            onClick={() => { setResolveTarget(d); setResolution('release'); setNotes(''); }}
                            className="text-xs px-2 py-1 rounded border font-medium transition-colors border-[#F1CB68]/40 text-[#F1CB68] hover:bg-[#F1CB68]/10"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className={`text-xs ${textMuted}`}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>Resolve Dispute</h3>
            <p className={`text-sm mb-4 ${textMuted}`}>
              {fmtPrice(resolveTarget.amount, resolveTarget.currency)} held in escrow for{' '}
              <span className="font-medium">{resolveTarget.listingTitle || 'this listing'}</span>.
            </p>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Resolution *</label>
              <div className="flex flex-col gap-2">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${resolution === 'release' ? 'border-[#F1CB68]' : isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                  <input type="radio" name="resolution" value="release" checked={resolution === 'release'} onChange={(e) => setResolution(e.target.value)} className="mt-1 accent-[#F1CB68]" />
                  <span>
                    <span className={`block text-sm font-medium ${textMain}`}>Release to Seller</span>
                    <span className={`block text-xs ${textMuted}`}>Funds go to the seller; sale completes.</span>
                  </span>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${resolution === 'refund' ? 'border-[#F1CB68]' : isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                  <input type="radio" name="resolution" value="refund" checked={resolution === 'refund'} onChange={(e) => setResolution(e.target.value)} className="mt-1 accent-[#F1CB68]" />
                  <span>
                    <span className={`block text-sm font-medium ${textMain}`}>Refund to Buyer</span>
                    <span className={`block text-xs ${textMuted}`}>Funds return to the buyer; sale cancels.</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Resolution Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes explaining the decision..."
                className={`w-full px-3 py-2 rounded-lg text-sm border resize-none focus:outline-none focus:border-[#F1CB68] transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResolveTarget(null)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={resolveLoading}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E] transition-colors disabled:opacity-60"
              >
                {resolveLoading ? 'Resolving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
