/**
 * Skeleton loader for Asset Card
 */
export default function AssetCardSkeleton({ isDarkMode }) {
  return (
    <div
      className={`bg-transparent border rounded-2xl overflow-hidden ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-300'
      }`}
    >
      {/* Image Skeleton */}
      <div className='relative h-48 overflow-hidden'>
        <div
          className={`w-full h-full animate-pulse ${
            isDarkMode
              ? 'bg-gradient-to-br from-[#2A2A2D] to-[#1a1a1d]'
              : 'bg-gradient-to-br from-gray-200 to-gray-300'
          }`}
        />
      </div>

      {/* Content Skeleton */}
      <div className='p-5'>
        {/* Title Skeleton */}
        <div
          className={`h-6 rounded-lg mb-4 animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
          style={{ width: '70%' }}
        />

        {/* Fields Skeleton */}
        <div className='mb-4 space-y-2'>
          <div className='flex justify-between items-center'>
            <div
              className={`h-4 rounded w-20 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-4 rounded w-24 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
          <div className='flex justify-between items-center'>
            <div
              className={`h-4 rounded w-16 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-4 rounded w-20 animate-pulse ${
                isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Button Skeleton */}
        <div
          className={`h-10 rounded-lg mb-2 animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />

        {/* Action Buttons Skeleton */}
        <div className='grid grid-cols-2 gap-2'>
          <div
            className={`h-10 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-10 rounded-lg animate-pulse ${
              isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
