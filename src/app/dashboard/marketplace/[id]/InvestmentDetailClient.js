'use client';

import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function InvestmentDetailClient() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('1,100.00');
  const [offerMessage, setOfferMessage] = useState('');
  const router = useRouter();

  // Get ID from params
  const investmentId = params?.id;

  // Mock data - in real app, fetch based on investmentId
  const investment = {
    name: 'Silver Heights Bond Fund',
    category: 'Bonds',
    issuer: 'Highrise Capital',
    status: 'Open for Investment',
    minimum: '$25,000',
    expectedReturns: '7.2%',
    duration: '24 months',
    riskLevel: 'Medium',
    slotsAvailable: '32/50',
  };

  return (
    <div
      className={`flex h-screen ${isDarkMode ? 'bg-brand-bg' : 'bg-gray-50'}`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='p-4 md:p-6 lg:p-8'>
            {/* Header Section */}
            <div
              className={`rounded-2xl border p-6 mb-6 ${
                isDarkMode
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Category Badge */}
              <div className='flex items-center justify-between mb-4'>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#222126] to-[#111116] text-[#F1CB68]'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {investment.category}
                </span>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className='px-6 py-2 bg-[#F1CB68] text-[#101014] font-semibold rounded-lg hover:bg-[#C49D2E] transition-all flex items-center gap-2'
                >
                  Trade Now
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path d='M5 12h14M12 5l7 7-7 7' strokeWidth='2' />
                  </svg>
                </button>
              </div>

              {/* Title */}
              <h1
                className={`text-3xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {investment.name}
              </h1>

              {/* Issuer */}
              <div className='flex items-center gap-2 mb-4'>
                <div className='flex items-center justify-center'>
                  <span>
                    <img src='/icons/Highrise.svg' alt='Highrise' />
                  </span>
                </div>
                <span
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Issued by {investment.issuer}
                </span>
              </div>

              {/* Status */}
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full' />
                <span className='text-green-500 text-sm font-medium'>
                  {investment.status}
                </span>
              </div>
            </div>

            {/* Stats Section */}
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
              <StatCard
                icon='Dolarsign.svg'
                label='Minimum Investment'
                value={investment.minimum}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon='Percentage.svg'
                label='Expected Returns'
                value={investment.expectedReturns}
                isDarkMode={isDarkMode}
                highlight={true}
              />
              <StatCard
                icon='Durition.svg'
                label='Duration'
                value={investment.duration}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon='Risk.svg'
                label='Risk Level'
                value={investment.riskLevel}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon='slots.svg'
                label='Slots Available'
                value={investment.slotsAvailable}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Tabs */}
            <div
              className={`flex gap-6 mb-6 border-b ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              {['overview', 'performance', 'documents', 'faq'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 text-sm font-medium transition-all relative ${
                    activeTab === tab
                      ? isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className='flex items-center gap-2'>
                    {tab === 'overview' && (
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <circle cx='12' cy='12' r='10' strokeWidth='2' />
                      </svg>
                    )}
                    {tab === 'performance' && (
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <polyline
                          points='22 12 18 12 15 21 9 3 6 12 2 12'
                          strokeWidth='2'
                        />
                      </svg>
                    )}
                    {tab === 'documents' && (
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'
                          strokeWidth='2'
                        />
                      </svg>
                    )}
                    {tab === 'faq' && (
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <circle cx='12' cy='12' r='10' strokeWidth='2' />
                        <path
                          d='M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3'
                          strokeWidth='2'
                        />
                        <line x1='12' y1='17' x2='12' y2='17' strokeWidth='2' />
                      </svg>
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  {activeTab === tab && (
                    <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#F1CB68]' />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
              <div
                className={`rounded-2xl p-6 ${
                  isDarkMode ? '' : 'bg-white border border-gray-200'
                }`}
                style={
                  isDarkMode
                    ? {
                        background:
                          'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                      }
                    : {}
                }
              >
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Investment Overview */}
                  <div>
                    <h2
                      className={`text-xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Investment Overview
                    </h2>
                    <p
                      className={`text-sm leading-relaxed mb-6 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      The Silver Heights Bond Fund offers investors exposure to
                      a diversified portfolio of high-grade corporate bonds,
                      with emphasis on the technology and healthcare sectors.
                      The fund aims to provide stable returns with moderate risk
                      through careful selection of issuers with strong credit
                      ratings and sustainable business models.
                    </p>

                    <h3
                      className={`text-lg font-semibold mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Investment Rationale
                    </h3>
                    <div className='space-y-3'>
                      <RationaleItem
                        text='Current market conditions favor fixed-income investments as a hedge against market volatility'
                        isDarkMode={isDarkMode}
                      />
                      <RationaleItem
                        text='Portfolio diversification across multiple sectors provides stability'
                        isDarkMode={isDarkMode}
                      />
                      <RationaleItem
                        text='Rigorous selection criteria ensures only quality issuers are included'
                        isDarkMode={isDarkMode}
                      />
                      <RationaleItem
                        text='Regular quarterly distributions provide predictable income'
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>

                  {/* Asset Security & Investment Objectives */}
                  <div className='space-y-6'>
                    {/* Asset Security */}
                    <div>
                      <h2
                        className={`text-xl font-bold mb-4 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Asset Security
                      </h2>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        The fund is backed by high-quality corporate bonds with
                        an average credit rating of A+. The portfolio is
                        structured to minimize default risk while optimizing for
                        yield.
                      </p>
                    </div>

                    {/* Investment Objectives */}
                    <div>
                      <h2
                        className={`text-xl font-bold mb-4 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Investment Objectives
                      </h2>
                      <div className='space-y-3'>
                        <ObjectiveItem
                          icon='piechart.svg'
                          text='Generate consistent quarterly income'
                          isDarkMode={isDarkMode}
                        />
                        <ObjectiveItem
                          icon='graphchar.svg'
                          text='Preserve capital with minimal volatility'
                          isDarkMode={isDarkMode}
                        />
                        <ObjectiveItem
                          icon='linechart.svg'
                          text='Outperform inflation over the investment period'
                          isDarkMode={isDarkMode}
                        />
                        <ObjectiveItem
                          icon='World.svg'
                          text='Diversify across multiple markets and sectors'
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Performance Metrics
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Performance data will be displayed here...
                </p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Documents
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Investment documents will be listed here...
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  FAQ
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Frequently asked questions will be displayed here...
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        investment={investment}
        isDarkMode={isDarkMode}
        offerAmount={offerAmount}
        setOfferAmount={setOfferAmount}
        offerMessage={offerMessage}
        setOfferMessage={setOfferMessage}
      />
    </div>
  );
}

// StatCard Component
function StatCard({ icon, label, value, isDarkMode, highlight = false }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDarkMode
          ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-2 mb-2'>
        <span className='text-xl'>
          <img src={`/icons/${icon}`} alt={label} className='w-5 h-5' />
        </span>
        <p
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`text-lg font-bold ${
          highlight
            ? 'text-[#F1CB68]'
            : isDarkMode
            ? 'text-white'
            : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// RationaleItem Component
function RationaleItem({ text, isDarkMode }) {
  return (
    <div className='flex items-start gap-3'>
      <div className='flex items-center justify-center shrink-0 mt-0.5'>
        <img src='/icons/tick.svg' alt='Tick' />
      </div>
      <p
        className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {text}
      </p>
    </div>
  );
}

// ObjectiveItem Component
function ObjectiveItem({ icon, text, isDarkMode }) {
  return (
    <div className='flex items-center gap-3'>
      <div className='w-8 h-8 rounded-lg bg-[#F1CB68]/10 flex items-center justify-center shrink-0'>
        <img src={`/icons/${icon}`} alt={text} className='w-5 h-5' />
      </div>
      <p
        className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {text}
      </p>
    </div>
  );
}

// Make Offer Modal Component
function MakeOfferModal({
  isOpen,
  onClose,
  investment,
  isDarkMode,
  offerAmount,
  setOfferAmount,
  offerMessage,
  setOfferMessage,
}) {
  if (!isOpen) return null;

  const listedPrice = 1250.0;
  const returnRate = 12.5;
  const transactionFee = (
    parseFloat(offerAmount.replace(/,/g, '')) * 0.025
  ).toFixed(2);
  const total = (
    parseFloat(offerAmount.replace(/,/g, '')) + parseFloat(transactionFee)
  ).toFixed(2);
  const percentageBelow = (
    ((listedPrice - parseFloat(offerAmount.replace(/,/g, ''))) / listedPrice) *
    100
  ).toFixed(0);

  const handleSendOffer = () => {
    // Handle send offer logic
    console.log('Offer sent:', {
      amount: offerAmount,
      message: offerMessage,
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`w-full max-w-md rounded-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
          }`}
          onClick={e => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-[#F1CB68]' : 'border-gray-200'
            }`}
          >
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Make Your Offer
            </h2>
            <button
              onClick={onClose}
              className={`${
                isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  d='M6 18L18 6M6 6l12 12'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </button>
          </div>

          <div className='p-6'>
            {/* Investment Image */}
            <div className='mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-[#F1CB68] to-[#8B7355] h-40 flex items-center justify-center'>
              <div className='text-6xl opacity-20'>
                <svg
                  width='80'
                  height='80'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='1'
                >
                  <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
                </svg>
              </div>
            </div>

            {/* Investment Details */}
            <div className='mb-6'>
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Fullego Prime Collection #247
              </h3>

              <div className='flex items-center justify-between mb-2'>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Listed Price
                </span>
                <span
                  className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ${listedPrice.toLocaleString()}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Return Rate
                </span>
                <span className='px-3 py-1 bg-[#F1CB68] text-white text-xs font-semibold rounded-full'>
                  +{returnRate}%
                </span>
              </div>
            </div>

            {/* Your Offer Amount */}
            <div className='mb-6'>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Your Offer Amount
              </label>
              <div className='relative'>
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  $
                </span>
                <input
                  type='text'
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-xl font-bold rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:border-[#F1CB68]`}
                />
              </div>
              <p className='text-xs text-[#F1CB68] mt-1'>
                {percentageBelow}% below listing price
              </p>
            </div>

            {/* Add a Message */}
            <div className='mb-6'>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Add a Message
              </label>
              <textarea
                value={offerMessage}
                onChange={e => setOfferMessage(e.target.value)}
                placeholder="Explain why you're making this offer..."
                maxLength={500}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:border-[#F1CB68] resize-none`}
              />
              <div className='flex justify-end mt-1'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {offerMessage.length}/500
                </span>
              </div>
            </div>

            {/* Offer Summary */}
            <div
              className={`rounded-lg p-4 mb-6 ${
                isDarkMode ? 'bg-[#2C2C2E]' : 'bg-gray-50'
              }`}
            >
              <h4
                className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Offer Summary
              </h4>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Your Offer
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    $
                    {parseFloat(offerAmount.replace(/,/g, '')).toLocaleString()}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Transaction Fee (2.5%)
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${parseFloat(transactionFee).toLocaleString()}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between pt-2 border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Total
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${parseFloat(total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={handleSendOffer}
                className='w-full py-3 bg-[#F1CB68] text-[#101014] font-semibold rounded-lg hover:bg-[#C49D2E] transition-all'
              >
                Send Offer
              </button>
              <button
                onClick={onClose}
                className={`w-full py-3 font-medium rounded-lg transition-all ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>

            {/* Info Text */}
            <p
              className={`text-xs text-center mt-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              © Your funds will be held in escrow if offer is accepted
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
