'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import StrategyDetailClient from '../[id]/StrategyDetailClient';

// Inner component that uses useSearchParams — must be wrapped in Suspense.
function StrategyDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const strategyId = searchParams.get('id');

  useEffect(() => {
    if (!strategyId) {
      router.replace('/dashboard/investment/strategies');
    }
  }, [strategyId, router]);

  if (!strategyId) return null;

  return <StrategyDetailClient strategyId={strategyId} />;
}

// Query-param detail route. Unlike the [id] path route, this works for ANY
// strategy id under static export (`output: 'export'`) — no route generation
// needed, so clones and user-created strategies don't 404 in production.
export default function StrategyDetailQueryPage() {
  return (
    <Suspense fallback={null}>
      <StrategyDetailContent />
    </Suspense>
  );
}
