import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdfjs-dist", "canvas"],
};

export default nextConfig;
