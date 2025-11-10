'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { id: 'All', name: 'All', icon: 'grid.svg' },
  { id: 'Private Equity', name: 'Private Equity', icon: 'trending-up.svg' },
  { id: 'Real Estate', name: 'Real Estate', icon: 'Highrise.svg' },
  { id: 'Private Credit', name: 'Private Credit', icon: 'wallet-keys.svg' },
  { id: 'Alternatives', name: 'Alternatives', icon: 'pie-chart.svg' },
  { id: 'Funds', name: 'Funds', icon: 'bar-chart.svg' },
  { id: 'Deals', name: 'Deals', icon: 'shopping-bag.svg' },
  { id: 'Arts & Collectibles', name: 'Arts & Collectibles', icon: 'diamond.svg' },
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
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
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
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
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
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
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
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
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
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
  },
  {
    id: 7,
    name: 'Luxury Yacht Collection',
    category: 'Arts & Collectibles',
    assetType: 'Others',
    minimum: '$1,000,000',
    minimumValue: 1000000,
    targetIRR: '12.0%',
    returnValue: 12.0,
    riskLevel: 'Medium',
    type: '#Luxury',
    subType: '#Yachts',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400',
  },
  {
    id: 8,
    name: 'Premium Real Estate Fund',
    category: 'Real Estate',
    assetType: 'Real Estate',
    minimum: '$500,000',
    minimumValue: 500000,
    targetIRR: '11.5%',
    returnValue: 11.5,
    riskLevel: 'Medium',
    type: '#Commercial',
    subType: '#Premium',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  },
  {
    id: 9,
    name: 'Sustainable Energy Fund',
    category: 'Alternatives',
    assetType: 'Equity',
    minimum: '$300,000',
    minimumValue: 300000,
    targetIRR: '15.5%',
    returnValue: 15.5,
    riskLevel: 'Medium',
    type: '#Energy',
    subType: '#Green',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
  },
];

