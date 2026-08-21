import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this Turbopack walks up past the repo and
  // picks up an unrelated lockfile sitting in the parent projects folder.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
