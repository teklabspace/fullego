'use client';

export default function RecentTrades({
  trades,
  selectedStock,
  setSelectedStock,
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
      <div className='flex items-center justify-between mb-4'>
        <h3
          className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Recent Trade
        </h3>
        <button
          className={`text-sm ${
            isDarkMode ? 'text-[#D4AF37]' : 'text-[#C49D2E]'
          } hover:underline`}
        >
          View All
        </button>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 overflow-x-auto'>
        {trades.map((trade, index) => (
          <button
            key={index}
            onClick={() => setSelectedStock(trade.symbol)}
            className={`p-4 rounded-xl transition-all text-left border ${
              selectedStock === trade.symbol
                ? isDarkMode
                  ? 'bg-[#101014] border-[#D4AF37]'
                  : 'bg-white border-[#D4AF37]'
                : isDarkMode
                ? 'border-[#FFFFFF14] bg-[#101014] hover:border-[#D4AF37]/50'
                : 'border-gray-200 bg-white hover:border-[#D4AF37]/50'
            }`}
          >
            <div className='flex items-center gap-2 mb-2'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-100'
                }`}
              >
                {trade.symbol.charAt(0)}
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {trade.symbol}
                </p>
              </div>
            </div>
            <p
              className={`text-xs mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {trade.name}
            </p>
            <p
              className={`text-sm font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {trade.price}
            </p>
            <p
              className={`text-xs ${
                trade.positive ? 'text-[#36D399]' : 'text-[#FF6B6B]'
              }`}
            >
              {trade.change}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

