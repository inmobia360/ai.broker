import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/app",
        destination: "/",
      },
      {
        source: "/app/:path*",
        destination: "/",
      },
      {
        source: "/dashboard",
        destination: "/",
      },
      {
        source: "/leads",
        destination: "/",
      },
      {
        source: "/properties",
        destination: "/",
      },
      {
        source: "/content-generator",
        destination: "/",
      },
      {
        source: "/settings",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
