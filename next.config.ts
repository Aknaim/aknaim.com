import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Standalone Docker output is not used for Cloudflare Workers deploys.
};

export default nextConfig;

initOpenNextCloudflareForDev();
