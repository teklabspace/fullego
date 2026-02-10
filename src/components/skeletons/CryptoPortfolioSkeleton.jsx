/**
 * Skeleton loader for Crypto Portfolio Page
 */
export default function CryptoPortfolioSkeleton({ isDarkMode }) {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4'>
        <div>
          <div
            className={`h-4 w-24 rounded-lg mb-2 animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-8 w-48 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
        <div
          className={`h-10 w-64 rounded-lg animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Stats Cards Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border p-6 animate-pulse ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#111116] to-[#1A1A1D] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-4 w-20 rounded-lg mb-2 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-10 w-32 rounded-lg mb-2 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-3 w-24 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Performance Chart Skeleton */}
        <div className='lg:col-span-2'>
          <div
            className={`rounded-2xl border p-6 animate-pulse ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-6 w-32 rounded-lg mb-10 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-80 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Portfolio Breakdown Skeleton */}
        <div>
          <div
            className={`rounded-2xl border p-6 animate-pulse ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-6 w-40 rounded-lg mb-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-48 rounded-lg mb-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div className='space-y-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div
                    className={`h-3 w-3 rounded-full animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-4 flex-1 rounded-lg animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-4 w-12 rounded-lg animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table Skeleton */}
      <div
        className={`rounded-2xl border overflow-hidden animate-pulse ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div className='p-6 border-b border-[#FFFFFF14]'>
          <div
            className={`h-6 w-24 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
        <div className='p-6 space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <div
                className={`h-10 w-10 rounded-full animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
              <div className='flex-1 space-y-2'>
                <div
                  className={`h-4 w-24 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-3 w-16 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
              </div>
              <div
                className={`h-4 w-20 rounded-lg animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
