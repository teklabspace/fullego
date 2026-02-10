/**
 * Skeleton loader for Cash Flow Page
 */
export default function CashFlowSkeleton({ isDarkMode }) {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
        <div
          className={`h-8 w-64 rounded-lg animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
        <div
          className={`h-10 w-64 rounded-full animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Stats and Chart Grid Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Stats Cards Skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden animate-pulse ${
                isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
              }`}
            >
              <div
                className={`h-1 animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
              <div className='p-6'>
                <div
                  className={`h-4 w-24 rounded-lg mb-4 animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-8 w-32 rounded-lg mb-2 animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-3 w-28 rounded-lg animate-pulse ${
                    isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
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
            className={`h-64 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Transactions Table Skeleton */}
      <div
        className={`rounded-2xl border overflow-hidden animate-pulse ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
      >
        <div className='p-6 border-b border-[#FFFFFF14]'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div
              className={`h-6 w-48 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-10 w-64 rounded-lg animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>
        <div className='p-6 space-y-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <div
                className={`h-4 w-24 rounded-lg animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-4 w-32 rounded-lg animate-pulse ${
                  isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
                }`}
              />
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
  );
}
