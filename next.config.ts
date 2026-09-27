import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the local network use the dev server (e.g. testing on an
  // iPhone at http://10.0.0.150:3000). Dev-only; no effect in production.
  // Update if your Mac's local IP changes.
  allowedDevOrigins: ["10.0.0.150"],
  // The default bottom-left "N" badge sits on top of the phone mini player,
  // swallowing taps meant to open Now Playing. Dev-only.
  devIndicators: { position: "top-right" },
};

export default nextConfig;
