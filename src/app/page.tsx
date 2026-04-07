"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckoutPayloadSchema, type AppLang } from "@/lib/reportSchema";
import {
  MIN_BIRTH_YEAR,
  currentBirthYearMax,
  daysInMonth,
  isoFromPartStrings,
} from "@/lib/birthDateParts";
import { NatalChartHeroIllustration } from "@/components/NatalChartHeroIllustration";
import { homeCopy } from "@/lib/uiCopy";

type ReportType = "personality" | "weekly" | "monthly";

const placeSuggestions = [
  "Warsaw, Poland",
  "Kraków, Poland",
  "Gdańsk, Poland",
  "London, United Kingdom",
  "New York, USA",
  "Los Angeles, USA",
  "Paris, France",
  "Berlin, Germany",
  "Tokyo, Japan",
] as const;

const reportCardIds: ReportType[] = ["personality", "weekly", "monthly"];

const TOB_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const TOB_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

const LANGS: Array<{ code: AppLang; flag: string; abbr: string }> = [
  { code: "en", flag: "🇬🇧", abbr: "EN" },
  { code: "pl", flag: "🇵🇱", abbr: "PL" },
  { code: "es", flag: "🇪🇸", abbr: "ES" },
];

export default function HomePage() {
  const [lang, setLang] = useState<AppLang>("en");
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [tobHour, setTobHour] = useState("");
  const [tobMinute, setTobMinute] = useState("");
  const [pob, setPob] = useState("");
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState<ReportType>("personality");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const copy = homeCopy[lang];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/locale/detect");
        const data = (await res.json().catch(() => null)) as {
          lang?: string;
        } | null;
        if (
          cancelled ||
          !data?.lang ||
          !["en", "pl", "es"].includes(data.lang)
        ) {
          return;
        }
        setLang(data.lang as AppLang);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxBirthYear = useMemo(() => currentBirthYearMax(), []);

  const birthYearOptions = useMemo(
    () =>
      Array.from(
        { length: maxBirthYear - MIN_BIRTH_YEAR + 1 },
        (_, i) => maxBirthYear - i,
      ),
    [maxBirthYear],
  );

  const birthDayOptions = useMemo(() => {
    const m = parseInt(dobMonth, 10);
    if (!Number.isFinite(m) || m < 1 || m > 12) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    let y = parseInt(dobYear, 10);
    if (!Number.isFinite(y) || y < MIN_BIRTH_YEAR || y > maxBirthYear) {
      y = maxBirthYear;
    }
    const dim = daysInMonth(y, m);
    return Array.from({ length: dim }, (_, i) => i + 1);
  }, [dobYear, dobMonth, maxBirthYear]);

  const dob = useMemo(
    () => isoFromPartStrings(dobYear, dobMonth, dobDay, maxBirthYear),
    [dobYear, dobMonth, dobDay, maxBirthYear],
  );

  const tob = useMemo(() => {
    if (tobHour === "" || tobMinute === "") return "";
    const h = parseInt(tobHour, 10);
    const m = parseInt(tobMinute, 10);
    if (
      !Number.isFinite(h) ||
      !Number.isFinite(m) ||
      h < 0 ||
      h > 23 ||
      m < 0 ||
      m > 59
    ) {
      return "";
    }
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, [tobHour, tobMinute]);

  useEffect(() => {
    if (dobDay === "") return;
    const y = parseInt(dobYear, 10);
    const m = parseInt(dobMonth, 10);
    const d = parseInt(dobDay, 10);
    if (!Number.isFinite(d)) return;
    if (!Number.isFinite(y) || m < 1 || m > 12) return;
    const dim = daysInMonth(y, m);
    if (d > dim) setDobDay(String(dim));
  }, [dobYear, dobMonth, dobDay]);

  const pobRef = useRef<HTMLInputElement | null>(null);

  const emailValid = useMemo(
    () => CheckoutPayloadSchema.shape.email.safeParse(email.trim()).success,
    [email],
  );

  const canSubmit = useMemo(
    () =>
      Boolean(
        dob &&
          tob &&
          pob &&
          emailValid &&
          reportType &&
          termsAccepted &&
          !loading,
      ),
    [dob, tob, pob, emailValid, reportType, termsAccepted, loading],
  );

  const filteredPlaces = useMemo(() => {
    const q = pob.trim().toLowerCase();
    if (!q) return placeSuggestions.slice(0, 6);
    return placeSuggestions
      .filter((p) => p.toLowerCase().includes(q))
      .slice(0, 8);
  }, [pob]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          dob,
          tob,
          pob,
          reportType,
          lang,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!res.ok) throw new Error(data?.error ?? "Unable to start checkout.");
      if (!data?.url) throw new Error("Missing checkout URL.");

      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-5 sm:pb-14 sm:pt-8">
        <div className="mb-6 flex justify-end sm:mb-8">
          <div
            className="flex gap-0.5 rounded-full border border-white/15 bg-black/35 p-1 shadow-lg shadow-black/20 backdrop-blur-sm"
            role="group"
            aria-label={copy.langLabel}
          >
            {LANGS.map(({ code, flag, abbr }) => {
              const on = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={[
                    "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wide transition",
                    on
                      ? "bg-violet-400/30 text-white ring-1 ring-violet-300/45"
                      : "text-white/65 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                  aria-pressed={on}
                  aria-label={
                    code === "en"
                      ? "English"
                      : code === "pl"
                        ? "Polski"
                        : "Español"
                  }
                >
                  <span className="text-[1.05rem] leading-none" aria-hidden>
                    {flag}
                  </span>
                  <span>{abbr}</span>
                </button>
              );
            })}
          </div>
        </div>

        <header className="relative isolate mb-5 flex min-h-[min(39vw,240px)] items-center overflow-hidden py-[1.125rem] sm:mb-6 sm:min-h-[255px] sm:py-[1.875rem] md:min-h-[285px]">
          {/* Natal wheel as background — does not affect layout flow */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center sm:justify-end"
            aria-hidden
          >
            <div className="translate-x-[6%] scale-[1.35] opacity-[0.5] sm:translate-x-[12%] sm:scale-[1.55] sm:opacity-[0.48] md:scale-[1.7] md:opacity-[0.45]">
              <NatalChartHeroIllustration
                variant="background"
                className="h-[min(92vw,420px)] w-[min(92vw,420px)] sm:h-[min(72vw,520px)] sm:w-[min(72vw,520px)] md:h-[580px] md:w-[580px]"
              />
            </div>
          </div>
          {/* Readable scrim over chart */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#070412]/95 from-15% via-[#070412]/80 via-40% to-[#070412]/25 sm:bg-gradient-to-r sm:from-20% sm:via-45% sm:to-88%"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070412]/50 to-transparent sm:from-[#070412]/30" />

          <div className="relative z-10 w-full text-center lg:text-left">
            <h1 className="font-heading text-balance text-4xl font-medium leading-[1.15] tracking-tight text-white sm:text-5xl md:text-[3.125rem] md:leading-[1.12]">
              {copy.heroTitle}
              <span className="mt-2 block font-heading text-xl font-normal leading-snug tracking-normal text-white/75 sm:mt-2.5 sm:text-2xl md:text-[1.75rem] md:leading-snug">
                {copy.heroLead}
              </span>
            </h1>
            <div
              className="cosmic-tool-pitch cosmic-tool-pitch--in-hero mx-auto mt-3 max-w-2xl lg:mx-0"
              lang={lang}
            >
              <div className="relative z-10 text-pretty text-sm leading-snug text-white/72 sm:mt-1 sm:leading-relaxed">
                {copy.toolPitchParagraphs.map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-2 sm:mt-2" : undefined}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-0 max-w-6xl">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-7">
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="text-pretty text-sm leading-7 text-white/70 sm:text-base">
                {copy.heroSub}
              </p>
              <div className="mx-auto w-full max-w-2xl space-y-3">
                <div>
                  <span className="text-xs font-medium text-white/70">
                    {copy.dob}
                  </span>
                  <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5 sm:flex-nowrap">
                    <div className="relative min-w-0 flex-[2.1] sm:min-w-[8.75rem]">
                      <span className="pointer-events-none absolute top-1/2 left-3 z-[1] -translate-y-1/2 text-gray-600">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 2v3M16 2v3M3 9h18M6 5h12a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <select
                        name="bday-year"
                        required
                        autoComplete="bday-year"
                        aria-label={copy.dobYear}
                        value={dobYear}
                        onChange={(e) => setDobYear(e.target.value)}
                        className="cosmic-birth-select w-full min-w-0 !pl-10"
                      >
                        <option value="">{copy.dobYear}</option>
                        {birthYearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      name="bday-month"
                      required
                      autoComplete="bday-month"
                      aria-label={copy.dobMonth}
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="cosmic-birth-select w-[5.75rem] min-w-[5.75rem] shrink-0 sm:w-[6rem] sm:min-w-[6rem]"
                    >
                      <option value="">{copy.dobMonth}</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <select
                      name="bday-day"
                      required
                      autoComplete="bday-day"
                      aria-label={copy.dobDay}
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="cosmic-birth-select w-[5.5rem] min-w-[5.5rem] shrink-0 sm:w-[6rem] sm:min-w-[6rem]"
                    >
                      <option value="">{copy.dobDay}</option>
                      {birthDayOptions.map((d) => (
                        <option key={d} value={d}>
                          {String(d).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-white/70">
                    {copy.tob}
                  </span>
                  <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5 sm:flex-nowrap">
                    <div className="relative min-w-0 flex-[1.35] sm:min-w-[7.25rem]">
                      <span className="pointer-events-none absolute top-1/2 left-3 z-[1] -translate-y-1/2 text-gray-600">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 8v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <select
                        name="tob-hour"
                        required
                        aria-label={copy.tobHour}
                        value={tobHour}
                        onChange={(e) => setTobHour(e.target.value)}
                        className="cosmic-birth-select w-full !min-w-[6.75rem] !pl-10"
                      >
                        <option value="">{copy.tobHour}</option>
                        {TOB_HOUR_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      name="tob-minute"
                      required
                      aria-label={copy.tobMinute}
                      value={tobMinute}
                      onChange={(e) => setTobMinute(e.target.value)}
                      className="cosmic-birth-select w-[7.5rem] min-w-[7.5rem] shrink-0 sm:w-[8.25rem] sm:min-w-[8.25rem]"
                    >
                      <option value="">{copy.tobMinute}</option>
                      {TOB_MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-white/70">
                    {copy.pob}
                  </span>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 22s7-4.4 7-12a7 7 0 1 0-14 0c0 7.6 7 12 7 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={pob}
                      onChange={(e) => setPob(e.target.value)}
                      placeholder={copy.pobPlaceholder}
                      ref={pobRef}
                      onFocus={() => setPlaceOpen(true)}
                      onClick={() => setPlaceOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setPlaceOpen(false), 120);
                      }}
                      className="cosmic-birth-field"
                    />
                  </div>
                  {placeOpen ? (
                    <div className="relative">
                      <div className="cosmic-dropdown-panel absolute z-20 mt-2 w-full">
                        {filteredPlaces.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            {copy.placeNoMatch}
                          </div>
                        ) : (
                          <ul className="max-h-56 overflow-auto py-1">
                            {filteredPlaces.map((place) => (
                              <li key={place}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setPob(place);
                                    setPlaceOpen(false);
                                    pobRef.current?.focus();
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-violet-100/90"
                                >
                                  {place}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <span className="text-xs font-medium text-white/70">
                    {copy.email}
                  </span>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 6h16v12H4V6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m4 7 8 6 8-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="cosmic-birth-field"
                    />
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-violet-400/45 bg-gradient-to-b from-violet-500/[0.18] via-violet-950/30 to-violet-950/50 p-5 shadow-[0_0_0_1px_rgba(196,181,253,0.2),0_16px_48px_-12px_rgba(0,0,0,0.55)] ring-1 ring-violet-300/25 sm:mt-10 sm:p-6">
                <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  {copy.reportSectionTitle}
                </h2>

                <div className="mt-4 grid gap-2.5 md:grid-cols-3 md:items-stretch">
                  {reportCardIds.map((id) => {
                    const selected = reportType === id;
                    const c = copy.reports[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setReportType(id)}
                        className={[
                          "flex h-full min-h-0 flex-col rounded-xl border p-3.5 text-left transition sm:p-4",
                          selected
                            ? "border-violet-300/55 bg-violet-400/20 shadow-md shadow-violet-950/30 ring-1 ring-violet-200/25"
                            : "border-violet-200/25 bg-black/25 hover:border-violet-300/40 hover:bg-violet-500/10",
                        ].join(" ")}
                      >
                        <div className="flex min-h-0 flex-1 gap-3">
                          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                            <div className="shrink-0 text-sm font-semibold text-white sm:text-[0.9375rem]">
                              {c.title}
                            </div>
                            <p className="mt-1 min-h-0 flex-1 text-sm leading-6 text-white/75">
                              {c.desc}
                            </p>
                          </div>
                          <div
                            className={[
                              "mt-0.5 h-5 w-5 shrink-0 self-start rounded-full border",
                              selected
                                ? "border-violet-200/60 bg-violet-300"
                                : "border-violet-300/35 bg-transparent",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mx-auto mt-6 flex w-full max-w-4xl items-start gap-3 sm:mt-7">
                <input
                  id="terms-accept"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-violet-500 rounded border-violet-300/45 bg-black/40 focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-0 focus:outline-none"
                />
                <label
                  htmlFor="terms-accept"
                  className="text-pretty text-sm leading-6 text-white/72"
                >
                  {copy.termsAcceptBefore}
                  <Link
                    href={`/terms?lang=${lang}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-300 underline decoration-violet-400/45 underline-offset-2 hover:text-violet-200"
                  >
                    {copy.termsAcceptLink}
                  </Link>
                  {copy.termsAcceptAfter}
                </label>
              </div>

              <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs text-white/55 sm:max-w-[min(100%,28rem)] sm:text-left">
                  {copy.priceLine}
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full max-w-xs items-center justify-center gap-2 self-end rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:max-w-none sm:shrink-0 sm:self-auto"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      {copy.submitting}
                    </>
                  ) : (
                    <>{copy.submit}</>
                  )}
                </button>
              </div>
            </form>

            {error ? (
              <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}
          </section>
        </main>

        <footer className="mx-auto mt-10 max-w-4xl text-center text-xs text-white/45">
          {copy.footer}
        </footer>
      </div>
    </div>
  );
}
