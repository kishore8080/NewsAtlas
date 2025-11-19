import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove Kubernetes-specific rewrites for Vercel deployment
  // API calls should use NEXT_PUBLIC_API_URL environment variable instead
  // For Vercel, you can configure rewrites in vercel.json if needed
};

export default nextConfig;
