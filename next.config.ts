import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

function r2RemoteHostname(): string | undefined {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!base) return undefined;
  try {
    return new URL(base).hostname;
  } catch {
    return undefined;
  }
}

const r2Hostname = r2RemoteHostname();

const nextConfig: NextConfig = {
  // Standalone Docker output is not used for Cloudflare Workers deploys.
  // Climb send videos easily exceed the default 1mb Server Action cap.
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
  images: {
    // Allow cache-bust query strings on local media (e.g. /media/...?v=123).
    localPatterns: [
      { pathname: "/media/**" },
      { pathname: "/images/**" },
    ],
    remotePatterns: r2Hostname
      ? [
          {
            protocol: "https",
            hostname: r2Hostname,
          },
        ]
      : [],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
