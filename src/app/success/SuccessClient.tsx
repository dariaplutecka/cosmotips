"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import { NatalChartWheel } from "@/components/NatalChartWheel";
import type { AppLang } from "@/lib/reportSchema";
import type { NatalChartPayload } from "@/lib/natalChart";
import { homeCopy, successUi } from "@/lib/uiCopy";

type Meta = {
  email: string;
  dob: string;
  tob: string;
  pob: string;
  reportType: "natal_basic" | "personality" | "weekly" | "monthly";
  lang: AppLang;
};

type EmailPdfStatus = "sent" | "skipped" | "failed";

type EmailPdfFromApi = {
  status: EmailPdfStatus;
  skipReason?: "no_api_key" | "no_from";
};

type GenerateResponse =
  | {
      report: string;
      meta: Meta;
      emailPdf?: EmailPdfFromApi;
    }
  | { error: string };

const zodiacSigns = [
  { name: "Capricorn", symbol: "♑", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18] },
  { name: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20] },
  { name: "Aries", symbol: "♈", start: [3, 21], end: [4, 19] },
  { name: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20] },
  { name: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20] },
  { name: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22] },
  { name: "Leo", symbol: "♌", start: [7, 23], end: [8, 22] },
  { name: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22] },
  { name: "Libra", symbol: "♎", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21] },
] as const;

function getZodiac(dob: string) {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return null;
  for (const z of zodiacSigns) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm <= em) {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)) {
        return z;
      }
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || m > sm || m < em) {
        return z;
      }
    }
  }
  return null;
}

function parseLangParam(raw: string | null): AppLang | null {
  if (raw === "pl" || raw === "es" || raw === "en") return raw;
  return null;
}

