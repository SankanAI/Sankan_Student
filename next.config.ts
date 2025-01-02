import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['raw.githubusercontent.com','github.com'], // Add the allowed hostname here
  },
};

export default nextConfig;
