import type { NextConfig } from "next";

// Blog images uploaded from /admin are served from the Supabase project's public storage.
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  experimental: {
    // Blog image uploads from /admin (4 MB max, plus form overhead).
    serverActions: { bodySizeLimit: "5mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
