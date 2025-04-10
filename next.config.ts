import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignoruj błędy ESLint podczas budowania (tylko tymczasowo)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignoruj błędy TypeScript podczas budowania (tylko tymczasowo)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
