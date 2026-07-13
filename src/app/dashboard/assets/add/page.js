'use client';
import {
  allCategories,
  getCategoriesByGroup,
  getCategoryGroups,
  getFormFieldsForCategory,
} from '@/config/assetConfig';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';
import DropdownSelect from '@/components/ui/DropdownSelect';
import TagsInput from '@/components/ui/TagsInput';
import { useTheme } from '@/context/ThemeContext';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createAsset,
  getAsset,
  getAssetDocuments,
  getCategories,
  updateAsset,
  requestAssetAppraisal,
  uploadFile,
  uploadAssetPhoto,
  uploadAssetDocument,
  deleteAssetPhoto,
  deleteAssetDocument,
} from '@/utils/assetsApi';

const steps = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Upload Documents' },
  { id: 3, title: 'Asset Valuation' },
];

// Today's date as YYYY-MM-DD, used as the max for acquisition/purchase date
// pickers so a future date can't be selected.
// Must be the LOCAL date, not toISOString()'s UTC date: east of UTC those differ
// for part of the day, and a UTC max would stop a user in, say, UTC+13 from
// picking their own today. The server allows 24h of slack for exactly this.
const TODAY_ISO = new Date().toLocaleDateString('en-CA');

// Forward-looking dates (End, Maturity, Due, Expected, Expiry, Start) must
// accept future dates, but still need SOME max to bound the calendar's
// year list.
const FUTURE_MAX_ISO = '2100-12-31';

// Only dates recording something that already happened are capped at today.
const isPastOnlyDateField = fieldName => {
  const lowerName = fieldName.toLowerCase();
  return (
    lowerName.includes('purchase') ||
    lowerName.includes('acquisition') ||
    lowerName.includes('upload')
  );
};

