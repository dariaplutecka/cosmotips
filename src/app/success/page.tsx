import { Suspense } from "react";
import type { AppLang } from "@/lib/reportSchema";
import { successUi } from "@/lib/uiCopy";
import { SuccessClient } from "./SuccessClient";

function pickLangFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): AppLang {
  const raw = sp.lang;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "pl" || v === "es" || v === "en") return v;
  return "en";
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialLang = pickLangFromSearchParams(sp);

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-white/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur">
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              {successUi[initialLang].generating}
            </div>
          </div>
        </div>
      }
    >
      <SuccessClient initialLang={initialLang} />
    </Suspense>
  );
}
