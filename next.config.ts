import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// #region agent log
console.log(JSON.stringify({ sessionId: '8d50c7', location: 'next.config.ts:5', message: 'next.config.ts loaded by build', data: { nodeVersion: process.version, env: process.env.NODE_ENV }, timestamp: Date.now(), hypothesisId: 'B' }));
// #endregion

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "https://api.nabdaotp.com";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
