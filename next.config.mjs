import { withPayload } from "@payloadcms/next/withPayload";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/**" }],
    remotePatterns: process.env.S3_PUBLIC_URL
      ? [{ protocol: "https", hostname: new URL(process.env.S3_PUBLIC_URL).hostname }]
      : [],
  },
  async redirects() {
    // старые адреса продолжают работать
    return [
      { source: "/parents", destination: "/participants/parents", permanent: true },
      { source: "/ranking", destination: "/participants/ranking", permanent: true },
      { source: "/education", destination: "/participants/coaches", permanent: true },
      { source: "/education/judges", destination: "/participants/judges", permanent: true },
      { source: "/education/coaches", destination: "/participants/coaches", permanent: true },
      { source: "/antidoping", destination: "/participants/antidoping", permanent: true },
    ];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (isProd && siteUrl.startsWith("https://")) {
      security.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers: security }];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
