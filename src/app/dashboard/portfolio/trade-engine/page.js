'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function TradeEnginePage() {
  const { isDarkMode } = useTheme();
  const [assetClass, setAssetClass] = useState('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
  const [orderMode, setOrderMode] = useState('market'); // 'market', 'limit', 'stop-limit'
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [quantity, setQuantity] = useState('10');
  const [limitPrice, setLimitPrice] = useState('185.92');
  const [openUntil, setOpenUntil] = useState('2023-09-15');
  const [brokerageAccount, setBrokerageAccount] = useState('****4321');
  const [orderDuration, setOrderDuration] = useState('day-only');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const recentTrades = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: '$185.92',
      change: '+1.2%',
      positive: true,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: '$354.58',
      change: '-0.5%',
      positive: false,
    },
    {
      symbol: 'GOOGLE',
      name: 'Alphabet Inc.',
      price: '$131.74',
      change: '+0.8%',
      positive: true,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: '$137.85',
      change: '-0.3%',
      positive: false,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: '$242.68',
      change: '-1.5%',
      positive: false,
    },
  ];

  const recentAAPlTrades = [
    { type: 'Buy', shares: 5, price: '$185.65', date: '09/12/2023' },
    { type: 'Sell', shares: 7, price: '$179.21', date: '08/25/2023' },
  ];

  const handlePlaceOrder = () => {
    setShowConfirmation(true);
  };

  const calculateTotal = () => {
    const total = parseFloat(quantity || 0) * parseFloat(limitPrice || 0);
    return total.toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className=''>
        {/* Header */}
        <div className='mb-6'>
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Trade Engine
          </h1>
        </div>

        {/* Asset Class & Search */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
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
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14] text-white'
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
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
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
                className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#1C1C1E] border-[#FFFFFF14] text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-[#D4AF37]`}
              />
            </div>
          </div>
        </div>

        {/* Recent Trade */}
        <div className='mb-6'>
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
            {recentTrades.map((trade, index) => (
              <button
                key={index}
                onClick={() => setSelectedStock(trade.symbol)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedStock === trade.symbol
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : isDarkMode
                    ? 'border-[#FFFFFF14] bg-[#1C1C1E] hover:border-[#D4AF37]/50'
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

        {/* Main Trading Interface */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Order Form */}
          <div className='lg:col-span-2'>
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Buy/Sell Tabs */}
              <div className='flex gap-4 mb-6'>
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    orderType === 'buy'
                      ? 'bg-[#36D399] text-white'
                      : isDarkMode
                      ? 'bg-[#2C2C2E] text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    orderType === 'sell'
                      ? 'bg-[#FF6B6B] text-white'
                      : isDarkMode
                      ? 'bg-[#2C2C2E] text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Stock Selection */}
              <div className='flex items-center gap-3 mb-6 p-4 rounded-lg bg-[#2C2C2E]'>
                <div className='w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold'>
                  {selectedStock.charAt(0)}
                </div>
                <div>
                  <p className='text-sm font-bold text-white'>
                    {selectedStock}
                  </p>
                  <p className='text-xs text-gray-400'>Apple Inc.</p>
                </div>
                <div className='ml-auto text-right'>
                  <p className='text-sm font-bold text-white'>$185.92</p>
                  <p className='text-xs text-[#36D399]'>+1.2%</p>
                </div>
              </div>

              {/* Market/Limit/Stop-Limit Tabs */}
              <div className='mb-6'>
                <div
                  className='flex gap-2 p-2 rounded-full border mb-4'
                  style={{
                    background:
                      'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                    borderColor: '#29292E',
                  }}
                >
                  <button
                    onClick={() => setOrderMode('market')}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      orderMode === 'market'
                        ? 'bg-[#30333B] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderMode('limit')}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      orderMode === 'limit'
                        ? 'bg-[#30333B] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Limit
                  </button>
                  <button
                    onClick={() => setOrderMode('stop-limit')}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      orderMode === 'stop-limit'
                        ? 'bg-[#30333B] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Stop-Limit
                  </button>
                </div>
              </div>

              {/* Order Form Fields */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Quantity */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Quantity
                    </label>
                    <input
                      type='number'
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:border-[#D4AF37]`}
                    />
                  </div>

                  {/* Limit Price */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Limit Price
                    </label>
                    <div className='relative'>
                      <span
                        className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        $
                      </span>
                      <input
                        type='text'
                        value={limitPrice}
                        onChange={e => setLimitPrice(e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-[#2C2C2E] border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:border-[#D4AF37]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Price Info */}
                <div className='grid grid-cols-3 gap-4 p-4 rounded-lg bg-[#2C2C2E]'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Current Price</p>
                    <p className='text-sm font-semibold text-white'>$185.92</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Bid-Bid/Ask</p>
                    <p className='text-sm font-semibold text-white'>
                      $185.90 / $185.95
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Ask-Bid/Ask</p>
                    <p className='text-sm font-semibold text-white'>
                      Ask-$185.95
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Open Until */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Open Until
                    </label>
                    <input
                      type='date'
                      value={openUntil}
                      onChange={e => setOpenUntil(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:border-[#D4AF37]`}
                    />
                  </div>

                  {/* Amount to Invest */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Amount to Invest
                    </label>
                    <input
                      type='text'
                      value={`$${calculateTotal()}`}
                      readOnly
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } cursor-not-allowed`}
                    />
                  </div>
                </div>

                {/* Brokerage Account */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Brokerage Account
                  </label>
                  <select
                    value={brokerageAccount}
                    onChange={e => setBrokerageAccount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:border-[#D4AF37]`}
                  >
                    <option value='****4321'>
                      Brokerage Account (****4321)
                    </option>
                    <option value='****5678'>
                      Brokerage Account (****5678)
                    </option>
                  </select>
                  <p className='text-xs text-gray-400 mt-1'>
                    Available balance: $125,789.65
                  </p>
                </div>

                {/* Order Duration */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Order Duration
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <button
                      onClick={() => setOrderDuration('day-only')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        orderDuration === 'day-only'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#D4AF37]/50'
                          : 'border-gray-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Day Only
                      </p>
                      <p className='text-xs text-gray-400'>
                        Expires at market close
                      </p>
                    </button>
                    <button
                      onClick={() => setOrderDuration('gtc')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        orderDuration === 'gtc'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#D4AF37]/50'
                          : 'border-gray-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        GTC
                      </p>
                      <p className='text-xs text-gray-400'>Good till cancel</p>
                    </button>
                    <button
                      onClick={() => setOrderDuration('gtd')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        orderDuration === 'gtd'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : isDarkMode
                          ? 'border-[#FFFFFF14] hover:border-[#D4AF37]/50'
                          : 'border-gray-200 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        GTD
                      </p>
                      <p className='text-xs text-gray-400'>Good till date</p>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder='Add notes about this trade...'
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:border-[#D4AF37] resize-none`}
                  />
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className='w-full py-4 bg-[#D4AF37] text-[#101014] rounded-lg font-bold text-lg hover:bg-[#C49D2E] transition-all'
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className='lg:col-span-1'>
            <div
              className={`rounded-2xl border p-6 sticky top-6 ${
                isDarkMode
                  ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Order Summary
              </h3>

              <div className='space-y-4 mb-6'>
                <div className='flex justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Limit Price
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${limitPrice}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Quantity
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {quantity} shares
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Price per share
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${limitPrice}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Estimated Commission
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    $0.00
                  </span>
                </div>
                <div className='pt-4 border-t border-[#FFFFFF14]'>
                  <div className='flex justify-between'>
                    <span
                      className={`text-base font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Total Cost
                    </span>
                    <span className='text-lg font-bold text-[#D4AF37]'>
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Asset Information */}
              <div className='mb-6'>
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-all`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Asset Information
                  </span>
                  <span className='text-[#D4AF37]'>Full Details →</span>
                </button>
              </div>

              {/* Market Stats */}
              <div className='space-y-3 mb-6'>
                <div className='flex justify-between'>
                  <span className='text-xs text-gray-400'>Market Cap</span>
                  <span className='text-xs font-semibold text-white'>
                    $2.87T
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-xs text-gray-400'>52-Week Range</span>
                  <span className='text-xs font-semibold text-white'>
                    $124.17 - $192.45
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-xs text-gray-400'>Dividend Yield</span>
                  <span className='text-xs font-semibold text-white'>
                    0.58%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-xs text-gray-400'>P/E Ratio</span>
                  <span className='text-xs font-semibold text-white'>
                    30.64
                  </span>
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
                {recentAAPlTrades.map((trade, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E] mb-2'
                  >
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`text-xs font-semibold ${
                            trade.type === 'Buy'
                              ? 'text-[#36D399]'
                              : 'text-[#FF6B6B]'
                          }`}
                        >
                          {trade.type} {trade.shares} Shares
                        </span>
                      </div>
                      <p className='text-xs text-gray-400'>{trade.date}</p>
                    </div>
                    <p className='text-sm font-bold text-white'>
                      {trade.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Market Volatility Notice */}
              <div className='p-4 rounded-lg bg-[#F1CB68]/10 border border-[#F1CB68]/30'>
                <div className='flex items-start gap-3'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#F1CB68'
                    className='shrink-0'
                  >
                    <circle cx='12' cy='12' r='10' strokeWidth='2' />
                    <path d='M12 8v4M12 16h.01' strokeWidth='2' />
                  </svg>
                  <div>
                    <p className='text-xs font-semibold text-[#F1CB68] mb-1'>
                      Market volatility notice
                    </p>
                    <p className='text-xs text-gray-400'>
                      AAPL has experienced higher than average volatility in the
                      past week. Consider using limit orders to control your
                      entry price.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Execution Timeline */}
              <div className='mt-6'>
                <h4
                  className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Order Execution Timeline
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 rounded-full bg-[#36D399] flex items-center justify-center'>
                      <svg
                        width='12'
                        height='12'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='white'
                        strokeWidth='3'
                      >
                        <path d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-white'>
                        Order Placement
                      </p>
                      <p className='text-xs text-gray-400'>
                        Market order will execute immediately
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center'>
                      <div className='w-2 h-2 rounded-full bg-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-400'>
                        Order Execution
                      </p>
                      <p className='text-xs text-gray-400'>
                        Filled at the best available price
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center'>
                      <div className='w-2 h-2 rounded-full bg-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-400'>
                        Settlement
                      </p>
                      <p className='text-xs text-gray-400'>
                        T+2 days (09/17/2023)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Confirmation Modal */}
        {showConfirmation && (
          <OrderConfirmationModal
            isDarkMode={isDarkMode}
            orderType={orderType}
            stock={selectedStock}
            quantity={quantity}
            pricePerUnit={limitPrice}
            totalValue={calculateTotal()}
            onClose={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Order Confirmation Modal Component
function OrderConfirmationModal({
  isDarkMode,
  orderType,
  stock,
  quantity,
  pricePerUnit,
  totalValue,
  onClose,
}) {
  const [orderStatus, setOrderStatus] = useState('placed'); // 'placed', 'processing', 'completed'

  return (
    <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'>
      <div
        className={`w-full max-w-lg rounded-2xl overflow-hidden ${
          isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
        }`}
      >
        <div className='p-8 text-center'>
          {/* Success Icon */}
          <div className='w-20 h-20 rounded-full bg-[#36D399]/20 flex items-center justify-center mx-auto mb-6'>
            <svg
              width='40'
              height='40'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#36D399'
              strokeWidth='2'
            >
              <path
                d='M5 13l4 4L19 7'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>

          <h2 className='text-2xl font-bold text-white mb-6'>
            Order Confirmation
          </h2>

          {/* Order Details Card */}
          <div className='bg-[#2C2C2E] rounded-xl p-6 mb-6 text-left'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-lg font-bold text-white mb-1'>
                  {stock === 'AAPL' ? 'Apple Inc.' : stock} - Equity
                </h3>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-[#F1CB68]' />
                  <span className='text-sm text-[#F1CB68]'>Pending</span>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-xs text-gray-400'>Order ID</p>
                <p className='text-sm font-semibold text-white'>
                  #ORD-283947-59
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Order Type</p>
                <p
                  className={`text-sm font-semibold ${
                    orderType === 'buy' ? 'text-[#36D399]' : 'text-[#FF6B6B]'
                  }`}
                >
                  {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Date & Time</p>
                <p className='text-sm font-semibold text-white'>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  •{' '}
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Quantity</p>
                <p className='text-sm font-semibold text-white'>
                  {quantity} Shares
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Price Per Unit</p>
                <p className='text-sm font-semibold text-white'>
                  ${pricePerUnit}
                </p>
              </div>
            </div>

            <div className='pt-4 border-t border-[#FFFFFF14]'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-400'>Total Value</span>
                <span className='text-2xl font-bold text-[#D4AF37]'>
                  ${totalValue}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Progress */}
          <div className='mb-6'>
            <h4 className='text-sm font-semibold text-white mb-4 text-left'>
              Order Status
            </h4>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex flex-col items-center flex-1'>
                <div className='w-10 h-10 rounded-full bg-[#36D399] flex items-center justify-center mb-2'>
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    strokeWidth='3'
                  >
                    <path d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <p className='text-xs text-[#36D399] font-semibold'>Placed</p>
              </div>

              <div className='flex-1 h-1 bg-[#2C2C2E] mx-2'>
                <div className='h-full bg-[#F1CB68] w-1/2' />
              </div>

              <div className='flex flex-col items-center flex-1'>
                <div className='w-10 h-10 rounded-full bg-[#F1CB68] flex items-center justify-center mb-2'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                </div>
                <p className='text-xs text-[#F1CB68] font-semibold'>
                  Processing
                </p>
              </div>

              <div className='flex-1 h-1 bg-[#2C2C2E] mx-2' />

              <div className='flex flex-col items-center flex-1'>
                <div className='w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-2'>
                  <div className='w-2 h-2 rounded-full bg-gray-500' />
                </div>
                <p className='text-xs text-gray-500 font-semibold'>Completed</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className='w-full py-4 bg-[#D4AF37] text-[#101014] rounded-lg font-bold text-lg hover:bg-[#C49D2E] transition-all mb-3'
          >
            View in Portfolio
          </button>
          <button
            onClick={onClose}
            className={`text-sm ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600'
            } transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
