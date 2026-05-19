/**
 * Canonical / sitemap base URL. Prefer a production domain via
 * `NEXT_PUBLIC_SITE_URL` (e.g. `https://cosmotips.eu`).
 */
export function getSiteUrl(): string {
  const raw =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" ? process.env.NEXT_PUBLIC_SITE_URL.trim() : "";
  if (raw && /^https:\/\/.+/i.test(raw)) return raw.replace(/\/+$/, "");
  return "https://cosmotips.vercel.app";
}

export function buildAlternates(path: string) {
  const BASE_URL = getSiteUrl();
  return {
    canonical: `${BASE_URL}${path}`,
    languages: {
      en: `${BASE_URL}${path}?lang=en`,
      pl: `${BASE_URL}${path}?lang=pl`,
      es: `${BASE_URL}${path}?lang=es`,
    },
  };
}
