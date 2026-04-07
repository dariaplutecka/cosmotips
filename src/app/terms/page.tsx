"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLang } from "@/lib/reportSchema";
import { termsPageCopy } from "@/lib/uiCopy";

function TermsContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = termsPageCopy[lang];

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
            {c.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70">{c.placeholderBody}</p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition hover:from-violet-200 hover:to-violet-500"
            >
              {c.backHome}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function TermsFallback() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsFallback />}>
      <TermsContent />
    </Suspense>
  );
}
