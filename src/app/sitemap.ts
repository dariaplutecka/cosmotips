import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seoUtils";

/** Public URLs only (thin / transactional routes use `robots`). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/articles", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
  ];
  const lastModified = new Date();
  return paths.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
