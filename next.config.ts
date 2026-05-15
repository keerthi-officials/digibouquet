import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {},
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

export default nextConfig;