export default function Marketplace() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price-low-high');
  const [assetTypes, setAssetTypes] = useState({
    'Real Estate': false,
    Bonds: false,
    Equity: false,
    Others: false,
  });
  const [priceRange, setPriceRange] = useState([100, 10000]);
  const [returnRange, setReturnRange] = useState([1, 30]);

  const toggleAssetType = (type) => {
    setAssetTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const getFilteredFunds = () => {
    let filtered = [...allInvestmentFunds];

    if (activeCategory !== 'All') {
      filtered = filtered.filter(fund => fund.category === activeCategory);
    }

    const selectedAssetTypes = Object.keys(assetTypes).filter(
      key => assetTypes[key]
    );
    if (selectedAssetTypes.length > 0) {
      filtered = filtered.filter(fund =>
        selectedAssetTypes.includes(fund.assetType)
      );
    }

    filtered = filtered.filter(fund => {
      const minValue = fund.minimumValue;
      return (
        minValue >= priceRange[0] * 1000 && minValue <= priceRange[1] * 1000
      );
    });

    filtered = filtered.filter(fund => {
      const returnVal = fund.returnValue;
      return returnVal >= returnRange[0] && returnVal <= returnRange[1];
    });

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

  const handleViewDetails = (fundId) => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-brand-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Grid Lines with Creative Angles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Center Grid Shape with Glow - Main */}
        <div
          className="absolute"
          style={{
            width: '546px',
            height: '506px',
            left: 'calc(50% - 546px/2)',
            top: 'calc(50% - 506px/2 - 100px)',
          }}
        >
          {/* Blurred Yellow Ellipse */}
          <div
            className="absolute"
            style={{
              width: '181px',
              height: '181px',
              left: '181px',
              top: '192px',
              background: '#F1CB68',
              filter: 'blur(135px)',
              borderRadius: '50%',
            }}
          />

          {/* Grid Lines Container */}
          <div
            className="absolute"
            style={{
              width: '546px',
              height: '546px',
              left: '0px',
              top: '0px',
            }}
          >
            {/* Vertical Lines */}
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '133.71px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '267.43px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '401.14px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />

            {/* Horizontal Lines */}
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '133.71px',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '267.43px',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '401.14px',
              }}
            />
          </div>
        </div>

        {/* Angled Grid Pattern - Top Left */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            left: '10%',
            top: '10%',
            transform: 'rotate(15deg)',
          }}
        >
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '100px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '200px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '300px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '100px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '200px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '300px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
        </div>

        {/* Angled Grid Pattern - Bottom Right */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            right: '10%',
            bottom: '10%',
            transform: 'rotate(-15deg)',
          }}
        >
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '100px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '200px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '300px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '100px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '200px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '300px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
        </div>

        {/* Additional Blurred Ellipse - Top Right */}
        <div
          className="absolute"
          style={{
            width: '250px',
            height: '250px',
            right: '15%',
            top: '15%',
            background: '#F1CB68',
            filter: 'blur(120px)',
            borderRadius: '50%',
            opacity: 0.4,
          }}
        />
      </div>

      {/* Hero Section */}
      <section id="marketplace" className="relative min-h-[60vh] flex items-center overflow-hidden py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Investment
              <br />
              <span className="text-[#F1CB68]">Marketplace</span>
            </h1>
            <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Discover exclusive investment opportunities across private equity, real estate, luxury assets, and more. 
              <span className="text-[#F1CB68]"> Sign up to access full details and invest.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/signup')}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[#0B0D12] font-semibold hover:brightness-110 transition-all shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Get Started
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 rounded-full border border-[#FFFFFF1A] bg-[#1a1a24]/60 px-8 py-4 text-white font-semibold hover:bg-[#1a1a24] transition-all"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 pb-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Category Tabs and Filter */}
          <div className="relative mb-8">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(category => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all rounded-lg flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'text-white bg-[#F1CB68]'
                      : 'text-gray-400 hover:text-white bg-white/5 border border-[#FFFFFF14]'
                  }`}
                >
                  {category.icon && (
                    <img
                      src={`/icons/${category.icon}`}
                      alt={category.name}
                      className="w-5 h-5"
                    />
                  )}
                  <span>{category.name}</span>
                </motion.button>
              ))}
              <div className="ml-auto relative">
                <motion.button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg shrink-0 transition-all ${
                    isFilterOpen
                      ? 'bg-[#F1CB68] text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M7 12h10M11 18h2" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-80 max-h-[calc(100vh-200px)] overflow-y-auto z-50 rounded-2xl bg-[#1C1C1E] border border-[#FFFFFF1A] p-6"
                style={{
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <h2 className="text-lg font-semibold text-white mb-6">Filters</h2>

                {/* Sort By */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white mb-3">Sort By</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'price-low-high', label: 'Price: Low to High' },
                      { value: 'price-high-low', label: 'Price: High to Low' },
                      { value: 'return-low-high', label: 'Return: Low to High' },
                      { value: 'return-high-low', label: 'Return: High to Low' },
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={e => setSortBy(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          sortBy === option.value ? 'border-[#F1CB68]' : 'border-gray-600'
                        }`}>
                          {sortBy === option.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F1CB68]" />
                          )}
                        </div>
                        <span className="text-sm text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Asset Type */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white mb-3">Asset Type</h3>
                  <div className="space-y-2">
                    {Object.keys(assetTypes).map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assetTypes[type]}
                          onChange={() => toggleAssetType(type)}
                          className="w-5 h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-[#F1CB68] checked:border-[#F1CB68] appearance-none cursor-pointer"
                          style={{
                            backgroundImage: assetTypes[type]
                              ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                              : 'none',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                        <span className="text-sm text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white mb-3">Price Range ($)</h3>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #F1CB68 0%, #F1CB68 ${
                        ((priceRange[1] - 100) / (10000 - 100)) * 100
                      }%, #374151 ${
                        ((priceRange[1] - 100) / (10000 - 100)) * 100
                      }%, #374151 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">${priceRange[0].toLocaleString()}</span>
                    <span className="text-xs text-gray-400">
                      ${priceRange[1] >= 10000 ? '10,000+' : priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Return Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-white mb-3">Return Performance</h3>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={returnRange[1]}
                    onChange={e => setReturnRange([returnRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #F1CB68 0%, #F1CB68 ${
                        ((returnRange[1] - 1) / (30 - 1)) * 100
                      }%, #374151 ${
                        ((returnRange[1] - 1) / (30 - 1)) * 100
                      }%, #374151 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">{returnRange[0]}%</span>
                    <span className="text-xs text-gray-400">{returnRange[1]}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Investment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {investmentFunds.map((fund, index) => (
              <InvestmentCard
                key={fund.id}
                fund={fund}
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* CTA Section */}
          {investmentFunds.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-brand-muted text-lg mb-4">No investments match your filters.</p>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setAssetTypes({
                    'Real Estate': false,
                    Bonds: false,
                    Equity: false,
                    Others: false,
                  });
                  setPriceRange([100, 10000]);
                  setReturnRange([1, 30]);
                }}
                className="text-[#F1CB68] hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}

          {/* Sign Up CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center bg-gradient-to-r from-[#F1CB68]/20 to-[#F1CB68]/5 backdrop-blur-xl rounded-3xl border border-[#F1CB68]/30 p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to invest?
            </h2>
            <p className="text-brand-muted text-lg mb-8 max-w-2xl mx-auto">
              Sign up to access full investment details, create your portfolio, and start investing in exclusive opportunities.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/signup')}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[#0B0D12] font-semibold hover:brightness-110 transition-all shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Create Free Account
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Investment Card Component
function InvestmentCard({ fund, index, onViewDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative bg-[#1a1a24]/60 backdrop-blur-xl rounded-2xl border border-[#FFFFFF1A] p-6 hover:border-[#F1CB68] transition-all duration-300 overflow-hidden group"
    >
      {/* Golden Corner Triangle */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-[#F1CB68] border-l-[64px] border-l-transparent" />
      </div>

      {/* Image */}
      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
        <img
          src={fund.image}
          alt={fund.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-[#F1CB68]/10">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F1CB68"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>

      {/* Fund Name */}
      <h3 className="text-xl font-bold mb-2 pr-12 text-white">
        {fund.name}
      </h3>

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-300">
          {fund.category}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs mb-1 text-gray-400">Minimum</p>
          <p className="text-sm font-semibold text-white">
            {fund.minimum}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-gray-400">Target IRR</p>
          <p className="text-sm font-semibold text-[#F1CB68]">
            {fund.targetIRR}
          </p>
        </div>
      </div>

      {/* Risk Level & Tags */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs mb-1 text-gray-400">Risk Level</p>
          <p className={`text-xs font-semibold ${
            fund.riskLevel === 'High'
              ? 'text-red-500'
              : fund.riskLevel === 'Low'
              ? 'text-green-500'
              : 'text-[#F1CB68]'
          }`}>
            {fund.riskLevel}
          </p>
        </div>
        <div className="flex gap-2 text-right">
          <span className="text-xs text-gray-400">{fund.type}</span>
          <span className="text-xs text-gray-400">{fund.subType}</span>
        </div>
      </div>

      {/* View Details Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onViewDetails(fund.id)}
        className="w-full py-3 text-sm rounded-lg font-medium transition-all text-[#0B0D12]"
        style={{
          background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
        }}
      >
        View Details
      </motion.button>
    </motion.div>
  );
}
