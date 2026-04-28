"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckoutPayloadSchema,
  type AppLang,
  type ReportType,
} from "@/lib/reportSchema";
import {
  MIN_BIRTH_YEAR,
  currentBirthYearMax,
  daysInMonth,
  isoFromPartStrings,
} from "@/lib/birthDateParts";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { HomeFooter } from "@/components/HomeFooter";
import { NatalChartHeroIllustration } from "@/components/NatalChartHeroIllustration";
import {
  celticCrossPositions,
  type SpreadType,
  type TarotCard,
  type TarotTopic,
} from "@/lib/tarotDeck";
import { homeCopy, tarotCopy } from "@/lib/uiCopy";

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

const reportCardIds: ReportType[] = [
  "natal_basic",
  "personality",
  "weekly",
  "monthly",
];

const NATAL_SAMPLE_STORAGE_KEY = "cosmotips:natal_sample_v1";

const TOB_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const TOB_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
type HomeModule = "natal" | "tarot";
type TarotPanelState =
  | "idle"
  | "topic"
  | "email"
  | "shuffling"
  | "generating"
  | "result"
  | "no_tokens";

type TarotResult = {
  cards: TarotCard[];
  interpretation: string;
};

function tarotCardName(card: TarotCard, lang: AppLang): string {
  if (lang === "pl") return card.reversed ? `${card.namePl} ↓` : card.namePl;
  if (lang === "es") return card.reversed ? `${card.nameEs} ↓` : card.nameEs;
  return card.reversed ? `${card.name} ↓` : card.name;
}

function tarotTopicLabel(topic: TarotTopic, lang: AppLang): string {
  const copy = tarotCopy[lang];
  if (topic === "love") return copy.topicLove;
  if (topic === "finance_career") return copy.topicFinance;
  return copy.topicHealth;
}

