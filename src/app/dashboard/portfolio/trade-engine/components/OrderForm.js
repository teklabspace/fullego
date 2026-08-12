'use client';

import { formatCurrency, formatPercent } from '@/utils/formatters';

export default function OrderForm({
  orderType,
  setOrderType,
  orderMode,
  setOrderMode,
  selectedStock,
  quantity,
  setQuantity,
  limitPrice,
  setLimitPrice,
  stopPrice,
  setStopPrice,
  openUntil,
  setOpenUntil,
  brokerageAccount,
  setBrokerageAccount,
  orderDuration,
  setOrderDuration,
  notes,
  setNotes,
  calculateTotal,
  handlePlaceOrder,
  assetDetails,
  brokerageAccounts = [],
  isDarkMode,
}) {
  const price = assetDetails?.currentPrice;
  const changePct = assetDetails?.changePercentage;
  const changeUp = (changePct ?? 0) >= 0;
  const selectedAccount =
    brokerageAccounts.find(
      (a) => (a.accountNumber || a.account_number || a.id) === brokerageAccount
    ) || brokerageAccounts[0];
  const accountBalance =
    selectedAccount?.buyingPower ?? selectedAccount?.buying_power ??
    selectedAccount?.cash ?? null;
  return (
    <div className='lg:col-span-2'>
      <div
        className={`rounded-2xl border p-6 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Buy/Sell Tabs */}
        <div
          className={`flex shadow-lg border p-3 rounded-full gap-2 mb-6 ${
            isDarkMode ? 'border-[#FFFFFF1A]' : 'border-gray-200'
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
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-3 rounded-full font-semibold transition-all ${
              orderType === 'buy'
                ? isDarkMode
                  ? 'bg-[#101014] border border-[#F1CB68] text-white'
                  : 'bg-[#F1CB68] border border-[#F1CB68] text-black'
                : isDarkMode
                ? 'bg-transparent text-white'
                : 'bg-transparent text-black'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-3 rounded-full font-semibold transition-all ${
              orderType === 'sell'
                ? isDarkMode
                  ? 'bg-[#101014] border border-[#F1CB68] text-white'
                  : 'bg-[#F1CB68] border border-[#F1CB68] text-black'
                : isDarkMode
                ? 'bg-transparent text-gray-400 hover:text-white'
                : 'bg-transparent text-black'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Stock Selection */}
          <div className='flex items-start mb-6 '>
          <div className='w-10 h-10 rounded-full bg-[#F1CB68]/20 flex items-center justify-center text-[#F1CB68] font-bold'>
            {selectedStock.charAt(0)}
          </div>
          <div className='flex'>
            <div className='ms-2'>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {assetDetails?.name || selectedStock || 'Select an instrument'}
              </p>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {price != null ? formatCurrency(price, { minDecimals: 2 }) : '—'}
              </p>
            </div>
            <div className='text-right ms-4'>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedStock}</p>
              <p className={`text-xs ${changeUp ? 'text-[#36D399]' : 'text-[#FF6B6B]'}`}>
                {changePct != null ? formatPercent(changePct) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Market/Limit/Stop-Limit Tabs */}
        <div className='mb-6'>
          <div className='flex gap-1 p-2 rounded-full mb-4'>
            <button
              onClick={() => setOrderMode('market')}
              className={`flex-1 pb-2 text-sm font-medium transition-all ${
                orderMode === 'market'
                  ? isDarkMode
                    ? 'border-b border-b-[#F1CB68] text-white'
                    : 'border-b border-b-[#F1CB68] text-black'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-black'
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderMode('limit')}
              className={`flex-1 pb-2 text-sm font-medium transition-all ${
                orderMode === 'limit'
                  ? isDarkMode
                    ? 'border-b border-b-[#F1CB68] text-white'
                    : 'border-b border-b-[#F1CB68] text-black'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-black'
              }`}
            >
              Limit
            </button>
            <button
              onClick={() => setOrderMode('stop-limit')}
              className={`flex-1 pb-2 text-sm font-medium transition-all ${
                orderMode === 'stop-limit'
                  ? isDarkMode
                    ? 'border-b border-b-[#F1CB68] text-white'
                    : 'border-b border-b-[#F1CB68] text-black'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-black'
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
                    ? 'bg-gradiend-to-r from-[#222126] to-[#111116] border-[#FFFFFF14] text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none `}
              />
            </div>

            {/* Stop Price — stop-limit only: the trigger that activates the limit order */}
            {orderMode === 'stop-limit' && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Stop Price
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
                    value={stopPrice}
                    onChange={e => setStopPrice(e.target.value)}
                    placeholder='Trigger price'
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gradiend-to-r from-[#222126] to-[#111116] border-[#FFFFFF14] text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:border-[#F1CB68]`}
                  />
                </div>
              </div>
            )}

            {/* Limit Price — limit and stop-limit modes */}
            {orderMode !== 'market' && (
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
                        ? 'bg-gradiend-to-r from-[#222126] to-[#111116] border-[#FFFFFF14] text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:border-[#F1CB68]`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current Price Info */}
          <div
            className={`grid grid-cols-3 gap-4 p-4 rounded-lg border ${
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
            <div>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</p>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {price != null ? formatCurrency(price, { minDecimals: 2 }) : '—'}
              </p>
            </div>
            <div>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Prev Close</p>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {assetDetails?.previousClose != null
                  ? formatCurrency(assetDetails.previousClose, { minDecimals: 2 })
                  : '—'}
              </p>
            </div>
            <div>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Change</p>
              <p className={`text-sm font-semibold ${changeUp ? 'text-[#36D399]' : 'text-[#FF6B6B]'}`}>
                {changePct != null ? formatPercent(changePct) : '—'}
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
                    ? 'bg-gradiend-to-r from-[#222126] border-[#FFFFFF14] to-[#111116] text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:border-[#F1CB68]`}
              />
            </div>

            {/* Amount to Invest / Estimated Proceeds */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {orderType === 'sell' ? 'Estimated Proceeds' : 'Amount to Invest'}
              </label>
              <input
                type='text'
                value={`$${calculateTotal()}`}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gradiend-to-r from-[#222126] border-[#FFFFFF14] to-[#111116] text-white'
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
              className="w-full"
            >
              {brokerageAccounts.length === 0 ? (
                <option value=''>No brokerage account connected</option>
              ) : (
                brokerageAccounts.map((acc) => {
                  const number = acc.accountNumber || acc.account_number || acc.id;
                  return (
                    <option key={number} value={number}>
                      Brokerage Account ({number})
                    </option>
                  );
                })
              )}
            </select>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {brokerageAccounts.length === 0
                ? 'Connect a brokerage in Settings → Linked Accounts to place orders.'
                : accountBalance != null
                  ? `Available balance: ${formatCurrency(accountBalance, { minDecimals: 2 })}`
                  : ''}
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
                    ? isDarkMode
                      ? 'border-[#F1CB68]'
                      : 'border-[#F1CB68]'
                    : isDarkMode
                    ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    : 'border-gray-200 hover:border-[#F1CB68]/50'
                }`}
                style={
                  orderDuration === 'day-only'
                    ? isDarkMode
                      ? {
                        background: 'linear-gradient(to right, #222126 0%, #111116 100%)',
                      }
                      : {
                        background: 'transparent',
                      }
                    : {}
                }
              >
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Day Only
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expires at market close</p>
              </button>
              <button
                onClick={() => setOrderDuration('gtc')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  orderDuration === 'gtc'
                    ? isDarkMode
                      ? 'border-[#F1CB68]'
                      : 'border-[#F1CB68]'
                    : isDarkMode
                    ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    : 'border-gray-200 hover:border-[#F1CB68]/50'
                }`}
                style={
                  orderDuration === 'gtc'
                    ? isDarkMode
                      ? {
                        background: 'linear-gradient(to right, #222126 0%, #111116 100%)',
                      }
                      : {
                        background: 'transparent',
                      }
                    : {}
                }
              >
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  GTC
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Good till cancel</p>
              </button>
              <button
                onClick={() => setOrderDuration('gtd')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  orderDuration === 'gtd'
                    ? isDarkMode
                      ? 'border-[#F1CB68]'
                      : 'border-[#F1CB68]'
                    : isDarkMode
                    ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    : 'border-gray-200 hover:border-[#F1CB68]/50'
                }`}
                style={
                  orderDuration === 'gtd'
                    ? isDarkMode
                      ? {
                        background: 'linear-gradient(to right, #222126 0%, #111116 100%)',
                      }
                      : {
                        background: 'transparent',
                      }
                    : {}
                }
              >
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  GTD
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Good till date</p>
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
                  ? 'bg-gradiend-to-r  from-[#222126] to-[#111116] text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:border-[#F1CB68] resize-none`}
            />
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            className={`px-10 py-4 rounded-lg font-bold text-lg transition-all ${
              orderType === 'sell'
                ? 'bg-[#FF6B6B] text-white hover:bg-[#e05555]'
                : 'bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E]'
            }`}
          >
            {orderType === 'sell' ? 'Place Sell Order' : 'Place Buy Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

