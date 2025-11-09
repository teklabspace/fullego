'use client';

export default function OrderSummary({
  quantity,
  limitPrice,
  calculateTotal,
  recentTrades,
  isDarkMode,
}) {
  return (
    <div className='lg:col-span-1'>
      <div
        className={`rounded-3xl border p-6 sticky top-6 ${
          isDarkMode
            ? 'bg-gradient-to-r shadow-lg border-[#FFFFFF1A] from-[#222126] to-[#111116]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h3
          className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Order Summary
        </h3>

        {/* Limit Price Label */}
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Limit Price</p>

        {/* Order Details Card */}
        <div
          className={`rounded-2xl p-5 mb-6 space-y-3 border ${
            isDarkMode ? 'bg-[#1a1a1d] border-[#FFFFFF14]' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className='flex justify-between items-center'>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantity</span>
            <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {quantity} shares
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price per share</span>
            <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              ${limitPrice}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Commission</span>
            <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>$0.00</span>
          </div>
          <div className={`pt-3 mt-3 border-t ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
            <div className='flex justify-between items-center'>
              <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Total Cost
              </span>
              <span className='text-xl font-bold text-[#F1CB68]'>
                ${calculateTotal()}
              </span>
            </div>
          </div>
        </div>

        {/* Asset Information */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Information</span>
            <button className='text-sm text-[#F1CB68] hover:underline flex items-center gap-1'>
              Full Details
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path
                  d='M7 17L17 7M17 7H7M17 7V17'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>

          {/* Market Stats */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Market Cap</span>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>$2.87T</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>52-Week Range</span>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                $124.17 - $192.45
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dividend Yield</span>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>0.58%</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>P/E Ratio</span>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>30.64</span>
            </div>
          </div>
        </div>

        {/* Recent AAPL Trades */}
        <div className='mb-6'>
          <h4
            className={`text-sm font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Recent AAPL Trades
          </h4>
          {recentTrades.map((trade, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${
                isDarkMode ? 'bg-[#1a1a1d]' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trade.type === 'Buy' ? 'bg-[#36D399]/10' : 'bg-[#FF6B6B]/10'
                }`}
              >
                {trade.type === 'Buy' ? (
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#36D399'
                    strokeWidth='2'
                  >
                    <path
                      d='M7 17L17 7M17 7H7M17 7V17'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                ) : (
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#FF6B6B'
                    strokeWidth='2'
                  >
                    <path
                      d='M17 7L7 17M7 17H17M7 17V7'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )}
              </div>
              <div className='flex-1'>
                <p
                  className={`text-sm font-semibold ${
                    trade.type === 'Buy' ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                  }`}
                >
                  {trade.type} {trade.shares} Shares
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{trade.date}</p>
              </div>
              <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{trade.price}</p>
            </div>
          ))}
        </div>

        {/* Market Volatility Notice */}
        <div
          className={`p-4 rounded-xl border-l-4 border-[#F1CB68] mb-6 ${
            isDarkMode ? 'bg-[#1a1a1d]' : 'bg-gray-50'
          }`}
        >
          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-[#F1CB68]/20 flex items-center justify-center shrink-0 mt-0.5'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#F1CB68'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v4M12 16h.01' strokeLinecap='round' />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Market volatility notice
              </p>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AAPL has experienced higher than average volatility in the past
                week. Consider using limit orders to control your entry price.
              </p>
            </div>
          </div>
        </div>

        {/* Order Execution Timeline */}
        <div>
          <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Order Execution Timeline
          </h4>
          <div
            className={`rounded-xl p-4 space-y-4 ${
              isDarkMode ? 'bg-[#1a1a1d]' : 'bg-gray-50'
            }`}
          >
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 rounded-full bg-[#F1CB68] flex items-center justify-center shrink-0'>
                <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#1a1a1d]' : 'bg-white'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Order Placement
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Market order will execute immediately
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Order Execution
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Filled at the best available price
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Settlement
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>T+2 days (09/17/2023)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

