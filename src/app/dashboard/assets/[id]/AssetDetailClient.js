'use client';
import AssetDetailSkeleton from '@/components/skeletons/AssetDetailSkeleton';
import { useTheme } from '@/context/ThemeContext';
import
  {
    deleteAsset,
    formatCurrency,
    formatDate,
    generateAssetReport,
    getAiReview,
    getAiUsage,
    getAsset,
    getAssetByCodeAdmin,
    getAssetAppraisals,
    getAssetDocuments,
    getAssetValueHistory,
    requestAssetAppraisal,
    runAiAppraisal,
    runAiReview,
    shareAssetDetails,
    transferAssetOwnership,
  } from '@/utils/assetsApi';
import { listListings } from '@/utils/marketplaceApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

// Pull the human-readable message the API sent (FastAPI `detail`), falling back
// to the thrown Error message and finally a provided default. Used so AI toasts
// show exactly what the server said (e.g. "AI dependency is not installed...").
const apiErrorMessage = (err, fallback) => {
  const detail = err?.data?.detail ?? err?.data?.message ?? err?.message;
  return typeof detail === 'string' && detail ? detail : fallback;
};

// Format the "Last Appraisal" value for display. The backend sends a raw ISO
// timestamp (e.g. "2026-06-25T22:49:00.137718+00:00"); after a fresh AI appraisal
// the code sets a friendly literal ("Just now"). Render real dates as a readable
// date only (no time) and pass friendly/unparseable strings through unchanged.
const formatAppraisalDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Appraisal types shown to investors on the detail page. The chosen value is
// sent as `appraisal_type` (existing field — no new backend field). These share
// one backend code path today; descriptions are copy-only.
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

// Display metadata for an AI review verdict (guide §4). Tailwind classes are
// split dark/light so they survive the JIT (no dynamic class names).
const AI_DECISION_META = {
  approved: {
    label: 'Approved',
    icon: '✓',
    darkClass: 'bg-green-500/10 text-green-400',
    lightClass: 'bg-green-50 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    icon: '✕',
    darkClass: 'bg-red-500/10 text-red-400',
    lightClass: 'bg-red-50 text-red-600',
  },
  needs_review: {
    label: 'Needs Review',
    icon: '⚠',
    darkClass: 'bg-[#F1CB68]/10 text-[#F1CB68]',
    lightClass: 'bg-yellow-50 text-yellow-700',
  },
  not_reviewed: {
    label: 'Not Reviewed',
    icon: '–',
    darkClass: 'bg-[#2A2A2D] text-gray-400',
    lightClass: 'bg-gray-100 text-gray-500',
  },
};

// Display metadata for an appraisal record's `status` (guide "Appraisal Status
// Values" table). Used by the Past Appraisals history list. Classes are split
// dark/light so Tailwind's JIT keeps them (no dynamic class names).
const APPRAISAL_STATUS_META = {
  ai_appraised: {
    label: 'AI appraised',
    darkClass: 'bg-green-500/10 text-green-400',
    lightClass: 'bg-green-50 text-green-700',
  },
  needs_more_information: {
    label: 'Needs more info',
    darkClass: 'bg-orange-500/10 text-orange-400',
    lightClass: 'bg-orange-50 text-orange-700',
  },
  professional_appraisal_recommended: {
    label: 'Pro appraisal advised',
    darkClass: 'bg-blue-500/10 text-blue-400',
    lightClass: 'bg-blue-50 text-blue-700',
  },
  appraisal_failed: {
    label: 'Failed',
    darkClass: 'bg-red-500/10 text-red-400',
    lightClass: 'bg-red-50 text-red-600',
  },
  pending: {
    label: 'Pending',
    darkClass: 'bg-[#F1CB68]/10 text-[#F1CB68]',
    lightClass: 'bg-yellow-50 text-yellow-700',
  },
  in_progress: {
    label: 'In progress',
    darkClass: 'bg-blue-500/10 text-blue-400',
    lightClass: 'bg-blue-50 text-blue-700',
  },
  completed: {
    label: 'Completed',
    darkClass: 'bg-green-500/10 text-green-400',
    lightClass: 'bg-green-50 text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    darkClass: 'bg-gray-500/10 text-gray-400',
    lightClass: 'bg-gray-100 text-gray-600',
  },
};

