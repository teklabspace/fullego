import InvestmentDetailClient from './InvestmentDetailClient';

// Required for static export - generateStaticParams must be in a server component
export async function generateStaticParams() {
  // Return all investment fund IDs from the marketplace
  // IDs match the funds defined in /dashboard/marketplace/page.js
  const fundIds = [1, 2, 3, 4, 5, 6];

  // Convert to string format as required by Next.js
  return fundIds.map(id => ({
    id: id.toString(),
  }));
}

export default function InvestmentDetailPage() {
  return <InvestmentDetailClient />;
}
