import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // Keep this for GitHub Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['raw.githubusercontent.com', 'github.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Sankan_Student/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/Sankan_Student' : '',
};

export default nextConfig;