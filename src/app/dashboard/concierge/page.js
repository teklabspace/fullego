'use client';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import AssignmentModal from '@/components/dashboard/AssignmentModal';
import DocumentUploadModal from '@/components/dashboard/DocumentUploadModal';
import {
  listAppraisals,
  getAppraisal,
  updateAppraisalStatus,
  assignAppraisal,
  uploadAppraisalDocuments,
  uploadAppraisalDocumentsWithProgress,
  getAppraisalDocuments,
  addAppraisalComment,
  getAppraisalComments,
  updateAppraisalValuation,
  downloadValuationReport,
  getAppraisalStatistics,
} from '@/utils/conciergeApi';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/context/SearchContext';

// Canonical appraisal statuses (snake_case) returned by /concierge/appraisals and
// /assets/{id}/appraisals. Maps each to a display label + badge classes. (Backend
// aligned on snake_case: in_progress, needs_more_information, etc.)
const CONCIERGE_STATUS_META = {
  pending: { label: 'Pending', classes: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  in_progress: { label: 'In Progress', classes: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  completed: { label: 'Completed', classes: 'text-green-500 bg-green-500/10 border-green-500/20' },
  cancelled: { label: 'Cancelled', classes: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  ai_appraised: { label: 'AI Appraised', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  needs_more_information: { label: 'Awaiting Info', classes: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  professional_appraisal_recommended: { label: 'Pro Appraisal Recommended', classes: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  appraisal_failed: { label: 'Failed', classes: 'text-red-500 bg-red-500/10 border-red-500/20' },
};

// Neutral placeholder shown when an appraisal record has no real asset image
// (better than a misleading stock photo).
const ASSET_IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%232A2A2D'/%3E%3Cpath d='M30 62l16-18 12 14 8-9 14 16H30z' fill='%234A4A4D'/%3E%3Ccircle cx='40' cy='36' r='7' fill='%234A4A4D'/%3E%3C/svg%3E";

// Time-only for chat bubbles (e.g. "3:45 PM").
const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// A YYYY-M-D key used to detect day boundaries in the chat.
const dayKey = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// Centered separator label: "Today" / "Yesterday" / "Jun 25, 2026".
const dayLabel = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const atMidnight = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((atMidnight(new Date()) - atMidnight(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Friendly fallback for any unmapped status (e.g. "on_hold" → "On Hold").
const prettyStatus = (status) =>
  (status || 'Unknown').toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const getStatusColor = (status) =>
  CONCIERGE_STATUS_META[status]?.classes || 'text-gray-500 bg-gray-500/10 border-gray-500/20';

const getStatusLabel = (status) =>
  CONCIERGE_STATUS_META[status]?.label || prettyStatus(status);

// How many appraisals per page (both grid and list).
const APPRAISALS_PAGE_SIZE = 9;

// Normalise a raw appraisal record (asset nested under `asset` or flattened)
// into the shape the UI consumes. Reused by the list and by deep-link fetch.
const mapAppraisal = (ap) => {
  const asset = ap.asset || {};
  return {
    id: ap.id || ap.appraisalId,
    assetId: ap.assetId || asset.id,
    assetCode: ap.assetCode || asset.assetCode,
    assetName: ap.assetName || asset.name || 'Asset',
    assetImage:
      ap.assetImage ||
      asset.image ||
      (Array.isArray(asset.images) ? asset.images[0] : null) ||
      (Array.isArray(ap.images) ? ap.images[0] : null) ||
      null,
    category: ap.category || asset.category,
    appraisalType: ap.appraisalType || ap.type,
    requestDate: ap.requestDate || ap.requestedAt || ap.createdAt,
    status: ap.status,
    assignedProvider: ap.assignedProvider,
    appraisedValue: ap.appraisedValue || ap.estimatedValue,
    valuationDate: ap.valuationDate || ap.completedAt,
    assignedTo: ap.assignedTo,
    notes: ap.notes || ap.note,
    documentsRequested: ap.documentsRequested ?? false,
    comments: ap.comments || [],
    documents: ap.documents || [],
  };
};

// Page numbers to render, collapsing long ranges with '…'.
const getPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
};

export default function ConciergeServicePage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  // Staff (admin/advisor) manage requests — assign, upload reports, add internal
  // notes. Investors get the same list as a read-only "my requests + status" view.
  const { isAdmin, isAdvisor } = useAuth();
  const isStaff = isAdmin || isAdvisor;
  // Search term from the shared navbar box (admin-only search of the queue).
  const { query: searchQuery } = useSearch();
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('all'); // status filter tab
  const [page, setPage] = useState(1);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    awaitingInfo: 0,
  });

  // Fetch appraisals and statistics on mount
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        const [appraisalsResponse, statsResponse] = await Promise.allSettled([
          listAppraisals(),
          getAppraisalStatistics(),
        ]);

        if (appraisalsResponse.status === 'fulfilled') {
          const appraisalsData = appraisalsResponse.value.data || appraisalsResponse.value || [];
          setAppraisals(appraisalsData.map(mapAppraisal));
        }

        if (statsResponse.status === 'fulfilled') {
          const statistics = statsResponse.value.data || statsResponse.value;
          setStats({
            total: statistics.totalRequests || 0,
            pending: statistics.pending || 0,
            inProgress: statistics.inProgress || 0,
            completed: statistics.completed || 0,
            awaitingInfo: statistics.awaitingInfo || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch appraisals:', error);
        toast.error('Failed to load appraisals');
        // Set empty state on error - no fallback to mock data
        setAppraisals([]);
        setStats({
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          awaitingInfo: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

  // Reset to the first page whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Deep-link: ?appraisal=<id> (e.g. from a notification toast) opens that
  // appraisal's thread. Handle each id once so closing it doesn't re-open it.
  const deepLinkHandled = useRef('');
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    const id = new URLSearchParams(window.location.search).get('appraisal');
    if (!id || deepLinkHandled.current === id) return;
    const open = (appr) => {
      deepLinkHandled.current = id;
      setSelectedAppraisal(appr);
    };
    const found = appraisals.find(a => a.id === id);
    if (found) {
      open(found);
      return;
    }
    // Not in the loaded page — fetch it directly.
    getAppraisal(id)
      .then(res => {
        const d = res?.data || res;
        if (d) open(mapAppraisal(d));
      })
      .catch(() => {});
  }, [loading, appraisals]);

  const handleAssignConcierge = async (assignmentData) => {
    if (selectedAppraisal) {
      try {
        await assignAppraisal(selectedAppraisal.id, {
          userId: assignmentData.userId,
          userName: assignmentData.userName,
          provider: assignmentData.provider,
          internalNote: assignmentData.internalNote,
        });

        // Update local state
        const updatedAppraisals = appraisals.map(a =>
          a.id === selectedAppraisal.id
            ? {
                ...a,
                assignedTo: assignmentData.userName,
                comments: [
                  ...(a.comments || []),
                  {
                    id: Date.now(),
                    from: 'System',
                    message: `Task assigned to ${assignmentData.userName}`,
                    date: new Date().toISOString(),
                  },
                ],
              }
            : a
        );
        setAppraisals(updatedAppraisals);
        setSelectedAppraisal({
          ...selectedAppraisal,
          assignedTo: assignmentData.userName,
          comments: updatedAppraisals.find(a => a.id === selectedAppraisal.id)
            .comments,
        });
        toast.success('Appraisal assigned successfully!');
      } catch (error) {
        console.error('Failed to assign appraisal:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to assign appraisal. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  // The upload itself runs in the modal (with progress). Here we just pull the
  // fresh document list from the server so the UI reflects the new file.
  const handleDocumentUpload = async () => {
    if (!selectedAppraisal) return;
    try {
      const res = await getAppraisalDocuments(selectedAppraisal.id);
      const docs = res?.data || res || [];
      const list = Array.isArray(docs) ? docs : [];
      setAppraisals(prev =>
        prev.map(a => (a.id === selectedAppraisal.id ? { ...a, documents: list } : a))
      );
      setSelectedAppraisal(prev => (prev ? { ...prev, documents: list } : prev));
    } catch (error) {
      console.warn('Could not refresh documents:', error?.message);
    }
    toast.success('Document uploaded successfully!');
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter tabs (label → canonical status to filter by + count from stats).
  const STAT_TABS = [
    { key: 'all', label: 'Total Requests', color: 'default', count: stats.total },
    { key: 'pending', label: 'Pending', color: 'default', count: stats.pending },
    { key: 'in_progress', label: 'In Progress', color: 'blue', count: stats.inProgress },
    { key: 'completed', label: 'Completed', color: 'green', count: stats.completed },
    { key: 'needs_more_information', label: 'Awaiting Info', color: 'orange', count: stats.awaitingInfo },
  ];

  // Admin-only text search (asset name / code / id / category / type), then the
  // active tab, then paginate — all client-side over the loaded queue.
  const q = isAdmin && searchQuery.trim() ? searchQuery.trim().toLowerCase() : '';
  const matchesQuery = (a) =>
    !q ||
    [a.assetName, a.assetCode, a.id, a.category, a.appraisalType]
      .filter(Boolean)
      .some(v => v.toString().toLowerCase().includes(q));
  const filteredAppraisals = appraisals
    .filter(matchesQuery)
    .filter(a => activeTab === 'all' || a.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filteredAppraisals.length / APPRAISALS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAppraisals = filteredAppraisals.slice(
    (currentPage - 1) * APPRAISALS_PAGE_SIZE,
    currentPage * APPRAISALS_PAGE_SIZE
  );

  const selectTab = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  return (
    <>
      <div>
        {/* Header */}
            <div className='mb-6'>
              <h1
                className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Appraisals
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Track and manage all your asset appraisal requests
              </p>
            </div>

            {/* Stats tabs — click to filter the list by status */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6'>
              {STAT_TABS.map(tab => (
                <StatCard
                  key={tab.key}
                  label={tab.label}
                  value={tab.count}
                  color={tab.color}
                  isDarkMode={isDarkMode}
                  active={activeTab === tab.key}
                  onClick={() => selectTab(tab.key)}
                />
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className='flex items-center justify-between mb-4'>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {loading
                  ? 'Loading appraisals…'
                  : `${filteredAppraisals.length} appraisal${filteredAppraisals.length !== 1 ? 's' : ''} found`}
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#F1CB68] text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <rect x='3' y='3' width='7' height='7' />
                    <rect x='14' y='3' width='7' height='7' />
                    <rect x='3' y='14' width='7' height='7' />
                    <rect x='14' y='14' width='7' height='7' />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#F1CB68] text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M3 3h18v18H3z' />
                    <path d='M3 9h18' />
                    <path d='M3 15h18' />
                    <path d='M9 3v18' />
                    <path d='M15 3v18' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <AppraisalCardSkeleton key={i} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredAppraisals.length === 0 && (
              <div className={`rounded-xl border p-10 text-center ${
                isDarkMode ? 'border-[#FFFFFF14] text-gray-400' : 'border-gray-200 text-gray-600'
              }`}>
                <p className='text-base mb-1'>
                  {activeTab === 'all' ? 'No appraisal requests yet' : 'No requests in this status'}
                </p>
                <p className='text-sm'>
                  {activeTab === 'all'
                    ? 'Requests you submit from an asset will appear here.'
                    : 'Try another tab to see more requests.'}
                </p>
              </div>
            )}

            {/* Appraisals Grid View */}
            {!loading && filteredAppraisals.length > 0 && viewMode === 'grid' && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {pagedAppraisals.map(appraisal => (
                  <AppraisalCard
                    key={appraisal.id}
                    appraisal={appraisal}
                    isDarkMode={isDarkMode}
                    getStatusColor={getStatusColor}
                    formatDate={formatDate}
                    onViewDetails={() => setSelectedAppraisal(appraisal)}
                  />
                ))}
              </div>
            )}

            {/* Appraisals List View */}
            {!loading && filteredAppraisals.length > 0 && viewMode === 'list' && (
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr
                        className={`border-b ${
                          isDarkMode
                            ? 'border-[#FFFFFF14]'
                            : 'border-gray-200'
                        }`}
                      >
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Asset
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Category
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Request Date
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Status
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Provider
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Appraised Value
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedAppraisals.map(appraisal => (
                        <AppraisalTableRow
                          key={appraisal.id}
                          appraisal={appraisal}
                          isDarkMode={isDarkMode}
                          getStatusColor={getStatusColor}
                          formatDate={formatDate}
                          onViewDetails={() => setSelectedAppraisal(appraisal)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination — both views */}
            {!loading && filteredAppraisals.length > 0 && totalPages > 1 && (
              <div className='flex items-center justify-between gap-4 mt-6 flex-wrap'>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {currentPage} of {totalPages} · {filteredAppraisals.length} total
                </p>
                <div className='flex items-center gap-1.5'>
                  {/* Prev arrow */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label='Previous page'
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                      currentPage <= 1
                        ? 'opacity-40 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                    }`}
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M15 18l-6-6 6-6' />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {getPageList(currentPage, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span
                        key={`gap-${i}`}
                        className={`w-9 h-9 flex items-center justify-center text-sm ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                          p === currentPage
                            ? 'bg-[#F1CB68] text-[#0B0D12] border-[#F1CB68]'
                            : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next arrow */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label='Next page'
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                      currentPage >= totalPages
                        ? 'opacity-40 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                    }`}
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M9 18l6-6-6-6' />
                    </svg>
                  </button>
                </div>
              </div>
            )}
      </div>

      {/* Appraisal Detail Modal */}
      {selectedAppraisal && (
        <AppraisalDetailModal
          appraisal={selectedAppraisal}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedAppraisal(null)}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          isStaff={isStaff}
          onAssign={isStaff ? () => setAssignmentModalOpen(true) : undefined}
          onDocumentUpload={() => setDocumentModalOpen(true)}
        />
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModalOpen}
        setIsOpen={setAssignmentModalOpen}
        onAssign={handleAssignConcierge}
        title='Assign to CRM User'
        itemName='concierge request'
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={documentModalOpen}
        setIsOpen={setDocumentModalOpen}
        onUpload={handleDocumentUpload}
        title='Upload Documents'
        itemType='concierge'
        itemId={selectedAppraisal?.id}
        uploadFn={(rawFiles, onProgress, { heading } = {}) =>
          uploadAppraisalDocumentsWithProgress(selectedAppraisal?.id, rawFiles, {
            onProgress,
            documentType: heading || undefined,
          })
        }
        headingOptions={
          isStaff
            ? [
                { value: 'Help Document', label: 'Help Document' },
                { value: 'Valuation Report', label: 'Valuation Report (final)' },
              ]
            : undefined
        }
        infoText={
          isStaff
            ? 'Admin uploads are shared with the investor as help documents. Choose “Valuation Report” for the final report (shown in the Valuation Report section).'
            : 'Your uploaded document will be attached to this asset and shared with the appraisal team.'
        }
      />
    </>
  );
}

// Stat Card Component
function StatCard({ label, value, isDarkMode, color = 'default', active = false, onClick }) {
  const colorClasses = {
    default: 'border-[#F1CB68]/20 bg-[#F1CB68]/10',
    blue: 'border-blue-500/20 bg-blue-500/10',
    green: 'border-green-500/20 bg-green-500/10',
    orange: 'border-orange-500/20 bg-orange-500/10',
  };

  return (
    <button
      type='button'
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition-all ${
        active
          ? 'border-[#F1CB68] ring-1 ring-[#F1CB68]'
          : isDarkMode
          ? `bg-[#1A1A1D] ${colorClasses[color]} hover:border-[#F1CB68]/50`
          : 'bg-white border-gray-200 hover:border-[#F1CB68]/50'
      } ${active && isDarkMode ? 'bg-[#1A1A1D]' : ''} ${active && !isDarkMode ? 'bg-[#F1CB68]/5' : ''}`}
    >
      <p
        className={`text-xs mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </button>
  );
}

// Loading skeleton mirroring AppraisalCard's layout.
function AppraisalCardSkeleton({ isDarkMode }) {
  const bar = isDarkMode ? 'bg-white/5' : 'bg-gray-200';
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-start gap-3 mb-4'>
        <div className={`w-16 h-16 rounded-lg animate-pulse ${bar}`} />
        <div className='flex-1 space-y-2 pt-1'>
          <div className={`h-4 w-3/4 rounded animate-pulse ${bar}`} />
          <div className={`h-3 w-1/3 rounded animate-pulse ${bar}`} />
        </div>
      </div>
      <div className='space-y-2 mb-4'>
        {[0, 1, 2].map(j => (
          <div key={j} className={`h-3 w-full rounded animate-pulse ${bar}`} />
        ))}
      </div>
      <div className={`h-8 w-full rounded-lg animate-pulse ${bar}`} />
    </div>
  );
}

// Appraisal Card Component
function AppraisalCard({
  appraisal,
  isDarkMode,
  getStatusColor,
  formatDate,
  onViewDetails,
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Asset Image & Name */}
      <div className='flex items-start gap-3 mb-4'>
        <img
          src={appraisal.assetImage || ASSET_IMG_PLACEHOLDER}
          alt={appraisal.assetName}
          className='w-16 h-16 rounded-lg object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h3
            className={`text-sm font-semibold mb-1 truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {appraisal.assetName}
          </h3>
          <div className='flex items-center gap-1.5 flex-wrap'>
            {appraisal.assetCode && (
              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-[#F1CB68]/10 text-[#a07d1f]'
              }`}>
                {appraisal.assetCode}
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                isDarkMode
                  ? 'bg-white/5 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {appraisal.category}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className='space-y-2 mb-4'>
        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Request Date
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {formatDate(appraisal.requestDate)}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Status
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${getStatusColor(
              appraisal.status
            )}`}
          >
            {getStatusLabel(appraisal.status)}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Provider
          </span>
          <span
            className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {appraisal.assignedProvider}
          </span>
        </div>

        {appraisal.appraisedValue && (
          <div className='flex items-center justify-between'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Appraised Value
            </span>
            <span
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
              }`}
            >
              {appraisal.appraisedValue}
            </span>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className={`w-full py-2 text-xs rounded-lg font-medium transition-all ${
          isDarkMode
            ? 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
            : 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
        }`}
      >
        View Details
      </button>
    </div>
  );
}

// Appraisal Table Row Component
function AppraisalTableRow({
  appraisal,
  isDarkMode,
  getStatusColor,
  formatDate,
  onViewDetails,
}) {
  return (
    <tr
      className={`border-b ${
        isDarkMode
          ? 'border-[#FFFFFF14] hover:bg-white/5'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src={appraisal.assetImage || ASSET_IMG_PLACEHOLDER}
            alt={appraisal.assetName}
            className='w-12 h-12 rounded-lg object-cover'
          />
          <div className='min-w-0'>
            <p
              className={`text-sm font-medium truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {appraisal.assetName}
            </p>
            {appraisal.assetCode && (
              <span className={`text-[11px] font-mono ${
                isDarkMode ? 'text-[#F1CB68]' : 'text-[#a07d1f]'
              }`}>
                {appraisal.assetCode}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {appraisal.category}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {formatDate(appraisal.requestDate)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded border ${getStatusColor(
            appraisal.status
          )}`}
        >
          {getStatusLabel(appraisal.status)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {appraisal.assignedProvider}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm font-semibold ${
            appraisal.appraisedValue
              ? isDarkMode
                ? 'text-[#F1CB68]'
                : 'text-[#F1CB68]'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-400'
          }`}
        >
          {appraisal.appraisedValue || 'Pending'}
        </span>
      </td>
      <td className='px-4 py-3'>
        <button
          onClick={onViewDetails}
          className={`px-3 py-1 text-xs rounded transition-all ${
            isDarkMode
              ? 'bg-white/5 text-white hover:bg-white/10'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

// Appraisal Detail Modal Component
function AppraisalDetailModal({
  appraisal,
  isDarkMode,
  onClose,
  formatDate,
  getStatusColor,
  isStaff,
  onAssign,
  onDocumentUpload,
}) {
  const [newComment, setNewComment] = useState('');
  // The comment thread is loaded per-appraisal (the list item doesn't include it).
  const [thread, setThread] = useState([]);
  const [loadingThread, setLoadingThread] = useState(true);
  const [posting, setPosting] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingThread(true);
    getAppraisalComments(appraisal.id)
      .then(res => {
        if (cancelled) return;
        const list = res?.data || res || [];
        setThread(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingThread(false); });
    return () => { cancelled = true; };
  }, [appraisal.id]);

  // Keep the chat pinned to the latest message (bottom) — on load and on every
  // new message. Scroll up to see older ones.
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread, loadingThread]);

  // Progress timeline steps
  const timelineSteps = [
    { step: 'Submitted', completed: true, date: appraisal.requestDate },
    {
      step: 'Assigned',
      completed: appraisal.status !== 'pending',
      date: appraisal.status !== 'pending' ? '2024-01-16' : null,
    },
    {
      step: 'Under Review',
      completed: ['in_progress', 'completed', 'ai_appraised'].includes(appraisal.status),
      date: ['in_progress', 'completed', 'ai_appraised'].includes(appraisal.status)
        ? '2024-01-18'
        : null,
    },
    {
      step: 'Completed',
      completed: appraisal.status === 'completed',
      date: appraisal.valuationDate,
    },
  ];

  // Normalise the real comment thread (backend shape: author_kind, body,
  // created_at, …) into render items. Oldest → newest so the chat reads
  // top-to-bottom with the latest at the bottom.
  const notes = thread
    .map(c => ({
      id: c.id,
      kind: (c.authorKind || c.from || '').toString().toLowerCase(), // investor | staff | system
      name: c.authorName || c.from || 'User',
      message: c.body ?? c.message ?? c.comment ?? '',
      date: c.createdAt || c.date,
      type: c.commentType,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleAddComment = async e => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    // Show the message immediately, then reconcile with the server.
    const tempId = `temp-${new Date().getTime()}`;
    const optimistic = {
      id: tempId,
      authorKind: isStaff ? 'staff' : 'investor',
      authorName: 'You',
      body: text,
      createdAt: new Date().toISOString(),
    };
    setThread(prev => [...prev, optimistic]);
    setNewComment('');
    try {
      setPosting(true);
      // Send the canonical `body` field (also pass `comment` for tolerance).
      await addAppraisalComment(appraisal.id, { body: text, comment: text });
      const res = await getAppraisalComments(appraisal.id);
      const list = res?.data || res || [];
      // Replace with server truth only if it actually returned the thread,
      // otherwise keep the optimistic message visible.
      if (Array.isArray(list) && list.length) setThread(list);
    } catch (err) {
      // Roll back the optimistic message and restore the draft.
      setThread(prev => prev.filter(c => c.id !== tempId));
      setNewComment(text);
      toast.error(err?.data?.detail || err?.message || 'Failed to send your message.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .concierge-modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .concierge-modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] my-auto rounded-2xl border flex flex-col ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 sm:p-6 border-b shrink-0 ${
              isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
            }`}
          >
          <div className='flex-1 min-w-0'>
            <h2
              className={`text-lg sm:text-xl font-semibold mb-1 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {appraisal.assetName}
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Appraisal Details
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all shrink-0 ${
              isDarkMode
                ? 'hover:bg-white/10 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg
              width='20'
              height='20'
              className='sm:w-6 sm:h-6'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 concierge-modal-scrollbar'>
          {/* Asset Info */}
          <div className='flex items-start gap-4'>
            <img
              src={appraisal.assetImage || ASSET_IMG_PLACEHOLDER}
              alt={appraisal.assetName}
              className='w-24 h-24 rounded-lg object-cover'
            />
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {appraisal.assetName}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                    appraisal.status
                  )}`}
                >
                  {getStatusLabel(appraisal.status)}
                </span>
              </div>
              <p
                className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Category: {appraisal.category}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Assigned Provider: {appraisal.assignedProvider}
              </p>
              {appraisal.assignedTo && (
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
                  }`}
                >
                  Assigned to: {appraisal.assignedTo}
                </p>
              )}
            </div>
            <div className='flex gap-2'>
              {onAssign && (
                <button
                  onClick={onAssign}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                      : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                  }`}
                >
                  Assign to CRM User
                </button>
              )}
              {onDocumentUpload && (
                <button
                  onClick={onDocumentUpload}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <path d='M14 2v6h6' />
                  </svg>
                  Documents
                </button>
              )}
            </div>
          </div>

          {/* Progress Timeline */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Progress Timeline
            </h3>
            <div className='space-y-4'>
              {timelineSteps.map((step, index) => (
                <div key={index} className='flex items-start gap-4'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.completed
                          ? 'bg-[#F1CB68]'
                          : isDarkMode
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }`}
                    />
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-px h-12 mt-1 ${
                          step.completed
                            ? 'bg-[#F1CB68]'
                            : isDarkMode
                            ? 'bg-gray-600'
                            : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <div className='flex-1 pb-4'>
                    <p
                      className={`font-medium mb-1 ${
                        step.completed
                          ? isDarkMode
                            ? 'text-white'
                            : 'text-gray-900'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.step}
                    </p>
                    {step.date && (
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments & Notes — messages inside one bordered box (the "square");
              the reply box + send button sit directly under it. */}
          <div>
            <h3
              className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Comments & Notes
            </h3>

            {/* Fixed-shape chat box: messages scroll inside; "You" on the right,
                incoming on the left. The box height stays constant. */}
            <div className={`rounded-xl border h-80 overflow-hidden ${
              isDarkMode ? 'border-[#FFFFFF14] bg-[#141417]' : 'border-gray-200 bg-gray-50'
            }`}>
              {loadingThread ? (
                <div className='h-full p-3 space-y-3'>
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`flex ${i === 1 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`h-14 rounded-2xl animate-pulse ${i === 1 ? 'w-1/2 bg-[#F1CB68]/10' : 'w-2/3'} ${
                        isDarkMode ? 'bg-white/5' : 'bg-gray-200'
                      }`} />
                    </div>
                  ))}
                </div>
              ) : notes.length > 0 ? (
                <div ref={chatScrollRef} className='h-full overflow-y-auto p-3 space-y-3 concierge-modal-scrollbar'>
                  {notes.map((note, idx) => {
                    // "Mine" = the current viewer's own messages → right (yellow).
                    // Everything else → left, labelled with the sender's name.
                    const isMine = isStaff ? note.kind === 'staff' : note.kind === 'investor';
                    // Centered day separator whenever the date changes.
                    const showDaySep = idx === 0 || dayKey(note.date) !== dayKey(notes[idx - 1].date);
                    return (
                      <Fragment key={note.id}>
                        {showDaySep && (
                          <div className='flex justify-center py-1'>
                            <span className={`text-[11px] px-3 py-1 rounded-full ${
                              isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {dayLabel(note.date)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className='max-w-[80%]'>
                            <div
                              className={`rounded-2xl px-3.5 py-2 ${
                                isMine
                                  ? 'bg-[#F1CB68] text-[#0B0D12] rounded-br-sm'
                                  : isDarkMode
                                  ? 'bg-[#1A1A1D] border border-[#FFFFFF14] text-gray-200 rounded-bl-sm'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                              }`}
                            >
                              {/* Sender name only for incoming messages */}
                              {!isMine && (
                                <p className={`text-xs font-semibold mb-0.5 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {note.name}
                                </p>
                              )}
                              <p className='text-sm whitespace-pre-wrap break-words'>
                                {note.message}
                              </p>
                            </div>
                            {/* Time only — outside the bubble, bottom-right */}
                            <p className={`text-[10px] mt-1 text-right ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {formatTime(note.date)}
                            </p>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className='h-full flex items-center justify-center'>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No comments yet.
                  </p>
                </div>
              )}
            </div>

            {/* Compact chat input bar — single line that grows, inline send icon.
                Enter sends, Shift+Enter adds a newline. */}
            <form
              onSubmit={handleAddComment}
              className={`mt-3 flex items-end gap-2 rounded-full border pl-4 pr-1.5 py-1.5 ${
                isDarkMode ? 'bg-[#2C2C2E] border-[#FFFFFF14]' : 'bg-white border-gray-300'
              } focus-within:border-[#F1CB68] transition-colors`}
            >
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(e);
                  }
                }}
                placeholder={isStaff ? 'Add a note…' : 'Write a reply…'}
                rows={1}
                className={`flex-1 bg-transparent resize-none max-h-28 py-1.5 text-sm focus:outline-none ${
                  isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                type='submit'
                disabled={!newComment.trim() || posting}
                aria-label='Send'
                className='shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#F1CB68] text-black hover:bg-[#F1CB68]/80'
              >
                {posting ? (
                  <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                  </svg>
                ) : (
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Documents & Valuation */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Uploaded Documents */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Uploaded Documents
                </h3>
                {onDocumentUpload && (
                  <button
                    onClick={onDocumentUpload}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                        : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                    }`}
                  >
                    + Upload
                  </button>
                )}
              </div>
              {/* Prompt when staff has requested a document (documents_requested). */}
              {appraisal.documentsRequested && (
                <button
                  onClick={onDocumentUpload}
                  className={`w-full mb-3 p-3 rounded-lg border text-left text-sm flex items-center gap-2 transition-all ${
                    isDarkMode
                      ? 'border-[#F1CB68]/40 bg-[#F1CB68]/10 text-[#F1CB68] hover:bg-[#F1CB68]/15'
                      : 'border-[#F1CB68]/50 bg-[#F1CB68]/10 text-[#a07d1f] hover:bg-[#F1CB68]/20'
                  }`}
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                    <path d='M17 8l-5-5-5 5M12 3v12' />
                  </svg>
                  A document was requested — tap to upload.
                </button>
              )}
              <div className='space-y-2'>
                {appraisal.documents && appraisal.documents.length > 0 ? (
                  appraisal.documents.map((doc, index) => {
                    const rawSize = doc.fileSize ?? doc.size;
                    const size =
                      typeof rawSize === 'number'
                        ? `${(rawSize / 1024 / 1024).toFixed(2)} MB`
                        : null;
                    return (
                      <DocumentItem
                        key={doc.id || index}
                        name={doc.name || doc.fileName || 'Document'}
                        type={doc.documentType || doc.type || 'File'}
                        size={size}
                        isDarkMode={isDarkMode}
                      />
                    );
                  })
                ) : (
                  <p className={`text-sm py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Valuation Report */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Valuation Report
              </h3>

              {/* Uploaded "Valuation Report" documents (admin marks the final
                  report with this heading on upload). */}
              {(() => {
                const valDocs = (appraisal.documents || []).filter(d =>
                  (d.documentType || d.type || '').toString().toLowerCase().includes('valuation')
                );
                if (!valDocs.length) return null;
                return (
                  <div className='space-y-2 mb-4'>
                    {valDocs.map((doc, i) => (
                      <a
                        key={doc.id || i}
                        href={doc.url || doc.fileUrl || doc.downloadUrl || '#'}
                        target='_blank'
                        rel='noreferrer'
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                          isDarkMode
                            ? 'bg-[#F1CB68]/10 border-[#F1CB68]/30 text-[#F1CB68] hover:bg-[#F1CB68]/15'
                            : 'bg-[#F1CB68]/10 border-[#F1CB68]/40 text-[#a07d1f] hover:bg-[#F1CB68]/20'
                        }`}
                      >
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <path d='M14 2v6h6' />
                        </svg>
                        <span className='truncate'>{doc.name || doc.fileName || 'Valuation Report'}</span>
                        <span className='ml-auto shrink-0 text-xs underline'>Download</span>
                      </a>
                    ))}
                  </div>
                );
              })()}

              {appraisal.appraisedValue ? (
                <div
                  className={`rounded-lg border p-4 ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='mb-4'>
                    <p
                      className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Appraised Value
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
                      }`}
                    >
                      {appraisal.appraisedValue}
                    </p>
                  </div>
                  <div className='mb-4'>
                    <p
                      className={`text-sm mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Valuation Date
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {formatDate(appraisal.valuationDate)}
                    </p>
                  </div>
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
                        : 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
                    }`}
                  >
                    Download Report
                  </button>
                </div>
              ) : (
                <div
                  className={`rounded-lg border p-4 text-center ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Valuation report will be available once the appraisal is
                    completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

// Document Item Component
function DocumentItem({ name, type, size, isDarkMode }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-white/5' : 'bg-gray-100'
          }`}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke={isDarkMode ? '#F1CB68' : '#F1CB68'}
            strokeWidth='2'
          >
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <path d='M14 2v6h6' />
            <path d='M16 13H8' />
            <path d='M16 17H8' />
            <path d='M10 9H8' />
          </svg>
        </div>
        <div>
          <p
            className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {name}
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {type}{size ? ` • ${size}` : ''}
          </p>
        </div>
      </div>
      <button
        className={`p-2 rounded-lg transition-all ${
          isDarkMode
            ? 'hover:bg-white/10 text-gray-400'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
          <polyline points='7 10 12 15 17 10' />
          <line x1='12' y1='15' x2='12' y2='3' />
        </svg>
      </button>
    </div>
  );
}

