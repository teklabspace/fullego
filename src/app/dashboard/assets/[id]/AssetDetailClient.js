'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AssetDetailClient() {
  const router = useRouter();
  const params = useParams();
  const { isDarkMode } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    targetPrice: '',
    saleNote: '',
  });
  const [appraisalType, setAppraisalType] = useState('');

  // Mock data - In production, fetch based on params.id
  const asset = {
    id: params.id,
    name: 'Urban Residential Property',
    status: 'Active Investment',
    lastUpdated: 'Last updated: 2 hours ago',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    ],
    propertyType: 'Residential',
    address: '123 Urban Heights, New York',
    acquisitionDate: 'June 10, 2021',
    size: '3,200 sq ft',
    yearBuilt: '2019',
    ownership: 'Sole Ownership',
    currentValue: '$2,850,000',
    valueChange: '+12.4%',
    valueChangeLabel: 'Since Purchase',
    lastAppraisal: 'March 15, 2023',
    monthlyRentalIncome: '$12,500',
    annualPropertyTax: '$24,800',
    maintenanceCosts: '$8,850',
    documents: [
      { name: 'Purchase Agreement', date: 'Jun 16, 2021' },
      { name: 'Insurance Documents', date: 'May 03, 2021' },
      { name: 'Latest Appraisal Report', date: 'Jan 04, 2023' },
      { name: 'Tax Records', date: 'Dec 23, 2023' },
    ],
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? asset.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev =>
      prev === asset.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSellSubmit = e => {
    e.preventDefault();
    console.log('Sell Request:', sellFormData);
    // Add API call here
    setShowSellModal(false);
    setSellFormData({ targetPrice: '', saleNote: '' });
  };

  const handleAppraisalSubmit = e => {
    e.preventDefault();
    console.log('Appraisal Request:', { type: appraisalType, asset: asset.id });
    // Add API call here
    setShowAppraisalModal(false);
    setAppraisalType('');
  };

  return (
    <DashboardLayout>
      <div className='pb-20'>
        {/* Breadcrumb */}
        <div className='mb-6 flex items-center gap-2 text-sm'>
          <button
            onClick={() => router.push('/dashboard/assets')}
            className='text-gray-400 hover:text-white transition-colors'
          >
            Assets
          </button>
          <span className='text-gray-600'>›</span>
          <button
            onClick={() => router.push('/dashboard/assets')}
            className='text-gray-400 hover:text-white transition-colors'
          >
            Real Estate
          </button>
          <span className='text-gray-600'>›</span>
          <span className='text-white'>Urban Residential Property</span>
        </div>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>{asset.name}</h1>
            <div className='flex items-center gap-3'>
              <span className='px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full'>
                {asset.status}
              </span>
              <span className='text-gray-400 text-sm'>{asset.lastUpdated}</span>
            </div>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setShowSellModal(true)}
              className='px-6 py-3 bg-[#F1CB68] text-[#0B0D12] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
            >
              Initiate Sale
            </button>
            <button
              onClick={() => setShowAppraisalModal(true)}
              className='px-6 py-3 bg-transparent border border-[#FFFFFF14] text-white rounded-lg font-semibold hover:bg-white/5 transition-colors'
            >
              Request Appraisal
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Images and Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Image Gallery */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl overflow-hidden'>
              {/* Main Image */}
              <div className='relative aspect-video bg-black'>
                <img
                  src={asset.images[currentImageIndex]}
                  alt={asset.name}
                  className='w-full h-full object-cover'
                />
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
                <div className='absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm'>
                  {currentImageIndex + 1}/{asset.images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
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
            </div>

            {/* Property Details */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6'>
                Property Details
              </h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Property Type</p>
                  <p className='text-white font-semibold'>
                    {asset.propertyType}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Address</p>
                  <p className='text-white font-semibold'>{asset.address}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Acquisition Date</p>
                  <p className='text-white font-semibold'>
                    {asset.acquisitionDate}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Size</p>
                  <p className='text-white font-semibold'>{asset.size}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Year Built</p>
                  <p className='text-white font-semibold'>{asset.yearBuilt}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Ownership</p>
                  <p className='text-white font-semibold'>{asset.ownership}</p>
                </div>
              </div>
            </div>

            {/* Value History Chart */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6'>
                Value History
              </h3>
              <div className='relative h-64'>
                {/* Simple line chart placeholder */}
                <svg
                  className='w-full h-full'
                  viewBox='0 0 400 200'
                  preserveAspectRatio='none'
                >
                  <defs>
                    <linearGradient
                      id='gradient'
                      x1='0%'
                      y1='0%'
                      x2='0%'
                      y2='100%'
                    >
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
                  <polyline
                    fill='url(#gradient)'
                    stroke='none'
                    points='0,180 50,160 100,150 150,140 200,120 250,110 300,100 350,90 400,80 400,200 0,200'
                  />
                  <polyline
                    fill='none'
                    stroke='#F1CB68'
                    strokeWidth='2'
                    points='0,180 50,160 100,150 150,140 200,120 250,110 300,100 350,90 400,80'
                  />
                </svg>
                {/* Axis labels */}
                <div className='absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2'>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            {/* Associated Documents */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6'>
                Associated Documents
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {asset.documents.map((doc, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-4 p-4 bg-[#2A2A2D] rounded-xl hover:bg-[#3A3A3D] transition-colors cursor-pointer'
                  >
                    <div className='w-10 h-10 bg-[#F1CB68]/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <img
                        src='/doc.svg'
                        alt='PDF'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-white font-medium truncate'>
                        {doc.name}
                      </p>
                      <p className='text-gray-400 text-sm'>{doc.date}</p>
                    </div>
                    <button className='text-gray-400 hover:text-white transition-colors'>
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
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Current Valuation
              </h3>
              <div className='mb-4'>
                <p className='text-3xl font-bold text-white mb-2'>
                  {asset.currentValue}
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-green-500 font-semibold'>
                    {asset.valueChange}
                  </span>
                  <span className='text-gray-400 text-sm'>
                    {asset.valueChangeLabel}
                  </span>
                </div>
              </div>
              <p className='text-gray-400 text-sm'>
                Last Appraisal: {asset.lastAppraisal}
              </p>
            </div>

            {/* Quick Actions */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <button className='w-full p-3 bg-[#2A2A2D] rounded-lg text-white hover:bg-[#3A3A3D] transition-colors flex items-center justify-between'>
                  <span>Transfer Ownership</span>
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
                </button>
                <button className='w-full p-3 bg-[#2A2A2D] rounded-lg text-white hover:bg-[#3A3A3D] transition-colors flex items-center justify-between'>
                  <span>Share Asset Details</span>
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
                </button>
                <button className='w-full p-3 bg-[#2A2A2D] rounded-lg text-white hover:bg-[#3A3A3D] transition-colors flex items-center justify-between'>
                  <span>Generate Report</span>
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
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Financial Summary
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>
                    Monthly Rental Income
                  </p>
                  <p className='text-white font-semibold text-lg'>
                    {asset.monthlyRentalIncome}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>
                    Annual Property Tax
                  </p>
                  <p className='text-white font-semibold text-lg'>
                    {asset.annualPropertyTax}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>
                    Maintenance Costs (YTD)
                  </p>
                  <p className='text-white font-semibold text-lg'>
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
              className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl w-full max-w-md sm:max-w-2xl my-8 max-h-[90vh] flex flex-col'
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className='border-b border-[#FFFFFF14] p-3 sm:p-6 flex items-center justify-between flex-shrink-0'>
                <h2 className='text-lg sm:text-2xl font-bold text-white'>
                  Request to Sell
                </h2>
                <button
                  onClick={() => setShowSellModal(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
                >
                  <span className='text-gray-400 text-2xl'>×</span>
                </button>
              </div>

              {/* Content */}
              <form
                onSubmit={handleSellSubmit}
                className='p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1'
              >
                {/* Asset Preview */}
                <div className='bg-[#2A2A2D] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                    <img
                      src={asset.images[0]}
                      alt={asset.name}
                      className='w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover mx-auto sm:mx-0'
                    />
                    <div className='flex-1 min-w-0 text-center sm:text-left'>
                      <h3 className='text-white font-semibold mb-2 text-base sm:text-lg truncate'>
                        {asset.name}
                      </h3>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <p className='text-xs text-gray-500'>Current Value</p>
                          <p className='text-white text-sm font-semibold'>
                            {asset.currentValue}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Category</p>
                          <p className='text-white text-sm'>
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
                    <label className='block text-sm font-medium text-white mb-2'>
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
                        className='w-full pl-8 pr-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors text-sm sm:text-base'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
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
                      className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none text-sm sm:text-base'
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6'>
                  <button
                    type='button'
                    onClick={() => setShowSellModal(false)}
                    className='w-full sm:w-auto flex-1 px-4 sm:px-6 py-3 bg-transparent border border-[#FFFFFF14] text-white rounded-lg font-semibold hover:bg-white/5 transition-colors text-sm sm:text-base'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='w-full sm:w-auto flex-1 px-4 sm:px-6 py-3 bg-[#F1CB68] text-[#0B0D12] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors text-sm sm:text-base'
                  >
                    Submit Request
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
              className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col'
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className='border-b border-[#FFFFFF14] p-4 sm:p-6 flex items-center justify-between flex-shrink-0'>
                <h2 className='text-xl sm:text-2xl font-bold text-white'>
                  Request Appraisal
                </h2>
                <button
                  onClick={() => setShowAppraisalModal(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
                >
                  <span className='text-gray-400 text-2xl'>×</span>
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
                    <h3 className='text-white font-semibold text-base sm:text-lg mb-1 truncate'>
                      {asset.name}
                    </h3>
                    <p className='text-gray-400 text-xs sm:text-sm truncate'>
                      {asset.propertyType} • {asset.address}
                    </p>
                  </div>
                </div>

                {/* Appraisal Type Selection */}
                <div className='mb-4 sm:mb-6'>
                  <label className='block text-sm font-medium text-white mb-3'>
                    Select Appraisal Type
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setAppraisalType('standard')}
                      className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                        appraisalType === 'standard'
                          ? 'border-[#F1CB68] bg-gradient-to-r from-[#222126] to-[#111116]'
                          : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      }`}
                    >
                      <h4 className='text-white font-semibold mb-1 text-sm sm:text-base'>
                        Standard Appraisal
                      </h4>
                      <p className='text-gray-400 text-xs sm:text-sm mb-1.5'>
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
                          ? 'border-[#F1CB68] bg-gradient-to-r from-[#222126] to-[#111116]'
                          : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      }`}
                    >
                      <h4 className='text-white font-semibold mb-1 text-sm sm:text-base'>
                        Comprehensive Appraisal
                      </h4>
                      <p className='text-gray-400 text-xs sm:text-sm mb-1.5'>
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
                          : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      }`}
                    >
                      <h4 className='text-white font-semibold mb-1 text-sm sm:text-base'>
                        Expedited Appraisal
                      </h4>
                      <p className='text-gray-400 text-xs sm:text-sm mb-1.5'>
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
                          : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      }`}
                    >
                      <h4 className='text-white font-semibold mb-1 text-sm sm:text-base'>
                        Insurance Appraisal
                      </h4>
                      <p className='text-gray-400 text-xs sm:text-sm mb-1.5'>
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
                    <p className='text-xs sm:text-sm text-gray-300'>
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
                    className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-transparent border border-[#FFFFFF14] text-white rounded-lg font-semibold hover:bg-white/5 transition-colors text-sm'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={!appraisalType}
                    className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F1CB68] text-[#0B0D12] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                  >
                    Submit Request
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

