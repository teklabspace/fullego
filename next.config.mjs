/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility - use static export
  output: 'export',
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  // Disable features that don't work with static export
  trailingSlash: true,
  // Skip dynamic routes during build (they'll be handled client-side)
  skipTrailingSlashRedirect: true,
  // Disable source maps for faster builds (optional)
  productionBrowserSourceMaps: false,
  // Disable Turbopack to use Webpack instead (for Cloudflare Pages compatibility)
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