// The backend's `asset_type` enum — send these exact lowercase strings. It is
// independent of `category` and `category_group`; all three are sent.
//
// Omitting it is not neutral: the backend then DERIVES one (Portfolio → "stock",
// everything else → "other"). That default is why a crypto holding can sit in the
// database labelled a stock. Making the user choose is the whole point of this
// field, so it starts blank and we only fall back to a derived seed below.
const assetTypes = [
  { value: 'stock', label: 'Stock' },
  { value: 'bond', label: 'Bond' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'luxury_asset', label: 'Luxury Asset' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
];

// Where a category unambiguously implies an asset_type, pre-select it so the
// common cases are right by default and the user only corrects the ambiguous
// ones. Anything absent here starts blank rather than guessing.
const ASSET_TYPE_BY_CATEGORY = {
  'Crypto Assets': 'crypto',
  'Stablecoins & CBDCs': 'crypto',
  'DeFi Instruments': 'crypto',
  'Public Equities': 'stock',
  'Stock Options / RSUs': 'stock',
  'Fixed Income': 'bond',
  'Convertible Notes': 'bond',
  'Real Estate': 'real_estate',
  'REITs & Real Estate Funds': 'real_estate',
  'Farmland & Agri Land': 'real_estate',
  Yachts: 'luxury_asset',
  'Private Jets': 'luxury_asset',
  Vehicles: 'luxury_asset',
  'Art & Collectibles': 'luxury_asset',
  'Watches & Jewelry': 'luxury_asset',
};

// Currency inputs are free text ("$61,500", "61500"). Strip the decoration and
// return a number, or undefined for blank/garbage so the key is dropped from the
// payload rather than sent as NaN.
const toAmount = raw => {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = parseFloat(String(raw).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

// Existing-media shapes vary by endpoint version — normalize to { id, url }.
// Prefer `photos` objects (they carry the id needed to delete); fall back to
// the `images` URL array (display-only, no id → no delete button).
const normalizePhotoList = asset => {
  const fromObjects = Array.isArray(asset?.photos)
    ? asset.photos
        .filter(p => p && typeof p === 'object')
        .map(p => ({
          id: p.id || p.photoId || null,
          url: p.url || p.fileUrl || p.downloadUrl || p.path || '',
        }))
        .filter(p => p.url)
    : [];
  if (fromObjects.length > 0) return fromObjects;
  return (asset?.images || [])
    .filter(url => typeof url === 'string' && url)
    .map(url => ({ id: null, url }));
};

const normalizeDocList = raw => {
  const docs = Array.isArray(raw) ? raw : raw?.documents || [];
  return docs
    .filter(doc => doc && doc.id)
    .map(doc => ({
      id: doc.id,
      name:
        doc.name || doc.fileName || doc.filename || doc.originalName || 'Document',
      url: doc.url || doc.fileUrl || doc.downloadUrl || doc.path || '',
    }));
};

// Subtitle shown under each category-group name in the browser.
const GROUP_SUBTITLES = {
  Assets: 'Physical, Alternative, Lifestyle',
  Portfolio: 'Financial, Digital, Structured',
  Liabilities: 'Liabilities & Debts',
  'Shadow Wealth': 'Shadow & Anticipated Wealth',
  Philanthropy: 'Philanthropy & Impact',
  Lifestyle: 'Lifestyle & Concierge',
  Governance: 'Compliance & Governance',
};

const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const ownershipTypes = ['Sole', 'Joint', 'Trust', 'Corporate'];
const riskLevels = ['Low', 'Medium', 'High', 'Very High'];
const paymentFrequencies = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];

// Suggestions for the group-level "type" fields, mirroring each group's
// sub-categories. These used to resolve to an empty list, which left the
// primary field of 5 of the 7 groups as an unfillable dropdown. They are
// suggestions, not enums — the dropdown also lets the user add their own
// value (see allowsCustomOption).
const debtTypes = [
  'Mortgage',
  'Personal Loan',
  'Business Loan',
  'Credit Card',
  'Auto / Yacht Loan',
  'Margin Loan',
  'Line of Credit',
  'Tax Liability',
  'Deferred Payment',
  'Lease Agreement',
];
const wealthTypes = [
  'Pending Inheritance',
  'Unvested Stock / RSUs',
  'Deferred Compensation',
  'Marital / Shared Assets',
  'Trust Allocation',
  'Legal Settlement',
  'Anticipated Exit Proceeds',
  'Brand / IP Equity',
];
const philanthropyTypes = [
  'Foundation',
  'Donor-Advised Fund',
  'Endowment',
  'Impact Investment',
  'Scholarship Trust',
  'Charitable Trust',
];
const serviceTypes = [
  'Travel Concierge',
  'Event & Auction Access',
  'Club Membership',
  'Property Maintenance',
  'Insurance Management',
  'Family Office Services',
];
const recordTypes = ['KYC', 'AML', 'Legal', 'Audit', 'Regulatory Filing'];

// Fields whose dropdown accepts values beyond the suggestions. Never the
// backend-validated enums (asset_type, condition, currency, ...) — only the
// free-form group "type" fields that end up in specifications.
const allowsCustomOption = fieldName => {
  const lowerName = fieldName.toLowerCase();
  return (
    lowerName.includes('debt type') ||
    lowerName.includes('wealth type') ||
    lowerName.startsWith('type (') ||
    lowerName.includes('service type') ||
    lowerName.includes('record type')
  );
};

// Helper function to convert field name to form field key
const fieldNameToKey = fieldName => {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Helper function to get field type based on field name
const getFieldType = fieldName => {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('date')) return 'date';
  if (
    lowerName.includes('price') ||
    lowerName.includes('value') ||
    lowerName.includes('cost') ||
    lowerName.includes('owed')
  )
    return 'currency';
  if (lowerName.includes('rate') || lowerName.includes('interest'))
    return 'percentage';
  if (
    lowerName.includes('description') ||
    lowerName.includes('notes') ||
    lowerName.includes('purpose')
  )
    return 'textarea';
  if (lowerName.includes('image')) return 'file';
  if (lowerName.includes('condition')) return 'select';
  if (lowerName.includes('ownership type')) return 'select';
  if (lowerName.includes('risk level')) return 'select';
  if (lowerName.includes('payment frequency')) return 'select';
  if (lowerName.includes('currency')) return 'select';
  if (lowerName.includes('type') && !lowerName.includes('ownership'))
    return 'select';
  return 'text';
};

// Helper function to get select options. Entries are either plain strings (value
// === label) or { value, label } when the wire value differs from what we show.
const getSelectOptions = fieldName => {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('asset type')) return assetTypes;
  if (lowerName.includes('condition')) return conditions;
  if (lowerName.includes('ownership type')) return ownershipTypes;
  if (lowerName.includes('risk level')) return riskLevels;
  if (lowerName.includes('payment frequency')) return paymentFrequencies;
  if (lowerName.includes('currency')) return currencies;
  if (lowerName.includes('debt type')) return debtTypes;
  if (lowerName.includes('wealth type')) return wealthTypes;
  // 'Type (Foundation/DAF/etc)' — the Philanthropy vehicle type.
  if (lowerName.startsWith('type (')) return philanthropyTypes;
  if (lowerName.includes('service type')) return serviceTypes;
  if (lowerName.includes('record type')) return recordTypes;
  return [];
};

export default function AddAssetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Edit mode: /dashboard/assets/add?edit=<assetId> reuses this wizard to
  // edit an existing (pending/rejected) asset. The uploads step is skipped
  // and the category is locked; saving PUTs instead of POSTing.
  const editAssetId = searchParams?.get('edit') || null;
  const isEditMode = !!editAssetId;
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  // All three steps show in both modes; in edit mode step 2 manages the
  // asset's EXISTING photos/documents via the asset-scoped media endpoints.
  const visibleSteps = steps;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);
  // Which category group the user is browsing (drill-down step 1 of 2).
  // Independent of selectedCategoryGroup, which tracks the chosen category.
  const [activeGroup, setActiveGroup] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [assetPhotos, setAssetPhotos] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [valuationType, setValuationType] = useState('manual');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [uploadPromises, setUploadPromises] = useState(new Map()); // Track active uploads

  // BUG-17: handleNext awaits uploads, but its closure captured the state from
  // the render it was created in — so after awaiting, `assetPhotos` still said
  // 'uploading' even though the upload had completed, and creation was blocked
  // with "Upload still in progress". These refs always hold the LATEST state so
  // post-await checks see reality.
  const assetPhotosRef = useRef(assetPhotos);
  const supportingDocsRef = useRef(supportingDocs);
  const uploadPromisesRef = useRef(uploadPromises);
  useEffect(() => {
    assetPhotosRef.current = assetPhotos;
  }, [assetPhotos]);
  useEffect(() => {
    supportingDocsRef.current = supportingDocs;
  }, [supportingDocs]);
  useEffect(() => {
    uploadPromisesRef.current = uploadPromises;
  }, [uploadPromises]);

  // Blocks the final Create Asset action while any upload is still running.
  const hasActiveUploads =
    uploadPromises.size > 0 ||
    assetPhotos.some(f => f.status === 'uploading') ||
    supportingDocs.some(f => f.status === 'uploading');

  // Get categories grouped by category group
  const categoriesByGroup = useMemo(() => {
    const groups = getCategoryGroups();
    return groups.map(group => ({
      groupName: group,
      categories: getCategoriesByGroup(group),
    }));
  }, []);

  // Filter categories based on search query
  const filteredCategoriesByGroup = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoriesByGroup;
    }
    const query = searchQuery.toLowerCase();
    return categoriesByGroup
      .map(({ groupName, categories }) => ({
        groupName,
        categories: categories.filter(
          cat =>
            cat.name.toLowerCase().includes(query) ||
            cat.description.toLowerCase().includes(query) ||
            groupName.toLowerCase().includes(query)
        ),
      }))
      .filter(({ categories }) => categories.length > 0);
  }, [categoriesByGroup, searchQuery]);

  // Get form fields for selected category
  const formFields = useMemo(() => {
    if (!selectedCategory) return [];
    return getFormFieldsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Auto-scroll to the Asset Details form once a sub-category is picked, so
  // the user lands on the fields instead of hunting for them below the fold.
  const assetDetailsRef = useRef(null);
  useEffect(() => {
    if (selectedCategory && assetDetailsRef.current) {
      assetDetailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedCategory]);

  // ── Edit mode: load the asset and prefill the form ──────────────────────
  // The fetched specifications (beyond what the form covers) are kept and
  // layered back into the update payload so no previously-saved data is lost.
  const originalSpecsRef = useRef({});
  // Whether the asset was rejected when editing began — a successful edit
  // then auto-re-queues it for review (backend behavior), and the success
  // message should say so.
  const wasRejectedRef = useRef(false);
  // What the category was when editing began — used to detect a change.
  const originalCategoryNameRef = useRef(null);
  const [editLoading, setEditLoading] = useState(isEditMode);
  const [editError, setEditError] = useState(null);
  // The asset's already-uploaded media, shown/managed on step 2 in edit mode.
  // Add/remove act immediately via the asset-scoped media endpoints — the
  // PUT update never touches media rows.
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const addPhotoInputRef = useRef(null);
  const addDocInputRef = useRef(null);
  // Edit mode: the category browser is collapsed behind a "Change Category"
  // button; picking a new sub-category closes it again.
  const [showCategoryBrowser, setShowCategoryBrowser] = useState(false);
  // The backend applies a category change on update ONLY via category_id
  // (the name field is ignored there) — map names to backend ids.
  const backendCategoryIdsRef = useRef({});

  useEffect(() => {
    if (!isEditMode) return;
    getCategories()
      .then(res => {
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.categories || res?.categories || [];
        const map = {};
        list.forEach(cat => {
          if (cat?.name && cat?.id) map[cat.name] = cat.id;
        });
        backendCategoryIdsRef.current = map;
      })
      .catch(err => {
        // Without the map a category change silently won't apply — warn.
        console.warn('Could not load backend category ids:', err?.message);
      });
  }, [isEditMode]);

  const handleExistingPhotoAdd = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning(`"${file.name}" is not an image and was skipped.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(
        `"${file.name}" is larger than 5MB. Please choose a smaller image.`
      );
      return;
    }
    try {
      setMediaBusy(true);
      await uploadAssetPhoto(editAssetId, file);
      // The photo's id/URL are assigned server-side — refetch to display it.
      const res = await getAsset(editAssetId);
      setExistingPhotos(normalizePhotoList(res?.data || res));
      toast.success('Photo added.');
    } catch (err) {
      console.error('Error adding photo:', err);
      toast.error(err.message || 'Failed to add photo.');
    } finally {
      setMediaBusy(false);
    }
  };

  const handleExistingPhotoDelete = async photo => {
    if (!photo.id) return;
    try {
      setMediaBusy(true);
      await deleteAssetPhoto(editAssetId, photo.id);
      setExistingPhotos(prev => prev.filter(p => p !== photo));
      toast.success('Photo removed.');
    } catch (err) {
      console.error('Error removing photo:', err);
      toast.error(err.message || 'Failed to remove photo.');
    } finally {
      setMediaBusy(false);
    }
  };

  const handleExistingDocAdd = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.warning(`"${file.name}" is not a PDF and was skipped.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning(
        `"${file.name}" is larger than 10MB. Please choose a smaller file.`
      );
      return;
    }
    try {
      setMediaBusy(true);
      await uploadAssetDocument(editAssetId, file);
      const res = await getAssetDocuments(editAssetId);
      setExistingDocs(normalizeDocList(res?.data));
      toast.success('Document added.');
    } catch (err) {
      console.error('Error adding document:', err);
      toast.error(err.message || 'Failed to add document.');
    } finally {
      setMediaBusy(false);
    }
  };

  const handleExistingDocDelete = async doc => {
    try {
      setMediaBusy(true);
      await deleteAssetDocument(editAssetId, doc.id);
      setExistingDocs(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document removed.');
    } catch (err) {
      console.error('Error removing document:', err);
      toast.error(err.message || 'Failed to remove document.');
    } finally {
      setMediaBusy(false);
    }
  };

  useEffect(() => {
    if (!editAssetId) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getAsset(editAssetId);
        const asset = response?.data || response;
        if (cancelled || !asset || !asset.id) {
          if (!cancelled) setEditError('This asset could not be loaded.');
          return;
        }

        originalCategoryNameRef.current = asset.category || null;

        // Server enforces this too (403 ASSET_LOCKED on save) — blocking here
        // spares the user from filling a form they can't submit.
        if (asset.aiReviewStatus === 'approved') {
          setEditError(
            'This asset has been approved and can no longer be edited.'
          );
          return;
        }
        wasRejectedRef.current = ['rejected', 'needs_review'].includes(
          asset.aiReviewStatus
        );

        // getAsset camelCases every key (including inside specifications);
        // the form works in snake_case, so convert back.
        const camelToSnakeKey = key =>
          key.replace(/([A-Z])/g, '_$1').toLowerCase();
        const specs = {};
        Object.entries(asset.specifications || {}).forEach(([key, value]) => {
          specs[camelToSnakeKey(key)] = value;
        });
        originalSpecsRef.current = specs;

        const categoryObj =
          allCategories.find(
            c => c.id === asset.category || c.name === asset.category
          ) || null;
        setSelectedCategory(categoryObj?.id || asset.category);
        setSelectedCategoryGroup(
          categoryObj?.categoryGroup || asset.categoryGroup || null
        );
        setActiveGroup(categoryObj?.categoryGroup || null);

        // Dates may come back as full ISO datetimes; the pickers want a day.
        const isoDay = value =>
          typeof value === 'string' ? value.slice(0, 10) : '';
        const currentVal = asset.currentValue ?? asset.estimatedValue;
        setFormData({
          ...specs,
          asset_name: asset.name || '',
          description: asset.description || '',
          location: asset.location || '',
          asset_type: asset.assetType || '',
          currency: asset.currency || 'USD',
          condition: asset.condition || '',
          ownership_type: asset.ownershipType || '',
          acquisition_date: isoDay(asset.acquisitionDate),
          purchase_date: isoDay(asset.acquisitionDate),
          purchase_price: asset.purchasePrice ?? '',
          current_value: currentVal ?? '',
          estimated_value: currentVal ?? '',
        });
        setValuationType(asset.valuationType || 'manual');
        setEstimatedValue(
          currentVal !== null && currentVal !== undefined
            ? String(currentVal)
            : ''
        );

        // Already-uploaded media for the step-2 manager.
        setExistingPhotos(normalizePhotoList(asset));
        try {
          const docsRes = await getAssetDocuments(editAssetId);
          if (!cancelled) setExistingDocs(normalizeDocList(docsRes?.data));
        } catch (docsErr) {
          // Non-critical — the step just shows "no documents".
          console.warn('Could not load asset documents:', docsErr?.message);
        }
      } catch (err) {
        console.error('Error loading asset for editing:', err);
        if (!cancelled) {
          setEditError(
            err.message || 'Failed to load this asset for editing.'
          );
        }
      } finally {
        if (!cancelled) setEditLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editAssetId]);

  // Initialize form data when category changes
  const handleCategorySelect = categoryId => {
    // Re-clicking the already-selected sub-category must not wipe what the
    // user has typed — just take them back to the form.
    if (categoryId === selectedCategory) {
      assetDetailsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }
    setSelectedCategory(categoryId);
    const category = allCategories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryGroup(category.categoryGroup);
      // Selecting from search results should land the browser on that group.
      setActiveGroup(category.categoryGroup);
      // Initialize form data with empty values for all fields
      const fields = getFormFieldsForCategory(categoryId);
      const initialData = {};
      fields.forEach(field => {
        const key = fieldNameToKey(field);
        if (key === 'asset_type') {
          // Seed from the category where it's unambiguous, else leave blank so the
          // user picks. Never default to the first option — that's how every
          // Portfolio asset ended up stamped "stock".
          initialData[key] = ASSET_TYPE_BY_CATEGORY[categoryId] || '';
        } else if (
          getFieldType(field) === 'select' &&
          !allowsCustomOption(field)
        ) {
          // Fixed-enum selects pre-fill their first option; the free-form
          // "type" fields start blank so the user makes a real choice.
          const [first] = getSelectOptions(field);
          initialData[key] = (typeof first === 'string' ? first : first?.value) || '';
        } else {
          initialData[key] = '';
        }
      });
      if (isEditMode) {
        // Switching category while editing must not wipe what's already
        // filled in — carry over every field the new category's form shares
        // with the previous one.
        const merged = { ...initialData };
        Object.keys(merged).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== '') {
            merged[key] = formData[key];
          }
        });
        setFormData(merged);
        setShowCategoryBrowser(false);
      } else {
        setFormData(initialData);
      }
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Edit-mode submit: PUT the edited fields. Photos/documents are deliberately
  // omitted — the backend leaves omitted fields untouched, so existing media
  // stays attached. Specifications are layered over the originals so keys the
  // form doesn't cover survive the round-trip.
  const handleUpdateAsset = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const categoryObj = allCategories.find(c => c.id === selectedCategory);
      const specifications = { ...originalSpecsRef.current, ...formData };
      // Same strip list as creation: promoted top-level fields and phantom keys.
      [
        'asset_name',
        'name',
        'category',
        'categoryGroup',
        'asset_type',
        'description',
        'location',
        'estimated_value',
        'current_value',
        'condition',
        'ownership_type',
        'acquisition_date',
        'purchase_date',
        'purchase_price',
        'currency',
        'valuation_type',
        'photos',
        'images',
        'documents',
        'make_model_year',
        'image',
      ].forEach(key => delete specifications[key]);
      Object.keys(specifications).forEach(key => {
        const val = specifications[key];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          delete specifications[key];
        }
      });
      // Money fields to clean numbers, amount_owed keeps its formatted text
      // (its number goes top-level) — mirrors creation.
      formFields
        .filter(field => getFieldType(field) === 'currency')
        .forEach(field => {
          const key = fieldNameToKey(field);
          if (key === 'amount_owed') return;
          if (key in specifications) {
            const amount = toAmount(specifications[key]);
            if (amount === undefined) delete specifications[key];
            else specifications[key] = amount;
          }
        });

      const assetData = {
        name: (
          formData.asset_name ||
          formData.name ||
          formData.debt_type ||
          formData.wealth_type ||
          formData.fund_vehicle_name ||
          formData.service_type ||
          formData.document_name ||
          categoryObj?.name ||
          ''
        ).slice(0, 255),
        category: categoryObj?.name || selectedCategory,
        categoryGroup:
          selectedCategoryGroup || categoryObj?.categoryGroup || 'Assets',
        description: formData.description || undefined,
        location: formData.location
          ? formData.location.slice(0, 255)
          : undefined,
        assetType: formData.asset_type || undefined,
        estimatedValue:
          toAmount(estimatedValue) ??
          toAmount(formData.current_value) ??
          toAmount(formData.estimated_value) ??
          toAmount(formData.amount_owed),
        currentValue:
          toAmount(estimatedValue) ??
          toAmount(formData.current_value) ??
          toAmount(formData.estimated_value) ??
          toAmount(formData.amount_owed),
        condition: formData.condition || undefined,
        ownershipType: formData.ownership_type || undefined,
        acquisitionDate:
          formData.acquisition_date || formData.purchase_date || undefined,
        purchasePrice: toAmount(formData.purchase_price),
        currency: formData.currency || 'USD',
        valuationType: valuationType || 'manual',
        // The update endpoint ignores the category NAME — only category_id
        // moves an asset to another category.
        categoryId:
          backendCategoryIdsRef.current[
            categoryObj?.name || selectedCategory
          ] || undefined,
        specifications,
      };
      Object.keys(assetData).forEach(key => {
        if (assetData[key] === undefined) {
          delete assetData[key];
        }
      });

      // A category change is only applied server-side via category_id; if the
      // id mapping didn't load, the rest of the edit still saves — warn that
      // the category itself may stay unchanged.
      const newCategoryName = categoryObj?.name || selectedCategory;
      if (
        originalCategoryNameRef.current &&
        newCategoryName !== originalCategoryNameRef.current &&
        !assetData.categoryId
      ) {
        toast.warning(
          'The category change may not be applied — please verify it after saving.'
        );
      }

      console.log('📦 Asset Update Payload:', JSON.stringify(assetData, null, 2));
      await updateAsset(editAssetId, assetData);
      // Editing a rejected asset auto-re-queues it for review (backend
      // resets the verdict to not_reviewed) — tell the user that happened.
      toast.success(
        wasRejectedRef.current
          ? 'Asset updated and resubmitted for review.'
          : 'Asset updated successfully.'
      );
      router.push(`/dashboard/assets/${editAssetId}`);
    } catch (err) {
      console.error('Error updating asset:', err);
      // Race backstop: the asset got approved after the edit page loaded.
      // Editing is over — take the user back to the (locked) asset.
      if (err.code === 'ASSET_LOCKED') {
        toast.info(
          err.message ||
            'This asset has been approved and can no longer be edited.'
        );
        router.push(`/dashboard/assets/${editAssetId}`);
        return;
      }
      setSubmitError(
        err.message || 'Failed to update asset. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (isEditMode) {
      await handleUpdateAsset();
    } else {
      // Submit form - Step 3 is the final step
      try {
        setIsSubmitting(true);
        setSubmitError(null);

        console.log('🚀 Starting Asset Creation Process');
        console.log('📋 Form Data:', formData);
        console.log('📸 Photos:', assetPhotos.length);
        console.log('📄 Documents:', supportingDocs.length);

        // Wait for all uploads to complete first
        console.log('⏳ Waiting for all file uploads to complete...');
        
        // Get all active upload promises (from the ref — never stale)
        let activeUploads = Array.from(uploadPromisesRef.current.values());
        if (activeUploads.length > 0) {
          console.log(`⏳ Waiting for ${activeUploads.length} active upload(s) to complete...`);
          try {
            await Promise.allSettled(activeUploads);
            console.log('✅ All active uploads completed');
            // Give a small delay for state updates
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error('❌ Some uploads failed:', err);
          }
        }

        // Re-check for any remaining active uploads (in case new ones started)
        let maxWaitTime = 30000; // 30 seconds max wait
        const startTime = Date.now();
        while (uploadPromisesRef.current.size > 0 && (Date.now() - startTime) < maxWaitTime) {
          activeUploads = Array.from(uploadPromisesRef.current.values());
          if (activeUploads.length > 0) {
            console.log(`⏳ Still waiting for ${activeUploads.length} upload(s)...`);
            await Promise.allSettled(activeUploads);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Check upload status and collect IDs
        const photoIds = [];
        const documentIds = [];
        const uploadErrors = [];

        // Collect photo IDs from completed uploads — read the ref, not the
        // render-time closure, so completed uploads are seen as completed.
        console.log('📸 Checking photo upload status...');
        const photosNow = assetPhotosRef.current;
        for (let i = 0; i < photosNow.length; i++) {
          const photo = photosNow[i];
          if (photo.status === 'completed' && photo.uploadedId) {
            photoIds.push(photo.uploadedId);
            console.log(`✅ Photo ${i + 1} ready: ${photo.uploadedId} (${photo.name})`);
          } else if (photo.status === 'error') {
            uploadErrors.push({
              type: 'photo',
              index: i,
              fileName: photo.name,
              error: new Error(photo.error || 'Upload failed'),
            });
            console.error(`❌ Photo ${i + 1} failed: ${photo.name} - ${photo.error}`);
          } else if (photo.status === 'uploading' || !photo.uploadedId) {
            // Still uploading or not started
            const statusMsg = photo.status === 'uploading' 
              ? 'Upload still in progress' 
              : 'Upload not completed';
            console.log(`⏳ Photo ${i + 1} not ready: ${photo.name} (${statusMsg})`);
            uploadErrors.push({
              type: 'photo',
              index: i,
              fileName: photo.name,
              error: new Error(statusMsg),
            });
          }
        }

        // Collect document IDs from completed uploads (ref — see above)
        console.log('📄 Checking document upload status...');
        const docsNow = supportingDocsRef.current;
        for (let i = 0; i < docsNow.length; i++) {
          const doc = docsNow[i];
          if (doc.status === 'completed' && doc.uploadedId) {
            documentIds.push(doc.uploadedId);
            console.log(`✅ Document ${i + 1} ready: ${doc.uploadedId} (${doc.name})`);
          } else if (doc.status === 'error') {
            uploadErrors.push({
              type: 'document',
              index: i,
              fileName: doc.name,
              error: new Error(doc.error || 'Upload failed'),
            });
            console.error(`❌ Document ${i + 1} failed: ${doc.name} - ${doc.error}`);
          } else if (doc.status === 'uploading' || !doc.uploadedId) {
            // Still uploading or not started
            const statusMsg = doc.status === 'uploading' 
              ? 'Upload still in progress' 
              : 'Upload not completed';
            console.log(`⏳ Document ${i + 1} not ready: ${doc.name} (${statusMsg})`);
            uploadErrors.push({
              type: 'document',
              index: i,
              fileName: doc.name,
              error: new Error(statusMsg),
            });
          }
        }

        // Validation: Check if any uploads failed or are still in progress
        if (uploadErrors.length > 0) {
          const errorSummary = uploadErrors.map(e => {
            const errorMsg = e.error.isCorsError 
              ? 'CORS Error (Backend configuration issue)'
              : e.error.message;
            return `${e.type} "${e.fileName}": ${errorMsg}`;
          }).join('\n');
          
          // Check if all errors are CORS errors
          const allCorsErrors = uploadErrors.every(e => e.error?.isCorsError);
          const errorMessage = allCorsErrors
            ? `CORS Error: Backend must allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'frontend'}. Please configure CORS on backend server.\n\nFailed files:\n${uploadErrors.map(e => `- ${e.type}: ${e.fileName}`).join('\n')}`
            : `Failed to upload ${uploadErrors.length} file(s). Please wait for uploads to complete or fix errors before creating asset.\n\nErrors:\n${errorSummary}`;
          
          console.error('❌ Asset creation cancelled due to upload failures:', uploadErrors);
          setSubmitError(errorMessage);
          setIsSubmitting(false);
          return; // Stop here - don't create asset
        }

        // Log upload summary
        console.log('✅ All files uploaded successfully:', {
          photos: photoIds.length,
          documents: documentIds.length,
          photoIds,
          documentIds,
        });

        // Prepare asset data
        const categoryObj = allCategories.find(c => c.id === selectedCategory);
        const assetData = {
          // Backend requires `name` (422 otherwise, NOT NULL column, ≤255).
          // Five groups have no "Asset Name" field, so fall back to each
          // group's identifying field, then to the sub-category name so a
          // create can never be rejected for a missing name.
          name: (
            formData.asset_name ||
            formData.name ||
            formData.debt_type || // Liabilities
            formData.wealth_type || // Shadow Wealth
            formData.fund_vehicle_name || // Philanthropy
            formData.service_type || // Lifestyle
            formData.document_name || // Governance
            categoryObj?.name ||
            ''
          ).slice(0, 255),
          category: categoryObj?.name || selectedCategory,
          categoryGroup: selectedCategoryGroup || categoryObj?.categoryGroup || 'Assets',
          // Omit rather than send "". On update the backend guards on `is not
          // None`, so "" overwrites and null leaves the field alone — sending ""
          // for a field the user never saw would wipe their existing text.
          description: formData.description || undefined,
          // DB column is VARCHAR(255) and overflow is a 500, not a 422 —
          // enforce the cap here.
          location: formData.location
            ? formData.location.slice(0, 255)
            : undefined,
          // The backend derives this when omitted (Portfolio → "stock"), which is
          // how a crypto holding gets labelled a stock. Send what the user chose.
          assetType: formData.asset_type || undefined,
          // Step 3's valuation wins when given, but a "Current Value" or
          // "Estimated Value" typed on the step-1 form is a real number the
          // user entered — both used to be stripped from specifications and
          // never promoted, so they were dropped on the floor.
          // Liabilities carry their Amount Owed here (agreed with backend):
          // net-worth math SUBTRACTS the Liabilities group, so the amount
          // must be in the value field for the debt to count against totals.
          estimatedValue:
            toAmount(estimatedValue) ??
            toAmount(formData.current_value) ??
            toAmount(formData.estimated_value) ??
            toAmount(formData.amount_owed),
          currentValue:
            toAmount(estimatedValue) ??
            toAmount(formData.current_value) ??
            toAmount(formData.estimated_value) ??
            toAmount(formData.amount_owed),
          condition: formData.condition || undefined,
          ownershipType: formData.ownership_type || undefined,
          acquisitionDate: formData.acquisition_date || formData.purchase_date || undefined,
          purchasePrice: toAmount(formData.purchase_price),
          currency: formData.currency || 'USD',
          valuationType: valuationType || 'manual',
          // Backend expects UUIDs (IDs), not URLs. Create merges `photos` and
          // `images` and de-duplicates, so sending both was harmless but dead
          // weight — `images` is only a backward-compatibility alias.
          photos: photoIds.length > 0 ? photoIds : undefined,
          documents: documentIds.length > 0 ? documentIds : undefined,
          specifications: {
            // Include all category-specific fields
            ...formData,
            // Remove top-level fields that are stored separately
            asset_name: undefined,
            name: undefined,
            category: undefined,
            categoryGroup: undefined,
            // Promoted to the top level of the payload above.
            asset_type: undefined,
            description: undefined,
            location: undefined,
            estimated_value: undefined,
            current_value: undefined,
            condition: undefined,
            ownership_type: undefined,
            acquisition_date: undefined,
            purchase_date: undefined,
            purchase_price: undefined,
            currency: undefined,
            valuation_type: undefined,
            photos: undefined,
            images: undefined,
            documents: undefined,
            // Composite/phantom keys that are never individually filled
            make_model_year: undefined,
            image: undefined,
          },
        };

        // Remove undefined values from top-level
        Object.keys(assetData).forEach(key => {
          if (assetData[key] === undefined) {
            delete assetData[key];
          }
        });
        // Remove undefined, empty-string, and empty-array (untouched tags)
        // values from specifications
        if (assetData.specifications) {
          Object.keys(assetData.specifications).forEach(key => {
            const val = assetData.specifications[key];
            if (
              val === undefined ||
              val === null ||
              val === '' ||
              (Array.isArray(val) && val.length === 0)
            ) {
              delete assetData.specifications[key];
            }
          });
          // The backend stores specifications verbatim, so money fields
          // (contribution_value, annual_cost, ...) must be sent as clean
          // numbers — "$61,500" would be stuck as a string forever and could
          // never be aggregated. Garbage that doesn't parse is dropped rather
          // than sent as NaN. Exception: amount_owed keeps the user's
          // formatted text for the detail page — its clean number is promoted
          // to top-level estimated_value/current_value above.
          formFields
            .filter(field => getFieldType(field) === 'currency')
            .forEach(field => {
              const key = fieldNameToKey(field);
              if (key === 'amount_owed') return;
              if (key in assetData.specifications) {
                const amount = toAmount(assetData.specifications[key]);
                if (amount === undefined) {
                  delete assetData.specifications[key];
                } else {
                  assetData.specifications[key] = amount;
                }
              }
            });
        }

        // Log complete asset payload before creation
        console.log('📦 Complete Asset Creation Payload:', JSON.stringify(assetData, null, 2));
        console.log('📊 Payload Summary:', {
          name: assetData.name,
          category: assetData.category,
          categoryGroup: assetData.categoryGroup,
          estimatedValue: assetData.estimatedValue,
          currency: assetData.currency,
          photosCount: assetData.photos?.length || 0,
          photosIds: assetData.photos,
          imagesCount: assetData.images?.length || 0,
          imagesIds: assetData.images,
          documentsCount: assetData.documents?.length || 0,
          documentIds: assetData.documents,
          specificationsKeys: Object.keys(assetData.specifications || {}),
        });

        // Create the asset
        console.log('🔄 Creating asset...');
        const response = await createAsset(assetData);
        
        console.log('✅ Asset created successfully:', {
          assetId: response.data?.id,
          name: response.data?.name,
          category: response.data?.category,
        });

        // Asset created successfully with photo and document IDs
        const assetId = response.data?.id;
        if (assetId) {
          console.log('🔗 Asset ID received:', assetId);
          console.log('📎 Asset created with IDs:', {
            photos: photoIds.length,
            documents: documentIds.length,
            photoIds: photoIds,
            documentIds: documentIds,
          });
        }

        // If the user chose a professional appraisal, request it now that the
        // asset exists (the appraisal endpoint needs the asset id).
        let appraisalRequested = false;
        if (valuationType === 'appraisal' && assetId) {
          try {
            console.log('🔍 Requesting professional appraisal for asset:', assetId);
            await requestAssetAppraisal(assetId, { appraisalType: 'Standard' });
            appraisalRequested = true;
            console.log('✅ Professional appraisal requested.');
          } catch (appraisalErr) {
            // Don't fail asset creation if the appraisal request fails — the
            // user can retry from the asset detail page.
            console.error('⚠️ Appraisal request failed (asset was still created):', appraisalErr);
          }
        }

        // Redirect: send to the asset detail page when an appraisal was
        // requested so the user can see its status; otherwise to the list.
        console.log('✅ Asset creation complete. Redirecting...');
        if (appraisalRequested && assetId) {
          router.push(`/dashboard/assets/${assetId}`);
        } else {
          router.push('/dashboard/assets');
        }
      } catch (err) {
        console.error('❌ Error creating asset:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.status,
          data: err.data,
          fullError: err,
        });
        
        // Extract detailed error message
        let errorMessage = 'Failed to create asset. Please try again.';
        if (err.code === 'INVALID_MEDIA_REFERENCES') {
          // Backend rejected the create because one or more photo/document
          // references don't exist or belong to someone else; its message
          // names each offending reference.
          errorMessage = `Some uploaded files couldn't be attached to this asset. Remove the affected files below, re-upload them, and try again.\n\n${err.message || ''}`.trim();
        } else if (err.data) {
          if (Array.isArray(err.data.detail)) {
            // Backend validation errors (422)
            const validationErrors = err.data.detail.map(error => {
              if (typeof error === 'string') return error;
              if (error.msg) return `${error.loc?.join('.') || 'Field'}: ${error.msg}`;
              if (error.msg) return error.msg;
              return JSON.stringify(error);
            }).join('\n');
            errorMessage = `Validation Error:\n${validationErrors}`;
          } else if (typeof err.data.detail === 'string') {
            errorMessage = err.data.detail;
          } else if (err.data.message) {
            errorMessage = err.data.message;
          } else if (err.data.error) {
            errorMessage = err.data.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setSubmitError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    // Editing came from the asset's detail page — return there on cancel.
    router.push(
      isEditMode ? `/dashboard/assets/${editAssetId}` : '/dashboard/assets'
    );
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    handleFiles(files, type);
    // Reset so picking the same file again (e.g. after a size warning)
    // still fires onChange.
    event.target.value = '';
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, type);
  };

  const handleFiles = (files, type) => {
    // Reject invalid files up front with a friendly warning toast instead of
    // silently dropping them or letting the backend fail with a raw error.
    const maxSizeMB = type === 'photo' ? 5 : 10;
    const validFiles = files.filter(file => {
      if (type === 'photo' && !file.type.startsWith('image/')) {
        toast.warning(`"${file.name}" is not an image and was skipped.`);
        return false;
      }
      if (type === 'doc' && file.type !== 'application/pdf') {
        toast.warning(`"${file.name}" is not a PDF and was skipped.`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.warning(
          `"${file.name}" is larger than ${maxSizeMB}MB. Please choose a smaller ${
            type === 'photo' ? 'image' : 'file'
          }.`
        );
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      progress: 0,
      status: 'uploading', // 'uploading', 'completed', 'error'
      error: null,
      uploadedId: null, // Store the UUID from backend after successful upload
    }));

    if (type === 'photo') {
      setAssetPhotos(prev => [...prev, ...newFiles]);
      // Start actual uploads immediately
      newFiles.forEach(fileObj => {
        startUpload(fileObj, type);
      });
    } else if (type === 'doc') {
      setSupportingDocs(prev => [...prev, ...newFiles]);
      newFiles.forEach(fileObj => {
        startUpload(fileObj, type);
      });
    }
  };

  const startUpload = async (fileObj, type) => {
    const fileId = fileObj.id;

    // Update status to uploading
    if (type === 'photo') {
      setAssetPhotos(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
        )
      );
    } else {
      setSupportingDocs(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
        )
      );
    }

    try {
      // Create upload promise
      const uploadPromise = uploadFileWithProgress(
        fileObj.file,
        type === 'photo' ? 'photo' : 'document',
        fileId,
        type
      );

      // Store the promise
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.set(fileId, uploadPromise);
        return newMap;
      });

      // Wait for upload to complete
      const result = await uploadPromise;

      // Update with success
      if (type === 'photo') {
        setAssetPhotos(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'completed',
                  progress: 100,
                  uploadedId: result.id,
                  error: null,
                }
              : file
          )
        );
      } else {
        setSupportingDocs(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'completed',
                  progress: 100,
                  uploadedId: result.id,
                  error: null,
                }
              : file
          )
        );
      }

      // Remove from promises map
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });

      console.log(`✅ ${type === 'photo' ? 'Photo' : 'Document'} uploaded successfully:`, {
        fileId,
        uploadedId: result.id,
        fileName: fileObj.name,
      });
    } catch (error) {
      console.error(`❌ Upload failed for ${type}:`, error);
      
      // Update with error
      if (type === 'photo') {
        setAssetPhotos(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : file
          )
        );
      } else {
        setSupportingDocs(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : file
          )
        );
      }

      // Remove from promises map
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }
  };

  const uploadFileWithProgress = async (file, fileType, fileId, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    const headers = {};
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const { API_BASE_URL, API_BASE_PATH, API_ENDPOINTS } = await import('@/config/api');
    const url = `${API_BASE_URL.replace(/\/$/, '')}${API_BASE_PATH}${API_ENDPOINTS.FILES.UPLOAD}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          // Update progress in state
          if (type === 'photo') {
            setAssetPhotos(prev =>
              prev.map(file =>
                file.id === fileId ? { ...file, progress } : file
              )
            );
          } else {
            setSupportingDocs(prev =>
              prev.map(file =>
                file.id === fileId ? { ...file, progress } : file
              )
            );
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('📁 Upload response:', response);
            const data = response.data || response;
            const id = data.id || data.file_id || data.uuid;
            if (id) {
              resolve({ id, ...data });
            } else {
              console.error('Upload response missing ID. Full response:', response);
              reject(new Error('Upload succeeded but no ID returned'));
            }
          } catch (err) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', url);
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
      xhr.send(formData);
    });
  };

  const removeFile = (fileId, type) => {
    // Cancel upload if in progress
    const promise = uploadPromises.get(fileId);
    if (promise) {
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }

    if (type === 'photo') {
      setAssetPhotos(prev => {
        const file = prev.find(f => f.id === fileId);
        if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
        return prev.filter(f => f.id !== fileId);
      });
    } else if (type === 'doc') {
      setSupportingDocs(prev => prev.filter(file => file.id !== fileId));
    }
  };

  const getStepStatus = stepId => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  // Sub-category card, shared by the drill-down grid and search results.
  const renderCategoryCard = category => (
    <button
      key={category.id}
      onClick={() => handleCategorySelect(category.id)}
      className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
        selectedCategory === category.id
          ? 'bg-[#2A2A2D] border-[#F1CB68] shadow-lg shadow-[#F1CB68]/20'
          : 'bg-[#2A2A2D] border-[#FFFFFF14] hover:border-[#F1CB68]/50 hover:bg-[#2A2A2D]/80'
      }`}
    >
      {/* Icon - Yellow icon at top center */}
      <div className='flex justify-center mb-4'>
        {category.iconFile ? (
          <img
            src={`/${category.iconFile}`}
            alt={category.name}
            className='w-12 h-12 object-contain'
            style={{
              filter:
                'brightness(0) saturate(100%) invert(77%) sepia(48%) saturate(1352%) hue-rotate(358deg) brightness(101%) contrast(96%)',
            }}
          />
        ) : (
          <div className='w-12 h-12 flex items-center justify-center text-[#F1CB68] transition-transform group-hover:scale-110'>
            {(() => {
              const IconComponent = getCategoryIcon(category.id);
              return <IconComponent className='w-12 h-12' />;
            })()}
          </div>
        )}
      </div>

      {/* Category Title */}
      <h4
        className={`text-lg font-bold mb-2 ${
          selectedCategory === category.id ? 'text-[#F1CB68]' : 'text-white'
        }`}
      >
        {category.name}
      </h4>

      {/* Description */}
      <p className='text-sm text-gray-400 leading-relaxed line-clamp-2'>
        {category.description}
      </p>

      {/* Selected Indicator */}
      {selectedCategory === category.id && (
        <div className='absolute top-4 right-4'>
          <div className='w-6 h-6 rounded-full bg-[#F1CB68] flex items-center justify-center'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#0B0D12'
              strokeWidth='3'
            >
              <path d='M20 6L9 17l-5-5' />
            </svg>
          </div>
        </div>
      )}
    </button>
  );

  // Render form field based on field name
  const renderFormField = fieldName => {
    const fieldKey = fieldNameToKey(fieldName);
    const fieldType = getFieldType(fieldName);
    const value = formData[fieldKey] || '';

    // Skip Image field as it's handled in step 2
    if (fieldName.toLowerCase().includes('image')) {
      return null;
    }

    // Tags: chip editor instead of a plain text input. Stored in formData as
    // an array and sent to the backend inside specifications.
    if (fieldName.toLowerCase().includes('tag')) {
      return (
        <div key={fieldKey} className='mb-6'>
          <label className='block text-sm font-medium text-white mb-2'>
            {fieldName}
          </label>
          <TagsInput
            name={fieldKey}
            value={formData[fieldKey]}
            onChange={handleChange}
            placeholder='Type a tag, e.g. "vintage"'
          />
        </div>
      );
    }

    // Handle special fields
    if (fieldName === 'Make/Model/Year') {
      return (
        <div
          key={fieldKey}
          className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'
        >
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Make
            </label>
            <input
              type='text'
              name='make'
              value={formData.make || ''}
              onChange={handleChange}
              placeholder='Enter make'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Model
            </label>
            <input
              type='text'
              name='model'
              value={formData.model || ''}
              onChange={handleChange}
              placeholder='Enter model'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Year
            </label>
            <input
              type='text'
              inputMode='numeric'
              name='year'
              value={formData.year || ''}
              // Manufacture year: digits only, capped at 4 (e.g. 1998, 2024).
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData(prev => ({ ...prev, year: digits }));
              }}
              placeholder='Enter year'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
        </div>
      );
    }

    // Handle Category field - show as read-only if category is selected
    if (fieldName === 'Category') {
      return (
        <div key={fieldKey} className='mb-6'>
          <label className='block text-sm font-medium text-white mb-2'>
            {fieldName}
          </label>
          <input
            type='text'
            value={
              selectedCategory
                ? allCategories.find(c => c.id === selectedCategory)?.name || ''
                : ''
            }
            readOnly
            className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-gray-400 cursor-not-allowed'
          />
        </div>
      );
    }

    switch (fieldType) {
      case 'date':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <CalendarDatePicker
              name={fieldKey}
              value={value}
              onChange={handleChange}
              // Only past-facing dates (purchase/acquisition/upload) are capped
              // at today — End/Maturity/Due/Expected/Expiry dates stay open to
              // the future. The calendar disables anything outside the range.
              min='1900-01-01'
              max={isPastOnlyDateField(fieldName) ? TODAY_ISO : FUTURE_MAX_ISO}
              placeholder={`Select ${fieldName.toLowerCase()}`}
            />
          </div>
        );

      case 'currency':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <div className='relative'>
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#F1CB68] font-semibold'>
                $
              </span>
              <input
                type='text'
                name={fieldKey}
                value={value}
                onChange={handleChange}
                placeholder='0.00'
                className='w-full pl-8 pr-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>
          </div>
        );

      case 'percentage':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <div className='relative'>
              <input
                type='text'
                name={fieldKey}
                value={value}
                onChange={handleChange}
                placeholder='0.00'
                className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
              <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                %
              </span>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <textarea
              name={fieldKey}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
              rows={4}
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none'
            />
          </div>
        );

      case 'select': {
        const options = getSelectOptions(fieldName).map(opt =>
          typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            {/* No silent default: the trigger shows a placeholder until the
                user makes a real choice. */}
            <DropdownSelect
              name={fieldKey}
              value={value}
              onChange={handleChange}
              options={options}
              placeholder={`Select ${fieldName.toLowerCase()}`}
              allowCustom={allowsCustomOption(fieldName)}
            />
          </div>
        );
      }

      default:
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <input
              type='text'
              name={fieldKey}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
        );
    }
  };

  return (
    <>
      <div className='min-h-screen pb-20'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={handleCancel}
            className='text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M19 12H5M5 12l7-7M5 12l7 7' />
            </svg>
            {isEditMode ? 'Back to Asset' : 'Back to Assets'}
          </button>
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {isEditMode ? 'Edit Asset' : 'Add New Asset'}
          </h1>
          <p className='text-gray-400 mt-2'>
            {isEditMode
              ? 'Update the details of your asset and save your changes'
              : 'Fill in the details to add a new asset to your portfolio'}
          </p>
        </div>

        {/* Stepper - Desktop */}
        <div className='hidden md:block max-w-4xl mx-auto mb-12'>
          <div className='relative flex items-center justify-between'>
            {visibleSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className='flex-1 relative flex items-center'
                >
                  {/* Step Circle and Info */}
                  <div className='flex flex-col items-center flex-1'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                        status === 'completed'
                          ? 'bg-gray-600 text-gray-400'
                          : status === 'active'
                          ? 'bg-[#F1CB68] text-[#0B0D12]'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {status === 'completed' ? '✓' : index + 1}
                    </div>
                    <span
                      className={`text-sm text-nowrap text-center ${
                        status === 'active' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < visibleSteps.length - 1 && (
                    <div
                      className='h-[2px] flex-1 mx-4'
                      style={{
                        background:
                          status === 'completed'
                            ? 'rgba(107, 114, 128, 0.5)'
                            : status === 'active'
                            ? '#F1CB68'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stepper - Mobile */}
        <div className='md:hidden mb-8'>
          <div className='flex items-center justify-center gap-2'>
            {visibleSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      status === 'completed'
                        ? 'bg-gray-600 text-gray-400'
                        : status === 'active'
                        ? 'bg-[#F1CB68] text-[#0B0D12]'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {status === 'completed' ? '✓' : index + 1}
                  </div>
                  {index < visibleSteps.length - 1 && (
                    <div
                      className='w-6 h-[2px] mx-1'
                      style={{
                        background:
                          status === 'completed'
                            ? 'rgba(107, 114, 128, 0.5)'
                            : status === 'active'
                            ? '#F1CB68'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className='text-center text-sm text-gray-400 mt-2'>
            Step{' '}
            {visibleSteps.findIndex(step => step.id === currentStep) + 1} of{' '}
            {visibleSteps.length}
          </p>
        </div>

        {/* Form Content */}
        {currentStep === 1 && (
          <div className='max-w-7xl mx-auto'>
            {/* Edit mode: no category browser — the category is fixed; the
                prefetched form renders below. */}
            {isEditMode && editLoading && (
              <p className='text-gray-400 text-center py-12'>
                Loading asset details…
              </p>
            )}
            {isEditMode && editError && (
              <div className='p-4 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm'>
                {editError}
                <button
                  onClick={handleCancel}
                  className='block mt-2 text-[#F1CB68] hover:text-[#d4b55a] transition-colors'
                >
                  Back to asset
                </button>
              </div>
            )}
            {/* Current category & sub-category, with a toggle to open the
                browser below and pick a different one. Shared field values
                carry over on switch. */}
            {isEditMode && !editLoading && !editError && selectedCategory && (
              <div className='mb-6 p-4 rounded-xl bg-gradient-to-r from-[#222126] to-[#111116] border border-[#F1CB68]/30 flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='w-12 h-12 rounded-lg bg-[#F1CB68]/10 flex items-center justify-center flex-shrink-0'>
                  {(() => {
                    const IconComponent = getCategoryIcon(selectedCategory);
                    return <IconComponent className='w-6 h-6 text-[#F1CB68]' />;
                  })()}
                </div>
                <div className='flex-1'>
                  <p className='text-xs text-gray-400'>
                    Category · Sub-category
                  </p>
                  <p className='text-white font-semibold'>
                    {selectedCategoryGroup} ·{' '}
                    {allCategories.find(c => c.id === selectedCategory)?.name ||
                      selectedCategory}
                  </p>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    {
                      allCategories.find(c => c.id === selectedCategory)
                        ?.description
                    }
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setShowCategoryBrowser(prev => !prev)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors self-start sm:self-center ${
                    showCategoryBrowser
                      ? 'border border-[#FFFFFF14] text-white hover:bg-white/5'
                      : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                  }`}
                >
                  {showCategoryBrowser ? 'Keep Current' : 'Change Category'}
                </button>
              </div>
            )}
            {(!isEditMode || showCategoryBrowser) && (
              <>
            {/* Header Section */}
            <div className='mb-8'>
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-2 leading-tight'>
                Discover More.
                <br />
                Browse Smarter.
              </h2>

              {/* Search Bar and Add Button */}
              <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                <div className='flex-1 relative'>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#9CA3AF'
                      strokeWidth='2'
                    >
                      <circle cx='11' cy='11' r='8' />
                      <path d='m21 21-4.35-4.35' />
                    </svg>
                  </div>
                  <input
                    type='text'
                    placeholder='Search Category......'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='w-full pl-12 pr-4 py-3 rounded-xl bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>
                <button className='px-6 hidden py-3 rounded-xl bg-[#F1CB68] text-[#0B0D12] font-semibold hover:bg-[#d4b55a] transition-colors flex items-center gap-2 justify-center'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M12 5v14M5 12h14' />
                  </svg>
                  Add New Asset
                </button>
              </div>
            </div>

            {/* Main Content Container — two-step browser: pick a category
                group first, then one of its sub-categories. A search query
                overrides the drill-down and shows matches across all groups. */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8 max-h-[calc(200vh-300px)] overflow-y-auto custom-scrollbar'>
              {searchQuery.trim() ? (
                <>
                  {/* Search results across all groups */}
                  {filteredCategoriesByGroup.map(({ groupName, categories }) => (
                    <div key={groupName} className='mb-8 last:mb-0'>
                      <div className='flex items-center gap-3 mb-4'>
                        <h3 className='text-2xl font-bold text-white'>
                          {groupName}
                        </h3>
                        <span className='text-sm text-gray-400'>
                          {GROUP_SUBTITLES[groupName] || groupName}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {categories.map(category => renderCategoryCard(category))}
                      </div>
                    </div>
                  ))}

                  {/* No Results Message */}
                  {filteredCategoriesByGroup.length === 0 && (
                    <div className='text-center py-12'>
                      <p className='text-gray-400 text-lg'>
                        No categories found matching &quot;{searchQuery}&quot;
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className='mt-4 text-[#F1CB68] hover:text-[#d4b55a] transition-colors'
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </>
              ) : !activeGroup ? (
                <>
                  {/* Step A: pick a category group */}
                  <div className='mb-6'>
                    <h3 className='text-2xl font-bold text-white mb-1'>
                      Select a Category
                    </h3>
                    <p className='text-sm text-gray-400'>
                      Choose the type of asset you want to add
                    </p>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {categoriesByGroup.map(({ groupName, categories }) => {
                      const firstCategory = categories[0];
                      const isSelectedGroup =
                        selectedCategoryGroup === groupName;
                      return (
                        <button
                          key={groupName}
                          onClick={() => setActiveGroup(groupName)}
                          className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                            isSelectedGroup
                              ? 'bg-[#2A2A2D] border-[#F1CB68] shadow-lg shadow-[#F1CB68]/20'
                              : 'bg-[#2A2A2D] border-[#FFFFFF14] hover:border-[#F1CB68]/50 hover:bg-[#2A2A2D]/80'
                          }`}
                        >
                          <div className='flex justify-center mb-4'>
                            {firstCategory?.iconFile ? (
                              <img
                                src={`/${firstCategory.iconFile}`}
                                alt={groupName}
                                className='w-12 h-12 object-contain'
                                style={{
                                  filter:
                                    'brightness(0) saturate(100%) invert(77%) sepia(48%) saturate(1352%) hue-rotate(358deg) brightness(101%) contrast(96%)',
                                }}
                              />
                            ) : (
                              <div className='w-12 h-12 flex items-center justify-center text-[#F1CB68] transition-transform group-hover:scale-110'>
                                {(() => {
                                  const IconComponent = getCategoryIcon(
                                    firstCategory?.id
                                  );
                                  return <IconComponent className='w-12 h-12' />;
                                })()}
                              </div>
                            )}
                          </div>
                          <h4
                            className={`text-lg font-bold mb-1 ${
                              isSelectedGroup ? 'text-[#F1CB68]' : 'text-white'
                            }`}
                          >
                            {groupName}
                          </h4>
                          <p className='text-sm text-gray-400 leading-relaxed mb-3'>
                            {GROUP_SUBTITLES[groupName] || groupName}
                          </p>
                          <span className='inline-flex items-center gap-1 text-xs text-[#F1CB68]'>
                            {categories.length}{' '}
                            {categories.length === 1 ? 'type' : 'types'}
                            <svg
                              width='14'
                              height='14'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M9 18l6-6-6-6' />
                            </svg>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Step B: pick a sub-category within the chosen group */}
                  <button
                    onClick={() => setActiveGroup(null)}
                    className='text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors'
                  >
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M19 12H5M5 12l7-7M5 12l7 7' />
                    </svg>
                    All Categories
                  </button>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3'>
                      <h3 className='text-2xl font-bold text-white'>
                        {activeGroup}
                      </h3>
                      <span className='text-sm text-gray-400'>
                        {GROUP_SUBTITLES[activeGroup] || activeGroup}
                      </span>
                    </div>
                    <p className='text-sm text-gray-400 mt-1'>
                      Select a sub-category to continue
                    </p>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {getCategoriesByGroup(activeGroup).map(category =>
                      renderCategoryCard(category)
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Selected Category Display */}
            {selectedCategory && (
              <div className='mt-6 p-4 bg-[#F1CB68]/10 border border-[#F1CB68]/30 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-[#F1CB68]/20 flex items-center justify-center'>
                    {(() => {
                      const category = allCategories.find(
                        c => c.id === selectedCategory
                      );
                      if (category?.iconFile) {
                        return (
                          <img
                            src={`/${category.iconFile}`}
                            alt='Selected category'
                            className='w-6 h-6 object-contain'
                          />
                        );
                      } else {
                        const IconComponent = getCategoryIcon(selectedCategory);
                        return (
                          <IconComponent className='w-6 h-6 text-[#F1CB68]' />
                        );
                      }
                    })()}
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-400 mb-1'>
                      Selected Category
                    </p>
                    <p className='text-white font-semibold'>
                      {allCategories.find(c => c.id === selectedCategory)?.name}
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {
                        allCategories.find(c => c.id === selectedCategory)
                          ?.description
                      }
                    </p>
                  </div>
                  {/* Clearing the selection would wipe the whole form — an
                      edited asset always keeps SOME category, so hide it. */}
                  {!isEditMode && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedCategoryGroup(null);
                      setFormData({});
                    }}
                    className='text-gray-400 hover:text-white transition-colors p-2'
                  >
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M18 6L6 18M6 6l12 12' />
                    </svg>
                  </button>
                  )}
                </div>
              </div>
            )}
              </>
            )}

            {/* Dynamic Form Fields */}
            {selectedCategory && formFields.length > 0 && (
              <div
                ref={assetDetailsRef}
                className='mt-8 bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8 scroll-mt-24'
              >
                <h3 className='text-xl font-semibold text-white mb-6'>
                  Asset Details
                </h3>
                {formFields.map(field => renderFormField(field))}

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-end mt-8'>
                  <button
                    onClick={handleCancel}
                    className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                  >
                    Cancel
                  </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedCategory || isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCategory && !isSubmitting
                      ? 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Next Step'}
                </button>
                </div>
              </div>
            )}

            {/* Action Buttons - Show when no category selected */}
            {!selectedCategory && (
              <div className='flex flex-col sm:flex-row gap-4 justify-end mt-6'>
                <button
                  onClick={handleCancel}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 (edit mode) - manage the asset's EXISTING photos and
            documents. Add/remove act immediately via the asset-scoped media
            endpoints — the PUT update never touches media rows. */}
        {currentStep === 2 && isEditMode && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
              <h3 className='text-xl font-semibold text-white mb-1'>
                Photos & Documents
              </h3>
              <p className='text-sm text-gray-400 mb-6'>
                Changes to photos and documents are saved immediately.
              </p>

              {/* Existing Photos */}
              <div className='mb-8'>
                <h4 className='text-sm font-medium text-white mb-3'>
                  Asset Photos
                </h4>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                  {existingPhotos.map((photo, index) => (
                    <div
                      key={photo.id || photo.url || index}
                      className='relative rounded-xl overflow-hidden border border-[#FFFFFF14] bg-[#1a1a1d] aspect-square'
                    >
                      <img
                        src={photo.url}
                        alt='Asset photo'
                        className='w-full h-full object-cover'
                      />
                      {photo.id && (
                        <button
                          type='button'
                          onClick={() => handleExistingPhotoDelete(photo)}
                          disabled={mediaBusy}
                          aria-label='Remove photo'
                          className='absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-red-400 hover:text-red-300 hover:bg-black/90 flex items-center justify-center transition-colors disabled:opacity-50'
                        >
                          <svg
                            width='13'
                            height='13'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                          >
                            <path d='M18 6L6 18M6 6l12 12' />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => addPhotoInputRef.current?.click()}
                    disabled={mediaBusy}
                    className='aspect-square rounded-xl border-2 border-dashed border-[#FFFFFF2a] hover:border-[#F1CB68]/60 text-gray-400 hover:text-[#F1CB68] flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50'
                  >
                    <svg
                      width='22'
                      height='22'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M12 5v14M5 12h14' />
                    </svg>
                    <span className='text-xs'>
                      {mediaBusy ? 'Working…' : 'Add Photo'}
                    </span>
                  </button>
                </div>
                <p className='text-xs text-gray-500 mt-2'>JPG, PNG (Max 5MB)</p>
                <input
                  ref={addPhotoInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleExistingPhotoAdd}
                  className='hidden'
                />
              </div>

              {/* Existing Documents */}
              <div className='mb-8'>
                <h4 className='text-sm font-medium text-white mb-3'>
                  Supporting Documents
                </h4>
                {existingDocs.length === 0 && (
                  <p className='text-sm text-gray-500 mb-3'>
                    No documents uploaded yet.
                  </p>
                )}
                <div className='space-y-2'>
                  {existingDocs.map(doc => (
                    <div
                      key={doc.id}
                      className='flex items-center gap-3 p-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14]'
                    >
                      <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#F1CB68'
                        strokeWidth='2'
                        className='flex-shrink-0'
                      >
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                        <path d='M14 2v6h6' />
                      </svg>
                      <span className='flex-1 text-sm text-white truncate'>
                        {doc.name}
                      </span>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-[#F1CB68] hover:text-[#d4b55a] transition-colors'
                        >
                          View
                        </a>
                      )}
                      <button
                        type='button'
                        onClick={() => handleExistingDocDelete(doc)}
                        disabled={mediaBusy}
                        aria-label={`Remove ${doc.name}`}
                        className='text-red-400 hover:text-red-300 transition-colors p-1 disabled:opacity-50'
                      >
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2.5'
                        >
                          <path d='M18 6L6 18M6 6l12 12' />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type='button'
                  onClick={() => addDocInputRef.current?.click()}
                  disabled={mediaBusy}
                  className='mt-3 px-4 py-2.5 rounded-lg border border-[#FFFFFF2a] text-sm text-white hover:border-[#F1CB68]/60 hover:text-[#F1CB68] transition-colors disabled:opacity-50'
                >
                  + Add Document
                </button>
                <p className='text-xs text-gray-500 mt-2'>PDF (Max 10MB)</p>
                <input
                  ref={addDocInputRef}
                  type='file'
                  accept='application/pdf'
                  onChange={handleExistingDocAdd}
                  className='hidden'
                />
              </div>

              {/* Navigation */}
              <div className='flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-[#FFFFFF14]'>
                <button
                  onClick={() => setCurrentStep(1)}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className='px-6 py-3 rounded-lg font-semibold bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a] transition-colors'
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Upload Photos & Documents */}
        {currentStep === 2 && !isEditMode && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
              {/* Upload Section */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xl font-semibold text-white'>
                    Upload Photos & Documents
                  </h3>
                  {(assetPhotos.length > 0 || supportingDocs.length > 0) && (
                    <div className='flex items-center gap-4'>
                      {assetPhotos.length > 0 && (
                        <div className='flex items-center gap-2 px-3 py-1 bg-[#F1CB68]/20 border border-[#F1CB68]/50 rounded-full'>
                          <span className='text-[#F1CB68] text-sm font-medium'>
                            {assetPhotos.length} Photo{assetPhotos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {supportingDocs.length > 0 && (
                        <div className='flex items-center gap-2 px-3 py-1 bg-[#F1CB68]/20 border border-[#F1CB68]/50 rounded-full'>
                          <span className='text-[#F1CB68] text-sm font-medium'>
                            {supportingDocs.length} Document{supportingDocs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className='text-gray-400 text-sm mb-6'>
                  Provide clear photos of proof of ownership for your asset.
                  High-resolution images are recommended.
                </p>

                {/* Upload Areas Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  {/* Photos Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, 'photo')}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                      isDragging
                        ? 'border-[#F1CB68] bg-[#F1CB68]/5'
                        : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    }`}
                  >
                    <div className='flex flex-col items-center'>
                      {/* Image Icon */}
                      <div className='mb-4'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#F1CB68'
                          strokeWidth='2'
                        >
                          <rect x='3' y='3' width='18' height='18' rx='2' />
                          <circle cx='8.5' cy='8.5' r='1.5' />
                          <polyline points='21 15 16 10 5 21' />
                        </svg>
                      </div>
                      <p className='text-white font-medium mb-1'>Upload Photos</p>
                      <p className='text-gray-400 text-xs mb-4'>
                        JPG, PNG (Max 5MB)
                      </p>
                      <input
                        type='file'
                        id='photo-upload'
                        multiple
                        accept='image/*'
                        onChange={e => handleFileSelect(e, 'photo')}
                        className='hidden'
                      />
                      <label
                        htmlFor='photo-upload'
                        className='px-4 py-2 bg-[#F1CB68] text-[#0B0D12] rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#d4b55a] transition-colors inline-block'
                      >
                        Select Photos
                      </label>
                    </div>
                  </div>

                  {/* Documents Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, 'doc')}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                      isDragging
                        ? 'border-[#F1CB68] bg-[#F1CB68]/5'
                        : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    }`}
                  >
                    <div className='flex flex-col items-center'>
                      {/* Document Icon */}
                      <div className='mb-4'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#F1CB68'
                          strokeWidth='2'
                        >
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <polyline points='14 2 14 8 20 8' />
                          <line x1='16' y1='13' x2='8' y2='13' />
                          <line x1='16' y1='17' x2='8' y2='17' />
                        </svg>
                      </div>
                      <p className='text-white font-medium mb-1'>Upload Documents</p>
                      <p className='text-gray-400 text-xs mb-4'>
                        PDF only (Max 10MB)
                      </p>
                      <input
                        type='file'
                        id='doc-upload'
                        multiple
                        accept='application/pdf'
                        onChange={e => handleFileSelect(e, 'doc')}
                        className='hidden'
                      />
                      <label
                        htmlFor='doc-upload'
                        className='px-4 py-2 bg-[#F1CB68] text-[#0B0D12] rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#d4b55a] transition-colors inline-block'
                      >
                        Select Documents
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets Photos Section */}
              {assetPhotos.length > 0 && (
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <rect x='3' y='3' width='18' height='18' rx='2' />
                      <circle cx='8.5' cy='8.5' r='1.5' />
                      <polyline points='21 15 16 10 5 21' />
                    </svg>
                    Assets Photos ({assetPhotos.length})
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {assetPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] border border-[#FFFFFF14] rounded-xl p-4 hover:border-[#F1CB68]/50 transition-colors relative group'
                      >
                        {/* Thumbnail */}
                        <div className='w-16 h-16 rounded-lg overflow-hidden bg-[#1a1a1d] flex-shrink-0 border border-[#FFFFFF14]'>
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className='w-full h-full object-cover'
                          />
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate text-sm'>
                            {photo.name}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {photo.size} MB
                          </p>
                          {photo.status === 'uploading' ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <div className='flex-1 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-[#F1CB68] transition-all duration-300'
                                    style={{ width: `${photo.progress}%` }}
                                  />
                                </div>
                                <span className='text-xs text-gray-400 min-w-[3rem] text-right'>
                                  {photo.progress}%
                                </span>
                              </div>
                              <span className='text-xs text-[#F1CB68]'>
                                Uploading...
                              </span>
                            </div>
                          ) : photo.status === 'completed' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#10B981'
                                strokeWidth='2'
                              >
                                <path d='M20 6L9 17l-5-5' />
                              </svg>
                              <span className='text-xs text-green-400'>
                                Uploaded
                              </span>
                            </div>
                          ) : photo.status === 'error' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#EF4444'
                                strokeWidth='2'
                              >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M12 8v4M12 16h.01' />
                              </svg>
                              <span className='text-xs text-red-400'>
                                {photo.error || 'Upload failed'}
                              </span>
                            </div>
                          ) : (
                            <div className='mt-2 flex items-center gap-2'>
                              <span className='text-xs text-[#F1CB68]'>
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button - Cross Icon */}
                        <button
                          onClick={() => removeFile(photo.id, 'photo')}
                          className='text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0'
                          title='Remove photo'
                        >
                          <svg
                            width='18'
                            height='18'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          >
                            <path d='M18 6L6 18M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Documents Section */}
              {supportingDocs.length > 0 && (
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                      <polyline points='14 2 14 8 20 8' />
                      <line x1='16' y1='13' x2='8' y2='13' />
                      <line x1='16' y1='17' x2='8' y2='17' />
                      <polyline points='10 9 9 9 8 9' />
                    </svg>
                    Supporting Documents ({supportingDocs.length})
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {supportingDocs.map(doc => (
                      <div
                        key={doc.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] border border-[#FFFFFF14] rounded-xl p-4 hover:border-[#F1CB68]/50 transition-colors relative group'
                      >
                        {/* PDF/Document Icon */}
                        <div className='w-16 h-16 rounded-lg bg-[#F1CB68]/10 border border-[#F1CB68]/30 flex items-center justify-center flex-shrink-0'>
                          {doc.file.type === 'application/pdf' ? (
                            <svg
                              width='32'
                              height='32'
                              viewBox='0 0 24 24'
                              fill='#F1CB68'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z' />
                              <path d='M14 2v6h6' stroke='#F1CB68' fill='none' strokeWidth='1.5' />
                              <text
                                x='12'
                                y='17'
                                fontSize='6'
                                fill='#0B0D12'
                                textAnchor='middle'
                                fontWeight='bold'
                              >
                                PDF
                              </text>
                            </svg>
                          ) : (
                            <svg
                              width='32'
                              height='32'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='#F1CB68'
                              strokeWidth='2'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                              <polyline points='14 2 14 8 20 8' />
                            </svg>
                          )}
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate text-sm'>
                            {doc.name}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {doc.size} MB
                          </p>
                          {doc.status === 'uploading' ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <div className='flex-1 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-[#F1CB68] transition-all duration-300'
                                    style={{ width: `${doc.progress}%` }}
                                  />
                                </div>
                                <span className='text-xs text-gray-400 min-w-[3rem] text-right'>
                                  {doc.progress}%
                                </span>
                              </div>
                              <span className='text-xs text-[#F1CB68]'>
                                Uploading...
                              </span>
                            </div>
                          ) : doc.status === 'completed' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#10B981'
                                strokeWidth='2'
                              >
                                <path d='M20 6L9 17l-5-5' />
                              </svg>
                              <span className='text-xs text-green-400'>
                                Uploaded
                              </span>
                            </div>
                          ) : doc.status === 'error' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#EF4444'
                                strokeWidth='2'
                              >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M12 8v4M12 16h.01' />
                              </svg>
                              <span className='text-xs text-red-400'>
                                {doc.error || 'Upload failed'}
                              </span>
                            </div>
                          ) : (
                            <div className='mt-2 flex items-center gap-2'>
                              <span className='text-xs text-[#F1CB68]'>
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button - Cross Icon */}
                        <button
                          onClick={() => removeFile(doc.id, 'doc')}
                          className='text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0'
                          title='Remove document'
                        >
                          <svg
                            width='18'
                            height='18'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          >
                            <path d='M18 6L6 18M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-end'>
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Next Step'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Asset Valuation */}
        {currentStep === 3 && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
              {/* Title */}
              <div className='mb-8'>
                <h3 className='text-2xl font-semibold text-white mb-2'>
                  How would you like to determine the asset&apos;s value?
                </h3>
                <p className='text-gray-400 text-sm'>
                  Choose one of the two options below to set the current value
                  for your asset.
                </p>
              </div>

              {/* Option 1: Manual Value */}
              <div className='mb-6'>
                <div className='bg-[#2A2A2D] rounded-2xl p-6 border-2 border-transparent hover:border-[#F1CB68]/30 transition-colors'>
                  <h4 className='text-lg font-semibold text-white mb-2'>
                    Enter a Manual Value
                  </h4>
                  <p className='text-gray-400 text-sm mb-6'>
                    Provide your own estimated value for the asset. You can
                    update this later.
                  </p>

                  <div>
                    <label className='block text-sm font-medium text-gray-400 mb-2'>
                      Current Estimated Value ($)
                    </label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#F1CB68] font-semibold text-lg'>
                        $
                      </span>
                      <input
                        type='text'
                        value={estimatedValue}
                        onChange={e => setEstimatedValue(e.target.value)}
                        placeholder='00.0'
                        className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1d] border border-[#FFFFFF14] text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#F1CB68] transition-colors'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OR Divider */}
              <div className='flex items-center justify-center mb-6'>
                <div className='flex-1 h-px bg-[#FFFFFF14]'></div>
                <span className='px-4 text-gray-500 text-sm font-medium'>
                  OR
                </span>
                <div className='flex-1 h-px bg-[#FFFFFF14]'></div>
              </div>

              {/* Option 2: Professional Appraisal */}
              <div className='mb-8'>
                <div className={`bg-[#2A2A2D] rounded-2xl p-6 border-2 transition-colors ${
                  valuationType === 'appraisal'
                    ? 'border-[#F1CB68]'
                    : 'border-transparent hover:border-[#F1CB68]/30'
                }`}>
                  <h4 className='text-lg font-semibold text-white mb-2'>
                    Request a Professional Appraisal
                  </h4>
                  <p className='text-gray-400 text-sm mb-6'>
                    Initiate a formal appraisal process with a certified expert
                    to determine an accurate market value for your asset.
                  </p>

                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() =>
                        setValuationType(
                          valuationType === 'appraisal' ? 'manual' : 'appraisal'
                        )
                      }
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                        valuationType === 'appraisal'
                          ? 'bg-[#d4b55a] text-[#0B0D12] ring-2 ring-[#F1CB68] ring-offset-2 ring-offset-[#2A2A2D]'
                          : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                      }`}
                    >
                      {valuationType === 'appraisal'
                        ? '✓ Appraisal Requested'
                        : 'Request Appraisal'}
                    </button>
                    <button className='w-8 h-8 rounded-full border border-[#FFFFFF14] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#F1CB68] transition-colors'>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <path d='M12 16v-4M12 8h.01' />
                      </svg>
                    </button>
                  </div>

                  {valuationType === 'appraisal' && (
                    <p className='text-[#F1CB68] text-xs mt-4'>
                      A professional appraisal will be requested automatically
                      once you finish creating this asset. You can track its
                      status on the asset&apos;s detail page.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-[#FFFFFF14]'>
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Back
                </button>
                {submitError && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    isDarkMode ? 'bg-red-900/20 border border-red-500/50 text-red-400' : 'bg-red-50 border border-red-300 text-red-700'
                  }`}>
                    <div className='text-sm whitespace-pre-line'>{submitError}</div>
                  </div>
                )}
                <button
                  onClick={handleNext}
                  disabled={isSubmitting || hasActiveUploads}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting || hasActiveUploads
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                  }`}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving Changes...'
                      : 'Creating Asset...'
                    : hasActiveUploads
                    ? 'Uploading files…'
                    : isEditMode
                    ? 'Save Changes'
                    : 'Finish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
