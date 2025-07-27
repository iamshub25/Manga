/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['uploads.mangadex.org', 'via.placeholder.com'],
    unoptimized: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;