export function SuccessClient({ initialLang }: { initialLang: AppLang }) {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";
  const devMode = sp.get("dev") === "1" || sessionId.startsWith("dev_");
  const freeNatalMode = sp.get("fnb") === "1" && sessionId.startsWith("fnb_");
  const devEmail = sp.get("email") ?? "";
  const devDob = sp.get("dob") ?? "";
  const devTob = sp.get("tob") ?? "";
  const devPob = sp.get("pob") ?? "";
  const devReportType = sp.get("reportType") ?? "";
  const devLangRaw = sp.get("lang") ?? "en";
  const devLang: AppLang = ["en", "pl", "es"].includes(devLangRaw)
    ? (devLangRaw as AppLang)
    : "en";

  const queryLang = parseLangParam(sp.get("lang"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [chart, setChart] = useState<NatalChartPayload | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [emailPdfInfo, setEmailPdfInfo] = useState<EmailPdfFromApi | null>(
    null,
  );

  const uiLang: AppLang =
    meta?.lang ??
    queryLang ??
    (devMode || freeNatalMode ? devLang : initialLang);
  const su = successUi[uiLang];

  const title = useMemo(() => {
    if (!meta) return successUi[uiLang].pendingTitle;
    return successUi[uiLang].reportTitle[meta.reportType];
  }, [meta, uiLang]);
  const zodiac = useMemo(() => (meta ? getZodiac(meta.dob) : null), [meta]);

  const fetchReport = useCallback(async () => {
    if (!sessionId) {
      setError("Missing session id from Stripe.");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    setEmailPdfInfo(null);
    try {
      const params = new URLSearchParams({ session_id: sessionId });
      if (devMode) {
        params.set("dev", "1");
        params.set("email", devEmail);
        params.set("dob", devDob);
        params.set("tob", devTob);
        params.set("pob", devPob);
        params.set("reportType", devReportType);
        params.set("lang", devLang);
      } else if (freeNatalMode) {
        params.set("fnb", "1");
        params.set("email", devEmail);
        params.set("dob", devDob);
        params.set("tob", devTob);
        params.set("pob", devPob);
        params.set("reportType", devReportType);
        params.set("lang", devLang);
      }

      const res = await fetch(`/api/report/generate?${params.toString()}`, {
        method: "GET",
      });
      const data = (await res.json().catch(() => null)) as GenerateResponse | null;
      const serverError =
        data && "error" in data && typeof data.error === "string"
          ? data.error
          : null;
      if (!res.ok) throw new Error(serverError ?? "Failed to generate.");
      if (!data || "error" in data) throw new Error(serverError ?? "Failed.");

      setReport(data.report);
      setMeta({
        ...data.meta,
        lang: data.meta.lang ?? "en",
      });
      setEmailPdfInfo(data.emailPdf ?? { status: "skipped" });
      setLoading(false);

      try {
        const key = "astroapka:reports";
        const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
        const entry = {
          id: `${Date.now()}-${sessionId}`,
          createdAt: new Date().toISOString(),
          sessionId,
          ...data.meta,
          lang: data.meta.lang ?? "en",
          report: data.report,
        };
        localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 25)));
      } catch {
        // ignore localStorage issues
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }, [
    sessionId,
    devMode,
    freeNatalMode,
    devEmail,
    devDob,
    devTob,
    devPob,
    devReportType,
    devLang,
  ]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    if (!meta) {
      setChart(null);
      setChartError(null);
      return;
    }
    let cancelled = false;
    setChartLoading(true);
    setChartError(null);
    void (async () => {
      try {
        const res = await fetch("/api/natal-chart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            dob: meta.dob,
            tob: meta.tob,
            pob: meta.pob,
          }),
        });
        const data = (await res.json().catch(() => null)) as
          | { chart?: NatalChartPayload; error?: string }
          | null;
        if (cancelled) return;
        if (!res.ok || !data?.chart) {
          setChartError(
            data?.error ?? successUi[meta.lang].chartError,
          );
          setChart(null);
        } else {
          setChart(data.chart);
        }
      } catch {
        if (!cancelled) {
          setChartError(successUi[meta.lang].chartError);
          setChart(null);
        }
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meta]);

  const hc = homeCopy[uiLang];

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <CosmotipsTopBar
          lang={uiLang}
          langLabel={hc.langLabel}
          logoAriaLabel={hc.navLogoHomeAria}
        />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="cosmotips-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {meta ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span>
                  {meta.email}
                  <span className="text-white/35"> · </span>
                  {meta.dob} · {meta.tob} · {meta.pob}
                </span>
                {zodiac ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">
                    <span className="text-base leading-none">{zodiac.symbol}</span>
                    {zodiac.name}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {!report ? (
              <button
                onClick={() => void fetchReport()}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                disabled={loading}
              >
                {su.regenerate}
              </button>
            ) : null}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition disabled:opacity-60"
              disabled={!report || loading}
            >
              {su.print}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-7">
          {loading ? (
            <div className="flex items-center gap-3 text-white/70">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              {su.generating}
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => void fetchReport()}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition"
                >
                  {su.tryAgain}
                </button>
                <Link
                  href={`/?lang=${uiLang}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {su.backHome}
                </Link>
              </div>
            </div>
          ) : report ? (
            <article className="max-w-none space-y-4">
              {emailPdfInfo ? (
                <div
                  className={[
                    "rounded-xl border px-4 py-3 text-sm",
                    emailPdfInfo.status === "sent"
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50"
                      : emailPdfInfo.status === "failed"
                        ? "border-amber-400/25 bg-amber-400/10 text-amber-50"
                        : "border-white/10 bg-white/[0.04] text-white/65",
                  ].join(" ")}
                >
                  <p>
                    {emailPdfInfo.status === "sent"
                      ? su.pdfEmailSent
                      : emailPdfInfo.status === "failed"
                        ? su.pdfEmailFailed
                        : su.pdfEmailSkipped}
                  </p>
                  {emailPdfInfo.status === "skipped" &&
                  emailPdfInfo.skipReason === "no_api_key" ? (
                    <p className="mt-2 text-xs text-white/50">
                      {su.pdfEmailSkipHintNoApiKey}
                    </p>
                  ) : null}
                  {emailPdfInfo.status === "skipped" &&
                  emailPdfInfo.skipReason === "no_from" ? (
                    <p className="mt-2 text-xs text-white/50">
                      {su.pdfEmailSkipHintNoFrom}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {chartLoading ? (
                <div className="flex justify-center py-6 text-sm text-white/55">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-violet-300" />
                  {su.chartLoading}
                </div>
              ) : chart ? (
                <div className="border-b border-white/10 pb-8">
                  <NatalChartWheel chart={chart} lang={uiLang} />
                </div>
              ) : chartError ? (
                <p className="pb-4 text-center text-sm text-amber-200/80">
                  {chartError}
                </p>
              ) : null}
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="cosmotips-headline mb-5 text-3xl font-semibold tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-7 mb-3 text-2xl font-semibold text-violet-100">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-2 text-xl font-semibold text-violet-100">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-8 text-white/85">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 list-disc space-y-2 pl-6 text-white/85">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 list-decimal space-y-2 pl-6 text-white/85">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  hr: () => <hr className="my-6 border-white/10" />,
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-2 border-violet-300/40 pl-4 text-white/75">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {report}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="text-white/70">No report found.</div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/?lang=${uiLang}`}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {su.another}
          </Link>
          <Link
            href={`/reports?lang=${uiLang}`}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {su.saved}
          </Link>
        </div>
      </div>
    </div>
  );
}
