'use client';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import FileUploadModal from '@/components/documents/FileUploadModal';
import ShareDocumentModal from '@/components/documents/ShareDocumentModal';
import UploadSuccessModal from '@/components/documents/UploadSuccessModal';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  shareDocument,
  getDocumentStatistics,
  getAdminDocumentStatistics,
  getDocumentPreview,
} from '@/utils/documentsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

// The document category labels, verbatim as the backend enum. Casing and the
// space in "Bank Statements" are load-bearing — these strings are sent on upload
// and used as keys into the stats `categories` map. Don't lowercase or slugify.
const DOCUMENT_CATEGORIES = [
  'Identity',
  'Tax',
  'Investments',
  'Legal',
  'Bank Statements',
];

// Document type icon mapping
const getDocumentIcon = type => {
  const iconMap = {
    PDF: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#EF4444'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#EF4444'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='6'
          fill='#EF4444'
          textAnchor='middle'
          fontWeight='bold'
        >
          PDF
        </text>
      </svg>
    ),
    XLSX: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#10B981'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#10B981'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='5'
          fill='#10B981'
          textAnchor='middle'
          fontWeight='bold'
        >
          XLS
        </text>
      </svg>
    ),
    DOC: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#3B82F6'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#3B82F6'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='5'
          fill='#3B82F6'
          textAnchor='middle'
          fontWeight='bold'
        >
          DOC
        </text>
      </svg>
    ),
  };
  return iconMap[type] || iconMap.PDF;
};

// Format a byte count into a human-readable size (B, KB, MB, GB, TB, PB).
// Accepts a raw number of bytes, a numeric string, or an already-formatted
// string like "5 GB" (passed through unchanged).
const formatBytes = (value, fallback = '0 B') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/[a-zA-Z]/.test(trimmed)) return trimmed; // already has a unit
    value = Number(trimmed);
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback;
  if (value === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
  const num = i === 0 ? value : parseFloat((value / 1024 ** i).toFixed(2));
  return `${num} ${units[i]}`;
};

