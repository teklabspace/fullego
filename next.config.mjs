/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Cloudflare Pages compatibility - use static export
  output: 'export',
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js image optimization
  },
  // Disable features that don't work with static export
  trailingSlash: true,
  // Skip dynamic routes during build (they'll be handled client-side)
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
