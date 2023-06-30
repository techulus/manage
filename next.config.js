/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.clerk.dev"],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
