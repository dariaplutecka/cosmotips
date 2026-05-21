import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfmake", "pdfkit"],
  turbopack: {
    root: __dirname,
  },
  /** Apex → www; permanent: true uses HTTP 308 (not 307). */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "cosmotips.eu" }],
        destination: "https://www.cosmotips.eu/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
