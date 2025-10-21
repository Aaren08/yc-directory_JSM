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
  cacheComponents: true,
  headers: async () => [
    {
      source: "/startup/:id*",
      headers: [{ key: "Cache-Control", value: "no-store" }],
    },
  ],
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
