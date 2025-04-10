import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignoruj błędy ESLint podczas budowania (tylko tymczasowo)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
