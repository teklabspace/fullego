'use client';
import {
  allCategories,
  getCardFieldsForCategory,
  getCategoryGroup,
} from '@/config/assetConfig';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAssets,
  listAllAssetsAdmin,
  deleteAsset,
  requestAssetSale,
  requestAssetAppraisal,
  runAiAppraisal,
  formatCurrency,
} from '@/utils/assetsApi';
import AssetCardSkeleton from '@/components/skeletons/AssetCardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/context/SearchContext';
import { listAppraisals } from '@/utils/conciergeApi';
import { LuClock, LuZap, LuCheck } from 'react-icons/lu';
import { FaUserTie, FaRobot } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Pull the human-readable message the API sent (FastAPI `detail`), falling back
// to the thrown Error message and finally a provided default — so toasts show
// exactly what the server said.
const apiErrorMessage = (err, fallback) => {
  const detail = err?.data?.detail ?? err?.data?.message ?? err?.message;
  return typeof detail === 'string' && detail ? detail : fallback;
};

// Concierge appraisal types — same options (and same `appraisal_type` field)
// as the asset detail page; one backend code path, copy-only descriptions.
const APPRAISAL_TYPE_OPTIONS = [
  {
    value: 'Standard',
    label: 'Standard',
    description:
      'A standard professional appraisal covering current market value and overall condition.',
  },
  {
    value: 'Comprehensive',
    label: 'Comprehensive',
    description:
      'An in-depth appraisal with full documentation, provenance, and detailed market analysis.',
  },
  {
    value: 'Expedited',
    label: 'Expedited',
    description:
      'A faster-turnaround appraisal for when you need a valuation quickly.',
  },
  {
    value: 'Insurance',
    label: 'Insurance',
    description:
      'A valuation prepared specifically for insurance coverage and replacement value.',
  },
];

// A human (concierge) appraisal in one of these statuses blocks a new request
// for the same asset (backend enforces this with a 409) and is what the
// "Appraisal · <status>" tag on the card reflects. AI appraisals don't count.
const OPEN_APPRAISAL_STATUSES = [
  'pending',
  'in_progress',
  'needs_more_information',
  'professional_appraisal_recommended',
];

// "needs_more_information" → "Needs More Information"
const prettyStatus = (status) =>
  (status || '').toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ADMIN_PAGE_SIZE = 10;

