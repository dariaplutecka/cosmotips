import { Suspense } from "react";
import { headers } from "next/headers";
import type { AppLang } from "@/lib/reportSchema";
import { successUi } from "@/lib/uiCopy";
import { SuccessClient } from "./SuccessClient";

function pickLangFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): AppLang | null {
  const raw = sp.lang;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "pl" || v === "es" || v === "en") return v;
  return null;
}

function pickLangHeader(h: Headers): AppLang | null {
  const v = h.get("x-cosmotips-lang")?.trim().toLowerCase();
  if (v === "pl" || v === "es" || v === "en") return v;
  return null;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const hdrs = await headers();
  const initialLang =
    pickLangFromSearchParams(sp) ?? pickLangHeader(hdrs) ?? "en";

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
            <div className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:items-start">
              <span className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              <div className="min-w-0 space-y-2 text-white/70">
                <p className="font-semibold text-white/90">
                  {successUi[initialLang].generatingDurationHint}
                </p>
                <p className="text-sm leading-relaxed text-white/65">
                  {successUi[initialLang].generatingStayOnPage}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SuccessClient initialLang={initialLang} />
    </Suspense>
  );
}
