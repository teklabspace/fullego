/**
 * Skeleton loader for Asset Detail Page
 */
export default function AssetDetailSkeleton({ isDarkMode }) {
  return (
    <div className='pb-20'>
      {/* Breadcrumb Skeleton */}
      <div className='mb-6 flex items-center gap-2'>
        <div
          className={`h-4 w-16 rounded animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
        <div
          className={`h-4 w-20 rounded animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
        <div
          className={`h-4 w-32 rounded animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Header Skeleton */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <div
            className={`h-8 w-64 rounded-lg mb-2 animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div className='flex items-center gap-3'>
            <div
              className={`h-6 w-24 rounded-full animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-4 w-32 rounded animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>
        <div className='flex gap-3'>
          <div
            className={`h-12 w-32 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-12 w-40 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Image Gallery Skeleton */}
          <div
            className={`border rounded-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}
          >
            <div className='relative aspect-video bg-black'>
              <div
                className={`w-full h-full animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
            </div>
            <div className='p-4 flex gap-3 overflow-x-auto'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 rounded-lg flex-shrink-0 animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Property Details Skeleton */}
          <div
            className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}
          >
            <div
              className={`h-6 w-40 rounded-lg mb-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div className='grid grid-cols-2 gap-6'>
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-4 w-24 rounded mb-2 animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-6 w-32 rounded animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Valuation Card Skeleton */}
          <div
            className={`border rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
                : 'bg-white border-gray-300'
            }`}
          >
            <div
              className={`h-6 w-32 rounded-lg mb-4 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-10 w-48 rounded-lg mb-2 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-4 w-32 rounded animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
