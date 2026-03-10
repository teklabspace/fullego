import InvestmentDetailClient from './InvestmentDetailClient';

// Required for static export - generateStaticParams must be in a server component
// Returns empty array - routes will be generated dynamically from API data
export async function generateStaticParams() {
  // No hardcoded IDs - all routes will be generated dynamically from API
  return [];
}

export default function InvestmentDetailPage() {
  return <InvestmentDetailClient />;
}
