/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Demo/placeholder images come from a CDN; Next's optimiser needs to be allowed
    // to fetch them. `unoptimized` keeps the build from failing on hosts that are
    // unreachable at build time.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    unoptimized: true,
  },
  // Stripe/Firebase are browser-only; never try to SSR them.
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

export default nextConfig;
