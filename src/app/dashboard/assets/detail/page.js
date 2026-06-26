'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import AssetDetailClient from '../[id]/AssetDetailClient';

// Inner component that uses useSearchParams - must be wrapped in Suspense
function AssetDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assetId = searchParams.get('id');
  // Admins open an asset by its code (?code=AK-01); AssetDetailClient resolves
  // it via the admin-only endpoint, reading the code from the URL itself.
  const assetCode = searchParams.get('code');

  // Redirect to assets list only if neither an id nor a code was provided.
  useEffect(() => {
    if (!assetId && !assetCode) {
      router.replace('/dashboard/assets');
    }
  }, [assetId, assetCode, router]);

  if (!assetId && !assetCode) {
    return null;
  }

  return <AssetDetailClient assetId={assetId} />;
}

// Client-side page that uses query parameters instead of path parameters
// This works perfectly with static export since no route generation is needed
export default function AssetDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading asset...</p>
        </div>
      </div>
    }>
      <AssetDetailContent />
    </Suspense>
  );
}
