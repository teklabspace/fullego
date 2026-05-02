// Static export: Next must see generateStaticParams on this segment (see strategies/[id]/layout.js).
// Listing IDs come from the API at runtime; client navigation works from marketplace index.
// Direct URL loads need the asset path to exist — placeholder ensures export emits the route shell.
export async function generateStaticParams() {
  return [{ id: '__' }];
}

export default function MarketplaceDetailLayout({ children }) {
  return children;
}
