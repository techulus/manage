/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.clerk.dev", "img.clerk.com"],
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["@libsql"],
  },
};

module.exports = nextConfig;
