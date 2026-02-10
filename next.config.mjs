/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility - use static export for production builds
  // Note: API routes will work in development mode even with output: 'export'
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  // Disable features that don't work with static export
  trailingSlash: true,
  // Skip dynamic routes during build (they'll be handled client-side)
  skipTrailingSlashRedirect: true,
  // Disable source maps for faster builds (optional)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
