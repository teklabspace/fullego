'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOrderStatus } from '@/utils/portfolioApi';

export default function OrderConfirmationModal({
  isDarkMode,
  orderType,
  stock,
  quantity,
  pricePerUnit,
  totalValue,
  orderId,
  pollOrderId,
  finalStatus,
  onClose,
}) {
  // Stepper stage: placed → processing → completed (filled orders) or
  // open (resting limit orders — honest end state, no infinite spinner).
  const router = useRouter();
  const isFilled = !finalStatus || finalStatus === 'filled';
  const [stage, setStage] = useState('placed');

  useEffect(() => {
    const toProcessing = setTimeout(() => setStage('processing'), 900);
    const toFinal = setTimeout(
      () => setStage(isFilled ? 'completed' : 'open'),
      2400
    );
    return () => {
      clearTimeout(toProcessing);
      clearTimeout(toFinal);
    };
  }, [isFilled]);

  // Orders that came back "submitted" may fill moments later — poll a few
  // times and complete the stepper when the broker reports a fill.
  useEffect(() => {
    if (isFilled || !pollOrderId) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      while (!cancelled && attempts < 5) {
        await new Promise(r => setTimeout(r, 4000));
        attempts += 1;
        try {
          const res = await getOrderStatus(pollOrderId);
          const status = res?.data?.status || res?.status;
          if (!cancelled && status === 'filled') {
            setStage('completed');
            return;
          }
        } catch {
          // Status lookup failing shouldn't disturb the confirmation screen.
          return;
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [isFilled, pollOrderId]);

  const statusLabel =
    stage === 'completed'
      ? 'Completed'
      : stage === 'open'
      ? 'Open — awaiting fill'
      : stage === 'processing'
      ? 'Processing'
      : 'Placed';
  const statusColor =
    stage === 'completed' ? 'bg-[#36D399]' : 'bg-[#F1CB68]';

  return (
    <div
      className='fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto'
      onClick={onClose}
    >
      <style jsx>{`
        .order-modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .order-modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .order-modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .order-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .order-modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
      <div
        className={`w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] my-auto rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
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
        onClick={e => e.stopPropagation()}
      >
        <div className='p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 order-modal-scrollbar'>
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
                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-white' : 'text-black'
                    }`}
                  >
                    {statusLabel}
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
                  className={`text-sm font-semibold break-all ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}
                >
                  {orderId ? `#${orderId}` : '—'}
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
                  <div
                    className={`h-full bg-[#F1CB68] transition-all duration-700 ${
                      stage === 'placed' ? 'w-1/2' : 'w-full'
                    }`}
                  />
                </div>

                {/* Processing */}
                <div className='flex flex-col items-center flex-1'>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 relative transition-colors duration-500 ${
                      stage === 'completed'
                        ? 'bg-[#36D399]'
                        : stage === 'placed'
                        ? isDarkMode
                          ? 'bg-[#2a2a2d]'
                          : 'bg-gray-200'
                        : 'bg-[#F1CB68]'
                    }`}
                  >
                    {stage === 'completed' || stage === 'open' ? (
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
                    ) : stage === 'processing' ? (
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
                    ) : (
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`}
                      />
                    )}
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
                  className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-[#2a2a2d]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-700 ${
                      stage === 'completed'
                        ? 'w-full bg-[#36D399]'
                        : stage === 'open'
                        ? 'w-1/2 bg-[#F1CB68]'
                        : 'w-0 bg-[#F1CB68]'
                    }`}
                  />
                </div>

                {/* Completed */}
                <div className='flex flex-col items-center flex-1'>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-500 ${
                      stage === 'completed'
                        ? 'bg-[#36D399]'
                        : isDarkMode
                        ? 'bg-[#2a2a2d]'
                        : 'bg-gray-200'
                    }`}
                  >
                    {stage === 'completed' ? (
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
                    ) : (
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      stage === 'completed'
                        ? isDarkMode
                          ? 'text-white'
                          : 'text-black'
                        : isDarkMode
                        ? 'text-gray-500'
                        : 'text-gray-600'
                    }`}
                  >
                    Completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {stage === 'open' && (
            <p
              className={`text-xs text-center mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Your order has been submitted to the broker and will complete
              once it fills. You can track it under Recent Trades.
            </p>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={onClose}
              className={`flex-1 py-4 rounded-xl font-bold text-base sm:text-lg border transition-all ${
                isDarkMode
                  ? 'border-[#FFFFFF22] text-white hover:bg-white/5'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                router.push('/dashboard/portfolio/Overview');
              }}
              className='flex-1 py-4 bg-[#F1CB68] text-[#0d0d0f] rounded-xl font-bold text-base sm:text-lg hover:bg-[#d4b55a] transition-all shadow-lg hover:shadow-xl'
            >
              View in Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
