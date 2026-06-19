'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { listListings, approveListing } from '@/utils/marketplaceApi';

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
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listListings({ statusFilter: 'pending_approval' });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Endpoint may not be implemented yet — fail quietly with an empty list
      if (err?.status === 405 || err?.status === 400) {
        setListings([]);
      } else {
        toast.error('Failed to load pending listings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) fetchPending();
  }, [fetchPending, mounted, isAdmin]);

  const handleApprove = async (listing) => {
    setActionLoading((p) => ({ ...p, [listing.id]: true }));
    try {
      await approveListing(listing.id);
      toast.success('Listing approved');
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      toast.error(err?.message || 'Failed to approve listing');
    } finally {
      setActionLoading((p) => ({ ...p, [listing.id]: false }));
    }
  };

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Approve Listings</h1>
        <p className={`text-sm ${textMuted}`}>Review and approve marketplace listings awaiting approval</p>
      </div>

      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['Listing', 'Asset Type', 'Asking Price', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No listings awaiting approval</td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className={`border-b transition-colors ${isDarkMode ? 'border-[#FFFFFF14] hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${textMain}`}>{listing.title || listing.assetName || 'Untitled Listing'}</p>
                      {listing.description && (
                        <p className={`text-xs truncate max-w-xs ${textMuted}`}>{listing.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium bg-blue-500/20 text-blue-400`}>
                        {listing.assetType || listing.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${textMain}`}>{fmtPrice(listing.askingPrice, listing.currency)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{fmt(listing.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/marketplace/${listing.id}`)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
