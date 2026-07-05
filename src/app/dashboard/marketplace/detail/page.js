// Static-export-safe listing detail: /dashboard/marketplace/detail?id=<listing-id>.
// A dynamic /dashboard/marketplace/[id] path can't be prerendered with
// `output: export` (IDs are unbounded), so all in-app navigation uses this
// query-param route instead — same pattern as /dashboard/assets/detail.
import InvestmentDetailClient from '../[id]/InvestmentDetailClient';

export default function MarketplaceDetailPage() {
  return <InvestmentDetailClient />;
}
