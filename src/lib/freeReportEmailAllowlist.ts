/**
 * E-maile z pominięciem płatności za płatne raporty (i tokeny tarota w checkout).
 * Uzupełnij listę przez COSMOTIPS_FREE_REPORT_EMAILS (comma-separated) na produkcji
 * bez zmiany kodu.
 */

/** Jak Gmail traktuje lokalną część: ignoruje kropki; obcina +tag. googlemail → gmail */
function canonicalEmailForm(email: string): string {
  const t = email.trim().toLowerCase();
  const at = t.lastIndexOf("@");
  if (at <= 0 || at >= t.length - 1) return t;
  let local = t.slice(0, Math.max(0, at));
  let domain = t.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    local = local.split("+")[0] ?? local;
    local = local.replace(/\./g, "");
  }
  return `${local}@${domain}`;
}

const EXTRA_FROM_ENV = (): Set<string> => {
  const raw = process.env.COSMOTIPS_FREE_REPORT_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => canonicalEmailForm(e))
      .filter(Boolean),
  );
};

const RAW_HARDCODED = [
  "daria.plutecka@gmail.com",
  "wojciechwator10@gmail.com",
] as const;
const CANONICAL_HARDCODED = new Set(
  RAW_HARDCODED.map((e) => canonicalEmailForm(e)),
);

export function isFreeReportEmailAllowed(email: string): boolean {
  const n = canonicalEmailForm(email);
  if (!n || !email.trim()) return false;
  if (CANONICAL_HARDCODED.has(n)) return true;
  return EXTRA_FROM_ENV().has(n);
}
