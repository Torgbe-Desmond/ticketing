import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["ticketing.dev"],
  images: {
    remotePatterns: [
      {
        hostname: "oraticxusa.com",
      },
    ],
  },
};

export default nextConfig;
