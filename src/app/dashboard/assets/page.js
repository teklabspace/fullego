'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';

export default function AssetsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    saleNote: '',
    targetPrice: '',
  });
  const [appraisalType, setAppraisalType] = useState(null);

  // Dummy asset data
  const assets = [
    {
      id: 1,
      name: 'Sunseeker Manhattan 68',
      category: 'Yachts',
      location: 'Monaco',
      estimatedValue: '$4,250,000',
      lastAppraisal: '2024-01-15',
      image:
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
      condition: 'Excellent',
      description:
        'Luxury motor yacht with state-of-the-art navigation systems and luxurious interiors.',
      specifications: {
        year: '2022',
        length: '68 ft',
        capacity: '12 guests',
      },
    },
    {
      id: 2,
      name: 'Gulfstream G650',
      category: 'Private Jets',
      location: 'New York',
      estimatedValue: '$54,000,000',
      lastAppraisal: '2024-01-10',
      image:
        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
      condition: 'Pristine',
      description:
        'Ultra-long-range business jet with cutting-edge technology and supreme comfort.',
      specifications: {
        year: '2023',
        range: '7,000 nm',
        capacity: '19 passengers',
      },
    },
    {
      id: 3,
      name: 'Manhattan Penthouse',
      category: 'Real Estate',
      location: 'New York',
      estimatedValue: '$25,000,000',
      lastAppraisal: '2024-01-20',
      image:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      condition: 'Excellent',
      description:
        'Stunning penthouse with panoramic city views and modern architecture.',
      specifications: {
        sqft: '6,500',
        bedrooms: '5',
        bathrooms: '6',
      },
    },
    {
      id: 4,
      name: 'Ferrari SF90 Stradale',
      category: 'Vehicles',
      location: 'Dubai',
      estimatedValue: '$625,000',
      lastAppraisal: '2023-12-05',
      image:
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
      condition: 'Mint',
      description:
        'Hybrid supercar combining performance with cutting-edge technology.',
      specifications: {
        year: '2023',
        mileage: '1,200 miles',
        horsepower: '986 hp',
      },
    },
    {
      id: 5,
      name: 'Picasso Original 1932',
      category: 'Art & Collectibles',
      location: 'London',
      estimatedValue: '$15,000,000',
      lastAppraisal: '2023-11-28',
      image:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
      condition: 'Excellent',
      description: 'Rare original Picasso painting from his cubist period.',
      specifications: {
        artist: 'Pablo Picasso',
        year: '1932',
        medium: 'Oil on Canvas',
      },
    },
    {
      id: 6,
      name: 'Azimut Grande 27M',
      category: 'Yachts',
      location: 'Miami',
      estimatedValue: '$8,500,000',
      lastAppraisal: '2024-01-08',
      image:
        'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80',
      condition: 'Excellent',
      description:
        'Italian luxury yacht with elegant design and superior performance.',
      specifications: {
        year: '2023',
        length: '88 ft',
        capacity: '10 guests',
      },
    },
    {
      id: 7,
      name: 'Bombardier Global 7500',
      category: 'Private Jets',
      location: 'Los Angeles',
      estimatedValue: '$75,000,000',
      lastAppraisal: '2024-01-12',
      image:
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
      condition: 'Pristine',
      description:
        "World's largest and longest-range purpose-built business jet.",
      specifications: {
        year: '2024',
        range: '7,700 nm',
        capacity: '19 passengers',
      },
    },
    {
      id: 8,
      name: 'Beverly Hills Estate',
      category: 'Real Estate',
      location: 'Los Angeles',
      estimatedValue: '$45,000,000',
      lastAppraisal: '2023-12-18',
      image:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      condition: 'Excellent',
      description:
        'Magnificent estate with pool, tennis court, and panoramic views.',
      specifications: {
        sqft: '15,000',
        bedrooms: '8',
        bathrooms: '12',
      },
    },
  ];

  const categories = [
    { id: 'all', name: 'All Assets', icon: 'AllAssets.svg' },
    { id: 'Yachts', name: 'Yachts', icon: '' },
    { id: 'Private Jets', name: 'Private Jets', icon: 'Jets.svg' },
    { id: 'Real Estate', name: 'Real Estate', icon: 'Realstat.svg' },
    { id: 'Vehicles', name: 'Vehicles', icon: 'vehicels.svg' },
    {
      id: 'Art & Collectibles',
      name: 'Art & Collectibles',
      icon: 'Art_collectibles.svg',
    },
    {
      id: 'Watches & Jewelry',
      name: 'Watches & Jewelry',
      icon: 'watches_jawelry.svg',
    },
  ];

  const filteredAssets =
    selectedCategory === 'all'
      ? assets
      : assets.filter(asset => asset.category === selectedCategory);

  const handleViewDetails = asset => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
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

  const handleSubmitSellRequest = () => {
    // Here you would submit the sell request
    console.log('Sell Request:', { asset: selectedAsset, ...sellFormData });
    alert('Sell request submitted successfully!');
    setShowSellModal(false);
  };

  const handleSubmitAppraisal = () => {
    // Here you would submit the appraisal request
    console.log('Appraisal Request:', {
      asset: selectedAsset,
      type: appraisalType,
    });
    alert(`${appraisalType} appraisal request submitted successfully!`);
    setShowAppraisalModal(false);
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
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-3'>
            Manage Your Luxury Portfolio
          </h1>
          <p className='text-gray-200 text-lg mb-6 max-w-2xl'>
            Track, monitor, and manage your high-value assets in one place
          </p>
          <div className='flex gap-4'>
            <button className='bg-[#F1CB68]  text-[#101014] px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2'>
              <span>
                <img src='/AssestSpark.svg' alt='Add' />
              </span>{' '}
              Add New Asset
            </button>
            <button className='bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/20'>
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
              px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 w-auto
              ${
                selectedCategory === category.id
                  ? 'bg-[#D4AF37] text-[#101014]'
                  : 'bg-transparent border border-[#FFFFFF14] text-gray-400 hover:text-white hover:border-[#D4AF37]/50'
              }
            `}
          >
            {category.icon && (
              <img
                src={`/${category.icon}`}
                alt={category.name}
                className='w-5 h-5'
              />
            )}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredAssets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onViewDetails={() => handleViewDetails(asset)}
            onRequestSell={() => handleRequestSell(asset)}
            onRequestAppraisal={() => handleRequestAppraisal(asset)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAsset && (
        <DetailModal
          asset={selectedAsset}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Sell Request Modal */}
      {showSellModal && selectedAsset && (
        <SellModal
          asset={selectedAsset}
          formData={sellFormData}
          onChange={setSellFormData}
          onSubmit={handleSubmitSellRequest}
          onClose={() => setShowSellModal(false)}
        />
      )}

      {/* Appraisal Request Modal */}
      {showAppraisalModal && selectedAsset && (
        <AppraisalModal
          asset={selectedAsset}
          selectedType={appraisalType}
          onSelectType={setAppraisalType}
          onSubmit={handleSubmitAppraisal}
          onClose={() => setShowAppraisalModal(false)}
        />
      )}
    </DashboardLayout>
  );
}

// Asset Card Component
function AssetCard({
  asset,
  onViewDetails,
  onRequestSell,
  onRequestAppraisal,
}) {
  return (
    <div className='bg-transparent border border-[#FFFFFF14] rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group'>
      {/* Image */}
      <div className='relative h-48 overflow-hidden'>
        <img
          src={asset.image}
          alt={asset.name}
          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
        />
        <button className='absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors'>
          <span className='text-white text-lg'>⋯</span>
        </button>
      </div>

      {/* Content */}
      <div className='p-5'>
        <h3 className='text-white font-semibold text-lg mb-2'>{asset.name}</h3>
        <div className='flex items-center gap-2 text-sm text-gray-400 mb-4'>
          <span>{asset.category}</span>
          <span>•</span>
          <span>{asset.location}</span>
        </div>

        {/* Value and Appraisal */}
        <div className='flex justify-between items-center mb-4'>
          <div>
            <p className='text-xs text-gray-500 mb-1'>Estimated Value</p>
            <p className='text-white font-semibold text-lg'>
              {asset.estimatedValue}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500 mb-1'>Last Appraisal</p>
            <p className='text-gray-400 text-sm'>{asset.lastAppraisal}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-2'>
          <button
            onClick={onViewDetails}
            className='w-full bg-[#D4AF37] hover:bg-[#BF9B30] text-[#101014] py-2.5 rounded-lg font-semibold transition-colors'
          >
            View Details
          </button>
          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={onRequestSell}
              className='bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors border border-[#FFFFFF14]'
            >
              Request to Sell
            </button>
            <button
              onClick={onRequestAppraisal}
              className='bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors border border-[#FFFFFF14]'
            >
              Request Appraisal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({ asset, onClose }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'>
      <div className='bg-[#1A1A1D] border border-[#FFFFFF14] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-[#1A1A1D] border-b border-[#FFFFFF14] p-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-white'>Asset Details</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
          >
            <span className='text-gray-400 text-2xl'>×</span>
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Image */}
          <div className='rounded-xl overflow-hidden mb-6'>
            <img
              src={asset.image}
              alt={asset.name}
              className='w-full h-64 object-cover'
            />
          </div>

          {/* Info Grid */}
          <div className='grid grid-cols-2 gap-6 mb-6'>
            <div>
              <h3 className='text-white font-semibold text-xl mb-2'>
                {asset.name}
              </h3>
              <div className='flex items-center gap-2 text-gray-400 mb-4'>
                <span>{asset.category}</span>
                <span>•</span>
                <span>{asset.location}</span>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-500 mb-1'>Estimated Value</p>
              <p className='text-[#D4AF37] font-bold text-2xl'>
                {asset.estimatedValue}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className='mb-6'>
            <h4 className='text-white font-semibold mb-2'>Description</h4>
            <p className='text-gray-400'>{asset.description}</p>
          </div>

          {/* Specifications */}
          <div className='mb-6'>
            <h4 className='text-white font-semibold mb-3'>Specifications</h4>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {Object.entries(asset.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className='bg-white/5 border border-[#FFFFFF14] rounded-lg p-3'
                >
                  <p className='text-xs text-gray-500 mb-1 capitalize'>{key}</p>
                  <p className='text-white font-medium'>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div className='bg-white/5 border border-[#FFFFFF14] rounded-lg p-4'>
              <p className='text-xs text-gray-500 mb-1'>Condition</p>
              <p className='text-white font-medium'>{asset.condition}</p>
            </div>
            <div className='bg-white/5 border border-[#FFFFFF14] rounded-lg p-4'>
              <p className='text-xs text-gray-500 mb-1'>Last Appraisal</p>
              <p className='text-white font-medium'>{asset.lastAppraisal}</p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <button className='flex-1 bg-[#D4AF37] hover:bg-[#BF9B30] text-[#101014] py-3 rounded-lg font-semibold transition-colors'>
              Edit Asset
            </button>
            <button className='flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-colors border border-[#FFFFFF14]'>
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sell Request Modal Component
function SellModal({ asset, formData, onChange, onSubmit, onClose }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'>
      <div className='bg-[#1A1A1D] border border-[#FFFFFF14] rounded-2xl max-w-2xl w-full'>
        {/* Header */}
        <div className='border-b border-[#FFFFFF14] p-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-white'>Request to Sell</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
          >
            <span className='text-gray-400 text-2xl'>×</span>
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Asset Summary */}
          <div className='bg-white/5 border border-[#FFFFFF14] rounded-lg p-4 mb-6'>
            <h3 className='text-white font-semibold mb-3'>
              Confirm Asset Details
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Asset Name</p>
                <p className='text-white'>{asset.name}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Category</p>
                <p className='text-white'>{asset.category}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Current Value</p>
                <p className='text-[#D4AF37] font-semibold'>
                  {asset.estimatedValue}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Condition</p>
                <p className='text-white'>{asset.condition}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className='space-y-4 mb-6'>
            <div>
              <label className='block text-white text-sm font-medium mb-2'>
                Target Price (Optional)
              </label>
              <input
                type='text'
                value={formData.targetPrice}
                onChange={e =>
                  onChange({ ...formData, targetPrice: e.target.value })
                }
                placeholder='Enter your target price'
                className='w-full bg-white/5 border border-[#FFFFFF14] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors'
              />
            </div>

            <div>
              <label className='block text-white text-sm font-medium mb-2'>
                Sale Notes
              </label>
              <textarea
                value={formData.saleNote}
                onChange={e =>
                  onChange({ ...formData, saleNote: e.target.value })
                }
                placeholder='Add any additional information about the sale...'
                rows={4}
                className='w-full bg-white/5 border border-[#FFFFFF14] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none'
              />
            </div>
          </div>

          {/* Info Box */}
          <div className='bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 mb-6'>
            <p className='text-[#D4AF37] text-sm'>
              <strong>Note:</strong> Our team will review your request and
              contact you within 24-48 hours with next steps and potential
              buyers.
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-colors border border-[#FFFFFF14]'
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className='flex-1 bg-[#D4AF37] hover:bg-[#BF9B30] text-[#101014] py-3 rounded-lg font-semibold transition-colors'
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Appraisal Request Modal Component
function AppraisalModal({
  asset,
  selectedType,
  onSelectType,
  onSubmit,
  onClose,
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'>
      <div className='bg-[#1A1A1D] border border-[#FFFFFF14] rounded-2xl max-w-2xl w-full'>
        {/* Header */}
        <div className='border-b border-[#FFFFFF14] p-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-white'>Request Appraisal</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
          >
            <span className='text-gray-400 text-2xl'>×</span>
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Asset Info */}
          <div className='flex items-center gap-4 mb-6 pb-6 border-b border-[#FFFFFF14]'>
            <img
              src={asset.image}
              alt={asset.name}
              className='w-20 h-20 rounded-lg object-cover'
            />
            <div>
              <h3 className='text-white font-semibold text-lg'>{asset.name}</h3>
              <p className='text-gray-400 text-sm'>
                {asset.category} • {asset.location}
              </p>
              <p className='text-[#D4AF37] font-semibold mt-1'>
                Current Value: {asset.estimatedValue}
              </p>
            </div>
          </div>

          {/* Appraisal Options */}
          <div className='mb-6'>
            <h3 className='text-white font-semibold mb-4'>
              Choose Appraisal Method
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Concierge Option */}
              <button
                onClick={() => onSelectType('Concierge')}
                className={`
                  text-left p-5 rounded-xl border-2 transition-all
                  ${
                    selectedType === 'Concierge'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-[#FFFFFF14] hover:border-[#D4AF37]/50 bg-white/5'
                  }
                `}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center'>
                    <span className='text-2xl'>👨‍💼</span>
                  </div>
                  {selectedType === 'Concierge' && (
                    <div className='w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm'>✓</span>
                    </div>
                  )}
                </div>
                <h4 className='text-white font-semibold mb-2'>
                  Concierge Service
                </h4>
                <p className='text-gray-400 text-sm mb-3'>
                  Expert human appraisal with detailed report and
                  recommendations.
                </p>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-[#D4AF37]'>⏱ 3-5 business days</span>
                  <span className='text-gray-500'>•</span>
                  <span className='text-gray-400'>Premium</span>
                </div>
              </button>

              {/* API Option */}
              <button
                onClick={() => onSelectType('API')}
                className={`
                  text-left p-5 rounded-xl border-2 transition-all
                  ${
                    selectedType === 'API'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-[#FFFFFF14] hover:border-[#D4AF37]/50 bg-white/5'
                  }
                `}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center'>
                    <span className='text-2xl'>🤖</span>
                  </div>
                  {selectedType === 'API' && (
                    <div className='w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center'>
                      <span className='text-white text-sm'>✓</span>
                    </div>
                  )}
                </div>
                <h4 className='text-white font-semibold mb-2'>
                  Automated Appraisal
                </h4>
                <p className='text-gray-400 text-sm mb-3'>
                  Instant AI-powered valuation using market data and comparable
                  sales.
                </p>
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-[#10B981]'>⚡ Instant</span>
                  <span className='text-gray-500'>•</span>
                  <span className='text-gray-400'>Standard</span>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Type Info */}
          {selectedType && (
            <div className='bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 mb-6'>
              <p className='text-[#D4AF37] text-sm'>
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

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-semibold transition-colors border border-[#FFFFFF14]'
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!selectedType}
              className={`
                flex-1 py-3 rounded-lg font-semibold transition-colors
                ${
                  selectedType
                    ? 'bg-[#D4AF37] hover:bg-[#BF9B30] text-[#101014]'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
