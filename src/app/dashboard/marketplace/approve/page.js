'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getApprovalQueue, approveListing, rejectListing } from '@/utils/marketplaceApi';

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null) return '—';
  return `${currency === 'USD' ? '$' : ''}${Number(price).toLocaleString()}`;
};

export default function ApproveListingsPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, isAdvisor, mounted } = useAuth();
  const router = useRouter();
  // Admin + advisor both hold `approve:marketplace_listings`.
  const canApprove = isAdmin || isAdvisor;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  // Reject modal state.
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectBusy, setRejectBusy] = useState(false);

  useEffect(() => {
    if (mounted && !canApprove) router.replace('/dashboard');
  }, [mounted, canApprove, router]);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getApprovalQueue({ page: 1, limit: 100 });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.status === 405 || err?.status === 400 || err?.status === 404) {
        setListings([]);
      } else {
        toast.error('Failed to load the approval queue');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && canApprove) fetchPending();
  }, [fetchPending, mounted, canApprove]);

  const handleApprove = async (listing) => {
    setActionLoading((p) => ({ ...p, [listing.id]: true }));
    try {
      await approveListing(listing.id);
      toast.success('Listing approved — now live in the marketplace.');
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      // Surface the server's message — notably the 409s the backend now
      // returns (ASSET_UNDER_APPRAISAL: can't approve while a human appraisal
      // is open on the asset).
      toast.error(err?.data?.detail || err?.message || 'Failed to approve listing');
    } finally {
      setActionLoading((p) => ({ ...p, [listing.id]: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.info('A rejection reason is required.');
      return;
    }
    setRejectBusy(true);
    try {
      await rejectListing(rejectTarget.id, rejectReason.trim());
      toast.success('Listing rejected — the owner has been notified with the reason.');
      setListings((prev) => prev.filter((l) => l.id !== rejectTarget.id));
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || 'Failed to reject listing');
    } finally {
      setRejectBusy(false);
    }
  };

  if (!mounted || !canApprove) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Approve Listings</h1>
        <p className={`text-sm ${textMuted}`}>
          Review listings awaiting approval. Approving publishes them to the marketplace; rejecting sends the reason to the owner.
        </p>
      </div>

      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['Listing', 'Owner', 'Asking Price', 'Submitted', 'Advisor', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No listings awaiting approval</td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className={`border-b transition-colors ${isDarkMode ? 'border-[#FFFFFF14] hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${textMain}`}>{listing.title || 'Untitled Listing'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${textMain}`}>{listing.owner?.name || '—'}</p>
                      <p className={`text-xs ${textMuted}`}>{listing.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${textMain}`}>{fmtPrice(listing.askingPrice, listing.currency)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{fmt(listing.submittedAt || listing.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{listing.assignedAdvisor?.name || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/marketplace/detail?id=${listing.id}`)}
                          className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                            isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleApprove(listing)}
                          disabled={actionLoading[listing.id]}
                          className="text-xs px-2 py-1 rounded border font-medium transition-colors disabled:opacity-50 border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          {actionLoading[listing.id] ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => { setRejectTarget(listing); setRejectReason(''); }}
                          className="text-xs px-2 py-1 rounded border font-medium transition-colors border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject reason modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-1 ${textMain}`}>Reject listing</h3>
            <p className={`text-xs mb-4 ${textMuted}`}>
              Rejecting <span className="font-medium">{rejectTarget.title}</span>. The reason is shown to the owner.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)…"
              rows={4}
              className={`w-full px-3 py-2 rounded-lg text-sm border resize-none mb-6 focus:outline-none focus:border-[#F1CB68] ${
                isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectBusy}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
              >
                {rejectBusy ? 'Rejecting…' : 'Reject listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
