// Static export (`output: 'export'`): Next must see generateStaticParams on a
// dynamic segment, so we emit a single placeholder route shell. Real asset IDs
// are unbounded and only known at runtime, so the client component reads the
// id from the URL. Direct loads of arbitrary IDs are routed to this shell by a
// rewrite in public/_redirects (`/assets/*/shared -> /assets/__/shared 200`).
export async function generateStaticParams() {
  return [{ id: '__' }];
}

export const metadata = {
  title: 'Shared Asset — Akunuba',
  description: 'View an asset shared with you on Akunuba.',
};

export default function SharedAssetLayout({ children }) {
  return children;
}
