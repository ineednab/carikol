import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["poplar-hardwood-backhand.ngrok-free.dev"],
};

export default nextConfig;
