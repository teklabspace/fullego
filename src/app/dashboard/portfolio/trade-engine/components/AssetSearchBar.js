'use client';

export default function AssetSearchBar({
  assetClass,
  setAssetClass,
  searchQuery,
  setSearchQuery,
  isDarkMode,
}) {
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
            className={`w-full px-2 py-3 rounded-full border ${
              isDarkMode
                ? 'bg-[#101014] border-[#FFFFFF14] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:border-[#D4AF37]`}
          >
            <option value='stocks'>Stocks</option>
            <option value='crypto'>Crypto</option>
            <option value='forex'>Forex</option>
            <option value='commodities'>Commodities</option>
          </select>
        </div>

        {/* Search Instrument */}
        <div>
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
              placeholder='Search by symbol or name (AAPL, TSLA, etc.)'
              className={`w-full pl-12 pr-4 py-3 rounded-full border ${
                isDarkMode
                  ? 'bg-[#101014] border-[#FFFFFF14] text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-[#D4AF37]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

