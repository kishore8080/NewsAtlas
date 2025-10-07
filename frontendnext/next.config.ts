import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      "http://35.192.3.34",   // your frontend LoadBalancer IP
      "http://localhost:3000" // local dev
    ],
  },
    // Rewrite (proxy) requests to FastAPI backend inside the cluster
  async rewrites() {
    return [
      {
        source: "/quiz/:path*",
        destination: "http://backend-service:8000/quiz/:path*", // internal service name
      },
    ];
  },
};

export default nextConfig;
