import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy coin-flip requests to the backend service without exposing its URL
    // to client bundles. Set BACKEND_URL in the deployment environment.
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/coin-flip",
        destination: `${backendUrl}/api/coin-flip`,
      },
    ];
  },
};

export default nextConfig;
