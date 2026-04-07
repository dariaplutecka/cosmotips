import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { AppLang } from "@/lib/reportSchema";

const ES_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "UY",
  "PY",
  "BO",
  "EC",
  "GT",
  "CR",
  "VE",
  "DO",
  "HN",
  "NI",
  "SV",
  "PA",
  "PR",
]);

function langFromAcceptLanguage(header: string | null): AppLang | null {
  if (!header) return null;
  const parts = header.split(",").map((p) => p.trim().split(";")[0]?.toLowerCase() ?? "");
  for (const p of parts) {
    if (p.startsWith("pl")) return "pl";
    if (p.startsWith("es")) return "es";
  }
  return null;
}

export async function GET() {
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    h.get("x-app-country") ??
    "";

  let lang: AppLang = "en";
  let source: "country" | "accept-language" | "default" = "default";

  if (country === "PL") {
    lang = "pl";
    source = "country";
  } else if (ES_COUNTRIES.has(country.toUpperCase())) {
    lang = "es";
    source = "country";
  } else {
    const fromAl = langFromAcceptLanguage(h.get("accept-language"));
    if (fromAl) {
      lang = fromAl;
      source = "accept-language";
    }
  }

  return NextResponse.json({
    lang,
    source,
    country: country || null,
  });
}
