"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CosmotipsTopBar } from "@/components/CosmotipsTopBar";
import type { AppLang } from "@/lib/reportSchema";
import { homeCopy } from "@/lib/uiCopy";

function CancelInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("lang");
  const lang: AppLang =
    raw === "pl" || raw === "es" ? raw : "en";
  const c = homeCopy[lang];

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <CosmotipsTopBar
          lang={lang}
          langLabel={c.langLabel}
          logoAriaLabel={c.navLogoHomeAria}
        />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-100">
            Checkout cancelled
          </div>
          <h1 className="cosmotips-headline mt-4 text-3xl font-semibold tracking-tight">
            No worries — you weren’t charged.
          </h1>
          <p className="mt-3 text-base leading-7 text-white/70">
            If you’d like to try again, head back to the form and generate your
            report when you’re ready.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/?lang=${lang}`}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelFallback() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<CancelFallback />}>
      <CancelInner />
    </Suspense>
  );
}
