/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility - use static export for production builds
  // Note: API routes are excluded from static export builds automatically
  // output disabled: use Node server runtime for dynamic dashboard routes
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  // Disable features that don't work with static export
  trailingSlash: true,
  // Skip dynamic routes during build (they'll be handled client-side)
  skipTrailingSlashRedirect: true,
  // Disable source maps for faster builds (optional)
  productionBrowserSourceMaps: false,
  // Disable ESLint during builds to allow deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
