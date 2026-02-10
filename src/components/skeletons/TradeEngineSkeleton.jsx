/**
 * Skeleton loader for Trade Engine Page
 */
export default function TradeEngineSkeleton({ isDarkMode }) {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div
        className={`h-8 w-48 rounded-lg mb-6 animate-pulse ${
          isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
        }`}
      />

      {/* Search Bar Skeleton */}
      <div
        className={`h-14 rounded-lg mb-6 animate-pulse ${
          isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
        }`}
      />

      {/* Recent Trades Skeleton */}
      <div
        className={`rounded-2xl border p-6 mb-6 animate-pulse ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div
          className={`h-6 w-32 rounded-lg mb-4 animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-20 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Trading Interface Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Order Form Skeleton */}
        <div className='lg:col-span-2'>
          <div
            className={`rounded-2xl border p-6 animate-pulse ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-6 w-32 rounded-lg mb-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div className='space-y-4'>
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div
                    className={`h-4 w-24 rounded-lg mb-2 animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-10 w-full rounded-lg animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div
              className={`h-12 w-full rounded-lg mt-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div>
          <div
            className={`rounded-2xl border p-6 animate-pulse ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`h-6 w-32 rounded-lg mb-6 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div className='space-y-4 mb-6'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex justify-between'>
                  <div
                    className={`h-4 w-24 rounded-lg animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-4 w-20 rounded-lg animate-pulse ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div
              className={`h-6 w-32 rounded-lg mb-4 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-16 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
