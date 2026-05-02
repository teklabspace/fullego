/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility - use static export for production builds
  // Note: API routes are excluded from static export builds automatically
  // output disabled: use Node server runtime for dynamic dashboard routes
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  // Default URL shape (no trailing slash). Matches OAuth redirects like
  // /auth/google/callback?... and avoids 404s when trailingSlash:true +
  // skipTrailingSlashRedirect broke slash-less URLs on Edge/CDN.
  trailingSlash: false,
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