export default function AssetsPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  // Admins see ALL users' assets (searchable + paginated) via the admin endpoint;
  // everyone else sees their own. `authMounted` gates the first fetch until the
  // role is known so we don't fire the wrong request on mount.
  const { isAdmin, mounted: authMounted } = useAuth();
  // Search term comes from the shared navbar search box (see SearchContext).
  const { query: adminSearchInput } = useSearch();
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [adminPagination, setAdminPagination] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    saleNote: '',
    targetPrice: '',
  });
  const [appraisalType, setAppraisalType] = useState(null);
  // Specific concierge appraisal type (Standard/Comprehensive/…), chosen after
  // picking the Concierge method in the modal.
  const [conciergeAppraisalType, setConciergeAppraisalType] = useState(null);
  // assetId → { id, appraisalType, status } for every asset with an OPEN human
  // appraisal. Drives the "Appraisal · <status>" tag on cards and blocks a
  // duplicate concierge request before the backend has to 409 it.
  const [appraisalByAsset, setAppraisalByAsset] = useState({});
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingSell, setSubmittingSell] = useState(false);
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);

  // Fetch assets from API
  const fetchAssets = useCallback(async () => {
    // Hold off until we know the role (admin vs. not) so the first call is right.
    if (!authMounted) return;
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isAdmin) {
        // All users' assets — server-side search + pagination, owner attached.
        response = await listAllAssetsAdmin({
          search: adminSearch || undefined,
          page: adminPage,
          pageSize: ADMIN_PAGE_SIZE,
        });
        setAdminPagination(response.pagination || null);
      } else {
        response = await getAssets({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy: 'created_at',
          order: 'desc',
        });
      }

      const formattedAssets = (response.data || []).map(asset => ({
        ...asset,
        estimatedValue: asset.estimatedValue
          ? formatCurrency(asset.estimatedValue, asset.currency)
          : asset.estimatedValue,
        currentValue: asset.currentValue
          ? formatCurrency(asset.currentValue, asset.currency)
          : asset.currentValue,
        image: asset.image || (asset.images && asset.images[0]) || null,
        lastAppraisal: asset.lastAppraisalDate || asset.lastAppraisal,
      }));

      setAssets(formattedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      let errorMessage = 'Failed to load assets';
      const rawMessage = err.message || err.data?.detail || err.data?.message || '';
      if (rawMessage) {
        if (rawMessage.includes('greenlet_spawn') || rawMessage.includes('await_only') || rawMessage.includes('IO attempted in an unexpected place')) {
          errorMessage = 'Server error: Database connection issue. Please try again later.';
        } else if (rawMessage.includes('Failed to fetch') || rawMessage.includes('network') || rawMessage.includes('ERR_FAILED')) {
          errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
        } else if (err.status === 500) {
          errorMessage = 'Server error: Please try again later or contact support.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid request. Please check your input and try again.';
        } else if (err.status === 401) {
          router.replace('/login');
          return;
        } else if (err.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view assets.';
        } else if (err.status === 404) {
          errorMessage = 'Resource not found.';
        } else {
          errorMessage = rawMessage.includes('sqlalchemy') || rawMessage.includes('greenlet') || rawMessage.includes('await_only')
            ? 'Server error: Please try again later or contact support.'
            : rawMessage;
        }
      } else if (err.status === 500) {
        errorMessage = 'Server error: Please try again later or contact support.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authMounted, isAdmin, adminSearch, adminPage, selectedCategory, router]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Load the user's appraisal requests once and index the human ones by asset:
  // OPEN appraisals (pending/in progress/…) and COMPLETED ones (shown as a green
  // "Approved" tag). The asset list itself doesn't carry appraisal state, so
  // this is how the cards know what tag to show. An open appraisal wins over a
  // completed one — it's the actionable state (and it blocks a new request).
  const fetchOpenAppraisals = useCallback(async () => {
    try {
      const res = await listAppraisals({ limit: 100 });
      const raw = res?.data ?? res;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.appraisals) ? raw.appraisals : [];
      const map = {};
      for (const ap of list) {
        const assetId = ap.assetId || ap.asset_id || ap.asset?.id;
        const type = (ap.appraisalType || ap.appraisal_type || ap.type || '').toString();
        const status = (ap.status || '').toString().toLowerCase();
        const isAi = type.toUpperCase() === 'API' || type.toUpperCase() === 'AI';
        const isOpen = OPEN_APPRAISAL_STATUSES.includes(status);
        if (!assetId || isAi || (!isOpen && status !== 'completed')) continue;
        const prev = map[assetId];
        if (prev && OPEN_APPRAISAL_STATUSES.includes(prev.status)) continue;
        if (prev && !isOpen) continue; // keep the first completed one (newest first)
        map[assetId] = { id: ap.id, appraisalType: type, status };
      }
      setAppraisalByAsset(map);
    } catch {
      // Tags are best-effort — the backend still 409s duplicate requests.
    }
  }, []);

  useEffect(() => {
    if (authMounted) fetchOpenAppraisals();
  }, [authMounted, fetchOpenAppraisals]);

  // Debounce the admin search box, resetting to page 1 on each new query.
  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => {
      setAdminSearch(adminSearchInput.trim());
      setAdminPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [adminSearchInput, isAdmin]);

  // Get all categories for filtering
  const categories = [
    { id: 'all', name: 'All Assets', icon: 'AllAssets.svg' },
    ...allCategories
      .filter(cat => cat.iconFile) // Only show categories with icon files for now
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.iconFile,
      })),
  ];

  const normalizeCategory = s => s?.toLowerCase().replace(/[\s_-]+/g, '') || '';
  const filteredAssets =
    selectedCategory === 'all'
      ? assets
      : assets.filter(
          asset =>
            normalizeCategory(asset.category) === normalizeCategory(selectedCategory)
        );

  const handleViewDetails = asset => {
    // Admins load any user's asset by code via the admin-only detail endpoint.
    if (isAdmin && asset.assetCode) {
      router.push(`/dashboard/assets/detail?code=${encodeURIComponent(asset.assetCode)}`);
    } else {
      router.push(`/dashboard/assets/detail?id=${asset.id}`);
    }
  };

  const handleRequestSell = asset => {
    setSelectedAsset(asset);
    setShowSellModal(true);
    setSellFormData({ saleNote: '', targetPrice: '' });
  };

  const handleRequestAppraisal = asset => {
    setSelectedAsset(asset);
    setShowAppraisalModal(true);
    setAppraisalType(null);
    setConciergeAppraisalType(null);
  };

  const handleSubmitSellRequest = async () => {
    try {
      setSubmittingSell(true);
      await requestAssetSale(selectedAsset.id, {
        targetPrice: sellFormData.targetPrice ? parseFloat(sellFormData.targetPrice.replace(/[^0-9.-]+/g, '')) : undefined,
        saleNote: sellFormData.saleNote || undefined,
      });
      toast.success('Sell request submitted successfully!');
      setShowSellModal(false);
      setSellFormData({ saleNote: '', targetPrice: '' });
    } catch (err) {
      console.error('Error submitting sell request:', err);
      toast.error(apiErrorMessage(err, 'Failed to submit sell request'));
    } finally {
      setSubmittingSell(false);
    }
  };

  const handleSubmitAppraisal = async () => {
    try {
      setSubmittingAppraisal(true);

      // Automated (AI) appraisal: a single synchronous call that returns the
      // estimate inline. Concierge: a normal request handled later by staff.
      if (appraisalType === 'API') {
        const response = await runAiAppraisal(selectedAsset.id);
        const status = response.data?.status;
        const result = response.aiResult;

        if (status === 'appraisal_failed') {
          toast.error(response.data?.notes || 'AI appraisal could not be completed. Please try again.');
        } else if (result) {
          const valueStr = formatCurrency(result.estimatedValue, result.currency);
          if (status === 'needs_more_information') {
            toast.success(`AI estimate: ${valueStr} — add missing details to improve accuracy.`);
          } else if (status === 'professional_appraisal_recommended') {
            toast.success(`AI estimate: ${valueStr} — a certified appraisal is recommended.`);
          } else {
            toast.success(`AI estimate: ${valueStr}`);
          }
        } else {
          toast.success('Automated appraisal completed.');
        }
        // Backend updated the asset's estimated value — refresh the list.
        fetchAssets();
      } else {
        // Concierge: send the specific type the user picked (Standard/…) as
        // `appraisal_type` — same field the detail page uses.
        await requestAssetAppraisal(selectedAsset.id, {
          appraisalType: conciergeAppraisalType,
        });
        toast.success(`${conciergeAppraisalType} appraisal request submitted successfully!`);
        // Tag the card right away — the new request starts out pending.
        setAppraisalByAsset(m => ({
          ...m,
          [selectedAsset.id]: { appraisalType: conciergeAppraisalType, status: 'pending' },
        }));
      }

      setShowAppraisalModal(false);
      setAppraisalType(null);
      setConciergeAppraisalType(null);
    } catch (err) {
      console.error('Error submitting appraisal request:', err);
      const existing = err?.data?.existing_appraisal;
      if (err.status === 409 || existing) {
        // An appraisal is already open for this asset — tell the user which
        // one, and tag the card so the state is visible without retrying.
        toast.info(
          existing
            ? `An appraisal is already in progress for this asset (${existing.appraisal_type} · ${prettyStatus(existing.status)}).`
            : apiErrorMessage(err, 'An appraisal is already in progress for this asset.')
        );
        if (existing) {
          setAppraisalByAsset(m => ({
            ...m,
            [selectedAsset.id]: {
              id: existing.id,
              appraisalType: existing.appraisal_type,
              status: (existing.status || 'pending').toLowerCase(),
            },
          }));
        }
      } else if (err.status === 403) {
        // Monthly AI limit reached — surface the backend's upgrade message.
        toast.info(apiErrorMessage(err, 'You have reached your monthly AI appraisal limit. Upgrade for more.'));
      } else if (err.status === 503) {
        // AI not configured / temporarily unavailable — show the server's reason.
        toast.error(apiErrorMessage(err, 'The AI service is temporarily unavailable. Please try again.'));
      } else {
        toast.error(apiErrorMessage(err, 'Failed to submit appraisal request'));
      }
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  const handleDeleteAsset = () => {
    fetchAssets();
  };

  return (
    <>
      {/* Hero Section */}
      <div
        className='relative mb-8 rounded-2xl overflow-hidden border border-[#FFFFFF14]'
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '240px',
        }}
      >
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(90deg, #1A1F24 0%, rgba(0, 0, 0, 0) 100%)',
            height: '245px',
          }}
        />
        <div className='relative h-full flex flex-col justify-center px-8'>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}
          >
            Manage Your Luxury Portfolio
          </h1>
          <p className='text-gray-200 text-lg mb-6 max-w-2xl'>
            Track, monitor, and manage your high-value assets in one place
          </p>
          <div className='flex gap-2 sm:gap-4 flex-wrap'>
            {/* Admins manage all users' assets and don't create their own. */}
            {!isAdmin && (
              <button
                onClick={() => router.push('/dashboard/assets/add')}
                className='bg-[#F1CB68] text-[#101014] px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 hover:bg-[#d4b55a] text-xs sm:text-base whitespace-nowrap'
              >
                <span>
                  <img
                    src='/AssestSpark.svg'
                    alt='Add'
                    className='w-3.5 h-3.5 sm:w-5 sm:h-5'
                  />
                </span>
                <span className='hidden sm:inline'>Add New Asset</span>
                <span className='sm:hidden'>Add Asset</span>
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors border text-xs sm:text-base whitespace-nowrap ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
              } backdrop-blur-sm`}
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Admin asset search is driven by the navbar search box (SearchContext). */}

      {/* Category Tabs */}
      <div className='flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide'>
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 shrink-0
              ${
                selectedCategory === category.id
                  ? 'bg-[#F1CB68] text-[#101014]'
                  : isDarkMode
                  ? 'bg-transparent border border-[#FFFFFF14] text-gray-400 hover:text-white hover:border-[#F1CB68]/50'
                  : 'bg-transparent border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-[#F1CB68]/50'
              }
            `}
          >
            {category.icon && (
              <img
                src={`/${category.icon}`}
                alt={category.name}
                className='w-4 h-4 sm:w-5 sm:h-5 shrink-0'
              />
            )}
            <span className='shrink-0'>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, index) => (
            <AssetCardSkeleton key={index} isDarkMode={isDarkMode} />
          ))}
        </div>
      ) : error ? (
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className='mb-4 flex justify-center'>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke={isDarkMode ? '#EF4444' : '#DC2626'}
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
          </div>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading assets
          </p>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger re-fetch by calling the useEffect again
              window.location.reload();
            }}
            className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
          >
            Retry
          </button>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] text-gray-400' : 'border-gray-300 text-gray-600'
        }`}>
          <p className='text-lg mb-2'>No assets found</p>
          {isAdmin ? (
            <p className='text-sm'>
              {adminSearch
                ? 'No assets match your search.'
                : 'There are no assets across any users yet.'}
            </p>
          ) : (
            <>
              <p className='text-sm mb-4'>Get started by adding your first asset</p>
              <button
                onClick={() => router.push('/dashboard/assets/add')}
                className='px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
              >
                Add New Asset
              </button>
            </>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              appraisal={appraisalByAsset[asset.id]}
              isDarkMode={isDarkMode}
              onViewDetails={() => handleViewDetails(asset)}
              onRequestSell={() => handleRequestSell(asset)}
              onRequestAppraisal={() => handleRequestAppraisal(asset)}
              onDelete={handleDeleteAsset}
            />
          ))}
        </div>
      )}

      {/* Admin pagination — shown whenever the admin all-assets list has results.
          Falls back gracefully if the API omits any pagination field. */}
      {isAdmin && !loading && !error && assets.length > 0 && (() => {
        const totalPages = Math.max(1, Number(adminPagination?.totalPages) || 1);
        const currentPage = Number(adminPagination?.page) || adminPage;
        const total = Number(adminPagination?.total);
        const baseBtn = 'px-4 py-2 rounded-lg text-sm font-medium border transition-colors';
        const activeBtn = isDarkMode
          ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300';
        return (
          <div className='flex items-center justify-between gap-4 mt-6'>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} of {totalPages}
              {Number.isFinite(total) && ` · ${total} assets`}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`${baseBtn} ${currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : activeBtn}`}
              >
                Previous
              </button>
              <button
                onClick={() => setAdminPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className={`${baseBtn} ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : activeBtn}`}
              >
                Next
              </button>
            </div>
          </div>
        );
      })()}

      {/* Sell Request Modal */}
      {showSellModal && selectedAsset && (
        <SellModal
          asset={selectedAsset}
          isDarkMode={isDarkMode}
          formData={sellFormData}
          onChange={setSellFormData}
          onSubmit={handleSubmitSellRequest}
          onClose={() => setShowSellModal(false)}
          submitting={submittingSell}
        />
      )}

      {/* Appraisal Request Modal */}
      {showAppraisalModal && selectedAsset && (
        <AppraisalModal
          asset={selectedAsset}
          isDarkMode={isDarkMode}
          selectedType={appraisalType}
          onSelectType={setAppraisalType}
          conciergeType={conciergeAppraisalType}
          onSelectConciergeType={setConciergeAppraisalType}
          existingAppraisal={appraisalByAsset[selectedAsset.id]}
          onSubmit={handleSubmitAppraisal}
          onClose={() => setShowAppraisalModal(false)}
          submitting={submittingAppraisal}
        />
      )}
    </>
  );
}

// Asset Card Component
function AssetCard({
  asset,
  appraisal,
  isDarkMode,
  onViewDetails,
  onRequestSell,
  onRequestAppraisal,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef(null);
  // Selling and requesting an appraisal are investor actions. Admins/advisors
  // manage assets but don't transact on them, so these are gated to investors.
  const { isInvestor } = useAuth();

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleDelete = () => {
    setMenuOpen(false);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError('');
      await deleteAsset(asset.id);
      setShowDeleteModal(false);
      onDelete();
    } catch (err) {
      const msg = err.message || '';
      if (err.status === 409 || msg.toLowerCase().includes('listed') || msg.toLowerCase().includes('marketplace')) {
        setDeleteError('Cannot delete: this asset has an active marketplace listing. Remove the listing first.');
      } else {
        setDeleteError(msg || 'Failed to delete asset. Please try again.');
      }
      setDeleting(false);
    }
  };
  // Get card fields for this asset's category
  const cardFields = getCardFieldsForCategory(asset.category);
  const categoryGroup = getCategoryGroup(asset.category);

  // Helper function to get field value from asset
  const getFieldValue = fieldName => {
    const lowerName = fieldName.toLowerCase();

    // Map field names to asset properties
    if (lowerName.includes('asset name') || lowerName.includes('fund name')) {
      return asset.name;
    }
    if (lowerName.includes('category')) {
      return asset.category;
    }
    if (lowerName.includes('location')) {
      return asset.location;
    }
    if (
      lowerName.includes('estimated value') ||
      lowerName.includes('current value') ||
      lowerName.includes('contribution value')
    ) {
      return asset.estimatedValue || asset.currentValue;
    }
    if (lowerName.includes('last appraisal')) {
      return asset.lastAppraisal;
    }
    if (lowerName.includes('condition')) {
      return asset.condition;
    }
    if (lowerName.includes('ownership type')) {
      return asset.ownershipType;
    }
    if (lowerName.includes('image')) {
      return asset.image;
    }
    if (lowerName.includes('investment type')) {
      return asset.investmentType;
    }
    if (lowerName.includes('institution')) {
      return asset.institution;
    }
    if (lowerName.includes('currency')) {
      return asset.currency;
    }
    if (lowerName.includes('risk level')) {
      return asset.riskLevel;
    }
    if (lowerName.includes('debt type')) {
      return asset.debtType;
    }
    if (lowerName.includes('creditor')) {
      return asset.creditor;
    }
    if (lowerName.includes('amount owed')) {
      return asset.amountOwed;
    }
    if (lowerName.includes('interest rate')) {
      return asset.interestRate;
    }
    if (lowerName.includes('due date')) {
      return asset.dueDate;
    }
    if (lowerName.includes('wealth type')) {
      return asset.wealthType;
    }
    if (lowerName.includes('description')) {
      return asset.description;
    }
    if (lowerName.includes('expected date')) {
      return asset.expectedDate;
    }
    if (
      lowerName.includes('type') &&
      !lowerName.includes('investment') &&
      !lowerName.includes('ownership') &&
      !lowerName.includes('debt') &&
      !lowerName.includes('wealth')
    ) {
      return asset.type;
    }
    if (lowerName.includes('impact area')) {
      return asset.impactArea;
    }
    if (lowerName.includes('service type')) {
      return asset.serviceType;
    }
    if (lowerName.includes('vendor')) {
      return asset.vendor;
    }
    if (lowerName.includes('membership id')) {
      return asset.membershipId;
    }
    if (lowerName.includes('annual cost')) {
      return asset.annualCost;
    }
    if (lowerName.includes('record type')) {
      return asset.recordType;
    }
    if (lowerName.includes('document name')) {
      return asset.documentName;
    }
    if (lowerName.includes('related asset/user')) {
      return asset.relatedAsset;
    }
    if (lowerName.includes('upload date')) {
      return asset.uploadDate;
    }
    if (lowerName.includes('expiry date')) {
      return asset.expiryDate;
    }

    // Fallback to asset property with same key
    const key = fieldName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return asset[key] || '';
  };

  // Render card field
  const renderCardField = fieldName => {
    const value = getFieldValue(fieldName);
    if (!value) return null;

    const lowerName = fieldName.toLowerCase();

    // Skip Image as it's rendered separately
    if (lowerName.includes('image')) return null;

    // Format value based on field type
    let displayValue = value;
    if (
      typeof value === 'string' &&
      (lowerName.includes('value') ||
        lowerName.includes('cost') ||
        lowerName.includes('owed'))
    ) {
      if (!value.startsWith('$')) {
        displayValue = `$${value}`;
      }
    }

    return (
      <div key={fieldName} className='mb-2'>
        <p
          className={`text-xs mb-1 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          {fieldName}
        </p>
        <p
          className={`font-semibold text-sm ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {displayValue}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`bg-transparent border rounded-2xl hover:border-[#F1CB68]/50 transition-all group relative ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-300'
      }`}
    >
      {/* Image */}
      <div className='relative h-48 overflow-hidden rounded-t-2xl'>
        {asset.image ? (
          <img
            src={asset.image}
            alt={asset.name}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#2A2A2D] to-[#1a1a1d]'
                : 'bg-gradient-to-br from-gray-200 to-gray-300'
            }`}
          >
            <span
              className={`text-4xl ${
                isDarkMode ? 'text-gray-600' : 'text-gray-500'
              }`}
            >
              {allCategories.find(c => c.id === asset.category)?.icon || '📦'}
            </span>
          </div>
        )}

        {/* Appraisal tag — gold while a human appraisal is open (pending, in
            progress…), green "Approved" once it's completed. */}
        {appraisal && (
          <span
            className={`absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-sm shadow-lg ${
              appraisal.status === 'completed' ? 'text-green-400' : 'text-[#F1CB68]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                appraisal.status === 'completed' ? 'bg-green-400' : 'bg-[#F1CB68] animate-pulse'
              }`}
            />
            {appraisal.appraisalType ? `${appraisal.appraisalType} Appraisal` : 'Appraisal'}
            {' · '}
            {appraisal.status === 'completed' ? 'Approved' : prettyStatus(appraisal.status)}
          </span>
        )}
      </div>

      {/* 3-dot menu — outside image overflow-hidden so dropdown renders fully */}
      <div ref={menuRef} className='absolute top-3 right-3 z-30'>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className='w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:bg-black/85 hover:scale-105'
        >
          <svg width='15' height='15' viewBox='0 0 24 24' fill='white'>
            <circle cx='5' cy='12' r='2.2' />
            <circle cx='12' cy='12' r='2.2' />
            <circle cx='19' cy='12' r='2.2' />
          </svg>
        </button>

        {menuOpen && (
          <div
            className='absolute right-0 top-11 min-w-[210px] rounded-2xl border z-50 overflow-hidden bg-[#0f0f12] border-[#ffffff18]'
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className='px-4 pt-3 pb-2 border-b border-[#ffffff0d]'>
              <p className='text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap text-gray-500'>
                Asset Actions
              </p>
            </div>

            <div className='py-1.5'>
              <button
                onClick={() => { setMenuOpen(false); onViewDetails(); }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left whitespace-nowrap text-gray-200 hover:bg-white/[0.07] hover:text-white'
              >
                <span className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/20'>
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#60a5fa' strokeWidth='2.2'>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                </span>
                View Details
              </button>

              {isInvestor && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onRequestSell(); }}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left whitespace-nowrap text-gray-200 hover:bg-white/[0.07] hover:text-white'
                  >
                    <span className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#F1CB68]/20'>
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#F1CB68' strokeWidth='2.2'>
                        <line x1='12' y1='1' x2='12' y2='23' />
                        <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                      </svg>
                    </span>
                    Request to Sell
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); onRequestAppraisal(); }}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left whitespace-nowrap text-gray-200 hover:bg-white/[0.07] hover:text-white'
                  >
                    <span className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/20'>
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#c084fc' strokeWidth='2.2'>
                        <circle cx='11' cy='11' r='8' />
                        <line x1='21' y1='21' x2='16.65' y2='16.65' />
                      </svg>
                    </span>
                    Request Appraisal
                  </button>
                </>
              )}
            </div>

            <div className='border-t mx-3 border-[#ffffff0f]' />

            <div className='py-1.5'>
              <button
                onClick={handleDelete}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300'
              >
                <span className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-red-500/20'>
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#f87171' strokeWidth='2.2'>
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14H6L5 6' />
                    <path d='M10 11v6M14 11v6' />
                    <path d='M9 6V4h6v2' />
                  </svg>
                </span>
                Delete Asset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-5'>
        <h3
          className={`font-semibold text-lg mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {asset.name}
        </h3>

        {/* Owner + asset code — present only on admin (all-assets) results.
            Username + id shown together in a single badge. Backend guarantees a
            name, so we never render an "unknown owner" placeholder. */}
        {asset.owner && (asset.owner.name || asset.owner.email) && (
          <div className='flex items-center gap-2 flex-wrap mb-3'>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                <circle cx='12' cy='7' r='4' />
              </svg>
              {asset.owner.name || asset.owner.email}
              {asset.assetCode && (
                <span className='font-mono opacity-70'>· {asset.assetCode}</span>
              )}
            </span>
          </div>
        )}

        {/* Dynamic Card Fields */}
        <div className='mb-4 space-y-2'>
          {cardFields.map(field => {
            const value = getFieldValue(field);
            if (!value || field.toLowerCase().includes('image')) return null;

            const lowerName = field.toLowerCase();
            let displayValue = value;

            // Format currency values
            if (
              typeof value === 'string' &&
              (lowerName.includes('value') ||
                lowerName.includes('cost') ||
                lowerName.includes('owed'))
            ) {
              if (!value.startsWith('$')) {
                displayValue = `$${value}`;
              }
            }

            // Format dates — includes "Last Appraisal" (an ISO timestamp), shown
            // as date only. Non-date strings (e.g. "Just now") pass through.
            if ((lowerName.includes('date') || lowerName.includes('appraisal')) && value) {
              try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  displayValue = date.toLocaleDateString();
                }
              } catch (e) {
                // Keep original value if date parsing fails
              }
            }

            return (
              <div key={field} className='flex justify-between items-center'>
                <p
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  {field}:
                </p>
                <p
                  className={`font-semibold text-sm text-right ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {displayValue}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className='space-y-2'>
          <button
            onClick={onViewDetails}
            className='w-full bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014] py-2.5 rounded-lg font-semibold transition-colors'
          >
            View Details
          </button>
          {isInvestor && categoryGroup === 'Assets' && (
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={onRequestSell}
                className={`text-sm py-2.5 rounded-lg font-medium transition-colors border ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                }`}
              >
                Request to Sell
              </button>
              <button
                onClick={onRequestAppraisal}
                className={`text-sm py-2.5 rounded-lg font-medium transition-colors border ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                }`}
              >
                Request Appraisal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm'>
          <div
            className='w-full max-w-sm rounded-2xl border overflow-hidden bg-[#0f0f12] border-[#ffffff18]'
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Icon + title */}
            <div className='flex flex-col items-center pt-8 pb-4 px-6 text-center'>
              <div className='w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mb-4'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#f87171' strokeWidth='2'>
                  <polyline points='3 6 5 6 21 6' />
                  <path d='M19 6l-1 14H6L5 6' />
                  <path d='M10 11v6M14 11v6' />
                  <path d='M9 6V4h6v2' />
                </svg>
              </div>
              <h3 className='text-lg font-bold text-white mb-1'>Delete Asset</h3>
              <p className='text-sm text-gray-400 leading-relaxed'>
                Are you sure you want to delete{' '}
                <span className='text-white font-semibold'>"{asset.name}"</span>?
                <br />
                This removes all photos, documents and valuations permanently.
              </p>
            </div>

            {/* Error message */}
            {deleteError && (
              <div className='mx-6 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20'>
                <p className='text-red-400 text-xs leading-relaxed'>{deleteError}</p>
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-3 px-6 pb-6'>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
                disabled={deleting}
                className='flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-white/8 hover:bg-white/12 text-gray-300 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className='flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-red-500 hover:bg-red-600 text-white disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {deleting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Deleting...
                  </span>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sell Request Modal Component
function SellModal({
  asset,
  isDarkMode,
  formData,
  onChange,
  onSubmit,
  onClose,
  submitting = false,
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'>
      <style jsx>{`
        .sell-modal-scrollbar-transparent::-webkit-scrollbar {
          width: 8px;
        }
        .sell-modal-scrollbar-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        .sell-modal-scrollbar-transparent::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .sell-modal-scrollbar-transparent::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .sell-modal-scrollbar-transparent {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
      <div
        className={`border rounded-2xl max-w-2xl w-full my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-300'
        }`}
      >
        {/* Header */}
        <div
          className={`border-b p-4 sm:p-6 flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Request to Sell
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <span
              className={`text-2xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              ×
            </span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className='p-4 sm:p-6 overflow-y-auto flex-1 sell-modal-scrollbar-transparent'>
          {/* Asset Summary */}
          <div
            className={`border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ${
              isDarkMode
                ? 'bg-white/5 border-[#FFFFFF14]'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Confirm Asset Details
            </h3>
            <div className='grid grid-cols-2 gap-3 sm:gap-4'>
              <div>
                <p
                  className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  Asset Name
                </p>
                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {asset.name}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  Category
                </p>
                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {asset.category}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  Current Value
                </p>
                <p className='text-[#F1CB68] font-semibold text-xs sm:text-sm'>
                  {asset.estimatedValue}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  Condition
                </p>
                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {asset.condition}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className='space-y-3 sm:space-y-4 mb-4 sm:mb-6'>
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Target Price (Optional)
              </label>
              <input
                type='text'
                value={formData.targetPrice}
                onChange={e =>
                  onChange({ ...formData, targetPrice: e.target.value })
                }
                placeholder='Enter your target price'
                className={`w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors border text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Sale Notes
              </label>
              <textarea
                value={formData.saleNote}
                onChange={e =>
                  onChange({ ...formData, saleNote: e.target.value })
                }
                placeholder='Add any additional information about the sale...'
                rows={4}
                className={`w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none border text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className='bg-[#F1CB68]/10 border border-[#F1CB68]/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6'>
            <p className='text-[#F1CB68] text-xs sm:text-sm'>
              <strong>Note:</strong> Our team will review your request and
              contact you within 24-48 hours with next steps and potential
              buyers.
            </p>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div
          className={`border-t p-4 sm:p-6 flex gap-3 shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors border text-sm sm:text-base ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
              submitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014]'
            }`}
          >
            {submitting ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Appraisal Request Modal Component
function AppraisalModal({
  asset,
  isDarkMode,
  selectedType,
  onSelectType,
  conciergeType,
  onSelectConciergeType,
  existingAppraisal,
  onSubmit,
  onClose,
  submitting = false,
}) {
  // A concierge request needs a specific appraisal type, and is blocked while
  // another human appraisal is still OPEN. A completed ("Approved") appraisal
  // doesn't block re-appraising. AI appraisals are unaffected either way.
  const conciergeBlocked = Boolean(
    existingAppraisal && OPEN_APPRAISAL_STATUSES.includes(existingAppraisal.status)
  );
  const canSubmit =
    !submitting &&
    (selectedType === 'API' ||
      (selectedType === 'Concierge' && !!conciergeType && !conciergeBlocked));

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'>
      <style jsx>{`
        .modal-scrollbar-transparent::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scrollbar-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-scrollbar-transparent::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .modal-scrollbar-transparent::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .modal-scrollbar-transparent {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
      <div
        className={`border rounded-2xl max-w-2xl w-full my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-300'
        }`}
      >
        {/* Header */}
        <div
          className={`border-b p-4 sm:p-6 flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Request Appraisal
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <span
              className={`text-2xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              ×
            </span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className='p-4 sm:p-6 overflow-y-auto flex-1 modal-scrollbar-transparent'>
          {/* Asset Info */}
          <div
            className={`flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b ${
              isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
            }`}
          >
            <img
              src={asset.image}
              alt={asset.name}
              className='w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0'
            />
            <div className='min-w-0 flex-1'>
              <h3
                className={`font-semibold text-base sm:text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {asset.name}
              </h3>
              <p
                className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {asset.category} • {asset.location}
              </p>
              <p className='text-[#F1CB68] font-semibold mt-1 text-sm sm:text-base'>
                Current Value: {asset.estimatedValue}
              </p>
            </div>
          </div>

          {/* An appraisal is already open for this asset — concierge requests
              are blocked until it completes; AI appraisals still work. */}
          {conciergeBlocked && (
            <div className='bg-[#F1CB68]/10 border border-[#F1CB68]/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6'>
              <p className='text-[#F1CB68] text-xs sm:text-sm'>
                <strong>An appraisal is already in progress</strong> for this asset
                {existingAppraisal?.appraisalType ? ` (${existingAppraisal.appraisalType}` : ' ('}
                {' · '}{prettyStatus(existingAppraisal?.status)}). You can request a new
                concierge appraisal once it completes. AI appraisals are unaffected.
              </p>
            </div>
          )}

          {/* Appraisal Options */}
          <div className='mb-4 sm:mb-6'>
            <h3
              className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Choose Appraisal Method
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
              {/* Concierge Option */}
              <button
                onClick={() => onSelectType('Concierge')}
                disabled={conciergeBlocked}
                className={`
                  text-left p-4 sm:p-5 rounded-xl border-2 transition-all
                  ${conciergeBlocked ? 'opacity-50 cursor-not-allowed' : ''}
                  ${
                    selectedType === 'Concierge'
                      ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                      : isDarkMode
                      ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                      : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                  }
                `}
              >
                <div className='flex items-start justify-between mb-2 sm:mb-3'>
                  <div className='w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#F1CB68] to-[#BF9B30] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#F1CB68]/20 ring-1 ring-white/10'>
                    <FaUserTie className='text-xl sm:text-2xl text-[#101014]' />
                  </div>
                  {selectedType === 'Concierge' && (
                    <div className='w-5 h-5 sm:w-6 sm:h-6 bg-[#F1CB68] rounded-full flex items-center justify-center shrink-0'>
                      <LuCheck className='text-[#101014] text-xs sm:text-sm' strokeWidth={3} />
                    </div>
                  )}
                </div>
                <h4
                  className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Concierge Service
                </h4>
                <p
                  className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Expert human appraisal with detailed report and
                  recommendations.
                </p>
                <div className='flex items-center gap-2 text-xs flex-wrap'>
                  <span className='inline-flex items-center gap-1 text-[#F1CB68] font-medium'>
                    <LuClock className='shrink-0' /> 3-5 business days
                  </span>
                  <span
                    className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                  >
                    •
                  </span>
                  <span
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Premium
                  </span>
                </div>
              </button>

              {/* API Option */}
              <button
                onClick={() => onSelectType('API')}
                className={`
                  text-left p-4 sm:p-5 rounded-xl border-2 transition-all
                  ${
                    selectedType === 'API'
                      ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                      : isDarkMode
                      ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                      : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                  }
                `}
              >
                <div className='flex items-start justify-between mb-2 sm:mb-3'>
                  <div className='w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#34D399] to-[#059669] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#10B981]/20 ring-1 ring-white/10'>
                    <FaRobot className='text-xl sm:text-2xl text-white' />
                  </div>
                  {selectedType === 'API' && (
                    <div className='w-5 h-5 sm:w-6 sm:h-6 bg-[#F1CB68] rounded-full flex items-center justify-center shrink-0'>
                      <LuCheck className='text-[#101014] text-xs sm:text-sm' strokeWidth={3} />
                    </div>
                  )}
                </div>
                <h4
                  className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Automated Appraisal
                </h4>
                <p
                  className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Instant AI-powered valuation using market data and comparable
                  sales.
                </p>
                <div className='flex items-center gap-2 text-xs flex-wrap'>
                  <span className='inline-flex items-center gap-1 text-[#10B981] font-medium'>
                    <LuZap className='shrink-0 fill-current' /> Instant
                  </span>
                  <span
                    className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                  >
                    •
                  </span>
                  <span
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Standard
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Concierge appraisal type — shown once the Concierge method is
              picked. The chosen value is sent as `appraisal_type` (same options
              as the asset detail page). */}
          {selectedType === 'Concierge' && !conciergeBlocked && (
            <div className='mb-4 sm:mb-6'>
              <h3
                className={`font-semibold mb-3 text-sm sm:text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Appraisal Type
              </h3>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {APPRAISAL_TYPE_OPTIONS.map(opt => {
                  const selected = conciergeType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => onSelectConciergeType(opt.value)}
                      className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                        selected
                          ? 'border-[#F1CB68] bg-[#F1CB68]/10 text-[#F1CB68]'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] bg-white/5 text-gray-300 hover:border-[#F1CB68]/50'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-[#F1CB68]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {conciergeType && (
                <p
                  className={`mt-3 text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {APPRAISAL_TYPE_OPTIONS.find(o => o.value === conciergeType)?.description}
                </p>
              )}
            </div>
          )}

          {/* Selected Type Info */}
          {selectedType && (
            <div className='bg-[#F1CB68]/10 border border-[#F1CB68]/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6'>
              <p className='text-[#F1CB68] text-xs sm:text-sm'>
                {selectedType === 'Concierge' ? (
                  <>
                    <strong>Concierge Service:</strong> A certified appraiser
                    will personally evaluate your asset and provide a
                    comprehensive report with market insights.
                  </>
                ) : (
                  <>
                    <strong>Automated Appraisal:</strong> Get an instant
                    valuation based on current market trends, recent sales data,
                    and asset condition.
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div
          className={`border-t p-4 sm:p-6 flex gap-3 shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors border text-sm sm:text-base ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`
              flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base
              ${
                submitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : canSubmit
                  ? 'bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014]'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {submitting ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
