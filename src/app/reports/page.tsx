"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

type SavedReport = {
  id: string;
  createdAt: string;
  email?: string;
  dob: string;
  tob: string;
  pob: string;
  reportType: "personality" | "weekly" | "monthly";
  report: string;
};

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

function reportTypeLabel(t: SavedReport["reportType"]) {
  if (t === "weekly") return "Weekly Forecast";
  if (t === "monthly") return "Monthly Forecast";
  return "Personality Description";
}

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

export default function ReportsPage() {
  const [reports] = useState<SavedReport[]>(() => {
    try {
      const key = "astroapka:reports";
      const items = JSON.parse(localStorage.getItem(key) ?? "[]") as SavedReport[];
      return items;
    } catch {
      return [];
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => reports[0]?.id ?? null);

  const selected = useMemo(
    () => reports.find((r) => r.id === selectedId) ?? null,
    [reports, selectedId],
  );
  const zodiac = useMemo(
    () => (selected ? getZodiac(selected.dob) : null),
    [selected],
  );

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Saved reports
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Stored locally in your browser (up to 25).
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition"
          >
            Generate new
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur">
            No saved reports yet. Generate one to see it here.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur">
              <div className="max-h-[70vh] overflow-auto p-2">
                {reports.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={[
                        "w-full rounded-2xl border p-4 text-left transition shadow-sm",
                        active
                          ? "border-violet-300/30 bg-violet-400/10"
                          : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/5",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold text-white">
                        {reportTypeLabel(r.reportType)}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-white/50">
                        {r.dob} · {r.tob}
                      </div>
                      <div className="mt-1 truncate text-xs text-white/50">
                        {r.pob}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-7">
              {selected ? (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {reportTypeLabel(selected.reportType)}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/60">
                    <span>
                      {selected.email ? (
                        <>
                          {selected.email}
                          <span className="text-white/35"> · </span>
                        </>
                      ) : null}
                      {selected.dob} · {selected.tob} · {selected.pob}
                    </span>
                    {zodiac ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">
                        <span className="text-base leading-none">{zodiac.symbol}</span>
                        {zodiac.name}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-6">
                    <article className="max-w-none space-y-4">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-5 text-3xl font-semibold tracking-tight text-white">
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
                        }}
                      >
                        {selected.report}
                      </ReactMarkdown>
                    </article>
                  </div>
                </>
              ) : (
                <div className="text-white/70">Select a report.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

