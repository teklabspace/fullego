'use client';

// Public listing detail: /marketplace/detail?id=<listing-id>.
// Query-param route (not a dynamic [id] path) so it prerenders under
// `output: export`. Shows the full listing — valuation/appraisal documents
// are deliberately NOT exposed on the public page.

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getListing, searchMarketplace } from '@/utils/marketplaceApi';
import { getCategoryIcon } from '@/utils/categoryIcons';

const formatMoney = (value, currency = 'USD') => {
  if (value == null || value === '') return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `$${Number(value).toLocaleString()}`;
  }
};

const formatDate = value => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

// Public-facing status: buyers care about one thing — can this be bought.
const statusLabel = status => {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'active') return { text: 'Available', live: true };
  if (s === 'sold') return { text: 'Sold', live: false };
  if (s === 'pending' || s === 'pending_approval')
    return { text: 'Coming soon', live: false };
  return null;
};

const BUYING_STEPS = [
  {
    title: 'Make an offer',
    body: 'Submit an offer at or below the asking price. The seller can accept, decline, or counter.',
  },
  {
    title: 'Fund the escrow',
    body: 'Once accepted, your funds are held in escrow — never released until the transfer completes.',
  },
  {
    title: 'Ownership transfers',
    body: 'Documentation and title move to you, escrow releases to the seller, and the asset joins your portfolio.',
  },
];

const ASSURANCES = [
  { title: 'Verified sellers', body: 'Every seller passes KYC identity checks' },
  { title: 'Escrow protected', body: 'Funds held until ownership transfers' },
  { title: 'Compliance reviewed', body: 'Each listing is approved before going live' },
];

