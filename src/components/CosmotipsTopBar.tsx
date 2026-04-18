"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLang } from "@/lib/reportSchema";

const LANGS: Array<{ code: AppLang; flag: string; abbr: string }> = [
  { code: "en", flag: "🇬🇧", abbr: "EN" },
  { code: "pl", flag: "🇵🇱", abbr: "PL" },
  { code: "es", flag: "🇪🇸", abbr: "ES" },
];

type Props = {
  lang: AppLang;
  langLabel: string;
  logoAriaLabel: string;
  /** Strona główna: zmiana języka bez przeładowania. Podstrony: pomijamy — linki `?lang=` */
  onLangChange?: (code: AppLang) => void;
};

export function CosmotipsTopBar({
  lang,
  langLabel,
  logoAriaLabel,
  onLangChange,
}: Props) {
  const pathname = usePathname() || "/";
  const homeHref = `/?lang=${lang}`;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:gap-4">
      <Link
        href={homeHref}
        className="inline-flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55"
        aria-label={logoAriaLabel}
      >
        <Image
          src="/logo-cosmotips.svg"
          alt=""
          width={530}
          height={429}
          className="h-16 w-auto sm:h-[4.5rem]"
          priority
        />
      </Link>

      <div
        className="flex shrink-0 gap-0.5 rounded-full border border-white/15 bg-black/35 p-1 shadow-lg shadow-black/20 backdrop-blur-sm"
        role="group"
        aria-label={langLabel}
      >
        {LANGS.map(({ code, flag, abbr }) => {
          const on = lang === code;
          const aria =
            code === "en" ? "English" : code === "pl" ? "Polski" : "Español";

          const pillClass = [
            "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wide transition",
            on
              ? "bg-violet-400/30 text-white ring-1 ring-violet-300/45"
              : "text-white/65 hover:bg-white/10 hover:text-white",
          ].join(" ");

          if (onLangChange) {
            return (
              <button
                key={code}
                type="button"
                onClick={() => onLangChange(code)}
                className={pillClass}
                aria-pressed={on}
                aria-label={aria}
              >
                <span className="text-[1.05rem] leading-none" aria-hidden>
                  {flag}
                </span>
                <span>{abbr}</span>
              </button>
            );
          }

          const href = `${pathname === "/" ? "/" : pathname}?lang=${code}`;
          return (
            <Link
              key={code}
              href={href}
              className={pillClass}
              aria-current={on ? "true" : undefined}
              aria-label={aria}
            >
              <span className="text-[1.05rem] leading-none" aria-hidden>
                {flag}
              </span>
              <span>{abbr}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
