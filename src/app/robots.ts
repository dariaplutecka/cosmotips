import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seoUtils";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/success", "/reports", "/cancel"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
