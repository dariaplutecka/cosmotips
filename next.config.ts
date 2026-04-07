import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfmake", "pdfkit"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
