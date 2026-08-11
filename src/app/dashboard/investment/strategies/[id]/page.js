'use client';
import { useParams } from 'next/navigation';
import StrategyDetailClient from './StrategyDetailClient';

// Path-param route — only the platform strategies whitelisted in layout.js
// generateStaticParams exist as static pages. Everything else (clones,
// user-created strategies) links to /dashboard/investment/strategies/detail?id=.
export default function StrategyDetailsPage() {
  const params = useParams();
  return <StrategyDetailClient strategyId={params.id} />;
}
