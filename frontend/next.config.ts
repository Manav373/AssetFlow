import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip typescript validation checking during build for maximum speed
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip eslint checking during build for maximum speed
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
