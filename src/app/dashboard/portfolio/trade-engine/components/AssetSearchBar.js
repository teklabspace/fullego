'use client';

import { useEffect, useRef, useState } from 'react';

// Two tradable asset classes only: Stocks and Crypto are what the brokerage
// (Alpaca) executes and what our market data (Polygon) covers. Forex and
// commodities are not tradable on this stack, so they are not offered.
const ASSET_CLASSES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'crypto', label: 'Crypto' },
];

export default function AssetSearchBar({
  assetClass,
  setAssetClass,
  searchQuery,
  setSearchQuery,
  onSearch,
  searchResults = [],
  onSelectAsset,
  isDarkMode,
}) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  // Dropdown shows only while the field is focused; an empty query still has
  // results (browse mode lists the class's available instruments). The list
  // scrolls through everything fetched — no page buttons.
  const open = focused && searchResults.length > 0;

  // Debounced live search as the user types (or switches asset class).
  // Runs once on mount too, pre-loading the browseable instrument list.
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, assetClass]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      className={`mb-6 rounded-4xl border p-6 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}
      style={
        isDarkMode
          ? {
              background: 'linear-gradient(to right, #222126 0%, #111116 100%)',
            }
          : {
              background: 'transparent',
            }
      }
    >
      {/* Asset Class & Search */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Asset Class */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Assets Class
          </label>
          <select
            value={assetClass}
            onChange={e => setAssetClass(e.target.value)}
            className={`w-full px-4 py-3 rounded-full border focus:outline-none focus:border-[#F1CB68] ${
              isDarkMode
                ? 'bg-[#101014] border-[#FFFFFF14] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {ASSET_CLASSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Instrument */}
        <div ref={containerRef}>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Search Instrument
          </label>
          <div className='relative'>
            <svg
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-white' : 'text-gray-400'
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder={
                assetClass === 'crypto'
                  ? 'Search by symbol or name (BTC, ETH, etc.)'
                  : 'Search by symbol or name (AAPL, TSLA, etc.)'
              }
              className={`w-full pl-12 pr-4 py-3 rounded-full border ${
                isDarkMode
                  ? 'bg-[#101014] border-[#FFFFFF14] text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-[#F1CB68]`}
            />

            {/* Results dropdown */}
            {open && (
              <div
                className={`absolute z-20 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border shadow-lg ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                {searchResults.map((asset) => (
                  <button
                    key={asset.symbol}
                    type='button'
                    onClick={() => {
                      setFocused(false);
                      onSelectAsset(asset);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className='min-w-0'>
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {asset.symbol}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {asset.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                        isDarkMode
                          ? 'bg-[#F1CB68]/10 text-[#F1CB68]'
                          : 'bg-[#F1CB68]/10 text-[#BF9B30]'
                      }`}
                    >
                      {asset.type}
                    </span>
                  </button>
                ))}

                {/* Scroll hint footer */}
                <div
                  className={`sticky bottom-0 px-4 py-2 border-t text-center ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {searchResults.length} instruments — scroll to browse, type to search
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
