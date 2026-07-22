'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  listAdminVerifications,
  approveVerification,
  rejectVerification,
  sendKycVerificationLink,
  getUserKyc,
} from '@/utils/adminApi';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', cls: 'bg-gray-500/20 text-gray-400' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-500/20 text-blue-400' },
  pending_review: { label: 'Pending Review', cls: 'bg-yellow-500/20 text-yellow-400' },
  approved: { label: 'Approved', cls: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-500/20 text-red-400' },
  expired: { label: 'Expired', cls: 'bg-orange-500/20 text-orange-400' },
};

const typeBadge = (type) =>
  type === 'kyc'
    ? 'bg-purple-500/20 text-purple-400'
    : 'bg-blue-500/20 text-blue-400';

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const titleCase = (s) =>
  s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

export default function AdminVerificationsPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [verifications, setVerifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  const [typeTab, setTypeTab] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // KYC documents for the drawer (view_url is a short-lived signed URL, so
  // re-fetch on every open rather than caching).
  const [kycDocs, setKycDocs] = useState(null);
  const [kycDocsLoading, setKycDocsLoading] = useState(false);
  const [docPreview, setDocPreview] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 20,
        ...(typeTab ? { type: typeTab } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(methodFilter ? { method: methodFilter } : {}),
        ...(search ? { search } : {}),
      };
      const res = await listAdminVerifications(params);
      setVerifications(res.data || []);
      setPagination(res.pagination || { page: 1, page_size: 20, total: 0, total_pages: 1 });
    } catch {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [page, typeTab, statusFilter, methodFilter, search]);

  useEffect(() => {
    if (mounted && isAdmin) fetchVerifications();
  }, [fetchVerifications, mounted, isAdmin]);

  // Load the user's KYC documents (Persona + manual uploads) when a KYC row's
  // drawer opens, so the admin can review them without leaving this page.
  useEffect(() => {
    if (!drawerOpen || !selectedItem || selectedItem.type !== 'kyc') {
      setKycDocs(null);
      return;
    }
    let cancelled = false;
    setKycDocsLoading(true);
    getUserKyc(selectedItem.user_id)
      .then((res) => {
        // Payload is nested one level deeper than the envelope: detail lives on res.data.
        const detail = res?.data || res || {};
        if (!cancelled) setKycDocs(Array.isArray(detail.documents) ? detail.documents : []);
      })
      .catch(() => {
        if (!cancelled) setKycDocs([]);
      })
      .finally(() => {
        if (!cancelled) setKycDocsLoading(false);
      });
    return () => { cancelled = true; };
  }, [drawerOpen, selectedItem]);

  const handleApprove = async (item, e) => {
    e.stopPropagation();
    const key = item.id + '_approve';
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await approveVerification(item.type, item.id);
      toast.success(`${item.type.toUpperCase()} approved`);
      fetchVerifications();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve');
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // Manual-verification fallback: email a rejected/expired-KYC user a tokenized
  // upload link. Backend regenerates the token on every send (old link dies).
  const handleSendLink = async (item, e) => {
    e?.stopPropagation();
    const key = item.id + '_sendlink';
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      const res = await sendKycVerificationLink(item.user_id);
      // Payload is nested: envelope data -> { message, data: { email_sent, ... } }.
      const info = res?.data ?? res ?? {};
      if (info.email_sent === false) {
        toast.warn('Link created, but the email failed to send — try re-sending.');
      } else {
        toast.success(
          `Verification link emailed to ${item.user_email}` +
            (info.expires_in_days ? ` — valid for ${info.expires_in_days} days` : '')
        );
      }
      fetchVerifications();
    } catch (err) {
      toast.error(err?.message || 'Failed to send verification link');
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setRejectLoading(true);
    try {
      await rejectVerification(rejectTarget.type, rejectTarget.id, rejectReason.trim());
      toast.success(`${rejectTarget.type.toUpperCase()} rejected`);
      setRejectTarget(null);
      setRejectReason('');
      fetchVerifications();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject');
    } finally {
      setRejectLoading(false);
    }
  };

  if (!mounted || !isAdmin) return null;

  // Defensive: ensure each tab only shows its own type even if the backend
  // ignores the `type` query param (All = both, KYC = kyc only, KYB = kyb only).
  const visibleVerifications = typeTab
    ? verifications.filter((v) => v.type === typeTab)
    : verifications;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] transition-colors ${
    isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const tabs = [
    { id: '', label: 'All' },
    { id: 'kyc', label: 'KYC' },
    { id: 'kyb', label: 'KYB' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Verifications</h1>
        <p className={`text-sm ${textMuted}`}>Review and action KYC / KYB verification requests</p>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTypeTab(t.id); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              typeTab === t.id
                ? 'text-[#101014]'
                : isDarkMode
                  ? 'text-gray-400 border border-[#FFFFFF14] hover:text-white'
                  : 'text-gray-600 border border-gray-300 hover:text-gray-900'
            }`}
            style={typeTab === t.id ? { background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' } : {}}
          >
            {t.label}
          </button>
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
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Statuses</option>
          <option value="pending_review">Pending Review</option>
          <option value="in_progress">In Progress</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="not_started">Not Started</option>
          <option value="expired">Expired</option>
        </select>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Methods</option>
          <option value="manual">Manual Verification</option>
          <option value="persona">Persona</option>
        </select>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['User', 'Type', 'Status', 'Business Name', 'Docs', 'Submitted', 'Actions'].map((h) => (
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
              ) : visibleVerifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No verifications found</td>
                </tr>
              ) : (
                visibleVerifications.map((item) => {
                  const statusCfg = STATUS_CONFIG[item.status] || { label: item.status, cls: 'bg-gray-500/20 text-gray-400' };
                  const canAction = item.status === 'pending_review' || item.status === 'in_progress';
                  // KYC-only manual fallback (KYB rows don't carry these fields).
                  const canSendLink = item.type === 'kyc' && !!item.can_send_manual_link;
                  const canViewManualDocs = item.type === 'kyc' && !!item.manual_submitted_at;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setDrawerOpen(true); }}
                      className={`border-b cursor-pointer transition-colors ${
                        isDarkMode ? 'border-[#FFFFFF14] hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className={`text-sm font-medium ${textMain}`}>{item.user_name}</p>
                        <p className={`text-xs ${textMuted}`}>{item.user_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${typeBadge(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                          {item.manual_link_active && (
                            <span
                              title={`Manual verification link expires ${fmtDateTime(item.manual_link_expires_at)}`}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-cyan-500/20 text-cyan-400"
                            >
                              Link sent
                            </span>
                          )}
                          {item.manual_submitted_at && (
                            <span
                              title={`Manual documents submitted ${fmtDateTime(item.manual_submitted_at)} — review in the user's KYC detail`}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-500/20 text-teal-400"
                            >
                              Manual docs
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm ${textMuted}`}>{item.business_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${item.documents_submitted ? 'text-green-400' : textMuted}`}>
                          {item.documents_submitted ? '✓ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs ${textMuted}`}>{fmt(item.created_at)}</p>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {canAction || canSendLink || canViewManualDocs ? (
                          <div className="flex items-center gap-2">
                            {canViewManualDocs && (
                              <button
                                onClick={() => { setSelectedItem(item); setDrawerOpen(true); }}
                                title="View manually uploaded documents"
                                className="text-xs px-2 py-1 rounded border font-medium transition-colors border-[#F1CB68]/40 text-[#F1CB68] hover:bg-[#F1CB68]/10"
                              >
                                View
                              </button>
                            )}
                            {canAction && (
                              <>
                                <button
                                  onClick={(e) => handleApprove(item, e)}
                                  disabled={actionLoading[item.id + '_approve']}
                                  className="text-xs px-2 py-1 rounded border font-medium transition-colors disabled:opacity-50 border-green-500/30 text-green-400 hover:bg-green-500/10"
                                >
                                  {actionLoading[item.id + '_approve'] ? '...' : 'Approve'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRejectTarget(item); setRejectReason(''); }}
                                  className="text-xs px-2 py-1 rounded border font-medium transition-colors border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {canSendLink && (
                              <button
                                onClick={(e) => handleSendLink(item, e)}
                                disabled={actionLoading[item.id + '_sendlink']}
                                title={
                                  item.manual_link_active
                                    ? `Re-sending invalidates the current link (expires ${fmtDateTime(item.manual_link_expires_at)})`
                                    : 'Email the user a manual verification upload link'
                                }
                                className="text-xs px-2 py-1 rounded border font-medium transition-colors disabled:opacity-50 border-[#F1CB68]/40 text-[#F1CB68] hover:bg-[#F1CB68]/10 whitespace-nowrap"
                              >
                                {actionLoading[item.id + '_sendlink']
                                  ? '...'
                                  : item.manual_link_active
                                    ? 'Re-send link'
                                    : 'Send link'}
                              </button>
                            )}
                          </div>
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

      {/* Detail Drawer */}
      {drawerOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className={`w-full max-w-md border-l overflow-y-auto ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <div className={`sticky top-0 p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold text-lg ${textMain}`}>Verification Detail</h3>
              <button onClick={() => setDrawerOpen(false)} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Type + Status header */}
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full font-medium uppercase ${typeBadge(selectedItem.type)}`}>
                  {selectedItem.type}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${(STATUS_CONFIG[selectedItem.status] || {}).cls || 'bg-gray-500/20 text-gray-400'}`}>
                  {(STATUS_CONFIG[selectedItem.status] || { label: selectedItem.status }).label}
                </span>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>User</p>
                <VRow label="Name" value={selectedItem.user_name} isDarkMode={isDarkMode} />
                <VRow label="Email" value={selectedItem.user_email} isDarkMode={isDarkMode} />
              </div>

              {selectedItem.type === 'kyb' && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Business</p>
                  <VRow label="Business Name" value={selectedItem.business_name || '—'} isDarkMode={isDarkMode} />
                  <VRow label="Verification Type" value={selectedItem.verification_type || '—'} isDarkMode={isDarkMode} />
                </div>
              )}

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Details</p>
                {selectedItem.type === 'kyc' && selectedItem.persona_inquiry_id && (
                  <VRow label="Persona Inquiry ID" value={selectedItem.persona_inquiry_id} isDarkMode={isDarkMode} mono />
                )}
                <VRow label="Documents Submitted" value={selectedItem.documents_submitted ? 'Yes' : 'No'} isDarkMode={isDarkMode} />
                <VRow label="Submitted" value={fmt(selectedItem.created_at)} isDarkMode={isDarkMode} />
                <VRow label="Last Updated" value={fmt(selectedItem.updated_at)} isDarkMode={isDarkMode} />
                {selectedItem.verified_at && (
                  <VRow label="Verified At" value={fmt(selectedItem.verified_at)} isDarkMode={isDarkMode} />
                )}
                {selectedItem.rejection_reason && (
                  <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-medium mb-1">Rejection Reason</p>
                    <p className="text-xs text-red-300">{selectedItem.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Manual verification fallback (KYC only) */}
              {selectedItem.type === 'kyc' &&
                (selectedItem.can_send_manual_link ||
                  selectedItem.manual_link_active ||
                  selectedItem.manual_submitted_at) && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Manual Verification</p>
                  <VRow
                    label="Link"
                    value={
                      selectedItem.manual_link_active
                        ? `Active — expires ${fmt(selectedItem.manual_link_expires_at)}`
                        : selectedItem.manual_submitted_at
                          ? 'Used'
                          : 'Not sent'
                    }
                    isDarkMode={isDarkMode}
                  />
                  <VRow
                    label="Docs Submitted"
                    value={selectedItem.manual_submitted_at ? fmtDateTime(selectedItem.manual_submitted_at) : '—'}
                    isDarkMode={isDarkMode}
                  />
                  {selectedItem.manual_submitted_at && (
                    <p className={`mt-2 text-xs ${textMuted}`}>
                      The user uploaded their selfie and ID via the manual link. Review the
                      documents below, then approve or reject.
                    </p>
                  )}
                  {selectedItem.can_send_manual_link && (
                    <button
                      onClick={(e) => { handleSendLink(selectedItem, e); setDrawerOpen(false); }}
                      disabled={actionLoading[selectedItem.id + '_sendlink']}
                      className="mt-3 w-full py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] hover:bg-[#D6A738] text-[#101014] transition-colors disabled:opacity-60"
                    >
                      {selectedItem.manual_link_active
                        ? 'Re-send verification link'
                        : 'Send verification link'}
                    </button>
                  )}
                </div>
              )}

              {/* Uploaded documents (KYC only — Persona captures + manual uploads) */}
              {selectedItem.type === 'kyc' && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Documents</p>
                  {kycDocsLoading ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`aspect-square rounded-lg animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  ) : kycDocs && kycDocs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {kycDocs.map((doc) => {
                        const isPdf = (doc.mime_type || '').includes('pdf');
                        const label = titleCase(doc.document_type);
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() =>
                              isPdf
                                ? window.open(doc.view_url, '_blank', 'noopener')
                                : setDocPreview({ url: doc.view_url, label })
                            }
                            className="group text-left"
                          >
                            <div className={`relative aspect-square rounded-lg overflow-hidden border ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                              {isPdf ? (
                                <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${textMuted}`}>
                                  <span className="text-lg font-bold">PDF</span>
                                </div>
                              ) : (
                                /* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not a static/local asset */
                                <img
                                  src={doc.view_url}
                                  alt={label}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors">
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F1CB68] text-[#101014] opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isPdf ? 'Open' : 'View'}
                                </span>
                              </div>
                            </div>
                            <p className={`text-[10px] mt-1 truncate ${textMuted}`}>{label}</p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={`text-xs ${textMuted}`}>No documents uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Action buttons in drawer */}
              {(selectedItem.status === 'pending_review' || selectedItem.status === 'in_progress') && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => { handleApprove(selectedItem, e); setDrawerOpen(false); }}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(selectedItem); setRejectReason(''); setDrawerOpen(false); }}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>Reject {rejectTarget.type.toUpperCase()}</h3>
            <p className={`text-sm mb-4 ${textMuted}`}>
              Rejecting verification for <span className="font-medium">{rejectTarget.user_name}</span>.
              The user will be notified automatically.
            </p>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${textMain}`}>Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Document unclear, please resubmit with better quality..."
                className={`w-full px-3 py-2 rounded-lg text-sm border resize-none focus:outline-none focus:border-[#F1CB68] transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejectLoading || !rejectReason.trim()}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
              >
                {rejectLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Lightbox (full screen) */}
      {docPreview && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/95"
          onClick={() => setDocPreview(null)}
        >
          <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-white">{docPreview.label}</p>
            <button
              onClick={() => setDocPreview(null)}
              aria-label="Close preview"
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
            <img
              src={docPreview.url}
              alt={docPreview.label}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}

function VRow({ label, value, isDarkMode, mono }) {
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-xs ${textMuted}`}>{label}</span>
      <span className={`text-xs font-medium ${mono ? 'font-mono' : ''} ${textMain} max-w-48 text-right`}>{value}</span>
    </div>
  );
}