// Build the three stat cards from a statistics object (whether it came from the
// /documents/statistics endpoint or was computed client-side).
const buildStatsCards = (statistics) => [
  {
    title: 'Total Documents Stored',
    value: statistics.totalDocuments?.toString() || '0',
    subtitle: 'Documents',
    icon: '/icons/document-file.svg',
  },
  {
    title: 'Storage Used',
    value: formatBytes(statistics.storageUsed, '0 B'),
    subtitle: `of ${formatBytes(statistics.storageLimit, '5 GB')}`,
    icon: '/icons/storage-grid.svg',
  },
  {
    title: 'Last Uploaded',
    value: statistics.lastUploaded ? new Date(statistics.lastUploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    subtitle: statistics.lastUploaded ? new Date(statistics.lastUploaded).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    icon: '/icons/upload-cloud.svg',
  },
];

// Defensive fallback: derive the storage cards from the already-fetched document
// list if GET /documents/statistics is unavailable. This originally worked around
// BUG-10 (the route was shadowed by GET /documents/{document_id} and 422'd on
// "statistics"); the backend has since fixed the route ordering, so this is now
// just a safety net rather than the expected path.
const computeStatisticsFromDocuments = (docs) => {
  const totalBytes = docs.reduce((sum, d) => sum + (d.size || d.fileSize || 0), 0);
  const lastUploadedMs = docs.reduce((latest, d) => {
    const raw = d.uploadedDate || d.createdAt;
    const t = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(t) && t > latest ? t : latest;
  }, 0);

  return {
    // Raw bytes — buildStatsCards() runs this through formatBytes() so the
    // endpoint path and this fallback render identically (B/KB/MB/GB/TB).
    totalDocuments: docs.length,
    storageUsed: totalBytes,
    storageLimit: '5 GB',
    lastUploaded: lastUploadedMs ? new Date(lastUploadedMs).toISOString() : null,
  };
};

// Theme-aware shimmer block used by the loading skeletons below.
const SkeletonBlock = ({ isDarkMode, className = '' }) => (
  <div
    className={`animate-pulse rounded ${isDarkMode ? 'bg-white/10' : 'bg-black/10'} ${className}`}
  />
);

// Skeleton mirror of a stats card — same wrapper styling as the real cards so
// the layout doesn't shift when data arrives.
const StatCardSkeleton = ({ isDarkMode }) => (
  <div
    className='relative rounded-2xl p-6 border'
    style={
      isDarkMode
        ? {
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }
        : {
            background: 'transparent',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }
    }
  >
    <div className='flex justify-between items-start mb-4'>
      <div className='flex-1'>
        <SkeletonBlock isDarkMode={isDarkMode} className='h-4 w-32 mb-3' />
        <SkeletonBlock isDarkMode={isDarkMode} className='h-8 w-24 mb-2' />
        <SkeletonBlock isDarkMode={isDarkMode} className='h-3 w-20' />
      </div>
      <SkeletonBlock isDarkMode={isDarkMode} className='h-8 w-8 rounded-lg ml-4' />
    </div>
  </div>
);

// Skeleton mirror of a document table row (Name / Type / Date / Actions).
const DocumentRowSkeleton = ({ isDarkMode }) => (
  <tr
    style={{
      borderBottom: isDarkMode
        ? '1px solid rgba(255, 255, 255, 0.05)'
        : '1px solid rgba(0, 0, 0, 0.05)',
    }}
  >
    <td className='px-6 py-4'>
      <div className='flex items-center gap-3'>
        <SkeletonBlock isDarkMode={isDarkMode} className='h-6 w-6' />
        <SkeletonBlock isDarkMode={isDarkMode} className='h-4 w-40 md:w-56' />
      </div>
    </td>
    <td className='px-6 py-4'>
      <SkeletonBlock isDarkMode={isDarkMode} className='h-4 w-12' />
    </td>
    <td className='px-6 py-4'>
      <SkeletonBlock isDarkMode={isDarkMode} className='h-4 w-28' />
    </td>
    <td className='px-6 py-4'>
      <div className='flex items-center justify-end gap-3'>
        <SkeletonBlock isDarkMode={isDarkMode} className='h-8 w-8 rounded-full' />
        <SkeletonBlock isDarkMode={isDarkMode} className='h-8 w-8 rounded-full' />
        <SkeletonBlock isDarkMode={isDarkMode} className='h-8 w-8 rounded-full' />
      </div>
    </td>
  </tr>
);

export default function DocumentsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Identity');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'type', 'size'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentTags, setCurrentTags] = useState([]);
  const filterMenuRef = useRef(null);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { isAdmin } = useAuth();

  // Real per-category counts, zero-filled so a tile always has a number even
  // before the fetch lands (the backend also zero-fills, so an absent key never
  // happens). For admin these are platform-wide (all users); for everyone else,
  // their own. Was previously hardcoded (Identity 12 / Tax 24 / …) against a
  // documents table that is empty in production, so those numbers were fiction.
  const [categoryCounts, setCategoryCounts] = useState(() =>
    Object.fromEntries(DOCUMENT_CATEGORIES.map(name => [name, 0]))
  );
  const tabs = DOCUMENT_CATEGORIES.map(name => ({
    name,
    count: categoryCounts[name] ?? 0,
  }));

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState([
    {
      title: 'Total Documents Stored',
      value: '0',
      subtitle: 'Documents',
      icon: '/icons/document-file.svg',
    },
    {
      title: 'Storage Used',
      value: '0GB',
      subtitle: 'of 5GB',
      icon: '/icons/storage-grid.svg',
    },
    {
      title: 'Last Uploaded',
      value: 'N/A',
      subtitle: 'N/A',
      icon: '/icons/upload-cloud.svg',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState(null); // doc id whose preview is loading

  // Fetch documents and statistics on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [documentsResponse, statsResponse] = await Promise.allSettled([
          listDocuments({ category: activeTab === 'Identity' ? undefined : activeTab, sortBy }),
          getDocumentStatistics(),
        ]);

        let rawDocs = [];
        if (documentsResponse.status === 'fulfilled') {
          rawDocs = documentsResponse.value.data || documentsResponse.value || [];
          setDocuments(rawDocs.map(doc => {
            // Backend document objects vary in field naming (see AssetDetailClient).
            // Normalise so the UI always has id/name/type/date/size — otherwise the
            // name shows "Untitled", the date is blank, and actions fire with an
            // undefined id (which is why the buttons appeared to do nothing).
            const name =
              doc.name || doc.fileName || doc.file_name || doc.filename ||
              doc.originalName || doc.originalFilename || doc.title || 'Untitled document';
            const rawDate =
              doc.uploadedDate || doc.uploadedAt || doc.uploaded_at ||
              doc.createdAt || doc.created_at || doc.date;
            const dateObj = rawDate ? new Date(rawDate) : null;
            const validDate = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj : null;
            const extType = name.includes('.') ? name.split('.').pop().toUpperCase() : '';
            const rawSize = doc.size || doc.fileSize || doc.file_size || doc.sizeBytes || doc.size_bytes || 0;
            return {
              id: doc.id || doc._id || doc.documentId,
              name,
              type: (extType || doc.type || doc.fileType || doc.documentType || doc.document_type || 'PDF').toString().toUpperCase(),
              uploadedDate: validDate
                ? validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '',
              uploadedDateValue: validDate || new Date(0),
              category: doc.category || 'Identity',
              size: rawSize ? rawSize / (1024 * 1024) : 0, // MB, used for sorting
              sizeBytes: rawSize, // raw bytes, used by the preview modal's formatter
              url: doc.url || doc.fileUrl || doc.downloadUrl || doc.download_url || doc.path || '',
              // Real uploader for the preview modal (was hardcoded). Backend field
              // name varies; fall back to the current viewer since this page only
              // lists the viewer's own documents.
              uploadedBy:
                doc.uploadedBy || doc.uploaded_by || doc.ownerName || doc.owner_name ||
                doc.userName || doc.user_name || doc.uploaderName || null,
              uploadedAtValue: validDate ? validDate.toISOString() : null,
            };
          }));
        }

        let perUserStats = null;
        if (statsResponse.status === 'fulfilled') {
          perUserStats = statsResponse.value;
          setStats(buildStatsCards(perUserStats));
        } else {
          // Defensive fallback: if the statistics endpoint is unavailable, compute
          // the storage cards from the documents we already loaded so the page
          // still renders. (This used to be the norm — BUG-10, where the route was
          // shadowed by /documents/{id} and 422'd — but the backend has since
          // fixed the route ordering; this is now just belt-and-suspenders.)
          console.warn('Document statistics endpoint failed; computing from documents list', statsResponse.reason);
          setStats(buildStatsCards(computeStatisticsFromDocuments(rawDocs)));
        }

        // Category tiles are role-scoped: admin sees platform-wide counts (all
        // users) via the admin endpoint; everyone else sees their own, which ride
        // along on the per-user statistics response. Keys are the exact enum
        // labels — read verbatim, zero-filled per category by the backend.
        let categories = perUserStats?.categories || null;
        if (isAdmin) {
          try {
            const adminStats = await getAdminDocumentStatistics();
            categories = adminStats?.categories || categories;
          } catch (adminErr) {
            // Non-fatal: fall back to the admin's own counts rather than blanking
            // the tiles. A 403 here would mean the role check disagrees with ours.
            console.warn('Platform-wide document stats unavailable; showing own counts', adminErr);
          }
        }
        if (categories) {
          setCategoryCounts(prev => {
            const next = { ...prev };
            for (const name of DOCUMENT_CATEGORIES) {
              if (categories[name] != null) next[name] = categories[name];
            }
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Failed to load documents. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [activeTab, sortBy, isAdmin]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = (doc.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Show all documents when Identity tab is active, otherwise filter by category
      const matchesTab = activeTab === 'Identity' || doc.category === activeTab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.uploadedDateValue - a.uploadedDateValue; // Newest first
        case 'type':
          return a.type.localeCompare(b.type);
        case 'size':
          return b.size - a.size; // Largest first
        default:
          return 0;
      }
    });

  const handleFilterSelect = filter => {
    setSortBy(filter);
    setShowFilterMenu(false);
  };

  const handleView = async doc => {
    // Open the preview modal for an already-uploaded document. handlePreview
    // fetches a preview URL when the doc has an id, and falls back to the doc's
    // own url if that fails. (Previously this only console.logged — hence the
    // "View does nothing" report.) viewingId drives the per-row spinner while
    // the preview URL is being fetched.
    setViewingId(doc.id);
    try {
      // Pass size in BYTES (the modal's formatFileSize expects bytes; doc.size
      // is MB for sorting). Otherwise it renders "191.08 undefined".
      await handlePreview({ ...doc, size: doc.sizeBytes, previewUrl: doc.url }, []);
    } finally {
      setViewingId(null);
    }
  };

  // Save a blob to disk via a temporary anchor — this is what makes the browser
  // actually download the file instead of navigating to / viewing it.
  const saveBlob = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  // Resolve something downloadable for a doc: either the file payload itself, or
  // a URL. Tries the backend /download endpoint first, then a preview/file URL
  // (Supabase-backed) so downloads still work if /download is broken (400).
  const resolveDownloadable = async (doc) => {
    try {
      const response = await downloadDocument(doc.id);
      if (response instanceof Blob) return { blob: response };
      const url = response?.url || response?.downloadUrl || response?.fileUrl || response?.signedUrl;
      if (url) return { url };
      if (response) return { blob: new Blob([response], { type: 'application/octet-stream' }) };
    } catch (error) {
      console.warn('Download endpoint failed, trying preview URL:', error?.message || error);
    }
    try {
      const preview = await getDocumentPreview(doc.id);
      const url = preview?.previewUrl || preview?.url || preview?.downloadUrl || doc.url;
      if (url) return { url };
    } catch {
      /* fall through */
    }
    return null;
  };

  const handleDownload = async (doc) => {
    try {
      const resolved = await resolveDownloadable(doc);
      if (!resolved) throw new Error('No downloadable file is available for this document.');

      if (resolved.blob) {
        saveBlob(resolved.blob, doc.name);
      } else {
        // Fetch the remote (Supabase) file and save it as a blob so the browser
        // downloads it. If CORS/network blocks the fetch, fall back to an anchor
        // with the download attribute pointed straight at the URL.
        try {
          const res = await fetch(resolved.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          saveBlob(await res.blob(), doc.name);
        } catch {
          const a = document.createElement('a');
          a.href = resolved.url;
          a.download = doc.name || 'document';
          a.target = '_blank';
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
      toast.success('Download started!');
    } catch (error) {
      console.error('Failed to download document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to download document. Please try again.';
      toast.error(errorMsg);
    }
  };

  // Open the share popup for a document and resolve a public link to show in it.
  // Prefers the backend share link; falls back to the file's preview/public URL
  // (Supabase) so there's always a "view anywhere" link to copy.
  const openShareModal = async (doc) => {
    if (!doc) return;
    setCurrentFile(doc);
    setShareLink('');
    setShareLinkLoading(true);
    setIsShareModalOpen(true);
    try {
      try {
        const response = await shareDocument(doc.id, { generateLink: true, permissions: 'view' });
        const link =
          response?.shareableLink || response?.shareLink || response?.url ||
          response?.publicUrl || response?.signedUrl;
        if (link) {
          setShareLink(link);
          return;
        }
      } catch (error) {
        console.warn('Share endpoint failed, falling back to file URL:', error?.message || error);
      }
      try {
        const preview = await getDocumentPreview(doc.id);
        const url = preview?.previewUrl || preview?.url || preview?.downloadUrl || doc.url;
        if (url) {
          setShareLink(url);
          return;
        }
      } catch {
        /* fall through */
      }
      toast.error('Could not generate a public link for this file.');
    } finally {
      setShareLinkLoading(false);
    }
  };

  const handleShare = (doc) => openShareModal(doc);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully!');
      } catch (error) {
        console.error('Failed to delete document:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to delete document. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handlePreview = async (file, tags) => {
    try {
      // If file has an ID, fetch preview from API
      if (file.id) {
        const preview = await getDocumentPreview(file.id);
        setCurrentFile({ ...file, previewUrl: preview.previewUrl || preview.url });
      } else {
        setCurrentFile(file);
      }
      setCurrentTags(tags);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Failed to get document preview:', error);
      setCurrentFile(file);
      setCurrentTags(tags);
      setIsPreviewModalOpen(true);
    }
  };

  const handleContinue = async (file, tags) => {
    try {
      // Upload the file
      if (file.file) {
        const response = await uploadDocument(file.file, {
          category: activeTab,
          tags: tags || [],
          description: file.description || '',
        });
        
        // Update documents list
        const newDoc = {
          id: response.id || response.data?.id,
          name: response.name || file.name,
          type: response.type || file.type,
          uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          uploadedDateValue: new Date(),
          category: activeTab,
          size: response.size ? response.size / (1024 * 1024) : file.size / (1024 * 1024),
        };
        setDocuments([newDoc, ...documents]);
        
        setCurrentFile(newDoc);
        setCurrentTags(tags);
        setIsSuccessModalOpen(true);
        toast.success('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to upload document. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleReturnToDashboard = () => {
    setIsSuccessModalOpen(false);
    setCurrentFile(null);
    setCurrentTags([]);
  };

  const handleShareDocument = file => openShareModal(file);

  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    setShareLink('');
    setCurrentFile(null);
    setCurrentTags([]);
  };

  // Apply the share settings from the modal: invite people (when any) with their
  // chosen permissions, otherwise just confirm the public-link settings.
  const handleShareSubmit = async (settings) => {
    const docId = currentFile?.id;
    try {
      if (docId && settings?.invitedUsers?.length) {
        await shareDocument(docId, {
          emails: settings.invitedUsers.map(u => u.email),
          permissions: settings.invitedUsers.map(u => ({ email: u.email, permission: u.permission })),
          viewOnly: settings.viewOnly,
          restrictDownload: settings.restrictDownload,
          requireSignIn: settings.requireSignIn,
          generateLink: true,
        });
        const n = settings.invitedUsers.length;
        toast.success(`Shared with ${n} ${n === 1 ? 'person' : 'people'}.`);
      } else {
        toast.success('Share settings applied.');
      }
    } catch (error) {
      console.error('Failed to share document:', error);
      toast.error(error.data?.detail || error.message || 'Failed to share document. Please try again.');
    } finally {
      handleCloseShare();
    }
  };

  return (
    <>
      {/* Header */}
      <div className='mb-8'>
        <h1
          className={`text-3xl md:text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Documents Vault
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Manage and organize your important documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <StatCardSkeleton key={index} isDarkMode={isDarkMode} />
            ))
          : stats.map((stat, index) => (
          <div
            key={index}
            className='relative rounded-2xl p-6 border'
            style={
              isDarkMode
                ? {
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }
            }
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='flex-1'>
                <p
                  className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {stat.title}
                </p>
                <h3
                  className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </h3>
                <p className='text-[#F1CB68] text-sm'>{stat.subtitle}</p>
              </div>
              <div className='ml-4'>
                <Image
                  src={stat.icon}
                  alt={stat.title}
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='mb-6'>
        {isAdmin && (
          <p className={`text-xs mb-2 ${isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'}`}>
            Showing document counts across all users (platform-wide).
          </p>
        )}
        <div
          className='flex gap-2 flex-wrap pb-4'
          style={{
            borderBottom: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          {tabs.map(tab => (
            <div
              key={tab.name}
              className='rounded-full transition-all duration-300'
              style={
                activeTab === tab.name
                  ? {
                      padding: '1px',
                      background:
                        'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      boxShadow: '0 0 20px rgba(241, 203, 104, 0.2)',
                    }
                  : {
                      padding: '0px',
                    }
              }
            >
              <button
                onClick={() => setActiveTab(tab.name)}
                className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer w-full h-full border'
                style={
                  activeTab === tab.name
                    ? isDarkMode
                      ? {
                          background:
                            'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                          color: '#FFFFFF',
                          borderColor: 'transparent',
                        }
                      : {
                          background: 'transparent',
                          color: '#000000',
                          borderColor: 'transparent',
                        }
                    : {
                        background: 'transparent',
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        borderColor: isDarkMode
                          ? 'rgba(156, 163, 175, 0.3)'
                          : 'rgba(0, 0, 0, 0.1)',
                      }
                }
              >
                {tab.name} {tab.count}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col md:flex-row gap-4 mb-6 justify-between items-center'>
        <div className='relative flex-1 max-w-md w-full'>
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50'>
            <Image
              src='/icons/search.svg'
              alt='Search'
              width={16}
              height={16}
            />
          </div>
          <input
            type='text'
            placeholder='Search documents...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all cursor-text ${
              isDarkMode
                ? 'text-white placeholder-gray-500'
                : 'text-gray-900 placeholder-gray-400'
            }`}
            style={
              isDarkMode
                ? {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }
            }
            onFocus={e =>
              (e.target.style.borderColor = 'rgba(241, 203, 104, 0.3)')
            }
            onBlur={e =>
              (e.target.style.borderColor = isDarkMode
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)')
            }
          />
        </div>

        <div className='flex gap-2 sm:gap-4 items-center flex-wrap'>
          <div className='relative' ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border shrink-0 ${
                isDarkMode ? '' : ''
              }`}
              style={
                isDarkMode
                  ? {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#9CA3AF',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      color: '#6B7280',
                    }
              }
            >
              <Image
                src='/icons/grid.svg'
                alt='Filter'
                width={14}
                height={14}
                className='sm:w-4 sm:h-4'
              />
              <span className='hidden sm:inline'>Filter</span>
            </button>
            {showFilterMenu && (
              <div
                className={`absolute top-full mt-2 left-0 md:left-auto md:right-0 w-48 max-w-[calc(100vw-2rem)] rounded-lg p-2 z-50 border ${
                  isDarkMode ? '' : ''
                }`}
                style={
                  isDarkMode
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(34, 33, 38, 0.95) 0%, rgba(17, 17, 22, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }
                    : {
                        background: '#fffffffF',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }
                }
              >
                <button
                  onClick={() => handleFilterSelect('date')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'date'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Date
                </button>
                <button
                  onClick={() => handleFilterSelect('type')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'type'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Type
                </button>
                <button
                  onClick={() => handleFilterSelect('size')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'size'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Size
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            className='flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            <Image
              src='/icons/upload-arrow.svg'
              alt='Upload'
              width={14}
              height={14}
              className='sm:w-4 sm:h-4'
            />
            <span className='hidden sm:inline'>Upload New Document</span>
            <span className='sm:hidden'>Upload</span>
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div
        className={`rounded-2xl overflow-hidden border ${isDarkMode ? '' : ''}`}
        style={
          isDarkMode
            ? {
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }
            : {
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }
        }
      >
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr
                style={{
                  borderBottom: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Document Name
                </th>
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Uploaded Date
                </th>
                <th
                  className={`text-right px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <DocumentRowSkeleton key={index} isDarkMode={isDarkMode} />
                ))
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td
                    colSpan='4'
                    className={`text-center px-6 py-12 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr
                    key={doc.id}
                    className={`transition-all ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                    style={{
                      borderBottom: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {getDocumentIcon(doc.type)}
                        <span
                          className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {doc.type}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {doc.uploadedDate}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-3'>
                        <button
                          onClick={() => handleView(doc)}
                          disabled={viewingId === doc.id}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer disabled:cursor-wait'
                          title='View'
                        >
                          {viewingId === doc.id ? (
                            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#F1CB68] border-t-transparent' />
                          ) : (
                            <Image
                              src='/icons/Eye.svg'
                              alt='View'
                              width={16}
                              height={16}
                            />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer'
                          title='Download'
                        >
                          <Image
                            src='/icons/download.svg'
                            alt='Download'
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleShare(doc)}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer'
                          title='Share'
                        >
                          <Image
                            src='/icons/Shear.svg'
                            alt='Share'
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className='p-2 rounded-full transition-all hover:bg-red-500/20 cursor-pointer'
                          title='Delete'
                        >
                          <Image
                            src='/icons/Delete.svg'
                            alt='Delete'
                            width={16}
                            height={16}
                          />
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

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
        onPreview={handlePreview}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        setIsOpen={setIsPreviewModalOpen}
        file={currentFile}
        tags={currentTags}
        onContinue={handleContinue}
      />

      {/* Upload Success Modal */}
      <UploadSuccessModal
        isOpen={isSuccessModalOpen}
        setIsOpen={setIsSuccessModalOpen}
        file={currentFile}
        onReturnToDashboard={handleReturnToDashboard}
        onShare={handleShareDocument}
      />

      {/* Share Document Modal */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
        file={currentFile}
        shareLink={shareLink}
        loading={shareLinkLoading}
        onShare={handleShareSubmit}
      />
    </>
  );
}
