'use client';
import { useState } from 'react';

export default function OrderConfirmationModal({
  isDarkMode,
  orderType,
  stock,
  quantity,
  pricePerUnit,
  totalValue,
  onClose,
}) {
  const [orderStatus, setOrderStatus] = useState('placed');

  return (
    <div
      className='fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[96vh] my-auto rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
        }`}
        style={
          isDarkMode
            ? {
                background:
                  'linear-gradient(to right, #1a1a1d 0%, #0d0d0f 100%)',
              }
            : {
                background: 'white',
              }
        }
      >
        <div className='p-4 sm:p-6 md:p-8 max-h-[96vh] overflow-y-auto custom-scrollbar'>
          {/* Success Icon */}
          <div className='flex justify-center mb-4'>
            <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#36D399] flex items-center justify-center'>
              <svg
                width='28'
                height='28'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='3'
              >
                <path
                  d='M5 13l4 4L19 7'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          </div>

          {/* Title with underline */}
          <div className='text-center mb-6'>
            <h2
              className={`text-xl sm:text-2xl font-bold inline-block ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              Order Confirmation
            </h2>
            <div className='h-1 w-28 sm:w-36 bg-[#F1CB68] mx-auto mt-2 rounded-full'></div>
          </div>

          {/* Order Details Card */}
          <div className=' rounded-2xl p-4 sm:p-5 mb-5'>
            {/* Header */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b ${
                isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
              }`}
            >
              <div>
                <h3
                  className={`text-base sm:text-lg font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}
                >
                  {stock === 'AAPL' ? 'Apple Inc.' : stock} - Equity
                </h3>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-[#F1CB68]' />
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    Pending
                  </span>
                </div>
              </div>
              <div className='text-left sm:text-right'>
                <p
                  className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Order ID
                </p>
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}
                >
                  #ORD-283947-59
                </p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <p
                    className={`text-xs mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Order Type
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      orderType === 'buy' ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                    }`}
                  >
                    {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Date & Time
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <p
                    className={`text-xs mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Quantity
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    {quantity} Shares
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Price Per Unit
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    ${pricePerUnit}
                  </p>
                </div>
              </div>

              <div
                className={`pt-4 mt-2 border-t ${
                  isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                }`}
              >
                <div className='flex justify-between items-center'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Total Value
                  </span>
                  <span className='text-2xl sm:text-3xl font-bold text-[#F1CB68]'>
                    ${totalValue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Progress */}
          <div className='mb-5'>
            <h4
              className={`text-sm font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              Order Status
            </h4>
            <div
              className={`rounded-2xl p-3 sm:p-4 ${
                isDarkMode ? 'bg-[#1a1a1d]' : 'bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-between'>
                {/* Placed */}
                <div className='flex flex-col items-center flex-1'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#36D399] flex items-center justify-center mb-2'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='white'
                      strokeWidth='3'
                    >
                      <path d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    Placed
                  </p>
                </div>

                {/* Progress Line 1 */}
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
                  }`}
                >
                  <div className='h-full bg-[#F1CB68] w-1/2' />
                </div>

                {/* Processing */}
                <div className='flex flex-col items-center flex-1'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F1CB68] flex items-center justify-center mb-2 relative'>
                    <svg
                      className='animate-spin'
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='white'
                      strokeWidth='3'
                    >
                      <circle
                        cx='12'
                        cy='12'
                        r='10'
                        strokeDasharray='60'
                        strokeDashoffset='15'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    Processing
                  </p>
                </div>

                {/* Progress Line 2 */}
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full ${
                    isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
                  }`}
                />

                {/* Completed */}
                <div className='flex flex-col items-center flex-1'>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 ${
                      isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}
                  >
                    Completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className='w-full py-4 bg-[#F1CB68] text-[#0d0d0f] rounded-xl font-bold text-base sm:text-lg hover:bg-[#d4b55a] transition-all shadow-lg hover:shadow-xl'
          >
            View in Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
