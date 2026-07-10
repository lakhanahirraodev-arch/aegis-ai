import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aegis/ui"],
  env: {
    // Provide build-time fallback to satisfy Clerk initializers during static page generation
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      "pk_test_bW9jay1jbGVyay1rZXktMTAwLmxvY2FsLmRldiQ",
  },
};

export default nextConfig;
