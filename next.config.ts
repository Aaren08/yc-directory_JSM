import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  experimental: {
    cacheComponents: true,
  },
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
