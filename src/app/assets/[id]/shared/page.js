'use client';

import { useTheme } from '@/context/ThemeContext';
import { formatCurrency, getSharedAsset } from '@/utils/assetsApi';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Public, read-only view of an asset shared via a share link (BUG-02).
 *
 * URL shape: /assets/{asset_id}/shared?code={accessCode}
 * Backend  : GET /api/v1/assets/{asset_id}/shared?code={accessCode}  (no auth)
 *
 * States handled:
 *   - loading
 *   - missing code in the URL
 *   - 404 -> invalid / inactive share link
 *   - 410 -> share link expired
 *   - other errors
 *   - success -> render asset details (view permission only)
 */
export default function SharedAssetPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();

  const [status, setStatus] = useState('loading'); // loading | missing-code | invalid | expired | error | ready
  const [asset, setAsset] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [expiresAt, setExpiresAt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // { assetId, accessCode, sharedWithEmail } — feeds the signup CTA so a new
  // account created from this link can be tied back to the share.
  const [shareContext, setShareContext] = useState(null);
  // Whether the visitor already has a session (set post-mount to avoid a
  // hydration mismatch — localStorage isn't available at build time).
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    try {
      setHasSession(!!localStorage.getItem('access_token'));
    } catch {
      /* private mode — treat as logged out */
    }
  }, []);

  useEffect(() => {
    // Resolve the asset id from the route params, falling back to the pathname
    // (the route is served from a placeholder shell on the static host, so the
    // real id lives in the browser URL).
    let assetId = params?.id && params.id !== '__' ? params.id : null;
    let accessCode = null;

    if (typeof window !== 'undefined') {
      if (!assetId) {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const assetsIndex = segments.indexOf('assets');
        if (assetsIndex !== -1 && segments[assetsIndex + 1]) {
          assetId = segments[assetsIndex + 1];
        }
      }
      accessCode = new URLSearchParams(window.location.search).get('code');
    }

    if (!assetId || assetId === '__') {
      setStatus('error');
      setErrorMessage('No asset was specified in this link.');
      return;
    }

    if (!accessCode) {
      setStatus('missing-code');
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setStatus('loading');
        const response = await getSharedAsset(assetId, accessCode);
        if (cancelled) return;

        // Envelope is { success, data: { data: { asset, … } } } — unwrap both
        // nestings defensively so a single-level payload also works.
        const outer = response?.data || response || {};
        const data = outer.data || outer;
        setAsset(data.asset || null);
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
        setExpiresAt(data.expiresAt ?? data.expires_at ?? null);
        // shared_with (→ sharedWith post-transform): the email the share was
        // addressed to, null for open link-shares. Prefills signup so the new
        // account matches the share grant — verifying that email IS the claim
        // (backend auto-lists the asset under /assets/shared-with-me).
        setShareContext({
          assetId,
          accessCode,
          sharedWithEmail: data.sharedWith || data.shared_with || null,
        });
        setStatus(data.asset ? 'ready' : 'invalid');
      } catch (err) {
        if (cancelled) return;
        const errCode = err?.code || err?.data?.error?.code;
        if (err?.status === 410 || errCode === 'SHARE_LINK_EXPIRED') {
          setStatus('expired');
        } else if (err?.status === 404) {
          setStatus('invalid');
        } else if (err?.status === 401 || err?.status === 403) {
          // Should no longer happen — the backend made this endpoint public
          // (2026-07-11, with a route-placement regression test). Kept as a
          // defensive net so a visitor never sees "Not authenticated".
          setStatus('error');
          setErrorMessage(
            'This share link could not be opened right now. Please try again later or ask the owner to send a new link.'
          );
        } else {
          setStatus('error');
          setErrorMessage(
            err?.message || 'We were unable to load this shared asset.'
          );
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const pageBg = isDarkMode ? 'bg-[#101014] text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDarkMode
    ? 'bg-gradient-to-r from-[#222126] to-[#111116] border-[#FFFFFF14]'
    : 'bg-white border-gray-200';
  const subtext = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className='max-w-5xl mx-auto px-4 py-8 sm:py-12'>
        {/* Brand header */}
        <div className='flex items-center justify-between mb-8'>
          <span className='text-xl font-bold tracking-tight'>Akunuba</span>
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Shared asset
          </span>
        </div>

        {status === 'loading' && <SharedStateCard cardBg={cardBg} subtext={subtext} title='Loading shared asset…' message='Please wait while we retrieve the asset details.' spinner />}

        {status === 'missing-code' && (
          <SharedStateCard
            cardBg={cardBg}
            subtext={subtext}
            title='This link is incomplete'
            message='The share link is missing its access code. Please use the full link exactly as it was sent to you.'
          />
        )}

        {status === 'invalid' && (
          <SharedStateCard
            cardBg={cardBg}
            subtext={subtext}
            title='This link is no longer valid'
            message='Your file couldn’t be accessed. The share link may be invalid or it may have been deactivated by the owner.'
          />
        )}

        {status === 'expired' && (
          <SharedStateCard
            cardBg={cardBg}
            subtext={subtext}
            title='This link has expired'
            message='This share link is no longer active. Please ask the owner to send you a new link.'
          />
        )}

        {status === 'error' && (
          <SharedStateCard
            cardBg={cardBg}
            subtext={subtext}
            title='Something went wrong'
            message={errorMessage}
          />
        )}

        {status === 'ready' && asset && (
          <SharedAssetView
            asset={asset}
            permissions={permissions}
            formattedExpiry={formattedExpiry}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            isDarkMode={isDarkMode}
            cardBg={cardBg}
            subtext={subtext}
            shareContext={shareContext}
            hasSession={hasSession}
          />
        )}
      </div>
    </div>
  );
}

function SharedStateCard({ cardBg, subtext, title, message, spinner }) {
  return (
    <div className={`border rounded-2xl p-8 sm:p-12 text-center ${cardBg}`}>
      {spinner ? (
        <svg className='animate-spin h-8 w-8 mx-auto mb-4 text-[#F1CB68]' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
        </svg>
      ) : (
        <div className='w-12 h-12 rounded-full bg-[#F1CB68]/10 flex items-center justify-center mx-auto mb-4'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#F1CB68' strokeWidth='2'>
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='13' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
        </div>
      )}
      <h1 className='text-xl sm:text-2xl font-bold mb-2'>{title}</h1>
      {message && <p className={`text-sm sm:text-base ${subtext}`}>{message}</p>}
    </div>
  );
}

function SharedAssetView({
  asset,
  permissions,
  formattedExpiry,
  currentImageIndex,
  setCurrentImageIndex,
  isDarkMode,
  cardBg,
  subtext,
  shareContext,
  hasSession,
}) {
  // Signup CTA target. Only the email rides along (prefills the form) — no
  // claim context is needed: share grants are keyed by email server-side, and
  // VERIFYING the email is the claim. After signup + verification the asset
  // appears under GET /assets/shared-with-me automatically.
  const signupParams = new URLSearchParams();
  if (shareContext?.sharedWithEmail) signupParams.set('email', shareContext.sharedWithEmail);
  const signupHref = `/signup${signupParams.toString() ? `?${signupParams.toString()}` : ''}`;
  const images =
    asset.images && asset.images.length > 0
      ? asset.images
      : asset.image
      ? [asset.image]
      : [];

  const safeIndex = Math.min(currentImageIndex, Math.max(images.length - 1, 0));

  const currentValue =
    typeof asset.currentValue === 'number'
      ? formatCurrency(asset.currentValue, asset.currency)
      : asset.currentValueFormatted || asset.currentValue;

  const estimatedValue =
    typeof asset.estimatedValue === 'number'
      ? formatCurrency(asset.estimatedValue, asset.currency)
      : asset.estimatedValueFormatted || asset.estimatedValue;

  const specs = asset.specifications || {};
  const detailRows = [
    { label: 'Category', value: asset.category },
    { label: 'Status', value: asset.status },
    { label: 'Property Type', value: specs.propertyType || specs.property_type },
    { label: 'Location', value: specs.address || asset.location },
    { label: 'Year Built', value: specs.yearBuilt || specs.year_built },
    { label: 'Size', value: specs.size },
  ].filter((row) => row.value !== undefined && row.value !== null && row.value !== '');

  return (
    <div className='space-y-6'>
      {/* Expiry / view-only banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl px-4 py-3 text-sm ${
          isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-[#F1CB68]/10 text-gray-700'
        }`}
      >
        <span>
          {permissions.includes('view') || permissions.length === 0
            ? 'You have view-only access to this asset.'
            : `Permissions: ${permissions.join(', ')}`}
        </span>
        {formattedExpiry && <span className='font-medium'>Link expires {formattedExpiry}</span>}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Images + description */}
        <div className='lg:col-span-2 space-y-6'>
          <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
            <div className='relative aspect-video bg-black'>
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[safeIndex]} alt={asset.name} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900'>
                  <span className='text-4xl text-gray-600'>📦</span>
                </div>
              )}
              {images.length > 1 && (
                <div className='absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-sm text-white'>
                  {safeIndex + 1}/{images.length}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className='p-4 flex gap-3 overflow-x-auto'>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      safeIndex === index ? 'border-[#F1CB68]' : 'border-transparent hover:border-[#FFFFFF14]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`View ${index + 1}`} className='w-full h-full object-cover' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {asset.description && (
            <div className={`border rounded-2xl p-6 ${cardBg}`}>
              <h2 className='text-lg font-semibold mb-3'>Description</h2>
              <p className={`text-sm leading-relaxed ${subtext}`}>{asset.description}</p>
            </div>
          )}

          {detailRows.length > 0 && (
            <div className={`border rounded-2xl p-6 ${cardBg}`}>
              <h2 className='text-lg font-semibold mb-4'>Details</h2>
              <div className='grid grid-cols-2 gap-y-4 gap-x-6'>
                {detailRows.map((row) => (
                  <div key={row.label}>
                    <p className={`text-xs mb-1 ${subtext}`}>{row.label}</p>
                    <p className='font-medium capitalize'>{String(row.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='space-y-6'>
          <div className={`border rounded-2xl p-6 ${cardBg}`}>
            <h1 className='text-2xl font-bold mb-2'>{asset.name || 'Asset'}</h1>
            {asset.category && <p className={`text-sm mb-4 capitalize ${subtext}`}>{asset.category}</p>}
            {currentValue != null && currentValue !== '' && (
              <div className='mb-4'>
                <p className={`text-xs mb-1 ${subtext}`}>Current Value</p>
                <p className='text-3xl font-bold'>{currentValue}</p>
              </div>
            )}
            {estimatedValue != null && estimatedValue !== '' && (
              <div>
                <p className={`text-xs mb-1 ${subtext}`}>Estimated Value</p>
                <p className='text-lg font-semibold'>{estimatedValue}</p>
              </div>
            )}
          </div>

          {/* Account CTA — the shared view stays read-only for visitors; any
              further action goes through an account. Signing up with the email
              the share was addressed to puts this asset in that account. */}
          <div className={`border rounded-2xl p-6 ${cardBg}`}>
            {hasSession ? (
              <>
                <h2 className='text-lg font-semibold mb-2'>You&apos;re signed in</h2>
                <p className={`text-sm mb-4 ${subtext}`}>
                  Open your dashboard to manage your own assets and portfolio.
                </p>
                <a
                  href='/dashboard'
                  className='block w-full text-center px-4 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-white to-[#F1CB68] text-black hover:opacity-90 transition-opacity'
                >
                  Go to Dashboard
                </a>
              </>
            ) : (
              <>
                <h2 className='text-lg font-semibold mb-2'>Want to do more with this asset?</h2>
                <p className={`text-sm mb-4 ${subtext}`}>
                  Create a free Akunuba account
                  {shareContext?.sharedWithEmail ? (
                    <> using <span className='font-semibold'>{shareContext.sharedWithEmail}</span></>
                  ) : null}
                  {' '}and this shared asset will be available in it.
                </p>
                <a
                  href={signupHref}
                  className='block w-full text-center px-4 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-white to-[#F1CB68] text-black hover:opacity-90 transition-opacity'
                >
                  Sign Up to Continue
                </a>
                <p className={`text-xs mt-3 text-center ${subtext}`}>
                  Already have an account?{' '}
                  <a href='/login' className='text-[#F1CB68] hover:underline'>
                    Log in
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
