'use client';
import { useTheme } from '@/context/ThemeContext';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import {
  listListings,
  searchMarketplace,
  getMyOffers,
  getMyListings,
  getMarketHighlights,
  getMarketTrends,
  getMarketSummary,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  acceptOffer,
  rejectOffer,
  counterOffer,
  withdrawOffer,
  getEscrow,
  fundEscrow,
  releaseEscrow,
  disputeEscrow,
  refundEscrow,
  createListing,
  getMarketplaceCategories,
} from '@/utils/marketplaceApi';
import { getAssets } from '@/utils/assetsApi';
import {
  categoryGroupConfig,
  getCategoriesByGroup,
  getCategoryGroup,
} from '@/config/assetConfig';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

export default function MarketplacePage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize active tab based on pathname
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const currentPath = pathname || window.location.pathname;
      return currentPath?.includes('/active-offers')
        ? 'active-offers'
        : 'browse';
    }
    return 'browse';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  // Two-level filter: a main category group first (Assets, Portfolio, ...),
  // then optionally one of its subcategories (matches listing.category).
  const [activeGroup, setActiveGroup] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const { isInvestor, isAdmin } = useAuth();
  // GET /marketplace/categories — only categories with live listings, with
  // counts: [{ category, categoryGroup, count }].
  const [marketCategories, setMarketCategories] = useState(null);

  useEffect(() => {
    getMarketplaceCategories()
      .then(res => {
        if (Array.isArray(res?.data)) setMarketCategories(res.data);
      })
      .catch(() => {
        // Availability unknown — every group stays visible.
      });
  }, []);

  // A guest clicked Buy on the public marketplace and just finished
  // login/onboarding — take them straight to that listing to complete it.
  useEffect(() => {
    if (!isInvestor) return;
    let pending = null;
    try {
      const raw = localStorage.getItem('pendingBuyListing');
      if (raw) pending = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    if (pending?.id) {
      try {
        localStorage.removeItem('pendingBuyListing');
      } catch {
        /* ignore */
      }
      router.push(`/dashboard/marketplace/detail?id=${pending.id}&buy=1`);
    }
  }, [isInvestor, router]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState('price-low-high');
  const [priceRange, setPriceRange] = useState([100, 10000]);

  // API data states
  const [listings, setListings] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myListings, setMyListings] = useState([]);
  // Start true so the tab shows skeletons (never the empty state) until the
  // first fetch has actually resolved.
  const [myOffersLoading, setMyOffersLoading] = useState(true);
  const [myListingsLoading, setMyListingsLoading] = useState(true);
  const [marketHighlights, setMarketHighlights] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [marketSummary, setMarketSummary] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set active tab based on pathname changes
  useEffect(() => {
    const currentPath =
      pathname ||
      (typeof window !== 'undefined' ? window.location.pathname : '');
    // Admins don't trade — no Active Offers tab; the URL falls back to browse.
    const newTab =
      !isAdmin && currentPath?.includes('/active-offers')
        ? 'active-offers'
        : 'browse';
    // Only update if tab actually changed
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [pathname, activeTab, isAdmin]);

  // Fetch marketplace listings. Filtering and sorting are server-side via
  // GET /marketplace/search: category / category_group, min_price / max_price,
  // sort_by=price + sort_order. Debounced so slider drags don't spam the API.
  useEffect(() => {
    if (activeTab !== 'browse') return;

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = {
          sortBy: 'price',
          sortOrder: sortBy === 'price-high-low' ? 'desc' : 'asc',
        };
        if (activeCategory !== 'All') {
          searchParams.category = activeCategory;
        } else if (activeGroup !== 'All') {
          searchParams.categoryGroup = activeGroup;
        }
        // Slider is in $k; only send prices once moved off the defaults so
        // listings outside the default band don't vanish.
        if (priceRange[0] > 100) searchParams.minPrice = priceRange[0] * 1000;
        if (priceRange[1] < 10000) searchParams.maxPrice = priceRange[1] * 1000;

        const listingsRes = await searchMarketplace(searchParams);

        if (listingsRes.data && Array.isArray(listingsRes.data)) {
          // Transform API data to match UI structure
          const transformedListings = listingsRes.data.map(listing => ({
            id: listing.id,
            name: listing.title || listing.assetName || 'Untitled Listing',
            category: listing.category || listing.assetType || 'Others',
            // Provided by the backend since the category backfill; config
            // mapping is the fallback for anything older.
            categoryGroup:
              listing.categoryGroup || getCategoryGroup(listing.category),
            assetType: listing.assetType || listing.category || 'Others',
            // Standardized: thumbnail_url for cards, image_url for detail.
            image: listing.thumbnailUrl || listing.imageUrl || null,
            imageUrl: listing.imageUrl || null,
            minimum: listing.askingPrice ? `$${listing.askingPrice.toLocaleString()}` : '$0',
            minimumValue: listing.askingPrice || 0,
            targetIRR: listing.expectedReturn || '0%',
            returnValue: parseFloat(listing.expectedReturn?.replace('%', '')) || 0,
            riskLevel: listing.riskLevel || 'Medium',
            type: listing.type || '#Service',
            subType: listing.subType || '#Commercial',
            status: listing.status || 'active',
            currency: listing.currency || 'USD',
            description: listing.description || '',
            createdAt: listing.createdAt || new Date().toISOString(),
          }));
          setListings(transformedListings);
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error('Error fetching marketplace listings:', err);
        // Handle 405 or 400 errors gracefully
        if (err.status === 405 || err.status === 400 || 
            err.message?.includes('Method Not Allowed') || 
            err.data?.detail?.includes('Method Not Allowed') ||
            err.data?.detail?.includes('unsupported operand')) {
          // Silently handle - endpoint has issues or not implemented yet
          setListings([]);
        } else {
          setError(err.data?.detail || err.message || 'Failed to load listings');
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchListings, 350);
    return () => clearTimeout(timer);
  }, [activeTab, activeGroup, activeCategory, priceRange, sortBy]);

  // Watchlist (auth) — its own callback so the card heart toggles can refresh it.
  const refreshWatchlist = useCallback(async () => {
    try {
      const res = await getWatchlist();
      const data = res?.data || res;
      setWatchlistItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!(err?.status === 405 || err?.status === 400 || err?.status === 422)) {
        console.error('Error fetching watchlist:', err);
      }
    }
  }, []);

  // Fetch Market Highlights cards, trends graph and summary stat tiles
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [highlightsRes, trendsRes, summaryRes] = await Promise.allSettled([
          getMarketHighlights({ timeRange: '1d' }),
          getMarketTrends({ timeRange: '30d', granularity: 'daily' }),
          getMarketSummary({ timeRange: '30d' }),
        ]);

        // Handle Market Highlights
        if (highlightsRes.status === 'fulfilled') {
          try {
            const highlightsData = highlightsRes.value.data || highlightsRes.value;
            if (highlightsData.highlights && Array.isArray(highlightsData.highlights)) {
              setMarketHighlights(highlightsData.highlights);
            } else if (Array.isArray(highlightsData)) {
              setMarketHighlights(highlightsData);
            } else {
              setMarketHighlights([]);
            }
          } catch (err) {
            // Handle 405, 400, or 422 errors gracefully
            if (highlightsRes.value?.status === 405 || 
                highlightsRes.value?.status === 400 || 
                highlightsRes.value?.status === 422 ||
                err.status === 405 || 
                err.status === 400 || 
                err.status === 422) {
              setMarketHighlights([]);
            }
          }
        } else {
          // Rejected promise - check if it's a 405/400/422 error
          const error = highlightsRes.reason;
          if (error?.status === 405 || error?.status === 400 || error?.status === 422) {
            setMarketHighlights([]);
          }
        }

        // Handle Market Trends
        if (trendsRes.status === 'fulfilled') {
          try {
            const trendsData = trendsRes.value.data || trendsRes.value;
            if (trendsData.trends && Array.isArray(trendsData.trends)) {
              setMarketTrends(trendsData.trends);
            } else if (Array.isArray(trendsData)) {
              setMarketTrends(trendsData);
            } else {
              setMarketTrends([]);
            }
          } catch (err) {
            // Handle 405, 400, or 422 errors gracefully
            if (trendsRes.value?.status === 405 || 
                trendsRes.value?.status === 400 || 
                trendsRes.value?.status === 422 ||
                err.status === 405 || 
                err.status === 400 || 
                err.status === 422) {
              setMarketTrends([]);
            }
          }
        } else {
          // Rejected promise - check if it's a 405/400/422 error
          const error = trendsRes.reason;
          if (error?.status === 405 || error?.status === 400 || error?.status === 422) {
            setMarketTrends([]);
          }
        }

        // Handle Market Summary (stat tiles under the highlights)
        if (summaryRes.status === 'fulfilled') {
          const summaryData = summaryRes.value?.data || summaryRes.value;
          setMarketSummary(
            summaryData && typeof summaryData === 'object' && !Array.isArray(summaryData)
              ? summaryData
              : null
          );
        } else {
          setMarketSummary(null);
        }
      } catch (err) {
        // General error handling - don't break the UI
        console.error('Error fetching market data:', err);
      }
    };

    if (activeTab === 'browse') {
      fetchMarketData();
      refreshWatchlist();
    }
  }, [activeTab, refreshWatchlist]);

  // Fetch user's offers (exposed as a callback so offer/escrow actions can refresh)
  const fetchMyOffers = useCallback(async () => {
    setMyOffersLoading(true);
    try {
      const offersRes = await getMyOffers();

      if (offersRes.data && Array.isArray(offersRes.data)) {
        // Transform API data to match UI structure
        const transformedOffers = offersRes.data.map(offer => ({
          id: offer.id,
          assetName: offer.listingTitle || offer.assetName || 'Unknown Asset',
          assetThumbnail: offer.assetThumbnail || offer.thumbnail || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
          category: offer.assetType || offer.category || 'Other',
          offerAmount: offer.offerAmount ? `$${offer.offerAmount.toLocaleString()}` : '$0',
          offerAmountValue: offer.offerAmount || 0,
          currency: offer.currency || 'USD',
          offerStatus: offer.status === 'pending' ? 'Pending' :
                      offer.status === 'accepted' ? 'Accepted' :
                      offer.status === 'rejected' ? 'Rejected' :
                      offer.status === 'countered' ? 'Countered' :
                      offer.status === 'expired' ? 'Expired' :
                      offer.status === 'withdrawn' ? 'Withdrawn' : 'Pending',
          // Backend sends lowercase 'buyer' | 'seller' — buyer means an offer
          // the user sent, seller means one received on their own listing.
          role:
            (offer.role || 'buyer').toLowerCase() === 'seller'
              ? 'Seller'
              : 'Buyer',
          counterparty: offer.counterparty || offer.sellerName || 'Unknown',
          counterpartyId: offer.counterpartyId || offer.sellerId || '',
          dateUpdated: offer.updatedAt || offer.createdAt || new Date().toISOString(),
          listingId: offer.listingId || offer.id,
          // The note the buyer attached to the offer. Field name can vary by
          // backend shape, so probe the common ones.
          message:
            offer.message || offer.note || offer.buyerMessage ||
            offer.offerMessage || offer.comment || '',
          // Escrow is created when an offer is accepted
          escrowId: offer.escrowId || offer.escrow?.id || null,
        }));
        setMyOffers(transformedOffers);
      } else {
        setMyOffers([]);
      }
    } catch (err) {
      // Check if this is a 422 error with UUID validation issue (backend routing problem)
      // The error detail is an array with objects like: {loc: ['path', 'offer_id'], msg: '...', type: 'uuid_parsing'}
      const is422UUIDError = err.status === 422 && (
        err.message?.includes('valid UUID') ||
        err.message?.includes('uuid_parsing') ||
        (Array.isArray(err.data?.detail) && err.data.detail.some(d =>
          (typeof d === 'object' && (d?.msg?.includes('valid UUID') || d?.type === 'uuid_parsing')) ||
          (typeof d === 'string' && d.includes('valid UUID'))
        )) ||
        (typeof err.data?.detail === 'string' && err.data.detail.includes('valid UUID'))
      );

      // Handle 405, 400, or 422 UUID errors gracefully
      // 422 UUID errors = backend routing issue (treating "my" as UUID parameter)
      if (err.status === 405 || err.status === 400 || is422UUIDError ||
          err.message?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('Method Not Allowed') ||
          err.data?.detail?.includes('unsupported operand')) {
        // Silently handle - endpoint has issues, backend routing problem, or not implemented yet
        setMyOffers([]);
      } else {
        // Only log unexpected errors
        console.error('Error fetching my offers:', err);
      }
    } finally {
      setMyOffersLoading(false);
    }
  }, []);

  // Fetch the user's own listings (all statuses) for the "My Listings" view.
  // pending_offers_count drives the "N pending offers" badge on each card.
  const fetchMyListings = useCallback(async () => {
    setMyListingsLoading(true);
    try {
      const listingsRes = await getMyListings();

      if (listingsRes.data && Array.isArray(listingsRes.data)) {
        const transformed = listingsRes.data.map(listing => ({
          id: listing.id,
          assetId: listing.assetId || null,
          title: listing.title || 'Untitled Listing',
          category: listing.category || 'Others',
          categoryGroup:
            listing.categoryGroup || getCategoryGroup(listing.category),
          askingPrice: listing.askingPrice || 0,
          currency: listing.currency || 'USD',
          status: (listing.status || 'draft').toLowerCase(),
          listingFee: listing.listingFee ?? null,
          rejectionReason: listing.rejectionReason || null,
          thumbnail: listing.thumbnailUrl || listing.imageUrl || null,
          createdAt: listing.createdAt || null,
          pendingOffersCount: listing.pendingOffersCount || 0,
        }));
        setMyListings(transformed);
      } else {
        setMyListings([]);
      }
    } catch (err) {
      if (err.status === 405 || err.status === 400 || err.status === 404) {
        // Endpoint not deployed on this environment yet
        setMyListings([]);
      } else {
        console.error('Error fetching my listings:', err);
      }
    } finally {
      setMyListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'active-offers') {
      fetchMyOffers();
      fetchMyListings();
    }
  }, [activeTab, fetchMyOffers, fetchMyListings]);

  // Tabs come from GET /marketplace/categories: main groups with at least one
  // live listing first, then the non-empty subcategories of the selected
  // group. A new category appears automatically once something is listed
  // under it.
  const apiGroups = marketCategories
    ? [...new Set(marketCategories.map(c => c.categoryGroup))]
    : null;
  const groupTabs = [
    'All',
    ...Object.keys(categoryGroupConfig).filter(
      group => !apiGroups || apiGroups.includes(group)
    ),
    ...(apiGroups || []).filter(group => !categoryGroupConfig[group]),
  ];
  // Config order first, then any backend category the config doesn't know
  // (e.g. the backfilled "Other").
  const groupCategories = marketCategories
    ? marketCategories.filter(c => c.categoryGroup === activeGroup)
    : [];
  const configOrder = getCategoriesByGroup(activeGroup).map(cat => cat.id);
  const subCategoryTabs =
    activeGroup === 'All'
      ? []
      : [
          ...groupCategories
            .filter(c => configOrder.includes(c.category))
            .sort(
              (a, b) =>
                configOrder.indexOf(a.category) - configOrder.indexOf(b.category)
            ),
          ...groupCategories.filter(c => !configOrder.includes(c.category)),
        ];

  // Transform market highlights API data to UI format
  const marketData = (marketHighlights && Array.isArray(marketHighlights) ? marketHighlights : []).map(highlight => ({
    name: highlight.category || highlight.name || 'Unknown',
    value: highlight.changePercentage 
      ? `${highlight.changePercentage > 0 ? '+' : ''}${highlight.changePercentage.toFixed(1)}%`
      : highlight.value || '0%',
    isPositive: highlight.isPositive !== undefined 
      ? highlight.isPositive 
      : (highlight.changePercentage > 0 || highlight.trend === 'up'),
  }));

  // Transform market trends API data to chart format
  const chartData = marketTrends.length > 0
    ? marketTrends.map(trend => ({ value: trend.value || 0 }))
    : [{ value: 20 }, { value: 35 }, { value: 25 }, { value: 45 }, { value: 38 }, { value: 52 }, { value: 48 }, { value: 60 }];

  // Transform watchlist API data to UI format
  const transformedWatchlistItems = (watchlistItems && Array.isArray(watchlistItems) ? watchlistItems : []).map(item => ({
    id: item.id || item.watchlistItemId || item.listingId,
    name: item.listingTitle || item.name || 'Unknown Listing',
    icon: '⭐',
    listingId: item.listingId,
    price: item.askingPrice,
    currency: item.currency || 'USD',
    priceChange: item.priceChangeSinceAdded,
    priceChangePercentage: item.priceChangePercentage,
  }));

  // Category/group, price range and sorting are applied server-side by
  // /marketplace/search — the fetched set is already the final one.
  const investmentFunds = listings;

  // listing_id → watchlist_item_id, for the heart icon on each card
  const watchlistIdByListing = new Map(
    (watchlistItems || []).map(w => [w.listingId, w.id || w.watchlistItemId])
  );

  const handleToggleWatchlist = async fund => {
    const watchlistItemId = watchlistIdByListing.get(fund.id);
    try {
      if (watchlistItemId) {
        await removeFromWatchlist(watchlistItemId);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist({ listingId: fund.id });
        toast.success('Added to watchlist');
      }
      refreshWatchlist();
    } catch (err) {
      toast.error(
        err?.data?.detail || err?.message || 'Failed to update watchlist'
      );
    }
  };

  return (
    <>
      <div>
        {/* Hero Section - Only show for Browse tab */}
        {activeTab === 'browse' && <HeroSection isDarkMode={isDarkMode} />}

        {/* Main Content */}
        <div>
              {/* Main Tabs - Browse and Active Offers */}
              <div className='mb-6'>
                <div
                  className={`flex gap-2 border-b ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      // Navigate immediately - don't wait for data
                      router.push('/dashboard/marketplace');
                    }}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${
                      activeTab === 'browse'
                        ? isDarkMode
                          ? 'text-white'
                          : 'text-black'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Browse
                    {activeTab === 'browse' && (
                      <div
                        className='absolute bottom-0 left-0 right-0 h-0.5'
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(90deg, #F1CB68 0%, #F1CB68 100%)'
                            : '#F1CB68',
                        }}
                      />
                    )}
                  </button>
                  {!isAdmin && (
                  <button
                    onClick={() => {
                      // Navigate immediately - don't wait for data
                      router.push('/dashboard/marketplace/active-offers');
                    }}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${
                      activeTab === 'active-offers'
                        ? isDarkMode
                          ? 'text-white'
                          : 'text-black'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Active Offers
                    {activeTab === 'active-offers' && (
                      <div
                        className='absolute bottom-0 left-0 right-0 h-0.5'
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(90deg, #F1CB68 0%, #F1CB68 100%)'
                            : '#F1CB68',
                        }}
                      />
                    )}
                  </button>
                  )}
                </div>
              </div>

              {/* Browse Tab Content */}
              {activeTab === 'browse' && (
                <>
                  {/* Category Tabs - Full Width */}
                  <div className='relative'>
                    <div className='flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide'>
                      {groupTabs.map(group => (
                        <button
                          key={group}
                          onClick={() => {
                            setActiveGroup(group);
                            setActiveCategory('All');
                          }}
                          className={`whitespace-nowrap px-6 py-1.5 text-xs font-medium transition-all rounded-full ${
                            activeGroup === group
                              ? isDarkMode
                                ? 'text-white'
                                : 'text-black'
                              : isDarkMode
                              ? 'text-gray-400 hover:text-white bg-white/5'
                              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                          }`}
                          style={
                            activeGroup === group
                              ? isDarkMode
                                ? {
                                    background:
                                      'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                                  }
                                : {
                                    background: 'rgba(241, 203, 104, 0.2)',
                                  }
                              : {}
                          }
                        >
                          {group}
                        </button>
                      ))}
                      <div className='ml-auto relative'>
                        <button
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                          className={`p-2 rounded-lg shrink-0 transition-all ${
                            isFilterOpen
                              ? 'bg-[#F1CB68] text-white'
                              : isDarkMode
                              ? 'bg-white/5 text-gray-400 hover:text-white'
                              : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <img
                            src='/icons/menuicons.svg'
                            alt='Filter'
                            className={`transition-transform duration-300 ${
                              isFilterOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Subcategory chips for the selected group (non-empty only) */}
                    {subCategoryTabs.length > 0 && (
                      <div className='flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide'>
                        <button
                          key='all-subcategories'
                          onClick={() => setActiveCategory('All')}
                          className={`whitespace-nowrap px-4 py-1 text-xs font-medium transition-all rounded-full ${
                            activeCategory === 'All'
                              ? 'text-[#101014] bg-[#F1CB68]'
                              : isDarkMode
                              ? 'text-gray-400 hover:text-white bg-white/5'
                              : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                          }`}
                        >
                          All {activeGroup}
                        </button>
                        {subCategoryTabs.map(({ category, count }) => (
                          <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`whitespace-nowrap px-4 py-1 text-xs font-medium transition-all rounded-full ${
                              activeCategory === category
                                ? 'text-[#101014] bg-[#F1CB68]'
                                : isDarkMode
                                ? 'text-gray-400 hover:text-white bg-white/5'
                                : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                            }`}
                          >
                            {category} ({count})
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Filter Panel */}
                    <FilterPanel
                      isOpen={isFilterOpen}
                      onClose={() => setIsFilterOpen(false)}
                      isDarkMode={isDarkMode}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                    />
                  </div>

                  <div className='flex flex-col lg:flex-row gap-4'>
                    {/* Left Section - Cards */}
                    <div className='flex-1'>
                      {/* Investment Cards Grid */}
                      {loading ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <ListingSkeletonCard key={i} isDarkMode={isDarkMode} />
                          ))}
                        </div>
                      ) : investmentFunds.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
                          {investmentFunds.map(fund => (
                            <InvestmentCard
                              key={fund.id}
                              fund={fund}
                              isDarkMode={isDarkMode}
                              isWatched={watchlistIdByListing.has(fund.id)}
                              onToggleWatchlist={handleToggleWatchlist}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className='flex items-center justify-center py-12'>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No listings available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar - Watchlist */}
                    <div className='lg:w-72'>
                      {/* Market Highlights - Full Width */}
                      <div
                        className={`rounded-2xl border p-4 mb-4 ${
                          isDarkMode
                            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <h3
                            className={`text-base font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            Market Highlights
                          </h3>
                          <button className='text-[#F1CB68] text-sm'>→</button>
                        </div>

                        {/* Market Data */}
                        {marketData.length > 0 && (
                          <div className='space-y-3 mb-4'>
                            {marketData.map((item, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between'
                              >
                                <span
                                  className={`text-sm ${
                                    isDarkMode
                                      ? 'text-gray-300'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {item.name}
                                </span>
                                <span
                                  className={`text-sm font-semibold ${
                                    item.isPositive
                                      ? 'text-green-500'
                                      : 'text-red-500'
                                  }`}
                                >
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Chart — spans the full card width */}
                        <div className='h-32 w-full'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={chartData}>
                              <Line
                                type='monotone'
                                dataKey='value'
                                stroke='#F1CB68'
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Stat tiles — GET /marketplace/market-summary */}
                        {marketSummary && (
                          <MarketSummaryTiles
                            summary={marketSummary}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </div>
                      {/* Your Watchlist */}
                      <div
                        className={`rounded-2xl border p-4 ${
                          isDarkMode
                            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-3'>
                          <h3
                            className={`text-base font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            Your Watchlist
                          </h3>
                          <button className='text-[#F1CB68] text-sm'>→</button>
                        </div>

                        {/* Scrolls beyond ~6 items so the card keeps its height */}
                        <div className='space-y-3 max-h-64 overflow-y-auto pr-1 filter-panel-scroll'>
                          {transformedWatchlistItems.length > 0 ? (
                            transformedWatchlistItems.map((item) => (
                              <div
                                key={item.id || item.listingId}
                                className='flex items-center justify-between'
                              >
                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                  <span className='text-yellow-500 shrink-0'>
                                    {item.icon}
                                  </span>
                                  <span
                                    className={`text-sm truncate ${
                                      isDarkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-700'
                                    }`}
                                    title={item.name}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                                {/* Removal happens via the card heart; this views the listing */}
                                <button
                                  title='View listing'
                                  className={`shrink-0 ml-2 transition-colors ${
                                    isDarkMode
                                      ? 'text-gray-400 hover:text-white'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                  onClick={() => {
                                    if (!item.listingId) return;
                                    router.push(
                                      `/dashboard/marketplace/detail?id=${item.listingId}`
                                    );
                                  }}
                                >
                                  <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                  >
                                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                                    <circle cx='12' cy='12' r='3' />
                                  </svg>
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className={`text-sm text-center py-4 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              No items in watchlist
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Active Offers Tab Content */}
              {activeTab === 'active-offers' && (
                <ActiveOffersContent
                  isDarkMode={isDarkMode}
                  router={router}
                  myOffers={myOffers}
                  myListings={myListings}
                  offersLoading={myOffersLoading}
                  listingsLoading={myListingsLoading}
                  onRefresh={() => {
                    // Accept/reject/withdraw also changes pending_offers_count
                    // on the owner's listings, so refresh both.
                    fetchMyOffers();
                    fetchMyListings();
                  }}
                />
              )}
        </div>
      </div>

      {/* List an Asset Modal */}
      <CreateListingModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        isDarkMode={isDarkMode}
        onCreated={() => {
          setIsListModalOpen(false);
          // Refresh browse listings (public set = APPROVED + ACTIVE by default)
          if (activeTab === 'browse') {
            listListings().catch(() => {});
          }
        }}
      />

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .filter-panel-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .filter-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .filter-panel-scroll::-webkit-scrollbar-thumb {
          background: #f1cb68;
          border-radius: 3px;
        }

        .filter-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: #c19d2f;
        }
      `}</style>
    </>
  );
}

// Active Offers Content Component
function ActiveOffersContent({
  isDarkMode,
  router,
  myOffers = [],
  myListings = [],
  offersLoading = false,
  listingsLoading = false,
  onRefresh,
}) {
  const [activeFilter, setActiveFilter] = useState('My Offers'); // Default filter
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [actionLoading, setActionLoading] = useState({}); // { [offerId_action]: bool }
  const [counterTarget, setCounterTarget] = useState(null); // offer being countered
  const [escrowTarget, setEscrowTarget] = useState(null); // offer whose escrow is open

  const refresh = () => { if (onRefresh) onRefresh(); };

  const runAction = async (offer, action, fn, successMsg) => {
    const key = `${offer.id}_${action}`;
    setActionLoading(p => ({ ...p, [key]: true }));
    try {
      await fn();
      toast.success(successMsg);
      refresh();
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || `Failed to ${action} offer`);
    } finally {
      setActionLoading(p => ({ ...p, [key]: false }));
    }
  };

  const handleAccept = (offer) => runAction(offer, 'accept', () => acceptOffer(offer.id), 'Offer accepted — escrow created');
  const handleReject = (offer) => runAction(offer, 'reject', () => rejectOffer(offer.id), 'Offer rejected');
  const handleWithdraw = (offer) => runAction(offer, 'withdraw', () => withdrawOffer(offer.id), 'Offer withdrawn');

  const offerActionHandlers = {
    onAccept: handleAccept,
    onReject: handleReject,
    onWithdraw: handleWithdraw,
    onCounter: (offer) => setCounterTarget(offer),
    onViewEscrow: (offer) => setEscrowTarget(offer),
    actionLoading,
  };

  // "My Listings" shows the user's own listings (GET /marketplace/listings/my);
  // the other two tabs split GET /marketplace/offers/my by role.
  const isListingsView = activeFilter === 'My Listings';
  // Which fetch backs the current tab — gates skeletons vs. empty state.
  const isLoading = isListingsView ? listingsLoading : offersLoading;

  const getFilteredOffers = () => {
    switch (activeFilter) {
      case 'My Offers':
        return myOffers.filter(offer => offer.role === 'Buyer');
      case 'Received Offers':
        return myOffers.filter(offer => offer.role === 'Seller' || offer.role === 'Lister');
      default:
        return myOffers;
    }
  };

  const filteredOffers = isListingsView ? [] : getFilteredOffers();

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Accepted':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Countered':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Expired':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Listing status badge (draft | pending_approval | approved | active |
  // suspended | rejected | sold | cancelled)
  const getListingStatusColor = status => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'approved':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'pending_approval':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      // Auto-pulled while a human appraisal runs; re-published on completion.
      case 'suspended':
        return 'text-[#F1CB68] bg-[#F1CB68]/10 border-[#F1CB68]/20';
      case 'rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'sold':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'cancelled':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatListingStatus = status =>
    // Per backend: present `suspended` as "Under valuation", not the raw word.
    status === 'suspended'
      ? 'Under Valuation'
      : (status || 'draft')
          .split('_')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

  // Get role badge color
  const getRoleColor = role => {
    switch (role) {
      case 'Buyer':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Seller':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Lister':
        return 'text-[#F1CB68] bg-[#F1CB68]/10 border-[#F1CB68]/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className='mb-6'>
        <div className='flex flex-wrap gap-2 mb-4'>
          {['My Listings', 'My Offers', 'Received Offers'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeFilter === filter
                  ? isDarkMode
                    ? 'text-white'
                    : 'text-black'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-100'
              }`}
              style={
                activeFilter === filter
                  ? isDarkMode
                    ? {
                        background:
                          'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }
                    : {
                        background: 'rgba(241, 203, 104, 0.2)',
                        border: '1px solid rgba(241, 203, 104, 0.3)',
                      }
                  : {}
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className='flex items-center justify-between'>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {isLoading
              ? ''
              : isListingsView
              ? `${myListings.length} listing${myListings.length !== 1 ? 's' : ''} found`
              : `${filteredOffers.length} offer${filteredOffers.length !== 1 ? 's' : ''} found`}
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'card'
                  ? 'bg-[#F1CB68] text-white'
                  : isDarkMode
                  ? 'bg-white/5 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <rect x='3' y='3' width='7' height='7' />
                <rect x='14' y='3' width='7' height='7' />
                <rect x='3' y='14' width='7' height='7' />
                <rect x='14' y='14' width='7' height='7' />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-[#F1CB68] text-white'
                  : isDarkMode
                  ? 'bg-white/5 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M3 3h18v18H3z' />
                <path d='M3 9h18' />
                <path d='M3 15h18' />
                <path d='M9 3v18' />
                <path d='M15 3v18' />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Card View */}
      {viewMode === 'card' && (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <OfferSkeletonCard key={i} isDarkMode={isDarkMode} />
              ))
            : isListingsView
            ? myListings.map(listing => (
                <MyListingCard
                  key={listing.id}
                  listing={listing}
                  isDarkMode={isDarkMode}
                  formatDate={formatDate}
                  getListingStatusColor={getListingStatusColor}
                  formatListingStatus={formatListingStatus}
                  router={router}
                />
              ))
            : filteredOffers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isDarkMode={isDarkMode}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getRoleColor={getRoleColor}
                  router={router}
                  handlers={offerActionHandlers}
                />
              ))}
        </div>
      )}

      {/* Content - Table View (My Listings) */}
      {viewMode === 'table' && isListingsView && (
        <div
          className={`rounded-xl border overflow-hidden ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='overflow-x-auto'>
            <table className='w-full text-nowrap'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  {['Listing', 'Category', 'Asking Price', 'Status', 'Pending Offers', 'Created', 'Actions'].map(header => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonTableRow key={i} isDarkMode={isDarkMode} cols={7} />
                    ))
                  : myListings.map(listing => (
                  <MyListingTableRow
                    key={listing.id}
                    listing={listing}
                    isDarkMode={isDarkMode}
                    formatDate={formatDate}
                    getListingStatusColor={getListingStatusColor}
                    formatListingStatus={formatListingStatus}
                    router={router}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content - Table View (Offers) */}
      {viewMode === 'table' && !isListingsView && (
        <div
          className={`rounded-xl border overflow-hidden ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='overflow-x-auto'>
            <table className='w-full text-nowrap'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Asset
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Category
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Offer Amount
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Role
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Counterparty
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Date Updated
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonTableRow key={i} isDarkMode={isDarkMode} cols={8} />
                    ))
                  : filteredOffers.map(offer => (
                  <OfferTableRow
                    key={offer.id}
                    offer={offer}
                    isDarkMode={isDarkMode}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getRoleColor={getRoleColor}
                    router={router}
                    handlers={offerActionHandlers}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State — only after the backing API call has resolved */}
      {!isLoading &&
        (isListingsView ? myListings.length === 0 : filteredOffers.length === 0) && (
        <div
          className={`rounded-xl border p-12 text-center ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <p
            className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {isListingsView ? 'No listings found' : 'No offers found'}
          </p>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {activeFilter === 'My Offers'
              ? "You haven't made any offers yet."
              : activeFilter === 'My Listings'
              ? "You haven't listed anything on the marketplace yet."
              : "You haven't received any offers yet."}
          </p>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterTarget && (
        <CounterOfferModal
          offer={counterTarget}
          isDarkMode={isDarkMode}
          onClose={() => setCounterTarget(null)}
          onSubmitted={() => { setCounterTarget(null); refresh(); }}
        />
      )}

      {/* Escrow Modal */}
      {escrowTarget && (
        <EscrowModal
          offer={escrowTarget}
          isDarkMode={isDarkMode}
          onClose={() => setEscrowTarget(null)}
          onChanged={() => { setEscrowTarget(null); refresh(); }}
        />
      )}
    </div>
  );
}

// Offer Card Component
function OfferCard({
  offer,
  isDarkMode,
  formatDate,
  getStatusColor,
  getRoleColor,
  router,
  handlers = {},
}) {
  const { onAccept, onReject, onWithdraw, onCounter, onViewEscrow, actionLoading = {} } = handlers;
  const busy = (action) => !!actionLoading[`${offer.id}_${action}`];

  const getActions = () => {
    const actions = [];
    actions.push({
      label: 'View Listing',
      onClick: () => router.push(`/dashboard/marketplace/detail?id=${offer.listingId}`),
      primary: false,
    });

    if (offer.role === 'Buyer' && offer.offerStatus === 'Pending') {
      actions.push({
        label: busy('withdraw') ? 'Withdrawing…' : 'Withdraw',
        onClick: () => onWithdraw?.(offer),
        disabled: busy('withdraw'),
        primary: false,
        danger: true,
      });
    }

    if ((offer.role === 'Seller' || offer.role === 'Lister') && offer.offerStatus === 'Pending') {
      actions.push(
        {
          label: busy('accept') ? 'Accepting…' : 'Accept',
          onClick: () => onAccept?.(offer),
          disabled: busy('accept'),
          primary: true,
        },
        {
          label: 'Counter Offer',
          onClick: () => onCounter?.(offer),
          primary: false,
        },
        {
          label: busy('reject') ? 'Rejecting…' : 'Reject',
          onClick: () => onReject?.(offer),
          disabled: busy('reject'),
          primary: false,
          danger: true,
        }
      );
    }

    // Once accepted, funds move through escrow
    if (offer.offerStatus === 'Accepted') {
      actions.push({
        label: 'Manage Escrow',
        onClick: () => onViewEscrow?.(offer),
        primary: true,
      });
    }

    return actions;
  };

  const actions = getActions();

  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Asset Thumbnail & Name */}
      <div className='flex items-start gap-3 mb-4'>
        <img
          src={offer.assetThumbnail}
          alt={offer.assetName}
          className='w-16 h-16 rounded-lg object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h3
            className={`text-sm font-semibold mb-1 truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {offer.assetName}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isDarkMode
                ? 'bg-white/5 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {offer.category}
          </span>
        </div>
      </div>

      {/* Offer Details */}
      <div className='space-y-2 mb-4'>
        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Offer Amount
          </span>
          <span
            className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {offer.offerAmount}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Status
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${getStatusColor(
              offer.offerStatus
            )}`}
          >
            {offer.offerStatus}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Role
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${getRoleColor(
              offer.role
            )}`}
          >
            {offer.role}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Counterparty
          </span>
          <span
            className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {offer.counterparty}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Updated
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {formatDate(offer.dateUpdated)}
          </span>
        </div>
      </div>

      {/* Message attached to the offer — shown to both parties (buyer sees
          their own note, seller sees the buyer's). Hidden when empty. */}
      {offer.message && (
        <div
          className={`mb-4 rounded-lg p-3 ${
            isDarkMode ? 'bg-white/5' : 'bg-gray-50'
          }`}
        >
          <p
            className={`text-xs mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {offer.role === 'Buyer' ? 'Your message' : 'Buyer’s message'}
          </p>
          <p
            className={`text-sm whitespace-pre-wrap break-words ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            {offer.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='flex flex-wrap gap-2 pt-4 border-t border-[#FFFFFF14]'>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex-1 min-w-[100px] px-3 py-1.5 text-xs rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              action.primary
                ? 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
                : action.danger
                ? 'text-red-400 border border-red-400/20 hover:bg-red-400/10'
                : isDarkMode
                ? 'border border-white/20 text-white hover:bg-white/5'
                : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Offer Table Row Component
function OfferTableRow({
  offer,
  isDarkMode,
  formatDate,
  getStatusColor,
  getRoleColor,
  router,
  handlers = {},
}) {
  const { onAccept, onReject, onWithdraw, onCounter, onViewEscrow, actionLoading = {} } = handlers;
  const busy = (action) => !!actionLoading[`${offer.id}_${action}`];

  const getActions = () => {
    const actions = [];
    actions.push({
      label: 'View',
      onClick: () => router.push(`/dashboard/marketplace/detail?id=${offer.listingId}`),
    });

    if (offer.role === 'Buyer' && offer.offerStatus === 'Pending') {
      actions.push({
        label: busy('withdraw') ? '…' : 'Withdraw',
        onClick: () => onWithdraw?.(offer),
        disabled: busy('withdraw'),
      });
    }

    if ((offer.role === 'Seller' || offer.role === 'Lister') && offer.offerStatus === 'Pending') {
      actions.push(
        {
          label: busy('accept') ? '…' : 'Accept',
          onClick: () => onAccept?.(offer),
          disabled: busy('accept'),
        },
        {
          label: 'Counter',
          onClick: () => onCounter?.(offer),
        },
        {
          label: busy('reject') ? '…' : 'Reject',
          onClick: () => onReject?.(offer),
          disabled: busy('reject'),
        }
      );
    }

    if (offer.offerStatus === 'Accepted') {
      actions.push({
        label: 'Escrow',
        onClick: () => onViewEscrow?.(offer),
      });
    }

    return actions;
  };

  const actions = getActions();

  return (
    <tr
      className={`border-b ${
        isDarkMode
          ? 'border-[#FFFFFF14] hover:bg-white/5'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src={offer.assetThumbnail}
            alt={offer.assetName}
            className='w-12 h-12 rounded-lg object-cover'
          />
          <div className='min-w-0'>
            <span
              className={`block text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {offer.assetName}
            </span>
            {/* Buyer's note attached to the offer, shown to both parties. */}
            {offer.message && (
              <span
                className={`block text-xs mt-0.5 max-w-[240px] truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
                title={offer.message}
              >
                “{offer.message}”
              </span>
            )}
          </div>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {offer.category}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {offer.offerAmount}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded border ${getStatusColor(
            offer.offerStatus
          )}`}
        >
          {offer.offerStatus}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded border ${getRoleColor(
            offer.role
          )}`}
        >
          {offer.role}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {offer.counterparty}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {formatDate(offer.dateUpdated)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <div className='flex gap-2'>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`px-2 py-1 text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                action.label === 'Accept'
                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : action.label === 'Reject' || action.label === 'Withdraw'
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : isDarkMode
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// Skeletons — shown on the Active Offers tab while offers/listings load
// ============================================================================
function OfferSkeletonCard({ isDarkMode }) {
  const block = isDarkMode ? 'bg-white/10' : 'bg-gray-200';
  return (
    <div
      className={`rounded-xl border p-4 animate-pulse ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-start gap-3 mb-4'>
        <div className={`w-16 h-16 rounded-lg shrink-0 ${block}`} />
        <div className='flex-1 min-w-0 space-y-2 pt-1'>
          <div className={`h-4 w-3/4 rounded ${block}`} />
          <div className={`h-3 w-1/3 rounded ${block}`} />
        </div>
      </div>
      <div className='space-y-3 mb-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between'>
            <div className={`h-3 w-20 rounded ${block}`} />
            <div className={`h-3 w-16 rounded ${block}`} />
          </div>
        ))}
      </div>
      <div
        className={`flex gap-2 pt-4 border-t ${
          isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
        }`}
      >
        <div className={`h-7 flex-1 rounded-lg ${block}`} />
        <div className={`h-7 flex-1 rounded-lg ${block}`} />
      </div>
    </div>
  );
}

function SkeletonTableRow({ isDarkMode, cols = 8 }) {
  const block = isDarkMode ? 'bg-white/10' : 'bg-gray-200';
  return (
    <tr
      className={`border-b animate-pulse ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className='px-4 py-3'>
          {i === 0 ? (
            <div className='flex items-center gap-3'>
              <div className={`w-12 h-12 rounded-lg shrink-0 ${block}`} />
              <div className={`h-4 w-24 rounded ${block}`} />
            </div>
          ) : (
            <div className={`h-4 w-16 rounded ${block}`} />
          )}
        </td>
      ))}
    </tr>
  );
}

// ============================================================================
// My Listing Card — GET /marketplace/listings/my ("My Listings" tab)
// ============================================================================
function MyListingCard({
  listing,
  isDarkMode,
  formatDate,
  getListingStatusColor,
  formatListingStatus,
  router,
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Thumbnail & Title */}
      <div className='flex items-start gap-3 mb-4'>
        <img
          src={
            listing.thumbnail ||
            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400'
          }
          alt={listing.title}
          className='w-16 h-16 rounded-lg object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h3
            className={`text-sm font-semibold mb-1 truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {listing.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isDarkMode
                ? 'bg-white/5 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {listing.category}
          </span>
        </div>
        {listing.pendingOffersCount > 0 && (
          <span className='shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-[#F1CB68]/15 text-[#F1CB68] border border-[#F1CB68]/30'>
            {listing.pendingOffersCount} pending offer
            {listing.pendingOffersCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Listing Details */}
      <div className='space-y-2 mb-4'>
        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Asking Price
          </span>
          <span
            className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            ${Number(listing.askingPrice || 0).toLocaleString()}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Status
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${getListingStatusColor(
              listing.status
            )}`}
          >
            {formatListingStatus(listing.status)}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Created
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {listing.createdAt ? formatDate(listing.createdAt) : '—'}
          </span>
        </div>

        {listing.status === 'rejected' && listing.rejectionReason && (
          <p className='text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>
            {listing.rejectionReason}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className='flex flex-wrap gap-2 pt-4 border-t border-[#FFFFFF14]'>
        <button
          onClick={() =>
            router.push(`/dashboard/marketplace/detail?id=${listing.id}`)
          }
          className={`flex-1 min-w-[100px] px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
            isDarkMode
              ? 'border border-white/20 text-white hover:bg-white/5'
              : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
          }`}
        >
          View Listing
        </button>
      </div>
    </div>
  );
}

// My Listing Table Row
function MyListingTableRow({
  listing,
  isDarkMode,
  formatDate,
  getListingStatusColor,
  formatListingStatus,
  router,
}) {
  return (
    <tr
      className={`border-b ${
        isDarkMode
          ? 'border-[#FFFFFF14] hover:bg-white/5'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src={
              listing.thumbnail ||
              'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400'
            }
            alt={listing.title}
            className='w-12 h-12 rounded-lg object-cover'
          />
          <span
            className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {listing.title}
          </span>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {listing.category}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          ${Number(listing.askingPrice || 0).toLocaleString()}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded border ${getListingStatusColor(
            listing.status
          )}`}
        >
          {formatListingStatus(listing.status)}
        </span>
      </td>
      <td className='px-4 py-3'>
        {listing.pendingOffersCount > 0 ? (
          <span className='text-xs font-semibold px-2 py-1 rounded-full bg-[#F1CB68]/15 text-[#F1CB68] border border-[#F1CB68]/30'>
            {listing.pendingOffersCount}
          </span>
        ) : (
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            0
          </span>
        )}
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {listing.createdAt ? formatDate(listing.createdAt) : '—'}
        </span>
      </td>
      <td className='px-4 py-3'>
        <button
          onClick={() =>
            router.push(`/dashboard/marketplace/detail?id=${listing.id}`)
          }
          className={`px-2 py-1 text-xs rounded transition-all ${
            isDarkMode
              ? 'bg-white/5 text-white hover:bg-white/10'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          View
        </button>
      </td>
    </tr>
  );
}

// ============================================================================
// Counter Offer Modal — POST /marketplace/offers/{id}/counter
// ============================================================================
function CounterOfferModal({ offer, isDarkMode, onClose, onSubmitted }) {
  const [amount, setAmount] = useState(String(offer.offerAmountValue || ''));
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const value = parseFloat(String(amount).replace(/,/g, ''));
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid counter amount');
      return;
    }
    setSubmitting(true);
    try {
      await counterOffer(offer.id, {
        counterAmount: value,
        currency: offer.currency || 'USD',
        message: message || undefined,
      });
      toast.success('Counter offer sent');
      onSubmitted?.();
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || 'Failed to send counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  const panel = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] ${
    isDarkMode ? 'bg-[#2C2C2E] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70' onClick={onClose}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${panel}`} onClick={(e) => e.stopPropagation()}>
        <h3 className={`text-lg font-bold mb-1 ${textMain}`}>Counter Offer</h3>
        <p className={`text-sm mb-4 ${textMuted}`}>Buyer offered {offer.offerAmount} for {offer.assetName}.</p>

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Counter Amount ({offer.currency || 'USD'})</label>
        <input type='text' value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} mb-4`} />

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Message</label>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Optional note to the buyer…' className={`${inputCls} resize-none mb-6`} />

        <div className='flex gap-3'>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border ${isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className='flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E] disabled:opacity-60'>
            {submitting ? 'Sending…' : 'Send Counter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Escrow Modal — GET/POST /marketplace/escrow/{id}[/fund|release|dispute|refund]
// ============================================================================
function EscrowModal({ offer, isDarkMode, onClose, onChanged }) {
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showDispute, setShowDispute] = useState(false);

  const escrowId = offer.escrowId;
  const isBuyer = offer.role === 'Buyer';
  const isSeller = offer.role === 'Seller' || offer.role === 'Lister';

  const loadEscrow = useCallback(async () => {
    if (!escrowId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await getEscrow(escrowId);
      setEscrow(res?.data ?? res ?? null);
    } catch (err) {
      if (!(err?.status === 405 || err?.status === 400)) {
        toast.error('Failed to load escrow');
      }
      setEscrow(null);
    } finally {
      setLoading(false);
    }
  }, [escrowId]);

  useEffect(() => { loadEscrow(); }, [loadEscrow]);

  // The counterparty or an admin can change the escrow status out from under
  // us, so re-fetch when the window regains focus (spec §2d).
  useEffect(() => {
    const onFocus = () => loadEscrow();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadEscrow]);

  const run = async (action, fn, msg) => {
    setActionBusy(action);
    try {
      await fn();
      toast.success(msg);
      await loadEscrow();
      onChanged?.();
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || `Failed to ${action}`);
    } finally {
      setActionBusy('');
    }
  };

  const status = (escrow?.status || '').toLowerCase();
  const panel = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  // Escrow detail is self-contained (spec §2d): prefer its own title/thumbnail,
  // falling back to the offer's asset info when the new fields aren't deployed yet.
  const cardTitle = escrow?.listingTitle || escrow?.assetName || offer.assetName;
  const thumbnail = escrow?.thumbnailUrl || offer.assetThumbnail;

  // Non-actor status messages, per the spec's state → action map.
  const infoMessage = () => {
    if (status === 'pending' && isSeller) return 'Waiting for the buyer to fund the escrow.';
    if (status === 'funded' && isBuyer) return 'Funds are in escrow — waiting for the seller to release them.';
    if (status === 'disputed') return 'This escrow is under review by an admin.';
    if (status === 'released') return isSeller ? 'Funds released ✓' : 'Completed ✓';
    if (status === 'refunded') return isBuyer ? 'Refunded ✓' : 'Refunded';
    return '';
  };
  const message = infoMessage();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70' onClick={onClose}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${panel}`} onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-4'>
          <h3 className={`text-lg font-bold ${textMain}`}>Escrow</h3>
          <button onClick={onClose} className={textMuted}>✕</button>
        </div>

        {!escrowId ? (
          <p className={`text-sm ${textMuted}`}>No escrow is associated with this offer yet.</p>
        ) : loading ? (
          <p className={`text-sm ${textMuted}`}>Loading escrow…</p>
        ) : (
          <>
            {/* Self-contained escrow card: title + thumbnail + amount + status */}
            <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className='flex items-center gap-3 mb-3'>
                {thumbnail ? (
                  <img src={thumbnail} alt={cardTitle} className='w-12 h-12 rounded-lg object-cover' />
                ) : (
                  <div className={`w-12 h-12 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                )}
                <span className={`text-sm font-semibold ${textMain} truncate`}>{cardTitle}</span>
              </div>
              <Row label='Escrow ID' value={escrowId} mono textMain={textMain} textMuted={textMuted} />
              <Row label='Amount' value={escrow?.amount ? `$${Number(escrow.amount).toLocaleString()}` : offer.offerAmount} textMain={textMain} textMuted={textMuted} />
              {escrow?.commission != null && (
                <Row label='Commission' value={`$${Number(escrow.commission).toLocaleString()}`} textMain={textMain} textMuted={textMuted} />
              )}
              <Row label='Status' value={escrow?.status || 'unknown'} textMain={textMain} textMuted={textMuted} />
            </div>

            {/* Informational state for the party with no action this turn. */}
            {message && (
              <p className={`text-sm mb-4 ${textMuted}`}>{message}</p>
            )}

            {showDispute && (
              <div className='mb-4'>
                <label className={`block text-sm font-medium mb-2 ${textMain}`}>Dispute Reason</label>
                <textarea rows={3} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder='Describe the problem…'
                  className={`w-full px-3 py-2 rounded-lg text-sm border resize-none focus:outline-none focus:border-[#F1CB68] ${isDarkMode ? 'bg-[#2C2C2E] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
            )}

            <div className='flex flex-wrap gap-2'>
              {/* pending → only the BUYER can fund (spec §2e). */}
              {isBuyer && status === 'pending' && (
                <button onClick={() => run('fund', () => fundEscrow(escrowId), 'Escrow funded')} disabled={!!actionBusy}
                  className='flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E] disabled:opacity-60'>
                  {actionBusy === 'fund' ? 'Funding…' : 'Fund / Pay'}
                </button>
              )}
              {/* funded → only the SELLER can release (spec §2f). This was
                  incorrectly wired to the buyer, which the backend rejects with
                  401 "Only seller can release escrow". */}
              {isSeller && status === 'funded' && (
                <button onClick={() => run('release', () => releaseEscrow(escrowId), 'Funds released to seller')} disabled={!!actionBusy}
                  className='flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-60'>
                  {actionBusy === 'release' ? 'Releasing…' : 'Release Funds'}
                </button>
              )}
              {/* funded → the seller may refund the buyer (spec §2h). */}
              {isSeller && status === 'funded' && (
                <button onClick={() => run('refund', () => refundEscrow(escrowId), 'Buyer refunded')} disabled={!!actionBusy}
                  className='flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold border border-red-400/30 text-red-400 hover:bg-red-400/10 disabled:opacity-60'>
                  {actionBusy === 'refund' ? 'Refunding…' : 'Refund Buyer'}
                </button>
              )}
              {/* funded → either party can raise a dispute (spec §2g). */}
              {status === 'funded' && (
                showDispute ? (
                  <button
                    onClick={() => {
                      if (!disputeReason.trim()) { toast.error('Please enter a reason'); return; }
                      run('dispute', () => disputeEscrow(escrowId, disputeReason.trim()), 'Dispute opened').then(() => setShowDispute(false));
                    }}
                    disabled={!!actionBusy}
                    className='flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60'>
                    {actionBusy === 'dispute' ? 'Submitting…' : 'Submit Dispute'}
                  </button>
                ) : (
                  <button onClick={() => setShowDispute(true)}
                    className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold border ${isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
                    Raise Dispute
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, textMain, textMuted }) {
  return (
    <div className='flex justify-between items-center py-1.5 gap-3'>
      <span className={`text-xs ${textMuted}`}>{label}</span>
      <span className={`text-xs font-medium ${mono ? 'font-mono' : ''} ${textMain} truncate max-w-[60%] text-right`}>{value}</span>
    </div>
  );
}

// ============================================================================
// Create Listing Modal — POST /marketplace/listings (+ optional pay-fee / activate)
// ============================================================================
function CreateListingModal({ isOpen, onClose, isDarkMode, onCreated }) {
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingAssets(true);
        const res = await getAssets({ limit: 100 });
        setAssets(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const price = parseFloat(String(askingPrice).replace(/,/g, ''));
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    if (isNaN(price) || price <= 0) { toast.error('Please enter a valid asking price'); return; }
    setSubmitting(true);
    try {
      await createListing({
        ...(assetId ? { assetId } : {}),
        title: title.trim(),
        askingPrice: price,
        currency: 'USD',
        description: description.trim() || undefined,
      });
      toast.success('Listing submitted for approval');
      onCreated?.();
      // reset
      setAssetId(''); setTitle(''); setAskingPrice(''); setDescription('');
    } catch (err) {
      toast.error(err?.data?.detail || err?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const panel = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] ${
    isDarkMode ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70' onClick={onClose}>
      <div className={`w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${panel}`} onClick={(e) => e.stopPropagation()}>
        <h3 className={`text-lg font-bold mb-1 ${textMain}`}>List an Asset</h3>
        <p className={`text-sm mb-4 ${textMuted}`}>Create a marketplace listing. It will be submitted for admin approval.</p>

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Asset (optional)</label>
        <select value={assetId} onChange={(e) => {
          setAssetId(e.target.value);
          const a = assets.find(x => x.id === e.target.value);
          if (a && !title) setTitle(a.name || a.title || '');
        }} className={`${inputCls} mb-4`}>
          <option value=''>{loadingAssets ? 'Loading assets…' : 'Select one of your assets'}</option>
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name || a.title || a.id}</option>
          ))}
        </select>

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Title *</label>
        <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='e.g. Downtown Office Suite' className={`${inputCls} mb-4`} />

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Asking Price (USD) *</label>
        <input type='text' value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder='100000' className={`${inputCls} mb-4`} />

        <label className={`block text-sm font-medium mb-2 ${textMain}`}>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Describe the asset…' className={`${inputCls} resize-none mb-6`} />

        <div className='flex gap-3'>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border ${isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className='flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E] disabled:opacity-60'>
            {submitting ? 'Submitting…' : 'Create Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hero Section Component
function HeroSection({ isDarkMode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
      title: 'Discover Exclusive Investment Opportunities',
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
      title: 'Build Your Wealth Portfolio',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      title: 'Strategic Investment Solutions',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className='relative h-48 overflow-hidden'>
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className='absolute inset-0 bg-black/60' />
          </div>
        </div>
      ))}

      {/* Content */}
      <div className='relative h-full flex flex-col items-start justify-center px-4 z-10'>
        <h1 className={`text-2xl md:text-3xl font-bold text-center mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {slides[currentSlide].title}
        </h1>

        {/* Gradient Line - Below Title, Left Aligned */}
        <div
          className='w-[256px]  h-px mb-4'
          style={{
            background:
              'linear-gradient(90deg, rgba(241, 203, 104, 0.1) 0%, #F1CB68 50%, rgba(241, 203, 104, 0.1) 100%)',
          }}
        />

        <div className='flex gap-3'>
          <button
            className={`px-4 py-1.5 text-sm rounded-full border-2 font-medium transition-all hover:bg-[#F1CB68] hover:border-[#F1CB68] hover:text-white ${
              isDarkMode
                ? 'text-white border-white'
                : 'text-gray-900 border-gray-900'
            }`}
          >
            Explore Now
          </button>
          <button
            className={`px-4 py-1.5 text-sm rounded-full border-2 border-[#F1CB68] font-medium transition-all hover:bg-[#F1CB68] hover:text-white ${
              isDarkMode ? 'text-[#F1CB68]' : 'text-[#C49D2E]'
            }`}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Navigation Arrows - Bottom Right Corner */}
      <div className='absolute bottom-4 right-4 flex gap-2 z-20'>
        <button
          onClick={prevSlide}
          className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
            isDarkMode
              ? 'bg-black/30 text-white hover:bg-black/50'
              : 'bg-white/80 text-gray-900 hover:bg-white'
          }`}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path d='M15 18l-6-6 6-6' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
            isDarkMode
              ? 'bg-black/30 text-white hover:bg-black/50'
              : 'bg-white/80 text-gray-900 hover:bg-white'
          }`}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path d='M9 18l6-6-6-6' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Skeleton matching InvestmentCard's compact layout — shown in the browse
// grid while /marketplace/search is in flight.
function ListingSkeletonCard({ isDarkMode }) {
  const block = isDarkMode ? 'bg-white/10' : 'bg-gray-200';
  return (
    <div
      className={`rounded-xl border p-3 animate-pulse ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg mb-2 ${block}`} />
      <div className={`h-4 w-3/4 rounded mb-2 ${block}`} />
      <div className={`h-4 w-20 rounded mb-3 ${block}`} />
      <div className='grid grid-cols-2 gap-3 mb-3'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className={`h-3 w-14 rounded mb-1 ${block}`} />
            <div className={`h-3 w-16 rounded ${block}`} />
          </div>
        ))}
      </div>
      <div className='flex items-center justify-between mb-3'>
        <div>
          <div className={`h-3 w-14 rounded mb-1 ${block}`} />
          <div className={`h-3 w-10 rounded ${block}`} />
        </div>
        <div className={`h-3 w-20 rounded ${block}`} />
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <div className={`h-7 rounded-lg ${block}`} />
        <div className={`h-7 rounded-lg ${block}`} />
      </div>
    </div>
  );
}

// Market summary stat tiles — GET /marketplace/market-summary (30d window).
// Field names are read defensively since the payload keys may evolve.
function MarketSummaryTiles({ summary, isDarkMode }) {
  const money = v =>
    v === null || v === undefined || isNaN(Number(v))
      ? '—'
      : `$${Number(v).toLocaleString('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1,
        })}`;

  const volume =
    summary.totalVolume ?? summary.volume ?? summary.totals?.volume;
  const avgPrice = summary.averagePrice ?? summary.avgPrice;
  const sentimentRaw = summary.sentiment ?? summary.marketSentiment;
  const sentiment =
    typeof sentimentRaw === 'string' ? sentimentRaw : sentimentRaw?.label;

  const tiles = [
    { label: 'Volume (30d)', value: money(volume) },
    { label: 'Avg Price', value: money(avgPrice) },
    {
      label: 'Sentiment',
      value: sentiment
        ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1)
        : '—',
      valueClass: /bull|positive|up/i.test(sentiment || '')
        ? 'text-green-500'
        : /bear|negative|down/i.test(sentiment || '')
        ? 'text-red-500'
        : '',
    },
  ];

  return (
    <div
      className={`grid grid-cols-3 gap-2 mt-4 pt-4 border-t ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}
    >
      {tiles.map(tile => (
        <div key={tile.label}>
          <p
            className={`text-[11px] mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {tile.label}
          </p>
          <p
            className={`text-sm font-semibold ${
              tile.valueClass || (isDarkMode ? 'text-white' : 'text-gray-900')
            }`}
          >
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// Investment Card Component
function InvestmentCard({ fund, isDarkMode, isWatched = false, onToggleWatchlist }) {
  const router = useRouter();
  // Buying is investor-only (staff get 403 STAFF_CANNOT_BUY server-side).
  const { isInvestor } = useAuth();
  const CategoryIcon = getCategoryIcon(fund.category);

  const handleViewDetails = () => {
    router.push(`/dashboard/marketplace/detail?id=${fund.id}`);
  };

  // Deep-link into the detail page with the offer modal pre-opened at the
  // asking price — the offer→accept→escrow chain is the purchase flow.
  const handleBuy = () => {
    router.push(`/dashboard/marketplace/detail?id=${fund.id}&buy=1`);
  };

  return (
    <div
      className={`relative rounded-xl border p-3 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Golden Corner Triangle with Icon */}
      <div className='absolute top-0 right-0 w-12 h-12 overflow-hidden'>
        <div className='absolute top-0 right-0 w-0 h-0 border-t-[45px] border-t-[#F1CB68] border-l-[45px] border-l-transparent' />
      </div>

      {/* Watchlist heart — sits on the golden corner triangle */}
      {onToggleWatchlist && (
        <button
          onClick={() => onToggleWatchlist(fund)}
          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          className='absolute top-1.5 right-1.5 z-10 p-1 transition-transform hover:scale-110'
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill={isWatched ? (isDarkMode ? '#1A1A1D' : '#FFFFFF') : 'none'}
            stroke={isDarkMode ? '#1A1A1D' : '#FFFFFF'}
            strokeWidth='2'
          >
            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
          </svg>
        </button>
      )}

      {/* Category icon */}
      <div className='w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-[#F1CB68]/10'>
        <CategoryIcon size={18} color='#F1CB68' />
      </div>

      {/* Fund Name */}
      <h3
        className={`text-sm font-semibold mb-2 pr-8 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {fund.name}
      </h3>

      {/* Category Badge */}
      <div className='flex items-center gap-2 mb-3'>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
          style={{
            boxShadow: '0px 4px 4px 0px #00000040 inset',
          }}
        >
          {fund.category}
        </span>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-3 mb-3'>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Minimum
          </p>
          <p
            className={`text-xs font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {fund.minimum}
          </p>
        </div>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Target IRR
          </p>
          <p className='text-xs font-semibold text-[#F1CB68]'>
            {fund.targetIRR}
          </p>
        </div>
      </div>

      {/* Risk Level & Tags */}
      <div className='flex items-center justify-between mb-3'>
        <div>
          <p
            className={`text-xs mb-0.5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Risk Level
          </p>
          <p
            className={`text-xs font-semibold ${
              fund.riskLevel === 'High'
                ? 'text-red-500'
                : fund.riskLevel === 'Low'
                ? 'text-green-500'
                : 'text-[#F1CB68]'
            }`}
          >
            {fund.riskLevel}
          </p>
        </div>
        <div className='flex gap-1.5 text-right'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {fund.type}
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {fund.subType}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={isInvestor ? 'grid grid-cols-2 gap-2' : ''}>
        <button
          onClick={handleViewDetails}
          className={`w-full py-1.5 text-xs rounded-lg font-medium border transition-all ${
            isDarkMode
              ? 'border-white/20 text-white hover:bg-white/5'
              : 'border-gray-300 text-gray-900 hover:bg-gray-50'
          }`}
        >
          View Details
        </button>
        {isInvestor && (
          <button
            onClick={handleBuy}
            className='w-full py-1.5 text-xs rounded-lg font-semibold text-[#0B0D12] bg-[#F1CB68] hover:bg-[#d4b55a] transition-all'
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
}

// Filter Panel Component
function FilterPanel({
  isOpen,
  onClose,
  isDarkMode,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-40' onClick={onClose} />

      {/* Filter Panel - Dropdown */}
      <div
        className={`absolute top-full right-0 mt-2 w-80 max-h-[calc(100vh-200px)] overflow-y-auto z-50 rounded-2xl animate-slideDown filter-panel-scroll ${
          isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
        }`}
        style={{
          boxShadow: isDarkMode
            ? '0 10px 40px rgba(0, 0, 0, 0.5)'
            : '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Filters
            </h2>
          </div>

          {/* Sort By */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sort By
            </h3>
            <div className='space-y-2'>
              {[
                { value: 'price-low-high', label: 'Price: Low to High' },
                { value: 'price-high-low', label: 'Price: High to Low' },
              ].map(option => (
                <label
                  key={option.value}
                  className='flex items-center gap-3 cursor-pointer'
                >
                  <div className='relative'>
                    <input
                      type='radio'
                      name='sortBy'
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={e => setSortBy(e.target.value)}
                      className='sr-only'
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        sortBy === option.value
                          ? 'border-[#F1CB68]'
                          : isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {sortBy === option.value && (
                        <div className='w-2.5 h-2.5 rounded-full bg-[#F1CB68]' />
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className='mb-6'>
            <h3
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Price Range ($)
            </h3>
            <div className='px-1'>
              <input
                type='range'
                min='100'
                max='10000'
                step='100'
                value={priceRange[1]}
                onChange={e =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-gold'
                style={{
                  background: `linear-gradient(to right, #F1CB68 0%, #F1CB68 ${
                    ((priceRange[1] - 100) / (10000 - 100)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} ${
                    ((priceRange[1] - 100) / (10000 - 100)) * 100
                  }%, ${isDarkMode ? '#374151' : '#E5E7EB'} 100%)`,
                }}
              />
              <div className='flex justify-between mt-2'>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  ${priceRange[0].toLocaleString()}
                </span>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  $
                  {priceRange[1] >= 10000
                    ? '10,000+'
                    : priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .slider-thumb-gold::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f1cb68;
          cursor: pointer;
          border: none;
        }

        .slider-thumb-gold::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f1cb68;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}
