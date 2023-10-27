/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.clerk.dev", "img.clerk.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql"],
  },
};

module.exports = nextConfig;
