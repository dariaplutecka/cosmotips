/**
 * E-maile z pominięciem płatności za płatne raporty (i tokeny tarota w checkout).
 * Uzupełnij listę przez COSMOTIPS_FREE_REPORT_EMAILS (comma-separated) na produkcji
 * bez zmiany kodu.
 */
const EXTRA_FROM_ENV = (): Set<string> => {
  const raw = process.env.COSMOTIPS_FREE_REPORT_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
};

const HARDCODED = new Set<string>(["daria.plutecka@gmail.com"]);

export function isFreeReportEmailAllowed(email: string): boolean {
  const n = email.trim().toLowerCase();
  if (!n) return false;
  if (HARDCODED.has(n)) return true;
  return EXTRA_FROM_ENV().has(n);
}
