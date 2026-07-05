'use client';

import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import {
  activateListing,
  createOffer,
  deleteListing,
  getListing,
  getListingOffers,
  payListingFee,
} from '@/utils/marketplaceApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export default function InvestmentDetailClient() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  // Prefilled from the listing's asking price once it loads.
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [ownerActionBusy, setOwnerActionBusy] = useState('');
  const router = useRouter();

  // Listing ID: `?id=` first (the static-export-safe /dashboard/marketplace/detail
  // route — a dynamic [id] path can't be prerendered with `output: export`),
  // falling back to the path param for legacy /dashboard/marketplace/<id> links.
  const [queryId, setQueryId] = useState(null);
  const pathId = params?.id && params.id !== '__' ? params.id : null;
  const investmentId = queryId || pathId;

  // API data states
  const [listing, setListing] = useState(null);
  const [listingOffers, setListingOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      setQueryId(id);
    } else if (!params?.id || params.id === '__') {
      setError('Listing not found');
      setLoading(false);
    }
  }, [params]);

  // Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!investmentId) return;

      try {
        setLoading(true);
        setError(null);

        const listingRes = await getListing(investmentId);

        if (listingRes.data) {
          setListing(listingRes.data);
          // Trade Now opens the offer modal — start from the asking price
          // rather than a placeholder amount.
          if (listingRes.data.askingPrice) {
            setOfferAmount(
              Number(listingRes.data.askingPrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })
            );
          }
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
        // Handle 405 or 400 errors gracefully
        if (
          err.status === 405 ||
          err.status === 400 ||
          err.message?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('unsupported operand')
        ) {
          // Silently handle - endpoint has issues or not implemented yet
          setListing(null);
        } else {
          setError(err.data?.detail || err.message || 'Failed to load listing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [investmentId]);

  // Deep link: ?buy=1 (Buy buttons on the marketplace lists / the public-page
  // guest handoff) opens the offer modal pre-filled with the asking price —
  // a "buy now" is an offer at asking price (offer → accept → escrow).
  const buyHandled = useRef(false);
  useEffect(() => {
    if (buyHandled.current || !listing || typeof window === 'undefined') return;
    if (!new URLSearchParams(window.location.search).get('buy')) return;
    buyHandled.current = true;
    if (listing.askingPrice) {
      setOfferAmount(
        Number(listing.askingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })
      );
    }
    setIsOfferModalOpen(true);
  }, [listing]);

  // Fetch listing offers
  useEffect(() => {
    const fetchOffers = async () => {
      if (!investmentId) return;

      try {
        const offersRes = await getListingOffers(investmentId);

        if (offersRes.data && Array.isArray(offersRes.data)) {
          setListingOffers(offersRes.data);
        } else {
          setListingOffers([]);
        }
      } catch (err) {
        console.error('Error fetching listing offers:', err);
        // Handle 405 or 400 errors gracefully
        if (
          err.status === 405 ||
          err.status === 400 ||
          err.message?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('unsupported operand')
        ) {
          // Silently handle - endpoint has issues or not implemented yet
          setListingOffers([]);
        }
      }
    };

    if (investmentId) {
      fetchOffers();
    }
  }, [investmentId]);

  // Transform API data to match UI structure
  const investment = listing
    ? {
        name: listing.title || listing.assetName || 'Untitled Listing',
        category: listing.category || listing.assetType || 'Other',
        issuer: listing.issuer || listing.sellerName || 'Unknown',
        status:
          listing.status === 'active'
            ? 'Open for Investment'
            : listing.status === 'pending_approval'
              ? 'Pending Approval'
              : listing.status === 'approved'
                ? 'Approved'
                : listing.status === 'rejected'
                  ? 'Rejected'
                  : listing.status === 'sold'
                    ? 'Sold'
                    : listing.status === 'cancelled'
                      ? 'Cancelled'
                      : 'Closed',
        rejectionReason: listing.rejectionReason || listing.rejection_reason || '',
        minimum: listing.askingPrice
          ? `$${listing.askingPrice.toLocaleString()}`
          : '$0',
        askingPriceValue: listing.askingPrice || 0,
        image: listing.thumbnailUrl || listing.imageUrl || null,
        expectedReturns: listing.expectedReturn || '0%',
        duration: listing.duration || 'N/A',
        riskLevel: listing.riskLevel || 'Medium',
        slotsAvailable: listing.slotsAvailable || 'N/A',
        description: listing.description || '',
        currency: listing.currency || 'USD',
        listingFee: listing.listingFee || 0,
        createdAt: listing.createdAt || new Date().toISOString(),
      }
    : {
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

  // Owner controls: only the user who created the listing can manage its lifecycle
  const listingStatus = (listing?.status || '').toLowerCase();
  const ownerId =
    listing?.ownerId || listing?.sellerId || listing?.userId || null;
  const isOwner = !!listing && !!user?.id && !!ownerId && ownerId === user.id;
  const feePaid = listing?.feePaid ?? listing?.listingFeePaid ?? false;

  const runOwnerAction = async (
    action,
    fn,
    successMsg,
    { refetch = true } = {},
  ) => {
    setOwnerActionBusy(action);
    try {
      await fn();
      toast.success(successMsg);
      if (refetch && investmentId) {
        const res = await getListing(investmentId);
        if (res.data) setListing(res.data);
      }
    } catch (err) {
      toast.error(
        err?.data?.detail || err?.message || `Failed to ${action} listing`,
      );
    } finally {
      setOwnerActionBusy('');
    }
  };

  const handlePayFee = () =>
    runOwnerAction(
      'pay fee',
      () => payListingFee(investmentId),
      'Listing fee paid',
    );
  const handleActivate = () =>
    runOwnerAction(
      'activate',
      () => activateListing(investmentId),
      'Listing is now active',
    );
  const handleCancel = () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Cancel this listing? This cannot be undone.')
    )
      return;
    runOwnerAction(
      'cancel',
      () => deleteListing(investmentId),
      'Listing cancelled',
      { refetch: false },
    ).then(() => router.push('/dashboard/marketplace'));
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
            {loading ? (
              <div className='flex flex-col items-center justify-center py-24 gap-3'>
                <div className='w-10 h-10 border-2 border-[#F1CB68] border-t-transparent rounded-full animate-spin' />
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Loading listing…
                </p>
              </div>
            ) : !listing ? (
              <div className='flex flex-col items-center justify-center py-24 gap-4 text-center'>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  This listing isn&apos;t available
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {error || 'It may have been sold or removed.'}
                </p>
                <button
                  onClick={() => router.push('/dashboard/marketplace')}
                  className='px-6 py-2.5 bg-[#F1CB68] text-[#101014] font-semibold rounded-lg hover:bg-[#C49D2E] transition-all'
                >
                  Back to marketplace
                </button>
              </div>
            ) : (
              <>
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
                {isOwner ? (
                  <div className='flex flex-wrap items-center gap-2'>
                    {listingStatus === 'approved' && !feePaid && (
                      <button
                        onClick={handlePayFee}
                        disabled={!!ownerActionBusy}
                        className='px-4 py-2 bg-[#F1CB68] text-[#101014] font-semibold rounded-lg hover:bg-[#C49D2E] transition-all disabled:opacity-60'
                      >
                        {ownerActionBusy === 'pay fee'
                          ? 'Processing…'
                          : 'Pay Listing Fee'}
                      </button>
                    )}
                    {listingStatus === 'approved' && (
                      <button
                        onClick={handleActivate}
                        disabled={!!ownerActionBusy}
                        className='px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-60'
                      >
                        {ownerActionBusy === 'activate'
                          ? 'Activating…'
                          : 'Activate Listing'}
                      </button>
                    )}
                    {listingStatus !== 'sold' &&
                      listingStatus !== 'cancelled' && (
                        <button
                          onClick={handleCancel}
                          disabled={!!ownerActionBusy}
                          className='px-4 py-2 font-semibold rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-60'
                        >
                          {ownerActionBusy === 'cancel'
                            ? 'Cancelling…'
                            : 'Cancel Listing'}
                        </button>
                      )}
                  </div>
                ) : (
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
                )}
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
                <div
                  className={`w-2 h-2 rounded-full ${
                    listingStatus === 'rejected' || listingStatus === 'cancelled'
                      ? 'bg-red-500'
                      : listingStatus === 'pending_approval'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    listingStatus === 'rejected' || listingStatus === 'cancelled'
                      ? 'text-red-500'
                      : listingStatus === 'pending_approval'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }`}
                >
                  {investment.status}
                </span>
              </div>

              {/* Rejection reason */}
              {listingStatus === 'rejected' && investment.rejectionReason && (
                <div className='mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4'>
                  <p className='text-sm font-semibold text-red-400 mb-1'>Rejection reason</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {investment.rejectionReason}
                  </p>
                </div>
              )}
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
              className={`mb-6 border-b ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                  scroll-behavior: smooth;
                }
              `}</style>
              <div className='overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0'>
                <div className='flex gap-4 md:gap-6 min-w-max md:min-w-0'>
                  {['overview', 'performance', 'documents', 'faq'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all relative shrink-0 whitespace-nowrap ${
                        activeTab === tab
                          ? isDarkMode
                            ? 'text-white'
                            : 'text-gray-900'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className='flex items-center gap-1.5 sm:gap-2'>
                        {tab === 'overview' && (
                          <svg
                            width='14'
                            height='14'
                            className='sm:w-4 sm:h-4 shrink-0'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                          >
                            <circle cx='12' cy='12' r='10' strokeWidth='2' />
                          </svg>
                        )}
                        {tab === 'performance' && (
                          <svg
                            width='14'
                            height='14'
                            className='sm:w-4 sm:h-4 shrink-0'
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
                            width='14'
                            height='14'
                            className='sm:w-4 sm:h-4 shrink-0'
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
                            width='14'
                            height='14'
                            className='sm:w-4 sm:h-4 shrink-0'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                          >
                            <circle cx='12' cy='12' r='10' strokeWidth='2' />
                            <path
                              d='M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3'
                              strokeWidth='2'
                            />
                            <line
                              x1='12'
                              y1='17'
                              x2='12'
                              y2='17'
                              strokeWidth='2'
                            />
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
              </div>
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
              </>
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
        listingId={investmentId}
        onOfferCreated={() => {
          // Refresh offers after creating
          if (investmentId) {
            getListingOffers(investmentId)
              .then(res => {
                if (res.data && Array.isArray(res.data)) {
                  setListingOffers(res.data);
                }
              })
              .catch(err => {
                console.error('Error refreshing offers:', err);
              });
          }
        }}
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
  listingId,
  onOfferCreated,
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real listing values only — no invented fallbacks on a financial modal.
  const listedPrice =
    investment?.askingPriceValue ||
    parseFloat(investment?.minimum?.replace(/[^0-9.]/g, '')) ||
    0;
  const returnRate =
    parseFloat(investment?.expectedReturns?.replace('%', '')) || 0;
  const offerValue = parseFloat(offerAmount.replace(/,/g, '')) || 0;
  const transactionFee = (offerValue * 0.025).toFixed(2);
  const total = (offerValue + parseFloat(transactionFee)).toFixed(2);
  // Only meaningful when the offer is actually below a known listed price.
  const percentageBelow =
    listedPrice > 0 && offerValue > 0 && offerValue < listedPrice
      ? (((listedPrice - offerValue) / listedPrice) * 100).toFixed(0)
      : null;

  const handleSendOffer = async () => {
    if (!listingId) {
      toast.error('Listing ID is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const offerAmountValue = parseFloat(offerAmount.replace(/,/g, ''));
      if (isNaN(offerAmountValue) || offerAmountValue <= 0) {
        toast.error('Please enter a valid offer amount');
        setIsSubmitting(false);
        return;
      }

      const offerData = {
        offerAmount: offerAmountValue,
        currency: investment?.currency || 'USD',
        message: offerMessage || undefined,
      };

      const response = await createOffer(listingId, offerData);

      if (response.data) {
        toast.success('Offer submitted successfully!');
        if (onOfferCreated) {
          onOfferCreated();
        }
        onClose();
        // Reset form back to the listed price
        setOfferAmount(
          listedPrice
            ? listedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })
            : ''
        );
        setOfferMessage('');
      } else {
        toast.error('Failed to submit offer');
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      // Machine-readable codes from POST /listings/{id}/offers — route the
      // user to the step they still owe instead of a generic failure.
      const code = err?.data?.error?.code;
      if (err?.status === 401 || code === 'AUTH_REQUIRED') {
        toast.info('Please log in to continue with the purchase.');
        router.push('/login');
      } else if (code === 'KYC_REQUIRED') {
        toast.info('Identity verification is required before buying. Complete KYC to continue.');
        router.push('/dashboard/kyc');
      } else if (code === 'SUBSCRIPTION_REQUIRED') {
        toast.info('An active subscription is required to buy. Choose a plan to continue.');
        router.push('/dashboard/settings?tab=payment');
      } else if (code === 'OFFER_LIMIT_REACHED') {
        toast.info(err?.data?.message || 'You have reached your plan’s offer limit. Upgrade for more.');
      } else if (code === 'OWN_LISTING') {
        toast.info('This is your own listing — you can’t buy it.');
      } else if (code === 'STAFF_CANNOT_BUY') {
        toast.info('Staff accounts cannot make purchases.');
      } else {
        toast.error(err?.data?.message || err?.data?.detail || err?.message || 'Failed to submit offer');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Listing image (branded placeholder when the asset has none) */}
            <div className='mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-[#F1CB68] to-[#8B7355] h-40 flex items-center justify-center'>
              {investment?.image ? (
                <img
                  src={investment.image}
                  alt={investment?.name || 'Listing'}
                  className='w-full h-full object-cover'
                />
              ) : (
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
              )}
            </div>

            {/* Investment Details */}
            <div className='mb-6'>
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {investment?.name || 'Listing'}
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

              {returnRate > 0 && (
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
              )}
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
              {percentageBelow && (
                <p className='text-xs text-[#F1CB68] mt-1'>
                  {percentageBelow}% below listing price
                </p>
              )}
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
                disabled={isSubmitting}
                className={`w-full py-3 bg-[#F1CB68] text-[#101014] font-semibold rounded-lg hover:bg-[#C49D2E] transition-all ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Send Offer'}
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
