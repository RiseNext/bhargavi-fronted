import type { NextConfig } from "next";

/**
 * Baseline hardening. Vercel serves HSTS on its own domains, so the only
 * additions worth making here are the ones Next does not set for us.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // No camera/mic/geolocation anywhere on this site.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // YouTube thumbnails for the Health Talks pages.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // 🔴 E6 — uploaded media. Every image managed through the admin panel is
      // served from here, so without this entry `next/image` throws at build
      // time and the whole media pipeline is unusable. This one line gates
      // every later media step.
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },

  // Surface a bad redirect or broken build early rather than at runtime.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
