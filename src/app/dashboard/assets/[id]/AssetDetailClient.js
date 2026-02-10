'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AssetDetailSkeleton from '@/components/skeletons/AssetDetailSkeleton';
import { useTheme } from '@/context/ThemeContext';
import
  {
    formatCurrency,
    formatDate,
    generateAssetReport,
    getAsset,
    getAssetDocuments,
    getAssetValueHistory,
    requestAssetAppraisal,
    requestAssetSale,
    shareAssetDetails,
    transferAssetOwnership,
  } from '@/utils/assetsApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssetDetailClient({ assetId: propAssetId }) {
  const router = useRouter();
  const params = useParams(); // Returns {} if not in dynamic route
  const { isDarkMode } = useTheme();
  
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
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    targetPrice: '',
    saleNote: '',
  });
  const [appraisalType, setAppraisalType] = useState('');
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [valueHistory, setValueHistory] = useState([]);
  const [submittingSell, setSubmittingSell] = useState(false);
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

  // Fetch asset data
  useEffect(() => {
    if (!assetId) {
      setError('Asset ID is required');
      setLoading(false);
      return;
    }
    
    const fetchAssetData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch asset details
        const assetResponse = await getAsset(assetId);
        const assetData = assetResponse.data;
        
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
            const docsResponse = await getAssetDocuments(assetId);
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
            const historyResponse = await getAssetValueHistory(assetId);
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

    if (assetId) {
      fetchAssetData();
    }
  }, [assetId]);

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

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingSell(true);
      await requestAssetSale(asset.id, {
        targetPrice: sellFormData.targetPrice ? parseFloat(sellFormData.targetPrice.replace(/[^0-9.-]+/g, '')) : undefined,
        saleNote: sellFormData.saleNote || undefined,
      });
      alert('Sell request submitted successfully!');
      setShowSellModal(false);
      setSellFormData({ targetPrice: '', saleNote: '' });
    } catch (err) {
      console.error('Error submitting sell request:', err);
      alert(err.message || 'Failed to submit sell request');
    } finally {
      setSubmittingSell(false);
    }
  };

  const handleAppraisalSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAppraisal(true);
      await requestAssetAppraisal(asset.id, {
        appraisalType: appraisalType,
      });
      alert(`${appraisalType} appraisal request submitted successfully!`);
      setShowAppraisalModal(false);
      setAppraisalType('');
    } catch (err) {
      console.error('Error submitting appraisal request:', err);
      alert(err.message || 'Failed to submit appraisal request');
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
      alert(`Asset transferred successfully to ${transferData.newOwnerEmail}!`);
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
      if (response.data?.shareLink) {
        // Copy to clipboard
        await navigator.clipboard.writeText(response.data.shareLink);
        alert('Share link copied to clipboard!');
      } else {
        alert('Asset shared successfully!');
      }
      setShowShareModal(false);
      setShareData({ email: '', expiresIn: 7 });
    } catch (err) {
      console.error('Error sharing asset:', err);
      alert(err.message || 'Failed to share asset');
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
        alert('Report generated successfully!');
      } else {
        alert('Report generation initiated. You will be notified when it\'s ready.');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert(err.message || 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDocumentDownload = (docUrl, docName) => {
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      alert('Document URL not available');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <AssetDetailSkeleton isDarkMode={isDarkMode} />
      </DashboardLayout>
    );
  }

  if (error || !asset) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
            <div className='flex items-center gap-3'>
              <span className='px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full'>
                {asset.status}
              </span>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{asset.lastUpdated}</span>
            </div>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setShowSellModal(true)}
              disabled={submittingSell}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                submittingSell
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
              }`}
            >
              {submittingSell ? (
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
                'Initiate Sale'
              )}
            </button>
            <button
              onClick={() => setShowAppraisalModal(true)}
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
                Last Appraisal: {asset.lastAppraisal}
              </p>
            </div>

            {/* Quick Actions */}
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

        {/* Request to Sell Modal */}
        {showSellModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
            onClick={() => setShowSellModal(false)}
          >
            <div
              className={`border rounded-2xl w-full max-w-md sm:max-w-2xl my-8 max-h-[90vh] flex flex-col ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                  : 'bg-white border-gray-300'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`border-b p-3 sm:p-6 flex items-center justify-between flex-shrink-0 ${
                isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Request to Sell
                </h2>
                <button
                  onClick={() => setShowSellModal(false)}
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
                onSubmit={handleSellSubmit}
                className='p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1'
              >
                {/* Asset Preview */}
                <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-50'
                }`}>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                    <img
                      src={asset.images[0]}
                      alt={asset.name}
                      className='w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover mx-auto sm:mx-0'
                    />
                    <div className='flex-1 min-w-0 text-center sm:text-left'>
                      <h3 className={`font-semibold mb-2 text-base sm:text-lg truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {asset.name}
                      </h3>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-600'
                          }`}>Current Value</p>
                          <p className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {asset.currentValue}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-600'
                          }`}>Category</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {asset.propertyType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-4'>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Target Price
                    </label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#F1CB68] font-semibold'>
                        $
                      </span>
                      <input
                        type='text'
                        value={sellFormData.targetPrice}
                        onChange={e =>
                          setSellFormData({
                            ...sellFormData,
                            targetPrice: e.target.value,
                          })
                        }
                        placeholder='Enter your target price'
                        className={`w-full pl-8 pr-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors text-sm sm:text-base ${
                          isDarkMode
                            ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Sale Notes (Optional)
                    </label>
                    <textarea
                      value={sellFormData.saleNote}
                      onChange={e =>
                        setSellFormData({
                          ...sellFormData,
                          saleNote: e.target.value,
                        })
                      }
                      placeholder='Add any additional notes or requirements for the sale...'
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none text-sm sm:text-base ${
                        isDarkMode
                          ? 'bg-[#2A2A2D] border-[#FFFFFF14] text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6'>
                  <button
                    type='button'
                    onClick={() => setShowSellModal(false)}
                    className={`w-full sm:w-auto flex-1 px-4 sm:px-6 py-3 bg-transparent border rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      isDarkMode
                        ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={submittingSell}
                    className={`w-full sm:w-auto flex-1 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      submittingSell
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
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
              </form>
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

                {/* Appraisal Type Selection */}
                <div className='mb-4 sm:mb-6'>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Select Appraisal Type
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setAppraisalType('standard')}
                      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                        appraisalType === 'standard'
                          ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                          : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Standard Appraisal
                      </h4>
                      <p className={`text-xs sm:text-sm mb-1.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Basic valuation report within 5-7 business days
                      </p>
                      <p className='text-[#F1CB68] font-semibold text-sm'>
                        $500
                      </p>
                    </button>

                    <button
                      type='button'
                      onClick={() => setAppraisalType('comprehensive')}
                      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                        appraisalType === 'comprehensive'
                          ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                          : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Comprehensive Appraisal
                      </h4>
                      <p className={`text-xs sm:text-sm mb-1.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Detailed valuation with market analysis
                      </p>
                      <p className='text-[#F1CB68] font-semibold text-sm'>
                        $1,200
                      </p>
                    </button>

                    <button
                      type='button'
                      onClick={() => setAppraisalType('expedited')}
                      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                        appraisalType === 'expedited'
                          ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                          : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Expedited Appraisal
                      </h4>
                      <p className={`text-xs sm:text-sm mb-1.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Fast-track service within 48 hours
                      </p>
                      <p className='text-[#F1CB68] font-semibold text-sm'>
                        $850
                      </p>
                    </button>

                    <button
                      type='button'
                      onClick={() => setAppraisalType('insurance')}
                      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                        appraisalType === 'insurance'
                          ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50 bg-white/5'
                          : 'border-gray-300 hover:border-[#F1CB68]/50 bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 text-sm sm:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Insurance Appraisal
                      </h4>
                      <p className={`text-xs sm:text-sm mb-1.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Specialized for insurance purposes
                      </p>
                      <p className='text-[#F1CB68] font-semibold text-sm'>
                        $750
                      </p>
                    </button>
                  </div>
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
                    disabled={!appraisalType || submittingAppraisal}
                    className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm ${
                      submittingAppraisal
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : !appraisalType
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
    </DashboardLayout>
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

