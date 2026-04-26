const BASE_URL = "https://cosmotips.vercel.app";

export function buildAlternates(path: string) {
  return {
    canonical: `${BASE_URL}${path}`,
    languages: {
      en: `${BASE_URL}${path}?lang=en`,
      pl: `${BASE_URL}${path}?lang=pl`,
      es: `${BASE_URL}${path}?lang=es`,
    },
  };
}
