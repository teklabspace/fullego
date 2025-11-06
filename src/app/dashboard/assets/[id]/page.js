import AssetDetailClient from './AssetDetailClient';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Generate a range of IDs for static export
  // Cloudflare Pages will pre-render these routes at build time
  // Increase the range if you need to support more asset IDs
  const ids = [];
  const maxId = 500; // Adjust this number based on your needs

  for (let i = 1; i <= maxId; i++) {
    ids.push({ id: i.toString() });
  }
  return ids;
}

export default function AssetDetailPage() {
  return <AssetDetailClient />;
}
