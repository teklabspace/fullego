'use client';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export default function MarketplacePage() {
  const { isDarkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState('price-low-high');
  const [assetTypes, setAssetTypes] = useState({
    'Real Estate': false,
    Bonds: false,
    Equity: false,
    Others: false,
  });
  const [priceRange, setPriceRange] = useState([100, 10000]);
  const [returnRange, setReturnRange] = useState([1, 30]);

  const categories = [
    'All',
    'Private Equity',
    'Real Estate',
    'Private Credit',
    'Alternatives',
    'Funds',
    'Deals',
    'Arts & Collectibles',
  ];

  const marketData = [
    { name: 'Private Equity', value: '+2.4%', isPositive: true },
    { name: 'Real Estate', value: '+1.2%', isPositive: true },
    { name: 'Private Credit', value: '-0.7%', isPositive: false },
  ];

  const chartData = [
    { value: 20 },
    { value: 35 },
    { value: 25 },
    { value: 45 },
    { value: 38 },
    { value: 52 },
    { value: 48 },
    { value: 60 },
  ];

  const watchlistItems = [
    { name: 'Global Healthcare Fund', icon: '⭐' },
    { name: 'Asia Growth Markets', icon: '⭐' },
    { name: 'Sustainable Infrastructure', icon: '⭐' },
  ];

  const allInvestmentFunds = [
    {
      id: 1,
      name: 'European Logistic Funds',
      category: 'Real Estate',
      assetType: 'Real Estate',
      minimum: '€250,000',
      minimumValue: 250000,
      targetIRR: '14.5%',
      returnValue: 14.5,
      riskLevel: 'Medium',
      type: '#Service',
      subType: '#Commercial',
    },
    {
      id: 2,
      name: 'Next-Gen Technology Fund',
      category: 'Private Equity',
      assetType: 'Equity',
      minimum: '$500,000',
      minimumValue: 500000,
      targetIRR: '22.7%',
      returnValue: 22.7,
      riskLevel: 'High',
      type: '#Technology',
      subType: '#Growth',
    },
    {
      id: 3,
      name: 'Urban Residential Portfolio',
      category: 'Real Estate',
      assetType: 'Real Estate',
      minimum: '€350,000',
      minimumValue: 350000,
      targetIRR: '9.2%',
      returnValue: 9.2,
      riskLevel: 'Low',
      type: '#Residential',
      subType: '#USA',
    },
    {
      id: 4,
      name: 'Corporate Bond Portfolio',
      category: 'Private Credit',
      assetType: 'Bonds',
      minimum: '$150,000',
      minimumValue: 150000,
      targetIRR: '7.5%',
      returnValue: 7.5,
      riskLevel: 'Low',
      type: '#Fixed Income',
      subType: '#Corporate',
    },
    {
      id: 5,
      name: 'Healthcare Innovation Fund',
      category: 'Private Equity',
      assetType: 'Equity',
      minimum: '$750,000',
      minimumValue: 750000,
      targetIRR: '28.3%',
      returnValue: 28.3,
      riskLevel: 'High',
      type: '#Healthcare',
      subType: '#Growth',
    },
    {
      id: 6,
      name: 'Infrastructure Bonds',
      category: 'Alternatives',
      assetType: 'Bonds',
      minimum: '$200,000',
      minimumValue: 200000,
      targetIRR: '6.8%',
      returnValue: 6.8,
      riskLevel: 'Low',
      type: '#Infrastructure',
      subType: '#Fixed',
    },
  ];

  // Toggle asset type filter
  const toggleAssetType = type => {
    setAssetTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filter and sort logic
  const getFilteredFunds = () => {
    let filtered = [...allInvestmentFunds];

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(fund => fund.category === activeCategory);
    }

    // Filter by asset type
    const selectedAssetTypes = Object.keys(assetTypes).filter(
      key => assetTypes[key]
    );
    if (selectedAssetTypes.length > 0) {
      filtered = filtered.filter(fund =>
        selectedAssetTypes.includes(fund.assetType)
      );
    }

    // Filter by price range (convert to thousands for comparison)
    filtered = filtered.filter(fund => {
      const minValue = fund.minimumValue;
      return (
        minValue >= priceRange[0] * 1000 && minValue <= priceRange[1] * 1000
      );
    });

    // Filter by return range
    filtered = filtered.filter(fund => {
      const returnVal = fund.returnValue;
      return returnVal >= returnRange[0] && returnVal <= returnRange[1];
    });

    // Sort
    if (sortBy === 'price-low-high') {
      filtered.sort((a, b) => a.minimumValue - b.minimumValue);
    } else if (sortBy === 'price-high-low') {
      filtered.sort((a, b) => b.minimumValue - a.minimumValue);
    } else if (sortBy === 'return-low-high') {
      filtered.sort((a, b) => a.returnValue - b.returnValue);
    } else if (sortBy === 'return-high-low') {
      filtered.sort((a, b) => b.returnValue - a.returnValue);
    }

    return filtered;
  };

  const investmentFunds = getFilteredFunds();

  return (
    <div
      className={`flex h-screen ${isDarkMode ? 'bg-brand-bg' : 'bg-gray-50'}`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          <div>
            {/* Hero Section */}
            <HeroSection isDarkMode={isDarkMode} />

            {/* Main Content */}
            <div className='p-3 md:p-4'>
              {/* Category Tabs - Full Width */}
              <div className='relative'>
                <div className='flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide'>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap px-6 py-1.5 text-xs font-medium transition-all rounded-full ${
                        activeCategory === category
                          ? isDarkMode
                            ? 'text-white'
                            : 'text-black'
                          : isDarkMode
                          ? 'text-gray-400 hover:text-white bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                      }`}
                      style={
                        activeCategory === category
                          ? isDarkMode
                            ? {
                                background:
                                  'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                              }
                            : {
                                background: 'rgba(241, 203, 104, 0.2)',
                              }
                          : {}
                      }
                    >
                      {category}
                    </button>
                  ))}
                  <div className='ml-auto relative'>
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`p-2 rounded-lg shrink-0 transition-all ${
                        isFilterOpen
                          ? 'bg-[#D4AF37] text-white'
                          : isDarkMode
                          ? 'bg-white/5 text-gray-400 hover:text-white'
                          : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <img
                        src='/icons/menuicons.svg'
                        alt='Filter'
                        className={`transition-transform duration-300 ${
                          isFilterOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Filter Panel */}
                <FilterPanel
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  isDarkMode={isDarkMode}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  assetTypes={assetTypes}
                  toggleAssetType={toggleAssetType}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  returnRange={returnRange}
                  setReturnRange={setReturnRange}
                />
              </div>

              <div className='flex flex-col lg:flex-row gap-4'>
                {/* Left Section - Cards */}
                <div className='flex-1'>
                  {/* Investment Cards Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                    {investmentFunds.map(fund => (
                      <InvestmentCard
                        key={fund.id}
                        fund={fund}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Sidebar - Watchlist */}
                <div className='lg:w-72'>
                  {/* Market Highlights - Full Width */}
                  <div
                    className={`rounded-2xl border p-4 mb-4 ${
                      isDarkMode
                        ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <h3
                        className={`text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Market Highlights
                      </h3>
                      <button className='text-[#D4AF37] text-sm'>→</button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Market Data */}
                      <div className='space-y-3'>
                        {marketData.map((item, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                item.isPositive
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      <div className='h-24'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <LineChart data={chartData}>
                            <Line
                              type='monotone'
                              dataKey='value'
                              stroke='#D4AF37'
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  {/* Your Watchlist */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDarkMode
                        ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <h3
                        className={`text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Your Watchlist
                      </h3>
                      <button className='text-[#D4AF37] text-sm'>→</button>
                    </div>

                    <div className='space-y-3'>
                      {watchlistItems.map((item, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='text-yellow-500'>{item.icon}</span>
                            <span
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                          <button
                            className={`${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                            >
                              <circle cx='12' cy='12' r='2' />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .filter-panel-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .filter-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .filter-panel-scroll::-webkit-scrollbar-thumb {
          background: #d4af37;
          border-radius: 3px;
        }

        .filter-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: #c19d2f;
        }
      `}</style>
    </div>
  );
}

// Hero Section Component
function HeroSection({ isDarkMode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
      title: 'Discover Exclusive Investment Opportunities',
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
      title: 'Build Your Wealth Portfolio',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      title: 'Strategic Investment Solutions',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className='relative h-48 overflow-hidden'>
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className='absolute inset-0 bg-black/60' />
          </div>
        </div>
      ))}

      {/* Content */}
      <div className='relative h-full flex flex-col items-start justify-center px-4 z-10'>
        <h1 className='text-2xl md:text-3xl font-bold text-white text-center mb-2'>
          {slides[currentSlide].title}
        </h1>

        {/* Gradient Line - Below Title, Left Aligned */}
        <div
          className='w-[256px]  h-px mb-4'
          style={{
            background:
              'linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, #D4AF37 50%, rgba(212, 175, 55, 0.1) 100%)',
          }}
        />

        <div className='flex gap-3'>
          <button
            className={`px-4 py-1.5 text-sm rounded-full border-2 text-white font-medium transition-all hover:bg-white hover:text-gray-900 ${
              isDarkMode ? 'border-white' : 'border-white'
            }`}
          >
            Explore Now
          </button>
          <button
            className='px-4 py-1.5 text-sm rounded-full font-medium transition-all relative overflow-hidden group'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              border: '2px solid transparent',
              borderImage: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
              borderImageSlice: 1,
            }}
          >
            <span
              className='relative z-10'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learn More
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Arrows - Bottom Right Corner */}
      <div className='absolute bottom-4 right-4 flex gap-2 z-20'>
        <button
          onClick={prevSlide}
          className='w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path d='M15 18l-6-6 6-6' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className='w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path d='M9 18l6-6-6-6' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Investment Card Component
function InvestmentCard({ fund, isDarkMode }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/marketplace/${fund.id}`);
  };

  return (
    <div
      className={`relative rounded-xl border p-3 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#D4AF37]'
          : 'bg-white border-gray-200 hover:border-[#D4AF37]'
      }`}
    >
      {/* Golden Corner Triangle with Icon */}
      <div className='absolute top-0 right-0 w-12 h-12 overflow-hidden'>
        <div className='absolute top-0 right-0 w-0 h-0 border-t-[45px] border-t-[#D4AF37] border-l-[45px] border-l-transparent' />
      </div>

      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
          isDarkMode ? 'bg-[#D4AF37]/10' : 'bg-[#D4AF37]/10'
        }`}
      >
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#D4AF37'
          strokeWidth='2'
        >
          <rect x='3' y='3' width='18' height='18' rx='2' />
          <path d='M3 9h18' />
          <path d='M9 21V9' />
        </svg>
      </div>

      {/* Fund Name */}
      <h3
        className={`text-sm font-semibold mb-2 pr-8 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {fund.name}
      </h3>

      {/* Category Badge */}
      <div className='flex items-center gap-2 mb-3'>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
          style={{
            boxShadow: '0px 4px 4px 0px #00000040 inset',
          }}
        >
          {fund.category}
        </span>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-3 mb-3'>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Minimum
          </p>
          <p
            className={`text-xs font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {fund.minimum}
          </p>
        </div>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Target IRR
          </p>
          <p className='text-xs font-semibold text-[#D4AF37]'>
            {fund.targetIRR}
          </p>
        </div>
      </div>

      {/* Risk Level & Tags */}
      <div className='flex items-center justify-between mb-3'>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Risk Level
          </p>
          <p
            className={`text-xs font-semibold ${
              fund.riskLevel === 'High'
                ? 'text-red-500'
                : fund.riskLevel === 'Low'
                ? 'text-green-500'
                : 'text-[#D4AF37]'
            }`}
          >
            {fund.riskLevel}
          </p>
        </div>
        <div className='flex gap-1.5 text-right'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {fund.type}
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {fund.subType}
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={handleViewDetails}
        className={`w-full py-1.5 text-xs rounded-lg font-medium border transition-all ${
          isDarkMode
            ? 'border-white/20 text-white hover:bg-white/5'
            : 'border-gray-300 text-gray-900 hover:bg-gray-50'
        }`}
      >
        View Details
      </button>
    </div>
  );
}

// Filter Panel Component
function FilterPanel({
  isOpen,
  onClose,
  isDarkMode,
  sortBy,
  setSortBy,
  assetTypes,
  toggleAssetType,
  priceRange,
  setPriceRange,
  returnRange,
  setReturnRange,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-40' onClick={onClose} />

      {/* Filter Panel - Dropdown */}
      <div
        className={`absolute top-full right-0 mt-2 w-80 max-h-[calc(100vh-200px)] overflow-y-auto z-50 rounded-2xl animate-slideDown filter-panel-scroll ${
          isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
        }`}
        style={{
          boxShadow: isDarkMode
            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
            : '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Filters
            </h2>
          </div>

          {/* Sort By */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sort By
            </h3>
            <div className='space-y-2'>
              {[
                { value: 'price-low-high', label: 'Price: Low to High' },
                { value: 'price-high-low', label: 'Price: High to Low' },
                { value: 'return-low-high', label: 'Return: Low to High' },
                { value: 'return-high-low', label: 'Return: High to Low' },
              ].map(option => (
                <label
                  key={option.value}
                  className='flex items-center gap-3 cursor-pointer'
                >
                  <div className='relative'>
                    <input
                      type='radio'
                      name='sortBy'
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={e => setSortBy(e.target.value)}
                      className='sr-only'
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        sortBy === option.value
                          ? 'border-[#D4AF37]'
                          : isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {sortBy === option.value && (
                        <div className='w-2.5 h-2.5 rounded-full bg-[#D4AF37]' />
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Asset Type */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Asset Type
            </h3>
            <div className='space-y-2'>
              {Object.keys(assetTypes).map(type => (
                <label
                  key={type}
                  className='flex items-center gap-3 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={assetTypes[type]}
                    onChange={() => toggleAssetType(type)}
                    className='w-5 h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-[#D4AF37] checked:border-[#D4AF37] appearance-none cursor-pointer relative'
                    style={{
                      backgroundImage: assetTypes[type]
                        ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                        : 'none',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Price Range ($)
            </h3>
            <div className='px-1'>
              <input
                type='range'
                min='100'
                max='10000'
                step='100'
                value={priceRange[1]}
                onChange={e =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-gold'
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${
                    ((priceRange[1] - 100) / (10000 - 100)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} ${
                    ((priceRange[1] - 100) / (10000 - 100)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} 100%)`,
                }}
              />
              <div className='flex justify-between mt-2'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  ${priceRange[0].toLocaleString()}
                </span>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  $
                  {priceRange[1] >= 10000
                    ? '10,000+'
                    : priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Return Performance */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Return Performance
            </h3>
            <div className='px-1'>
              <input
                type='range'
                min='1'
                max='30'
                step='1'
                value={returnRange[1]}
                onChange={e =>
                  setReturnRange([returnRange[0], parseInt(e.target.value)])
                }
                className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-gold'
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${
                    ((returnRange[1] - 1) / (30 - 1)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} ${
                    ((returnRange[1] - 1) / (30 - 1)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} 100%)`,
                }}
              />
              <div className='flex justify-between mt-2'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {returnRange[0]}%
                </span>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {returnRange[1]}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb-gold::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
        }

        .slider-thumb-gold::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}
