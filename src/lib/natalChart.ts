import { TZDate } from "@date-fns/tz";
import { find } from "geo-tz";
import * as Astronomy from "astronomy-engine";
import { geocodePlace } from "@/lib/geocode";

export type NatalBody = {
  id: string;
  label: string;
  longitude: number;
};

export type NatalChartPayload = {
  birthLocalIso: string;
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  ascendantDeg: number;
  bodies: NatalBody[];
};

const PLANETS: Array<{ id: string; label: string; body: Astronomy.Body }> = [
  { id: "mercury", label: "Mercury", body: Astronomy.Body.Mercury },
  { id: "venus", label: "Venus", body: Astronomy.Body.Venus },
  { id: "mars", label: "Mars", body: Astronomy.Body.Mars },
  { id: "jupiter", label: "Jupiter", body: Astronomy.Body.Jupiter },
  { id: "saturn", label: "Saturn", body: Astronomy.Body.Saturn },
  { id: "uranus", label: "Uranus", body: Astronomy.Body.Uranus },
  { id: "neptune", label: "Neptune", body: Astronomy.Body.Neptune },
  { id: "pluto", label: "Pluto", body: Astronomy.Body.Pluto },
];

function ascendantDeg(
  date: Date,
  latitude: number,
  longitudeEast: number,
): number {
  const gast = Astronomy.SiderealTime(date);
  const lst = gast + longitudeEast / 15;
  let ramc = (lst * 15) % 360;
  if (ramc < 0) ramc += 360;

  const eps = (23.4392911 * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  const theta = (ramc * Math.PI) / 180;
  const y = -Math.cos(theta);
  const x = Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  if (asc < 0) asc += 360;
  return asc;
}

function parseDobTob(dob: string, tob: string): { y: number; m: number; d: number; hh: number; mm: number } {
  const [ys, ms, ds] = dob.split("-");
  const [hs, mins] = tob.split(":");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const hh = Number(hs);
  const mm = Number(mins);
  if (![y, m, d, hh, mm].every((n) => Number.isFinite(n))) {
    throw new Error("Invalid date or time.");
  }
  return { y, m: m - 1, d, hh, mm };
}

export async function computeNatalChart(input: {
  dob: string;
  tob: string;
  pob: string;
}): Promise<NatalChartPayload> {
  const geo = await geocodePlace(input.pob);
  if (!geo) {
    throw new Error("Could not find coordinates for this place.");
  }

  const zones = find(geo.lat, geo.lon);
  const timezone = zones[0] ?? "UTC";

  const { y, m, d, hh, mm } = parseDobTob(input.dob, input.tob);
  const birth = new TZDate(y, m, d, hh, mm, 0, timezone);

  const sunLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Sun, birth, true),
  ).elon;
  const moonLon = Astronomy.EclipticGeoMoon(birth).lon;

  const bodies: NatalBody[] = [
    { id: "sun", label: "Sun", longitude: sunLon },
    { id: "moon", label: "Moon", longitude: moonLon },
    ...PLANETS.map((p) => ({
      id: p.id,
      label: p.label,
      longitude: Astronomy.Ecliptic(
        Astronomy.GeoVector(p.body, birth, true),
      ).elon,
    })),
  ];

  const asc = ascendantDeg(birth, geo.lat, geo.lon);

  return {
    birthLocalIso: birth.toISOString(),
    timezone,
    latitude: geo.lat,
    longitude: geo.lon,
    placeLabel: geo.displayName,
    ascendantDeg: asc,
    bodies,
  };
}

export function natalChartSummaryJson(chart: NatalChartPayload): string {
  return JSON.stringify(
    {
      birthLocalIso: chart.birthLocalIso,
      timezone: chart.timezone,
      latitude: chart.latitude,
      longitude: chart.longitude,
      placeLabel: chart.placeLabel,
      ascendantDeg: Number(chart.ascendantDeg.toFixed(4)),
      bodies: chart.bodies.map((b) => ({
        id: b.id,
        label: b.label,
        longitudeDeg: Number(b.longitude.toFixed(4)),
      })),
    },
    null,
    2,
  );
}
