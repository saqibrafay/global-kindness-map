import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up past the repo
  // and can pick up an unrelated lockfile from the home directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
