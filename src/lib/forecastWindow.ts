import { TZDate } from "@date-fns/tz";
import { addDays, format, type Locale } from "date-fns";
import { enUS, es, pl } from "date-fns/locale";
import type { AppLang } from "@/lib/reportSchema";

/** Calendar context for forecasts (product default: Central European time). */
export const REPORT_TIMEZONE = "Europe/Warsaw";

const DAY_TITLE_LOCALE: Record<AppLang, Locale> = {
  en: enUS,
  pl,
  es,
};

export type ForecastWindows = {
  timezone: string;
  /** YYYY-MM-DD in REPORT_TIMEZONE */
  today: string;
  /** Rolling 7-day window from today (inclusive), same as weeklyDates[0]…[6]. */
  weekly: { start: string; end: string };
  /** Seven ISO dates (today … +6) in REPORT_TIMEZONE */
  weeklyDates: string[];
  /** Rolling 30 calendar days from today (inclusive): today … today+29 */
  monthly: { start: string; end: string };
  /** Non-overlapping ~7-day slices covering the 30-day window (last slice may be shorter). */
  monthlySegments: { start: string; end: string }[];
};

/** Localized weekday + date for section headings (e.g. report markdown ## lines). */
export function formatForecastDayHeading(isoDate: string, lang: AppLang): string {
  const [y, mo, d] = isoDate.split("-").map((x) => parseInt(x, 10));
  if (!y || !mo || !d) return isoDate;
  const z = new TZDate(y, mo - 1, d, 12, 0, 0, REPORT_TIMEZONE);
  const loc = DAY_TITLE_LOCALE[lang];
  return format(z, "EEEE, d MMMM yyyy", { locale: loc });
}

export function getForecastWindows(reference = new Date()): ForecastWindows {
  const now = new TZDate(reference.getTime(), REPORT_TIMEZONE);
  const today = format(now, "yyyy-MM-dd");
  const weeklyDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(now, i), "yyyy-MM-dd"),
  );
  const weekEnd = weeklyDates[6]!;

  const monthlyEnd = format(addDays(now, 29), "yyyy-MM-dd");
  const monthlySegments: { start: string; end: string }[] = [];
  for (let i = 0; i < 30; i += 7) {
    const segStart = addDays(now, i);
    const segEnd = addDays(now, Math.min(i + 6, 29));
    monthlySegments.push({
      start: format(segStart, "yyyy-MM-dd"),
      end: format(segEnd, "yyyy-MM-dd"),
    });
  }

  return {
    timezone: REPORT_TIMEZONE,
    today,
    weekly: { start: today, end: weekEnd },
    weeklyDates,
    monthly: { start: today, end: monthlyEnd },
    monthlySegments,
  };
}
