import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to the repo root, not to web/.
  //
  // This is a pnpm workspace, so web/node_modules/next is a symlink into the
  // store at <repo>/node_modules/.pnpm. Turbopack refuses to compile files
  // outside its root, so pinning the root at web/ puts the Next.js package
  // itself out of bounds and dev fails with "Could not find the Next.js
  // package". The repo root contains the lockfile and the store, so it is the
  // correct root — and pinning it explicitly still stops Turbopack walking any
  // further up into the parent projects folder.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
