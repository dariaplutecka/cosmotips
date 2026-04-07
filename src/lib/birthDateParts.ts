export const MIN_BIRTH_YEAR = 1900;

export function currentBirthYearMax(): number {
  return new Date().getFullYear();
}

export function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

/**
 * Valid calendar date as YYYY-MM-DD, or "" if incomplete or invalid.
 * `maxYear` is usually the current calendar year.
 */
export function isoFromPartStrings(
  yStr: string,
  mStr: string,
  dStr: string,
  maxYear: number,
): string {
  if (!yStr || !mStr || !dStr) return "";
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return "";
  if (y < MIN_BIRTH_YEAR || y > maxYear) return "";
  if (m < 1 || m > 12) return "";
  if (d < 1) return "";
  const dim = daysInMonth(y, m);
  if (d > dim) return "";
  const test = new Date(y, m - 1, d);
  if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) {
    return "";
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