function tarotPositions(spreadType: SpreadType, lang: AppLang): string[] {
  if (spreadType === "celtic_cross") return celticCrossPositions[lang];
  if (lang === "pl") return ["Przeszłość", "Teraźniejszość", "Przyszłość"];
  if (lang === "es") return ["Pasado", "Presente", "Futuro"];
  return ["Past", "Present", "Future"];
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<AppLang>("en");
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [tobHour, setTobHour] = useState("");
  const [tobMinute, setTobMinute] = useState("");
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [pob, setPob] = useState("");
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState<ReportType>("personality");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [freeBasicUsed, setFreeBasicUsed] = useState(false);
  const [activeModule, setActiveModule] = useState<HomeModule>("natal");
  const [tarotState, setTarotState] = useState<TarotPanelState>("idle");
  const [tarotBalance, setTarotBalance] = useState<number | null>(null);
  const [tarotEmail, setTarotEmail] = useState("");
  const [tarotSpread, setTarotSpread] = useState<SpreadType>("three_card");
  const [tarotTopic, setTarotTopic] = useState<TarotTopic>("love");
  const [tarotResult, setTarotResult] = useState<TarotResult | null>(null);
  const [tarotMessage, setTarotMessage] = useState<string | null>(null);
  const [tarotError, setTarotError] = useState<string | null>(null);
  const [tarotCheckoutLoading, setTarotCheckoutLoading] = useState(false);

  const copy = homeCopy[lang];
  const tarot = tarotCopy[lang];
  const activePitch =
    activeModule === "tarot" ? copy.tarotPitchParagraphs : copy.toolPitchParagraphs;

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (localStorage.getItem(NATAL_SAMPLE_STORAGE_KEY) === "1") {
        setFreeBasicUsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("lang");
    if (q === "en" || q === "pl" || q === "es") {
      setLang(q);
      return;
    }
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
  }, [searchParams]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const payment = searchParams.get("payment");
    const paymentEmail = searchParams.get("email") ?? "";

    if (tab === "tarot" || payment === "success" || payment === "cancelled") {
      setActiveModule("tarot");
    }
    if (paymentEmail) {
      setTarotEmail(paymentEmail);
      setEmail((current) => current || paymentEmail);
      void refreshTarotBalance(paymentEmail);
    }
    if (payment === "success") {
      setTarotMessage(tarotCopy[lang].paymentSuccess);
      setTarotState("idle");
    } else if (payment === "cancelled") {
      setTarotMessage(tarotCopy[lang].paymentCancelled);
      setTarotState("idle");
    }
  }, [lang, searchParams]);

  useEffect(() => {
    const knownEmail = tarotEmail || email;
    if (activeModule === "tarot" && knownEmail) {
      void refreshTarotBalance(knownEmail);
    }
  }, [activeModule, email, tarotEmail]);

  useEffect(() => {
    if (tarotState !== "shuffling") return;
    const timer = window.setTimeout(() => {
      setTarotState("generating");
      void generateTarotReading();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [tarotState]);

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
    if (birthTimeUnknown) return "12:00";
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
  }, [birthTimeUnknown, tobHour, tobMinute]);

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
          !loading &&
          !(reportType === "natal_basic" && freeBasicUsed),
      ),
    [dob, tob, pob, emailValid, reportType, termsAccepted, loading, freeBasicUsed],
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
    if (reportType === "natal_basic" && freeBasicUsed) {
      setError(copy.freeBasicAlreadyUsedError);
      return;
    }
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
          birthTimeUnknown,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!res.ok) throw new Error(data?.error ?? "Unable to start checkout.");
      if (!data?.url) throw new Error("Missing checkout URL.");

      if (reportType === "natal_basic") {
        try {
          localStorage.setItem(NATAL_SAMPLE_STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  async function refreshTarotBalance(rawEmail: string) {
    const cleanEmail = rawEmail.trim();
    if (!cleanEmail) {
      setTarotBalance(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/tarot/balance?email=${encodeURIComponent(cleanEmail)}`,
      );
      const data = (await res.json().catch(() => null)) as
        | { balance?: number }
        | null;
      if (res.ok && typeof data?.balance === "number") {
        setTarotBalance(data.balance);
      }
    } catch {
      // Balance is informational; generation still validates server-side.
    }
  }

  function startTarotReading(spreadType: SpreadType) {
    setTarotError(null);
    setTarotMessage(null);
    setTarotSpread(spreadType);
    if (spreadType === "celtic_cross") {
      setTarotState("topic");
      return;
    }
    setTarotState("email");
  }

  async function buyTarotTokens() {
    const cleanEmail = (tarotEmail || email).trim();
    if (!cleanEmail) {
      setTarotError(tarot.enterEmail);
      setTarotState("email");
      return;
    }
    setTarotCheckoutLoading(true);
    setTarotError(null);
    try {
      const res = await fetch("/api/tarot/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, lang }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? tarot.networkError);
      }
      window.location.assign(data.url);
    } catch (err) {
      setTarotError(err instanceof Error ? err.message : tarot.networkError);
      setTarotCheckoutLoading(false);
    }
  }

  function submitTarotEmail(e: React.FormEvent) {
    e.preventDefault();
    setTarotError(null);
    if (!tarotEmail.trim()) {
      setTarotError(tarot.enterEmail);
      return;
    }
    void refreshTarotBalance(tarotEmail);
    setTarotState("shuffling");
  }

  async function generateTarotReading() {
    setTarotError(null);
    try {
      const res = await fetch("/api/tarot/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: tarotEmail.trim(),
          spreadType: tarotSpread,
          topic: tarotTopic,
          lang,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { cards?: TarotCard[]; interpretation?: string; error?: string }
        | null;
      if (res.status === 402 || data?.error === "no_tokens") {
        setTarotState("no_tokens");
        void refreshTarotBalance(tarotEmail);
        return;
      }
      if (!res.ok || !data?.cards || !data.interpretation) {
        throw new Error(data?.error ?? tarot.networkError);
      }
      setTarotResult({
        cards: data.cards,
        interpretation: data.interpretation,
      });
      setTarotMessage(tarot.emailSent.replace("{email}", tarotEmail.trim()));
      setTarotState("result");
      void refreshTarotBalance(tarotEmail);
    } catch (err) {
      setTarotError(err instanceof Error ? err.message : tarot.networkError);
      setTarotState("email");
    }
  }

  function resetTarot() {
    setTarotState("idle");
    setTarotResult(null);
    setTarotError(null);
    setTarotMessage(null);
  }

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-5 sm:pb-14 sm:pt-8">
        <CosmotipsTopBar
          lang={lang}
          langLabel={copy.langLabel}
          logoAriaLabel={copy.navLogoHomeAria}
          onLangChange={setLang}
        />

        <header className="relative isolate mb-5 flex w-full min-h-0 items-center overflow-hidden py-2 sm:mb-6 sm:py-3">
          {/* Natal wheel as background — does not affect layout flow */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center sm:justify-end"
            aria-hidden
          >
            <div className="translate-x-[2%] scale-[1.58] opacity-[0.72] sm:translate-x-[6%] sm:scale-[1.95] sm:opacity-[0.68] md:scale-[2.15] md:opacity-[0.62]">
              <NatalChartHeroIllustration
                variant="background"
                className="h-[min(100vw,500px)] w-[min(100vw,500px)] sm:h-[min(82vw,600px)] sm:w-[min(82vw,600px)] md:h-[min(90vw,680px)] md:w-[min(90vw,680px)]"
              />
            </div>
          </div>
          {/* Lighter scrims so the wheel stays visible behind copy */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#070412]/78 from-0% via-[#070412]/42 via-45% to-transparent to-92% sm:bg-gradient-to-r sm:from-[#070412]/80 sm:from-0% sm:via-[#070412]/38 sm:via-42% sm:to-transparent sm:to-72%"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070412]/28 to-transparent sm:from-[#070412]/18" />

          <div className="relative z-10 w-full">
            <div className="w-full rounded-2xl border border-white/12 bg-[#070412]/42 px-4 pt-3 pb-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md sm:rounded-3xl sm:px-7 sm:pt-4 sm:pb-4 md:px-9 md:pt-5 md:pb-4">
              <div className="text-center">
                <h1 className="font-heading text-balance text-2xl font-medium leading-snug tracking-tight sm:text-3xl md:text-4xl md:leading-[1.15]">
                  <span className="cosmotips-headline block">{copy.heroTitle}</span>
                  <span className="cosmotips-headline-lead mt-1.5 block text-base font-normal leading-snug tracking-normal sm:mt-2 sm:text-lg md:text-xl md:leading-snug">
                    {copy.heroLead}
                  </span>
                </h1>
                <div className="mx-auto mt-4 flex w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:mt-5">
                  {(["natal", "tarot"] as const).map((module) => {
                    const selected = activeModule === module;
                    return (
                      <button
                        key={module}
                        type="button"
                        onClick={() => setActiveModule(module)}
                        className={[
                          "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition sm:px-4",
                          selected
                            ? "bg-violet-300 text-black shadow-lg shadow-violet-950/20"
                            : "text-white/68 hover:bg-white/[0.06] hover:text-white",
                        ].join(" ")}
                        aria-pressed={selected}
                      >
                        {copy.moduleTabs[module]}
                      </button>
                    );
                  })}
                </div>
                <div
                  className="cosmic-tool-pitch cosmic-tool-pitch--in-hero mx-auto mt-3 max-w-2xl sm:mt-3.5"
                  lang={lang}
                >
                  <div className="relative z-10 text-pretty text-sm leading-snug text-white/72 sm:mt-1 sm:leading-relaxed">
                    {activePitch.map((para, i) => (
                      <p key={i} className={i > 0 ? "mt-2 sm:mt-2" : undefined}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-0 max-w-6xl">
          {activeModule === "natal" ? (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-7">
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="rounded-r-xl border-l-2 border-violet-300/55 bg-violet-500/[0.12] py-3 pl-4 pr-3 text-left text-pretty text-sm leading-7 text-white/85 sm:py-3.5 sm:pl-5 sm:text-base">
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
                        required={!birthTimeUnknown}
                        aria-label={copy.tobHour}
                        value={tobHour}
                        onChange={(e) => setTobHour(e.target.value)}
                        disabled={birthTimeUnknown}
                        className="cosmic-birth-select w-full !min-w-[6.75rem] !pl-10 disabled:cursor-not-allowed disabled:opacity-45"
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
                      required={!birthTimeUnknown}
                      aria-label={copy.tobMinute}
                      value={tobMinute}
                      onChange={(e) => setTobMinute(e.target.value)}
                      disabled={birthTimeUnknown}
                      className="cosmic-birth-select w-[7.5rem] min-w-[7.5rem] shrink-0 disabled:cursor-not-allowed disabled:opacity-45 sm:w-[8.25rem] sm:min-w-[8.25rem]"
                    >
                      <option value="">{copy.tobMinute}</option>
                      {TOB_MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-white/65">
                    <input
                      type="checkbox"
                      checked={birthTimeUnknown}
                      onChange={(e) => setBirthTimeUnknown(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/30 accent-violet-300"
                    />
                    <span>{copy.birthTimeUnknown}</span>
                  </label>
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

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
                  {reportCardIds.map((id) => {
                    const selected = reportType === id;
                    const c = copy.reports[id];
                    const locked = id === "natal_basic" && freeBasicUsed;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          if (locked) return;
                          setReportType(id);
                        }}
                        className={[
                          "flex h-full min-h-0 flex-col rounded-xl border p-3.5 text-left transition sm:p-4",
                          locked
                            ? "cursor-not-allowed border-white/10 bg-black/20 opacity-45"
                            : selected
                              ? "border-violet-300/55 bg-violet-400/20 shadow-md shadow-violet-950/30 ring-1 ring-violet-200/25"
                              : id === "natal_basic"
                                ? "border-amber-300/35 bg-amber-950/20 hover:border-amber-200/45 hover:bg-amber-950/30"
                                : "border-violet-200/25 bg-black/25 hover:border-violet-300/40 hover:bg-violet-500/10",
                        ].join(" ")}
                      >
                        <div className="flex min-h-0 flex-1 gap-3">
                          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                            <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm font-semibold text-white sm:text-[0.9375rem]">
                              <span>{c.title}</span>
                              {c.freeBadge ? (
                                <span className="rounded-full border border-amber-300/45 bg-amber-400/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-100">
                                  {c.freeBadge}
                                </span>
                              ) : null}
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
                {freeBasicUsed ? (
                  <p className="mt-3 text-pretty text-xs leading-relaxed text-amber-100/75">
                    {copy.freeBasicUsedHint}
                  </p>
                ) : null}
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
          ) : (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-7">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="cosmotips-headline text-2xl font-semibold tracking-tight sm:text-3xl">
                      {tarot.pageTitle}
                    </h2>
                    <p className="mt-1 text-sm text-white/60">{tarot.pageSubtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1.5 text-sm font-semibold text-violet-100">
                      {tarot.tokensLeft.replace(
                        "{n}",
                        tarotBalance === null ? "—" : String(tarotBalance),
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => void buyTarotTokens()}
                      disabled={tarotCheckoutLoading}
                      className="rounded-full bg-gradient-to-b from-amber-200 to-amber-400 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-amber-950/20 transition disabled:opacity-60"
                    >
                      {tarotCheckoutLoading ? tarot.generating : tarot.buyTokens}
                    </button>
                  </div>
                </div>

                {tarotMessage ? (
                  <div className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                    {tarotMessage}
                  </div>
                ) : null}
                {tarotError ? (
                  <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {tarotError}
                  </div>
                ) : null}

                {tarotState === "idle" ? (
                  <>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {([
                        {
                          id: "three_card" as const,
                          title: tarot.threeCard,
                          desc: tarot.threeCardDesc,
                          glyph: "✦ ✦ ✦",
                        },
                        {
                          id: "celtic_cross" as const,
                          title: tarot.celticCross,
                          desc: tarot.celticCrossDesc,
                          glyph: "✦ ✧ ✦",
                        },
                      ]).map((spread) => (
                        <button
                          key={spread.id}
                          type="button"
                          onClick={() => startTarotReading(spread.id)}
                          className="group rounded-3xl border border-violet-200/20 bg-black/25 p-5 text-left transition hover:border-violet-300/45 hover:bg-violet-500/10"
                        >
                          <div className="text-2xl tracking-[0.35em] text-amber-200/80">
                            {spread.glyph}
                          </div>
                          <div className="mt-4 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {spread.title}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-white/68">
                                {spread.desc}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                              {tarot.oneToken}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-sm leading-6 text-white/75">{tarot.subTeaser}</p>
                      <a
                        href="mailto:hello@cosmotips.com?subject=Subskrypcja"
                        className="mt-3 inline-flex rounded-full border border-violet-200/25 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-white/10 sm:mt-0"
                      >
                        {tarot.notifyMe}
                      </a>
                    </div>
                  </>
                ) : null}

                {tarotState === "topic" ? (
                  <div className="mt-7 rounded-3xl border border-violet-200/20 bg-black/20 p-5">
                    <h3 className="text-lg font-semibold text-white">
                      {tarot.chooseTopic}
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {([
                        ["love", tarot.topicLove],
                        ["finance_career", tarot.topicFinance],
                        ["health", tarot.topicHealth],
                      ] as const).map(([topic, label]) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setTarotTopic(topic);
                            setTarotState("email");
                          }}
                          className="rounded-2xl border border-violet-200/20 bg-violet-400/10 px-4 py-4 text-sm font-semibold text-white transition hover:border-violet-300/45 hover:bg-violet-400/20"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={resetTarot}
                      className="mt-5 text-sm font-semibold text-violet-200 hover:text-white"
                    >
                      {tarot.back}
                    </button>
                  </div>
                ) : null}

                {tarotState === "email" ? (
                  <form
                    onSubmit={submitTarotEmail}
                    className="mt-7 rounded-3xl border border-violet-200/20 bg-black/20 p-5"
                  >
                    <p className="text-sm font-semibold text-violet-100">
                      {tarotSpread === "three_card" ? tarot.threeCard : tarot.celticCross}
                      {tarotSpread === "celtic_cross"
                        ? ` · ${tarotTopicLabel(tarotTopic, lang)}`
                        : ""}
                    </p>
                    <label className="mt-4 block text-xs font-medium text-white/70">
                      {tarot.enterEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={tarotEmail}
                      onChange={(e) => setTarotEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="cosmic-birth-field mt-1.5"
                    />
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={resetTarot}
                        className="text-sm font-semibold text-violet-200 hover:text-white"
                      >
                        {tarot.back}
                      </button>
                      <button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-violet-950/25"
                      >
                        {tarot.generateReading}
                      </button>
                    </div>
                  </form>
                ) : null}

                {tarotState === "shuffling" ? (
                  <div className="mt-8 flex flex-col items-center justify-center py-10 text-center">
                    <style jsx>{`
                      @keyframes tarotShuffle {
                        0% { transform: translateX(-34px) rotate(-8deg); }
                        50% { transform: translateX(34px) rotate(8deg); }
                        100% { transform: translateX(-34px) rotate(-8deg); }
                      }
                    `}</style>
                    <div className="relative h-28 w-44">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="absolute left-1/2 top-2 h-24 w-16 -translate-x-1/2 rounded-xl border border-amber-200/35 bg-gradient-to-br from-violet-300/40 to-violet-950 shadow-xl"
                          style={{
                            animation: "tarotShuffle 0.8s ease-in-out infinite",
                            animationDelay: `${i * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-violet-100">
                      {tarot.shuffling}
                    </p>
                  </div>
                ) : null}

                {tarotState === "generating" ? (
                  <div className="mt-8 flex items-center justify-center gap-3 py-10 text-white/75">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-violet-200" />
                    {tarot.generating}
                  </div>
                ) : null}

                {tarotState === "no_tokens" ? (
                  <div className="mt-7 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5 text-center">
                    <p className="text-sm leading-6 text-amber-50">{tarot.noTokens}</p>
                    <button
                      type="button"
                      onClick={() => void buyTarotTokens()}
                      className="mt-4 rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 px-5 py-3 text-sm font-bold text-black"
                    >
                      {tarot.buyTokens}
                    </button>
                  </div>
                ) : null}

                {tarotState === "result" && tarotResult ? (
                  <div className="mt-7 space-y-6">
                    {tarotSpread === "three_card" ? (
                      <div className="grid gap-4 sm:grid-cols-3">
                        {tarotResult.cards.map((card, index) => (
                          <div
                            key={`${card.id}-${index}`}
                            className="rounded-3xl border border-amber-200/30 bg-gradient-to-br from-violet-300/20 to-violet-950/70 p-5 text-center shadow-xl"
                            style={{
                              transform: "rotateY(180deg)",
                              transition: "transform 600ms ease",
                              transitionDelay: `${index * 300}ms`,
                            }}
                          >
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100/80">
                              {tarotPositions(tarotSpread, lang)[index]}
                            </p>
                            <p className="mt-4 text-lg font-semibold text-white">
                              {tarotCardName(card, lang)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {tarotResult.cards.map((card, index) => (
                          <div
                            key={`${card.id}-${index}`}
                            className="rounded-2xl border border-violet-200/20 bg-black/25 px-4 py-3"
                          >
                            <p className="text-xs text-amber-100/75">
                              {index + 1}. {tarotPositions(tarotSpread, lang)[index]}
                            </p>
                            <p className="mt-1 font-semibold text-white">
                              {tarotCardName(card, lang)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      {tarotResult.interpretation
                        .split(/\n{2,}/)
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean)
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className="mb-4 leading-8 text-white/84 last:mb-0"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                    {tarotMessage ? (
                      <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                        {tarotMessage}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={resetTarot}
                      className="rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-5 py-3 text-sm font-bold text-black"
                    >
                      {tarot.newReading}
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          )}
        </main>

        <HomeFooter copy={copy} lang={lang} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh">
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-5 sm:pt-8">
            <div className="mb-6 flex h-9 animate-pulse items-center justify-between rounded-lg bg-white/[0.06] sm:mb-8" />
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
