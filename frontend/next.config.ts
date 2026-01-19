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
};

export default nextConfig;
