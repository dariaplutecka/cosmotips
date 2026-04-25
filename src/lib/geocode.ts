export type GeocodeHit = {
  lat: number;
  lon: number;
  displayName: string;
};

export async function geocodePlace(query: string): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "cosmotips/1.0 (personalized horoscope app)",
    },
  });

  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as unknown;
  if (!Array.isArray(data) || data.length === 0) return null;
  const row = data[0] as { lat?: string; lon?: string; display_name?: string };
  const lat = Number(row.lat);
  const lon = Number(row.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat,
    lon,
    displayName: typeof row.display_name === "string" ? row.display_name : q,
  };
}
