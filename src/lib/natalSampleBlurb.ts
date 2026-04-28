import type { AppLang } from "@/lib/reportSchema";
import type { NatalChartPayload } from "@/lib/natalChart";

const SIGNS_EN = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const SIGNS_PL = [
  "Baranie",
  "Byku",
  "Bliźniętach",
  "Raku",
  "Lwie",
  "Pannie",
  "Wadze",
  "Skorpionie",
  "Strzelcu",
  "Koziorożcu",
  "Wodniku",
  "Rybach",
] as const;

const SIGNS_ES = [
  "Aries",
  "Tauro",
  "Géminis",
  "Cáncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis",
] as const;

function signIndex(longitude: number): number {
  let x = longitude % 360;
  if (x < 0) x += 360;
  return Math.floor(x / 30) % 12;
}

function signName(lang: AppLang, i: number): string {
  if (lang === "pl") return SIGNS_PL[i] ?? SIGNS_PL[0];
  if (lang === "es") return SIGNS_ES[i] ?? SIGNS_ES[0];
  return SIGNS_EN[i] ?? SIGNS_EN[0];
}

function sunMoonAsc(chart: NatalChartPayload): {
  sun: number;
  moon: number;
  asc: number;
} {
  const sunLon =
    chart.bodies.find((b) => b.id === "sun")?.longitude ?? chart.ascendantDeg;
  const moonLon =
    chart.bodies.find((b) => b.id === "moon")?.longitude ?? chart.ascendantDeg;
  return {
    sun: signIndex(sunLon),
    moon: signIndex(moonLon),
    asc: signIndex(chart.ascendantDeg),
  };
}

/** Short markdown: Big Three + disclaimer — no LLM, deterministic copy. */
export function buildNatalSampleBlurb(
  chart: NatalChartPayload,
  lang: AppLang,
): string {
  const { sun, moon, asc } = sunMoonAsc(chart);
  const sSun = signName(lang, sun);
  const sMoon = signName(lang, moon);
  const sAsc = signName(lang, asc);
  const place = chart.placeLabel;

  if (lang === "pl") {
    return [
      "## Twoja podstawowa analiza wykresu urodzeniowego",
      "",
      `**${place}** · **Słońce** w ${sSun} · **Księżyc** w ${sMoon} · **Ascendent** w ${sAsc}.`,
      "",
      "- **Słońce** — rdzeń motywacji i sposobu bycia „na co dzień”.",
      "- **Księżyc** — potrzeby emocjonalne i to, co daje poczucie bezpieczeństwa.",
      "- **Ascendent** — pierwszy kontakt z otoczeniem: jak zwykle Cię „pierwsze wrażenie” odbiera.",
      "",
      "To **skrócona próbka raportu** (ekliptyka + Ascendent), bez pełnej interpretacji domów, aspektów i prognoz. Wróć do strony głównej aby zamówić pełen raport.",
    ].join("\n");
  }

  if (lang === "es") {
    return [
      "## Tu análisis básico de la carta natal",
      "",
      `**${place}** · **Sol** en ${sSun} · **Luna** en ${sMoon} · **Ascendente** en ${sAsc}.`,
      "",
      "- **Sol** — núcleo de motivación y estilo de presencia.",
      "- **Luna** — necesidades emocionales y lo que te da calma.",
      "- **Ascendente** — la primera impresión que sueles proyectar.",
      "",
      "Es una **muestra breve del informe** (eclíptica + Ascendente), sin interpretación completa de casas, aspectos ni pronósticos. Vuelve a la página principal para pedir un informe completo.",
    ].join("\n");
  }

  return [
    "## Your basic birth chart analysis",
    "",
    `**${place}** · **Sun** in ${sSun} · **Moon** in ${sMoon} · **Ascendant** in ${sAsc}.`,
    "",
    "- **Sun** — core motivation and how you “show up” day to day.",
    "- **Moon** — emotional needs and what helps you feel grounded.",
    "- **Ascendant** — the first impression you tend to give others.",
    "",
    "This is a **short sample report** (ecliptic + Ascendant), without the full interpretation of houses, aspects, and forecasts. Return to the home page to order a full report.",
  ].join("\n");
}
