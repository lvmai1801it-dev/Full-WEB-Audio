import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow common image hosts and wildcards for flexibility
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "**.archive.org",
      },
      {
        protocol: "https",
        hostname: "*.imgur.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "audiotruyenfull.com",
      },
      {
        protocol: "https",
        hostname: "*.audiotruyenfull.com",
      },
      {
        // Allow any HTTPS image (fallback for unknown sources)
        protocol: "https",
        hostname: "**",
      },
      {
        // Allow any HTTP image (for development)
        protocol: "http",
        hostname: "**",
      },
    ],
    // Disable optimization failures - show original images on error
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  output: "standalone",

  // CORS headers for API routes (allow crawl script from browser console)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