export default function AssetDetailClient({ assetId: propAssetId }) {
  const router = useRouter();
  const params = useParams(); // Returns {} if not in dynamic route
  const { isDarkMode } = useTheme();
  // Role gating: investors transact on assets (sell / request appraisal / run AI
  // tools); admins get a read-only view and only see AI results that already
  // exist (no run controls, no transactional actions). See gating below.
  const { isAdmin, isInvestor, mounted: authMounted } = useAuth();
  
  // Get asset ID from multiple sources (for static export compatibility)
  // Priority: prop > params > query parameter > window.location
  let assetId = propAssetId || params?.id;
  
  // Fallback to extracting from query parameters or URL pathname
  if (!assetId && typeof window !== 'undefined') {
    // Try query parameter first (for /dashboard/assets/detail?id=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    assetId = urlParams.get('id');
    
    // If not in query params, try pathname (for /dashboard/assets/xxx)
    if (!assetId) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const assetsIndex = pathSegments.indexOf('assets');
      if (assetsIndex !== -1 && pathSegments[assetsIndex + 1]) {
        assetId = pathSegments[assetsIndex + 1];
      }
    }
  }

  // Admins reach an asset by its code (?code=AK-01) and load it via the
  // admin-only /admin/assets/{code} endpoint (which can read any user's asset).
  // The asset's real id is resolved from that response and reused for the
  // standard sub-resource calls (documents, value history, appraisals, AI review).
  let adminCode = null;
  if (typeof window !== 'undefined') {
    adminCode = new URLSearchParams(window.location.search).get('code');
  }
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);

  // Marketplace listing is automatic (active assets are auto-listed; a
  // completed concierge valuation re-prices the same listing) — this check
  // only powers the "Listed on Marketplace" indicator.
  const [hasExistingListing, setHasExistingListing] = useState(false);

  const [appraisalType, setAppraisalType] = useState('');
  // Optional free-text note the investor adds with the appraisal request.
  const [appraisalNote, setAppraisalNote] = useState('');
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    if (!asset?.id) return;
    let cancelled = false;
    listListings({ limit: 100 })
      .then(res => {
        if (cancelled) return;
        const list = res?.data || res || [];
        const arr = Array.isArray(list) ? list : Array.isArray(list?.listings) ? list.listings : [];
        setHasExistingListing(arr.some(l => (l.assetId || l.asset_id) === asset.id));
      })
      .catch(() => {
        // Non-fatal — the indicator just won't show.
      });
    return () => {
      cancelled = true;
    };
  }, [asset?.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [valueHistory, setValueHistory] = useState([]);
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [transferData, setTransferData] = useState({
    newOwnerEmail: '',
    transferType: 'gift',
    notes: '',
  });
  const [shareData, setShareData] = useState({
    email: '',
    expiresIn: 7,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // The asset's real id, used to key all sub-resource fetches. For the standard
  // id-based flow it equals the URL id; for the admin by-code flow it's resolved
  // from the fetched asset (see main fetch effect).
  const [resolvedAssetId, setResolvedAssetId] = useState(null);

  // AI Appraisal (instant, synchronous AI valuation)
  const [aiUsage, setAiUsage] = useState(null);        // { plan, aiAppraisals: { limit, used, remaining }, ... }
  const [aiResult, setAiResult] = useState(null);
  const [appraisalStatus, setAppraisalStatus] = useState(null); // ai_appraised | needs_more_information | professional_appraisal_recommended | appraisal_failed
  const [runningAiAppraisal, setRunningAiAppraisal] = useState(false);
  // AI Appraisal card is collapsed by default; toggled open via the header arrow.
  const [showAiAppraisal, setShowAiAppraisal] = useState(false);

  // AI Asset Review (advisory accept/reject)
  const [aiReview, setAiReview] = useState(null);      // { decision, reason, flags, model, createdAt }
  const [runningAiReview, setRunningAiReview] = useState(false);

  // Past appraisals (AI + human) — guide §2/§3. Each record may carry stored
  // `aiData` (camelCase of `ai_data`) with the same fields as a live ai_result.
  const [appraisalHistory, setAppraisalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedAppraisalId, setExpandedAppraisalId] = useState(null);

  // Keep the standard (id-based) flow resolving sub-resources immediately; the
  // admin by-code flow resolves the id once the asset loads (main fetch below).
  useEffect(() => {
    if (assetId) setResolvedAssetId(assetId);
  }, [assetId]);

  // Fetch asset data
  useEffect(() => {
    // Wait until the role is known so we pick the right fetch path.
    if (!authMounted) return;

    const useAdminFetch = isAdmin && !!adminCode;
    if (!assetId && !useAdminFetch) {
      setError('Asset ID is required');
      setLoading(false);
      return;
    }

    const fetchAssetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch asset details — admins look up any user's asset by code.
        const assetResponse = useAdminFetch
          ? await getAssetByCodeAdmin(adminCode)
          : await getAsset(assetId);
        const assetData = assetResponse.data;
        // Real id for all sub-resource calls (the by-code response carries it).
        const effectiveId = assetData.id || assetId;
        setResolvedAssetId(effectiveId);

        // The admin by-code response embeds the latest AI artifacts so the
        // read-only AI cards render immediately (admins don't run them). Falls
        // back to the dedicated endpoints below if an embed is absent.
        if (assetData.aiResult) setAiResult(assetData.aiResult);
        if (assetData.aiReview) setAiReview(assetData.aiReview);
        
        // Helper to normalise value history into [{ date, value }]
        const normaliseHistory = rawHistoryData => {
          if (!rawHistoryData) return [];

          let items = [];
          if (Array.isArray(rawHistoryData)) {
            items = rawHistoryData;
          } else if (rawHistoryData && Array.isArray(rawHistoryData.history)) {
            items = rawHistoryData.history;
          } else if (rawHistoryData && Array.isArray(rawHistoryData.values)) {
            items = rawHistoryData.values;
          }

          return (items || [])
            .map(item => {
              const date =
                item.date ||
                item.timestamp ||
                item.valuationDate ||
                item.valuation_date ||
                item.createdAt ||
                item.created_at;

              const value =
                item.value ??
                item.currentValue ??
                item.current_value ??
                item.valuation ??
                item.amount;

              if (!date || value === undefined || value === null) {
                return null;
              }

              return { date, value };
            })
            .filter(Boolean);
        };
        
        // Documents:
        // Prefer documents embedded on the asset itself to avoid extra CORS calls.
        // Fall back to the dedicated documents endpoint only if needed.
        let documents = Array.isArray(assetData.documents) ? assetData.documents : [];
        if (!documents.length) {
          try {
            const docsResponse = await getAssetDocuments(effectiveId);
            documents = docsResponse.data || [];
          } catch (err) {
            console.error('Error fetching documents:', err);
          }
        }
        
        // Value history:
        // Prefer value_history/valueHistory returned with the asset.
        // Fall back to the dedicated value-history endpoint only if empty.
        let history = [];
        if (Array.isArray(assetData.valueHistory) && assetData.valueHistory.length) {
          history = normaliseHistory(assetData.valueHistory);
        } else {
          try {
            const historyResponse = await getAssetValueHistory(effectiveId);
            history = normaliseHistory(historyResponse?.data);
          } catch (err) {
            console.error('Error fetching value history:', err);
          }
        }
        
        // Format asset data
        const formattedAsset = {
          ...assetData,
          // Format values
          currentValue: assetData.currentValue
            ? formatCurrency(assetData.currentValue, assetData.currency)
            : assetData.currentValue,
          estimatedValue: assetData.estimatedValue
            ? formatCurrency(assetData.estimatedValue, assetData.currency)
            : assetData.estimatedValue,
          // Use images array or create from image
          images: assetData.images && assetData.images.length > 0
            ? assetData.images
            : assetData.image
            ? [assetData.image]
            : [],
          // Map lastAppraisalDate to lastAppraisal
          lastAppraisal: assetData.lastAppraisalDate || assetData.lastAppraisal,
          // Format lastUpdated
          lastUpdated: assetData.lastUpdated || formatDate(assetData.updatedAt || assetData.createdAt),
          // Get category-specific fields from specifications
          propertyType: assetData.specifications?.propertyType || assetData.specifications?.property_type,
          address: assetData.specifications?.address || assetData.location,
          size: assetData.specifications?.size,
          yearBuilt: assetData.specifications?.yearBuilt || assetData.specifications?.year_built,
          monthlyRentalIncome: assetData.specifications?.monthlyRentalIncome || assetData.specifications?.monthly_rental_income
            ? formatCurrency(assetData.specifications?.monthlyRentalIncome || assetData.specifications?.monthly_rental_income, assetData.currency)
            : undefined,
          annualPropertyTax: assetData.specifications?.annualPropertyTax || assetData.specifications?.annual_property_tax
            ? formatCurrency(assetData.specifications?.annualPropertyTax || assetData.specifications?.annual_property_tax, assetData.currency)
            : undefined,
          maintenanceCosts: assetData.specifications?.maintenanceCosts || assetData.specifications?.maintenance_costs
            ? formatCurrency(assetData.specifications?.maintenanceCosts || assetData.specifications?.maintenance_costs, assetData.currency)
            : undefined,
          // Format ownership
          ownership: assetData.ownershipType
            ? `${assetData.ownershipType} Ownership`
            : assetData.ownership || 'Unknown',
          // Format acquisition date
          acquisitionDate: assetData.acquisitionDate
            ? new Date(assetData.acquisitionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : undefined,
          // Documents (normalise keys so UI always has name + URL)
          documents: (documents || []).map(doc => {
            const rawDate =
              doc.date ||
              doc.uploadedAt ||
              doc.uploaded_at ||
              doc.createdAt ||
              doc.created_at;

            const formattedDate = rawDate
              ? new Date(rawDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '';

            return {
              id: doc.id,
              name: doc.name || doc.fileName || doc.filename || doc.originalName || 'Document',
              date: formattedDate,
              url:
                doc.url ||
                doc.fileUrl ||
                doc.downloadUrl ||
                doc.download_url ||
                doc.path ||
                '',
              type: doc.type || doc.documentType || doc.document_type || doc.mimeType,
            };
          }),
        };
        
        setAsset(formattedAsset);
        setValueHistory(history);
      } catch (err) {
        console.error('Error fetching asset:', err);
        setError(err.message || 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [assetId, adminCode, isAdmin, authMounted]);

  // Fetch the current-month AI quota so we can show "X left" and disable the
  // button once it's exhausted (guide §5). Best-effort: a failure here just
  // leaves the button enabled — the POST itself still enforces the limit (403).
  useEffect(() => {
    let cancelled = false;
    getAiUsage()
      .then(usage => {
        if (!cancelled) setAiUsage(usage);
      })
      .catch(err => {
        console.warn('Could not load AI usage quota:', err?.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the latest AI review for this asset so we can show the current verdict
  // on page load without making the user re-run it. `data: null` means none yet.
  useEffect(() => {
    if (!resolvedAssetId) return;
    let cancelled = false;
    getAiReview(resolvedAssetId)
      .then(res => {
        if (!cancelled && res?.data) setAiReview(res.data);
      })
      .catch(err => {
        console.warn('Could not load latest AI review:', err?.message);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedAssetId]);

  // Load the full appraisal history (AI + human) so past AI estimates and their
  // stored `aiData` are visible without re-running. Refetched after a new run.
  const refreshAppraisalHistory = async () => {
    if (!resolvedAssetId) return;
    try {
      setLoadingHistory(true);
      const res = await getAssetAppraisals(resolvedAssetId);
      const list = Array.isArray(res?.data) ? res.data : [];
      setAppraisalHistory(list);
    } catch (err) {
      console.warn('Could not load appraisal history:', err?.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!resolvedAssetId) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    getAssetAppraisals(resolvedAssetId)
      .then(res => {
        if (cancelled) return;
        setAppraisalHistory(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(err => {
        if (!cancelled) console.warn('Could not load appraisal history:', err?.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedAssetId]);

  // Remaining AI appraisals for this month. null => unlimited (annual/admin).
  const aiAppraisalsRemaining = aiUsage?.aiAppraisals?.remaining ?? null;
  const aiLimitReached =
    aiAppraisalsRemaining !== null && aiAppraisalsRemaining <= 0;

  // Remaining AI reviews for this month. null => unlimited.
  const aiReviewsRemaining = aiUsage?.aiReviews?.remaining ?? null;
  const aiReviewLimitReached =
    aiReviewsRemaining !== null && aiReviewsRemaining <= 0;

  // One open human appraisal at a time. AI/instant ("API") appraisals are
  // unrestricted, but a human appraisal (Concierge/Standard/Comprehensive/…)
  // can't be requested while another for this asset is still open (not yet
  // completed/cancelled/failed). Derived from the loaded Past Appraisals.
  const OPEN_APPRAISAL_STATUSES = [
    'pending',
    'in_progress',
    'needs_more_information',
    'professional_appraisal_recommended',
  ];
  const openHumanAppraisal = appraisalHistory.find(a => {
    const type = (a.appraisalType || '').toString().toUpperCase();
    const isAi = type === 'API' || type === 'AI';
    const status = (a.status || '').toString().toLowerCase();
    return !isAi && OPEN_APPRAISAL_STATUSES.includes(status);
  });
  const hasOpenHumanAppraisal = !!openHumanAppraisal;

  const handleRunAiAppraisal = async () => {
    if (runningAiAppraisal) return;
    try {
      setRunningAiAppraisal(true);
      const response = await runAiAppraisal(asset.id);
      const status = response.data?.status ?? null;
      const result = response.aiResult;

      setAppraisalStatus(status);

      if (status === 'appraisal_failed') {
        toast.error('AI appraisal could not be completed. Please try again.');
      } else if (result) {
        setAiResult(result);
        toast.success('AI estimate ready.');
      } else {
        toast.error('AI appraisal did not return a result. Please try again.');
      }

      // Reflect the updated quota without an extra round-trip.
      setAiUsage(prev => {
        if (!prev?.aiAppraisals || prev.aiAppraisals.remaining === null) return prev;
        const used = (prev.aiAppraisals.used ?? 0) + 1;
        const remaining = Math.max(0, (prev.aiAppraisals.remaining ?? 1) - 1);
        return { ...prev, aiAppraisals: { ...prev.aiAppraisals, used, remaining } };
      });

      // The backend also updated the asset's estimated value + valuation type,
      // so keep the displayed "Last Appraisal" in sync for this session.
      setAsset(prev => (prev ? { ...prev, lastAppraisal: 'Just now' } : prev));

      // Pull the freshly-created record into the Past Appraisals history.
      refreshAppraisalHistory();
    } catch (err) {
      if (err.status === 403) {
        // Monthly limit hit — surface the backend message and re-sync quota so
        // the button disables.
        toast.info(apiErrorMessage(err, 'You have reached your monthly AI appraisal limit. Upgrade for more.'));
        getAiUsage().then(setAiUsage).catch(() => {});
      } else if (err.status === 503) {
        // AI not configured / temporarily unavailable — show the server's reason.
        toast.error(apiErrorMessage(err, 'The AI service is temporarily unavailable. Please try again.'));
      } else {
        console.error('Error running AI appraisal:', err);
        toast.error(apiErrorMessage(err, 'Failed to run AI appraisal.'));
      }
    } finally {
      setRunningAiAppraisal(false);
    }
  };

  const handleRunAiReview = async () => {
    if (runningAiReview) return;
    try {
      setRunningAiReview(true); // inline state only
      const response = await runAiReview(asset.id);
      const review = response.data;
      if (!review) {
        toast.error('AI review did not return a result. Please try again.');
        return;
      }
      setAiReview(review);
      toast.success('AI review complete.');

      // Reflect updated quota + the new verdict chip on the asset.
      setAiUsage(prev => {
        if (!prev?.aiReviews || prev.aiReviews.remaining === null) return prev;
        const used = (prev.aiReviews.used ?? 0) + 1;
        const remaining = Math.max(0, (prev.aiReviews.remaining ?? 1) - 1);
        return { ...prev, aiReviews: { ...prev.aiReviews, used, remaining } };
      });
      setAsset(prev =>
        prev ? { ...prev, aiReviewStatus: review.decision } : prev
      );
    } catch (err) {
      if (err.status === 403) {
        toast.info(apiErrorMessage(err, 'You have reached your monthly AI review limit. Upgrade for more.'));
        getAiUsage().then(setAiUsage).catch(() => {});
      } else if (err.status === 503) {
        toast.error(apiErrorMessage(err, 'The AI service is temporarily unavailable. Please try again.'));
      } else {
        console.error('Error running AI review:', err);
        toast.error(apiErrorMessage(err, 'Failed to run AI review.'));
      }
    } finally {
      setRunningAiReview(false);
    }
  };

  const handlePrevImage = () => {
    if (!asset || !asset.images || asset.images.length === 0) return;
    setCurrentImageIndex(prev =>
      prev === 0 ? asset.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!asset || !asset.images || asset.images.length === 0) return;
    setCurrentImageIndex(prev =>
      prev === asset.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleAppraisalSubmit = async (e) => {
    e.preventDefault();
    // Backstop: block a second open human appraisal for this asset.
    if (hasOpenHumanAppraisal) {
      toast.error('You already have an appraisal in progress for this asset.');
      return;
    }
    try {
      setSubmittingAppraisal(true);
      await requestAssetAppraisal(asset.id, {
        appraisalType: appraisalType,
        ...(appraisalNote.trim() ? { note: appraisalNote.trim() } : {}),
      });
      toast.success(`${appraisalType} appraisal request submitted successfully!`);
      setShowAppraisalModal(false);
      setAppraisalType('');
      setAppraisalNote('');
    } catch (err) {
      console.error('Error submitting appraisal request:', err);
      // 409: the backend already has an open human appraisal for this asset
      // (our UI state was stale). Refresh so the banner + disabled state appear.
      if (err?.status === 409) {
        refreshAppraisalHistory();
      }
      toast.error(apiErrorMessage(err, 'Failed to submit appraisal request'));
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  const handleTransferOwnership = async () => {
    try {
      setTransferring(true);
      setTransferError(null);
      
      // Validate email format
      if (!transferData.newOwnerEmail || !transferData.newOwnerEmail.includes('@')) {
        setTransferError('Please enter a valid email address');
        return;
      }

      const response = await transferAssetOwnership(asset.id, {
        newOwnerEmail: transferData.newOwnerEmail,
        transferType: transferData.transferType,
        notes: transferData.notes || undefined,
      });
      
      console.log('✅ Transfer completed successfully:', response.data);
      
      // Success - show message and close modal
      toast.success(`Asset transferred successfully to ${transferData.newOwnerEmail}!`);
      setShowTransferModal(false);
      setTransferData({ newOwnerEmail: '', transferType: 'gift', notes: '' });
      setTransferError(null);
      
      // Optionally refresh asset data to show updated ownership
      // You can add a refresh function here if needed
    } catch (err) {
      console.error('❌ Error transferring ownership:', err);
      
      // Extract detailed error message from API response
      let errorMessage = 'Failed to transfer asset ownership';
      
      if (err.data) {
        if (typeof err.data.detail === 'string') {
          errorMessage = err.data.detail;
        } else if (err.data.message) {
          errorMessage = err.data.message;
        } else if (err.data.error) {
          errorMessage = err.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Handle specific error cases from API doc
      if (errorMessage.includes('not registered') || errorMessage.includes('not active')) {
        errorMessage = `The email "${transferData.newOwnerEmail}" is not registered or not active on this platform. The recipient must have an active account to receive asset transfers.`;
      } else if (errorMessage.includes('transfer to yourself')) {
        errorMessage = 'Cannot transfer asset to yourself';
      } else if (errorMessage.includes('listed in marketplace')) {
        errorMessage = 'Cannot transfer asset that is currently listed in marketplace. Please remove listing first.';
      } else if (errorMessage.includes('not found')) {
        errorMessage = 'Asset not found';
      }
      
      setTransferError(errorMessage);
    } finally {
      setTransferring(false);
    }
  };

  const handleShareAsset = async () => {
    try {
      setSharing(true);
      const response = await shareAssetDetails(asset.id, {
        email: shareData.email || undefined,
        expiresIn: shareData.expiresIn || undefined,
        permissions: ['view'],
      });
      // Backend now returns an absolute share URL (BUG-02). Accept the common
      // field names so we copy a usable link rather than a broken relative path.
      const data = response.data || {};
      const shareLink =
        data.shareLink || data.shareUrl || data.url || data.link || '';
      if (shareLink) {
        await navigator.clipboard.writeText(shareLink);
        toast.success('Share link copied to clipboard!');
      } else {
        toast.success('Asset shared successfully!');
      }
      setShowShareModal(false);
      setShareData({ email: '', expiresIn: 7 });
    } catch (err) {
      console.error('Error sharing asset:', err);
      toast.error(apiErrorMessage(err, 'Failed to share asset'));
    } finally {
      setSharing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await generateAssetReport(asset.id, {
        reportType: 'detailed',
        includeDocuments: true,
        includeValueHistory: true,
        includeAppraisals: true,
      });
      if (response.data?.reportUrl) {
        // Open report in new tab
        window.open(response.data.reportUrl, '_blank');
        toast.success('Report generated successfully!');
      } else {
        toast.info('Report generation initiated. You will be notified when it\'s ready.');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error(apiErrorMessage(err, 'Failed to generate report'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDocumentDownload = (docUrl, docName) => {
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      toast.error('Document URL not available');
    }
  };

  const handleDeleteAsset = async () => {
    try {
      setDeleting(true);
      await deleteAsset(asset.id);
      setShowDeleteModal(false);
      router.replace('/dashboard/assets');
    } catch (err) {
      console.error('Error deleting asset:', err);
      let msg = err.message || 'Failed to delete asset';
      if (err.code === 'ASSET_HAS_TRANSACTIONS') {
        // Offers/escrow exist — removing the listing won't help; deletion is
        // permanently blocked to preserve financial history.
        msg =
          "This asset has marketplace transaction history and can't be deleted.";
      } else if (
        err.status === 409 ||
        msg.toLowerCase().includes('listed') ||
        msg.toLowerCase().includes('marketplace')
      ) {
        msg = 'Cannot delete this asset while it has an active marketplace listing. Remove the listing first.';
      }
      toast.error(msg);
      setDeleting(false);
    }
  };

  // Static chrome (breadcrumb + back button) renders unconditionally. While
  // loading, only the data body swaps to a skeleton. On error/not-found the
  // message renders inside the content region. Never blank the whole page.
  if (loading) {
    return (
      <>
        <div className='pb-20'>
          {/* Breadcrumb (static chrome) */}
          <div className='mb-6 flex items-center gap-2 text-sm'>
            <button
              onClick={() => router.push('/dashboard/assets')}
              className={`transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assets
            </button>
            <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>›</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Asset Details</span>
          </div>

          {/* Data body skeleton */}
          <AssetDetailSkeleton isDarkMode={isDarkMode} />
        </div>
      </>
    );
  }

  if (error || !asset) {
    return (
      <>
        <div className='pb-20'>
          {/* Breadcrumb (static chrome) */}
          <div className='mb-6 flex items-center gap-2 text-sm'>
            <button
              onClick={() => router.push('/dashboard/assets')}
              className={`transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assets
            </button>
            <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>›</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Asset Details</span>
          </div>

          {/* Error / not-found message inside the content region */}
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-300 text-red-700'
          }`}>
            <p className='font-semibold mb-2'>Error loading asset</p>
            <p className='text-sm mb-4'>{error || 'Asset not found'}</p>
            <button
              onClick={() => router.push('/dashboard/assets')}
              className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
            >
              Back to Assets
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='pb-20'>
        {/* Breadcrumb */}
        <div className='mb-6 flex items-center gap-2 text-sm'>
          <button
            onClick={() => router.push('/dashboard/assets')}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assets
          </button>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>›</span>
          <button
            onClick={() => router.push('/dashboard/assets')}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {asset.category || 'Asset'}
          </button>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>›</span>
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{asset.name}</span>
        </div>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{asset.name}</h1>
            <div className='flex items-center gap-3 flex-wrap'>
              <span className='px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full'>
                {asset.status}
              </span>
              {/* AI review verdict chip (latest review or the asset's own field) */}
              {(() => {
                const decision = aiReview?.decision || asset.aiReviewStatus;
                if (!decision || decision === 'not_reviewed') return null;
                const meta = AI_DECISION_META[decision];
                if (!meta) return null;
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                    isDarkMode ? meta.darkClass : meta.lightClass
                  }`}>
                    <span aria-hidden='true'>{meta.icon}</span>
                    AI: {meta.label}
                  </span>
                );
              })()}
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{asset.lastUpdated}</span>
            </div>
            {/* Owner block — present only on the admin by-code response, so this
                row appears for admins viewing another user's asset. Backend
                guarantees a name, so we never render an "unknown owner" label. */}
            {asset.owner && (asset.owner.name || asset.owner.email) && (
              <div className='mt-2 flex items-center gap-2 flex-wrap'>
                {/* Owner username + asset code together in a single badge. */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                  {asset.owner.name || asset.owner.email}
                  {asset.assetCode && (
                    <span className='font-mono opacity-70'>· {asset.assetCode}</span>
                  )}
                </span>
                {asset.owner.email && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {asset.owner.email}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setShowDeleteModal(true)}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors border ${
                isDarkMode
                  ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                  : 'border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Delete
            </button>
            {isInvestor && (
              <>
            {/* Listing is automatic — active assets are published to the
                marketplace on creation and re-priced when a concierge
                valuation completes. No manual "Initiate Sale" step. */}
            {hasExistingListing && (
              <span className='inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-green-500/10 text-green-400 border border-green-500/30'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                  <polyline points='20 6 9 17 4 12' />
                </svg>
                Listed on Marketplace
              </span>
            )}
            <button
              onClick={() => {
                // No preselection — the investor picks one of the four types.
                setAppraisalType('');
                setAppraisalNote('');
                setShowAppraisalModal(true);
              }}
              disabled={submittingAppraisal}
              className={`px-6 py-3 bg-transparent border rounded-lg font-semibold transition-colors ${
                submittingAppraisal
                  ? 'border-gray-600 text-gray-400 cursor-not-allowed'
                  : isDarkMode
                  ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
            >
              {submittingAppraisal ? (
                <span className='flex items-center gap-2'>
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
                  Processing...
                </span>
              ) : (
                'Request Appraisal'
              )}
            </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Images and Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Image Gallery */}
            <div className={`border rounded-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              {/* Main Image */}
              <div className='relative aspect-video bg-black'>
                {asset.images && asset.images.length > 0 ? (
                  <img
                    src={asset.images[currentImageIndex]}
                    alt={asset.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900'>
                    <span className='text-4xl text-gray-600'>📦</span>
                  </div>
                )}
                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevImage}
                  className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M15 18l-6-6 6-6' />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M9 18l6-6-6-6' />
                  </svg>
                </button>
                {/* Image Counter */}
                {asset.images && asset.images.length > 1 && (
                  <div className={`absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-sm text-white`}>
                    {currentImageIndex + 1}/{asset.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {asset.images && asset.images.length > 0 && (
                <div className='p-4 flex gap-3 overflow-x-auto'>
                  {asset.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-[#F1CB68]'
                        : 'border-transparent hover:border-[#FFFFFF14]'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Property Details
              </h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Property Type</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {asset.propertyType}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Address</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{asset.address}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Acquisition Date</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {asset.acquisitionDate}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Size</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{asset.size}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Year Built</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{asset.yearBuilt}</p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Ownership</p>
                  <p className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{asset.ownership}</p>
                </div>
              </div>
            </div>

            {/* Value History Chart */}
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Value History
              </h3>
              <div className='relative h-64'>
                {valueHistory && valueHistory.length > 0 ? (
                  <ValueHistoryChart data={valueHistory} isDarkMode={isDarkMode} />
                ) : (
                  <div className={`flex items-center justify-center h-full ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <p>No value history available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Documents */}
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Associated Documents
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {asset.documents.map((doc, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#2A2A2D] hover:bg-[#3A3A3D]'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className='w-10 h-10 bg-[#F1CB68]/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <img
                        src='/doc.svg'
                        alt='PDF'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className={`font-medium truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {doc.name}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{doc.date}</p>
                    </div>
                    <button
                      onClick={() => handleDocumentDownload(doc.url, doc.name)}
                      className={`transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-500 hover:text-gray-900'
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
                        <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Valuation and Actions */}
          <div className='space-y-6'>
            {/* Current Valuation */}
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Current Valuation
              </h3>
              <div className='mb-4'>
                <p className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {asset.currentValue}
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-green-500 font-semibold'>
                    {asset.valueChange}
                  </span>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {asset.valueChangeLabel}
                  </span>
                </div>
              </div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Last Appraisal: {formatAppraisalDate(asset.lastAppraisal)}
              </p>
            </div>

            {/* AI Appraisal — instant, synchronous AI valuation. Admins see this
                read-only and only when a result already exists (no run controls). */}
            {(!isAdmin || aiResult) && (
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              {/* Header doubles as the collapse toggle (collapsed by default). */}
              <button
                type='button'
                onClick={() => setShowAiAppraisal(v => !v)}
                aria-expanded={showAiAppraisal}
                className='w-full flex items-start justify-between gap-3 text-left'
              >
                <div className='mb-1'>
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#F1CB68' strokeWidth='2'>
                      <path d='M12 3l1.9 5.8L20 10l-5.8 1.9L12 18l-1.9-6.1L4 10l6.1-1.2L12 3z' />
                    </svg>
                    AI Appraisal
                  </h3>
                  {/* Remaining-quota badge (null limit => unlimited) */}
                  {!isAdmin && aiUsage?.aiAppraisals && (
                    <span className={`inline-block mt-1.5 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      aiLimitReached
                        ? isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                        : isDarkMode ? 'bg-[#2A2A2D] text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {aiAppraisalsRemaining === null
                        ? 'Unlimited'
                        : `${aiAppraisalsRemaining} left this month`}
                    </span>
                  )}
                </div>
                <svg
                  width='20' height='20' viewBox='0 0 24 24' fill='none'
                  stroke='currentColor' strokeWidth='2'
                  className={`shrink-0 mt-1 transition-transform ${showAiAppraisal ? 'rotate-180' : ''} ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <path d='M6 9l6 6 6-6' />
                </svg>
              </button>

              {showAiAppraisal && (<>
              {!isAdmin && (
                <p className={`text-sm mb-4 mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get an instant AI-generated value estimate for this asset.
                </p>
              )}

              {/* Result — appraisal_failed state */}
              {appraisalStatus === 'appraisal_failed' && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <p className='text-sm font-semibold mb-0.5'>Appraisal failed</p>
                  <p className='text-xs'>The AI could not complete the appraisal. Please try again later.</p>
                </div>
              )}

              {/* Result — all successful statuses */}
              {aiResult && appraisalStatus !== 'appraisal_failed' && (
                <div className='mb-4'>

                  {/* Estimated value */}
                  <p className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(aiResult.estimatedValue, aiResult.currency)}
                  </p>

                  {/* Value range */}
                  {(aiResult.valueRangeLow != null && aiResult.valueRangeHigh != null) && (
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Range: {formatCurrency(aiResult.valueRangeLow, aiResult.currency)} – {formatCurrency(aiResult.valueRangeHigh, aiResult.currency)}
                    </p>
                  )}

                  {/* Confidence badge */}
                  {aiResult.confidence && (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 capitalize ${
                      aiResult.confidence === 'high'
                        ? isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                        : aiResult.confidence === 'medium'
                        ? isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
                        : isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {aiResult.confidence} confidence
                    </span>
                  )}

                  {/* Missing information banner (needs_more_information status) */}
                  {aiResult.missingInformation?.length > 0 && (
                    <div className={`mb-3 p-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        To improve accuracy, add:
                      </p>
                      <ul className={`text-xs space-y-0.5 list-disc list-inside ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        {aiResult.missingInformation.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Professional appraisal callout */}
                  {aiResult.professionalAppraisalNeeded && (
                    <div className={`mb-3 p-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        A certified appraisal is recommended for this asset.
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        The AI estimate is for reference. A professional appraisal is advised before insuring or selling.
                      </p>
                    </div>
                  )}

                  {/* Appraisal summary */}
                  {aiResult.appraisalSummary && (
                    <p className={`text-sm mb-3 leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {aiResult.appraisalSummary}
                    </p>
                  )}

                  {/* Key value drivers */}
                  {aiResult.keyValueDrivers?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Value drivers
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.keyValueDrivers.map((driver, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='text-green-500 mt-0.5 shrink-0'>↑</span>
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk factors */}
                  {aiResult.riskFactors?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Risk factors
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.riskFactors.map((risk, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='text-orange-400 mt-0.5 shrink-0'>!</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested next step */}
                  {aiResult.suggestedNextStep && (
                    <div className={`mb-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Next step
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {aiResult.suggestedNextStep}
                      </p>
                    </div>
                  )}

                  {/* Recommended documents */}
                  {aiResult.recommendedDocuments?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Recommended documents
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.recommendedDocuments.map((doc, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='shrink-0'>•</span>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer — required directly below the value */}
                  {aiResult.disclaimer && (
                    <p className={`text-xs italic leading-relaxed ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {aiResult.disclaimer}
                    </p>
                  )}

                </div>
              )}

              {/* Action — investors only; admins view results without running. */}
              {!isAdmin && (<>
              <button
                onClick={handleRunAiAppraisal}
                disabled={runningAiAppraisal || aiLimitReached}
                className={`w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  runningAiAppraisal || aiLimitReached
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                }`}
              >
                {runningAiAppraisal ? (
                  <>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Estimating…
                  </>
                ) : aiLimitReached ? (
                  'Upgrade to run more'
                ) : aiResult ? (
                  'Re-run AI Estimate'
                ) : (
                  'Run AI Estimate'
                )}
              </button>
              {aiLimitReached && (
                <p className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  You've used all AI appraisals on your plan this month.
                </p>
              )}
              </>)}
              </>)}
            </div>
            )}

            {/* AI Asset Review — advisory accept/reject decision. Admins see this
                read-only and only when a review already exists (no run controls). */}
            {(!isAdmin || (aiReview && aiReview.decision && aiReview.decision !== 'not_reviewed')) && (
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <div className='mb-1'>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#F1CB68' strokeWidth='2'>
                    <path d='M9 12l2 2 4-4' />
                    <circle cx='12' cy='12' r='9' />
                  </svg>
                  AI Asset Review
                </h3>
                {!isAdmin && aiUsage?.aiReviews && (
                  <span className={`inline-block mt-1.5 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    aiReviewLimitReached
                      ? isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                      : isDarkMode ? 'bg-[#2A2A2D] text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {aiReviewsRemaining === null
                      ? 'Unlimited'
                      : `${aiReviewsRemaining} left this month`}
                  </span>
                )}
              </div>
              {!isAdmin && (
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  An advisory AI check of this asset's details and documents. Guidance only — it doesn't block the asset.
                </p>
              )}

              {/* Verdict */}
              {aiReview && aiReview.decision && aiReview.decision !== 'not_reviewed' && (() => {
                const meta = AI_DECISION_META[aiReview.decision] || AI_DECISION_META.not_reviewed;
                return (
                  <div className='mb-4'>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full mb-3 ${
                      isDarkMode ? meta.darkClass : meta.lightClass
                    }`}>
                      <span aria-hidden='true'>{meta.icon}</span>
                      {meta.label}
                    </span>
                    {aiReview.reason && (
                      <p className={`text-sm leading-relaxed mb-3 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {aiReview.reason}
                      </p>
                    )}
                    {Array.isArray(aiReview.flags) && aiReview.flags.length > 0 && (
                      <ul className='space-y-1.5'>
                        {aiReview.flags.map((flag, i) => (
                          <li
                            key={i}
                            className={`flex items-start gap-2 text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='flex-shrink-0 mt-1'>
                              <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' />
                              <line x1='4' y1='22' x2='4' y2='15' />
                            </svg>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}

              {/* Action — investors only; admins view the verdict without running. */}
              {!isAdmin && (<>
              <button
                onClick={handleRunAiReview}
                disabled={runningAiReview || aiReviewLimitReached}
                className={`w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  runningAiReview || aiReviewLimitReached
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-[#2A2A2D] text-white hover:bg-[#3A3A3D]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {runningAiReview ? (
                  <>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Reviewing…
                  </>
                ) : aiReviewLimitReached ? (
                  'Upgrade to run more'
                ) : aiReview && aiReview.decision !== 'not_reviewed' ? (
                  'Re-run AI Review'
                ) : (
                  'Run AI Review'
                )}
              </button>
              {aiReviewLimitReached && (
                <p className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  You've used all AI reviews on your plan this month.
                </p>
              )}
              </>)}
            </div>
            )}

            {/* Past Appraisals — history of AI + human appraisals (guide §2/§3).
                Stored `aiData` is surfaced here without re-running. */}
            {(loadingHistory || appraisalHistory.length > 0) && (
              <div className={`border rounded-2xl p-6 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                  : 'bg-white border-gray-300'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Past Appraisals
                </h3>

                {loadingHistory ? (
                  <div className='space-y-3'>
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-3 ${
                          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1F]' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2'>
                              <div className={`h-5 w-10 rounded-full animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                              <div className={`h-5 w-28 rounded-full animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                            </div>
                            <div className={`h-3 w-32 rounded mt-2 animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                          </div>
                          <div className={`h-5 w-20 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {appraisalHistory.map((appr) => {
                      const statusMeta =
                        APPRAISAL_STATUS_META[appr.status] || {
                          label: appr.status || 'Unknown',
                          darkClass: 'bg-[#2A2A2D] text-gray-400',
                          lightClass: 'bg-gray-100 text-gray-500',
                        };
                      const aiData = appr.aiData || null;
                      const isAi = appr.appraisalType === 'API';
                      const isExpanded = expandedAppraisalId === appr.id;
                      const hasDetails = !!aiData || !!appr.notes;

                      return (
                        <div
                          key={appr.id}
                          className={`rounded-lg border ${
                            isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1F]' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          {/* Summary row */}
                          <button
                            type='button'
                            onClick={() =>
                              hasDetails &&
                              setExpandedAppraisalId(isExpanded ? null : appr.id)
                            }
                            className={`w-full text-left p-3 flex items-start justify-between gap-3 ${
                              hasDetails ? 'cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <div className='min-w-0'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                  {isAi ? 'AI' : (appr.appraisalType || 'Appraisal')}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                  isDarkMode ? statusMeta.darkClass : statusMeta.lightClass
                                }`}>
                                  {statusMeta.label}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {formatDate(appr.requestedAt || appr.completedAt)}
                              </p>
                            </div>
                            <div className='flex items-center gap-2 shrink-0'>
                              {appr.estimatedValue != null && (
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(appr.estimatedValue, aiData?.currency)}
                                </span>
                              )}
                              {hasDetails && (
                                <svg
                                  width='14' height='14' viewBox='0 0 24 24' fill='none'
                                  stroke='currentColor' strokeWidth='2'
                                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}
                                >
                                  <path d='M6 9l6 6 6-6' />
                                </svg>
                              )}
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className={`px-3 pb-3 border-t ${
                              isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                            }`}>
                              {/* Failed appraisals: show the notes/error */}
                              {appr.status === 'appraisal_failed' && appr.notes && (
                                <p className={`text-xs mt-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  {appr.notes}
                                </p>
                              )}

                              {aiData && (
                                <div className='mt-3 space-y-2'>
                                  {/* Range + confidence */}
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    {(aiData.valueRangeLow != null && aiData.valueRangeHigh != null) && (
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Range: {formatCurrency(aiData.valueRangeLow, aiData.currency)} – {formatCurrency(aiData.valueRangeHigh, aiData.currency)}
                                      </span>
                                    )}
                                    {aiData.confidence && (
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                        aiData.confidence === 'high'
                                          ? isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                                          : aiData.confidence === 'medium'
                                          ? isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
                                          : isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700'
                                      }`}>
                                        {aiData.confidence} confidence
                                      </span>
                                    )}
                                  </div>

                                  {/* Summary */}
                                  {aiData.appraisalSummary && (
                                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {aiData.appraisalSummary}
                                    </p>
                                  )}

                                  {/* Missing information */}
                                  {aiData.missingInformation?.length > 0 && (
                                    <div>
                                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                        To improve accuracy, add:
                                      </p>
                                      <ul className={`text-xs list-disc list-inside ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                        {aiData.missingInformation.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Professional appraisal callout */}
                                  {aiData.professionalAppraisalNeeded && (
                                    <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                      A certified appraisal is recommended for this asset.
                                    </p>
                                  )}

                                  {/* Value drivers */}
                                  {aiData.keyValueDrivers?.length > 0 && (
                                    <ul className='text-xs space-y-0.5'>
                                      {aiData.keyValueDrivers.map((driver, i) => (
                                        <li key={i} className={`flex items-start gap-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          <span className='text-green-500 mt-0.5 shrink-0'>↑</span>
                                          {driver}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Risk factors */}
                                  {aiData.riskFactors?.length > 0 && (
                                    <ul className='text-xs space-y-0.5'>
                                      {aiData.riskFactors.map((risk, i) => (
                                        <li key={i} className={`flex items-start gap-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          <span className='text-orange-400 mt-0.5 shrink-0'>!</span>
                                          {risk}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Suggested next step */}
                                  {aiData.suggestedNextStep && (
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <span className='font-semibold'>Next step: </span>
                                      {aiData.suggestedNextStep}
                                    </p>
                                  )}

                                  {/* Recommended documents */}
                                  {aiData.recommendedDocuments?.length > 0 && (
                                    <ul className='text-xs space-y-0.5'>
                                      {aiData.recommendedDocuments.map((doc, i) => (
                                        <li key={i} className={`flex items-start gap-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          <span className='shrink-0'>•</span>
                                          {doc}
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Disclaimer */}
                                  {aiData.disclaimer && (
                                    <p className={`text-xs italic leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      {aiData.disclaimer}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Concierge / human notes (non-failed) */}
                              {!aiData && appr.status !== 'appraisal_failed' && appr.notes && (
                                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {appr.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions — hidden for admins (read-only asset view). */}
            {!isAdmin && (
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <button
                  onClick={() => setShowTransferModal(true)}
                  disabled={transferring}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-between ${
                    transferring
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-[#2A2A2D] text-white hover:bg-[#3A3A3D]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>Transfer Ownership</span>
                  {transferring ? (
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
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M5 12h14M12 5l7 7-7 7' />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={sharing}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-between ${
                    sharing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-[#2A2A2D] text-white hover:bg-[#3A3A3D]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>Share Asset Details</span>
                  {sharing ? (
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
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' />
                      <path d='M16 6l-4-4-4 4M12 2v13' />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-between ${
                    generatingReport
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-[#2A2A2D] text-white hover:bg-[#3A3A3D]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>Generate Report</span>
                  {generatingReport ? (
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
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                      <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            )}

            {/* Financial Summary */}
            <div className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Financial Summary
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Monthly Rental Income
                  </p>
                  <p className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {asset.monthlyRentalIncome}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Annual Property Tax
                  </p>
                  <p className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {asset.annualPropertyTax}
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Maintenance Costs (YTD)
                  </p>
                  <p className={`font-semibold text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {asset.maintenanceCosts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'>
            <div className={`border rounded-2xl max-w-md w-full p-6 ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-300'
            }`}>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#EF4444' strokeWidth='2'>
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14H6L5 6' />
                    <path d='M10 11v6M14 11v6' />
                    <path d='M9 6V4h6v2' />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Asset
                </h2>
              </div>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete <strong>{asset.name}</strong>?
              </p>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This will permanently remove the asset along with all its photos, documents, and valuations. This action cannot be undone.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors border ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-white/10 text-white border-[#FFFFFF14]'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAsset}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-lg font-semibold transition-colors bg-red-500 hover:bg-red-600 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {deleting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Asset'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Request Appraisal Modal */}
        {showAppraisalModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
            onClick={() => setShowAppraisalModal(false)}
          >
            <div
              className={`border rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                  : 'bg-white border-gray-300'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`border-b p-4 sm:p-6 flex items-center justify-between flex-shrink-0 ${
                isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Request Appraisal
                </h2>
                <button
                  onClick={() => setShowAppraisalModal(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-2xl ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>×</span>
                </button>
              </div>

              {/* Content */}
              <form
                onSubmit={handleAppraisalSubmit}
                className='p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1'
              >
                {/* Asset Preview */}
                <div className='mb-4 sm:mb-6 flex items-center gap-3'>
                  <img
                    src={asset.images[0]}
                    alt={asset.name}
                    className='w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className={`font-semibold text-base sm:text-lg mb-1 truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {asset.name}
                    </h3>
                    <p className={`text-xs sm:text-sm truncate ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {asset.propertyType} • {asset.address}
                    </p>
                  </div>
                </div>

                {/* Block a second open human appraisal for this asset. */}
                {hasOpenHumanAppraisal && (
                  <div className={`mb-4 sm:mb-6 p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                      : 'bg-orange-50 border-orange-200 text-orange-700'
                  }`}>
                    <p className='text-sm font-semibold mb-0.5'>An appraisal is already in progress</p>
                    <p className='text-xs'>
                      You already have a{openHumanAppraisal?.appraisalType ? ` ${openHumanAppraisal.appraisalType}` : ''} appraisal
                      pending for this asset. You can request another once it's completed.
                      AI appraisals are unaffected.
                    </p>
                  </div>
                )}

                {/* Appraisal type — a grid of tabs; clicking one reveals its
                    detail below. Chosen value is sent as `appraisal_type`. */}
                <div className='mb-4 sm:mb-6'>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Appraisal Type
                  </label>

                  {/* Tabs grid */}
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3'>
                    {APPRAISAL_TYPE_OPTIONS.map(opt => {
                      const selected = appraisalType === opt.value;
                      return (
                        <button
                          type='button'
                          key={opt.value}
                          onClick={() => setAppraisalType(opt.value)}
                          className={`px-2 py-2.5 sm:py-3 rounded-xl border-2 text-sm font-semibold text-center transition-colors ${
                            selected
                              ? 'border-[#F1CB68] bg-[#F1CB68]/10 text-[#F1CB68]'
                              : isDarkMode
                              ? 'border-[#FFFFFF14] text-white hover:border-[#F1CB68]/40'
                              : 'border-gray-200 text-gray-900 hover:border-[#F1CB68]/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail of the selected tab */}
                  {(() => {
                    const opt = APPRAISAL_TYPE_OPTIONS.find(o => o.value === appraisalType);
                    if (!opt) return null;
                    return (
                      <div className={`mt-3 p-3 sm:p-4 rounded-xl border ${
                        isDarkMode
                          ? 'border-[#F1CB68]/30 bg-[#F1CB68]/5'
                          : 'border-[#F1CB68]/40 bg-[#F1CB68]/10'
                      }`}>
                        <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {opt.label}
                        </h4>
                        <p className={`text-xs sm:text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {opt.description}
                        </p>

                        {/* Optional note for this request */}
                        <label className={`block text-xs font-medium mt-3 mb-1.5 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Note <span className='font-normal opacity-70'>(optional)</span>
                        </label>
                        <textarea
                          value={appraisalNote}
                          onChange={e => setAppraisalNote(e.target.value)}
                          rows={3}
                          placeholder='Add any details for the appraiser…'
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none ${
                            isDarkMode
                              ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500 focus:border-[#F1CB68]'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                          } focus:outline-none`}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Info Notice */}
                {appraisalType && (
                  <div className='mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-[#F1CB68]/10 border border-[#F1CB68]/30'>
                    <p className={`text-xs sm:text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className='text-[#F1CB68] font-semibold'>
                        Note:
                      </span>{' '}
                      A certified appraiser will be assigned to your request.
                      You will receive a confirmation email with next steps
                      within 24 hours.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowAppraisalModal(false)}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-transparent border rounded-lg font-semibold transition-colors text-sm ${
                      isDarkMode
                        ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={!appraisalType || submittingAppraisal || hasOpenHumanAppraisal}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm ${
                      submittingAppraisal
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : !appraisalType || hasOpenHumanAppraisal
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                    }`}
                  >
                    {submittingAppraisal ? (
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
              </form>
            </div>
          </div>
        )}

        {/* Transfer Ownership Modal */}
        {showTransferModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
            onClick={() => setShowTransferModal(false)}
          >
            <div
              className={`border rounded-2xl max-w-md w-full my-8 flex flex-col ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                  : 'bg-white border-gray-300'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`border-b p-4 sm:p-6 flex items-center justify-between ${
                isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Transfer Ownership
                </h2>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-2xl ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>×</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransferOwnership();
                }}
                className='p-4 sm:p-6 space-y-4'
              >
                {/* Error Message */}
                {transferError && (
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-red-900/20 border-red-500/50 text-red-400'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}>
                    <div className='flex items-start gap-2'>
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        className='flex-shrink-0 mt-0.5'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <path d='M12 8v4M12 16h.01' />
                      </svg>
                      <p className='text-sm flex-1'>{transferError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    New Owner Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    required
                    value={transferData.newOwnerEmail}
                    onChange={e => {
                      setTransferData({ ...transferData, newOwnerEmail: e.target.value });
                      setTransferError(null); // Clear error when user types
                    }}
                    className={`w-full px-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors ${
                      transferError
                        ? isDarkMode
                          ? 'border-red-500/50 bg-red-900/10'
                          : 'border-red-300 bg-red-50'
                        : isDarkMode
                        ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder='newowner@example.com'
                    disabled={transferring}
                  />
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    The recipient must have an active account on this platform
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transfer Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={transferData.transferType}
                    onChange={e => {
                      setTransferData({ ...transferData, transferType: e.target.value });
                      setTransferError(null);
                    }}
                    disabled={transferring}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[#F1CB68] transition-colors ${
                      isDarkMode
                        ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value='gift'>Gift</option>
                    <option value='sale'>Sale</option>
                    <option value='inheritance'>Inheritance</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={transferData.notes}
                    onChange={e => {
                      setTransferData({ ...transferData, notes: e.target.value });
                      setTransferError(null);
                    }}
                    rows={3}
                    disabled={transferring}
                    className={`w-full px-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none ${
                      isDarkMode
                        ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder='Add any notes about the transfer...'
                  />
                </div>

                {/* Info Notice */}
                <div className={`p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#F1CB68]/10 border-[#F1CB68]/30'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-[#F1CB68]' : 'text-yellow-700'
                    }`}>
                      Note:
                    </span>{' '}
                    The transfer will complete immediately. The asset will be removed from your account and added to the new owner's account. This action cannot be undone.
                  </p>
                </div>
                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferError(null);
                      setTransferData({ newOwnerEmail: '', transferType: 'gift', notes: '' });
                    }}
                    disabled={transferring}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors border ${
                      transferring
                        ? 'border-gray-600 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={transferring || !transferData.newOwnerEmail}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      transferring || !transferData.newOwnerEmail
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                    }`}
                  >
                    {transferring ? (
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
                        Transferring...
                      </span>
                    ) : (
                      'Transfer Asset'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Asset Modal */}
        {showShareModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
            onClick={() => setShowShareModal(false)}
          >
            <div
              className={`border rounded-2xl max-w-md w-full my-8 flex flex-col ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                  : 'bg-white border-gray-300'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`border-b p-4 sm:p-6 flex items-center justify-between ${
                isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Share Asset Details
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-2xl ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>×</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleShareAsset();
                }}
                className='p-4 sm:p-6 space-y-4'
              >
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Email (Optional)
                  </label>
                  <input
                    type='email'
                    value={shareData.email}
                    onChange={e => setShareData({ ...shareData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors ${
                      isDarkMode
                        ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder='recipient@example.com'
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Link Expires In (Days)
                  </label>
                  <input
                    type='number'
                    min='1'
                    value={shareData.expiresIn}
                    onChange={e => setShareData({ ...shareData, expiresIn: parseInt(e.target.value) || 7 })}
                    className={`w-full px-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors ${
                      isDarkMode
                        ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setShowShareModal(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors border ${
                      isDarkMode
                        ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={sharing}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      sharing
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                    }`}
                  >
                    {sharing ? 'Sharing...' : 'Generate Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Value History Chart Component
function ValueHistoryChart({ data, isDarkMode }) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${
        isDarkMode ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <p>No value history available</p>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate chart dimensions
  const width = 400;
  const height = 200;
  const padding = 20;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Get min and max values
  const values = sortedData.map(d => parseFloat(d.value) || 0);
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  // Add a bit of padding to top/bottom so the line isn't glued to the edges
  const rawRange = maxValue - minValue || 1;
  const paddingAmount = rawRange * 0.1;
  minValue = Math.max(0, minValue - paddingAmount);
  maxValue = maxValue + paddingAmount;
  const valueRange = maxValue - minValue || 1;

  // Calculate points for line and fill
  let linePoints = '';
  let fillPoints = '';

  if (sortedData.length === 1) {
    // Special case: only one data point.
    // Draw a horizontal line across the chart at that value so it looks like a real graph.
    const value = parseFloat(sortedData[0].value) || 0;
    const normalizedValue = (value - minValue) / valueRange;
    const y = padding + chartHeight - (normalizedValue * chartHeight);

    const xStart = padding;
    const xEnd = padding + chartWidth;

    linePoints = `${xStart},${y} ${xEnd},${y}`;
    fillPoints = `${xStart},${y} ${xEnd},${y} ${xEnd},${padding + chartHeight} ${xStart},${padding + chartHeight}`;
  } else {
    // Normal case: 2+ points
    linePoints = sortedData
      .map((d, index) => {
        const x = padding + (index / (sortedData.length - 1 || 1)) * chartWidth;
        const value = parseFloat(d.value) || 0;
        const normalizedValue = (value - minValue) / valueRange;
        const y = padding + chartHeight - (normalizedValue * chartHeight);
        return `${x},${y}`;
      })
      .join(' ');

    fillPoints =
      linePoints +
      ` ${padding + chartWidth},${padding + chartHeight} ${padding},${padding + chartHeight}`;
  }

  // Format dates for axis
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className='relative w-full h-full'>
      <svg
        className='w-full h-full'
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio='none'
      >
        <defs>
          <linearGradient id='valueGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop
              offset='0%'
              style={{ stopColor: '#F1CB68', stopOpacity: 0.3 }}
            />
            <stop
              offset='100%'
              style={{ stopColor: '#F1CB68', stopOpacity: 0 }}
            />
          </linearGradient>
        </defs>

        {/* Grid lines - horizontal */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + chartHeight * (1 - ratio);
          return (
            <line
              // eslint-disable-next-line react/no-array-index-key
              key={`h-${idx}`}
              x1={padding}
              x2={padding + chartWidth}
              y1={y}
              y2={y}
              stroke={isDarkMode ? '#27272f' : '#E5E7EB'}
              strokeWidth='1'
              strokeDasharray='4 4'
            />
          );
        })}

        {/* Grid lines - vertical */}
        {sortedData.map((d, index) => {
          const x = padding + (index / (sortedData.length - 1 || 1)) * chartWidth;
          return (
            <line
              // eslint-disable-next-line react/no-array-index-key
              key={`v-${index}`}
              x1={x}
              x2={x}
              y1={padding}
              y2={padding + chartHeight}
              stroke={isDarkMode ? '#27272f' : '#E5E7EB'}
              strokeWidth='1'
              strokeDasharray='4 4'
            />
          );
        })}

        {/* Gradient fill */}
        <polygon
          fill='url(#valueGradient)'
          stroke='none'
          points={fillPoints}
        />
        {/* Line */}
        <polyline
          fill='none'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          points={linePoints}
        />
        {/* Data points */}
        {sortedData.map((d, index) => {
          const x = padding + (index / (sortedData.length - 1 || 1)) * chartWidth;
          const value = parseFloat(d.value) || 0;
          const normalizedValue = (value - minValue) / valueRange;
          const y = padding + chartHeight - (normalizedValue * chartHeight);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r='3'
              fill='#F1CB68'
            />
          );
        })}
      </svg>
      {/* Axis labels */}
      <div className={`absolute bottom-0 left-0 right-0 flex justify-between text-xs px-2 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {sortedData.length > 0 && (
          <>
            <span>{formatDateLabel(sortedData[0].date)}</span>
            {sortedData.length > 1 && sortedData.length % 2 === 0 && (
              <span>{formatDateLabel(sortedData[Math.floor(sortedData.length / 2)].date)}</span>
            )}
            <span>{formatDateLabel(sortedData[sortedData.length - 1].date)}</span>
          </>
        )}
      </div>
    </div>
  );
}

