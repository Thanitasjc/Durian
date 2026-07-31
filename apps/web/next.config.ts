import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8000";
const apiHost = new URL(apiUrl).hostname;
const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_HOST ?? "anefnlhwarioumxdyrpa.supabase.co";
const supabaseStorageHost =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_HOST ??
  "anefnlhwarioumxdyrpa.storage.supabase.co";
const supabasePublic = `https://${supabaseHost}`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", pathname: "/storage/**" },
      { protocol: "http", hostname: apiHost, pathname: "/storage/**" },
      { protocol: "https", hostname: apiHost, pathname: "/storage/**" },
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: supabaseStorageHost, pathname: "/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      // Supabase public objects saved as relative /storage/v1/... must NOT hit Laravel
      {
        source: "/storage/v1/:path*",
        destination: `${supabasePublic}/storage/v1/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
