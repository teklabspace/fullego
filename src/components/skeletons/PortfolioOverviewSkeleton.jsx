/**
 * Skeleton loader for Portfolio Overview Page
 */
export default function PortfolioOverviewSkeleton({ isDarkMode }) {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4'>
        <div>
          <div
            className={`h-8 w-64 rounded-lg mb-2 animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-4 w-96 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
        <div
          className={`h-10 w-48 rounded-full animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Total Portfolio Value Card Skeleton */}
      <div
        className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='flex-1'>
            <div
              className={`h-4 w-32 rounded-lg mb-2 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-12 w-64 rounded-lg mb-3 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-6 w-48 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div
              className={`h-20 rounded-xl animate-pulse ${
                isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
              }`}
            />
            <div
              className={`h-20 rounded-xl animate-pulse ${
                isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 animate-pulse ${
              isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-4 w-24 rounded-lg mb-3 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-8 w-32 rounded-lg mb-2 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-3 w-20 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Charts and Tables Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div
          className={`lg:col-span-2 rounded-2xl border p-6 animate-pulse ${
            isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`h-6 w-48 rounded-lg mb-6 animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-80 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
        <div
          className={`rounded-2xl border p-6 animate-pulse ${
            isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`h-6 w-32 rounded-lg mb-6 animate-pulse ${
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
              <div key={i} className='flex items-center justify-between'>
                <div
                  className={`h-4 w-20 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-4 w-16 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table Skeleton */}
      <div
        className={`rounded-2xl border overflow-hidden animate-pulse ${
          isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div className='p-6 border-b border-[#FFFFFF14]'>
          <div
            className={`h-6 w-32 rounded-lg animate-pulse ${
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
                  className={`h-3 w-32 rounded-lg animate-pulse ${
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
