'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
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
  deleteAsset,
  requestAssetSale,
  requestAssetAppraisal,
  formatCurrency,
} from '@/utils/assetsApi';
import AssetCardSkeleton from '@/components/skeletons/AssetCardSkeleton';

export default function AssetsPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    saleNote: '',
    targetPrice: '',
  });
  const [appraisalType, setAppraisalType] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingSell, setSubmittingSell] = useState(false);
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);

  // Fetch assets from API
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: 'created_at',
        order: 'desc',
      };

      const response = await getAssets(params);

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
  }, [selectedCategory, router]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

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
    router.push(`/dashboard/assets/detail?id=${asset.id}`);
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
  };

  const handleSubmitSellRequest = async () => {
    try {
      setSubmittingSell(true);
      await requestAssetSale(selectedAsset.id, {
        targetPrice: sellFormData.targetPrice ? parseFloat(sellFormData.targetPrice.replace(/[^0-9.-]+/g, '')) : undefined,
        saleNote: sellFormData.saleNote || undefined,
      });
      alert('Sell request submitted successfully!');
      setShowSellModal(false);
      setSellFormData({ saleNote: '', targetPrice: '' });
    } catch (err) {
      console.error('Error submitting sell request:', err);
      alert(err.message || 'Failed to submit sell request');
    } finally {
      setSubmittingSell(false);
    }
  };

  const handleSubmitAppraisal = async () => {
    try {
      setSubmittingAppraisal(true);
      await requestAssetAppraisal(selectedAsset.id, {
        appraisalType: appraisalType,
      });
      alert(`${appraisalType} appraisal request submitted successfully!`);
      setShowAppraisalModal(false);
      setAppraisalType(null);
    } catch (err) {
      console.error('Error submitting appraisal request:', err);
      alert(err.message || 'Failed to submit appraisal request');
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  const handleDeleteAsset = () => {
    fetchAssets();
  };

  return (
    <DashboardLayout>
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
          <p className='text-sm mb-4'>Get started by adding your first asset</p>
          <button
            onClick={() => router.push('/dashboard/assets/add')}
            className='px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
          >
            Add New Asset
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isDarkMode={isDarkMode}
              onViewDetails={() => handleViewDetails(asset)}
              onRequestSell={() => handleRequestSell(asset)}
              onRequestAppraisal={() => handleRequestAppraisal(asset)}
              onDelete={handleDeleteAsset}
            />
          ))}
        </div>
      )}

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
          onSubmit={handleSubmitAppraisal}
          onClose={() => setShowAppraisalModal(false)}
          submitting={submittingAppraisal}
        />
      )}
    </DashboardLayout>
  );
}

// Asset Card Component
function AssetCard({
  asset,
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

            // Format dates
            if (lowerName.includes('date') && value) {
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
          {categoryGroup === 'Assets' && (
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
            disabled={submittingSell}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
              submittingSell
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014]'
            }`}
          >
            {submittingSell ? (
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
  onSubmit,
  onClose,
  submitting = false,
}) {
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
                className={`
                  text-left p-4 sm:p-5 rounded-xl border-2 transition-all
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
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-[#F1CB68]/20 rounded-lg flex items-center justify-center shrink-0'>
                    <span className='text-xl sm:text-2xl'>👨‍💼</span>
                  </div>
                  {selectedType === 'Concierge' && (
                    <div className='w-5 h-5 sm:w-6 sm:h-6 bg-[#F1CB68] rounded-full flex items-center justify-center shrink-0'>
                      <span className='text-white text-xs sm:text-sm'>✓</span>
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
                  <span className='text-[#F1CB68]'>⏱ 3-5 business days</span>
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
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-[#F1CB68]/20 rounded-lg flex items-center justify-center shrink-0'>
                    <span className='text-xl sm:text-2xl'>🤖</span>
                  </div>
                  {selectedType === 'API' && (
                    <div className='w-5 h-5 sm:w-6 sm:h-6 bg-[#F1CB68] rounded-full flex items-center justify-center shrink-0'>
                      <span className='text-white text-xs sm:text-sm'>✓</span>
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
                  <span className='text-[#10B981]'>⚡ Instant</span>
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
            disabled={!selectedType || submitting}
            className={`
              flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base
              ${
                submitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : selectedType
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