export default function PublicListingDetailPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [listingId, setListingId] = useState(null);
  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
      setListingId(id);
    } else {
      setError('Listing not found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getListing(listingId);
        if (cancelled) return;
        if (res?.data) {
          setListing(res.data);
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.data?.detail || err.message || 'Failed to load listing');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchListing();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  // Up to 3 more listings from the same category (silently optional).
  useEffect(() => {
    if (!listing?.category) return;
    let cancelled = false;
    searchMarketplace({ category: listing.category, limit: 4 })
      .then(res => {
        if (cancelled || !Array.isArray(res?.data)) return;
        setRelated(
          res.data.filter(l => l.id !== listing.id).slice(0, 3)
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listing]);

  // Same Buy semantics as the marketplace grid: guests go through
  // login/signup (the intended listing is remembered), logged-in users land
  // on the dashboard detail with the offer modal pre-opened.
  const handleBuy = () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      try {
        localStorage.setItem(
          'pendingBuyListing',
          JSON.stringify({ id: listingId, name: listing?.title || listing?.assetName })
        );
      } catch {
        /* ignore */
      }
      router.push('/login');
      return;
    }
    router.push(`/dashboard/marketplace/detail?id=${listingId}&buy=1`);
  };

  const name =
    listing?.title || listing?.assetName || listing?.name || 'Untitled Listing';
  const category = listing?.category || 'Other';
  const CategoryIcon = getCategoryIcon(category);
  const image = listing?.imageUrl || listing?.thumbnailUrl || null;
  const price = formatMoney(listing?.askingPrice, listing?.currency);
  const status = statusLabel(listing?.status);

  // Only facts that actually exist — an empty value is omitted, not dashed.
  const facts = listing
    ? [
        { label: 'Category', value: category },
        { label: 'Collection', value: listing.categoryGroup },
        { label: 'Currency', value: listing.currency },
        {
          label: 'Expected return',
          value: listing.expectedReturn ? `${listing.expectedReturn}%` : null,
        },
        {
          label: 'Minimum investment',
          value: formatMoney(listing.minimumInvestment, listing.currency),
        },
        { label: 'Location', value: listing.location },
        { label: 'Listed', value: formatDate(listing.createdAt) },
        {
          label: 'Reference',
          value: listing.id ? `#${String(listing.id).slice(0, 8).toUpperCase()}` : null,
        },
      ].filter(f => f.value)
    : [];

  const enter = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className='min-h-screen bg-[#0B0D12] text-white relative overflow-hidden'>
      <Navbar />

      <main className='relative pt-28 lg:pt-32 pb-24'>
        <div className='container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl'>
          {/* Breadcrumb */}
          <nav aria-label='Breadcrumb' className='mb-8'>
            <ol className='flex items-center gap-2 text-sm text-gray-400'>
              <li>
                <button
                  onClick={() => router.push('/marketplace')}
                  className='hover:text-white transition-colors'
                >
                  Marketplace
                </button>
              </li>
              {listing?.categoryGroup && (
                <>
                  <li aria-hidden='true' className='text-gray-600'>/</li>
                  <li>{listing.categoryGroup}</li>
                </>
              )}
              {listing && (
                <>
                  <li aria-hidden='true' className='text-gray-600'>/</li>
                  <li className='text-white'>{category}</li>
                </>
              )}
            </ol>
          </nav>

          {/* Loading skeleton mirrors the hero layout */}
          {loading && (
            <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 animate-pulse'>
              <div className='rounded-2xl bg-white/5 h-[320px] lg:h-[440px]' />
              <div className='space-y-4 pt-2'>
                <div className='h-6 w-40 rounded-full bg-white/5' />
                <div className='h-10 w-4/5 rounded-lg bg-white/5' />
                <div className='h-9 w-48 rounded-lg bg-white/10' />
                <div className='h-px bg-white/10 my-6' />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='flex justify-between'>
                    <div className='h-4 w-28 rounded bg-white/5' />
                    <div className='h-4 w-36 rounded bg-white/5' />
                  </div>
                ))}
                <div className='h-12 w-full rounded-full bg-white/10 mt-6' />
              </div>
            </div>
          )}

          {/* Error / not found */}
          {!loading && error && (
            <div className='text-center py-24 max-w-md mx-auto'>
              <div className='w-14 h-14 rounded-full bg-white/5 border border-[#FFFFFF14] flex items-center justify-center mx-auto mb-6'>
                <CategoryIcon size={22} color='#F1CB68' />
              </div>
              <h1 className='text-xl font-semibold mb-2'>
                This listing isn&apos;t available
              </h1>
              <p className='text-gray-400 text-sm mb-8'>
                It may have been sold or removed. Explore what&apos;s currently
                on the market instead.
              </p>
              <button
                onClick={() => router.push('/marketplace')}
                className='px-8 py-3 rounded-full font-semibold text-[#0B0D12]'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Browse the marketplace
              </button>
            </div>
          )}

          {!loading && !error && listing && (
            <>
              {/* ── Hero ─────────────────────────────────────────────── */}
              <motion.section
                {...enter}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 mb-20'
              >
                {/* Image — or a dignified placeholder, never fake stock */}
                <div className='relative rounded-2xl overflow-hidden border border-[#FFFFFF14] bg-[#12141b] min-h-[320px] lg:min-h-[440px]'>
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={name}
                        className='absolute inset-0 w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-[#0B0D12]/50 via-transparent to-transparent' />
                    </>
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
                      <CategoryIcon size={56} color='rgba(241, 203, 104, 0.35)' />
                      <span className='text-sm text-gray-500'>
                        Photography available after signup
                      </span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className='flex flex-col'>
                  <div className='flex items-center gap-3 mb-5'>
                    <span className='inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-[#FFFFFF14] text-xs font-medium text-gray-300'>
                      <span className='w-6 h-6 rounded-full bg-[#F1CB68]/10 flex items-center justify-center'>
                        <CategoryIcon size={12} color='#F1CB68' />
                      </span>
                      {category}
                    </span>
                    {status && (
                      <span className='inline-flex items-center gap-1.5 text-xs font-medium text-gray-300'>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status.live ? 'bg-emerald-400' : 'bg-gray-500'
                          }`}
                        />
                        {status.text}
                      </span>
                    )}
                  </div>

                  <h1
                    className='text-3xl lg:text-4xl font-bold mb-3'
                    style={{ textWrap: 'balance' }}
                  >
                    {name}
                  </h1>

                  {price && (
                    <p className='mb-8'>
                      <span className='text-3xl lg:text-[2.5rem] font-bold text-[#F1CB68] leading-none'>
                        {price}
                      </span>
                      <span className='ml-3 text-sm text-gray-400'>
                        asking price
                      </span>
                    </p>
                  )}

                  {listing.description && (
                    <p className='text-gray-300 text-sm leading-relaxed mb-8 max-w-[65ch]'>
                      {listing.description}
                    </p>
                  )}

                  {/* Facts — hairline rows, only real values */}
                  <dl className='divide-y divide-[#FFFFFF0F] border-y border-[#FFFFFF0F] mb-8'>
                    {facts.map(({ label, value }) => (
                      <div
                        key={label}
                        className='flex items-baseline justify-between gap-6 py-3'
                      >
                        <dt className='text-sm text-gray-400'>{label}</dt>
                        <dd className='text-sm font-medium text-white text-right'>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className='mt-auto flex flex-col sm:flex-row gap-3'>
                    <button
                      onClick={handleBuy}
                      className='flex-1 px-8 py-3.5 rounded-full font-semibold text-[#0B0D12] transition-transform hover:scale-[1.02] active:scale-[0.98]'
                      style={{
                        background:
                          'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      }}
                    >
                      Make an offer
                    </button>
                    <button
                      onClick={() => router.push('/signup')}
                      className='flex-1 px-8 py-3.5 rounded-full font-semibold border border-[#FFFFFF2A] text-white hover:bg-white/5 transition-colors'
                    >
                      Create an account
                    </button>
                  </div>
                  <p className='text-xs text-gray-500 mt-3 text-center sm:text-left'>
                    Already a member?{' '}
                    <button
                      onClick={() => router.push('/login')}
                      className='text-[#F1CB68] hover:underline'
                    >
                      Sign in
                    </button>{' '}
                    to see full documentation and valuation history.
                  </p>
                </div>
              </motion.section>

              {/* ── How buying works — a real 3-step sequence ─────────── */}
              <section className='mb-20'>
                <h2 className='text-2xl font-bold mb-2'>How buying works</h2>
                <p className='text-gray-400 text-sm mb-10 max-w-[65ch]'>
                  Every purchase on Akunuba moves through the same protected
                  path — from first offer to transferred ownership.
                </p>
                <ol className='grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-10'>
                  {BUYING_STEPS.map((step, i) => (
                    <li key={step.title} className='relative flex md:block gap-4 pb-8 md:pb-0'>
                      {/* connector */}
                      {i < BUYING_STEPS.length - 1 && (
                        <span
                          aria-hidden='true'
                          className='absolute md:hidden left-[15px] top-8 bottom-0 w-px bg-[#FFFFFF14]'
                        />
                      )}
                      <span className='shrink-0 w-8 h-8 rounded-full border border-[#F1CB68]/40 text-[#F1CB68] text-sm font-semibold flex items-center justify-center md:mb-4'>
                        {i + 1}
                      </span>
                      <div>
                        <h3 className='font-semibold mb-1.5'>{step.title}</h3>
                        <p className='text-sm text-gray-400 leading-relaxed'>
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* ── Assurance strip ───────────────────────────────────── */}
              <section
                aria-label='Buyer protections'
                className='rounded-2xl border border-[#FFFFFF14] bg-[#12141b] px-6 py-5 mb-20 flex flex-col md:flex-row md:items-center md:divide-x divide-[#FFFFFF0F]'
              >
                {ASSURANCES.map(item => (
                  <div
                    key={item.title}
                    className='flex items-center gap-3 py-3 md:py-0 md:px-8 first:pl-0 last:pr-0'
                  >
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='shrink-0'
                    >
                      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                      <path d='M9 12l2 2 4-4' />
                    </svg>
                    <div>
                      <p className='text-sm font-semibold'>{item.title}</p>
                      <p className='text-xs text-gray-400'>{item.body}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* ── More in this category ─────────────────────────────── */}
              {related.length > 0 && (
                <section>
                  <div className='flex items-baseline justify-between mb-6'>
                    <h2 className='text-2xl font-bold'>More in {category}</h2>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className='text-sm text-[#F1CB68] hover:underline'
                    >
                      View all
                    </button>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {related.map(item => {
                      const relPrice = formatMoney(item.askingPrice, item.currency);
                      const relImage = item.thumbnailUrl || item.imageUrl;
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            router.push(`/marketplace/detail?id=${item.id}`)
                          }
                          className='group text-left rounded-2xl border border-[#FFFFFF14] bg-[#12141b] overflow-hidden hover:border-[#F1CB68]/60 transition-colors'
                        >
                          <div className='relative h-40 bg-white/5 overflow-hidden'>
                            {relImage ? (
                              <img
                                src={relImage}
                                alt={item.title || 'Listing'}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <CategoryIcon
                                  size={28}
                                  color='rgba(241, 203, 104, 0.35)'
                                />
                              </div>
                            )}
                          </div>
                          <div className='p-4'>
                            <p className='font-semibold text-sm mb-1 truncate'>
                              {item.title || item.assetName || 'Untitled Listing'}
                            </p>
                            {relPrice && (
                              <p className='text-sm text-[#F1CB68] font-medium'>
                                {relPrice}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Sticky mobile buy bar */}
      {!loading && !error && listing && (
        <div className='lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0D12]/95 backdrop-blur border-t border-[#FFFFFF14] px-4 py-3 flex items-center gap-4'>
          <div className='min-w-0'>
            <p className='text-xs text-gray-400 truncate'>{name}</p>
            {price && (
              <p className='text-base font-bold text-[#F1CB68]'>{price}</p>
            )}
          </div>
          <button
            onClick={handleBuy}
            className='ml-auto shrink-0 px-6 py-2.5 rounded-full font-semibold text-sm text-[#0B0D12]'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            Make an offer
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
